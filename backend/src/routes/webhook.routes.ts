import { Router, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import { clerkAuth } from '../middleware/clerkAuth';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';
import { WebhookService } from '../services/webhook.service';

const router = Router();

// Middleware to check if user has GROWTH plan (webhooks feature)
const requireGrowthPlan = async (req: AuthRequest, res: Response, next: Function) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: { plan: true },
  });

  if (user?.plan !== 'GROWTH') {
    return res.status(403).json({
      error: 'WEBHOOKS_LOCKED',
      message: 'Webhooks are available on GROWTH plan only. Upgrade to unlock integrations with 5,000+ apps.',
    });
  }

  next();
};

/**
 * GET /api/webhooks - Get all webhooks for current user
 */
router.get('/', ...clerkAuth, requireGrowthPlan, async (req: AuthRequest, res: Response) => {
  try {
    const webhooks = await prisma.webhookEndpoint.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: webhooks });
  } catch (error: any) {
    console.error('Get webhooks error:', error);
    res.status(500).json({ error: 'Failed to fetch webhooks' });
  }
});

/**
 * POST /api/webhooks - Create new webhook
 */
router.post(
  '/',
  ...clerkAuth,
  requireGrowthPlan,
  [
    body('url').isURL().withMessage('Valid URL is required'),
    body('events')
      .isArray({ min: 1 })
      .withMessage('At least one event must be selected'),
    body('events.*')
      .isIn(['campaign.created', 'campaign.completed', 'campaign.failed', 'lead.captured', 'performance.updated'])
      .withMessage('Invalid event type'),
    body('description').optional().isString().isLength({ max: 200 }),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { url, events, description } = req.body;

      // Check webhook limit (max 5 webhooks per user)
      const existingCount = await prisma.webhookEndpoint.count({
        where: { userId: req.user!.id },
      });

      if (existingCount >= 5) {
        return res.status(400).json({
          error: 'Maximum 5 webhooks allowed per account',
        });
      }

      // Generate webhook secret
      const secret = WebhookService.generateSecret();

      // Create webhook
      const webhook = await prisma.webhookEndpoint.create({
        data: {
          userId: req.user!.id,
          url,
          events,
          secret,
          description,
        },
      });

      console.log(`[Webhooks] Created webhook for user ${req.user!.email}: ${url}`);

      res.json({
        success: true,
        data: webhook,
        message: 'Webhook created successfully',
      });
    } catch (error: any) {
      console.error('Create webhook error:', error);
      res.status(500).json({ error: 'Failed to create webhook' });
    }
  }
);

/**
 * PATCH /api/webhooks/:id - Update webhook
 */
router.patch(
  '/:id',
  ...clerkAuth,
  requireGrowthPlan,
  [
    param('id').isUUID().withMessage('Invalid webhook ID'),
    body('url').optional().isURL().withMessage('Valid URL is required'),
    body('events')
      .optional()
      .isArray({ min: 1 })
      .withMessage('At least one event must be selected'),
    body('isActive').optional().isBoolean(),
    body('description').optional().isString().isLength({ max: 200 }),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const { url, events, isActive, description } = req.body;

      // Check ownership
      const existing = await prisma.webhookEndpoint.findFirst({
        where: { id, userId: req.user!.id },
      });

      if (!existing) {
        return res.status(404).json({ error: 'Webhook not found' });
      }

      // Update webhook
      const webhook = await prisma.webhookEndpoint.update({
        where: { id },
        data: {
          ...(url && { url }),
          ...(events && { events }),
          ...(isActive !== undefined && { isActive }),
          ...(description !== undefined && { description }),
        },
      });

      res.json({
        success: true,
        data: webhook,
        message: 'Webhook updated successfully',
      });
    } catch (error: any) {
      console.error('Update webhook error:', error);
      res.status(500).json({ error: 'Failed to update webhook' });
    }
  }
);

/**
 * DELETE /api/webhooks/:id - Delete webhook
 */
router.delete(
  '/:id',
  ...clerkAuth,
  requireGrowthPlan,
  param('id').isUUID().withMessage('Invalid webhook ID'),
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;

      // Check ownership
      const existing = await prisma.webhookEndpoint.findFirst({
        where: { id, userId: req.user!.id },
      });

      if (!existing) {
        return res.status(404).json({ error: 'Webhook not found' });
      }

      // Delete webhook (deliveries will cascade delete)
      await prisma.webhookEndpoint.delete({
        where: { id },
      });

      console.log(`[Webhooks] Deleted webhook ${id} for user ${req.user!.email}`);

      res.json({
        success: true,
        message: 'Webhook deleted successfully',
      });
    } catch (error: any) {
      console.error('Delete webhook error:', error);
      res.status(500).json({ error: 'Failed to delete webhook' });
    }
  }
);

/**
 * POST /api/webhooks/:id/test - Test webhook
 */
router.post(
  '/:id/test',
  ...clerkAuth,
  requireGrowthPlan,
  param('id').isUUID().withMessage('Invalid webhook ID'),
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;

      // Test webhook
      await WebhookService.testWebhook(id, req.user!.id);

      res.json({
        success: true,
        message: 'Test webhook sent successfully',
      });
    } catch (error: any) {
      console.error('Test webhook error:', error);
      res.status(400).json({
        error: 'Webhook test failed',
        message: error.message || 'Failed to deliver test webhook',
      });
    }
  }
);

/**
 * GET /api/webhooks/:id/deliveries - Get delivery logs for a webhook
 */
router.get(
  '/:id/deliveries',
  ...clerkAuth,
  requireGrowthPlan,
  param('id').isUUID().withMessage('Invalid webhook ID'),
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;

      // Check ownership
      const webhook = await prisma.webhookEndpoint.findFirst({
        where: { id, userId: req.user!.id },
      });

      if (!webhook) {
        return res.status(404).json({ error: 'Webhook not found' });
      }

      // Get recent deliveries (last 50)
      const deliveries = await prisma.webhookDelivery.findMany({
        where: { webhookId: id },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });

      res.json({ success: true, data: deliveries });
    } catch (error: any) {
      console.error('Get deliveries error:', error);
      res.status(500).json({ error: 'Failed to fetch delivery logs' });
    }
  }
);

/**
 * POST /api/webhooks/:id/regenerate-secret - Regenerate webhook secret
 */
router.post(
  '/:id/regenerate-secret',
  ...clerkAuth,
  requireGrowthPlan,
  param('id').isUUID().withMessage('Invalid webhook ID'),
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;

      // Check ownership
      const existing = await prisma.webhookEndpoint.findFirst({
        where: { id, userId: req.user!.id },
      });

      if (!existing) {
        return res.status(404).json({ error: 'Webhook not found' });
      }

      // Generate new secret
      const newSecret = WebhookService.generateSecret();

      // Update webhook
      const webhook = await prisma.webhookEndpoint.update({
        where: { id },
        data: { secret: newSecret },
      });

      console.log(`[Webhooks] Regenerated secret for webhook ${id}`);

      res.json({
        success: true,
        data: { secret: webhook.secret },
        message: 'Webhook secret regenerated successfully',
      });
    } catch (error: any) {
      console.error('Regenerate secret error:', error);
      res.status(500).json({ error: 'Failed to regenerate secret' });
    }
  }
);

export default router;
