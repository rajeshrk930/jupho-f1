import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { clerkAuth } from '../middleware/clerkAuth';
import { AuthRequest } from '../middleware/auth';
import { FacebookService } from '../services/facebook.service';
import { prisma } from '../lib/prisma';
import crypto from 'crypto';
import axios from 'axios';

const router = Router();

/**
 * GET /api/facebook/auth-url
 * Generate Facebook OAuth URL for user to connect their account
 */
router.get('/auth-url', ...clerkAuth, async (req: AuthRequest, res: Response) => {
  try {
    // Generate CSRF token for OAuth security
    const csrfToken = crypto.randomBytes(32).toString('hex');
    
    // Store CSRF token in database (create or update FacebookAccount)
    const existingAccount = await prisma.facebookAccount.findUnique({
      where: { userId: req.user!.id }
    });
    
    if (existingAccount) {
      await prisma.facebookAccount.update({
        where: { userId: req.user!.id },
        data: { csrfToken }
      });
    } else {
      // Create placeholder record with CSRF token
      await prisma.facebookAccount.create({
        data: {
          userId: req.user!.id,
          facebookUserId: 'PENDING',
          accessToken: 'PENDING',
          tokenExpiresAt: new Date(),
          adAccountId: 'PENDING',
          csrfToken,
          isActive: false
        }
      });
    }
    
    const url = `https://www.facebook.com/v19.0/dialog/oauth?` +
      `client_id=${process.env.FACEBOOK_APP_ID}` +
      `&redirect_uri=${encodeURIComponent(process.env.FACEBOOK_REDIRECT_URI!)}` +
      `&scope=email,public_profile,ads_management,ads_read,read_insights,pages_manage_ads,pages_read_engagement,business_management` +
      `&auth_type=rerequest` +
      `&state=${csrfToken}`;
    
    console.log('✅ [STEP 1] OAuth URL generated successfully');
    res.json({ url });
  } catch (error: any) {
    console.error('[Facebook OAuth] Error:', error);
    res.status(500).json({ error: 'Failed to generate OAuth URL' });
  }
});

/**
 * GET /api/facebook/callback
 * Handle OAuth callback and store access token
 * Facebook redirects here after user authorizes the app
 * NOTE: No authentication middleware - Facebook calls this directly
 * SECURITY: Validates CSRF token from state parameter
 */
router.get('/callback', async (req, res: Response) => {
  try {
    console.log('🟢 [STEP 2] Facebook OAuth callback received');
    const { code, state, error } = req.query;
    
    // Check for Facebook OAuth error
    if (error) {
      console.error('❌ [STEP 2 ERROR] User denied:', error);
      return res.redirect(`${process.env.FRONTEND_URL}/settings?error=access_denied`);
    }
    
    if (!code || !state || typeof code !== 'string' || typeof state !== 'string') {
      console.error('❌ [STEP 2 ERROR] Missing code or state');
      return res.redirect(`${process.env.FRONTEND_URL}/settings?error=missing_code`);
    }
    
    console.log('🟢 [STEP 2] Validating CSRF token');
    // Validate CSRF token - state parameter contains csrfToken
    const csrfToken = state;
    const fbAccount = await prisma.facebookAccount.findFirst({
      where: { csrfToken }
    });
    
    if (!fbAccount) {
      console.error('❌ [STEP 2 ERROR] Invalid CSRF token:', csrfToken);
      return res.redirect(`${process.env.FRONTEND_URL}/settings?error=invalid_state`);
    }
    
    const userId = fbAccount.userId;
    console.log('🟢 [STEP 2] CSRF validated, userId:', userId);
      
      // Exchange code for access token
      console.log('🟢 [STEP 2] Exchanging code for access token');
      const accessToken = await FacebookService.exchangeCodeForToken(code);
      console.log('✅ [STEP 2] Access token received');
      
      // Get user info and pages
      console.log('🟢 [STEP 2] Fetching user info and pages');
      const [userInfo, pages] = await Promise.all([
        FacebookService.getUserInfo(accessToken),
        FacebookService.getPages(accessToken)
      ]);
      console.log('✅ [STEP 2] Got user info and pages:', {
        userName: userInfo.name,
        pagesCount: pages.length,
        pageIds: pages.map(p => p.id)
      });
      
      // Store encrypted token and user info temporarily (without ad account yet)
      const encryptedToken = FacebookService.encryptToken(accessToken);
      
      // Update account with new token and clear CSRF token
      console.log('🟢 [STEP 2] Updating FacebookAccount in database');
      await prisma.facebookAccount.update({
        where: { userId },
        data: {
          facebookUserId: userInfo.id,
          facebookUserName: userInfo.name,
          facebookUserEmail: userInfo.email,
          accessToken: encryptedToken,
          tokenExpiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
          pageIds: pages.map(p => p.id).join(','),
          pageNames: pages.map(p => p.name).join(','),
          csrfToken: null, // Clear CSRF token after successful OAuth
          lastSyncAt: new Date(),
          isActive: false, // Will be set to true after ad account selection
          adAccountId: 'PENDING' // Will be updated in select-account
        }
      });
      console.log('✅ [STEP 2] Database updated, redirecting to ad account selection');
    
    // Redirect to ad account selection page with userId in query
    return res.redirect(`${process.env.FRONTEND_URL}/facebook/select-account?userId=${userId}`);
  } catch (error: any) {
    console.error('[Facebook OAuth] Callback error:', error);
    return res.redirect(`${process.env.FRONTEND_URL}/dashboard?error=connection_failed&message=${encodeURIComponent(error.message || 'Unknown error')}`);
  }
});

