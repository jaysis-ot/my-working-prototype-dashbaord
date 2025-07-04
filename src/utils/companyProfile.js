// src/utils/companyProfile.js

import { 
  COMPANY_SIZE_THRESHOLDS, 
  ANNUAL_REVENUE_RANGES, 
  EMPLOYEE_COUNT_RANGES,
  COMPLIANCE_FRAMEWORKS 
} from '../constants/companyProfile';

// Utility function to determine company size based on UK government thresholds
export const determineCompanySize = (profile) => {
  const revenue = ANNUAL_REVENUE_RANGES.find(r => r.value === profile.annualRevenue);
  const employees = EMPLOYEE_COUNT_RANGES.find(e => e.value === profile.employeeCount);
  
  if (!revenue || !employees) return null;
  
  // Company qualifies as MICRO if it meets 2 of the 3 criteria
  // Company qualifies as SMALL if it exceeds MICRO but meets 2 of the 3 SMALL criteria
  // Company qualifies as MEDIUM if it exceeds SMALL but meets 2 of the 3 MEDIUM criteria
  
  const revenueAmount = revenue.amount;
  const employeeCount = employees.count;
  
  // Check MICRO thresholds
  const microCriteria = [
    revenueAmount <= COMPANY_SIZE_THRESHOLDS.MICRO.turnover,
    employeeCount <= COMPANY_SIZE_THRESHOLDS.MICRO.employees
  ].filter(Boolean).length;
  
  if (microCriteria >= 2) return 'MICRO';
  
  // Check SMALL thresholds
  const smallCriteria = [
    revenueAmount <= COMPANY_SIZE_THRESHOLDS.SMALL.turnover,
    employeeCount <= COMPANY_SIZE_THRESHOLDS.SMALL.employees
  ].filter(Boolean).length;
  
  if (smallCriteria >= 2) return 'SMALL';
  
  // Check MEDIUM thresholds
  const mediumCriteria = [
    revenueAmount <= COMPANY_SIZE_THRESHOLDS.MEDIUM.turnover,
    employeeCount <= COMPANY_SIZE_THRESHOLDS.MEDIUM.employees
  ].filter(Boolean).length;
  
  if (mediumCriteria >= 2) return 'MEDIUM';
  
  return 'LARGE';
};

// Get suggested frameworks based on company size
export const getSuggestedFrameworks = (companySize) => {
  switch (companySize) {
    case 'MICRO':
      return COMPLIANCE_FRAMEWORKS.filter(f => 
        f.category === 'SME-Focused' && 
        (f.name.includes('Essential Eight') || f.name.includes('UK NCSC Small Business'))
      );
    case 'SMALL':
      return COMPLIANCE_FRAMEWORKS.filter(f => 
        f.category === 'SME-Focused' && 
        (f.name.includes('CIS Controls') || f.name.includes('NIST Small Business'))
      );
    case 'MEDIUM':
      return COMPLIANCE_FRAMEWORKS.filter(f => 
        f.category === 'International' && 
        (f.name.includes('ISO 27001') || f.name.includes('NIST CSF'))
      );
    case 'LARGE':
      return COMPLIANCE_FRAMEWORKS.filter(f => 
        f.category === 'International' || f.category === 'Industry-Specific'
      );
    default:
      return [];
  }
};

// Get human-readable labels for profile data
export const getRevenueLabel = (revenueValue) => {
  const range = ANNUAL_REVENUE_RANGES.find(r => r.value === revenueValue);
  return range ? range.label : 'Not specified';
};

export const getEmployeeLabel = (employeeValue) => {
  const range = EMPLOYEE_COUNT_RANGES.find(e => e.value === employeeValue);
  return range ? range.label : 'Not specified';
};

// Get company size category with fallback
export const getCompanySize = (profile) => {
  if (!profile?.annualRevenue || !profile?.employeeCount) return 'Unknown';
  
  return determineCompanySize(profile) || 'Unknown';
};

// Validate company profile data
export const validateCompanyProfile = (profile) => {
  const errors = {};
  
  if (!profile.companyName?.trim()) errors.companyName = 'Company name is required';
  if (!profile.industry) errors.industry = 'Industry selection is required';
  if (!profile.annualRevenue) errors.annualRevenue = 'Annual revenue range is required';
  if (!profile.employeeCount) errors.employeeCount = 'Employee count is required';
  if (!profile.companyType) errors.companyType = 'Company type is required';
  if (!profile.contactEmail?.trim()) errors.contactEmail = 'Contact email is required';
  if (profile.contactEmail && !/\S+@\S+\.\S+/.test(profile.contactEmail)) {
    errors.contactEmail = 'Please enter a valid email address';
  }
  if (!profile.technologySetup) errors.technologySetup = 'Technology setup is required';
  if (!profile.sensitiveDataTypes?.length) errors.sensitiveDataTypes = 'Select at least one data type';
  if (!profile.operatingRegions?.length) errors.operatingRegions = 'Select at least one operating region';
  
  return errors;
};

// Calculate profile completion percentage
export const getProfileCompletionPercentage = (profile) => {
  const requiredFields = [
    'companyName', 'industry', 'annualRevenue', 'employeeCount', 
    'companyType', 'contactEmail', 'technologySetup'
  ];
  const arrayFields = ['sensitiveDataTypes', 'operatingRegions'];
  
  let completed = 0;
  const total = requiredFields.length + arrayFields.length;
  
  if (!profile) return 0;
  
  requiredFields.forEach(field => {
    if (profile[field] && String(profile[field]).trim()) completed++;
  });
  
  arrayFields.forEach(field => {
    if (profile[field] && profile[field].length > 0) completed++;
  });
  
  if (total === 0) return 100;
  return Math.round((completed / total) * 100);
};

// Check if profile is complete
export const isProfileComplete = (profile) => {
  return profile?.profileCompleted === true && getProfileCompletionPercentage(profile) >= 100;
};

// Get risk assessment insights based on profile
export const getProfileRiskInsights = (profile) => {
  const insights = [];
  if (!profile) return insights;
  
  const companySize = determineCompanySize(profile);
  
  if (profile.previousIncidents) {
    insights.push({
      type: 'warning',
      title: 'Previous Security Incidents',
      message: 'Company has experienced security incidents in the past 2 years'
    });
  }
  
  if (!profile.businessContinuityPlan) {
    insights.push({
      type: 'alert',
      title: 'No Business Continuity Plan',
      message: 'Consider developing a business continuity plan'
    });
  }
  
  if (profile.sensitiveDataTypes?.includes('Personal Identifiable Information (PII)')) {
    insights.push({
      type: 'info',
      title: 'PII Handling',
      message: 'Ensure GDPR compliance for personal data processing'
    });
  }
  
  if (companySize === 'MICRO' || companySize === 'SMALL') {
    insights.push({
      type: 'tip',
      title: 'SME Resources',
      message: 'Consider SME-focused frameworks like Essential Eight or CIS Controls'
    });
  }
  
  return insights;
};
