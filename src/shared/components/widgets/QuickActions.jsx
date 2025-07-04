// src/components/widgets/QuickActions.jsx
import React, { useState } from 'react';
import { 
  Lightbulb, Network, Shield, Target, AlertTriangle, Download, 
  BarChart3, Settings, Activity, Plus, Upload, FileText, 
  Users, Calendar, Bell, Search, Filter, RefreshCw, Share,
  Eye, Edit, Trash2, Copy, ExternalLink, BookOpen, HelpCircle
} from 'lucide-react';

/**
 * Quick Actions Widget Component
 * 
 * Provides a grid of commonly used actions and shortcuts for the dashboard.
 * Configurable action sets for different contexts and user roles.
 * 
 * Features:
 * - Predefined action sets (overview, management, analytics)
 * - Custom action configurations
 * - Icon-based visual design
 * - Responsive grid layout
 * - Hover effects and animations
 * - Keyboard navigation support
 * - Flexible sizing options
 */
const QuickActions = ({
  actionSet = 'overview', // 'overview', 'management', 'analytics', 'custom'
  customActions = [],
  onAction,
  maxColumns = 8,
  compact = false,
  showLabels = true,
  className = ''
}) => {

  const [hoveredAction, setHoveredAction] = useState(null);

  // Predefined action sets
  const actionSets = {
    overview: [
      {
        id: 'view-capabilities',
        label: 'View Capabilities',
        description: 'Manage security capabilities and requirements',
        icon: Network,
        color: 'blue',
        action: () => onAction?.('navigate', { viewMode: 'capabilities' })
      },
      {
        id: 'threat-intel',
        label: 'Threat Intel',
        description: 'Real-time threat monitoring and analysis',
        icon: Shield,
        color: 'red',
        action: () => onAction?.('navigate', { viewMode: 'threat-intelligence' })
      },
      {
        id: 'mitre-navigator',
        label: 'MITRE Navigator',
        description: 'Attack technique visualization and analysis',
        icon: Target,
        color: 'indigo',
        action: () => onAction?.('navigate', { viewMode: 'mitre-navigator' })
      },
      {
        id: 'risk-management',
        label: 'Risk Management',
        description: 'Assess and mitigate operational risks',
        icon: AlertTriangle,
        color: 'red',
        action: () => onAction?.('navigate', { viewMode: 'risk-management' })
      },
      {
        id: 'export-data',
        label: 'Export Data',
        description: 'Download requirements and analytics data',
        icon: Download,
        color: 'orange',
        action: () => onAction?.('export')
      },
      {
        id: 'view-analytics',
        label: 'View Analytics',
        description: 'Performance metrics and business intelligence',
        icon: BarChart3,
        color: 'purple',
        action: () => onAction?.('navigate', { viewMode: 'analytics' })
      },
      {
        id: 'threat-settings',
        label: 'Threat Settings',
        description: 'Configure threat intelligence sources',
        icon: Settings,
        color: 'indigo',
        action: () => onAction?.('openModal', { modalAction: 'toggleThreatSettingsModal' })
      },
      {
        id: 'system-diagnostics',
        label: 'System Diagnostics',
        description: 'Check system health and performance',
        icon: Activity,
        color: 'gray',
        action: () => onAction?.('navigate', { viewMode: 'diagnostics' })
      }
    ],
    management: [
      {
        id: 'create-requirement',
        label: 'New Requirement',
        description: 'Create a new security requirement',
        icon: Plus,
        color: 'blue',
        action: () => onAction?.('create', { type: 'requirement' })
      },
      {
        id: 'create-capability',
        label: 'New Capability',
        description: 'Add a new security capability',
        icon: Network,
        color: 'green',
        action: () => onAction?.('create', { type: 'capability' })
      },
      {
        id: 'import-data',
        label: 'Import Data',
        description: 'Upload CSV data or bulk import',
        icon: Upload,
        color: 'indigo',
        action: () => onAction?.('openModal', { modalAction: 'toggleUploadModal' })
      },
      {
        id: 'manage-users',
        label: 'Manage Users',
        description: 'User roles and permissions',
        icon: Users,
        color: 'purple',
        action: () => onAction?.('navigate', { viewMode: 'user-management' })
      },
      {
        id: 'schedule-review',
        label: 'Schedule Review',
        description: 'Plan requirement reviews and audits',
        icon: Calendar,
        color: 'yellow',
        action: () => onAction?.('schedule', { type: 'review' })
      },
      {
        id: 'bulk-edit',
        label: 'Bulk Edit',
        description: 'Edit multiple requirements at once',
        icon: Edit,
        color: 'orange',
        action: () => onAction?.('bulkEdit')
      },
      {
        id: 'configure-alerts',
        label: 'Configure Alerts',
        description: 'Set up notifications and alerts',
        icon: Bell,
        color: 'red',
        action: () => onAction?.('configure', { type: 'alerts' })
      },
      {
        id: 'data-cleanup',
        label: 'Data Cleanup',
        description: 'Archive or purge old data',
        icon: Trash2,
        color: 'red',
        action: () => onAction?.('openModal', { modalAction: 'togglePurgeModal' })
      }
    ],
    analytics: [
      {
        id: 'generate-report',
        label: 'Generate Report',
        description: 'Create comprehensive analytics report',
        icon: FileText,
        color: 'blue',
        action: () => onAction?.('generate', { type: 'report' })
      },
      {
        id: 'trend-analysis',
        label: 'Trend Analysis',
        description: 'Analyze performance trends over time',
        icon: BarChart3,
        color: 'green',
        action: () => onAction?.('analyze', { type: 'trends' })
      },
      {
        id: 'search-data',
        label: 'Search Data',
        description: 'Advanced search and filtering',
        icon: Search,
        color: 'purple',
        action: () => onAction?.('search')
      },
      {
        id: 'apply-filters',
        label: 'Apply Filters',
        description: 'Filter data by multiple criteria',
        icon: Filter,
        color: 'indigo',
        action: () => onAction?.('filter')
      },
      {
        id: 'refresh-data',
        label: 'Refresh Data',
        description: 'Update all analytics data sources',
        icon: RefreshCw,
        color: 'blue',
        action: () => onAction?.('refresh')
      },
      {
        id: 'share-insights',
        label: 'Share Insights',
        description: 'Share analytics with stakeholders',
        icon: Share,
        color: 'orange',
        action: () => onAction?.('share', { type: 'insights' })
      },
      {
        id: 'export-charts',
        label: 'Export Charts',
        description: 'Download charts and visualizations',
        icon: Download,
        color: 'teal',
        action: () => onAction?.('export', { type: 'charts' })
      },
      {
        id: 'view-raw-data',
        label: 'View Raw Data',
        description: 'Access underlying data tables',
        icon: Eye,
        color: 'gray',
        action: () => onAction?.('view', { type: 'raw-data' })
      }
    ]
  };

  // Get actions based on set or use custom
  const getActions = () => {
    if (actionSet === 'custom' && customActions.length > 0) {
      return customActions;
    }
    return actionSets[actionSet] || actionSets.overview;
  };

  // Color configurations
  const colorConfig = {
    blue: 'bg-blue-50 hover:bg-blue-100 text-blue-700',
    red: 'bg-red-50 hover:bg-red-100 text-red-700',
    green: 'bg-green-50 hover:bg-green-100 text-green-700',
    yellow: 'bg-yellow-50 hover:bg-yellow-100 text-yellow-700',
    purple: 'bg-purple-50 hover:bg-purple-100 text-purple-700',
    indigo: 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700',
    orange: 'bg-orange-50 hover:bg-orange-100 text-orange-700',
    teal: 'bg-teal-50 hover:bg-teal-100 text-teal-700',
    gray: 'bg-gray-50 hover:bg-gray-100 text-gray-700'
  };

  // Handle action click
  const handleActionClick = (action) => {
    if (action.action) {
      action.action();
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e, action) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleActionClick(action);
    }
  };

  const actions = getActions();

  return (
    <div className={`bg-white rounded-xl shadow-md p-6 ${className}`}>
      {/* Header */}
      <h3 className={`font-semibold text-gray-900 mb-4 flex items-center ${compact ? 'text-base' : 'text-lg'}`}>
        <Lightbulb className={`mr-2 text-yellow-500 ${compact ? 'h-4 w-4' : 'h-5 w-5'}`} />
        Quick Actions
      </h3>

      {/* Actions Grid */}
      <div 
        className={`grid gap-3 ${
          maxColumns <= 4 ? `grid-cols-2 sm:grid-cols-${maxColumns}` :
          maxColumns <= 6 ? `grid-cols-2 sm:grid-cols-4 lg:grid-cols-${maxColumns}` :
          `grid-cols-2 sm:grid-cols-4 lg:grid-cols-${maxColumns}`
        }`}
      >
        {actions.map((action) => {
          const Icon = action.icon;
          const isHovered = hoveredAction === action.id;

          return (
            <button
              key={action.id}
              onClick={() => handleActionClick(action)}
              onKeyDown={(e) => handleKeyDown(e, action)}
              onMouseEnter={() => setHoveredAction(action.id)}
              onMouseLeave={() => setHoveredAction(null)}
              className={`
                flex flex-col items-center p-4 rounded-lg transition-all duration-200 group
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
                ${colorConfig[action.color] || colorConfig.blue}
                ${compact ? 'p-3' : 'p-4'}
                ${isHovered ? 'transform scale-105 shadow-md' : ''}
              `}
              title={action.description}
              aria-label={action.label}
            >
              {/* Icon */}
              <Icon 
                className={`mb-2 group-hover:scale-110 transition-transform duration-200 ${
                  compact ? 'h-5 w-5' : 'h-6 w-6'
                }`} 
              />
              
              {/* Label */}
              {showLabels && (
                <span className={`text-center font-medium leading-tight ${
                  compact ? 'text-xs' : 'text-xs'
                }`}>
                  {action.label}
                </span>
              )}

              {/* Hover Description */}
              {isHovered && action.description && !compact && (
                <div className="absolute z-10 mt-2 px-3 py-2 text-xs text-white bg-gray-900 rounded-lg shadow-lg opacity-90 pointer-events-none transform translate-y-full">
                  {action.description}
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Action Set Switcher (if multiple sets available) */}
      {actionSet !== 'custom' && !compact && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex justify-center space-x-2">
            {Object.keys(actionSets).map((setKey) => (
              <button
                key={setKey}
                onClick={() => onAction?.('switchActionSet', { actionSet: setKey })}
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  actionSet === setKey
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {setKey.charAt(0).toUpperCase() + setKey.slice(1)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Help Text */}
      {!compact && (
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500 flex items-center justify-center">
            <HelpCircle className="h-3 w-3 mr-1" />
            Click any action to get started, or hover for more details
          </p>
        </div>
      )}
    </div>
  );
};

// Pre-configured quick action components
export const OverviewQuickActions = (props) => (
  <QuickActions actionSet="overview" {...props} />
);

export const ManagementQuickActions = (props) => (
  <QuickActions actionSet="management" {...props} />
);

export const AnalyticsQuickActions = (props) => (
  <QuickActions actionSet="analytics" {...props} />
);

export const CompactQuickActions = (props) => (
  <QuickActions compact={true} maxColumns={4} {...props} />
);

export default QuickActions;