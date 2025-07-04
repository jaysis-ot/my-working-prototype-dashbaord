// src/store/dashboardActions.js

// =============================================================================
// ACTION TYPES
// =============================================================================

export const ACTION_TYPES = {
  // Filter actions
  SET_FILTER: 'SET_FILTER',
  CLEAR_FILTERS: 'CLEAR_FILTERS',
  CLEAR_SEARCH: 'CLEAR_SEARCH',
  SET_SEARCH_TERM: 'SET_SEARCH_TERM',
  SET_BULK_FILTERS: 'SET_BULK_FILTERS',

  // UI actions
  SET_VIEW_MODE: 'SET_VIEW_MODE',
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

  // Modal actions
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

  // Selection actions
  SET_SELECTED_CAPABILITY: 'SET_SELECTED_CAPABILITY',
  SET_SELECTED_PCD: 'SET_SELECTED_PCD',
  SET_SELECTED_REQUIREMENT: 'SET_SELECTED_REQUIREMENT',
  SET_SELECTED_RISK: 'SET_SELECTED_RISK',
  SET_SELECTED_THREAT: 'SET_SELECTED_THREAT',
  CLEAR_ALL_SELECTIONS: 'CLEAR_ALL_SELECTIONS',
  SET_MULTI_SELECT: 'SET_MULTI_SELECT',
  TOGGLE_ITEM_SELECTION: 'TOGGLE_ITEM_SELECTION',

  // User preference actions
  SET_THEME: 'SET_THEME',
  SET_COMPANY_PROFILE_SETUP: 'SET_COMPANY_PROFILE_SETUP',
  UPDATE_USER_PREFERENCES: 'UPDATE_USER_PREFERENCES',
  RESET_USER_PREFERENCES: 'RESET_USER_PREFERENCES',
  SET_NOTIFICATION_PREFERENCE: 'SET_NOTIFICATION_PREFERENCE',
  SET_ACCESSIBILITY_PREFERENCE: 'SET_ACCESSIBILITY_PREFERENCE',

  // System state actions
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  ADD_WARNING: 'ADD_WARNING',
  CLEAR_WARNINGS: 'CLEAR_WARNINGS',
  SET_ONLINE_STATUS: 'SET_ONLINE_STATUS',
  SET_CONNECTION_QUALITY: 'SET_CONNECTION_QUALITY',
  UPDATE_LAST_SYNC_TIME: 'UPDATE_LAST_SYNC_TIME',

  // Bulk operations
  RESET_UI_STATE: 'RESET_UI_STATE',
  RESET_FILTER_STATE: 'RESET_FILTER_STATE',

  // Analytics actions
  TRACK_PAGE_VIEW: 'TRACK_PAGE_VIEW',
  TRACK_USER_ACTION: 'TRACK_USER_ACTION',
  TRACK_SEARCH_EVENT: 'TRACK_SEARCH_EVENT',
  ADD_SEARCH_HISTORY: 'ADD_SEARCH_HISTORY',
  CLEAR_SEARCH_HISTORY: 'CLEAR_SEARCH_HISTORY',
  UPDATE_PERFORMANCE_METRICS: 'UPDATE_PERFORMANCE_METRICS'
};

// =============================================================================
// ACTION CREATORS
// =============================================================================

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

export const dashboardActions = {
  // =================================================================
  // FILTER AND SEARCH ACTIONS
  // =================================================================

  /**
   * Set a single filter value
   */
  setFilter: (field, value) => createAction(ACTION_TYPES.SET_FILTER, { field, value }, {
    category: 'filter',
    field,
    previousValue: null
  }),

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
   * Clear search term
   */
  clearSearch: () => createAction(ACTION_TYPES.CLEAR_SEARCH, {}, {
    category: 'search'
  }),

  // =================================================================
  // UI ACTIONS
  // =================================================================

  /**
   * Set current view mode
   */
  setViewMode: (viewMode) => createAction(ACTION_TYPES.SET_VIEW_MODE, { viewMode }, {
    category: 'navigation',
    previousView: null
  }),

  /**
   * Toggle sidebar collapse state
   */
  toggleSidebar: () => createAction(ACTION_TYPES.TOGGLE_SIDEBAR, {}, {
    category: 'ui'
  }),

  /**
   * Set sidebar expanded state
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
   * Toggle multi-select mode
   */
  setMultiSelect: (enabled) => createAction(ACTION_TYPES.SET_MULTI_SELECT, { enabled }, {
    category: 'selection'
  }),

  /**
   * Toggle item selection in multi-select mode
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
    category: 'preferences'
  }),

  /**
   * Update user preferences
   */
  updateUserPreferences: (preferences) => createAction(ACTION_TYPES.UPDATE_USER_PREFERENCES, { preferences }, {
    category: 'preferences'
  }),

  /**
   * Reset user preferences to defaults
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
   * Clear all warnings
   */
  clearWarnings: () => createAction(ACTION_TYPES.CLEAR_WARNINGS, {}, {
    category: 'system'
  }),

  /**
   * Set online status
   */
  setOnlineStatus: (isOnline) => createAction(ACTION_TYPES.SET_ONLINE_STATUS, { isOnline }, {
    category: 'system'
  }),

  /**
   * Set connection quality
   */
  setConnectionQuality: (quality) => createAction(ACTION_TYPES.SET_CONNECTION_QUALITY, { quality }, {
    category: 'system'
  }),

  /**
   * Update last sync time
   */
  updateLastSyncTime: (timestamp = Date.now()) => createAction(ACTION_TYPES.UPDATE_LAST_SYNC_TIME, { timestamp }, {
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
    category: 'analytics'
  }),

  /**
   * Track user action
   */
  trackUserAction: (action, metadata = {}) => createAction(ACTION_TYPES.TRACK_USER_ACTION, { action, metadata }, {
    category: 'analytics'
  }),

  /**
   * Track search event
   */
  trackSearchEvent: (searchTerm, resultsCount = 0) => createAction(ACTION_TYPES.TRACK_SEARCH_EVENT, { searchTerm, resultsCount }, {
    category: 'analytics'
  }),

  /**
   * Add to search history
   */
  addToSearchHistory: (searchTerm) => createAction(ACTION_TYPES.ADD_SEARCH_HISTORY, { searchTerm }, {
    category: 'analytics'
  }),

  /**
   * Clear search history
   */
  clearSearchHistory: () => createAction(ACTION_TYPES.CLEAR_SEARCH_HISTORY, {}, {
    category: 'analytics'
  }),

  /**
   * Update performance metrics
   */
  updatePerformanceMetrics: (metrics) => createAction(ACTION_TYPES.UPDATE_PERFORMANCE_METRICS, { metrics }, {
    category: 'analytics'
  })
};

// =============================================================================
// EXPORTS
// =============================================================================

export default dashboardActions;