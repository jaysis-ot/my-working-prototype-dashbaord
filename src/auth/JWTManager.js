// src/auth/JWTManager.js
import { JWT_CONFIG } from './auth-config';

export const JWTManager = {
  // Create JWT token
  createToken: (payload, expiresIn = JWT_CONFIG.accessTokenExpiry) => {
    const header = {
      alg: JWT_CONFIG.algorithm,
      typ: 'JWT'
    };
    
    const now = Math.floor(Date.now() / 1000);
    const tokenPayload = {
      ...payload,
      iat: now,
      exp: now + expiresIn,
      iss: JWT_CONFIG.issuer,
      aud: JWT_CONFIG.audience
    };
    
    // Simple base64 encoding (upgrade to proper JWT library for production)
    const encodedHeader = btoa(JSON.stringify(header));
    const encodedPayload = btoa(JSON.stringify(tokenPayload));
    const signature = btoa(`${encodedHeader}.${encodedPayload}.${JWT_CONFIG.secret}`);
    
    return `${encodedHeader}.${encodedPayload}.${signature}`;
  },
  
  // Verify and decode JWT token
  verifyToken: (token) => {
    try {
      const [header, payload, signature] = token.split('.');
      
      // Verify signature
      const expectedSignature = btoa(`${header}.${payload}.${JWT_CONFIG.secret}`);
      if (signature !== expectedSignature) {
        throw new Error('Invalid signature');
      }
      
      const decodedPayload = JSON.parse(atob(payload));
      
      // Check expiration
      const now = Math.floor(Date.now() / 1000);
      if (decodedPayload.exp < now) {
        throw new Error('Token expired');
      }
      
      return decodedPayload;
    } catch (error) {
      throw new Error('Invalid token');
    }
  },
  
  // Check if token is expired
  isTokenExpired: (token) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Math.floor(Date.now() / 1000);
      return payload.exp < now;
    } catch {
      return true;
    }
  },
  
  // Get token expiry time
  getTokenExpiry: (token) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000; // Convert to milliseconds
    } catch {
      return 0;
    }
  }
};

// Token storage management
export const TokenStorage = {
  setTokens: (accessToken, refreshToken = null) => {
    localStorage.setItem('ot_access_token', accessToken);
    if (refreshToken) {
      localStorage.setItem('ot_refresh_token', refreshToken);
    }
    
    // Also store in memory for quick access
    TokenStorage._memoryTokens = { accessToken, refreshToken };
  },
  
  getAccessToken: () => {
    return TokenStorage._memoryTokens?.accessToken || localStorage.getItem('ot_access_token');
  },
  
  getRefreshToken: () => {
    return TokenStorage._memoryTokens?.refreshToken || localStorage.getItem('ot_refresh_token');
  },
  
  clearTokens: () => {
    localStorage.removeItem('ot_access_token');
    localStorage.removeItem('ot_refresh_token');
    localStorage.removeItem('loginAttempts');
    TokenStorage._memoryTokens = null;
  },
  
  _memoryTokens: null
};

// Login attempt tracking
export const LoginAttemptManager = {
  getAttempts: () => {
    const attempts = localStorage.getItem('loginAttempts');
    return attempts ? JSON.parse(attempts) : { count: 0, lastAttempt: 0 };
  },
  
  recordAttempt: () => {
    const attempts = LoginAttemptManager.getAttempts();
    attempts.count += 1;
    attempts.lastAttempt = Date.now();
    localStorage.setItem('loginAttempts', JSON.stringify(attempts));
    return attempts;
  },
  
  isLocked: () => {
    const attempts = LoginAttemptManager.getAttempts();
    if (attempts.count >= JWT_CONFIG.maxLoginAttempts) {
      const timeSinceLastAttempt = Date.now() - attempts.lastAttempt;
      return timeSinceLastAttempt < JWT_CONFIG.lockoutDuration;
    }
    return false;
  },
  
  reset: () => {
    localStorage.removeItem('loginAttempts');
  }
};