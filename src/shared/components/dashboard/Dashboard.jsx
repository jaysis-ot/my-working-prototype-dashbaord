// src/components/dashboard/Dashboard.jsx
import React from 'react';
import ErrorBoundary from '../layout/ErrorBoundary';
import DashboardSidebar from './DashboardSidebar';
import DashboardHeader from './DashboardHeader';
import DashboardContent from './DashboardContent';
import ModalsContainer from '../modals/ModalsContainer';
import LoadingSpinner from '../ui/LoadingSpinner';
import { useDashboardState } from '../../hooks/useDashboardState';
import { useTheme } from '../../contexts/ThemeProvider';

/**
 * Main Dashboard Container Component
 * 
 * This is the primary orchestrating component for the entire dashboard system.
 * It manages the overall layout, state, and integration between all major sections.
 */
const Dashboard = () => {
  // Centralized state management - this hook contains all dashboard logic
  const {
    state,
    dispatch,
    handlers,
    data: {
      requirements,
      capabilities,
      companyProfile,
      filteredRequirements,
      pcdData,
      loading,
      error
    }
  } = useDashboardState();

  // Theme context for styling
  const { currentTheme } = useTheme();

  // Handle loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <div className="mt-4 text-gray-600">
            <p className="text-lg font-medium">Loading Dashboard</p>
            <p className="text-sm">Initializing your cyber trust portal...</p>
          </div>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="text-red-600 text-xl mb-4">Dashboard Error</div>
          <div className="text-gray-600 mb-4">{error}</div>
          <button 
            onClick={() => window.location.reload()}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Reload Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Dynamic theme classes for the main container
  const getThemeClasses = () => {
    if (currentTheme === 'stripe') {
      return {
        mainContainer: 'main-background',
        contentArea: 'content-area'
      };
    }
    return {
      mainContainer: 'bg-gray-50',
      contentArea: ''
    };
  };

  const themeClasses = getThemeClasses();

  // Common props that get passed to child components
  const commonProps = {
    state,
    dispatch,
    currentTheme,
    companyProfile
  };

  // Data props bundled together
  const dataProps = {
    requirements,
    capabilities,
    filteredRequirements,
    pcdData
  };

  return (
    <ErrorBoundary>
      <div className={`min-h-screen flex flex-col lg:flex-row ${themeClasses.mainContainer}`}>
        
        {/* Left Sidebar - Navigation and Data Management */}
        <DashboardSidebar 
          {...commonProps}
          onExportCSV={handlers.handleExportCSV}
          requirementsCount={requirements.length}
          isLoading={loading}
        />
        
        {/* Main Content Area */}
        <div className={`flex-1 flex flex-col min-w-0 ${themeClasses.contentArea}`}>
          
          {/* Top Header */}
          <DashboardHeader 
            {...commonProps}
            requirements={requirements}
            filteredRequirements={filteredRequirements}
            onExportCSV={handlers.handleExportCSV}
            onProfileEdit={() => dispatch({ type: 'TOGGLE_COMPANY_PROFILE_MODAL' })}
          />
          
          {/* Main Content Router */}
          <DashboardContent 
            {...commonProps}
            data={dataProps}
            handlers={handlers}
          />
          
        </div>
        
        {/* Modal System - Handles all modal dialogs */}
        <ModalsContainer 
          {...commonProps}
          data={dataProps}
          handlers={handlers}
        />
        
      </div>
    </ErrorBoundary>
  );
};

export default Dashboard;