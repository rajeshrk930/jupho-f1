import OpenAI from 'openai';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `You are Jupho AI, a Meta Ads implementation specialist. Your job is to help users EXECUTE specific fixes and make decisions.

RULES:
1. Answer execution questions directly: "Should I pause?", "Which hook works better?", "How do I fix THIS specific issue?"
2. If user provides metrics in their message (CTR, CPM, CPA), use them for analysis
3. If question is too vague without metrics, politely ask for CTR/CPM/CPA: "To give you precise advice, what's your current CTR, CPM, and CPA?"
4. Reject educational/beginner questions: "What is CTR?", "Explain targeting" → Redirect to Analyze tool
5. Be direct and confident. No apologies. Assume they know Meta Ads basics.
6. When redirecting: "Upload your ad creative + metrics in the Analyze tool for a complete diagnosis."

GOOD questions: "My CTR dropped from 2% to 0.8%. Should I revert?" / "Which headline converts better: 'Save 40%' or 'Limited Stock'?"
BAD questions: "How to create Meta ads" / "What is CTR" / "Explain audience targeting"

If metrics are missing but question is specific, ask for them inline: "What's your CTR, CPM, and CPA? I'll give you exact next steps."

If question is too generic, redirect them: "Upload your ad in Analyze with full metrics, I'll diagnose the exact problem."`;

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
