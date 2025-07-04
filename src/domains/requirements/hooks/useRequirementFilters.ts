// ===== HOOK TEMPLATES =====

// src/domains/requirements/hooks/useRequirementFilters.ts
export const useRequirementFilters = () => {
  const { requirements, filters, actions } = useRequirements();

  const filteredRequirements = useMemo(() => {
    return requirements.filter((requirement) => {
      if (filters.category && requirement.category !== filters.category) {
        return false;
      }
      if (filters.priority && requirement.priority !== filters.priority) {
        return false;
      }
      if (filters.status && requirement.status !== filters.status) {
        return false;
      }
      if (filters.framework && requirement.framework !== filters.framework) {
        return false;
      }
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        return (
          requirement.title.toLowerCase().includes(searchLower) ||
          requirement.description.toLowerCase().includes(searchLower) ||
          requirement.tags.some(tag => tag.toLowerCase().includes(searchLower))
        );
      }
      return true;
    });
  }, [requirements, filters]);

  const setFilter = useCallback((key: keyof RequirementsState['filters'], value: unknown) => {
    actions.setFilters({ ...filters, [key]: value });
  }, [filters, actions]);

  const clearAllFilters = useCallback(() => {
    actions.setFilters({});
  }, [actions]);

  return {
    filteredRequirements,
    filters,
    setFilter,
    clearAllFilters,
    hasActiveFilters: Object.keys(filters).length > 0,
  };
};