import React, { useState, useEffect, useCallback } from 'react';
import { 
  Settings, 
  Shield, 
  Building, 
  Globe, 
  Calculator, 
  Bell, 
  Eye, 
  Download, 
  Upload, 
  Save, 
  RefreshCw,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  Info,
  X,
  Database,
  Filter,
  Users,
  Server,
  Activity,
  Lock,
  BarChart3,
  Clock
} from 'lucide-react';

// Constants
const FRAMEWORK_TYPES = {
  ENTERPRISE: 'enterprise',
  MOBILE: 'mobile',
  ICS: 'ics'
};

const INDUSTRY_SECTORS = {
  FINANCIAL_SERVICES: 'financial_services',
  HEALTHCARE: 'healthcare',
  GOVERNMENT: 'government',
  ENERGY_UTILITIES: 'energy_utilities',
  TECHNOLOGY: 'technology',
  MANUFACTURING: 'manufacturing',
  RETAIL_ECOMMERCE: 'retail_ecommerce',
  EDUCATION: 'education'
};

const COMPANY_SIZES = {
  STARTUP: 'startup',
  SMALL_BUSINESS: 'small_business',
  MEDIUM_ENTERPRISE: 'medium_enterprise',
  LARGE_ENTERPRISE: 'large_enterprise'
};

const GEOGRAPHIC_REGIONS = {
  NORTH_AMERICA: 'north_america',
  EUROPE: 'europe',
  ASIA_PACIFIC: 'asia_pacific',
  MIDDLE_EAST: 'middle_east',
  AFRICA: 'africa',
  LATIN_AMERICA: 'latin_america'
};

// Mapping functions
const mapIndustryToThreatSector = (industry) => {
  const industryMappings = {
    'Financial Services': INDUSTRY_SECTORS.FINANCIAL_SERVICES,
    'Banking': INDUSTRY_SECTORS.FINANCIAL_SERVICES,
    'Healthcare': INDUSTRY_SECTORS.HEALTHCARE,
    'Government': INDUSTRY_SECTORS.GOVERNMENT,
    'Technology': INDUSTRY_SECTORS.TECHNOLOGY,
    'Manufacturing': INDUSTRY_SECTORS.MANUFACTURING,
    'Education': INDUSTRY_SECTORS.EDUCATION
  };
  return industryMappings[industry] || INDUSTRY_SECTORS.TECHNOLOGY;
};

const mapEmployeeCountToCompanySize = (employeeRange) => {
  if (!employeeRange) return COMPANY_SIZES.MEDIUM_ENTERPRISE;
  
  if (employeeRange.includes('1-10') || employeeRange.includes('Under 10')) {
    return COMPANY_SIZES.STARTUP;
  } else if (employeeRange.includes('11-50') || employeeRange.includes('10-50')) {
    return COMPANY_SIZES.STARTUP;
  } else if (employeeRange.includes('51-250') || employeeRange.includes('50-250')) {
    return COMPANY_SIZES.SMALL_BUSINESS;
  } else if (employeeRange.includes('251-1000') || employeeRange.includes('250-1000')) {
    return COMPANY_SIZES.MEDIUM_ENTERPRISE;
  } else {
    return COMPANY_SIZES.LARGE_ENTERPRISE;
  }
};

