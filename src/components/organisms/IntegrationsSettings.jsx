import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Link, Database, Ticket, UserCheck, BarChart2, CheckCircle, XCircle, Loader2, Power } from 'lucide-react';
import Button from '../atoms/Button';
import Input from '../atoms/Input';
import Badge from '../atoms/Badge';

// --- Reusable Molecule for a single Integration Card ---

const IntegrationCard = ({
  icon: Icon,
  title,
  description,
  status,
  enabled,
  onToggle,
  onTest,
  testingStatus,
  children,
}) => {
  const isConnected = status === 'connected';

  const getStatusBadge = () => {
    switch (status) {
      case 'connected':
        return <Badge variant="success" icon={CheckCircle}>Connected</Badge>;
      case 'disconnected':
        return <Badge variant="default" icon={XCircle}>Disconnected</Badge>;
      case 'error':
        return <Badge variant="error" icon={XCircle}>Error</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  return (
    <div className={`dashboard-card p-6 transition-all duration-300 ${!enabled ? 'opacity-60 bg-secondary-50 dark:bg-secondary-800/50' : ''}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${isConnected ? 'bg-primary-100 dark:bg-primary-500/20' : 'bg-secondary-100 dark:bg-secondary-700'}`}>
            <Icon className={`w-6 h-6 ${isConnected ? 'text-primary-600 dark:text-primary-300' : 'text-secondary-500'}`} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-white">{title}</h3>
            <p className="text-sm text-secondary-500 dark:text-secondary-400">{description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge()}
          <button
            onClick={onToggle}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
              ${enabled ? 'bg-primary-600' : 'bg-secondary-200 dark:bg-secondary-600'}`}
            role="switch"
            aria-checked={enabled}
          >
            <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${enabled ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
        </div>
      </div>
      
      {enabled && (
        <div className="mt-4 pt-4 border-t border-secondary-200 dark:border-secondary-700 space-y-4">
          {children}
          <div className="flex justify-end">
            <Button
              onClick={onTest}
              loading={testingStatus === 'testing'}
              disabled={testingStatus === 'testing'}
              variant={testingStatus === 'success' ? 'success' : 'secondary'}
              leadingIcon={testingStatus === 'success' ? CheckCircle : testingStatus === 'error' ? XCircle : null}
            >
              {testingStatus === 'testing' ? 'Testing...' : testingStatus === 'success' ? 'Success!' : testingStatus === 'error' ? 'Failed' : 'Test Connection'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

IntegrationCard.propTypes = {
  icon: PropTypes.elementType.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  status: PropTypes.string.isRequired,
  enabled: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
  onTest: PropTypes.func.isRequired,
  testingStatus: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

// --- Main Organism Component ---

/**
 * IntegrationsSettings Organism Component
 * 
 * Manages configuration for external integrations like SIEM, ticketing,
 * identity providers, and monitoring tools.
 */
const IntegrationsSettings = ({ settings, updateSetting }) => {
  const [testingStatus, setTestingStatus] = useState({
    siem: 'idle',
    ticketing: 'idle',
    identity: 'idle',
    monitoring: 'idle',
  });

  const handleUpdate = useCallback((integration, field, value) => {
    updateSetting(integration, { ...settings[integration], [field]: value });
  }, [settings, updateSetting]);

  const handleToggle = useCallback((integration) => {
    handleUpdate(integration, 'enabled', !settings[integration]?.enabled);
  }, [settings, handleUpdate]);

  const handleTestConnection = useCallback(async (integration) => {
    setTestingStatus(prev => ({ ...prev, [integration]: 'testing' }));
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      // Randomly succeed or fail for demonstration
      const isSuccess = Math.random() > 0.3; 
      if (isSuccess) {
        setTestingStatus(prev => ({ ...prev, [integration]: 'success' }));
        handleUpdate(integration, 'status', 'connected');
      } else {
        throw new Error("Connection failed");
      }
    } catch (error) {
      setTestingStatus(prev => ({ ...prev, [integration]: 'error' }));
      handleUpdate(integration, 'status', 'error');
    } finally {
      setTimeout(() => setTestingStatus(prev => ({ ...prev, [integration]: 'idle' })), 3000);
    }
  }, [handleUpdate]);

  const siem = settings.siem || {};
  const ticketing = settings.ticketing || {};
  const identity = settings.identity || {};
  const monitoring = settings.monitoring || {};

  return (
    <div className="space-y-6">
      <div className="dashboard-card p-4 bg-primary-50 dark:bg-primary-500/10 border-l-4 border-primary-500">
        <div className="flex items-start gap-3">
          <Link className="w-5 h-5 text-primary-600 dark:text-primary-300 mt-0.5" />
          <div>
            <h3 className="font-medium text-primary-900 dark:text-primary-200">Connect Your Tools</h3>
            <p className="text-sm text-primary-700 dark:text-primary-300 mt-1">
              Integrate with your existing enterprise systems to automate data collection, streamline workflows, and enrich your GRC insights.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <IntegrationCard
          icon={Database}
          title="SIEM Integration (Splunk)"
          description="Feed security events and logs directly into the platform."
          status={siem.status || 'disconnected'}
          enabled={!!siem.enabled}
          onToggle={() => handleToggle('siem')}
          onTest={() => handleTestConnection('siem')}
          testingStatus={testingStatus.siem}
        >
          <Input
            label="Splunk API Endpoint"
            value={siem.endpoint || ''}
            onChange={e => handleUpdate('siem', 'endpoint', e.target.value)}
            placeholder="https://your-splunk-instance:8089"
          />
          <Input
            label="API Key"
            type="password"
            value={siem.apiKey || ''}
            onChange={e => handleUpdate('siem', 'apiKey', e.target.value)}
            placeholder="Enter your Splunk API key"
          />
        </IntegrationCard>

        <IntegrationCard
          icon={Ticket}
          title="Ticketing System (Jira)"
          description="Create and track GRC-related tasks in Jira."
          status={ticketing.status || 'disconnected'}
          enabled={!!ticketing.enabled}
          onToggle={() => handleToggle('ticketing')}
          onTest={() => handleTestConnection('ticketing')}
          testingStatus={testingStatus.ticketing}
        >
          <Input
            label="Jira Instance URL"
            value={ticketing.endpoint || ''}
            onChange={e => handleUpdate('ticketing', 'endpoint', e.target.value)}
            placeholder="https://your-company.atlassian.net"
          />
          <Input
            label="API Token"
            type="password"
            value={ticketing.credentials || ''}
            onChange={e => handleUpdate('ticketing', 'credentials', e.target.value)}
            placeholder="Enter your Jira API token"
          />
        </IntegrationCard>

        <IntegrationCard
          icon={UserCheck}
          title="Identity Provider (Azure AD)"
          description="Sync user identities and enable Single Sign-On (SSO)."
          status={identity.status || 'disconnected'}
          enabled={!!identity.enabled}
          onToggle={() => handleToggle('identity')}
          onTest={() => handleTestConnection('identity')}
          testingStatus={testingStatus.identity}
        >
          <Input
            label="Azure AD Tenant ID"
            value={identity.tenant || ''}
            onChange={e => handleUpdate('identity', 'tenant', e.target.value)}
            placeholder="Enter your Azure AD Tenant ID"
          />
        </IntegrationCard>

        <IntegrationCard
          icon={BarChart2}
          title="Monitoring (DataDog)"
          description="Pull in performance and security metrics."
          status={monitoring.status || 'disconnected'}
          enabled={!!monitoring.enabled}
          onToggle={() => handleToggle('monitoring')}
          onTest={() => handleTestConnection('monitoring')}
          testingStatus={testingStatus.monitoring}
        >
          <Input
            label="DataDog API Key"
            type="password"
            value={monitoring.apiKey || ''}
            onChange={e => handleUpdate('monitoring', 'apiKey', e.target.value)}
            placeholder="Enter your DataDog API key"
          />
        </IntegrationCard>
      </div>
    </div>
  );
};

IntegrationsSettings.propTypes = {
  settings: PropTypes.object.isRequired,
  updateSetting: PropTypes.func.isRequired,
};

IntegrationsSettings.defaultProps = {
  settings: {
    siem: {},
    ticketing: {},
    identity: {},
    monitoring: {},
  },
};

export default IntegrationsSettings;
