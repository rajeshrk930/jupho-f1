'use client';

import { useState, useEffect } from 'react';
import { adminApi } from '@/lib/api';
import { 
  Users, 
  TrendingUp, 
  MessageSquare, 
  IndianRupee, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Edit, 
  Trash2, 
  Shield,
  CreditCard,
  FileText,
  Target,
  Facebook,
  ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface Stats {
  users: {
    total: number;
    free: number;
    pro: number;
  };
  analytics: {
    totalAnalyses: number;
    totalConversations: number;
    avgAnalysesPerUser: string;
  };
  revenue: {
    estimated: number;
    proSubscriptions: number;
  };
}

interface User {
  id: string;
  email: string;
  name: string;
  plan: 'FREE' | 'BASIC' | 'GROWTH';
  apiUsageCount: number;
  proExpiresAt: string | null;
  createdAt: string;
  _count: {
    analyses: number;
    conversations: number;
  };
}

export default function AdminPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);
  
  // Pagination & filters
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState<'' | 'FREE' | 'BASIC' | 'GROWTH'>('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Load stats
  useEffect(() => {
    loadStats();
  }, []);

  // Load users when filters change
  useEffect(() => {
    loadUsers();
  }, [page, search, planFilter]);

  const loadStats = async () => {
    try {
      const data = await adminApi.getStats();
      setStats(data);
    } catch (error: any) {
      if (error.response?.status === 403) {
        toast.error('Admin access required - Contact system administrator');
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 2000);
      } else {
        toast.error('Failed to load statistics');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      setUsersLoading(true);
      const data = await adminApi.getUsers({
        page,
        limit: 20,
        search: search || undefined,
        plan: planFilter || undefined,
        sortBy: 'createdAt',
        order: 'desc'
      });
      setUsers(data.users);
      setTotalPages(data.pagination.totalPages);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setUsersLoading(false);
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setShowEditModal(true);
  };

  const handleUpdateUser = async (userId: string, updates: any) => {
    try {
      await adminApi.updateUser(userId, updates);
      toast.success('User updated successfully');
      setShowEditModal(false);
      loadUsers();
      loadStats();
    } catch (error) {
      toast.error('Failed to update user');
    }
  };

  const handleDeleteUser = async (userId: string, userEmail: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete user ${userEmail}? This will permanently delete all their data.`
    );
    if (!confirmed) return;

    try {
      await adminApi.deleteUser(userId);
      toast.success('User deleted successfully');
      loadUsers();
      loadStats();
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-12 h-12 text-teal-600 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-lg">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">Manage users and view platform statistics</p>
          </div>
        </div>

        {/* Quick Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/admin/payments" className="group bg-white p-6 rounded-lg shadow hover:shadow-lg transition-all border-2 border-transparent hover:border-blue-500">
            <div className="flex items-center justify-between mb-3">
              <CreditCard className="h-8 w-8 text-blue-500" />
              <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="font-semibold text-gray-900 text-lg">Payments</h3>
            <p className="text-sm text-gray-600 mt-1">Revenue & transactions</p>
          </Link>

          <Link href="/admin/templates" className="group bg-white p-6 rounded-lg shadow hover:shadow-lg transition-all border-2 border-transparent hover:border-purple-500">
            <div className="flex items-center justify-between mb-3">
              <FileText className="h-8 w-8 text-purple-500" />
              <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-purple-500 group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="font-semibold text-gray-900 text-lg">Templates</h3>
            <p className="text-sm text-gray-600 mt-1">Manage ad templates</p>
          </Link>

          <Link href="/admin/campaigns" className="group bg-white p-6 rounded-lg shadow hover:shadow-lg transition-all border-2 border-transparent hover:border-green-500">
            <div className="flex items-center justify-between mb-3">
              <Target className="h-8 w-8 text-green-500" />
              <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-green-500 group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="font-semibold text-gray-900 text-lg">Campaigns</h3>
            <p className="text-sm text-gray-600 mt-1">Monitor performance</p>
          </Link>

          <Link href="/admin/integrations" className="group bg-white p-6 rounded-lg shadow hover:shadow-lg transition-all border-2 border-transparent hover:border-indigo-500">
            <div className="flex items-center justify-between mb-3">
              <Facebook className="h-8 w-8 text-indigo-600" />
              <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="font-semibold text-gray-900 text-lg">Integrations</h3>
            <p className="text-sm text-gray-600 mt-1">Facebook health</p>
          </Link>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Users */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-gray-500">Total</span>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {stats.users.total}
              </div>
              <div className="text-sm text-gray-600">
                {stats.users.free} FREE · {stats.users.pro} PRO
              </div>
            </div>

            {/* Analyses */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-teal-600" />
                </div>
                <span className="text-sm font-medium text-gray-500">Analyses</span>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {stats.analytics.totalAnalyses}
              </div>
              <div className="text-sm text-gray-600">
                {stats.analytics.avgAnalysesPerUser} avg/user
              </div>
            </div>

            {/* Conversations */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-purple-600" />
                </div>
                <span className="text-sm font-medium text-gray-500">Chats</span>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {stats.analytics.totalConversations}
              </div>
              <div className="text-sm text-gray-600">
                Total conversations
              </div>
            </div>

            {/* Revenue */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <IndianRupee className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-sm font-medium text-gray-500">Revenue</span>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                ₹{stats.revenue.estimated.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">
                {stats.revenue.proSubscriptions} subscriptions
              </div>
            </div>
          </div>
        )}

        {/* Users Table */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          {/* Filters */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              {/* Plan Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  value={planFilter}
                  onChange={(e) => {
                    setPlanFilter(e.target.value as '' | 'FREE' | 'BASIC' | 'GROWTH');
                    setPage(1);
                  }}
                  className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent appearance-none bg-white"
                >
                  <option value="">All Plans</option>
                  <option value="FREE">FREE</option>
                  <option value="BASIC">BASIC</option>
                  <option value="GROWTH">GROWTH</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Activity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {usersLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      Loading users...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.plan === 'GROWTH'
                            ? 'bg-teal-100 text-teal-800'
                            : user.plan === 'BASIC'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.plan}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {user.apiUsageCount} uses
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {user._count.analyses} analyses · {user._count.conversations} chats
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => handleEditUser(user)}
                          className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-teal-700 hover:text-teal-900 hover:bg-teal-50 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id, user.email)}
                          className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-700 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Edit User Modal */}
      {showEditModal && editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setShowEditModal(false)}
          onSave={handleUpdateUser}
        />
      )}
    </div>
  );
}

// Edit User Modal Component
function EditUserModal({ 
  user, 
  onClose, 
  onSave 
}: { 
  user: User; 
  onClose: () => void; 
  onSave: (userId: string, updates: any) => Promise<void>;
}) {
  const [plan, setPlan] = useState(user.plan);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(user.id, { plan });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-2xl">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Edit User</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">User Email</label>
            <input
              type="text"
              value={user.email}
              disabled
              className="input bg-gray-100 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="label">Plan</label>
            <select
              value={plan}
              onChange={(e) => setPlan(e.target.value as 'FREE' | 'BASIC' | 'GROWTH')}
              className="input"
            >
              <option value="FREE">FREE</option>
              <option value="BASIC">BASIC</option>
              <option value="GROWTH">GROWTH</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              FREE: 2 campaigns/month · BASIC: 10 campaigns/month (templates) · GROWTH: 25 campaigns/month (AI Agent)
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 btn-primary"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
