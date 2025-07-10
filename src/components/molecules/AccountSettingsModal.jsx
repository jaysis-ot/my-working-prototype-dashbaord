import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  Building, 
  Lock, 
  Bell, 
  Languages, 
  Palette, 
  X, 
  Save, 
  Upload, 
  Shield, 
  AlertTriangle, 
  CheckCircle2,
  Sun,
  Eye,
  EyeOff,
  Moon
} from 'lucide-react';
import { useAuth } from '../../auth/JWTAuthProvider';
import { useTheme } from '../../contexts/ThemeContext';
import Button from '../atoms/Button';

/**
 * AccountSettingsModal Component
 * 
 * A comprehensive modal for managing user account settings with multiple tabs
 * for different settings categories.
 */
const AccountSettingsModal = ({ isOpen, onClose, user }) => {
  const { isDark, toggleTheme } = useTheme();
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    name: user?.name || 'OT Administrator',
    email: user?.email || 'admin@example.com',
    phone: user?.phone || '+1 (555) 123-4567',
    location: user?.location || 'San Francisco, CA',
    department: user?.department || 'OT Security',
    role: user?.role || 'Admin',
    company: user?.company || 'Acme Industrial',
    language: user?.language || 'English',
    notifications: {
      email: true,
      browser: true,
      mobile: false,
      weekly: true,
      security: true
    },
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [saveStatus, setSaveStatus] = useState(null);

  // Handle click outside to close
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSaveStatus(null);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSave = () => {
    // Simulate API call
    setSaveStatus('loading');
    setTimeout(() => {
      setSaveStatus('success');
      // Reset after 3 seconds
      setTimeout(() => setSaveStatus(null), 3000);
    }, 1000);
  };

  const handleLogout = () => {
    onClose();
    logout();
  };

  const renderProfileTab = () => (
    <div className="space-y-6">
      <div className="flex flex-col items-center mb-6">
        <div className="w-24 h-24 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-4">
          <User className="w-12 h-12 text-primary-600 dark:text-primary-400" />
        </div>
        <button className="text-sm text-primary-600 dark:text-primary-400 flex items-center">
          <Upload className="w-4 h-4 mr-1" />
          Upload photo
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
            Full Name
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400" />
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full pl-10 pr-4 py-2 border border-secondary-300 dark:border-secondary-700 rounded-lg bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full pl-10 pr-4 py-2 border border-secondary-300 dark:border-secondary-700 rounded-lg bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
            Phone Number
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400" />
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full pl-10 pr-4 py-2 border border-secondary-300 dark:border-secondary-700 rounded-lg bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
            Location
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400" />
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              className="w-full pl-10 pr-4 py-2 border border-secondary-300 dark:border-secondary-700 rounded-lg bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
            Department
          </label>
          <div className="relative">
            <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400" />
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleInputChange}
              className="w-full pl-10 pr-4 py-2 border border-secondary-300 dark:border-secondary-700 rounded-lg bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
            Role
          </label>
          <div className="relative">
            <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400" />
            <select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className="w-full pl-10 pr-4 py-2 border border-secondary-300 dark:border-secondary-700 rounded-lg bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
            >
              <option value="Admin">Admin</option>
              <option value="Manager">Manager</option>
              <option value="Analyst">Analyst</option>
              <option value="Viewer">Viewer</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
            Company
          </label>
          <div className="relative">
            <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400" />
            <input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleInputChange}
              className="w-full pl-10 pr-4 py-2 border border-secondary-300 dark:border-secondary-700 rounded-lg bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="space-y-6">
      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
        <div className="flex items-start">
          <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-400">Password Security</h3>
            <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
              Ensure your new password is at least 8 characters and includes a mix of letters, numbers, and symbols.
            </p>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
          Current Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400" />
          <input
            type={showPassword.current ? 'text' : 'password'}
            name="currentPassword"
            value={formData.currentPassword}
            onChange={handleInputChange}
            className="w-full pl-10 pr-10 py-2 border border-secondary-300 dark:border-secondary-700 rounded-lg bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
          />
          <button
            type="button"
            onClick={() => togglePasswordVisibility('current')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-400"
          >
            {showPassword.current ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
          New Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400" />
          <input
            type={showPassword.new ? 'text' : 'password'}
            name="newPassword"
            value={formData.newPassword}
            onChange={handleInputChange}
            className="w-full pl-10 pr-10 py-2 border border-secondary-300 dark:border-secondary-700 rounded-lg bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
          />
          <button
            type="button"
            onClick={() => togglePasswordVisibility('new')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-400"
          >
            {showPassword.new ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
          Confirm New Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400" />
          <input
            type={showPassword.confirm ? 'text' : 'password'}
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            className="w-full pl-10 pr-10 py-2 border border-secondary-300 dark:border-secondary-700 rounded-lg bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
          />
          <button
            type="button"
            onClick={() => togglePasswordVisibility('confirm')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-400"
          >
            {showPassword.confirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-secondary-900 dark:text-white">Email Notifications</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="notifications.email"
                checked={formData.notifications.email}
                onChange={handleInputChange}
                className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500 h-4 w-4"
              />
              <span className="ml-2 text-sm text-secondary-700 dark:text-secondary-300">
                Security alerts
              </span>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="notifications.browser"
                checked={formData.notifications.browser}
                onChange={handleInputChange}
                className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500 h-4 w-4"
              />
              <span className="ml-2 text-sm text-secondary-700 dark:text-secondary-300">
                Browser notifications
              </span>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="notifications.mobile"
                checked={formData.notifications.mobile}
                onChange={handleInputChange}
                className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500 h-4 w-4"
              />
              <span className="ml-2 text-sm text-secondary-700 dark:text-secondary-300">
                Mobile push notifications
              </span>
            </label>
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-secondary-900 dark:text-white">Summary Reports</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="notifications.weekly"
                checked={formData.notifications.weekly}
                onChange={handleInputChange}
                className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500 h-4 w-4"
              />
              <span className="ml-2 text-sm text-secondary-700 dark:text-secondary-300">
                Weekly summary reports
              </span>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="notifications.security"
                checked={formData.notifications.security}
                onChange={handleInputChange}
                className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500 h-4 w-4"
              />
              <span className="ml-2 text-sm text-secondary-700 dark:text-secondary-300">
                Security incident reports
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPreferencesTab = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
          Language
        </label>
        <div className="relative">
          <Languages className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400" />
          <select
            name="language"
            value={formData.language}
            onChange={handleInputChange}
            className="w-full pl-10 pr-4 py-2 border border-secondary-300 dark:border-secondary-700 rounded-lg bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
          >
            <option value="English">English</option>
            <option value="Spanish">Spanish</option>
            <option value="French">French</option>
            <option value="German">German</option>
            <option value="Japanese">Japanese</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
          Theme
        </label>
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => !isDark && toggleTheme()}
            className={`flex items-center justify-center p-4 border rounded-lg ${
              !isDark 
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
                : 'border-secondary-300 dark:border-secondary-700'
            }`}
          >
            <div className="flex flex-col items-center">
              <Sun className={`w-6 h-6 mb-2 ${!isDark ? 'text-primary-600' : 'text-secondary-400'}`} />
              <span className={`text-sm font-medium ${!isDark ? 'text-primary-700' : 'text-secondary-500 dark:text-secondary-400'}`}>
                Light
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => isDark && toggleTheme()}
            className={`flex items-center justify-center p-4 border rounded-lg ${
              isDark 
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
                : 'border-secondary-300 dark:border-secondary-700'
            }`}
          >
            <div className="flex flex-col items-center">
              <Moon className={`w-6 h-6 mb-2 ${isDark ? 'text-primary-600' : 'text-secondary-400'}`} />
              <span className={`text-sm font-medium ${isDark ? 'text-primary-700 dark:text-primary-400' : 'text-secondary-500 dark:text-secondary-400'}`}>
                Dark
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'profile':
        return renderProfileTab();
      case 'security':
        return renderSecurityTab();
      case 'notifications':
        return renderNotificationsTab();
      case 'preferences':
        return renderPreferencesTab();
      default:
        return renderProfileTab();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="fixed inset-0 bg-black bg-opacity-30 transition-opacity" onClick={onClose}></div>
        
        <div className="relative transform overflow-hidden rounded-lg bg-white dark:bg-secondary-900 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-3xl">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-secondary-200 dark:border-secondary-700">
            <h3 className="text-lg font-medium text-secondary-900 dark:text-white">Account Settings</h3>
            <button
              onClick={onClose}
              className="text-secondary-400 hover:text-secondary-500 dark:hover:text-secondary-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Tabs */}
          <div className="flex border-b border-secondary-200 dark:border-secondary-700">
            <button
              onClick={() => handleTabChange('profile')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'profile'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-secondary-500 hover:text-secondary-700 dark:text-secondary-400 dark:hover:text-secondary-300'
              }`}
            >
              Profile
            </button>
            <button
              onClick={() => handleTabChange('security')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'security'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-secondary-500 hover:text-secondary-700 dark:text-secondary-400 dark:hover:text-secondary-300'
              }`}
            >
              Security
            </button>
            <button
              onClick={() => handleTabChange('notifications')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'notifications'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-secondary-500 hover:text-secondary-700 dark:text-secondary-400 dark:hover:text-secondary-300'
              }`}
            >
              Notifications
            </button>
            <button
              onClick={() => handleTabChange('preferences')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'preferences'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-secondary-500 hover:text-secondary-700 dark:text-secondary-400 dark:hover:text-secondary-300'
              }`}
            >
              Preferences
            </button>
          </div>
          
          {/* Content */}
          <div className="p-6">
            {renderActiveTab()}
          </div>
          
          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-secondary-200 dark:border-secondary-700 bg-secondary-50 dark:bg-secondary-800">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleLogout}
                className="flex items-center text-sm text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400"
              >
                <LogOut className="w-4 h-4 mr-1" />
                Sign Out
              </button>
              
              {saveStatus === 'success' && (
                <div className="flex items-center text-green-600 dark:text-green-500">
                  <CheckCircle2 className="w-4 h-4 mr-1" />
                  <span className="text-sm">Changes saved</span>
                </div>
              )}
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-secondary-300 dark:border-secondary-700 rounded-md text-secondary-700 dark:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-800"
              >
                Cancel
              </button>
              
              <Button
                onClick={handleSave}
                variant="primary"
                loading={saveStatus === 'loading'}
                icon={<Save className="w-4 h-4" />}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

AccountSettingsModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  user: PropTypes.object
};

export default AccountSettingsModal;
