import React from 'react';
import PropTypes from 'prop-types';
// No special Link imports needed; all navigation handled uniformly
import {
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  FileText,
  Shield,
  Users,
  BarChart3,
  PieChart,
  TrendingUp,
  AlertTriangle,
  Target,
  Layers,
  BookOpen,
  Building2,
  Heart,
  Settings as SettingsIcon,
} from 'lucide-react';
import { useDashboardUI } from '../../contexts/DashboardUIContext';
import { useTheme } from '../../contexts/ThemeContext';
// User settings dropdown (avatar, theme toggle, logout, etc.)
import UserSettingsDropdown from '../organisms/UserSettingsDropdown';
// Product logo placeholder component
import ProductLogo from '../atoms/ProductLogo';

/**
 * DashboardLayout Template Component
 * 
 * This template provides the overall layout structure for the dashboard, including:
 * - Full-height sidebar with logo and navigation
 * - Main content area with user controls in the top right
 * - Responsive design with mobile support
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

  // Map icon names to actual Lucide icon components
  const iconMap = {
    LayoutDashboard,
    FileText,
    Shield,
    Users,
    BarChart3,
    PieChart,
    TrendingUp,
    AlertTriangle,
    Target,
    Layers,
    BookOpen,
    Building2,
    Heart,
    Settings: SettingsIcon,
  };

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
    { id: 'business-plan', label: 'Business Plan', icon: 'PieChart' },
    { id: 'maturity-analysis', label: 'Maturity Analysis', icon: 'TrendingUp' },
    { id: 'mitre-attack', label: 'MITRE ATT&CK', icon: 'Layers' },
    { id: 'standards-frameworks', label: 'Standards & Frameworks', icon: 'BookOpen' },
    { id: 'threat-intelligence', label: 'Threat Intelligence', icon: 'AlertTriangle' },
    { id: 'risk-management', label: 'Risk Management', icon: 'Target' },
    { id: 'trust', label: 'Trust', icon: 'Heart' },
    { id: 'settings', label: 'Settings', icon: 'Settings' },
  ];

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background-light dark:bg-background-dark">
      {/* ---------------------------------------------------------------- */}
      {/* Global Header – spans full width, 64 px tall                   */}
      {/* ---------------------------------------------------------------- */}
      <header
        className={`${themeClasses.header} h-16 flex items-center justify-between px-4 z-30 shadow-sm`}
      >
        {/* Mobile sidebar toggle */}
        <button
          className="p-2 rounded-md text-secondary-500 hover:bg-secondary-100 dark:hover:bg-secondary-700 md:hidden"
          onClick={handleSidebarToggle}
          aria-label={sidebarExpanded ? 'Close sidebar' : 'Open sidebar'}
        >
          {sidebarExpanded ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Right-side utilities */}
        <div className="flex items-center space-x-4 ml-auto">
          <UserSettingsDropdown />
        </div>
      </header>

      {/* ---------------------------------------------------------------- */}
      {/* Main area holding sidebar + page content                         */}
      {/* ---------------------------------------------------------------- */}
      <div className="flex flex-1 overflow-hidden">
      {/* Sidebar - now full height */}
      <aside 
        className={`
          ${themeClasses.sidebar} 
          ${sidebarExpanded ? 'w-64' : 'w-16'} 
          transition-all duration-300 ease-in-out 
          fixed md:relative 
          top-16
          h-[calc(100vh-4rem)]
          z-40 md:z-auto 
          ${sidebarExpanded ? 'left-0' : '-left-64 md:left-0'}
          shadow-lg md:shadow-none
          flex flex-col
        `}
        aria-label="Dashboard navigation"
      >
        {/* Logo section at the top of sidebar */}
        <div className="flex items-center justify-center py-6 px-4 border-b border-secondary-700/30">
          <ProductLogo expanded={sidebarExpanded} />
        </div>

        {/* Sidebar content */}
        <div className="flex-1 flex flex-col py-4 overflow-y-auto">
          {/* Navigation items */}
          <nav className="flex-1 px-2 space-y-1">
            {navItems.map((item) => {
              const Icon = iconMap[item.icon];
              const commonClasses = `
                w-full text-left
                sidebar-item
                ${viewMode === item.id ? 'sidebar-item-active' : 'sidebar-item-inactive'}
                ${!sidebarExpanded ? 'justify-center' : ''}
              `;

              // Unified rendering for all navigation items
              return (
                <button
                  key={item.id}
                  className={commonClasses}
                  onClick={() => setViewMode(item.id)}
                  aria-current={viewMode === item.id ? 'page' : undefined}
                >
                  <Icon
                    className={`w-6 h-6 flex-shrink-0 ${!sidebarExpanded ? '' : 'mr-3'}`}
                    aria-hidden="true"
                  />
                  {sidebarExpanded && <span className="truncate text-base">{item.label}</span>}
                </button>
              );
            })}
          </nav>
          
          {/* Sidebar collapse/expand toggle */}
          <div className="mt-2 border-t border-secondary-700/20 dark:border-secondary-700 pt-2 px-2">
            <button
              onClick={handleSidebarToggle}
              aria-label={sidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
              className={`
                w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors
                text-secondary-600 dark:text-secondary-300
                hover:bg-secondary-100 dark:hover:bg-secondary-700
                ${sidebarExpanded ? '' : 'justify-center'}
              `}
            >
              {sidebarExpanded ? (
                <>
                  <ChevronLeft className="w-6 h-6 flex-shrink-0" />
                  <span className="truncate text-base">Collapse</span>
                </>
              ) : (
                <ChevronRight className="w-6 h-6 flex-shrink-0" />
              )}
            </button>
          </div>

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
      
      {/* Main content area */}
      <main 
        className="flex-1 flex flex-col overflow-hidden"
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
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </div>
      </main>
      </div>{/* end flex container */}
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
