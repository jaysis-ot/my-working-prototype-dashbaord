import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { X, AlertCircle, CheckCircle, AlertTriangle, User, FileText, Calendar } from 'lucide-react';

/**
 * IncidentCreateModal Component
 * 
 * A modal dialog for creating new security incidents with:
 * - Form fields for incident details
 * - Validation for required fields
 * - Submit and cancel functionality
 */
const IncidentCreateModal = ({ isOpen, onClose, onSubmit }) => {
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    severity: 'MEDIUM',
    status: 'NEW',
    assignedTo: ''
  });
  
  // Validation state
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    // Required fields
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      
      // Create incident object
      const newIncident = {
        ...formData,
        id: `INC-${Math.floor(1000 + Math.random() * 9000)}`, // Generate temporary ID
        createdAt: new Date().toISOString(),
        resolvedAt: null
      };
      
      // Submit the new incident
      onSubmit(newIncident);
      
      // Reset form and close modal
      setFormData({
        title: '',
        description: '',
        severity: 'MEDIUM',
        status: 'NEW',
        assignedTo: ''
      });
      setIsSubmitting(false);
      onClose();
    }
  };
  
  // Handle cancel
  const handleCancel = () => {
    // Reset form
    setFormData({
      title: '',
      description: '',
      severity: 'MEDIUM',
      status: 'NEW',
      assignedTo: ''
    });
    setErrors({});
    onClose();
  };
  
  // If modal is not open, don't render anything
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 transition-opacity" 
          aria-hidden="true"
          onClick={handleCancel}
        >
          <div className="absolute inset-0 bg-secondary-900 opacity-75"></div>
        </div>
        
        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          {/* Modal header */}
          <div className="bg-primary-600 px-4 py-3 sm:px-6 flex items-center justify-between">
            <h3 className="text-lg leading-6 font-medium text-white flex items-center">
              <AlertCircle className="mr-2 h-5 w-5" />
              Create New Incident
            </h3>
            <button
              type="button"
              className="text-white hover:text-secondary-200 focus:outline-none"
              onClick={handleCancel}
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          {/* Modal content - Form */}
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="space-y-4">
                {/* Title field */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-secondary-700">
                    Title <span className="text-red-600">*</span>
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FileText className="h-5 w-5 text-secondary-400" aria-hidden="true" />
                    </div>
                    <input
                      type="text"
                      name="title"
                      id="title"
                      className={`block w-full pl-10 pr-3 py-2 border ${
                        errors.title ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500' : 'border-secondary-300 focus:ring-primary-500 focus:border-primary-500'
                      } rounded-md shadow-sm placeholder-secondary-400`}
                      placeholder="Incident title"
                      value={formData.title}
                      onChange={handleChange}
                    />
                  </div>
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                  )}
                </div>
                
                {/* Description field */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-secondary-700">
                    Description <span className="text-red-600">*</span>
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="description"
                      name="description"
                      rows={3}
                      className={`shadow-sm block w-full sm:text-sm border ${
                        errors.description ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500' : 'border-secondary-300 focus:ring-primary-500 focus:border-primary-500'
                      } rounded-md`}
                      placeholder="Detailed description of the incident"
                      value={formData.description}
                      onChange={handleChange}
                    />
                  </div>
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                  )}
                </div>
                
                {/* Severity dropdown */}
                <div>
                  <label htmlFor="severity" className="block text-sm font-medium text-secondary-700">
                    Severity
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <AlertTriangle className="h-5 w-5 text-secondary-400" aria-hidden="true" />
                    </div>
                    <select
                      id="severity"
                      name="severity"
                      className="block w-full pl-10 pr-3 py-2 border border-secondary-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      value={formData.severity}
                      onChange={handleChange}
                    >
                      <option value="CRITICAL">Critical</option>
                      <option value="HIGH">High</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="LOW">Low</option>
                      <option value="INFORMATIONAL">Informational</option>
                    </select>
                  </div>
                </div>
                
                {/* Status dropdown */}
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-secondary-700">
                    Status
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <CheckCircle className="h-5 w-5 text-secondary-400" aria-hidden="true" />
                    </div>
                    <select
                      id="status"
                      name="status"
                      className="block w-full pl-10 pr-3 py-2 border border-secondary-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      value={formData.status}
                      onChange={handleChange}
                    >
                      <option value="NEW">New</option>
                      <option value="INVESTIGATING">Investigating</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="RESOLVED">Resolved</option>
                      <option value="CLOSED">Closed</option>
                    </select>
                  </div>
                </div>
                
                {/* Assigned To field */}
                <div>
                  <label htmlFor="assignedTo" className="block text-sm font-medium text-secondary-700">
                    Assigned To
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-secondary-400" aria-hidden="true" />
                    </div>
                    <input
                      type="text"
                      name="assignedTo"
                      id="assignedTo"
                      className="block w-full pl-10 pr-3 py-2 border border-secondary-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      placeholder="Person responsible for this incident"
                      value={formData.assignedTo}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Modal footer - Action buttons */}
            <div className="bg-secondary-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating...' : 'Create Incident'}
              </button>
              <button
                type="button"
                className="mt-3 w-full inline-flex justify-center rounded-md border border-secondary-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-secondary-700 hover:bg-secondary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                onClick={handleCancel}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

IncidentCreateModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired
};

export default IncidentCreateModal;
