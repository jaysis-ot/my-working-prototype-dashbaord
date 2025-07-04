// src/components/layout/ErrorBoundary.jsx
import React from 'react';
import { AlertTriangle, RefreshCw, Home, Mail } from 'lucide-react';

/**
 * Error Boundary Component
 * 
 * This component catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI instead of crashing the entire application.
 * 
 * Features:
 * - Catches and logs React component errors
 * - Provides user-friendly error messages
 * - Offers recovery options (reload, navigate home)
 * - Maintains error details for debugging
 * - Responsive design
 * - Professional error reporting interface
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null
    };
  }

  /**
   * Called when an error is thrown during rendering
   * Updates state to trigger fallback UI
   */
  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { 
      hasError: true,
      errorId: `ERR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
  }

  /**
   * Called after an error has been thrown
   * Logs error details for debugging
   */
  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error('Dashboard Error Boundary caught an error:', error, errorInfo);
    
    // Update state with error details
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // In a real application, you would report this to an error reporting service
    this.reportErrorToService(error, errorInfo);
  }

  /**
   * Report error to monitoring service
   * In production, this would send to services like Sentry, LogRocket, etc.
   */
  reportErrorToService = (error, errorInfo) => {
    const errorReport = {
      errorId: this.state.errorId,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // For development, just log to console
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 Error Report');
      console.error('Error ID:', errorReport.errorId);
      console.error('Message:', errorReport.message);
      console.error('Stack:', errorReport.stack);
      console.error('Component Stack:', errorReport.componentStack);
      console.groupEnd();
    }

    // In production, send to error monitoring service
    // Example: Sentry.captureException(error, { extra: errorReport });
  };

  /**
   * Reset error boundary state
   */
  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    });
  };

  /**
   * Reload the entire page
   */
  handleReload = () => {
    window.location.reload();
  };

  /**
   * Navigate to home/overview
   */
  handleGoHome = () => {
    // Reset the error boundary
    this.handleReset();
    // Navigate to home - this would typically use your router
    window.location.hash = '#/overview';
  };

  /**
   * Copy error details to clipboard for support
   */
  handleCopyErrorDetails = async () => {
    const errorDetails = {
      errorId: this.state.errorId,
      message: this.state.error?.message,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    try {
      await navigator.clipboard.writeText(JSON.stringify(errorDetails, null, 2));
      alert('Error details copied to clipboard');
    } catch (err) {
      console.error('Failed to copy error details:', err);
    }
  };

  render() {
    if (this.state.hasError) {
      // Fallback UI when error occurs
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
            
            {/* Error Icon and Title */}
            <div className="text-center mb-6">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Something went wrong
              </h2>
              <p className="text-gray-600 text-sm">
                We're sorry, but there was an error loading this part of the dashboard.
              </p>
            </div>

            {/* Error ID for support */}
            {this.state.errorId && (
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <div className="text-xs text-gray-500 mb-1">Error ID:</div>
                <div className="text-sm font-mono text-gray-700 break-all">
                  {this.state.errorId}
                </div>
              </div>
            )}

            {/* Error Message (if available) */}
            {this.state.error?.message && process.env.NODE_ENV === 'development' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <div className="text-xs text-red-600 mb-1">Error Details (Development):</div>
                <div className="text-sm text-red-800 font-mono break-words">
                  {this.state.error.message}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={this.handleReload}
                className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reload Page
              </button>

              <button
                onClick={this.handleGoHome}
                className="w-full flex items-center justify-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                <Home className="h-4 w-4 mr-2" />
                Go to Dashboard
              </button>

              {/* Additional support options */}
              <div className="pt-3 border-t border-gray-200">
                <div className="flex space-x-2">
                  <button
                    onClick={this.handleCopyErrorDetails}
                    className="flex-1 flex items-center justify-center px-3 py-2 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
                  >
                    Copy Error Details
                  </button>
                  <button
                    onClick={() => window.open('mailto:support@company.com?subject=Dashboard Error&body=Error ID: ' + this.state.errorId)}
                    className="flex-1 flex items-center justify-center px-3 py-2 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
                  >
                    <Mail className="h-3 w-3 mr-1" />
                    Report Issue
                  </button>
                </div>
              </div>
            </div>

            {/* Help Text */}
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">
                If this problem persists, please contact support with the error ID above.
              </p>
            </div>
          </div>
        </div>
      );
    }

    // If no error, render children normally
    return this.props.children;
  }
}

export default ErrorBoundary;