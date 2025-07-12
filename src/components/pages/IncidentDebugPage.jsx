import React, { useState, useEffect, Component } from 'react';
import IncidentManagementPage from './IncidentManagementPage';

/**
 * Error Boundary component to catch rendering errors
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
          <h2 className="text-xl font-semibold text-red-700 mb-4">Something went wrong rendering the Incident Management Page</h2>
          <div className="bg-white p-4 rounded-md shadow-sm overflow-auto max-h-96">
            <p className="font-mono text-red-600 mb-2">{this.state.error && this.state.error.toString()}</p>
            <details className="mt-4">
              <summary className="cursor-pointer text-blue-600 hover:text-blue-800">View component stack trace</summary>
              <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto">
                {this.state.errorInfo && this.state.errorInfo.componentStack}
              </pre>
            </details>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * IncidentDebugPage Component
 * 
 * A debugging page that renders the Incident Management page outside
 * of the normal navigation flow to isolate rendering issues.
 */
const IncidentDebugPage = () => {
  const [mounted, setMounted] = useState(false);
  const [renderTime, setRenderTime] = useState(null);
  const [renderAttempts, setRenderAttempts] = useState(0);

  // Track component mounting
  useEffect(() => {
    setMounted(true);
    const startTime = performance.now();
    
    return () => {
      console.log('IncidentDebugPage unmounted after', performance.now() - startTime, 'ms');
    };
  }, []);

  // Track render attempts
  useEffect(() => {
    setRenderAttempts(prev => prev + 1);
    const startTime = performance.now();
    setRenderTime(startTime);
    
    // Check if component rendered successfully after a short delay
    const timer = setTimeout(() => {
      setRenderTime(prev => prev ? performance.now() - prev : null);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Debug Header */}
      <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h1 className="text-2xl font-bold text-blue-800 mb-2">Incident Management Debug Page</h1>
        <p className="text-gray-700 mb-4">
          This page renders the Incident Management component directly, bypassing the normal navigation system.
          This helps isolate whether issues are with the component itself or with routing/navigation.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="bg-white p-3 rounded-md shadow-sm">
            <h3 className="font-medium text-gray-700">Component Status</h3>
            <p className="text-sm">
              <span className={`inline-block w-3 h-3 rounded-full mr-2 ${mounted ? 'bg-green-500' : 'bg-red-500'}`}></span>
              {mounted ? 'Mounted' : 'Not Mounted'}
            </p>
          </div>
          
          <div className="bg-white p-3 rounded-md shadow-sm">
            <h3 className="font-medium text-gray-700">Render Attempts</h3>
            <p className="text-sm">{renderAttempts}</p>
          </div>
          
          <div className="bg-white p-3 rounded-md shadow-sm">
            <h3 className="font-medium text-gray-700">Render Time</h3>
            <p className="text-sm">
              {typeof renderTime === 'number' ? `${renderTime.toFixed(2)}ms` : 'Calculating...'}
            </p>
          </div>
        </div>
      </div>

      {/* Component Rendering Area */}
      <div className="border border-gray-200 rounded-lg shadow-sm">
        <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
          <h2 className="font-medium text-gray-700">Component Output</h2>
        </div>
        
        <ErrorBoundary>
          <div className="p-1">
            {/* Render the actual Incident Management Page component */}
            <IncidentManagementPage />
          </div>
        </ErrorBoundary>
      </div>
      
      {/* Technical Information */}
      <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h2 className="text-lg font-medium text-gray-700 mb-2">Technical Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-gray-600">React Version</h3>
            <p className="text-sm font-mono">{React.version}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-600">Browser</h3>
            <p className="text-sm font-mono">{navigator.userAgent}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncidentDebugPage;
