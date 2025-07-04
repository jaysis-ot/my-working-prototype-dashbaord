import React from 'react';

const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  color = "#3b82f6", 
  subtitle, 
  onClick,
  loading = false,
  trend = null, // 'up', 'down', 'neutral'
  className = ''
}) => {
  const handleClick = () => {
    if (onClick && !loading) {
      onClick();
    }
  };

  const handleKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && onClick && !loading) {
      e.preventDefault();
      onClick();
    }
  };

  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-gray-600'
  };

  const isClickable = !!onClick && !loading;

  return (
    <div
      className={`
        bg-white rounded-xl shadow-md p-4 transition-all duration-300 
        ${isClickable 
          ? 'hover:shadow-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 group' 
          : ''
        }
        ${loading ? 'animate-pulse' : ''}
        ${className}
      `}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={isClickable ? 0 : -1}
      role={isClickable ? 'button' : 'article'}
      aria-label={`${title}: ${loading ? 'Loading' : value}. ${subtitle || ''}`}
    >
      <div className="flex items-center justify-between mb-3">
        <div 
          className={`p-2 rounded-lg transition-transform ${
            isClickable ? 'group-hover:scale-110' : ''
          }`}
          style={{ backgroundColor: `${color}20` }}
        >
          {loading ? (
            <div 
              className="h-5 w-5 rounded animate-pulse"
              style={{ backgroundColor: color }}
            />
          ) : (
            <Icon 
              className="h-5 w-5" 
              style={{ color }} 
              aria-hidden="true"
            />
          )}
        </div>
        
        {loading && (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-300"></div>
        )}
      </div>
      
      <div>
        <div className="flex items-baseline justify-between">
          <p 
            className={`text-2xl font-bold transition-colors ${
              loading 
                ? 'bg-gray-200 text-gray-200 rounded w-16 h-8' 
                : `text-gray-900 ${isClickable ? 'group-hover:text-blue-600' : ''}`
            }`}
          >
            {loading ? '' : value}
          </p>
          
          {trend && !loading && (
            <span className={`text-xs font-medium ${trendColors[trend]}`}>
              {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'}
            </span>
          )}
        </div>
        
        <p className={`text-xs font-medium ${
          loading 
            ? 'bg-gray-200 text-gray-200 rounded w-20 h-4 mt-1' 
            : 'text-gray-700'
        }`}>
          {loading ? '' : title}
        </p>
        
        {subtitle && (
          <p className={`text-xs mt-1 ${
            loading 
              ? 'bg-gray-200 text-gray-200 rounded w-24 h-3' 
              : 'text-gray-500'
          }`}>
            {loading ? '' : subtitle}
          </p>
        )}
      </div>
    </div>
  );
};

export default StatCard;