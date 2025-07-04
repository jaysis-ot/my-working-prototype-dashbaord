// src/store/initialState.js
import { VIEW_MODES } from '../constants';

export const initialState = {
  // UI State
  ui: {
    viewMode: VIEW_MODES.OVERVIEW,
    sidebarCollapsed: false,
    sidebarExpanded: true,
    showFilters: false,
    showColumnSelector: false,
    chartFullscreen: null,
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    compactMode: false,
    
    // Modal states
    showUploadModal: false,
    showPurgeModal: false,
    showNewCapabilityModal: false,
    showCompanyProfileModal: false,
    showThreatSettingsModal: false,
    showProfileSetup: false
  },

  // Modal state for requirement viewing/editing
  modal: {
    isOpen: false,
    selectedRequirement: null,
    editMode: false,
    data: null,
    loading: false,
    error: null
  },

  // Filter state
  filters: {
    status: null,
    priority: null,
    applicability: null,
    area: null,
    type: null,
    capability: null,
    businessValue: null,
    maturity: null
  },

  // Search state
  searchTerm: '',
  searchHistory: [],

  // Column visibility
  columnVisibility: {
    id: true,
    title: true,
    description: true,
    status: true,
    priority: true,
    area: true,
    type: true,
    businessValue: true,
    costEstimate: true,
    maturityLevel: false,
    applicability: false,
    assignee: false,
    dueDate: false,
    lastUpdated: true,
    actions: true
  },

  // Selection state
  selectedCapability: null,
  selectedPCD: null,
  selectedRequirement: null,
  selectedRisk: null,
  selectedThreat: null,
  multiSelect: false,
  selectedItems: [],

  // User preferences
  preferences: {
    theme: 'default',
    notifications: true,
    autoSave: true,
    compactView: false,
    showTooltips: true,
    defaultPageSize: 25
  },

  // System state
  loading: false,
  error: null,
  warnings: [],
  isOnline: true,
  connectionQuality: 'good',
  lastSyncTime: null,

  // Analytics state
  analytics: {
    pageViews: {},
    searchQueries: [],
    userActions: [],
    performanceMetrics: {}
  }
};

export default initialState;