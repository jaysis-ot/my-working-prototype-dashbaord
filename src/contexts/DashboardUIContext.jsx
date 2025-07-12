import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * Dashboard UI Context for the Cyber Trust Sensor Dashboard
 * 
 * Provides centralized UI state management for the dashboard, including:
 * - View mode management and navigation
 * - Sidebar expansion state
 * - Modal visibility control
 * - Filter management
 * - Search and column visibility preferences
 * 
 * This context extracts and refactors the UI state management from the
 * monolithic RequirementsDashboard component, following the architecture
 * recommendations for separation of concerns.
 */

// Create the context with default values
const DashboardUIContext = createContext({
  state: {},
  dispatch: () => {},
  toggleSidebar: () => {},
  setViewMode: () => {},
  toggleModal: () => {},
  setFilter: () => {},
  clearFilters: () => {},
  setSearchTerm: () => {},
  toggleColumnVisibility: () => {},
  setSelectedCapability: () => {},
  openRequirementModal: () => {},
  closeRequirementModal: () => {},
});

// Action types
export const ACTIONS = {
  SET_VIEW_MODE: 'SET_VIEW_MODE',
  TOGGLE_SIDEBAR: 'TOGGLE_SIDEBAR',
  TOGGLE_MODAL: 'TOGGLE_MODAL',
  SET_FILTER: 'SET_FILTER',
  CLEAR_FILTERS: 'CLEAR_FILTERS',
  SET_SEARCH_TERM: 'SET_SEARCH_TERM',
  TOGGLE_COLUMN_VISIBILITY: 'TOGGLE_COLUMN_VISIBILITY',
  SET_COLUMN_VISIBILITY: 'SET_COLUMN_VISIBILITY',
  SET_SELECTED_CAPABILITY: 'SET_SELECTED_CAPABILITY',
  SET_SELECTED_PCD: 'SET_SELECTED_PCD',
  OPEN_REQUIREMENT_MODAL: 'OPEN_REQUIREMENT_MODAL',
  CLOSE_REQUIREMENT_MODAL: 'CLOSE_REQUIREMENT_MODAL',
  TOGGLE_CHART_FULLSCREEN: 'TOGGLE_CHART_FULLSCREEN',
  TOGGLE_ACTIVE_FILTERS: 'TOGGLE_ACTIVE_FILTERS',
};

// Initial state for the dashboard UI
const initialState = {
  filters: {
    area: '',
    type: '',
    status: '',
    priority: '',
    maturityLevel: '',
    applicability: '',
    capability: ''
  },
  ui: {
    viewMode: 'overview',
    sidebarExpanded: true,
    activeFilters: false,
    chartFullscreen: null,
    showUploadModal: false,
    showPurgeModal: false,
    showNewCapabilityModal: false,
    showColumnSelector: false,
    selectedCapability: null,
    selectedPCD: null
  },
  modal: {
    isOpen: false,
    selectedRequirement: null,
    editMode: false
  },
  searchTerm: '',
  columnVisibility: {
    id: true,
    description: true,
    capability: true,
    progressStatus: true,
    businessValue: true,
    maturity: true,
    applicability: true,
    status: true,
    actions: true,
    area: false,
    type: false,
    priority: false,
    assignee: false,
    dueDate: false
  }
};

// Reducer function to handle state updates
const dashboardUIReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.SET_VIEW_MODE:
      return {
        ...state,
        ui: { ...state.ui, viewMode: action.payload }
      };
    
    case ACTIONS.TOGGLE_SIDEBAR:
      return {
        ...state,
        ui: { ...state.ui, sidebarExpanded: !state.ui.sidebarExpanded }
      };
    
    case ACTIONS.TOGGLE_MODAL:
      return {
        ...state,
        ui: { ...state.ui, [action.payload]: !state.ui[action.payload] }
      };
    
    case ACTIONS.SET_FILTER:
      return {
        ...state,
        filters: { ...state.filters, [action.payload.field]: action.payload.value }
      };
    
    case ACTIONS.CLEAR_FILTERS:
      return {
        ...state,
        filters: { ...initialState.filters },
        searchTerm: ''
      };
    
    case ACTIONS.SET_SEARCH_TERM:
      return {
        ...state,
        searchTerm: action.payload
      };
    
    case ACTIONS.TOGGLE_COLUMN_VISIBILITY:
      return {
        ...state,
        columnVisibility: {
          ...state.columnVisibility,
          [action.payload]: !state.columnVisibility[action.payload]
        }
      };
    
    case ACTIONS.SET_COLUMN_VISIBILITY:
      return {
        ...state,
        columnVisibility: {
          ...state.columnVisibility,
          ...action.payload
        }
      };
    
    case ACTIONS.SET_SELECTED_CAPABILITY:
      return {
        ...state,
        ui: { ...state.ui, selectedCapability: action.payload },
        filters: { ...state.filters, capability: action.payload }
      };
    
    case ACTIONS.SET_SELECTED_PCD:
      return {
        ...state,
        ui: { ...state.ui, selectedPCD: action.payload }
      };
    
    case ACTIONS.OPEN_REQUIREMENT_MODAL:
      return {
        ...state,
        modal: {
          isOpen: true,
          selectedRequirement: action.payload.requirement,
          editMode: action.payload.editMode || false
        }
      };
    
    case ACTIONS.CLOSE_REQUIREMENT_MODAL:
      return {
        ...state,
        modal: {
          isOpen: false,
          selectedRequirement: null,
          editMode: false
        }
      };
    
    case ACTIONS.TOGGLE_CHART_FULLSCREEN:
      return {
        ...state,
        ui: { 
          ...state.ui, 
          chartFullscreen: state.ui.chartFullscreen === action.payload ? null : action.payload 
        }
      };
    
    case ACTIONS.TOGGLE_ACTIVE_FILTERS:
      return {
        ...state,
        ui: { ...state.ui, activeFilters: !state.ui.activeFilters }
      };
    
    default:
      return state;
  }
};

