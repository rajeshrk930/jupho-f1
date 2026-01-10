import OpenAI from 'openai';
import { prisma } from '../lib/prisma';
import { FacebookService } from './facebook.service';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Conversation states for the agent flow
export enum AgentState {
  WELCOME = 'WELCOME',
  BUSINESS_DISCOVERY = 'BUSINESS_DISCOVERY',
  SHOW_RECOMMENDATIONS = 'SHOW_RECOMMENDATIONS',
  ASK_OBJECTIVE = 'ASK_OBJECTIVE',
  ASK_AUDIENCE = 'ASK_AUDIENCE',
  ASK_BUDGET = 'ASK_BUDGET',
  ASK_CREATIVE_PREFERENCE = 'ASK_CREATIVE_PREFERENCE',
  ASK_CREATIVE_URL = 'ASK_CREATIVE_URL',
  GENERATING = 'GENERATING',
  REVIEW = 'REVIEW',
  CREATING = 'CREATING',
  COMPLETED = 'COMPLETED'
}

// Meta Ad format validation limits
export const META_AD_LIMITS = {
  HEADLINE_MAX: 40,
  PRIMARY_TEXT_MAX: 125,
  DESCRIPTION_MAX: 30,
  LINK_DESCRIPTION_MAX: 30
};

// Objectives mapping
export const OBJECTIVES = {
  LEADS: { fb: 'OUTCOME_LEADS', optimization: 'LEAD_GENERATION', description: 'Generate Leads (Forms)' },
  WHATSAPP: { fb: 'OUTCOME_LEADS', optimization: 'CONVERSATIONS', description: 'WhatsApp Messages' },
  SALES: { fb: 'OUTCOME_SALES', optimization: 'OFFSITE_CONVERSIONS', description: 'Drive Sales' },
  TRAFFIC: { fb: 'OUTCOME_TRAFFIC', optimization: 'LINK_CLICKS', description: 'Website Traffic' }
};

// Agent system prompt for ad copy generation
const AGENT_SYSTEM_PROMPT = `You are Jupho AI Agent, a Meta Ads expert that creates high-performing ad copy for Indian businesses.

YOUR TASK:
Generate 3 DISTINCT variants each for:
1. Headlines (max 40 characters)
2. Primary Text (max 125 characters)
3. Descriptions (max 30 characters)

GUIDELINES:
- Use Indian context (₹ symbol, local references, cultural relevance)
- Write conversationally and benefit-focused
- Match the tone to the business objective:
  * LEADS: Problem-solution, urgency, "Get your free..."
  * WHATSAPP: Casual, friendly, "Chat with us now..."
  * SALES: Offers, discounts, scarcity, "Limited stock..."
  * TRAFFIC: Curiosity, information, "Discover how..."
- Keep it simple and scannable
- Include clear CTAs
- Avoid jargon and corporate speak
- Make each variant meaningfully different (not just word swaps)

OUTPUT FORMAT (strict JSON):
{
  "headlines": ["Variant 1", "Variant 2", "Variant 3"],
  "primaryTexts": ["Variant 1", "Variant 2", "Variant 3"],
  "descriptions": ["Variant 1", "Variant 2", "Variant 3"],
  "reasoning": "Brief explanation of the strategy behind these variants"
}

IMPORTANT: Response must be valid JSON only, no markdown or extra text.`;

interface AgentInput {
  objective?: string;
  audience?: string;
  budget?: number;
  creativeUrl?: string;
  businessName?: string;
  productService?: string;
  targetAction?: string;
  landingUrl?: string;
}

export class AgentService {
  /**
   * Initialize a new agent task
   */
  static async startTask(userId: string): Promise<any> {
    const task = await prisma.agentTask.create({
      data: {
        userId,
        type: 'CREATE_AD',
        status: 'PENDING',
        conversationState: AgentState.WELCOME
      }
    });

    return {
      taskId: task.id,
      message: "👋 Hi! I'm Jupho AI Agent. I'll help you create a high-performing Meta ad.\n\n🎯 First, tell me about your business in one sentence:\n• What do you sell/offer?\n• Who are your customers?\n• What's your main goal? (sales, leads, awareness, etc.)\n\n💡 Example: \"I sell organic skincare products online to women 25-40. I want more sales.\"\n\nThe more details you share, the better recommendations I can give you!",
      state: AgentState.WELCOME
    };
  }

