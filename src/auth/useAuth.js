// src/auth/useAuth.js
import { useContext } from 'react';
import { AuthContext } from './JWTAuthProvider';

/**
 * Custom hook for accessing authentication context
 * 
 * Provides access to authentication state and methods:
 * - isAuthenticated: boolean indicating if user is logged in
 * - user: current user object
 * - login: function to authenticate user
 * - logout: function to sign out
 * - loading: boolean indicating if auth state is being determined
 * - getAuthHeader: function to get Authorization header for API requests
 * 
 * @returns {Object} Authentication context value
 * @throws {Error} If used outside of AuthProvider
 */
const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default useAuth;
