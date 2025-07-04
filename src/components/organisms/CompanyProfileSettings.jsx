import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  Building2, Users, Cloud, Globe, ShieldCheck, FileText,
  Briefcase, AlertTriangle, TrendingUp, MapPin, Phone, Mail,
  CheckSquare, Server, Landmark, Handshake, BookUser,
  Lightbulb, Replace, GanttChartSquare, History, Factory
} from 'lucide-react';
import Input from '../atoms/Input';
import Badge from '../atoms/Badge';

// Import constants
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

// --- Reusable Molecules (Internal to this component) ---

const SettingsSection = ({ title, description, children, icon: Icon }) => (
  <div className="dashboard-card p-6">
    <div className="flex items-start gap-4 mb-4">
      {Icon && <Icon className="w-6 h-6 text-primary-500 mt-1 flex-shrink-0" />}
      <div>
        <h3 className="text-lg font-semibold text-secondary-900 dark:text-white">{title}</h3>
        {description && <p className="text-sm text-secondary-500 dark:text-secondary-400 mt-1">{description}</p>}
      </div>
    </div>
    <div className="border-t border-secondary-200 dark:border-secondary-700 pt-6 space-y-6">
      {children}
    </div>
  </div>
);

SettingsSection.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  children: PropTypes.node.isRequired,
  icon: PropTypes.elementType,
};

const FormField = ({ label, required, children }) => (
  <div>
    <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
      {label}
      {required && <span className="text-status-error ml-1">*</span>}
    </label>
    {children}
  </div>
);

FormField.propTypes = {
  label: PropTypes.string.isRequired,
  required: PropTypes.bool,
  children: PropTypes.node.isRequired,
};

const Checkbox = ({ checked, onChange, label }) => (
  <label className="flex items-center space-x-3 group cursor-pointer">
    <div className="relative flex items-center">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="sr-only"
      />
      <div className={`w-5 h-5 border-2 rounded-md transition-colors ${
        checked
          ? 'bg-primary-600 border-primary-600'
          : 'border-secondary-300 dark:border-secondary-600 group-hover:border-primary-400'
      }`}>
        {checked && <CheckSquare className="w-full h-full text-white" />}
      </div>
    </div>
    <span className="text-sm text-secondary-700 dark:text-secondary-300">{label}</span>
  </label>
);

Checkbox.propTypes = {
  checked: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired,
};

// --- Main Organism Component ---

