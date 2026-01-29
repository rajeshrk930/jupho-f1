# Google Sheets Lead Sync - Setup Guide

## ✅ Implementation Complete!

The Google Sheets integration is now fully implemented. This feature allows users to automatically backup their Meta leads to Google Sheets.

---

## 🎯 What Was Built

### Backend Components

1. **Database Schema** ([backend/prisma/schema.prisma](backend/prisma/schema.prisma))
   - `GoogleSheetsConnection` - Stores OAuth tokens and sync settings
   - `LeadSubmission` - Stores all leads locally (backup + sync tracking)

2. **Google Sheets Service** ([backend/src/services/sheets.service.ts](backend/src/services/sheets.service.ts))
   - OAuth 2.0 authentication
   - Token encryption (AES-256, same as Facebook)
   - Spreadsheet creation & management
   - Batch lead syncing (up to 500 leads at once)
   - Automatic token refresh

3. **API Routes** ([backend/src/routes/sheets.routes.ts](backend/src/routes/sheets.routes.ts))
   - `GET /api/sheets/auth-url` - Start OAuth flow
   - `GET /api/sheets/callback` - Handle OAuth callback
   - `GET /api/sheets/status` - Check connection status
   - `POST /api/sheets/create-spreadsheet` - Create new sheet
   - `POST /api/sheets/set-spreadsheet` - Use existing sheet
   - `POST /api/sheets/sync` - Manual sync
   - `PATCH /api/sheets/toggle-sync` - Enable/disable auto-sync
   - `DELETE /api/sheets/disconnect` - Remove connection

4. **Auto-Sync Scheduler** ([backend/src/services/syncScheduler.service.ts](backend/src/services/syncScheduler.service.ts))
   - Runs every 15 minutes
   - Syncs unsynced leads for all users
   - Handles token expiration gracefully

5. **Modified Facebook Leads Endpoint** ([backend/src/routes/facebook.routes.ts](backend/src/routes/facebook.routes.ts))
   - Now saves leads to `LeadSubmission` table
   - Prevents duplicates using unique `leadId`

### Frontend Components

1. **Forms Page Enhancement** ([frontend/src/app/forms/page.tsx](frontend/src/app/forms/page.tsx))
   - Google Sheets status card
   - "Connect Google Sheets" button
   - "Sync Now" button
   - Shows synced/unsynced lead counts

2. **Integrations Settings Page** ([frontend/src/app/settings/integrations/page.tsx](frontend/src/app/settings/integrations/page.tsx))
   - Full Google Sheets management UI
   - Create or select spreadsheet
   - Toggle auto-sync
   - Manual sync button
   - Disconnect option
   - Connection status & stats

---

## 🔧 Setup Instructions

### Step 1: Configure Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or use existing)
3. Enable **Google Sheets API**:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google Sheets API"
   - Click "Enable"

4. Create OAuth 2.0 Credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client ID"
   - Application type: **Web application**
   - Name: `Jupho Lead Sync`
   - Authorized redirect URIs:
     - Development: `http://localhost:5000/api/sheets/callback`
     - Production: `https://your-backend-url.com/api/sheets/callback`
   - Click "Create"
   - Copy the **Client ID** and **Client Secret**

### Step 2: Update Environment Variables

Add to `backend/.env`:

```env
# Google Sheets Integration
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
BACKEND_URL=http://localhost:5000  # or your production URL
```

**Important**: `BACKEND_URL` is used for OAuth callback redirect.

### Step 3: Run Database Migration

```bash
cd backend
npx prisma migrate deploy
```

This will create the `GoogleSheetsConnection` and `LeadSubmission` tables.

### Step 4: Restart Backend Server

```bash
cd backend
npm run dev
```

You should see in the console:
```
✅ [Sync Scheduler] Started - will run every 15 minutes
```

---

## 🚀 User Workflow

### First-Time Setup (User)

1. User goes to **Forms** page or **Settings > Integrations**
2. Clicks **"Connect Google Sheets"**
3. Redirected to Google OAuth consent screen
4. Grants permissions
5. Redirected back with success message
6. User can now:
   - **Create New Spreadsheet** (recommended)
   - **Use Existing Spreadsheet**

### Automatic Lead Syncing

