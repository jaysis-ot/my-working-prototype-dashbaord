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
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}