// src/components/modals/NewCapabilityModal.jsx
import React, { useState } from 'react';
import { X, Save, RefreshCw, Plus } from 'lucide-react';

const NewCapabilityModal = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    description: '',
    pcd: '',
    pcdDescription: '',
    status: 'Planning',
    priority: 'Medium',
    businessValue: 3.0,
    totalRequirements: 0,
    completedRequirements: 0,
    category: '',
    owner: '',
    estimatedCost: 0,
    estimatedROI: 100,
    timeline: '',
    regulatoryDrivers: []
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.id.trim()) newErrors.id = 'ID is required';
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (formData.businessValue < 1 || formData.businessValue > 5) {
      newErrors.businessValue = 'Business value must be between 1 and 5';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleRegulatoryDriversChange = (e) => {
    const value = e.target.value;
    const drivers = value.split(',').map(d => d.trim()).filter(d => d);
    handleChange('regulatoryDrivers', drivers);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setSaving(true);
    try {
      const success = await onSave({
        ...formData,
        lastUpdated: new Date().toISOString().split('T')[0]
      });
      setSaving(false);
      
      if (success) {
        // Reset form
        setFormData({
          id: '',
          name: '',
          description: '',
          pcd: '',
          pcdDescription: '',
          status: 'Planning',
          priority: 'Medium',
          businessValue: 3.0,
          totalRequirements: 0,
          completedRequirements: 0,
          category: '',
          owner: '',
          estimatedCost: 0,
          estimatedROI: 100,
          timeline: '',
          regulatoryDrivers: []
        });
        setErrors({});
        onClose();
      }
    } catch (error) {
      setSaving(false);
      console.error('Error creating capability:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Create New Capability</h2>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-gray-100 rounded-lg"
            disabled={saving}
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Capability ID *
              </label>
              <input
                type="text"
                value={formData.id}
                onChange={(e) => handleChange('id', e.target.value)}
                placeholder="CAP-006"
                className={`w-full border rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500 ${
                  errors.id ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                }`}
                required
                disabled={saving}
              />
              {errors.id && <p className="text-red-600 text-xs mt-1">{errors.id}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Data Loss Prevention"
                className={`w-full border rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500 ${
                  errors.name ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                }`}
                required
                disabled={saving}
              />
              {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={3}
              className={`w-full border rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500 ${
                errors.description ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
              }`}
              required
              disabled={saving}
              placeholder="Comprehensive capability description..."
            />
            {errors.description && <p className="text-red-600 text-xs mt-1">{errors.description}</p>}
          </div>

          {/* PCD Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">PCD ID</label>
              <input
                type="text"
                value={formData.pcd}
                onChange={(e) => handleChange('pcd', e.target.value)}
                placeholder="PCD-DLP-006"
                className="w-full border border-gray-300 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={saving}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Timeline</label>
              <input
                type="text"
                value={formData.timeline}
                onChange={(e) => handleChange('timeline', e.target.value)}
                placeholder="12 months"
                className="w-full border border-gray-300 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={saving}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">PCD Description</label>
            <input
              type="text"
              value={formData.pcdDescription}
              onChange={(e) => handleChange('pcdDescription', e.target.value)}
              placeholder="Data Loss Prevention System Implementation"
              className="w-full border border-gray-300 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={saving}
            />
          </div>

          {/* Status and Priority */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                className="w-full border border-gray-300 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={saving}
              >
                <option value="Planning">Planning</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Not Started">Not Started</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => handleChange('priority', e.target.value)}
                className="w-full border border-gray-300 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={saving}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Business Value (1-5)
              </label>
              <input
                type="number"
                min="1"
                max="5"
                step="0.1"
                value={formData.businessValue}
                onChange={(e) => handleChange('businessValue', parseFloat(e.target.value))}
                className={`w-full border rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500 ${
                  errors.businessValue ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                }`}
                disabled={saving}
              />
              {errors.businessValue && <p className="text-red-600 text-xs mt-1">{errors.businessValue}</p>}
            </div>
          </div>

          {/* Financial Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Owner</label>
              <input
                type="text"
                value={formData.owner}
                onChange={(e) => handleChange('owner', e.target.value)}
                placeholder="Security Team"
                className="w-full border border-gray-300 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={saving}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Cost (£)</label>
              <input
                type="number"
                value={formData.estimatedCost}
                onChange={(e) => handleChange('estimatedCost', parseInt(e.target.value) || 0)}
                className="w-full border border-gray-300 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={saving}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estimated ROI (%)</label>
              <input
                type="number"
                value={formData.estimatedROI}
                onChange={(e) => handleChange('estimatedROI', parseInt(e.target.value) || 0)}
                className="w-full border border-gray-300 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={saving}
              />
            </div>
          </div>

          {/* Regulatory Drivers */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Regulatory Drivers
            </label>
            <input
              type="text"
              value={formData.regulatoryDrivers.join(', ')}
              onChange={handleRegulatoryDriversChange}
              placeholder="NCSC CAF, Ofgem Framework, ISO 27001"
              className="w-full border border-gray-300 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={saving}
            />
            <p className="text-xs text-gray-500 mt-1">Separate multiple drivers with commas</p>
          </div>
          
          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {saving ? 'Creating...' : 'Create Capability'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewCapabilityModal;