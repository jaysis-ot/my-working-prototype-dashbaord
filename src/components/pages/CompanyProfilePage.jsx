import React, { useState, useEffect, useReducer, useCallback } from 'react';
import {
  Building2, Users, Cloud, Globe, ShieldCheck, FileText,
  Briefcase, AlertTriangle, TrendingUp, Save, Edit, X, Check,
  ChevronRight, Info, Lock, Network, Zap, Factory, DollarSign,
  MapPin, Truck, Phone, Mail, Calendar, Clock, Plus, Trash2
} from 'lucide-react';

// Import Atoms and other components from our new design system
import Button from '../atoms/Button';
import Input from '../atoms/Input';
import Badge from '../atoms/Badge';

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

// --- Local State Management ---

const initialProfileState = {
  companyName: '',
  registrationNumber: '',
  industry: '',
  subSector: '',
  companyType: '',
  annualRevenue: '',
  employeeCount: '',
  balanceSheetTotal: '',
  headquarters: '',
  operatingRegions: [],
  contactEmail: '',
  contactPhone: '',
  sensitiveDataTypes: [],
  technologySetup: '',
  legacySystemsDetails: '',
  internetFacingAssets: '',
  complianceRequirements: [],
  otherCompliance: '',
  remoteEmployees: '',
  contractorAccess: '',
  revenueModel: '',
  previousIncidents: false,
  incidentDetails: '',
  criticalVendors: [],
  businessContinuityPlan: false,
  primaryConcerns: '',
  complianceDeadlines: '',
  budgetRange: '',
  profileCompleted: false,
  lastUpdated: null,
  createdDate: null
};

const profileReducer = (state, action) => {
  switch (action.type) {
    case 'UPDATE_FIELD':
      return { ...state, [action.field]: action.value };
    case 'TOGGLE_ARRAY_ITEM':
      const currentArray = state[action.field] || [];
      const newArray = currentArray.includes(action.value)
        ? currentArray.filter(item => item !== action.value)
        : [...currentArray, action.value];
      return { ...state, [action.field]: newArray };
    case 'ADD_VENDOR':
      return { ...state, criticalVendors: [...(state.criticalVendors || []), action.vendor] };
    case 'REMOVE_VENDOR':
      return { ...state, criticalVendors: state.criticalVendors.filter((_, index) => index !== action.index) };
    case 'LOAD_PROFILE':
      return { ...state, ...action.profile };
    case 'RESET_PROFILE':
      return initialProfileState;
    default:
      return state;
  }
};

// --- Reusable Molecules (Internal to this page) ---

const FormSection = ({ title, description, icon: Icon, children, isOpen, onToggle }) => (
  <div className="dashboard-card overflow-hidden">
    <button
      className="w-full px-6 py-4 border-b border-secondary-200 dark:border-secondary-700 flex items-center justify-between text-left hover:bg-secondary-50 dark:hover:bg-secondary-700/50 transition-colors"
      onClick={onToggle}
      aria-expanded={isOpen}
    >
      <div className="flex items-center">
        <div className="bg-primary-100 dark:bg-primary-500/20 p-2 rounded-lg mr-4">
          <Icon className="h-6 w-6 text-primary-600 dark:text-primary-300" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-secondary-900 dark:text-white">{title}</h3>
          <p className="text-sm text-secondary-500 dark:text-secondary-400 mt-1">{description}</p>
        </div>
      </div>
      <ChevronRight className={`h-5 w-5 text-secondary-400 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
    </button>
    {isOpen && (
      <div className="px-6 py-6 bg-white dark:bg-secondary-800">
        {children}
      </div>
    )}
  </div>
);

const Checkbox = ({ checked, onChange, label, disabled = false }) => (
  <label className={`flex items-start space-x-3 group ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}>
    <div className="relative flex items-center">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="sr-only"
      />
      <div className={`w-5 h-5 border-2 rounded-md transition-colors ${
        checked
          ? 'bg-primary-600 border-primary-600'
          : 'border-secondary-300 dark:border-secondary-600 group-hover:border-primary-400'
      }`}>
        {checked && <Check className="h-4 w-4 text-white absolute top-0.5 left-0.5" />}
      </div>
    </div>
    <span className="text-sm text-secondary-700 dark:text-secondary-300 leading-5">{label}</span>
  </label>
);

// --- Page Component ---

