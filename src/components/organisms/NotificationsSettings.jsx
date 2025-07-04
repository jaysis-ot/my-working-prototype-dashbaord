import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Bell, Mail, Slack, AlertTriangle, Users, CheckCircle, ArrowRight, ChevronsUpDown } from 'lucide-react';
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

const SelectSetting = ({ label, value, onChange, options, description }) => (
  <div>
    <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300">{label}</label>
    <div className="relative mt-1">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full appearance-none rounded-md border border-secondary-300 bg-white py-2 pl-3 pr-10 text-base focus:border-primary-500 focus:outline-none focus:ring-primary-500 dark:border-secondary-600 dark:bg-secondary-800 dark:text-white sm:text-sm"
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-secondary-700 dark:text-secondary-300">
        <ChevronsUpDown className="h-5 w-5" />
      </div>
    </div>
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
 * NotificationsSettings Organism Component
 * 
 * Manages all notification-related settings for the GRC dashboard, including
 * email, Slack, in-app alerts, and escalation policies.
 */
const NotificationsSettings = ({ settings, updateSetting }) => {
  const [testStatus, setTestStatus] = useState('idle'); // 'idle', 'sending', 'sent'

  const handleUpdate = useCallback((path, value) => {
    updateSetting(path, value);
  }, [updateSetting]);

  const sendTestNotification = useCallback(async () => {
    setTestStatus('sending');
    try {
      // Simulate API call to send a test notification
      await new Promise(resolve => setTimeout(resolve, 2000));
      setTestStatus('sent');
      setTimeout(() => setTestStatus('idle'), 3000);
    } catch (error) {
      console.error("Failed to send test notification:", error);
      setTestStatus('idle'); // Or an error state
    }
  }, []);

  const emailSettings = settings.email || { enabled: true, threshold: 'medium', frequency: 'immediate' };
  const slackSettings = settings.slack || { enabled: false, webhook: '', channel: '' };
  const dashboardAlerts = settings.dashboard || { enabled: true };
  const escalation = settings.escalation || { levels: ['Team', 'Manager', 'Executive'] };

  return (
    <div className="space-y-6">
      <SettingsSection
        icon={Mail}
        title="Email Notifications"
        description="Receive email alerts for important events and summaries."
      >
        <ToggleSetting
          label="Enable Email Notifications"
          description="Master switch for all email alerts."
          enabled={emailSettings.enabled}
          onToggle={() => handleUpdate('email.enabled', !emailSettings.enabled)}
        />
        {emailSettings.enabled && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-secondary-200 dark:border-secondary-700">
            <SelectSetting
              label="Notification Threshold"
              value={emailSettings.threshold}
              onChange={(value) => handleUpdate('email.threshold', value)}
              options={[
                { value: 'high', label: 'High Priority Only' },
                { value: 'medium', label: 'Medium & High Priority' },
                { value: 'low', label: 'All Events' },
              ]}
              description="Minimum priority level to trigger an alert."
            />
            <SelectSetting
              label="Notification Frequency"
              value={emailSettings.frequency}
              onChange={(value) => handleUpdate('email.frequency', value)}
              options={[
                { value: 'immediate', label: 'Immediate' },
                { value: 'hourly', label: 'Hourly Digest' },
                { value: 'daily', label: 'Daily Digest' },
              ]}
              description="How often to send notifications."
            />
          </div>
        )}
      </SettingsSection>

      <SettingsSection
        icon={Slack}
        title="Slack Integration"
        description="Connect to Slack for real-time notifications in your workspace."
      >
        <ToggleSetting
          label="Enable Slack Notifications"
          description="Send alerts directly to a Slack channel."
          enabled={slackSettings.enabled}
          onToggle={() => handleUpdate('slack.enabled', !slackSettings.enabled)}
        />
        {slackSettings.enabled && (
          <div className="space-y-4 pt-4 border-t border-secondary-200 dark:border-secondary-700">
            <Input
              label="Slack Webhook URL"
              value={slackSettings.webhook}
              onChange={(e) => handleUpdate('slack.webhook', e.target.value)}
              placeholder="https://hooks.slack.com/services/..."
            />
            <Input
              label="Slack Channel"
              value={slackSettings.channel}
              onChange={(e) => handleUpdate('slack.channel', e.target.value)}
              placeholder="#grc-alerts"
            />
          </div>
        )}
      </SettingsSection>

      <SettingsSection
        icon={Bell}
        title="Dashboard Notifications"
        description="Control real-time alerts within the application interface."
      >
        <ToggleSetting
          label="Enable In-App Alerts"
          description="Show toast notifications for events as they happen."
          enabled={dashboardAlerts.enabled}
          onToggle={() => handleUpdate('dashboard.enabled', !dashboardAlerts.enabled)}
        />
      </SettingsSection>

      <SettingsSection
        icon={Users}
        title="Escalation Rules"
        description="Define the chain of command for unaddressed critical alerts."
      >
        <div className="flex items-center space-x-2 overflow-x-auto pb-2">
          {escalation.levels.map((level, index) => (
            <React.Fragment key={level}>
              <div className="flex-shrink-0 rounded-full bg-secondary-100 dark:bg-secondary-700 px-3 py-1 text-sm font-medium">
                {level}
              </div>
              {index < escalation.levels.length - 1 && (
                <ArrowRight className="h-5 w-5 text-secondary-400 flex-shrink-0" />
              )}
            </React.Fragment>
          ))}
        </div>
        <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-2">
          Alerts will be escalated through this path if not acknowledged within their SLA. (Rules are currently read-only).
        </p>
      </SettingsSection>

      <SettingsSection
        icon={AlertTriangle}
        title="Test Notifications"
        description="Send a sample alert to verify your settings are working correctly."
      >
        <div className="flex items-center justify-between">
          <p className="text-sm text-secondary-600 dark:text-secondary-300">
            This will send a test to all enabled channels.
          </p>
          <Button
            onClick={sendTestNotification}
            loading={testStatus === 'sending'}
            disabled={testStatus === 'sending'}
            variant={testStatus === 'sent' ? 'success' : 'secondary'}
            leadingIcon={testStatus === 'sent' ? CheckCircle : null}
          >
            {testStatus === 'sending' ? 'Sending...' : testStatus === 'sent' ? 'Sent!' : 'Send Test'}
          </Button>
        </div>
      </SettingsSection>
    </div>
  );
};

NotificationsSettings.propTypes = {
  settings: PropTypes.object.isRequired,
  updateSetting: PropTypes.func.isRequired,
};

NotificationsSettings.defaultProps = {
  settings: {
    email: { enabled: true, threshold: 'medium', frequency: 'immediate' },
    slack: { enabled: false, webhook: '', channel: '' },
    dashboard: { enabled: true },
    escalation: { levels: ['Team', 'Manager', 'Executive'] },
  },
};

export default NotificationsSettings;
