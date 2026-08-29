/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Dark Mode: Deep Obsidian & Electric Emerald
        obsidian: {
          bg: '#090D16',       // Deep Obsidian (App Background)
          card: '#111827',     // Dark Slate Card (Sidebar & Cards)
          border: '#1F2937',   // Muted Stroke (Card Borders / Dividers)
          input: '#0F172A',    // Deep Charcoal (Input / Search Surface)
          text: '#F9FAFB',     // Ghost White (Primary Text)
          muted: '#9CA3AF',    // Cool Gray (Muted Text)
          accent: '#10B981',   // Electric Emerald (Primary Accent)
          secondary: '#6366F1',// Vivid Indigo (Secondary Accent)
        },
        // Light Mode: Clean Frost & Crisp Jade
        frost: {
          bg: '#F8FAFC',       // Frost White (App Background)
          card: '#FFFFFF',     // Pure White (Sidebar & Cards)
          border: '#E2E8F0',   // Soft Slate Border (Card Borders / Dividers)
          input: '#F1F5F9',    // Light Gray Wash (Input / Search Surface)
          text: '#0F172A',     // Slate Black (Primary Text)
          muted: '#64748B',    // Muted Slate (Muted Text)
          accent: '#059669',   // Crisp Jade (Primary Accent)
          secondary: '#4F46E5',// Deep Indigo (Secondary Accent)
        },
        // Emerald Palettes
        emerald: {
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#10B981', // Electric Emerald
          600: '#059669', // Crisp Jade
          700: '#047857',
          800: '#065F46',
          900: '#064E3B',
          950: '#022C22',
        },
        // Indigo Palettes
        indigo: {
          50: '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#6366F1', // Vivid Indigo
          600: '#4F46E5', // Deep Indigo
          700: '#4338CA',
          800: '#3730A3',
          900: '#312E81',
          950: '#1E1B4B',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.25s ease-out forwards',
        'slide-up': 'slideUp 0.3s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
