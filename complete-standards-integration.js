// =============================================
// FILE 1: src/constants/dashboardConstants.js
// =============================================

export const VIEW_MODES = {
  OVERVIEW: 'overview',
  COMPANY_PROFILE: 'company-profile',
  CAPABILITIES: 'capabilities',
  REQUIREMENTS: 'requirements',
  THREAT_INTELLIGENCE: 'threat-intelligence',
  MITRE_NAVIGATOR: 'mitre-navigator',
  RISK_MANAGEMENT: 'risk-management',
  STANDARDS: 'standards', // ✅ CRITICAL: This was missing
  PCD_BREAKDOWN: 'pcd',
  MATURITY_ANALYSIS: 'maturity',
  BUSINESS_VALUE: 'justification',
  ANALYTICS: 'analytics',
  DIAGNOSTICS: 'diagnostics',
  SETTINGS: 'settings'
};

export const VIEW_LABELS = {
  [VIEW_MODES.OVERVIEW]: 'Overview',
  [VIEW_MODES.COMPANY_PROFILE]: 'Company Profile',
  [VIEW_MODES.CAPABILITIES]: 'Capabilities',
  [VIEW_MODES.REQUIREMENTS]: 'Requirements',
  [VIEW_MODES.THREAT_INTELLIGENCE]: 'Threat Intelligence',
  [VIEW_MODES.MITRE_NAVIGATOR]: 'MITRE ATT&CK Navigator',
  [VIEW_MODES.RISK_MANAGEMENT]: 'Risk Management',
  [VIEW_MODES.STANDARDS]: 'Standards & Frameworks', // ✅ CRITICAL: This was missing
  [VIEW_MODES.PCD_BREAKDOWN]: 'PCD Breakdown',
  [VIEW_MODES.MATURITY_ANALYSIS]: 'Maturity Analysis',
  [VIEW_MODES.BUSINESS_VALUE]: 'Business Value',
  [VIEW_MODES.ANALYTICS]: 'Analytics',
  [VIEW_MODES.DIAGNOSTICS]: 'System Diagnostics',
  [VIEW_MODES.SETTINGS]: 'System Settings'
};

// =============================================
// FILE 2: src/components/dashboard/DashboardSidebar.jsx
// =============================================

import React from 'react';
import { 
  TrendingUp, Building2, Network, FileText, Shield, Target, AlertTriangle,
  Gauge, Star, BarChart3, Activity, Settings, Upload, Download, Trash2,
  ChevronLeft, ChevronRight, X, Menu, Award // ✅ CRITICAL: Added Award import
} from 'lucide-react';
import { dashboardActions } from '../../store/dashboardActions';

const DashboardSidebar = ({ state, dispatch, currentTheme, companyProfile, onExportCSV, requirementsCount = 0, isLoading = false }) => {
  // ✅ CRITICAL: Updated navigation items with Standards
  const navigationItems = [
    { id: 'overview', name: 'Overview', icon: TrendingUp, description: 'Dashboard summary' },
    { id: 'company-profile', name: 'Company Profile', icon: Building2, description: 'Company information' },
    { id: 'capabilities', name: 'Capabilities', icon: Network, description: 'Security capabilities' },
    { id: 'requirements', name: 'Requirements', icon: FileText, description: 'Security requirements' },
    { id: 'threat-intelligence', name: 'Threat Intelligence', icon: Shield, description: 'Threat monitoring' },
    { id: 'mitre-navigator', name: 'MITRE ATT&CK Navigator', icon: Target, description: 'Attack techniques' },
    { id: 'risk-management', name: 'Risks', icon: AlertTriangle, description: 'Risk management' },
    { id: 'standards', name: 'Standards & Frameworks', icon: Award, description: 'Compliance frameworks' }, // ✅ CRITICAL: This line was missing
    { id: 'pcd', name: 'PCD Breakdown', icon: Building2, description: 'PCD analysis' },
    { id: 'maturity', name: 'Maturity Analysis', icon: Gauge, description: 'Maturity assessment' },
    { id: 'justification', name: 'Business Value', icon: Star, description: 'Value analysis' },
    { id: 'analytics', name: 'Analytics', icon: BarChart3, description: 'Data analytics' },
    { id: 'diagnostics', name: 'System Diagnostics', icon: Activity, description: 'System health' },
    { id: 'settings', name: 'System Settings', icon: Settings, description: 'Configuration' }
  ];

  // ... rest of sidebar component stays the same
};

// =============================================
// FILE 3: src/components/dashboard/DashboardContent.jsx
// =============================================

import React, { lazy, Suspense } from 'react';
import LoadingSpinner from '../ui/LoadingSpinner';
import { VIEW_MODES } from '../../constants';

// Lazy load views
const OverviewView = lazy(() => import('../views/OverviewView'));
const CompanyProfileView = lazy(() => import('../views/CompanyProfileView'));
const CapabilitiesView = lazy(() => import('../views/CapabilitiesView'));
const RequirementsView = lazy(() => import('../views/RequirementsView'));
const ThreatIntelligenceView = lazy(() => import('../views/ThreatIntelligenceView'));
const MitreNavigatorView = lazy(() => import('../views/MitreNavigatorView'));
const RiskManagementView = lazy(() => import('../views/RiskManagementView'));
const StandardsView = lazy(() => import('../views/StandardsView')); // ✅ CRITICAL: This import was missing
const PCDBreakdownView = lazy(() => import('../views/PCDBreakdownView'));
const MaturityAnalysisView = lazy(() => import('../views/MaturityAnalysisView'));
const BusinessValueView = lazy(() => import('../views/BusinessValueView'));
const AnalyticsView = lazy(() => import('../views/AnalyticsView'));
const DiagnosticsView = lazy(() => import('../views/DiagnosticsView'));
const SystemSettingsView = lazy(() => import('../views/SystemSettingsView'));

