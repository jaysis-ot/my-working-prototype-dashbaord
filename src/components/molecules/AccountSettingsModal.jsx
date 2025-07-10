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
import useAuth from '../../auth/useAuth';
import { useTheme } from '../../contexts/ThemeContext';
import Button from '../atoms/Button';

/**
 * AccountSettingsModal Component
 * 
 * A comprehensive modal for editing user account settings with tabs for
 * different categories of settings (profile, security, preferences).
 * 
 * @param {Object} props Component props
 * @param {boolean} props.isOpen Whether the modal is open
 * @param {Function} props.onClose Function to close the modal
 */
const AccountSettingsModal = ({ isOpen, onClose }) => {
  const { user, updateUserProfile, changePassword } = useAuth();
  const { isDark, setTheme, themes } = useTheme();
  
  // Tab state
  const [activeTab, setActiveTab] = useState('profile');
  
  // Form state
  const [formData, setFormData] = useState({
    // Profile
    name: '',
    email: '',
    jobTitle: '',
    department: '',
    phone: '',
    location: '',
    profileImage: null,
    
    // Security
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: false,
    
    // Preferences
    theme: isDark ? 'dark' : 'light',
    language: 'en',
    emailNotifications: true,
    pushNotifications: true,
    weeklyDigest: true
  });
  
  // Validation state
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  
  // Show/hide password fields
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  
  // File upload preview
  const [imagePreview, setImagePreview] = useState(null);
  
  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setFormData(prevData => ({
        ...prevData,
        name: user.name || '',
        email: user.email || '',
        jobTitle: user.jobTitle || '',
        department: user.department || '',
        phone: user.phone || '',
        location: user.location || '',
        profileImage: null,
        theme: isDark ? 'dark' : 'light',
        language: user.language || 'en',
        emailNotifications: user.preferences?.emailNotifications !== false,
        pushNotifications: user.preferences?.pushNotifications !== false,
        weeklyDigest: user.preferences?.weeklyDigest !== false
      }));
      
      // Reset any previous success message or errors when modal opens
      setSuccessMessage('');
      setErrors({});
    }
  }, [user, isDark, isOpen]);
  
  // Handle form field changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Use the checked property for checkboxes, value for other inputs
    const inputValue = type === 'checkbox' ? checked : value;
    
    setFormData(prevData => ({
      ...prevData,
      [name]: inputValue
    }));
    
    // Clear error for this field when user makes changes
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    // Clear success message when user makes changes
    if (successMessage) {
      setSuccessMessage('');
    }
  };
  
  // Handle file upload for profile image
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prevData => ({
        ...prevData,
        profileImage: file
      }));
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Handle theme change
  const handleThemeChange = (theme) => {
    setFormData(prevData => ({
      ...prevData,
      theme
    }));
    
    // Apply theme immediately for preview
    if (theme === 'dark') {
      setTheme(themes.DARK);
    } else if (theme === 'light') {
      setTheme(themes.LIGHT);
    } else {
      setTheme(themes.SYSTEM);
    }
  };
  
  // Validate form data
  const validateForm = (tab) => {
    const newErrors = {};
    
    if (tab === 'profile' || tab === 'all') {
      // Validate profile fields
      if (!formData.name.trim()) {
        newErrors.name = 'Name is required';
      }
      
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Email is invalid';
      }
      
      // Phone validation (optional field)
      if (formData.phone && !/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/.test(formData.phone)) {
        newErrors.phone = 'Phone number is invalid';
      }
    }
    
    if (tab === 'security' || tab === 'all') {
      // Validate security fields if any password field is filled
      if (formData.newPassword || formData.confirmPassword || formData.currentPassword) {
        if (!formData.currentPassword) {
          newErrors.currentPassword = 'Current password is required';
        }
        
        if (!formData.newPassword) {
          newErrors.newPassword = 'New password is required';
        } else if (formData.newPassword.length < 8) {
          newErrors.newPassword = 'Password must be at least 8 characters';
        }
        
        if (!formData.confirmPassword) {
          newErrors.confirmPassword = 'Please confirm your new password';
        } else if (formData.newPassword !== formData.confirmPassword) {
          newErrors.confirmPassword = 'Passwords do not match';
        }
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate current tab
    if (!validateForm(activeTab)) {
      return;
    }
    
    try {
      // Handle profile update
      if (activeTab === 'profile') {
        const profileData = {
          name: formData.name,
          email: formData.email,
          jobTitle: formData.jobTitle,
          department: formData.department,
          phone: formData.phone,
          location: formData.location,
          // Only include profileImage if it was changed
          ...(formData.profileImage && { profileImage: formData.profileImage })
        };
        
        await updateUserProfile(profileData);
        setSuccessMessage('Profile updated successfully');
      }
      
      // Handle security update
      else if (activeTab === 'security') {
        // Only process password change if fields are filled
        if (formData.currentPassword && formData.newPassword) {
          await changePassword(formData.currentPassword, formData.newPassword);
          
          // Clear password fields after successful change
          setFormData(prev => ({
            ...prev,
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          }));
          
          setSuccessMessage('Password changed successfully');
        }
        
        // Handle 2FA toggle (placeholder for future implementation)
        if (user.twoFactorEnabled !== formData.twoFactorEnabled) {
          // This would be implemented with actual 2FA logic
          console.log('2FA setting changed:', formData.twoFactorEnabled);
          setSuccessMessage('Security settings updated successfully');
        }
      }
      
      // Handle preferences update
      else if (activeTab === 'preferences') {
        const preferencesData = {
          language: formData.language,
          preferences: {
            emailNotifications: formData.emailNotifications,
            pushNotifications: formData.pushNotifications,
            weeklyDigest: formData.weeklyDigest
          }
        };
        
        await updateUserProfile(preferencesData);
        setSuccessMessage('Preferences updated successfully');
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      setErrors({ submit: error.message || 'Failed to update settings. Please try again.' });
    }
  };
  
  // If modal is not open, don't render anything
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 fade-in">
      <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Modal header */}
        <div className="flex items-center justify-between p-4 border-b dark:border-secondary-700">
          <h2 className="text-xl font-semibold text-secondary-900 dark:text-white">Account Settings</h2>
          <button
            onClick={onClose}
            className="text-secondary-500 hover:text-secondary-700 dark:hover:text-secondary-300"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Tabs navigation */}
        <div className="flex border-b dark:border-secondary-700">
          <button
            className={`px-6 py-3 font-medium text-sm transition-colors ${
              activeTab === 'profile' 
                ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-500' 
                : 'text-secondary-600 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-secondary-200'
            }`}
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </button>
          <button
            className={`px-6 py-3 font-medium text-sm transition-colors ${
              activeTab === 'security' 
                ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-500' 
                : 'text-secondary-600 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-secondary-200'
            }`}
            onClick={() => setActiveTab('security')}
          >
            Security
          </button>
          <button
            className={`px-6 py-3 font-medium text-sm transition-colors ${
              activeTab === 'preferences' 
                ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-500' 
                : 'text-secondary-600 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-secondary-200'
            }`}
            onClick={() => setActiveTab('preferences')}
          >
            Preferences
          </button>
        </div>
        
        {/* Modal body with scrollable content */}
        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit}>
            {/* Success message */}
            {successMessage && (
              <div className="mb-6 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md flex items-center text-green-700 dark:text-green-400">
                <CheckCircle2 className="w-5 h-5 mr-2 flex-shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}
            
            {/* Error message */}
            {errors.submit && (
              <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md flex items-center text-red-700 dark:text-red-400">
                <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0" />
                <span>{errors.submit}</span>
              </div>
            )}
            
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                {/* Profile image upload */}
                <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b dark:border-secondary-700">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-secondary-100 dark:bg-secondary-700 flex items-center justify-center">
                      {imagePreview || user?.profileImage ? (
                        <img 
                          src={imagePreview || user.profileImage} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl font-bold text-secondary-500 dark:text-secondary-400">
                          {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || 'U'}
                        </span>
                      )}
                    </div>
                    <label 
                      htmlFor="profile-image" 
                      className="absolute bottom-0 right-0 w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center cursor-pointer text-white hover:bg-primary-600 transition-colors"
                    >
                      <Upload className="w-4 h-4" />
                    </label>
                    <input 
                      type="file" 
                      id="profile-image" 
                      name="profileImage" 
                      accept="image/*" 
                      onChange={handleFileChange} 
                      className="hidden" 
                    />
                  </div>
                  <div>
                    <h3 className="font-medium text-secondary-900 dark:text-white">Profile Photo</h3>
                    <p className="text-sm text-secondary-500 dark:text-secondary-400 mt-1">
                      Upload a clear photo to help team members recognize you.
                    </p>
                    <div className="mt-2 text-xs text-secondary-500 dark:text-secondary-400">
                      JPG, PNG or GIF. Maximum 2MB.
                    </div>
                  </div>
                </div>
                
                {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                      Full Name *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-secondary-400" />
                      </div>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className={`
                          block w-full pl-10 pr-3 py-2 rounded-md 
                          border ${errors.name ? 'border-red-500 dark:border-red-500' : 'border-secondary-300 dark:border-secondary-600'} 
                          bg-white dark:bg-secondary-700 
                          text-secondary-900 dark:text-white
                          placeholder-secondary-400 dark:placeholder-secondary-500
                          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                        `}
                        placeholder="Your full name"
                      />
                    </div>
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
                    )}
                  </div>
                  
                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                      Email Address *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-secondary-400" />
                      </div>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className={`
                          block w-full pl-10 pr-3 py-2 rounded-md 
                          border ${errors.email ? 'border-red-500 dark:border-red-500' : 'border-secondary-300 dark:border-secondary-600'} 
                          bg-white dark:bg-secondary-700 
                          text-secondary-900 dark:text-white
                          placeholder-secondary-400 dark:placeholder-secondary-500
                          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                        `}
                        placeholder="your.email@example.com"
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
                    )}
                  </div>
                  
                  {/* Job Title */}
                  <div>
                    <label htmlFor="jobTitle" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                      Job Title
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Briefcase className="h-5 w-5 text-secondary-400" />
                      </div>
                      <input
                        type="text"
                        id="jobTitle"
                        name="jobTitle"
                        value={formData.jobTitle}
                        onChange={handleChange}
                        className="
                          block w-full pl-10 pr-3 py-2 rounded-md 
                          border border-secondary-300 dark:border-secondary-600 
                          bg-white dark:bg-secondary-700 
                          text-secondary-900 dark:text-white
                          placeholder-secondary-400 dark:placeholder-secondary-500
                          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                        "
                        placeholder="Your job title"
                      />
                    </div>
                  </div>
                  
                  {/* Department */}
                  <div>
                    <label htmlFor="department" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                      Department
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Building className="h-5 w-5 text-secondary-400" />
                      </div>
                      <input
                        type="text"
                        id="department"
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        className="
                          block w-full pl-10 pr-3 py-2 rounded-md 
                          border border-secondary-300 dark:border-secondary-600 
                          bg-white dark:bg-secondary-700 
                          text-secondary-900 dark:text-white
                          placeholder-secondary-400 dark:placeholder-secondary-500
                          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                        "
                        placeholder="Your department"
                      />
                    </div>
                  </div>
                  
                  {/* Phone */}
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                      Phone Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-secondary-400" />
                      </div>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className={`
                          block w-full pl-10 pr-3 py-2 rounded-md 
                          border ${errors.phone ? 'border-red-500 dark:border-red-500' : 'border-secondary-300 dark:border-secondary-600'} 
                          bg-white dark:bg-secondary-700 
                          text-secondary-900 dark:text-white
                          placeholder-secondary-400 dark:placeholder-secondary-500
                          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                        `}
                        placeholder="+1 (123) 456-7890"
                      />
                    </div>
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.phone}</p>
                    )}
                  </div>
                  
                  {/* Location */}
                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                      Location
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MapPin className="h-5 w-5 text-secondary-400" />
                      </div>
                      <input
                        type="text"
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        className="
                          block w-full pl-10 pr-3 py-2 rounded-md 
                          border border-secondary-300 dark:border-secondary-600 
                          bg-white dark:bg-secondary-700 
                          text-secondary-900 dark:text-white
                          placeholder-secondary-400 dark:placeholder-secondary-500
                          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                        "
                        placeholder="City, Country"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                {/* Password Change Section */}
                <div className="pb-6 border-b dark:border-secondary-700">
                  <h3 className="text-lg font-medium text-secondary-900 dark:text-white mb-4">Change Password</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Current Password */}
                    <div>
                      <label htmlFor="currentPassword" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                        Current Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-secondary-400" />
                        </div>
                        <input
                          type={showCurrentPassword ? "text" : "password"}
                          id="currentPassword"
                          name="currentPassword"
                          value={formData.currentPassword}
                          onChange={handleChange}
                          className={`
                            block w-full pl-10 pr-10 py-2 rounded-md 
                            border ${errors.currentPassword ? 'border-red-500 dark:border-red-500' : 'border-secondary-300 dark:border-secondary-600'} 
                            bg-white dark:bg-secondary-700 
                            text-secondary-900 dark:text-white
                            placeholder-secondary-400 dark:placeholder-secondary-500
                            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                          `}
                          placeholder="Enter current password"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-secondary-400 hover:text-secondary-600"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        >
                          {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                      {errors.currentPassword && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.currentPassword}</p>
                      )}
                    </div>
                    
                    {/* New Password */}
                    <div>
                      <label htmlFor="newPassword" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                        New Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-secondary-400" />
                        </div>
                        <input
                          type={showNewPassword ? "text" : "password"}
                          id="newPassword"
                          name="newPassword"
                          value={formData.newPassword}
                          onChange={handleChange}
                          className={`
                            block w-full pl-10 pr-10 py-2 rounded-md 
                            border ${errors.newPassword ? 'border-red-500 dark:border-red-500' : 'border-secondary-300 dark:border-secondary-600'} 
                            bg-white dark:bg-secondary-700 
                            text-secondary-900 dark:text-white
                            placeholder-secondary-400 dark:placeholder-secondary-500
                            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                          `}
                          placeholder="Enter new password"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-secondary-400 hover:text-secondary-600"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                      {errors.newPassword && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.newPassword}</p>
                      )}
                      <p className="mt-1 text-xs text-secondary-500 dark:text-secondary-400">
                        Password must be at least 8 characters long.
                      </p>
                    </div>
                    
                    {/* Confirm Password */}
                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-secondary-400" />
                        </div>
                        <input
                          type="password"
                          id="confirmPassword"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          className={`
                            block w-full pl-10 pr-3 py-2 rounded-md 
                            border ${errors.confirmPassword ? 'border-red-500 dark:border-red-500' : 'border-secondary-300 dark:border-secondary-600'} 
                            bg-white dark:bg-secondary-700 
                            text-secondary-900 dark:text-white
                            placeholder-secondary-400 dark:placeholder-secondary-500
                            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                          `}
                          placeholder="Confirm new password"
                        />
                      </div>
                      {errors.confirmPassword && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.confirmPassword}</p>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Two-Factor Authentication */}
                <div className="pb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-secondary-900 dark:text-white">Two-Factor Authentication</h3>
                      <p className="text-sm text-secondary-500 dark:text-secondary-400 mt-1">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <div className="flex items-center">
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, twoFactorEnabled: !prev.twoFactorEnabled }))}
                        className={`
                          relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent 
                          transition-colors duration-200 ease-in-out focus:outline-none
                          ${formData.twoFactorEnabled ? 'bg-primary-600' : 'bg-secondary-300 dark:bg-secondary-600'}
                        `}
                      >
                        <span
                          className={`
                            pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow 
                            transition duration-200 ease-in-out
                            ${formData.twoFactorEnabled ? 'translate-x-5' : 'translate-x-0'}
                          `}
                        />
                      </button>
                      <span className="ml-3 text-sm font-medium text-secondary-700 dark:text-secondary-300">
                        {formData.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  </div>
                  
                  {formData.twoFactorEnabled && (
                    <div className="bg-secondary-50 dark:bg-secondary-800/50 p-4 rounded-md flex items-start">
                      <Shield className="w-6 h-6 text-primary-500 mr-3 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-secondary-700 dark:text-secondary-300">
                          Two-factor authentication adds an extra layer of security to your account. In addition to your password, you'll need to enter a code from your phone.
                        </p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-3"
                          onClick={() => alert('This would open the 2FA setup flow in a real application.')}
                        >
                          Set Up Two-Factor Authentication
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <div className="space-y-6">
                {/* Theme Preferences */}
                <div className="pb-6 border-b dark:border-secondary-700">
                  <h3 className="text-lg font-medium text-secondary-900 dark:text-white mb-4">Theme Preferences</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Light Theme */}
                    <div 
                      className={`
                        p-4 rounded-lg border-2 transition-all cursor-pointer
                        ${formData.theme === 'light' 
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
                          : 'border-secondary-200 dark:border-secondary-700 hover:border-secondary-300 dark:hover:border-secondary-600'}
                      `}
                      onClick={() => handleThemeChange('light')}
                    >
                      <div className="flex justify-center mb-3">
                        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm">
                          <Sun className="w-6 h-6 text-yellow-500" />
                        </div>
                      </div>
                      <div className="text-center">
                        <h4 className="font-medium text-secondary-900 dark:text-white">Light</h4>
                        <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-1">
                          Light background with dark text
                        </p>
                      </div>
                    </div>
                    
                    {/* Dark Theme */}
                    <div 
                      className={`
                        p-4 rounded-lg border-2 transition-all cursor-pointer
                        ${formData.theme === 'dark' 
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
                          : 'border-secondary-200 dark:border-secondary-700 hover:border-secondary-300 dark:hover:border-secondary-600'}
                      `}
                      onClick={() => handleThemeChange('dark')}
                    >
                      <div className="flex justify-center mb-3">
                        <div className="w-12 h-12 rounded-full bg-secondary-800 flex items-center justify-center shadow-sm">
                          <Moon className="w-6 h-6 text-secondary-200" />
                        </div>
                      </div>
                      <div className="text-center">
                        <h4 className="font-medium text-secondary-900 dark:text-white">Dark</h4>
                        <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-1">
                          Dark background with light text
                        </p>
                      </div>
                    </div>
                    
                    {/* System Theme */}
                    <div 
                      className={`
                        p-4 rounded-lg border-2 transition-all cursor-pointer
                        ${formData.theme === 'system' 
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
                          : 'border-secondary-200 dark:border-secondary-700 hover:border-secondary-300 dark:hover:border-secondary-600'}
                      `}
                      onClick={() => handleThemeChange('system')}
                    >
                      <div className="flex justify-center mb-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-white to-secondary-800 flex items-center justify-center shadow-sm">
                          <Palette className="w-6 h-6 text-primary-500" />
                        </div>
                      </div>
                      <div className="text-center">
                        <h4 className="font-medium text-secondary-900 dark:text-white">System</h4>
                        <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-1">
                          Follow system appearance
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Language Preferences */}
                <div className="pb-6 border-b dark:border-secondary-700">
                  <h3 className="text-lg font-medium text-secondary-900 dark:text-white mb-4">Language Preferences</h3>
                  <div className="max-w-md">
                    <label htmlFor="language" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                      Display Language
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Languages className="h-5 w-5 text-secondary-400" />
                      </div>
                      <select
                        id="language"
                        name="language"
                        value={formData.language}
                        onChange={handleChange}
                        className="
                          block w-full pl-10 pr-3 py-2 rounded-md 
                          border border-secondary-300 dark:border-secondary-600 
                          bg-white dark:bg-secondary-700 
                          text-secondary-900 dark:text-white
                          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                        "
                      >
                        <option value="en">English</option>
                        <option value="es">Español</option>
                        <option value="fr">Français</option>
                        <option value="de">Deutsch</option>
                        <option value="ja">日本語</option>
                        <option value="zh">中文</option>
                      </select>
                    </div>
                    <p className="mt-1 text-xs text-secondary-500 dark:text-secondary-400">
                      This will change the language used throughout the dashboard.
                    </p>
                  </div>
                </div>
                
                {/* Notification Preferences */}
                <div>
                  <h3 className="text-lg font-medium text-secondary-900 dark:text-white mb-4">Notification Preferences</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-secondary-900 dark:text-white">Email Notifications</h4>
                        <p className="text-sm text-secondary-500 dark:text-secondary-400">
                          Receive email notifications about important updates
                        </p>
                      </div>
                      <div>
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, emailNotifications: !prev.emailNotifications }))}
                          className={`
                            relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent 
                            transition-colors duration-200 ease-in-out focus:outline-none
                            ${formData.emailNotifications ? 'bg-primary-600' : 'bg-secondary-300 dark:bg-secondary-600'}
                          `}
                        >
                          <span
                            className={`
                              pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow 
                              transition duration-200 ease-in-out
                              ${formData.emailNotifications ? 'translate-x-5' : 'translate-x-0'}
                            `}
                          />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-secondary-900 dark:text-white">Push Notifications</h4>
                        <p className="text-sm text-secondary-500 dark:text-secondary-400">
                          Receive browser notifications for real-time alerts
                        </p>
                      </div>
                      <div>
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, pushNotifications: !prev.pushNotifications }))}
                          className={`
                            relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent 
                            transition-colors duration-200 ease-in-out focus:outline-none
                            ${formData.pushNotifications ? 'bg-primary-600' : 'bg-secondary-300 dark:bg-secondary-600'}
                          `}
                        >
                          <span
                            className={`
                              pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow 
                              transition duration-200 ease-in-out
                              ${formData.pushNotifications ? 'translate-x-5' : 'translate-x-0'}
                            `}
                          />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-secondary-900 dark:text-white">Weekly Digest</h4>
                        <p className="text-sm text-secondary-500 dark:text-secondary-400">
                          Receive a weekly summary of activity and updates
                        </p>
                      </div>
                      <div>
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, weeklyDigest: !prev.weeklyDigest }))}
                          className={`
                            relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent 
                            transition-colors duration-200 ease-in-out focus:outline-none
                            ${formData.weeklyDigest ? 'bg-primary-600' : 'bg-secondary-300 dark:bg-secondary-600'}
                          `}
                        >
                          <span
                            className={`
                              pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow 
                              transition duration-200 ease-in-out
                              ${formData.weeklyDigest ? 'translate-x-5' : 'translate-x-0'}
                            `}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>
        
        {/* Modal footer */}
        <div className="flex justify-end gap-3 p-4 border-t dark:border-secondary-700">
          <Button
            variant="secondary"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            leadingIcon={Save}
          >
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

AccountSettingsModal.propTypes = {
  /**
   * Whether the modal is currently open
   */
  isOpen: PropTypes.bool.isRequired,
  
  /**
   * Function to close the modal
   */
  onClose: PropTypes.func.isRequired
};

export default AccountSettingsModal;
