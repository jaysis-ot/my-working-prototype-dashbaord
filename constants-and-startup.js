// =============================================================================
// src/constants/index.js - APPLICATION CONSTANTS
// =============================================================================

/**
 * Application Constants
 * 
 * Centralized constants used throughout the dashboard application.
 * These define view modes, default values, storage keys, and other
 * configuration values.
 */

// View modes for dashboard navigation
export const VIEW_MODES = {
  OVERVIEW: 'overview',
  REQUIREMENTS: 'requirements',
  CAPABILITIES: 'capabilities',
  RISK: 'risk',
  REPORTS: 'reports',
  ANALYTICS: 'analytics'
};

// Default values for various components
export const DEFAULT_VALUES = {
  PAGE_SIZE: 25,
  CHART_HEIGHT: 300,
  SIDEBAR_WIDTH: 280,
  SIDEBAR_COLLAPSED_WIDTH: 64,
  HEADER_HEIGHT: 64,
  SEARCH_DEBOUNCE_MS: 300,
  TOAST_DURATION: 5000,
  DASHBOARD_REFRESH_INTERVAL: 30000, // 30 seconds
  MAX_SEARCH_HISTORY: 10,
  MAX_RECENT_ACTIVITY: 20
};

// Local storage keys
export const STORAGE_KEYS = {
  DASHBOARD_STATE: 'dashboard_state',
  USER_PREFERENCES: 'user_preferences',
  THEME: 'dashboard_theme',
  SIDEBAR_STATE: 'sidebar_expanded',
  COLUMN_VISIBILITY: 'column_visibility',
  FILTER_PRESETS: 'filter_presets',
  SEARCH_HISTORY: 'search_history'
};

// API endpoints (when implementing real API)
export const API_ENDPOINTS = {
  REQUIREMENTS: '/api/requirements',
  CAPABILITIES: '/api/capabilities',
  RISKS: '/api/risks',
  REPORTS: '/api/reports',
  ANALYTICS: '/api/analytics',
  USER_PROFILE: '/api/user/profile',
  COMPANY_PROFILE: '/api/company/profile'
};

// Status options for requirements
export const REQUIREMENT_STATUSES = {
  NOT_STARTED: 'Not Started',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  ON_HOLD: 'On Hold',
  DEFERRED: 'Deferred'
};

// Priority levels
export const PRIORITY_LEVELS = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical'
};

// Business value ratings
export const BUSINESS_VALUES = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  ESSENTIAL: 'Essential'
};

// Capability areas
export const CAPABILITY_AREAS = {
  SECURITY: 'Security',
  OPERATIONS: 'Operations',
  COMPLIANCE: 'Compliance',
  RISK_MANAGEMENT: 'Risk Management',
  INCIDENT_RESPONSE: 'Incident Response',
  BUSINESS_CONTINUITY: 'Business Continuity'
};

// Risk levels
export const RISK_LEVELS = {
  VERY_LOW: { value: 1, label: 'Very Low', color: 'green' },
  LOW: { value: 2, label: 'Low', color: 'green' },
  MEDIUM: { value: 3, label: 'Medium', color: 'yellow' },
  HIGH: { value: 4, label: 'High', color: 'orange' },
  VERY_HIGH: { value: 5, label: 'Very High', color: 'red' }
};

// Theme options
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  AUTO: 'auto'
};

// Responsive breakpoints (matching Tailwind CSS)
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536
};

// Chart colors for consistent theming
export const CHART_COLORS = {
  PRIMARY: '#2563eb',
  SECONDARY: '#64748b',
  SUCCESS: '#10b981',
  WARNING: '#f59e0b',
  DANGER: '#ef4444',
  INFO: '#06b6d4'
};

// =============================================================================
// STEP-BY-STEP STARTUP INSTRUCTIONS
// =============================================================================

