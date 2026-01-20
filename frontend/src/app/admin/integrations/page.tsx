'use client';

import { useState, useEffect } from 'react';
import { adminIntegrationApi } from '@/lib/api';
import { 
  Facebook,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
  Shield,
  Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';

interface FacebookConnection {
  id: string;
  userId: string;
  user: {
    id: string;
    email: string;
    name: string;
    plan: string;
  };
  facebookUserName: string | null;
  facebookUserEmail: string | null;
  adAccountId: string;
  adAccountName: string | null;
  tokenExpiresAt: string;
  isActive: boolean;
  lastSyncAt: string | null;
  createdAt: string;
  healthStatus: 'healthy' | 'expiring_soon' | 'expired';
}

interface IntegrationStats {
  total: number;
  healthy: number;
  expiringSoon: number;
  expired: number;
  connections: FacebookConnection[];
}

export default function AdminIntegrationsPage() {
  const [stats, setStats] = useState<IntegrationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'healthy' | 'expiring_soon' | 'expired'>('all');

  useEffect(() => {
    loadConnections();
  }, []);

  const loadConnections = async () => {
    try {
      setLoading(true);
      const data = await adminIntegrationApi.getFacebookConnections();
      setStats(data);
    } catch (error: any) {
      console.error('Failed to load Facebook connections:', error);
      if (error.response?.status === 403) {
        toast.error('Admin access required - Contact system administrator');
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 2000);
      } else {
        toast.error('Failed to load Facebook connections');
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredConnections = stats?.connections.filter(conn => {
    if (filter === 'all') return true;
    return conn.healthStatus === filter;
  }) || [];

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDaysUntilExpiry = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getHealthBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return {
          icon: <CheckCircle className="h-4 w-4" />,
          text: 'Healthy',
          className: 'bg-green-100 text-green-800'
        };
      case 'expiring_soon':
        return {
          icon: <Clock className="h-4 w-4" />,
          text: 'Expiring Soon',
          className: 'bg-yellow-100 text-yellow-800'
        };
      case 'expired':
        return {
          icon: <XCircle className="h-4 w-4" />,
          text: 'Expired',
          className: 'bg-red-100 text-red-800'
        };
      default:
        return {
          icon: <AlertTriangle className="h-4 w-4" />,
          text: 'Unknown',
          className: 'bg-gray-100 text-gray-800'
        };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Facebook Integration Health</h1>
          <p className="text-gray-600">Monitor connection status and token expiration</p>
        </div>

        {/* Stats Cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-24 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-32"></div>
              </div>
            ))}
          </div>
        ) : stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {/* Total Connections */}
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Total Connections</span>
                <Facebook className="h-5 w-5 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <p className="text-xs text-gray-500 mt-1">Active integrations</p>
            </div>

            {/* Healthy */}
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Healthy</span>
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{stats.healthy}</div>
              <p className="text-xs text-gray-500 mt-1">Good standing</p>
            </div>

            {/* Expiring Soon */}
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Expiring Soon</span>
                <Clock className="h-5 w-5 text-yellow-500" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{stats.expiringSoon}</div>
              <p className="text-xs text-gray-500 mt-1">{"< 7 days remaining"}</p>
            </div>

            {/* Expired */}
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Expired</span>
                <XCircle className="h-5 w-5 text-red-500" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{stats.expired}</div>
              <p className="text-xs text-gray-500 mt-1">Need reconnection</p>
            </div>
          </div>
        )}

        {/* Alert Banner for Expiring/Expired */}
        {stats && (stats.expiringSoon > 0 || stats.expired > 0) && (
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <div className="flex-1">
                <h3 className="font-semibold text-yellow-900">Action Required</h3>
                <p className="text-sm text-yellow-800 mt-1">
                  {stats.expiringSoon > 0 && `${stats.expiringSoon} connection(s) expiring soon. `}
                  {stats.expired > 0 && `${stats.expired} connection(s) expired and need reconnection.`}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({stats?.total || 0})
            </button>
            <button
              onClick={() => setFilter('healthy')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'healthy'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Healthy ({stats?.healthy || 0})
            </button>
            <button
              onClick={() => setFilter('expiring_soon')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'expiring_soon'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Expiring Soon ({stats?.expiringSoon || 0})
            </button>
            <button
              onClick={() => setFilter('expired')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'expired'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Expired ({stats?.expired || 0})
            </button>
            <button
              onClick={loadConnections}
              className="ml-auto flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Connections Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Facebook Account
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ad Account
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Health Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Token Expiry
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Sync
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Connected
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="flex justify-center">
                        <RefreshCw className="h-8 w-8 text-gray-400 animate-spin" />
                      </div>
                    </td>
                  </tr>
                ) : filteredConnections.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      No connections found
                    </td>
                  </tr>
                ) : (
                  filteredConnections.map((connection) => {
                    const healthBadge = getHealthBadge(connection.healthStatus);
                    const daysLeft = getDaysUntilExpiry(connection.tokenExpiresAt);
                    
                    return (
                      <tr key={connection.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {connection.user.name || 'Unknown'}
                          </div>
                          <div className="text-xs text-gray-500">{connection.user.email}</div>
                          <div className="text-xs">
                            <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                              {connection.user.plan}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {connection.facebookUserName || 'N/A'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {connection.facebookUserEmail || 'No email'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {connection.adAccountName || 'N/A'}
                          </div>
                          <div className="text-xs text-gray-500 font-mono">
                            {connection.adAccountId}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`flex items-center gap-1.5 px-2 py-1 text-xs font-semibold rounded-full ${healthBadge.className}`}>
                            {healthBadge.icon}
                            {healthBadge.text}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatDate(connection.tokenExpiresAt)}
                          </div>
                          <div className={`text-xs ${daysLeft < 0 ? 'text-red-600' : daysLeft < 7 ? 'text-yellow-600' : 'text-gray-500'}`}>
                            {daysLeft < 0 ? 'Expired' : `${daysLeft} days left`}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {connection.lastSyncAt ? formatDate(connection.lastSyncAt) : 'Never'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(connection.createdAt)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
