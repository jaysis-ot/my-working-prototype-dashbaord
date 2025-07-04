// src/utils/index.js

/**
 * Utils Barrel Export
 * 
 * Centralized export for all utility functions used throughout the dashboard.
 * Provides clean imports and consistent access to helper functions, theme utilities,
 * and other shared functionality.
 */

// =============================================================================
// DASHBOARD HELPERS
// =============================================================================

// Import and re-export dashboard helpers
import dashboardHelpers, {
  // Statistical calculations
  calculateCompletionStats,
  calculateBusinessValueStats,
  calculateMaturityStats,
  calculateCostStats,
  
  // Filtering and searching
  filterRequirements,
  searchRequirements,
  sortRequirements,
  
  // Status and priority utilities
  getStatusConfig,
  getPriorityConfig,
  getApplicabilityConfig,
  
  // Date and time utilities
  formatRelativeTime,
  formatDate,
  isDateInRange,
  
  // Validation
  validateRequirement,
  
  // General utilities
  getNestedValue,
  debounce,
  generateId,
  deepClone,
  shallowEqual,
  calculatePercentage
} from './dashboardHelpers';

// =============================================================================
// THEME UTILITIES
// =============================================================================

// Import and re-export theme utilities
import themeUtils, {
  // Theme management
  getCurrentTheme,
  setTheme,
  applyThemeToDocument,
  initializeTheme,
  
  // Class generation
  getThemeClasses,
  getSidebarClasses,
  getHeaderClasses,
  getModalClasses,
  getCardClasses,
  getButtonClasses,
  getInputClasses,
  getChartClasses,
  getTableClasses,
  
  // Utilities
  isSystemDarkMode,
  toggleDarkMode,
  getThemeMetadata,
  watchSystemTheme,
  
  // CSS properties
  getThemeProperties,
  setCSSCustomProperties
} from './themeUtils';

// =============================================================================
// CSV UTILITIES (Future)
// =============================================================================

// Placeholder for CSV utilities that will be imported when created
// import csvUtils, {
//   generateCSV,
//   downloadCSV,
//   parseCSV,
//   validateCSVData,
//   transformCSVToRequirements
// } from './csvUtils';

// =============================================================================
// API UTILITIES (Future)
// =============================================================================

// Placeholder for API utilities
// import apiUtils, {
//   buildApiUrl,
//   handleApiError,
//   transformApiResponse,
//   createApiRequest
// } from './apiUtils';

// =============================================================================
// VALIDATION UTILITIES (Future)
// =============================================================================

// Placeholder for expanded validation utilities
// import validationUtils, {
//   validateEmail,
//   validateUrl,
//   validateDateRange,
//   validateBusinessRules,
//   createValidator
// } from './validationUtils';

// =============================================================================
// FORMATTING UTILITIES (Future)
// =============================================================================

// Placeholder for formatting utilities
// import formatUtils, {
//   formatCurrency,
//   formatNumber,
//   formatFileSize,
//   formatDuration,
//   truncateText
// } from './formatUtils';

// =============================================================================
// STORAGE UTILITIES (Future)
// =============================================================================

// Placeholder for storage utilities
// import storageUtils, {
//   getLocalStorage,
//   setLocalStorage,
//   removeLocalStorage,
//   getSessionStorage,
//   setSessionStorage,
//   clearAllStorage
// } from './storageUtils';

// =============================================================================
// INDIVIDUAL EXPORTS
// =============================================================================

// Dashboard helper functions
export {
  // Default export
  dashboardHelpers as default,
  
  // Statistical calculations
  calculateCompletionStats,
  calculateBusinessValueStats,
  calculateMaturityStats,
  calculateCostStats,
  
  // Filtering and searching
  filterRequirements,
  searchRequirements,
  sortRequirements,
  
  // Status and priority utilities
  getStatusConfig,
  getPriorityConfig,
  getApplicabilityConfig,
  
  // Date and time utilities
  formatRelativeTime,
  formatDate,
  isDateInRange,
  
  // Validation
  validateRequirement,
  
  // General utilities
  getNestedValue,
  debounce,
  generateId,
  deepClone,
  shallowEqual,
  calculatePercentage
};

