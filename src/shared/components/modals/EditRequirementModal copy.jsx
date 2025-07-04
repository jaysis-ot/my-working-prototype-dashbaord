// src/components/modals/EditRequirementModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Save, AlertTriangle, Star, Clock, Target, Building2, Users } from 'lucide-react';

const EditRequirementModal = ({ requirement, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    id: '',
    description: '',
    category: '',
    capabilityId: '',
    status: 'Not Started',
    priority: 'Medium',
    businessValueScore: 3,
    progressStatus: 'Feasibility',
    progressCompletion: 0,
    applicability: { type: 'Applicable', reason: '' },
    maturityLevel: { level: 'Initial', score: 1 },
    costEstimate: 0,
    businessJustification: '',
    assignee: '',
    dueDate: ''
  });

  useEffect(() => {
    if (requirement) {
      setFormData({
        id: requirement.id || '',
        description: requirement.description || '',
        category: requirement.category || '',
        capabilityId: requirement.capabilityId || '',
        status: requirement.status || 'Not Started',
        priority: requirement.priority || 'Medium',
        businessValueScore: requirement.businessValueScore || 3,
        progressStatus: requirement.progressStatus || 'Feasibility',
        progressCompletion: requirement.progressCompletion || 0,
        applicability: requirement.applicability || { type: 'Applicable', reason: '' },
        maturityLevel: requirement.maturityLevel || { level: 'Initial', score: 1 },
        costEstimate: requirement.costEstimate || 0,
        businessJustification: requirement.businessJustification || '',
        assignee: requirement.assignee || '',
        dueDate: requirement.dueDate || ''
      });
    }
  }, [requirement]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedChange = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const statusOptions = ['Not Started', 'In Progress', 'Completed', 'On Hold', 'Under Review'];
  const priorityOptions = ['Low', 'Medium', 'High', 'Critical'];
  const progressStatusOptions = ['Feasibility', 'Gathering more context', 'Completely Understood and defined', 'Not Started'];
  const applicabilityOptions = ['Essential', 'Applicable', 'Not Applicable', 'Future'];
  const maturityLevels = [
    { level: 'Initial', score: 1 },
    { level: 'Developing', score: 2 },
    { level: 'Defined', score: 3 },
    { level: 'Managed', score: 4 },
    { level: 'Optimizing', score: 5 }
  ];

  return (
    <div className="w-full max-h-[90vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white sticky top-0 z-10">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Edit Requirement</h2>
          <p className="text-sm text-gray-600 mt-1">{formData.id}</p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="h-5 w-5 text-gray-400" />
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ID *
            </label>
            <input
              type="text"
              value={formData.id}
              onChange={(e) => handleInputChange('id', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Detailed description of the requirement..."
          />
        </div>

        {/* Status and Priority */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Progress Status *
            </label>
            <select
              value={formData.progressStatus}
              onChange={(e) => handleInputChange('progressStatus', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {progressStatusOptions.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <select
              value={formData.priority}
              onChange={(e) => handleInputChange('priority', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {priorityOptions.map(priority => (
                <option key={priority} value={priority}>{priority}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Progress Completion */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Progress Completion: {formData.progressCompletion}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={formData.progressCompletion}
            onChange={(e) => handleInputChange('progressCompletion', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${formData.progressCompletion}%, #e5e7eb ${formData.progressCompletion}%, #e5e7eb 100%)`
            }}
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Business Value and Cost */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business Value (1-5)
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min="1"
                max="5"
                step="0.1"
                value={formData.businessValueScore}
                onChange={(e) => handleInputChange('businessValueScore', parseFloat(e.target.value))}
                className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${
                      star <= formData.businessValueScore
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cost Estimate (£)
            </label>
            <input
              type="number"
              value={formData.costEstimate}
              onChange={(e) => handleInputChange('costEstimate', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0"
            />
          </div>
        </div>

        {/* Applicability and Maturity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Applicability
            </label>
            <select
              value={formData.applicability.type}
              onChange={(e) => handleNestedChange('applicability', 'type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {applicabilityOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maturity Level
            </label>
            <select
              value={formData.maturityLevel.level}
              onChange={(e) => {
                const selectedLevel = maturityLevels.find(l => l.level === e.target.value);
                handleNestedChange('maturityLevel', 'level', selectedLevel.level);
                handleNestedChange('maturityLevel', 'score', selectedLevel.score);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {maturityLevels.map(level => (
                <option key={level.level} value={level.level}>
                  {level.level} (Score: {level.score})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Assignment and Due Date */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assignee
            </label>
            <input
              type="text"
              value={formData.assignee}
              onChange={(e) => handleInputChange('assignee', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Assigned person or team"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Due Date
            </label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => handleInputChange('dueDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Business Justification */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Business Justification
          </label>
          <textarea
            value={formData.businessJustification}
            onChange={(e) => handleInputChange('businessJustification', e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Provide business justification for this requirement..."
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditRequirementModal;