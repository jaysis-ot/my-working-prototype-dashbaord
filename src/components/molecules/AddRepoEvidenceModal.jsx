import React, { useState, useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { X, FileText, Upload, AlertTriangle, Save } from 'lucide-react';
import Button from '../atoms/Button';
import Input from '../atoms/Input';

/**
 * AddRepoEvidenceModal Component
 * 
 * This modal allows users to add evidence artifacts to a specific repository.
 * It supports file upload and basic metadata capture.
 */
const AddRepoEvidenceModal = ({ isOpen, repoId, onClose, onSave }) => {
  const fileInputRef = useRef(null);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    files: []
  });
  
  const [errors, setErrors] = useState({});
  const [isDirty, setIsDirty] = useState(false);
  
  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: '',
        description: '',
        files: []
      });
      setErrors({});
      setIsDirty(false);
    }
  }, [isOpen]);
  
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
  
  // Handle file uploads
  const handleFileChange = useCallback((e) => {
    const fileList = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      files: [...prev.files, ...fileList]
    }));
    setIsDirty(true);
    
    // Clear file error if it exists
    if (errors.files) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.files;
        return newErrors;
      });
    }
  }, [errors]);
  
  // Remove a file from the list
  const handleRemoveFile = useCallback((index) => {
    setFormData(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
    }));
    setIsDirty(true);
  }, []);
  
  // Validate form before submission
  const validateForm = useCallback(() => {
    const newErrors = {};
    
    if (!formData.title?.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (formData.files.length === 0) {
      newErrors.files = 'At least one file is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);
  
  // Handle form submission
  const handleSubmit = useCallback(() => {
    if (validateForm()) {
      onSave({
        repoId,
        ...formData
      });
      onClose();
    }
  }, [formData, repoId, onSave, onClose, validateForm]);
  
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
  
  // Trigger file input click
  const handleBrowseClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);
  
  if (!isOpen) return null;
  
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
              <FileText className="w-5 h-5 mr-2 text-primary-500" />
              Add Evidence to Repository
            </h2>
            <p className="text-sm text-secondary-500 dark:text-secondary-400 mt-1">
              Upload files and add metadata
            </p>
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
                Document Information
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                    Title <span className="text-status-error">*</span>
                  </label>
                  <Input
                    value={formData.title}
                    onChange={e => handleChange('title', e.target.value)}
                    error={errors.title}
                    placeholder="Enter document title"
                    className="w-full"
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-status-error">{errors.title}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={e => handleChange('description', e.target.value)}
                    placeholder="Describe the document and its purpose"
                    className="w-full mt-1 block rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-secondary-800 dark:text-white sm:text-sm border-secondary-300 dark:border-secondary-600"
                    rows={3}
                  />
                </div>
              </div>
            </div>
            
            {/* File Upload */}
            <div>
              <h3 className="text-md font-semibold text-secondary-900 dark:text-white mb-4 flex items-center">
                <Upload className="w-5 h-5 mr-2 text-primary-500" />
                Document Files <span className="text-status-error">*</span>
              </h3>
              
              <div className="border-2 border-dashed border-secondary-300 dark:border-secondary-600 rounded-lg p-6 text-center">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  multiple
                  accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.xls,.xlsx,.ppt,.pptx"
                  className="hidden"
                />
                
                {formData.files.length === 0 ? (
                  <div>
                    <Upload className="mx-auto h-12 w-12 text-secondary-400" />
                    <p className="mt-2 text-sm text-secondary-600 dark:text-secondary-400">
                      Drag and drop files here, or
                    </p>
                    <Button 
                      variant="secondary" 
                      className="mt-2" 
                      onClick={handleBrowseClick}
                    >
                      Browse Files
                    </Button>
                    <p className="mt-1 text-xs text-secondary-500 dark:text-secondary-500">
                      Supported formats: PDF, Word, Excel, PowerPoint, Text, Images
                    </p>
                    {errors.files && (
                      <div className="mt-2 flex items-center justify-center text-status-error">
                        <AlertTriangle className="w-4 h-4 mr-1" />
                        <span className="text-sm">{errors.files}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <div className="mb-3 flex justify-between items-center">
                      <span className="text-sm font-medium text-secondary-700 dark:text-secondary-300">
                        {formData.files.length} file(s) selected
                      </span>
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        onClick={handleBrowseClick}
                      >
                        Add More
                      </Button>
                    </div>
                    
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {formData.files.map((file, index) => (
                        <div 
                          key={index} 
                          className="flex items-center justify-between bg-secondary-50 dark:bg-secondary-700/30 p-2 rounded"
                        >
                          <div className="flex items-center">
                            <FileText className="w-4 h-4 text-secondary-500 mr-2" />
                            <span className="text-sm truncate max-w-xs">{file.name}</span>
                          </div>
                          <button 
                            onClick={() => handleRemoveFile(index)}
                            className="text-secondary-500 hover:text-status-error"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
            Save Evidence
          </Button>
        </div>
      </div>
    </div>
  );
};

AddRepoEvidenceModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  repoId: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired
};

export default AddRepoEvidenceModal;
