import React, { useState, useEffect, useMemo, useReducer, lazy, Suspense, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, ScatterChart, Scatter } from 'recharts';

// Portal System imports
import Portal from './components/ui/Portal';
import Modal from './components/ui/Modal';
import { DropdownMenu, DropdownMenuItem } from './components/ui/DropdownMenu';
import { useToast } from './components/ui/Toast';
import { usePortal } from './hooks/usePortal';
import CompanyProfileSystem from './components/profile/CompanyProfileSystem';
import { useCompanyProfile } from './hooks/useCompanyProfile';
import { getCompanySize, getRevenueLabel, getEmployeeLabel } from './utils/companyProfile';

// Optimized imports - only what we need
import { 
  Upload, Filter, Search, Download, AlertTriangle, CheckCircle, Clock, FileText, 
  Shield, TrendingUp, Database, Bell, Eye, ArrowRight, ChevronLeft, ChevronRight, 
  BarChart3, Maximize2, Minimize2, Star, Lightbulb, GitBranch, DollarSign, 
  Timer, Gauge, Building2, X, Edit, Users, Target, Network, Lock, Activity, Layers,
  Trash2, Save, Plus, RefreshCw, Menu, MoreVertical
} from 'lucide-react';

// Constants and utilities
import * as CONSTANTS from './constants';
import { parseCSV, generateCSV, downloadCSV } from './utils/csvUtils';
import { transformCSVToRequirement, generateMockCapabilities, generateMockData } from './utils/dataService';

// Custom hooks
import { useRequirementsData } from './hooks/useRequirementsData';
import { useCapabilitiesData } from './hooks/useCapabilitiesData';
import { useAnalytics } from './hooks/useAnalytics';
import { useFilteredRequirements } from './hooks/useFilteredRequirements';
import { usePCDData } from './hooks/usePCDData';

// UI Components
import StatCard from './components/ui/StatCard';
import MaturityIndicator from './components/ui/MaturityIndicator';
import LoadingSpinner from './components/ui/LoadingSpinner';
import InteractiveChart from './components/charts/InteractiveChart';

// Modal Components
import EditRequirementModal from './components/modals/EditRequirementModal';
import CSVUploadModal from './components/modals/CSVUploadModal';
import PurgeConfirmationModal from './components/modals/PurgeConfirmationModal';
import NewCapabilityModal from './components/modals/NewCapabilityModal';
import ViewRequirementModal from './components/modals/ViewRequirementModal';

// View Components
import RequirementsTable from './components/requirements/RequirementsTable';
import PCDBreakdownView from './components/views/PCDBreakdownView';
import BusinessValueView from './components/views/BusinessValueView';
import MaturityAnalysisView from './components/views/MaturityAnalysisView';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Dashboard Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
            <p className="text-gray-600 mb-4">We're sorry, but there was an error loading the dashboard.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// State management with useReducer
const initialState = {
  filters: {
    area: '',
    type: '',
    status: '',
    priority: '',
    maturityLevel: '',
    applicability: '',
    capability: ''
  },
  ui: {
    viewMode: 'overview',
    sidebarExpanded: true,
    activeFilters: false,
    chartFullscreen: null,
    showUploadModal: false,
    showPurgeModal: false,
    showNewCapabilityModal: false,
    showColumnSelector: false,
    showCompanyProfileModal: false,
    showProfileSetup: false,
    selectedCapability: null,
    selectedPCD: null,
    isMobile: false
  },
  modal: {
    isOpen: false,
    selectedRequirement: null,
    editMode: false
  },
  searchTerm: '',
  columnVisibility: {
    id: true,
    description: true,
    capability: true,
    progressStatus: true,
    businessValue: true,
    maturity: true,
    applicability: true,
    status: true,
    actions: true,
    area: false,
    type: false,
    priority: false,
    assignee: false,
    dueDate: false
  }
};