/**
 * GET /api/facebook/ad-accounts
 * Get list of ad accounts for current user's Facebook connection
 */
router.get('/ad-accounts', ...clerkAuth, async (req: AuthRequest, res: Response) => {
  try {
    console.log('🟡 [STEP 3] Fetching ad accounts for user:', req.user!.email);
    
    const fbAccount = await prisma.facebookAccount.findUnique({
      where: { userId: req.user!.id }
    });
    
    if (!fbAccount) {
      console.error('❌ [STEP 3 ERROR] No Facebook account found');
      return res.status(400).json({ 
        error: 'No Facebook account connected. Please connect your Facebook account first.' 
      });
    }
    
    console.log('🟡 [STEP 3] Facebook account found, decrypting token');
    const accessToken = FacebookService.decryptToken(fbAccount.accessToken);
    const adAccounts = await FacebookService.getAdAccounts(accessToken);
    
    console.log(`✅ [STEP 3] Found ${adAccounts.length} ad accounts`);
    
    // Handle case where user has no ad accounts
    if (adAccounts.length === 0) {
      console.warn('⚠️ [STEP 3] No ad accounts found');
      return res.json({
        adAccounts: [],
        message: 'No ad accounts found. You need to create an ad account in Facebook Business Manager first.'
      });
    }
    
    res.json({ 
      adAccounts: adAccounts.map(account => ({
        id: account.id,
        name: account.name,
        accountStatus: account.account_status,
        currency: account.currency
      }))
    });
  } catch (error: any) {
    console.error('❌ Fetch ad accounts error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to fetch ad accounts',
      details: 'Check if you have an ad account in Facebook Business Manager'
    });
  }
});

/**
 * POST /api/facebook/select-account
 * Save user's selected ad account
 */
router.post('/select-account', 
  ...clerkAuth,
  [
    body('adAccountId').notEmpty().withMessage('Ad account ID is required'),
    body('adAccountName').notEmpty().withMessage('Ad account name is required')
  ],
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const firstError = errors.array()[0];
      console.warn('⚠️ select-account validation errors:', errors.array());
      return res.status(400).json({ 
        error: firstError.msg,
        field: (firstError as any).param || (firstError as any).path,
        errors: errors.array()
      });
    }

    try {
      const { adAccountId, adAccountName } = req.body;
      console.log('� [STEP 4] Saving ad account selection:', { 
        userId: req.user!.email,
        adAccountId, 
        adAccountName 
      });
      
      const fbAccount = await prisma.facebookAccount.findUnique({
        where: { userId: req.user!.id }
      });
      
      if (!fbAccount) {
        console.warn('❌ [STEP 4 ERROR] Facebook account not found for user:', req.user!.id);
        return res.status(400).json({ error: 'No Facebook account connected' });
      }
      
      // Update with selected ad account
      const updated = await prisma.facebookAccount.update({
        where: { userId: req.user!.id },
        data: {
          adAccountId,
          adAccountName,
          isActive: true
        }
      });
      console.log('✅ [STEP 4] Ad account saved successfully:', { 
        userId: req.user!.email,
        adAccountId: updated.adAccountId,
        adAccountName: updated.adAccountName,
        isActive: updated.isActive
      });
      res.json({ 
        success: true, 
        message: 'Ad account selected successfully'
      });
    } catch (error: any) {
      console.error('❌ Select ad account error:', error?.response?.data || error?.message || error);
      res.status(500).json({ error: 'Failed to save ad account selection', detail: error?.message || 'unknown' });
    }
  }
);

