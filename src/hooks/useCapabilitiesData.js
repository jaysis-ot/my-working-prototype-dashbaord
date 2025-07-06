import { useState, useEffect, useCallback } from 'react';

/**
 * Generates a static list of mock capabilities for demonstration purposes.
 * In a real application, this data would be fetched from an API.
 * @returns {Array} An array of capability objects.
 */
const generateMockCapabilities = () => {
  return [
    {
      id: 'OT-2023-NS-T-001', // DOMAIN-YYYY-ABBR-T/S-###
      name: 'Network Segmentation',
      description: 'Implement comprehensive network segmentation to isolate OT environments from IT networks and external threats.',
      status: 'In Progress',
      securityControlType: 'technical',       // physical | administrative | technical
      maturityLevel: 'IG2',                   // IG1 | IG2 | IG3
      implementationComplexity: 'High',       // Low | Medium | High
      businessValue: 4.8,
      estimatedROI: 180,
    },
    {
      id: 'OT-2023-IAM-T-002',
      name: 'Identity & Access Management',
      description: 'Establish robust identity and access controls for OT environments with multi-factor authentication and role-based access.',
      status: 'Planning',
      securityControlType: 'administrative',
      maturityLevel: 'IG1',
      implementationComplexity: 'Medium',
      businessValue: 4.5,
      estimatedROI: 150,
    },
    {
      id: 'OT-2023-OTM-S-003',
      name: 'OT Security Monitoring',
      description: 'Deploy comprehensive monitoring and detection capabilities for OT networks and devices.',
      status: 'Not Started',
      securityControlType: 'technical',
      maturityLevel: 'IG1',
      implementationComplexity: 'High',
      businessValue: 4.2,
      estimatedROI: 165,
    },
    {
      id: 'OT-2022-DMH-S-004',
      name: 'Device Management & Hardening',
      description: 'Implement centralized management for OT devices including firmware updates and configuration control.',
      status: 'On Hold',
      securityControlType: 'technical',
      maturityLevel: 'IG2',
      implementationComplexity: 'High',
      businessValue: 3.8,
      estimatedROI: 140,
    },
    {
      id: 'OT-2021-IRP-T-005',
      name: 'Incident Response Plan',
      description: 'Establish and test OT-specific incident response procedures and capabilities.',
      status: 'Completed',
      securityControlType: 'administrative',
      maturityLevel: 'IG3',
      implementationComplexity: 'Medium',
      businessValue: 4.0,
      estimatedROI: 125,
    },
    {
      id: 'OT-2023-VUL-T-006',
      name: 'Vulnerability Management',
      description: 'Develop a program for identifying, assessing, and remediating vulnerabilities within the OT environment.',
      status: 'In Progress',
      securityControlType: 'technical',
      maturityLevel: 'IG2',
      implementationComplexity: 'High',
      businessValue: 4.6,
      estimatedROI: 170,
    },
  ];
};


/**
 * Custom hook for fetching and managing capabilities data.
 * 
 * This hook encapsulates the logic for data retrieval, state management (loading, error),
 * and data manipulation for security capabilities. It is designed to be a self-contained
 * data source for any component that needs to interact with capabilities.
 * 
 * For now, it uses mock data. In a production environment, it would be updated
 * to fetch data from an API using a library like React Query or Axios.
 * 
 * @returns {{
 *   capabilities: Array<Object>,
 *   loading: boolean,
 *   error: Error|null,
 *   addCapability: (newCapability: Object) => void,
 *   updateCapability: (id: string, updatedData: Object) => void
 * }}
 */
export const useCapabilitiesData = () => {
  const [capabilities, setCapabilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Effect to load initial data from the mock source
  useEffect(() => {
    try {
      setLoading(true);
      const mockData = generateMockCapabilities();
      // Simulate network delay
      setTimeout(() => {
        setCapabilities(mockData);
        setLoading(false);
      }, 500);
    } catch (e) {
      console.error("Failed to load capabilities data:", e);
      setError(e);
      setLoading(false);
    }
  }, []);

  /**
   * Adds a new capability to the list.
   * @param {Object} newCapabilityData - The data for the new capability.
   */
  const addCapability = useCallback((newCapabilityData) => {
    const newCapability = {
      // Simple generated ID following DOMAIN-YYYY-ABBR-T pattern with fallback
      id: newCapabilityData.id || `OT-${new Date().getFullYear()}-${(newCapabilityData.name || 'NEW').split(' ').map(w=>w[0]).join('').slice(0,3).toUpperCase()}-T-${String(Date.now()).slice(-3)}`,
      ...newCapabilityData,
      lastUpdated: new Date().toISOString().split('T')[0],
    };
    setCapabilities(prevCapabilities => [...prevCapabilities, newCapability]);
  }, []);

  /**
   * Updates an existing capability by its ID.
   * @param {string} id - The ID of the capability to update.
   * @param {Object} updatedData - An object containing the fields to update.
   */
  const updateCapability = useCallback((id, updatedData) => {
    setCapabilities(prevCapabilities =>
      prevCapabilities.map(cap =>
        cap.id === id
          ? { ...cap, ...updatedData, lastUpdated: new Date().toISOString().split('T')[0] }
          : cap
      )
    );
  }, []);

  return { capabilities, loading, error, addCapability, updateCapability };
};
