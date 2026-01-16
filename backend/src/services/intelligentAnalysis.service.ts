import OpenAI from 'openai';
import { ScraperService } from './scraper.service';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export type BusinessType = 'LOCAL' | 'GLOBAL';

interface IntelligentAnalysisInput {
  description: string;
  location?: string;
  website?: string;
}

interface LocationValidation {
  valid: boolean;
  error?: string;
  defaultLocation?: string;
  businessType: BusinessType;
}

interface BusinessAnalysis {
  success: boolean;
  source: 'intelligent_analysis';
  businessType: BusinessType;
  brandName: string;
  description: string;
  industry: string;
  products: string[];
  categories: string[];
  usps: string[];
  targetAudience: {
    ageMin: number;
    ageMax: number;
    gender: 'all' | 'male' | 'female';
    interests: string[];
    description: string;
  };
  location: {
    type: 'country' | 'city' | 'region';
    name: string;
    detected: boolean; // true if extracted from description, false if default
  };
  languages: string[];
  visualStyle?: {
    imageUrls?: string[];
    logoUrl?: string;
  };
  contact?: {
    website?: string;
  };
  confidence: number; // 0-100
}

export class IntelligentAnalysisService {
  /**
   * Main analysis function - orchestrates the entire intelligent analysis
   */
  static async analyze(input: IntelligentAnalysisInput): Promise<BusinessAnalysis> {
    try {
      // Step 1: Validate location requirement
      const validation = await this.validateLocationRequirement(
        input.description,
        input.location
      );

      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // Step 2: Extract business data using GPT-4
      const extractedData = await this.extractBusinessData(
        input.description,
        validation.defaultLocation!,
        validation.businessType
      );

      // Step 3: Optionally scrape website for images (parallel, non-blocking)
      let visualData = undefined;
      if (input.website) {
        try {
          const scraped = await ScraperService.scrapeWebsite(input.website);
          if (scraped.success && scraped.visualStyle) {
            visualData = scraped.visualStyle;
          }
        } catch (error) {
          console.log('[IntelligentAnalysis] Website scraping failed, continuing without images');
        }
      }

      return {
        ...extractedData,
        businessType: validation.businessType,
        visualStyle: visualData,
        contact: input.website ? { website: input.website } : undefined,
      };
    } catch (error: any) {
      console.error('[IntelligentAnalysis] Analysis error:', error);
      throw error;
    }
  }

