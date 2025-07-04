import React, { useCallback } from 'react';
import { useDashboardUI } from '../../contexts/DashboardUIContext';
import { useMitreAttackData } from '../../hooks/useMitreAttackData';
import MitreAttackNavigator from '../organisms/MitreAttackNavigator';
import LoadingSpinner from '../atoms/LoadingSpinner';
import ErrorDisplay from '../molecules/ErrorDisplay';

/**
 * MitreAttackPage Component
 * 
 * This is the main container component for the MITRE ATT&CK Navigator section.
 * It follows the "Page" pattern in atomic design, responsible for:
 * - Fetching and managing all data related to the MITRE ATT&CK framework via a custom hook.
 * - Handling loading and error states for the data.
 * - Passing data and event handlers to the presentational `MitreAttackNavigator` organism.
 * - Orchestrating high-level user interactions, such as filtering or view changes.
 */
const MitreAttackPage = () => {
  const { setViewMode } = useDashboardUI();
  
  // Fetch data using the dedicated custom hook
  const {
    tactics,
    techniques,
    threatGroups,
    loading,
    error,
    filters,
    setFilters,
    getTechniquesForTactic,
  } = useMitreAttackData();

  // --- Event Handlers ---

  const handleNavigateBack = useCallback(() => {
    // Example of using the UI context to navigate
    setViewMode('threat-intelligence');
  }, [setViewMode]);

  const handleFilterChange = useCallback((filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  }, [setFilters]);
  
  // --- Render Logic ---

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner size="lg" message="Loading MITRE ATT&CK Data..." />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorDisplay
        title="Failed to Load MITRE ATT&CK Data"
        message={error.message || 'An unexpected error occurred. Please try refreshing the page.'}
        onRetry={() => window.location.reload()} // Simple refresh for retry
      />
    );
  }

  return (
    <div className="fade-in">
      {/* 
        The MitreAttackNavigator organism will be the main presentational component.
        It receives all necessary data and functions as props, keeping it decoupled
        from the application's business logic and data fetching concerns.
      */}
      <MitreAttackNavigator
        tactics={tactics}
        techniques={techniques}
        threatGroups={threatGroups}
        filters={filters}
        onFilterChange={handleFilterChange}
        getTechniquesForTactic={getTechniquesForTactic}
        onNavigateBack={handleNavigateBack}
      />
    </div>
  );
};

export default MitreAttackPage;
