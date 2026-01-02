'use client';

import { Analysis } from '@/types';
import { analysisApi } from '@/lib/api';
import toast from 'react-hot-toast';

interface AnalysisResultProps {
  analysis: Analysis;
}

export function AnalysisResult({ analysis }: AnalysisResultProps) {
  const copyToClipboard = () => {
    const text = `PRIMARY REASON
${analysis.primaryReason}

WHY THIS HAPPENED
${analysis.supportingLogic.map((p) => `• ${p}`).join('\n')}

WHAT TO CHANGE
${analysis.singleFix}`;

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

  return (
    <div className="space-y-8">
      {/* Section 1: Primary Reason */}
      <div>
        <h3 className="text-sm font-medium text-gray-500 mb-2">
          Primary Reason
        </h3>
        <p className="text-xl font-semibold text-gray-900">
          {analysis.primaryReason}
        </p>
      </div>

      {/* Section 2: Why This Happened */}
      <div>
        <h3 className="text-sm font-medium text-gray-500 mb-3">
          Why This Happened
        </h3>
        <ul className="space-y-2">
          {analysis.supportingLogic.map((point, i) => (
            <li key={i} className="flex items-start gap-3 text-gray-700">
              <span className="text-gray-400">•</span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Section 3: What to Change */}
      <div className="bg-blue-50 border border-blue-100 rounded-md p-4">
        <h3 className="text-sm font-medium text-blue-800 mb-2">
          What to Change
        </h3>
        <p className="text-gray-900">
          {analysis.singleFix}
        </p>
      </div>

      {/* Export Actions */}
      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <button onClick={copyToClipboard} className="btn-secondary flex-1">
          Copy Text
        </button>
        <button onClick={downloadPdf} className="btn-secondary flex-1">
          Download PDF
        </button>
      </div>
    </div>
  );
}
