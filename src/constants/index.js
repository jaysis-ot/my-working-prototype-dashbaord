// src/constants/index.js

// =============================================================================
// VIEW MODES AND NAVIGATION - CRITICAL FIXES
// =============================================================================

export const VIEW_MODES = {
  OVERVIEW: 'overview',
  COMPANY_PROFILE: 'company-profile',
  CAPABILITIES: 'capabilities',
  REQUIREMENTS: 'requirements',
  THREAT_INTELLIGENCE: 'threat-intelligence',
  MITRE_NAVIGATOR: 'mitre-navigator',
  RISK_MANAGEMENT: 'risk-management',
  STANDARDS: 'standards', // ✅ CRITICAL: Added missing STANDARDS
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
  [VIEW_MODES.STANDARDS]: 'Standards & Frameworks', // ✅ CRITICAL: Added missing label
  [VIEW_MODES.PCD_BREAKDOWN]: 'PCD Breakdown',
  [VIEW_MODES.MATURITY_ANALYSIS]: 'Maturity Analysis',
  [VIEW_MODES.BUSINESS_VALUE]: 'Business Value',
  [VIEW_MODES.ANALYTICS]: 'Analytics',
  [VIEW_MODES.DIAGNOSTICS]: 'System Diagnostics',
  [VIEW_MODES.SETTINGS]: 'System Settings'
};

// =============================================================================
// STANDARDS FRAMEWORKS - NEW SECTION
// =============================================================================

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
  BLOCKED: 'Blocked'
};

export const CAPABILITY_STATUS = {
  ABSENT: 'Absent',
  BASIC: 'Basic',
  MANAGED: 'Managed',
  DEFINED: 'Defined',
  OPTIMIZED: 'Optimized'
};

export const RISK_STATUS = {
  OPEN: 'Open',
  IN_REVIEW: 'In Review',
  MITIGATED: 'Mitigated',
  ACCEPTED: 'Accepted',
  CLOSED: 'Closed'
};

export const THREAT_STATUS = {
  ACTIVE: 'Active',
  CONTAINED: 'Contained',
  RESOLVED: 'Resolved',
  MONITORING: 'Monitoring'
};

// =============================================================================
// PRIORITY AND SEVERITY LEVELS
// =============================================================================

export const PRIORITY_LEVELS = {
  CRITICAL: 'Critical',
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low',
  INFO: 'Informational'
};

export const SEVERITY_LEVELS = {
  CRITICAL: 'Critical',
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low'
};

export const APPLICABILITY_TYPES = {
  APPLICABLE: 'Applicable',
  NOT_APPLICABLE: 'Not Applicable',
  PARTIALLY_APPLICABLE: 'Partially Applicable',
  PENDING_REVIEW: 'Pending Review'
};

// =============================================================================
// CATEGORIES AND AREAS
// =============================================================================

export const REQUIREMENT_AREAS = {
  GOVERNANCE: 'Governance',
  OPERATIONS: 'Operations',
  TECHNICAL: 'Technical',
  COMPLIANCE: 'Compliance',
  RISK: 'Risk Management'
};

export const REQUIREMENT_TYPES = {
  POLICY: 'Policy',
  PROCEDURE: 'Procedure',
  CONTROL: 'Control',
  ASSESSMENT: 'Assessment',
  DOCUMENTATION: 'Documentation'
};

export const RISK_CATEGORIES = {
  OPERATIONAL: 'Operational',
  TECHNICAL: 'Technical',
  STRATEGIC: 'Strategic',
  COMPLIANCE: 'Compliance',
  FINANCIAL: 'Financial'
};

export const THREAT_CATEGORIES = {
  MALWARE: 'Malware',
  PHISHING: 'Phishing',
  INSIDER: 'Insider Threat',
  APT: 'Advanced Persistent Threat',
  SUPPLY_CHAIN: 'Supply Chain',
  VULNERABILITY: 'Vulnerability'
};

// =============================================================================
// BUSINESS AND MATURITY
// =============================================================================

export const MATURITY_LEVELS = {
  INITIAL: 'Initial',
  MANAGED: 'Managed',
  DEFINED: 'Defined',
  QUANTITATIVELY_MANAGED: 'Quantitatively Managed',
  OPTIMIZING: 'Optimizing'
};

