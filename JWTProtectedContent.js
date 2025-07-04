// src/auth/JWTProtectedContent.js
import React, { useContext } from 'react';
import { Shield, Lock } from 'lucide-react';
import { AuthContext } from './JWTAuthProvider';

export const JWTProtectedContent = ({ children }) => {
  const { user, logout } = useContext(AuthContext);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Shield className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-xl font-semibold text-gray-900">OT Requirements Dashboard</h1>
              <p className="text-sm text-gray-600">JWT-authenticated session • {user?.name}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Lock className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="p-0">
        {children}
      </div>
    </div>
  );
};