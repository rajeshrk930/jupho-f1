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
      <div className="px-4 lg:px-6 py-4 lg:py-6 space-y-6 lg:space-y-8 pb-20 lg:pb-6">
        {/* Bold Gradient Header */}
        <div className="gradient-header hidden lg:block">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <p className="text-sm text-teal-100 font-bold uppercase tracking-wider">Dashboard</p>
              <h1 className="text-4xl font-extrabold text-white">Welcome back{user?.name ? `, ${user.name}` : ''}!</h1>
              <p className="text-lg text-teal-50">See your recent analyses and jump back into the work.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/analyze" className="btn-primary text-base shadow-bold-xl">+ New Analysis</Link>
            </div>
          </div>
        </div>

        {/* Quick Actions - Horizontal scroll on mobile, grid on desktop */}
        <div className="flex lg:grid overflow-x-auto lg:overflow-visible gap-4 lg:gap-6 lg:grid-cols-3 xl:grid-cols-3 -mx-4 px-4 lg:mx-0 lg:px-0 snap-x snap-mandatory scrollbar-hide">
          <Link
            href="/analyze"
            className="bg-gradient-to-br from-teal-500 to-teal-700 border-4 border-teal-900 rounded-2xl p-6 lg:p-8 hover:shadow-colored-teal transition-all group min-w-[300px] lg:min-w-0 snap-start"
          >
            <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-2xl bg-white flex items-center justify-center mb-4 shadow-bold">
              <Zap size={28} className="lg:w-8 lg:h-8 text-teal-700" />
            </div>
            <h3 className="font-extrabold text-white mb-2 text-lg lg:text-xl">New Analysis</h3>
            <p className="text-sm lg:text-base text-teal-50 font-medium">Analyze your next ad creative</p>
          </Link>

          <Link
            href="/history"
            className="bg-gradient-to-br from-green-500 to-green-700 border-4 border-green-900 rounded-2xl p-6 lg:p-8 hover:shadow-colored-teal transition-all group min-w-[300px] lg:min-w-0 snap-start"
          >
            <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-2xl bg-white flex items-center justify-center mb-4 shadow-bold">
              <FileText size={28} className="lg:w-8 lg:h-8 text-green-600" />
            </div>
            <h3 className="font-extrabold text-white mb-2 text-lg lg:text-xl">View Reports</h3>
            <p className="text-sm lg:text-base text-green-50 font-medium">Browse all your analyses</p>
          </Link>

          <Link
            href="/billing"
            className="bg-gradient-to-br from-orange-500 to-orange-700 border-4 border-orange-900 rounded-2xl p-6 lg:p-8 hover:shadow-colored-orange transition-all group min-w-[300px] lg:min-w-0 snap-start"
          >
            <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-2xl bg-white flex items-center justify-center mb-4 shadow-bold">
              <Crown size={28} className="lg:w-8 lg:h-8 text-orange-600" />
            </div>
            <h3 className="font-extrabold text-white mb-2 text-lg lg:text-xl">Upgrade Pro</h3>
            <p className="text-sm lg:text-base text-orange-50 font-medium">Unlock unlimited features</p>
          </Link>
        </div>

        {/* Tips & Insights Section */}
        {analyses.length > 0 && (
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 border-4 border-purple-900 rounded-2xl p-6 lg:p-8 shadow-bold-xl">
            <div className="flex items-start gap-4 lg:gap-6">
              <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-white flex items-center justify-center flex-shrink-0 shadow-bold">
                <Sparkles size={24} className="lg:w-7 lg:h-7 text-purple-700" />
              </div>
              <div className="flex-1">
                <h3 className="font-extrabold text-white mb-2 lg:mb-3 text-lg lg:text-xl">💡 QUICK TIP</h3>
                <p className="text-white text-base lg:text-lg font-medium leading-relaxed">
                  {quickTip}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stats - Horizontal on mobile, grid on desktop */}
        <div className="flex lg:grid overflow-x-auto lg:overflow-visible gap-4 lg:gap-6 lg:grid-cols-3 -mx-4 px-4 lg:mx-0 lg:px-0 scrollbar-hide">
          {isLoading || isFetching ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="stat-card-bold border-teal-600 min-w-[180px] lg:min-w-0">
                <div className="skeleton h-4 w-24 mb-3" />
                <div className="skeleton h-10 lg:h-12 w-20 lg:w-24 mb-2" />
                <div className="skeleton h-3 lg:h-4 w-20 lg:w-28" />
              </div>
            ))
          ) : (
            <>
              <div className="stat-card-bold border-teal-600 min-w-[180px] lg:min-w-0">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center shadow-md">
                    <BarChart3 size={20} className="text-white" />
                  </div>
                  <p className="text-sm lg:text-base text-gray-700 font-bold uppercase tracking-wide">Total analyses</p>
                </div>
                <p className="text-3xl lg:text-4xl font-black text-gray-900 mb-1">{total}</p>
                <p className="text-sm lg:text-base text-gray-600 font-bold">All time</p>
              </div>
              <div className="stat-card-bold border-purple-600 min-w-[180px] lg:min-w-0">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center shadow-md">
                    <Calendar size={20} className="text-white" />
                  </div>
                  <p className="text-sm lg:text-base text-gray-700 font-bold uppercase tracking-wide">This month</p>
                </div>
                <p className="text-3xl lg:text-4xl font-black text-gray-900 mb-1">{monthlyCount}</p>
                <p className="text-sm lg:text-base text-gray-600 font-bold">Past 30 days</p>
              </div>
              <div className="stat-card-bold border-orange-600 min-w-[180px] lg:min-w-0">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center shadow-md">
                    <TrendingUp size={20} className="text-white" />
                  </div>
                  <p className="text-sm lg:text-base text-gray-700 font-bold uppercase tracking-wide">Avg CTR</p>
                </div>
                <p className="text-3xl lg:text-4xl font-black text-gray-900 mb-1">{avgCtr ? `${avgCtr}%` : '—'}</p>
                <p className="text-sm lg:text-base text-gray-600 font-bold">Across recent</p>
              </div>
            </>
          )}
        </div>

        <section className="bg-white border-4 border-gray-900 rounded-2xl p-6 lg:p-8 shadow-bold-xl space-y-4 lg:space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-teal-700 font-bold uppercase tracking-wider">Recent</p>
              <h2 className="text-xl lg:text-2xl font-black text-gray-900">Recent analyses</h2>
            </div>
            <Link href="/history" className="text-sm lg:text-base text-white bg-teal-600 hover:bg-teal-700 px-4 py-2 rounded-xl font-bold shadow-md">View all</Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {[...Array(2)].map((_, idx) => (
                <div key={idx} className="bg-white border-2 border-gray-300 rounded-2xl p-4 lg:p-6 space-y-3 shadow-bold">
                  <div className="skeleton h-4 w-28" />
                  <div className="skeleton h-5 w-full" />
                  <div className="skeleton h-5 w-2/3" />
                </div>
              ))}
            </div>
          ) : !recentSlice.length ? (
            <div className="flex flex-col items-center justify-center gap-4 border-4 border-dashed border-gray-900 rounded-2xl p-8 md:p-12 text-center bg-gray-100">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center shadow-bold">
                <BarChart3 size={32} className="md:w-10 md:h-10 text-white" />
              </div>
              <p className="text-gray-900 font-black text-lg lg:text-xl">No analyses yet</p>
              <p className="text-base lg:text-lg text-gray-700 font-bold">Start your first one to see insights here.</p>
              <Link href="/analyze" className="px-6 py-3 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white rounded-xl font-bold text-base shadow-bold">Start first analysis</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {/* Show 2 cards on mobile/tablet, all 3 on desktop */}
              {recentSlice.map((analysis, idx) => (
                <article key={analysis.id} className={`bg-white border-l-[6px] rounded-2xl p-4 lg:p-6 space-y-3 lg:space-y-4 shadow-bold hover:shadow-bold-xl group ${
                  analysis.resultType === 'WINNING' ? 'border-green-600' : 
                  analysis.resultType === 'AVERAGE' ? 'border-yellow-600' : 
                  'border-red-600'
                } ${idx >= 2 ? 'hidden lg:block' : ''}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm md:text-base text-gray-700 font-bold">{new Date(analysis.createdAt).toLocaleDateString()}</span>
                    <StatusBadge status={analysis.resultType as 'WINNING' | 'AVERAGE' | 'DEAD'} size="md" showLabel />
                  </div>
                  <p className="text-base md:text-lg font-black text-gray-900 line-clamp-2 group-hover:text-teal-700">{analysis.primaryReason}</p>
                  <p className="text-sm md:text-base text-gray-700 line-clamp-2 font-medium">{Array.isArray(analysis.supportingLogic) ? analysis.supportingLogic[0] : analysis.supportingLogic}</p>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 border-t-2 border-gray-200">
                    <Link href={`/history`} className="text-sm lg:text-base text-teal-700 hover:text-teal-900 font-bold uppercase tracking-wide">View Details →</Link>
                    <div className="flex items-center gap-3 text-sm text-gray-700 flex-wrap font-bold">
                      <span className="px-3 py-1 bg-teal-100 text-teal-900 rounded-lg">CTR {analysis.ctr}%</span>
                      {analysis.industry && (
                        <span className="px-3 py-1 rounded-lg bg-purple-100 text-purple-900">
                          {analysis.industry.replace('_', ' ')}
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {recentSlice.length > 0 && (
          <section className="bg-white border-4 border-gray-900 rounded-2xl p-6 lg:p-8 shadow-bold-xl space-y-4 lg:space-y-6">
            {/* Mobile: Collapsible, Desktop: Always open */}
            <button
              onClick={() => setShowLatestAnalysis(!showLatestAnalysis)}
              className="w-full flex items-center justify-between lg:pointer-events-none"
            >
              <div>
                <p className="text-sm text-teal-700 font-bold uppercase tracking-wider">Details</p>
                <h2 className="text-xl lg:text-2xl font-black text-gray-900">Latest analysis</h2>
              </div>
              <ChevronDown
                size={24}
                className={`lg:hidden text-gray-900 ${showLatestAnalysis ? 'rotate-180' : ''}`}
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
