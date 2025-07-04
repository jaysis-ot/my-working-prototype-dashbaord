// src/components/standards/index.js

/**
 * Standards Components Barrel Export
 * 
 * Centralizes exports for all standards-related components,
 * data structures, and utilities.
 */

// Main Assessment Components
export { default as NISTCSFAssessment } from './NISTCSFAssessment';
export { default as StandardsOverview } from './StandardsOverview';
export { default as FrameworkCard } from './FrameworkCard';
export { default as AssessmentProgress } from './AssessmentProgress';

// Data Structures and Constants
export {
  NIST_CSF_STRUCTURE,
  getAllSubcategories,
  getSubcategoryCount,
  getSubcategoriesByFunction,
  getSubcategoriesByCategory,
  searchSubcategories,
  calculateFunctionCompletion,
  calculateOverallCompletion,
  createDefaultAssessment,
  SCORING_TEMPLATE
} from './nistCsfData';

// Future framework components (when implemented)
// export { default as ISO27001Assessment } from './ISO27001Assessment';
// export { default as SOC2Assessment } from './SOC2Assessment';
// export { default as PCIDSSAssessment } from './PCIDSSAssessment';