// Theme utilities
export {
  // Theme management
  getCurrentTheme,
  setTheme,
  applyThemeToDocument,
  initializeTheme,
  
  // Class generation
  getThemeClasses,
  getSidebarClasses,
  getHeaderClasses,
  getModalClasses,
  getCardClasses,
  getButtonClasses,
  getInputClasses,
  getChartClasses,
  getTableClasses,
  
  // Theme utilities
  isSystemDarkMode,
  toggleDarkMode,
  getThemeMetadata,
  watchSystemTheme,
  getThemeProperties,
  setCSSCustomProperties
};

// =============================================================================
// GROUPED EXPORTS FOR CONVENIENCE
// =============================================================================

// Dashboard-specific utilities
export const dashboard = {
  calculateCompletionStats,
  calculateBusinessValueStats,
  calculateMaturityStats,
  calculateCostStats,
  filterRequirements,
  searchRequirements,
  sortRequirements,
  validateRequirement
};

// Theme-specific utilities
export const theme = {
  getCurrentTheme,
  setTheme,
  applyThemeToDocument,
  initializeTheme,
  getThemeClasses,
  isSystemDarkMode,
  toggleDarkMode,
  getThemeMetadata,
  watchSystemTheme
};

// Display formatting utilities
export const display = {
  getStatusConfig,
  getPriorityConfig,
  getApplicabilityConfig,
  formatRelativeTime,
  formatDate,
  calculatePercentage
};

// Data manipulation utilities
export const data = {
  getNestedValue,
  deepClone,
  shallowEqual,
  generateId,
  debounce
};

// Validation utilities
export const validation = {
  validateRequirement,
  isDateInRange
};

// =============================================================================
// UTILITY HELPERS AND SHORTCUTS
// =============================================================================

/**
 * Quick access to commonly used utilities
 */
export const utils = {
  // Data operations
  clone: deepClone,
  equal: shallowEqual,
  get: getNestedValue,
  id: generateId,
  wait: debounce,
  
  // Calculations
  percentage: calculatePercentage,
  stats: calculateCompletionStats,
  
  // Formatting
  relativeTime: formatRelativeTime,
  date: formatDate,
  
  // Filtering
  filter: filterRequirements,
  search: searchRequirements,
  sort: sortRequirements,
  
  // Theme
  currentTheme: getCurrentTheme,
  setTheme,
  themeClasses: getThemeClasses,
  
  // Validation
  validate: validateRequirement,
  
  // Status helpers
  statusConfig: getStatusConfig,
  priorityConfig: getPriorityConfig
};

// =============================================================================
// FUTURE UTILITY EXPORTS
// =============================================================================

// When new utility files are added, export them here:
// export { default as csvUtils } from './csvUtils';
// export { default as apiUtils } from './apiUtils';
// export { default as validationUtils } from './validationUtils';
// export { default as formatUtils } from './formatUtils';
// export { default as storageUtils } from './storageUtils';

// Future grouped exports:
// export const csv = csvUtils;
// export const api = apiUtils;
// export const format = formatUtils;
// export const storage = storageUtils;

// =============================================================================
// USAGE EXAMPLES AND DOCUMENTATION
// =============================================================================

/*
// Basic import of specific utilities
import { calculateCompletionStats, getCurrentTheme, filterRequirements } from '../utils';

// Import grouped utilities
import { dashboard, theme, display } from '../utils';
const stats = dashboard.calculateCompletionStats(requirements);
const currentTheme = theme.getCurrentTheme();

// Import everything with namespace
import * as utils from '../utils';
const stats = utils.calculateCompletionStats(requirements);

// Import quick access utilities
import { utils } from '../utils';
const clonedData = utils.clone(originalData);
const filteredData = utils.filter(requirements, filters);

// Usage examples:

// 1. Calculate dashboard statistics
const completionStats = calculateCompletionStats(requirements);
const businessValueStats = calculateBusinessValueStats(requirements);

// 2. Filter and search requirements
const filtered = filterRequirements(requirements, { status: 'Completed' });
const searched = searchRequirements(requirements, 'network security');

// 3. Theme management
const theme = getCurrentTheme();
setTheme('stripe');
const sidebarClasses = getSidebarClasses(theme);

// 4. Data manipulation
const cloned = deepClone(complexObject);
const isEqual = shallowEqual(obj1, obj2);
const nestedValue = getNestedValue(obj, 'user.profile.name');

// 5. Formatting and display
const statusConfig = getStatusConfig('Completed');
const relativeTime = formatRelativeTime(new Date());
const percentage = calculatePercentage(completed, total);

// 6. Validation
const validation = validateRequirement(requirement);
if (validation.isValid) {
  // Process requirement
}
*/