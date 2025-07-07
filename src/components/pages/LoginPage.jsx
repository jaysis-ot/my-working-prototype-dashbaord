import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Loader2, Shield, User, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';

/**
 * LoginPage Component
 * 
 * This component provides a full-page login interface. It is self-contained and
 * handles user input, submission, loading states, and error display. It uses
 * the `useAuth` hook to interact with the global authentication state.
 */
const LoginPage = () => {
  const { isAuthenticated, loading: authLoading, login } = useAuth();
  const [email, setEmail] = useState('admin@ot-dashboard.com');
  const [password, setPassword] = useState('demo123');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle the initial loading state from the AuthProvider, which checks for an existing session.
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background-light dark:bg-background-dark">
        <div className="flex flex-col items-center">
          <Loader2 className="w-12 h-12 text-primary-600 animate-spin" />
          <p className="mt-4 text-secondary-600 dark:text-secondary-400">Verifying session...</p>
        </div>
      </div>
    );
  }

  // If the user is already authenticated, redirect them to the dashboard.
  if (isAuthenticated) {
    return <Navigate to="/dashboard/overview" replace />;
  }

  // Handle the form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError('');

    try {
      await login({ email, password });
      // On success, the AuthProvider will update its state, and this component
      // will re-render, triggering the authenticated redirect.
    } catch (err) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/10 dark:via-indigo-900/10 dark:to-purple-900/10 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-full shadow-lg">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">OT Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-300">Secure access to your requirements system</p>
        </div>

        {/* Login Card */}
        <div className="bg-white dark:bg-secondary-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-secondary-700">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-secondary-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white dark:bg-secondary-700 text-gray-900 dark:text-white"
                  placeholder="Enter your email"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-secondary-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white dark:bg-secondary-700 text-gray-900 dark:text-white"
                  placeholder="Enter your password"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center space-x-2 text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 p-3 rounded-lg">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin h-5 w-5" />
              ) : (
                <>
                  <Shield className="h-5 w-5" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-gray-50 dark:bg-secondary-700/50 rounded-lg border border-gray-200 dark:border-secondary-600/50">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Demo Credentials:</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Email: <code className="bg-gray-200 dark:bg-secondary-600 px-1 rounded">admin@ot-dashboard.com</code>
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Password: <code className="bg-gray-200 dark:bg-secondary-600 px-1 rounded">demo123</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
