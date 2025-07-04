// src/components/threats/ThreatIntelligenceSystem.jsx
import React, { useState, useReducer, useCallback, useEffect } from 'react';
import { Shield, AlertTriangle, Settings, BarChart3, Bell, Users, ArrowLeft } from 'lucide-react';

// Import all threat intelligence components
import ThreatDashboard from './ThreatDashboard';
import RiskManagement from './RiskManagement';
import ThreatAdmin from './ThreatAdmin';
import ThreatSettings from './ThreatSettings';

// Import custom hooks
import useThreatIntelligence from '../../hooks/useThreatIntelligence';
// or if using named export:
// import { default as useThreatIntelligence } from '../../hooks/useThreatIntelligence';
import useRiskManagement from '../../hooks/useRiskManagement';

// Main Threat Intelligence System Container
const ThreatIntelligenceSystem = ({ 
  companyProfile, 
  capabilities = [], 
  requirements = [],
  onUpdateRequirement,
  onAddRequirement,
  userProfile = {},
  onNavigateBack
}) => {
  // State for active view within threat intelligence
  const [activeView, setActiveView] = useState('dashboard'); // dashboard, risks, admin, settings
  const [showCriticalAlert, setShowCriticalAlert] = useState(false);

  // Initialize threat intelligence hook with company profile
  const {
    threats,
    allThreats,
    rssFeeds,
    loading: threatLoading,
    error: threatError,
    lastUpdate,
    metrics: threatMetrics,
    createThreat,
    updateThreat,
    deleteThreat,
    acknowledgeThreat,
    dismissThreat,
    addRssFeed,
    updateRssFeed,
    deleteRssFeed,
    filters: threatFilters,
    updateFilter: updateThreatFilter,
    clearFilters: clearThreatFilters,
    getMitreHeatmap,
    getThreatsByActor,
    getThreatsBySector,
    exportThreats,
    exportIOCs,
    config: threatConfig,
    updateConfig: updateThreatConfig
  } = useThreatIntelligence(companyProfile);

  // Initialize risk management hook
  const {
    risks,
    allRisks,
    loading: riskLoading,
    error: riskError,
    metrics: riskMetrics,
    createRisk,
    updateRisk,
    deleteRisk,
    changeRiskStatus,
    createRiskFromThreat,
    bulkUpdateRisks,
    getRiskById,
    getRisksByThreat,
    getOverdueRisks,
    getHighPriorityRisks,
    exportRisks
  } = useRiskManagement();

  // User settings state (you might want to persist this in localStorage or backend)
  const [userSettings, setUserSettings] = useState({
    informationDensity: companyProfile?.size === 'small' ? 'basic' : 
                       companyProfile?.size === 'medium' ? 'detailed' : 'comprehensive',
    enableNotifications: true,
    theme: 'light',
    defaultView: 'dashboard',
    // ... other default settings
  });

  // Handle critical threat alerts
  useEffect(() => {
    const criticalThreats = threats.filter(t => 
      t.severity === 'Critical' && 
      !t.acknowledgment && 
      !t.dismissed &&
      userSettings.enableNotifications
    );
    
    if (criticalThreats.length > 0) {
      setShowCriticalAlert(true);
      
      // Show desktop notification if enabled
      if (userSettings.desktopNotifications && 'Notification' in window && Notification.permission === 'granted') {
        criticalThreats.forEach(threat => {
          new Notification('Critical Threat Detected', {
            body: threat.title,
            icon: '/favicon.ico',
            tag: threat.id
          });
        });
      }
    }
  }, [threats, userSettings.enableNotifications, userSettings.desktopNotifications]);

  // Handle creating risks from threats
  const handleCreateRiskFromThreat = useCallback(async (threat) => {
    try {
      const result = await createRiskFromThreat(threat);
      if (result.success) {
        // Show success notification
        console.log('Risk created successfully from threat:', result.risk.id);
      } else {
        console.error('Failed to create risk:', result.error);
      }
    } catch (error) {
      console.error('Error creating risk from threat:', error);
    }
  }, [createRiskFromThreat]);

  // Handle creating requirements from threats
  const handleCreateRequirementFromThreat = useCallback(async (threat) => {
    if (onAddRequirement) {
      const requirement = {
        title: `Security Control: ${threat.title}`,
        description: `Implement security controls to mitigate threat: ${threat.description}`,
        priority: threat.severity,
        category: 'Threat Mitigation',
        framework: 'Custom',
        sourceType: 'Threat Intelligence',
        sourceId: threat.id,
        status: 'Proposed',
        estimatedCost: 'TBD',
        estimatedEffort: 'TBD',
        businessJustification: `Critical security control required to address ${threat.severity.toLowerCase()} severity threat targeting ${companyProfile?.industry || 'the organization'}.`,
        technicalRequirements: threat.mitigations || [],
        complianceAlignment: threat.type === 'APT Campaign' ? ['NERC CIP', 'ISO 27001'] : ['ISO 27001'],
        tags: [...(threat.tags || []), 'Threat Mitigation', 'Security Control']
      };
      
      await onAddRequirement(requirement);
    }
  }, [onAddRequirement, companyProfile]);

  // Handle settings updates
  const handleUpdateSettings = useCallback(async (newSettings) => {
    setUserSettings(newSettings);
    
    // Update threat intelligence config based on user settings
    if (newSettings.informationDensity !== userSettings.informationDensity) {
      await updateThreatConfig('informationDensity', newSettings.informationDensity);
    }
    
    if (newSettings.enableNotifications !== userSettings.enableNotifications) {
      await updateThreatConfig('enableNotifications', newSettings.enableNotifications);
    }
    
    // Persist settings (localStorage or API call)
    localStorage.setItem('threatIntelligenceSettings', JSON.stringify(newSettings));
  }, [userSettings, updateThreatConfig]);

  // Load settings on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('threatIntelligenceSettings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setUserSettings(parsedSettings);
      } catch (error) {
        console.error('Failed to load saved settings:', error);
      }
    }
  }, []);

  // Navigation items for threat intelligence subsystem
  const threatNavigationItems = [
    { 
      id: 'dashboard', 
      name: 'Dashboard', 
      icon: BarChart3, 
      description: 'Threat intelligence overview and analytics' 
    },
    { 
      id: 'risks', 
      name: 'Risk Management', 
      icon: AlertTriangle, 
      description: 'Convert threats to risks and track mitigation' 
    },
    { 
      id: 'admin', 
      name: 'Administration', 
      icon: Settings, 
      description: 'RSS feeds and system configuration',
      adminOnly: true 
    },
    { 
      id: 'settings', 
      name: 'Personal Settings', 
      icon: Users, 
      description: 'Customize your threat intelligence experience' 
    }
  ];

  // Filter navigation items based on user permissions
  const visibleNavigationItems = threatNavigationItems.filter(item => {
    if (item.adminOnly) {
      return ['admin', 'super-admin'].includes(userProfile.role);
    }
    return true;
  });

  // Critical Alert Modal
  const renderCriticalAlertModal = () => {
    if (!showCriticalAlert) return null;

    const criticalThreats = threats.filter(t => 
      t.severity === 'Critical' && !t.acknowledgment && !t.dismissed
    );

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
          <div className="flex items-center space-x-3 mb-4">
            <div className="flex-shrink-0">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-red-900">Critical Threat Alert</h2>
              <p className="text-red-700">
                {criticalThreats.length} critical threat{criticalThreats.length > 1 ? 's' : ''} detected requiring immediate attention
              </p>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            {criticalThreats.slice(0, 3).map(threat => (
              <div key={threat.id} className="p-4 border-l-4 border-red-500 bg-red-50">
                <h3 className="font-semibold text-red-900">{threat.title}</h3>
                <p className="text-sm text-red-800 mt-1">{threat.description}</p>
                <div className="flex items-center space-x-4 mt-2 text-xs text-red-700">
                  <span>Source: {threat.source}</span>
                  <span>Risk Score: {threat.riskScore}/25</span>
                  <span>Published: {new Date(threat.published).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
            {criticalThreats.length > 3 && (
              <div className="text-center text-sm text-gray-600">
                ... and {criticalThreats.length - 3} more critical threats
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={() => {
                // Acknowledge all critical threats
                criticalThreats.forEach(threat => acknowledgeThreat(threat.id));
                setShowCriticalAlert(false);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Acknowledge All
            </button>
            <button
              onClick={() => setShowCriticalAlert(false)}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render the appropriate view
  const renderActiveView = () => {
    const commonProps = {
      companyProfile,
      capabilities,
      requirements,
      userProfile
    };

    switch (activeView) {
      case 'dashboard':
        return (
          <ThreatDashboard
            {...commonProps}
            threats={threats}
            metrics={threatMetrics}
            filters={threatFilters}
            onUpdateFilter={updateThreatFilter}
            onClearFilters={clearThreatFilters}
            onAcknowledgeThreat={acknowledgeThreat}
            onDismissThreat={dismissThreat}
            onCreateRisk={handleCreateRiskFromThreat}
            onCreateRequirement={handleCreateRequirementFromThreat}
            informationDensity={userSettings.informationDensity}
            getMitreHeatmap={getMitreHeatmap}
            getThreatsByActor={getThreatsByActor}
            getThreatsBySector={getThreatsBySector}
            loading={threatLoading}
            error={threatError}
            lastUpdate={lastUpdate}
          />
        );

      case 'risks':
        return (
          <RiskManagement
            {...commonProps}
            risks={risks}
            allRisks={allRisks}
            threats={allThreats}
            metrics={riskMetrics}
            onCreateRisk={createRisk}
            onUpdateRisk={updateRisk}
            onDeleteRisk={deleteRisk}
            onChangeRiskStatus={changeRiskStatus}
            onCreateRiskFromThreat={createRiskFromThreat}
            onBulkUpdateRisks={bulkUpdateRisks}
            onCreateRequirement={handleCreateRequirementFromThreat}
            getRiskById={getRiskById}
            getRisksByThreat={getRisksByThreat}
            getOverdueRisks={getOverdueRisks}
            getHighPriorityRisks={getHighPriorityRisks}
            onExportRisks={exportRisks}
            loading={riskLoading}
            error={riskError}
          />
        );

      case 'admin':
        return (
          <ThreatAdmin
            {...commonProps}
            rssFeeds={rssFeeds}
            config={threatConfig}
            onAddRssFeed={addRssFeed}
            onUpdateRssFeed={updateRssFeed}
            onDeleteRssFeed={deleteRssFeed}
            onUpdateConfig={updateThreatConfig}
            userRole={userProfile.role || 'user'}
          />
        );

      case 'settings':
        return (
          <ThreatSettings
            {...commonProps}
            currentSettings={userSettings}
            onUpdateSettings={handleUpdateSettings}
          />
        );

      default:
        return (
          <div className="text-center py-8">
            <Shield className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900">Invalid View</h3>
            <p className="text-gray-600">The requested view is not available.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {onNavigateBack && (
                <button
                  onClick={onNavigateBack}
                  className="flex items-center text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeft className="w-5 h-5 mr-1" />
                  Back to Dashboard
                </button>
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Shield className="w-6 h-6 mr-3 text-blue-600" />
                  Threat Intelligence
                </h1>
                <p className="text-gray-600">
                  Real-time threat monitoring and risk assessment for {companyProfile?.industry || 'your organization'}
                </p>
              </div>
            </div>

            {/* Status Indicators */}
            <div className="flex items-center space-x-4">
              {threatMetrics && (
                <>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{threatMetrics.critical}</div>
                    <div className="text-xs text-gray-500">Critical</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{threatMetrics.high}</div>
                    <div className="text-xs text-gray-500">High</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{threatMetrics.unacknowledged}</div>
                    <div className="text-xs text-gray-500">New</div>
                  </div>
                </>
              )}
              
              {(threatLoading || riskLoading) && (
                <div className="flex items-center text-blue-600">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                  <span className="text-sm">Updating...</span>
                </div>
              )}
              
              {lastUpdate && (
                <div className="text-xs text-gray-500">
                  Last update: {new Date(lastUpdate).toLocaleTimeString()}
                </div>
              )}
            </div>
          </div>

          {/* Sub-navigation */}
          <div className="mt-6">
            <nav className="flex space-x-8">
              {visibleNavigationItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`group inline-flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                    activeView === item.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  title={item.description}
                >
                  <item.icon className="w-4 h-4 mr-2" />
                  {item.name}
                  {item.adminOnly && (
                    <span className="ml-2 px-1.5 py-0.5 text-xs bg-orange-100 text-orange-800 rounded">
                      Admin
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-6">
        {(threatError || riskError) && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
              <h3 className="text-sm font-medium text-red-800">System Error</h3>
            </div>
            <div className="mt-2 text-sm text-red-700">
              {threatError || riskError}
            </div>
          </div>
        )}

        {renderActiveView()}
      </div>

      {/* Critical Alert Modal */}
      {renderCriticalAlertModal()}
    </div>
  );
};

export default ThreatIntelligenceSystem;

// ============================================================================
// INTEGRATION CODE FOR RequirementsDashboard.jsx
// ============================================================================

/*
// Add these imports to the top of your RequirementsDashboard.jsx file:

import ThreatIntelligenceSystem from './components/threats/ThreatIntelligenceSystem';

// Add this to your navigationItems array (around line 300):

const navigationItems = [
  { id: 'overview', name: 'Overview', icon: TrendingUp },
  { id: 'company-profile', name: 'Company Profile', icon: Building2 },
  { id: 'capabilities', name: 'Capabilities', icon: Network },
  { id: 'requirements', name: 'Requirements', icon: FileText },
  { id: 'threat-intelligence', name: 'Threat Intelligence', icon: Shield }, // ADD THIS LINE
  { id: 'pcd', name: 'PCD Breakdown', icon: Building2 },
  { id: 'maturity', name: 'Maturity Analysis', icon: Gauge },
  { id: 'justification', name: 'Business Value', icon: Star },
  { id: 'analytics', name: 'Analytics', icon: BarChart3 }
];

// Add this to your main content switch statement (around line 800):

{state.ui.viewMode === 'threat-intelligence' && (
  <ThreatIntelligenceSystem
    companyProfile={companyProfile}
    capabilities={capabilities}
    requirements={requirements}
    onUpdateRequirement={handleUpdateRequirement}
    onAddRequirement={addRequirement}
    userProfile={{
      id: 'current-user-id',
      name: 'Current User',
      email: 'user@company.com',
      role: 'admin' // or 'user', 'super-admin'
    }}
    onNavigateBack={() => dispatch({ type: 'SET_VIEW_MODE', payload: 'overview' })}
  />
)}

// Update your keyboard shortcuts (if you have them) to include 't' for threat intelligence:
// Change the navigation to handle 9 views instead of 8

*/