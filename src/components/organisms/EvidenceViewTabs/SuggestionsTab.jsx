import React, { useState } from 'react';
import Button from '../../atoms/Button';
import Badge from '../../atoms/Badge';
import { RefreshCw } from 'lucide-react';

/**
 * SuggestionItem Component
 * 
 * Displays a single evidence suggestion with priority badge and action buttons
 */
const SuggestionItem = ({ suggestion, onAccept, onDismiss }) => (
  <div
    className="bg-white dark:bg-secondary-800 border-l-4 border-secondary-300 dark:border-secondary-600 border-t border-r border-b border-secondary-200 dark:border-secondary-700 rounded-r-lg p-4"
    style={{ 
      borderLeftColor: suggestion.priority === 'high' ? 'var(--color-status-error)' : 
                       suggestion.priority === 'medium' ? 'var(--color-status-warning)' : 
                       'var(--color-status-success)'
    }}
  >
    <div className="flex justify-between items-start mb-1">
      <div className="font-medium text-secondary-900 dark:text-white">{suggestion.title}</div>
      <Badge
        variant={suggestion.priority === 'high' ? 'error' : suggestion.priority === 'medium' ? 'warning' : 'success'}
        size="sm"
      >
        {suggestion.priority.charAt(0).toUpperCase() + suggestion.priority.slice(1)} Priority
      </Badge>
    </div>
    <p className="text-sm text-secondary-600 dark:text-secondary-400 mb-3">{suggestion.description}</p>
    
    <div className="flex flex-wrap gap-1.5 mb-3">
      <Badge variant="primary" size="sm">
        {suggestion.type} Evidence
      </Badge>
      <Badge variant="info" size="sm">
        {suggestion.relevance}% Relevance
      </Badge>
    </div>
    
    <div className="flex gap-2 justify-end">
      <Button variant="secondary" size="sm" onClick={() => onDismiss(suggestion.id)}>
        Dismiss
      </Button>
      <Button variant="primary" size="sm" onClick={() => onAccept(suggestion.id)}>
        Accept
      </Button>
    </div>
  </div>
);

/**
 * SuggestionsTab Component
 * 
 * Displays smart evidence suggestions, gap analysis, and automation
 * recommendations based on the current evidence and compliance requirements.
 */
const SuggestionsTab = () => {
  // Mock suggestions data
  const mockSuggestions = [
    {
      id: 'sug-001',
      title: 'Add MFA Configuration Evidence',
      description: 'Multi-factor authentication configuration screenshots are required for SOC 2 compliance. This evidence helps demonstrate access control measures.',
      type: 'Implementation',
      priority: 'high',
      relevance: 95,
      relatedFrameworks: ['SOC 2', 'ISO 27001']
    },
    {
      id: 'sug-002',
      title: 'Update Data Encryption Documentation',
      description: 'Your encryption documentation is aging and needs to be refreshed to maintain compliance with PCI DSS requirements.',
      type: 'Validation',
      priority: 'medium',
      relevance: 87,
      relatedFrameworks: ['PCI DSS', 'NIST CSF']
    },
    {
      id: 'sug-003',
      title: 'Add Vulnerability Scan Results',
      description: 'Recent vulnerability scan results should be added as evidence to demonstrate ongoing security monitoring and risk management.',
      type: 'Behavioral',
      priority: 'medium',
      relevance: 82,
      relatedFrameworks: ['ISO 27001', 'NIST CSF']
    },
    {
      id: 'sug-004',
      title: 'Create Access Review Documentation',
      description: 'Quarterly access reviews need to be documented to demonstrate regular validation of user access rights.',
      type: 'Validation',
      priority: 'high',
      relevance: 91,
      relatedFrameworks: ['SOC 2', 'ISO 27001']
    },
    {
      id: 'sug-005',
      title: 'Update Incident Response Plan',
      description: 'Your incident response plan needs to be updated to reflect current team structure and procedures.',
      type: 'Intent',
      priority: 'low',
      relevance: 75,
      relatedFrameworks: ['NIST CSF', 'ISO 27001']
    }
  ];

  // State for suggestions list
  const [suggestionsList, setSuggestionsList] = useState(mockSuggestions);
  const [loading, setLoading] = useState(false);

  // Handle accepting a suggestion
  const handleAccept = (suggestionId) => {
    setSuggestionsList(prev => prev.filter(s => s.id !== suggestionId));
  };

  // Handle dismissing a suggestion
  const handleDismiss = (suggestionId) => {
    setSuggestionsList(prev => prev.filter(s => s.id !== suggestionId));
  };

  // Handle refreshing suggestions
  const handleRefresh = () => {
    setLoading(true);
    // Simulate API call delay
    setTimeout(() => {
      setSuggestionsList(mockSuggestions);
      setLoading(false);
    }, 800);
  };

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
            leadingIcon={RefreshCw}
            onClick={handleRefresh}
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

      {!loading && suggestionsList.length === 0 && (
        <div className="text-center py-12">
          <p className="text-secondary-600 dark:text-secondary-400">No suggestions available.</p>
        </div>
      )}

      {!loading && suggestionsList.length > 0 && (
        <div className="space-y-4">
          {suggestionsList.map((suggestion) => (
            <SuggestionItem
              key={suggestion.id}
              suggestion={suggestion}
              onAccept={handleAccept}
              onDismiss={handleDismiss}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SuggestionsTab;
