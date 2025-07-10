import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { 
  X, 
  Save, 
  AlertCircle, 
  Shield, 
  Server, 
  Users, 
  DollarSign, 
  Calendar, 
  BarChart, 
  FileText, 
  CheckCircle2, 
  Clock, 
  Building, 
  Link2,
  Star,
  Percent,
  AlertTriangle,
  Briefcase,
  LineChart
} from 'lucide-react';
import Button from '../atoms/Button';
import { useCapabilitiesData } from '../../hooks/useCapabilitiesData';

/**
 * EditCapabilityModal Component
 * 
 * A comprehensive modal for creating or editing cybersecurity capabilities
 * with detailed fields covering technical, business, compliance, and resource aspects.
 * 
 * @param {Object} props Component props
 * @param {boolean} props.isOpen Whether the modal is open
 * @param {Function} props.onClose Function to close the modal
 * @param {Object} props.capability The capability to edit (or null for new capability)
 */
const EditCapabilityModal = ({ isOpen, onClose, capability }) => {
  const { updateCapability, addCapability } = useCapabilitiesData();
  const isNewCapability = !capability?.id;
  
  // Form state
  const [formData, setFormData] = useState({
    // Basic Information
    name: '',
    description: '',
    status: 'Not Started',
    priorityLevel: 'Medium',
    
    // Technical Details
    securityControlType: 'technical',
    maturityLevel: 'IG1',
    implementationComplexity: 'Medium',
    technologyStack: '',
    dependencies: '',
    
    // Business & Risk
    businessValue: 3,
    estimatedROI: 100,
    riskLevelAddressed: 'Medium',
    businessImpact: '',
    
    // Compliance & Frameworks
    complianceFrameworks: [],
    controlReference: '',
    isRegulatoryRequirement: false,
    
    // Resource Management
    responsibleTeam: '',
    budget: '',
    startDate: '',
    endDate: '',
    resourcesRequired: '',
    
    // Monitoring & Metrics
    successMetrics: '',
    monitoringMethod: 'Manual',
    reportingFrequency: 'Monthly',
    lastAssessmentDate: ''
  });
  
  // Validation state
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  
  // Initialize form with capability data if editing
  useEffect(() => {
    if (capability) {
      setFormData(prevData => ({
        ...prevData,
        ...capability,
        // Handle any specific field transformations here
        startDate: capability.startDate || '',
        endDate: capability.endDate || '',
        complianceFrameworks: capability.complianceFrameworks || [],
        budget: capability.budget?.toString() || '',
        estimatedROI: capability.estimatedROI || 100,
        businessValue: capability.businessValue || 3,
      }));
    }
  }, [capability]);
  
  // Framework options
  const frameworkOptions = [
    { id: 'nist', label: 'NIST CSF' },
    { id: 'iso27001', label: 'ISO 27001' },
    { id: 'iec62443', label: 'IEC 62443' },
    { id: 'cis', label: 'CIS Controls' },
    { id: 'cmmc', label: 'CMMC' },
    { id: 'nerc', label: 'NERC CIP' },
    { id: 'gdpr', label: 'GDPR' },
    { id: 'hipaa', label: 'HIPAA' },
    { id: 'pci', label: 'PCI DSS' }
  ];
  
  // Handle form field changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Handle different input types
    const inputValue = type === 'checkbox' ? checked : value;
    
    setFormData(prevData => ({
      ...prevData,
      [name]: inputValue
    }));
    
    // Mark field as touched
    if (!touched[name]) {
      setTouched(prev => ({ ...prev, [name]: true }));
    }
    
    // Clear error when user makes changes
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  // Handle framework checkbox changes
  const handleFrameworkChange = (frameworkId) => {
    setFormData(prevData => {
      const currentFrameworks = [...(prevData.complianceFrameworks || [])];
      
      if (currentFrameworks.includes(frameworkId)) {
        return {
          ...prevData,
          complianceFrameworks: currentFrameworks.filter(id => id !== frameworkId)
        };
      } else {
        return {
          ...prevData,
          complianceFrameworks: [...currentFrameworks, frameworkId]
        };
      }
    });
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    // Basic Information validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    // Technical Details validation
    if (formData.technologyStack && formData.technologyStack.length > 500) {
      newErrors.technologyStack = 'Technology stack must be less than 500 characters';
    }
    
    // Business & Risk validation
    if (formData.businessValue < 1 || formData.businessValue > 5) {
      newErrors.businessValue = 'Business value must be between 1 and 5';
    }
    
    if (formData.estimatedROI < 0) {
      newErrors.estimatedROI = 'ROI cannot be negative';
    }
    
    // Resource Management validation
    if (formData.startDate && formData.endDate && new Date(formData.startDate) > new Date(formData.endDate)) {
      newErrors.endDate = 'End date cannot be before start date';
    }
    
    if (formData.budget && isNaN(parseFloat(formData.budget))) {
      newErrors.budget = 'Budget must be a valid number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Mark all fields as touched for validation
    const allTouched = Object.keys(formData).reduce((acc, field) => {
      acc[field] = true;
      return acc;
    }, {});
    setTouched(allTouched);
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    // Process form data
    const processedData = {
      ...formData,
      budget: formData.budget ? parseFloat(formData.budget) : null,
      businessValue: parseFloat(formData.businessValue),
      estimatedROI: parseFloat(formData.estimatedROI)
    };
    
    // Update or add capability
    if (isNewCapability) {
      addCapability(processedData);
    } else {
      updateCapability(capability.id, processedData);
    }
    
    // Close modal
    onClose();
  };
  
  // If modal is not open, don't render anything
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 fade-in">
      <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Modal header */}
        <div className="flex items-center justify-between p-4 border-b dark:border-secondary-700">
          <h2 className="text-xl font-semibold text-secondary-900 dark:text-white">
            {isNewCapability ? 'Create New Capability' : 'Edit Capability'}
          </h2>
          <button
            onClick={onClose}
            className="text-secondary-500 hover:text-secondary-700 dark:hover:text-secondary-300"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Modal body with scrollable content */}
        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit} id="capability-form">
            {/* ===== Basic Information Section ===== */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-secondary-900 dark:text-white flex items-center mb-4">
                <FileText className="w-5 h-5 mr-2 text-primary-500" />
                Basic Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div className="col-span-2">
                  <label htmlFor="name" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                    Capability Name <span className="text-status-error">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`
                      block w-full px-3 py-2 rounded-md 
                      border ${errors.name ? 'border-status-error' : 'border-secondary-300 dark:border-secondary-600'} 
                      bg-white dark:bg-secondary-700 
                      text-secondary-900 dark:text-white
                      focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                    `}
                    placeholder="e.g., Network Segmentation"
                  />
                  {errors.name && touched.name && (
                    <p className="mt-1 text-sm text-status-error">{errors.name}</p>
                  )}
                </div>
                
                {/* Description */}
                <div className="col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                    Description <span className="text-status-error">*</span>
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                    className={`
                      block w-full px-3 py-2 rounded-md 
                      border ${errors.description ? 'border-status-error' : 'border-secondary-300 dark:border-secondary-600'} 
                      bg-white dark:bg-secondary-700 
                      text-secondary-900 dark:text-white
                      focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                    `}
                    placeholder="Describe the capability and its purpose..."
                  ></textarea>
                  {errors.description && touched.description && (
                    <p className="mt-1 text-sm text-status-error">{errors.description}</p>
                  )}
                </div>
                
                {/* Status */}
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="
                      block w-full px-3 py-2 rounded-md 
                      border border-secondary-300 dark:border-secondary-600 
                      bg-white dark:bg-secondary-700 
                      text-secondary-900 dark:text-white
                      focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                    "
                  >
                    <option value="Not Started">Not Started</option>
                    <option value="Planning">Planning</option>
                    <option value="In Progress">In Progress</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                
                {/* Priority Level */}
                <div>
                  <label htmlFor="priorityLevel" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                    Priority Level
                  </label>
                  <select
                    id="priorityLevel"
                    name="priorityLevel"
                    value={formData.priorityLevel}
                    onChange={handleChange}
                    className="
                      block w-full px-3 py-2 rounded-md 
                      border border-secondary-300 dark:border-secondary-600 
                      bg-white dark:bg-secondary-700 
                      text-secondary-900 dark:text-white
                      focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                    "
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* ===== Technical Details Section ===== */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-secondary-900 dark:text-white flex items-center mb-4">
                <Server className="w-5 h-5 mr-2 text-primary-500" />
                Technical Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Security Control Type */}
                <div>
                  <label htmlFor="securityControlType" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                    Security Control Type
                  </label>
                  <select
                    id="securityControlType"
                    name="securityControlType"
                    value={formData.securityControlType}
                    onChange={handleChange}
                    className="
                      block w-full px-3 py-2 rounded-md 
                      border border-secondary-300 dark:border-secondary-600 
                      bg-white dark:bg-secondary-700 
                      text-secondary-900 dark:text-white
                      focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                    "
                  >
                    <option value="technical">Technical</option>
                    <option value="administrative">Administrative</option>
                    <option value="physical">Physical</option>
                  </select>
                </div>
                
                {/* Maturity Level */}
                <div>
                  <label htmlFor="maturityLevel" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                    Maturity Level
                  </label>
                  <select
                    id="maturityLevel"
                    name="maturityLevel"
                    value={formData.maturityLevel}
                    onChange={handleChange}
                    className="
                      block w-full px-3 py-2 rounded-md 
                      border border-secondary-300 dark:border-secondary-600 
                      bg-white dark:bg-secondary-700 
                      text-secondary-900 dark:text-white
                      focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                    "
                  >
                    <option value="IG1">IG1 (Basic)</option>
                    <option value="IG2">IG2 (Intermediate)</option>
                    <option value="IG3">IG3 (Advanced)</option>
                  </select>
                </div>
                
                {/* Implementation Complexity */}
                <div>
                  <label htmlFor="implementationComplexity" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                    Implementation Complexity
                  </label>
                  <select
                    id="implementationComplexity"
                    name="implementationComplexity"
                    value={formData.implementationComplexity}
                    onChange={handleChange}
                    className="
                      block w-full px-3 py-2 rounded-md 
                      border border-secondary-300 dark:border-secondary-600 
                      bg-white dark:bg-secondary-700 
                      text-secondary-900 dark:text-white
                      focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                    "
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                
                {/* Technology Stack/Tools */}
                <div className="col-span-2">
                  <label htmlFor="technologyStack" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                    Technology Stack/Tools
                  </label>
                  <textarea
                    id="technologyStack"
                    name="technologyStack"
                    value={formData.technologyStack}
                    onChange={handleChange}
                    rows="2"
                    className={`
                      block w-full px-3 py-2 rounded-md 
                      border ${errors.technologyStack ? 'border-status-error' : 'border-secondary-300 dark:border-secondary-600'} 
                      bg-white dark:bg-secondary-700 
                      text-secondary-900 dark:text-white
                      focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                    `}
                    placeholder="List technologies, tools, or platforms used (e.g., Firewalls, IDS/IPS, SIEM, etc.)"
                  ></textarea>
                  {errors.technologyStack && touched.technologyStack && (
                    <p className="mt-1 text-sm text-status-error">{errors.technologyStack}</p>
                  )}
                </div>
                
                {/* Dependencies */}
                <div className="col-span-2">
                  <label htmlFor="dependencies" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                    Dependencies
                  </label>
                  <textarea
                    id="dependencies"
                    name="dependencies"
                    value={formData.dependencies}
                    onChange={handleChange}
                    rows="2"
                    className="
                      block w-full px-3 py-2 rounded-md 
                      border border-secondary-300 dark:border-secondary-600 
                      bg-white dark:bg-secondary-700 
                      text-secondary-900 dark:text-white
                      focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                    "
                    placeholder="List any dependencies on other capabilities, systems, or processes"
                  ></textarea>
                </div>
              </div>
            </div>
            
            {/* ===== Business & Risk Section ===== */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-secondary-900 dark:text-white flex items-center mb-4">
                <Building className="w-5 h-5 mr-2 text-primary-500" />
                Business & Risk
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Business Value */}
                <div>
                  <label htmlFor="businessValue" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                    Business Value (1-5)
                  </label>
                  <div className="flex items-center">
                    <input
                      type="range"
                      id="businessValue"
                      name="businessValue"
                      min="1"
                      max="5"
                      step="0.1"
                      value={formData.businessValue}
                      onChange={handleChange}
                      className="flex-1 mr-3 accent-primary-500"
                    />
                    <div className="flex items-center bg-primary-50 dark:bg-primary-900/20 px-3 py-1 rounded-md">
                      <Star className="w-4 h-4 text-primary-500 mr-1" />
                      <span className="text-primary-700 dark:text-primary-300 font-medium">
                        {parseFloat(formData.businessValue).toFixed(1)}
                      </span>
                    </div>
                  </div>
                  {errors.businessValue && touched.businessValue && (
                    <p className="mt-1 text-sm text-status-error">{errors.businessValue}</p>
                  )}
                </div>
                
                {/* Estimated ROI */}
                <div>
                  <label htmlFor="estimatedROI" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                    Estimated ROI (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      id="estimatedROI"
                      name="estimatedROI"
                      value={formData.estimatedROI}
                      onChange={handleChange}
                      className={`
                        block w-full px-3 py-2 rounded-md 
                        border ${errors.estimatedROI ? 'border-status-error' : 'border-secondary-300 dark:border-secondary-600'} 
                        bg-white dark:bg-secondary-700 
                        text-secondary-900 dark:text-white
                        focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                        pr-10
                      `}
                      placeholder="100"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <Percent className="w-4 h-4 text-secondary-500 dark:text-secondary-400" />
                    </div>
                  </div>
                  {errors.estimatedROI && touched.estimatedROI && (
                    <p className="mt-1 text-sm text-status-error">{errors.estimatedROI}</p>
                  )}
                </div>
                
                {/* Risk Level Addressed */}
                <div>
                  <label htmlFor="riskLevelAddressed" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                    Risk Level Addressed
                  </label>
                  <select
                    id="riskLevelAddressed"
                    name="riskLevelAddressed"
                    value={formData.riskLevelAddressed}
                    onChange={handleChange}
                    className="
                      block w-full px-3 py-2 rounded-md 
                      border border-secondary-300 dark:border-secondary-600 
                      bg-white dark:bg-secondary-700 
                      text-secondary-900 dark:text-white
                      focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                    "
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
                
                {/* Business Impact */}
                <div className="col-span-2">
                  <label htmlFor="businessImpact" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                    Business Impact
                  </label>
                  <textarea
                    id="businessImpact"
                    name="businessImpact"
                    value={formData.businessImpact}
                    onChange={handleChange}
                    rows="2"
                    className="
                      block w-full px-3 py-2 rounded-md 
                      border border-secondary-300 dark:border-secondary-600 
                      bg-white dark:bg-secondary-700 
                      text-secondary-900 dark:text-white
                      focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                    "
                    placeholder="Describe the impact this capability has on business operations and security posture"
                  ></textarea>
                </div>
              </div>
            </div>
            
            {/* ===== Compliance & Frameworks Section ===== */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-secondary-900 dark:text-white flex items-center mb-4">
                <Shield className="w-5 h-5 mr-2 text-primary-500" />
                Compliance & Frameworks
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Compliance Frameworks */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    Compliance Frameworks
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {frameworkOptions.map(framework => (
                      <label 
                        key={framework.id} 
                        className="flex items-center space-x-2 p-2 rounded-md border border-secondary-200 dark:border-secondary-700 hover:bg-secondary-50 dark:hover:bg-secondary-700/50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={formData.complianceFrameworks?.includes(framework.id)}
                          onChange={() => handleFrameworkChange(framework.id)}
                          className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500 dark:border-secondary-600 dark:bg-secondary-800"
                        />
                        <span className="text-sm text-secondary-700 dark:text-secondary-300">{framework.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                {/* Control ID/Reference */}
                <div>
                  <label htmlFor="controlReference" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                    Control ID/Reference
                  </label>
                  <input
                    type="text"
                    id="controlReference"
                    name="controlReference"
                    value={formData.controlReference}
                    onChange={handleChange}
                    className="
                      block w-full px-3 py-2 rounded-md 
                      border border-secondary-300 dark:border-secondary-600 
                      bg-white dark:bg-secondary-700 
                      text-secondary-900 dark:text-white
                      focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                    "
                    placeholder="e.g., ID.AM-1, PR.AC-4, ISO A.9.2.3"
                  />
                </div>
                
                {/* Regulatory Requirement */}
                <div>
                  <div className="flex items-center h-full">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="isRegulatoryRequirement"
                        checked={formData.isRegulatoryRequirement}
                        onChange={handleChange}
                        className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500 dark:border-secondary-600 dark:bg-secondary-800 h-5 w-5"
                      />
                      <span className="ml-2 text-sm text-secondary-700 dark:text-secondary-300">
                        This is a regulatory requirement
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
            
            {/* ===== Resource Management Section ===== */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-secondary-900 dark:text-white flex items-center mb-4">
                <Briefcase className="w-5 h-5 mr-2 text-primary-500" />
                Resource Management
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Responsible Team/Owner */}
                <div>
                  <label htmlFor="responsibleTeam" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                    Responsible Team/Owner
                  </label>
                  <input
                    type="text"
                    id="responsibleTeam"
                    name="responsibleTeam"
                    value={formData.responsibleTeam}
                    onChange={handleChange}
                    className="
                      block w-full px-3 py-2 rounded-md 
                      border border-secondary-300 dark:border-secondary-600 
                      bg-white dark:bg-secondary-700 
                      text-secondary-900 dark:text-white
                      focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                    "
                    placeholder="e.g., OT Security Team, John Smith"
                  />
                </div>
                
                {/* Budget/Cost */}
                <div>
                  <label htmlFor="budget" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                    Budget/Cost
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <DollarSign className="w-4 h-4 text-secondary-500 dark:text-secondary-400" />
                    </div>
                    <input
                      type="text"
                      id="budget"
                      name="budget"
                      value={formData.budget}
                      onChange={handleChange}
                      className={`
                        block w-full pl-10 px-3 py-2 rounded-md 
                        border ${errors.budget ? 'border-status-error' : 'border-secondary-300 dark:border-secondary-600'} 
                        bg-white dark:bg-secondary-700 
                        text-secondary-900 dark:text-white
                        focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                      `}
                      placeholder="e.g., 50000"
                    />
                  </div>
                  {errors.budget && touched.budget && (
                    <p className="mt-1 text-sm text-status-error">{errors.budget}</p>
                  )}
                </div>
                
                {/* Timeline */}
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    className="
                      block w-full px-3 py-2 rounded-md 
                      border border-secondary-300 dark:border-secondary-600 
                      bg-white dark:bg-secondary-700 
                      text-secondary-900 dark:text-white
                      focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                    "
                  />
                </div>
                
                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    className={`
                      block w-full px-3 py-2 rounded-md 
                      border ${errors.endDate ? 'border-status-error' : 'border-secondary-300 dark:border-secondary-600'} 
                      bg-white dark:bg-secondary-700 
                      text-secondary-900 dark:text-white
                      focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                    `}
                  />
                  {errors.endDate && touched.endDate && (
                    <p className="mt-1 text-sm text-status-error">{errors.endDate}</p>
                  )}
                </div>
                
                {/* Resources Required */}
                <div className="col-span-2">
                  <label htmlFor="resourcesRequired" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                    Resources Required
                  </label>
                  <textarea
                    id="resourcesRequired"
                    name="resourcesRequired"
                    value={formData.resourcesRequired}
                    onChange={handleChange}
                    rows="2"
                    className="
                      block w-full px-3 py-2 rounded-md 
                      border border-secondary-300 dark:border-secondary-600 
                      bg-white dark:bg-secondary-700 
                      text-secondary-900 dark:text-white
                      focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                    "
                    placeholder="Describe the resources needed (personnel, hardware, software, etc.)"
                  ></textarea>
                </div>
              </div>
            </div>
            
            {/* ===== Monitoring & Metrics Section ===== */}
            <div className="mb-4">
              <h3 className="text-lg font-medium text-secondary-900 dark:text-white flex items-center mb-4">
                <LineChart className="w-5 h-5 mr-2 text-primary-500" />
                Monitoring & Metrics
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Success Metrics/KPIs */}
                <div className="col-span-2">
                  <label htmlFor="successMetrics" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                    Success Metrics/KPIs
                  </label>
                  <textarea
                    id="successMetrics"
                    name="successMetrics"
                    value={formData.successMetrics}
                    onChange={handleChange}
                    rows="2"
                    className="
                      block w-full px-3 py-2 rounded-md 
                      border border-secondary-300 dark:border-secondary-600 
                      bg-white dark:bg-secondary-700 
                      text-secondary-900 dark:text-white
                      focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                    "
                    placeholder="Define how success will be measured for this capability"
                  ></textarea>
                </div>
                
                {/* Monitoring Method */}
                <div>
                  <label htmlFor="monitoringMethod" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                    Monitoring Method
                  </label>
                  <select
                    id="monitoringMethod"
                    name="monitoringMethod"
                    value={formData.monitoringMethod}
                    onChange={handleChange}
                    className="
                      block w-full px-3 py-2 rounded-md 
                      border border-secondary-300 dark:border-secondary-600 
                      bg-white dark:bg-secondary-700 
                      text-secondary-900 dark:text-white
                      focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                    "
                  >
                    <option value="Manual">Manual</option>
                    <option value="Automated">Automated</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
                
                {/* Reporting Frequency */}
                <div>
                  <label htmlFor="reportingFrequency" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                    Reporting Frequency
                  </label>
                  <select
                    id="reportingFrequency"
                    name="reportingFrequency"
                    value={formData.reportingFrequency}
                    onChange={handleChange}
                    className="
                      block w-full px-3 py-2 rounded-md 
                      border border-secondary-300 dark:border-secondary-600 
                      bg-white dark:bg-secondary-700 
                      text-secondary-900 dark:text-white
                      focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                    "
                  >
                    <option value="Daily">Daily</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                  </select>
                </div>
                
                {/* Last Assessment Date */}
                <div>
                  <label htmlFor="lastAssessmentDate" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                    Last Assessment Date
                  </label>
                  <input
                    type="date"
                    id="lastAssessmentDate"
                    name="lastAssessmentDate"
                    value={formData.lastAssessmentDate}
                    onChange={handleChange}
                    className="
                      block w-full px-3 py-2 rounded-md 
                      border border-secondary-300 dark:border-secondary-600 
                      bg-white dark:bg-secondary-700 
                      text-secondary-900 dark:text-white
                      focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                    "
                  />
                </div>
              </div>
            </div>
          </form>
        </div>
        
        {/* Modal footer with action buttons */}
        <div className="flex justify-end gap-3 p-4 border-t dark:border-secondary-700">
          <Button
            variant="secondary"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            leadingIcon={Save}
            type="submit"
            form="capability-form"
          >
            {isNewCapability ? 'Create Capability' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
};

EditCapabilityModal.propTypes = {
  /**
   * Whether the modal is currently open
   */
  isOpen: PropTypes.bool.isRequired,
  
  /**
   * Function to close the modal
   */
  onClose: PropTypes.func.isRequired,
  
  /**
   * The capability object to edit (null for new capability)
   */
  capability: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    description: PropTypes.string,
    status: PropTypes.string,
    securityControlType: PropTypes.string,
    maturityLevel: PropTypes.string,
    implementationComplexity: PropTypes.string,
    businessValue: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    estimatedROI: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
  })
};

export default EditCapabilityModal;
