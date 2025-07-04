// src/components/ui/StatCard.jsx
import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

/**
 * StatCard Component
 * 
 * A versatile statistics card component for displaying key metrics and data points.
 * Features interactive behavior, trend indicators, and customizable styling.
 * 
 * Features:
 * - Customizable icons and colors
 * - Interactive click handling
 * - Trend indicators (up, down, neutral)
 * - Loading and disabled states
 * - Responsive design
 * - Hover effects and animations
 * - Accessibility support
 */
const StatCard = ({
  title,
  value,
  subtitle = null,
  icon: Icon = null,
  color = '#3b82f6',
  trend = null, // 'up', 'down', 'neutral', or null
  trendValue = null,
  onClick = null,
  loading = false,
  disabled = false,
  className = '',
  size = 'default' // 'sm', 'default', 'lg'
}) => {

  // Size configurations
  const sizeConfigs = {
    sm: {
      container: 'p-4',
      icon: 'h-8 w-8 p-2',
      title: 'text-sm',
      value: 'text-xl',
      subtitle: 'text-xs'
    },
    default: {
      container: 'p-6',
      icon: 'h-10 w-10 p-2.5',
      title: 'text-sm',
      value: 'text-2xl',
      subtitle: 'text-xs'
    },
    lg: {
      container: 'p-8',
      icon: 'h-12 w-12 p-3',
      title: 'text-base',
      value: 'text-3xl',
      subtitle: 'text-sm'
    }
  };

  const sizeConfig = sizeConfigs[size];

  // Determine if card should be interactive
  const isInteractive = onClick && !disabled && !loading;

  // Get trend icon and color
  const getTrendDisplay = () => {
    if (!trend) return null;

    const trendConfig = {
      up: { icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-100' },
      down: { icon: TrendingDown, color: 'text-red-600', bg: 'bg-red-100' },
      neutral: { icon: Minus, color: 'text-gray-600', bg: 'bg-gray-100' }
    };

    const config = trendConfig[trend];
    if (!config) return null;

    const TrendIcon = config.icon;

    return (
      <div className={`inline-flex items-center px-2 py-1 rounded-full ${config.bg} ${config.color}`}>
        <TrendIcon className="h-3 w-3 mr-1" />
        {trendValue && <span className="text-xs font-medium">{trendValue}</span>}
      </div>
    );
  };

  // Handle click events
  const handleClick = () => {
    if (isInteractive) {
      onClick();
    }
  };

  // Handle keyboard events
  const handleKeyDown = (e) => {
    if (isInteractive && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick();
    }
  };

  // Dynamic classes based on state
  const getCardClasses = () => {
    let classes = `bg-white rounded-xl shadow-md border transition-all duration-200 ${sizeConfig.container}`;
    
    if (isInteractive) {
      classes += ' cursor-pointer hover:shadow-lg hover:scale-105 transform focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50';
    }
    
    if (disabled) {
      classes += ' opacity-50 cursor-not-allowed';
    }
    
    if (loading) {
      classes += ' animate-pulse';
    }
    
    if (className) {
      classes += ` ${className}`;
    }
    
    return classes;
  };

  // Icon background color with proper opacity
  const getIconBgColor = () => {
    // Convert hex color to RGB and add opacity
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    return `rgba(${r}, ${g}, ${b}, 0.1)`;
  };

  return (
    <div
      className={getCardClasses()}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={isInteractive ? 0 : -1}
      role={isInteractive ? 'button' : 'article'}
      aria-label={isInteractive ? `View details for ${title}` : `${title}: ${value}`}
    >
      {/* Header with Icon and Trend */}
      <div className="flex items-start justify-between mb-4">
        {Icon && (
          <div 
            className={`${sizeConfig.icon} rounded-lg flex items-center justify-center`}
            style={{ 
              backgroundColor: getIconBgColor(),
              color: color 
            }}
          >
            <Icon className="h-full w-full" />
          </div>
        )}
        {getTrendDisplay()}
      </div>

      {/* Title */}
      <h3 className={`font-medium text-gray-600 mb-2 ${sizeConfig.title}`}>
        {title}
      </h3>

      {/* Value */}
      <div className={`font-bold text-gray-900 mb-1 ${sizeConfig.value}`}>
        {loading ? (
          <div className="bg-gray-200 rounded h-8 w-16 animate-pulse"></div>
        ) : (
          value
        )}
      </div>

      {/* Subtitle */}
      {subtitle && (
        <p className={`text-gray-500 ${sizeConfig.subtitle}`}>
          {loading ? (
            <div className="bg-gray-200 rounded h-3 w-20 animate-pulse"></div>
          ) : (
            subtitle
          )}
        </p>
      )}

      {/* Interactive indicator */}
      {isInteractive && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
        </div>
      )}
    </div>
  );
};

// Pre-configured stat card variants
export const SmallStatCard = (props) => (
  <StatCard size="sm" {...props} />
);

export const LargeStatCard = (props) => (
  <StatCard size="lg" {...props} />
);

export const TrendingStatCard = ({ trend, trendValue, ...props }) => (
  <StatCard trend={trend} trendValue={trendValue} {...props} />
);

export const InteractiveStatCard = ({ onClick, ...props }) => (
  <StatCard onClick={onClick} {...props} />
);

export default StatCard;