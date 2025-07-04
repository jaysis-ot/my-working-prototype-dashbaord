import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { Loader2 } from 'lucide-react';

/**
 * Button component for the Cyber Trust Sensor Dashboard
 * 
 * A flexible, accessible button component that supports multiple variants,
 * sizes, loading states, and icons. This is a foundational atom in our
 * atomic design system used throughout the application.
 */
const Button = forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  className = '',
  disabled = false,
  loading = false,
  leadingIcon: LeadingIcon = null,
  trailingIcon: TrailingIcon = null,
  fullWidth = false,
  onClick,
  ...props
}, ref) => {
  // Base button classes
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed';
  
  // Size classes
  const sizeClasses = {
    sm: 'px-2.5 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };
  
  // Icon spacing classes
  const iconSpacing = {
    sm: 'gap-1',
    md: 'gap-2',
    lg: 'gap-2'
  };
  
  // Variant classes
  const variantClasses = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white focus:ring-primary-500',
    secondary: 'bg-secondary-200 hover:bg-secondary-300 text-secondary-900 focus:ring-secondary-500',
    ghost: 'bg-transparent hover:bg-secondary-100 text-secondary-700 hover:text-secondary-900 focus:ring-secondary-500',
    danger: 'bg-status-error hover:bg-red-700 text-white focus:ring-red-500',
    success: 'bg-status-success hover:bg-green-700 text-white focus:ring-green-500',
    warning: 'bg-status-warning hover:bg-amber-600 text-white focus:ring-amber-500',
    governance: 'bg-governance hover:bg-governance-dark text-white focus:ring-governance',
    risk: 'bg-risk hover:bg-risk-dark text-white focus:ring-risk',
    compliance: 'bg-compliance hover:bg-compliance-dark text-white focus:ring-compliance',
  };
  
  // Width classes
  const widthClasses = fullWidth ? 'w-full' : '';
  
  // Combine all classes
  const buttonClasses = `
    ${baseClasses}
    ${sizeClasses[size] || sizeClasses.md}
    ${variantClasses[variant] || variantClasses.primary}
    ${iconSpacing[size] || iconSpacing.md}
    ${widthClasses}
    ${className}
  `;
  
  // Icon sizes based on button size
  const getIconSize = (size) => {
    const iconSizes = {
      sm: 14,
      md: 16,
      lg: 20
    };
    return iconSizes[size] || 16;
  };
  
  return (
    <button
      ref={ref}
      type={type}
      className={buttonClasses}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && (
        <Loader2 
          size={getIconSize(size)} 
          className="animate-spin mr-2" 
          aria-hidden="true"
        />
      )}
      
      {!loading && LeadingIcon && (
        <LeadingIcon 
          size={getIconSize(size)} 
          className="flex-shrink-0" 
          aria-hidden="true"
        />
      )}
      
      <span>{children}</span>
      
      {!loading && TrailingIcon && (
        <TrailingIcon 
          size={getIconSize(size)} 
          className="flex-shrink-0" 
          aria-hidden="true"
        />
      )}
    </button>
  );
});

Button.displayName = 'Button';

Button.propTypes = {
  /**
   * Button content
   */
  children: PropTypes.node.isRequired,
  
  /**
   * Button variant
   */
  variant: PropTypes.oneOf([
    'primary', 
    'secondary', 
    'ghost', 
    'danger', 
    'success', 
    'warning',
    'governance',
    'risk',
    'compliance'
  ]),
  
  /**
   * Button size
   */
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  
  /**
   * Button type
   */
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  
  /**
   * Additional CSS classes
   */
  className: PropTypes.string,
  
  /**
   * Disabled state
   */
  disabled: PropTypes.bool,
  
  /**
   * Loading state
   */
  loading: PropTypes.bool,
  
  /**
   * Icon to display before text
   */
  leadingIcon: PropTypes.elementType,
  
  /**
   * Icon to display after text
   */
  trailingIcon: PropTypes.elementType,
  
  /**
   * Whether button should take full width
   */
  fullWidth: PropTypes.bool,
  
  /**
   * Click handler
   */
  onClick: PropTypes.func
};

export default Button;
