import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import useAuth from './auth/useAuth';

// Context Providers
import { ThemeProvider } from './contexts/ThemeContext';
import { JWTAuthProvider } from './auth/JWTAuthProvider';
import { DashboardUIProvider } from './contexts/DashboardUIContext';

// Templates
import DashboardLayout from './components/templates/DashboardLayout';
import ModalManager from './components/templates/ModalManager';

// Lazy-loaded Pages
const OverviewPage = lazy(() => import('./components/pages/OverviewPage'));
const SettingsPage = lazy(() => import('./components/pages/SettingsPage'));
const LoginPage = lazy(() => import('./components/pages/LoginPage'));
const CapabilitiesPage = lazy(() => import('./components/pages/CapabilitiesPage'));
const RequirementsPage = lazy(() => import('./components/pages/RequirementsPage'));
const ResourcePlanningPage = lazy(() => import('./components/pages/ResourcePlanningPage'));
const MitreAttackPage = lazy(() => import('./components/pages/MitreAttackPage'));
const ThreatIntelligencePage = lazy(() => import('./components/pages/ThreatIntelligencePage'));
const RiskManagementPage = lazy(() => import('./components/pages/RiskManagementPage'));
const StandardsFrameworksPage = lazy(() => import('./components/pages/StandardsFrameworksPage'));
const AnalyticsPage = lazy(() => import('./components/pages/AnalyticsPage'));
const BusinessPlanPage = lazy(() => import('./components/pages/BusinessPlanPage'));
const MaturityAnalysisPage = lazy(() => import('./components/pages/MaturityAnalysisPage'));
const TrustPage = lazy(() => import('./components/pages/TrustPage'));
// ✅ ADD MISSING IMPORT
const IncidentManagementPage = lazy(() => import('./components/pages/IncidentManagementPage'));
// Evidence Page
const EvidencePage = lazy(() => import('./components/pages/EvidencePage'));
// Advanced Evidence Demo Page
const AdvancedEvidenceDemoPage = lazy(() => import('./components/pages/AdvancedEvidenceDemo'));

// A simple wrapper for providers to keep the App component clean
const AppProviders = ({ children }) => {
  return (
    <ThemeProvider>
      <JWTAuthProvider>
        <DashboardUIProvider>
          {children}
          {/* Global Modal Manager */}
          <ModalManager />
        </DashboardUIProvider>
      </JWTAuthProvider>
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

// Protected Route Component - redirects to login if not authenticated
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <LoadingFallback />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

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
            {/* Authentication Route */}
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

                      {/* Existing Pages */}
                      <Route path="requirements" element={<RequirementsPage />} />
                      <Route path="capabilities" element={<CapabilitiesPage />} />
                      <Route path="resources" element={<ResourcePlanningPage />} />
                      <Route path="mitre-attack" element={<MitreAttackPage />} />
                      <Route path="maturity-analysis" element={<MaturityAnalysisPage />} />
                      <Route path="threat-intelligence" element={<ThreatIntelligencePage />} />
                      <Route path="risk-management" element={<RiskManagementPage />} />
                      <Route path="standards-frameworks" element={<StandardsFrameworksPage />} />
                      <Route path="analytics" element={<AnalyticsPage />} />
                      <Route path="business-plan" element={<BusinessPlanPage />} />
                      
                      {/* ✅ ADD MISSING ROUTES */}
                      <Route path="trust" element={<TrustPage />} />
                      <Route path="incident-management" element={<IncidentManagementPage />} />
                      <Route path="evidence" element={<EvidencePage />} />
                      {/* Advanced visualisation demo */}
                      <Route path="evidence-demo" element={<AdvancedEvidenceDemoPage />} />
                      
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