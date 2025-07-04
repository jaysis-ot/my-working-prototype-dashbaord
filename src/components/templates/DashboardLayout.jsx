import React from 'react';
import PropTypes from 'prop-types';
import { Menu, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useDashboardUI } from '../../contexts/DashboardUIContext';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * DashboardLayout Template Component
 * 
 * This template provides the overall layout structure for the dashboard, including:
 * - Responsive sidebar with toggle functionality
 * - Header with navigation and user controls
 * - Main content area for page content
 * 
 * It serves as the foundation for all dashboard pages, ensuring consistent
 * layout and navigation across the application.
 */
const DashboardLayout = ({ children }) => {
  const { 
    sidebarExpanded, 
    toggleSidebar, 
    viewMode,
    setViewMode
  } = useDashboardUI();
  
  const { themeClasses } = useTheme();

  // Handle sidebar toggle
  const handleSidebarToggle = () => {
    toggleSidebar();
  };

  // Navigation items structure
  const navItems = [
    { id: 'overview', label: 'Overview', icon: 'LayoutDashboard' },
    { id: 'requirements', label: 'Requirements', icon: 'FileText' },
    { id: 'capabilities', label: 'Capabilities', icon: 'Shield' },
    { id: 'resources', label: 'Resource Planning', icon: 'Users' },
    { id: 'analytics', label: 'Analytics', icon: 'BarChart3' },
    { id: 'pcd-breakdown', label: 'PCD Breakdown', icon: 'PieChart' },
    { id: 'maturity-analysis', label: 'Maturity Analysis', icon: 'TrendingUp' },
    { id: 'threat-intelligence', label: 'Threat Intelligence', icon: 'AlertTriangle' },
    { id: 'risk-management', label: 'Risk Management', icon: 'Target' },
    { id: 'settings', label: 'Settings', icon: 'Settings' },
  ];

  return (
    <div className="h-screen flex flex-col bg-background-light dark:bg-background-dark">
      {/* Header */}
      <header 
        className={`${themeClasses.header} h-16 flex items-center justify-between px-4 z-30 shadow-sm`}
        aria-label="Dashboard header"
      >
        <div className="flex items-center">
          {/* Mobile sidebar toggle */}
          <button 
            className="p-2 rounded-md text-secondary-500 hover:bg-secondary-100 dark:hover:bg-secondary-700 md:hidden"
            onClick={handleSidebarToggle}
            aria-label={sidebarExpanded ? "Close sidebar" : "Open sidebar"}
          >
            {sidebarExpanded ? <X size={20} /> : <Menu size={20} />}
          </button>
          
          {/* Logo/Brand - Hidden on mobile when sidebar is open */}
          <div className={`flex items-center ${sidebarExpanded ? 'hidden md:flex' : 'flex'}`}>
            <span className="text-xl font-semibold text-primary-600 dark:text-primary-400">
              Cyber Trust Sensor
            </span>
          </div>
        </div>
        
        {/* Desktop sidebar toggle */}
        <button 
          className="hidden md:flex p-2 rounded-md text-secondary-500 hover:bg-secondary-100 dark:hover:bg-secondary-700"
          onClick={handleSidebarToggle}
          aria-label={sidebarExpanded ? "Collapse sidebar" : "Expand sidebar"}
        >
          {sidebarExpanded ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
        
        {/* Header right section - placeholder for user menu, notifications, etc. */}
        <div className="flex items-center space-x-4">
          {/* These will be replaced with actual components later */}
          <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
            <span className="text-primary-600 dark:text-primary-400 text-sm font-medium">JD</span>
          </div>
        </div>
      </header>
      
      {/* Main container with sidebar and content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside 
          className={`
            ${themeClasses.sidebar} 
            ${sidebarExpanded ? 'w-64' : 'w-16'} 
            transition-all duration-300 ease-in-out 
            fixed md:relative 
            h-[calc(100vh-4rem)] 
            z-40 md:z-auto 
            ${sidebarExpanded ? 'left-0' : '-left-64 md:left-0'}
            shadow-lg md:shadow-none
          `}
          aria-label="Dashboard navigation"
        >
          {/* Sidebar content */}
          <div className="h-full flex flex-col py-4">
            {/* Navigation items */}
            <nav className="flex-1 px-2 space-y-1 overflow-y-auto">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  className={`
                    w-full text-left
                    sidebar-item
                    ${viewMode === item.id ? 'sidebar-item-active' : 'sidebar-item-inactive'}
                    ${!sidebarExpanded ? 'justify-center' : ''}
                  `}
                  onClick={() => setViewMode(item.id)}
                  aria-current={viewMode === item.id ? 'page' : undefined}
                >
                  {/* Dynamic icon would be rendered here */}
                  <div className={`flex-shrink-0 ${!sidebarExpanded ? '' : 'mr-3'}`}>
                    {/* Placeholder for icon */}
                    <div className="w-5 h-5 rounded bg-current opacity-20"></div>
                  </div>
                  
                  {sidebarExpanded && (
                    <span className="truncate">{item.label}</span>
                  )}
                </button>
              ))}
            </nav>
            
            {/* Sidebar footer - Trust Score indicator placeholder */}
            {sidebarExpanded && (
              <div className="px-4 py-3 mt-auto">
                <div className="bg-secondary-800 bg-opacity-50 rounded-lg p-3">
                  <div className="text-xs text-secondary-400 mb-1">Trust Score</div>
                  <div className="flex items-center">
                    <div className="text-lg font-semibold text-white">78</div>
                    <div className="ml-auto px-1.5 py-0.5 rounded-full bg-status-warning bg-opacity-20 text-status-warning text-xs">
                      -3 Δ
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </aside>
        
        {/* Main content */}
        <main 
          className={`
            flex-1 
            overflow-y-auto 
            transition-all 
            duration-300 
            ease-in-out
            ${sidebarExpanded ? 'md:ml-0' : 'md:ml-0'}
            pt-16 md:pt-0
          `}
          aria-label="Dashboard content"
        >
          {/* Overlay for mobile when sidebar is open */}
          {sidebarExpanded && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
              onClick={handleSidebarToggle}
              aria-hidden="true"
            />
          )}
          
          {/* Content container */}
          <div className="p-4 md:p-6 h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

DashboardLayout.propTypes = {
  /**
   * Content to render inside the layout
   */
  children: PropTypes.node.isRequired
};

export default DashboardLayout;
