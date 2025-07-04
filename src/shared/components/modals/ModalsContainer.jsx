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
 * Includes defensive checks to prevent undefined state errors.
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
  } = {},
  handlers: {
    handleProfileUpdate,
    handleThreatSettingsSave,
    handleUploadCSV,
    handlePurgeData,
    handleCreateCapability,
    handleUpdateRequirement
  } = {}
}) => {

  // ✅ DEFENSIVE CHECKS: Ensure state structure exists
  if (!state) {
    console.error('ModalsContainer: state is undefined');
    return null;
  }

  // ✅ Ensure UI state exists with safe defaults
  const uiState = state.ui || {};
  
  // ✅ Ensure modal state exists with safe defaults
  const modalState = state.modal || {
    isOpen: false,
    selectedRequirement: null,
    editMode: false
  };

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

  // ✅ Safe dispatch wrapper
  const safeDispatch = (action) => {
    if (typeof dispatch === 'function') {
      dispatch(action);
    } else {
      console.error('ModalsContainer: dispatch is not a function', action);
    }
  };

  return (
    <>
      {/* Company Profile Modal */}
      <Modal
        isOpen={Boolean(uiState.showCompanyProfileModal)}
        onClose={() => safeDispatch({ type: 'TOGGLE_COMPANY_PROFILE_MODAL' })}
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
        isOpen={Boolean(uiState.showThreatSettingsModal)}
        onClose={() => safeDispatch({ type: 'TOGGLE_THREAT_SETTINGS_MODAL' })}
        title="Threat Management Settings"
        size="full"
        closeOnBackdropClick={false}
      >
        <ThreatSettings
          onClose={() => safeDispatch({ type: 'TOGGLE_THREAT_SETTINGS_MODAL' })}
          onSave={handleThreatSettingsSave}
          existingCompanyProfile={companyProfile}
          currentSettings={getCurrentThreatSettings()}
        />
      </Modal>

      {/* ✅ FIXED: View/Edit Requirement Modal with safe state access */}
      <Modal
        isOpen={Boolean(modalState.isOpen && modalState.selectedRequirement)}
        onClose={() => safeDispatch({ type: 'CLOSE_MODAL' })}
        title={modalState.editMode ? 'Edit Requirement' : 'View Requirement'}
        size={modalState.editMode ? "xl" : "lg"}
        closeOnBackdropClick={!modalState.editMode}
      >
        {modalState.selectedRequirement && (
          modalState.editMode ? (
            <EditRequirementModal
              requirement={modalState.selectedRequirement}
              capabilities={capabilities}
              onSave={(updatedRequirement) => {
                handleUpdateRequirement?.(updatedRequirement);
                safeDispatch({ type: 'CLOSE_MODAL' });
              }}
              onCancel={() => safeDispatch({ type: 'CLOSE_MODAL' })}
            />
          ) : (
            <ViewRequirementModal
              requirement={modalState.selectedRequirement}
              onEdit={() => safeDispatch({ 
                type: 'OPEN_MODAL', 
                requirement: modalState.selectedRequirement, 
                editMode: true 
              })}
              onClose={() => safeDispatch({ type: 'CLOSE_MODAL' })}
            />
          )
        )}
      </Modal>

      {/* CSV Upload Modal */}
      <Modal
        isOpen={Boolean(uiState.showUploadModal)}
        onClose={() => safeDispatch({ type: 'TOGGLE_UPLOAD_MODAL' })}
        title="Upload CSV Data"
        size="lg"
      >
        <CSVUploadModal
          onUpload={handleUploadCSV}
          onClose={() => safeDispatch({ type: 'TOGGLE_UPLOAD_MODAL' })}
        />
      </Modal>

      {/* Data Purge Confirmation Modal */}
      <Modal
        isOpen={Boolean(uiState.showPurgeModal)}
        onClose={() => safeDispatch({ type: 'TOGGLE_PURGE_MODAL' })}
        title="Confirm Data Purge"
        size="md"
      >
        <PurgeConfirmationModal
          onConfirm={() => {
            handlePurgeData?.();
            safeDispatch({ type: 'TOGGLE_PURGE_MODAL' });
          }}
          onCancel={() => safeDispatch({ type: 'TOGGLE_PURGE_MODAL' })}
        />
      </Modal>

      {/* New Capability Modal */}
      <Modal
        isOpen={Boolean(uiState.showNewCapabilityModal)}
        onClose={() => safeDispatch({ type: 'TOGGLE_NEW_CAPABILITY_MODAL' })}
        title="Create New Capability"
        size="lg"
      >
        <NewCapabilityModal
          onSave={(newCapability) => {
            handleCreateCapability?.(newCapability);
            safeDispatch({ type: 'TOGGLE_NEW_CAPABILITY_MODAL' });
          }}
          onClose={() => safeDispatch({ type: 'TOGGLE_NEW_CAPABILITY_MODAL' })}
        />
      </Modal>
    </>
  );
};

export default ModalsContainer;