import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { clerkAuth } from '../middleware/clerkAuth';
import { AuthRequest } from '../middleware/auth';
import { checkCampaignUsageLimit } from '../middleware/usageLimit';
import { TemplateService } from '../services/template.service';
import { AgentService } from '../services/agent.service';
import { upload } from '../middleware/upload';
import { prisma } from '../lib/prisma';
import { parse } from 'csv-parse/sync';
import fs from 'fs';

const router = Router();

/**
 * GET /api/templates
 * List all templates (system + user's own)
 */
router.get('/', clerkAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { category, search } = req.query;

    const templates = await TemplateService.getTemplates(userId, {
      category: category as string,
      search: search as string,
    });

    // Parse JSON fields for frontend
    const parsedTemplates = templates.map((template: any) =>
      TemplateService.parseTemplate(template)
    );

    res.json({
      templates: parsedTemplates,
      count: parsedTemplates.length,
    });
  } catch (error: any) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/templates/:id
 * Get single template by ID
 */
router.get('/:id', clerkAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const template = await TemplateService.getTemplate(id, userId);
    const parsed = TemplateService.parseTemplate(template);

    res.json(parsed);
  } catch (error: any) {
    console.error('Error fetching template:', error);
    const status = error.message === 'Template not found' ? 404 : 
                   error.message === 'Access denied' ? 403 : 500;
    res.status(status).json({ error: error.message });
  }
});

/**
 * POST /api/templates
 * Create a new template manually
 */
router.post(
  '/',
  clerkAuth,
  [
    body('name').notEmpty().withMessage('Template name is required'),
    body('objective').notEmpty().withMessage('Objective is required'),
    body('targeting').isObject().withMessage('Targeting must be an object'),
    body('budget').isObject().withMessage('Budget must be an object'),
    body('adCopy').isObject().withMessage('Ad copy must be an object'),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const userId = req.user!.id;
      const templateData = req.body;

      const template = await TemplateService.createTemplate(userId, templateData);
      const parsed = TemplateService.parseTemplate(template);

      res.status(201).json(parsed);
    } catch (error: any) {
      console.error('Error creating template:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * POST /api/templates/from-task/:taskId
 * Create template from existing AgentTask
 */
router.post(
  '/from-task/:taskId',
  clerkAuth,
  [
    body('name').notEmpty().withMessage('Template name is required'),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const userId = req.user!.id;
      const { taskId } = req.params;
      const { name, category, description } = req.body;

      const template = await TemplateService.createFromTask(
        taskId,
        userId,
        name,
        category,
        description
      );

      const parsed = TemplateService.parseTemplate(template);

      res.status(201).json(parsed);
    } catch (error: any) {
      console.error('Error creating template from task:', error);
      const status = error.message === 'Task not found' ? 404 :
                     error.message === 'Unauthorized' ? 403 : 500;
      res.status(status).json({ error: error.message });
    }
  }
);

/**
 * PUT /api/templates/:id
 * Update template
 */
router.put(
  '/:id',
  clerkAuth,
  async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const updateData = req.body;

      const template = await TemplateService.updateTemplate(id, userId, updateData);
      const parsed = TemplateService.parseTemplate(template);

      res.json(parsed);
    } catch (error: any) {
      console.error('Error updating template:', error);
      const status = error.message === 'Template not found' ? 404 :
                     error.message === 'Unauthorized' ? 403 : 500;
      res.status(status).json({ error: error.message });
    }
  }
);

/**
 * DELETE /api/templates/:id
 * Delete template
 */
router.delete('/:id', clerkAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    await TemplateService.deleteTemplate(id, userId);

    res.json({ message: 'Template deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting template:', error);
    const status = error.message === 'Template not found' ? 404 :
                   error.message === 'Unauthorized' ? 403 : 500;
    res.status(status).json({ error: error.message });
  }
});

/**
 * POST /api/templates/:id/duplicate
 * Duplicate template
 */
