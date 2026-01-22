import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

export const initializeSentry = () => {
  const dsn = process.env.SENTRY_DSN;
  const environment = process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'development';

  if (!dsn) {
    console.warn('SENTRY_DSN not configured. Skipping Sentry initialization.');
    return;
  }

  Sentry.init({
    dsn,
    environment,
    
    // Performance Monitoring
    tracesSampleRate: environment === 'production' ? 0.1 : 1.0, // 10% in prod, 100% in dev
    profilesSampleRate: environment === 'production' ? 0.1 : 1.0,
    
    // Enhanced integrations
    integrations: [
      nodeProfilingIntegration(),
      // Automatically instrument Node.js libraries
      Sentry.httpIntegration(),
      Sentry.expressIntegration(),
      Sentry.prismaIntegration(),
    ],

    // Sensitive data scrubbing
    beforeSend(event, hint) {
      // Remove sensitive data from error events
      if (event.request) {
        // Scrub headers
        if (event.request.headers) {
          delete event.request.headers['authorization'];
          delete event.request.headers['cookie'];
          delete event.request.headers['x-api-key'];
        }

        // Scrub query parameters
        if (event.request.query_string && typeof event.request.query_string === 'string') {
          const sensitiveParams = ['token', 'api_key', 'secret', 'password'];
          const queryString: string = event.request.query_string;
          const hasSensitive = sensitiveParams.some(param => queryString.includes(param));
          if (hasSensitive) {
            event.request.query_string = '[Filtered]';
          }
        }
      }

      // Scrub sensitive data from extra context
      if (event.extra) {
        const sensitiveKeys = [
          'accessToken',
          'facebookAccessToken',
          'clerkToken',
          'razorpay_signature',
          'razorpay_payment_id',
          'password',
          'encryptionKey',
          'apiKey',
          'secret',
          'cardNumber',
          'cvv',
          'token'
        ];

        const scrubObject = (obj: any) => {
          if (typeof obj !== 'object' || obj === null) return;
          
          Object.keys(obj).forEach(key => {
            const lowerKey = key.toLowerCase();
            if (sensitiveKeys.some(sensitive => lowerKey.includes(sensitive.toLowerCase()))) {
              obj[key] = '[Filtered]';
            } else if (typeof obj[key] === 'object') {
              scrubObject(obj[key]);
            }
          });
        };

        scrubObject(event.extra);
      }

      // Scrub email patterns from messages
      if (event.message) {
        event.message = event.message.replace(
          /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
          '[email]'
        );
      }

      // Scrub phone numbers (basic pattern)
      if (event.message) {
        event.message = event.message.replace(
          /(\+\d{1,3}[- ]?)?\d{10}/g,
          '[phone]'
        );
      }

      return event;
    },

    // Custom trace sampling for critical paths
    tracesSampler(samplingContext) {
      const { transactionContext, parentSampled } = samplingContext;
      
      // Handle case where transactionContext might be undefined
      if (!transactionContext || !transactionContext.name) {
        return environment === 'production' ? 0.1 : 1.0;
      }
      
      const transactionName = transactionContext.name;

      // Always sample critical operations
      const criticalPaths = [
        'agent',           // AI agent workflows
        'facebook',        // Facebook API calls
        'payment',         // Razorpay operations
        'openai',          // OpenAI API calls
        'campaign',        // Campaign creation
        'oauth'            // OAuth flows
      ];

      if (criticalPaths.some(path => transactionName.toLowerCase().includes(path))) {
        return 1.0; // 100% sampling for critical paths
      }

      // Parent-based decision for child spans
      if (parentSampled !== undefined) {
        return parentSampled;
      }

      // Default sampling rate for other requests
      return environment === 'production' ? 0.1 : 1.0;
    },

    // Ignore common non-error events
    ignoreErrors: [
      // Browser/network errors
      'Network request failed',
      'NetworkError',
      'Failed to fetch',
      // Bot/crawler patterns
      /bot|crawler|spider|scraper/i,
    ],

    // Release tracking (optional - can be set via CI/CD)
    release: process.env.SENTRY_RELEASE,
  });

  console.log(`✅ Sentry initialized for ${environment} environment`);
};

// Helper to set user context from Clerk
export const setSentryUser = (userId: string, email?: string, clerkId?: string) => {
  Sentry.setUser({
    id: userId,
    email,
    username: clerkId,
  });
};

// Helper to clear user context (e.g., after logout)
export const clearSentryUser = () => {
  Sentry.setUser(null);
};

// Helper to add custom context
export const addSentryContext = (key: string, data: any) => {
  Sentry.setContext(key, data);
};

// Helper to capture custom events
export const captureEvent = (message: string, level: Sentry.SeverityLevel = 'info', extra?: Record<string, any>) => {
  Sentry.captureEvent({
    message,
    level,
    extra,
  });
};

// Export Sentry for use in other files
export { Sentry };
