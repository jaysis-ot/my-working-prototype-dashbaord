// src/utils/dataService.js

// --- Constants (defined locally for now to keep this file self-contained) ---

const MATURITY_LEVELS = {
  INITIAL: { level: 'Initial', score: 1, description: 'Processes are unpredictable, poorly controlled, and reactive.' },
  DEVELOPING: { level: 'Developing', score: 2, description: 'Processes are characterized for projects and is often reactive.' },
  DEFINED: { level: 'Defined', score: 3, description: 'Processes are characterized for the organization and is proactive.' },
  MANAGED: { level: 'Managed', score: 4, description: 'Processes are measured and controlled.' },
  OPTIMIZING: { level: 'Optimizing', score: 5, description: 'Focus is on continuous process improvement.' }
};

const PROGRESS_STATUSES = {
  'Not Started': { percentage: 0, color: '#d1d5db' },
  'Feasibility': { percentage: 10, color: '#60a5fa' },
  'Qualifying': { percentage: 25, color: '#a78bfa' },
  'Delivering': { percentage: 75, color: '#facc15' },
  'Completed': { percentage: 100, color: '#4ade80' }
};

const CATEGORIES = [
  'Access Control',
  'Data Protection',
  'Network Security',
  'Incident Response',
  'Asset Management',
  'Physical Security',
  'Compliance & Governance',
  'Threat Intelligence',
  'Vulnerability Management',
  'Business Continuity'
];

// --- Data Generation and Transformation Functions ---

/**
 * Transform CSV row back to requirement object structure
 * @param {Object} csvRow - Parsed CSV row object
 * @returns {Object} - Requirement object with proper structure
 */
export const transformCSVToRequirement = (csvRow) => {
  const requirement = { ...csvRow };
  
  if (csvRow.maturityLevel_level) {
    requirement.maturityLevel = {
      level: csvRow.maturityLevel_level,
      score: parseInt(csvRow.maturityLevel_score) || 1,
      description: csvRow.maturityLevel_description || ''
    };
    delete requirement.maturityLevel_level;
    delete requirement.maturityLevel_score;
    delete requirement.maturityLevel_description;
  }
  
  if (csvRow.applicability_type) {
    requirement.applicability = csvRow.applicability_type;
    delete requirement.applicability_type;
  }
  
  if (requirement.businessValueScore) {
    const value = parseFloat(requirement.businessValueScore);
    requirement.businessValueScore = isNaN(value) ? 0 : Math.max(1, Math.min(5, value));
  }
  
  if (requirement.progress) {
    const value = parseInt(requirement.progress);
    requirement.progress = isNaN(value) ? 0 : Math.max(0, Math.min(100, value));
  }
  
  requirement.id = requirement.id || `REQ-${Date.now()}`;
  requirement.description = requirement.description || 'Imported requirement';
  requirement.status = requirement.status || 'Not Started';
  requirement.priority = requirement.priority || 'Medium';
  requirement.area = requirement.area || 'System';
  requirement.type = requirement.type || 'Functional';
  requirement.lastUpdated = new Date().toISOString().split('T')[0];
  
  return requirement;
};

/**
 * Generate comprehensive mock capabilities data
 * @returns {Array} - Array of capability objects
 */
export const generateMockCapabilities = () => {
  return [
    {
      id: 'CAP-001',
      name: 'Network Segmentation',
      description: 'Implement comprehensive network segmentation to isolate OT environments from IT networks and external threats.',
      status: 'In Progress',
      businessValue: 4.8,
      estimatedROI: 180,
    },
    {
      id: 'CAP-002',
      name: 'Identity & Access Management',
      description: 'Establish robust identity and access controls for OT environments with multi-factor authentication and role-based access.',
      status: 'Planning',
      businessValue: 4.5,
      estimatedROI: 150,
    },
    {
      id: 'CAP-003',
      name: 'OT Security Monitoring',
      description: 'Deploy comprehensive monitoring and detection capabilities for OT networks and devices.',
      status: 'Not Started',
      businessValue: 4.2,
      estimatedROI: 165,
    },
  ];
};

/**
 * Generate comprehensive mock requirements data
 * @returns {Array} - Array of 75 requirement objects
 */
export const generateMockData = () => {
  const mockData = [];
  const areas = ['Business', 'User', 'System', 'Infrastructure'];
  const types = ['Functional', 'Non-Functional'];
  const statuses = ['Not Started', 'In Progress', 'Completed', 'On Hold', 'Under Review'];
  const priorities = ['Low', 'Medium', 'High', 'Critical'];
  const progressStatusKeys = Object.keys(PROGRESS_STATUSES);
  const maturityLevels = Object.values(MATURITY_LEVELS);
  const applicabilityTypes = ['Not Applicable', 'Applicable', 'Conditional'];
  const assignees = ['Security Team', 'Network Team', 'Identity Team', 'Operations Team', 'Engineering Team'];

  for (let i = 1; i <= 75; i++) {
    const area = areas[i % areas.length];
    const type = types[i % types.length];
    const category = CATEGORIES[i % CATEGORIES.length];
    const status = statuses[i % statuses.length];
    const priority = priorities[i % priorities.length];
    const progressStatusKey = progressStatusKeys[i % progressStatusKeys.length];
    const progressStatus = PROGRESS_STATUSES[progressStatusKey];
    const maturityLevel = maturityLevels[i % maturityLevels.length];
    const applicabilityType = applicabilityTypes[i % applicabilityTypes.length];
    const assignee = assignees[i % assignees.length];

    const areaCode = area.substring(0, 2).toUpperCase();
    const typeCode = type.substring(0, 1);
    const idNumber = i.toString().padStart(3, '0');
    
    let businessValue = +(Math.random() * 4 + 1).toFixed(1);
    if (priority === 'Critical') businessValue = Math.max(businessValue, 4.0);
    
    const costEstimate = Math.floor(Math.random() * 400000) + 50000;
    
    const dueDate = new Date();
    dueDate.setMonth(dueDate.getMonth() + (i % 12) + 1);

    const requirement = {
      id: `${areaCode}-${typeCode}${idNumber}`,
      area,
      type,
      category,
      capabilityId: `OT-${2021 + (i % 3)}-${['NS', 'IAM', 'OTM', 'DMH', 'IRP', 'VUL'][i % 6]}-T-00${(i % 6) + 1}`,
      description: `${category} requirement for ${area.toLowerCase()} stakeholders focusing on ${type.toLowerCase()} aspects. This requirement addresses critical operational needs and regulatory compliance requirements.`,
      status,
      priority,
      progressStatus: progressStatusKey,
      progress: progressStatus.percentage,
      businessValueScore: businessValue,
      costEstimate,
      maturityLevel: {
        level: maturityLevel.level,
        score: maturityLevel.score,
      },
      applicability: applicabilityType,
      businessJustification: `This ${category.toLowerCase()} capability provides critical operational benefits including enhanced security posture, improved regulatory compliance, and operational efficiency gains. The implementation supports business objectives and reduces operational risks.`,
      assignee,
      dueDate: dueDate.toISOString().split('T')[0],
      lastUpdated: new Date().toISOString().split('T')[0]
    };

    mockData.push(requirement);
  }

  return mockData;
};
