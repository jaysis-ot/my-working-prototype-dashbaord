// src/hooks/useRiskManagement.js
import { useState, useEffect, useCallback, useMemo } from 'react';

// Risk status transitions and validation
const VALID_STATUS_TRANSITIONS = {
  'Open': ['In Progress', 'Issue', 'Closed'],
  'In Progress': ['Open', 'Issue', 'Closed'],
  'Issue': ['In Progress', 'Closed'],
  'Closed': ['Open'] // Allow reopening if needed
};

// Risk severity levels with numeric values for calculations
const SEVERITY_VALUES = {
  'Low': 1,
  'Medium': 2,
  'High': 3,
  'Critical': 4
};

// Risk categories with default settings
const RISK_CATEGORIES = {
  'Cybersecurity': { color: 'red', priority: 4 },
  'Operational': { color: 'orange', priority: 3 },
  'Financial': { color: 'yellow', priority: 2 },
  'Regulatory': { color: 'blue', priority: 3 },
  'Supply Chain': { color: 'purple', priority: 2 },
  'Environmental': { color: 'green', priority: 1 },
  'Reputational': { color: 'pink', priority: 2 },
  'Strategic': { color: 'indigo', priority: 3 }
};

// Generate comprehensive mock risk data
const generateMockRisks = () => [
  {
    id: 'RSK-001',
    title: 'Ransomware Attack on OT Systems',
    description: 'Potential ransomware targeting operational technology systems based on recent Dragonfly activity targeting gas infrastructure',
    status: 'Open',
    severity: 'Critical',
    probability: 'High',
    impact: 'Very High',
    riskScore: 25,
    category: 'Cybersecurity',
    source: 'Threat Intelligence',
    threatId: 'THR-001',
    owner: 'John Smith',
    assignee: 'Security Team',
    dueDate: '2025-07-15',
    createdDate: '2025-06-18',
    lastUpdated: '2025-06-18',
    estimatedCost: '£2,500,000',
    likelihood: 85,
    businessImpact: 95,
    tags: ['OT', 'Ransomware', 'Critical Infrastructure', 'SCADA'],
    mitigation: 'Implement network segmentation, air-gapped backups, and enhanced OT monitoring',
    residualRisk: 15,
    treatmentPlan: 'Accept residual risk after implementing controls',
    reviewDate: '2025-08-01',
    escalationRequired: true,
    relatedCapabilities: ['Network Segmentation', 'Backup & Recovery', 'OT Security'],
    auditTrail: [
      { 
        id: 'AT-001',
        date: '2025-06-18T10:30:00Z', 
        user: 'System', 
        action: 'Risk created from threat intelligence', 
        details: 'Auto-generated from THR-001 - Dragonfly APT targeting energy sector',
        previousValue: null,
        newValue: { status: 'Open', severity: 'Critical' }
      }
    ]
  },
  {
    id: 'RSK-002',
    title: 'Supply Chain Compromise - Vendor Security Vulnerability',
    description: 'Third-party vendor security vulnerability exposing gas pipeline control systems through compromised maintenance software',
    status: 'In Progress', 
    severity: 'High',
    probability: 'Medium',
    impact: 'High',
    riskScore: 18,
    category: 'Supply Chain',
    source: 'Manual Entry',
    threatId: null,
    owner: 'Sarah Johnson',
    assignee: 'Procurement Team',
    dueDate: '2025-08-01',
    createdDate: '2025-06-10',
    lastUpdated: '2025-06-17',
    estimatedCost: '£500,000',
    likelihood: 60,
    businessImpact: 75,
    tags: ['Supply Chain', 'Vendor Risk', 'Third Party'],
    mitigation: 'Vendor security assessment, contract updates, and enhanced monitoring',
    residualRisk: 8,
    treatmentPlan: 'Mitigate through vendor controls and monitoring',
    reviewDate: '2025-07-15',
    escalationRequired: false,
    relatedCapabilities: ['Vendor Management', 'Third Party Risk'],
    auditTrail: [
      { 
        id: 'AT-002',
        date: '2025-06-10T14:15:00Z', 
        user: 'Sarah Johnson', 
        action: 'Risk created', 
        details: 'Manual risk assessment from vendor security review',
        previousValue: null,
        newValue: { status: 'Open', severity: 'High' }
      },
      { 
        id: 'AT-003',
        date: '2025-06-17T09:20:00Z', 
        user: 'Sarah Johnson', 
        action: 'Status updated to In Progress', 
        details: 'Vendor assessment initiated with security team',
        previousValue: { status: 'Open' },
        newValue: { status: 'In Progress' }
      }
    ]
  },
  {
    id: 'RSK-003',
    title: 'Email Phishing Campaign Success',
    description: 'Successful phishing attack leading to credential compromise and potential lateral movement to critical systems',
    status: 'Issue',
    severity: 'Medium',
    probability: 'High',
    impact: 'Medium',
    riskScore: 12,
    category: 'Cybersecurity',
    source: 'Incident Report',
    threatId: 'THR-005',
    owner: 'Mike Wilson',
    assignee: 'IT Security',
    dueDate: '2025-06-25',
    createdDate: '2025-06-05',
    lastUpdated: '2025-06-18',
    estimatedCost: '£50,000',
    likelihood: 80,
    businessImpact: 40,
    tags: ['Phishing', 'Credentials', 'Email Security'],
    mitigation: 'Enhanced email security, user training, and MFA implementation',
    residualRisk: 5,
    treatmentPlan: 'Accept residual risk after security awareness training',
    reviewDate: '2025-07-01',
    escalationRequired: true,
    relatedCapabilities: ['Email Security', 'User Training', 'Multi-Factor Authentication'],
    auditTrail: [
      { 
        id: 'AT-004',
        date: '2025-06-05T11:45:00Z', 
        user: 'System', 
        action: 'Risk created from threat', 
        details: 'Phishing campaign detected by security monitoring',
        previousValue: null,
        newValue: { status: 'Open', severity: 'Medium' }
      },
      { 
        id: 'AT-005',
        date: '2025-06-15T16:30:00Z', 
        user: 'Mike Wilson', 
        action: 'Escalated to Issue', 
        details: 'Credentials were compromised - incident response activated',
        previousValue: { status: 'Open' },
        newValue: { status: 'Issue' }
      },
      { 
        id: 'AT-006',
        date: '2025-06-18T08:15:00Z', 
        user: 'IT Security', 
        action: 'Mitigation implemented', 
        details: 'Password reset enforced, MFA deployed, user training scheduled',
        previousValue: null,
        newValue: { mitigation: 'Updated mitigation plan' }
      }
    ]
  },
  {
    id: 'RSK-004',
    title: 'Regulatory Compliance Gap - NERC CIP Standards',
    description: 'Gap in NERC CIP compliance for critical cyber assets may result in regulatory penalties and audit findings',
    status: 'Open',
    severity: 'High',
    probability: 'Medium',
    impact: 'High',
    riskScore: 16,
    category: 'Regulatory',
    source: 'Compliance Assessment',
    threatId: null,
    owner: 'Emma Davis',
    assignee: 'Compliance Team',
    dueDate: '2025-09-01',
    createdDate: '2025-06-12',
    lastUpdated: '2025-06-12',
    estimatedCost: '£200,000',
    likelihood: 50,
    businessImpact: 80,
    tags: ['NERC CIP', 'Compliance', 'Regulatory', 'Audit'],
    mitigation: 'Implement missing controls, update documentation, and conduct gap assessment',
    residualRisk: 6,
    treatmentPlan: 'Mitigate through compliance program enhancement',
    reviewDate: '2025-08-15',
    escalationRequired: false,
    relatedCapabilities: ['Compliance Management', 'Asset Management', 'Documentation'],
    auditTrail: [
      { 
        id: 'AT-007',
        date: '2025-06-12T13:00:00Z', 
        user: 'Emma Davis', 
        action: 'Risk created', 
        details: 'Compliance gap identified during annual assessment',
        previousValue: null,
        newValue: { status: 'Open', severity: 'High' }
      }
    ]
  },
  {
    id: 'RSK-005',
    title: 'Physical Security Breach at Compressor Station',
    description: 'Unauthorized access to critical compressor station facility could lead to operational disruption or sabotage',
    status: 'Closed',
    severity: 'Medium',
    probability: 'Low',
    impact: 'Very High',
    riskScore: 10,
    category: 'Operational',
    source: 'Security Assessment',
    threatId: null,
    owner: 'David Brown',
    assignee: 'Physical Security',
    dueDate: '2025-05-30',
    createdDate: '2025-05-01',
    lastUpdated: '2025-05-28',
    estimatedCost: '£1,000,000',
    likelihood: 25,
    businessImpact: 90,
    tags: ['Physical Security', 'Critical Infrastructure', 'Access Control'],
    mitigation: 'Enhanced perimeter security, access controls, and monitoring systems implemented',
    residualRisk: 3,
    treatmentPlan: 'Risk mitigated through physical security enhancements',
    reviewDate: '2025-11-01',
    escalationRequired: false,
    relatedCapabilities: ['Physical Security', 'Access Control', 'Monitoring'],
    auditTrail: [
      { 
        id: 'AT-008',
        date: '2025-05-01T09:00:00Z', 
        user: 'David Brown', 
        action: 'Risk created', 
        details: 'Physical security assessment identified vulnerabilities',
        previousValue: null,
        newValue: { status: 'Open', severity: 'Medium' }
      },
      { 
        id: 'AT-009',
        date: '2025-05-15T14:30:00Z', 
        user: 'David Brown', 
        action: 'Status updated to In Progress', 
        details: 'Security enhancement project initiated',
        previousValue: { status: 'Open' },
        newValue: { status: 'In Progress' }
      },
      { 
        id: 'AT-010',
        date: '2025-05-28T17:00:00Z', 
        user: 'Physical Security', 
        action: 'Risk closed', 
        details: 'All physical security enhancements completed and tested',
        previousValue: { status: 'In Progress' },
        newValue: { status: 'Closed' }
      }
    ]
  }
];

