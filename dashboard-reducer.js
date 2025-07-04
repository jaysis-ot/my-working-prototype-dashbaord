// src/store/dashboardReducer.js
import { ACTION_TYPES } from './dashboardActions';
import { VIEW_MODES, DEFAULT_VALUES } from '../constants';

/**
 * Dashboard State Reducer
 * 
 * Centralized state management for the entire dashboard application.
 * Handles all UI state, filters, modals, and user preferences.
 * 
 * Features:
 * - Immutable state updates with proper React patterns
 * - Comprehensive action handling for all dashboard features
 * - Type-safe action dispatching with clear state transitions
 * - Performance optimized with selective state updates
 * - Integration with localStorage for persistence
 * - Proper error handling and state validation
 */

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Create a new state object with updated properties
 * Ensures immutability and prevents accidental mutations
 */
const updateState = (state, updates) => ({
  ...state,
  ...updates
});

/**
 * Update nested state properties immutably
 */
const updateNestedState = (state, path, value) => {
  const keys = path.split('.');
  if (keys.length === 1) {
    return { ...state, [keys[0]]: value };
  }
  
  const [firstKey, ...restKeys] = keys;
  return {
    ...state,
    [firstKey]: updateNestedState(state[firstKey] || {}, restKeys.join('.'), value)
  };
};

/**
 * Toggle boolean value in nested state
 */
const toggleNestedBoolean = (state, path) => {
  const keys = path.split('.');
  const currentValue = keys.reduce((obj, key) => obj?.[key], state);
  return updateNestedState(state, path, !currentValue);
};

/**
 * Reset filters to initial state
 */
const resetFilters = () => ({
  status: '',
  capability: '',
  applicability: '',
  area: '',
  type: '',
  priority: '',
  businessValue: '',
  maturity: ''
});

/**
 * Reset search state
 */
const resetSearch = () => ({
  searchTerm: '',
  searchResults: [],
  searchHistory: []
});

/**
 * Validate view mode
 */
const validateViewMode = (viewMode) => {
  return Object.values(VIEW_MODES).includes(viewMode) ? viewMode : VIEW_MODES.OVERVIEW;
};

// =============================================================================
// MAIN REDUCER FUNCTION
// =============================================================================

