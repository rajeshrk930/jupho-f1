import { Router, Response } from 'express';
import { body, query, validationResult } from 'express-validator';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
import { upload } from '../middleware/upload';
import { analyzeCreative } from '../services/openai.service';
import { evaluateRule } from '../services/ruleEngine.service';
import { generateAnalysisPDF } from '../services/pdf.service';

const router = Router();

// Create new analysis
router.post(
  '/',
  authenticate,
  upload.single('creative'),
  [
    body('creativeType').isIn(['IMAGE', 'VIDEO']),
    body('objective').isIn(['AWARENESS', 'TRAFFIC', 'ENGAGEMENT', 'LEADS', 'APP_PROMOTION', 'SALES']),
    body('industry').isIn(['ECOMMERCE', 'SAAS', 'FINANCE', 'HEALTH', 'EDUCATION', 'REAL_ESTATE', 'TRAVEL', 'FOOD', 'FASHION', 'TECHNOLOGY', 'OTHER']),
    body('primaryText').optional().trim(),
    body('headline').optional().trim(),
    body('cpm').optional().isFloat({ min: 0 }),
    body('ctr').optional().isFloat({ min: 0 }),
    body('cpc').optional().isFloat({ min: 0 }),
    body('cpa').optional().isFloat({ min: 0 })
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const {
        creativeType,
        primaryText,
        headline,
        objective,
        industry,
        cpm,
        ctr,
        cpc,
        cpa
      } = req.body;

      // Analyze with rule engine if enabled, otherwise use AI
      const normalizedInput = {
        creativeType,
        primaryText,
        headline,
        objective,
        industry,
        cpm: cpm ? parseFloat(cpm) : undefined,
        ctr: ctr ? parseFloat(ctr) : undefined,
        cpc: cpc ? parseFloat(cpc) : undefined,
        cpa: cpa ? parseFloat(cpa) : undefined
      };

      let analysisResult;
      if (process.env.USE_RULE_ENGINE === 'true') {
        analysisResult = await evaluateRule(normalizedInput);
      } else {
        analysisResult = await analyzeCreative(normalizedInput);
      }

      // Save to database
      const analysis = await prisma.analysis.create({
        data: {
          userId: req.user!.id,
          creativeUrl: req.file ? `/uploads/${req.file.filename}` : null,
          creativeType,
          primaryText,
          headline,
          objective,
          industry,
          cpm: cpm ? parseFloat(cpm) : null,
          ctr: ctr ? parseFloat(ctr) : null,
          cpc: cpc ? parseFloat(cpc) : null,
          cpa: cpa ? parseFloat(cpa) : null,
          primaryReason: analysisResult.primaryReason,
          supportingLogic: analysisResult.supportingLogic,
          singleFix: analysisResult.singleFix,
          resultType: analysisResult.resultType,
          failureReason: analysisResult.failureReason
        }
      });

      res.status(201).json({
        success: true,
        data: analysis
      });
    } catch (error) {
      console.error('Analysis error:', error);
      res.status(500).json({ success: false, message: 'Analysis failed' });
    }
  }
);

// Get all analyses (with pagination and filters)
router.get(
  '/',
  authenticate,
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
    query('industry').optional().isIn(['ECOMMERCE', 'SAAS', 'FINANCE', 'HEALTH', 'EDUCATION', 'REAL_ESTATE', 'TRAVEL', 'FOOD', 'FASHION', 'TECHNOLOGY', 'OTHER']),
    query('resultType').optional().isIn(['DEAD', 'AVERAGE', 'WINNING']),
    query('search').optional().trim()
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      const where: any = { userId: req.user!.id };

      if (req.query.industry) {
        where.industry = req.query.industry;
      }

      if (req.query.resultType) {
        where.resultType = req.query.resultType;
      }

      if (req.query.search) {
        where.OR = [
          { primaryReason: { contains: req.query.search as string, mode: 'insensitive' } },
          { headline: { contains: req.query.search as string, mode: 'insensitive' } },
          { singleFix: { contains: req.query.search as string, mode: 'insensitive' } }
        ];
      }

      const [analyses, total] = await Promise.all([
        prisma.analysis.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit
        }),
        prisma.analysis.count({ where })
      ]);

      res.json({
        success: true,
        data: {
          analyses,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      console.error('Get analyses error:', error);
      res.status(500).json({ success: false, message: 'Failed to get analyses' });
    }
  }
);

// Get single analysis
router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const analysis = await prisma.analysis.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.id
      }
    });

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'Analysis not found'
      });
    }

    res.json({ success: true, data: analysis });
  } catch (error) {
    console.error('Get analysis error:', error);
    res.status(500).json({ success: false, message: 'Failed to get analysis' });
  }
});

// Export analysis as PDF
router.get('/:id/export/pdf', authenticate, async (req: AuthRequest, res) => {
  try {
    const analysis = await prisma.analysis.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.id
      }
    });

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'Analysis not found'
      });
    }

    const pdfBuffer = await generateAnalysisPDF(analysis);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=analysis-${analysis.id}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Export PDF error:', error);
    res.status(500).json({ success: false, message: 'Failed to export PDF' });
  }
});

// Delete analysis
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const analysis = await prisma.analysis.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.id
      }
    });

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'Analysis not found'
      });
    }

    await prisma.analysis.delete({ where: { id: req.params.id } });

    res.json({ success: true, message: 'Analysis deleted' });
  } catch (error) {
    console.error('Delete analysis error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete analysis' });
  }
});

export { router as analysisRoutes };
