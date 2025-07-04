// src/hooks/useThreatIntelligence.js
import { useState, useEffect, useCallback, useRef } from 'react';

// Threat intelligence source types and configurations
export const THREAT_INTEL_SOURCES = {
  RSS_FEEDS: {
    id: 'rss_feeds',
    name: 'RSS Feeds',
    description: 'Security news and advisory feeds',
    dataTypes: ['threats', 'vulnerabilities', 'advisories'],
    updateFrequency: 'hourly',
    reliability: 'medium'
  },
  MITRE_ATTACK: {
    id: 'mitre_attack',
    name: 'MITRE ATT&CK',
    description: 'MITRE ATT&CK framework data',
    dataTypes: ['techniques', 'tactics', 'groups', 'software'],
    updateFrequency: 'daily',
    reliability: 'high'
  },
  COMMERCIAL_FEEDS: {
    id: 'commercial_feeds',
    name: 'Commercial Threat Feeds',
    description: 'Premium threat intelligence feeds',
    dataTypes: ['iocs', 'campaigns', 'attribution', 'technical_analysis'],
    updateFrequency: 'real-time',
    reliability: 'high'
  }
};

// IOC types and patterns
export const IOC_TYPES = {
  IP_ADDRESS: {
    type: 'ip_address',
    pattern: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
    description: 'IPv4 addresses',
    ttl: 30 * 24 * 60 * 60 * 1000
  },
  DOMAIN: {
    type: 'domain',
    pattern: /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.([a-zA-Z]{2,})$/,
    description: 'Domain names',
    ttl: 90 * 24 * 60 * 60 * 1000
  },
  URL: {
    type: 'url',
    pattern: /^https?:\/\/[^\s<>"\[\]{}|\\^`]+$/,
    description: 'URLs',
    ttl: 60 * 24 * 60 * 60 * 1000
  },
  FILE_HASH: {
    type: 'file_hash',
    pattern: /^[a-fA-F0-9]{32,64}$/,
    description: 'File hashes (MD5, SHA1, SHA256)',
    ttl: 365 * 24 * 60 * 60 * 1000
  }
};

// Threat actor categories
export const THREAT_ACTOR_CATEGORIES = {
  NATION_STATE: {
    category: 'nation_state',
    name: 'Nation State',
    sophistication: 'very_high',
    motivation: ['espionage', 'sabotage', 'political'],
    capabilities: ['apt', 'zero_day', 'supply_chain', 'insider_access'],
    persistence: 'very_high',
    detectability: 'low'
  },
  CYBERCRIMINAL: {
    category: 'cybercriminal',
    name: 'Cybercriminal',
    sophistication: 'medium',
    motivation: ['financial', 'data_theft'],
    capabilities: ['malware', 'social_engineering', 'fraud'],
    persistence: 'medium',
    detectability: 'medium'
  },
  HACKTIVIST: {
    category: 'hacktivist',
    name: 'Hacktivist',
    sophistication: 'low',
    motivation: ['political', 'ideological', 'social'],
    capabilities: ['ddos', 'defacement', 'data_leak'],
    persistence: 'low',
    detectability: 'high'
  }
};

// Confidence levels
export const CONFIDENCE_LEVELS = {
  CONFIRMED: { level: 95, description: 'Confirmed through multiple independent sources' },
  PROBABLE: { level: 75, description: 'Highly likely based on available evidence' },
  POSSIBLE: { level: 50, description: 'Possible but requires additional verification' },
  DOUBTFUL: { level: 25, description: 'Limited evidence, likely false positive' },
  UNKNOWN: { level: 0, description: 'Insufficient information to assess' }
};

// Mock API functions
const mockAPI = {
  async getThreat(id) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      id,
      title: `Threat ${id}`,
      severity: 'HIGH',
      riskScore: Math.random() * 10,
      confidence: Math.random() * 100,
      status: 'active',
      publishedDate: new Date().toISOString(),
      description: `Description for threat ${id}`,
      iocs: [],
      mitreTechniques: []
    };
  },

  async searchThreats(criteria) {
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
      threats: Array.from({ length: 10 }, (_, i) => ({
        id: `threat_${i + 1}`,
        title: `Mock Threat ${i + 1}`,
        severity: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'][Math.floor(Math.random() * 4)],
        riskScore: Math.random() * 10,
        confidence: Math.random() * 100,
        publishedDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        source: 'mock_api'
      })),
      total: 10
    };
  },

  async processThreat(data, source) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      success: true,
      threatId: `threat_${Date.now()}`,
      riskScore: Math.random() * 10,
      iocsExtracted: Math.floor(Math.random() * 10),
      alertGenerated: Math.random() > 0.5
    };
  },

  async searchIOCs(criteria) {
    await new Promise(resolve => setTimeout(resolve, 300));
    return Array.from({ length: 5 }, (_, i) => ({
      id: `ioc_${i + 1}`,
      value: `192.168.1.${i + 1}`,
      type: 'ip_address',
      confidence: Math.random() * 100,
      firstSeen: new Date().toISOString(),
      reputation: { category: 'suspicious', score: Math.random() * 10 }
    }));
  },

  async getCampaignAnalysis(campaignId) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      id: campaignId,
      name: `Campaign ${campaignId}`,
      threatCount: Math.floor(Math.random() * 50),
      duration: Math.floor(Math.random() * 365),
      averageRiskScore: Math.random() * 10,
      status: 'active'
    };
  },

  async generateReport(options) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    return {
      reportId: `report_${Date.now()}`,
      period: options.period || 'week',
      generatedAt: new Date().toISOString(),
      statistics: {
        totalThreats: Math.floor(Math.random() * 100),
        newThreats: Math.floor(Math.random() * 20),
        highRiskThreats: Math.floor(Math.random() * 10)
      }
    };
  }
};

