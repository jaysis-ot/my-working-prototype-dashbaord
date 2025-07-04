// src/components/ui/MaturityIndicator.jsx
import React, { memo } from 'react';

const MaturityIndicator = memo(({ level, score }) => (
  <div className="flex items-center space-x-2">
    <div className="flex space-x-1" role="progressbar" aria-label={`Maturity level ${score} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className={`w-3 h-3 rounded-full ${
            i <= score ? 'bg-blue-500' : 'bg-gray-200'
          }`}
          aria-hidden="true"
        />
      ))}
    </div>
    <span className="text-sm font-medium text-gray-700">{level}</span>
  </div>
));

MaturityIndicator.displayName = 'MaturityIndicator';

export default MaturityIndicator;