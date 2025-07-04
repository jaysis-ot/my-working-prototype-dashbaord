// src/store/initialState.js
import { VIEW_MODES, DEFAULT_VALUES, STORAGE_KEYS } from '../constants';

/**
 * Dashboard Initial State
 * 
 * Defines the complete initial state structure for the dashboard application.
 * Includes UI state, filters, modals, user preferences, and system state.
 * 
 * Features:
 * - Comprehensive state structure covering all dashboard features
 * - Type-safe state definitions with clear documentation
 * - localStorage integration for persistent preferences
 * - Responsive defaults based on screen size detection
 * - Extensible structure for future feature additions
 * - Performance optimized with selective state initialization
 */

// =============================================================================
// STATE STRUCTURE HELPERS
// =============================================================================

/**
 * Detect if device is mobile based on screen width
 * Used for initial responsive state
 */
const getInitialMobileState = () => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 1024; // lg breakpoint
};

/**
 * Load saved preferences from localStorage
 * Returns merged preferences with fallbacks
 */
const loadSavedPreferences = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.DASHBOARD_STATE);
    return saved ? JSON.parse(saved) : {};
  } catch (error) {
    console.warn('Failed to load saved dashboard state:', error);
    return {};
  }
};

/**
 * Get initial sidebar state based on device and preferences
 */
const getInitialSidebarState = (isMobile, savedPreferences) => {
  // Mobile devices start with sidebar collapsed
  if (isMobile) return false;
  
  // Use saved preference or default to expanded on desktop
  return savedPreferences.ui?.sidebarExpanded !== undefined 
    ? savedPreferences.ui.sidebarExpanded 
    : true;
};

/**
 * Get initial view mode from URL hash or saved preferences
 */
const getInitialViewMode = (savedPreferences) => {
  // Check URL hash first (for deep linking)
  if (typeof window !== 'undefined' && window.location.hash) {
    const hashView = window.location.hash.replace('#/', '').replace('#', '');
    if (Object.values(VIEW_MODES).includes(hashView)) {
      return hashView;
    }
  }
  
  // Use saved preference or default to overview
  return savedPreferences.ui?.viewMode || VIEW_MODES.OVERVIEW;
};

// =============================================================================
// INITIAL STATE SECTIONS
// =============================================================================

/**
 * UI State - Controls dashboard layout and interaction states
 */
const createInitialUIState = (savedPreferences = {}) => {
  const isMobile = getInitialMobileState();
  
  return {
    // View and navigation
    viewMode: getInitialViewMode(savedPreferences),
    previousViewMode: null,
    
    // Layout state
    sidebarExpanded: getInitialSidebarState(isMobile, savedPreferences),
    showFilters: savedPreferences.ui?.showFilters || false,
    showColumnSelector: false,
    
    // Responsive state
    isMobile,
    isTablet: false,
    isDesktop: !isMobile,
    
    // Modal states
    showUploadModal: false,
    showPurgeModal: false,
    showNewCapabilityModal: false,
    showCompanyProfileModal: false,
    showThreatSettingsModal: false,
    showProfileSetup: false,
    
    // Chart and visualization state
    fullscreenChart: null,
    chartPreferences: {
      defaultHeight: DEFAULT_VALUES.CHART_HEIGHT || 300,
      animationsEnabled: true,
      autoRefresh: true
    },
    
    // Selection state
    selectedCapability: null,
    selectedPCD: null,
    selectedRequirement: null,
    
    // Interaction state
    lastAction: null,
    lastActionTimestamp: null,
    
    // Performance tracking
    renderCount: 0,
    lastRenderTime: Date.now()
  };
};

/**
 * Filter State - Manages all filtering and search functionality
 */
