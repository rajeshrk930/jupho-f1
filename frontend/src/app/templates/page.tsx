'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { TemplateEditor } from '@/components/templates/TemplateEditor';
import TemplateUpload from '@/components/admin/TemplateUpload';
import { useAuthStore } from '@/lib/store';

interface Template {
  id: string;
  name: string;
  category: string;
  description: string;
  objective: string;
  usageCount: number;
  isPublic: boolean;
  targeting: {
    ageMin: number;
    ageMax: number;
    interestKeywords: string[];
  };
  budget: {
    dailyAmount: number;
    currency: string;
  };
  adCopy: {
    headlines: string[];
    primaryTexts: string[];
    descriptions: string[];
    cta: string;
  };
}

const categories = [
  { id: 'ALL', name: 'All Templates', icon: '📋' },
  { id: 'RESTAURANT', name: 'Restaurants', icon: '🍔' },
  { id: 'GYM', name: 'Fitness & Gyms', icon: '🏋️' },
  { id: 'REAL_ESTATE', name: 'Real Estate', icon: '🏠' },
  { id: 'SALON', name: 'Salon & Beauty', icon: '💇' },
  { id: 'HOME_SERVICES', name: 'Home Services', icon: '🔧' },
  { id: 'ECOMMERCE', name: 'E-commerce', icon: '🛍️' },
  { id: 'HEALTHCARE', name: 'Healthcare', icon: '🏥' },
  { id: 'EDUCATION', name: 'Education', icon: '📚' },
  { id: 'AUTOMOTIVE', name: 'Automotive', icon: '🚗' },
  { id: 'HOSPITALITY', name: 'Hotels & Travel', icon: '🏨' },
];

export default function TemplatesPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [showUserTemplates, setShowUserTemplates] = useState(false);

  // Check if user is admin (customize based on your admin logic)
  const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',') || [];
  const isAdmin = user?.email && adminEmails.includes(user.email);

  useEffect(() => {
    fetchTemplates();
  }, []);

  useEffect(() => {
    filterTemplates();
  }, [templates, selectedCategory, searchQuery, showUserTemplates]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await api.get('/templates');
      setTemplates(response.data.templates || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterTemplates = () => {
    let filtered = templates;

    // Filter by user/public templates
    if (showUserTemplates) {
      filtered = filtered.filter((t) => !t.isPublic);
    } else {
      filtered = filtered.filter((t) => t.isPublic);
    }

    // Filter by category
    if (selectedCategory !== 'ALL') {
      filtered = filtered.filter((t) => t.category === selectedCategory);
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.name.toLowerCase().includes(query) ||
          t.description?.toLowerCase().includes(query) ||
          t.category?.toLowerCase().includes(query)
      );
    }

    setFilteredTemplates(filtered);
  };

  const handleUseTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setShowEditor(true);
  };

  const handleEditorClose = () => {
    setShowEditor(false);
    setSelectedTemplate(null);
  };

  const handleLaunchSuccess = () => {
    setShowEditor(false);
    setSelectedTemplate(null);
    router.push('/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Ad Templates</h1>
          <p className="mt-2 text-gray-600">
            Launch winning ads in minutes with our proven templates
          </p>
        </div>

        {/* Admin Upload Section */}
        {isAdmin && (
          <div className="mb-8">
            <TemplateUpload />
          </div>
        )}

        {/* Toggle: System vs User Templates */}
        <div className="mb-6 flex space-x-4">
          <button
            onClick={() => setShowUserTemplates(false)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              !showUserTemplates
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            System Templates
          </button>
          <button
            onClick={() => setShowUserTemplates(true)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              showUserTemplates
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            My Templates
          </button>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Category Pills */}
        <div className="mb-8 flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full font-medium transition ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>

        {/* Templates Grid */}
        {filteredTemplates.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              {showUserTemplates
                ? 'No saved templates yet. Create one from a successful campaign!'
                : 'No templates found. Try a different search or category.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-6"
              >
                {/* Template Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {template.name}
                    </h3>
                    <p className="text-sm text-gray-600">{template.description}</p>
                  </div>
                  {template.isPublic && (
                    <span className="ml-2 flex items-center text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                      ⭐ {template.usageCount}
                    </span>
                  )}
                </div>

                {/* Ad Copy Preview */}
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-900 mb-1">
                    {template.adCopy.headlines[0]}
                  </p>
                  <p className="text-xs text-gray-600 line-clamp-2">
                    {template.adCopy.primaryTexts[0]}
                  </p>
                </div>

                {/* Template Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="font-medium mr-2">Budget:</span>
                    {template.budget.currency} {template.budget.dailyAmount}/day
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="font-medium mr-2">Audience:</span>
                    {template.targeting.ageMin}-{template.targeting.ageMax} years
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {template.targeting.interestKeywords.slice(0, 3).map((keyword, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => handleUseTemplate(template)}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  Use This Template
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Template Editor Modal */}
      {showEditor && selectedTemplate && (
        <TemplateEditor
          template={selectedTemplate}
          onClose={handleEditorClose}
          onSuccess={handleLaunchSuccess}
        />
      )}
    </div>
  );
}
