// Modal Integration Examples
// Shows how to use the Modal system with the dashboard state management

// =============================================================================
// 1. MAIN DASHBOARD INTEGRATION
// =============================================================================

// src/components/Dashboard.jsx
import React from 'react';
import ModalProvider from './common/ModalProvider';
import DashboardContent from './DashboardContent';

const Dashboard = () => {
  return (
    <ModalProvider>
      <DashboardContent />
    </ModalProvider>
  );
};

// =============================================================================
// 2. USING MODALS IN COMPONENTS
// =============================================================================

// Example: Requirements Table with modal integration
import React from 'react';
import { useDashboardState } from '../hooks/useDashboardState';

const RequirementsTable = ({ requirements }) => {
  const { actions } = useDashboardState();

  const handleRowClick = (requirement) => {
    // Opens the requirement modal via state management
    actions.openModal(requirement, false); // false = view mode
  };

  const handleEditClick = (requirement, e) => {
    e.stopPropagation();
    // Opens the requirement modal in edit mode
    actions.openModal(requirement, true); // true = edit mode
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <tbody className="bg-white divide-y divide-gray-200">
          {requirements.map((requirement) => (
            <tr
              key={requirement.id}
              onClick={() => handleRowClick(requirement)}
              className="hover:bg-gray-50 cursor-pointer"
            >
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {requirement.description}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <button
                  onClick={(e) => handleEditClick(requirement, e)}
                  className="text-blue-600 hover:text-blue-900"
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// =============================================================================
// 3. HEADER ACTIONS WITH MODALS
// =============================================================================

// Example: Dashboard Header with action buttons
import React from 'react';
import { Upload, Plus, Settings } from 'lucide-react';
import { useDashboardState } from '../hooks/useDashboardState';

const DashboardHeader = () => {
  const { actions } = useDashboardState();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <h1 className="text-2xl font-bold text-gray-900">Risk Dashboard</h1>
          
          <div className="flex items-center gap-3">
            <button
              onClick={actions.toggleUploadModal}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Data
            </button>
            
            <button
              onClick={actions.toggleNewCapabilityModal}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Capability
            </button>
            
            <button
              onClick={actions.toggleThreatSettingsModal}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

// =============================================================================
// 4. USING CONFIRMATION MODALS
// =============================================================================

// Example: Delete action with confirmation
import React from 'react';
import { useConfirmation } from '../components/common/Modal';

const CapabilityCard = ({ capability, onDelete }) => {
  const { confirm, ConfirmationModal } = useConfirmation();

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: 'Delete Capability',
      message: `Are you sure you want to delete "${capability.name}"? This action cannot be undone.`,
      destructive: true
    });

    if (confirmed) {
      onDelete(capability.id);
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900">{capability.name}</h3>
        <p className="text-sm text-gray-600 mt-2">{capability.description}</p>
        
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleDelete}
            className="text-red-600 hover:text-red-900 text-sm font-medium"
          >
            Delete
          </button>
        </div>
      </div>
      
      <ConfirmationModal />
    </>
  );
};

// =============================================================================
// 5. CUSTOM MODAL HOOKS
// =============================================================================

// Custom hook for managing requirement modal
import { useDashboardState } from '../hooks/useDashboardState';

export const useRequirementModal = () => {
  const { state, actions } = useDashboardState();

  const openRequirement = (requirement, editMode = false) => {
    actions.openModal(requirement, editMode);
  };

  const closeRequirement = () => {
    actions.closeModal();
  };

  const toggleEditMode = () => {
    if (state.modal.selectedRequirement) {
      actions.openModal(state.modal.selectedRequirement, !state.modal.editMode);
    }
  };

  return {
    isOpen: state.modal.isOpen,
    requirement: state.modal.selectedRequirement,
    editMode: state.modal.editMode,
    openRequirement,
    closeRequirement,
    toggleEditMode
  };
};

// Usage in component:
const RequirementsList = () => {
  const { openRequirement } = useRequirementModal();

  return (
    <div>
      {requirements.map(req => (
        <div 
          key={req.id}
          onClick={() => openRequirement(req)}
          className="cursor-pointer p-4 hover:bg-gray-50"
        >
          {req.description}
        </div>
      ))}
    </div>
  );
};

// =============================================================================
// 6. PROGRAMMATIC MODAL CONTROL
// =============================================================================

// Advanced modal control with state management
const DashboardController = () => {
  const { state, actions } = useDashboardState();

  // Auto-open profile setup for new users
  React.useEffect(() => {
    const isNewUser = !localStorage.getItem('profileSetupComplete');
    if (isNewUser) {
      actions.setCompanyProfileSetup(true);
    }
  }, [actions]);

  // Handle navigation-based modal opening
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const modalParam = urlParams.get('modal');
    
    switch (modalParam) {
      case 'upload':
        actions.toggleUploadModal();
        break;
      case 'new-capability':
        actions.toggleNewCapabilityModal();
        break;
      case 'settings':
        actions.toggleThreatSettingsModal();
        break;
    }
  }, [actions]);

  // Auto-close modals on route change
  React.useEffect(() => {
    const closeAllModals = () => {
      if (state.modal.isOpen) actions.closeModal();
      if (state.ui.showUploadModal) actions.toggleUploadModal();
      // ... close other modals
    };

    window.addEventListener('popstate', closeAllModals);
    return () => window.removeEventListener('popstate', closeAllModals);
  }, [state, actions]);

  return null; // This is a controller component
};

// =============================================================================
// 7. MODAL STATE PERSISTENCE
// =============================================================================

// Save modal preferences to localStorage
const ModalStateManager = () => {
  const { state } = useDashboardState();

  React.useEffect(() => {
    const modalPreferences = {
      showProfileSetupOnStartup: !state.ui.showProfileSetup,
      lastModalSize: state.modal.size || 'medium'
    };
    
    localStorage.setItem('modalPreferences', JSON.stringify(modalPreferences));
  }, [state.ui.showProfileSetup, state.modal.size]);

  return null;
};

// =============================================================================
// 8. RESPONSIVE MODAL BEHAVIOR
// =============================================================================

// Hook for responsive modal sizing
export const useResponsiveModal = () => {
  const { state } = useDashboardState();
  const [modalSize, setModalSize] = React.useState(MODAL_SIZES.MEDIUM);

  React.useEffect(() => {
    if (state.ui.isMobile) {
      setModalSize(MODAL_SIZES.FULLSCREEN);
    } else if (state.ui.isTablet) {
      setModalSize(MODAL_SIZES.LARGE);
    } else {
      setModalSize(MODAL_SIZES.MEDIUM);
    }
  }, [state.ui.isMobile, state.ui.isTablet]);

  return modalSize;
};

// Usage:
const ResponsiveModal = ({ children, ...props }) => {
  const responsiveSize = useResponsiveModal();
  
  return (
    <Modal size={responsiveSize} {...props}>
      {children}
    </Modal>
  );
};

// =============================================================================
// 9. MODAL ANALYTICS INTEGRATION
// =============================================================================

// Track modal interactions
const ModalAnalytics = () => {
  const { state, actions } = useDashboardState();

  React.useEffect(() => {
    if (state.modal.isOpen && state.modal.selectedRequirement) {
      actions.trackUserAction('modalOpened', {
        modalType: 'requirement',
        requirementId: state.modal.selectedRequirement.id,
        editMode: state.modal.editMode
      });
    }
  }, [state.modal.isOpen, state.modal.selectedRequirement, actions]);

  React.useEffect(() => {
    if (state.ui.showUploadModal) {
      actions.trackUserAction('modalOpened', { modalType: 'upload' });
    }
  }, [state.ui.showUploadModal, actions]);

  return null;
};

// =============================================================================
// 10. COMPLETE INTEGRATION EXAMPLE
// =============================================================================

// Complete dashboard with modal integration
const CompleteDashboard = () => {
  return (
    <ModalProvider>
      <DashboardController />
      <ModalStateManager />
      <ModalAnalytics />
      
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader />
        
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <RequirementsList />
          <CapabilityGrid />
        </main>
      </div>
    </ModalProvider>
  );
};

export default CompleteDashboard;