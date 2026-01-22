import { Request, Response, NextFunction } from 'express';
import { Sentry } from '../config/sentry.config';
import { AuthRequest } from './auth';

/**
 * Request/Response Logger Middleware
 * Logs all API requests with timing and user context
 * Captures errors with full context for debugging
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const { method, originalUrl, ip } = req;
  
  // Get user ID if authenticated
  const userId = (req as AuthRequest).user?.id;
  const userEmail = (req as AuthRequest).user?.email;

  // Capture original res.json to intercept responses
  const originalJson = res.json.bind(res);
  
  res.json = function(body: any) {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;
    
    // Log to console in development
    if (process.env.NODE_ENV !== 'production') {
      const statusEmoji = statusCode >= 500 ? '❌' : statusCode >= 400 ? '⚠️' : '✅';
      const userContext = userId ? ` [User: ${userId}]` : '';
      console.log(
        `${statusEmoji} ${method} ${originalUrl}${userContext} - ${statusCode} - ${duration}ms`
      );
    }

    // Add request metadata to Sentry breadcrumb
    Sentry.addBreadcrumb({
      category: 'http',
      message: `${method} ${originalUrl}`,
      level: statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warning' : 'info',
      data: {
        method,
        url: originalUrl,
        statusCode,
        duration: `${duration}ms`,
        userId,
        userEmail,
        ip,
      },
    });

    // Capture errors to Sentry with full context
    if (statusCode >= 500) {
      Sentry.captureException(new Error(`Server Error: ${method} ${originalUrl}`), {
        level: 'error',
        contexts: {
          request: {
            method,
            url: originalUrl,
            statusCode,
            duration,
            userId,
            userEmail,
          },
          response: {
            body: typeof body === 'object' ? JSON.stringify(body).substring(0, 500) : String(body).substring(0, 500),
          },
        },
      });
    } else if (statusCode >= 400) {
      // Log 4xx errors as warnings (not exceptions)
      Sentry.addBreadcrumb({
        category: 'http.error',
        message: `Client Error: ${method} ${originalUrl}`,
        level: 'warning',
        data: {
          statusCode,
          userId,
          error: typeof body === 'object' ? body.message || body.error : body,
        },
      });
    }

    return originalJson(body);
  };

  next();
};

/**
 * External API Call Logger
 * Use this to wrap external API calls (Facebook, OpenAI, Razorpay)
 */
export const logExternalAPICall = async <T>(
  apiName: string,
  operation: string,
  apiCall: () => Promise<T>,
  userId?: string
): Promise<T> => {
  const startTime = Date.now();
  
  try {
    const result = await apiCall();
    const duration = Date.now() - startTime;

    // Log success
    Sentry.addBreadcrumb({
      category: 'external.api',
      message: `${apiName}: ${operation}`,
      level: 'info',
      data: {
        apiName,
        operation,
        duration: `${duration}ms`,
        userId,
        success: true,
      },
    });

    if (process.env.NODE_ENV !== 'production') {
      console.log(`✅ ${apiName} - ${operation} - ${duration}ms`);
    }

    return result;
  } catch (error: any) {
    const duration = Date.now() - startTime;

    // Capture external API errors with full context
    Sentry.captureException(error, {
      level: 'error',
      contexts: {
        externalAPI: {
          apiName,
          operation,
          duration: `${duration}ms`,
          userId,
          errorMessage: error.message,
          errorCode: error.code || error.response?.status,
        },
      },
      tags: {
        api: apiName,
        operation,
      },
    });

    if (process.env.NODE_ENV !== 'production') {
      console.error(`❌ ${apiName} - ${operation} - ${error.message} - ${duration}ms`);
    }

    throw error;
  }
};
