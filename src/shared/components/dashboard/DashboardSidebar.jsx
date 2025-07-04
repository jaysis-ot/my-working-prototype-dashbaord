// src/components/dashboard/DashboardSidebar.jsx
import React from 'react';
import { 
  TrendingUp, Building2, Network, FileText, Shield, Target, AlertTriangle,
  Gauge, Star, BarChart3, Activity, Settings, Upload, Download, Trash2,
  ChevronLeft, ChevronRight, X, Menu, Award, Home, Plus, Search, 
  ChevronDown, TrendingUp as TrendingUpAlt, FileBarChart // ✅ FIXED: Removed duplicate imports
} from 'lucide-react';
import { dashboardActions } from '../../store/dashboardActions';
import { VIEW_MODES, VIEW_LABELS } from '../../constants';

/**
 * Dashboard Sidebar Component
 * 
 * Provides navigation between dashboard views and data management functions.
 * Responsive design with collapsible mobile view.
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
  
  const { viewMode } = state.ui;
  const { sidebarCollapsed } = state.ui;

  const toggleSidebar = () => {
    dispatch(dashboardActions.toggleSidebar());
  };

  const handleViewChange = (newView) => {
    dispatch(dashboardActions.setViewMode(newView));
  };

  const handleExport = () => {
    if (onExportCSV && !isLoading) {
      onExportCSV();
    }
  };

  // Icon mapping for navigation items
  const getIcon = (iconName) => {
    const iconMap = {
      TrendingUp,
      Building2,
      Network,
      FileText,
      Shield,
      Target,
      AlertTriangle,
      Gauge,
      Star,
      BarChart3,
      Activity,
      Settings,
      Award // ✅ Added Award icon for Standards
    };
    
    const IconComponent = iconMap[iconName] || FileText;
    return <IconComponent className="h-5 w-5" />;
  };

  // Navigation sections
  const navigationSections = [
    {
      title: 'Core',
      items: [
        { id: VIEW_MODES.OVERVIEW, label: VIEW_LABELS[VIEW_MODES.OVERVIEW], icon: 'TrendingUp' },
        { id: VIEW_MODES.COMPANY_PROFILE, label: VIEW_LABELS[VIEW_MODES.COMPANY_PROFILE], icon: 'Building2' },
        { id: VIEW_MODES.CAPABILITIES, label: VIEW_LABELS[VIEW_MODES.CAPABILITIES], icon: 'Network' },
        { id: VIEW_MODES.REQUIREMENTS, label: VIEW_LABELS[VIEW_MODES.REQUIREMENTS], icon: 'FileText' }
      ]
    },
    {
      title: 'Intelligence & Risk',
      items: [
        { id: VIEW_MODES.THREAT_INTELLIGENCE, label: VIEW_LABELS[VIEW_MODES.THREAT_INTELLIGENCE], icon: 'Shield' },
        { id: VIEW_MODES.MITRE_NAVIGATOR, label: VIEW_LABELS[VIEW_MODES.MITRE_NAVIGATOR], icon: 'Target' },
        { id: VIEW_MODES.RISK_MANAGEMENT, label: VIEW_LABELS[VIEW_MODES.RISK_MANAGEMENT], icon: 'AlertTriangle' },
        { id: VIEW_MODES.STANDARDS, label: VIEW_LABELS[VIEW_MODES.STANDARDS], icon: 'Award' } // ✅ Added Standards
      ]
    },
    {
      title: 'Analysis',
      items: [
        { id: VIEW_MODES.PCD_BREAKDOWN, label: VIEW_LABELS[VIEW_MODES.PCD_BREAKDOWN], icon: 'Building2' },
        { id: VIEW_MODES.MATURITY_ANALYSIS, label: VIEW_LABELS[VIEW_MODES.MATURITY_ANALYSIS], icon: 'Gauge' },
        { id: VIEW_MODES.BUSINESS_VALUE, label: VIEW_LABELS[VIEW_MODES.BUSINESS_VALUE], icon: 'Star' },
        { id: VIEW_MODES.ANALYTICS, label: VIEW_LABELS[VIEW_MODES.ANALYTICS], icon: 'BarChart3' }
      ]
    },
    {
      title: 'System',
      items: [
        { id: VIEW_MODES.DIAGNOSTICS, label: VIEW_LABELS[VIEW_MODES.DIAGNOSTICS], icon: 'Activity' },
        { id: VIEW_MODES.SETTINGS, label: VIEW_LABELS[VIEW_MODES.SETTINGS], icon: 'Settings' }
      ]
    }
  ];

  const themeClasses = currentTheme === 'stripe' 
    ? 'sidebar-background border-sidebar-border' 
    : 'bg-white border-gray-200';

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {!sidebarCollapsed && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:relative inset-y-0 left-0 z-50 lg:z-auto
        w-64 transform transition-transform duration-300 ease-in-out
        ${sidebarCollapsed ? '-translate-x-full lg:translate-x-0' : 'translate-x-0'}
        ${themeClasses} border-r
        flex flex-col h-screen
      `}>
        
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-gray-900">
                {companyProfile?.companyName || 'Cyber Trust Portal'}
              </span>
              <span className="text-xs text-gray-500">Risk Intelligence</span>
            </div>
          </div>
          
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-1 rounded-md hover:bg-gray-100"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
          {navigationSections.map((section, sectionIndex) => (
            <div key={sectionIndex}>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                {section.title}
              </h3>
              <div className="space-y-1">
                {section.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleViewChange(item.id)}
                    className={`
                      w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg
                      transition-colors duration-200
                      ${viewMode === item.id
                        ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-600'
                        : 'text-gray-700 hover:bg-gray-100'
                      }
                    `}
                  >
                    <span className="mr-3">{getIcon(item.icon)}</span>
                    {item.label}
                    {item.id === VIEW_MODES.REQUIREMENTS && requirementsCount > 0 && (
                      <span className="ml-auto bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        {requirementsCount}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Data Management Footer */}
        <div className="p-4 border-t border-gray-200">
          <div className="space-y-2">
            <button
              onClick={handleExport}
              disabled={isLoading}
              className="w-full flex items-center justify-center px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              {isLoading ? 'Exporting...' : 'Export Data'}
            </button>
            
            <div className="text-xs text-gray-500 text-center">
              Data updated continuously
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg border border-gray-200"
        aria-label="Open sidebar"
      >
        <Menu className="h-5 w-5" />
      </button>
    </>
  );
};

export default DashboardSidebar;