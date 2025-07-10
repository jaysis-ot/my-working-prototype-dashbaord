import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Search,
  Upload,
  Download,
  Eye,
  Edit2,
  Columns,
  Check,
  RefreshCw,
  ArrowDownUp
} from 'lucide-react';
import Button from '../atoms/Button';
import Input from '../atoms/Input';

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
        <ArrowDownUp
          className={`w-3 h-3 ml-1 transition-transform ${
            isSorted
              ? direction === 'ascending'
                ? 'text-secondary-600 rotate-180'
                : 'text-secondary-600'
              : 'text-secondary-400 group-hover:text-secondary-600'
          }`}
        />
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
  onToggleColumnVisibility,
  onViewRequirement,
  onEditRequirement,
  onExportCSV,
  onImportCSV,
}) => {
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'ascending' });
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const columnSelectorRef = useRef(null);

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

  const toggleColumnSelector = () => {
    setShowColumnSelector(!showColumnSelector);
  };

  /* --------------------------------------------------------------------
   * Close the column selector pop-over when user clicks outside of it.
   * ------------------------------------------------------------------ */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showColumnSelector &&
          columnSelectorRef.current &&
          !columnSelectorRef.current.contains(e.target)) {
        setShowColumnSelector(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showColumnSelector]);

  return (
    <div className="dashboard-card p-0">
      {/* Toolbar */}
      <div className="p-4 border-b border-secondary-200 dark:border-secondary-700">
        <div className="flex justify-between mb-4">
          <div className="text-sm text-secondary-600 dark:text-secondary-400">
            Showing <span className="font-medium">{sortedItems.length}</span> of <span className="font-medium">{filteredRequirements.length}</span> requirements
          </div>
          
          <div className="flex items-center gap-2">
            {/* Column Selector */}
            <div className="relative" ref={columnSelectorRef}>
              <Button 
                variant="outline" 
                onClick={toggleColumnSelector}
                className="flex items-center gap-1"
              >
                <Columns className="h-4 w-4" /> Columns
              </Button>
              
              {showColumnSelector && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-secondary-800 rounded-md shadow-lg z-10 border border-secondary-200 dark:border-secondary-700">
                  <div className="p-2">
                    <div className="text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2 pb-2 border-b border-secondary-200 dark:border-secondary-700">
                      Toggle Columns
                    </div>
                    <div className="space-y-2">
                      {Object.entries(columnVisibility).map(([column, isVisible]) => (
                        <label key={column} className="flex items-center justify-between cursor-pointer p-1 hover:bg-secondary-50 dark:hover:bg-secondary-700 rounded">
                          <span className="text-sm text-secondary-700 dark:text-secondary-300 capitalize">
                            {column === 'id' ? 'ID' : column}
                          </span>
                          <div 
                            onClick={() => onToggleColumnVisibility(column)}
                            className={`w-5 h-5 flex items-center justify-center rounded ${isVisible ? 'bg-primary-500 text-white' : 'bg-secondary-200 dark:bg-secondary-700'}`}
                          >
                            {isVisible && <Check className="h-3 w-3" />}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <Button variant="outline" onClick={onImportCSV}>
              <Upload className="h-4 w-4 mr-2" /> Import
            </Button>
            <Button variant="outline" onClick={onExportCSV}>
              <Download className="h-4 w-4 mr-2" /> Export
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <Input
            placeholder="Search requirements..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            onClear={onClearSearch}
            leadingIcon={Search}
            className="lg:col-span-2"
          />
          
          <select 
            value={filters.status || ''} 
            onChange={(e) => onFilterChange('status', e.target.value)} 
            className="w-full text-sm border-secondary-300 rounded-md dark:bg-secondary-800 dark:border-secondary-600"
          >
            <option value="">All Statuses</option>
            <option value="Not Started">Not Started</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
          
          <select 
            value={filters.capabilityId || ''} 
            onChange={(e) => onFilterChange('capabilityId', e.target.value)} 
            className="w-full text-sm border-secondary-300 rounded-md dark:bg-secondary-800 dark:border-secondary-600"
          >
            <option value="">All Capabilities</option>
            {capabilities.map(cap => (
              <option key={cap.id} value={cap.id}>{cap.name}</option>
            ))}
          </select>
          
          <select 
            value={filters.priority || ''} 
            onChange={(e) => onFilterChange('priority', e.target.value)} 
            className="w-full text-sm border-secondary-300 rounded-md dark:bg-secondary-800 dark:border-secondary-600"
          >
            <option value="">All Priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
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
              {columnVisibility.priority && <SortableHeader columnId="priority" sortConfig={sortConfig} requestSort={requestSort}>Priority</SortableHeader>}
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
                  {columnVisibility.priority && (
                    <td className="p-3 text-sm">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        req.priority === 'High' ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300' :
                        req.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300' :
                        'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'
                      }`}>
                        {req.priority}
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
