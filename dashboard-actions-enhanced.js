// src/store/dashboardActions.js
import { VIEW_MODES, DEFAULT_VALUES } from '../constants';

/**
 * Dashboard Actions
 * 
 * Comprehensive action creators for the dashboard state management system.
 * Provides type-safe, well-documented actions for all dashboard functionality.
 * 
 * Features:
 * - Complete action type definitions with clear naming
 * - Type-safe action creators with validation
 * - Complex action creators for common workflows
 * - Thunk-style actions for async operations
 * - Development-friendly action logging
 * - Integration with middleware and debugging tools
 */

// =============================================================================
// ACTION TYPES
// =============================================================================

export const ACTION_TYPES = {
  // =================================================================
  // FILTER AND SEARCH ACTIONS
  // =================================================================
  SET_FILTER: 'SET_FILTER',
  SET_BULK_FILTERS: 'SET_BULK_FILTERS',
  CLEAR_FILTERS: 'CLEAR_FILTERS',
  CLEAR_SEARCH: 'CLEAR_SEARCH',
  SET_SEARCH_TERM: 'SET_SEARCH_TERM',
  ADD_TO_SEARCH_HISTORY: 'ADD_TO_SEARCH_HISTORY',
  CLEAR_SEARCH_HISTORY: 'CLEAR_SEARCH_HISTORY',
  SET_QUICK_FILTER: 'SET_QUICK_FILTER',
  SAVE_FILTER_PRESET: 'SAVE_FILTER_PRESET',
  LOAD_FILTER_PRESET: 'LOAD_FILTER_PRESET',

  // =================================================================
  // UI STATE ACTIONS
  // =================================================================
  SET_VIEW_MODE: 'SET_VIEW_MODE',
  SET_PREVIOUS_VIEW_MODE: 'SET_PREVIOUS_VIEW_MODE',
  TOGGLE_SIDEBAR: 'TOGGLE_SIDEBAR',
  SET_SIDEBAR_EXPANDED: 'SET_SIDEBAR_EXPANDED',
  TOGGLE_FILTERS: 'TOGGLE_FILTERS',
  TOGGLE_COLUMN_SELECTOR: 'TOGGLE_COLUMN_SELECTOR',
  TOGGLE_COLUMN_VISIBILITY: 'TOGGLE_COLUMN_VISIBILITY',
  SET_CHART_FULLSCREEN: 'SET_CHART_FULLSCREEN',
  SET_IS_MOBILE: 'SET_IS_MOBILE',
  SET_IS_TABLET: 'SET_IS_TABLET',
  SET_IS_DESKTOP: 'SET_IS_DESKTOP',
  UPDATE_SCREEN_SIZE: 'UPDATE_SCREEN_SIZE',
  SET_COMPACT_MODE: 'SET_COMPACT_MODE',

  // =================================================================
  // MODAL ACTIONS
  // =================================================================
  OPEN_MODAL: 'OPEN_MODAL',
  CLOSE_MODAL: 'CLOSE_MODAL',
  TOGGLE_UPLOAD_MODAL: 'TOGGLE_UPLOAD_MODAL',
  TOGGLE_PURGE_MODAL: 'TOGGLE_PURGE_MODAL',
  TOGGLE_NEW_CAPABILITY_MODAL: 'TOGGLE_NEW_CAPABILITY_MODAL',
  TOGGLE_COMPANY_PROFILE_MODAL: 'TOGGLE_COMPANY_PROFILE_MODAL',
  TOGGLE_THREAT_SETTINGS_MODAL: 'TOGGLE_THREAT_SETTINGS_MODAL',
  SET_MODAL_DATA: 'SET_MODAL_DATA',
  CLEAR_MODAL_DATA: 'CLEAR_MODAL_DATA',
  SET_MODAL_LOADING: 'SET_MODAL_LOADING',
  SET_MODAL_ERROR: 'SET_MODAL_ERROR',

  // =================================================================
  // SELECTION ACTIONS
  // =================================================================
  SET_SELECTED_CAPABILITY: 'SET_SELECTED_CAPABILITY',
  SET_SELECTED_PCD: 'SET_SELECTED_PCD',
  SET_SELECTED_REQUIREMENT: 'SET_SELECTED_REQUIREMENT',
  SET_SELECTED_RISK: 'SET_SELECTED_RISK',
  SET_SELECTED_THREAT: 'SET_SELECTED_THREAT',
  CLEAR_ALL_SELECTIONS: 'CLEAR_ALL_SELECTIONS',
  SET_MULTI_SELECT: 'SET_MULTI_SELECT',
  TOGGLE_ITEM_SELECTION: 'TOGGLE_ITEM_SELECTION',

  // =================================================================
  // USER PREFERENCE ACTIONS
  // =================================================================
  SET_THEME: 'SET_THEME',
  SET_COMPANY_PROFILE_SETUP: 'SET_COMPANY_PROFILE_SETUP',
  UPDATE_USER_PREFERENCES: 'UPDATE_USER_PREFERENCES',
  RESET_USER_PREFERENCES: 'RESET_USER_PREFERENCES',
  SET_NOTIFICATION_PREFERENCE: 'SET_NOTIFICATION_PREFERENCE',
  SET_ACCESSIBILITY_PREFERENCE: 'SET_ACCESSIBILITY_PREFERENCE',

  // =================================================================
  // SYSTEM STATE ACTIONS
  // =================================================================
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  ADD_WARNING: 'ADD_WARNING',
  CLEAR_WARNINGS: 'CLEAR_WARNINGS',
  SET_ONLINE_STATUS: 'SET_ONLINE_STATUS',
  SET_CONNECTION_QUALITY: 'SET_CONNECTION_QUALITY',
  UPDATE_PERFORMANCE_METRICS: 'UPDATE_PERFORMANCE_METRICS',

  // =================================================================
  // DATA ACTIONS
  // =================================================================
  SET_DATA_LOADING: 'SET_DATA_LOADING',
  SET_DATA_ERROR: 'SET_DATA_ERROR',
  CLEAR_DATA_ERROR: 'CLEAR_DATA_ERROR',
  SET_LAST_DATA_REFRESH: 'SET_LAST_DATA_REFRESH',
  INCREMENT_RENDER_COUNT: 'INCREMENT_RENDER_COUNT',
  SET_CACHE_STATUS: 'SET_CACHE_STATUS',

  // =================================================================
  // ANALYTICS ACTIONS
  // =================================================================
  TRACK_PAGE_VIEW: 'TRACK_PAGE_VIEW',
  TRACK_USER_ACTION: 'TRACK_USER_ACTION',
  TRACK_SEARCH_EVENT: 'TRACK_SEARCH_EVENT',
  TRACK_FILTER_EVENT: 'TRACK_FILTER_EVENT',
  TRACK_PERFORMANCE_EVENT: 'TRACK_PERFORMANCE_EVENT',
  TRACK_ERROR_EVENT: 'TRACK_ERROR_EVENT',

  // =================================================================
  // BULK OPERATIONS
  // =================================================================
  RESET_UI_STATE: 'RESET_UI_STATE',
  RESET_FILTER_STATE: 'RESET_FILTER_STATE',
  RESET_ALL_STATE: 'RESET_ALL_STATE',
  IMPORT_STATE: 'IMPORT_STATE',
  EXPORT_STATE: 'EXPORT_STATE',

  // =================================================================
  // FEATURE FLAGS
  // =================================================================
  SET_FEATURE_FLAG: 'SET_FEATURE_FLAG',
  TOGGLE_FEATURE_FLAG: 'TOGGLE_FEATURE_FLAG',
  SET_FEATURE_FLAGS: 'SET_FEATURE_FLAGS'
};

