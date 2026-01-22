const { withSentryConfig } = require('@sentry/nextjs');

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
        pathname: '/uploads/**',
      },
    ],
  },
};

// Sentry webpack plugin configuration
const sentryWebpackPluginOptions = {
  // Organization and project from Sentry
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Auth token for uploading source maps
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // Only upload source maps in production builds
  silent: process.env.NODE_ENV !== 'production',
  
  // Automatically inject release version
  release: {
    name: process.env.NEXT_PUBLIC_SENTRY_RELEASE,
  },

  // Delete source maps after upload to keep them private
  widenClientFileUpload: true,
  hideSourceMaps: true,
  disableLogger: true,
};

// Export with Sentry configuration only if auth token is available
module.exports = process.env.SENTRY_AUTH_TOKEN
  ? withSentryConfig(nextConfig, sentryWebpackPluginOptions)
  : nextConfig;

