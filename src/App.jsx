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

// Lazy-loaded Pages
const LoginPage = lazy(() => import('./components/pages/LoginPage'));
const OverviewPage = lazy(() => import('./components/pages/OverviewPage'));
const RequirementsPage = lazy(() => import('./components/pages/RequirementsPage'));
const CapabilitiesPage = lazy(() => import('./components/pages/CapabilitiesPage'));
const ResourcePlanningPage = lazy(() => import('./components/pages/ResourcePlanningPage'));
const MaturityAnalysisPage = lazy(() => import('./components/pages/MaturityAnalysisPage'));
const ThreatIntelligencePage = lazy(() => import('./components/pages/ThreatIntelligencePage'));
const RiskManagementPage = lazy(() => import('./components/pages/RiskManagementPage'));
const AnalyticsPage = lazy(() => import('./components/pages/AnalyticsPage'));
const PCDBreakdownPage = lazy(() => import('./components/pages/PCDBreakdownPage'));
const SettingsPage = lazy(() => import('./components/pages/SettingsPage'));

/* -------------------------------------------------------------------- *
 *  TRUST PAGE – ‼️  DO **NOT** LAZY-LOAD  ‼️                            *
 *  ------------------------------------------------------------------  *
 *  Because the Trust page has been the source of several render        *
 *  failures, we import it directly.  This guarantees that:             *
 *    1.  The component bundle is included up-front.                    *
 *    2.  We can easily debug compile-time errors.                      *
 *  We also declare a tiny fallback component that is *always*          *
 *  available should navigation to `/dashboard/trust` fail for          *
 *  any reason (e.g. React boundary crash).                             *
 * -------------------------------------------------------------------- */
import TrustPage from './components/pages/TrustPage';

// ultra-light back-up view so the route never “black-screens”
const TrustPageFallback = () => (
  <div className="p-6 text-center">
    <h2 className="text-xl font-semibold mb-4">
      Trust Page Fallback
    </h2>
    <p className="text-secondary-600 dark:text-secondary-400">
      The primary Trust page failed to render – showing fallback view.
    </p>
    {/* Render primary component anyway so devs still get stack-traces */}
    <TrustPage />
  </div>
);

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
                    <Route path="maturity-analysis" element={<MaturityAnalysisPage />} />
                    <Route path="threat-intelligence" element={<ThreatIntelligencePage />} />
                    <Route path="risk-management" element={<RiskManagementPage />} />

                    {/* =================================================== *
                     *               T R U S T    P A G E                  *
                     * =================================================== */}
                    <Route
                      path="trust"
                      element={<TrustPage />}
                    />

                    <Route path="analytics" element={<AnalyticsPage />} />
                    <Route path="pcd-breakdown" element={<PCDBreakdownPage />} />

                    {/* --- Back-up route in case the one above blows up --- */}
                    <Route
                      path="trust-fallback"
                      element={<TrustPageFallback />}
                    />
                    
                    {/* Default route within the dashboard */}
                    <Route path="*" element={<Navigate to="/dashboard/overview" replace />} />
                  </Routes>
                </DashboardLayout>
              }
            />
            
            {/* ------------------------------------------------------------------ *
             *  DIRECT TRUST TEST ROUTE                                           *
             * ------------------------------------------------------------------ *
             *  Bypasses DashboardLayout entirely so we can isolate whether the   *
             *  issue is in the TrustPage component itself or in its integration. *
             *  Visiting  /trust-direct  should always render the TrustPage.      *
             * ------------------------------------------------------------------ */}
            <Route path="/trust-direct" element={<TrustPage />} />
            
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
