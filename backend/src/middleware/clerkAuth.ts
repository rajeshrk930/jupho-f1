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
      // 🔍 DEBUG: Log what Clerk gives us
      console.log('🔐 Clerk Auth Debug:', {
        hasAuth: !!req.auth,
        userId: req.auth?.userId || 'MISSING',
        sessionId: req.auth?.sessionId || 'MISSING',
        path: req.path,
        origin: req.headers.origin,
        authHeader: req.headers.authorization ? 'Present' : 'MISSING'
      });

      const clerkUserId = req.auth?.userId;
      
      // If Clerk says no userId, the token is invalid
      if (!clerkUserId) {
        console.error('❌ Clerk Auth Failed: No userId in request.auth');
        console.error('Request headers:', JSON.stringify(req.headers, null, 2));
        return res.status(401).json({ 
          error: 'Unauthorized', 
          message: 'Invalid Session',
          debug: 'No userId from Clerk - check token and environment keys'
        });
      }

      const user = await prisma.user.findUnique({
        where: { clerkId: clerkUserId },
        select: { id: true, email: true, clerkId: true }
      });

      if (!user) {
        console.error(`❌ Database Error: User ${clerkUserId} not found in Prisma`);
        console.error('This means Clerk authenticated but user is not in your database');
        return res.status(404).json({ 
          error: 'User not found',
          debug: 'Clerk user exists but not in database - check user sync'
        });
      }

      console.log(`✅ Auth Success: User ${user.email} (${user.id})`);
      req.user = { id: user.id, email: user.email, clerkId: user.clerkId };
      next();
    } catch (error) {
      console.error('❌ Clerk auth middleware error:', error);
      return res.status(500).json({ error: 'Internal Auth Error', debug: String(error) });
    }
  }
];