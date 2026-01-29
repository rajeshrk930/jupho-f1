import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { clerkAuth } from '../middleware/clerkAuth';
import { AuthRequest } from '../middleware/auth';
import { GoogleSheetsService } from '../services/sheets.service';
import { prisma } from '../lib/prisma';
import crypto from 'crypto';

const router = Router();

/**
 * GET /api/sheets/auth-url
 * Generate Google OAuth URL for user to connect their account
 */
router.get('/auth-url', ...clerkAuth, async (req: AuthRequest, res: Response) => {
  try {
    console.log('🟢 [Google Sheets] Generating OAuth URL for user:', req.user!.email);
    
    // Generate CSRF token for OAuth security
    const state = crypto.randomBytes(32).toString('hex');
    
    // Store state temporarily (we'll validate on callback)
    // For now, we'll use userId as state and validate on callback
    const authUrl = GoogleSheetsService.getAuthUrl(req.user!.id, state);
    
    res.json({
      authUrl,
      state,
    });
  } catch (error: any) {
    console.error('❌ [Google Sheets] Error generating auth URL:', error);
    res.status(500).json({ 
      error: 'Failed to generate Google authorization URL',
      details: error.message 
    });
  }
});

/**
 * GET /api/sheets/callback
 * OAuth callback handler - exchanges code for tokens
 */
router.get('/callback', async (req, res: Response) => {
  try {
    const { code, state, error } = req.query;
    
    console.log('🟢 [Google Sheets] OAuth callback received');
    
    if (error) {
      console.error('❌ [Google Sheets] OAuth error:', error);
      return res.redirect(`${process.env.FRONTEND_URL}/settings/integrations?error=oauth_denied`);
    }
    
    if (!code || typeof code !== 'string') {
      console.error('❌ [Google Sheets] Missing authorization code');
      return res.redirect(`${process.env.FRONTEND_URL}/settings/integrations?error=missing_code`);
    }
    
    // State contains userId (for simplicity)
    // In production, you might want to store state in Redis/DB for validation
    const userId = state as string;
    
    if (!userId) {
      console.error('❌ [Google Sheets] Invalid state parameter');
      return res.redirect(`${process.env.FRONTEND_URL}/settings/integrations?error=invalid_state`);
    }
    
    // Exchange code for tokens
    console.log('🟢 [Google Sheets] Exchanging code for tokens');
    const { accessToken, refreshToken, expiresAt } = await GoogleSheetsService.getTokensFromCode(code);
    
    // Encrypt tokens
    const encryptedAccessToken = GoogleSheetsService.encryptToken(accessToken);
    const encryptedRefreshToken = GoogleSheetsService.encryptToken(refreshToken);
    
    // Save connection to database
    await prisma.googleSheetsConnection.upsert({
      where: { userId },
      create: {
        userId,
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
        tokenExpiresAt: expiresAt,
        syncEnabled: true,
      },
      update: {
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
        tokenExpiresAt: expiresAt,
        syncEnabled: true,
      },
    });
    
    console.log('✅ [Google Sheets] Connection saved successfully');
    
    // Redirect to frontend success page
    res.redirect(`${process.env.FRONTEND_URL}/settings/integrations?success=sheets_connected`);
  } catch (error: any) {
    console.error('❌ [Google Sheets] OAuth callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/settings/integrations?error=connection_failed`);
  }
});

/**
 * GET /api/sheets/status
 * Get connection status for current user
 */
router.get('/status', ...clerkAuth, async (req: AuthRequest, res: Response) => {
  try {
    const connection = await prisma.googleSheetsConnection.findUnique({
      where: { userId: req.user!.id },
      select: {
        spreadsheetId: true,
        spreadsheetName: true,
        sheetName: true,
        syncEnabled: true,
        lastSyncAt: true,
        tokenExpiresAt: true,
        createdAt: true,
      },
    });
    
    if (!connection) {
      return res.json({ connected: false });
    }
    
    // Count synced leads
    const syncedCount = await prisma.leadSubmission.count({
      where: {
        userId: req.user!.id,
        syncedToSheets: true,
      },
    });
    
    // Count unsynced leads
    const unsyncedCount = await prisma.leadSubmission.count({
      where: {
        userId: req.user!.id,
        syncedToSheets: false,
      },
    });
    
    res.json({
      connected: true,
      spreadsheetId: connection.spreadsheetId,
      spreadsheetName: connection.spreadsheetName,
      spreadsheetUrl: connection.spreadsheetId 
        ? `https://docs.google.com/spreadsheets/d/${connection.spreadsheetId}`
        : null,
      sheetName: connection.sheetName,
      syncEnabled: connection.syncEnabled,
      lastSyncAt: connection.lastSyncAt,
      tokenExpiresAt: connection.tokenExpiresAt,
      connectedAt: connection.createdAt,
      syncedLeads: syncedCount,
      unsyncedLeads: unsyncedCount,
    });
  } catch (error: any) {
    console.error('❌ [Google Sheets] Error fetching status:', error);
    res.status(500).json({ 
      error: 'Failed to fetch connection status',
      details: error.message 
    });
  }
});

/**
 * POST /api/sheets/create-spreadsheet
 * Create a new spreadsheet for leads
 */
router.post(
  '/create-spreadsheet',
  ...clerkAuth,
  body('title').notEmpty().withMessage('Spreadsheet title is required'),
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      const { title } = req.body;
      
      console.log('🟢 [Google Sheets] Creating new spreadsheet:', title);
      
      const result = await GoogleSheetsService.createSpreadsheet(req.user!.id, title);
      
      // Update connection with spreadsheet info
      await prisma.googleSheetsConnection.update({
        where: { userId: req.user!.id },
        data: {
          spreadsheetId: result.spreadsheetId,
          spreadsheetName: title,
        },
      });
      
      console.log('✅ [Google Sheets] Spreadsheet created:', result.spreadsheetId);
      
      res.json(result);
    } catch (error: any) {
      console.error('❌ [Google Sheets] Error creating spreadsheet:', error);
      
      if (error.message === 'Google Sheets not connected') {
        return res.status(400).json({ error: 'Please connect Google Sheets first' });
      }
      
      res.status(500).json({ 
        error: 'Failed to create spreadsheet',
        details: error.message 
      });
    }
  }
);

