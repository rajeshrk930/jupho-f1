import axios from 'axios';
import crypto from 'crypto';
import FormData from 'form-data';

export interface FacebookAdMetrics {
  impressions: string;
  clicks: string;
  spend: string;
  conversions?: string;
  cpm: string;
  ctr: string;
  cpc?: string;
  campaign_name?: string;
  adset_name?: string;
  ad_name?: string;
}

export interface FacebookAd {
  id: string;
  name: string;
  status: string;
  creative?: {
    id: string;
    name?: string;
    image_url?: string;
    video_id?: string;
    body?: string;
    title?: string;
    thumbnail_url?: string;
  };
  insights?: {
    data: FacebookAdMetrics[];
  };
}

export interface FacebookAdAccount {
  id: string;
  name: string;
  account_status: number;
  currency: string;
}

export class FacebookService {
  private static API_VERSION = 'v19.0';
  private static BASE_URL = `https://graph.facebook.com/${this.API_VERSION}`;
  
  /**
   * Normalize ad account ID to ensure proper format
   * Removes act_ prefix if present to avoid double-prefixing
   */
  private static normalizeAdAccountId(adAccountId: string): string {
    return adAccountId.replace(/^act_/, '');
  }
  
  /**
   * Encrypt access token for secure storage
   * Generates random IV for each encryption and prepends it to ciphertext
   */
  static encryptToken(token: string): string {
    const algorithm = 'aes-256-cbc';
    const key = Buffer.from(process.env.ENCRYPTION_KEY || '12345678901234567890123456789012', 'utf8').slice(0, 32);
    const iv = crypto.randomBytes(16); // Generate random IV for each encryption
    
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(token, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Prepend IV to encrypted data (IV is not secret, just needs to be unique)
    return iv.toString('hex') + ':' + encrypted;
  }
  
  /**
   * Decrypt access token from storage
   * Extracts IV from prepended data before decryption
   */
  static decryptToken(encrypted: string): string {
    const algorithm = 'aes-256-cbc';
    const key = Buffer.from(process.env.ENCRYPTION_KEY || '12345678901234567890123456789012', 'utf8').slice(0, 32);
    
    // Split IV and encrypted data
    const parts = encrypted.split(':');
    if (parts.length !== 2) {
      throw new Error('Invalid encrypted token format');
    }
    
    const iv = Buffer.from(parts[0], 'hex');
    const encryptedData = parts[1];
    
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
  
  /**
   * Exchange OAuth code for long-lived access token
   */
  static async exchangeCodeForToken(code: string): Promise<string> {
    try {
      const response = await axios.get(`${this.BASE_URL}/oauth/access_token`, {
        params: {
          client_id: process.env.FACEBOOK_APP_ID,
          client_secret: process.env.FACEBOOK_APP_SECRET,
          redirect_uri: process.env.FACEBOOK_REDIRECT_URI,
          code
        }
      });
      return response.data.access_token;
    } catch (error: any) {
      console.error('Facebook token exchange error:', error.response?.data || error.message);
      throw new Error('Failed to exchange Facebook code for token');
    }
  }
  
  /**
   * Get user's Facebook ad accounts
   */
  static async getAdAccounts(accessToken: string): Promise<FacebookAdAccount[]> {
    try {
      const response = await axios.get(`${this.BASE_URL}/me/adaccounts`, {
        params: {
          access_token: accessToken,
          fields: 'id,name,account_status,currency'
        }
      });
      return response.data.data;
    } catch (error: any) {
      console.error('Facebook get ad accounts error:', error.response?.data || error.message);
      throw new Error('Failed to fetch Facebook ad accounts');
    }
  }
  
  /**
   * Get user info from Facebook
   */
  static async getUserInfo(accessToken: string): Promise<{ id: string; name: string; email?: string }> {
    try {
      const response = await axios.get(`${this.BASE_URL}/me`, {
        params: {
          access_token: accessToken,
          fields: 'id,name,email'
        }
      });
      return response.data;
    } catch (error: any) {
      console.error('Facebook get user info error:', error.response?.data || error.message);
      throw new Error('Failed to fetch Facebook user info');
    }
  }
  
  /**
   * Fetch ad creative metrics from Facebook Ads API
   */
  static async getAdCreativeMetrics(
    accessToken: string,
    adAccountId: string,
    adId: string
  ): Promise<FacebookAdMetrics> {
    try {
      const response = await axios.get(
        `${this.BASE_URL}/${adId}/insights`,
        {
          params: {
            access_token: accessToken,
            fields: 'impressions,clicks,spend,conversions,cpm,ctr,cpc,campaign_name,adset_name,ad_name',
            time_range: JSON.stringify({
              since: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              until: new Date().toISOString().split('T')[0]
            })
          }
        }
      );
      
      if (!response.data.data || response.data.data.length === 0) {
        throw new Error('No metrics found for this ad');
      }
      
      return response.data.data[0];
    } catch (error: any) {
      console.error('Facebook get ad metrics error:', error.response?.data || error.message);
      throw new Error('Failed to fetch ad metrics from Facebook');
    }
  }
  
  /**
   * Get all active ads from an ad account
   */
  static async getActiveAds(
    accessToken: string,
    adAccountId: string,
    limit: number = 50
  ): Promise<FacebookAd[]> {
    try {
      const response = await axios.get(
        `${this.BASE_URL}/${adAccountId}/ads`,
        {
          params: {
            access_token: accessToken,
            fields: 'id,name,status,creative{id,name,image_url,video_id,body,title,thumbnail_url},insights{impressions,clicks,spend,cpm,ctr,conversions}',
            filtering: JSON.stringify([{
              field: 'effective_status',
              operator: 'IN',
              value: ['ACTIVE', 'PAUSED']
            }]),
            time_range: JSON.stringify({
              since: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              until: new Date().toISOString().split('T')[0]
            }),
            limit
          }
        }
      );
      
      return response.data.data || [];
    } catch (error: any) {
      console.error('Facebook get active ads error:', error.response?.data || error.message);
      throw new Error('Failed to fetch active ads from Facebook');
    }
  }
  
  /**
   * Get ad creative details including images/videos
   */
  static async getAdCreative(
    accessToken: string,
    creativeId: string
  ): Promise<any> {
    try {
      const response = await axios.get(
        `${this.BASE_URL}/${creativeId}`,
        {
          params: {
            access_token: accessToken,
            fields: 'id,name,image_url,video_id,body,title,thumbnail_url,object_story_spec'
          }
        }
      );
      
      return response.data;
    } catch (error: any) {
      console.error('Facebook get creative error:', error.response?.data || error.message);
      throw new Error('Failed to fetch creative details from Facebook');
    }
  }
  
  /**
   * Verify if access token is still valid
   */
  static async verifyToken(accessToken: string): Promise<boolean> {
    try {
      const response = await axios.get(`${this.BASE_URL}/me`, {
        params: {
          access_token: accessToken,
          fields: 'id'
        }
      });
      return !!response.data.id;
    } catch (error) {
      return false;
    }
  }
  
  /**
   * Refresh long-lived token (Facebook tokens expire after 60 days)
   */
  static async refreshLongLivedToken(accessToken: string): Promise<string> {
    try {
      const response = await axios.get(`${this.BASE_URL}/oauth/access_token`, {
        params: {
          grant_type: 'fb_exchange_token',
          client_id: process.env.FACEBOOK_APP_ID,
          client_secret: process.env.FACEBOOK_APP_SECRET,
          fb_exchange_token: accessToken
        }
      });
      return response.data.access_token;
    } catch (error: any) {
      console.error('Facebook token refresh error:', error.response?.data || error.message);
      throw new Error('Failed to refresh Facebook access token');
    }
  }

  /**
   * Upload image to Facebook Ad Account
   */
  static async uploadAdImage(
    accessToken: string,
    adAccountId: string,
    imageUrl: string,
    imageName?: string
  ): Promise<string> {
    try {
      const name = imageName || 'ad_image';
      const cleanAccountId = this.normalizeAdAccountId(adAccountId);

      // Download and convert to base64 bytes; Facebook expects multipart form
      const imgResp = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      const imageBuffer = Buffer.from(imgResp.data);
      const base64Image = imageBuffer.toString('base64');

      const formData = new FormData();
      formData.append('access_token', accessToken);
      formData.append('name', name);
      formData.append('bytes', base64Image);

      const response = await axios.post(
        `${this.BASE_URL}/act_${cleanAccountId}/adimages`,
        formData,
        { headers: formData.getHeaders() }
      );

      const imagesObj = response.data?.images || {};
      const imageHash = imagesObj[name]?.hash || imagesObj[Object.keys(imagesObj)[0]]?.hash;
      if (!imageHash) {
        console.error('[Facebook] Image upload response missing hash:', response.data);
        throw new Error('Failed to get image hash from upload response');
      }

      console.log('[Facebook] Image uploaded successfully:', imageHash);
      return imageHash;
    } catch (error: any) {
      console.error('[Facebook] Image upload error:', error.response?.data || error.message);
      throw new Error(`Failed to upload image to Facebook: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Create a campaign
   */
  static async createCampaign(
    accessToken: string,
    adAccountId: string,
    name: string,
    objective: string, // 'OUTCOME_LEADS', 'OUTCOME_SALES', 'OUTCOME_TRAFFIC'
    status: string = 'PAUSED' // 'ACTIVE' or 'PAUSED'
  ): Promise<string> {
    try {
      const cleanAccountId = this.normalizeAdAccountId(adAccountId);
      
      const response = await axios.post(
        `${this.BASE_URL}/act_${cleanAccountId}/campaigns`,
        {
          name,
          objective,
          status,
          special_ad_categories: [], // Required for some verticals
          is_adset_budget_sharing_enabled: false,
          access_token: accessToken
        }
      );
      
      return response.data.id;
    } catch (error: any) {
      console.error('Facebook campaign creation error:', error.response?.data || error.message);
      throw new Error('Failed to create Facebook campaign');
    }
  }

  /**
   * Create an ad set (ad group)
   */
  static async createAdSet(
    accessToken: string,
    adAccountId: string,
    campaignId: string,
    name: string,
    dailyBudget: number,
    targeting: any
  ): Promise<string> {
    try {
      if (!process.env.FACEBOOK_PAGE_ID) {
        throw new Error('FACEBOOK_PAGE_ID is missing in .env file');
      }

      console.log(`[Facebook] Creating Ad Set linked to Page: ${process.env.FACEBOOK_PAGE_ID}`);

      // Ensure targeting is an object, not a string
      let finalTargeting = targeting;
      if (typeof targeting === 'string') {
        try { finalTargeting = JSON.parse(targeting); } catch (e) {}
      }

      // Force Advantage+ Settings
      const safeTargeting = {
        ...finalTargeting,
        geo_locations: { countries: ['IN'] },
        age_min: 18,
        age_max: 65,
        targeting_automation: {
          advantage_audience: 1 
        }
      };

      const response = await axios.post(
        `https://graph.facebook.com/v19.0/act_${adAccountId.replace('act_', '')}/adsets`,
        {
          name,
          campaign_id: campaignId,
          daily_budget: dailyBudget,
          billing_event: 'IMPRESSIONS',
          optimization_goal: 'LEAD_GENERATION',
          bid_strategy: 'LOWEST_COST_WITHOUT_CAP',
          destination_type: 'ON_AD',
          status: 'PAUSED',
          
          // ✅ FIX: Send BOTH as Plain Objects (No JSON.stringify anywhere)
          targeting: safeTargeting, 
          promoted_object: {
            page_id: process.env.FACEBOOK_PAGE_ID
          },

          access_token: accessToken
        }
      );
      
      console.log('[Facebook] Ad Set Created Successfully:', response.data.id);
      return response.data.id;
    } catch (error: any) {
      console.error('Ad Set Error:', error.response?.data || error.message);
      throw new Error(`Ad Set Failed: ${error.response?.data?.error?.message}`);
    }
  }

  /**
   * Create an ad creative
   */
  static async createAdCreative(
    accessToken: string,
    adAccountId: string,
    name: string,
    imageHash: string,
    headline: string,
    body: string,
    linkUrl?: string,
    callToActionType: string = 'LEARN_MORE'
  ): Promise<string> {
    try {
      const cleanAccountId = this.normalizeAdAccountId(adAccountId);

      const objectStorySpec: any = {
        page_id: process.env.FACEBOOK_PAGE_ID, // You'll need to add this
        link_data: {
          image_hash: imageHash,
          link: linkUrl || process.env.FACEBOOK_DEFAULT_LINK_URL,
          message: body,
          name: headline,
          call_to_action: {
            type: callToActionType
          }
        }
      };

      const response = await axios.post(
        `${this.BASE_URL}/act_${cleanAccountId}/adcreatives`,
        {
          name,
          object_story_spec: JSON.stringify(objectStorySpec),
          access_token: accessToken
        }
      );
      
      return response.data.id;
    } catch (error: any) {
      console.error('Facebook creative creation error:', error.response?.data || error.message);
      throw new Error('Failed to create Facebook ad creative');
    }
  }

  /**
   * Create an ad
   */
  static async createAd(
    accessToken: string,
    adAccountId: string,
    name: string,
    adSetId: string,
    creativeId: string,
    status: string = 'PAUSED'
  ): Promise<string> {
    try {
      console.log(`[DEBUG] 🚨 STOP! The Ad Account ID I am using is: act_${this.normalizeAdAccountId(adAccountId)}`);
      const cleanAccountId = this.normalizeAdAccountId(adAccountId);
      
      const response = await axios.post(
        `${this.BASE_URL}/act_${cleanAccountId}/ads`,
        {
          name,
          adset_id: adSetId,
          creative: JSON.stringify({ creative_id: creativeId }),
          status,
          access_token: accessToken
        }
      );
      
      return response.data.id;
    } catch (error: any) {
      console.error('Facebook ad creation error:', error.response?.data || error.message);
      throw new Error('Failed to create Facebook ad');
    }
  }

  /**
   * Create a Lead Generation Form (Meta Instant Form)
   * This form captures leads without sending users to a website
   */
  static async createLeadForm(
    accessToken: string,
    pageId: string,
    formName: string,
    introText: string,
    privacyPolicyUrl: string = 'https://jupho.io/privacy',
    thankYouMessage: string = 'Thank you! We\'ll contact you soon.',
    questions?: Array<{ type: string, label?: string }>
  ): Promise<string> {
    try {
      const rawTitle = formName || 'Lead Form';
      const safeTitle = rawTitle.length > 55 ? `${rawTitle.substring(0, 55)}...` : rawTitle;

      // Default questions: Name, Phone, Email
      const defaultQuestions = [
        { type: 'FULL_NAME' },
        { type: 'PHONE' },
        { type: 'EMAIL' }
      ];

      const formQuestions = questions || defaultQuestions;

      const response = await axios.post(
        `${this.BASE_URL}/${pageId}/leadgen_forms`,
        {
          name: `${safeTitle} - ${Date.now()}`,
          question_page_custom_headline: safeTitle,
          privacy_policy: {
            url: privacyPolicyUrl,
            link_text: 'Privacy Policy'
          },
          follow_up_action_url: privacyPolicyUrl, // Fallback URL
          questions: formQuestions,
          context_card: {
            title: safeTitle,
            style: 'PARAGRAPH_STYLE',
            content: [introText],
            button_text: 'Get Started'
          },
          thank_you_page: {
            title: 'You are all set!',
            body: thankYouMessage,
            button_text: 'View Website',
            button_type: 'VIEW_WEBSITE',
            website_url: 'https://jupho.io'
          },
          access_token: accessToken
        }
      );

      console.log('[Facebook] Lead form created:', response.data.id);
      return response.data.id; // Returns leadgen form ID
    } catch (error: any) {
      console.error('Facebook lead form creation error:', error.response?.data || error.message);
      throw new Error(`Failed to create lead form: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Create an ad creative with Lead Generation Form
   * Alternative to createAdCreative - uses leadgen_form instead of website link
   */
  static async createAdCreativeWithLeadForm(
    accessToken: string,
    adAccountId: string,
    name: string,
    imageHash: string,
    headline: string,
    body: string,
    leadFormId: string
  ): Promise<string> {
    try {
      const cleanAccountId = this.normalizeAdAccountId(adAccountId);
      
      const objectStorySpec: any = {
        page_id: process.env.FACEBOOK_PAGE_ID,
        link_data: {
          image_hash: imageHash,
          message: body,
          name: headline,
          link: 'https://jupho.io',
          call_to_action: {
            type: 'SIGN_UP',
            value: {
              lead_gen_form_id: leadFormId
            }
          }
        }
      };

      const response = await axios.post(
        `${this.BASE_URL}/act_${cleanAccountId}/adcreatives`,
        {
          name,
          object_story_spec: JSON.stringify(objectStorySpec),
          access_token: accessToken
        }
      );
      
      console.log('[Facebook] Lead form creative created:', response.data.id);
      return response.data.id;
    } catch (error: any) {
      console.error('Facebook lead form creative error:', error.response?.data || error.message);
      throw new Error(`Failed to create lead form creative: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Search for interest IDs dynamically using Facebook Marketing API
   * @param accessToken Facebook access token
   * @param keywords Array of interest keywords to search (e.g., ['Digital Marketing', 'SaaS'])
   * @param limit Maximum number of interests to return per keyword
   * @returns Array of interest objects with id and name
   */
  static async searchInterests(
    accessToken: string,
    keywords: string[],
    limit: number = 5
  ): Promise<Array<{ id: string; name: string; audience_size?: number }>> {
    try {
      const allInterests: Array<{ id: string; name: string; audience_size?: number }> = [];

      for (const keyword of keywords) {
        const response = await axios.get(
          `${this.BASE_URL}/search`,
          {
            params: {
              access_token: accessToken,
              type: 'adinterest',
              q: keyword,
              limit: limit
            }
          }
        );

        const interests = response.data.data || [];
        allInterests.push(...interests.map((i: any) => ({
          id: i.id,
          name: i.name,
          audience_size: i.audience_size
        })));
      }

      // Remove duplicates by ID
      const uniqueInterests = allInterests.filter(
        (interest, index, self) => 
          index === self.findIndex((t) => t.id === interest.id)
      );

      console.log(`[FacebookService] Found ${uniqueInterests.length} unique interests for keywords: ${keywords.join(', ')}`);
      return uniqueInterests.slice(0, limit * keywords.length);
    } catch (error: any) {
      console.error('Facebook interest search error:', error.response?.data || error.message);
      // Return empty array on error (fallback to broad targeting)
      return [];
    }
  }

  /**
   * Get default targeting for broad audience (India)
   * Updated to support dynamic interests and best practices
   */
  static getDefaultTargeting(
    audienceType: 'BROAD' | 'INTEREST_BASED' = 'BROAD',
    customInterests?: Array<{ id: string; name: string }>,
    cityKey?: string,
    radius?: number
  ) {
    const baseTargeting: any = {
      geo_locations: {
        countries: ['IN']
      },
      age_min: 25, // More targeted than 18-65
      age_max: 65, // Advantage+ requires max age >= 65
      publisher_platforms: ['facebook', 'instagram'], // Automatic placements
      facebook_positions: ['feed', 'story'], // Exclude right column
      instagram_positions: ['stream', 'story'],
      device_platforms: ['mobile', 'desktop']
    };

    // Add local radius targeting if city is provided (for local businesses)
    if (cityKey && radius) {
      baseTargeting.geo_locations = {
        countries: ['IN'],
        location_types: ['home', 'recent'],
        cities: [
          {
            key: cityKey,
            radius: radius,
            distance_unit: 'kilometer'
          }
        ]
      };
    }

    // Add interests if provided (dynamic from AI)
    if (audienceType === 'INTEREST_BASED' && customInterests && customInterests.length > 0) {
      baseTargeting.interests = customInterests;
    } else if (audienceType === 'INTEREST_BASED') {
      // Fallback to hardcoded interests
      baseTargeting.interests = [
        { id: '6003139266461', name: 'Online shopping' },
        { id: '6003020834693', name: 'Business' }
      ];
    }

    return baseTargeting;
  }
}
