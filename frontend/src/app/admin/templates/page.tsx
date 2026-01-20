'use client';

import { useState, useEffect } from 'react';
import { adminTemplateApi } from '@/lib/api';
import { 
  FileText, 
  TrendingUp, 
  Users, 
  Search, 
  Filter,
  Edit,
  Trash2,
  CheckSquare,
  Square,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Template {
  id: string;
  name: string;
  category: string | null;
  description: string | null;
  isPublic: boolean;
  objective: string;
  conversionMethod: string;
  usageCount: number;
  createdAt: string;
  userId: string | null;
  user: {
    id: string;
    email: string;
    name: string;
  } | null;
}

interface TemplateStats {
  totalTemplates: number;
  systemTemplates: number;
  userTemplates: number;
  topTemplates: Array<{
    id: string;
    name: string;
    category: string | null;
    usageCount: number;
    isPublic: boolean;
  }>;
}

export default function AdminTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [stats, setStats] = useState<TemplateStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  
  // Pagination & filters
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [visibilityFilter, setVisibilityFilter] = useState<'' | 'true' | 'false'>('');
  
  // Bulk operations
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    loadTemplates();
  }, [page, categoryFilter, visibilityFilter]);

  const loadStats = async () => {
    try {
      setStatsLoading(true);
      const data = await adminTemplateApi.getTemplateStats();
      setStats(data);
    } catch (error: any) {
      console.error('Failed to load template stats:', error);
      if (error.response?.status === 403) {
        toast.error('Admin access required');
      } else {
        toast.error('Failed to load template statistics');
      }
    } finally {
      setStatsLoading(false);
    }
  };

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const data = await adminTemplateApi.getTemplates({
        page,
        limit: 20,
        category: categoryFilter || undefined,
        isPublic: visibilityFilter ? visibilityFilter === 'true' : undefined,
        search: search || undefined
      });
      setTemplates(data.templates);
      setTotalPages(data.pagination.totalPages);
    } catch (error: any) {
      console.error('Failed to load templates:', error);
      if (error.response?.status === 403) {
        toast.error('Admin access required - Contact system administrator');
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 2000);
      } else {
        toast.error('Failed to load templates');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    loadTemplates();
  };

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === templates.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(templates.map(t => t.id)));
    }
  };

  const handleToggleVisibility = async (templateId: string, currentIsPublic: boolean) => {
    try {
      await adminTemplateApi.updateTemplate(templateId, { isPublic: !currentIsPublic });
      toast.success(`Template ${!currentIsPublic ? 'published' : 'unpublished'}`);
      loadTemplates();
      loadStats();
    } catch (error) {
      console.error('Failed to update template:', error);
      toast.error('Failed to update template visibility');
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      await adminTemplateApi.deleteTemplate(templateId);
      toast.success('Template deleted successfully');
      loadTemplates();
      loadStats();
    } catch (error) {
      console.error('Failed to delete template:', error);
      toast.error('Failed to delete template');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) {
      toast.error('No templates selected');
      return;
    }

    if (!confirm(`Delete ${selectedIds.size} selected templates?`)) return;

    try {
      setBulkActionLoading(true);
      await adminTemplateApi.bulkDeleteTemplates(Array.from(selectedIds));
      toast.success(`${selectedIds.size} templates deleted successfully`);
      setSelectedIds(new Set());
      loadTemplates();
      loadStats();
    } catch (error) {
      console.error('Failed to bulk delete:', error);
      toast.error('Failed to delete templates');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkMakePublic = async () => {
    if (selectedIds.size === 0) {
      toast.error('No templates selected');
      return;
    }

    try {
      setBulkActionLoading(true);
      await adminTemplateApi.bulkUpdateTemplates(Array.from(selectedIds), { isPublic: true });
      toast.success(`${selectedIds.size} templates made public`);
      setSelectedIds(new Set());
      loadTemplates();
      loadStats();
    } catch (error) {
      console.error('Failed to bulk update:', error);
      toast.error('Failed to update templates');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkMakePrivate = async () => {
    if (selectedIds.size === 0) {
      toast.error('No templates selected');
      return;
    }

    try {
      setBulkActionLoading(true);
      await adminTemplateApi.bulkUpdateTemplates(Array.from(selectedIds), { isPublic: false });
      toast.success(`${selectedIds.size} templates made private`);
      setSelectedIds(new Set());
      loadTemplates();
      loadStats();
    } catch (error) {
      console.error('Failed to bulk update:', error);
      toast.error('Failed to update templates');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Template Management</h1>
          <p className="text-gray-600">Manage ad templates, categories, and visibility</p>
        </div>

        {/* Stats Cards */}
        {statsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-24 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-32"></div>
              </div>
            ))}
          </div>
        ) : stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Total Templates */}
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Total Templates</span>
                <FileText className="h-5 w-5 text-blue-500" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{stats.totalTemplates}</div>
              <p className="text-xs text-gray-500 mt-1">
                {stats.systemTemplates} public, {stats.userTemplates} private
              </p>
            </div>

            {/* System Templates */}
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Public Templates</span>
                <Eye className="h-5 w-5 text-green-500" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{stats.systemTemplates}</div>
              <p className="text-xs text-gray-500 mt-1">Available to all users</p>
            </div>

            {/* User Templates */}
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">User Templates</span>
                <Users className="h-5 w-5 text-purple-500" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{stats.userTemplates}</div>
              <p className="text-xs text-gray-500 mt-1">Private user templates</p>
            </div>
          </div>
        )}

        {/* Top Templates */}
        {stats && stats.topTemplates.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-orange-500" />
              Most Used Templates
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stats.topTemplates.slice(0, 6).map((template) => (
                <div key={template.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{template.name}</div>
                    <div className="text-xs text-gray-500">{template.category || 'Uncategorized'}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-gray-700">{template.usageCount} uses</span>
                    {template.isPublic ? (
                      <Eye className="h-4 w-4 text-green-500" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters & Search */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <input
              type="text"
              placeholder="Filter by category..."
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />

            <select
              value={visibilityFilter}
              onChange={(e) => {
                setVisibilityFilter(e.target.value as any);
                setPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Templates</option>
              <option value="true">Public Only</option>
              <option value="false">Private Only</option>
            </select>

            <button
              onClick={handleSearch}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Search className="h-4 w-4" />
              Search
            </button>

            <button
              onClick={loadTemplates}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedIds.size > 0 && (
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6 flex items-center justify-between">
            <span className="text-sm font-medium text-blue-900">
              {selectedIds.size} template{selectedIds.size > 1 ? 's' : ''} selected
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleBulkMakePublic}
                disabled={bulkActionLoading}
                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm disabled:opacity-50"
              >
                Make Public
              </button>
              <button
                onClick={handleBulkMakePrivate}
                disabled={bulkActionLoading}
                className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm disabled:opacity-50"
              >
                Make Private
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={bulkActionLoading}
                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm disabled:opacity-50"
              >
                Delete Selected
              </button>
            </div>
          </div>
        )}

        {/* Templates Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <button onClick={toggleSelectAll} className="text-gray-500 hover:text-gray-700">
                      {selectedIds.size === templates.length && templates.length > 0 ? (
                        <CheckSquare className="h-5 w-5" />
                      ) : (
                        <Square className="h-5 w-5" />
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Template
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Visibility
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Owner
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
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
                ) : templates.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                      No templates found
                    </td>
                  </tr>
                ) : (
                  templates.map((template) => (
                    <tr key={template.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <button onClick={() => toggleSelection(template.id)}>
                          {selectedIds.has(template.id) ? (
                            <CheckSquare className="h-5 w-5 text-blue-600" />
                          ) : (
                            <Square className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{template.name}</div>
                        {template.description && (
                          <div className="text-xs text-gray-500 truncate max-w-xs">
                            {template.description}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                          {template.category || 'None'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleVisibility(template.id, template.isPublic)}
                          className="flex items-center gap-1"
                        >
                          {template.isPublic ? (
                            <>
                              <Eye className="h-4 w-4 text-green-500" />
                              <span className="text-sm text-green-600">Public</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-500">Private</span>
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {template.usageCount} uses
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {template.user ? template.user.email : 'System'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(template.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleDeleteTemplate(template.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
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
