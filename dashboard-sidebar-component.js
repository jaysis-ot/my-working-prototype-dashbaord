// src/components/dashboard/DashboardSidebar.jsx
import React from 'react';
import { 
  TrendingUp, Building2, Network, FileText, Shield, Target, AlertTriangle,
  Gauge, Star, BarChart3, Activity, Settings, Upload, Download, Trash2,
  ChevronLeft, ChevronRight, X, Menu
} from 'lucide-react';
import { dashboardActions } from '../../store/dashboardActions';

/**
 * Dashboard Sidebar Navigation Component
 * 
 * Provides the main navigation interface for the dashboard.
 * Features:
 * - Responsive design (collapsible on desktop, overlay on mobile)
 * - Theme-aware styling
 * - Dynamic company branding
 * - Data management tools
 * - Keyboard navigation support
 */
const DashboardSidebar = ({ 
  state, 
  dispatch, 
  currentTheme, 
  companyProfile,
  onExportCSV,
  requirementsCount = 0,
  isLoading = false
}) => {
  // Navigation items configuration
  const navigationItems = [
    { id: 'overview', name: 'Overview', icon: TrendingUp, description: 'Dashboard summary' },
    { id: 'company-profile', name: 'Company Profile', icon: Building2, description: 'Company information' },
    { id: 'capabilities', name: 'Capabilities', icon: Network, description: 'Security capabilities' },
    { id: 'requirements', name: 'Requirements', icon: FileText, description: 'Security requirements' },
    { id: 'threat-intelligence', name: 'Threat Intelligence', icon: Shield, description: 'Threat monitoring' },
    { id: 'mitre-navigator', name: 'MITRE ATT&CK Navigator', icon: Target, description: 'Attack techniques' },
    { id: 'risk-management', name: 'Risks', icon: AlertTriangle, description: 'Risk management' },
    { id: 'pcd', name: 'PCD Breakdown', icon: Building2, description: 'PCD analysis' },
    { id: 'maturity', name: 'Maturity Analysis', icon: Gauge, description: 'Maturity assessment' },
    { id: 'justification', name: 'Business Value', icon: Star, description: 'Value analysis' },
    { id: 'analytics', name: 'Analytics', icon: BarChart3, description: 'Data analytics' },
    { id: 'diagnostics', name: 'System Diagnostics', icon: Activity, description: 'System health' },
    { id: 'settings', name: 'System Settings', icon: Settings, description: 'Configuration' }
  ];

  // Data management tools
  const dataManagementTools = [
    {
      id: 'upload',
      name: 'Upload CSV',
      icon: Upload,
      action: () => dispatch(dashboardActions.toggleUploadModal()),
      disabled: isLoading
    },
    {
      id: 'export',
      name: 'Export CSV',
      icon: Download,
      action: onExportCSV,
      disabled: requirementsCount === 0
    },
    {
      id: 'threat-settings',
      name: 'Threat Settings',
      icon: Settings,
      action: () => dispatch(dashboardActions.toggleThreatSettingsModal()),
      disabled: isLoading
    },
    {
      id: 'purge',
      name: 'Purge Data',
      icon: Trash2,
      action: () => dispatch(dashboardActions.togglePurgeModal()),
      disabled: requirementsCount === 0,
      dangerous: true
    }
  ];

  // Dynamic sidebar title based on company profile
  const getSidebarTitle = () => {
    if (companyProfile?.companyName && companyProfile.companyName.trim()) {
      const companyName = companyProfile.companyName.split(' ')[0];
      return `${companyName} Portal`;
    }
    return 'Cyber Trust Portal';
  };

  // Handle navigation
  const handleNavigation = (viewMode) => {
    dispatch(dashboardActions.setViewMode(viewMode));
    
    // Auto-close sidebar on mobile after navigation
    if (state.ui.isMobile && state.ui.sidebarExpanded) {
      dispatch(dashboardActions.toggleSidebar());
    }
  };

  // Theme-aware classes
  const getThemeClasses = () => {
    if (currentTheme === 'stripe') {
      return {
        sidebar: 'sidebar-gradient',
        border: 'border-white border-opacity-20',
        text: {
          primary: 'text-white',
          secondary: 'text-white text-opacity-70',
          muted: 'text-white text-opacity-80'
        },
        button: {
          base: 'text-white text-opacity-80 hover:bg-white hover:bg-opacity-20 hover:text-white focus:ring-white focus:ring-opacity-50',
          active: 'bg-white bg-opacity-30 text-white shadow-lg backdrop-blur-sm',
          danger: 'text-red-400 hover:bg-red-900 hover:bg-opacity-20'
        },
        activeIndicator: 'bg-white bg-opacity-60'
      };
    }
    
    return {
      sidebar: 'bg-gray-900',
      border: 'border-gray-700',
      text: {
        primary: 'text-white',
        secondary: 'text-gray-300',
        muted: 'text-gray-300'
      },
      button: {
        base: 'text-gray-300 hover:bg-blue-600 hover:text-white focus:ring-blue-500',
        active: 'bg-blue-600 text-white shadow-lg',
        danger: 'text-red-400 hover:bg-red-900 hover:bg-opacity-20'
      },
      activeIndicator: 'bg-blue-400'
    };
  };

  const themeClasses = getThemeClasses();

  return (
    <>
      {/* Mobile backdrop */}
      {state.ui.isMobile && state.ui.sidebarExpanded && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => dispatch(dashboardActions.toggleSidebar())}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <nav 
        className={`
          ${themeClasses.sidebar} text-white flex flex-col transition-all duration-300 z-50
          ${state.ui.isMobile 
            ? state.ui.sidebarExpanded 
              ? 'fixed inset-y-0 left-0 w-64 shadow-2xl' 
              : 'hidden'
            : state.ui.sidebarExpanded 
              ? 'relative w-64' 
              : 'relative w-16'
          }
        `}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Header */}
        <div className={`p-4 border-b ${themeClasses.border}`}>
          <div className="flex items-center justify-between">
            {state.ui.sidebarExpanded && (
              <h2 className={`text-lg font-semibold ${themeClasses.text.primary}`}>
                {getSidebarTitle()}
              </h2>
            )}
            <button
              onClick={() => dispatch(dashboardActions.toggleSidebar())}
              className={`p-2 rounded focus:outline-none focus:ring-2 transition-colors ${themeClasses.button.base}`}
              aria-label={state.ui.sidebarExpanded ? "Collapse sidebar" : "Expand sidebar"}
            >
              {state.ui.isMobile ? (
                state.ui.sidebarExpanded ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />
              ) : (
                state.ui.sidebarExpanded ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-1">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.id)}
                className={`w-full flex items-center px-3 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 ${
                  state.ui.viewMode === item.id
                    ? themeClasses.button.active
                    : themeClasses.button.base
                }`}
                aria-current={state.ui.viewMode === item.id ? 'page' : undefined}
                title={!state.ui.sidebarExpanded ? `${item.name}: ${item.description}` : undefined}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {state.ui.sidebarExpanded && (
                  <span className="ml-3 truncate font-medium">{item.name}</span>
                )}
                
                {/* Active indicator for collapsed state */}
                {!state.ui.sidebarExpanded && state.ui.viewMode === item.id && (
                  <div className={`absolute left-0 w-1 h-8 rounded-r-full ${themeClasses.activeIndicator}`} />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Data Management Section */}
        {state.ui.sidebarExpanded && (
          <div className={`p-4 border-t ${themeClasses.border}`}>
            <h3 className={`text-sm font-medium mb-3 ${themeClasses.text.secondary}`}>
              Data Management
            </h3>
            <div className="space-y-1">
              {dataManagementTools.map((tool) => (
                <button
                  key={tool.id}
                  onClick={tool.action}
                  disabled={tool.disabled}
                  className={`w-full flex items-center px-3 py-2 text-sm rounded-lg transition-colors focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                    tool.dangerous 
                      ? themeClasses.button.danger
                      : themeClasses.button.base
                  }`}
                  title={tool.disabled ? `${tool.name} is currently unavailable` : tool.name}
                >
                  <tool.icon className="h-4 w-4 mr-3 flex-shrink-0" />
                  {tool.name}
                </button>
              ))}
            </div>
            
            {/* System Status */}
            <div className={`mt-4 pt-3 border-t ${themeClasses.border}`}>
              <div className={`text-xs ${themeClasses.text.secondary}`}>
                <div className="flex items-center justify-between">
                  <span>Requirements:</span>
                  <span className={themeClasses.text.primary}>{requirementsCount}</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span>Status:</span>
                  <span className="text-green-400">
                    {isLoading ? 'Loading...' : 'Active'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default DashboardSidebar;