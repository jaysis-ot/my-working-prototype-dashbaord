// src/components/views/RequirementsView.jsx
import React, { useState, useMemo } from 'react';
import { 
  Filter, Search, Download, Upload, Eye, Edit, Trash2, X,
  FileText, CheckCircle, Clock, AlertTriangle, Star, Building2,
  Settings, ChevronDown, MoreVertical, SortAsc, SortDesc,
  Plus, RefreshCw, BarChart3, Users, Target, Network, Lock, Activity
} from 'lucide-react';

/**
 * Requirements View Component
 * 
 * Comprehensive table view for managing security requirements with advanced
 * filtering, searching, sorting, pagination, and modal integration.
 */
const RequirementsView = ({
  state,
  dispatch,
  currentTheme,
  companyProfile,
  requirements = [],
  capabilities = [],
  filteredRequirements = [],
  onFilterChange,
  onViewRequirement,
  onEditRequirement,
  onExportCSV,
  handleFilterChange
}) => {

  // Local state
  const [showFilters, setShowFilters] = useState(false);
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [sortField, setSortField] = useState('id');
  const [sortDirection, setSortDirection] = useState('asc');
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [bulkAction, setBulkAction] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Enhanced data processing function
  const processRequirementData = (requirement) => {
    return {
      // Core identification
      id: requirement.id,
      category: requirement.category || requirement.description?.split('.')[0] || 'General',
      description: requirement.description,
      
      // Progress and status
      status: requirement.status || 'Not Started',
      progressStatus: requirement.progressStatus || requirement.status || 'Not Started',
      progress: requirement.progress || 0,
      
      // Capability assignment
      capabilityId: requirement.capabilityId || requirement.capability,
      
      // Business value and priority
      businessValueScore: requirement.businessValueScore || requirement.businessValue || 0,
      roiProjection: requirement.roiProjection || requirement.estimatedROI || 0,
      priority: requirement.priority || 'Medium',
      
      // Maturity assessment
      maturityLevel: requirement.maturityLevel || {
        level: requirement.maturity || 'Initial',
        score: requirement.maturityScore || 1
      },
      
      // Applicability and compliance
      applicability: requirement.applicability || {
        type: requirement.applicabilityType || 'Applicable',
        justification: requirement.applicabilityJustification || ''
      },
      
      // Classification
      area: requirement.area || 'System',
      type: requirement.type || 'Functional',
      
      // Assignment and timeline
      assignee: requirement.assignee || requirement.owner || '',
      dueDate: requirement.dueDate || requirement.targetDate || null,
      
      // Financial
      costEstimate: requirement.costEstimate || requirement.cost || 0,
      
      // Additional metadata
      tags: requirement.tags || [],
      notes: requirement.notes || '',
      evidence: requirement.evidence || '',
      lastReviewed: requirement.lastReviewed || null,
      nextReview: requirement.nextReview || null
    };
  };

  // Progress status constants
  const PROGRESS_STATUSES = {
    'Not Started': { color: '#ef4444', label: 'Not Started' },
    'Planning': { color: '#3b82f6', label: 'Planning' },
    'In Progress': { color: '#f59e0b', label: 'In Progress' },
    'Under Review': { color: '#8b5cf6', label: 'Under Review' },
    'Testing': { color: '#06b6d4', label: 'Testing' },
    'Completed': { color: '#10b981', label: 'Completed' },
    'On Hold': { color: '#6b7280', label: 'On Hold' },
    'Cancelled': { color: '#ef4444', label: 'Cancelled' }
  };

  // Process requirements data
  const processedRequirements = useMemo(() => {
    return requirements.map(processRequirementData);
  }, [requirements]);

  const processedFilteredRequirements = useMemo(() => {
    return filteredRequirements.map(processRequirementData);
  }, [filteredRequirements]);

  // Available columns configuration
  const availableColumns = [
    { key: 'id', label: 'ID', sortable: true, visible: state.columnVisibility?.id !== false, width: 'w-32' },
    { key: 'description', label: 'Description', sortable: true, visible: state.columnVisibility?.description !== false, width: 'min-w-64' },
    { key: 'capability', label: 'Capability', sortable: true, visible: state.columnVisibility?.capability !== false, width: 'w-40' },
    { key: 'status', label: 'Status', sortable: true, visible: state.columnVisibility?.status !== false, width: 'w-32' },
    { key: 'progressStatus', label: 'Progress Status', sortable: true, visible: state.columnVisibility?.progressStatus !== false, width: 'w-48' },
    { key: 'priority', label: 'Priority', sortable: true, visible: state.columnVisibility?.priority === true, width: 'w-24' },
    { key: 'applicability', label: 'Applicability', sortable: true, visible: state.columnVisibility?.applicability !== false, width: 'w-32' },
    { key: 'businessValue', label: 'Business Value', sortable: true, visible: state.columnVisibility?.businessValue !== false, width: 'w-40' },
    { key: 'maturity', label: 'Maturity', sortable: true, visible: state.columnVisibility?.maturity !== false, width: 'w-40' },
    { key: 'area', label: 'Area', sortable: true, visible: state.columnVisibility?.area === true, width: 'w-32' },
    { key: 'type', label: 'Type', sortable: true, visible: state.columnVisibility?.type === true, width: 'w-32' },
    { key: 'assignee', label: 'Assignee', sortable: true, visible: state.columnVisibility?.assignee === true, width: 'w-32' },
    { key: 'dueDate', label: 'Due Date', sortable: true, visible: state.columnVisibility?.dueDate === true, width: 'w-32' },
    { key: 'actions', label: 'Actions', sortable: false, visible: true, width: 'w-24' }
  ];

  const visibleColumns = availableColumns.filter(col => col.visible);

  // Sorting logic
  const sortedRequirements = useMemo(() => {
    return [...processedFilteredRequirements].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      // Handle special cases for complex fields
      if (sortField === 'businessValue' || sortField === 'businessValueScore') {
        aValue = a.businessValueScore || 0;
        bValue = b.businessValueScore || 0;
      } else if (sortField === 'maturity') {
        aValue = a.maturityLevel?.score || 0;
        bValue = b.maturityLevel?.score || 0;
      } else if (sortField === 'capability') {
        const capA = capabilities.find(c => c.id === a.capabilityId);
        const capB = capabilities.find(c => c.id === b.capabilityId);
        aValue = capA ? capA.name : '';
        bValue = capB ? capB.name : '';
      } else if (sortField === 'applicability') {
        aValue = a.applicability?.type || '';
        bValue = b.applicability?.type || '';
      }

      // Handle string comparisons
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [processedFilteredRequirements, sortField, sortDirection, capabilities]);

  // Pagination logic
  const totalPages = Math.ceil(sortedRequirements.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedRequirements = sortedRequirements.slice(startIndex, endIndex);

  // Event handlers
  const handleSearchChange = (e) => {
    dispatch({ type: 'SET_SEARCH_TERM', searchTerm: e.target.value });
    setCurrentPage(1);
  };

  const handleFilterUpdate = (field, value) => {
    if (onFilterChange) {
      onFilterChange(field, value);
    }
    if (handleFilterChange) {
      handleFilterChange(field, value);
    }
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    dispatch({ type: 'CLEAR_FILTERS' });
    dispatch({ type: 'CLEAR_SEARCH' });
    setCurrentPage(1);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const handleRowSelect = (requirementId) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(requirementId)) {
      newSelected.delete(requirementId);
    } else {
      newSelected.add(requirementId);
    }
    setSelectedRows(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedRows.size === paginatedRequirements.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(paginatedRequirements.map(r => r.id)));
    }
  };

  const handleViewClick = (requirement, e) => {
    e.stopPropagation();
    if (onViewRequirement) {
      onViewRequirement(requirement);
    }
  };

  const handleEditClick = (requirement, e) => {
    e.stopPropagation();
    if (onEditRequirement) {
      onEditRequirement(requirement);
    }
  };

  const handleRowClick = (requirement) => {
    if (onViewRequirement) {
      onViewRequirement(requirement);
    }
  };

  const handleColumnToggle = (columnKey) => {
    dispatch({ type: 'TOGGLE_COLUMN_VISIBILITY', column: columnKey });
  };

  const handleBulkAction = () => {
    const selectedRequirements = processedRequirements.filter(req => selectedRows.has(req.id));
    
    switch (bulkAction) {
      case 'delete':
        console.log('Bulk delete:', selectedRequirements);
        break;
      case 'edit':
        console.log('Bulk edit:', selectedRequirements);
        break;
      case 'export':
        if (onExportCSV) {
          onExportCSV(selectedRequirements);
        }
        break;
      case 'assignCapability':
        console.log('Bulk assign capability:', selectedRequirements);
        break;
      case 'updateStatus':
        console.log('Bulk update status:', selectedRequirements);
        break;
      default:
        break;
    }
    
    setSelectedRows(new Set());
    setBulkAction('');
  };

  // Styling functions
  const getProgressStatusStyle = (progressStatus) => {
    const status = PROGRESS_STATUSES[progressStatus || 'Not Started'];
    return {
      backgroundColor: `${status?.color}20`,
      color: status?.color || '#ef4444'
    };
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Completed': { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      'In Progress': { bg: 'bg-blue-100', text: 'text-blue-800', icon: Clock },
      'Not Started': { bg: 'bg-gray-100', text: 'text-gray-800', icon: AlertTriangle },
      'On Hold': { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock },
      'Under Review': { bg: 'bg-purple-100', text: 'text-purple-800', icon: Eye }
    };

    const config = statusConfig[status] || statusConfig['Not Started'];
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <Icon className="h-3 w-3 mr-1" />
        {status || 'Not Started'}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      'Critical': { bg: 'bg-red-100', text: 'text-red-800' },
      'High': { bg: 'bg-orange-100', text: 'text-orange-800' },
      'Medium': { bg: 'bg-yellow-100', text: 'text-yellow-800' },
      'Low': { bg: 'bg-gray-100', text: 'text-gray-800' }
    };

    const config = priorityConfig[priority] || priorityConfig['Medium'];

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {priority || 'Medium'}
      </span>
    );
  };

  const getApplicabilityBadge = (applicability) => {
    if (!applicability) return <span className="text-gray-400">-</span>;
    
    const colorMap = {
      'Essential': 'bg-red-100 text-red-800',
      'Recommended': 'bg-blue-100 text-blue-800',
      'Applicable': 'bg-blue-100 text-blue-800',
      'Optional': 'bg-gray-100 text-gray-800',
      'Future': 'bg-yellow-100 text-yellow-800',
      'Conditional': 'bg-orange-100 text-orange-800',
      'Not Applicable': 'bg-gray-100 text-gray-800'
    };

    const type = typeof applicability === 'object' ? applicability.type : applicability;

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colorMap[type] || 'bg-gray-100 text-gray-800'}`}>
        {type}
      </span>
    );
  };

  const getBusinessValueStyle = (score) => {
    if (score >= 4) return 'bg-green-100 text-green-800';
    if (score >= 3) return 'bg-blue-100 text-blue-800';
    if (score >= 2) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getCapabilityName = (capabilityId) => {
    if (!capabilityId) return <span className="text-gray-400 italic">Unassigned</span>;
    const capability = capabilities.find(c => c.id === capabilityId || c.name === capabilityId);
    return capability ? (
      <div className="flex items-center">
        <span className="text-sm font-medium text-blue-600">{capabilityId}</span>
        {capability.name && capability.name !== capabilityId && (
          <div className="ml-2 text-xs text-gray-500 truncate max-w-20">
            {capability.name}
          </div>
        )}
      </div>
    ) : capabilityId;
  };

  // Filter options
  const statusOptions = ['All', 'Not Started', 'In Progress', 'Completed', 'On Hold', 'Under Review'];
  const priorityOptions = ['All', 'Critical', 'High', 'Medium', 'Low'];
  const applicabilityOptions = ['All', 'Essential', 'Recommended', 'Applicable', 'Optional', 'Future', 'Conditional', 'Not Applicable'];
  const areaOptions = ['All', 'Business', 'User', 'System', 'Infrastructure', 'Network', 'Security', 'Compliance', 'Operational'];
  const typeOptions = ['All', 'Functional', 'Non-Functional', 'Control'];

  // Calculate active filters count
  const activeFiltersCount = Object.values(state.filters || {}).filter(f => f && f !== 'all').length;

  return (
    <div className="space-y-6">
      {/* Data Overview Summary Card */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-lg font-semibold text-blue-900">Requirements Data Overview</h4>
            <p className="text-blue-700 text-sm">Comprehensive security requirements management</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              Data Source: {processedRequirements.length > 0 ? 'Loaded' : 'Empty'}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="text-blue-600 hover:text-blue-800 transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        {/* Enhanced Statistics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="bg-white rounded-lg p-3 border border-blue-100">
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-blue-900">{processedRequirements.length}</div>
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-xs text-blue-700 mt-1">Total Requirements</div>
          </div>
          
          <div className="bg-white rounded-lg p-3 border border-green-100">
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-green-900">
                {processedRequirements.filter(r => r.status === 'Completed').length}
              </div>
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div className="text-xs text-green-700 mt-1">Completed</div>
          </div>
          
          <div className="bg-white rounded-lg p-3 border border-yellow-100">
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-yellow-900">
                {processedRequirements.filter(r => r.status === 'In Progress').length}
              </div>
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div className="text-xs text-yellow-700 mt-1">In Progress</div>
          </div>
          
          <div className="bg-white rounded-lg p-3 border border-orange-100">
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-orange-900">
                {(processedRequirements.reduce((sum, r) => sum + (r.businessValueScore || 0), 0) / processedRequirements.length || 0).toFixed(1)}
              </div>
              <Star className="h-5 w-5 text-orange-600" />
            </div>
            <div className="text-xs text-orange-700 mt-1">Avg Business Value</div>
          </div>
          
          <div className="bg-white rounded-lg p-3 border border-purple-100">
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-purple-900">
                {processedRequirements.filter(r => !r.capabilityId).length}
              </div>
              <AlertTriangle className="h-5 w-5 text-purple-600" />
            </div>
            <div className="text-xs text-purple-700 mt-1">Unassigned</div>
          </div>
          
          <div className="bg-white rounded-lg p-3 border border-indigo-100">
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-indigo-900">
                £{(processedRequirements.reduce((sum, r) => sum + (r.costEstimate || 0), 0) / 1000000).toFixed(1)}M
              </div>
              <BarChart3 className="h-5 w-5 text-indigo-600" />
            </div>
            <div className="text-xs text-indigo-700 mt-1">Est. Investment</div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-900">Overall Completion</span>
            <span className="text-sm text-blue-700">
              {processedRequirements.length > 0 
                ? Math.round((processedRequirements.filter(r => r.status === 'Completed').length / processedRequirements.length) * 100)
                : 0
              }%
            </span>
          </div>
          <div className="w-full bg-blue-100 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-500" 
              style={{ 
                width: `${processedRequirements.length > 0 
                  ? (processedRequirements.filter(r => r.status === 'Completed').length / processedRequirements.length) * 100
                  : 0
                }%` 
              }}
            />
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6">
          <div className="mb-4 lg:mb-0">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center">
              <FileText className="h-6 w-6 mr-3 text-blue-600" />
              Security Requirements
            </h3>
            <p className="text-gray-600 mt-1">
              Manage and track security requirements across your organization
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="text-sm text-gray-500">
              Showing {paginatedRequirements.length} of {processedFilteredRequirements.length} requirements
              {processedFilteredRequirements.length !== processedRequirements.length && ` (${processedRequirements.length} total)`}
              {state.searchTerm && ` matching "${state.searchTerm}"`}
              {activeFiltersCount > 0 && ` with ${activeFiltersCount} filter${activeFiltersCount > 1 ? 's' : ''}`}
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => dispatch({ type: 'TOGGLE_UPLOAD_MODAL' })}
                className="flex items-center px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
              >
                <Upload className="h-4 w-4 mr-2" />
                Import
              </button>
              <button
                onClick={() => onExportCSV && onExportCSV()}
                className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Search and Controls */}
        <div className="flex flex-col lg:flex-row gap-4 mb-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search requirements, descriptions, justifications..."
                value={state.searchTerm || ''}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {state.searchTerm && (
                <button
                  onClick={() => dispatch({ type: 'CLEAR_SEARCH' })}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center px-4 py-2 rounded-lg border transition-colors ${
                showFilters || activeFiltersCount > 0
                  ? 'bg-blue-50 border-blue-200 text-blue-700' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {activeFiltersCount > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            <div className="relative">
              <button
                onClick={() => setShowColumnSelector(!showColumnSelector)}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Settings className="h-4 w-4 mr-2" />
                Columns
              </button>
              
              {showColumnSelector && (
                <div className="absolute right-0 top-12 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  <div className="p-3 border-b border-gray-200">
                    <h4 className="font-medium text-gray-900">Visible Columns</h4>
                  </div>
                  <div className="p-3 max-h-64 overflow-y-auto">
                    {availableColumns.filter(col => col.key !== 'actions').map(column => (
                      <label key={column.key} className="flex items-center space-x-3 py-2">
                        <input
                          type="checkbox"
                          checked={column.visible}
                          onChange={() => handleColumnToggle(column.key)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{column.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-blue-900">Filter Requirements</h4>
              {activeFiltersCount > 0 && (
                <button
                  onClick={handleClearFilters}
                  className="flex items-center text-xs text-blue-700 hover:text-blue-900"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Clear All ({activeFiltersCount})
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
              <select
                value={state.filters?.status || ''}
                onChange={(e) => handleFilterUpdate('status', e.target.value === 'all' ? '' : e.target.value)}
                className="text-sm border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500"
              >
                {statusOptions.map(option => (
                  <option key={option} value={option === 'All' ? 'all' : option}>{option}</option>
                ))}
              </select>

              <select
                value={state.filters?.priority || ''}
                onChange={(e) => handleFilterUpdate('priority', e.target.value === 'all' ? '' : e.target.value)}
                className="text-sm border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500"
              >
                {priorityOptions.map(option => (
                  <option key={option} value={option === 'All' ? 'all' : option}>{option}</option>
                ))}
              </select>

              <select
                value={state.filters?.applicability || ''}
                onChange={(e) => handleFilterUpdate('applicability', e.target.value === 'all' ? '' : e.target.value)}
                className="text-sm border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500"
              >
                {applicabilityOptions.map(option => (
                  <option key={option} value={option === 'All' ? 'all' : option}>{option}</option>
                ))}
              </select>

              <select
                value={state.filters?.capability || ''}
                onChange={(e) => handleFilterUpdate('capability', e.target.value === 'all' ? '' : e.target.value)}
                className="text-sm border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Capabilities</option>
                <option value="">Unassigned</option>
                {capabilities.map(capability => (
                  <option key={capability.id} value={capability.id}>
                    {capability.id} - {capability.name}
                  </option>
                ))}
              </select>

              <select
                value={state.filters?.area || ''}
                onChange={(e) => handleFilterUpdate('area', e.target.value === 'all' ? '' : e.target.value)}
                className="text-sm border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500"
              >
                {areaOptions.map(option => (
                  <option key={option} value={option === 'All' ? 'all' : option}>{option}</option>
                ))}
              </select>

              <select
                value={state.filters?.type || ''}
                onChange={(e) => handleFilterUpdate('type', e.target.value === 'all' ? '' : e.target.value)}
                className="text-sm border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500"
              >
                {typeOptions.map(option => (
                  <option key={option} value={option === 'All' ? 'all' : option}>{option}</option>
                ))}
              </select>

              <select
                value={state.filters?.maturityLevel || ''}
                onChange={(e) => handleFilterUpdate('maturityLevel', e.target.value === 'all' ? '' : e.target.value)}
                className="text-sm border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Maturity</option>
                <option value="Initial">Initial</option>
                <option value="Developing">Developing</option>
                <option value="Defined">Defined</option>
                <option value="Managed">Managed</option>
                <option value="Optimizing">Optimizing</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3">
                  <input
                    type="checkbox"
                    checked={selectedRows.size === paginatedRequirements.length && paginatedRequirements.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>

                {visibleColumns.map(column => (
                  <th key={column.key} className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${column.width}`}>
                    {column.sortable ? (
                      <button
                        onClick={() => handleSort(column.key)}
                        className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
                      >
                        <span>{column.label}</span>
                        {sortField === column.key && (
                          sortDirection === 'asc' ? 
                            <SortAsc className="h-3 w-3" /> : 
                            <SortDesc className="h-3 w-3" />
                        )}
                      </button>
                    ) : (
                      column.label
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedRequirements.map((requirement) => (
                <tr 
                  key={requirement.id}
                  onClick={() => handleRowClick(requirement)}
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedRows.has(requirement.id)}
                      onChange={() => handleRowSelect(requirement.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>

                  {visibleColumns.map(column => (
                    <td key={column.key} className="px-4 py-4 whitespace-nowrap">
                      {column.key === 'id' && (
                        <div className="text-sm font-medium text-gray-900">{requirement.id}</div>
                      )}
                      
                      {column.key === 'description' && (
                        <div className="max-w-xs">
                          <div className="text-sm font-medium text-gray-900 truncate" title={requirement.description}>
                            {requirement.category || requirement.description}
                          </div>
                          {requirement.category && requirement.description !== requirement.category && (
                            <div className="text-xs text-gray-500 truncate" title={requirement.description}>
                              {requirement.description}
                            </div>
                          )}
                        </div>
                      )}

                      {column.key === 'capability' && (
                        <div className="text-sm text-gray-900">
                          {getCapabilityName(requirement.capabilityId)}
                        </div>
                      )}

                      {column.key === 'status' && getStatusBadge(requirement.status)}

                      {column.key === 'progressStatus' && (
                        <div className="flex items-center space-x-2">
                          <div 
                            className="flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium"
                            style={getProgressStatusStyle(requirement.progressStatus)}
                          >
                            <div 
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: getProgressStatusStyle(requirement.progressStatus).color }}
                            />
                            <span>{requirement.progressStatus || 'Not Started'}</span>
                          </div>
                          {requirement.progress > 0 && (
                            <span className="text-xs text-gray-500">
                              {requirement.progress}%
                            </span>
                          )}
                        </div>
                      )}

                      {column.key === 'priority' && getPriorityBadge(requirement.priority)}

                      {column.key === 'applicability' && getApplicabilityBadge(requirement.applicability)}

                      {column.key === 'businessValue' && (
                        <div className="flex items-center space-x-2">
                          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getBusinessValueStyle(requirement.businessValueScore || 0)}`}>
                            <Star className="h-3 w-3" />
                            <span>{requirement.businessValueScore || 0}/5</span>
                          </div>
                          {requirement.roiProjection > 0 && (
                            <div className="text-xs text-gray-500">
                              ROI: {requirement.roiProjection}%
                            </div>
                          )}
                        </div>
                      )}

                      {column.key === 'maturity' && (
                        <div className="text-sm text-gray-900">
                          {requirement.maturityLevel ? (
                            <div className="flex items-center space-x-1">
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                {requirement.maturityLevel.level}
                              </span>
                              <span className="text-xs text-gray-500">
                                {requirement.maturityLevel.score}/5
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-400">Not assessed</span>
                          )}
                        </div>
                      )}

                      {column.key === 'area' && (
                        <div className="text-sm text-gray-900">{requirement.area || '-'}</div>
                      )}

                      {column.key === 'type' && (
                        <div className="text-sm text-gray-900">{requirement.type || '-'}</div>
                      )}

                      {column.key === 'assignee' && (
                        <div className="text-sm text-gray-900">{requirement.assignee || '-'}</div>
                      )}

                      {column.key === 'dueDate' && (
                        <div className="text-sm text-gray-900">
                          {requirement.dueDate ? new Date(requirement.dueDate).toLocaleDateString() : '-'}
                        </div>
                      )}
                      
                      {column.key === 'actions' && (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={(e) => handleViewClick(requirement, e)}
                            className="text-blue-600 hover:text-blue-900 transition-colors"
                            title="View Requirement"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => handleEditClick(requirement, e)}
                            className="text-gray-600 hover:text-gray-900 transition-colors"
                            title="Edit Requirement"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-700">
                Showing {startIndex + 1} to {Math.min(endIndex, sortedRequirements.length)} of {sortedRequirements.length} requirements
              </div>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="text-sm border border-gray-300 rounded px-2 py-1"
              >
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
                <option value={100}>100 per page</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-1 text-sm border rounded ${
                      currentPage === page 
                        ? 'bg-blue-600 text-white border-blue-600' 
                        : 'border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {processedFilteredRequirements.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No requirements found
            </h3>
            <p className="text-gray-600 mb-4">
              {processedRequirements.length === 0 
                ? 'Get started by importing requirements or creating new ones.'
                : state.searchTerm || activeFiltersCount > 0
                  ? 'No requirements match your criteria.'
                  : 'Try adjusting your search or filter criteria.'
              }
            </p>
            {(state.searchTerm || activeFiltersCount > 0) && (
              <div className="space-x-2">
                {state.searchTerm && (
                  <button
                    onClick={() => dispatch({ type: 'CLEAR_SEARCH' })}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Clear search
                  </button>
                )}
                {activeFiltersCount > 0 && (
                  <button
                    onClick={handleClearFilters}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            )}
            
            {/* Quick Start Actions */}
            {processedRequirements.length === 0 && (
              <div className="mt-6 flex justify-center space-x-3">
                <button
                  onClick={() => dispatch({ type: 'TOGGLE_UPLOAD_MODAL' })}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Import CSV
                </button>
                <button
                  onClick={() => {
                    dispatch({ type: 'SET_VIEW_MODE', viewMode: 'capabilities' });
                  }}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Capability
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Selected Items Actions */}
      {selectedRows.size > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white border border-gray-200 rounded-lg shadow-lg px-4 py-3 z-50">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {selectedRows.size} requirement{selectedRows.size !== 1 ? 's' : ''} selected
            </span>
            <div className="flex space-x-2">
              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                className="px-3 py-1 text-sm border border-gray-300 rounded"
              >
                <option value="">Choose action...</option>
                <option value="edit">Bulk Edit</option>
                <option value="export">Export Selected</option>
                <option value="assignCapability">Assign Capability</option>
                <option value="updateStatus">Update Status</option>
                <option value="delete">Delete</option>
              </select>
              <button 
                onClick={handleBulkAction}
                disabled={!bulkAction}
                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Apply
              </button>
              <button 
                onClick={() => setSelectedRows(new Set())}
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequirementsView;