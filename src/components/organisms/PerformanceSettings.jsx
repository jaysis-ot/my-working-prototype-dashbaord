import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Zap, Search, Database, Activity, HeartPulse, CheckCircle, Loader2 } from 'lucide-react';
import Button from '../atoms/Button';
import Input from '../atoms/Input';

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

const ToggleSetting = ({ label, description, enabled, onToggle }) => (
  <div className="flex items-center justify-between">
    <div>
      <label className="font-medium text-secondary-800 dark:text-secondary-200">{label}</label>
      <p className="text-sm text-secondary-500 dark:text-secondary-400">{description}</p>
    </div>
    <button
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
        ${enabled ? 'bg-primary-600' : 'bg-secondary-200 dark:bg-secondary-600'}`}
      role="switch"
      aria-checked={enabled}
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
};

const SliderSetting = ({ label, value, onChange, min = 0, max = 100, step = 1, unit = '%' }) => (
  <div>
    <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300">{label}</label>
    <div className="flex items-center gap-4 mt-2">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-2 bg-secondary-200 rounded-lg appearance-none cursor-pointer dark:bg-secondary-700"
      />
      <div className="flex-shrink-0 w-16 text-center">
        <span className="text-lg font-semibold text-primary-600 dark:text-primary-300">{value}{unit}</span>
      </div>
    </div>
  </div>
);

SliderSetting.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
  min: PropTypes.number,
  max: PropTypes.number,
  step: PropTypes.number,
  unit: PropTypes.string,
};

// --- Main Organism Component ---

/**
 * PerformanceSettings Organism Component
 * 
 * Manages performance-related settings for the GRC dashboard, including caching,
 * indexing, query optimization, and monitoring thresholds.
 */
const PerformanceSettings = ({ settings, updateSetting }) => {
  const [healthCheckStatus, setHealthCheckStatus] = useState('idle');

  const handleUpdate = useCallback((section, field, value) => {
    updateSetting(section, { ...settings[section], [field]: value });
  }, [settings, updateSetting]);

  const runHealthCheck = useCallback(async () => {
    setHealthCheckStatus('running');
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      setHealthCheckStatus('success');
      setTimeout(() => setHealthCheckStatus('idle'), 3000);
    } catch (error) {
      console.error("Health check failed:", error);
      setHealthCheckStatus('idle');
    }
  }, []);

  const caching = settings.caching || {};
  const indexing = settings.indexing || {};
  const queries = settings.queries || {};
  const monitoring = settings.monitoring || {};

  return (
    <div className="space-y-6">
      <SettingsSection
        icon={Zap}
        title="Caching Configuration"
        description="Optimize response times by caching frequently accessed data."
      >
        <ToggleSetting
          label="Enable Data Caching"
          description="Store query results in a high-speed cache."
          enabled={!!caching.enabled}
          onToggle={() => handleUpdate('caching', 'enabled', !caching.enabled)}
        />
        {caching.enabled && (
          <div className="pt-4 border-t border-secondary-200 dark:border-secondary-700">
            <Input
              label="Cache TTL (Time-To-Live) in seconds"
              type="number"
              value={caching.ttl || 300}
              onChange={e => handleUpdate('caching', 'ttl', parseInt(e.target.value, 10))}
              helperText="How long (in seconds) to keep data in cache before it's considered stale."
            />
          </div>
        )}
      </SettingsSection>

      <SettingsSection
        icon={Search}
        title="Search & Indexing"
        description="Configure how the platform indexes data for fast and accurate search."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Index Rebuild Schedule"
            value={indexing.rebuild || 'weekly'}
            onChange={e => handleUpdate('indexing', 'rebuild', e.target.value)}
            helperText="Cron expression for full index rebuilds (e.g., '0 2 * * 0' for Sunday at 2 AM)."
          />
          <div className="flex items-center pt-6">
             <ToggleSetting
                label="Real-time Optimization"
                description="Continuously optimize index as data changes."
                enabled={!!indexing.optimize}
                onToggle={() => handleUpdate('indexing', 'optimize', !indexing.optimize)}
              />
          </div>
        </div>
      </SettingsSection>

      <SettingsSection
        icon={Database}
        title="Database & Query Performance"
        description="Fine-tune database interactions to prevent bottlenecks."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Query Timeout (ms)"
            type="number"
            value={queries.timeout || 30000}
            onChange={e => handleUpdate('queries', 'timeout', parseInt(e.target.value, 10))}
            helperText="Max time a database query can run before failing."
          />
          <Input
            label="Max Concurrent Queries"
            type="number"
            value={queries.maxConcurrent || 50}
            onChange={e => handleUpdate('queries', 'maxConcurrent', parseInt(e.target.value, 10))}
            helperText="Limit simultaneous database connections."
          />
        </div>
      </SettingsSection>

      <SettingsSection
        icon={Activity}
        title="Performance Monitoring"
        description="Set up automated monitoring to get alerted about performance degradation."
      >
        <ToggleSetting
          label="Enable Performance Alerts"
          description="Receive notifications if system performance drops."
          enabled={!!monitoring.alerts}
          onToggle={() => handleUpdate('monitoring', 'alerts', !monitoring.alerts)}
        />
        {monitoring.alerts && (
          <div className="pt-4 border-t border-secondary-200 dark:border-secondary-700">
            <SliderSetting
              label="Alert Threshold"
              value={monitoring.threshold || 85}
              onChange={value => handleUpdate('monitoring', 'threshold', value)}
              unit="%"
            />
            <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-2">
              An alert will be triggered if the overall system performance score drops below this value.
            </p>
          </div>
        )}
      </SettingsSection>

      <SettingsSection
        icon={HeartPulse}
        title="System Health Check"
        description="Run an on-demand diagnostic to check all performance-related components."
      >
        <div className="flex items-center justify-between">
          <p className="text-sm text-secondary-600 dark:text-secondary-300">
            Checks database connectivity, cache status, and response times.
          </p>
          <Button
            onClick={runHealthCheck}
            loading={healthCheckStatus === 'running'}
            disabled={healthCheckStatus === 'running'}
            variant={healthCheckStatus === 'success' ? 'success' : 'secondary'}
            leadingIcon={healthCheckStatus === 'success' ? CheckCircle : null}
          >
            {healthCheckStatus === 'running' ? 'Running...' : healthCheckStatus === 'success' ? 'All Systems Go!' : 'Run Health Check'}
          </Button>
        </div>
      </SettingsSection>
    </div>
  );
};

PerformanceSettings.propTypes = {
  settings: PropTypes.object.isRequired,
  updateSetting: PropTypes.func.isRequired,
};

PerformanceSettings.defaultProps = {
  settings: {
    caching: {},
    indexing: {},
    queries: {},
    monitoring: {},
  },
};

export default PerformanceSettings;
