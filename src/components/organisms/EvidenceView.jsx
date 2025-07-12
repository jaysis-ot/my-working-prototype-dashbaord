import React, { useState, useMemo, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  Search,
  Filter,
  Download,
  Upload,
  ArrowRight,
  Plus,
  ChevronDown,
  ExternalLink,
  Calendar,
  User,
  Tag,
  Shield,
  Book,
  Code,
  Server,
  LayoutGrid,
  Map,
  Zap,
  Lightbulb,
  ChevronRight,
  Settings,
  RefreshCw,
  X,
  Layers,
  Activity
} from 'lucide-react';
import Button from '../atoms/Button';
import Badge from '../atoms/Badge';
import Input from '../atoms/Input';
import EvidenceJourneyMap from '../molecules/EvidenceJourneyMap';
import EvidenceHealthCard from '../molecules/EvidenceHealthCard';
import EvidenceAutomationMarketplace from '../molecules/EvidenceAutomationMarketplace';
import useEvidenceSuggestions from '../../hooks/useEvidenceSuggestions';

/**
 * EvidenceHealthMetric Component
 * 
 * Displays a single health metric with value and label
 */
const EvidenceHealthMetric = ({ value, label, status }) => {
  const statusColorMap = {
    excellent: 'text-status-success',
    good: 'text-status-warning',
    poor: 'text-status-error',
    default: 'text-secondary-700 dark:text-secondary-300'
  };

  const colorClass = statusColorMap[status] || statusColorMap.default;

  return (
    <div className="text-center">
      <div className={`text-2xl font-bold ${colorClass}`}>{value}</div>
      <div className="text-sm text-secondary-500 dark:text-secondary-400 mt-1">{label}</div>
    </div>
  );
};

EvidenceHealthMetric.propTypes = {
  value: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  status: PropTypes.oneOf(['excellent', 'good', 'poor', 'default'])
};

EvidenceHealthMetric.defaultProps = {
  status: 'default'
};

/**
 * InsightItem Component
 * 
 * Displays a single insight metric with value and label
 */
const InsightItem = ({ value, label }) => (
  <div className="text-center">
    <div className="text-2xl font-bold text-white">{value}</div>
    <div className="text-sm text-white text-opacity-90 mt-1">{label}</div>
  </div>
);

InsightItem.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  label: PropTypes.string.isRequired
};

/**
 * LifecycleStage Component
 * 
 * Displays a single stage in the evidence lifecycle
 */
const LifecycleStage = ({ letter, title, count, color, isLast }) => (
  <div className="flex-1 text-center px-4 py-2 relative">
    <div className={`w-12 h-12 rounded-full bg-${color}-600 flex items-center justify-center text-white font-semibold text-lg mx-auto mb-2`}>
      {letter}
    </div>
    <div className="font-medium text-secondary-900 dark:text-white">{title}</div>
    <div className="text-sm text-secondary-500 dark:text-secondary-400">{count} artifacts</div>
    
    {!isLast && (
      <div className="absolute right-0 top-1/2 transform -translate-y-1/2 -translate-x-1/2 text-secondary-400 dark:text-secondary-600">
        <ArrowRight size={20} />
      </div>
    )}
  </div>
);

LifecycleStage.propTypes = {
  letter: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  count: PropTypes.number.isRequired,
  color: PropTypes.string.isRequired,
  isLast: PropTypes.bool
};

LifecycleStage.defaultProps = {
  isLast: false
};

/**
 * TimelineItem Component
 * 
 * Displays a single item in the evidence activity timeline
 */
const TimelineItem = ({ title, timestamp, source, status, tags }) => {
  const statusColorMap = {
    fresh: 'bg-status-success',
    aging: 'bg-status-warning',
    stale: 'bg-status-error'
  };

  const dotColorClass = statusColorMap[status] || 'bg-secondary-400';

  return (
    <div className="relative pl-6 py-3 border-b border-secondary-200 dark:border-secondary-700 last:border-b-0">
      <div className={`absolute left-0 top-4 w-3 h-3 rounded-full ${dotColorClass} border-2 border-white dark:border-secondary-800`}></div>
      <div>
        <div className="font-medium text-secondary-900 dark:text-white">{title}</div>
        <div className="text-sm text-secondary-500 dark:text-secondary-400 mb-1">
          {typeof timestamp === 'string' ? timestamp : `${timestamp.relative} • ${source}`}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag, index) => (
            <Badge 
              key={index} 
              variant={tag.type === 'capability' ? 'primary' : tag.type === 'risk' ? 'error' : 'info'}
              size="sm"
            >
              {tag.label}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
};

TimelineItem.propTypes = {
  title: PropTypes.string.isRequired,
  timestamp: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({
      relative: PropTypes.string.isRequired,
      absolute: PropTypes.string
    })
  ]).isRequired,
  source: PropTypes.string,
  status: PropTypes.oneOf(['fresh', 'aging', 'stale']),
  tags: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      type: PropTypes.oneOf(['capability', 'risk', 'framework', 'control'])
    })
  )
};