/**
 * GET /api/facebook/status
 * Get connected Facebook account status
 */
router.get('/status', ...clerkAuth, async (req: AuthRequest, res: Response) => {
  try {
    console.log('📡 [STATUS CHECK] Checking Facebook status for user:', req.user?.email);

    let account = await prisma.facebookAccount.findUnique({
      where: { userId: req.user!.id }
    });
    
    if (!account || account.adAccountId === 'PENDING') {
      console.log('ℹ️ [STATUS CHECK] No active account or pending ad account selection:', {
        hasAccount: !!account,
        isActive: account?.isActive,
        adAccountId: account?.adAccountId,
      });

      // AUTO-SELECT: Try to automatically pick an ad account if still pending (FIXED: removed isActive check)
      if (account && account.adAccountId === 'PENDING') {
        console.log('🔄 [STATUS CHECK] Attempting auto-selection of ad account...');
        try {
          const accessToken = FacebookService.decryptToken(account.accessToken);
          const adAccounts = await FacebookService.getAdAccounts(accessToken);
          if (adAccounts && adAccounts.length > 0) {
            const pick = adAccounts.find((a) => a.account_status === 1) || adAccounts[0];
            await prisma.facebookAccount.update({
              where: { userId: req.user!.id },
              data: {
                adAccountId: pick.id,
                adAccountName: pick.name,
                isActive: true,
              },
            });
            console.log('✅ [STATUS CHECK] Auto-selected ad account:', { 
              adAccountId: pick.id, 
              name: pick.name 
            });
            
            // Reload account after update
            account = await prisma.facebookAccount.findUnique({ 
              where: { userId: req.user!.id } 
            });
          } else {
            console.warn('⚠️ [STATUS CHECK] No ad accounts available for auto-selection');
          }
        } catch (autoErr) {
          console.error('❌ [STATUS CHECK] Auto-select failed:', autoErr);
        }
      }

      // Re-check after potential auto-selection
      if (!account || !account.isActive || account.adAccountId === 'PENDING') {
        console.log('❌ [STATUS CHECK] Connection not complete, returning disconnected');
        return res.json({
          connected: false,
          account: null
        });
      }
    }
    
    console.log('📦 Facebook account record', {
      adAccountId: account.adAccountId,
      isActive: account.isActive,
      tokenExpiresAt: account.tokenExpiresAt,
    });

    // Check if token is still valid (guard against null)
    const isTokenValid = account.tokenExpiresAt
      ? account.tokenExpiresAt > new Date()
      : false;
    
    console.log('🔍 Token validation check:', {
      tokenExpiresAt: account.tokenExpiresAt,
      now: new Date(),
      isExpired: account.tokenExpiresAt ? account.tokenExpiresAt <= new Date() : 'null',
      isActive: account.isActive,
      isTokenValid
    });
    
    // Account is connected if it's active AND has a valid token
    const isConnected = account.isActive && isTokenValid;
    
    console.log(isConnected ? '✅ [STATUS CHECK] Connected' : '❌ [STATUS CHECK] Not connected');
    
    res.json({
      connected: isConnected,
      account: {
        facebookUserName: account.facebookUserName,
        facebookUserEmail: account.facebookUserEmail,
        adAccountId: account.adAccountId,
        adAccountName: account.adAccountName,
        pageNames: account.pageNames,
        lastSyncAt: account.lastSyncAt,
        tokenExpiring: account.tokenExpiresAt 
          ? account.tokenExpiresAt < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) 
          : false // Expires in < 7 days
      }
    });
  } catch (error: any) {
    console.error('❌ Facebook status error:', error?.response?.data || error?.message || error);
    res.status(500).json({
      error: 'Failed to check Facebook account status',
      detail: error?.message || 'Unknown error',
    });
  }
});

/**
 * DELETE /api/facebook/disconnect
 * Disconnect Facebook account
 */
router.delete('/disconnect', ...clerkAuth, async (req: AuthRequest, res: Response) => {
  try {
    const account = await prisma.facebookAccount.findUnique({
      where: { userId: req.user!.id }
    });
    
    if (!account) {
      return res.status(404).json({ error: 'No Facebook account connected' });
    }
    
    // Completely delete Facebook data (Meta compliance requirement)
    await prisma.facebookAccount.delete({
      where: { userId: req.user!.id }
    });
    
    res.json({ success: true, message: 'Facebook account disconnected and all data deleted successfully' });
  } catch (error: any) {
    console.error('Facebook disconnect error:', error);
    res.status(500).json({ error: 'Failed to disconnect Facebook account' });
  }
});

