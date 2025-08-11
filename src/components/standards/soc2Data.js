const SOC2_STATUS = ['implemented', 'partial', 'not-implemented', 'not-assessed'];
const DEFAULT_STATUS = 'not-assessed';

const SOC2_CATEGORIES = [
  {
    id: 'security',
    name: 'Security (Common Criteria)',
    description: 'Protection against unauthorized access and system damage, forming the mandatory foundation of every SOC 2 assessment.',
    mandatory: true
  },
  {
    id: 'availability',
    name: 'Availability',
    description: 'The system is available for operation and use as committed or agreed to meet the entity\'s objectives.',
    mandatory: false
  },
  {
    id: 'processing',
    name: 'Processing Integrity',
    description: 'System processing is complete, valid, accurate, timely, and authorized to meet the entity\'s objectives.',
    mandatory: false
  },
  {
    id: 'confidentiality',
    name: 'Confidentiality',
    description: 'Information designated as confidential is protected as committed or agreed to meet the entity\'s objectives.',
    mandatory: false
  },
  {
    id: 'privacy',
    name: 'Privacy',
    description: 'Personal information is collected, used, retained, disclosed, and disposed of in conformity with commitments and system requirements.',
    mandatory: false
  }
];

const SOC2_STRUCTURE = {
  'security': {
    id: 'security',
    name: 'Security (Common Criteria)',
    sections: {
      'CC1': {
        id: 'CC1',
        name: 'Control Environment',
        points: [
          { id: 'CC1.1', name: 'Demonstrates Commitment to Integrity and Ethical Values' },
          { id: 'CC1.2', name: 'Board of Directors Demonstrates Independence and Oversight' },
          { id: 'CC1.3', name: 'Management Establishes Structures, Reporting Lines, and Authorities' },
          { id: 'CC1.4', name: 'Demonstrates Commitment to Competence' },
          { id: 'CC1.5', name: 'Enforces Accountability' }
        ]
      },
      'CC2': {
        id: 'CC2',
        name: 'Communication and Information',
        points: [
          { id: 'CC2.1', name: 'Obtains or Generates Quality Information' },
          { id: 'CC2.2', name: 'Communicates Internal Control Information Internally' },
          { id: 'CC2.3', name: 'Communicates with External Parties' }
        ]
      },
      'CC3': {
        id: 'CC3',
        name: 'Risk Assessment',
        points: [
          { id: 'CC3.1', name: 'Specifies Suitable Objectives' },
          { id: 'CC3.2', name: 'Identifies and Analyzes Risk' },
          { id: 'CC3.3', name: 'Considers Fraud Risk' },
          { id: 'CC3.4', name: 'Identifies and Assesses Changes' }
        ]
      },
      'CC4': {
        id: 'CC4',
        name: 'Monitoring Activities',
        points: [
          { id: 'CC4.1', name: 'Evaluates Ongoing and Separate Evaluations' },
          { id: 'CC4.2', name: 'Communicates Deficiencies' }
        ]
      },
      'CC5': {
        id: 'CC5',
        name: 'Control Activities',
        points: [
          { id: 'CC5.1', name: 'Selects and Develops Control Activities' },
          { id: 'CC5.2', name: 'Selects and Develops General Controls Over Technology' },
          { id: 'CC5.3', name: 'Deploys Through Policies and Procedures' }
        ]
      },
      'CC6': {
        id: 'CC6',
        name: 'Logical and Physical Access Controls',
        points: [
          { id: 'CC6.1', name: 'Manages Logical Access Security Architecture' },
          { id: 'CC6.2', name: 'Manages User Registration and Authorization' },
          { id: 'CC6.3', name: 'Manages Role-Based Access Control' },
          { id: 'CC6.4', name: 'Restricts Physical Facility Access' },
          { id: 'CC6.5', name: 'Manages Asset Protection and Discontinuation' },
          { id: 'CC6.6', name: 'Implements Boundary Security Measures' },
          { id: 'CC6.7', name: 'Manages Information Transmission Controls' },
          { id: 'CC6.8', name: 'Implements Controls for Malware Prevention' }
        ]
      },
      'CC7': {
        id: 'CC7',
        name: 'System Operations',
        points: [
          { id: 'CC7.1', name: 'Manages System Vulnerabilities' },
          { id: 'CC7.2', name: 'Monitors System Anomalies' },
          { id: 'CC7.3', name: 'Evaluates Security Events' },
          { id: 'CC7.4', name: 'Implements Incident Response Programs' },
          { id: 'CC7.5', name: 'Establishes Recovery Activities' }
        ]
      },
      'CC8': {
        id: 'CC8',
        name: 'Change Management',
        points: [
          { id: 'CC8.1', name: 'Authorizes, Designs, Develops, and Implements Changes' }
        ]
      },
      'CC9': {
        id: 'CC9',
        name: 'Risk Mitigation',
        points: [
          { id: 'CC9.1', name: 'Identifies and Evaluates Risk Mitigation Alternatives' },
          { id: 'CC9.2', name: 'Manages Vendor Risk Management' }
        ]
      }
    }
  },
  'availability': {
    id: 'availability',
    name: 'Availability',
    sections: {
      'A1': {
        id: 'A1',
        name: 'Additional Criteria for Availability',
        points: [
          { id: 'A1.1', name: 'Maintains Current Processing Capacity and Usage' },
          { id: 'A1.2', name: 'Implements Business Continuity Plan' },
          { id: 'A1.3', name: 'Tests Recovery Plan Procedures' }
        ]
      }
    }
  },
  'processing': {
    id: 'processing',
    name: 'Processing Integrity',
    sections: {
      'PI1': {
        id: 'PI1',
        name: 'Additional Criteria for Processing Integrity',
        points: [
          { id: 'PI1.1', name: 'Uses Defined Quality Information' },
          { id: 'PI1.2', name: 'System Inputs Are Complete and Accurate' },
          { id: 'PI1.3', name: 'Processing Controls' },
          { id: 'PI1.4', name: 'Output Controls' },
          { id: 'PI1.5', name: 'Data Storage Protection and Archiving' }
        ]
      }
    }
  },
  'confidentiality': {
    id: 'confidentiality',
    name: 'Confidentiality',
    sections: {
      'C1': {
        id: 'C1',
        name: 'Additional Criteria for Confidentiality',
        points: [
          { id: 'C1.1', name: 'Identifies and Maintains Confidential Information' },
          { id: 'C1.2', name: 'Disposes of Confidential Information' }
        ]
      }
    }
  },
  'privacy': {
    id: 'privacy',
    name: 'Privacy',
    sections: {
      'P1': {
        id: 'P1',
        name: 'Notice and Communication',
        points: [
          { id: 'P1.1', name: 'Notice - Provides Notice to Data Subjects' }
        ]
      },
      'P2': {
        id: 'P2',
        name: 'Choice and Consent',
        points: [
          { id: 'P2.1', name: 'Choice and Consent - Communicates Choices Available' }
        ]
      },
      'P3': {
        id: 'P3',
        name: 'Collection',
        points: [
          { id: 'P3.1', name: 'Collection - Collects Personal Information' },
          { id: 'P3.2', name: 'Explicit Consent Requirements' }
        ]
      },
      'P4': {
        id: 'P4',
        name: 'Use, Retention, and Disposal',
        points: [
          { id: 'P4.1', name: 'Use Limitations' },
          { id: 'P4.2', name: 'Retention Policies' },
          { id: 'P4.3', name: 'Disposal Procedures' }
        ]
      },
      'P5': {
        id: 'P5',
        name: 'Access',
        points: [
          { id: 'P5.1', name: 'Access Rights' },
          { id: 'P5.2', name: 'Correction Procedures' }
        ]
      },
      'P6': {
        id: 'P6',
        name: 'Disclosure and Notification',
        points: [
          { id: 'P6.1', name: 'Disclosure Authorization' },
          { id: 'P6.2', name: 'Third-Party Disclosure' },
          { id: 'P6.3', name: 'Notification of Changes' },
          { id: 'P6.4', name: 'Breach Notification' },
          { id: 'P6.5', name: 'Regulatory Compliance' },
          { id: 'P6.6', name: 'Privacy Commitments' },
          { id: 'P6.7', name: 'Privacy Impact Assessments' }
        ]
      },
      'P7': {
        id: 'P7',
        name: 'Quality',
        points: [
          { id: 'P7.1', name: 'Data Quality Maintenance' }
        ]
      },
      'P8': {
        id: 'P8',
        name: 'Monitoring and Enforcement',
        points: [
          { id: 'P8.1', name: 'Privacy Monitoring Procedures' }
        ]
      }
    }
  }
};