// Custom hook for risk management
const useRiskManagement = (initialRisks = null) => {
  // State management
  const [risks, setRisks] = useState(initialRisks || generateMockRisks());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: 'All',
    severity: 'All',
    category: 'All',
    owner: 'All',
    assignee: 'All',
    search: '',
    dateRange: 'All',
    tags: []
  });

  // Risk calculation utilities
  const calculateRiskScore = useCallback((probability, impact) => {
    const probValues = {
      'Very Low': 10,
      'Low': 30,
      'Medium': 50,
      'High': 70,
      'Very High': 90
    };
    
    const impactValues = {
      'Very Low': 10,
      'Low': 30,
      'Medium': 50,
      'High': 70,
      'Very High': 90
    };

    const probNum = probValues[probability] || 50;
    const impactNum = impactValues[impact] || 50;
    return Math.round((probNum * impactNum) / 100 * 25);
  }, []);

  // Audit trail management
  const addAuditEntry = useCallback((riskId, action, details, previousValue = null, newValue = null) => {
    return {
      id: `AT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      date: new Date().toISOString(),
      user: 'Current User', // Replace with actual user context
      action,
      details,
      previousValue,
      newValue
    };
  }, []);

  // Risk validation
  const validateRisk = useCallback((risk) => {
    const errors = [];
    
    if (!risk.title || risk.title.trim().length === 0) {
      errors.push('Title is required');
    }
    
    if (!risk.description || risk.description.trim().length === 0) {
      errors.push('Description is required');
    }
    
    if (!risk.owner || risk.owner.trim().length === 0) {
      errors.push('Risk owner is required');
    }
    
    if (!['Low', 'Medium', 'High', 'Critical'].includes(risk.severity)) {
      errors.push('Invalid severity level');
    }
    
    if (!Object.keys(RISK_CATEGORIES).includes(risk.category)) {
      errors.push('Invalid risk category');
    }
    
    if (risk.dueDate && new Date(risk.dueDate) < new Date()) {
      errors.push('Due date cannot be in the past');
    }

    return errors;
  }, []);

  // CRUD Operations
  const createRisk = useCallback(async (riskData) => {
    setLoading(true);
    setError(null);
    
    try {
      // Validate risk data
      const validationErrors = validateRisk(riskData);
      if (validationErrors.length > 0) {
        throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
      }

      // Generate new risk ID
      const newId = `RSK-${String(risks.length + 1).padStart(3, '0')}`;
      
      // Calculate risk score
      const riskScore = calculateRiskScore(riskData.probability, riskData.impact);
      
      // Create new risk with metadata
      const newRisk = {
        id: newId,
        ...riskData,
        riskScore,
        createdDate: new Date().toISOString().split('T')[0],
        lastUpdated: new Date().toISOString().split('T')[0],
        residualRisk: Math.max(1, Math.round(riskScore * 0.3)), // Assume 70% mitigation effectiveness
        reviewDate: riskData.reviewDate || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 90 days from now
        escalationRequired: riskData.severity === 'Critical' || riskScore >= 20,
        relatedCapabilities: riskData.relatedCapabilities || [],
        auditTrail: [
          addAuditEntry(
            newId,
            'Risk created',
            riskData.source === 'Threat Intelligence' 
              ? `Auto-generated from threat ${riskData.threatId}` 
              : 'Manual risk entry',
            null,
            { status: riskData.status || 'Open', severity: riskData.severity }
          )
        ]
      };

      // Add to risks array
      setRisks(prevRisks => [...prevRisks, newRisk]);
      
      return { success: true, risk: newRisk };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [risks.length, calculateRiskScore, validateRisk, addAuditEntry]);

  const updateRisk = useCallback(async (riskId, updates) => {
    setLoading(true);
    setError(null);
    
    try {
      const riskIndex = risks.findIndex(r => r.id === riskId);
      if (riskIndex === -1) {
        throw new Error('Risk not found');
      }

      const currentRisk = risks[riskIndex];
      const updatedRisk = { ...currentRisk, ...updates };
      
      // Validate updated risk
      const validationErrors = validateRisk(updatedRisk);
      if (validationErrors.length > 0) {
        throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
      }

      // Recalculate risk score if probability or impact changed
      if (updates.probability || updates.impact) {
        updatedRisk.riskScore = calculateRiskScore(
          updatedRisk.probability, 
          updatedRisk.impact
        );
      }

      // Update metadata
      updatedRisk.lastUpdated = new Date().toISOString().split('T')[0];
      
      // Add audit entry
      const auditEntry = addAuditEntry(
        riskId,
        'Risk updated',
        'Risk details modified',
        { ...currentRisk },
        { ...updatedRisk }
      );
      
      updatedRisk.auditTrail = [...currentRisk.auditTrail, auditEntry];

      // Update risks array
      const newRisks = [...risks];
      newRisks[riskIndex] = updatedRisk;
      setRisks(newRisks);
      
      return { success: true, risk: updatedRisk };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [risks, calculateRiskScore, validateRisk, addAuditEntry]);

  const deleteRisk = useCallback(async (riskId) => {
    setLoading(true);
    setError(null);
    
    try {
      const riskExists = risks.find(r => r.id === riskId);
      if (!riskExists) {
        throw new Error('Risk not found');
      }

      // Remove risk from array
      setRisks(prevRisks => prevRisks.filter(r => r.id !== riskId));
      
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [risks]);

  // Status management
  const changeRiskStatus = useCallback(async (riskId, newStatus, comments = '') => {
    setLoading(true);
    setError(null);
    
    try {
      const risk = risks.find(r => r.id === riskId);
      if (!risk) {
        throw new Error('Risk not found');
      }

      // Validate status transition
      if (!VALID_STATUS_TRANSITIONS[risk.status]?.includes(newStatus)) {
        throw new Error(`Invalid status transition from ${risk.status} to ${newStatus}`);
      }

      // Create audit entry for status change
      const auditEntry = addAuditEntry(
        riskId,
        `Status changed to ${newStatus}`,
        comments || `Risk status updated from ${risk.status} to ${newStatus}`,
        { status: risk.status },
        { status: newStatus }
      );

      // Update risk
      const updatedRisk = {
        ...risk,
        status: newStatus,
        lastUpdated: new Date().toISOString().split('T')[0],
        auditTrail: [...risk.auditTrail, auditEntry]
      };

      // Update risks array
      setRisks(prevRisks => 
        prevRisks.map(r => r.id === riskId ? updatedRisk : r)
      );
      
      return { success: true, risk: updatedRisk };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [risks, addAuditEntry]);

  // Threat to risk conversion
  const createRiskFromThreat = useCallback(async (threat) => {
    const riskData = {
      title: `Risk from ${threat.title}`,
      description: `Potential risk identified from threat intelligence: ${threat.description}`,
      severity: threat.severity || 'Medium',
      probability: threat.likelihood > 70 ? 'High' : threat.likelihood > 40 ? 'Medium' : 'Low',
      impact: threat.impact > 80 ? 'Very High' : threat.impact > 60 ? 'High' : threat.impact > 40 ? 'Medium' : 'Low',
      category: threat.type || 'Cybersecurity',
      source: 'Threat Intelligence',
      threatId: threat.id,
      owner: 'Security Team',
      assignee: 'To Be Assigned',
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
      estimatedCost: threat.estimatedImpact || '£0',
      likelihood: threat.likelihood || 50,
      businessImpact: threat.impact || 50,
      tags: threat.tags || [],
      mitigation: 'To be determined',
      treatmentPlan: 'Under assessment'
    };

    return await createRisk(riskData);
  }, [createRisk]);

  // Bulk operations
  const bulkUpdateRisks = useCallback(async (riskIds, updates) => {
    setLoading(true);
    setError(null);
    
    try {
      const results = [];
      
      for (const riskId of riskIds) {
        const result = await updateRisk(riskId, updates);
        results.push(result);
      }
      
      const successCount = results.filter(r => r.success).length;
      const failureCount = results.filter(r => !r.success).length;
      
      return {
        success: failureCount === 0,
        successCount,
        failureCount,
        results
      };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [updateRisk]);

  // Filtering and search
  const filteredRisks = useMemo(() => {
    return risks.filter(risk => {
      // Status filter
      if (filters.status !== 'All' && risk.status !== filters.status) {
        return false;
      }
      
      // Severity filter
      if (filters.severity !== 'All' && risk.severity !== filters.severity) {
        return false;
      }
      
      // Category filter
      if (filters.category !== 'All' && risk.category !== filters.category) {
        return false;
      }
      
      // Owner filter
      if (filters.owner !== 'All' && risk.owner !== filters.owner) {
        return false;
      }
      
      // Assignee filter
      if (filters.assignee !== 'All' && risk.assignee !== filters.assignee) {
        return false;
      }
      
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const searchableFields = [
          risk.title,
          risk.description,
          risk.owner,
          risk.assignee,
          ...(risk.tags || [])
        ].join(' ').toLowerCase();
        
        if (!searchableFields.includes(searchLower)) {
          return false;
        }
      }
      
      // Tag filter
      if (filters.tags.length > 0) {
        const riskTags = risk.tags || [];
        if (!filters.tags.some(tag => riskTags.includes(tag))) {
          return false;
        }
      }
      
      // Date range filter
      if (filters.dateRange !== 'All') {
        const riskDate = new Date(risk.createdDate);
        const now = new Date();
        const daysDiff = (now - riskDate) / (1000 * 60 * 60 * 24);
        
        switch (filters.dateRange) {
          case 'Last 7 days':
            if (daysDiff > 7) return false;
            break;
          case 'Last 30 days':
            if (daysDiff > 30) return false;
            break;
          case 'Last 90 days':
            if (daysDiff > 90) return false;
            break;
        }
      }
      
      return true;
    });
  }, [risks, filters]);

  // Analytics and metrics
  const riskMetrics = useMemo(() => {
    const total = risks.length;
    const open = risks.filter(r => r.status === 'Open').length;
    const inProgress = risks.filter(r => r.status === 'In Progress').length;
    const issues = risks.filter(r => r.status === 'Issue').length;
    const closed = risks.filter(r => r.status === 'Closed').length;
    
    const critical = risks.filter(r => r.severity === 'Critical').length;
    const high = risks.filter(r => r.severity === 'High').length;
    const medium = risks.filter(r => r.severity === 'Medium').length;
    const low = risks.filter(r => r.severity === 'Low').length;
    
    const overdue = risks.filter(r => 
      r.status !== 'Closed' && 
      new Date(r.dueDate) < new Date()
    ).length;
    
    const escalationRequired = risks.filter(r => 
      r.escalationRequired && r.status !== 'Closed'
    ).length;
    
    // Calculate average risk score
    const avgRiskScore = risks.length > 0 
      ? risks.reduce((sum, r) => sum + r.riskScore, 0) / risks.length 
      : 0;
    
    // Risk distribution by category
    const categoryDistribution = Object.keys(RISK_CATEGORIES).reduce((acc, category) => {
      acc[category] = risks.filter(r => r.category === category).length;
      return acc;
    }, {});
    
    // Monthly risk trends (last 6 months)
    const monthlyTrends = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStr = date.toISOString().slice(0, 7); // YYYY-MM format
      
      return {
        month: monthStr,
        created: risks.filter(r => r.createdDate.startsWith(monthStr)).length,
        closed: risks.filter(r => 
          r.status === 'Closed' && 
          r.auditTrail.some(entry => 
            entry.action.includes('closed') && 
            entry.date.startsWith(monthStr)
          )
        ).length
      };
    }).reverse();

    return {
      total,
      open,
      inProgress,
      issues,
      closed,
      critical,
      high,
      medium,
      low,
      overdue,
      escalationRequired,
      avgRiskScore: Math.round(avgRiskScore * 100) / 100,
      categoryDistribution,
      monthlyTrends
    };
  }, [risks]);

  // Utility functions
  const getRiskById = useCallback((riskId) => {
    return risks.find(r => r.id === riskId);
  }, [risks]);

  const getRisksByThreat = useCallback((threatId) => {
    return risks.filter(r => r.threatId === threatId);
  }, [risks]);

  const getRisksByCategory = useCallback((category) => {
    return risks.filter(r => r.category === category);
  }, [risks]);

  const getOverdueRisks = useCallback(() => {
    return risks.filter(r => 
      r.status !== 'Closed' && 
      new Date(r.dueDate) < new Date()
    );
  }, [risks]);

  const getHighPriorityRisks = useCallback(() => {
    return risks.filter(r => 
      (r.severity === 'Critical' || r.severity === 'High') && 
      r.status !== 'Closed'
    );
  }, [risks]);

  // Export functionality
  const exportRisks = useCallback((format = 'json') => {
    const exportData = filteredRisks.map(risk => ({
      id: risk.id,
      title: risk.title,
      description: risk.description,
      status: risk.status,
      severity: risk.severity,
      category: risk.category,
      owner: risk.owner,
      assignee: risk.assignee,
      dueDate: risk.dueDate,
      riskScore: risk.riskScore,
      estimatedCost: risk.estimatedCost,
      tags: risk.tags?.join(', ') || '',
      createdDate: risk.createdDate,
      lastUpdated: risk.lastUpdated
    }));

    if (format === 'csv') {
      const headers = Object.keys(exportData[0] || {});
      const csvContent = [
        headers.join(','),
        ...exportData.map(row => 
          headers.map(header => `"${row[header] || ''}"`).join(',')
        )
      ].join('\n');
      
      return csvContent;
    }
    
    return JSON.stringify(exportData, null, 2);
  }, [filteredRisks]);

  // Filter management
  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      status: 'All',
      severity: 'All',
      category: 'All',
      owner: 'All',
      assignee: 'All',
      search: '',
      dateRange: 'All',
      tags: []
    });
  }, []);

  // Return hook interface
  return {
    // State
    risks: filteredRisks,
    allRisks: risks,
    loading,
    error,
    filters,
    
    // Metrics
    metrics: riskMetrics,
    
    // CRUD Operations
    createRisk,
    updateRisk,
    deleteRisk,
    
    // Status Management
    changeRiskStatus,
    
    // Bulk Operations
    bulkUpdateRisks,
    
    // Threat Integration
    createRiskFromThreat,
    
    // Utility Functions
    getRiskById,
    getRisksByThreat,
    getRisksByCategory,
    getOverdueRisks,
    getHighPriorityRisks,
    
    // Filter Management
    updateFilter,
    clearFilters,
    
    // Export
    exportRisks,
    
    // Constants
    RISK_CATEGORIES,
    VALID_STATUS_TRANSITIONS,
    SEVERITY_VALUES,
    
    // Utilities
    calculateRiskScore,
    validateRisk
  };
};

export default useRiskManagement;