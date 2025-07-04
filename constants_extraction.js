// utils/constants.js
export const TABLE_PAGE_SIZE = 20;
export const BUSINESS_VALUE_CARDS_LIMIT = 12;
export const HIGH_RISK_CARDS_LIMIT = 9;
export const NOTIFICATION_DISPLAY_LIMIT = 3;

export const MATURITY_LEVELS = {
  INITIAL: { level: 'Initial', score: 1, description: 'Ad-hoc, no formal process' },
  DEVELOPING: { level: 'Developing', score: 2, description: 'Some processes defined' },
  DEFINED: { level: 'Defined', score: 3, description: 'Documented and standardized' },
  MANAGED: { level: 'Managed', score: 4, description: 'Measured and controlled' },
  OPTIMIZING: { level: 'Optimizing', score: 5, description: 'Continuously improving' }
};

export const PROGRESS_STATUSES = {
  'Not Started': { percentage: 0, color: '#ef4444', description: 'Requirements gathering has not begun' },
  'Gathering more context': { percentage: 25, color: '#f59e0b', description: 'Initial context and background research' },
  'Feasibility': { percentage: 50, color: '#3b82f6', description: 'Feasibility analysis and technical assessment' },
  'Qualifying': { percentage: 75, color: '#8b5cf6', description: 'Detailed qualification and validation' },
  'Completely Understood and defined': { percentage: 100, color: '#10b981', description: 'Fully defined and ready for implementation' }
};

// Status color mappings
export const STATUS_COLORS = {
  'Not Started': '#ef4444',
  'In Progress': '#f59e0b',
  'Completed': '#10b981',
  'On Hold': '#6b7280',
  'Under Review': '#8b5cf6'
};

export const MATURITY_COLORS = {
  'Initial': '#ef4444',
  'Developing': '#f59e0b',
  'Defined': '#3b82f6',
  'Managed': '#10b981',
  'Optimizing': '#8b5cf6'
};

export const APPLICABILITY_COLORS = {
  'Essential': '#10b981',
  'Applicable': '#3b82f6',
  'Future': '#f59e0b',
  'Conditional': '#f97316',
  'Not Applicable': '#6b7280'
};

// Pre-defined categories (consider moving to API/database)
export const CATEGORIES = [
  "Access Control & Authentication",
  "Access Control & Authentication / Remote Access",
  // ... rest of categories
];

// utils/csvUtils.js
export const parseCSV = (csvText) => {
  try {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    
    const data = lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      return row;
    });
    
    return { headers, data };
  } catch (error) {
    throw new Error(`CSV parsing failed: ${error.message}`);
  }
};

export const generateCSV = (requirements) => {
  if (!requirements?.length) return '';
  
  // Implementation with better error handling
  try {
    // Get all unique keys from all requirements
    const allKeys = new Set();
    requirements.forEach(req => {
      Object.keys(req).forEach(key => {
        if (typeof req[key] === 'object' && req[key] !== null) {
          // Handle nested objects
          if (key === 'maturityLevel') {
            allKeys.add('maturityLevel_level');
            allKeys.add('maturityLevel_score');
            allKeys.add('maturityLevel_description');
          } else if (key === 'applicability') {
            allKeys.add('applicability_type');
            allKeys.add('applicability_description');
            allKeys.add('applicability_weight');
          } else if (key === 'consequences') {
            allKeys.add('consequences_immediate');
            allKeys.add('consequences_type');
            allKeys.add('consequences_impact');
          } else {
            allKeys.add(key);
          }
        } else {
          allKeys.add(key);
        }
      });
    });
    
    const headers = Array.from(allKeys);
    let csv = headers.map(h => `"${h}"`).join(',') + '\n';
    
    requirements.forEach(req => {
      const row = headers.map(header => {
        let value = '';
        
        // Handle nested objects safely
        if (header.startsWith('maturityLevel_')) {
          const field = header.replace('maturityLevel_', '');
          value = req.maturityLevel?.[field] || '';
        } else if (header.startsWith('applicability_')) {
          const field = header.replace('applicability_', '');
          value = req.applicability?.[field] || '';
        } else if (header.startsWith('consequences_')) {
          const field = header.replace('consequences_', '');
          value = req.consequences?.[field] || '';
        } else {
          value = req[header] || '';
        }
        
        // Escape quotes and wrap in quotes
        return `"${String(value).replace(/"/g, '""')}"`;
      });
      csv += row.join(',') + '\n';
    });
    
    return csv;
  } catch (error) {
    throw new Error(`CSV generation failed: ${error.message}`);
  }
};

export const downloadCSV = (csvContent, filename) => {
  try {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the URL object
    URL.revokeObjectURL(url);
  } catch (error) {
    throw new Error(`CSV download failed: ${error.message}`);
  }
};