const SOC2_STATS = {
  categories: 5,
  totalCriteria: 61,
  commonCriteria: 33,
  pointsOfFocus: 300
};

const createDefaultAssessment = () => {
  const assessment = {};
  
  Object.keys(SOC2_STRUCTURE).forEach(categoryId => {
    const category = SOC2_STRUCTURE[categoryId];
    Object.keys(category.sections).forEach(sectionId => {
      const section = category.sections[sectionId];
      section.points.forEach(point => {
        assessment[point.id] = DEFAULT_STATUS;
      });
    });
  });
  
  return assessment;
};

const getCountsForCategories = (assessment, selectedCategories) => {
  let implemented = 0;
  let partial = 0;
  let notImplemented = 0;
  let notAssessed = 0;
  let total = 0;
  
  selectedCategories.forEach(categoryId => {
    if (SOC2_STRUCTURE[categoryId]) {
      const category = SOC2_STRUCTURE[categoryId];
      Object.keys(category.sections).forEach(sectionId => {
        const section = category.sections[sectionId];
        section.points.forEach(point => {
          total++;
          const status = assessment[point.id] || DEFAULT_STATUS;
          
          if (status === 'implemented') implemented++;
          else if (status === 'partial') partial++;
          else if (status === 'not-implemented') notImplemented++;
          else notAssessed++;
        });
      });
    }
  });
  
  const completionPct = total > 0 ? ((implemented + (partial * 0.5)) / total) * 100 : 0;
  
  return {
    implemented,
    partial,
    notImplemented,
    notAssessed,
    total,
    completionPct
  };
};

