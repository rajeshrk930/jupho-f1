import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface AnalysisInput {
  creativeType: 'IMAGE' | 'VIDEO';
  primaryText?: string;
  headline?: string;
  objective: string;
  industry: string;
  cpm?: number;
  ctr?: number;
  cpc?: number;
  cpa?: number;
}

interface AnalysisResult {
  primaryReason: string;
  supportingLogic: string[];
  singleFix: string;
  resultType: 'DEAD' | 'AVERAGE' | 'WINNING';
  failureReason: string;
}

export async function analyzeCreative(input: AnalysisInput): Promise<AnalysisResult> {
  const prompt = `You are an expert Meta Ads creative analyst. Analyze this ad creative and provide actionable insights.

Creative Details:
- Type: ${input.creativeType}
- Primary Text: ${input.primaryText || 'Not provided'}
- Headline: ${input.headline || 'Not provided'}
- Objective: ${input.objective}
- Industry: ${input.industry}

Performance Metrics:
- CPM: ${input.cpm ? `$${input.cpm}` : 'Not provided'}
- CTR: ${input.ctr ? `${input.ctr}%` : 'Not provided'}
- CPC: ${input.cpc ? `$${input.cpc}` : 'Not provided'}
- CPA: ${input.cpa ? `$${input.cpa}` : 'Not provided'}

Based on these details and metrics, provide your analysis in EXACTLY this JSON format:
{
  "primaryReason": "One clear sentence explaining the main reason for success or failure",
  "supportingLogic": ["Point 1", "Point 2", "Point 3"],
  "singleFix": "One specific, actionable recommendation",
  "resultType": "DEAD or AVERAGE or WINNING",
  "failureReason": "A short tag categorizing the issue (e.g., 'weak_hook', 'unclear_cta', 'wrong_audience', 'strong_emotion')"
}

Rules:
1. Primary Reason: MUST be one sentence only. No scores, no percentages.
2. Supporting Logic: Maximum 3 bullet points. Be specific, not vague.
3. Single Fix: Only ONE recommendation. No multiple options.
4. Result Type: 
   - DEAD = Very poor performance, needs major overhaul
   - AVERAGE = Mediocre results, has potential
   - WINNING = Strong performer
5. Be direct and actionable. Users are experienced advertisers.

Respond ONLY with valid JSON.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: 'You are a Meta Ads creative analysis expert. Always respond with valid JSON only.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.7,
    max_tokens: 500
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

    return {
      primaryReason: result.primaryReason,
      supportingLogic: Array.isArray(result.supportingLogic) 
        ? result.supportingLogic.slice(0, 3) 
        : [result.supportingLogic],
      singleFix: result.singleFix,
      resultType: ['DEAD', 'AVERAGE', 'WINNING'].includes(result.resultType) 
        ? result.resultType 
        : 'AVERAGE',
      failureReason: result.failureReason || 'unclassified'
    };
  } catch (parseError) {
    console.error('Failed to parse AI response:', content);
    throw new Error('Failed to parse AI analysis');
  }
}
