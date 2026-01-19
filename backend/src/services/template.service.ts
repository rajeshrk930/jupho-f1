import { prisma } from '../lib/prisma';
import { AgentTask } from '@prisma/client';

export interface TemplateFilters {
  category?: string;
  isPublic?: boolean;
  search?: string;
}

export interface TemplateData {
  name: string;
  category?: string;
  description?: string;
  objective: string;
  conversionMethod: string;
  targeting: {
    ageMin: number;
    ageMax: number;
    interestKeywords: string[];
    location?: {
      isLocal: boolean;
      radius?: number;
    };
  };
  budget: {
    dailyAmount: number;
    currency: string;
    reasoning?: string;
  };
  adCopy: {
    headlines: string[];
    primaryTexts: string[];
    descriptions: string[];
    cta: string;
  };
  imageUrl?: string;
}

export interface TemplateLaunchData {
  headlines: string[];
  primaryTexts: string[];
  descriptions: string[];
  cta: string;
  budget: {
    dailyAmount: number;
    currency: string;
  };
  targeting: {
    ageMin: number;
    ageMax: number;
    interestKeywords: string[];
    location?: {
      isLocal: boolean;
      cityName?: string;
      radius?: number;
    };
  };
  imageFile?: Express.Multer.File;
  imageUrl?: string;
}

export class TemplateService {
  /**
   * Create a new template
   */
  static async createTemplate(
    userId: string | null,
    data: TemplateData
  ) {
    return await prisma.adTemplate.create({
      data: {
        userId,
        name: data.name,
        category: data.category,
        description: data.description,
        isPublic: userId === null, // System templates are public
        objective: data.objective,
        conversionMethod: data.conversionMethod,
        targeting: JSON.stringify(data.targeting),
        budget: JSON.stringify(data.budget),
        adCopy: JSON.stringify(data.adCopy),
        imageUrl: data.imageUrl,
      },
    });
  }

  /**
   * Create template from existing AgentTask
   */
  static async createFromTask(
    taskId: string,
    userId: string,
    name: string,
    category?: string,
    description?: string
  ) {
    const task = await prisma.agentTask.findUnique({
      where: { id: taskId },
      include: { generatedCreatives: true },
    });

    if (!task) {
      throw new Error('Task not found');
    }

    if (task.userId !== userId) {
      throw new Error('Unauthorized');
    }

    // Parse task data
    const input = task.input ? JSON.parse(task.input) : {};
    const recommendations = task.recommendations
      ? JSON.parse(task.recommendations)
      : {};

    // Extract selected creatives
    const selectedHeadlines = task.generatedCreatives
      .filter((c: any) => c.type === 'HEADLINE' && c.isSelected)
      .map((c: any) => c.content);

    const selectedPrimaryTexts = task.generatedCreatives
      .filter((c: any) => c.type === 'PRIMARY_TEXT' && c.isSelected)
      .map((c: any) => c.content);

    const selectedDescriptions = task.generatedCreatives
      .filter((c: any) => c.type === 'DESCRIPTION' && c.isSelected)
      .map((c: any) => c.content);

    // Fallback to all creatives if none selected
    const headlines =
      selectedHeadlines.length > 0
        ? selectedHeadlines
        : task.generatedCreatives
            .filter((c: any) => c.type === 'HEADLINE')
            .map((c: any) => c.content);

    const primaryTexts =
      selectedPrimaryTexts.length > 0
        ? selectedPrimaryTexts
        : task.generatedCreatives
            .filter((c: any) => c.type === 'PRIMARY_TEXT')
            .map((c: any) => c.content);

    const descriptions =
      selectedDescriptions.length > 0
        ? selectedDescriptions
        : task.generatedCreatives
            .filter((c: any) => c.type === 'DESCRIPTION')
            .map((c: any) => c.content);

    const templateData: TemplateData = {
      name,
      category,
      description,
      objective: recommendations.objective?.chosen || 'OUTCOME_LEADS',
      conversionMethod: task.conversionMethod || 'lead_form',
      targeting: {
        ageMin: recommendations.audience?.ageMin || 25,
        ageMax: recommendations.audience?.ageMax || 45,
        interestKeywords: recommendations.audience?.interestKeywords || [],
        location: recommendations.audience?.location || {
          isLocal: true,
          radius: 5,
        },
      },
      budget: {
        dailyAmount: recommendations.budget?.dailyAmount || 500,
        currency: recommendations.budget?.currency || 'INR',
        reasoning: recommendations.budget?.reasoning,
      },
      adCopy: {
        headlines: headlines.slice(0, 3),
        primaryTexts: primaryTexts.slice(0, 3),
        descriptions: descriptions.slice(0, 3),
        cta: recommendations.cta?.chosen || 'SIGN_UP',
      },
    };

    return await this.createTemplate(userId, templateData);
  }

