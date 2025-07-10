import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { X, Save, Calendar, Clock, AlertTriangle, FileText } from 'lucide-react';
import Button from '../atoms/Button';

/**
 * EditAssignmentModal Component
 * 
 * A modal dialog that allows editing of work allocations for resources.
 * Supports editing both assignments and requirements with a consistent interface.
 * 
 * @param {Object} props Component props
 * @param {boolean} props.isOpen Whether the modal is open
 * @param {Function} props.onClose Function to close the modal
 * @param {Object} props.assignment The assignment or requirement being edited
 * @param {Array} props.capabilities List of capabilities to choose from
 * @param {Function} props.onSave Function to call when saving changes
 * @param {boolean} props.isRequirement Whether this is a requirement (vs. assignment)
 */
const EditAssignmentModal = ({
  isOpen,
  onClose,
  assignment,
  capabilities,
  onSave,
  isRequirement = false,
}) => {
  // Initialize form data from the assignment
  const [formData, setFormData] = useState({
    capabilityId: '',
    timeAllocation: '2 days per week',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    priority: 'Medium',
    notes: '',
    description: '',
  });

  const [errors, setErrors] = useState({});

  // Populate form with assignment data when modal opens
  useEffect(() => {
    if (assignment) {
      setFormData({
        capabilityId: assignment.capabilityId || '',
        timeAllocation: assignment.timeAllocation || '2 days per week',
        startDate: assignment.startDate || new Date().toISOString().split('T')[0],
        endDate: assignment.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        priority: assignment.priority || 'Medium',
        notes: assignment.notes || '',
        description: isRequirement ? assignment.description || '' : '',
      });
    }
  }, [assignment, isRequirement]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error for this field when user makes changes
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.capabilityId) {
      newErrors.capabilityId = 'Capability is required';
    }
    
    if (!formData.timeAllocation) {
      newErrors.timeAllocation = 'Time allocation is required';
    }
    
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }
    
    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    } else if (new Date(formData.endDate) < new Date(formData.startDate)) {
      newErrors.endDate = 'End date must be after start date';
    }
    
    if (isRequirement && !formData.description) {
      newErrors.description = 'Description is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    if (onSave) {
      onSave(assignment.id, formData);
    }
    onClose();
  };

  if (!isOpen) return null;

  const modalTitle = isRequirement 
    ? 'Edit Requirement' 
    : `Edit Assignment for ${assignment.resourceName || 'Resource'}`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 fade-in">
      <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-xl w-full max-w-2xl">
        <div className="flex items-center justify-between p-4 border-b dark:border-secondary-700">
          <h3 className="text-lg font-semibold text-secondary-900 dark:text-white">
            {modalTitle}
          </h3>
          <button
            onClick={onClose}
            className="text-secondary-500 hover:text-secondary-700 dark:hover:text-secondary-300"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Capability selection */}
            <div>
              <label className="block text-sm font-medium mb-1 text-secondary-700 dark:text-secondary-300">
                Capability *
              </label>
              <select
                name="capabilityId"
                value={formData.capabilityId}
                onChange={handleChange}
                required
                className={`w-full p-2 border rounded-md dark:bg-secondary-700 
                  ${errors.capabilityId 
                    ? 'border-red-500 dark:border-red-500' 
                    : 'border-secondary-300 dark:border-secondary-600'}`}
              >
                <option value="">Select a capability...</option>
                {capabilities.map((cap) => (
                  <option key={cap.id} value={cap.id}>
                    {cap.name}
                  </option>
                ))}
              </select>
              {errors.capabilityId && (
                <p className="text-red-500 text-xs mt-1">{errors.capabilityId}</p>
              )}
            </div>

            {/* Time Allocation */}
            <div>
              <label className="block text-sm font-medium mb-1 text-secondary-700 dark:text-secondary-300">
                Time Allocation *
              </label>
              <div className="flex items-center">
                <Clock className="w-4 h-4 text-secondary-500 dark:text-secondary-400 mr-2" />
                <select
                  name="timeAllocation"
                  value={formData.timeAllocation}
                  onChange={handleChange}
                  required
                  className={`w-full p-2 border rounded-md dark:bg-secondary-700
                    ${errors.timeAllocation 
                      ? 'border-red-500 dark:border-red-500' 
                      : 'border-secondary-300 dark:border-secondary-600'}`}
                >
                  <option value="1 day per week">1 day per week</option>
                  <option value="2 days per week">2 days per week</option>
                  <option value="3 days per week">3 days per week</option>
                  <option value="4 days per week">4 days per week</option>
                  <option value="Full time">Full time</option>
                  <option value="20%">20% allocation</option>
                  <option value="50%">50% allocation</option>
                  <option value="75%">75% allocation</option>
                </select>
              </div>
              {errors.timeAllocation && (
                <p className="text-red-500 text-xs mt-1">{errors.timeAllocation}</p>
              )}
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium mb-1 text-secondary-700 dark:text-secondary-300">
                Start Date *
              </label>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 text-secondary-500 dark:text-secondary-400 mr-2" />
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                  className={`w-full p-2 border rounded-md dark:bg-secondary-700
                    ${errors.startDate 
                      ? 'border-red-500 dark:border-red-500' 
                      : 'border-secondary-300 dark:border-secondary-600'}`}
                />
              </div>
              {errors.startDate && (
                <p className="text-red-500 text-xs mt-1">{errors.startDate}</p>
              )}
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium mb-1 text-secondary-700 dark:text-secondary-300">
                End Date *
              </label>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 text-secondary-500 dark:text-secondary-400 mr-2" />
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  required
                  className={`w-full p-2 border rounded-md dark:bg-secondary-700
                    ${errors.endDate 
                      ? 'border-red-500 dark:border-red-500' 
                      : 'border-secondary-300 dark:border-secondary-600'}`}
                />
              </div>
              {errors.endDate && (
                <p className="text-red-500 text-xs mt-1">{errors.endDate}</p>
              )}
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium mb-1 text-secondary-700 dark:text-secondary-300">
                Priority
              </label>
              <div className="flex items-center">
                <AlertTriangle className="w-4 h-4 text-secondary-500 dark:text-secondary-400 mr-2" />
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full p-2 border border-secondary-300 dark:border-secondary-600 rounded-md dark:bg-secondary-700"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
            </div>

            {/* Description (for requirements) */}
            {isRequirement && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1 text-secondary-700 dark:text-secondary-300">
                  Description *
                </label>
                <div className="flex items-center">
                  <FileText className="w-4 h-4 text-secondary-500 dark:text-secondary-400 mr-2" />
                  <input
                    type="text"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required={isRequirement}
                    className={`w-full p-2 border rounded-md dark:bg-secondary-700
                      ${errors.description 
                        ? 'border-red-500 dark:border-red-500' 
                        : 'border-secondary-300 dark:border-secondary-600'}`}
                    placeholder="Brief description of the requirement"
                  />
                </div>
                {errors.description && (
                  <p className="text-red-500 text-xs mt-1">{errors.description}</p>
                )}
              </div>
            )}

            {/* Notes */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1 text-secondary-700 dark:text-secondary-300">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="3"
                className="w-full p-2 border border-secondary-300 dark:border-secondary-600 rounded-md dark:bg-secondary-700"
                placeholder="Any additional information or context"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-secondary-200 dark:border-secondary-700">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              leadingIcon={Save}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

EditAssignmentModal.propTypes = {
  /**
   * Whether the modal is currently open
   */
  isOpen: PropTypes.bool.isRequired,
  
  /**
   * Function to close the modal
   */
  onClose: PropTypes.func.isRequired,
  
  /**
   * The assignment or requirement being edited
   */
  assignment: PropTypes.object.isRequired,
  
  /**
   * List of capabilities to choose from
   */
  capabilities: PropTypes.array.isRequired,
  
  /**
   * Function to call when saving changes
   */
  onSave: PropTypes.func.isRequired,
  
  /**
   * Whether this is a requirement (vs. assignment)
   */
  isRequirement: PropTypes.bool,
};

export default EditAssignmentModal;
