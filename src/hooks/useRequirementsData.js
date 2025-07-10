import { useState, useEffect, useCallback } from 'react';
// Use the comprehensive mock-data generator from the shared utilities,
// which mirrors the structure of the legacy platform (maturityLevel,
// applicability, progressStatus, etc.)
import { generateMockData } from '../utils/dataService';

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
      // Generate base mock data
      let mockData = generateMockData();

      // -------------------------------------------------------------
      // Inject risk relationship data
      // -------------------------------------------------------------
      // Randomly associate some requirements with existing risk IDs so
      // that RiskRequirementsModal can filter on this property.
      // We assume risk IDs follow the format RISK-###
      mockData = mockData.map((req, idx) => {
        // 30% chance a requirement is linked to 1 risk
        // (keeps demo data balanced – tweak probability as needed)
        const riskIds =
          Math.random() > 0.7
            ? [`RISK-${String(idx % 20).padStart(3, '0')}`]
            : [];

        return {
          ...req,
          riskIds, // Array of associated risk IDs
        };
      });

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
      // Ensure riskIds is always an array
      riskIds: Array.isArray(newRequirementData.riskIds)
        ? newRequirementData.riskIds
        : [],
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
