// src/components/requirements/RequirementsTable.jsx
import React, { useState } from 'react';
import { 
  Search, Filter, Eye, Edit, X, Star, Download, Upload, 
  ChevronDown, Settings, RefreshCw 
} from 'lucide-react';
import { TABLE_PAGE_SIZE, PROGRESS_STATUSES, CATEGORIES } from '../../constants';
import MaturityIndicator from '../ui/MaturityIndicator';

const RequirementsTable = ({ 
  requirements, 
  filteredRequirements,
  capabilities,
  filters,
  searchTerm,
  columnVisibility,
  onFilterChange,
  onSearchChange,
  onClearFilters,
  onClearSearch,
  onToggleColumnVisibility,
  onViewRequirement,
  onEditRequirement,
  onExportCSV,
  onImportCSV
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(filteredRequirements.length / TABLE_PAGE_SIZE);
  const startIndex = (currentPage - 1) * TABLE_PAGE_SIZE;
  const endIndex = startIndex + TABLE_PAGE_SIZE;
  const paginatedRequirements = filteredRequirements.slice(startIndex, endIndex);

  const getProgressStatusStyle = (progressStatus) => {
    const status = PROGRESS_STATUSES[progressStatus || 'Not Started'];
    return {
      backgroundColor: `${status?.color}20`,
      color: status?.color || '#ef4444'
    };
  };

  const getStatusStyle = (status) => {
    const statusColors = {
      'Completed': 'bg-green-100 text-green-800',
      'In Progress': 'bg-yellow-100 text-yellow-800',
      'On Hold': 'bg-gray-100 text-gray-800',
      'Not Started': 'bg-red-100 text-red-800',
      'Under Review': 'bg-purple-100 text-purple-800'
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityStyle = (priority) => {
    const priorityColors = {
      'Critical': 'bg-red-100 text-red-800',
      'High': 'bg-orange-100 text-orange-800',
      'Medium': 'bg-yellow-100 text-yellow-800',
      'Low': 'bg-gray-100 text-gray-800'
    };
    return priorityColors[priority] || 'bg-gray-100 text-gray-800';
  };

  const getApplicabilityStyle = (type) => {
    const applicabilityColors = {
      'Essential': 'bg-green-100 text-green-800',
      'Applicable': 'bg-blue-100 text-blue-800',
      'Future': 'bg-yellow-100 text-yellow-800',
      'Conditional': 'bg-orange-100 text-orange-800',
      'Not Applicable': 'bg-gray-100 text-gray-800'
    };
    return applicabilityColors[type] || 'bg-gray-100 text-gray-800';
  };

  const getBusinessValueStyle = (score) => {
    if (score >= 4) return 'bg-green-100 text-green-800';
    if (score >= 3) return 'bg-blue-100 text-blue-800';
    if (score >= 2) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const activeFiltersCount = Object.values(filters).filter(f => f).length;

  return (
    <div className="bg-white rounded-xl shadow-md">
      {/* Header Section */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Requirements Management</h3>
            <p className="text-sm text-gray-600 mt-1">
              {filteredRequirements.length} of {requirements.length} requirements
              {searchTerm && ` matching "${searchTerm}"`}
              {activeFiltersCount > 0 && ` with ${activeFiltersCount} filter${activeFiltersCount > 1 ? 's' : ''}`}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowColumnSelector(!showColumnSelector)}
              className="flex items-center px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Settings className="h-4 w-4 mr-2" />
              Columns
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center px-3 py-2 text-sm border rounded-lg transition-colors ${
                showFilters || activeFiltersCount > 0 
                  ? 'border-blue-300 bg-blue-50 text-blue-700' 
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
            </button>
            <button
              onClick={onImportCSV}
              className="flex items-center px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Upload className="h-4 w-4 mr-2" />
              Import CSV
            </button>
            <button
              onClick={onExportCSV}
              className="flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search requirements, descriptions, justifications..."
            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={onClearSearch}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Column Selector */}
        {showColumnSelector && (
          <div className="mb-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <h4 className="text-sm font-medium text-purple-900 mb-3">Select Columns to Display</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {Object.entries({
                id: 'ID',
                description: 'Description',
                capability: 'Capability',
                progressStatus: 'Progress Status',
                businessValue: 'Business Value',
                maturity: 'Maturity',
                applicability: 'Applicability',
                status: 'Status',
                area: 'Area',
                type: 'Type',
                priority: 'Priority',
                assignee: 'Assignee',
                dueDate: 'Due Date',
                actions: 'Actions'
              }).map(([key, label]) => (
                <label key={key} className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={columnVisibility[key]}
                    onChange={() => onToggleColumnVisibility(key)}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-gray-700">{label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        {showFilters && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-blue-900">Filter Requirements</h4>
              {activeFiltersCount > 0 && (
                <button
                  onClick={onClearFilters}
                  className="flex items-center text-xs text-blue-700 hover:text-blue-900"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Clear All ({activeFiltersCount})
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
              <select
                value={filters.capability || ''}
                onChange={(e) => onFilterChange('capability', e.target.value)}
                className="text-sm border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Capabilities</option>
                {capabilities.map(cap => (
                  <option key={cap.id} value={cap.id}>{cap.id} - {cap.name}</option>
                ))}
              </select>

              <select
                value={filters.area || ''}
                onChange={(e) => onFilterChange('area', e.target.value)}
                className="text-sm border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Areas</option>
                <option value="Business">Business</option>
                <option value="User">User</option>
                <option value="System">System</option>
                <option value="Infrastructure">Infrastructure</option>
              </select>

              <select
                value={filters.type || ''}
                onChange={(e) => onFilterChange('type', e.target.value)}
                className="text-sm border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                <option value="Functional">Functional</option>
                <option value="Non-Functional">Non-Functional</option>
              </select>

              <select
                value={filters.status || ''}
                onChange={(e) => onFilterChange('status', e.target.value)}
                className="text-sm border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Statuses</option>
                <option value="Not Started">Not Started</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="On Hold">On Hold</option>
                <option value="Under Review">Under Review</option>
              </select>

              <select
                value={filters.priority || ''}
                onChange={(e) => onFilterChange('priority', e.target.value)}
                className="text-sm border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Priorities</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>

              <select
                value={filters.maturityLevel || ''}
                onChange={(e) => onFilterChange('maturityLevel', e.target.value)}
                className="text-sm border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Maturity</option>
                <option value="Initial">Initial</option>
                <option value="Developing">Developing</option>
                <option value="Defined">Defined</option>
                <option value="Managed">Managed</option>
                <option value="Optimizing">Optimizing</option>
              </select>

              <select
                value={filters.applicability || ''}
                onChange={(e) => onFilterChange('applicability', e.target.value)}
                className="text-sm border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Applicability</option>
                <option value="Essential">Essential</option>
                <option value="Applicable">Applicable</option>
                <option value="Future">Future</option>
                <option value="Conditional">Conditional</option>
                <option value="Not Applicable">Not Applicable</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columnVisibility.id && (
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                  ID
                </th>
              )}
              {columnVisibility.description && (
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-64">
                  Description
                </th>
              )}
              {columnVisibility.capability && (
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">
                  Capability
                </th>
              )}
              {columnVisibility.area && (
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                  Area
                </th>
              )}
              {columnVisibility.type && (
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                  Type
                </th>
              )}
              {columnVisibility.progressStatus && (
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
                  Progress Status
                </th>
              )}
              {columnVisibility.businessValue && (
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">
                  Business Value
                </th>
              )}
              {columnVisibility.maturity && (
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">
                  Maturity
                </th>
              )}
              {columnVisibility.applicability && (
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                  Applicability
                </th>
              )}
              {columnVisibility.status && (
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                  Status
                </th>
              )}
              {columnVisibility.priority && (
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                  Priority
                </th>
              )}
              {columnVisibility.assignee && (
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                  Assignee
                </th>
              )}
              {columnVisibility.dueDate && (
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                  Due Date
                </th>
              )}
              {columnVisibility.actions && (
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedRequirements.map((requirement) => {
              const progressStatus = PROGRESS_STATUSES[requirement.progressStatus || 'Not Started'];
              const capability = capabilities.find(c => c.id === requirement.capabilityId);
              
              return (
                <tr key={requirement.id} className="hover:bg-gray-50 transition-colors">
                  {columnVisibility.id && (
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {requirement.id}
                    </td>
                  )}
                  {columnVisibility.description && (
                    <td className="px-4 py-4 text-sm text-gray-900">
                      <div className="max-w-xs">
                        <div className="truncate font-medium">{requirement.category}</div>
                        <div className="text-xs text-gray-500 truncate">{requirement.description}</div>
                      </div>
                    </td>
                  )}
                  {columnVisibility.capability && (
                    <td className="px-4 py-4 whitespace-nowrap">
                      {requirement.capabilityId ? (
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-blue-600">{requirement.capabilityId}</span>
                          {capability && (
                            <div className="ml-2 text-xs text-gray-500 truncate max-w-20">
                              {capability.name}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">Not assigned</span>
                      )}
                    </td>
                  )}
                  {columnVisibility.area && (
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {requirement.area}
                    </td>
                  )}
                  {columnVisibility.type && (
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {requirement.type}
                    </td>
                  )}
                  {columnVisibility.progressStatus && (
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium"
                          style={getProgressStatusStyle(requirement.progressStatus)}
                        >
                          <div 
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: progressStatus?.color }}
                          />
                          <span>{requirement.progressStatus || 'Not Started'}</span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {requirement.progress || 0}%
                        </span>
                      </div>
                    </td>
                  )}
                  {columnVisibility.businessValue && (
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getBusinessValueStyle(requirement.businessValueScore)}`}>
                          <Star className="h-3 w-3" />
                          {requirement.businessValueScore}
                        </div>
                        <div className="text-xs text-gray-500">
                          ROI: {requirement.roiProjection}%
                        </div>
                      </div>
                    </td>
                  )}
                  {columnVisibility.maturity && (
                    <td className="px-4 py-4 whitespace-nowrap">
                      {requirement.maturityLevel ? (
                        <MaturityIndicator 
                          level={requirement.maturityLevel.level} 
                          score={requirement.maturityLevel.score} 
                        />
                      ) : (
                        <span className="text-sm text-gray-400">Not assessed</span>
                      )}
                    </td>
                  )}
                  {columnVisibility.applicability && (
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getApplicabilityStyle(requirement.applicability?.type)}`}>
                        {requirement.applicability?.type || 'Not assessed'}
                      </span>
                    </td>
                  )}
                  {columnVisibility.status && (
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusStyle(requirement.status)}`}>
                        {requirement.status}
                      </span>
                    </td>
                  )}
                  {columnVisibility.priority && (
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityStyle(requirement.priority)}`}>
                        {requirement.priority}
                      </span>
                    </td>
                  )}
                  {columnVisibility.assignee && (
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {requirement.assignee}
                    </td>
                  )}
                  {columnVisibility.dueDate && (
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {requirement.dueDate ? new Date(requirement.dueDate).toLocaleDateString() : '-'}
                    </td>
                  )}
                  {columnVisibility.actions && (
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => onViewRequirement(requirement)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => onEditRequirement(requirement)}
                          className="text-gray-400 hover:text-gray-600"
                          title="Edit Requirement"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
          <div className="text-sm text-gray-700">
            Showing {startIndex + 1} to {Math.min(endIndex, filteredRequirements.length)} of {filteredRequirements.length} requirements
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
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
            ))}
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
      {filteredRequirements.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">
            {searchTerm || activeFiltersCount > 0 ? 'No requirements match your criteria' : 'No requirements found'}
          </div>
          {(searchTerm || activeFiltersCount > 0) && (
            <div className="space-x-2">
              {searchTerm && (
                <button
                  onClick={onClearSearch}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Clear search
                </button>
              )}
              {activeFiltersCount > 0 && (
                <button
                  onClick={onClearFilters}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RequirementsTable;