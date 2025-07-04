// src/components/threats/ThreatAdmin.jsx
import React, { useState, useMemo, useCallback } from 'react';
import { 
  Settings, Plus, Edit, Trash2, CheckCircle, XCircle, RefreshCw, Globe, Database, 
  Bell, Filter, Search, Download, Upload, AlertTriangle, Info, Clock, Shield, 
  User, Mail, Smartphone, Eye, EyeOff, Save, TestTube, Activity, BarChart3,
  Rss, Server, Zap, Target, Users, FileText, Lock, Unlock, Key, Check, X
} from 'lucide-react';

const ThreatAdmin = ({ 
  rssFeeds = [], 
  config = {}, 
  onAddRssFeed, 
  onUpdateRssFeed, 
  onDeleteRssFeed,
  onUpdateConfig,
  userRole = 'user', // user, admin, super-admin
  companyProfile = null
}) => {
  // State management
  const [activeTab, setActiveTab] = useState('feeds'); // feeds, settings, alerts, users
  const [showAddFeedModal, setShowAddFeedModal] = useState(false);
  const [showEditFeedModal, setShowEditFeedModal] = useState(false);
  const [selectedFeed, setSelectedFeed] = useState(null);
  const [loading, setLoading] = useState(false);
  const [testingFeed, setTestingFeed] = useState(null);
  const [feedTestResults, setFeedTestResults] = useState({});

  // Form states
  const [feedForm, setFeedForm] = useState({
    name: '',
    url: '',
    category: 'Government',
    priority: 'Medium',
    updateFrequency: 'daily',
    relevantSectors: [],
    description: '',
    active: true
  });

  const [alertRules, setAlertRules] = useState([
    {
      id: 'rule-001',
      name: 'Critical Threats',
      conditions: {
        severity: ['Critical'],
        categories: ['Nation State', 'Cybercriminal'],
        keywords: ['ransomware', 'apt', 'critical infrastructure']
      },
      actions: {
        emailAlert: true,
        popupNotification: true,
        escalation: true
      },
      recipients: ['security-team@company.com', 'ciso@company.com'],
      active: true
    },
    {
      id: 'rule-002',
      name: 'Energy Sector Threats',
      conditions: {
        sectors: ['Energy', 'Oil & Gas'],
        keywords: ['gas', 'pipeline', 'scada', 'ot']
      },
      actions: {
        emailAlert: true,
        popupNotification: false,
        escalation: false
      },
      recipients: ['operations@company.com'],
      active: true
    }
  ]);

  // Check admin permissions
  const hasAdminAccess = useMemo(() => {
    return ['admin', 'super-admin'].includes(userRole);
  }, [userRole]);

  const hasSuperAdminAccess = useMemo(() => {
    return userRole === 'super-admin';
  }, [userRole]);

  // RSS Feed testing functionality
  const testRssFeed = useCallback(async (feedUrl, feedId = null) => {
    setTestingFeed(feedId || 'new');
    setLoading(true);
    
    try {
      // Simulate RSS feed testing
      const response = await fetch(feedUrl, { 
        method: 'HEAD',
        mode: 'no-cors' // Handle CORS issues
      });
      
      // In real implementation, you would:
      // 1. Fetch the RSS feed
      // 2. Parse XML structure
      // 3. Validate RSS format
      // 4. Check for threat intelligence content
      // 5. Test categorization algorithms
      
      // Mock test results
      const testResult = {
        status: 'success',
        responseTime: Math.floor(Math.random() * 500) + 100,
        itemCount: Math.floor(Math.random() * 50) + 10,
        lastItem: new Date().toISOString(),
        contentQuality: 'good',
        threatCount: Math.floor(Math.random() * 5),
        categories: ['Government', 'Security'],
        issues: []
      };

      // Add some random issues for demo
      if (Math.random() > 0.7) {
        testResult.issues.push('SSL certificate expires soon');
      }
      if (Math.random() > 0.8) {
        testResult.issues.push('Feed has not been updated in 24+ hours');
      }

      setFeedTestResults(prev => ({
        ...prev,
        [feedId || 'new']: testResult
      }));

      return testResult;
    } catch (error) {
      const errorResult = {
        status: 'error',
        error: error.message,
        issues: ['Failed to connect to RSS feed', 'Check URL and network connectivity']
      };
      
      setFeedTestResults(prev => ({
        ...prev,
        [feedId || 'new']: errorResult
      }));
      
      return errorResult;
    } finally {
      setLoading(false);
      setTestingFeed(null);
    }
  }, []);

  // Form handlers
  const handleAddFeed = useCallback(async () => {
    if (!feedForm.name || !feedForm.url) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      // Test feed before adding
      const testResult = await testRssFeed(feedForm.url);
      
      if (testResult.status === 'error') {
        alert('RSS feed test failed. Please check the URL and try again.');
        setLoading(false);
        return;
      }

      // Add feed
      const result = await onAddRssFeed({
        ...feedForm,
        relevantSectors: feedForm.relevantSectors.filter(Boolean)
      });

      if (result.success) {
        setShowAddFeedModal(false);
        setFeedForm({
          name: '',
          url: '',
          category: 'Government',
          priority: 'Medium',
          updateFrequency: 'daily',
          relevantSectors: [],
          description: '',
          active: true
        });
      } else {
        alert(`Failed to add RSS feed: ${result.error}`);
      }
    } catch (error) {
      alert(`Error adding RSS feed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [feedForm, onAddRssFeed, testRssFeed]);

  const handleEditFeed = useCallback(async () => {
    if (!selectedFeed || !feedForm.name || !feedForm.url) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const result = await onUpdateRssFeed(selectedFeed.id, {
        ...feedForm,
        relevantSectors: feedForm.relevantSectors.filter(Boolean)
      });

      if (result.success) {
        setShowEditFeedModal(false);
        setSelectedFeed(null);
      } else {
        alert(`Failed to update RSS feed: ${result.error}`);
      }
    } catch (error) {
      alert(`Error updating RSS feed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [selectedFeed, feedForm, onUpdateRssFeed]);

  const handleDeleteFeed = useCallback(async (feedId) => {
    if (!confirm('Are you sure you want to delete this RSS feed?')) {
      return;
    }

    setLoading(true);
    try {
      const result = await onDeleteRssFeed(feedId);
      if (!result.success) {
        alert(`Failed to delete RSS feed: ${result.error}`);
      }
    } catch (error) {
      alert(`Error deleting RSS feed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [onDeleteRssFeed]);

  // Configuration handlers
  const handleConfigUpdate = useCallback((key, value) => {
    if (onUpdateConfig) {
      onUpdateConfig(key, value);
    }
  }, [onUpdateConfig]);

  // Render functions
  const renderPermissionCheck = () => {
    if (!hasAdminAccess) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Lock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Admin Access Required</h3>
            <p className="text-gray-600">You need administrator privileges to access this section.</p>
          </div>
        </div>
      );
    }
    return null;
  };

  const renderFeedCard = (feed) => {
    const getStatusColor = (status) => {
      switch (status) {
        case 'Active': return 'green';
        case 'Error': return 'red';
        case 'Inactive': return 'gray';
        default: return 'yellow';
      }
    };

    const getPriorityColor = (priority) => {
      switch (priority) {
        case 'Critical': return 'red';
        case 'High': return 'orange';
        case 'Medium': return 'yellow';
        case 'Low': return 'green';
        default: return 'gray';
      }
    };

    const testResult = feedTestResults[feed.id];

    return (
      <div key={feed.id} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="font-semibold text-gray-900">{feed.name}</h3>
              <span className={`px-2 py-1 text-xs rounded-full bg-${getStatusColor(feed.status)}-100 text-${getStatusColor(feed.status)}-800`}>
                {feed.status}
              </span>
              <span className={`px-2 py-1 text-xs rounded-full bg-${getPriorityColor(feed.priority)}-100 text-${getPriorityColor(feed.priority)}-800`}>
                {feed.priority}
              </span>
              {!feed.active && (
                <EyeOff className="w-4 h-4 text-gray-400" title="Inactive" />
              )}
            </div>
            <p className="text-sm text-gray-600 mb-2">{feed.description || 'No description provided'}</p>
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <span className="flex items-center"><Globe className="w-3 h-3 mr-1" />{feed.category}</span>
              <span className="flex items-center"><Clock className="w-3 h-3 mr-1" />{feed.updateFrequency}</span>
              <span className="flex items-center"><Target className="w-3 h-3 mr-1" />{feed.relevantSectors?.join(', ') || 'All'}</span>
            </div>
            <div className="mt-2 text-xs text-gray-400 font-mono break-all">
              {feed.url}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => testRssFeed(feed.url, feed.id)}
              disabled={testingFeed === feed.id || loading}
              className="p-2 hover:bg-gray-100 rounded text-blue-600 disabled:opacity-50"
              title="Test RSS feed"
            >
              {testingFeed === feed.id ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <TestTube className="w-4 h-4" />
              )}
            </button>
            
            <button
              onClick={() => {
                setSelectedFeed(feed);
                setFeedForm({
                  name: feed.name,
                  url: feed.url,
                  category: feed.category,
                  priority: feed.priority,
                  updateFrequency: feed.updateFrequency,
                  relevantSectors: feed.relevantSectors || [],
                  description: feed.description || '',
                  active: feed.active
                });
                setShowEditFeedModal(true);
              }}
              className="p-2 hover:bg-gray-100 rounded text-gray-600"
              title="Edit feed"
            >
              <Edit className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => handleDeleteFeed(feed.id)}
              className="p-2 hover:bg-gray-100 rounded text-red-600"
              title="Delete feed"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Test Results */}
        {testResult && (
          <div className={`mt-4 p-3 rounded-lg ${testResult.status === 'success' ? 'bg-green-50' : 'bg-red-50'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Test Results</span>
              <span className={`text-xs ${testResult.status === 'success' ? 'text-green-700' : 'text-red-700'}`}>
                {testResult.status === 'success' ? 'Success' : 'Failed'}
              </span>
            </div>
            {testResult.status === 'success' ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                <div>
                  <span className="text-gray-600">Response:</span>
                  <span className="ml-1 font-mono">{testResult.responseTime}ms</span>
                </div>
                <div>
                  <span className="text-gray-600">Items:</span>
                  <span className="ml-1 font-mono">{testResult.itemCount}</span>
                </div>
                <div>
                  <span className="text-gray-600">Threats:</span>
                  <span className="ml-1 font-mono">{testResult.threatCount}</span>
                </div>
                <div>
                  <span className="text-gray-600">Quality:</span>
                  <span className="ml-1 capitalize">{testResult.contentQuality}</span>
                </div>
              </div>
            ) : (
              <div className="text-sm text-red-700">
                {testResult.error}
              </div>
            )}
            {testResult.issues && testResult.issues.length > 0 && (
              <div className="mt-2">
                <span className="text-xs text-orange-700 font-medium">Issues:</span>
                <ul className="mt-1 space-y-1">
                  {testResult.issues.map((issue, index) => (
                    <li key={index} className="text-xs text-orange-700 flex items-center">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      {issue}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Last Updated */}
        <div className="mt-3 text-xs text-gray-400">
          Last updated: {new Date(feed.lastUpdated).toLocaleString()}
        </div>
      </div>
    );
  };

  const renderFeedModal = (isEdit = false) => {
    const title = isEdit ? 'Edit RSS Feed' : 'Add RSS Feed';
    const action = isEdit ? handleEditFeed : handleAddFeed;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">{title}</h2>
            <button 
              onClick={() => {
                setShowAddFeedModal(false);
                setShowEditFeedModal(false);
                setSelectedFeed(null);
              }} 
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Feed Name *</label>
                <input
                  type="text"
                  value={feedForm.name}
                  onChange={(e) => setFeedForm({ ...feedForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., NCSC Alerts"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={feedForm.category}
                  onChange={(e) => setFeedForm({ ...feedForm, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Government">Government</option>
                  <option value="Industry">Industry</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Academic">Academic</option>
                  <option value="Community">Community</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">RSS URL *</label>
              <input
                type="url"
                value={feedForm.url}
                onChange={(e) => setFeedForm({ ...feedForm, url: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com/rss.xml"
              />
              {feedForm.url && (
                <button
                  onClick={() => testRssFeed(feedForm.url)}
                  disabled={testingFeed === 'new' || loading}
                  className="mt-2 flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {testingFeed === 'new' ? (
                    <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                  ) : (
                    <TestTube className="w-4 h-4 mr-1" />
                  )}
                  Test Feed
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={feedForm.priority}
                  onChange={(e) => setFeedForm({ ...feedForm, priority: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Update Frequency</label>
                <select
                  value={feedForm.updateFrequency}
                  onChange={(e) => setFeedForm({ ...feedForm, updateFrequency: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="15min">Every 15 minutes</option>
                  <option value="30min">Every 30 minutes</option>
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Relevant Sectors</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {['Energy', 'Oil & Gas', 'Critical Infrastructure', 'Government', 'Healthcare', 'Manufacturing', 'Finance', 'Transportation', 'All'].map(sector => (
                  <label key={sector} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={feedForm.relevantSectors.includes(sector)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFeedForm({
                            ...feedForm,
                            relevantSectors: [...feedForm.relevantSectors, sector]
                          });
                        } else {
                          setFeedForm({
                            ...feedForm,
                            relevantSectors: feedForm.relevantSectors.filter(s => s !== sector)
                          });
                        }
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm">{sector}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={feedForm.description}
                onChange={(e) => setFeedForm({ ...feedForm, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Brief description of this RSS feed..."
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="active"
                checked={feedForm.active}
                onChange={(e) => setFeedForm({ ...feedForm, active: e.target.checked })}
                className="mr-2"
              />
              <label htmlFor="active" className="text-sm font-medium text-gray-700">
                Active (feed will be processed automatically)
              </label>
            </div>

            {/* Test Results in Modal */}
            {feedTestResults['new'] && (
              <div className={`p-3 rounded-lg ${feedTestResults['new'].status === 'success' ? 'bg-green-50' : 'bg-red-50'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Feed Test Results</span>
                  <span className={`text-xs ${feedTestResults['new'].status === 'success' ? 'text-green-700' : 'text-red-700'}`}>
                    {feedTestResults['new'].status === 'success' ? 'Valid RSS Feed' : 'Test Failed'}
                  </span>
                </div>
                {feedTestResults['new'].status === 'success' ? (
                  <div className="text-sm text-green-700">
                    ✓ Feed contains {feedTestResults['new'].itemCount} items with {feedTestResults['new'].threatCount} potential threats detected
                  </div>
                ) : (
                  <div className="text-sm text-red-700">
                    ✗ {feedTestResults['new'].error}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => {
                setShowAddFeedModal(false);
                setShowEditFeedModal(false);
                setSelectedFeed(null);
              }}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={action}
              disabled={loading || !feedForm.name || !feedForm.url}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Processing...' : (isEdit ? 'Update Feed' : 'Add Feed')}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderFeedsTab = () => {
    const permissionCheck = renderPermissionCheck();
    if (permissionCheck) return permissionCheck;

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">RSS Feed Management</h2>
            <p className="text-gray-600">Configure and manage threat intelligence RSS feeds</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowAddFeedModal(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add RSS Feed
            </button>
            <button
              className="flex items-center px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Config
            </button>
          </div>
        </div>

        {/* Feed Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Feeds</p>
                <p className="text-2xl font-bold text-blue-600">{rssFeeds.length}</p>
              </div>
              <Rss className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Feeds</p>
                <p className="text-2xl font-bold text-green-600">
                  {rssFeeds.filter(f => f.active && f.status === 'Active').length}
                </p>
              </div>
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Error Feeds</p>
                <p className="text-2xl font-bold text-red-600">
                  {rssFeeds.filter(f => f.status === 'Error').length}
                </p>
              </div>
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Last Update</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(Math.max(...rssFeeds.map(f => new Date(f.lastUpdated)))).toLocaleTimeString()}
                </p>
              </div>
              <Clock className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </div>

        {/* RSS Feeds List */}
        <div className="space-y-4">
          {rssFeeds.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Rss className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No RSS feeds configured.</p>
              <button
                onClick={() => setShowAddFeedModal(true)}
                className="mt-2 text-blue-600 hover:text-blue-800"
              >
                Add your first RSS feed
              </button>
            </div>
          ) : (
            rssFeeds.map(renderFeedCard)
          )}
        </div>
      </div>
    );
  };

  const renderSettingsTab = () => {
    const permissionCheck = renderPermissionCheck();
    if (permissionCheck) return permissionCheck;

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">System Configuration</h2>
          <p className="text-gray-600">Configure threat intelligence system settings</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Auto-refresh Settings */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Auto-refresh Settings</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Enable Auto-refresh</label>
                  <p className="text-xs text-gray-500">Automatically fetch new threats from RSS feeds</p>
                </div>
                <input
                  type="checkbox"
                  checked={config.autoRefresh}
                  onChange={(e) => handleConfigUpdate('autoRefresh', e.target.checked)}
                  className="rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Refresh Interval</label>
                <select
                  value={config.refreshInterval}
                  onChange={(e) => handleConfigUpdate('refreshInterval', parseInt(e.target.value))}
                  disabled={!config.autoRefresh}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  <option value={900000}>15 minutes</option>
                  <option value={1800000}>30 minutes</option>
                  <option value={3600000}>1 hour</option>
                  <option value={7200000}>2 hours</option>
                  <option value={21600000}>6 hours</option>
                  <option value={86400000}>24 hours</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Notification Settings</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Enable Notifications</label>
                  <p className="text-xs text-gray-500">Show alerts for new threats</p>
                </div>
                <input
                  type="checkbox"
                  checked={config.enableNotifications}
                  onChange={(e) => handleConfigUpdate('enableNotifications', e.target.checked)}
                  className="rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Information Density</label>
                <select
                  value={config.informationDensity}
                  onChange={(e) => handleConfigUpdate('informationDensity', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="basic">Basic</option>
                  <option value="detailed">Detailed</option>
                  <option value="comprehensive">Comprehensive</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">Controls the amount of information displayed in the dashboard</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Industry Filter</label>
                <select
                  value={config.industryFilter}
                  onChange={(e) => handleConfigUpdate('industryFilter', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="All">All Industries</option>
                  <option value="Energy">Energy</option>
                  <option value="Oil & Gas">Oil & Gas</option>
                  <option value="Critical Infrastructure">Critical Infrastructure</option>
                  <option value="Government">Government</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Manufacturing">Manufacturing</option>
                </select>
              </div>
            </div>
          </div>

          {/* Processing Settings */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Processing Settings</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Threat Categorization</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  defaultValue="automatic"
                >
                  <option value="automatic">Automatic (AI-based)</option>
                  <option value="manual">Manual Review Required</option>
                  <option value="hybrid">Hybrid (AI + Manual Review)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duplicate Detection</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  defaultValue="strict"
                >
                  <option value="strict">Strict (Title + URL matching)</option>
                  <option value="moderate">Moderate (Content similarity)</option>
                  <option value="loose">Loose (Basic deduplication)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Retention Period</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  defaultValue="90"
                >
                  <option value="30">30 days</option>
                  <option value="90">90 days</option>
                  <option value="180">6 months</option>
                  <option value="365">1 year</option>
                  <option value="0">Never delete</option>
                </select>
              </div>
            </div>
          </div>

          {/* Integration Settings */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Integration Settings</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gumloop API Key</label>
                <div className="flex space-x-2">
                  <input
                    type="password"
                    placeholder="Enter Gumloop API key..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                    Test
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">MITRE ATT&CK Integration</label>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Automatically map threats to MITRE techniques</span>
                  <input type="checkbox" defaultChecked className="rounded" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">External Webhook URL</label>
                <input
                  type="url"
                  placeholder="https://your-system.com/webhook"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Send threat updates to external systems</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
            Reset to Defaults
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            <Save className="w-4 h-4 mr-2 inline" />
            Save Settings
          </button>
        </div>
      </div>
    );
  };

  const renderAlertsTab = () => {
    const permissionCheck = renderPermissionCheck();
    if (permissionCheck) return permissionCheck;

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Alert Rules</h2>
          <p className="text-gray-600">Configure automated alert rules for threat notifications</p>
        </div>

        <div className="space-y-4">
          {alertRules.map(rule => (
            <div key={rule.id} className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-semibold text-gray-900">{rule.name}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${rule.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {rule.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Conditions:</span>
                      <ul className="mt-1 space-y-1 text-gray-600">
                        {rule.conditions.severity && (
                          <li>• Severity: {rule.conditions.severity.join(', ')}</li>
                        )}
                        {rule.conditions.categories && (
                          <li>• Categories: {rule.conditions.categories.join(', ')}</li>
                        )}
                        {rule.conditions.sectors && (
                          <li>• Sectors: {rule.conditions.sectors.join(', ')}</li>
                        )}
                        {rule.conditions.keywords && (
                          <li>• Keywords: {rule.conditions.keywords.join(', ')}</li>
                        )}
                      </ul>
                    </div>

                    <div>
                      <span className="font-medium text-gray-700">Actions:</span>
                      <ul className="mt-1 space-y-1 text-gray-600">
                        {rule.actions.emailAlert && <li>• Email alerts</li>}
                        {rule.actions.popupNotification && <li>• Popup notifications</li>}
                        {rule.actions.escalation && <li>• Escalation workflow</li>}
                      </ul>
                      <div className="mt-2">
                        <span className="font-medium text-gray-700">Recipients:</span>
                        <p className="text-gray-600">{rule.recipients.join(', ')}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button className="p-2 hover:bg-gray-100 rounded text-gray-600">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Alert Rule
          </button>
        </div>
      </div>
    );
  };

  // Main render
  if (!hasAdminAccess) {
    return renderPermissionCheck();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Threat Intelligence Administration</h1>
        <p className="text-gray-600">Configure and manage threat intelligence system settings</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'feeds', name: 'RSS Feeds', icon: Rss },
            { id: 'settings', name: 'Settings', icon: Settings },
            { id: 'alerts', name: 'Alert Rules', icon: Bell },
            ...(hasSuperAdminAccess ? [{ id: 'users', name: 'User Management', icon: Users }] : [])
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`group inline-flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'feeds' && renderFeedsTab()}
        {activeTab === 'settings' && renderSettingsTab()}
        {activeTab === 'alerts' && renderAlertsTab()}
        {activeTab === 'users' && hasSuperAdminAccess && (
          <div className="text-center py-8 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>User management functionality coming soon...</p>
          </div>
        )}
      </div>

      {/* Modals */}
      {showAddFeedModal && renderFeedModal(false)}
      {showEditFeedModal && renderFeedModal(true)}
    </div>
  );
};

export default ThreatAdmin;