/*

🚀 COMPLETE SETUP INSTRUCTIONS

Follow these steps in order to get your Risk Dashboard running:

1️⃣ CREATE NEW PROJECT
--------------------------------------------------
npx create-react-app risk-dashboard
cd risk-dashboard

2️⃣ INSTALL DEPENDENCIES
--------------------------------------------------
npm install lucide-react tailwindcss @tailwindcss/forms autoprefixer postcss

3️⃣ INITIALIZE TAILWIND
--------------------------------------------------
npx tailwindcss init -p

4️⃣ CREATE DIRECTORY STRUCTURE
--------------------------------------------------
mkdir -p src/components/common
mkdir -p src/components/layout
mkdir -p src/components/views
mkdir -p src/hooks
mkdir -p src/store
mkdir -p src/utils
mkdir -p src/constants
mkdir -p src/styles

5️⃣ COPY FILES
--------------------------------------------------
Copy all the component files we created into their respective directories:

📁 src/
├── 📁 components/
│   ├── 📁 common/
│   │   ├── 📄 ErrorBoundary.jsx
│   │   ├── 📄 LoadingSpinner.jsx
│   │   ├── 📄 Modal.jsx
│   │   ├── 📄 ModalProvider.jsx
│   │   ├── 📄 StatCard.jsx
│   │   └── 📄 QuickActions.jsx
│   ├── 📁 layout/
│   │   ├── 📄 DashboardLayout.jsx
│   │   ├── 📄 DashboardHeader.jsx
│   │   └── 📄 DashboardSidebar.jsx
│   ├── 📁 views/
│   │   └── 📄 OverviewView.jsx
│   └── 📄 Dashboard.jsx
├── 📁 hooks/
│   ├── 📄 useDashboardState.js
│   └── 📄 useTheme.js
├── 📁 store/
│   ├── 📄 dashboardReducer.js
│   ├── 📄 dashboardActions.js
│   ├── 📄 initialState.js
│   └── 📄 index.js
├── 📁 utils/
│   ├── 📄 themeUtils.js
│   └── 📄 index.js
├── 📁 constants/
│   └── 📄 index.js
├── 📁 styles/
│   └── 📄 globals.css
├── 📄 App.jsx
└── 📄 index.js

6️⃣ UPDATE CONFIGURATION FILES
--------------------------------------------------
Replace the contents of these files:
- tailwind.config.js
- src/index.css
- src/App.jsx
- src/index.js
- public/index.html

7️⃣ START THE DEVELOPMENT SERVER
--------------------------------------------------
npm start

8️⃣ OPEN IN BROWSER
--------------------------------------------------
The dashboard will automatically open at:
http://localhost:3000

🎉 SUCCESS!
Your Risk Dashboard should now be running with:
✅ Responsive layout
✅ Working navigation
✅ Modal system
✅ Theme switching
✅ State management
✅ Mobile optimization

🛠️ DEVELOPMENT TIPS
--------------------------------------------------
- Press Ctrl+Shift+D to open the debug panel
- Use Ctrl+1,2,3,4 for quick navigation
- Press Ctrl+K to focus search
- Press Ctrl+B to toggle sidebar
- Press Ctrl+D to toggle theme

📝 NEXT STEPS
--------------------------------------------------
1. Add your actual data sources
2. Implement API integration
3. Add more view components
4. Customize styling and branding
5. Add authentication if needed

🐛 TROUBLESHOOTING
--------------------------------------------------
If you encounter issues:

1. Make sure all dependencies are installed:
   npm install

2. Clear npm cache:
   npm cache clean --force

3. Delete node_modules and reinstall:
   rm -rf node_modules package-lock.json
   npm install

4. Check console for errors and missing files

5. Ensure all import paths are correct

*/

// =============================================================================
// MINIMAL STARTER COMPONENTS (if some are missing)
// =============================================================================

// If you're missing some view components, here are minimal starters:

// src/components/views/RequirementsView.jsx
export const RequirementsView = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">Requirements</h1>
    <p>Requirements view coming soon...</p>
  </div>
);

// src/components/views/CapabilitiesView.jsx
export const CapabilitiesView = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">Capabilities</h1>
    <p>Capabilities view coming soon...</p>
  </div>
);

// src/components/views/RiskView.jsx
export const RiskView = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">Risk Analysis</h1>
    <p>Risk analysis view coming soon...</p>
  </div>
);

// src/components/views/ReportsView.jsx
export const ReportsView = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">Reports</h1>
    <p>Reports view coming soon...</p>
  </div>
);

// src/components/views/AnalyticsView.jsx
export const AnalyticsView = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">Analytics</h1>
    <p>Analytics view coming soon...</p>
  </div>
);

// src/components/common/Toast.jsx (if missing)
export const Toast = () => null; // Placeholder for now