/**
 * GET /api/facebook/ads
 * Fetch active ads from Facebook Ad Account
 */
router.get('/ads', ...clerkAuth, async (req: AuthRequest, res: Response) => {
  try {
    const fbAccount = await prisma.facebookAccount.findUnique({
      where: { userId: req.user!.id }
    });
    
    if (!fbAccount || !fbAccount.isActive) {
      return res.status(400).json({ 
        error: 'No Facebook account connected. Please connect your Facebook Ad Account first.' 
      });
    }
    
    // Check if token is expired
    if (fbAccount.tokenExpiresAt < new Date()) {
      return res.status(401).json({ 
        error: 'Facebook access token expired. Please reconnect your account.' 
      });
    }
    
    const accessToken = FacebookService.decryptToken(fbAccount.accessToken);
    
    // Verify token is still valid with Facebook
    const isValid = await FacebookService.verifyToken(accessToken);
    if (!isValid) {
      return res.status(401).json({ 
        error: 'Facebook access token is invalid. Please reconnect your account.' 
      });
    }
    
    const ads = await FacebookService.getActiveAds(accessToken, fbAccount.adAccountId);
    
    // Update last sync time
    await prisma.facebookAccount.update({
      where: { userId: req.user!.id },
      data: { lastSyncAt: new Date() }
    });
    
    res.json({ 
      ads: ads.map(ad => ({
        id: ad.id,
        name: ad.name,
        status: ad.status,
        creative: ad.creative,
        metrics: ad.insights?.data?.[0] || null
      })),
      totalCount: ads.length
    });
  } catch (error: any) {
    console.error('Facebook fetch ads error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to fetch ads from Facebook' 
    });
  }
});

/**
 * GET /api/facebook/ad/:adId
 * Get specific ad details with metrics
 */
router.get('/ad/:adId', ...clerkAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { adId } = req.params;
    
    const fbAccount = await prisma.facebookAccount.findUnique({
      where: { userId: req.user!.id }
    });
    
    if (!fbAccount || !fbAccount.isActive) {
      return res.status(400).json({ 
        error: 'No Facebook account connected' 
      });
    }
    
    const accessToken = FacebookService.decryptToken(fbAccount.accessToken);
    
    const metrics = await FacebookService.getAdCreativeMetrics(
      accessToken,
      fbAccount.adAccountId,
      adId
    );
    
    res.json({ metrics });
  } catch (error: any) {
    console.error('Facebook fetch ad metrics error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to fetch ad metrics' 
    });
  }
});

/**
 * POST /api/facebook/refresh-token
 * Refresh Facebook access token
 */
router.post('/refresh-token', ...clerkAuth, async (req: AuthRequest, res: Response) => {
  try {
    const fbAccount = await prisma.facebookAccount.findUnique({
      where: { userId: req.user!.id }
    });
    
    if (!fbAccount || !fbAccount.isActive) {
      return res.status(400).json({ 
        error: 'No Facebook account connected' 
      });
    }
    
    const currentToken = FacebookService.decryptToken(fbAccount.accessToken);
    const newToken = await FacebookService.refreshLongLivedToken(currentToken);
    const encryptedNewToken = FacebookService.encryptToken(newToken);
    
    await prisma.facebookAccount.update({
      where: { userId: req.user!.id },
      data: {
        accessToken: encryptedNewToken,
        tokenExpiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
      }
    });
    
    res.json({ 
      success: true, 
      message: 'Access token refreshed successfully' 
    });
  } catch (error: any) {
    console.error('Facebook refresh token error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to refresh access token' 
    });
  }
});

/**
 * GET /api/facebook/leads/:formId
 * Retrieve lead submissions from a Facebook Lead Form
 */
