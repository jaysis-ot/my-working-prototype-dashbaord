import React, { useState } from 'react';
import { useDashboardUI } from '../../contexts/DashboardUIContext';
import { useCapabilitiesData } from '../../hooks/useCapabilitiesData';
import { useRequirementsData } from '../../hooks/useRequirementsData';
import CapabilitiesView from '../organisms/CapabilitiesView';
import LoadingSpinner from '../atoms/LoadingSpinner';
import ErrorDisplay from '../molecules/ErrorDisplay';
import CapabilityDetailsModal from '../molecules/CapabilityDetailsModal';
import EditCapabilityModal from '../molecules/EditCapabilityModal';

/**
 * CapabilitiesPage Component
 * 
 * This is the main container component for the Capabilities section of the dashboard.
 * It follows the "Page" pattern in atomic design. Its responsibilities include:
 * - Fetching and managing data related to capabilities and requirements via custom hooks.
 * - Handling loading and error states for the data.
 * - Passing data and event handlers to the presentational `CapabilitiesView` organism.
 * - Orchestrating user interactions, such as selecting a capability or creating a new one.
 */
const CapabilitiesPage = () => {
  const { setViewMode, toggleModal } = useDashboardUI();
  
  // Modal state
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedCapability, setSelectedCapability] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [capabilityToEdit, setCapabilityToEdit] = useState(null);

  // --- Data Fetching ---
  const {
    capabilities,
    loading: capabilitiesLoading,
    error: capabilitiesError,
    updateCapability
  } = useCapabilitiesData();
  
  const {
    requirements,
    loading: requirementsLoading,
    error: requirementsError
  } = useRequirementsData();
  
  const loading = capabilitiesLoading || requirementsLoading;
  const error = capabilitiesError || requirementsError;

  // --- Event Handlers ---

  /**
   * Handles the selection of a capability card.
   * Opens the capability details modal.
   * @param {string} capabilityId - The ID of the selected capability.
   */
  const handleSelectCapability = (capabilityId) => {
    const capability = capabilities.find(c => c.id === capabilityId);
    if (capability) {
      setSelectedCapability(capability);
      setIsDetailsModalOpen(true);
    }
  };

  /**
   * Navigates to the requirements view filtered by the selected capability.
   * @param {string} capabilityId - The ID of the capability to filter requirements by.
   */
  const handleViewRequirements = (capabilityId) => {
    console.log(`Navigating to requirements for capability: ${capabilityId}`);
    // Set filter context for requirements
    // TODO: Implement a requirements filter context
    
    // Navigate to requirements page
    setViewMode('requirements');
    setIsDetailsModalOpen(false);
  };
  
  /**
   * Handles the editing of a capability.
   * @param {Object} capability - The capability to edit.
   */
  const handleEditCapability = (capability) => {
    setIsDetailsModalOpen(false);
    setCapabilityToEdit(capability);
    setIsEditModalOpen(true);
  };

  /**
   * Closes the Edit Capability modal and resets local state.
   */
  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setCapabilityToEdit(null);
  };

  /**
   * Handles the action to create a new capability.
   * This triggers a modal, which is a UI state change managed by the UI context.
   */
  const handleCreateCapability = () => {
    // Open the EditCapabilityModal in "create" mode (no existing capability)
    setCapabilityToEdit(null);
    setIsEditModalOpen(true);
  };

  // --- Render Logic ---

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner size="lg" message="Loading capabilities..." />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorDisplay
        title="Failed to Load Capabilities"
        message={error.message || 'An unexpected error occurred. Please try refreshing the page.'}
      />
    );
  }

  return (
    <div className="fade-in">
      {/* 
        The CapabilitiesView organism will be the main presentational component.
        It receives all necessary data and functions as props, keeping it decoupled
        from the application's business logic.
      */}
      <CapabilitiesView
        capabilities={capabilities}
        requirements={requirements}
        onSelectCapability={handleSelectCapability}
        onCreateCapability={handleCreateCapability}
      />
      
      {/* Capability Details Modal */}
      {isDetailsModalOpen && selectedCapability && (
        <CapabilityDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          capability={selectedCapability}
          requirements={requirements}
          onViewRequirements={handleViewRequirements}
          onEditCapability={handleEditCapability}
        />
      )}

      {/* Edit Capability Modal */}
      {isEditModalOpen && (
        <EditCapabilityModal
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          capability={capabilityToEdit}
        />
      )}
    </div>
  );
};

export default CapabilitiesPage;