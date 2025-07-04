// src/components/views/CapabilitiesView.jsx
import React from 'react';
import { 
  Network, Plus, ArrowRight, Star, DollarSign, CheckCircle,
  Clock, Target, TrendingUp, Users, Calendar
} from 'lucide-react';

const CapabilitiesView = ({ 
  capabilities,
  requirements,
  onSelectCapability,
  onCreateCapability,
  loading = false
}) => {
  const getStatusColor = (status) => {
    const statusColors = {
      'In Progress': 'bg-yellow-100 text-yellow-800',
      'Completed': 'bg-green-100 text-green-800',
      'Planning': 'bg-blue-100 text-blue-800',
      'On Hold': 'bg-red-100 text-red-800',
      'Not Started': 'bg-gray-100 text-gray-800'
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };

  const calculateMetrics = (capability) => {
    const capabilityRequirements = requirements.filter(req => req.capabilityId === capability.id);
    const totalRequirements = capabilityRequirements.length;
    const completedRequirements = capabilityRequirements.filter(req => req.status === 'Completed').length;
    const inProgressRequirements = capabilityRequirements.filter(req => req.status === 'In Progress').length;
    const completionRate = totalRequirements > 0 ? (completedRequirements / totalRequirements) * 100 : 0;
    
    return {
      totalRequirements,
      completedRequirements,
      inProgressRequirements,
      completionRate
    };
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-gray-200 h-48 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6">
          <div className="mb-4 lg:mb-0">
            <h3 className="text-2xl font-bold text-gray-900 flex items-center">
              <Network className="h-7 w-7 mr-3 text-blue-600" />
              OT Security Capabilities
            </h3>
            <p className="text-gray-600 mt-2">
              Manage capabilities and their associated requirements and PCDs
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="text-sm text-gray-500">
              <div className="flex items-center space-x-4">
                <span className="flex items-center">
                  <Network className="h-4 w-4 mr-1" />
                  {capabilities.length} capabilities
                </span>
                <span className="flex items-center">
                  <Target className="h-4 w-4 mr-1" />
                  {requirements.length} total requirements
                </span>
              </div>
            </div>
            
            <button
              onClick={onCreateCapability}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              disabled={loading}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Capability
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Capabilities</p>
                <p className="text-2xl font-bold text-blue-900">{capabilities.length}</p>
              </div>
              <Network className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Completed</p>
                <p className="text-2xl font-bold text-green-900">
                  {capabilities.filter(c => c.status === 'Completed').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">In Progress</p>
                <p className="text-2xl font-bold text-yellow-900">
                  {capabilities.filter(c => c.status === 'In Progress').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Avg ROI</p>
                <p className="text-2xl font-bold text-purple-900">
                  {capabilities.length > 0 
                    ? Math.round(capabilities.reduce((sum, c) => sum + (c.estimatedROI || 0), 0) / capabilities.length)
                    : 0}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Capabilities Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {capabilities.map((capability) => {
            const metrics = calculateMetrics(capability);
            
            return (
              <div 
                key={capability.id} 
                className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-blue-300 transition-all duration-300 cursor-pointer group"
                onClick={() => onSelectCapability(capability.id)}
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
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(capability.status)}`}>
                    {capability.status}
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
                    <span className="text-sm font-bold text-gray-900">
                      {metrics.completionRate.toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${metrics.completionRate}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{metrics.completedRequirements} completed</span>
                    <span>{metrics.totalRequirements} total</span>
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
                      {capability.businessValue}/5.0
                    </span>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center mb-1">
                      <DollarSign className="h-3 w-3 text-green-500 mr-1" />
                      <span className="text-gray-600 text-xs">Est. ROI</span>
                    </div>
                    <span className="font-semibold text-gray-900">
                      {capability.estimatedROI}%
                    </span>
                  </div>
                </div>

                {/* Additional Info */}
                {(capability.assignee || capability.dueDate) && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      {capability.assignee && (
                        <div className="flex items-center">
                          <Users className="h-3 w-3 mr-1" />
                          <span>{capability.assignee}</span>
                        </div>
                      )}
                      {capability.dueDate && (
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          <span>{new Date(capability.dueDate).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {capabilities.length === 0 && (
          <div className="text-center py-12">
            <Network className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No capabilities yet</h3>
            <p className="text-gray-500 mb-4">
              Get started by creating your first capability to organize your requirements.
            </p>
            <button
              onClick={onCreateCapability}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create First Capability
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CapabilitiesView;