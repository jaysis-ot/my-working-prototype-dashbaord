import React from 'react';
import PropTypes from 'prop-types';
import { Shield } from 'lucide-react';

/**
 * ProductLogo Component
 * 
 * A professional logo component for the TrustGuard product that adapts to
 * both expanded and collapsed states of the sidebar.
 * 
 * @example
 * // In expanded mode (with text)
 * <ProductLogo expanded={true} size="medium" />
 * 
 * // In collapsed mode (icon only)
 * <ProductLogo expanded={false} size="medium" />
 */
const ProductLogo = ({ expanded, size, className, ...props }) => {
  // Define size classes for the icon
  const sizeClasses = {
    small: 'w-6 h-6',
    medium: 'w-8 h-8',
    large: 'w-10 h-10',
  };

  // Define size classes for the text
  const textSizeClasses = {
    small: 'text-lg',
    medium: 'text-xl',
    large: 'text-2xl',
  };

  // Get the appropriate size class or default to medium
  const iconSizeClass = sizeClasses[size] || sizeClasses.medium;
  const textSizeClass = textSizeClasses[size] || textSizeClasses.medium;

  return (
    <div 
      className={`flex items-center justify-center ${expanded ? 'justify-start' : 'justify-center'} ${className}`}
      {...props}
    >
      {/* Shield icon with gradient background */}
      <div className="relative flex items-center justify-center">
        <div className={`${iconSizeClass} rounded-full bg-gradient-to-br from-primary-400 to-primary-700 p-1 shadow-md`}>
          <Shield 
            className="w-full h-full text-white" 
            strokeWidth={2.5}
          />
        </div>
        
        {/* Decorative glow effect */}
        <div 
          className={`absolute inset-0 ${iconSizeClass} rounded-full bg-primary-500 opacity-30 blur-sm -z-10`}
          aria-hidden="true"
        />
      </div>
      
      {/* Product name - only shown when expanded */}
      {expanded && (
        <div className={`ml-3 font-bold ${textSizeClass} text-white tracking-tight`}>
          <span className="text-primary-300">Trust</span>
          <span>Guard</span>
        </div>
      )}
    </div>
  );
};

ProductLogo.propTypes = {
  /**
   * Whether the sidebar is expanded (shows text) or collapsed (icon only)
   */
  expanded: PropTypes.bool,
  
  /**
   * Size of the logo (small, medium, large)
   */
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  
  /**
   * Additional CSS classes to apply
   */
  className: PropTypes.string,
};

ProductLogo.defaultProps = {
  expanded: true,
  size: 'medium',
  className: '',
};

export default ProductLogo;
