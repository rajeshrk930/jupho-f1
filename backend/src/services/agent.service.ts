import OpenAI from 'openai';
import { prisma } from '../lib/prisma';
import { FacebookService } from './facebook.service';
import { ScraperService } from './scraper.service';
import { MasterPromptService, CampaignStrategy } from './masterPrompt.service';
import { WebhookService } from './webhook.service';
import { mapFacebookError, extractFacebookError, isFacebookError } from '../utils/facebookErrorMapper';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export class AgentService {
  /**
   * Get privacy policy URL with fallback logic
   * Priority: User Website > Jupho Hosted > Facebook Page
   */
  private getPrivacyPolicyUrl(
    userWebsite: string | undefined,
    taskId: string,
    fbPageId?: string
  ): string {
    // Priority 1: User has website with /privacy path
    if (userWebsite && this.isValidUrl(userWebsite)) {
      // Clean URL and add /privacy
      const cleanUrl = userWebsite.replace(/\/$/, ''); // Remove trailing slash
      return `${cleanUrl}/privacy`;
    }
    
    // Priority 2: Jupho hosted privacy policy
    const frontendUrl = process.env.FRONTEND_URL || 'https://jupho.com';
    return `${frontendUrl}/privacy/${taskId}`;
  }

  /**
   * Validate URL format
   */
  private isValidUrl(url: string): boolean {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  }
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
    conversionMethod: 'lead_form' | 'website' = 'lead_form',
    userObjective?: 'TRAFFIC' | 'LEADS' | 'SALES',
    userBudget?: number
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

      // 🔥 FETCH HISTORICAL PERFORMANCE DATA (DATA-DRIVEN AI)
      let historicalPerformance = null;
      try {
        const fbAccount = await prisma.facebookAccount.findUnique({
          where: { userId }
        });

        if (fbAccount) {
          const accessToken = FacebookService.decryptToken(fbAccount.accessToken);
          console.log('[AgentService] 📊 Fetching historical ad performance for data-driven recommendations...');
          
          historicalPerformance = await FacebookService.getAdPerformanceMetrics(
            accessToken,
            fbAccount.adAccountId
          );

          if (historicalPerformance) {
            console.log('[AgentService] ✅ Historical performance data retrieved:', {
              totalAds: historicalPerformance.totalAds,
              avgCPM: historicalPerformance.avgCPM,
              avgCTR: historicalPerformance.avgCTR,
              avgCPA: historicalPerformance.avgCPA
            });
          } else {
            console.log('[AgentService] ℹ️ No historical ad data found - generating strategy from scratch');
          }
        }
      } catch (error) {
        console.error('[AgentService] ⚠️ Failed to fetch historical performance (non-fatal):', error);
        // Non-fatal error - continue without historical data
      }

      // Generate strategy using Master Prompt (NOW WITH DATA!)
      const strategy: CampaignStrategy = await MasterPromptService.generateCampaignStrategy(
        businessData,
        userGoal,
        conversionMethod,
        userObjective,
        userBudget,
        historicalPerformance,
        userId
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
    imageUrl?: string,
    providedLeadFormId?: string
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
      const conversionMethod = task.conversionMethod || 'lead_form';

      // 🔍 LOG: Campaign creation starting with conversion method
      console.log('\n========================================');
      console.log('[AgentService] 🚀 Starting Campaign Creation');
      console.log('[AgentService] Task ID:', taskId);
      console.log('[AgentService] Conversion Method:', conversionMethod);
      console.log('[AgentService] Provided Lead Form ID:', providedLeadFormId || 'None');
      console.log('[AgentService] Brand:', businessData.brandName || 'Unknown');
      console.log('========================================\n');

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
        // Construct full public URL for Railway deployment
        const baseUrl = process.env.RAILWAY_PUBLIC_DOMAIN 
          ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
          : process.env.BACKEND_URL || 'https://api.jupho.io';
        
        const fullImageUrl = imageUrl.startsWith('http') 
          ? imageUrl 
          : `${baseUrl}${imageUrl}`;
        
        console.log('[AgentService] Uploading image to Facebook:', fullImageUrl);
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
        strategy.objective
        // Status defaults to ACTIVE in FacebookService
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
        targeting
      );

      // 6. Create Ad Creative (SPLIT LOGIC: Lead Form vs Website)
      if (!imageHash) {
        throw new Error('Image upload failed - no image hash returned');
      }

      // Use conversionMethod declared at the top of the function
      let creativeId: string;
      let leadFormId: string | null = null;

      if (conversionMethod === 'lead_form') {
        // LEAD FORM FLOW: Use provided form OR create new one
        console.log('\n🎯 [AgentService] === LEAD FORM CONVERSION METHOD ===');
        
        if (providedLeadFormId) {
          // USE EXISTING FORM
          console.log('[AgentService] Using provided Lead Form ID:', providedLeadFormId);
          leadFormId = providedLeadFormId;
        } else {
          // CREATE NEW DEFAULT FORM
          console.log('[AgentService] Creating new Meta Instant Lead Form...');
          
          const pageId = process.env.FACEBOOK_PAGE_ID;
          if (!pageId) {
            throw new Error('❌ FACEBOOK_PAGE_ID not configured in environment variables');
          }

          console.log('[AgentService] Facebook Page ID:', pageId);
          console.log('[AgentService] Lead Form Name:', `${businessData.brandName || 'Business'} - Lead Form`);
          console.log('[AgentService] Intro Text:', selectedPrimaryText.substring(0, 50) + '...');

          try {
            // Get privacy policy URL with fallback
            const privacyPolicyUrl = this.getPrivacyPolicyUrl(
              businessData.contact?.website,
              taskId,
              pageId
            );

            console.log('[AgentService] Using Privacy Policy URL:', privacyPolicyUrl);

            // Create Lead Form
            leadFormId = await FacebookService.createLeadForm(
              accessToken,
              pageId,
              `${businessData.brandName || 'Business'} - Lead Form`,
              selectedPrimaryText, // Use primary text as intro
              privacyPolicyUrl,
              'Thank you! We\'ll contact you soon.',
              undefined // Use default questions (Name, Phone, Email)
            );

            if (!leadFormId) {
              throw new Error('❌ Lead Form creation returned empty/null ID');
            }

            console.log('\n✅ [AgentService] Lead Form Created Successfully!');
            console.log('[AgentService] Lead Form ID:', leadFormId);
            console.log('[AgentService] Check in Facebook Ads Manager → Forms Library\n');

            // Save lead form ID and privacy policy URL
            await prisma.agentTask.update({
              where: { id: taskId },
              data: { 
                leadFormId,
                privacyPolicyUrl
              }
            });
          } catch (leadFormError: any) {
            console.error('\n❌ [AgentService] LEAD FORM CREATION FAILED');
            console.error('[AgentService] Error:', leadFormError.message);
            console.error('[AgentService] Full Error:', JSON.stringify(leadFormError.response?.data || leadFormError, null, 2));
            throw new Error(`Lead Form creation failed: ${leadFormError.message}`);
          }
        }

        // Create creative with lead form (for both existing and new forms)
        console.log('[AgentService] Creating Ad Creative with Lead Form...');
        creativeId = await FacebookService.createAdCreativeWithLeadForm(
          accessToken,
          fbAccount.adAccountId,
          `Creative - ${businessData.brandName || 'Default'}`,
          imageHash,
          selectedHeadline,
          selectedPrimaryText,
          leadFormId
        );

        console.log('✅ [AgentService] Lead Form Creative Created:', creativeId);
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
      console.log('\n📢 [AgentService] Creating Final Ad...');
      const adId = await FacebookService.createAd(
        accessToken,
        fbAccount.adAccountId,
        `Ad - ${businessData.brandName || 'Default'}`,
        adSetId,
        creativeId
        // Status defaults to ACTIVE in FacebookService
      );

      console.log('✅ [AgentService] Ad Created:', adId);

      // 8. Log Final Summary
      console.log('\n========================================');
      console.log('🎉 [AgentService] CAMPAIGN CREATED SUCCESSFULLY!');
      console.log('========================================');
      console.log('Campaign ID:', campaignId);
      console.log('Ad Set ID:', adSetId);
      console.log('Creative ID:', creativeId);
      console.log('Ad ID:', adId);
      console.log('Conversion Method:', conversionMethod);
      if (leadFormId) {
        console.log('✅ Lead Form ID:', leadFormId);
        console.log('👉 Check Facebook Ads Manager → Forms Library');
      }
      console.log('========================================\n');

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

      // Fire webhook: campaign.completed
      const businessProfile = task.businessProfile ? JSON.parse(task.businessProfile) : {};
      WebhookService.fireWebhooks(userId, 'campaign.completed', {
        taskId,
        campaignId,
        adId,
        adSetId,
        creativeId,
        brandName: businessProfile.brandName || 'Unknown',
        objective: strategy.objective,
        budget: strategy.budget.dailyAmount,
        conversionMethod,
        leadFormId: task.leadFormId || null,
        completedAt: new Date().toISOString(),
      }).catch(err => console.error('[Webhooks] Error firing campaign.completed:', err));

      return {
        success: true,
        message: '🎉 Your Meta ad campaign is now live and active! It will start running after Facebook approval (5-30 minutes).',
        campaignId,
        adId,
        adSetId,
        creativeId
      };
    } catch (error: any) {
      console.error('[AgentService] Launch campaign error:', error);

      // Check if it's a Facebook API error
      if (isFacebookError(error)) {
        const fbError = extractFacebookError(error);
        if (fbError) {
          const mappedError = mapFacebookError(fbError);
          
          console.error('[AgentService] Facebook API Error:', {
            type: mappedError.type,
            message: mappedError.userMessage,
            originalCode: fbError.code,
            originalMessage: fbError.message
          });

          // Update task with structured error
          await prisma.agentTask.update({
            where: { id: taskId },
            data: {
              status: 'FAILED',
              errorMessage: `${mappedError.userMessage} ${mappedError.actionRequired}`
            }
          });

          // Throw structured error for frontend
          const structuredError: any = new Error(mappedError.userMessage);
          structuredError.type = mappedError.type;
          structuredError.action = mappedError.actionRequired;
          structuredError.helpUrl = mappedError.helpUrl;
          structuredError.retryable = mappedError.retryable;
          throw structuredError;
        }
      }

      // Generic error handling
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
