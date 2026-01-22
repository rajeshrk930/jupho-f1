import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV || 'development',

  // Performance Monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Sensitive data scrubbing for server-side
  beforeSend(event, hint) {
    // Remove sensitive headers
    if (event.request?.headers) {
      delete event.request.headers['authorization'];
      delete event.request.headers['cookie'];
      delete event.request.headers['x-api-key'];
    }

    // Scrub sensitive data from extra context
    if (event.extra) {
      const sensitiveKeys = [
        'accessToken',
        'facebookAccessToken',
        'clerkToken',
        'razorpay_signature',
        'password',
        'secret',
        'apiKey',
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

    return event;
  },

  // Release tracking
  release: process.env.NEXT_PUBLIC_SENTRY_RELEASE,
});
