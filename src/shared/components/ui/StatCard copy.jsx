// src/components/ui/StatCard.jsx
import React, { memo, useState } from 'react';

const StatCard = memo(({ title, value, icon: Icon, color, subtitle, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className={`relative bg-white rounded-xl shadow-md p-6 border-l-4 cursor-pointer transition-all duration-300 transform ${
        isHovered ? 'scale-102 shadow-lg' : 'hover:shadow-lg'
      }`}
      style={{ borderLeftColor: color }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => e.key === 'Enter' && onClick?.()}
      aria-label={`${title}: ${value}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <Icon className="h-10 w-10" style={{ color }} aria-hidden="true" />
      </div>
    </div>
  );
});

StatCard.displayName = 'StatCard';

export default StatCard;