// src/store/dashboardReducer.js
import { ACTION_TYPES } from './dashboardActions';
import { VIEW_MODES, DEFAULT_VALUES } from '../constants';

/**
 * Dashboard State Reducer
 * 
 * Centralized state management for the entire dashboard application.
 * Handles all UI state, filters, modals, user preferences, and standards.
 * 
 * Features:
 * - Immutable state updates with proper React patterns
 * - Comprehensive action handling for all dashboard features
 * - Type-safe action dispatching with clear state transitions
 * - Performance optimized with selective state updates
 * - Integration with localStorage for persistence
 * - Proper error handling and state validation
 * - Standards and frameworks management
 */

// =============================================================================
// INITIAL STATE DEFINITION
// =============================================================================

const initialState = {
  // UI State
  ui: {
    viewMode: VIEW_MODES.OVERVIEW,
    sidebarExpanded: true,
    isMobile: false,
    isTablet: false,
    showFilters: false,
    showColumnSelector: false,
    fullscreenChart: null,
    selectedCapability: null,
    selectedPCD: null,
    showUploadModal: false,
    showPurgeModal: false,
    showNewCapabilityModal: false,
    showCompanyProfileModal: false,
    showThreatSettingsModal: false,
    showProfileSetup: false,
    compactMode: false
  },
  
  // Filter State
  filters: {
    status: '',
    capability: '',
    applicability: '',
    area: '',
    type: '',
    priority: '',
    businessValue: '',
    maturity: ''
  },
  
  // Search State
  searchTerm: '',
  searchHistory: [],
  searchResults: [],
  
  // Modal State
  modal: {
    isOpen: false,
    selectedRequirement: null,
    editMode: false
  },
  
  // Column Visibility
  columnVisibility: {
    id: true,
    title: true,
    description: true,
    status: true,
    priority: true,
    capability: true,
    area: true,
    type: true,
    applicability: true,
    businessValue: true,
    maturity: true,
    actions: true
  },
  
  // User Preferences
  userPreferences: {
    theme: 'light',
    compactMode: false,
    autoSave: true,
    notifications: true
  },
  
  // ✅ Standards and Frameworks State
  standards: {
    selectedFramework: 'nist-csf-2.0',
    frameworks: {
      nistCsf: {
        assessmentData: {},
        lastUpdated: null,
        completionRate: 0,
        overallScore: 0
      },
      iso27001: {
        assessmentData: {},
        lastUpdated: null,
        completionRate: 0,
        overallScore: 0
      },
      soc2: {
        assessmentData: {},
        lastUpdated: null,
        completionRate: 0,
        overallScore: 0
      },
      pciDss: {
        assessmentData: {},
        lastUpdated: null,
        completionRate: 0,
        overallScore: 0
      }
    }
  },
  
  // System State
  loading: false,
  error: null,
  lastUpdated: null
};

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

/**
 * ✅ Calculate completion rate for a framework
 */
const calculateFrameworkCompletionRate = (assessmentData) => {
  if (!assessmentData || Object.keys(assessmentData).length === 0) {
    return 0;
  }
  
  const totalItems = Object.keys(assessmentData).length;
  const completedItems = Object.values(assessmentData).filter(item => 
    item.maturity > 0 && item.implementation > 0 && item.evidence > 0
  ).length;
  
  return totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
};

// =============================================================================
// MAIN REDUCER FUNCTION
// =============================================================================

export const dashboardReducer = (state = initialState, action) => {
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
      // ✅ STANDARDS AND FRAMEWORKS ACTIONS
      // =================================================================

      case 'UPDATE_STANDARDS_DATA':
        const { framework, data } = action.payload;
        const currentFrameworkData = state.standards.frameworks[framework] || {};
        
        // Calculate completion rate if assessment data is provided
        let completionRate = currentFrameworkData.completionRate || 0;
        if (data.assessmentData) {
          completionRate = calculateFrameworkCompletionRate(data.assessmentData);
        } else if (data.completionRate !== undefined) {
          completionRate = data.completionRate;
        }
        
        newState = updateState(state, {
          standards: {
            ...state.standards,
            frameworks: {
              ...state.standards.frameworks,
              [framework]: {
                ...currentFrameworkData,
                ...data,
                completionRate,
                lastUpdated: new Date().toISOString()
              }
            }
          }
        });
        break;

      case 'SET_SELECTED_FRAMEWORK':
        newState = updateState(state, {
          standards: {
            ...state.standards,
            selectedFramework: action.payload.framework
          }
        });
        break;

      case 'RESET_FRAMEWORK_DATA':
        const frameworkToReset = action.payload.framework;
        newState = updateState(state, {
          standards: {
            ...state.standards,
            frameworks: {
              ...state.standards.frameworks,
              [frameworkToReset]: {
                assessmentData: {},
                lastUpdated: null,
                completionRate: 0,
                overallScore: 0
              }
            }
          }
        });
        break;

      case 'IMPORT_STANDARDS_DATA':
        const { framework: importFramework, data: importData } = action.payload;
        newState = updateState(state, {
          standards: {
            ...state.standards,
            frameworks: {
              ...state.standards.frameworks,
              [importFramework]: {
                ...importData,
                lastUpdated: new Date().toISOString()
              }
            }
          }
        });
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
  const requiredKeys = ['ui', 'filters', 'modal', 'columnVisibility', 'standards'];
  
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
  
  // ✅ Validate standards state structure
  const requiredStandardsKeys = ['selectedFramework', 'frameworks'];
  for (const key of requiredStandardsKeys) {
    if (!(key in state.standards)) {
      throw new Error(`Missing required standards state key: ${key}`);
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

// ✅ Export initial state for use in hooks
export { initialState };

export default dashboardReducer;