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
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    // REMOVE @tailwindcss/line-clamp - it's included by default in v3.3+
  ],
}