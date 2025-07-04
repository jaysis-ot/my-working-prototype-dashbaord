// src/hooks/useDashboardState.js

import { useReducer, useEffect, useCallback, useMemo } from 'react';
import { 
  analyzeCompanyThreatProfile, 
  generateProfileInsights, 
  getProfileCompletionPercentage 
} from '../utils/companyProfile';
import { 
  filterRequirements, 
  searchRequirements, 
  sortRequirements,
  calculateCompletionStats,
  calculateBusinessValueStats 
} from '../utils/dashboardHelpers';
import { generateCSV, downloadCSV } from '../utils/csvUtils';
import { 
  VIEW_MODES, 
  SUCCESS_MESSAGES, 
  ERROR_MESSAGES
} from '../constants/dashboardConstants';

// Storage keys for localStorage
const STORAGE_KEYS = {
  COMPANY_PROFILE: 'cyberTrust_companyProfile',
  REQUIREMENTS: 'cyberTrust_requirements',
  CAPABILITIES: 'cyberTrust_capabilities',
  SETTINGS: 'cyberTrust_settings',
  THEME: 'cyberTrust_theme',
  SIDEBAR_STATE: 'cyberTrust_sidebarState'
};

/**
 * Dashboard State Management Hook
 * 
 * Centralized state management for the entire cyber trust dashboard.
 * Provides unified access to all dashboard state, data, and actions.
 * 
 * Features:
 * - Centralized state management with useReducer
 * - Company profile management with threat analysis
 * - Requirements and capabilities data management
 * - Filtering, searching, and sorting functionality
 * - Modal and UI state management
 * - Data persistence with localStorage
 * - CSV export/import functionality
 * - Toast notifications for user feedback
 * - Keyboard shortcuts integration
 * - Responsive behavior management
 * - Real-time threat intelligence updates
 */

// =============================================================================
// INITIAL STATE
// =============================================================================

const initialState = {
  // UI State
  ui: {
    viewMode: VIEW_MODES.OVERVIEW,
    sidebarOpen: true,
    sidebarCollapsed: false,
    theme: 'light',
    loading: false,
    error: null,
    
    // Modal states
    modals: {
      uploadModal: false,
      purgeModal: false,
      newCapabilityModal: false,
      companyProfileModal: false,
      threatSettingsModal: false,
      requirementModal: false,
      capabilityModal: false
    },
    
    // Selection states
    selectedCapability: null,
    selectedRequirement: null,
    selectedPCD: null,
    selectedRisk: null,
    selectedThreat: null,
    
    // Multi-select states
    multiSelect: false,
    selectedItems: [],
    
    // Profile setup
    showProfileSetup: false,
    profileCompletion: 0
  },
  
  // Data State
  data: {
    requirements: [],
    capabilities: [],
    risks: [],
    threats: [],
    pcdData: null,
    lastDataRefresh: null,
    dataVersion: '1.0.0'
  },
  
  // Company Profile State
  companyProfile: {
    // Basic Information
    companyName: '',
    registrationNumber: '',
    industry: '',
    subSector: '',
    companyType: '',
    
    // Size Information
    annualRevenue: '',
    employeeCount: '',
    balanceSheetTotal: '',
    
    // Contact Information
    headquarters: '',
    operatingRegions: [],
    contactEmail: '',
    contactPhone: '',
    
    // Technology & Data
    sensitiveDataTypes: [],
    technologySetup: '',
    legacySystemsDetails: '',
    internetFacingAssets: '',
    
    // Compliance
    complianceRequirements: [],
    otherCompliance: '',
    
    // Operational
    remoteEmployees: '',
    contractorAccess: '',
    revenueModel: '',
    
    // Risk Profile
    previousIncidents: false,
    incidentDetails: '',
    criticalVendors: [],
    businessContinuityPlan: false,
    
    // Additional Context
    primaryConcerns: '',
    complianceDeadlines: '',
    budgetRange: '',
    
    // Metadata
    profileCompleted: false,
    lastUpdated: null,
    createdDate: null
  },
  
  // Derived Analysis State
  threatContext: [],
  complianceRecommendations: [],
  securityScore: 0,
  maturityLevel: 'Not Assessed',
  
  // Filter and Search State
  filters: {
    status: '',
    capability: '',
    applicability: '',
    businessValue: '',
    maturity: '',
    area: '',
    type: ''
  },
  searchTerm: '',
  sortBy: 'id',
  sortOrder: 'asc',
  
  // Notification State
  notifications: [],
  
  // Analytics State
  analytics: {
    completionStats: {},
    businessValueStats: {},
    maturityStats: {},
    trendData: [],
    lastCalculated: null
  },
  
  // Settings State
  settings: {
    autoSave: true,
    darkMode: false,
    compactView: false,
    showHelp: true,
    exportFormat: 'csv',
    refreshInterval: 300000, // 5 minutes
    keyboardShortcuts: true
  },
  
  // Performance State
  performance: {
    renderCount: 0,
    lastRenderTime: null,
    cacheHits: 0,
    cacheMisses: 0
  }
};

