import { prisma } from '../lib/prisma';
import crypto from 'crypto';
import axios from 'axios';

export type WebhookEvent = 
  | 'campaign.created'
  | 'campaign.completed'
  | 'campaign.failed'
  | 'lead.captured'
  | 'performance.updated';

export interface WebhookPayload {
  event: WebhookEvent;
  timestamp: string;
  data: any;
  userId: string;
}

export class WebhookService {
  /**
   * Fire webhooks for a specific event
   * @param userId - User ID who owns the webhook
   * @param event - Event type (e.g., 'campaign.created')
   * @param data - Event data to send
   */
  static async fireWebhooks(userId: string, event: WebhookEvent, data: any): Promise<void> {
    try {
      // Get all active webhooks for this user that listen to this event
      const webhooks = await prisma.webhookEndpoint.findMany({
        where: {
          userId,
          isActive: true,
          events: {
            has: event,
          },
        },
      });

      if (webhooks.length === 0) {
        console.log(`[Webhooks] No webhooks found for user ${userId} and event ${event}`);
        return;
      }

      console.log(`[Webhooks] Firing ${webhooks.length} webhooks for event: ${event}`);

      // Fire all webhooks in parallel
      const deliveryPromises = webhooks.map((webhook) =>
        this.deliverWebhook(webhook.id, event, data, userId)
      );

      await Promise.allSettled(deliveryPromises);
    } catch (error) {
      console.error('[Webhooks] Error firing webhooks:', error);
    }
  }

  /**
   * Deliver a single webhook
   */
  private static async deliverWebhook(
    webhookId: string,
    event: WebhookEvent,
    data: any,
    userId: string
  ): Promise<void> {
    const webhook = await prisma.webhookEndpoint.findUnique({
      where: { id: webhookId },
    });

    if (!webhook) {
      console.error(`[Webhooks] Webhook ${webhookId} not found`);
      return;
    }

    const payload: WebhookPayload = {
      event,
      timestamp: new Date().toISOString(),
      data,
      userId,
    };

    // Create delivery record
    const delivery = await prisma.webhookDelivery.create({
      data: {
        webhookId,
        event,
        payload: JSON.stringify(payload),
        status: 'pending',
        attempts: 0,
      },
    });

    // Attempt delivery with retries
    await this.attemptDelivery(delivery.id, webhook.url, webhook.secret, payload);
  }

  /**
   * Attempt to deliver webhook with retries (max 3 attempts)
   */
  private static async attemptDelivery(
    deliveryId: string,
    url: string,
    secret: string,
    payload: WebhookPayload,
    attempt: number = 1
  ): Promise<void> {
    const MAX_ATTEMPTS = 3;
    const TIMEOUT = 10000; // 10 seconds

    try {
      // Generate HMAC signature
      const signature = this.generateSignature(payload, secret);

      // Send webhook
      const response = await axios.post(url, payload, {
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': signature,
          'X-Webhook-Event': payload.event,
          'User-Agent': 'Jupho-Webhooks/1.0',
        },
        timeout: TIMEOUT,
      });

      // Success - update delivery record
      await prisma.webhookDelivery.update({
        where: { id: deliveryId },
        data: {
          status: 'success',
          attempts: attempt,
          responseCode: response.status,
          deliveredAt: new Date(),
        },
      });

      console.log(`[Webhooks] ✅ Delivered webhook to ${url} (attempt ${attempt})`);
    } catch (error: any) {
      console.error(`[Webhooks] ❌ Failed to deliver webhook (attempt ${attempt}):`, error.message);

      const errorMessage = error.response?.data || error.message || 'Unknown error';
      const responseCode = error.response?.status || null;

      if (attempt < MAX_ATTEMPTS) {
        // Retry with exponential backoff
        const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
        console.log(`[Webhooks] Retrying in ${delay}ms...`);

        await new Promise((resolve) => setTimeout(resolve, delay));
        await this.attemptDelivery(deliveryId, url, secret, payload, attempt + 1);
      } else {
        // Max attempts reached - mark as failed
        await prisma.webhookDelivery.update({
          where: { id: deliveryId },
          data: {
            status: 'failed',
            attempts: attempt,
            lastError: String(errorMessage).substring(0, 500), // Limit error length
            responseCode,
          },
        });

        console.error(`[Webhooks] ❌ Webhook delivery failed after ${MAX_ATTEMPTS} attempts`);
      }
    }
  }

  /**
   * Generate HMAC-SHA256 signature for webhook verification
   */
  private static generateSignature(payload: WebhookPayload, secret: string): string {
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(JSON.stringify(payload));
    return hmac.digest('hex');
  }

  /**
   * Verify webhook signature (for when users receive webhooks from us)
   */
  static verifySignature(payload: string, signature: string, secret: string): boolean {
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(payload);
    const expectedSignature = hmac.digest('hex');
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
  }

  /**
   * Test webhook by sending a test event
   */
  static async testWebhook(webhookId: string, userId: string): Promise<boolean> {
    const webhook = await prisma.webhookEndpoint.findUnique({
      where: { id: webhookId, userId },
    });

    if (!webhook) {
      throw new Error('Webhook not found');
    }

    const testPayload: WebhookPayload = {
      event: 'campaign.created',
      timestamp: new Date().toISOString(),
      data: {
        test: true,
        message: 'This is a test webhook from Jupho',
        campaignId: 'test-123',
        campaignName: 'Test Campaign',
      },
      userId,
    };

    try {
      const signature = this.generateSignature(testPayload, webhook.secret);

      const response = await axios.post(webhook.url, testPayload, {
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': signature,
          'X-Webhook-Event': testPayload.event,
          'User-Agent': 'Jupho-Webhooks/1.0',
        },
        timeout: 10000,
      });

      console.log(`[Webhooks] ✅ Test webhook successful: ${response.status}`);
      return true;
    } catch (error: any) {
      console.error('[Webhooks] ❌ Test webhook failed:', error.message);
      throw new Error(error.response?.data || error.message || 'Webhook test failed');
    }
  }

  /**
   * Generate a random webhook secret
   */
  static generateSecret(): string {
    return `whsec_${crypto.randomBytes(32).toString('hex')}`;
  }
}
