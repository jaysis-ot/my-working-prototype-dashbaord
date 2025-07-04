import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, 
  Cell, LineChart, Line, Area, AreaChart, RadialBarChart, RadialBar, ScatterChart, Scatter } from 'recharts';
import { Upload, Filter, Search, Download, AlertTriangle, CheckCircle, Clock, FileText, Shield, Zap, 
  TrendingUp, Users, Database, Settings, Bell, Eye, ArrowRight, ChevronDown, ChevronUp, 
  Calendar, Target, Activity, Layers, Network, Lock, AlertCircle, Info, X, Plus, Edit, Save, 
  ChevronLeft, ChevronRight, BarChart3, BarChart2, TrendingDown, Maximize2, Minimize2, Star,
  HelpCircle, Lightbulb, GitBranch, MessageSquare, DollarSign, Timer, Gauge, Building2, Workflow } from 
  'lucide-react';

const RequirementsDashboard = () => {
  const [requirements, setRequirements] = useState([]);
  const [filters, setFilters] = useState({
    area: '',
    type: '',
    category: '',
    cafPrinciple: '',
    status: '',
    maturityLevel: '',
    applicability: '',
    implementationPhase: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProject, setSelectedProject] = useState('Network Segmentation');
  const [viewMode, setViewMode] = useState('overview');
  const [selectedRequirement, setSelectedRequirement] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [activeCard, setActiveCard] = useState(null);
  const [chartFullscreen, setChartFullscreen] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});
  const [activeFilters, setActiveFilters] = useState(false);
  const [showJustificationView, setShowJustificationView] = useState(false);

  // Initialize enhanced mock data with maturity and justification
  useEffect(() => {
    const mockRequirements = generateEnhancedMockRequirements();
    setRequirements(mockRequirements);
    setNotifications([
      { id: 1, type: 'warning', message: '3 requirements lack business justification', timestamp: new Date() },
      { id: 2, type: 'success', message: '5 requirements completed this week', timestamp: new Date() },
      { id: 3, type: 'info', message: 'Phase 2 implementation review due', timestamp: new Date() },
      { id: 4, type: 'warning', message: '2 high-value requirements at risk', timestamp: new Date() }
    ]);
  }, []);

  function generateEnhancedMockRequirements() {
    const areas = ['Business', 'User', 'System', 'Infrastructure'];
    const types = ['Functional', 'Non-Functional'];
    const categories = [
      'Network Architecture & Design', 'Secure Data Flow', 'Access Control & Authentication',
      'Monitoring & Detection', 'Device & Firmware Management', 'Remote Access',
      'Incident Response', 'Integration Capabilities', 'Backup & Recovery', 'Compliance Management'
    ];
    const cafPrinciples = [
      'A1: Governance', 'A2: Risk management', 'A3: Asset management', 'A4: Supply chain',
      'B1: Service protection', 'B2: Identity and access', 'B3: Data security', 'B4: System security',
      'C1: Security monitoring', 'C2: Proactive discovery', 'D1: Response planning', 'D2: Lessons learned'
    ];

    const maturityLevels = [
      { level: 'Initial', score: 1, description: 'Ad-hoc, no formal process' },
      { level: 'Developing', score: 2, description: 'Some processes defined' },
      { level: 'Defined', score: 3, description: 'Documented and standardized' },
      { level: 'Managed', score: 4, description: 'Measured and controlled' },
      { level: 'Optimizing', score: 5, description: 'Continuously improving' }
    ];

    const applicabilityTypes = [
      { type: 'Essential', description: 'Critical for operations', weight: 1.0 },
      { type: 'Applicable', description: 'Relevant and beneficial', weight: 0.8 },
      { type: 'Future', description: 'Planned for future phases', weight: 0.6 },
      { type: 'Conditional', description: 'Depends on other factors', weight: 0.4 },
      { type: 'Not Applicable', description: 'Not relevant to current scope', weight: 0.0 }
    ];

    const implementationPhases = ['Phase 1 (0-6 months)', 'Phase 2 (6-12 months)', 'Phase 3 (12-24 months)', 'Future (24+ months)', 'Deferred'];

    const businessImpacts = [
      'Regulatory Compliance', 'Operational Resilience', 'Cost Reduction', 'Risk Mitigation',
      'Efficiency Improvement', 'Security Enhancement', 'Customer Service', 'Innovation Enablement'
    ];

    const consequenceTypes = [
      { type: 'Security', examples: ['Data breach risk', 'Unauthorized access', 'System compromise'] },
      { type: 'Operational', examples: ['Service disruption', 'Manual processes', 'Delayed response'] },
      { type: 'Compliance', examples: ['Regulatory penalties', 'Audit findings', 'License risk'] },
      { type: 'Financial', examples: ['Increased costs', 'Revenue loss', 'Efficiency reduction'] },
      { type: 'Reputational', examples: ['Customer impact', 'Brand damage', 'Stakeholder confidence'] }
    ];

    const mockData = [];
    for (let i = 1; i <= 75; i++) {
      const area = areas[Math.floor(Math.random() * areas.length)];
      const type = types[Math.floor(Math.random() * types.length)];
      const category = categories[Math.floor(Math.random() * categories.length)];
      const cafPrinciple = cafPrinciples[Math.floor(Math.random() * cafPrinciples.length)];
      const maturityLevel = maturityLevels[Math.floor(Math.random() * maturityLevels.length)];
      const applicability = applicabilityTypes[Math.floor(Math.random() * applicabilityTypes.length)];
      const phase = implementationPhases[Math.floor(Math.random() * implementationPhases.length)];
      const businessImpact = businessImpacts[Math.floor(Math.random() * businessImpacts.length)];
      const consequenceType = consequenceTypes[Math.floor(Math.random() * consequenceTypes.length)];
      
      const statuses = ['Not Started', 'In Progress', 'Completed', 'On Hold', 'Under Review'];
      const priorities = ['Low', 'Medium', 'High', 'Critical'];
      const risks = ['Low', 'Medium', 'High'];
      
      // Calculate business value score based on multiple factors
      const businessValueScore = (
        (maturityLevel.score * 0.3) +
        (applicability.weight * 5 * 0.4) +
        (priorities.indexOf(priorities[Math.floor(Math.random() * priorities.length)]) + 1) * 0.3
      ).toFixed(1);

      mockData.push({
        id: `${area.substring(0, 2).toUpperCase()}-${type.substring(0, 1)}${i.toString().padStart(3, '0')}`,
        area,
        type,
        category,
        description: `${category} requirement for ${area.toLowerCase()} stakeholders focusing on ${type.toLowerCase()} aspects. This requirement ensures proper implementation of security controls and operational procedures.`,
        cafPrinciple,
        nisReference: `NIS Regulation 10(2)(${String.fromCharCode(97 + (i % 3))}) - Security requirement`,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        priority: priorities[Math.floor(Math.random() * priorities.length)],
        assignee: ['Security Team', 'Network Team', 'Identity Team', 'Operations Team', 'Compliance Team'][Math.floor(Math.random() * 5)],
        dueDate: new Date(2025, 5 + Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
        progress: Math.floor(Math.random() * 101),
        riskLevel: risks[Math.floor(Math.random() * risks.length)],
        lastUpdated: new Date(2025, 4, Math.floor(Math.random() * 30) + 1).toISOString().split('T')[0],
        estimatedHours: Math.floor(Math.random() * 100) + 20,
        actualHours: Math.floor(Math.random() * 80) + 10,
        comments: Math.floor(Math.random() * 10),
        attachments: Math.floor(Math.random() * 5),
        dependencies: Math.floor(Math.random() * 3),
        
        // Enhanced fields for maturity and justification
        maturityLevel: maturityLevel,
        applicability: applicability,
        implementationPhase: phase,
        businessImpact: businessImpact,
        businessValueScore: parseFloat(businessValueScore),
        costEstimate: Math.floor(Math.random() * 500000) + 50000,
        roiProjection: (Math.random() * 300 + 50).toFixed(0),
        
        // Justification framework
        businessJustification: `This ${category.toLowerCase()} capability directly supports ${businessImpact.toLowerCase()} objectives by providing critical ${type.toLowerCase()} capabilities for ${area.toLowerCase()} stakeholders.`,
        
        // Consequences of not implementing
        consequences: {
          type: consequenceType.type,
          immediate: consequenceType.examples[0],
          longTerm: consequenceType.examples[Math.floor(Math.random() * consequenceType.examples.length)],
          likelihood: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
          impact: ['Minor', 'Moderate', 'Significant', 'Severe'][Math.floor(Math.random() * 4)]
        },
        
        // Golden thread connections
        goldenThread: {
          strategicObjective: ['Operational Excellence', 'Security Resilience', 'Digital Transformation', 'Regulatory Compliance'][Math.floor(Math.random() * 4)],
          businessDriver: ['Cost Efficiency', 'Risk Reduction', 'Innovation', 'Compliance'][Math.floor(Math.random() * 4)],
          successMetrics: [`${Math.floor(Math.random() * 50) + 10}% improvement in response time`, `£${Math.floor(Math.random() * 100000) + 10000} annual savings`, `${Math.floor(Math.random() * 30) + 5}% risk reduction`]
        },
        
        // Stakeholder analysis
        stakeholders: {
          champion: ['CISO', 'CTO', 'Operations Manager', 'Compliance Officer'][Math.floor(Math.random() * 4)],
          impacted: ['Operations Team', 'Security Team', 'Business Users', 'External Partners'][Math.floor(Math.random() * 4)],
          resistance: Math.random() > 0.7 ? 'High' : Math.random() > 0.4 ? 'Medium' : 'Low'
        }
      });
    }
    return mockData;
  }

  // Enhanced filtering
  const filteredRequirements = useMemo(() => {
    return requirements.filter(req => {
      const matchesSearch = req.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.businessJustification.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilters = 
        (!filters.area || req.area === filters.area) &&
        (!filters.type || req.type === filters.type) &&
        (!filters.category || req.category === filters.category) &&
        (!filters.cafPrinciple || req.cafPrinciple === filters.cafPrinciple) &&
        (!filters.status || req.status === filters.status) &&
        (!filters.maturityLevel || req.maturityLevel.level === filters.maturityLevel) &&
        (!filters.applicability || req.applicability.type === filters.applicability) &&
        (!filters.implementationPhase || req.implementationPhase === filters.implementationPhase);
      
      return matchesSearch && matchesFilters;
    });
  }, [requirements, filters, searchTerm]);

  // Enhanced analytics data
  const analyticsData = useMemo(() => {
    const statusCounts = requirements.reduce((acc, req) => {
      acc[req.status] = (acc[req.status] || 0) + 1;
      return acc;
    }, {});

    const maturityCounts = requirements.reduce((acc, req) => {
      acc[req.maturityLevel.level] = (acc[req.maturityLevel.level] || 0) + 1;
      return acc;
    }, {});

    const applicabilityCounts = requirements.reduce((acc, req) => {
      acc[req.applicability.type] = (acc[req.applicability.type] || 0) + 1;
      return acc;
    }, {});

    const phaseCounts = requirements.reduce((acc, req) => {
      acc[req.implementationPhase] = (acc[req.implementationPhase] || 0) + 1;
      return acc;
    }, {});

    const businessValueData = requirements.map(req => ({
      id: req.id,
      businessValue: req.businessValueScore,
      cost: req.costEstimate / 1000, // Convert to thousands
      roi: parseFloat(req.roiProjection),
      maturity: req.maturityLevel.score,
      applicability: req.applicability.type
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
      applicabilityData: Object.entries(applicabilityCounts).map(([type, count]) => ({ 
        type, 
        count, 
        percentage: (count / requirements.length * 100).toFixed(1) 
      })),
      phaseData: Object.entries(phaseCounts).map(([phase, count]) => ({ 
        phase, 
        count, 
        percentage: (count / requirements.length * 100).toFixed(1) 
      })),
      businessValueData
    };
  }, [requirements]);

  const COLORS = {
    'Not Started': '#ef4444',
    'In Progress': '#f59e0b',
    'Completed': '#10b981',
    'On Hold': '#6b7280',
    'Under Review': '#8b5cf6',
    'Initial': '#ef4444',
    'Developing': '#f59e0b',
    'Defined': '#3b82f6',
    'Managed': '#10b981',
    'Optimizing': '#8b5cf6',
    'Essential': '#10b981',
    'Applicable': '#3b82f6',
    'Future': '#f59e0b',
    'Conditional': '#f97316',
    'Not Applicable': '#6b7280'
  };

  // Enhanced Interactive Components
  const MaturityIndicator = ({ level, score }) => (
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
  );

  const BusinessValueCard = ({ requirement }) => {
    const valueColor = requirement.businessValueScore >= 4 ? 'green' : 
                     requirement.businessValueScore >= 3 ? 'blue' : 
                     requirement.businessValueScore >= 2 ? 'yellow' : 'red';
    
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h4 className="font-medium text-gray-900 mb-1">{requirement.id}</h4>
            <p className="text-sm text-gray-600 line-clamp-2">{requirement.businessJustification}</p>
          </div>
          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
            valueColor === 'green' ? 'bg-green-100 text-green-800' :
            valueColor === 'blue' ? 'bg-blue-100 text-blue-800' :
            valueColor === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            <Star className="h-3 w-3" />
            {requirement.businessValueScore}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-gray-500">ROI:</span>
            <span className="ml-1 font-medium">{requirement.roiProjection}%</span>
          </div>
          <div>
            <span className="text-gray-500">Phase:</span>
            <span className="ml-1 font-medium">{requirement.implementationPhase.split(' ')[0]}</span>
          </div>
        </div>
      </div>
    );
  };

  const ConsequenceAnalysis = ({ consequences }) => (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <div className="flex items-center mb-3">
        <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
        <h4 className="font-medium text-red-900">Impact of Non-Implementation</h4>
      </div>
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-red-800">Immediate Risk:</span>
            <p className="text-red-700 mt-1">{consequences.immediate}</p>
          </div>
          <div>
            <span className="font-medium text-red-800">Long-term Impact:</span>
            <p className="text-red-700 mt-1">{consequences.longTerm}</p>
          </div>
        </div>
        <div className="flex justify-between pt-2 border-t border-red-200">
          <span className="text-sm">
            <span className="font-medium text-red-800">Likelihood:</span>
            <span className="ml-1 text-red-700">{consequences.likelihood}</span>
          </span>
          <span className="text-sm">
            <span className="font-medium text-red-800">Impact:</span>
            <span className="ml-1 text-red-700">{consequences.impact}</span>
          </span>
        </div>
      </div>
    </div>
  );

  const GoldenThreadView = ({ requirement }) => (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-center mb-3">
        <GitBranch className="h-5 w-5 text-blue-600 mr-2" />
        <h4 className="font-medium text-blue-900">Strategic Golden Thread</h4>
      </div>
      <div className="space-y-3">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <span className="text-sm font-medium text-blue-800">Strategic Objective:</span>
            <p className="text-blue-700">{requirement.goldenThread.strategicObjective}</p>
          </div>
          <ArrowRight className="h-4 w-4 text-blue-500" />
          <div className="flex-1">
            <span className="text-sm font-medium text-blue-800">Business Driver:</span>
            <p className="text-blue-700">{requirement.goldenThread.businessDriver}</p>
          </div>
        </div>
        <div className="pt-2 border-t border-blue-200">
          <span className="text-sm font-medium text-blue-800">Success Metrics:</span>
          <ul className="mt-1 space-y-1">
            {requirement.goldenThread.successMetrics.map((metric, index) => (
              <li key={index} className="text-sm text-blue-700 flex items-center">
                <Target className="h-3 w-3 mr-2" />
                {metric}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );

  const AnimatedStatCard = ({ title, value, icon: Icon, color = "blue", trend = null, subtitle, onClick, isActive }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
      <div 
        className={`relative bg-white rounded-xl shadow-md p-6 border-l-4 cursor-pointer transition-all duration-300 transform ${
          isActive ? 'scale-105 shadow-lg' : isHovered ? 'scale-102 shadow-lg' : 'hover:shadow-lg'
        }`}
        style={{ borderLeftColor: color }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={onClick}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className={`text-3xl font-bold text-gray-900 transition-all duration-300 ${isHovered ? 'text-4xl' : ''}`}>
              {value}
            </p>
            {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
            {trend && (
              <div className={`flex items-center mt-2 text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                <TrendingUp className="h-4 w-4 mr-1" />
                {trend > 0 ? '+' : ''}{trend}% from last month
              </div>
            )}
          </div>
          <div className={`transition-all duration-300 ${isHovered ? 'scale-110 rotate-12' : ''}`}>
            <Icon className="h-10 w-10" style={{ color }} />
          </div>
        </div>
        
        <div className={`absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white to-transparent opacity-0 ${
          isHovered ? 'animate-pulse opacity-10' : ''
        }`} />
      </div>
    );
  };

  const InteractiveChart = ({ title, children, fullscreenId, actions = [] }) => {
    const isFullscreen = chartFullscreen === fullscreenId;

    return (
      <div className={`bg-white rounded-xl shadow-md transition-all duration-300 ${
        isFullscreen ? 'fixed inset-4 z-50' : 'relative'
      }`}>
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
            {title}
          </h3>
          <div className="flex space-x-2">
            {actions.map((action, index) => (
              <button key={index} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <action.icon className="h-4 w-4 text-gray-600" />
              </button>
            ))}
            <button 
              onClick={() => setChartFullscreen(isFullscreen ? null : fullscreenId)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <div className={`p-6 ${isFullscreen ? 'h-full' : ''}`}>
          {children}
        </div>
      </div>
    );
  };

  const EnhancedRequirementModal = ({ requirement, onClose }) => {
    if (!requirement) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{requirement.id}</h2>
              <p className="text-gray-600">{requirement.category}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Maturity and Business Value Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-3">Maturity Assessment</h4>
                <MaturityIndicator level={requirement.maturityLevel.level} score={requirement.maturityLevel.score} />
                <p className="text-2xl font-bold text-gray-900">
                  £{requirement.costEstimate.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">Estimated implementation cost</p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  ROI Projection
                </h4>
                <p className="text-2xl font-bold text-gray-900">
                  {requirement.roiProjection}%
                </p>
                <p className="text-sm text-gray-600">Expected return on investment</p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                  <Timer className="h-4 w-4 mr-2" />
                  Time to Value
                </h4>
                <p className="text-2xl font-bold text-gray-900">
                  {requirement.implementationPhase.split(' ')[0]}
                </p>
                <p className="text-sm text-gray-600">Expected delivery phase</p>
              </div>
            </div>

            {/* Stakeholder Analysis */}
            <div className="bg-yellow-50 rounded-lg p-4">
              <h4 className="font-medium text-yellow-900 mb-3 flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Stakeholder Analysis
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <span className="text-sm font-medium text-yellow-900">Champion:</span>
                  <p className="text-yellow-800">{requirement.stakeholders.champion}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-yellow-900">Key Impacted:</span>
                  <p className="text-yellow-800">{requirement.stakeholders.impacted}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-yellow-900">Resistance Level:</span>
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                    requirement.stakeholders.resistance === 'High' ? 'bg-red-100 text-red-800' :
                    requirement.stakeholders.resistance === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {requirement.stakeholders.resistance}
                  </span>
                </div>
              </div>
            </div>

            {/* Traditional Requirement Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Status</h4>
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                  requirement.status === 'Completed' ? 'bg-green-100 text-green-800' :
                  requirement.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                  requirement.status === 'On Hold' ? 'bg-gray-100 text-gray-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {requirement.status}
                </span>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Progress</h4>
                <div className="flex items-center">
                  <div className="flex-1 bg-gray-200 rounded-full h-3 mr-3">
                    <div 
                      className="bg-blue-600 h-3 rounded-full transition-all duration-500" 
                      style={{ width: `${requirement.progress}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">{requirement.progress}%</span>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Priority</h4>
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                  requirement.priority === 'Critical' ? 'bg-red-100 text-red-800' :
                  requirement.priority === 'High' ? 'bg-orange-100 text-orange-800' :
                  requirement.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {requirement.priority}
                </span>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Description</h4>
              <p className="text-gray-700 leading-relaxed">{requirement.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2 flex items-center">
                  <Shield className="h-4 w-4 mr-2" />
                  CAF Principle
                </h4>
                <p className="text-blue-800">{requirement.cafPrinciple}</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <h4 className="font-medium text-purple-900 mb-2 flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  NIS Reference
                </h4>
                <p className="text-purple-800 text-sm">{requirement.nisReference}</p>
              </div>
            </div>

            <div className="flex space-x-3 pt-4 border-t border-gray-200">
              <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Edit className="h-4 w-4 mr-2" />
                Edit Requirement
              </button>
              <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                <Star className="h-4 w-4 mr-2" />
                Update Business Value
              </button>
              <button className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                <FileText className="h-4 w-4 mr-2" />
                View History
              </button>
              <button className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                <Bell className="h-4 w-4 mr-2" />
                Set Reminder
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const Sidebar = () => (
    <div className={`bg-gray-900 text-white transition-all duration-300 ${sidebarExpanded ? 'w-64' : 'w-16'} flex flex-col`}>
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          {sidebarExpanded && <h2 className="text-lg font-semibold">OT Dashboard</h2>}
          <button
            onClick={() => setSidebarExpanded(!sidebarExpanded)}
            className="p-2 hover:bg-gray-800 rounded"
          >
            {sidebarExpanded ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {[
            { id: 'overview', name: 'Overview', icon: TrendingUp },
            { id: 'requirements', name: 'Requirements', icon: FileText },
            { id: 'maturity', name: 'Maturity Analysis', icon: Gauge },
            { id: 'justification', name: 'Business Value', icon: Star },
            { id: 'compliance', name: 'CAF Compliance', icon: Shield },
            { id: 'consequences', name: 'Risk Analysis', icon: AlertTriangle },
            { id: 'analytics', name: 'Analytics', icon: BarChart3 }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setViewMode(item.id)}
              className={`w-full flex items-center px-3 py-2 rounded-lg transition-colors ${
                viewMode === item.id
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <item.icon className="h-5 w-5" />
              {sidebarExpanded && <span className="ml-3">{item.name}</span>}
            </button>
          ))}
        </div>
      </nav>
      
      {sidebarExpanded && notifications.length > 0 && (
        <div className="p-4 border-t border-gray-700">
          <h3 className="text-sm font-medium text-gray-300 mb-2">Recent Alerts</h3>
          <div className="space-y-2">
            {notifications.slice(0, 3).map((notification) => (
              <div key={notification.id} className="bg-gray-800 p-2 rounded text-xs">
                <div className={`flex items-center ${
                  notification.type === 'warning' ? 'text-yellow-400' :
                  notification.type === 'success' ? 'text-green-400' : 'text-blue-400'
                }`}>
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {notification.message}
                </div>
              </div>
            ))}
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
              Project: {selectedProject}
              <span className="mx-2">•</span>
              <Activity className="h-4 w-4 mr-1" />
              {filteredRequirements.length} of {requirements.length} requirements
              <span className="mx-2">•</span>
              <Star className="h-4 w-4 mr-1" />
              Avg Business Value: {(requirements.reduce((sum, req) => sum + req.businessValueScore, 0) / requirements.length || 0).toFixed(1)}
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Bell className="h-6 w-6 text-gray-400 cursor-pointer hover:text-gray-600" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </div>
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
              <Upload className="h-4 w-4 mr-2" />
              Upload Requirements
            </button>
            <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <Header />
        
        <main className="flex-1 p-6 overflow-y-auto">
          {/* Enhanced Regulatory Context */}
          <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-xl p-6 mb-6 border border-blue-200 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-full -mr-16 -mt-16 opacity-50" />
            <div className="relative">
              <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Regulatory Compliance & Business Context
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white/70 backdrop-blur rounded-lg p-4 border border-blue-100">
                  <div className="flex items-center mb-3">
                    <Network className="h-5 w-5 text-blue-600 mr-2" />
                    <h4 className="font-medium text-gray-900">Ofgem Framework</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Aligns with Ofgem strategic network investment framework, supporting clean power transition by 2030.
                  </p>
                </div>
                <div className="bg-white/70 backdrop-blur rounded-lg p-4 border border-blue-100">
                  <div className="flex items-center mb-3">
                    <Lock className="h-5 w-5 text-purple-600 mr-2" />
                    <h4 className="font-medium text-gray-900">NCSC CAF Guidance</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Requirements mapped to NCSC Cyber Assessment Framework for OES compliance.
                  </p>
                </div>
                <div className="bg-white/70 backdrop-blur rounded-lg p-4 border border-blue-100">
                  <div className="flex items-center mb-3">
                    <Building2 className="h-5 w-5 text-green-600 mr-2" />
                    <h4 className="font-medium text-gray-900">Business Justification</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Each requirement includes maturity assessment, business value analysis, and impact justification.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Overview View */}
          {viewMode === 'overview' && (
            <div className="space-y-6">
              {/* Enhanced Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <AnimatedStatCard
                  title="Total Requirements"
                  value={requirements.length}
                  subtitle={`${filteredRequirements.length} visible`}
                  icon={FileText}
                  color="#3b82f6"
                  trend={12}
                  onClick={() => setViewMode('requirements')}
                  isActive={activeCard === 'total'}
                />
                <AnimatedStatCard
                  title="High Business Value"
                  value={requirements.filter(r => r.businessValueScore >= 4).length}
                  subtitle="Value Score ≥ 4.0"
                  icon={Star}
                  color="#10b981"
                  trend={8}
                  onClick={() => setViewMode('justification')}
                  isActive={activeCard === 'value'}
                />
                <AnimatedStatCard
                  title="Maturity Level"
                  value={(requirements.reduce((sum, r) => sum + r.maturityLevel.score, 0) / requirements.length || 0).toFixed(1)}
                  subtitle="Average Score"
                  icon={Gauge}
                  color="#8b5cf6"
                  trend={15}
                  onClick={() => setViewMode('maturity')}
                  isActive={activeCard === 'maturity'}
                />
                <AnimatedStatCard
                  title="Essential/Applicable"
                  value={requirements.filter(r => ['Essential', 'Applicable'].includes(r.applicability.type)).length}
                  subtitle="Current relevance"
                  icon={Target}
                  color="#f59e0b"
                  trend={-5}
                  onClick={() => setViewMode('requirements')}
                  isActive={activeCard === 'applicable'}
                />
                <AnimatedStatCard
                  title="High Consequence Risk"
                  value={requirements.filter(r => r.consequences.impact === 'Severe' || r.consequences.impact === 'Significant').length}
                  subtitle="Severe/Significant impact"
                  icon={AlertTriangle}
                  color="#ef4444"
                  trend={-10}
                  onClick={() => setViewMode('consequences')}
                  isActive={activeCard === 'risk'}
                />
              </div>

              {/* Business Value vs Cost Analysis */}
              <InteractiveChart 
                title="Business Value vs Implementation Cost Analysis" 
                fullscreenId="value-cost-chart"
                actions={[
                  { icon: BarChart2, onClick: () => {} },
                  { icon: Download, onClick: () => {} }
                ]}
              >
                <ResponsiveContainer width="100%" height={400}>
                  <ScatterChart data={analyticsData.businessValueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="cost" 
                      name="Cost (£k)" 
                      label={{ value: 'Implementation Cost (£k)', position: 'insideBottom', offset: -10 }}
                    />
                    <YAxis 
                      dataKey="businessValue" 
                      name="Business Value" 
                      label={{ value: 'Business Value Score', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip 
                      cursor={{ strokeDasharray: '3 3' }}
                      formatter={(value, name) => [
                        name === 'cost' ? `£${value}k` : value,
                        name === 'cost' ? 'Cost' : 'Business Value'
                      ]}
                      labelFormatter={(label, payload) => 
                        payload && payload[0] ? `Requirement: ${payload[0].payload.id}` : ''
                      }
                    />
                    <Scatter dataKey="businessValue" fill="#3b82f6" />
                  </ScatterChart>
                </ResponsiveContainer>
              </InteractiveChart>

              {/* Enhanced Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <InteractiveChart 
                  title="Maturity Level Distribution" 
                  fullscreenId="maturity-chart"
                  actions={[
                    { icon: BarChart2, onClick: () => {} },
                    { icon: Download, onClick: () => {} }
                  ]}
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
                
                <InteractiveChart 
                  title="Applicability Assessment" 
                  fullscreenId="applicability-chart"
                  actions={[
                    { icon: BarChart3, onClick: () => {} },
                    { icon: Download, onClick: () => {} }
                  ]}
                >
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={analyticsData.applicabilityData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ type, percentage }) => `${type}: ${percentage}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {analyticsData.applicabilityData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[entry.type]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </InteractiveChart>
              </div>
            </div>
          )}

          {/* Business Justification View */}
          {viewMode === 'justification' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">Business Value Analysis</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {requirements
                    .sort((a, b) => b.businessValueScore - a.businessValueScore)
                    .slice(0, 12)
                    .map((requirement) => (
                      <BusinessValueCard 
                        key={requirement.id} 
                        requirement={requirement}
                      />
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* Requirements View with Enhanced Filtering */}
          {viewMode === 'requirements' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Filter & Search Requirements</h3>
                  <button 
                    onClick={() => setActiveFilters(!activeFilters)}
                    className="flex items-center text-blue-600 hover:text-blue-800"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    {activeFilters ? 'Hide Filters' : 'Show Filters'}
                  </button>
                </div>
                <div className="flex flex-wrap gap-4 items-center mb-4">
                  <div className="flex-1 min-w-64">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search requirements, justifications..."
                        className="pl-10 w-full border border-gray-300 rounded-lg py-2 px-3"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  {/* Enhanced Filter dropdowns */}
                  {activeFilters && (
                    <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-4 w-full">
                      <select
                        value={filters.area}
                        onChange={(e) => setFilters({...filters, area: e.target.value})}
                        className="border border-gray-300 rounded-lg py-2 px-3"
                      >
                        <option value="">All Areas</option>
                        <option value="Business">Business</option>
                        <option value="User">User</option>
                        <option value="System">System</option>
                        <option value="Infrastructure">Infrastructure</option>
                      </select>
                      
                      <select
                        value={filters.maturityLevel}
                        onChange={(e) => setFilters({...filters, maturityLevel: e.target.value})}
                        className="border border-gray-300 rounded-lg py-2 px-3"
                      >
                        <option value="">All Maturity</option>
                        <option value="Initial">Initial</option>
                        <option value="Developing">Developing</option>
                        <option value="Defined">Defined</option>
                        <option value="Managed">Managed</option>
                        <option value="Optimizing">Optimizing</option>
                      </select>

                      <select
                        value={filters.applicability}
                        onChange={(e) => setFilters({...filters, applicability: e.target.value})}
                        className="border border-gray-300 rounded-lg py-2 px-3"
                      >
                        <option value="">All Applicability</option>
                        <option value="Essential">Essential</option>
                        <option value="Applicable">Applicable</option>
                        <option value="Future">Future</option>
                        <option value="Conditional">Conditional</option>
                        <option value="Not Applicable">Not Applicable</option>
                      </select>

                      <select
                        value={filters.implementationPhase}
                        onChange={(e) => setFilters({...filters, implementationPhase: e.target.value})}
                        className="border border-gray-300 rounded-lg py-2 px-3"
                      >
                        <option value="">All Phases</option>
                        <option value="Phase 1 (0-6 months)">Phase 1</option>
                        <option value="Phase 2 (6-12 months)">Phase 2</option>
                        <option value="Phase 3 (12-24 months)">Phase 3</option>
                        <option value="Future (24+ months)">Future</option>
                        <option value="Deferred">Deferred</option>
                      </select>
                      
                      <select
                        value={filters.type}
                        onChange={(e) => setFilters({...filters, type: e.target.value})}
                        className="border border-gray-300 rounded-lg py-2 px-3"
                      >
                        <option value="">All Types</option>
                        <option value="Functional">Functional</option>
                        <option value="Non-Functional">Non-Functional</option>
                      </select>
                      
                      <select
                        value={filters.status}
                        onChange={(e) => setFilters({...filters, status: e.target.value})}
                        className="border border-gray-300 rounded-lg py-2 px-3"
                      >
                        <option value="">All Statuses</option>
                        <option value="Not Started">Not Started</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                        <option value="On Hold">On Hold</option>
                        <option value="Under Review">Under Review</option>
                      </select>
                      
                      <select
                        value={filters.category}
                        onChange={(e) => setFilters({...filters, category: e.target.value})}
                        className="border border-gray-300 rounded-lg py-2 px-3"
                      >
                        <option value="">All Categories</option>
                        <option value="Network Architecture & Design">Network Architecture</option>
                        <option value="Secure Data Flow">Secure Data Flow</option>
                        <option value="Access Control & Authentication">Access Control</option>
                        <option value="Monitoring & Detection">Monitoring</option>
                        <option value="Device & Firmware Management">Device Management</option>
                        <option value="Remote Access">Remote Access</option>
                        <option value="Incident Response">Incident Response</option>
                        <option value="Integration Capabilities">Integration</option>
                        <option value="Backup & Recovery">Backup & Recovery</option>
                        <option value="Compliance Management">Compliance</option>
                      </select>
                      
                      <button
                        onClick={() => setFilters({area: '', type: '', category: '', cafPrinciple: '', status: '', maturityLevel: '', applicability: '', implementationPhase: ''})}
                        className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Clear
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Enhanced Requirements Table */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Business Value</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Maturity</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applicability</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phase</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredRequirements.slice(0, 20).map((requirement) => (
                          <tr key={requirement.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {requirement.id}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              <div className="max-w-xs">
                                <div className="truncate font-medium">{requirement.category}</div>
                                <div className="text-xs text-gray-500 truncate">{requirement.businessJustification}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
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
                            <td className="px-6 py-4 whitespace-nowrap">
                              <MaturityIndicator 
                                level={requirement.maturityLevel.level} 
                                score={requirement.maturityLevel.score} 
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                requirement.applicability.type === 'Essential' ? 'bg-green-100 text-green-800' :
                                requirement.applicability.type === 'Applicable' ? 'bg-blue-100 text-blue-800' :
                                requirement.applicability.type === 'Future' ? 'bg-yellow-100 text-yellow-800' :
                                requirement.applicability.type === 'Conditional' ? 'bg-orange-100 text-orange-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {requirement.applicability.type}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {requirement.implementationPhase.split(' ')[0]}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                requirement.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                requirement.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                                requirement.status === 'On Hold' ? 'bg-gray-100 text-gray-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {requirement.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => {
                                    setSelectedRequirement(requirement);
                                    setIsModalOpen(true);
                                  }}
                                  className="text-blue-600 hover:text-blue-900"
                                  title="View Details"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                                <button 
                                  className="text-gray-400 hover:text-gray-600"
                                  title="Edit Requirement"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button 
                                  className="text-yellow-500 hover:text-yellow-700"
                                  title="Update Business Value"
                                >
                                  <Star className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {filteredRequirements.length > 20 && (
                    <div className="bg-gray-50 px-6 py-3 text-center">
                      <p className="text-sm text-gray-500">
                        Showing 20 of {filteredRequirements.length} requirements
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Maturity Analysis View */}
          {viewMode === 'maturity' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">Capability Maturity Assessment</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <InteractiveChart 
                    title="Maturity Distribution by Category" 
                    fullscreenId="maturity-category-chart"
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
                            className="bg-purple-600 h-2 rounded-full" 
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

          {/* Consequences/Risk Analysis View */}
          {viewMode === 'consequences' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">Risk & Consequence Analysis</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {requirements
                    .filter(req => req.consequences.impact === 'Severe' || req.consequences.impact === 'Significant')
                    .slice(0, 9)
                    .map((requirement) => (
                      <div key={requirement.id} className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-medium text-red-900">{requirement.id}</h4>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            requirement.consequences.impact === 'Severe' ? 'bg-red-100 text-red-800' :
                            'bg-orange-100 text-orange-800'
                          }`}>
                            {requirement.consequences.impact}
                          </span>
                        </div>
                        <p className="text-sm text-red-800 mb-2">{requirement.consequences.immediate}</p>
                        <div className="text-xs text-red-600">
                          <span className="font-medium">Category:</span> {requirement.consequences.type}
                        </div>
                        <div className="text-xs text-red-600">
                          <span className="font-medium">Likelihood:</span> {requirement.consequences.likelihood}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
          
          {/* Other Views Placeholder */}
          {!['overview', 'requirements', 'maturity', 'justification', 'consequences'].includes(viewMode) && (
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <div className="text-gray-400 mb-4">
                <Settings className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {viewMode.charAt(0).toUpperCase() + viewMode.slice(1)} View
              </h3>
              <p className="text-gray-600">
                This view is under development. Coming soon!
              </p>
            </div>
          )}
        </main>
      </div>
      
      {/* Enhanced Modal */}
      {isModalOpen && selectedRequirement && (
        <EnhancedRequirementModal 
          requirement={selectedRequirement} 
          onClose={() => {
            setIsModalOpen(false);
            setSelectedRequirement(null);
          }} 
        />
      )}
    </div>
  );
};

export default RequirementsDashboard;
              
              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="font-medium text-green-900 mb-3">Business Value</h4>
                <div className="flex items-center space-x-2 mb-2">
                  <Star className="h-5 w-5 text-green-600" />
                  <span className="text-xl font-bold text-green-900">{requirement.businessValueScore}</span>
                  <span className="text-sm text-green-700">/ 5.0</span>
                </div>
                <p className="text-sm text-green-700">ROI: {requirement.roiProjection}%</p>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-4">
                <h4 className="font-medium text-purple-900 mb-3">Applicability</h4>
                <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                  requirement.applicability.type === 'Essential' ? 'bg-green-100 text-green-800' :
                  requirement.applicability.type === 'Applicable' ? 'bg-blue-100 text-blue-800' :
                  requirement.applicability.type === 'Future' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {requirement.applicability.type}
                </span>
                <p className="text-sm text-purple-700 mt-2">{requirement.applicability.description}</p>
              </div>
            </div>

            {/* Business Justification */}
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-6">
              <h4 className="font-medium text-indigo-900 mb-3 flex items-center">
                <Lightbulb className="h-5 w-5 mr-2" />
                Business Justification
              </h4>
              <p className="text-indigo-800 leading-relaxed">{requirement.businessJustification}</p>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-indigo-900">Business Impact:</span>
                  <p className="text-indigo-700">{requirement.businessImpact}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-indigo-900">Implementation Phase:</span>
                  <p className="text-indigo-700">{requirement.implementationPhase}</p>
                </div>
              </div>
            </div>

            {/* Golden Thread Analysis */}
            <GoldenThreadView requirement={requirement} />

            {/* Consequence Analysis */}
            <ConsequenceAnalysis consequences={requirement.consequences} />

            {/* Financial Analysis */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Cost Estimate
                </h4>
                <p className