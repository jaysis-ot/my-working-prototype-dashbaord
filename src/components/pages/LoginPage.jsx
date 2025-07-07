import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { AuthContext } from '../../auth/JWTAuthProvider.js';
import { JWTLoginForm } from '../../auth/JWTLoginForm.js';

/**
 * LoginPage Component
 * 
 * This page serves as the entry point for user authentication. It acts as a
 * container and a guard for the login route.
 * 
 * Responsibilities:
 * - Checks the current authentication state using the AuthContext.
 * - Displays a loading indicator while the authentication status is being verified.
 * - Redirects already authenticated users to the dashboard.
 * - Renders the JWTLoginForm for unauthenticated users.
 */
const LoginPage = () => {
  const { isAuthenticated, loading } = useContext(AuthContext);

  // While checking for an existing session, show a loading indicator.
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center text-center">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">
            Verifying session...
          </p>
        </div>
      </div>
    );
  }

  // If the user is already authenticated, redirect them to the dashboard.
  if (isAuthenticated) {
    return <Navigate to="/dashboard/overview" replace />;
  }

  // If not loading and not authenticated, show the login form.
  return (
    <JWTLoginForm />
  );
};

export default LoginPage;
