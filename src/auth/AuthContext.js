// src/auth/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';

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
      const storedUser = localStorage.getItem('dashboard_user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Error parsing stored user:', error);
          localStorage.removeItem('dashboard_user');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Login function - simplified for demo
  const login = async (credentials) => {
    // Demo credentials check
    if (credentials.email === 'admin@dashboard.com' && credentials.password === 'demo123') {
      const user = {
        id: '12345',
        email: credentials.email,
        name: 'Admin User',
        role: 'admin',
        // Additional demo profile data for testing Account Settings modal
        jobTitle: 'Security Administrator',
        department: 'IT Security',
        phone: '+1 (555) 123-4567',
        location: 'New York, USA',
        profileImage: null,
        language: 'en',
        preferences: {
          emailNotifications: true,
          pushNotifications: true,
          weeklyDigest: true
        },
        twoFactorEnabled: false,
        // Store the plaintext password ONLY for demo purposes.
        // NEVER do this in production code.
        password: credentials.password,
        lastLogin: new Date().toISOString()
      };
      
      // Store in localStorage for persistence
      localStorage.setItem('dashboard_user', JSON.stringify(user));
      
      setUser(user);
      setIsAuthenticated(true);
      return true;
    } else {
      throw new Error('Invalid credentials');
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('dashboard_user');
    setUser(null);
    setIsAuthenticated(false);
  };

  /**
   * Update the authenticated user's profile.
   * Deep-merges preferences, overwrites other scalar fields.
   * @param {Object} updates - partial user object with fields to update
   * @returns {Promise<Object>} resolves with the updated user
   */
  const updateUserProfile = async (updates = {}) => {
    return new Promise((resolve, reject) => {
      if (!user) {
        return reject(new Error('No authenticated user'));
      }

      // Merge preferences separately to avoid overwriting the whole object
      const mergedPreferences = {
        ...(user.preferences || {}),
        ...(updates.preferences || {})
      };

      const updatedUser = {
        ...user,
        ...updates,
        preferences: mergedPreferences
      };

      try {
        localStorage.setItem('dashboard_user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        resolve(updatedUser);
      } catch (error) {
        console.error('Error updating user profile:', error);
        reject(new Error('Failed to update user profile'));
      }
    });
  };

  /**
   * Change the authenticated user's password.
   * Validates that the provided current password matches the stored one.
   * @param {string} currentPassword
   * @param {string} newPassword
   * @returns {Promise<void>}
   */
  const changePassword = async (currentPassword, newPassword) => {
    return new Promise((resolve, reject) => {
      if (!user) {
        return reject(new Error('No authenticated user'));
      }

      if (currentPassword !== user.password) {
        return reject(new Error('Current password is incorrect'));
      }

      const updatedUser = { ...user, password: newPassword };

      try {
        localStorage.setItem('dashboard_user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        resolve();
      } catch (error) {
        console.error('Error changing password:', error);
        reject(new Error('Failed to change password'));
      }
    });
  };

  // Auth context value
  const value = {
    isAuthenticated,
    user,
    loading,
    login,
    logout,
    updateUserProfile,
    changePassword
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook for using auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
