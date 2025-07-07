import React, { useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  Search,
  Filter,
  Upload,
  Download,
  Eye,
  Edit2,
  ChevronDown,
  ChevronUp,
  XCircle,
} from 'lucide-react';
import Button from '../atoms/Button';

// Internal component for the table header to handle sorting UI
const SortableHeader = ({ children, columnId, sortConfig, requestSort }) => {
  const isSorted = sortConfig.key === columnId;
  const direction = isSorted ? sortConfig.direction : undefined;

  return (
    <th
      className="p-3 text-left text-xs font-semibold text-secondary-600 dark:text-secondary-400 uppercase tracking-wider cursor-pointer hover:bg-secondary-50 dark:hover:bg-secondary-800"
      onClick={() => requestSort(columnId)}
    >
      <div className="flex items-center">
        {children}
        <span className="ml-2">
          {isSorted ? (
            direction === 'ascending' ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )
          ) : (
            <ChevronDown className="h-4 w-4 text-transparent group-hover:text-secondary-400" />
          )}
        </span>
      </div>
    </th>
  );
};

SortableHeader.propTypes = {
  children: PropTypes.node.isRequired,
  columnId: PropTypes.string.isRequired,
  sortConfig: PropTypes.object.isRequired,
  requestSort: PropTypes.func.isRequired,
};


/**
 * RequirementsTable Organism
 * 
 * This is a placeholder component that displays requirements in a filterable and sortable table.
 * It is designed to be a "dumb" component, receiving all its data and logic via props
 * from the parent `RequirementsPage`.
 * 
 * Responsibilities:
 * - Displaying the list of filtered requirements.
 * - Rendering filter controls and search bars.
 * - Handling user interactions (sorting, button clicks) and delegating them to the parent page.
 */
const RequirementsTable = ({
  filteredRequirements,
  capabilities,
  filters,
  searchTerm,
  columnVisibility,
  onFilterChange,
  onSearchChange,
  onClearFilters,
  onClearSearch,
  onViewRequirement,
  onEditRequirement,
  onExportCSV,
  onImportCSV,
}) => {
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'ascending' });

  const requestSort = useCallback((key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  }, [sortConfig]);

  const sortedItems = useMemo(() => {
    let sortableItems = [...filteredRequirements];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [filteredRequirements, sortConfig]);

  const getCapabilityName = (id) => {
    const capability = capabilities.find(c => c.id === id);
    return capability ? capability.name : 'N/A';
  };

  return (
    <div className="dashboard-card p-0">
      {/* Toolbar */}
      <div className="p-4 border-b border-secondary-200 dark:border-secondary-700">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary-400" />
            <input
              type="text"
              placeholder="Search requirements..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-secondary-300 rounded-md dark:bg-secondary-800 dark:border-secondary-600 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          {/* Filters */}
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-secondary-500" />
            <select
              value={filters.status || ''}
              onChange={(e) => onFilterChange('status', e.target.value)}
              className="text-sm border-secondary-300 rounded-md dark:bg-secondary-800 dark:border-secondary-600"
            >
              <option value="">All Statuses</option>
              <option value="Not Started">Not Started</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
             <Button variant="ghost" onClick={onClearFilters} className="flex items-center gap-1">
              <XCircle className="h-4 w-4" /> Clear
            </Button>
          </div>
          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onImportCSV}>
              <Upload className="h-4 w-4 mr-2" /> Import
            </Button>
            <Button variant="outline" onClick={onExportCSV}>
              <Download className="h-4 w-4 mr-2" /> Export
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-secondary-200 dark:divide-secondary-700">
          <thead className="bg-secondary-50 dark:bg-secondary-800/50 group">
            <tr>
              {columnVisibility.id && <SortableHeader columnId="id" sortConfig={sortConfig} requestSort={requestSort}>ID</SortableHeader>}
              {columnVisibility.description && <SortableHeader columnId="description" sortConfig={sortConfig} requestSort={requestSort}>Description</SortableHeader>}
              {columnVisibility.capability && <SortableHeader columnId="capabilityId" sortConfig={sortConfig} requestSort={requestSort}>Capability</SortableHeader>}
              {columnVisibility.status && <SortableHeader columnId="status" sortConfig={sortConfig} requestSort={requestSort}>Status</SortableHeader>}
              {columnVisibility.actions && <th className="p-3 text-left text-xs font-semibold text-secondary-600 dark:text-secondary-400 uppercase tracking-wider">Actions</th>}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-secondary-900 divide-y divide-secondary-200 dark:divide-secondary-700">
            {sortedItems.length > 0 ? (
              sortedItems.map((req) => (
                <tr key={req.id} className="hover:bg-secondary-50 dark:hover:bg-secondary-800/50">
                  {columnVisibility.id && <td className="p-3 text-sm font-mono text-primary-600 dark:text-primary-400">{req.id}</td>}
                  {columnVisibility.description && <td className="p-3 text-sm text-secondary-700 dark:text-secondary-300 max-w-md truncate">{req.description}</td>}
                  {columnVisibility.capability && <td className="p-3 text-sm text-secondary-600 dark:text-secondary-400">{getCapabilityName(req.capabilityId)}</td>}
                  {columnVisibility.status && (
                    <td className="p-3 text-sm">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        req.status === 'Completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' :
                        req.status === 'In Progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {req.status}
                      </span>
                    </td>
                  )}
                  {columnVisibility.actions && (
                    <td className="p-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="ghost" onClick={() => onViewRequirement(req)} title="View">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => onEditRequirement(req)} title="Edit">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={Object.values(columnVisibility).filter(Boolean).length} className="p-6 text-center text-secondary-500">
                  No requirements found. Try adjusting your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

RequirementsTable.propTypes = {
  requirements: PropTypes.array.isRequired,
  filteredRequirements: PropTypes.array.isRequired,
  capabilities: PropTypes.array.isRequired,
  filters: PropTypes.object.isRequired,
  searchTerm: PropTypes.string.isRequired,
  columnVisibility: PropTypes.object.isRequired,
  onFilterChange: PropTypes.func.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  onClearFilters: PropTypes.func.isRequired,
  onClearSearch: PropTypes.func.isRequired,
  onToggleColumnVisibility: PropTypes.func.isRequired,
  onViewRequirement: PropTypes.func.isRequired,
  onEditRequirement: PropTypes.func.isRequired,
  onExportCSV: PropTypes.func.isRequired,
  onImportCSV: PropTypes.func.isRequired,
};

export default RequirementsTable;
