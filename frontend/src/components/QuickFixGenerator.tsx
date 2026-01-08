'use client';

import { useState } from 'react';
import { Zap, Wand2, FileText, Palette, CheckCircle2, Loader2, Save } from 'lucide-react';
import { Analysis } from '@/types';
import { chatApi, templateApi } from '@/lib/api';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface QuickFixGeneratorProps {
  analysis: Analysis;
}

interface GeneratorButton {
  id: string;
  label: string;
  icon: any;
  prompt: string;
}

export function QuickFixGenerator({ analysis }: QuickFixGeneratorProps) {
  const [activeGenerator, setActiveGenerator] = useState<string | null>(null);
  const [generatedContent, setGeneratedContent] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Map problem types to generator buttons
  const getGenerators = (): GeneratorButton[] => {
    const problemType = analysis.primaryReason.toLowerCase();
    
    if (problemType.includes('creative') || problemType.includes('visual') || problemType.includes('hook')) {
      return [
        {
          id: 'headlines',
          label: 'Generate 5 High-CTR Headlines',
          icon: Zap,
          prompt: `Based on this ad analysis:
Problem: ${analysis.primaryReason}
Current CTR: ${analysis.ctr}%
Objective: ${analysis.objective}

Generate 5 alternative headlines that will increase CTR. Make them:
- Attention-grabbing and specific
- Value-focused (what user gets)
- Under 40 characters
- No generic phrases

Format as numbered list.`
        },
        {
          id: 'visuals',
          label: 'Suggest 3 Visual Changes',
          icon: Palette,
          prompt: `Based on this ad analysis:
Problem: ${analysis.primaryReason}
Current CTR: ${analysis.ctr}%

Suggest 3 specific visual changes to improve CTR. For each change, specify:
- What to change (background, text size, image, etc.)
- Exact color codes or dimensions
- Why it will help

Be specific and actionable.`
        },
        {
          id: 'copy',
          label: 'Write Complete Ad Copy',
          icon: FileText,
          prompt: `Based on this ad analysis:
Problem: ${analysis.primaryReason}
Objective: ${analysis.objective}
Current CTR: ${analysis.ctr}%

Write complete ad copy with:
- Primary Text (2-3 lines)
- Headline (under 40 chars)
- Description
- CTA

Make it conversion-focused for Indian audience.`
        }
      ];
    }
    
    if (problemType.includes('funnel') || problemType.includes('landing') || problemType.includes('form')) {
      return [
        {
          id: 'landing',
          label: 'Optimize Landing Page Copy',
          icon: FileText,
          prompt: `Based on this ad analysis:
Problem: ${analysis.primaryReason}
CTR: ${analysis.ctr}%, CPA: ₹${analysis.cpa}

Write optimized landing page copy:
- Headline (matches ad promise)
- Subheadline
- 3 key benefits
- CTA button text

Make it match the ad exactly.`
        },
        {
          id: 'form',
          label: 'Simplify Form Fields',
          icon: CheckCircle2,
          prompt: `Based on this ad analysis:
Problem: ${analysis.primaryReason}
Objective: ${analysis.objective}

List exactly which form fields to keep and which to remove for ${analysis.objective}.
Format:
KEEP: (list)
REMOVE: (list)
WHY: (brief reason)`
        }
      ];
    }
    
    if (problemType.includes('sales') || problemType.includes('follow') || problemType.includes('conversion')) {
      return [
        {
          id: 'script',
          label: 'Generate Follow-up Script',
          icon: FileText,
          prompt: `Based on this ad analysis:
Problem: ${analysis.primaryReason}
Objective: ${analysis.objective}

Write a follow-up message script for leads who haven't converted:
- First message (within 15 min)
- Day 2 message
- Day 4 message
- Final message

Make it conversational for Indian audience.`
        },
        {
          id: 'response',
          label: 'Create Response Templates',
          icon: Wand2,
          prompt: `Based on this objective: ${analysis.objective}

Create 3 quick response templates for common questions:
1. Price inquiry
2. Timeline question
3. "How it works" question

Keep under 50 words each. Indian context.`
        }
      ];
    }
    
    // Default/Delivery issues
    return [
      {
        id: 'budget',
        label: 'Calculate Budget Steps',
        icon: Zap,
        prompt: `Current metrics:
CTR: ${analysis.ctr}%
CPM: ₹${analysis.cpm}
CPA: ₹${analysis.cpa}

Calculate ideal budget scaling steps:
- Current daily budget estimate
- Step 1 increase (20-30%)
- Step 2 increase
- When to scale
- Warning signs to watch

Be specific with numbers.`
      }
    ];
  };

  const generators = getGenerators();

  const handleSave = async () => {
    if (!activeGenerator || !generatedContent[activeGenerator]) return;

    setIsSaving(true);
    try {
      const generator = generators.find(g => g.id === activeGenerator);
      if (!generator) return;

      // Determine category based on generator type
      let category: 'COPY' | 'SCRIPT' | 'REPORT' = 'COPY';
      if (activeGenerator === 'scripts' || activeGenerator === 'templates' || activeGenerator === 'landing') {
        category = 'SCRIPT';
      } else if (activeGenerator === 'budget') {
        category = 'REPORT';
      }

      // Auto-generate title
      const date = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const title = `${generator.label} - ${analysis.objective} - ${date}`;

      await templateApi.create({
        category,
        title,
        content: generatedContent[activeGenerator],
        tags: [analysis.objective, analysis.problemFaced],
        analysisId: analysis.id,
      });

      toast.success('Saved to your template library!');
    } catch (error) {
      toast.error('Failed to save template');
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerate = async (generator: GeneratorButton) => {
    // If already generated, just show it
    if (generatedContent[generator.id]) {
      setActiveGenerator(generator.id);
      return;
    }

    setIsGenerating(true);
    setActiveGenerator(generator.id);

    try {
      const response = await chatApi.sendMessage(
        generator.prompt,
        undefined,
        analysis.id
      );

      if (response.success && response.data) {
        const content = Array.isArray(response.data.messages) 
          ? response.data.messages.find((m: any) => m.role === 'assistant')?.content || ''
          : response.data.reply || '';
        
        setGeneratedContent(prev => ({
          ...prev,
          [generator.id]: content
        }));
      }
    } catch (error: any) {
      if (error.response?.status === 429) {
        toast.error('Daily limit reached. Upgrade to Pro for unlimited generations.');
      } else {
        toast.error('Failed to generate. Please try again.');
      }
      setActiveGenerator(null);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="mt-6 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Wand2 className="w-5 h-5 text-purple-600" />
        <h3 className="text-lg font-bold text-gray-900">Quick Fix Generator</h3>
        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded font-medium">One-click solutions</span>
      </div>

      {/* Generator Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {generators.map((gen) => {
          const Icon = gen.icon;
          const isActive = activeGenerator === gen.id;
          const hasContent = !!generatedContent[gen.id];
          
          return (
            <button
              key={gen.id}
              onClick={() => handleGenerate(gen)}
              disabled={isGenerating && activeGenerator !== gen.id}
              className={`relative p-4 rounded-lg border-2 transition-all text-left group ${
                isActive
                  ? 'border-purple-500 bg-purple-50'
                  : hasContent
                  ? 'border-green-500 bg-green-50 hover:border-green-600'
                  : 'border-gray-200 bg-white hover:border-purple-400 hover:bg-purple-50'
              } ${isGenerating && activeGenerator !== gen.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  isActive ? 'bg-purple-600' : hasContent ? 'bg-green-600' : 'bg-gray-100 group-hover:bg-purple-600'
                }`}>
                  {isGenerating && isActive ? (
                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                  ) : hasContent ? (
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  ) : (
                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-white'}`} />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 text-sm">{gen.label}</p>
                  {hasContent && !isActive && (
                    <p className="text-xs text-green-700 mt-1">✓ Generated • Click to view</p>
                  )}
                  {isActive && isGenerating && (
                    <p className="text-xs text-purple-700 mt-1">Generating...</p>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Generated Content Display */}
      {activeGenerator && generatedContent[activeGenerator] && !isGenerating && (
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-300 rounded-lg p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-gray-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              Generated Solution
            </h4>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-1.5 text-xs text-teal-700 hover:text-teal-900 font-medium px-3 py-1.5 rounded-lg bg-white/50 hover:bg-white transition-colors disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    Save to Library
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generatedContent[activeGenerator]);
                  toast.success('Copied to clipboard!');
                }}
                className="text-xs text-purple-700 hover:text-purple-900 font-medium px-3 py-1.5 rounded-lg bg-white/50 hover:bg-white transition-colors"
              >
                Copy
              </button>
            </div>
          </div>
          <div className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-800 prose-strong:font-bold prose-li:text-gray-800 bg-white/70 rounded-lg p-4">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {generatedContent[activeGenerator]}
            </ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}
