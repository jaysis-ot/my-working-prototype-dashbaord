// src/constants/standardsConstants.js
// Standards and Frameworks Constants

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

export const FRAMEWORK_STATUS = {
  AVAILABLE: 'available',
  COMING_SOON: 'coming-soon',
  BETA: 'beta',
  DEPRECATED: 'deprecated'
};

export const ASSESSMENT_STATUS = {
  NOT_STARTED: 'not-started',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
  NEEDS_REVIEW: 'needs-review'
};

export const SCORING_DIMENSIONS = {
  maturity: { 
    name: "Maturity Level", 
    levels: ["Not Implemented", "Partially Implemented", "Largely Implemented", "Fully Implemented"],
    weights: [0, 1, 2, 3]
  },
  implementation: { 
    name: "Implementation Approach", 
    levels: ["None", "Basic", "Systematic", "Optimized"],
    weights: [0, 1, 2, 3]
  },
  evidence: { 
    name: "Evidence Quality", 
    levels: ["None", "Limited", "Good", "Comprehensive"],
    weights: [0, 1, 2, 3]
  }
};

export const FRAMEWORK_CATEGORIES = {
  CYBERSECURITY: 'Cybersecurity',
  INFORMATION_SECURITY: 'Information Security',
  AUDIT_COMPLIANCE: 'Audit & Compliance',
  PAYMENT_SECURITY: 'Payment Security',
  PRIVACY: 'Privacy',
  OPERATIONAL: 'Operational'
};

export const FRAMEWORK_DEFINITIONS = {
  [STANDARDS_FRAMEWORKS.NIST_CSF]: {
    name: FRAMEWORK_LABELS[STANDARDS_FRAMEWORKS.NIST_CSF],
    description: 'Comprehensive cybersecurity framework with 6 functions and 106 subcategories',
    category: FRAMEWORK_CATEGORIES.CYBERSECURITY,
    status: FRAMEWORK_STATUS.AVAILABLE,
    version: '2.0',
    functions: 6,
    categories: 22,
    subcategories: 106,
    estimatedHours: '40-60 hours',
    complexity: 'High',
    audience: ['CISOs', 'Security Teams', 'Risk Managers', 'Executives'],
    benefits: [
      'Comprehensive cybersecurity coverage',
      'Industry-standard framework',
      'Flexible implementation approach',
      'Strong governance focus',
      'Supply chain risk management'
    ],
    requirements: [
      'Dedicated security team or consultant',
      'Executive sponsorship',
      'Cross-functional collaboration',
      'Documentation and evidence collection'
    ]
  },
  [STANDARDS_FRAMEWORKS.ISO_27001]: {
    name: FRAMEWORK_LABELS[STANDARDS_FRAMEWORKS.ISO_27001],
    description: 'International standard for information security management systems',
    category: FRAMEWORK_CATEGORIES.INFORMATION_SECURITY,
    status: FRAMEWORK_STATUS.COMING_SOON,
    version: '2022',
    controls: 93,
    themes: 4,
    estimatedHours: '80-120 hours',
    complexity: 'Very High',
    audience: ['Information Security Managers', 'Compliance Teams', 'Auditors'],
    benefits: [
      'International certification available',
      'Comprehensive ISMS approach',
      'Risk-based methodology',
      'Continuous improvement focus'
    ],
    requirements: [
      'Formal ISMS implementation',
      'Management system documentation',
      'Internal audit capability',
      'External certification process'
    ]
  },
  [STANDARDS_FRAMEWORKS.SOC_2]: {
    name: FRAMEWORK_LABELS[STANDARDS_FRAMEWORKS.SOC_2],
    description: 'Service organization controls for security and availability',
    category: FRAMEWORK_CATEGORIES.AUDIT_COMPLIANCE,
    status: FRAMEWORK_STATUS.COMING_SOON,
    version: 'Type II',
    criteria: 5,
    points: 64,
    estimatedHours: '60-100 hours',
    complexity: 'High',
    audience: ['Service Organizations', 'Cloud Providers', 'SaaS Companies'],
    benefits: [
      'Customer trust and assurance',
      'Vendor risk management',
      'Operational excellence',
      'Compliance demonstration'
    ],
    requirements: [
      'Service organization focus',
      'Control implementation',
      'Independent audit',
      'Annual assessment'
    ]
  },
  [STANDARDS_FRAMEWORKS.PCI_DSS]: {
    name: FRAMEWORK_LABELS[STANDARDS_FRAMEWORKS.PCI_DSS],
    description: 'Payment Card Industry Data Security Standard',
    category: FRAMEWORK_CATEGORIES.PAYMENT_SECURITY,
    status: FRAMEWORK_STATUS.COMING_SOON,
    version: '4.0',
    requirements: 12,
    controls: 320,
    estimatedHours: '100-200 hours',
    complexity: 'Very High',
    audience: ['Payment Processors', 'E-commerce', 'Financial Services'],
    benefits: [
      'Payment industry compliance',
      'Reduced breach risk',
      'Customer data protection',
      'Regulatory compliance'
    ],
    requirements: [
      'Card data handling',
      'Network segmentation',
      'Regular testing',
      'Annual assessment'
    ]
  }
};

export const MATURITY_LEVELS = {
  0: { label: 'Not Implemented', color: 'gray', description: 'No implementation' },
  1: { label: 'Partially Implemented', color: 'red', description: 'Basic implementation' },
  2: { label: 'Largely Implemented', color: 'yellow', description: 'Most requirements met' },
  3: { label: 'Fully Implemented', color: 'green', description: 'Complete implementation' }
};

export const PRIORITY_WEIGHTS = {
  1: { label: 'Lowest', description: 'Nice to have' },
  2: { label: 'Low', description: 'Important but not urgent' },
  3: { label: 'Medium', description: 'Standard priority' },
  4: { label: 'High', description: 'Important and urgent' },
  5: { label: 'Critical', description: 'Mission critical' }
};

export default {
  STANDARDS_FRAMEWORKS,
  FRAMEWORK_LABELS,
  FRAMEWORK_STATUS,
  ASSESSMENT_STATUS,
  SCORING_DIMENSIONS,
  FRAMEWORK_CATEGORIES,
  FRAMEWORK_DEFINITIONS,
  MATURITY_LEVELS,
  PRIORITY_WEIGHTS
};