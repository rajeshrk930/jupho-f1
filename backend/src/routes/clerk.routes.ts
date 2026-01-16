import { Router, Request, Response } from 'express';
import { Webhook } from 'svix';
import { prisma } from '../lib/prisma';

const router = Router();

/**
 * Clerk webhook endpoint for syncing users
 * Handles user.created and user.updated events
 */
router.post('/webhooks/clerk', async (req: Request, res: Response) => {
  try {
    // Get webhook secret from environment
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    
    if (!webhookSecret) {
      console.error('CLERK_WEBHOOK_SECRET not set');
      return res.status(500).json({ error: 'Webhook secret not configured' });
    }

    // Get headers for verification
    const svixId = req.headers['svix-id'] as string;
    const svixTimestamp = req.headers['svix-timestamp'] as string;
    const svixSignature = req.headers['svix-signature'] as string;

    if (!svixId || !svixTimestamp || !svixSignature) {
      return res.status(400).json({ error: 'Missing svix headers' });
    }

    // Verify webhook signature
    const wh = new Webhook(webhookSecret);
    let evt;

    try {
      evt = wh.verify(JSON.stringify(req.body), {
        'svix-id': svixId,
        'svix-timestamp': svixTimestamp,
        'svix-signature': svixSignature,
      }) as any;
    } catch (err) {
      console.error('Webhook verification failed:', err);
      return res.status(400).json({ error: 'Invalid webhook signature' });
    }

    // Handle different event types
    const { type, data } = evt;

    switch (type) {
      case 'user.created': {
        // Create user in database when created in Clerk
        const email = data.email_addresses?.[0]?.email_address;
        const firstName = data.first_name || '';
        const lastName = data.last_name || '';
        const name = `${firstName} ${lastName}`.trim() || undefined;

        if (!email) {
          console.error('No email found in Clerk user data');
          return res.status(400).json({ error: 'Email required' });
        }

        await prisma.user.create({
          data: {
            clerkId: data.id,
            email: email,
            name: name,
            plan: 'FREE',
            apiUsageCount: 0,
            agentTasksCreated: 0,
          }
        });

        console.log(`User created: ${email} (Clerk ID: ${data.id})`);
        break;
      }

      case 'user.updated': {
        // Update user in database when updated in Clerk
        const email = data.email_addresses?.[0]?.email_address;
        const firstName = data.first_name || '';
        const lastName = data.last_name || '';
        const name = `${firstName} ${lastName}`.trim() || undefined;

        await prisma.user.update({
          where: { clerkId: data.id },
          data: {
            email: email,
            name: name,
          }
        });

        console.log(`User updated: ${email} (Clerk ID: ${data.id})`);
        break;
      }

      case 'user.deleted': {
        // Optional: Handle user deletion
        await prisma.user.delete({
          where: { clerkId: data.id }
        });

        console.log(`User deleted: Clerk ID ${data.id}`);
        break;
      }

      default:
        console.log(`Unhandled webhook event type: ${type}`);
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Clerk webhook error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
