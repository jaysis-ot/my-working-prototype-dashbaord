// src/auth/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { userDB } from './userDatabase';

// Create the auth context
export const AuthContext = createContext();

// Auth Provider component
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = () => {
      const storedUser = localStorage.getItem('dashboard_current_user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          // Verify the session is still valid (you could add expiry checks here)
          const sessionExpiry = localStorage.getItem('dashboard_session_expiry');
          if (sessionExpiry && new Date(sessionExpiry) > new Date()) {
            setUser(parsedUser);
            setIsAuthenticated(true);
          } else {
            // Session expired
            localStorage.removeItem('dashboard_current_user');
            localStorage.removeItem('dashboard_session_expiry');
          }
        } catch (error) {
          console.error('Error parsing stored user:', error);
          localStorage.removeItem('dashboard_current_user');
          localStorage.removeItem('dashboard_session_expiry');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Login function using the user database
  const login = async (credentials) => {
    try {
      // Authenticate against the user database
      const authenticatedUser = userDB.authenticate(credentials.email, credentials.password);
      
      // Set session expiry (e.g., 8 hours from now)
      const sessionExpiry = new Date();
      sessionExpiry.setHours(sessionExpiry.getHours() + 8);
      
      // Store user and session info
      localStorage.setItem('dashboard_current_user', JSON.stringify(authenticatedUser));
      localStorage.setItem('dashboard_session_expiry', sessionExpiry.toISOString());
      
      setUser(authenticatedUser);
      setIsAuthenticated(true);
      
      return true;
    } catch (error) {
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('dashboard_current_user');
    localStorage.removeItem('dashboard_session_expiry');
    setUser(null);
    setIsAuthenticated(false);
  };

  // Update user profile
  const updateProfile = (updates) => {
    if (!user) return;
    
    try {
      // Update in database
      userDB.updateUser(user.id, { profile: updates });
      
      // Update local state
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('dashboard_current_user', JSON.stringify(updatedUser));
      
      return true;
    } catch (error) {
      console.error('Failed to update profile:', error);
      return false;
    }
  };

  // Change password
  const changePassword = async (currentPassword, newPassword) => {
    if (!user) throw new Error('No user logged in');
    
    try {
      // Verify current password first
      userDB.authenticate(user.email, currentPassword);
      
      // Update password
      userDB.updateUser(user.id, { password: newPassword });
      
      return true;
    } catch (error) {
      throw new Error('Current password is incorrect');
    }
  };

  // Get all users (admin only)
  const getAllUsers = () => {
    if (!user || !user.permissions?.includes('manage_users')) {
      throw new Error('Unauthorized');
    }
    return userDB.getAllUsers();
  };

  // Add new user (admin only)
  const addUser = (email, password, profile) => {
    if (!user || !user.permissions?.includes('manage_users')) {
      throw new Error('Unauthorized');
    }
    return userDB.addUser(email, password, profile);
  };

  // Delete user (admin only)
  const deleteUser = (userId) => {
    if (!user || !user.permissions?.includes('manage_users')) {
      throw new Error('Unauthorized');
    }
    if (userId === user.id) {
      throw new Error('Cannot delete your own account');
    }
    return userDB.deleteUser(userId);
  };

  // Context value
  const value = {
    isAuthenticated,
    user,
    loading,
    login,
    logout,
    updateProfile,
    changePassword,
    getAllUsers,
    addUser,
    deleteUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Export both as default and named export
export default useAuth;