// =============================================================================
// REDUCER FUNCTION
// =============================================================================

const dashboardReducer = (state, action) => {
  switch (action.type) {
    // =================================================================
    // VIEW MANAGEMENT
    // =================================================================
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
          sidebarOpen: !state.ui.sidebarOpen
        }
      };
    
    case 'TOGGLE_SIDEBAR_COLLAPSE':
      return {
        ...state,
        ui: {
          ...state.ui,
          sidebarCollapsed: !state.ui.sidebarCollapsed
        }
      };
    
    case 'SET_THEME':
      return {
        ...state,
        ui: {
          ...state.ui,
          theme: action.theme
        }
      };
    
    // =================================================================
    // LOADING AND ERROR STATES
    // =================================================================
    case 'SET_LOADING':
      return {
        ...state,
        ui: {
          ...state.ui,
          loading: action.loading
        }
      };
    
    case 'SET_ERROR':
      return {
        ...state,
        ui: {
          ...state.ui,
          error: action.error,
          loading: false
        }
      };
    
    case 'CLEAR_ERROR':
      return {
        ...state,
        ui: {
          ...state.ui,
          error: null
        }
      };
    
    // =================================================================
    // MODAL MANAGEMENT
    // =================================================================
    case 'TOGGLE_MODAL':
      return {
        ...state,
        ui: {
          ...state.ui,
          modals: {
            ...state.ui.modals,
            [action.modalName]: !state.ui.modals[action.modalName]
          }
        }
      };
    
    case 'CLOSE_ALL_MODALS':
      return {
        ...state,
        ui: {
          ...state.ui,
          modals: Object.keys(state.ui.modals).reduce((acc, key) => ({
            ...acc,
            [key]: false
          }), {})
        }
      };
    
    // =================================================================
    // DATA MANAGEMENT
    // =================================================================
    case 'SET_REQUIREMENTS':
      return {
        ...state,
        data: {
          ...state.data,
          requirements: action.requirements,
          lastDataRefresh: new Date().toISOString()
        }
      };
    
    case 'ADD_REQUIREMENT':
      return {
        ...state,
        data: {
          ...state.data,
          requirements: [...state.data.requirements, action.requirement]
        }
      };
    
    case 'UPDATE_REQUIREMENT':
      return {
        ...state,
        data: {
          ...state.data,
          requirements: state.data.requirements.map(req =>
            req.id === action.requirement.id ? action.requirement : req
          )
        }
      };
    
    case 'DELETE_REQUIREMENT':
      return {
        ...state,
        data: {
          ...state.data,
          requirements: state.data.requirements.filter(req => req.id !== action.requirementId)
        }
      };
    
    case 'SET_CAPABILITIES':
      return {
        ...state,
        data: {
          ...state.data,
          capabilities: action.capabilities
        }
      };
    
    case 'ADD_CAPABILITY':
      return {
        ...state,
        data: {
          ...state.data,
          capabilities: [...state.data.capabilities, action.capability]
        }
      };
    
    case 'UPDATE_CAPABILITY':
      return {
        ...state,
        data: {
          ...state.data,
          capabilities: state.data.capabilities.map(cap =>
            cap.id === action.capability.id ? action.capability : cap
          )
        }
      };
    
    case 'DELETE_CAPABILITY':
      return {
        ...state,
        data: {
          ...state.data,
          capabilities: state.data.capabilities.filter(cap => cap.id !== action.capabilityId)
        }
      };
    
    case 'PURGE_ALL_DATA':
      return {
        ...state,
        data: {
          requirements: [],
          capabilities: [],
          risks: [],
          threats: [],
          pcdData: null,
          lastDataRefresh: new Date().toISOString(),
          dataVersion: state.data.dataVersion
        }
      };
    
    // =================================================================
    // COMPANY PROFILE MANAGEMENT
    // =================================================================
    case 'UPDATE_COMPANY_PROFILE':
      return {
        ...state,
        companyProfile: {
          ...state.companyProfile,
          ...action.payload,
          lastUpdated: new Date().toISOString()
        }
      };
    
    case 'SET_PROFILE_COMPLETION':
      return {
        ...state,
        ui: {
          ...state.ui,
          profileCompletion: action.completion
        }
      };
    
    case 'TOGGLE_PROFILE_SETUP':
      return {
        ...state,
        ui: {
          ...state.ui,
          showProfileSetup: !state.ui.showProfileSetup
        }
      };
    
    // =================================================================
    // THREAT ANALYSIS
    // =================================================================
    case 'UPDATE_THREAT_CONTEXT':
      return {
        ...state,
        threatContext: action.payload
      };
    
    case 'UPDATE_COMPLIANCE_RECOMMENDATIONS':
      return {
        ...state,
        complianceRecommendations: action.payload
      };
    
    case 'UPDATE_SECURITY_SCORE':
      return {
        ...state,
        securityScore: action.score,
        maturityLevel: action.maturityLevel
      };
    
    // =================================================================
    // FILTERING AND SEARCH
    // =================================================================
    case 'SET_FILTER':
      return {
        ...state,
        filters: {
          ...state.filters,
          [action.filterType]: action.value
        }
      };
    
    case 'CLEAR_FILTERS':
      return {
        ...state,
        filters: {
          status: '',
          capability: '',
          applicability: '',
          businessValue: '',
          maturity: '',
          area: '',
          type: ''
        }
      };
    
    case 'SET_SEARCH_TERM':
      return {
        ...state,
        searchTerm: action.searchTerm
      };
    
    case 'SET_SORT':
      return {
        ...state,
        sortBy: action.sortBy,
        sortOrder: action.sortOrder
      };
    
    // =================================================================
    // SELECTION MANAGEMENT
    // =================================================================
    case 'SET_SELECTED_CAPABILITY':
      return {
        ...state,
        ui: {
          ...state.ui,
          selectedCapability: action.capability
        }
      };
    
    case 'SET_SELECTED_REQUIREMENT':
      return {
        ...state,
        ui: {
          ...state.ui,
          selectedRequirement: action.requirement
        }
      };
    
    case 'SET_SELECTED_PCD':
      return {
        ...state,
        ui: {
          ...state.ui,
          selectedPCD: action.pcdId
        }
      };
    
    case 'TOGGLE_MULTI_SELECT':
      return {
        ...state,
        ui: {
          ...state.ui,
          multiSelect: !state.ui.multiSelect,
          selectedItems: []
        }
      };
    
    case 'TOGGLE_ITEM_SELECTION':
      const isSelected = state.ui.selectedItems.includes(action.itemId);
      return {
        ...state,
        ui: {
          ...state.ui,
          selectedItems: isSelected
            ? state.ui.selectedItems.filter(id => id !== action.itemId)
            : [...state.ui.selectedItems, action.itemId]
        }
      };
    
    case 'CLEAR_SELECTIONS':
      return {
        ...state,
        ui: {
          ...state.ui,
          selectedItems: [],
          selectedCapability: null,
          selectedRequirement: null,
          selectedPCD: null
        }
      };
    
    // =================================================================
    // NOTIFICATIONS
    // =================================================================
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [
          ...state.notifications,
          {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            ...action.notification
          }
        ]
      };
    
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(
          notification => notification.id !== action.notificationId
        )
      };
    
    case 'CLEAR_NOTIFICATIONS':
      return {
        ...state,
        notifications: []
      };
    
    // =================================================================
    // ANALYTICS
    // =================================================================
    case 'UPDATE_ANALYTICS':
      return {
        ...state,
        analytics: {
          ...state.analytics,
          ...action.analytics,
          lastCalculated: new Date().toISOString()
        }
      };
    
    // =================================================================
    // SETTINGS
    // =================================================================
    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: {
          ...state.settings,
          ...action.settings
        }
      };
    
    // =================================================================
    // PERFORMANCE TRACKING
    // =================================================================
    case 'INCREMENT_RENDER_COUNT':
      return {
        ...state,
        performance: {
          ...state.performance,
          renderCount: state.performance.renderCount + 1,
          lastRenderTime: new Date().toISOString()
        }
      };
    
    default:
      console.warn(`Unknown action type: ${action.type}`);
      return state;
  }
};

