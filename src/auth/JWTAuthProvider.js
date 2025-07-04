// src/auth/JWTAuthProvider.js
import React, { useState, useEffect, createContext } from 'react';
import { JWTManager, TokenStorage, LoginAttemptManager } from './JWTManager';
import { JWT_CONFIG } from './auth-config';

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

    // Demo authentication - replace with your authentication logic
    const isValidCredentials = JWT_CONFIG.demoMode 
      ? (credentials.password === JWT_CONFIG.demoPassword)
      : false; // Add your real authentication here

    if (isValidCredentials) {
      LoginAttemptManager.reset();
      
      const userPayload = {
        user: {
          id: '12345',
          email: credentials.email,
          name: 'OT Administrator',
          role: 'admin',
          permissions: ['read', 'write', 'admin'],
          department: 'OT Security',
          lastLogin: new Date().toISOString()
        }
      };
      
      // Create access token (15 minutes)
      const accessToken = JWTManager.createToken(userPayload, JWT_CONFIG.accessTokenExpiry);
      
      // Create refresh token (7 days)
      const refreshToken = JWT_CONFIG.enableRefreshTokens ? 
        JWTManager.createToken({ 
          userId: userPayload.user.id, 
          type: 'refresh' 
        }, JWT_CONFIG.refreshTokenExpiry) : null;
      
      TokenStorage.setTokens(accessToken, refreshToken);
      
      setUser(userPayload.user);
      setIsAuthenticated(true);
      setTokenInfo({
        accessToken,
        refreshToken,
        expiresAt: JWTManager.getTokenExpiry(accessToken),
        issuedAt: Date.now()
      });
      
      return true;
    } else {
      LoginAttemptManager.recordAttempt();
      throw new Error('Invalid credentials');
    }
  };

  const refreshAccessToken = async () => {
    const refreshToken = TokenStorage.getRefreshToken();
    if (!refreshToken) return false;
    
    try {
      const payload = JWTManager.verifyToken(refreshToken);
      if (payload.type !== 'refresh') throw new Error('Invalid refresh token');
      
      const userPayload = {
        user: {
          id: payload.userId,
          email: user?.email || 'admin@ot-dashboard.com',
          name: user?.name || 'OT Administrator',
          role: 'admin',
          permissions: ['read', 'write', 'admin'],
          department: 'OT Security',
          lastLogin: new Date().toISOString()
        }
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

  const value = {
    isAuthenticated,
    user,
    tokenInfo,
    login,
    logout,
    refreshAccessToken,
    getAuthHeader,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};