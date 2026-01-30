'use client';

// Force dynamic rendering to support useSearchParams during build/export.
export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { agentApi, facebookApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { StatCard } from '@/components/StatCard';
import MobileTopBar from '@/components/MobileTopBar';
import PerformanceCard from '@/components/PerformanceCard';
import { Sparkles, Target, Clock, CheckCircle2, XCircle, Loader2, TrendingUp, RefreshCw, Users, BarChart3 } from 'lucide-react';
import { useState, useEffect, Suspense } from 'react';
import toast from 'react-hot-toast';

function DashboardPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated } = useAuthStore();
  const [isSyncing, setIsSyncing] = useState(false);

  // Auth guard
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/sign-in?redirect=/dashboard');
    }
  }, [isAuthenticated, router]);

  // Handle Facebook OAuth callback
  useEffect(() => {
    if (searchParams.get('facebook') === 'connected') {
      toast.success('Facebook account connected successfully!');
      window.history.replaceState({}, '', '/dashboard');
    } else if (searchParams.get('error') === 'connection_failed') {
      const message = searchParams.get('message') || 'Failed to connect Facebook account';
      toast.error(decodeURIComponent(message));
      window.history.replaceState({}, '', '/dashboard');
    }
  }, [searchParams]);

  const { data: tasksData, isLoading, error, refetch } = useQuery({
    queryKey: ['agent-tasks'],
    queryFn: () => agentApi.getTasks(50),
    enabled: isAuthenticated, // Only run query if authenticated
  });

  // Fetch Facebook forms to get total leads
  const { data: formsData, isLoading: formsLoading, isError: formsError } = useQuery({
    queryKey: ['facebook-forms'],
    queryFn: () => facebookApi.getForms(),
    enabled: isAuthenticated,
    retry: false, // Don't retry if Facebook not connected
  });

  // Check if Facebook is connected based on forms data
  const facebookConnected = !formsError && formsData !== undefined;

  // Show loading while checking auth
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-red-800 font-semibold mb-2">Failed to load dashboard</h2>
            <p className="text-red-600 mb-4">{(error as any).message || 'Something went wrong'}</p>
            <button 
              onClick={() => refetch()} 
              className="btn-primary px-4 py-2"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const tasks = tasksData?.tasks || [];
  const totalCampaigns = tasks.length;
  
  // Calculate total leads from all Facebook forms
  const totalLeads = formsData?.forms?.reduce((sum: number, form: any) => sum + (form.leadsCount || 0), 0) || 0;
  
  const completedTasks = tasks.filter((t: any) => t.status === 'COMPLETED').length;
  const failedTasks = tasks.filter((t: any) => t.status === 'FAILED').length;
  const pendingTasks = tasks.filter((t: any) => ['PENDING', 'GENERATING', 'CREATING'].includes(t.status)).length;

  // Calculate aggregate metrics
  const tasksWithMetrics = tasks.filter((t: any) => 
    t.status === 'COMPLETED' && 
    t.actualCPM !== null && 
    t.actualCTR !== null
  );

  const avgCPM = tasksWithMetrics.length > 0
    ? tasksWithMetrics.reduce((sum: number, t: any) => sum + (t.actualCPM || 0), 0) / tasksWithMetrics.length
    : null;

  const avgCTR = tasksWithMetrics.length > 0
    ? tasksWithMetrics.reduce((sum: number, t: any) => sum + (t.actualCTR || 0), 0) / tasksWithMetrics.length
    : null;

  const totalSpend = tasksWithMetrics.reduce((sum: number, t: any) => sum + (t.actualSpend || 0), 0);
  const totalConversions = tasksWithMetrics.reduce((sum: number, t: any) => sum + (t.actualConversions || 0), 0);
  const totalImpressions = tasksWithMetrics.reduce((sum: number, t: any) => sum + (t.impressions || 0), 0);
  const totalClicks = tasksWithMetrics.reduce((sum: number, t: any) => sum + (t.clicks || 0), 0);

  // Find best performer
  const bestPerformer = tasksWithMetrics.length > 0
    ? tasksWithMetrics.reduce((best: any, current: any) => {
        const bestScore = (best.actualCTR || 0) - (best.actualCPM || 999) / 100;
        const currentScore = (current.actualCTR || 0) - (current.actualCPM || 999) / 100;
        return currentScore > bestScore ? current : best;
      }, tasksWithMetrics[0])
    : null;

  const handleSyncAll = async () => {
    setIsSyncing(true);
    try {
      await agentApi.syncAllActiveCampaigns();
      await refetch();
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <MobileTopBar title="Dashboard" />
      
      {/* Bold Gradient Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900">
        <div className="absolute inset-0 bg-grid-white/10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10" />
        
        <div className="relative px-4 lg:px-6 py-8 lg:py-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2 drop-shadow-lg">
                  AI Ads Overview
                </h1>
                <p className="text-white/90 text-lg drop-shadow-md">
                  Create high-performing Meta ads with AI
                </p>
              </div>
              <Link
                href="/agent"
                className="px-6 py-3 bg-white text-purple-600 font-bold rounded-lg hover:bg-gray-50 transition-all shadow-lg hover:-translate-y-1 inline-flex items-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                Start AI Campaign
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      <div className="px-4 lg:px-6 py-6 lg:py-8 space-y-6 pb-20 lg:pb-6">

        {/* Key Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Total Campaigns"
            value={totalCampaigns}
            icon={BarChart3}
            trend={totalCampaigns > 0 ? `${completedTasks} completed` : 'No campaigns yet'}
          />
          <StatCard
            title="Leads Generated"
            value={formsLoading ? '...' : totalLeads}
            icon={Users}
            trend={facebookConnected ? (totalLeads > 0 ? `From ${formsData?.forms?.length || 0} forms` : 'No leads yet') : 'Connect Meta to track leads'}
          />
          <StatCard
            title="Active Tasks"
            value={pendingTasks}
            icon={Loader2}
            trend={pendingTasks > 0 ? 'In progress' : 'No active tasks'}
          />
        </div>

        {/* AI Agent Ready Banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-8 shadow-lg">
          <div className="absolute top-0 right-0 w-64 h-64 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
          <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                <span>🤖</span> AI Agent Ready
              </h2>
              <p className="text-white/90">Let Jupho analyze, create & launch Meta ads automatically.</p>
            </div>
            <Link
              href="/agent"
              className="px-6 py-3 bg-white text-purple-600 font-bold rounded-lg hover:bg-gray-50 transition-all whitespace-nowrap hover:-translate-y-1"
              style={{ boxShadow: '0 8px 24px -4px rgba(0, 0, 0, 0.3)' }}
            >
              Start AI Campaign
            </Link>
          </div>
        </div>

        {/* CTA Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/agent"
            className="bg-orange-500 hover:bg-orange-600 rounded-2xl p-6 text-white transition-all hover:shadow-lg group"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Sparkles size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2 group-hover:translate-x-1 transition-transform">AI Agent</h3>
                <p className="text-white/90 text-sm">Full strategy, copy & campaign creation in minutes.</p>
              </div>
            </div>
          </Link>

          <Link
            href="/templates"
            className="bg-teal-500 hover:bg-teal-600 rounded-2xl p-6 text-white transition-all hover:shadow-lg group"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Target size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2 group-hover:translate-x-1 transition-transform">Templates</h3>
                <p className="text-white/90 text-sm">Proven winning templates with instant launch.</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Performance Overview */}
        {tasksWithMetrics.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-charcoal-900">Campaign Performance Overview</h2>
                <p className="text-sm text-charcoal-600">Aggregated metrics from {tasksWithMetrics.length} campaign{tasksWithMetrics.length !== 1 ? 's' : ''}</p>
              </div>
              <button
                onClick={handleSyncAll}
                disabled={isSyncing}
                className="px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'Syncing...' : 'Refresh Data'}
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-xs text-gray-500 uppercase mb-1">Avg CPM</div>
                <div className="text-2xl font-bold text-gray-900">
                  ₹{avgCPM?.toFixed(2) || '0.00'}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-xs text-gray-500 uppercase mb-1">Avg CTR</div>
                <div className="text-2xl font-bold text-gray-900">
                  {avgCTR?.toFixed(2) || '0.00'}%
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-xs text-gray-500 uppercase mb-1">Total Spend</div>
                <div className="text-2xl font-bold text-gray-900">
                  ₹{totalSpend.toFixed(2)}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-xs text-gray-500 uppercase mb-1">Conversions</div>
                <div className="text-2xl font-bold text-gray-900">
                  {totalConversions}
                </div>
              </div>
            </div>

            {bestPerformer && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-green-900 mb-1">🏆 Best Performer</h3>
                    <div className="text-sm text-green-800 mb-2">
                      {bestPerformer.businessProfile ? 
                        JSON.parse(bestPerformer.businessProfile).businessName || 'Campaign' 
                        : 'Campaign'} • Grade: {bestPerformer.performanceGrade}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-green-700">
                      <span>₹{bestPerformer.actualCPM?.toFixed(2)} CPM</span>
                      <span className="text-green-300">|</span>
                      <span>{bestPerformer.actualCTR?.toFixed(2)}% CTR</span>
                      <span className="text-green-300">|</span>
                      <span>{bestPerformer.actualConversions || 0} conversions</span>
                      <span className="text-green-300">|</span>
                      <span>{bestPerformer.impressions?.toLocaleString() || 0} impressions</span>
                    </div>
                  </div>
                  <Link
                    href={`/agent/tasks/${bestPerformer.id}`}
                    className="text-xs text-green-600 hover:text-green-700 font-medium hover:underline"
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Recent Campaigns */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-charcoal-900">Recent Campaigns</h2>
            <Link href="/agent" className="text-sm text-purple-500 hover:text-purple-600 hover:underline">View all →</Link>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-8">
              <Target className="w-12 h-12 mx-auto mb-3 text-charcoal-400" />
              <p className="text-charcoal-600 mb-4">No tasks yet</p>
              <Link href="/agent" className="btn-primary px-4 py-2">
                <Sparkles size={16} />
                Create Your First Ad
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.filter((task: any) => task.status === 'COMPLETED').slice(0, 5).map((task: any) => (
                <div key={task.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      task.status === 'COMPLETED' ? 'bg-mint-100 text-mint-600' :
                      task.status === 'FAILED' ? 'bg-red-100 text-red-600' :
                      'bg-purple-100 text-purple-600'
                    }`}>
                      {task.status === 'COMPLETED' ? <CheckCircle2 size={20} /> :
                       task.status === 'FAILED' ? <XCircle size={20} /> :
                       <Loader2 size={20} className="animate-spin" />}
                    </div>
                    <div>
                      <p className="font-medium text-charcoal-900">
                        {task.input ? JSON.parse(task.input).objective || 'Ad Creation' : 'Ad Creation'}
                      </p>
                      <p className="text-sm text-charcoal-600 flex items-center gap-1">
                        <Clock size={14} />
                        {new Date(task.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    task.status === 'COMPLETED' ? 'bg-mint-100 text-mint-700' :
                    task.status === 'FAILED' ? 'bg-red-100 text-red-700' :
                    'bg-purple-100 text-purple-700'
                  }`}>
                    {task.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Help Section */}
        <div className="bg-purple-50 rounded-2xl border border-purple-100 p-6">
          <h2 className="text-lg font-semibold text-charcoal-900 mb-2">How it works</h2>
          <div className="grid md:grid-cols-3 gap-4 text-sm text-charcoal-700">
            <div>
              <div className="font-medium mb-1">1. Answer Questions</div>
              <p className="text-charcoal-600">Tell our AI about your business, target audience, and budget</p>
            </div>
            <div>
              <div className="font-medium mb-1">2. Review AI-Generated Copy</div>
              <p className="text-charcoal-600">Get 3 variants of headlines, primary text, and descriptions</p>
            </div>
            <div>
              <div className="font-medium mb-1">3. Launch Your Ad</div>
              <p className="text-charcoal-600">Approve and create ads directly on Facebook in one click</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    }>
      <DashboardPageInner />
    </Suspense>
  );
}
