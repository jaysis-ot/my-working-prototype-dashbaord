// src/constants/standardsConstants.js

/**
 * Standards and Frameworks Constants
 * 
 * Defines framework identifiers, statuses, and configuration data
 * for compliance and security standards assessments.
 */

// Framework Identifiers
export const STANDARDS_FRAMEWORKS = {
  NIST_CSF: 'nist-csf-2.0',
  ISO_27001: 'iso-27001',
  SOC_2: 'soc-2',
  PCI_DSS: 'pci-dss',
  CIS_CONTROLS: 'cis-controls',
  GDPR: 'gdpr',
  HIPAA: 'hipaa',
  FedRAMP: 'fedramp'
};

// Framework Status Types
export const FRAMEWORK_STATUS = {
  AVAILABLE: 'available',
  BETA: 'beta',
  COMING_SOON: 'coming_soon',
  DEPRECATED: 'deprecated'
};

// Framework Category Types
export const FRAMEWORK_CATEGORIES = {
  CYBERSECURITY: 'Cybersecurity',
  PRIVACY: 'Privacy',
  GOVERNANCE: 'Governance',
  COMPLIANCE: 'Compliance',
  OPERATIONS: 'Operations'
};

// Framework Definitions
export const FRAMEWORK_DEFINITIONS = {
  [STANDARDS_FRAMEWORKS.NIST_CSF]: {
    name: 'NIST Cybersecurity Framework 2.0',
    shortName: 'NIST CSF 2.0',
    description: 'Comprehensive cybersecurity framework for risk management and organizational resilience',
    category: FRAMEWORK_CATEGORIES.CYBERSECURITY,
    version: '2.0',
    status: FRAMEWORK_STATUS.AVAILABLE,
    subcategories: 106,
    functions: 6,
    estimatedHours: '40-80 hours',
    lastUpdated: '2024-02-26',
    authority: 'NIST',
    scope: 'All Organizations',
    applicability: ['Technology', 'Finance', 'Healthcare', 'Government', 'Critical Infrastructure']
  },
  
  [STANDARDS_FRAMEWORKS.ISO_27001]: {
    name: 'ISO/IEC 27001:2022',
    shortName: 'ISO 27001',
    description: 'International standard for information security management systems',
    category: FRAMEWORK_CATEGORIES.CYBERSECURITY,
    version: '2022',
    status: FRAMEWORK_STATUS.COMING_SOON,
    controls: 93,
    domains: 4,
    estimatedHours: '60-120 hours',
    authority: 'ISO/IEC',
    scope: 'Global Standard',
    applicability: ['Enterprise', 'Government', 'Service Providers']
  },
  
  [STANDARDS_FRAMEWORKS.SOC_2]: {
    name: 'SOC 2 Type II',
    shortName: 'SOC 2',
    description: 'Service organization controls for security, availability, and confidentiality',
    category: FRAMEWORK_CATEGORIES.COMPLIANCE,
    version: '2017',
    status: FRAMEWORK_STATUS.COMING_SOON,
    criteria: 5,
    requirements: 64,
    estimatedHours: '80-160 hours',
    authority: 'AICPA',
    scope: 'Service Organizations',
    applicability: ['SaaS', 'Cloud Providers', 'Technology Services']
  },
  
  [STANDARDS_FRAMEWORKS.PCI_DSS]: {
    name: 'PCI Data Security Standard v4.0',
    shortName: 'PCI DSS',
    description: 'Payment card industry data security standard',
    category: FRAMEWORK_CATEGORIES.COMPLIANCE,
    version: '4.0',
    status: FRAMEWORK_STATUS.COMING_SOON,
    requirements: 12,
    controls: 241,
    estimatedHours: '100-200 hours',
    authority: 'PCI Security Standards Council',
    scope: 'Payment Card Processing',
    applicability: ['E-commerce', 'Retail', 'Financial Services']
  },
  
  [STANDARDS_FRAMEWORKS.CIS_CONTROLS]: {
    name: 'CIS Controls v8',
    shortName: 'CIS Controls',
    description: 'Center for Internet Security critical security controls',
    category: FRAMEWORK_CATEGORIES.CYBERSECURITY,
    version: '8.0',
    status: FRAMEWORK_STATUS.BETA,
    controls: 18,
    safeguards: 153,
    estimatedHours: '60-120 hours',
    authority: 'Center for Internet Security',
    scope: 'All Organizations',
    applicability: ['SMB', 'Enterprise', 'Government']
  },
  
  [STANDARDS_FRAMEWORKS.GDPR]: {
    name: 'General Data Protection Regulation',
    shortName: 'GDPR',
    description: 'European Union data protection and privacy regulation',
    category: FRAMEWORK_CATEGORIES.PRIVACY,
    version: '2018',
    status: FRAMEWORK_STATUS.COMING_SOON,
    articles: 99,
    principles: 7,
    estimatedHours: '40-80 hours',
    authority: 'European Union',
    scope: 'EU Data Processing',
    applicability: ['EU Operations', 'Data Controllers', 'Data Processors']
  }
};

