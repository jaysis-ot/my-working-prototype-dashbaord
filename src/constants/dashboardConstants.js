// src/constants/dashboardConstants.js

/**
 * Dashboard Constants
 * 
 * Centralized constants for the cyber trust portal dashboard.
 * Includes view modes, status types, configuration options, and other
 * shared constants used across dashboard components.
 */

// =============================================================================
// VIEW MODES
// =============================================================================

export const VIEW_MODES = {
  OVERVIEW: 'overview',
  COMPANY_PROFILE: 'company-profile',
  CAPABILITIES: 'capabilities',
  REQUIREMENTS: 'requirements',
  THREAT_INTELLIGENCE: 'threat-intelligence',
  MITRE_NAVIGATOR: 'mitre-navigator',
  RISK_MANAGEMENT: 'risk-management',
  STANDARDS: 'standards', // ✅ ADDED MISSING STANDARDS
  PCD_BREAKDOWN: 'pcd',
  MATURITY_ANALYSIS: 'maturity',
  BUSINESS_VALUE: 'justification',
  ANALYTICS: 'analytics',
  DIAGNOSTICS: 'diagnostics',
  SETTINGS: 'settings'
};

export const VIEW_LABELS = {
  [VIEW_MODES.OVERVIEW]: 'Overview',
  [VIEW_MODES.COMPANY_PROFILE]: 'Company Profile',
  [VIEW_MODES.CAPABILITIES]: 'Capabilities',
  [VIEW_MODES.REQUIREMENTS]: 'Requirements',
  [VIEW_MODES.THREAT_INTELLIGENCE]: 'Threat Intelligence',
  [VIEW_MODES.MITRE_NAVIGATOR]: 'MITRE ATT&CK Navigator',
  [VIEW_MODES.RISK_MANAGEMENT]: 'Risk Management',
  [VIEW_MODES.STANDARDS]: 'Standards & Frameworks', // ✅ ADDED MISSING LABEL
  [VIEW_MODES.PCD_BREAKDOWN]: 'PCD Breakdown',
  [VIEW_MODES.MATURITY_ANALYSIS]: 'Maturity Analysis',
  [VIEW_MODES.BUSINESS_VALUE]: 'Business Value',
  [VIEW_MODES.ANALYTICS]: 'Analytics',
  [VIEW_MODES.DIAGNOSTICS]: 'System Diagnostics',
  [VIEW_MODES.SETTINGS]: 'System Settings'
};

// ✅ ADD STANDARDS-SPECIFIC CONSTANTS
export const STANDARDS_FRAMEWORKS = {
  NIST_CSF: 'nist-csf-2.0',
  ISO_27001: 'iso-27001',
  SOC_2: 'soc-2',
  PCI_DSS: 'pci-dss'
};

export const FRAMEWORK_LABELS = {
  [STANDARDS_FRAMEWORKS.NIST_CSF]: 'NIST CSF 2.0',
  [STANDARDS_FRAMEWORKS.ISO_27001]: 'ISO 27001:2022',
  [STANDARDS_FRAMEWORKS.SOC_2]: 'SOC 2 Type II',
  [STANDARDS_FRAMEWORKS.PCI_DSS]: 'PCI DSS v4.0'
};

// =============================================================================
// STATUS TYPES
// =============================================================================

export const REQUIREMENT_STATUS = {
  NOT_STARTED: 'Not Started',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  ON_HOLD: 'On Hold',
  CANCELLED: 'Cancelled'
};

export const CAPABILITY_STATUS = {
  PLANNING: 'Planning',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  ON_HOLD: 'On Hold'
};

export const RISK_STATUS = {
  OPEN: 'Open',
  IN_PROGRESS: 'In Progress',
  MITIGATED: 'Mitigated',
  ACCEPTED: 'Accepted',
  TRANSFERRED: 'Transferred'
};

export const THREAT_STATUS = {
  ACTIVE: 'Active',
  MONITORING: 'Monitoring',
  RESOLVED: 'Resolved',
  INVESTIGATING: 'Under Investigation'
};

// =============================================================================
// PRIORITY LEVELS
// =============================================================================

export const PRIORITY_LEVELS = {
  CRITICAL: 'Critical',
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low'
};

// =============================================================================
// SEVERITY LEVELS
// =============================================================================

export const SEVERITY_LEVELS = {
  CRITICAL: 'Critical',
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low'
};

