import { FacebookService } from '../services/facebook.service';
import crypto from 'crypto';

/**
 * Tests for FacebookService encryption/decryption
 */
describe('FacebookService Encryption', () => {
  const testToken = 'test_access_token_1234567890';
  
  describe('encryptToken', () => {
    it('should encrypt a token successfully', () => {
      const encrypted = FacebookService.encryptToken(testToken);
      
      expect(encrypted).toBeDefined();
      expect(typeof encrypted).toBe('string');
      expect(encrypted).not.toBe(testToken);
      expect(encrypted).toContain(':'); // Should have IV:ciphertext format
    });
    
    it('should produce different encrypted values for same input', () => {
      const encrypted1 = FacebookService.encryptToken(testToken);
      const encrypted2 = FacebookService.encryptToken(testToken);
      
      // Due to random IV, encrypted values should be different
      expect(encrypted1).not.toBe(encrypted2);
    });
    
    it('should have random IV in each encryption', () => {
      const encrypted1 = FacebookService.encryptToken(testToken);
      const encrypted2 = FacebookService.encryptToken(testToken);
      
      const iv1 = encrypted1.split(':')[0];
      const iv2 = encrypted2.split(':')[0];
      
      // IVs should be different
      expect(iv1).not.toBe(iv2);
    });
  });
  
  describe('decryptToken', () => {
    it('should decrypt an encrypted token correctly', () => {
      const encrypted = FacebookService.encryptToken(testToken);
      const decrypted = FacebookService.decryptToken(encrypted);
      
      expect(decrypted).toBe(testToken);
    });
    
    it('should handle multiple encrypt/decrypt cycles', () => {
      for (let i = 0; i < 10; i++) {
        const testValue = `token_${i}_${crypto.randomBytes(8).toString('hex')}`;
        const encrypted = FacebookService.encryptToken(testValue);
        const decrypted = FacebookService.decryptToken(encrypted);
        
        expect(decrypted).toBe(testValue);
      }
    });
    
    it('should throw error for invalid encrypted format', () => {
      expect(() => {
        FacebookService.decryptToken('invalid_format_no_colon');
      }).toThrow('Invalid encrypted token format');
    });
    
    it('should throw error for malformed data', () => {
      expect(() => {
        FacebookService.decryptToken('aaaa:bbbb');
      }).toThrow();
    });
  });
  
  describe('Security Properties', () => {
    it('should use 16-byte IV', () => {
      const encrypted = FacebookService.encryptToken(testToken);
      const iv = encrypted.split(':')[0];
      
      // IV should be 32 hex chars (16 bytes)
      expect(iv.length).toBe(32);
    });
    
    it('should not expose patterns with same plaintext', () => {
      const encrypted1 = FacebookService.encryptToken('AAAAAAAAAA');
      const encrypted2 = FacebookService.encryptToken('AAAAAAAAAA');
      
      const ciphertext1 = encrypted1.split(':')[1];
      const ciphertext2 = encrypted2.split(':')[1];
      
      // Ciphertexts should be different due to random IV
      expect(ciphertext1).not.toBe(ciphertext2);
    });
  });
});
