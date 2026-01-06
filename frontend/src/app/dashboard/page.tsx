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
import { BarChart3, Calendar, TrendingUp, Zap, MessageSquare, FileText, Crown, Sparkles, Clock } from 'lucide-react';

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
              <p className="text-xs text-teal-700 font-medium">Dashboard</p>
              <h1 className="text-2xl font-bold text-gray-900">Welcome back{user?.name ? `, ${user.name}` : ''}.</h1>
              <p className="text-sm text-gray-600">See your recent analyses and jump back into the work.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/assistant" className="btn-secondary text-sm">AI Assistant</Link>
              <Link href="/analyze" className="btn-primary text-sm">+ New Analysis</Link>
            </div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link
            href="/analyze"
            className="bg-white border border-gray-200 rounded-lg p-6 hover:border-teal-600 transition-colors group shadow-sm"
          >
            <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center mb-4 group-hover:bg-teal-200 transition-colors">
              <Zap size={24} className="text-teal-700" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">New Analysis</h3>
            <p className="text-sm text-gray-600">Analyze your next ad creative</p>
          </Link>

          <Link
            href="/assistant"
            className="bg-white border border-gray-200 rounded-lg p-6 hover:border-purple-600 transition-colors group shadow-sm"
          >
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
              <MessageSquare size={24} className="text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">AI Assistant</h3>
            <p className="text-sm text-gray-600">Get instant strategy help</p>
          </Link>

          <Link
            href="/history"
            className="bg-white border border-gray-200 rounded-lg p-6 hover:border-green-600 transition-colors group shadow-sm"
          >
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
              <FileText size={24} className="text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">View Reports</h3>
            <p className="text-sm text-gray-600">Browse all your analyses</p>
          </Link>

          <Link
            href="/billing"
            className="bg-white border border-gray-200 rounded-lg p-6 hover:border-orange-600 transition-colors group shadow-sm"
          >
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mb-4 group-hover:bg-orange-200 transition-colors">
              <Crown size={24} className="text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Upgrade Pro</h3>
            <p className="text-sm text-gray-600">Unlock unlimited features</p>
          </Link>
        </div>

        {/* Tips & Insights Section */}
        {analyses.length > 0 && (
          <div className="bg-white border-l-4 border-teal-600 rounded-lg p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                <Sparkles size={20} className="text-teal-700" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2">💡 Quick Tip</h3>
                <p className="text-gray-700 leading-relaxed">
                  {avgCtr && parseFloat(avgCtr) > 1.5
                    ? "Great work! Your average CTR is above industry standards. Keep testing new creative variations to maintain momentum."
                    : avgCtr && parseFloat(avgCtr) < 1
                    ? "Your CTR could use improvement. Try analyzing your winning creatives to identify what works, then apply those insights to new ads."
                    : "You're off to a good start! Analyze more creatives to identify patterns in what drives performance."}
                </p>
              </div>
            </div>
          </div>
        )}

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
              <p className="text-xs text-teal-700 font-medium">Recent</p>
              <h2 className="text-lg font-semibold text-gray-900">Recent analyses</h2>
            </div>
            <Link href="/history" className="text-sm text-teal-700 hover:text-teal-800">View all</Link>
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
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-teal-100 flex items-center justify-center">
                <BarChart3 size={24} className="md:hidden text-teal-700" />
                <BarChart3 size={28} className="hidden md:block text-teal-700" />
              </div>
              <p className="text-gray-700 font-medium">No analyses yet</p>
              <p className="text-sm text-gray-500">Start your first one to see insights here.</p>
              <Link href="/analyze" className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors font-medium text-sm">Start first analysis</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
              {recent.map((analysis) => (
                <article key={analysis.id} className="bg-white border border-gray-200 rounded-lg p-4 md:p-5 space-y-3 hover:border-teal-600 transition-colors group">
                  <div className="flex items-center justify-between text-xs md:text-sm">
                    <span className="text-gray-500">{new Date(analysis.createdAt).toLocaleDateString()}</span>
                    <StatusBadge status={analysis.resultType as 'WINNING' | 'AVERAGE' | 'DEAD'} size="sm" />
                  </div>
                  <p className="text-sm md:text-base font-semibold text-gray-900 line-clamp-2 group-hover:text-teal-700 transition-colors">{analysis.primaryReason}</p>
                  <p className="text-xs md:text-sm text-gray-600 line-clamp-2">{Array.isArray(analysis.supportingLogic) ? analysis.supportingLogic[0] : analysis.supportingLogic}</p>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-2 border-t border-gray-100">
                    <Link href={`/history`} className="text-sm md:text-base text-teal-700 hover:text-teal-800 font-medium">View Details</Link>
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
                <p className="text-xs text-teal-700 font-medium">Details</p>
                <h2 className="text-lg font-semibold text-gray-900">Latest analysis</h2>
              </div>
              <Link href="/assistant" className="text-sm text-teal-700 hover:text-teal-800">Ask AI about this</Link>
            </div>
            <AnalysisResult analysis={recent[0]} />
          </section>
        )}
      </main>
    </div>
  );
}
