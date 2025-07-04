// src/reducers/uiReducer.js
export const initialUI = {
  viewMode: 'overview',
  sidebarExpanded: true,
  activeFilters: false,
  chartFullscreen: null,
  showUploadModal: false,
  showPurgeModal: false,
  showNewCapabilityModal: false,
  showColumnSelector: false,
  selectedCapability: null,
  selectedPCD: null,
  isMobile: false
};

export const uiReducer = (state, action) => {
  switch (action.type) {
    case 'SET_VIEW_MODE':
      return { ...state, viewMode: action.viewMode };
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarExpanded: !state.sidebarExpanded };
    case 'SET_SIDEBAR_EXPANDED':
      return { ...state, sidebarExpanded: action.expanded };
    case 'TOGGLE_FILTERS':
      return { ...state, activeFilters: !state.activeFilters };
    case 'TOGGLE_COLUMN_SELECTOR':
      return { ...state, showColumnSelector: !state.showColumnSelector };
    case 'SET_CHART_FULLSCREEN':
      return { ...state, chartFullscreen: action.chartId };
    case 'TOGGLE_MODAL':
      return { ...state, [action.modal]: !state[action.modal] };
    case 'SET_MODAL':
      return { ...state, [action.modal]: action.value };
    case 'SET_SELECTED_CAPABILITY':
      return { ...state, selectedCapability: action.capabilityId };
    case 'SET_SELECTED_PCD':
      return { ...state, selectedPCD: action.pcdId };
    case 'SET_IS_MOBILE':
      return { ...state, isMobile: action.isMobile };
    case 'CLOSE_ALL_MODALS':
      return {
        ...state,
        showUploadModal: false,
        showPurgeModal: false,
        showNewCapabilityModal: false,
        showColumnSelector: false,
        chartFullscreen: null
      };
    default:
      return state;
  }
};