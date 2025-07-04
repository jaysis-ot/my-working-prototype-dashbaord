import React, { Suspense } from 'react';
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

// Lazy-loaded Pages will be added once the actual files are created.

// A simple wrapper for providers to keep the App component clean
const AppProviders = ({ children }) => {
  return (
    <ThemeProvider>
      {/* <AuthProvider> */}
        {/* <ToastProvider> */}
          <DashboardUIProvider>
            {/* <RequirementsProvider> */}
              {/* <CapabilitiesProvider> */}
                {/* <TeamProvider> */}
                  {children}
                {/* </TeamProvider> */}
              {/* </CapabilitiesProvider> */}
            {/* </RequirementsProvider> */}
          </DashboardUIProvider>
        {/* </ToastProvider> */}
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
                    {/* Placeholder Pages */}
                    <Route path="overview" element={<div className="text-2xl font-bold">Overview Page</div>} />
                    <Route path="requirements" element={<div className="text-2xl font-bold">Requirements Page</div>} />
                    <Route path="capabilities" element={<div className="text-2xl font-bold">Capabilities Page</div>} />
                    <Route path="resources" element={<div className="text-2xl font-bold">Resource Planning Page</div>} />
                    <Route path="maturity-analysis" element={<div className="text-2xl font-bold">Maturity Analysis Page</div>} />
                    <Route path="threat-intelligence" element={<div className="text-2xl font-bold">Threat Intelligence Page</div>} />
                    <Route path="risk-management" element={<div className="text-2xl font-bold">Risk Management Page</div>} />
                    <Route path="analytics" element={<div className="text-2xl font-bold">Analytics Page</div>} />
                    <Route path="pcd-breakdown" element={<div className="text-2xl font-bold">PCD Breakdown Page</div>} />
                    <Route path="settings" element={<div className="text-2xl font-bold">Settings Page</div>} />
                    
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
