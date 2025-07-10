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
import { useAuth } from '../../auth/JWTAuthProvider';
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

  // Close dropdown when clicking outside
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

  const toggleDropdown = () => setIsOpen(!isOpen);
  const closeDropdown = () => setIsOpen(false);

  const handleLogout = () => {
    closeDropdown();
    logout();
  };

  const openAccountSettings = () => {
    closeDropdown();
    setIsAccountSettingsOpen(true);
  };

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={toggleDropdown}
          className="flex items-center space-x-2 p-2 rounded-full hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors"
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center">
            <User className="w-5 h-5" />
          </div>
          <span className="font-medium text-secondary-900 dark:text-white hidden md:block">
            {user?.name || 'User'}
          </span>
          <ChevronDown className={`w-4 h-4 text-secondary-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-secondary-900 rounded-lg shadow-lg py-2 z-50 border border-secondary-200 dark:border-secondary-700">
            {/* User Info */}
            <div className="px-4 py-3 border-b border-secondary-200 dark:border-secondary-700">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-primary-600 text-white flex items-center justify-center">
                  <UserCircle className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-medium text-secondary-900 dark:text-white">
                    {user?.name || 'User'}
                  </div>
                  <div className="text-xs text-secondary-500 dark:text-secondary-400 flex items-center">
                    <Mail className="w-3 h-3 mr-1" />
                    {user?.email || 'user@example.com'}
                  </div>
                </div>
              </div>
              <div className="mt-2 text-xs flex items-center text-primary-600 dark:text-primary-400">
                <Shield className="w-3 h-3 mr-1" />
                {user?.role || 'Admin'} • {user?.department || 'OT Security'}
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-1">
              <button
                onClick={openAccountSettings}
                className="w-full px-4 py-2 text-left text-sm text-secondary-700 dark:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-800 flex items-center"
              >
                <Settings className="w-4 h-4 mr-3 text-secondary-500" />
                Account Settings
              </button>

              <button
                onClick={toggleTheme}
                className="w-full px-4 py-2 text-left text-sm text-secondary-700 dark:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-800 flex items-center"
              >
                {isDark ? (
                  <>
                    <Sun className="w-4 h-4 mr-3 text-secondary-500" />
                    Light Mode
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4 mr-3 text-secondary-500" />
                    Dark Mode
                  </>
                )}
              </button>

              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center"
              >
                <LogOut className="w-4 h-4 mr-3" />
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Account Settings Modal */}
      {isAccountSettingsOpen && (
        <AccountSettingsModal
          isOpen={isAccountSettingsOpen}
          onClose={() => setIsAccountSettingsOpen(false)}
          user={user}
        />
      )}
    </>
  );
};

export default UserSettingsDropdown;