const CompanyProfilePage = ({ onProfileUpdate, existingProfile }) => {
  const [profile, dispatch] = useReducer(profileReducer, initialProfileState);
  const [isEditing, setIsEditing] = useState(!existingProfile?.profileCompleted || true);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    basic: true, contact: true, technology: true, compliance: true,
    operational: false, risk: false, additional: false
  });
  const [newVendor, setNewVendor] = useState('');

  useEffect(() => {
    // Load a mock profile if none is provided, for demonstration
    const mockProfile = {
      ...initialProfileState,
      companyName: 'Cyber Solutions Inc.',
      industry: 'Financial Services',
      annualRevenue: '25m-54m',
      employeeCount: '101-250',
      contactEmail: 'contact@cybersolutions.com',
      operatingRegions: ['North America', 'European Union'],
      technologySetup: 'Hybrid Cloud/On-premise',
      sensitiveDataTypes: ['Financial Data', 'PII'],
    };
    const profileToLoad = existingProfile || mockProfile;
    dispatch({ type: 'LOAD_PROFILE', profile: profileToLoad });
    setIsEditing(!profileToLoad.profileCompleted);
  }, [existingProfile]);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleFieldChange = useCallback((field, value) => {
    dispatch({ type: 'UPDATE_FIELD', field, value });
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  }, [errors]);

  const handleArrayToggle = useCallback((field, value) => {
    dispatch({ type: 'TOGGLE_ARRAY_ITEM', field, value });
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  }, [errors]);

  const addVendor = useCallback(() => {
    if (newVendor.trim()) {
      dispatch({ type: 'ADD_VENDOR', vendor: { name: newVendor.trim(), critical: true } });
      setNewVendor('');
    }
  }, [newVendor]);

  const removeVendor = useCallback((index) => {
    dispatch({ type: 'REMOVE_VENDOR', index });
  }, []);

  const handleSave = useCallback(async () => {
    const validationErrors = validateCompanyProfile(profile);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      // Optionally, expand sections with errors
      return;
    }

    setSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const updatedProfile = {
        ...profile,
        profileCompleted: true,
        lastUpdated: new Date().toISOString(),
        createdDate: profile.createdDate || new Date().toISOString()
      };
      if (onProfileUpdate) onProfileUpdate(updatedProfile, true);
      dispatch({ type: 'LOAD_PROFILE', profile: updatedProfile });
      setIsEditing(false);
      setErrors({});
    } catch (error) {
      console.error('Failed to save profile:', error);
    } finally {
      setSaving(false);
    }
  }, [profile, onProfileUpdate]);

  const handleEdit = () => setIsEditing(true);
  const handleCancel = () => {
    setIsEditing(false);
    setErrors({});
    if (existingProfile) dispatch({ type: 'LOAD_PROFILE', profile: existingProfile });
  };

  const completionPercentage = getProfileCompletionPercentage(profile);
  const companySize = determineCompanySize(profile);
  const suggestedFrameworks = companySize ? getSuggestedFrameworks(companySize) : [];

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="dashboard-card p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between">
          <div className="mb-4 lg:mb-0">
            <h1 className="text-2xl font-bold text-secondary-900 dark:text-white flex items-center">
              <Building2 className="h-6 w-6 mr-3 text-primary-600" />
              Company Security Profile
            </h1>
            <p className="text-secondary-500 dark:text-secondary-400 mt-1">
              Complete your company profile for tailored threat assessment and risk management.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-28 bg-secondary-200 dark:bg-secondary-700 rounded-full h-2.5">
                <div
                  className="bg-primary-600 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
              <span className="text-sm font-medium text-secondary-700 dark:text-secondary-300">{completionPercentage}% Complete</span>
            </div>
            <div className="flex space-x-3">
              {isEditing ? (
                <>
                  <Button onClick={handleCancel} variant="secondary">Cancel</Button>
                  <Button onClick={handleSave} loading={saving} leadingIcon={Save}>
                    {saving ? 'Saving...' : 'Save Profile'}
                  </Button>
                </>
              ) : (
                <Button onClick={handleEdit} leadingIcon={Edit}>Edit Profile</Button>
              )}
            </div>
          </div>
        </div>
        {profile.lastUpdated && (
          <div className="mt-4 pt-4 border-t border-secondary-100 dark:border-secondary-700">
            <p className="text-sm text-secondary-500 dark:text-secondary-400 flex items-center">
              <Clock className="h-4 w-4 mr-1.5" />
              Last updated: {new Date(profile.lastUpdated).toLocaleDateString()}
            </p>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {/* Basic Company Information */}
        <FormSection title="Basic Company Information" description="Essential details about your organization" icon={Building2} isOpen={expandedSections.basic} onToggle={() => toggleSection('basic')}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Company Name" required error={errors.companyName} value={profile.companyName} onChange={(e) => handleFieldChange('companyName', e.target.value)} disabled={!isEditing} placeholder="Enter company name" />
            <Input label="Registration Number" value={profile.registrationNumber} onChange={(e) => handleFieldChange('registrationNumber', e.target.value)} disabled={!isEditing} placeholder="Company registration number" />
            
            <div>
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Industry/Sector *</label>
              <select value={profile.industry} onChange={(e) => handleFieldChange('industry', e.target.value)} disabled={!isEditing} className="w-full mt-1 block rounded-md border-secondary-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-secondary-800 dark:border-secondary-600 dark:text-white sm:text-sm">
                <option value="">Select industry</option>
                {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
              {errors.industry && <p className="text-sm text-status-error mt-1">{errors.industry}</p>}
            </div>

            <Input label="Sub-sector" value={profile.subSector} onChange={(e) => handleFieldChange('subSector', e.target.value)} disabled={!isEditing} placeholder="Specific sub-sector or market segment" />
            
            <div>
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Annual Revenue Range *</label>
              <select value={profile.annualRevenue} onChange={(e) => handleFieldChange('annualRevenue', e.target.value)} disabled={!isEditing} className="w-full mt-1 block rounded-md border-secondary-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-secondary-800 dark:border-secondary-600 dark:text-white sm:text-sm">
                <option value="">Select range</option>
                {ANNUAL_REVENUE_RANGES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
              {errors.annualRevenue && <p className="text-sm text-status-error mt-1">{errors.annualRevenue}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Number of Employees *</label>
              <select value={profile.employeeCount} onChange={(e) => handleFieldChange('employeeCount', e.target.value)} disabled={!isEditing} className="w-full mt-1 block rounded-md border-secondary-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-secondary-800 dark:border-secondary-600 dark:text-white sm:text-sm">
                <option value="">Select range</option>
                {EMPLOYEE_COUNT_RANGES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
              {errors.employeeCount && <p className="text-sm text-status-error mt-1">{errors.employeeCount}</p>}
            </div>
          </div>
        </FormSection>

        {/* Compliance & Regulatory */}
        <FormSection title="Compliance & Regulatory Requirements" description="Applicable regulations and compliance frameworks" icon={ShieldCheck} isOpen={expandedSections.compliance} onToggle={() => toggleSection('compliance')}>
          {companySize && (
            <div className="mb-6 p-4 bg-primary-50 dark:bg-primary-500/10 rounded-lg border border-primary-200 dark:border-primary-500/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 rounded-lg mr-3 bg-primary-100 dark:bg-primary-500/20"><Building2 className="h-5 w-5 text-primary-600" /></div>
                  <div>
                    <h4 className="font-semibold text-secondary-900 dark:text-white">Classification: {companySize} Business</h4>
                    <p className="text-sm text-secondary-600 dark:text-secondary-400">Based on provided revenue and employee count.</p>
                  </div>
                </div>
                <Badge variant="primary">{companySize}</Badge>
              </div>
              {suggestedFrameworks.length > 0 && (
                <div className="mt-3 pt-3 border-t border-primary-200 dark:border-primary-500/30">
                  <p className="text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">Recommended Frameworks:</p>
                  <div className="flex flex-wrap gap-2">
                    {suggestedFrameworks.map((fw, i) => <Badge key={i} variant="default">{fw.name.split(' - ')[0]}</Badge>)}
                  </div>
                </div>
              )}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">Applicable Compliance Frameworks</label>
            <div className="space-y-4">
              {['International', 'Regional/National', 'Industry-Specific', 'SME-Focused'].map(category => (
                <div key={category}>
                  <h4 className="text-sm font-semibold text-secondary-800 dark:text-secondary-200 mb-2">{category}</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-2">
                    {COMPLIANCE_FRAMEWORKS.filter(fw => fw.category === category).map(fw => (
                      <Checkbox key={fw.name} checked={profile.complianceRequirements.includes(fw.name)} onChange={() => handleArrayToggle('complianceRequirements', fw.name)} label={fw.name} disabled={!isEditing} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </FormSection>
      </div>
    </div>
  );
};

export default CompanyProfilePage;
