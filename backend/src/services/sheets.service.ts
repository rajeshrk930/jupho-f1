import { google } from 'googleapis';
import crypto from 'crypto';
import { prisma } from '../lib/prisma';

export interface LeadData {
  leadId: string;
  name?: string;
  email?: string;
  phone?: string;
  submittedAt: Date;
  [key: string]: any;
}

export class GoogleSheetsService {
  /**
   * Encrypt access token for secure storage (same method as Facebook tokens)
   */
  static encryptToken(token: string): string {
    if (!process.env.ENCRYPTION_KEY) {
      throw new Error('ENCRYPTION_KEY environment variable is required for secure token storage');
    }
    
    const algorithm = 'aes-256-cbc';
    const key = Buffer.from(process.env.ENCRYPTION_KEY, 'utf8').slice(0, 32);
    const iv = crypto.randomBytes(16);
    
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(token, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return iv.toString('hex') + ':' + encrypted;
  }
  
  /**
   * Decrypt access token from storage
   */
  static decryptToken(encrypted: string): string {
    if (!process.env.ENCRYPTION_KEY) {
      throw new Error('ENCRYPTION_KEY environment variable is required for token decryption');
    }
    
    const algorithm = 'aes-256-cbc';
    const key = Buffer.from(process.env.ENCRYPTION_KEY, 'utf8').slice(0, 32);
    
    const parts = encrypted.split(':');
    if (parts.length !== 2) {
      throw new Error('Invalid encrypted token format');
    }
    
    const iv = Buffer.from(parts[0], 'hex');
    const encryptedData = parts[1];
    
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  /**
   * Generate Google OAuth URL for user authentication
   */
  static getAuthUrl(userId: string, state?: string): string {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      throw new Error('Google OAuth credentials not configured');
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.BACKEND_URL}/api/sheets/callback`
    );

    return oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/spreadsheets'],
      state: state || userId, // CSRF protection
      prompt: 'consent', // Force consent to get refresh token
    });
  }

  /**
   * Exchange authorization code for tokens
   */
  static async getTokensFromCode(code: string): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresAt: Date;
  }> {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      throw new Error('Google OAuth credentials not configured');
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.BACKEND_URL}/api/sheets/callback`
    );

    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.access_token || !tokens.refresh_token) {
      throw new Error('Failed to obtain tokens from Google');
    }

    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + (tokens.expiry_date || 3600));

    return {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt,
    };
  }

  /**
   * Refresh access token using refresh token
   */
  static async refreshAccessToken(refreshToken: string): Promise<{
    accessToken: string;
    expiresAt: Date;
  }> {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      throw new Error('Google OAuth credentials not configured');
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.BACKEND_URL}/api/sheets/callback`
    );

    oauth2Client.setCredentials({
      refresh_token: refreshToken,
    });

    const { credentials } = await oauth2Client.refreshAccessToken();

    if (!credentials.access_token) {
      throw new Error('Failed to refresh access token');
    }

    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + (credentials.expiry_date || 3600));

    return {
      accessToken: credentials.access_token,
      expiresAt,
    };
  }

  /**
   * Get authenticated Google Sheets API client
   */
  static async getSheetsClient(userId: string) {
    const connection = await prisma.googleSheetsConnection.findUnique({
      where: { userId },
    });

    if (!connection) {
      throw new Error('Google Sheets not connected');
    }

    // Check if token expired
    if (connection.tokenExpiresAt < new Date()) {
      // Refresh token
      const decryptedRefreshToken = this.decryptToken(connection.refreshToken);
      const { accessToken, expiresAt } = await this.refreshAccessToken(decryptedRefreshToken);

      // Update connection with new token
      await prisma.googleSheetsConnection.update({
        where: { userId },
        data: {
          accessToken: this.encryptToken(accessToken),
          tokenExpiresAt: expiresAt,
        },
      });

      const oauth2Client = new google.auth.OAuth2();
      oauth2Client.setCredentials({ access_token: accessToken });

      return google.sheets({ version: 'v4', auth: oauth2Client });
    }

    const accessToken = this.decryptToken(connection.accessToken);
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });

    return google.sheets({ version: 'v4', auth: oauth2Client });
  }

  /**
   * Create a new spreadsheet for leads
   */
  static async createSpreadsheet(userId: string, title: string) {
    const sheets = await this.getSheetsClient(userId);

    const spreadsheet = await sheets.spreadsheets.create({
      requestBody: {
        properties: {
          title,
        },
        sheets: [
          {
            properties: {
              title: 'Leads',
            },
          },
        ],
      },
    });

    const spreadsheetId = spreadsheet.data.spreadsheetId!;

    // Add header row
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Leads!A1:F1',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [['Lead ID', 'Submitted At', 'Full Name', 'Email', 'Phone', 'Additional Data']],
      },
    });

    // Format header row (bold)
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            repeatCell: {
              range: {
                sheetId: 0,
                startRowIndex: 0,
                endRowIndex: 1,
              },
              cell: {
                userEnteredFormat: {
                  textFormat: {
                    bold: true,
                  },
                },
              },
              fields: 'userEnteredFormat.textFormat.bold',
            },
          },
        ],
      },
    });

    return {
      spreadsheetId,
      spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}`,
      title,
    };
  }

  /**
   * Append leads to Google Sheet (batch operation)
   */
  static async appendLeadsToSheet(userId: string, leads: LeadData[]): Promise<number> {
    if (leads.length === 0) {
      return 0;
    }

    const connection = await prisma.googleSheetsConnection.findUnique({
      where: { userId },
    });

    if (!connection || !connection.spreadsheetId) {
      throw new Error('No spreadsheet configured');
    }

    const sheets = await this.getSheetsClient(userId);

    // Transform leads to rows
    const rows = leads.map((lead) => {
      const additionalData: any = { ...lead };
      delete additionalData.leadId;
      delete additionalData.name;
      delete additionalData.email;
      delete additionalData.phone;
      delete additionalData.submittedAt;

      return [
        lead.leadId,
        lead.submittedAt.toISOString(),
        lead.name || '',
        lead.email || '',
        lead.phone || '',
        Object.keys(additionalData).length > 0 ? JSON.stringify(additionalData) : '',
      ];
    });

    // Append rows to sheet
    await sheets.spreadsheets.values.append({
      spreadsheetId: connection.spreadsheetId,
      range: `${connection.sheetName}!A:F`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: rows,
      },
    });

    // Update sync timestamp
    await prisma.googleSheetsConnection.update({
      where: { userId },
      data: { lastSyncAt: new Date() },
    });

    // Mark leads as synced
    const leadIds = leads.map((l) => l.leadId);
    await prisma.leadSubmission.updateMany({
      where: {
        leadId: { in: leadIds },
        userId,
      },
      data: {
        syncedToSheets: true,
        sheetsSyncedAt: new Date(),
      },
    });

    return leads.length;
  }

  /**
   * Sync unsynced leads for a user
   */
  static async syncUnsyncedLeads(userId: string): Promise<number> {
    // Check if sync is enabled
    const connection = await prisma.googleSheetsConnection.findUnique({
      where: { userId },
    });

    if (!connection || !connection.syncEnabled || !connection.spreadsheetId) {
      return 0;
    }

    // Get unsynced leads
    const unsyncedLeads = await prisma.leadSubmission.findMany({
      where: {
        userId,
        syncedToSheets: false,
      },
      orderBy: {
        submittedAt: 'asc',
      },
      take: 500, // Batch limit
    });

    if (unsyncedLeads.length === 0) {
      return 0;
    }

    // Transform to LeadData format
    const leadsData: LeadData[] = unsyncedLeads.map((lead: any) => {
      const data = JSON.parse(lead.data);
      return {
        leadId: lead.leadId,
        submittedAt: lead.submittedAt,
        ...data,
      };
    });

    // Sync to sheets
    return await this.appendLeadsToSheet(userId, leadsData);
  }

  /**
   * Get list of user's spreadsheets
   */
  static async listSpreadsheets(userId: string, maxResults: number = 10) {
    const sheets = await this.getSheetsClient(userId);
    const drive = google.drive({ version: 'v3', auth: sheets.context._options.auth as any });

    const response = await drive.files.list({
      q: "mimeType='application/vnd.google-apps.spreadsheet'",
      pageSize: maxResults,
      fields: 'files(id, name, createdTime)',
      orderBy: 'modifiedTime desc',
    });

    return response.data.files || [];
  }

  /**
   * Get spreadsheet metadata
   */
  static async getSpreadsheetInfo(userId: string, spreadsheetId: string) {
    const sheets = await this.getSheetsClient(userId);

    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId,
    });

    return {
      id: spreadsheet.data.spreadsheetId,
      title: spreadsheet.data.properties?.title,
      url: spreadsheet.data.spreadsheetUrl,
      sheets: spreadsheet.data.sheets?.map((sheet) => ({
        id: sheet.properties?.sheetId,
        title: sheet.properties?.title,
      })),
    };
  }
}
