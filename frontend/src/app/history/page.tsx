'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import { analysisApi } from '@/lib/api';
import { Analysis } from '@/types';
import { AnalysisResult } from '@/components/AnalysisResult';
import { StatusBadge } from '@/components/StatusBadge';
import { Search, SlidersHorizontal, ArrowUpDown } from 'lucide-react';

type SortOption = 'date-desc' | 'date-asc' | 'ctr-desc' | 'ctr-asc' | 'cpm-desc' | 'cpm-asc';

export default function HistoryPage() {
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuthStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');
  const [filterResultType, setFilterResultType] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const { data, isLoading } = useQuery({
    queryKey: ['analyses'],
    queryFn: () => analysisApi.getAll({ limit: 15, page: 1 }),
    enabled: isAuthenticated,
  });

  const analyses = data?.data?.analyses || [];
  
  // Filter and sort analyses
  const filteredAnalyses = useMemo(() => {
    let filtered = analyses;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter((a: Analysis) =>
        a.primaryReason?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.primaryText?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.headline?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Result type filter
    if (filterResultType !== 'all') {
      filtered = filtered.filter((a: Analysis) => a.resultType === filterResultType);
    }

    // Sort
    filtered = [...filtered].sort((a: Analysis, b: Analysis) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'date-asc':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'ctr-desc':
          return (b.ctr || 0) - (a.ctr || 0);
        case 'ctr-asc':
          return (a.ctr || 0) - (b.ctr || 0);
        case 'cpm-desc':
          return (b.cpm || 0) - (a.cpm || 0);
        case 'cpm-asc':
          return (a.cpm || 0) - (b.cpm || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [analyses, searchQuery, filterResultType, sortBy]);

  const selectedAnalysis = filteredAnalyses.find((a: Analysis) => a.id === selectedId);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-base">
      {/* Main Content */}
      <main className="px-4 py-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs text-signal-primary font-medium">Reports</p>
            <h2 className="text-xl font-semibold text-text-primary">Past Analyses</h2>
            <p className="text-sm text-text-secondary mt-1">{filteredAnalyses.length} {filteredAnalyses.length === 1 ? 'result' : 'results'}</p>
          </div>
        </div>

        {/* Search and Filters Bar */}
        <div className="bg-base-surface rounded-md border border-border-default p-4 shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by text, headline, or reason..."
                className="w-full pl-10 pr-4 py-2 border border-border-default rounded-md focus:ring-2 focus:ring-signal-primary focus:border-signal-primary text-sm bg-base"
              />
            </div>

            {/* Sort */}
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-3 py-2 border border-border-default rounded-md focus:ring-2 focus:ring-signal-primary focus:border-signal-primary text-sm bg-base"
              >
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="ctr-desc">Highest CTR</option>
                <option value="ctr-asc">Lowest CTR</option>
                <option value="cpm-desc">Highest CPM</option>
                <option value="cpm-asc">Lowest CPM</option>
              </select>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-3 py-2 border rounded-md text-sm font-medium inline-flex items-center gap-2 transition-colors ${
                  showFilters || filterResultType !== 'all'
                    ? 'border-signal-primary bg-signal-primary/10 text-signal-primary'
                    : 'border-border-default bg-base-surface text-text-secondary hover:bg-base-elevated'
                }`}
              >
                <SlidersHorizontal size={16} />
                Filters
              </button>
            </div>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="pt-3 border-t border-border-subtle">
              <div className="flex flex-wrap gap-2">
                <label className="text-sm font-medium text-text-secondary flex items-center">
                  Result Type:
                </label>
                <button
                  onClick={() => setFilterResultType('all')}
                  className={`px-3 py-1 rounded-sm text-sm font-medium transition-colors ${
                    filterResultType === 'all'
                      ? 'bg-signal-primary text-white'
                      : 'bg-base-elevated text-text-secondary hover:bg-base-elevated/80'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterResultType('WINNING')}
                  className={`px-3 py-1 rounded-sm text-sm font-medium transition-colors ${
                    filterResultType === 'WINNING'
                      ? 'bg-signal-primary text-white'
                      : 'bg-base-elevated text-text-secondary hover:bg-base-elevated/80'
                  }`}
                >
                  Winning
                </button>
                <button
                  onClick={() => setFilterResultType('AVERAGE')}
                  className={`px-3 py-1 rounded-sm text-sm font-medium transition-colors ${
                    filterResultType === 'AVERAGE'
                      ? 'bg-signal-primary text-white'
                      : 'bg-base-elevated text-text-secondary hover:bg-base-elevated/80'
                  }`}
                >
                  Average
                </button>
                <button
                  onClick={() => setFilterResultType('DEAD')}
                  className={`px-3 py-1 rounded-sm text-sm font-medium transition-colors ${
                    filterResultType === 'DEAD'
                      ? 'bg-signal-primary text-white'
                      : 'bg-base-elevated text-text-secondary hover:bg-base-elevated/80'
                  }`}
                >
                  Needs Work
                </button>
              </div>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6" aria-label="Loading analyses">
            <div className="bg-base-surface rounded-md border border-border-default p-4 shadow-sm space-y-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="skeleton h-3 w-24" />
                  <div className="skeleton h-4 w-full" />
                </div>
              ))}
            </div>
            <div className="bg-base-surface rounded-md border border-border-default p-6 shadow-sm md:col-span-2 space-y-4">
              <div className="skeleton h-5 w-40" />
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="skeleton h-4 w-full" />
                ))}
              </div>
            </div>
          </div>
        ) : analyses.length === 0 ? (
          <div className="bg-base-surface rounded-md border border-border-default p-12 text-center shadow-sm">
            <div className="max-w-sm mx-auto space-y-4">
              <div className="w-16 h-16 mx-auto rounded-sm bg-base-elevated flex items-center justify-center">
                <svg className="w-8 h-8 text-signal-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-text-primary font-medium">No analyses yet</p>
              <p className="text-sm text-text-secondary">Start by analyzing your first ad creative</p>
              <a href="/analyze" className="inline-block px-4 py-2 bg-signal-primary text-white rounded-sm hover:bg-signal-primary/90 transition-colors font-medium text-sm">
                Create First Analysis
              </a>
            </div>
          </div>
        ) : filteredAnalyses.length === 0 ? (
          <div className="bg-base-surface rounded-md border border-border-default p-12 text-center shadow-sm">
            <div className="max-w-sm mx-auto space-y-4">
              <div className="w-16 h-16 mx-auto rounded-sm bg-base-elevated flex items-center justify-center">
                <Search size={32} className="text-text-tertiary" />
              </div>
              <p className="text-text-primary font-medium">No results found</p>
              <p className="text-sm text-text-secondary">Try adjusting your search or filters</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilterResultType('all');
                }}
                className="text-signal-primary hover:text-signal-primary/80 text-sm font-medium"
              >
                Clear all filters
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
            {/* List */}
            <div className="w-full lg:w-2/5 lg:shrink-0">
              <div className="space-y-3">
                {filteredAnalyses.map((analysis: Analysis) => (
                  <button
                    key={analysis.id}
                    onClick={() => setSelectedId(analysis.id)}
                    className={`w-full text-left p-4 md:p-5 rounded-md transition-colors border group animate-slideUp ${
                      selectedId === analysis.id
                        ? 'bg-signal-primary/5 border-signal-primary'
                        : 'border-border-default hover:border-signal-primary bg-base-surface'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs md:text-sm text-text-tertiary font-medium">
                        {formatDate(analysis.createdAt)}
                      </span>
                      <StatusBadge status={analysis.resultType as 'WINNING' | 'AVERAGE' | 'DEAD'} size="sm" />
                    </div>
                    <p className="text-sm md:text-base font-semibold text-text-primary line-clamp-2 mb-2">
                      {analysis.primaryReason}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      {analysis.industry && (
                        <span className="text-xs md:text-sm px-2.5 py-1 rounded-sm bg-base-elevated text-text-secondary font-medium">
                          {analysis.industry.replace('_', ' ')}
                        </span>
                      )}
                      <span className="text-xs md:text-sm text-text-tertiary">CTR {analysis.ctr}%</span>
                      <span className="text-xs text-text-tertiary">•</span>
                      <span className="text-xs md:text-sm text-text-tertiary">CPM ₹{analysis.cpm}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Detail View */}
            <div className="flex-1">
              <div className="bg-base-surface rounded-md border border-border-default p-6 min-h-[400px] shadow-sm">
                {selectedAnalysis ? (
                  <AnalysisResult analysis={selectedAnalysis} />
                ) : (
                  <div className="flex items-center justify-center h-80 text-text-tertiary">
                    <p>Select an analysis to view details</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
