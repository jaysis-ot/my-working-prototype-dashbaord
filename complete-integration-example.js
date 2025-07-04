// Complete Dashboard Integration Example
// This file shows how all the components work together in a real application

// =============================================================================
// APP.JSX - ROOT APPLICATION COMPONENT
// =============================================================================

// src/App.jsx
import React from 'react';
import Dashboard from './components/Dashboard';
import { ThemeProvider } from './hooks/useTheme';
import ErrorBoundary from './components/common/ErrorBoundary';
import './styles/globals.css';

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <div className="App">
          <Dashboard />
        </div>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

// =============================================================================
// MAIN DASHBOARD COMPONENT USAGE
// =============================================================================

// src/components/DashboardExample.jsx
import React, { useEffect } from 'react';
import { useDashboardState } from '../hooks/useDashboardState';
import { complexActions } from '../store/dashboardActions';
import { VIEW_MODES } from '../constants';

// Import the complete dashboard
import Dashboard from './Dashboard';

const DashboardExample = () => {
  const { state, dispatch, actions } = useDashboardState();

  // Example of programmatic dashboard control
  useEffect(() => {
    // Initialize dashboard with custom settings
    dispatch(complexActions.initializeDashboard({
      defaultView: VIEW_MODES.OVERVIEW,
      autoRefresh: true,
      enableAnalytics: true
    }));

    // Example: Auto-navigate based on URL or user role
    const urlParams = new URLSearchParams(window.location.search);
    const viewParam = urlParams.get('view');
    
    if (viewParam && Object.values(VIEW_MODES).includes(viewParam)) {
      actions.setViewMode(viewParam);
    }

    // Example: Check for pending tasks and show notifications
    checkPendingTasks();
    
  }, [dispatch, actions]);

  const checkPendingTasks = () => {
    // Mock implementation - would fetch from API
    setTimeout(() => {
      actions.addWarning('You have 3 requirements pending review');
    }, 2000);
  };

  // Example of custom event handlers
  const handleDashboardEvent = (eventType, data) => {
    switch (eventType) {
      case 'requirement_selected':
        console.log('Requirement selected:', data);
        // Custom logic for requirement selection
        break;
      case 'view_changed':
        console.log('View changed to:', data.newView);
        // Update URL or track analytics
        break;
      case 'modal_opened':
        console.log('Modal opened:', data.modalType);
        // Track modal usage
        break;
    }
  };

  return (
    <div className="dashboard-example">
      {/* Debug panel for development */}
      {process.env.NODE_ENV === 'development' && (
        <DashboardDebugPanel state={state} actions={actions} />
      )}
      
      {/* Main dashboard */}
      <Dashboard 
        onEvent={handleDashboardEvent}
        customConfig={{
          enableKeyboardShortcuts: true,
          enableAnalytics: true,
          autoSave: true
        }}
      />
    </div>
  );
};

// =============================================================================
// DEBUG PANEL FOR DEVELOPMENT
// =============================================================================

const DashboardDebugPanel = ({ state, actions }) => {
  const [showDebug, setShowDebug] = React.useState(false);

  React.useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        setShowDebug(prev => !prev);
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, []);

  if (!showDebug) return null;

  return (
    <div className="fixed top-4 left-4 bg-gray-900 text-white p-4 rounded-lg shadow-xl z-50 max-w-md">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold">Dashboard Debug</h3>
        <button 
          onClick={() => setShowDebug(false)}
          className="text-gray-400 hover:text-white"
        >
          ×
        </button>
      </div>
      
      <div className="space-y-2 text-xs">
        <div><strong>Current View:</strong> {state.ui?.viewMode}</div>
        <div><strong>Mobile:</strong> {state.ui?.isMobile ? 'Yes' : 'No'}</div>
        <div><strong>Sidebar:</strong> {state.ui?.sidebarExpanded ? 'Expanded' : 'Collapsed'}</div>
        <div><strong>Modal Open:</strong> {state.modal?.isOpen ? 'Yes' : 'No'}</div>
        <div><strong>Active Filters:</strong> {Object.values(state.filters || {}).filter(v => v).length}</div>
        <div><strong>Search Term:</strong> {state.searchTerm || state.search?.searchTerm || 'None'}</div>
        <div><strong>Theme:</strong> {state.userPreferences?.theme || 'default'}</div>
        <div><strong>Online:</strong> {state.system?.isOnline ? 'Yes' : 'No'}</div>
      </div>
      
      <div className="mt-4 pt-3 border-t border-gray-700">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => actions.setViewMode(VIEW_MODES.REQUIREMENTS)}
            className="bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded text-xs"
          >
            Go to Requirements
          </button>
          <button
            onClick={() => actions.toggleUploadModal()}
            className="bg-green-600 hover:bg-green-700 px-2 py-1 rounded text-xs"
          >
            Open Upload Modal
          </button>
          <button
            onClick={() => actions.setFilter('status', 'Completed')}
            className="bg-purple-600 hover:bg-purple-700 px-2 py-1 rounded text-xs"
          >
            Filter Completed
          </button>
          <button
            onClick={() => actions.clearFilters()}
            className="bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-xs"
          >
            Clear Filters
          </button>
        </div>
      </div>
      
      <div className="mt-3 pt-3 border-t border-gray-700">
        <button
          onClick={() => {
            console.log('Current State:', state);
            actions.trackUserAction('debugStateLogged', { timestamp: Date.now() });
          }}
          className="w-full bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded text-xs"
        >
          Log State to Console
        </button>
      </div>
    </div>
  );
};

