import { Request, Response, NextFunction } from 'express';
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';
import { prisma } from '../lib/prisma';

// Extend Express Request type to include user and auth
declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId: string;
        sessionId: string;
        actor?: any;
        sessionClaims?: any;
      };
      user?: {
        id: string;
        email: string;
        clerkId: string;
      };
    }
  }
}

/**
 * Clerk authentication middleware
 * Validates Clerk session and loads user from database
 */
export const clerkAuth = [
  // 🦁 FIX: We explicitly tell Clerk to allow your new domain here
  ClerkExpressRequireAuth({
    authorizedParties: [
      'https://app.jupho.io',
      'https://www.jupho.io',
      'http://localhost:3000' 
    ]
  }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Get Clerk user ID from authenticated request
      const clerkUserId = req.auth?.userId;
      
      if (!clerkUserId) {
        return res.status(401).json({ 
          error: 'Unauthorized',
          message: 'No Clerk user ID found'
        });
      }

      // Find user in database by Clerk ID
      const user = await prisma.user.findUnique({
        where: { clerkId: clerkUserId },
        select: {
          id: true,
          email: true,
          clerkId: true,
          name: true,
          plan: true,
          apiUsageCount: true,
          agentTasksCreated: true,
        }
      });

      if (!user) {
        return res.status(404).json({ 
          error: 'User not found',
          message: 'No user found with this Clerk ID. Please contact support.'
        });
      }

      // Attach user to request object
      req.user = {
        id: user.id,
        email: user.email,
        clerkId: user.clerkId
      };

      next();
    } catch (error) {
      console.error('Clerk auth middleware error:', error);
      return res.status(500).json({ 
        error: 'Authentication error',
        message: 'Failed to authenticate user'
      });
    }
  }
];
