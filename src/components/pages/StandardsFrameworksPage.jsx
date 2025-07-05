import React, { useCallback } from 'react';
import { useStandardsFrameworks } from '../../hooks/useStandardsFrameworks';
import StandardsFrameworksView from '../organisms/StandardsFrameworksView';
import LoadingSpinner from '../atoms/LoadingSpinner';
import ErrorDisplay from '../molecules/ErrorDisplay';

/**
 * StandardsFrameworksPage Component
 * 
 * This page serves as the container for the standards and compliance frameworks feature.
 * It is responsible for orchestrating data flow for a selected framework, handling
 * user interactions, and managing state via the useStandardsFrameworks hook.
 * 
 * Responsibilities:
 * - Fetches framework data and user assessment responses.
 * - Handles loading and error states for the data.
 * - Provides callback functions for updating and resetting assessments.
 * - Passes all necessary data and handlers to the presentational `StandardsFrameworksView` organism.
 */
const StandardsFrameworksPage = () => {
  // --- Data Fetching and State Management ---
  const {
    framework,
    assessment,
    scores,
    loading,
    error,
    updateAssessmentResponse,
    resetAssessment,
  } = useStandardsFrameworks();

  // --- Event Handlers ---

  /**
   * Callback to handle updating a response for a specific subcategory.
   * This is passed down to the assessment organism.
   */
  const handleUpdateResponse = useCallback((subcategoryId, response) => {
    updateAssessmentResponse(subcategoryId, response);
  }, [updateAssessmentResponse]);

  /**
   * Callback to handle resetting the entire assessment.
   * This is passed down to be used by a confirmation modal or button.
   */
  const handleResetAssessment = useCallback(() => {
    // In a real app, you'd likely show a confirmation modal first.
    if (window.confirm('Are you sure you want to reset all progress for this assessment? This action cannot be undone.')) {
      resetAssessment();
    }
  }, [resetAssessment]);

  // --- Render Logic ---

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner size="lg" message="Loading Standards & Frameworks..." />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorDisplay
        title="Failed to Load Framework Data"
        message={error.message || 'An unexpected error occurred. Please try refreshing the page.'}
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <div className="fade-in h-full flex flex-col">
      {/* 
        The StandardsFrameworksView organism is the main presentational component.
        It receives all necessary data and functions as props, keeping it decoupled
        from the application's business logic and data fetching concerns.
      */}
      <StandardsFrameworksView
        framework={framework}
        assessment={assessment}
        scores={scores}
        onUpdateResponse={handleUpdateResponse}
        onReset={handleResetAssessment}
      />
    </div>
  );
};

export default StandardsFrameworksPage;
