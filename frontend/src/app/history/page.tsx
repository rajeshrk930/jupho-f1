'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/store';
import { analysisApi } from '@/lib/api';
import { Analysis } from '@/types';
import { AnalysisResult } from '@/components/AnalysisResult';

export default function HistoryPage() {
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuthStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const { data, isLoading } = useQuery({
    queryKey: ['analyses'],
    queryFn: () => analysisApi.getAll({ limit: 50 }),
    enabled: isAuthenticated,
  });

  const analyses = data?.data?.analyses || [];
  const selectedAnalysis = analyses.find((a: Analysis) => a.id === selectedId);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <h1 className="text-lg font-semibold text-gray-900">Jupho</h1>
            <nav className="flex gap-4">
              <a href="/analyze" className="text-sm text-gray-600 hover:text-gray-900">
                Analyze
              </a>
              <a href="/history" className="text-sm text-blue-600 font-medium">
                History
              </a>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user?.email}</span>
            <button
              onClick={() => {
                logout();
                router.push('/login');
              }}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Past Analyses</h2>

        {isLoading ? (
          <p className="text-gray-500">Loading...</p>
        ) : analyses.length === 0 ? (
          <div className="bg-white rounded-md border border-gray-200 p-12 text-center">
            <p className="text-gray-500">No analyses yet</p>
            <a href="/analyze" className="text-blue-600 hover:underline text-sm mt-2 inline-block">
              Create your first analysis
            </a>
          </div>
        ) : (
          <div className="flex gap-8">
            {/* List */}
            <div className="w-2/5 shrink-0">
              <div className="bg-white rounded-md border border-gray-200 divide-y divide-gray-200">
                {analyses.map((analysis: Analysis) => (
                  <button
                    key={analysis.id}
                    onClick={() => setSelectedId(analysis.id)}
                    className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                      selectedId === analysis.id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-sm text-gray-500">
                        {formatDate(analysis.createdAt)}
                      </span>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                        {analysis.industry ? analysis.industry.replace('_', ' ') : 'Unknown'}
                      </span>
                    </div>
                    <p className="text-gray-900 text-sm line-clamp-2">
                      {analysis.primaryReason}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Detail View */}
            <div className="flex-1">
              <div className="bg-white rounded-md border border-gray-200 p-6 min-h-[400px]">
                {selectedAnalysis ? (
                  <AnalysisResult analysis={selectedAnalysis} />
                ) : (
                  <div className="flex items-center justify-center h-80 text-gray-400">
                    <p>Select an analysis to view details</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
