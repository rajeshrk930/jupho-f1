'use client';

import { Analysis } from '@/types';
import { AnalysisResult } from '@/components/AnalysisResult';
import { AnalysisLoadingSkeleton } from '@/components/AnalysisLoadingSkeleton';
import { X } from 'lucide-react';

interface AnalysisDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  result: Analysis | null;
}

export function AnalysisDrawer({ isOpen, onClose, isLoading, result }: AnalysisDrawerProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 animate-fadeIn"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-50 w-full md:w-[600px] bg-base-surface shadow-2xl animate-slideInRight overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-default bg-base-surface">
          <div>
            <p className="text-xs uppercase tracking-[0.08em] text-signal-primary font-semibold">Report</p>
            <h2 className="text-lg font-semibold text-text-primary">Analysis Result</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-base-elevated rounded-md transition-colors"
            aria-label="Close drawer"
          >
            <X size={20} className="text-text-secondary" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <AnalysisLoadingSkeleton />
          ) : result ? (
            <AnalysisResult analysis={result} />
          ) : null}
        </div>
      </div>
    </>
  );
}
