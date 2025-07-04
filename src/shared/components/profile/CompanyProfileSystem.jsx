// src/components/profile/CompanyProfileSystem.jsx

import React, { useState, useEffect, useReducer } from 'react';
import { 
  Building2, Users, Database, Cloud, Globe, ShieldCheck, FileText, 
  Briefcase, AlertTriangle, TrendingUp, Save, Edit, X, Check, 
  ChevronRight, Info, Lock, Network, Zap, Factory, DollarSign,
  MapPin, Truck, Phone, Mail, Calendar, Clock, Plus, Trash2
} from 'lucide-react';

// Import constants and utilities
import {
  INDUSTRIES,
  COMPANY_TYPES,
  DATA_TYPES,
  TECHNOLOGY_SETUPS,
  REVENUE_MODELS,
  GEOGRAPHIC_REGIONS,
  COMPLIANCE_FRAMEWORKS,
  ANNUAL_REVENUE_RANGES,
  EMPLOYEE_COUNT_RANGES
} from '../../constants/companyProfile';

import {
  determineCompanySize,
  getSuggestedFrameworks,
  validateCompanyProfile,
  getProfileCompletionPercentage
} from '../../utils/companyProfile';

// Initial state for company profile
const initialProfileState = {
  // Basic Company Information
  companyName: '',
  registrationNumber: '',
  industry: '',
  subSector: '',
  companyType: '',
  
  // Company Size Determination (UK Government Thresholds)
  annualRevenue: '',
  employeeCount: '',
  balanceSheetTotal: '',
  
  // Contact Information
  headquarters: '',
  operatingRegions: [],
  contactEmail: '',
  contactPhone: '',
  
  // Data & Technology Profile
  sensitiveDataTypes: [],
  technologySetup: '',
  legacySystemsDetails: '',
  internetFacingAssets: '',
  
  // Compliance & Governance
  complianceRequirements: [],
  otherCompliance: '',
  
  // Operational Details
  remoteEmployees: '',
  contractorAccess: '',
  revenueModel: '',
  
  // Risk Profile
  previousIncidents: false,
  incidentDetails: '',
  criticalVendors: [],
  businessContinuityPlan: false,
  
  // Additional Context
  primaryConcerns: '',
  complianceDeadlines: '',
  budgetRange: '',
  
  // Metadata
  profileCompleted: false,
  lastUpdated: null,
  createdDate: null
};

const profileReducer = (state, action) => {
  switch (action.type) {
    case 'UPDATE_FIELD':
      return {
        ...state,
        [action.field]: action.value
      };
    case 'TOGGLE_ARRAY_ITEM':
      const currentArray = state[action.field] || [];
      const newArray = currentArray.includes(action.value)
        ? currentArray.filter(item => item !== action.value)
        : [...currentArray, action.value];
      return {
        ...state,
        [action.field]: newArray
      };
    case 'ADD_VENDOR':
      return {
        ...state,
        criticalVendors: [...(state.criticalVendors || []), action.vendor]
      };
    case 'REMOVE_VENDOR':
      return {
        ...state,
        criticalVendors: state.criticalVendors.filter((_, index) => index !== action.index)
      };
    case 'LOAD_PROFILE':
      return {
        ...state,
        ...action.profile
      };
    case 'RESET_PROFILE':
      return initialProfileState;
    default:
      return state;
  }
};

// Reusable Form Components
const FormSection = ({ title, description, icon: Icon, children, isOpen = true, onToggle }) => (
  <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
    <div 
      className={`px-6 py-4 border-b border-gray-100 ${onToggle ? 'cursor-pointer hover:bg-gray-50' : ''}`}
      onClick={onToggle}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="bg-blue-100 p-2 rounded-lg mr-3">
            <Icon className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          </div>
        </div>
        {onToggle && (
          <ChevronRight className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
        )}
      </div>
    </div>
    {isOpen && (
      <div className="px-6 py-6">
        {children}
      </div>
    )}
  </div>
);

