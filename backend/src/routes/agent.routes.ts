import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate, AuthRequest } from '../middleware/auth';
import { AgentService } from '../services/agent.service';
import { upload } from '../middleware/upload';
import { prisma } from '../lib/prisma';

const router = Router();

// Middleware: Check agent usage limits (FREE: 5/month, PRO: 50/month)
const checkUsageLimit = async (req: AuthRequest, res: Response, next: any) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { 
        plan: true, 
        agentTasksCreated: true, 
        agentLastResetDate: true,
        proExpiresAt: true 
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if we need to reset monthly counter
    const now = new Date();
    const lastReset = user.agentLastResetDate ? new Date(user.agentLastResetDate) : new Date(0);
    const monthsSinceReset = (now.getFullYear() - lastReset.getFullYear()) * 12 + 
                             (now.getMonth() - lastReset.getMonth());

    if (monthsSinceReset >= 1) {
      // Reset counter at start of new month
      await prisma.user.update({
        where: { id: req.user!.id },
        data: {
          agentTasksCreated: 0,
          agentLastResetDate: now
        }
      });
      user.agentTasksCreated = 0;
    }

    // Check limits
    const isPro = user.plan === 'PRO' && user.proExpiresAt && new Date(user.proExpiresAt) > now;
    const limit = isPro ? 50 : 5;

    if (user.agentTasksCreated >= limit) {
      return res.status(403).json({ 
        error: 'LIMIT_EXCEEDED',
        message: isPro 
          ? `You've reached your PRO limit of ${limit} campaigns this month. Contact support for more.`
          : `You've reached your FREE limit of ${limit} campaigns this month. Upgrade to PRO for 50/month.`,
        limit,
        used: user.agentTasksCreated,
        plan: isPro ? 'PRO' : 'FREE'
      });
    }

    next();
  } catch (error) {
    console.error('Usage limit check error:', error);
    res.status(500).json({ error: 'Failed to check usage limits' });
  }
};

/**
 * 🔍 STEP 1: SCAN BUSINESS (POST /api/agent/scan)
 * Input: { url: "https://my-coaching.com" } OR { manualInput: "I sell..." }
 * Output: { taskId: "...", scrapedData: { ... } }
 */
router.post('/scan', authenticate, checkUsageLimit, async (req: AuthRequest, res: Response) => {
  try {
    const { url, manualInput } = req.body;
    const userId = req.user!.id;

    if (!url && !manualInput) {
      return res.status(400).json({ error: 'URL or manual input is required' });
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
 * Input: { taskId: "...", userGoal?: "Get more leads", conversionMethod?: "lead_form" | "website" }
 * Output: { strategy: { budget, targeting, copy... } }
 */
router.post('/strategy', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { taskId, userGoal, conversionMethod } = req.body;
    
    if (!taskId) {
      return res.status(400).json({ error: 'Task ID is required' });
    }

    // Default to lead_form if not specified
    const method = conversionMethod === 'website' ? 'website' : 'lead_form';

    const agentService = new AgentService();
    const result = await agentService.generateStrategy(taskId, req.user!.id, userGoal, method);
    
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
 * Input: { taskId: "...", imageFile: File }
 * Output: { success: true, campaignId: "...", adId: "..." }
 */
router.post(
  '/launch',
  authenticate,
  upload.single('image'),
  async (req: AuthRequest, res: Response) => {
    try {
      const { taskId } = req.body;

      if (!taskId) {
        return res.status(400).json({ error: 'Task ID is required' });
      }

      // Get image URL if uploaded
      let imageUrl: string | undefined;
      if (req.file) {
        imageUrl = `/uploads/${req.file.filename}`;
      }

      const agentService = new AgentService();
      const result = await agentService.launchCampaign(taskId, req.user!.id, imageUrl);
      
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
      res.status(500).json({ error: error.message || 'Failed to launch campaign' });
    }
  }
);

/**
 * GET /api/agent/tasks - Get user's task history
 */
router.get('/tasks', authenticate, async (req: AuthRequest, res: Response) => {
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
router.get('/task/:taskId', authenticate, async (req: AuthRequest, res: Response) => {
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
router.delete('/task/:taskId', authenticate, async (req: AuthRequest, res: Response) => {
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
router.get('/usage', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        plan: true,
        agentTasksCreated: true,
        agentLastResetDate: true,
        proExpiresAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isPro = user.plan === 'PRO' && user.proExpiresAt && new Date(user.proExpiresAt) > new Date();
    const limit = isPro ? 50 : 5;

    res.json({
      used: user.agentTasksCreated,
      limit,
      remaining: Math.max(0, limit - user.agentTasksCreated),
      plan: isPro ? 'PRO' : 'FREE',
      resetDate: user.agentLastResetDate
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
  authenticate,
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

export default router;
