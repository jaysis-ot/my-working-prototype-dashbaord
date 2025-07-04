// src/components/common/ModalProvider.jsx
import React from 'react';
import Modal, { 
  ConfirmationModal, 
  AlertModal, 
  FormModal, 
  ViewerModal,
  MODAL_SIZES,
  ALERT_TYPES 
} from './Modal';
import { useDashboardState } from '../../hooks/useDashboardState';

/**
 * Modal Provider Component
 * 
 * Integrates the universal Modal system with the dashboard state management.
 * Handles all modal types defined in the dashboard actions and provides
 * a centralized way to manage modals across the application.
 * 
 * Features:
 * - Integration with dashboard state management
 * - Centralized modal rendering
 * - Type-specific modal configurations
 * - Automatic state synchronization
 * - Support for all dashboard modal types
 */

// =============================================================================
// MODAL PROVIDER COMPONENT
// =============================================================================

const ModalProvider = ({ children }) => {
  const { state, actions } = useDashboardState();
  
  const {
    modal,
    ui: {
      showUploadModal,
      showPurgeModal,
      showNewCapabilityModal,
      showCompanyProfileModal,
      showThreatSettingsModal,
      showProfileSetup
    }
  } = state;

  // =============================================================================
  // MAIN REQUIREMENT MODAL
  // =============================================================================

  const renderRequirementModal = () => {
    if (!modal.isOpen || !modal.selectedRequirement) return null;

    return (
      <ViewerModal
        isOpen={modal.isOpen}
        onClose={actions.closeModal}
        title={modal.editMode ? 'Edit Requirement' : 'Requirement Details'}
        size={MODAL_SIZES.LARGE}
      >
        <RequirementModalContent 
          requirement={modal.selectedRequirement}
          editMode={modal.editMode}
          onSave={(data) => {
            // Handle save logic here
            console.log('Saving requirement:', data);
            actions.closeModal();
          }}
        />
      </ViewerModal>
    );
  };

  // =============================================================================
  // SPECIALIZED MODALS
  // =============================================================================

  const renderUploadModal = () => (
    <FormModal
      isOpen={showUploadModal}
      onClose={actions.toggleUploadModal}
      title="Upload Data"
      size={MODAL_SIZES.MEDIUM}
      onSubmit={(formData) => {
        // Handle upload logic
        console.log('Upload data:', formData);
        actions.toggleUploadModal();
      }}
    >
      <UploadModalContent />
    </FormModal>
  );

  const renderPurgeModal = () => (
    <ConfirmationModal
      isOpen={showPurgeModal}
      onClose={actions.togglePurgeModal}
      onConfirm={() => {
        // Handle purge logic
        console.log('Purging data...');
        actions.togglePurgeModal();
      }}
      title="Purge Data"
      message="Are you sure you want to purge all data? This action cannot be undone."
      confirmText="Purge"
      cancelText="Cancel"
      destructive={true}
    />
  );

  const renderNewCapabilityModal = () => (
    <FormModal
      isOpen={showNewCapabilityModal}
      onClose={actions.toggleNewCapabilityModal}
      title="Add New Capability"
      size={MODAL_SIZES.MEDIUM}
      onSubmit={(formData) => {
        // Handle new capability logic
        console.log('New capability:', formData);
        actions.toggleNewCapabilityModal();
      }}
    >
      <NewCapabilityModalContent />
    </FormModal>
  );

  const renderCompanyProfileModal = () => (
    <FormModal
      isOpen={showCompanyProfileModal}
      onClose={actions.toggleCompanyProfileModal}
      title="Company Profile"
      size={MODAL_SIZES.LARGE}
      onSubmit={(formData) => {
        // Handle company profile logic
        console.log('Company profile:', formData);
        actions.toggleCompanyProfileModal();
      }}
    >
      <CompanyProfileModalContent />
    </FormModal>
  );

  const renderThreatSettingsModal = () => (
    <Modal
      isOpen={showThreatSettingsModal}
      onClose={actions.toggleThreatSettingsModal}
      title="Threat Intelligence Settings"
      size={MODAL_SIZES.LARGE}
    >
      <ThreatSettingsModalContent />
    </Modal>
  );

  const renderProfileSetupModal = () => (
    <Modal
      isOpen={showProfileSetup}
      onClose={() => actions.setCompanyProfileSetup(false)}
      title="Welcome - Set Up Your Profile"
      size={MODAL_SIZES.LARGE}
      closeOnBackdropClick={false}
      closeOnEscape={false}
    >
      <ProfileSetupModalContent 
        onComplete={() => actions.setCompanyProfileSetup(false)}
      />
    </Modal>
  );

  // =============================================================================
  // RENDER
  // =============================================================================

  return (
    <>
      {children}
      
      {/* Main modals */}
      {renderRequirementModal()}
      
      {/* Specialized modals */}
      {renderUploadModal()}
      {renderPurgeModal()}
      {renderNewCapabilityModal()}
      {renderCompanyProfileModal()}
      {renderThreatSettingsModal()}
      {renderProfileSetupModal()}
    </>
  );
};

