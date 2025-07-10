import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import {
  Shield,
  Plus,
  Search,
  RefreshCw,
  Download,
  Upload,
  Trash2,
  Edit,
  MoreHorizontal,
  ExternalLink,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Zap,
  Clock,
  Save,
  Link,
  Lock,
  Unlock,
  Server,
  Rss,
  Database,
  Code,
  Filter,
  RotateCw,
  HelpCircle,
  Settings,
  PlayCircle,
  PauseCircle
} from 'lucide-react';
import { useThreatIntelFeeds } from '../../hooks/useThreatIntelFeeds';
import Button from '../atoms/Button';

/**
 * Add/Edit Feed Modal
 */
const FeedFormModal = ({ isOpen, onClose, feed = null, onSave }) => {
  const isEditMode = !!feed;
  const { FEED_TYPES, UPDATE_FREQUENCIES, testFeedConnection } = useThreatIntelFeeds();
  
  const [formData, setFormData] = useState({
    name: feed?.name || '',
    description: feed?.description || '',
    url: feed?.url || '',
    type: feed?.type || FEED_TYPES.API,
    features: feed?.features || [],
    authentication: feed?.authentication || { required: false },
    updateFrequency: feed?.updateFrequency || UPDATE_FREQUENCIES.DAILY,
    logo: feed?.logo || ''
  });
  
  const [errors, setErrors] = useState({});
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [newFeature, setNewFeature] = useState('');
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  const handleAuthChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      authentication: {
        ...prev.authentication,
        [name]: type === 'checkbox' ? checked : value
      }
    }));
  };
  
  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }));
      setNewFeature('');
    }
  };
  
  const removeFeature = (index) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Feed name is required';
    }
    
    if (!formData.url.trim()) {
      newErrors.url = 'Feed URL is required';
    } else if (!/^(https?:\/\/)/.test(formData.url)) {
      newErrors.url = 'URL must start with http:// or https://';
    }
    
    if (formData.authentication.required) {
      if (!formData.authentication.type) {
        newErrors['authentication.type'] = 'Authentication type is required';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleTestConnection = async () => {
    if (!validateForm()) return;
    
    setTestingConnection(true);
    setTestResult(null);
    
    try {
      // Create temporary feed object for testing
      const testFeed = {
        ...formData,
        id: feed?.id || `temp-${Date.now()}`
      };
      
      const result = await testFeedConnection(testFeed.id);
      setTestResult(result);
    } catch (error) {
      setTestResult({
        success: false,
        message: error.message || 'Connection test failed'
      });
    } finally {
      setTestingConnection(false);
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    onSave({
      ...formData,
      id: feed?.id
    });
    
    onClose();
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 fade-in">
      <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Modal header */}
        <div className="flex items-center justify-between p-4 border-b dark:border-secondary-700">
          <h2 className="text-xl font-semibold text-secondary-900 dark:text-white">
            {isEditMode ? 'Edit Threat Intelligence Feed' : 'Add New Threat Intelligence Feed'}
          </h2>
          <button
            onClick={onClose}
            className="text-secondary-500 hover:text-secondary-700 dark:hover:text-secondary-300"
            aria-label="Close modal"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>
        
        {/* Modal body with scrollable content */}
        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit} id="feed-form">
            {/* Basic Information */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-secondary-900 dark:text-white flex items-center mb-4">
                <Shield className="w-5 h-5 mr-2 text-primary-500" />
                Basic Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div className="col-span-2">
                  <label htmlFor="name" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                    Feed Name <span className="text-status-error">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`
                      block w-full px-3 py-2 rounded-md 
                      border ${errors.name ? 'border-status-error' : 'border-secondary-300 dark:border-secondary-600'} 
                      bg-white dark:bg-secondary-700 
                      text-secondary-900 dark:text-white
                      focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                    `}
                    placeholder="e.g., OpenCTI Platform"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-status-error">{errors.name}</p>
                  )}
                </div>
                
                {/* Description */}
                <div className="col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                    className="
                      block w-full px-3 py-2 rounded-md 
                      border border-secondary-300 dark:border-secondary-600 
                      bg-white dark:bg-secondary-700 
                      text-secondary-900 dark:text-white
                      focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                    "
                    placeholder="Describe the feed and what type of intelligence it provides..."
                  ></textarea>
                </div>
                
                {/* URL */}
                <div className="col-span-2">
                  <label htmlFor="url" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                    Feed URL <span className="text-status-error">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Link className="h-5 w-5 text-secondary-400" />
                    </div>
                    <input
                      type="text"
                      id="url"
                      name="url"
                      value={formData.url}
                      onChange={handleChange}
                      className={`
                        block w-full pl-10 pr-3 py-2 rounded-md 
                        border ${errors.url ? 'border-status-error' : 'border-secondary-300 dark:border-secondary-600'} 
                        bg-white dark:bg-secondary-700 
                        text-secondary-900 dark:text-white
                        focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                      `}
                      placeholder="https://example.com/api/threat-feed"
                    />
                  </div>
                  {errors.url && (
                    <p className="mt-1 text-sm text-status-error">{errors.url}</p>
                  )}
                </div>
                
                {/* Feed Type */}
                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                    Feed Type
                  </label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="
                      block w-full px-3 py-2 rounded-md 
                      border border-secondary-300 dark:border-secondary-600 
                      bg-white dark:bg-secondary-700 
                      text-secondary-900 dark:text-white
                      focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                    "
                  >
                    <option value={FEED_TYPES.API}>REST API</option>
                    <option value={FEED_TYPES.RSS}>RSS Feed</option>
                    <option value={FEED_TYPES.STIX}>STIX</option>
                    <option value={FEED_TYPES.TAXII}>TAXII</option>
                    <option value={FEED_TYPES.MISP}>MISP</option>
                    <option value={FEED_TYPES.GRAPHQL}>GraphQL API</option>
                    <option value={FEED_TYPES.OTHER}>Other</option>
                  </select>
                </div>
                
                {/* Update Frequency */}
                <div>
                  <label htmlFor="updateFrequency" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                    Update Frequency
                  </label>
                  <select
                    id="updateFrequency"
                    name="updateFrequency"
                    value={formData.updateFrequency}
                    onChange={handleChange}
                    className="
                      block w-full px-3 py-2 rounded-md 
                      border border-secondary-300 dark:border-secondary-600 
                      bg-white dark:bg-secondary-700 
                      text-secondary-900 dark:text-white
                      focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                    "
                  >
                    <option value={UPDATE_FREQUENCIES.REALTIME}>Real-time</option>
                    <option value={UPDATE_FREQUENCIES.HOURLY}>Hourly</option>
                    <option value={UPDATE_FREQUENCIES.DAILY}>Daily</option>
                    <option value={UPDATE_FREQUENCIES.WEEKLY}>Weekly</option>
                    <option value={UPDATE_FREQUENCIES.MONTHLY}>Monthly</option>
                    <option value={UPDATE_FREQUENCIES.MANUAL}>Manual</option>
                  </select>
                </div>
                
                {/* Logo URL */}
                <div className="col-span-2">
                  <label htmlFor="logo" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                    Logo URL
                  </label>
                  <input
                    type="text"
                    id="logo"
                    name="logo"
                    value={formData.logo}
                    onChange={handleChange}
                    className="
                      block w-full px-3 py-2 rounded-md 
                      border border-secondary-300 dark:border-secondary-600 
                      bg-white dark:bg-secondary-700 
                      text-secondary-900 dark:text-white
                      focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                    "
                    placeholder="https://example.com/logo.png"
                  />
                  <p className="mt-1 text-xs text-secondary-500 dark:text-secondary-400">
                    Optional: URL to the feed provider's logo
                  </p>
                </div>
              </div>
            </div>
            
            {/* Authentication */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-secondary-900 dark:text-white flex items-center mb-4">
                <Lock className="w-5 h-5 mr-2 text-primary-500" />
                Authentication
              </h3>
              
              <div className="mb-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="authRequired"
                    name="required"
                    checked={formData.authentication.required}
                    onChange={handleAuthChange}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
                  />
                  <label htmlFor="authRequired" className="ml-2 block text-sm text-secondary-700 dark:text-secondary-300">
                    Authentication Required
                  </label>
                </div>
              </div>
              
              {formData.authentication.required && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-6 border-l-2 border-secondary-200 dark:border-secondary-700">
                  {/* Auth Type */}
                  <div>
                    <label htmlFor="authType" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                      Authentication Type <span className="text-status-error">*</span>
                    </label>
                    <select
                      id="authType"
                      name="type"
                      value={formData.authentication.type || ''}
                      onChange={handleAuthChange}
                      className={`
                        block w-full px-3 py-2 rounded-md 
                        border ${errors['authentication.type'] ? 'border-status-error' : 'border-secondary-300 dark:border-secondary-600'} 
                        bg-white dark:bg-secondary-700 
                        text-secondary-900 dark:text-white
                        focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                      `}
                    >
                      <option value="">Select type</option>
                      <option value="API Key">API Key</option>
                      <option value="OAuth2">OAuth 2.0</option>
                      <option value="Basic">Basic Auth</option>
                      <option value="Bearer">Bearer Token</option>
                      <option value="Custom">Custom</option>
                    </select>
                    {errors['authentication.type'] && (
                      <p className="mt-1 text-sm text-status-error">{errors['authentication.type']}</p>
                    )}
                  </div>
                  
                  {/* API Key Field */}
                  {formData.authentication.type === 'API Key' && (
                    <>
                      <div>
                        <label htmlFor="apiKeyName" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                          API Key Name/Header
                        </label>
                        <input
                          type="text"
                          id="apiKeyName"
                          name="apiKeyName"
                          value={formData.authentication.apiKeyName || ''}
                          onChange={handleAuthChange}
                          className="
                            block w-full px-3 py-2 rounded-md 
                            border border-secondary-300 dark:border-secondary-600 
                            bg-white dark:bg-secondary-700 
                            text-secondary-900 dark:text-white
                            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                          "
                          placeholder="e.g., X-API-Key"
                        />
                      </div>
                      
                      <div className="col-span-2">
                        <label htmlFor="apiKey" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                          API Key Value
                        </label>
                        <input
                          type="password"
                          id="apiKey"
                          name="apiKey"
                          value={formData.authentication.apiKey || ''}
                          onChange={handleAuthChange}
                          className="
                            block w-full px-3 py-2 rounded-md 
                            border border-secondary-300 dark:border-secondary-600 
                            bg-white dark:bg-secondary-700 
                            text-secondary-900 dark:text-white
                            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                          "
                          placeholder="Enter API key"
                        />
                        <p className="mt-1 text-xs text-secondary-500 dark:text-secondary-400">
                          API keys are stored securely and never displayed in plaintext
                        </p>
                      </div>
                    </>
                  )}
                  
                  {/* Basic Auth Fields */}
                  {formData.authentication.type === 'Basic' && (
                    <>
                      <div>
                        <label htmlFor="username" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                          Username
                        </label>
                        <input
                          type="text"
                          id="username"
                          name="username"
                          value={formData.authentication.username || ''}
                          onChange={handleAuthChange}
                          className="
                            block w-full px-3 py-2 rounded-md 
                            border border-secondary-300 dark:border-secondary-600 
                            bg-white dark:bg-secondary-700 
                            text-secondary-900 dark:text-white
                            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                          "
                          placeholder="Enter username"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="password" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                          Password
                        </label>
                        <input
                          type="password"
                          id="password"
                          name="password"
                          value={formData.authentication.password || ''}
                          onChange={handleAuthChange}
                          className="
                            block w-full px-3 py-2 rounded-md 
                            border border-secondary-300 dark:border-secondary-600 
                            bg-white dark:bg-secondary-700 
                            text-secondary-900 dark:text-white
                            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                          "
                          placeholder="Enter password"
                        />
                      </div>
                    </>
                  )}
                  
                  {/* Bearer Token Field */}
                  {formData.authentication.type === 'Bearer' && (
                    <div className="col-span-2">
                      <label htmlFor="token" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                        Bearer Token
                      </label>
                      <input
                        type="password"
                        id="token"
                        name="token"
                        value={formData.authentication.token || ''}
                        onChange={handleAuthChange}
                        className="
                          block w-full px-3 py-2 rounded-md 
                          border border-secondary-300 dark:border-secondary-600 
                          bg-white dark:bg-secondary-700 
                          text-secondary-900 dark:text-white
                          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                        "
                        placeholder="Enter bearer token"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Features */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-secondary-900 dark:text-white flex items-center mb-4">
                <Zap className="w-5 h-5 mr-2 text-primary-500" />
                Feed Features
              </h3>
              
              <div className="mb-4">
                <div className="flex items-center">
                  <input
                    type="text"
                    id="newFeature"
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    className="
                      block flex-1 px-3 py-2 rounded-l-md 
                      border border-secondary-300 dark:border-secondary-600 
                      bg-white dark:bg-secondary-700 
                      text-secondary-900 dark:text-white
                      focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                    "
                    placeholder="Add a feature (e.g., IoC sharing, Threat actor tracking)"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                  />
                  <button
                    type="button"
                    onClick={addFeature}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-r-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              <div className="space-y-2">
                {formData.features.map((feature, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-secondary-50 dark:bg-secondary-800 rounded-md">
                    <span className="text-sm text-secondary-700 dark:text-secondary-300">{feature}</span>
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="text-secondary-500 hover:text-status-error"
                    >
                      <XCircle className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                
                {formData.features.length === 0 && (
                  <p className="text-sm text-secondary-500 dark:text-secondary-400 italic">
                    No features added yet. Add features to help users understand what this feed provides.
                  </p>
                )}
              </div>
            </div>
            
            {/* Test Connection */}
            {formData.url && (
              <div className="mb-6 p-4 border border-secondary-200 dark:border-secondary-700 rounded-md bg-secondary-50 dark:bg-secondary-800/50">
                <div className="flex justify-between items-center">
                  <h3 className="text-md font-medium text-secondary-900 dark:text-white">Test Connection</h3>
                  <Button
                    onClick={handleTestConnection}
                    variant="secondary"
                    size="sm"
                    leadingIcon={RefreshCw}
                    loading={testingConnection}
                    disabled={testingConnection}
                  >
                    Test Now
                  </Button>
                </div>
                
                {testResult && (
                  <div className={`mt-3 p-3 rounded-md ${
                    testResult.success 
                      ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                      : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                  }`}>
                    <div className="flex items-start">
                      {testResult.success ? (
                        <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0" />
                      )}
                      <div>
                        <p className={`text-sm font-medium ${
                          testResult.success ? 'text-green-800 dark:text-green-400' : 'text-red-800 dark:text-red-400'
                        }`}>
                          {testResult.success ? 'Connection Successful' : 'Connection Failed'}
                        </p>
                        <p className="text-sm text-secondary-600 dark:text-secondary-400 mt-1">
                          {testResult.message}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
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
            type="submit"
            form="feed-form"
          >
            {isEditMode ? 'Save Changes' : 'Add Feed'}
          </Button>
        </div>
      </div>
    </div>
  );
};

/**
 * Feed Card Component
 */
const FeedCard = ({ feed, onEdit, onDelete, onToggleStatus, onTest }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // Track if the logo failed to load so we can gracefully fall back
  const [logoError, setLogoError] = useState(false);
  const menuRef = useRef(null);
  
  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Reset error flag if the feed logo URL changes
  useEffect(() => {
    setLogoError(false);
  }, [feed.logo]);
  
  // Get appropriate icon for feed type
  const getFeedTypeIcon = (type) => {
    switch (type) {
      case 'RSS':
        return <Rss className="w-4 h-4" />;
      case 'API':
        return <Server className="w-4 h-4" />;
      case 'STIX':
      case 'TAXII':
        return <Database className="w-4 h-4" />;
      case 'GraphQL':
        return <Code className="w-4 h-4" />;
      default:
        return <Link className="w-4 h-4" />;
    }
  };
  
  // Get status badge color
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'active':
        return 'bg-status-success text-white';
      case 'inactive':
        return 'bg-secondary-400 dark:bg-secondary-600 text-white';
      default:
        return 'bg-secondary-200 dark:bg-secondary-700 text-secondary-700 dark:text-secondary-300';
    }
  };
  
  // Get health status indicator
  const getHealthIndicator = (health) => {
    switch (health) {
      case 'healthy':
        return <CheckCircle className="w-4 h-4 text-status-success" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-status-error" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-status-warning" />;
      case 'unconfigured':
      default:
        return <HelpCircle className="w-4 h-4 text-secondary-400" />;
    }
  };
  
  // Format last update time
  const formatLastUpdate = (timestamp) => {
    if (!timestamp) return 'Never';
    
    const date = new Date(timestamp);
    return date.toLocaleString();
  };
  
  // Determine if this is the OpenCTI feed to highlight it
  const isOpenCTI = feed.id === 'opencti-platform';
  
  return (
    <div className={`
      relative border rounded-lg overflow-hidden transition-all duration-200
      ${isOpenCTI 
        ? 'border-primary-300 dark:border-primary-700 shadow-md' 
        : 'border-secondary-200 dark:border-secondary-700 hover:shadow-sm'
      }
      ${feed.status === 'active' ? 'bg-white dark:bg-secondary-800' : 'bg-secondary-50 dark:bg-secondary-900'}
    `}>
      {/* Featured badge for OpenCTI */}
      {isOpenCTI && (
        <div className="absolute top-0 right-0">
          <div className="bg-primary-500 text-white text-xs font-bold py-1 px-3 rounded-bl-lg">
            Featured
          </div>
        </div>
      )}
      
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Feed logo */}
            <div className="w-10 h-10 flex-shrink-0 rounded-md overflow-hidden bg-white border border-secondary-200 dark:border-secondary-700 flex items-center justify-center">
              {feed.logo && !logoError ? (
                <img
                  src={feed.logo}
                  alt={`${feed.name} logo`}
                  className="w-full h-full object-contain"
                  onError={() => setLogoError(true)}
                />
              ) : (
                <Shield className="w-6 h-6 text-primary-500" />
              )}
            </div>
            
            {/* Feed name and type */}
            <div>
              <h3 className="font-medium text-secondary-900 dark:text-white flex items-center">
                {feed.name}
                <span className="ml-2 flex items-center text-xs px-2 py-0.5 rounded-full bg-secondary-100 dark:bg-secondary-700 text-secondary-800 dark:text-secondary-300">
                  {getFeedTypeIcon(feed.type)}
                  <span className="ml-1">{feed.type}</span>
                </span>
              </h3>
              <p className="text-sm text-secondary-500 dark:text-secondary-400 line-clamp-1">
                {feed.description}
              </p>
            </div>
          </div>
          
          {/* Actions menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-1 rounded-full hover:bg-secondary-100 dark:hover:bg-secondary-700 text-secondary-500 dark:text-secondary-400"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>
            
            {isMenuOpen && (
              <div className="absolute right-0 mt-1 w-48 rounded-md shadow-lg bg-white dark:bg-secondary-800 ring-1 ring-black ring-opacity-5 z-10">
                <div className="py-1">
                  <button
                    onClick={() => {
                      onEdit(feed);
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-left block px-4 py-2 text-sm text-secondary-700 dark:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-700"
                  >
                    <Edit className="w-4 h-4 inline mr-2" />
                    Edit Feed
                  </button>
                  <button
                    onClick={() => {
                      onTest(feed.id);
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-left block px-4 py-2 text-sm text-secondary-700 dark:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-700"
                  >
                    <RefreshCw className="w-4 h-4 inline mr-2" />
                    Test Connection
                  </button>
                  <a
                    href={feed.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full text-left block px-4 py-2 text-sm text-secondary-700 dark:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-700"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <ExternalLink className="w-4 h-4 inline mr-2" />
                    Visit Source
                  </a>
                  <button
                    onClick={() => {
                      onDelete(feed.id);
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-left block px-4 py-2 text-sm text-status-error hover:bg-secondary-100 dark:hover:bg-secondary-700"
                  >
                    <Trash2 className="w-4 h-4 inline mr-2" />
                    Delete Feed
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Feed metadata */}
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center text-secondary-600 dark:text-secondary-400">
            <Clock className="w-3.5 h-3.5 mr-1" />
            <span>Updated: {formatLastUpdate(feed.lastUpdate)}</span>
          </div>
          <div className="flex items-center text-secondary-600 dark:text-secondary-400">
            <RotateCw className="w-3.5 h-3.5 mr-1" />
            <span>Frequency: {feed.updateFrequency}</span>
          </div>
          <div className="flex items-center">
            <span className="flex items-center">
              {getHealthIndicator(feed.healthStatus)}
              <span className="ml-1 text-secondary-600 dark:text-secondary-400">
                Health: {feed.healthStatus.charAt(0).toUpperCase() + feed.healthStatus.slice(1)}
              </span>
            </span>
          </div>
          <div className="flex items-center justify-end">
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(feed.status)}`}>
              {feed.status.charAt(0).toUpperCase() + feed.status.slice(1)}
            </span>
          </div>
        </div>
        
        {/* Authentication indicator */}
        {feed.authentication?.required && (
          <div className="mt-3 flex items-center text-xs text-secondary-600 dark:text-secondary-400">
            <Lock className="w-3.5 h-3.5 mr-1" />
            <span>
              Authentication: {feed.authentication.configured ? 'Configured' : 'Required'}
            </span>
          </div>
        )}
        
        {/* Features list */}
        {feed.features && feed.features.length > 0 && (
          <div className="mt-3">
            <div className="flex flex-wrap gap-1">
              {feed.features.slice(0, 3).map((feature, index) => (
                <span 
                  key={index}
                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-secondary-100 dark:bg-secondary-700 text-secondary-800 dark:text-secondary-300"
                >
                  {feature}
                </span>
              ))}
              {feed.features.length > 3 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-secondary-100 dark:bg-secondary-700 text-secondary-800 dark:text-secondary-300">
                  +{feed.features.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Card footer with actions */}
      <div className="px-4 py-3 bg-secondary-50 dark:bg-secondary-800/50 border-t border-secondary-200 dark:border-secondary-700 flex items-center justify-between">
        <button
          onClick={() => onToggleStatus(feed.id)}
          className={`
            flex items-center text-sm font-medium rounded-md px-2 py-1
            ${feed.status === 'active'
              ? 'text-status-error hover:bg-status-error/10'
              : 'text-status-success hover:bg-status-success/10'
            }
          `}
        >
          {feed.status === 'active' ? (
            <>
              <PauseCircle className="w-4 h-4 mr-1" />
              Disable
            </>
          ) : (
            <>
              <PlayCircle className="w-4 h-4 mr-1" />
              Enable
            </>
          )}
        </button>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onTest(feed.id)}
            className="text-sm text-secondary-600 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-secondary-200"
          >
            Test
          </button>
          <button
            onClick={() => onEdit(feed)}
            className="text-sm text-secondary-600 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-secondary-200"
          >
            Edit
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * ThreatIntelSettings Component
 * 
 * This component provides a comprehensive interface for managing threat intelligence feeds,
 * including adding, editing, testing, and configuring feeds that will appear in the
 * Threat Intelligence page's Intel Feeds tab.
 */
const ThreatIntelSettings = ({ settings, updateSetting }) => {
  const {
    feeds,
    loading,
    error,
    activeFeeds,
    testingFeed,
    addFeed,
    updateFeed,
    removeFeed,
    toggleFeedStatus,
    testFeedConnection,
    resetToDefaults
  } = useThreatIntelFeeds();
  
  // Local state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingFeed, setEditingFeed] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedFeeds, setSelectedFeeds] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Filter and search feeds
  const filteredFeeds = useMemo(() => {
    return feeds.filter(feed => {
      // Apply status filter
      if (filterStatus !== 'all' && feed.status !== filterStatus) {
        return false;
      }
      
      // Apply search term
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          feed.name.toLowerCase().includes(searchLower) ||
          feed.description.toLowerCase().includes(searchLower) ||
          feed.type.toLowerCase().includes(searchLower)
        );
      }
      
      return true;
    });
  }, [feeds, searchTerm, filterStatus]);
  
  // Handle feed save (add or update)
  const handleSaveFeed = useCallback((feedData) => {
    if (feedData.id) {
      // Update existing feed
      updateFeed(feedData.id, feedData);
      showSuccessMessage('Feed updated successfully');
    } else {
      // Add new feed
      addFeed(feedData);
      showSuccessMessage('Feed added successfully');
    }
  }, [addFeed, updateFeed]);
  
  // Handle feed edit
  const handleEditFeed = useCallback((feed) => {
    setEditingFeed(feed);
    setIsAddModalOpen(true);
  }, []);
  
  // Handle feed deletion
  const handleDeleteFeed = useCallback((feedId) => {
    setConfirmDelete(feedId);
  }, []);
  
  // Confirm feed deletion
  const confirmDeleteFeed = useCallback(() => {
    if (confirmDelete) {
      removeFeed(confirmDelete);
      setConfirmDelete(null);
      showSuccessMessage('Feed deleted successfully');
    }
  }, [confirmDelete, removeFeed]);
  
  // Handle feed status toggle
  const handleToggleFeedStatus = useCallback((feedId) => {
    toggleFeedStatus(feedId);
    showSuccessMessage('Feed status updated');
  }, [toggleFeedStatus]);
  
  // Handle feed testing
  const handleTestFeed = useCallback((feedId) => {
    testFeedConnection(feedId);
  }, [testFeedConnection]);
  
  // Handle bulk enable/disable
  const handleBulkAction = useCallback((action) => {
    if (selectedFeeds.length === 0) return;
    
    selectedFeeds.forEach(feedId => {
      if (action === 'enable') {
        updateFeed(feedId, { status: 'active' });
      } else if (action === 'disable') {
        updateFeed(feedId, { status: 'inactive' });
      }
    });
    
    setSelectedFeeds([]);
    showSuccessMessage(`${selectedFeeds.length} feeds ${action === 'enable' ? 'enabled' : 'disabled'}`);
  }, [selectedFeeds, updateFeed]);
  
  // Handle select all feeds
  const handleSelectAll = useCallback(() => {
    if (selectedFeeds.length === filteredFeeds.length) {
      setSelectedFeeds([]);
    } else {
      setSelectedFeeds(filteredFeeds.map(feed => feed.id));
    }
  }, [selectedFeeds, filteredFeeds]);
  
  // Handle select individual feed
  const handleSelectFeed = useCallback((feedId) => {
    setSelectedFeeds(prev => {
      if (prev.includes(feedId)) {
        return prev.filter(id => id !== feedId);
      } else {
        return [...prev, feedId];
      }
    });
  }, []);
  
  // Handle reset to defaults
  const handleResetToDefaults = useCallback(() => {
    resetToDefaults();
    showSuccessMessage('Feeds reset to defaults');
  }, [resetToDefaults]);
  
  // Show success message with auto-dismiss
  const showSuccessMessage = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };
  
  // Handle export feeds
  const handleExportFeeds = useCallback(() => {
    try {
      const dataStr = JSON.stringify(feeds, null, 2);
      const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
      
      const exportFileDefaultName = `threat-intel-feeds-${new Date().toISOString().slice(0, 10)}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      showSuccessMessage('Feeds exported successfully');
    } catch (error) {
      console.error('Error exporting feeds:', error);
    }
  }, [feeds]);
  
  // Handle import feeds
  const handleImportFeeds = useCallback((event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedFeeds = JSON.parse(e.target.result);
        
        if (Array.isArray(importedFeeds)) {
          // Replace current feeds with imported ones
          importedFeeds.forEach(feed => {
            if (feed.id) {
              const existingFeed = feeds.find(f => f.id === feed.id);
              if (existingFeed) {
                updateFeed(feed.id, feed);
              } else {
                addFeed(feed);
              }
            } else {
              addFeed(feed);
            }
          });
          
          showSuccessMessage(`${importedFeeds.length} feeds imported successfully`);
        } else {
          console.error('Invalid import format');
        }
      } catch (error) {
        console.error('Error importing feeds:', error);
      }
    };
    reader.readAsText(file);
    
    // Reset the input
    event.target.value = null;
  }, [feeds, addFeed, updateFeed]);
  
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-secondary-900 dark:text-white">
            Threat Intelligence Feeds
          </h2>
          <p className="text-secondary-500 dark:text-secondary-400 mt-1">
            Configure and manage threat intelligence feeds that provide data to the Threat Intelligence page.
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            leadingIcon={Plus}
            onClick={() => {
              setEditingFeed(null);
              setIsAddModalOpen(true);
            }}
          >
            Add Feed
          </Button>
          
          <div className="relative">
            <button
              className="p-2 text-secondary-500 hover:text-secondary-700 dark:hover:text-secondary-300 rounded-md hover:bg-secondary-100 dark:hover:bg-secondary-700"
              onClick={() => document.getElementById('import-feeds').click()}
              title="Import Feeds"
            >
              <Upload className="w-5 h-5" />
              <input
                id="import-feeds"
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleImportFeeds}
              />
            </button>
            
            <button
              className="p-2 text-secondary-500 hover:text-secondary-700 dark:hover:text-secondary-300 rounded-md hover:bg-secondary-100 dark:hover:bg-secondary-700"
              onClick={handleExportFeeds}
              title="Export Feeds"
            >
              <Download className="w-5 h-5" />
            </button>
            
            <button
              className="p-2 text-secondary-500 hover:text-secondary-700 dark:hover:text-secondary-300 rounded-md hover:bg-secondary-100 dark:hover:bg-secondary-700"
              onClick={handleResetToDefaults}
              title="Reset to Defaults"
            >
              <RotateCw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Success message */}
      {successMessage && (
        <div className="p-3 rounded-md bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-400 flex items-center">
          <CheckCircle className="w-5 h-5 mr-2" />
          {successMessage}
        </div>
      )}
      
      {/* Feeds stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-sm p-4 border border-secondary-200 dark:border-secondary-700">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-secondary-500 dark:text-secondary-400">Total Feeds</h3>
            <Shield className="w-5 h-5 text-primary-500" />
          </div>
          <p className="mt-2 text-3xl font-semibold text-secondary-900 dark:text-white">
            {feeds.length}
          </p>
        </div>
        
        <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-sm p-4 border border-secondary-200 dark:border-secondary-700">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-secondary-500 dark:text-secondary-400">Active Feeds</h3>
            <PlayCircle className="w-5 h-5 text-status-success" />
          </div>
          <p className="mt-2 text-3xl font-semibold text-secondary-900 dark:text-white">
            {activeFeeds.length}
          </p>
          <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-1">
            {activeFeeds.length > 0 
              ? `${Math.round((activeFeeds.length / feeds.length) * 100)}% of total feeds` 
              : 'No active feeds'}
          </p>
        </div>
        
        <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-sm p-4 border border-secondary-200 dark:border-secondary-700">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-secondary-500 dark:text-secondary-400">Healthy Feeds</h3>
            <CheckCircle className="w-5 h-5 text-status-success" />
          </div>
          <p className="mt-2 text-3xl font-semibold text-secondary-900 dark:text-white">
            {feeds.filter(feed => feed.healthStatus === 'healthy').length}
          </p>
        </div>
        
        <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-sm p-4 border border-secondary-200 dark:border-secondary-700">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-secondary-500 dark:text-secondary-400">Needs Attention</h3>
            <AlertTriangle className="w-5 h-5 text-status-warning" />
          </div>
          <p className="mt-2 text-3xl font-semibold text-secondary-900 dark:text-white">
            {feeds.filter(feed => ['error', 'unconfigured'].includes(feed.healthStatus)).length}
          </p>
        </div>
      </div>
      
      {/* Search and filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-secondary-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="
              block w-full pl-10 pr-3 py-2 rounded-md 
              border border-secondary-300 dark:border-secondary-600 
              bg-white dark:bg-secondary-700 
              text-secondary-900 dark:text-white
              focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
            "
            placeholder="Search feeds by name, description or type..."
          />
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            <Filter className="w-5 h-5 text-secondary-400 mr-2" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="
                block w-full px-3 py-2 rounded-md 
                border border-secondary-300 dark:border-secondary-600 
                bg-white dark:bg-secondary-700 
                text-secondary-900 dark:text-white
                focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
              "
            >
              <option value="all">All Feeds</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Bulk actions */}
      {selectedFeeds.length > 0 && (
        <div className="bg-secondary-50 dark:bg-secondary-800 p-3 rounded-md border border-secondary-200 dark:border-secondary-700 flex items-center justify-between">
          <div className="text-sm text-secondary-700 dark:text-secondary-300">
            <span className="font-medium">{selectedFeeds.length}</span> feeds selected
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleBulkAction('enable')}
            >
              Enable All
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleBulkAction('disable')}
            >
              Disable All
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setSelectedFeeds([])}
            >
              Clear Selection
            </Button>
          </div>
        </div>
      )}
      
      {/* Feed list */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-2">
            <RefreshCw className="w-5 h-5 text-primary-500 animate-spin" />
            <span className="text-secondary-700 dark:text-secondary-300">Loading feeds...</span>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4 text-red-700 dark:text-red-400">
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium">Error loading feeds</h3>
              <p className="mt-1 text-sm">{error}</p>
            </div>
          </div>
        </div>
      ) : filteredFeeds.length === 0 ? (
        <div className="bg-secondary-50 dark:bg-secondary-800 rounded-md p-8 text-center">
          <Shield className="w-12 h-12 text-secondary-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-secondary-900 dark:text-white mb-1">No feeds found</h3>
          <p className="text-secondary-500 dark:text-secondary-400 mb-4">
            {searchTerm || filterStatus !== 'all'
              ? 'No feeds match your current filters. Try adjusting your search or filters.'
              : 'You haven\'t added any threat intelligence feeds yet.'}
          </p>
          {searchTerm || filterStatus !== 'all' ? (
            <Button
              variant="secondary"
              onClick={() => {
                setSearchTerm('');
                setFilterStatus('all');
              }}
            >
              Clear Filters
            </Button>
          ) : (
            <Button
              variant="primary"
              leadingIcon={Plus}
              onClick={() => {
                setEditingFeed(null);
                setIsAddModalOpen(true);
              }}
            >
              Add Your First Feed
            </Button>
          )}
        </div>
      ) : (
        <>
          {/* OpenCTI feed highlighted at the top if it exists */}
          {filteredFeeds.some(feed => feed.id === 'opencti-platform') && (
            <div className="mb-4">
              <FeedCard
                feed={filteredFeeds.find(feed => feed.id === 'opencti-platform')}
                onEdit={handleEditFeed}
                onDelete={handleDeleteFeed}
                onToggleStatus={handleToggleFeedStatus}
                onTest={handleTestFeed}
              />
            </div>
          )}
          
          {/* Grid of other feeds */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFeeds
              .filter(feed => feed.id !== 'opencti-platform')
              .map(feed => (
                <FeedCard
                  key={feed.id}
                  feed={feed}
                  onEdit={handleEditFeed}
                  onDelete={handleDeleteFeed}
                  onToggleStatus={handleToggleFeedStatus}
                  onTest={handleTestFeed}
                />
              ))}
          </div>
        </>
      )}
      
      {/* Add/Edit Feed Modal */}
      <FeedFormModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingFeed(null);
        }}
        feed={editingFeed}
        onSave={handleSaveFeed}
      />
      
      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 fade-in">
          <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-semibold text-secondary-900 dark:text-white mb-4">
              Confirm Deletion
            </h2>
            <p className="text-secondary-600 dark:text-secondary-400 mb-6">
              Are you sure you want to delete this feed? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() => setConfirmDelete(null)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={confirmDeleteFeed}
              >
                Delete Feed
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThreatIntelSettings;
