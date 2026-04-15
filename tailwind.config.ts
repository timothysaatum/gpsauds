import type { Config } from 'tailwindcss'

// ─────────────────────────────────────────────────────────────────────────────
// GPSA-UDS Design Tokens
// Primary palette from brand reference screenshot
//
//  green-500  #3CB559  ← primary brand green (hero, buttons, nav)
//  green-400  #52C96E  ← mid green
//  green-300  #7DD98A  ← mint highlight (gradient end, hover accents)
//  green-600  #2A9144  ← darker for hover/active
//  green-700  #1E7034  ← deep text green
//  gold-400   #F2C12E  ← logo gold (CTA, dividers, accents)
//  cream      #F7FAF7  ← green-tinted page background
// ─────────────────────────────────────────────────────────────────────────────

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        green: {
          DEFAULT: '#3CB559',
          50:  '#f0faf2',
          100: '#dcf5e3',
          200: '#b5eac2',
          300: '#7DD98A',
          400: '#52C96E',
          500: '#3CB559',
          600: '#2A9144',
          700: '#1E7034',
          800: '#14522A',
          900: '#0b3019',
        },
        gold: {
          DEFAULT: '#F2C12E',
          50:  '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#F5D060',
          400: '#F2C12E',
          500: '#D4A017',
          600: '#A87C0F',
          700: '#7C5A09',
          800: '#523C06',
          900: '#2A1E03',
        },
        cream: {
          DEFAULT: '#F7FAF7',
          dark:    '#EDF4EE',
          darker:  '#D9EBD9',
        },
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        body:    ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '1rem' }],
      },
      boxShadow: {
        'card':      '0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
        'card-md':   '0 4px 16px -2px rgb(60 181 89 / 0.14), 0 2px 6px -2px rgb(60 181 89 / 0.08)',
        'card-lg':   '0 12px 40px -4px rgb(60 181 89 / 0.18), 0 4px 16px -4px rgb(60 181 89 / 0.10)',
        'glow':      '0 0 0 3px rgb(60 181 89 / 0.20)',
        'glow-gold': '0 0 0 3px rgb(242 193 46 / 0.25)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      backgroundImage: {
        'hero-pattern': "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.04'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
        'brand-gradient':   'linear-gradient(135deg, #1E7034 0%, #3CB559 55%, #7DD98A 100%)',
        'brand-gradient-h': 'linear-gradient(90deg, #3CB559 0%, #7DD98A 100%)',
      },
      animation: {
        'fade-in':    'fadeIn 0.4s ease-out',
        'fade-up':    'fadeUp 0.5s ease-out',
        'slide-in':   'slideIn 0.35s ease-out',
        'marquee':    'marquee 30s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
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