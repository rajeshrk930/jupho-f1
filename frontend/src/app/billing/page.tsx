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
      router.replace('/sign-in?redirect=/billing');
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
    toast.success('Welcome to your new plan!');
  };

  const isFree = usageStats?.plan === 'FREE';
  const isBasic = usageStats?.plan === 'BASIC';
  const isGrowth = usageStats?.plan === 'GROWTH';
  const isPaid = isBasic || isGrowth;
  
  const planName = isGrowth ? 'Growth' : isBasic ? 'Basic' : 'Free';
  const planPrice = isGrowth ? '₹1,999 / month' : isBasic ? '₹1,499 / month' : 'No payment required';
  const planLimit = isGrowth ? 25 : isBasic ? 10 : 2;
  
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
      <div className="min-h-screen bg-gray-50 py-12 px-4">
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-red-800 font-semibold mb-2 tracking-tight">Failed to load billing data</h2>
          <p className="text-red-600 text-sm mb-4">{(error as any)?.message || 'Something went wrong'}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="text-sm text-red-700 hover:text-red-800 font-medium"
          >
            Try again →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-6">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-charcoal-900 mb-2 tracking-tight">Billing & Plans</h1>
          <p className="text-charcoal-600">Manage your subscription and view usage statistics</p>
        </div>

        {/* Current Plan Card */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Plan Status */}
          <div className={`rounded-md p-6 border-2 ${
            isGrowth ? 'bg-coral-50 border-coral-500' : 
            isBasic ? 'bg-blue-50 border-blue-500' : 
            'bg-base-elevated border-border-default'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-md flex items-center justify-center ${
                  isGrowth ? 'bg-coral-100' : 
                  isBasic ? 'bg-blue-100' : 
                  'bg-base-surface'
                }`}>
                  <Zap className={`w-6 h-6 ${
                    isGrowth ? 'text-coral-600' : 
                    isBasic ? 'text-blue-600' : 
                    'text-text-secondary'
                  }`} />
                </div>
                <div>
                  <h2 className={`text-2xl font-bold tracking-tight ${
                    isGrowth ? 'text-coral-600' : 
                    isBasic ? 'text-blue-600' : 
                    'text-text-primary'
                  }`}>
                    Jupho {planName}
                  </h2>
                  <p className="text-sm text-text-secondary">
                    {planPrice}
                  </p>
                </div>
              </div>
              {isPaid && (
                <div className={`px-3 py-1 rounded-sm ${
                  isGrowth ? 'bg-coral-100 text-coral-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  <span className="text-sm font-medium">Active</span>
                </div>
              )}
            </div>

            <div className="space-y-3 mb-6">
              {usageStats?.plan === 'GROWTH' ? (
                <>
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-text-secondary text-sm">25 campaigns per month</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-text-secondary text-sm">AI Agent (smart creation)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-text-secondary text-sm">AI-generated copy + strategy</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-text-secondary text-sm">Templates library</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-text-secondary text-sm">Priority support</span>
                  </div>
                </>
              ) : usageStats?.plan === 'BASIC' ? (
                <>
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-text-secondary text-sm">10 campaigns per month</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-text-secondary text-sm">Templates library (50+)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-text-secondary text-sm">Instant Lead Ads</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-text-secondary text-sm">Leads dashboard</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-text-secondary text-sm">2 campaigns per month</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-text-secondary text-sm">Templates preview (limited)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-text-secondary text-sm">Basic campaign creation</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-text-secondary text-sm">Community support</span>
                  </div>
                </>
              )}
            </div>

            <div className="space-y-3">
              {isPaid ? (
                <div className={`rounded-md p-4 border ${
                  isGrowth ? 'bg-coral-50 border-coral-200' : 'bg-blue-50 border-blue-200'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className={`w-4 h-4 ${
                      isGrowth ? 'text-coral-600' : 'text-blue-600'
                    }`} />
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
                  Choose Your Plan
                </button>
              )}
              
              {isBasic && (
                <button
                  onClick={() => setShowUpgradeModal(true)}
                  className="w-full bg-coral-500 hover:bg-coral-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4" />
                  Upgrade to Growth (AI Agent)
                </button>
              )}
            </div>
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
                  {usageStats?.used || 0}/{planLimit}
                </span>
              </div>
              <div className="w-full bg-base-surface rounded-sm h-3">
                <div
                  className={`h-3 rounded-sm transition-all ${
                    isGrowth ? 'bg-coral-500' : isBasic ? 'bg-blue-500' : 'bg-gray-500'
                  }`}
                  style={{ 
                    width: `${Math.min(((usageStats?.used || 0) / planLimit) * 100, 100)}%` 
                  }}
                />
              </div>
            </div>

            {/* Reset Info */}
            {isFree && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm font-medium text-text-primary">Monthly Reset</span>
                </div>
                <p className="text-xs text-text-secondary">
                  Your campaign limit resets on the 1st of each month
                </p>
                <p className="text-xs text-yellow-700 mt-1 font-medium">
                  Remaining: {usageStats?.remaining || 0} of 2 campaigns
                </p>
              </div>
            )}
            
            {/* Billing Cycle Info for Paid Users */}
            {isPaid && usageStats?.resetsAt && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-text-primary">Billing Cycle</span>
                </div>
                <p className="text-xs text-text-secondary">
                  Your {planLimit} campaigns reset every 30 days from subscription date
                </p>
                <p className="text-xs text-blue-700 mt-1 font-medium">
                  Next reset: {new Date(usageStats.resetsAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
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
                  <span className={`font-bold ${
                    isGrowth ? 'text-coral-600' : isBasic ? 'text-blue-600' : 'text-gray-600'
                  }`}>
                    {planName.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction History - Only show for paid users */}
        {isPaid && (
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
                      <div className="text-sm font-medium text-text-primary">Jupho {planName} Subscription</div>
                      <div className="text-xs text-text-tertiary">Monthly plan renewal</div>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-text-primary">{planPrice.split(' / ')[0]}</td>
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

        {/* Payment Method (Paid users only) */}
        {isPaid && (
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
            </div>

            <div className="mt-4 bg-signal-warning/10 border border-signal-warning/20 rounded-md p-4">
              <p className="text-sm text-text-primary">
                <strong>Note:</strong> Your subscription will auto-renew. You can cancel anytime from Settings.
              </p>
            </div>
          </div>
        )}

        {/* Upgrade CTA for Free/Basic Users */}
        {!isGrowth && (
          <div className="bg-coral-50 border-2 border-coral-200 rounded-lg p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-charcoal-900 mb-2">
                {isFree ? 'Ready to scale your Meta ads?' : 'Unlock AI-Powered Creation'}
              </h2>
              <p className="text-charcoal-600">
                {isFree 
                  ? 'Choose the perfect plan for your business growth' 
                  : 'Upgrade to Growth and get AI Agent + 25 campaigns/month'}
              </p>
            </div>
            
            {isFree ? (
              <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                {/* BASIC Plan Card */}
                <div className="bg-white border-2 border-blue-200 rounded-lg p-6 hover:border-blue-400 transition-all">
                  <div className="text-center mb-4">
                    <h3 className="text-xl font-bold text-blue-600 mb-1">BASIC</h3>
                    <div className="text-3xl font-bold text-charcoal-900 mb-1">₹1,499</div>
                    <p className="text-sm text-charcoal-600">/month</p>
                  </div>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-500" />
                      <span>10 campaigns/month</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-500" />
                      <span>Templates library</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-500" />
                      <span>Instant Lead Ads</span>
                    </li>
                  </ul>
                  <button
                    onClick={() => setShowUpgradeModal(true)}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition-colors"
                  >
                    Get Basic
                  </button>
                </div>
                
                {/* GROWTH Plan Card */}
                <div className="bg-white border-2 border-coral-400 rounded-lg p-6 relative hover:border-coral-500 transition-all shadow-lg">
                  <div className="absolute -top-3 right-4 bg-coral-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    RECOMMENDED
                  </div>
                  <div className="text-center mb-4">
                    <h3 className="text-xl font-bold text-coral-600 mb-1 flex items-center justify-center gap-2">
                      GROWTH
                      <Zap className="w-5 h-5" />
                    </h3>
                    <div className="text-3xl font-bold text-charcoal-900 mb-1">₹1,999</div>
                    <p className="text-sm text-charcoal-600">/month</p>
                  </div>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-coral-500" />
                      <span className="font-semibold">25 campaigns/month</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-coral-500" />
                      <span className="font-semibold">AI Agent (smart creation)</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-coral-500" />
                      <span>AI-generated copy</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-coral-500" />
                      <span>Everything in BASIC</span>
                    </li>
                  </ul>
                  <button
                    onClick={() => setShowUpgradeModal(true)}
                    className="w-full bg-coral-500 hover:bg-coral-600 text-white font-semibold py-3 rounded-lg transition-colors"
                  >
                    Get Growth
                  </button>
                </div>
              </div>
            ) : (
              <div className="max-w-md mx-auto bg-white border-2 border-coral-400 rounded-lg p-6 text-center">
                <Zap className="w-12 h-12 text-coral-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-charcoal-900 mb-2">Upgrade to Growth</h3>
                <div className="text-3xl font-bold text-coral-600 mb-4">₹1,999/month</div>
                <ul className="text-left space-y-2 mb-6">
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-coral-500" />
                    <span>25 campaigns (vs 10 in Basic)</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-coral-500" />
                    <span className="font-semibold">AI Agent - Smart campaign creation</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-coral-500" />
                    <span>AI-generated copy + strategy</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-coral-500" />
                    <span>Priority support</span>
                  </li>
                </ul>
                <button
                  onClick={() => setShowUpgradeModal(true)}
                  className="w-full bg-coral-500 hover:bg-coral-600 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Zap className="w-5 h-5" />
                  Upgrade to Growth
                </button>
              </div>
            )}
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
