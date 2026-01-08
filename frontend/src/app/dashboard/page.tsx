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
    <div className="min-h-screen bg-base">
      <MobileTopBar title="Dashboard" />
      <div className="px-4 lg:px-6 py-4 lg:py-6 space-y-6 pb-20 lg:pb-6">
        {/* Simple Header */}
        <div className="bg-base-surface border border-border-default rounded-md p-6 shadow-sm hidden lg:block">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="text-xs text-signal-primary font-medium uppercase tracking-wider">Dashboard</p>
              <h1 className="text-2xl font-semibold text-text-primary">Welcome back{user?.name ? `, ${user.name}` : ''}!</h1>
              <p className="text-sm text-text-secondary">See your recent analyses and jump back into the work.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/analyze" className="btn-primary">+ New Analysis</Link>
            </div>
          </div>
        </div>

        {/* Quick Actions - Horizontal scroll on mobile, grid on desktop */}
        <div className="flex lg:grid overflow-x-auto lg:overflow-visible gap-3 lg:gap-4 lg:grid-cols-3 xl:grid-cols-3 -mx-4 px-4 lg:mx-0 lg:px-0 snap-x snap-mandatory scrollbar-hide">
          <Link
            href="/analyze"
            className="bg-base-surface border-l-[3px] border-signal-primary rounded-md p-5 lg:p-6 hover:shadow-md transition-all group shadow-sm min-w-[280px] lg:min-w-0 snap-start"
          >
            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-md bg-base-elevated flex items-center justify-center mb-3 lg:mb-4">
              <Zap size={20} className="lg:w-6 lg:h-6 text-signal-primary" />
            </div>
            <h3 className="font-semibold text-text-primary mb-1 text-base lg:text-lg">New Analysis</h3>
            <p className="text-sm text-text-secondary">Analyze your next ad creative</p>
          </Link>

          <Link
            href="/history"
            className="bg-base-surface border-l-[3px] border-signal-primary rounded-md p-5 lg:p-6 hover:shadow-md transition-all group shadow-sm min-w-[280px] lg:min-w-0 snap-start"
          >
            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-md bg-base-elevated flex items-center justify-center mb-3 lg:mb-4">
              <FileText size={20} className="lg:w-6 lg:h-6 text-signal-primary" />
            </div>
            <h3 className="font-semibold text-text-primary mb-1 text-base lg:text-lg">View Reports</h3>
            <p className="text-sm text-text-secondary">Browse all your analyses</p>
          </Link>

          <Link
            href="/billing"
            className="bg-base-surface border-l-[3px] border-signal-primary rounded-md p-5 lg:p-6 hover:shadow-md transition-all group shadow-sm min-w-[280px] lg:min-w-0 snap-start"
          >
            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-md bg-base-elevated flex items-center justify-center mb-3 lg:mb-4">
              <Crown size={20} className="lg:w-6 lg:h-6 text-signal-primary" />
            </div>
            <h3 className="font-semibold text-text-primary mb-1 text-base lg:text-lg">Upgrade Pro</h3>
            <p className="text-sm text-text-secondary">Unlock unlimited features</p>
          </Link>
        </div>

        {/* Tips & Insights Section */}
        {analyses.length > 0 && (
          <div className="bg-base-elevated border border-border-default rounded-md p-5 lg:p-6 shadow-sm">
            <div className="flex items-start gap-3 lg:gap-4">
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-md bg-base-surface flex items-center justify-center flex-shrink-0">
                <Sparkles size={20} className="lg:w-6 lg:h-6 text-signal-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-text-primary mb-1 lg:mb-2 text-base lg:text-lg">💡 Quick Tip</h3>
                <p className="text-text-secondary leading-relaxed text-sm lg:text-base">
                  {quickTip}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stats - Horizontal on mobile, grid on desktop */}
        <div className="flex lg:grid overflow-x-auto lg:overflow-visible gap-3 lg:gap-4 lg:grid-cols-3 -mx-4 px-4 lg:mx-0 lg:px-0 scrollbar-hide">
          {isLoading || isFetching ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="stat-card border-signal-primary min-w-[160px] lg:min-w-0">
                <div className="skeleton h-3 w-20 mb-2" />
                <div className="skeleton h-8 w-16 mb-1" />
                <div className="skeleton h-3 w-24" />
              </div>
            ))
          ) : (
            <>
              <div className="stat-card border-signal-primary min-w-[160px] lg:min-w-0">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-9 h-9 rounded-md bg-base-elevated flex items-center justify-center">
                    <BarChart3 size={18} className="text-text-secondary" />
                  </div>
                  <p className="text-sm text-text-secondary font-medium">Total analyses</p>
                </div>
                <p className="text-2xl lg:text-3xl font-semibold text-text-primary mb-1">{total}</p>
                <p className="text-xs lg:text-sm text-text-tertiary">All time</p>
              </div>
              <div className="stat-card border-signal-primary min-w-[160px] lg:min-w-0">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-9 h-9 rounded-md bg-base-elevated flex items-center justify-center">
                    <Calendar size={18} className="text-text-secondary" />
                  </div>
                  <p className="text-sm text-text-secondary font-medium">This month</p>
                </div>
                <p className="text-2xl lg:text-3xl font-semibold text-text-primary mb-1">{monthlyCount}</p>
                <p className="text-xs lg:text-sm text-text-tertiary">Past 30 days</p>
              </div>
              <div className="stat-card border-signal-primary min-w-[160px] lg:min-w-0">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-9 h-9 rounded-md bg-base-elevated flex items-center justify-center">
                    <TrendingUp size={18} className="text-text-secondary" />
                  </div>
                  <p className="text-sm text-text-secondary font-medium">Avg CTR</p>
                </div>
                <p className="text-2xl lg:text-3xl font-semibold text-text-primary mb-1">{avgCtr ? `${avgCtr}%` : '—'}</p>
                <p className="text-xs lg:text-sm text-text-tertiary">Across recent</p>
              </div>
            </>
          )}
        </div>

        <section className="bg-base-surface border border-border-default rounded-md p-5 lg:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-signal-primary font-medium uppercase tracking-wider">Recent</p>
              <h2 className="text-base lg:text-lg font-semibold text-text-primary">Recent analyses</h2>
            </div>
            <Link href="/history" className="text-sm text-signal-primary hover:text-signal-primary/80 font-medium">View all</Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {[...Array(2)].map((_, idx) => (
                <div key={idx} className="bg-base-surface border border-border-default rounded-md p-4 lg:p-5 space-y-3 shadow-sm">
                  <div className="skeleton h-3 w-24" />
                  <div className="skeleton h-4 w-full" />
                  <div className="skeleton h-4 w-2/3" />
                </div>
              ))}
            </div>
          ) : !recentSlice.length ? (
            <div className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-border-default rounded-md p-6 md:p-8 text-center bg-base">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-md bg-base-elevated flex items-center justify-center">
                <BarChart3 size={24} className="md:w-7 md:h-7 text-text-secondary" />
              </div>
              <p className="text-text-primary font-semibold text-base lg:text-lg">No analyses yet</p>
              <p className="text-sm lg:text-base text-text-secondary">Start your first one to see insights here.</p>
              <Link href="/analyze" className="px-5 py-2.5 bg-signal-primary hover:bg-signal-primary/90 text-white rounded-sm font-medium text-sm shadow-sm">Start first analysis</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {/* Show 2 cards on mobile/tablet, all 3 on desktop */}
              {recentSlice.map((analysis, idx) => (
                <article key={analysis.id} className={`bg-base-surface border-l-[3px] border-signal-primary rounded-md p-4 lg:p-5 space-y-3 shadow-sm hover:shadow-md group ${idx >= 2 ? 'hidden lg:block' : ''}`}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-tertiary font-medium">{new Date(analysis.createdAt).toLocaleDateString()}</span>
                    <StatusBadge status={analysis.resultType as 'WINNING' | 'AVERAGE' | 'DEAD'} size="sm" showLabel />
                  </div>
                  <p className="text-sm md:text-base font-semibold text-text-primary line-clamp-2 group-hover:text-signal-primary">{analysis.primaryReason}</p>
                  <p className="text-xs md:text-sm text-text-secondary line-clamp-2">{Array.isArray(analysis.supportingLogic) ? analysis.supportingLogic[0] : analysis.supportingLogic}</p>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-2 border-t border-border-subtle">
                    <Link href={`/history`} className="text-xs lg:text-sm text-signal-primary hover:text-signal-primary/80 font-medium">View Details →</Link>
                    <div className="flex items-center gap-2 text-xs text-text-secondary flex-wrap font-medium">
                      <span className="px-2 py-1 bg-signal-primary/10 text-signal-primary rounded-sm">CTR {analysis.ctr}%</span>
                      {analysis.industry && (
                        <span className="px-2 py-1 rounded-sm bg-base-elevated text-text-secondary">
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
          <section className="bg-base-surface border border-border-default rounded-md p-5 lg:p-6 shadow-sm space-y-4">
            {/* Mobile: Collapsible, Desktop: Always open */}
            <button
              onClick={() => setShowLatestAnalysis(!showLatestAnalysis)}
              className="w-full flex items-center justify-between lg:pointer-events-none"
            >
              <div>
                <p className="text-xs text-signal-primary font-medium uppercase tracking-wider">Details</p>
                <h2 className="text-base lg:text-lg font-semibold text-text-primary">Latest analysis</h2>
              </div>
              <ChevronDown
                size={20}
                className={`lg:hidden text-text-tertiary ${showLatestAnalysis ? 'rotate-180' : ''}`}
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
