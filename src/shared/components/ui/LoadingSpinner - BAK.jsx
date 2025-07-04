// src/components/ui/LoadingSpinner.jsx
import React from 'react';

const LoadingSpinner = ({ 
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

export default LoadingSpinner;