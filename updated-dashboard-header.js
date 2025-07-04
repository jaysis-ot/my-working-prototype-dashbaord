// src/components/dashboard/DashboardHeader.jsx - Enhanced with Standards Support
import React, { useState, useMemo } from 'react';
import { 
  Bell, 
  Search, 
  Settings, 
  User, 
  LogOut, 
  Shield,
  Clock,
  ChevronDown,
  Award,
  Activity,
  Database,
  Filter,
  Layers,
  Menu
} from 'lucide-react';
import { VIEW_MODES, VIEW_LABELS } from '../../constants';

/**
 * Enhanced Dashboard Header with Standards Support
 * 
 * Features:
 * - Dynamic title based on current view
 * - Standards-specific context information
 * - User authentication status and information
 * - Token expiry indicator
 * - Secure logout functionality
 * - User profile dropdown
 * - Session management
 * - Contextual subtitles for different views
 */
const DashboardHeader = ({ 
  state, 
  dispatch, 
  handlers = {},
  currentTheme = 'light',
  companyProfile = {},
  auth = {},
  stats = {}
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  // Extract auth context
  const { user, tokenInfo, logout } = auth;

  // Calculate token expiry status
  const getTokenStatus = () => {
    if (!tokenInfo?.expiresAt) return { status: 'unknown', timeLeft: 0 };
    
    const now = Date.now();
    const timeLeft = tokenInfo.expiresAt - now;
    const minutesLeft = Math.floor(timeLeft / (1000 * 60));
    
    if (minutesLeft <= 0) return { status: 'expired', timeLeft: 0 };
    if (minutesLeft <= 2) return { status: 'warning', timeLeft: minutesLeft };
    if (minutesLeft <= 5) return { status: 'caution', timeLeft: minutesLeft };
    return { status: 'good', timeLeft: minutesLeft };
  };

  const tokenStatus = getTokenStatus();

  // Get dashboard title based on current view
  const getDashboardTitle = () => {
    const viewMode = state.ui?.viewMode || VIEW_MODES.OVERVIEW;
    
    switch (viewMode) {
      case VIEW_MODES.OVERVIEW:
        return 'Overview Dashboard';
      case VIEW_MODES.COMPANY_PROFILE:
        return 'Company Profile';
      case VIEW_MODES.CAPABILITIES:
        return 'Security Capabilities';
      case VIEW_MODES.REQUIREMENTS:
        return 'Requirements Management';
      case VIEW_MODES.THREAT_INTELLIGENCE:
        return 'Threat Intelligence';
      case VIEW_MODES.MITRE_NAVIGATOR:
        return 'MITRE ATT&CK Navigator';
      case VIEW_MODES.RISK_MANAGEMENT:
        return 'Risk Management';
      case VIEW_MODES.STANDARDS:
        return 'Standards & Frameworks';
      case VIEW_MODES.PCD_BREAKDOWN:
        return 'PCD Analysis';
      case VIEW_MODES.MATURITY_ANALYSIS:
        return 'Maturity Assessment';
      case VIEW_MODES.BUSINESS_VALUE:
        return 'Business Value Analysis';
      case VIEW_MODES.ANALYTICS:
        return 'Analytics Dashboard';
      case VIEW_MODES.DIAGNOSTICS:
        return 'System Diagnostics';
      case VIEW_MODES.SETTINGS:
        return 'System Settings';
      default:
        return VIEW_LABELS[viewMode] || 'Dashboard';
    }
  };

  // Get contextual subtitle based on current view
  const getContextualSubtitle = () => {
    const viewMode = state.ui?.viewMode || VIEW_MODES.OVERVIEW;
    
    switch (viewMode) {
      case VIEW_MODES.OVERVIEW:
        const completionRate = stats.completionRate || 0;
        return `${stats.total || 0} requirements • ${completionRate}% complete`;
        
      case VIEW_MODES.COMPANY_PROFILE:
        return companyProfile?.industry ? `${companyProfile.industry} • ${companyProfile?.size || 'Unknown'} size` : 'Configure your organization profile';
        
      case VIEW_MODES.CAPABILITIES:
        return `${stats.capabilities || 0} capabilities defined`;
        
      case VIEW_MODES.REQUIREMENTS:
        const filtered = stats.filtered || stats.total || 0;
        const total = stats.total || 0;
        return filtered !== total ? `${filtered} of ${total} requirements (filtered)` : `${total} requirements total`;
        
      case VIEW_MODES.THREAT_INTELLIGENCE:
        return 'Real-time threat monitoring and analysis';
        
      case VIEW_MODES.MITRE_NAVIGATOR:
        return 'Adversary tactics, techniques, and procedures';
        
      case VIEW_MODES.RISK_MANAGEMENT:
        return 'Enterprise risk assessment and mitigation';
        
      case VIEW_MODES.STANDARDS:
        const standardsState = state.standards || {};
        const selectedFramework = standardsState.selectedFramework;
        const frameworks = standardsState.frameworks || {};
        const frameworkCount = Object.keys(frameworks).length;
        
        if (selectedFramework && frameworks[selectedFramework]) {
          const frameworkData = frameworks[selectedFramework];
          const completionRate = frameworkData.completionRate || 0;
          const frameworkNames = {
            'nist-csf-2.0': 'NIST CSF 2.0',
            'nistCsf': 'NIST CSF 2.0',
            'iso27001': 'ISO 27001',
            'soc2': 'SOC 2',
            'pciDss': 'PCI DSS'
          };
          const frameworkName = frameworkNames[selectedFramework] || selectedFramework;
          return `${frameworkName} • ${completionRate.toFixed(1)}% complete • ${frameworkCount} frameworks available`;
        }
        return `${frameworkCount} compliance frameworks available`;
        
      case VIEW_MODES.PCD_BREAKDOWN:
        return 'Process Control and Data analysis';
        
      case VIEW_MODES.MATURITY_ANALYSIS:
        return 'Organizational security maturity assessment';
        
      case VIEW_MODES.BUSINESS_VALUE:
        return 'ROI and business impact analysis';
        
      case VIEW_MODES.ANALYTICS:
        return 'Performance metrics and insights';
        
      case VIEW_MODES.DIAGNOSTICS:
        return 'System health and performance monitoring';
        
      case VIEW_MODES.SETTINGS:
        return 'Application configuration and preferences';
        
      default:
        return 'Cybersecurity risk management platform';
    }
  };

  // Handle secure logout
  const handleLogout = () => {
    if (logout) {
      logout();
    }
    setShowUserMenu(false);
  };

  // Handle sidebar toggle
  const handleSidebarToggle = () => {
    if (handlers.toggleSidebar) {
      handlers.toggleSidebar();
    } else if (dispatch) {
      dispatch({ type: 'TOGGLE_SIDEBAR' });
    }
  };

  // Handle search
  const handleSearchChange = (e) => {
    const searchTerm = e.target.value;
    if (handlers.setSearchTerm) {
      handlers.setSearchTerm(searchTerm);
    } else if (dispatch) {
      dispatch({ type: 'SET_SEARCH_TERM', searchTerm });
    }
  };

  // Format last login time
  const formatLastLogin = (lastLogin) => {
    if (!lastLogin) return 'Unknown';
    return new Date(lastLogin).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Theme classes
  const themeClasses = {
    header: currentTheme === 'stripe' ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-300',
    title: 'text-gray-900',
    subtitle: 'text-gray-600',
    button: {
      base: 'text-gray-400 hover:text-gray-600',
      user: 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
    }
  };

  return (
    <header className={`${themeClasses.header} border-b shadow-sm transition-colors duration-200`}>
      <div className="px-4 lg:px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left side - Mobile menu and title */}
          <div className="flex items-center space-x-4">
            {/* Mobile sidebar toggle */}
            <button
              onClick={handleSidebarToggle}
              className="lg:hidden p-2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label={state.ui?.sidebarExpanded ? "Close sidebar" : "Open sidebar"}
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
                {state.ui?.viewMode === VIEW_MODES.REQUIREMENTS && stats.filtered !== stats.total && (
                  <div className="flex items-center">
                    <Filter className="h-3 w-3 lg:h-4 lg:w-4 mr-1" />
                    <span>{stats.filtered} filtered</span>
                  </div>
                )}
                
                {/* Show completion rate for overview */}
                {state.ui?.viewMode === VIEW_MODES.OVERVIEW && stats.total > 0 && (
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

                {/* Show standards-specific info */}
                {state.ui?.viewMode === VIEW_MODES.STANDARDS && state.standards?.selectedFramework && (
                  <div className="flex items-center">
                    <Award className="h-3 w-3 lg:h-4 lg:w-4 mr-1" />
                    <span>Active framework assessment</span>
                  </div>
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

          {/* Center - Search */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search requirements, capabilities, standards..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={state.searchTerm || ''}
                onChange={handleSearchChange}
              />
            </div>
          </div>

          {/* Right side - User info and controls */}
          <div className="flex items-center space-x-2 lg:space-x-4">
            {/* Token status indicator (only show if auth is enabled) */}
            {auth.user && (
              <div className="hidden lg:flex items-center space-x-2">
                <Clock className={`h-4 w-4 ${
                  tokenStatus.status === 'good' ? 'text-green-500' : 
                  tokenStatus.status === 'caution' ? 'text-yellow-500' : 
                  tokenStatus.status === 'warning' ? 'text-orange-500' : 'text-red-500'
                }`} />
                <span className={`text-sm ${
                  tokenStatus.status === 'good' ? 'text-green-600' : 
                  tokenStatus.status === 'caution' ? 'text-yellow-600' : 
                  tokenStatus.status === 'warning' ? 'text-orange-600' : 'text-red-600'
                }`}>
                  {tokenStatus.status === 'expired' ? 'Expired' : 
                   tokenStatus.status === 'unknown' ? 'Unknown' :
                   `${tokenStatus.timeLeft}m left`}
                </span>
              </div>
            )}

            {/* Notifications */}
            <button className={`relative p-2 transition-colors ${themeClasses.button.base}`}>
              <Bell className="h-5 w-5" />
              {/* Notification badge */}
              <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Settings */}
            <button 
              className={`p-2 transition-colors ${themeClasses.button.base}`}
              onClick={() => dispatch && dispatch({ type: 'SET_VIEW_MODE', viewMode: VIEW_MODES.SETTINGS })}
            >
              <Settings className="h-5 w-5" />
            </button>

            {/* User Profile Dropdown (only show if auth is enabled) */}
            {auth.user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className={`flex items-center space-x-3 p-2 rounded-lg transition-colors ${themeClasses.button.user}`}
                >
                  <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium">{user?.name || 'User'}</p>
                    <p className="text-xs text-gray-500">{user?.role || 'Admin'}</p>
                  </div>
                  <ChevronDown className={`h-4 w-4 transition-transform ${
                    showUserMenu ? 'rotate-180' : ''
                  }`} />
                </button>

                {/* User Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="font-medium text-gray-900">{user?.name}</p>
                      <p className="text-sm text-gray-600">{user?.email}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Last login: {formatLastLogin(user?.lastLogin)}
                      </p>
                    </div>

                    {/* User Permissions */}
                    {user?.permissions && (
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-xs font-medium text-gray-700 mb-1">Permissions:</p>
                        <div className="flex flex-wrap gap-1">
                          {user.permissions.map(permission => (
                            <span 
                              key={permission}
                              className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded"
                            >
                              {permission}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Session Info */}
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-xs font-medium text-gray-700 mb-1">Session:</p>
                      <p className="text-xs text-gray-600">
                        Token expires in {tokenStatus.timeLeft} minutes
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="px-2 py-2">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-2 px-3 py-2 text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Simple user icon when no auth */
              <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-gray-600" />
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;