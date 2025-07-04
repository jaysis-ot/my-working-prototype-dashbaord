// src/constants/companyProfile.js

/**
 * Company Profile Constants
 * 
 * Comprehensive constants for company profile system including industry
 * classifications, compliance frameworks, and business characteristics.
 */

// =============================================================================
// INDUSTRY CLASSIFICATIONS
// =============================================================================

export const INDUSTRIES = [
  'Aerospace & Defence',
  'Agriculture & Food',
  'Automotive',
  'Banking & Financial Services',
  'Biotechnology & Pharmaceuticals',
  'Construction & Real Estate',
  'Consulting & Professional Services',
  'Education',
  'Energy & Utilities',
  'Entertainment & Media',
  'Government & Public Sector',
  'Healthcare & Life Sciences',
  'Hospitality & Tourism',
  'Insurance',
  'Legal Services',
  'Manufacturing',
  'Non-Profit',
  'Retail & E-commerce',
  'Technology & Software',
  'Telecommunications',
  'Transportation & Logistics',
  'Other'
];

// =============================================================================
// COMPANY TYPES (UK Legal Classifications)
// =============================================================================

export const COMPANY_TYPES = [
  'Private Limited Company (Ltd)',
  'Public Limited Company (PLC)',
  'Limited Liability Partnership (LLP)',
  'Partnership',
  'Sole Proprietorship',
  'Community Interest Company (CIC)',
  'Charitable Incorporated Organisation (CIO)',
  'Unincorporated Association',
  'Trust',
  'Other'
];

// =============================================================================
// UK GOVERNMENT COMPANY SIZE THRESHOLDS (April 2025)
// =============================================================================

export const UK_COMPANY_SIZE_THRESHOLDS = {
  MICRO: {
    maxEmployees: 10,
    maxRevenue: 632000, // £632k
    maxBalanceSheet: 316000, // £316k
    label: 'Micro Business'
  },
  SMALL: {
    maxEmployees: 50,
    maxRevenue: 10200000, // £10.2M
    maxBalanceSheet: 5100000, // £5.1M
    label: 'Small Business'
  },
  MEDIUM: {
    maxEmployees: 250,
    maxRevenue: 36000000, // £36M
    maxBalanceSheet: 18000000, // £18M
    label: 'Medium Business'
  },
  LARGE: {
    minEmployees: 251,
    minRevenue: 36000001, // Over £36M
    minBalanceSheet: 18000001, // Over £18M
    label: 'Large Business'
  }
};

// =============================================================================
// REVENUE & EMPLOYEE RANGES
// =============================================================================

export const ANNUAL_REVENUE_RANGES = [
  { value: 'under-100k', label: 'Under £100k', numericValue: 50000 },
  { value: '100k-500k', label: '£100k - £500k', numericValue: 300000 },
  { value: '500k-1m', label: '£500k - £1M', numericValue: 750000 },
  { value: '1m-5m', label: '£1M - £5M', numericValue: 3000000 },
  { value: '5m-10m', label: '£5M - £10M', numericValue: 7500000 },
  { value: '10m-25m', label: '£10M - £25M', numericValue: 17500000 },
  { value: '25m-50m', label: '£25M - £50M', numericValue: 37500000 },
  { value: '50m-100m', label: '£50M - £100M', numericValue: 75000000 },
  { value: 'over-100m', label: 'Over £100M', numericValue: 150000000 }
];

export const EMPLOYEE_COUNT_RANGES = [
  { value: '1-5', label: '1-5 employees', numericValue: 3 },
  { value: '6-10', label: '6-10 employees', numericValue: 8 },
  { value: '11-25', label: '11-25 employees', numericValue: 18 },
  { value: '26-50', label: '26-50 employees', numericValue: 38 },
  { value: '51-100', label: '51-100 employees', numericValue: 75 },
  { value: '101-250', label: '101-250 employees', numericValue: 175 },
  { value: '251-500', label: '251-500 employees', numericValue: 375 },
  { value: '501-1000', label: '501-1000 employees', numericValue: 750 },
  { value: '1001-5000', label: '1001-5000 employees', numericValue: 3000 },
  { value: 'over-5000', label: 'Over 5000 employees', numericValue: 7500 }
];

// =============================================================================
// GEOGRAPHIC REGIONS
// =============================================================================

export const GEOGRAPHIC_REGIONS = [
  'United Kingdom',
  'European Union',
  'United States',
  'Canada',
  'Australia & New Zealand',
  'Asia-Pacific',
  'Middle East',
  'Africa',
  'Latin America',
  'Global/Worldwide'
];

// =============================================================================
// DATA TYPES & SENSITIVITY LEVELS
// =============================================================================

export const DATA_TYPES = [
  'Personal Data (GDPR)',
  'Payment Card Data (PCI)',
  'Health Records (Medical)',
  'Financial Information',
  'Intellectual Property',
  'Trade Secrets',
  'Customer Data',
  'Employee Records',
  'Legal Documents',
  'Government/Classified Data',
  'Biometric Data',
  'Location Data',
  'Communications Data',
  'Transaction Records',
  'Research Data',
  'None of the above'
];

