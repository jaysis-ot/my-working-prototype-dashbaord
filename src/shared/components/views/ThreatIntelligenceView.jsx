// src/components/views/ThreatIntelligenceView.jsx
import React, { useState, useEffect } from 'react';
import { 
  Shield, AlertTriangle, Search, Filter, Bell, Eye, Target,
  TrendingUp, TrendingDown, Clock, MapPin, Users, Zap,
  FileText, Settings, RefreshCw, Download, Share, Plus,
  Globe, Wifi, Server, Database, Lock, AlertCircle
} from 'lucide-react';

/**
 * Threat Intelligence View Component
 * 
 * Comprehensive threat intelligence dashboard providing real-time threat
 * monitoring, analysis, and actionable intelligence for security teams.
 * 
 * Features:
 * - Real-time threat feed monitoring
 * - Threat actor tracking and analysis
 * - Industry-specific threat intelligence
 * - MITRE ATT&CK integration
 * - Threat hunting capabilities
 * - Geographic threat mapping
 * - IOC (Indicators of Compromise) management
 * - Automated threat assessment
 * - Integration with risk and requirements management
 */
const ThreatIntelligenceView = ({
  state,
  dispatch,
  currentTheme,
  companyProfile,
  requirements = [],
  capabilities = [],
  onUpdateRequirement,
  onAddRequirement
}) => {

  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'threats', 'actors', 'iocs', 'hunting'
  const [threatFilter, setThreatFilter] = useState('all'); // 'all', 'critical', 'high', 'medium', 'low'
  const [searchTerm, setSearchTerm] = useState('');
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Mock threat intelligence data
  const mockThreats = [
    {
      id: 'THREAT-001',
      title: 'APT29 Targeting Energy Sector',
      description: 'Advanced persistent threat group APT29 observed targeting energy infrastructure with spear-phishing campaigns',
      severity: 'Critical',
      confidence: 'High',
      category: 'Advanced Persistent Threat',
      industry: 'Energy',
      geography: 'Global',
      threatActor: 'APT29 (Cozy Bear)',
      firstSeen: '2024-06-15T08:30:00Z',
      lastSeen: '2024-06-19T14:22:00Z',
      status: 'Active',
      iocs: ['185.220.101.182', 'malicious-energy-update.exe', 'energy-corp-invoice.docm'],
      mitreTactics: ['Initial Access', 'Persistence', 'Credential Access'],
      mitreeTechniques: ['T1566.001', 'T1053.005', 'T1003.001'],
      affectedSectors: ['Energy', 'Utilities'],
      riskScore: 9.2,
      trend: 'increasing'
    },
    {
      id: 'THREAT-002',
      title: 'Ransomware Campaign Targeting OT Systems',
      description: 'New ransomware strain specifically designed to target operational technology systems in critical infrastructure',
      severity: 'Critical',
      confidence: 'Medium',
      category: 'Ransomware',
      industry: 'Critical Infrastructure',
      geography: 'North America, Europe',
      threatActor: 'BlackEnergy Group',
      firstSeen: '2024-06-18T12:15:00Z',
      lastSeen: '2024-06-20T09:45:00Z',
      status: 'Active',
      iocs: ['192.168.1.100', 'ot-encrypt.dll', 'scada-maintenance.bat'],
      mitreTactics: ['Initial Access', 'Impact'],
      mitreTechniques: ['T1190', 'T1486'],
      affectedSectors: ['Energy', 'Water', 'Manufacturing'],
      riskScore: 8.8,
      trend: 'stable'
    },
    {
      id: 'THREAT-003',
      title: 'Supply Chain Compromise - SolarWinds Style',
      description: 'Sophisticated supply chain attack targeting software updates for industrial control systems',
      severity: 'High',
      confidence: 'High',
      category: 'Supply Chain Attack',
      industry: 'Technology',
      geography: 'Global',
      threatActor: 'UNC2452',
      firstSeen: '2024-06-10T16:20:00Z',
      lastSeen: '2024-06-18T11:30:00Z',
      status: 'Monitoring',
      iocs: ['update-server.industrialsoft.com', 'trusted-update.msi'],
      mitreTactics: ['Initial Access', 'Defense Evasion', 'Persistence'],
      mitreTechniques: ['T1195.002', 'T1027', 'T1543.003'],
      affectedSectors: ['Manufacturing', 'Energy', 'Transportation'],
      riskScore: 7.5,
      trend: 'decreasing'
    },
    {
      id: 'THREAT-004',
      title: 'Insider Threat: Credential Harvesting',
      description: 'Patterns suggesting insider threat activity focused on harvesting privileged credentials',
      severity: 'Medium',
      confidence: 'Medium',
      category: 'Insider Threat',
      industry: 'All',
      geography: 'Internal',
      threatActor: 'Unknown Insider',
      firstSeen: '2024-06-17T10:00:00Z',
      lastSeen: '2024-06-20T15:30:00Z',
      status: 'Under Investigation',
      iocs: ['unusual-login-patterns', 'credential-dumping-tools'],
      mitreTactics: ['Credential Access', 'Collection'],
      mitreTechniques: ['T1003', 'T1005'],
      affectedSectors: ['All'],
      riskScore: 6.0,
      trend: 'stable'
    }
  ];

  const mockThreatActors = [
    {
      id: 'APT29',
      name: 'APT29 (Cozy Bear)',
      type: 'Nation State',
      origin: 'Russia',
      targetSectors: ['Government', 'Energy', 'Healthcare'],
      activeCampaigns: 3,
      lastActivity: '2024-06-19',
      sophistication: 'High',
      motivation: 'Espionage'
    },
    {
      id: 'BLACKENERGY',
      name: 'BlackEnergy Group',
      type: 'Cybercriminal',
      origin: 'Eastern Europe',
      targetSectors: ['Energy', 'Finance', 'Critical Infrastructure'],
      activeCampaigns: 2,
      lastActivity: '2024-06-20',
      sophistication: 'Medium',
      motivation: 'Financial'
    }
  ];

  // Auto-refresh functionality
  useEffect(() => {
    let interval;
    if (autoRefresh) {
      interval = setInterval(() => {
        setLastUpdated(new Date());
      }, 60000); // Refresh every minute
    }
    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Get threat statistics
  const getThreatStats = () => {
    const threats = mockThreats;
    return {
      total: threats.length,
      critical: threats.filter(t => t.severity === 'Critical').length,
      high: threats.filter(t => t.severity === 'High').length,
      medium: threats.filter(t => t.severity === 'Medium').length,
      low: threats.filter(t => t.severity === 'Low').length,
      active: threats.filter(t => t.status === 'Active').length,
      monitoring: threats.filter(t => t.status === 'Monitoring').length,
      avgRisk: (threats.reduce((sum, t) => sum + t.riskScore, 0) / threats.length).toFixed(1)
    };
  };

  // Filter threats
  const getFilteredThreats = () => {
    let filtered = mockThreats;

    if (threatFilter !== 'all') {
      filtered = filtered.filter(threat => threat.severity.toLowerCase() === threatFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(threat => 
        threat.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        threat.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        threat.threatActor.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
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
        {severity}
      </span>
    );
  };

  // Get trend indicator
  const getTrendIndicator = (trend) => {
    const trendConfig = {
      'increasing': { icon: TrendingUp, color: 'text-red-600', bg: 'bg-red-50' },
      'decreasing': { icon: TrendingDown, color: 'text-green-600', bg: 'bg-green-50' },
      'stable': { icon: Clock, color: 'text-gray-600', bg: 'bg-gray-50' }
    };

    const config = trendConfig[trend] || trendConfig['stable'];
    const Icon = config.icon;

    return (
      <div className={`inline-flex items-center px-2 py-1 rounded text-xs ${config.color} ${config.bg}`}>
        <Icon className="h-3 w-3 mr-1" />
        {trend.charAt(0).toUpperCase() + trend.slice(1)}
      </div>
    );
  };

  // Handle manual refresh
  const handleRefresh = () => {
    setLastUpdated(new Date());
    // In real implementation, this would trigger API calls to refresh data
  };

  // Create requirement from threat
  const handleCreateRequirement = (threat) => {
    const requirementData = {
      title: `Address Threat: ${threat.title}`,
      description: `Security requirement to mitigate threat: ${threat.description}`,
      priority: threat.severity,
      area: 'Security',
      type: 'Control',
      sourceThreatId: threat.id,
      mitreTactics: threat.mitreTactics,
      mitreTechniques: threat.mitreTechniques
    };

    if (onAddRequirement) {
      onAddRequirement(requirementData);
    }
  };

  const stats = getThreatStats();
  const filteredThreats = getFilteredThreats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6">
          <div className="mb-4 lg:mb-0">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center">
              <Shield className="h-6 w-6 mr-3 text-red-600" />
              Threat Intelligence
            </h3>
            <p className="text-gray-600 mt-1">
              Real-time threat monitoring and intelligence analysis
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-sm text-gray-500">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
            <button
              onClick={handleRefresh}
              className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>
            <button
              onClick={() => dispatch({ type: 'TOGGLE_THREAT_SETTINGS_MODAL' })}
              className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </button>
          </div>
        </div>

        {/* Threat Level Indicator */}
        <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-lg p-4 mb-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <AlertTriangle className="h-6 w-6 mr-3" />
              <div>
                <div className="font-semibold">Current Threat Level: HIGH</div>
                <div className="text-sm text-red-100">
                  {stats.critical + stats.high} active high-priority threats detected
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{stats.avgRisk}/10</div>
              <div className="text-sm text-red-100">Average Risk Score</div>
            </div>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-xs text-gray-600">Total Threats</div>
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
            <div className="text-2xl font-bold text-red-900">{stats.active}</div>
            <div className="text-xs text-red-600">Active</div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-900">{stats.monitoring}</div>
            <div className="text-xs text-blue-600">Monitoring</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-purple-900">{mockThreatActors.length}</div>
            <div className="text-xs text-purple-600">Threat Actors</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-4">
          {[
            { key: 'dashboard', label: 'Dashboard', icon: Shield },
            { key: 'threats', label: 'Active Threats', icon: AlertTriangle },
            { key: 'actors', label: 'Threat Actors', icon: Users },
            { key: 'iocs', label: 'IOCs', icon: Target },
            { key: 'hunting', label: 'Threat Hunting', icon: Search }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search and Filter */}
        {activeTab === 'threats' && (
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search threats..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={threatFilter}
                onChange={(e) => setThreatFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="all">All Severity</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Tab Content */}
      {activeTab === 'dashboard' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Threat Activity Feed */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Bell className="h-5 w-5 mr-2 text-red-600" />
              Recent Threat Activity
            </h4>
            <div className="space-y-4">
              {mockThreats.slice(0, 3).map(threat => (
                <div key={threat.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{threat.title}</div>
                    <div className="text-sm text-gray-600 mt-1">{threat.threatActor}</div>
                    <div className="flex items-center mt-2 space-x-2">
                      {getSeverityBadge(threat.severity)}
                      <span className="text-xs text-gray-500">
                        {new Date(threat.lastSeen).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Industry Threat Landscape */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Globe className="h-5 w-5 mr-2 text-blue-600" />
              Industry Threat Landscape
            </h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">Energy Sector</div>
                  <div className="text-sm text-gray-600">Primary target for APT groups</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-red-600">HIGH</div>
                  <div className="text-xs text-gray-500">Risk Level</div>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">Critical Infrastructure</div>
                  <div className="text-sm text-gray-600">Increased ransomware activity</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-orange-600">HIGH</div>
                  <div className="text-xs text-gray-500">Risk Level</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'threats' && (
        <div className="space-y-4">
          {filteredThreats.map(threat => (
            <div key={threat.id} className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between">
                <div className="flex-1 mb-4 lg:mb-0 lg:mr-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h4 className="text-lg font-semibold text-gray-900 mr-3">{threat.title}</h4>
                        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {threat.id}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-3">{threat.description}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Risk Score</div>
                      <div className="text-lg font-bold text-red-600">{threat.riskScore}/10</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Threat Actor</div>
                      <div className="text-sm font-medium text-gray-900">{threat.threatActor}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Geography</div>
                      <div className="text-sm font-medium text-gray-900">{threat.geography}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Last Seen</div>
                      <div className="text-sm font-medium text-gray-900">
                        {new Date(threat.lastSeen).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    {getSeverityBadge(threat.severity)}
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {threat.category}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      {threat.status}
                    </span>
                    {getTrendIndicator(threat.trend)}
                  </div>

                  <div className="text-sm text-gray-600">
                    <strong>MITRE Tactics:</strong> {threat.mitreTactics.join(', ')}
                  </div>
                </div>

                <div className="flex flex-col space-y-2 lg:w-48">
                  <button className="flex items-center justify-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm">
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </button>
                  <button
                    onClick={() => handleCreateRequirement(threat)}
                    className="flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Create Requirement
                  </button>
                  <button className="flex items-center justify-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm">
                    <Bell className="h-4 w-4 mr-2" />
                    Create Alert
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'actors' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {mockThreatActors.map(actor => (
            <div key={actor.id} className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">{actor.name}</h4>
                  <p className="text-sm text-gray-600">{actor.type} • {actor.origin}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  actor.sophistication === 'High' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {actor.sophistication} Sophistication
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Active Campaigns</div>
                  <div className="text-lg font-bold text-gray-900">{actor.activeCampaigns}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Last Activity</div>
                  <div className="text-sm font-medium text-gray-900">{actor.lastActivity}</div>
                </div>
              </div>

              <div className="mb-4">
                <div className="text-xs text-gray-500 mb-2">Target Sectors</div>
                <div className="flex flex-wrap gap-1">
                  {actor.targetSectors.map(sector => (
                    <span key={sector} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                      {sector}
                    </span>
                  ))}
                </div>
              </div>

              <div className="text-sm text-gray-600">
                <strong>Motivation:</strong> {actor.motivation}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Auto-refresh toggle */}
      <div className="fixed bottom-6 right-6">
        <button
          onClick={() => setAutoRefresh(!autoRefresh)}
          className={`flex items-center px-4 py-2 rounded-lg shadow-lg transition-colors ${
            autoRefresh 
              ? 'bg-green-600 text-white hover:bg-green-700' 
              : 'bg-gray-600 text-white hover:bg-gray-700'
          }`}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
          Auto-refresh {autoRefresh ? 'ON' : 'OFF'}
        </button>
      </div>
    </div>
  );
};

export default ThreatIntelligenceView;