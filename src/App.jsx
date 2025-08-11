import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import useAuth from './auth/useAuth';

// Context Providers
import { ThemeProvider } from './contexts/ThemeContext';
// import { JWTAuthProvider } from './auth/JWTAuthProvider';
import { AuthProvider } from './auth/AuthContext';
import { DashboardUIProvider } from './contexts/DashboardUIContext';

// Templates
import DashboardLayout from './components/templates/DashboardLayout';
import ModalManager from './components/templates/ModalManager';

// User Management
import UserManagement from './components/admin/UserManagement';

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
const IncidentManagementPage = lazy(() => import('./components/pages/IncidentManagementPage'));
const EvidencePage = lazy(() => import('./components/pages/EvidencePage'));
const RepositoryPage = lazy(() => import('./components/pages/RepositoryPage'));
// const UserManagement = lazy(() => import('.components/admin/UserManagement'));

// AppProviders wrapper
const AppProviders = ({ children }) => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DashboardUIProvider>
          {children}
          <ModalManager />
        </DashboardUIProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

// Fallback while loading lazy components
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-background-light dark:bg-background-dark">
    <div className="flex flex-col items-center">
      <Loader2 className="w-12 h-12 text-primary-600 animate-spin" />
      <p className="mt-4 text-secondary-600 dark:text-secondary-400">Loading Dashboard...</p>
    </div>
  </div>
);

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <LoadingFallback />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

// Main App
function App() {
  return (
    <BrowserRouter>
      <AppProviders>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* Login route */}
            <Route path="/login" element={<LoginPage />} />

            {/* Dashboard routes (nested rendering into DashboardLayout's Outlet) */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              {/* default redirect */}
              <Route index element={<Navigate to="overview" replace />} />

              {/* dashboard pages */}
              <Route path="overview" element={<OverviewPage />} />
              <Route path="settings" element={<SettingsPage />} />
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
              <Route path="repository" element={<RepositoryPage />} />
              <Route path="evidence" element={<EvidencePage />} />
              <Route path="trust" element={<TrustPage />} />
              <Route path="incident-management" element={<IncidentManagementPage />} />
              <Route path="users" element={<UserManagement />} />

              {/* Dashboard fallback */}
              <Route path="*" element={<Navigate to="overview" replace />} />
            </Route>

            {/* Default root redirect */}
            <Route path="/" element={<Navigate to="/dashboard/overview" replace />} />

            {/* 404 fallback */}
            <Route path="*" element={<Navigate to="/dashboard/overview" replace />} />
          </Routes>
        </Suspense>
      </AppProviders>
    </BrowserRouter>
  );
}

export default App;
