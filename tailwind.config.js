/** @type {import('tailwindcss').Config} */
module.exports = {
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

        /* Maturity Levels */
        maturity: {
          1: '#ef4444',
          2: '#f59e0b',
          3: '#facc15',
          4: '#84cc16',
          5: '#10b981',
        },

        /* Backgrounds */
        background: {
          light: '#f8fafc',
          dark:  '#0f172a',
          sidebar: '#1e293b',
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}