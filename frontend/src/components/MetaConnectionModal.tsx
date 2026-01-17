'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { X, Facebook, Building2, CheckCircle2, Globe, LogOut, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface MetaConnectionData {
  connected: boolean;
  account: {
    facebookUserName?: string;
    facebookUserEmail?: string;
    adAccountId: string;
    adAccountName: string;
    pageNames?: string;
    lastSyncAt?: string;
    tokenExpiring?: boolean;
  } | null;
}

interface MetaConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MetaConnectionModal({ isOpen, onClose }: MetaConnectionModalProps) {
  const router = useRouter();
  const [connectionData, setConnectionData] = useState<MetaConnectionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [disconnecting, setDisconnecting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchConnectionStatus();
    }
  }, [isOpen]);

  const fetchConnectionStatus = async () => {
    try {
      setLoading(true);
      const response = await api.get('/facebook/status');
      setConnectionData(response.data);
    } catch (error: any) {
      console.error('Error fetching Meta connection status:', error);
      toast.error('Failed to load connection details');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect your Meta account? You won\'t be able to create ads until you reconnect.')) {
      return;
    }

    try {
      setDisconnecting(true);
      await api.delete('/facebook/disconnect');

      toast.success('Meta account disconnected successfully');
      onClose();
      router.refresh();
    } catch (error: any) {
      console.error('Error disconnecting Meta account:', error);
      toast.error(error.message || 'Failed to disconnect account');
    } finally {
      setDisconnecting(false);
    }
  };

  const handleChangeConnection = async () => {
    try {
      onClose();
      const res = await api.get('/facebook/auth-url');
      window.location.href = res.data?.url || '#';
    } catch (error) {
      console.error('Failed to start Meta re-auth:', error);
    }
  };

  if (!isOpen) return null;

  const pages = connectionData?.account?.pageNames?.split(',') || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl border-2 border-coral-100 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-xl font-bold text-charcoal-900">Meta Connection</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-charcoal-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin text-coral-500 mx-auto mb-3" />
                <p className="text-charcoal-600">Loading connection details...</p>
              </div>
            </div>
          ) : !connectionData?.connected || !connectionData?.account ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <Facebook className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-charcoal-900 mb-2">Not Connected</h3>
              <p className="text-charcoal-600 mb-6">Connect your Meta account to start creating Facebook ads</p>
              <button
                onClick={handleChangeConnection}
                className="px-6 py-3 bg-gradient-to-r from-coral-500 to-coral-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
              >
                Connect Meta Account
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Facebook Account Info */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                    <Facebook className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-charcoal-900">
                        {connectionData.account.facebookUserName || 'Facebook Account'}
                      </h3>
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                    </div>
                    {connectionData.account.facebookUserEmail && (
                      <p className="text-sm text-charcoal-600">
                        {connectionData.account.facebookUserEmail}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Ad Account Info */}
              <div>
                <h4 className="font-semibold text-charcoal-900 mb-3 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-coral-500" />
                  Ad Account
                </h4>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <p className="font-medium text-charcoal-900 mb-1">
                    {connectionData.account.adAccountName}
                  </p>
                  <p className="text-sm text-charcoal-600">
                    ID: {connectionData.account.adAccountId}
                  </p>
                </div>
              </div>

              {/* Connected Pages */}
              {pages.length > 0 && (
                <div>
                  <h4 className="font-semibold text-charcoal-900 mb-3 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-coral-500" />
                    Connected Pages ({pages.length})
                  </h4>
                  <div className="space-y-2">
                    {pages.map((page, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 rounded-lg p-3 border border-gray-200 text-sm text-charcoal-700"
                      >
                        {page.trim()}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Last Sync */}
              {connectionData.account.lastSyncAt && (
                <div className="text-sm text-charcoal-600">
                  Last synced: {new Date(connectionData.account.lastSyncAt).toLocaleString()}
                </div>
              )}

              {/* Token Expiring Warning */}
              {connectionData.account.tokenExpiring && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                  <p className="text-sm text-yellow-800">
                    ⚠️ Your access token is expiring soon. Consider reconnecting your account.
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleChangeConnection}
                  className="flex-1 px-4 py-3 bg-white border-2 border-coral-500 text-coral-600 font-semibold rounded-xl hover:bg-coral-50 transition-all"
                >
                  Change Connection
                </button>
                <button
                  onClick={handleDisconnect}
                  disabled={disconnecting}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-50 border-2 border-red-200 text-red-600 font-semibold rounded-xl hover:bg-red-100 transition-all disabled:opacity-50"
                >
                  {disconnecting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Disconnecting...
                    </>
                  ) : (
                    <>
                      <LogOut className="w-4 h-4" />
                      Disconnect
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
