/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        command: {
          bg: '#0B1020',
          secondary: '#111827',
          card: '#151C32',
          elevated: '#1B2340',
          panel: '#0F172A',
          border: '#27324A',
          borderlight: '#334155',
          purple: '#7C3AED',
          violet: '#8B5CF6',
          indigo: '#4F46E5',
          cyan: '#06B6D4',
          teal: '#14B8A6',
          success: '#22C55E',
          warning: '#F59E0B',
          danger: '#EF4444',
          text: '#F8FAFC',
          secondaryText: '#CBD5E1',
          muted: '#94A3B8'
        },
        primary: {
          DEFAULT: '#7C3AED',
          hover: '#6D28D9',
          dark: '#5B21B6',
          light: '#8B5CF6',
          50: '#F5F3FF',
          100: '#EDE9FE',
          200: '#DDD6FE',
          500: '#8B5CF6',
          600: '#7C3AED',
          700: '#6D28D9',
          800: '#5B21B6',
          900: '#4C1D95'
        },
        sidebar: {
          DEFAULT: '#0B1020',
          dark: '#080C18',
          active: '#7C3AED',
          hover: '#151C32',
          footer: '#0B1020',
          border: '#27324A'
        },
        canvas: '#0B1020'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 16px 0 rgba(0, 0, 0, 0.4), 0 2px 6px 0 rgba(0, 0, 0, 0.3)',
        'soft-md': '0 8px 24px 0 rgba(0, 0, 0, 0.5), 0 4px 10px 0 rgba(0, 0, 0, 0.35)',
        'purple': '0 0 25px rgba(124, 58, 237, 0.45)',
        'cyan': '0 0 25px rgba(6, 182, 212, 0.45)',
        'hero': '0 12px 36px -4px rgba(0, 0, 0, 0.7)'
      }
    },
  },
  plugins: [],
}