const createInitialFilterState = (savedPreferences = {}) => ({
  // Filter values
  status: savedPreferences.filters?.status || '',
  capability: savedPreferences.filters?.capability || '',
  applicability: savedPreferences.filters?.applicability || '',
  area: savedPreferences.filters?.area || '',
  type: savedPreferences.filters?.type || '',
  priority: savedPreferences.filters?.priority || '',
  businessValue: savedPreferences.filters?.businessValue || '',
  maturity: savedPreferences.filters?.maturity || '',
  
  // Advanced filters
  dateRange: {
    start: null,
    end: null
  },
  costRange: {
    min: null,
    max: null
  },
  
  // Filter metadata
  activeFilterCount: 0,
  filterHistory: [],
  quickFilters: [
    { name: 'High Priority', filters: { priority: 'High' } },
    { name: 'Not Started', filters: { status: 'Not Started' } },
    { name: 'Essential Items', filters: { applicability: 'Essential' } }
  ]
});

/**
 * Search State - Manages search functionality and history
 */
const createInitialSearchState = () => ({
  searchTerm: '',
  searchResults: [],
  searchHistory: [],
  searchFilters: {
    includeDescriptions: true,
    includeMetadata: false,
    caseSensitive: false
  },
  recentSearches: [],
  savedSearches: []
});

/**
 * Modal State - Manages modal dialogs and their content
 */
const createInitialModalState = () => ({
  isOpen: false,
  selectedRequirement: null,
  editMode: false,
  modalHistory: [],
  
  // Modal-specific state
  uploadModal: {
    dragActive: false,
    uploadProgress: 0,
    uploadError: null
  },
  
  profileModal: {
    step: 1,
    totalSteps: 4,
    unsavedChanges: false
  }
});

/**
 * Column Visibility State - Manages table column display preferences
 */
const createInitialColumnVisibility = (savedPreferences = {}) => ({
  // Requirements table columns
  id: savedPreferences.columnVisibility?.id !== false,
  description: savedPreferences.columnVisibility?.description !== false,
  capability: savedPreferences.columnVisibility?.capability !== false,
  status: savedPreferences.columnVisibility?.status !== false,
  businessValue: savedPreferences.columnVisibility?.businessValue !== false,
  maturity: savedPreferences.columnVisibility?.maturity !== false,
  applicability: savedPreferences.columnVisibility?.applicability !== false,
  
  // Optional columns (hidden by default)
  area: savedPreferences.columnVisibility?.area === true,
  type: savedPreferences.columnVisibility?.type === true,
  priority: savedPreferences.columnVisibility?.priority === true,
  costEstimate: savedPreferences.columnVisibility?.costEstimate === true,
  createdDate: savedPreferences.columnVisibility?.createdDate === true,
  lastModified: savedPreferences.columnVisibility?.lastModified === true,
  
  // Capabilities table columns
  capabilityName: true,
  capabilityStatus: true,
  capabilityProgress: true,
  capabilityBusinessValue: true,
  
  // Analytics table columns
  analyticsMetric: true,
  analyticsValue: true,
  analyticsTrend: true
});

/**
 * User Preferences - Stores user-specific settings and preferences
 */
const createInitialUserPreferences = () => ({
  // Display preferences
  theme: 'default',
  compactMode: false,
  animationsEnabled: true,
  soundEnabled: false,
  
  // Notification preferences
  showNotifications: true,
  notificationTypes: {
    dataChanges: true,
    systemUpdates: true,
    riskAlerts: true,
    completionMilestones: true
  },
  
  // Data preferences
  defaultPageSize: DEFAULT_VALUES.PAGE_SIZE,
  autoRefreshInterval: DEFAULT_VALUES.DASHBOARD_REFRESH_INTERVAL,
  cacheTimeout: 300000, // 5 minutes
  
  // Accessibility preferences
  highContrast: false,
  reducedMotion: false,
  fontSize: 'medium',
  
  // Advanced preferences
  developerMode: process.env.NODE_ENV === 'development',
  debugMode: false,
  analyticsEnabled: true,
  
  // Keyboard shortcuts
  keyboardShortcutsEnabled: true,
  customShortcuts: {}
});

/**
 * System State - Tracks system-wide state and metadata
 */
const createInitialSystemState = () => ({
  // Loading and error states
  loading: false,
  error: null,
  warnings: [],
  
  // Performance metrics
  initialLoadTime: null,
  lastDataRefresh: null,
  averageResponseTime: null,
  
  // Feature flags
  features: {
    advancedAnalytics: true,
    threatIntelligence: true,
    mitreNavigator: true,
    riskManagement: true,
    bulkOperations: true,
    exportImport: true,
    realtimeUpdates: false
  },
  
  // System metadata
  version: '1.0.0',
  buildTime: null,
  lastUpdate: Date.now(),
  
  // Session information
  sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  sessionStartTime: Date.now(),
  
  // Connection state
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  connectionQuality: 'good'
});

