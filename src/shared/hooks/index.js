// src/hooks/index.js

/**
 * Hooks Barrel Export
 * 
 * Centralized export for all custom React hooks used throughout the application.
 * Provides clean imports and consistent access to reusable stateful logic.
 */

// =============================================================================
// MAIN DASHBOARD HOOKS
// =============================================================================

// Primary dashboard state management
export { default as useDashboardState } from './useDashboardState';
export { useDashboardState } from './useDashboardState';

// =============================================================================
// DATA MANAGEMENT HOOKS
// =============================================================================

// Core data hooks
export { default as useRequirementsData } from './useRequirementsData';
export { default as useCapabilitiesData } from './useCapabilitiesData';
export { default as usePCDData } from './usePCDData';
export { default as useCompanyProfile } from './useCompanyProfile';

// Processed data hooks
export { default as useFilteredRequirements } from './useFilteredRequirements';
export { default as useAnalytics } from './useAnalytics';

// Future data hooks
// export { default as useThreatsData } from './useThreatsData';
// export { default as useRisksData } from './useRisksData';
// export { default as useUsersData } from './useUsersData';
// export { default as useAuditLog } from './useAuditLog';

// =============================================================================
// UI AND BEHAVIOR HOOKS
// =============================================================================

// User interface hooks
export { default as useToast } from './useToast';
export { default as useModal } from './useModal';
export { default as useKeyboardShortcuts } from './useKeyboardShortcuts';
export { default as useResponsive } from './useResponsive';

// Interaction hooks
export { default as useDebounce } from './useDebounce';
export { default as useLocalStorage } from './useLocalStorage';
export { default as useSessionStorage } from './useSessionStorage';

// Future UI hooks
// export { default as useTheme } from './useTheme';
// export { default as useDragAndDrop } from './useDragAndDrop';
// export { default as useVirtualList } from './useVirtualList';
// export { default as useInfiniteScroll } from './useInfiniteScroll';

// =============================================================================
// SPECIALIZED BUSINESS LOGIC HOOKS
// =============================================================================

// Security and compliance hooks
export { default as useThreatIntelligence } from './useThreatIntelligence';
export { default as useComplianceTracking } from './useComplianceTracking';
export { default as useRiskAssessment } from './useRiskAssessment';

// Analytics and reporting hooks
export { default as useChartData } from './useChartData';
export { default as useExportData } from './useExportData';
export { default as useRealtimeUpdates } from './useRealtimeUpdates';

// Future business hooks
// export { default as useWorkflowEngine } from './useWorkflowEngine';
// export { default as useNotificationCenter } from './useNotificationCenter';
// export { default as useCollaboration } from './useCollaboration';
// export { default as useAIRecommendations } from './useAIRecommendations';

// =============================================================================
// UTILITY HOOKS
// =============================================================================

// Generic utility hooks
export { default as usePrevious } from './usePrevious';
export { default as useToggle } from './useToggle';
export { default as useCounter } from './useCounter';
export { default as useAsync } from './useAsync';
export { default as useEventListener } from './useEventListener';
export { default as useClickOutside } from './useClickOutside';
export { default as useWindowSize } from './useWindowSize';
export { default as useScrollPosition } from './useScrollPosition';

// Performance hooks
export { default as useMemoizedCallback } from './useMemoizedCallback';
export { default as useThrottle } from './useThrottle';
export { default as useDeepMemo } from './useDeepMemo';

// Future utility hooks
// export { default as useGeolocation } from './useGeolocation';
// export { default as usePermissions } from './usePermissions';
// export { default as useNetworkStatus } from './useNetworkStatus';
// export { default as useBatteryStatus } from './useBatteryStatus';

// =============================================================================
// FORM AND VALIDATION HOOKS
// =============================================================================

// Form management
export { default as useForm } from './useForm';
export { default as useFormValidation } from './useFormValidation';
export { default as useFieldArray } from './useFieldArray';

