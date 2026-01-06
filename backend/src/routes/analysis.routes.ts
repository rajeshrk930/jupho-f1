import { Router, Response } from 'express';
import { body, query, validationResult } from 'express-validator';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
import { upload } from '../middleware/upload';
import { DecisionEngine } from '../services/decisionEngine.service';
import { generateAnalysisPDF } from '../services/pdf.service';
import { buildHumanizedCopy } from '../services/copyDeck';

const router = Router();

// Helper function to transform analysis with parsed supportingLogic
const transformAnalysis = (analysis: any) => {
  try {
    return {
      ...analysis,
      supportingLogic: typeof analysis.supportingLogic === 'string' 
        ? JSON.parse(analysis.supportingLogic)
        : analysis.supportingLogic
    };
  } catch {
    // If parsing fails, return as array with original string
    return {
      ...analysis,
      supportingLogic: [analysis.supportingLogic]
    };
  }
};

// Create new analysis
router.post(
  '/',
  authenticate,
  upload.single('creative'),
  [
    body('creativeType').isIn(['IMAGE', 'VIDEO']),
    body('objective').isIn(['LEADS', 'WHATSAPP', 'SALES']),
    body('problemFaced').isIn(['LOW_CLICKS', 'CLICKS_NO_ACTION', 'MESSAGES_NO_CONVERSION']),
    body('whatChanged').isIn(['CREATIVE_CHANGED', 'AUDIENCE_CHANGED', 'BUDGET_CHANGED', 'NOTHING_NEW_AD']),
    body('audienceType').isIn(['BROAD', 'INTEREST_BASED', 'LOOKALIKE']),
    body('primaryText').optional().trim(),
    body('headline').optional().trim(),
    body('cpm').isFloat({ min: 0 }),
    body('ctr').isFloat({ min: 0 }),
    body('cpa').isFloat({ min: 0 })
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
        problemFaced,
        whatChanged,
        audienceType,
        cpm,
        ctr,
        cpa
      } = req.body;

      // Initialize decision engine
      const decisionEngine = new DecisionEngine();
      
      // Run decision engine analysis
      const decision = decisionEngine.decide({
        objective,
        problemFaced,
        whatChanged,
        audienceType,
        cpm: parseFloat(cpm),
        ctr: parseFloat(ctr),
        cpa: parseFloat(cpa)
      });

      // Map decision status to result type
      const resultTypeMapping = {
        BROKEN: 'DEAD',
        FIXABLE: 'AVERAGE',
        SCALE_READY: 'WINNING',
      } as const;

      const metricsParsed = {
        cpm: parseFloat(cpm),
        ctr: parseFloat(ctr),
        cpa: parseFloat(cpa)
      };

      const copy = buildHumanizedCopy({
        decision,
        metrics: metricsParsed,
      });

      // Format analysis result using locked combo: headline, one-line reason with metric, 1–3 actions
      const analysisResult = {
        primaryReason: copy.headline,
        supportingLogic: [copy.reason],
        singleFix: copy.actions.join(' | '),
        resultType: resultTypeMapping[decision.status],
        failureReason: decision.status === 'BROKEN' ? decision.rootCause : 'none'
      };

      // Save to database
      const analysis = await prisma.analysis.create({
        data: {
          userId: req.user!.id,
          creativeUrl: req.file ? `/uploads/${req.file.filename}` : null,
          creativeType,
          primaryText,
          headline,
          objective,
          problemFaced,
          whatChanged,
          audienceType,
          cpm: parseFloat(cpm),
          ctr: parseFloat(ctr),
          cpa: parseFloat(cpa),
          primaryReason: analysisResult.primaryReason,
          // Store array as JSON string for compatibility with String field
          supportingLogic: JSON.stringify(analysisResult.supportingLogic),
          singleFix: analysisResult.singleFix,
          resultType: analysisResult.resultType,
          failureReason: analysisResult.failureReason
        }
      });

      res.status(201).json({
        success: true,
        data: transformAnalysis(analysis)
      });
    } catch (error) {
      // Log full stack in development for easier debugging
      // eslint-disable-next-line no-console
      console.error('Analysis error:', error instanceof Error ? error.stack : error);
      const message = process.env.NODE_ENV === 'development' && error instanceof Error
        ? error.message
        : 'Analysis failed';
      res.status(500).json({ success: false, message });
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
    query('objective').optional().isIn(['LEADS', 'WHATSAPP', 'SALES']),
    query('problemFaced').optional().isIn(['LOW_CLICKS', 'CLICKS_NO_ACTION', 'MESSAGES_NO_CONVERSION']),
    query('resultType').optional().isIn(['DEAD', 'AVERAGE', 'WINNING']),
    query('search').optional().trim()
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      const where: any = { userId: req.user!.id };

      if (req.query.objective) {
        where.objective = req.query.objective;
      }

      if (req.query.problemFaced) {
        where.problemFaced = req.query.problemFaced;
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
          analyses: analyses.map(transformAnalysis),
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

    res.json({ success: true, data: transformAnalysis(analysis) });
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
