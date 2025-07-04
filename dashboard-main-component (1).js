// src/components/Dashboard.jsx
import React, { useEffect, useCallback } from 'react';
import { useDashboardState } from '../hooks/useDashboardState';
import { useTheme } from '../hooks/useTheme';
import { complexActions } from '../store/dashboardActions';
import { VIEW_MODES } from '../constants';

// Layout and shell components
import DashboardLayout from './layout/DashboardLayout';
import DashboardHeader from './layout/DashboardHeader';
import DashboardSidebar from './layout/DashboardSidebar';
import ModalProvider from './common/ModalProvider';
import ErrorBoundary from './common/ErrorBoundary';
import LoadingSpinner from './common/LoadingSpinner';

// View components
import OverviewView from './views/OverviewView';
import RequirementsView from './views/RequirementsView';
import CapabilitiesView from './views/CapabilitiesView';
import RiskView from './views/RiskView';
import ReportsView from './views/ReportsView';
import AnalyticsView from './views/AnalyticsView';

// Utility components
import Toast from './common/Toast';

/**
 * Main Dashboard Component
 * 
 * The central component that orchestrates the entire dashboard application.
 * Integrates state management, routing, theming, modals, and responsive behavior.
 * 
 * Features:
 * - Complete state management integration
 * - Responsive design with mobile optimization
 * - Theme system integration
 * - Modal management through provider
 * - View routing and navigation
 * - Error boundary protection
 * - Analytics and performance tracking
 * - Keyboard shortcuts and accessibility
 * - Real-time responsive updates
 */

