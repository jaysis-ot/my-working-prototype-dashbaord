// src/constants/dashboardConstants.js

// ✅ Updated VIEW_MODES with proper naming convention
export const VIEW_MODES = {
  OVERVIEW: 'overview',
  COMPANY_PROFILE: 'company-profile',
  CAPABILITIES: 'capabilities',
  REQUIREMENTS: 'requirements',
  THREAT_INTELLIGENCE: 'threat-intelligence',
  MITRE_NAVIGATOR: 'mitre-navigator',
  RISK_MANAGEMENT: 'risk-management',
  STANDARDS: 'standards',  // ✅ Add this
  PCD_BREAKDOWN: 'pcd',
  MATURITY_ANALYSIS: 'maturity',
  BUSINESS_VALUE: 'justification',
  ANALYTICS: 'analytics',
  DIAGNOSTICS: 'diagnostics',
  SETTINGS: 'settings'
};

// ✅ Updated VIEW_LABELS to match
export const VIEW_LABELS = {
  [VIEW_MODES.OVERVIEW]: 'Overview',
  [VIEW_MODES.COMPANY_PROFILE]: 'Company Profile',
  [VIEW_MODES.CAPABILITIES]: 'Capabilities',
  [VIEW_MODES.REQUIREMENTS]: 'Requirements',
  [VIEW_MODES.THREAT_INTELLIGENCE]: 'Threat Intelligence',
  [VIEW_MODES.MITRE_NAVIGATOR]: 'MITRE ATT&CK Navigator',
  [VIEW_MODES.RISK_MANAGEMENT]: 'Risk Management',
  [VIEW_MODES.STANDARDS]: 'Standards & Frameworks',  // ✅ Add this
  [VIEW_MODES.PCD_BREAKDOWN]: 'PCD Breakdown',
  [VIEW_MODES.MATURITY_ANALYSIS]: 'Maturity Analysis',
  [VIEW_MODES.BUSINESS_VALUE]: 'Business Value',
  [VIEW_MODES.ANALYTICS]: 'Analytics',
  [VIEW_MODES.DIAGNOSTICS]: 'System Diagnostics',
  [VIEW_MODES.SETTINGS]: 'Settings'
};

// ✅ Add standards-specific constants
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