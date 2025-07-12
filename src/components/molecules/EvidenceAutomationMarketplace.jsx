import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { 
  Cloud, 
  Shield, 
  Lock, 
  Server, 
  Database, 
  Code, 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Search, 
  Plus, 
  Settings, 
  Download, 
  ExternalLink, 
  Info,
  Filter
} from 'lucide-react';

/**
 * EvidenceAutomationMarketplace Component
 * 
 * Displays pre-built integrations for common evidence sources with template
 * evidence collection rules. This component shows available automation tools,
 * their status, and provides options to enable them.
 * 
 * Part of the "golden thread" architecture, this component helps automate
 * evidence collection across various systems and data sources.
 */
const EvidenceAutomationMarketplace = ({
  integrations = [],
  onEnableIntegration,
  onDisableIntegration,
  onViewDetails,
  onInstall,
  onConfigureIntegration,
  onSearchChange,
  onFilterChange,
  searchQuery = '',
  filters = {},
  isLoading = false,
  className = ''
}) => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [expandedIntegration, setExpandedIntegration] = useState(null);

  // Define integration categories
  const categories = [
    { id: 'all', label: 'All Integrations', count: integrations.length },
    { id: 'cloud', label: 'Cloud Services', icon: Cloud },
    { id: 'security', label: 'Security Tools', icon: Shield },
    { id: 'identity', label: 'Identity & Access', icon: Lock },
    { id: 'infrastructure', label: 'Infrastructure', icon: Server },
    { id: 'data', label: 'Data Sources', icon: Database },
    { id: 'devops', label: 'DevOps', icon: Code },
    { id: 'compliance', label: 'Compliance', icon: CheckCircle }
  ];

  // Get count for each category
  const getCategoryCount = useCallback((categoryId) => {
    if (categoryId === 'all') return integrations.length;
    return integrations.filter(integration => integration.category === categoryId).length;
  }, [integrations]);

  // Toggle expanded state for an integration
  const toggleExpanded = useCallback((integrationId) => {
    setExpandedIntegration(prev => prev === integrationId ? null : integrationId);
  }, []);

  // Get icon for integration based on category or provider
  const getIntegrationIcon = useCallback((integration) => {
    const iconMap = {
      cloud: Cloud,
      security: Shield,
      identity: Lock,
      infrastructure: Server,
      data: Database,
      devops: Code,
      compliance: CheckCircle,
      users: Users
    };

    // Provider-specific icons
    const providerIconMap = {
      aws: Cloud,
      azure: Cloud,
      gcp: Cloud,
      github: Code,
      gitlab: Code,
      okta: Lock,
      'azure ad': Lock,
      tenable: Shield,
      qualys: Shield,
      jira: Code,
      servicenow: Server
    };

    // Try to get provider-specific icon first
    if (integration.provider && providerIconMap[integration.provider.toLowerCase()]) {
      const ProviderIcon = providerIconMap[integration.provider.toLowerCase()];
      return <ProviderIcon className="w-6 h-6" />;
    }

    // Fall back to category icon
    if (iconMap[integration.category]) {
      const CategoryIcon = iconMap[integration.category];
      return <CategoryIcon className="w-6 h-6" />;
    }

    // Default icon
    return <Shield className="w-6 h-6" />;
  }, []);

  // Get status icon and color
  const getStatusIndicator = useCallback((status) => {
    switch (status) {
      case 'active':
        return { 
          icon: CheckCircle, 
          color: 'text-status-success',
          bgColor: 'bg-status-success bg-opacity-10',
          label: 'Active'
        };
      case 'inactive':
        return { 
          icon: Clock, 
          color: 'text-status-warning',
          bgColor: 'bg-status-warning bg-opacity-10',
          label: 'Inactive'
        };
      case 'error':
        return { 
          icon: XCircle, 
          color: 'text-status-error',
          bgColor: 'bg-status-error bg-opacity-10',
          label: 'Error'
        };
      case 'pending':
        return { 
          icon: Clock, 
          color: 'text-status-info',
          bgColor: 'bg-status-info bg-opacity-10',
          label: 'Pending'
        };
      default:
        return { 
          icon: Info, 
          color: 'text-secondary-500',
          bgColor: 'bg-secondary-100 dark:bg-secondary-700',
          label: 'Unknown'
        };
    }
  }, []);

  // Filter integrations based on active category and search
  const filteredIntegrations = integrations.filter(integration => {
    // Filter by category
    if (activeCategory !== 'all' && integration.category !== activeCategory) {
      return false;
    }

    // Filter by search query
    if (searchQuery && !integration.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !integration.description.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !integration.provider.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Filter by status if specified
    if (filters.status && integration.status !== filters.status) {
      return false;
    }

    // Filter by data type if specified
    if (filters.dataType && !integration.dataTypes.includes(filters.dataType)) {
      return false;
    }

    // Filter by framework if specified
    if (filters.framework && !integration.frameworks.some(f => 
      f.toLowerCase().includes(filters.framework.toLowerCase())
    )) {
      return false;
    }

    return true;
  });

  // If no integrations data is provided, show placeholder data
  const placeholderIntegrations = [
    {
      id: 'aws-config',
      name: 'AWS Config',
      provider: 'AWS',
      category: 'cloud',
      description: 'Automatically collect configuration compliance evidence from AWS resources',
      status: 'active',
      dataTypes: ['configuration', 'compliance', 'infrastructure'],
      frameworks: ['NIST CSF', 'ISO 27001', 'CIS AWS'],
      evidenceTypes: ['Implementation', 'Validation'],
      collectionFrequency: 'Daily',
      lastCollection: '2025-07-11T14:30:00Z',
      templateRules: [
        { name: 'S3 Bucket Encryption', description: 'Collect evidence of S3 bucket encryption settings' },
        { name: 'Security Group Rules', description: 'Collect evidence of security group configurations' },
        { name: 'IAM Policy Compliance', description: 'Collect evidence of IAM policy compliance with best practices' }
      ]
    },
    {
      id: 'azure-policy',
      name: 'Azure Policy',
      provider: 'Azure',
      category: 'cloud',
      description: 'Collect compliance evidence from Azure Policy assessments',
      status: 'active',
      dataTypes: ['configuration', 'compliance', 'infrastructure'],
      frameworks: ['NIST CSF', 'ISO 27001', 'CIS Azure'],
      evidenceTypes: ['Implementation', 'Validation'],
      collectionFrequency: 'Daily',
      lastCollection: '2025-07-11T15:45:00Z',
      templateRules: [
        { name: 'Storage Account Encryption', description: 'Collect evidence of storage account encryption settings' },
        { name: 'Network Security Groups', description: 'Collect evidence of NSG configurations' },
        { name: 'RBAC Assignments', description: 'Collect evidence of RBAC role assignments' }
      ]
    },
    {
      id: 'github-actions',
      name: 'GitHub Actions',
      provider: 'GitHub',
      category: 'devops',
      description: 'Collect evidence of secure development practices from GitHub',
      status: 'inactive',
      dataTypes: ['code', 'cicd', 'security'],
      frameworks: ['NIST SSDF', 'ISO 27001', 'OWASP'],
      evidenceTypes: ['Implementation', 'Behavioral'],
      collectionFrequency: 'On commit',
      lastCollection: null,
      templateRules: [
        { name: 'Code Scanning Results', description: 'Collect evidence from code scanning and SAST tools' },
        { name: 'Branch Protection', description: 'Collect evidence of branch protection rules' },
        { name: 'PR Approvals', description: 'Collect evidence of pull request approval processes' }
      ]
    },
    {
      id: 'okta-reports',
      name: 'Okta Identity',
      provider: 'Okta',
      category: 'identity',
      description: 'Collect identity and access management evidence from Okta',
      status: 'active',
      dataTypes: ['identity', 'access', 'authentication'],
      frameworks: ['NIST CSF', 'ISO 27001', 'SOC 2'],
      evidenceTypes: ['Implementation', 'Behavioral'],
      collectionFrequency: 'Daily',
      lastCollection: '2025-07-11T12:15:00Z',
      templateRules: [
        { name: 'MFA Enforcement', description: 'Collect evidence of MFA enforcement for all users' },
        { name: 'Access Reviews', description: 'Collect evidence of completed access reviews' },
        { name: 'Authentication Logs', description: 'Collect authentication attempt logs and anomalies' }
      ]
    },
    {
      id: 'tenable-io',
      name: 'Tenable.io',
      provider: 'Tenable',
      category: 'security',
      description: 'Collect vulnerability management evidence from Tenable.io',
      status: 'error',
      dataTypes: ['vulnerability', 'security', 'risk'],
      frameworks: ['NIST CSF', 'ISO 27001', 'CIS'],
      evidenceTypes: ['Validation', 'Behavioral'],
      collectionFrequency: 'Weekly',
      lastCollection: '2025-07-05T09:30:00Z',
      templateRules: [
        { name: 'Vulnerability Scans', description: 'Collect evidence of regular vulnerability scanning' },
        { name: 'Remediation SLAs', description: 'Collect evidence of vulnerability remediation within SLAs' },
        { name: 'Critical Findings', description: 'Collect evidence of critical vulnerability management' }
      ]
    },
    {
      id: 'servicenow-grc',
      name: 'ServiceNow GRC',
      provider: 'ServiceNow',
      category: 'compliance',
      description: 'Collect governance, risk, and compliance evidence from ServiceNow',
      status: 'pending',
      dataTypes: ['policy', 'compliance', 'risk'],
      frameworks: ['NIST CSF', 'ISO 27001', 'SOC 2', 'GDPR'],
      evidenceTypes: ['Intent', 'Implementation', 'Validation'],
      collectionFrequency: 'Weekly',
      lastCollection: null,
      templateRules: [
        { name: 'Policy Attestations', description: 'Collect evidence of policy attestations and acknowledgments' },
        { name: 'Control Assessments', description: 'Collect evidence of control assessments and testing' },
        { name: 'Risk Assessments', description: 'Collect evidence of risk assessments and treatments' }
      ]
    },
    {
      id: 'crowdstrike',
      name: 'CrowdStrike Falcon',
      provider: 'CrowdStrike',
      category: 'security',
      description: 'Collect endpoint security evidence from CrowdStrike Falcon',
      status: 'inactive',
      dataTypes: ['endpoint', 'security', 'threat'],
      frameworks: ['NIST CSF', 'ISO 27001', 'CIS'],
      evidenceTypes: ['Implementation', 'Behavioral'],
      collectionFrequency: 'Daily',
      lastCollection: null,
      templateRules: [
        { name: 'Endpoint Coverage', description: 'Collect evidence of endpoint protection coverage' },
        { name: 'Threat Detections', description: 'Collect evidence of threat detections and responses' },
        { name: 'Policy Compliance', description: 'Collect evidence of endpoint policy compliance' }
      ]
    },
    {
      id: 'splunk',
      name: 'Splunk SIEM',
      provider: 'Splunk',
      category: 'security',
      description: 'Collect security monitoring evidence from Splunk',
      status: 'active',
      dataTypes: ['logs', 'security', 'monitoring'],
      frameworks: ['NIST CSF', 'ISO 27001', 'SOC 2'],
      evidenceTypes: ['Behavioral', 'Validation'],
      collectionFrequency: 'Daily',
      lastCollection: '2025-07-11T16:00:00Z',
      templateRules: [
        { name: 'Security Alerts', description: 'Collect evidence of security alert monitoring and response' },
        { name: 'Log Coverage', description: 'Collect evidence of log source coverage and completeness' },
        { name: 'SIEM Rules', description: 'Collect evidence of SIEM rule effectiveness and coverage' }
      ]
    }
  ];

  // Use placeholder data if no integrations are provided
  const displayIntegrations = integrations.length > 0 ? filteredIntegrations : placeholderIntegrations;

  return (
    <div className={`bg-white dark:bg-secondary-800 rounded-lg border border-secondary-200 dark:border-secondary-700 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-secondary-200 dark:border-secondary-700">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h3 className="text-lg font-semibold text-secondary-900 dark:text-white">
            Evidence Automation Marketplace
          </h3>
          
          {/* Search and filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search integrations..."
                className="pl-9 pr-4 py-2 w-full sm:w-64 rounded-md border border-secondary-300 dark:border-secondary-600 bg-white dark:bg-secondary-700 text-secondary-900 dark:text-white"
                value={searchQuery}
                onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-secondary-400 dark:text-secondary-500" />
            </div>
            
            <button
              className="flex items-center px-3 py-2 rounded-md border border-secondary-300 dark:border-secondary-600 bg-white dark:bg-secondary-700 text-secondary-700 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-secondary-600"
              onClick={() => onFilterChange && onFilterChange({ showFilters: true })}
            >
              <Filter className="w-4 h-4 mr-2" />
              <span>Filters</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Category tabs */}
      <div className="border-b border-secondary-200 dark:border-secondary-700 overflow-x-auto">
        <div className="flex whitespace-nowrap px-4">
          {categories.map(category => (
            <button
              key={category.id}
              className={`px-4 py-3 flex items-center border-b-2 font-medium text-sm transition-colors
                ${activeCategory === category.id 
                  ? 'border-primary-600 text-primary-600 dark:text-primary-400 dark:border-primary-400' 
                  : 'border-transparent text-secondary-600 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-white hover:border-secondary-300 dark:hover:border-secondary-600'
                }
              `}
              onClick={() => setActiveCategory(category.id)}
            >
              {category.icon && <category.icon className="w-4 h-4 mr-2" />}
              {category.label}
              <span className="ml-2 bg-secondary-100 dark:bg-secondary-700 text-secondary-600 dark:text-secondary-400 rounded-full px-2 py-0.5 text-xs">
                {getCategoryCount(category.id)}
              </span>
            </button>
          ))}
        </div>
      </div>
      
      {/* Integration cards */}
      <div className="p-6">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <span className="ml-3 text-secondary-600 dark:text-secondary-400">Loading integrations...</span>
          </div>
        ) : displayIntegrations.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary-100 dark:bg-secondary-700 mb-4">
              <Info className="w-8 h-8 text-secondary-500 dark:text-secondary-400" />
            </div>
            <h3 className="text-lg font-medium text-secondary-900 dark:text-white mb-2">No integrations found</h3>
            <p className="text-secondary-600 dark:text-secondary-400 max-w-md mx-auto">
              Try adjusting your search or filters to find available evidence automation integrations.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayIntegrations.map(integration => {
              const statusInfo = getStatusIndicator(integration.status);
              const StatusIcon = statusInfo.icon;
              const isExpanded = expandedIntegration === integration.id;
              
              return (
                <div
                  key={integration.id}
                  className={`border rounded-lg transition-all ${
                    isExpanded 
                      ? 'border-primary-500 dark:border-primary-400 shadow-md' 
                      : 'border-secondary-200 dark:border-secondary-700 hover:border-secondary-300 dark:hover:border-secondary-600'
                  }`}
                >
                  {/* Integration header */}
                  <div 
                    className="p-4 cursor-pointer"
                    onClick={() => toggleExpanded(integration.id)}
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-10 h-10 rounded-md bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mr-3">
                        {getIntegrationIcon(integration)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="text-base font-medium text-secondary-900 dark:text-white truncate">
                          {integration.name}
                        </h4>
                        <p className="text-sm text-secondary-500 dark:text-secondary-400">
                          {integration.provider}
                        </p>
                      </div>
                      
                      <div className={`flex-shrink-0 px-2 py-1 rounded-full ${statusInfo.bgColor}`}>
                        <div className="flex items-center">
                          <StatusIcon className={`w-3.5 h-3.5 mr-1 ${statusInfo.color}`} />
                          <span className={`text-xs font-medium ${statusInfo.color}`}>
                            {statusInfo.label}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <p className="mt-2 text-sm text-secondary-600 dark:text-secondary-400 line-clamp-2">
                      {integration.description}
                    </p>
                    
                    {/* Tags */}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {integration.evidenceTypes && integration.evidenceTypes.slice(0, 2).map(type => (
                        <span 
                          key={type} 
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-secondary-100 dark:bg-secondary-700 text-secondary-800 dark:text-secondary-300"
                        >
                          {type}
                        </span>
                      ))}
                      
                      {integration.frameworks && integration.frameworks.slice(0, 1).map(framework => (
                        <span 
                          key={framework} 
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"
                        >
                          {framework}
                        </span>
                      ))}
                      
                      {(integration.evidenceTypes && integration.evidenceTypes.length > 2) || 
                       (integration.frameworks && integration.frameworks.length > 1) ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-secondary-100 dark:bg-secondary-700 text-secondary-800 dark:text-secondary-300">
                          +{(integration.evidenceTypes?.length || 0) - 2 + (integration.frameworks?.length || 0) - 1} more
                        </span>
                      ) : null}
                    </div>
                  </div>
                  
                  {/* Expanded content */}
                  {isExpanded && (
                    <div className="border-t border-secondary-200 dark:border-secondary-700 p-4">
                      {/* Collection information */}
                      <div className="mb-4">
                        <h5 className="text-sm font-medium text-secondary-900 dark:text-white mb-2">
                          Collection Information
                        </h5>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                          <div className="text-secondary-500 dark:text-secondary-400">Frequency:</div>
                          <div className="text-secondary-900 dark:text-white">{integration.collectionFrequency || 'N/A'}</div>
                          
                          <div className="text-secondary-500 dark:text-secondary-400">Last Collection:</div>
                          <div className="text-secondary-900 dark:text-white">
                            {integration.lastCollection 
                              ? new Date(integration.lastCollection).toLocaleString() 
                              : 'Never'}
                          </div>
                          
                          <div className="text-secondary-500 dark:text-secondary-400">Evidence Types:</div>
                          <div className="text-secondary-900 dark:text-white">
                            {integration.evidenceTypes?.join(', ') || 'N/A'}
                          </div>
                          
                          <div className="text-secondary-500 dark:text-secondary-400">Frameworks:</div>
                          <div className="text-secondary-900 dark:text-white">
                            {integration.frameworks?.join(', ') || 'N/A'}
                          </div>
                        </div>
                      </div>
                      
                      {/* Template rules */}
                      {integration.templateRules && integration.templateRules.length > 0 && (
                        <div className="mb-4">
                          <h5 className="text-sm font-medium text-secondary-900 dark:text-white mb-2">
                            Template Rules
                          </h5>
                          <div className="space-y-2">
                            {integration.templateRules.map((rule, index) => (
                              <div 
                                key={index}
                                className="p-2 rounded-md bg-secondary-50 dark:bg-secondary-800/50 border border-secondary-200 dark:border-secondary-700"
                              >
                                <div className="font-medium text-sm text-secondary-900 dark:text-white">
                                  {rule.name}
                                </div>
                                <div className="text-xs text-secondary-600 dark:text-secondary-400">
                                  {rule.description}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Action buttons */}
                      <div className="flex flex-wrap gap-2">
                        {integration.status === 'active' ? (
                          <button
                            className="flex items-center px-3 py-1.5 rounded-md border border-secondary-300 dark:border-secondary-600 bg-white dark:bg-secondary-700 text-secondary-700 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-secondary-600 text-sm"
                            onClick={() => onDisableIntegration && onDisableIntegration(integration.id)}
                          >
                            <XCircle className="w-4 h-4 mr-1.5" />
                            Disable
                          </button>
                        ) : (
                          <button
                            className="flex items-center px-3 py-1.5 rounded-md border border-primary-600 dark:border-primary-500 bg-primary-600 dark:bg-primary-500 text-white hover:bg-primary-700 dark:hover:bg-primary-600 text-sm"
                            onClick={() => onEnableIntegration && onEnableIntegration(integration.id)}
                          >
                            <CheckCircle className="w-4 h-4 mr-1.5" />
                            Enable
                          </button>
                        )}
                        
                        <button
                          className="flex items-center px-3 py-1.5 rounded-md border border-secondary-300 dark:border-secondary-600 bg-white dark:bg-secondary-700 text-secondary-700 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-secondary-600 text-sm"
                          onClick={() => onConfigureIntegration && onConfigureIntegration(integration.id)}
                        >
                          <Settings className="w-4 h-4 mr-1.5" />
                          Configure
                        </button>
                        
                        <button
                          className="flex items-center px-3 py-1.5 rounded-md border border-secondary-300 dark:border-secondary-600 bg-white dark:bg-secondary-700 text-secondary-700 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-secondary-600 text-sm"
                          onClick={() => onViewDetails && onViewDetails(integration.id)}
                        >
                          <ExternalLink className="w-4 h-4 mr-1.5" />
                          Details
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Add new integration button */}
      <div className="px-6 py-4 border-t border-secondary-200 dark:border-secondary-700 flex justify-between items-center">
        <button
          className="flex items-center text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
          onClick={() => onInstall && onInstall()}
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Add New Integration
        </button>
        
        <button
          className="flex items-center text-secondary-600 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-white"
          onClick={() => window.open('https://docs.example.com/evidence-automation', '_blank')}
        >
          <Info className="w-4 h-4 mr-1.5" />
          Documentation
        </button>
      </div>
    </div>
  );
};

EvidenceAutomationMarketplace.propTypes = {
  /**
   * Array of integration objects
   */
  integrations: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      provider: PropTypes.string.isRequired,
      category: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      status: PropTypes.oneOf(['active', 'inactive', 'error', 'pending']).isRequired,
      dataTypes: PropTypes.arrayOf(PropTypes.string),
      frameworks: PropTypes.arrayOf(PropTypes.string),
      evidenceTypes: PropTypes.arrayOf(PropTypes.string),
      collectionFrequency: PropTypes.string,
      lastCollection: PropTypes.string,
      templateRules: PropTypes.arrayOf(
        PropTypes.shape({
          name: PropTypes.string.isRequired,
          description: PropTypes.string.isRequired
        })
      )
    })
  ),
  
  /**
   * Handler for enabling an integration
   */
  onEnableIntegration: PropTypes.func,
  
  /**
   * Handler for disabling an integration
   */
  onDisableIntegration: PropTypes.func,
  
  /**
   * Handler for viewing integration details
   */
  onViewDetails: PropTypes.func,
  
  /**
   * Handler for installing a new integration
   */
  onInstall: PropTypes.func,
  
  /**
   * Handler for configuring an integration
   */
  onConfigureIntegration: PropTypes.func,
  
  /**
   * Handler for search input changes
   */
  onSearchChange: PropTypes.func,
  
  /**
   * Handler for filter changes
   */
  onFilterChange: PropTypes.func,
  
  /**
   * Current search query
   */
  searchQuery: PropTypes.string,
  
  /**
   * Current filters
   */
  filters: PropTypes.object,
  
  /**
   * Loading state
   */
  isLoading: PropTypes.bool,
  
  /**
   * Additional CSS classes
   */
  className: PropTypes.string
};

export default EvidenceAutomationMarketplace;