const ThreatSettings = ({ onClose, onSave, currentSettings = {}, existingCompanyProfile }) => {
  // State management
  const [settings, setSettings] = useState({
    // MITRE Framework Settings
    framework: {
      selectedFramework: FRAMEWORK_TYPES.ENTERPRISE,
      autoDetectFramework: true,
      includeSubTechniques: true,
      confidenceThreshold: 70,
      enableThreatActorMapping: true
    },
    
    // Company Profile Settings
    companyProfile: {
      industry: INDUSTRY_SECTORS.TECHNOLOGY,
      companySize: COMPANY_SIZES.MEDIUM_ENTERPRISE,
      geography: GEOGRAPHIC_REGIONS.NORTH_AMERICA,
      annualRevenue: 100000000,
      employeeCount: 500,
      hasCloudInfrastructure: true,
      hasLegacySystems: false,
      businessFunctions: ['information_technology', 'sales_marketing'],
      regulatoryRequirements: ['SOC 2', 'GDPR']
    },
    
    // Risk Calculation Settings
    riskCalculation: {
      calculationMethod: 'weighted',
      weights: {
        probability: 0.3,
        impact: 0.4,
        velocity: 0.1,
        detectability: 0.1,
        controllability: 0.1
      },
      riskAppetite: 'moderate',
      useMonteCarloSimulation: false,
      simulationIterations: 10000,
      timeHorizon: 12,
      confidenceLevel: 0.95
    },
    
    // Threat Processing Settings
    threatProcessing: {
      autoThreatMapping: true,
      enableRealTimeAnalysis: true,
      threatIntelligenceFeeds: ['mitre', 'cisa', 'nist'],
      alertThreshold: 'medium',
      retentionPeriod: 365,
      enableMachineLearning: true
    },
    
    // Intelligence Feeds
    feeds: {
      enabled: ['rss_feeds', 'mitre_attack', 'commercial_feeds'],
      updateFrequency: 'hourly',
      retentionDays: 90
    },
    
    // Filtering Settings
    filters: {
      minRiskScore: 7,
      minConfidence: 75,
      severityLevels: ['CRITICAL', 'HIGH'],
      sources: ['ncsc', 'ofgem', 'commercial']
    },
    
    // Notification Settings
    notifications: {
      emailAlerts: true,
      smsAlerts: false,
      desktopNotifications: true,
      slackIntegration: false,
      alertFrequency: 'immediate',
      criticalOnly: true,
      escalationMatrix: [
        { level: 'low', recipients: ['security-team@company.com'] },
        { level: 'medium', recipients: ['security-team@company.com', 'ciso@company.com'] },
        { level: 'high', recipients: ['security-team@company.com', 'ciso@company.com', 'ceo@company.com'] }
      ]
    },
    
    // Display & UI Settings
    display: {
      theme: 'dark',
      language: 'en',
      timezone: 'UTC',
      dateFormat: 'MM/DD/YYYY',
      defaultDashboard: 'overview',
      autoRefresh: true,
      refreshInterval: 300,
      enableAnimations: true,
      compactMode: false,
      showAdvancedFilters: false
    },
    
    // Integration Settings
    integrations: {
      companyProfile: true,
      requirementsLink: true,
      capabilitiesSync: false,
      autoCreateTickets: false,
      siem: {
        enabled: false,
        endpoint: '',
        apiKey: '',
        format: 'syslog'
      },
      soar: {
        enabled: false,
        endpoint: '',
        apiKey: '',
        autoPlaybooks: false
      }
    }
  });

  const [activeSection, setActiveSection] = useState('framework');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [companyProfileSynced, setCompanyProfileSynced] = useState(false);
  const [lastCompanyProfileSync, setLastCompanyProfileSync] = useState(null);

  // Helper function to populate company profile from existing data
  const populateCompanyProfileFromExisting = useCallback((existingProfile) => {
    if (!existingProfile) return {};
    
    return {
      industry: mapIndustryToThreatSector(existingProfile.industry),
      companySize: mapEmployeeCountToCompanySize(existingProfile.employeeCount),
      geography: existingProfile.operatingRegions?.[0] || GEOGRAPHIC_REGIONS.NORTH_AMERICA,
      annualRevenue: 100000000, // Default value
      employeeCount: 500, // Default value
      hasCloudInfrastructure: existingProfile.technologySetup?.includes('Cloud') || false,
      hasLegacySystems: existingProfile.legacySystemsDetails?.length > 0 || false,
      businessFunctions: ['information_technology'],
      regulatoryRequirements: existingProfile.complianceRequirements || []
    };
  }, []);

  // Auto-populate company profile from existing data
  useEffect(() => {
    if (existingCompanyProfile && existingCompanyProfile.profileCompleted && !companyProfileSynced) {
      const populatedProfile = populateCompanyProfileFromExisting(existingCompanyProfile);
      
      setSettings(prev => ({
        ...prev,
        companyProfile: {
          ...prev.companyProfile,
          ...populatedProfile
        }
      }));
      
      setCompanyProfileSynced(true);
      setLastCompanyProfileSync(new Date());
      setHasChanges(true);
    }
  }, [existingCompanyProfile, companyProfileSynced, populateCompanyProfileFromExisting]);

  // Load existing settings
  useEffect(() => {
    if (Object.keys(currentSettings).length > 0) {
      setSettings(prev => ({ ...prev, ...currentSettings }));
    }
  }, [currentSettings]);

  // Track changes
  const updateSetting = useCallback((section, key, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
    setHasChanges(true);
  }, []);

  // Update nested settings helper
  const updateNestedSettings = useCallback((section, subsection, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subsection]: {
          ...prev[section][subsection],
          [field]: value
        }
      }
    }));
    setHasChanges(true);
  }, []);

  // Manually sync company profile data
  const syncCompanyProfile = useCallback(() => {
    if (existingCompanyProfile && existingCompanyProfile.profileCompleted) {
      const populatedProfile = populateCompanyProfileFromExisting(existingCompanyProfile);
      
      setSettings(prev => ({
        ...prev,
        companyProfile: {
          ...prev.companyProfile,
          ...populatedProfile
        }
      }));
      
      setCompanyProfileSynced(true);
      setLastCompanyProfileSync(new Date());
      setHasChanges(true);
    }
  }, [existingCompanyProfile, populateCompanyProfileFromExisting]);

  // Validation functions
  const validateSettings = useCallback(() => {
    const errors = {};

    // Validate company profile
    if (settings.companyProfile.annualRevenue < 0) {
      errors.annualRevenue = 'Annual revenue must be positive';
    }
    if (settings.companyProfile.employeeCount < 1) {
      errors.employeeCount = 'Employee count must be at least 1';
    }

    // Validate risk calculation weights
    const weights = settings.riskCalculation.weights;
    const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
    if (Math.abs(totalWeight - 1.0) > 0.01) {
      errors.weights = 'Risk calculation weights must sum to 1.0';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [settings]);

  // Save settings
  const handleSave = async () => {
    if (!validateSettings()) {
      return;
    }

    setSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setHasChanges(false);
      if (onSave) {
        onSave(settings);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  // Export settings
  const exportSettings = useCallback(() => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `threat-settings-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [settings]);

  // Import settings
  const importSettings = useCallback((event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedSettings = JSON.parse(e.target.result);
          setSettings(importedSettings);
          setHasChanges(true);
        } catch (error) {
          alert('Error importing settings: Invalid JSON file');
        }
      };
      reader.readAsText(file);
    }
  }, []);

  // Sections configuration
  const sections = [
    { id: 'framework', name: 'MITRE Framework', icon: Shield },
    { id: 'companyProfile', name: 'Company Profile', icon: Building },
    { id: 'riskCalculation', name: 'Risk Calculation', icon: Calculator },
    { id: 'threatProcessing', name: 'Threat Processing', icon: AlertTriangle },
    { id: 'feeds', name: 'Intelligence Feeds', icon: Database },
    { id: 'filters', name: 'Filtering', icon: Filter },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'display', name: 'Display & UI', icon: Eye },
    { id: 'integrations', name: 'Integrations', icon: Globe }
  ];

  // Input components
  const TextInput = ({ label, value, onChange, error, type = "text", placeholder, autoPopulated = false }) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {autoPopulated && (
          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Auto-populated
          </span>
        )}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          error ? 'border-red-500' : autoPopulated ? 'border-green-300 bg-green-50' : 'border-gray-300'
        }`}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );

  const SelectInput = ({ label, value, onChange, options, error, autoPopulated = false }) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {autoPopulated && (
          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Auto-populated
          </span>
        )}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          error ? 'border-red-500' : autoPopulated ? 'border-green-300 bg-green-50' : 'border-gray-300'
        }`}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );

  const CheckboxInput = ({ label, checked, onChange, description, autoPopulated = false }) => (
    <div className="mb-4">
      <label className="flex items-start space-x-3">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <div>
          <div className="flex items-center">
            <span className="text-sm font-medium text-gray-700">{label}</span>
            {autoPopulated && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Auto-populated
              </span>
            )}
          </div>
          {description && <p className="text-sm text-gray-500">{description}</p>}
        </div>
      </label>
    </div>
  );

  const SliderInput = ({ label, value, onChange, min, max, step, unit }) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}: {value}{unit}
      </label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
      />
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-96 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-3" />
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center">
          <Settings className="h-6 w-6 text-blue-600 mr-3" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Threat Management Settings</h2>
            <p className="text-sm text-gray-600">Configure comprehensive threat analysis and risk assessment preferences</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={exportSettings}
            className="px-3 py-2 text-blue-600 hover:text-blue-800 border border-blue-300 rounded-md hover:bg-blue-50"
          >
            <Download className="h-4 w-4 mr-1 inline" />
            Export
          </button>
          
          <label className="px-3 py-2 text-blue-600 hover:text-blue-800 border border-blue-300 rounded-md hover:bg-blue-50 cursor-pointer">
            <Upload className="h-4 w-4 mr-1 inline" />
            Import
            <input
              type="file"
              accept=".json"
              onChange={importSettings}
              className="hidden"
            />
          </label>
          
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Validation Errors */}
      {Object.keys(validationErrors).length > 0 && (
        <div className="mx-6 mt-4 bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <h3 className="text-sm font-medium text-red-800">Please fix the following errors:</h3>
          </div>
          <ul className="list-disc list-inside text-sm text-red-700">
            {Object.values(validationErrors).map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex">
        {/* Sidebar Navigation */}
        <div className="w-64 bg-gray-50 p-4">
          <nav className="space-y-1">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeSection === section.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <section.icon className="h-4 w-4 mr-3" />
                {section.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 max-h-[600px] overflow-y-auto">
          {/* MITRE Framework Settings */}
          {activeSection === 'framework' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">MITRE ATT&CK Framework Configuration</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <SelectInput
                    label="Framework Type"
                    value={settings.framework.selectedFramework}
                    onChange={(value) => updateSetting('framework', 'selectedFramework', value)}
                    options={[
                      { value: FRAMEWORK_TYPES.ENTERPRISE, label: 'Enterprise' },
                      { value: FRAMEWORK_TYPES.MOBILE, label: 'Mobile' },
                      { value: FRAMEWORK_TYPES.ICS, label: 'ICS/OT' }
                    ]}
                  />
                  
                  <CheckboxInput
                    label="Auto-detect Framework"
                    checked={settings.framework.autoDetectFramework}
                    onChange={(value) => updateSetting('framework', 'autoDetectFramework', value)}
                    description="Automatically select framework based on threat context"
                  />
                  
                  <CheckboxInput
                    label="Include Sub-techniques"
                    checked={settings.framework.includeSubTechniques}
                    onChange={(value) => updateSetting('framework', 'includeSubTechniques', value)}
                    description="Include MITRE sub-techniques in analysis"
                  />
                </div>
                
                <div>
                  <SliderInput
                    label="Confidence Threshold"
                    value={settings.framework.confidenceThreshold}
                    onChange={(value) => updateSetting('framework', 'confidenceThreshold', value)}
                    min={50}
                    max={95}
                    step={5}
                    unit="%"
                  />
                  
                  <CheckboxInput
                    label="Enable Threat Actor Mapping"
                    checked={settings.framework.enableThreatActorMapping}
                    onChange={(value) => updateSetting('framework', 'enableThreatActorMapping', value)}
                    description="Map threats to known threat actor profiles"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Company Profile Settings */}
          {activeSection === 'companyProfile' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Company Profile Configuration</h3>
              
              {/* Company Profile Sync Status */}
              {existingCompanyProfile?.profileCompleted && (
                <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="bg-green-100 p-2 rounded-lg mr-3">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          Company Profile Data Available
                        </h4>
                        <p className="text-sm text-gray-600">
                          {companyProfileSynced 
                            ? `Auto-populated from "${existingCompanyProfile.companyName || 'your company profile'}"` 
                            : 'Ready to sync with your existing company profile'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {lastCompanyProfileSync && (
                        <span className="text-xs text-gray-500">
                          Synced: {lastCompanyProfileSync.toLocaleTimeString()}
                        </span>
                      )}
                      <button
                        onClick={syncCompanyProfile}
                        className="flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                      >
                        <RefreshCw className="h-4 w-4 mr-1" />
                        {companyProfileSynced ? 'Re-sync' : 'Sync Now'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <SelectInput
                    label="Industry Sector"
                    value={settings.companyProfile.industry}
                    onChange={(value) => updateSetting('companyProfile', 'industry', value)}
                    autoPopulated={companyProfileSynced && existingCompanyProfile?.industry}
                    options={[
                      { value: INDUSTRY_SECTORS.FINANCIAL_SERVICES, label: 'Financial Services' },
                      { value: INDUSTRY_SECTORS.HEALTHCARE, label: 'Healthcare' },
                      { value: INDUSTRY_SECTORS.GOVERNMENT, label: 'Government' },
                      { value: INDUSTRY_SECTORS.ENERGY_UTILITIES, label: 'Energy & Utilities' },
                      { value: INDUSTRY_SECTORS.TECHNOLOGY, label: 'Technology' },
                      { value: INDUSTRY_SECTORS.MANUFACTURING, label: 'Manufacturing' },
                      { value: INDUSTRY_SECTORS.RETAIL_ECOMMERCE, label: 'Retail & E-commerce' },
                      { value: INDUSTRY_SECTORS.EDUCATION, label: 'Education' }
                    ]}
                  />
                  
                  <SelectInput
                    label="Company Size"
                    value={settings.companyProfile.companySize}
                    onChange={(value) => updateSetting('companyProfile', 'companySize', value)}
                    autoPopulated={companyProfileSynced && existingCompanyProfile?.employeeCount}
                    options={[
                      { value: COMPANY_SIZES.STARTUP, label: 'Startup (1-50 employees)' },
                      { value: COMPANY_SIZES.SMALL_BUSINESS, label: 'Small Business (51-250)' },
                      { value: COMPANY_SIZES.MEDIUM_ENTERPRISE, label: 'Medium Enterprise (251-1000)' },
                      { value: COMPANY_SIZES.LARGE_ENTERPRISE, label: 'Large Enterprise (1000+)' }
                    ]}
                  />
                </div>
                
                <div>
                  <TextInput
                    label="Annual Revenue (USD)"
                    type="number"
                    value={settings.companyProfile.annualRevenue}
                    onChange={(value) => updateSetting('companyProfile', 'annualRevenue', parseInt(value) || 0)}
                    autoPopulated={companyProfileSynced && existingCompanyProfile?.annualRevenue}
                    error={validationErrors.annualRevenue}
                  />
                  
                  <CheckboxInput
                    label="Cloud Infrastructure"
                    checked={settings.companyProfile.hasCloudInfrastructure}
                    onChange={(value) => updateSetting('companyProfile', 'hasCloudInfrastructure', value)}
                    autoPopulated={companyProfileSynced && existingCompanyProfile?.technologySetup}
                    description="Organization uses cloud services"
                  />
                  
                  <CheckboxInput
                    label="Legacy Systems"
                    checked={settings.companyProfile.hasLegacySystems}
                    onChange={(value) => updateSetting('companyProfile', 'hasLegacySystems', value)}
                    autoPopulated={companyProfileSynced && existingCompanyProfile?.legacySystemsDetails}
                    description="Organization has legacy/end-of-life systems"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Risk Calculation Settings */}
          {activeSection === 'riskCalculation' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Risk Calculation Configuration</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <SelectInput
                    label="Calculation Method"
                    value={settings.riskCalculation.calculationMethod}
                    onChange={(value) => updateSetting('riskCalculation', 'calculationMethod', value)}
                    options={[
                      { value: 'basic', label: 'Basic (Probability × Impact)' },
                      { value: 'weighted', label: 'Weighted Multi-factor' },
                      { value: 'quantitative', label: 'Quantitative Analysis' },
                      { value: 'monte_carlo', label: 'Monte Carlo Simulation' }
                    ]}
                  />
                  
                  <SelectInput
                    label="Risk Appetite"
                    value={settings.riskCalculation.riskAppetite}
                    onChange={(value) => updateSetting('riskCalculation', 'riskAppetite', value)}
                    options={[
                      { value: 'very_low', label: 'Very Low' },
                      { value: 'low', label: 'Low' },
                      { value: 'moderate', label: 'Moderate' },
                      { value: 'high', label: 'High' },
                      { value: 'very_high', label: 'Very High' }
                    ]}
                  />
                  
                  <CheckboxInput
                    label="Use Monte Carlo Simulation"
                    checked={settings.riskCalculation.useMonteCarloSimulation}
                    onChange={(value) => updateSetting('riskCalculation', 'useMonteCarloSimulation', value)}
                    description="Enable advanced statistical modeling"
                  />
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Risk Factor Weights</h4>
                  {validationErrors.weights && (
                    <p className="text-sm text-red-600 mb-2">{validationErrors.weights}</p>
                  )}
                  
                  <SliderInput
                    label="Probability"
                    value={settings.riskCalculation.weights.probability}
                    onChange={(value) => updateNestedSettings('riskCalculation', 'weights', 'probability', value)}
                    min={0}
                    max={1}
                    step={0.1}
                    unit=""
                  />
                  
                  <SliderInput
                    label="Impact"
                    value={settings.riskCalculation.weights.impact}
                    onChange={(value) => updateNestedSettings('riskCalculation', 'weights', 'impact', value)}
                    min={0}
                    max={1}
                    step={0.1}
                    unit=""
                  />
                  
                  <SliderInput
                    label="Velocity"
                    value={settings.riskCalculation.weights.velocity}
                    onChange={(value) => updateNestedSettings('riskCalculation', 'weights', 'velocity', value)}
                    min={0}
                    max={1}
                    step={0.1}
                    unit=""
                  />
                </div>
              </div>
            </div>
          )}

          {/* Threat Processing Settings */}
          {activeSection === 'threatProcessing' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Threat Processing Configuration</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <CheckboxInput
                    label="Auto Threat Mapping"
                    checked={settings.threatProcessing.autoThreatMapping}
                    onChange={(value) => updateSetting('threatProcessing', 'autoThreatMapping', value)}
                    description="Automatically map threats to MITRE framework"
                  />
                  
                  <CheckboxInput
                    label="Real-time Analysis"
                    checked={settings.threatProcessing.enableRealTimeAnalysis}
                    onChange={(value) => updateSetting('threatProcessing', 'enableRealTimeAnalysis', value)}
                    description="Process threats as they are received"
                  />
                  
                  <CheckboxInput
                    label="Machine Learning"
                    checked={settings.threatProcessing.enableMachineLearning}
                    onChange={(value) => updateSetting('threatProcessing', 'enableMachineLearning', value)}
                    description="Use ML for threat classification and scoring"
                  />
                </div>
                
                <div>
                  <SelectInput
                    label="Alert Threshold"
                    value={settings.threatProcessing.alertThreshold}
                    onChange={(value) => updateSetting('threatProcessing', 'alertThreshold', value)}
                    options={[
                      { value: 'low', label: 'Low - All threats' },
                      { value: 'medium', label: 'Medium - Medium+ threats' },
                      { value: 'high', label: 'High - High+ threats only' },
                      { value: 'critical', label: 'Critical - Critical threats only' }
                    ]}
                  />
                  
                  <SliderInput
                    label="Retention Period"
                    value={settings.threatProcessing.retentionPeriod}
                    onChange={(value) => updateSetting('threatProcessing', 'retentionPeriod', value)}
                    min={30}
                    max={2555}
                    step={30}
                    unit=" days"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Intelligence Feeds */}
          {activeSection === 'feeds' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Intelligence Feed Configuration</h3>
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Active Feed Sources</h4>
                <div className="space-y-3">
                  {[
                    { id: 'rss_feeds', name: 'RSS Security Feeds', description: 'Public security advisories and news' },
                    { id: 'mitre_attack', name: 'MITRE ATT&CK', description: 'Tactics, techniques, and procedures' },
                    { id: 'commercial_feeds', name: 'Commercial Intelligence', description: 'Premium threat intelligence' },
                    { id: 'government_feeds', name: 'Government Sources', description: 'NCSC, Ofgem, and other agencies' },
                    { id: 'community_sharing', name: 'Community Sharing', description: 'Industry threat sharing platforms' }
                  ].map((feed) => (
                    <div key={feed.id} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg">
                      <input
                        type="checkbox"
                        checked={settings.feeds?.enabled?.includes(feed.id) || false}
                        onChange={(e) => {
                          const current = settings.feeds?.enabled || [];
                          const updated = e.target.checked
                            ? [...current, feed.id]
                            : current.filter(id => id !== feed.id);
                          updateSetting('feeds', 'enabled', updated);
                        }}
                        className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{feed.name}</h4>
                        <p className="text-xs text-gray-600">{feed.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SelectInput
                  label="Update Frequency"
                  value={settings.feeds?.updateFrequency || 'hourly'}
                  onChange={(value) => updateSetting('feeds', 'updateFrequency', value)}
                  options={[
                    { value: 'realtime', label: 'Real-time' },
                    { value: 'hourly', label: 'Hourly' },
                    { value: 'daily', label: 'Daily' },
                    { value: 'weekly', label: 'Weekly' }
                  ]}
                />
                
                <TextInput
                  label="Data Retention (days)"
                  type="number"
                  value={settings.feeds?.retentionDays || 90}
                  onChange={(value) => updateSetting('feeds', 'retentionDays', parseInt(value))}
                />
              </div>
            </div>
          )}

          {/* Filtering Settings */}
          {activeSection === 'filters' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Default Filter Configuration</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <SliderInput
                    label="Minimum Risk Score"
                    value={settings.filters?.minRiskScore || 7}
                    onChange={(value) => updateSetting('filters', 'minRiskScore', value)}
                    min={0}
                    max={10}
                    step={0.1}
                    unit=""
                  />
                  
                  <SliderInput
                    label="Minimum Confidence"
                    value={settings.filters?.minConfidence || 75}
                    onChange={(value) => updateSetting('filters', 'minConfidence', value)}
                    min={0}
                    max={100}
                    step={5}
                    unit="%"
                  />
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Severity Levels</h4>
                  <div className="space-y-2">
                    {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((severity) => (
                      <label key={severity} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={settings.filters?.severityLevels?.includes(severity) || false}
                          onChange={(e) => {
                            const current = settings.filters?.severityLevels || [];
                            const updated = e.target.checked
                              ? [...current, severity]
                              : current.filter(s => s !== severity);
                            updateSetting('filters', 'severityLevels', updated);
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className={`ml-3 text-sm px-2 py-1 rounded ${
                          severity === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                          severity === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                          severity === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>{severity}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notification Settings */}
          {activeSection === 'notifications' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Configuration</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Alert Channels</h4>
                  <CheckboxInput
                    label="Email Alerts"
                    checked={settings.notifications.emailAlerts}
                    onChange={(value) => updateSetting('notifications', 'emailAlerts', value)}
                    description="Send threat alerts via email"
                  />
                  
                  <CheckboxInput
                    label="SMS Alerts"
                    checked={settings.notifications.smsAlerts}
                    onChange={(value) => updateSetting('notifications', 'smsAlerts', value)}
                    description="Send critical alerts via SMS"
                  />
                  
                  <CheckboxInput
                    label="Desktop Notifications"
                    checked={settings.notifications.desktopNotifications}
                    onChange={(value) => updateSetting('notifications', 'desktopNotifications', value)}
                    description="Show browser notifications"
                  />
                  
                  <CheckboxInput
                    label="Slack Integration"
                    checked={settings.notifications.slackIntegration}
                    onChange={(value) => updateSetting('notifications', 'slackIntegration', value)}
                    description="Send alerts to Slack channels"
                  />
                </div>
                
                <div>
                  <SelectInput
                    label="Alert Frequency"
                    value={settings.notifications.alertFrequency}
                    onChange={(value) => updateSetting('notifications', 'alertFrequency', value)}
                    options={[
                      { value: 'immediate', label: 'Immediate' },
                      { value: 'hourly', label: 'Hourly Digest' },
                      { value: 'daily', label: 'Daily Digest' },
                      { value: 'weekly', label: 'Weekly Summary' }
                    ]}
                  />
                  
                  <CheckboxInput
                    label="Critical Only"
                    checked={settings.notifications.criticalOnly}
                    onChange={(value) => updateSetting('notifications', 'criticalOnly', value)}
                    description="Only critical and high-risk threats"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Display Settings */}
          {activeSection === 'display' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Display & Interface Preferences</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <SelectInput
                    label="Theme"
                    value={settings.display.theme}
                    onChange={(value) => updateSetting('display', 'theme', value)}
                    options={[
                      { value: 'light', label: 'Light' },
                      { value: 'dark', label: 'Dark' },
                      { value: 'auto', label: 'Auto (System)' }
                    ]}
                  />
                  
                  <SelectInput
                    label="Default Dashboard"
                    value={settings.display.defaultDashboard}
                    onChange={(value) => updateSetting('display', 'defaultDashboard', value)}
                    options={[
                      { value: 'overview', label: 'Overview' },
                      { value: 'threats', label: 'Active Threats' },
                      { value: 'iocs', label: 'Indicators' },
                      { value: 'analytics', label: 'Analytics' }
                    ]}
                  />
                  
                  <CheckboxInput
                    label="Compact Mode"
                    checked={settings.display.compactMode}
                    onChange={(value) => updateSetting('display', 'compactMode', value)}
                    description="Use compact layout to show more information"
                  />
                </div>
                
                <div>
                  <CheckboxInput
                    label="Auto Refresh"
                    checked={settings.display.autoRefresh}
                    onChange={(value) => updateSetting('display', 'autoRefresh', value)}
                    description="Automatically refresh data"
                  />
                  
                  <CheckboxInput
                    label="Enable Animations"
                    checked={settings.display.enableAnimations}
                    onChange={(value) => updateSetting('display', 'enableAnimations', value)}
                    description="Show UI animations and transitions"
                  />
                  
                  <CheckboxInput
                    label="Show Advanced Filters"
                    checked={settings.display.showAdvancedFilters}
                    onChange={(value) => updateSetting('display', 'showAdvancedFilters', value)}
                    description="Show advanced filtering options"
                  />
                  
                  {settings.display.autoRefresh && (
                    <SliderInput
                      label="Refresh Interval"
                      value={settings.display.refreshInterval}
                      onChange={(value) => updateSetting('display', 'refreshInterval', value)}
                      min={30}
                      max={1800}
                      step={30}
                      unit=" seconds"
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Integration Settings */}
          {activeSection === 'integrations' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">System Integration Configuration</h3>
              <div className="space-y-4">
                <CheckboxInput
                  label="Use Company Profile for Threat Relevance"
                  checked={settings.integrations.companyProfile}
                  onChange={(value) => updateSetting('integrations', 'companyProfile', value)}
                  description="Use company profile data to enhance threat relevance scoring"
                />
                
                <CheckboxInput
                  label="Link Threats to Security Requirements"
                  checked={settings.integrations.requirementsLink}
                  onChange={(value) => updateSetting('integrations', 'requirementsLink', value)}
                  description="Automatically link threats to relevant security requirements"
                />
                
                <CheckboxInput
                  label="Auto-create Tickets for High-risk Threats"
                  checked={settings.integrations.autoCreateTickets}
                  onChange={(value) => updateSetting('integrations', 'autoCreateTickets', value)}
                  description="Automatically create incident tickets for high-risk threats"
                />
                
                <CheckboxInput
                  label="Capabilities Synchronization"
                  checked={settings.integrations.capabilitiesSync}
                  onChange={(value) => updateSetting('integrations', 'capabilitiesSync', value)}
                  description="Sync with security capabilities for enhanced threat context"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => window.location.reload()}
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            Reset to Defaults
          </button>
          <div className="text-sm text-gray-500">
            {hasChanges && "• Unsaved changes"}
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {saving ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Settings
          </button>
        </div>
      </div>

      {/* Save Reminder */}
      {hasChanges && (
        <div className="fixed bottom-6 right-6 bg-amber-100 border border-amber-400 rounded-lg p-4 shadow-lg z-50">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <span className="text-sm text-amber-800">You have unsaved changes</span>
            <button
              onClick={handleSave}
              className="text-sm bg-amber-600 text-white px-3 py-1 rounded hover:bg-amber-700"
            >
              Save Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThreatSettings;