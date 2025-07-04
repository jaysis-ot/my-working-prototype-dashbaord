// =============================================================================
// src/index.js - REACT ENTRY POINT (This is what actually runs first)
// =============================================================================

import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Get the root element from public/index.html
const container = document.getElementById('root');
const root = createRoot(container);

// Render the App component
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// =============================================================================
// src/index.css - BASE STYLES
// =============================================================================

/* Import Tailwind CSS */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Global styles */
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}

/* Dashboard-specific global styles */
.dashboard-layout {
  min-height: 100vh;
}

.dashboard-sidebar {
  transition: width 0.2s ease-in-out;
}

.dashboard-header {
  transition: all 0.2s ease-in-out;
}

/* =============================================================================
// src/styles/globals.css - GLOBAL DASHBOARD STYLES
// =============================================================================

/* Theme CSS Custom Properties */
:root {
  --dashboard-bg: #f9fafb;
  --dashboard-surface: #ffffff;
  --dashboard-border: #e5e7eb;
  --dashboard-text-primary: #111827;
  --dashboard-text-secondary: #6b7280;
  --dashboard-accent: #2563eb;
  --dashboard-accent-hover: #1d4ed8;
  --dashboard-sidebar-width: 280px;
  --dashboard-header-height: 64px;
  --dashboard-transition: all 0.2s ease-in-out;
}

[data-theme="dark"] {
  --dashboard-bg: #1a1a1a;
  --dashboard-surface: #2d2d2d;
  --dashboard-border: #404040;
  --dashboard-text-primary: #ffffff;
  --dashboard-text-secondary: #d1d5db;
  --dashboard-accent: #3b82f6;
  --dashboard-accent-hover: #60a5fa;
}

/* Responsive breakpoints for sidebar */
@media (max-width: 1024px) {
  :root {
    --dashboard-sidebar-width: 64px;
  }
}

/* Animation classes */
.animate-fade-in {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-slide-in {
  animation: slideIn 0.3s ease-in-out;
}

@keyframes slideIn {
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
}

/* Utility classes */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* =============================================================================
// tailwind.config.js - TAILWIND CONFIGURATION
// =============================================================================

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dashboard: {
          bg: 'var(--dashboard-bg)',
          surface: 'var(--dashboard-surface)',
          border: 'var(--dashboard-border)',
          text: {
            primary: 'var(--dashboard-text-primary)',
            secondary: 'var(--dashboard-text-secondary)',
          },
          accent: {
            DEFAULT: 'var(--dashboard-accent)',
            hover: 'var(--dashboard-accent-hover)',
          }
        }
      },
      spacing: {
        'sidebar': 'var(--dashboard-sidebar-width)',
        'header': 'var(--dashboard-header-height)',
      },
      transitionProperty: {
        'dashboard': 'var(--dashboard-transition)',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}

// =============================================================================
// postcss.config.js - POSTCSS CONFIGURATION
// =============================================================================

module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}

// =============================================================================
// package.json - DEPENDENCIES (Key sections)
// =============================================================================

{
  "name": "risk-dashboard",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "@testing-library/jest-dom": "^5.16.4",
    "@testing-library/react": "^13.3.0",
    "@testing-library/user-event": "^13.5.0",
    "lucide-react": "^0.263.1",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-scripts": "5.0.1",
    "web-vitals": "^2.1.4"
  },
  "devDependencies": {
    "@tailwindcss/forms": "^0.5.3",
    "autoprefixer": "^10.4.8",
    "postcss": "^8.4.16",
    "tailwindcss": "^3.1.8"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}

// =============================================================================
// public/index.html - HTML TEMPLATE
// =============================================================================

<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta
      name="description"
      content="Risk Management Dashboard - Monitor security posture and track compliance progress"
    />
    <link rel="apple-touch-icon" href="%PUBLIC_URL%/logo192.png" />
    <link rel="manifest" href="%PUBLIC_URL%/manifest.json" />
    <title>Risk Dashboard</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>