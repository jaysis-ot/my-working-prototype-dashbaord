import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { ShieldCheck, FileText, Lock, Globe, Users, CheckSquare, ToggleLeft, ToggleRight } from 'lucide-react';
import Input from '../atoms/Input';
import Badge from '../atoms/Badge';

// --- Reusable Molecules for Settings ---

const SettingsSection = ({ title, description, children, icon: Icon }) => (
  <div className="dashboard-card p-6">
    <div className="flex items-start gap-4 mb-4">
      {Icon && <Icon className="w-6 h-6 text-primary-500 mt-1 flex-shrink-0" />}
      <div>
        <h3 className="text-lg font-semibold text-secondary-900 dark:text-white">{title}</h3>
        {description && <p className="text-sm text-secondary-500 dark:text-secondary-400 mt-1">{description}</p>}
      </div>
    </div>
    <div className="border-t border-secondary-200 dark:border-secondary-700 pt-4 space-y-4">
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

const ToggleSetting = ({ label, description, enabled, onToggle, readOnly = false }) => (
  <div className="flex items-center justify-between">
    <div>
      <label className={`font-medium text-secondary-800 dark:text-secondary-200 ${readOnly ? 'opacity-70' : ''}`}>{label}</label>
      <p className={`text-sm text-secondary-500 dark:text-secondary-400 ${readOnly ? 'opacity-70' : ''}`}>{description}</p>
    </div>
    <button
      onClick={onToggle}
      disabled={readOnly}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
        ${enabled ? 'bg-primary-600' : 'bg-secondary-200 dark:bg-secondary-600'}
        ${readOnly ? 'cursor-not-allowed opacity-50' : ''}`}
      role="switch"
      aria-checked={enabled}
      aria-readonly={readOnly}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
          ${enabled ? 'translate-x-5' : 'translate-x-0'}`}
      />
    </button>
  </div>
);

ToggleSetting.propTypes = {
  label: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  enabled: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
  readOnly: PropTypes.bool,
};

const SelectSetting = ({ label, value, onChange, options, description }) => (
  <div>
    <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300">{label}</label>
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="mt-1 block w-full rounded-md border-secondary-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-secondary-800 dark:border-secondary-600 dark:text-white sm:text-sm"
    >
      {options.map(option => (
        <option key={option.value} value={option.value}>{option.label}</option>
      ))}
    </select>
    {description && <p className="mt-2 text-xs text-secondary-500 dark:text-secondary-400">{description}</p>}
  </div>
);

SelectSetting.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
  })).isRequired,
  description: PropTypes.string,
};

// --- Main Organism Component ---

/**
 * ComplianceSettings Organism Component
 * 
 * Manages compliance-related settings, including frameworks, audit logs,
 * data residency, encryption, and access controls for the GRC dashboard.
 */
