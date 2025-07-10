import React, { useCallback } from 'react';
import { useDashboardUI } from '../../contexts/DashboardUIContext';
import { useThreatIntelligence } from '../../hooks/useThreatIntelligence';
import ThreatIntelligenceView from '../organisms/ThreatIntelligenceView';
import LoadingSpinner from '../atoms/LoadingSpinner';
import ErrorDisplay from '../molecules/ErrorDisplay';

/**
 * ThreatIntelligencePage Component
 * 
 * This is the main container component for the Threat Intelligence section.
 * It follows the "Page" pattern in atomic design, responsible for:
 * - Fetching and managing threat intelligence data via the useThreatIntelligence hook.
 * - Handling loading and error states for the data.
 * - Passing data and event handlers to the presentational `ThreatIntelligenceView` organism.
 * - Orchestrating high-level user interactions.
 */
const ThreatIntelligencePage = () => {
  const { setViewMode } = useDashboardUI();
  const {
    threats,
    iocs,
    statistics,
    loading,
    error,
    isInitialized,
    searchThreats,
  } = useThreatIntelligence();

  // --- Event Handlers ---

  const handleNavigateBack = useCallback(() => {
    setViewMode('overview');
  }, [setViewMode]);

  const handleRefresh = useCallback(() => {
    // The hook's useEffect will handle periodic refreshes,
    // but we can provide a manual trigger.
    searchThreats({ limit: 20 }).catch(console.error);
  }, [searchThreats]);

  // --- Render Logic ---

  if (loading && !isInitialized) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner size="lg" message="Initializing Threat Intelligence System..." />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorDisplay
        title="Threat Intelligence System Error"
        message={error.message || 'An unexpected error occurred while loading threat data. Please try again later.'}
        onRetry={handleRefresh}
      />
    );
  }

  return (
    <div className="fade-in">
      {/*
        The ThreatIntelligenceView organism is the main presentational component.
        It receives all necessary data and functions as props, keeping it decoupled
        from the application's business logic and data fetching concerns.
      */}
      <ThreatIntelligenceView
        threats={threats}
        iocs={iocs}
        statistics={statistics}
        loading={loading}
        onNavigateBack={handleNavigateBack}
        onRefresh={handleRefresh}
        onSearch={searchThreats}
      />
    </div>
  );
};

export default ThreatIntelligencePage;
