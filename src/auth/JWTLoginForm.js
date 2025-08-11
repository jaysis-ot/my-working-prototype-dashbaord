// src/auth/JWTLoginForm.js
import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Shield, Lock, User, AlertCircle, Key } from 'lucide-react';
import useAuth from './useAuth';
import { LoginAttemptManager } from './JWTManager';
import { JWT_CONFIG } from './auth-config';

// Helper functions for telemetry
const updateLoginMetrics = (type) => {
  try {
    // Get current date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    
    // Initialize or get existing metrics
    const metricsString = localStorage.getItem('cyberTrustDashboard.metrics') || '{}';
    const metrics = JSON.parse(metricsString);
    
    // Ensure login metrics structure exists
    if (!metrics.login) {
      metrics.login = { total: 0, success: 0, failure: 0, perDay: {} };
    }
    
    // Ensure per-day structure exists
    if (!metrics.login.perDay) {
      metrics.login.perDay = {};
    }
    
    // Ensure today's entry exists
    if (!metrics.login.perDay[today]) {
      metrics.login.perDay[today] = { total: 0, success: 0, failure: 0 };
    }
    
    // Increment total counter
    metrics.login.total = (metrics.login.total || 0) + 1;
    metrics.login.perDay[today].total = (metrics.login.perDay[today].total || 0) + 1;
    
    // Set timestamp
    metrics.login.lastAttemptAt = Date.now();
    
    // Increment specific counter based on type
    if (type === 'success' || type === 'failure') {
      metrics.login[type] = (metrics.login[type] || 0) + 1;
      metrics.login.perDay[today][type] = (metrics.login.perDay[today][type] || 0) + 1;
    }
    
    // Save updated metrics
    localStorage.setItem('cyberTrustDashboard.metrics', JSON.stringify(metrics));
  } catch (error) {
    // Silently fail to avoid disrupting the login flow
    console.error('Error updating login metrics:', error);
  }
};

export const JWTLoginForm = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lockoutTime, setLockoutTime] = useState(0);
  const { login } = useAuth();

  useEffect(() => {
    if (LoginAttemptManager.isLocked()) {
      const attempts = LoginAttemptManager.getAttempts();
      const remainingTime = JWT_CONFIG.lockoutDuration - (Date.now() - attempts.lastAttempt);
      setLockoutTime(Math.ceil(remainingTime / 1000));
      
      const timer = setInterval(() => {
        const newRemainingTime = JWT_CONFIG.lockoutDuration - (Date.now() - attempts.lastAttempt);
        if (newRemainingTime <= 0) {
          setLockoutTime(0);
          clearInterval(timer);
        } else {
          setLockoutTime(Math.ceil(newRemainingTime / 1000));
        }
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, []);

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    
    // Record login attempt
    updateLoginMetrics('total');

    try {
      await login(formData);
      // Record successful login
      updateLoginMetrics('success');
    } catch (err) {
      setError(err.message);
      // Record failed login
      updateLoginMetrics('failure');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-full">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">TrustGuard</h1>
          <p className="text-gray-600">Secure access to your TrustGuard workspace</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Enter your email"
                  disabled={lockoutTime > 0}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Enter your password"
                  disabled={lockoutTime > 0}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={lockoutTime > 0}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Lockout Message */}
            {lockoutTime > 0 && (
              <div className="flex items-center space-x-2 text-orange-600 bg-orange-50 p-3 rounded-lg">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm">
                  Account locked. Try again in {Math.floor(lockoutTime / 60)}:{(lockoutTime % 60).toString().padStart(2, '0')}
                </span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || lockoutTime > 0}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <Shield className="h-5 w-5" />
                  <span>Sign In with JWT</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
