// src/components/layout/Sidebar.jsx
import React from 'react';
import { 
  TrendingUp, Network, FileText, Building2, Gauge, Star, BarChart3,
  Upload, Download, Trash2, ChevronLeft, ChevronRight, Menu, X
} from 'lucide-react';

const Sidebar = ({ 
  expanded, 
  currentView, 
  isMobile,
  onToggle, 
  onViewChange, 
  onUpload,
  onExport,
  onPurge
}) => {
  const navigationItems = [
    { id: 'overview', name: 'Overview', icon: TrendingUp },
    { id: 'capabilities', name: 'Capabilities', icon: Network },
    { id: 'requirements', name: 'Requirements', icon: FileText },
    { id: 'pcd', name: 'PCD Breakdown', icon: Building2 },
    { id: 'maturity', name: 'Maturity Analysis', icon: Gauge },
    { id: 'justification', name: 'Business Value', icon: Star },
    { id: 'analytics', name: 'Analytics', icon: BarChart3 }
  ];

  const dataManagementItems = [
    { id: 'upload', name: 'Upload CSV', icon: Upload, onClick: onUpload },
    { id: 'export', name: 'Export CSV', icon: Download, onClick: onExport },
    { id: 'purge', name: 'Purge Data', icon: Trash2, onClick: onPurge, danger: true }
  ];

  const handleViewChange = (viewId) => {
    onViewChange(viewId);
    
    // Auto-close sidebar on mobile after navigation
    if (isMobile && expanded) {
      onToggle();
    }
  };

  const sidebarClasses = `
    bg-gray-900 text-white flex flex-col transition-all duration-300 z-50
    ${isMobile 
      ? expanded 
        ? 'fixed inset-y-0 left-0 w-64 shadow-2xl' 
        : 'hidden'
      : expanded 
        ? 'relative w-64' 
        : 'relative w-16'
    }
  `;

  return (
    <>
      {/* Mobile backdrop */}
      {isMobile && expanded && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <nav 
        className={sidebarClasses}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            {expanded && (
              <h2 className="text-lg font-semibold" id="nav-title">
                OT Dashboard
              </h2>
            )}
            <button
              onClick={onToggle}
              className="p-2 hover:bg-blue-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
              aria-expanded={expanded}
              aria-controls="sidebar-content"
            >
              {isMobile ? (
                expanded ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />
              ) : (
                expanded ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* Navigation Items */}
        <div id="sidebar-content" className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-1" role="list">
            {navigationItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => handleViewChange(item.id)}
                  className={`
                    w-full flex items-center px-3 py-2 rounded-lg transition-colors 
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900
                    ${currentView === item.id
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-gray-300 hover:bg-blue-600 hover:text-white'
                    }
                  `}
                  aria-current={currentView === item.id ? 'page' : undefined}
                  aria-label={`Navigate to ${item.name}`}
                  title={!expanded ? item.name : undefined}
                >
                  <item.icon 
                    className="h-5 w-5 flex-shrink-0" 
                    aria-hidden="true"
                  />
                  {expanded && (
                    <span className="ml-3 truncate font-medium">{item.name}</span>
                  )}
                  
                  {/* Active indicator for collapsed state */}
                  {!expanded && currentView === item.id && (
                    <div className="absolute left-0 w-1 h-8 bg-blue-400 rounded-r-full" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Data Management Section - Only show when expanded */}
        {expanded && (
          <div className="p-4 border-t border-gray-700">
            <h3 
              className="text-sm font-medium text-gray-300 mb-3"
              id="data-management-heading"
            >
              Data Management
            </h3>
            <div 
              className="space-y-1" 
              role="group" 
              aria-labelledby="data-management-heading"
            >
              {dataManagementItems.map((item) => (
                <button
                  key={item.id}
                  onClick={item.onClick}
                  className={`
                    w-full flex items-center px-3 py-2 text-sm rounded-lg transition-colors 
                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900
                    ${item.danger 
                      ? 'text-red-400 hover:bg-red-900 hover:bg-opacity-20 focus:ring-red-500' 
                      : 'text-gray-300 hover:bg-blue-600 hover:text-white focus:ring-blue-500'
                    }
                  `}
                  aria-label={item.name}
                >
                  <item.icon className="h-4 w-4 mr-3 flex-shrink-0" aria-hidden="true" />
                  {item.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Collapsed state data management - Icon only */}
        {!expanded && !isMobile && (
          <div className="p-2 border-t border-gray-700 space-y-1">
            {dataManagementItems.map((item) => (
              <button
                key={item.id}
                onClick={item.onClick}
                className={`
                  w-full flex items-center justify-center p-2 rounded-lg transition-colors
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900
                  ${item.danger 
                    ? 'text-red-400 hover:bg-red-900 hover:bg-opacity-20 focus:ring-red-500' 
                    : 'text-gray-300 hover:bg-blue-600 hover:text-white focus:ring-blue-500'
                  }
                `}
                aria-label={item.name}
                title={item.name}
              >
                <item.icon className="h-4 w-4" aria-hidden="true" />
              </button>
            ))}
          </div>
        )}

        {/* Footer - Version info for expanded state */}
        {expanded && (
          <div className="p-4 border-t border-gray-700 text-center">
            <p className="text-xs text-gray-500">
              Dashboard v2.0
            </p>
            <p className="text-xs text-gray-600 mt-1">
              Portal System Active
            </p>
          </div>
        )}
      </nav>
    </>
  );
};

export default Sidebar;