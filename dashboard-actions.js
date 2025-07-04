// src/store/dashboardActions.js

// Action Types
export const ACTION_TYPES = {
  // Filter actions
  SET_FILTER: 'SET_FILTER',
  CLEAR_FILTERS: 'CLEAR_FILTERS',
  CLEAR_SEARCH: 'CLEAR_SEARCH',
  SET_SEARCH_TERM: 'SET_SEARCH_TERM',

  // UI actions
  SET_VIEW_MODE: 'SET_VIEW_MODE',
  TOGGLE_SIDEBAR: 'TOGGLE_SIDEBAR',
  SET_SIDEBAR_EXPANDED: 'SET_SIDEBAR_EXPANDED',
  TOGGLE_FILTERS: 'TOGGLE_FILTERS',
  TOGGLE_COLUMN_SELECTOR: 'TOGGLE_COLUMN_SELECTOR',
  TOGGLE_COLUMN_VISIBILITY: 'TOGGLE_COLUMN_VISIBILITY',
  SET_CHART_FULLSCREEN: 'SET_CHART_FULLSCREEN',
  SET_IS_MOBILE: 'SET_IS_MOBILE',

  // Modal actions
  OPEN_MODAL: 'OPEN_MODAL',
  CLOSE_MODAL: 'CLOSE_MODAL',
  TOGGLE_UPLOAD_MODAL: 'TOGGLE_UPLOAD_MODAL',
  TOGGLE_PURGE_MODAL: 'TOGGLE_PURGE_MODAL',
  TOGGLE_NEW_CAPABILITY_MODAL: 'TOGGLE_NEW_CAPABILITY_MODAL',
  TOGGLE_COMPANY_PROFILE_MODAL: 'TOGGLE_COMPANY_PROFILE_MODAL',
  TOGGLE_THREAT_SETTINGS_MODAL: 'TOGGLE_THREAT_SETTINGS_MODAL',

  // Selection actions
  SET_SELECTED_CAPABILITY: 'SET_SELECTED_CAPABILITY',
  SET_SELECTED_PCD: 'SET_SELECTED_PCD',
  SET_COMPANY_PROFILE_SETUP: 'SET_COMPANY_PROFILE_SETUP'
};

// Action Creators
export const dashboardActions = {
  // Filter actions
  setFilter: (field, value) => ({
    type: ACTION_TYPES.SET_FILTER,
    field,
    value
  }),

  clearFilters: () => ({
    type: ACTION_TYPES.CLEAR_FILTERS
  }),

  clearSearch: () => ({
    type: ACTION_TYPES.CLEAR_SEARCH
  }),

  setSearchTerm: (searchTerm) => ({
    type: ACTION_TYPES.SET_SEARCH_TERM,
    searchTerm
  }),

  // UI actions
  setViewMode: (viewMode) => ({
    type: ACTION_TYPES.SET_VIEW_MODE,
    viewMode
  }),

  toggleSidebar: () => ({
    type: ACTION_TYPES.TOGGLE_SIDEBAR
  }),

  setSidebarExpanded: (expanded) => ({
    type: ACTION_TYPES.SET_SIDEBAR_EXPANDED,
    expanded
  }),

  toggleFilters: () => ({
    type: ACTION_TYPES.TOGGLE_FILTERS
  }),

  toggleColumnSelector: () => ({
    type: ACTION_TYPES.TOGGLE_COLUMN_SELECTOR
  }),

  toggleColumnVisibility: (column) => ({
    type: ACTION_TYPES.TOGGLE_COLUMN_VISIBILITY,
    column
  }),

  setChartFullscreen: (chartId) => ({
    type: ACTION_TYPES.SET_CHART_FULLSCREEN,
    chartId
  }),

  setIsMobile: (isMobile) => ({
    type: ACTION_TYPES.SET_IS_MOBILE,
    isMobile
  }),

  // Modal actions
  openModal: (requirement, editMode = false) => ({
    type: ACTION_TYPES.OPEN_MODAL,
    requirement,
    editMode
  }),

  closeModal: () => ({
    type: ACTION_TYPES.CLOSE_MODAL
  }),

  toggleUploadModal: () => ({
    type: ACTION_TYPES.TOGGLE_UPLOAD_MODAL
  }),

  togglePurgeModal: () => ({
    type: ACTION_TYPES.TOGGLE_PURGE_MODAL
  }),

  toggleNewCapabilityModal: () => ({
    type: ACTION_TYPES.TOGGLE_NEW_CAPABILITY_MODAL
  }),

  toggleCompanyProfileModal: () => ({
    type: ACTION_TYPES.TOGGLE_COMPANY_PROFILE_MODAL
  }),

  toggleThreatSettingsModal: () => ({
    type: ACTION_TYPES.TOGGLE_THREAT_SETTINGS_MODAL
  }),

  // Selection actions
  setSelectedCapability: (capabilityId) => ({
    type: ACTION_TYPES.SET_SELECTED_CAPABILITY,
    capabilityId
  }),

  setSelectedPCD: (pcdId) => ({
    type: ACTION_TYPES.SET_SELECTED_PCD,
    pcdId
  }),

  setCompanyProfileSetup: (show) => ({
    type: ACTION_TYPES.SET_COMPANY_PROFILE_SETUP,
    show
  })
};

// Action creators with side effects (thunks could go here if using Redux)
export const complexActions = {
  // Navigate to requirements with specific capability filter
  selectCapabilityAndNavigate: (capabilityId) => (dispatch) => {
    dispatch(dashboardActions.setSelectedCapability(capabilityId));
    dispatch(dashboardActions.setViewMode('requirements'));
  },

  // Handle mobile navigation
  navigateOnMobile: (viewMode, isMobile, sidebarExpanded) => (dispatch) => {
    dispatch(dashboardActions.setViewMode(viewMode));
    if (isMobile && sidebarExpanded) {
      dispatch(dashboardActions.toggleSidebar());
    }
  },

  // Filter and navigate workflow
  filterAndNavigate: (filterField, filterValue, viewMode) => (dispatch) => {
    dispatch(dashboardActions.setFilter(filterField, filterValue));
    dispatch(dashboardActions.setViewMode(viewMode));
  }
};