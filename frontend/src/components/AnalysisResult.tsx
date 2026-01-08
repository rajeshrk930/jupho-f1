'use client';

import { Analysis } from '@/types';
import { analysisApi, trackingApi } from '@/lib/api';
import { Target, Lightbulb, Zap, Copy, Download, CheckCircle2, TrendingUp, TrendingDown, Minus, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { QuickFixGenerator } from './QuickFixGenerator';
import { FeedbackButtons } from './FeedbackButtons';

interface AnalysisResultProps {
  analysis: Analysis;
}

export function AnalysisResult({ analysis }: AnalysisResultProps) {
  
  // Normalize supportingLogic because API sometimes returns a JSON string
  const supportingPoints = Array.isArray(analysis.supportingLogic)
    ? analysis.supportingLogic
    : (() => {
        try {
          const parsed = JSON.parse(analysis.supportingLogic || '[]');
          return Array.isArray(parsed) ? parsed : [analysis.supportingLogic].filter(Boolean);
        } catch {
          return [analysis.supportingLogic].filter(Boolean);
        }
      })();

  const copyToClipboard = () => {
    let text = `PRIMARY REASON
${analysis.primaryReason}

WHY THIS HAPPENED
${supportingPoints.map((p) => `• ${p}`).join('\n')}

WHAT TO CHANGE
${analysis.singleFix}`;

    if (analysis.additionalNotes) {
      text += `\n\n${'='.repeat(50)}\nCREATIVE DIRECTOR'S BRIEF\n${'='.repeat(50)}\n\n${analysis.additionalNotes}`;
    }

    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
    
    // Track copy action for AI training data
    trackingApi.trackAction(analysis.id, 'copiedText');
  };

  const downloadPdf = async () => {
    try {
      const blob = await analysisApi.exportPdf(analysis.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analysis-${analysis.id}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('PDF downloaded');
      
      // Track PDF download for AI training data
      trackingApi.trackAction(analysis.id, 'downloadedPDF');
    } catch {
      toast.error('Failed to download PDF');
    }
  };

  // Determine result type styling
  const resultTypeConfig = {
    WINNING: { color: 'text-text-primary', bg: 'bg-base-elevated', border: 'border-border-default', icon: TrendingUp },
    AVERAGE: { color: 'text-text-secondary', bg: 'bg-base-surface', border: 'border-border-default', icon: Minus },
    DEAD: { color: 'text-signal-danger', bg: 'bg-signal-danger/10', border: 'border-signal-danger/20', icon: TrendingDown },
  };
  const typeConfig = resultTypeConfig[analysis.resultType] || resultTypeConfig.AVERAGE;
  const TypeIcon = typeConfig.icon;

  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
        <div className="bg-base-surface border border-border-default rounded-md p-2 sm:p-3">
          <p className="text-xs font-medium text-text-secondary mb-1">CTR</p>
          <p className="text-lg sm:text-xl font-bold text-text-primary">{analysis.ctr}%</p>
        </div>
        <div className="bg-base-surface border border-border-default rounded-md p-2 sm:p-3">
          <p className="text-xs font-medium text-text-secondary mb-1">CPM</p>
          <p className="text-lg sm:text-xl font-bold text-text-primary">₹{analysis.cpm}</p>
        </div>
        <div className="bg-base-surface border border-border-default rounded-md p-2 sm:p-3">
          <p className="text-xs font-medium text-text-secondary mb-1">CPA</p>
          <p className="text-lg sm:text-xl font-bold text-text-primary">₹{analysis.cpa}</p>
        </div>
      </div>

      {/* Status Badge */}
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-sm ${typeConfig.bg} ${typeConfig.border} border`}>
        <TypeIcon size={16} className={typeConfig.color} />
        <span className={`text-sm font-medium ${typeConfig.color}`}>
          {analysis.resultType === 'WINNING' ? 'Winning Creative' : analysis.resultType === 'DEAD' ? 'Needs Work' : 'Average Performance'}
        </span>
      </div>

      {/* Section 1: Primary Reason */}
      <div className="relative pl-6 border-l-4 border-signal-primary">
        <div className="absolute -left-3 top-0 w-6 h-6 rounded-sm bg-signal-primary flex items-center justify-center">
          <Target size={14} className="text-white" />
        </div>
        <div className="inline-flex items-center gap-2 mb-3">
          <span className="px-2.5 py-1 rounded-sm bg-signal-primary/10 text-signal-primary text-xs font-medium">
            Primary Reason
          </span>
        </div>
        <p className="text-xl sm:text-2xl font-semibold text-text-primary leading-tight">
          {analysis.primaryReason}
        </p>
      </div>

      {/* Section 2: Why This Happened */}
      <div className="relative pl-6 border-l-4 border-border-default">
        <div className="absolute -left-3 top-0 w-6 h-6 rounded-sm bg-base-elevated flex items-center justify-center">
          <Lightbulb size={14} className="text-text-secondary" />
        </div>
        <div className="inline-flex items-center gap-2 mb-4">
          <span className="px-2.5 py-1 rounded-sm bg-base-elevated text-text-secondary text-xs font-medium">
            Why This Happened
          </span>
        </div>
        <div className="space-y-3">
          {supportingPoints.map((point, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-sm bg-base-elevated hover:bg-base-elevated/80 transition-colors">
              <div className="mt-0.5">
                <CheckCircle2 size={18} className="text-text-secondary" />
              </div>
              <p className="text-text-primary text-[15px] leading-relaxed">{point}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Section 3: What to Change */}
      <div className="relative pl-6 border-l-4 border-signal-primary">
        <div className="absolute -left-3 top-0 w-6 h-6 rounded-sm bg-signal-primary flex items-center justify-center">
          <Zap size={14} className="text-white" />
        </div>
        <div className="bg-signal-primary/10 border border-signal-primary/20 rounded-md p-5">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="px-2.5 py-1 rounded-sm bg-signal-primary text-white text-xs font-medium">
              Action Required
            </span>
          </div>
          <p className="text-text-primary text-base leading-relaxed font-medium">
            {analysis.singleFix}
          </p>
        </div>
      </div>

      {/* Creative Brief Section - Only show if available */}
      {analysis.additionalNotes && (
        <div className="relative pl-6 border-l-4 border-border-default">
          <div className="absolute -left-3 top-0 w-6 h-6 rounded-sm bg-base-elevated flex items-center justify-center">
            <Sparkles size={14} className="text-text-secondary" />
          </div>
          <div className="bg-base-elevated border border-border-default rounded-md p-6">
            <div className="inline-flex items-center gap-2 mb-4">
              <span className="px-3 py-1.5 rounded-sm bg-base-surface text-text-primary text-xs font-bold">
                🎨 CREATIVE DIRECTOR'S BRIEF
              </span>
            </div>
            <div className="prose prose-sm max-w-none">
              <pre className="whitespace-pre-wrap font-sans text-text-primary text-[15px] leading-relaxed bg-base-surface p-4 rounded-sm border border-border-default overflow-x-auto">
                {analysis.additionalNotes}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Quick Fix Generator - One-click solutions */}
      <QuickFixGenerator analysis={analysis} />

      {/* Feedback Buttons - Track if fix worked */}
      <FeedbackButtons analysisId={analysis.id} />

      {/* Secondary Actions - Below chat */}
      <div className="flex gap-3 mt-4">
        <button 
          onClick={copyToClipboard} 
          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md border border-border-default bg-base-surface hover:bg-base-elevated text-text-secondary font-medium transition-colors text-sm"
        >
          <Copy size={16} />
          Copy Text
        </button>
        <button 
          onClick={downloadPdf} 
          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-signal-primary hover:bg-signal-primary/90 text-white font-medium transition-colors text-sm"
        >
          <Download size={16} />
          Client Report (PDF)
        </button>
      </div>
    </div>
  );
}
