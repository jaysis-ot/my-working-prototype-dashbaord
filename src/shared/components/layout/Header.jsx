// src/components/layout/Header.jsx
import React from 'react';
import { 
  Menu, Download, Star, MoreVertical, Layers, Activity, Database,
  Search, Bell, Settings, User, HelpCircle
} from 'lucide-react';

const Header = ({ 
  filteredCount,
  totalCount,
  isMobile,
  sidebarExpanded,
  onToggleSidebar,
  onExport,
  onTestToast,
  showTestButton = false // For demo purposes
}) => {
  const projectStats = [
    { icon: Layers, label: 'Network Segmentation Project' },
    { icon: Activity, label: `${filteredCount} of ${totalCount} requirements` },
    { icon: Database, label: 'Demo data active' }
  ];

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-30">
      <div className="px-4 lg:px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Left Section */}
          <div className="flex items-center min-w-0 flex-1">
            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2 -ml-2 mr-3 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={onToggleSidebar}
              aria-label={sidebarExpanded ? "Close sidebar" : "Open sidebar"}
            >
              <Menu className="h-5 w-5 text-gray-600" />
            </button>
            
            {/* Title and Stats */}
            <div className="min-w-0 flex-1">
              <h1 className="text-xl lg:text-2xl font-bold text-gray-900 truncate">
                OT Requirements Management
              </h1>
              
              {/* Project Stats - Hidden on mobile, shown on larger screens */}
              <div className="hidden sm:flex items-center mt-1 text-xs lg:text-sm text-gray-600 space-x-4">
                {projectStats.map((stat, index) => (
                  <div key={index} className="flex items-center">
                    <stat.icon className="h-3 w-3 lg:h-4 lg:w-4 mr-1 flex-shrink-0" />
                    <span className="truncate">{stat.label}</span>
                  </div>
                ))}
              </div>
              
              {/* Mobile-only simplified stats */}
              <div className="sm:hidden mt-1 text-xs text-gray-600">
                <div className="flex items-center">
                  <Activity className="h-3 w-3 mr-1" />
                  <span>{filteredCount}/{totalCount} requirements</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Section */}
          <div className="flex items-center space-x-2 lg:space-x-3 ml-4">
            {/* Search Button - Mobile */}
            <button
              className="sm:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Search"
            >
              <Search className="h-5 w-5 text-gray-600" />
            </button>

            {/* Notifications */}
            <button
              className="hidden sm:flex p-2 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 relative"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5 text-gray-600" />
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
            </button>

            {/* Test Toast Button - Demo only */}
            {showTestButton && (
              <button 
                onClick={onTestToast}
                className="hidden md:inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <Star className="h-4 w-4 mr-2" />
                Test
              </button>
            )}
            
            {/* Export Button - Desktop */}
            <button 
              onClick={onExport}
              className="hidden sm:inline-flex items-center px-3 lg:px-4 py-2 border border-transparent rounded-lg shadow-sm text-xs lg:text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <Download className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
              <span className="hidden lg:inline">Export CSV</span>
              <span className="lg:hidden">Export</span>
            </button>
            
            {/* Mobile Menu */}
            <div className="relative">
              <button
                className="sm:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="More options"
              >
                <MoreVertical className="h-5 w-5 text-gray-600" />
              </button>
              
              {/* Mobile Dropdown Menu - You can implement this with a proper dropdown component */}
              {/* <MobileDropdownMenu>
                <DropdownMenuItem onClick={onExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </DropdownMenuItem>
                {showTestButton && (
                  <DropdownMenuItem onClick={onTestToast}>
                    <Star className="h-4 w-4 mr-2" />
                    Test Toast
                  </DropdownMenuItem>
                )}
              </MobileDropdownMenu> */}
            </div>

            {/* User Menu - Desktop */}
            <div className="hidden lg:flex items-center space-x-2">
              <button
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Help"
              >
                <HelpCircle className="h-5 w-5 text-gray-600" />
              </button>
              
              <button
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Settings"
              >
                <Settings className="h-5 w-5 text-gray-600" />
              </button>
              
              <button
                className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="User menu"
              >
                <div className="h-6 w-6 bg-blue-600 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700">Admin</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile Project Stats - Expandable */}
        <div className="sm:hidden mt-3 pt-3 border-t border-gray-200">
          <div className="grid grid-cols-1 gap-2 text-xs text-gray-600">
            <div className="flex items-center">
              <Layers className="h-3 w-3 mr-2" />
              <span>Network Segmentation Project</span>
            </div>
            <div className="flex items-center">
              <Database className="h-3 w-3 mr-2" />
              <span>Demo data active</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

// Mobile Dropdown Component (if you want to implement it)
const MobileDropdownMenu = ({ children, isOpen, onClose }) => {
  if (!isOpen) return null;
  
  return (
    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
      {children}
    </div>
  );
};

const DropdownMenuItem = ({ children, onClick }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
  >
    {children}
  </button>
);

export default Header;