// =============================================================================
// TECHNOLOGY INFRASTRUCTURE SETUPS
// =============================================================================

export const TECHNOLOGY_SETUPS = [
  'Fully Cloud-based (AWS, Azure, GCP)',
  'Hybrid Cloud & On-premises',
  'Primarily On-premises',
  'Microsoft 365 / Office 365',
  'Google Workspace',
  'Mixed Cloud Providers',
  'Legacy Systems Only',
  'Minimal IT Infrastructure',
  'Outsourced IT Management'
];

// =============================================================================
// REVENUE MODELS
// =============================================================================

export const REVENUE_MODELS = [
  'Product Sales',
  'Service Delivery',
  'Software as a Service (SaaS)',
  'Subscription-based',
  'E-commerce/Online Retail',
  'Marketplace/Platform',
  'Advertising Revenue',
  'Licensing & Royalties',
  'Consulting & Professional Services',
  'Manufacturing & Distribution',
  'Mixed Revenue Streams',
  'Other'
];

// =============================================================================
// COMPLIANCE FRAMEWORKS (Enhanced with Categories)
// =============================================================================

export const COMPLIANCE_FRAMEWORKS = [
  // International Standards
  {
    name: 'ISO 27001:2022 - Information Security Management',
    category: 'International',
    applicability: ['all'],
    complexity: 'high',
    priority: 'medium'
  },
  {
    name: 'ISO 27002:2022 - Security Controls',
    category: 'International',
    applicability: ['all'],
    complexity: 'medium',
    priority: 'low'
  },
  {
    name: 'NIST Cybersecurity Framework 2.0',
    category: 'International',
    applicability: ['all'],
    complexity: 'medium',
    priority: 'high'
  },
  {
    name: 'COBIT 2019 - IT Governance',
    category: 'International',
    applicability: ['large', 'enterprise'],
    complexity: 'high',
    priority: 'low'
  },

  // Regional/National (UK Focus)
  {
    name: 'UK GDPR - Data Protection',
    category: 'Regional/National',
    applicability: ['all'],
    complexity: 'high',
    priority: 'high'
  },
  {
    name: 'Cyber Essentials / Cyber Essentials Plus',
    category: 'Regional/National',
    applicability: ['micro', 'small', 'medium'],
    complexity: 'low',
    priority: 'high'
  },
  {
    name: 'UK Government Security Classifications',
    category: 'Regional/National',
    applicability: ['government'],
    complexity: 'high',
    priority: 'high'
  },
  {
    name: 'Network and Information Systems (NIS) Regulations',
    category: 'Regional/National',
    applicability: ['critical-infrastructure'],
    complexity: 'high',
    priority: 'medium'
  },
  {
    name: 'Digital Operational Resilience Act (DORA)',
    category: 'Regional/National',
    applicability: ['financial'],
    complexity: 'high',
    priority: 'high'
  },

  // Industry-Specific
  {
    name: 'PCI DSS - Payment Card Industry',
    category: 'Industry-Specific',
    applicability: ['retail', 'ecommerce', 'financial'],
    complexity: 'high',
    priority: 'critical'
  },
  {
    name: 'HIPAA - Healthcare',
    category: 'Industry-Specific',
    applicability: ['healthcare'],
    complexity: 'high',
    priority: 'critical'
  },
  {
    name: 'SOX - Sarbanes-Oxley Act',
    category: 'Industry-Specific',
    applicability: ['public-companies'],
    complexity: 'high',
    priority: 'critical'
  },
  {
    name: 'FCA Operational Resilience',
    category: 'Industry-Specific',
    applicability: ['financial'],
    complexity: 'high',
    priority: 'high'
  },
  {
    name: 'Aviation ISAGO',
    category: 'Industry-Specific',
    applicability: ['aviation'],
    complexity: 'medium',
    priority: 'medium'
  },

  // SME-Focused
  {
    name: 'IASME Governance Standard',
    category: 'SME-Focused',
    applicability: ['micro', 'small'],
    complexity: 'low',
    priority: 'medium'
  },
  {
    name: 'SOC 2 Type II',
    category: 'SME-Focused',
    applicability: ['saas', 'cloud', 'small', 'medium'],
    complexity: 'medium',
    priority: 'high'
  }
];

// =============================================================================
// THREAT LANDSCAPE BY INDUSTRY
// =============================================================================