router.get('/leads/:formId', ...clerkAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { formId } = req.params;
    
    const fbAccount = await prisma.facebookAccount.findUnique({
      where: { userId: req.user!.id }
    });
    
    if (!fbAccount || !fbAccount.isActive) {
      return res.status(400).json({ 
        error: 'No Facebook account connected. Please connect your Facebook account first.' 
      });
    }
    
    // Check if token is expired
    if (fbAccount.tokenExpiresAt < new Date()) {
      return res.status(401).json({ 
        error: 'Facebook access token expired. Please reconnect your account.' 
      });
    }
    
    const accessToken = FacebookService.decryptToken(fbAccount.accessToken);
    
    // Fetch leads from Facebook Graph API
    const response = await axios.get(
      `https://graph.facebook.com/v19.0/${formId}/leads`,
      {
        params: {
          access_token: accessToken,
          fields: 'id,created_time,field_data'
        }
      }
    );
    
    const leads = response.data.data || [];
    
    // Transform lead data to more readable format and save to database
    const formattedLeads = [];
    const newLeads = [];
    
    for (const lead of leads) {
      const fields: Record<string, string> = {};
      lead.field_data?.forEach((field: any) => {
        fields[field.name] = field.values.join(', ');
      });
      
      const formattedLead = {
        id: lead.id,
        createdAt: lead.created_time,
        fields
      };
      
      formattedLeads.push(formattedLead);
      
      // Save to database (upsert to avoid duplicates)
      try {
        const existingLead = await prisma.leadSubmission.findUnique({
          where: { leadId: lead.id }
        });
        
        if (!existingLead) {
          await prisma.leadSubmission.create({
            data: {
              userId: req.user!.id,
              formId,
              leadId: lead.id,
              data: JSON.stringify(fields),
              submittedAt: new Date(lead.created_time),
              syncedToSheets: false,
            }
          });
          newLeads.push(lead.id);
        }
      } catch (dbError: any) {
        console.error(`Failed to save lead ${lead.id}:`, dbError.message);
        // Continue processing other leads
      }
    }
    
    console.log(`✅ Saved ${newLeads.length} new leads to database (${formattedLeads.length} total fetched)`);
    
    res.json({ 
      success: true,
      leads: formattedLeads,
      totalCount: formattedLeads.length,
      newLeadsCount: newLeads.length,
    });
  } catch (error: any) {
    console.error('Facebook fetch leads error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: error.response?.data?.error?.message || 'Failed to fetch leads from Facebook' 
    });
  }
});

/**
 * GET /api/facebook/forms
 * Retrieve all lead forms from user's Facebook page
 */
router.get('/forms', ...clerkAuth, async (req: AuthRequest, res: Response) => {
  try {
    const fbAccount = await prisma.facebookAccount.findUnique({
      where: { userId: req.user!.id }
    });
    
    if (!fbAccount || !fbAccount.isActive) {
      return res.status(400).json({ 
        error: 'No Facebook account connected. Please connect your Facebook account first.' 
      });
    }
    
    // Check if token is expired
    if (fbAccount.tokenExpiresAt < new Date()) {
      return res.status(401).json({ 
        error: 'Facebook access token expired. Please reconnect your account.' 
      });
    }
    
    const accessToken = FacebookService.decryptToken(fbAccount.accessToken);
    
    console.log('📝 Fetching lead forms - User ID:', req.user!.id);
    
    // Get pages with their access tokens
    const pages = await FacebookService.getPages(accessToken);
    console.log('📄 Pages found:', pages.length);
    
    if (!pages || pages.length === 0) {
      return res.status(400).json({ 
        error: 'No Facebook Pages found. Please ensure you have a Facebook Page.' 
      });
    }
    
    // Use the first page
    const page = pages[0];
    const pageAccessToken = page.access_token || accessToken;
    console.log('📄 Using page:', page.name, '(ID:', page.id + ')');
    console.log('🔑 Has page access token:', !!page.access_token);
    
    // Fetch lead forms from Facebook Graph API using PAGE access token
    console.log('📡 Fetching forms from Facebook API...');
    const response = await axios.get(
      `https://graph.facebook.com/v19.0/${page.id}/leadgen_forms`,
      {
        params: {
          access_token: pageAccessToken,
          fields: 'id,name,status,created_time,questions,leads_count,context_card'
        }
      }
    );
    
    console.log('✅ Forms API response - Count:', response.data.data?.length || 0);
    
    console.log('✅ Forms API response - Count:', response.data.data?.length || 0);
    
    const forms = response.data.data || [];
    
    console.log('📋 Raw forms data:', JSON.stringify(forms, null, 2));
    
    // Transform form data
    const formattedForms = forms.map((form: any) => ({
      id: form.id,
      name: form.name,
      status: form.status,
      createdAt: form.created_time,
      questionCount: form.questions?.length || 0,
      leadsCount: form.leads_count || 0,
      introText: form.context_card?.content?.[0] || ''
    }));
    
    console.log('🎯 Returning', formattedForms.length, 'forms to frontend');
    console.log('📤 Formatted forms:', JSON.stringify(formattedForms, null, 2));
    
    res.json({ 
      success: true,
      forms: formattedForms,
      totalCount: formattedForms.length
    });
  } catch (error: any) {
    console.error('Facebook fetch forms error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: error.response?.data?.error?.message || 'Failed to fetch forms from Facebook' 
    });
  }
});

export default router;
