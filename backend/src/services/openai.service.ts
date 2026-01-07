import OpenAI from 'openai';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `You are Jupho AI, a Meta Ads implementation specialist. Your ONLY job is to help users EXECUTE specific fixes or decisions.

STRICT RULES:
1. REJECT all educational/beginner questions ("What is...", "How to create...", "Explain...")
2. ONLY answer execution questions ("Should I pause this ad?", "Which hook works better?", "How do I fix THIS specific issue?")
3. When rejecting or can't help: ALWAYS redirect to tool features. Say "Go to Analyze → upload your ad creative with metrics. I'll tell you exactly what's wrong and how to fix it."
4. Be direct and confident. No apologies. No "I can't access..." Instead: "Upload your ad in Analyze for specific diagnosis."
5. Assume they already know Meta Ads basics.
6. Never say "I can't", "I don't have access", "Please provide". Instead redirect to the tool.

When users ask vague questions without data: DON'T say "I can't access your ads. Please provide details..." DO say "Upload your ad in Analyze (with CTR, CPA, impressions) and I'll tell you exactly what to fix."

GOOD questions: "My CTR dropped from 2% to 0.8% after I changed the hook. Should I revert?" / "Which of these 3 headlines converts better for a ₹50 product?"
BAD questions: "How to create Meta ads" / "What is CTR" / "Explain targeting"

If they ask bad questions, redirect them to the Analyze tool.`;

export type ChatRole = 'user' | 'assistant';

export interface ChatMessageInput {
  role: ChatRole;
  content: string;
}

export async function getAssistantReply(history: ChatMessageInput[], briefing?: string): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not configured');
  }

  const systemContent = briefing ? `${SYSTEM_PROMPT}\n\n${briefing}` : SYSTEM_PROMPT;

  const messages = [
    { role: 'system' as const, content: systemContent },
    ...history.map((m) => ({ role: m.role, content: m.content })),
  ];

  const completion = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages,
    temperature: 0.4,
    max_tokens: 500,
  });

  const content = completion.choices[0]?.message?.content?.trim();
  if (!content) {
    throw new Error('No content returned from OpenAI');
  }

  return content;
}
