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
          prompt: `I just analyzed my ad and found: "${analysis.primaryReason}"

My current metrics:
- CTR: ${analysis.ctr}%
- CPM: ₹${analysis.cpm}
- CPA: ₹${analysis.cpa}
- Campaign Goal: ${analysis.objective}

I need 5 alternative headlines that will grab attention and increase my CTR. Make them specific to my situation - not generic templates. Keep them under 40 characters and focused on the value my audience gets.

Give me headlines I can test tomorrow.`
        },
        {
          id: 'visuals',
          label: 'Suggest 3 Visual Changes',
          icon: Palette,
          prompt: `My ad isn't getting enough attention. Here's what's happening:
- Problem: ${analysis.primaryReason}
- Current CTR: ${analysis.ctr}%

I need 3 specific visual changes I can make today. For each change, tell me:
1. Exactly what to change (background color, text size, image placement, etc.)
2. Specific values (like color codes: #FF6B35, or dimensions: 48px font)
3. Why it will help MY ad perform better

I'll implement these in Canva, so be specific and actionable.`
        },
        {
          id: 'copy',
          label: 'Write Complete Ad Copy',
          icon: FileText,
          prompt: `I need fresh ad copy that converts. Here's my situation:
- Current problem: ${analysis.primaryReason}
- Campaign goal: ${analysis.objective}
- Current CTR: ${analysis.ctr}%
- Target audience: Indian market

Write me complete ad copy with:
- Primary Text (2-3 engaging lines)
- Headline (punchy, under 40 characters)
- Description (value-focused)
- CTA (action-oriented)

Make it feel natural and conversational for Indian audience - not corporate or salesy.`
        }
      ];
    }
    
    if (problemType.includes('funnel') || problemType.includes('landing') || problemType.includes('form')) {
      return [
        {
          id: 'landing',
          label: 'Optimize Landing Page Copy',
          icon: FileText,
          prompt: `People are clicking my ad but not converting. Here's the issue:
- Problem: ${analysis.primaryReason}
- CTR: ${analysis.ctr}% (clicks are happening)
- CPA: ₹${analysis.cpa} (but conversions are expensive)
- Goal: ${analysis.objective}

I need landing page copy that matches my ad promise and gets conversions. Write:
- Main headline (must match what my ad promised)
- Subheadline (builds on the promise)
- 3 key benefits (why they should act now)
- CTA button text (action-oriented)

Make sure the messaging flows from ad → landing page seamlessly.`
        },
        {
          id: 'form',
          label: 'Simplify Form Fields',
          icon: CheckCircle2,
          prompt: `My landing page form is killing conversions. Here's my situation:
- Problem: ${analysis.primaryReason}
- Campaign goal: ${analysis.objective}

Tell me EXACTLY which form fields to keep and which to remove for ${analysis.objective} campaigns.

Format your answer like this:
**KEEP:** (list the essential fields only)
**REMOVE:** (list what's slowing me down)
**WHY:** (brief explanation)

Be specific - I need to implement this today.`
        }
      ];
    }
    
    if (problemType.includes('sales') || problemType.includes('follow') || problemType.includes('conversion')) {
      return [
        {
          id: 'script',
          label: 'Generate Follow-up Script',
          icon: FileText,
          prompt: `I'm getting leads but they're not converting into sales. Here's the situation:
- Problem: ${analysis.primaryReason}
- Campaign goal: ${analysis.objective}

I need follow-up messages for leads who haven't responded yet. Write me a sequence:
1. **First message** (within 15 minutes of lead coming in)
2. **Day 2 message** (if no response)
3. **Day 4 message** (value-add approach)
4. **Final message** (last attempt with urgency)

Make it conversational and natural for Indian audience - like I'm texting a friend, not a sales robot. Keep each message under 50 words.`
        },
        {
          id: 'response',
          label: 'Create Response Templates',
          icon: Wand2,
          prompt: `I need quick response templates for the most common questions I get from ${analysis.objective} leads.

Create 3 response templates for:
1. **Price inquiry** ("How much does it cost?")
2. **Timeline question** ("How long will it take?")
3. **"How it works"** question

Keep each under 50 words. Make them feel personal and helpful - not like copy-paste templates. Include pricing transparency (builds trust with Indian audience).`
        }
      ];
    }
    
    // Default/Delivery issues
    return [
      {
        id: 'budget',
        label: 'Calculate Budget Steps',
        icon: Zap,
        prompt: `I want to scale my budget but don't want to mess up what's working. Here are my current numbers:
- CTR: ${analysis.ctr}%
- CPM: ₹${analysis.cpm}
- CPA: ₹${analysis.cpa}

Help me calculate the right budget scaling plan:
1. Estimate my current daily budget (based on these metrics)
2. First increase step (20-30% bump)
3. Second increase step
4. When to make each change (timing matters)
5. Warning signs to watch for (so I know if something breaks)

Give me specific rupee amounts and a timeline I can follow.`
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
