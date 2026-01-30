'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Sheet, CheckCircle, XCircle, Loader2, Settings as SettingsIcon, ExternalLink, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import Toast from '@/components/Toast';
import { useToast } from '@/hooks/useToast';

interface SheetsStatus {
  connected: boolean;
  spreadsheetId?: string;
  spreadsheetName?: string;
  spreadsheetUrl?: string;
  sheetName?: string;
  syncEnabled?: boolean;
  lastSyncAt?: string;
  connectedAt?: string;
  syncedLeads?: number;
  unsyncedLeads?: number;
  tokenExpiresAt?: string;
}

interface SpreadsheetOption {
  id: string;
  name: string;
  createdTime: string;
}

function IntegrationsContent() {
  const searchParams = useSearchParams();
  const { toasts, removeToast, success, error: showError } = useToast();
  const [sheetsStatus, setSheetsStatus] = useState<SheetsStatus>({ connected: false });
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [creating, setCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showSelectForm, setShowSelectForm] = useState(false);
  const [spreadsheetTitle, setSpreadsheetTitle] = useState('');
  const [availableSpreadsheets, setAvailableSpreadsheets] = useState<SpreadsheetOption[]>([]);
  const [selectedSpreadsheetId, setSelectedSpreadsheetId] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  useEffect(() => {
    checkStatus();
    
    // Handle OAuth callback
    const successParam = searchParams.get('success');
    const errorParam = searchParams.get('error');
    
    if (successParam === 'sheets_connected') {
      setTimeout(() => {
        checkStatus();
        success('Google Sheets connected successfully!');
      }, 100);
    } else if (errorParam) {
      const errorMessages: Record<string, string> = {
        oauth_denied: 'You denied access to Google Sheets.',
        missing_code: 'Authorization code is missing.',
        invalid_state: 'Invalid security token.',
        connection_failed: 'Failed to connect Google Sheets.',
      };
      showError(errorMessages[errorParam] || 'An error occurred during connection.');
    }
  }, [searchParams]);

  const checkStatus = async () => {
    try {
      const response = await api.get('/sheets/status');
      setSheetsStatus(response.data);
    } catch (err: any) {
      console.error('Error checking status:', err);
      setSheetsStatus({ connected: false });
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      setConnecting(true);
      const response = await api.get('/sheets/auth-url');
      window.location.href = response.data.authUrl;
    } catch (err: any) {
      console.error('Error getting auth URL:', err);
      showError('Failed to start connection. Please try again.');
      setConnecting(false);
    }
  };

  const handleCreateSpreadsheet = async () => {
    if (!spreadsheetTitle.trim()) {
      showError('Please enter a spreadsheet name');
      return;
    }

    try {
      setCreating(true);
      const response = await api.post('/sheets/create-spreadsheet', {
        title: spreadsheetTitle,
      });
      
      success(`Spreadsheet "${response.data.title}" created successfully!`);
      setShowCreateForm(false);
      setSpreadsheetTitle('');
      await checkStatus();
    } catch (err: any) {
      console.error('Error creating spreadsheet:', err);
      showError(err.response?.data?.error || 'Failed to create spreadsheet');
    } finally {
      setCreating(false);
    }
  };

  const handleLoadSpreadsheets = async () => {
    try {
      const response = await api.get('/sheets/list');
      setAvailableSpreadsheets(response.data.spreadsheets || []);
      setShowSelectForm(true);
    } catch (err: any) {
      console.error('Error loading spreadsheets:', err);
      showError(err.response?.data?.error || 'Failed to load spreadsheets');
    }
  };

  const handleSelectSpreadsheet = async () => {
    if (!selectedSpreadsheetId) {
      showError('Please select a spreadsheet');
      return;
    }

    try {
      await api.post('/sheets/set-spreadsheet', {
        spreadsheetId: selectedSpreadsheetId,
      });
      
      success('Spreadsheet configured successfully!');
      setShowSelectForm(false);
      setSelectedSpreadsheetId('');
      await checkStatus();
    } catch (err: any) {
      console.error('Error setting spreadsheet:', err);
      showError(err.response?.data?.error || 'Failed to configure spreadsheet');
    }
  };

  const handleToggleSync = async () => {
    try {
      const newState = !sheetsStatus.syncEnabled;
      await api.patch('/sheets/toggle-sync', { enabled: newState });
      setSheetsStatus({ ...sheetsStatus, syncEnabled: newState });
      success(`Auto-sync ${newState ? 'enabled' : 'disabled'} successfully`);
    } catch (err: any) {
      console.error('Error toggling sync:', err);
      showError('Failed to update sync settings');
    }
  };

  const handleManualSync = async () => {
    try {
      setSyncing(true);
      const response = await api.post('/sheets/sync');
      success(response.data.message);
      await checkStatus();
    } catch (err: any) {
      console.error('Error syncing:', err);
      showError(err.response?.data?.error || 'Failed to sync leads');
    } finally {
      setSyncing(false);
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm('Are you sure you want to disconnect Google Sheets? Auto-sync will stop, but your existing spreadsheet data will remain.')) {
      return;
    }

    try {
      setDisconnecting(true);
      await api.delete('/sheets/disconnect');
      success('Google Sheets disconnected successfully');
      await checkStatus();
    } catch (err: any) {
      console.error('Error disconnecting:', err);
      showError('Failed to disconnect Google Sheets');
    } finally {
      setDisconnecting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Integrations</h1>
          <p className="text-gray-600">Connect external services to enhance your workflow</p>
        </div>

        {/* Google Sheets Integration Card */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-white">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center">
                <Sheet className="w-8 h-8 text-green-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-1">Google Sheets</h2>
                <p className="text-gray-600">Automatically sync your Meta leads to Google Sheets</p>
              </div>
              <div>
                {sheetsStatus.connected ? (
                  <div className="flex items-center gap-2 text-green-600 font-semibold">
                    <CheckCircle className="w-5 h-5" />
                    Connected
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-gray-400">
                    <XCircle className="w-5 h-5" />
                    Not Connected
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="p-6">
            {sheetsStatus.connected ? (
              <div className="space-y-6">
                {/* Connection Info */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Spreadsheet:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-900">{sheetsStatus.spreadsheetName || 'Not configured'}</span>
                      {sheetsStatus.spreadsheetUrl && (
                        <button
                          onClick={() => window.open(sheetsStatus.spreadsheetUrl, '_blank')}
                          className="text-green-600 hover:text-green-700"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Sheet Name:</span>
                    <span className="text-sm text-gray-900">{sheetsStatus.sheetName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Leads Synced:</span>
                    <span className="text-sm text-gray-900">{sheetsStatus.syncedLeads || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Pending Sync:</span>
                    <span className="text-sm text-gray-900">{sheetsStatus.unsyncedLeads || 0}</span>
                  </div>
                  {sheetsStatus.lastSyncAt && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Last Sync:</span>
                      <span className="text-sm text-gray-900">
                        {new Date(sheetsStatus.lastSyncAt).toLocaleString()}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Connected:</span>
                    <span className="text-sm text-gray-900">
                      {sheetsStatus.connectedAt ? new Date(sheetsStatus.connectedAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Auto-Sync Toggle */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-semibold text-gray-900">Automatic Sync</h3>
                    <p className="text-sm text-gray-600">Sync new leads every 15 minutes</p>
                  </div>
                  <button
                    onClick={handleToggleSync}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      sheetsStatus.syncEnabled ? 'bg-green-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        sheetsStatus.syncEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-3">
                  {!sheetsStatus.spreadsheetId && (
                    <>
                      <button
                        onClick={() => setShowCreateForm(!showCreateForm)}
                        className="btn-primary px-4 py-2"
                      >
                        <Sheet className="w-4 h-4" />
                        Create New Spreadsheet
                      </button>
                      <button
                        onClick={handleLoadSpreadsheets}
                        className="btn-secondary px-4 py-2"
                      >
                        <SettingsIcon className="w-4 h-4" />
                        Use Existing Spreadsheet
                      </button>
                    </>
                  )}
                  {sheetsStatus.spreadsheetId && (
                    <button
                      onClick={handleManualSync}
                      disabled={syncing}
                      className="btn-primary px-4 py-2"
                    >
                      {syncing ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Sheet className="w-4 h-4" />
                      )}
                      {syncing ? 'Syncing...' : 'Sync Now'}
                    </button>
                  )}
                  <button
                    onClick={handleDisconnect}
                    disabled={disconnecting}
                    className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-medium rounded-lg transition-colors disabled:opacity-50"
                  >
                    {disconnecting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                    Disconnect
                  </button>
                </div>

                {/* Create Spreadsheet Form */}
                {showCreateForm && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Create New Spreadsheet</h3>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={spreadsheetTitle}
                        onChange={(e) => setSpreadsheetTitle(e.target.value)}
                        placeholder="Enter spreadsheet name..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                      <button
                        onClick={handleCreateSpreadsheet}
                        disabled={creating}
                        className="btn-primary px-4 py-2"
                      >
                        {creating ? 'Creating...' : 'Create'}
                      </button>
                      <button
                        onClick={() => setShowCreateForm(false)}
                        className="btn-secondary px-4 py-2"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Select Spreadsheet Form */}
                {showSelectForm && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Select Existing Spreadsheet</h3>
                    <div className="space-y-2 mb-3 max-h-60 overflow-y-auto">
                      {availableSpreadsheets.map((sheet) => (
                        <label
                          key={sheet.id}
                          className="flex items-center gap-2 p-2 hover:bg-blue-100 rounded cursor-pointer"
                        >
                          <input
                            type="radio"
                            name="spreadsheet"
                            value={sheet.id}
                            checked={selectedSpreadsheetId === sheet.id}
                            onChange={(e) => setSelectedSpreadsheetId(e.target.value)}
                            className="text-green-600"
                          />
                          <span className="text-sm text-gray-900">{sheet.name}</span>
                        </label>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleSelectSpreadsheet}
                        disabled={!selectedSpreadsheetId}
                        className="btn-primary px-4 py-2"
                      >
                        Select
                      </button>
                      <button
                        onClick={() => setShowSelectForm(false)}
                        className="btn-secondary px-4 py-2"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-6">
                  Connect your Google account to automatically backup all your Meta leads to Google Sheets
                </p>
                <button
                  onClick={handleConnect}
                  disabled={connecting}
                  className="btn-primary rounded-xl"
                >
                  {connecting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Sheet className="w-5 h-5" />
                      Connect Google Sheets
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-3">Why Connect Google Sheets?</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span><strong>Automatic Backup:</strong> Never lose lead data even after Facebook's 90-day limit</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span><strong>Real-time Sync:</strong> New leads automatically added every 15 minutes</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span><strong>Easy Access:</strong> View and manage leads from anywhere</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span><strong>Team Collaboration:</strong> Share spreadsheet with team members</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span><strong>Data Export:</strong> Export to CRM, email tools, or any platform</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function IntegrationsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
      </div>
    }>
      <IntegrationsContent />
    </Suspense>
  );
}
