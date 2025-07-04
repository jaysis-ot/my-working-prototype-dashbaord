// src/components/modals/EditRequirementModal.jsx
import React, { useState, useCallback } from 'react';
import { X, Save, RefreshCw } from 'lucide-react';
import { PROGRESS_STATUSES, CATEGORIES } from '../../constants';

const EditRequirementModal = ({ requirement, onClose, onSave }) => {
  const [formData, setFormData] = useState(requirement);
  const [saving, setSaving] = useState(false);

  const handleChange = useCallback((field, value) => {
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
  }, []);

  // Handle progress status change - automatically update progress percentage
  const handleProgressStatusChange = useCallback((progressStatus) => {
    const statusData = PROGRESS_STATUSES[progressStatus];
    setFormData(prev => ({
      ...prev,
      progressStatus: progressStatus,
      progress: statusData.percentage
    }));
  }, []);

  // Handle status change - auto-set progress status for "Not Started"
  const handleStatusChange = useCallback((status) => {
    let updates = { status };
    if (status === 'Not Started') {
      updates.progressStatus = 'Not Started';
      updates.progress = 0;
    }
    setFormData(prev => ({ ...prev, ...updates }));
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const success = await onSave(requirement.id, formData);
      if (success) {
        onClose();
      }
    } catch (error) {
      console.error('Error saving requirement:', error);
    } finally {
      setSaving(false);
    }
  }, [formData, requirement.id, onSave, onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-full max-h-[95vh] flex flex-col">
        {/* Fixed Header */}
        <div className="flex-shrink-0 bg-white border-b border-gray-200 p-4 sm:p-6 flex items-center justify-between rounded-t-xl">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Edit Requirement</h2>
            <p className="text-gray-600 text-sm sm:text-base">{requirement.id}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg flex-shrink-0">
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>
        
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-4 sm:p-6">
            <div className="space-y-4 sm:space-y-6">
              {/* Basic Information - 2 columns on larger screens */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ID *</label>
                  <input
                    type="text"
                    value={formData.id}
                    onChange={(e) => handleChange('id', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleChange('category', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select Category</option>
                    {CATEGORIES.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Progress Status and Priority */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Progress Status *</label>
                  <select
                    value={formData.progressStatus || 'Not Started'}
                    onChange={(e) => handleProgressStatusChange(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {Object.keys(PROGRESS_STATUSES).map(status => (
                      <option key={status} value={status}>
                        {status} ({PROGRESS_STATUSES[status].percentage}%)
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    {PROGRESS_STATUSES[formData.progressStatus || 'Not Started']?.description}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => handleChange('priority', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Priority</option>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              {/* Progress Indicator */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Progress Completion</span>
                  <span className="text-sm font-bold text-gray-900">{formData.progress || 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="h-3 rounded-full transition-all duration-300" 
                    style={{ 
                      width: `${formData.progress || 0}%`,
                      backgroundColor: PROGRESS_STATUSES[formData.progressStatus || 'Not Started']?.color || '#ef4444'
                    }}
                  />
                </div>
              </div>

              {/* Numeric Values - 4 columns */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Business Value (1-5)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    step="0.1"
                    value={formData.businessValueScore}
                    onChange={(e) => handleChange('businessValueScore', parseFloat(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Progress (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.progress}
                    className="w-full border border-gray-300 rounded-lg py-2 px-3 text-sm bg-gray-100"
                    disabled
                    title="Progress is automatically set based on Progress Status"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cost (£)</label>
                  <input
                    type="number"
                    value={formData.costEstimate}
                    onChange={(e) => handleChange('costEstimate', parseInt(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ROI (%)</label>
                  <input
                    type="number"
                    value={formData.roiProjection}
                    onChange={(e) => handleChange('roiProjection', parseInt(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              {/* Text Areas - Full width */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  rows={2}
                  className="w-full border border-gray-300 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business Justification</label>
                <textarea
                  value={formData.businessJustification}
                  onChange={(e) => handleChange('businessJustification', e.target.value)}
                  rows={2}
                  className="w-full border border-gray-300 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </form>
        </div>

        {/* Fixed Footer with Action Buttons */}
        <div className="flex-shrink-0 bg-gray-50 border-t border-gray-200 p-4 sm:p-6 rounded-b-xl">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-0 sm:space-x-3">
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={saving}
              className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm sm:text-base"
            >
              {saving ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditRequirementModal;