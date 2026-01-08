'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { analysisApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { AnalysisResult } from '@/components/AnalysisResult';
import { StatCard } from '@/components/StatCard';
import { StatusBadge } from '@/components/StatusBadge';
import MobileTopBar from '@/components/MobileTopBar';
import { Analysis } from '@/types';
import { BarChart3, Calendar, TrendingUp, Zap, MessageSquare, FileText, Crown, Sparkles, Clock, ChevronDown } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [showLatestAnalysis, setShowLatestAnalysis] = useState(false);

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

  // Generate personalized tip based on last analysis
  const quickTip = useMemo(() => {
    if (!analyses.length) return "Upload your first ad creative to get personalized insights.";
    
    const lastAnalysis = analyses[0];
    const tipMap: Record<string, string> = {
      'LAUNCH_PHASE': `Your last ad is in launch phase. Give it 48-72 hours before making changes.`,
      'CREATIVE': `Your last ad's CTR was ${lastAnalysis.ctr}%. Fixing just the opening visual can lift CTR by 30-50%.`,
      'FUNNEL': `You're getting clicks (${lastAnalysis.ctr}% CTR) but no conversions. Optimize your landing page to capture those leads.`,
      'SALES': `Leads are coming in but not converting. Faster follow-up (within 15 min) can increase sales by 40-60%.`,
      'AUDIENCE': `Your ad is experiencing audience fatigue. Broaden your targeting or refresh the creative.`,
      'DELIVERY': `Budget changes are inflating your costs. Adjust in 20-30% increments every 2-3 days.`,
    };
    
    const failureType = lastAnalysis.failureReason || 'CREATIVE';
    return tipMap[failureType] || `Great work! Your average CTR is ${avgCtr}%. Keep testing new variations.`;
  }, [analyses, avgCtr]);

  // Show 2 on mobile, 3 on desktop
  const recentSlice = analyses.slice(0, 3);
  const mobileRecentSlice = analyses.slice(0, 2);

  return (
    <div className="min-h-screen bg-gray-50">
      <MobileTopBar title="Dashboard" />
      <div className="px-4 lg:px-6 py-4 lg:py-6 space-y-4 lg:space-y-6 pb-20 lg:pb-6">
        <div className="surface-card p-4 lg:p-6 hidden lg:block">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="text-xs text-teal-700 font-medium">Dashboard</p>
              <h1 className="text-2xl font-bold text-gray-900">Welcome back{user?.name ? `, ${user.name}` : ''}.</h1>
              <p className="text-sm text-gray-600">See your recent analyses and jump back into the work.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/analyze" className="btn-primary text-sm">+ New Analysis</Link>
            </div>
          </div>
        </div>

        {/* Quick Actions - Horizontal scroll on mobile, grid on desktop */}
        <div className="flex lg:grid overflow-x-auto lg:overflow-visible gap-3 lg:gap-4 lg:grid-cols-3 xl:grid-cols-4 -mx-4 px-4 lg:mx-0 lg:px-0 snap-x snap-mandatory scrollbar-hide">
          <Link
            href="/analyze"
            className="bg-white border border-gray-200 rounded-lg p-4 lg:p-6 hover:border-teal-600 transition-colors group shadow-sm min-w-[280px] lg:min-w-0 snap-start"
          >
            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-teal-100 flex items-center justify-center mb-3 lg:mb-4 group-hover:bg-teal-200 transition-colors">
              <Zap size={20} className="lg:w-6 lg:h-6 text-teal-700" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1 text-sm lg:text-base">New Analysis</h3>
            <p className="text-xs lg:text-sm text-gray-600">Analyze your next ad creative</p>
          </Link>

          <Link
            href="/history"
            className="bg-white border border-gray-200 rounded-lg p-4 lg:p-6 hover:border-green-600 transition-colors group shadow-sm min-w-[280px] lg:min-w-0 snap-start"
          >
            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-green-100 flex items-center justify-center mb-3 lg:mb-4 group-hover:bg-green-200 transition-colors">
              <FileText size={20} className="lg:w-6 lg:h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1 text-sm lg:text-base">View Reports</h3>
            <p className="text-xs lg:text-sm text-gray-600">Browse all your analyses</p>
          </Link>

          <Link
            href="/billing"
            className="bg-white border border-gray-200 rounded-lg p-4 lg:p-6 hover:border-orange-600 transition-colors group shadow-sm min-w-[280px] lg:min-w-0 snap-start"
          >
            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-orange-100 flex items-center justify-center mb-3 lg:mb-4 group-hover:bg-orange-200 transition-colors">
              <Crown size={20} className="lg:w-6 lg:h-6 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1 text-sm lg:text-base">Upgrade Pro</h3>
            <p className="text-xs lg:text-sm text-gray-600">Unlock unlimited features</p>
          </Link>
        </div>

        {/* Tips & Insights Section */}
        {analyses.length > 0 && (
          <div className="bg-white border-l-4 border-teal-600 rounded-lg p-3 lg:p-6 shadow-sm">
            <div className="flex items-start gap-3 lg:gap-4">
              <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                <Sparkles size={16} className="lg:w-5 lg:h-5 text-teal-700" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1 lg:mb-2 text-sm lg:text-base">💡 Quick Tip</h3>
                <p className="text-gray-700 leading-relaxed text-xs lg:text-sm">
                  {quickTip}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stats - Horizontal on mobile, grid on desktop */}
        <div className="flex lg:grid overflow-x-auto lg:overflow-visible gap-2 lg:gap-4 lg:grid-cols-3 -mx-4 px-4 lg:mx-0 lg:px-0 scrollbar-hide">
          {isLoading || isFetching ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-lg p-3 lg:p-4 shadow-sm min-w-[140px] lg:min-w-0">
                <div className="skeleton h-3 w-20 mb-2" />
                <div className="skeleton h-6 lg:h-8 w-12 lg:w-16 mb-1" />
                <div className="skeleton h-2 lg:h-3 w-16 lg:w-24" />
              </div>
            ))
          ) : (
            <>
              <div className="bg-white border border-gray-200 rounded-lg p-3 lg:p-4 shadow-sm min-w-[140px] lg:min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 size={16} className="lg:w-5 lg:h-5 text-teal-600" />
                  <p className="text-[10px] lg:text-xs text-gray-600 font-medium">Total analyses</p>
                </div>
                <p className="text-xl lg:text-2xl font-bold text-gray-900">{total}</p>
                <p className="text-[10px] lg:text-xs text-gray-500 mt-0.5">All time</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-3 lg:p-4 shadow-sm min-w-[140px] lg:min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar size={16} className="lg:w-5 lg:h-5 text-teal-600" />
                  <p className="text-[10px] lg:text-xs text-gray-600 font-medium">This month</p>
                </div>
                <p className="text-xl lg:text-2xl font-bold text-gray-900">{monthlyCount}</p>
                <p className="text-[10px] lg:text-xs text-gray-500 mt-0.5">Past 30 days</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-3 lg:p-4 shadow-sm min-w-[140px] lg:min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp size={16} className="lg:w-5 lg:h-5 text-teal-600" />
                  <p className="text-[10px] lg:text-xs text-gray-600 font-medium">Avg CTR</p>
                </div>
                <p className="text-xl lg:text-2xl font-bold text-gray-900">{avgCtr ? `${avgCtr}%` : '—'}</p>
                <p className="text-[10px] lg:text-xs text-gray-500 mt-0.5">Across recent</p>
              </div>
            </>
          )}
        </div>

        <section className="surface-card p-4 lg:p-6 space-y-3 lg:space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-teal-700 font-medium">Recent</p>
              <h2 className="text-base lg:text-lg font-semibold text-gray-900">Recent analyses</h2>
            </div>
            <Link href="/history" className="text-xs lg:text-sm text-teal-700 hover:text-teal-800 font-medium">View all</Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {[...Array(2)].map((_, idx) => (
                <div key={idx} className="surface-card p-3 lg:p-4 space-y-3">
                  <div className="skeleton h-3 w-24" />
                  <div className="skeleton h-4 w-full" />
                  <div className="skeleton h-4 w-2/3" />
                </div>
              ))}
            </div>
          ) : !recentSlice.length ? (
            <div className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-gray-300 rounded-lg p-6 md:p-8 text-center bg-gray-50">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-teal-100 flex items-center justify-center">
                <BarChart3 size={24} className="md:hidden text-teal-700" />
                <BarChart3 size={28} className="hidden md:block text-teal-700" />
              </div>
              <p className="text-gray-700 font-medium text-sm lg:text-base">No analyses yet</p>
              <p className="text-xs lg:text-sm text-gray-500">Start your first one to see insights here.</p>
              <Link href="/analyze" className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors font-medium text-sm">Start first analysis</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {/* Show 2 cards on mobile/tablet, all 3 on desktop */}
              {recentSlice.map((analysis, idx) => (
                <article key={analysis.id} className={`bg-white border border-gray-200 rounded-lg p-3 lg:p-5 space-y-2 lg:space-y-3 hover:border-teal-600 transition-colors group ${idx >= 2 ? 'hidden lg:block' : ''}`}>
                  <div className="flex items-center justify-between text-xs md:text-sm">
                    <span className="text-gray-500">{new Date(analysis.createdAt).toLocaleDateString()}</span>
                    <StatusBadge status={analysis.resultType as 'WINNING' | 'AVERAGE' | 'DEAD'} size="sm" />
                  </div>
                  <p className="text-sm md:text-base font-semibold text-gray-900 line-clamp-2 group-hover:text-teal-700 transition-colors">{analysis.primaryReason}</p>
                  <p className="text-xs md:text-sm text-gray-600 line-clamp-2">{Array.isArray(analysis.supportingLogic) ? analysis.supportingLogic[0] : analysis.supportingLogic}</p>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-2 border-t border-gray-100">
                    <Link href={`/history`} className="text-xs lg:text-sm text-teal-700 hover:text-teal-800 font-medium">View Details</Link>
                    <div className="flex items-center gap-2 text-xs text-gray-500 flex-wrap">
                      <span>CTR {analysis.ctr}%</span>
                      {analysis.industry && (
                        <>
                          <span>•</span>
                          <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-[10px] lg:text-xs">
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

        {recentSlice.length > 0 && (
          <section className="surface-card p-4 lg:p-6 space-y-3 lg:space-y-4">
            {/* Mobile: Collapsible, Desktop: Always open */}
            <button
              onClick={() => setShowLatestAnalysis(!showLatestAnalysis)}
              className="w-full flex items-center justify-between lg:pointer-events-none"
            >
              <div>
                <p className="text-xs text-teal-700 font-medium">Details</p>
                <h2 className="text-base lg:text-lg font-semibold text-gray-900">Latest analysis</h2>
              </div>
              <ChevronDown
                size={20}
                className={`lg:hidden text-gray-500 transition-transform ${showLatestAnalysis ? 'rotate-180' : ''}`}
              />
            </button>
            
            <div className={`${showLatestAnalysis ? 'block' : 'hidden'} lg:block`}>
              <AnalysisResult analysis={recentSlice[0]} />
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
