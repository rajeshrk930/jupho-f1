'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, RefreshCw, Eye, Rocket, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

interface LeadForm {
  id: string;
  name: string;
  status: string;
  createdAt: string;
  questionCount: number;
  leadsCount: number;
  introText: string;
}

export default function LeadFormsPage() {
  const router = useRouter();
  const [forms, setForms] = useState<LeadForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fbConnected, setFbConnected] = useState(false);

  useEffect(() => {
    checkFacebookConnection();
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-coral-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading forms...</p>
        </div>
      </div>
    );
  }

  if (!fbConnected) {
    return (
      <div className="min-h-screen bg-gray-50">
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
              className="inline-flex items-center gap-2 px-6 py-3 bg-coral-500 hover:bg-coral-600 active:bg-coral-700 text-white font-semibold rounded-xl shadow-sm hover:shadow-lg transition-all"
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
                      onClick={() => window.open(`https://business.facebook.com/latest/lead_access/forms/${form.id}`, '_blank')}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      View in Facebook
                    </button>
                    <button
                      onClick={() => router.push(`/agent?formId=${form.id}`)}
                      className="flex items-center gap-2 px-4 py-2 bg-coral-500 hover:bg-coral-600 text-white font-medium rounded-lg transition-colors"
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
              className="inline-flex items-center gap-2 px-6 py-3 bg-coral-500 hover:bg-coral-600 active:bg-coral-700 text-white font-semibold rounded-xl shadow-sm hover:shadow-lg transition-all"
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