const Dashboard = () => {
  const { state, dispatch, actions } = useDashboardState();
  const { theme, toggleTheme } = useTheme();

  // =============================================================================
  // RESPONSIVE HANDLING
  // =============================================================================

  const handleResponsiveChange = useCallback(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    dispatch(complexActions.handleResponsiveChange({ width, height }));
  }, [dispatch]);

  // Set up responsive listeners
  useEffect(() => {
    // Initial responsive state
    handleResponsiveChange();

    // Listen for resize events
    const handleResize = () => {
      handleResponsiveChange();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResponsiveChange]);

  // =============================================================================
  // INITIALIZATION
  // =============================================================================

  useEffect(() => {
    // Initialize dashboard
    dispatch(complexActions.initializeDashboard());

    // Check for new user setup
    const isNewUser = !localStorage.getItem('profileSetupComplete');
    if (isNewUser) {
      actions.setCompanyProfileSetup(true);
    }

    // Set up online/offline listeners
    const handleOnline = () => actions.setOnlineStatus(true);
    const handleOffline = () => actions.setOnlineStatus(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [dispatch, actions]);

  // =============================================================================
  // KEYBOARD SHORTCUTS
  // =============================================================================

  useEffect(() => {
    const handleKeyPress = (event) => {
      // Only handle shortcuts when no modal is open
      if (state.modal.isOpen) return;

      const { ctrlKey, metaKey, key } = event;
      const modifier = ctrlKey || metaKey;

      switch (key) {
        case '1':
          if (modifier) {
            event.preventDefault();
            actions.setViewMode(VIEW_MODES.OVERVIEW);
          }
          break;
        case '2':
          if (modifier) {
            event.preventDefault();
            actions.setViewMode(VIEW_MODES.REQUIREMENTS);
          }
          break;
        case '3':
          if (modifier) {
            event.preventDefault();
            actions.setViewMode(VIEW_MODES.CAPABILITIES);
          }
          break;
        case '4':
          if (modifier) {
            event.preventDefault();
            actions.setViewMode(VIEW_MODES.RISK);
          }
          break;
        case 'k':
          if (modifier) {
            event.preventDefault();
            // Focus search (will be implemented with search component)
            console.log('Focus search shortcut');
          }
          break;
        case 'b':
          if (modifier) {
            event.preventDefault();
            actions.toggleSidebar();
          }
          break;
        case 'd':
          if (modifier) {
            event.preventDefault();
            toggleTheme();
          }
          break;
        case 'Escape':
          // Clear any selections or close panels
          actions.clearAllSelections();
          if (state.ui.showFilters) {
            actions.toggleFilters();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [state.modal.isOpen, state.ui.showFilters, actions, toggleTheme]);

  // =============================================================================
  // VIEW ROUTING
  // =============================================================================

  const renderCurrentView = () => {
    if (state.system?.loading || state.loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="large" message="Loading dashboard..." />
        </div>
      );
    }

    if (state.system?.error || state.error) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-red-600 text-lg font-medium mb-2">
              Error Loading Dashboard
            </div>
            <div className="text-gray-600 mb-4">
              {state.system?.error || state.error}
            </div>
            <button
              onClick={() => {
                actions.clearError();
                dispatch(complexActions.initializeDashboard());
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    switch (state.ui.viewMode) {
      case VIEW_MODES.OVERVIEW:
        return <OverviewView />;
      case VIEW_MODES.REQUIREMENTS:
        return <RequirementsView />;
      case VIEW_MODES.CAPABILITIES:
        return <CapabilitiesView />;
      case VIEW_MODES.RISK:
        return <RiskView />;
      case VIEW_MODES.REPORTS:
        return <ReportsView />;
      case VIEW_MODES.ANALYTICS:
        return <AnalyticsView />;
      default:
        return <OverviewView />;
    }
  };

  // =============================================================================
  // NAVIGATION HANDLING
  // =============================================================================

  const handleNavigation = useCallback((viewMode, options = {}) => {
    const { filter, isMobile } = options;
    
    if (filter) {
      dispatch(complexActions.navigateWithFilter(viewMode, filter.field, filter.value));
    } else if (isMobile && state.ui.sidebarExpanded) {
      dispatch(complexActions.navigateOnMobile(viewMode, isMobile, state.ui.sidebarExpanded));
    } else {
      actions.setViewMode(viewMode);
    }
  }, [dispatch, actions, state.ui.sidebarExpanded]);

  // =============================================================================
  // PERFORMANCE TRACKING
  // =============================================================================

  useEffect(() => {
    // Track render count for performance monitoring
    actions.incrementRenderCount?.();
    
    // Log performance metrics in development
    if (process.env.NODE_ENV === 'development') {
      const renderTime = performance.now();
      console.log(`Dashboard render: ${state.ui.viewMode} (${renderTime.toFixed(2)}ms)`);
    }
  });

  // =============================================================================
  // MAIN RENDER
  // =============================================================================

  return (
    <ErrorBoundary>
      <ModalProvider>
        <DashboardLayout>
          {/* Header */}
          <DashboardHeader
            currentView={state.ui.viewMode}
            onViewChange={handleNavigation}
            searchTerm={state.searchTerm || state.search?.searchTerm || ''}
            onSearchChange={actions.setSearchTerm}
            isMobile={state.ui.isMobile}
            sidebarExpanded={state.ui.sidebarExpanded}
            onToggleSidebar={actions.toggleSidebar}
            showFilters={state.ui.showFilters}
            onToggleFilters={actions.toggleFilters}
            activeFilterCount={Object.values(state.filters || {}).filter(v => v && v !== '').length}
            onClearFilters={actions.clearFilters}
          />

          <div className="flex flex-1 overflow-hidden">
            {/* Sidebar */}
            <DashboardSidebar
              currentView={state.ui.viewMode}
              onViewChange={handleNavigation}
              expanded={state.ui.sidebarExpanded}
              onToggle={actions.toggleSidebar}
              isMobile={state.ui.isMobile}
              capabilities={[]} // Will be populated from data
              selectedCapability={state.ui.selectedCapability}
              onCapabilitySelect={actions.setSelectedCapability}
            />

            {/* Main Content */}
            <main className={`
              flex-1 overflow-auto bg-gray-50
              transition-all duration-200 ease-in-out
              ${state.ui.isMobile && state.ui.sidebarExpanded ? 'hidden' : 'block'}
            `}>
              <div className="h-full">
                {renderCurrentView()}
              </div>
            </main>
          </div>

          {/* Global Components */}
          <Toast />
          
          {/* Keyboard Shortcuts Help (shown on Ctrl+?) */}
          {state.ui.showKeyboardHelp && (
            <KeyboardShortcutsHelp onClose={() => actions.setShowKeyboardHelp(false)} />
          )}

          {/* Connection Status Indicator */}
          {!state.system?.isOnline && (
            <div className="fixed bottom-4 left-4 bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-lg">
              <span className="text-sm font-medium">Offline Mode</span>
            </div>
          )}

          {/* Performance Indicator (Development) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="fixed bottom-4 right-4 bg-gray-800 text-white px-3 py-1 rounded text-xs">
              Renders: {state.ui?.renderCount || 0}
            </div>
          )}
        </DashboardLayout>
      </ModalProvider>
    </ErrorBoundary>
  );
};

// =============================================================================
// HELPER COMPONENTS
// =============================================================================

/**
 * Keyboard Shortcuts Help Modal
 */
const KeyboardShortcutsHelp = ({ onClose }) => {
  const shortcuts = [
    { key: 'Ctrl+1', description: 'Overview' },
    { key: 'Ctrl+2', description: 'Requirements' },
    { key: 'Ctrl+3', description: 'Capabilities' },
    { key: 'Ctrl+4', description: 'Risk Analysis' },
    { key: 'Ctrl+K', description: 'Focus Search' },
    { key: 'Ctrl+B', description: 'Toggle Sidebar' },
    { key: 'Ctrl+D', description: 'Toggle Theme' },
    { key: 'Esc', description: 'Clear Selections' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Keyboard Shortcuts</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
          
          <div className="space-y-2">
            {shortcuts.map((shortcut, index) => (
              <div key={index} className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600">{shortcut.description}</span>
                <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs font-mono">
                  {shortcut.key}
                </kbd>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// DASHBOARD HOC FOR ADDITIONAL FEATURES
// =============================================================================

/**
 * Enhanced Dashboard with additional providers and context
 */
export const EnhancedDashboard = ({ children, ...props }) => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <NotificationProvider>
          <AnalyticsProvider>
            <Dashboard {...props}>
              {children}
            </Dashboard>
          </AnalyticsProvider>
        </NotificationProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

// =============================================================================
// DEVELOPMENT UTILITIES
// =============================================================================

/**
 * Dashboard with development tools
 */
export const DashboardWithDevTools = (props) => {
  const [showDevTools, setShowDevTools] = React.useState(false);

  React.useEffect(() => {
    const handleDevToggle = (event) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'D') {
        event.preventDefault();
        setShowDevTools(prev => !prev);
      }
    };

    document.addEventListener('keydown', handleDevToggle);
    return () => document.removeEventListener('keydown', handleDevToggle);
  }, []);

  return (
    <>
      <Dashboard {...props} />
      {showDevTools && process.env.NODE_ENV === 'development' && (
        <DashboardDevTools onClose={() => setShowDevTools(false)} />
      )}
    </>
  );
};

/**
 * Development tools panel
 */
const DashboardDevTools = ({ onClose }) => {
  const { state, actions } = useDashboardState();

  return (
    <div className="fixed top-4 right-4 bg-gray-900 text-white p-4 rounded-lg shadow-xl max-w-sm z-50">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium">Dev Tools</h4>
        <button onClick={onClose} className="text-gray-400 hover:text-white">×</button>
      </div>
      
      <div className="space-y-2 text-xs">
        <div>View: {state.ui.viewMode}</div>
        <div>Mobile: {state.ui.isMobile ? 'Yes' : 'No'}</div>
        <div>Sidebar: {state.ui.sidebarExpanded ? 'Expanded' : 'Collapsed'}</div>
        <div>Modal: {state.modal.isOpen ? 'Open' : 'Closed'}</div>
        <div>Active Filters: {Object.values(state.filters || {}).filter(v => v).length}</div>
        <div>Renders: {state.ui?.renderCount || 0}</div>
      </div>
      
      <div className="mt-3 pt-3 border-t border-gray-700">
        <button
          onClick={() => actions.resetUIState()}
          className="text-xs bg-red-600 hover:bg-red-700 px-2 py-1 rounded"
        >
          Reset UI State
        </button>
      </div>
    </div>
  );
};

// =============================================================================
// EXPORTS
// =============================================================================

export default Dashboard;

export {
  EnhancedDashboard,
  DashboardWithDevTools
};