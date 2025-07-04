// utils/validation.js
export const validateRequirement = (requirement) => {
  const errors = {};

  // Required field validation
  if (!requirement.id?.trim()) {
    errors.id = 'ID is required';
  }

  if (!requirement.category?.trim()) {
    errors.category = 'Category is required';
  }

  // Business value validation
  if (requirement.businessValueScore !== undefined) {
    const score = Number(requirement.businessValueScore);
    if (isNaN(score) || score < 1 || score > 5) {
      errors.businessValueScore = 'Business value must be between 1 and 5';
    }
  }

  // Progress validation
  if (requirement.progress !== undefined) {
    const progress = Number(requirement.progress);
    if (isNaN(progress) || progress < 0 || progress > 100) {
      errors.progress = 'Progress must be between 0 and 100';
    }
  }

  // Cost validation
  if (requirement.costEstimate !== undefined) {
    const cost = Number(requirement.costEstimate);
    if (isNaN(cost) || cost < 0) {
      errors.costEstimate = 'Cost estimate must be a positive number';
    }
  }

  // ROI validation
  if (requirement.roiProjection !== undefined) {
    const roi = Number(requirement.roiProjection);
    if (isNaN(roi)) {
      errors.roiProjection = 'ROI projection must be a number';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateCapability = (capability) => {
  const errors = {};

  if (!capability.id?.trim()) {
    errors.id = 'Capability ID is required';
  }

  if (!capability.name?.trim()) {
    errors.name = 'Name is required';
  }

  if (!capability.description?.trim()) {
    errors.description = 'Description is required';
  }

  if (capability.businessValue !== undefined) {
    const value = Number(capability.businessValue);
    if (isNaN(value) || value < 1 || value > 5) {
      errors.businessValue = 'Business value must be between 1 and 5';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// utils/errorHandling.js
export class DashboardError extends Error {
  constructor(message, code, details = {}) {
    super(message);
    this.name = 'DashboardError';
    this.code = code;
    this.details = details;
  }
}

export const handleAsyncError = async (asyncFn, errorContext = '') => {
  try {
    return await asyncFn();
  } catch (error) {
    console.error(`Error in ${errorContext}:`, error);
    
    // Re-throw with more context
    if (error instanceof DashboardError) {
      throw error;
    }
    
    throw new DashboardError(
      `Operation failed: ${error.message}`,
      'ASYNC_ERROR',
      { originalError: error, context: errorContext }
    );
  }
};

// Enhanced CSV utilities with better error handling
// utils/csvUtils.js (enhanced version)
import { DashboardError } from './errorHandling.js';

export const parseCSVSafely = (csvText) => {
  if (!csvText || typeof csvText !== 'string') {
    throw new DashboardError('Invalid CSV content', 'INVALID_CSV');
  }

  try {
    const lines = csvText.trim().split('\n');
    
    if (lines.length < 2) {
      throw new DashboardError('CSV must contain headers and at least one data row', 'INSUFFICIENT_DATA');
    }

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    
    // Validate headers
    if (headers.length === 0 || headers.some(h => !h)) {
      throw new DashboardError('CSV headers are invalid or empty', 'INVALID_HEADERS');
    }

    const data = lines.slice(1).map((line, index) => {
      try {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        const row = {};
        
        headers.forEach((header, headerIndex) => {
          row[header] = values[headerIndex] || '';
        });
        
        return row;
      } catch (error) {
        throw new DashboardError(
          `Error parsing CSV row ${index + 2}`, 
          'ROW_PARSE_ERROR',
          { rowIndex: index + 2, line }
        );
      }
    });

    return { headers, data };
  } catch (error) {
    if (error instanceof DashboardError) {
      throw error;
    }
    throw new DashboardError(`CSV parsing failed: ${error.message}`, 'PARSE_ERROR');
  }
};

// Enhanced modal with validation
// components/modals/EditRequirementModal.jsx (excerpt)
import React, { useState, useCallback } from 'react';
import { validateRequirement } from '../../utils/validation.js';

export const EditRequirementModal = ({ requirement, onClose, onSave }) => {
  const [formData, setFormData] = useState(requirement);
  const [errors, setErrors] = useState({});
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

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  }, [errors]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    // Validate form data
    const validation = validateRequirement(formData);
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setSaving(true);
    setErrors({});

    try {
      const success = await onSave(requirement.id, formData);
      if (success) {
        onClose();
      } else {
        setErrors({ general: 'Failed to save requirement' });
      }
    } catch (error) {
      console.error('Error saving requirement:', error);
      setErrors({ general: error.message || 'An error occurred while saving' });
    } finally {
      setSaving(false);
    }
  }, [formData, requirement.id, onSave, onClose]);

  // Rest of component with error display...
};