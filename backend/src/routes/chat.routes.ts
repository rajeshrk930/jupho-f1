import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
import { getAssistantReply } from '../services/openai.service';

const router = Router();
const DAILY_FREE_LIMIT = 10;

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

const buildTitle = (message: string) => message.slice(0, 80);

const buildAnalysisTitle = (diagnosis: string) => {
  // Format diagnosis into a user-friendly title
  // e.g., "Your creative lacks visual hook" stays as-is
  const title = diagnosis.trim();
  return title.length > 80 ? title.slice(0, 77) + '...' : title;
};

router.post(
  '/',
  authenticate,
  [
    body('message').isString().isLength({ min: 1 }),
    body('conversationId').optional().isString(),
    body('analysisId').optional().isString(),
  ],
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const baseUser = req.user!;
    const user = await prisma.user.findUnique({ where: { id: baseUser.id }, select: { id: true, email: true, plan: true } });

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    const { message, conversationId, analysisId } = req.body as {
      message: string;
      conversationId?: string;
      analysisId?: string;
    };

    // Fetch analysis context if provided (only on first message of new conversation)
    let briefing: string | undefined;
    let analysisTitle: string | undefined;
    if (analysisId && !conversationId) {
      const analysis = await prisma.analysis.findFirst({
        where: { id: analysisId, userId: user.id },
        select: {
          primaryReason: true,
          resultType: true,
          ctr: true,
          cpm: true,
          cpa: true,
          objective: true,
          singleFix: true,
        },
      });

      if (analysis) {
        const statusMap: Record<string, string> = {
          WINNING: 'Winning Performance',
          AVERAGE: 'Average Performance',
          DEAD: 'Poor Performance',
        };
        briefing = `CURRENT CONTEXT: The user just analyzed their ad creative. Results show ${statusMap[analysis.resultType] || 'Unknown'} with the diagnosis: "${analysis.primaryReason}". Metrics: CTR ${analysis.ctr}%, CPM ₹${analysis.cpm}, CPA ₹${analysis.cpa}. Campaign Goal: ${analysis.objective}. Recommended Fix: "${analysis.singleFix}". They need actionable advice to improve these metrics. Start your response by acknowledging their situation and offer immediate next steps.`;
        analysisTitle = buildAnalysisTitle(analysis.primaryReason);
      }
    }

    // Rate limit for FREE users: max 10 user messages per day
    if (user.plan === 'FREE') {
      const count = await prisma.message.count({
        where: {
          userId: user.id,
          role: 'user',
          createdAt: { gte: startOfToday() },
        },
      });
      if (count >= DAILY_FREE_LIMIT) {
        return res.status(429).json({ success: false, message: 'Daily limit reached (10 messages for free plan).' });
      }
    }

    let conversation = conversationId
      ? await prisma.conversation.findFirst({ where: { id: conversationId, userId: user.id } })
      : null;

    if (conversationId && !conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    if (!conversation) {
      const conversationData: any = {
        userId: user.id,
        title: analysisTitle || buildTitle(message),
      };
      if (analysisId) {
        conversationData.analysisId = analysisId;
      }
      conversation = await prisma.conversation.create({
        data: conversationData,
      });
    }

    const history = await prisma.message.findMany({
      where: { conversationId: conversation.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { role: true, content: true },
    });

    const orderedHistory = history
      .reverse()
      .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }));
    const reply = await getAssistantReply([...orderedHistory, { role: 'user', content: message }], briefing);

    const userMessage = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        userId: user.id,
        role: 'user',
        content: message,
      },
    });

    const assistantMessage = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        userId: user.id,
        role: 'assistant',
        content: reply,
      },
    });

    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date(), title: conversation.title || buildTitle(message) },
    });

    res.status(201).json({
      success: true,
      data: {
        conversationId: conversation.id,
        messages: [userMessage, assistantMessage],
      },
    });
  }
);

router.get('/history', authenticate, async (req: AuthRequest, res: Response) => {
  const user = req.user!;
  const conversations = await prisma.conversation.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: 'desc' },
    include: {
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: { content: true, createdAt: true },
      },
    },
  });

  const items = conversations.map((c) => ({
    id: c.id,
    title: c.title || 'Conversation',
    lastMessage: c.messages[0]?.content || '',
    updatedAt: c.updatedAt,
  }));

  res.json({ success: true, data: items });
});

router.get('/export/jsonl', authenticate, async (req: AuthRequest, res: Response) => {
  const user = req.user!;
  const messages = await prisma.message.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      conversationId: true,
      role: true,
      content: true,
      feedback: true,
      createdAt: true,
    },
  });

  const lines = messages
    .map((m) => JSON.stringify({
      messageId: m.id,
      conversationId: m.conversationId,
      role: m.role,
      content: m.content,
      feedback: m.feedback,
      createdAt: m.createdAt,
    }))
    .join('\n');

  res.setHeader('Content-Type', 'application/jsonl');
  res.setHeader('Content-Disposition', 'attachment; filename=chat-export.jsonl');
  res.send(lines);
});

router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  const user = req.user!;
  const convo = await prisma.conversation.findFirst({
    where: { id: req.params.id, userId: user.id },
  });

  if (!convo) {
    return res.status(404).json({ success: false, message: 'Conversation not found' });
  }

  const messages = await prisma.message.findMany({
    where: { conversationId: convo.id },
    orderBy: { createdAt: 'asc' },
  });

  res.json({ success: true, data: { conversationId: convo.id, title: convo.title, messages } });
});

router.post(
  '/:messageId/feedback',
  authenticate,
  [body('feedback').isIn(['up', 'down'])],
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const user = req.user!;
    const message = await prisma.message.findFirst({
      where: { id: req.params.messageId, userId: user.id },
    });

    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    const updated = await prisma.message.update({
      where: { id: message.id },
      data: { feedback: req.body.feedback },
    });

    res.json({ success: true, data: updated });
  }
);

export { router as chatRoutes };
