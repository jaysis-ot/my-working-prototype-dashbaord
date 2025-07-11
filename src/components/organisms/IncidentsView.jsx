import React, { useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  AlertCircle,
  Plus,
  ArrowDownUp,
  Eye,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  Download,
  Upload,
  Clock,
  CheckCircle,
  AlertTriangle,
  User,
  Calendar
} from 'lucide-react';
import Button from '../atoms/Button';
import Badge from '../atoms/Badge';
import Input from '../atoms/Input';
// Import the IncidentCreateModal molecule
import IncidentCreateModal from '../molecules/IncidentCreateModal';

// --- Internal Molecules for IncidentsView ---

/**
 * MetricCard: Displays a single key statistic for the incidents overview.
 */
const MetricCard = ({ title, value, color, icon: Icon }) => (
  <div className={`dashboard-card p-4 border-l-4 border-${color}-500`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-secondary-500 dark:text-secondary-400">{title}</p>
        <p className="text-3xl font-bold text-secondary-900 dark:text-white mt-1">{value}</p>
      </div>
      {Icon && <Icon className={`w-10 h-10 text-${color}-500 opacity-80`} />}
    </div>
  </div>
);

MetricCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  color: PropTypes.string,
  icon: PropTypes.elementType
};

MetricCard.defaultProps = { 
  color: 'primary',
  icon: null
};

/**
 * StatusBadge: A visual indicator for the incident status.
 */
const StatusBadge = ({ status }) => {
  const getStatusStyles = (status) => {
    switch (status) {
      case 'NEW':
        return { color: 'red', label: 'New' };
      case 'INVESTIGATING':
        return { color: 'orange', label: 'Investigating' };
      case 'IN_PROGRESS':
        return { color: 'yellow', label: 'In Progress' };
      case 'RESOLVED':
        return { color: 'green', label: 'Resolved' };
      case 'CLOSED':
        return { color: 'blue', label: 'Closed' };
      default:
        return { color: 'gray', label: status };
    }
  };
  
  const { color, label } = getStatusStyles(status);
  
  return <Badge color={color}>{label}</Badge>;
};

StatusBadge.propTypes = {
  status: PropTypes.string.isRequired
};

/**
 * SeverityIndicator: A visual indicator for the incident severity.
 */
