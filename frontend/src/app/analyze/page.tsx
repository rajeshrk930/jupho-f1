'use client';

import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { analysisApi, chatApi } from '@/lib/api';
import { Analysis } from '@/types';
import { AnalyzeForm } from '@/components/AnalyzeForm';
import { AnalysisDrawer } from '@/components/AnalysisDrawer';
import { useAuthStore } from '@/lib/store';
import { Clock, ChevronRight, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import MobileTopBar from '@/components/MobileTopBar';
import UsageCounter from '@/components/UsageCounter';
import UpgradeModal from '@/components/UpgradeModal';

export default function AnalyzePage() {
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<Analysis | null>(null);
  const [showDrawer, setShowDrawer] = useState(false);

  // Fetch recent analyses
  const { data: recentData } = useQuery({
    queryKey: ['recent-analyses'],
    queryFn: () => analysisApi.getAll({ limit: 5, page: 1 }),
    enabled: isAuthenticated,
  });

  // Fetch usage stats
  const { data: usageData } = useQuery({
    queryKey: ['usage-stats'],
    queryFn: async () => {
      const response = await chatApi.getUsage();
      return response.data;
    },
    enabled: isAuthenticated,
  });

  const recentAnalyses = recentData?.data?.analyses || [];
  const isPro = user?.proExpiresAt && new Date(user.proExpiresAt) > new Date();
  const usageCount = usageData?.apiUsageCount || 0;
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    if (isLoading || result) {
      setShowDrawer(true);
    }
  }, [isLoading, result]);

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);

    // Simulate small delay for UX
    await new Promise((resolve) => setTimeout(resolve, 500));

    await submitAnalysis(formData);
  };

  const submitAnalysis = async (formData: FormData) => {
    setIsLoading(true);
    try {
      const response = await analysisApi.create(formData);
      if (response.success) {
        setResult(response.data);
        toast.success('Analysis complete');
        // Invalidate queries to refresh history page
        queryClient.invalidateQueries({ queryKey: ['analyses'] });
        queryClient.invalidateQueries({ queryKey: ['recent-analyses'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
        queryClient.invalidateQueries({ queryKey: ['usage-stats'] });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Analysis failed');
      setShowDrawer(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseDrawer = () => {
    setShowDrawer(false);
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-base">
      <MobileTopBar title="Analyze" rightContent={<UsageCounter isPro={!!isPro} usageCount={usageCount} limit={3} onUpgradeClick={() => setShowUpgradeModal(true)} compact />} />
      {/* Main Content */}
      <main className="px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Form - Left Side */}
          <div className="flex-1 max-w-2xl">
            {/* Simple Header */}
            <div className="bg-base-surface border border-border-default rounded-md p-6 shadow-sm mb-6">
              <p className="text-xs text-signal-primary font-medium uppercase tracking-wider mb-1">Analysis</p>
              <h1 className="text-2xl font-semibold text-text-primary mb-2">Analyze Your Creative</h1>
              <p className="text-sm text-text-secondary">Upload your ad creative and get instant insights</p>
            </div>
            
            <div className="bg-base-surface rounded-md border border-border-default p-6 md:p-8 shadow-sm">
              <AnalyzeForm onSubmit={handleSubmit} isLoading={isLoading} />
            </div>
          </div>

          {/* Recent Analyses Sidebar - Right Side */}
          {recentAnalyses.length > 0 && (
            <div className="w-full lg:w-80 lg:shrink-0">
              <div className="bg-base-surface rounded-md border border-border-default p-5 shadow-sm sticky top-24">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-md bg-base-elevated flex items-center justify-center">
                      <Clock size={18} className="text-signal-primary" />
                    </div>
                    <h3 className="font-semibold text-text-primary text-base">Recent Analyses</h3>
                  </div>
                  <Link 
                    href="/history"
                    className="text-xs text-signal-primary hover:text-signal-primary/80 font-medium"
                  >
                    View All →
                  </Link>
                </div>

                <div className="space-y-3">
                  {recentAnalyses.map((analysis: Analysis) => {
                    const resultIcon = {
                      WINNING: <TrendingUp size={16} className="text-text-primary" />,
                      AVERAGE: <Minus size={16} className="text-text-secondary" />,
                      DEAD: <TrendingDown size={16} className="text-signal-danger" />,
                    }[analysis.resultType] || <Minus size={16} className="text-text-tertiary" />;

                    return (
                      <Link
                        key={analysis.id}
                        href={`/history`}
                        className="block p-3 rounded-md border border-border-default hover:border-signal-primary hover:shadow-md group"
                      >
                        <div className="flex items-start gap-3">
                          {/* Image Thumbnail */}
                          {analysis.imageUrl && (
                            <div className="w-12 h-12 rounded-md overflow-hidden shrink-0 bg-base-elevated border border-border-default">
                              <img 
                                src={analysis.imageUrl} 
                                alt="Creative thumbnail" 
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          
                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              {resultIcon}
                              <span className="text-xs text-text-tertiary font-medium">
                                {new Date(analysis.createdAt).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric' 
                                })}
                              </span>
                            </div>
                            <p className="text-sm font-semibold text-text-primary line-clamp-2 group-hover:text-signal-primary mb-1">
                              {analysis.primaryReason || 'Analysis result'}
                            </p>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-medium px-2 py-0.5 bg-signal-primary/10 text-signal-primary rounded-sm">CTR {analysis.ctr}%</span>
                              {analysis.industry && (
                                <span className="text-xs px-2 py-0.5 rounded-sm bg-base-elevated text-text-secondary font-medium">
                                  {analysis.industry.replace('_', ' ')}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                {/* Quick Tip */}
                <div className="mt-4 pt-4 border-t border-border-subtle bg-base-elevated p-3 rounded-md">
                  <p className="text-xs text-text-secondary">
                    💡 <span className="font-semibold">Pro Tip:</span> Compare multiple creatives to find patterns in what works for your audience
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Slide-out Drawer */}
      <AnalysisDrawer
        isOpen={showDrawer}
        onClose={handleCloseDrawer}
        isLoading={isLoading}
        result={result}
      />
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onUpgradeComplete={() => setShowUpgradeModal(false)}
      />
    </div>
  );
}
