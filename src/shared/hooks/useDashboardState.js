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

// Storage keys for localStorage
const STORAGE_KEYS = {
  COMPANY_PROFILE: 'cyberTrust_companyProfile',
  REQUIREMENTS: 'cyberTrust_requirements',
  CAPABILITIES: 'cyberTrust_capabilities',
  SETTINGS: 'cyberTrust_settings',
  THEME: 'cyberTrust_theme',
  SIDEBAR_STATE: 'cyberTrust_sidebarState'
};

// View modes
const VIEW_MODES = {
  OVERVIEW: 'overview',
  COMPANY_PROFILE: 'company-profile',
  CAPABILITIES: 'capabilities',
  REQUIREMENTS: 'requirements',
  THREAT_INTELLIGENCE: 'threat-intelligence',
  MITRE_NAVIGATOR: 'mitre-navigator',
  RISK_MANAGEMENT: 'risk-management',
  PCD_BREAKDOWN: 'pcd',
  MATURITY_ANALYSIS: 'maturity',
  BUSINESS_VALUE: 'justification',
  ANALYTICS: 'analytics',
  DIAGNOSTICS: 'diagnostics',
  SETTINGS: 'settings'
};

// Success and error messages
const SUCCESS_MESSAGES = {
  PROFILE_UPDATED: 'Company profile updated successfully!',
  REQUIREMENT_UPDATED: 'Requirement updated successfully!',
  CAPABILITY_UPDATED: 'Capability updated successfully!',
  DATA_EXPORTED: 'Data exported successfully!'
};

const ERROR_MESSAGES = {
  SAVE_FAILED: 'Failed to save changes. Please try again.',
  EXPORT_FAILED: 'Failed to export data. Please try again.'
};

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
  }
};

// =============================================================================
// REDUCER FUNCTION
// =============================================================================

const dashboardReducer = (state, action) => {
  switch (action.type) {
    // View Management
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
    
    // Data Management
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
    
    case 'SET_CAPABILITIES':
      return {
        ...state,
        data: {
          ...state.data,
          capabilities: action.capabilities
        }
      };
    
    // Company Profile Management
    case 'UPDATE_COMPANY_PROFILE':
      return {
        ...state,
        companyProfile: {
          ...state.companyProfile,
          ...action.payload,
          lastUpdated: new Date().toISOString()
        }
      };
    
    // Threat Analysis
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
    
    // Filtering and Search
    case 'SET_FILTER':
      return {
        ...state,
        filters: {
          ...state.filters,
          [action.filterType]: action.value
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
    
    // Notifications
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
    
    // Settings
    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: {
          ...state.settings,
          ...action.settings
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
        try {
          // Generate threat context and recommendations using correct function names
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
        } catch (analysisError) {
          console.warn('Error running profile analysis:', analysisError);
          // Continue without analysis if it fails
        }

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

  const handleViewChange = useCallback((viewMode) => {
    dispatch({ type: 'SET_VIEW_MODE', viewMode });
  }, []);

  // =================================================================
  // RETURN OBJECT
  // =================================================================
  
  const handlers = {
    handleProfileUpdate,
    handleRequirementUpdate,
    handleFilterChange,
    handleSearchChange,
    handleSortChange,
    handleExportCSV,
    handleViewChange
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

export default useDashboardState;