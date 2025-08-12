const DEFAULT_STATUS = 'not-assessed';
const OUTCOME_STATUS = ['achieved', 'partially', 'not-achieved', 'not-assessed'];

const CAF_OBJECTIVES = [
  {
    id: 'A',
    name: 'Managing Security Risk',
    description: 'Appropriate organizational structures, policies, and processes in place to understand, assess and systematically manage security risks to the network and information systems supporting essential functions.'
  },
  {
    id: 'B',
    name: 'Protecting Against Cyber Attack',
    description: 'Proportionate security measures in place to protect essential functions and services from cyber attack.'
  },
  {
    id: 'C',
    name: 'Detecting Cyber Security Events',
    description: 'Capabilities to ensure security defences remain effective and to detect cyber security events affecting, or with the potential to affect, essential functions.'
  },
  {
    id: 'D',
    name: 'Minimising Impact of Cyber Security Incidents',
    description: 'Capabilities to minimise the impact of a cyber security incident on the delivery of essential functions, including the restoration of those functions if required.'
  }
];

const CAF_PRINCIPLES = {
  'A': [
    {
      id: 'A1',
      name: 'Governance',
      description: 'Establishing effective security governance and management responsibility for the security of network and information systems.'
    },
    {
      id: 'A2',
      name: 'Risk Management',
      description: 'Identification, assessment and understanding of security risks to the network and information systems supporting essential functions.'
    },
    {
      id: 'A3',
      name: 'Asset Management',
      description: 'Effective management and understanding of all systems and assets supporting essential functions.'
    },
    {
      id: 'A4',
      name: 'Supply Chain',
      description: 'Understanding and managing security risks from dependencies on external suppliers and service providers.'
    }
  ],
  'B': [
    {
      id: 'B1',
      name: 'Service Protection Policies and Processes',
      description: 'Defining and communicating appropriate organizational policies and processes to secure systems and data that support delivery of essential functions.'
    },
    {
      id: 'B2',
      name: 'Identity and Access Control',
      description: 'Understanding, documenting and managing access to systems and data supporting the delivery of essential functions.'
    },
    {
      id: 'B3',
      name: 'Data Security',
      description: 'Protecting data within networks and information systems supporting essential functions.'
    },
    {
      id: 'B4',
      name: 'System Security',
      description: 'Protecting critical systems and components supporting essential functions against cyber attack.'
    },
    {
      id: 'B5',
      name: 'Resilient Networks and Systems',
      description: 'Building resilience against cyber attack and system failure into the design, implementation, operation and management of systems supporting essential functions.'
    },
    {
      id: 'B6',
      name: 'Staff Awareness and Training',
      description: 'Promoting appropriate cyber security culture and providing cyber security awareness education and training.'
    }
  ],
  'C': [
    {
      id: 'C1',
      name: 'Security Monitoring',
      description: 'Monitoring the security status of networks and systems supporting essential functions to detect potential security issues and track the ongoing effectiveness of protective security measures.'
    },
    {
      id: 'C2',
      name: 'Proactive Security Event Discovery',
      description: 'Detecting, identifying and investigating anomalous security events in systems supporting essential functions.'
    }
  ],
  'D': [
    {
      id: 'D1',
      name: 'Response and Recovery Planning',
      description: 'Establishing effective incident management processes to minimize the impact of cyber security incidents on essential functions.'
    },
    {
      id: 'D2',
      name: 'Lessons Learned',
      description: 'Learning from cyber security incidents to improve incident response processes and prevent recurrence of incidents.'
    }
  ]
};

const CAF_OUTCOMES = {
  'A1': [
    { id: 'A1.a', name: 'Board Direction' },
    { id: 'A1.b', name: 'Roles and Responsibilities' },
    { id: 'A1.c', name: 'Decision-making' }
  ],
  'A2': [
    { id: 'A2.a', name: 'Risk Management Process' },
    { id: 'A2.b', name: 'Understanding Threat' }
  ],
  'A3': [
    { id: 'A3.a', name: 'Asset Management' },
    { id: 'A3.b', name: 'Placeholder - Asset Lifecycle Management' },
    { id: 'A3.c', name: 'Placeholder - Asset Configuration' }
  ],
  'A4': [
    { id: 'A4.a', name: 'Supply Chain Management' },
    { id: 'A4.b', name: 'Software Security' }
  ],
  'B1': [
    { id: 'B1.a', name: 'Policy and Process Development' },
    { id: 'B1.b', name: 'Policy and Process Information' },
    { id: 'B1.c', name: 'Placeholder - Policy Compliance Monitoring' }
  ],
  'B2': [
    { id: 'B2.a', name: 'Identity Verification, Authentication and Authorisation' },
    { id: 'B2.b', name: 'Device Management' },
    { id: 'B2.c', name: 'Privileged User Management' }
  ],
  'B3': [
    { id: 'B3.a', name: 'Placeholder - Data Protection' },
    { id: 'B3.b', name: 'Placeholder - Data in Transit' },
    { id: 'B3.c', name: 'Placeholder - Data at Rest' }
  ],
  'B4': [
    { id: 'B4.a', name: 'Placeholder - Secure System Design' },
    { id: 'B4.b', name: 'Placeholder - Secure System Configuration' },
    { id: 'B4.c', name: 'Placeholder - Secure System Management' }
  ],
  'B5': [
    { id: 'B5.a', name: 'Placeholder - Resilient Architecture' },
    { id: 'B5.b', name: 'Placeholder - Redundancy and Failover' },
    { id: 'B5.c', name: 'Placeholder - Backup and Recovery' }
  ],
  'B6': [
    { id: 'B6.a', name: 'Placeholder - Cyber Security Culture' },
    { id: 'B6.b', name: 'Placeholder - Cyber Security Training' }
  ],
  'C1': [
    { id: 'C1.a', name: 'Monitoring Coverage' },
    { id: 'C1.b', name: 'Placeholder - Monitoring Systems' },
    { id: 'C1.c', name: 'Placeholder - Monitoring Alerts' },
    { id: 'C1.d', name: 'Placeholder - Monitoring Capability' },
    { id: 'C1.e', name: 'Placeholder - Monitoring Analysis' },
    { id: 'C1.f', name: 'Understanding User & System Behaviour' }
  ],
  'C2': [
    { id: 'C2.a', name: 'Vulnerability Management' },
    { id: 'C2.b', name: 'Threat Hunting' },
    { id: 'C2.c', name: 'Placeholder - Active Discovery' }
  ],
  'D1': [
    { id: 'D1.a', name: 'Response Plan' },
    { id: 'D1.b', name: 'Response and Recovery Capability' },
    { id: 'D1.c', name: 'Testing and Exercising' }
  ],
  'D2': [
    { id: 'D2.a', name: 'Incident Root Cause Analysis' },
    { id: 'D2.b', name: 'Placeholder - Continuous Improvement' },
    { id: 'D2.c', name: 'Placeholder - Lessons Implementation' }
  ]
};

