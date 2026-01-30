import { Router, Response, Request } from 'express';
import { body, validationResult } from 'express-validator';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { prisma } from '../lib/prisma';
import { clerkAuth } from '../middleware/clerkAuth';
import { AuthRequest } from '../middleware/auth';
import * as Sentry from '@sentry/node';

const router = Router();

// Initialize Razorpay only if credentials are provided
const razorpay = process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
  ? new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    })
  : null;

const PLANS = {
  BASIC_MONTHLY: {
    amount: 149900, // ₹1,499 in paise
    currency: 'INR',
    name: 'Basic Plan - Monthly (10 campaigns, templates only)',
    duration: 30, // days
    planType: 'BASIC'
  },
  GROWTH_MONTHLY: {
    amount: 199900, // ₹1,999 in paise
    currency: 'INR',
    name: 'Growth Plan - Monthly (25 campaigns, AI Agent included)',
    duration: 30, // days
    planType: 'GROWTH'
  }
};

// Create order / subscription
router.post(
  '/create-order',
  ...clerkAuth,
  [body('plan').isIn(['BASIC_MONTHLY', 'GROWTH_MONTHLY'])],
  async (req: AuthRequest, res: Response) => {
    return await Sentry.startSpan({ op: 'payment', name: 'Create Razorpay Order' }, async () => {
      try {
        if (!razorpay) {
          return res.status(503).json({
            success: false,
            message: 'Payment service is not configured'
          });
        }

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { plan } = req.body;
        const planDetails = PLANS[plan as keyof typeof PLANS];

        Sentry.setContext('payment', {
          plan,
          amount: planDetails.amount,
          currency: planDetails.currency,
        });

        // Create one-time order for both monthly and annual plans
        const order = await razorpay.orders.create({
          amount: planDetails.amount,
          currency: planDetails.currency,
          receipt: `order_${Date.now()}`,
          notes: {
            userId: req.user!.id,
            plan,
          },
        });

        await prisma.payment.create({
          data: {
            userId: req.user!.id,
            razorpayOrderId: order.id,
            amount: planDetails.amount,
            currency: planDetails.currency,
            plan: 'GROWTH',
            status: 'PENDING',
          },
        });

        Sentry.addBreadcrumb({
          category: 'payment',
          message: 'Razorpay order created',
          level: 'info',
          data: { orderId: order.id, plan },
        });

        res.json({
          success: true,
          data: {
            orderId: order.id,
            amount: planDetails.amount,
            currency: planDetails.currency,
            keyId: process.env.RAZORPAY_KEY_ID,
            mode: 'order',
            planDuration: planDetails.duration,
          },
        });
      } catch (error) {
        console.error('Create order error:', error);
        
        Sentry.captureException(error, {
          tags: {
            service: 'razorpay',
            operation: 'create_order',
          },
        });
        
        res.status(500).json({ success: false, message: 'Failed to create order' });
      }
    });
  }
);

// Verify payment
router.post(
  '/verify',
  ...clerkAuth,
  [
    body('razorpay_payment_id').notEmpty(),
    body('razorpay_signature').notEmpty(),
    body().custom((value) => {
      if (!value.razorpay_order_id && !value.razorpay_subscription_id) {
        throw new Error('Either razorpay_order_id or razorpay_subscription_id is required');
      }
      return true;
    }),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      if (!razorpay || !process.env.RAZORPAY_KEY_SECRET) {
        return res.status(503).json({
          success: false,
          message: 'Payment service is not configured'
        });
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const {
        razorpay_order_id,
        razorpay_subscription_id,
        razorpay_payment_id,
        razorpay_signature
      } = req.body;

      // Determine mode
      const isSubscription = Boolean(razorpay_subscription_id);
      const entityId = razorpay_subscription_id || razorpay_order_id;

      // Verify signature
      const signPayload = isSubscription
        ? `${razorpay_subscription_id}|${razorpay_payment_id}`
        : `${razorpay_order_id}|${razorpay_payment_id}`;

      const expectedSign = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(signPayload)
        .digest('hex');

      if (razorpay_signature !== expectedSign) {
        return res.status(400).json({
          success: false,
          message: 'Invalid payment signature'
        });
      }

      // Update payment record (we store subscriptionId in razorpayOrderId for subscriptions)
      const payment = await prisma.payment.update({
        where: { razorpayOrderId: entityId },
        data: {
          razorpayPaymentId: razorpay_payment_id,
          status: 'COMPLETED'
        }
      });

      // Determine expiry based on plan duration
      // Monthly: 30 days
      const { plan: planType } = req.body;
      const planDetails = PLANS[planType as keyof typeof PLANS];
      const planExpiresAt = new Date(Date.now() + planDetails.duration * 24 * 60 * 60 * 1000);
        
      await prisma.user.update({
        where: { id: req.user!.id },
        data: { 
          plan: planDetails.planType, // BASIC or GROWTH
          planExpiresAt,
          apiUsageCount: 0, // Reset usage count on upgrade
          agentTasksCreated: 0, // Reset campaign count
          agentLastResetDate: new Date() // Start billing cycle from payment date
        }
      });

      res.json({
        success: true,
        message: 'Payment verified successfully',
        data: { plan: planDetails.planType, expiresAt: planExpiresAt }
      });
    } catch (error) {
      console.error('Verify payment error:', error);
      res.status(500).json({ success: false, message: 'Payment verification failed' });
    }
  }
);

