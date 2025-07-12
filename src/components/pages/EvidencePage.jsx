import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  AlertCircle, 
  Shield, 
  CheckCircle, 
  Clock,
  Upload,
  Download,
  Plus,
  Zap,
  Map,
  Lightbulb,
  Settings,
  RefreshCw,
  Users
} from 'lucide-react';
import EvidenceView from '../organisms/EvidenceView';
import { useToast } from '../../hooks/useToast';
import useAuth from '../../auth/useAuth';
import useEvidenceSuggestions from '../../hooks/useEvidenceSuggestions';
import EvidenceJourneyMap from '../molecules/EvidenceJourneyMap';
import EvidenceHealthCard from '../molecules/EvidenceHealthCard';
import EvidenceAutomationMarketplace from '../molecules/EvidenceAutomationMarketplace';

/**
 * EvidencePage Component
 * 
 * This page component implements the "golden thread" architecture for evidence management:
 * 1. Managing the state of evidence artifacts across the entire security program
 * 2. Providing data and handlers to the EvidenceView organism
 * 3. Processing evidence-related operations (create, update, delete)
 * 4. Calculating metrics for the dashboard
 * 5. Supporting different user types (executive, risk/compliance, technical)
 * 6. Implementing multi-level evidence integration (micro, meso, macro)
 * 
 * The "golden thread" connects threats, risks, capabilities, controls, evidence, and trust scores
 * to provide a comprehensive view of the organization's security posture.
 * 
 * Following atomic design principles, this page uses the EvidenceView organism
 * to handle the presentation layer while focusing on data management and business logic.
 */
