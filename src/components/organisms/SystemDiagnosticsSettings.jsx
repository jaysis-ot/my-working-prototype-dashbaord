import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  Activity, Download, RefreshCw, Monitor, Cpu, HardDrive, Wifi,
  Globe, Settings, Package, Code, Database, Clock, Smartphone,
  AlertTriangle, CheckCircle, Info, Copy, ChevronDown
} from 'lucide-react';
import Button from '../atoms/Button';

// --- Reusable Molecules (Internal to this Organism) ---

const SettingsSection = ({ title, description, icon: Icon, children, isOpen, onToggle }) => (
  <div className="dashboard-card overflow-hidden">
    <button
      className="w-full px-6 py-4 border-b border-secondary-200 dark:border-secondary-700 flex items-center justify-between text-left hover:bg-secondary-50 dark:hover:bg-secondary-700/50 transition-colors"
      onClick={onToggle}
      aria-expanded={isOpen}
    >
      <div className="flex items-center">
        {Icon && <Icon className="w-6 h-6 text-primary-500 mr-4 flex-shrink-0" />}
        <div>
          <h3 className="text-lg font-semibold text-secondary-900 dark:text-white">{title}</h3>
          {description && <p className="text-sm text-secondary-500 dark:text-secondary-400 mt-1">{description}</p>}
        </div>
      </div>
      <ChevronDown className={`w-5 h-5 text-secondary-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
    </button>
    {isOpen && (
      <div className="px-6 py-4 bg-white dark:bg-secondary-800">
        <div className="space-y-3">
          {children}
        </div>
      </div>
    )}
  </div>
);

SettingsSection.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  children: PropTypes.node.isRequired,
  icon: PropTypes.elementType,
  isOpen: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
};

const DiagnosticItem = ({ label, value, isObject = false }) => (
  <div className="grid grid-cols-3 gap-4 text-sm">
    <dt className="font-medium text-secondary-500 dark:text-secondary-400">{label}</dt>
    <dd className="col-span-2 text-secondary-900 dark:text-white">
      {isObject ? (
        <pre className="text-xs bg-secondary-100 dark:bg-secondary-700 p-2 rounded-md overflow-x-auto">
          <code>{JSON.stringify(value, null, 2)}</code>
        </pre>
      ) : (
        String(value)
      )}
    </dd>
  </div>
);

DiagnosticItem.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.any,
  isObject: PropTypes.bool,
};

// --- Main Organism Component ---

const SystemDiagnosticsSettings = () => {
  const [diagnosticData, setDiagnosticData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState({
    browser: true, system: true, application: true, performance: false, storage: false, network: false, dependencies: false
  });
  const [copyStatus, setCopyStatus] = useState('idle');

  const collectDiagnostics = useCallback(async () => {
    setLoading(true);
    // Simulate a short delay to show loading state
    await new Promise(res => setTimeout(res, 500));

    try {
      const data = {
        timestamp: new Date().toISOString(),
        browser: {
          userAgent: navigator.userAgent,
          vendor: navigator.vendor,
          language: navigator.language,
          platform: navigator.platform,
          cookieEnabled: navigator.cookieEnabled,
          onLine: navigator.onLine,
        },
        system: {
          screenResolution: `${window.screen.width}x${window.screen.height}`,
          viewport: `${window.innerWidth}x${window.innerHeight}`,
          colorDepth: window.screen.colorDepth,
          devicePixelRatio: window.devicePixelRatio,
        },
        performance: {
          pageLoadTime: performance.timing.loadEventEnd - performance.timing.navigationStart,
          memory: performance.memory ? `${(performance.memory.usedJSHeapSize / 1048576).toFixed(2)} MB` : 'N/A',
        },
        storage: {
          localStorageItems: localStorage.length,
          sessionStorageItems: sessionStorage.length,
        },
        network: {
          connectionType: navigator.connection?.effectiveType || 'unknown',
          downlink: navigator.connection?.downlink ? `${navigator.connection.downlink} Mbps` : 'unknown',
        },
        application: {
          // These would be sourced from a context or props in a real app
          reactVersion: React.version,
          appVersion: process.env.REACT_APP_VERSION || '1.0.0',
          environment: process.env.NODE_ENV,
        },
        dependencies: {
          'lucide-react': 'imported',
          'react-router-dom': 'imported',
          'prop-types': 'imported',
        }
      };
      setDiagnosticData(data);
    } catch (e) {
      console.error("Error collecting diagnostics:", e);
      setDiagnosticData({ error: "Failed to collect all diagnostic data." });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    collectDiagnostics();
  }, [collectDiagnostics]);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const copyToClipboard = useCallback(() => {
    if (!diagnosticData) return;
    navigator.clipboard.writeText(JSON.stringify(diagnosticData, null, 2))
      .then(() => {
        setCopyStatus('copied');
        setTimeout(() => setCopyStatus('idle'), 2000);
      })
      .catch(err => {
        console.error('Failed to copy diagnostics:', err);
        setCopyStatus('error');
        setTimeout(() => setCopyStatus('idle'), 2000);
      });
  }, [diagnosticData]);

  const exportDiagnostics = useCallback(() => {
    if (!diagnosticData) return;
    const blob = new Blob([JSON.stringify(diagnosticData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cyber-trust-diagnostics-${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [diagnosticData]);

  return (
    <div className="space-y-6">
      <div className="dashboard-card p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-secondary-900 dark:text-white">System Diagnostics</h2>
            <p className="text-sm text-secondary-500 dark:text-secondary-400 mt-1">
              Review technical details about your session for troubleshooting and support.
            </p>
          </div>
          <div className="flex items-center gap-2 mt-4 md:mt-0">
            <Button variant="secondary" onClick={collectDiagnostics} leadingIcon={RefreshCw} loading={loading}>
              {loading ? 'Refreshing...' : 'Refresh'}
            </Button>
            <Button variant="secondary" onClick={copyToClipboard} leadingIcon={Copy}>
              {copyStatus === 'copied' ? 'Copied!' : 'Copy'}
            </Button>
            <Button onClick={exportDiagnostics} leadingIcon={Download}>
              Export JSON
            </Button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16"><Activity className="animate-spin h-8 w-8 mx-auto text-primary-500" /></div>
      ) : diagnosticData ? (
        <>
          <SettingsSection title="Browser Information" icon={Globe} isOpen={expandedSections.browser} onToggle={() => toggleSection('browser')}>
            {Object.entries(diagnosticData.browser).map(([key, value]) => <DiagnosticItem key={key} label={key} value={value} />)}
          </SettingsSection>
          <SettingsSection title="System & Display" icon={Monitor} isOpen={expandedSections.system} onToggle={() => toggleSection('system')}>
            {Object.entries(diagnosticData.system).map(([key, value]) => <DiagnosticItem key={key} label={key} value={value} isObject={typeof value === 'object'} />)}
          </SettingsSection>
          <SettingsSection title="Application State" icon={Package} isOpen={expandedSections.application} onToggle={() => toggleSection('application')}>
            {Object.entries(diagnosticData.application).map(([key, value]) => <DiagnosticItem key={key} label={key} value={value} />)}
          </SettingsSection>
          <SettingsSection title="Performance Metrics" icon={Cpu} isOpen={expandedSections.performance} onToggle={() => toggleSection('performance')}>
            {Object.entries(diagnosticData.performance).map(([key, value]) => <DiagnosticItem key={key} label={key} value={value} />)}
          </SettingsSection>
          <SettingsSection title="Local Storage" icon={HardDrive} isOpen={expandedSections.storage} onToggle={() => toggleSection('storage')}>
            {Object.entries(diagnosticData.storage).map(([key, value]) => <DiagnosticItem key={key} label={key} value={value} />)}
          </SettingsSection>
          <SettingsSection title="Network Status" icon={Wifi} isOpen={expandedSections.network} onToggle={() => toggleSection('network')}>
            {Object.entries(diagnosticData.network).map(([key, value]) => <DiagnosticItem key={key} label={key} value={value} />)}
          </SettingsSection>
        </>
      ) : (
        <div className="dashboard-card p-8 text-center text-secondary-500">
          <AlertTriangle className="mx-auto h-8 w-8 mb-2" />
          Could not load diagnostic information.
        </div>
      )}
    </div>
  );
};

export default SystemDiagnosticsSettings;
