import React, { useState, useCallback } from 'react';
import { Palette, Bell, Link, Database, Zap, Shield, Save, CheckCircle, AlertTriangle } from 'lucide-react';
import Button from '../atoms/Button';
import AppearanceSettings from '../organisms/AppearanceSettings';
import NotificationsSettings from '../organisms/NotificationsSettings';
import IntegrationsSettings from '../organisms/IntegrationsSettings';
import DataBackupSettings from '../organisms/DataBackupSettings';
import PerformanceSettings from '../organisms/PerformanceSettings';
import ComplianceSettings from '../organisms/ComplianceSettings';

// --- Organisms (Internal to SettingsPage for now) ---

/**
 * Placeholder for the actual tab content components.
 * In a full implementation, these would be separate files, likely organisms themselves.
 */
const AppearanceTab = () => <div className="dashboard-card p-6">Appearance Settings Content - To be built</div>;
const NotificationsTab = () => <div className="dashboard-card p-6">Notifications Settings Content - To be built</div>;
const IntegrationsTab = () => <div className="dashboard-card p-6">Integrations Settings Content - To be built</div>;
const DataBackupTab = () => <div className="dashboard-card p-6">Data & Backup Settings Content - To be built</div>;
const PerformanceTab = () => <div className="dashboard-card p-6">Performance Settings Content - To be built</div>;
const ComplianceTab = () => <div className="dashboard-card p-6">Compliance Settings Content - To be built</div>;


/**
 * SettingsHeader Organism
 * Displays the page title, description, and the main save action button.
 */
const SettingsHeader = ({ saveStatus, onSave, lastSaved }) => {
  const getSaveButtonProps = () => {
    switch (saveStatus) {
      case 'saving':
        return { children: 'Saving...', loading: true, disabled: true };
      case 'saved':
        return { children: 'Saved!', variant: 'success', leadingIcon: CheckCircle };
      case 'error':
        return { children: 'Save Failed', variant: 'danger', leadingIcon: AlertTriangle };
      default:
        return { children: 'Save Changes', leadingIcon: Save, variant: 'primary' };
    }
  };

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 pb-4 border-b border-secondary-200 dark:border-secondary-700">
      <div>
        <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">System Settings</h1>
        <p className="text-secondary-500 dark:text-secondary-400 mt-1">
          Configure platform behavior, integrations, and compliance settings.
        </p>
      </div>
      <div className="flex items-center gap-4 mt-4 md:mt-0">
        {lastSaved && (
          <span className="text-sm text-secondary-500 dark:text-secondary-400 hidden sm:block">
            Last saved: {lastSaved.toLocaleTimeString()}
          </span>
        )}
        <Button onClick={onSave} {...getSaveButtonProps()} />
      </div>
    </div>
  );
};

/**
 * SettingsTabs Organism
 * Renders the vertical navigation for switching between settings sections.
 */
const SettingsTabs = ({ tabs, activeTab, onTabClick }) => (
  <nav className="w-full md:w-1/4 lg:w-1/5 pr-0 md:pr-8 space-y-1">
    {tabs.map((tab) => {
      const Icon = tab.icon;
      const isActive = activeTab === tab.id;
      return (
        <button
          key={tab.id}
          onClick={() => onTabClick(tab.id)}
          className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-md transition-colors text-sm font-medium
            ${
              isActive
                ? 'bg-primary-100 text-primary-700 dark:bg-primary-500 dark:bg-opacity-20 dark:text-primary-200'
                : 'text-secondary-600 hover:bg-secondary-100 hover:text-secondary-900 dark:text-secondary-300 dark:hover:bg-secondary-700 dark:hover:text-white'
            }
          `}
          aria-current={isActive ? 'page' : undefined}
        >
          <Icon className="w-5 h-5 flex-shrink-0" />
          <span className="truncate">{tab.label}</span>
        </button>
      );
    })}
  </nav>
);


// --- Page Component ---

/**
 * SettingsPage
 * 
 * This page provides a centralized interface for configuring all system-level
 * settings for the Cyber Trust Sensor Dashboard. It uses a tab-based layout
 * to organize settings into logical sections, following the atomic design
 * principles established for the application.
 */
const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('appearance');
  const [saveStatus, setSaveStatus] = useState('idle'); // 'idle', 'saving', 'saved', 'error'
  const [lastSaved, setLastSaved] = useState(null);

  // This state would eventually be managed by a dedicated SettingsContext
  const [settings, setSettings] = useState({
    appearance: {},
    notifications: {},
    integrations: {},
    dataBackup: {},
    performance: {},
    compliance: {},
  });

  const handleSaveSettings = useCallback(async () => {
    setSaveStatus('saving');
    try {
      // Simulate API call to save settings
      await new Promise(resolve => setTimeout(resolve, 1500));
      setLastSaved(new Date());
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2500);
    } catch (error) {
      console.error("Failed to save settings:", error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  }, []);

  const tabs = [
    { id: 'appearance', label: 'Appearance', icon: Palette, component: AppearanceSettings },
    { id: 'notifications', label: 'Notifications', icon: Bell, component: NotificationsSettings },
    { id: 'integrations', label: 'Integrations', icon: Link, component: IntegrationsSettings },
    { id: 'backup', label: 'Data & Backup', icon: Database, component: DataBackupSettings },
    { id: 'performance', label: 'Performance', icon: Zap, component: PerformanceSettings },
    { id: 'compliance', label: 'Compliance', icon: Shield, component: ComplianceSettings },
  ];

  const CurrentTabComponent = tabs.find(tab => tab.id === activeTab)?.component;

  // Simple updater placeholder – can be expanded later
  const updateSetting = useCallback((section, path, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [path]: value,
      },
    }));
  }, []);

  return (
    <div className="fade-in">
      <SettingsHeader
        saveStatus={saveStatus}
        onSave={handleSaveSettings}
        lastSaved={lastSaved}
      />
      <div className="flex flex-col md:flex-row">
        <SettingsTabs
          tabs={tabs}
          activeTab={activeTab}
          onTabClick={setActiveTab}
        />
        <main className="w-full md:w-3/4 lg:w-4/5 mt-6 md:mt-0">
          {CurrentTabComponent && (
            <CurrentTabComponent
              settings={settings[activeTab]}
              updateSetting={(path, value) => updateSetting(activeTab, path, value)}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default SettingsPage;