export const dashboardReducer = (state, action) => {
  // Log actions in development mode for debugging
  if (process.env.NODE_ENV === 'development') {
    console.group(`🎯 Dashboard Action: ${action.type}`);
    console.log('Previous State:', state);
    console.log('Action:', action);
  }

  try {
    let newState;

    switch (action.type) {
      // =================================================================
      // FILTER ACTIONS
      // =================================================================
      
      case ACTION_TYPES.SET_FILTER:
        newState = updateState(state, {
          filters: {
            ...state.filters,
            [action.field]: action.value
          }
        });
        break;

      case ACTION_TYPES.CLEAR_FILTERS:
        newState = updateState(state, {
          filters: resetFilters()
        });
        break;

      case ACTION_TYPES.SET_SEARCH_TERM:
        newState = updateState(state, {
          searchTerm: action.searchTerm,
          // Add to search history if it's a new search
          searchHistory: action.searchTerm && !state.searchHistory.includes(action.searchTerm)
            ? [action.searchTerm, ...state.searchHistory.slice(0, 9)] // Keep last 10 searches
            : state.searchHistory
        });
        break;

      case ACTION_TYPES.CLEAR_SEARCH:
        newState = updateState(state, resetSearch());
        break;

      // =================================================================
      // UI STATE ACTIONS
      // =================================================================

      case ACTION_TYPES.SET_VIEW_MODE:
        const validatedViewMode = validateViewMode(action.viewMode);
        newState = updateNestedState(state, 'ui.viewMode', validatedViewMode);
        break;

      case ACTION_TYPES.TOGGLE_SIDEBAR:
        newState = toggleNestedBoolean(state, 'ui.sidebarExpanded');
        break;

      case ACTION_TYPES.SET_SIDEBAR_EXPANDED:
        newState = updateNestedState(state, 'ui.sidebarExpanded', action.expanded);
        break;

      case ACTION_TYPES.TOGGLE_FILTERS:
        newState = toggleNestedBoolean(state, 'ui.showFilters');
        break;

      case ACTION_TYPES.TOGGLE_COLUMN_SELECTOR:
        newState = toggleNestedBoolean(state, 'ui.showColumnSelector');
        break;

      case ACTION_TYPES.TOGGLE_COLUMN_VISIBILITY:
        newState = updateState(state, {
          columnVisibility: {
            ...state.columnVisibility,
            [action.column]: !state.columnVisibility[action.column]
          }
        });
        break;

      case ACTION_TYPES.SET_CHART_FULLSCREEN:
        newState = updateNestedState(state, 'ui.fullscreenChart', action.chartId);
        break;

      case ACTION_TYPES.SET_IS_MOBILE:
        newState = updateNestedState(state, 'ui.isMobile', action.isMobile);
        break;

      // =================================================================
      // MODAL ACTIONS
      // =================================================================

      case ACTION_TYPES.OPEN_MODAL:
        newState = updateState(state, {
          modal: {
            isOpen: true,
            selectedRequirement: action.requirement,
            editMode: action.editMode || false
          }
        });
        break;

      case ACTION_TYPES.CLOSE_MODAL:
        newState = updateState(state, {
          modal: {
            isOpen: false,
            selectedRequirement: null,
            editMode: false
          }
        });
        break;

      case ACTION_TYPES.TOGGLE_UPLOAD_MODAL:
        newState = toggleNestedBoolean(state, 'ui.showUploadModal');
        break;

      case ACTION_TYPES.TOGGLE_PURGE_MODAL:
        newState = toggleNestedBoolean(state, 'ui.showPurgeModal');
        break;

      case ACTION_TYPES.TOGGLE_NEW_CAPABILITY_MODAL:
        newState = toggleNestedBoolean(state, 'ui.showNewCapabilityModal');
        break;

      case ACTION_TYPES.TOGGLE_COMPANY_PROFILE_MODAL:
        newState = toggleNestedBoolean(state, 'ui.showCompanyProfileModal');
        break;

      case ACTION_TYPES.TOGGLE_THREAT_SETTINGS_MODAL:
        newState = toggleNestedBoolean(state, 'ui.showThreatSettingsModal');
        break;

      // =================================================================
      // SELECTION ACTIONS
      // =================================================================

      case ACTION_TYPES.SET_SELECTED_CAPABILITY:
        newState = updateNestedState(state, 'ui.selectedCapability', action.capabilityId);
        break;

      case ACTION_TYPES.SET_SELECTED_PCD:
        newState = updateNestedState(state, 'ui.selectedPCD', action.pcdId);
        break;

      case ACTION_TYPES.SET_COMPANY_PROFILE_SETUP:
        newState = updateNestedState(state, 'ui.showProfileSetup', action.show);
        break;

      // =================================================================
      // COMPLEX STATE UPDATES
      // =================================================================

      case 'SET_BULK_FILTERS':
        // Handle setting multiple filters at once
        newState = updateState(state, {
          filters: {
            ...state.filters,
            ...action.filters
          }
        });
        break;

      case 'RESET_UI_STATE':
        // Reset all UI state to defaults
        newState = updateState(state, {
          ui: {
            ...state.ui,
            showFilters: false,
            showColumnSelector: false,
            fullscreenChart: null,
            selectedCapability: null,
            selectedPCD: null,
            showUploadModal: false,
            showPurgeModal: false,
            showNewCapabilityModal: false,
            showCompanyProfileModal: false,
            showThreatSettingsModal: false
          },
          modal: {
            isOpen: false,
            selectedRequirement: null,
            editMode: false
          }
        });
        break;

      case 'UPDATE_USER_PREFERENCES':
        // Update user preferences (for future localStorage sync)
        newState = updateState(state, {
          userPreferences: {
            ...state.userPreferences,
            ...action.preferences
          }
        });
        break;

      // =================================================================
      // ERROR HANDLING
      // =================================================================

      case 'SET_ERROR':
        newState = updateState(state, {
          error: action.error,
          loading: false
        });
        break;

      case 'CLEAR_ERROR':
        newState = updateState(state, {
          error: null
        });
        break;

      case 'SET_LOADING':
        newState = updateState(state, {
          loading: action.loading
        });
        break;

      // =================================================================
      // DEFAULT CASE
      // =================================================================

      default:
        console.warn(`Unknown action type: ${action.type}`);
        newState = state;
        break;
    }

    // Log the resulting state in development
    if (process.env.NODE_ENV === 'development') {
      console.log('New State:', newState);
      console.groupEnd();
    }

    return newState;

  } catch (error) {
    console.error('Error in dashboardReducer:', error);
    
    // Return current state with error information
    return updateState(state, {
      error: `Reducer error: ${error.message}`,
      loading: false
    });
  }
};

// =============================================================================
// REDUCER UTILITIES
// =============================================================================

/**
 * Create a middleware function to log state changes
 */
export const createStateLogger = (prefix = 'Dashboard') => {
  return (reducer) => (state, action) => {
    const startTime = performance.now();
    const newState = reducer(state, action);
    const endTime = performance.now();
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`${prefix} State Update: ${action.type} (${(endTime - startTime).toFixed(2)}ms)`);
    }
    
    return newState;
  };
};

/**
 * Create a middleware function to validate state structure
 */
export const createStateValidator = (schema) => {
  return (reducer) => (state, action) => {
    const newState = reducer(state, action);
    
    // Validate state structure in development
    if (process.env.NODE_ENV === 'development') {
      try {
        validateStateStructure(newState, schema);
      } catch (error) {
        console.error('State validation failed:', error);
      }
    }
    
    return newState;
  };
};

/**
 * Validate state structure against expected schema
 */
const validateStateStructure = (state, schema) => {
  const requiredKeys = ['ui', 'filters', 'modal', 'columnVisibility'];
  
  for (const key of requiredKeys) {
    if (!(key in state)) {
      throw new Error(`Missing required state key: ${key}`);
    }
  }
  
  // Validate UI state structure
  const requiredUIKeys = ['viewMode', 'sidebarExpanded', 'isMobile'];
  for (const key of requiredUIKeys) {
    if (!(key in state.ui)) {
      throw new Error(`Missing required UI state key: ${key}`);
    }
  }
};

// =============================================================================
// ENHANCED REDUCER WITH MIDDLEWARE
// =============================================================================

/**
 * Enhanced reducer with logging and validation middleware
 */
export const enhancedDashboardReducer = createStateLogger('Dashboard')(
  createStateValidator()(dashboardReducer)
);

export default dashboardReducer;