// =============================================================================
// APPLICABILITY TYPES
// =============================================================================

export const APPLICABILITY_TYPES = {
  ESSENTIAL: 'Essential',
  RECOMMENDED: 'Recommended',
  OPTIONAL: 'Optional',
  NOT_APPLICABLE: 'Not Applicable'
};

// =============================================================================
// AREAS AND CATEGORIES
// =============================================================================

export const REQUIREMENT_AREAS = {
  NETWORK: 'Network',
  SECURITY: 'Security',
  COMPLIANCE: 'Compliance',
  OPERATIONAL: 'Operational',
  INFRASTRUCTURE: 'Infrastructure',
  GOVERNANCE: 'Governance'
};

export const REQUIREMENT_TYPES = {
  CONTROL: 'Control',
  POLICY: 'Policy',
  PROCEDURE: 'Procedure',
  TECHNICAL: 'Technical',
  ADMINISTRATIVE: 'Administrative',
  PHYSICAL: 'Physical'
};

export const RISK_CATEGORIES = {
  SECURITY: 'Security',
  OPERATIONAL: 'Operational',
  TECHNICAL: 'Technical',
  SUPPLY_CHAIN: 'Supply Chain',
  REGULATORY: 'Regulatory',
  FINANCIAL: 'Financial'
};

export const THREAT_CATEGORIES = {
  APT: 'Advanced Persistent Threat',
  RANSOMWARE: 'Ransomware',
  MALWARE: 'Malware',
  PHISHING: 'Phishing',
  INSIDER_THREAT: 'Insider Threat',
  SUPPLY_CHAIN: 'Supply Chain Attack',
  DDOS: 'DDoS Attack',
  DATA_BREACH: 'Data Breach'
};

// =============================================================================
// MATURITY LEVELS
// =============================================================================

export const MATURITY_LEVELS = {
  INITIAL: { level: 'Initial', score: 1, description: 'Ad hoc, unpredictable processes' },
  MANAGED: { level: 'Managed', score: 2, description: 'Reactive, project-based processes' },
  DEFINED: { level: 'Defined', score: 3, description: 'Proactive, organization-wide processes' },
  QUANTIFIED: { level: 'Quantified', score: 4, description: 'Measured and controlled processes' },
  OPTIMIZED: { level: 'Optimized', score: 5, description: 'Focus on continuous improvement' }
};

// =============================================================================
// BUSINESS VALUE SCALE
// =============================================================================

export const BUSINESS_VALUE_SCALE = {
  1: { label: 'Minimal', description: 'Little to no business impact' },
  2: { label: 'Low', description: 'Some business benefit' },
  3: { label: 'Medium', description: 'Moderate business value' },
  4: { label: 'High', description: 'Significant business impact' },
  5: { label: 'Critical', description: 'Essential for business operations' }
};

// =============================================================================
// CONFIDENCE LEVELS
// =============================================================================

export const CONFIDENCE_LEVELS = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  VERY_HIGH: 'Very High'
};

// =============================================================================
// TIME RANGES
// =============================================================================

export const TIME_RANGES = {
  ONE_WEEK: '1week',
  ONE_MONTH: '1month',
  THREE_MONTHS: '3months',
  SIX_MONTHS: '6months',
  ONE_YEAR: '1year',
  ALL_TIME: 'all'
};

export const TIME_RANGE_LABELS = {
  [TIME_RANGES.ONE_WEEK]: 'Last Week',
  [TIME_RANGES.ONE_MONTH]: 'Last Month',
  [TIME_RANGES.THREE_MONTHS]: 'Last 3 Months',
  [TIME_RANGES.SIX_MONTHS]: 'Last 6 Months',
  [TIME_RANGES.ONE_YEAR]: 'Last Year',
  [TIME_RANGES.ALL_TIME]: 'All Time'
};

// =============================================================================
// UI CONFIGURATION
// =============================================================================

export const UI_CONFIG = {
  // Sidebar
  SIDEBAR_WIDTH: {
    EXPANDED: 'w-64',
    COLLAPSED: 'w-16'
  },
  
  // Grid configurations
  GRID_COLUMNS: {
    STAT_CARDS: {
      SM: 'grid-cols-1 sm:grid-cols-2',
      MD: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
      LG: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6'
    },
    CAPABILITIES: 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3',
    ANALYTICS: 'grid-cols-1 lg:grid-cols-2'
  },
  
  // Modal sizes
  MODAL_SIZES: {
    SM: 'sm',
    MD: 'md',
    LG: 'lg',
    XL: 'xl',
    FULL: 'full'
  },
  
  // Breakpoints
  BREAKPOINTS: {
    SM: 640,
    MD: 768,
    LG: 1024,
    XL: 1280,
    XXL: 1536
  }
};

