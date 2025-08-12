// src/auth/JWTAuthProvider.js
import React, { useState, useEffect, createContext } from 'react';
import { JWTManager, TokenStorage, LoginAttemptManager } from './JWTManager';
import { JWT_CONFIG } from './auth-config';
import { userDB } from './userDatabase';

// Create Auth Context
export const AuthContext = createContext();

// JWT Auth Provider Component
export const JWTAuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [tokenInfo, setTokenInfo] = useState(null);

  // Auto-refresh token before expiry
  useEffect(() => {
    let refreshTimer;
    
    const setupAutoRefresh = (token) => {
      if (!JWT_CONFIG.autoRefresh) return;
      
      const expiry = JWTManager.getTokenExpiry(token);
      const now = Date.now();
      const timeUntilExpiry = expiry - now;
      const refreshTime = Math.max(timeUntilExpiry - 60000, 30000); // Refresh 1 min before expiry, min 30s
      
      refreshTimer = setTimeout(() => {
        refreshAccessToken();
      }, refreshTime);
    };
    
    if (isAuthenticated && tokenInfo?.accessToken) {
      setupAutoRefresh(tokenInfo.accessToken);
    }
    
    return () => {
      if (refreshTimer) clearTimeout(refreshTimer);
    };
  }, [isAuthenticated, tokenInfo]);

  // Check for existing valid token on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const accessToken = TokenStorage.getAccessToken();
      
      if (accessToken) {
        try {
          const payload = JWTManager.verifyToken(accessToken);
          setUser(payload.user);
          setIsAuthenticated(true);
          setTokenInfo({
            accessToken,
            expiresAt: payload.exp * 1000,
            issuedAt: payload.iat * 1000
          });
        } catch (error) {
          // Token invalid, try refresh token
          const refreshToken = TokenStorage.getRefreshToken();
          if (refreshToken) {
            try {
              const success = await refreshAccessToken();
              if (!success) {
                TokenStorage.clearTokens();
              }
            } catch {
              TokenStorage.clearTokens();
            }
          } else {
            TokenStorage.clearTokens();
          }
        }
      }
      setLoading(false);
    };
    
    initializeAuth();
  }, []);

  const login = async (credentials) => {
    if (LoginAttemptManager.isLocked()) {
      throw new Error('Account temporarily locked due to too many failed attempts');
    }

    try {
      // Use the userDatabase for authentication
      const authenticatedUser = userDB.authenticate(credentials.email, credentials.password);
      
      LoginAttemptManager.reset();
      
      const userPayload = {
        user: authenticatedUser
      };
      
      // Create access token (15 minutes)
      const accessToken = JWTManager.createToken(userPayload, JWT_CONFIG.accessTokenExpiry);
      
      // Create refresh token (7 days)
      const refreshToken = JWT_CONFIG.enableRefreshTokens ? 
        JWTManager.createToken({ 
          userId: authenticatedUser.id, 
          type: 'refresh' 
        }, JWT_CONFIG.refreshTokenExpiry) : null;
      
      TokenStorage.setTokens(accessToken, refreshToken);
      
      setUser(authenticatedUser);
      setIsAuthenticated(true);
      setTokenInfo({
        accessToken,
        refreshToken,
        expiresAt: JWTManager.getTokenExpiry(accessToken),
        issuedAt: Date.now()
      });
      
      return true;
    } catch (error) {
      LoginAttemptManager.recordAttempt();
      throw error;
    }
  };

  const refreshAccessToken = async () => {
    const refreshToken = TokenStorage.getRefreshToken();
    if (!refreshToken) return false;
    
    try {
      const payload = JWTManager.verifyToken(refreshToken);
      if (payload.type !== 'refresh') throw new Error('Invalid refresh token');
      
      // Get current user data
      const currentUser = user || {
        id: payload.userId,
        email: 'user@company.com',
        name: 'User',
        role: 'viewer',
        permissions: ['read']
      };
      
      const userPayload = {
        user: currentUser
      };
      
      const newAccessToken = JWTManager.createToken(userPayload, JWT_CONFIG.accessTokenExpiry);
      TokenStorage.setTokens(newAccessToken, refreshToken);
      
      setTokenInfo(prev => ({
        ...prev,
        accessToken: newAccessToken,
        expiresAt: JWTManager.getTokenExpiry(newAccessToken),
        issuedAt: Date.now()
      }));
      
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
      return false;
    }
  };

  const logout = () => {
    TokenStorage.clearTokens();
    setIsAuthenticated(false);
    setUser(null);
    setTokenInfo(null);
  };

  const getAuthHeader = () => {
    const token = TokenStorage.getAccessToken();
    return token ? `Bearer ${token}` : null;
  };

  // User management functions (delegated to userDB)
  const getAllUsers = () => {
    if (!user || !user.permissions?.includes('manage_users')) {
      throw new Error('Unauthorized');
    }
    return userDB.getAllUsers();
  };

  const addUser = (email, password, profile) => {
    if (!user || !user.permissions?.includes('manage_users')) {
      throw new Error('Unauthorized');
    }
    return userDB.addUser(email, password, profile);
  };

  const updateUser = (userId, updates) => {
    if (!user || !user.permissions?.includes('manage_users')) {
      throw new Error('Unauthorized');
    }
    return userDB.updateUser(userId, updates);
  };

  const deleteUser = (userId) => {
    if (!user || !user.permissions?.includes('manage_users')) {
      throw new Error('Unauthorized');
    }
    if (userId === user.id) {
      throw new Error('Cannot delete your own account');
    }
    return userDB.deleteUser(userId);
  };

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

  const value = {
    isAuthenticated,
    loading,
    user,
    tokenInfo,
    login,
    logout,
    refreshAccessToken,
    getAuthHeader,
    getAllUsers,
    addUser,
    updateUser,
    deleteUser,
    changePassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use auth context
export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default JWTAuthProvider;