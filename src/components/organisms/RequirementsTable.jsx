import React, { useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  Search, Filter, Eye, Edit, X, Star, Download, Upload,
  ChevronDown, Settings, RefreshCw, MoreVertical, Trash2,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  ArrowDown, ArrowUp
} from 'lucide-react';
import Button from '../atoms/Button';
import Input from '../atoms/Input';
import Badge from '../atoms/Badge';

// --- Internal Molecules for RequirementsTable ---

/**
 * MaturityIndicator Molecule
 * A visual representation of a requirement's maturity level.
 */
const MaturityIndicator = ({ score }) => {
  const level = Math.round(score || 0);
  const colors = [
    'bg-maturity-1', 'bg-maturity-2', 'bg-maturity-3', 'bg-maturity-4', 'bg-maturity-5'
  ];

  return (
    <div className="flex items-center gap-1" title={`Maturity Score: ${score}/5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className={`w-3 h-5 rounded-sm ${i < level ? colors[i] : 'bg-secondary-200 dark:bg-secondary-600'}`}
        />
      ))}
      <span className="ml-2 text-sm font-semibold">{score?.toFixed(1) || 'N/A'}</span>
    </div>
  );
};
MaturityIndicator.propTypes = { score: PropTypes.number };

/**
 * ProgressStatus Molecule
 * Displays the progress status with a label and percentage.
 */
const ProgressStatus = ({ status, percentage }) => {
  const color = status === 'Qualifying' ? 'text-blue-600' : 'text-green-600';
  return (
    <div className="flex items-center gap-2">
      <span className={`font-medium ${color}`}>{status}</span>
      <span className="text-secondary-500 dark:text-secondary-400">{percentage}%</span>
    </div>
  );
};
ProgressStatus.propTypes = { status: PropTypes.string, percentage: PropTypes.number };

/**
 * TableToolbar: Header section with search, filters, and actions.
 */
const TableToolbar = ({
  onSearchChange, searchTerm, onClearSearch,
  showFilters, setShowFilters, activeFiltersCount,
  showColumnSelector, setShowColumnSelector,
  onImportCSV, onExportCSV
}) => (
  <div className="p-4 border-b border-secondary-200 dark:border-secondary-700">
    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="w-full md:w-1/2 lg:w-2/5">
        <Input
          placeholder="Search requirements, descriptions, justifications..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          leadingIcon={Search}
          onClear={searchTerm ? onClearSearch : null}
        />
      </div>
      <div className="flex items-center gap-2">
        <Button variant="secondary" onClick={() => setShowColumnSelector(val => !val)} leadingIcon={Settings}>Columns</Button>
        <Button variant="secondary" onClick={() => setShowFilters(!showFilters)} leadingIcon={Filter}>
          Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
        </Button>
        <Button variant="secondary" onClick={onImportCSV} leadingIcon={Upload}>Import CSV</Button>
        <Button onClick={onExportCSV} leadingIcon={Download}>Export CSV</Button>
      </div>
    </div>
  </div>
);

/**
 * FilterPanel: Expandable panel for advanced filtering.
 */
const FilterPanel = ({ filters, capabilities, onFilterChange, onClearFilters }) => (
  <div className="p-4 bg-secondary-50 dark:bg-secondary-900/50 border-b border-secondary-200 dark:border-secondary-700">
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
      <select value={filters.capability || ''} onChange={(e) => onFilterChange('capability', e.target.value)} className="w-full text-sm border-secondary-300 rounded-md dark:bg-secondary-800 dark:border-secondary-600">
        <option value="">All Capabilities</option>
        {capabilities.map(cap => <option key={cap.id} value={cap.id}>{cap.name}</option>)}
      </select>
      <select value={filters.area || ''} onChange={(e) => onFilterChange('area', e.target.value)} className="w-full text-sm border-secondary-300 rounded-md dark:bg-secondary-800 dark:border-secondary-600">
        <option value="">All Areas</option>
        {['Business', 'User', 'System', 'Infrastructure'].map(a => <option key={a} value={a}>{a}</option>)}
      </select>
      <select value={filters.type || ''} onChange={(e) => onFilterChange('type', e.target.value)} className="w-full text-sm border-secondary-300 rounded-md dark:bg-secondary-800 dark:border-secondary-600">
        <option value="">All Types</option>
        {['Functional', 'Non-Functional'].map(t => <option key={t} value={t}>{t}</option>)}
      </select>
      <select value={filters.status || ''} onChange={(e) => onFilterChange('status', e.target.value)} className="w-full text-sm border-secondary-300 rounded-md dark:bg-secondary-800 dark:border-secondary-600">
        <option value="">All Statuses</option>
        {['Not Started', 'In Progress', 'Completed', 'On Hold', 'Under Review'].map(s => <option key={s} value={s}>{s}</option>)}
      </select>
      <select value={filters.priority || ''} onChange={(e) => onFilterChange('priority', e.target.value)} className="w-full text-sm border-secondary-300 rounded-md dark:bg-secondary-800 dark:border-secondary-600">
        <option value="">All Priorities</option>
        {['Low', 'Medium', 'High', 'Critical'].map(p => <option key={p} value={p}>{p}</option>)}
      </select>
      <select value={filters.applicability || ''} onChange={(e) => onFilterChange('applicability', e.target.value)} className="w-full text-sm border-secondary-300 rounded-md dark:bg-secondary-800 dark:border-secondary-600">
        <option value="">All Applicability</option>
        {['Not Applicable', 'Applicable', 'Conditional'].map(a => <option key={a} value={a}>{a}</option>)}
      </select>
    </div>
    <div className="mt-4 flex justify-end">
      <Button variant="ghost" onClick={onClearFilters} leadingIcon={RefreshCw}>Clear Filters</Button>
    </div>
  </div>
);

/**
 * RequirementsTable Organism
 * 
 * Displays requirements in a sortable, filterable, and paginated table.
 * This is a presentational component that receives all data and handlers via props.
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
  onExportCSV,
  onImportCSV
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'ascending' });
  const [selectedRows, setSelectedRows] = useState(new Set());

  const PAGE_SIZE = 15;

  const sortedRequirements = useMemo(() => {
    let sortableItems = [...filteredRequirements];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        if (aVal < bVal) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [filteredRequirements, sortConfig]);

  const paginatedRequirements = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return sortedRequirements.slice(startIndex, startIndex + PAGE_SIZE);
  }, [sortedRequirements, currentPage]);

  const totalPages = Math.ceil(sortedRequirements.length / PAGE_SIZE);

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows(new Set(paginatedRequirements.map(r => r.id)));
    } else {
      setSelectedRows(new Set());
    }
  };

  const handleRowSelect = (id) => {
    const newSelection = new Set(selectedRows);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedRows(newSelection);
  };

  const columns = useMemo(() => [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'description', label: 'Description', sortable: true },
    { key: 'capabilityId', label: 'Capability', sortable: true },
    { key: 'progressStatus', label: 'Progress Status', sortable: true },
    { key: 'businessValueScore', label: 'Business Value', sortable: true },
    { key: 'maturityLevel', label: 'Maturity', sortable: true },
    { key: 'applicability', label: 'Applicability', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'area', label: 'Area', sortable: true },
    { key: 'type', label: 'Type', sortable: true },
    { key: 'priority', label: 'Priority', sortable: true },
    { key: 'assignee', label: 'Assignee', sortable: true },
    { key: 'dueDate', label: 'Due Date', sortable: true },
    { key: 'actions', label: 'Actions', sortable: false },
  ], []);

  const visibleColumns = useMemo(() => columns.filter(c => columnVisibility[c.key]), [columns, columnVisibility]);

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="dashboard-card overflow-hidden">
      <TableToolbar
        onSearchChange={onSearchChange}
        searchTerm={searchTerm}
        onClearSearch={onClearSearch}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        activeFiltersCount={activeFiltersCount}
        showColumnSelector={showColumnSelector}
        setShowColumnSelector={setShowColumnSelector}
        onImportCSV={onImportCSV}
        onExportCSV={onExportCSV}
      />
      
      {showFilters && (
        <FilterPanel
          filters={filters}
          capabilities={capabilities}
          onFilterChange={onFilterChange}
          onClearFilters={onClearFilters}
        />
      )}

      {showColumnSelector && (
        <div className="p-4 bg-secondary-50 dark:bg-secondary-900/50 border-b border-secondary-200 dark:border-secondary-700">
          <h4 className="text-sm font-medium mb-2">Select Columns to Display</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {columns.map(col => (
              <label key={col.key} className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={!!columnVisibility[col.key]} onChange={() => onToggleColumnVisibility(col.key)} className="rounded text-primary-600 focus:ring-primary-500" />
                {col.label}
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-secondary-200 dark:divide-secondary-700">
          <thead className="bg-secondary-50 dark:bg-secondary-700/50">
            <tr>
              <th className="px-4 py-3 text-left">
                <input type="checkbox" onChange={handleSelectAll} checked={selectedRows.size > 0 && selectedRows.size === paginatedRequirements.length} className="rounded" />
              </th>
              {visibleColumns.map(col => (
                <th key={col.key} className="px-4 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                  {col.sortable ? (
                    <button onClick={() => handleSort(col.key)} className="flex items-center gap-1">
                      {col.label}
                      {sortConfig.key === col.key ? (sortConfig.direction === 'ascending' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />) : null}
                    </button>
                  ) : col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-secondary-800 divide-y divide-secondary-200 dark:divide-secondary-700">
            {paginatedRequirements.map(req => (
              <tr key={req.id} className="hover:bg-secondary-50 dark:hover:bg-secondary-700/50">
                <td className="px-4 py-3"><input type="checkbox" checked={selectedRows.has(req.id)} onChange={() => handleRowSelect(req.id)} className="rounded" /></td>
                {visibleColumns.map(col => (
                  <td key={col.key} className="px-4 py-3 whitespace-nowrap text-sm">
                    {(() => {
                      switch (col.key) {
                        case 'id': return <span className="font-mono text-primary-600 dark:text-primary-300">{req.id}</span>;
                        case 'description': return <span className="text-secondary-800 dark:text-secondary-200 line-clamp-1" title={req.description}>{req.description}</span>;
                        case 'capabilityId': return <Badge variant="info">{req.capabilityId || 'N/A'}</Badge>;
                        case 'progressStatus': return <ProgressStatus status={req.progressStatus} percentage={req.progress} />;
                        case 'businessValueScore': return <div className="flex items-center gap-1"><Star className="w-4 h-4 text-yellow-500" /> {req.businessValueScore?.toFixed(1)}</div>;
                        case 'maturityLevel': return <MaturityIndicator score={req.maturityLevel?.score} />;
                        case 'applicability': return <Badge variant={req.applicability === 'Not Applicable' ? 'default' : 'success'}>{req.applicability}</Badge>;
                        case 'status': return <Badge variant={req.status === 'Completed' ? 'success' : 'default'}>{req.status}</Badge>;
                        case 'area': return <span>{req.area}</span>;
                        case 'type': return <span>{req.type}</span>;
                        case 'priority': return <Badge variant={req.priority === 'Critical' ? 'error' : req.priority === 'High' ? 'warning' : 'default'}>{req.priority}</Badge>;
                        case 'assignee': return <span>{req.assignee}</span>;
                        case 'dueDate': return <span>{req.dueDate}</span>;
                        case 'actions': return (
                          <div className="flex items-center gap-1">
                            <Button size="sm" variant="ghost" onClick={() => onViewRequirement(req)} title="View"><Eye className="w-4 h-4" /></Button>
                            <Button size="sm" variant="ghost" onClick={() => onEditRequirement(req)} title="Edit"><Edit className="w-4 h-4" /></Button>
                          </div>
                        );
                        default: return req[col.key];
                      }
                    })()}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {paginatedRequirements.length === 0 && (
        <div className="text-center py-16">
          <p className="text-secondary-500">No requirements found.</p>
          {activeFiltersCount > 0 && <Button variant="link" onClick={onClearFilters} className="mt-2">Clear filters</Button>}
        </div>
      )}

      {totalPages > 1 && (
        <div className="p-4 border-t border-secondary-200 dark:border-secondary-700 flex items-center justify-between">
          <span className="text-sm text-secondary-600">Page {currentPage} of {totalPages}</span>
          <div className="flex items-center gap-1">
            <Button size="sm" variant="secondary" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}><ChevronsLeft className="w-4 h-4" /></Button>
            <Button size="sm" variant="secondary" onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1}><ChevronLeft className="w-4 h-4" /></Button>
            <span className="px-2 text-sm">...</span>
            <Button size="sm" variant="secondary" onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages}><ChevronRight className="w-4 h-4" /></Button>
            <Button size="sm" variant="secondary" onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}><ChevronsRight className="w-4 h-4" /></Button>
          </div>
        </div>
      )}

      {selectedRows.size > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-white dark:bg-secondary-700 shadow-lg rounded-lg p-3 flex items-center gap-4 border border-secondary-200 dark:border-secondary-600 z-20">
          <span className="text-sm font-medium">{selectedRows.size} selected</span>
          <Button size="sm" variant="secondary">Bulk Edit</Button>
          <Button size="sm" variant="danger" leadingIcon={Trash2}>Delete</Button>
          <button onClick={() => setSelectedRows(new Set())} className="p-1 hover:bg-secondary-100 dark:hover:bg-secondary-600 rounded-full"><X className="w-4 h-4" /></button>
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
  onExportCSV: PropTypes.func.isRequired,
  onImportCSV: PropTypes.func.isRequired,
};

export default RequirementsTable;
