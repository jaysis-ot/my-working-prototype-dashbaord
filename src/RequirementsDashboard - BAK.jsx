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

// UI Components
import StatCard from './components/ui/StatCard';
import MaturityIndicator from './components/ui/MaturityIndicator';
import LoadingSpinner from './components/ui/LoadingSpinner';
import InteractiveChart from './components/charts/InteractiveChart';

// Modal Components
import EditRequirementModal from './components/modals/EditRequirementModal';

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
  
  const filteredRequirements = useFilteredRequirements(requirements, state.filters, state.searchTerm);
  const analyticsData = useAnalytics(requirements);

  const handleFilterChange = (field, value) => {
    dispatch({ type: 'SET_FILTER', field, value });
  };

  const handleViewRequirement = (requirement) => {
    dispatch({ type: 'OPEN_MODAL', requirement });
  };

  const handleEditRequirement = (requirement) => {
    dispatch({ type: 'OPEN_MODAL', requirement, editMode: true });
  };

  const handleExportCSV = () => {
    const csvContent = generateCSV(requirements);
    const filename = `requirements_export_${new Date().toISOString().split('T')[0]}.csv`;
    downloadCSV(csvContent, filename);
  };

  if (loading || capabilitiesLoading) return <LoadingSpinner />;
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

              {/* Widget Grid */}
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
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">Requirements List</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Business Value</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredRequirements.slice(0, CONSTANTS.TABLE_PAGE_SIZE).map((requirement) => (
                        <tr key={requirement.id} className="hover:bg-gray-50">
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {requirement.id}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-900">
                            <div className="max-w-xs">
                              <div className="font-medium">{requirement.category}</div>
                              <div className="text-xs text-gray-500 truncate">{requirement.description}</div>
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              requirement.status === 'Completed' ? 'bg-green-100 text-green-800' :
                              requirement.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                              requirement.status === 'On Hold' ? 'bg-gray-100 text-gray-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {requirement.status}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Star className="h-4 w-4 text-yellow-500 mr-1" />
                              <span className="text-sm font-medium">{requirement.businessValueScore}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleEditRequirement(requirement)}
                              className="text-blue-600 hover:text-blue-900 mr-3"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleViewRequirement(requirement)}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {filteredRequirements.length > CONSTANTS.TABLE_PAGE_SIZE && (
                  <div className="bg-gray-50 px-6 py-3 text-center">
                    <p className="text-sm text-gray-500">
                      Showing {CONSTANTS.TABLE_PAGE_SIZE} of {filteredRequirements.length} requirements
                    </p>
                  </div>
                )}
              </div>
            </div>
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

          {/* Capabilities View */}
          {state.ui.viewMode === 'capabilities' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Network className="h-5 w-5 mr-2 text-blue-600" />
                  OT Security Capabilities
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {capabilities.map((capability) => (
                    <div 
                      key={capability.id} 
                      className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-2">{capability.name}</h4>
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

                      <p className="text-sm text-gray-600 mb-4">{capability.description}</p>

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
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
      
      {/* Modals */}
      {state.modal.isOpen && state.modal.selectedRequirement && state.modal.editMode && (
        <EditRequirementModal 
          requirement={state.modal.selectedRequirement} 
          onClose={() => dispatch({ type: 'CLOSE_MODAL' })}
          onSave={updateRequirement}
        />
      )}
    </div>
  );
};

export default RequirementsDashboard;