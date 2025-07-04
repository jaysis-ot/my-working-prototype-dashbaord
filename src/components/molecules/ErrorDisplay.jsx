import React from 'react';
import PropTypes from 'prop-types';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import Button from '../atoms/Button';

/**
 * ErrorDisplay Molecule Component
 * 
 * A reusable component for displaying error messages in a consistent format
 * across the application. It provides a clear visual indicator of an error
 * and an optional action for the user to retry the failed operation.
 */
const ErrorDisplay = ({ title, message, onRetry, className = '' }) => {
  return (
    <div
      className={`dashboard-card p-6 flex flex-col items-center justify-center text-center border-l-4 border-status-error ${className}`}
      role="alert"
    >
      <AlertTriangle className="w-12 h-12 text-status-error mb-4" />
      
      <h3 className="text-xl font-semibold text-secondary-900 dark:text-white">
        {title}
      </h3>
      
      <p className="mt-2 text-sm text-secondary-600 dark:text-secondary-300 max-w-md">
        {message}
      </p>
      
      {onRetry && (
        <Button
          onClick={onRetry}
          variant="secondary"
          leadingIcon={RefreshCw}
          className="mt-6"
        >
          Try Again
        </Button>
      )}
    </div>
  );
};

ErrorDisplay.propTypes = {
  /**
   * The main title of the error message.
   */
  title: PropTypes.string.isRequired,
  /**
   * A more detailed description of the error.
   */
  message: PropTypes.string.isRequired,
  /**
   * An optional function to be called when the user clicks the "Try Again" button.
   * If not provided, the button will not be displayed.
   */
  onRetry: PropTypes.func,
  /**
   * Additional CSS classes to apply to the container.
   */
  className: PropTypes.string,
};

export default ErrorDisplay;
