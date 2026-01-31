'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { api } from '@/lib/api';
import { 
  Webhook, 
  Plus, 
  Trash2, 
  Power, 
  PowerOff, 
  TestTube, 
  Copy, 
  Eye, 
  EyeOff,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Crown,
  Zap
} from 'lucide-react';
import toast from 'react-hot-toast';
import MobileTopBar from '@/components/MobileTopBar';

interface WebhookEndpoint {
  id: string;
  url: string;
  events: string[];
  secret: string;
  isActive: boolean;
  description?: string;
  createdAt: string;
}

interface WebhookDelivery {
  id: string;
  event: string;
  status: string;
  attempts: number;
  responseCode?: number;
  lastError?: string;
  createdAt: string;
  deliveredAt?: string;
}

export default function WebhooksPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [webhooks, setWebhooks] = useState<WebhookEndpoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedWebhook, setSelectedWebhook] = useState<string | null>(null);
  const [deliveries, setDeliveries] = useState<WebhookDelivery[]>([]);
  const [showSecret, setShowSecret] = useState<Record<string, boolean>>({});

  // Auth guard
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/sign-in?redirect=/settings/webhooks');
    }
  }, [isAuthenticated, router]);

  // Check if user has GROWTH plan
  const plan = user?.plan || 'FREE';
  const hasAccess = plan === 'GROWTH';

  // Fetch webhooks
  useEffect(() => {
    if (!hasAccess) return;
    fetchWebhooks();
  }, [hasAccess]);

  const fetchWebhooks = async () => {
    try {
      setLoading(true);
      const response = await api.get('/webhooks');
      setWebhooks(response.data.data || []);
    } catch (error: any) {
      if (error.response?.data?.error !== 'WEBHOOKS_LOCKED') {
        toast.error('Failed to fetch webhooks');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchDeliveries = async (webhookId: string) => {
    try {
      const response = await api.get(`/webhooks/${webhookId}/deliveries`);
      setDeliveries(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch delivery logs');
    }
  };

  const handleDelete = async (webhookId: string) => {
    if (!confirm('Are you sure you want to delete this webhook?')) return;

    try {
      await api.delete(`/webhooks/${webhookId}`);
      toast.success('Webhook deleted successfully');
      fetchWebhooks();
    } catch (error) {
      toast.error('Failed to delete webhook');
    }
  };

  const handleToggle = async (webhookId: string, isActive: boolean) => {
    try {
      await api.patch(`/webhooks/${webhookId}`, { isActive: !isActive });
      toast.success(`Webhook ${!isActive ? 'enabled' : 'disabled'}`);
      fetchWebhooks();
    } catch (error) {
      toast.error('Failed to update webhook');
    }
  };

  const handleTest = async (webhookId: string) => {
    try {
      await api.post(`/webhooks/${webhookId}/test`);
      toast.success('Test webhook sent successfully! Check your endpoint.');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Test webhook failed');
    }
  };

  const copySecret = (secret: string) => {
    navigator.clipboard.writeText(secret);
    toast.success('Secret copied to clipboard');
  };

  // Locked state for FREE/BASIC users
  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MobileTopBar title="Webhooks" />
        
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl shadow-lg border-2 border-purple-100 p-12 text-center">
            <div className="w-20 h-20 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-6">
              <Webhook className="w-10 h-10 text-purple-600" />
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Webhooks for GROWTH Plan
            </h1>

            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Connect Jupho to 5,000+ apps via webhooks. Send campaign data to your CRM, post updates to Slack, trigger automation - all without code!
            </p>

            <div className="bg-purple-50 rounded-xl p-6 mb-8 text-left max-w-xl mx-auto">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-600" />
                Available webhook events:
              </h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• <strong>campaign.created</strong> - New campaign started</li>
                <li>• <strong>campaign.completed</strong> - Campaign published to Facebook</li>
                <li>• <strong>campaign.failed</strong> - Campaign creation failed</li>
                <li>• <strong>lead.captured</strong> - New lead from form</li>
                <li>• <strong>performance.updated</strong> - Campaign metrics updated</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.push('/billing')}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-bold rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <Crown className="w-5 h-5" />
                Upgrade to GROWTH
              </button>
              <button
                onClick={() => router.push('/settings')}
                className="px-8 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
              >
                Back to Settings
              </button>
            </div>

            <p className="text-xs text-gray-500 mt-8">
              Current plan: <span className="font-bold">{plan}</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Main webhooks UI for GROWTH users
  return (
    <div className="min-h-screen bg-gray-50">
      <MobileTopBar title="Webhooks" />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Webhooks</h1>
            <p className="text-gray-600">Connect Jupho to your favorite apps via webhooks</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
            disabled={webhooks.length >= 5}
          >
            <Plus size={20} />
            Add Webhook
          </button>
        </div>

        {/* Webhooks List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          </div>
        ) : webhooks.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <Webhook className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No webhooks yet</h3>
            <p className="text-gray-600 mb-6">Create your first webhook to start receiving events</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors inline-flex items-center gap-2"
            >
              <Plus size={20} />
              Create Webhook
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {webhooks.map((webhook) => (
              <div key={webhook.id} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{webhook.url}</h3>
                      {webhook.isActive ? (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full flex items-center gap-1">
                          <Power size={12} />
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full flex items-center gap-1">
                          <PowerOff size={12} />
                          Disabled
                        </span>
                      )}
                    </div>
                    {webhook.description && (
                      <p className="text-sm text-gray-600 mb-3">{webhook.description}</p>
                    )}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {webhook.events.map((event) => (
                        <span key={event} className="px-2 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded">
                          {event}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>Secret:</span>
                      <code className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">
                        {showSecret[webhook.id] ? webhook.secret : '••••••••••••••••'}
                      </code>
                      <button
                        onClick={() => setShowSecret({ ...showSecret, [webhook.id]: !showSecret[webhook.id] })}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        {showSecret[webhook.id] ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      <button
                        onClick={() => copySecret(webhook.secret)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <Copy size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleTest(webhook.id)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                      title="Test webhook"
                    >
                      <TestTube size={20} />
                    </button>
                    <button
                      onClick={() => handleToggle(webhook.id, webhook.isActive)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                      title={webhook.isActive ? 'Disable' : 'Enable'}
                    >
                      {webhook.isActive ? <PowerOff size={20} /> : <Power size={20} />}
                    </button>
                    <button
                      onClick={() => {
                        setSelectedWebhook(webhook.id);
                        fetchDeliveries(webhook.id);
                      }}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                      title="View delivery logs"
                    >
                      <Clock size={20} />
                    </button>
                    <button
                      onClick={() => handleDelete(webhook.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      title="Delete webhook"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>

                {/* Delivery Logs */}
                {selectedWebhook === webhook.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-3">Recent Deliveries</h4>
                    {deliveries.length === 0 ? (
                      <p className="text-sm text-gray-500">No deliveries yet</p>
                    ) : (
                      <div className="space-y-2">
                        {deliveries.slice(0, 10).map((delivery) => (
                          <div key={delivery.id} className="flex items-center justify-between text-sm bg-gray-50 rounded p-2">
                            <div className="flex items-center gap-3">
                              {delivery.status === 'success' ? (
                                <CheckCircle2 size={16} className="text-green-600" />
                              ) : delivery.status === 'failed' ? (
                                <XCircle size={16} className="text-red-600" />
                              ) : (
                                <Loader2 size={16} className="text-gray-400 animate-spin" />
                              )}
                              <span className="font-medium">{delivery.event}</span>
                              {delivery.responseCode && (
                                <span className="text-gray-500">({delivery.responseCode})</span>
                              )}
                            </div>
                            <span className="text-gray-500">
                              {new Date(delivery.createdAt).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Add Webhook Modal */}
        {showAddModal && (
          <AddWebhookModal
            onClose={() => setShowAddModal(false)}
            onSuccess={() => {
              setShowAddModal(false);
              fetchWebhooks();
            }}
          />
        )}
      </div>
    </div>
  );
}

// Add Webhook Modal Component
function AddWebhookModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [url, setUrl] = useState('');
  const [events, setEvents] = useState<string[]>(['campaign.created', 'campaign.completed']);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const availableEvents = [
    { value: 'campaign.created', label: 'Campaign Created', description: 'New campaign started' },
    { value: 'campaign.completed', label: 'Campaign Completed', description: 'Published to Facebook' },
    { value: 'campaign.failed', label: 'Campaign Failed', description: 'Creation failed' },
    { value: 'lead.captured', label: 'Lead Captured', description: 'New lead from form' },
    { value: 'performance.updated', label: 'Performance Updated', description: 'Metrics refreshed' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url || events.length === 0) {
      toast.error('URL and at least one event are required');
      return;
    }

    try {
      setLoading(true);
      await api.post('/webhooks', { url, events, description });
      toast.success('Webhook created successfully');
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create webhook');
    } finally {
      setLoading(false);
    }
  };

  const toggleEvent = (event: string) => {
    setEvents(prev =>
      prev.includes(event) ? prev.filter(e => e !== event) : [...prev, event]
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Add Webhook</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Webhook URL *
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://your-app.com/webhooks/jupho"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              We'll send POST requests to this URL when events occur
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Events to Subscribe *
            </label>
            <div className="space-y-2">
              {availableEvents.map((event) => (
                <label key={event.value} className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={events.includes(event.value)}
                    onChange={() => toggleEvent(event.value)}
                    className="mt-1"
                  />
                  <div>
                    <p className="font-medium text-gray-900">{event.label}</p>
                    <p className="text-xs text-gray-600">{event.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Zapier integration for Slack"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              maxLength={200}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus size={20} />
                  Create Webhook
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
