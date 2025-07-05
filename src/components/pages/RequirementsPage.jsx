import React, { useCallback } from 'react';
import { useDashboardUI } from '../../contexts/DashboardUIContext';
import { useRequirementsData } from '../../hooks/useRequirementsData';
import { useCapabilitiesData } from '../../hooks/useCapabilitiesData';
import { useFilteredRequirements } from '../../hooks/useFilteredRequirements';
import RequirementsTable from '../organisms/RequirementsTable';
import LoadingSpinner from '../atoms/LoadingSpinner';
import ErrorDisplay from '../molecules/ErrorDisplay';

// Mock utility for CSV export until a proper one is built
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
 * RequirementsPage Component
 * 
 * This page serves as the main container for the requirements management feature.
 * It follows the "Page" pattern in atomic design, orchestrating data flow and
 * state management for its child organisms.
 * 
 * Responsibilities:
 * - Fetches requirements and capabilities data using custom hooks.
 * - Applies filters and search terms to the data.
 * - Handles loading and error states.
 * - Provides event handlers for user interactions (e.g., export, modal triggers).
 * - Passes all necessary data and functions as props to the RequirementsTable organism.
 */
const RequirementsPage = () => {
  const {
    state: uiState,
    dispatch: uiDispatch,
    openRequirementModal,
  } = useDashboardUI();

  const { requirements, loading: reqsLoading, error: reqsError } = useRequirementsData();
  const { capabilities, loading: capsLoading, error: capsError } = useCapabilitiesData();

  const filteredRequirements = useFilteredRequirements(
    requirements,
    uiState.filters,
    uiState.searchTerm
  );

  const loading = reqsLoading || capsLoading;
  const error = reqsError || capsError;

  // --- Event Handlers ---

  const handleExportCSV = useCallback(() => {
    const csvString = generateCSV(filteredRequirements);
    downloadCSV(csvString, `requirements-export-${new Date().toISOString().split('T')[0]}.csv`);
  }, [filteredRequirements]);

  const handleViewRequirement = useCallback((requirement) => {
    openRequirementModal(requirement, false); // false for view mode
  }, [openRequirementModal]);

  const handleEditRequirement = useCallback((requirement) => {
    openRequirementModal(requirement, true); // true for edit mode
  }, [openRequirementModal]);
  
  const handleImportCSV = useCallback(() => {
    uiDispatch({ type: 'TOGGLE_MODAL', payload: 'showUploadModal' });
  }, [uiDispatch]);

  // --- Render Logic ---

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner size="lg" message="Loading requirements data..." />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorDisplay
        title="Failed to Load Requirements"
        message={error.message || 'An unexpected error occurred. Please try refreshing the page.'}
      />
    );
  }

  return (
    <div className="fade-in">
      <RequirementsTable
        requirements={requirements}
        filteredRequirements={filteredRequirements}
        capabilities={capabilities}
        filters={uiState.filters}
        searchTerm={uiState.searchTerm}
        columnVisibility={uiState.columnVisibility}
        onFilterChange={(field, value) => uiDispatch({ type: 'SET_FILTER', payload: { field, value } })}
        onSearchChange={(term) => uiDispatch({ type: 'SET_SEARCH_TERM', payload: term })}
        onClearFilters={() => uiDispatch({ type: 'CLEAR_FILTERS' })}
        onClearSearch={() => uiDispatch({ type: 'SET_SEARCH_TERM', payload: '' })}
        onToggleColumnVisibility={(column) => uiDispatch({ type: 'TOGGLE_COLUMN_VISIBILITY', payload: column })}
        onViewRequirement={handleViewRequirement}
        onEditRequirement={handleEditRequirement}
        onExportCSV={handleExportCSV}
        onImportCSV={handleImportCSV}
      />
      {/* Modals for viewing/editing requirements will be handled by a global ModalManager */}
    </div>
  );
};

export default RequirementsPage;