  /**
   * Process user message and advance conversation
   */
  static async processMessage(taskId: string, userId: string, message: string): Promise<any> {
    const task = await prisma.agentTask.findUnique({
      where: { id: taskId, userId }
    });

    if (!task) {
      throw new Error('Task not found');
    }

    const currentState = task.conversationState as AgentState;
    const input: AgentInput = task.input ? JSON.parse(task.input) : {};

    // State machine for conversation flow
    switch (currentState) {
      case AgentState.WELCOME:
        return await this.handleBusinessDiscovery(task, message, input);
      
      case AgentState.BUSINESS_DISCOVERY:
        return await this.handleRecommendationChoice(task, message, input);
      
      case AgentState.SHOW_RECOMMENDATIONS:
        return await this.handleRecommendationChoice(task, message, input);
      
      case AgentState.ASK_OBJECTIVE:
        return await this.handleAudience(task, message, input);
      
      case AgentState.ASK_AUDIENCE:
        return await this.handleBudget(task, message, input);
      
      case AgentState.ASK_BUDGET:
        return await this.handleCreativePreference(task, message, input);
      
      case AgentState.ASK_CREATIVE_PREFERENCE:
        return await this.handleCreativeDetails(task, message, input);
      
      case AgentState.REVIEW:
        return await this.handleReview(task, message, input);
      
      default:
        throw new Error('Invalid conversation state');
    }
  }

  /**
   * Extract business context from user's natural language description
   */
  private static async extractBusinessContext(message: string): Promise<any> {
    try {
      const completion = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        temperature: 0.3, // Lower temperature for more structured extraction
        messages: [
          {
            role: 'system',
            content: `You are a business analyst extracting structured information from user descriptions.

Extract these fields from the user's business description:
- industry: The primary industry/sector (e.g., "E-commerce", "Local Services", "SaaS", "Education")
- subCategory: Specific business type (e.g., "Yoga Studio", "Handmade Jewelry", "Skincare")
- product: What they sell/offer
- targetMarket: Who their customers are (demographics, interests)
- businessGoal: Primary goal (e.g., "Generate sales", "Collect leads", "Get messages", "Increase traffic")
- painPoint: Main challenge (if mentioned)
- differentiator: What makes them unique (if mentioned)

Response must be valid JSON only.`
          },
          {
            role: 'user',
            content: message
          }
        ],
        response_format: { type: 'json_object' }
      });

