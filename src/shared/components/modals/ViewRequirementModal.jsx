// src/components/modals/ViewRequirementModal.jsx
import React from 'react';
import { 
  X, 
  FileText, 
  Calendar, 
  DollarSign, 
  BarChart3, 
  CheckCircle, 
  AlertCircle,
  Clock,
  Pause,
  Edit
} from 'lucide-react';

const ViewRequirementModal = ({ requirement, onClose, onEdit }) => {
  if (!requirement) return null;

  const statusConfig = {
    'Not Started': { icon: AlertCircle, color: 'text-gray-600', bg: 'bg-gray-100' },
    'In Progress': { icon: Clock, color: 'text-blue-600', bg: 'bg-blue-100' },
    'Completed': { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
    'On Hold': { icon: Pause, color: 'text-yellow-600', bg: 'bg-yellow-100' },
    'Blocked': { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100' }
  };

  const priorityConfig = {
    'Critical': { color: 'text-red-700', bg: 'bg-red-100' },
    'High': { color: 'text-orange-700', bg: 'bg-orange-100' },
    'Medium': { color: 'text-yellow-700', bg: 'bg-yellow-100' },
    'Low': { color: 'text-green-700', bg: 'bg-green-100' }
  };

  const StatusIcon = statusConfig[requirement.status]?.icon || AlertCircle;
  const statusStyle = statusConfig[requirement.status] || statusConfig['Not Started'];
  const priorityStyle = priorityConfig[requirement.priority] || priorityConfig['Medium'];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Requirement Details</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(requirement)}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Edit Requirement"
            >
              <Edit className="h-5 w-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">{requirement.title}</h3>
              <span className="text-sm text-gray-500">ID: {requirement.id}</span>
            </div>
            <p className="text-gray-700 leading-relaxed">{requirement.description}</p>
          </div>

          {/* Status and Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusStyle.bg} ${statusStyle.color}`}>
                <StatusIcon className="h-4 w-4 mr-2" />
                {requirement.status}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${priorityStyle.bg} ${priorityStyle.color}`}>
                {requirement.priority}
              </span>
            </div>
          </div>

          {/* Area and Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Area</label>
              <p className="text-gray-900">{requirement.area}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <p className="text-gray-900">{requirement.type}</p>
            </div>
          </div>

          {/* Business Value and Cost */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Business Value</label>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-gray-400" />
                <span className="text-gray-900">{requirement.businessValue?.level || 'N/A'}</span>
                <span className="text-sm text-gray-500">({requirement.businessValue?.score || 0}/5)</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cost Estimate</label>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-gray-400" />
                <span className="text-gray-900">{formatCurrency(requirement.costEstimate || 0)}</span>
              </div>
            </div>
          </div>

          {/* Maturity Level */}
          {requirement.maturityLevel && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Maturity Level</label>
              <div className="flex items-center gap-2">
                <span className="text-gray-900">{requirement.maturityLevel.level}</span>
                <span className="text-sm text-gray-500">(Score: {requirement.maturityLevel.score})</span>
              </div>
            </div>
          )}

          {/* Applicability */}
          {requirement.applicability && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Applicability</label>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="font-medium text-gray-900">{requirement.applicability.type}</p>
                {requirement.applicability.justification && (
                  <p className="text-sm text-gray-600 mt-1">{requirement.applicability.justification}</p>
                )}
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Created</label>
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">{requirement.createdAt?.split('T')[0] || 'N/A'}</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Last Updated</label>
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">{requirement.lastUpdated || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => onEdit(requirement)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Edit Requirement
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewRequirementModal;