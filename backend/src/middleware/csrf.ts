import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

/**
 * Simple CSRF protection middleware
 * Generates and validates CSRF tokens for state-changing operations
 */

// Store tokens in memory (in production, use Redis or session store)
const tokenStore = new Map<string, { token: string; expires: number }>();

// Cleanup expired tokens every hour
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of tokenStore.entries()) {
    if (value.expires < now) {
      tokenStore.delete(key);
    }
  }
}, 60 * 60 * 1000);

/**
 * Generate a CSRF token for a user session
 */
export const generateCsrfToken = (userId: string): string => {
  const token = crypto.randomBytes(32).toString('hex');
  
  // Store token with 24-hour expiration
  tokenStore.set(userId, {
    token,
    expires: Date.now() + 24 * 60 * 60 * 1000
  });
  
  return token;
};

/**
 * Validate CSRF token from request
 */
export const validateCsrfToken = (userId: string, token: string): boolean => {
  const stored = tokenStore.get(userId);
  
  if (!stored) return false;
  if (stored.expires < Date.now()) {
    tokenStore.delete(userId);
    return false;
  }
  
  return stored.token === token;
};

/**
 * Middleware to require CSRF token for state-changing operations
 */
export const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
  // Skip CSRF for GET, HEAD, OPTIONS (safe methods)
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }
  
  // Get user ID from auth middleware (must run after authenticate)
  const userId = (req as any).user?.id;
  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  // Get token from header or body
  const token = req.headers['x-csrf-token'] || req.body.csrfToken;
  
  if (!token || typeof token !== 'string') {
    return res.status(403).json({ 
      error: 'CSRF token missing',
      code: 'CSRF_MISSING'
    });
  }
  
  // Validate token
  if (!validateCsrfToken(userId, token)) {
    return res.status(403).json({ 
      error: 'Invalid or expired CSRF token',
      code: 'CSRF_INVALID'
    });
  }
  
  next();
};

/**
 * Route handler to get CSRF token
 */
export const getCsrfToken = (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  
  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  const token = generateCsrfToken(userId);
  
  res.json({ csrfToken: token });
};
