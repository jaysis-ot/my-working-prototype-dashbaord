// src/components/dashboard/Dashboard.jsx
import React from 'react';
import { ErrorBoundary } from '../layout';
import { DashboardHeader, DashboardSidebar, DashboardContent } from './';
import { ModalsContainer } from '../modals';
import { useDashboardState } from '../../hooks';
import { useTheme } from '../../contexts/ThemeProvider';
import { useToast } from '../ui/Toast';

const Dashboard = () => {
  // Centralized state management
  const {
    state,
    dispatch,
    handlers: {
      handleFilterChange,
      handleViewRequirement,
      handleEditRequirement,
      handleProfileUpdate,
      handleThreatSettingsSave,
      handleUploadCSV,
      handlePurgeData,
      handleExportCSV,
      handleUpdateRequirement,
      handleCreateCapability,
      handleSelectCapability,
      handleCreateRequirementFromRisk
    },
    data: {
      requirements,
      capabilities,
      companyProfile,
      filteredRequirements,
      loading,
      error
    }
  } = useDashboardState();

  const { currentTheme } = useTheme();
  const { addToast } = useToast();

  // Loading and error states
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">Dashboard Error</div>
          <div className="text-gray-600 mb-4">{error}</div>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Reload Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Dynamic theme classes
  const themeClasses = {
    mainContainer: currentTheme === 'stripe' ? 'main-background' : 'bg-gray-50',
    contentArea: currentTheme === 'stripe' ? 'content-area' : ''
  };

  return (
    <ErrorBoundary>
      <div className={`min-h-screen flex flex-col lg:flex-row ${themeClasses.mainContainer}`}>
        <DashboardSidebar 
          state={state}
          dispatch={dispatch}
          companyProfile={companyProfile}
          currentTheme={currentTheme}
          onExportCSV={handleExportCSV}
        />
        
        <div className={`flex-1 flex flex-col min-w-0 ${themeClasses.contentArea}`}>
          <DashboardHeader 
            state={state}
            dispatch={dispatch}
            companyProfile={companyProfile}
            filteredRequirements={filteredRequirements}
            requirements={requirements}
            currentTheme={currentTheme}
            onExportCSV={handleExportCSV}
          />
          
          <DashboardContent 
            state={state}
            dispatch={dispatch}
            data={{
              requirements,
              capabilities,
              companyProfile,
              filteredRequirements
            }}
            handlers={{
              handleFilterChange,
              handleViewRequirement,
              handleEditRequirement,
              handleProfileUpdate,
              handleSelectCapability,
              handleCreateRequirementFromRisk
            }}
          />
        </div>
        
        <ModalsContainer 
          state={state}
          dispatch={dispatch}
          data={{
            requirements,
            capabilities,
            companyProfile
          }}
          handlers={{
            handleProfileUpdate,
            handleThreatSettingsSave,
            handleUploadCSV,
            handlePurgeData,
            handleCreateCapability,
            handleUpdateRequirement
          }}
        />
      </div>
    </ErrorBoundary>
  );
};

export default Dashboard;