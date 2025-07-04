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
import { dashboardActions } from '../../store/dashboardActions';

const ModalsContainer = ({
  state,
  dispatch,
  data: { requirements, capabilities, companyProfile },
  handlers: {
    handleProfileUpdate,
    handleThreatSettingsSave,
    handleUploadCSV,
    handlePurgeData,
    handleCreateCapability,
    handleUpdateRequirement
  }
}) => {
  return (
    <>
      {/* Company Profile Modal */}
      <Modal
        isOpen={state.ui.showCompanyProfileModal}
        onClose={() => dispatch(dashboardActions.toggleCompanyProfileModal())}
        title="Company Profile"
        size="xl"
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
        onClose={() => dispatch(dashboardActions.toggleThreatSettingsModal())}
        title="Threat Management Settings"
        size="full"
        closeOnBackdropClick={false}
      >
        <ThreatSettings
          onClose={() => dispatch(dashboardActions.toggleThreatSettingsModal())}
          onSave={handleThreatSettingsSave}
          existingCompanyProfile={companyProfile}
          currentSettings={(() => {
            try {
              const saved = localStorage.getItem('threatSettings');
              return saved ? JSON.parse(saved) : {};
            } catch {
              return {};
            }
          })()}
        />
      </Modal>

      {/* Edit/View Requirement Modal */}
      <Modal
        isOpen={state.modal.isOpen && !!state.modal.selectedRequirement}
        onClose={() => dispatch(dashboardActions.closeModal())}
        title={state.modal.editMode ? 'Edit Requirement' : 'View Requirement'}
        size={state.modal.editMode ? "xl" : "lg"}
        closeOnBackdropClick={!state.modal.editMode}
      >
        {state.modal.selectedRequirement && (
          state.modal.editMode ? (
            <EditRequirementModal 
              requirement={state.modal.selectedRequirement} 
              onClose={() => dispatch(dashboardActions.closeModal())}
              onSave={handleUpdateRequirement}
            />
          ) : (
            <ViewRequirementModal
              requirement={state.modal.selectedRequirement}
              onClose={() => dispatch(dashboardActions.closeModal())}
              onEdit={(requirement) => dispatch(dashboardActions.openModal(requirement, true))}
            />
          )
        )}
      </Modal>

      {/* New Capability Modal */}
      <Modal
        isOpen={state.ui.showNewCapabilityModal}
        onClose={() => dispatch(dashboardActions.toggleNewCapabilityModal())}
        title="Create New Capability"
        size="md"
      >
        <NewCapabilityModal 
          onClose={() => dispatch(dashboardActions.toggleNewCapabilityModal())}
          onSave={handleCreateCapability}
        />
      </Modal>

      {/* CSV Upload Modal */}
      <Modal
        isOpen={state.ui.showUploadModal}
        onClose={() => dispatch(dashboardActions.toggleUploadModal())}
        title="Upload CSV Data"
        size="md"
      >
        <CSVUploadModal 
          onClose={() => dispatch(dashboardActions.toggleUploadModal())}
          onUpload={handleUploadCSV}
        />
      </Modal>

      {/* Purge Confirmation Modal */}
      <Modal
        isOpen={state.ui.showPurgeModal}
        onClose={() => dispatch(dashboardActions.togglePurgeModal())}
        title="Confirm Data Purge"
        size="sm"
        closeOnBackdropClick={false}
      >
        <PurgeConfirmationModal 
          onClose={() => dispatch(dashboardActions.togglePurgeModal())}
          onConfirm={handlePurgeData}
        />
      </Modal>
    </>
  );
};

export default ModalsContainer;