// =============================================================================
// VALIDATION HELPERS
// =============================================================================

/**
 * Validate view mode
 */
const validateViewMode = (viewMode) => {
  if (!Object.values(VIEW_MODES).includes(viewMode)) {
    console.warn(`Invalid view mode: ${viewMode}. Using default.`);
    return VIEW_MODES.OVERVIEW;
  }
  return viewMode;
};

/**
 * Validate filter field and value
 */
const validateFilter = (field, value) => {
  const validFields = [
    'status', 'capability', 'applicability', 'area', 'type', 
    'priority', 'businessValue', 'maturity'
  ];
  
  if (!validFields.includes(field)) {
    console.warn(`Invalid filter field: ${field}`);
    return false;
  }
  
  return true;
};

/**
 * Create action with metadata
 */
const createAction = (type, payload = {}, meta = {}) => ({
  type,
  ...payload,
  meta: {
    timestamp: Date.now(),
    ...meta
  }
});

// =============================================================================
// BASIC ACTION CREATORS
// =============================================================================

export const dashboardActions = {
  // =================================================================
  // FILTER AND SEARCH ACTIONS
  // =================================================================

  /**
   * Set a single filter value
   */
  setFilter: (field, value) => {
    if (!validateFilter(field, value)) {
      return { type: '@@INVALID_ACTION' };
    }
    
    return createAction(ACTION_TYPES.SET_FILTER, { field, value }, {
      category: 'filter',
      field,
      previousValue: null // Will be set by middleware if needed
    });
  },

  /**
   * Set multiple filters at once
   */
  setBulkFilters: (filters) => createAction(ACTION_TYPES.SET_BULK_FILTERS, { filters }, {
    category: 'filter',
    filterCount: Object.keys(filters).length
  }),

  /**
   * Clear all active filters
   */
  clearFilters: () => createAction(ACTION_TYPES.CLEAR_FILTERS, {}, {
    category: 'filter'
  }),

  /**
   * Set search term
   */
  setSearchTerm: (searchTerm) => createAction(ACTION_TYPES.SET_SEARCH_TERM, { searchTerm }, {
    category: 'search',
    searchLength: searchTerm.length
  }),

  /**
   * Clear search
   */
  clearSearch: () => createAction(ACTION_TYPES.CLEAR_SEARCH, {}, {
    category: 'search'
  }),

  /**
   * Add search to history
   */
  addToSearchHistory: (searchTerm) => createAction(ACTION_TYPES.ADD_TO_SEARCH_HISTORY, { searchTerm }, {
    category: 'search'
  }),

  /**
   * Set quick filter
   */
  setQuickFilter: (filterName, filters) => createAction(ACTION_TYPES.SET_QUICK_FILTER, { filterName, filters }, {
    category: 'filter',
    isQuickFilter: true
  }),

  // =================================================================
  // UI STATE ACTIONS
  // =================================================================

  /**
   * Set the current view mode
   */
  setViewMode: (viewMode) => {
    const validatedViewMode = validateViewMode(viewMode);
    return createAction(ACTION_TYPES.SET_VIEW_MODE, { viewMode: validatedViewMode }, {
      category: 'navigation',
      previousView: null // Will be set by middleware
    });
  },

  /**
   * Store previous view mode for back navigation
   */
  setPreviousViewMode: (viewMode) => createAction(ACTION_TYPES.SET_PREVIOUS_VIEW_MODE, { viewMode }, {
    category: 'navigation'
  }),

  /**
   * Toggle sidebar expanded state
   */
  toggleSidebar: () => createAction(ACTION_TYPES.TOGGLE_SIDEBAR, {}, {
    category: 'ui'
  }),

  /**
   * Set sidebar expanded state explicitly
   */
  setSidebarExpanded: (expanded) => createAction(ACTION_TYPES.SET_SIDEBAR_EXPANDED, { expanded }, {
    category: 'ui'
  }),

  /**
   * Toggle filters panel
   */
  toggleFilters: () => createAction(ACTION_TYPES.TOGGLE_FILTERS, {}, {
    category: 'ui'
  }),

  /**
   * Toggle column selector
   */
  toggleColumnSelector: () => createAction(ACTION_TYPES.TOGGLE_COLUMN_SELECTOR, {}, {
    category: 'ui'
  }),

  /**
   * Toggle column visibility
   */
  toggleColumnVisibility: (column) => createAction(ACTION_TYPES.TOGGLE_COLUMN_VISIBILITY, { column }, {
    category: 'ui'
  }),

  /**
   * Set chart fullscreen mode
   */
  setChartFullscreen: (chartId) => createAction(ACTION_TYPES.SET_CHART_FULLSCREEN, { chartId }, {
    category: 'ui'
  }),

  /**
   * Set device type flags
   */
  setIsMobile: (isMobile) => createAction(ACTION_TYPES.SET_IS_MOBILE, { isMobile }, {
    category: 'responsive'
  }),

  setIsTablet: (isTablet) => createAction(ACTION_TYPES.SET_IS_TABLET, { isTablet }, {
    category: 'responsive'
  }),

  setIsDesktop: (isDesktop) => createAction(ACTION_TYPES.SET_IS_DESKTOP, { isDesktop }, {
    category: 'responsive'
  }),

  /**
   * Update screen size information
   */
  updateScreenSize: (width, height) => createAction(ACTION_TYPES.UPDATE_SCREEN_SIZE, { width, height }, {
    category: 'responsive'
  }),

  /**
   * Set compact mode
   */
  setCompactMode: (compact) => createAction(ACTION_TYPES.SET_COMPACT_MODE, { compact }, {
    category: 'ui'
  }),

  // =================================================================
  // MODAL ACTIONS
  // =================================================================

  /**
   * Open modal with optional data
   */
  openModal: (requirement, editMode = false, modalData = {}) => createAction(ACTION_TYPES.OPEN_MODAL, { 
    requirement, 
    editMode, 
    modalData 
  }, {
    category: 'modal',
    modalType: editMode ? 'edit' : 'view'
  }),

  /**
   * Close the current modal
   */
  closeModal: () => createAction(ACTION_TYPES.CLOSE_MODAL, {}, {
    category: 'modal'
  }),

  /**
   * Toggle specific modals
   */
  toggleUploadModal: () => createAction(ACTION_TYPES.TOGGLE_UPLOAD_MODAL, {}, {
    category: 'modal',
    modalType: 'upload'
  }),

  togglePurgeModal: () => createAction(ACTION_TYPES.TOGGLE_PURGE_MODAL, {}, {
    category: 'modal',
    modalType: 'purge'
  }),

  toggleNewCapabilityModal: () => createAction(ACTION_TYPES.TOGGLE_NEW_CAPABILITY_MODAL, {}, {
    category: 'modal',
    modalType: 'newCapability'
  }),

  toggleCompanyProfileModal: () => createAction(ACTION_TYPES.TOGGLE_COMPANY_PROFILE_MODAL, {}, {
    category: 'modal',
    modalType: 'companyProfile'
  }),

  toggleThreatSettingsModal: () => createAction(ACTION_TYPES.TOGGLE_THREAT_SETTINGS_MODAL, {}, {
    category: 'modal',
    modalType: 'threatSettings'
  }),

  /**
   * Set modal data
   */
  setModalData: (data) => createAction(ACTION_TYPES.SET_MODAL_DATA, { data }, {
    category: 'modal'
  }),

  /**
   * Set modal loading state
   */
  setModalLoading: (loading) => createAction(ACTION_TYPES.SET_MODAL_LOADING, { loading }, {
    category: 'modal'
  }),

  /**
   * Set modal error
   */
  setModalError: (error) => createAction(ACTION_TYPES.SET_MODAL_ERROR, { error }, {
    category: 'modal'
  }),

  // =================================================================
  // SELECTION ACTIONS
  // =================================================================

  /**
   * Set selected capability
   */
  setSelectedCapability: (capabilityId) => createAction(ACTION_TYPES.SET_SELECTED_CAPABILITY, { capabilityId }, {
    category: 'selection'
  }),

  /**
   * Set selected PCD
   */
  setSelectedPCD: (pcdId) => createAction(ACTION_TYPES.SET_SELECTED_PCD, { pcdId }, {
    category: 'selection'
  }),

  /**
   * Set selected requirement
   */
  setSelectedRequirement: (requirementId) => createAction(ACTION_TYPES.SET_SELECTED_REQUIREMENT, { requirementId }, {
    category: 'selection'
  }),

  /**
   * Clear all selections
   */
  clearAllSelections: () => createAction(ACTION_TYPES.CLEAR_ALL_SELECTIONS, {}, {
    category: 'selection'
  }),

  /**
   * Toggle item selection (for multi-select)
   */
  toggleItemSelection: (itemId, itemType) => createAction(ACTION_TYPES.TOGGLE_ITEM_SELECTION, { itemId, itemType }, {
    category: 'selection'
  }),

  // =================================================================
  // USER PREFERENCE ACTIONS
  // =================================================================

  /**
   * Set theme
   */
  setTheme: (theme) => createAction(ACTION_TYPES.SET_THEME, { theme }, {
    category: 'preferences'
  }),

  /**
   * Set company profile setup state
   */
  setCompanyProfileSetup: (show) => createAction(ACTION_TYPES.SET_COMPANY_PROFILE_SETUP, { show }, {
    category: 'ui'
  }),

  /**
   * Update user preferences
   */
  updateUserPreferences: (preferences) => createAction(ACTION_TYPES.UPDATE_USER_PREFERENCES, { preferences }, {
    category: 'preferences'
  }),

  /**
   * Reset user preferences
   */
  resetUserPreferences: () => createAction(ACTION_TYPES.RESET_USER_PREFERENCES, {}, {
    category: 'preferences'
  }),

  // =================================================================
  // SYSTEM STATE ACTIONS
  // =================================================================

  /**
   * Set loading state
   */
  setLoading: (loading) => createAction(ACTION_TYPES.SET_LOADING, { loading }, {
    category: 'system'
  }),

  /**
   * Set error state
   */
  setError: (error) => createAction(ACTION_TYPES.SET_ERROR, { error }, {
    category: 'system'
  }),

  /**
   * Clear error state
   */
  clearError: () => createAction(ACTION_TYPES.CLEAR_ERROR, {}, {
    category: 'system'
  }),

  /**
   * Add warning
   */
  addWarning: (warning) => createAction(ACTION_TYPES.ADD_WARNING, { warning }, {
    category: 'system'
  }),

  /**
   * Set online status
   */
  setOnlineStatus: (isOnline) => createAction(ACTION_TYPES.SET_ONLINE_STATUS, { isOnline }, {
    category: 'system'
  }),

  // =================================================================
  // BULK OPERATIONS
  // =================================================================

  /**
   * Reset UI state to defaults
   */
  resetUIState: () => createAction(ACTION_TYPES.RESET_UI_STATE, {}, {
    category: 'bulk'
  }),

  /**
   * Reset filter state
   */
  resetFilterState: () => createAction(ACTION_TYPES.RESET_FILTER_STATE, {}, {
    category: 'bulk'
  }),

  // =================================================================
  // ANALYTICS ACTIONS
  // =================================================================

  /**
   * Track page view
   */
  trackPageView: (viewMode, metadata = {}) => createAction(ACTION_TYPES.TRACK_PAGE_VIEW, { viewMode, metadata }, {
    category: 'analytics',
    trackingEvent: 'pageView'
  }),

  /**
   * Track user action
   */
  trackUserAction: (action, metadata = {}) => createAction(ACTION_TYPES.TRACK_USER_ACTION, { action, metadata }, {
    category: 'analytics',
    trackingEvent: 'userAction'
  }),

  /**
   * Track search event
   */
  trackSearchEvent: (searchTerm, resultCount = 0) => createAction(ACTION_TYPES.TRACK_SEARCH_EVENT, { searchTerm, resultCount }, {
    category: 'analytics',
    trackingEvent: 'search'
  }),

  /**
   * Track filter event
   */
  trackFilterEvent: (filterField, filterValue) => createAction(ACTION_TYPES.TRACK_FILTER_EVENT, { filterField, filterValue }, {
    category: 'analytics',
    trackingEvent: 'filter'
  })
};