/**
 * Dashboard UI Provider Component
 * 
 * Provides dashboard UI state and actions to all children components
 */
export const DashboardUIProvider = ({ children }) => {
  const [state, dispatch] = useReducer(dashboardUIReducer, initialState);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Sync route with viewMode on initial load and route changes
  useEffect(() => {
    const path = location.pathname.split('/').pop();
    
    // Map route path to viewMode
    if (path && path !== state.ui.viewMode) {
      // Only update if different to avoid loops
      dispatch({ type: ACTIONS.SET_VIEW_MODE, payload: path });
    }
  }, [location.pathname, state.ui.viewMode]);
  
  // Helper functions for common actions
  
  // Toggle sidebar expanded state
  const toggleSidebar = useCallback(() => {
    dispatch({ type: ACTIONS.TOGGLE_SIDEBAR });
  }, []);
  
  // Set the current view mode and navigate to the corresponding route
  const setViewMode = useCallback((mode) => {
    // --------- Enhanced NAVIGATION DEBUG ---------
    // These logs provide a step-by-step trace of what happens
    // whenever navigation is triggered via setViewMode.
    // Guard or remove for production builds if necessary.
    /* eslint-disable no-console */
    console.log('--------- NAVIGATION DEBUG ---------');
    console.log(`Current location      : ${location.pathname}`);
    console.log(`Current viewMode      : ${state.ui.viewMode}`);
    console.log(`Requested viewMode    : ${mode}`);
    console.log(`Target route          : /dashboard/${mode}`);

    // Dispatch action to update the viewMode in local UI state
    dispatch({ type: ACTIONS.SET_VIEW_MODE, payload: mode });

    console.log('Dispatch completed, about to navigate…');

    // Perform the actual navigation
    navigate(`/dashboard/${mode}`);

    console.log('Navigation call completed.');
    console.log('------------------------------------');
    /* eslint-enable no-console */
  }, [navigate, location.pathname, state.ui.viewMode]);
  
  // Toggle a modal's visibility
  const toggleModal = useCallback((modalName) => {
    dispatch({ type: ACTIONS.TOGGLE_MODAL, payload: modalName });
  }, []);
  
  // Set a filter value
  const setFilter = useCallback((field, value) => {
    dispatch({ 
      type: ACTIONS.SET_FILTER, 
      payload: { field, value } 
    });
  }, []);
  
  // Clear all filters
  const clearFilters = useCallback(() => {
    dispatch({ type: ACTIONS.CLEAR_FILTERS });
  }, []);
  
  // Set search term
  const setSearchTerm = useCallback((term) => {
    dispatch({ type: ACTIONS.SET_SEARCH_TERM, payload: term });
  }, []);
  
  // Toggle column visibility
  const toggleColumnVisibility = useCallback((column) => {
    dispatch({ type: ACTIONS.TOGGLE_COLUMN_VISIBILITY, payload: column });
  }, []);
  
  // Set selected capability and update filter
  const setSelectedCapability = useCallback((capabilityId) => {
    dispatch({ type: ACTIONS.SET_SELECTED_CAPABILITY, payload: capabilityId });
  }, []);
  
  // Open requirement modal
  const openRequirementModal = useCallback((requirement, editMode = false) => {
    dispatch({ 
      type: ACTIONS.OPEN_REQUIREMENT_MODAL, 
      payload: { requirement, editMode } 
    });
  }, []);
  
  // Close requirement modal
  const closeRequirementModal = useCallback(() => {
    dispatch({ type: ACTIONS.CLOSE_REQUIREMENT_MODAL });
  }, []);
  
  // Toggle chart fullscreen
  const toggleChartFullscreen = useCallback((chartId) => {
    dispatch({ type: ACTIONS.TOGGLE_CHART_FULLSCREEN, payload: chartId });
  }, []);
  
  // Context value
  const contextValue = {
    state,
    dispatch,
    toggleSidebar,
    setViewMode,
    toggleModal,
    setFilter,
    clearFilters,
    setSearchTerm,
    toggleColumnVisibility,
    setSelectedCapability,
    openRequirementModal,
    closeRequirementModal,
    toggleChartFullscreen,
    
    // Derived values for convenience
    viewMode: state.ui.viewMode,
    sidebarExpanded: state.ui.sidebarExpanded,
    filters: state.filters,
    searchTerm: state.searchTerm,
    columnVisibility: state.columnVisibility,
    selectedCapability: state.ui.selectedCapability,
    modal: state.modal,
    
    // Modal visibility helpers
    showUploadModal: state.ui.showUploadModal,
    showPurgeModal: state.ui.showPurgeModal,
    showNewCapabilityModal: state.ui.showNewCapabilityModal,
    showColumnSelector: state.ui.showColumnSelector,
    
    // Check if any filters are active
    hasActiveFilters: Object.values(state.filters).some(filter => filter !== '') || state.searchTerm !== '',
  };
  
  return (
    <DashboardUIContext.Provider value={contextValue}>
      {children}
    </DashboardUIContext.Provider>
  );
};

DashboardUIProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

/**
 * Hook to use the dashboard UI context
 */
export const useDashboardUI = () => {
  const context = useContext(DashboardUIContext);
  
  if (context === undefined) {
    throw new Error('useDashboardUI must be used within a DashboardUIProvider');
  }
  
  return context;
};

export default DashboardUIContext;
