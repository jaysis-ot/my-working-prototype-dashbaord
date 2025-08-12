import React from 'react';
import PropTypes from 'prop-types';

const CircularProgress = ({
  value,
  size = 64,
  strokeWidth = 8,
  trackClassName,
  progressClassName,
  label,
  labelClassName,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;
  
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className={trackClassName || 'text-secondary-200 dark:text-secondary-700 stroke-current'}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={progressClassName || 'text-primary-600 stroke-current'}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center transform rotate-0">
        {label !== undefined ? (
          <span className={labelClassName}>{label}</span>
        ) : (
          <span className={labelClassName || 'text-sm font-semibold text-secondary-900 dark:text-white'}>
            {Math.round(value)}%
          </span>
        )}
      </div>
    </div>
  );
};

CircularProgress.propTypes = {
  value: PropTypes.number.isRequired,
  size: PropTypes.number,
  strokeWidth: PropTypes.number,
  trackClassName: PropTypes.string,
  progressClassName: PropTypes.string,
  label: PropTypes.node,
  labelClassName: PropTypes.string,
};

export default CircularProgress;
