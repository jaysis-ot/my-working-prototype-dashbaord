# NIST CSF 2.0 Integration Guide
## Adding Standards Section to Dashboard

This guide provides step-by-step instructions for integrating the NIST CSF 2.0 assessment tool into your existing dashboard as a new "Standards" section.

## 🎯 Overview

We'll be adding:
- **New Standards section** in the main navigation
- **NIST CSF 2.0 view** as the first framework
- **Standards management** with multi-framework support
- **Integration with existing state management** and navigation

---

## 📁 Files to Create/Modify

### **1. Constants Updates**

#### **File: `src/constants/dashboardConstants.js`**
**Action:** Add new view mode and navigation item

```javascript
// Add to VIEW_MODES object (around line 20)
export const VIEW_MODES = {
  // ... existing modes
  ANALYTICS: 'analytics',
  DIAGNOSTICS: 'diagnostics',
  STANDARDS: 'standards',  // ✅ ADD THIS
  SETTINGS: 'settings'
};

// Add to VIEW_LABELS object (around line 35)
export const VIEW_LABELS = {
  // ... existing labels
  [VIEW_MODES.ANALYTICS]: 'Analytics',
  [VIEW_MODES.DIAGNOSTICS]: 'System Diagnostics',
  [VIEW_MODES.STANDARDS]: 'Standards & Frameworks',  // ✅ ADD THIS
  [VIEW_MODES.SETTINGS]: 'Settings'
};
```

#### **File: `src/constants/index.js`**
**Action:** Export new standards constants

```javascript
// Add after existing exports (around line 50)
export const STANDARDS_FRAMEWORKS = {
  NIST_CSF: 'nist-csf-2.0',
  ISO_27001: 'iso-27001',
  SOC_2: 'soc-2',
  PCI_DSS: 'pci-dss'
};

export const FRAMEWORK_LABELS = {
  [STANDARDS_FRAMEWORKS.NIST_CSF]: 'NIST CSF 2.0',
  [STANDARDS_FRAMEWORKS.ISO_27001]: 'ISO 27001',
  [STANDARDS_FRAMEWORKS.SOC_2]: 'SOC 2',
  [STANDARDS_FRAMEWORKS.PCI_DSS]: 'PCI DSS'
};
```

---

### **2. Navigation Updates**

#### **File: `src/components/dashboard/DashboardSidebar.jsx`**
**Action:** Add Standards to navigation items

```javascript
// Update navigationItems array (around line 25)
const navigationItems = [
  { id: 'overview', name: 'Overview', icon: TrendingUp, description: 'Dashboard summary' },
  { id: 'company-profile', name: 'Company Profile', icon: Building2, description: 'Company information' },
  { id: 'capabilities', name: 'Capabilities', icon: Network, description: 'Security capabilities' },
  { id: 'requirements', name: 'Requirements', icon: FileText, description: 'Security requirements' },
  { id: 'threat-intelligence', name: 'Threat Intelligence', icon: Shield, description: 'Threat monitoring' },
  { id: 'mitre-navigator', name: 'MITRE ATT&CK Navigator', icon: Target, description: 'Attack techniques' },
  { id: 'risk-management', name: 'Risks', icon: AlertTriangle, description: 'Risk management' },
  { id: 'standards', name: 'Standards & Frameworks', icon: Award, description: 'Compliance frameworks' }, // ✅ ADD THIS LINE
  { id: 'pcd', name: 'PCD Breakdown', icon: Building2, description: 'PCD analysis' },
  { id: 'maturity', name: 'Maturity Analysis', icon: Gauge, description: 'Maturity assessment' },
  { id: 'justification', name: 'Business Value', icon: Star, description: 'Value analysis' },
  { id: 'analytics', name: 'Analytics', icon: BarChart3, description: 'Data analytics' },
  { id: 'diagnostics', name: 'System Diagnostics', icon: Activity, description: 'System health' },
  { id: 'settings', name: 'Settings', icon: Settings, description: 'Application settings' }
];

// Add Award import at the top
import { 
  TrendingUp, Building2, Network, FileText, Shield, Target, AlertTriangle,
  Gauge, Star, BarChart3, Activity, Settings, Upload, Download, Trash2,
  ChevronLeft, ChevronRight, X, Menu, Award // ✅ ADD Award here
} from 'lucide-react';
```

