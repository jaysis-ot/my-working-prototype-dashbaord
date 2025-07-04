// src/components/views/RiskManagementView.jsx
import React, { useState } from 'react';
import { 
  AlertTriangle, Shield, Search, Filter, Plus, Eye, Edit, 
  ArrowRight, Clock, CheckCircle, X, TrendingUp, TrendingDown,
  Users, Calendar, FileText, Target, Zap, AlertCircle
} from 'lucide-react';

/**
 * Risk Management View Component
 * 
 * Comprehensive risk management interface for identifying, assessing, and
 * mitigating operational and security risks. Provides risk tracking,
 * assessment workflows, and integration with requirements management.
 * 
 * Features:
 * - Risk inventory with categorization
 * - Risk assessment and scoring
 * - Mitigation tracking and planning
 * - Risk trend analysis
 * - Integration with requirements creation
 * - Advanced filtering and search
 * - Risk lifecycle management
 */
const RiskManagementView = ({
  state,
  dispatch,
  currentTheme,
  companyProfile,
  requirements = [],
  capabilities = [],
  onCreateRequirement
}) => {

  const [activeTab, setActiveTab] = useState('all'); // 'all', 'critical', 'high', 'medium', 'low'
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedRisk, setSelectedRisk] = useState(null);

  // Mock risk data - in real implementation this would come from API/state
  const mockRisks = [
    {
      id: 'RISK-001',
      title: 'Unencrypted Data Transmission',
      description: 'Critical customer data transmitted without encryption between network segments',
      category: 'Security',
      severity: 'Critical',
      probability: 'High',
      impact: 'High',
      riskScore: 9.0,
      status: 'Open',
      owner: 'Security Team',
      dateIdentified: '2024-01-15',
      targetResolution: '2024-03-01',
      mitigationPlan: 'Implement TLS encryption across all data transmission channels',
      associatedCapabilities: ['NET-001', 'SEC-002'],
      requirementsCreated: 0,
      trend: 'stable'
    },
    {
      id: 'RISK-002', 
      title: 'Inadequate Access Controls',
      description: 'Privileged access controls not properly implemented across OT systems',
      category: 'Security',
      severity: 'High',
      probability: 'Medium',
      impact: 'High',
      riskScore: 7.5,
      status: 'In Progress',
      owner: 'IT Security',
      dateIdentified: '2024-01-20',
      targetResolution: '2024-04-15',
      mitigationPlan: 'Deploy role-based access control system with MFA',
      associatedCapabilities: ['SEC-001'],
      requirementsCreated: 3,
      trend: 'improving'
    },
    {
      id: 'RISK-003',
      title: 'Legacy System Vulnerabilities',
      description: 'Critical infrastructure running on outdated systems with known vulnerabilities',
      category: 'Technical',
      severity: 'High',
      probability: 'High',
      impact: 'Medium',
      riskScore: 8.0,
      status: 'Open',
      owner: 'Infrastructure Team',
      dateIdentified: '2024-01-10',
      targetResolution: '2024-06-30',
      mitigationPlan: 'Systematic upgrade and patching program',
      associatedCapabilities: ['INF-001'],
      requirementsCreated: 5,
      trend: 'worsening'
    },
    {
      id: 'RISK-004',
      title: 'Insufficient Backup Procedures',
      description: 'Backup and recovery procedures not tested for critical OT systems',
      category: 'Operational',
      severity: 'Medium',
      probability: 'Medium',
      impact: 'High',
      riskScore: 6.0,
      status: 'Mitigated',
      owner: 'Operations Team',
      dateIdentified: '2024-01-05',
      targetResolution: '2024-02-28',
      mitigationPlan: 'Implement automated backup testing and recovery procedures',
      associatedCapabilities: ['OPS-001'],
      requirementsCreated: 2,
      trend: 'improving'
    },
    {
      id: 'RISK-005',
      title: 'Third-Party Integration Risks',
      description: 'Security risks from inadequately vetted third-party system integrations',
      category: 'Supply Chain',
      severity: 'Medium',
      probability: 'Low',
      impact: 'Medium',
      riskScore: 4.5,
      status: 'Open',
      owner: 'Procurement Team',
      dateIdentified: '2024-01-25',
      targetResolution: '2024-05-01',
      mitigationPlan: 'Enhanced vendor security assessment process',
      associatedCapabilities: ['SEC-003'],
      requirementsCreated: 1,
      trend: 'stable'
    }
  ];

  // Filter risks based on active filters
  const getFilteredRisks = () => {
    let filtered = mockRisks;

    // Filter by severity (tab)
    if (activeTab !== 'all') {
      filtered = filtered.filter(risk => risk.severity.toLowerCase() === activeTab);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(risk => 
        risk.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        risk.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        risk.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(risk => risk.status.toLowerCase().replace(' ', '-') === statusFilter);
    }

    // Filter by category
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(risk => risk.category.toLowerCase() === categoryFilter);
    }

    return filtered;
  };

  // Get risk statistics
  const getRiskStats = () => {
    const risks = mockRisks;
    return {
      total: risks.length,
      critical: risks.filter(r => r.severity === 'Critical').length,
      high: risks.filter(r => r.severity === 'High').length,
      medium: risks.filter(r => r.severity === 'Medium').length,
      low: risks.filter(r => r.severity === 'Low').length,
      open: risks.filter(r => r.status === 'Open').length,
      inProgress: risks.filter(r => r.status === 'In Progress').length,
      mitigated: risks.filter(r => r.status === 'Mitigated').length,
      avgScore: (risks.reduce((sum, r) => sum + r.riskScore, 0) / risks.length).toFixed(1)
    };
  };

  // Get severity styling
  const getSeverityBadge = (severity) => {
    const severityConfig = {
      'Critical': { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
      'High': { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200' },
      'Medium': { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
      'Low': { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' }
    };

    const config = severityConfig[severity] || severityConfig['Medium'];
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}>
        <AlertTriangle className="h-3 w-3 mr-1" />
        {severity}
      </span>
    );
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      'Open': { bg: 'bg-red-100', text: 'text-red-800', icon: AlertCircle },
      'In Progress': { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock },
      'Mitigated': { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle }
    };

    const config = statusConfig[status] || statusConfig['Open'];
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <Icon className="h-3 w-3 mr-1" />
        {status}
      </span>
    );
  };

  // Get trend indicator
  const getTrendIndicator = (trend) => {
    const trendConfig = {
      'improving': { icon: TrendingDown, color: 'text-green-600', label: 'Improving' },
      'worsening': { icon: TrendingUp, color: 'text-red-600', label: 'Worsening' },
      'stable': { icon: ArrowRight, color: 'text-gray-600', label: 'Stable' }
    };

    const config = trendConfig[trend] || trendConfig['stable'];
    const Icon = config.icon;

    return (
      <div className={`flex items-center text-xs ${config.color}`}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </div>
    );
  };

  // Handle risk selection
  const handleRiskSelect = (risk) => {
    setSelectedRisk(risk);
  };

  // Handle create requirement from risk
  const handleCreateRequirement = (risk) => {
    const requirementData = {
      title: `Mitigate: ${risk.title}`,
      description: `Security requirement to address risk: ${risk.description}`,
      priority: risk.severity,
      area: 'Security',
      type: 'Control',
      sourceRiskId: risk.id
    };

    if (onCreateRequirement) {
      onCreateRequirement(requirementData);
    }
  };

  const stats = getRiskStats();
  const filteredRisks = getFilteredRisks();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6">
          <div className="mb-4 lg:mb-0">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center">
              <AlertTriangle className="h-6 w-6 mr-3 text-red-600" />
              Risk Management
            </h3>
            <p className="text-gray-600 mt-1">
              Identify, assess, and mitigate operational and security risks
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-sm text-gray-500">
              {filteredRisks.length} of {stats.total} risks • Avg Score: {stats.avgScore}/10
            </div>
            <button className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
              <Plus className="h-4 w-4 mr-2" />
              New Risk
            </button>
          </div>
        </div>

        {/* Risk Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-xs text-gray-600">Total Risks</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-red-900">{stats.critical}</div>
            <div className="text-xs text-red-600">Critical</div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-orange-900">{stats.high}</div>
            <div className="text-xs text-orange-600">High</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-yellow-900">{stats.medium}</div>
            <div className="text-xs text-yellow-600">Medium</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-red-900">{stats.open}</div>
            <div className="text-xs text-red-600">Open</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-yellow-900">{stats.inProgress}</div>
            <div className="text-xs text-yellow-600">In Progress</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-900">{stats.mitigated}</div>
            <div className="text-xs text-green-600">Mitigated</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-4">
          {[
            { key: 'all', label: 'All Risks', count: stats.total },
            { key: 'critical', label: 'Critical', count: stats.critical },
            { key: 'high', label: 'High', count: stats.high },
            { key: 'medium', label: 'Medium', count: stats.medium },
            { key: 'low', label: 'Low', count: stats.low }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search risks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="in-progress">In Progress</option>
              <option value="mitigated">Mitigated</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="all">All Categories</option>
              <option value="security">Security</option>
              <option value="operational">Operational</option>
              <option value="technical">Technical</option>
              <option value="supply chain">Supply Chain</option>
            </select>
          </div>
        </div>
      </div>

      {/* Risk List */}
      <div className="space-y-4">
        {filteredRisks.map((risk) => (
          <div 
            key={risk.id}
            className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200"
          >
            <div className="flex flex-col lg:flex-row lg:items-start justify-between">
              {/* Risk Info */}
              <div className="flex-1 mb-4 lg:mb-0 lg:mr-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h4 className="text-lg font-semibold text-gray-900 mr-3">
                        {risk.title}
                      </h4>
                      <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {risk.id}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-3 leading-relaxed">
                      {risk.description}
                    </p>
                  </div>
                </div>

                {/* Risk Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Risk Score</div>
                    <div className="flex items-center">
                      <div className={`text-lg font-bold ${
                        risk.riskScore >= 8 ? 'text-red-600' :
                        risk.riskScore >= 6 ? 'text-orange-600' :
                        risk.riskScore >= 4 ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {risk.riskScore}
                      </div>
                      <div className="text-gray-400 ml-1">/10</div>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Owner</div>
                    <div className="text-sm font-medium text-gray-900 flex items-center">
                      <Users className="h-3 w-3 mr-1" />
                      {risk.owner}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Target Resolution</div>
                    <div className="text-sm font-medium text-gray-900 flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(risk.targetResolution).toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Requirements</div>
                    <div className="text-sm font-medium text-gray-900 flex items-center">
                      <FileText className="h-3 w-3 mr-1" />
                      {risk.requirementsCreated} created
                    </div>
                  </div>
                </div>

                {/* Status and Badges */}
                <div className="flex flex-wrap items-center gap-2">
                  {getSeverityBadge(risk.severity)}
                  {getStatusBadge(risk.status)}
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {risk.category}
                  </span>
                  {getTrendIndicator(risk.trend)}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col space-y-2 lg:w-48">
                <button
                  onClick={() => handleRiskSelect(risk)}
                  className="flex items-center justify-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </button>
                <button
                  onClick={() => handleCreateRequirement(risk)}
                  className="flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  <Target className="h-4 w-4 mr-2" />
                  Create Requirement
                </button>
                <button className="flex items-center justify-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm">
                  <Zap className="h-4 w-4 mr-2" />
                  Update Status
                </button>
              </div>
            </div>

            {/* Mitigation Plan */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="text-xs text-gray-500 mb-1">Mitigation Plan</div>
              <p className="text-sm text-gray-700">{risk.mitigationPlan}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredRisks.length === 0 && (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No risks found
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all'
              ? 'Try adjusting your search or filter criteria.'
              : 'Get started by identifying and documenting security risks.'
            }
          </p>
          <button className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
            <Plus className="h-4 w-4 mr-2" />
            Add Risk
          </button>
        </div>
      )}
    </div>
  );
};

export default RiskManagementView;