// Input handling
export { default as useInput } from './useInput';
export { default as useSearch } from './useSearch';
export { default as useAutocomplete } from './useAutocomplete';

// Future form hooks
// export { default as useFormPersistence } from './useFormPersistence';
// export { default as useFormStepper } from './useFormStepper';
// export { default as useConditionalFields } from './useConditionalFields';

// =============================================================================
// API AND INTEGRATION HOOKS
// =============================================================================

// API communication
export { default as useApi } from './useApi';
export { default as useFetch } from './useFetch';
export { default as useApiCache } from './useApiCache';

// Real-time features
export { default as useWebSocket } from './useWebSocket';
export { default as useSSE } from './useSSE'; // Server-Sent Events

// Future integration hooks
// export { default as useGraphQL } from './useGraphQL';
// export { default as useOAuth } from './useOAuth';
// export { default as useFileUpload } from './useFileUpload';
// export { default as useClipboard } from './useClipboard';

// =============================================================================
// COMPOSED HOOKS (Higher-level combinations)
// =============================================================================

// Complex feature hooks that combine multiple smaller hooks
export { default as useDashboardFilters } from './useDashboardFilters';
export { default as useTableState } from './useTableState';
export { default as useModalStack } from './useModalStack';
export { default as useNotificationQueue } from './useNotificationQueue';

// Future composed hooks
// export { default as useAdvancedSearch } from './useAdvancedSearch';
// export { default as useBulkOperations } from './useBulkOperations';
// export { default as useDataSync } from './useDataSync';
// export { default as useOfflineSync } from './useOfflineSync';

// =============================================================================
// HOOK FACTORIES AND UTILITIES
// =============================================================================

// Hook creation utilities
export { default as createAsyncHook } from './factories/createAsyncHook';
export { default as createStorageHook } from './factories/createStorageHook';
export { default as createApiHook } from './factories/createApiHook';

// Hook composition utilities
export { default as combineHooks } from './utils/combineHooks';
export { default as withHookErrorBoundary } from './utils/withHookErrorBoundary';

// =============================================================================
// GROUPED EXPORTS FOR CONVENIENCE
// =============================================================================

// Dashboard-specific hooks
export const dashboardHooks = {
  useDashboardState,
  useRequirementsData,
  useCapabilitiesData,
  useCompanyProfile,
  useFilteredRequirements,
  useAnalytics
};

// UI interaction hooks
export const uiHooks = {
  useToast,
  useModal,
  useKeyboardShortcuts,
  useResponsive,
  useDebounce,
  useLocalStorage
};

// Business logic hooks
export const businessHooks = {
  useThreatIntelligence,
  useComplianceTracking,
  useRiskAssessment,
  useChartData,
  useExportData
};

// Utility hooks
export const utilityHooks = {
  usePrevious,
  useToggle,
  useCounter,
  useAsync,
  useEventListener,
  useClickOutside
};

// Form hooks
export const formHooks = {
  useForm,
  useFormValidation,
  useInput,
  useSearch
};

// API hooks
export const apiHooks = {
  useApi,
  useFetch,
  useWebSocket,
  useApiCache
};

// =============================================================================
// USAGE EXAMPLES AND DOCUMENTATION
// =============================================================================

/*
// Basic import of specific hooks
import { useDashboardState, useToast, useResponsive } from '../hooks';

// Import grouped hooks
import { dashboardHooks, uiHooks } from '../hooks';
const { useDashboardState, useRequirementsData } = dashboardHooks;

// Import everything with namespace
import * as hooks from '../hooks';

// Usage in components:
const MyComponent = () => {
  const { state, handlers, data } = useDashboardState();
  const { addToast } = useToast();
  const isDesktop = useResponsive();
  
  // Component logic here
};

// Custom hook composition:
const useAdvancedDashboard = () => {
  const dashboardState = useDashboardState();
  const analytics = useAnalytics(dashboardState.data.requirements);
  const filters = useDashboardFilters(dashboardState.state.filters);
  
  return {
    ...dashboardState,
    analytics,
    filters
  };
};
*/