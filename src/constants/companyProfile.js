// src/constants/companyProfile.js

// UK Government Company Size Thresholds (effective 6 April 2025)
export const COMPANY_SIZE_THRESHOLDS = {
  MICRO: { turnover: 1000000, employees: 10, balanceSheet: 500000 },
  SMALL: { turnover: 15000000, employees: 50, balanceSheet: 7500000 },
  MEDIUM: { turnover: 54000000, employees: 250, balanceSheet: 27000000 }
};

export const ANNUAL_REVENUE_RANGES = [
  { value: 'under-632k', label: 'Under £632k', amount: 632000, category: 'MICRO' },
  { value: '632k-1m', label: '£632k - £1M', amount: 1000000, category: 'MICRO' },
  { value: '1m-5m', label: '£1M - £5M', amount: 5000000, category: 'SMALL' },
  { value: '5m-10m', label: '£5M - £10M', amount: 10000000, category: 'SMALL' },
  { value: '10m-15m', label: '£10M - £15M', amount: 15000000, category: 'SMALL' },
  { value: '15m-25m', label: '£15M - £25M', amount: 25000000, category: 'MEDIUM' },
  { value: '25m-54m', label: '£25M - £54M', amount: 54000000, category: 'MEDIUM' },
  { value: 'over-54m', label: 'Over £54M', amount: 54000001, category: 'LARGE' }
];

export const EMPLOYEE_COUNT_RANGES = [
  { value: '1-10', label: '1-10 employees', count: 10, category: 'MICRO' },
  { value: '11-25', label: '11-25 employees', count: 25, category: 'SMALL' },
  { value: '26-50', label: '26-50 employees', count: 50, category: 'SMALL' },
  { value: '51-100', label: '51-100 employees', count: 100, category: 'MEDIUM' },
  { value: '101-250', label: '101-250 employees', count: 250, category: 'MEDIUM' },
  { value: '251-500', label: '251-500 employees', count: 500, category: 'LARGE' },
  { value: '501-1000', label: '501-1000 employees', count: 1000, category: 'LARGE' },
  { value: '1000+', label: '1000+ employees', count: 1001, category: 'LARGE' }
];

export const INDUSTRIES = [
  'Energy & Utilities',
  'Manufacturing',
  'Transportation',
  'Healthcare',
  'Financial Services',
  'Government',
  'Telecommunications',
  'Oil & Gas',
  'Water Treatment',
  'Critical Infrastructure',
  'Other'
];

export const COMPANY_TYPES = [
  'Private Company',
  'Public Company',
  'Government Entity',
  'Non-Profit',
  'Subsidiary',
  'Joint Venture'
];

export const DATA_TYPES = [
  'Personal Identifiable Information (PII)',
  'Financial Data',
  'Intellectual Property',
  'Health Records (PHI)',
  'Customer Data',
  'Operational Data',
  'Trade Secrets',
  'Government Classified Data'
];

export const TECHNOLOGY_SETUPS = [
  'Primarily Cloud-based',
  'Primarily On-premise',
  'Hybrid Cloud/On-premise',
  'Edge Computing',
  'Legacy Systems Only',
  'Modern Infrastructure'
];

export const REVENUE_MODELS = [
  'Product Sales',
  'Service Delivery',
  'Subscription/SaaS',
  'Manufacturing',
  'Consulting',
  'Licensing',
  'Utilities/Infrastructure',
  'Mixed Model'
];

export const GEOGRAPHIC_REGIONS = [
  'United Kingdom',
  'European Union',
  'North America',
  'Asia Pacific',
  'Global Operations',
  'Other'
];

// Comprehensive Compliance Frameworks
export const COMPLIANCE_FRAMEWORKS = [
  // International Frameworks
  { category: 'International', name: 'ISO/IEC 27001:2022 - Information Security Management Systems' },
  { category: 'International', name: 'ISO/IEC 27002:2022 - Code of Practice for Information Security Controls' },
  { category: 'International', name: 'ISO/IEC 27017:2015 - Cloud Security' },
  { category: 'International', name: 'ISO/IEC 27018:2019 - Cloud Privacy Protection' },
  { category: 'International', name: 'NIST Cybersecurity Framework (CSF) 2.0' },
  { category: 'International', name: 'NIST SP 800-53 Rev. 5 - Security and Privacy Controls' },
  { category: 'International', name: 'COBIT 2019 - Control Objectives for Information Technologies' },
  
  // Regional and National Frameworks
  { category: 'Regional/National', name: 'General Data Protection Regulation (GDPR)' },
  { category: 'Regional/National', name: 'California Consumer Privacy Act (CCPA/CPRA)' },
  { category: 'Regional/National', name: 'UK Cyber Essentials / Cyber Essentials Plus' },
  { category: 'Regional/National', name: 'Australian Government Information Security Manual (ISM)' },
  { category: 'Regional/National', name: 'Canadian PIPEDA (Personal Information Protection)' },
  { category: 'Regional/National', name: 'UK NCSC CAF (Cyber Assessment Framework)' },
  { category: 'Regional/National', name: 'Ofgem Requirements' },
  
  // Industry-Specific Frameworks
  { category: 'Industry-Specific', name: 'Payment Card Industry Data Security Standard (PCI DSS) v4.0' },
  { category: 'Industry-Specific', name: 'Health Insurance Portability and Accountability Act (HIPAA)' },
  { category: 'Industry-Specific', name: 'Sarbanes-Oxley Act (SOX) Section 404' },
  { category: 'Industry-Specific', name: 'Federal Information Security Management Act (FISMA)' },
  { category: 'Industry-Specific', name: 'FedRAMP (Federal Risk and Authorization Management Program)' },
  { category: 'Industry-Specific', name: 'NERC CIP (Critical Infrastructure Protection)' },
  { category: 'Industry-Specific', name: 'IEC 62443 - Industrial Automation and Control Systems Security' },
  { category: 'Industry-Specific', name: 'SWIFT Customer Security Programme (CSP)' },
  { category: 'Industry-Specific', name: 'FFIEC Cybersecurity Assessment Tool' },
  { category: 'Industry-Specific', name: 'Basel III Operational Risk Framework' },
  { category: 'Industry-Specific', name: 'ENISA Cybersecurity Framework for 5G Networks' },
  
  // SME-Focused Frameworks
  { category: 'SME-Focused', name: 'NIST Small Business Cybersecurity Framework' },
  { category: 'SME-Focused', name: 'CIS Controls v8 (Center for Internet Security)' },
  { category: 'SME-Focused', name: 'Essential Eight (Australian Cyber Security Centre)' },
  { category: 'SME-Focused', name: 'ENISA Cybersecurity Guide for SMEs' },
  { category: 'SME-Focused', name: 'UK NCSC Small Business Guide' },
  { category: 'SME-Focused', name: 'US SBA Cybersecurity Guidelines' },
  { category: 'SME-Focused', name: 'Canadian Centre for Cyber Security - Small Business Guidelines' },
  { category: 'SME-Focused', name: 'German BSI-Standard 200-4 (Business Continuity Management)' }
];
