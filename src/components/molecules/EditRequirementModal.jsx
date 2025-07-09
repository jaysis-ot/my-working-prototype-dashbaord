// src/components/modals/EditRequirementModal.jsx
import React, { useState } from 'react';
import { X, Save, FileText } from 'lucide-react';

const EditRequirementModal = ({ requirement, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: requirement?.title || '',
    description: requirement?.description || '',
    status: requirement?.status || 'Not Started',
    priority: requirement?.priority || 'Medium',
    area: requirement?.area || 'Technical',
    type: requirement?.type || 'Control',
    costEstimate: requirement?.costEstimate || 0,
    businessValue: {
      score: requirement?.businessValue?.score || 3,
      level: requirement?.businessValue?.level || 'Medium'
    },
    applicability: {
      type: requirement?.applicability?.type || 'Applicable',
      justification: requirement?.applicability?.justification || ''
    }
  });

  const [saving, setSaving] = useState(false);

  const statusOptions = ['Not Started', 'In Progress', 'Completed', 'On Hold', 'Blocked'];
  const priorityOptions = ['Critical', 'High', 'Medium', 'Low'];
  const areaOptions = ['Technical', 'Governance', 'Operations', 'Risk', 'Compliance'];
  const typeOptions = ['Control', 'Policy', 'Procedure', 'Assessment', 'Documentation'];
  const applicabilityOptions = ['Applicable', 'Not Applicable', 'Partially Applicable'];

  const businessValueLevels = {
    1: 'Very Low',
    2: 'Low', 
    3: 'Medium',
    4: 'High',
    5: 'Very High'
  };

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleBusinessValueChange = (score) => {
    setFormData(prev => ({
      ...prev,
      businessValue: {
        score: parseInt(score),
        level: businessValueLevels[score]
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const updatedRequirement = {
        ...requirement,
        ...formData,
        lastUpdated: new Date().toISOString().split('T')[0]
      };

      await onSave(updatedRequirement);
      onClose();
    } catch (error) {
      console.error('Error saving requirement:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              {requirement ? 'Edit Requirement' : 'Create Requirement'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter requirement title"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter detailed description"
              required
            />
          </div>

          {/* Status and Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {statusOptions.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => handleInputChange('priority', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {priorityOptions.map(priority => (
                  <option key={priority} value={priority}>{priority}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Area and Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Area</label>
              <select
                value={formData.area}
                onChange={(e) => handleInputChange('area', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {areaOptions.map(area => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {typeOptions.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Business Value and Cost */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Value (1-5)
              </label>
              <div className="space-y-2">
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={formData.businessValue.score}
                  onChange={(e) => handleBusinessValueChange(e.target.value)}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Very Low</span>
                  <span className="font-medium text-gray-700">{formData.businessValue.level}</span>
                  <span>Very High</span>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cost Estimate ($)</label>
              <input
                type="number"
                value={formData.costEstimate}
                onChange={(e) => handleInputChange('costEstimate', parseInt(e.target.value) || 0)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0"
                min="0"
              />
            </div>
          </div>

          {/* Applicability */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Applicability</label>
            <div className="space-y-3">
              <select
                value={formData.applicability.type}
                onChange={(e) => handleInputChange('applicability.type', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {applicabilityOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              <textarea
                value={formData.applicability.justification}
                onChange={(e) => handleInputChange('applicability.justification', e.target.value)}
                rows={2}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Justification for applicability..."
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save Requirement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditRequirementModal;