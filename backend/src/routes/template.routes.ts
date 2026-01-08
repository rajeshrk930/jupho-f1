import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/templates - Get all templates for authenticated user
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { category } = req.query;
    const userId = req.user!.id;

    const where: any = { userId };
    if (category && ['COPY', 'SCRIPT', 'REPORT'].includes(category as string)) {
      where.category = category;
    }

    const templates = await prisma.savedTemplate.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        category: true,
        title: true,
        content: true,
        tags: true,
        analysisId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json({
      success: true,
      data: templates.map((t: any) => ({
        ...t,
        tags: JSON.parse(t.tags || '[]'),
      })),
    });
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ success: false, message: 'Failed to load templates' });
  }
});

// POST /api/templates - Create new template
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { category, title, content, tags, analysisId } = req.body;
    const userId = req.user!.id;

    // Validation
    if (!category || !['COPY', 'SCRIPT', 'REPORT'].includes(category)) {
      return res.status(400).json({ success: false, message: 'Invalid category' });
    }

    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Title and content are required' });
    }

    const template = await prisma.savedTemplate.create({
      data: {
        userId,
        category,
        title,
        content,
        tags: JSON.stringify(tags || []),
        analysisId: analysisId || null,
      },
    });

    res.json({
      success: true,
      data: {
        ...template,
        tags: JSON.parse(template.tags),
      },
    });
  } catch (error) {
    console.error('Error creating template:', error);
    res.status(500).json({ success: false, message: 'Failed to save template' });
  }
});

// DELETE /api/templates/:id - Delete template
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    // Check ownership
    const template = await prisma.savedTemplate.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!template) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }

    if (template.userId !== userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    await prisma.savedTemplate.delete({
      where: { id },
    });

    res.json({ success: true, message: 'Template deleted successfully' });
  } catch (error) {
    console.error('Error deleting template:', error);
    res.status(500).json({ success: false, message: 'Failed to delete template' });
  }
});

export default router;
