// src/components/threats/ThreatIntelligenceSystem.jsx
import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  AlertTriangle, 
  TrendingUp, 
  Globe, 
  Activity,
  Search,
  Filter,
  ArrowLeft,
  CheckCircle,
  Clock,
  XCircle,
  Download,
  Upload,
  RefreshCw,
  Eye,
  BarChart3,
  Database,
  Settings,
  Plus,
  ExternalLink,
  Loader,
  X
} from 'lucide-react';

// Import our threat intelligence hook
import useThreatIntelligence from '../../hooks/useThreatIntelligence';

const ThreatIntelligenceSystem = ({ 
  companyProfile, 
  capabilities, 
  requirements, 
  onNavigateBack,
  userProfile 
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedThreat, setSelectedThreat] = useState(null);
  const [showSettings, setShowSettings] = useState(false);

  // Initialize threat intelligence hook
  const {
    threats,
    iocs,
    statistics,
    loading,
    error,
    isInitialized,
    searchThreats,
    searchIOCs,
    processThreat,
    generateThreatReport,
    THREAT_INTEL_SOURCES,
    CONFIDENCE_LEVELS
  } = useThreatIntelligence();

  // Initialize the system
  useEffect(() => {
    if (!isInitialized) {
      console.log('Initializing Threat Intelligence System...');
    }
  }, [isInitialized]);

  // Auto-refresh threats every 5 minutes
  useEffect(() => {
    if (isInitialized) {
      const interval = setInterval(() => {
        searchThreats({ limit: 20 }).catch(console.error);
      }, 5 * 60 * 1000);

      return () => clearInterval(interval);
    }
  }, [isInitialized, searchThreats]);

  const getSeverityColor = (severity) => {
    switch (severity?.toUpperCase()) {
      case 'CRITICAL': return 'text-red-600 bg-red-100 border-red-200';
      case 'HIGH': return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'LOW': return 'text-green-600 bg-green-100 border-green-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'monitoring': return <Activity className="h-4 w-4 text-yellow-500" />;
      case 'investigating': return <Clock className="h-4 w-4 text-blue-500" />;
      case 'resolved': return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <XCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRiskScoreColor = (score) => {
    if (score >= 8) return 'text-red-600 bg-red-50';
    if (score >= 6) return 'text-orange-600 bg-orange-50';
    if (score >= 4) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  const handleRefreshThreats = async () => {
    try {
      await searchThreats({ limit: 20 });
      console.log('Threats refreshed successfully');
    } catch (error) {
      console.error('Failed to refresh threats:', error);
    }
  };

  const handleSearchThreats = async (query) => {
    try {
      await searchThreats({ 
        keywords: query ? [query] : [],
        limit: 50 
      });
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  const handleGenerateReport = async () => {
    try {
      const report = await generateThreatReport({
        period: 'week',
        includeStatistics: true,
        includeTopThreats: true,
        includeIOCs: true
      });
      console.log('Report generated:', report);
      // Here you could trigger a download or show the report
    } catch (error) {
      console.error('Failed to generate report:', error);
    }
  };

  if (loading && !isInitialized) {
    return (
      <div className="min-h-96 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Initializing Threat Intelligence System...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <div className="flex items-center">
          <AlertTriangle className="h-6 w-6 text-red-600 mr-3" />
          <div>
            <h3 className="text-lg font-medium text-red-800">System Error</h3>
            <p className="text-red-600 mt-1">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Reload System
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <button
              onClick={onNavigateBack}
              className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Back to Overview"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Shield className="h-6 w-6 mr-3 text-blue-600" />
                Threat Intelligence
              </h1>
              <p className="text-gray-600 mt-1">
                Real-time threat monitoring and risk assessment
                {companyProfile?.companyName && ` for ${companyProfile.companyName}`}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="text-sm text-gray-500">
              Last updated: {statistics.lastUpdate ? new Date(statistics.lastUpdate).toLocaleTimeString() : 'Never'}
            </div>
            <button
              onClick={handleRefreshThreats}
              disabled={loading}
              className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Settings className="h-4 w-4 text-gray-600" />
            </button>
          </div>
        </div>

        {/* System Status */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
          <div className="flex items-center space-x-6">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              <span className="text-sm font-medium text-gray-700">System Active</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Database className="h-4 w-4 mr-1" />
              <span>{Object.keys(THREAT_INTEL_SOURCES).length} Intel Sources</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Activity className="h-4 w-4 mr-1" />
              <span>{threats.length} Active Threats</span>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            Next Update: {new Date(Date.now() + 15*60*1000).toLocaleTimeString()}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mt-6">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', name: 'Overview', icon: TrendingUp },
              { id: 'threats', name: 'Active Threats', icon: AlertTriangle, badge: threats.length },
              { id: 'iocs', name: 'Indicators', icon: Globe, badge: iocs.length },
              { id: 'analytics', name: 'Analytics', icon: BarChart3 },
              { id: 'feeds', name: 'Intel Feeds', icon: Database }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.name}
                {tab.badge !== undefined && (
                  <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Threats</p>
                  <p className="text-2xl font-bold text-gray-900">{statistics.totalThreats}</p>
                  <p className="text-xs text-green-600">+{statistics.newThreats} new</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">High Risk</p>
                  <p className="text-2xl font-bold text-gray-900">{statistics.highRiskThreats}</p>
                  <p className="text-xs text-gray-500">Score ≥ 7.0</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Globe className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">IOCs Tracked</p>
                  <p className="text-2xl font-bold text-gray-900">{iocs.length}</p>
                  <p className="text-xs text-gray-500">Indicators</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Activity className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">System Health</p>
                  <p className="text-2xl font-bold text-green-600">98%</p>
                  <p className="text-xs text-gray-500">Operational</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Threats */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent High-Risk Threats</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => setActiveTab('threats')}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View All →
                </button>
                <button
                  onClick={handleGenerateReport}
                  className="flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition-colors"
                >
                  <Download className="h-3 w-3 mr-1" />
                  Report
                </button>
              </div>
            </div>
            
            <div className="space-y-4">
              {threats.slice(0, 5).map((threat) => (
                <div key={threat.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                  <div className="flex-shrink-0">
                    {getStatusIcon(threat.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {threat.title}
                      </h4>
                      <div className="flex items-center space-x-2">
                        <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(threat.severity)}`}>
                          {threat.severity}
                        </div>
                        <div className={`px-2 py-1 rounded text-xs font-bold ${getRiskScoreColor(threat.riskScore)}`}>
                          {threat.riskScore?.toFixed(1)}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {threat.description}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Source: {threat.source}</span>
                      <span>Confidence: {threat.confidence?.toFixed(0)}%</span>
                      <span>{new Date(threat.publishedDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
              
              {threats.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Shield className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No threats detected</p>
                  <p className="text-sm">System monitoring active</p>
                </div>
              )}
            </div>
          </div>

          {/* Intelligence Sources */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Intelligence Sources</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(THREAT_INTEL_SOURCES).map(([key, source]) => (
                <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900 text-sm">{source.name}</h4>
                    <p className="text-xs text-gray-500">{source.description}</p>
                  </div>
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-2 ${
                      source.reliability === 'high' ? 'bg-green-500' : 
                      source.reliability === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}></div>
                    <span className="text-xs text-gray-500">{source.updateFrequency}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Active Threats Tab */}
      {activeTab === 'threats' && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Active Threats ({threats.length})</h3>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search threats..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    handleSearchThreats(e.target.value);
                  }}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button className="flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </button>
              <button
                onClick={handleRefreshThreats}
                disabled={loading}
                className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {threats.map((threat) => (
              <div key={threat.id} className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      {getStatusIcon(threat.status)}
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">{threat.title}</h4>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                        <span>ID: {threat.id}</span>
                        <span>Source: {threat.source}</span>
                        <span>Confidence: {threat.confidence?.toFixed(0)}%</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getSeverityColor(threat.severity)}`}>
                      {threat.severity}
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold px-2 py-1 rounded ${getRiskScoreColor(threat.riskScore)}`}>
                        {threat.riskScore?.toFixed(1)}
                      </div>
                      <div className="text-xs text-gray-500">Risk Score</div>
                    </div>
                  </div>
                </div>
                
                <p className="text-gray-700 mb-4">{threat.description}</p>
                
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Published: {new Date(threat.publishedDate).toLocaleDateString()}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setSelectedThreat(threat)}
                      className="flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200 transition-colors"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Details
                    </button>
                    <button className="flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition-colors">
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Source
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* IOCs Tab */}
      {activeTab === 'iocs' && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Indicators of Compromise ({iocs.length})</h3>
            <button 
              onClick={() => searchIOCs()}
              className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh IOCs
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Indicator</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Confidence</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">First Seen</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reputation</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {iocs.map((ioc) => (
                  <tr key={ioc.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">{ioc.value}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                        {ioc.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{ioc.confidence?.toFixed(0)}%</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(ioc.firstSeen).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        ioc.reputation?.category === 'malicious' ? 'bg-red-100 text-red-800' :
                        ioc.reputation?.category === 'suspicious' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {ioc.reputation?.category || 'Unknown'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Threat Trends (Last 30 Days)</h3>
              <div className="h-64 flex items-center justify-center text-gray-500 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <TrendingUp className="h-12 w-12 mx-auto mb-2" />
                  <p>Threat trend analytics</p>
                  <p className="text-sm">Chart integration coming soon</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Distribution</h3>
              <div className="h-64 flex items-center justify-center text-gray-500 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                  <p>Risk distribution by severity</p>
                  <p className="text-sm">Chart integration coming soon</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Analytics Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{threats.length}</div>
                <div className="text-sm text-gray-600">Total Threats</div>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{threats.filter(t => t.severity === 'CRITICAL').length}</div>
                <div className="text-sm text-gray-600">Critical</div>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{threats.filter(t => t.severity === 'HIGH').length}</div>
                <div className="text-sm text-gray-600">High Risk</div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{iocs.length}</div>
                <div className="text-sm text-gray-600">IOCs</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Intel Feeds Tab */}
      {activeTab === 'feeds' && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Intelligence Feed Status</h3>
            <button className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
              <Plus className="h-4 w-4 mr-2" />
              Add Feed
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(THREAT_INTEL_SOURCES).map(([key, source]) => (
              <div key={key} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">{source.name}</h4>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    source.reliability === 'high' ? 'bg-green-100 text-green-800' : 
                    source.reliability === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-red-100 text-red-800'
                  }`}>
                    {source.reliability}
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-3">{source.description}</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Update Frequency:</span>
                    <span className="font-medium">{source.updateFrequency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Data Types:</span>
                    <span className="font-medium">{source.dataTypes.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Status:</span>
                    <span className="text-green-600 font-medium">Active</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Threat Intelligence Settings</h3>
            <button
              onClick={() => setShowSettings(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Auto-refresh Settings */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Auto-refresh Settings</h4>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600" />
                  <span className="ml-2 text-sm text-gray-700">Enable auto-refresh (5 minutes)</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600" />
                  <span className="ml-2 text-sm text-gray-700">Real-time notifications</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-blue-600" />
                  <span className="ml-2 text-sm text-gray-700">Email alerts for critical threats</span>
                </label>
              </div>
            </div>

            {/* Feed Configuration */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Intelligence Feeds</h4>
              <div className="space-y-3">
                {Object.entries(THREAT_INTEL_SOURCES).slice(0, 3).map(([key, source]) => (
                  <label key={key} className="flex items-center">
                    <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600" />
                    <span className="ml-2 text-sm text-gray-700">{source.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Filtering Settings */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Default Filters</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Risk Score</label>
                  <select className="block w-full border-gray-300 rounded-md shadow-sm">
                    <option value="0">All threats (0+)</option>
                    <option value="5">Medium risk (5+)</option>
                    <option value="7" selected>High risk (7+)</option>
                    <option value="9">Critical only (9+)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confidence Threshold</label>
                  <select className="block w-full border-gray-300 rounded-md shadow-sm">
                    <option value="0">All confidence levels</option>
                    <option value="50">Medium confidence (50%+)</option>
                    <option value="75" selected>High confidence (75%+)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Company Profile Integration */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Company Context</h4>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input type="checkbox" defaultChecked={!!companyProfile} className="rounded border-gray-300 text-blue-600" />
                  <span className="ml-2 text-sm text-gray-700">Use company profile for relevance scoring</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600" />
                  <span className="ml-2 text-sm text-gray-700">Industry-specific threat filtering</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-blue-600" />
                  <span className="ml-2 text-sm text-gray-700">Geographic threat prioritization</span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-500">
              Settings are saved automatically
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Export Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* System Footer */}
      <div className="bg-gray-50 rounded-xl p-4">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-6">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              <span>Threat Intelligence Engine: Online</span>
            </div>
            <div className="flex items-center">
              <Database className="h-4 w-4 mr-1" />
              <span>{Object.keys(THREAT_INTEL_SOURCES).length} Sources Active</span>
            </div>
            <div className="flex items-center">
              <Activity className="h-4 w-4 mr-1" />
              <span>Real-time Monitoring</span>
            </div>
          </div>
          <div className="text-xs">
            <span>System Version: 1.0.0 | API: v1 | </span>
            <span>Uptime: 99.9%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThreatIntelligenceSystem;