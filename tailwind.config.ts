import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e0f9fb',
          100: '#b3f0f7',
          200: '#80e6f2',
          300: '#4ddcee',
          400: '#26d5eb',
          500: '#04bcd4',
          600: '#03aabf',
          700: '#0292a3',
          800: '#017a88',
          900: '#005a65',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config