// =============================================================================
// COMPLEX ACTION CREATORS
// =============================================================================

/**
 * Complex actions that combine multiple basic actions or handle side effects
 */
export const complexActions = {
  /**
   * Navigate to a view and optionally set filters
   */
  navigateWithFilter: (viewMode, filterField = null, filterValue = null) => (dispatch) => {
    // Set filter first if provided
    if (filterField && filterValue !== null) {
      dispatch(dashboardActions.setFilter(filterField, filterValue));
    }
    
    // Then navigate to view
    dispatch(dashboardActions.setViewMode(viewMode));
    
    // Track the navigation
    dispatch(dashboardActions.trackPageView(viewMode, { 
      hasFilter: !!(filterField && filterValue),
      filterField,
      filterValue 
    }));
  },

  /**
   * Navigate with mobile-specific behavior
   */
  navigateOnMobile: (viewMode, isMobile, sidebarExpanded) => (dispatch) => {
    // Navigate to view
    dispatch(dashboardActions.setViewMode(viewMode));
    
    // Auto-collapse sidebar on mobile
    if (isMobile && sidebarExpanded) {
      dispatch(dashboardActions.toggleSidebar());
    }
    
    // Track mobile navigation
    dispatch(dashboardActions.trackUserAction('mobileNavigation', { viewMode, isMobile }));
  },

  /**
   * Select capability and navigate to requirements
   */
  selectCapabilityAndNavigate: (capabilityId) => (dispatch) => {
    // Set the selected capability
    dispatch(dashboardActions.setSelectedCapability(capabilityId));
    
    // Filter requirements by capability
    dispatch(dashboardActions.setFilter('capability', capabilityId));
    
    // Navigate to requirements view
    dispatch(dashboardActions.setViewMode(VIEW_MODES.REQUIREMENTS));
    
    // Track the action
    dispatch(dashboardActions.trackUserAction('selectCapabilityAndNavigate', { capabilityId }));
  },

  /**
   * Open requirement modal with tracking
   */
  openRequirementModal: (requirement, editMode = false) => (dispatch) => {
    // Open the modal
    dispatch(dashboardActions.openModal(requirement, editMode));
    
    // Track the action
    dispatch(dashboardActions.trackUserAction('openRequirementModal', { 
      requirementId: requirement.id,
      editMode 
    }));
  },

  /**
   * Apply quick filter preset
   */
  applyQuickFilter: (filterName, filters) => (dispatch) => {
    // Apply the filters
    dispatch(dashboardActions.setBulkFilters(filters));
    
    // Track the quick filter usage
    dispatch(dashboardActions.trackFilterEvent('quickFilter', filterName));
    
    // Track user action
    dispatch(dashboardActions.trackUserAction('applyQuickFilter', { filterName, filters }));
  },

  /**
   * Handle responsive layout change
   */
  handleResponsiveChange: (screenSize) => (dispatch) => {
    const { width, height } = screenSize;
    const isMobile = width < 1024;
    const isTablet = width >= 768 && width < 1024;
    const isDesktop = width >= 1024;
    
    // Update screen size
    dispatch(dashboardActions.updateScreenSize(width, height));
    
    // Update device flags
    dispatch(dashboardActions.setIsMobile(isMobile));
    dispatch(dashboardActions.setIsTablet(isTablet));
    dispatch(dashboardActions.setIsDesktop(isDesktop));
    
    // Auto-collapse sidebar on mobile
    if (isMobile) {
      dispatch(dashboardActions.setSidebarExpanded(false));
    }
  },

  /**
   * Initialize dashboard state
   */
  initializeDashboard: (initialData = {}) => (dispatch) => {
    // Set initial loading state
    dispatch(dashboardActions.setLoading(true));
    
    try {
      // Initialize responsive state
      if (typeof window !== 'undefined') {
        dispatch(complexActions.handleResponsiveChange({
          width: window.innerWidth,
          height: window.innerHeight
        }));
      }
      
      // Track dashboard initialization
      dispatch(dashboardActions.trackPageView(VIEW_MODES.OVERVIEW, { initialization: true }));
      
      // Clear loading state
      dispatch(dashboardActions.setLoading(false));
      
    } catch (error) {
      dispatch(dashboardActions.setError(error.message));
      dispatch(dashboardActions.setLoading(false));
    }
  },

  /**
   * Handle search with debouncing logic
   */
  performSearch: (searchTerm, debounceMs = 300) => (dispatch) => {
    // Clear any existing search timeout
    if (complexActions._searchTimeout) {
      clearTimeout(complexActions._searchTimeout);
    }
    
    // Set immediate search term (for UI feedback)
    dispatch(dashboardActions.setSearchTerm(searchTerm));
    
    // Debounce the actual search action
    complexActions._searchTimeout = setTimeout(() => {
      if (searchTerm.trim()) {
        // Add to search history
        dispatch(dashboardActions.addToSearchHistory(searchTerm));
        
        // Track search event
        dispatch(dashboardActions.trackSearchEvent(searchTerm));
      }
    }, debounceMs);
  },

  /**
   * Clear all UI state (useful for logout or reset)
   */
  clearAllUIState: () => (dispatch) => {
    dispatch(dashboardActions.resetUIState());
    dispatch(dashboardActions.resetFilterState());
    dispatch(dashboardActions.clearAllSelections());
    dispatch(dashboardActions.closeModal());
    dispatch(dashboardActions.clearError());
  }
};