const dashboardReducer = (state, action) => {
  switch (action.type) {
    case 'SET_FILTER':
      return {
        ...state,
        filters: { ...state.filters, [action.field]: action.value }
      };
    case 'CLEAR_FILTERS':
      return {
        ...state,
        filters: initialState.filters
      };
    case 'CLEAR_SEARCH':
      return {
        ...state,
        searchTerm: ''
      };
    case 'SET_VIEW_MODE':
      return {
        ...state,
        ui: { ...state.ui, viewMode: action.viewMode }
      };
    case 'TOGGLE_SIDEBAR':
      return {
        ...state,
        ui: { ...state.ui, sidebarExpanded: !state.ui.sidebarExpanded }
      };
    case 'SET_SIDEBAR_EXPANDED':
      return {
        ...state,
        ui: { ...state.ui, sidebarExpanded: action.expanded }
      };
    case 'TOGGLE_FILTERS':
      return {
        ...state,
        ui: { ...state.ui, activeFilters: !state.ui.activeFilters }
      };
    case 'TOGGLE_COLUMN_SELECTOR':
      return {
        ...state,
        ui: { ...state.ui, showColumnSelector: !state.ui.showColumnSelector }
      };
    case 'TOGGLE_COLUMN_VISIBILITY':
      return {
        ...state,
        columnVisibility: { ...state.columnVisibility, [action.column]: !state.columnVisibility[action.column] }
      };
    case 'OPEN_MODAL':
      return {
        ...state,
        modal: { isOpen: true, selectedRequirement: action.requirement, editMode: action.editMode || false }
      };
    case 'CLOSE_MODAL':
      return {
        ...state,
        modal: { isOpen: false, selectedRequirement: null, editMode: false }
      };
    case 'SET_SEARCH_TERM':
      return {
        ...state,
        searchTerm: action.searchTerm
      };
    case 'SET_CHART_FULLSCREEN':
      return {
        ...state,
        ui: { ...state.ui, chartFullscreen: action.chartId }
      };
    case 'TOGGLE_UPLOAD_MODAL':
      return {
        ...state,
        ui: { ...state.ui, showUploadModal: !state.ui.showUploadModal }
      };
    case 'TOGGLE_PURGE_MODAL':
      return {
        ...state,
        ui: { ...state.ui, showPurgeModal: !state.ui.showPurgeModal }
      };
    case 'TOGGLE_NEW_CAPABILITY_MODAL':
      return {
        ...state,
        ui: { ...state.ui, showNewCapabilityModal: !state.ui.showNewCapabilityModal }
      };
    case 'SET_SELECTED_CAPABILITY':
      return {
        ...state,
        ui: { ...state.ui, selectedCapability: action.capabilityId },
        filters: { ...state.filters, capability: action.capabilityId }
      };
    case 'SET_SELECTED_PCD':
      return {
        ...state,
        ui: { ...state.ui, selectedPCD: action.pcdId }
      };
    case 'SET_IS_MOBILE':
      return {
        ...state,
        ui: { ...state.ui, isMobile: action.isMobile }
      };
    case 'TOGGLE_COMPANY_PROFILE_MODAL':
      return {
        ...state,
        ui: { ...state.ui, showCompanyProfileModal: !state.ui.showCompanyProfileModal }
      };
    case 'SET_COMPANY_PROFILE_SETUP':
      return {
        ...state,
        ui: { ...state.ui, showProfileSetup: action.show }
      };
    default:
      return state;
  }
};

