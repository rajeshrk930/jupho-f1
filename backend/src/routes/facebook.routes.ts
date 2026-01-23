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
    const { code, state, error } = req.query;
    
    // Check for Facebook OAuth error
    if (error) {
      console.error('[Facebook OAuth] User denied:', error);
      return res.redirect(`${process.env.FRONTEND_URL}/settings?error=access_denied`);
    }
    
    if (!code || !state || typeof code !== 'string' || typeof state !== 'string') {
      return res.redirect(`${process.env.FRONTEND_URL}/settings?error=missing_code`);
    }
    
    // Validate CSRF token - state parameter contains csrfToken
    const csrfToken = state;
    const fbAccount = await prisma.facebookAccount.findFirst({
      where: { csrfToken }
    });
    
    if (!fbAccount) {
      console.error('[Facebook OAuth] Invalid CSRF token:', csrfToken);
      return res.redirect(`${process.env.FRONTEND_URL}/settings?error=invalid_state`);
    }
    
    const userId = fbAccount.userId;
      
      // Exchange code for access token
      const accessToken = await FacebookService.exchangeCodeForToken(code);
      
      // Get user info and pages
      const [userInfo, pages] = await Promise.all([
        FacebookService.getUserInfo(accessToken),
        FacebookService.getPages(accessToken)
      ]);
      
      // Store encrypted token and user info temporarily (without ad account yet)
      const encryptedToken = FacebookService.encryptToken(accessToken);
      
      // Update account with new token and clear CSRF token
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
          lastSyncAt: new Date()
        }
      });
    
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
    const fbAccount = await prisma.facebookAccount.findUnique({
      where: { userId: req.user!.id }
    });
    
    if (!fbAccount) {
      return res.status(400).json({ 
        error: 'No Facebook account connected. Please connect your Facebook account first.' 
      });
    }
    
    console.log('📊 Fetching ad accounts for user:', req.user!.email);
    const accessToken = FacebookService.decryptToken(fbAccount.accessToken);
    const adAccounts = await FacebookService.getAdAccounts(accessToken);
    
    console.log(`✅ Found ${adAccounts.length} ad accounts`);
    
    // Handle case where user has no ad accounts
    if (adAccounts.length === 0) {
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
      console.log('📥 select-account request', { adAccountId, adAccountName, userId: req.user?.id });
      
      const fbAccount = await prisma.facebookAccount.findUnique({
        where: { userId: req.user!.id }
      });
      
      if (!fbAccount) {
        console.warn('⚠️ select-account: facebook account not found for user', req.user?.id);
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
      console.log('✅ select-account saved - CONFIRMED:', { 
        userId: req.user?.id, 
        newAdAccountId: updated.adAccountId,
        adAccountName: updated.adAccountName,
        wasUpdated: updated.adAccountId !== 'PENDING'
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
    console.log('📡 Facebook status check for user:', {
      userId: req.user?.id,
      email: req.user?.email,
    });

    let account = await prisma.facebookAccount.findUnique({
      where: { userId: req.user!.id }
    });
    
    if (!account || !account.isActive || account.adAccountId === 'PENDING') {
      console.log('ℹ️ No active Facebook account or pending ad account selection', {
        hasAccount: !!account,
        isActive: account?.isActive,
        adAccountId: account?.adAccountId,
      });

      // Auto-select an ad account to unblock users
      if (account && account.isActive && account.adAccountId === 'PENDING') {
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
            console.log('✅ Auto-selected ad account', { userId: req.user!.id, adAccountId: pick.id, name: pick.name });
          }
        } catch (autoErr) {
          const autoMsg = (autoErr as any)?.message || autoErr;
          console.warn('⚠️ Auto-select ad account failed', autoMsg);
        }
      }

      // Re-check after potential auto-selection
      const refreshed = await prisma.facebookAccount.findUnique({ where: { userId: req.user!.id } });
      if (!refreshed || !refreshed.isActive || refreshed.adAccountId === 'PENDING') {
        return res.json({
          connected: false,
          account: null
        });
      }
      account = refreshed;
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
    
    res.json({
      connected: isTokenValid,
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
    
    await prisma.facebookAccount.update({
      where: { userId: req.user!.id },
      data: { isActive: false }
    });
    
    res.json({ success: true, message: 'Facebook account disconnected successfully' });
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
    
    // Transform lead data to more readable format
    const formattedLeads = leads.map((lead: any) => {
      const fields: Record<string, string> = {};
      lead.field_data?.forEach((field: any) => {
        fields[field.name] = field.values.join(', ');
      });
      
      return {
        id: lead.id,
        createdAt: lead.created_time,
        fields
      };
    });
    
    res.json({ 
      success: true,
      leads: formattedLeads,
      totalCount: formattedLeads.length
    });
  } catch (error: any) {
    console.error('Facebook fetch leads error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: error.response?.data?.error?.message || 'Failed to fetch leads from Facebook' 
    });
  }
});

export default router;
