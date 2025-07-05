import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

// Context Providers
import { ThemeProvider } from './contexts/ThemeContext';
// import { AuthProvider } from './contexts/AuthContext'; // To be created
import { DashboardUIProvider } from './contexts/DashboardUIContext';

// Feature Context Providers - to be created
// import { RequirementsProvider } from './features/requirements/RequirementsContext';
// import { CapabilitiesProvider } from './features/capabilities/CapabilitiesContext';
// import { TeamProvider } from './features/team/TeamContext';

// Templates
import DashboardLayout from './components/templates/DashboardLayout';
import ModalManager from './components/templates/ModalManager';

// Lazy-loaded Pages
const OverviewPage = lazy(() => import('./components/pages/OverviewPage'));
const SettingsPage = lazy(() => import('./components/pages/SettingsPage'));
const CapabilitiesPage = lazy(() => import('./components/pages/CapabilitiesPage'));
const RequirementsPage = lazy(() => import('./components/pages/RequirementsPage'));
const ResourcePlanningPage = lazy(() => import('./components/pages/ResourcePlanningPage'));
const MitreAttackPage = lazy(() => import('./components/pages/MitreAttackPage'));
const ThreatIntelligencePage = lazy(() => import('./components/pages/ThreatIntelligencePage'));
const RiskManagementPage = lazy(() => import('./components/pages/RiskManagementPage'));
const StandardsFrameworksPage = lazy(() => import('./components/pages/StandardsFrameworksPage'));

// NOTE:
// The following pages are referenced only as placeholder <div> routes
// and do not yet have real components.  Their lazy imports are removed
// to avoid build-time resolution errors.  Add them back once the files exist.
// const LoginPage            = lazy(() => import('./components/pages/LoginPage'));
// const RequirementsPage     = lazy(() => import('./components/pages/RequirementsPage'));
// const CapabilitiesPage     = lazy(() => import('./components/pages/CapabilitiesPage'));
// const ResourcePlanningPage = lazy(() => import('./components/pages/ResourcePlanningPage'));
// const MaturityAnalysisPage = lazy(() => import('./components/pages/MaturityAnalysisPage'));
// const ThreatIntelligencePage = lazy(() => import('./components/pages/ThreatIntelligencePage'));
// const RiskManagementPage   = lazy(() => import('./components/pages/RiskManagementPage'));
// const AnalyticsPage        = lazy(() => import('./components/pages/AnalyticsPage'));
// const PCDBreakdownPage     = lazy(() => import('./components/pages/PCDBreakdownPage'));

// A simple wrapper for providers to keep the App component clean
const AppProviders = ({ children }) => {
  return (
    <ThemeProvider>
      {/* <AuthProvider> */}
          <DashboardUIProvider>
            {/* <RequirementsProvider> */}
              {/* <CapabilitiesProvider> */}
                {/* <TeamProvider> */}
                  {children}
                  {/* Global Modal Manager */}
                  <ModalManager />
                {/* </TeamProvider> */}
              {/* </CapabilitiesProvider> */}
            {/* </RequirementsProvider> */}
          </DashboardUIProvider>
      {/* </AuthProvider> */}
    </ThemeProvider>
  );
};

// Loading Fallback Component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-background-light dark:bg-background-dark">
    <div className="flex flex-col items-center">
      <Loader2 className="w-12 h-12 text-primary-600 animate-spin" />
      <p className="mt-4 text-secondary-600 dark:text-secondary-400">Loading Dashboard...</p>
    </div>
  </div>
);

/**
 * Main App Component for the Cyber Trust Sensor Dashboard
 * 
 * This component serves as the entry point for the application and sets up:
 * 1. Global and feature-specific context providers
 * 2. Routing with React Router
 * 3. Lazy loading for performance optimization
 * 
 * The architecture follows atomic design principles with a feature-based modular approach
 * as outlined in the technical architecture design.
 */
function App() {
  return (
    <BrowserRouter>
      <AppProviders>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* Authentication Route - Placeholder */}
            {/* <Route path="/login" element={<LoginPage />} /> */}
            
            {/* Dashboard Routes */}
            <Route
              path="/dashboard/*"
              element={
                <DashboardLayout>
                  <Routes>
                    {/* Implemented Pages */}
                    <Route path="overview" element={<OverviewPage />} />
                    <Route path="settings" element={<SettingsPage />} />

                    {/* Placeholder Pages */}
                    <Route path="requirements" element={<RequirementsPage />} />
                    <Route path="capabilities" element={<CapabilitiesPage />} />
                    <Route path="resources" element={<ResourcePlanningPage />} />
                    <Route path="mitre-attack" element={<MitreAttackPage />} />
                    <Route path="maturity-analysis" element={<div className="text-2xl font-bold">Maturity Analysis Page</div>} />
                    <Route path="threat-intelligence" element={<ThreatIntelligencePage />} />
                    <Route path="risk-management" element={<RiskManagementPage />} />
                    <Route path="standards-frameworks" element={<StandardsFrameworksPage />} />
                    <Route path="analytics" element={<div className="text-2xl font-bold">Analytics Page</div>} />
                    <Route path="pcd-breakdown" element={<div className="text-2xl font-bold">PCD Breakdown Page</div>} />
                    
                    {/* Default route within the dashboard */}
                    <Route path="*" element={<Navigate to="/dashboard/overview" replace />} />
                  </Routes>
                </DashboardLayout>
              }
            />
            
            {/* Redirect root to dashboard */}
            <Route path="/" element={<Navigate to="/dashboard/overview" replace />} />
            
            {/* Catch-all for 404 - redirects to dashboard */}
            <Route path="*" element={<Navigate to="/dashboard/overview" replace />} />
          </Routes>
        </Suspense>
      </AppProviders>
    </BrowserRouter>
  );
}

export default App;
