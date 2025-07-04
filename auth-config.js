// src/auth/auth-config.js
export const JWT_CONFIG = {
  // Token settings
  accessTokenExpiry: 15 * 60, // 15 minutes (in seconds)
  refreshTokenExpiry: 7 * 24 * 60 * 60, // 7 days (in seconds)
  issuer: 'ot-dashboard',
  audience: 'ot-requirements-system',
  
  // Security settings
  algorithm: 'HS256',
  secret: 'your-secure-secret-key-2024', // ⚠️ CHANGE THIS TO YOUR OWN SECRET
  
  // Feature toggles
  enableRefreshTokens: true,
  autoRefresh: true,
  maxLoginAttempts: 3,
  lockoutDuration: 15 * 60 * 1000, // 15 minutes
  
  // Demo settings - set to false for production
  demoMode: true,
  demoPassword: 'demo123' // ⚠️ CHANGE THIS TO YOUR SECURE PASSWORD
};

export default JWT_CONFIG;