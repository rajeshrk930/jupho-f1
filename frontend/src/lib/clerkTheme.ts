import { Appearance } from '@clerk/types';

export const clerkTheme: Appearance = {
  variables: {
    // Brand colors - Coral & Mint
    colorPrimary: '#FF6B47',           // Coral 500
    colorSuccess: '#14B89C',           // Mint 500
    colorDanger: '#F04E2A',            // Coral 600
    colorWarning: '#FF9478',           // Coral 400
    
    // Text colors
    colorText: '#1F2937',              // Dark text
    colorTextSecondary: '#6B7280',     // Gray text
    
    // Background colors
    colorBackground: '#FFFFFF',        // White background
    colorInputBackground: '#FFFFFF',   // White inputs
    colorInputText: '#1F2937',         // Dark input text
    
    // Border and spacing
    borderRadius: '0.75rem',           // rounded-xl
    spacingUnit: '1rem',
    
    // Typography
    fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", sans-serif',
    fontSize: '0.9375rem',
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
  elements: {
    // Root container
    rootBox: 'mx-auto w-full',
    
    // Card/form container (no extra styling - already in unified card)
    card: 'shadow-none border-0 bg-transparent p-0',
    
    // Header
    headerTitle: 'text-2xl font-bold text-gray-900',
    headerSubtitle: 'text-sm text-gray-600 mt-2',
    
    // Social buttons (Google OAuth)
    socialButtonsBlockButton:
      'border-2 border-gray-200 hover:border-purple-400 hover:bg-purple-50 transition-all duration-200 rounded-xl py-3 px-4 font-medium text-gray-700',
    socialButtonsBlockButtonText: 'font-medium text-gray-700',
    
    // Divider
    dividerLine: 'bg-gray-200',
    dividerText: 'text-gray-500 text-sm',
    
    // Form fields
    formFieldLabel: 'text-sm font-medium text-gray-700 mb-1.5',
    formFieldInput: 
      'border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all',
    formFieldInputShowPasswordButton: 'text-gray-500 hover:text-purple-500',
    // Primary button
    formButtonPrimary: 
      'bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-xl py-3 px-6 transition-all duration-200 shadow-md hover:shadow-lg',
    // Identity preview (user info)
    identityPreviewEditButton: 'text-purple-500 hover:text-purple-600',
    
    // Form error messages
    formFieldErrorText: 'text-purple-600 text-sm',
    
    // Alternative methods
    alternativeMethodsBlockButton: 
      'border border-gray-300 hover:border-purple-400 hover:bg-purple-50 rounded-xl transition-all',
    
    // OTP/Code input
    otpCodeFieldInput: 
      'border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-100',
    
    // Profile/User button
    userButtonTrigger: 'focus:shadow-purple-200',
    userButtonPopoverCard: 'shadow-xl border border-gray-100',
    
    // Badges
    badge: 'bg-mint-100 text-mint-700 font-medium',
    
    // Footer - show navigation links
    footer: 'text-center mt-6',
    footerAction: 'mt-4',
    footerActionText: 'text-gray-600 text-sm',
    footerActionLink: 'text-purple-500 hover:text-purple-600 font-semibold transition-colors ml-1',
    
    // Hide "Secured by Clerk" branding
    footerPages: 'hidden',
  },
  layout: {
    socialButtonsPlacement: 'top',
    socialButtonsVariant: 'blockButton',
    showOptionalFields: true,
  },
};