// Static property to hold search timeout
complexActions._searchTimeout = null;

// =============================================================================
// ACTION UTILITIES
// =============================================================================

/**
 * Create a batch action that dispatches multiple actions
 */
export const createBatchAction = (actions) => ({
  type: '@@BATCH',
  actions,
  meta: {
    timestamp: Date.now(),
    batchSize: actions.length
  }
});

/**
 * Create a conditional action that only dispatches if condition is met
 */
export const createConditionalAction = (condition, action) => (dispatch, getState) => {
  if (typeof condition === 'function' ? condition(getState()) : condition) {
    dispatch(action);
  }
};

/**
 * Create an action that reverses another action (for undo functionality)
 */
export const createUndoAction = (originalAction, undoAction) => ({
  type: '@@UNDO',
  originalAction,
  undoAction,
  meta: {
    timestamp: Date.now(),
    canUndo: true
  }
});

// =============================================================================
// DEVELOPMENT UTILITIES
// =============================================================================

/**
 * Development utilities for debugging actions
 */
export const actionUtils = process.env.NODE_ENV === 'development' ? {
  /**
   * Log all available actions
   */
  logActions: () => {
    console.group('📋 Available Dashboard Actions');
    Object.keys(dashboardActions).forEach(actionName => {
      console.log(`${actionName}:`, dashboardActions[actionName]);
    });
    console.groupEnd();
  },

  /**
   * Validate action structure
   */
  validateAction: (action) => {
    const requiredProperties = ['type'];
    const validAction = requiredProperties.every(prop => prop in action);
    
    if (!validAction) {
      console.error('❌ Invalid action structure:', action);
      return false;
    }
    
    console.log('✅ Valid action:', action.type);
    return true;
  },

  /**
   * Create test action dispatcher
   */
  createTestDispatcher: () => (action) => {
    console.log('🧪 Test Dispatch:', action);
    return action;
  }
} : {};

// =============================================================================
// EXPORTS
// =============================================================================

export default dashboardActions;

// Named exports for convenience
export {
  ACTION_TYPES as actionTypes,
  complexActions as complexDashboardActions,
  createBatchAction,
  createConditionalAction,
  createUndoAction
};