// =============================================================================
// COLOR SCHEMES
// =============================================================================

export const COLOR_SCHEMES = {
  STATUS: {
    [REQUIREMENT_STATUS.COMPLETED]: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
    [REQUIREMENT_STATUS.IN_PROGRESS]: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
    [REQUIREMENT_STATUS.NOT_STARTED]: { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' },
    [REQUIREMENT_STATUS.ON_HOLD]: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
    [REQUIREMENT_STATUS.CANCELLED]: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' }
  },
  
  PRIORITY: {
    [PRIORITY_LEVELS.CRITICAL]: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
    [PRIORITY_LEVELS.HIGH]: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200' },
    [PRIORITY_LEVELS.MEDIUM]: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
    [PRIORITY_LEVELS.LOW]: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' }
  },
  
  APPLICABILITY: {
    [APPLICABILITY_TYPES.ESSENTIAL]: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
    [APPLICABILITY_TYPES.RECOMMENDED]: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
    [APPLICABILITY_TYPES.OPTIONAL]: { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' },
    [APPLICABILITY_TYPES.NOT_APPLICABLE]: { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-100' }
  }
};

// =============================================================================
// CHART CONFIGURATION
// =============================================================================

export const CHART_CONFIG = {
  COLORS: {
    PRIMARY: '#3B82F6',
    SECONDARY: '#10B981',
    TERTIARY: '#F59E0B',
    QUATERNARY: '#EF4444',
    NEUTRAL: '#6B7280'
  },
  
  CHART_COLORS: [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#EC4899', '#14B8A6', '#F97316', '#84CC16', '#6366F1'
  ],
  
  HEIGHT: {
    SM: 200,
    MD: 300,
    LG: 400,
    XL: 500
  }
};

// =============================================================================
// DEFAULT VALUES
// =============================================================================

export const DEFAULT_VALUES = {
  PAGE_SIZE: 25,
  SEARCH_DEBOUNCE_DELAY: 300,
  ACTIVITY_REFRESH_INTERVAL: 30000, // 30 seconds
  DEFAULT_BUSINESS_VALUE: 3,
  DEFAULT_MATURITY_SCORE: 1,
  DEFAULT_PRIORITY: PRIORITY_LEVELS.MEDIUM,
  DEFAULT_STATUS: REQUIREMENT_STATUS.NOT_STARTED,
  DEFAULT_APPLICABILITY: APPLICABILITY_TYPES.RECOMMENDED
};

// =============================================================================
// VALIDATION RULES
// =============================================================================

export const VALIDATION_RULES = {
  REQUIREMENT: {
    TITLE_MAX_LENGTH: 100,
    DESCRIPTION_MAX_LENGTH: 500,
    ID_PATTERN: /^REQ-\d{4}$/
  },
  
  CAPABILITY: {
    NAME_MAX_LENGTH: 80,
    DESCRIPTION_MAX_LENGTH: 300,
    ID_PATTERN: /^CAP-\d{4}$/
  },
  
  BUSINESS_VALUE: {
    MIN: 1,
    MAX: 5
  },
  
  MATURITY_SCORE: {
    MIN: 1,
    MAX: 5
  },
  
  COST_ESTIMATE: {
    MIN: 0,
    MAX: 10000000 // 10 million
  }
};

// =============================================================================
// API ENDPOINTS (placeholder for future use)
// =============================================================================

export const API_ENDPOINTS = {
  REQUIREMENTS: '/api/requirements',
  CAPABILITIES: '/api/capabilities',
  RISKS: '/api/risks',
  THREATS: '/api/threats',
  ANALYTICS: '/api/analytics',
  EXPORT: '/api/export',
  IMPORT: '/api/import'
};

// =============================================================================
// STORAGE KEYS
// =============================================================================

export const STORAGE_KEYS = {
  USER_PREFERENCES: 'otreq_user_preferences',
  DASHBOARD_FILTERS: 'otreq_dashboard_filters',
  COLUMN_VISIBILITY: 'otreq_column_visibility',
  SIDEBAR_STATE: 'otreq_sidebar_state',
  THEME_PREFERENCE: 'otreq_theme_preference'
};

// =============================================================================
// ERROR MESSAGES
// =============================================================================

export const ERROR_MESSAGES = {
  GENERIC: 'An unexpected error occurred. Please try again.',
  NETWORK: 'Network error. Please check your connection.',
  VALIDATION: 'Please check your input and try again.',
  PERMISSION: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'Server error. Please try again later.',
  FILE_UPLOAD: 'Error uploading file. Please check the format and try again.',
  DATA_EXPORT: 'Error exporting data. Please try again.',
  DATA_IMPORT: 'Error importing data. Please check the file format.'
};

// =============================================================================
// SUCCESS MESSAGES
// =============================================================================

export const SUCCESS_MESSAGES = {
  REQUIREMENT_CREATED: 'Requirement created successfully!',
  REQUIREMENT_UPDATED: 'Requirement updated successfully!',
  REQUIREMENT_DELETED: 'Requirement deleted successfully!',
  CAPABILITY_CREATED: 'Capability created successfully!',
  CAPABILITY_UPDATED: 'Capability updated successfully!',
  DATA_EXPORTED: 'Data exported successfully!',
  DATA_IMPORTED: 'Data imported successfully!',
  PROFILE_UPDATED: 'Company profile updated successfully!',
  SETTINGS_SAVED: 'Settings saved successfully!',
  THREAT_SETTINGS_SAVED: 'Threat settings saved successfully!',
  STANDARDS_UPDATED: 'Standards assessment updated successfully!' // ✅ ADDED
};

// =============================================================================
// FEATURE FLAGS (for progressive enhancement)
// =============================================================================

export const FEATURE_FLAGS = {
  ENABLE_ADVANCED_ANALYTICS: true,
  ENABLE_THREAT_INTELLIGENCE: true,
  ENABLE_MITRE_NAVIGATOR: true,
  ENABLE_RISK_MANAGEMENT: true,
  ENABLE_STANDARDS_FRAMEWORKS: true, // ✅ ADDED
  ENABLE_REAL_TIME_UPDATES: true,
  ENABLE_BULK_OPERATIONS: true,
  ENABLE_EXPORT_IMPORT: true,
  ENABLE_COLLABORATION: false, // Future feature
  ENABLE_AI_RECOMMENDATIONS: false, // Future feature
  ENABLE_AUTOMATED_REPORTING: false // Future feature
};

// =============================================================================
// THEME CONSTANTS
// =============================================================================

export const THEMES = {
  DEFAULT: 'default',
  STRIPE: 'stripe',
  DARK: 'dark' // Future theme
};

export const THEME_CONFIG = {
  [THEMES.DEFAULT]: {
    name: 'Default',
    description: 'Clean and professional theme'
  },
  [THEMES.STRIPE]: {
    name: 'Stripe',
    description: 'Modern gradient theme inspired by Stripe'
  },
  [THEMES.DARK]: {
    name: 'Dark Mode',
    description: 'Dark theme for reduced eye strain'
  }
};

// =============================================================================
// EXPORTS
// =============================================================================

export default {
  VIEW_MODES,
  VIEW_LABELS,
  STANDARDS_FRAMEWORKS, // ✅ ADDED
  FRAMEWORK_LABELS, // ✅ ADDED
  REQUIREMENT_STATUS,
  CAPABILITY_STATUS,
  RISK_STATUS,
  THREAT_STATUS,
  PRIORITY_LEVELS,
  SEVERITY_LEVELS,
  APPLICABILITY_TYPES,
  REQUIREMENT_AREAS,
  REQUIREMENT_TYPES,
  RISK_CATEGORIES,
  THREAT_CATEGORIES,
  MATURITY_LEVELS,
  BUSINESS_VALUE_SCALE,
  CONFIDENCE_LEVELS,
  TIME_RANGES,
  TIME_RANGE_LABELS,
  UI_CONFIG,
  COLOR_SCHEMES,
  CHART_CONFIG,
  DEFAULT_VALUES,
  VALIDATION_RULES,
  API_ENDPOINTS,
  STORAGE_KEYS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  FEATURE_FLAGS,
  THEMES,
  THEME_CONFIG
};