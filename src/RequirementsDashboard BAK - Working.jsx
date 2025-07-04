import React, { useState, useEffect, useMemo, useReducer, lazy, Suspense, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, ScatterChart, Scatter } from 'recharts';

// Optimized imports - only what we need
import { 
  Upload, Filter, Search, Download, AlertTriangle, CheckCircle, Clock, FileText, 
  Shield, TrendingUp, Database, Bell, Eye, ArrowRight, ChevronLeft, ChevronRight, 
  BarChart3, Maximize2, Minimize2, Star, Lightbulb, GitBranch, DollarSign, 
  Timer, Gauge, Building2, X, Edit, Users, Target, Network, Lock, Activity, Layers,
  Trash2, Save, Plus, RefreshCw
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
    selectedCapability: null,
    selectedPCD: null
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
    default:
      return state;
  }
};

// Main Dashboard Component
const RequirementsDashboard = () => {
  const [state, dispatch] = useReducer(dashboardReducer, initialState);
  
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

  // Event handlers
  const handleFilterChange = (field, value) => {
    dispatch({ type: 'SET_FILTER', field, value });
  };

  const handleViewRequirement = (requirement) => {
    dispatch({ type: 'OPEN_MODAL', requirement });
  };

  const handleEditRequirement = (requirement) => {
    dispatch({ type: 'OPEN_MODAL', requirement, editMode: true });
  };

  const handleUploadCSV = (csvData) => {
    const success = importFromCSV(csvData);
    if (success) {
      alert(`Successfully imported ${csvData.length} requirements!`);
    } else {
      alert('Failed to import CSV data. Please check the format.');
    }
  };

  const handlePurgeData = async () => {
    const success = await purgeAllData();
    if (success) {
      alert('All data has been purged successfully.');
    } else {
      alert('Failed to purge data.');
    }
  };

  const handleSelectCapability = (capabilityId) => {
    dispatch({ type: 'SET_SELECTED_CAPABILITY', capabilityId });
    dispatch({ type: 'SET_VIEW_MODE', viewMode: 'requirements' });
  };

  const handleCreateCapability = async (newCapability) => {
    const success = await addCapability(newCapability);
    if (success) {
      alert(`Successfully created capability ${newCapability.id}!`);
      return true;
    } else {
      alert('Failed to create capability.');
      return false;
    }
  };

  const handleExportCSV = () => {
    const csvContent = generateCSV(requirements);
    const filename = `requirements_export_${new Date().toISOString().split('T')[0]}.csv`;
    downloadCSV(csvContent, filename);
  };

  // Loading check
  if (loading || capabilitiesLoading || pcdLoading) return <LoadingSpinner />;
  if (error) return <div className="p-8 text-center text-red-600">Error: {error}</div>;

  const Sidebar = () => (
    <div className={`bg-gray-900 text-white transition-all duration-300 ${
      state.ui.sidebarExpanded ? 'w-64' : 'w-16'
    } flex flex-col`}>
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          {state.ui.sidebarExpanded && <h2 className="text-lg font-semibold">OT Dashboard</h2>}
          <button
            onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
            className="p-2 hover:bg-gray-800 rounded"
          >
            {state.ui.sidebarExpanded ? 
              <ChevronLeft className="h-4 w-4" /> : 
              <ChevronRight className="h-4 w-4" />
            }
          </button>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {[
            { id: 'overview', name: 'Overview', icon: TrendingUp },
            { id: 'capabilities', name: 'Capabilities', icon: Network },
            { id: 'requirements', name: 'Requirements', icon: FileText },
            { id: 'pcd', name: 'PCD Breakdown', icon: Building2 },
            { id: 'maturity', name: 'Maturity Analysis', icon: Gauge },
            { id: 'justification', name: 'Business Value', icon: Star },
            { id: 'analytics', name: 'Analytics', icon: BarChart3 }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => dispatch({ type: 'SET_VIEW_MODE', viewMode: item.id })}
              className={`w-full flex items-center px-3 py-2 rounded-lg transition-colors ${
                state.ui.viewMode === item.id
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <item.icon className="h-5 w-5" />
              {state.ui.sidebarExpanded && <span className="ml-3">{item.name}</span>}
            </button>
          ))}
        </div>
      </nav>

      {state.ui.sidebarExpanded && (
        <div className="p-4 border-t border-gray-700">
          <h3 className="text-sm font-medium text-gray-300 mb-2">Data Management</h3>
          <div className="space-y-2">
            <button
              onClick={() => dispatch({ type: 'TOGGLE_UPLOAD_MODAL' })}
              className="w-full flex items-center px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload CSV
            </button>
            <button
              onClick={handleExportCSV}
              className="w-full flex items-center px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </button>
            <button
              onClick={() => dispatch({ type: 'TOGGLE_PURGE_MODAL' })}
              className="w-full flex items-center px-3 py-2 text-sm text-red-400 hover:bg-red-900 hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Purge Data
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const Header = () => (
    <div className="bg-white shadow-sm border-b">
      <div className="px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">OT Requirements Management</h1>
            <div className="flex items-center mt-1 text-sm text-gray-600">
              <Layers className="h-4 w-4 mr-1" />
              Network Segmentation Project
              <span className="mx-2">•</span>
              <Activity className="h-4 w-4 mr-1" />
              {filteredRequirements.length} of {requirements.length} requirements
              <span className="mx-2">•</span>
              <Database className="h-4 w-4 mr-1" />
              Demo data active
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={handleExportCSV}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <Header />
        
        <main className="flex-1 p-6 overflow-y-auto">
          {/* Overview View */}
          {state.ui.viewMode === 'overview' && (
            <div className="space-y-6">
              {/* Regulatory Context Banner */}
              <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-xl p-4 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-16 -mt-16" />
                <div className="relative">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <Shield className="h-5 w-5 mr-2" />
                      <h3 className="text-lg font-semibold">Regulatory Compliance Framework</h3>
                    </div>
                    <div className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded-full">
                      Active Compliance
                    </div>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4 text-xs">
                    <div className="flex items-center space-x-2">
                      <div className="bg-white bg-opacity-20 p-1.5 rounded-lg">
                        <Network className="h-3 w-3" />
                      </div>
                      <div>
                        <div className="font-medium">Ofgem Framework</div>
                        <div className="text-blue-100">Clean power transition by 2030</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="bg-white bg-opacity-20 p-1.5 rounded-lg">
                        <Lock className="h-3 w-3" />
                      </div>
                      <div>
                        <div className="font-medium">NCSC CAF Guidance</div>
                        <div className="text-blue-100">OES compliance mapping</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="bg-white bg-opacity-20 p-1.5 rounded-lg">
                        <Building2 className="h-3 w-3" />
                      </div>
                      <div>
                        <div className="font-medium">Business Justification</div>
                        <div className="text-blue-100">Value & impact analysis</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Widget Grid - All 12 StatCard widgets */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
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

              {/* Quick Actions Section */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Lightbulb className="h-5 w-5 mr-2 text-yellow-500" />
                  Quick Actions
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  <button 
                    onClick={() => dispatch({ type: 'SET_VIEW_MODE', viewMode: 'capabilities' })}
                    className="flex flex-col items-center p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group"
                  >
                    <Network className="h-5 w-5 text-blue-600 mb-1 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-medium text-blue-700">View Capabilities</span>
                  </button>
                  <button 
                    onClick={handleExportCSV}
                    className="flex flex-col items-center p-3 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors group"
                  >
                    <Download className="h-5 w-5 text-orange-600 mb-1 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-medium text-orange-700">Export Data</span>
                  </button>
                  <button 
                    onClick={() => dispatch({ type: 'SET_VIEW_MODE', viewMode: 'analytics' })}
                    className="flex flex-col items-center p-3 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors group"
                  >
                    <BarChart3 className="h-5 w-5 text-orange-600 mb-1 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-medium text-orange-700">View Analytics</span>
                  </button>
                  <button 
                    onClick={() => {
                      dispatch({ type: 'CLEAR_FILTERS' });
                      dispatch({ type: 'SET_SEARCH_TERM', searchTerm: '' });
                      dispatch({ type: 'SET_VIEW_MODE', viewMode: 'requirements' });
                    }}
                    className="flex flex-col items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
                  >
                    <RefreshCw className="h-5 w-5 text-gray-600 mb-1 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-medium text-gray-700">Reset Filters</span>
                  </button>
                </div>
              </div>

              {/* Activity Feed */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-green-600" />
                  Recent Activity
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="bg-green-100 p-1 rounded-full">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">Demo data loaded</p>
                      <p className="text-xs text-gray-500">{requirements.length} requirements generated successfully • Just now</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="bg-blue-100 p-1 rounded-full">
                      <Upload className="h-3 w-3 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">Dashboard refactored</p>
                      <p className="text-xs text-gray-500">Components successfully extracted • 1 minute ago</p>
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
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                      <Network className="h-6 w-6 mr-3 text-blue-600" />
                      OT Security Capabilities
                    </h3>
                    <p className="text-gray-600 mt-1">Manage capabilities and their associated requirements and PCDs</p>
                  </div>
                  <div className="flex items-center space-x-3">
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
                        className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group"
                        onClick={() => handleSelectCapability(capability.id)}
                      >
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                {capability.name}
                              </h4>
                              <ArrowRight className="h-4 w-4 ml-2 text-gray-400 group-hover:text-blue-600 transition-colors" />
                            </div>
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                              {capability.id}
                            </span>
                          </div>
                          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                            capability.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                            capability.status === 'Completed' ? 'bg-green-100 text-green-800' :
                            capability.status === 'Planning' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {capability.status}
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                          {capability.description}
                        </p>

                        {/* Progress */}
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">Progress</span>
                            <span className="text-sm font-bold text-gray-900">{completionRate.toFixed(0)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                              style={{ width: `${completionRate}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>{completedRequirements} completed</span>
                            <span>{totalRequirements} total</span>
                          </div>
                        </div>

                        {/* Key Metrics */}
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <div className="flex items-center mb-1">
                              <Star className="h-3 w-3 text-yellow-500 mr-1" />
                              <span className="text-gray-600">Value:</span>
                            </div>
                            <span className="font-medium">{capability.businessValue}/5.0</span>
                          </div>
                          <div>
                            <div className="flex items-center mb-1">
                              <DollarSign className="h-3 w-3 text-green-500 mr-1" />
                              <span className="text-gray-600">ROI:</span>
                            </div>
                            <span className="font-medium">{capability.estimatedROI}%</span>
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
      
      {/* Modals */}
      {state.modal.isOpen && state.modal.selectedRequirement && (
        <>
          {state.modal.editMode ? (
            <EditRequirementModal 
              requirement={state.modal.selectedRequirement} 
              onClose={() => dispatch({ type: 'CLOSE_MODAL' })}
              onSave={updateRequirement}
            />
          ) : (
            <ViewRequirementModal
              requirement={state.modal.selectedRequirement}
              onClose={() => dispatch({ type: 'CLOSE_MODAL' })}
              onEdit={(requirement) => dispatch({ type: 'OPEN_MODAL', requirement, editMode: true })}
            />
          )}
        </>
      )}

      {/* New Capability Modal */}
      <NewCapabilityModal 
        isOpen={state.ui.showNewCapabilityModal}
        onClose={() => dispatch({ type: 'TOGGLE_NEW_CAPABILITY_MODAL' })}
        onSave={handleCreateCapability}
      />

      {/* CSV Upload Modal */}
      <CSVUploadModal 
        isOpen={state.ui.showUploadModal}
        onClose={() => dispatch({ type: 'TOGGLE_UPLOAD_MODAL' })}
        onUpload={handleUploadCSV}
      />

      {/* Purge Confirmation Modal */}
      <PurgeConfirmationModal 
        isOpen={state.ui.showPurgeModal}
        onClose={() => dispatch({ type: 'TOGGLE_PURGE_MODAL' })}
        onConfirm={handlePurgeData}
      />
    </div>
  );
};

export default RequirementsDashboard;