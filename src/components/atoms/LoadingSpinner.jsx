import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { Loader2 } from 'lucide-react';

/**
 * LoadingSpinner Atom Component
 * 
 * A reusable, accessible loading spinner for indicating background processes
 * or data fetching states. It's a foundational atom in the design system,
 * designed to be used across the application wherever an asynchronous action
 * is taking place.
 */
const LoadingSpinner = forwardRef(({
  size = 'md',
  message,
  className = '',
  fullScreen = false,
  ...props
}, ref) => {
  // --- Sizing Logic ---
  const sizeClasses = {
    sm: {
      icon: 'w-5 h-5',
      text: 'text-xs',
    },
    md: {
      icon: 'w-8 h-8',
      text: 'text-sm',
    },
    lg: {
      icon: 'w-12 h-12',
      text: 'text-base',
    },
  };

  const selectedSize = sizeClasses[size] || sizeClasses.md;

  // --- Layout Logic ---
  const containerClasses = fullScreen
    ? 'fixed inset-0 flex flex-col items-center justify-center bg-background-light bg-opacity-75 dark:bg-background-dark dark:bg-opacity-75 z-50'
    : `inline-flex flex-col items-center justify-center ${className}`;

  return (
    <div
      ref={ref}
      className={containerClasses}
      role="status"
      aria-live="polite"
      {...props}
    >
      <Loader2
        className={`animate-spin text-primary-600 dark:text-primary-400 ${selectedSize.icon}`}
        aria-hidden="true"
      />
      {message && (
        <p className={`mt-3 font-medium text-secondary-600 dark:text-secondary-400 ${selectedSize.text}`}>
          {message}
        </p>
      )}
      <span className="sr-only">{message || 'Loading...'}</span>
    </div>
  );
});

LoadingSpinner.displayName = 'LoadingSpinner';

LoadingSpinner.propTypes = {
  /**
   * The size of the spinner.
   */
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  /**
   * An optional message to display below the spinner.
   */
  message: PropTypes.string,
  /**
   * Additional CSS classes to apply to the container.
   */
  className: PropTypes.string,
  /**
   * If true, the spinner will cover the entire screen with a semi-transparent overlay.
   */
  fullScreen: PropTypes.bool,
};

export default LoadingSpinner;