const SeverityIndicator = ({ severity }) => {
  const getSeverityStyles = (sev) => {
    switch (sev) {
      case 'CRITICAL':
        return { color: 'bg-red-500 text-white', label: 'Critical' };
      case 'HIGH':
        return { color: 'bg-orange-500 text-white', label: 'High' };
      case 'MEDIUM':
        return { color: 'bg-yellow-400 text-yellow-900', label: 'Medium' };
      case 'LOW':
        return { color: 'bg-green-500 text-white', label: 'Low' };
      case 'INFORMATIONAL':
        return { color: 'bg-blue-500 text-white', label: 'Info' };
      default:
        return { color: 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300', label: sev };
    }
  };
  
  const { color, label } = getSeverityStyles(severity);
  
  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${color}`}>
      {label}
    </span>
  );
};

SeverityIndicator.propTypes = {
  severity: PropTypes.string.isRequired
};

/**
 * TimeAgo: Displays a human-readable time since the incident occurred.
 */
const TimeAgo = ({ timestamp }) => {
  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const incidentTime = new Date(timestamp);
    const diffMs = now - incidentTime;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 30) return `${diffDays}d ago`;
    
    const diffMonths = Math.floor(diffDays / 30);
    return `${diffMonths}mo ago`;
  };

  return (
    <div className="flex items-center text-sm text-secondary-500 dark:text-secondary-400">
      <Clock className="w-3 h-3 mr-1" />
      <span title={new Date(timestamp).toLocaleString()}>{getTimeAgo(timestamp)}</span>
    </div>
  );
};

TimeAgo.propTypes = {
  timestamp: PropTypes.string.isRequired
};

// --- Main Organism Component ---

/**
 * IncidentsView Organism Component
 * 
 * This is the main presentational component for displaying and interacting
 * with security incidents. It provides a comprehensive interface for:
 * - Viewing a list of incidents in a table format
 * - Creating new incidents
 * - Filtering and sorting incidents
 * - Viewing incident details
 * - Managing incident lifecycle (update, delete)
 * 
 * Following atomic design principles, this organism composes atoms and molecules
 * to create a cohesive user interface for incident management.
 */
const IncidentsView = ({
  incidents,
  metrics,
  filters,
  onFilterChange,
  onAddIncident,
  onUpdateIncident,
  onDeleteIncident,
  onViewIncidentDetails
}) => {
  // Sorting state
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;
  
  // Delete confirmation state
  const [deleteConfirmation, setDeleteConfirmation] = useState({ isOpen: false, incidentId: null });
  
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);
  
  // Open create incident modal
  const openCreateModal = useCallback(() => {
    setIsCreateModalOpen(true);
  }, []);
  
  // Close create incident modal
  const closeCreateModal = useCallback(() => {
    setIsCreateModalOpen(false);
  }, []);
  
  // Handle create incident submission
  const handleCreateIncident = useCallback((newIncident) => {
    onAddIncident(newIncident);
    closeCreateModal();
  }, [onAddIncident, closeCreateModal]);
  
  // Handle view incident details
  const handleViewIncident = useCallback((incident) => {
    onViewIncidentDetails(incident);
  }, [onViewIncidentDetails]);
  
  // Handle delete incident click
  const handleDeleteClick = useCallback((incidentId) => {
    setDeleteConfirmation({ isOpen: true, incidentId });
  }, []);
  
  // Handle confirm delete
  const handleConfirmDelete = useCallback(() => {
    if (deleteConfirmation.incidentId) {
      onDeleteIncident(deleteConfirmation.incidentId);
      setDeleteConfirmation({ isOpen: false, incidentId: null });
    }
  }, [onDeleteIncident, deleteConfirmation.incidentId]);
  
  // Handle cancel delete
  const handleCancelDelete = useCallback(() => {
    setDeleteConfirmation({ isOpen: false, incidentId: null });
  }, []);
  
  // Handle sorting
  const handleSort = useCallback((key) => {
    setSortConfig(prev => {
      if (prev.key === key) {
        return { ...prev, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'desc' };
    });
  }, []);
  
  // Apply sorting and pagination to incidents
  const sortedAndPaginatedIncidents = useMemo(() => {
    const sorted = [...incidents].sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];
      
      // Handle nested properties
      if (sortConfig.key.includes('.')) {
        const keys = sortConfig.key.split('.');
        aVal = keys.reduce((obj, key) => obj && obj[key], a);
        bVal = keys.reduce((obj, key) => obj && obj[key], b);
      }
      
      // Handle dates
      if (sortConfig.key === 'createdAt' || sortConfig.key === 'resolvedAt') {
        aVal = aVal ? new Date(aVal).getTime() : 0;
        bVal = bVal ? new Date(bVal).getTime() : 0;
      }
      
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return sorted.slice(startIndex, startIndex + PAGE_SIZE);
  }, [incidents, sortConfig, currentPage]);
  
  // Calculate total pages
  const totalPages = Math.ceil(incidents.length / PAGE_SIZE);
  
  // Table columns configuration
  const columns = [
    { key: 'id', label: 'Incident ID', sortable: true },
    { key: 'title', label: 'Title', sortable: true },
    { key: 'severity', label: 'Severity', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'assignedTo', label: 'Assigned To', sortable: true },
    { key: 'createdAt', label: 'Created', sortable: true },
    { key: 'actions', label: 'Actions', sortable: false },
  ];
  
  return (
    <>
    <div className="h-full flex flex-col space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-white flex items-center">
            <AlertCircle className="w-7 h-7 mr-3 text-primary-600" />
            Security Incidents
          </h1>
          <p className="text-secondary-500 dark:text-secondary-400 mt-1">
            Track, manage, and respond to security incidents across your organization.
          </p>
        </div>
        <Button onClick={openCreateModal} leadingIcon={Plus}>
          Report Incident
        </Button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          title="Total Incidents" 
          value={metrics.total} 
          color="blue" 
          icon={AlertCircle} 
        />
        <MetricCard 
          title="Active Incidents" 
          value={metrics.active} 
          color="red" 
          icon={AlertTriangle} 
        />
        <MetricCard 
          title="Resolved" 
          value={metrics.resolved} 
          color="green" 
          icon={CheckCircle} 
        />
        <MetricCard 
          title="Avg. Resolution Time" 
          value={metrics.avgResolutionTime} 
          color="purple" 
          icon={Clock} 
        />
      </div>

      {/* Filters & Table Section */}
      <div className="dashboard-card flex-grow flex flex-col">
        {/* Filter Bar */}
        <div className="p-4 border-b border-secondary-200 dark:border-secondary-700">
          <div className="flex justify-between mb-4">
            <div className="text-sm text-secondary-600 dark:text-secondary-400">
              Showing <span className="font-medium">{sortedAndPaginatedIncidents.length}</span> of <span className="font-medium">{incidents.length}</span> incidents
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" className="h-10">
                <Upload className="h-4 w-4 mr-2" /> Import
              </Button>
              <Button variant="outline" className="h-10">
                <Download className="h-4 w-4 mr-2" /> Export
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <Input
              placeholder="Search by ID or title..."
              value={filters.search}
              onChange={(e) => onFilterChange('search', e.target.value)}
              onClear={() => onFilterChange('search', '')}
              leadingIcon={Search}
              className="lg:col-span-2"
            />
            <select 
              value={filters.status} 
              onChange={(e) => onFilterChange('status', e.target.value)} 
              className="w-full text-sm border-secondary-300 rounded-md dark:bg-secondary-800 dark:border-secondary-600"
            >
              <option value="">All Statuses</option>
              <option value="NEW">New</option>
              <option value="INVESTIGATING">Investigating</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
            <select 
              value={filters.severity} 
              onChange={(e) => onFilterChange('severity', e.target.value)} 
              className="w-full text-sm border-secondary-300 rounded-md dark:bg-secondary-800 dark:border-secondary-600"
            >
              <option value="">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
              <option value="INFORMATIONAL">Informational</option>
            </select>
            <select 
              value={filters.timeframe} 
              onChange={(e) => onFilterChange('timeframe', e.target.value)} 
              className="w-full text-sm border-secondary-300 rounded-md dark:bg-secondary-800 dark:border-secondary-600"
            >
              <option value="">All Time</option>
              <option value="TODAY">Today</option>
              <option value="WEEK">This Week</option>
              <option value="MONTH">This Month</option>
              <option value="QUARTER">This Quarter</option>
              <option value="YEAR">This Year</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="flex-grow overflow-x-auto">
          <table className="min-w-full divide-y divide-secondary-200 dark:divide-secondary-700">
            <thead className="bg-secondary-50 dark:bg-secondary-700/50">
              <tr>
                {columns.map(col => (
                  <th key={col.key} className="px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                    {col.sortable ? (
                      <button onClick={() => handleSort(col.key)} className="flex items-center gap-1 group">
                        {col.label}
                        <ArrowDownUp className="w-3 h-3 text-secondary-400 group-hover:text-secondary-600" />
                      </button>
                    ) : col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-secondary-800 divide-y divide-secondary-200 dark:divide-secondary-700">
              {sortedAndPaginatedIncidents.map(incident => (
                <tr key={incident.id} className="hover:bg-secondary-50 dark:hover:bg-secondary-700/50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-primary-600 dark:text-primary-300">
                    {incident.id}
                  </td>
                  <td className="px-6 py-4 max-w-sm">
                    <p className="text-sm font-semibold text-secondary-900 dark:text-white truncate" title={incident.title}>
                      {incident.title}
                    </p>
                    <p className="text-xs text-secondary-500 dark:text-secondary-400 truncate" title={incident.description}>
                      {incident.description}
                    </p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <SeverityIndicator severity={incident.severity} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <StatusBadge status={incident.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center">
                      <div className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-xs text-primary-700 dark:text-primary-300 mr-2">
                        {incident.assignedTo ? incident.assignedTo.charAt(0).toUpperCase() : '?'}
                      </div>
                      <span>{incident.assignedTo || 'Unassigned'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <TimeAgo timestamp={incident.createdAt} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleViewIncident(incident)}
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onUpdateIncident(incident.id, { ...incident, status: 'IN_PROGRESS' })}
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => handleDeleteClick(incident.id)} 
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-status-error" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-secondary-200 dark:border-secondary-700 flex items-center justify-between">
            <span className="text-sm text-secondary-600">Page {currentPage} of {totalPages}</span>
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
    </div>

    {/* Incident Create Modal */}
    <IncidentCreateModal
      isOpen={isCreateModalOpen}
      onClose={closeCreateModal}
      onSubmit={handleCreateIncident}
    />

    {/* Delete Confirmation Dialog */}
    {deleteConfirmation.isOpen && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-xl p-6 max-w-md w-full">
          <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-2">Confirm Delete</h3>
          <p className="text-secondary-600 dark:text-secondary-400 mb-4">
            Are you sure you want to delete this incident? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={handleCancelDelete}>Cancel</Button>
            <Button variant="danger" onClick={handleConfirmDelete}>Delete</Button>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

IncidentsView.propTypes = {
  incidents: PropTypes.array.isRequired,
  metrics: PropTypes.shape({
    total: PropTypes.number.isRequired,
    active: PropTypes.number.isRequired,
    resolved: PropTypes.number.isRequired,
    avgResolutionTime: PropTypes.string.isRequired
  }).isRequired,
  filters: PropTypes.shape({
    search: PropTypes.string,
    status: PropTypes.string,
    severity: PropTypes.string,
    timeframe: PropTypes.string
  }).isRequired,
  onFilterChange: PropTypes.func.isRequired,
  onAddIncident: PropTypes.func.isRequired,
  onUpdateIncident: PropTypes.func.isRequired,
  onDeleteIncident: PropTypes.func.isRequired,
  onViewIncidentDetails: PropTypes.func.isRequired
};

export default IncidentsView;
