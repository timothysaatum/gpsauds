import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        green: {
          DEFAULT: '#2B8A2E',   // logo primary green
          50:  '#f2faf2',
          100: '#dff2df',
          200: '#b8e4b9',
          300: '#82ce84',
          400: '#4db850',
          500: '#2B8A2E',       // exact logo green
          600: '#1A5C1A',       // logo dark border green
          700: '#144d17',
          800: '#0e3610',
          900: '#081f09',
        },
        gold: {
          DEFAULT: '#F2C12E',   // logo gold ring
          50:  '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#F2C12E',       // exact logo gold
          500: '#d4a017',
          600: '#a87c0f',
          700: '#7c5a09',
          800: '#523c06',
          900: '#2a1e03',
        },
        cream: {
          DEFAULT: '#faf8f3',
          dark: '#f0ebe0',
          darker: '#e4ddd1',
        },
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        body: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '1rem' }],
      },
      boxShadow: {
        'card':    '0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
        'card-md': '0 4px 16px -2px rgb(13 74 47 / 0.10), 0 2px 6px -2px rgb(13 74 47 / 0.06)',
        'card-lg': '0 12px 40px -4px rgb(13 74 47 / 0.14), 0 4px 16px -4px rgb(13 74 47 / 0.08)',
        'glow':    '0 0 0 3px rgb(13 74 47 / 0.15)',
        'glow-gold': '0 0 0 3px rgb(200 153 26 / 0.20)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      backgroundImage: {
        'hero-pattern': "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
      },
      animation: {
        'fade-in':     'fadeIn 0.4s ease-out',
        'fade-up':     'fadeUp 0.5s ease-out',
        'slide-in':    'slideIn 0.35s ease-out',
        'marquee':     'marquee 30s linear infinite',
        'pulse-slow':  'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn:  { from: { opacity: '0' }, to: { opacity: '1' } },
        fadeUp:  { from: { opacity: '0', transform: 'translateY(16px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideIn: { from: { opacity: '0', transform: 'translateX(-12px)' }, to: { opacity: '1', transform: 'translateX(0)' } },
        marquee: { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } },
      },
    },
  },
  plugins: [],
} satisfies Config
