'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';
import * as Sentry from '@sentry/nextjs';
import { useUser } from '@clerk/nextjs';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { user } = useUser();

  useEffect(() => {
    // Set user context if available
    if (user) {
      Sentry.setUser({
        id: user.id,
        email: user.primaryEmailAddress?.emailAddress,
        username: user.username || undefined,
      });
    }

    // Capture error in Sentry
    Sentry.captureException(error, {
      tags: {
        component: 'global_error_boundary',
      },
      contexts: {
        error: {
          digest: error.digest,
          message: error.message,
        },
      },
    });

    // Also log to console for development
    console.error('Global error:', error);
  }, [error, user]);

  return (
    <div className="min-h-screen bg-base-surface flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-base-elevated rounded-md shadow-lg p-8 border border-border-default">
          {/* Error Icon */}
          <div className="w-16 h-16 bg-signal-danger/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-8 h-8 text-signal-danger" />
          </div>

          {/* Error Message */}
          <h1 className="text-2xl font-bold text-text-primary mb-3">
            Oops! Something went wrong
          </h1>
          <p className="text-text-secondary mb-6">
            We encountered an unexpected error. Don't worry, our team has been notified and we're working on it.
          </p>

          {/* Error Details (for development) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mb-6 p-4 bg-base-surface rounded-md text-left">
              <p className="text-xs font-mono text-text-secondary break-all">
                {error.message}
              </p>
              {error.digest && (
                <p className="text-xs text-text-tertiary mt-2">
                  Error ID: {error.digest}
                </p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={reset}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
            <Link
              href="/dashboard"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-base-surface text-text-primary rounded-md font-medium border border-border-default hover:bg-base-elevated transition-colors"
            >
              <Home className="w-4 h-4" />
              Go Home
            </Link>
          </div>

          {/* Help Text */}
          <p className="text-xs text-text-tertiary mt-6">
            If this problem persists, please contact{' '}
            <a href="/help" className="text-signal-primary hover:underline">
              support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
