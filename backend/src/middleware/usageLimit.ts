import { Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from './auth';

const DAILY_FREE_LIMIT = 3; // 3 chat analyses per day (legacy)

// Plan limits - 3-tier system
const PLAN_LIMITS = {
  FREE: {
    campaignsPerMonth: 2,
    aiCampaignsPerMonth: 0, // No AI access
  },
  BASIC: {
    campaignsPerMonth: 10,
    aiCampaignsPerMonth: 0, // Templates only, no AI Agent
  },
  GROWTH: {
    campaignsPerMonth: 25,
    aiCampaignsPerMonth: 999, // Unlimited AI
  },
};

// Helper to check if it's a new month
const isNewMonth = (lastReset: Date): boolean => {
  const now = new Date();
  const lastResetDate = new Date(lastReset);
  
  return (
    now.getMonth() !== lastResetDate.getMonth() ||
    now.getFullYear() !== lastResetDate.getFullYear()
  );
};

// Helper to check if date is a new day (for chat API - legacy)
const isNewDay = (lastReset: Date): boolean => {
  const now = new Date();
  const lastResetDate = new Date(lastReset);
  
  return (
    now.getDate() !== lastResetDate.getDate() ||
    now.getMonth() !== lastResetDate.getMonth() ||
    now.getFullYear() !== lastResetDate.getFullYear()
  );
};

// Helper to check if subscription is active
const isSubscriptionActive = (user: { plan: string; planExpiresAt?: Date | null }): boolean => {
  if (user.plan === 'BASIC' || user.plan === 'GROWTH') {
    if (!user.planExpiresAt) return true; // No expiry = lifetime access
    return new Date(user.planExpiresAt) > new Date();
  }
  return false;
};

// Helper to calculate next reset time (next month)
const getNextResetTime = (lastReset: Date): string => {
  const nextReset = new Date(lastReset);
  nextReset.setMonth(nextReset.getMonth() + 1);
  nextReset.setDate(1);
  nextReset.setHours(0, 0, 0, 0);
  return nextReset.toISOString();
};

/**
 * Middleware to check campaign usage limits (for AI Agent + Templates)
 * Checks: Total campaigns/month AND AI campaigns/month (for BASIC)
 */
export const checkCampaignUsageLimit = (createdVia: 'AI_AGENT' | 'TEMPLATE') => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;

      // Fetch user with usage data
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          plan: true,
          agentTasksCreated: true,
          agentLastResetDate: true,
          planExpiresAt: true,
        },
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found',
        });
      }

      // Check if subscription is active
      if (!isSubscriptionActive(user)) {
        return res.status(403).json({
          success: false,
          error: 'SUBSCRIPTION_EXPIRED',
          message: 'Your subscription has expired. Please renew to continue.',
        });
      }

      // Reset counter if it's a new month
      if (isNewMonth(user.agentLastResetDate)) {
        await prisma.user.update({
          where: { id: userId },
          data: {
            agentTasksCreated: 0,
            agentLastResetDate: new Date(),
          },
        });
        // Continue with reset count
        return next();
      }

      // Get plan limits
      const planLimits = PLAN_LIMITS[user.plan as 'FREE' | 'BASIC' | 'GROWTH'];
      
      if (!planLimits) {
        return res.status(400).json({
          success: false,
          message: 'Invalid plan type',
        });
      }

      // Check total campaign limit
      if (user.agentTasksCreated >= planLimits.campaignsPerMonth) {
        const upgradeMessage = user.plan === 'FREE' 
          ? `You've reached your FREE limit of ${planLimits.campaignsPerMonth} campaigns. Upgrade to BASIC (\u20b91,499) for 10 campaigns or GROWTH (\u20b91,999) for 25 campaigns + AI Agent.`
          : user.plan === 'BASIC'
          ? `You've reached your BASIC limit of ${planLimits.campaignsPerMonth} campaigns. Upgrade to GROWTH (\u20b91,999) for 25 campaigns + AI Agent.`
          : `You've reached your GROWTH limit of ${planLimits.campaignsPerMonth} campaigns this month.`;
        
        return res.status(403).json({
          success: false,
          error: 'CAMPAIGN_LIMIT_REACHED',
          message: upgradeMessage,
          limit: planLimits.campaignsPerMonth,
          used: user.agentTasksCreated,
          resetAt: getNextResetTime(user.agentLastResetDate),
          upgradeRequired: user.plan === 'FREE' || user.plan === 'BASIC',
        });
      }

      // For FREE/BASIC users using AI Agent: AI campaigns are blocked (handled in agent.routes.ts)
      // This check is for additional safety
      if ((user.plan === 'FREE' || user.plan === 'BASIC') && createdVia === 'AI_AGENT') {
        return res.status(403).json({
          success: false,
          error: 'AI_AGENT_LOCKED',
          message: `AI Agent is only available on GROWTH plan (\u20b91,999/month). Upgrade to unlock smart campaign creation!`,
          upgradeRequired: true,
          upgradeTo: 'GROWTH'
        });
      }

      // For GROWTH users: Check AI campaign limit (unlimited, so this won't trigger)
      if (user.plan === 'GROWTH' && createdVia === 'AI_AGENT') {
        const startOfMonth = new Date(user.agentLastResetDate);
        const aiCampaignsCount = await prisma.agentTask.count({
          where: {
            userId,
            createdVia: 'AI_AGENT',
            createdAt: { gte: startOfMonth },
          },
        });

        if (aiCampaignsCount >= planLimits.aiCampaignsPerMonth) {
          return res.status(403).json({
            success: false,
            error: 'AI_LIMIT_REACHED',
            message: `You've reached your AI campaign limit. This should not happen on GROWTH plan.`,
            limit: planLimits.aiCampaignsPerMonth,
            used: aiCampaignsCount,
            resetAt: getNextResetTime(user.agentLastResetDate),
          });
        }
      }

      // All checks passed
      next();
    } catch (error: any) {
      console.error('[Usage Limit] Error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to check usage limits',
      });
    }
  };
};

/**
 * Legacy middleware for chat API (daily limits)
 */
export const checkUsageLimit = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;

    // Fetch user with usage data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        plan: true,
        apiUsageCount: true,
        lastResetDate: true,
        planExpiresAt: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
      });
    }

    // Paid users: unlimited access
    if (isSubscriptionActive(user)) {
      return next();
    }

    // Reset counter if it's a new day
    if (isNewDay(user.lastResetDate)) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          apiUsageCount: 0,
          lastResetDate: new Date(),
        },
      });
      // Continue with reset count
      return next();
    }

    // Check if user has exceeded limit (for free/legacy plans)
    if (user.apiUsageCount >= DAILY_FREE_LIMIT) {
      return res.status(429).json({
        success: false,
        message: 'Daily limit reached. Upgrade to Pro for unlimited analyses.',
        code: 'LIMIT_EXCEEDED',
        usage: {
          current: user.apiUsageCount,
          limit: DAILY_FREE_LIMIT,
          resetsAt: getNextResetTime(user.lastResetDate),
        },
      });
    }

    // Increment usage count
    await prisma.user.update({
      where: { id: userId },
      data: {
        apiUsageCount: { increment: 1 },
      },
    });

    next();
  } catch (error) {
    console.error('Usage limit middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check usage limit',
    });
  }
};
