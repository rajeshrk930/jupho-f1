import Link from 'next/link';
import { Home, Search, FileQuestion } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
          {/* 404 Icon */}
          <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FileQuestion className="w-10 h-10 text-teal-600" />
          </div>

          {/* 404 Message */}
          <div className="mb-6">
            <h1 className="text-6xl font-bold text-gray-900 mb-3">404</h1>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Page Not Found
            </h2>
            <p className="text-gray-600">
              The page you're looking for doesn't exist or has been moved.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/dashboard"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors"
            >
              <Home className="w-4 h-4" />
              Go to Dashboard
            </Link>
            <Link
              href="/history"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white text-gray-700 rounded-lg font-medium border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              <Search className="w-4 h-4" />
              View History
            </Link>
          </div>

          {/* Quick Links */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-3">Quick links:</p>
            <div className="flex flex-wrap justify-center gap-2">
              <Link
                href="/analyze"
                className="text-sm text-teal-600 hover:text-teal-700 hover:underline"
              >
                Analyze
              </Link>
              <span className="text-gray-300">•</span>
              <Link
                href="/templates"
                className="text-sm text-teal-600 hover:text-teal-700 hover:underline"
              >
                Templates
              </Link>
              <span className="text-gray-300">•</span>
              <Link
                href="/billing"
                className="text-sm text-teal-600 hover:text-teal-700 hover:underline"
              >
                Billing
              </Link>
              <span className="text-gray-300">•</span>
              <Link
                href="/help"
                className="text-sm text-teal-600 hover:text-teal-700 hover:underline"
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
