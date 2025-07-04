// TEMPLATE 1: Extracting a Utility Object (like csvUtils)
// =================================================

// Step 1: Create src/utils/csvUtils.js
// Copy this template and replace the function bodies with your code:

import { PROGRESS_STATUSES } from '../constants'; // if needed

export const parseCSV = (csvText) => {
  // Copy your existing parseCSV function body here
};

export const generateCSV = (requirements) => {
  // Copy your existing generateCSV function body here
};

export const downloadCSV = (csvContent, filename) => {
  // Copy your existing downloadCSV function body here
};

// Step 2: In your main file, replace:
// const csvUtils = { parseCSV, generateCSV, downloadCSV };
// With:
// import { parseCSV, generateCSV, downloadCSV } from './utils/csvUtils';

// Step 3: Update all references from csvUtils.parseCSV to parseCSV

// =================================================

// TEMPLATE 2: Extracting a Hook
// =================================================

// Step 1: Create src/hooks/useRequirementsData.js
// Copy this template:

import { useState, useEffect } from 'react';
import { generateMockData, transformCSVToRequirement } from '../utils/dataService';

export const useRequirementsData = () => {
  // Copy your entire existing useRequirementsData hook body here
  const [requirements, setRequirements] = useState([]);
  // ... rest of your hook code

  return { 
    requirements, 
    loading, 
    error, 
    updateRequirement, 
    deleteRequirement, 
    addRequirement, 
    purgeAllData, 
    importFromCSV,
    saveData 
  };
};

// Step 2: In your main file, replace the hook definition with:
// import { useRequirementsData } from './hooks/useRequirementsData';

// =================================================

// TEMPLATE 3: Extracting a Simple Component
// =================================================

// Step 1: Create src/components/ui/StatCard.jsx
// Copy this template:

import React, { memo, useState } from 'react';

const StatCard = memo(({ title, value, icon: Icon, color, subtitle, onClick }) => {
  // Copy your existing StatCard component body here
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="relative bg-white rounded-xl shadow-md p-6 border-l-4 cursor-pointer transition-all duration-300 transform"
      // ... rest of your JSX
    >
      {/* Your existing StatCard JSX here */}
    </div>
  );
});

StatCard.displayName = 'StatCard';

export default StatCard;

// Step 2: In your main file, add import:
// import StatCard from './components/ui/StatCard';

// Step 3: Remove the StatCard definition from your main file

// =================================================

// TEMPLATE 4: Extracting a Modal Component
// =================================================

// Step 1: Create src/components/modals/EditRequirementModal.jsx

import React, { useState, useCallback } from 'react';
import { X, Save, RefreshCw } from 'lucide-react';
import { PROGRESS_STATUSES } from '../../constants';

const EditRequirementModal = ({ requirement, onClose, onSave }) => {
  // Copy your existing modal state and functions here
  const [formData, setFormData] = useState(requirement);
  const [saving, setSaving] = useState(false);

  // Copy your existing event handlers here
  const handleChange = useCallback((field, value) => {
    // Your existing handleChange logic
  }, []);

  const handleSubmit = useCallback(async (e) => {
    // Your existing handleSubmit logic
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      {/* Copy your existing modal JSX here */}
    </div>
  );
};

export default EditRequirementModal;

// Step 2: In your main file, add import:
// import EditRequirementModal from './components/modals/EditRequirementModal';

// =================================================

// TEMPLATE 5: Extracting a View Component
// =================================================

// Step 1: Create src/components/views/OverviewView.jsx

import React from 'react';
import { TrendingUp, FileText, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import StatCard from '../ui/StatCard';

const OverviewView = ({ 
  requirements, 
  capabilities, 
  onViewModeChange, 
  onFilterChange 
}) => {
  return (
    <div className="space-y-6">
      {/* Copy your existing overview view JSX here */}
      
      {/* Example of how to use extracted components: */}
      <StatCard
        title="Total Requirements"
        value={requirements.length}
        icon={FileText}
        color="#3b82f6"
        onClick={() => onViewModeChange('requirements')}
      />
      
      {/* Rest of your overview content */}
    </div>
  );
};

export default OverviewView;

// Step 2: In your main file, replace the overview JSX section with:
// {state.ui.viewMode === 'overview' && (
//   <OverviewView 
//     requirements={requirements}
//     capabilities={capabilities}
//     onViewModeChange={(mode) => dispatch({ type: 'SET_VIEW_MODE', viewMode: mode })}
//     onFilterChange={handleFilterChange}
//   />
// )}

// =================================================

// CHEAT SHEET: Common Import/Export Patterns
// =================================================

// Pattern 1: Named exports (for utilities, hooks)
// File: utils/helpers.js
export const helper1 = () => {};
export const helper2 = () => {};

// Import:
import { helper1, helper2 } from './utils/helpers';

// Pattern 2: Default export (for components)
// File: components/Button.jsx
const Button = () => {};
export default Button;

// Import:
import Button from './components/Button';

// Pattern 3: Mixed (constants file)
// File: constants/index.js
export const CONSTANT_1 = 'value';
export default { CONSTANT_1, CONSTANT_2: 'value2' };

// Import options:
import * as CONSTANTS from './constants';        // CONSTANTS.CONSTANT_1
import { CONSTANT_1 } from './constants';        // CONSTANT_1
import constants from './constants';             // constants.CONSTANT_1

// =================================================

// COPY-PASTE CHECKLIST FOR EACH EXTRACTION:
// =================================================

/*
1. [ ] Create new file with proper naming
2. [ ] Copy template appropriate for what you're extracting
3. [ ] Copy your existing code into the template
4. [ ] Add necessary imports to the new file
5. [ ] Add import to main file
6. [ ] Remove old code from main file
7. [ ] Save all files
8. [ ] Test in browser (check console for errors)
9. [ ] If working: git add . && git commit -m "Extract [what you extracted]"
10. [ ] If broken: Fix or use git checkout to revert
*/