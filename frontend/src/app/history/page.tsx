'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import { analysisApi } from '@/lib/api';
import { Analysis } from '@/types';
import { AnalysisResult } from '@/components/AnalysisResult';
import { StatusBadge } from '@/components/StatusBadge';

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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 pt-6">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <p className="text-xs uppercase tracking-[0.08em] text-blue-600 font-semibold">Reports</p>
            <h2 className="text-xl font-semibold text-gray-900">Past Analyses</h2>
          </div>
          <Link href="/assistant" className="btn-secondary text-sm">Ask AI</Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6" aria-label="Loading analyses">
            <div className="bg-white/90 backdrop-blur rounded-2xl border border-gray-200 p-4 shadow-sm space-y-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="skeleton h-3 w-24" />
                  <div className="skeleton h-4 w-full" />
                </div>
              ))}
            </div>
            <div className="bg-white/90 backdrop-blur rounded-2xl border border-gray-200 p-6 shadow-sm md:col-span-2 space-y-4">
              <div className="skeleton h-5 w-40" />
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="skeleton h-4 w-full" />
                ))}
              </div>
            </div>
          </div>
        ) : analyses.length === 0 ? (
          <div className="bg-white/90 backdrop-blur rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
            <div className="max-w-sm mx-auto space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-gray-600 font-medium">No analyses yet</p>
              <p className="text-sm text-gray-500">Start by analyzing your first ad creative</p>
              <a href="/analyze" className="inline-block px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all font-medium text-sm">
                Create First Analysis
              </a>
            </div>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
            {/* List */}
            <div className="w-full lg:w-2/5 lg:shrink-0">
              <div className="space-y-3">
                {analyses.map((analysis: Analysis) => (
                  <button
                    key={analysis.id}
                    onClick={() => setSelectedId(analysis.id)}
                    className={`w-full text-left p-4 md:p-5 rounded-xl transition-all border-2 group animate-slideUp ${
                      selectedId === analysis.id
                        ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-500 shadow-md'
                        : 'border-gray-200 hover:border-blue-300 bg-white hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs md:text-sm text-gray-500 font-medium">
                        {formatDate(analysis.createdAt)}
                      </span>
                      <StatusBadge status={analysis.resultType as 'WINNING' | 'AVERAGE' | 'DEAD'} size="sm" />
                    </div>
                    <p className="text-sm md:text-base font-semibold text-gray-900 line-clamp-2 mb-2">
                      {analysis.primaryReason}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      {analysis.industry && (
                        <span className="text-xs md:text-sm px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 font-medium">
                          {analysis.industry.replace('_', ' ')}
                        </span>
                      )}
                      <span className="text-xs md:text-sm text-gray-500">CTR {analysis.ctr}%</span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs md:text-sm text-gray-500">CPM ₹{analysis.cpm}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Detail View */}
            <div className="flex-1">
              <div className="bg-white/90 backdrop-blur rounded-2xl border border-gray-200 p-6 min-h-[400px] shadow-sm">
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
