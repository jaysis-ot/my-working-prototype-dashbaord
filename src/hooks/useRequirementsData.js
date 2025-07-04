import { useState, useEffect, useCallback } from 'react';

/**
 * Generates a static list of mock requirements for demonstration purposes.
 * In a real application, this data would be fetched from an API.
 * @returns {Array} An array of requirement objects.
 */
const generateMockData = () => {
  const mockData = [];
  const statuses = ['Not Started', 'In Progress', 'Completed', 'On Hold', 'Under Review'];
  const priorities = ['Low', 'Medium', 'High', 'Critical'];
  const areas = ['Business', 'User', 'System', 'Infrastructure'];
  const types = ['Functional', 'Non-Functional'];
  const capabilities = ['CAP-001', 'CAP-002', 'CAP-003', 'CAP-004', 'CAP-005', 'CAP-006'];

  for (let i = 1; i <= 50; i++) {
    const status = statuses[i % statuses.length];
    const maturityScore = (i % 5) + 1;
    mockData.push({
      id: `REQ-${String(i).padStart(3, '0')}`,
      description: `Requirement for enhancing security protocol #${i}. This involves multiple steps including review, implementation, and verification to ensure compliance with standards.`,
      capabilityId: capabilities[i % capabilities.length],
      status: status,
      priority: priorities[i % priorities.length],
      businessValueScore: parseFloat(((i % 4) + 1.5).toFixed(1)),
      maturityLevel: {
        score: maturityScore,
        level: ['Initial', 'Developing', 'Defined', 'Managed', 'Optimizing'][maturityScore - 1],
      },
      area: areas[i % areas.length],
      type: types[i % types.length],
      assignee: `Team ${String.fromCharCode(65 + (i % 4))}`,
      dueDate: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      lastUpdated: new Date(Date.now() - (i % 10) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });
  }
  return mockData;
};

/**
 * Custom hook for fetching and managing requirements data.
 * 
 * This hook encapsulates the logic for data retrieval, state management (loading, error),
 * and data manipulation for security requirements. It is designed to be a self-contained
 * data source for any component that needs to interact with requirements.
 * 
 * For now, it uses mock data. In a production environment, it would be updated
 * to fetch data from an API using a library like React Query or Axios.
 * 
 * @returns {{
 *   requirements: Array<Object>,
 *   loading: boolean,
 *   error: Error|null,
 *   addRequirement: (newRequirement: Object) => void,
 *   updateRequirement: (id: string, updatedData: Object) => void,
 *   deleteRequirement: (id: string) => void
 * }}
 */
export const useRequirementsData = () => {
  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Effect to load initial data from the mock source
  useEffect(() => {
    try {
      setLoading(true);
      const mockData = generateMockData();
      // Simulate network delay
      setTimeout(() => {
        setRequirements(mockData);
        setLoading(false);
      }, 800);
    } catch (e) {
      console.error("Failed to load requirements data:", e);
      setError(e);
      setLoading(false);
    }
  }, []);

  /**
   * Adds a new requirement to the list.
   * @param {Object} newRequirementData - The data for the new requirement.
   */
  const addRequirement = useCallback((newRequirementData) => {
    const newRequirement = {
      id: `REQ-${String(Date.now()).slice(-4)}`,
      ...newRequirementData,
      lastUpdated: new Date().toISOString().split('T')[0],
    };
    setRequirements(prevRequirements => [...prevRequirements, newRequirement]);
  }, []);

  /**
   * Updates an existing requirement by its ID.
   * @param {string} id - The ID of the requirement to update.
   * @param {Object} updatedData - An object containing the fields to update.
   */
  const updateRequirement = useCallback((id, updatedData) => {
    setRequirements(prevRequirements =>
      prevRequirements.map(req =>
        req.id === id
          ? { ...req, ...updatedData, lastUpdated: new Date().toISOString().split('T')[0] }
          : req
      )
    );
  }, []);

  /**
   * Deletes a requirement by its ID.
   * @param {string} id - The ID of the requirement to delete.
   */
  const deleteRequirement = useCallback((id) => {
    setRequirements(prevRequirements => prevRequirements.filter(req => req.id !== id));
  }, []);

  return { requirements, loading, error, addRequirement, updateRequirement, deleteRequirement };
};
