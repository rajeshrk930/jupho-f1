'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, RefreshCw, Eye, Rocket, AlertCircle, Loader2, Sheet, ExternalLink, Download } from 'lucide-react';
import { api } from '@/lib/api';
import Toast from '@/components/Toast';
import { useToast } from '@/hooks/useToast';
import { ListSkeleton } from '@/components/Skeleton';

interface LeadForm {
  id: string;
  name: string;
  status: string;
  createdAt: string;
  questionCount: number;
  leadsCount: number;
  introText: string;
}

interface SheetsStatus {
  connected: boolean;
  spreadsheetId?: string;
  spreadsheetName?: string;
  spreadsheetUrl?: string;
  syncEnabled?: boolean;
  lastSyncAt?: string;
  syncedLeads?: number;
  unsyncedLeads?: number;
}

export default function LeadFormsPage() {
  const router = useRouter();
  const { toasts, removeToast, success, error: showToastError } = useToast();
  const [forms, setForms] = useState<LeadForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fbConnected, setFbConnected] = useState(false);
  const [sheetsStatus, setSheetsStatus] = useState<SheetsStatus>({ connected: false });
  const [syncingSheetsLeads, setSyncingSheetsLeads] = useState(false);

  useEffect(() => {
    checkFacebookConnection();
    checkSheetsConnection();
  }, []);

  const checkFacebookConnection = async () => {
    try {
      const response = await api.get('/facebook/status');
      setFbConnected(response.data.connected);
      if (response.data.connected) {
        fetchForms();
      } else {
        setLoading(false);
      }
    } catch (err: any) {
      console.error('Error checking Facebook connection:', err);
      setFbConnected(false);
      setLoading(false);
    }
  };

  const checkSheetsConnection = async () => {
    try {
      const response = await api.get('/sheets/status');
      setSheetsStatus(response.data);
    } catch (err: any) {
      console.error('Error checking Sheets connection:', err);
      setSheetsStatus({ connected: false });
    }
  };

  const handleConnectSheets = async () => {
    try {
      const response = await api.get('/sheets/auth-url');
      window.location.href = response.data.authUrl;
    } catch (err: any) {
      console.error('Error getting Sheets auth URL:', err);
      showToastError('Failed to connect Google Sheets. Please try again.');
    }
  };

  const handleSyncToSheets = async () => {
    try {
      setSyncingSheetsLeads(true);
      const response = await api.post('/sheets/sync');
      success(response.data.message);
      await checkSheetsConnection();
    } catch (err: any) {
      console.error('Error syncing to Sheets:', err);
      showToastError(err.response?.data?.error || 'Failed to sync leads to Google Sheets');
    } finally {
      setSyncingSheetsLeads(false);
    }
  };

  const fetchForms = async () => {
    try {
      setError(null);
      const response = await api.get('/facebook/forms');
      setForms(response.data.forms || []);
    } catch (err: any) {
      console.error('Error fetching forms:', err);
      setError(err.response?.data?.error || 'Failed to load forms');
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  };

  const handleSync = () => {
    setSyncing(true);
    fetchForms();
  };

  const handleConnectFacebook = () => {
    router.push('/settings#facebook');
  };

  const handleCreateInFacebook = () => {
    window.open('https://business.facebook.com/latest/lead_access/forms', '_blank');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
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

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-3xl font-bold text-gray-900">Lead Forms</h1>
              <div className="h-10 w-32 bg-gray-200 animate-pulse rounded-lg"></div>
            </div>
            <p className="text-gray-600">Loading your forms...</p>
          </div>
          <ListSkeleton count={3} />
        </div>
      </div>
    );
  }

  if (!fbConnected) {
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

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Lead Forms</h1>
            <p className="text-gray-600">Manage your Facebook Lead Forms</p>
          </div>

          {/* Not Connected State */}
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-12 text-center">
            <div className="w-20 h-20 bg-coral-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="w-10 h-10 text-coral-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Connect Facebook First</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Connect your Facebook account to view and manage your lead forms. You can then select forms when creating campaigns.
            </p>
            <button
              onClick={handleConnectFacebook}
              className="btn-primary rounded-xl"
            >
              Connect Facebook Account
            </button>
          </div>
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

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-gray-900">Lead Forms</h1>
            <button
              onClick={handleSync}
              disabled={syncing}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Syncing...' : 'Sync Forms'}
            </button>
          </div>
          <p className="text-gray-600">
            Select forms to use in your ad campaigns or create new ones in Facebook
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-900">Error loading forms</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Google Sheets Integration Status */}
        <div className="mb-6 bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Sheet className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">Google Sheets Integration</h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  {sheetsStatus.connected 
                    ? `Auto-sync leads to: ${sheetsStatus.spreadsheetName || 'Spreadsheet'}` 
                    : 'Connect to automatically backup your leads'}
                </p>
              </div>
            </div>
            
            {sheetsStatus.connected ? (
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="text-left sm:text-right">
                  <div className="text-sm text-gray-600">
                    {sheetsStatus.syncedLeads || 0} synced
                    {sheetsStatus.unsyncedLeads ? ` • ${sheetsStatus.unsyncedLeads} pending` : ''}
                  </div>
                  {sheetsStatus.lastSyncAt && (
                    <div className="text-xs text-gray-500">
                      Last sync: {new Date(sheetsStatus.lastSyncAt).toLocaleString()}
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={handleSyncToSheets}
                    disabled={syncingSheetsLeads}
                    className="btn-primary px-4 py-2 flex-1 sm:flex-initial"
                  >
                    {syncingSheetsLeads ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                    {syncingSheetsLeads ? 'Syncing...' : 'Sync'}
                  </button>
                  {sheetsStatus.spreadsheetUrl && (
                    <button
                      onClick={() => window.open(sheetsStatus.spreadsheetUrl, '_blank')}
                      className="btn-secondary px-4 py-2 flex-1 sm:flex-initial"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span className="hidden sm:inline">Open Sheet</span>
                      <span className="sm:hidden">Open</span>
                    </button>
                  )}
                  <button
                    onClick={() => router.push('/settings/integrations')}
                    className="btn-tertiary px-4 py-2 flex-1 sm:flex-initial"
                  >
                    Settings
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={handleConnectSheets}
                className="btn-primary px-4 py-2 w-full sm:w-auto"
              >
                <Sheet className="w-4 h-4" />
                Connect Google Sheets
              </button>
            )}
          </div>
        </div>

        {/* Forms List */}
        {forms.length > 0 ? (
          <div className="space-y-4">
            {forms.map((form) => (
              <div
                key={form.id}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-coral-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-coral-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{form.name}</h3>
                        <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                          <span>{form.questionCount} questions</span>
                          <span>•</span>
                          <span>{form.leadsCount} leads collected</span>
                          <span>•</span>
                          <span>Created {formatDate(form.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    
                    {form.introText && (
                      <p className="text-sm text-gray-600 mt-3 line-clamp-2">
                        {form.introText}
                      </p>
                    )}

                    <div className="flex items-center gap-2 mt-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          form.status === 'ACTIVE'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {form.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    <button
                      onClick={() => window.open(`https://business.facebook.com/latest/lead_access/leads?form_id=${form.id}`, '_blank')}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      View in Facebook
                    </button>
                    <button
                      onClick={() => router.push(`/agent?formId=${form.id}`)}
                      className="btn-primary px-4 py-2"
                    >
                      <Rocket className="w-4 h-4" />
                      Use in Campaign
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border-2 border-dashed border-gray-300 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Lead Forms Found</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Create lead forms in Facebook Ads Manager first, then sync them here to use in your campaigns.
            </p>
            <button
              onClick={handleCreateInFacebook}
              className="btn-primary rounded-xl"
            >
              <FileText className="w-5 h-5" />
              Create Form in Facebook
            </button>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-medium mb-1">How to use Lead Forms:</p>
              <ol className="list-decimal list-inside space-y-1 text-blue-800">
                <li>Create or edit forms in Facebook Ads Manager</li>
                <li>Click "Sync Forms" to refresh the list</li>
                <li>Click "Use in Campaign" to create an ad with that form</li>
                <li>Your form will automatically collect leads when users interact with your ad</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
