import { Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from './auth';

const DAILY_FREE_LIMIT = 10;

// Helper to check if date is a new day
const isNewDay = (lastReset: Date): boolean => {
  const now = new Date();
  const lastResetDate = new Date(lastReset);
  
  return (
    now.getDate() !== lastResetDate.getDate() ||
    now.getMonth() !== lastResetDate.getMonth() ||
    now.getFullYear() !== lastResetDate.getFullYear()
  );
};

// Helper to check if PRO subscription is active
const isProActive = (user: { plan: string; proExpiresAt?: Date | null }): boolean => {
  if (user.plan !== 'PRO') return false;
  if (!user.proExpiresAt) return false;
  return new Date(user.proExpiresAt) > new Date();
};

// Helper to calculate next reset time (midnight)
const getNextResetTime = (lastReset: Date): string => {
  const nextReset = new Date(lastReset);
  nextReset.setDate(nextReset.getDate() + 1);
  nextReset.setHours(0, 0, 0, 0);
  return nextReset.toISOString();
};

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
        proExpiresAt: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
      });
    }

    // PRO users with active subscription: unlimited access
    if (isProActive(user)) {
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

    // Check if FREE user has exceeded limit
    if (user.plan === 'FREE' && user.apiUsageCount >= DAILY_FREE_LIMIT) {
      return res.status(429).json({
        success: false,
        message: 'Daily limit reached. Upgrade to Pro for unlimited questions.',
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