Once connected:
- New leads fetched from Facebook are saved to database
- Every 15 minutes, scheduler syncs unsynced leads to Google Sheets
- User can also click **"Sync Now"** for immediate sync

### Spreadsheet Structure

The Google Sheet will have these columns:
```
Lead ID | Submitted At | Full Name | Email | Phone | Additional Data
```

### Manual Sync

Users can trigger manual sync anytime:
1. Go to **Forms** page
2. Click **"Sync Now"** button
3. Leads instantly pushed to Google Sheets

---

## 📊 Features

### ✅ Implemented Features

- [x] Google OAuth 2.0 authentication
- [x] Encrypted token storage (AES-256)
- [x] Local lead database storage
- [x] Spreadsheet creation via API
- [x] Use existing spreadsheet
- [x] Batch lead syncing (500 leads/batch)
- [x] Auto-sync every 15 minutes
- [x] Manual sync button
- [x] Enable/disable auto-sync toggle
- [x] Connection status dashboard
- [x] Synced/unsynced lead counts
- [x] Token refresh on expiration
- [x] Disconnect & cleanup
- [x] Error handling & retry logic
- [x] Duplicate prevention (unique leadId)

### 🔒 Security Features

- [x] AES-256 token encryption (same method as Facebook)
- [x] Per-user authentication (no shared service account)
- [x] CSRF protection on OAuth (state parameter)
- [x] Token expiration handling
- [x] Automatic token refresh
- [x] Cascade delete on user deletion

---

## 🔄 How Auto-Sync Works

```
┌─────────────────────────────────────────────────┐
│  Every 15 minutes (node-cron scheduler)         │
└─────────────────┬───────────────────────────────┘
                  ▼
┌─────────────────────────────────────────────────┐
│  Find all users with:                           │
│  - Google Sheets connected                      │
│  - syncEnabled = true                           │
│  - spreadsheetId set                            │
└─────────────────┬───────────────────────────────┘
                  ▼
┌─────────────────────────────────────────────────┐
│  For each user:                                 │
│  1. Find leads with syncedToSheets = false      │
│  2. Batch fetch (max 500 leads)                 │
│  3. Transform to sheet rows                     │
│  4. Append to Google Sheet                      │
│  5. Mark as syncedToSheets = true               │
└─────────────────┬───────────────────────────────┘
                  ▼
┌─────────────────────────────────────────────────┐
│  Log results:                                   │
│  ✅ X leads synced for Y users                  │
│  ❌ Z errors                                     │
└─────────────────────────────────────────────────┘
```

---

## 🛡️ Error Handling

### Token Expiration
- If Google token expires during sync:
  - System attempts auto-refresh
  - If refresh fails, disables auto-sync
  - User notified to reconnect

### API Rate Limiting
- Google Sheets API: 100 requests/100 seconds
- System uses batch operations (500 rows/request)
- Prevents hitting rate limits

### Duplicate Leads
- `leadId` is unique in database
- Duplicate leads are skipped (upsert logic)

### Sync Failures
- Errors logged but don't crash app
- Failed leads remain unsynced (retry on next run)

---

## 📝 Meta & Google Compliance

### ✅ Meta Policy Compliant
- Uses official Graph API
- Per-user authentication
- Not selling/sharing lead data
- Privacy policy required (already implemented)

### ✅ Google Policy Compliant
- Using official Google Sheets API v4
- Per-user OAuth (not service account)
- Proper scopes: `spreadsheets` only
- Batch operations (efficient API usage)
- Rate limit handling

### ✅ GDPR Compliant
- User owns their data
- Explicit consent (OAuth flow)
- Right to disconnect
- Cascade delete on user deletion
- Encrypted token storage

---

## 🧪 Testing Instructions

### Test OAuth Flow

1. Start backend: `cd backend && npm run dev`
2. Start frontend: `cd frontend && npm run dev`
3. Go to `http://localhost:3000/settings/integrations`
4. Click "Connect Google Sheets"
5. Complete OAuth flow
6. Verify success message

### Test Spreadsheet Creation

1. After connecting, click "Create New Spreadsheet"
2. Enter name: "Test Leads 2026"
3. Click "Create"
4. Should see success message
5. Click "Open Sheet" to verify in Google Sheets

### Test Manual Sync

