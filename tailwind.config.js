/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      zIndex: {
        '1000': '1000',
        '9999': '9999',
        '10000': '10000',
        '10001': '10001',
      },
      gridTemplateColumns: {
        'auto-fit': 'repeat(auto-fit, minmax(200px, 1fr))',
      },
      maxHeight: {
        '90vh': '90vh',
        '70vh': '70vh',
      },
      maxWidth: {
        '95vw': '95vw',
      },
      animation: {
        'slide-in': 'slideIn 0.3s ease-out',
        'slide-out': 'slideOut 0.3s ease-in',
        'fade-in': 'fadeIn 0.3s ease-in-out',
      },

      /* --------------------------------------------------------
       * Trust-Centric GRC Color Palette
       * ------------------------------------------------------*/
      colors: {
        /* Brand */
        primary: {
          50:  '#e6f1ff',
          100: '#cce3ff',
          200: '#99c7ff',
          300: '#66abff',
          400: '#338fff',
          500: '#0073e6',
          600: '#005cb8',
          700: '#00448a',
          800: '#002d5c',
          900: '#00172e',
        },
        secondary: {
          50:  '#f0f4f8',
          100: '#d9e2ec',
          200: '#bcccdc',
          300: '#9fb3c8',
          400: '#829ab1',
          500: '#627d98',
          600: '#486581',
          700: '#334e68',
          800: '#243b53',
          900: '#102a43',
        },

        /* Trust Pillars */
        governance: {
          light: '#8b5cf6',
          DEFAULT: '#6d28d9',
          dark: '#5b21b6',
        },
        risk: {
          light: '#f87171',
          DEFAULT: '#ef4444',
          dark: '#dc2626',
        },
        compliance: {
          light: '#34d399',
          DEFAULT: '#10b981',
          dark: '#059669',
        },

        /* Status */
        status: {
          success: '#10b981',
          warning: '#f59e0b',
          error:   '#ef4444',
          info:    '#3b82f6',
          pending: '#a855f7',
        },

        /* Maturity Levels (Updated for better distinction) */
        maturity: {
          1: '#ef4444', // Red
          2: '#f97316', // Orange
          3: '#eab308', // Yellow
          4: '#65a30d', // Lime
          5: '#16a34a', // Green
        },

        /* Backgrounds */
        background: {
          light: '#f8fafc',
          dark:  '#0f172a',
          sidebar: '#1e293b',
        },
      },
      
      /* --------------------------------------------------------
       * Typography & Spacing
       * ------------------------------------------------------*/
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      fontSize: {
        'xs': '0.75rem',    // 12px
        'sm': '0.875rem',   // 14px
        'base': '1rem',     // 16px
        'lg': '1.125rem',   // 18px
        'xl': '1.25rem',    // 20px
        '2xl': '1.5rem',    // 24px
        '3xl': '1.875rem',  // 30px
      },
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
      borderRadius: {
        'sm': '0.125rem',
        'DEFAULT': '0.25rem',
        'md': '0.375rem',
        'lg': '0.5rem',
        'xl': '0.75rem',
        '2xl': '1rem',
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'DEFAULT': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        'xl': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        'inner': 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}