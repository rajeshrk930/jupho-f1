import React from 'react';
import { formatDistanceToNow } from 'date-fns';

interface PerformanceCardProps {
  cpm?: number | null;
  ctr?: number | null;
  conversions?: number | null;
  spend?: number | null;
  impressions?: number | null;
  clicks?: number | null;
  grade?: string | null;
  lastSynced?: Date | null;
  onSync?: () => void;
  isSyncing?: boolean;
  className?: string;
  compact?: boolean;
}

const GRADE_COLORS = {
  EXCELLENT: 'bg-green-100 text-green-800 border-green-300',
  GOOD: 'bg-blue-100 text-blue-800 border-blue-300',
  AVERAGE: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  POOR: 'bg-red-100 text-red-800 border-red-300',
  PENDING: 'bg-gray-100 text-gray-600 border-gray-300'
};

const GRADE_LABELS = {
  EXCELLENT: '🎉 Excellent',
  GOOD: '👍 Good',
  AVERAGE: '😐 Average',
  POOR: '📉 Poor',
  PENDING: '⏳ Pending'
};

export default function PerformanceCard({
  cpm,
  ctr,
  conversions,
  spend,
  impressions,
  clicks,
  grade,
  lastSynced,
  onSync,
  isSyncing = false,
  className = '',
  compact = false
}: PerformanceCardProps) {
  const hasData = cpm !== null && cpm !== undefined;
  const gradeKey = (grade || 'PENDING') as keyof typeof GRADE_COLORS;

  if (compact) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className={`px-2 py-1 rounded-md text-xs font-medium border ${GRADE_COLORS[gradeKey]}`}>
          {GRADE_LABELS[gradeKey]}
        </div>
        {hasData && (
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <span>₹{cpm?.toFixed(2)} CPM</span>
            <span className="text-gray-300">|</span>
            <span>{ctr?.toFixed(2)}% CTR</span>
            {conversions !== null && conversions !== undefined && conversions > 0 && (
              <>
                <span className="text-gray-300">|</span>
                <span>{conversions} conversions</span>
              </>
            )}
          </div>
        )}
        {!hasData && (
          <span className="text-sm text-gray-500">No data yet</span>
        )}
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Performance Metrics</h3>
        <div className={`px-3 py-1 rounded-md text-sm font-medium border ${GRADE_COLORS[gradeKey]}`}>
          {GRADE_LABELS[gradeKey]}
        </div>
      </div>

      {!hasData ? (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">📊</div>
          <p className="text-gray-600 mb-4">No performance data available yet</p>
          <p className="text-sm text-gray-500">
            Try syncing after 24 hours of campaign launch
          </p>
        </div>
      ) : (
        <>
          {/* Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
            {/* CPM */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-xs text-gray-500 uppercase mb-1">CPM</div>
              <div className="text-2xl font-bold text-gray-900">
                ₹{cpm?.toFixed(2) || '0.00'}
              </div>
              <div className="text-xs text-gray-500 mt-1">Cost per 1000 impressions</div>
            </div>

            {/* CTR */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-xs text-gray-500 uppercase mb-1">CTR</div>
              <div className="text-2xl font-bold text-gray-900">
                {ctr?.toFixed(2) || '0.00'}%
              </div>
              <div className="text-xs text-gray-500 mt-1">Click-through rate</div>
            </div>

            {/* Conversions */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-xs text-gray-500 uppercase mb-1">Conversions</div>
              <div className="text-2xl font-bold text-gray-900">
                {conversions || 0}
              </div>
              <div className="text-xs text-gray-500 mt-1">Total leads/sales</div>
            </div>

            {/* Spend */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-xs text-gray-500 uppercase mb-1">Spend</div>
              <div className="text-2xl font-bold text-gray-900">
                ₹{spend?.toFixed(2) || '0.00'}
              </div>
              <div className="text-xs text-gray-500 mt-1">Total spent</div>
            </div>

            {/* Impressions */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-xs text-gray-500 uppercase mb-1">Impressions</div>
              <div className="text-2xl font-bold text-gray-900">
                {impressions?.toLocaleString() || '0'}
              </div>
              <div className="text-xs text-gray-500 mt-1">Times shown</div>
            </div>

            {/* Clicks */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-xs text-gray-500 uppercase mb-1">Clicks</div>
              <div className="text-2xl font-bold text-gray-900">
                {clicks?.toLocaleString() || '0'}
              </div>
              <div className="text-xs text-gray-500 mt-1">Total clicks</div>
            </div>
          </div>

          {/* Performance Insights */}
          <div className="border-t border-gray-200 pt-4">
            {grade === 'EXCELLENT' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-800">
                  🎯 <strong>Outstanding performance!</strong> Your CTR is above 2% and CPM is under ₹100. Keep it up!
                </p>
              </div>
            )}
            {grade === 'GOOD' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  👍 <strong>Great results!</strong> Your ad is performing well with CTR above 1.5% and CPM under ₹150.
                </p>
              </div>
            )}
            {grade === 'AVERAGE' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  💡 <strong>Room for improvement.</strong> Consider testing new headlines or images to boost CTR.
                </p>
              </div>
            )}
            {grade === 'POOR' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-800">
                  📉 <strong>Needs attention.</strong> Your CTR is below 1% or CPM is high. Try refreshing your creative or adjusting targeting.
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
        <div className="text-xs text-gray-500">
          {lastSynced ? (
            <>
              Last synced{' '}
              <span className="font-medium text-gray-700">
                {formatDistanceToNow(new Date(lastSynced), { addSuffix: true })}
              </span>
            </>
          ) : (
            'Not synced yet'
          )}
        </div>
        {onSync && (
          <button
            onClick={onSync}
            disabled={isSyncing}
            className="px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {isSyncing ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Syncing...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Sync Now
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
