// src/store/dashboardReducer.js
import { initialState } from './initialState';

export const dashboardReducer = (state = initialState, action) => {
  switch (action.type) {
    // ========================================================================
    // FILTER ACTIONS
    // ========================================================================
    case 'SET_FILTER':
      return {
        ...state,
        filters: {
          ...state.filters,
          [action.field]: action.value
        }
      };

    case 'CLEAR_FILTERS':
      return {
        ...state,
        filters: {
          status: null,
          priority: null,
          applicability: null,
          area: null,
          type: null,
          capability: null,
          businessValue: null,
          maturity: null
        }
      };

    case 'SET_SEARCH_TERM':
      return {
        ...state,
        searchTerm: action.searchTerm
      };

    case 'CLEAR_SEARCH':
      return {
        ...state,
        searchTerm: ''
      };

    // ========================================================================
    // UI ACTIONS
    // ========================================================================
    case 'SET_VIEW_MODE':
      return {
        ...state,
        ui: {
          ...state.ui,
          viewMode: action.viewMode
        }
      };

    case 'TOGGLE_SIDEBAR':
      return {
        ...state,
        ui: {
          ...state.ui,
          sidebarCollapsed: !state.ui.sidebarCollapsed
        }
      };

    case 'SET_SIDEBAR_EXPANDED':
      return {
        ...state,
        ui: {
          ...state.ui,
          sidebarExpanded: action.expanded
        }
      };

    case 'TOGGLE_FILTERS':
      return {
        ...state,
        ui: {
          ...state.ui,
          showFilters: !state.ui.showFilters
        }
      };

    case 'TOGGLE_COLUMN_SELECTOR':
      return {
        ...state,
        ui: {
          ...state.ui,
          showColumnSelector: !state.ui.showColumnSelector
        }
      };

    case 'TOGGLE_COLUMN_VISIBILITY':
      return {
        ...state,
        columnVisibility: {
          ...state.columnVisibility,
          [action.column]: !state.columnVisibility[action.column]
        }
      };

    case 'SET_IS_MOBILE':
      return {
        ...state,
        ui: {
          ...state.ui,
          isMobile: action.isMobile,
          isDesktop: !action.isMobile
        }
      };

    // ========================================================================
    // MODAL ACTIONS - ✅ CRITICAL FIXES
    // ========================================================================
    case 'OPEN_MODAL':
      return {
        ...state,
        modal: {
          isOpen: true,
          selectedRequirement: action.payload?.requirement || action.requirement,
          editMode: action.payload?.editMode || action.editMode || false,
          data: action.payload?.modalData || null,
          loading: false,
          error: null
        }
      };

    case 'CLOSE_MODAL':
      return {
        ...state,
        modal: {
          isOpen: false,
          selectedRequirement: null,
          editMode: false,
          data: null,
          loading: false,
          error: null
        }
      };

    case 'TOGGLE_UPLOAD_MODAL':
      return {
        ...state,
        ui: {
          ...state.ui,
          showUploadModal: !state.ui.showUploadModal
        }
      };

    case 'TOGGLE_PURGE_MODAL':
      return {
        ...state,
        ui: {
          ...state.ui,
          showPurgeModal: !state.ui.showPurgeModal
        }
      };

    case 'TOGGLE_NEW_CAPABILITY_MODAL':
      return {
        ...state,
        ui: {
          ...state.ui,
          showNewCapabilityModal: !state.ui.showNewCapabilityModal
        }
      };

    case 'TOGGLE_COMPANY_PROFILE_MODAL':
      return {
        ...state,
        ui: {
          ...state.ui,
          showCompanyProfileModal: !state.ui.showCompanyProfileModal
        }
      };

    case 'TOGGLE_THREAT_SETTINGS_MODAL':
      return {
        ...state,
        ui: {
          ...state.ui,
          showThreatSettingsModal: !state.ui.showThreatSettingsModal
        }
      };

    case 'SET_MODAL_LOADING':
      return {
        ...state,
        modal: {
          ...state.modal,
          loading: action.loading
        }
      };

    case 'SET_MODAL_ERROR':
      return {
        ...state,
        modal: {
          ...state.modal,
          error: action.error
        }
      };

    // ========================================================================
    // SELECTION ACTIONS
    // ========================================================================
    case 'SET_SELECTED_CAPABILITY':
      return {
        ...state,
        selectedCapability: action.capabilityId
      };

    case 'SET_SELECTED_PCD':
      return {
        ...state,
        selectedPCD: action.pcdId
      };

    case 'SET_SELECTED_REQUIREMENT':
      return {
        ...state,
        selectedRequirement: action.requirementId
      };

    case 'CLEAR_ALL_SELECTIONS':
      return {
        ...state,
        selectedCapability: null,
        selectedPCD: null,
        selectedRequirement: null,
        selectedRisk: null,
        selectedThreat: null,
        selectedItems: []
      };

    // ========================================================================
    // USER PREFERENCE ACTIONS
    // ========================================================================
    case 'SET_COMPANY_PROFILE_SETUP':
      return {
        ...state,
        ui: {
          ...state.ui,
          showProfileSetup: action.show
        }
      };

    case 'UPDATE_USER_PREFERENCES':
      return {
        ...state,
        preferences: {
          ...state.preferences,
          ...action.preferences
        }
      };

    case 'SET_THEME':
      return {
        ...state,
        preferences: {
          ...state.preferences,
          theme: action.theme
        }
      };

    // ========================================================================
    // SYSTEM STATE ACTIONS
    // ========================================================================
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.loading
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.error
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };

    case 'ADD_WARNING':
      return {
        ...state,
        warnings: [...state.warnings, action.warning]
      };

    case 'CLEAR_WARNINGS':
      return {
        ...state,
        warnings: []
      };

    case 'SET_ONLINE_STATUS':
      return {
        ...state,
        isOnline: action.isOnline
      };

    // ========================================================================
    // BULK OPERATIONS
    // ========================================================================
    case 'RESET_UI_STATE':
      return {
        ...state,
        ui: {
          ...initialState.ui,
          viewMode: state.ui.viewMode // Preserve current view
        }
      };

    case 'RESET_FILTER_STATE':
      return {
        ...state,
        filters: initialState.filters,
        searchTerm: ''
      };

    // ========================================================================
    // DEFAULT
    // ========================================================================
    default:
      return state;
  }
};

export default dashboardReducer;