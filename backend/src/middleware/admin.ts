import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to verify if the authenticated user is an admin
 * Admins are defined in ADMIN_EMAILS environment variable (comma-separated)
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get authenticated user from request (set by authenticate middleware)
    const user = (req as any).user;
    
    if (!user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Get admin emails from environment variable
    const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(email => email.trim().toLowerCase()) || [];
    
    if (adminEmails.length === 0) {
      return res.status(503).json({ message: 'Admin access not configured' });
    }

    // Check if user's email is in admin list
    if (!adminEmails.includes(user.email.toLowerCase())) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error during admin verification' });
  }
};
