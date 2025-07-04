import React, { useState, useEffect, useMemo, useReducer, lazy, Suspense, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, ScatterChart, Scatter } from 'recharts';

// Optimized imports - only what we need
import { 
  Upload, Filter, Search, Download, AlertTriangle, CheckCircle, Clock, FileText, 
  Shield, TrendingUp, Database, Bell, Eye, ArrowRight, ChevronLeft, ChevronRight, 
  BarChart3, Maximize2, Minimize2, Star, Lightbulb, GitBranch, DollarSign, 
  Timer, Gauge, Building2, X, Edit, Users, Target, Network, Lock, Activity, Layers,
  Trash2, Save, Plus, RefreshCw
} from 'lucide-react';

// Constants - no more magic numbers
const CONSTANTS = {
  TABLE_PAGE_SIZE: 20,
  BUSINESS_VALUE_CARDS_LIMIT: 12,
  HIGH_RISK_CARDS_LIMIT: 9,
  NOTIFICATION_DISPLAY_LIMIT: 3,
  MATURITY_LEVELS: {
    INITIAL: { level: 'Initial', score: 1, description: 'Ad-hoc, no formal process' },
    DEVELOPING: { level: 'Developing', score: 2, description: 'Some processes defined' },
    DEFINED: { level: 'Defined', score: 3, description: 'Documented and standardized' },
    MANAGED: { level: 'Managed', score: 4, description: 'Measured and controlled' },
    OPTIMIZING: { level: 'Optimizing', score: 5, description: 'Continuously improving' }
  },
  PROGRESS_STATUSES: {
    'Not Started': { percentage: 0, color: '#ef4444', description: 'Requirements gathering has not begun' },
    'Gathering more context': { percentage: 25, color: '#f59e0b', description: 'Initial context and background research' },
    'Feasibility': { percentage: 50, color: '#3b82f6', description: 'Feasibility analysis and technical assessment' },
    'Qualifying': { percentage: 75, color: '#8b5cf6', description: 'Detailed qualification and validation' },
    'Completely Understood and defined': { percentage: 100, color: '#10b981', description: 'Fully defined and ready for implementation' }
  },
  COLORS: {
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
  },
  // Predefined categories from the CSV data
  CATEGORIES: [
    "Access Control & Authentication",
    "Access Control & Authentication / Remote Access",
    "Access Request & Management",
    "Advanced Technologies",
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
    "Incident Response",
    "Integration Capabilities",
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
    "Regulatory Compliance",
    "Remote Access",
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
  ]
};

// CSV Processing Utilities
const csvUtils = {
  parseCSV: (csvText) => {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      data.push(row);
    }
    
    return { headers, data };
  },
  
  generateCSV: (requirements) => {
    if (!requirements.length) return '';
    
    // Get all unique keys from all requirements to preserve dynamic fields
    const allKeys = new Set();
    requirements.forEach(req => {
      Object.keys(req).forEach(key => {
        // Flatten nested objects for CSV export
        if (typeof req[key] === 'object' && req[key] !== null) {
          if (key === 'maturityLevel') {
            allKeys.add('maturityLevel_level');
            allKeys.add('maturityLevel_score');
            allKeys.add('maturityLevel_description');
          } else if (key === 'applicability') {
            allKeys.add('applicability_type');
            allKeys.add('applicability_description');
            allKeys.add('applicability_weight');
          } else if (key === 'consequences') {
            allKeys.add('consequences_immediate');
            allKeys.add('consequences_type');
            allKeys.add('consequences_impact');
          } else {
            allKeys.add(key);
          }
        } else {
          allKeys.add(key);
        }
      });
    });
    
    const headers = Array.from(allKeys);
    let csv = headers.map(h => `"${h}"`).join(',') + '\n';
    
    requirements.forEach(req => {
      const row = headers.map(header => {
        let value = '';
        
        // Handle nested objects
        if (header.startsWith('maturityLevel_')) {
          const field = header.replace('maturityLevel_', '');
          value = req.maturityLevel?.[field] || '';
        } else if (header.startsWith('applicability_')) {
          const field = header.replace('applicability_', '');
          value = req.applicability?.[field] || '';
        } else if (header.startsWith('consequences_')) {
          const field = header.replace('consequences_', '');
          value = req.consequences?.[field] || '';
        } else {
          value = req[header] || '';
        }
        
        // Escape quotes and wrap in quotes
        return `"${String(value).replace(/"/g, '""')}"`;
      });
      csv += row.join(',') + '\n';
    });
    
    return csv;
  },
  
  downloadCSV: (csvContent, filename) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

// Data Service for CRUD operations
const dataService = {
  transformCSVToRequirement: (csvRow) => {
    // Transform CSV row back to requirement object structure
    const requirement = { ...csvRow };
    
    // Reconstruct nested objects
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
      requirement.applicability = {
        type: csvRow.applicability_type,
        description: csvRow.applicability_description || '',
        weight: parseFloat(csvRow.applicability_weight) || 0
      };
      delete requirement.applicability_type;
      delete requirement.applicability_description;
      delete requirement.applicability_weight;
    }
    
    if (csvRow.consequences_immediate) {
      requirement.consequences = {
        immediate: csvRow.consequences_immediate,
        type: csvRow.consequences_type || '',
        impact: csvRow.consequences_impact || ''
      };
      delete requirement.consequences_immediate;
      delete requirement.consequences_type;
      delete requirement.consequences_impact;
    }
    
    // Convert numeric fields
    if (requirement.businessValueScore) {
      requirement.businessValueScore = parseFloat(requirement.businessValueScore);
    }
    if (requirement.progress) {
      requirement.progress = parseInt(requirement.progress);
    }
    if (requirement.costEstimate) {
      requirement.costEstimate = parseInt(requirement.costEstimate);
    }
    if (requirement.roiProjection) {
      requirement.roiProjection = parseInt(requirement.roiProjection);
    }
    
    return requirement;
  },
  
  generateMockCapabilities: () => {
    return [
      {
        id: 'CAP-001',
        name: 'Network Segmentation',
        description: 'Implement comprehensive network segmentation to isolate OT environments from IT networks and external threats.',
        pcd: 'PCD-NS-001',
        pcdDescription: 'Network Segmentation Infrastructure Delivery',
        status: 'In Progress',
        priority: 'Critical',
        businessValue: 4.8,
        totalRequirements: 75, // All requirements currently belong to CAP-001
        completedRequirements: 18,
        category: 'Network Security',
        owner: 'Network Security Team',
        estimatedCost: 750000,
        estimatedROI: 180,
        timeline: '18 months',
        regulatoryDrivers: ['NCSC CAF', 'Ofgem Framework'],
        lastUpdated: '2025-06-06'
      },
      {
        id: 'CAP-002',
        name: 'Identity & Access Management',
        description: 'Establish robust identity and access controls for OT environments with multi-factor authentication and role-based access.',
        pcd: 'PCD-IAM-002',
        pcdDescription: 'OT Identity Management System',
        status: 'Planning',
        priority: 'High',
        businessValue: 4.5,
        totalRequirements: 0, // No requirements assigned yet
        completedRequirements: 0,
        category: 'Access Control',
        owner: 'Identity Team',
        estimatedCost: 420000,
        estimatedROI: 150,
        timeline: '12 months',
        regulatoryDrivers: ['NCSC CAF', 'ISO 27001'],
        lastUpdated: '2025-06-05'
      },
      {
        id: 'CAP-003',
        name: 'OT Security Monitoring',
        description: 'Deploy comprehensive monitoring and detection capabilities for OT networks and devices.',
        pcd: 'PCD-MON-003',
        pcdDescription: 'OT Security Operations Center',
        status: 'Not Started',
        priority: 'High',
        businessValue: 4.2,
        totalRequirements: 0, // No requirements assigned yet
        completedRequirements: 0,
        category: 'Monitoring & Detection',
        owner: 'Operations Team',
        estimatedCost: 580000,
        estimatedROI: 165,
        timeline: '15 months',
        regulatoryDrivers: ['NCSC CAF', 'NIS Directive'],
        lastUpdated: '2025-06-04'
      },
      {
        id: 'CAP-004',
        name: 'Device Management',
        description: 'Implement centralized management for OT devices including firmware updates and configuration control.',
        pcd: 'PCD-DEV-004',
        pcdDescription: 'OT Device Lifecycle Management',
        status: 'Planning',
        priority: 'Medium',
        businessValue: 3.8,
        totalRequirements: 0, // No requirements assigned yet
        completedRequirements: 0,
        category: 'Device Security',
        owner: 'Engineering Team',
        estimatedCost: 350000,
        estimatedROI: 140,
        timeline: '10 months',
        regulatoryDrivers: ['NCSC CAF'],
        lastUpdated: '2025-06-03'
      },
      {
        id: 'CAP-005',
        name: 'Incident Response',
        description: 'Establish OT-specific incident response procedures and capabilities.',
        pcd: 'PCD-IR-005',
        pcdDescription: 'OT Incident Response Framework',
        status: 'Planning',
        priority: 'Medium',
        businessValue: 4.0,
        totalRequirements: 0, // No requirements assigned yet
        completedRequirements: 0,
        category: 'Incident Management',
        owner: 'Security Team',
        estimatedCost: 280000,
        estimatedROI: 125,
        timeline: '8 months',
        regulatoryDrivers: ['NCSC CAF', 'NIS Directive'],
        lastUpdated: '2025-06-02'
      }
    ];
  },
  
  generateMockData: () => {
    const mockData = [];
    const areas = ['Business', 'User', 'System', 'Infrastructure'];
    const types = ['Functional', 'Non-Functional'];
    
    for (let i = 1; i <= 75; i++) {
      const area = areas[Math.floor(Math.random() * areas.length)];
      const type = types[Math.floor(Math.random() * types.length)];
      const category = CONSTANTS.CATEGORIES[Math.floor(Math.random() * CONSTANTS.CATEGORIES.length)];
      const progressStatusKey = Object.keys(CONSTANTS.PROGRESS_STATUSES)[Math.floor(Math.random() * Object.keys(CONSTANTS.PROGRESS_STATUSES).length)];
      const progressStatus = CONSTANTS.PROGRESS_STATUSES[progressStatusKey];
      
      mockData.push({
        id: `${area.substring(0, 2).toUpperCase()}-${type.substring(0, 1)}${i.toString().padStart(3, '0')}`,
        area,
        type,
        category,
        capabilityId: 'CAP-001', // All requirements initially belong to CAP-001
        description: `${category} requirement for ${area.toLowerCase()} stakeholders focusing on ${type.toLowerCase()} aspects.`,
        status: ['Not Started', 'In Progress', 'Completed', 'On Hold', 'Under Review'][Math.floor(Math.random() * 5)],
        priority: ['Low', 'Medium', 'High', 'Critical'][Math.floor(Math.random() * 4)],
        progressStatus: progressStatusKey,
        progress: progressStatus.percentage,
        businessValueScore: +(Math.random() * 4 + 1).toFixed(1),
        roiProjection: Math.floor(Math.random() * 200 + 50),
        costEstimate: Math.floor(Math.random() * 500000) + 50000,
        maturityLevel: Object.values(CONSTANTS.MATURITY_LEVELS)[Math.floor(Math.random() * 5)],
        applicability: {
          type: ['Essential', 'Applicable', 'Future', 'Conditional', 'Not Applicable'][Math.floor(Math.random() * 5)],
          description: 'Applicability assessment',
          weight: Math.random()
        },
        implementationPhase: ['Phase 1 (0-6 months)', 'Phase 2 (6-12 months)', 'Phase 3 (12-24 months)'][Math.floor(Math.random() * 3)],
        businessJustification: `This ${category.toLowerCase()} capability provides critical operational benefits.`,
        consequences: {
          immediate: 'Potential security vulnerability',
          type: 'Security',
          impact: ['Minor', 'Moderate', 'Significant', 'Severe'][Math.floor(Math.random() * 4)]
        },
        assignee: ['Security Team', 'Network Team', 'Identity Team', 'Operations Team'][Math.floor(Math.random() * 4)],
        dueDate: new Date(2025, 5 + Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
        lastUpdated: new Date().toISOString().split('T')[0]
      });
    }
    
    return mockData;
  }
};

