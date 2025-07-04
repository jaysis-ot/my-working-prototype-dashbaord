// src/store/index.js

/**
 * Store Barrel Export
 * 
 * Centralized export for all state management components.
 * Provides clean imports and consistent access to reducers, actions,
 * initial state, and state utilities across the application.
 */

// =============================================================================
// CORE STATE MANAGEMENT
// =============================================================================

// Reducer and state
export { default as dashboardReducer } from './dashboardReducer';
export { enhancedDashboardReducer, createStateLogger, createStateValidator } from './dashboardReducer';

export { 
  default as initialState,
  createInitialState,
  resetToInitialState,
  mergeWithInitialState,
  getMinimalState,
  validateInitialState
} from './initialState';

// Action creators and types
export { 
  default as dashboardActions,
  ACTION_TYPES,
  complexActions
} from './dashboardActions';

// =============================================================================
// STATE SECTION CREATORS
// =============================================================================

// Individual state section creators for testing and customization
export {
  createInitialUIState,
  createInitialFilterState,
  createInitialSearchState,
  createInitialModalState,
  createInitialColumnVisibility,
  createInitialUserPreferences,
  createInitialSystemState,
  createInitialAnalyticsState
} from './initialState';

// =============================================================================
// CONVENIENCE EXPORTS
// =============================================================================

// Complete state management package
export const storePackage = {
  reducer: dashboardReducer,
  initialState,
  actions: dashboardActions,
  actionTypes: ACTION_TYPES
};

// Enhanced state management with middleware
export const enhancedStorePackage = {
  reducer: enhancedDashboardReducer,
  initialState,
  actions: dashboardActions,
  actionTypes: ACTION_TYPES,
  utilities: {
    createStateLogger,
    createStateValidator,
    validateInitialState,
    resetToInitialState
  }
};

// =============================================================================
// FUTURE STORE EXPORTS
// =============================================================================

// Placeholder for additional store modules as the application grows
// export { default as requirementsStore } from './requirementsStore';
// export { default as capabilitiesStore } from './capabilitiesStore';
// export { default as threatsStore } from './threatsStore';
// export { default as userStore } from './userStore';

// =============================================================================
// STORE UTILITIES
// =============================================================================

/**
 * Create a complete store configuration for useReducer
 * @param {Object} customInitialState - Optional custom initial state
 * @param {Function} customReducer - Optional custom reducer
 * @returns {Object} Store configuration
 */
export const createStoreConfig = (customInitialState = null, customReducer = null) => ({
  reducer: customReducer || dashboardReducer,
  initialState: customInitialState || initialState,
  actions: dashboardActions
});

/**
 * Create enhanced store configuration with middleware
 * @param {Object} options - Configuration options
 * @returns {Object} Enhanced store configuration
 */
export const createEnhancedStoreConfig = (options = {}) => {
  const {
    customInitialState = null,
    enableLogging = process.env.NODE_ENV === 'development',
    enableValidation = process.env.NODE_ENV === 'development',
    logPrefix = 'Dashboard'
  } = options;

  let reducer = dashboardReducer;
  
  if (enableValidation) {
    reducer = createStateValidator()(reducer);
  }
  
  if (enableLogging) {
    reducer = createStateLogger(logPrefix)(reducer);
  }

  return {
    reducer,
    initialState: customInitialState || initialState,
    actions: dashboardActions,
    actionTypes: ACTION_TYPES
  };
};

/**
 * State selectors for commonly accessed state properties
 * These provide a clean interface for components to access specific state
 */
export const selectors = {
  // UI selectors
  getCurrentView: (state) => state.ui?.viewMode,
  isSidebarExpanded: (state) => state.ui?.sidebarExpanded,
  isMobile: (state) => state.ui?.isMobile,
  isModalOpen: (state) => state.modal?.isOpen,
  getSelectedRequirement: (state) => state.modal?.selectedRequirement,
  
  // Filter selectors
  getActiveFilters: (state) => {
    const filters = state.filters || {};
    return Object.entries(filters)
      .filter(([key, value]) => value && value !== '')
      .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
  },
  getActiveFilterCount: (state) => {
    return Object.values(selectors.getActiveFilters(state)).length;
  },
  getSearchTerm: (state) => state.search?.searchTerm || state.searchTerm || '',
  
  // System selectors
  isLoading: (state) => state.system?.loading || state.loading || false,
  getError: (state) => state.system?.error || state.error,
  isOnline: (state) => state.system?.isOnline,
  
  // User preference selectors
  getTheme: (state) => state.userPreferences?.theme || 'default',
  isCompactMode: (state) => state.userPreferences?.compactMode || false,
  areAnimationsEnabled: (state) => state.userPreferences?.animationsEnabled !== false,
  
  // Column visibility selectors
  getVisibleColumns: (state) => {
    const columnVisibility = state.columnVisibility || {};
    return Object.entries(columnVisibility)
      .filter(([key, visible]) => visible)
      .map(([key]) => key);
  },
  isColumnVisible: (state, column) => state.columnVisibility?.[column] !== false
};

/**
 * Action dispatchers with common patterns
 * These provide convenient ways to dispatch common action combinations
 */
