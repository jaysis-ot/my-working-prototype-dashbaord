// src/components/charts/InteractiveChart.jsx
import React, { memo } from 'react';
import { BarChart3, Maximize2 } from 'lucide-react';

const InteractiveChart = memo(({ title, children, fullscreenId, onToggleFullscreen }) => {
  return (
    <div className="bg-white rounded-xl shadow-md">
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
          {title}
        </h3>
        <button 
          onClick={() => onToggleFullscreen(fullscreenId)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label={`Toggle fullscreen for ${title}`}
        >
          <Maximize2 className="h-4 w-4" />
        </button>
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );
});

InteractiveChart.displayName = 'InteractiveChart';

export default InteractiveChart;