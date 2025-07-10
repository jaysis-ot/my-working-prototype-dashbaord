import React, { useCallback } from 'react';
import { useRiskManagement } from '../../hooks/useRiskManagement';
import RiskManagementView from '../organisms/RiskManagementView';
import LoadingSpinner from '../atoms/LoadingSpinner';
import ErrorDisplay from '../molecules/ErrorDisplay';

/* ------------------------------------------------------------------
 * CSV Utilities (mirrors RequirementsPage implementation)
 * ---------------------------------------------------------------- */
const generateCSV = (data) => {
  if (!data || data.length === 0) return '';
  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(row => Object.values(row).join(','));
  return `${headers}\n${rows.join('\n')}`;
};

const downloadCSV = (csvString, filename) => {
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

/**
 * RiskManagementPage Component
 * 
 * This page serves as the main container for the risk management feature.
 * It follows the "Page" pattern in atomic design, orchestrating data flow and
 * state management for its child organisms.
 * 
 * Responsibilities:
 * - Fetches risk and treatment data using the useRiskManagement hook.
 * - Manages and applies filters for the risk register.
 * - Handles loading and error states for all risk-related data.
 * - Provides event handlers for user interactions (e.g., adding a new risk).
 * - Passes all necessary data and functions as props to the RiskManagementView organism.
 */
const RiskManagementPage = () => {
  // Get all data and functions from the centralized risk management hook
  const {
    filteredRisks,
    treatments,
    metrics,
    loading,
    error,
    filters,
    setFilters,
    addRisk,
    updateRisk,
    deleteRisk,
  } = useRiskManagement();

  // --- Event Handlers ---

  /**
   * Handles changes to the filter controls.
   * @param {string} filterName - The name of the filter to update (e.g., 'status', 'category').
   * @param {string} value - The new value for the filter.
   */
  const handleFilterChange = useCallback((filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  }, [setFilters]);

  /**
   * Handles the creation of a new risk.
   * This would typically be triggered by a modal form.
   * @param {Object} newRiskData - The data for the new risk.
   */
  const handleAddRisk = useCallback((newRiskData) => {
    addRisk(newRiskData);
    // In a real app, you might show a success toast here
  }, [addRisk]);

  /**
   * Handles updating an existing risk.
   * @param {string} riskId - The ID of the risk to update.
   * @param {Object} updatedData - The new data for the risk.
   */
  const handleUpdateRisk = useCallback((riskId, updatedData) => {
    updateRisk(riskId, updatedData);
  }, [updateRisk]);

  /**
   * Handles deleting a risk.
   * @param {string} riskId - The ID of the risk to delete.
   */
  const handleDeleteRisk = useCallback((riskId) => {
    deleteRisk(riskId);
  }, [deleteRisk]);

  /* ------------------------------------------------------------------
   * Import / Export Handlers
   * ---------------------------------------------------------------- */
  const handleExportCSV = useCallback(() => {
    const csvString = generateCSV(filteredRisks);
    downloadCSV(csvString, `risks-export-${new Date().toISOString().split('T')[0]}.csv`);
  }, [filteredRisks]);

  // Placeholder – will be replaced with real import logic later
  const handleImportCSV = useCallback(() => {
    /* eslint-disable no-console */
    console.info('Import Risk CSV – feature not yet implemented');
    /* eslint-enable no-console */
  }, []);

  // --- Render Logic ---

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner size="lg" message="Loading Risk Register..." />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorDisplay
        title="Failed to Load Risk Data"
        message={error.message || 'An unexpected error occurred. Please try refreshing the page.'}
        onRetry={() => window.location.reload()} // Simple retry mechanism
      />
    );
  }

  return (
    <div className="fade-in h-full flex flex-col">
      {/* 
        The RiskManagementView organism is the main presentational component.
        It receives all necessary data and functions as props, keeping it decoupled
        from the application's business logic and data fetching concerns.
      */}
      <RiskManagementView
        risks={filteredRisks}
        treatments={treatments}
        metrics={metrics}
        filters={filters}
        onFilterChange={handleFilterChange}
        onAddRisk={handleAddRisk}
        onUpdateRisk={handleUpdateRisk}
        onDeleteRisk={handleDeleteRisk}
        onExportCSV={handleExportCSV}
        onImportCSV={handleImportCSV}
      />
    </div>
  );
};

export default RiskManagementPage;
