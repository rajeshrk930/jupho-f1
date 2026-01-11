import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate, AuthRequest } from '../middleware/auth';
import { FacebookService } from '../services/facebook.service';
import { prisma } from '../lib/prisma';

const router = Router();

/**
 * GET /api/facebook/auth-url
 * Generate Facebook OAuth URL for user to connect their account
 */
router.get('/auth-url', authenticate, (req: AuthRequest, res: Response) => {
  try {
    // Log environment variables for debugging
    console.log('[Facebook OAuth] APP_ID:', process.env.FACEBOOK_APP_ID ? 'Set' : 'MISSING');
    console.log('[Facebook OAuth] REDIRECT_URI:', process.env.FACEBOOK_REDIRECT_URI ? 'Set' : 'MISSING');
    
    const url = `https://www.facebook.com/v19.0/dialog/oauth?` +
      `client_id=${process.env.FACEBOOK_APP_ID}` +
      `&redirect_uri=${encodeURIComponent(process.env.FACEBOOK_REDIRECT_URI!)}` +
      `&scope=ads_read,read_insights,ads_management` +
      `&state=${req.user!.id}`;
    
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
    
    const userId = state; // We passed userId as state
      
      // Exchange code for access token
      const accessToken = await FacebookService.exchangeCodeForToken(code);
      
      // Get user info and ad accounts
      const [userInfo, adAccounts] = await Promise.all([
        FacebookService.getUserInfo(accessToken),
        FacebookService.getAdAccounts(accessToken)
      ]);
      
      if (adAccounts.length === 0) {
        return res.status(400).json({ 
          error: 'No ad accounts found. Please make sure you have access to at least one Facebook Ad Account.' 
        });
      }
      
      // Store encrypted token
      const encryptedToken = FacebookService.encryptToken(accessToken);
      
      // Use first ad account (or let user select in future enhancement)
      const selectedAccount = adAccounts[0];
      
      // userId was passed as state parameter
      await prisma.facebookAccount.upsert({
        where: { userId },
        create: {
          userId,
          facebookUserId: userInfo.id,
          accessToken: encryptedToken,
          tokenExpiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
          adAccountId: selectedAccount.id,
          adAccountName: selectedAccount.name,
          lastSyncAt: new Date()
        },
        update: {
          facebookUserId: userInfo.id,
          accessToken: encryptedToken,
          tokenExpiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
          adAccountId: selectedAccount.id,
          adAccountName: selectedAccount.name,
          lastSyncAt: new Date(),
          isActive: true
        }
    });
    
    // Redirect back to frontend settings page with success
    return res.redirect(`${process.env.FRONTEND_URL}/settings?facebook=connected`);
  } catch (error: any) {
    console.error('[Facebook OAuth] Callback error:', error);
    return res.redirect(`${process.env.FRONTEND_URL}/settings?error=connection_failed&message=${encodeURIComponent(error.message || 'Unknown error')}`);
  }
});

/**
 * GET /api/facebook/status
 * Get connected Facebook account status
 */
router.get('/status', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const account = await prisma.facebookAccount.findUnique({
      where: { userId: req.user!.id }
    });
    
    if (!account || !account.isActive) {
      return res.json({
        connected: false,
        account: null
      });
    }
    
    // Check if token is still valid
    const isTokenValid = account.tokenExpiresAt > new Date();
    
    res.json({
      connected: isTokenValid,
      account: {
        adAccountId: account.adAccountId,
        adAccountName: account.adAccountName,
        lastSyncAt: account.lastSyncAt,
        tokenExpiring: account.tokenExpiresAt < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Expires in < 7 days
      }
    });
  } catch (error: any) {
    console.error('Facebook status error:', error);
    res.status(500).json({ error: 'Failed to check Facebook account status' });
  }
});

/**
 * DELETE /api/facebook/disconnect
 * Disconnect Facebook account
 */
router.delete('/disconnect', authenticate, async (req: AuthRequest, res: Response) => {
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
router.get('/ads', authenticate, async (req: AuthRequest, res: Response) => {
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
router.get('/ad/:adId', authenticate, async (req: AuthRequest, res: Response) => {
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
router.post('/refresh-token', authenticate, async (req: AuthRequest, res: Response) => {
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

export default router;
