// src/hooks/useRequirementsData.js
import { useState, useEffect } from 'react';

export const useRequirementsData = () => {
  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Mock data for now
  useEffect(() => {
    setLoading(true);
    // Simulate loading
    setTimeout(() => {
      setRequirements([
        {
          id: 'REQ-001',
          title: 'Sample Requirement',
          description: 'This is a sample requirement',
          status: 'Not Started',
          priority: 'Medium',
          area: 'Technical',
          type: 'Control'
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const updateRequirement = async (requirement) => {
    // Mock update
    console.log('Updating requirement:', requirement);
    return true;
  };

  const deleteRequirement = async (id) => {
    // Mock delete
    console.log('Deleting requirement:', id);
    setRequirements(prev => prev.filter(r => r.id !== id));
    return true;
  };

  const addRequirement = async (requirement) => {
    // Mock add
    console.log('Adding requirement:', requirement);
    setRequirements(prev => [...prev, requirement]);
    return true;
  };

  const purgeAllData = async () => {
    // Mock purge
    setRequirements([]);
    return true;
  };

  const importFromCSV = async (csvData) => {
    // Mock import
    console.log('Importing CSV:', csvData);
    return true;
  };

  const refreshData = async () => {
    // Mock refresh
    setLoading(true);
    setTimeout(() => setLoading(false), 500);
  };

  return {
    requirements,
    loading,
    error,
    updateRequirement,
    deleteRequirement,
    addRequirement,
    purgeAllData,
    importFromCSV,
    refreshData
  };
};