import React from 'react';
import { useDashboardUI } from '../../contexts/DashboardUIContext';
import { useRequirementsData } from '../../hooks/useRequirementsData';
import RequirementModal from '../molecules/RequirementModal';

/**
 * ModalManager Component
 * 
 * This component manages the display of modals throughout the application.
 * It connects the UI context state with the appropriate modal components,
 * and handles the business logic for modal interactions.
 * 
 * Currently, it manages:
 * - Requirement viewing and editing modal
 * 
 * This centralized approach ensures consistent modal behavior across the app
 * and prevents prop drilling of modal state and handlers.
 */
const ModalManager = () => {
  // Get modal state and handlers from the dashboard UI context
  const { 
    modal: { isOpen, selectedRequirement, editMode },
    closeRequirementModal
  } = useDashboardUI();

  // Get requirement data manipulation functions
  const { updateRequirement } = useRequirementsData();

  // Handle saving requirement changes
  const handleSaveRequirement = (updatedRequirement) => {
    if (updatedRequirement && updatedRequirement.id) {
      updateRequirement(updatedRequirement.id, updatedRequirement);
    }
    closeRequirementModal();
  };

  return (
    <>
      {/* Requirement Modal */}
      {isOpen && selectedRequirement && (
        <RequirementModal
          isOpen={isOpen}
          onClose={closeRequirementModal}
          requirement={selectedRequirement}
          onSave={handleSaveRequirement}
          isEditing={editMode}
        />
      )}
      
      {/* Additional modals can be added here in the future */}
    </>
  );
};

export default ModalManager;
