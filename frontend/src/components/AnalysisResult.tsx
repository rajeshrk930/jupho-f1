'use client';

import { Analysis } from '@/types';
import { analysisApi } from '@/lib/api';
import { Target, Lightbulb, Zap, Copy, Download, CheckCircle2, TrendingUp, TrendingDown, Minus, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface AnalysisResultProps {
  analysis: Analysis;
}

export function AnalysisResult({ analysis }: AnalysisResultProps) {
  const router = useRouter();
  
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
    } catch {
      toast.error('Failed to download PDF');
    }
  };

  const askAI = () => {
    router.push(`/assistant?analysisId=${analysis.id}`);
  };

  // Determine result type styling
  const resultTypeConfig = {
    WINNING: { color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200', icon: TrendingUp },
    AVERAGE: { color: 'text-yellow-700', bg: 'bg-yellow-50', border: 'border-yellow-200', icon: Minus },
    DEAD: { color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200', icon: TrendingDown },
  };
  const typeConfig = resultTypeConfig[analysis.resultType] || resultTypeConfig.AVERAGE;
  const TypeIcon = typeConfig.icon;

  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <div className="bg-white border border-gray-200 rounded-lg p-2 sm:p-3 shadow-sm">
          <p className="text-xs font-medium text-gray-600 mb-1">CTR</p>
          <p className="text-lg sm:text-xl font-bold text-gray-900">{analysis.ctr}%</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-2 sm:p-3 shadow-sm">
          <p className="text-xs font-medium text-gray-600 mb-1">CPM</p>
          <p className="text-lg sm:text-xl font-bold text-gray-900">₹{analysis.cpm}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-2 sm:p-3 shadow-sm">
          <p className="text-xs font-medium text-gray-600 mb-1">CPA</p>
          <p className="text-lg sm:text-xl font-bold text-gray-900">₹{analysis.cpa}</p>
        </div>
      </div>

      {/* Status Badge */}
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded ${typeConfig.bg} ${typeConfig.border} border`}>
        <TypeIcon size={16} className={typeConfig.color} />
        <span className={`text-sm font-medium ${typeConfig.color}`}>
          {analysis.resultType === 'WINNING' ? 'Winning Creative' : analysis.resultType === 'DEAD' ? 'Needs Work' : 'Average Performance'}
        </span>
      </div>

      {/* Section 1: Primary Reason */}
      <div className="relative pl-6 border-l-4 border-teal-500">
        <div className="absolute -left-3 top-0 w-6 h-6 rounded-full bg-teal-500 flex items-center justify-center">
          <Target size={14} className="text-white" />
        </div>
        <div className="inline-flex items-center gap-2 mb-3">
          <span className="px-2.5 py-1 rounded bg-teal-100 text-teal-700 text-xs font-medium">
            Primary Reason
          </span>
        </div>
        <p className="text-xl sm:text-2xl font-semibold text-gray-900 leading-tight">
          {analysis.primaryReason}
        </p>
      </div>

      {/* Section 2: Why This Happened */}
      <div className="relative pl-6 border-l-4 border-indigo-400">
        <div className="absolute -left-3 top-0 w-6 h-6 rounded-full bg-indigo-400 flex items-center justify-center">
          <Lightbulb size={14} className="text-white" />
        </div>
        <div className="inline-flex items-center gap-2 mb-4">
          <span className="px-2.5 py-1 rounded bg-indigo-100 text-indigo-700 text-xs font-medium">
            Why This Happened
          </span>
        </div>
        <div className="space-y-3">
          {supportingPoints.map((point, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="mt-0.5">
                <CheckCircle2 size={18} className="text-indigo-500" />
              </div>
              <p className="text-gray-800 text-[15px] leading-relaxed">{point}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Section 3: What to Change */}
      <div className="relative pl-6 border-l-4 border-teal-500">
        <div className="absolute -left-3 top-0 w-6 h-6 rounded-full bg-teal-600 flex items-center justify-center">
          <Zap size={14} className="text-white" />
        </div>
        <div className="bg-teal-50 border border-teal-200 rounded-lg p-5 shadow-sm">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="px-2.5 py-1 rounded bg-teal-600 text-white text-xs font-medium">
              Action Required
            </span>
          </div>
          <p className="text-gray-900 text-base leading-relaxed font-medium">
            {analysis.singleFix}
          </p>
        </div>
      </div>

      {/* Creative Brief Section - Only show if available */}
      {analysis.additionalNotes && (
        <div className="relative pl-6 border-l-4 border-purple-500">
          <div className="absolute -left-3 top-0 w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center">
            <Sparkles size={14} className="text-white" />
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6 shadow-sm">
            <div className="inline-flex items-center gap-2 mb-4">
              <span className="px-3 py-1.5 rounded bg-purple-600 text-white text-xs font-bold">
                🎨 CREATIVE DIRECTOR'S BRIEF
              </span>
            </div>
            <div className="prose prose-sm max-w-none">
              <pre className="whitespace-pre-wrap font-sans text-gray-800 text-[15px] leading-relaxed bg-white/50 p-4 rounded-lg border border-purple-100">
                {analysis.additionalNotes}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Export Actions */}
      <div className="flex flex-col gap-3 pt-6 border-t border-gray-200">
        {/* Ask AI Button - Full Width */}
        <button 
          onClick={askAI} 
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-medium transition-colors shadow-sm text-sm sm:text-base"
        >
          <Sparkles size={18} />
          Ask AI About This Analysis
        </button>
        
        {/* Copy and Download - Side by Side */}
        <div className="flex gap-3">
          <button 
            onClick={copyToClipboard} 
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium transition-colors shadow-sm text-sm sm:text-base"
          >
            <Copy size={16} />
            Copy
          </button>
          <button 
            onClick={downloadPdf} 
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-medium transition-colors shadow-sm text-sm sm:text-base"
          >
            <Download size={16} />
            PDF
          </button>
        </div>
      </div>
    </div>
  );
}
