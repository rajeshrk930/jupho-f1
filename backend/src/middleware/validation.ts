import { body, ValidationChain } from 'express-validator';

/**
 * Input validation schemas for API endpoints
 * Prevents injection attacks, data corruption, and business logic bypass
 */

// Agent scan endpoint validation
export const validateAgentScan: ValidationChain[] = [
  body('description')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10-1000 characters')
    .matches(/^[a-zA-Z0-9\s\.,!?'"()-]+$/)
    .withMessage('Description contains invalid characters'),
  
  body('location')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Location must be under 200 characters'),
  
  body('website')
    .optional()
    .isString()
    .trim()
    .isURL({ protocols: ['http', 'https'], require_protocol: true })
    .withMessage('Website must be a valid URL'),
  
  body('url')
    .optional()
    .isString()
    .isURL({ protocols: ['http', 'https'], require_protocol: true })
    .withMessage('URL must be a valid URL'),
  
  body('manualInput')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Manual input must be under 5000 characters'),
];

// Agent objective selection validation
export const validateAgentObjective: ValidationChain[] = [
  body('taskId')
    .notEmpty()
    .isUUID()
    .withMessage('Invalid task ID'),
  
  body('objective')
    .notEmpty()
    .isString()
    .isIn(['TRAFFIC', 'ENGAGEMENT', 'LEADS', 'MESSAGES', 'CONVERSIONS', 'APP_INSTALLS'])
    .withMessage('Invalid objective'),
];

// Agent audience selection validation
export const validateAgentAudience: ValidationChain[] = [
  body('taskId')
    .notEmpty()
    .isUUID()
    .withMessage('Invalid task ID'),
  
  body('country')
    .notEmpty()
    .isString()
    .isLength({ min: 2, max: 2 })
    .withMessage('Country must be 2-letter ISO code'),
  
  body('city')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 100 })
    .withMessage('City name too long'),
  
  body('minAge')
    .notEmpty()
    .isInt({ min: 13, max: 65 })
    .withMessage('Minimum age must be between 13-65'),
  
  body('maxAge')
    .notEmpty()
    .isInt({ min: 13, max: 65 })
    .withMessage('Maximum age must be between 13-65')
    .custom((value, { req }) => {
      if (value < req.body.minAge) {
        throw new Error('Max age must be greater than min age');
      }
      return true;
    }),
  
  body('genders')
    .notEmpty()
    .isArray({ min: 1 })
    .withMessage('At least one gender must be selected')
    .custom((value) => {
      const validGenders = ['1', '2']; // Facebook API: 1=Male, 2=Female
      return value.every((g: string) => validGenders.includes(g));
    })
    .withMessage('Invalid gender values'),
  
  body('interests')
    .optional()
    .isArray()
    .withMessage('Interests must be an array'),
];

// Agent budget validation
export const validateAgentBudget: ValidationChain[] = [
  body('taskId')
    .notEmpty()
    .isUUID()
    .withMessage('Invalid task ID'),
  
  body('dailyBudget')
    .notEmpty()
    .isFloat({ min: 1, max: 100000 })
    .withMessage('Daily budget must be between ₹1 and ₹100,000'),
  
  body('duration')
    .notEmpty()
    .isInt({ min: 1, max: 90 })
    .withMessage('Duration must be between 1-90 days'),
];

// Template creation validation
export const validateTemplateCreate: ValidationChain[] = [
  body('name')
    .notEmpty()
    .isString()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Template name must be 3-100 characters'),
  
  body('objective')
    .notEmpty()
    .isString()
    .isIn(['TRAFFIC', 'ENGAGEMENT', 'LEADS', 'MESSAGES', 'CONVERSIONS', 'APP_INSTALLS'])
    .withMessage('Invalid objective'),
  
  body('country')
    .notEmpty()
    .isString()
    .isLength({ min: 2, max: 2 })
    .withMessage('Country must be 2-letter ISO code'),
  
  body('minAge')
    .notEmpty()
    .isInt({ min: 13, max: 65 })
    .withMessage('Minimum age must be between 13-65'),
  
  body('maxAge')
    .notEmpty()
    .isInt({ min: 13, max: 65 })
    .withMessage('Maximum age must be between 13-65'),
  
  body('dailyBudget')
    .notEmpty()
    .isFloat({ min: 1, max: 100000 })
    .withMessage('Daily budget must be between ₹1 and ₹100,000'),
  
  body('duration')
    .notEmpty()
    .isInt({ min: 1, max: 90 })
    .withMessage('Duration must be between 1-90 days'),
  
  body('headline')
    .notEmpty()
    .isString()
    .trim()
    .isLength({ min: 5, max: 255 })
    .withMessage('Headline must be 5-255 characters'),
  
  body('primaryText')
    .notEmpty()
    .isString()
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Primary text must be 10-2000 characters'),
];

// File path validation helper
export const sanitizeFilePath = (filePath: string): string => {
  // Remove any path traversal attempts
  return filePath.replace(/\.\./g, '').replace(/\\/g, '/');
};

// Validate UUID helper
export const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};
