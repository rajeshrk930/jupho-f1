import axios from 'axios';
import crypto from 'crypto';

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
      const formData = new FormData();
      
      // Fetch image as buffer if it's a URL
      const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      const imageBuffer = Buffer.from(imageResponse.data);
      
      const response = await axios.post(
        `${this.BASE_URL}/act_${adAccountId}/adimages`,
        {
          access_token: accessToken,
          bytes: imageBuffer.toString('base64'),
          name: imageName || 'ad_image'
        }
      );
      
      const imageHash = response.data.images?.[imageName || 'ad_image']?.hash;
      if (!imageHash) {
        throw new Error('Failed to get image hash from upload response');
      }
      
      return imageHash;
    } catch (error: any) {
      console.error('Facebook image upload error:', error.response?.data || error.message);
      throw new Error('Failed to upload image to Facebook');
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
      const response = await axios.post(
        `${this.BASE_URL}/act_${adAccountId}/campaigns`,
        {
          name,
          objective,
          status,
          special_ad_categories: [], // Required for some verticals
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
    dailyBudget: number, // in cents (e.g., 50000 = ₹500)
    targeting: any,
    optimizationGoal: string = 'LEAD_GENERATION',
    billingEvent: string = 'IMPRESSIONS',
    status: string = 'PAUSED'
  ): Promise<string> {
    try {
      const response = await axios.post(
        `${this.BASE_URL}/act_${adAccountId}/adsets`,
        {
          name,
          campaign_id: campaignId,
          daily_budget: dailyBudget,
          billing_event: billingEvent,
          optimization_goal: optimizationGoal,
          bid_amount: Math.floor(dailyBudget * 0.1), // Auto bid at 10% of daily budget
          targeting: JSON.stringify(targeting),
          status,
          access_token: accessToken
        }
      );
      
      return response.data.id;
    } catch (error: any) {
      console.error('Facebook ad set creation error:', error.response?.data || error.message);
      throw new Error('Failed to create Facebook ad set');
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
        `${this.BASE_URL}/act_${adAccountId}/adcreatives`,
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
      const response = await axios.post(
        `${this.BASE_URL}/act_${adAccountId}/ads`,
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
   * Get default targeting for broad audience (India)
   */
  static getDefaultTargeting(audienceType: 'BROAD' | 'INTEREST_BASED' = 'BROAD') {
    const baseTargeting = {
      geo_locations: {
        countries: ['IN']
      },
      age_min: 18,
      age_max: 65
    };

    if (audienceType === 'INTEREST_BASED') {
      return {
        ...baseTargeting,
        interests: [
          { id: '6003139266461', name: 'Online shopping' }, // Example interest ID
          { id: '6003020834693', name: 'Business' }
        ]
      };
    }

    return baseTargeting;
  }
}
