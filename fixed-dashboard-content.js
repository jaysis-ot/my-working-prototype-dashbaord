// src/components/dashboard/DashboardContent.jsx
import React, { lazy, Suspense } from 'react';
import LoadingSpinner from '../ui/LoadingSpinner';
import { VIEW_MODES } from '../../constants'; // ✅ Add missing import

// Lazy load views for better performance and code splitting
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
const StandardsView = lazy(() => import('../views/StandardsView')); // ✅ Add lazy loaded StandardsView

/**
 * Dashboard Content Router Component
 * 
 * This component acts as the main content router for the dashboard,
 * dynamically rendering the appropriate view based on the current viewMode.
 * 
 * Features:
 * - Lazy loading of view components for better performance
 * - Centralized view routing logic
 * - Consistent prop passing to all views
 * - Loading states during view transitions
 * - Fallback handling for unknown view modes
 */
const DashboardContent = ({ 
  state, 
  dispatch, 
  currentTheme,
  companyProfile,
  data: {
    requirements = [],
    capabilities = [],
    filteredRequirements = [],
    pcdData = null
  },
  handlers = {}
}) => {
  
  // Common props passed to all views
  const commonViewProps = {
    state,
    dispatch,
    currentTheme,
    companyProfile,
    requirements,
    capabilities,
    filteredRequirements,
    pcdData,
    ...handlers
  };

  /**
   * Render the appropriate view based on the current view mode
   */
  const renderView = () => {
    const { viewMode } = state.ui;

    switch (viewMode) {
      case VIEW_MODES.OVERVIEW:
      case 'overview': // ✅ Support both constant and string for backward compatibility
        return <OverviewView {...commonViewProps} />;
        
      case VIEW_MODES.COMPANY_PROFILE:
      case 'company-profile':
        return (
          <CompanyProfileView 
            onProfileUpdate={handlers.handleProfileUpdate}
            existingProfile={companyProfile}
          />
        );
        
      case VIEW_MODES.CAPABILITIES:
      case 'capabilities':
        return (
          <CapabilitiesView 
            {...commonViewProps}
            onSelectCapability={handlers.handleSelectCapability}
            onCreateCapability={handlers.handleCreateCapability}
          />
        );
        
      case VIEW_MODES.REQUIREMENTS:
      case 'requirements':
        return (
          <RequirementsView 
            {...commonViewProps}
            onFilterChange={handlers.handleFilterChange}
            onViewRequirement={handlers.handleViewRequirement}
            onEditRequirement={handlers.handleEditRequirement}
            onExportCSV={handlers.handleExportCSV}
          />
        );
        
      case VIEW_MODES.THREAT_INTELLIGENCE:
      case 'threat-intelligence':
        return (
          <ThreatIntelligenceView 
            {...commonViewProps}
            onUpdateRequirement={handlers.handleUpdateRequirement}
            onAddRequirement={handlers.handleAddRequirement}
          />
        );
        
      case VIEW_MODES.MITRE_NAVIGATOR:
      case 'mitre-navigator':
        return <MitreNavigatorView {...commonViewProps} />;
        
      case VIEW_MODES.RISK_MANAGEMENT:
      case 'risk-management':
        return (
          <RiskManagementView 
            {...commonViewProps}
            onCreateRequirement={handlers.handleCreateRequirementFromRisk}
          />
        );

      case VIEW_MODES.STANDARDS: // ✅ Add Standards view case
      case 'standards':
        return <StandardsView {...commonViewProps} />;
        
      case VIEW_MODES.PCD_BREAKDOWN:
      case 'pcd':
        return (
          <PCDBreakdownView 
            {...commonViewProps}
            selectedPCD={state.ui.selectedPCD}
            onSelectPCD={(pcdId) => dispatch({ type: 'SET_SELECTED_PCD', pcdId })}
          />
        );
        
      case VIEW_MODES.MATURITY_ANALYSIS:
      case 'maturity':
        return (
          <MaturityAnalysisView 
            {...commonViewProps}
            onViewRequirement={handlers.handleViewRequirement}
          />
        );
        
      case VIEW_MODES.BUSINESS_VALUE:
      case 'justification':
        return (
          <BusinessValueView 
            {...commonViewProps}
            onViewRequirement={handlers.handleViewRequirement}
          />
        );
        
      case VIEW_MODES.ANALYTICS:
      case 'analytics':
        return <AnalyticsView {...commonViewProps} />;
        
      case VIEW_MODES.DIAGNOSTICS:
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
        
      case VIEW_MODES.SETTINGS:
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
        // Fallback to overview if unknown view mode
        console.warn(`Unknown view mode: ${viewMode}. Falling back to overview.`);
        return <OverviewView {...commonViewProps} />;
    }
  };

  // Loading component for view transitions
  const ViewLoadingSpinner = () => (
    <div className="flex items-center justify-center min-h-96">
      <div className="text-center">
        <LoadingSpinner size="md" />
        <div className="mt-3 text-sm text-gray-600">
          Loading {state.ui.viewMode.replace('-', ' ')} view...
        </div>
      </div>
    </div>
  );

  return (
    <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
      <Suspense fallback={<ViewLoadingSpinner />}>
        <div className="w-full max-w-none">
          {renderView()}
        </div>
      </Suspense>
    </main>
  );
};

export default DashboardContent;