// Custom hooks for business logic separation
const useRequirementsData = () => {
  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // For demo purposes, just generate mock data directly
    try {
      const mockData = dataService.generateMockData();
      setRequirements(mockData);
      setLoading(false);
    } catch (err) {
      setError('Failed to generate requirements data');
      setLoading(false);
    }
  }, []);

  const saveData = (newRequirements) => {
    try {
      setRequirements(newRequirements);
      return true;
    } catch (err) {
      setError('Failed to save data');
      return false;
    }
  };

  const updateRequirement = (id, updatedData) => {
    const updated = requirements.map(req => 
      req.id === id ? { ...req, ...updatedData, lastUpdated: new Date().toISOString().split('T')[0] } : req
    );
    return saveData(updated);
  };

  const deleteRequirement = (id) => {
    const updated = requirements.filter(req => req.id !== id);
    return saveData(updated);
  };

  const addRequirement = (newRequirement) => {
    const updated = [...requirements, { ...newRequirement, lastUpdated: new Date().toISOString().split('T')[0] }];
    return saveData(updated);
  };

  const purgeAllData = () => {
    try {
      setRequirements([]);
      return true;
    } catch (err) {
      setError('Failed to purge data');
      return false;
    }
  };

  const importFromCSV = (csvData) => {
    try {
      const transformedData = csvData.map(row => dataService.transformCSVToRequirement(row));
      return saveData(transformedData);
    } catch (err) {
      setError('Failed to import CSV data');
      return false;
    }
  };

  return { 
    requirements, 
    loading, 
    error, 
    updateRequirement, 
    deleteRequirement, 
    addRequirement, 
    purgeAllData, 
    importFromCSV,
    saveData 
  };
};

const useCapabilitiesData = () => {
  const [capabilities, setCapabilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Generate mock capabilities
    try {
      const mockCapabilities = dataService.generateMockCapabilities();
      setCapabilities(mockCapabilities);
      setLoading(false);
    } catch (err) {
      setError('Failed to generate capabilities data');
      setLoading(false);
    }
  }, []);

  const saveCapabilities = (newCapabilities) => {
    try {
      setCapabilities(newCapabilities);
      return true;
    } catch (err) {
      setError('Failed to save capabilities data');
      return false;
    }
  };

  const updateCapability = (id, updatedData) => {
    const updated = capabilities.map(cap => 
      cap.id === id ? { ...cap, ...updatedData, lastUpdated: new Date().toISOString().split('T')[0] } : cap
    );
    return saveCapabilities(updated);
  };

  const addCapability = (newCapability) => {
    const updated = [...capabilities, { ...newCapability, lastUpdated: new Date().toISOString().split('T')[0] }];
    return saveCapabilities(updated);
  };

  return { 
    capabilities, 
    loading, 
    error, 
    updateCapability,
    addCapability,
    saveCapabilities 
  };
};

const usePCDData = () => {
  const [pcdData, setPCDData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check for existing PCD data in memory (demo data)
    const mockPCDData = {
      'PCD-NS-001': {
        id: 'PCD-NS-001',
        title: 'Network Segmentation Infrastructure Delivery',
        capabilityId: 'CAP-001',
        needsCase: 'The current OT network infrastructure lacks adequate segmentation between operational technology and information technology systems, creating significant cybersecurity risks and potential for cascading failures across critical energy infrastructure.',
        businessPlan: 'This initiative will implement comprehensive network segmentation across all OT environments, establishing secure zones and implementing defense-in-depth strategies aligned with NCSC CAF guidance and Ofgem requirements.',
        basisOfCost: 'Cost estimation based on:\n• Hardware procurement (firewalls, switches, monitoring tools)\n• Software licensing (security tools, management platforms)\n• Professional services (design, implementation, testing)\n• Training and certification\n• Ongoing operational costs',
        alignmentToProjects: ['Digital Transformation Programme', 'Cybersecurity Enhancement Initiative', 'OT Modernisation Project'],
        scopeBoundary: 'Includes all primary substations, control centers, and generation facilities. Excludes legacy systems scheduled for decommission within 12 months.',
        businessOutcomes: [
          'Reduced cybersecurity risk exposure by 70%',
          'Improved operational resilience and availability',
          'Enhanced regulatory compliance (NCSC CAF, NIS Directive)',
          'Foundation for future digital initiatives'
        ],
        keyRisks: [
          {
            type: 'Risk',
            description: 'Implementation could disrupt critical operations',
            impact: 'High',
            approach: 'Phased implementation during planned maintenance windows'
          },
          {
            type: 'Opportunity',
            description: 'Enhanced monitoring capabilities',
            impact: 'Medium',
            approach: 'Implement advanced analytics and AI-driven threat detection'
          }
        ],
        dependencies: [
          'Completion of network topology assessment',
          'Approval of cybersecurity architecture standards',
          'Availability of certified technical resources'
        ],
        assumptions: [
          'Current network infrastructure can support additional security controls',
          'Operational teams will be available for training during implementation',
          'Regulatory requirements will remain stable during delivery period'
        ],
        highLevelPlan: [
          { phase: 'Phase 1: Design & Planning', duration: '3 months', activities: ['Architecture design', 'Procurement', 'Resource allocation'] },
          { phase: 'Phase 2: Pilot Implementation', duration: '2 months', activities: ['Pilot site setup', 'Testing', 'Validation'] },
          { phase: 'Phase 3: Rollout', duration: '12 months', activities: ['Site-by-site implementation', 'Training', 'Handover'] },
          { phase: 'Phase 4: Optimization', duration: '1 month', activities: ['Performance tuning', 'Documentation', 'Knowledge transfer'] }
        ],
        forecast: {
          year1: { capex: 450000, opex: 125000 },
          year2: { capex: 200000, opex: 150000 },
          year3: { capex: 100000, opex: 175000 }
        },
        cafAlignment: [
          {
            nistFunction: 'Identify',
            cafControlArea: 'Asset Management',
            keyControlGaps: 'Incomplete OT asset inventory',
            controlImprovement: 'Implement automated asset discovery and classification',
            positiveContribution: 'Enhanced visibility of all network connected devices'
          },
          {
            nistFunction: 'Protect',
            cafControlArea: 'Access Control',
            keyControlGaps: 'Insufficient network segmentation',
            controlImprovement: 'Deploy microsegmentation with zero-trust principles',
            positiveContribution: 'Reduced attack surface and lateral movement prevention'
          }
        ],
        riskTable: [
          {
            primaryRisk: 'Cyber Attack via IT/OT Bridge',
            threatFamily: 'Advanced Persistent Threat',
            scenario: 'Attacker compromises IT network and pivots to OT systems',
            controlNarrative: 'Network segmentation with monitoring and access controls',
            riskReduction: 'High - 70% reduction in attack probability'
          }
        ],
        pcdOverview: {
          overview: 'Comprehensive network segmentation initiative to enhance cybersecurity posture',
          pcdId: 'PCD-NS-001',
          output: 'Segmented OT network infrastructure with enhanced monitoring',
          deliveryDate: '2026-12-31',
          allowance: '£975,000'
        },
        costAssumptions: [
          { roleItem: 'Project Manager', year1: 85000, year2: 87000, year3: 89000 },
          { roleItem: 'Security Architect', year1: 95000, year2: 97000, year3: 99000 },
          { roleItem: 'Network Engineers (2)', year1: 140000, year2: 143000, year3: 146000 },
          { roleItem: 'Hardware & Software', year1: 300000, year2: 100000, year3: 50000 },
          { roleItem: 'Training & Certification', year1: 45000, year2: 23000, year3: 15000 }
        ]
      }
    };
    
    setPCDData(mockPCDData);
    setLoading(false);
  }, []);

  const updatePCDData = (pcdId, updatedData) => {
    try {
      setPCDData(prev => ({
        ...prev,
        [pcdId]: { ...prev[pcdId], ...updatedData }
      }));
      return true;
    } catch (err) {
      setError('Failed to update PCD data');
      return false;
    }
  };

  return { 
    pcdData, 
    loading, 
    error, 
    updatePCDData 
  };
};
  return useMemo(() => {
    if (!requirements.length) return [];
    
    return requirements.filter(req => {
      const matchesSearch = !searchTerm || 
        req.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.businessJustification?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilters = 
        (!filters.area || req.area === filters.area) &&
        (!filters.type || req.type === filters.type) &&
        (!filters.status || req.status === filters.status) &&
        (!filters.maturityLevel || req.maturityLevel?.level === filters.maturityLevel) &&
        (!filters.applicability || req.applicability?.type === filters.applicability) &&
        (!filters.capability || req.capabilityId === filters.capability);
      
      return matchesSearch && matchesFilters;
    });
  }, [requirements, filters, searchTerm]);
};

