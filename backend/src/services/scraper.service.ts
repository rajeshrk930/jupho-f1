import puppeteer, { Browser, Page } from 'puppeteer';
import axios from 'axios';
import * as cheerio from 'cheerio';

interface ScrapedBusinessData {
  success: boolean;
  source: 'website' | 'instagram' | 'manual';
  brandName?: string;
  description?: string;
  products?: string[];
  categories?: string[];
  usps?: string[]; // Unique Selling Points
  visualStyle?: {
    primaryColors?: string[];
    logoUrl?: string;
    imageUrls?: string[];
  };
  contact?: {
    email?: string;
    phone?: string;
    location?: string;
    website?: string; // Original website URL
  };
  cta?: string[]; // Call-to-action texts found
  error?: string;
}

export class ScraperService {
  private static browser: Browser | null = null;

  /**
   * Initialize browser instance (reuse across requests)
   */
  private static async getBrowser(): Promise<Browser> {
    if (!this.browser || !this.browser.connected) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--disable-gpu',
        ],
      });
    }
    return this.browser;
  }

  /**
   * Main method: Scrape website URL
   * Fallback: Return success=false if scraping fails
   */
  static async scrapeWebsite(url: string): Promise<ScrapedBusinessData> {
    try {
      console.log(`[Scraper] Starting website scrape: ${url}`);

      // Validate URL
      const validatedUrl = this.validateAndNormalizeUrl(url);
      if (!validatedUrl) {
        return {
          success: false,
          source: 'website',
          error: 'Invalid URL format',
        };
      }

      // Try Puppeteer-based scraping (JavaScript-rendered sites)
      const browser = await this.getBrowser();
      const page = await browser.newPage();

      // Set user agent to avoid bot detection
      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      );

      await page.goto(validatedUrl, {
        waitUntil: 'domcontentloaded',
        timeout: 15000, // 15 second timeout
      });

      // Extract data - using explicit typing to avoid DOM type issues
      const scrapedData = await page.evaluate(() => {
        // @ts-ignore - document is available in browser context
        const data: any = {
          brandName: '',
          description: '',
          products: [],
          categories: [],
          usps: [],
          visualStyle: {
            primaryColors: [],
            logoUrl: '',
            imageUrls: [],
          },
          contact: {},
          cta: [],
        };

        // 1. Extract Brand Name
        // @ts-ignore
        const ogSiteName = document.querySelector('meta[property="og:site_name"]');
        // @ts-ignore
        const appName = document.querySelector('meta[name="application-name"]');
        // @ts-ignore
        const h1 = document.querySelector('h1');
        
        data.brandName =
          (ogSiteName?.getAttribute('content')) ||
          (appName?.getAttribute('content')) ||
          (h1?.textContent?.trim()) ||
          // @ts-ignore
          document.title.split('|')[0].trim();

        // 2. Extract Description
        // @ts-ignore
        const ogDesc = document.querySelector('meta[property="og:description"]');
        // @ts-ignore
        const metaDesc = document.querySelector('meta[name="description"]');
        // @ts-ignore
        const firstP = document.querySelector('p');
        
        data.description =
          (ogDesc?.getAttribute('content')) ||
          (metaDesc?.getAttribute('content')) ||
          (firstP?.textContent?.trim().substring(0, 500)) ||
          '';

        // 3. Extract Logo
        // @ts-ignore
        const ogImage = document.querySelector('meta[property="og:image"]');
        // @ts-ignore
        const icon = document.querySelector('link[rel="icon"]');
        // @ts-ignore
        const logoImg = document.querySelector('img[alt*="logo" i]');
        
        data.visualStyle.logoUrl =
          (ogImage?.getAttribute('content')) ||
          (icon?.getAttribute('href')) ||
          (logoImg?.getAttribute('src')) ||
          '';

        // 4. Extract Images (first 5)
        // @ts-ignore
        const imageElements = Array.from(document.querySelectorAll('img'));
        const images = imageElements
          .slice(0, 5)
          .map((img: any) => img.getAttribute('src'))
          .filter((src: any) => src && src.startsWith('http'));
        data.visualStyle.imageUrls = images;

        // 5. Extract CTAs (buttons, links)
        const ctaElements = Array.from(
          // @ts-ignore
          document.querySelectorAll('button, a[href*="contact"], a[href*="buy"], a[href*="shop"]')
        );
        data.cta = ctaElements
          .map((el: any) => el.textContent?.trim())
          .filter((text: any) => text && text.length < 50)
          .slice(0, 5);

        // 6. Extract Products (look for product listings)
        const productElements = Array.from(
          // @ts-ignore
          document.querySelectorAll('[class*="product"], [class*="item"], [class*="card"]')
        );
        data.products = productElements
          .map((el: any) => {
            const titleEl = el.querySelector('h2, h3, h4, .title');
            const title = titleEl?.textContent?.trim();
            return title;
          })
          .filter((title: any) => title && title.length > 5 && title.length < 100)
          .slice(0, 10);

        // 7. Extract USPs (benefit/feature keywords)
        // @ts-ignore
        const textContent = document.body.innerText;
        const uspKeywords = ['fast', 'free', 'easy', 'best', 'top', 'quality', 'affordable', 'trusted'];
        const foundUsps: string[] = [];
        uspKeywords.forEach((keyword: any) => {
          const regex = new RegExp(`(${keyword}[^.!?]{0,50}[.!?])`, 'gi');
          const matches = textContent.match(regex);
          if (matches) foundUsps.push(...matches.slice(0, 2));
        });
        data.usps = foundUsps.slice(0, 5);

        // 8. Extract Contact Info
        const emailMatch = textContent.match(/[\w.-]+@[\w.-]+\.\w+/);
        const phoneMatch = textContent.match(/(\+?\d{1,3}[\s-]?)?(\(?\d{3}\)?[\s-]?)?\d{3}[\s-]?\d{4}/);
        data.contact.email = emailMatch ? emailMatch[0] : '';
        data.contact.phone = phoneMatch ? phoneMatch[0] : '';
        data.contact.website = window.location.href; // Store original URL

        return data;
      });

      await page.close();

      console.log(`[Scraper] Successfully scraped: ${scrapedData.brandName || 'Unknown'}`);

      return {
        success: true,
        source: 'website',
        ...scrapedData,
      };
    } catch (error: any) {
      console.error('[Scraper] Website scraping failed:', error.message);
      return {
        success: false,
        source: 'website',
        error: error.message || 'Scraping failed',
      };
    }
  }

  /**
   * Scrape Instagram profile (username or URL)
   * Note: Instagram blocks scraping heavily, this is a best-effort attempt
   */
  static async scrapeInstagram(usernameOrUrl: string): Promise<ScrapedBusinessData> {
    try {
      console.log(`[Scraper] Starting Instagram scrape: ${usernameOrUrl}`);

      // Extract username from URL or use as-is
      const username = usernameOrUrl.includes('instagram.com')
        ? usernameOrUrl.split('/').find((part) => part && part !== 'instagram.com' && part !== 'www.instagram.com')
        : usernameOrUrl;

      if (!username) {
        return {
          success: false,
          source: 'instagram',
          error: 'Invalid Instagram username',
        };
      }

      // Try to fetch public Instagram data via web scraping
      const instagramUrl = `https://www.instagram.com/${username}/`;
      const browser = await this.getBrowser();
      const page = await browser.newPage();

      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      );

      await page.goto(instagramUrl, {
        waitUntil: 'domcontentloaded',
        timeout: 15000,
      });

      // Wait for content to load
      await page.waitForSelector('meta[property="og:description"]', { timeout: 5000 }).catch(() => {});

      const scrapedData = await page.evaluate(() => {
        // @ts-ignore - document is available in browser context
        const data: any = {
          brandName: '',
          description: '',
          visualStyle: {
            imageUrls: [],
          },
        };

        // Extract from meta tags
        // @ts-ignore
        const ogTitleEl = document.querySelector('meta[property="og:title"]');
        // @ts-ignore
        const ogDescEl = document.querySelector('meta[property="og:description"]');
        const ogTitle = ogTitleEl?.getAttribute('content') || '';
        const ogDescription = ogDescEl?.getAttribute('content') || '';

        // Instagram meta description format: "X Followers, Y Following, Z Posts - See Instagram..."
        const descMatch = ogDescription ? ogDescription.match(/(.+?)\s*-\s*/) : null;
        data.brandName = ogTitle ? ogTitle.split('(')[0].trim() : '';
        data.description = descMatch ? descMatch[1] : ogDescription;

        // Try to extract profile picture
        // @ts-ignore
        const profilePicEl = document.querySelector('meta[property="og:image"]');
        const profilePic = profilePicEl?.getAttribute('content');
        if (profilePic) data.visualStyle.imageUrls.push(profilePic);

        return data;
      });

      await page.close();

      console.log(`[Scraper] Instagram scraped: ${scrapedData.brandName || username}`);

      return {
        success: true,
        source: 'instagram',
        brandName: scrapedData.brandName || username,
        description: scrapedData.description,
        visualStyle: scrapedData.visualStyle,
      };
    } catch (error: any) {
      console.error('[Scraper] Instagram scraping failed:', error.message);
      return {
        success: false,
        source: 'instagram',
        error: 'Instagram scraping failed. Please provide business details manually.',
      };
    }
  }

  /**
   * Fallback: Create business data from manual text input
   */
  static async parseManualInput(businessDescription: string): Promise<ScrapedBusinessData> {
    try {
      console.log('[Scraper] Processing manual input');

      // Basic extraction from text
      const sentences = businessDescription.split(/[.!?]+/).filter((s) => s.trim());

      return {
        success: true,
        source: 'manual',
        description: businessDescription.trim(),
        brandName: this.extractBrandNameFromText(businessDescription),
        products: this.extractProductsFromText(businessDescription),
        usps: sentences.slice(0, 3).map((s) => s.trim()),
      };
    } catch (error: any) {
      return {
        success: false,
        source: 'manual',
        error: 'Failed to parse manual input',
      };
    }
  }

  /**
   * Helper: Validate and normalize URL
   */
  private static validateAndNormalizeUrl(url: string): string | null {
    try {
      // Add protocol if missing
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }

      const parsed = new URL(url);
      return parsed.href;
    } catch {
      return null;
    }
  }

  /**
   * Helper: Extract brand name from text (look for capitalized words)
   */
  private static extractBrandNameFromText(text: string): string {
    // Find first capitalized phrase (likely brand name)
    const match = text.match(/[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*/);
    return match ? match[0] : 'Your Business';
  }

  /**
   * Helper: Extract product mentions from text
   */
  private static extractProductsFromText(text: string): string[] {
    const keywords = ['sell', 'offer', 'provide', 'product', 'service'];
    const products: string[] = [];

    keywords.forEach((keyword) => {
      const regex = new RegExp(`${keyword}s?\\s+([^.!?]+)`, 'gi');
      const matches = text.match(regex);
      if (matches) {
        products.push(...matches.map((m) => m.replace(new RegExp(keyword, 'gi'), '').trim()));
      }
    });

    return products.slice(0, 5);
  }

  /**
   * Close browser instance (call on server shutdown)
   */
  static async closeBrowser(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}
