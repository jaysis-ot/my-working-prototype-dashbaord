import React, { useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { X, ShieldAlert, AlertTriangle, Calendar, User, Tag, FileText, BarChart2, CheckCircle, Save } from 'lucide-react';
import Button from '../atoms/Button';
import Input from '../atoms/Input';
import Badge from '../atoms/Badge';

/**
 * RiskEditModal Component
 * 
 * This modal allows users to edit the details of a risk, including:
 * - Title and description
 * - Status and category
 * - Owner
 * - Impact and probability (which automatically calculates the risk rating)
 * 
 * It includes validation for required fields and provides a consistent
 * user experience with other modals in the application.
 */
const RiskEditModal = ({ risk, isOpen, onClose, onSave }) => {
  // Form state
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [isDirty, setIsDirty] = useState(false);

  // Initialize form data when risk changes
  useEffect(() => {
    if (risk) {
      setFormData({
        id: risk.id || '',
        title: risk.title || '',
        description: risk.description || '',
        status: risk.status || 'Open',
        category: risk.category || 'Technical',
        owner: risk.owner || '',
        impact: risk.impact || 3,
        probability: risk.probability || 3,
        createdDate: risk.createdDate || new Date().toISOString(),
        triageCompletedDate: risk.triageCompletedDate || '',
        finalResolutionDate: risk.finalResolutionDate || '',
        outcome: risk.outcome || '',
      });
      setErrors({});
      setIsDirty(false);
    }
  }, [risk, isOpen]);

  // Calculate risk rating based on impact and probability
  const riskRating = useMemo(() => {
    const score = (formData.impact || 0) * (formData.probability || 0);
    let level = 'Low';
    if (score > 15) level = 'Critical';
    else if (score > 8) level = 'High';
    else if (score > 3) level = 'Medium';
    return { score, level };
  }, [formData.impact, formData.probability]);

  // Handle form field changes
  const handleChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
    
    // Clear error for this field if it exists
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [errors]);

  // Validate form before submission
  const validateForm = useCallback(() => {
    const newErrors = {};
    
    if (!formData.title?.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.description?.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.owner?.trim()) {
      newErrors.owner = 'Owner is required';
    }

    // If closed/treated, resolution date & outcome required
    if (['Mitigated', 'Accepted'].includes(formData.status)) {
      if (!formData.finalResolutionDate) {
        newErrors.finalResolutionDate = 'Resolution date required';
      }
      if (!formData.outcome) {
        newErrors.outcome = 'Outcome required';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Handle form submission
  const handleSubmit = useCallback(() => {
    if (validateForm()) {
      // Include the calculated rating in the saved data
      onSave({
        ...formData,
        rating: riskRating,
        lastUpdated: new Date().toISOString(),
        triageCompletedDate: formData.triageCompletedDate || undefined,
        finalResolutionDate: formData.finalResolutionDate || undefined,
        outcome: formData.outcome || undefined,
      });
    }
  }, [formData, riskRating, onSave, validateForm]);

  // Handle modal close with confirmation if form is dirty
  const handleClose = useCallback(() => {
    if (isDirty) {
      if (window.confirm('You have unsaved changes. Are you sure you want to close?')) {
        onClose();
      }
    } else {
      onClose();
    }
  }, [isDirty, onClose]);

  if (!isOpen || !risk) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={handleClose}>
      <div 
        className="bg-white dark:bg-secondary-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col" 
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-4 border-b border-secondary-200 dark:border-secondary-700">
          <div>
            <h2 className="text-lg font-bold text-secondary-900 dark:text-white flex items-center">
              <ShieldAlert className="w-5 h-5 mr-2 text-status-warning" />
              Edit Risk
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-mono text-sm text-primary-600 dark:text-primary-300">{formData.id}</span>
              <Badge>{formData.status}</Badge>
              <Badge 
                variant={
                  riskRating.level === 'Critical' ? 'error' : 
                  riskRating.level === 'High' ? 'warning' : 
                  'default'
                }
              >
                {riskRating.level}
              </Badge>
            </div>
          </div>
          <button onClick={handleClose} className="p-1 rounded-full hover:bg-secondary-100 dark:hover:bg-secondary-700">
            <X className="w-5 h-5 text-secondary-500" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto">
          <div className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-md font-semibold text-secondary-900 dark:text-white mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-primary-500" />
                Basic Information
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                    Title <span className="text-status-error">*</span>
                  </label>
                  <Input
                    value={formData.title || ''}
                    onChange={e => handleChange('title', e.target.value)}
                    error={errors.title}
                    placeholder="Enter risk title"
                    className="w-full"
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-status-error">{errors.title}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                    Description <span className="text-status-error">*</span>
                  </label>
                  <textarea
                    value={formData.description || ''}
                    onChange={e => handleChange('description', e.target.value)}
                    placeholder="Describe the risk in detail"
                    className={`w-full mt-1 block rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-secondary-800 dark:text-white sm:text-sm ${
                      errors.description ? 'border-status-error' : 'border-secondary-300 dark:border-secondary-600'
                    }`}
                    rows={4}
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-status-error">{errors.description}</p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Lifecycle & Outcome */}
            <div>
              <h3 className="text-md font-semibold text-secondary-900 dark:text-white mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-primary-500" />
                Lifecycle &amp; Outcome
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Created Date (read-only) */}
                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                    Created Date
                  </label>
                  <Input
                    type="date"
                    disabled
                    value={formData.createdDate?.slice(0, 10)}
                    className="w-full"
                  />
                </div>

                {/* Triage Completed */}
                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                    Triage Completed Date
                  </label>
                  <Input
                    type="date"
                    value={formData.triageCompletedDate?.slice(0, 10) || ''}
                    onChange={(e) =>
                      handleChange('triageCompletedDate', e.target.value)
                    }
                    className="w-full"
                  />
                </div>

                {['Mitigated', 'Accepted'].includes(formData.status) && (
                  <>
                    {/* Resolution Date */}
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                        Resolution Date <span className="text-status-error">*</span>
                      </label>
                      <Input
                        type="date"
                        value={formData.finalResolutionDate?.slice(0, 10) || ''}
                        onChange={(e) =>
                          handleChange('finalResolutionDate', e.target.value)
                        }
                        error={errors.finalResolutionDate}
                        className="w-full"
                      />
                      {errors.finalResolutionDate && (
                        <p className="mt-1 text-sm text-status-error">
                          {errors.finalResolutionDate}
                        </p>
                      )}
                    </div>

                    {/* Outcome */}
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                        Treatment Outcome <span className="text-status-error">*</span>
                      </label>
                      <select
                        value={formData.outcome}
                        onChange={(e) => handleChange('outcome', e.target.value)}
                        className={`w-full mt-1 block rounded-md border-secondary-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-secondary-800 dark:border-secondary-600 dark:text-white sm:text-sm ${
                          errors.outcome ? 'border-status-error' : ''
                        }`}
                      >
                        <option value="">Select outcome</option>
                        <option value="Mitigated">Mitigated</option>
                        <option value="Accepted">Accepted</option>
                        <option value="Transferred">Transferred</option>
                        <option value="Avoided">Avoided</option>
                      </select>
                      {errors.outcome && (
                        <p className="mt-1 text-sm text-status-error">
                          {errors.outcome}
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Classification */}
            <div>
              <h3 className="text-md font-semibold text-secondary-900 dark:text-white mb-4 flex items-center">
                <Tag className="w-5 h-5 mr-2 text-primary-500" />
                Classification
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status || 'Open'}
                    onChange={e => handleChange('status', e.target.value)}
                    className="w-full mt-1 block rounded-md border-secondary-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-secondary-800 dark:border-secondary-600 dark:text-white sm:text-sm"
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Mitigated">Mitigated</option>
                    <option value="Accepted">Accepted</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category || 'Technical'}
                    onChange={e => handleChange('category', e.target.value)}
                    className="w-full mt-1 block rounded-md border-secondary-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-secondary-800 dark:border-secondary-600 dark:text-white sm:text-sm"
                  >
                    <option value="Technical">Technical</option>
                    <option value="Operational">Operational</option>
                    <option value="Compliance">Compliance</option>
                    <option value="Strategic">Strategic</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* Ownership */}
            <div>
              <h3 className="text-md font-semibold text-secondary-900 dark:text-white mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-primary-500" />
                Ownership
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                  Owner <span className="text-status-error">*</span>
                </label>
                <Input
                  value={formData.owner || ''}
                  onChange={e => handleChange('owner', e.target.value)}
                  error={errors.owner}
                  placeholder="Enter risk owner"
                  className="w-full"
                />
                {errors.owner && (
                  <p className="mt-1 text-sm text-status-error">{errors.owner}</p>
                )}
              </div>
            </div>
            
            {/* Risk Assessment */}
            <div>
              <h3 className="text-md font-semibold text-secondary-900 dark:text-white mb-4 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-primary-500" />
                Risk Assessment
              </h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                    Impact (1-5): {formData.impact}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={formData.impact || 3}
                    onChange={e => handleChange('impact', parseInt(e.target.value))}
                    className="w-full h-2 bg-secondary-200 rounded-lg appearance-none cursor-pointer dark:bg-secondary-700"
                  />
                  <div className="flex justify-between text-xs text-secondary-500 mt-1">
                    <span>Minimal</span>
                    <span>Low</span>
                    <span>Moderate</span>
                    <span>Significant</span>
                    <span>Severe</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                    Probability (1-5): {formData.probability}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={formData.probability || 3}
                    onChange={e => handleChange('probability', parseInt(e.target.value))}
                    className="w-full h-2 bg-secondary-200 rounded-lg appearance-none cursor-pointer dark:bg-secondary-700"
                  />
                  <div className="flex justify-between text-xs text-secondary-500 mt-1">
                    <span>Rare</span>
                    <span>Unlikely</span>
                    <span>Possible</span>
                    <span>Likely</span>
                    <span>Almost Certain</span>
                  </div>
                </div>
                
                <div className="p-4 bg-secondary-50 dark:bg-secondary-800/50 rounded-md border border-secondary-200 dark:border-secondary-700">
                  <h4 className="text-sm font-medium text-secondary-900 dark:text-white mb-2 flex items-center">
                    <BarChart2 className="w-4 h-4 mr-2 text-primary-500" />
                    Calculated Risk Rating
                  </h4>
                  <div className="flex items-center gap-4">
                    <Badge 
                      variant={
                        riskRating.level === 'Critical' ? 'error' : 
                        riskRating.level === 'High' ? 'warning' : 
                        riskRating.level === 'Medium' ? 'default' :
                        'success'
                      }
                      size="lg"
                    >
                      {riskRating.level}
                    </Badge>
                    <span className="text-sm text-secondary-600 dark:text-secondary-400">
                      Score: <span className="font-semibold">{riskRating.score}</span> (Impact × Probability)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-secondary-200 dark:border-secondary-700">
          <Button variant="secondary" onClick={handleClose}>Cancel</Button>
          <Button 
            onClick={handleSubmit}
            disabled={!isDirty}
            leadingIcon={Save}
          >
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

RiskEditModal.propTypes = {
  risk: PropTypes.object.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired
};

export default RiskEditModal;