const useRequirementsFilter = (requirements, filters, searchTerm) => {
  return useMemo(() => {
    if (!requirements.length) return { statusData: [], maturityData: [], businessValueData: [] };

    const statusCounts = requirements.reduce((acc, req) => {
      acc[req.status] = (acc[req.status] || 0) + 1;
      return acc;
    }, {});

    const maturityCounts = requirements.reduce((acc, req) => {
      const level = req.maturityLevel?.level || 'Unknown';
      acc[level] = (acc[level] || 0) + 1;
      return acc;
    }, {});

    const businessValueData = requirements.map(req => ({
      id: req.id,
      businessValue: req.businessValueScore || 0,
      cost: (req.costEstimate || 0) / 1000,
      category: req.category
    }));

    return {
      statusData: Object.entries(statusCounts).map(([status, count]) => ({ 
        status, 
        count, 
        percentage: (count / requirements.length * 100).toFixed(1) 
      })),
      maturityData: Object.entries(maturityCounts).map(([level, count]) => ({ 
        level, 
        count, 
        percentage: (count / requirements.length * 100).toFixed(1) 
      })),
      businessValueData
    };
  }, [requirements]);
};

// State management with useReducer
const initialState = {
  filters: {
    area: '',
    type: '',
    status: '',
    priority: '',
    maturityLevel: '',
    applicability: '',
    capability: ''
  },
  ui: {
    viewMode: 'overview',
    sidebarExpanded: true,
    activeFilters: false,
    chartFullscreen: null,
    showUploadModal: false,
    showPurgeModal: false,
    showNewCapabilityModal: false,
    showColumnSelector: false,
    selectedCapability: null,
    selectedPCD: null
  },
  modal: {
    isOpen: false,
    selectedRequirement: null,
    editMode: false
  },
  searchTerm: '',
  columnVisibility: {
    id: true,
    description: true,
    capability: true,
    progressStatus: true,
    businessValue: true,
    maturity: true,
    applicability: true,
    status: true,
    actions: true,
    area: false,
    type: false,
    priority: false,
    assignee: false,
    dueDate: false
  }
};

const dashboardReducer = (state, action) => {
  switch (action.type) {
    case 'SET_FILTER':
      return {
        ...state,
        filters: { ...state.filters, [action.field]: action.value }
      };
    case 'CLEAR_FILTERS':
      return {
        ...state,
        filters: initialState.filters
      };
    case 'CLEAR_SEARCH':
      return {
        ...state,
        searchTerm: ''
      };
    case 'SET_VIEW_MODE':
      return {
        ...state,
        ui: { ...state.ui, viewMode: action.viewMode }
      };
    case 'TOGGLE_SIDEBAR':
      return {
        ...state,
        ui: { ...state.ui, sidebarExpanded: !state.ui.sidebarExpanded }
      };
    case 'TOGGLE_FILTERS':
      return {
        ...state,
        ui: { ...state.ui, activeFilters: !state.ui.activeFilters }
      };
    case 'TOGGLE_COLUMN_SELECTOR':
      return {
        ...state,
        ui: { ...state.ui, showColumnSelector: !state.ui.showColumnSelector }
      };
    case 'TOGGLE_COLUMN_VISIBILITY':
      return {
        ...state,
        columnVisibility: { ...state.columnVisibility, [action.column]: !state.columnVisibility[action.column] }
      };
    case 'OPEN_MODAL':
      return {
        ...state,
        modal: { isOpen: true, selectedRequirement: action.requirement, editMode: action.editMode || false }
      };
    case 'CLOSE_MODAL':
      return {
        ...state,
        modal: { isOpen: false, selectedRequirement: null, editMode: false }
      };
    case 'SET_SEARCH_TERM':
      return {
        ...state,
        searchTerm: action.searchTerm
      };
    case 'SET_CHART_FULLSCREEN':
      return {
        ...state,
        ui: { ...state.ui, chartFullscreen: action.chartId }
      };
    case 'TOGGLE_UPLOAD_MODAL':
      return {
        ...state,
        ui: { ...state.ui, showUploadModal: !state.ui.showUploadModal }
      };
    case 'TOGGLE_PURGE_MODAL':
      return {
        ...state,
        ui: { ...state.ui, showPurgeModal: !state.ui.showPurgeModal }
      };
    case 'TOGGLE_NEW_CAPABILITY_MODAL':
      return {
        ...state,
        ui: { ...state.ui, showNewCapabilityModal: !state.ui.showNewCapabilityModal }
      };
    case 'SET_SELECTED_CAPABILITY':
      return {
        ...state,
        ui: { ...state.ui, selectedCapability: action.capabilityId },
        filters: { ...state.filters, capability: action.capabilityId }
      };
    case 'SET_SELECTED_PCD':
      return {
        ...state,
        ui: { ...state.ui, selectedPCD: action.pcdId }
      };
    default:
      return state;
  }
};

