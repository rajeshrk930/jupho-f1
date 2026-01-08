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
          slate: {
            500: '#64748b',
            600: '#475569',
            700: '#334155',
            800: '#1e293b',
          },
          indigo: {
            500: '#6366f1',
            600: '#4f46e5',
            700: '#4338ca',
            800: '#3730a3',
          },
          blue: {
            500: '#3b82f6',
            600: '#2563eb',
            700: '#1d4ed8',
          },
        },
      },
      boxShadow: {
        'bold': '0 10px 40px -10px rgba(0, 0, 0, 0.25)',
        'bold-xl': '0 20px 60px -15px rgba(0, 0, 0, 0.3)',
        'colored-teal': '0 10px 40px -10px rgba(13, 148, 136, 0.4)',
        'colored-blue': '0 10px 40px -10px rgba(37, 99, 235, 0.4)',
        'colored-indigo': '0 10px 40px -10px rgba(79, 70, 229, 0.4)',
      },
    },
  },
  plugins: [],
};