// Main hook
const useThreatIntelligence = () => {
  const [threats, setThreats] = useState([]);
  const [iocs, setIOCs] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [statistics, setStatistics] = useState({
    totalThreats: 0,
    newThreats: 0,
    highRiskThreats: 0,
    lastUpdate: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const abortControllerRef = useRef();

  const initialize = useCallback(async () => {
    if (isInitialized) return;
    
    setLoading(true);
    setError(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setStatistics({
        totalThreats: 45,
        newThreats: 12,
        highRiskThreats: 8,
        lastUpdate: new Date().toISOString()
      });

      setIsInitialized(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [isInitialized]);

  const searchThreats = useCallback(async (criteria = {}) => {
    setLoading(true);
    setError(null);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      const result = await mockAPI.searchThreats(criteria);
      setThreats(result.threats);
      return result;
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getThreat = useCallback(async (id) => {
    setLoading(true);
    setError(null);

    try {
      const threat = await mockAPI.getThreat(id);
      return threat;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const processThreat = useCallback(async (data, source = 'manual') => {
    setLoading(true);
    setError(null);

    try {
      const result = await mockAPI.processThreat(data, source);
      
      if (result.success) {
        await searchThreats();
      }
      
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [searchThreats]);

  const searchIOCs = useCallback(async (criteria = {}) => {
    setLoading(true);
    setError(null);

    try {
      const result = await mockAPI.searchIOCs(criteria);
      setIOCs(result);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getCampaignAnalysis = useCallback(async (campaignId) => {
    setLoading(true);
    setError(null);

    try {
      const analysis = await mockAPI.getCampaignAnalysis(campaignId);
      return analysis;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const generateThreatReport = useCallback(async (options = {}) => {
    setLoading(true);
    setError(null);

    try {
      const report = await mockAPI.generateReport(options);
      return report;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const normalizeThreatSeverity = useCallback((severity) => {
    const severityMap = new Map([
      ['1', 'LOW'], ['2', 'LOW'], ['3', 'MEDIUM'],
      ['4', 'MEDIUM'], ['5', 'MEDIUM'], ['6', 'HIGH'],
      ['7', 'HIGH'], ['8', 'HIGH'], ['9', 'CRITICAL'],
      ['10', 'CRITICAL'], ['info', 'LOW'], ['low', 'LOW'],
      ['medium', 'MEDIUM'], ['high', 'HIGH'], ['critical', 'CRITICAL']
    ]);

    const normalized = severityMap.get(severity?.toString().toLowerCase());
    return normalized || 'MEDIUM';
  }, []);

  const validateThreatData = useCallback((data) => {
    const required = ['title', 'description', 'severity'];
    const missing = required.filter(field => !data[field]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }

    return true;
  }, []);

  const classifyIOC = useCallback((value) => {
    for (const [, iocType] of Object.entries(IOC_TYPES)) {
      if (iocType.pattern.test(value)) {
        return iocType.type;
      }
    }
    return 'unknown';
  }, []);

  useEffect(() => {
    initialize();
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [initialize]);

  useEffect(() => {
    if (!isInitialized) return;

    const interval = setInterval(() => {
      searchThreats().catch(console.error);
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [isInitialized, searchThreats]);

  return {
    // State
    threats,
    iocs,
    campaigns,
    statistics,
    loading,
    error,
    isInitialized,

    // Actions
    initialize,
    searchThreats,
    getThreat,
    processThreat,
    searchIOCs,
    getCampaignAnalysis,
    generateThreatReport,

    // Utilities
    normalizeThreatSeverity,
    validateThreatData,
    classifyIOC,

    // Constants
    THREAT_INTEL_SOURCES,
    IOC_TYPES,
    THREAT_ACTOR_CATEGORIES,
    CONFIDENCE_LEVELS
  };
};

export default useThreatIntelligence;