const getCategoryProgress = (assessment, categoryId) => {
  if (!SOC2_STRUCTURE[categoryId]) {
    return {
      implemented: 0,
      partial: 0,
      notImplemented: 0,
      notAssessed: 0,
      total: 0,
      completionPct: 0
    };
  }
  
  let implemented = 0;
  let partial = 0;
  let notImplemented = 0;
  let notAssessed = 0;
  let total = 0;
  
  const category = SOC2_STRUCTURE[categoryId];
  Object.keys(category.sections).forEach(sectionId => {
    const section = category.sections[sectionId];
    section.points.forEach(point => {
      total++;
      const status = assessment[point.id] || DEFAULT_STATUS;
      
      if (status === 'implemented') implemented++;
      else if (status === 'partial') partial++;
      else if (status === 'not-implemented') notImplemented++;
      else notAssessed++;
    });
  });
  
  const completionPct = total > 0 ? ((implemented + (partial * 0.5)) / total) * 100 : 0;
  
  return {
    implemented,
    partial,
    notImplemented,
    notAssessed,
    total,
    completionPct
  };
};

const getSectionProgress = (assessment, categoryId, sectionId) => {
  if (!SOC2_STRUCTURE[categoryId] || !SOC2_STRUCTURE[categoryId].sections[sectionId]) {
    return {
      implemented: 0,
      partial: 0,
      notImplemented: 0,
      notAssessed: 0,
      total: 0,
      completionPct: 0
    };
  }
  
  let implemented = 0;
  let partial = 0;
  let notImplemented = 0;
  let notAssessed = 0;
  
  const section = SOC2_STRUCTURE[categoryId].sections[sectionId];
  const total = section.points.length;
  
  section.points.forEach(point => {
    const status = assessment[point.id] || DEFAULT_STATUS;
    
    if (status === 'implemented') implemented++;
    else if (status === 'partial') partial++;
    else if (status === 'not-implemented') notImplemented++;
    else notAssessed++;
  });
  
  const completionPct = total > 0 ? ((implemented + (partial * 0.5)) / total) * 100 : 0;
  
  return {
    implemented,
    partial,
    notImplemented,
    notAssessed,
    total,
    completionPct
  };
};

export {
  SOC2_CATEGORIES,
  SOC2_STRUCTURE,
  SOC2_STATS,
  SOC2_STATUS,
  DEFAULT_STATUS,
  createDefaultAssessment,
  getCountsForCategories,
  getCategoryProgress,
  getSectionProgress
};