---

### **3. Create Standards Components**

#### **File: `src/components/views/StandardsView.jsx`**
**Action:** Create new file

```javascript
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Award, FileCheck, TrendingUp, Settings } from 'lucide-react';
import { STANDARDS_FRAMEWORKS, FRAMEWORK_LABELS } from '../../constants';
import NISTCSFAssessment from '../standards/NISTCSFAssessment';

/**
 * Standards & Frameworks View
 * 
 * Main hub for compliance framework assessments and management.
 * Provides access to multiple frameworks including NIST CSF 2.0,
 * ISO 27001, SOC 2, and other standards.
 */
const StandardsView = ({ state, dispatch }) => {
  const [selectedFramework, setSelectedFramework] = useState(STANDARDS_FRAMEWORKS.NIST_CSF);

  // Framework data structure
  const frameworks = [
    {
      id: STANDARDS_FRAMEWORKS.NIST_CSF,
      name: FRAMEWORK_LABELS[STANDARDS_FRAMEWORKS.NIST_CSF],
      description: 'Comprehensive cybersecurity framework with 6 functions and 106 subcategories',
      status: 'available',
      progress: 0,
      icon: Award,
      color: 'blue'
    },
    {
      id: STANDARDS_FRAMEWORKS.ISO_27001,
      name: FRAMEWORK_LABELS[STANDARDS_FRAMEWORKS.ISO_27001],
      description: 'International standard for information security management systems',
      status: 'coming-soon',
      progress: 0,
      icon: FileCheck,
      color: 'green'
    },
    {
      id: STANDARDS_FRAMEWORKS.SOC_2,
      name: FRAMEWORK_LABELS[STANDARDS_FRAMEWORKS.SOC_2],
      description: 'Service organization controls for security and availability',
      status: 'coming-soon',
      progress: 0,
      icon: TrendingUp,
      color: 'purple'
    }
  ];

  const renderFrameworkCard = (framework) => (
    <Card 
      key={framework.id}
      className={`cursor-pointer transition-all duration-200 ${
        selectedFramework === framework.id 
          ? 'ring-2 ring-blue-500 shadow-lg' 
          : 'hover:shadow-md'
      }`}
      onClick={() => framework.status === 'available' && setSelectedFramework(framework.id)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-${framework.color}-100`}>
              <framework.icon className={`w-5 h-5 text-${framework.color}-600`} />
            </div>
            <div>
              <CardTitle className="text-lg">{framework.name}</CardTitle>
              <p className="text-sm text-gray-600 mt-1">{framework.description}</p>
            </div>
          </div>
          <Badge variant={framework.status === 'available' ? 'default' : 'secondary'}>
            {framework.status === 'available' ? 'Available' : 'Coming Soon'}
          </Badge>
        </div>
      </CardHeader>
      {framework.status === 'available' && (
        <CardContent className="pt-0">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Assessment Progress</span>
            <span className="font-medium">{framework.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div 
              className={`bg-${framework.color}-600 h-2 rounded-full transition-all duration-300`}
              style={{ width: `${framework.progress}%` }}
            ></div>
          </div>
        </CardContent>
      )}
    </Card>
  );

  const renderFrameworkContent = () => {
    switch (selectedFramework) {
      case STANDARDS_FRAMEWORKS.NIST_CSF:
        return <NISTCSFAssessment state={state} dispatch={dispatch} />;
      default:
        return (
          <Card>
            <CardContent className="p-8 text-center">
              <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Framework Coming Soon</h3>
              <p className="text-gray-600">
                This framework assessment will be available in a future update.
              </p>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Standards & Frameworks</h1>
        <p className="text-gray-600 mt-2">
          Assess and manage compliance across multiple cybersecurity and governance frameworks
        </p>
      </div>

      {/* Framework Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {frameworks.map(renderFrameworkCard)}
      </div>

      {/* Framework Content */}
      <div className="mt-8">
        {renderFrameworkContent()}
      </div>
    </div>
  );
};

export default StandardsView;
```

#### **File: `src/components/standards/NISTCSFAssessment.jsx`**
**Action:** Create new file (adapted from our assessment tool)

```javascript
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronRight, ChevronDown, Download, Upload, BarChart3, Target, Shield } from 'lucide-react';
import { NIST_CSF_STRUCTURE, SCORING_DIMENSIONS } from './nistCsfData';

/**
 * NIST CSF 2.0 Assessment Component
 * 
 * Integrated version of the NIST CSF assessment tool for the dashboard.
 * Maintains state within the broader dashboard context.
 */
const NISTCSFAssessment = ({ state, dispatch }) => {
  // Local state for NIST CSF assessment
  const [assessmentData, setAssessmentData] = useState(
    state.standards?.nistCsf?.assessmentData || {}
  );
  const [expandedItems, setExpandedItems] = useState({});
  const [selectedFunction, setSelectedFunction] = useState('GV');

  // ... [Include all the calculation functions from the original tool]
  
  // Save assessment data to dashboard state when it changes
  React.useEffect(() => {
    dispatch({
      type: 'UPDATE_STANDARDS_DATA',
      payload: {
        framework: 'nistCsf',
        data: { assessmentData }
      }
    });
  }, [assessmentData, dispatch]);

  // ... [Include all the component logic from the original tool]

  return (
    <div className="space-y-6">
      {/* NIST CSF Assessment Content */}
      {/* Copy all content from the original NISTCSFAssessmentTool component */}
      {/* but remove the outer container and title since it's now within StandardsView */}
    </div>
  );
};

export default NISTCSFAssessment;
```

#### **File: `src/components/standards/nistCsfData.js`**
**Action:** Create new file

```javascript
// NIST CSF 2.0 Data Structure
// Copy the complete NIST_CSF_STRUCTURE and SCORING_DIMENSIONS 
// from the original assessment tool

export const NIST_CSF_STRUCTURE = {
  // ... [Copy complete structure from original tool]
};

export const SCORING_DIMENSIONS = {
  // ... [Copy complete scoring dimensions from original tool]
};
```

#### **File: `src/components/standards/index.js`**
**Action:** Create new file

```javascript
// Barrel export for standards components
export { default as NISTCSFAssessment } from './NISTCSFAssessment';
export { NIST_CSF_STRUCTURE, SCORING_DIMENSIONS } from './nistCsfData';
```

---

### **4. Update Main Dashboard Components**

#### **File: `src/components/dashboard/DashboardContent.jsx`**
**Action:** Add Standards view routing

```javascript
// Add import for StandardsView
import StandardsView from '../views/StandardsView';

// Add to the view routing logic (around line 40)
const renderView = () => {
  switch (state.ui.viewMode) {
    case VIEW_MODES.OVERVIEW:
      return <OverviewView state={state} dispatch={dispatch} />;
    // ... other cases
    case VIEW_MODES.STANDARDS:  // ✅ ADD THIS CASE
      return <StandardsView state={state} dispatch={dispatch} />;
    case VIEW_MODES.SETTINGS:
      return <SettingsView state={state} dispatch={dispatch} />;
    default:
      return <OverviewView state={state} dispatch={dispatch} />;
  }
};
```

#### **File: `src/components/views/index.js`**
**Action:** Add StandardsView export

```javascript
// Add to existing exports
export { default as StandardsView } from './StandardsView';
```

---

### **5. Update State Management**

#### **File: `src/store/dashboardReducer.js`**
**Action:** Add standards state handling

```javascript
// Add to initial state (around line 15)
const initialState = {
  // ... existing state
  standards: {
    selectedFramework: 'nist-csf-2.0',
    frameworks: {
      nistCsf: {
        assessmentData: {},
        lastUpdated: null,
        completionRate: 0
      }
    }
  }
};

