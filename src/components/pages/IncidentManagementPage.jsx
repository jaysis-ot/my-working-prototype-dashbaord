import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, AlertTriangle, Search, Filter, Plus, RefreshCw, Trash2, Edit, Eye } from 'lucide-react';
import IncidentCreateModal from '../molecules/IncidentCreateModal';
import LoadingSpinner from '../atoms/LoadingSpinner';
import ErrorDisplay from '../molecules/ErrorDisplay';

/**
 * IncidentManagementPage Component
 * 
 * A comprehensive incident management dashboard that provides:
 * - Dashboard view with incident statistics
 * - Mock incident data generation  
 * - Filtering and search functionality
 * - Incident creation and management
 */
const IncidentManagementPage = () => {
  // State for incidents and UI
  const [incidents, setIncidents] = useState([]);
  const [filteredIncidents, setFilteredIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  
  // Mock metrics
  const [metrics, setMetrics] = useState({
    total: 0,
    open: 0,
    critical: 0,
    resolved: 0
  });

  /**
   * Handle creation of a new incident from the modal
   */
  const handleCreateIncident = (newIncident) => {
    setIncidents((prev) => [newIncident, ...prev]);
    setFilteredIncidents((prev) => [newIncident, ...prev]);

    // Update metrics accordingly
    setMetrics((prev) => ({
      ...prev,
      total: prev.total + 1,
      open: prev.open + 1,
      critical: newIncident.severity === 'CRITICAL' ? prev.critical + 1 : prev.critical,
    }));
  };

  // Generate mock incident data
  useEffect(() => {
    const generateMockIncidents = () => {
      const statuses = ['NEW', 'INVESTIGATING', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
      const severities = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFORMATIONAL'];
      const types = ['SECURITY_BREACH', 'MALWARE', 'PHISHING', 'UNAUTHORIZED_ACCESS', 'DATA_LEAK'];
      
      const mockData = Array.from({ length: 15 }, (_, i) => {
        const createdAt = new Date();
        createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 30));
        
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const severity = severities[Math.floor(Math.random() * severities.length)];
        
        return {
          id: `INC-${1000 + i}`,
          title: `Incident ${i + 1}: ${types[Math.floor(Math.random() * types.length)].replace('_', ' ')}`,
          description: `This is a mock ${severity.toLowerCase()} severity incident for testing purposes.`,
          status,
          severity,
          createdAt: createdAt.toISOString(),
          assignedTo: Math.random() > 0.3 ? 'John Doe' : null,
          resolvedAt: status === 'RESOLVED' || status === 'CLOSED' 
            ? new Date(createdAt.getTime() + Math.random() * 86400000 * 3).toISOString() 
            : null,
        };
      });
      
      return mockData;
    };
    
    setLoading(true);
    setError(null);
    
    // Simulate API call delay
    setTimeout(() => {
      try {
        const mockIncidents = generateMockIncidents();
        setIncidents(mockIncidents);
        setFilteredIncidents(mockIncidents);
        
        // Calculate metrics
        const openIncidents = mockIncidents.filter(i => 
          i.status !== 'RESOLVED' && i.status !== 'CLOSED'
        );
        
        const criticalIncidents = mockIncidents.filter(i => 
          i.severity === 'CRITICAL'
        );
        
        const resolvedIncidents = mockIncidents.filter(i => 
          i.status === 'RESOLVED' || i.status === 'CLOSED'
        );
        
        setMetrics({
          total: mockIncidents.length,
          open: openIncidents.length,
          critical: criticalIncidents.length,
          resolved: resolvedIncidents.length
        });
        
        setLoading(false);
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    }, 1000);
  }, []);
  
  // Filter incidents based on search term and filters
  useEffect(() => {
    let result = [...incidents];
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(incident => 
        incident.title.toLowerCase().includes(term) || 
        incident.description.toLowerCase().includes(term) ||
        incident.id.toLowerCase().includes(term)
      );
    }
    
    // Apply status filter
    if (statusFilter) {
      result = result.filter(incident => incident.status === statusFilter);
    }
    
    // Apply severity filter
    if (severityFilter) {
      result = result.filter(incident => incident.severity === severityFilter);
    }
    
    setFilteredIncidents(result);
  }, [incidents, searchTerm, statusFilter, severityFilter]);
  
  // Format date for display
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString();
  };
  
  // Get severity badge
  const getSeverityBadge = (severity) => {
    const classes = {
      CRITICAL: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      HIGH: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
      MEDIUM: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      LOW: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      INFORMATIONAL: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${classes[severity] || classes.MEDIUM}`}>
        {severity}
      </span>
    );
  };
  
  // Get status badge
  const getStatusBadge = (status) => {
    const classes = {
      NEW: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      INVESTIGATING: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      IN_PROGRESS: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      RESOLVED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      CLOSED: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${classes[status] || classes.NEW}`}>
        {status.replace(/_/g, ' ')}
      </span>
    );
  };
  
  // Handle refresh
  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  // --- Render Logic Following RiskManagementPage Pattern ---

  if (loading) {
    return (
      <div className="fade-in h-full flex flex-col">
        <div className="flex items-center justify-center h-full">
          <LoadingSpinner size="lg" message="Loading Incident Management..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fade-in h-full flex flex-col">
        <ErrorDisplay
          title="Failed to Load Incident Data"
          message={error.message || 'An unexpected error occurred. Please try refreshing the page.'}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }
  
  return (
    <div className="fade-in h-full flex flex-col">
      <div className="h-full p-6 overflow-auto">
        <div className="flex flex-col space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Incident Management
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Monitor and manage security incidents
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                className="p-2 rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 transition-colors"
                aria-label="Refresh incidents"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              
              <button
                onClick={() => setCreateModalOpen(true)}
                className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium flex items-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>New Incident</span>
              </button>
            </div>
          </div>
          
          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Incidents */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Total Incidents
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {metrics.total}
                  </p>
                </div>
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-md">
                  <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>
            
            {/* Open Incidents */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Open Incidents
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {metrics.open}
                  </p>
                </div>
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-md">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
            </div>
            
            {/* Critical Incidents */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Critical Incidents
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {metrics.critical}
                  </p>
                </div>
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-md">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
              </div>
            </div>
            
            {/* Resolved Incidents */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Resolved Incidents
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {metrics.resolved}
                  </p>
                </div>
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-md">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>
          </div>
          
          {/* Filter Toolbar */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search incidents..."
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              {/* Status Filter */}
              <div className="w-full md:w-48">
                <select
                  className="block w-full pl-3 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All Statuses</option>
                  <option value="NEW">New</option>
                  <option value="INVESTIGATING">Investigating</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </div>
              
              {/* Severity Filter */}
              <div className="w-full md:w-48">
                <select
                  className="block w-full pl-3 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value)}
                >
                  <option value="">All Severities</option>
                  <option value="CRITICAL">Critical</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                  <option value="INFORMATIONAL">Informational</option>
                </select>
              </div>
              
              {/* Reset Filters */}
              <div>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('');
                    setSeverityFilter('');
                  }}
                  className="flex items-center justify-center w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  <span>Reset</span>
                </button>
              </div>
            </div>
          </div>
          
          {/* Incidents Table */}
          <div className="flex-1 overflow-hidden flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Title
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Severity
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Created
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredIncidents.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                        No incidents found
                      </td>
                    </tr>
                  ) : (
                    filteredIncidents.map((incident) => (
                      <tr key={incident.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {incident.id}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                          <div className="font-medium">{incident.title}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {incident.description.length > 60 
                              ? `${incident.description.substring(0, 60)}...` 
                              : incident.description}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(incident.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getSeverityBadge(incident.severity)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(incident.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300" aria-label="View incident details">
                              <Eye className="w-5 h-5" />
                            </button>
                            <button className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300" aria-label="Edit incident">
                              <Edit className="w-5 h-5" />
                            </button>
                            <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300" aria-label="Delete incident">
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Showing <span className="font-medium">{filteredIncidents.length}</span> of <span className="font-medium">{incidents.length}</span> incidents
              </div>
              
              <div className="flex items-center space-x-2">
                <button className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600">
                  Previous
                </button>
                <button className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600">
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Create Incident Modal */}
        <IncidentCreateModal
          isOpen={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          onSubmit={handleCreateIncident}
        />
      </div>
    </div>
  );
};

export default IncidentManagementPage;