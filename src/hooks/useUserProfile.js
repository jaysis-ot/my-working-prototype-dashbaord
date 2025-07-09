// src/hooks/useUserProfile.js
import { useMemo } from 'react';
import { useAuth } from '../auth/AuthContext';

/**
 * useUserProfile Hook
 * 
 * A custom hook for user profile management that provides utilities
 * for displaying user information consistently across the application.
 * 
 * @returns {Object} User profile utilities
 */
const useUserProfile = () => {
  const { user } = useAuth();

  // Memoize all the profile utilities to prevent unnecessary recalculations
  return useMemo(() => {
    // Generate user initials from name
    const getInitials = () => {
      if (!user || !user.name) return 'U';
      return user.name
        .split(' ')
        .map(part => part[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    };

    // Get formatted user name
    const getDisplayName = () => {
      if (!user) return 'Guest User';
      return user.name || user.email?.split('@')[0] || 'User';
    };

    // Get user status
    const getUserStatus = () => {
      if (!user) return 'offline';
      
      // In a real app, this would check against last activity timestamp
      // For demo purposes, we'll return 'online' for logged-in users
      return 'online';
    };

    // Get status color for UI display
    const getStatusColor = () => {
      const status = getUserStatus();
      switch (status) {
        case 'online': return 'bg-green-500';
        case 'away': return 'bg-yellow-500';
        case 'busy': return 'bg-red-500';
        case 'offline': return 'bg-gray-400';
        default: return 'bg-gray-400';
      }
    };

    // Format time since last active
    const getLastActiveTime = () => {
      if (!user || !user.lastLogin) return 'Never';
      
      try {
        const lastLogin = new Date(user.lastLogin);
        const now = new Date();
        const diffMs = now - lastLogin;
        const diffMins = Math.floor(diffMs / 60000);
        
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h ago`;
        
        const diffDays = Math.floor(diffHours / 24);
        if (diffDays < 30) return `${diffDays}d ago`;
        
        const diffMonths = Math.floor(diffDays / 30);
        return `${diffMonths}mo ago`;
      } catch (error) {
        console.error('Error formatting last active time:', error);
        return 'Unknown';
      }
    };

    // Get profile image with fallback
    const getProfileImage = () => {
      if (!user) return null;
      return user.profileImage || null;
    };

    // Check if user has a profile image
    const hasProfileImage = () => {
      return !!getProfileImage();
    };

    // Get user role with default
    const getUserRole = () => {
      if (!user) return 'Guest';
      return user.role || 'User';
    };

    // Get user email with privacy option
    const getUserEmail = (private = false) => {
      if (!user || !user.email) return '';
      if (private) {
        const parts = user.email.split('@');
        if (parts.length !== 2) return user.email;
        const username = parts[0];
        const domain = parts[1];
        const hiddenUsername = username.substring(0, 2) + '***';
        return `${hiddenUsername}@${domain}`;
      }
      return user.email;
    };

    // Format user data for display or API
    const formatUserData = (includePrivate = false) => {
      if (!user) return { isGuest: true };
      
      return {
        id: user.id,
        name: getDisplayName(),
        initials: getInitials(),
        email: getUserEmail(false),
        role: getUserRole(),
        status: getUserStatus(),
        lastActive: getLastActiveTime(),
        profileImage: getProfileImage(),
        hasProfileImage: hasProfileImage(),
        // Only include private/sensitive data if explicitly requested
        ...(includePrivate ? {
          // Add any sensitive fields here
        } : {})
      };
    };

    // Return all utilities
    return {
      user,
      isAuthenticated: !!user,
      getInitials,
      getDisplayName,
      getUserStatus,
      getStatusColor,
      getLastActiveTime,
      getProfileImage,
      hasProfileImage,
      getUserRole,
      getUserEmail,
      formatUserData
    };
  }, [user]);
};

export default useUserProfile;
