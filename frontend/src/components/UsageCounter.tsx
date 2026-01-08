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
        <div className="flex items-center gap-2 bg-signal-primary/10 text-signal-primary border border-signal-primary/20 px-3 py-1.5 rounded-sm">
          <Zap className="w-3.5 h-3.5" />
          <span className="text-xs font-semibold">Pro</span>
        </div>
      );
    }
    return (
      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm ${isNearLimit ? 'bg-signal-warning/10 text-signal-warning' : 'bg-base-elevated text-text-secondary'}`}>
        <MessageSquare className="w-3.5 h-3.5" />
        <span className="text-xs font-semibold">
          {usageCount}/{limit}
        </span>
      </div>
    );
  }

  if (isPro) {
    return (
      <div className="bg-signal-primary/10 border border-signal-primary/20 rounded-md p-4 flex items-center justify-between">
        <div className="flex items-center">
          <Zap className="w-5 h-5 text-signal-primary mr-2" />
          <div>
            <p className="text-signal-primary font-semibold text-sm">Jupho Pro</p>
            <p className="text-text-secondary text-xs">Unlimited analyses</p>
          </div>
        </div>
        <div className="bg-base-elevated px-3 py-1 rounded-sm">
          <span className="text-signal-primary text-sm font-medium">∞</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-md p-4 border ${isNearLimit ? 'border-signal-warning/20 bg-signal-warning/10' : 'border-border-default bg-base-surface'}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <MessageSquare className={`w-4 h-4 mr-2 ${isNearLimit ? 'text-signal-warning' : 'text-text-secondary'}`} />
          <p className={`text-sm font-medium ${isNearLimit ? 'text-signal-warning' : 'text-text-secondary'}`}>
            Analyses Today
          </p>
        </div>
        <span className={`text-sm font-bold ${isNearLimit ? 'text-signal-warning' : 'text-text-primary'}`}>
          {usageCount}/{limit}
        </span>
      </div>

      <div className="w-full bg-base-elevated rounded-sm h-2 mb-3">
        <div
          className={`h-2 rounded-sm transition-all ${
            isNearLimit
              ? 'bg-signal-warning'
              : 'bg-signal-primary'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {usageCount >= limit ? (
        <button
          onClick={onUpgradeClick}
          className="w-full bg-signal-primary text-white py-2 rounded-sm text-sm font-semibold hover:bg-signal-primary/90 transition-all"
        >
          Upgrade to Pro
        </button>
      ) : isNearLimit ? (
        <button
          onClick={onUpgradeClick}
          className="w-full border border-signal-primary text-signal-primary py-2 rounded-sm text-sm font-semibold hover:bg-signal-primary/10 transition-all"
        >
          Get Unlimited
        </button>
      ) : (
        <p className="text-xs text-text-secondary text-center">
          Resets daily at midnight
        </p>
      )}
    </div>
  );
}