1. Ensure you have leads in Facebook
2. Go to Forms page
3. View leads (they'll be saved to database)
4. Go back to Settings > Integrations
5. Click "Sync Now"
6. Check Google Sheet - leads should appear

### Test Auto-Sync

1. Create connection and set spreadsheet
2. Enable auto-sync toggle
3. Wait 15 minutes (or trigger manually via console)
4. Check logs for sync confirmation
5. Verify leads in Google Sheet

---

## 🐛 Troubleshooting

### "Failed to connect Google Sheets"
- Check `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env`
- Verify redirect URI matches in Google Cloud Console
- Check `BACKEND_URL` is correct

### "Token expired" error
- This is normal after 1 hour
- System should auto-refresh
- If persists, user needs to reconnect

### "No spreadsheet configured"
- User must create or select spreadsheet first
- Guide user to Settings > Integrations

### Leads not syncing
- Check auto-sync is enabled
- Verify spreadsheet is set
- Check backend logs for errors
- Ensure scheduler is running

### "Rate limit exceeded"
- Google Sheets API: 100 req/100s
- System uses batch operations
- Should rarely happen with 15-min intervals

---

## 📚 API Endpoints Reference

### Check Status
```bash
GET /api/sheets/status
Authorization: Bearer <clerk-token>

Response:
{
  "connected": true,
  "spreadsheetId": "abc123...",
  "spreadsheetName": "My Leads",
  "syncEnabled": true,
  "syncedLeads": 150,
  "unsyncedLeads": 5,
  "lastSyncAt": "2026-01-29T12:00:00Z"
}
```

### Connect (Get Auth URL)
```bash
GET /api/sheets/auth-url
Authorization: Bearer <clerk-token>

Response:
{
  "authUrl": "https://accounts.google.com/o/oauth2/auth?..."
}
```

### Create Spreadsheet
```bash
POST /api/sheets/create-spreadsheet
Authorization: Bearer <clerk-token>
Content-Type: application/json

{
  "title": "My Facebook Leads 2026"
}

Response:
{
  "spreadsheetId": "abc123...",
  "spreadsheetUrl": "https://docs.google.com/spreadsheets/d/abc123",
  "title": "My Facebook Leads 2026"
}
```

### Manual Sync
```bash
POST /api/sheets/sync
Authorization: Bearer <clerk-token>

Response:
{
  "success": true,
  "syncedCount": 25,
  "message": "Successfully synced 25 leads to Google Sheets"
}
```

### Disconnect
```bash
DELETE /api/sheets/disconnect
Authorization: Bearer <clerk-token>

Response:
{
  "success": true,
  "message": "Google Sheets disconnected successfully"
}
```

---

## 🚀 Deployment Notes

### Environment Variables (Production)

```env
GOOGLE_CLIENT_ID=your-production-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-production-client-secret
BACKEND_URL=https://your-backend.railway.app  # or Vercel/Render URL
```

### Google Cloud Console (Production)

Add production redirect URI:
```
https://your-backend.railway.app/api/sheets/callback
```

### Database Migration (Production)

```bash
# Railway/Render
npx prisma migrate deploy

# Or use the migration file directly
psql $DATABASE_URL -f prisma/migrations/20260129000000_add_google_sheets_and_lead_storage/migration.sql
```

---

## ✨ Future Enhancements (Optional)

- [ ] Email notifications on sync errors
- [ ] Webhook for real-time Facebook lead sync
- [ ] Custom field mapping UI
- [ ] Multiple spreadsheet support per user
- [ ] Bidirectional sync (Sheets → Facebook)
- [ ] Lead analytics dashboard
- [ ] Export to CSV/PDF
- [ ] Integration with other CRMs (HubSpot, Salesforce)

---

## 📞 Support

If you encounter any issues:

1. Check backend logs for errors
2. Verify environment variables are set
3. Test OAuth flow in incognito mode
4. Check Google Cloud Console for API quotas
5. Review this guide's troubleshooting section

---

## ✅ Summary

**Google Sheets Lead Sync is fully functional!**

Users can now:
- ✅ Connect Google Sheets via OAuth
- ✅ Automatically backup all leads
- ✅ Never lose data (even after Facebook's 90-day limit)
- ✅ Access leads from anywhere
- ✅ Share with team members
- ✅ Export to any tool

**Meta & Google compliant. GDPR compliant. Production-ready.** 🎉