export const BUSINESS_VALUE_SCALE = {
  VERY_LOW: 'Very Low',
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  VERY_HIGH: 'Very High'
};

export const CONFIDENCE_LEVELS = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  VERY_HIGH: 'Very High'
};

// =============================================================================
// TIME AND FILTERING
// =============================================================================

export const TIME_RANGES = {
  LAST_7_DAYS: '7d',
  LAST_30_DAYS: '30d',
  LAST_90_DAYS: '90d',
  LAST_6_MONTHS: '6m',
  LAST_YEAR: '1y',
  ALL_TIME: 'all'
};

export const TIME_RANGE_LABELS = {
  [TIME_RANGES.LAST_7_DAYS]: 'Last 7 Days',
  [TIME_RANGES.LAST_30_DAYS]: 'Last 30 Days',
  [TIME_RANGES.LAST_90_DAYS]: 'Last 90 Days',
  [TIME_RANGES.LAST_6_MONTHS]: 'Last 6 Months',
  [TIME_RANGES.LAST_YEAR]: 'Last Year',
  [TIME_RANGES.ALL_TIME]: 'All Time'
};

// =============================================================================
// LIMITS AND PAGINATION
// =============================================================================

export const TABLE_PAGE_SIZE = 25;
export const BUSINESS_VALUE_CARDS_LIMIT = 6;
export const HIGH_RISK_CARDS_LIMIT = 5;
export const NOTIFICATION_DISPLAY_LIMIT = 10;

// =============================================================================
// COLORS AND THEMES
// =============================================================================

export const COLORS = {
  primary: '#2563eb',
  secondary: '#64748b',
  success: '#059669',
  warning: '#d97706',
  error: '#dc2626',
  info: '#0891b2'
};

// =============================================================================
// COMPUTED VALUES AND HELPERS
// =============================================================================

export const ALL_STATUSES = {
  ...REQUIREMENT_STATUS,
  ...CAPABILITY_STATUS,
  ...RISK_STATUS,
  ...THREAT_STATUS
};

export const ALL_CATEGORIES = {
  ...REQUIREMENT_AREAS,
  ...REQUIREMENT_TYPES,
  ...RISK_CATEGORIES,
  ...THREAT_CATEGORIES
};

// Navigation items derived from VIEW_MODES
export const NAVIGATION_ITEMS = [
  { id: VIEW_MODES.OVERVIEW, label: VIEW_LABELS[VIEW_MODES.OVERVIEW], icon: 'TrendingUp' },
  { id: VIEW_MODES.COMPANY_PROFILE, label: VIEW_LABELS[VIEW_MODES.COMPANY_PROFILE], icon: 'Building2' },
  { id: VIEW_MODES.CAPABILITIES, label: VIEW_LABELS[VIEW_MODES.CAPABILITIES], icon: 'Network' },
  { id: VIEW_MODES.REQUIREMENTS, label: VIEW_LABELS[VIEW_MODES.REQUIREMENTS], icon: 'FileText' },
  { id: VIEW_MODES.THREAT_INTELLIGENCE, label: VIEW_LABELS[VIEW_MODES.THREAT_INTELLIGENCE], icon: 'Shield' },
  { id: VIEW_MODES.MITRE_NAVIGATOR, label: VIEW_LABELS[VIEW_MODES.MITRE_NAVIGATOR], icon: 'Target' },
  { id: VIEW_MODES.RISK_MANAGEMENT, label: VIEW_LABELS[VIEW_MODES.RISK_MANAGEMENT], icon: 'AlertTriangle' },
  { id: VIEW_MODES.STANDARDS, label: VIEW_LABELS[VIEW_MODES.STANDARDS], icon: 'Award' }, // ✅ Added Standards
  { id: VIEW_MODES.PCD_BREAKDOWN, label: VIEW_LABELS[VIEW_MODES.PCD_BREAKDOWN], icon: 'Building2' },
  { id: VIEW_MODES.MATURITY_ANALYSIS, label: VIEW_LABELS[VIEW_MODES.MATURITY_ANALYSIS], icon: 'Gauge' },
  { id: VIEW_MODES.BUSINESS_VALUE, label: VIEW_LABELS[VIEW_MODES.BUSINESS_VALUE], icon: 'Star' },
  { id: VIEW_MODES.ANALYTICS, label: VIEW_LABELS[VIEW_MODES.ANALYTICS], icon: 'BarChart3' },
  { id: VIEW_MODES.DIAGNOSTICS, label: VIEW_LABELS[VIEW_MODES.DIAGNOSTICS], icon: 'Activity' },
  { id: VIEW_MODES.SETTINGS, label: VIEW_LABELS[VIEW_MODES.SETTINGS], icon: 'Settings' }
];

