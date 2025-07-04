// components/ui/StatusIndicator.jsx - Accessible status display
import React, { memo } from 'react';
import { CheckCircle, Clock, AlertTriangle, Pause, Eye } from 'lucide-react';

const STATUS_CONFIG = {
  'Completed': { 
    color: '#10b981', 
    bgColor: 'bg-green-100', 
    textColor: 'text-green-800',
    icon: CheckCircle,
    label: 'Completed'
  },
  'In Progress': { 
    color: '#f59e0b', 
    bgColor: 'bg-yellow-100', 
    textColor: 'text-yellow-800',
    icon: Clock,
    label: 'In Progress'
  },
  'Not Started': { 
    color: '#ef4444', 
    bgColor: 'bg-red-100', 
    textColor: 'text-red-800',
    icon: AlertTriangle,
    label: 'Not Started'
  },
  'On Hold': { 
    color: '#6b7280', 
    bgColor: 'bg-gray-100', 
    textColor: 'text-gray-800',
    icon: Pause,
    label: 'On Hold'
  },
  'Under Review': { 
    color: '#8b5cf6', 
    bgColor: 'bg-purple-100', 
    textColor: 'text-purple-800',
    icon: Eye,
    label: 'Under Review'
  }
};

export const StatusIndicator = memo(({ status, showText = true, size = 'sm' }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG['Not Started'];
  const Icon = config.icon;
  
  const sizeClasses = {
    xs: 'text-xs px-2 py-1',
    sm: 'text-sm px-2 py-1',
    md: 'text-base px-3 py-1.5',
    lg: 'text-lg px-4 py-2'
  };

  return (
    <span 
      className={`inline-flex items-center font-semibold rounded-full ${config.bgColor} ${config.textColor} ${sizeClasses[size]}`}
      role="status"
      aria-label={`Status: ${config.label}`}
    >
      <Icon className="w-3 h-3 mr-1" aria-hidden="true" />
      {showText && config.label}
    </span>
  );
});

StatusIndicator.displayName = 'StatusIndicator';

// components/ui/ProgressBar.jsx - Accessible progress display
import React, { memo } from 'react';

export const ProgressBar = memo(({ 
  progress, 
  status, 
  showPercentage = true, 
  size = 'md',
  animated = false 
}) => {
  const progressValue = Math.max(0, Math.min(100, progress || 0));
  
  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  };

  const getProgressColor = () => {
    if (progressValue === 100) return 'bg-green-500';
    if (progressValue >= 75) return 'bg-blue-500';
    if (progressValue >= 50) return 'bg-yellow-500';
    if (progressValue >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-gray-700">Progress</span>
        {showPercentage && (
          <span className="text-sm font-bold text-gray-900">{progressValue}%</span>
        )}
      </div>
      <div 
        className={`w-full bg-gray-200 rounded-full ${sizeClasses[size]}`}
        role="progressbar"
        aria-valuenow={progressValue}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Progress: ${progressValue}% complete`}
      >
        <div 
          className={`${getProgressColor()} ${sizeClasses[size]} rounded-full transition-all duration-300 ${animated ? 'animate-pulse' : ''}`}
          style={{ width: `${progressValue}%` }}
        />
      </div>
      {status && (
        <p className="text-xs text-gray-500 mt-1" role="status">
          Status: {status}
        </p>
      )}
    </div>
  );
});

ProgressBar.displayName = 'ProgressBar';

// components/ui/SearchInput.jsx - Accessible search with debouncing
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, X } from 'lucide-react';

export const SearchInput = ({ 
  value, 
  onChange, 
  placeholder = "Search...", 
  debounceMs = 300,
  ariaLabel = "Search input"
}) => {
  const [localValue, setLocalValue] = useState(value);
  const timeoutRef = useRef();
  const inputRef = useRef();

  // Debounced search
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      onChange(localValue);
    }, debounceMs);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [localValue, onChange, debounceMs]);

  // Sync with external value changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleClear = useCallback(() => {
    setLocalValue('');
    onChange('');
    inputRef.current?.focus();
  }, [onChange]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      handleClear();
    }
  }, [handleClear]);

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-4 w-4 text-gray-400" aria-hidden="true" />
      </div>
      <input
        ref={inputRef}
        type="text"
        className="block w-full pl-10 pr-10 border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        placeholder={placeholder}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onKeyDown={handleKeyDown}
        aria-label={ariaLabel}
        aria-describedby={localValue ? "search-clear-button" : undefined}
      />
      {localValue && (
        <button
          id="search-clear-button"
          type="button"
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
          onClick={handleClear}
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

// components/ui/LoadingSpinner.jsx - Accessible loading indicator
import React from 'react';

export const LoadingSpinner = ({ 
  size = 'md', 
  message = 'Loading...',
  overlay = false 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  const content = (
    <div className="flex flex-col items-center justify-center" role="status" aria-live="polite">
      <div className={`animate-spin rounded-full border-b-2 border-blue-600 ${sizeClasses[size]}`} aria-hidden="true" />
      {message && (
        <p className="mt-4 text-gray-600 text-center" aria-live="polite">
          {message}
        </p>
      )}
      <span className="sr-only">Loading content, please wait...</span>
    </div>
  );

  if (overlay) {
    return (
      <div className="fixed inset-0 bg-gray-50 bg-opacity-75 flex items-center justify-center z-50">
        {content}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      {content}
    </div>
  );
};

// components/ui/TableSkeleton.jsx - Loading state for tables
import React from 'react';

export const TableSkeleton = ({ rows = 5, columns = 6 }) => (
  <div className="animate-pulse">
    <div className="bg-gray-50 rounded-t-lg p-4">
      <div className="grid grid-cols-6 gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className="h-4 bg-gray-300 rounded" />
        ))}
      </div>
    </div>
    <div className="bg-white divide-y divide-gray-200">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="p-4">
          <div className="grid grid-cols-6 gap-4">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <div key={colIndex} className="h-4 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

// components/ui/ErrorBoundary.jsx - Enhanced error boundary
import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      retryCount: 0 
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    
    // Log to external service in production
    if (process.env.NODE_ENV === 'production') {
      console.error('Dashboard Error:', error, errorInfo);
      // Here you would typically send to error tracking service
    } else {
      console.error('Dashboard Error:', error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }));
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4" role="alert">
          <div className="bg-white rounded-xl shadow-md p-8 max-w-md w-full text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" aria-hidden="true" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Something went wrong
            </h2>
            <p className="text-gray-600 mb-4">
              We encountered an error while loading the dashboard. Please try again.
            </p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-4 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 mb-2">
                  Error Details
                </summary>
                <pre className="text-xs text-red-600 bg-red-50 p-2 rounded overflow-auto">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
            <div className="flex space-x-3 justify-center">
              <button 
                onClick={this.handleRetry}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                aria-label="Retry loading the dashboard"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </button>
              <button 
                onClick={() => window.location.reload()}
                className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                aria-label="Reload the entire page"
              >
                Reload Page
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              Retry count: {this.state.retryCount}
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}