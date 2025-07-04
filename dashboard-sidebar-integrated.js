// src/components/layout/DashboardSidebar.jsx
import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  FileText, 
  Shield, 
  AlertTriangle, 
  FileBarChart, 
  TrendingUp,
  ChevronRight,
  ChevronDown,
  Search,
  Plus,
  Home,
  X
} from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useDashboardState } from '../../hooks/useDashboardState';
import { VIEW_MODES } from '../../constants';

/**
 * Dashboard Sidebar Component
 * 
 * Integrated navigation sidebar with capability browsing and responsive behavior.
 * Fully integrated with the dashboard state management system.
 * 
 * Features:
 * - Main navigation with view routing
 * - Capability browser with search and filtering
 * - Collapsible sections and responsive design
 * - Integration with state management
 * - Keyboard navigation support
 * - Mobile overlay behavior
 * - Theme integration
 * - Analytics tracking
 */

const DashboardSidebar = ({
  currentView,
  onViewChange,
  expanded,
  onToggle,
  isMobile,
  capabilities = [],
  selectedCapability,
  onCapabilitySelect,
  className = '',
  ...props
}) => {
  const { getThemeClasses } = useTheme();
  const { state, actions } = useDashboardState();
  
  // Local state
  const [capabilitySearch, setCapabilitySearch] = useState('');
  const [expandedSections, setExpandedSections] = useState({
    navigation: true,
    capabilities: true,
    quickActions: false
  });

  // =============================================================================
  // NAVIGATION CONFIGURATION
  // =============================================================================

  const navigationItems = [
    {
      id: VIEW_MODES.OVERVIEW,
      label: 'Overview',
      icon: Home,
      description: 'Dashboard summary',
      shortcut: '⌘1'
    },
    {
      id: VIEW_MODES.REQUIREMENTS,
      label: 'Requirements',
      icon: FileText,
      description: 'Manage requirements',
      shortcut: '⌘2',
      badge: state.computed?.totalFilteredItems || null
    },
    {
      id: VIEW_MODES.CAPABILITIES,
      label: 'Capabilities',
      icon: Shield,
      description: 'Security capabilities',
      shortcut: '⌘3'
    },
    {
      id: VIEW_MODES.RISK,
      label: 'Risk Analysis',
      icon: AlertTriangle,
      description: 'Risk assessment',
      shortcut: '⌘4'
    },
    {
      id: VIEW_MODES.REPORTS,
      label: 'Reports',
      icon: FileBarChart,
      description: 'Generate reports',
      shortcut: '⌘5'
    },
    {
      id: VIEW_MODES.ANALYTICS,
      label: 'Analytics',
      icon: TrendingUp,
      description: 'Performance metrics',
      shortcut: '⌘6'
    }
  ];

  const quickActions = [
    {
      id: 'new-requirement',
      label: 'New Requirement',
      icon: Plus,
      action: () => actions.toggleNewCapabilityModal()
    },
    {
      id: 'upload-data',
      label: 'Upload Data',
      icon: FileText,
      action: () => actions.toggleUploadModal()
    }
  ];

  // =============================================================================
  // CAPABILITY FILTERING
  // =============================================================================

  const filteredCapabilities = capabilities.filter(capability =>
    capability.name.toLowerCase().includes(capabilitySearch.toLowerCase()) ||
    capability.description?.toLowerCase().includes(capabilitySearch.toLowerCase())
  );

  // =============================================================================
  // EVENT HANDLERS
  // =============================================================================

  const handleNavigation = (viewMode) => {
    onViewChange(viewMode);
    
    // Auto-close mobile sidebar after navigation
    if (isMobile && expanded) {
      onToggle();
    }
    
    // Track navigation
    actions.trackPageView(viewMode, { source: 'sidebar' });
  };

  const handleCapabilityClick = (capability) => {
    onCapabilitySelect(capability.id);
    
    // Navigate to requirements view with capability filter
    onViewChange(VIEW_MODES.REQUIREMENTS, {
      filter: { field: 'capability', value: capability.id }
    });
    
    // Track capability selection
    actions.trackUserAction('selectCapability', { 
      capabilityId: capability.id,
      source: 'sidebar'
    });
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // =============================================================================
  // MOBILE OVERLAY HANDLING
  // =============================================================================

  useEffect(() => {
    if (isMobile && expanded) {
      // Prevent body scroll when mobile sidebar is open
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isMobile, expanded]);

  // =============================================================================
  // RENDER COMPONENTS
  // =============================================================================

  const renderMobileOverlay = () => {
    if (!isMobile || !expanded) return null;
    
    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-20"
        onClick={onToggle}
        aria-hidden="true"
      />
    );
  };

  const renderSidebarHeader = () => (
    <div className={`
      p-4 border-b border-gray-200
      ${getThemeClasses('sidebar', 'header')}
    `}>
      <div className="flex items-center justify-between">
        {expanded && (
          <h2 className="text-lg font-semibold text-gray-900">
            Risk Dashboard
          </h2>
        )}
        
        {isMobile && (
          <button
            onClick={onToggle}
            className="p-1 rounded hover:bg-gray-100"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );

  const renderNavigationSection = () => (
    <div className="p-2">
      <button
        onClick={() => toggleSection('navigation')}
        className={`
          w-full flex items-center justify-between p-2 rounded-lg
          hover:bg-gray-100 transition-colors
          ${getThemeClasses('sidebar', 'sectionHeader')}
        `}
      >
        {expanded && (
          <>
            <span className="text-sm font-medium text-gray-700">Navigation</span>
            {expandedSections.navigation ? 
              <ChevronDown className="w-4 h-4" /> : 
              <ChevronRight className="w-4 h-4" />
            }
          </>
        )}
      </button>
      
      {(expanded ? expandedSections.navigation : true) && (
        <nav className="mt-2 space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.id)}
                className={`
                  w-full flex items-center px-3 py-2 rounded-lg text-left
                  transition-all duration-200 group
                  ${isActive 
                    ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }
                  ${getThemeClasses('sidebar', 'navItem')}
                `}
                title={expanded ? undefined : item.label}
              >
                <Icon className={`
                  w-5 h-5 flex-shrink-0
                  ${isActive ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'}
                `} />
                
                {expanded && (
                  <>
                    <div className="ml-3 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{item.label}</span>
                        {item.badge && (
                          <span className="bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                    </div>
                    
                    {item.shortcut && (
                      <span className="text-xs text-gray-400 ml-2">{item.shortcut}</span>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </nav>
      )}
    </div>
  );

  const renderCapabilitiesSection = () => (
    <div className="p-2 border-t border-gray-200">
      <button
        onClick={() => toggleSection('capabilities')}
        className={`
          w-full flex items-center justify-between p-2 rounded-lg
          hover:bg-gray-100 transition-colors
          ${getThemeClasses('sidebar', 'sectionHeader')}
        `}
      >
        {expanded && (
          <>
            <span className="text-sm font-medium text-gray-700">
              Capabilities ({filteredCapabilities.length})
            </span>
            {expandedSections.capabilities ? 
              <ChevronDown className="w-4 h-4" /> : 
              <ChevronRight className="w-4 h-4" />
            }
          </>
        )}
      </button>
      
      {expanded && expandedSections.capabilities && (
        <div className="mt-2 space-y-2">
          {/* Capability Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={capabilitySearch}
              onChange={(e) => setCapabilitySearch(e.target.value)}
              placeholder="Search capabilities..."
              className={`
                w-full pl-9 pr-3 py-2 text-sm border rounded-lg
                focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                ${getThemeClasses('sidebar', 'searchInput')}
              `}
            />
          </div>
          
          {/* Capabilities List */}
          <div className="max-h-64 overflow-y-auto space-y-1">
            {filteredCapabilities.length === 0 ? (
              <div className="text-sm text-gray-500 text-center py-4">
                {capabilities.length === 0 ? 'No capabilities found' : 'No matches found'}
              </div>
            ) : (
              filteredCapabilities.map((capability) => (
                <button
                  key={capability.id}
                  onClick={() => handleCapabilityClick(capability)}
                  className={`
                    w-full text-left p-2 rounded text-sm transition-colors
                    ${selectedCapability === capability.id
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'hover:bg-gray-50 text-gray-700'
                    }
                    ${getThemeClasses('sidebar', 'capabilityItem')}
                  `}
                >
                  <div className="font-medium">{capability.name}</div>
                  {capability.description && (
                    <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {capability.description}
                    </div>
                  )}
                  <div className="flex items-center justify-between mt-1">
                    <span className={`
                      text-xs px-2 py-1 rounded-full
                      ${capability.status === 'Completed' 
                        ? 'bg-green-100 text-green-800'
                        : capability.status === 'In Progress'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                      }
                    `}>
                      {capability.status}
                    </span>
                    {capability.requirementCount && (
                      <span className="text-xs text-gray-500">
                        {capability.requirementCount} req
                      </span>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );

  const renderQuickActionsSection = () => (
    <div className="p-2 border-t border-gray-200 mt-auto">
      <button
        onClick={() => toggleSection('quickActions')}
        className={`
          w-full flex items-center justify-between p-2 rounded-lg
          hover:bg-gray-100 transition-colors
          ${getThemeClasses('sidebar', 'sectionHeader')}
        `}
      >
        {expanded && (
          <>
            <span className="text-sm font-medium text-gray-700">Quick Actions</span>
            {expandedSections.quickActions ? 
              <ChevronDown className="w-4 h-4" /> : 
              <ChevronRight className="w-4 h-4" />
            }
          </>
        )}
      </button>
      
      {(expanded ? expandedSections.quickActions : true) && (
        <div className="mt-2 space-y-1">
          {quickActions.map((action) => {
            const Icon = action.icon;
            
            return (
              <button
                key={action.id}
                onClick={action.action}
                className={`
                  w-full flex items-center px-3 py-2 rounded-lg text-left
                  text-gray-700 hover:bg-gray-100 hover:text-gray-900
                  transition-colors group
                  ${getThemeClasses('sidebar', 'actionItem')}
                `}
                title={expanded ? undefined : action.label}
              >
                <Icon className="w-4 h-4 flex-shrink-0 text-gray-500 group-hover:text-gray-700" />
                {expanded && (
                  <span className="ml-3 text-sm font-medium">{action.label}</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderCollapseButton = () => {
    if (isMobile) return null;
    
    return (
      <div className="p-2 border-t border-gray-200">
        <button
          onClick={onToggle}
          className={`
            w-full flex items-center justify-center p-2 rounded-lg
            text-gray-500 hover:text-gray-700 hover:bg-gray-100
            transition-colors
            ${getThemeClasses('sidebar', 'collapseButton')}
          `}
          title={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          <ChevronRight className={`
            w-4 h-4 transition-transform duration-200
            ${expanded ? 'rotate-180' : ''}
          `} />
          {expanded && (
            <span className="ml-2 text-sm">Collapse</span>
          )}
        </button>
      </div>
    );
  };

  // =============================================================================
  // MAIN RENDER
  // =============================================================================

  return (
    <>
      {renderMobileOverlay()}
      
      <aside
        className={`
          dashboard-sidebar
          bg-white border-r border-gray-200 shadow-sm
          flex flex-col
          transition-all duration-200 ease-in-out
          ${isMobile 
            ? `fixed left-0 top-0 bottom-0 z-30 ${expanded ? 'translate-x-0' : '-translate-x-full'}`
            : 'relative'
          }
          ${getThemeClasses('sidebar', 'container')}
          ${className}
        `}
        style={{
          width: expanded ? '280px' : isMobile ? '280px' : '64px',
          transition: 'var(--dashboard-transition)'
        }}
        {...props}
      >
        {renderSidebarHeader()}
        
        <div className="flex-1 overflow-y-auto">
          {renderNavigationSection()}
          {renderCapabilitiesSection()}
        </div>
        
        {renderQuickActionsSection()}
        {renderCollapseButton()}
      </aside>
    </>
  );
};

export default DashboardSidebar;