router.post(
  '/:id/duplicate',
  clerkAuth,
  async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const { name } = req.body;

      const template = await TemplateService.duplicateTemplate(id, userId, name);
      const parsed = TemplateService.parseTemplate(template);

      res.status(201).json(parsed);
    } catch (error: any) {
      console.error('Error duplicating template:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * POST /api/templates/:id/launch
 * Launch campaign from template
 */
router.post(
  '/:id/launch',
  clerkAuth,
  checkCampaignUsageLimit('TEMPLATE'),
  upload.single('image'),
  async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      // Get template
      const template = await TemplateService.getTemplate(id, userId);
      const parsed = TemplateService.parseTemplate(template);

      // Parse launch data from request
      const {
        headlines,
        primaryTexts,
        descriptions,
        cta,
        budget,
        targeting,
        imageUrl: providedImageUrl,
      } = req.body;

      // Parse JSON strings if they come as strings
      const parsedHeadlines = typeof headlines === 'string' ? JSON.parse(headlines) : headlines;
      const parsedPrimaryTexts = typeof primaryTexts === 'string' ? JSON.parse(primaryTexts) : primaryTexts;
      const parsedDescriptions = typeof descriptions === 'string' ? JSON.parse(descriptions) : descriptions;
      const parsedBudget = typeof budget === 'string' ? JSON.parse(budget) : budget;
      const parsedTargeting = typeof targeting === 'string' ? JSON.parse(targeting) : targeting;

      // Use provided data or fall back to template defaults
      const finalHeadlines = parsedHeadlines || parsed.adCopy.headlines;
      const finalPrimaryTexts = parsedPrimaryTexts || parsed.adCopy.primaryTexts;
      const finalDescriptions = parsedDescriptions || parsed.adCopy.descriptions;
      const finalCta = cta || parsed.adCopy.cta;
      const finalBudget = parsedBudget || parsed.budget;
      const finalTargeting = parsedTargeting || parsed.targeting;

      // Create AgentTask from template (check for existing task to prevent duplicates)
      let task = await prisma.agentTask.findFirst({
        where: {
          userId,
          input: {
            contains: `"templateId":"${template.id}"`,
          },
          fbCampaignId: { not: null },
        },
        orderBy: { createdAt: 'desc' },
      });

      if (task) {
        console.log('[Template Launch] Campaign already exists from this template:', task.id);
        return res.status(409).json({
          error: 'ALREADY_LAUNCHED',
          message: 'A campaign has already been launched from this template recently. Please check your campaigns.',
          taskId: task.id,
          campaignId: task.fbCampaignId,
          adId: task.fbAdId,
        });
      }

      task = await prisma.agentTask.create({
        data: {
          userId,
          type: 'CREATE_AD',
          status: 'GENERATING',
          createdVia: 'TEMPLATE',
          conversionMethod: parsed.conversionMethod,
          input: JSON.stringify({
            fromTemplate: true,
            templateId: template.id,
            templateName: template.name,
          }),
          recommendations: JSON.stringify({
            objective: {
              chosen: parsed.objective,
              recommended: parsed.objective,
            },
            audience: {
              ageMin: finalTargeting.ageMin,
              ageMax: finalTargeting.ageMax,
              interestKeywords: finalTargeting.interestKeywords,
              location: finalTargeting.location,
            },
            budget: finalBudget,
            cta: {
              chosen: finalCta,
            },
          }),
        },
      });

      // Create GeneratedCreative records
      const creatives = [];

      for (const headline of finalHeadlines) {
        creatives.push({
          taskId: task.id,
          type: 'HEADLINE',
          content: headline,
          isSelected: true,
        });
      }

      for (const text of finalPrimaryTexts) {
        creatives.push({
          taskId: task.id,
          type: 'PRIMARY_TEXT',
          content: text,
          isSelected: true,
        });
      }

      for (const desc of finalDescriptions) {
        creatives.push({
          taskId: task.id,
          type: 'DESCRIPTION',
          content: desc,
          isSelected: true,
        });
      }

      await prisma.generatedCreative.createMany({
        data: creatives,
      });

      // Get Facebook account
      const fbAccount = await prisma.facebookAccount.findUnique({
        where: { userId },
      });

      if (!fbAccount) {
        await prisma.agentTask.update({
          where: { id: task.id },
          data: {
            status: 'FAILED',
            errorMessage: 'Facebook account not connected',
          },
        });
        return res.status(400).json({ error: 'Please connect your Facebook account first' });
      }

      // Launch campaign using Agent Service
      try {
        await prisma.agentTask.update({
          where: { id: task.id },
          data: { status: 'CREATING' },
        });

        // Get image URL if uploaded
        let imageUrl: string | undefined;
        if (req.file) {
          imageUrl = `/uploads/${req.file.filename}`;
        } else if (providedImageUrl) {
          imageUrl = providedImageUrl;
        }

        const agentService = new AgentService();
        const result = await agentService.launchCampaign(
          task.id,
          userId,
          imageUrl
        );

        // Increment template usage count
        await TemplateService.incrementUsage(template.id);

        // Increment user's agent tasks counter
        await prisma.user.update({
          where: { id: userId },
          data: {
            agentTasksCreated: {
              increment: 1,
            },
          },
        });

        res.json({
          message: 'Campaign launched successfully from template!',
          taskId: task.id,
          ...result,
        });
      } catch (fbError: any) {
        console.error('Facebook API error:', fbError);
        await prisma.agentTask.update({
          where: { id: task.id },
          data: {
            status: 'FAILED',
            errorMessage: fbError.message,
          },
        });
        throw fbError;
      }
    } catch (error: any) {
      console.error('Error launching template:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * POST /api/templates/import
 * Bulk import templates from CSV (Admin only)
 */
router.post(
  '/import',
  clerkAuth,
  upload.single('file'),
  async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.id;

      // Admin check (customize this based on your admin logic)
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true },
      });

      const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
      const isAdmin = adminEmails.includes(user?.email || '');

      if (!isAdmin) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      if (!req.file) {
        return res.status(400).json({ error: 'CSV file required' });
      }

      // Read and parse CSV
      const csvContent = fs.readFileSync(req.file.path, 'utf-8');
      const rows = parse(csvContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });

      if (rows.length === 0) {
        return res.status(400).json({ error: 'CSV file is empty' });
      }

      if (rows.length > 100) {
        return res.status(400).json({ error: 'Maximum 100 templates per upload' });
      }

      const results = {
        imported: 0,
        skipped: [] as Array<{ row: number; name: string; reason: string }>,
      };

      // Process each row
      for (let i = 0; i < rows.length; i++) {
        const row: any = rows[i];
        const rowNumber = i + 2; // +2 because CSV has header row and is 1-indexed

        try {
          // Validate row
          const validationError = TemplateService.validateCSVRow(row);
          if (validationError) {
            results.skipped.push({
              row: rowNumber,
              name: row.TemplateName || 'Unknown',
              reason: validationError,
            });
            continue;
          }

          // Create template
          await TemplateService.createFromCSV(row);
          results.imported++;
        } catch (error: any) {
          results.skipped.push({
            row: rowNumber,
            name: row.TemplateName || 'Unknown',
            reason: error.message,
          });
        }
      }

      // Clean up uploaded file
      fs.unlinkSync(req.file.path);

      res.json({
        message: `Import complete. ${results.imported} templates imported, ${results.skipped.length} skipped.`,
        imported: results.imported,
        skipped: results.skipped,
      });
    } catch (error: any) {
      console.error('Error importing templates:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

export default router;
