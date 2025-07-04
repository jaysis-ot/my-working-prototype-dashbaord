// src/components/modals/NewCapabilityModal.jsx
import React, { useState } from 'react';
import { X, Plus, Network, Star, DollarSign, Users, Target } from 'lucide-react';

const NewCapabilityModal = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    description: '',
    status: 'Planning',
    businessValue: 3,
    estimatedROI: 15,
    owner: '',
    category: 'Security',
    timeline: '',
    resources: '',
    dependencies: '',
    successCriteria: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.id.trim()) {
      newErrors.id = 'Capability ID is required';
    } else if (!/^CAP-\d{3}$/.test(formData.id)) {
      newErrors.id = 'ID must be in format CAP-XXX (e.g., CAP-001)';
    }
    
    if (!formData.name.trim()) {
      newErrors.name = 'Capability name is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (formData.businessValue < 1 || formData.businessValue > 5) {
      newErrors.businessValue = 'Business value must be between 1 and 5';
    }
    
    if (formData.estimatedROI < 0 || formData.estimatedROI > 1000) {
      newErrors.estimatedROI = 'ROI must be between 0 and 1000%';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      const success = await onSave(formData);
      if (success) {
        onClose();
        // Reset form
        setFormData({
          id: '',
          name: '',
          description: '',
          status: 'Planning',
          businessValue: 3,
          estimatedROI: 15,
          owner: '',
          category: 'Security',
          timeline: '',
          resources: '',
          dependencies: '',
          successCriteria: ''
        });
      }
    } catch (error) {
      console.error('Failed to create capability:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusOptions = ['Planning', 'In Progress', 'Completed', 'On Hold'];
  const categoryOptions = ['Security', 'Compliance', 'Infrastructure', 'Operations', 'Governance'];

  return (
    <div className="max-h-[90vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Network className="h-6 w-6 mr-3 text-blue-500" />
            Create New Capability
          </h2>
          <p className="text-sm text-gray-600 mt-1">Define a new OT security capability</p>
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
              Capability ID *
            </label>
            <input
              type="text"
              value={formData.id}
              onChange={(e) => handleInputChange('id', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.id ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="CAP-001"
              required
            />
            {errors.id && (
              <p className="text-sm text-red-600 mt-1">{errors.id}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {statusOptions.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Capability Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
            placeholder="e.g., Network Segmentation"
            required
          />
          {errors.name && (
            <p className="text-sm text-red-600 mt-1">{errors.name}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={3}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.description ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
            placeholder="Describe the capability's purpose and scope..."
            required
          />
          {errors.description && (
            <p className="text-sm text-red-600 mt-1">{errors.description}</p>
          )}
        </div>

        {/* Category and Owner */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {categoryOptions.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Capability Owner
            </label>
            <input
              type="text"
              value={formData.owner}
              onChange={(e) => handleInputChange('owner', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Person or team responsible"
            />
          </div>
        </div>

        {/* Business Value and ROI */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business Value (1-5)
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="number"
                min="1"
                max="5"
                step="0.1"
                value={formData.businessValue}
                onChange={(e) => handleInputChange('businessValue', parseFloat(e.target.value))}
                className={`w-20 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.businessValue ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              />
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${
                      star <= formData.businessValue
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
            {errors.businessValue && (
              <p className="text-sm text-red-600 mt-1">{errors.businessValue}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estimated ROI (%)
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="1000"
                value={formData.estimatedROI}
                onChange={(e) => handleInputChange('estimatedROI', parseInt(e.target.value) || 0)}
                className={`w-full px-3 py-2 pr-8 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.estimatedROI ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="15"
              />
              <span className="absolute right-3 top-2 text-gray-500">%</span>
            </div>
            {errors.estimatedROI && (
              <p className="text-sm text-red-600 mt-1">{errors.estimatedROI}</p>
            )}
          </div>
        </div>

        {/* Timeline and Resources */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Implementation Timeline
            </label>
            <input
              type="text"
              value={formData.timeline}
              onChange={(e) => handleInputChange('timeline', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., 6-12 months"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Required Resources
            </label>
            <input
              type="text"
              value={formData.resources}
              onChange={(e) => handleInputChange('resources', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., 2 FTE, £50k budget"
            />
          </div>
        </div>

        {/* Dependencies */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Dependencies
          </label>
          <textarea
            value={formData.dependencies}
            onChange={(e) => handleInputChange('dependencies', e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="List any dependencies on other capabilities or external factors..."
          />
        </div>

        {/* Success Criteria */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Success Criteria
          </label>
          <textarea
            value={formData.successCriteria}
            onChange={(e) => handleInputChange('successCriteria', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Define how success will be measured for this capability..."
          />
        </div>
      </form>

      {/* Footer */}
      <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
            isSubmitting
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Creating...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Create Capability
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default NewCapabilityModal;