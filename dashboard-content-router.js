// src/components/dashboard/DashboardContent.jsx
import React, { lazy, Suspense } from 'react';
import LoadingSpinner from '../layout/LoadingSpinner';

// Lazy load views for better performance
const OverviewView = lazy(() => import('../views/OverviewView'));
const CompanyProfileView = lazy(() => import('../views/CompanyProfileView'));
const CapabilitiesView = lazy(() => import('../views/CapabilitiesView'));
const RequirementsView = lazy(() => import('../views/RequirementsView'));
const ThreatIntelligenceView = lazy(() => import('../views/ThreatIntelligenceView'));
const MitreNavigatorView = lazy(() => import('../views/MitreNavigatorView'));
const RiskManagementView = lazy(() => import('../views/RiskManagementView'));
const PCDBreakdownView = lazy(() => import('../views/PCDBreakdownView'));
const MaturityAnalysisView = lazy(() => import('../views/MaturityAnalysisView'));
const BusinessValueView = lazy(() => import('../views/BusinessValueView'));
const AnalyticsView = lazy(() => import('../views/AnalyticsView'));
const DiagnosticsView = lazy(() => import('../views/DiagnosticsView'));
const SystemSettingsView = lazy(() => import('../views/SystemSettingsView'));

const DashboardContent = ({ 
  state, 
  dispatch, 
  data: {
    requirements,
    capabilities,
    companyProfile,
    filteredRequirements
  },
  handlers 
}) => {
  const renderView = () => {
    const commonProps = {
      state,
      dispatch,
      requirements,
      capabilities,
      companyProfile,
      filteredRequirements,
      ...handlers
    };

    switch (state.ui.viewMode) {
      case 'overview':
        return <OverviewView {...commonProps} />;
        
      case 'company-profile':
        return (
          <CompanyProfileView 
            onProfileUpdate={handlers.handleProfileUpdate}
            existingProfile={companyProfile}
          />
        );
        
      case 'capabilities':
        return (
          <CapabilitiesView 
            {...commonProps}
            onSelectCapability={handlers.handleSelectCapability}
          />
        );
        
      case 'requirements':
        return (
          <RequirementsView 
            {...commonProps}
            onFilterChange={handlers.handleFilterChange}
            onViewRequirement={handlers.handleViewRequirement}
            onEditRequirement={handlers.handleEditRequirement}
          />
        );
        
      case 'threat-intelligence':
        return (
          <ThreatIntelligenceView 
            {...commonProps}
            onUpdateRequirement={handlers.handleUpdateRequirement}
            onAddRequirement={handlers.handleAddRequirement}
          />
        );
        
      case 'mitre-navigator':
        return <MitreNavigatorView {...commonProps} />;
        
      case 'risk-management':
        return (
          <RiskManagementView 
            {...commonProps}
            onCreateRequirement={handlers.handleCreateRequirementFromRisk}
          />
        );
        
      case 'pcd':
        return (
          <PCDBreakdownView 
            {...commonProps}
            selectedPCD={state.ui.selectedPCD}
            onSelectPCD={(pcdId) => dispatch({ type: 'SET_SELECTED_PCD', pcdId })}
          />
        );
        
      case 'maturity':
        return (
          <MaturityAnalysisView 
            {...commonProps}
            onViewRequirement={handlers.handleViewRequirement}
          />
        );
        
      case 'justification':
        return (
          <BusinessValueView 
            {...commonProps}
            onViewRequirement={handlers.handleViewRequirement}
          />
        );
        
      case 'analytics':
        return <AnalyticsView {...commonProps} />;
        
      case 'diagnostics':
        return (
          <DiagnosticsView 
            appState={{
              requirements: requirements.length,
              capabilities: capabilities.length,
              filters: state.filters,
              ui: state.ui
            }}
            companyProfile={companyProfile}
          />
        );
        
      case 'settings':
        return (
          <SystemSettingsView
            companyProfile={companyProfile}
            onProfileUpdate={handlers.handleProfileUpdate}
            currentUser={{
              id: 'current-user',
              name: companyProfile?.contactName || 'System Administrator',
              email: companyProfile?.contactEmail || 'admin@company.com',
              role: 'Administrator',
              lastLogin: new Date().toISOString(),
              mfaEnabled: true,
              avatar: null
            }}
          />
        );
        
      default:
        return <OverviewView {...commonProps} />;
    }
  };

  return (
    <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
      <Suspense 
        fallback={
          <div className="flex items-center justify-center min-h-96">
            <LoadingSpinner />
          </div>
        }
      >
        {renderView()}
      </Suspense>
    </main>
  );
};

export default DashboardContent;