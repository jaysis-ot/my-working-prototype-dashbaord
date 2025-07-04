import React from 'react';
import { AlertTriangle, RefreshCw, Home, Mail } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Log error to console for development
    console.error('Dashboard Error Boundary:', error, errorInfo);
    
    // In production, you would send this to your error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to error reporting service
      // logErrorToService(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const isMinimalError = this.props.minimal;
      
      if (isMinimalError) {
        // Minimal error UI for smaller components
        return (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-sm text-red-700">
                Something went wrong loading this component.
              </p>
              <button
                onClick={this.handleRetry}
                className="ml-auto text-sm text-red-600 hover:text-red-800 underline"
              >
                Try again
              </button>
            </div>
          </div>
        );
      }

      // Full page error UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-lg w-full bg-white rounded-xl shadow-lg p-6">
            {/* Error Icon */}
            <div className="flex justify-center mb-4">
              <div className="bg-red-100 p-3 rounded-full">
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
            </div>

            {/* Error Title */}
            <h2 className="text-2xl font-semibold text-gray-900 text-center mb-2">
              Oops! Something went wrong
            </h2>

            <p className="text-gray-600 text-center mb-6">
              We're sorry, but there was an error loading the dashboard. 
              This has been automatically reported to our team.
            </p>

            {/* Error Details (Development Only) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-6 p-4 bg-gray-100 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  Error Details (Development):
                </h3>
                <pre className="text-xs text-gray-600 whitespace-pre-wrap overflow-auto max-h-32">
                  {this.state.error.toString()}
                  {this.state.errorInfo && (
                    <>
                      {'\n\nComponent Stack:'}
                      {this.state.errorInfo.componentStack}
                    </>
                  )}
                </pre>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={this.handleRetry}
                className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </button>
              
              <button
                onClick={this.handleReload}
                className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Home className="h-4 w-4 mr-2" />
                Reload Page
              </button>
            </div>

            {/* Help Text */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500 text-center">
                If this problem persists, please{' '}
                <button 
                  onClick={() => {
                    window.location.href = 'mailto:support@company.com?subject=Dashboard Error';
                  }}
                  className="text-blue-600 hover:text-blue-800 underline inline-flex items-center"
                >
                  <Mail className="h-3 w-3 mr-1" />
                  contact support
                </button>
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for easier usage
export const withErrorBoundary = (Component, minimal = false) => {
  return function WithErrorBoundaryComponent(props) {
    return (
      <ErrorBoundary minimal={minimal}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
};

// Hook for error reporting
export const useErrorHandler = () => {
  const handleError = (error, context = '') => {
    console.error(`Error in ${context}:`, error);
    
    // In production, send to error reporting service
    if (process.env.NODE_ENV === 'production') {
      // logErrorToService(error, { context });
    }
  };

  return { handleError };
};

export default ErrorBoundary;