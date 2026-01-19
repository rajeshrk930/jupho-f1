import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { prisma } from '../lib/prisma';

/**
 * Admin Authorization Middleware
 * Verifies user has isAdmin=true in database
 * Must be used after clerkAuth middleware
 */
export const adminAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Unauthorized - Not authenticated' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { isAdmin: true }
    });

    if (!user || !user.isAdmin) {
      console.warn('[Admin Auth] Forbidden access attempt by user:', req.user.email);
      return res.status(403).json({ error: 'Forbidden - Admin access required' });
    }

    // User is admin, proceed to route
    next();
  } catch (error: any) {
    console.error('[Admin Auth] Error:', error);
    return res.status(500).json({ error: 'Failed to verify admin status' });
  }
};
