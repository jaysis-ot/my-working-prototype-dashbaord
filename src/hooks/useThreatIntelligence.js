import { useState, useEffect, useCallback, useRef } from 'react';

// --- Constants ---

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

// --- Mock API ---

const mockAPI = {
  async searchThreats(criteria) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      threats: Array.from({ length: 15 }, (_, i) => ({
        id: `THR-${String(i + 1).padStart(3, '0')}`,
        title: `Mock Threat Vector ${i + 1}`,
        severity: ['Low', 'Medium', 'High', 'Critical'][i % 4],
        riskScore: parseFloat((Math.random() * 8 + 2).toFixed(1)),
        confidence: Math.floor(Math.random() * 50 + 50),
        status: ['active', 'monitoring', 'investigating', 'resolved'][i % 4],
        publishedDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        description: `This is a mock description for threat vector ${i + 1}, detailing potential impact and observed activity.`,
        source: 'mock_api'
      })),
      total: 15
    };
  },
  async searchIOCs(criteria) {
    await new Promise(resolve => setTimeout(resolve, 300));
    return Array.from({ length: 25 }, (_, i) => ({
      id: `ioc-${i + 1}`,
      value: `192.168.1.${i + 1}`,
      type: 'ip_address',
      confidence: Math.floor(Math.random() * 60 + 40),
      firstSeen: new Date().toISOString(),
      reputation: { category: ['suspicious', 'malicious', 'benign'][i % 3], score: Math.random() * 10 }
    }));
  }
};

// --- Main Hook ---

/**
 * Custom hook for managing threat intelligence data.
 * 
 * This hook encapsulates all logic for fetching, managing, and interacting
 * with threat intelligence data, providing a clean interface for UI components.
 * It uses a mock API to simulate real-world data fetching and state management.
 */
const useThreatIntelligence = () => {
  const [threats, setThreats] = useState([]);
  const [iocs, setIOCs] = useState([]);
  const [statistics, setStatistics] = useState({
    totalThreats: 0,
    newThreats: 0,
    highRiskThreats: 0,
    lastUpdate: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const abortControllerRef = useRef(null);

  const initialize = useCallback(async () => {
    if (isInitialized) return;
    
    setLoading(true);
    setError(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const threatsResult = await mockAPI.searchThreats({});
      const iocsResult = await mockAPI.searchIOCs({});
      
      setThreats(threatsResult.threats);
      setIOCs(iocsResult);
      
      setStatistics({
        totalThreats: threatsResult.total,
        newThreats: Math.floor(Math.random() * 5),
        highRiskThreats: threatsResult.threats.filter(t => ['High', 'Critical'].includes(t.severity)).length,
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
      setStatistics(prev => ({
        ...prev,
        totalThreats: result.total,
        highRiskThreats: result.threats.filter(t => ['High', 'Critical'].includes(t.severity)).length,
        lastUpdate: new Date().toISOString()
      }));
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
  
  useEffect(() => {
    initialize();
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [initialize]);

  return {
    // State
    threats,
    iocs,
    statistics,
    loading,
    error,
    isInitialized,

    // Actions
    searchThreats,

    // Constants
    THREAT_INTEL_SOURCES,
  };
};

export { useThreatIntelligence };
