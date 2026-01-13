'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/store';
import { agentApi } from '@/lib/api';
import { Zap, Check, Calendar, TrendingUp, Clock, Download, Receipt } from 'lucide-react';
import UpgradeModal from '@/components/UpgradeModal';
import toast from 'react-hot-toast';

interface UsageStats {
  used: number;
  limit: number;
  remaining: number;
  plan: string;
  resetsAt: string;
  proExpiresAt: string | null;
}

export default function BillingPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Auth guard
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login?redirect=/billing');
    }
  }, [isAuthenticated, router]);

  const { data: usageData, isLoading: loading, isError, error } = useQuery({
    queryKey: ['usage-stats'],
    enabled: !!user && isAuthenticated, // avoid running before auth is ready
    queryFn: async () => {
      try {
        const data = await agentApi.getUsage();
        if (!data) {
          throw new Error('Usage data is undefined');
        }
        return data;
      } catch (err: any) {
        console.error('Usage API Error:', err);
        console.error('Error response:', err?.response?.data);
        console.error('Error status:', err?.response?.status);
        throw err;
      }
    },
    refetchInterval: 10000, // Auto-refresh every 10 seconds
    retry: 2,
  });

  const usageStats = usageData || null;

  const handleUpgradeComplete = () => {
    queryClient.invalidateQueries({ queryKey: ['usage-stats'] });
    toast.success('Welcome to Jupho Pro! You now have unlimited questions.');
  };

  const isPro = usageStats?.plan === 'PRO';
  const daysLeft = usageStats?.proExpiresAt
    ? Math.max(0, Math.ceil((new Date(usageStats.proExpiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  // Show loading while checking auth
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coral-500"></div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-coral-50 py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 rounded w-64"></div>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="h-64 bg-gray-200 rounded-md"></div>
              <div className="h-64 bg-gray-200 rounded-md"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-coral-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-red-800 font-semibold mb-2">Failed to load billing data</h2>
          <p className="text-red-600 text-sm">{(error as any)?.message || 'Something went wrong'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-coral-50 py-8 px-6">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-charcoal-900 mb-2">Billing & Plans</h1>
          <p className="text-charcoal-600">Manage your subscription and view usage statistics</p>
        </div>

        {/* Current Plan Card */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Plan Status */}
          <div className={`rounded-md p-6 border-2 ${isPro ? 'bg-base-elevated border-signal-primary' : 'bg-base-elevated border-border-default'}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-md flex items-center justify-center ${isPro ? 'bg-signal-primary/10' : 'bg-base-surface'}`}>
                  <Zap className={`w-6 h-6 ${isPro ? 'text-signal-primary' : 'text-text-secondary'}`} />
                </div>
                <div>
                  <h2 className={`text-2xl font-bold ${isPro ? 'text-signal-primary' : 'text-text-primary'}`}>
                    {isPro ? 'Jupho Pro' : 'Free Plan'}
                  </h2>
                  <p className={`text-sm ${isPro ? 'text-text-secondary' : 'text-text-secondary'}`}>
                    {isPro ? '₹1,999 / month' : 'No payment required'}
                  </p>
                </div>
              </div>
              {isPro && (
                <div className="bg-signal-primary/10 px-3 py-1 rounded-sm">
                  <span className="text-signal-primary text-sm font-medium">Active</span>
                </div>
              )}
            </div>

            <div className="space-y-3 mb-6">
              {isPro ? (
                <>
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-text-secondary text-sm">50 AI-created campaigns per month</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-text-secondary text-sm">Unlimited AI ad copy generation</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-text-secondary text-sm">Advanced targeting recommendations</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-text-secondary text-sm">Direct Facebook ad publishing</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-text-secondary text-sm">Priority support</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-text-secondary text-sm">5 campaigns per month</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-text-secondary text-sm">Auto-generated ad copy</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-text-secondary text-sm">Campaign history tracking</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-text-secondary text-sm">Basic support</span>
                  </div>
                </>
              )}
            </div>

            {isPro ? (
              <div className="bg-signal-primary/10 rounded-md p-4 border border-signal-primary/20">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-signal-primary" />
                  <span className="text-text-primary text-sm font-medium">Subscription Details</span>
                </div>
                <div className="space-y-1">
                  <p className="text-text-secondary text-xs">
                    Expires in: <span className="font-semibold text-text-primary">{daysLeft} days</span>
                  </p>
                  <p className="text-text-secondary text-xs">
                    Next renewal: <span className="font-semibold text-text-primary">
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
                className="btn-primary w-full"
              >
                Upgrade to Pro
              </button>
            )}
          </div>

          {/* Usage Stats */}
          <div className="bg-base-elevated rounded-md p-6 border-2 border-border-default space-y-6">
            <div>
              <h3 className="text-lg font-bold text-text-primary mb-1">Usage Statistics</h3>
              <p className="text-sm text-text-secondary">Your current usage this period</p>
            </div>

            {/* Campaigns Created */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-text-secondary" />
                  <span className="text-sm font-medium text-text-secondary">Campaigns Created</span>
                </div>
                <span className="text-sm font-bold text-text-primary">
                  {isPro ? `${usageStats?.used || 0}/50` : `${usageStats?.used || 0}/${usageStats?.limit || 5}`}
                </span>
              </div>
              {!isPro && (
                <div className="w-full bg-base-surface rounded-sm h-3">
                  <div
                    className="h-3 rounded-sm bg-signal-primary transition-all"
                    style={{ 
                      width: `${Math.min(((usageStats?.used || 0) / (usageStats?.limit || 5)) * 100, 100)}%` 
                    }}
                  />
                </div>
              )}
            </div>

            {/* Reset Info */}
            {!isPro && (
              <div className="bg-signal-primary/10 border border-signal-primary/20 rounded-md p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-signal-primary" />
                  <span className="text-sm font-medium text-text-primary">Monthly Reset</span>
                </div>
                <p className="text-xs text-text-secondary">
                  Your campaign limit resets on the 1st of each month
                </p>
                <p className="text-xs text-text-secondary mt-1">
                  Remaining: {usageStats?.remaining || 0} campaigns this month
                </p>
              </div>
            )}

            {/* Account Info */}
            <div className="pt-4 border-t border-border-default">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Account Email</span>
                  <span className="font-medium text-text-primary">{user?.email}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Member Since</span>
                  <span className="font-medium text-text-primary">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { 
                      month: 'short', 
                      year: 'numeric' 
                    }) : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Current Plan</span>
                  <span className={`font-bold ${isPro ? 'text-signal-primary' : 'text-text-primary'}`}>
                    {isPro ? 'PRO' : 'FREE'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction History - Only show for Pro users */}
        {isPro && (
          <div className="bg-base-elevated rounded-md border border-border-default p-6">
            <div className="flex items-center gap-3 mb-5">
              <Receipt className="w-5 h-5 text-text-secondary" />
              <div>
                <h2 className="text-lg font-bold text-text-primary">Transaction History</h2>
                <p className="text-sm text-text-secondary">View and download your payment receipts</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-base-surface border-b border-border-default">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase">Date</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase">Description</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase">Amount</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase">Status</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-text-secondary uppercase">Invoice</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-default">
                  <tr className="hover:bg-base-surface transition-colors">
                    <td className="px-4 py-3 text-sm text-text-primary">
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
                      <div className="text-sm font-medium text-text-primary">Jupho Pro Subscription</div>
                      <div className="text-xs text-text-tertiary">Monthly plan renewal</div>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-text-primary">₹1,999.00</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-sm text-xs font-medium bg-base-elevated text-text-primary">
                        Paid
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button 
                        onClick={() => toast.success('Invoice download will be available soon')}
                        className="text-signal-primary hover:text-signal-primary/80 font-medium text-sm inline-flex items-center gap-1">
                        <Download size={14} />
                        PDF
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Empty state placeholder for demo */}
              <div className="text-center py-6 border-t border-border-default bg-base-surface">
                <p className="text-sm text-text-secondary">Previous transactions will appear here</p>
                <p className="text-xs text-text-tertiary mt-1">You'll see a complete history of all your payments</p>
              </div>
            </div>
          </div>
        )}

        {/* Payment Method (Pro users only) */}
        {isPro && (
          <div className="bg-base-elevated rounded-md border border-border-default p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-text-primary">Payment Method</h2>
                <p className="text-sm text-text-secondary">Manage your billing information</p>
              </div>
            </div>

            <div className="bg-base-surface border border-border-default rounded-md p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-signal-primary/10 rounded flex items-center justify-center">
                  <svg className="w-6 h-6 text-signal-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary">Razorpay</p>
                  <p className="text-xs text-text-tertiary">Auto-renews on {usageStats?.proExpiresAt 
                    ? new Date(usageStats.proExpiresAt).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })
                    : 'renewal date'}</p>
                </div>
              </div>
              <button 
                onClick={() => toast.success('Payment method management coming soon')}
                className="text-signal-primary hover:text-signal-primary/80 font-medium text-sm"
              >
                Update
              </button>
            </div>

            <div className="mt-4 bg-signal-warning/10 border border-signal-warning/20 rounded-md p-4">
              <p className="text-sm text-text-primary">
                <strong>Note:</strong> Your subscription will auto-renew. You can cancel anytime from Settings.
              </p>
            </div>
          </div>
        )}

        {/* Upgrade CTA for Free Users */}
        {!isPro && (
          <div className="bg-signal-primary border-2 border-signal-primary rounded-md p-8 text-center">
            <div className="max-w-2xl mx-auto">
              <div className="w-16 h-16 bg-base-elevated rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-signal-primary" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Ready to create unlimited Meta ads?</h2>
              <p className="text-white/90 mb-6">
                Upgrade to Jupho Pro and get 50 AI-created campaigns per month, unlimited ad copy generation, and priority support for just ₹1,999/month.
              </p>
              <button
                onClick={() => setShowUpgradeModal(true)}
                className="bg-white text-signal-primary px-8 py-3 rounded-md font-medium hover:bg-base-elevated transition-colors shadow-sm inline-flex items-center gap-2"
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