// =============================================================================
// MISSING CONSTANTS - CRITICAL FIXES
// =============================================================================

export const PROGRESS_STATUSES = {
  NOT_STARTED: 'Not Started',
  IN_PROGRESS: 'In Progress', 
  REVIEW: 'Under Review',
  COMPLETED: 'Completed',
  BLOCKED: 'Blocked'
};

export const CATEGORIES = {
  GOVERNANCE: 'Governance',
  OPERATIONS: 'Operations',
  TECHNICAL: 'Technical',
  COMPLIANCE: 'Compliance',
  RISK: 'Risk Management',
  SECURITY: 'Security'
};

export const STORAGE_KEYS = {
  DASHBOARD_STATE: 'dashboard_state',
  COMPANY_PROFILE: 'company_profile',
  REQUIREMENTS_DATA: 'requirements_data',
  CAPABILITIES_DATA: 'capabilities_data',
  USER_PREFERENCES: 'user_preferences',
  FILTER_SETTINGS: 'filter_settings'
};

export const SUCCESS_MESSAGES = {
  DATA_SAVED: 'Data saved successfully',
  DATA_EXPORTED: 'Data exported successfully',
  PROFILE_UPDATED: 'Company profile updated',
  REQUIREMENT_CREATED: 'Requirement created successfully',
  REQUIREMENT_UPDATED: 'Requirement updated successfully', // ✅ Added missing message
  REQUIREMENT_DELETED: 'Requirement deleted successfully', // ✅ Added missing message
  CAPABILITY_CREATED: 'Capability created successfully', // ✅ Added missing message
  CAPABILITY_ADDED: 'Capability added successfully',
  CHANGES_SAVED: 'Changes saved successfully',
  DATA_IMPORTED: 'Data imported successfully'
};

export const ERROR_MESSAGES = {
  DATA_SAVE_FAILED: 'Failed to save data',
  DATA_EXPORT_FAILED: 'Failed to export data',
  PROFILE_UPDATE_FAILED: 'Failed to update profile',
  REQUIREMENT_CREATE_FAILED: 'Failed to create requirement',
  REQUIREMENT_UPDATE_FAILED: 'Failed to update requirement', // ✅ Added missing message
  REQUIREMENT_DELETE_FAILED: 'Failed to delete requirement', // ✅ Added missing message
  CAPABILITY_ADD_FAILED: 'Failed to add capability',
  CHANGES_SAVE_FAILED: 'Failed to save changes',
  DATA_IMPORT_FAILED: 'Failed to import data',
  SAVE_FAILED: 'Failed to save', // ✅ Added generic save failed message
  GENERIC_ERROR: 'An unexpected error occurred'
};

export const DEFAULT_VALUES = {
  COMPANY_NAME: '',
  INDUSTRY: '',
  SIZE: '',
  REQUIREMENT_STATUS: REQUIREMENT_STATUS.NOT_STARTED,
  CAPABILITY_STATUS: CAPABILITY_STATUS.ABSENT,
  RISK_LEVEL: PRIORITY_LEVELS.MEDIUM,
  CONFIDENCE_LEVEL: CONFIDENCE_LEVELS.MEDIUM,
  BUSINESS_VALUE: BUSINESS_VALUE_SCALE.MEDIUM
};

export const UI_CONFIG = {
  SIDEBAR_WIDTH: 256,
  HEADER_HEIGHT: 64,
  MOBILE_BREAKPOINT: 768,
  TABLET_BREAKPOINT: 1024,
  DESKTOP_BREAKPOINT: 1280,
  ANIMATION_DURATION: 200,
  DEBOUNCE_DELAY: 300,
  TOAST_DURATION: 5000,
  // ✅ CRITICAL: Add missing breakpoint properties
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  XXL: 1536,
  // Screen size classifications
  BREAKPOINTS: {
    MOBILE: 768,
    TABLET: 1024,
    DESKTOP: 1280,
    WIDE: 1536
  }
};