// Scoring Dimensions for Assessments
export const SCORING_DIMENSIONS = {
  MATURITY: {
    name: 'Maturity Level',
    description: 'How well-developed and formalized the control implementation is',
    levels: [
      { value: 0, label: 'Not Implemented', description: 'No implementation exists' },
      { value: 1, label: 'Partially Implemented', description: 'Some elements implemented but incomplete' },
      { value: 2, label: 'Largely Implemented', description: 'Most elements implemented with minor gaps' },
      { value: 3, label: 'Fully Implemented', description: 'Complete implementation with all elements' }
    ]
  },
  
  IMPLEMENTATION: {
    name: 'Implementation Approach',
    description: 'The systematic approach and coverage of the control',
    levels: [
      { value: 0, label: 'None', description: 'No systematic approach' },
      { value: 1, label: 'Basic', description: 'Basic implementation with limited coverage' },
      { value: 2, label: 'Systematic', description: 'Well-planned systematic implementation' },
      { value: 3, label: 'Optimized', description: 'Optimized and continuously improved' }
    ]
  },
  
  EVIDENCE: {
    name: 'Evidence Quality',
    description: 'Quality and completeness of supporting evidence',
    levels: [
      { value: 0, label: 'None', description: 'No supporting evidence available' },
      { value: 1, label: 'Limited', description: 'Some evidence but incomplete or outdated' },
      { value: 2, label: 'Good', description: 'Good quality evidence with minor gaps' },
      { value: 3, label: 'Comprehensive', description: 'Complete, current, and well-documented evidence' }
    ]
  },
  
  TESTING: {
    name: 'Testing & Validation',
    description: 'Regular testing and validation of control effectiveness',
    levels: [
      { value: 0, label: 'None', description: 'No testing or validation performed' },
      { value: 1, label: 'Ad Hoc', description: 'Occasional or informal testing' },
      { value: 2, label: 'Regular', description: 'Regular testing with documented procedures' },
      { value: 3, label: 'Continuous', description: 'Continuous monitoring and automated validation' }
    ]
  }
};

// Assessment Status Types
export const ASSESSMENT_STATUS = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  REVIEW: 'review',
  COMPLETED: 'completed',
  APPROVED: 'approved'
};

// Risk Levels
export const RISK_LEVELS = {
  LOW: { value: 1, label: 'Low', color: 'green' },
  MEDIUM: { value: 2, label: 'Medium', color: 'yellow' },
  HIGH: { value: 3, label: 'High', color: 'orange' },
  CRITICAL: { value: 4, label: 'Critical', color: 'red' }
};

// Implementation Priority Levels
export const PRIORITY_LEVELS = {
  LOW: { value: 1, label: 'Low', color: 'gray' },
  MEDIUM: { value: 2, label: 'Medium', color: 'blue' },
  HIGH: { value: 3, label: 'High', color: 'orange' },
  CRITICAL: { value: 4, label: 'Critical', color: 'red' }
};

// Framework Functions (NIST CSF specific)
export const NIST_CSF_FUNCTIONS = {
  GV: { name: 'Govern', description: 'Organizational cybersecurity risk management strategy, expectations, and policy' },
  ID: { name: 'Identify', description: 'Asset management, risk assessment, and governance activities' },
  PR: { name: 'Protect', description: 'Safeguards to ensure delivery of critical infrastructure services' },
  DE: { name: 'Detect', description: 'Activities to identify the occurrence of a cybersecurity event' },
  RS: { name: 'Respond', description: 'Response planning, communications, analysis, and mitigation' },
  RC: { name: 'Recover', description: 'Recovery planning and activities for operational resilience' }
};

// Export utility functions
export const getFrameworkLabel = (frameworkId) => {
  return FRAMEWORK_DEFINITIONS[frameworkId]?.name || frameworkId;
};

export const getFrameworkStatus = (frameworkId) => {
  return FRAMEWORK_DEFINITIONS[frameworkId]?.status || FRAMEWORK_STATUS.COMING_SOON;
};

export const isFrameworkAvailable = (frameworkId) => {
  return getFrameworkStatus(frameworkId) === FRAMEWORK_STATUS.AVAILABLE;
};

export const getAvailableFrameworks = () => {
  return Object.keys(FRAMEWORK_DEFINITIONS).filter(isFrameworkAvailable);
};

export const calculateOverallScore = (assessmentData) => {
  if (!assessmentData || Object.keys(assessmentData).length === 0) return 0;
  
  const scores = Object.values(assessmentData).flat();
  if (scores.length === 0) return 0;
  
  const totalScore = scores.reduce((sum, item) => {
    const dimensionScores = Object.values(SCORING_DIMENSIONS).map(dimension => 
      item[dimension.name.toLowerCase().replace(' ', '_')] || 0
    );
    const itemScore = dimensionScores.reduce((a, b) => a + b, 0) / dimensionScores.length;
    return sum + itemScore;
  }, 0);
  
  return (totalScore / scores.length) * (100 / 3); // Scale to 100
};