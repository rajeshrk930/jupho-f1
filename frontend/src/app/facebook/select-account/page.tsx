'use client';

// Force dynamic rendering to allow useSearchParams during build
export const dynamic = 'force-dynamic';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { api } from '@/lib/api';
import { Building2, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface AdAccount {
  id: string;
  name: string;
  accountStatus: number;
  currency: string;
  balance?: string;
}

function SelectAccountPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuthStore();
  const [adAccounts, setAdAccounts] = useState<AdAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/sign-in?redirect=/facebook/select-account');
      return;
    }

    fetchAdAccounts();
  }, [isAuthenticated]);

  const fetchAdAccounts = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/facebook/ad-accounts');
      setAdAccounts(data.adAccounts || []);

      // Auto-select if only one account
      if (data.adAccounts && data.adAccounts.length === 1) {
        setSelectedAccount(data.adAccounts[0].id);
      }
    } catch (err: any) {
      console.error('Error fetching ad accounts:', err);
      setError(err.message || 'Failed to load ad accounts');
      toast.error('Failed to load ad accounts');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSelection = async () => {
    if (!selectedAccount) {
      toast.error('Please select an ad account');
      return;
    }

    try {
      setSaving(true);
      const selectedAccountData = adAccounts.find((acc) => acc.id === selectedAccount);

      await api.post('/facebook/select-account', {
        adAccountId: selectedAccount,
        adAccountName: selectedAccountData?.name || 'Unknown',
      });

      toast.success('Facebook account connected successfully!');
      router.push('/dashboard?facebook=connected');
    } catch (err: any) {
      console.error('Error saving ad account:', err);
      toast.error(err.message || 'Failed to save selection');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-coral-50/30 via-mint-50/20 to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coral-500 mx-auto mb-4"></div>
          <p className="text-charcoal-600">Loading ad accounts...</p>
        </div>
      </div>
    );
  }

  if (error || adAccounts.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-coral-50/30 via-mint-50/20 to-white px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border-2 border-red-200 p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-charcoal-900 mb-2">No Ad Accounts Found</h2>
          <p className="text-charcoal-600 mb-6">
            {error || 'We couldn\'t find any Facebook Ad Accounts linked to your account. Please make sure you have access to at least one ad account.'}
          </p>
          <button
            onClick={() => router.push('/settings')}
            className="px-6 py-3 bg-gradient-to-r from-coral-500 to-coral-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
          >
            Back to Settings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-coral-50/30 via-mint-50/20 to-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-coral-500 to-coral-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-charcoal-900 mb-2">Select Ad Account</h1>
          <p className="text-charcoal-600">Choose which Facebook Ad Account you want to use for creating ads</p>
        </div>

        {/* Ad Accounts List */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-coral-100 p-6 mb-6">
          <div className="space-y-3">
            {adAccounts.map((account) => (
              <button
                key={account.id}
                onClick={() => setSelectedAccount(account.id)}
                className={`w-full flex items-start gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                  selectedAccount === account.id
                    ? 'border-coral-500 bg-coral-50 shadow-md'
                    : 'border-gray-200 hover:border-coral-300 hover:bg-gray-50'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    selectedAccount === account.id
                      ? 'border-coral-500 bg-coral-500'
                      : 'border-gray-300'
                  }`}
                >
                  {selectedAccount === account.id && (
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-charcoal-900 mb-1">{account.name}</h3>
                  <div className="flex flex-wrap gap-2 text-sm text-charcoal-600">
                    <span className="px-2 py-0.5 rounded-full bg-gray-100">
                      {account.id}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-mint-100 text-mint-700 font-medium">
                      {account.currency}
                    </span>
                    {account.accountStatus === 1 ? (
                      <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-medium">
                        Inactive
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-mint-50 border border-mint-200 rounded-xl p-4 mb-6">
          <p className="text-sm text-charcoal-700">
            <span className="font-semibold">Note:</span> Your ads will be created using this account. You can change this later in your settings.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => router.push('/settings')}
            disabled={saving}
            className="flex-1 px-6 py-3 bg-white border-2 border-gray-300 text-charcoal-700 font-semibold rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveSelection}
            disabled={!selectedAccount || saving}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-coral-500 to-coral-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              'Continue'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SelectAccountPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-coral-50/30 via-mint-50/20 to-white">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coral-500 mx-auto mb-4"></div>
            <p className="text-charcoal-600">Loading...</p>
          </div>
        </div>
      }
    >
      <SelectAccountPageInner />
    </Suspense>
  );
}
