// src/components/dashboard/DashboardHeader.jsx
import React from 'react';
import { 
  Menu, MoreVertical, Building2, Star, Download, Activity, 
  Layers, Database, Bell, Search, Filter
} from 'lucide-react';

/**
 * Dashboard Header Component
 * 
 * Provides the top header bar for the dashboard with:
 * - Dynamic title based on company profile
 * - Context-aware statistics and information
 * - Quick action buttons
 * - Mobile-responsive design with hamburger menu
 * - Theme-aware styling
 * - Progress indicators for certain views
 */
const DashboardHeader = ({ 
  state, 
  dispatch, 
  currentTheme, 
  companyProfile,
  requirements = [],
  filteredRequirements = [],
  onExportCSV,
  onProfileEdit
}) => {
  
  // Dynamic title generation based on company profile
  const getDashboardTitle = () => {
    if (companyProfile?.companyName && companyProfile.companyName.trim()) {
      return `${companyProfile.companyName} Cyber Trust Portal`;
    }
    return 'Cyber Trust Portal';
  };

  // Get contextual subtitle based on current view
  const getContextualSubtitle = () => {
    const viewMode = state.ui.viewMode;
    
    switch (viewMode) {
      case 'overview':
        return 'Network Segmentation Project';
      case 'requirements':
        return `${filteredRequirements.length} of ${requirements.length} requirements displayed`;
      case 'capabilities':
        return 'Security Capabilities Management';
      case 'threat-intelligence':
        return 'Real-time Threat Monitoring';
      case 'mitre-navigator':
        return 'MITRE ATT&CK Technique Analysis';
      case 'risk-management':
        return 'Risk Assessment & Mitigation';
      case 'analytics':
        return 'Performance Analytics Dashboard';
      case 'company-profile':
        return 'Company Configuration & Settings';
      case 'maturity':
        return 'Security Maturity Assessment';
      case 'justification':
        return 'Business Value Analysis';
      case 'pcd':
        return 'PCD Breakdown Analysis';
      case 'diagnostics':
        return 'System Health & Diagnostics';
      case 'settings':
        return 'System Configuration';
      default:
        return 'Business Assurance Platform';
    }
  };

  // Calculate quick statistics for the header
  const getQuickStats = () => {
    const completedCount = requirements.filter(r => r.status === 'Completed').length;
    const inProgressCount = requirements.filter(r => r.status === 'In Progress').length;
    const completionRate = requirements.length > 0 
      ? Math.round((completedCount / requirements.length) * 100) 
      : 0;

    return {
      total: requirements.length,
      completed: completedCount,
      inProgress: inProgressCount,
      completionRate,
      filtered: filteredRequirements.length
    };
  };

  const stats = getQuickStats();

  // Theme-aware styling classes
  const getThemeClasses = () => {
    if (currentTheme === 'stripe') {
      return {
        header: 'header-area border-white border-opacity-10',
        title: 'text-white',
        subtitle: 'text-white text-opacity-80',
        button: 'border-white border-opacity-30 text-white bg-white bg-opacity-10 hover:bg-opacity-20 backdrop-blur-sm',
        buttonPrimary: 'bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm text-white',
        mobileButton: 'text-white hover:bg-white hover:bg-opacity-20'
      };
    }
    
    return {
      header: 'bg-white border-gray-200',
      title: 'text-gray-900',
      subtitle: 'text-gray-600',
      button: 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50',
      buttonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white',
      mobileButton: 'text-gray-600 hover:bg-gray-100'
    };
  };

  const themeClasses = getThemeClasses();

  return (
    <header className={`${themeClasses.header} shadow-sm border-b sticky top-0 z-30`}>
      <div className="px-4 lg:px-6 py-4">
        <div className="flex justify-between items-center">
          
          {/* Left Section - Title and Context */}
          <div className="flex items-center min-w-0 flex-1">
            
            {/* Mobile menu button */}
            <button
              className={`lg:hidden p-2 -ml-2 mr-3 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${themeClasses.mobileButton}`}
              onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
              aria-label={state.ui.sidebarExpanded ? "Close sidebar" : "Open sidebar"}
            >
              <Menu className="h-5 w-5" />
            </button>
            
            <div className="min-w-0 flex-1">
              {/* Main Title */}
              <h1 className={`text-xl lg:text-2xl font-bold truncate ${themeClasses.title}`}>
                {getDashboardTitle()}
              </h1>
              
              {/* Desktop Stats and Context */}
              <div className={`hidden sm:flex items-center mt-1 text-xs lg:text-sm space-x-4 ${themeClasses.subtitle}`}>
                <div className="flex items-center">
                  <Layers className="h-3 w-3 lg:h-4 lg:w-4 mr-1" />
                  <span>{getContextualSubtitle()}</span>
                </div>
                
                {/* Show filter info for requirements view */}
                {state.ui.viewMode === 'requirements' && stats.filtered !== stats.total && (
                  <div className="flex items-center">
                    <Filter className="h-3 w-3 lg:h-4 lg:w-4 mr-1" />
                    <span>{stats.filtered} filtered</span>
                  </div>
                )}
                
                {/* Show completion rate for overview */}
                {state.ui.viewMode === 'overview' && stats.total > 0 && (
                  <>
                    <div className="flex items-center">
                      <Activity className="h-3 w-3 lg:h-4 lg:w-4 mr-1" />
                      <span>{stats.completionRate}% complete</span>
                    </div>
                    <div className="flex items-center">
                      <Database className="h-3 w-3 lg:h-4 lg:w-4 mr-1" />
                      <span>Demo data active</span>
                    </div>
                  </>
                )}
              </div>
              
              {/* Mobile-only simplified stats */}
              <div className={`sm:hidden mt-1 text-xs ${themeClasses.subtitle}`}>
                <div className="flex items-center space-x-3">
                  <span>{getContextualSubtitle()}</span>
                  {stats.total > 0 && (
                    <span className="flex items-center">
                      <Activity className="h-3 w-3 mr-1" />
                      {stats.total} total
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Section - Action Buttons */}
          <div className="flex items-center space-x-2 lg:space-x-3 ml-4">
            
            {/* Company Profile Quick Access */}
            {companyProfile?.profileCompleted && (
              <button 
                onClick={onProfileEdit}
                className={`hidden md:inline-flex items-center px-3 py-2 border rounded-lg shadow-sm text-sm font-medium transition-colors ${themeClasses.button}`}
                title="Edit Company Profile"
              >
                <Building2 className="h-4 w-4 mr-2" />
                {companyProfile.companyName.split(' ')[0]}
              </button>
            )}

            {/* Search Button for requirements view */}
            {state.ui.viewMode === 'requirements' && (
              <button 
                className={`hidden sm:inline-flex items-center px-3 py-2 border rounded-lg shadow-sm text-sm font-medium transition-colors ${themeClasses.button}`}
                title="Search Requirements"
                onClick={() => {
                  // Future: trigger search functionality
                  console.log('Search triggered');
                }}
              >
                <Search className="h-4 w-4" />
              </button>
            )}

            {/* Test Toast Button - Development only */}
            {process.env.NODE_ENV === 'development' && (
              <button 
                onClick={() => {
                  console.log('Portal system working perfectly! 🎉');
                }}
                className={`hidden md:inline-flex items-center px-3 py-2 border rounded-lg shadow-sm text-sm font-medium transition-colors ${themeClasses.button}`}
                title="Test System"
              >
                <Star className="h-4 w-4 mr-2" />
                Test
              </button>
            )}
            
            {/* Export Button */}
            <button 
              onClick={onExportCSV}
              disabled={requirements.length === 0}
              className={`hidden sm:inline-flex items-center px-3 lg:px-4 py-2 border-transparent rounded-lg shadow-sm text-xs lg:text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${themeClasses.buttonPrimary}`}
              title="Export data to CSV"
            >
              <Download className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
              <span className="hidden lg:inline">Export CSV</span>
              <span className="lg:hidden">Export</span>
            </button>
            
            {/* Mobile Menu Button */}
            <button
              className={`sm:hidden p-2 rounded-lg transition-colors ${themeClasses.mobileButton}`}
              aria-label="More options"
              title="More options"
            >
              <MoreVertical className="h-5 w-5" />
            </button>

            {/* Notifications Bell */}
            <button
              className={`hidden lg:inline-flex p-2 rounded-lg transition-colors ${themeClasses.button} relative`}
              title="Notifications"
            >
              <Bell className="h-4 w-4" />
              {/* Notification badge */}
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
            </button>
          </div>
        </div>

        {/* Progress Bar - shown for overview and requirements views */}
        {(state.ui.viewMode === 'overview' || state.ui.viewMode === 'requirements') && stats.total > 0 && (
          <div className="mt-3 hidden sm:block">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className={themeClasses.subtitle}>
                Overall Progress: {stats.completed} of {stats.total} requirements completed
              </span>
              <span className={`font-medium ${themeClasses.title}`}>
                {stats.completionRate}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500" 
                style={{ width: `${stats.completionRate}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default DashboardHeader;