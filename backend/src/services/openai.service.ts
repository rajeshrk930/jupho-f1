import OpenAI from 'openai';
import { DecisionEngine } from './decisionEngine.service';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const decisionEngine = new DecisionEngine();

interface AnalysisInput {
  creativeUrl?: string;
  creativeType: 'IMAGE' | 'VIDEO';
  primaryText?: string;
  headline?: string;
  objective: 'LEADS' | 'WHATSAPP' | 'SALES';
  problemFaced: 'LOW_CLICKS' | 'CLICKS_NO_ACTION' | 'MESSAGES_NO_CONVERSION';
  whatChanged: 'CREATIVE_CHANGED' | 'AUDIENCE_CHANGED' | 'BUDGET_CHANGED' | 'NOTHING_NEW_AD';
  audienceType: 'BROAD' | 'INTEREST_BASED' | 'LOOKALIKE';
  cpm: number;
  ctr: number;
  cpa: number;
}

interface AnalysisResult {
  primaryReason: string;
  supportingLogic: string[];
  singleFix: string;
  resultType: 'DEAD' | 'AVERAGE' | 'WINNING';
  failureReason: string;
  decision?: any; // Include decision context for debugging
}

export async function analyzeCreative(input: AnalysisInput): Promise<AnalysisResult> {
  // Step 1: Run deterministic decision engine
  const decision = decisionEngine.decide({
    objective: input.objective,
    problemFaced: input.problemFaced,
    whatChanged: input.whatChanged,
    audienceType: input.audienceType,
    ctr: input.ctr,
    cpm: input.cpm,
    cpa: input.cpa,
  });

  // Step 2: Build context for GPT (GPT explains, doesn't decide)
  const prompt = `You are explaining backend analysis to a client. The system has already determined:

**Decision:**
- Status: ${decision.status}
- Primary Issue Layer: ${decision.primaryLayer}
- Root Cause: ${decision.rootCause}
${decision.audienceIssue ? `- Audience Issue: ${decision.audienceIssue}` : ''}

**Metrics vs Targets:**
- CTR: ${input.ctr}% (target: ${decision.thresholds.targetCTR}%) - ${decision.metrics.ctrStatus}
- CPM: ₹${input.cpm} (target: ₹${decision.thresholds.targetCPM}) - ${decision.metrics.cpmStatus}
- Cost per ${decision.successMetric}: ₹${input.cpa} (target: ₹${decision.thresholds.targetCPA}) - ${decision.metrics.cpaStatus}

**Context:**
- Objective: ${input.objective}
- Problem Faced: ${input.problemFaced}
- What Changed: ${input.whatChanged}
- Audience Type: ${input.audienceType}

${input.primaryText ? `**Ad Copy:**\nPrimary Text: ${input.primaryText}` : ''}
${input.headline ? `Headline: ${input.headline}` : ''}

Output ONLY valid JSON:
{
  "primaryReason": "One sentence explaining the main reason (focus on ${decision.primaryLayer})",
  "supportingLogic": ["Bullet 1 (metric evidence)", "Bullet 2 (context evidence)"],
  "singleFix": "One clear action based on ${decision.rootCause}",
  "failureReason": "${decision.status === 'BROKEN' ? 'Brief detail why it cannot be fixed easily' : 'none'}"
}`;

  const messages: any[] = [
    {
      role: 'system',
      content: 'You explain technical ad analysis decisions in clear client language. You do NOT decide, you explain what the system decided.',
    },
    {
      role: 'user',
      content: prompt,
    },
  ];

  // Add image if available (GPT-4 Vision)
  if (input.creativeUrl && input.creativeType === 'IMAGE') {
    messages[1].content = [
      { type: 'text', text: prompt },
      { type: 'image_url', image_url: { url: input.creativeUrl } },
    ];
  }

  const response = await openai.chat.completions.create({
    model: input.creativeUrl && input.creativeType === 'IMAGE' ? 'gpt-4o' : 'gpt-4',
    messages,
    temperature: 0.5, // Lower temperature for consistent explanations
    max_tokens: 400
  });

  const content = response.choices[0]?.message?.content;
  
  if (!content) {
    throw new Error('No response from AI');
  }

  try {
    const result = JSON.parse(content);
    
    // Validate required fields
    if (!result.primaryReason || !result.supportingLogic || !result.singleFix) {
      throw new Error('Invalid response structure');
    }

    // Map decision status to result type
    const resultTypeMapping = {
      BROKEN: 'DEAD',
      FIXABLE: 'AVERAGE',
      SCALE_READY: 'WINNING',
    } as const;

    return {
      primaryReason: result.primaryReason,
      supportingLogic: Array.isArray(result.supportingLogic) 
        ? result.supportingLogic.slice(0, 3) 
        : [result.supportingLogic],
      singleFix: result.singleFix,
      resultType: resultTypeMapping[decision.status],
      failureReason: result.failureReason || 'unclassified',
      decision, // Include decision context
    };
  } catch (parseError) {
    console.error('Failed to parse AI response:', content);
    throw new Error('Failed to parse AI analysis');
  }
}