const EvidencePage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user } = useAuth();
  
  // User type/role state for view customization
  const [userType, setUserType] = useState('risk'); // 'executive', 'risk', 'technical'
  
  // Active tab state
  const [activeTab, setActiveTab] = useState('evidence');
  
  // Evidence suggestions hook
  const {
    suggestions,
    gaps,
    automationOpportunities,
    narratives,
    loading,
    error,
    getSmartSuggestions,
    findEvidenceGaps,
    recommendAutomation,
    generateEvidenceNarrative
  } = useEvidenceSuggestions();
  
  // Journey map state
  const [selectedPath, setSelectedPath] = useState(null);
  const [highlightedElement, setHighlightedElement] = useState(null);
  const [journeyMapData, setJourneyMapData] = useState(null);
  
  // Automation marketplace state
  const [automationIntegrations, setAutomationIntegrations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [marketplaceFilters, setMarketplaceFilters] = useState({});
  
  // Sample health metrics data
  const healthMetrics = [
    { value: '87%', label: 'Evidence Coverage', status: 'excellent' },
    { value: '72%', label: 'Fresh Evidence', status: 'good' },
    { value: '94%', label: 'Quality Score', status: 'excellent' }
  ];
  
  // Sample insights data
  const insights = [
    { value: '1,247', label: 'Total Evidence Artifacts' },
    { value: '23', label: 'Evidence Gaps' },
    { value: '156', label: 'Auto-Collected Today' },
    { value: '8', label: 'Validation Required' }
  ];
  
  // Sample lifecycle data
  const lifecycleData = [
    { letter: 'I', title: 'Intent', count: 243, color: 'purple' },
    { letter: 'M', title: 'Implementation', count: 418, color: 'blue' },
    { letter: 'B', title: 'Behavioral', count: 392, color: 'green' },
    { letter: 'V', title: 'Validation', count: 194, color: 'red' }
  ];
  
  // Sample evidence items
  const [evidenceItems, setEvidenceItems] = useState([
    {
      id: 'EV-1001',
      title: 'Firewall Configuration Backup',
      description: 'Automated backup of firewall configurations from all network devices in the OT environment.',
      status: 'fresh',
      type: 'Implementation',
      timestamp: { relative: 'Auto-collected 6 hours ago', absolute: '2025-07-11T14:23:15Z' },
      relationships: [
        { label: 'Network Security', type: 'capability' },
        { label: 'NIST PR.AC-4', type: 'framework' },
        { label: 'Unauthorized Access', type: 'risk' }
      ]
    },
    {
      id: 'EV-1002',
      title: 'Data Classification Policy',
      description: 'Formal policy defining data classification levels, handling requirements, and protection controls.',
      status: 'aging',
      type: 'Intent',
      timestamp: { relative: 'Last updated 67 days ago', absolute: '2025-05-05T09:45:30Z' },
      relationships: [
        { label: 'Data Protection', type: 'capability' },
        { label: 'ISO 27001 A.8.2.1', type: 'framework' },
        { label: 'Data Breach', type: 'risk' }
      ]
    },
    {
      id: 'EV-1003',
      title: 'Employee Access Logs',
      description: 'System-generated logs showing employee access to critical systems and sensitive data.',
      status: 'fresh',
      type: 'Behavioral',
      timestamp: { relative: 'Continuously collected', absolute: '2025-07-11T18:30:00Z' },
      relationships: [
        { label: 'Access Control', type: 'capability' },
        { label: 'SOC 2 CC6.1', type: 'framework' },
        { label: 'Insider Threat', type: 'risk' }
      ]
    },
    {
      id: 'EV-1004',
      title: 'Penetration Test Report',
      description: 'Results from the external penetration test conducted by CyberSecure Partners.',
      status: 'stale',
      type: 'Validation',
      timestamp: { relative: 'Last conducted 127 days ago', absolute: '2025-03-06T11:15:45Z' },
      relationships: [
        { label: 'Security Testing', type: 'capability' },
        { label: 'NIST DE.CM-8', type: 'framework' },
        { label: 'Undetected Vulnerabilities', type: 'risk' }
      ]
    },
    {
      id: 'EV-1005',
      title: 'Backup Restoration Test',
      description: 'Documentation of the quarterly backup restoration test for critical OT systems.',
      status: 'fresh',
      type: 'Validation',
      timestamp: { relative: 'Completed 12 days ago', absolute: '2025-06-30T15:20:30Z' },
      relationships: [
        { label: 'Business Continuity', type: 'capability' },
        { label: 'ISO 27001 A.12.3.1', type: 'framework' },
        { label: 'Data Loss', type: 'risk' }
      ]
    },
    {
      id: 'EV-1006',
      title: 'Security Monitoring Dashboard',
      description: 'Real-time security monitoring dashboard showing alerts, incidents, and system status.',
      status: 'fresh',
      type: 'Behavioral',
      timestamp: { relative: 'Real-time monitoring', absolute: '2025-07-12T08:00:00Z' },
      relationships: [
        { label: 'Security Monitoring', type: 'capability' },
        { label: 'NIST DE.CM-1', type: 'framework' },
        { label: 'Delayed Detection', type: 'risk' }
      ]
    },
    {
      id: 'EV-1007',
      title: 'Vendor Security Assessment',
      description: 'Completed security assessment for third-party OT vendor access and integration.',
      status: 'aging',
      type: 'Validation',
      timestamp: { relative: 'Conducted 45 days ago', absolute: '2025-05-28T10:15:00Z' },
      relationships: [
        { label: 'Third-Party Risk', type: 'capability' },
        { label: 'SOC 2 CC9.2', type: 'framework' },
        { label: 'Supply Chain Risk', type: 'risk' }
      ]
    },
    {
      id: 'EV-1008',
      title: 'Security Awareness Training Records',
      description: 'Completion records for mandatory security awareness training for all employees.',
      status: 'fresh',
      type: 'Behavioral',
      timestamp: { relative: 'Updated 15 minutes ago', absolute: '2025-07-12T07:45:00Z' },
      relationships: [
        { label: 'Personnel Security', type: 'capability' },
        { label: 'NIST PR.AT', type: 'framework' },
        { label: 'Human Factor Risk', type: 'risk' }
      ]
    },
    {
      id: 'EV-1009',
      title: 'Incident Response Plan',
      description: 'Formal documentation of the organization\'s incident response procedures and escalation paths.',
      status: 'stale',
      type: 'Intent',
      timestamp: { relative: 'Last reviewed 145 days ago', absolute: '2025-02-16T14:30:00Z' },
      relationships: [
        { label: 'Incident Response', type: 'capability' },
        { label: 'ISO 27001 A.16.1', type: 'framework' },
        { label: 'Incident Handling', type: 'risk' }
      ]
    }
  ]);
  
  // Sample recent activity data
  const recentActivity = [
    {
      title: 'AWS Config Compliance Scan',
      timestamp: { relative: '2 minutes ago', absolute: '2025-07-12T07:58:00Z' },
      source: 'Automated',
      status: 'fresh',
      tags: [
        { label: 'Infrastructure Security', type: 'capability' },
        { label: 'NIST CSF', type: 'framework' }
      ]
    },
    {
      title: 'Security Awareness Training Completion',
      timestamp: { relative: '15 minutes ago', absolute: '2025-07-12T07:45:00Z' },
      source: 'HR System',
      status: 'fresh',
      tags: [
        { label: 'Personnel Security', type: 'capability' },
        { label: 'Human Factor Risk', type: 'risk' }
      ]
    },
    {
      title: 'Vulnerability Assessment Report',
      timestamp: { relative: '3 days ago', absolute: '2025-07-09T10:30:00Z' },
      source: 'Security Team',
      status: 'aging',
      tags: [
        { label: 'Vulnerability Management', type: 'capability' },
        { label: 'ISO 27001', type: 'framework' }
      ]
    },
    {
      title: 'Incident Response Plan Review',
      timestamp: { relative: '45 days ago', absolute: '2025-05-28T09:15:00Z' },
      source: 'Manual Upload',
      status: 'stale',
      tags: [
        { label: 'Incident Response', type: 'capability' },
        { label: 'Operational Risk', type: 'risk' }
      ]
    }
  ];
  
  // Filter state
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    framework: ''
  });
  
  // Load initial data
  useEffect(() => {
    // Load suggestions and automation opportunities
    getSmartSuggestions({ currentEvidence: evidenceItems });
    findEvidenceGaps({ currentEvidence: evidenceItems });
    recommendAutomation({ currentEvidence: evidenceItems });
    
    // Generate narrative based on user type
    generateEvidenceNarrative({
      evidence: evidenceItems,
      audience: userType,
      purpose: userType === 'executive' ? 'board report' : userType === 'risk' ? 'compliance' : 'technical'
    });
    
    // Load journey map data - in a real implementation, this would come from an API
    // For now, we're using the sample data in the EvidenceView component
    
    // Load automation integrations - in a real implementation, this would come from an API
    // For now, we're using the sample data in the EvidenceAutomationMarketplace component
    
  }, [userType, evidenceItems, getSmartSuggestions, findEvidenceGaps, recommendAutomation, generateEvidenceNarrative]);
  
  // Handle user type change
  const handleUserTypeChange = useCallback((type) => {
    setUserType(type);
    showToast({
      title: 'View Changed',
      message: `Switched to ${type.charAt(0).toUpperCase() + type.slice(1)} view`,
      type: 'info'
    });
    
    // Adjust the active tab based on user type
    if (type === 'executive') {
      setActiveTab('journey');
    } else if (type === 'risk') {
      setActiveTab('evidence');
    } else if (type === 'technical') {
      setActiveTab('automation');
    }
  }, [showToast]);
  
  // Handle tab change
  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
  }, []);
  
  // Handle filter changes
  const handleFilterChange = useCallback((filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  }, []);
  
  // Handle adding new evidence
  const handleAddEvidence = useCallback(() => {
    showToast({
      title: 'Add Evidence',
      message: 'Evidence creation modal would open here.',
      type: 'info'
    });
    
    // In a real implementation, this would open a modal to add new evidence
  }, [showToast]);
  
  // Handle viewing journey map
  const handleViewJourneyMap = useCallback(() => {
    setActiveTab('journey');
    
    showToast({
      title: 'Evidence Journey Map',
      message: 'Switched to journey map view',
      type: 'info'
    });
  }, [showToast]);
  
  // Handle viewing all activity
  const handleViewAllActivity = useCallback(() => {
    showToast({
      title: 'Evidence Activity',
      message: 'Full activity log would open here.',
      type: 'info'
    });
    
    // In a real implementation, this might navigate to an activity log page
    // navigate('/dashboard/evidence/activity');
  }, [showToast]);
  
  // Handle viewing evidence details
  const handleViewEvidenceDetails = useCallback((evidence) => {
    showToast({
      title: `Evidence ${evidence.id}`,
      message: `Viewing details for: ${evidence.title}`,
      type: 'info'
    });
    
    // In a real implementation, this might navigate to a details page
    // navigate(`/dashboard/evidence/${evidence.id}`);
  }, [showToast]);
  
  // Handle importing evidence
  const handleImportEvidence = useCallback(() => {
    showToast({
      title: 'Import Evidence',
      message: 'Evidence import wizard would open here.',
      type: 'info'
    });
    
    // In a real implementation, this would open an import wizard
  }, [showToast]);
  
  // Handle exporting evidence
  const handleExportEvidence = useCallback(() => {
    showToast({
      title: 'Export Evidence',
      message: 'Evidence export options would open here.',
      type: 'info'
    });
    
    // In a real implementation, this would open export options or start a download
  }, [showToast]);
  
  // Journey Map Handlers
  const handlePathSelect = useCallback((pathId) => {
    setSelectedPath(pathId);
    
    showToast({
      title: 'Path Selected',
      message: `Selected evidence journey path: ${pathId}`,
      type: 'info'
    });
  }, [showToast]);
  
  const handleNodeClick = useCallback((nodeType, node) => {
    setHighlightedElement({ type: nodeType, id: node.id });
    
    showToast({
      title: 'Node Selected',
      message: `Selected ${nodeType}: ${node.name || node.label}`,
      type: 'info'
    });
    
    // In a real implementation, this might show details or highlight related elements
  }, [showToast]);
  
  // Automation Handlers
  const handleEnableIntegration = useCallback((integrationId) => {
    showToast({
      title: 'Integration Enabled',
      message: `Enabled integration: ${integrationId}`,
      type: 'success'
    });
    
    // In a real implementation, this would enable the integration
  }, [showToast]);
  
  const handleDisableIntegration = useCallback((integrationId) => {
    showToast({
      title: 'Integration Disabled',
      message: `Disabled integration: ${integrationId}`,
      type: 'info'
    });
    
    // In a real implementation, this would disable the integration
  }, [showToast]);
  
  const handleViewIntegrationDetails = useCallback((integrationId) => {
    showToast({
      title: 'Integration Details',
      message: `Viewing details for integration: ${integrationId}`,
      type: 'info'
    });
    
    // In a real implementation, this would open a modal or navigate to details
  }, [showToast]);
  
  const handleInstallIntegration = useCallback(() => {
    showToast({
      title: 'Install Integration',
      message: 'Integration installation wizard would open here',
      type: 'info'
    });
    
    // In a real implementation, this would open an installation wizard
  }, [showToast]);
  
  const handleConfigureIntegration = useCallback((integrationId) => {
    showToast({
      title: 'Configure Integration',
      message: `Configuring integration: ${integrationId}`,
      type: 'info'
    });
    
    // In a real implementation, this would open configuration settings
  }, [showToast]);
  
  // Suggestions Handlers
  const handleAcceptSuggestion = useCallback((suggestionId) => {
    showToast({
      title: 'Suggestion Accepted',
      message: `Accepted suggestion: ${suggestionId}`,
      type: 'success'
    });
    
    // In a real implementation, this would add the suggestion to a queue or open a modal
  }, [showToast]);
  
  const handleDismissSuggestion = useCallback((suggestionId) => {
    showToast({
      title: 'Suggestion Dismissed',
      message: `Dismissed suggestion: ${suggestionId}`,
      type: 'info'
    });
    
    // In a real implementation, this would remove the suggestion
  }, [showToast]);
  
  // Customize view based on user type
  const getCustomizedView = useCallback(() => {
    // Base props for all user types
    const baseProps = {
      healthMetrics,
      insights,
      lifecycleData,
      recentActivity,
      evidenceItems,
      filters,
      activeTab,
      onTabChange: handleTabChange,
      onFilterChange: handleFilterChange,
      onAddEvidence: handleAddEvidence,
      onViewJourneyMap: handleViewJourneyMap,
      onViewAllActivity: handleViewAllActivity,
      onViewEvidenceDetails: handleViewEvidenceDetails,
      onImportEvidence: handleImportEvidence,
      onExportEvidence: handleExportEvidence,
      
      // Journey Map props
      selectedPath,
      highlightedElement,
      onPathSelect: handlePathSelect,
      onNodeClick: handleNodeClick,
      
      // Automation props
      automationIntegrations,
      onEnableIntegration: handleEnableIntegration,
      onDisableIntegration: handleDisableIntegration,
      onViewIntegrationDetails: handleViewIntegrationDetails,
      onInstallIntegration: handleInstallIntegration,
      onConfigureIntegration: handleConfigureIntegration,
      onSearchChange: setSearchQuery,
      onMarketplaceFilterChange: setMarketplaceFilters,
      searchQuery,
      marketplaceFilters,
      
      // Suggestions props
      suggestions,
      gaps,
      automationOpportunities,
      onAcceptSuggestion: handleAcceptSuggestion,
      onDismissSuggestion: handleDismissSuggestion,
      onRefreshSuggestions: () => getSmartSuggestions({ currentEvidence: evidenceItems }),
      onAnalyzeGaps: () => findEvidenceGaps({ currentEvidence: evidenceItems }),
      loading,
      error
    };
    
    // Customize based on user type
    switch (userType) {
      case 'executive':
        return {
          ...baseProps,
          // Executives focus on high-level metrics and journey maps
          defaultTab: 'journey',
          showDetailedTechnicalInfo: false,
          showNarratives: true,
          narrative: narratives.executive,
          compactView: true
        };
        
      case 'risk':
        return {
          ...baseProps,
          // Risk/compliance teams focus on evidence gaps and framework mapping
          defaultTab: 'evidence',
          showDetailedTechnicalInfo: true,
          showGapAnalysis: true,
          showFrameworkMapping: true,
          narrative: narratives.compliance,
          compactView: false
        };
        
      case 'technical':
        return {
          ...baseProps,
          // Technical teams focus on automation and implementation details
          defaultTab: 'automation',
          showDetailedTechnicalInfo: true,
          showAutomationDetails: true,
          narrative: narratives.technical,
          compactView: false
        };
        
      default:
        return baseProps;
    }
  }, [
    userType, healthMetrics, insights, lifecycleData, recentActivity, 
    evidenceItems, filters, activeTab, handleTabChange, handleFilterChange, 
    handleAddEvidence, handleViewJourneyMap, handleViewAllActivity, 
    handleViewEvidenceDetails, handleImportEvidence, handleExportEvidence,
    selectedPath, highlightedElement, handlePathSelect, handleNodeClick,
    automationIntegrations, handleEnableIntegration, handleDisableIntegration,
    handleViewIntegrationDetails, handleInstallIntegration, handleConfigureIntegration,
    setSearchQuery, setMarketplaceFilters, searchQuery, marketplaceFilters,
    suggestions, gaps, automationOpportunities, handleAcceptSuggestion,
    handleDismissSuggestion, getSmartSuggestions, findEvidenceGaps, loading, error,
    narratives
  ]);
  
  return (
    <div className="h-full">
      {/* User Type Selector */}
      <div className="mb-4 flex justify-end">
        <div className="inline-flex items-center rounded-md border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800">
          <button
            className={`px-4 py-2 text-sm font-medium rounded-l-md ${
              userType === 'executive' 
                ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300' 
                : 'text-secondary-700 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-secondary-700'
            }`}
            onClick={() => handleUserTypeChange('executive')}
          >
            Executive
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium ${
              userType === 'risk' 
                ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300' 
                : 'text-secondary-700 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-secondary-700'
            }`}
            onClick={() => handleUserTypeChange('risk')}
          >
            Risk/Compliance
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium rounded-r-md ${
              userType === 'technical' 
                ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300' 
                : 'text-secondary-700 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-secondary-700'
            }`}
            onClick={() => handleUserTypeChange('technical')}
          >
            Technical
          </button>
        </div>
      </div>
      
      {/* Evidence View with customized props based on user type */}
      <EvidenceView {...getCustomizedView()} />
    </div>
  );
};

export default EvidencePage;
