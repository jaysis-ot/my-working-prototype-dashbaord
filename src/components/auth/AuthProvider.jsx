import React, { createContext, useState, useEffect, useContext, useMemo } from 'react';
import PropTypes from 'prop-types';

// --- Configuration (Consolidated from auth-config.js) ---
const JWT_CONFIG = {
  // Secret key for mock signing. In a real app, this would be a secure, environment-specific secret.
  secret: 'my-super-secret-key-for-demo-2024',
  // Token expiration in seconds (e.g., 1 hour)
  tokenExpiry: 60 * 60, 
  // Demo mode credentials
  demoMode: true,
  demoPassword: 'demo123',
  demoEmail: 'admin@ot-dashboard.com'
};

// --- Create Auth Context ---
export const AuthContext = createContext(null);

/**
 * A simplified, consolidated authentication provider for JWT.
 * This component handles token creation, verification, storage, and state management.
 */
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- Token Management Logic (Simplified & Consolidated) ---

  const base64UrlEncode = (str) => {
    return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  };

  const base64UrlDecode = (str) => {
    str = str.replace(/-/g, '+').replace(/_/g, '/');
    while (str.length % 4) {
      str += '=';
    }
    return atob(str);
  };

  const createToken = (payload) => {
    const header = { alg: 'HS256', typ: 'JWT' };
    const encodedHeader = base64UrlEncode(JSON.stringify(header));
    const encodedPayload = base64UrlEncode(JSON.stringify(payload));
    // In a real app, you'd use a crypto library for a proper signature.
    // Here, we just hash the secret for a mock signature.
    const signature = base64UrlEncode(`${encodedHeader}.${encodedPayload}.${JWT_CONFIG.secret}`);
    return `${encodedHeader}.${encodedPayload}.${signature}`;
  };

  const verifyToken = (token) => {
    try {
      const [encodedHeader, encodedPayload, signature] = token.split('.');
      const expectedSignature = base64UrlEncode(`${encodedHeader}.${encodedPayload}.${JWT_CONFIG.secret}`);
      
      if (signature !== expectedSignature) {
        console.error("Invalid token signature.");
        return null;
      }

      const payload = JSON.parse(base64UrlDecode(encodedPayload));
      
      if (payload.exp < Date.now() / 1000) {
        console.warn("Token has expired.");
        return null;
      }
      
      return payload;
    } catch (error) {
      console.error("Token verification failed:", error);
      return null;
    }
  };

  // --- Authentication Functions ---

  const login = async (credentials) => {
    if (JWT_CONFIG.demoMode) {
      if (credentials.email === JWT_CONFIG.demoEmail && credentials.password === JWT_CONFIG.demoPassword) {
        const userPayload = {
          id: 'user-001',
          email: credentials.email,
          name: 'Demo User',
          role: 'admin',
        };

        const tokenPayload = {
          ...userPayload,
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + JWT_CONFIG.tokenExpiry,
        };

        const token = createToken(tokenPayload);
        localStorage.setItem('authToken', token);
        setUser(userPayload);
        setIsAuthenticated(true);
        return true;
      } else {
        throw new Error('Invalid credentials. Please use the demo credentials.');
      }
    }
    // In a real app, this is where you'd make an API call to your backend.
    throw new Error('Non-demo mode is not implemented.');
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
    setIsAuthenticated(false);
  };

  // --- Session Persistence ---

  useEffect(() => {
    setLoading(true);
    try {
      const storedToken = localStorage.getItem('authToken');
      if (storedToken) {
        const decodedToken = verifyToken(storedToken);
        if (decodedToken) {
          const { iat, exp, ...userData } = decodedToken;
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          // Token is invalid or expired, so clear it
          localStorage.removeItem('authToken');
        }
      }
    } catch (error) {
      console.error("Error during initial auth check:", error);
      // Ensure state is clean if an error occurs
      localStorage.removeItem('authToken');
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, []);

  // --- Context Value ---

  const contextValue = useMemo(() => ({
    isAuthenticated,
    user,
    loading,
    login,
    logout,
  }), [isAuthenticated, user, loading]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

/**
 * Custom hook to easily access the authentication context.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
