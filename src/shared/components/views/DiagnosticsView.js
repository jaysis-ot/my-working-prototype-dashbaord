import React, { useState, useEffect, useMemo } from 'react';
import { 
  Activity, Download, RefreshCw, Monitor, Cpu, HardDrive, Wifi, 
  Globe, Settings, Package, Code, Database, Clock, Smartphone,
  AlertTriangle, CheckCircle, Info, Copy, Eye, EyeOff
} from 'lucide-react';

const DiagnosticsView = ({ appState, companyProfile }) => {
  const [diagnosticData, setDiagnosticData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState({
    browser: true,
    system: true,
    environment: false,
    performance: false,
    storage: false,
    network: false,
    application: true,
    dependencies: false
  });
  const [copyFeedback, setCopyFeedback] = useState('');

  // Comprehensive diagnostics data collection
  const collectDiagnostics = async () => {
    setLoading(true);
    
    try {
      const data = {
        timestamp: new Date().toISOString(),
        session: {
          id: sessionStorage.getItem('sessionId') || 'unknown',
          startTime: performance.timeOrigin ? new Date(performance.timeOrigin).toISOString() : 'unknown'
        },
        
        // Browser Information
        browser: {
          userAgent: navigator.userAgent,
          vendor: navigator.vendor,
          language: navigator.language,
          languages: navigator.languages,
          platform: navigator.platform,
          cookieEnabled: navigator.cookieEnabled,
          onLine: navigator.onLine,
          doNotTrack: navigator.doNotTrack,
          hardwareConcurrency: navigator.hardwareConcurrency,
          maxTouchPoints: navigator.maxTouchPoints,
          deviceMemory: navigator.deviceMemory || 'unknown',
          connection: navigator.connection ? {
            effectiveType: navigator.connection.effectiveType,
            downlink: navigator.connection.downlink,
            rtt: navigator.connection.rtt,
            saveData: navigator.connection.saveData
          } : 'unavailable'
        },

        // System Information
        system: {
          screen: {
            width: window.screen.width,
            height: window.screen.height,
            availWidth: window.screen.availWidth,
            availHeight: window.screen.availHeight,
            colorDepth: window.screen.colorDepth,
            pixelDepth: window.screen.pixelDepth,
            orientation: window.screen.orientation ? window.screen.orientation.type : 'unknown'
          },
          viewport: {
            width: window.innerWidth,
            height: window.innerHeight,
            devicePixelRatio: window.devicePixelRatio
          },
          timezone: {
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            offset: new Date().getTimezoneOffset()
          },
          geolocation: 'geolocation' in navigator ? 'available' : 'unavailable'
        },

        // Environment Variables
        environment: {
          reactEnv: process.env.NODE_ENV || 'unknown',
          publicUrl: process.env.PUBLIC_URL || 'unknown',
          buildVersion: process.env.REACT_APP_VERSION || 'unknown',
          // Add any other relevant env vars that are safe to expose
          customEnvVars: Object.keys(process.env)
            .filter(key => key.startsWith('REACT_APP_'))
            .reduce((acc, key) => {
              acc[key] = process.env[key];
              return acc;
            }, {})
        },

        // Performance Metrics
        performance: {
          memory: performance.memory ? {
            usedJSHeapSize: performance.memory.usedJSHeapSize,
            totalJSHeapSize: performance.memory.totalJSHeapSize,
            jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
          } : 'unavailable',
          timing: performance.timing ? {
            navigationStart: performance.timing.navigationStart,
            domContentLoadedEventEnd: performance.timing.domContentLoadedEventEnd,
            loadEventEnd: performance.timing.loadEventEnd,
            pageLoadTime: performance.timing.loadEventEnd - performance.timing.navigationStart
          } : 'unavailable',
          navigation: performance.navigation ? {
            type: performance.navigation.type,
            redirectCount: performance.navigation.redirectCount
          } : 'unavailable'
        },

        // Storage Information
        storage: {
          localStorage: (() => {
            try {
              const keys = Object.keys(localStorage);
              return {
                itemCount: keys.length,
                totalSize: JSON.stringify(localStorage).length,
                keys: keys.slice(0, 10) // Limit for privacy
              };
            } catch (e) {
              return { error: e.message };
            }
          })(),
          sessionStorage: (() => {
            try {
              const keys = Object.keys(sessionStorage);
              return {
                itemCount: keys.length,
                totalSize: JSON.stringify(sessionStorage).length,
                keys: keys.slice(0, 10)
              };
            } catch (e) {
              return { error: e.message };
            }
          })(),
          indexedDB: 'indexedDB' in window ? 'available' : 'unavailable',
          webSQL: 'openDatabase' in window ? 'available' : 'unavailable'
        },

        // Network Information
        network: {
          online: navigator.onLine,
          connectionType: navigator.connection?.effectiveType || 'unknown',
          downlink: navigator.connection?.downlink || 'unknown',
          rtt: navigator.connection?.rtt || 'unknown',
          protocol: window.location.protocol,
          hostname: window.location.hostname,
          port: window.location.port || (window.location.protocol === 'https:' ? '443' : '80'),
          origin: window.location.origin
        },

        // Application State
        application: {
          currentView: appState.ui.viewMode,
          sidebarExpanded: appState.ui.sidebarExpanded,
          isMobile: appState.ui.isMobile,
          activeFilters: Object.entries(appState.filters).filter(([key, value]) => value).length,
          totalRequirements: appState.requirements,
          totalCapabilities: appState.capabilities,
          companyProfileComplete: companyProfile?.profileCompleted || false,
          companyName: companyProfile?.companyName || 'Not set',
          reactVersion: React.version
        },

        // Browser Capabilities
        capabilities: {
          webGL: (() => {
            try {
              const canvas = document.createElement('canvas');
              const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
              return gl ? {
                vendor: gl.getParameter(gl.VENDOR),
                renderer: gl.getParameter(gl.RENDERER),
                version: gl.getParameter(gl.VERSION),
                shadingLanguageVersion: gl.getParameter(gl.SHADING_LANGUAGE_VERSION)
              } : 'unavailable';
            } catch (e) {
              return { error: e.message };
            }
          })(),
          webWorkers: typeof Worker !== 'undefined',
          serviceWorkers: 'serviceWorker' in navigator,
          webAssembly: typeof WebAssembly !== 'undefined',
          pushNotifications: 'Notification' in window,
          geolocation: 'geolocation' in navigator,
          camera: 'getUserMedia' in navigator || 'webkitGetUserMedia' in navigator,
          battery: 'getBattery' in navigator,
          vibration: 'vibrate' in navigator
        },

        // React Dependencies (approximated from imports)
        dependencies: {
          react: React.version,
          knownLibraries: {
            'lucide-react': 'imported',
            'recharts': 'imported',
            // Add other libraries as detected
          },
          browserAPIs: {
            fetch: typeof fetch !== 'undefined',
            websockets: typeof WebSocket !== 'undefined',
            intersectionObserver: typeof IntersectionObserver !== 'undefined',
            mutationObserver: typeof MutationObserver !== 'undefined',
            resizeObserver: typeof ResizeObserver !== 'undefined'
          }
        }
      };

      // Add battery info if available
      if ('getBattery' in navigator) {
        try {
          const battery = await navigator.getBattery();
          data.system.battery = {
            charging: battery.charging,
            level: battery.level,
            chargingTime: battery.chargingTime,
            dischargingTime: battery.dischargingTime
          };
        } catch (e) {
          data.system.battery = { error: e.message };
        }
      }

      setDiagnosticData(data);
    } catch (error) {
      console.error('Error collecting diagnostics:', error);
      setDiagnosticData({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    collectDiagnostics();
  }, []);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const exportDiagnostics = () => {
    const dataStr = JSON.stringify(diagnosticData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `system-diagnostics-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyFeedback('Copied!');
      setTimeout(() => setCopyFeedback(''), 2000);
    } catch (err) {
      setCopyFeedback('Copy failed');
      setTimeout(() => setCopyFeedback(''), 2000);
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusIcon = (status) => {
    if (status === 'available' || status === true || status === 'online') {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    } else if (status === 'unavailable' || status === false || status === 'offline') {
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    }
    return <Info className="h-4 w-4 text-blue-500" />;
  };

  const renderSection = (title, icon, data, sectionKey) => {
    const isExpanded = expandedSections[sectionKey];
    
    return (
      <div className="bg-white rounded-lg shadow-md">
        <div 
          className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => toggleSection(sectionKey)}
        >
          <div className="flex items-center">
            {icon}
            <h3 className="text-lg font-semibold text-gray-900 ml-3">{title}</h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                copyToClipboard(JSON.stringify(data, null, 2));
              }}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              title="Copy section data"
            >
              <Copy className="h-4 w-4 text-gray-500" />
            </button>
            {isExpanded ? <EyeOff className="h-4 w-4 text-gray-500" /> : <Eye className="h-4 w-4 text-gray-500" />}
          </div>
        </div>
        
        {isExpanded && (
          <div className="px-4 pb-4 border-t border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {Object.entries(data).map(([key, value]) => (
                <div key={key} className="bg-gray-50 p-3 rounded">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    {(typeof value === 'boolean' || value === 'available' || value === 'unavailable') && 
                      getStatusIcon(value)
                    }
                  </div>
                  <div className="text-sm text-gray-900">
                    {typeof value === 'object' && value !== null 
                      ? JSON.stringify(value, null, 1).substring(0, 100) + (JSON.stringify(value).length > 100 ? '...' : '')
                      : String(value)
                    }
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Collecting system diagnostics...</p>
        </div>
      </div>
    );
  }

  if (!diagnosticData || diagnosticData.error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <AlertTriangle className="h-6 w-6 text-red-600 mr-3" />
          <div>
            <h3 className="text-lg font-semibold text-red-900">Diagnostics Error</h3>
            <p className="text-red-700 mt-1">
              {diagnosticData?.error || 'Failed to collect diagnostic information'}
            </p>
          </div>
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
              <Activity className="h-7 w-7 mr-3 text-blue-600" />
              System Diagnostics
            </h2>
            <p className="text-gray-600 mt-1">
              Comprehensive system information for troubleshooting and licensing
            </p>
            <div className="text-sm text-gray-500 mt-2">
              Generated on {new Date(diagnosticData.timestamp).toLocaleString()}
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            {copyFeedback && (
              <div className="text-sm text-green-600 flex items-center">
                <CheckCircle className="h-4 w-4 mr-1" />
                {copyFeedback}
              </div>
            )}
            <button
              onClick={collectDiagnostics}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>
            <button
              onClick={exportDiagnostics}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              Export JSON
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-md text-center">
          <Monitor className="h-6 w-6 text-blue-600 mx-auto mb-2" />
          <div className="text-sm font-medium text-gray-900">
            {diagnosticData.system.screen.width}x{diagnosticData.system.screen.height}
          </div>
          <div className="text-xs text-gray-500">Screen Resolution</div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-md text-center">
          <Cpu className="h-6 w-6 text-green-600 mx-auto mb-2" />
          <div className="text-sm font-medium text-gray-900">
            {diagnosticData.browser.hardwareConcurrency || 'Unknown'}
          </div>
          <div className="text-xs text-gray-500">CPU Cores</div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-md text-center">
          <HardDrive className="h-6 w-6 text-purple-600 mx-auto mb-2" />
          <div className="text-sm font-medium text-gray-900">
            {diagnosticData.performance.memory !== 'unavailable' 
              ? formatBytes(diagnosticData.performance.memory.totalJSHeapSize)
              : 'Unknown'
            }
          </div>
          <div className="text-xs text-gray-500">JS Heap</div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-md text-center">
          <Wifi className="h-6 w-6 text-orange-600 mx-auto mb-2" />
          <div className="text-sm font-medium text-gray-900">
            {diagnosticData.network.connectionType}
          </div>
          <div className="text-xs text-gray-500">Connection</div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-md text-center">
          <Globe className="h-6 w-6 text-indigo-600 mx-auto mb-2" />
          <div className="text-sm font-medium text-gray-900">
            {diagnosticData.browser.onLine ? 'Online' : 'Offline'}
          </div>
          <div className="text-xs text-gray-500">Network Status</div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-md text-center">
          <Package className="h-6 w-6 text-red-600 mx-auto mb-2" />
          <div className="text-sm font-medium text-gray-900">
            React {diagnosticData.application.reactVersion}
          </div>
          <div className="text-xs text-gray-500">Framework</div>
        </div>
      </div>

      {/* Detailed Sections */}
      <div className="space-y-4">
        {renderSection('Browser Information', <Globe className="h-5 w-5 text-blue-600" />, diagnosticData.browser, 'browser')}
        {renderSection('System Information', <Monitor className="h-5 w-5 text-green-600" />, diagnosticData.system, 'system')}
        {renderSection('Application State', <Code className="h-5 w-5 text-purple-600" />, diagnosticData.application, 'application')}
        {renderSection('Performance Metrics', <Activity className="h-5 w-5 text-red-600" />, diagnosticData.performance, 'performance')}
        {renderSection('Environment Variables', <Settings className="h-5 w-5 text-orange-600" />, diagnosticData.environment, 'environment')}
        {renderSection('Storage Information', <Database className="h-5 w-5 text-indigo-600" />, diagnosticData.storage, 'storage')}
        {renderSection('Network Information', <Wifi className="h-5 w-5 text-teal-600" />, diagnosticData.network, 'network')}
        {renderSection('Browser Capabilities', <Smartphone className="h-5 w-5 text-pink-600" />, diagnosticData.capabilities, 'capabilities')}
        {renderSection('Dependencies & APIs', <Package className="h-5 w-5 text-yellow-600" />, diagnosticData.dependencies, 'dependencies')}
      </div>

      {/* Footer Info */}
      <div className="bg-gray-50 rounded-lg p-4 text-center text-sm text-gray-600">
        <p>
          This diagnostic report contains system information that can help with troubleshooting, 
          licensing verification, and compatibility analysis. 
          Export this data when contacting support.
        </p>
      </div>
    </div>
  );
};

export default DiagnosticsView;