// Add to reducer switch statement
const dashboardReducer = (state, action) => {
  switch (action.type) {
    // ... existing cases
    
    case 'UPDATE_STANDARDS_DATA':
      return {
        ...state,
        standards: {
          ...state.standards,
          frameworks: {
            ...state.standards.frameworks,
            [action.payload.framework]: {
              ...state.standards.frameworks[action.payload.framework],
              ...action.payload.data,
              lastUpdated: new Date().toISOString()
            }
          }
        }
      };
    
    case 'SET_SELECTED_FRAMEWORK':
      return {
        ...state,
        standards: {
          ...state.standards,
          selectedFramework: action.payload.framework
        }
      };
    
    // ... other cases
  }
};
```

#### **File: `src/store/dashboardActions.js`**
**Action:** Add standards-related actions

```javascript
// Add new action types
export const ACTION_TYPES = {
  // ... existing types
  UPDATE_STANDARDS_DATA: 'UPDATE_STANDARDS_DATA',
  SET_SELECTED_FRAMEWORK: 'SET_SELECTED_FRAMEWORK',
  EXPORT_STANDARDS_DATA: 'EXPORT_STANDARDS_DATA',
  IMPORT_STANDARDS_DATA: 'IMPORT_STANDARDS_DATA'
};

// Add new action creators
export const dashboardActions = {
  // ... existing actions
  
  updateStandardsData: (framework, data) => createAction(
    ACTION_TYPES.UPDATE_STANDARDS_DATA,
    { framework, data },
    { category: 'standards' }
  ),
  
  setSelectedFramework: (framework) => createAction(
    ACTION_TYPES.SET_SELECTED_FRAMEWORK,
    { framework },
    { category: 'standards' }
  )
};
```

---

### **6. Update Dashboard Header**

#### **File: `src/components/dashboard/DashboardHeader.jsx`**
**Action:** Add context for Standards view

```javascript
// Add to getDashboardTitle function (around line 35)
const getDashboardTitle = () => {
  switch (state.ui.viewMode) {
    // ... existing cases
    case VIEW_MODES.STANDARDS:
      return 'Standards & Frameworks';
    // ... other cases
  }
};

// Add to getContextualSubtitle function (around line 55)
const getContextualSubtitle = () => {
  switch (state.ui.viewMode) {
    // ... existing cases
    case VIEW_MODES.STANDARDS:
      const frameworkCount = Object.keys(state.standards?.frameworks || {}).length;
      return `${frameworkCount} framework${frameworkCount !== 1 ? 's' : ''} available`;
    // ... other cases
  }
};
```

---

## 🚀 Implementation Steps

### **Phase 1: Core Setup (30 minutes)**
1. Update constants files with new view modes and framework definitions
2. Add Standards navigation item to sidebar
3. Create basic StandardsView component structure

### **Phase 2: NIST CSF Integration (45 minutes)**
1. Create NISTCSFAssessment component by adapting the original tool
2. Create nistCsfData.js with complete framework structure
3. Set up component exports and imports

### **Phase 3: State Integration (30 minutes)**
1. Update reducer to handle standards state
2. Add standards-specific action creators
3. Connect components to dashboard state

### **Phase 4: UI Polish (15 minutes)**
1. Update header contextual information
2. Add proper routing in DashboardContent
3. Test navigation and state persistence

---

## 🧪 Testing Checklist

- [ ] **Navigation**: Standards appears in sidebar and is clickable
- [ ] **Framework Selection**: Can select different frameworks
- [ ] **NIST CSF**: Assessment tool loads and functions properly
- [ ] **State Persistence**: Assessment data persists when navigating away and back
- [ ] **Export/Import**: Data export and import functions work
- [ ] **Responsive**: Works on mobile and tablet viewports
- [ ] **Integration**: Doesn't break existing dashboard functionality

---

## 📈 Future Enhancements

Once basic integration is complete, consider these additions:

1. **Multi-Framework Comparison**: Side-by-side assessment comparison
2. **Progress Tracking**: Historical progress charts and trend analysis
3. **Automated Reporting**: Generate compliance reports in multiple formats
4. **Integration APIs**: Connect with external compliance tools
5. **Custom Frameworks**: Allow users to define their own assessment frameworks

---

## 🔧 Development Notes

- **File Naming**: Follow existing conventions (`kebab-case` for files, `PascalCase` for components)
- **State Management**: Use existing action/reducer pattern for consistency
- **Styling**: Leverage existing Tailwind classes and component patterns
- **Error Handling**: Implement proper error boundaries for the new components
- **Performance**: Consider lazy loading for large framework data structures

This integration maintains the architecture patterns established in your dashboard while adding comprehensive standards management capabilities. The NIST CSF 2.0 tool becomes the flagship framework assessment, with infrastructure in place for additional frameworks.