// New Capability Modal Component
const NewCapabilityModal = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    description: '',
    pcd: '',
    pcdDescription: '',
    status: 'Planning',
    priority: 'Medium',
    businessValue: 3.0,
    totalRequirements: 0,
    completedRequirements: 0,
    category: '',
    owner: '',
    estimatedCost: 0,
    estimatedROI: 100,
    timeline: '',
    regulatoryDrivers: []
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const success = await onSave(formData);
    setSaving(false);
    if (success) {
      setFormData({
        id: '',
        name: '',
        description: '',
        pcd: '',
        pcdDescription: '',
        status: 'Planning',
        priority: 'Medium',
        businessValue: 3.0,
        totalRequirements: 0,
        completedRequirements: 0,
        category: '',
        owner: '',
        estimatedCost: 0,
        estimatedROI: 100,
        timeline: '',
        regulatoryDrivers: []
      });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Create New Capability</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Capability ID *</label>
              <input
                type="text"
                value={formData.id}
                onChange={(e) => handleChange('id', e.target.value)}
                placeholder="CAP-006"
                className="w-full border border-gray-300 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Data Loss Prevention"
                className="w-full border border-gray-300 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">PCD ID</label>
              <input
                type="text"
                value={formData.pcd}
                onChange={(e) => handleChange('pcd', e.target.value)}
                placeholder="PCD-DLP-006"
                className="w-full border border-gray-300 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Timeline</label>
              <input
                type="text"
                value={formData.timeline}
                onChange={(e) => handleChange('timeline', e.target.value)}
                placeholder="12 months"
                className="w-full border border-gray-300 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">PCD Description</label>
            <input
              type="text"
              value={formData.pcdDescription}
              onChange={(e) => handleChange('pcdDescription', e.target.value)}
              placeholder="Data Loss Prevention System Implementation"
              className="w-full border border-gray-300 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                className="w-full border border-gray-300 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Planning">Planning</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Not Started">Not Started</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => handleChange('priority', e.target.value)}
                className="w-full border border-gray-300 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Business Value (1-5)</label>
              <input
                type="number"
                min="1"
                max="5"
                step="0.1"
                value={formData.businessValue}
                onChange={(e) => handleChange('businessValue', parseFloat(e.target.value))}
                className="w-full border border-gray-300 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Owner</label>
              <input
                type="text"
                value={formData.owner}
                onChange={(e) => handleChange('owner', e.target.value)}
                placeholder="Security Team"
                className="w-full border border-gray-300 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Cost (£)</label>
              <input
                type="number"
                value={formData.estimatedCost}
                onChange={(e) => handleChange('estimatedCost', parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estimated ROI (%)</label>
              <input
                type="number"
                value={formData.estimatedROI}
                onChange={(e) => handleChange('estimatedROI', parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div className="flex space-x-3 pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {saving ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              {saving ? 'Creating...' : 'Create Capability'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Edit Requirement Modal Component
const EditRequirementModal = ({ requirement, onClose, onSave }) => {
  const [formData, setFormData] = useState(requirement);
  const [saving, setSaving] = useState(false);

  const handleChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  // Handle progress status change - automatically update progress percentage
  const handleProgressStatusChange = (progressStatus) => {
    const statusData = CONSTANTS.PROGRESS_STATUSES[progressStatus];
    setFormData(prev => ({
      ...prev,
      progressStatus: progressStatus,
      progress: statusData.percentage
    }));
  };

  // Handle status change - auto-set progress status for "Not Started"
  const handleStatusChange = (status) => {
    let updates = { status };
    if (status === 'Not Started') {
      updates.progressStatus = 'Not Started';
      updates.progress = 0;
    }
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const success = await onSave(requirement.id, formData);
    setSaving(false);
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-full max-h-[95vh] flex flex-col">
        {/* Fixed Header */}
        <div className="flex-shrink-0 bg-white border-b border-gray-200 p-4 sm:p-6 flex items-center justify-between rounded-t-xl">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Edit Requirement</h2>
            <p className="text-gray-600 text-sm sm:text-base">{requirement.id}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg flex-shrink-0">
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>
        
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-4 sm:p-6">
            <div className="space-y-4 sm:space-y-6">
              {/* Basic Information - 2 columns on larger screens */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ID *</label>
                  <input
                    type="text"
                    value={formData.id}
                    onChange={(e) => handleChange('id', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleChange('category', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select Category</option>
                    {CONSTANTS.CATEGORIES.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Progress Status and Priority */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Progress Status *</label>
                  <select
                    value={formData.progressStatus || 'Not Started'}
                    onChange={(e) => handleProgressStatusChange(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {Object.keys(CONSTANTS.PROGRESS_STATUSES).map(status => (
                      <option key={status} value={status}>
                        {status} ({CONSTANTS.PROGRESS_STATUSES[status].percentage}%)
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    {CONSTANTS.PROGRESS_STATUSES[formData.progressStatus || 'Not Started']?.description}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => handleChange('priority', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Priority</option>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              {/* Progress Indicator */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Progress Completion</span>
                  <span className="text-sm font-bold text-gray-900">{formData.progress || 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="h-3 rounded-full transition-all duration-300" 
                    style={{ 
                      width: `${formData.progress || 0}%`,
                      backgroundColor: CONSTANTS.PROGRESS_STATUSES[formData.progressStatus || 'Not Started']?.color || '#ef4444'
                    }}
                  />
                </div>
              </div>

              {/* Numeric Values - 4 columns */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Business Value (1-5)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    step="0.1"
                    value={formData.businessValueScore}
                    onChange={(e) => handleChange('businessValueScore', parseFloat(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Progress (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.progress}
                    onChange={(e) => handleChange('progress', parseInt(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-100"
                    disabled
                    title="Progress is automatically set based on Progress Status"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cost (£)</label>
                  <input
                    type="number"
                    value={formData.costEstimate}
                    onChange={(e) => handleChange('costEstimate', parseInt(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ROI (%)</label>
                  <input
                    type="number"
                    value={formData.roiProjection}
                    onChange={(e) => handleChange('roiProjection', parseInt(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              {/* Text Areas - Full width */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  rows={2}
                  className="w-full border border-gray-300 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business Justification</label>
                <textarea
                  value={formData.businessJustification}
                  onChange={(e) => handleChange('businessJustification', e.target.value)}
                  rows={2}
                  className="w-full border border-gray-300 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </form>
        </div>

        {/* Fixed Footer with Action Buttons */}
        <div className="flex-shrink-0 bg-gray-50 border-t border-gray-200 p-4 sm:p-6 rounded-b-xl">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-0 sm:space-x-3">
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={saving}
              className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm sm:text-base"
            >
              {saving ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// CSV Upload Modal Component
const CSVUploadModal = ({ isOpen, onClose, onUpload }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleFile = (file) => {
    if (!file) return;
    
    setUploading(true);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const csvText = e.target.result;
        const { headers, data } = csvUtils.parseCSV(csvText);
        setPreview({ headers, data: data.slice(0, 5), totalRows: data.length, fullData: data });
        setUploading(false);
      } catch (err) {
        alert('Error parsing CSV file. Please check the format.');
        setUploading(false);
      }
    };
    
    reader.readAsText(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const confirmUpload = () => {
    if (preview?.fullData) {
      onUpload(preview.fullData);
      setPreview(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Upload Requirements CSV</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {!preview ? (
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileInput}
                className="hidden"
              />
              
              {uploading ? (
                <div className="text-center">
                  <RefreshCw className="h-12 w-12 text-blue-500 mx-auto mb-4 animate-spin" />
                  <p className="text-gray-600">Processing CSV file...</p>
                </div>
              ) : (
                <div>
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-900 mb-2">Upload CSV File</p>
                  <p className="text-gray-600 mb-4">
                    Drag and drop your CSV file here, or click to browse
                  </p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Choose File
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <span className="font-medium text-green-900">
                    CSV parsed successfully! Found {preview.totalRows} rows
                  </span>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Preview (first 5 rows):</h4>
                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {preview.headers.map((header, index) => (
                          <th key={index} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {preview.data.map((row, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          {preview.headers.map((header, cellIndex) => (
                            <td key={cellIndex} className="px-4 py-2 text-sm text-gray-900 truncate max-w-32">
                              {row[header]}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={confirmUpload}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Confirm Upload
                </button>
                <button
                  onClick={() => setPreview(null)}
                  className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <X className="h-4 w-4 mr-2" />
                  Choose Different File
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Data Purge Confirmation Modal
const PurgeConfirmationModal = ({ isOpen, onClose, onConfirm }) => {
  const [confirmText, setConfirmText] = useState('');
  const [purging, setPurging] = useState(false);
  
  const handleConfirm = async () => {
    if (confirmText === 'DELETE ALL DATA') {
      setPurging(true);
      await onConfirm();
      setPurging(false);
      setConfirmText('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center mb-4">
            <AlertTriangle className="h-8 w-8 text-red-500 mr-3" />
            <h2 className="text-xl font-bold text-gray-900">Confirm Data Purge</h2>
          </div>
          
          <div className="mb-6">
            <p className="text-gray-700 mb-4">
              This action will permanently delete all requirements data. This cannot be undone.
            </p>
            <p className="text-sm text-gray-600 mb-4">
              Type <strong>DELETE ALL DATA</strong> to confirm:
            </p>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-red-500"
              placeholder="DELETE ALL DATA"
            />
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={handleConfirm}
              disabled={confirmText !== 'DELETE ALL DATA' || purging}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {purging ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
              {purging ? 'Purging...' : 'Delete All Data'}
            </button>
            <button
              onClick={onClose}
              className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Memoized components for performance
const StatCard = React.memo(({ title, value, icon: Icon, color, subtitle, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className={`relative bg-white rounded-xl shadow-md p-6 border-l-4 cursor-pointer transition-all duration-300 transform ${
        isHovered ? 'scale-102 shadow-lg' : 'hover:shadow-lg'
      }`}
      style={{ borderLeftColor: color }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <Icon className="h-10 w-10" style={{ color }} />
      </div>
    </div>
  );
});

const MaturityIndicator = React.memo(({ level, score }) => (
  <div className="flex items-center space-x-2">
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className={`w-3 h-3 rounded-full ${
            i <= score ? 'bg-blue-500' : 'bg-gray-200'
          }`}
        />
      ))}
    </div>
    <span className="text-sm font-medium text-gray-700">{level}</span>
  </div>
));

const InteractiveChart = React.memo(({ title, children, fullscreenId, onToggleFullscreen }) => {
  return (
    <div className="bg-white rounded-xl shadow-md">
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
          {title}
        </h3>
        <button 
          onClick={() => onToggleFullscreen(fullscreenId)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Maximize2 className="h-4 w-4" />
        </button>
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );
});

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Dashboard Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-md p-8 max-w-md w-full">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
              <p className="text-gray-600 mb-4">
                We encountered an error while loading the dashboard.
              </p>
              <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Loading Component
const LoadingSpinner = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600">Loading requirements dashboard...</p>
    </div>
  </div>
);

// Main Dashboard Component
const RequirementsDashboard = () => {
  const [state, dispatch] = useReducer(dashboardReducer, initialState);
  const { 
    requirements, 
    loading, 
    error, 
    updateRequirement, 
    deleteRequirement, 
    addRequirement, 
    purgeAllData, 
    importFromCSV 
  } = useRequirementsData();
  
  const { capabilities, loading: capabilitiesLoading, addCapability } = useCapabilitiesData();
  const { pcdData, loading: pcdLoading, updatePCDData } = usePCDData();
  
  const filteredRequirements = useRequirementsFilter(requirements, state.filters, state.searchTerm);
  const analyticsData = useAnalytics(requirements);

  const handleFilterChange = (field, value) => {
    dispatch({ type: 'SET_FILTER', field, value });
  };

  const handleViewRequirement = (requirement) => {
    dispatch({ type: 'OPEN_MODAL', requirement });
  };

  const handleEditRequirement = (requirement) => {
    dispatch({ type: 'OPEN_MODAL', requirement, editMode: true });
  };

  const handleExportCSV = () => {
    const csvContent = csvUtils.generateCSV(requirements);
    const filename = `requirements_export_${new Date().toISOString().split('T')[0]}.csv`;
    csvUtils.downloadCSV(csvContent, filename);
  };

  const handleUploadCSV = (csvData) => {
    const success = importFromCSV(csvData);
    if (success) {
      alert(`Successfully imported ${csvData.length} requirements!`);
    } else {
      alert('Failed to import CSV data. Please check the format.');
    }
  };

  const handlePurgeData = async () => {
    const success = await purgeAllData();
    if (success) {
      alert('All data has been purged successfully.');
    } else {
      alert('Failed to purge data.');
    }
  };

  const handleSelectCapability = (capabilityId) => {
    dispatch({ type: 'SET_SELECTED_CAPABILITY', capabilityId });
    dispatch({ type: 'SET_VIEW_MODE', viewMode: 'requirements' });
  };

  const handleCreateCapability = async (newCapability) => {
    const success = await addCapability(newCapability);
    if (success) {
      alert(`Successfully created capability ${newCapability.id}!`);
      return true;
    } else {
      alert('Failed to create capability.');
      return false;
    }
  };

  if (loading || capabilitiesLoading || pcdLoading) return <LoadingSpinner />;
  if (error) throw new Error(error);

  const Sidebar = () => (
    <div className={`bg-gray-900 text-white transition-all duration-300 ${
      state.ui.sidebarExpanded ? 'w-64' : 'w-16'
    } flex flex-col`}>
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          {state.ui.sidebarExpanded && <h2 className="text-lg font-semibold">OT Dashboard</h2>}
          <button
            onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
            className="p-2 hover:bg-gray-800 rounded"
          >
            {state.ui.sidebarExpanded ? 
              <ChevronLeft className="h-4 w-4" /> : 
              <ChevronRight className="h-4 w-4" />
            }
          </button>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {[
            { id: 'overview', name: 'Overview', icon: TrendingUp },
            { id: 'capabilities', name: 'Capabilities', icon: Network },
            { id: 'requirements', name: 'Requirements', icon: FileText },
            { id: 'pcd', name: 'PCD Breakdown', icon: Building2 },
            { id: 'maturity', name: 'Maturity Analysis', icon: Gauge },
            { id: 'justification', name: 'Business Value', icon: Star },
            { id: 'analytics', name: 'Analytics', icon: BarChart3 }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => dispatch({ type: 'SET_VIEW_MODE', viewMode: item.id })}
              className={`w-full flex items-center px-3 py-2 rounded-lg transition-colors ${
                state.ui.viewMode === item.id
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <item.icon className="h-5 w-5" />
              {state.ui.sidebarExpanded && <span className="ml-3">{item.name}</span>}
            </button>
          ))}
        </div>
      </nav>

      {state.ui.sidebarExpanded && (
        <div className="p-4 border-t border-gray-700">
          <h3 className="text-sm font-medium text-gray-300 mb-2">Data Management</h3>
          <div className="space-y-2">
            <button
              onClick={() => dispatch({ type: 'TOGGLE_UPLOAD_MODAL' })}
              className="w-full flex items-center px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload CSV
            </button>
            <button
              onClick={handleExportCSV}
              className="w-full flex items-center px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </button>
            <button
              onClick={() => dispatch({ type: 'TOGGLE_PURGE_MODAL' })}
              className="w-full flex items-center px-3 py-2 text-sm text-red-400 hover:bg-red-900 hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Purge Data
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const Header = () => (
    <div className="bg-white shadow-sm border-b">
      <div className="px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">OT Requirements Management</h1>
            <div className="flex items-center mt-1 text-sm text-gray-600">
              <Layers className="h-4 w-4 mr-1" />
              Network Segmentation Project
              <span className="mx-2">•</span>
              <Activity className="h-4 w-4 mr-1" />
              {filteredRequirements.length} of {requirements.length} requirements
              <span className="mx-2">•</span>
              <Database className="h-4 w-4 mr-1" />
              Demo data active
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => dispatch({ type: 'TOGGLE_UPLOAD_MODAL' })}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload CSV
            </button>
            <button 
              onClick={handleExportCSV}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />
        
        <div className="flex-1 flex flex-col">
          <Header />
          
          <main className="flex-1 p-6 overflow-y-auto">
            {/* Capabilities View */}
            {state.ui.viewMode === 'capabilities' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                        <Network className="h-6 w-6 mr-3 text-blue-600" />
                        OT Security Capabilities
                      </h3>
                      <p className="text-gray-600 mt-1">Manage capabilities and their associated requirements and PCDs</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-sm text-gray-500">
                        {capabilities.length} capabilities • {requirements.length} total requirements
                      </div>
                      <button
                        onClick={() => dispatch({ type: 'TOGGLE_NEW_CAPABILITY_MODAL' })}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        New Capability
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {capabilities.map((capability) => {
                      const capabilityRequirements = requirements.filter(req => req.capabilityId === capability.id);
                      const totalRequirements = capabilityRequirements.length;
                      const completedRequirements = capabilityRequirements.filter(req => req.status === 'Completed').length;
                      const completionRate = totalRequirements > 0 ? (completedRequirements / totalRequirements) * 100 : 0;
                      
                      return (
                        <div 
                          key={capability.id} 
                          className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group"
                          onClick={() => handleSelectCapability(capability.id)}
                        >
                          {/* Header */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center mb-2">
                                <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                  {capability.name}
                                </h4>
                                <ArrowRight className="h-4 w-4 ml-2 text-gray-400 group-hover:text-blue-600 transition-colors" />
                              </div>
                              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                {capability.id}
                              </span>
                            </div>
                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                              capability.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                              capability.status === 'Completed' ? 'bg-green-100 text-green-800' :
                              capability.status === 'Planning' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {capability.status}
                            </div>
                          </div>

                          {/* Description */}
                          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                            {capability.description}
                          </p>

                          {/* PCD Information */}
                          <div className="bg-blue-50 rounded-lg p-3 mb-4">
                            <div className="flex items-center mb-1">
                              <Building2 className="h-4 w-4 text-blue-600 mr-2" />
                              <span className="text-xs font-medium text-blue-900">PCD: {capability.pcd}</span>
                            </div>
                            <p className="text-xs text-blue-800">{capability.pcdDescription}</p>
                          </div>

                          {/* Progress */}
                          <div className="mb-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-700">Progress</span>
                              <span className="text-sm font-bold text-gray-900">{completionRate.toFixed(0)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                                style={{ width: `${completionRate}%` }}
                              />
                            </div>
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                              <span>{completedRequirements} completed</span>
                              <span>{totalRequirements} total</span>
                            </div>
                          </div>

                          {/* Key Metrics */}
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <div className="flex items-center mb-1">
                                <Star className="h-3 w-3 text-yellow-500 mr-1" />
                                <span className="text-gray-600">Value:</span>
                              </div>
                              <span className="font-medium">{capability.businessValue}/5.0</span>
                            </div>
                            <div>
                              <div className="flex items-center mb-1">
                                <DollarSign className="h-3 w-3 text-green-500 mr-1" />
                                <span className="text-gray-600">ROI:</span>
                              </div>
                              <span className="font-medium">{capability.estimatedROI}%</span>
                            </div>
                            <div>
                              <div className="flex items-center mb-1">
                                <Clock className="h-3 w-3 text-blue-500 mr-1" />
                                <span className="text-gray-600">Timeline:</span>
                              </div>
                              <span className="font-medium">{capability.timeline}</span>
                            </div>
                            <div>
                              <div className="flex items-center mb-1">
                                <Users className="h-3 w-3 text-purple-500 mr-1" />
                                <span className="text-gray-600">Owner:</span>
                              </div>
                              <span className="font-medium text-xs">{capability.owner}</span>
                            </div>
                          </div>

                          {/* Regulatory Drivers */}
                          <div className="mt-4 pt-3 border-t border-gray-100">
                            <div className="flex flex-wrap gap-1">
                              {capability.regulatoryDrivers.map((driver, index) => (
                                <span 
                                  key={index}
                                  className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full"
                                >
                                  {driver}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Capability Summary */}
                  <div className="mt-8 bg-gray-50 rounded-xl p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Capability Portfolio Summary</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-white rounded-lg p-4">
                        <div className="flex items-center">
                          <div className="bg-blue-100 p-2 rounded-lg mr-3">
                            <Network className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Total Capabilities</p>
                            <p className="text-xl font-bold text-gray-900">{capabilities.length}</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-4">
                        <div className="flex items-center">
                          <div className="bg-green-100 p-2 rounded-lg mr-3">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">In Progress</p>
                            <p className="text-xl font-bold text-gray-900">
                              {capabilities.filter(c => c.status === 'In Progress').length}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-4">
                        <div className="flex items-center">
                          <div className="bg-yellow-100 p-2 rounded-lg mr-3">
                            <DollarSign className="h-5 w-5 text-yellow-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Total Investment</p>
                            <p className="text-xl font-bold text-gray-900">
                              £{(capabilities.reduce((sum, c) => sum + c.estimatedCost, 0) / 1000000).toFixed(1)}M
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-4">
                        <div className="flex items-center">
                          <div className="bg-purple-100 p-2 rounded-lg mr-3">
                            <Star className="h-5 w-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Avg Business Value</p>
                            <p className="text-xl font-bold text-gray-900">
                              {(capabilities.reduce((sum, c) => sum + c.businessValue, 0) / capabilities.length).toFixed(1)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Overview View */}
            {state.ui.viewMode === 'overview' && (
              <div className="space-y-6">
                {/* Compact Regulatory Context Banner */}
                <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-xl p-4 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-16 -mt-16" />
                  <div className="relative">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <Shield className="h-5 w-5 mr-2" />
                        <h3 className="text-lg font-semibold">Regulatory Compliance Framework</h3>
                      </div>
                      <div className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded-full">
                        Active Compliance
                      </div>
                    </div>
                    <div className="grid md:grid-cols-3 gap-4 text-xs">
                      <div className="flex items-center space-x-2">
                        <div className="bg-white bg-opacity-20 p-1.5 rounded-lg">
                          <Network className="h-3 w-3" />
                        </div>
                        <div>
                          <div className="font-medium">Ofgem Framework</div>
                          <div className="text-blue-100">Clean power transition by 2030</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="bg-white bg-opacity-20 p-1.5 rounded-lg">
                          <Lock className="h-3 w-3" />
                        </div>
                        <div>
                          <div className="font-medium">NCSC CAF Guidance</div>
                          <div className="text-blue-100">OES compliance mapping</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="bg-white bg-opacity-20 p-1.5 rounded-lg">
                          <Building2 className="h-3 w-3" />
                        </div>
                        <div>
                          <div className="font-medium">Business Justification</div>
                          <div className="text-blue-100">Value & impact analysis</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Widget Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                  {/* Core Metrics Widgets */}
                  <div 
                    className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-all duration-300 cursor-pointer border-l-4 border-blue-500 group"
                    onClick={() => dispatch({ type: 'SET_VIEW_MODE', viewMode: 'requirements' })}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <FileText className="h-6 w-6 text-blue-600" />
                      <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{requirements.length}</div>
                    <div className="text-xs text-gray-600">Total Requirements</div>
                    <div className="text-xs text-green-600 mt-1">+12% this month</div>
                  </div>

                  <div 
                    className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-all duration-300 cursor-pointer border-l-4 border-green-500 group"
                    onClick={() => {
                      dispatch({ type: 'SET_FILTER', field: 'status', value: 'Completed' });
                      dispatch({ type: 'SET_VIEW_MODE', viewMode: 'requirements' });
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                      <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-green-600 transition-colors" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {requirements.filter(r => r.status === 'Completed').length}
                    </div>
                    <div className="text-xs text-gray-600">Completed</div>
                    <div className="text-xs text-green-600 mt-1">
                      {requirements.length ? ((requirements.filter(r => r.status === 'Completed').length / requirements.length) * 100).toFixed(0) : 0}% done
                    </div>
                  </div>

                  <div 
                    className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-all duration-300 cursor-pointer border-l-4 border-yellow-500 group"
                    onClick={() => {
                      dispatch({ type: 'SET_FILTER', field: 'status', value: 'In Progress' });
                      dispatch({ type: 'SET_VIEW_MODE', viewMode: 'requirements' });
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Clock className="h-6 w-6 text-yellow-600" />
                      <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-yellow-600 transition-colors" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {requirements.filter(r => r.status === 'In Progress').length}
                    </div>
                    <div className="text-xs text-gray-600">In Progress</div>
                    <div className="text-xs text-yellow-600 mt-1">Active work</div>
                  </div>

                  <div 
                    className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-all duration-300 cursor-pointer border-l-4 border-red-500 group"
                    onClick={() => {
                      dispatch({ type: 'SET_FILTER', field: 'status', value: 'Not Started' });
                      dispatch({ type: 'SET_VIEW_MODE', viewMode: 'requirements' });
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <AlertTriangle className="h-6 w-6 text-red-600" />
                      <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-red-600 transition-colors" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {requirements.filter(r => r.status === 'Not Started').length}
                    </div>
                    <div className="text-xs text-gray-600">Not Started</div>
                    <div className="text-xs text-red-600 mt-1">Needs attention</div>
                  </div>

                  <div 
                    className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-all duration-300 cursor-pointer border-l-4 border-purple-500 group"
                    onClick={() => {
                      dispatch({ type: 'SET_FILTER', field: 'priority', value: 'Critical' });
                      dispatch({ type: 'SET_VIEW_MODE', viewMode: 'requirements' });
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Target className="h-6 w-6 text-purple-600" />
                      <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-purple-600 transition-colors" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {requirements.filter(r => r.priority === 'Critical' || r.priority === 'High').length}
                    </div>
                    <div className="text-xs text-gray-600">High Priority</div>
                    <div className="text-xs text-purple-600 mt-1">Critical items</div>
                  </div>

                  <div 
                    className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-all duration-300 cursor-pointer border-l-4 border-indigo-500 group"
                    onClick={() => dispatch({ type: 'SET_VIEW_MODE', viewMode: 'capabilities' })}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Network className="h-6 w-6 text-indigo-600" />
                      <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{capabilities.length}</div>
                    <div className="text-xs text-gray-600">Capabilities</div>
                    <div className="text-xs text-indigo-600 mt-1">Active programs</div>
                  </div>

                  {/* Business Value Widgets */}
                  <div 
                    className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-all duration-300 cursor-pointer border-l-4 border-amber-500 group"
                    onClick={() => dispatch({ type: 'SET_VIEW_MODE', viewMode: 'justification' })}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Star className="h-6 w-6 text-amber-600" />
                      <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-amber-600 transition-colors" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {(requirements.reduce((sum, r) => sum + (r.businessValueScore || 0), 0) / requirements.length || 0).toFixed(1)}
                    </div>
                    <div className="text-xs text-gray-600">Avg Business Value</div>
                    <div className="text-xs text-amber-600 mt-1">Out of 5.0</div>
                  </div>

                  <div 
                    className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-all duration-300 cursor-pointer border-l-4 border-emerald-500 group"
                    onClick={() => {
                      dispatch({ type: 'SET_SEARCH_TERM', searchTerm: '' });
                      dispatch({ type: 'CLEAR_FILTERS' });
                      dispatch({ type: 'SET_VIEW_MODE', viewMode: 'requirements' });
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <DollarSign className="h-6 w-6 text-emerald-600" />
                      <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-emerald-600 transition-colors" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {requirements.filter(r => (r.businessValueScore || 0) >= 4).length}
                    </div>
                    <div className="text-xs text-gray-600">High Value Items</div>
                    <div className="text-xs text-emerald-600 mt-1">4.0+ rating</div>
                  </div>

                  <div 
                    className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-all duration-300 cursor-pointer border-l-4 border-cyan-500 group"
                    onClick={() => dispatch({ type: 'SET_VIEW_MODE', viewMode: 'maturity' })}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Gauge className="h-6 w-6 text-cyan-600" />
                      <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-cyan-600 transition-colors" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {(requirements.reduce((sum, r) => sum + (r.maturityLevel?.score || 0), 0) / requirements.length || 0).toFixed(1)}
                    </div>
                    <div className="text-xs text-gray-600">Avg Maturity</div>
                    <div className="text-xs text-cyan-600 mt-1">Out of 5.0</div>
                  </div>

                  <div 
                    className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-all duration-300 cursor-pointer border-l-4 border-rose-500 group"
                    onClick={() => {
                      dispatch({ type: 'SET_FILTER', field: 'capability', value: '' });
                      dispatch({ type: 'SET_VIEW_MODE', viewMode: 'requirements' });
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <GitBranch className="h-6 w-6 text-rose-600" />
                      <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-rose-600 transition-colors" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {requirements.filter(r => !r.capabilityId).length}
                    </div>
                    <div className="text-xs text-gray-600">Unassigned</div>
                    <div className="text-xs text-rose-600 mt-1">Need capability</div>
                  </div>

                  <div 
                    className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-all duration-300 cursor-pointer border-l-4 border-orange-500 group"
                    onClick={() => dispatch({ type: 'SET_VIEW_MODE', viewMode: 'analytics' })}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <BarChart3 className="h-6 w-6 text-orange-600" />
                      <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-orange-600 transition-colors" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      £{(requirements.reduce((sum, r) => sum + (r.costEstimate || 0), 0) / 1000000).toFixed(1)}M
                    </div>
                    <div className="text-xs text-gray-600">Total Investment</div>
                    <div className="text-xs text-orange-600 mt-1">Estimated cost</div>
                  </div>

                  <div 
                    className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-all duration-300 cursor-pointer border-l-4 border-teal-500 group"
                    onClick={() => {
                      dispatch({ type: 'SET_FILTER', field: 'applicability', value: 'Essential' });
                      dispatch({ type: 'SET_VIEW_MODE', viewMode: 'requirements' });
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Shield className="h-6 w-6 text-teal-600" />
                      <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-teal-600 transition-colors" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {requirements.filter(r => r.applicability?.type === 'Essential').length}
                    </div>
                    <div className="text-xs text-gray-600">Essential Items</div>
                    <div className="text-xs text-teal-600 mt-1">Must implement</div>
                  </div>
                </div>

                {/* Quick Actions Section */}
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Lightbulb className="h-5 w-5 mr-2 text-yellow-500" />
                    Quick Actions
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    <button 
                      onClick={() => dispatch({ type: 'SET_VIEW_MODE', viewMode: 'capabilities' })}
                      className="flex flex-col items-center p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group"
                    >
                      <Network className="h-5 w-5 text-blue-600 mb-1 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-medium text-blue-700">View Capabilities</span>
                    </button>
                    <button 
                      onClick={() => dispatch({ type: 'TOGGLE_NEW_CAPABILITY_MODAL' })}
                      className="flex flex-col items-center p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors group"
                    >
                      <Plus className="h-5 w-5 text-green-600 mb-1 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-medium text-green-700">New Capability</span>
                    </button>
                    <button 
                      onClick={() => dispatch({ type: 'TOGGLE_UPLOAD_MODAL' })}
                      className="flex flex-col items-center p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors group"
                    >
                      <Upload className="h-5 w-5 text-purple-600 mb-1 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-medium text-purple-700">Upload CSV</span>
                    </button>
                    <button 
                      onClick={handleExportCSV}
                      className="flex flex-col items-center p-3 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors group"
                    >
                      <Download className="h-5 w-5 text-orange-600 mb-1 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-medium text-orange-700">Export Data</span>
                    </button>
                    <button 
                      onClick={() => dispatch({ type: 'SET_VIEW_MODE', viewMode: 'pcd' })}
                      className="flex flex-col items-center p-3 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors group"
                    >
                      <Building2 className="h-5 w-5 text-indigo-600 mb-1 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-medium text-indigo-700">PCD Breakdown</span>
                    </button>
                    <button 
                      onClick={() => dispatch({ type: 'SET_VIEW_MODE', viewMode: 'analytics' })}
                      className="flex flex-col items-center p-3 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors group"
                    >
                      <BarChart3 className="h-5 w-5 text-orange-600 mb-1 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-medium text-orange-700">View Analytics</span>
                    </button>
                    <button 
                      onClick={() => {
                        dispatch({ type: 'CLEAR_FILTERS' });
                        dispatch({ type: 'SET_SEARCH_TERM', searchTerm: '' });
                        dispatch({ type: 'SET_VIEW_MODE', viewMode: 'requirements' });
                      }}
                      className="flex flex-col items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
                    >
                      <RefreshCw className="h-5 w-5 text-gray-600 mb-1 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-medium text-gray-700">Reset Filters</span>
                    </button>
                  </div>
                </div>

                {/* Activity Feed */}
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Activity className="h-5 w-5 mr-2 text-green-600" />
                    Recent Activity
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="bg-green-100 p-1 rounded-full">
                        <CheckCircle className="h-3 w-3 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">5 requirements completed</p>
                        <p className="text-xs text-gray-500">Network segmentation validation completed • 2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="bg-blue-100 p-1 rounded-full">
                        <Upload className="h-3 w-3 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">Demo data loaded</p>
                        <p className="text-xs text-gray-500">75 requirements imported successfully • Just now</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="bg-yellow-100 p-1 rounded-full">
                        <Star className="h-3 w-3 text-yellow-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">Business values updated</p>
                        <p className="text-xs text-gray-500">ROI calculations refreshed • 1 minute ago</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Requirements View */}
            {state.ui.viewMode === 'requirements' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">Filter & Search Requirements</h3>
                      {state.ui.selectedCapability && (
                        <div className="flex items-center mt-2">
                          <span className="text-sm text-gray-600">Filtered by capability:</span>
                          <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {state.ui.selectedCapability}
                          </span>
                          <button
                            onClick={() => dispatch({ type: 'SET_SELECTED_CAPABILITY', capabilityId: null })}
                            className="ml-2 text-gray-400 hover:text-gray-600"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => dispatch({ type: 'TOGGLE_COLUMN_SELECTOR' })}
                        className="flex items-center text-purple-600 hover:text-purple-800 px-3 py-2 border border-purple-300 rounded-lg hover:bg-purple-50 transition-colors"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Columns
                      </button>
                      <button 
                        onClick={() => dispatch({ type: 'TOGGLE_FILTERS' })}
                        className="flex items-center text-blue-600 hover:text-blue-800 px-3 py-2 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
                      >
                        <Filter className="h-4 w-4 mr-2" />
                        {state.ui.activeFilters ? 'Hide Filters' : 'Show Filters'}
                      </button>
                    </div>
                  </div>
                  
                  {/* Column Selector */}
                  {state.ui.showColumnSelector && (
                    <div className="mb-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                      <h4 className="text-sm font-medium text-purple-900 mb-3">Select Columns to Display</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                        {Object.entries({
                          id: 'ID',
                          description: 'Description',
                          capability: 'Capability',
                          progressStatus: 'Progress Status',
                          businessValue: 'Business Value',
                          maturity: 'Maturity',
                          applicability: 'Applicability',
                          status: 'Status',
                          area: 'Area',
                          type: 'Type',
                          priority: 'Priority',
                          assignee: 'Assignee',
                          dueDate: 'Due Date',
                          actions: 'Actions'
                        }).map(([key, label]) => (
                          <label key={key} className="flex items-center space-x-2 text-sm">
                            <input
                              type="checkbox"
                              checked={state.columnVisibility[key]}
                              onChange={() => dispatch({ type: 'TOGGLE_COLUMN_VISIBILITY', column: key })}
                              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                            />
                            <span className="text-gray-700">{label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex flex-wrap gap-4 items-center mb-4">
                    <div className="flex-1 min-w-64">
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search requirements, justifications..."
                          className="pl-10 pr-10 w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={state.searchTerm}
                          onChange={(e) => dispatch({ type: 'SET_SEARCH_TERM', searchTerm: e.target.value })}
                        />
                        {state.searchTerm && (
                          <button
                            onClick={() => dispatch({ type: 'CLEAR_SEARCH' })}
                            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                            title="Clear search"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {/* Filter dropdowns */}
                    {state.ui.activeFilters && (
                      <div className="grid grid-cols-1 md:grid-cols-7 gap-4 w-full">
                        <select
                          value={state.filters.capability}
                          onChange={(e) => handleFilterChange('capability', e.target.value)}
                          className="border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">All Capabilities</option>
                          {capabilities.map(cap => (
                            <option key={cap.id} value={cap.id}>{cap.id} - {cap.name}</option>
                          ))}
                        </select>

                        <select
                          value={state.filters.area}
                          onChange={(e) => handleFilterChange('area', e.target.value)}
                          className="border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">All Areas</option>
                          <option value="Business">Business</option>
                          <option value="User">User</option>
                          <option value="System">System</option>
                          <option value="Infrastructure">Infrastructure</option>
                        </select>
                        
                        <select
                          value={state.filters.type}
                          onChange={(e) => handleFilterChange('type', e.target.value)}
                          className="border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">All Types</option>
                          <option value="Functional">Functional</option>
                          <option value="Non-Functional">Non-Functional</option>
                        </select>
                        
                        <select
                          value={state.filters.status}
                          onChange={(e) => handleFilterChange('status', e.target.value)}
                          className="border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">All Statuses</option>
                          <option value="Not Started">Not Started</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                          <option value="On Hold">On Hold</option>
                          <option value="Under Review">Under Review</option>
                        </select>
                        
                        <select
                          value={state.filters.maturityLevel}
                          onChange={(e) => handleFilterChange('maturityLevel', e.target.value)}
                          className="border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">All Maturity</option>
                          <option value="Initial">Initial</option>
                          <option value="Developing">Developing</option>
                          <option value="Defined">Defined</option>
                          <option value="Managed">Managed</option>
                          <option value="Optimizing">Optimizing</option>
                        </select>

                        <select
                          value={state.filters.applicability}
                          onChange={(e) => handleFilterChange('applicability', e.target.value)}
                          className="border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">All Applicability</option>
                          <option value="Essential">Essential</option>
                          <option value="Applicable">Applicable</option>
                          <option value="Future">Future</option>
                          <option value="Conditional">Conditional</option>
                          <option value="Not Applicable">Not Applicable</option>
                        </select>
                        
                        <button
                          onClick={() => dispatch({ type: 'CLEAR_FILTERS' })}
                          className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Clear
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {/* Requirements Table */}
                  <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            {state.columnVisibility.id && (
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">ID</th>
                            )}
                            {state.columnVisibility.description && (
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-64">Description</th>
                            )}
                            {state.columnVisibility.capability && (
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">Capability</th>
                            )}
                            {state.columnVisibility.area && (
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Area</th>
                            )}
                            {state.columnVisibility.type && (
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Type</th>
                            )}
                            {state.columnVisibility.progressStatus && (
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">Progress Status</th>
                            )}
                            {state.columnVisibility.businessValue && (
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">Business Value</th>
                            )}
                            {state.columnVisibility.maturity && (
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">Maturity</th>
                            )}
                            {state.columnVisibility.applicability && (
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Applicability</th>
                            )}
                            {state.columnVisibility.status && (
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Status</th>
                            )}
                            {state.columnVisibility.priority && (
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Priority</th>
                            )}
                            {state.columnVisibility.assignee && (
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Assignee</th>
                            )}
                            {state.columnVisibility.dueDate && (
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Due Date</th>
                            )}
                            {state.columnVisibility.actions && (
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Actions</th>
                            )}
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {filteredRequirements.slice(0, CONSTANTS.TABLE_PAGE_SIZE).map((requirement) => {
                            const progressStatus = CONSTANTS.PROGRESS_STATUSES[requirement.progressStatus || 'Not Started'];
                            const capability = capabilities.find(c => c.id === requirement.capabilityId);
                            
                            return (
                              <tr key={requirement.id} className="hover:bg-gray-50 transition-colors">
                                {state.columnVisibility.id && (
                                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {requirement.id}
                                  </td>
                                )}
                                {state.columnVisibility.description && (
                                  <td className="px-4 py-4 text-sm text-gray-900">
                                    <div className="max-w-xs">
                                      <div className="truncate font-medium">{requirement.category}</div>
                                      <div className="text-xs text-gray-500 truncate">{requirement.description}</div>
                                    </div>
                                  </td>
                                )}
                                {state.columnVisibility.capability && (
                                  <td className="px-4 py-4 whitespace-nowrap">
                                    {requirement.capabilityId ? (
                                      <div className="flex items-center">
                                        <span className="text-sm font-medium text-blue-600">{requirement.capabilityId}</span>
                                        {capability && (
                                          <div className="ml-2 text-xs text-gray-500 truncate max-w-20">
                                            {capability.name}
                                          </div>
                                        )}
                                      </div>
                                    ) : (
                                      <span className="text-sm text-gray-400">Not assigned</span>
                                    )}
                                  </td>
                                )}
                                {state.columnVisibility.area && (
                                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {requirement.area}
                                  </td>
                                )}
                                {state.columnVisibility.type && (
                                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {requirement.type}
                                  </td>
                                )}
                                {state.columnVisibility.progressStatus && (
                                  <td className="px-4 py-4 whitespace-nowrap">
                                    <div className="flex items-center space-x-2">
                                      <div 
                                        className="flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium"
                                        style={{ 
                                          backgroundColor: `${progressStatus?.color}20`,
                                          color: progressStatus?.color 
                                        }}
                                      >
                                        <div 
                                          className="w-2 h-2 rounded-full"
                                          style={{ backgroundColor: progressStatus?.color }}
                                        />
                                        <span>{requirement.progressStatus || 'Not Started'}</span>
                                      </div>
                                      <span className="text-xs text-gray-500">
                                        {requirement.progress || 0}%
                                      </span>
                                    </div>
                                  </td>
                                )}
                                {state.columnVisibility.businessValue && (
                                  <td className="px-4 py-4 whitespace-nowrap">
                                    <div className="flex items-center space-x-2">
                                      <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                                        requirement.businessValueScore >= 4 ? 'bg-green-100 text-green-800' :
                                        requirement.businessValueScore >= 3 ? 'bg-blue-100 text-blue-800' :
                                        requirement.businessValueScore >= 2 ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-red-100 text-red-800'
                                      }`}>
                                        <Star className="h-3 w-3" />
                                        {requirement.businessValueScore}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        ROI: {requirement.roiProjection}%
                                      </div>
                                    </div>
                                  </td>
                                )}
                                {state.columnVisibility.maturity && (
                                  <td className="px-4 py-4 whitespace-nowrap">
                                    {requirement.maturityLevel ? (
                                      <MaturityIndicator 
                                        level={requirement.maturityLevel.level} 
                                        score={requirement.maturityLevel.score} 
                                      />
                                    ) : (
                                      <span className="text-sm text-gray-400">Not assessed</span>
                                    )}
                                  </td>
                                )}
                                {state.columnVisibility.applicability && (
                                  <td className="px-4 py-4 whitespace-nowrap">
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                      requirement.applicability?.type === 'Essential' ? 'bg-green-100 text-green-800' :
                                      requirement.applicability?.type === 'Applicable' ? 'bg-blue-100 text-blue-800' :
                                      requirement.applicability?.type === 'Future' ? 'bg-yellow-100 text-yellow-800' :
                                      requirement.applicability?.type === 'Conditional' ? 'bg-orange-100 text-orange-800' :
                                      'bg-gray-100 text-gray-800'
                                    }`}>
                                      {requirement.applicability?.type || 'Not assessed'}
                                    </span>
                                  </td>
                                )}
                                {state.columnVisibility.status && (
                                  <td className="px-4 py-4 whitespace-nowrap">
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                      requirement.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                      requirement.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                                      requirement.status === 'On Hold' ? 'bg-gray-100 text-gray-800' :
                                      'bg-red-100 text-red-800'
                                    }`}>
                                      {requirement.status}
                                    </span>
                                  </td>
                                )}
                                {state.columnVisibility.priority && (
                                  <td className="px-4 py-4 whitespace-nowrap">
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                      requirement.priority === 'Critical' ? 'bg-red-100 text-red-800' :
                                      requirement.priority === 'High' ? 'bg-orange-100 text-orange-800' :
                                      requirement.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-gray-100 text-gray-800'
                                    }`}>
                                      {requirement.priority}
                                    </span>
                                  </td>
                                )}
                                {state.columnVisibility.assignee && (
                                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {requirement.assignee}
                                  </td>
                                )}
                                {state.columnVisibility.dueDate && (
                                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {requirement.dueDate ? new Date(requirement.dueDate).toLocaleDateString() : '-'}
                                  </td>
                                )}
                                {state.columnVisibility.actions && (
                                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex space-x-2">
                                      <button
                                        onClick={() => handleViewRequirement(requirement)}
                                        className="text-blue-600 hover:text-blue-900"
                                        title="View Details"
                                        aria-label={`View details for requirement ${requirement.id}`}
                                      >
                                        <Eye className="h-4 w-4" />
                                      </button>
                                      <button 
                                        onClick={() => handleEditRequirement(requirement)}
                                        className="text-gray-400 hover:text-gray-600"
                                        title="Edit Requirement"
                                        aria-label={`Edit requirement ${requirement.id}`}
                                      >
                                        <Edit className="h-4 w-4" />
                                      </button>
                                    </div>
                                  </td>
                                )}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    
                    {filteredRequirements.length > CONSTANTS.TABLE_PAGE_SIZE && (
                      <div className="bg-gray-50 px-6 py-3 text-center">
                        <p className="text-sm text-gray-500">
                          Showing {CONSTANTS.TABLE_PAGE_SIZE} of {filteredRequirements.length} requirements
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* PCD Breakdown View */}
            {state.ui.viewMode === 'pcd' && (
              <div className="space-y-6">
                {/* PCD Selection */}
                <div className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                        <Building2 className="h-6 w-6 mr-3 text-blue-600" />
                        Project Control Document (PCD) Breakdown
                      </h3>
                      <p className="text-gray-600 mt-1">Comprehensive business case and project documentation</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <select
                        value={state.ui.selectedPCD || ''}
                        onChange={(e) => dispatch({ type: 'SET_SELECTED_PCD', pcdId: e.target.value })}
                        className="border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select PCD</option>
                        {Object.keys(pcdData).map(pcdId => (
                          <option key={pcdId} value={pcdId}>
                            {pcdId} - {pcdData[pcdId]?.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {state.ui.selectedPCD && pcdData[state.ui.selectedPCD] ? (
                    <div className="space-y-8">
                      {/* Executive Summary */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                        <h4 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                          <FileText className="h-5 w-5 mr-2" />
                          Executive Summary
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-blue-800">PCD ID:</span>
                            <span className="ml-2 text-blue-700">{pcdData[state.ui.selectedPCD].id}</span>
                          </div>
                          <div>
                            <span className="font-medium text-blue-800">Title:</span>
                            <span className="ml-2 text-blue-700">{pcdData[state.ui.selectedPCD].title}</span>
                          </div>
                          <div>
                            <span className="font-medium text-blue-800">Delivery Date:</span>
                            <span className="ml-2 text-blue-700">{pcdData[state.ui.selectedPCD].pcdOverview?.deliveryDate}</span>
                          </div>
                          <div>
                            <span className="font-medium text-blue-800">Total Allowance:</span>
                            <span className="ml-2 text-blue-700">{pcdData[state.ui.selectedPCD].pcdOverview?.allowance}</span>
                          </div>
                        </div>
                      </div>

                      {/* Needs Case */}
                      <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Needs Case and High-Level Project Scope</h4>
                        <textarea
                          value={pcdData[state.ui.selectedPCD].needsCase}
                          readOnly
                          rows={4}
                          className="w-full border border-gray-300 rounded-lg py-3 px-4 text-sm bg-gray-50"
                        />
                      </div>

                      {/* Business Plan */}
                      <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Business Plan Submission</h4>
                        <textarea
                          value={pcdData[state.ui.selectedPCD].businessPlan}
                          readOnly
                          rows={4}
                          className="w-full border border-gray-300 rounded-lg py-3 px-4 text-sm bg-gray-50"
                        />
                      </div>

                      {/* Cost Assumptions Table */}
                      <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Cost Assumptions</h4>
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200 border border-gray-300 rounded-lg">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role/Item</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Year 1 (£)</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Year 2 (£)</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Year 3 (£)</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total (£)</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {pcdData[state.ui.selectedPCD].costAssumptions?.map((cost, index) => (
                                <tr key={index}>
                                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{cost.roleItem}</td>
                                  <td className="px-4 py-3 text-sm text-gray-900">£{cost.year1?.toLocaleString()}</td>
                                  <td className="px-4 py-3 text-sm text-gray-900">£{cost.year2?.toLocaleString()}</td>
                                  <td className="px-4 py-3 text-sm text-gray-900">£{cost.year3?.toLocaleString()}</td>
                                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                    £{(cost.year1 + cost.year2 + cost.year3).toLocaleString()}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Select a PCD to View Details</h3>
                      <p className="text-gray-600">Choose a Project Control Document from the dropdown above to view its comprehensive breakdown.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Business Justification View */}
            {state.ui.viewMode === 'justification' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Star className="h-5 w-5 mr-2 text-yellow-500" />
                    Business Value Analysis
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {requirements
                      .sort((a, b) => (b.businessValueScore || 0) - (a.businessValueScore || 0))
                      .slice(0, CONSTANTS.BUSINESS_VALUE_CARDS_LIMIT)
                      .map((requirement) => (
                        <div 
                          key={requirement.id} 
                          className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => handleViewRequirement(requirement)}
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 mb-1">{requirement.id}</h4>
                              <p className="text-sm text-gray-600 line-clamp-2">{requirement.businessJustification}</p>
                            </div>
                            <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                              (requirement.businessValueScore || 0) >= 4 ? 'bg-green-100 text-green-800' :
                              (requirement.businessValueScore || 0) >= 3 ? 'bg-blue-100 text-blue-800' :
                              (requirement.businessValueScore || 0) >= 2 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              <Star className="h-3 w-3" />
                              {requirement.businessValueScore || 0}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <span className="text-gray-500">ROI:</span>
                              <span className="ml-1 font-medium">{requirement.roiProjection || 0}%</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Cost:</span>
                              <span className="ml-1 font-medium">£{((requirement.costEstimate || 0) / 1000).toFixed(0)}k</span>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}

            {/* Maturity Analysis View */}
            {state.ui.viewMode === 'maturity' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Gauge className="h-5 w-5 mr-2 text-purple-500" />
                    Capability Maturity Assessment
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <InteractiveChart 
                      title="Maturity Distribution" 
                      fullscreenId="maturity-chart"
                      onToggleFullscreen={(id) => dispatch({ type: 'SET_CHART_FULLSCREEN', chartId: id })}
                    >
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={analyticsData.maturityData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="level" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="count" fill="#8b5cf6" />
                        </BarChart>
                      </ResponsiveContainer>
                    </InteractiveChart>

                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900">Maturity Improvement Roadmap</h4>
                      {analyticsData.maturityData.map((item, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium">{item.level}</span>
                            <span className="text-sm text-gray-600">{item.count} requirements</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-purple-600 h-2 rounded-full transition-all duration-500" 
                              style={{ width: `${item.percentage}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{item.percentage}% of total</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Analytics View */}
            {state.ui.viewMode === 'analytics' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <InteractiveChart 
                    title="Requirement Status Overview" 
                    fullscreenId="analytics-status-chart"
                    onToggleFullscreen={(id) => dispatch({ type: 'SET_CHART_FULLSCREEN', chartId: id })}
                  >
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={analyticsData.statusData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="status" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </InteractiveChart>
                  
                  <InteractiveChart 
                    title="Business Value Distribution" 
                    fullscreenId="analytics-value-chart"
                    onToggleFullscreen={(id) => dispatch({ type: 'SET_CHART_FULLSCREEN', chartId: id })}
                  >
                    <ResponsiveContainer width="100%" height={300}>
                      <ScatterChart data={analyticsData.businessValueData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="cost" name="Cost (£k)" />
                        <YAxis dataKey="businessValue" name="Business Value" />
                        <Tooltip 
                          formatter={(value, name) => [
                            name === 'cost' ? `£${value}k` : value,
                            name === 'cost' ? 'Cost' : 'Business Value'
                          ]}
                        />
                        <Scatter dataKey="businessValue" fill="#10b981" />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </InteractiveChart>
                </div>
              </div>
            )}
            
            {/* Other Views Placeholder */}
            {!['overview', 'capabilities', 'requirements', 'pcd', 'maturity', 'justification', 'analytics'].includes(state.ui.viewMode) && (
              <div className="bg-white rounded-xl shadow-md p-8 text-center">
                <div className="text-gray-400 mb-4">
                  <Database className="h-16 w-16 mx-auto" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {state.ui.viewMode.charAt(0).toUpperCase() + state.ui.viewMode.slice(1)} View
                </h3>
                <p className="text-gray-600">
                  This view is under development. Coming soon!
                </p>
              </div>
            )}
          </main>
        </div>
        
        {/* Modals */}
        {state.modal.isOpen && state.modal.selectedRequirement && (
          <>
            {state.modal.editMode ? (
              <EditRequirementModal 
                requirement={state.modal.selectedRequirement} 
                onClose={() => dispatch({ type: 'CLOSE_MODAL' })}
                onSave={updateRequirement}
              />
            ) : (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{state.modal.selectedRequirement.id}</h2>
                      <p className="text-gray-600">{state.modal.selectedRequirement.category}</p>
                    </div>
                    <button onClick={() => dispatch({ type: 'CLOSE_MODAL' })} className="p-2 hover:bg-gray-100 rounded-lg">
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                  
                  <div className="p-6 space-y-6">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-medium text-blue-900 mb-3">Business Justification</h4>
                      <p className="text-blue-800">{state.modal.selectedRequirement.businessJustification}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-2">Business Value</h4>
                        <div className="flex items-center space-x-2">
                          <Star className="h-5 w-5 text-yellow-500" />
                          <span className="text-xl font-bold">{state.modal.selectedRequirement.businessValueScore}</span>
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-2">ROI Projection</h4>
                        <p className="text-xl font-bold text-green-600">{state.modal.selectedRequirement.roiProjection}%</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-2">Implementation Cost</h4>
                        <p className="text-xl font-bold">£{state.modal.selectedRequirement.costEstimate?.toLocaleString() || 'TBD'}</p>
                      </div>
                    </div>

                    {state.modal.selectedRequirement.consequences && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <h4 className="font-medium text-red-900 mb-2">Consequences of Non-Implementation</h4>
                        <p className="text-red-800">{state.modal.selectedRequirement.consequences.immediate}</p>
                      </div>
                    )}
                    
                    <div className="flex space-x-3 pt-4 border-t border-gray-200">
                      <button 
                        onClick={() => dispatch({ type: 'OPEN_MODAL', requirement: state.modal.selectedRequirement, editMode: true })}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Requirement
                      </button>
                      <button className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                        <Bell className="h-4 w-4 mr-2" />
                        Set Reminder
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* New Capability Modal */}
        <NewCapabilityModal 
          isOpen={state.ui.showNewCapabilityModal}
          onClose={() => dispatch({ type: 'TOGGLE_NEW_CAPABILITY_MODAL' })}
          onSave={handleCreateCapability}
        />

        {/* CSV Upload Modal */}
        <CSVUploadModal 
          isOpen={state.ui.showUploadModal}
          onClose={() => dispatch({ type: 'TOGGLE_UPLOAD_MODAL' })}
          onUpload={handleUploadCSV}
        />

        {/* Purge Confirmation Modal */}
        <PurgeConfirmationModal 
          isOpen={state.ui.showPurgeModal}
          onClose={() => dispatch({ type: 'TOGGLE_PURGE_MODAL' })}
          onConfirm={handlePurgeData}
        />
      </div>
    </ErrorBoundary>
  );
};

export default RequirementsDashboard;