'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, router]);

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 via-white to-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Jupho</h1>
          <p className="text-lg text-gray-600">Meta Ads Creative Analyzer</p>
          <p className="text-sm text-gray-500 mt-2">Understand why your creatives fail. Get actionable fixes.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Link
            href="/login"
            className="group surface-card p-8 text-center hover:shadow-xl transition-all duration-200 hover:-translate-y-1"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-teal-50 flex items-center justify-center group-hover:bg-teal-100 transition-colors">
              <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign In</h2>
            <p className="text-gray-600 mb-4">Already have an account?</p>
            <div className="inline-flex items-center text-teal-600 font-semibold group-hover:gap-2 transition-all">
              Continue to dashboard
              <svg className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          <Link
            href="/signup"
            className="group surface-card p-8 text-center hover:shadow-xl transition-all duration-200 hover:-translate-y-1 bg-gradient-to-br from-teal-50 to-indigo-50"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-teal-500 to-indigo-600 flex items-center justify-center group-hover:shadow-lg transition-shadow">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Account</h2>
            <p className="text-gray-600 mb-4">Start analyzing your ads for free</p>
            <div className="inline-flex items-center text-teal-600 font-semibold group-hover:gap-2 transition-all">
              Get started now
              <svg className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        </div>

        <div className="mt-10 text-center">
          <p className="text-sm text-gray-500">© 2026 Jupho · Built for ad professionals</p>
        </div>
      </div>
    </div>
  );
}