  /**
   * Get all templates with filters
   */
  static async getTemplates(userId: string, filters: TemplateFilters = {}) {
    const where: any = {
      OR: [
        { isPublic: true }, // System templates
        { userId }, // User's own templates
      ],
    };

    if (filters.category) {
      where.category = filters.category;
    }

    if (filters.search) {
      where.OR = [
        ...where.OR,
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return await prisma.adTemplate.findMany({
      where,
      orderBy: [{ isPublic: 'desc' }, { usageCount: 'desc' }, { createdAt: 'desc' }],
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  /**
   * Get single template by ID
   */
  static async getTemplate(templateId: string, userId: string) {
    const template = await prisma.adTemplate.findUnique({
      where: { id: templateId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!template) {
      throw new Error('Template not found');
    }

    // Check access: public templates or user's own templates
    if (!template.isPublic && template.userId !== userId) {
      throw new Error('Access denied');
    }

    return template;
  }

  /**
   * Update template (only user's own templates)
   */
  static async updateTemplate(
    templateId: string,
    userId: string,
    data: Partial<TemplateData>
  ) {
    const template = await prisma.adTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      throw new Error('Template not found');
    }

    if (template.userId !== userId) {
      throw new Error('Unauthorized');
    }

    const updateData: any = {};

    if (data.name) updateData.name = data.name;
    if (data.category) updateData.category = data.category;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.objective) updateData.objective = data.objective;
    if (data.conversionMethod) updateData.conversionMethod = data.conversionMethod;
    if (data.targeting) updateData.targeting = JSON.stringify(data.targeting);
    if (data.budget) updateData.budget = JSON.stringify(data.budget);
    if (data.adCopy) updateData.adCopy = JSON.stringify(data.adCopy);
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;

    return await prisma.adTemplate.update({
      where: { id: templateId },
      data: updateData,
    });
  }

  /**
   * Delete template (only user's own templates)
   */
  static async deleteTemplate(templateId: string, userId: string) {
    const template = await prisma.adTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      throw new Error('Template not found');
    }

    if (template.userId !== userId) {
      throw new Error('Unauthorized');
    }

    return await prisma.adTemplate.delete({
      where: { id: templateId },
    });
  }

  /**
   * Increment usage count
   */
  static async incrementUsage(templateId: string) {
    return await prisma.adTemplate.update({
      where: { id: templateId },
      data: {
        usageCount: {
          increment: 1,
        },
      },
    });
  }

  /**
   * Parse template data for easy access
   */
  static parseTemplate(template: any) {
    return {
      ...template,
      targeting: JSON.parse(template.targeting),
      budget: JSON.parse(template.budget),
      adCopy: JSON.parse(template.adCopy),
    };
  }

  /**
   * Duplicate template
   */
  static async duplicateTemplate(templateId: string, userId: string, newName?: string) {
    const template = await this.getTemplate(templateId, userId);
    const parsed = this.parseTemplate(template);

    return await this.createTemplate(userId, {
      name: newName || `${template.name} (Copy)`,
      category: template.category || undefined,
      description: template.description || undefined,
      objective: template.objective,
      conversionMethod: template.conversionMethod,
      targeting: parsed.targeting,
      budget: parsed.budget,
      adCopy: parsed.adCopy,
      imageUrl: template.imageUrl || undefined,
    });
  }

  /**
   * Auto-detect category from template text
   */
  static detectCategory(text: string): string {
    const t = text.toLowerCase();

    if (t.includes('restaurant') || t.includes('food') || t.includes('cafe') || t.includes('pizza') || t.includes('delivery')) {
      return 'RESTAURANT';
    }
    if (t.includes('gym') || t.includes('fitness') || t.includes('workout') || t.includes('training')) {
      return 'GYM';
    }
    if (t.includes('salon') || t.includes('beauty') || t.includes('hair') || t.includes('spa') || t.includes('makeup')) {
      return 'SALON';
    }
    if (t.includes('real estate') || t.includes('property') || t.includes('apartment') || t.includes('house')) {
      return 'REAL_ESTATE';
    }
    if (t.includes('ecommerce') || t.includes('store') || t.includes('shop') || t.includes('online shopping')) {
      return 'ECOMMERCE';
    }
    if (t.includes('agency') || t.includes('marketing') || t.includes('consulting')) {
      return 'AGENCY';
    }
    if (t.includes('plumb') || t.includes('electric') || t.includes('repair') || t.includes('home service')) {
      return 'HOME_SERVICES';
    }
    if (t.includes('dental') || t.includes('clinic') || t.includes('hospital') || t.includes('healthcare') || t.includes('doctor')) {
      return 'HEALTHCARE';
    }
    if (t.includes('education') || t.includes('course') || t.includes('training') || t.includes('school') || t.includes('learning')) {
      return 'EDUCATION';
    }
    if (t.includes('car') || t.includes('auto') || t.includes('vehicle') || t.includes('dealership')) {
      return 'AUTOMOTIVE';
    }
    if (t.includes('hotel') || t.includes('resort') || t.includes('travel') || t.includes('vacation')) {
      return 'HOSPITALITY';
    }

    return 'GENERAL';
  }

  /**
   * Validate CSV row data
   */
  static validateCSVRow(row: any): string | null {
    const required = ['TemplateName', 'PrimaryText', 'Headline', 'CTA', 'Industry', 'Goal'];

    for (const field of required) {
      if (!row[field] || String(row[field]).trim() === '') {
        return `Missing required field: ${field}`;
      }
    }

    if (String(row.PrimaryText).length > 125) {
      return 'PrimaryText exceeds 125 characters';
    }

    if (String(row.Headline).length > 40) {
      return 'Headline exceeds 40 characters';
    }

    const allowedCTA = [
      'SIGN_UP',
      'LEARN_MORE',
      'SHOP_NOW',
      'CONTACT_US',
      'APPLY_NOW',
      'GET_STARTED',
      'BOOK_NOW',
      'CALL_NOW',
      'DOWNLOAD',
      'GET_QUOTE',
    ];

    const ctaUpper = String(row.CTA).toUpperCase().replace(/\s+/g, '_');
    if (!allowedCTA.includes(ctaUpper)) {
      return `Invalid CTA. Allowed: ${allowedCTA.join(', ')}`;
    }

    return null;
  }

  /**
   * Check if template already exists (duplicate detection)
   */
  static async isDuplicate(name: string, category: string): Promise<boolean> {
    const existing = await prisma.adTemplate.findFirst({
      where: {
        name: name.trim(),
        category: category,
      },
    });

    return existing !== null;
  }

  /**
   * Create template from CSV row
   */
  static async createFromCSV(row: any): Promise<any> {
    // Auto-detect category
    const detectedCategory = this.detectCategory(
      `${row.TemplateName} ${row.PrimaryText} ${row.Industry || ''}`
    );

    // Check duplicate
    const isDuplicate = await this.isDuplicate(row.TemplateName, detectedCategory);
    if (isDuplicate) {
      throw new Error('Duplicate template');
    }

    // Parse optional fields with defaults
    const budget = parseInt(row.Budget || '500');
    const ageMin = parseInt(row.AgeMin || '25');
    const ageMax = parseInt(row.AgeMax || '45');
    const interests = row.Interests
      ? row.Interests.split(',').map((i: string) => i.trim())
      : [];

    const templateData: TemplateData = {
      name: row.TemplateName.trim(),
      category: detectedCategory,
      description: row.Description || `${row.Industry} - ${row.Goal}`,
      objective: row.Objective || 'OUTCOME_LEADS',
      conversionMethod: row.ConversionMethod || 'lead_form',
      targeting: {
        ageMin,
        ageMax,
        interestKeywords: interests,
        location: {
          isLocal: row.IsLocal !== 'false',
          radius: parseInt(row.Radius || '10'),
        },
      },
      budget: {
        dailyAmount: budget,
        currency: row.Currency || 'INR',
        reasoning: row.BudgetReasoning || `Recommended budget for ${row.Industry}`,
      },
      adCopy: {
        headlines: [row.Headline, row.Headline2 || row.Headline, row.Headline3 || row.Headline].filter(Boolean),
        primaryTexts: [row.PrimaryText, row.PrimaryText2 || row.PrimaryText, row.PrimaryText3 || row.PrimaryText].filter(Boolean),
        descriptions: [row.Description || row.Headline.substring(0, 30), row.Description2 || row.Headline.substring(0, 30), row.Description3 || row.Headline.substring(0, 30)].filter(Boolean),
        cta: row.CTA.toUpperCase().replace(/\s+/g, '_'),
      },
      imageUrl: row.ImageUrl || undefined,
    };

    return await this.createTemplate(null, templateData);
  }
}
