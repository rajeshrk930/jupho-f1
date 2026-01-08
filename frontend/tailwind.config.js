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
        primary: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
        accent: {
          purple: {
            500: '#a855f7',
            600: '#9333ea',
            700: '#7e22ce',
            800: '#6b21a8',
          },
          orange: {
            500: '#f97316',
            600: '#ea580c',
            700: '#c2410c',
          },
          pink: {
            500: '#ec4899',
            600: '#db2777',
          },
        },
      },
      boxShadow: {
        'bold': '0 10px 40px -10px rgba(0, 0, 0, 0.25)',
        'bold-xl': '0 20px 60px -15px rgba(0, 0, 0, 0.3)',
        'colored-teal': '0 10px 40px -10px rgba(13, 148, 136, 0.4)',
        'colored-purple': '0 10px 40px -10px rgba(147, 51, 234, 0.4)',
        'colored-orange': '0 10px 40px -10px rgba(249, 115, 22, 0.4)',
      },
    },
  },
  plugins: [],
};
