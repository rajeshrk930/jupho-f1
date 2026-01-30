'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Sparkles, ExternalLink, Calendar, CheckCircle2, XCircle, Clock, RefreshCw, TrendingUp } from 'lucide-react';
import { agentApi } from '@/lib/api';
import PerformanceCard from '@/components/PerformanceCard';
import Toast from '@/components/Toast';
import { useToast } from '@/hooks/useToast';
import { ListSkeleton } from '@/components/Skeleton';

interface Task {
  id: string;
  status: string;
  createdAt: string;
  businessProfile?: string;
  fbCampaignId?: string;
  fbAdId?: string;
  actualCPM?: number;
  actualCTR?: number;
  actualConversions?: number;
  actualSpend?: number;
  impressions?: number;
  clicks?: number;
  performanceGrade?: string;
  lastPerformanceSync?: string;
}

export default function TasksPage() {
  const router = useRouter();
  const { toasts, removeToast, error: showError } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [usage, setUsage] = useState<{ used: number; limit: number } | null>(null);
  const [syncingTaskId, setSyncingTaskId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [tasksResponse, usageResponse] = await Promise.all([
        agentApi.getTasks(50),
        agentApi.getUsage(),
      ]);
      setTasks(tasksResponse.tasks || []);
      setUsage(usageResponse);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncTask = async (taskId: string) => {
    setSyncingTaskId(taskId);
    try {
      await agentApi.syncTaskPerformance(taskId);
      await loadData();
    } catch (error: any) {
      console.error('Sync failed:', error);
      showError(error.response?.data?.error || 'Failed to sync performance data');
    } finally {
      setSyncingTaskId(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'FAILED':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="h-6 w-48 bg-gray-200 animate-pulse rounded"></div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ListSkeleton count={5} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>

      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Dashboard
            </button>
            <div className="flex items-center">
              <Sparkles className="w-6 h-6 text-purple-600 mr-2" />
              <h1 className="text-xl font-bold text-gray-900">Campaign History</h1>
            </div>
            <button
              onClick={() => router.push('/agent')}
              className="btn-primary px-4 py-2"
            >
              New Campaign
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Usage Stats */}
        {usage && (
          <div className="bg-white rounded-xl shadow border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Monthly Usage</h2>
                <p className="text-sm text-gray-600">
                  You've created {usage.used} out of {usage.limit} campaigns this month
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-purple-600">{usage.used}/{usage.limit}</p>
                <p className="text-sm text-gray-500">Campaigns</p>
              </div>
            </div>
            <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-purple-600 h-2 rounded-full transition-all"
                style={{ width: `${(usage.used / usage.limit) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Tasks List */}
        <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Successful Campaigns</h2>
          </div>
          
          {tasks.filter(task => task.status !== 'FAILED').length === 0 ? (
            <div className="p-12 text-center">
              <Sparkles className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No campaigns yet</p>
              <button
                onClick={() => router.push('/agent')}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Create Your First Campaign
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {tasks.filter(task => task.status !== 'FAILED').map((task) => {
                let businessName = 'Unknown Business';
                try {
                  if (task.businessProfile) {
                    const profile = JSON.parse(task.businessProfile);
                    businessName = profile.brandName || profile.businessName || businessName;
                  }
                } catch (e) {
                  // Ignore parse errors
                }

                const hasMetrics = task.actualCPM !== null && task.actualCPM !== undefined;

                return (
                  <div key={task.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        {getStatusIcon(task.status)}
                        <h3 className="ml-3 text-lg font-medium text-gray-900">{businessName}</h3>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-500 mb-3">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(task.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>

                    {/* Performance Metrics - Compact View */}
                    {task.status === 'COMPLETED' && task.fbAdId && (
                      <div className="mb-4">
                        <PerformanceCard
                          cpm={task.actualCPM}
                          ctr={task.actualCTR}
                          conversions={task.actualConversions}
                          spend={task.actualSpend}
                          impressions={task.impressions}
                          clicks={task.clicks}
                          grade={task.performanceGrade}
                          lastSynced={task.lastPerformanceSync ? new Date(task.lastPerformanceSync) : null}
                          compact={true}
                          className="mb-3"
                        />
                        {!hasMetrics && task.lastPerformanceSync === undefined && (
                          <p className="text-xs text-gray-500 mb-2">
                            Performance data will be available 24 hours after launch
                          </p>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      {task.status === 'COMPLETED' && task.fbAdId && (
                        <>
                          <button
                            onClick={() => handleSyncTask(task.id)}
                            disabled={syncingTaskId === task.id}
                            className="inline-flex items-center text-sm text-purple-600 hover:text-purple-700 font-medium disabled:text-gray-400 disabled:cursor-not-allowed"
                          >
                            <RefreshCw className={`w-4 h-4 mr-1 ${syncingTaskId === task.id ? 'animate-spin' : ''}`} />
                            {syncingTaskId === task.id ? 'Syncing...' : 'Sync Now'}
                          </button>
                          <span className="text-gray-300">|</span>
                          <a
                            href={`https://facebook.com/ads/manager/ad/${task.fbAdId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-sm text-purple-600 hover:text-purple-700 font-medium"
                          >
                            View in Ads Manager
                            <ExternalLink className="w-4 h-4 ml-1" />
                          </a>
                          <span className="text-gray-300">|</span>
                          <button
                            onClick={() => router.push(`/agent/tasks/${task.id}`)}
                            className="inline-flex items-center text-sm text-purple-600 hover:text-purple-700 font-medium"
                          >
                            <TrendingUp className="w-4 h-4 mr-1" />
                            View Details
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
