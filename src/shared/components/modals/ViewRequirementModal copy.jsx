// src/components/modals/ViewRequirementModal.jsx
import React from 'react';
import { X, Edit, Star, Clock, Target, Shield, Building2, DollarSign, Calendar, User } from 'lucide-react';
import MaturityIndicator from '../ui/MaturityIndicator';

const ViewRequirementModal = ({ requirement, onClose, onEdit }) => {
  if (!requirement) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'In Progress': return 'bg-yellow-100 text-yellow-800';
      case 'On Hold': return 'bg-gray-100 text-gray-800';
      case 'Under Review': return 'bg-blue-100 text-blue-800';
      default: return 'bg-red-100 text-red-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Critical': return 'bg-red-100 text-red-800';
      case 'High': return 'bg-orange-100 text-orange-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getApplicabilityColor = (type) => {
    switch (type) {
      case 'Essential': return 'bg-red-100 text-red-800';
      case 'Applicable': return 'bg-green-100 text-green-800';
      case 'Not Applicable': return 'bg-gray-100 text-gray-800';
      case 'Future': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="w-full max-h-[90vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white sticky top-0 z-10">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Requirement Details</h2>
          <p className="text-sm text-gray-600 mt-1">{requirement.id}</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onEdit(requirement)}
            className="flex items-center px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </button>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Status</span>
              <Clock className="h-4 w-4 text-gray-400" />
            </div>
            <span className={`inline-flex px-2 py-1 text-sm font-semibold rounded-full ${getStatusColor(requirement.status)}`}>
              {requirement.status}
            </span>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Priority</span>
              <Target className="h-4 w-4 text-gray-400" />
            </div>
            <span className={`inline-flex px-2 py-1 text-sm font-semibold rounded-full ${getPriorityColor(requirement.priority)}`}>
              {requirement.priority}
            </span>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Progress</span>
              <div className="text-lg font-bold text-blue-600">
                {requirement.progressCompletion || 0}%
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${requirement.progressCompletion || 0}%` }}
              />
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Category</label>
              <p className="text-sm text-gray-900">{requirement.category}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Capability</label>
              <p className="text-sm text-gray-900">{requirement.capabilityId || 'Not assigned'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Progress Status</label>
              <p className="text-sm text-gray-900">{requirement.progressStatus}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Applicability</label>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getApplicabilityColor(requirement.applicability?.type)}`}>
                {requirement.applicability?.type || 'Not specified'}
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        {requirement.description && (
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
            <p className="text-gray-700 leading-relaxed">{requirement.description}</p>
          </div>
        )}

        {/* Business Value & Cost */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <Star className="h-5 w-5 mr-2 text-yellow-500" />
              Business Value
            </h3>
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-2xl font-bold text-gray-900">
                {requirement.businessValueScore || 'N/A'}
              </span>
              <span className="text-gray-500">/5.0</span>
            </div>
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map(star => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${
                    star <= (requirement.businessValueScore || 0)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-green-500" />
              Cost Estimate
            </h3>
            <div className="text-2xl font-bold text-gray-900">
              {requirement.costEstimate ? `£${requirement.costEstimate.toLocaleString()}` : 'Not specified'}
            </div>
            {requirement.costEstimate && (
              <p className="text-sm text-gray-500 mt-1">Estimated implementation cost</p>
            )}
          </div>
        </div>

        {/* Maturity Assessment */}
        {requirement.maturityLevel && (
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <Shield className="h-5 w-5 mr-2 text-purple-500" />
              Maturity Assessment
            </h3>
            <MaturityIndicator 
              level={requirement.maturityLevel.level} 
              score={requirement.maturityLevel.score} 
            />
            <p className="text-sm text-gray-600 mt-2">
              Current organizational maturity level for this requirement
            </p>
          </div>
        )}

        {/* Assignment & Timeline */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {requirement.assignee && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <User className="h-5 w-5 mr-2 text-blue-500" />
                Assignment
              </h3>
              <p className="text-gray-900">{requirement.assignee}</p>
            </div>
          )}

          {requirement.dueDate && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-red-500" />
                Due Date
              </h3>
              <p className="text-gray-900">
                {new Date(requirement.dueDate).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>
          )}
        </div>

        {/* Business Justification */}
        {requirement.businessJustification && (
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <Building2 className="h-5 w-5 mr-2 text-indigo-500" />
              Business Justification
            </h3>
            <p className="text-gray-700 leading-relaxed">{requirement.businessJustification}</p>
          </div>
        )}

        {/* Applicability Reason */}
        {requirement.applicability?.reason && (
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Applicability Notes</h3>
            <p className="text-gray-700 leading-relaxed">{requirement.applicability.reason}</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
        <button
          onClick={onClose}
          className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Close
        </button>
        <button
          onClick={() => onEdit(requirement)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit Requirement
        </button>
      </div>
    </div>
  );
};

export default ViewRequirementModal;