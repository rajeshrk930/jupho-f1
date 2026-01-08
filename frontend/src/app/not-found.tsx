import Link from 'next/link';
import { Home, Search, FileQuestion } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-base-surface flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-base-elevated rounded-md shadow-lg p-8 border border-border-default">
          {/* 404 Icon */}
          <div className="w-20 h-20 bg-signal-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <FileQuestion className="w-10 h-10 text-signal-primary" />
          </div>

          {/* 404 Message */}
          <div className="mb-6">
            <h1 className="text-6xl font-bold text-text-primary mb-3">404</h1>
            <h2 className="text-2xl font-bold text-text-primary mb-3">
              Page Not Found
            </h2>
            <p className="text-text-secondary">
              The page you're looking for doesn't exist or has been moved.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/dashboard"
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              Go to Dashboard
            </Link>
            <Link
              href="/history"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-base-surface text-text-primary rounded-md font-medium border border-border-default hover:bg-base-elevated transition-colors"
            >
              <Search className="w-4 h-4" />
              View History
            </Link>
          </div>

          {/* Quick Links */}
          <div className="mt-8 pt-6 border-t border-border-default">
            <p className="text-sm text-text-secondary mb-3">Quick links:</p>
            <div className="flex flex-wrap justify-center gap-2">
              <Link
                href="/analyze"
                className="text-sm text-signal-primary hover:text-signal-primary/80 hover:underline"
              >
                Analyze
              </Link>
              <span className="text-text-tertiary">•</span>
              <Link
                href="/templates"
                className="text-sm text-signal-primary hover:text-signal-primary/80 hover:underline"
              >
                Templates
              </Link>
              <span className="text-text-tertiary">•</span>
              <Link
                href="/billing"
                className="text-sm text-signal-primary hover:text-signal-primary/80 hover:underline"
              >
                Billing
              </Link>
              <span className="text-text-tertiary">•</span>
              <Link
                href="/help"
                className="text-sm text-signal-primary hover:text-signal-primary/80 hover:underline"
              >
                Help
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