// =============================================================================
// MODAL CONTENT COMPONENTS
// =============================================================================

/**
 * Requirement Modal Content
 */
const RequirementModalContent = ({ requirement, editMode, onSave }) => {
  const [formData, setFormData] = React.useState(requirement);

  if (editMode) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={formData.status || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Status</option>
              <option value="Not Started">Not Started</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="On Hold">On Hold</option>
            </select>
          </div>
        </div>
        
        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            onClick={() => onSave(formData)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Description</h3>
            <p className="mt-1 text-gray-900">{requirement.description}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Status</h3>
            <span className={`mt-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
              requirement.status === 'Completed' 
                ? 'bg-green-100 text-green-800'
                : requirement.status === 'In Progress'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {requirement.status}
            </span>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Capability</h3>
            <p className="mt-1 text-gray-900">{requirement.capability}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Business Value</h3>
            <p className="mt-1 text-gray-900">{requirement.businessValue}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Upload Modal Content
 */
const UploadModalContent = () => {
  const [dragActive, setDragActive] = React.useState(false);
  const [files, setFiles] = React.useState([]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles(droppedFiles);
  };

  return (
    <div className="space-y-6">
      <div
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${dragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
        `}
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
      >
        <div className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          
          <div>
            <p className="text-lg font-medium text-gray-900">Drop files here</p>
            <p className="text-sm text-gray-500">or click to browse</p>
          </div>
          
          <input
            type="file"
            multiple
            className="hidden"
            onChange={(e) => setFiles(Array.from(e.target.files))}
          />
        </div>
      </div>
      
      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900">Selected Files:</h4>
          {files.map((file, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <span className="text-sm text-gray-700">{file.name}</span>
              <span className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * New Capability Modal Content
 */
const NewCapabilityModalContent = () => {
  const [formData, setFormData] = React.useState({
    name: '',
    description: '',
    area: '',
    priority: 'Medium'
  });

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Capability Name
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter capability name"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          rows={3}
          placeholder="Describe this capability"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Area
          </label>
          <select
            value={formData.area}
            onChange={(e) => setFormData(prev => ({ ...prev, area: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Area</option>
            <option value="Security">Security</option>
            <option value="Operations">Operations</option>
            <option value="Compliance">Compliance</option>
            <option value="Risk Management">Risk Management</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Priority
          </label>
          <select
            value={formData.priority}
            onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
        </div>
      </div>
    </div>
  );
};

/**
 * Company Profile Modal Content
 */
const CompanyProfileModalContent = () => {
  const [formData, setFormData] = React.useState({
    companyName: '',
    industry: '',
    size: '',
    region: ''
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Company Name
          </label>
          <input
            type="text"
            value={formData.companyName}
            onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Industry
          </label>
          <select
            value={formData.industry}
            onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Industry</option>
            <option value="Technology">Technology</option>
            <option value="Financial Services">Financial Services</option>
            <option value="Healthcare">Healthcare</option>
            <option value="Manufacturing">Manufacturing</option>
            <option value="Energy">Energy</option>
            <option value="Other">Other</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Company Size
          </label>
          <select
            value={formData.size}
            onChange={(e) => setFormData(prev => ({ ...prev, size: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Size</option>
            <option value="1-10">1-10 employees</option>
            <option value="11-50">11-50 employees</option>
            <option value="51-200">51-200 employees</option>
            <option value="201-1000">201-1000 employees</option>
            <option value="1000+">1000+ employees</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Region
          </label>
          <select
            value={formData.region}
            onChange={(e) => setFormData(prev => ({ ...prev, region: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Region</option>
            <option value="North America">North America</option>
            <option value="Europe">Europe</option>
            <option value="Asia Pacific">Asia Pacific</option>
            <option value="Latin America">Latin America</option>
            <option value="Middle East & Africa">Middle East & Africa</option>
          </select>
        </div>
      </div>
    </div>
  );
};

/**
 * Threat Settings Modal Content
 */
const ThreatSettingsModalContent = () => {
  const [settings, setSettings] = React.useState({
    enableThreatIntel: true,
    autoUpdate: false,
    sources: ['MITRE', 'NIST'],
    refreshInterval: '24'
  });

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Threat Intelligence</h3>
            <p className="text-sm text-gray-500">Configure threat intelligence sources and updates</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.enableThreatIntel}
              onChange={(e) => setSettings(prev => ({ ...prev, enableThreatIntel: e.target.checked }))}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data Sources
            </label>
            <div className="space-y-2">
              {['MITRE ATT&CK', 'NIST Cybersecurity Framework', 'CVE Database', 'Custom Sources'].map((source) => (
                <label key={source} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.sources.includes(source)}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setSettings(prev => ({
                        ...prev,
                        sources: checked 
                          ? [...prev.sources, source]
                          : prev.sources.filter(s => s !== source)
                      }));
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">{source}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Refresh Interval (hours)
            </label>
            <select
              value={settings.refreshInterval}
              onChange={(e) => setSettings(prev => ({ ...prev, refreshInterval: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="1">1 hour</option>
              <option value="6">6 hours</option>
              <option value="12">12 hours</option>
              <option value="24">24 hours</option>
              <option value="168">Weekly</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Profile Setup Modal Content
 */
const ProfileSetupModalContent = ({ onComplete }) => {
  const [step, setStep] = React.useState(1);
  const totalSteps = 3;

  const nextStep = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress indicator */}
      <div className="flex items-center justify-between">
        {[1, 2, 3].map((stepNum) => (
          <div
            key={stepNum}
            className={`
              flex items-center justify-center w-8 h-8 rounded-full
              ${step >= stepNum 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-600'
              }
            `}
          >
            {stepNum}
          </div>
        ))}
      </div>
      
      {/* Step content */}
      <div className="min-h-[300px]">
        {step === 1 && (
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">Welcome to Risk Dashboard</h2>
            <p className="text-gray-600">Let's get you set up with a personalized experience</p>
          </div>
        )}
        
        {step === 2 && <CompanyProfileModalContent />}
        
        {step === 3 && (
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">You're All Set!</h2>
            <p className="text-gray-600">Your dashboard is ready to use</p>
          </div>
        )}
      </div>
      
      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={() => setStep(Math.max(1, step - 1))}
          disabled={step === 1}
          className="px-4 py-2 border rounded-lg disabled:opacity-50"
        >
          Previous
        </button>
        
        <button
          onClick={nextStep}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {step === totalSteps ? 'Complete' : 'Next'}
        </button>
      </div>
    </div>
  );
};

export default ModalProvider;