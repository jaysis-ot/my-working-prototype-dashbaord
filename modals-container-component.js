// src/components/modals/ModalsContainer.jsx
import React from 'react';
import Modal from '../ui/Modal';
import CompanyProfileSystem from '../profile/CompanyProfileSystem';
import ThreatSettings from '../threats/ThreatSettings';
import EditRequirementModal from './EditRequirementModal';
import ViewRequirementModal from './ViewRequirementModal';
import NewCapabilityModal from './NewCapabilityModal';
import CSVUploadModal from './CSVUploadModal';
import PurgeConfirmationModal from './PurgeConfirmationModal';

/**
 * Modals Container Component
 * 
 * Centralized container for managing all modal dialogs in the dashboard.
 * This component handles the rendering of all modals based on the application state,
 * ensuring consistent modal behavior and preventing modal management code 
 * from being scattered throughout the application.
 * 
 * Features:
 * - Centralized modal state management
 * - Consistent modal sizing and behavior
 * - Proper z-index layering
 * - Keyboard navigation and accessibility
 * - Clean separation of concerns
 */
const ModalsContainer = ({
  state,
  dispatch,
  currentTheme,
  companyProfile,
  data: { 
    requirements = [], 
    capabilities = [], 
    filteredRequirements = [],
    pcdData = null 
  },
  handlers: {
    handleProfileUpdate,
    handleThreatSettingsSave,
    handleUploadCSV,
    handlePurgeData,
    handleCreateCapability,
    handleUpdateRequirement
  } = {}
}) => {

  // Get current threat settings from localStorage
  const getCurrentThreatSettings = () => {
    try {
      const saved = localStorage.getItem('threatSettings');
      return saved ? JSON.parse(saved) : {};
    } catch (error) {
      console.warn('Failed to load threat settings:', error);
      return {};
    }
  };

  return (
    <>
      {/* Company Profile Modal */}
      <Modal
        isOpen={state.ui.showCompanyProfileModal}
        onClose={() => dispatch({ type: 'TOGGLE_COMPANY_PROFILE_MODAL' })}
        title="Company Profile"
        size="xl"
        closeOnBackdropClick={true}
      >
        <CompanyProfileSystem 
          onProfileUpdate={handleProfileUpdate}
          existingProfile={companyProfile}
          embedded={true}
        />
      </Modal>

      {/* Threat Settings Modal */}
      <Modal
        isOpen={state.ui.showThreatSettingsModal}
        onClose={() => dispatch({ type: 'TOGGLE_THREAT_SETTINGS_MODAL' })}
        title="Threat Management Settings"
        size="full"
        closeOnBackdropClick={false}
      >
        <ThreatSettings
          onClose={() => dispatch({ type: 'TOGGLE_THREAT_SETTINGS_MODAL' })}
          onSave={handleThreatSettingsSave}
          existingCompanyProfile={companyProfile}
          currentSettings={getCurrentThreatSettings()}
        />
      </Modal>

      {/* View/Edit Requirement Modal */}
      <Modal
        isOpen={state.modal.isOpen && !!state.modal.selectedRequirement}
        onClose={() => dispatch({ type: 'CLOSE_MODAL' })}
        title={state.modal.editMode ? 'Edit Requirement' : 'View Requirement'}
        size={state.modal.editMode ? "xl" : "lg"}
        closeOnBackdropClick={!state.modal.editMode}
      >
        {state.modal.selectedRequirement && (
          state.modal.editMode ? (
            <EditRequirementModal 
              requirement={state.modal.selectedRequirement} 
              capabilities={capabilities}
              onClose={() => dispatch({ type: 'CLOSE_MODAL' })}
              onSave={handleUpdateRequirement}
            />
          ) : (
            <ViewRequirementModal
              requirement={state.modal.selectedRequirement}
              capabilities={capabilities}
              onClose={() => dispatch({ type: 'CLOSE_MODAL' })}
              onEdit={(requirement) => dispatch({ 
                type: 'OPEN_MODAL', 
                requirement, 
                editMode: true 
              })}
            />
          )
        )}
      </Modal>

      {/* New Capability Modal */}
      <Modal
        isOpen={state.ui.showNewCapabilityModal}
        onClose={() => dispatch({ type: 'TOGGLE_NEW_CAPABILITY_MODAL' })}
        title="Create New Capability"
        size="lg"
        closeOnBackdropClick={false}
      >
        <NewCapabilityModal 
          existingCapabilities={capabilities}
          onClose={() => dispatch({ type: 'TOGGLE_NEW_CAPABILITY_MODAL' })}
          onSave={handleCreateCapability}
        />
      </Modal>

      {/* CSV Upload Modal */}
      <Modal
        isOpen={state.ui.showUploadModal}
        onClose={() => dispatch({ type: 'TOGGLE_UPLOAD_MODAL' })}
        title="Upload CSV Data"
        size="lg"
        closeOnBackdropClick={false}
      >
        <CSVUploadModal 
          existingRequirements={requirements}
          capabilities={capabilities}
          onClose={() => dispatch({ type: 'TOGGLE_UPLOAD_MODAL' })}
          onUpload={handleUploadCSV}
        />
      </Modal>

      {/* Purge Confirmation Modal */}
      <Modal
        isOpen={state.ui.showPurgeModal}
        onClose={() => dispatch({ type: 'TOGGLE_PURGE_MODAL' })}
        title="Confirm Data Purge"
        size="sm"
        closeOnBackdropClick={false}
      >
        <PurgeConfirmationModal 
          requirementsCount={requirements.length}
          capabilitiesCount={capabilities.length}
          onClose={() => dispatch({ type: 'TOGGLE_PURGE_MODAL' })}
          onConfirm={handlePurgeData}
        />
      </Modal>

      {/* Future modals can be added here */}
      {/* 
      <Modal
        isOpen={state.ui.showSettingsModal}
        onClose={() => dispatch({ type: 'TOGGLE_SETTINGS_MODAL' })}
        title="Dashboard Settings"
        size="md"
      >
        <SettingsModal {...props} />
      </Modal>
      */}
    </>
  );
};

export default ModalsContainer;