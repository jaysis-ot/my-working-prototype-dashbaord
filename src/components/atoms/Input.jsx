import React, { forwardRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

/**
 * Input component for the Cyber Trust Sensor Dashboard
 * 
 * A versatile, accessible input component that supports various types,
 * sizes, states, and icon placements. This is a foundational atom in our
 * atomic design system used throughout the application for data entry.
 */
const Input = forwardRef(({
  id,
  name,
  type = 'text',
  value,
  defaultValue,
  placeholder,
  size = 'md',
  disabled = false,
  readOnly = false,
  required = false,
  error = null,
  label,
  hideLabel = false,
  helperText,
  className = '',
  leadingIcon: LeadingIcon = null,
  trailingIcon: TrailingIcon = null,
  fullWidth = true,
  onChange,
  onBlur,
  onFocus,
  ...props
}, ref) => {
  // For password type, manage visibility toggle
  const [showPassword, setShowPassword] = useState(false);
  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  
  // Determine actual input type (for password visibility toggle)
  const inputType = type === 'password' && showPassword ? 'text' : type;
  
  // Base input classes
  const baseClasses = 'block rounded-md border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50';
  
  // Size classes
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base'
  };
  
  // Icon padding classes (to ensure text doesn't overlap icons)
  const iconPaddingClasses = {
    sm: {
      leading: 'pl-7',
      trailing: 'pr-7',
      both: 'pl-7 pr-7'
    },
    md: {
      leading: 'pl-9',
      trailing: 'pr-9',
      both: 'pl-9 pr-9'
    },
    lg: {
      leading: 'pl-11',
      trailing: 'pr-11',
      both: 'pl-11 pr-11'
    }
  };
  
  // Determine icon padding
  let iconPadding = '';
  if (LeadingIcon && (TrailingIcon || type === 'password' || error)) {
    iconPadding = iconPaddingClasses[size]?.both || '';
  } else if (LeadingIcon) {
    iconPadding = iconPaddingClasses[size]?.leading || '';
  } else if (TrailingIcon || type === 'password' || error) {
    iconPadding = iconPaddingClasses[size]?.trailing || '';
  }
  
  // State classes (normal, error, disabled)
  const stateClasses = error
    ? 'border-status-error text-status-error focus:border-status-error focus:ring-status-error bg-status-error bg-opacity-5'
    : 'border-secondary-300 dark:border-secondary-600 text-secondary-900 dark:text-white focus:border-primary-500 focus:ring-primary-500 bg-white dark:bg-secondary-800';
  
  // Width classes
  const widthClasses = fullWidth ? 'w-full' : '';
  
  // Icon sizes based on input size
  const getIconSize = (size) => {
    const iconSizes = {
      sm: 14,
      md: 16,
      lg: 20
    };
    return iconSizes[size] || 16;
  };
  
  // Combine all input classes
  const inputClasses = `
    ${baseClasses}
    ${sizeClasses[size] || sizeClasses.md}
    ${stateClasses}
    ${iconPadding}
    ${widthClasses}
    ${className}
  `;
  
  // Container classes for positioning icons
  const containerClasses = `relative ${fullWidth ? 'w-full' : ''}`;
  
  // Icon container positioning classes
  const leadingIconClasses = {
    sm: 'absolute left-2 top-1/2 -translate-y-1/2 text-secondary-400 dark:text-secondary-500 pointer-events-none',
    md: 'absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400 dark:text-secondary-500 pointer-events-none',
    lg: 'absolute left-4 top-1/2 -translate-y-1/2 text-secondary-400 dark:text-secondary-500 pointer-events-none'
  };
  
  const trailingIconContainerClasses = {
    sm: 'absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2',
    md: 'absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2',
    lg: 'absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2'
  };
  
  // Generate a unique ID if none provided
  const inputId = id || `input-${name}-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = error ? `${inputId}-error` : undefined;
  const helperId = helperText ? `${inputId}-helper` : undefined;
  
  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {/* Label */}
      {label && (
        <label 
          htmlFor={inputId}
          className={`block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1 ${hideLabel ? 'sr-only' : ''}`}
        >
          {label}
          {required && <span className="text-status-error ml-1">*</span>}
        </label>
      )}
      
      {/* Input container with icons */}
      <div className={containerClasses}>
        {/* Leading icon if provided */}
        {LeadingIcon && (
          <div className={leadingIconClasses[size]}>
            <LeadingIcon size={getIconSize(size)} aria-hidden="true" />
          </div>
        )}
        
        {/* Input element */}
        <input
          ref={ref}
          id={inputId}
          name={name}
          type={inputType}
          value={value}
          defaultValue={defaultValue}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          onChange={onChange}
          onBlur={onBlur}
          onFocus={onFocus}
          className={inputClasses}
          aria-invalid={!!error}
          aria-describedby={errorId || helperId}
          {...props}
        />
        
        {/* Trailing icons container */}
        <div className={trailingIconContainerClasses[size]}>
          {/* Error icon if error exists */}
          {error && (
            <AlertCircle size={getIconSize(size)} className="text-status-error" aria-hidden="true" />
          )}

          {/* Trailing icon if provided */}
          {TrailingIcon && (
            <div className="text-secondary-400 dark:text-secondary-500 pointer-events-none">
              <TrailingIcon size={getIconSize(size)} aria-hidden="true" />
            </div>
          )}

          {/* Password visibility toggle */}
          {type === 'password' && (
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="focus:outline-none text-secondary-500 hover:text-secondary-700 dark:hover:text-secondary-300"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              tabIndex="-1"
            >
              {showPassword ? (
                <EyeOff size={getIconSize(size)} />
              ) : (
                <Eye size={getIconSize(size)} />
              )}
            </button>
          )}
        </div>
      </div>
      
      {/* Helper text or error message */}
      {(helperText || error) && (
        <div className="mt-1">
          {error ? (
            <p id={errorId} className="text-sm text-status-error">
              {error}
            </p>
          ) : helperText ? (
            <p id={helperId} className="text-sm text-secondary-500 dark:text-secondary-400">
              {helperText}
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
});

Input.displayName = 'Input';

Input.propTypes = {
  /**
   * Input ID
   */
  id: PropTypes.string,
  
  /**
   * Input name
   */
  name: PropTypes.string,
  
  /**
   * Input type
   */
  type: PropTypes.oneOf([
    'text',
    'email',
    'password',
    'number',
    'tel',
    'url',
    'search',
    'date',
    'time',
    'datetime-local'
  ]),
  
  /**
   * Input value (controlled)
   */
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),
  
  /**
   * Default value (uncontrolled)
   */
  defaultValue: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),
  
  /**
   * Placeholder text
   */
  placeholder: PropTypes.string,
  
  /**
   * Input size
   */
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  
  /**
   * Whether input is disabled
   */
  disabled: PropTypes.bool,
  
  /**
   * Whether input is read-only
   */
  readOnly: PropTypes.bool,
  
  /**
   * Whether input is required
   */
  required: PropTypes.bool,
  
  /**
   * Error message
   */
  error: PropTypes.string,
  
  /**
   * Input label
   */
  label: PropTypes.string,
  
  /**
   * Whether to visually hide the label (still accessible to screen readers)
   */
  hideLabel: PropTypes.bool,
  
  /**
   * Helper text shown below the input
   */
  helperText: PropTypes.string,
  
  /**
   * Additional CSS classes
   */
  className: PropTypes.string,
  
  /**
   * Icon to display at the start of the input
   */
  leadingIcon: PropTypes.elementType,
  
  /**
   * Icon to display at the end of the input
   */
  trailingIcon: PropTypes.elementType,
  
  /**
   * Whether input should take full width
   */
  fullWidth: PropTypes.bool,
  
  /**
   * Change handler
   */
  onChange: PropTypes.func,
  
  /**
   * Blur handler
   */
  onBlur: PropTypes.func,
  
  /**
   * Focus handler
   */
  onFocus: PropTypes.func
};

export default Input;
