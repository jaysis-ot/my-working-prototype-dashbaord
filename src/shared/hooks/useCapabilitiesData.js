// src/hooks/useCapabilitiesData.js
import { useState } from 'react';

export const useCapabilitiesData = () => {
  const [capabilities, setCapabilities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const addCapability = async (capability) => {
    console.log('Adding capability:', capability);
    setCapabilities(prev => [...prev, capability]);
    return true;
  };

  const updateCapability = async (capability) => {
    console.log('Updating capability:', capability);
    return true;
  };

  const deleteCapability = async (id) => {
    console.log('Deleting capability:', id);
    setCapabilities(prev => prev.filter(c => c.id !== id));
    return true;
  };

  return {
    capabilities,
    loading,
    error,
    addCapability,
    updateCapability,
    deleteCapability
  };
};