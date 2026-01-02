import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// Initialize Razorpay only if credentials are provided
const razorpay = process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
  ? new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    })
  : null;

const PLANS = {
  PRO: {
    amount: 99900, // ₹999 in paise
    currency: 'INR',
    name: 'Pro Plan'
  },
  AGENCY: {
    amount: 299900, // ₹2999 in paise
    currency: 'INR',
    name: 'Agency Plan'
  }
};

// Create order
router.post(
  '/create-order',
  authenticate,
  [body('plan').isIn(['PRO', 'AGENCY'])],
  async (req: AuthRequest, res: Response) => {
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

      const order = await razorpay.orders.create({
        amount: planDetails.amount,
        currency: planDetails.currency,
        receipt: `order_${Date.now()}`,
        notes: {
          userId: req.user!.id,
          plan
        }
      });

      // Save payment record
      await prisma.payment.create({
        data: {
          userId: req.user!.id,
          razorpayOrderId: order.id,
          amount: planDetails.amount,
          currency: planDetails.currency,
          plan: plan as 'PRO' | 'AGENCY'
        }
      });

      res.json({
        success: true,
        data: {
          orderId: order.id,
          amount: planDetails.amount,
          currency: planDetails.currency,
          keyId: process.env.RAZORPAY_KEY_ID
        }
      });
    } catch (error) {
      console.error('Create order error:', error);
      res.status(500).json({ success: false, message: 'Failed to create order' });
    }
  }
);

// Verify payment
router.post(
  '/verify',
  authenticate,
  [
    body('razorpay_order_id').notEmpty(),
    body('razorpay_payment_id').notEmpty(),
    body('razorpay_signature').notEmpty()
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
        razorpay_payment_id,
        razorpay_signature
      } = req.body;

      // Verify signature
      const sign = razorpay_order_id + '|' + razorpay_payment_id;
      const expectedSign = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(sign)
        .digest('hex');

      if (razorpay_signature !== expectedSign) {
        return res.status(400).json({
          success: false,
          message: 'Invalid payment signature'
        });
      }

      // Update payment record
      const payment = await prisma.payment.update({
        where: { razorpayOrderId: razorpay_order_id },
        data: {
          razorpayPaymentId: razorpay_payment_id,
          status: 'COMPLETED'
        }
      });

      // Update user plan
      await prisma.user.update({
        where: { id: req.user!.id },
        data: { plan: payment.plan }
      });

      res.json({
        success: true,
        message: 'Payment verified successfully',
        data: { plan: payment.plan }
      });
    } catch (error) {
      console.error('Verify payment error:', error);
      res.status(500).json({ success: false, message: 'Payment verification failed' });
    }
  }
);

// Get payment history
router.get('/history', authenticate, async (req: AuthRequest, res) => {
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

export { router as paymentRoutes };
