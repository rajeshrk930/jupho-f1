'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Sparkles, Eye, ExternalLink, Calendar, TrendingUp } from 'lucide-react';
import { agentApi } from '@/lib/api';
import CampaignStatusBadge from '@/components/CampaignStatusBadge';
import { ListSkeleton } from '@/components/Skeleton';

interface Ad {
  id: string;
  status: string;
  createdAt: string;
  businessProfile?: string;
  fbCampaignId?: string;
  fbAdId?: string;
  actualCPM?: number;
  actualCTR?: number;
  actualConversions?: number;
  actualSpend?: number;
  impressions?: number;
  clicks?: number;
  input?: string;
}

export default function RecentAdsPage() {
  const router = useRouter();
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAds();
  }, []);

  const loadAds = async () => {
    try {
      const response = await agentApi.getTasks(50);
      // Show only completed ads (successfully created ads)
      const completedAds = response.tasks?.filter((task: Ad) => task.status === 'COMPLETED') || [];
      setAds(completedAds);
    } catch (error) {
      console.error('Failed to load ads:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ListSkeleton count={3} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Dashboard
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Sparkles className="w-8 h-8 text-purple-600" />
                Recent Ads
              </h1>
              <p className="text-gray-600 mt-2">View all your created ads</p>
            </div>
            <button
              onClick={() => router.push('/agent')}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors"
            >
              Create New Ad
            </button>
          </div>
        </div>

        {/* Ads Gallery */}
        <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
          {ads.length === 0 ? (
            <div className="p-12 text-center">
              <Sparkles className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No ads created yet</p>
              <button
                onClick={() => router.push('/agent')}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Create Your First Ad
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {ads.map((ad) => {
                let businessName = 'Unknown Business';
                let headline = '';
                let primaryText = '';
                let objective = 'Lead Generation';
                
                try {
                  if (ad.businessProfile) {
                    const profile = JSON.parse(ad.businessProfile);
                    businessName = profile.brandName || profile.businessName || businessName;
                  }
                  if (ad.input) {
                    const input = JSON.parse(ad.input);
                    objective = input.objective || objective;
                    headline = input.adCopy?.headline || '';
                    primaryText = input.adCopy?.primaryText || '';
                  }
                } catch (e) {
                  // Ignore parse errors
                }

                const createdDate = new Date(ad.createdAt);
                const timeAgo = createdDate.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                });

                return (
                  <div
                    key={ad.id}
                    className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer"
                    onClick={() => router.push(`/agent/tasks/${ad.id}`)}
                  >
                    {/* Ad Preview Card */}
                    <div className="p-5">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
                            {businessName}
                          </h3>
                          <CampaignStatusBadge status={ad.status} />
                        </div>
                      </div>

                      {/* Ad Content Preview */}
                      <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200">
                        {headline && (
                          <p className="font-semibold text-gray-900 mb-2 line-clamp-2">
                            {headline}
                          </p>
                        )}
                        {primaryText && (
                          <p className="text-sm text-gray-600 line-clamp-3">
                            {primaryText}
                          </p>
                        )}
                        {!headline && !primaryText && (
                          <p className="text-sm text-gray-500 italic">
                            Ad content preview not available
                          </p>
                        )}
                      </div>

                      {/* Metadata */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-xs text-gray-600">
                          <span className="font-medium">Objective:</span>
                          <span className="ml-2">{objective}</span>
                        </div>
                        <div className="flex items-center text-xs text-gray-600">
                          <span className="font-medium">Created by:</span>
                          <span className="ml-2 text-purple-600">AI Agent</span>
                        </div>
                        <div className="flex items-center text-xs text-gray-500">
                          <Calendar className="w-3 h-3 mr-1" />
                          {timeAgo}
                        </div>
                      </div>

                      {/* Performance Metrics */}
                      {ad.impressions !== null && ad.impressions !== undefined && (
                        <div className="grid grid-cols-2 gap-3 mb-4 p-3 bg-purple-50 rounded-lg border border-purple-100">
                          <div>
                            <p className="text-xs text-purple-600 font-medium">Impressions</p>
                            <p className="text-lg font-bold text-purple-900">
                              {ad.impressions?.toLocaleString() || '0'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-purple-600 font-medium">Clicks</p>
                            <p className="text-lg font-bold text-purple-900">
                              {ad.clicks?.toLocaleString() || '0'}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/agent/tasks/${ad.id}`);
                          }}
                          className="flex-1 inline-flex items-center justify-center px-3 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </button>
                        {ad.fbAdId && (
                          <a
                            href={`https://facebook.com/ads/manager/ad/${ad.fbAdId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center justify-center px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
