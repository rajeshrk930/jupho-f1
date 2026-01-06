'use client';

import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { analysisApi } from '@/lib/api';
import { Analysis } from '@/types';
import { AnalyzeForm } from '@/components/AnalyzeForm';
import { AnalysisDrawer } from '@/components/AnalysisDrawer';
import toast from 'react-hot-toast';

export default function AnalyzePage() {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<Analysis | null>(null);
  const [showDrawer, setShowDrawer] = useState(false);

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
    <div className="min-h-screen bg-gray-50 pt-6">
      {/* Centered Form */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs text-blue-600 font-medium">Analysis</p>
              <h1 className="text-2xl font-bold text-gray-900">Analyze Your Creative</h1>
              <p className="text-sm text-gray-600 mt-1">Upload your ad creative and get instant insights</p>
            </div>
          </div>
          <AnalyzeForm onSubmit={handleSubmit} isLoading={isLoading} />
        </div>
      </main>

      {/* Slide-out Drawer */}
      <AnalysisDrawer
        isOpen={showDrawer}
        onClose={handleCloseDrawer}
        isLoading={isLoading}
        result={result}
      />
    </div>
  );
}
