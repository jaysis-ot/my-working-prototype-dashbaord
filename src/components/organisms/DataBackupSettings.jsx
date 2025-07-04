import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Database, Clock, Calendar, Lock, ShieldCheck, Cloud, RefreshCw, CheckCircle, Server } from 'lucide-react';
import Button from '../atoms/Button';
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
 * DataBackupSettings Organism Component
 * 
 * Manages settings related to data backup, retention, security, and compliance.
 * This component provides a comprehensive interface for configuring the GRC
 * platform's data resilience strategy.
 */
const DataBackupSettings = ({ settings, updateSetting }) => {
  const [backupStatus, setBackupStatus] = useState('idle'); // 'idle', 'running', 'success'

  const handleUpdate = useCallback((field, value) => {
    updateSetting(field, value);
  }, [updateSetting]);

  const runManualBackup = useCallback(async () => {
    setBackupStatus('running');
    try {
      // Simulate API call for manual backup
      await new Promise(resolve => setTimeout(resolve, 3000));
      setBackupStatus('success');
      setTimeout(() => setBackupStatus('idle'), 3000);
    } catch (error) {
      console.error("Manual backup failed:", error);
      setBackupStatus('idle'); // Or an error state
    }
  }, []);

  const data = settings || {};

  return (
    <div className="space-y-6">
      <SettingsSection
        icon={Clock}
        title="Backup Schedule & Retention"
        description="Define how frequently your data is backed up and how long it is stored."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SelectSetting
            label="Backup Frequency"
            value={data.schedule || 'daily'}
            onChange={(value) => handleUpdate('schedule', value)}
            options={[
              { value: 'hourly', label: 'Hourly' },
              { value: 'daily', label: 'Daily (Recommended)' },
              { value: 'weekly', label: 'Weekly' },
            ]}
            description="Automated backup interval for all GRC data."
          />
          <SelectSetting
            label="Retention Policy"
            value={data.retention || '7-years'}
            onChange={(value) => handleUpdate('retention', value)}
            options={[
              { value: '30-days', label: '30 Days' },
              { value: '90-days', label: '90 Days' },
              { value: '1-year', label: '1 Year' },
              { value: '7-years', label: '7 Years (Compliance Default)' },
              { value: 'indefinite', label: 'Indefinite' },
            ]}
            description="Duration for which backups are kept."
          />
        </div>
      </SettingsSection>

      <SettingsSection
        icon={Lock}
        title="Security & Verification"
        description="Configure encryption and integrity checks for your backups."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SelectSetting
            label="Encryption Standard"
            value={data.encryption || 'aes-256'}
            onChange={(value) => handleUpdate('encryption', value)}
            options={[
              { value: 'aes-128', label: 'AES-128' },
              { value: 'aes-256', label: 'AES-256 (Industry Standard)' },
            ]}
            description="Encryption algorithm for data at rest."
          />
          <SelectSetting
            label="Backup Verification"
            value={data.verification || 'monthly'}
            onChange={(value) => handleUpdate('verification', value)}
            options={[
              { value: 'daily', label: 'Daily' },
              { value: 'weekly', label: 'Weekly' },
              { value: 'monthly', label: 'Monthly (Recommended)' },
              { value: 'quarterly', label: 'Quarterly' },
            ]}
            description="Frequency of automated backup integrity tests."
          />
        </div>
      </SettingsSection>

      <SettingsSection
        icon={Cloud}
        title="Storage & Compliance"
        description="Manage storage location and ensure backups meet regulatory requirements."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SelectSetting
            label="Primary Storage Provider"
            value={data.storage || 'aws-s3'}
            onChange={(value) => handleUpdate('storage', value)}
            options={[
              { value: 'aws-s3', label: 'Amazon S3 (US-East-1)' },
              { value: 'azure-blob', label: 'Azure Blob Storage (US-West)' },
              { value: 'gcp-storage', label: 'Google Cloud Storage (US-Central)' },
            ]}
            description="Cloud provider for primary backup storage."
          />
          <div className="flex flex-col justify-center">
            <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300">Compliance Readiness</label>
            <div className="mt-2 flex items-center gap-2">
              <Badge variant="success" icon={ShieldCheck}>SOX</Badge>
              <Badge variant="success" icon={ShieldCheck}>HIPAA</Badge>
              <Badge variant="info" icon={ShieldCheck}>ISO 27001</Badge>
            </div>
            <p className="mt-2 text-xs text-secondary-500 dark:text-secondary-400">
              Your current settings meet these compliance standards.
            </p>
          </div>
        </div>
      </SettingsSection>

      <SettingsSection
        icon={Server}
        title="Manual Backup"
        description="Trigger an immediate, on-demand backup of the entire system."
      >
        <div className="flex items-center justify-between">
          <p className="text-sm text-secondary-600 dark:text-secondary-300">
            Useful before major changes or for ad-hoc needs.
          </p>
          <Button
            onClick={runManualBackup}
            loading={backupStatus === 'running'}
            disabled={backupStatus === 'running'}
            variant={backupStatus === 'success' ? 'success' : 'secondary'}
            leadingIcon={backupStatus === 'success' ? CheckCircle : RefreshCw}
          >
            {backupStatus === 'running' ? 'Backup in Progress...' : backupStatus === 'success' ? 'Backup Complete!' : 'Run Backup Now'}
          </Button>
        </div>
      </SettingsSection>
    </div>
  );
};

DataBackupSettings.propTypes = {
  settings: PropTypes.object.isRequired,
  updateSetting: PropTypes.func.isRequired,
};

DataBackupSettings.defaultProps = {
  settings: {
    schedule: 'daily',
    retention: '7-years',
    encryption: 'aes-256',
    verification: 'monthly',
    storage: 'aws-s3',
  },
};

export default DataBackupSettings;