const DashboardContent = ({ state, dispatch, currentTheme, companyProfile, data, handlers = {} }) => {
  const commonViewProps = {
    state,
    dispatch,
    currentTheme,
    companyProfile,
    ...data,
    ...handlers
  };

  const renderView = () => {
    const { viewMode } = state.ui;

    switch (viewMode) {
      case VIEW_MODES.OVERVIEW:
      case 'overview':
        return <OverviewView {...commonViewProps} />;
        
      case VIEW_MODES.COMPANY_PROFILE:
      case 'company-profile':
        return <CompanyProfileView {...commonViewProps} />;
        
      case VIEW_MODES.CAPABILITIES:
      case 'capabilities':
        return <CapabilitiesView {...commonViewProps} />;
        
      case VIEW_MODES.REQUIREMENTS:
      case 'requirements':
        return <RequirementsView {...commonViewProps} />;
        
      case VIEW_MODES.THREAT_INTELLIGENCE:
      case 'threat-intelligence':
        return <ThreatIntelligenceView {...commonViewProps} />;
        
      case VIEW_MODES.MITRE_NAVIGATOR:
      case 'mitre-navigator':
        return <MitreNavigatorView {...commonViewProps} />;
        
      case VIEW_MODES.RISK_MANAGEMENT:
      case 'risk-management':
        return <RiskManagementView {...commonViewProps} />;

      case VIEW_MODES.STANDARDS: // ✅ CRITICAL: This case was completely missing
      case 'standards':
        return <StandardsView {...commonViewProps} />;
        
      case VIEW_MODES.PCD_BREAKDOWN:
      case 'pcd':
        return <PCDBreakdownView {...commonViewProps} />;
        
      case VIEW_MODES.MATURITY_ANALYSIS:
      case 'maturity':
        return <MaturityAnalysisView {...commonViewProps} />;
        
      case VIEW_MODES.BUSINESS_VALUE:
      case 'justification':
        return <BusinessValueView {...commonViewProps} />;
        
      case VIEW_MODES.ANALYTICS:
      case 'analytics':
        return <AnalyticsView {...commonViewProps} />;
        
      case VIEW_MODES.DIAGNOSTICS:
      case 'diagnostics':
        return <DiagnosticsView {...commonViewProps} />;
        
      case VIEW_MODES.SETTINGS:
      case 'settings':
        return <SystemSettingsView {...commonViewProps} />;
        
      default:
        console.warn(`Unknown view mode: ${viewMode}. Falling back to overview.`);
        return <OverviewView {...commonViewProps} />;
    }
  };

  return (
    <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
      <Suspense fallback={<div className="flex items-center justify-center min-h-96"><LoadingSpinner size="md" /></div>}>
        <div className="w-full max-w-none">
          {renderView()}
        </div>
      </Suspense>
    </main>
  );
};

export default DashboardContent;

// =============================================
// FILE 4: src/components/views/StandardsView.jsx
// =============================================

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Award, FileCheck, TrendingUp, Settings, Shield, CheckCircle } from 'lucide-react';

const StandardsView = ({ state, dispatch }) => {
  const [selectedFramework, setSelectedFramework] = useState('nist-csf-2.0');

  const frameworks = [
    {
      id: 'nist-csf-2.0',
      name: 'NIST CSF 2.0',
      description: 'Comprehensive cybersecurity framework with 6 functions and 106 subcategories',
      status: 'available',
      progress: state.standards?.frameworks?.nistCsf?.completionRate || 0,
      icon: Shield,
      color: 'blue'
    },
    {
      id: 'iso-27001',
      name: 'ISO 27001:2022',
      description: 'International standard for information security management systems',
      status: 'coming-soon',
      progress: 0,
      icon: Award,
      color: 'green'
    }
  ];

  const renderFrameworkCard = (framework) => (
    <Card key={framework.id} className={`cursor-pointer transition-all duration-200 ${selectedFramework === framework.id ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:shadow-md'}`}>
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
            <span className="font-medium">{framework.progress.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div className={`bg-${framework.color}-600 h-2 rounded-full transition-all duration-300`} style={{ width: `${framework.progress}%` }}></div>
          </div>
        </CardContent>
      )}
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Standards & Frameworks</h1>
        <p className="text-gray-600 mt-2">Assess and manage compliance across multiple cybersecurity and governance frameworks</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {frameworks.map(renderFrameworkCard)}
      </div>

      <Card>
        <CardContent className="p-8 text-center">
          <Award className="w-12 h-12 text-blue-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">NIST CSF 2.0 Assessment</h3>
          <p className="text-gray-600 mb-4">Complete cybersecurity framework assessment with hierarchical scoring</p>
          <Button onClick={() => console.log('Navigate to full assessment')}>
            Start Assessment
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default StandardsView;

// =============================================
// FILE 5: src/components/views/index.js
// =============================================

// Add to existing exports
export { default as StandardsView } from './StandardsView'; // ✅ CRITICAL: This export was missing