// Main Dashboard Component
const RequirementsDashboard = () => {
  const [state, dispatch] = useReducer(dashboardReducer, initialState);
  
  // Add Toast hook for notifications
  const { addToast } = useToast();

  // Company profile hook
  const { profile: companyProfile, loading: profileLoading, saveProfile } = useCompanyProfile();

  // Data hooks
  const { 
    requirements, 
    loading, 
    error, 
    updateRequirement, 
    deleteRequirement, 
    addRequirement, 
    purgeAllData, 
    importFromCSV 
  } = useRequirementsData();
  
  const { capabilities, loading: capabilitiesLoading, addCapability } = useCapabilitiesData();
  const { pcdData, loading: pcdLoading, updatePCDData } = usePCDData();
  
  // Processed data
  const filteredRequirements = useFilteredRequirements(requirements, state.filters, state.searchTerm);
  const analyticsData = useAnalytics(requirements);

  // Mobile detection and responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      const isMobile = window.innerWidth < 1024;
      dispatch({ type: 'SET_IS_MOBILE', isMobile });
      
      // Auto-collapse sidebar on mobile
      if (isMobile && state.ui.sidebarExpanded) {
        dispatch({ type: 'SET_SIDEBAR_EXPANDED', expanded: false });
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [state.ui.sidebarExpanded]);

  // Check if profile setup is needed
  useEffect(() => {
    if (!profileLoading && (!companyProfile || !companyProfile.profileCompleted)) {
      // Show setup prompt for new users after a delay
      const timer = setTimeout(() => {
        dispatch({ type: 'SET_COMPANY_PROFILE_SETUP', show: true });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [profileLoading, companyProfile]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Escape to close modals
      if (e.key === 'Escape') {
        dispatch({ type: 'CLOSE_MODAL' });
      }

      // Cmd/Ctrl + 1-8 for quick view switching (updated for new view)
      if ((e.metaKey || e.ctrlKey) && e.key >= '1' && e.key <= '8') {
        e.preventDefault();
        const views = ['overview', 'company-profile', 'capabilities', 'requirements', 'pcd', 'maturity', 'justification', 'analytics'];
        const viewIndex = parseInt(e.key) - 1;
        if (views[viewIndex]) {
          dispatch({ type: 'SET_VIEW_MODE', viewMode: views[viewIndex] });
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Event handlers with Toast notifications
  const handleFilterChange = (field, value) => {
    dispatch({ type: 'SET_FILTER', field, value });
  };

  const handleViewRequirement = (requirement) => {
    dispatch({ type: 'OPEN_MODAL', requirement });
  };

  const handleEditRequirement = (requirement) => {
    dispatch({ type: 'OPEN_MODAL', requirement, editMode: true });
  };

  // Profile update handler
  const handleProfileUpdate = (updatedProfile, isFinalSave = true) => {
    const success = saveProfile(updatedProfile, !isFinalSave); // Pass isPartialUpdate as opposite of isFinalSave
    if (success && isFinalSave) {
      // Only show toast and close modal for final saves
      addToast('Company profile updated successfully!', 'success');
      dispatch({ type: 'TOGGLE_COMPANY_PROFILE_MODAL' });
    } else if (!success && isFinalSave) {
      addToast('Failed to update company profile.', 'error');
    }
    // For real-time updates (isFinalSave = false), we don't show toasts or close modals
  };

  // Updated with Toast notifications and async handling
  const handleUploadCSV = async (csvData) => {
    try {
      const success = await importFromCSV(csvData);
      if (success) {
        addToast(`Successfully imported ${csvData.length} requirements!`, 'success');
        dispatch({ type: 'TOGGLE_UPLOAD_MODAL' });
      } else {
        addToast('Failed to import CSV data. Please check the format.', 'error');
      }
    } catch (error) {
      addToast('An error occurred during import.', 'error');
    }
  };

  const handlePurgeData = async () => {
    try {
      const success = await purgeAllData();
      if (success) {
        addToast('All data has been purged successfully.', 'success');
        dispatch({ type: 'TOGGLE_PURGE_MODAL' });
      } else {
        addToast('Failed to purge data.', 'error');
      }
    } catch (error) {
      addToast('Failed to purge data.', 'error');
    }
  };

  const handleSelectCapability = (capabilityId) => {
    dispatch({ type: 'SET_SELECTED_CAPABILITY', capabilityId });
    dispatch({ type: 'SET_VIEW_MODE', viewMode: 'requirements' });
  };

  const handleCreateCapability = async (newCapability) => {
    try {
      const success = await addCapability(newCapability);
      if (success) {
        addToast(`Successfully created capability ${newCapability.id}!`, 'success');
        dispatch({ type: 'TOGGLE_NEW_CAPABILITY_MODAL' });
        return true;
      } else {
        addToast('Failed to create capability.', 'error');
        return false;
      }
    } catch (error) {
      addToast('Failed to create capability.', 'error');
      return false;
    }
  };

  const handleExportCSV = () => {
    try {
      const csvContent = generateCSV(requirements);
      const filename = `requirements_export_${new Date().toISOString().split('T')[0]}.csv`;
      downloadCSV(csvContent, filename);
      addToast('CSV export completed successfully!', 'success');
    } catch (error) {
      addToast('Failed to export CSV.', 'error');
    }
  };

  const handleUpdateRequirement = async (updatedRequirement) => {
    try {
      const success = await updateRequirement(updatedRequirement);
      if (success) {
        addToast('Requirement updated successfully!', 'success');
        dispatch({ type: 'CLOSE_MODAL' });
      } else {
        addToast('Failed to update requirement.', 'error');
      }
    } catch (error) {
      addToast('Failed to update requirement.', 'error');
    }
  };

  // Loading check
  if (loading || capabilitiesLoading || pcdLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">Dashboard Error</div>
          <div className="text-gray-600 mb-4">{error}</div>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Reload Dashboard
          </button>
        </div>
      </div>
    );
  }

  const Sidebar = () => (
    <>
      {/* Mobile backdrop */}
      {state.ui.isMobile && state.ui.sidebarExpanded && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <nav className={`
        bg-gray-900 text-white flex flex-col transition-all duration-300 z-50
        ${state.ui.isMobile 
          ? state.ui.sidebarExpanded 
            ? 'fixed inset-y-0 left-0 w-64 shadow-2xl' 
            : 'hidden'
          : state.ui.sidebarExpanded 
            ? 'relative w-64' 
            : 'relative w-16'
        }
      `}>
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            {state.ui.sidebarExpanded && (
              <h2 className="text-lg font-semibold">
                {/* Dynamic sidebar title - shows company name when available */}
                {companyProfile?.companyName && companyProfile.companyName.trim() 
                  ? `${companyProfile.companyName.split(' ')[0]} Portal` 
                  : 'OT Dashboard'
                }
              </h2>
            )}
            <button
              onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
              className="p-2 hover:bg-blue-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label={state.ui.sidebarExpanded ? "Collapse sidebar" : "Expand sidebar"}
            >
              {state.ui.isMobile ? (
                state.ui.sidebarExpanded ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />
              ) : (
                state.ui.sidebarExpanded ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <div className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-1">
            {[
              { id: 'overview', name: 'Overview', icon: TrendingUp },
              { id: 'company-profile', name: 'Company Profile', icon: Building2 },
              { id: 'capabilities', name: 'Capabilities', icon: Network },
              { id: 'requirements', name: 'Requirements', icon: FileText },
              { id: 'pcd', name: 'PCD Breakdown', icon: Building2 },
              { id: 'maturity', name: 'Maturity Analysis', icon: Gauge },
              { id: 'justification', name: 'Business Value', icon: Star },
              { id: 'analytics', name: 'Analytics', icon: BarChart3 }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  dispatch({ type: 'SET_VIEW_MODE', viewMode: item.id });
                  // Auto-close sidebar on mobile after navigation
                  if (state.ui.isMobile && state.ui.sidebarExpanded) {
                    dispatch({ type: 'TOGGLE_SIDEBAR' });
                  }
                }}
                className={`w-full flex items-center px-3 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  state.ui.viewMode === item.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-300 hover:bg-blue-600 hover:text-white'
                }`}
                aria-current={state.ui.viewMode === item.id ? 'page' : undefined}
                title={!state.ui.sidebarExpanded ? item.name : undefined}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {state.ui.sidebarExpanded && <span className="ml-3 truncate font-medium">{item.name}</span>}
                
                {/* Active indicator for collapsed state */}
                {!state.ui.sidebarExpanded && state.ui.viewMode === item.id && (
                  <div className="absolute left-0 w-1 h-8 bg-blue-400 rounded-r-full" />
                )}
              </button>
            ))}
          </div>
        </div>

        {state.ui.sidebarExpanded && (
          <div className="p-4 border-t border-gray-700">
            <h3 className="text-sm font-medium text-gray-300 mb-3">Data Management</h3>
            <div className="space-y-1">
              <button
                onClick={() => dispatch({ type: 'TOGGLE_UPLOAD_MODAL' })}
                className="w-full flex items-center px-3 py-2 text-sm text-gray-300 hover:bg-blue-600 hover:text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <Upload className="h-4 w-4 mr-3 flex-shrink-0" />
                Upload CSV
              </button>
              <button
                onClick={handleExportCSV}
                className="w-full flex items-center px-3 py-2 text-sm text-gray-300 hover:bg-blue-600 hover:text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <Download className="h-4 w-4 mr-3 flex-shrink-0" />
                Export CSV
              </button>
              <button
                onClick={() => dispatch({ type: 'TOGGLE_PURGE_MODAL' })}
                className="w-full flex items-center px-3 py-2 text-sm text-red-400 hover:bg-red-900 hover:bg-opacity-20 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <Trash2 className="h-4 w-4 mr-3 flex-shrink-0" />
                Purge Data
              </button>
            </div>
          </div>
        )}
      </nav>
    </>
  );

  const Header = () => {
    // Dynamic title based on company profile
    // Changes from "OT Requirements Management" to "{Company Name} Cyber Trust Portal" 
    // when user starts filling in the Basic Company Information section
    const getDashboardTitle = () => {
      if (companyProfile?.companyName && companyProfile.companyName.trim()) {
        return `${companyProfile.companyName} Cyber Trust Portal`;
      }
      return 'Cyber Trust Portal';
    };

    return (
      <header className="bg-white shadow-sm border-b sticky top-0 z-30">
        <div className="px-4 lg:px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center min-w-0 flex-1">
              {/* Mobile menu button */}
              <button
                className="lg:hidden p-2 -ml-2 mr-3 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
                aria-label={state.ui.sidebarExpanded ? "Close sidebar" : "Open sidebar"}
              >
                <Menu className="h-5 w-5 text-gray-600" />
              </button>
              
              <div className="min-w-0 flex-1">
                <h1 className="text-xl lg:text-2xl font-bold text-gray-900 truncate">
                  {getDashboardTitle()}
                </h1>
                <div className="hidden sm:flex items-center mt-1 text-xs lg:text-sm text-gray-600 space-x-4">
                  <div className="flex items-center">
                    <Layers className="h-3 w-3 lg:h-4 lg:w-4 mr-1" />
                    <span>Network Segmentation Project</span>
                  </div>
                  <div className="flex items-center">
                    <Activity className="h-3 w-3 lg:h-4 lg:w-4 mr-1" />
                    <span>{filteredRequirements.length} of {requirements.length} requirements</span>
                  </div>
                  <div className="flex items-center">
                    <Database className="h-3 w-3 lg:h-4 lg:w-4 mr-1" />
                    <span>Demo data active</span>
                  </div>
                </div>
                
                {/* Mobile-only simplified stats */}
                <div className="sm:hidden mt-1 text-xs text-gray-600">
                  <div className="flex items-center">
                    <Activity className="h-3 w-3 mr-1" />
                    <span>{filteredRequirements.length}/{requirements.length} requirements</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 lg:space-x-3 ml-4">
              {/* Company profile quick access */}
              {companyProfile?.profileCompleted && (
                <button 
                  onClick={() => dispatch({ type: 'TOGGLE_COMPANY_PROFILE_MODAL' })}
                  className="hidden md:inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  title="Company Profile"
                >
                  <Building2 className="h-4 w-4 mr-2" />
                  {companyProfile.companyName.split(' ')[0]}
                </button>
              )}

              {/* Test Toast Button - Development only */}
              {process.env.NODE_ENV === 'development' && (
                <button 
                  onClick={() => addToast('Portal system working perfectly! 🎉', 'success')}
                  className="hidden md:inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  <Star className="h-4 w-4 mr-2" />
                  Test
                </button>
              )}
              
              <button 
                onClick={handleExportCSV}
                className="hidden sm:inline-flex items-center px-3 lg:px-4 py-2 border border-transparent rounded-lg shadow-sm text-xs lg:text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                <Download className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
                <span className="hidden lg:inline">Export CSV</span>
                <span className="lg:hidden">Export</span>
              </button>
              
              {/* Mobile menu button */}
              <button
                className="sm:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="More options"
              >
                <MoreVertical className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </header>
    );
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
        <Sidebar />
        
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          
          <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
            {/* Company Profile View */}
            {state.ui.viewMode === 'company-profile' && (
              <CompanyProfileSystem 
                onProfileUpdate={handleProfileUpdate}
                existingProfile={companyProfile}
              />
            )}

            {/* Overview View */}
            {state.ui.viewMode === 'overview' && (
              <div className="space-y-6">
                {/* Company Profile Summary Card */}
                {companyProfile?.profileCompleted && (
                  <div className="bg-white rounded-xl shadow-md p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <Building2 className="h-6 w-6 mr-3 text-blue-600" />
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {companyProfile.companyName}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {companyProfile.industry} • {getCompanySize(companyProfile)} Business
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => dispatch({ type: 'SET_VIEW_MODE', viewMode: 'company-profile' })}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                        title="Edit Company Profile"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Revenue:</span>
                        <div className="font-medium">{getRevenueLabel(companyProfile.annualRevenue)}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Employees:</span>
                        <div className="font-medium">{getEmployeeLabel(companyProfile.employeeCount)}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Regions:</span>
                        <div className="font-medium">{companyProfile.operatingRegions?.length || 0} regions</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Frameworks:</span>
                        <div className="font-medium">{companyProfile.complianceRequirements?.length || 0} selected</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Setup prompt if profile not completed */}
                {(!companyProfile?.profileCompleted || state.ui.showProfileSetup) && (
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <AlertTriangle className="h-6 w-6 mr-3" />
                        <div>
                          <h3 className="text-lg font-semibold">Complete Your Company Profile</h3>
                          <p className="text-blue-100 mt-1">
                            Set up your company profile to get tailored threat assessments and compliance recommendations.
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => dispatch({ type: 'SET_COMPANY_PROFILE_SETUP', show: false })}
                          className="text-blue-100 hover:text-white transition-colors"
                        >
                          <X className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => {
                            dispatch({ type: 'SET_VIEW_MODE', viewMode: 'company-profile' });
                            dispatch({ type: 'SET_COMPANY_PROFILE_SETUP', show: false });
                          }}
                          className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-colors"
                        >
                          Get Started
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Regulatory Context Banner */}
                <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-xl p-6 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-16 -mt-16" />
                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <Shield className="h-6 w-6 mr-3" />
                        <h3 className="text-xl font-semibold">Regulatory Compliance Framework</h3>
                      </div>
                      <div className="text-sm bg-white bg-opacity-20 px-3 py-1 rounded-full">
                        Active Compliance
                      </div>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6 text-sm">
                      <div className="flex items-center space-x-3">
                        <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                          <Network className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-semibold">Ofgem Framework</div>
                          <div className="text-blue-100 text-xs">Clean power transition by 2030</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                          <Lock className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-semibold">NCSC CAF Guidance</div>
                          <div className="text-blue-100 text-xs">OES compliance mapping</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                          <Building2 className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-semibold">Business Justification</div>
                          <div className="text-blue-100 text-xs">Value & impact analysis</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Widget Grid - All 12 StatCard widgets with improved mobile layout */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                  <StatCard
                    title="Total Requirements"
                    value={requirements.length}
                    icon={FileText}
                    color="#3b82f6"
                    subtitle="+12% this month"
                    onClick={() => dispatch({ type: 'SET_VIEW_MODE', viewMode: 'requirements' })}
                  />
                  
                  <StatCard
                    title="Completed"
                    value={requirements.filter(r => r.status === 'Completed').length}
                    icon={CheckCircle}
                    color="#10b981"
                    subtitle={`${requirements.length ? ((requirements.filter(r => r.status === 'Completed').length / requirements.length) * 100).toFixed(0) : 0}% done`}
                    onClick={() => {
                      dispatch({ type: 'SET_FILTER', field: 'status', value: 'Completed' });
                      dispatch({ type: 'SET_VIEW_MODE', viewMode: 'requirements' });
                    }}
                  />
                  
                  <StatCard
                    title="In Progress"
                    value={requirements.filter(r => r.status === 'In Progress').length}
                    icon={Clock}
                    color="#f59e0b"
                    subtitle="Active work"
                    onClick={() => {
                      dispatch({ type: 'SET_FILTER', field: 'status', value: 'In Progress' });
                      dispatch({ type: 'SET_VIEW_MODE', viewMode: 'requirements' });
                    }}
                  />
                  
                  <StatCard
                    title="Not Started"
                    value={requirements.filter(r => r.status === 'Not Started').length}
                    icon={AlertTriangle}
                    color="#ef4444"
                    subtitle="Needs attention"
                    onClick={() => {
                      dispatch({ type: 'SET_FILTER', field: 'status', value: 'Not Started' });
                      dispatch({ type: 'SET_VIEW_MODE', viewMode: 'requirements' });
                    }}
                  />

                  <StatCard
                    title="High Priority"
                    value={requirements.filter(r => r.priority === 'Critical' || r.priority === 'High').length}
                    icon={Target}
                    color="#8b5cf6"
                    subtitle="Critical items"
                    onClick={() => {
                      dispatch({ type: 'SET_FILTER', field: 'priority', value: 'Critical' });
                      dispatch({ type: 'SET_VIEW_MODE', viewMode: 'requirements' });
                    }}
                  />
                  
                  <StatCard
                    title="Capabilities"
                    value={capabilities.length}
                    icon={Network}
                    color="#6366f1"
                    subtitle="Active programs"
                    onClick={() => dispatch({ type: 'SET_VIEW_MODE', viewMode: 'capabilities' })}
                  />

                  <StatCard
                    title="Avg Business Value"
                    value={(requirements.reduce((sum, r) => sum + (r.businessValueScore || 0), 0) / requirements.length || 0).toFixed(1)}
                    icon={Star}
                    color="#fbbf24"
                    subtitle="Out of 5.0"
                    onClick={() => dispatch({ type: 'SET_VIEW_MODE', viewMode: 'justification' })}
                  />

                  <StatCard
                    title="High Value Items"
                    value={requirements.filter(r => (r.businessValueScore || 0) >= 4).length}
                    icon={DollarSign}
                    color="#10b981"
                    subtitle="4.0+ rating"
                    onClick={() => {
                      dispatch({ type: 'SET_SEARCH_TERM', searchTerm: '' });
                      dispatch({ type: 'CLEAR_FILTERS' });
                      dispatch({ type: 'SET_VIEW_MODE', viewMode: 'justification' });
                    }}
                  />

                  <StatCard
                    title="Avg Maturity"
                    value={(requirements.reduce((sum, r) => sum + (r.maturityLevel?.score || 0), 0) / requirements.length || 0).toFixed(1)}
                    icon={Gauge}
                    color="#06b6d4"
                    subtitle="Out of 5.0"
                    onClick={() => dispatch({ type: 'SET_VIEW_MODE', viewMode: 'maturity' })}
                  />

                  <StatCard
                    title="Unassigned"
                    value={requirements.filter(r => !r.capabilityId).length}
                    icon={GitBranch}
                    color="#f43f5e"
                    subtitle="Need capability"
                    onClick={() => {
                      dispatch({ type: 'SET_FILTER', field: 'capability', value: '' });
                      dispatch({ type: 'SET_VIEW_MODE', viewMode: 'requirements' });
                    }}
                  />

                  <StatCard
                    title="Total Investment"
                    value={`£${(requirements.reduce((sum, r) => sum + (r.costEstimate || 0), 0) / 1000000).toFixed(1)}M`}
                    icon={BarChart3}
                    color="#f97316"
                    subtitle="Estimated cost"
                    onClick={() => dispatch({ type: 'SET_VIEW_MODE', viewMode: 'analytics' })}
                  />

                  <StatCard
                    title="Essential Items"
                    value={requirements.filter(r => r.applicability?.type === 'Essential').length}
                    icon={Shield}
                    color="#14b8a6"
                    subtitle="Must implement"
                    onClick={() => {
                      dispatch({ type: 'SET_FILTER', field: 'applicability', value: 'Essential' });
                      dispatch({ type: 'SET_VIEW_MODE', viewMode: 'requirements' });
                    }}
                  />
                </div>

                {/* Quick Actions Section with improved mobile layout */}
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Lightbulb className="h-5 w-5 mr-2 text-yellow-500" />
                    Quick Actions
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                    <button 
                      onClick={() => dispatch({ type: 'SET_VIEW_MODE', viewMode: 'capabilities' })}
                      className="flex flex-col items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group"
                    >
                      <Network className="h-6 w-6 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-medium text-blue-700 text-center">View Capabilities</span>
                    </button>
                    <button 
                      onClick={handleExportCSV}
                      className="flex flex-col items-center p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors group"
                    >
                      <Download className="h-6 w-6 text-orange-600 mb-2 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-medium text-orange-700 text-center">Export Data</span>
                    </button>
                    <button 
                      onClick={() => dispatch({ type: 'SET_VIEW_MODE', viewMode: 'analytics' })}
                      className="flex flex-col items-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors group"
                    >
                      <BarChart3 className="h-6 w-6 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-medium text-purple-700 text-center">View Analytics</span>
                    </button>
                    <button 
                      onClick={() => {
                        dispatch({ type: 'CLEAR_FILTERS' });
                        dispatch({ type: 'SET_SEARCH_TERM', searchTerm: '' });
                        dispatch({ type: 'SET_VIEW_MODE', viewMode: 'requirements' });
                      }}
                      className="flex flex-col items-center p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
                    >
                      <RefreshCw className="h-6 w-6 text-gray-600 mb-2 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-medium text-gray-700 text-center">Reset Filters</span>
                    </button>
                  </div>
                </div>

                {/* Activity Feed with enhanced styling */}
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Activity className="h-5 w-5 mr-2 text-green-600" />
                    Recent Activity
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                      <div className="bg-green-100 p-1 rounded-full">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">Demo data loaded</p>
                        <p className="text-xs text-gray-600 mt-1">
                          {requirements.length} requirements generated successfully • Just now
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                      <div className="bg-blue-100 p-1 rounded-full">
                        <Upload className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">Mobile improvements added</p>
                        <p className="text-xs text-gray-600 mt-1">
                          Responsive design and mobile navigation • Just now
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Requirements View */}
            {state.ui.viewMode === 'requirements' && (
              <RequirementsTable
                requirements={requirements}
                filteredRequirements={filteredRequirements}
                capabilities={capabilities}
                filters={state.filters}
                searchTerm={state.searchTerm}
                columnVisibility={state.columnVisibility}
                onFilterChange={handleFilterChange}
                onSearchChange={(searchTerm) => dispatch({ type: 'SET_SEARCH_TERM', searchTerm })}
                onClearFilters={() => dispatch({ type: 'CLEAR_FILTERS' })}
                onClearSearch={() => dispatch({ type: 'CLEAR_SEARCH' })}
                onToggleColumnVisibility={(column) => dispatch({ type: 'TOGGLE_COLUMN_VISIBILITY', column })}
                onViewRequirement={handleViewRequirement}
                onEditRequirement={handleEditRequirement}
                onExportCSV={handleExportCSV}
                onImportCSV={() => dispatch({ type: 'TOGGLE_UPLOAD_MODAL' })}
              />
            )}

            {/* Analytics View */}
            {state.ui.viewMode === 'analytics' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <InteractiveChart 
                    title="Requirement Status Overview" 
                    fullscreenId="analytics-status-chart"
                    onToggleFullscreen={(id) => dispatch({ type: 'SET_CHART_FULLSCREEN', chartId: id })}
                  >
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={analyticsData.statusData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="status" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </InteractiveChart>
                  
                  <InteractiveChart 
                    title="Business Value Distribution" 
                    fullscreenId="analytics-value-chart"
                    onToggleFullscreen={(id) => dispatch({ type: 'SET_CHART_FULLSCREEN', chartId: id })}
                  >
                    <ResponsiveContainer width="100%" height={300}>
                      <ScatterChart data={analyticsData.businessValueData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="cost" name="Cost (£k)" />
                        <YAxis dataKey="businessValue" name="Business Value" />
                        <Tooltip 
                          formatter={(value, name) => [
                            name === 'cost' ? `£${value}k` : value,
                            name === 'cost' ? 'Cost' : 'Business Value'
                          ]}
                        />
                        <Scatter dataKey="businessValue" fill="#10b981" />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </InteractiveChart>
                </div>
              </div>
            )}

            {/* PCD Breakdown View */}
            {state.ui.viewMode === 'pcd' && (
              <PCDBreakdownView
                pcdData={pcdData}
                capabilities={capabilities}
                selectedPCD={state.ui.selectedPCD}
                onSelectPCD={(pcdId) => dispatch({ type: 'SET_SELECTED_PCD', pcdId })}
              />
            )}

            {/* Business Value/Justification View */}
            {state.ui.viewMode === 'justification' && (
              <BusinessValueView
                requirements={requirements}
                onViewRequirement={handleViewRequirement}
              />
            )}

            {/* Maturity Analysis View */}
            {state.ui.viewMode === 'maturity' && (
              <MaturityAnalysisView
                requirements={requirements}
                onViewRequirement={handleViewRequirement}
              />
            )}

            {/* Capabilities View */}
            {state.ui.viewMode === 'capabilities' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6">
                    <div className="mb-4 lg:mb-0">
                      <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                        <Network className="h-6 w-6 mr-3 text-blue-600" />
                        Security Capabilities
                      </h3>
                      <p className="text-gray-600 mt-1">Manage capabilities and their associated requirements and PCDs</p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                      <div className="text-sm text-gray-500">
                        {capabilities.length} capabilities • {requirements.length} total requirements
                      </div>
                      <button
                        onClick={() => dispatch({ type: 'TOGGLE_NEW_CAPABILITY_MODAL' })}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        New Capability
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {capabilities.map((capability) => {
                      const capabilityRequirements = requirements.filter(req => req.capabilityId === capability.id);
                      const totalRequirements = capabilityRequirements.length;
                      const completedRequirements = capabilityRequirements.filter(req => req.status === 'Completed').length;
                      const completionRate = totalRequirements > 0 ? (completedRequirements / totalRequirements) * 100 : 0;
                      
                      return (
                        <div 
                          key={capability.id} 
                          className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-blue-300 transition-all duration-300 cursor-pointer group"
                          onClick={() => handleSelectCapability(capability.id)}
                        >
                          {/* Header */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center mb-2">
                                <h4 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                                  {capability.name}
                                </h4>
                                <ArrowRight className="h-4 w-4 ml-2 text-gray-400 group-hover:text-blue-600 transition-colors flex-shrink-0" />
                              </div>
                              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                {capability.id}
                              </span>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                              capability.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                              capability.status === 'Completed' ? 'bg-green-100 text-green-800' :
                              capability.status === 'Planning' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {capability.status}
                            </div>
                          </div>

                          {/* Description */}
                          <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                            {capability.description}
                          </p>

                          {/* Progress */}
                          <div className="mb-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-700">Progress</span>
                              <span className="text-sm font-bold text-gray-900">{completionRate.toFixed(0)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                              <div 
                                className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500" 
                                style={{ width: `${completionRate}%` }}
                              />
                            </div>
                            <div className="flex justify-between text-xs text-gray-500">
                              <span>{completedRequirements} completed</span>
                              <span>{totalRequirements} total</span>
                            </div>
                          </div>

                          {/* Key Metrics */}
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <div className="flex items-center mb-1">
                                <Star className="h-3 w-3 text-yellow-500 mr-1" />
                                <span className="text-gray-600 text-xs">Business Value</span>
                              </div>
                              <span className="font-semibold text-gray-900">{capability.businessValue}/5.0</span>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <div className="flex items-center mb-1">
                                <DollarSign className="h-3 w-3 text-green-500 mr-1" />
                                <span className="text-gray-600 text-xs">Est. ROI</span>
                              </div>
                              <span className="font-semibold text-gray-900">{capability.estimatedROI}%</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
        
        {/* Company Profile Modal */}
        <Modal
          isOpen={state.ui.showCompanyProfileModal}
          onClose={() => dispatch({ type: 'TOGGLE_COMPANY_PROFILE_MODAL' })}
          title="Company Profile"
          size="xl"
        >
          <CompanyProfileSystem 
            onProfileUpdate={handleProfileUpdate}
            existingProfile={companyProfile}
            embedded={true}
          />
        </Modal>

        {/* Edit/View Requirement Modal */}
        <Modal
          isOpen={state.modal.isOpen && !!state.modal.selectedRequirement}
          onClose={() => dispatch({ type: 'CLOSE_MODAL' })}
          title={state.modal.editMode ? 'Edit Requirement' : 'View Requirement'}
          size={state.modal.editMode ? "xl" : "lg"}
          closeOnBackdropClick={!state.modal.editMode}
        >
          {state.modal.selectedRequirement && (
            state.modal.editMode ? (
              <EditRequirementModal 
                requirement={state.modal.selectedRequirement} 
                onClose={() => dispatch({ type: 'CLOSE_MODAL' })}
                onSave={handleUpdateRequirement}
              />
            ) : (
              <ViewRequirementModal
                requirement={state.modal.selectedRequirement}
                onClose={() => dispatch({ type: 'CLOSE_MODAL' })}
                onEdit={(requirement) => dispatch({ type: 'OPEN_MODAL', requirement, editMode: true })}
              />
            )
          )}
        </Modal>

        {/* New Capability Modal */}
        <Modal
          isOpen={state.ui.showNewCapabilityModal}
          onClose={() => dispatch({ type: 'TOGGLE_NEW_CAPABILITY_MODAL' })}
          title="Create New Capability"
          size="md"
        >
          <NewCapabilityModal 
            onClose={() => dispatch({ type: 'TOGGLE_NEW_CAPABILITY_MODAL' })}
            onSave={handleCreateCapability}
          />
        </Modal>

        {/* CSV Upload Modal */}
        <Modal
          isOpen={state.ui.showUploadModal}
          onClose={() => dispatch({ type: 'TOGGLE_UPLOAD_MODAL' })}
          title="Upload CSV Data"
          size="md"
        >
          <CSVUploadModal 
            onClose={() => dispatch({ type: 'TOGGLE_UPLOAD_MODAL' })}
            onUpload={handleUploadCSV}
          />
        </Modal>

        {/* Purge Confirmation Modal */}
        <Modal
          isOpen={state.ui.showPurgeModal}
          onClose={() => dispatch({ type: 'TOGGLE_PURGE_MODAL' })}
          title="Confirm Data Purge"
          size="sm"
          closeOnBackdropClick={false}
        >
          <PurgeConfirmationModal 
            onClose={() => dispatch({ type: 'TOGGLE_PURGE_MODAL' })}
            onConfirm={handlePurgeData}
          />
        </Modal>
      </div>
    </ErrorBoundary>
  );
};

export default RequirementsDashboard;