// Get payment history
router.get('/history', ...clerkAuth, async (req: AuthRequest, res) => {
  try {
    const payments = await prisma.payment.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, data: payments });
  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({ success: false, message: 'Failed to get payment history' });
  }
});

/**
 * POST /api/payments/webhook
 * Handle Razorpay webhooks for payment events
 * This ensures payment is recorded even if browser closes before callback
 * SECURITY: 
 * - Validates webhook signature before processing
 * - Implements idempotency to prevent replay attacks
 * - Validates timestamp to reject old webhooks (prevents replay)
 */
router.post('/webhook', async (req: Request, res: Response) => {
  try {
    if (!process.env.RAZORPAY_WEBHOOK_SECRET) {
      console.error('[Payment Webhook] RAZORPAY_WEBHOOK_SECRET not configured');
      return res.status(503).json({ error: 'Webhook not configured' });
    }

    // Verify webhook signature
    const webhookSignature = req.headers['x-razorpay-signature'] as string;
    if (!webhookSignature) {
      console.error('[Payment Webhook] Missing signature header');
      return res.status(400).json({ error: 'Missing signature' });
    }

    // Razorpay sends webhook body as JSON string
    const webhookBody = JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(webhookBody)
      .digest('hex');

    if (webhookSignature !== expectedSignature) {
      console.error('[Payment Webhook] Invalid signature');
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const { event, payload } = req.body;
    const webhookId = payload.payment?.entity?.id || `${event}-${Date.now()}`;
    const webhookTimestamp = payload.payment?.entity?.created_at;

    // SECURITY: Validate webhook timestamp (reject if older than 5 minutes)
    if (webhookTimestamp) {
      const webhookAge = Date.now() / 1000 - webhookTimestamp;
      if (webhookAge > 300) { // 5 minutes
        console.error('[Payment Webhook] Webhook too old, possible replay attack:', webhookAge);
        return res.status(400).json({ error: 'Webhook expired' });
      }
    }

    // SECURITY: Check idempotency - prevent processing same webhook twice
    // Use razorpayPaymentId as idempotency key (unique per payment)
    if (event === 'payment.captured') {
      const paymentId = payload.payment.entity.id;
      const existingPayment = await prisma.payment.findFirst({
        where: { razorpayPaymentId: paymentId }
      });

      if (existingPayment && existingPayment.status === 'COMPLETED') {
        console.log('[Payment Webhook] Idempotency: Payment already processed:', paymentId);
        return res.json({ success: true, message: 'Already processed (idempotent)' });
      }
    }

    // Handle payment.captured event (successful payment)
    if (event === 'payment.captured') {
      const paymentEntity = payload.payment.entity;
      const orderId = paymentEntity.order_id;
      const paymentId = paymentEntity.id;
      const amount = paymentEntity.amount;

      // Find payment record
      const payment = await prisma.payment.findUnique({
        where: { razorpayOrderId: orderId }
      });

      if (!payment) {
        return res.status(404).json({ error: 'Payment not found' });
      }

      // Update payment status (atomic operation)
      await prisma.payment.update({
        where: { razorpayOrderId: orderId },
        data: {
          razorpayPaymentId: paymentId,
          status: 'COMPLETED'
        }
      });

      // Upgrade user based on payment amount
      // Determine plan from payment amount
      const isBasic = amount === 149900; // ₹1,499 = BASIC
      const isGrowth = amount === 199900; // ₹1,999 = GROWTH
      const userPlan = isBasic ? 'BASIC' : isGrowth ? 'GROWTH' : 'FREE';
      const durationDays = 30; // All plans are monthly
      const planExpiresAt = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);

      await prisma.user.update({
        where: { id: payment.userId },
        data: {
          plan: userPlan,
          planExpiresAt,
          agentTasksCreated: 0 // Reset usage count on upgrade
        }
      });

      console.log('[Payment Webhook] User upgraded to', userPlan, ':', payment.userId);
      return res.json({ success: true, message: 'Payment processed' });
    }

    // Handle payment.failed event
    if (event === 'payment.failed') {
      const paymentEntity = payload.payment.entity;
      const orderId = paymentEntity.order_id;

      console.log('[Payment Webhook] Payment failed:', orderId);

      await prisma.payment.update({
        where: { razorpayOrderId: orderId },
        data: { status: 'FAILED' }
      });

      return res.json({ success: true, message: 'Failure recorded' });
    }

    // Acknowledge other events
    res.json({ success: true, message: 'Event received' });
  } catch (error: any) {
    console.error('[Payment Webhook] Error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

export { router as paymentRoutes };
