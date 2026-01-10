import validator from 'validator';

/**
 * Sanitization utilities for user inputs
 */
export class Sanitizer {
  /**
   * Sanitize string input - removes HTML tags and trims whitespace
   */
  static sanitizeString(input: string): string {
    if (!input) return '';
    
    // Remove HTML tags
    let sanitized = validator.stripLow(input);
    
    // Escape HTML entities
    sanitized = validator.escape(sanitized);
    
    // Trim whitespace
    sanitized = sanitized.trim();
    
    return sanitized;
  }

  /**
   * Sanitize email input
   */
  static sanitizeEmail(email: string): string {
    if (!email) return '';
    
    // Normalize email (lowercase, trim)
    const normalized = validator.normalizeEmail(email) || '';
    
    return normalized;
  }

  /**
   * Validate and sanitize URL
   */
  static sanitizeUrl(url: string): string | null {
    if (!url) return null;
    
    const trimmed = url.trim();
    
    // Check if valid URL
    if (!validator.isURL(trimmed, {
      protocols: ['http', 'https'],
      require_protocol: true
    })) {
      return null;
    }
    
    return trimmed;
  }

  /**
   * Sanitize user message for chat/agent interactions
   * Allows more flexibility than general strings but still prevents XSS
   */
  static sanitizeMessage(message: string): string {
    if (!message) return '';
    
    // Trim whitespace
    let sanitized = message.trim();
    
    // Escape HTML to prevent XSS
    sanitized = validator.escape(sanitized);
    
    // Limit length (prevent DOS via huge messages)
    const MAX_MESSAGE_LENGTH = 5000;
    if (sanitized.length > MAX_MESSAGE_LENGTH) {
      sanitized = sanitized.substring(0, MAX_MESSAGE_LENGTH);
    }
    
    return sanitized;
  }

  /**
   * Validate and sanitize numeric input
   */
  static sanitizeNumber(input: any, min?: number, max?: number): number | null {
    const num = Number(input);
    
    if (isNaN(num)) return null;
    if (!isFinite(num)) return null;
    if (min !== undefined && num < min) return null;
    if (max !== undefined && num > max) return null;
    
    return num;
  }

  /**
   * Sanitize boolean input
   */
  static sanitizeBoolean(input: any): boolean {
    if (typeof input === 'boolean') return input;
    if (typeof input === 'string') {
      return input.toLowerCase() === 'true' || input === '1';
    }
    return Boolean(input);
  }

  /**
   * Sanitize object by applying sanitization to all string values
   */
  static sanitizeObject<T extends Record<string, any>>(obj: T): T {
    const sanitized = { ...obj };
    
    for (const key in sanitized) {
      const value = sanitized[key];
      
      if (typeof value === 'string') {
        sanitized[key] = this.sanitizeString(value) as any;
      } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        sanitized[key] = this.sanitizeObject(value) as any;
      } else if (Array.isArray(value)) {
        sanitized[key] = value.map((item: any) => 
          typeof item === 'string' ? this.sanitizeString(item) : item
        ) as any;
      }
    }
    
    return sanitized;
  }

  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    return validator.isEmail(email);
  }

  /**
   * Validate phone number (basic check)
   */
  static isValidPhone(phone: string): boolean {
    return validator.isMobilePhone(phone, 'any');
  }

  /**
   * Check if string contains only alphanumeric characters and spaces
   */
  static isAlphanumeric(str: string): boolean {
    return validator.isAlphanumeric(str.replace(/\s/g, ''));
  }
}
