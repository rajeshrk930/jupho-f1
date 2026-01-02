'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import { analysisApi } from '@/lib/api';
import { Analysis } from '@/types';
import { AnalyzeForm } from '@/components/AnalyzeForm';
import { AnalysisResult } from '@/components/AnalysisResult';
import toast from 'react-hot-toast';

export default function AnalyzePage() {
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<Analysis | null>(null);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<FormData | null>(null);

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);

    // Simulate small delay for UX
    await new Promise((resolve) => setTimeout(resolve, 500));

    // If user is authenticated, send to backend for centralized logic
    if (isAuthenticated) {
      await submitAnalysis(formData);
      return;
    }

    // Not authenticated: save pending data and show signup prompt
    setPendingFormData(formData);
    setShowAuthPrompt(true);
    setIsLoading(false);
  };

  const submitAnalysis = async (formData: FormData) => {
    setIsLoading(true);
    setShowAuthPrompt(false);
    try {
      const response = await analysisApi.create(formData);
      if (response.success) {
        setResult(response.data);
        toast.success('Analysis complete');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Analysis failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewAnalysis = () => {
    setResult(null);
  };

  // After login, check if we have pending data
  const handleAuthSuccess = () => {
    if (pendingFormData) {
      submitAnalysis(pendingFormData);
      setPendingFormData(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-lg font-semibold text-gray-900">Jupho</Link>
            <nav className="flex gap-4">
              <Link href="/analyze" className="text-sm text-blue-600 font-medium">
                Analyze
              </Link>
              {isAuthenticated && (
                <Link href="/history" className="text-sm text-gray-600 hover:text-gray-900">
                  History
                </Link>
              )}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-gray-600">{user?.email}</span>
                <button
                  onClick={() => {
                    logout();
                    router.push('/');
                  }}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">
                  Login
                </Link>
                <Link href="/signup" className="btn-primary text-sm py-1.5 px-3">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Auth Prompt Modal */}
      {showAuthPrompt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-md p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Sign up to see your analysis
            </h3>
            <p className="text-gray-600 text-sm mb-6">
              Create a free account to analyze your creative and save results.
            </p>
            <div className="space-y-3">
              <Link
                href="/signup?redirect=/analyze"
                className="btn-primary w-full block text-center"
              >
                Create Free Account
              </Link>
              <Link
                href="/login?redirect=/analyze"
                className="btn-secondary w-full block text-center"
              >
                I already have an account
              </Link>
            </div>
            <button
              onClick={() => setShowAuthPrompt(false)}
              className="text-sm text-gray-500 hover:text-gray-700 mt-4 w-full text-center"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Main Content - Split Layout */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Left Side - Input (40%) */}
          <div className="w-2/5 shrink-0">
            <div className="bg-white rounded-md border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Creative Details
              </h2>
              <AnalyzeForm onSubmit={handleSubmit} isLoading={isLoading} />
            </div>
          </div>

          {/* Right Side - Output (60%) */}
          <div className="flex-1">
            <div className="bg-white rounded-md border border-gray-200 p-6 min-h-[500px]">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Analysis Report
                </h2>
                {result && (
                  <button
                    onClick={handleNewAnalysis}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    New Analysis
                  </button>
                )}
              </div>

              {result ? (
                <AnalysisResult analysis={result} />
              ) : (
                <div className="flex flex-col items-center justify-center h-80 text-center">
                  <p className="text-gray-400">Your analysis will appear here.</p>
                  <p className="text-gray-400 text-sm mt-1">One clear reason. Supporting logic. One fix.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
