import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import Button from '../../atoms/Button';
import Badge from '../../atoms/Badge';
import useEvidenceSuggestions from '../../../hooks/useEvidenceSuggestions';

/**
 * SuggestionsTab Component
 * 
 * Displays smart evidence suggestions, gap analysis, and automation
 * recommendations based on the current evidence and compliance requirements.
 */
const SuggestionsTab = ({ 
  evidenceItems, 
  insights, 
  onAddEvidence, 
  onAcceptSuggestion, 
  onDismissSuggestion 
}) => {
  /* ------------------------------------------------------------------
   * useEvidenceSuggestions hook integration
   * ------------------------------------------------------------------ */
  const {
    suggestions,
    loading,
    error,
    getSmartSuggestions
  } = useEvidenceSuggestions();

  // Load / refresh suggestions whenever evidence changes
  useEffect(() => {
    getSmartSuggestions({ currentEvidence: evidenceItems });
  }, [evidenceItems, getSmartSuggestions]);

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-secondary-800 rounded-lg border border-secondary-200 dark:border-secondary-700 p-4 mb-4">
        <div className="flex justify-between items-center">
          <p className="text-secondary-600 dark:text-secondary-400">
            Smart evidence suggestions help identify gaps in your compliance coverage and recommend
            new evidence artifacts based on your current evidence and compliance requirements.
          </p>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => getSmartSuggestions({ currentEvidence: evidenceItems })}
            disabled={loading}
          >
            Refresh
          </Button>
        </div>
      </div>
      
      {/* Status states */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
          <span className="ml-3 text-secondary-600 dark:text-secondary-400">Loading suggestions…</span>
        </div>
      )}

      {!loading && error && (
        <div className="text-center py-12">
          <p className="text-secondary-600 dark:text-secondary-400">{error}</p>
        </div>
      )}

      {!loading && !error && suggestions.length === 0 && (
        <div className="text-center py-12">
          <p className="text-secondary-600 dark:text-secondary-400">No suggestions available.</p>
        </div>
      )}

      {!loading && !error && suggestions.length > 0 && (
        <div className="space-y-4">
          {suggestions.map((s) => (
            <div
              key={s.id}
              className="bg-white dark:bg-secondary-800 border-l-4 border-secondary-300 dark:border-secondary-600 border-t border-r border-b border-secondary-200 dark:border-secondary-700 rounded-r-lg p-4"
            >
              <div className="flex justify-between items-start mb-1">
                <div className="font-medium text-secondary-900 dark:text-white">{s.title}</div>
                <Badge
                  variant={s.priority === 'high' ? 'error' : s.priority === 'medium' ? 'warning' : 'success'}
                  size="sm"
                >
                  {s.priority}
                </Badge>
              </div>
              <p className="text-sm text-secondary-600 dark:text-secondary-400 mb-3">{s.description}</p>
              <div className="flex gap-2 justify-end">
                <Button variant="secondary" size="sm" onClick={() => onDismissSuggestion(s.id)}>
                  Dismiss
                </Button>
                <Button variant="primary" size="sm" onClick={() => onAcceptSuggestion(s.id)}>
                  Accept
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

SuggestionsTab.propTypes = {
  evidenceItems: PropTypes.array.isRequired,
  insights: PropTypes.array.isRequired,
  onAddEvidence: PropTypes.func.isRequired,
  onAcceptSuggestion: PropTypes.func.isRequired,
  onDismissSuggestion: PropTypes.func.isRequired
};

export default SuggestionsTab;