const ComplianceSettings = ({ settings, updateSetting }) => {
  const handleUpdate = useCallback((field, value) => {
    updateSetting(field, value);
  }, [updateSetting]);

  const handleFrameworkToggle = useCallback((frameworkId) => {
    const currentFrameworks = settings.frameworks || [];
    const newFrameworks = currentFrameworks.includes(frameworkId)
      ? currentFrameworks.filter(id => id !== frameworkId)
      : [...currentFrameworks, frameworkId];
    handleUpdate('frameworks', newFrameworks);
  }, [settings.frameworks, handleUpdate]);

  const data = settings || {};
  const frameworks = data.frameworks || [];
  const auditLog = data.auditLog || {};
  const encryption = data.encryption || {};
  const access = data.access || {};

  const allFrameworks = [
    { id: 'nist_csf', name: 'NIST CSF 2.0' },
    { id: 'iso27001', name: 'ISO 27001' },
    { id: 'soc2', name: 'SOC 2' },
    { id: 'hipaa', name: 'HIPAA' },
    { id: 'gdpr', name: 'GDPR' },
    { id: 'pci_dss', name: 'PCI DSS' },
  ];

  return (
    <div className="space-y-6">
      <SettingsSection
        icon={ShieldCheck}
        title="Compliance Frameworks"
        description="Select the regulatory and industry frameworks relevant to your organization."
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {allFrameworks.map(fw => (
            <button
              key={fw.id}
              onClick={() => handleFrameworkToggle(fw.id)}
              className={`p-4 rounded-lg border-2 flex items-center gap-3 transition-colors ${
                frameworks.includes(fw.id)
                  ? 'bg-primary-50 dark:bg-primary-500/20 border-primary-500'
                  : 'bg-secondary-50 dark:bg-secondary-700/50 hover:border-primary-300'
              }`}
            >
              <div
                className={`w-5 h-5 rounded flex-shrink-0 flex items-center justify-center border-2 ${
                  frameworks.includes(fw.id)
                    ? 'bg-primary-600 border-primary-600'
                    : 'bg-white border-secondary-300'
                }`}
              >
                {frameworks.includes(fw.id) && <CheckSquare className="w-3 h-3 text-white" />}
              </div>
              <span className="font-medium text-sm text-secondary-800 dark:text-secondary-100">{fw.name}</span>
            </button>
          ))}
        </div>
      </SettingsSection>

      <SettingsSection
        icon={FileText}
        title="Audit Logs & Data Governance"
        description="Configure how audit trails are managed and where your data is stored."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SelectSetting
            label="Audit Log Retention"
            value={auditLog.retention || '7-years'}
            onChange={value => handleUpdate('auditLog', { ...auditLog, retention: value })}
            options={[
              { value: '1-year', label: '1 Year' },
              { value: '3-years', label: '3 Years' },
              { value: '5-years', label: '5 Years' },
              { value: '7-years', label: '7 Years (Recommended)' },
              { value: 'indefinite', label: 'Indefinite' },
            ]}
            description="How long to store immutable audit logs."
          />
          <SelectSetting
            label="Data Residency"
            value={data.dataResidency || 'us'}
            onChange={value => handleUpdate('dataResidency', value)}
            options={[
              { value: 'us', label: 'United States (US)' },
              { value: 'eu', label: 'European Union (EU)' },
              { value: 'uk', label: 'United Kingdom (UK)' },
              { value: 'ca', label: 'Canada (CA)' },
            ]}
            description="Primary geographical region for data storage."
          />
        </div>
        <ToggleSetting
          label="Immutable Audit Logs"
          description="Ensure audit logs cannot be altered or deleted once written."
          enabled={true} // This should be a security default
          onToggle={() => {}} // No action, it's read-only
          readOnly={true}
        />
      </SettingsSection>

      <SettingsSection
        icon={Lock}
        title="Data Encryption"
        description="Security standards for protecting your data."
      >
        <ToggleSetting
          label="Encryption in Transit (TLS 1.2+)"
          description="All data transferred between you and our servers is encrypted."
          enabled={true}
          onToggle={() => {}}
          readOnly={true}
        />
        <ToggleSetting
          label="Encryption at Rest (AES-256)"
          description="All your data stored on our servers is encrypted."
          enabled={true}
          onToggle={() => {}}
          readOnly={true}
        />
      </SettingsSection>
      
      <SettingsSection
        icon={Users}
        title="Access Control"
        description="Manage user access policies to enhance security."
      >
        <ToggleSetting
          label="Enforce Multi-Factor Authentication (MFA)"
          description="Require all users to use a second factor for authentication."
          enabled={!!access.mfa}
          onToggle={() => handleUpdate('access', { ...access, mfa: !access.mfa })}
        />
        <ToggleSetting
          label="Role-Based Access Control (RBAC)"
          description="Access to features is governed by user roles."
          enabled={true}
          onToggle={() => {}}
          readOnly={true}
        />
        <div className="pt-4 border-t border-secondary-200 dark:border-secondary-700">
          <Input
            label="Session Timeout (minutes)"
            type="number"
            value={access.sessionTimeout || 60}
            onChange={e => handleUpdate('access', { ...access, sessionTimeout: parseInt(e.target.value, 10) })}
            helperText="Automatically log out users after a period of inactivity."
          />
        </div>
      </SettingsSection>
    </div>
  );
};

ComplianceSettings.propTypes = {
  settings: PropTypes.object.isRequired,
  updateSetting: PropTypes.func.isRequired,
};

ComplianceSettings.defaultProps = {
  settings: {
    frameworks: ['nist_csf', 'iso27001'],
    auditLog: { retention: '7-years', immutable: true },
    dataResidency: 'us',
    encryption: { transit: true, rest: true },
    access: { mfa: true, rbac: true, sessionTimeout: 60 },
  },
};

export default ComplianceSettings;
