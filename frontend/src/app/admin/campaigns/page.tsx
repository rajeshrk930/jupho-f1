'use client';

import { useState, useEffect } from 'react';
import { adminCampaignApi } from '@/lib/api';
import { 
  Target, 
  TrendingUp, 
  AlertCircle,
  Eye,
  DollarSign,
  Activity,
  Search,
  Filter,
  Download,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Campaign {
  id: string;
  type: string;
  status: string;
  createdVia: string;
  fbCampaignId: string | null;
  fbAdSetId: string | null;
  fbAdId: string | null;
  actualCPM: number | null;
  actualCTR: number | null;
  actualConversions: number | null;
  actualSpend: number | null;
  impressions: number | null;
  clicks: number | null;
  performanceGrade: string | null;
  lastPerformanceSync: string | null;
  createdAt: string;
  completedAt: string | null;
  userId: string;
  user: {
    id: string;
    email: string;
    name: string;
    plan: string;
  };
}

interface CampaignStats {
  totalCampaigns: number;
  activeCampaigns: number;
  completedCampaigns: number;
  failedCampaigns: number;
  platformMetrics: {
    totalImpressions: number;
    totalClicks: number;
    totalConversions: number;
    totalSpend: number;
    avgCPM: number;
    avgCTR: number;
  };
  gradeDistribution: Record<string, number>;
  failingCampaigns: Array<{
    id: string;
    status: string;
    performanceGrade: string | null;
    actualCTR: number | null;
    actualSpend: number | null;
    errorMessage: string | null;
    createdAt: string;
    user: {
      email: string;
      name: string;
    };
  }>;
}

export default function AdminCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [stats, setStats] = useState<CampaignStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  
  // Pagination & filters
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    loadCampaigns();
  }, [page, statusFilter, gradeFilter]);

  const loadStats = async () => {
    try {
      setStatsLoading(true);
      const data = await adminCampaignApi.getCampaignStats();
      setStats(data);
    } catch (error: any) {
      console.error('Failed to load campaign stats:', error);
      if (error.response?.status === 403) {
        toast.error('Admin access required');
      } else {
        toast.error('Failed to load campaign statistics');
      }
    } finally {
      setStatsLoading(false);
    }
  };

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      const data = await adminCampaignApi.getCampaigns({
        page,
        limit: 20,
        status: statusFilter || undefined,
        performanceGrade: gradeFilter || undefined
      });
      setCampaigns(data.campaigns);
      setTotalPages(data.pagination.totalPages);
    } catch (error: any) {
      console.error('Failed to load campaigns:', error);
      if (error.response?.status === 403) {
        toast.error('Admin access required - Contact system administrator');
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 2000);
      } else {
        toast.error('Failed to load campaigns');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getGradeColor = (grade: string | null) => {
    switch (grade) {
      case 'EXCELLENT':
        return 'bg-green-100 text-green-800';
      case 'GOOD':
        return 'bg-blue-100 text-blue-800';
      case 'AVERAGE':
        return 'bg-yellow-100 text-yellow-800';
      case 'POOR':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Campaign Monitoring</h1>
          <p className="text-gray-600">Platform-wide campaign performance and analytics</p>
        </div>

        {/* Stats Cards */}
        {statsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-24 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-32"></div>
              </div>
            ))}
          </div>
        ) : stats && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {/* Total Campaigns */}
              <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Total Campaigns</span>
                  <Target className="h-5 w-5 text-blue-500" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{stats.totalCampaigns}</div>
                <p className="text-xs text-gray-500 mt-1">{stats.activeCampaigns} active</p>
              </div>

              {/* Total Spend */}
              <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Total Spend</span>
                  <DollarSign className="h-5 w-5 text-green-500" />
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats.platformMetrics.totalSpend)}
                </div>
                <p className="text-xs text-gray-500 mt-1">Platform-wide</p>
              </div>

              {/* Total Conversions */}
              <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Conversions</span>
                  <CheckCircle className="h-5 w-5 text-purple-500" />
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {stats.platformMetrics.totalConversions.toLocaleString()}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.platformMetrics.totalClicks.toLocaleString()} clicks
                </p>
              </div>

              {/* Avg CTR */}
              <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Avg CTR</span>
                  <TrendingUp className="h-5 w-5 text-orange-500" />
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {stats.platformMetrics.avgCTR.toFixed(2)}%
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  CPM: ₹{stats.platformMetrics.avgCPM.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Performance Distribution */}
            <div className="bg-white p-6 rounded-lg shadow mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance Distribution</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['EXCELLENT', 'GOOD', 'AVERAGE', 'POOR'].map((grade) => (
                  <div key={grade} className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className={`text-2xl font-bold ${getGradeColor(grade).split(' ')[1]}`}>
                      {stats.gradeDistribution[grade] || 0}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">{grade}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Failing Campaigns Alert */}
            {stats.failingCampaigns.length > 0 && (
              <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <h3 className="font-semibold text-red-900">
                    {stats.failingCampaigns.length} Campaigns Need Attention
                  </h3>
                </div>
                <div className="space-y-2">
                  {stats.failingCampaigns.slice(0, 3).map((campaign) => (
                    <div key={campaign.id} className="text-sm text-red-800 bg-white p-2 rounded">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{campaign.user.email}</span>
                        <span className={`px-2 py-0.5 text-xs rounded ${getGradeColor(campaign.performanceGrade)}`}>
                          {campaign.performanceGrade || campaign.status}
                        </span>
                      </div>
                      {campaign.errorMessage && (
                        <div className="text-xs text-gray-600 mt-1">{campaign.errorMessage}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex flex-wrap gap-4">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="COMPLETED">Completed</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
              <option value="GATHERING_INFO">Gathering Info</option>
              <option value="GENERATING">Generating</option>
              <option value="CREATING">Creating</option>
            </select>

            <select
              value={gradeFilter}
              onChange={(e) => {
                setGradeFilter(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Performance</option>
              <option value="EXCELLENT">Excellent</option>
              <option value="GOOD">Good</option>
              <option value="AVERAGE">Average</option>
              <option value="POOR">Poor</option>
            </select>

            <button
              onClick={loadCampaigns}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Campaigns Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Impressions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CTR
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Conversions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Spend
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <div className="flex justify-center">
                        <RefreshCw className="h-8 w-8 text-gray-400 animate-spin" />
                      </div>
                    </td>
                  </tr>
                ) : campaigns.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                      No campaigns found
                    </td>
                  </tr>
                ) : (
                  campaigns.map((campaign) => (
                    <tr key={campaign.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {campaign.user.name || 'Unknown'}
                        </div>
                        <div className="text-xs text-gray-500">{campaign.user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(campaign.status)}`}>
                          {campaign.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {campaign.performanceGrade ? (
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getGradeColor(campaign.performanceGrade)}`}>
                            {campaign.performanceGrade}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {campaign.impressions?.toLocaleString() || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {campaign.actualCTR ? `${campaign.actualCTR.toFixed(2)}%` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {campaign.actualConversions || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {campaign.actualSpend ? formatCurrency(campaign.actualSpend) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(campaign.createdAt)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Page {page} of {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
