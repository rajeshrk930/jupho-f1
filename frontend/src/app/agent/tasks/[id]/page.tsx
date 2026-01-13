'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Loader2, ExternalLink, Calendar, TrendingUp, Target, DollarSign, MousePointerClick, Eye } from 'lucide-react';
import { agentApi } from '@/lib/api';
import PerformanceCard from '@/components/PerformanceCard';

export default function TaskDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const taskId = params?.id as string;

  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (taskId) {
      loadTaskDetails();
    }
  }, [taskId]);

  const loadTaskDetails = async () => {
    try {
      const response = await agentApi.getTaskDetails(taskId);
      setTask(response.task);
    } catch (error) {
      console.error('Failed to load task:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      await agentApi.syncTaskPerformance(taskId);
      await loadTaskDetails();
    } catch (error: any) {
      console.error('Sync failed:', error);
      alert(error.response?.data?.error || 'Failed to sync performance data');
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-purple-600 animate-spin" />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Task not found</p>
          <button
            onClick={() => router.push('/agent/tasks')}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Back to Tasks
          </button>
        </div>
      </div>
    );
  }

  let businessProfile: any = {};
  let input: any = {};
  let output: any = {};
  let recommendations: any = {};

  try {
    businessProfile = task.businessProfile ? JSON.parse(task.businessProfile) : {};
    input = task.input ? JSON.parse(task.input) : {};
    output = task.output ? JSON.parse(task.output) : {};
    recommendations = task.recommendations ? JSON.parse(task.recommendations) : {};
  } catch (e) {
    console.error('Parse error:', e);
  }

  const businessName = businessProfile.businessName || businessProfile.brandName || 'Campaign';
  const hasMetrics = task.actualCPM !== null && task.actualCPM !== undefined;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/agent/tasks')}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Tasks
            </button>
            {task.fbAdId && (
              <a
                href={`https://facebook.com/ads/manager/ad/${task.fbAdId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                View in Ads Manager
                <ExternalLink className="w-4 h-4 ml-2" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Campaign Header */}
        <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{businessName}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  Created {new Date(task.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
                {task.completedAt && (
                  <div className="flex items-center">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    Completed {new Date(task.completedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </div>
                )}
              </div>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${
              task.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
              task.status === 'FAILED' ? 'bg-red-100 text-red-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {task.status}
            </span>
          </div>

          {businessProfile.businessDescription && (
            <p className="text-gray-700 mb-4">{businessProfile.businessDescription}</p>
          )}

          {/* Campaign Details */}
          <div className="grid md:grid-cols-3 gap-4 mt-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center text-gray-600 mb-1">
                <Target className="w-4 h-4 mr-2" />
                <span className="text-xs uppercase font-medium">Objective</span>
              </div>
              <p className="text-gray-900 font-semibold">{input.objective || 'TRAFFIC'}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center text-gray-600 mb-1">
                <DollarSign className="w-4 h-4 mr-2" />
                <span className="text-xs uppercase font-medium">Budget</span>
              </div>
              <p className="text-gray-900 font-semibold">
                ₹{recommendations.suggestedBudget || input.budget || 'N/A'}/day
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center text-gray-600 mb-1">
                <MousePointerClick className="w-4 h-4 mr-2" />
                <span className="text-xs uppercase font-medium">Conversion Method</span>
              </div>
              <p className="text-gray-900 font-semibold">
                {input.conversionMethod === 'lead_form' ? 'Lead Form' : 'Website'}
              </p>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        {task.status === 'COMPLETED' && task.fbAdId && (
          <PerformanceCard
            cpm={task.actualCPM}
            ctr={task.actualCTR}
            conversions={task.actualConversions}
            spend={task.actualSpend}
            impressions={task.impressions}
            clicks={task.clicks}
            grade={task.performanceGrade}
            lastSynced={task.lastPerformanceSync ? new Date(task.lastPerformanceSync) : null}
            onSync={handleSync}
            isSyncing={syncing}
          />
        )}

        {/* AI-Generated Creative Variants */}
        {task.generatedCreatives && task.generatedCreatives.length > 0 && (
          <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">AI-Generated Ad Copy</h2>
            
            {/* Headlines */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 uppercase mb-3">Headlines</h3>
              <div className="space-y-2">
                {task.generatedCreatives
                  .filter((c: any) => c.type === 'HEADLINE')
                  .map((creative: any, idx: number) => (
                    <div
                      key={creative.id}
                      className={`p-3 rounded-lg border ${
                        creative.isSelected
                          ? 'border-purple-300 bg-purple-50'
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <p className="text-gray-900">{creative.content}</p>
                        {creative.isSelected && (
                          <span className="ml-2 px-2 py-1 bg-purple-600 text-white text-xs rounded">
                            Selected
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Primary Text */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 uppercase mb-3">Primary Text</h3>
              <div className="space-y-2">
                {task.generatedCreatives
                  .filter((c: any) => c.type === 'PRIMARY_TEXT')
                  .map((creative: any) => (
                    <div
                      key={creative.id}
                      className={`p-3 rounded-lg border ${
                        creative.isSelected
                          ? 'border-purple-300 bg-purple-50'
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <p className="text-gray-900">{creative.content}</p>
                        {creative.isSelected && (
                          <span className="ml-2 px-2 py-1 bg-purple-600 text-white text-xs rounded flex-shrink-0">
                            Selected
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Descriptions */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 uppercase mb-3">Descriptions</h3>
              <div className="space-y-2">
                {task.generatedCreatives
                  .filter((c: any) => c.type === 'DESCRIPTION')
                  .map((creative: any) => (
                    <div
                      key={creative.id}
                      className={`p-3 rounded-lg border ${
                        creative.isSelected
                          ? 'border-purple-300 bg-purple-50'
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <p className="text-gray-900">{creative.content}</p>
                        {creative.isSelected && (
                          <span className="ml-2 px-2 py-1 bg-purple-600 text-white text-xs rounded flex-shrink-0">
                            Selected
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* Targeting & Recommendations */}
        {recommendations.targeting && (
          <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Targeting Strategy</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Location */}
              {recommendations.targeting.locations && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Locations</h3>
                  <div className="flex flex-wrap gap-2">
                    {recommendations.targeting.locations.map((loc: string, idx: number) => (
                      <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                        {loc}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Age Range */}
              {recommendations.targeting.ageRange && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Age Range</h3>
                  <p className="text-gray-900">
                    {recommendations.targeting.ageRange.min} - {recommendations.targeting.ageRange.max} years
                  </p>
                </div>
              )}

              {/* Interests */}
              {recommendations.targeting.interests && recommendations.targeting.interests.length > 0 && (
                <div className="md:col-span-2">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Interests</h3>
                  <div className="flex flex-wrap gap-2">
                    {recommendations.targeting.interests.slice(0, 10).map((interest: string, idx: number) => (
                      <span key={idx} className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full">
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Error Message */}
        {task.status === 'FAILED' && task.errorMessage && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-red-900 mb-2">Error Details</h3>
            <p className="text-sm text-red-700">{task.errorMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
}
