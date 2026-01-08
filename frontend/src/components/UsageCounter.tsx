'use client';

import { Zap, MessageSquare } from 'lucide-react';

interface UsageCounterProps {
  isPro: boolean;
  usageCount: number;
  limit: number;
  onUpgradeClick: () => void;
  compact?: boolean;
}

export default function UsageCounter({ isPro, usageCount, limit, onUpgradeClick, compact = false }: UsageCounterProps) {
  const percentage = Math.min((usageCount / limit) * 100, 100);
  const isNearLimit = usageCount >= limit * 0.8;

  if (compact) {
    if (isPro) {
      return (
        <div className="flex items-center gap-2 bg-teal-600 px-3 py-1.5 rounded-full">
          <Zap className="w-3.5 h-3.5 text-white" />
          <span className="text-white text-xs font-semibold">Pro</span>
        </div>
      );
    }
    return (
      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${isNearLimit ? 'bg-orange-100' : 'bg-gray-100'}`}>
        <MessageSquare className={`w-3.5 h-3.5 ${isNearLimit ? 'text-orange-600' : 'text-gray-600'}`} />
        <span className={`text-xs font-semibold ${isNearLimit ? 'text-orange-700' : 'text-gray-700'}`}>
          {usageCount}/{limit}
        </span>
      </div>
    );
  }

  if (isPro) {
    return (
      <div className="bg-gradient-to-r from-teal-500 to-purple-600 rounded-lg p-4 flex items-center justify-between">
        <div className="flex items-center">
          <Zap className="w-5 h-5 text-white mr-2" />
          <div>
            <p className="text-white font-semibold text-sm">Jupho Pro</p>
            <p className="text-teal-100 text-xs">Unlimited analyses</p>
          </div>
        </div>
        <div className="bg-white/20 px-3 py-1 rounded-full">
          <span className="text-white text-sm font-medium">∞</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-lg p-4 border-2 ${isNearLimit ? 'border-orange-300 bg-orange-50' : 'border-gray-200 bg-white'}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <MessageSquare className={`w-4 h-4 mr-2 ${isNearLimit ? 'text-orange-600' : 'text-gray-600'}`} />
          <p className={`text-sm font-medium ${isNearLimit ? 'text-orange-900' : 'text-gray-700'}`}>
            Analyses Today
          </p>
        </div>
        <span className={`text-sm font-bold ${isNearLimit ? 'text-orange-600' : 'text-gray-900'}`}>
          {usageCount}/{limit}
        </span>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
        <div
          className={`h-2 rounded-full transition-all ${
            isNearLimit
              ? 'bg-gradient-to-r from-orange-500 to-red-500'
              : 'bg-gradient-to-r from-teal-500 to-purple-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {usageCount >= limit ? (
        <button
          onClick={onUpgradeClick}
          className="w-full bg-gradient-to-r from-teal-600 to-purple-600 text-white py-2 rounded-lg text-sm font-semibold hover:from-teal-700 hover:to-purple-700 transition-all"
        >
          Upgrade to Pro
        </button>
      ) : isNearLimit ? (
        <button
          onClick={onUpgradeClick}
          className="w-full border border-teal-600 text-teal-600 py-2 rounded-lg text-sm font-semibold hover:bg-teal-50 transition-all"
        >
          Get Unlimited
        </button>
      ) : (
        <p className="text-xs text-gray-500 text-center">
          Resets daily at midnight
        </p>
      )}
    </div>
  );
}
