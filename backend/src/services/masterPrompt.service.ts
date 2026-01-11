import OpenAI from 'openai';
import { ScraperService } from './scraper.service';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export interface CampaignStrategy {
  objective: 'OUTCOME_LEADS' | 'OUTCOME_SALES' | 'OUTCOME_TRAFFIC' | 'OUTCOME_AWARENESS';
  targeting: {
    ageMin: number;
    ageMax: number;
    interestKeywords: string[]; // Will be used to search Facebook API
    location: {
      isLocal: boolean;
      cityName?: string;
      radius?: number; // in km
    };
  };
  budget: {
    dailyAmount: number; // in INR
    currency: 'INR';
    reasoning: string;
  };
  placements: 'automatic'; // Always automatic (Facebook + Instagram)
  bidStrategy: 'LOWEST_COST_WITHOUT_CAP'; // Best practice
  adCopy: {
    headlines: string[]; // 3 variants (max 40 chars)
    primaryTexts: string[]; // 3 variants (max 125 chars)
    descriptions: string[]; // 3 variants (max 30 chars)
    cta: string; // SIGN_UP, LEARN_MORE, WHATSAPP_MESSAGE, etc.
  };
  reasoning: string; // Why these choices were made
}

const MASTER_PROMPT_SYSTEM = `You are an expert Meta Ads strategist and consultant specializing in the Indian market.

Your job is to analyze a business and output a COMPLETE, ready-to-execute Meta Ads campaign strategy in a single JSON object.

**Your Analysis Process:**
1. Understand the business niche, products/services, and target market
2. Determine the optimal campaign objective (LEADS, SALES, TRAFFIC, AWARENESS)
3. Calculate appropriate daily budget based on business size and goal (₹500-₹2,500/day)
4. Identify 3-5 precise interest keywords for targeting (will be used to search Facebook API)
5. Detect if business is local (needs radius targeting) or national
6. Generate 3 DISTINCT variants each for: Headlines (40 chars), Primary Text (125 chars), Descriptions (30 chars)
7. Select the most effective CTA based on conversion method

**Conversion Method Awareness:**
- If conversion method is "lead_form": Ad will use Meta Instant Form (captures leads without website)
  - Copy should focus on IMMEDIATE ACTION: "Get Free Quote", "Book Consultation", "Request Demo"
  - Keep it short, direct, benefit-oriented
  - CTAs MUST be: "SIGN_UP", "CONTACT_US", "GET_QUOTE" only
- If conversion method is "website": Ad will send users to client's website
  - Copy can build curiosity: "Learn More", "Discover How", "See Why"
  - Can be slightly longer to pre-qualify clicks
  - CTAs can be: "LEARN_MORE", "SEE_MORE", or conversion-focused ones

**Campaign Objective Rules:**
- "Leads", "Inquiries", "Registrations", "Sign-ups" → OUTCOME_LEADS
- "Sales", "Purchases", "Buy", "Orders" → OUTCOME_SALES
- "Website Traffic", "Clicks", "Views" → OUTCOME_TRAFFIC
- "Brand Awareness", "Reach" → OUTCOME_AWARENESS

**Budget Rules:**
- Small/Local Business (coaching, salon, restaurant): ₹500-₹1,000/day
- Medium Business (ecommerce, services): ₹1,000-₹1,500/day
- Large Business (SaaS, enterprise): ₹1,500-₹2,500/day
- Factor in: competition level, product price point, target audience size

**Targeting Rules:**
- **Interest Keywords**: Be SPECIFIC. Use industry terms, competitor brands, behaviors.
  - Good: "CBSE Board Examination", "Parenting", "Mathematics Education"
  - Bad: "Education", "Students", "School"
- **Age Range**: Match typical customer age (25-55 for B2B, 18-35 for Gen-Z products, 35-55 for parenting)
- **Local Businesses**: Detect if business serves local area only (salon, restaurant, coaching center)
  - If local: Set isLocal=true, extract cityName, set radius=15-25km
  - If national/online: Set isLocal=false

**Ad Copy Rules:**
- **Indian Context**: Use ₹ symbol, Hindi-English mix if appropriate, local references
- **Structure**: Pain Point → Solution → Benefit → CTA
- **Tone**: Match business type (professional for B2B, friendly for B2C, urgent for offers)
- **3 DISTINCT Variants**: Don't just rephrase. Change angle/hook entirely.
  - Variant 1: Pain-focused ("Struggling with X?")
  - Variant 2: Benefit-focused ("Get Y in Z days")
  - Variant 3: Social proof/Urgency ("Join 1000+ users")
- **Character Limits (ABSOLUTE MAXIMUM - NO EXCEPTIONS)**: 
  - Headlines: MAX 40 characters (including spaces, emojis count as 2)
  - Primary Text: MAX 125 characters (including spaces, emojis count as 2)
  - Descriptions: MAX 30 characters (including spaces, emojis count as 2)
  - CRITICAL: Count EVERY character. If you go over, the ad will be REJECTED.

**CTA Rules (CRITICAL - Must Match Conversion Method):**
- For LEAD FORMS → "SIGN_UP", "CONTACT_US", "GET_QUOTE" ONLY
- For WEBSITE + Sales → "SHOP_NOW", "BUY_NOW", "ORDER_NOW"
- For WEBSITE + WhatsApp → "WHATSAPP_MESSAGE"
- For WEBSITE + Traffic → "LEARN_MORE", "SEE_MORE"

**Output Format (strict JSON):**
\`\`\`json
{
  "objective": "OUTCOME_LEADS",
  "targeting": {
    "ageMin": 35,
    "ageMax": 55,
    "interestKeywords": ["CBSE Board Examination", "Parenting", "Mathematics Education", "Board examination preparation", "Academic tutoring"],
    "location": {
      "isLocal": true,
      "cityName": "Mumbai",
      "radius": 20
    }
  },
  "budget": {
    "dailyAmount": 800,
    "currency": "INR",
    "reasoning": "Local coaching center with avg ₹15,000 course fee. Budget supports 50-60 leads/month at ₹400-500 CPL."
  },
  "placements": "automatic",
  "bidStrategy": "LOWEST_COST_WITHOUT_CAP",
  "adCopy": {
    "headlines": [
      "10th Maths Scored 95%? Join Our Batch! 📚",
      "Admissions Open: Proven Coaching Method",
      "Your Child's 10th Success Starts Here"
    ],
    "primaryTexts": [
      "Worried about your child's 10th Maths marks? 📉 Our proven methodology ensures success. Batch starts Monday. Limited seats!",
      "Join 500+ students who scored 90%+ in 10th Maths. Expert teachers, small batches, guaranteed results. Enroll now! 🎓",
      "10th Board Exams in 6 months? Don't panic. Our structured coaching program builds confidence & clarity. Book free demo today!"
    ],
    "descriptions": [
      "Admissions Open - Book Demo 📞",
      "Limited Seats Available",
      "90%+ Success Rate Guaranteed"
    ],
    "cta": "SIGN_UP"
  },
  "reasoning": "Local coaching center targeting parents of 10th grade students in Mumbai. Lead generation objective with WhatsApp/phone follow-up. Budget optimized for local market competition. Copy emphasizes results (95%, 90%+) and urgency (limited seats, batch starts Monday). Parent-focused pain points (worry, panic) with solution (proven method, expert teachers)."
}
\`\`\`

**CRITICAL:** Your output must be VALID JSON only. No markdown, no explanations outside the JSON object.`;

export class MasterPromptService {
  /**
   * Generate complete campaign strategy from scraped business data
   * This is the "Master Prompt" that replaces 3 separate OpenAI calls
   */
  static async generateCampaignStrategy(
    businessData: any,
    userGoal?: string,
    conversionMethod: 'lead_form' | 'website' = 'lead_form'
  ): Promise<CampaignStrategy> {
    try {
      console.log('[MasterPrompt] Generating campaign strategy...');
      console.log('[MasterPrompt] Conversion method:', conversionMethod);

      // Prepare business context for OpenAI
      const businessContext = this.prepareBusinessContext(businessData, userGoal, conversionMethod);

      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        temperature: 0.7,
        max_tokens: 2000,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: MASTER_PROMPT_SYSTEM },
          {
            role: 'user',
            content: `Analyze this business and generate a complete Meta Ads campaign strategy:

${businessContext}

Output: A complete JSON campaign strategy following the system instructions.`
          }
        ]
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error('Empty response from OpenAI');
      }

      const strategy: CampaignStrategy = JSON.parse(content);

      // Validate the response
      this.validateStrategy(strategy);

      console.log(`[MasterPrompt] Strategy generated successfully for: ${businessData.brandName || 'Unknown'}`);
      return strategy;
    } catch (error: any) {
      console.error('[MasterPrompt] Error generating strategy:', error.message);
      
      // Sanitize error messages - don't expose OpenAI/API details to frontend
      let userMessage = 'Failed to generate campaign strategy';
      
      if (error.status === 429 || error.message?.includes('Rate limit') || error.message?.includes('429')) {
        userMessage = 'AI service is temporarily busy. Please wait 30 seconds and try again.';
      } else if (error.message?.includes('timeout') || error.message?.includes('timed out')) {
        userMessage = 'Request timeout. Please try again.';
      } else if (error.message?.includes('Invalid API key') || error.message?.includes('authentication')) {
        userMessage = 'Service configuration error. Please contact support.';
      }
      
      throw new Error(userMessage);
    }
  }

  /**
   * Prepare business context from scraped data
   */
  private static prepareBusinessContext(
    businessData: any, 
    userGoal?: string,
    conversionMethod: 'lead_form' | 'website' = 'lead_form'
  ): string {
    let context = '';

    // Conversion Method (Critical for AI)
    context += `**Conversion Method:** ${conversionMethod === 'lead_form' ? 'META INSTANT FORM (Lead Generation)' : 'WEBSITE (Send to Client Website)'}\n`;
    context += `**Important:** ${conversionMethod === 'lead_form' 
      ? 'Ad will capture leads directly without website. Use action-oriented CTAs like SIGN_UP, CONTACT_US, GET_QUOTE only.' 
      : 'Ad will send users to client website. Can use curiosity-driven or conversion CTAs.'}\n\n`;

    // Brand & Description
    if (businessData.brandName) {
      context += `**Brand Name:** ${businessData.brandName}\n`;
    }
    if (businessData.description) {
      context += `**Business Description:** ${businessData.description}\n`;
    }

    // Products/Services
    if (businessData.products && businessData.products.length > 0) {
      context += `**Products/Services:** ${businessData.products.slice(0, 5).join(', ')}\n`;
    }

    // USPs
    if (businessData.usps && businessData.usps.length > 0) {
      context += `**Unique Selling Points:** ${businessData.usps.slice(0, 3).join(' | ')}\n`;
    }

    // Categories
    if (businessData.categories && businessData.categories.length > 0) {
      context += `**Categories:** ${businessData.categories.join(', ')}\n`;
    }

    // Contact (for location detection)
    if (businessData.contact?.location) {
      context += `**Location:** ${businessData.contact.location}\n`;
    }

    // User's goal (if provided)
    if (userGoal) {
      context += `**User's Goal:** ${userGoal}\n`;
    }

    // CTAs found on website
    if (businessData.cta && businessData.cta.length > 0) {
      context += `**CTAs on Website:** ${businessData.cta.slice(0, 3).join(', ')}\n`;
    }

    return context || 'Limited business information available. Please analyze based on brand name and any details provided.';
  }

  /**
   * Validate campaign strategy structure and content
   */
  private static validateStrategy(strategy: CampaignStrategy): void {
    // Check required fields
    if (!strategy.objective) {
      throw new Error('Missing objective in campaign strategy');
    }

    if (!strategy.targeting || !strategy.targeting.interestKeywords) {
      throw new Error('Missing targeting information');
    }

    if (!strategy.budget || !strategy.budget.dailyAmount) {
      throw new Error('Missing budget information');
    }

    if (!strategy.adCopy) {
      throw new Error('Missing ad copy');
    }

    // Validate ad copy character limits
    const { headlines, primaryTexts, descriptions } = strategy.adCopy;

    if (!headlines || headlines.length !== 3) {
      throw new Error('Must provide exactly 3 headline variants');
    }

    if (!primaryTexts || primaryTexts.length !== 3) {
      throw new Error('Must provide exactly 3 primary text variants');
    }

    if (!descriptions || descriptions.length !== 3) {
      throw new Error('Must provide exactly 3 description variants');
    }

    // Check and auto-trim character limits (GPT-5.2 can be verbose)
    headlines.forEach((h, i) => {
      if (h.length > 40) {
        const trimmed = h.substring(0, 37) + '...';
        console.warn(`[MasterPrompt] Headline ${i + 1} exceeds 40 chars, auto-trimmed: "${h}" → "${trimmed}"`);
        strategy.adCopy.headlines[i] = trimmed;
      }
    });

    primaryTexts.forEach((p, i) => {
      if (p.length > 125) {
        const trimmed = p.substring(0, 122) + '...';
        console.warn(`[MasterPrompt] Primary text ${i + 1} exceeds 125 chars, auto-trimmed: "${p}" → "${trimmed}"`);
        strategy.adCopy.primaryTexts[i] = trimmed;
      }
    });

    descriptions.forEach((d, i) => {
      if (d.length > 30) {
        const trimmed = d.substring(0, 27) + '...';
        console.warn(`[MasterPrompt] Description ${i + 1} exceeds 30 chars, auto-trimmed: "${d}" → "${trimmed}"`);
        strategy.adCopy.descriptions[i] = trimmed;
      }
    });

    // Validate budget range
    if (strategy.budget.dailyAmount < 100 || strategy.budget.dailyAmount > 10000) {
      console.warn(`[MasterPrompt] Budget outside recommended range: ₹${strategy.budget.dailyAmount}/day`);
    }

    // Validate age range
    if (strategy.targeting.ageMin < 13 || strategy.targeting.ageMax > 65) {
      console.warn(`[MasterPrompt] Age range unusual: ${strategy.targeting.ageMin}-${strategy.targeting.ageMax}`);
    }
  }

  /**
   * Regenerate specific ad copy elements (if user wants variants)
   */
  static async regenerateAdCopy(
    businessData: any,
    objective: string,
    copyType: 'headlines' | 'primaryTexts' | 'descriptions'
  ): Promise<string[]> {
    try {
      const maxChars = {
        headlines: 40,
        primaryTexts: 125,
        descriptions: 30
      }[copyType];

      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        temperature: 0.8,
        max_tokens: 2000,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: `Generate 3 DISTINCT ${copyType} variants for a Meta ad. Max ${maxChars} characters each. Return JSON: {"variants": ["...", "...", "..."]}`
          },
          {
            role: 'user',
            content: `Business: ${businessData.brandName || 'Unknown'}\nDescription: ${businessData.description || ''}\nObjective: ${objective}\n\nGenerate 3 new ${copyType} variants.`
          }
        ]
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error('Empty response');
      }

      const result = JSON.parse(content);
      return result.variants || [];
    } catch (error: any) {
      console.error(`[MasterPrompt] Error regenerating ${copyType}:`, error.message);
      throw error;
    }
  }
}