// =============================================================================
// INTEGRATION WITH EXTERNAL SYSTEMS
// =============================================================================

// Example: Integration with external API
const DashboardWithAPI = () => {
  const { state, actions } = useDashboardState();
  const [apiData, setApiData] = React.useState(null);

  React.useEffect(() => {
    // Load data from external API
    loadExternalData();
  }, []);

  const loadExternalData = async () => {
    actions.setLoading(true);
    
    try {
      // Mock API call
      const response = await fetch('/api/dashboard-data');
      const data = await response.json();
      
      setApiData(data);
      
      // Update state with API data
      if (data.filters) {
        actions.setBulkFilters(data.filters);
      }
      
      if (data.selectedView) {
        actions.setViewMode(data.selectedView);
      }
      
    } catch (error) {
      actions.setError('Failed to load dashboard data');
      console.error('API Error:', error);
    } finally {
      actions.setLoading(false);
    }
  };

  // Sync state changes back to API
  React.useEffect(() => {
    if (apiData) {
      const syncData = {
        currentView: state.ui?.viewMode,
        filters: state.filters,
        preferences: state.userPreferences
      };
      
      // Debounce API calls
      const timeoutId = setTimeout(() => {
        fetch('/api/dashboard-state', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(syncData)
        });
      }, 1000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [state.ui?.viewMode, state.filters, state.userPreferences, apiData]);

  return <Dashboard />;
};

// =============================================================================
// ANALYTICS AND TRACKING INTEGRATION
// =============================================================================

// Example: Google Analytics integration
const DashboardWithAnalytics = () => {
  const { state, actions } = useDashboardState();

  React.useEffect(() => {
    // Track page views
    if (typeof gtag !== 'undefined') {
      gtag('config', 'GA_MEASUREMENT_ID', {
        page_title: `Dashboard - ${state.ui?.viewMode}`,
        page_location: window.location.href
      });
    }
  }, [state.ui?.viewMode]);

  React.useEffect(() => {
    // Track user actions
    const trackAction = (action, category, label) => {
      if (typeof gtag !== 'undefined') {
        gtag('event', action, {
          event_category: category,
          event_label: label
        });
      }
    };

    // Listen for custom events
    const handleTrackingEvent = (event) => {
      const { type, data } = event.detail;
      
      switch (type) {
        case 'pageView':
          trackAction('page_view', 'navigation', data.viewMode);
          break;
        case 'userAction':
          trackAction(data.action, 'interaction', data.metadata?.source);
          break;
        case 'search':
          trackAction('search', 'search', data.searchTerm);
          break;
        case 'filter':
          trackAction('filter', 'filter', `${data.filterField}:${data.filterValue}`);
          break;
      }
    };

    window.addEventListener('dashboardAnalytics', handleTrackingEvent);
    return () => window.removeEventListener('dashboardAnalytics', handleTrackingEvent);
  }, []);

  return <Dashboard />;
};

// =============================================================================
// REAL-TIME UPDATES INTEGRATION
// =============================================================================

// Example: WebSocket integration for real-time updates
const DashboardWithRealTime = () => {
  const { state, actions } = useDashboardState();
  const [socket, setSocket] = React.useState(null);

  React.useEffect(() => {
    // Initialize WebSocket connection
    const ws = new WebSocket('ws://localhost:8080/dashboard');
    
    ws.onopen = () => {
      console.log('WebSocket connected');
      actions.setOnlineStatus(true);
      setSocket(ws);
    };
    
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      
      switch (message.type) {
        case 'requirement_updated':
          // Refresh requirements data
          actions.trackUserAction('dataUpdated', { 
            type: 'requirement', 
            source: 'websocket' 
          });
          break;
          
        case 'user_joined':
          actions.addWarning(`${message.data.username} joined the dashboard`);
          break;
          
        case 'system_maintenance':
          actions.setError('System maintenance in progress');
          break;
      }
    };
    
    ws.onclose = () => {
      console.log('WebSocket disconnected');
      actions.setOnlineStatus(false);
      setSocket(null);
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      actions.setError('Connection error');
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [actions]);

  // Send state updates to server
  React.useEffect(() => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      const stateUpdate = {
        type: 'state_update',
        data: {
          currentView: state.ui?.viewMode,
          userId: 'current-user-id'
        }
      };
      
      socket.send(JSON.stringify(stateUpdate));
    }
  }, [socket, state.ui?.viewMode]);

  return <Dashboard />;
};

// =============================================================================
// TESTING INTEGRATION
// =============================================================================

// Example test helper for dashboard components
export const DashboardTestWrapper = ({ children, initialState = {} }) => {
  const [testState, setTestState] = React.useState(initialState);
  
  const mockActions = {
    setViewMode: (viewMode) => setTestState(prev => ({ 
      ...prev, 
      ui: { ...prev.ui, viewMode } 
    })),
    toggleSidebar: () => setTestState(prev => ({ 
      ...prev, 
      ui: { ...prev.ui, sidebarExpanded: !prev.ui?.sidebarExpanded } 
    })),
    setFilter: (field, value) => setTestState(prev => ({ 
      ...prev, 
      filters: { ...prev.filters, [field]: value } 
    })),
    // Add other mock actions as needed
  };

  return (
    <div data-testid="dashboard-test-wrapper">
      {React.cloneElement(children, { 
        testState, 
        testActions: mockActions 
      })}
    </div>
  );
};

// =============================================================================
// USAGE EXAMPLES
// =============================================================================

/*
// Basic usage:
function App() {
  return <Dashboard />;
}

// With debugging:
function DevApp() {
  return <DashboardExample />;
}

// With API integration:
function ProductionApp() {
  return <DashboardWithAPI />;
}

// With analytics:
function AnalyticsApp() {
  return <DashboardWithAnalytics />;
}

// With real-time updates:
function RealtimeApp() {
  return <DashboardWithRealTime />;
}

// For testing:
import { render, screen } from '@testing-library/react';

test('dashboard renders correctly', () => {
  render(
    <DashboardTestWrapper initialState={{ ui: { viewMode: 'overview' } }}>
      <Dashboard />
    </DashboardTestWrapper>
  );
  
  expect(screen.getByTestId('dashboard-test-wrapper')).toBeInTheDocument();
});
*/

// =============================================================================
// CONFIGURATION OPTIONS
// =============================================================================

export const DashboardConfig = {
  // Feature flags
  features: {
    realTimeUpdates: true,
    analytics: true,
    keyboardShortcuts: true,
    mobileOptimization: true,
    darkMode: true,
    exportData: true,
    bulkOperations: true
  },
  
  // Theme options
  themes: {
    default: 'light',
    available: ['light', 'dark', 'auto']
  },
  
  // Performance settings
  performance: {
    enableVirtualization: true,
    debounceMs: 300,
    cacheTimeout: 5 * 60 * 1000, // 5 minutes
    maxSearchHistory: 10
  },
  
  // API settings
  api: {
    baseUrl: process.env.REACT_APP_API_URL || '/api',
    timeout: 10000,
    retryAttempts: 3
  },
  
  // Analytics settings
  analytics: {
    trackPageViews: true,
    trackUserActions: true,
    trackErrors: true,
    trackPerformance: true
  }
};

export default DashboardExample;