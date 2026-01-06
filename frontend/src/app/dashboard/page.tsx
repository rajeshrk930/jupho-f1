'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { analysisApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { AnalysisResult } from '@/components/AnalysisResult';
import { StatCard } from '@/components/StatCard';
import { StatusBadge } from '@/components/StatusBadge';
import { Analysis } from '@/types';
import { BarChart3, Calendar, TrendingUp } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuthStore();

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['dashboard-analyses'],
    queryFn: () => analysisApi.getAll({ limit: 5 }),
  });

  const analyses: Analysis[] = data?.data?.analyses || [];
  const total = data?.data?.pagination?.total ?? analyses.length;

  const monthlyCount = useMemo(() => {
    const now = Date.now();
    const THIRTY_DAYS = 1000 * 60 * 60 * 24 * 30;
    return analyses.filter((a) => now - new Date(a.createdAt).getTime() <= THIRTY_DAYS).length;
  }, [analyses]);

  const avgCtr = useMemo(() => {
    if (!analyses.length) return null;
    const sum = analyses.reduce((acc, a) => acc + (a.ctr || 0), 0);
    return (sum / analyses.length).toFixed(2);
  }, [analyses]);

  const recent = analyses.slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50 pt-6">
      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <div className="surface-card p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="text-xs text-blue-600 font-medium">Dashboard</p>
              <h1 className="text-2xl font-bold text-gray-900">Welcome back{user?.name ? `, ${user.name}` : ''}.</h1>
              <p className="text-sm text-gray-600">See your recent analyses and jump back into the work.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/assistant" className="btn-secondary text-sm">AI Assistant</Link>
              <Link href="/analyze" className="btn-primary text-sm">+ New Analysis</Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          {isLoading || isFetching ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <div className="skeleton h-3 w-20 mb-2" />
                <div className="skeleton h-8 w-16 mb-1" />
                <div className="skeleton h-3 w-24" />
              </div>
            ))
          ) : (
            <>
              <StatCard title="Total analyses" value={total} subtext="All time" icon={BarChart3} />
              <StatCard title="This month" value={monthlyCount} subtext="Past 30 days" icon={Calendar} />
              <StatCard title="Avg CTR" value={avgCtr ? `${avgCtr}%` : '—'} subtext="Across recent" icon={TrendingUp} />
            </>
          )}
        </div>

        <section className="surface-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-blue-600 font-medium">Recent</p>
              <h2 className="text-lg font-semibold text-gray-900">Recent analyses</h2>
            </div>
            <Link href="/history" className="text-sm text-blue-600 hover:text-blue-700">View all</Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
              {[...Array(3)].map((_, idx) => (
                <div key={idx} className="surface-card p-4 space-y-3">
                  <div className="skeleton h-3 w-24" />
                  <div className="skeleton h-4 w-full" />
                  <div className="skeleton h-4 w-2/3" />
                </div>
              ))}
            </div>
          ) : !recent.length ? (
            <div className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-gray-300 rounded-lg p-6 md:p-8 text-center bg-gray-50">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-blue-100 flex items-center justify-center">
                <BarChart3 size={24} className="md:hidden text-blue-600" />
                <BarChart3 size={28} className="hidden md:block text-blue-600" />
              </div>
              <p className="text-gray-700 font-medium">No analyses yet</p>
              <p className="text-sm text-gray-500">Start your first one to see insights here.</p>
              <Link href="/analyze" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium text-sm">Start first analysis</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
              {recent.map((analysis) => (
                <article key={analysis.id} className="bg-white border border-gray-200 rounded-lg p-4 md:p-5 space-y-3 hover:border-blue-600 transition-colors group">
                  <div className="flex items-center justify-between text-xs md:text-sm">
                    <span className="text-gray-500">{new Date(analysis.createdAt).toLocaleDateString()}</span>
                    <StatusBadge status={analysis.resultType as 'WINNING' | 'AVERAGE' | 'DEAD'} size="sm" />
                  </div>
                  <p className="text-sm md:text-base font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">{analysis.primaryReason}</p>
                  <p className="text-xs md:text-sm text-gray-600 line-clamp-2">{Array.isArray(analysis.supportingLogic) ? analysis.supportingLogic[0] : analysis.supportingLogic}</p>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-2 border-t border-gray-100">
                    <Link href={`/history`} className="text-sm md:text-base text-blue-600 hover:text-blue-700 font-medium">View Details</Link>
                    <div className="flex items-center gap-2 text-xs md:text-sm text-gray-500 flex-wrap">
                      <span>CTR {analysis.ctr}%</span>
                      {analysis.industry && (
                        <>
                          <span>•</span>
                          <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                            {analysis.industry.replace('_', ' ')}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {recent.length > 0 && (
          <section className="surface-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-blue-600 font-medium">Details</p>
                <h2 className="text-lg font-semibold text-gray-900">Latest analysis</h2>
              </div>
              <Link href="/assistant" className="text-sm text-blue-600 hover:text-blue-700">Ask AI about this</Link>
            </div>
            <AnalysisResult analysis={recent[0]} />
          </section>
        )}
      </main>
    </div>
  );
}
