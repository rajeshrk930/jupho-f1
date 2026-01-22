import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV || 'development',

  // Replay configuration - captures session replays for errors
  integrations: [
    Sentry.replayIntegration({
      maskAllText: true, // Mask all text to protect user privacy
      blockAllMedia: true, // Block all media (images, videos)
    }),
  ],

  // Performance Monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0, // 10% in production

  // Session Replay - only capture sessions with errors
  replaysSessionSampleRate: 0, // Don't capture normal sessions
  replaysOnErrorSampleRate: 1.0, // Capture 100% of sessions with errors

  // Sensitive data scrubbing for client-side
  beforeSend(event, hint) {
    // Remove sensitive data from URLs
    if (event.request?.url) {
      try {
        const url = new URL(event.request.url);
        // Remove sensitive query parameters
        const sensitiveParams = ['token', 'api_key', 'secret', 'password', 'access_token'];
        sensitiveParams.forEach(param => {
          if (url.searchParams.has(param)) {
            url.searchParams.set(param, '[Filtered]');
          }
        });
        event.request.url = url.toString();
      } catch (e) {
        // Invalid URL, leave as is
      }
    }

    // Scrub email addresses from error messages
    if (event.message) {
      event.message = event.message.replace(
        /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
        '[email]'
      );
    }

    // Scrub phone numbers
    if (event.message) {
      event.message = event.message.replace(
        /(\+\d{1,3}[- ]?)?\d{10}/g,
        '[phone]'
      );
    }

    return event;
  },

  // Ignore common browser errors
  ignoreErrors: [
    // Network errors
    'Network request failed',
    'NetworkError',
    'Failed to fetch',
    // Browser extensions
    'chrome-extension://',
    'moz-extension://',
    // Random third-party errors
    'Non-Error promise rejection',
    // ResizeObserver errors (harmless)
    'ResizeObserver loop limit exceeded',
  ],

  // Release tracking
  release: process.env.NEXT_PUBLIC_SENTRY_RELEASE,
});
