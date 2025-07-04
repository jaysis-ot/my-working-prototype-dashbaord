import React, { useState } from 'react';
import { Link, Shield, Settings, Lock, Activity, CheckCircle, AlertCircle, Plus, RefreshCw } from 'lucide-react';

const IntegrationsTab = ({ settings, updateSetting }) => {
  const [testingConnection, setTestingConnection] = useState(null);

  const testConnection = async (integrationKey) => {
    setTestingConnection(integrationKey);
    
    // Simulate API test - replace with actual endpoint testing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Update connection status based on test result
    const isSuccessful = Math.random() > 0.3; // 70% success rate for demo
    const newStatus = isSuccessful ? 'connected' : 'error';
    updateSetting('integrations', `${integrationKey}.status`, newStatus);
    
    setTestingConnection(null);
  };

  const getIntegrationIcon = (key) => {
    switch(key) {
      case 'siem': return Shield;
      case 'ticketing': return Settings;
      case 'identity': return Lock;
      case 'monitoring': return Activity;
      default: return Link;
    }
  };

  const getIntegrationDescription = (key) => {
    switch(key) {
      case 'siem': return 'Security events feed into risk scoring algorithms, providing real-time threat intelligence';
      case 'ticketing': return 'Incident tracking creates evidence trails for risk response and control effectiveness';
      case 'identity': return 'Access patterns and authentication events inform trust calculations and compliance status';
      case 'monitoring': return 'System health metrics contribute to operational risk assessments and availability scoring';
      default: return 'External system integration for evidence collection';
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'connected': return 'bg-green-100 text-green-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'disconnected': return 'bg-gray-100 text-gray-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'connected': return CheckCircle;
      case 'error': return AlertCircle;
      default: return AlertCircle;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Link className="w-5 h-5 text-green-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-green-900">Evidence Pipeline Integrations</h3>
            <p className="text-sm text-green-700 mt-1">Connect your existing tools to create a living evidence stream that feeds real-time trust scores and risk intelligence.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {Object.entries(settings.integrations).map(([key, integration]) => {
          const Icon = getIntegrationIcon(key);
          const StatusIcon = getStatusIcon(integration.status);
          const isTestingThis = testingConnection === key;
          
          return (
            <div key={key} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium capitalize flex items-center gap-2">
                  <Icon className="w-5 h-5" />
                  {key.replace(/([A-Z])/g, ' $1')} Integration
                </h3>
                <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(integration.status)}`}>
                  <StatusIcon className="w-3 h-3" />
                  {integration.status}
                </div>
              </div>
              
              <div className="text-sm text-gray-600 mb-4">
                {getIntegrationDescription(key)}
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Platform Type</label>
                  <select 
                    value={integration.type}
                    onChange={(e) => updateSetting('integrations', `${key}.type`, e.target.value)}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  >
                    {key === 'siem' && (
                      <>
                        <option value="splunk">Splunk Enterprise</option>
                        <option value="qradar">IBM QRadar</option>
                        <option value="sentinel">Microsoft Sentinel</option>
                        <option value="chronicle">Google Chronicle</option>
                      </>
                    )}
                    {key === 'ticketing' && (
                      <>
                        <option value="jira">Atlassian Jira</option>
                        <option value="servicenow">ServiceNow</option>
                        <option value="azure-devops">Azure DevOps</option>
                        <option value="freshdesk">Freshdesk</option>
                      </>
                    )}
                    {key === 'identity' && (
                      <>
                        <option value="azure-ad">Azure Active Directory</option>
                        <option value="okta">Okta</option>
                        <option value="ping">PingIdentity</option>
                        <option value="auth0">Auth0</option>
                      </>
                    )}
                    {key === 'monitoring' && (
                      <>
                        <option value="datadog">Datadog</option>
                        <option value="newrelic">New Relic</option>
                        <option value="grafana">Grafana</option>
                        <option value="prometheus">Prometheus</option>
                      </>
                    )}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">API Endpoint</label>
                  <input 
                    type="url"
                    value={integration.endpoint || ''}
                    onChange={(e) => updateSetting('integrations', `${key}.endpoint`, e.target.value)}
                    placeholder={`https://${integration.type}.example.com/api`}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Authentication</label>
                <div className="grid grid-cols-2 gap-4">
                  <input 
                    type="password"
                    value={integration.apiKey || integration.credentials || ''}
                    onChange={(e) => updateSetting('integrations', `${key}.${integration.apiKey ? 'apiKey' : 'credentials'}`, e.target.value)}
                    placeholder={key === 'identity' ? 'Client Secret' : 'API Key'}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  />
                  {key === 'identity' && (
                    <input 
                      type="text"
                      value={integration.tenant || ''}
                      onChange={(e) => updateSetting('integrations', `${key}.tenant`, e.target.value)}
                      placeholder="Tenant ID"
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                    />
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <button 
                  onClick={() => testConnection(key)}
                  disabled={isTestingThis}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {isTestingThis ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      Test Connection
                    </>
                  )}
                </button>
                
                {integration.status === 'connected' && (
                  <div className="text-sm text-green-600">
                    Last sync: {Math.floor(Math.random() * 10) + 1} minutes ago
                  </div>
                )}
              </div>
              
              {integration.status === 'error' && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                  <strong>Connection Error:</strong> Unable to authenticate with {integration.type}. Please verify your credentials and endpoint configuration.
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="border rounded-lg p-4">
        <h3 className="font-medium mb-4 flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add New Integration
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
            <div className="text-center">
              <Shield className="w-6 h-6 mx-auto mb-2 text-gray-400" />
              <div className="text-sm font-medium">Vulnerability Scanner</div>
              <div className="text-xs text-gray-500">Nessus, Qualys, Rapid7</div>
            </div>
          </button>
          
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
            <div className="text-center">
              <Settings className="w-6 h-6 mx-auto mb-2 text-gray-400" />
              <div className="text-sm font-medium">Configuration Management</div>
              <div className="text-xs text-gray-500">Ansible, Puppet, Chef</div>
            </div>
          </button>
        </div>
        
        <div className="mt-4 text-xs text-gray-500">
          <strong>Integration Impact:</strong> Each connected system contributes evidence to your trust scores. SIEM events affect security posture, monitoring data influences availability scores, and identity logs inform access risk calculations.
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Evidence Quality Score</h4>
        <div className="text-sm text-blue-700">
          Your current integrations provide <strong>78% evidence coverage</strong> across risk domains. 
          Connected systems are actively feeding {Object.values(settings.integrations).filter(i => i.status === 'connected').length * 247} data points per hour into your trust calculation engine.
        </div>
        
        <div className="mt-3 grid grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-blue-700">94%</div>
            <div className="text-xs">Security Events</div>
          </div>
          <div>
            <div className="text-lg font-bold text-blue-700">87%</div>
            <div className="text-xs">System Health</div>
          </div>
          <div>
            <div className="text-lg font-bold text-blue-700">92%</div>
            <div className="text-xs">Access Control</div>
          </div>
          <div>
            <div className="text-lg font-bold text-blue-700">71%</div>
            <div className="text-xs">Compliance</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntegrationsTab;