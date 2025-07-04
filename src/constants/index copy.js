// STEP 1: Create src/constants/index.js with this content:
// ========================================================

// src/constants/index.js
export const TABLE_PAGE_SIZE = 20;
export const BUSINESS_VALUE_CARDS_LIMIT = 12;
export const HIGH_RISK_CARDS_LIMIT = 9;
export const NOTIFICATION_DISPLAY_LIMIT = 3;

export const MATURITY_LEVELS = {
  INITIAL: { level: 'Initial', score: 1, description: 'Ad-hoc, no formal process' },
  DEVELOPING: { level: 'Developing', score: 2, description: 'Some processes defined' },
  DEFINED: { level: 'Defined', score: 3, description: 'Documented and standardized' },
  MANAGED: { level: 'Managed', score: 4, description: 'Measured and controlled' },
  OPTIMIZING: { level: 'Optimizing', score: 5, description: 'Continuously improving' }
};

export const PROGRESS_STATUSES = {
  'Not Started': { percentage: 0, color: '#ef4444', description: 'Requirements gathering has not begun' },
  'Gathering more context': { percentage: 25, color: '#f59e0b', description: 'Initial context and background research' },
  'Feasibility': { percentage: 50, color: '#3b82f6', description: 'Feasibility analysis and technical assessment' },
  'Qualifying': { percentage: 75, color: '#8b5cf6', description: 'Detailed qualification and validation' },
  'Completely Understood and defined': { percentage: 100, color: '#10b981', description: 'Fully defined and ready for implementation' }
};

export const COLORS = {
  STATUS: {
    'Not Started': '#ef4444',
    'In Progress': '#f59e0b',
    'Completed': '#10b981',
    'On Hold': '#6b7280',
    'Under Review': '#8b5cf6'
  },
  MATURITY: {
    'Initial': '#ef4444',
    'Developing': '#f59e0b',
    'Defined': '#3b82f6',
    'Managed': '#10b981',
    'Optimizing': '#8b5cf6'
  },
  APPLICABILITY: {
    'Essential': '#10b981',
    'Applicable': '#3b82f6',
    'Future': '#f59e0b',
    'Conditional': '#f97316',
    'Not Applicable': '#6b7280'
  }
};

export const CATEGORIES = [
  "Access Control & Authentication",
  "Access Control & Authentication / Remote Access",
  "Access Request & Management","Advanced Technologies",
  "Auditability & Traceability",
  "Backup & Recovery",
  "Business Value & ROI",
  "Capacity Planning",
  "Compatibility & Integration",
  "Compliance & Regulatory Management",
  "Concurrent Usage & Performance",
  "Configuration & Change Management",
  "Configuration & Change Management / Backup & Recovery",
  "Data Exchange & External Integration",
  "Data Management",
  "Data Privacy & Regulatory Compliance",
  "Device & Firmware Management",
  "Edge & Modern Connectivity",
  "Environment Distinction",
  "Environmental & Physical Considerations",
  "Ethical & Responsible AI",
  "Feedback & Continuous Improvement",
  "Feedback & Continuous Improvement / Internationalisation & Localisation",
  "Future-Proofing & Emerging Technologies",
  "Identity & Authentication Integration",
  "Incident Response","Integration Capabilities",
  "Integration with Existing Infrastructure",
  "Internationalisation & Localisation",
  "Monitoring & Detection",
  "Monitoring & Detection / Auditability & Traceability",
  "Multi-Platform Access",
  "Multi-site, Multi-tenant & Geographic Distribution",
  "Network Architecture & Design",
  "Network Architecture Flexibility",
  "Network Connectivity",
  "Network Management",
  "OT-Specific Requirements",
  "Offline Operations",
  "Operational Continuity & Minimal Disruption",
  "Performance & Scalability",
  "Physical Infrastructure",
  "Regulatory Compliance","Remote Access",
  "Remote Management & Monitoring",
  "Reporting & Compliance Visibility",
  "Resource Efficiency",
  "Secure Data Flow",
  "Secure Gateway & DMZ",
  "Security Assessment & Vulnerability Management",
  "Security Zone",
  "Sensor Deployment Architecture",
  "Supportability & Maintenance",
  "Sustainability & Environmental Impact",
  "Technology Integration & Future Compatibility",
  "Testing & Simulation",
  "Time Synchronisation & Management",
  "Training & Knowledge Management",
  "Troubleshooting & Maintenance",
  "Usability & Accessibility",
  "Virtual Infrastructure",
  "Virtualization & Deployment",
  "Visualisation & User Interface",
  "Visualization & User Interface",
  "Voice & Alternative Interfaces"
];