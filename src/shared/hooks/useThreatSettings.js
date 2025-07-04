// src/components/threats/ThreatSettings.jsx
import React, { useState, useCallback, useEffect } from 'react';
import { 
  Settings, Bell, Eye, Clock, Mail, Shield, User, Globe, Smartphone, Desktop, 
  Palette, Zap, Database, RefreshCw, Save, Check, AlertTriangle, Info, 
  Download, Upload, RotateCcw, Monitor, Moon, Sun, Volume2, VolumeX,
  Layout, Grid, List, BarChart3, PieChart, Activity, Target, Filter,
  Sliders, Gauge, Calendar, MapPin, Language, Accessibility, Lock,
  FileText, Archive, Trash2, Plus, Minus, Move, X
} from 'lucide-react';

const ThreatSettings = ({ 
  currentSettings = {},
  onUpdateSettings,
  companyProfile = null,
  userProfile = null
}) => {
  // State management
  const [activeSection, setActiveSection] = useState('display'); // display, notifications, dashboard, alerts, data
  const [settings, setSettings] = useState({
    // Display Settings
    informationDensity: 'detailed',
    theme: 'light',
    language: 'en-US',
    timezone: 'Europe/London',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    colorBlindFriendly: false,
    highContrast: false,
    fontSize: 'medium',
    
    // Dashboard Settings
    defaultView: 'dashboard',
    autoRefreshDashboard: true,
    refreshInterval: 300000, // 5 minutes
    widgetAnimations: true,
    compactMode: false,
    sidebarCollapsed: false,
    
    // Widget Preferences
    activeWidgets: [
      'threatLevel', 'severityDistribution', 'mitreHeatmap', 
      'threatActors', 'recentIncidents', 'industryThreats'
    ],
    widgetLayout: 'grid', // grid, list, masonry
    widgetSizes: {
      threatLevel: 'medium',
      severityDistribution: 'medium',
      mitreHeatmap: 'large',
      threatActors: 'medium',
      recentIncidents: 'medium',
      industryThreats: 'small'
    },
    
    // Notification Settings
    enableNotifications: true,
    desktopNotifications: true,
    emailNotifications: true,
    soundEnabled: true,
    notificationTypes: {
      criticalThreats: true,
      highSeverityThreats: true,
      industrySpecific: true,
      weeklyDigest: true,
      systemUpdates: false
    },
    quietHours: {
      enabled: false,
      start: '18:00',
      end: '08:00',
      weekendsOnly: false
    },
    
    // Alert Preferences
    alertThreshold: 'medium', // low, medium, high, critical-only
    personalKeywords: [],
    industryFilter: companyProfile?.industry || 'All',
    geoFilter: ['United Kingdom'],
    severityFilters: ['Critical', 'High', 'Medium'],
    categoryFilters: ['Nation State', 'Cybercriminal', 'Social Engineering'],
    
    // Data & Privacy Settings
    dataRetention: 90, // days
    exportFormat: 'json',
    includePersonalData: false,
    shareAnalytics: true,
    autoBackup: false,
    
    // Advanced Settings
    expertMode: false,
    debugMode: false,
    betaFeatures: false,
    customCSS: '',
    apiAccess: false,
    
    ...currentSettings
  });

  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [loading, setLoading] = useState(false);
  const [testingNotifications, setTestingNotifications] = useState(false);

  // Available widgets configuration
  const availableWidgets = [
    { id: 'threatLevel', name: 'Threat Level Gauge', description: 'Current overall threat assessment', category: 'overview' },
    { id: 'severityDistribution', name: 'Severity Distribution', description: 'Pie chart of threat severities', category: 'analytics' },
    { id: 'mitreHeatmap', name: 'MITRE ATT&CK Heatmap', description: 'Technique frequency visualization', category: 'technical' },
    { id: 'threatActors', name: 'Active Threat Actors', description: 'Current threat actor profiles', category: 'intelligence' },
    { id: 'recentIncidents', name: 'Recent Incidents', description: 'Latest security incidents', category: 'news' },
    { id: 'industryThreats', name: 'Industry Threats', description: 'Sector-specific threat intelligence', category: 'industry' },
    { id: 'riskSummary', name: 'Risk Summary', description: 'Current risk assessment overview', category: 'risk' },
    { id: 'alertsFeed', name: 'Live Alerts Feed', description: 'Real-time threat alerts', category: 'alerts' },
    { id: 'threatTrends', name: 'Threat Trends', description: 'Historical threat patterns', category: 'analytics' },
    { id: 'capabilityGaps', name: 'Capability Gaps', description: 'Security control coverage analysis', category: 'assessment' },
    { id: 'complianceStatus', name: 'Compliance Status', description: 'Regulatory compliance overview', category: 'compliance' },
    { id: 'threatHunting', name: 'Threat Hunting', description: 'Active threat hunting results', category: 'hunting' }
  ];

  // Handle settings update
  const updateSetting = useCallback((key, value) => {
    setSettings(prev => {
      const newSettings = { ...prev };
      
      // Handle nested keys (e.g., 'notificationTypes.criticalThreats')
      if (key.includes('.')) {
        const keys = key.split('.');
        let current = newSettings;
        for (let i = 0; i < keys.length - 1; i++) {
          current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;
      } else {
        newSettings[key] = value;
      }
      
      return newSettings;
    });
    setUnsavedChanges(true);
  }, []);

  // Save settings
  const saveSettings = useCallback(async () => {
    setLoading(true);
    try {
      if (onUpdateSettings) {
        await onUpdateSettings(settings);
      }
      setUnsavedChanges(false);
      
      // Show success notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      notification.textContent = 'Settings saved successfully';
      document.body.appendChild(notification);
      setTimeout(() => document.body.removeChild(notification), 3000);
    } catch (error) {
      alert('Failed to save settings: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [settings, onUpdateSettings]);

  // Reset settings
  const resetSettings = useCallback(() => {
    if (confirm('Are you sure you want to reset all settings to default values?')) {
      setSettings({
        informationDensity: 'detailed',
        theme: 'light',
        enableNotifications: true,
        // ... other defaults
      });
      setUnsavedChanges(true);
    }
  }, []);

  // Test notifications
  const testNotifications = useCallback(async () => {
    setTestingNotifications(true);
    
    // Test desktop notification
    if (settings.desktopNotifications && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification('Test Notification', {
          body: 'This is a test notification from your threat intelligence system.',
          icon: '/favicon.ico'
        });
      } else if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          new Notification('Test Notification', {
            body: 'Notifications are now enabled for threat intelligence alerts.',
            icon: '/favicon.ico'
          });
        }
      }
    }
    
    // Test sound notification
    if (settings.soundEnabled) {
      const audio = new Audio('/notification-sound.mp3');
      audio.play().catch(() => {
        console.log('Could not play notification sound');
      });
    }
    
    setTimeout(() => setTestingNotifications(false), 2000);
  }, [settings.desktopNotifications, settings.soundEnabled]);

  // Widget management
  const toggleWidget = useCallback((widgetId) => {
    setSettings(prev => ({
      ...prev,
      activeWidgets: prev.activeWidgets.includes(widgetId)
        ? prev.activeWidgets.filter(id => id !== widgetId)
        : [...prev.activeWidgets, widgetId]
    }));
    setUnsavedChanges(true);
  }, []);

  const updateWidgetSize = useCallback((widgetId, size) => {
    setSettings(prev => ({
      ...prev,
      widgetSizes: {
        ...prev.widgetSizes,
        [widgetId]: size
      }
    }));
    setUnsavedChanges(true);
  }, []);

  // Render sections
  const renderDisplaySettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Display Preferences</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Information Density */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">Information Density</label>
            <div className="space-y-2">
              {[
                { value: 'basic', label: 'Basic', desc: 'Essential information only' },
                { value: 'detailed', label: 'Detailed', desc: 'Balanced view with context' },
                { value: 'comprehensive', label: 'Comprehensive', desc: 'All available information' }
              ].map(option => (
                <label key={option.value} className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="informationDensity"
                    value={option.value}
                    checked={settings.informationDensity === option.value}
                    onChange={(e) => updateSetting('informationDensity', e.target.value)}
                    className="mt-1"
                  />
                  <div>
                    <div className="text-sm font-medium text-gray-900">{option.label}</div>
                    <div className="text-xs text-gray-500">{option.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Theme */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">Theme</label>
            <div className="flex space-x-3">
              {[
                { value: 'light', icon: Sun, label: 'Light' },
                { value: 'dark', icon: Moon, label: 'Dark' },
                { value: 'auto', icon: Monitor, label: 'Auto' }
              ].map(theme => (
                <button
                  key={theme.value}
                  onClick={() => updateSetting('theme', theme.value)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg border ${
                    settings.theme === theme.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <theme.icon className="w-4 h-4" />
                  <span className="text-sm">{theme.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Language & Region */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">Language & Region</label>
            <div className="space-y-2">
              <select
                value={settings.language}
                onChange={(e) => updateSetting('language', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="en-US">English (US)</option>
                <option value="en-GB">English (UK)</option>
                <option value="es-ES">Español</option>
                <option value="fr-FR">Français</option>
                <option value="de-DE">Deutsch</option>
              </select>
              
              <select
                value={settings.timezone}
                onChange={(e) => updateSetting('timezone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Europe/London">London (GMT)</option>
                <option value="Europe/Paris">Paris (CET)</option>
                <option value="America/New_York">New York (EST)</option>
                <option value="America/Los_Angeles">Los Angeles (PST)</option>
                <option value="Asia/Tokyo">Tokyo (JST)</option>
              </select>
            </div>
          </div>

          {/* Date & Time Format */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">Date & Time Format</label>
            <div className="space-y-2">
              <select
                value={settings.dateFormat}
                onChange={(e) => updateSetting('dateFormat', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
              
              <select
                value={settings.timeFormat}
                onChange={(e) => updateSetting('timeFormat', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="24h">24-hour (13:45)</option>
                <option value="12h">12-hour (1:45 PM)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Accessibility Options */}
        <div className="mt-6 space-y-4">
          <h4 className="text-md font-medium text-gray-900">Accessibility</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">High Contrast Mode</label>
                <p className="text-xs text-gray-500">Improve readability with enhanced contrast</p>
              </div>
              <input
                type="checkbox"
                checked={settings.highContrast}
                onChange={(e) => updateSetting('highContrast', e.target.checked)}
                className="rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Color Blind Friendly</label>
                <p className="text-xs text-gray-500">Use patterns and shapes alongside colors</p>
              </div>
              <input
                type="checkbox"
                checked={settings.colorBlindFriendly}
                onChange={(e) => updateSetting('colorBlindFriendly', e.target.checked)}
                className="rounded"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Font Size</label>
            <div className="flex space-x-3">
              {[
                { value: 'small', label: 'Small' },
                { value: 'medium', label: 'Medium' },
                { value: 'large', label: 'Large' },
                { value: 'extra-large', label: 'Extra Large' }
              ].map(size => (
                <button
                  key={size.value}
                  onClick={() => updateSetting('fontSize', size.value)}
                  className={`px-3 py-2 rounded-md border text-sm ${
                    settings.fontSize === size.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {size.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h3>
        
        {/* Global Notification Settings */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-md font-medium text-gray-900">Enable Notifications</h4>
              <p className="text-sm text-gray-600">Master toggle for all threat intelligence notifications</p>
            </div>
            <input
              type="checkbox"
              checked={settings.enableNotifications}
              onChange={(e) => updateSetting('enableNotifications', e.target.checked)}
              className="rounded"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Desktop Notifications</label>
                <p className="text-xs text-gray-500">Show browser notifications</p>
              </div>
              <input
                type="checkbox"
                checked={settings.desktopNotifications}
                onChange={(e) => updateSetting('desktopNotifications', e.target.checked)}
                disabled={!settings.enableNotifications}
                className="rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Email Notifications</label>
                <p className="text-xs text-gray-500">Send alerts via email</p>
              </div>
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) => updateSetting('emailNotifications', e.target.checked)}
                disabled={!settings.enableNotifications}
                className="rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Sound Alerts</label>
                <p className="text-xs text-gray-500">Play sound for notifications</p>
              </div>
              <input
                type="checkbox"
                checked={settings.soundEnabled}
                onChange={(e) => updateSetting('soundEnabled', e.target.checked)}
                disabled={!settings.enableNotifications}
                className="rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={testNotifications}
                disabled={!settings.enableNotifications || testingNotifications}
                className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm"
              >
                {testingNotifications ? (
                  <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                ) : (
                  <Bell className="w-4 h-4 mr-1" />
                )}
                Test Notifications
              </button>
            </div>
          </div>
        </div>

        {/* Notification Types */}
        <div className="space-y-4">
          <h4 className="text-md font-medium text-gray-900">Notification Types</h4>
          <div className="space-y-3">
            {[
              { key: 'criticalThreats', label: 'Critical Threats', desc: 'Immediate alerts for critical severity threats' },
              { key: 'highSeverityThreats', label: 'High Severity Threats', desc: 'Alerts for high severity threats' },
              { key: 'industrySpecific', label: 'Industry-Specific Threats', desc: 'Threats targeting your industry sector' },
              { key: 'weeklyDigest', label: 'Weekly Digest', desc: 'Summary of threats and trends' },
              { key: 'systemUpdates', label: 'System Updates', desc: 'Platform updates and maintenance' }
            ].map(type => (
              <div key={type.key} className="flex items-center justify-between py-2">
                <div>
                  <label className="text-sm font-medium text-gray-700">{type.label}</label>
                  <p className="text-xs text-gray-500">{type.desc}</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notificationTypes[type.key]}
                  onChange={(e) => updateSetting(`notificationTypes.${type.key}`, e.target.checked)}
                  disabled={!settings.enableNotifications}
                  className="rounded"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Quiet Hours */}
        <div className="space-y-4">
          <h4 className="text-md font-medium text-gray-900">Quiet Hours</h4>
          <div className="flex items-center justify-between mb-3">
            <div>
              <label className="text-sm font-medium text-gray-700">Enable Quiet Hours</label>
              <p className="text-xs text-gray-500">Suppress non-critical notifications during specified hours</p>
            </div>
            <input
              type="checkbox"
              checked={settings.quietHours.enabled}
              onChange={(e) => updateSetting('quietHours.enabled', e.target.checked)}
              className="rounded"
            />
          </div>

          {settings.quietHours.enabled && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pl-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                <input
                  type="time"
                  value={settings.quietHours.start}
                  onChange={(e) => updateSetting('quietHours.start', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                <input
                  type="time"
                  value={settings.quietHours.end}
                  onChange={(e) => updateSetting('quietHours.end', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="weekendsOnly"
                  checked={settings.quietHours.weekendsOnly}
                  onChange={(e) => updateSetting('quietHours.weekendsOnly', e.target.checked)}
                  className="mr-2 rounded"
                />
                <label htmlFor="weekendsOnly" className="text-sm font-medium text-gray-700">
                  Weekends Only
                </label>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderDashboardSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Dashboard Preferences</h3>
        
        {/* Dashboard Behavior */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Default View</label>
            <select
              value={settings.defaultView}
              onChange={(e) => updateSetting('defaultView', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="dashboard">Dashboard Overview</option>
              <option value="threats">Threat List</option>
              <option value="risks">Risk Management</option>
              <option value="analytics">Analytics</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Auto-refresh Dashboard</label>
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={settings.autoRefreshDashboard}
                onChange={(e) => updateSetting('autoRefreshDashboard', e.target.checked)}
                className="rounded"
              />
              {settings.autoRefreshDashboard && (
                <select
                  value={settings.refreshInterval}
                  onChange={(e) => updateSetting('refreshInterval', parseInt(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={60000}>1 minute</option>
                  <option value={300000}>5 minutes</option>
                  <option value={600000}>10 minutes</option>
                  <option value={1800000}>30 minutes</option>
                </select>
              )}
            </div>
          </div>
        </div>

        {/* Layout Options */}
        <div className="space-y-4">
          <h4 className="text-md font-medium text-gray-900">Layout Options</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Widget Animations</label>
                <p className="text-xs text-gray-500">Enable loading and transition animations</p>
              </div>
              <input
                type="checkbox"
                checked={settings.widgetAnimations}
                onChange={(e) => updateSetting('widgetAnimations', e.target.checked)}
                className="rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Compact Mode</label>
                <p className="text-xs text-gray-500">Reduce spacing and padding</p>
              </div>
              <input
                type="checkbox"
                checked={settings.compactMode}
                onChange={(e) => updateSetting('compactMode', e.target.checked)}
                className="rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Sidebar Collapsed</label>
                <p className="text-xs text-gray-500">Start with sidebar minimized</p>
              </div>
              <input
                type="checkbox"
                checked={settings.sidebarCollapsed}
                onChange={(e) => updateSetting('sidebarCollapsed', e.target.checked)}
                className="rounded"
              />
            </div>
          </div>
        </div>

        {/* Widget Configuration */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-md font-medium text-gray-900">Widget Configuration</h4>
            <div className="flex space-x-2">
              {[
                { value: 'grid', icon: Grid, label: 'Grid' },
                { value: 'list', icon: List, label: 'List' },
                { value: 'masonry', icon: Layout, label: 'Masonry' }
              ].map(layout => (
                <button
                  key={layout.value}
                  onClick={() => updateSetting('widgetLayout', layout.value)}
                  className={`p-2 rounded-md border ${
                    settings.widgetLayout === layout.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                  title={layout.label}
                >
                  <layout.icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto border rounded-lg p-4">
            {availableWidgets.map(widget => (
              <div key={widget.id} className="flex items-center justify-between py-2">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={settings.activeWidgets.includes(widget.id)}
                    onChange={() => toggleWidget(widget.id)}
                    className="rounded"
                  />
                  <div>
                    <label className="text-sm font-medium text-gray-700">{widget.name}</label>
                    <p className="text-xs text-gray-500">{widget.description}</p>
                  </div>
                </div>
                
                {settings.activeWidgets.includes(widget.id) && (
                  <select
                    value={settings.widgetSizes[widget.id] || 'medium'}
                    onChange={(e) => updateWidgetSize(widget.id, e.target.value)}
                    className="px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderAlertSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Alert Preferences</h3>
        
        {/* Alert Threshold */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Alert Threshold</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { value: 'low', label: 'All Threats', desc: 'Low severity and above' },
              { value: 'medium', label: 'Medium+', desc: 'Medium severity and above' },
              { value: 'high', label: 'High+', desc: 'High severity and above' },
              { value: 'critical-only', label: 'Critical Only', desc: 'Critical threats only' }
            ].map(threshold => (
              <button
                key={threshold.value}
                onClick={() => updateSetting('alertThreshold', threshold.value)}
                className={`p-3 rounded-lg border text-left ${
                  settings.alertThreshold === threshold.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="text-sm font-medium">{threshold.label}</div>
                <div className="text-xs">{threshold.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Personal Keywords */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Personal Keywords</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {settings.personalKeywords.map((keyword, index) => (
              <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                {keyword}
                <button
                  onClick={() => {
                    const newKeywords = settings.personalKeywords.filter((_, i) => i !== index);
                    updateSetting('personalKeywords', newKeywords);
                  }}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Add keyword (e.g., ransomware, phishing)"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && e.target.value.trim()) {
                  const newKeywords = [...settings.personalKeywords, e.target.value.trim()];
                  updateSetting('personalKeywords', newKeywords);
                  e.target.value = '';
                }
              }}
            />
            <button className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Preferences */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Industry Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Industry Focus</label>
            <select
              value={settings.industryFilter}
              onChange={(e) => updateSetting('industryFilter', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Industries</option>
              <option value="Energy">Energy</option>
              <option value="Oil & Gas">Oil & Gas</option>
              <option value="Critical Infrastructure">Critical Infrastructure</option>
              <option value="Government">Government</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Finance">Finance</option>
            </select>
          </div>

          {/* Geographic Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Geographic Focus</label>
            <select
              multiple
              value={settings.geoFilter}
              onChange={(e) => {
                const values = Array.from(e.target.selectedOptions, option => option.value);
                updateSetting('geoFilter', values);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              size="3"
            >
              <option value="Global">Global</option>
              <option value="United Kingdom">United Kingdom</option>
              <option value="Europe">Europe</option>
              <option value="North America">North America</option>
              <option value="Asia Pacific">Asia Pacific</option>
            </select>
          </div>
        </div>

        {/* Category and Severity Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Threat Categories</label>
            <div className="space-y-2">
              {['Nation State', 'Cybercriminal', 'Hacktivist', 'Social Engineering', 'Insider Threat'].map(category => (
                <label key={category} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.categoryFilters.includes(category)}
                    onChange={(e) => {
                      const newFilters = e.target.checked
                        ? [...settings.categoryFilters, category]
                        : settings.categoryFilters.filter(c => c !== category);
                      updateSetting('categoryFilters', newFilters);
                    }}
                    className="mr-2 rounded"
                  />
                  <span className="text-sm">{category}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Severity Levels</label>
            <div className="space-y-2">
              {['Critical', 'High', 'Medium', 'Low'].map(severity => (
                <label key={severity} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.severityFilters.includes(severity)}
                    onChange={(e) => {
                      const newFilters = e.target.checked
                        ? [...settings.severityFilters, severity]
                        : settings.severityFilters.filter(s => s !== severity);
                      updateSetting('severityFilters', newFilters);
                    }}
                    className="mr-2 rounded"
                  />
                  <span className="text-sm">{severity}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDataSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Data & Privacy Settings</h3>
        
        {/* Data Retention */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Data Retention</label>
            <select
              value={settings.dataRetention}
              onChange={(e) => updateSetting('dataRetention', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={30}>30 days</option>
              <option value={90}>90 days</option>
              <option value={180}>6 months</option>
              <option value={365}>1 year</option>
              <option value={0}>Never delete</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">How long to keep threat intelligence data</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Export Format</label>
            <select
              value={settings.exportFormat}
              onChange={(e) => updateSetting('exportFormat', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="json">JSON</option>
              <option value="csv">CSV</option>
              <option value="xml">XML</option>
              <option value="pdf">PDF Report</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">Default format for data exports</p>
          </div>
        </div>

        {/* Privacy Options */}
        <div className="space-y-4">
          <h4 className="text-md font-medium text-gray-900">Privacy Options</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Include Personal Data in Exports</label>
                <p className="text-xs text-gray-500">Include user-specific settings and preferences</p>
              </div>
              <input
                type="checkbox"
                checked={settings.includePersonalData}
                onChange={(e) => updateSetting('includePersonalData', e.target.checked)}
                className="rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Share Usage Analytics</label>
                <p className="text-xs text-gray-500">Help improve the platform with anonymous usage data</p>
              </div>
              <input
                type="checkbox"
                checked={settings.shareAnalytics}
                onChange={(e) => updateSetting('shareAnalytics', e.target.checked)}
                className="rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Auto Backup Settings</label>
                <p className="text-xs text-gray-500">Automatically backup your configuration</p>
              </div>
              <input
                type="checkbox"
                checked={settings.autoBackup}
                onChange={(e) => updateSetting('autoBackup', e.target.checked)}
                className="rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">API Access</label>
                <p className="text-xs text-gray-500">Enable programmatic access to your data</p>
              </div>
              <input
                type="checkbox"
                checked={settings.apiAccess}
                onChange={(e) => updateSetting('apiAccess', e.target.checked)}
                className="rounded"
              />
            </div>
          </div>
        </div>

        {/* Advanced Settings */}
        <div className="space-y-4">
          <h4 className="text-md font-medium text-gray-900">Advanced Settings</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Expert Mode</label>
                <p className="text-xs text-gray-500">Show advanced features and technical details</p>
              </div>
              <input
                type="checkbox"
                checked={settings.expertMode}
                onChange={(e) => updateSetting('expertMode', e.target.checked)}
                className="rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Beta Features</label>
                <p className="text-xs text-gray-500">Enable experimental features (may be unstable)</p>
              </div>
              <input
                type="checkbox"
                checked={settings.betaFeatures}
                onChange={(e) => updateSetting('betaFeatures', e.target.checked)}
                className="rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Debug Mode</label>
                <p className="text-xs text-gray-500">Show debug information and logs</p>
              </div>
              <input
                type="checkbox"
                checked={settings.debugMode}
                onChange={(e) => updateSetting('debugMode', e.target.checked)}
                className="rounded"
              />
            </div>
          </div>
        </div>

        {/* Export/Import Settings */}
        <div className="flex space-x-3 pt-4 border-t">
          <button
            onClick={() => {
              const dataStr = JSON.stringify(settings, null, 2);
              const dataBlob = new Blob([dataStr], {type: 'application/json'});
              const url = URL.createObjectURL(dataBlob);
              const link = document.createElement('a');
              link.href = url;
              link.download = 'threat-intelligence-settings.json';
              link.click();
            }}
            className="flex items-center px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Settings
          </button>
          
          <button
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = '.json';
              input.onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (e) => {
                    try {
                      const importedSettings = JSON.parse(e.target.result);
                      setSettings(importedSettings);
                      setUnsavedChanges(true);
                    } catch (error) {
                      alert('Invalid settings file');
                    }
                  };
                  reader.readAsText(file);
                }
              };
              input.click();
            }}
            className="flex items-center px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <Upload className="w-4 h-4 mr-2" />
            Import Settings
          </button>
        </div>
      </div>
    </div>
  );

  // Main render
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Threat Intelligence Settings</h1>
          <p className="text-gray-600">Customize your threat intelligence experience</p>
        </div>
        
        <div className="flex items-center space-x-3">
          {unsavedChanges && (
            <span className="flex items-center text-sm text-orange-600">
              <AlertTriangle className="w-4 h-4 mr-1" />
              Unsaved changes
            </span>
          )}
          
          <button
            onClick={resetSettings}
            className="flex items-center px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </button>
          
          <button
            onClick={saveSettings}
            disabled={loading || !unsavedChanges}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Settings
          </button>
        </div>
      </div>

      {/* Settings Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'display', name: 'Display', icon: Eye },
            { id: 'notifications', name: 'Notifications', icon: Bell },
            { id: 'dashboard', name: 'Dashboard', icon: Layout },
            { id: 'alerts', name: 'Alerts', icon: AlertTriangle },
            { id: 'data', name: 'Data & Privacy', icon: Shield }
          ].map(section => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`group inline-flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                activeSection === section.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <section.icon className="w-4 h-4 mr-2" />
              {section.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Settings Content */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {activeSection === 'display' && renderDisplaySettings()}
        {activeSection === 'notifications' && renderNotificationSettings()}
        {activeSection === 'dashboard' && renderDashboardSettings()}
        {activeSection === 'alerts' && renderAlertSettings()}
        {activeSection === 'data' && renderDataSettings()}
      </div>
    </div>
  );
};

export default ThreatSettings;