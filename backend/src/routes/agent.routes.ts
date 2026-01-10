import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate, AuthRequest } from '../middleware/auth';
import { AgentService } from '../services/agent.service';
import { upload } from '../middleware/upload';
import { Sanitizer } from '../utils/sanitizer';

const router = Router();

/**
 * POST /api/agent/start
 * Initialize a new AI agent task
 */
router.post('/start', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const result = await AgentService.startTask(req.user!.id);
    res.json(result);
  } catch (error: any) {
    console.error('Agent start error:', error);
    res.status(500).json({ error: error.message || 'Failed to start agent' });
  }
});

/**
 * POST /api/agent/message
 * Send a message to the agent and get response
 */
router.post(
  '/message',
  authenticate,
  [
    body('taskId').notEmpty().withMessage('Task ID is required'),
    body('message').notEmpty().withMessage('Message is required')
  ],
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { taskId } = req.body;
      
      // Sanitize user message to prevent XSS
      const message = Sanitizer.sanitizeMessage(req.body.message);
      
      if (!message || message.trim().length === 0) {
        return res.status(400).json({ error: 'Message cannot be empty' });
      }
      
      const result = await AgentService.processMessage(taskId, req.user!.id, message);
      res.json(result);
    } catch (error: any) {
      console.error('Agent message error:', error);
      res.status(500).json({ error: error.message || 'Failed to process message' });
    }
  }
);

/**
 * POST /api/agent/create-ad
 * Execute ad creation on Facebook
 */
router.post(
  '/create-ad',
  authenticate,
  upload.single('creative'),
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
      
      // Get creative URL if uploaded
      let creativeUrl: string | undefined;
      if (req.file) {
        creativeUrl = `/uploads/${req.file.filename}`;
      }

      const result = await AgentService.createAdOnFacebook(
        taskId,
        req.user!.id,
        creativeUrl
      );
      
      res.json(result);
    } catch (error: any) {
      console.error('Agent ad creation error:', error);
      res.status(500).json({ error: error.message || 'Failed to create ad' });
    }
  }
);

/**
 * GET /api/agent/tasks
 * Get user's agent task history
 */
router.get('/tasks', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const tasks = await AgentService.getTaskHistory(req.user!.id, limit);
    res.json({ tasks });
  } catch (error: any) {
    console.error('Agent tasks error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch tasks' });
  }
});

/**
 * POST /api/agent/select-variant
 * Update which variant is selected for the ad
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
      
      // Import prisma here to avoid circular dependencies
      const { prisma } = await import('../lib/prisma');
      
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
      console.error('Agent variant selection error:', error);
      res.status(500).json({ error: error.message || 'Failed to select variant' });
    }
  }
);

/**
 * DELETE /api/agent/task/:taskId
 * Delete an agent task
 */
router.delete('/task/:taskId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { taskId } = req.params;
    
    const { prisma } = await import('../lib/prisma');
    
    // Verify task belongs to user
    const task = await prisma.agentTask.findUnique({
      where: { id: taskId, userId: req.user!.id }
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    await prisma.agentTask.delete({
      where: { id: taskId }
    });

    res.json({ message: 'Task deleted successfully' });
  } catch (error: any) {
    console.error('Agent task deletion error:', error);
    res.status(500).json({ error: error.message || 'Failed to delete task' });
  }
});

export default router;
