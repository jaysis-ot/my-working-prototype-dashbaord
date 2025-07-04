// src/hooks/useFilteredRequirements.js
import { useMemo } from 'react';

export const useFilteredRequirements = (requirements, filters, searchTerm) => {
  return useMemo(() => {
    let filtered = requirements || [];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(req => 
        req.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply other filters
    if (filters) {
      Object.entries(filters).forEach(([field, value]) => {
        if (value && value !== 'all') {
          filtered = filtered.filter(req => req[field] === value);
        }
      });
    }

    return filtered;
  }, [requirements, filters, searchTerm]);
};