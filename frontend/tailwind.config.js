/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  safelist: [
    'bg-base',
    'bg-base-surface',
    'bg-base-elevated',
    'text-text-primary',
    'text-text-secondary',
    'text-text-tertiary',
    'bg-signal-primary',
    'text-signal-primary',
    'border-border-default',
  ],
  theme: {
    extend: {
      colors: {
        // Infrastructure dark theme - semantic tokens only
        base: {
          DEFAULT: '#0B0F14', // Primary background
          surface: '#111827',  // Card/panel background
          elevated: '#1F2937', // Hover/elevated surfaces
        },
        // Flat border tokens to support border-border-default classes
        'border-default': '#1F2937',
        'border-subtle': '#374151',
        'border-signal': '#22D3EE',
        signal: {
          primary: '#22D3EE',   // Muted cyan for UI chrome
          electric: '#00E5FF',  // Electric cyan for critical actions
          danger: '#DC2626',    // Muted red for irreversible actions
          warning: '#F59E0B',   // Muted amber for warnings (rare)
        },
        text: {
          primary: '#E5E7EB',   // Main content
          secondary: '#9CA3AF', // Supporting text
          tertiary: '#6B7280',  // Disabled/placeholder
        },
        border: {
          DEFAULT: '#1F2937',   // Standard borders
          subtle: '#374151',    // Hover borders
          signal: '#22D3EE',    // Active/focus borders
        },
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
        'DEFAULT': '0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px -1px rgba(0, 0, 0, 0.4)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -2px rgba(0, 0, 0, 0.5)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.6), 0 4px 6px -4px rgba(0, 0, 0, 0.6)',
        'signal': '0 0 0 3px rgba(34, 211, 238, 0.15)', // Cyan glow for focus
      },
      borderRadius: {
        'sm': '0.25rem',  // 4px - buttons, inputs
        'md': '0.375rem', // 6px - cards, modals
        'lg': '0.5rem',   // 8px - large containers (rare)
      },
    },
  },
  plugins: [],
};