const FormField = ({ label, error, required = false, children, helpText }) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-700">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {children}
    {helpText && (
      <p className="text-xs text-gray-500 flex items-start">
        <Info className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
        {helpText}
      </p>
    )}
    {error && (
      <p className="text-sm text-red-600 flex items-center">
        <AlertTriangle className="h-4 w-4 mr-1" />
        {error}
      </p>
    )}
  </div>
);

const Checkbox = ({ checked, onChange, label, disabled = false }) => (
  <label className={`flex items-start space-x-3 cursor-pointer group ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
    <div className="relative">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="sr-only"
      />
      <div className={`w-5 h-5 border-2 rounded transition-colors ${
        checked 
          ? 'bg-blue-600 border-blue-600' 
          : 'border-gray-300 group-hover:border-blue-400'
      }`}>
        {checked && <Check className="h-3 w-3 text-white absolute top-0.5 left-0.5" />}
      </div>
    </div>
    <span className="text-sm text-gray-700 leading-5">{label}</span>
  </label>
);

const CompanyProfileSystem = ({ onProfileUpdate, existingProfile, embedded = false }) => {
  const [profile, dispatch] = useReducer(profileReducer, initialProfileState);
  const [isEditing, setIsEditing] = useState(!existingProfile?.profileCompleted || false);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    contact: true,
    technology: true,
    compliance: true,
    operational: true,
    risk: true,
    additional: false
  });
  const [newVendor, setNewVendor] = useState('');

  // Load existing profile if available
  useEffect(() => {
    if (existingProfile) {
      dispatch({ type: 'LOAD_PROFILE', profile: existingProfile });
      setIsEditing(!existingProfile.profileCompleted);
    }
  }, [existingProfile]);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleFieldChange = (field, value) => {
    dispatch({ type: 'UPDATE_FIELD', field, value });
    
    // Real-time update for company name to change dashboard title immediately
    if (field === 'companyName' && onProfileUpdate) {
      const updatedProfile = { ...profile, [field]: value };
      onProfileUpdate(updatedProfile, false); // false indicates this is not a final save
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleArrayToggle = (field, value) => {
    dispatch({ type: 'TOGGLE_ARRAY_ITEM', field, value });
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const addVendor = () => {
    if (newVendor.trim()) {
      dispatch({ type: 'ADD_VENDOR', vendor: { name: newVendor.trim(), critical: true } });
      setNewVendor('');
    }
  };

  const removeVendor = (index) => {
    dispatch({ type: 'REMOVE_VENDOR', index });
  };

  const handleSave = async () => {
    const validationErrors = validateCompanyProfile(profile);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSaving(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedProfile = {
        ...profile,
        profileCompleted: true,
        lastUpdated: new Date().toISOString(),
        createdDate: profile.createdDate || new Date().toISOString()
      };
      
      // Call the parent's update handler
      if (onProfileUpdate) {
        onProfileUpdate(updatedProfile, true); // true indicates this is a final save
      }
      
      setIsEditing(false);
      setErrors({});
      
    } catch (error) {
      console.error('Failed to save profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setErrors({});
  };

  const handleCancel = () => {
    setIsEditing(false);
    setErrors({});
    // Reset to existing profile state
    if (existingProfile) {
      dispatch({ type: 'LOAD_PROFILE', profile: existingProfile });
    }
  };

  // Calculate completion percentage and company size
  const completionPercentage = getProfileCompletionPercentage(profile);
  const companySize = determineCompanySize(profile);
  const suggestedFrameworks = companySize ? getSuggestedFrameworks(companySize) : [];

  return (
    <div className={`${embedded ? '' : 'min-h-screen bg-gray-50 py-8'}`}>
      <div className={`${embedded ? '' : 'max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'}`}>
        {/* Header */}
        {!embedded && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between">
              <div className="mb-4 lg:mb-0">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Building2 className="h-6 w-6 mr-3 text-blue-600" />
                  Company Security Profile
                </h1>
                <p className="text-gray-600 mt-1">
                  Complete your company profile to enable tailored threat assessment and risk management
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                {/* Completion Progress */}
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${completionPercentage}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{completionPercentage}%</span>
                </div>
                
                {/* Action Buttons */}
                <div className="flex space-x-3">
                  {isEditing ? (
                    <>
                      <button
                        onClick={handleCancel}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        {saving ? (
                          <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                        ) : (
                          <Save className="h-4 w-4 mr-2" />
                        )}
                        {saving ? 'Saving...' : 'Save Profile'}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={handleEdit}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </button>
                  )}
                </div>
              </div>
            </div>
            
            {profile.lastUpdated && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-500 flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  Last updated: {new Date(profile.lastUpdated).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        )}

        <div className="space-y-6">
          {/* Basic Company Information */}
          <FormSection
            title="Basic Company Information"
            description="Essential details about your organization"
            icon={Building2}
            isOpen={expandedSections.basic}
            onToggle={() => toggleSection('basic')}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField 
                label="Company Name" 
                required 
                error={errors.companyName}
                helpText="Full legal name of your organization"
              >
                <input
                  type="text"
                  value={profile.companyName}
                  onChange={(e) => handleFieldChange('companyName', e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                  placeholder="Enter company name"
                />
              </FormField>

              <FormField label="Registration Number">
                <input
                  type="text"
                  value={profile.registrationNumber}
                  onChange={(e) => handleFieldChange('registrationNumber', e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                  placeholder="Company registration number"
                />
              </FormField>

              <FormField 
                label="Industry/Sector" 
                required 
                error={errors.industry}
                helpText="Primary industry classification"
              >
                <select
                  value={profile.industry}
                  onChange={(e) => handleFieldChange('industry', e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                >
                  <option value="">Select industry</option>
                  {INDUSTRIES.map(industry => (
                    <option key={industry} value={industry}>{industry}</option>
                  ))}
                </select>
              </FormField>

              <FormField label="Sub-sector">
                <input
                  type="text"
                  value={profile.subSector}
                  onChange={(e) => handleFieldChange('subSector', e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                  placeholder="Specific sub-sector or market segment"
                />
              </FormField>

              <FormField 
                label="Annual Revenue Range" 
                required 
                error={errors.annualRevenue}
                helpText="Select your annual turnover range"
              >
                <select
                  value={profile.annualRevenue}
                  onChange={(e) => handleFieldChange('annualRevenue', e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                >
                  <option value="">Select annual revenue range</option>
                  {ANNUAL_REVENUE_RANGES.map(range => (
                    <option key={range.value} value={range.value}>{range.label}</option>
                  ))}
                </select>
              </FormField>

              <FormField 
                label="Number of Employees" 
                required 
                error={errors.employeeCount}
                helpText="Total number of employees in your organization"
              >
                <select
                  value={profile.employeeCount}
                  onChange={(e) => handleFieldChange('employeeCount', e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                >
                  <option value="">Select employee count</option>
                  {EMPLOYEE_COUNT_RANGES.map(range => (
                    <option key={range.value} value={range.value}>{range.label}</option>
                  ))}
                </select>
              </FormField>

              <FormField 
                label="Company Type" 
                required 
                error={errors.companyType}
              >
                <select
                  value={profile.companyType}
                  onChange={(e) => handleFieldChange('companyType', e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                >
                  <option value="">Select company type</option>
                  {COMPANY_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </FormField>

              <FormField label="Balance Sheet Total (Optional)">
                <input
                  type="text"
                  value={profile.balanceSheetTotal}
                  onChange={(e) => handleFieldChange('balanceSheetTotal', e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                  placeholder="e.g., £2.5M"
                />
              </FormField>
            </div>
          </FormSection>

          {/* Contact & Geographic Information */}
          <FormSection
            title="Contact & Geographic Information"
            description="Location and contact details"
            icon={MapPin}
            isOpen={expandedSections.contact}
            onToggle={() => toggleSection('contact')}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField 
                label="Primary Contact Email" 
                required 
                error={errors.contactEmail}
              >
                <input
                  type="email"
                  value={profile.contactEmail}
                  onChange={(e) => handleFieldChange('contactEmail', e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                  placeholder="contact@company.com"
                />
              </FormField>

              <FormField label="Primary Contact Phone">
                <input
                  type="tel"
                  value={profile.contactPhone}
                  onChange={(e) => handleFieldChange('contactPhone', e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                  placeholder="+44 20 1234 5678"
                />
              </FormField>

              <FormField label="Headquarters Location" className="md:col-span-2">
                <input
                  type="text"
                  value={profile.headquarters}
                  onChange={(e) => handleFieldChange('headquarters', e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                  placeholder="City, Country"
                />
              </FormField>
            </div>

            <FormField 
              label="Operating Regions" 
              required 
              error={errors.operatingRegions}
              helpText="Select all regions where you operate"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-2">
                {GEOGRAPHIC_REGIONS.map(region => (
                  <Checkbox
                    key={region}
                    checked={profile.operatingRegions.includes(region)}
                    onChange={() => handleArrayToggle('operatingRegions', region)}
                    label={region}
                    disabled={!isEditing}
                  />
                ))}
              </div>
            </FormField>
          </FormSection>

          {/* Technology & Data Profile */}
          <FormSection
            title="Technology & Data Profile"
            description="IT infrastructure and data handling details"
            icon={Cloud}
            isOpen={expandedSections.technology}
            onToggle={() => toggleSection('technology')}
          >
            <div className="space-y-6">
              <FormField 
                label="Technology Infrastructure Setup" 
                required 
                error={errors.technologySetup}
                helpText="Primary technology architecture"
              >
                <select
                  value={profile.technologySetup}
                  onChange={(e) => handleFieldChange('technologySetup', e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                >
                  <option value="">Select technology setup</option>
                  {TECHNOLOGY_SETUPS.map(setup => (
                    <option key={setup} value={setup}>{setup}</option>
                  ))}
                </select>
              </FormField>

              <FormField 
                label="Sensitive Data Types Handled" 
                required 
                error={errors.sensitiveDataTypes}
                helpText="Select all types of sensitive data your organization handles"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                  {DATA_TYPES.map(dataType => (
                    <Checkbox
                      key={dataType}
                      checked={profile.sensitiveDataTypes.includes(dataType)}
                      onChange={() => handleArrayToggle('sensitiveDataTypes', dataType)}
                      label={dataType}
                      disabled={!isEditing}
                    />
                  ))}
                </div>
              </FormField>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField 
                  label="Legacy Systems Details"
                  helpText="Describe any legacy or end-of-life systems"
                >
                  <textarea
                    value={profile.legacySystemsDetails}
                    onChange={(e) => handleFieldChange('legacySystemsDetails', e.target.value)}
                    disabled={!isEditing}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                    placeholder="Describe legacy systems and their criticality"
                  />
                </FormField>

                <FormField 
                  label="Internet-Facing Assets"
                  helpText="Public-facing systems and services"
                >
                  <textarea
                    value={profile.internetFacingAssets}
                    onChange={(e) => handleFieldChange('internetFacingAssets', e.target.value)}
                    disabled={!isEditing}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                    placeholder="List public-facing systems, websites, APIs, etc."
                  />
                </FormField>
              </div>
            </div>
          </FormSection>

          {/* Compliance & Regulatory */}
          <FormSection
            title="Compliance & Regulatory Requirements"
            description="Applicable regulations and compliance frameworks"
            icon={ShieldCheck}
            isOpen={expandedSections.compliance}
            onToggle={() => toggleSection('compliance')}
          >
            {/* Company Size Classification Display */}
            {companySize && (
              <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`p-2 rounded-lg mr-3 ${
                      companySize === 'MICRO' ? 'bg-green-100' :
                      companySize === 'SMALL' ? 'bg-blue-100' :
                      companySize === 'MEDIUM' ? 'bg-purple-100' :
                      'bg-orange-100'
                    }`}>
                      <Building2 className={`h-5 w-5 ${
                        companySize === 'MICRO' ? 'text-green-600' :
                        companySize === 'SMALL' ? 'text-blue-600' :
                        companySize === 'MEDIUM' ? 'text-purple-600' :
                        'text-orange-600'
                      }`} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        Classification: {companySize} Business
                      </h4>
                      <p className="text-sm text-gray-600">
                        Based on UK Government thresholds (effective April 2025)
                      </p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    companySize === 'MICRO' ? 'bg-green-100 text-green-800' :
                    companySize === 'SMALL' ? 'bg-blue-100 text-blue-800' :
                    companySize === 'MEDIUM' ? 'bg-purple-100 text-purple-800' :
                    'bg-orange-100 text-orange-800'
                  }`}>
                    {companySize}
                  </div>
                </div>
                
                {suggestedFrameworks.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-blue-200">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Recommended Compliance Frameworks:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {suggestedFrameworks.slice(0, 3).map((framework, index) => (
                        <span key={index} className="text-xs bg-white bg-opacity-70 text-gray-700 px-2 py-1 rounded-full border border-blue-200">
                          {framework.name.split(' - ')[0]}
                        </span>
                      ))}
                      {suggestedFrameworks.length > 3 && (
                        <span className="text-xs text-blue-600 font-medium">
                          +{suggestedFrameworks.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-6">
              <FormField 
                label="Applicable Compliance Frameworks"
                helpText="Select all regulations and frameworks that apply to your organization"
              >
                {['International', 'Regional/National', 'Industry-Specific', 'SME-Focused'].map(category => (
                  <div key={category} className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-2 ${
                        category === 'International' ? 'bg-blue-500' :
                        category === 'Regional/National' ? 'bg-green-500' :
                        category === 'Industry-Specific' ? 'bg-purple-500' :
                        'bg-orange-500'
                      }`} />
                      {category} Frameworks
                    </h4>
                    <div className="grid grid-cols-1 gap-2 pl-5">
                      {COMPLIANCE_FRAMEWORKS
                        .filter(framework => framework.category === category)
                        .map(framework => (
                          <Checkbox
                            key={framework.name}
                            checked={profile.complianceRequirements.includes(framework.name)}
                            onChange={() => handleArrayToggle('complianceRequirements', framework.name)}
                            label={framework.name}
                            disabled={!isEditing}
                          />
                        ))}
                    </div>
                  </div>
                ))}
              </FormField>

              <FormField label="Other Compliance Requirements">
                <textarea
                  value={profile.otherCompliance}
                  onChange={(e) => handleFieldChange('otherCompliance', e.target.value)}
                  disabled={!isEditing}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                  placeholder="Describe any additional compliance requirements or industry-specific regulations"
                />
              </FormField>

              <FormField label="Upcoming Compliance Deadlines">
                <textarea
                  value={profile.complianceDeadlines}
                  onChange={(e) => handleFieldChange('complianceDeadlines', e.target.value)}
                  disabled={!isEditing}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                  placeholder="List any upcoming compliance deadlines or audit dates"
                />
              </FormField>
            </div>
          </FormSection>

          {/* Operational Details */}
          <FormSection
            title="Operational Details"
            description="Workforce and business model information"
            icon={Users}
            isOpen={expandedSections.operational}
            onToggle={() => toggleSection('operational')}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField 
                label="Remote/Hybrid Employees"
                helpText="Number or percentage of remote workers"
              >
                <input
                  type="text"
                  value={profile.remoteEmployees}
                  onChange={(e) => handleFieldChange('remoteEmployees', e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                  placeholder="e.g., 50% or 200 employees"
                />
              </FormField>

              <FormField label="Primary Revenue Model">
                <select
                  value={profile.revenueModel}
                  onChange={(e) => handleFieldChange('revenueModel', e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                >
                  <option value="">Select revenue model</option>
                  {REVENUE_MODELS.map(model => (
                    <option key={model} value={model}>{model}</option>
                  ))}
                </select>
              </FormField>
            </div>

            <FormField label="Contractor and Third-Party Access">
              <textarea
                value={profile.contractorAccess}
                onChange={(e) => handleFieldChange('contractorAccess', e.target.value)}
                disabled={!isEditing}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                placeholder="Describe contractor access levels and third-party integrations"
              />
            </FormField>
          </FormSection>

          {/* Risk & Security Profile */}
          <FormSection
            title="Risk & Security Profile"
            description="Previous incidents and critical dependencies"
            icon={AlertTriangle}
            isOpen={expandedSections.risk}
            onToggle={() => toggleSection('risk')}
          >
            <div className="space-y-6">
              <FormField label="Previous Security Incidents">
                <div className="space-y-4">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="previousIncidents"
                      checked={profile.previousIncidents === false}
                      onChange={() => handleFieldChange('previousIncidents', false)}
                      disabled={!isEditing}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">No previous security incidents in the past 2 years</span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="previousIncidents"
                      checked={profile.previousIncidents === true}
                      onChange={() => handleFieldChange('previousIncidents', true)}
                      disabled={!isEditing}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Yes, we have experienced security incidents</span>
                  </label>
                </div>
              </FormField>

              {profile.previousIncidents && (
                <FormField label="Incident Details">
                  <textarea
                    value={profile.incidentDetails}
                    onChange={(e) => handleFieldChange('incidentDetails', e.target.value)}
                    disabled={!isEditing}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                    placeholder="Please describe the nature and impact of previous incidents (without sensitive details)"
                  />
                </FormField>
              )}

              <FormField 
                label="Critical Vendors and Suppliers"
                helpText="Key third-party dependencies"
              >
                <div className="space-y-3">
                  {profile.criticalVendors.map((vendor, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-900">{vendor.name}</span>
                      {isEditing && (
                        <button
                          onClick={() => removeVendor(index)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  
                  {isEditing && (
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newVendor}
                        onChange={(e) => setNewVendor(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Add critical vendor"
                        onKeyPress={(e) => e.key === 'Enter' && addVendor()}
                      />
                      <button
                        onClick={addVendor}
                        className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </FormField>

              <FormField label="Business Continuity Plan">
                <div className="space-y-3">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="businessContinuityPlan"
                      checked={profile.businessContinuityPlan === true}
                      onChange={() => handleFieldChange('businessContinuityPlan', true)}
                      disabled={!isEditing}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Yes, we have a current business continuity plan</span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="businessContinuityPlan"
                      checked={profile.businessContinuityPlan === false}
                      onChange={() => handleFieldChange('businessContinuityPlan', false)}
                      disabled={!isEditing}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">No, we need to develop a business continuity plan</span>
                  </label>
                </div>
              </FormField>
            </div>
          </FormSection>

          {/* Additional Context */}
          <FormSection
            title="Additional Context"
            description="Optional details for enhanced threat assessment"
            icon={FileText}
            isOpen={expandedSections.additional}
            onToggle={() => toggleSection('additional')}
          >
            <div className="space-y-6">
              <FormField 
                label="Primary Security Concerns"
                helpText="What are your main cybersecurity concerns or priorities?"
              >
                <textarea
                  value={profile.primaryConcerns}
                  onChange={(e) => handleFieldChange('primaryConcerns', e.target.value)}
                  disabled={!isEditing}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                  placeholder="Describe your primary security concerns, upcoming changes, or specific threats you're worried about"
                />
              </FormField>

              <FormField label="Cybersecurity Budget Range">
                <select
                  value={profile.budgetRange}
                  onChange={(e) => handleFieldChange('budgetRange', e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                >
                  <option value="">Select budget range</option>
                  <option value="Under £50k">Under £50k</option>
                  <option value="£50k - £250k">£50k - £250k</option>
                  <option value="£250k - £1M">£250k - £1M</option>
                  <option value="£1M - £5M">£1M - £5M</option>
                  <option value="Over £5M">Over £5M</option>
                  <option value="Not defined">Not yet defined</option>
                </select>
              </FormField>
            </div>
          </FormSection>
        </div>

        {/* Bottom Action Bar for Mobile */}
        {isEditing && (
          <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 mt-8 rounded-t-xl shadow-lg">
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancel}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyProfileSystem;