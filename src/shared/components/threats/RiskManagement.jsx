// src/components/threats/RiskManagement.jsx
import React, { useState, useMemo, useReducer } from 'react';
import { 
  AlertTriangle, Plus, Filter, Search, Calendar, User, Target, Clock, 
  CheckCircle, XCircle, Edit, Trash2, ArrowRight, TrendingUp, BarChart3,
  FileText, Bell, Eye, Download, RefreshCw, ChevronDown, ChevronRight,
  Activity, Shield, ExternalLink, MessageSquare, History, Save, Send,
  UserCircle, MapPin, Tag, DollarSign, Building, Users, Zap, AlertCircle
} from 'lucide-react';

// Mock data for risks - replace with your actual data source
const generateMockRisks = () => [
  {
    id: 'RSK-001',
    title: 'Ransomware Attack on OT Systems',
    description: 'Potential ransomware targeting operational technology systems based on recent Dragonfly activity',
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
    tags: ['OT', 'Ransomware', 'Critical Infrastructure'],
    mitigation: 'Implement network segmentation and backup systems',
    comments: [
      {
        id: 'comment-001',
        user: 'John Smith',
        userRole: 'Security Manager',
        timestamp: '2025-06-18T10:30:00Z',
        content: 'This risk requires immediate attention. We\'ve seen similar attacks on other energy companies.',
        type: 'comment'
      },
      {
        id: 'comment-002',
        user: 'Sarah Johnson',
        userRole: 'CISO',
        timestamp: '2025-06-18T14:15:00Z',
        content: 'Agreed. I\'m escalating this to the board. We need to accelerate our network segmentation project.',
        type: 'comment'
      }
    ],
    auditTrail: [
      { 
        id: 'audit-001',
        date: '2025-06-18T08:00:00Z', 
        user: 'System', 
        userRole: 'Automated System',
        action: 'Risk created from threat intelligence', 
        details: 'Auto-generated from THR-001',
        changes: { status: 'Open', severity: 'Critical' }
      },
      {
        id: 'audit-002',
        date: '2025-06-18T10:30:00Z',
        user: 'John Smith',
        userRole: 'Security Manager',
        action: 'Comment added',
        details: 'Added initial assessment comment'
      }
    ]
  },
  {
    id: 'RSK-002',
    title: 'Supply Chain Compromise',
    description: 'Third-party vendor security vulnerability exposing gas pipeline control systems',
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
    tags: ['Supply Chain', 'Vendor Risk'],
    mitigation: 'Vendor security assessment and contract updates',
    comments: [
      {
        id: 'comment-003',
        user: 'Sarah Johnson',
        userRole: 'CISO',
        timestamp: '2025-06-10T09:00:00Z',
        content: 'Vendor assessment initiated. Expecting results by end of week.',
        type: 'comment'
      }
    ],
    auditTrail: [
      { 
        id: 'audit-003',
        date: '2025-06-10T09:00:00Z', 
        user: 'Sarah Johnson', 
        userRole: 'CISO',
        action: 'Risk created', 
        details: 'Manual risk assessment',
        changes: { status: 'Open', severity: 'High' }
      },
      { 
        id: 'audit-004',
        date: '2025-06-17T14:30:00Z', 
        user: 'Sarah Johnson', 
        userRole: 'CISO',
        action: 'Status updated to In Progress', 
        details: 'Vendor assessment initiated',
        changes: { status: 'In Progress' }
      }
    ]
  },
  {
    id: 'RSK-003',
    title: 'Phishing Campaign Success',
    description: 'Successful phishing attack leading to credential compromise',
    status: 'Issue',
    severity: 'Medium',
    probability: 'High',
    impact: 'Medium',
    riskScore: 12,
    category: 'Social Engineering',
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
    mitigation: 'Enhanced email security and user training',
    comments: [
      {
        id: 'comment-004',
        user: 'Mike Wilson',
        userRole: 'IT Security Lead',
        timestamp: '2025-06-15T11:20:00Z',
        content: 'Credentials have been compromised. Initiating password reset for all affected users.',
        type: 'escalation'
      },
      {
        id: 'comment-005',
        user: 'IT Security',
        userRole: 'Security Team',
        timestamp: '2025-06-18T16:00:00Z',
        content: 'Password reset completed. MFA has been enforced for all accounts.',
        type: 'resolution'
      }
    ],
    auditTrail: [
      { 
        id: 'audit-005',
        date: '2025-06-05T10:00:00Z', 
        user: 'System', 
        userRole: 'Automated System',
        action: 'Risk created from threat', 
        details: 'Phishing campaign detected',
        changes: { status: 'Open', severity: 'Medium' }
      },
      { 
        id: 'audit-006',
        date: '2025-06-15T11:20:00Z', 
        user: 'Mike Wilson', 
        userRole: 'IT Security Lead',
        action: 'Escalated to Issue', 
        details: 'Credentials were compromised',
        changes: { status: 'Issue' }
      },
      { 
        id: 'audit-007',
        date: '2025-06-18T16:00:00Z', 
        user: 'IT Security', 
        userRole: 'Security Team',
        action: 'Mitigation implemented', 
        details: 'Password reset and MFA enforced',
        changes: { mitigation: 'Enhanced email security and user training' }
      }
    ]
  }
];

// Risk management reducer
const riskReducer = (state, action) => {
  switch (action.type) {
    case 'SET_RISKS':
      return { ...state, risks: action.payload };
    case 'ADD_RISK':
      return { ...state, risks: [...state.risks, action.payload] };
    case 'UPDATE_RISK':
      return {
        ...state,
        risks: state.risks.map(risk => 
          risk.id === action.payload.id ? action.payload : risk
        )
      };
    case 'DELETE_RISK':
      return {
        ...state,
        risks: state.risks.filter(risk => risk.id !== action.payload)
      };
    case 'ADD_COMMENT':
      return {
        ...state,
        risks: state.risks.map(risk => 
          risk.id === action.payload.riskId 
            ? { 
                ...risk, 
                comments: [...(risk.comments || []), action.payload.comment],
                lastUpdated: new Date().toISOString(),
                auditTrail: [...risk.auditTrail, {
                  id: `audit-${Date.now()}`,
                  date: new Date().toISOString(),
                  user: action.payload.comment.user,
                  userRole: action.payload.comment.userRole,
                  action: 'Comment added',
                  details: `Added ${action.payload.comment.type} comment`
                }]
              }
            : risk
        )
      };
    case 'SET_FILTER':
      return { ...state, filters: { ...state.filters, [action.key]: action.value } };
    case 'SET_VIEW':
      return { ...state, activeView: action.payload };
    case 'SET_SELECTED_RISK':
      return { ...state, selectedRisk: action.payload };
    default:
      return state;
  }
};

