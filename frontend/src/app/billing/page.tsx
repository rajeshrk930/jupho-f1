'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { chatApi } from '@/lib/api';
import { Zap, Check, Calendar, TrendingUp, Clock, Download, Receipt } from 'lucide-react';
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
      <div className="min-h-screen bg-gray-50 py-12 px-4">
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
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Billing & Plans</h1>
          <p className="text-gray-600">Manage your subscription and view usage statistics</p>
        </div>

        {/* Current Plan Card */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Plan Status */}
          <div className={`rounded-lg p-6 border-2 ${isPro ? 'bg-white border-teal-600' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isPro ? 'bg-teal-50' : 'bg-gray-100'}`}>
                  <Zap className={`w-6 h-6 ${isPro ? 'text-teal-700' : 'text-gray-600'}`} />
                </div>
                <div>
                  <h2 className={`text-2xl font-bold ${isPro ? 'text-teal-700' : 'text-gray-900'}`}>
                    {isPro ? 'Jupho Pro' : 'Free Plan'}
                  </h2>
                  <p className={`text-sm ${isPro ? 'text-gray-600' : 'text-gray-600'}`}>
                    {isPro ? '₹999 / month' : 'No payment required'}
                  </p>
                </div>
              </div>
              {isPro && (
                <div className="bg-teal-50 px-3 py-1 rounded">
                  <span className="text-teal-700 text-sm font-medium">Active</span>
                </div>
              )}
            </div>

            <div className="space-y-3 mb-6">
              {isPro ? (
                <>
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 text-sm">Unlimited AI assistant questions</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 text-sm">Priority response time</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 text-sm">Advanced analysis features</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 text-sm">Export unlimited reports</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 text-sm">Email support</span>
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
              <div className="bg-teal-50 rounded-lg p-4 border border-teal-200">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-teal-700" />
                  <span className="text-teal-900 text-sm font-medium">Subscription Details</span>
                </div>
                <div className="space-y-1">
                  <p className="text-teal-700 text-xs">
                    Expires in: <span className="font-semibold text-teal-900">{daysLeft} days</span>
                  </p>
                  <p className="text-teal-700 text-xs">
                    Next renewal: <span className="font-semibold text-teal-900">
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
                className="w-full bg-teal-600 text-white py-3 rounded-lg font-medium hover:bg-teal-700 transition-colors shadow-sm"
              >
                Upgrade to Pro
              </button>
            )}
          </div>

          {/* Usage Stats */}
          <div className="bg-white rounded-lg p-6 border-2 border-gray-200 space-y-6">
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
                    className="h-3 rounded-full bg-teal-600 transition-all"
                    style={{ 
                      width: `${Math.min(((usageStats?.apiUsageCount || 0) / (usageStats?.limit || 10)) * 100, 100)}%` 
                    }}
                  />
                </div>
              )}
            </div>

            {/* Reset Info */}
            {!isPro && (
              <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-teal-700" />
                  <span className="text-sm font-medium text-teal-900">Daily Reset</span>
                </div>
                <p className="text-xs text-teal-700">
                  Your question limit resets at midnight (IST)
                </p>
                <p className="text-xs text-teal-700 mt-1">
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

        {/* Transaction History - Only show for Pro users */}
        {isPro && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-5">
              <Receipt className="w-5 h-5 text-gray-600" />
              <div>
                <h2 className="text-lg font-bold text-gray-900">Transaction History</h2>
                <p className="text-sm text-gray-600">View and download your payment receipts</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-700 uppercase">Date</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-700 uppercase">Description</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-700 uppercase">Amount</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-700 uppercase">Status</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-700 uppercase">Invoice</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {usageStats?.proExpiresAt 
                        ? new Date(new Date(usageStats.proExpiresAt).getTime() - 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })
                        : new Date().toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900">Jupho Pro Subscription</div>
                      <div className="text-xs text-gray-500">Monthly plan renewal</div>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">₹999.00</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Paid
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button 
                        onClick={() => toast.success('Invoice download will be available soon')}
                        className="text-teal-700 hover:text-teal-600 font-medium text-sm inline-flex items-center gap-1"
                      >
                        <Download size={14} />
                        PDF
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Empty state placeholder for demo */}
              <div className="text-center py-6 border-t border-gray-200 bg-gray-50">
                <p className="text-sm text-gray-600">Previous transactions will appear here</p>
                <p className="text-xs text-gray-500 mt-1">You'll see a complete history of all your payments</p>
              </div>
            </div>
          </div>
        )}

        {/* Payment Method (Pro users only) */}
        {isPro && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Payment Method</h2>
                <p className="text-sm text-gray-600">Manage your billing information</p>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-teal-50 rounded flex items-center justify-center">
                  <svg className="w-6 h-6 text-teal-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Razorpay</p>
                  <p className="text-xs text-gray-500">Auto-renews on {usageStats?.proExpiresAt 
                    ? new Date(usageStats.proExpiresAt).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })
                    : 'renewal date'}</p>
                </div>
              </div>
              <button 
                onClick={() => toast.info('Payment method management coming soon')}
                className="text-teal-700 hover:text-teal-600 font-medium text-sm"
              >
                Update
              </button>
            </div>

            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Your subscription will auto-renew. You can cancel anytime from Settings.
              </p>
            </div>
          </div>
        )}

        {/* Upgrade CTA for Free Users */}
        {!isPro && (
          <div className="bg-teal-600 border-2 border-teal-700 rounded-lg p-8 text-center">
            <div className="max-w-2xl mx-auto">
              <div className="w-16 h-16 bg-teal-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Ready to unlock unlimited potential?</h2>
              <p className="text-teal-50 mb-6">
                Upgrade to Jupho Pro and get unlimited AI conversations, priority support, and advanced features for just ₹999/month.
              </p>
              <button
                onClick={() => setShowUpgradeModal(true)}
                className="bg-white text-teal-700 px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors shadow-sm inline-flex items-center gap-2"
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
