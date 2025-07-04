import React, { useState } from 'react';
import { Save, CheckCircle, Bell, Link, Database, Zap, Shield, Palette } from 'lucide-react';
import {
  NotificationsTab,
  IntegrationsTab,
  DataBackupTab,
  PerformanceTab,
  ComplianceTab,
  AppearanceTab
} from './index';

const SystemSettings = () => {
  const [activeTab, setActiveTab] = useState('notifications');
  const [settings, setSettings] = useState({
    notifications: {
      email: { enabled: true, threshold: 'medium', frequency: 'immediate' },
      slack: { enabled: false, webhook: '', channel: '' },
      dashboard: { enabled: true, realtime: true },
      escalation: { enabled: true, levels: ['team', 'manager', 'exec'] }
    },
    integrations: {
      siem: { type: 'splunk', endpoint: '', apiKey: '', status: 'disconnected' },
      ticketing: { type: 'jira', endpoint: '', credentials: '', status: 'connected' },
      identity: { type: 'azure-ad', tenant: '', status: 'connected' },
      monitoring: { type: 'datadog', apiKey: '', status: 'disconnected' }
    },
    dataBackup: {
      schedule: 'daily',
      retention: '7-years',
      encryption: 'aes-256',
      verification: 'monthly',
      storage: 'aws-s3',
      compliance: 'sox-ready'
    },
    performance: {
      caching: { enabled: true, ttl: 300 },
      indexing: { rebuild: 'weekly', optimize: true },
      queries: { timeout: 30, maxConcurrent: 50 },
      monitoring: { alerts: true, threshold: 85 }
    },
    compliance: {
      frameworks: ['iso27001', 'sox', 'nist'],
      auditLog: { retention: '7-years', immutable: true },
      dataResidency: 'us-east',
      encryption: { transit: true, rest: true },
      access: { mfa: true, rbac: true, sessionTimeout: 480 }
    },
    appearance: {
      theme: 'system',
      brandColors: { primary: '#2563eb', secondary: '#64748b' },
      dashboard: { density: 'comfortable', animations: true },
      reports: { template: 'professional', watermark: true }
    }
  });

  const [lastSaved, setLastSaved] = useState(null);
  const [saveStatus, setSaveStatus] = useState('idle');

  const updateSetting = (section, path, value) => {
    setSettings(prev => {
      const newSettings = { ...prev };
      const keys = path.split('.');
      let current = newSettings[section];
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      
      return newSettings;
    });
  };

  const saveSettings = async () => {
    setSaveStatus('saving');
    
    try {
      // Simulate API call - replace with your actual API endpoint
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });
      
      if (response.ok) {
        setLastSaved(new Date());
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } else {
        setSaveStatus('error');
        setTimeout(() => setSaveStatus('idle'), 3000);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const tabs = [
    { id: 'notifications', label: 'Notifications', icon: Bell, component: NotificationsTab },
    { id: 'integrations', label: 'Integrations', icon: Link, component: IntegrationsTab },
    { id: 'backup', label: 'Data & Backup', icon: Database, component: DataBackupTab },
    { id: 'performance', label: 'Performance', icon: Zap, component: PerformanceTab },
    { id: 'compliance', label: 'Compliance', icon: Shield, component: ComplianceTab },
    { id: 'appearance', label: 'Appearance', icon: Palette, component: AppearanceTab }
  ];

  const currentTab = tabs.find(tab => tab.id === activeTab);
  const CurrentTabComponent = currentTab?.component;

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Systems Settings</h1>
          <p className="text-gray-600">Configure platform behavior, integrations, and compliance settings</p>
        </div>
        
        <div className="flex items-center gap-3">
          {lastSaved && (
            <div className="text-sm text-gray-500">
              Last saved: {lastSaved.toLocaleTimeString()}
            </div>
          )}
          <button 
            onClick={saveSettings}
            disabled={saveStatus === 'saving'}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
              saveStatus === 'saving' 
                ? 'bg-gray-400 text-white cursor-not-allowed' 
                : saveStatus === 'saved'
                ? 'bg-green-600 text-white'
                : saveStatus === 'error'
                ? 'bg-red-600 text-white'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {saveStatus === 'saving' ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : saveStatus === 'saved' ? (
              <>
                <CheckCircle className="w-4 h-4" />
                Saved
              </>
            ) : saveStatus === 'error' ? (
              <>
                ✕ Error
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Tab Navigation */}
        <div className="w-64 space-y-1">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-colors ${
                  activeTab === tab.id 
                    ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="flex-1">
          {CurrentTabComponent && (
            <CurrentTabComponent 
              settings={settings} 
              updateSetting={updateSetting}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;