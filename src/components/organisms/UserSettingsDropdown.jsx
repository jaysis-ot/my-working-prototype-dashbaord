import React, { useState, useRef, useEffect } from 'react';
import { 
  User, 
  LogOut, 
  Settings, 
  Moon, 
  Sun, 
  ChevronDown,
  UserCircle,
  Mail,
  Shield
} from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import AccountSettingsModal from '../molecules/AccountSettingsModal';

/**
 * UserSettingsDropdown Component
 * 
 * A comprehensive user settings dropdown for the dashboard header that displays
 * user information, provides theme toggling, and logout functionality.
 */
const UserSettingsDropdown = () => {
  const { user, logout } = useAuth();
  // `ThemeContext` exposes `isDark` (boolean) rather than `darkMode`
  // Rename for clarity and to avoid ESLint errors.
  const { isDark, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [isAccountSettingsOpen, setIsAccountSettingsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Generate initials from user name
  const getInitials = () => {
    if (!user || !user.name) return 'U';
    return user.name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  // Handle account settings
  const handleAccountSettings = () => {
    // Open Account Settings modal
    setIsAccountSettingsOpen(true);
    setIsOpen(false);
  };

  return (
    <>
    <div className="relative" ref={dropdownRef}>
      {/* User avatar and dropdown toggle */}
      <button
        className="flex items-center space-x-2 focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className="relative">
          {user?.profileImage ? (
            <img
              src={user.profileImage}
              alt={user.name || 'User'}
              className="w-9 h-9 rounded-full object-cover border-2 border-primary-100 dark:border-primary-900"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-medium shadow-sm">
              {getInitials()}
            </div>
          )}
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-white dark:border-secondary-800"></span>
        </div>
        <ChevronDown className={`w-4 h-4 text-secondary-500 dark:text-secondary-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown menu */}
      <div
        className={`
          absolute right-0 mt-2 w-72 rounded-lg shadow-lg py-1 bg-white dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700
          transform origin-top-right transition-all duration-200 ease-in-out z-50
          ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}
        `}
      >
        {/* User info section */}
        <div className="px-4 py-3 border-b border-secondary-200 dark:border-secondary-700">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              {user?.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={user.name || 'User'}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-medium">
                  {getInitials()}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-secondary-900 dark:text-white truncate">
                {user?.name || 'User'}
              </p>
              <div className="flex items-center text-xs text-secondary-500 dark:text-secondary-400">
                <Mail className="w-3 h-3 mr-1" />
                <span className="truncate">{user?.email || 'user@example.com'}</span>
              </div>
              <div className="flex items-center text-xs text-secondary-500 dark:text-secondary-400 mt-0.5">
                <Shield className="w-3 h-3 mr-1" />
                <span>{user?.role || 'User'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Menu items */}
        <div className="py-1">
          {/* Theme toggle */}
          <div className="px-4 py-2 flex items-center justify-between">
            <div className="flex items-center">
              {isDark ? (
                <Moon className="w-4 h-4 mr-2 text-secondary-500 dark:text-secondary-400" />
              ) : (
                <Sun className="w-4 h-4 mr-2 text-secondary-500 dark:text-secondary-400" />
              )}
              <span className="text-sm text-secondary-700 dark:text-secondary-300">
                {isDark ? 'Dark Mode' : 'Light Mode'}
              </span>
            </div>
            <button
              onClick={toggleTheme}
              className={`
                relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent 
                transition-colors duration-200 ease-in-out focus:outline-none
                ${isDark ? 'bg-primary-600' : 'bg-secondary-300'}
              `}
            >
              <span
                className={`
                  pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow 
                  transition duration-200 ease-in-out
                  ${isDark ? 'translate-x-5' : 'translate-x-0'}
                `}
              />
            </button>
          </div>

          {/* Account settings */}
          <button
            onClick={handleAccountSettings}
            className="w-full px-4 py-2 text-sm text-left text-secondary-700 dark:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-700 flex items-center"
          >
            <Settings className="w-4 h-4 mr-2 text-secondary-500 dark:text-secondary-400" />
            Account Settings
          </button>

          {/* Logout button */}
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 text-sm text-left text-secondary-700 dark:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-700 flex items-center border-t border-secondary-200 dark:border-secondary-700 mt-1 pt-1"
          >
            <LogOut className="w-4 h-4 mr-2 text-secondary-500 dark:text-secondary-400" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
    {/* Account Settings Modal */}
    <AccountSettingsModal 
      isOpen={isAccountSettingsOpen} 
      onClose={() => setIsAccountSettingsOpen(false)} 
    />
    </>
  );
};

export default UserSettingsDropdown;
