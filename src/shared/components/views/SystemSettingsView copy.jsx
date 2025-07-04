import React, { useState, useEffect } from 'react';
import { 
  Settings, Users, Shield, Key, Database, Bell, Palette, 
  Globe, Server, Clock, Lock, Eye, EyeOff, Save, RefreshCw,
  AlertTriangle, CheckCircle, Info, Plus, Trash2, Edit3,
  Monitor, Zap, Code, FileText, Download, Upload, Copy,
  Activity, BarChart3, Mail, Smartphone, Wifi, HardDrive,
  Layers, Target, Network, Timer, DollarSign, Building2,
  User, UserPlus, UserMinus, Crown, Star, AlertCircle
} from 'lucide-react';

const SystemSettingsView = ({ companyProfile, onProfileUpdate, currentUser }) => {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({});
  const [users, setUsers] = useState([]);
  const [apiKeys, setApiKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState('');
  const [showApiKey, setShowApiKey] = useState({});

  // Initialize settings from localStorage or defaults
  useEffect(() => {
    const loadSettings = () => {
      try {
        const savedSettings = localStorage.getItem('systemSettings');
        const defaultSettings = {
          // General Settings
          general: {
            systemName: companyProfile?.companyName || 'Cyber Trust Portal',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            language: 'en-US',
            dateFormat: 'MM/dd/yyyy',
            theme: 'light',
            autoSave: true,
            sessionTimeout: 30,
            maxFileUploadSize: 10,
            enableTelemetry: true
          },
          
          // Security Settings
          security: {
            mfaRequired: true,
            passwordMinLength: 12,
            passwordComplexity: true,
            sessionDuration: 8,
            maxLoginAttempts: 5,
            lockoutDuration: 15,
            apiRateLimit: 1000,
            encryptionLevel: 'AES-256',
            auditLogging: true,
            ipWhitelist: '',
            ssoEnabled: false,
            certificateValidation: true
          },
          
          // Notifications
          notifications: {
            emailEnabled: true,
            smsEnabled: false,
            pushEnabled: true,
            threatAlerts: true,
            systemAlerts: true,
            complianceAlerts: true,
            digestFrequency: 'daily',
            alertThreshold: 'medium',
            quietHours: { start: '22:00', end: '06:00' },
            escalationDelay: 15
          },
          
          // API Configuration
          api: {
            version: 'v2.1',
            maxRequestsPerMinute: 100,
            enableCaching: true,
            cacheTimeout: 300,
            enableCompression: true,
            corsEnabled: true,
            webhookRetries: 3,
            timeoutSeconds: 30
          },
          
          // Data & Backup
          data: {
            retentionPeriod: 365,
            backupFrequency: 'daily',
            backupRetention: 90,
            enableEncryption: true,
            compressionEnabled: true,
            autoCleanup: true,
            exportFormat: 'json',
            gdprCompliance: true
          },
          
          // Integration Settings
          integrations: {
            siemEnabled: false,
            siemEndpoint: '',
            threatIntelFeeds: [],
            externalAPIs: {},
            webhookEndpoints: [],
            syncFrequency: 'hourly',
            enableSSO: false,
            ldapConfig: {}
          },
          
          // Performance & Monitoring
          performance: {
            enableMonitoring: true,
            metricsRetention: 30,
            alertThresholds: {
              cpuUsage: 85,
              memoryUsage: 90,
              diskUsage: 80,
              responseTime: 2000
            },
            enableCaching: true,
            enableCompression: true,
            logLevel: 'info'
          },
          
          // Compliance & Risk
          compliance: {
            frameworks: ['NIST', 'ISO27001', 'SOC2'],
            reportingFrequency: 'monthly',
            riskTolerance: 'medium',
            autoRemediation: false,
            complianceOfficer: currentUser.email,
            evidenceRetention: 2555, // 7 years in days
            auditFrequency: 'quarterly'
          }
        };

        const loadedSettings = savedSettings ? 
          { ...defaultSettings, ...JSON.parse(savedSettings) } : 
          defaultSettings;
        
        setSettings(loadedSettings);
        
        // Load users (mock data)
        const mockUsers = [
          {
            id: '1',
            name: currentUser.name,
            email: currentUser.email,
            role: 'Administrator',
            status: 'Active',
            lastLogin: new Date().toISOString(),
            mfaEnabled: true,
            permissions: ['admin', 'read', 'write', 'delete', 'export', 'configure']
          },
          {
            id: '2',
            name: 'Security Analyst',
            email: 'analyst@company.com',
            role: 'Analyst',
            status: 'Active',
            lastLogin: new Date(Date.now() - 86400000).toISOString(),
            mfaEnabled: true,
            permissions: ['read', 'write', 'export']
          },
          {
            id: '3',
            name: 'Compliance Officer',
            email: 'compliance@company.com',
            role: 'Compliance',
            status: 'Active',
            lastLogin: new Date(Date.now() - 172800000).toISOString(),
            mfaEnabled: true,
            permissions: ['read', 'export', 'compliance']
          },
          {
            id: '4',
            name: 'IT Manager',
            email: 'it@company.com',
            role: 'Manager',
            status: 'Inactive',
            lastLogin: new Date(Date.now() - 604800000).toISOString(),
            mfaEnabled: false,
            permissions: ['read', 'configure']
          }
        ];
        setUsers(mockUsers);

        // Load API Keys (mock data)
        const mockApiKeys = [
          {
            id: '1',
            name: 'SIEM Integration',
            key: 'sk_live_abcd1234567890efghij',
            created: new Date(Date.now() - 2592000000).toISOString(),
            lastUsed: new Date(Date.now() - 86400000).toISOString(),
            permissions: ['read', 'write'],
            status: 'Active',
            rateLimit: 1000
          },
          {
            id: '2',
            name: 'Threat Intelligence Feed',
            key: 'sk_live_zyxw9876543210ponmlk',
            created: new Date(Date.now() - 1296000000).toISOString(),
            lastUsed: new Date(Date.now() - 3600000).toISOString(),
            permissions: ['read'],
            status: 'Active',
            rateLimit: 500
          },
          {
            id: '3',
            name: 'Legacy Integration',
            key: 'sk_test_oldkey12345678901234',
            created: new Date(Date.now() - 7776000000).toISOString(),
            lastUsed: new Date(Date.now() - 2592000000).toISOString(),
            permissions: ['read'],
            status: 'Deprecated',
            rateLimit: 100
          }
        ];
        setApiKeys(mockApiKeys);

      } catch (error) {
        console.error('Error loading settings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [companyProfile, currentUser]);

  const saveSettings = async () => {
    setSaveStatus('saving');
    try {
      localStorage.setItem('systemSettings', JSON.stringify(settings));
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  const updateSetting = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const generateApiKey = () => {
    const newKey = {
      id: Date.now().toString(),
      name: 'New API Key',
      key: `sk_live_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
      created: new Date().toISOString(),
      lastUsed: null,
      permissions: ['read'],
      status: 'Active',
      rateLimit: 100
    };
    setApiKeys(prev => [...prev, newKey]);
  };

  const toggleApiKeyVisibility = (keyId) => {
    setShowApiKey(prev => ({
      ...prev,
      [keyId]: !prev[keyId]
    }));
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const tabs = [
    { id: 'general', name: 'General', icon: Settings },
    { id: 'users', name: 'Users & Roles', icon: Users },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'api', name: 'API & Keys', icon: Key },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'integrations', name: 'Integrations', icon: Network },
    { id: 'data', name: 'Data & Backup', icon: Database },
    { id: 'performance', name: 'Performance', icon: BarChart3 },
    { id: 'compliance', name: 'Compliance', icon: FileText },
    { id: 'appearance', name: 'Appearance', icon: Palette }
  ];

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">System Name</label>
          <input
            type="text"
            value={settings.general?.systemName || ''}
            onChange={(e) => updateSetting('general', 'systemName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
          <select
            value={settings.general?.timezone || ''}
            onChange={(e) => updateSetting('general', 'timezone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="UTC">UTC</option>
            <option value="America/New_York">Eastern Time</option>
            <option value="America/Chicago">Central Time</option>
            <option value="America/Denver">Mountain Time</option>
            <option value="America/Los_Angeles">Pacific Time</option>
            <option value="Europe/London">London</option>
            <option value="Europe/Paris">Paris</option>
            <option value="Asia/Tokyo">Tokyo</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
          <input
            type="number"
            value={settings.general?.sessionTimeout || 30}
            onChange={(e) => updateSetting('general', 'sessionTimeout', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Max File Upload (MB)</label>
          <input
            type="number"
            value={settings.general?.maxFileUploadSize || 10}
            onChange={(e) => updateSetting('general', 'maxFileUploadSize', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h4 className="text-sm font-medium text-gray-900">Auto-save</h4>
            <p className="text-sm text-gray-500">Automatically save changes</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.general?.autoSave || false}
              onChange={(e) => updateSetting('general', 'autoSave', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h4 className="text-sm font-medium text-gray-900">Enable Telemetry</h4>
            <p className="text-sm text-gray-500">Help improve the system by sharing anonymous usage data</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.general?.enableTelemetry || false}
              onChange={(e) => updateSetting('general', 'enableTelemetry', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>
    </div>
  );

  const renderUsersAndRoles = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">User Management</h3>
        <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <UserPlus className="h-4 w-4 mr-2" />
          Add User
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
          <h4 className="text-sm font-medium text-gray-900">Active Users ({users.filter(u => u.status === 'Active').length})</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MFA</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8">
                        <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                          <User className="h-4 w-4 text-gray-600" />
                        </div>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900 flex items-center">
                          {user.name}
                          {user.role === 'Administrator' && <Crown className="h-3 w-3 text-yellow-500 ml-1" />}
                        </div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.role === 'Administrator' ? 'bg-purple-100 text-purple-800' :
                      user.role === 'Manager' ? 'bg-blue-100 text-blue-800' :
                      user.role === 'Analyst' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.lastLogin).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.mfaEnabled ? 
                      <CheckCircle className="h-5 w-5 text-green-500" /> : 
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button className="text-blue-600 hover:text-blue-900">
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button className="text-red-600 hover:text-red-900">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Permissions Matrix */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Role Permissions</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">Permission</th>
                <th className="text-center py-2 px-3 text-sm font-medium text-gray-700">Admin</th>
                <th className="text-center py-2 px-3 text-sm font-medium text-gray-700">Manager</th>
                <th className="text-center py-2 px-3 text-sm font-medium text-gray-700">Analyst</th>
                <th className="text-center py-2 px-3 text-sm font-medium text-gray-700">Compliance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {[
                { name: 'View Dashboard', admin: true, manager: true, analyst: true, compliance: true },
                { name: 'Manage Users', admin: true, manager: false, analyst: false, compliance: false },
                { name: 'Configure System', admin: true, manager: true, analyst: false, compliance: false },
                { name: 'Export Data', admin: true, manager: true, analyst: true, compliance: true },
                { name: 'Delete Requirements', admin: true, manager: true, analyst: false, compliance: false },
                { name: 'Compliance Reports', admin: true, manager: true, analyst: false, compliance: true },
                { name: 'API Access', admin: true, manager: true, analyst: true, compliance: false }
              ].map((permission, index) => (
                <tr key={index}>
                  <td className="py-3 px-3 text-sm text-gray-900">{permission.name}</td>
                  <td className="py-3 px-3 text-center">
                    {permission.admin ? <CheckCircle className="h-4 w-4 text-green-500 mx-auto" /> : <span className="text-gray-300">-</span>}
                  </td>
                  <td className="py-3 px-3 text-center">
                    {permission.manager ? <CheckCircle className="h-4 w-4 text-green-500 mx-auto" /> : <span className="text-gray-300">-</span>}
                  </td>
                  <td className="py-3 px-3 text-center">
                    {permission.analyst ? <CheckCircle className="h-4 w-4 text-green-500 mx-auto" /> : <span className="text-gray-300">-</span>}
                  </td>
                  <td className="py-3 px-3 text-center">
                    {permission.compliance ? <CheckCircle className="h-4 w-4 text-green-500 mx-auto" /> : <span className="text-gray-300">-</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Password Min Length</label>
          <input
            type="number"
            value={settings.security?.passwordMinLength || 12}
            onChange={(e) => updateSetting('security', 'passwordMinLength', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Session Duration (hours)</label>
          <input
            type="number"
            value={settings.security?.sessionDuration || 8}
            onChange={(e) => updateSetting('security', 'sessionDuration', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Max Login Attempts</label>
          <input
            type="number"
            value={settings.security?.maxLoginAttempts || 5}
            onChange={(e) => updateSetting('security', 'maxLoginAttempts', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">API Rate Limit (per hour)</label>
          <input
            type="number"
            value={settings.security?.apiRateLimit || 1000}
            onChange={(e) => updateSetting('security', 'apiRateLimit', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="space-y-4">
        {[
          { key: 'mfaRequired', label: 'Require Multi-Factor Authentication', desc: 'Force all users to enable MFA' },
          { key: 'passwordComplexity', label: 'Password Complexity Requirements', desc: 'Require special characters, numbers, etc.' },
          { key: 'auditLogging', label: 'Audit Logging', desc: 'Log all user actions and system events' },
          { key: 'ssoEnabled', label: 'Single Sign-On (SSO)', desc: 'Enable SSO integration' },
          { key: 'certificateValidation', label: 'Certificate Validation', desc: 'Validate SSL/TLS certificates' }
        ].map((setting) => (
          <div key={setting.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="text-sm font-medium text-gray-900">{setting.label}</h4>
              <p className="text-sm text-gray-500">{setting.desc}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.security?.[setting.key] || false}
                onChange={(e) => updateSetting('security', setting.key, e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        ))}
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
          <div>
            <h4 className="text-sm font-medium text-yellow-800">Security Notice</h4>
            <p className="text-sm text-yellow-700 mt-1">
              Changes to security settings will affect all users and may require re-authentication.
              Ensure you have administrative access before making critical changes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderApiAndKeys = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">API Keys</h3>
        <button 
          onClick={generateApiKey}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Generate New Key
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Key</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Used</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rate Limit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {apiKeys.map((apiKey) => (
                <tr key={apiKey.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{apiKey.name}</div>
                    <div className="text-sm text-gray-500">Created {new Date(apiKey.created).toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono">
                        {showApiKey[apiKey.id] ? apiKey.key : '••••••••••••••••••••'}
                      </code>
                      <button
                        onClick={() => toggleApiKeyVisibility(apiKey.id)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        {showApiKey[apiKey.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => copyToClipboard(apiKey.key)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      apiKey.status === 'Active' ? 'bg-green-100 text-green-800' :
                      apiKey.status === 'Deprecated' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {apiKey.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {apiKey.lastUsed ? new Date(apiKey.lastUsed).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {apiKey.rateLimit}/hour
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button className="text-blue-600 hover:text-blue-900">
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button className="text-red-600 hover:text-red-900">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* API Configuration */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">API Configuration</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">API Version</label>
            <select
              value={settings.api?.version || 'v2.1'}
              onChange={(e) => updateSetting('api', 'version', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="v1.0">v1.0 (Legacy)</option>
              <option value="v2.0">v2.0</option>
              <option value="v2.1">v2.1 (Current)</option>
              <option value="v3.0">v3.0 (Beta)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Request Timeout (seconds)</label>
            <input
              type="number"
              value={settings.api?.timeoutSeconds || 30}
              onChange={(e) => updateSetting('api', 'timeoutSeconds', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {[
            { key: 'enableCaching', label: 'Enable Response Caching', desc: 'Cache API responses for better performance' },
            { key: 'enableCompression', label: 'Enable Compression', desc: 'Compress API responses to reduce bandwidth' },
            { key: 'corsEnabled', label: 'Enable CORS', desc: 'Allow cross-origin requests' }
          ].map((setting) => (
            <div key={setting.key} className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <div>
                <h5 className="text-sm font-medium text-gray-900">{setting.label}</h5>
                <p className="text-xs text-gray-500">{setting.desc}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.api?.[setting.key] || false}
                  onChange={(e) => updateSetting('api', setting.key, e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Simplified render methods for other tabs
  const renderNotifications = () => (
    <div className="space-y-6">
      <div className="text-center py-12">
        <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900">Notification Settings</h3>
        <p className="text-gray-600">Configure email, SMS, and push notification preferences</p>
      </div>
    </div>
  );

  const renderIntegrations = () => (
    <div className="space-y-6">
      <div className="text-center py-12">
        <Network className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900">Integration Settings</h3>
        <p className="text-gray-600">Configure SIEM, threat intelligence, and external API integrations</p>
      </div>
    </div>
  );

  const renderDataAndBackup = () => (
    <div className="space-y-6">
      <div className="text-center py-12">
        <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900">Data & Backup Settings</h3>
        <p className="text-gray-600">Configure data retention, backup schedules, and compliance settings</p>
      </div>
    </div>
  );

  const renderPerformance = () => (
    <div className="space-y-6">
      <div className="text-center py-12">
        <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900">Performance Settings</h3>
        <p className="text-gray-600">Configure monitoring, alerting, and performance optimization</p>
      </div>
    </div>
  );

  const renderCompliance = () => (
    <div className="space-y-6">
      <div className="text-center py-12">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900">Compliance Settings</h3>
        <p className="text-gray-600">Configure compliance frameworks, reporting, and audit settings</p>
      </div>
    </div>
  );

  const renderAppearance = () => (
    <div className="space-y-6">
      <div className="text-center py-12">
        <Palette className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900">Appearance Settings</h3>
        <p className="text-gray-600">Configure themes, layouts, and visual preferences</p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading system settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between">
          <div className="mb-4 lg:mb-0">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Settings className="h-7 w-7 mr-3 text-blue-600" />
              System Settings
            </h2>
            <p className="text-gray-600 mt-1">
              Configure system preferences, security, and integrations
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            {saveStatus && (
              <div className={`text-sm flex items-center ${
                saveStatus === 'saved' ? 'text-green-600' : 
                saveStatus === 'saving' ? 'text-blue-600' : 'text-red-600'
              }`}>
                {saveStatus === 'saving' && <RefreshCw className="h-4 w-4 mr-1 animate-spin" />}
                {saveStatus === 'saved' && <CheckCircle className="h-4 w-4 mr-1" />}
                {saveStatus === 'error' && <AlertTriangle className="h-4 w-4 mr-1" />}
                {saveStatus === 'saving' ? 'Saving...' : 
                 saveStatus === 'saved' ? 'Saved!' : 'Save failed'}
              </div>
            )}
            <button
              onClick={saveSettings}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </button>
          </div>
        </div>
      </div>

      {/* Settings Tabs */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'general' && renderGeneralSettings()}
          {activeTab === 'users' && renderUsersAndRoles()}
          {activeTab === 'security' && renderSecuritySettings()}
          {activeTab === 'api' && renderApiAndKeys()}
          {activeTab === 'notifications' && renderNotifications()}
          {activeTab === 'integrations' && renderIntegrations()}
          {activeTab === 'data' && renderDataAndBackup()}
          {activeTab === 'performance' && renderPerformance()}
          {activeTab === 'compliance' && renderCompliance()}
          {activeTab === 'appearance' && renderAppearance()}
        </div>
      </div>
    </div>
  );
};

export default SystemSettingsView;