  /**
   * Detect if business is LOCAL (needs physical presence) or GLOBAL (online/shipping)
   */
  static async detectBusinessType(description: string): Promise<{ businessType: BusinessType; confidence: number }> {
    const lower = description.toLowerCase();

    // Strong local indicators
    const localKeywords = [
      'gym', 'fitness center', 'fitness studio', 'yoga studio',
      'dentist', 'dental clinic', 'clinic', 'hospital', 'doctor', 'medical center',
      'salon', 'beauty salon', 'spa', 'barber', 'barbershop',
      'restaurant', 'cafe', 'coffee shop', 'eatery', 'food truck',
      'hotel', 'resort', 'guest house', 'accommodation',
      'store', 'shop', 'boutique', 'showroom', 'retail store',
      'real estate', 'property', 'apartment', 'flat',
      'coaching center', 'tuition', 'training center', 'institute', 'academy',
      'pharmacy', 'medical store', 'laundry', 'dry clean',
      'repair', 'service center', 'workshop', 'garage',
      'pet clinic', 'vet', 'veterinary',
      'physiotherapy', 'physiotherapist', 'chiropractor',
      'dance studio', 'music school', 'art studio',
      'preschool', 'daycare', 'playschool',
      'local', 'near you', 'visit us', 'walk in', 'come to'
    ];

    // Strong global/online indicators
    const globalKeywords = [
      'online', 'ecommerce', 'e-commerce', 'online store',
      'shipping', 'delivery all india', 'pan india', 'nationwide',
      'saas', 'software', 'app', 'application', 'platform',
      'course', 'online course', 'digital course', 'video course',
      'digital', 'ebook', 'pdf', 'download',
      'consulting', 'consultant', 'freelance', 'remote',
      'virtual', 'online service', 'cloud',
      'subscription', 'membership',
      'deliver', 'ship', 'courier', 'all india'
    ];

    // Check for explicit global indicators first
    const hasGlobalKeyword = globalKeywords.some(kw => lower.includes(kw));
    if (hasGlobalKeyword) {
      return { businessType: 'GLOBAL', confidence: 90 };
    }

    // Check for local indicators
    const hasLocalKeyword = localKeywords.some(kw => lower.includes(kw));
    if (hasLocalKeyword) {
      return { businessType: 'LOCAL', confidence: 85 };
    }

    // If ambiguous, use GPT-4 to decide
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        temperature: 0.3,
        messages: [{
          role: 'system',
          content: `You are a business type classifier. Determine if a business requires customers to physically visit a location (LOCAL) or if they can sell/serve customers remotely online (GLOBAL).

LOCAL businesses: Gyms, clinics, restaurants, salons, retail stores, coaching centers (with physical classes), real estate agencies, repair shops, etc.

GLOBAL businesses: E-commerce, online courses, SaaS, digital products, consulting services, food delivery, courier services, etc.

Respond with ONLY a JSON object: {"businessType": "LOCAL" or "GLOBAL", "confidence": 0-100, "reasoning": "brief explanation"}

IMPORTANT: If description mentions a city/location but also says "online" or "delivery", it's GLOBAL. E.g., "Bakery in Mumbai with all-India delivery" = GLOBAL.`
        }, {
          role: 'user',
          content: `Business description: "${description}"`
        }],
        response_format: { type: 'json_object' }
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      console.log('[IntelligentAnalysis] GPT-4 classification:', result);

      return {
        businessType: result.businessType === 'LOCAL' ? 'LOCAL' : 'GLOBAL',
        confidence: result.confidence || 70
      };
    } catch (error) {
      console.error('[IntelligentAnalysis] GPT-4 classification failed, defaulting to LOCAL (safer)');
      // Default to LOCAL to be safe (better to ask for location than waste budget)
      return { businessType: 'LOCAL', confidence: 50 };
    }
  }

  /**
   * Validate if location is required based on business type
   */
  static async validateLocationRequirement(
    description: string,
    location: string | undefined
  ): Promise<LocationValidation> {
    // Detect business type
    const { businessType, confidence } = await this.detectBusinessType(description);

    // Try to extract location from description itself
    const locationInDescription = this.extractLocationFromText(description);

    // CASE 1: Local business WITHOUT location in field AND WITHOUT location in description
    if (businessType === 'LOCAL' && !location && !locationInDescription) {
      return {
        valid: false,
        businessType,
        error: "⚠️ Wait! You run a local business. Please specify your city so we don't waste your money targeting people who can't visit you."
      };
    }

    // CASE 2: Local business WITH location in field
    if (businessType === 'LOCAL' && location) {
      return {
        valid: true,
        businessType,
        defaultLocation: location
      };
    }

    // CASE 3: Local business WITH location detected in description
    if (businessType === 'LOCAL' && locationInDescription) {
      return {
        valid: true,
        businessType,
        defaultLocation: locationInDescription
      };
    }

    // CASE 4: Global business WITHOUT explicit location = Default to India
    if (businessType === 'GLOBAL' && !location) {
      return {
        valid: true,
        businessType,
        defaultLocation: 'India'
      };
    }

    // CASE 5: Global business WITH location = Use their specified location
    if (businessType === 'GLOBAL' && location) {
      return {
        valid: true,
        businessType,
        defaultLocation: location
      };
    }

    // Fallback (shouldn't reach here)
    return {
      valid: true,
      businessType,
      defaultLocation: location || 'India'
    };
  }

  /**
   * Extract location mentions from description text
   */
  static extractLocationFromText(description: string): string | null {
    // Common Indian cities
    const cities = [
      'Mumbai', 'Delhi', 'Bangalore', 'Bengaluru', 'Hyderabad', 'Ahmedabad',
      'Chennai', 'Kolkata', 'Pune', 'Jaipur', 'Surat', 'Lucknow',
      'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Bhopal', 'Visakhapatnam',
      'Pimpri-Chinchwad', 'Patna', 'Vadodara', 'Ghaziabad', 'Ludhiana',
      'Agra', 'Nashik', 'Faridabad', 'Meerut', 'Rajkot', 'Kalyan-Dombivali',
      'Vasai-Virar', 'Varanasi', 'Srinagar', 'Aurangabad', 'Dhanbad',
      'Amritsar', 'Navi Mumbai', 'Allahabad', 'Ranchi', 'Howrah', 'Coimbatore',
      'Jabalpur', 'Gwalior', 'Vijayawada', 'Jodhpur', 'Madurai', 'Raipur',
      'Kota', 'Chandigarh', 'Guwahati', 'Goa', 'Noida', 'Gurugram', 'Gurgaon'
    ];

    const lower = description.toLowerCase();

    for (const city of cities) {
      if (lower.includes(city.toLowerCase())) {
        return city;
      }
    }

    return null;
  }

  /**
   * Extract comprehensive business data using GPT-4
   */
  static async extractBusinessData(
    description: string,
    location: string,
    businessType: BusinessType
  ): Promise<BusinessAnalysis> {
    try {
      const prompt = `You are an expert business analyst. Extract ALL relevant marketing details from this business description.

BUSINESS DESCRIPTION:
"${description}"

DETECTED LOCATION: ${location}
BUSINESS TYPE: ${businessType}

YOUR TASK:
Extract and infer the following information intelligently:

1. **Brand Name**: Extract the business name. If not explicitly mentioned, create a descriptive name based on the business.

2. **Industry**: Classify into ONE of these: Ecommerce, Services, Education, Healthcare, Real Estate, Restaurants, Fitness, Beauty, Travel, Events, Finance, Legal, Technology, Consulting, Other

3. **Products/Services**: List 3-5 main offerings. Be specific.

4. **Categories**: Business categories (e.g., "Food & Beverage", "Health & Wellness")

5. **USPs (Unique Selling Points)**: Extract or infer 3-4 unique benefits. Look for words like "best", "only", "first", "fastest", "cheapest", "premium", "certified", "expert", discounts, guarantees.

6. **Target Audience**: Intelligently infer:
   - Age range (use context clues: "students"=18-24, "professionals"=25-45, "seniors"=55+)
   - Gender ("all" unless specifically gendered like "bridal" or "men's grooming")
   - Interests (10-15 relevant Facebook interests)
   - Description (one sentence about ideal customer)

7. **Languages**: Infer from location and context. Mumbai/Bangalore/Hyderabad = Hindi + English. Chennai = Tamil + English. Default = Hindi + English.

8. **Description**: Create a clean 2-sentence summary of what the business offers.

9. **Confidence**: Rate your confidence in this analysis (0-100). Lower if information is vague.

BE INTELLIGENT about implicit information:
- "busy professionals" → Age 25-45, interests: Career, Business, Productivity
- "students" → Age 18-24, interests: Education, Study, College
- "luxury" → High-income audience, premium interests
- "affordable" / "budget" → Price-conscious audience
- "women" / "ladies" → Female audience
- "kids" / "children" → Parents as decision-makers (25-40)

OUTPUT FORMAT (Valid JSON only):
{
  "success": true,
  "source": "intelligent_analysis",
  "brandName": "Extracted or inferred name",
  "description": "Clean 2-sentence description",
  "industry": "One of the listed industries",
  "products": ["Product 1", "Product 2", "Product 3"],
  "categories": ["Category 1", "Category 2"],
  "usps": ["USP 1", "USP 2", "USP 3", "USP 4"],
  "targetAudience": {
    "ageMin": 25,
    "ageMax": 45,
    "gender": "all",
    "interests": ["Interest 1", "Interest 2", "...", "Interest 10"],
    "description": "One sentence about ideal customer"
  },
  "location": {
    "type": "city",
    "name": "${location}",
    "detected": ${this.extractLocationFromText(description) ? 'true' : 'false'}
  },
  "languages": ["Hindi", "English"],
  "confidence": 85
}`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        temperature: 0.7,
        messages: [{
          role: 'system',
          content: 'You are a business intelligence analyst specializing in marketing data extraction. Always respond with valid JSON.'
        }, {
          role: 'user',
          content: prompt
        }],
        response_format: { type: 'json_object' }
      });

      const extracted = JSON.parse(response.choices[0].message.content || '{}');
      console.log('[IntelligentAnalysis] Extracted data:', JSON.stringify(extracted, null, 2));

      // Validate and return
      return {
        success: true,
        source: 'intelligent_analysis',
        businessType,
        brandName: extracted.brandName || 'Your Business',
        description: extracted.description || description,
        industry: extracted.industry || 'Other',
        products: extracted.products || [],
        categories: extracted.categories || [],
        usps: extracted.usps || [],
        targetAudience: extracted.targetAudience || {
          ageMin: 18,
          ageMax: 65,
          gender: 'all',
          interests: [],
          description: 'General audience'
        },
        location: extracted.location || {
          type: location === 'India' ? 'country' : 'city',
          name: location,
          detected: false
        },
        languages: extracted.languages || ['Hindi', 'English'],
        confidence: extracted.confidence || 70
      };
    } catch (error: any) {
      console.error('[IntelligentAnalysis] GPT-4 extraction failed:', error);
      throw new Error('Failed to analyze business description. Please try again or provide more details.');
    }
  }
}