/**
 * POST /api/sheets/set-spreadsheet
 * Set existing spreadsheet for sync
 */
router.post(
  '/set-spreadsheet',
  ...clerkAuth,
  body('spreadsheetId').notEmpty().withMessage('Spreadsheet ID is required'),
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      const { spreadsheetId, sheetName } = req.body;
      
      console.log('🟢 [Google Sheets] Setting spreadsheet:', spreadsheetId);
      
      // Verify spreadsheet exists and user has access
      const info = await GoogleSheetsService.getSpreadsheetInfo(req.user!.id, spreadsheetId);
      
      // Update connection
      await prisma.googleSheetsConnection.update({
        where: { userId: req.user!.id },
        data: {
          spreadsheetId,
          spreadsheetName: info.title || 'Untitled',
          sheetName: sheetName || 'Leads',
        },
      });
      
      console.log('✅ [Google Sheets] Spreadsheet configured');
      
      res.json({
        spreadsheetId: info.id,
        spreadsheetName: info.title,
        spreadsheetUrl: info.url,
      });
    } catch (error: any) {
      console.error('❌ [Google Sheets] Error setting spreadsheet:', error);
      
      if (error.message === 'Google Sheets not connected') {
        return res.status(400).json({ error: 'Please connect Google Sheets first' });
      }
      
      res.status(500).json({ 
        error: 'Failed to set spreadsheet',
        details: error.message 
      });
    }
  }
);

/**
 * POST /api/sheets/sync
 * Manually trigger sync of unsynced leads
 */
router.post('/sync', ...clerkAuth, async (req: AuthRequest, res: Response) => {
  try {
    console.log('🟢 [Google Sheets] Manual sync triggered by:', req.user!.email);
    
    const syncedCount = await GoogleSheetsService.syncUnsyncedLeads(req.user!.id);
    
    console.log(`✅ [Google Sheets] Synced ${syncedCount} leads`);
    
    res.json({
      success: true,
      syncedCount,
      message: syncedCount > 0 
        ? `Successfully synced ${syncedCount} leads to Google Sheets`
        : 'No new leads to sync',
    });
  } catch (error: any) {
    console.error('❌ [Google Sheets] Sync error:', error);
    
    if (error.message === 'Google Sheets not connected') {
      return res.status(400).json({ error: 'Please connect Google Sheets first' });
    }
    
    if (error.message === 'No spreadsheet configured') {
      return res.status(400).json({ error: 'Please select or create a spreadsheet first' });
    }
    
    res.status(500).json({ 
      error: 'Failed to sync leads',
      details: error.message 
    });
  }
});

/**
 * PATCH /api/sheets/toggle-sync
 * Enable or disable automatic sync
 */
router.patch(
  '/toggle-sync',
  ...clerkAuth,
  body('enabled').isBoolean().withMessage('enabled must be a boolean'),
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      const { enabled } = req.body;
      
      const connection = await prisma.googleSheetsConnection.update({
        where: { userId: req.user!.id },
        data: { syncEnabled: enabled },
      });
      
      console.log(`🟢 [Google Sheets] Auto-sync ${enabled ? 'enabled' : 'disabled'} for user:`, req.user!.email);
      
      res.json({
        success: true,
        syncEnabled: connection.syncEnabled,
      });
    } catch (error: any) {
      console.error('❌ [Google Sheets] Error toggling sync:', error);
      res.status(500).json({ 
        error: 'Failed to update sync settings',
        details: error.message 
      });
    }
  }
);

/**
 * GET /api/sheets/list
 * List user's spreadsheets
 */
router.get('/list', ...clerkAuth, async (req: AuthRequest, res: Response) => {
  try {
    const maxResults = parseInt(req.query.maxResults as string) || 10;
    
    const spreadsheets = await GoogleSheetsService.listSpreadsheets(req.user!.id, maxResults);
    
    res.json({ spreadsheets });
  } catch (error: any) {
    console.error('❌ [Google Sheets] Error listing spreadsheets:', error);
    
    if (error.message === 'Google Sheets not connected') {
      return res.status(400).json({ error: 'Please connect Google Sheets first' });
    }
    
    res.status(500).json({ 
      error: 'Failed to list spreadsheets',
      details: error.message 
    });
  }
});

/**
 * DELETE /api/sheets/disconnect
 * Disconnect Google Sheets (delete connection and tokens)
 */
router.delete('/disconnect', ...clerkAuth, async (req: AuthRequest, res: Response) => {
  try {
    console.log('🟢 [Google Sheets] Disconnecting for user:', req.user!.email);
    
    await prisma.googleSheetsConnection.delete({
      where: { userId: req.user!.id },
    });
    
    console.log('✅ [Google Sheets] Connection deleted');
    
    res.json({
      success: true,
      message: 'Google Sheets disconnected successfully',
    });
  } catch (error: any) {
    console.error('❌ [Google Sheets] Error disconnecting:', error);
    res.status(500).json({ 
      error: 'Failed to disconnect Google Sheets',
      details: error.message 
    });
  }
});

export default router;
