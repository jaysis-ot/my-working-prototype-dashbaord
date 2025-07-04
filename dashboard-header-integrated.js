// src/components/layout/DashboardHeader.jsx
import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Menu, 
  Plus, 
  Upload, 
  Settings, 
  Moon, 
  Sun, 
  Bell,
  User,
  ChevronDown,
  X,
  Command
} from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useDashboardState } from '../../hooks/useDashboardState';
import { VIEW_MODES } from '../../constants';

/**
 * Dashboard Header Component
 * 
 * Integrated header that provides navigation, search, actions, and user controls.
 * Fully integrated with the dashboard state management system.
 * 
 * Features:
 * - Global search with keyboard shortcuts
 * - View navigation breadcrumbs
 * - Action buttons with modal integration
 * - Theme toggle and user menu
 * - Responsive design with mobile optimizations
 * - Filter indicator and quick clear
 * - Real-time search suggestions
 * - Keyboard navigation support
 */

const DashboardHeader = ({
  currentView,
  onViewChange,
  searchTerm,
  onSearchChange,
  isMobile,
  sidebarExpanded,
  onToggleSidebar,
  showFilters,
  onToggleFilters,
  activeFilterCount,
  onClearFilters,
  className = '',
  ...props
}) => {
  const { theme, toggleTheme, getThemeClasses } = useTheme();
  const { state, actions } = useDashboardState();
  
  // Local state for search and user menu
  const [searchFocused, setSearchFocused] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  
  const searchRef = useRef(null);
  const userMenuRef = useRef(null);

  // =============================================================================
  // SEARCH FUNCTIONALITY
  // =============================================================================

  const handleSearchChange = (e) => {
    const value = e.target.value;
    onSearchChange(value);
    
    // Generate search suggestions (mock data for now)
    if (value.length > 1) {
      const suggestions = [
        `Requirements containing "${value}"`,
        `Capabilities matching "${value}"`,
        `Risks related to "${value}"`
      ];
      setSearchSuggestions(suggestions);
    } else {
      setSearchSuggestions([]);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      actions.trackSearchEvent(searchTerm);
      // Perform search logic here
      setSearchSuggestions([]);
      searchRef.current?.blur();
    }
  };

  const clearSearch = () => {
    onSearchChange('');
    setSearchSuggestions([]);
    actions.clearSearch();
  };

  // =============================================================================
  // KEYBOARD SHORTCUTS
  // =============================================================================

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Cmd/Ctrl + K to focus search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
      }
      
      // Escape to clear search when focused
      if (e.key === 'Escape' && searchFocused) {
        clearSearch();
        searchRef.current?.blur();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [searchFocused]);

  // =============================================================================
  // CLICK OUTSIDE HANDLERS
  // =============================================================================

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // =============================================================================
  // VIEW HELPERS
  // =============================================================================

  const getViewTitle = (view) => {
    const titles = {
      [VIEW_MODES.OVERVIEW]: 'Overview',
      [VIEW_MODES.REQUIREMENTS]: 'Requirements',
      [VIEW_MODES.CAPABILITIES]: 'Capabilities', 
      [VIEW_MODES.RISK]: 'Risk Analysis',
      [VIEW_MODES.REPORTS]: 'Reports',
      [VIEW_MODES.ANALYTICS]: 'Analytics'
    };
    return titles[view] || 'Dashboard';
  };

  const getBreadcrumbs = () => {
    const breadcrumbs = ['Dashboard'];
    
    if (currentView !== VIEW_MODES.OVERVIEW) {
      breadcrumbs.push(getViewTitle(currentView));
    }
    
    if (state.ui?.selectedCapability) {
      breadcrumbs.push('Capability Details');
    }
    
    return breadcrumbs;
  };

  // =============================================================================
  // ACTION HANDLERS
  // =============================================================================

  const handleQuickAction = (action) => {
    switch (action) {
      case 'upload':
        actions.toggleUploadModal();
        break;
      case 'new-capability':
        actions.toggleNewCapabilityModal();
        break;
      case 'settings':
        actions.toggleThreatSettingsModal();
        break;
      case 'profile':
        actions.toggleCompanyProfileModal();
        break;
    }
    
    actions.trackUserAction('quickAction', { action });
  };

  // =============================================================================
  // RENDER COMPONENTS
  // =============================================================================

  const renderMobileMenu = () => (
    <button
      onClick={onToggleSidebar}
      className={`
        p-2 rounded-lg transition-colors
        hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500
        ${getThemeClasses('header', 'mobileMenuButton')}
      `}
      aria-label="Toggle navigation menu"
    >
      <Menu className="w-5 h-5" />
    </button>
  );

  const renderBreadcrumbs = () => (
    <nav className="hidden md:flex items-center space-x-2 text-sm">
      {getBreadcrumbs().map((crumb, index, array) => (
        <React.Fragment key={crumb}>
          <span
            className={`
              ${index === array.length - 1 
                ? 'text-gray-900 font-medium' 
                : 'text-gray-500 hover:text-gray-700 cursor-pointer'
              }
              ${getThemeClasses('header', 'breadcrumb')}
            `}
            onClick={() => {
              if (index === 0) onViewChange(VIEW_MODES.OVERVIEW);
            }}
          >
            {crumb}
          </span>
          {index < array.length - 1 && (
            <span className="text-gray-400">/</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );

  const renderSearchBar = () => (
    <div className="relative flex-1 max-w-2xl mx-4">
      <form onSubmit={handleSearchSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            ref={searchRef}
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
            placeholder="Search requirements, capabilities, risks..."
            className={`
              w-full pl-10 pr-10 py-2 border rounded-lg
              focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              transition-all duration-200
              ${getThemeClasses('header', 'searchInput')}
            `}
          />
          {searchTerm && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          
          {/* Search shortcut hint */}
          {!searchFocused && !searchTerm && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 hidden sm:flex items-center gap-1 text-xs text-gray-400">
              <Command className="w-3 h-3" />
              <span>K</span>
            </div>
          )}
        </div>
        
        {/* Search suggestions */}
        {searchFocused && searchSuggestions.length > 0 && (
          <div className={`
            absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-50
            ${getThemeClasses('header', 'searchSuggestions')}
          `}>
            {searchSuggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                onClick={() => {
                  onSearchChange(suggestion);
                  setSearchSuggestions([]);
                }}
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </form>
    </div>
  );

  const renderFilterIndicator = () => (
    <div className="flex items-center gap-2">
      <button
        onClick={onToggleFilters}
        className={`
          relative p-2 rounded-lg transition-colors
          ${showFilters 
            ? 'bg-blue-100 text-blue-600' 
            : 'hover:bg-gray-100 text-gray-600'
          }
          ${getThemeClasses('header', 'filterButton')}
        `}
        aria-label="Toggle filters"
      >
        <Filter className="w-4 h-4" />
        {activeFilterCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {activeFilterCount}
          </span>
        )}
      </button>
      
      {activeFilterCount > 0 && (
        <button
          onClick={onClearFilters}
          className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded"
        >
          Clear {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''}
        </button>
      )}
    </div>
  );

  const renderActionButtons = () => (
    <div className="flex items-center gap-2">
      {/* Upload Button */}
      <button
        onClick={() => handleQuickAction('upload')}
        className={`
          hidden sm:inline-flex items-center px-3 py-2 border rounded-lg text-sm font-medium
          transition-colors hover:bg-gray-50
          ${getThemeClasses('header', 'actionButton')}
        `}
      >
        <Upload className="w-4 h-4 mr-2" />
        Upload
      </button>
      
      {/* New Capability Button */}
      <button
        onClick={() => handleQuickAction('new-capability')}
        className={`
          inline-flex items-center px-3 py-2 border border-transparent rounded-lg text-sm font-medium
          text-white bg-blue-600 hover:bg-blue-700 transition-colors
        `}
      >
        <Plus className="w-4 h-4 mr-2" />
        {isMobile ? 'New' : 'New Capability'}
      </button>
    </div>
  );

  const renderUserMenu = () => (
    <div className="relative" ref={userMenuRef}>
      <button
        onClick={() => setUserMenuOpen(!userMenuOpen)}
        className={`
          flex items-center gap-2 p-2 rounded-lg transition-colors
          hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500
          ${getThemeClasses('header', 'userMenuButton')}
        `}
      >
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
          <User className="w-4 h-4 text-white" />
        </div>
        {!isMobile && (
          <ChevronDown className={`w-4 h-4 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
        )}
      </button>
      
      {userMenuOpen && (
        <div className={`
          absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-50
          ${getThemeClasses('header', 'userMenuDropdown')}
        `}>
          <div className="p-2">
            <button
              onClick={() => {
                handleQuickAction('profile');
                setUserMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded"
            >
              Company Profile
            </button>
            <button
              onClick={() => {
                handleQuickAction('settings');
                setUserMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded"
            >
              Settings
            </button>
            <hr className="my-1" />
            <button
              onClick={() => {
                toggleTheme();
                setUserMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded flex items-center gap-2"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              {theme === 'dark' ? 'Light' : 'Dark'} Mode
            </button>
          </div>
        </div>
      )}
    </div>
  );

  // =============================================================================
  // MAIN RENDER
  // =============================================================================

  return (
    <header
      className={`
        dashboard-header
        bg-white border-b border-gray-200 shadow-sm
        sticky top-0 z-40
        ${getThemeClasses('header', 'container')}
        ${className}
      `}
      style={{
        height: 'var(--dashboard-header-height)',
        transition: 'var(--dashboard-transition)'
      }}
      {...props}
    >
      <div className="h-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-full">
          {/* Left Section */}
          <div className="flex items-center gap-4 flex-1">
            {isMobile && renderMobileMenu()}
            {renderBreadcrumbs()}
          </div>

          {/* Center Section - Search */}
          {renderSearchBar()}

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {renderFilterIndicator()}
            {renderActionButtons()}
            
            {/* Notifications */}
            <button
              className={`
                relative p-2 rounded-lg transition-colors
                hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500
                ${getThemeClasses('header', 'notificationButton')}
              `}
            >
              <Bell className="w-5 h-5" />
              {/* Notification badge */}
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                3
              </span>
            </button>

            {renderUserMenu()}
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;