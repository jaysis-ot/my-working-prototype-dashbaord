import { useState, useEffect, useCallback } from 'react';

// --- Constants ---

// Feed types
export const FEED_TYPES = {
  RSS: 'RSS',
  API: 'API',
  STIX: 'STIX',
  TAXII: 'TAXII',
  MISP: 'MISP',
  GRAPHQL: 'GraphQL',
  OTHER: 'Other'
};

// Update frequencies
export const UPDATE_FREQUENCIES = {
  REALTIME: 'real-time',
  HOURLY: 'hourly',
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  MANUAL: 'manual'
};

// Default feeds
const DEFAULT_FEEDS = [
  {
    id: 'opencti-platform',
    name: 'OpenCTI Platform',
    description: 'Open Cyber Threat Intelligence Platform',
    url: 'https://opencti.io',
    type: 'STIX2/GraphQL API',
    features: [
      'Threat intelligence knowledge management',
      'Observables tracking',
      'MITRE ATT&CK integration',
      'STIX2 standards compliance',
      'Visualization of technical and non-technical information'
    ],
    authentication: {
      required: true,
      type: 'API Key',
      configured: false
    },
    updateFrequency: UPDATE_FREQUENCIES.DAILY,
    status: 'inactive', // inactive until configured
    lastUpdate: null,
    healthStatus: 'unconfigured',
    logo: 'https://opencti.io/wp-content/uploads/2022/02/logo_opencti.png',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'misp-feed',
    name: 'MISP Feed',
    description: 'Malware Information Sharing Platform & Threat Sharing',
    url: 'https://www.misp-project.org/',
    type: FEED_TYPES.MISP,
    features: [
      'IoC sharing',
      'Threat actor tracking',
      'Community-driven intelligence',
      'Automated correlation'
    ],
    authentication: {
      required: true,
      type: 'API Key',
      configured: false
    },
    updateFrequency: UPDATE_FREQUENCIES.DAILY,
    status: 'inactive',
    lastUpdate: null,
    healthStatus: 'unconfigured',
    logo: 'https://www.misp-project.org/assets/images/misp-small.png',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'mitre-attack',
    name: 'MITRE ATT&CK',
    description: 'Globally-accessible knowledge base of adversary tactics and techniques',
    url: 'https://attack.mitre.org/',
    type: FEED_TYPES.STIX,
    features: [
      'Tactics and techniques',
      'Threat actor profiles',
      'Mitigation guidance',
      'Software and tools tracking'
    ],
    authentication: {
      required: false
    },
    updateFrequency: UPDATE_FREQUENCIES.WEEKLY,
    status: 'active',
    lastUpdate: new Date().toISOString(),
    healthStatus: 'healthy',
    logo: 'https://attack.mitre.org/theme/images/mitre_attack_logo.png',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'alienvault-otx',
    name: 'AlienVault OTX',
    description: 'Open Threat Exchange - Community-driven threat intelligence sharing platform',
    url: 'https://otx.alienvault.com/',
    type: FEED_TYPES.API,
    features: [
      'IoCs',
      'Pulse notifications',
      'Community insights',
      'Threat monitoring'
    ],
    authentication: {
      required: true,
      type: 'API Key',
      configured: false
    },
    updateFrequency: UPDATE_FREQUENCIES.DAILY,
    status: 'inactive',
    lastUpdate: null,
    healthStatus: 'unconfigured',
    logo: 'https://www.alienvault.com/images/logo-otx.png',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'feedly-threat-research',
    name: 'Feedly Threat Research',
    description: 'Curated feeds from top threat research blogs and publications',
    url: 'https://feedly.com/i/collection/content/user/0x0/tag/cyber%20threat%20intelligence',
    type: FEED_TYPES.RSS,
    features: [
      'Research articles',
      'Threat analysis',
      'Industry news',
      'Vulnerability reports'
    ],
    authentication: {
      required: false
    },
    updateFrequency: UPDATE_FREQUENCIES.DAILY,
    status: 'active',
    lastUpdate: new Date().toISOString(),
    healthStatus: 'healthy',
    logo: 'https://s2.feedly.com/images/fx/logos/feedly-logo-black-text.png',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// --- Mock API for feed testing ---
const mockAPI = {
  async testFeedConnection(feed) {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulate connection test result
    const success = Math.random() > 0.3; // 70% success rate for demo
    
    return {
      success,
      status: success ? 'healthy' : 'error',
      message: success 
        ? 'Connection established successfully' 
        : 'Failed to connect to feed. Check URL and authentication settings.'
    };
  },
  
  async fetchFeedSample(feed) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Return mock sample data based on feed type
    return {
      success: true,
      sampleData: [
        { id: 'sample-1', type: 'indicator', value: '192.168.1.1', category: 'ip-address' },
        { id: 'sample-2', type: 'threat-actor', value: 'APT29', category: 'threat-actor' },
        { id: 'sample-3', type: 'malware', value: 'Emotet', category: 'malware' }
      ]
    };
  }
};

/**
 * Custom hook for managing threat intelligence feeds
 * 
 * Provides functionality to add, update, remove, and manage threat intel feeds
 * with persistence to localStorage.
 * 
 * @returns {Object} Feed management functions and state
 */
export const useThreatIntelFeeds = () => {
  const [feeds, setFeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [testingFeed, setTestingFeed] = useState(null);
  const [testResult, setTestResult] = useState(null);

  // Initialize feeds from localStorage or defaults
  useEffect(() => {
    const loadFeeds = () => {
      setLoading(true);
      try {
        const storedFeeds = localStorage.getItem('threatIntelFeeds');
        
        if (storedFeeds) {
          setFeeds(JSON.parse(storedFeeds));
        } else {
          // Use default feeds if none stored
          setFeeds(DEFAULT_FEEDS);
          // Save defaults to localStorage
          localStorage.setItem('threatIntelFeeds', JSON.stringify(DEFAULT_FEEDS));
        }
        
        setError(null);
      } catch (err) {
        console.error('Error loading threat intel feeds:', err);
        setError('Failed to load threat intelligence feeds. Using defaults.');
        setFeeds(DEFAULT_FEEDS);
      } finally {
        setLoading(false);
      }
    };

    loadFeeds();
  }, []);

  // Save feeds to localStorage whenever they change
  useEffect(() => {
    if (feeds.length > 0 && !loading) {
      try {
        localStorage.setItem('threatIntelFeeds', JSON.stringify(feeds));
      } catch (err) {
        console.error('Error saving threat intel feeds:', err);
        setError('Failed to save feed changes to local storage.');
      }
    }
  }, [feeds, loading]);

  /**
   * Add a new threat intelligence feed
   * @param {Object} feedData - The feed data to add
   * @returns {Object} The newly added feed
   */
  const addFeed = useCallback((feedData) => {
    const newFeed = {
      id: `feed-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'inactive',
      lastUpdate: null,
      healthStatus: 'unconfigured',
      ...feedData
    };

    setFeeds(prevFeeds => [...prevFeeds, newFeed]);
    return newFeed;
  }, []);

  /**
   * Update an existing feed
   * @param {string} feedId - ID of the feed to update
   * @param {Object} updates - Object containing the properties to update
   * @returns {Object|null} The updated feed or null if not found
   */
  const updateFeed = useCallback((feedId, updates) => {
    let updatedFeed = null;
    
    setFeeds(prevFeeds => {
      const newFeeds = prevFeeds.map(feed => {
        if (feed.id === feedId) {
          updatedFeed = {
            ...feed,
            ...updates,
            updatedAt: new Date().toISOString()
          };
          return updatedFeed;
        }
        return feed;
      });
      
      return newFeeds;
    });
    
    return updatedFeed;
  }, []);

  /**
   * Remove a feed
   * @param {string} feedId - ID of the feed to remove
   * @returns {boolean} Success status
   */
  const removeFeed = useCallback((feedId) => {
    setFeeds(prevFeeds => prevFeeds.filter(feed => feed.id !== feedId));
    return true;
  }, []);

  /**
   * Toggle feed active status
   * @param {string} feedId - ID of the feed to toggle
   * @returns {Object|null} The updated feed or null if not found
   */
  const toggleFeedStatus = useCallback((feedId) => {
    return updateFeed(feedId, feed => ({
      status: feed.status === 'active' ? 'inactive' : 'active'
    }));
  }, [updateFeed]);

  /**
   * Test connection to a feed
   * @param {string} feedId - ID of the feed to test
   * @returns {Promise<Object>} Test result
   */
  const testFeedConnection = useCallback(async (feedId) => {
    const feed = feeds.find(f => f.id === feedId);
    if (!feed) return { success: false, message: 'Feed not found' };
    
    setTestingFeed(feedId);
    setTestResult(null);
    
    try {
      const result = await mockAPI.testFeedConnection(feed);
      setTestResult(result);
      
      // Update feed health status based on test result
      if (result.success) {
        updateFeed(feedId, {
          healthStatus: 'healthy',
          lastTested: new Date().toISOString()
        });
      } else {
        updateFeed(feedId, {
          healthStatus: 'error',
          lastTested: new Date().toISOString()
        });
      }
      
      return result;
    } catch (err) {
      const errorResult = {
        success: false,
        status: 'error',
        message: err.message || 'Unknown error testing feed connection'
      };
      setTestResult(errorResult);
      
      updateFeed(feedId, {
        healthStatus: 'error',
        lastTested: new Date().toISOString()
      });
      
      return errorResult;
    } finally {
      setTestingFeed(null);
    }
  }, [feeds, updateFeed]);

  /**
   * Reset feeds to default configuration
   */
  const resetToDefaults = useCallback(() => {
    setFeeds(DEFAULT_FEEDS);
  }, []);

  /**
   * Get active feeds only
   * @returns {Array} List of active feeds
   */
  const getActiveFeeds = useCallback(() => {
    return feeds.filter(feed => feed.status === 'active');
  }, [feeds]);

  /**
   * Get a feed by ID
   * @param {string} feedId - ID of the feed to get
   * @returns {Object|null} The feed or null if not found
   */
  const getFeedById = useCallback((feedId) => {
    return feeds.find(feed => feed.id === feedId) || null;
  }, [feeds]);

  return {
    // State
    feeds,
    loading,
    error,
    testingFeed,
    testResult,
    
    // Active feeds getter
    activeFeeds: getActiveFeeds(),
    
    // CRUD operations
    addFeed,
    updateFeed,
    removeFeed,
    toggleFeedStatus,
    testFeedConnection,
    getFeedById,
    resetToDefaults,
    
    // Constants
    FEED_TYPES,
    UPDATE_FREQUENCIES
  };
};

export default useThreatIntelFeeds;
