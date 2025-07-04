import React, { useState, useEffect } from 'react';
import { Save, AlertTriangle, CheckCircle, Clock, Database, Zap, Shield, Palette, Bell, Link, Download, Activity, Eye, RotateCcw, Mail, Slack, Globe, Settings, Lock, Archive, Cpu, BarChart3, Paintbrush } from 'lucide-react';

const SystemsSettings = () => {
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
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLastSaved(new Date());
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2000);
  };

  const NotificationsTab = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Bell className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900">Risk Event Notifications</h3>
            <p className="text-sm text-blue-700 mt-1">Configure how your team receives alerts about risk changes, threshold breaches, and evidence updates.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-4 flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Email Notifications
          </h3>
          <div className="space-y-4">
            <label className="flex items-center gap-2">
              <input 
                type="checkbox" 
                checked={settings.notifications.email.enabled}
                onChange={(e) => updateSetting('notifications', 'email.enabled', e.target.checked)}
                className="rounded"
              />
              <span>Enable email notifications</span>
            </label>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Alert Threshold</label>
                <select 
                  value={settings.notifications.email.threshold}
                  onChange={(e) => updateSetting('notifications', 'email.threshold', e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="low">Low (All changes)</option>
                  <option value="medium">Medium (Significant changes)</option>
                  <option value="high">High (Critical only)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Frequency</label>
                <select 
                  value={settings.notifications.email.frequency}
                  onChange={(e) => updateSetting('notifications', 'email.frequency', e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="immediate">Immediate</option>
                  <option value="hourly">Hourly digest</option>
                  <option value="daily">Daily summary</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-4 flex items-center gap-2">
            <Slack className="w-4 h-4" />
            Slack Integration
          </h3>
          <div className="space-y-4">
            <label className="flex items-center gap-2">
              <input 
                type="checkbox" 
                checked={settings.notifications.slack.enabled}
                onChange={(e) => updateSetting('notifications', 'slack.enabled', e.target.checked)}
                className="rounded"
              />
              <span>Send notifications to Slack</span>
            </label>
            
            {settings.notifications.slack.enabled && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Webhook URL</label>
                  <input 
                    type="url"
                    value={settings.notifications.slack.webhook}
                    onChange={(e) => updateSetting('notifications', 'slack.webhook', e.target.value)}
                    placeholder="https://hooks.slack.com/services/..."
                    className="w-full p-2 border rounded"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Channel</label>
                  <input 
                    type="text"
                    value={settings.notifications.slack.channel}
                    onChange={(e) => updateSetting('notifications', 'slack.channel', e.target.value)}
                    placeholder="#risk-alerts"
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Escalation Rules
          </h3>
          <div className="space-y-4">
            <label className="flex items-center gap-2">
              <input 
                type="checkbox" 
                checked={settings.notifications.escalation.enabled}
                onChange={(e) => updateSetting('notifications', 'escalation.enabled', e.target.checked)}
                className="rounded"
              />
              <span>Enable automatic escalation for unacknowledged critical alerts</span>
            </label>
            
            <div className="text-sm text-gray-600">
              Critical risk changes escalate: Team Lead (15 min) → Manager (30 min) → Executive (60 min)
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const IntegrationsTab = () => (
    <div className="space-y-6">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Link className="w-5 h-5 text-green-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-green-900">Evidence Pipeline Integrations</h3>
            <p className="text-sm text-green-700 mt-1">Connect your existing tools to create a living evidence stream that feeds real-time trust scores.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {Object.entries(settings.integrations).map(([key, integration]) => (
          <div key={key} className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium capitalize flex items-center gap-2">
                {key === 'siem' && <Shield className="w-4 h-4" />}
                {key === 'ticketing' && <Settings className="w-4 h-4" />}
                {key === 'identity' && <Lock className="w-4 h-4" />}
                {key === 'monitoring' && <Activity className="w-4 h-4" />}
                {key.replace(/([A-Z])/g, ' $1')}
              </h3>
              <div className={`px-2 py-1 rounded text-xs font-medium ${
                integration.status === 'connected' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {integration.status}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select 
                  value={integration.type}
                  onChange={(e) => updateSetting('integrations', `${key}.type`, e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  {key === 'siem' && (
                    <>
                      <option value="splunk">Splunk</option>
                      <option value="qradar">QRadar</option>
                      <option value="sentinel">Azure Sentinel</option>
                    </>
                  )}
                  {key === 'ticketing' && (
                    <>
                      <option value="jira">Jira</option>
                      <option value="servicenow">ServiceNow</option>
                      <option value="azure-devops">Azure DevOps</option>
                    </>
                  )}
                  {key === 'identity' && (
                    <>
                      <option value="azure-ad">Azure AD</option>
                      <option value="okta">Okta</option>
                      <option value="ping">PingID</option>
                    </>
                  )}
                  {key === 'monitoring' && (
                    <>
                      <option value="datadog">Datadog</option>
                      <option value="newrelic">New Relic</option>
                      <option value="grafana">Grafana</option>
                    </>
                  )}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Endpoint</label>
                <input 
                  type="url"
                  value={integration.endpoint || ''}
                  onChange={(e) => updateSetting('integrations', `${key}.endpoint`, e.target.value)}
                  placeholder="https://api.example.com"
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium mb-1">API Key / Credentials</label>
              <input 
                type="password"
                value={integration.apiKey || integration.credentials || ''}
                onChange={(e) => updateSetting('integrations', `${key}.${integration.apiKey ? 'apiKey' : 'credentials'}`, e.target.value)}
                placeholder="••••••••••••••••"
                className="w-full p-2 border rounded"
              />
            </div>
            
            <button className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">
              Test Connection
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const DataBackupTab = () => (
    <div className="space-y-6">
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Archive className="w-5 h-5 text-amber-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-amber-900">Evidence Preservation & Recovery</h3>
            <p className="text-sm text-amber-700 mt-1">Ensure your risk evidence and trust artifacts are preserved with audit-grade integrity and rapid recovery capabilities.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Backup Schedule
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Frequency</label>
              <select 
                value={settings.dataBackup.schedule}
                onChange={(e) => updateSetting('dataBackup', 'schedule', e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="hourly">Hourly (Critical systems)</option>
                <option value="daily">Daily (Recommended)</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Retention Period</label>
              <select 
                value={settings.dataBackup.retention}
                onChange={(e) => updateSetting('dataBackup', 'retention', e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="1-year">1 Year</option>
                <option value="3-years">3 Years</option>
                <option value="7-years">7 Years (SOX Compliant)</option>
                <option value="indefinite">Indefinite</option>
              </select>
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Security & Integrity
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Encryption Standard</label>
                <select 
                  value={settings.dataBackup.encryption}
                  onChange={(e) => updateSetting('dataBackup', 'encryption', e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="aes-256">AES-256 (Recommended)</option>
                  <option value="aes-128">AES-128</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Verification Frequency</label>
                <select 
                  value={settings.dataBackup.verification}
                  onChange={(e) => updateSetting('dataBackup', 'verification', e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly (Recommended)</option>
                  <option value="quarterly">Quarterly</option>
                </select>
              </div>
            </div>
            
            <div className="bg-gray-50 p-3 rounded text-sm">
              <strong>Integrity Promise:</strong> All backup files include cryptographic hashes and chain-of-custody metadata to ensure admissible evidence standards.
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-4 flex items-center gap-2">
            <Database className="w-4 h-4" />
            Storage & Recovery
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Primary Storage</label>
              <select 
                value={settings.dataBackup.storage}
                onChange={(e) => updateSetting('dataBackup', 'storage', e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="aws-s3">AWS S3 (Multi-region)</option>
                <option value="azure-blob">Azure Blob Storage</option>
                <option value="gcp-storage">Google Cloud Storage</option>
              </select>
            </div>
            
            <div className="flex items-center gap-4">
              <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                <Download className="w-4 h-4 inline mr-2" />
                Test Recovery
              </button>
              <button className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50">
                <Eye className="w-4 h-4 inline mr-2" />
                View Backup Log
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const PerformanceTab = () => (
    <div className="space-y-6">
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Zap className="w-5 h-5 text-purple-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-purple-900">Real-Time Performance Optimization</h3>
            <p className="text-sm text-purple-700 mt-1">Tune your platform for rapid risk analysis and trust score updates while maintaining evidence integrity.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-4 flex items-center gap-2">
            <Cpu className="w-4 h-4" />
            Query Performance
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Query Timeout (seconds)</label>
              <input 
                type="number"
                value={settings.performance.queries.timeout}
                onChange={(e) => updateSetting('performance', 'queries.timeout', parseInt(e.target.value))}
                className="w-full p-2 border rounded"
                min="10"
                max="300"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Max Concurrent Queries</label>
              <input 
                type="number"
                value={settings.performance.queries.maxConcurrent}
                onChange={(e) => updateSetting('performance', 'queries.maxConcurrent', parseInt(e.target.value))}
                className="w-full p-2 border rounded"
                min="10"
                max="200"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Cache TTL (seconds)</label>
              <input 
                type="number"
                value={settings.performance.caching.ttl}
                onChange={(e) => updateSetting('performance', 'caching.ttl', parseInt(e.target.value))}
                className="w-full p-2 border rounded"
                min="60"
                max="3600"
              />
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Indexing & Search
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Rebuild Schedule</label>
                <select 
                  value={settings.performance.indexing.rebuild}
                  onChange={(e) => updateSetting('performance', 'indexing.rebuild', e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="daily">Daily (High-change environments)</option>
                  <option value="weekly">Weekly (Recommended)</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              
              <div>
                <label className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    checked={settings.performance.indexing.optimize}
                    onChange={(e) => updateSetting('performance', 'indexing.optimize', e.target.checked)}
                    className="rounded"
                  />
                  <span>Auto-optimize during rebuild</span>
                </label>
              </div>
            </div>
            
            <button className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50">
              <RotateCcw className="w-4 h-4 inline mr-2" />
              Rebuild Index Now
            </button>
          </div>
        </div>

        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Performance Monitoring
          </h3>
          <div className="space-y-4">
            <label className="flex items-center gap-2">
              <input 
                type="checkbox" 
                checked={settings.performance.monitoring.alerts}
                onChange={(e) => updateSetting('performance', 'monitoring.alerts', e.target.checked)}
                className="rounded"
              />
              <span>Enable performance alerts</span>
            </label>
            
            <div>
              <label className="block text-sm font-medium mb-1">CPU Threshold (%)</label>
              <input 
                type="range"
                min="50"
                max="95"
                value={settings.performance.monitoring.threshold}
                onChange={(e) => updateSetting('performance', 'monitoring.threshold', parseInt(e.target.value))}
                className="w-full"
              />
              <div className="text-sm text-gray-600 mt-1">
                Alert when CPU usage exceeds {settings.performance.monitoring.threshold}%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const ComplianceTab = () => (
    <div className="space-y-6">
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-red-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-red-900">Regulatory & Audit Readiness</h3>
            <p className="text-sm text-red-700 mt-1">Configure your platform to meet regulatory requirements and maintain audit trails with immutable evidence chains.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-4">Active Compliance Frameworks</h3>
          <div className="space-y-3">
            {['iso27001', 'sox', 'nist', 'gdpr', 'hipaa', 'pci-dss'].map(framework => (
              <label key={framework} className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  checked={settings.compliance.frameworks.includes(framework)}
                  onChange={(e) => {
                    const frameworks = settings.compliance.frameworks;
                    if (e.target.checked) {
                      updateSetting('compliance', 'frameworks', [...frameworks, framework]);
                    } else {
                      updateSetting('compliance', 'frameworks', frameworks.filter(f => f !== framework));
                    }
                  }}
                  className="rounded"
                />
                <span className="uppercase font-mono text-sm">{framework.replace('-', ' ')}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-4 flex items-center gap-2">
            <Lock className="w-4 h-4" />
            Access Controls
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  checked={settings.compliance.access.mfa}
                  onChange={(e) => updateSetting('compliance', 'access.mfa', e.target.checked)}
                  className="rounded"
                />
                <span>Require Multi-Factor Authentication</span>
              </label>
              
              <label className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  checked={settings.compliance.access.rbac}
                  onChange={(e) => updateSetting('compliance', 'access.rbac', e.target.checked)}
                  className="rounded"
                />
                <span>Role-Based Access Control</span>
              </label>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Session Timeout (minutes)</label>
              <select 
                value={settings.compliance.access.sessionTimeout}
                onChange={(e) => updateSetting('compliance', 'access.sessionTimeout', parseInt(e.target.value))}
                className="w-full p-2 border rounded"
              >
                <option value="30">30 minutes (High security)</option>
                <option value="120">2 hours</option>
                <option value="480">8 hours (Standard)</option>
                <option value="1440">24 hours</option>
              </select>
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-4 flex items-center gap-2">
            <Archive className="w-4 h-4" />
            Audit & Data Management
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Audit Log Retention</label>
                <select 
                  value={settings.compliance.auditLog.retention}
                  onChange={(e) => updateSetting('compliance', 'auditLog.retention', e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="3-years">3 Years</option>
                  <option value="7-years">7 Years (SOX)</option>
                  <option value="indefinite">Indefinite</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Data Residency</label>
                <select 
                  value={settings.compliance.dataResidency}
                  onChange={(e) => updateSetting('compliance', 'dataResidency', e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="us-east">US East</option>
                  <option value="us-west">US West</option>
                  <option value="eu-west">EU West</option>
                  <option value="apac">Asia Pacific</option>
                </select>
              </div>
            </div>
            
            <label className="flex items-center gap-2">
              <input 
                type="checkbox" 
                checked={settings.compliance.auditLog.immutable}
                onChange={(e) => updateSetting('compliance', 'auditLog.immutable', e.target.checked)}
                className="rounded"
              />
              <span>Immutable audit logs (tamper-proof)</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const AppearanceTab = () => (
    <div className="space-y-6">
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Palette className="w-5 h-5 text-indigo-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-indigo-900">Interface & Branding</h3>
            <p className="text-sm text-indigo-700 mt-1">Customize your platform's appearance to match your organization's identity and user preferences.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-4 flex items-center gap-2">
            <Paintbrush className="w-4 h-4" />
            Theme & Colors
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Theme</label>
              <select 
                value={settings.appearance.theme}
                onChange={(e) => updateSetting('appearance', 'theme', e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">Follow System</option>
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Primary Color</label>
                <div className="flex gap-2">
                  <input 
                    type="color"
                    value={settings.appearance.brandColors.primary}
                    onChange={(e) => updateSetting('appearance', 'brandColors.primary', e.target.value)}
                    className="w-12 h-10 border rounded"
                  />
                  <input 
                    type="text"
                    value={settings.appearance.brandColors.primary}
                    onChange={(e) => updateSetting('appearance', 'brandColors.primary', e.target.value)}
                    className="flex-1 p-2 border rounded font-mono text-sm"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Secondary Color</label>
                <div className="flex gap-2">
                  <input 
                    type="color"
                    value={settings.appearance.brandColors.secondary}
                    onChange={(e) => updateSetting('appearance', 'brandColors.secondary', e.target.value)}
                    className="w-12 h-10 border rounded"
                  />
                  <input 
                    type="text"
                    value={settings.appearance.brandColors.secondary}
                    onChange={(e) => updateSetting('appearance', 'brandColors.secondary', e.target.value)}
                    className="flex-1 p-2 border rounded font-mono text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Dashboard Preferences
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Information Density</label>
              <select 
                value={settings.appearance.dashboard.density}
                onChange={(e) => updateSetting('appearance', 'dashboard.density', e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="compact">Compact (More data)</option>
                <option value="comfortable">Comfortable (Balanced)</option>
                <option value="spacious">Spacious (Easier reading)</option>
              </select>
            </div>
            
            <label className="flex items-center gap-2">
              <input 
                type="checkbox" 
                checked={settings.appearance.dashboard.animations}
                onChange={(e) => updateSetting('appearance', 'dashboard.animations', e.target.checked)}
                className="rounded"
              />
              <span>Enable smooth animations</span>
            </label>
          </div>
        </div>

        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-4 flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Reports & Export
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Report Template</label>
              <select 
                value={settings.appearance.reports.template}
                onChange={(e) => updateSetting('appearance', 'reports.template', e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="minimal">Minimal</option>
                <option value="professional">Professional (Recommended)</option>
                <option value="detailed">Detailed</option>
                <option value="executive">Executive Summary</option>
              </select>
            </div>
            
            <label className="flex items-center gap-2">
              <input 
                type="checkbox" 
                checked={settings.appearance.reports.watermark}
                onChange={(e) => updateSetting('appearance', 'reports.watermark', e.target.checked)}
                className="rounded"
              />
              <span>Include organizational watermark</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'integrations', label: 'Integrations', icon: Link },
    { id: 'backup', label: 'Data & Backup', icon: Database },
    { id: 'performance', label: 'Performance', icon: Zap },
    { id: 'compliance', label: 'Compliance', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette }
  ];

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
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
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

        <div className="flex-1">
          {activeTab === 'notifications' && <NotificationsTab />}
          {activeTab === 'integrations' && <IntegrationsTab />}
          {activeTab === 'backup' && <DataBackupTab />}
          {activeTab === 'performance' && <PerformanceTab />}
          {activeTab === 'compliance' && <ComplianceTab />}
          {activeTab === 'appearance' && <AppearanceTab />}
        </div>
      </div>
    </div>
  );
};

export default SystemsSettings;