const CompanyProfileSettings = ({ settings, updateSetting }) => {
  const profile = settings || {};

  const handleUpdate = useCallback((field, value) => {
    updateSetting(field, value);
  }, [updateSetting]);

  const handleArrayToggle = useCallback((field, value) => {
    const currentArray = profile[field] || [];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    handleUpdate(field, newArray);
  }, [profile, handleUpdate]);

  const complianceCategoryIcons = {
    International: Globe,
    'Regional/National': Landmark,
    'Industry-Specific': Factory,
    'SME-Focused': Handshake,
  };

  return (
    <div className="space-y-6">
      <SettingsSection
        icon={Building2}
        title="Basic Company Information"
        description="Essential details about your organization for accurate risk modeling."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label="Company Name" required>
            <Input value={profile.companyName || ''} onChange={e => handleUpdate('companyName', e.target.value)} placeholder="Enter company name" />
          </FormField>
          <FormField label="Company Type" required>
            <select value={profile.companyType || ''} onChange={e => handleUpdate('companyType', e.target.value)} className="w-full mt-1 block rounded-md border-secondary-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-secondary-800 dark:border-secondary-600 dark:text-white sm:text-sm">
              <option value="">Select company type</option>
              {COMPANY_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
          </FormField>
          <FormField label="Industry/Sector" required>
            <select value={profile.industry || ''} onChange={e => handleUpdate('industry', e.target.value)} className="w-full mt-1 block rounded-md border-secondary-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-secondary-800 dark:border-secondary-600 dark:text-white sm:text-sm">
              <option value="">Select industry</option>
              {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
          </FormField>
          <FormField label="Annual Revenue Range" required>
            <select value={profile.annualRevenue || ''} onChange={e => handleUpdate('annualRevenue', e.target.value)} className="w-full mt-1 block rounded-md border-secondary-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-secondary-800 dark:border-secondary-600 dark:text-white sm:text-sm">
              <option value="">Select range</option>
              {ANNUAL_REVENUE_RANGES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </FormField>
          <FormField label="Number of Employees" required>
            <select value={profile.employeeCount || ''} onChange={e => handleUpdate('employeeCount', e.target.value)} className="w-full mt-1 block rounded-md border-secondary-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-secondary-800 dark:border-secondary-600 dark:text-white sm:text-sm">
              <option value="">Select range</option>
              {EMPLOYEE_COUNT_RANGES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </FormField>
        </div>
      </SettingsSection>

      <SettingsSection
        icon={MapPin}
        title="Contact & Geographic Information"
        description="Location details and primary contact information."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label="Primary Contact Email" required>
            <Input type="email" value={profile.contactEmail || ''} onChange={e => handleUpdate('contactEmail', e.target.value)} placeholder="contact@company.com" />
          </FormField>
          <FormField label="Primary Contact Phone">
            <Input type="tel" value={profile.contactPhone || ''} onChange={e => handleUpdate('contactPhone', e.target.value)} placeholder="+44 20 1234 5678" />
          </FormField>
          <div className="md:col-span-2">
            <FormField label="Headquarters Location">
              <Input value={profile.headquarters || ''} onChange={e => handleUpdate('headquarters', e.target.value)} placeholder="City, Country" />
            </FormField>
          </div>
          <div className="md:col-span-2">
            <FormField label="Operating Regions" required>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
                {GEOGRAPHIC_REGIONS.map(region => (
                  <Checkbox key={region} checked={(profile.operatingRegions || []).includes(region)} onChange={() => handleArrayToggle('operatingRegions', region)} label={region} />
                ))}
              </div>
            </FormField>
          </div>
        </div>
      </SettingsSection>

      <SettingsSection
        icon={Cloud}
        title="Technology & Data Profile"
        description="Details about your IT infrastructure and data handling practices."
      >
        <FormField label="Technology Infrastructure Setup" required>
          <select value={profile.technologySetup || ''} onChange={e => handleUpdate('technologySetup', e.target.value)} className="w-full mt-1 block rounded-md border-secondary-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-secondary-800 dark:border-secondary-600 dark:text-white sm:text-sm">
            <option value="">Select technology setup</option>
            {TECHNOLOGY_SETUPS.map(setup => <option key={setup} value={setup}>{setup}</option>)}
          </select>
        </FormField>
        <FormField label="Sensitive Data Types Handled" required>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
            {DATA_TYPES.map(dataType => (
              <Checkbox key={dataType} checked={(profile.sensitiveDataTypes || []).includes(dataType)} onChange={() => handleArrayToggle('sensitiveDataTypes', dataType)} label={dataType} />
            ))}
          </div>
        </FormField>
      </SettingsSection>

      <SettingsSection
        icon={ShieldCheck}
        title="Compliance & Regulatory"
        description="Select applicable frameworks and specify compliance details."
      >
        <FormField label="Applicable Compliance Frameworks">
          <div className="space-y-4">
            {Object.entries(complianceCategoryIcons).map(([category, Icon]) => (
              <div key={category}>
                <h4 className="text-md font-bold text-secondary-800 dark:text-secondary-200 mb-2 flex items-center">
                  <Icon className="w-5 h-5 mr-2 text-primary-500" />
                  {category} Frameworks
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-7">
                  {COMPLIANCE_FRAMEWORKS.filter(fw => fw.category === category).map(fw => (
                    <Checkbox key={fw.name} checked={(profile.complianceRequirements || []).includes(fw.name)} onChange={() => handleArrayToggle('complianceRequirements', fw.name)} label={fw.name} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </FormField>
        <FormField label="Other Compliance Requirements">
          <textarea value={profile.otherCompliance || ''} onChange={e => handleUpdate('otherCompliance', e.target.value)} rows={3} className="w-full mt-1 block rounded-md border-secondary-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-secondary-800 dark:border-secondary-600 dark:text-white sm:text-sm" placeholder="Describe any additional or industry-specific regulations not listed above." />
        </FormField>
        <FormField label="Upcoming Compliance Deadlines">
          <textarea value={profile.complianceDeadlines || ''} onChange={e => handleUpdate('complianceDeadlines', e.target.value)} rows={2} className="w-full mt-1 block rounded-md border-secondary-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-secondary-800 dark:border-secondary-600 dark:text-white sm:text-sm" placeholder="List any upcoming audit dates or compliance deadlines." />
        </FormField>
      </SettingsSection>

      <SettingsSection
        icon={AlertTriangle}
        title="Risk & Security Profile"
        description="Information about your organization's risk posture and history."
      >
        <FormField label="Previous Security Incidents">
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="previousIncidents" checked={profile.previousIncidents === true} onChange={() => handleUpdate('previousIncidents', true)} className="text-primary-600 focus:ring-primary-500" />
              Yes
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="previousIncidents" checked={profile.previousIncidents === false} onChange={() => handleUpdate('previousIncidents', false)} className="text-primary-600 focus:ring-primary-500" />
              No
            </label>
          </div>
        </FormField>
        {profile.previousIncidents && (
          <FormField label="Incident Details">
            <textarea value={profile.incidentDetails || ''} onChange={e => handleUpdate('incidentDetails', e.target.value)} rows={4} className="w-full mt-1 block rounded-md border-secondary-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-secondary-800 dark:border-secondary-600 dark:text-white sm:text-sm" placeholder="Briefly describe the nature of past incidents without revealing sensitive details." />
          </FormField>
        )}
        <FormField label="Business Continuity Plan (BCP)">
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="bcp" checked={profile.businessContinuityPlan === true} onChange={() => handleUpdate('businessContinuityPlan', true)} className="text-primary-600 focus:ring-primary-500" />
              Plan exists
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="bcp" checked={profile.businessContinuityPlan === false} onChange={() => handleUpdate('businessContinuityPlan', false)} className="text-primary-600 focus:ring-primary-500" />
              No plan
            </label>
          </div>
        </FormField>
      </SettingsSection>

      <SettingsSection
        icon={Lightbulb}
        title="Additional Context"
        description="Optional details for an enhanced and more accurate risk assessment."
      >
        <FormField label="Primary Security Concerns">
          <textarea value={profile.primaryConcerns || ''} onChange={e => handleUpdate('primaryConcerns', e.target.value)} rows={4} className="w-full mt-1 block rounded-md border-secondary-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-secondary-800 dark:border-secondary-600 dark:text-white sm:text-sm" placeholder="e.g., Insider threats, ransomware, cloud misconfigurations..." />
        </FormField>
        <FormField label="Cybersecurity Budget Range">
          <select value={profile.budgetRange || ''} onChange={e => handleUpdate('budgetRange', e.target.value)} className="w-full mt-1 block rounded-md border-secondary-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-secondary-800 dark:border-secondary-600 dark:text-white sm:text-sm">
            <option value="">Select budget range</option>
            <option value="Under £50k">Under £50k</option>
            <option value="£50k - £250k">£50k - £250k</option>
            <option value="£250k - £1M">£250k - £1M</option>
            <option value="£1M - £5M">£1M - £5M</option>
            <option value="Over £5M">Over £5M</option>
            <option value="Not defined">Not yet defined</option>
          </select>
        </FormField>
      </SettingsSection>
    </div>
  );
};

CompanyProfileSettings.propTypes = {
  settings: PropTypes.object.isRequired,
  updateSetting: PropTypes.func.isRequired,
};

CompanyProfileSettings.defaultProps = {
  settings: {},
};

export default CompanyProfileSettings;
