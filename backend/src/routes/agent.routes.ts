import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { clerkAuth } from '../middleware/clerkAuth';
import { AuthRequest } from '../middleware/auth';
import { checkCampaignUsageLimit } from '../middleware/usageLimit';
import { AgentService } from '../services/agent.service';
import { IntelligentAnalysisService } from '../services/intelligentAnalysis.service';
import { upload } from '../middleware/upload';
import { prisma } from '../lib/prisma';
import { validateAgentScan, validateAgentObjective, validateAgentAudience, validateAgentBudget } from '../middleware/validation';

const router = Router();

/**
 * 🔍 STEP 1: SCAN BUSINESS (POST /api/agent/scan)
 * NEW: Accepts 3-field input (description, location?, website?)
 * LEGACY: Still supports { url } OR { manualInput } for backward compatibility
 * Output: { taskId: "...", businessData: { ... } }
 */
router.post('/scan', ...clerkAuth, validateAgentScan, checkCampaignUsageLimit('AI_AGENT'), async (req: AuthRequest, res: Response) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { description, location, website, url, manualInput } = req.body;
    const userId = req.user!.id;

    // FEATURE GATE: AI Agent is GROWTH-only
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { plan: true } });
    if (!user || (user.plan !== 'GROWTH')) {
      return res.status(403).json({
        success: false,
        error: 'AI_AGENT_LOCKED',
        message: user?.plan === 'BASIC' 
          ? 'AI Agent is available on GROWTH plan only. Upgrade to unlock smart campaign creation!' 
          : 'AI Agent is available on GROWTH plan. Upgrade from FREE to unlock!',
        requiresUpgrade: true,
        currentPlan: user?.plan || 'FREE',
        upgradeTo: 'GROWTH'
      });
    }

    // NEW FLOW: 3-field intelligent analysis
    if (description) {
      try {
        // Step 1: Validate location requirement (will throw if LOCAL business without location)
        const validation = await IntelligentAnalysisService.validateLocationRequirement(
          description,
          location
        );

        if (!validation.valid) {
          return res.status(400).json({ 
            error: validation.error,
            requiresLocation: true,
            businessType: validation.businessType
          });
        }

        // Step 2: Perform intelligent analysis
        const analysis = await IntelligentAnalysisService.analyze({
          description,
          location,
          website
        });

        // Step 3: Create task and store data
        const task = await prisma.agentTask.create({
          data: {
            userId,
            type: 'CREATE_AD',
            status: 'PENDING',
            createdVia: 'AI_AGENT',
            conversationState: 'STRATEGY_GENERATION',
            businessProfile: JSON.stringify(analysis)
          }
        });

        // Step 4: Return success with extracted data
        return res.json({
          taskId: task.id,
          success: true,
          businessData: {
            brandName: analysis.brandName,
            description: analysis.description,
            industry: analysis.industry,
            products: analysis.products,
            usps: analysis.usps,
            targetAudience: analysis.targetAudience,
            location: analysis.location,
            businessType: analysis.businessType,
            confidence: analysis.confidence,
            source: 'intelligent_analysis'
          },
          message: `✅ Got it! You run ${analysis.brandName} in the ${analysis.industry} industry. I've analyzed your target audience and location. Let's create your campaign!`
        });
      } catch (error: any) {
        console.error('[Agent Scan] Intelligent analysis error:', error);
        return res.status(400).json({ 
          error: error.message || 'Failed to analyze business description',
          requiresLocation: error.message?.includes('specify your city')
        });
      }
    }

    // LEGACY FLOW: URL or manual input (keep for backward compatibility)
    if (!url && !manualInput) {
      return res.status(400).json({ 
        error: 'Either description (recommended) or url/manualInput is required' 
      });
    }

    const agentService = new AgentService();
    const result = await agentService.startBusinessScan(userId, url, manualInput);
    
    res.json(result);
  } catch (error: any) {
    console.error('Scan Error:', error);
    res.status(500).json({ error: error.message || 'Failed to scan business' });
  }
});

/**
 * 🧠 STEP 2: GENERATE STRATEGY (POST /api/agent/strategy)
 * Input: { taskId: "...", userGoal?: "Get more leads", conversionMethod?: "lead_form" | "website", objective?: "TRAFFIC" | "LEADS" | "SALES", budget?: number }
 * Output: { strategy: { budget, targeting, copy... } }
 */
router.post('/strategy', ...clerkAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { taskId, userGoal, conversionMethod, objective, budget } = req.body;
    
    if (!taskId) {
      return res.status(400).json({ error: 'Task ID is required' });
    }

    // Default to lead_form if not specified
    const method = conversionMethod === 'website' ? 'website' : 'lead_form';

    const agentService = new AgentService();
    const result = await agentService.generateStrategy(
      taskId, 
      req.user!.id, 
      userGoal, 
      method,
      objective,
      budget
    );
    
    res.json(result);
  } catch (error: any) {
    console.error('[Agent Route] Strategy generation failed:', {
      message: error.message,
      stack: error.stack,
      status: error.status,
      code: error.code
    });
    res.status(500).json({ error: error.message || 'Failed to generate strategy' });
  }
});

/**
 * 🚀 STEP 3: LAUNCH CAMPAIGN (POST /api/agent/launch)
 * Input: { taskId: "...", imageFile: File, leadFormId?: string }
 * Output: { success: true, campaignId: "...", adId: "..." }
 */
router.post(
  '/launch',
  ...clerkAuth,
  upload.single('image'),
  async (req: AuthRequest, res: Response) => {
    try {
      const { taskId, leadFormId } = req.body;

      if (!taskId) {
        return res.status(400).json({ error: 'Task ID is required' });
      }

      // Check if campaign already launched (idempotency)
      const existingTask = await prisma.agentTask.findUnique({
        where: { id: taskId, userId: req.user!.id },
        select: { fbCampaignId: true, fbAdId: true }
      });

      if (existingTask && existingTask.fbCampaignId) {
        console.log('[Launch] Campaign already exists for task:', taskId);
        return res.status(409).json({ 
          error: 'ALREADY_LAUNCHED',
          message: 'This campaign has already been launched. Refresh the page to see the latest status.',
          campaignId: existingTask.fbCampaignId,
          adId: existingTask.fbAdId
        });
      }

      // Get image URL if uploaded
      let imageUrl: string | undefined;
      if (req.file) {
        imageUrl = `/uploads/${req.file.filename}`;
      }

      const agentService = new AgentService();
      const result = await agentService.launchCampaign(
        taskId, 
        req.user!.id, 
        imageUrl,
        leadFormId || undefined
      );
      
      // Increment usage counter on successful launch
      await prisma.user.update({
        where: { id: req.user!.id },
        data: {
          agentTasksCreated: { increment: 1 }
        }
      });

      res.json(result);
    } catch (error: any) {
      console.error('Launch Error:', error);
      
      // Handle structured Facebook errors
      if (error.type) {
        return res.status(400).json({ 
          error: error.message,
          type: error.type,
          action: error.action,
          helpUrl: error.helpUrl,
          retryable: error.retryable
        });
      }
      
      // Generic error
      res.status(500).json({ error: error.message || 'Failed to launch campaign' });
    }
  }
);

/**
 * GET /api/agent/tasks - Get user's task history
 */
router.get('/tasks', ...clerkAuth, async (req: AuthRequest, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    
    const tasks = await prisma.agentTask.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        generatedCreatives: true
      }
    });

    res.json({ tasks });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

/**
 * GET /api/agent/task/:taskId - Get specific task details
 */
router.get('/task/:taskId', ...clerkAuth, async (req: AuthRequest, res: Response) => {
  try {
    const task = await prisma.agentTask.findUnique({
      where: { 
        id: req.params.taskId,
        userId: req.user!.id
      },
      include: {
        generatedCreatives: true
      }
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({ task });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ error: 'Failed to fetch task' });
  }
});

/**
 * DELETE /api/agent/task/:taskId - Delete a task
 */
router.delete('/task/:taskId', ...clerkAuth, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.agentTask.delete({
      where: { 
        id: req.params.taskId,
        userId: req.user!.id
      }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

/**
 * GET /api/agent/usage - Get current usage stats
 */
router.get('/usage', ...clerkAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        plan: true,
        agentTasksCreated: true,
        agentLastResetDate: true,
        planExpiresAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Calculate correct limits: FREE=2, BASIC=10, GROWTH=25
    const limit = user.plan === 'GROWTH' ? 25 : user.plan === 'BASIC' ? 10 : 2;
    
    // Calculate next reset date (30 days from last reset)
    const nextReset = new Date(user.agentLastResetDate);
    nextReset.setDate(nextReset.getDate() + 30);

    res.json({
      used: user.agentTasksCreated,
      limit,
      remaining: Math.max(0, limit - user.agentTasksCreated),
      plan: user.plan, // Return actual plan: FREE, BASIC, or GROWTH
      resetsAt: nextReset.toISOString(),
      proExpiresAt: user.planExpiresAt ? user.planExpiresAt.toISOString() : null
    });
  } catch (error) {
    console.error('Get usage error:', error);
    res.status(500).json({ error: 'Failed to fetch usage' });
  }
});

/**
 * POST /api/agent/select-variant - Update selected creative variant
 */
router.post(
  '/select-variant',
  ...clerkAuth,
  [
    body('taskId').notEmpty().withMessage('Task ID is required'),
    body('creativeId').notEmpty().withMessage('Creative ID is required'),
    body('type').notEmpty().withMessage('Type is required')
  ],
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { taskId, creativeId, type } = req.body;
      
      // Verify task belongs to user
      const task = await prisma.agentTask.findUnique({
        where: { id: taskId, userId: req.user!.id }
      });

      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }

      // Unselect all variants of this type for this task
      await prisma.generatedCreative.updateMany({
        where: { taskId, type },
        data: { isSelected: false }
      });

      // Select the specified variant
      await prisma.generatedCreative.update({
        where: { id: creativeId },
        data: { isSelected: true }
      });

      res.json({ message: 'Variant selected successfully' });
    } catch (error: any) {
      console.error('Variant selection error:', error);
      res.status(500).json({ error: error.message || 'Failed to select variant' });
    }
  }
);

/**
 * POST /api/agent/sync-active - Bulk sync performance for all active campaigns
 * Fetches metrics only for COMPLETED tasks with FB Ad IDs to save API calls
 */
router.post('/sync-active', ...clerkAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    
    // Get Facebook credentials
    const fbAccount = await prisma.facebookAccount.findUnique({
      where: { userId }
    });

    if (!fbAccount) {
      return res.status(404).json({ error: 'Facebook account not connected' });
    }

    // Find all COMPLETED tasks with Facebook Ad IDs
    const tasks = await prisma.agentTask.findMany({
      where: {
        userId,
        status: 'COMPLETED',
        fbAdId: { not: null }
      },
      select: {
        id: true,
        fbAdId: true,
        output: true
      }
    });

    if (tasks.length === 0) {
      return res.json({ 
        message: 'No active campaigns to sync',
        synced: 0,
        failed: 0
      });
    }

    // Fetch all ads with insights from Facebook in one call
    const { FacebookService } = require('../services/facebook.service');
    const accessToken = FacebookService.decryptToken(fbAccount.accessToken);
    const allAds = await FacebookService.getActiveAds(accessToken, fbAccount.adAccountId, 1000);

    let synced = 0;
    let failed = 0;

    // Update each task with latest performance data
    for (const task of tasks) {
      try {
        const targetAd = allAds.find((ad: any) => ad.id === task.fbAdId);
        
        if (!targetAd || !targetAd.insights?.data?.[0]) {
          failed++;
          continue;
        }

        const insights = targetAd.insights.data[0];
        const cpm = parseFloat(insights.cpm || '0');
        const ctr = parseFloat(insights.ctr || '0');
        const conversions = parseInt(insights.conversions || '0', 10);
        
        // Calculate performance grade
        let grade = 'PENDING';
        if (ctr >= 2.0 && cpm <= 100) {
          grade = 'EXCELLENT';
        } else if (ctr >= 1.5 && cpm <= 150) {
          grade = 'GOOD';
        } else if (ctr >= 1.0 && cpm <= 200) {
          grade = 'AVERAGE';
        } else {
          grade = 'POOR';
        }

        // Update task
        const output = task.output ? JSON.parse(task.output) : {};
        await prisma.agentTask.update({
          where: { id: task.id },
          data: {
            fbCampaignId: output.fbCampaignId || null,
            fbAdSetId: output.fbAdSetId || null,
            actualCPM: cpm,
            actualCTR: ctr,
            actualConversions: conversions,
            actualSpend: parseFloat(insights.spend || '0'),
            impressions: parseInt(insights.impressions || '0', 10),
            clicks: parseInt(insights.clicks || '0', 10),
            performanceGrade: grade,
            fbInsightsData: JSON.stringify(insights),
            lastPerformanceSync: new Date()
          }
        });

        synced++;
      } catch (err) {
        console.error(`Failed to sync task ${task.id}:`, err);
        failed++;
      }
    }

    res.json({
      message: `Synced ${synced} campaigns successfully`,
      synced,
      failed,
      total: tasks.length
    });
  } catch (error: any) {
    console.error('Bulk sync error:', error);
    res.status(500).json({ error: error.message || 'Failed to sync campaigns' });
  }
});

