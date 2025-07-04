import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';

/**
 * Badge component for the Cyber Trust Sensor Dashboard
 * 
 * A versatile badge component for displaying status indicators, labels, and tags.
 * Supports different variants, sizes, and optional icons for enhanced visual communication.
 * Used throughout the dashboard for status indicators, maturity levels, and category labels.
 */
const Badge = forwardRef(({
  children,
  variant = 'default',
  size = 'md',
  icon: Icon = null,
  iconPosition = 'left',
  className = '',
  pill = true,
  bordered = false,
  ...props
}, ref) => {
  // Base badge classes
  const baseClasses = 'inline-flex items-center font-medium';
  
  // Size classes
  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-xs',
    md: 'px-2 py-1 text-xs',
    lg: 'px-2.5 py-1.5 text-sm'
  };
  
  // Shape classes
  const shapeClasses = pill ? 'rounded-full' : 'rounded';
  
  // Icon spacing classes
  const iconSpacing = {
    sm: iconPosition === 'left' ? 'pl-1.5 pr-2' : 'pl-2 pr-1.5',
    md: iconPosition === 'left' ? 'pl-2 pr-2.5' : 'pl-2.5 pr-2',
    lg: iconPosition === 'left' ? 'pl-2.5 pr-3' : 'pl-3 pr-2.5'
  };
  
  // Variant classes - background, text, and border colors
  const variantClasses = {
    default: 'bg-secondary-100 text-secondary-800 dark:bg-secondary-700 dark:text-secondary-100',
    primary: 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:bg-opacity-30 dark:text-primary-300',
    success: 'bg-status-success bg-opacity-10 text-status-success dark:bg-opacity-20',
    warning: 'bg-status-warning bg-opacity-10 text-status-warning dark:bg-opacity-20',
    error: 'bg-status-error bg-opacity-10 text-status-error dark:bg-opacity-20',
    info: 'bg-status-info bg-opacity-10 text-status-info dark:bg-opacity-20',
    pending: 'bg-status-pending bg-opacity-10 text-status-pending dark:bg-opacity-20',
    governance: 'bg-governance bg-opacity-10 text-governance dark:bg-opacity-20',
    risk: 'bg-risk bg-opacity-10 text-risk dark:bg-opacity-20',
    compliance: 'bg-compliance bg-opacity-10 text-compliance dark:bg-opacity-20',
    // Maturity levels
    maturity1: 'bg-maturity-1 bg-opacity-10 text-maturity-1 dark:bg-opacity-20',
    maturity2: 'bg-maturity-2 bg-opacity-10 text-maturity-2 dark:bg-opacity-20',
    maturity3: 'bg-maturity-3 bg-opacity-10 text-maturity-3 dark:bg-opacity-20',
    maturity4: 'bg-maturity-4 bg-opacity-10 text-maturity-4 dark:bg-opacity-20',
    maturity5: 'bg-maturity-5 bg-opacity-10 text-maturity-5 dark:bg-opacity-20',
  };
  
  // Border classes if bordered is true
  const borderClasses = bordered ? {
    default: 'border border-secondary-200 dark:border-secondary-600',
    primary: 'border border-primary-200 dark:border-primary-700',
    success: 'border border-status-success border-opacity-30',
    warning: 'border border-status-warning border-opacity-30',
    error: 'border border-status-error border-opacity-30',
    info: 'border border-status-info border-opacity-30',
    pending: 'border border-status-pending border-opacity-30',
    governance: 'border border-governance border-opacity-30',
    risk: 'border border-risk border-opacity-30',
    compliance: 'border border-compliance border-opacity-30',
    maturity1: 'border border-maturity-1 border-opacity-30',
    maturity2: 'border border-maturity-2 border-opacity-30',
    maturity3: 'border border-maturity-3 border-opacity-30',
    maturity4: 'border border-maturity-4 border-opacity-30',
    maturity5: 'border border-maturity-5 border-opacity-30',
  }[variant] : '';
  
  // Icon sizes based on badge size
  const getIconSize = (size) => {
    const iconSizes = {
      sm: 12,
      md: 14,
      lg: 16
    };
    return iconSizes[size] || 14;
  };
  
  // Combine all classes
  const badgeClasses = `
    ${baseClasses}
    ${sizeClasses[size] || sizeClasses.md}
    ${shapeClasses}
    ${variantClasses[variant] || variantClasses.default}
    ${borderClasses}
    ${Icon ? iconSpacing[size] || iconSpacing.md : ''}
    ${className}
  `;
  
  return (
    <span
      ref={ref}
      className={badgeClasses}
      role="status"
      {...props}
    >
      {Icon && iconPosition === 'left' && (
        <Icon 
          size={getIconSize(size)} 
          className="mr-1 flex-shrink-0" 
          aria-hidden="true"
        />
      )}
      
      <span>{children}</span>
      
      {Icon && iconPosition === 'right' && (
        <Icon 
          size={getIconSize(size)} 
          className="ml-1 flex-shrink-0" 
          aria-hidden="true"
        />
      )}
    </span>
  );
});

Badge.displayName = 'Badge';

Badge.propTypes = {
  /**
   * Badge content
   */
  children: PropTypes.node.isRequired,
  
  /**
   * Badge variant
   */
  variant: PropTypes.oneOf([
    'default',
    'primary',
    'success', 
    'warning', 
    'error', 
    'info', 
    'pending',
    'governance',
    'risk',
    'compliance',
    'maturity1',
    'maturity2',
    'maturity3',
    'maturity4',
    'maturity5'
  ]),
  
  /**
   * Badge size
   */
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  
  /**
   * Icon to display
   */
  icon: PropTypes.elementType,
  
  /**
   * Position of the icon
   */
  iconPosition: PropTypes.oneOf(['left', 'right']),
  
  /**
   * Additional CSS classes
   */
  className: PropTypes.string,
  
  /**
   * Whether badge should have pill shape (rounded-full)
   */
  pill: PropTypes.bool,
  
  /**
   * Whether badge should have a border
   */
  bordered: PropTypes.bool
};

export default Badge;
