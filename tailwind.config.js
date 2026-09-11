/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#030305',
        foreground: '#f1f5f9',
        primary: {
          DEFAULT: '#f8fafc',
          foreground: '#030305',
        },
        accent: {
          DEFAULT: '#38bdf8',
          foreground: '#030305',
        },
        telemetry: {
          DEFAULT: '#f59e0b',
          foreground: '#030305',
        },
        muted: {
          DEFAULT: '#0e0e14',
          foreground: '#71717a',
        },
        card: {
          DEFAULT: 'rgba(8, 8, 12, 0.65)',
          foreground: '#f8fafc',
        },
        border: 'rgba(255, 255, 255, 0.08)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '2px',
        sm: '2px',
        md: '4px',
        lg: '6px',
        xl: '8px',
      },
    },
  },
  plugins: [],
};
