// src/auth/auth-config.js

/**
 * JWT Authentication Configuration
 * 
 * This file contains all the configuration settings for the JWT authentication system.
 * In production, these values should come from environment variables.
 */

export const JWT_CONFIG = {
  // Token settings
  accessTokenExpiry: 15 * 60, // 15 minutes (in seconds)
  refreshTokenExpiry: 7 * 24 * 60 * 60, // 7 days (in seconds)
  issuer: 'business-assurance-platform',
  audience: 'risk-intelligence-dashboard',
  
  // Security settings
  algorithm: 'HS256',
  secret: 'your-secure-secret-key-2024', // ⚠️ CHANGE THIS IN PRODUCTION
  
  // Feature toggles
  enableRefreshTokens: true,
  autoRefresh: true,
  maxLoginAttempts: 3,
  lockoutDuration: 15 * 60 * 1000, // 15 minutes (in milliseconds)
  
  // Demo settings - set to false for production
  demoMode: false, // Changed to false since we're using the new user database
  demoEmail: 'admin@dashboard.com', // No longer used with new user system
  demoPassword: 'demo123' // No longer used with new user system
};

// Storage keys for localStorage
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'business_assurance_access_token',
  REFRESH_TOKEN: 'business_assurance_refresh_token',
  USER_DATA: 'business_assurance_user',
  LOGIN_ATTEMPTS: 'business_assurance_login_attempts'
};

// API endpoints (for future backend integration)
export const AUTH_ENDPOINTS = {
  LOGIN: '/api/auth/login',
  LOGOUT: '/api/auth/logout',
  REFRESH: '/api/auth/refresh',
  VERIFY: '/api/auth/verify',
  USER_PROFILE: '/api/auth/profile'
};

// Role permissions mapping
export const ROLE_PERMISSIONS = {
  admin: ['read', 'write', 'delete', 'admin', 'manage_users', 'system_config'],
  manager: ['read', 'write', 'approve', 'manage_team'],
  analyst: ['read', 'write', 'analyze'],
  viewer: ['read']
};

// Default user session settings
export const SESSION_CONFIG = {
  sessionTimeout: 8 * 60 * 60 * 1000, // 8 hours (in milliseconds)
  inactivityTimeout: 30 * 60 * 1000, // 30 minutes (in milliseconds)
  rememberMeDuration: 30 * 24 * 60 * 60 * 1000 // 30 days (in milliseconds)
};

export default JWT_CONFIG;