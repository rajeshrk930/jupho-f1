import { Request, Response, NextFunction } from 'express';
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';
import { prisma } from '../lib/prisma';

declare global {
  namespace Express {
    interface Request {
      auth?: { userId: string; sessionId: string; actor?: any; sessionClaims?: any; };
      user?: { id: string; email: string; clerkId: string; };
    }
  }
}

/**
 * Clerk Auth - MUST include all domains that send requests to API
 */
export const clerkAuth = [
  ClerkExpressRequireAuth({
    authorizedParties: [
      'https://app.jupho.io',      // Production frontend
      'https://api.jupho.io',      // Production API (CRITICAL!)
      'https://www.jupho.io',      // Legacy frontend
      'http://localhost:3000',     // Local frontend dev
      'http://localhost:5000'      // Local backend dev
    ]
  }), 
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const clerkUserId = req.auth?.userId;
      
      // If Clerk says no userId, the token is invalid
      if (!clerkUserId) {
        console.error('Clerk Auth Failed: No userId in request.auth');
        return res.status(401).json({ error: 'Unauthorized', message: 'Invalid Session' });
      }

      const user = await prisma.user.findUnique({
        where: { clerkId: clerkUserId },
        select: { id: true, email: true, clerkId: true }
      });

      if (!user) {
        console.error(`Database Error: User ${clerkUserId} not found in Prisma`);
        return res.status(404).json({ error: 'User not found' });
      }

      req.user = { id: user.id, email: user.email, clerkId: user.clerkId };
      next();
    } catch (error) {
      console.error('Clerk auth middleware error:', error);
      return res.status(500).json({ error: 'Internal Auth Error' });
    }
  }
];