export const INDUSTRY_THREAT_PROFILES = {
  'Banking & Financial Services': {
    primaryThreats: ['Financial fraud', 'Ransomware', 'Data breach', 'Regulatory non-compliance'],
    riskLevel: 'critical',
    regulatoryPressure: 'very-high'
  },
  'Healthcare & Life Sciences': {
    primaryThreats: ['Data breach', 'Ransomware', 'Medical device security', 'Patient data theft'],
    riskLevel: 'critical',
    regulatoryPressure: 'very-high'
  },
  'Government & Public Sector': {
    primaryThreats: ['Nation-state attacks', 'Data breach', 'Service disruption', 'Espionage'],
    riskLevel: 'critical',
    regulatoryPressure: 'very-high'
  },
  'Technology & Software': {
    primaryThreats: ['IP theft', 'Supply chain attacks', 'Code injection', 'Zero-day exploits'],
    riskLevel: 'high',
    regulatoryPressure: 'medium'
  },
  'Manufacturing': {
    primaryThreats: ['Industrial espionage', 'Operational disruption', 'Supply chain attacks', 'Ransomware'],
    riskLevel: 'high',
    regulatoryPressure: 'medium'
  },
  'Retail & E-commerce': {
    primaryThreats: ['Payment fraud', 'Customer data breach', 'Website attacks', 'Inventory disruption'],
    riskLevel: 'medium',
    regulatoryPressure: 'medium'
  },
  'Education': {
    primaryThreats: ['Student data breach', 'Ransomware', 'Research theft', 'System disruption'],
    riskLevel: 'medium',
    regulatoryPressure: 'low'
  }
};

// =============================================================================
// COMPANY SIZE-BASED RECOMMENDATIONS
// =============================================================================

export const SIZE_BASED_RECOMMENDATIONS = {
  MICRO: {
    primaryFrameworks: ['Cyber Essentials', 'IASME Governance'],
    budgetRange: '£5k-£25k',
    focusAreas: ['Basic security', 'Email security', 'Backup procedures'],
    compliance: ['UK GDPR basics', 'Cyber Essentials']
  },
  SMALL: {
    primaryFrameworks: ['Cyber Essentials Plus', 'SOC 2', 'ISO 27001 Foundations'],
    budgetRange: '£25k-£100k',
    focusAreas: ['Access management', 'Security awareness', 'Incident response'],
    compliance: ['UK GDPR', 'Industry-specific']
  },
  MEDIUM: {
    primaryFrameworks: ['ISO 27001', 'SOC 2 Type II', 'NIST CSF'],
    budgetRange: '£100k-£500k',
    focusAreas: ['Security governance', 'Risk management', 'Compliance automation'],
    compliance: ['Multiple frameworks', 'Regular audits']
  },
  LARGE: {
    primaryFrameworks: ['ISO 27001', 'NIST CSF', 'COBIT', 'Industry-specific'],
    budgetRange: '£500k+',
    focusAreas: ['Enterprise security', 'Threat intelligence', 'Security operations'],
    compliance: ['Comprehensive compliance', 'Continuous monitoring']
  }
};

// =============================================================================
// VALIDATION RULES
// =============================================================================

export const VALIDATION_RULES = {
  companyName: {
    required: true,
    minLength: 2,
    maxLength: 100,
    pattern: /^[a-zA-Z0-9\s\-\.\&\'\(\)]+$/
  },
  contactEmail: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  registrationNumber: {
    required: false,
    pattern: /^[A-Z0-9]{6,12}$/ // UK company number format
  },
  industry: {
    required: true,
    allowedValues: INDUSTRIES
  },
  annualRevenue: {
    required: true,
    allowedValues: ANNUAL_REVENUE_RANGES.map(r => r.value)
  },
  employeeCount: {
    required: true,
    allowedValues: EMPLOYEE_COUNT_RANGES.map(r => r.value)
  },
  operatingRegions: {
    required: true,
    minItems: 1,
    allowedValues: GEOGRAPHIC_REGIONS
  },
  sensitiveDataTypes: {
    required: true,
    minItems: 1,
    allowedValues: DATA_TYPES
  }
};

// =============================================================================
// PROFILE COMPLETION WEIGHTS
// =============================================================================

export const COMPLETION_WEIGHTS = {
  // Critical fields (70% of total score)
  critical: {
    companyName: 15,
    industry: 15,
    annualRevenue: 10,
    employeeCount: 10,
    contactEmail: 10,
    operatingRegions: 5,
    sensitiveDataTypes: 5
  },
  // Important fields (20% of total score)
  important: {
    companyType: 5,
    headquarters: 3,
    technologySetup: 4,
    complianceRequirements: 5,
    contactPhone: 3
  },
  // Optional fields (10% of total score)
  optional: {
    registrationNumber: 2,
    subSector: 2,
    balanceSheetTotal: 1,
    legacySystemsDetails: 2,
    primaryConcerns: 2,
    budgetRange: 1
  }
};

// =============================================================================
// EXPORTS
// =============================================================================

export default {
  INDUSTRIES,
  COMPANY_TYPES,
  UK_COMPANY_SIZE_THRESHOLDS,
  ANNUAL_REVENUE_RANGES,
  EMPLOYEE_COUNT_RANGES,
  GEOGRAPHIC_REGIONS,
  DATA_TYPES,
  TECHNOLOGY_SETUPS,
  REVENUE_MODELS,
  COMPLIANCE_FRAMEWORKS,
  INDUSTRY_THREAT_PROFILES,
  SIZE_BASED_RECOMMENDATIONS,
  VALIDATION_RULES,
  COMPLETION_WEIGHTS
};