const RiskManagement = ({ threats = [], capabilities = [], onCreateRequirement, currentUser = { name: 'Current User', role: 'Security Analyst' } }) => {
  // State management
  const [state, dispatch] = useReducer(riskReducer, {
    risks: generateMockRisks(),
    activeView: 'dashboard', // dashboard, create, edit, details
    selectedRisk: null,
    filters: {
      status: 'All',
      severity: 'All',
      category: 'All',
      owner: 'All',
      search: ''
    }
  });

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [commentType, setCommentType] = useState('comment');

  // Computed values
  const filteredRisks = useMemo(() => {
    return state.risks.filter(risk => {
      const matchesStatus = state.filters.status === 'All' || risk.status === state.filters.status;
      const matchesSeverity = state.filters.severity === 'All' || risk.severity === state.filters.severity;
      const matchesCategory = state.filters.category === 'All' || risk.category === state.filters.category;
      const matchesOwner = state.filters.owner === 'All' || risk.owner === state.filters.owner;
      const matchesSearch = state.filters.search === '' || 
        risk.title.toLowerCase().includes(state.filters.search.toLowerCase()) ||
        risk.description.toLowerCase().includes(state.filters.search.toLowerCase());
      
      return matchesStatus && matchesSeverity && matchesCategory && matchesOwner && matchesSearch;
    });
  }, [state.risks, state.filters]);

  const riskMetrics = useMemo(() => {
    const total = state.risks.length;
    const open = state.risks.filter(r => r.status === 'Open').length;
    const inProgress = state.risks.filter(r => r.status === 'In Progress').length;
    const issues = state.risks.filter(r => r.status === 'Issue').length;
    const closed = state.risks.filter(r => r.status === 'Closed').length;
    const critical = state.risks.filter(r => r.severity === 'Critical').length;
    const high = state.risks.filter(r => r.severity === 'High').length;
    const overdue = state.risks.filter(r => new Date(r.dueDate) < new Date() && r.status !== 'Closed').length;
    
    return { total, open, inProgress, issues, closed, critical, high, overdue };
  }, [state.risks]);

  // Utility functions
  const addAuditTrailEntry = (risk, action, details, changes = {}) => {
    return {
      ...risk,
      auditTrail: [...risk.auditTrail, {
        id: `audit-${Date.now()}`,
        date: new Date().toISOString(),
        user: currentUser.name,
        userRole: currentUser.role,
        action,
        details,
        changes
      }],
      lastUpdated: new Date().toISOString()
    };
  };

  // Handlers
  const handleCreateRisk = (riskData) => {
    const newRisk = {
      id: `RSK-${String(state.risks.length + 1).padStart(3, '0')}`,
      ...riskData,
      createdDate: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      comments: [],
      auditTrail: [
        { 
          id: `audit-${Date.now()}`,
          date: new Date().toISOString(), 
          user: currentUser.name, 
          userRole: currentUser.role,
          action: 'Risk created', 
          details: riskData.source === 'Manual Entry' ? 'Manual risk entry' : `Created from threat ${riskData.threatId}`,
          changes: { 
            status: riskData.status,
            severity: riskData.severity,
            owner: riskData.owner
          }
        }
      ]
    };
    dispatch({ type: 'ADD_RISK', payload: newRisk });
    setShowCreateModal(false);
  };

  const handleUpdateRisk = (updatedRisk, changes = {}) => {
    const riskWithAudit = addAuditTrailEntry(
      updatedRisk,
      'Risk updated',
      'Risk details modified',
      changes
    );
    dispatch({ type: 'UPDATE_RISK', payload: riskWithAudit });
    setShowEditModal(false);
  };

  const handleStatusChange = (riskId, newStatus) => {
    const risk = state.risks.find(r => r.id === riskId);
    if (!risk) return;

    const updatedRisk = addAuditTrailEntry(
      { ...risk, status: newStatus },
      `Status changed to ${newStatus}`,
      `Risk status updated from ${risk.status} to ${newStatus}`,
      { status: newStatus }
    );
    dispatch({ type: 'UPDATE_RISK', payload: updatedRisk });
  };

  const handleAddComment = (riskId) => {
    if (!newComment.trim()) return;

    const comment = {
      id: `comment-${Date.now()}`,
      user: currentUser.name,
      userRole: currentUser.role,
      timestamp: new Date().toISOString(),
      content: newComment.trim(),
      type: commentType
    };

    dispatch({ 
      type: 'ADD_COMMENT', 
      payload: { riskId, comment }
    });

    setNewComment('');
    setCommentType('comment');
  };

  const handleCreateFromThreat = (threat) => {
    const riskData = {
      title: `Risk from ${threat.title}`,
      description: `Potential risk identified from threat intelligence: ${threat.description}`,
      severity: threat.severity,
      probability: threat.likelihood > 70 ? 'High' : threat.likelihood > 40 ? 'Medium' : 'Low',
      impact: threat.impact > 80 ? 'Very High' : threat.impact > 60 ? 'High' : threat.impact > 40 ? 'Medium' : 'Low',
      riskScore: Math.round((threat.likelihood * threat.impact) / 100 * 25),
      category: threat.type,
      source: 'Threat Intelligence',
      threatId: threat.id,
      owner: currentUser.name,
      assignee: 'To Be Assigned',
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
      estimatedCost: threat.estimatedImpact || '£0',
      likelihood: threat.likelihood,
      businessImpact: threat.impact,
      tags: threat.tags || [],
      mitigation: 'To be determined',
      status: 'Open'
    };
    handleCreateRisk(riskData);
  };

  // Render components
  const renderStatCard = (title, value, subtitle, icon, color = 'blue') => (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-bold text-${color}-600`}>{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`text-${color}-600`}>
          {icon}
        </div>
      </div>
    </div>
  );

  const renderRiskCard = (risk) => {
    const getSeverityColor = (severity) => {
      switch (severity) {
        case 'Critical': return 'red';
        case 'High': return 'orange';
        case 'Medium': return 'yellow';
        case 'Low': return 'green';
        default: return 'gray';
      }
    };

    const getStatusColor = (status) => {
      switch (status) {
        case 'Open': return 'blue';
        case 'In Progress': return 'yellow';
        case 'Issue': return 'red';
        case 'Closed': return 'green';
        default: return 'gray';
      }
    };

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString();
    };

    return (
      <div key={risk.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <button
                onClick={() => {
                  dispatch({ type: 'SET_SELECTED_RISK', payload: risk });
                  setShowDetailsModal(true);
                }}
                className="font-semibold text-gray-900 hover:text-blue-600 transition-colors"
              >
                {risk.title}
              </button>
              <span className={`px-2 py-1 text-xs rounded-full bg-${getSeverityColor(risk.severity)}-100 text-${getSeverityColor(risk.severity)}-800`}>
                {risk.severity}
              </span>
              <span className={`px-2 py-1 text-xs rounded-full bg-${getStatusColor(risk.status)}-100 text-${getStatusColor(risk.status)}-800`}>
                {risk.status}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-2">{risk.description}</p>
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <span className="flex items-center"><User className="w-3 h-3 mr-1" />{risk.owner}</span>
              <span className="flex items-center"><Calendar className="w-3 h-3 mr-1" />{formatDate(risk.dueDate)}</span>
              <span className="flex items-center"><Target className="w-3 h-3 mr-1" />Score: {risk.riskScore}</span>
              {risk.comments && risk.comments.length > 0 && (
                <span className="flex items-center"><MessageSquare className="w-3 h-3 mr-1" />{risk.comments.length} comments</span>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                dispatch({ type: 'SET_SELECTED_RISK', payload: risk });
                setShowEditModal(true);
              }}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              title="Edit Risk"
            >
              <Edit className="w-4 h-4" />
            </button>
            <div className="relative group">
              <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                <ChevronDown className="w-4 h-4" />
              </button>
              <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                <button
                  onClick={() => handleStatusChange(risk.id, 'In Progress')}
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                  disabled={risk.status === 'In Progress'}
                >
                  Mark In Progress
                </button>
                <button
                  onClick={() => handleStatusChange(risk.id, 'Issue')}
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                  disabled={risk.status === 'Issue'}
                >
                  Escalate to Issue
                </button>
                <button
                  onClick={() => handleStatusChange(risk.id, 'Closed')}
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                  disabled={risk.status === 'Closed'}
                >
                  Close Risk
                </button>
                {onCreateRequirement && (
                  <button
                    onClick={() => onCreateRequirement({
                      title: `Mitigate: ${risk.title}`,
                      description: `Security requirement to address risk: ${risk.description}`,
                      priority: risk.severity,
                      category: 'Security Control',
                      sourceType: 'Risk Assessment',
                      sourceId: risk.id
                    })}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 border-t"
                  >
                    Create Requirement
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        {risk.tags && risk.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {risk.tags.map(tag => (
              <span key={tag} className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Risk Form Component (used for both create and edit)
  const RiskForm = ({ initialData = null, onSubmit, onCancel, isEdit = false }) => {
    const [formData, setFormData] = useState({
      title: initialData?.title || '',
      description: initialData?.description || '',
      severity: initialData?.severity || 'Medium',
      probability: initialData?.probability || 'Medium',
      impact: initialData?.impact || 'Medium',
      category: initialData?.category || 'Cybersecurity',
      owner: initialData?.owner || currentUser.name,
      assignee: initialData?.assignee || '',
      dueDate: initialData?.dueDate || '',
      estimatedCost: initialData?.estimatedCost || '',
      tags: initialData?.tags?.join(', ') || '',
      mitigation: initialData?.mitigation || '',
      source: initialData?.source || 'Manual Entry',
      status: initialData?.status || 'Open'
    });

    const [errors, setErrors] = useState({});

    const validateForm = () => {
      const newErrors = {};
      if (!formData.title.trim()) newErrors.title = 'Title is required';
      if (!formData.description.trim()) newErrors.description = 'Description is required';
      if (!formData.owner.trim()) newErrors.owner = 'Owner is required';
      
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      if (!validateForm()) return;

      const riskScore = calculateRiskScore(formData.probability, formData.impact);
      const riskData = {
        ...formData,
        riskScore,
        likelihood: probabilityToNumber(formData.probability),
        businessImpact: impactToNumber(formData.impact),
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      };

      if (isEdit) {
        const changes = {};
        Object.keys(formData).forEach(key => {
          if (initialData[key] !== formData[key]) {
            changes[key] = formData[key];
          }
        });
        onSubmit({ ...initialData, ...riskData }, changes);
      } else {
        onSubmit(riskData);
      }
    };

    const calculateRiskScore = (probability, impact) => {
      const probNum = probabilityToNumber(probability);
      const impactNum = impactToNumber(impact);
      return Math.round((probNum * impactNum) / 100 * 25);
    };

    const probabilityToNumber = (prob) => {
      switch (prob) {
        case 'Very Low': return 10;
        case 'Low': return 30;
        case 'Medium': return 50;
        case 'High': return 70;
        case 'Very High': return 90;
        default: return 50;
      }
    };

    const impactToNumber = (impact) => {
      switch (impact) {
        case 'Very Low': return 10;
        case 'Low': return 30;
        case 'Medium': return 50;
        case 'High': return 70;
        case 'Very High': return 90;
        default: return 50;
      }
    };

    const currentRiskScore = calculateRiskScore(formData.probability, formData.impact);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">{isEdit ? 'Edit Risk' : 'Create New Risk'}</h2>
            <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
              <XCircle className="w-6 h-6" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Risk Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.title ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.description ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Issue">Issue</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
                <select
                  value={formData.severity}
                  onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Probability</label>
                <select
                  value={formData.probability}
                  onChange={(e) => setFormData({ ...formData, probability: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Very Low">Very Low (10%)</option>
                  <option value="Low">Low (30%)</option>
                  <option value="Medium">Medium (50%)</option>
                  <option value="High">High (70%)</option>
                  <option value="Very High">Very High (90%)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Impact</label>
                <select
                  value={formData.impact}
                  onChange={(e) => setFormData({ ...formData, impact: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Very Low">Very Low</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Very High">Very High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Cybersecurity">Cybersecurity</option>
                  <option value="Operational">Operational</option>
                  <option value="Financial">Financial</option>
                  <option value="Regulatory">Regulatory</option>
                  <option value="Supply Chain">Supply Chain</option>
                  <option value="Environmental">Environmental</option>
                  <option value="Social Engineering">Social Engineering</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Risk Owner</label>
                <input
                  type="text"
                  value={formData.owner}
                  onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.owner ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                {errors.owner && <p className="text-red-500 text-xs mt-1">{errors.owner}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assignee</label>
                <input
                  type="text"
                  value={formData.assignee}
                  onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Cost</label>
                <input
                  type="text"
                  value={formData.estimatedCost}
                  onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value })}
                  placeholder="£0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="tag1, tag2, tag3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Mitigation Strategy</label>
                <textarea
                  value={formData.mitigation}
                  onChange={(e) => setFormData({ ...formData, mitigation: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Risk Score Display */}
              <div className="md:col-span-2">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Calculated Risk Score</h4>
                  <div className="flex items-center space-x-4">
                    <div className={`text-2xl font-bold ${
                      currentRiskScore >= 20 ? 'text-red-600' :
                      currentRiskScore >= 15 ? 'text-orange-600' :
                      currentRiskScore >= 10 ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      {currentRiskScore}
                    </div>
                    <div className="text-sm text-gray-600">
                      <div>Probability: {probabilityToNumber(formData.probability)}%</div>
                      <div>Impact: {impactToNumber(formData.impact)}%</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {isEdit ? 'Update Risk' : 'Create Risk'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Risk Details Modal Component
  const RiskDetailsModal = ({ risk, onClose }) => {
    if (!risk) return null;

    const formatDateTime = (dateString) => {
      return new Date(dateString).toLocaleString();
    };

    const getCommentTypeIcon = (type) => {
      switch (type) {
        case 'escalation': return <AlertCircle className="w-4 h-4 text-orange-500" />;
        case 'resolution': return <CheckCircle className="w-4 h-4 text-green-500" />;
        default: return <MessageSquare className="w-4 h-4 text-blue-500" />;
      }
    };

    const getCommentTypeColor = (type) => {
      switch (type) {
        case 'escalation': return 'border-l-orange-500 bg-orange-50';
        case 'resolution': return 'border-l-green-500 bg-green-50';
        default: return 'border-l-blue-500 bg-blue-50';
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{risk.title}</h2>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`px-2 py-1 text-xs rounded-full bg-${risk.severity === 'Critical' ? 'red' : risk.severity === 'High' ? 'orange' : risk.severity === 'Medium' ? 'yellow' : 'green'}-100 text-${risk.severity === 'Critical' ? 'red' : risk.severity === 'High' ? 'orange' : risk.severity === 'Medium' ? 'yellow' : 'green'}-800`}>
                  {risk.severity}
                </span>
                <span className={`px-2 py-1 text-xs rounded-full bg-${risk.status === 'Open' ? 'blue' : risk.status === 'In Progress' ? 'yellow' : risk.status === 'Issue' ? 'red' : 'green'}-100 text-${risk.status === 'Open' ? 'blue' : risk.status === 'In Progress' ? 'yellow' : risk.status === 'Issue' ? 'red' : 'green'}-800`}>
                  {risk.status}
                </span>
                <span className="text-sm text-gray-500">Risk Score: {risk.riskScore}</span>
              </div>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <XCircle className="w-6 h-6" />
            </button>
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* Main Content */}
            <div className="flex-1 p-6 overflow-y-auto">
              {/* Risk Details */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Risk Details</h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Description</label>
                      <p className="text-gray-900">{risk.description}</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Owner</label>
                        <p className="text-gray-900 flex items-center"><User className="w-4 h-4 mr-1" />{risk.owner}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Assignee</label>
                        <p className="text-gray-900 flex items-center"><Users className="w-4 h-4 mr-1" />{risk.assignee}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Due Date</label>
                        <p className="text-gray-900 flex items-center"><Calendar className="w-4 h-4 mr-1" />{formatDateTime(risk.dueDate).split(',')[0]}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Estimated Cost</label>
                        <p className="text-gray-900 flex items-center"><DollarSign className="w-4 h-4 mr-1" />{risk.estimatedCost}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Probability</label>
                        <p className="text-gray-900">{risk.probability} ({risk.likelihood}%)</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Impact</label>
                        <p className="text-gray-900">{risk.impact} ({risk.businessImpact}%)</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Category</label>
                        <p className="text-gray-900">{risk.category}</p>
                      </div>
                    </div>
                    {risk.mitigation && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Mitigation Strategy</label>
                        <p className="text-gray-900">{risk.mitigation}</p>
                      </div>
                    )}
                    {risk.tags && risk.tags.length > 0 && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Tags</label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {risk.tags.map(tag => (
                            <span key={tag} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Comments Section */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Comments & Notes</h3>
                  <div className="space-y-4">
                    {/* Add Comment */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <UserCircle className="w-8 h-8 text-gray-400 mt-1" />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <select
                              value={commentType}
                              onChange={(e) => setCommentType(e.target.value)}
                              className="text-xs border border-gray-300 rounded px-2 py-1"
                            >
                              <option value="comment">Comment</option>
                              <option value="escalation">Escalation</option>
                              <option value="resolution">Resolution</option>
                            </select>
                          </div>
                          <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Add a comment or note..."
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <div className="flex justify-end mt-2">
                            <button
                              onClick={() => handleAddComment(risk.id)}
                              disabled={!newComment.trim()}
                              className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Send className="w-4 h-4 mr-1" />
                              Add Comment
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Existing Comments */}
                    {risk.comments && risk.comments.length > 0 && (
                      <div className="space-y-3">
                        {risk.comments.map((comment) => (
                          <div
                            key={comment.id}
                            className={`border-l-4 p-4 rounded-r-lg ${getCommentTypeColor(comment.type)}`}
                          >
                            <div className="flex items-start space-x-3">
                              {getCommentTypeIcon(comment.type)}
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className="font-medium text-gray-900">{comment.user}</span>
                                  <span className="text-xs text-gray-500">{comment.userRole}</span>
                                  <span className="text-xs text-gray-500">•</span>
                                  <span className="text-xs text-gray-500">{formatDateTime(comment.timestamp)}</span>
                                </div>
                                <p className="text-gray-700">{comment.content}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Audit Trail Sidebar */}
            <div className="w-80 border-l bg-gray-50 overflow-y-auto">
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <History className="w-5 h-5 mr-2" />
                  Audit Trail
                </h3>
                <div className="space-y-3">
                  {risk.auditTrail && risk.auditTrail.map((entry) => (
                    <div key={entry.id} className="bg-white p-3 rounded-lg border border-gray-200">
                      <div className="flex items-start space-x-2">
                        <Activity className="w-4 h-4 text-blue-500 mt-0.5" />
                        <div className="flex-1">
                          <div className="flex items-center space-x-1 mb-1">
                            <span className="text-sm font-medium text-gray-900">{entry.user}</span>
                            <span className="text-xs text-gray-500">({entry.userRole})</span>
                          </div>
                          <p className="text-sm text-gray-700 mb-1">{entry.action}</p>
                          {entry.details && (
                            <p className="text-xs text-gray-600">{entry.details}</p>
                          )}
                          {entry.changes && Object.keys(entry.changes).length > 0 && (
                            <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                              <span className="font-medium">Changes:</span>
                              {Object.entries(entry.changes).map(([key, value]) => (
                                <div key={key} className="text-gray-600">
                                  {key}: {value}
                                </div>
                              ))}
                            </div>
                          )}
                          <span className="text-xs text-gray-500 mt-1 block">
                            {formatDateTime(entry.date)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-4 border-t bg-gray-50">
            <div className="text-sm text-gray-600">
              Created: {formatDateTime(risk.createdDate)} | Last Updated: {formatDateTime(risk.lastUpdated)}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  dispatch({ type: 'SET_SELECTED_RISK', payload: risk });
                  setShowDetailsModal(false);
                  setShowEditModal(true);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Edit Risk
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Main render
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Risk Management</h1>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Risk
          </button>
          <button className="flex items-center px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
          <button className="flex items-center px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Metrics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {renderStatCard('Total Risks', riskMetrics.total, `${riskMetrics.open} open`, <AlertTriangle className="w-6 h-6" />)}
        {renderStatCard('Critical/High', riskMetrics.critical + riskMetrics.high, `${riskMetrics.critical} critical`, <Shield className="w-6 h-6" />, 'red')}
        {renderStatCard('In Progress', riskMetrics.inProgress, 'Active mitigation', <Activity className="w-6 h-6" />, 'yellow')}
        {renderStatCard('Overdue', riskMetrics.overdue, 'Needs attention', <Clock className="w-6 h-6" />, 'red')}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={state.filters.search}
                onChange={(e) => dispatch({ type: 'SET_FILTER', key: 'search', value: e.target.value })}
                placeholder="Search risks..."
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={state.filters.status}
              onChange={(e) => dispatch({ type: 'SET_FILTER', key: 'status', value: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Status</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Issue">Issue</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
            <select
              value={state.filters.severity}
              onChange={(e) => dispatch({ type: 'SET_FILTER', key: 'severity', value: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Severity</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={state.filters.category}
              onChange={(e) => dispatch({ type: 'SET_FILTER', key: 'category', value: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Categories</option>
              <option value="Cybersecurity">Cybersecurity</option>
              <option value="Operational">Operational</option>
              <option value="Financial">Financial</option>
              <option value="Regulatory">Regulatory</option>
              <option value="Supply Chain">Supply Chain</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Owner</label>
            <select
              value={state.filters.owner}
              onChange={(e) => dispatch({ type: 'SET_FILTER', key: 'owner', value: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Owners</option>
              <option value="John Smith">John Smith</option>
              <option value="Sarah Johnson">Sarah Johnson</option>
              <option value="Mike Wilson">Mike Wilson</option>
            </select>
          </div>

          <div>
            <button
              onClick={() => {
                dispatch({ type: 'SET_FILTER', key: 'search', value: '' });
                dispatch({ type: 'SET_FILTER', key: 'status', value: 'All' });
                dispatch({ type: 'SET_FILTER', key: 'severity', value: 'All' });
                dispatch({ type: 'SET_FILTER', key: 'category', value: 'All' });
                dispatch({ type: 'SET_FILTER', key: 'owner', value: 'All' });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Risk List */}
      <div className="space-y-4">
        {filteredRisks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No risks found matching your criteria.</p>
          </div>
        ) : (
          filteredRisks.map(renderRiskCard)
        )}
      </div>

      {/* Available Threats for Risk Creation */}
      {threats && threats.length > 0 && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Create Risks from Threats</h3>
          <div className="space-y-3">
            {threats.slice(0, 3).map(threat => (
              <div key={threat.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">{threat.title}</h4>
                  <p className="text-sm text-gray-600">{threat.description}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`px-2 py-1 text-xs rounded-full bg-${threat.severity === 'Critical' ? 'red' : threat.severity === 'High' ? 'orange' : 'yellow'}-100 text-${threat.severity === 'Critical' ? 'red' : threat.severity === 'High' ? 'orange' : 'yellow'}-800`}>
                      {threat.severity}
                    </span>
                    <span className="text-xs text-gray-500">Likelihood: {threat.likelihood}%</span>
                  </div>
                </div>
                <button
                  onClick={() => handleCreateFromThreat(threat)}
                  className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                >
                  <ArrowRight className="w-4 h-4 mr-1" />
                  Create Risk
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <RiskForm
          onSubmit={handleCreateRisk}
          onCancel={() => setShowCreateModal(false)}
          isEdit={false}
        />
      )}

      {showEditModal && state.selectedRisk && (
        <RiskForm
          initialData={state.selectedRisk}
          onSubmit={handleUpdateRisk}
          onCancel={() => setShowEditModal(false)}
          isEdit={true}
        />
      )}

      {showDetailsModal && state.selectedRisk && (
        <RiskDetailsModal
          risk={state.selectedRisk}
          onClose={() => setShowDetailsModal(false)}
        />
      )}
    </div>
  );
};

export default RiskManagement;