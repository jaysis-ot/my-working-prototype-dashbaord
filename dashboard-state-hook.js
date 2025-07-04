// src/hooks/useDashboardState.js
import { useReducer, useEffect } from 'react';
import { useToast } from '../components/ui/Toast';
import { useCompanyProfile } from './useCompanyProfile';
import { useRequirementsData } from './useRequirementsData';
import { useCapabilitiesData } from './useCapabilitiesData';
import { usePCDData } from './usePCDData';
import { useFilteredRequirements } from './useFilteredRequirements';
import { useKeyboardShortcuts } from './useKeyboardShortcuts';
import { useResponsive } from './useResponsive';
import { dashboardReducer } from '../store/dashboardReducer';
import { initialState } from '../store/initialState';
import { dashboardActions } from '../store/dashboardActions';
import { generateCSV, downloadCSV } from '../utils/csvUtils';

export const useDashboardState = () => {
  const [state, dispatch] = useReducer(dashboardReducer, initialState);
  const { addToast } = useToast();

  // Data hooks
  const { profile: companyProfile, loading: profileLoading, saveProfile } = useCompanyProfile();
  const { 
    requirements, 
    loading, 
    error, 
    updateRequirement, 
    deleteRequirement, 
    addRequirement, 
    purgeAllData, 
    importFromCSV 
  } = useRequirementsData();
  const { capabilities, loading: capabilitiesLoading, addCapability } = useCapabilitiesData();
  const { pcdData, loading: pcdLoading, updatePCDData } = usePCDData();

  // Processed data
  const filteredRequirements = useFilteredRequirements(requirements, state.filters, state.searchTerm);

  // Custom hooks for behavior
  useKeyboardShortcuts(dispatch);
  useResponsive(state, dispatch);

  // Profile setup effect
  useEffect(() => {
    if (!profileLoading && (!companyProfile || !companyProfile.profileCompleted)) {
      const timer = setTimeout(() => {
        dispatch(dashboardActions.setCompanyProfileSetup(true));
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [profileLoading, companyProfile]);

  // Event handlers
  const handleFilterChange = (field, value) => {
    dispatch(dashboardActions.setFilter(field, value));
  };

  const handleViewRequirement = (requirement) => {
    dispatch(dashboardActions.openModal(requirement));
  };

  const handleEditRequirement = (requirement) => {
    dispatch(dashboardActions.openModal(requirement, true));
  };

  const handleProfileUpdate = (updatedProfile, isFinalSave = true) => {
    const success = saveProfile(updatedProfile, !isFinalSave);
    if (success && isFinalSave) {
      addToast('Company profile updated successfully!', 'success');
      dispatch(dashboardActions.toggleCompanyProfileModal());
    } else if (!success && isFinalSave) {
      addToast('Failed to update company profile.', 'error');
    }
  };

  const handleThreatSettingsSave = (settings) => {
    try {
      localStorage.setItem('threatSettings', JSON.stringify(settings));
      addToast('Threat settings saved successfully!', 'success');
      dispatch(dashboardActions.toggleThreatSettingsModal());
    } catch (error) {
      console.error('Failed to save threat settings:', error);
      addToast('Failed to save threat settings.', 'error');
    }
  };

  const handleCreateRequirementFromRisk = (requirementData) => {
    const newRequirement = {
      id: `REQ-${Date.now()}`,
      status: 'Not Started',
      capabilityId: '',
      businessValueScore: requirementData.priority === 'Critical' ? 5 : 
                         requirementData.priority === 'High' ? 4 : 3,
      maturityLevel: { score: 1, level: 'Initial' },
      applicability: { type: 'Essential', justification: 'Risk mitigation requirement' },
      costEstimate: 0,
      area: 'Security',
      type: 'Control',
      priority: requirementData.priority,
      ...requirementData
    };
    
    addRequirement(newRequirement);
    addToast(`Requirement created from risk: ${requirementData.title}`, 'success');
  };

  const handleUploadCSV = async (csvData) => {
    try {
      const success = await importFromCSV(csvData);
      if (success) {
        addToast(`Successfully imported ${csvData.length} requirements!`, 'success');
        dispatch(dashboardActions.toggleUploadModal());
      } else {
        addToast('Failed to import CSV data. Please check the format.', 'error');
      }
    } catch (error) {
      addToast('An error occurred during import.', 'error');
    }
  };

  const handlePurgeData = async () => {
    try {
      const success = await purgeAllData();
      if (success) {
        addToast('All data has been purged successfully.', 'success');
        dispatch(dashboardActions.togglePurgeModal());
      } else {
        addToast('Failed to purge data.', 'error');
      }
    } catch (error) {
      addToast('Failed to purge data.', 'error');
    }
  };

  const handleSelectCapability = (capabilityId) => {
    dispatch(dashboardActions.setSelectedCapability(capabilityId));
    dispatch(dashboardActions.setViewMode('requirements'));
  };

  const handleCreateCapability = async (newCapability) => {
    try {
      const success = await addCapability(newCapability);
      if (success) {
        addToast(`Successfully created capability ${newCapability.id}!`, 'success');
        dispatch(dashboardActions.toggleNewCapabilityModal());
        return true;
      } else {
        addToast('Failed to create capability.', 'error');
        return false;
      }
    } catch (error) {
      addToast('Failed to create capability.', 'error');
      return false;
    }
  };

  const handleExportCSV = () => {
    try {
      const csvContent = generateCSV(requirements);
      const filename = `requirements_export_${new Date().toISOString().split('T')[0]}.csv`;
      downloadCSV(csvContent, filename);
      addToast('CSV export completed successfully!', 'success');
    } catch (error) {
      addToast('Failed to export CSV.', 'error');
    }
  };

  const handleUpdateRequirement = async (updatedRequirement) => {
    try {
      const success = await updateRequirement(updatedRequirement);
      if (success) {
        addToast('Requirement updated successfully!', 'success');
        dispatch(dashboardActions.closeModal());
      } else {
        addToast('Failed to update requirement.', 'error');
      }
    } catch (error) {
      addToast('Failed to update requirement.', 'error');
    }
  };

  // Return state and handlers
  return {
    state,
    dispatch,
    handlers: {
      handleFilterChange,
      handleViewRequirement,
      handleEditRequirement,
      handleProfileUpdate,
      handleThreatSettingsSave,
      handleCreateRequirementFromRisk,
      handleUploadCSV,
      handlePurgeData,
      handleSelectCapability,
      handleCreateCapability,
      handleExportCSV,
      handleUpdateRequirement
    },
    data: {
      requirements,
      capabilities,
      companyProfile,
      filteredRequirements,
      pcdData,
      loading: loading || capabilitiesLoading || pcdLoading,
      error
    }
  };
};