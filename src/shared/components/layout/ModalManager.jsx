// src/components/layout/ModalManager.jsx
import React from 'react';
import Modal from '../ui/Modal';
import EditRequirementModal from '../modals/EditRequirementModal';
import ViewRequirementModal from '../modals/ViewRequirementModal';
import CSVUploadModal from '../modals/CSVUploadModal';
import PurgeConfirmationModal from '../modals/PurgeConfirmationModal';
import NewCapabilityModal from '../modals/NewCapabilityModal';

const ModalManager = ({ 
  modal,
  ui,
  onCloseModal,
  onToggleModal,
  updateRequirement,
  handleCreateCapability,
  handleUploadCSV,
  handlePurgeData,
  openEditModal
}) => {
  return (
    <>
      {/* Edit/View Requirement Modal */}
      <Modal
        isOpen={modal.isOpen && !!modal.selectedRequirement}
        onClose={onCloseModal}
        title={modal.editMode ? 'Edit Requirement' : 'View Requirement'}
        size={modal.editMode ? "xl" : "lg"}
        closeOnBackdropClick={!modal.editMode} // Prevent accidental closure when editing
      >
        {modal.selectedRequirement && (
          modal.editMode ? (
            <EditRequirementModal 
              requirement={modal.selectedRequirement} 
              onClose={onCloseModal}
              onSave={updateRequirement}
            />
          ) : (
            <ViewRequirementModal
              requirement={modal.selectedRequirement}
              onClose={onCloseModal}
              onEdit={openEditModal}
            />
          )
        )}
      </Modal>

      {/* New Capability Modal */}
      <Modal
        isOpen={ui.showNewCapabilityModal}
        onClose={() => onToggleModal('showNewCapabilityModal')}
        title="Create New Capability"
        size="md"
      >
        <NewCapabilityModal 
          onClose={() => onToggleModal('showNewCapabilityModal')}
          onSave={handleCreateCapability}
        />
      </Modal>

      {/* CSV Upload Modal */}
      <Modal
        isOpen={ui.showUploadModal}
        onClose={() => onToggleModal('showUploadModal')}
        title="Upload CSV Data"
        size="md"
      >
        <CSVUploadModal 
          onClose={() => onToggleModal('showUploadModal')}
          onUpload={handleUploadCSV}
        />
      </Modal>

      {/* Purge Confirmation Modal */}
      <Modal
        isOpen={ui.showPurgeModal}
        onClose={() => onToggleModal('showPurgeModal')}
        title="Confirm Data Purge"
        size="sm"
        closeOnBackdropClick={false} // Prevent accidental data loss
      >
        <PurgeConfirmationModal 
          onClose={() => onToggleModal('showPurgeModal')}
          onConfirm={handlePurgeData}
        />
      </Modal>

      {/* Future modals can be added here */}
      {/* Settings Modal */}
      {ui.showSettingsModal && (
        <Modal
          isOpen={ui.showSettingsModal}
          onClose={() => onToggleModal('showSettingsModal')}
          title="Settings"
          size="lg"
        >
          {/* Settings content */}
          <div className="p-6">
            <p className="text-gray-600">Settings modal content goes here...</p>
          </div>
        </Modal>
      )}

      {/* Help Modal */}
      {ui.showHelpModal && (
        <Modal
          isOpen={ui.showHelpModal}
          onClose={() => onToggleModal('showHelpModal')}
          title="Help & Documentation"
          size="lg"
        >
          {/* Help content */}
          <div className="p-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Keyboard Shortcuts</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Open search:</span>
                    <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">⌘ + K</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Close modals:</span>
                    <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Escape</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Overview:</span>
                    <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">⌘ + 1</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Requirements:</span>
                    <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">⌘ + 3</kbd>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Getting Started</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Use the Overview to see high-level statistics</li>
                  <li>• Manage requirements in the Requirements section</li>
                  <li>• Track capabilities and their progress</li>
                  <li>• Export data using the Export CSV function</li>
                </ul>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

export default ModalManager;