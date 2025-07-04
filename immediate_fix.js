// Add this hook right after the other custom hooks in your current file
// This will fix the immediate error and get your dashboard working

const useAnalytics = (requirements) => {
  return useMemo(() => {
    if (!requirements?.length) {
      return {
        statusData: [],
        maturityData: [],
        businessValueData: []
      };
    }

    // Status distribution
    const statusCounts = requirements.reduce((acc, req) => {
      const status = req.status || 'Unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    // Maturity distribution
    const maturityCounts = requirements.reduce((acc, req) => {
      const level = req.maturityLevel?.level || 'Unknown';
      acc[level] = (acc[level] || 0) + 1;
      return acc;
    }, {});

    // Business value scatter data
    const businessValueData = requirements.map(req => ({
      id: req.id,
      businessValue: req.businessValueScore || 0,
      cost: (req.costEstimate || 0) / 1000, // Convert to thousands
      category: req.category || 'Uncategorized'
    }));

    return {
      statusData: Object.entries(statusCounts).map(([status, count]) => ({
        status,
        count,
        percentage: ((count / requirements.length) * 100).toFixed(1)
      })),
      maturityData: Object.entries(maturityCounts).map(([level, count]) => ({
        level,
        count,
        percentage: ((count / requirements.length) * 100).toFixed(1)
      })),
      businessValueData
    };
  }, [requirements]);
};

// Also replace the unused useRequirementsFilter with this working version:
const useFilteredRequirements = (requirements, filters, searchTerm) => {
  return useMemo(() => {
    if (!requirements?.length) return [];
    
    return requirements.filter(req => {
      // Search matching
      const searchLower = searchTerm?.toLowerCase() || '';
      const matchesSearch = !searchTerm || [
        req.description,
        req.id,
        req.category,
        req.businessJustification
      ].some(field => field?.toLowerCase().includes(searchLower));

      // Filter matching
      const matchesFilters = 
        (!filters.area || req.area === filters.area) &&
        (!filters.type || req.type === filters.type) &&
        (!filters.status || req.status === filters.status) &&
        (!filters.maturityLevel || req.maturityLevel?.level === filters.maturityLevel) &&
        (!filters.applicability || req.applicability?.type === filters.applicability) &&
        (!filters.capability || req.capabilityId === filters.capability);
      
      return matchesSearch && matchesFilters;
    });
  }, [requirements, filters, searchTerm]);
};

// Update the main component to use the correct hook:
// Change this line:
// const filteredRequirements = useRequirementsFilter(requirements, state.filters, state.searchTerm);
// To this:
// const filteredRequirements = useFilteredRequirements(requirements, state.filters, state.searchTerm);