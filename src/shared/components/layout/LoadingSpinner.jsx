// src/components/layout/LoadingSpinner.jsx
import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Loading Spinner Component
 * 
 * A flexible loading spinner component that can be used throughout the dashboard.
 * Supports different sizes, colors, and additional text labels.
 * 
 * Features:
 * - Multiple size variants (sm, md, lg, xl)
 * - Customizable colors
 * - Optional text labels
 * - Smooth animations
 * - Accessible with proper ARIA labels
 * - Center positioning options
 */
const LoadingSpinner = ({ 
  size = 'md', 
  color = 'blue', 
  text = null,
  className = '',
  centered = false,
  fullScreen = false
}) => {
  
  // Size configurations
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6', 
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  };

  // Color configurations
  const colorClasses = {
    blue: 'text-blue-600',
    gray: 'text-gray-600',
    white: 'text-white',
    green: 'text-green-600',
    red: 'text-red-600',
    indigo: 'text-indigo-600'
  };

  // Text size based on spinner size
  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg', 
    xl: 'text-xl'
  };

  const spinnerClasses = `${sizeClasses[size]} ${colorClasses[color]} animate-spin`;
  const textClasses = `mt-2 ${textSizeClasses[size]} ${colorClasses[color]} font-medium`;

  // Container classes based on positioning
  const getContainerClasses = () => {
    let classes = '';
    
    if (fullScreen) {
      classes += 'fixed inset-0 flex items-center justify-center bg-white bg-opacity-75 z-50';
    } else if (centered) {
      classes += 'flex flex-col items-center justify-center';
    } else {
      classes += 'flex flex-col items-center';
    }
    
    if (className) {
      classes += ` ${className}`;
    }
    
    return classes;
  };

  // Accessibility label
  const getAriaLabel = () => {
    if (text) {
      return `Loading: ${text}`;
    }
    return 'Loading';
  };

  return (
    <div 
      className={getContainerClasses()}
      role="status" 
      aria-label={getAriaLabel()}
    >
      <Loader2 className={spinnerClasses} />
      {text && (
        <div className={textClasses}>
          {text}
        </div>
      )}
      <span className="sr-only">{getAriaLabel()}</span>
    </div>
  );
};

// Pre-configured spinner variants for common use cases
export const SmallSpinner = (props) => (
  <LoadingSpinner size="sm" {...props} />
);

export const MediumSpinner = (props) => (
  <LoadingSpinner size="md" {...props} />
);

export const LargeSpinner = (props) => (
  <LoadingSpinner size="lg" {...props} />
);

export const FullScreenSpinner = ({ text = "Loading dashboard..." }) => (
  <LoadingSpinner 
    size="xl" 
    text={text} 
    fullScreen={true}
    color="blue"
  />
);

export const CenteredSpinner = (props) => (
  <LoadingSpinner centered={true} {...props} />
);

// Inline spinner for buttons and small spaces
export const InlineSpinner = ({ className = '' }) => (
  <Loader2 className={`h-4 w-4 animate-spin ${className}`} />
);

export default LoadingSpinner;