/**
 * POST /api/agent/track-performance - Save campaign performance metrics
 * Updates AgentTask with actual performance data from Meta for future AI learning
 */
router.post(
  '/track-performance',
  ...clerkAuth,
  [
    body('taskId').notEmpty().withMessage('Task ID is required')
  ],
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { taskId } = req.body;
      const userId = req.user!.id;
      
      // Verify task belongs to user
      const task = await prisma.agentTask.findUnique({
        where: { id: taskId, userId }
      });

      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }

      // Get Facebook credentials
      const fbAccount = await prisma.facebookAccount.findUnique({
        where: { userId }
      });

      if (!fbAccount) {
        return res.status(404).json({ error: 'Facebook account not connected' });
      }

      // Parse campaign output to get FB IDs
      const output = task.output ? JSON.parse(task.output) : {};
      const fbAdId = output.fbAdId;

      if (!fbAdId) {
        return res.status(400).json({ error: 'No Facebook Ad ID found for this campaign' });
      }

      // Fetch performance metrics from Facebook
      const { FacebookService } = require('../services/facebook.service');
      const accessToken = FacebookService.decryptToken(fbAccount.accessToken);
      
      // Get ad with insights
      const ads = await FacebookService.getActiveAds(accessToken, fbAccount.adAccountId, 1000);
      const targetAd = ads.find((ad: any) => ad.id === fbAdId);

      if (!targetAd || !targetAd.insights?.data?.[0]) {
        return res.status(404).json({ error: 'No performance data available yet. Try again in 24 hours.' });
      }

      const insights = targetAd.insights.data[0];
      
      // Calculate performance grade
      const cpm = parseFloat(insights.cpm || '0');
      const ctr = parseFloat(insights.ctr || '0');
      const conversions = parseInt(insights.conversions || '0', 10);
      
      let grade = 'PENDING';
      if (ctr >= 2.0 && cpm <= 100) {
        grade = 'EXCELLENT';
      } else if (ctr >= 1.5 && cpm <= 150) {
        grade = 'GOOD';
      } else if (ctr >= 1.0 && cpm <= 200) {
        grade = 'AVERAGE';
      } else {
        grade = 'POOR';
      }

      // Update task with performance data
      await prisma.agentTask.update({
        where: { id: taskId },
        data: {
          fbAdId,
          fbCampaignId: output.fbCampaignId || null,
          fbAdSetId: output.fbAdSetId || null,
          actualCPM: cpm,
          actualCTR: ctr,
          actualConversions: conversions,
          actualSpend: parseFloat(insights.spend || '0'),
          impressions: parseInt(insights.impressions || '0', 10),
          clicks: parseInt(insights.clicks || '0', 10),
          performanceGrade: grade,
          fbInsightsData: JSON.stringify(insights),
          lastPerformanceSync: new Date()
        }
      });

      res.json({
        message: 'Performance tracked successfully',
        performance: {
          cpm,
          ctr,
          conversions,
          spend: parseFloat(insights.spend || '0'),
          impressions: parseInt(insights.impressions || '0', 10),
          clicks: parseInt(insights.clicks || '0', 10),
          grade
        }
      });
    } catch (error: any) {
      console.error('Performance tracking error:', error);
      res.status(500).json({ error: error.message || 'Failed to track performance' });
    }
  }
);

/**
 * DEBUG ENDPOINT - Test if Clerk auth is working at all
 */
router.get('/debug-auth', ...clerkAuth, async (req: AuthRequest, res: Response) => {
  res.json({
    success: true,
    message: 'Clerk auth is working!',
    userId: req.user?.id,
    email: req.user?.email,
    clerkId: req.user?.clerkId,
    timestamp: new Date().toISOString()
  });
});

export default router;