TimelineItem.defaultProps = {
  status: 'fresh',
  tags: []
};

/**
 * EvidenceItem Component
 * 
 * Displays a single evidence artifact in the grid
 */
const EvidenceItem = ({ title, description, status, type, timestamp, relationships, onClick }) => {
  const statusMap = {
    fresh: { class: 'status-fresh', label: 'Fresh', color: 'success' },
    aging: { class: 'status-aging', label: 'Aging', color: 'warning' },
    stale: { class: 'status-stale', label: 'Stale', color: 'error' }
  };

  const statusInfo = statusMap[status] || statusMap.fresh;

  return (
    <div 
      className="bg-white dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 rounded-lg p-4 transition-all hover:border-primary-500 dark:hover:border-primary-500 hover:shadow-md cursor-pointer"
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="font-medium text-secondary-900 dark:text-white">{title}</div>
        <Badge variant={statusInfo.color} size="sm">{statusInfo.label}</Badge>
      </div>
      
      {description && (
        <p className="text-sm text-secondary-600 dark:text-secondary-400 mb-3 line-clamp-2">
          {description}
        </p>
      )}
      
      <div className="text-xs text-secondary-500 dark:text-secondary-400 mb-3">
        {type} Artifact • {typeof timestamp === 'string' ? timestamp : timestamp.relative}
      </div>
      
      <div className="flex flex-wrap gap-1.5">
        {relationships.map((rel, index) => (
          <Badge 
            key={index}
            variant={rel.type === 'capability' ? 'primary' : rel.type === 'risk' ? 'error' : 'info'}
            size="sm"
          >
            {rel.label}
          </Badge>
        ))}
      </div>
    </div>
  );
};

EvidenceItem.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  status: PropTypes.oneOf(['fresh', 'aging', 'stale']),
  type: PropTypes.string.isRequired,
  timestamp: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({
      relative: PropTypes.string.isRequired,
      absolute: PropTypes.string
    })
  ]).isRequired,
  relationships: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      type: PropTypes.oneOf(['capability', 'risk', 'framework', 'control'])
    })
  ),
  onClick: PropTypes.func
};

EvidenceItem.defaultProps = {
  status: 'fresh',
  relationships: [],
  onClick: () => {}
};

/**
 * SuggestionItem Component
 * 
 * Displays a single evidence suggestion
 */
const SuggestionItem = ({ suggestion, onAccept, onDismiss }) => {
  const priorityColorMap = {
    high: 'border-status-error',
    medium: 'border-status-warning',
    low: 'border-status-success'
  };

  const borderClass = priorityColorMap[suggestion.priority] || 'border-secondary-200 dark:border-secondary-700';

  return (
    <div className={`bg-white dark:bg-secondary-800 border-l-4 ${borderClass} border-t border-r border-b border-secondary-200 dark:border-secondary-700 rounded-r-lg p-4`}>
      <div className="flex justify-between items-start mb-2">
        <div className="font-medium text-secondary-900 dark:text-white">{suggestion.title}</div>
        <Badge 
          variant={suggestion.priority === 'high' ? 'error' : suggestion.priority === 'medium' ? 'warning' : 'success'} 
          size="sm"
        >
          {suggestion.priority.charAt(0).toUpperCase() + suggestion.priority.slice(1)} Priority
        </Badge>
      </div>
      
      <p className="text-sm text-secondary-600 dark:text-secondary-400 mb-3">
        {suggestion.description}
      </p>
      
      <div className="flex flex-wrap gap-1.5 mb-3">
        <Badge variant="primary" size="sm">
          {suggestion.type} Evidence
        </Badge>
        <Badge variant="info" size="sm">
          {suggestion.relevance}% Relevance
        </Badge>
        {suggestion.relatedFrameworks && suggestion.relatedFrameworks.slice(0, 1).map((framework, index) => (
          <Badge key={index} variant="secondary" size="sm">
            {framework}
          </Badge>
        ))}
      </div>
      
      <div className="flex justify-end gap-2 mt-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onDismiss(suggestion.id)}
        >
          Dismiss
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={() => onAccept(suggestion.id)}
        >
          Accept
        </Button>
      </div>
    </div>
  );
};

SuggestionItem.propTypes = {
  suggestion: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    priority: PropTypes.oneOf(['high', 'medium', 'low']).isRequired,
    relevance: PropTypes.number.isRequired,
    relatedFrameworks: PropTypes.arrayOf(PropTypes.string),
    relatedRisks: PropTypes.arrayOf(PropTypes.string)
  }).isRequired,
  onAccept: PropTypes.func.isRequired,
  onDismiss: PropTypes.func.isRequired
};

/**
 * TabButton Component
 * 
 * A button for the tabbed interface
 */
