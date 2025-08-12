// src/components/templates/DashboardLayout.jsx
import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Shield, 
  Users,
  UserCog,
  BarChart3,
  TrendingUp,
  Layers,
  Database,
  ClipboardList,
  Beaker,
  Heart,
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';

// Import useAuth from AuthContext
import { useAuth } from '../../auth/AuthContext';
// User profile dropdown
import UserSettingsDropdown from '../organisms/UserSettingsDropdown';

const DashboardLayout = () => {
  const location = useLocation();
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const currentPath = location.pathname.split('/').pop() || 'overview';
  
  // Try to use auth, but with error handling
  let user = null;
  let isAdmin = false;
  
  try {
    const auth = useAuth();
    user = auth?.user;
    isAdmin = user?.permissions?.includes('manage_users') || false;
  } catch (error) {
    console.error('Auth context not available:', error);
  }

  // Icon mapping
  const iconMap = {
    'LayoutDashboard': LayoutDashboard,
    'FileText': FileText,
    'Shield': Shield,
    'Users': Users,
    'UserCog': UserCog,
    'BarChart3': BarChart3,
    'TrendingUp': TrendingUp,
    'Layers': Layers,
    'Database': Database,
    'ClipboardList': ClipboardList,
    'Beaker': Beaker,
    'Heart': Heart,
    'Settings': Settings
  };

  // Navigation items
  const navItems = [
    { id: 'overview', label: 'Overview', icon: 'LayoutDashboard' },
    { id: 'threat-intelligence', label: 'Threat Intelligence', icon: 'Layers' },
    { id: 'standards-frameworks', label: 'Standards & Frameworks', icon: 'FileText' },
    { id: 'business-plan', label: 'Business Plan', icon: 'FileText' },
    { id: 'risk-management', label: 'Risk Management', icon: 'TrendingUp' },
    { id: 'capabilities', label: 'Capabilities', icon: 'Shield' },
    { id: 'incident-management', label: 'Incident Management', icon: 'ClipboardList' },
    { id: 'requirements', label: 'Requirements', icon: 'FileText' },
    { id: 'resources', label: 'Resource Planning', icon: 'Users' },
    { id: 'analytics', label: 'Analytics', icon: 'BarChart3' },
    { id: 'reporting', label: 'Reporting', icon: 'BarChart3' },
    { id: 'maturity-analysis', label: 'Maturity Analysis', icon: 'TrendingUp' },
    { id: 'mitre-attack', label: 'MITRE ATT&CK', icon: 'Layers' },
    { id: 'repository', label: 'Repository Management', icon: 'Database' },
    { id: 'evidence', label: 'Evidence', icon: 'ClipboardList' },
    { id: 'trust', label: 'Trust', icon: 'Heart' },
    { id: 'settings', label: 'Settings', icon: 'Settings' },
  ];

  // Add users link only for admins
  if (isAdmin) {
    // Insert after resources
    const resourceIndex = navItems.findIndex(item => item.id === 'resources');
    navItems.splice(resourceIndex + 1, 0, 
      { id: 'users', label: 'User Management', icon: 'UserCog' }
    );
  }

  const handleSidebarToggle = () => {
    setSidebarExpanded(!sidebarExpanded);
  };

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`
          bg-secondary-900 text-white
          ${sidebarExpanded ? 'w-64' : 'w-16'} 
          transition-all duration-300 ease-in-out 
          flex flex-col
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-center h-16 border-b border-secondary-800">
          {sidebarExpanded ? (
            <div className="flex items-center">
              {/* circular badge with shield */}
              <div className="w-8 h-8 rounded-full bg-secondary-800 border border-primary-500 flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary-400" />
              </div>
              {/* split-color word-mark */}
              <h1 className="text-xl font-bold ml-2">
                <span className="text-secondary-200">Trust</span>
                <span className="text-white">Guard</span>
              </h1>
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-secondary-800 border border-primary-500 flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary-400" />
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-2">
            {navItems.map((item) => {
              const Icon = iconMap[item.icon] || LayoutDashboard;
              const isActive = currentPath === item.id;
              
              return (
                <li key={item.id}>
                  <Link
                    to={`/dashboard/${item.id}`}
                    className={`
                      flex items-center px-3 py-2 rounded-lg transition-colors
                      ${isActive 
                        ? 'bg-primary-600 text-white' 
                        : 'text-secondary-300 hover:bg-secondary-800 hover:text-white'
                      }
                      ${!sidebarExpanded ? 'justify-center' : ''}
                    `}
                    title={!sidebarExpanded ? item.label : ''}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {sidebarExpanded && (
                      <span className="ml-3">{item.label}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Sidebar Toggle */}
        <div className="border-t border-secondary-800 p-2">
          <button
            onClick={handleSidebarToggle}
            className="w-full flex items-center justify-center px-3 py-2 rounded-lg text-secondary-300 hover:bg-secondary-800 hover:text-white transition-colors"
          >
            {sidebarExpanded ? (
              <ChevronLeft className="w-5 h-5" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-6 py-4">
            {/* Brand in header */}
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full border border-blue-300 bg-blue-50 flex items-center justify-center">
                <Shield className="w-4 h-4 text-blue-600" />
              </div>
              <span className="text-blue-700 font-semibold">Cyber Trust Sensor</span>
            </div>
            <div className="flex items-center space-x-4">
              {user && <UserSettingsDropdown />}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
