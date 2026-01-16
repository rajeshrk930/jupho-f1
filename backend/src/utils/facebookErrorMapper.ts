/**
 * Maps Facebook API errors to user-friendly messages with actionable steps
 */

export interface FacebookError {
  code: number;
  error_subcode?: number;
  message: string;
  type: string;
  error_user_title?: string;
  error_user_msg?: string;
}

export interface MappedError {
  type: 'PAYMENT_REQUIRED' | 'ACCOUNT_DISABLED' | 'RATE_LIMIT' | 'AD_DISAPPROVED' | 'PERMISSION_DENIED' | 'GENERIC';
  userMessage: string;
  actionRequired: string;
  helpUrl?: string;
  retryable: boolean;
}

export function mapFacebookError(error: FacebookError): MappedError {
  // Payment method missing/invalid
  if (
    error.code === 1815107 || 
    error.error_subcode === 1885259 ||
    error.error_subcode === 1885466 ||
    error.message?.toLowerCase().includes('payment method') ||
    error.message?.toLowerCase().includes('billing')
  ) {
    return {
      type: 'PAYMENT_REQUIRED',
      userMessage: '⚠️ Your Facebook Ad Account needs a payment method.',
      actionRequired: 'Please add a credit/debit card in Facebook Billing settings and try again.',
      helpUrl: 'https://business.facebook.com/billing_hub/payment_settings',
      retryable: true
    };
  }

  // Ad account disabled/restricted
  if (
    error.code === 190 && error.error_subcode === 463 ||
    error.code === 368 ||
    error.code === 2635 ||
    error.message?.toLowerCase().includes('account is disabled') ||
    error.message?.toLowerCase().includes('account has been restricted')
  ) {
    return {
      type: 'ACCOUNT_DISABLED',
      userMessage: '⚠️ Your Facebook Ad Account is disabled or restricted.',
      actionRequired: 'Visit Facebook Account Quality to resolve policy violations or restrictions.',
      helpUrl: 'https://business.facebook.com/accountquality',
      retryable: false
    };
  }

  // Rate limiting
  if (
    error.code === 17 || 
    error.code === 32 || 
    error.code === 4 ||
    error.code === 613 ||
    error.message?.toLowerCase().includes('rate limit') ||
    error.message?.toLowerCase().includes('too many calls')
  ) {
    return {
      type: 'RATE_LIMIT',
      userMessage: '⚠️ Too many requests to Facebook. Please slow down.',
      actionRequired: 'Wait 5-10 minutes before trying again.',
      retryable: true
    };
  }

  // Ad content disapproved/rejected
  if (
    error.code === 1487124 ||
    error.code === 1487553 ||
    error.code === 1487390 ||
    error.message?.toLowerCase().includes('ad was disapproved') ||
    error.message?.toLowerCase().includes('violates') ||
    error.message?.toLowerCase().includes('policy')
  ) {
    return {
      type: 'AD_DISAPPROVED',
      userMessage: '⚠️ Facebook rejected your ad content due to policy violations.',
      actionRequired: 'Review Meta\'s advertising policies and modify your ad copy, image, or targeting.',
      helpUrl: 'https://www.facebook.com/policies/ads',
      retryable: true
    };
  }

  // Permission/access token errors
  if (
    error.code === 190 ||
    error.code === 200 ||
    error.code === 2500 ||
    error.message?.toLowerCase().includes('permission') ||
    error.message?.toLowerCase().includes('access token') ||
    error.message?.toLowerCase().includes('oauth')
  ) {
    return {
      type: 'PERMISSION_DENIED',
      userMessage: '⚠️ Facebook access token expired or insufficient permissions.',
      actionRequired: 'Please reconnect your Facebook account in Settings with ads_management permission.',
      helpUrl: '/settings',
      retryable: true
    };
  }

  // Budget/spend limit errors
  if (
    error.error_subcode === 2603 ||
    error.message?.toLowerCase().includes('budget') ||
    error.message?.toLowerCase().includes('spend limit')
  ) {
    return {
      type: 'GENERIC',
      userMessage: '⚠️ Budget or spending limit issue.',
      actionRequired: 'Check your ad account spending limits in Facebook Billing settings.',
      helpUrl: 'https://business.facebook.com/billing_hub/payment_settings',
      retryable: true
    };
  }

  // Invalid parameter errors
  if (
    error.code === 100 ||
    error.message?.toLowerCase().includes('invalid parameter')
  ) {
    return {
      type: 'GENERIC',
      userMessage: '⚠️ Invalid data provided to Facebook.',
      actionRequired: `Facebook says: ${error.message}. Please contact support if this persists.`,
      retryable: false
    };
  }

  // Generic fallback
  return {
    type: 'GENERIC',
    userMessage: error.error_user_msg || error.message || 'Unknown Facebook API error',
    actionRequired: error.error_user_title || 'Please check Facebook Ads Manager for more details.',
    helpUrl: 'https://business.facebook.com/adsmanager',
    retryable: false
  };
}

/**
 * Helper to check if an error is a Facebook API error
 */
export function isFacebookError(error: any): boolean {
  return !!(
    error?.response?.data?.error ||
    error?.error ||
    (error?.code && error?.message)
  );
}

/**
 * Extract Facebook error from various error formats
 */
export function extractFacebookError(error: any): FacebookError | null {
  // Axios response format
  if (error?.response?.data?.error) {
    return error.response.data.error;
  }
  
  // Direct error object
  if (error?.error) {
    return error.error;
  }
  
  // Already a Facebook error
  if (error?.code && error?.message) {
    return error;
  }
  
  return null;
}
