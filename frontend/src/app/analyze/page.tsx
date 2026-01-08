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
  const usageCount = usageData?.analysisCount || 0;
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
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Main Form - Left Side */}
          <div className="flex-1 max-w-2xl">
            {/* Bold Gradient Header */}
            <div className="gradient-header mb-6">
              <p className="text-sm text-teal-100 font-bold uppercase tracking-wider mb-2">Analysis</p>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-3">Analyze Your Creative</h1>
              <p className="text-base md:text-lg text-teal-50 font-medium">Upload your ad creative and get instant insights</p>
            </div>
            
            <div className="bg-white rounded-2xl border-4 border-gray-900 p-6 md:p-8 shadow-bold-xl">
              <AnalyzeForm onSubmit={handleSubmit} isLoading={isLoading} />
            </div>
          </div>

          {/* Recent Analyses Sidebar - Right Side */}
          {recentAnalyses.length > 0 && (
            <div className="w-full lg:w-80 lg:shrink-0">
              <div className="bg-white rounded-2xl border-4 border-gray-900 p-6 shadow-bold-xl sticky top-24">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center shadow-md">
                      <Clock size={20} className="text-white" />
                    </div>
                    <h3 className="font-black text-gray-900 text-lg">Recent Analyses</h3>
                  </div>
                  <Link 
                    href="/history"
                    className="text-xs text-white bg-teal-600 hover:bg-teal-700 px-3 py-1.5 rounded-lg font-bold shadow-md flex items-center gap-1 uppercase tracking-wide"
                  >
                    All
                    <ChevronRight size={12} />
                  </Link>
                </div>

                <div className="space-y-4">
                  {recentAnalyses.map((analysis: Analysis) => {
                    const resultIcon = {
                      WINNING: <TrendingUp size={18} className="text-green-600" />,
                      AVERAGE: <Minus size={18} className="text-yellow-600" />,
                      DEAD: <TrendingDown size={18} className="text-red-600" />,
                    }[analysis.resultType] || <Minus size={18} className="text-gray-400" />;

                    return (
                      <Link
                        key={analysis.id}
                        href={`/history`}
                        className="block p-4 rounded-xl border-2 border-gray-300 hover:border-teal-600 hover:shadow-bold group"
                      >
                        <div className="flex items-start gap-3">
                          {/* Image Thumbnail */}
                          {analysis.imageUrl && (
                            <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-gray-100 border-2 border-gray-300">
                              <img 
                                src={analysis.imageUrl} 
                                alt="Creative thumbnail" 
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          
                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              {resultIcon}
                              <span className="text-sm text-gray-700 font-bold">
                                {new Date(analysis.createdAt).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric' 
                                })}
                              </span>
                            </div>
                            <p className="text-sm font-bold text-gray-900 line-clamp-2 group-hover:text-teal-700 mb-2">
                              {analysis.primaryReason || 'Analysis result'}
                            </p>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-bold px-2 py-1 bg-teal-100 text-teal-900 rounded-lg">CTR {analysis.ctr}%</span>
                              {analysis.industry && (
                                <span className="text-xs px-2 py-1 rounded-lg bg-slate-100 text-slate-900 font-bold">
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
                <div className="mt-5 pt-5 border-t-2 border-gray-200 bg-gradient-to-r from-blue-50 to-slate-100 p-4 rounded-xl">
                  <p className="text-sm text-gray-900 font-bold">
                    💡 <span className="font-black">Pro Tip:</span> Compare multiple creatives to find patterns in what works for your audience
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