// =============================================================================
// MAIN HOOK
// =============================================================================

export const useDashboardState = () => {
  const [state, dispatch] = useReducer(dashboardReducer, initialState);

  // =================================================================
  // COMPUTED VALUES
  // =================================================================
  
  const filteredRequirements = useMemo(() => {
    let filtered = state.data.requirements;
    
    // Apply filters
    if (state.filters.status) {
      filtered = filtered.filter(req => req.status === state.filters.status);
    }
    if (state.filters.capability) {
      filtered = filtered.filter(req => req.capabilityId === state.filters.capability);
    }
    if (state.filters.applicability) {
      filtered = filtered.filter(req => req.applicability?.type === state.filters.applicability);
    }
    if (state.filters.businessValue) {
      const minValue = parseInt(state.filters.businessValue);
      filtered = filtered.filter(req => (req.businessValueScore || 0) >= minValue);
    }
    if (state.filters.maturity) {
      filtered = filtered.filter(req => req.maturityLevel?.level === state.filters.maturity);
    }
    if (state.filters.area) {
      filtered = filtered.filter(req => req.area === state.filters.area);
    }
    if (state.filters.type) {
      filtered = filtered.filter(req => req.type === state.filters.type);
    }
    
    // Apply search
    if (state.searchTerm) {
      const searchLower = state.searchTerm.toLowerCase();
      filtered = filtered.filter(req =>
        req.title?.toLowerCase().includes(searchLower) ||
        req.description?.toLowerCase().includes(searchLower) ||
        req.id?.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply sorting
    return sortRequirements(filtered, state.sortBy, state.sortOrder);
  }, [state.data.requirements, state.filters, state.searchTerm, state.sortBy, state.sortOrder]);

  const completionStats = useMemo(() => {
    return calculateCompletionStats(state.data.requirements);
  }, [state.data.requirements]);

  const businessValueStats = useMemo(() => {
    return calculateBusinessValueStats(state.data.requirements);
  }, [state.data.requirements]);

  const profileCompletion = useMemo(() => {
    return getProfileCompletionPercentage(state.companyProfile);
  }, [state.companyProfile]);

  // =================================================================
  // EFFECT HOOKS
  // =================================================================
  
  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem(STORAGE_KEYS.COMPANY_PROFILE);
      if (savedProfile) {
        const profile = JSON.parse(savedProfile);
        dispatch({ type: 'UPDATE_COMPANY_PROFILE', payload: profile });
      }

      const savedRequirements = localStorage.getItem(STORAGE_KEYS.REQUIREMENTS);
      if (savedRequirements) {
        const requirements = JSON.parse(savedRequirements);
        dispatch({ type: 'SET_REQUIREMENTS', requirements });
      }

      const savedCapabilities = localStorage.getItem(STORAGE_KEYS.CAPABILITIES);
      if (savedCapabilities) {
        const capabilities = JSON.parse(savedCapabilities);
        dispatch({ type: 'SET_CAPABILITIES', capabilities });
      }

      const savedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        dispatch({ type: 'UPDATE_SETTINGS', settings });
      }
    } catch (error) {
      console.error('Error loading data from localStorage:', error);
    }
  }, []);

  // Auto-save data to localStorage
  useEffect(() => {
    if (state.settings.autoSave) {
      try {
        localStorage.setItem(STORAGE_KEYS.COMPANY_PROFILE, JSON.stringify(state.companyProfile));
        localStorage.setItem(STORAGE_KEYS.REQUIREMENTS, JSON.stringify(state.data.requirements));
        localStorage.setItem(STORAGE_KEYS.CAPABILITIES, JSON.stringify(state.data.capabilities));
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(state.settings));
      } catch (error) {
        console.error('Error saving data to localStorage:', error);
      }
    }
  }, [state.companyProfile, state.data.requirements, state.data.capabilities, state.settings]);

  // Update profile completion
  useEffect(() => {
    dispatch({ type: 'SET_PROFILE_COMPLETION', completion: profileCompletion });
  }, [profileCompletion]);

  // Update analytics
  useEffect(() => {
    const analytics = {
      completionStats,
      businessValueStats
    };
    dispatch({ type: 'UPDATE_ANALYTICS', analytics });
  }, [completionStats, businessValueStats]);

  // Auto-remove notifications
  useEffect(() => {
    state.notifications.forEach(notification => {
      if (notification.duration && notification.duration > 0) {
        const timer = setTimeout(() => {
          dispatch({
            type: 'REMOVE_NOTIFICATION',
            notificationId: notification.id
          });
        }, notification.duration);

        return () => clearTimeout(timer);
      }
    });
  }, [state.notifications]);

  // =================================================================
  // EVENT HANDLERS
  // =================================================================
  
  const handleProfileUpdate = useCallback(async (profileData, isFinalSave = true) => {
    try {
      dispatch({ type: 'SET_LOADING', loading: true });
      
      // Update the company profile
      dispatch({ 
        type: 'UPDATE_COMPANY_PROFILE', 
        payload: profileData 
      });

      if (isFinalSave) {
        // Generate threat context and recommendations
        const threatAnalysis = analyzeCompanyThreatProfile(profileData);
        const profileInsights = generateProfileInsights(profileData);
        
        // Update related state
        dispatch({
          type: 'UPDATE_THREAT_CONTEXT',
          payload: threatAnalysis.threatTypes || []
        });
        
        dispatch({
          type: 'UPDATE_COMPLIANCE_RECOMMENDATIONS',
          payload: profileInsights || []
        });

        // Show success notification
        dispatch({
          type: 'ADD_NOTIFICATION',
          notification: {
            type: 'success',
            title: 'Profile Updated',
            message: SUCCESS_MESSAGES.PROFILE_UPDATED,
            duration: 5000
          }
        });
      }

    } catch (error) {
      console.error('Error updating profile:', error);
      dispatch({
        type: 'ADD_NOTIFICATION',
        notification: {
          type: 'error',
          title: 'Update Failed',
          message: ERROR_MESSAGES.SAVE_FAILED,
          duration: 5000
        }
      });
    } finally {
      dispatch({ type: 'SET_LOADING', loading: false });
    }
  }, []);

  const handleRequirementUpdate = useCallback((requirement) => {
    dispatch({ type: 'UPDATE_REQUIREMENT', requirement });
    dispatch({
      type: 'ADD_NOTIFICATION',
      notification: {
        type: 'success',
        title: 'Requirement Updated',
        message: SUCCESS_MESSAGES.REQUIREMENT_UPDATED,
        duration: 3000
      }
    });
  }, []);

  const handleCapabilityUpdate = useCallback((capability) => {
    dispatch({ type: 'UPDATE_CAPABILITY', capability });
    dispatch({
      type: 'ADD_NOTIFICATION',
      notification: {
        type: 'success',
        title: 'Capability Updated',
        message: SUCCESS_MESSAGES.CAPABILITY_UPDATED,
        duration: 3000
      }
    });
  }, []);

  const handleFilterChange = useCallback((filterType, value) => {
    dispatch({ type: 'SET_FILTER', filterType, value });
  }, []);

  const handleSearchChange = useCallback((searchTerm) => {
    dispatch({ type: 'SET_SEARCH_TERM', searchTerm });
  }, []);

  const handleSortChange = useCallback((sortBy, sortOrder = 'asc') => {
    dispatch({ type: 'SET_SORT', sortBy, sortOrder });
  }, []);

  const handleExportCSV = useCallback(() => {
    try {
      const csvData = generateCSV(filteredRequirements);
      downloadCSV(csvData, 'requirements-export.csv');
      
      dispatch({
        type: 'ADD_NOTIFICATION',
        notification: {
          type: 'success',
          title: 'Export Successful',
          message: SUCCESS_MESSAGES.DATA_EXPORTED,
          duration: 3000
        }
      });
    } catch (error) {
      console.error('Export failed:', error);
      dispatch({
        type: 'ADD_NOTIFICATION',
        notification: {
          type: 'error',
          title: 'Export Failed',
          message: ERROR_MESSAGES.EXPORT_FAILED,
          duration: 5000
        }
      });
    }
  }, [filteredRequirements]);

  const handleImportCSV = useCallback((csvData) => {
    try {
      // Parse and validate CSV data
      const importedRequirements = parseCSVData(csvData);
      
      dispatch({ type: 'SET_REQUIREMENTS', requirements: importedRequirements });
      
      dispatch({
        type: 'ADD_NOTIFICATION',
        notification: {
          type: 'success',
          title: 'Import Successful',
          message: SUCCESS_MESSAGES.DATA_IMPORTED,
          duration: 3000
        }
      });
    } catch (error) {
      console.error('Import failed:', error);
      dispatch({
        type: 'ADD_NOTIFICATION',
        notification: {
          type: 'error',
          title: 'Import Failed',
          message: ERROR_MESSAGES.IMPORT_FAILED,
          duration: 5000
        }
      });
    }
  }, []);

  const handlePurgeData = useCallback(() => {
    dispatch({ type: 'PURGE_ALL_DATA' });
    dispatch({ type: 'TOGGLE_MODAL', modalName: 'purgeModal' });
    
    dispatch({
      type: 'ADD_NOTIFICATION',
      notification: {
        type: 'success',
        title: 'Data Purged',
        message: 'All data has been successfully removed.',
        duration: 3000
      }
    });
  }, []);

  const handleModalToggle = useCallback((modalName) => {
    dispatch({ type: 'TOGGLE_MODAL', modalName });
  }, []);

  const handleViewChange = useCallback((viewMode) => {
    dispatch({ type: 'SET_VIEW_MODE', viewMode });
  }, []);

  const handleThemeChange = useCallback((theme) => {
    dispatch({ type: 'SET_THEME', theme });
  }, []);

  const handleSettingsUpdate = useCallback((settings) => {
    dispatch({ type: 'UPDATE_SETTINGS', settings });
  }, []);

  // =================================================================
  // RETURN OBJECT
  // =================================================================
  
  const handlers = {
    handleProfileUpdate,
    handleRequirementUpdate,
    handleCapabilityUpdate,
    handleFilterChange,
    handleSearchChange,
    handleSortChange,
    handleExportCSV,
    handleImportCSV,
    handlePurgeData,
    handleModalToggle,
    handleViewChange,
    handleThemeChange,
    handleSettingsUpdate
  };

  const data = {
    requirements: state.data.requirements,
    capabilities: state.data.capabilities,
    companyProfile: state.companyProfile,
    filteredRequirements,
    threatContext: state.threatContext,
    complianceRecommendations: state.complianceRecommendations,
    completionStats,
    businessValueStats,
    profileCompletion,
    loading: state.ui.loading,
    error: state.ui.error
  };

  return {
    state,
    dispatch,
    handlers,
    data
  };
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

const parseCSVData = (csvData) => {
  // Implement CSV parsing logic
  // This is a placeholder - you'll need to implement proper CSV parsing
  return [];
};

export default useDashboardState;