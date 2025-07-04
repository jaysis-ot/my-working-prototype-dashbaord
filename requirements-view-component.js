// src/components/views/RequirementsView.jsx
import React, { useState } from 'react';
import { 
  Filter, Search, Download, Upload, Eye, Edit, Trash2, X,
  FileText, CheckCircle, Clock, AlertTriangle, Star, Building2,
  Settings, ChevronDown, MoreVertical, SortAsc, SortDesc
} from 'lucide-react';

/**
 * Requirements View Component
 * 
 * Comprehensive table view for managing security requirements with advanced
 * filtering, searching, sorting, and column management capabilities.
 * 
 * Features:
 * - Advanced filtering by multiple criteria
 * - Real-time search functionality
 * - Column visibility management
 * - Sorting capabilities
 * - Bulk actions
 * - Export/import functionality
 * - Responsive table design
 * - Detailed requirement actions
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

  const [showFilters, setShowFilters] = useState(false);
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [sortField, setSortField] = useState('id');
  const [sortDirection, setSortDirection] = useState('asc');
  const [selectedRows, setSelectedRows] = useState(new Set());

  // Handle search input
  const handleSearchChange = (e) => {
    dispatch({ type: 'SET_SEARCH_TERM', searchTerm: e.target.value });
  };

  // Handle filter changes
  const handleFilterUpdate = (field, value) => {
    if (onFilterChange) {
      onFilterChange(field, value);
    }
  };

  // Clear all filters
  const handleClearFilters = () => {
    dispatch({ type: 'CLEAR_FILTERS' });
    dispatch({ type: 'CLEAR_SEARCH' });
  };

  // Handle sorting
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Get sorted requirements
  const getSortedRequirements = () => {
    return [...filteredRequirements].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      // Handle special cases
      if (sortField === 'businessValueScore' || sortField === 'maturityLevel') {
        aValue = sortField === 'maturityLevel' ? (a.maturityLevel?.score || 0) : (aValue || 0);
        bValue = sortField === 'maturityLevel' ? (b.maturityLevel?.score || 0) : (bValue || 0);
      }

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  };

  // Handle row selection
  const handleRowSelect = (requirementId) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(requirementId)) {
      newSelected.delete(requirementId);
    } else {
      newSelected.add(requirementId);
    }
    setSelectedRows(newSelected);
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedRows.size === filteredRequirements.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(filteredRequirements.map(r => r.id)));
    }
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      'Completed': { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      'In Progress': { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock },
      'Not Started': { bg: 'bg-gray-100', text: 'text-gray-800', icon: AlertTriangle }
    };

    const config = statusConfig[status] || statusConfig['Not Started'];
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <Icon className="h-3 w-3 mr-1" />
        {status}
      </span>
    );
  };

  // Get applicability badge
  const getApplicabilityBadge = (applicability) => {
    if (!applicability) return <span className="text-gray-400">-</span>;
    
    const colorMap = {
      'Essential': 'bg-red-100 text-red-800',
      'Recommended': 'bg-blue-100 text-blue-800',
      'Optional': 'bg-gray-100 text-gray-800'
    };

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colorMap[applicability.type] || 'bg-gray-100 text-gray-800'}`}>
        {applicability.type}
      </span>
    );
  };

  // Get capability name
  const getCapabilityName = (capabilityId) => {
    if (!capabilityId) return <span className="text-gray-400 italic">Unassigned</span>;
    const capability = capabilities.find(c => c.id === capabilityId);
    return capability ? capability.name : capabilityId;
  };

  // Column configuration
  const columns = [
    { key: 'id', label: 'ID', sortable: true, visible: state.columnVisibility?.id !== false },
    { key: 'description', label: 'Description', sortable: true, visible: state.columnVisibility?.description !== false },
    { key: 'capability', label: 'Capability', sortable: false, visible: state.columnVisibility?.capability !== false },
    { key: 'status', label: 'Status', sortable: true, visible: state.columnVisibility?.status !== false },
    { key: 'businessValueScore', label: 'Business Value', sortable: true, visible: state.columnVisibility?.businessValue !== false },
    { key: 'maturityLevel', label: 'Maturity', sortable: true, visible: state.columnVisibility?.maturity !== false },
    { key: 'applicability', label: 'Applicability', sortable: false, visible: state.columnVisibility?.applicability !== false },
    { key: 'area', label: 'Area', sortable: true, visible: state.columnVisibility?.area === true },
    { key: 'type', label: 'Type', sortable: true, visible: state.columnVisibility?.type === true },
    { key: 'priority', label: 'Priority', sortable: true, visible: state.columnVisibility?.priority === true },
    { key: 'actions', label: 'Actions', sortable: false, visible: true }
  ];

  const visibleColumns = columns.filter(col => col.visible);
  const sortedRequirements = getSortedRequirements();

  return (
    <div className="space-y-6">
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
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
            <div className="text-sm text-gray-500">
              Showing {filteredRequirements.length} of {requirements.length} requirements
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => dispatch({ type: 'TOGGLE_UPLOAD_MODAL' })}
                className="flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors"
              >
                <Upload className="h-4 w-4 mr-2" />
                Import
              </button>
              <button
                onClick={onExportCSV}
                className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Search and Filter Controls */}
        <div className="flex flex-col lg:flex-row gap-4 mb-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search requirements..."
                value={state.searchTerm || ''}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center px-3 py-2 border rounded-lg text-sm transition-colors ${
              showFilters ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>

          {/* Column Settings */}
          <div className="relative">
            <button
              onClick={() => setShowColumnSelector(!showColumnSelector)}
              className="flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors"
            >
              <Settings className="h-4 w-4 mr-2" />
              Columns
            </button>
            
            {showColumnSelector && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <div className="p-3">
                  <div className="text-sm font-medium text-gray-900 mb-2">Show Columns</div>
                  {columns.filter(col => col.key !== 'actions').map(column => (
                    <label key={column.key} className="flex items-center py-1">
                      <input
                        type="checkbox"
                        checked={column.visible}
                        onChange={() => dispatch({ type: 'TOGGLE_COLUMN_VISIBILITY', column: column.key })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{column.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="border-t border-gray-200 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={state.filters?.status || ''}
                  onChange={(e) => handleFilterUpdate('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Status</option>
                  <option value="Completed">Completed</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Not Started">Not Started</option>
                </select>
              </div>

              {/* Capability Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Capability</label>
                <select
                  value={state.filters?.capability || ''}
                  onChange={(e) => handleFilterUpdate('capability', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Capabilities</option>
                  <option value="">Unassigned</option>
                  {capabilities.map(capability => (
                    <option key={capability.id} value={capability.id}>
                      {capability.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Applicability Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Applicability</label>
                <select
                  value={state.filters?.applicability || ''}
                  onChange={(e) => handleFilterUpdate('applicability', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Types</option>
                  <option value="Essential">Essential</option>
                  <option value="Recommended">Recommended</option>
                  <option value="Optional">Optional</option>
                </select>
              </div>

              {/* Area Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Area</label>
                <select
                  value={state.filters?.area || ''}
                  onChange={(e) => handleFilterUpdate('area', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Areas</option>
                  <option value="Network">Network</option>
                  <option value="Security">Security</option>
                  <option value="Compliance">Compliance</option>
                  <option value="Operational">Operational</option>
                </select>
              </div>
            </div>

            {/* Clear Filters */}
            <div className="mt-4 flex justify-between items-center">
              <button
                onClick={handleClearFilters}
                className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                Clear all filters
              </button>
              <div className="text-sm text-gray-500">
                {Object.values(state.filters || {}).filter(v => v).length} active filters
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {/* Select All Checkbox */}
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedRows.size === filteredRequirements.length && filteredRequirements.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                
                {/* Column Headers */}
                {visibleColumns.map(column => (
                  <th
                    key={column.key}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
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
              {sortedRequirements.map((requirement) => (
                <tr 
                  key={requirement.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  {/* Row Checkbox */}
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedRows.has(requirement.id)}
                      onChange={() => handleRowSelect(requirement.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>

                  {/* Data Cells */}
                  {visibleColumns.map(column => (
                    <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                      {column.key === 'id' && (
                        <div className="text-sm font-mono text-gray-900">{requirement.id}</div>
                      )}
                      
                      {column.key === 'description' && (
                        <div className="max-w-xs">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {requirement.description}
                          </div>
                        </div>
                      )}
                      
                      {column.key === 'capability' && (
                        <div className="text-sm text-gray-900">
                          {getCapabilityName(requirement.capabilityId)}
                        </div>
                      )}
                      
                      {column.key === 'status' && getStatusBadge(requirement.status)}
                      
                      {column.key === 'businessValueScore' && (
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 mr-1" />
                          <span className="text-sm text-gray-900">
                            {requirement.businessValueScore || 0}/5
                          </span>
                        </div>
                      )}
                      
                      {column.key === 'maturityLevel' && (
                        <div className="text-sm text-gray-900">
                          {requirement.maturityLevel?.level || 'Not Set'} ({requirement.maturityLevel?.score || 0}/5)
                        </div>
                      )}
                      
                      {column.key === 'applicability' && getApplicabilityBadge(requirement.applicability)}
                      
                      {column.key === 'area' && (
                        <div className="text-sm text-gray-900">{requirement.area || '-'}</div>
                      )}
                      
                      {column.key === 'type' && (
                        <div className="text-sm text-gray-900">{requirement.type || '-'}</div>
                      )}
                      
                      {column.key === 'priority' && (
                        <div className="text-sm text-gray-900">{requirement.priority || '-'}</div>
                      )}
                      
                      {column.key === 'actions' && (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => onViewRequirement(requirement)}
                            className="text-blue-600 hover:text-blue-900 transition-colors"
                            title="View Requirement"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => onEditRequirement(requirement)}
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

        {/* Empty State */}
        {filteredRequirements.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No requirements found
            </h3>
            <p className="text-gray-600">
              {requirements.length === 0 
                ? 'Get started by importing requirements or creating new ones.'
                : 'Try adjusting your search or filter criteria.'
              }
            </p>
          </div>
        )}
      </div>

      {/* Selected Items Actions */}
      {selectedRows.size > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white border border-gray-200 rounded-lg shadow-lg px-4 py-3">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {selectedRows.size} requirement{selectedRows.size !== 1 ? 's' : ''} selected
            </span>
            <div className="flex space-x-2">
              <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors">
                Bulk Edit
              </button>
              <button className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors">
                Delete
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