/**
 * Analytics State - Tracks user interactions and system usage
 */
const createInitialAnalyticsState = () => ({
  // Page view tracking
  pageViews: [],
  currentSessionViews: 0,
  
  // Interaction tracking
  clickEvents: [],
  searchEvents: [],
  filterEvents: [],
  
  // Performance tracking
  loadTimes: [],
  errorEvents: [],
  
  // Feature usage
  featureUsage: {},
  shortcutUsage: {},
  
  // User journey
  userFlow: [],
  conversionFunnels: {}
});

// =============================================================================
// MAIN INITIAL STATE FACTORY
// =============================================================================

/**
 * Create the complete initial state for the dashboard
 * Merges all state sections with saved preferences
 */
export const createInitialState = () => {
  const savedPreferences = loadSavedPreferences();
  
  const state = {
    // Core application state
    ui: createInitialUIState(savedPreferences),
    filters: createInitialFilterState(savedPreferences),
    search: createInitialSearchState(),
    modal: createInitialModalState(),
    columnVisibility: createInitialColumnVisibility(savedPreferences),
    
    // User and system state
    userPreferences: createInitialUserPreferences(),
    system: createInitialSystemState(),
    analytics: createInitialAnalyticsState(),
    
    // Metadata
    stateVersion: '1.0.0',
    lastStateUpdate: Date.now(),
    
    // Computed state flags (for performance optimization)
    computed: {
      hasActiveFilters: false,
      totalFilteredItems: 0,
      hasUnsavedChanges: false,
      isDataLoading: false
    }
  };
  
  return state;
};

/**
 * Default initial state - used as fallback and for testing
 */
export const initialState = createInitialState();

// =============================================================================
// STATE VALIDATION AND UTILITIES
// =============================================================================

/**
 * Validate state structure
 * Ensures all required properties exist
 */
export const validateInitialState = (state) => {
  const requiredSections = [
    'ui', 'filters', 'search', 'modal', 'columnVisibility',
    'userPreferences', 'system', 'analytics'
  ];
  
  for (const section of requiredSections) {
    if (!state[section]) {
      throw new Error(`Missing required state section: ${section}`);
    }
  }
  
  // Validate UI state
  const requiredUIProps = ['viewMode', 'sidebarExpanded', 'isMobile'];
  for (const prop of requiredUIProps) {
    if (state.ui[prop] === undefined) {
      throw new Error(`Missing required UI property: ${prop}`);
    }
  }
  
  return true;
};

/**
 * Reset state to initial values
 * Useful for testing and state cleanup
 */
export const resetToInitialState = () => {
  return createInitialState();
};

/**
 * Merge partial state with initial state
 * Useful for testing with specific state configurations
 */
export const mergeWithInitialState = (partialState) => {
  const initial = createInitialState();
  return {
    ...initial,
    ...partialState,
    // Ensure nested objects are properly merged
    ui: { ...initial.ui, ...partialState.ui },
    filters: { ...initial.filters, ...partialState.filters },
    modal: { ...initial.modal, ...partialState.modal },
    userPreferences: { ...initial.userPreferences, ...partialState.userPreferences }
  };
};

/**
 * Get minimal state for testing
 * Returns only essential state properties
 */
export const getMinimalState = () => ({
  ui: {
    viewMode: VIEW_MODES.OVERVIEW,
    sidebarExpanded: true,
    isMobile: false
  },
  filters: createInitialFilterState(),
  modal: createInitialModalState(),
  columnVisibility: createInitialColumnVisibility()
});

// =============================================================================
// EXPORTS
// =============================================================================

export default initialState;

// Named exports for flexibility
export {
  createInitialUIState,
  createInitialFilterState,
  createInitialSearchState,
  createInitialModalState,
  createInitialColumnVisibility,
  createInitialUserPreferences,
  createInitialSystemState,
  createInitialAnalyticsState
};