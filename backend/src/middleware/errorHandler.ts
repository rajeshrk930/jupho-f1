import { Request, Response, NextFunction } from 'express';
import * as Sentry from '@sentry/node';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Add user context from Clerk if available
  if ((req as any).auth?.userId) {
    Sentry.setUser({
      id: (req as any).auth.userId,
      username: (req as any).auth.clerkId,
    });
  }

  // Add request context
  Sentry.setContext('request', {
    method: req.method,
    url: req.url,
    path: req.path,
    query: req.query,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });

  if (err instanceof AppError) {
    // Operational errors (expected) - log to Sentry as warning
    if (err.statusCode >= 500) {
      // 5xx errors are server errors - capture in Sentry
      Sentry.captureException(err, {
        level: 'error',
        tags: {
          error_type: 'operational',
          status_code: err.statusCode.toString(),
        },
      });
    } else if (err.statusCode >= 400) {
      // 4xx errors are client errors - capture as warning only for specific cases
      if (err.statusCode === 401 || err.statusCode === 403) {
        // Auth errors - useful for tracking unauthorized access attempts
        Sentry.captureException(err, {
          level: 'warning',
          tags: {
            error_type: 'auth_failure',
            status_code: err.statusCode.toString(),
          },
        });
      }
    }

    return res.status(err.statusCode).json({
      success: false,
      message: err.message
    });
  }

  // Unexpected errors - always capture in Sentry
  console.error('Unexpected error:', err);
  Sentry.captureException(err, {
    level: 'fatal',
    tags: {
      error_type: 'unexpected',
    },
  });
  
  return res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
};
