import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import Badge from '../../atoms/Badge';
import useEvidenceScoring from '../../../hooks/useEvidenceScoring';

/**
 * ScoringTab Component
 * 
 * Displays ML-driven evidence quality scoring across multiple dimensions,
 * with improvement suggestions and decay predictions.
 */
const ScoringTab = ({ evidenceItems }) => {
  const [selectedEvidenceId, setSelectedEvidenceId] = useState(null);
  
  // Find the selected evidence item
  const selectedEvidence = useMemo(() => 
    evidenceItems.find(item => item.id === selectedEvidenceId), 
  [selectedEvidenceId, evidenceItems]);
  
  // Get scoring data from the hook
  const { scores } = useEvidenceScoring(
    selectedEvidence,
    evidenceItems.filter(item => item.id !== selectedEvidenceId),
    {}
  );

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-secondary-800 rounded-lg border border-secondary-200 dark:border-secondary-700 p-4 mb-4">
        <p className="text-secondary-600 dark:text-secondary-400">
          Our ML-driven scoring system evaluates evidence quality across multiple dimensions.
          Select an evidence item to see detailed scoring, improvement suggestions, and decay predictions.
        </p>
      </div>
      
      {/* Evidence Selection Grid */}
      <div className="bg-white dark:bg-secondary-800 rounded-lg border border-secondary-200 dark:border-secondary-700 p-4 mb-6">
        <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">
          Select Evidence to Score
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {evidenceItems.map(item => (
            <div 
              key={item.id}
              className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                selectedEvidenceId === item.id 
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
                  : 'border-secondary-200 dark:border-secondary-700 hover:border-primary-300'
              }`}
              onClick={() => setSelectedEvidenceId(item.id)}
            >
              <div className="flex justify-between">
                <h4 className="font-medium text-secondary-900 dark:text-white">{item.title}</h4>
                <Badge variant={item.status === 'fresh' ? 'success' : item.status === 'aging' ? 'warning' : 'error'} size="sm">
                  {item.status}
                </Badge>
              </div>
              <p className="text-sm text-secondary-600 dark:text-secondary-400 mt-1">
                {item.type} Evidence
              </p>
            </div>
          ))}
        </div>
      </div>
      
      {/* Scoring Results */}
      {selectedEvidence && (
        <div className="bg-white dark:bg-secondary-800 rounded-lg border border-secondary-200 dark:border-secondary-700 p-6">
          <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">
            Quality Score: {scores.overall}
          </h3>
          <div className="space-y-3">
            {Object.entries(scores.dimensions || {}).map(([dimension, score]) => (
              <div key={dimension} className="flex justify-between items-center">
                <span className="text-secondary-700 dark:text-secondary-300 capitalize">{dimension}:</span>
                <span className="font-medium text-secondary-900 dark:text-white">{score}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

ScoringTab.propTypes = {
  evidenceItems: PropTypes.array.isRequired
};

export default ScoringTab;
