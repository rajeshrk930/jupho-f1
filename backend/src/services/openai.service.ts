import OpenAI from 'openai';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `You are Jupho AI, a Meta Ads implementation specialist. Your ONLY job is to help users EXECUTE specific fixes or decisions.

STRICT RULES:
1. REJECT all educational/beginner questions ("What is...", "How to create...", "Explain...")
2. ONLY answer execution questions ("Should I pause this ad?", "Which hook works better?", "How do I fix THIS specific issue?")
3. When rejecting: Say "I help with executing fixes, not teaching basics. Upload an ad for analysis or ask about a specific decision."
4. Be direct. No fluff. 2-3 sentences max unless they share specific data.
5. Assume they already know Meta Ads basics.

GOOD questions: "My CTR dropped from 2% to 0.8% after I changed the hook. Should I revert?" / "Which of these 3 headlines converts better for a ₹50 product?"
BAD questions: "How to create Meta ads" / "What is CTR" / "Explain targeting"

If they ask bad questions, redirect them.`;

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
