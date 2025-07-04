// src/hooks/useAnalytics.js
import { useMemo } from 'react';

export const useAnalytics = (requirements, capabilities) => {
  return useMemo(() => {
    return {
      totalRequirements: requirements?.length || 0,
      totalCapabilities: capabilities?.length || 0,
      completionRate: 0
    };
  }, [requirements, capabilities]);
};