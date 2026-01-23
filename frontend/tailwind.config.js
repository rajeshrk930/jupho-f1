/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Fresh Coral & Mint Theme
        coral: {
          50: '#FFF5F3',
          100: '#FFE8E3',
          200: '#FFD5CC',
          300: '#FFB8A8',
          400: '#FF9478',
          500: '#FF6B47',  // Primary coral
          600: '#F04E2A',
          700: '#D63B1A',
          800: '#B02F16',
          900: '#8F2815',
        },
        mint: {
          50: '#F0FDF9',
          100: '#CCFBEF',
          200: '#99F6E0',
          300: '#5FEACE',
          400: '#2DD4B4',
          500: '#14B89C',  // Primary mint
          600: '#0D9488',
          700: '#0F766E',
          800: '#115E59',
          900: '#134E4A',
        },
        purple: {
          50: '#FAF5FF',
          100: '#F3E8FF',
          200: '#E9D5FF',
          300: '#D8B4FE',
          400: '#C084FC',
          500: '#A855F7',  // Primary purple - AI indicators
          600: '#9333EA',
          700: '#7C3AED',
          800: '#6B21A8',
          900: '#581C87',
        },
        charcoal: {
          50: '#F8F9FA',
          100: '#F1F3F5',
          200: '#E9ECEF',
          300: '#DEE2E6',
          400: '#CED4DA',
          500: '#ADB5BD',
          600: '#6C757D',
          700: '#495057',
          800: '#343A40',
          900: '#212529',  // Primary text
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
