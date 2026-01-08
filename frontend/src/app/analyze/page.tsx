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
    <div className="min-h-screen bg-gray-50">
      <MobileTopBar title="Analyze" rightContent={<UsageCounter isPro={!!isPro} usageCount={usageCount} limit={3} onUpgradeClick={() => setShowUpgradeModal(true)} compact />} />
      {/* Main Content */}
      <main className="px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Form - Left Side */}
          <div className="flex-1 max-w-2xl">
            {/* Simple Header */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm mb-6">
              <p className="text-xs text-teal-600 font-medium uppercase tracking-wider mb-1">Analysis</p>
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">Analyze Your Creative</h1>
              <p className="text-sm text-gray-600">Upload your ad creative and get instant insights</p>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 p-6 md:p-8 shadow-sm">
              <AnalyzeForm onSubmit={handleSubmit} isLoading={isLoading} />
            </div>
          </div>

          {/* Recent Analyses Sidebar - Right Side */}
          {recentAnalyses.length > 0 && (
            <div className="w-full lg:w-80 lg:shrink-0">
              <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm sticky top-24">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-lg bg-teal-50 flex items-center justify-center">
                      <Clock size={18} className="text-teal-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 text-base">Recent Analyses</h3>
                  </div>
                  <Link 
                    href="/history"
                    className="text-xs text-teal-600 hover:text-teal-700 font-medium"
                  >
                    View All →
                  </Link>
                </div>

                <div className="space-y-3">
                  {recentAnalyses.map((analysis: Analysis) => {
                    const resultIcon = {
                      WINNING: <TrendingUp size={16} className="text-emerald-600" />,
                      AVERAGE: <Minus size={16} className="text-amber-600" />,
                      DEAD: <TrendingDown size={16} className="text-rose-600" />,
                    }[analysis.resultType] || <Minus size={16} className="text-gray-400" />;

                    return (
                      <Link
                        key={analysis.id}
                        href={`/history`}
                        className="block p-3 rounded-lg border border-gray-200 hover:border-teal-300 hover:shadow-md group"
                      >
                        <div className="flex items-start gap-3">
                          {/* Image Thumbnail */}
                          {analysis.imageUrl && (
                            <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-gray-100 border border-gray-200">
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
                              <span className="text-xs text-gray-600 font-medium">
                                {new Date(analysis.createdAt).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric' 
                                })}
                              </span>
                            </div>
                            <p className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-teal-600 mb-1">
                              {analysis.primaryReason || 'Analysis result'}
                            </p>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-medium px-2 py-0.5 bg-teal-50 text-teal-700 rounded">CTR {analysis.ctr}%</span>
                              {analysis.industry && (
                                <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-700 font-medium">
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
                <div className="mt-4 pt-4 border-t border-gray-200 bg-blue-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-700">
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
