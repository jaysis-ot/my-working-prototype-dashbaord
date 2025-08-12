// src/auth/useAuth.js
import { useContext } from 'react';
import { AuthContext } from './AuthContext';

/**
 * Custom hook to use authentication context
 * @returns {Object} Authentication context value
 */
const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

// Default export
export default useAuth;

// Also export as named export for flexibility
export { useAuth };