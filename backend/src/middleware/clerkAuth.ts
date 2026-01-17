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

export const clerkAuth = [
  ClerkExpressRequireAuth({
    authorizedParties: [
      'https://app.jupho.io',      // Frontend
      'https://www.jupho.io',      // Old Frontend
      'https://api.jupho.io',      // Backend (The VS Code AI Fix)
      'http://localhost:3000',
      'http://localhost:5000'
    ]
  }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const clerkUserId = req.auth?.userId;
      if (!clerkUserId) return res.status(401).json({ error: 'Unauthorized' });

      const user = await prisma.user.findUnique({
        where: { clerkId: clerkUserId },
        select: { id: true, email: true, clerkId: true } // keeping it simple for speed
      });

      if (!user) return res.status(404).json({ error: 'User not found' });

      req.user = { id: user.id, email: user.email, clerkId: user.clerkId };
      next();
    } catch (error) {
      console.error('Clerk auth error:', error);
      return res.status(500).json({ error: 'Auth failed' });
    }
  }
];
