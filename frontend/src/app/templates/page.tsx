'use client';

import { useEffect, useState } from 'react';
import { BookMarked, Trash2, Copy, FileText, MessageSquare, Sparkles, Plus } from 'lucide-react';
import { templateApi } from '@/lib/api';
import { SavedTemplate, TemplateCategory } from '@/types';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type Tab = 'COPY' | 'SCRIPT' | 'REPORT';

const TAB_CONFIG = {
  COPY: {
    label: '✍️ Ad Copy & Hooks',
    icon: Sparkles,
    color: 'purple',
    emptyMessage: 'No ad copy templates yet',
  },
  SCRIPT: {
    label: '📞 Sales Scripts',
    icon: MessageSquare,
    color: 'green',
    emptyMessage: 'No sales scripts yet',
  },
  REPORT: {
    label: '📄 Full Reports',
    icon: FileText,
    color: 'blue',
    emptyMessage: 'No reports saved yet',
  },
};

export default function TemplatesPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('COPY');
  const [templates, setTemplates] = useState<SavedTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const loadTemplates = async (category?: TemplateCategory) => {
    try {
      setLoading(true);
      const response = await templateApi.getAll(category);
      if (response.success) {
        setTemplates(response.data || []);
      }
    } catch (error) {
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadTemplates(activeTab);
  }, [activeTab]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      await templateApi.delete(id);
      toast.success('Template deleted');
      setTemplates(templates.filter(t => t.id !== id));
    } catch (error) {
      toast.error('Failed to delete template');
    }
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success('Copied to clipboard!');
  };

  const getCategoryBadge = (category: TemplateCategory) => {
    const colors = {
      COPY: 'bg-purple-100 text-purple-700',
      SCRIPT: 'bg-green-100 text-green-700',
      REPORT: 'bg-blue-100 text-blue-700',
    };
    return colors[category];
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getPreview = (content: string, maxLength = 120) => {
    return content.length > maxLength ? content.slice(0, maxLength) + '...' : content;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <BookMarked className="w-8 h-8 text-teal-600" />
              <h1 className="text-3xl font-bold text-gray-900">Saved Templates</h1>
            </div>
            <p className="text-gray-600 mt-2">Your library of high-performing ad copy, scripts, and reports</p>
          </div>
        </div>

        {/* 3-Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-1 flex gap-1">
          {Object.entries(TAB_CONFIG).map(([key, config]) => {
            const Icon = config.icon;
            const isActive = activeTab === key;
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key as Tab)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md transition-all font-medium ${
                  isActive
                    ? 'bg-teal-50 text-teal-700 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm">{config.label}</span>
              </button>
            );
          })}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-lg border border-gray-200 p-5 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && templates.length === 0 && (
          <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {TAB_CONFIG[activeTab].emptyMessage}
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Go to <strong>Analyze</strong> and click <strong>'Generate Fix'</strong> buttons to start building your library.
            </p>
            <button
              onClick={() => router.push('/analyze')}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              Go to Analyze
            </button>
          </div>
        )}

        {/* Template Cards Grid */}
        {!loading && templates.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <div
                key={template.id}
                className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow"
              >
                {/* Badge + Date */}
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded ${getCategoryBadge(template.category)}`}>
                    {template.category}
                  </span>
                  <span className="text-xs text-gray-500">{formatDate(template.createdAt)}</span>
                </div>

                {/* Title */}
                <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{template.title}</h3>

                {/* Preview */}
                <div className="mb-4">
                  {expandedId === template.id ? (
                    <div className="prose prose-sm max-w-none prose-p:text-gray-700 prose-headings:text-gray-900 prose-li:text-gray-700">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {template.content}
                      </ReactMarkdown>
                      <button
                        onClick={() => setExpandedId(null)}
                        className="text-teal-600 text-sm font-medium mt-2 hover:text-teal-700"
                      >
                        Show less
                      </button>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm text-gray-600 line-clamp-3">{getPreview(template.content)}</p>
                      {template.content.length > 120 && (
                        <button
                          onClick={() => setExpandedId(template.id)}
                          className="text-teal-600 text-sm font-medium mt-1 hover:text-teal-700"
                        >
                          Read more
                        </button>
                      )}
                    </>
                  )}
                </div>

                {/* Tags */}
                {template.tags && template.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {template.tags.map((tag, idx) => (
                      <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => handleCopy(template.content)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm font-medium text-gray-700 transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                    Copy
                  </button>
                  <button
                    onClick={() => handleDelete(template.id)}
                    className="px-3 py-2 bg-red-50 hover:bg-red-100 rounded-lg text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