export const dispatchers = {
  // Navigation dispatchers
  navigateToView: (dispatch, viewMode) => {
    dispatch(dashboardActions.setViewMode(viewMode));
  },
  
  navigateWithFilter: (dispatch, viewMode, filterField, filterValue) => {
    dispatch(dashboardActions.setFilter(filterField, filterValue));
    dispatch(dashboardActions.setViewMode(viewMode));
  },
  
  // Modal dispatchers
  openRequirementModal: (dispatch, requirement, editMode = false) => {
    dispatch(dashboardActions.openModal(requirement, editMode));
  },
  
  closeAllModals: (dispatch) => {
    dispatch(dashboardActions.closeModal());
    // Close any other modals that might be open
    const modalActions = [
      'TOGGLE_UPLOAD_MODAL',
      'TOGGLE_PURGE_MODAL',
      'TOGGLE_NEW_CAPABILITY_MODAL',
      'TOGGLE_COMPANY_PROFILE_MODAL',
      'TOGGLE_THREAT_SETTINGS_MODAL'
    ];
    // Note: In practice, you'd need to track which modals are open
    // and close them selectively
  },
  
  // Filter dispatchers
  clearAllFilters: (dispatch) => {
    dispatch(dashboardActions.clearFilters());
    dispatch(dashboardActions.clearSearch());
  },
  
  setBulkFilters: (dispatch, filters) => {
    dispatch({ type: 'SET_BULK_FILTERS', filters });
  },
  
  // UI dispatchers
  toggleSidebarForMobile: (dispatch, isMobile) => {
    if (isMobile) {
      dispatch(dashboardActions.toggleSidebar());
    }
  }
};

// =============================================================================
// STORE CONTEXT HELPERS
// =============================================================================

/**
 * Create context provider value for React Context
 * @param {Object} state - Current state
 * @param {Function} dispatch - Dispatch function
 * @returns {Object} Context provider value
 */
export const createContextValue = (state, dispatch) => ({
  state,
  dispatch,
  actions: dashboardActions,
  selectors: Object.keys(selectors).reduce((acc, key) => ({
    ...acc,
    [key]: () => selectors[key](state)
  }), {}),
  dispatchers: Object.keys(dispatchers).reduce((acc, key) => ({
    ...acc,
    [key]: (...args) => dispatchers[key](dispatch, ...args)
  }), {})
});

// =============================================================================
// DEVELOPMENT UTILITIES
// =============================================================================

/**
 * Development utilities for debugging and testing
 * Only available in development mode
 */
export const devUtils = process.env.NODE_ENV === 'development' ? {
  // Log current state structure
  logState: (state) => {
    console.group('📊 Dashboard State');
    console.log('UI State:', state.ui);
    console.log('Filters:', state.filters);
    console.log('Modal State:', state.modal);
    console.log('Column Visibility:', state.columnVisibility);
    console.log('User Preferences:', state.userPreferences);
    console.groupEnd();
  },
  
  // Validate state structure
  validateState: (state) => {
    try {
      validateInitialState(state);
      console.log('✅ State structure is valid');
      return true;
    } catch (error) {
      console.error('❌ State validation failed:', error);
      return false;
    }
  },
  
  // Get state size estimation
  getStateSize: (state) => {
    const stateString = JSON.stringify(state);
    const sizeInBytes = new Blob([stateString]).size;
    const sizeInKB = (sizeInBytes / 1024).toFixed(2);
    console.log(`📏 State size: ${sizeInKB} KB`);
    return { bytes: sizeInBytes, kb: sizeInKB };
  },
  
  // Generate state performance report
  generatePerformanceReport: (state) => {
    const report = {
      stateSize: devUtils.getStateSize(state),
      isValid: devUtils.validateState(state),
      renderCount: state.ui?.renderCount || 0,
      lastRenderTime: state.ui?.lastRenderTime,
      sessionDuration: Date.now() - (state.system?.sessionStartTime || Date.now())
    };
    
    console.table(report);
    return report;
  }
} : {};

// =============================================================================
// USAGE EXAMPLES AND DOCUMENTATION
// =============================================================================

/*
// Basic usage with useReducer:
import { dashboardReducer, initialState, dashboardActions } from '../store';

const MyComponent = () => {
  const [state, dispatch] = useReducer(dashboardReducer, initialState);
  
  const handleViewChange = (viewMode) => {
    dispatch(dashboardActions.setViewMode(viewMode));
  };
  
  return <div>...</div>;
};

// Enhanced usage with middleware:
import { createEnhancedStoreConfig } from '../store';

const MyComponent = () => {
  const config = createEnhancedStoreConfig({
    enableLogging: true,
    enableValidation: true
  });
  
  const [state, dispatch] = useReducer(config.reducer, config.initialState);
  
  return <div>...</div>;
};

// Using selectors:
import { selectors } from '../store';

const currentView = selectors.getCurrentView(state);
const activeFilters = selectors.getActiveFilters(state);
const isLoading = selectors.isLoading(state);

// Using dispatchers:
import { dispatchers } from '../store';

dispatchers.navigateToView(dispatch, 'requirements');
dispatchers.navigateWithFilter(dispatch, 'requirements', 'status', 'Completed');
dispatchers.openRequirementModal(dispatch, requirement, true);

// Development utilities:
import { devUtils } from '../store';

if (process.env.NODE_ENV === 'development') {
  devUtils.logState(state);
  devUtils.validateState(state);
  devUtils.generatePerformanceReport(state);
}
*/