// src/components/dashboard/Dashboard.jsx
import React from 'react';
import { ErrorBoundary } from '../layout';
import { DashboardSidebar } from './DashboardSidebar';
import { DashboardHeader } from './DashboardHeader';
import { DashboardContent } from './DashboardContent';
import { ModalsContainer } from '../modals';
import { LoadingSpinner } from '../ui';
import { useDashboardState } from '../../hooks/useDashboardState';
import { useTheme } from '../../contexts/ThemeProvider';
import { useToast } from '../../hooks/useToast';

/**
 * Main Dashboard Container Component
 * 
 * This is the primary orchestrating component for the entire dashboard system.
 * It manages the overall layout, state, and integration between all major sections.
 * 
 * Architecture:
 * - Centralized state management through useDashboardState hook
 * - Theme-aware styling and responsive behavior
 * - Error boundary protection
 * - Modal management system
 * - Clean separation between layout, content, and state
 */
const Dashboard = () => {
  // Centralized state management and business logic
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

  // Theme and UI systems
  const { currentTheme } = useTheme();
  const { addToast } = useToast();

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
          <div className="space-y-3">
            <button 
              onClick={() => window.location.reload()}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Reload Dashboard
            </button>
            <button 
              onClick={() => addToast('Error reported to system administrators', 'info')}
              className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Report Issue
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Dynamic theme classes for the main container
  const getThemeClasses = () => {
    return {
      mainContainer: currentTheme === 'stripe' 
        ? 'main-background' 
        : 'bg-gray-50',
      contentArea: currentTheme === 'stripe' 
        ? 'content-area' 
        : ''
    };
  };

  const themeClasses = getThemeClasses();

  // Common props passed to child components
  const commonProps = {
    state,
    dispatch,
    currentTheme,
    companyProfile
  };

  const dataProps = {
    requirements,
    capabilities,
    filteredRequirements,
    pcdData
  };

  return (
    <ErrorBoundary>
      <div className={`min-h-screen flex flex-col lg:flex-row ${themeClasses.mainContainer}`}>
        {/* Sidebar Navigation */}
        <DashboardSidebar 
          {...commonProps}
          onExportCSV={handlers.handleExportCSV}
          requirementsCount={requirements.length}
          isLoading={loading}
        />
        
        {/* Main Content Area */}
        <div className={`flex-1 flex flex-col min-w-0 ${themeClasses.contentArea}`}>
          {/* Header */}
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
        
        {/* Modal System */}
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

// Export named version for easier testing
export { Dashboard };