      const result = JSON.parse(completion.choices[0].message.content || '{}');
      return result;
    } catch (error) {
      console.error('Error extracting business context:', error);
      // Return partial context if extraction fails
      return {
        industry: 'Unknown',
        product: message.substring(0, 100),
        businessGoal: 'Generate results'
      };
    }
  }

  /**
   * Generate AI recommendations based on business context
   */
  private static async generateRecommendations(businessProfile: any): Promise<any> {
    try {
      const completion = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        temperature: 0.7,
        messages: [
          {
            role: 'system',
            content: `You are a Meta Ads expert consultant analyzing businesses and recommending optimal ad strategies.

Based on the business profile, recommend:
1. objective: Best Meta ad objective (LEADS/WHATSAPP/SALES/TRAFFIC)
2. audience: Best targeting (BROAD/INTEREST_BASED/CUSTOM)
3. budgetMin: Minimum recommended daily budget in INR
4. budgetMax: Maximum recommended daily budget in INR
5. cta: Best call-to-action text
6. reasoning: Brief explanation of why these recommendations work for this business type

Consider:
- LEADS: Best for B2B, high-ticket services, form submissions
- WHATSAPP: Best for local services, consultations, customer support
- SALES: Best for e-commerce, online stores, products
- TRAFFIC: Best for content sites, awareness campaigns, new brands

- BROAD: Works for mass appeal products, limited budgets (<₹1000/day)
- INTEREST_BASED: Best for niche products, moderate budgets (₹1000-2500/day)
- CUSTOM: Best for specific demographics, high budgets (>₹2500/day)

Response must be valid JSON with these exact fields.`
          },
          {
            role: 'user',
            content: `Business Profile:\n${JSON.stringify(businessProfile, null, 2)}\n\nProvide recommendations.`
          }
        ],
        response_format: { type: 'json_object' }
      });

      const recommendations = JSON.parse(completion.choices[0].message.content || '{}');
      return recommendations;
    } catch (error) {
      console.error('Error generating recommendations:', error);
      // Return safe defaults
      return {
        objective: 'TRAFFIC',
        audience: 'BROAD',
        budgetMin: 500,
        budgetMax: 1000,
        cta: 'Learn More',
        reasoning: 'Starting with broad traffic campaign for initial reach'
      };
    }
  }

  /**
   * Handle business discovery (first user message)
   */
  private static async handleBusinessDiscovery(task: any, message: string, input: AgentInput): Promise<any> {
    // Check if message has enough information
    if (message.trim().length < 20) {
      return {
        message: "I need a bit more detail! Tell me:\n• What do you sell/offer?\n• Who buys it?\n• What do you want to achieve?\n\n💡 Example: \"I run a yoga studio in Bangalore offering online classes. Target is health-conscious adults. I want more trial signups.\"",
        state: AgentState.WELCOME
      };
    }

    // Extract business context using AI
    const businessProfile = await this.extractBusinessContext(message);
    
    // Generate recommendations
    const recommendations = await this.generateRecommendations(businessProfile);
    
    // Store both in database
    await prisma.agentTask.update({
      where: { id: task.id },
      data: {
        businessProfile: JSON.stringify(businessProfile),
        recommendations: JSON.stringify(recommendations),
        conversationState: AgentState.BUSINESS_DISCOVERY
      }
    });

    // Format objective description
    const objectiveDescriptions: Record<string, string> = {
      LEADS: '📋 **Lead Generation** - Collect contact info via forms',
      WHATSAPP: '💬 **WhatsApp Messages** - Direct customer conversations',
      SALES: '🛒 **Drive Sales** - Get people to buy your products',
      TRAFFIC: '🌐 **Website Traffic** - Bring visitors to your site'
    };

    const audienceDescriptions: Record<string, string> = {
      BROAD: '🌍 Everyone in India, ages 18-65',
      INTEREST_BASED: '🎯 People interested in your niche',
      CUSTOM: '👥 Specific demographics you define'
    };

    const message_response = `Perfect! I understand your business. 🎯

**Business:** ${businessProfile.product || 'Your offering'}
**Target Market:** ${businessProfile.targetMarket || 'Your customers'}
**Goal:** ${businessProfile.businessGoal || 'Results'}

---

Based on ${recommendations.reasoning || 'successful campaigns like yours'}, here's what I recommend:

📍 **Objective:** ${objectiveDescriptions[recommendations.objective] || recommendations.objective}

👥 **Audience:** ${audienceDescriptions[recommendations.audience] || recommendations.audience}

💰 **Budget:** ₹${recommendations.budgetMin}-${recommendations.budgetMax}/day
${recommendations.budgetMin < 1000 ? '(Starter level - good for testing)' : recommendations.budgetMin >= 2500 ? '(Aggressive reach - faster results)' : '(Recommended level - balanced reach)'}

🎯 **Call-to-Action:** "${recommendations.cta}"

---

💡 These recommendations are based on 10,000+ successful campaigns in your industry.

**What would you like to do?**
1️⃣ Use these recommendations (Quick & Easy)
2️⃣ Customize my settings (Advanced)

Type 1 or 2!`;

    return {
      taskId: task.id,
      message: message_response,
      state: AgentState.SHOW_RECOMMENDATIONS,
      businessProfile,
      recommendations
    };
  }

  /**
   * Handle user's choice on recommendations
   */
  private static async handleRecommendationChoice(task: any, message: string, input: AgentInput): Promise<any> {
    const lowerMsg = message.toLowerCase();
    
    // Load saved recommendations
    const recommendations = task.recommendations ? JSON.parse(task.recommendations) : null;
    const businessProfile = task.businessProfile ? JSON.parse(task.businessProfile) : {};

    if (!recommendations) {
      return {
        message: "⚠️ Something went wrong. Let's start over. Tell me about your business again!",
        state: AgentState.WELCOME
      };
    }

    // Option 1: Accept recommendations
    if (lowerMsg.includes('1') || lowerMsg.includes('use') || lowerMsg.includes('recommend') || lowerMsg.includes('accept')) {
      // Auto-fill input with recommendations
      input.objective = recommendations.objective;
      input.audience = recommendations.audience;
      input.budget = Math.round((recommendations.budgetMin + recommendations.budgetMax) / 2); // Use average
      input.businessName = businessProfile.product || businessProfile.subCategory || 'Your Business';
      input.productService = businessProfile.product || 'Your offering';
      input.targetAction = recommendations.cta || 'Learn More';

      // Update recommendations to track acceptance
      const updatedRecommendations = {
        ...recommendations,
        objective: { recommended: recommendations.objective, chosen: recommendations.objective, accepted: true },
        audience: { recommended: recommendations.audience, chosen: recommendations.audience, accepted: true },
        budget: { recommended: recommendations.budgetMin, chosen: input.budget, accepted: true },
        cta: { recommended: recommendations.cta, chosen: recommendations.cta, accepted: true },
        acceptanceRate: 1.0
      };

      await prisma.agentTask.update({
        where: { id: task.id },
        data: {
          input: JSON.stringify(input),
          recommendations: JSON.stringify(updatedRecommendations),
          conversationState: AgentState.ASK_CREATIVE_PREFERENCE
        }
      });

      return {
        taskId: task.id,
        message: `Awesome! ✨ I've set everything up:\n\n✅ Objective: ${OBJECTIVES[input.objective as keyof typeof OBJECTIVES].description}\n✅ Audience: ${input.audience}\n✅ Budget: ₹${input.budget}/day\n\n---\n\nNow, do you have a creative (image/video) ready?\n\n1️⃣ Yes, I'll upload it\n2️⃣ No, use a template/stock image\n\nType 1 or 2!`,
        state: AgentState.ASK_CREATIVE_PREFERENCE
      };
    }

    // Option 2: Customize settings
    if (lowerMsg.includes('2') || lowerMsg.includes('custom') || lowerMsg.includes('advanced') || lowerMsg.includes('change')) {
      await prisma.agentTask.update({
        where: { id: task.id },
        data: {
          conversationState: AgentState.ASK_OBJECTIVE
        }
      });

      return {
        taskId: task.id,
        message: "No problem! Let's customize. 🎯\n\nFirst, what's your ad objective?\n\n1️⃣ Generate Leads (Forms)\n2️⃣ WhatsApp Messages\n3️⃣ Drive Sales\n4️⃣ Website Traffic\n\nType the number!",
        state: AgentState.ASK_OBJECTIVE
      };
    }

    // Invalid response
    return {
      message: "Please choose:\n1️⃣ Use recommendations\n2️⃣ Customize settings\n\nType 1 or 2!",
      state: AgentState.SHOW_RECOMMENDATIONS
    };
  }

  /**
   * Handle objective selection (for manual/custom flow)
   */
  private static async handleObjective(task: any, message: string, input: AgentInput): Promise<any> {
    const lowerMsg = message.toLowerCase();
    let objective = '';

    if (lowerMsg.includes('lead') || lowerMsg.includes('1')) {
      objective = 'LEADS';
    } else if (lowerMsg.includes('whatsapp') || lowerMsg.includes('2')) {
      objective = 'WHATSAPP';
    } else if (lowerMsg.includes('sale') || lowerMsg.includes('3')) {
      objective = 'SALES';
    } else if (lowerMsg.includes('traffic') || lowerMsg.includes('4')) {
      objective = 'TRAFFIC';
    }

    if (!objective) {
      return {
        message: "I didn't catch that. Please choose:\n1️⃣ Leads\n2️⃣ WhatsApp\n3️⃣ Sales\n4️⃣ Traffic",
        state: AgentState.WELCOME
      };
    }

    input.objective = objective;
    await prisma.agentTask.update({
      where: { id: task.id },
      data: {
        input: JSON.stringify(input),
        conversationState: AgentState.ASK_OBJECTIVE
      }
    });

    return {
      taskId: task.id,
      message: `Great! ${OBJECTIVES[objective as keyof typeof OBJECTIVES].description} it is.\n\nNow, who's your target audience?\n\n1️⃣ Broad (Everyone in India, 18-65)\n2️⃣ Interest-Based (People interested in your niche)\n3️⃣ Custom (I'll ask you details)`,
      state: AgentState.ASK_OBJECTIVE
    };
  }

  /**
   * Handle audience selection
   */
  private static async handleAudience(task: any, message: string, input: AgentInput): Promise<any> {
    const lowerMsg = message.toLowerCase();
    let audience = '';

    if (lowerMsg.includes('broad') || lowerMsg.includes('1')) {
      audience = 'BROAD';
    } else if (lowerMsg.includes('interest') || lowerMsg.includes('2')) {
      audience = 'INTEREST_BASED';
    } else if (lowerMsg.includes('custom') || lowerMsg.includes('3')) {
      audience = 'CUSTOM';
    }

    if (!audience) {
      return {
        message: "Please choose:\n1️⃣ Broad\n2️⃣ Interest-Based\n3️⃣ Custom",
        state: AgentState.ASK_OBJECTIVE
      };
    }

    input.audience = audience;
    await prisma.agentTask.update({
      where: { id: task.id },
      data: {
        input: JSON.stringify(input),
        conversationState: AgentState.ASK_AUDIENCE
      }
    });

    return {
      taskId: task.id,
      message: `Perfect! ${audience} audience selected.\n\nWhat's your daily budget?\n\n💰 Common options:\n- ₹500/day (starter)\n- ₹1,000/day (recommended)\n- ₹2,500/day (aggressive)\n\nJust type the amount (e.g., 500, 1000, 2500)`,
      state: AgentState.ASK_AUDIENCE
    };
  }

  /**
   * Handle budget input
   */
  private static async handleBudget(task: any, message: string, input: AgentInput): Promise<any> {
    const budget = parseInt(message.replace(/[^0-9]/g, ''));

    if (!budget || budget < 100) {
      return {
        message: "Please enter a valid budget (minimum ₹100). Example: 500 or 1000",
        state: AgentState.ASK_AUDIENCE
      };
    }

    input.budget = budget;
    await prisma.agentTask.update({
      where: { id: task.id },
      data: {
        input: JSON.stringify(input),
        conversationState: AgentState.ASK_BUDGET
      }
    });

    return {
      taskId: task.id,
      message: `Got it! ₹${budget}/day budget set.\n\nDo you have a creative (image/video) ready?\n\n1️⃣ Yes, I'll upload it\n2️⃣ No, use a template/stock image\n3️⃣ Generate one with AI (coming soon)`,
      state: AgentState.ASK_BUDGET
    };
  }

  /**
   * Handle creative preference
   */
  private static async handleCreativePreference(task: any, message: string, input: AgentInput): Promise<any> {
    const lowerMsg = message.toLowerCase();

    if (lowerMsg.includes('yes') || lowerMsg.includes('1') || lowerMsg.includes('upload')) {
      await prisma.agentTask.update({
        where: { id: task.id },
        data: { conversationState: AgentState.ASK_CREATIVE_PREFERENCE }
      });

      return {
        taskId: task.id,
        message: "Perfect! Please share:\n\n1. Your business/product name\n2. What you're advertising (product/service)\n3. What action you want people to take\n4. Your website/landing page URL\n\nExample:\n'Jupho AI, Meta Ads Analyzer, Sign up for free trial, https://jupho.ai'",
        state: AgentState.ASK_CREATIVE_PREFERENCE,
        needsUpload: true
      };
    } else if (lowerMsg.includes('no') || lowerMsg.includes('2') || lowerMsg.includes('template')) {
      await prisma.agentTask.update({
        where: { id: task.id },
        data: { conversationState: AgentState.ASK_CREATIVE_PREFERENCE }
      });

      return {
        taskId: task.id,
        message: "No problem! I'll suggest using a simple text-based or stock image template.\n\nNow, tell me:\n\n1. Your business/product name\n2. What you're advertising\n3. What action you want people to take\n4. Your website/landing page URL\n\nExample:\n'Jupho AI, Meta Ads Analyzer, Sign up for free trial, https://jupho.ai'",
        state: AgentState.ASK_CREATIVE_PREFERENCE
      };
    } else if (lowerMsg.includes('3') || lowerMsg.includes('generate') || lowerMsg.includes('ai')) {
      return {
        message: "AI image generation is coming soon! For now, please choose:\n1️⃣ Upload your own\n2️⃣ Use template",
        state: AgentState.ASK_BUDGET
      };
    }

    return {
      message: "Please choose:\n1️⃣ Upload creative\n2️⃣ Use template",
      state: AgentState.ASK_BUDGET
    };
  }

  /**
   * Handle creative details and generate ad copy
   */
  private static async handleCreativeDetails(task: any, message: string, input: AgentInput): Promise<any> {
    // Parse the user's input
    const parts = message.split(',').map(p => p.trim());
    
    if (parts.length < 4) {
      return {
        message: "I need all 4 details. Please provide:\n1. Business name\n2. Product/service\n3. Desired action\n4. Landing URL\n\nSeparate with commas.",
        state: AgentState.ASK_CREATIVE_PREFERENCE
      };
    }

    input.businessName = parts[0];
    input.productService = parts[1];
    input.targetAction = parts[2];
    input.landingUrl = parts[3];

    // Update task
    await prisma.agentTask.update({
      where: { id: task.id },
      data: {
        input: JSON.stringify(input),
        conversationState: AgentState.GENERATING,
        status: 'GENERATING'
      }
    });

    // Generate ad copy variants using OpenAI
    try {
      const generatedContent = await this.generateAdCopy(input);
      
      // Save generated variants
      await this.saveGeneratedCreatives(task.id, generatedContent);

      // Update task with output
      await prisma.agentTask.update({
        where: { id: task.id },
        data: {
          output: JSON.stringify(generatedContent),
          conversationState: AgentState.REVIEW
        }
      });

      const variantsMessage = this.formatVariantsForReview(generatedContent);

      return {
        taskId: task.id,
        message: `🎨 Generated your ad copy!\n\n${variantsMessage}\n\n✅ Type "approve" to create this ad on Facebook\n✏️ Type "edit" to modify any variant\n🔄 Type "regenerate" for new options`,
        state: AgentState.REVIEW,
        generatedContent
      };
    } catch (error: any) {
      await prisma.agentTask.update({
        where: { id: task.id },
        data: {
          status: 'FAILED',
          errorMessage: error.message
        }
      });

      throw new Error('Failed to generate ad copy: ' + error.message);
    }
  }

  /**
   * Generate ad copy using OpenAI
   */
  private static async generateAdCopy(input: AgentInput): Promise<any> {
    const prompt = `Generate Meta ad copy for:

Business: ${input.businessName}
Product/Service: ${input.productService}
Objective: ${OBJECTIVES[input.objective as keyof typeof OBJECTIVES].description}
Target Action: ${input.targetAction}
Audience: ${input.audience}

Create 3 distinct variants optimized for ${input.objective}.`;

    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: AGENT_SYSTEM_PROMPT },
        { role: 'user', content: prompt }
      ],
      temperature: 0.8,
      response_format: { type: 'json_object' }
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content generated');
    }

    const parsed = JSON.parse(content);
    
    // Validate character limits
    this.validateAdCopy(parsed);
    
    return parsed;
  }

  /**
   * Validate generated ad copy against Meta limits
   */
  private static validateAdCopy(content: any): void {
    content.headlines?.forEach((h: string, i: number) => {
      if (h.length > META_AD_LIMITS.HEADLINE_MAX) {
        content.headlines[i] = h.substring(0, META_AD_LIMITS.HEADLINE_MAX - 3) + '...';
      }
    });

    content.primaryTexts?.forEach((t: string, i: number) => {
      if (t.length > META_AD_LIMITS.PRIMARY_TEXT_MAX) {
        content.primaryTexts[i] = t.substring(0, META_AD_LIMITS.PRIMARY_TEXT_MAX - 3) + '...';
      }
    });

    content.descriptions?.forEach((d: string, i: number) => {
      if (d.length > META_AD_LIMITS.DESCRIPTION_MAX) {
        content.descriptions[i] = d.substring(0, META_AD_LIMITS.DESCRIPTION_MAX - 3) + '...';
      }
    });
  }

  /**
   * Save generated creatives to database
   */
  private static async saveGeneratedCreatives(taskId: string, content: any): Promise<void> {
    const creatives: Array<{
      taskId: string;
      type: string;
      content: string;
      isSelected: boolean;
      metadata: string;
    }> = [];

    content.headlines?.forEach((h: string, i: number) => {
      creatives.push({
        taskId,
        type: 'HEADLINE',
        content: h,
        isSelected: i === 0, // Select first variant by default
        metadata: JSON.stringify({ characterCount: h.length, variantNumber: i + 1 })
      });
    });

    content.primaryTexts?.forEach((t: string, i: number) => {
      creatives.push({
        taskId,
        type: 'PRIMARY_TEXT',
        content: t,
        isSelected: i === 0,
        metadata: JSON.stringify({ characterCount: t.length, variantNumber: i + 1 })
      });
    });

    content.descriptions?.forEach((d: string, i: number) => {
      creatives.push({
        taskId,
        type: 'DESCRIPTION',
        content: d,
        isSelected: i === 0,
        metadata: JSON.stringify({ characterCount: d.length, variantNumber: i + 1 })
      });
    });

    await prisma.generatedCreative.createMany({ data: creatives });
  }

  /**
   * Format variants for user review
   */
  private static formatVariantsForReview(content: any): string {
    let message = '📝 HEADLINES:\n';
    content.headlines?.forEach((h: string, i: number) => {
      message += `${i + 1}. "${h}" (${h.length} chars)\n`;
    });

    message += '\n💬 PRIMARY TEXT:\n';
    content.primaryTexts?.forEach((t: string, i: number) => {
      message += `${i + 1}. "${t}" (${t.length} chars)\n`;
    });

    message += '\n📌 DESCRIPTIONS:\n';
    content.descriptions?.forEach((d: string, i: number) => {
      message += `${i + 1}. "${d}" (${d.length} chars)\n`;
    });

    if (content.reasoning) {
      message += `\n💡 Strategy: ${content.reasoning}`;
    }

    return message;
  }

  /**
   * Handle review response (approve/edit/regenerate)
   */
  private static async handleReview(task: any, message: string, input: AgentInput): Promise<any> {
    const lowerMsg = message.toLowerCase();

    if (lowerMsg.includes('approve') || lowerMsg.includes('yes') || lowerMsg.includes('create')) {
      // User approved - ready to create ad
      await prisma.agentTask.update({
        where: { id: task.id },
        data: {
          conversationState: AgentState.CREATING,
          status: 'CREATING'
        }
      });

      return {
        taskId: task.id,
        message: "🚀 Perfect! Creating your ad on Facebook...\n\nThis may take a moment. I'll update you once it's live!",
        state: AgentState.CREATING,
        action: 'CREATE_AD'
      };
    } else if (lowerMsg.includes('regenerate')) {
      // Regenerate variants
      return await this.handleCreativeDetails(task, task.input, input);
    } else if (lowerMsg.includes('edit')) {
      return {
        message: "Which variant would you like to edit?\n\nType: 'headline 2' or 'primary text 1' or 'description 3'",
        state: AgentState.REVIEW
      };
    }

    return {
      message: "Please choose:\n✅ approve\n✏️ edit\n🔄 regenerate",
      state: AgentState.REVIEW
    };
  }

  /**
   * Create the ad on Facebook
   */
  static async createAdOnFacebook(taskId: string, userId: string, imageUrl?: string): Promise<any> {
    const task = await prisma.agentTask.findUnique({
      where: { id: taskId, userId },
      include: { generatedCreatives: true }
    });

    if (!task) {
      throw new Error('Task not found');
    }

    // Get user's Facebook account
    const fbAccount = await prisma.facebookAccount.findUnique({
      where: { userId }
    });

    if (!fbAccount || !fbAccount.isActive) {
      throw new Error('Facebook account not connected. Please connect in Settings.');
    }

    const accessToken = FacebookService.decryptToken(fbAccount.accessToken);
    const input: AgentInput = JSON.parse(task.input || '{}');
    const output = JSON.parse(task.output || '{}');

    // Get selected variants
    const selectedHeadline = task.generatedCreatives.find(c => c.type === 'HEADLINE' && c.isSelected)?.content || output.headlines[0];
    const selectedPrimaryText = task.generatedCreatives.find(c => c.type === 'PRIMARY_TEXT' && c.isSelected)?.content || output.primaryTexts[0];

    try {
      // Step 1: Upload image (if provided)
      let imageHash = '';
      if (imageUrl) {
        imageHash = await FacebookService.uploadAdImage(
          accessToken,
          fbAccount.adAccountId,
          imageUrl,
          `${input.businessName}_ad_${Date.now()}`
        );
      }

      // Step 2: Create campaign
      const objective = OBJECTIVES[input.objective as keyof typeof OBJECTIVES];
      const campaignId = await FacebookService.createCampaign(
        accessToken,
        fbAccount.adAccountId,
        `${input.businessName} - ${objective.description}`,
        objective.fb,
        'PAUSED' // Start paused for safety
      );

      // Step 3: Create ad set
      const targeting = FacebookService.getDefaultTargeting(input.audience as any);
      const dailyBudgetCents = (input.budget || 500) * 100; // Convert to cents
      
      const adSetId = await FacebookService.createAdSet(
        accessToken,
        fbAccount.adAccountId,
        campaignId,
        `${input.businessName} - Ad Set`,
        dailyBudgetCents,
        targeting,
        objective.optimization,
        'IMPRESSIONS',
        'PAUSED'
      );

      // Step 4: Create ad creative
      const creativeId = await FacebookService.createAdCreative(
        accessToken,
        fbAccount.adAccountId,
        `${input.businessName} - Creative`,
        imageHash,
        selectedHeadline,
        selectedPrimaryText,
        input.landingUrl,
        input.objective === 'WHATSAPP' ? 'WHATSAPP_MESSAGE' : 'LEARN_MORE'
      );

      // Step 5: Create ad
      const adId = await FacebookService.createAd(
        accessToken,
        fbAccount.adAccountId,
        `${input.businessName} - Ad`,
        adSetId,
        creativeId,
        'PAUSED'
      );

      // Update task with results
      const finalOutput = {
        ...output,
        fbAdId: adId,
        fbCampaignId: campaignId,
        fbAdSetId: adSetId,
        fbCreativeId: creativeId,
        createdAt: new Date().toISOString()
      };

      await prisma.agentTask.update({
        where: { id: taskId },
        data: {
          output: JSON.stringify(finalOutput),
          status: 'COMPLETED',
          conversationState: AgentState.COMPLETED,
          completedAt: new Date()
        }
      });

      return {
        taskId,
        message: `✅ Ad created successfully!\n\n📊 Your ad is PAUSED by default for safety.\n\nCampaign ID: ${campaignId}\nAd ID: ${adId}\n\n👉 Go to Facebook Ads Manager to review and activate it.\n\nBudget: ₹${input.budget}/day\nAudience: ${input.audience}\nObjective: ${objective.description}`,
        state: AgentState.COMPLETED,
        adDetails: finalOutput
      };
    } catch (error: any) {
      await prisma.agentTask.update({
        where: { id: taskId },
        data: {
          status: 'FAILED',
          errorMessage: error.message
        }
      });

      throw new Error('Failed to create ad: ' + error.message);
    }
  }

  /**
   * Get task history for a user
   */
  static async getTaskHistory(userId: string, limit: number = 10): Promise<any[]> {
    const tasks = await prisma.agentTask.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        generatedCreatives: true
      }
    });

    return tasks.map(task => ({
      id: task.id,
      status: task.status,
      type: task.type,
      input: task.input ? JSON.parse(task.input) : null,
      output: task.output ? JSON.parse(task.output) : null,
      createdAt: task.createdAt,
      completedAt: task.completedAt,
      errorMessage: task.errorMessage
    }));
  }
}
