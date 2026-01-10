import OpenAI from 'openai';
import { prisma } from '../lib/prisma';
import { FacebookService } from './facebook.service';
import { ScraperService } from './scraper.service';
import { MasterPromptService, CampaignStrategy } from './masterPrompt.service';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export class AgentService {
  /**
   * STEP 1: Start Business Scan
   * Scrapes website or accepts manual input
   */
  async startBusinessScan(
    userId: string, 
    url?: string, 
    manualInput?: string
  ): Promise<any> {
    try {
      // Create task
      const task = await prisma.agentTask.create({
        data: {
          userId,
          type: 'CREATE_AD',
          status: 'GATHERING_INFO',
          conversationState: 'BUSINESS_SCAN'
        }
      });

      let scrapedData;

      if (url) {
        // Try scraping website first
        if (url.includes('instagram.com')) {
          scrapedData = await ScraperService.scrapeInstagram(url);
        } else {
          scrapedData = await ScraperService.scrapeWebsite(url);
        }

        // Fallback to manual if scraping failed
        if (!scrapedData.success) {
          console.log('[AgentService] Scraping failed, will need manual input');
          return {
            taskId: task.id,
            success: false,
            needsManualInput: true,
            error: scrapedData.error,
            message: 'Unable to scan website automatically. Please provide your business details manually.'
          };
        }
      } else if (manualInput) {
        // Manual input provided
        scrapedData = await ScraperService.parseManualInput(manualInput);
      } else {
        throw new Error('Either URL or manual input required');
      }

      // Save scraped data to task
      await prisma.agentTask.update({
        where: { id: task.id },
        data: {
          businessProfile: JSON.stringify(scrapedData),
          status: 'PENDING'
        }
      });

      return {
        taskId: task.id,
        success: true,
        businessData: {
          brandName: scrapedData.brandName,
          description: scrapedData.description,
          products: scrapedData.products,
          usps: scrapedData.usps,
          source: scrapedData.source
        },
        message: `Great! We detected: ${scrapedData.brandName || 'Your business'}. ${scrapedData.description ? scrapedData.description.substring(0, 100) + '...' : ''}`
      };
    } catch (error: any) {
      console.error('[AgentService] Business scan error:', error);
      throw error;
    }
  }

  /**
   * STEP 2: Generate Campaign Strategy
   * Uses Master Prompt to create complete strategy
   */
  async generateStrategy(
    taskId: string, 
    userId: string, 
    userGoal?: string,
    conversionMethod: 'lead_form' | 'website' = 'lead_form'
  ): Promise<any> {
    try {
      // Get task
      const task = await prisma.agentTask.findUnique({
        where: { id: taskId, userId }
      });

      if (!task) {
        throw new Error('Task not found');
      }

      if (!task.businessProfile) {
        throw new Error('No business data found. Please complete scan step first.');
      }

      const businessData = JSON.parse(task.businessProfile);

      // Update status and save conversion method
      await prisma.agentTask.update({
        where: { id: taskId },
        data: { 
          status: 'GENERATING',
          conversationState: 'AI_CONSULTANT',
          conversionMethod: conversionMethod,
          originalWebsiteUrl: businessData.contact?.website || null
        }
      });

      // Generate strategy using Master Prompt
      const strategy: CampaignStrategy = await MasterPromptService.generateCampaignStrategy(
        businessData,
        userGoal,
        conversionMethod
      );

      // Search Facebook for interest IDs
      let interestIds: Array<{ id: string; name: string }> = [];
      try {
        // Get Facebook access token
        const fbAccount = await prisma.facebookAccount.findUnique({
          where: { userId }
        });

        if (fbAccount) {
          const accessToken = FacebookService.decryptToken(fbAccount.accessToken);
          interestIds = await FacebookService.searchInterests(
            accessToken,
            strategy.targeting.interestKeywords,
            3 // Get top 3 interests per keyword
          );
        }
      } catch (error) {
        console.error('[AgentService] Interest search failed, using broad targeting:', error);
      }

      // Save strategy to task
      await prisma.agentTask.update({
        where: { id: taskId },
        data: {
          input: JSON.stringify(strategy),
          status: 'REVIEW',
          conversationState: 'ONE_CLICK_LAUNCH'
        }
      });

      // Save generated creatives
      await this.saveCreatives(taskId, strategy.adCopy);

      return {
        taskId: task.id,
        success: true,
        strategy: {
          objective: strategy.objective,
          budget: {
            dailyAmount: strategy.budget.dailyAmount,
            currency: strategy.budget.currency,
            reasoning: strategy.budget.reasoning
          },
          targeting: {
            ageRange: `${strategy.targeting.ageMin}-${strategy.targeting.ageMax}`,
            interests: interestIds.length > 0 
              ? interestIds.slice(0, 5).map(i => i.name)
              : strategy.targeting.interestKeywords,
            isLocal: strategy.targeting.location.isLocal,
            location: strategy.targeting.location.cityName || 'India (Nationwide)'
          },
          adCopy: strategy.adCopy,
          reasoning: strategy.reasoning
        }
      };
    } catch (error: any) {
      console.error('[AgentService] Strategy generation error:', error);
      
      await prisma.agentTask.update({
        where: { id: taskId },
        data: {
          status: 'FAILED',
          errorMessage: error.message
        }
      });

      throw error;
    }
  }

  /**
   * STEP 3: Launch Campaign on Facebook
   * Creates campaign, ad set, creative, and ad
   */
  async launchCampaign(
    taskId: string,
    userId: string,
    imageUrl?: string
  ): Promise<any> {
    try {
      // Get task and strategy
      const task = await prisma.agentTask.findUnique({
        where: { id: taskId, userId },
        include: { generatedCreatives: true }
      });

      if (!task) {
        throw new Error('Task not found');
      }

      if (!task.input) {
        throw new Error('No strategy found. Please generate strategy first.');
      }

      const strategy: CampaignStrategy = JSON.parse(task.input);
      const businessData = task.businessProfile ? JSON.parse(task.businessProfile) : {};

      // Get Facebook account
      const fbAccount = await prisma.facebookAccount.findUnique({
        where: { userId }
      });

      if (!fbAccount || !fbAccount.isActive) {
        throw new Error('Facebook account not connected. Please connect in Settings.');
      }

      const accessToken = FacebookService.decryptToken(fbAccount.accessToken);

      // Update status
      await prisma.agentTask.update({
        where: { id: taskId },
        data: { status: 'CREATING' }
      });

      // Get selected creatives
      const selectedHeadline = task.generatedCreatives.find(
        c => c.type === 'HEADLINE' && c.isSelected
      )?.content || strategy.adCopy.headlines[0];

      const selectedPrimaryText = task.generatedCreatives.find(
        c => c.type === 'PRIMARY_TEXT' && c.isSelected
      )?.content || strategy.adCopy.primaryTexts[0];

      const selectedDescription = task.generatedCreatives.find(
        c => c.type === 'DESCRIPTION' && c.isSelected
      )?.content || strategy.adCopy.descriptions[0];

      // 1. Upload image (if provided)
      let imageHash: string | undefined;
      if (imageUrl) {
        const fullImageUrl = imageUrl.startsWith('http') 
          ? imageUrl 
          : `${process.env.BACKEND_URL || 'http://localhost:5000'}${imageUrl}`;
        imageHash = await FacebookService.uploadAdImage(
          accessToken,
          fbAccount.adAccountId,
          fullImageUrl
        );
      }

      // 2. Create Campaign
      const campaignId = await FacebookService.createCampaign(
        accessToken,
        fbAccount.adAccountId,
        `Jupho AI - ${businessData.brandName || 'Campaign'}`,
        strategy.objective,
        'PAUSED'
      );

      // 3. Search for interest IDs
      let interests: Array<{ id: string; name: string }> = [];
      try {
        interests = await FacebookService.searchInterests(
          accessToken,
          strategy.targeting.interestKeywords,
          3
        );
      } catch (error) {
        console.log('[AgentService] Interest search failed, using broad targeting');
      }

      // 4. Build targeting
      const targeting = FacebookService.getDefaultTargeting(
        interests.length > 0 ? 'INTEREST_BASED' : 'BROAD',
        interests.length > 0 ? interests.slice(0, 5) : undefined,
        strategy.targeting.location.cityName,
        strategy.targeting.location.radius
      );

      // 5. Create Ad Set
      const adSetId = await FacebookService.createAdSet(
        accessToken,
        fbAccount.adAccountId,
        campaignId,
        `Ad Set - ${businessData.brandName || 'Default'}`,
        strategy.budget.dailyAmount * 100, // Convert to cents
        targeting,
        this.getOptimizationGoal(strategy.objective),
        'IMPRESSIONS',
        'PAUSED'
      );

      // 6. Create Ad Creative (SPLIT LOGIC: Lead Form vs Website)
      if (!imageHash) {
        throw new Error('Image upload failed - no image hash returned');
      }

      const conversionMethod = task.conversionMethod || 'lead_form';
      let creativeId: string;

      if (conversionMethod === 'lead_form') {
        // LEAD FORM FLOW: Create Meta Instant Form + Lead Form Creative
        console.log('[AgentService] Using LEAD FORM conversion method');
        
        const pageId = process.env.FACEBOOK_PAGE_ID;
        if (!pageId) {
          throw new Error('FACEBOOK_PAGE_ID not configured in environment variables');
        }

        // Create Lead Form
        const leadFormId = await FacebookService.createLeadForm(
          accessToken,
          pageId,
          `${businessData.brandName || 'Business'} - Lead Form`,
          selectedPrimaryText, // Use primary text as intro
          'https://jupho.io/privacy',
          'Thank you! We\'ll contact you soon.',
          undefined // Use default questions (Name, Phone, Email)
        );

        // Save lead form ID
        await prisma.agentTask.update({
          where: { id: taskId },
          data: { leadFormId }
        });

        // Create creative with lead form
        creativeId = await FacebookService.createAdCreativeWithLeadForm(
          accessToken,
          fbAccount.adAccountId,
          `Creative - ${businessData.brandName || 'Default'}`,
          imageHash,
          selectedHeadline,
          selectedPrimaryText,
          leadFormId,
          strategy.adCopy.cta || 'SIGN_UP'
        );

        console.log('[AgentService] Lead form created:', leadFormId);
      } else {
        // WEBSITE FLOW: Create regular creative with link URL
        console.log('[AgentService] Using WEBSITE conversion method');
        
        const linkUrl = task.originalWebsiteUrl || 
                       process.env.FACEBOOK_DEFAULT_LINK_URL || 
                       businessData.contact?.website || 
                       'https://example.com';
        
        creativeId = await FacebookService.createAdCreative(
          accessToken,
          fbAccount.adAccountId,
          `Creative - ${businessData.brandName || 'Default'}`,
          imageHash,
          selectedHeadline,
          selectedPrimaryText,
          linkUrl,
          strategy.adCopy.cta || 'LEARN_MORE'
        );
      }

      // 7. Create Ad
      const adId = await FacebookService.createAd(
        accessToken,
        fbAccount.adAccountId,
        `Ad - ${businessData.brandName || 'Default'}`,
        adSetId,
        creativeId,
        'PAUSED'
      );

      // Save output
      await prisma.agentTask.update({
        where: { id: taskId },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          output: JSON.stringify({
            campaignId,
            adSetId,
            creativeId,
            adId,
            objective: strategy.objective,
            budget: strategy.budget.dailyAmount,
            conversionMethod,
            leadFormId: task.leadFormId || null
          })
        }
      });

      return {
        success: true,
        message: '🎉 Your Meta ad campaign is live (PAUSED)! Go to Facebook Ads Manager to review and activate it.',
        campaignId,
        adId,
        adSetId,
        creativeId
      };
    } catch (error: any) {
      console.error('[AgentService] Launch campaign error:', error);

      await prisma.agentTask.update({
        where: { id: taskId },
        data: {
          status: 'FAILED',
          errorMessage: error.message
        }
      });

      throw error;
    }
  }

  /**
   * Helper: Save generated creatives to database
   */
  private async saveCreatives(taskId: string, adCopy: any): Promise<void> {
    const creatives = [];

    // Headlines
    for (const headline of adCopy.headlines) {
      creatives.push({
        taskId,
        type: 'HEADLINE',
        content: headline,
        isSelected: false
      });
    }

    // Primary Texts
    for (const text of adCopy.primaryTexts) {
      creatives.push({
        taskId,
        type: 'PRIMARY_TEXT',
        content: text,
        isSelected: false
      });
    }

    // Descriptions
    for (const desc of adCopy.descriptions) {
      creatives.push({
        taskId,
        type: 'DESCRIPTION',
        content: desc,
        isSelected: false
      });
    }

    // Auto-select first variant of each type
    if (creatives.length > 0) {
      creatives[0].isSelected = true; // First headline
      creatives[adCopy.headlines.length].isSelected = true; // First primary text
      creatives[adCopy.headlines.length + adCopy.primaryTexts.length].isSelected = true; // First description
    }

    await prisma.generatedCreative.createMany({
      data: creatives
    });
  }

  /**
   * Helper: Map campaign objective to optimization goal
   */
  private getOptimizationGoal(objective: string): string {
    const mapping: Record<string, string> = {
      'OUTCOME_LEADS': 'LEAD_GENERATION',
      'OUTCOME_SALES': 'OFFSITE_CONVERSIONS',
      'OUTCOME_TRAFFIC': 'LINK_CLICKS',
      'OUTCOME_AWARENESS': 'REACH'
    };
    return mapping[objective] || 'LINK_CLICKS';
  }
}