const TabButton = ({ active, icon: Icon, label, onClick }) => (
  <button
    className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
      active 
        ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300' 
        : 'text-secondary-600 dark:text-secondary-400 hover:bg-secondary-100 dark:hover:bg-secondary-800'
    }`}
    onClick={onClick}
  >
    <Icon className="w-4 h-4 mr-2" />
    {label}
  </button>
);

TabButton.propTypes = {
  active: PropTypes.bool.isRequired,
  icon: PropTypes.elementType.isRequired,
  label: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired
};

/**
 * EvidenceView Organism Component
 * 
 * A comprehensive view for displaying and managing evidence artifacts.
 * This component implements the Evidence Dashboard with sections for:
 * - Evidence health metrics
 * - Evidence intelligence insights
 * - Evidence lifecycle visualization
 * - Recent evidence activity
 * - Evidence filtering
 * - Evidence grid display
 * - Evidence journey map
 * - Evidence automation marketplace
 * - Smart evidence suggestions
 * 
 * Following atomic design principles, this organism composes atoms and molecules
 * to create a cohesive user interface for evidence management.
 */
const EvidenceView = ({
  healthMetrics,
  insights,
  lifecycleData,
  recentActivity,
  evidenceItems,
  filters,
  onFilterChange,
  onAddEvidence,
  onViewJourneyMap,
  onViewAllActivity,
  onViewEvidenceDetails,
  onImportEvidence,
  onExportEvidence
}) => {
  // Tab state for different views
  const [activeTab, setActiveTab] = useState('evidence');
  
  // Filter state for evidence types
  const [evidenceTypeFilter, setEvidenceTypeFilter] = useState('all');
  
  // State for journey map
  const [selectedPath, setSelectedPath] = useState(null);
  const [highlightedElement, setHighlightedElement] = useState(null);
  
  // State for automation marketplace
  const [searchQuery, setSearchQuery] = useState('');
  const [marketplaceFilters, setMarketplaceFilters] = useState({});
  
  // Use evidence suggestions hook
  const {
    suggestions,
    gaps,
    automationOpportunities,
    loading,
    error,
    getSmartSuggestions,
    findEvidenceGaps,
    recommendAutomation
  } = useEvidenceSuggestions();
  
  // Load suggestions and automation opportunities on mount
  useEffect(() => {
    getSmartSuggestions({ currentEvidence: evidenceItems });
    findEvidenceGaps({ currentEvidence: evidenceItems });
    recommendAutomation({ currentEvidence: evidenceItems });
  }, [getSmartSuggestions, findEvidenceGaps, recommendAutomation, evidenceItems]);
  
  // Handle accepting a suggestion
  const handleAcceptSuggestion = useCallback((suggestionId) => {
    // In a real implementation, this would add the suggestion to a queue or open a modal
    console.log(`Accepted suggestion: ${suggestionId}`);
    // For demo purposes, just filter it out
    const updatedSuggestions = suggestions.filter(s => s.id !== suggestionId);
    // This is just for demo - in a real app we'd use a proper state update
  }, [suggestions]);
  
  // Handle dismissing a suggestion
  const handleDismissSuggestion = useCallback((suggestionId) => {
    // In a real implementation, this would remove the suggestion
    console.log(`Dismissed suggestion: ${suggestionId}`);
    // For demo purposes, just filter it out
    const updatedSuggestions = suggestions.filter(s => s.id !== suggestionId);
    // This is just for demo - in a real app we'd use a proper state update
  }, [suggestions]);
  
  // Handle enabling an integration
  const handleEnableIntegration = useCallback((integrationId) => {
    console.log(`Enabling integration: ${integrationId}`);
    // In a real implementation, this would enable the integration
  }, []);
  
  // Handle disabling an integration
  const handleDisableIntegration = useCallback((integrationId) => {
    console.log(`Disabling integration: ${integrationId}`);
    // In a real implementation, this would disable the integration
  }, []);
  
  // Handle viewing integration details
  const handleViewIntegrationDetails = useCallback((integrationId) => {
    console.log(`Viewing integration details: ${integrationId}`);
    // In a real implementation, this would open a modal or navigate to details
  }, []);
  
  // Handle installing a new integration
  const handleInstallIntegration = useCallback(() => {
    console.log('Installing new integration');
    // In a real implementation, this would open an installation wizard
  }, []);
  
  // Handle configuring an integration
  const handleConfigureIntegration = useCallback((integrationId) => {
    console.log(`Configuring integration: ${integrationId}`);
    // In a real implementation, this would open configuration settings
  }, []);
  
  // Handle journey map path selection
  const handlePathSelect = useCallback((pathId) => {
    setSelectedPath(pathId);
  }, []);
  
  // Handle journey map node click
  const handleNodeClick = useCallback((nodeType, node) => {
    setHighlightedElement({ type: nodeType, id: node.id });
    // In a real implementation, this might show details or highlight related elements
  }, []);
  
  // Apply filters to evidence items
  const filteredEvidence = useMemo(() => {
    return evidenceItems.filter(item => {
      // Filter by type if not 'all'
      if (evidenceTypeFilter !== 'all' && item.type.toLowerCase() !== evidenceTypeFilter.toLowerCase()) {
        return false;
      }
      
      // Filter by search term if present
      if (filters.search && !item.title.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      
      // Filter by status if selected
      if (filters.status && item.status !== filters.status) {
        return false;
      }
      
      // Filter by framework if selected
      if (filters.framework && !item.relationships.some(rel => 
        rel.type === 'framework' && rel.label.includes(filters.framework)
      )) {
        return false;
      }
      
      return true;
    });
  }, [evidenceItems, evidenceTypeFilter, filters]);
  
  // Sample journey map data
  const journeyMapData = {
    primary: {
      threat: [
        {
          id: 'threat-1',
          name: 'Unauthorized Access',
          description: 'Threat of unauthorized access to sensitive systems and data',
          status: 'active',
          coverage: 85,
          children: [
            { id: 'threat-1-1', name: 'External Attackers' },
            { id: 'threat-1-2', name: 'Malicious Insiders' }
          ]
        },
        {
          id: 'threat-2',
          name: 'Data Exfiltration',
          description: 'Threat of sensitive data being extracted from the organization',
          status: 'active',
          coverage: 72,
          children: [
            { id: 'threat-2-1', name: 'Malware' },
            { id: 'threat-2-2', name: 'Insider Threat' }
          ]
        }
      ],
      risk: [
        {
          id: 'risk-1',
          name: 'Unauthorized System Access',
          description: 'Risk of unauthorized users gaining access to critical systems',
          status: 'partial',
          coverage: 78,
          children: [
            { id: 'risk-1-1', name: 'Weak Authentication' },
            { id: 'risk-1-2', name: 'Excessive Privileges' }
          ]
        },
        {
          id: 'risk-2',
          name: 'Data Breach',
          description: 'Risk of sensitive data being exposed to unauthorized parties',
          status: 'complete',
          coverage: 92,
          children: [
            { id: 'risk-2-1', name: 'Unencrypted Data' },
            { id: 'risk-2-2', name: 'Insecure APIs' }
          ]
        }
      ],
      capability: [
        {
          id: 'capability-1',
          name: 'Access Control',
          description: 'Capability to manage and control access to systems and data',
          status: 'complete',
          coverage: 94,
          children: [
            { id: 'capability-1-1', name: 'Authentication' },
            { id: 'capability-1-2', name: 'Authorization' }
          ]
        },
        {
          id: 'capability-2',
          name: 'Data Protection',
          description: 'Capability to protect data at rest and in transit',
          status: 'partial',
          coverage: 86,
          children: [
            { id: 'capability-2-1', name: 'Encryption' },
            { id: 'capability-2-2', name: 'Data Loss Prevention' }
          ]
        }
      ],
      control: [
        {
          id: 'control-1',
          name: 'Multi-Factor Authentication',
          description: 'Control requiring multiple forms of authentication',
          status: 'complete',
          coverage: 98,
          children: [
            { id: 'control-1-1', name: 'MFA for Admin Access' },
            { id: 'control-1-2', name: 'MFA for Remote Access' }
          ]
        },
        {
          id: 'control-2',
          name: 'Data Encryption',
          description: 'Control requiring encryption of sensitive data',
          status: 'partial',
          coverage: 82,
          children: [
            { id: 'control-2-1', name: 'Encryption at Rest' },
            { id: 'control-2-2', name: 'Encryption in Transit' }
          ]
        }
      ],
      evidence: [
        {
          id: 'evidence-1',
          name: 'MFA Configuration Screenshots',
          description: 'Screenshots showing MFA configuration for all systems',
          status: 'complete',
          coverage: 100,
          children: [
            { id: 'evidence-1-1', name: 'Admin MFA Settings' },
            { id: 'evidence-1-2', name: 'User MFA Settings' }
          ]
        },
        {
          id: 'evidence-2',
          name: 'Encryption Audit Reports',
          description: 'Audit reports showing encryption status for all systems',
          status: 'partial',
          coverage: 76,
          children: [
            { id: 'evidence-2-1', name: 'Database Encryption' },
            { id: 'evidence-2-2', name: 'File System Encryption' }
          ]
        }
      ],
      trustScore: [
        {
          id: 'trust-1',
          name: 'Access Control Trust Score',
          description: 'Trust score for access control capabilities',
          status: 'complete',
          coverage: 94,
          children: [
            { id: 'trust-1-1', name: 'Authentication Score' },
            { id: 'trust-1-2', name: 'Authorization Score' }
          ]
        },
        {
          id: 'trust-2',
          name: 'Data Protection Trust Score',
          description: 'Trust score for data protection capabilities',
          status: 'partial',
          coverage: 82,
          children: [
            { id: 'trust-2-1', name: 'Encryption Score' },
            { id: 'trust-2-2', name: 'DLP Score' }
          ]
        }
      ]
    },
    compliance: {
      framework: [
        {
          id: 'framework-1',
          name: 'NIST CSF',
          description: 'NIST Cybersecurity Framework',
          status: 'partial',
          coverage: 87,
          children: [
            { id: 'framework-1-1', name: 'Identify' },
            { id: 'framework-1-2', name: 'Protect' }
          ]
        },
        {
          id: 'framework-2',
          name: 'ISO 27001',
          description: 'ISO 27001 Information Security Standard',
          status: 'partial',
          coverage: 82,
          children: [
            { id: 'framework-2-1', name: 'A.9 Access Control' },
            { id: 'framework-2-2', name: 'A.10 Cryptography' }
          ]
        }
      ],
      requirement: [
        {
          id: 'requirement-1',
          name: 'PR.AC-1',
          description: 'Identities and credentials are issued, managed, verified, revoked, and audited for authorized devices, users and processes',
          status: 'complete',
          coverage: 96,
          children: [
            { id: 'requirement-1-1', name: 'Identity Management' },
            { id: 'requirement-1-2', name: 'Credential Management' }
          ]
        },
        {
          id: 'requirement-2',
          name: 'PR.DS-1',
          description: 'Data-at-rest is protected',
          status: 'partial',
          coverage: 78,
          children: [
            { id: 'requirement-2-1', name: 'Storage Encryption' },
            { id: 'requirement-2-2', name: 'Database Encryption' }
          ]
        }
      ],
      policy: [
        {
          id: 'policy-1',
          name: 'Access Control Policy',
          description: 'Policy defining access control requirements',
          status: 'complete',
          coverage: 100,
          children: [
            { id: 'policy-1-1', name: 'Authentication Requirements' },
            { id: 'policy-1-2', name: 'Authorization Requirements' }
          ]
        },
        {
          id: 'policy-2',
          name: 'Data Protection Policy',
          description: 'Policy defining data protection requirements',
          status: 'complete',
          coverage: 100,
          children: [
            { id: 'policy-2-1', name: 'Encryption Requirements' },
            { id: 'policy-2-2', name: 'Data Classification' }
          ]
        }
      ],
      implementation: [
        {
          id: 'implementation-1',
          name: 'MFA Implementation',
          description: 'Implementation of multi-factor authentication',
          status: 'complete',
          coverage: 98,
          children: [
            { id: 'implementation-1-1', name: 'Admin MFA' },
            { id: 'implementation-1-2', name: 'User MFA' }
          ]
        },
        {
          id: 'implementation-2',
          name: 'Encryption Implementation',
          description: 'Implementation of data encryption',
          status: 'partial',
          coverage: 82,
          children: [
            { id: 'implementation-2-1', name: 'Database Encryption' },
            { id: 'implementation-2-2', name: 'File Encryption' }
          ]
        }
      ],
      validation: [
        {
          id: 'validation-1',
          name: 'Access Control Testing',
          description: 'Testing of access control implementations',
          status: 'complete',
          coverage: 94,
          children: [
            { id: 'validation-1-1', name: 'Authentication Testing' },
            { id: 'validation-1-2', name: 'Authorization Testing' }
          ]
        },
        {
          id: 'validation-2',
          name: 'Encryption Testing',
          description: 'Testing of encryption implementations',
          status: 'partial',
          coverage: 76,
          children: [
            { id: 'validation-2-1', name: 'Database Encryption Testing' },
            { id: 'validation-2-2', name: 'File Encryption Testing' }
          ]
        }
      ],
      monitoring: [
        {
          id: 'monitoring-1',
          name: 'Access Monitoring',
          description: 'Monitoring of access control effectiveness',
          status: 'complete',
          coverage: 92,
          children: [
            { id: 'monitoring-1-1', name: 'Authentication Monitoring' },
            { id: 'monitoring-1-2', name: 'Authorization Monitoring' }
          ]
        },
        {
          id: 'monitoring-2',
          name: 'Encryption Monitoring',
          description: 'Monitoring of encryption effectiveness',
          status: 'partial',
          coverage: 68,
          children: [
            { id: 'monitoring-2-1', name: 'Database Encryption Monitoring' },
            { id: 'monitoring-2-2', name: 'File Encryption Monitoring' }
          ]
        }
      ]
    },
    paths: [
      { id: 'path-1', name: 'Access Control Journey' },
      { id: 'path-2', name: 'Data Protection Journey' },
      { id: 'path-3', name: 'Complete Evidence Chain' }
    ]
  };

  // Render the appropriate content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'journey':
        return (
          <div className="space-y-6">
            <EvidenceJourneyMap
              data={journeyMapData}
              selectedPath={selectedPath}
              onPathSelect={handlePathSelect}
              onNodeClick={handleNodeClick}
              highlightedElement={highlightedElement}
            />
          </div>
        );
        
      case 'automation':
        return (
          <div className="space-y-6">
            <EvidenceAutomationMarketplace
              integrations={[]} // In a real app, this would come from an API
              onEnableIntegration={handleEnableIntegration}
              onDisableIntegration={handleDisableIntegration}
              onViewDetails={handleViewIntegrationDetails}
              onInstall={handleInstallIntegration}
              onConfigureIntegration={handleConfigureIntegration}
              onSearchChange={setSearchQuery}
              onFilterChange={setMarketplaceFilters}
              searchQuery={searchQuery}
              filters={marketplaceFilters}
              isLoading={loading.automation}
            />
          </div>
        );
        
      case 'suggestions':
        return (
          <div className="space-y-6">
            {/* Smart Suggestions */}
            <div className="bg-white dark:bg-secondary-800 rounded-lg border border-secondary-200 dark:border-secondary-700 p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-secondary-900 dark:text-white">Smart Evidence Suggestions</h3>
                <Button 
                  variant="secondary" 
                  size="sm"
                  leadingIcon={RefreshCw}
                  onClick={() => getSmartSuggestions({ currentEvidence: evidenceItems })}
                  disabled={loading.suggestions}
                >
                  Refresh
                </Button>
              </div>
              
              {loading.suggestions ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                  <span className="ml-3 text-secondary-600 dark:text-secondary-400">Loading suggestions...</span>
                </div>
              ) : error.suggestions ? (
                <div className="text-center py-12">
                  <AlertCircle className="w-12 h-12 text-status-error mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-secondary-900 dark:text-white mb-2">Error loading suggestions</h3>
                  <p className="text-secondary-600 dark:text-secondary-400">{error.suggestions}</p>
                </div>
              ) : suggestions.length === 0 ? (
                <div className="text-center py-12">
                  <Lightbulb className="w-12 h-12 text-secondary-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-secondary-900 dark:text-white mb-2">No suggestions available</h3>
                  <p className="text-secondary-600 dark:text-secondary-400">
                    We'll generate smart suggestions based on your evidence and compliance requirements.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {suggestions.map(suggestion => (
                    <SuggestionItem
                      key={suggestion.id}
                      suggestion={suggestion}
                      onAccept={handleAcceptSuggestion}
                      onDismiss={handleDismissSuggestion}
                    />
                  ))}
                </div>
              )}
            </div>
            
            {/* Evidence Gaps */}
            <div className="bg-white dark:bg-secondary-800 rounded-lg border border-secondary-200 dark:border-secondary-700 p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-secondary-900 dark:text-white">Evidence Gaps</h3>
                <Button 
                  variant="secondary" 
                  size="sm"
                  leadingIcon={RefreshCw}
                  onClick={() => findEvidenceGaps({ currentEvidence: evidenceItems })}
                  disabled={loading.gaps}
                >
                  Analyze
                </Button>
              </div>
              
              {loading.gaps ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                  <span className="ml-3 text-secondary-600 dark:text-secondary-400">Analyzing gaps...</span>
                </div>
              ) : error.gaps ? (
                <div className="text-center py-12">
                  <AlertCircle className="w-12 h-12 text-status-error mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-secondary-900 dark:text-white mb-2">Error analyzing gaps</h3>
                  <p className="text-secondary-600 dark:text-secondary-400">{error.gaps}</p>
                </div>
              ) : gaps.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-12 h-12 text-status-success mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-secondary-900 dark:text-white mb-2">No evidence gaps found</h3>
                  <p className="text-secondary-600 dark:text-secondary-400">
                    Your evidence coverage is complete for your current requirements.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {gaps.map(gap => (
                    <div 
                      key={gap.id}
                      className="bg-white dark:bg-secondary-800 border-l-4 border-status-error border-t border-r border-b border-secondary-200 dark:border-secondary-700 rounded-r-lg p-4"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-medium text-secondary-900 dark:text-white">{gap.requirement}</div>
                        <Badge 
                          variant={gap.severity === 'high' ? 'error' : gap.severity === 'medium' ? 'warning' : 'info'} 
                          size="sm"
                        >
                          {gap.severity.charAt(0).toUpperCase() + gap.severity.slice(1)} Severity
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-secondary-600 dark:text-secondary-400 mb-3">
                        {gap.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {gap.relatedControls.map((control, index) => (
                          <Badge key={index} variant="primary" size="sm">
                            {control}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="mt-3">
                        <h4 className="text-sm font-medium text-secondary-900 dark:text-white mb-2">Suggested Evidence:</h4>
                        <ul className="list-disc pl-5 text-sm text-secondary-600 dark:text-secondary-400">
                          {gap.suggestedEvidence.map((evidence, index) => (
                            <li key={index}>{evidence}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="flex justify-end mt-3">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => onAddEvidence()}
                        >
                          Add Evidence
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
        
      case 'evidence':
      default:
        return (
          <div className="space-y-6">
            {/* Evidence Lifecycle */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Evidence Lifecycle */}
              <div className="bg-white dark:bg-secondary-800 rounded-lg border border-secondary-200 dark:border-secondary-700 p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-secondary-900 dark:text-white">Evidence Lifecycle</h3>
                  <div className="flex gap-2">
                    <Button 
                      variant="secondary" 
                      size="sm"
                      onClick={onViewJourneyMap}
                    >
                      View Journey Map
                    </Button>
                    <Button 
                      variant="primary" 
                      size="sm"
                      leadingIcon={Plus}
                      onClick={onAddEvidence}
                    >
                      Add Evidence
                    </Button>
                  </div>
                </div>
                
                <div className="flex justify-between">
                  {lifecycleData.map((stage, index) => (
                    <LifecycleStage
                      key={index}
                      letter={stage.letter}
                      title={stage.title}
                      count={stage.count}
                      color={stage.color}
                      isLast={index === lifecycleData.length - 1}
                    />
                  ))}
                </div>
              </div>
              
              {/* Recent Evidence Activity */}
              <div className="bg-white dark:bg-secondary-800 rounded-lg border border-secondary-200 dark:border-secondary-700 p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-secondary-900 dark:text-white">Recent Evidence Activity</h3>
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={onViewAllActivity}
                  >
                    View All
                  </Button>
                </div>
                
                <div className="relative">
                  {/* Timeline vertical line */}
                  <div className="absolute left-1.5 top-4 bottom-0 w-0.5 bg-secondary-200 dark:bg-secondary-700"></div>
                  
                  {/* Timeline items */}
                  <div className="space-y-0">
                    {recentActivity.map((activity, index) => (
                      <TimelineItem
                        key={index}
                        title={activity.title}
                        timestamp={activity.timestamp}
                        source={activity.source}
                        status={activity.status}
                        tags={activity.tags}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Evidence Health Card */}
            <EvidenceHealthCard
              title="Evidence Health"
              overallScore={87}
              qualityScore={94}
              coverageScore={87}
              freshnessScore={72}
              trend={+3}
              trendPeriod="month"
              detailedMetrics={[
                { label: 'Evidence Artifacts', value: '1,247', icon: 'info', status: 'neutral' },
                { label: 'Evidence Gaps', value: '23', icon: 'alert', status: 'warning' },
                { label: 'Stale Evidence', value: '124', icon: 'alert', status: 'warning' },
                { label: 'Auto-Collected', value: '76%', icon: 'success', status: 'good' }
              ]}
              impactedAreas={[
                { name: 'Access Control', count: 42, impact: 'low' },
                { name: 'Data Protection', count: 28, impact: 'medium' },
                { name: 'Cloud Security', count: 15, impact: 'high' },
                { name: 'Incident Response', count: 8, impact: 'medium' }
              ]}
              onViewDetails={() => console.log('View detailed health report')}
            />
            
            {/* Filters Bar */}
            <div className="bg-white dark:bg-secondary-800 rounded-lg border border-secondary-200 dark:border-secondary-700 p-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-secondary-700 dark:text-secondary-300">Filter by:</span>
                  <select
                    className="text-sm border border-secondary-300 dark:border-secondary-600 rounded-md bg-white dark:bg-secondary-700 px-3 py-1.5"
                    value={evidenceTypeFilter}
                    onChange={(e) => setEvidenceTypeFilter(e.target.value)}
                  >
                    <option value="all">All Evidence Types</option>
                    <option value="intent">Intent Artifacts</option>
                    <option value="implementation">Implementation Artifacts</option>
                    <option value="behavioral">Behavioral Artifacts</option>
                    <option value="validation">Validation Artifacts</option>
                  </select>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-secondary-700 dark:text-secondary-300">Status:</span>
                  <select
                    className="text-sm border border-secondary-300 dark:border-secondary-600 rounded-md bg-white dark:bg-secondary-700 px-3 py-1.5"
                    value={filters.status || ''}
                    onChange={(e) => onFilterChange('status', e.target.value)}
                  >
                    <option value="">All Statuses</option>
                    <option value="fresh">Fresh (&lt; 30 days)</option>
                    <option value="aging">Aging (30-90 days)</option>
                    <option value="stale">Stale (&gt; 90 days)</option>
                  </select>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-secondary-700 dark:text-secondary-300">Framework:</span>
                  <select
                    className="text-sm border border-secondary-300 dark:border-secondary-600 rounded-md bg-white dark:bg-secondary-700 px-3 py-1.5"
                    value={filters.framework || ''}
                    onChange={(e) => onFilterChange('framework', e.target.value)}
                  >
                    <option value="">All Frameworks</option>
                    <option value="NIST CSF 2.0">NIST CSF 2.0</option>
                    <option value="ISO 27001">ISO 27001</option>
                    <option value="SOC 2">SOC 2</option>
                    <option value="CIS Controls">CIS Controls</option>
                  </select>
                </div>
                
                <div className="flex-1 min-w-[200px]">
                  <Input
                    placeholder="Search evidence artifacts..."
                    value={filters.search || ''}
                    onChange={(e) => onFilterChange('search', e.target.value)}
                    leadingIcon={Search}
                    onClear={() => onFilterChange('search', '')}
                    className="w-full"
                  />
                </div>
                
                <div className="flex items-center gap-2 ml-auto">
                  <Button
                    variant="secondary"
                    size="sm"
                    leadingIcon={Upload}
                    onClick={onImportEvidence}
                  >
                    Import
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    leadingIcon={Download}
                    onClick={onExportEvidence}
                  >
                    Export
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Evidence Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvidence.map((evidence, index) => (
                <EvidenceItem
                  key={index}
                  title={evidence.title}
                  description={evidence.description}
                  status={evidence.status}
                  type={evidence.type}
                  timestamp={evidence.timestamp}
                  relationships={evidence.relationships}
                  onClick={() => onViewEvidenceDetails(evidence)}
                />
              ))}
              
              {filteredEvidence.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                  <FileText className="w-12 h-12 text-secondary-400 mb-4" />
                  <h3 className="text-lg font-medium text-secondary-900 dark:text-white mb-1">No evidence artifacts found</h3>
                  <p className="text-secondary-500 dark:text-secondary-400 max-w-md mb-4">
                    {filters.search || filters.status || filters.framework || evidenceTypeFilter !== 'all'
                      ? 'Try adjusting your filters to see more results.'
                      : 'Start by adding evidence artifacts to build your compliance story.'}
                  </p>
                  <Button
                    variant="primary"
                    leadingIcon={Plus}
                    onClick={onAddEvidence}
                  >
                    Add Evidence
                  </Button>
                </div>
              )}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Header with Evidence Health */}
      <div className="bg-white dark:bg-secondary-800 rounded-lg p-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">Evidence Dashboard</h1>
            <span className="bg-secondary-100 dark:bg-secondary-700 text-secondary-600 dark:text-secondary-300 px-3 py-1 rounded-full text-sm font-medium">
              Golden Thread View
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <TabButton
              active={activeTab === 'evidence'}
              icon={LayoutGrid}
              label="Evidence"
              onClick={() => setActiveTab('evidence')}
            />
            <TabButton
              active={activeTab === 'journey'}
              icon={Map}
              label="Journey Map"
              onClick={() => setActiveTab('journey')}
            />
            <TabButton
              active={activeTab === 'automation'}
              icon={Zap}
              label="Automation"
              onClick={() => setActiveTab('automation')}
            />
            <TabButton
              active={activeTab === 'suggestions'}
              icon={Lightbulb}
              label="Suggestions"
              onClick={() => setActiveTab('suggestions')}
            />
          </div>
        </div>
        
      </div>
      
      {/* Evidence Intelligence Panel */}
      <div className="bg-gradient-to-r from-primary-600 to-purple-600 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Evidence Intelligence</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {insights.map((insight, index) => (
            <InsightItem
              key={index}
              value={insight.value}
              label={insight.label}
            />
          ))}
        </div>
      </div>
      
      {/* Tab Content */}
      {renderTabContent()}
    </div>
  );
};

EvidenceView.propTypes = {
  /**
   * Health metrics to display at the top of the dashboard
   */
  healthMetrics: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      status: PropTypes.oneOf(['excellent', 'good', 'poor'])
    })
  ).isRequired,
  
  /**
   * Insight metrics to display in the intelligence panel
   */
  insights: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      label: PropTypes.string.isRequired
    })
  ).isRequired,
  
  /**
   * Data for the evidence lifecycle visualization
   */
  lifecycleData: PropTypes.arrayOf(
    PropTypes.shape({
      letter: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      count: PropTypes.number.isRequired,
      color: PropTypes.string.isRequired
    })
  ).isRequired,
  
  /**
   * Recent activity data for the timeline
   */
  recentActivity: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      timestamp: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.shape({
          relative: PropTypes.string.isRequired,
          absolute: PropTypes.string
        })
      ]).isRequired,
      source: PropTypes.string,
      status: PropTypes.oneOf(['fresh', 'aging', 'stale']),
      tags: PropTypes.arrayOf(
        PropTypes.shape({
          label: PropTypes.string.isRequired,
          type: PropTypes.oneOf(['capability', 'risk', 'framework', 'control'])
        })
      )
    })
  ).isRequired,
  
  /**
   * Evidence items to display in the grid
   */
  evidenceItems: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      description: PropTypes.string,
      status: PropTypes.oneOf(['fresh', 'aging', 'stale']),
      type: PropTypes.string.isRequired,
      timestamp: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.shape({
          relative: PropTypes.string.isRequired,
          absolute: PropTypes.string
        })
      ]).isRequired,
      relationships: PropTypes.arrayOf(
        PropTypes.shape({
          label: PropTypes.string.isRequired,
          type: PropTypes.oneOf(['capability', 'risk', 'framework', 'control'])
        })
      )
    })
  ).isRequired,
  
  /**
   * Current filter values
   */
  filters: PropTypes.shape({
    search: PropTypes.string,
    status: PropTypes.string,
    framework: PropTypes.string
  }),
  
  /**
   * Handler for filter changes
   */
  onFilterChange: PropTypes.func.isRequired,
  
  /**
   * Handler for adding new evidence
   */
  onAddEvidence: PropTypes.func.isRequired,
  
  /**
   * Handler for viewing the evidence journey map
   */
  onViewJourneyMap: PropTypes.func,
  
  /**
   * Handler for viewing all activity
   */
  onViewAllActivity: PropTypes.func,
  
  /**
   * Handler for viewing evidence details
   */
  onViewEvidenceDetails: PropTypes.func,
  
  /**
   * Handler for importing evidence
   */
  onImportEvidence: PropTypes.func,
  
  /**
   * Handler for exporting evidence
   */
  onExportEvidence: PropTypes.func
};

EvidenceView.defaultProps = {
  filters: {},
  onViewJourneyMap: () => {},
  onViewAllActivity: () => {},
  onViewEvidenceDetails: () => {},
  onImportEvidence: () => {},
  onExportEvidence: () => {}
};

export default EvidenceView;
