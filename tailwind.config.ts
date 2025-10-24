import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        // Core brand colors
        windshift: {
          navy: '#000328',
          blue: '#00458e',
          'off-white': '#f4f8fb',
          'light-blue': '#ccdae8',
        },
        // Semantic color system
        primary: {
          50: '#e6f0f9',
          100: '#ccdae8',
          200: '#99b5d1',
          300: '#6690ba',
          400: '#336ba3',
          500: '#00458e',
          600: '#003771',
          700: '#002954',
          800: '#001b37',
          900: '#000328',
        },
        // Light mode colors (unchanged)
        light: {
          background: '#f4f8fb',
          'background-secondary': '#e6f0f9',
          'background-tertiary': '#dae6f2',
          surface: '#ffffff',
          'surface-hover': '#f9fbfd',
          'surface-active': '#f4f8fb',
          border: '#e1e9f1',
          'border-hover': '#ccdae8',
          text: '#000328',
          'text-secondary': '#003771',
          'text-tertiary': '#6690ba',
          'text-muted': '#99b5d1',
        },
        // Dark mode colors - DARKER with cyan-gray tint (no purple!)
        dark: {
          background: '#030310',           // Dark charcoal (was #000328)
          'background-secondary': '#030508', // Almost black
          'background-tertiary': '#070a0d',  // Very dark, minimal tint
          surface: '#0b0f12',              // Dark cyan-gray
          'surface-hover': '#111518',     // Darker hover
          'surface-active': '#171b1f',    // Darker active
          border: '#1a1f24',               // Dark cyan-gray border
          'border-hover': '#232930',      // Muted cyan-gray
          text: '#f4f8fb',                 // Keep bright text
          'text-secondary': '#ccdae8',    // Keep readable secondary
          'text-tertiary': '#99b5d1',     // Keep tertiary
          'text-muted': '#6690ba',        // Keep muted
        },
        // Status colors
        status: {
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444',
          info: '#3b82f6',
        },
        // Chart colors
        chart: {
          1: '#00458e',
          2: '#10b981',
          3: '#f59e0b',
          4: '#8b5cf6',
          5: '#ec4899',
          6: '#6690ba',
        },
      },
      fontFamily: {
        halfre: ['Halfre', 'sans-serif'],
        'space-grotesk': ['Space Grotesk', 'sans-serif'],
      },
      fontSize: {
        'display-lg': ['4rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display': ['3rem', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        'headline': ['2rem', { lineHeight: '1.3', letterSpacing: '-0.01em' }],
        'title': ['1.5rem', { lineHeight: '1.4' }],
        'body-lg': ['1.125rem', { lineHeight: '1.6' }],
        'body': ['1rem', { lineHeight: '1.6' }],
        'body-sm': ['0.875rem', { lineHeight: '1.5' }],
        'caption': ['0.75rem', { lineHeight: '1.4' }],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0, 3, 40, 0.1), 0 1px 2px 0 rgba(0, 3, 40, 0.06)',
        'card-hover': '0 10px 15px -3px rgba(0, 3, 40, 0.1), 0 4px 6px -2px rgba(0, 3, 40, 0.05)',
        // Updated dark shadows - more subtle, less blue
        'card-dark': '0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px 0 rgba(0, 0, 0, 0.3)',
        'card-dark-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
        dropdown: '0 10px 40px rgba(0, 3, 40, 0.15)',
        // Reduced glow intensity for comfort
        glow: '0 0 12px rgba(0, 69, 142, 0.25)',
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #000328 0%, #00458e 100%)',
        'gradient-brand-horizontal': 'linear-gradient(90deg, #000328 0%, #00458e 100%)',
        'gradient-brand-vertical': 'linear-gradient(180deg, #000328 0%, #00458e 100%)',
        'gradient-surface': 'linear-gradient(135deg, #f4f8fb 0%, #e6f0f9 100%)',
        // Updated dark gradient - more subtle
        'gradient-dark-surface': 'linear-gradient(135deg, #0d0e11 0%, #121317 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'glow-pulse': 'glowPulse 1.2s ease-in-out infinite alternate',
        'glow-pulse-inset': 'glowPulseInset 1.2s ease-in-out infinite alternate',
        'pulse-scale': 'pulseScale 1.2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        // Reduced glow intensity for eye comfort
        glowPulse: {
          '0%': { boxShadow: '0 0 0 0 rgba(0, 69, 142, 0.0), 0 0 0 0 rgba(0, 69, 142, 0.0)' },
          '50%': { boxShadow: '0 0 8px 1px rgba(0, 69, 142, 0.35), 0 0 16px 4px rgba(0, 69, 142, 0.15)' },
          '100%': { boxShadow: '0 0 12px 3px rgba(0, 69, 142, 0.40), 0 0 24px 8px rgba(0, 69, 142, 0.20)' },
        },
        glowPulseInset: {
          '0%': { boxShadow: 'inset 0 0 0 0 rgba(255, 255, 255, 0.00), inset 0 0 0 0 rgba(0, 69, 142, 0.00)' },
          '50%': { boxShadow: 'inset 0 0 8px 2px rgba(255, 255, 255, 0.18), inset 0 0 16px 4px rgba(0, 69, 142, 0.25)' },
          '100%': { boxShadow: 'inset 0 0 12px 3px rgba(255, 255, 255, 0.22), inset 0 0 20px 6px rgba(0, 69, 142, 0.30)' },
        },
        pulseScale: {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(1.04)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;