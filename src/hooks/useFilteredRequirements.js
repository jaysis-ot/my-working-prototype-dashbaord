import { useMemo } from 'react';

/**
 * Custom hook to filter an array of requirements based on a set of filters and a search term.
 * 
 * This hook is memoized for performance, meaning it will only re-calculate the
 * filtered list when the source requirements, filters, or search term change.
 * This is crucial for maintaining a responsive UI, especially with large datasets.
 * 
 * @param {Array<Object>} requirements - The full array of requirement objects to filter.
 * @param {Object} filters - An object where keys are requirement fields (e.g., 'status', 'priority')
 *                           and values are the desired filter values.
 * @param {string} searchTerm - A string to search for across multiple requirement fields.
 * @returns {Array<Object>} A new, memoized array containing only the filtered requirements.
 */
export const useFilteredRequirements = (requirements, filters, searchTerm) => {
  return useMemo(() => {
    // Return an empty array immediately if there are no requirements to process.
    if (!requirements || requirements.length === 0) {
      return [];
    }

    const searchLower = searchTerm?.toLowerCase() || '';

    return requirements.filter(req => {
      // 1. Search Term Matching
      // The requirement is a match if the search term is empty or if it's found
      // in any of the specified fields. The search is case-insensitive.
      const matchesSearch = !searchLower || (
        [
          req.id,
          req.description,
          req.category,
          req.businessJustification,
          req.priority,
          req.status,
          req.area,
          req.type,
          req.progressStatus,
          req.maturityLevel?.level,
          // include numeric maturity score as string just in case users search for it
          req.maturityLevel?.score?.toString(),
          req.applicability?.type,
          req.assignee
        ]
          .filter(Boolean)                         // remove undefined / null
          .map(v => v.toString().toLowerCase())    // normalise
          .some(v => v.includes(searchLower))      // any match
      );

      // If it doesn't match the search, we can stop here.
      if (!matchesSearch) {
        return false;
      }

      // 2. Filter Criteria Matching
      // The requirement must match all active filters. If a filter is not set
      // (i.e., it's an empty string or null), it is ignored.
      const matchesFilters =
        (!filters.area || req.area === filters.area) &&
        (!filters.type || req.type === filters.type) &&
        (!filters.status || req.status === filters.status) &&
        (!filters.priority || req.priority === filters.priority) &&
        (!filters.maturityLevel || req.maturityLevel?.level === filters.maturityLevel) &&
        (!filters.capability || req.capabilityId === filters.capability);

      // The requirement is included in the final list only if it matches both search and filters.
      return matchesFilters;
    });
  }, [requirements, filters, searchTerm]);
};