const CAF_STATS = {
  objectives: 4,
  principles: 14,
  outcomes: 41,
  igps: 551
};

const createDefaultAssessment = () => {
  const assessment = {};
  
  Object.keys(CAF_OUTCOMES).forEach(principleId => {
    CAF_OUTCOMES[principleId].forEach(outcome => {
      assessment[outcome.id] = DEFAULT_STATUS;
    });
  });
  
  return assessment;
};

const getOverallProgress = (assessment) => {
  let achieved = 0;
  let partially = 0;
  let notAchieved = 0;
  let notAssessed = 0;
  let total = 0;
  
  Object.keys(CAF_OUTCOMES).forEach(principleId => {
    CAF_OUTCOMES[principleId].forEach(outcome => {
      total++;
      const status = assessment[outcome.id] || DEFAULT_STATUS;
      
      if (status === 'achieved') achieved++;
      else if (status === 'partially') partially++;
      else if (status === 'not-achieved') notAchieved++;
      else notAssessed++;
    });
  });
  
  const completionPct = total > 0 ? ((achieved + (partially * 0.5)) / total) * 100 : 0;
  
  return {
    achieved,
    partially,
    notAchieved,
    notAssessed,
    total,
    completionPct
  };
};

const getPrincipleProgress = (assessment, principleId) => {
  if (!CAF_OUTCOMES[principleId]) {
    return {
      achieved: 0,
      partially: 0,
      notAchieved: 0,
      notAssessed: 0,
      total: 0,
      completionPct: 0
    };
  }
  
  let achieved = 0;
  let partially = 0;
  let notAchieved = 0;
  let notAssessed = 0;
  const total = CAF_OUTCOMES[principleId].length;
  
  CAF_OUTCOMES[principleId].forEach(outcome => {
    const status = assessment[outcome.id] || DEFAULT_STATUS;
    
    if (status === 'achieved') achieved++;
    else if (status === 'partially') partially++;
    else if (status === 'not-achieved') notAchieved++;
    else notAssessed++;
  });
  
  const completionPct = total > 0 ? ((achieved + (partially * 0.5)) / total) * 100 : 0;
  
  return {
    achieved,
    partially,
    notAchieved,
    notAssessed,
    total,
    completionPct
  };
};

const getObjectiveProgress = (assessment, objectiveId) => {
  if (!CAF_PRINCIPLES[objectiveId]) {
    return {
      achieved: 0,
      partially: 0,
      notAchieved: 0,
      notAssessed: 0,
      total: 0,
      completionPct: 0
    };
  }
  
  let achieved = 0;
  let partially = 0;
  let notAchieved = 0;
  let notAssessed = 0;
  let total = 0;
  
  CAF_PRINCIPLES[objectiveId].forEach(principle => {
    if (CAF_OUTCOMES[principle.id]) {
      CAF_OUTCOMES[principle.id].forEach(outcome => {
        total++;
        const status = assessment[outcome.id] || DEFAULT_STATUS;
        
        if (status === 'achieved') achieved++;
        else if (status === 'partially') partially++;
        else if (status === 'not-achieved') notAchieved++;
        else notAssessed++;
      });
    }
  });
  
  const completionPct = total > 0 ? ((achieved + (partially * 0.5)) / total) * 100 : 0;
  
  return {
    achieved,
    partially,
    notAchieved,
    notAssessed,
    total,
    completionPct
  };
};

export {
  CAF_OBJECTIVES,
  CAF_PRINCIPLES,
  CAF_OUTCOMES,
  CAF_STATS,
  DEFAULT_STATUS,
  OUTCOME_STATUS,
  createDefaultAssessment,
  getOverallProgress,
  getPrincipleProgress,
  getObjectiveProgress
};
