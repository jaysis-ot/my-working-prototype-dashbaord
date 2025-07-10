// src/components/ui/MaturityIndicator.jsx
import React from 'react';

const MaturityIndicator = ({ level, score }) => {
  const getMaturityColor = (level) => {
    switch (level) {
      case 'Initial': return { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' };
      case 'Developing': return { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200' };
      case 'Defined': return { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' };
      case 'Managed': return { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' };
      case 'Optimizing': return { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' };
      default: return { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' };
    }
  };

  const colors = getMaturityColor(level);

  return (
    <div className={`inline-flex items-center px-3 py-1 rounded-full border ${colors.bg} ${colors.text} ${colors.border}`}>
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium">{level}</span>
        {score && (
          <span className="text-xs bg-white bg-opacity-70 px-1.5 py-0.5 rounded-full">
            {score}/5
          </span>
        )}
      </div>
    </div>
  );
};

export default MaturityIndicator;