// src/components/views/CapabilitiesView.jsx
import React, { useState } from 'react';
import { 
  Network, ArrowRight, Star, DollarSign, Plus, Filter, Search,
  CheckCircle, Clock, AlertTriangle, Users, Target, Settings,
  TrendingUp, Calendar, FileText
} from 'lucide-react';

/**
 * Capabilities View Component
 * 
 * Displays and manages security capabilities with their associated requirements,
 * progress tracking, and business metrics. Provides an overview of all capabilities
 * and allows users to drill down into specific capability details.
 * 
 * Features:
 * - Grid layout of capability cards
 * - Progress tracking for each capability
 * - Business value and ROI metrics
 * - Capability creation and management
 * - Requirement filtering by capability
 * - Search and filter functionality
 * - Responsive design
 */
const CapabilitiesView = ({
  state,
  dispatch,
  currentTheme,
  companyProfile,
  requirements = [],
  capabilities = [],
  filteredRequirements = [],
  onSelectCapability,
  onCreateCapability,
  handleFilterChange
}) => {

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name'); // 'name', 'progress', 'business-value', 'roi'

  // Filter and sort capabilities
  const getFilteredCapabilities = () => {
    let filtered = capabilities.filter(capability => {
      const matchesSearch = capability.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           capability.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || capability.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    // Sort capabilities
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'progress':
          const aProgress = getCapabilityProgress(a.id);
          const bProgress = getCapabilityProgress(b.id);
          return bProgress.completionRate - aProgress.completionRate;
        case 'business-value':
          return (b.businessValue || 0) - (a.businessValue || 0);
        case 'roi':
          return (b.estimatedROI || 0) - (a.estimatedROI || 0);
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return filtered;
  };

  // Calculate progress for a capability
  const getCapabilityProgress = (capabilityId) => {
    const capabilityRequirements = requirements.filter(req => req.capabilityId === capabilityId);
    const totalRequirements = capabilityRequirements.length;
    const completedRequirements = capabilityRequirements.filter(req => req.status === 'Completed').length;
    const inProgressRequirements = capabilityRequirements.filter(req => req.status === 'In Progress').length;
    const notStartedRequirements = capabilityRequirements.filter(req => req.status === 'Not Started').length;
    
    const completionRate = totalRequirements > 0 ? (completedRequirements / totalRequirements) * 100 : 0;
    
    return {
      total: totalRequirements,
      completed: completedRequirements,
      inProgress: inProgressRequirements,
      notStarted: notStartedRequirements,
      completionRate: Math.round(completionRate)
    };
  };

  // Get status badge styling
  const getStatusBadge = (status) => {
    const statusConfig = {
      'Planning': { bg: 'bg-blue-100', text: 'text-blue-800', dot: 'bg-blue-400' },
      'In Progress': { bg: 'bg-yellow-100', text: 'text-yellow-800', dot: 'bg-yellow-400' },
      'Completed': { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-400' },
      'On Hold': { bg: 'bg-gray-100', text: 'text-gray-800', dot: 'bg-gray-400' }
    };

    const config = statusConfig[status] || statusConfig['Planning'];
    
    return (
      <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <div className={`w-2 h-2 rounded-full mr-2 ${config.dot}`}></div>
        {status}
      </div>
    );
  };

  // Handle capability selection
  const handleCapabilityClick = (capabilityId) => {
    if (onSelectCapability) {
      onSelectCapability(capabilityId);
    }
  };

  // Handle new capability creation
  const handleCreateNew = () => {
    dispatch({ type: 'TOGGLE_NEW_CAPABILITY_MODAL' });
  };

  const filteredCapabilities = getFilteredCapabilities();

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6">
          <div className="mb-4 lg:mb-0">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center">
              <Network className="h-6 w-6 mr-3 text-blue-600" />
              Security Capabilities
            </h3>
            <p className="text-gray-600 mt-1">
              Manage capabilities and their associated requirements and progress
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="text-sm text-gray-500">
              {filteredCapabilities.length} of {capabilities.length} capabilities • {requirements.length} total requirements
            </div>
            <button
              onClick={handleCreateNew}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Capability
            </button>
          </div>
        </div>

        {/* Search and Filter Controls */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search capabilities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="Planning">Planning</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="On Hold">On Hold</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="name">Name</option>
              <option value="progress">Progress</option>
              <option value="business-value">Business Value</option>
              <option value="roi">ROI</option>
            </select>
          </div>
        </div>
      </div>

      {/* Capabilities Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredCapabilities.map((capability) => {
          const progress = getCapabilityProgress(capability.id);
          
          return (
            <div 
              key={capability.id} 
              className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-blue-300 transition-all duration-300 cursor-pointer group"
              onClick={() => handleCapabilityClick(capability.id)}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center mb-2">
                    <h4 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                      {capability.name}
                    </h4>
                    <ArrowRight className="h-4 w-4 ml-2 text-gray-400 group-hover:text-blue-600 transition-colors flex-shrink-0" />
                  </div>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                    {capability.id}
                  </span>
                </div>
                <div className="ml-4">
                  {getStatusBadge(capability.status)}
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                {capability.description}
              </p>

              {/* Progress Section */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Progress</span>
                  <span className="text-sm font-bold text-gray-900">{progress.completionRate}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${progress.completionRate}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{progress.completed} completed</span>
                  <span>{progress.total} total</span>
                </div>
              </div>

              {/* Status Breakdown */}
              <div className="grid grid-cols-3 gap-2 mb-4 text-xs">
                <div className="text-center p-2 bg-green-50 rounded-lg">
                  <CheckCircle className="h-3 w-3 text-green-600 mx-auto mb-1" />
                  <div className="font-semibold text-green-800">{progress.completed}</div>
                  <div className="text-green-600">Done</div>
                </div>
                <div className="text-center p-2 bg-yellow-50 rounded-lg">
                  <Clock className="h-3 w-3 text-yellow-600 mx-auto mb-1" />
                  <div className="font-semibold text-yellow-800">{progress.inProgress}</div>
                  <div className="text-yellow-600">Active</div>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <AlertTriangle className="h-3 w-3 text-gray-600 mx-auto mb-1" />
                  <div className="font-semibold text-gray-800">{progress.notStarted}</div>
                  <div className="text-gray-600">Pending</div>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center mb-1">
                    <Star className="h-3 w-3 text-yellow-500 mr-1" />
                    <span className="text-gray-600 text-xs">Business Value</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {capability.businessValue || 0}/5.0
                  </span>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center mb-1">
                    <DollarSign className="h-3 w-3 text-green-500 mr-1" />
                    <span className="text-gray-600 text-xs">Est. ROI</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {capability.estimatedROI || 0}%
                  </span>
                </div>
              </div>

              {/* Additional Info */}
              <div className="mt-4 pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center">
                    <Users className="h-3 w-3 mr-1" />
                    <span>{capability.assignedTeam || 'Unassigned'}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    <span>{capability.targetDate || 'No deadline'}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredCapabilities.length === 0 && (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <Network className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || statusFilter !== 'all' ? 'No capabilities found' : 'No capabilities yet'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria.'
              : 'Get started by creating your first security capability.'
            }
          </p>
          {(!searchTerm && statusFilter === 'all') && (
            <button
              onClick={handleCreateNew}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create First Capability
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default CapabilitiesView;