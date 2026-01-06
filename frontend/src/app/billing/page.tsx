'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { chatApi } from '@/lib/api';
import { Zap, Check, Calendar, TrendingUp, Clock } from 'lucide-react';
import UpgradeModal from '@/components/UpgradeModal';
import toast from 'react-hot-toast';

interface UsageStats {
  apiUsageCount: number;
  isPro: boolean;
  limit: number;
  resetsAt: string;
  proExpiresAt: string | null;
}

export default function BillingPage() {
  const { user } = useAuthStore();
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadUsageStats = async () => {
    try {
      const resp = await chatApi.getUsage();
      setUsageStats(resp.data);
    } catch (e) {
      toast.error('Failed to load usage stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadUsageStats();
  }, []);

  const handleUpgradeComplete = () => {
    void loadUsageStats();
    toast.success('Welcome to Jupho Pro! You now have unlimited questions.');
  };

  const isPro = usageStats?.isPro || false;
  const daysLeft = usageStats?.proExpiresAt
    ? Math.max(0, Math.ceil((new Date(usageStats.proExpiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 rounded w-64"></div>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="h-64 bg-gray-200 rounded-2xl"></div>
              <div className="h-64 bg-gray-200 rounded-2xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Billing & Plans</h1>
          <p className="text-gray-600">Manage your subscription and view usage statistics</p>
        </div>

        {/* Current Plan Card */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Plan Status */}
          <div className={`rounded-2xl p-6 border-2 ${isPro ? 'bg-gradient-to-br from-blue-500 to-purple-600 border-purple-600' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isPro ? 'bg-white/20' : 'bg-gray-100'}`}>
                  <Zap className={`w-6 h-6 ${isPro ? 'text-white' : 'text-gray-600'}`} />
                </div>
                <div>
                  <h2 className={`text-2xl font-bold ${isPro ? 'text-white' : 'text-gray-900'}`}>
                    {isPro ? 'Jupho Pro' : 'Free Plan'}
                  </h2>
                  <p className={`text-sm ${isPro ? 'text-blue-100' : 'text-gray-600'}`}>
                    {isPro ? '₹999 / month' : 'No payment required'}
                  </p>
                </div>
              </div>
              {isPro && (
                <div className="bg-white/20 px-3 py-1 rounded-full">
                  <span className="text-white text-sm font-medium">Active</span>
                </div>
              )}
            </div>

            <div className="space-y-3 mb-6">
              {isPro ? (
                <>
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-white mt-0.5 flex-shrink-0" />
                    <span className="text-white text-sm">Unlimited AI assistant questions</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-white mt-0.5 flex-shrink-0" />
                    <span className="text-white text-sm">Priority response time</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-white mt-0.5 flex-shrink-0" />
                    <span className="text-white text-sm">Advanced analysis features</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-white mt-0.5 flex-shrink-0" />
                    <span className="text-white text-sm">Export unlimited reports</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-white mt-0.5 flex-shrink-0" />
                    <span className="text-white text-sm">Email support</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 text-sm">10 AI questions per day</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 text-sm">Basic analysis features</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 text-sm">Standard response time</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 text-sm">Export reports (limited)</span>
                  </div>
                </>
              )}
            </div>

            {isPro ? (
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-white" />
                  <span className="text-white text-sm font-medium">Subscription Details</span>
                </div>
                <div className="space-y-1">
                  <p className="text-blue-100 text-xs">
                    Expires in: <span className="font-semibold text-white">{daysLeft} days</span>
                  </p>
                  <p className="text-blue-100 text-xs">
                    Next renewal: <span className="font-semibold text-white">
                      {usageStats?.proExpiresAt ? new Date(usageStats.proExpiresAt).toLocaleDateString('en-US', { 
                        month: 'long', 
                        day: 'numeric', 
                        year: 'numeric' 
                      }) : 'N/A'}
                    </span>
                  </p>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowUpgradeModal(true)}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
              >
                Upgrade to Pro
              </button>
            )}
          </div>

          {/* Usage Stats */}
          <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Usage Statistics</h3>
              <p className="text-sm text-gray-600">Your current usage this period</p>
            </div>

            {/* Questions Used */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Questions Used</span>
                </div>
                <span className="text-sm font-bold text-gray-900">
                  {isPro ? '∞' : `${usageStats?.apiUsageCount || 0}/${usageStats?.limit || 10}`}
                </span>
              </div>
              {!isPro && (
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all"
                    style={{ 
                      width: `${Math.min(((usageStats?.apiUsageCount || 0) / (usageStats?.limit || 10)) * 100, 100)}%` 
                    }}
                  />
                </div>
              )}
            </div>

            {/* Reset Info */}
            {!isPro && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">Daily Reset</span>
                </div>
                <p className="text-xs text-blue-700">
                  Your question limit resets at midnight (IST)
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Next reset: {usageStats?.resetsAt ? new Date(usageStats.resetsAt).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  }) : 'Tonight'}
                </p>
              </div>
            )}

            {/* Account Info */}
            <div className="pt-4 border-t border-gray-200">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Account Email</span>
                  <span className="font-medium text-gray-900">{user?.email}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Member Since</span>
                  <span className="font-medium text-gray-900">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { 
                      month: 'short', 
                      year: 'numeric' 
                    }) : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Current Plan</span>
                  <span className={`font-bold ${isPro ? 'text-purple-600' : 'text-gray-900'}`}>
                    {isPro ? 'PRO' : 'FREE'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Upgrade CTA for Free Users */}
        {!isPro && (
          <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-8 text-center">
            <div className="max-w-2xl mx-auto">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Ready to unlock unlimited potential?</h2>
              <p className="text-blue-100 mb-6">
                Upgrade to Jupho Pro and get unlimited AI conversations, priority support, and advanced features for just ₹999/month.
              </p>
              <button
                onClick={() => setShowUpgradeModal(true)}
                className="bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl inline-flex items-center gap-2"
              >
                <Zap className="w-5 h-5" />
                Upgrade to Pro Now
              </button>
            </div>
          </div>
        )}
      </div>

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onUpgradeComplete={handleUpgradeComplete}
      />
    </div>
  );
}
