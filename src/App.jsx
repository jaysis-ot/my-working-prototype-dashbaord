import React, { Suspense, lazy, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

// Context Providers
import { ThemeProvider } from './contexts/ThemeContext';
import { JWTAuthProvider as AuthProvider, AuthContext } from './auth/JWTAuthProvider';
import { DashboardUIProvider } from './contexts/DashboardUIContext';

// Feature Context Providers - to be created
// import { RequirementsProvider } from './features/requirements/RequirementsContext';
// import { CapabilitiesProvider } from './features/capabilities/CapabilitiesContext';
// import { TeamProvider } from './features/team/TeamContext';

// Templates
import DashboardLayout from './components/templates/DashboardLayout';
// Direct-load Page (non-lazy to keep critical route instantly available)
import TrustPage from './components/pages/TrustPage';

// Lazy-loaded Pages
const LoginPage = lazy(() => import('./components/pages/LoginPage'));
const OverviewPage = lazy(() => import('./components/pages/OverviewPage'));
const RequirementsPage = lazy(() => import('./components/pages/RequirementsPage'));
const CapabilitiesPage = lazy(() => import('./components/pages/CapabilitiesPage'));
const ResourcePlanningPage = lazy(() => import('./components/pages/ResourcePlanningPage'));
const MaturityAnalysisPage = lazy(() => import('./components/pages/MaturityAnalysisPage'));
const ThreatIntelligencePage = lazy(() => import('./components/pages/ThreatIntelligencePage'));
const RiskManagementPage = lazy(() => import('./components/pages/RiskManagementPage'));
const IncidentManagementPage = lazy(() => import('./components/pages/IncidentManagementPage'));
const AnalyticsPage = lazy(() => import('./components/pages/AnalyticsPage'));
const SettingsPage = lazy(() => import('./components/pages/SettingsPage'));

// -------------------------------------------------------------------
//  AUTH / ROUTE GUARD HELPERS
// -------------------------------------------------------------------

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useContext(AuthContext);
  if (loading) return <LoadingFallback />;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// A simple wrapper for providers to keep the App component clean
const AppProviders = ({ children }) => {
  return (
    <ThemeProvider>
      <AuthProvider>
          <DashboardUIProvider>
            {/* <RequirementsProvider> */}
              {/* <CapabilitiesProvider> */}
                {/* <TeamProvider> */}
                  {children}
                {/* </TeamProvider> */}
              {/* </CapabilitiesProvider> */}
            {/* </RequirementsProvider> */}
          </DashboardUIProvider>
      </AuthProvider>
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
            <Route path="/login" element={<LoginPage />} />
            
            {/* Dashboard Routes */}
            <Route
              path="/dashboard/*"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                  <Routes>
                    {/* Implemented Pages */}
                    <Route path="overview" element={<OverviewPage />} />
                    <Route path="settings" element={<SettingsPage />} />

                    {/* Placeholder Pages */}
                    <Route path="requirements" element={<RequirementsPage />} />
                    <Route path="capabilities" element={<CapabilitiesPage />} />
                    <Route path="resources" element={<ResourcePlanningPage />} />
                    <Route path="maturity-analysis" element={<MaturityAnalysisPage />} />
                    <Route path="threat-intelligence" element={<ThreatIntelligencePage />} />
                    <Route path="risk-management" element={<RiskManagementPage />} />
                    <Route path="incident-management" element={<IncidentManagementPage />} />

                    {/* Static Placeholder Trust Page */}
                    <Route path="trust" element={<TrustPage />} />

                    <Route path="analytics" element={<AnalyticsPage />} />
                    
                    {/* Default route within the dashboard */}
                    <Route path="*" element={<Navigate to="/dashboard/overview" replace />} />
                  </Routes>
                  </DashboardLayout>
                </ProtectedRoute>
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
