import React from 'react';
import PropTypes from 'prop-types';
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
  AlertCircle,
  Target,
  Layers,
  BookOpen,
  Building2,
  Heart,
  Settings as SettingsIcon,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useDashboardUI } from '../../contexts/DashboardUIContext';
import { useTheme } from '../../contexts/ThemeContext';
import ModalManager from '../organisms/ModalManager';
import ProductLogo from '../atoms/ProductLogo';
import UserSettingsDropdown from '../organisms/UserSettingsDropdown';

const DashboardLayout = ({ children }) => {
  const {
    sidebarExpanded,
    toggleSidebar,
    setViewMode,
  } = useDashboardUI();

  const location = useLocation();
  const { themeClasses } = useTheme();

  // Use pathname to determine the active view
  const currentPath = location.pathname.split('/').pop();

  const iconMap = {
    LayoutDashboard,
    FileText,
    Shield,
    Users,
    BarChart3,
    PieChart,
    TrendingUp,
    AlertTriangle,
    AlertCircle,
    Target,
    Layers,
    BookOpen,
    Building2,
    Heart,
    Settings: SettingsIcon,
  };

  const handleSidebarToggle = () => {
    toggleSidebar();
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: 'LayoutDashboard' },
    { id: 'requirements', label: 'Requirements', icon: 'FileText' },
    { id: 'capabilities', label: 'Capabilities', icon: 'Shield' },
    { id: 'resources', label: 'Resource Planning', icon: 'Users' },
    { id: 'business-plan', label: 'Business Plan', icon: 'Building2' },
    { id: 'analytics', label: 'Analytics', icon: 'BarChart3' },
    { id: 'maturity-analysis', label: 'Maturity Analysis', icon: 'TrendingUp' },
    { id: 'mitre-attack', label: 'MITRE ATT&CK', icon: 'Layers' },
    { id: 'standards-frameworks', label: 'Standards & Frameworks', icon: 'BookOpen' },
    { id: 'threat-intelligence', label: 'Threat Intelligence', icon: 'AlertTriangle' },
    { id: 'incident-management', label: 'Incident Management', icon: 'AlertCircle' },
    { id: 'risk-management', label: 'Risk Management', icon: 'Target' },
    { id: 'trust', label: 'Trust', icon: 'Heart' },
    { id: 'settings', label: 'Settings', icon: 'Settings' },
  ];

  return (
    <div className="h-screen flex bg-background-light dark:bg-background-dark">
      {/* Sidebar */}
      <aside
        className={`
          ${themeClasses.sidebar} 
          ${sidebarExpanded ? 'w-64' : 'w-16'} 
          transition-all duration-300 ease-in-out 
          fixed md:relative 
          h-screen 
          z-40 md:z-auto 
          ${sidebarExpanded ? 'left-0' : '-left-64 md:left-0'}
          shadow-lg md:shadow-none
        `}
        aria-label="Dashboard navigation"
      >
        {/* Logo */}
        <div className="flex items-center justify-center py-6 px-4 border-b border-secondary-700/30">
          <ProductLogo expanded={sidebarExpanded} />
        </div>

        {/* Navigation */}
        <div className="flex-1 flex flex-col py-4 overflow-y-auto">
          <nav className="flex-1 px-2 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = iconMap[item.icon];
              const isActive = currentPath === item.id;
              const commonClasses = `
                w-full text-left
                sidebar-item
                ${isActive ? 'sidebar-item-active' : 'sidebar-item-inactive'}
                ${!sidebarExpanded ? 'justify-center' : ''}
              `;

              return (
                <Link
                  className={commonClasses}
                  key={item.id}
                  to={`/dashboard/${item.id}`}
                  onClick={() => setViewMode(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon
                    className={`w-6 h-6 flex-shrink-0 ${!sidebarExpanded ? '' : 'mr-3'}`}
                    aria-hidden="true"
                  />
                  {sidebarExpanded && <span className="truncate text-base">{item.label}</span>}
                </Link>
              );
            })}
          </nav>

          {/* Collapse Button */}
          <div className="mt-2 border-t border-secondary-700/20 dark:border-secondary-700 pt-2">
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

          {/* Trust Score Footer */}
          {sidebarExpanded && (
            <div className="px-4 py-3 mt-auto">
              <div className="bg-secondary-800 bg-opacity-50 rounded-lg p-3">
                <div className="text-xs text-secondary-400 mb-1">Trust Score</div>
                <div className="flex items-center">
                  <div className="text-lg font-semibold text-white">78</div>
                  <div className="ml-auto px-1.5 py-0.5 rounded-full bg-yellow-500 bg-opacity-20 text-yellow-400 text-xs">
                    -3 Δ
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main content layout */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header
          className={`${themeClasses.header} h-16 flex items-center justify-between px-4 shadow-sm z-20`}
          aria-label="Dashboard header"
        >
          <div className="flex items-center">
            <button
              className="p-2 rounded-md text-secondary-500 hover:bg-secondary-100 dark:hover:bg-secondary-700 md:hidden"
              onClick={handleSidebarToggle}
              aria-label={sidebarExpanded ? 'Close sidebar' : 'Open sidebar'}
            >
              {sidebarExpanded ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className={`flex items-center ${sidebarExpanded ? 'hidden md:flex' : 'flex'}`}>
              <ProductLogo expanded={false} size="small" />
              <span className="ml-2 text-xl font-semibold text-primary-600 dark:text-primary-400">
                Cyber Trust Sensor
              </span>
            </div>
          </div>
          <UserSettingsDropdown />
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto transition-all duration-300 ease-in-out">
          {sidebarExpanded && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
              onClick={handleSidebarToggle}
              aria-hidden="true"
            />
          )}
          <div className="p-4 md:p-6 h-full">{children}</div>
        </main>
      </div>

      {/* Global Modal Manager */}
      <ModalManager />
    </div>
  );
};

DashboardLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default DashboardLayout;