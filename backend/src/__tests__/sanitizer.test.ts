import { Sanitizer } from '../utils/sanitizer';

/**
 * Tests for input sanitization utilities
 */
describe('Sanitizer', () => {
  describe('sanitizeString', () => {
    it('should remove HTML tags', () => {
      const input = '<script>alert("xss")</script>Hello';
      const result = Sanitizer.sanitizeString(input);
      
      expect(result).not.toContain('<script>');
      expect(result).not.toContain('</script>');
    });
    
    it('should trim whitespace', () => {
      const result = Sanitizer.sanitizeString('  hello world  ');
      expect(result).toBe('hello world');
    });
    
    it('should handle empty strings', () => {
      expect(Sanitizer.sanitizeString('')).toBe('');
      expect(Sanitizer.sanitizeString('   ')).toBe('');
    });
    
    it('should escape HTML entities', () => {
      const input = '<div>Test & "quotes"</div>';
      const result = Sanitizer.sanitizeString(input);
      
      expect(result).toContain('&lt;');
      expect(result).toContain('&gt;');
      expect(result).toContain('&quot;');
    });
  });
  
  describe('sanitizeEmail', () => {
    it('should normalize email to lowercase', () => {
      const result = Sanitizer.sanitizeEmail('Test@Example.COM');
      expect(result).toBe('test@example.com');
    });
    
    it('should handle valid emails', () => {
      const result = Sanitizer.sanitizeEmail('user@example.com');
      expect(result).toBe('user@example.com');
    });
    
    it('should handle empty input', () => {
      expect(Sanitizer.sanitizeEmail('')).toBe('');
    });
  });
  
  describe('sanitizeMessage', () => {
    it('should limit message length', () => {
      const longMessage = 'a'.repeat(10000);
      const result = Sanitizer.sanitizeMessage(longMessage);
      
      expect(result.length).toBeLessThanOrEqual(5000);
    });
    
    it('should escape HTML in messages', () => {
      const input = 'Hello <script>bad()</script> world';
      const result = Sanitizer.sanitizeMessage(input);
      
      expect(result).not.toContain('<script>');
      expect(result).toContain('&lt;');
    });
    
    it('should preserve legitimate content', () => {
      const input = 'I want to create an ad for my product';
      const result = Sanitizer.sanitizeMessage(input);
      
      expect(result).toContain('create an ad');
    });
  });
  
  describe('sanitizeNumber', () => {
    it('should convert valid number strings', () => {
      expect(Sanitizer.sanitizeNumber('42')).toBe(42);
      expect(Sanitizer.sanitizeNumber(42)).toBe(42);
    });
    
    it('should return null for invalid numbers', () => {
      expect(Sanitizer.sanitizeNumber('abc')).toBeNull();
      expect(Sanitizer.sanitizeNumber(NaN)).toBeNull();
      expect(Sanitizer.sanitizeNumber(Infinity)).toBeNull();
    });
    
    it('should respect min/max constraints', () => {
      expect(Sanitizer.sanitizeNumber(5, 10, 20)).toBeNull();
      expect(Sanitizer.sanitizeNumber(25, 10, 20)).toBeNull();
      expect(Sanitizer.sanitizeNumber(15, 10, 20)).toBe(15);
    });
  });
  
  describe('isValidEmail', () => {
    it('should accept valid emails', () => {
      expect(Sanitizer.isValidEmail('test@example.com')).toBe(true);
      expect(Sanitizer.isValidEmail('user+tag@example.co.uk')).toBe(true);
    });
    
    it('should reject invalid emails', () => {
      expect(Sanitizer.isValidEmail('not-an-email')).toBe(false);
      expect(Sanitizer.isValidEmail('@example.com')).toBe(false);
      expect(Sanitizer.isValidEmail('test@')).toBe(false);
    });
  });
  
  describe('sanitizeObject', () => {
    it('should sanitize string values in object', () => {
      const input = {
        name: '<script>xss</script>John',
        description: 'Hello <b>world</b>'
      };
      
      const result = Sanitizer.sanitizeObject(input);
      
      expect(result.name).not.toContain('<script>');
      expect(result.description).not.toContain('<b>');
    });
    
    it('should handle nested objects', () => {
      const input = {
        user: {
          name: '<div>Test</div>',
          email: 'test@example.com'
        }
      };
      
      const result = Sanitizer.sanitizeObject(input);
      
      expect(result.user.name).not.toContain('<div>');
    });
    
    it('should handle arrays', () => {
      const input = {
        tags: ['<script>bad</script>', 'good', '<div>test</div>']
      };
      
      const result = Sanitizer.sanitizeObject(input);
      
      expect(result.tags[0]).not.toContain('<script>');
      expect(result.tags[2]).not.toContain('<div>');
    });
  });
});
