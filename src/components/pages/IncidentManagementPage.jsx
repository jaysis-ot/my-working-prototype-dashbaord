import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, AlertTriangle, Search, Filter, Plus, RefreshCw, Trash2, Edit, Eye } from 'lucide-react';

/**
 * IncidentManagementPage Component
 * 
 * A simple incident management dashboard that provides:
 * - Basic dashboard view with incident statistics
 * - Mock incident data generation
 * - Filtering and search functionality
 * - Placeholder for incident creation and management
 */
const IncidentManagementPage = () => {
  // State for incidents and UI
  const [incidents, setIncidents] = useState([]);
  const [filteredIncidents, setFilteredIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  
  // Mock metrics
  const [metrics, setMetrics] = useState({
    total: 0,
    open: 0,
    critical: 0,
    resolved: 0
  });

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
    
    // Simulate API call delay
    setTimeout(() => {
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
      CRITICAL: 'bg-red-100 text-red-800',
      HIGH: 'bg-orange-100 text-orange-800',
      MEDIUM: 'bg-yellow-100 text-yellow-800',
      LOW: 'bg-blue-100 text-blue-800',
      INFORMATIONAL: 'bg-gray-100 text-gray-800'
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
      NEW: 'bg-purple-100 text-purple-800',
      INVESTIGATING: 'bg-blue-100 text-blue-800',
      IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
      RESOLVED: 'bg-green-100 text-green-800',
      CLOSED: 'bg-gray-100 text-gray-800'
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
    // Simulate refresh delay
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };
  
  // Loading state
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center">
          <RefreshCw className="w-12 h-12 text-primary-600 animate-spin" />
          <p className="mt-4 text-secondary-600">Loading incidents...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="h-full p-6 overflow-auto">
      <div className="flex flex-col space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">
              Incident Management
            </h1>
            <p className="text-secondary-500 mt-1">
              Monitor and manage security incidents
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              className="p-2 rounded-md bg-secondary-100 hover:bg-secondary-200 text-secondary-700 transition-colors"
              aria-label="Refresh incidents"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            
            <button
              className="px-4 py-2 rounded-md bg-primary-600 hover:bg-primary-700 text-white font-medium flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>New Incident</span>
            </button>
          </div>
        </div>
        
        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Incidents */}
          <div className="bg-white rounded-lg shadow-sm p-4 border border-secondary-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-500">
                  Total Incidents
                </p>
                <p className="text-2xl font-bold text-secondary-900 mt-1">
                  {metrics.total}
                </p>
              </div>
              <div className="p-2 bg-primary-100 rounded-md">
                <AlertCircle className="w-5 h-5 text-primary-600" />
              </div>
            </div>
          </div>
          
          {/* Open Incidents */}
          <div className="bg-white rounded-lg shadow-sm p-4 border border-secondary-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-500">
                  Open Incidents
                </p>
                <p className="text-2xl font-bold text-secondary-900 mt-1">
                  {metrics.open}
                </p>
              </div>
              <div className="p-2 bg-yellow-100 rounded-md">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
          </div>
          
          {/* Critical Incidents */}
          <div className="bg-white rounded-lg shadow-sm p-4 border border-secondary-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-500">
                  Critical Incidents
                </p>
                <p className="text-2xl font-bold text-secondary-900 mt-1">
                  {metrics.critical}
                </p>
              </div>
              <div className="p-2 bg-red-100 rounded-md">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </div>
          
          {/* Resolved Incidents */}
          <div className="bg-white rounded-lg shadow-sm p-4 border border-secondary-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-500">
                  Resolved Incidents
                </p>
                <p className="text-2xl font-bold text-secondary-900 mt-1">
                  {metrics.resolved}
                </p>
              </div>
              <div className="p-2 bg-green-100 rounded-md">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Filter Toolbar */}
        <div className="bg-white rounded-lg shadow-sm p-4 border border-secondary-200">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-secondary-400" aria-hidden="true" />
                </div>
                <input
                  type="text"
                  placeholder="Search incidents..."
                  className="block w-full pl-10 pr-3 py-2 border border-secondary-300 rounded-md bg-white text-secondary-900 placeholder-secondary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            {/* Status Filter */}
            <div className="w-full md:w-48">
              <select
                className="block w-full pl-3 pr-10 py-2 border border-secondary-300 rounded-md bg-white text-secondary-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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
                className="block w-full pl-3 pr-10 py-2 border border-secondary-300 rounded-md bg-white text-secondary-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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
                className="flex items-center justify-center w-full px-4 py-2 border border-secondary-300 rounded-md bg-white text-secondary-900 hover:bg-secondary-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <Filter className="w-4 h-4 mr-2" />
                <span>Reset</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Incidents Table */}
        <div className="flex-1 overflow-hidden flex flex-col bg-white rounded-lg shadow-sm border border-secondary-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-secondary-200">
              <thead className="bg-secondary-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Severity
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              
              <tbody className="bg-white divide-y divide-secondary-200">
                {filteredIncidents.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-secondary-500">
                      No incidents found
                    </td>
                  </tr>
                ) : (
                  filteredIncidents.map((incident) => (
                    <tr key={incident.id} className="hover:bg-secondary-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">
                        {incident.id}
                      </td>
                      <td className="px-6 py-4 text-sm text-secondary-900">
                        <div className="font-medium">{incident.title}</div>
                        <div className="text-xs text-secondary-500">
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                        {formatDate(incident.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button className="text-primary-600 hover:text-primary-900" aria-label="View incident details">
                            <Eye className="w-5 h-5" />
                          </button>
                          <button className="text-blue-600 hover:text-blue-900" aria-label="Edit incident">
                            <Edit className="w-5 h-5" />
                          </button>
                          <button className="text-red-600 hover:text-red-900" aria-label="Delete incident">
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
          
          {/* Pagination Placeholder */}
          <div className="px-6 py-3 border-t border-secondary-200 flex items-center justify-between">
            <div className="text-sm text-secondary-700">
              Showing <span className="font-medium">{filteredIncidents.length}</span> of <span className="font-medium">{incidents.length}</span> incidents
            </div>
            
            <div className="flex items-center space-x-2">
              <button className="px-3 py-1 border border-secondary-300 rounded bg-white text-secondary-700 hover:bg-secondary-50">
                Previous
              </button>
              <button className="px-3 py-1 border border-secondary-300 rounded bg-white text-secondary-700 hover:bg-secondary-50">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncidentManagementPage;
