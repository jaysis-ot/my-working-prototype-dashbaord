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

// Import hooks properly - make sure the path is correct
import useAuth from '../auth/useAuth'; // <-- Check this import path
// OR if useAuth is exported from AuthContext:
// import { useAuth } from '../../auth/AuthContext';

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
    { id: 'requirements', label: 'Requirements', icon: 'FileText' },
    { id: 'capabilities', label: 'Capabilities', icon: 'Shield' },
    { id: 'resources', label: 'Resource Planning', icon: 'Users' },
    { id: 'analytics', label: 'Analytics', icon: 'BarChart3' },
    { id: 'maturity-analysis', label: 'Maturity Analysis', icon: 'TrendingUp' },
    { id: 'mitre-attack', label: 'MITRE ATT&CK', icon: 'Layers' },
    { id: 'repository', label: 'Repository', icon: 'Database' },
    { id: 'evidence', label: 'Evidence', icon: 'ClipboardList' },
    { id: 'evidence-demo', label: 'Evidence Demo', icon: 'Beaker' },
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
          bg-gray-900 text-white
          ${sidebarExpanded ? 'w-64' : 'w-16'} 
          transition-all duration-300 ease-in-out 
          flex flex-col
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-center h-16 border-b border-gray-800">
          {sidebarExpanded ? (
            <h1 className="text-xl font-bold">Dashboard</h1>
          ) : (
            <span className="text-2xl font-bold">D</span>
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
                        ? 'bg-blue-600 text-white' 
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
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
        <div className="border-t border-gray-800 p-2">
          <button
            onClick={handleSidebarToggle}
            className="w-full flex items-center justify-center px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
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
            <h2 className="text-xl font-semibold text-gray-800 capitalize">
              {currentPath.replace('-', ' ')}
            </h2>
            {user && (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  Welcome, {user.name || user.email}
                </span>
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  {(user.name || user.email || 'U')[0].toUpperCase()}
                </div>
              </div>
            )}
          </div>
        </header>


      </div>
    </div>
  );
};

export default DashboardLayout;