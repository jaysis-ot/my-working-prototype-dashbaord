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
  ArrowDownUp,
  Trash2,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight
} from 'lucide-react';
import Button from '../atoms/Button';
import Input from '../atoms/Input';

// Internal component for the table header to handle sorting UI
const SortableHeader = ({ children, columnId, sortConfig, requestSort }) => {
  const isSorted = sortConfig.key === columnId;
  const direction = isSorted ? sortConfig.direction : undefined;

  return (
    <th
      className="p-3 text-left text-xs font-semibold text-secondary-600 dark:text-secondary-400 uppercase tracking-wider cursor-pointer hover:bg-secondary-50 dark:hover:bg-secondary-800 group"
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

// Maturity Indicator Component - similar to RiskRatingIndicator
const MaturityIndicator = ({ level, score }) => {
  const getMaturityStyles = (score) => {
    if (!score) return 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    
    switch (score) {
      case 1: return 'bg-red-500 text-white'; // Initial
      case 2: return 'bg-orange-500 text-white'; // Developing
      case 3: return 'bg-yellow-400 text-yellow-900'; // Defined
      case 4: return 'bg-green-500 text-white'; // Managed
      case 5: return 'bg-blue-500 text-white'; // Optimizing
      default: return 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };
  
  const getMaturityLabel = (score) => {
    if (!score) return 'Unknown';
    
    switch (score) {
      case 1: return 'Initial';
      case 2: return 'Developing';
      case 3: return 'Defined';
      case 4: return 'Managed';
      case 5: return 'Optimizing';
      default: return 'Unknown';
    }
  };
  
  return (
    <div className="flex items-center gap-2">
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getMaturityStyles(score)}`}>
        {level || getMaturityLabel(score)}
      </span>
      <span className="font-mono text-sm text-secondary-600 dark:text-secondary-400">({score || '?'})</span>
    </div>
  );
};

MaturityIndicator.propTypes = {
  level: PropTypes.string,
  score: PropTypes.number
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
  onDeleteRequirement,
  onExportCSV,
  onImportCSV,
}) => {
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'ascending' });
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;
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
        // Handle nested properties like maturityLevel.score
        if (sortConfig.key.includes('.')) {
          const [parent, child] = sortConfig.key.split('.');
          const aValue = a[parent] ? a[parent][child] : null;
          const bValue = b[parent] ? b[parent][child] : null;
          
          if (aValue < bValue) {
            return sortConfig.direction === 'ascending' ? -1 : 1;
          }
          if (aValue > bValue) {
            return sortConfig.direction === 'ascending' ? 1 : -1;
          }
          return 0;
        }
        
        // Regular property sorting
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

  const totalPages = Math.ceil(sortedItems.length / PAGE_SIZE) || 1;
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return sortedItems.slice(startIndex, startIndex + PAGE_SIZE);
  }, [sortedItems, currentPage]);

  /* Reset page when data set changes */
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, searchTerm, sortConfig]);

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
    <div className="dashboard-card flex-grow flex flex-col">
      {/* Toolbar */}
      <div className="p-4 border-b border-secondary-200 dark:border-secondary-700">
        <div className="flex justify-between mb-4">
          <div className="text-sm text-secondary-600 dark:text-secondary-400">
            Showing <span className="font-medium">{paginatedItems.length}</span> of <span className="font-medium">{filteredRequirements.length}</span> requirements
          </div>
          
          <div className="flex items-center gap-2">
            {/* Column Selector */}
            <div className="relative" ref={columnSelectorRef}>
              <Button 
                variant="outline" 
                onClick={toggleColumnSelector}
                className="flex items-center gap-1 h-10"
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
            
            <Button variant="outline" onClick={onImportCSV} className="h-10">
              <Upload className="h-4 w-4 mr-2" /> Import
            </Button>
            <Button variant="outline" onClick={onExportCSV} className="h-10">
              <Download className="h-4 w-4 mr-2" /> Export
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-1">
          <Input
            placeholder="Search requirements..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            onClear={onClearSearch}
            leadingIcon={Search}
            className="h-10"
          />
          
          <select 
            value={filters.status || ''} 
            onChange={(e) => onFilterChange('status', e.target.value)} 
            className="w-full h-10 text-sm border-secondary-300 rounded-md dark:bg-secondary-800 dark:border-secondary-600"
          >
            <option value="">All Statuses</option>
            <option value="Not Started">Not Started</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
          
          <select 
            value={filters.capabilityId || ''} 
            onChange={(e) => onFilterChange('capabilityId', e.target.value)} 
            className="w-full h-10 text-sm border-secondary-300 rounded-md dark:bg-secondary-800 dark:border-secondary-600"
          >
            <option value="">All Capabilities</option>
            {capabilities.map(cap => (
              <option key={cap.id} value={cap.id}>{cap.name}</option>
            ))}
          </select>
          
          <select 
            value={filters.priority || ''} 
            onChange={(e) => onFilterChange('priority', e.target.value)} 
            className="w-full h-10 text-sm border-secondary-300 rounded-md dark:bg-secondary-800 dark:border-secondary-600"
          >
            <option value="">All Priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
          
          <select 
            value={filters.maturityLevel || ''} 
            onChange={(e) => onFilterChange('maturityLevel', e.target.value)} 
            className="w-full h-10 text-sm border-secondary-300 rounded-md dark:bg-secondary-800 dark:border-secondary-600"
          >
            <option value="">All Maturity Levels</option>
            <option value="1">Initial (1)</option>
            <option value="2">Developing (2)</option>
            <option value="3">Defined (3)</option>
            <option value="4">Managed (4)</option>
            <option value="5">Optimizing (5)</option>
          </select>
          
          <Button 
            variant="ghost" 
            onClick={onClearFilters} 
            className="h-10 flex items-center justify-center gap-1"
          >
            <RefreshCw className="h-4 w-4" /> Reset Filters
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto flex-grow">
        <table className="min-w-full divide-y divide-secondary-200 dark:divide-secondary-700 table-auto">
          <thead className="bg-secondary-50 dark:bg-secondary-800/50 group">
            <tr>
              {columnVisibility.id && <SortableHeader columnId="id" sortConfig={sortConfig} requestSort={requestSort}>ID</SortableHeader>}
              {columnVisibility.description && <SortableHeader columnId="description" sortConfig={sortConfig} requestSort={requestSort}>Description</SortableHeader>}
              {columnVisibility.capability && <SortableHeader columnId="capabilityId" sortConfig={sortConfig} requestSort={requestSort}>Capability</SortableHeader>}
              {columnVisibility.status && <SortableHeader columnId="status" sortConfig={sortConfig} requestSort={requestSort}>Status</SortableHeader>}
              {columnVisibility.priority && <SortableHeader columnId="priority" sortConfig={sortConfig} requestSort={requestSort}>Priority</SortableHeader>}
              {columnVisibility.maturity && <SortableHeader columnId="maturityLevel.score" sortConfig={sortConfig} requestSort={requestSort}>Maturity</SortableHeader>}
              {columnVisibility.actions && <th className="p-3 text-left text-xs font-semibold text-secondary-600 dark:text-secondary-400 uppercase tracking-wider">Actions</th>}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-secondary-900 divide-y divide-secondary-200 dark:divide-secondary-700">
            {paginatedItems.length > 0 ? (
              paginatedItems.map((req) => (
                <tr key={req.id} className="hover:bg-secondary-50 dark:hover:bg-secondary-800/50">
                  {columnVisibility.id && <td className="p-3 text-sm font-mono text-primary-600 dark:text-primary-400 whitespace-nowrap">{req.id}</td>}
                  {columnVisibility.description && <td className="p-3 text-sm text-secondary-700 dark:text-secondary-300 max-w-xs truncate">{req.description}</td>}
                  {columnVisibility.capability && <td className="p-3 text-sm text-secondary-600 dark:text-secondary-400 whitespace-nowrap">{getCapabilityName(req.capabilityId)}</td>}
                  {columnVisibility.status && (
                    <td className="p-3 text-sm whitespace-nowrap">
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
                    <td className="p-3 text-sm whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        req.priority === 'High' ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300' :
                        req.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300' :
                        'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'
                      }`}>
                        {req.priority}
                      </span>
                    </td>
                  )}
                  {columnVisibility.maturity && (
                    <td className="p-3 text-sm whitespace-nowrap">
                      <MaturityIndicator 
                        level={req.maturityLevel?.level} 
                        score={req.maturityLevel?.score} 
                      />
                    </td>
                  )}
                  {columnVisibility.actions && (
                    <td className="p-3 text-sm whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="ghost" onClick={() => onViewRequirement(req)} title="View">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => onEditRequirement(req)} title="Edit">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => onDeleteRequirement(req)} title="Delete">
                          <Trash2 className="h-4 w-4 text-status-error" />
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-secondary-200 dark:border-secondary-700 flex items-center justify-between">
          <span className="text-sm text-secondary-600 dark:text-secondary-400">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <Button size="sm" variant="secondary" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>
              <ChevronsLeft className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="px-2 text-sm font-semibold">{currentPage}</span>
            <Button size="sm" variant="secondary" onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages}>
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}>
              <ChevronsRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
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
  onDeleteRequirement: PropTypes.func.isRequired,
  onExportCSV: PropTypes.func.isRequired,
  onImportCSV: PropTypes.func.isRequired,
};

export default RequirementsTable;
