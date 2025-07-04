// src/components/views/OverviewView.jsx
import React from 'react';
import { 
  Building2, AlertTriangle, Shield, Network, Lock, X, Edit,
  CheckCircle, Activity, Lightbulb, Download, BarChart3, Target,
  Settings, Plus, Star, TrendingUp, Users, Calendar
} from 'lucide-react';
import StatCard from '../ui/StatCard';

/**
 * Overview View Component
 * 
 * The main dashboard overview that provides a comprehensive summary of the
 * cyber trust portal, including company profile, key metrics, quick actions,
 * and recent activity. This serves as the landing page for users.
 * 
 * Features:
 * - Company profile summary with edit access
 * - Profile setup prompts for new users
 * - Regulatory compliance context
 * - Key metrics and statistics grid
 * - Quick action buttons for common tasks
 * - Recent activity feed
 * - Responsive design
 */
const OverviewView = ({
  state,
  dispatch,
  currentTheme,
  companyProfile,
  requirements = [],
  capabilities = [],
  filteredRequirements = [],
  handleExportCSV,
  handleFilterChange
}) => {

  // Calculate key statistics
  const getOverviewStats = () => {
    const completed = requirements.filter(r => r.status === 'Completed').length;
    const inProgress = requirements.filter(r => r.status === 'In Progress').length;
    const notStarted = requirements.filter(r => r.status === 'Not Started').length;
    const completionRate = requirements.length > 0 ? Math.round((completed / requirements.length) * 100) : 0;
    
    const avgBusinessValue = requirements.length > 0 
      ? (requirements.reduce((sum, r) => sum + (r.businessValueScore || 0), 0) / requirements.length).toFixed(1)
      : 0;
    
    const highValueItems = requirements.filter(r => (r.businessValueScore || 0) >= 4).length;
    const essentialItems = requirements.filter(r => r.applicability?.type === 'Essential').length;
    const unassigned = requirements.filter(r => !r.capabilityId).length;
    
    const totalInvestment = (requirements.reduce((sum, r) => sum + (r.costEstimate || 0), 0) / 1000000).toFixed(1);

    return {
      total: requirements.length,
      completed,
      inProgress, 
      notStarted,
      completionRate,
      avgBusinessValue,
      highValueItems,
      essentialItems,
      unassigned,
      totalInvestment,
      capabilities: capabilities.length
    };
  };

  const stats = getOverviewStats();

  // Handle navigation with filter setting
  const handleNavigateWithFilter = (viewMode, filterField = null, filterValue = null) => {
    if (filterField && filterValue !== null) {
      handleFilterChange(filterField, filterValue);
    }
    dispatch({ type: 'SET_VIEW_MODE', viewMode });
  };

  // Company profile summary component
  const CompanyProfileSummary = () => {
    if (!companyProfile?.profileCompleted) return null;

    const getCompanySize = () => {
      if (companyProfile.employeeCount <= 50) return 'Small';
      if (companyProfile.employeeCount <= 500) return 'Medium';
      return 'Large';
    };

    const getRevenueLabel = (revenue) => {
      if (revenue <= 1000000) return 'Under £1M';
      if (revenue <= 10000000) return '£1M - £10M';
      if (revenue <= 100000000) return '£10M - £100M';
      return 'Over £100M';
    };

    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Building2 className="h-6 w-6 mr-3 text-blue-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {companyProfile.companyName}
              </h3>
              <p className="text-sm text-gray-600">
                {companyProfile.industry} • {getCompanySize()} Business
              </p>
            </div>
          </div>
          <button
            onClick={() => dispatch({ type: 'SET_VIEW_MODE', viewMode: 'company-profile' })}
            className="text-blue-600 hover:text-blue-800 transition-colors p-2 rounded-lg hover:bg-blue-50"
            title="Edit Company Profile"
          >
            <Edit className="h-4 w-4" />
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Revenue:</span>
            <div className="font-medium">{getRevenueLabel(companyProfile.annualRevenue)}</div>
          </div>
          <div>
            <span className="text-gray-500">Employees:</span>
            <div className="font-medium">{companyProfile.employeeCount}</div>
          </div>
          <div>
            <span className="text-gray-500">Regions:</span>
            <div className="font-medium">{companyProfile.operatingRegions?.length || 0} regions</div>
          </div>
          <div>
            <span className="text-gray-500">Frameworks:</span>
            <div className="font-medium">{companyProfile.complianceRequirements?.length || 0} selected</div>
          </div>
        </div>
      </div>
    );
  };

  // Profile setup prompt component
  const ProfileSetupPrompt = () => {
    if (companyProfile?.profileCompleted && !state.ui.showProfileSetup) return null;

    return (
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <AlertTriangle className="h-6 w-6 mr-3" />
            <div>
              <h3 className="text-lg font-semibold">Complete Your Company Profile</h3>
              <p className="text-blue-100 mt-1">
                Set up your company profile to get tailored threat assessments and compliance recommendations.
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => dispatch({ type: 'SET_COMPANY_PROFILE_SETUP', show: false })}
              className="text-blue-100 hover:text-white transition-colors p-2 rounded-lg hover:bg-white hover:bg-opacity-20"
            >
              <X className="h-5 w-5" />
            </button>
            <button
              onClick={() => {
                dispatch({ type: 'SET_VIEW_MODE', viewMode: 'company-profile' });
                dispatch({ type: 'SET_COMPANY_PROFILE_SETUP', show: false });
              }}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-colors"
            >
              Get Started
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Regulatory context banner
  const RegulatoryBanner = () => (
    <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-xl p-6 text-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-16 -mt-16" />
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Shield className="h-6 w-6 mr-3" />
            <h3 className="text-xl font-semibold">Regulatory Compliance Framework</h3>
          </div>
          <div className="text-sm bg-white bg-opacity-20 px-3 py-1 rounded-full">
            Active Compliance
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-6 text-sm">
          <div className="flex items-center space-x-3">
            <div className="bg-white bg-opacity-20 p-2 rounded-lg">
              <Network className="h-4 w-4" />
            </div>
            <div>
              <div className="font-semibold">Ofgem Framework</div>
              <div className="text-blue-100 text-xs">Clean power transition by 2030</div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="bg-white bg-opacity-20 p-2 rounded-lg">
              <Lock className="h-4 w-4" />
            </div>
            <div>
              <div className="font-semibold">NCSC CAF Guidance</div>
              <div className="text-blue-100 text-xs">OES compliance mapping</div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="bg-white bg-opacity-20 p-2 rounded-lg">
              <Building2 className="h-4 w-4" />
            </div>
            <div>
              <div className="font-semibold">Business Justification</div>
              <div className="text-blue-100 text-xs">Value & impact analysis</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Statistics grid
  const StatisticsGrid = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
      <StatCard
        title="Total Requirements"
        value={stats.total}
        icon={TrendingUp}
        color="#3b82f6"
        subtitle="+12% this month"
        onClick={() => handleNavigateWithFilter('requirements')}
      />
      
      <StatCard
        title="Completed"
        value={stats.completed}
        icon={CheckCircle}
        color="#10b981"
        subtitle={`${stats.completionRate}% done`}
        onClick={() => handleNavigateWithFilter('requirements', 'status', 'Completed')}
      />
      
      <StatCard
        title="In Progress"
        value={stats.inProgress}
        icon={Activity}
        color="#f59e0b"
        subtitle="Active work"
        onClick={() => handleNavigateWithFilter('requirements', 'status', 'In Progress')}
      />
      
      <StatCard
        title="Not Started"
        value={stats.notStarted}
        icon={AlertTriangle}
        color="#ef4444"
        subtitle="Needs attention"
        onClick={() => handleNavigateWithFilter('requirements', 'status', 'Not Started')}
      />

      <StatCard
        title="Active Risks"
        value={15}
        icon={AlertTriangle}
        color="#ef4444"
        subtitle="3 critical"
        onClick={() => dispatch({ type: 'SET_VIEW_MODE', viewMode: 'risk-management' })}
      />
      
      <StatCard
        title="Capabilities"
        value={stats.capabilities}
        icon={Network}
        color="#6366f1"
        subtitle="Active programs"
        onClick={() => dispatch({ type: 'SET_VIEW_MODE', viewMode: 'capabilities' })}
      />

      <StatCard
        title="Avg Business Value"
        value={stats.avgBusinessValue}
        icon={Star}
        color="#fbbf24"
        subtitle="Out of 5.0"
        onClick={() => dispatch({ type: 'SET_VIEW_MODE', viewMode: 'justification' })}
      />

      <StatCard
        title="High Value Items"
        value={stats.highValueItems}
        icon={Star}
        color="#10b981"
        subtitle="4.0+ rating"
        onClick={() => dispatch({ type: 'SET_VIEW_MODE', viewMode: 'justification' })}
      />

      <StatCard
        title="Essential Items"
        value={stats.essentialItems}
        icon={Shield}
        color="#14b8a6"
        subtitle="Must implement"
        onClick={() => handleNavigateWithFilter('requirements', 'applicability', 'Essential')}
      />

      <StatCard
        title="Unassigned"
        value={stats.unassigned}
        icon={Users}
        color="#f43f5e"
        subtitle="Need capability"
        onClick={() => handleNavigateWithFilter('requirements', 'capability', '')}
      />

      <StatCard
        title="Total Investment"
        value={`£${stats.totalInvestment}M`}
        icon={BarChart3}
        color="#f97316"
        subtitle="Estimated cost"
        onClick={() => dispatch({ type: 'SET_VIEW_MODE', viewMode: 'analytics' })}
      />
    </div>
  );

  // Quick actions section
  const QuickActions = () => (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <Lightbulb className="h-5 w-5 mr-2 text-yellow-500" />
        Quick Actions
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <QuickActionButton
          icon={Network}
          label="View Capabilities"
          color="blue"
          onClick={() => dispatch({ type: 'SET_VIEW_MODE', viewMode: 'capabilities' })}
        />
        <QuickActionButton
          icon={Shield}
          label="Threat Intel"
          color="red"
          onClick={() => dispatch({ type: 'SET_VIEW_MODE', viewMode: 'threat-intelligence' })}
        />
        <QuickActionButton
          icon={Target}
          label="MITRE Navigator"
          color="indigo"
          onClick={() => dispatch({ type: 'SET_VIEW_MODE', viewMode: 'mitre-navigator' })}
        />
        <QuickActionButton
          icon={AlertTriangle}
          label="Risk Management"
          color="red"
          onClick={() => dispatch({ type: 'SET_VIEW_MODE', viewMode: 'risk-management' })}
        />
        <QuickActionButton
          icon={Download}
          label="Export Data"
          color="orange"
          onClick={handleExportCSV}
        />
        <QuickActionButton
          icon={BarChart3}
          label="View Analytics"
          color="purple"
          onClick={() => dispatch({ type: 'SET_VIEW_MODE', viewMode: 'analytics' })}
        />
        <QuickActionButton
          icon={Settings}
          label="Threat Settings"
          color="indigo"
          onClick={() => dispatch({ type: 'TOGGLE_THREAT_SETTINGS_MODAL' })}
        />
        <QuickActionButton
          icon={Activity}
          label="System Diagnostics"
          color="gray"
          onClick={() => dispatch({ type: 'SET_VIEW_MODE', viewMode: 'diagnostics' })}
        />
      </div>
    </div>
  );

  // Quick action button component
  const QuickActionButton = ({ icon: Icon, label, color, onClick }) => {
    const colorMap = {
      blue: 'bg-blue-50 hover:bg-blue-100 text-blue-700',
      red: 'bg-red-50 hover:bg-red-100 text-red-700',
      indigo: 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700',
      orange: 'bg-orange-50 hover:bg-orange-100 text-orange-700',
      purple: 'bg-purple-50 hover:bg-purple-100 text-purple-700',
      gray: 'bg-gray-50 hover:bg-gray-100 text-gray-700'
    };

    return (
      <button 
        onClick={onClick}
        className={`flex flex-col items-center p-4 rounded-lg transition-colors group ${colorMap[color]}`}
      >
        <Icon className="h-6 w-6 mb-2 group-hover:scale-110 transition-transform" />
        <span className="text-xs font-medium text-center">{label}</span>
      </button>
    );
  };

  // Activity feed
  const ActivityFeed = () => (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <Activity className="h-5 w-5 mr-2 text-green-600" />
        Recent Activity
      </h3>
      <div className="space-y-4">
        <ActivityItem
          icon={CheckCircle}
          color="green"
          title="Demo data loaded"
          description={`${requirements.length} requirements generated successfully • Just now`}
        />
        <ActivityItem
          icon={Shield}
          color="blue"
          title="MITRE ATT&CK Navigator available"
          description="Advanced threat technique visualization and analysis • Just now"
        />
        <ActivityItem
          icon={Settings}
          color="purple"
          title="System settings and diagnostics added"
          description="Enhanced system management capabilities • Just now"
        />
        <ActivityItem
          icon={AlertTriangle}
          color="red"
          title="Risk Management system available"
          description="Track and mitigate operational and security risks • Just now"
        />
      </div>
    </div>
  );

  // Activity item component
  const ActivityItem = ({ icon: Icon, color, title, description }) => {
    const colorMap = {
      green: 'bg-green-50 border-green-200 text-green-600 bg-green-100',
      blue: 'bg-blue-50 border-blue-200 text-blue-600 bg-blue-100',
      purple: 'bg-purple-50 border-purple-200 text-purple-600 bg-purple-100',
      red: 'bg-red-50 border-red-200 text-red-600 bg-red-100'
    };

    const [bgClass, , iconColor, iconBg] = colorMap[color].split(' ');

    return (
      <div className={`flex items-start space-x-3 p-3 rounded-lg ${bgClass}`}>
        <div className={`${iconBg} p-1 rounded-full`}>
          <Icon className={`h-4 w-4 ${iconColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900">{title}</p>
          <p className="text-xs text-gray-600 mt-1">{description}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <CompanyProfileSummary />
      <ProfileSetupPrompt />
      <RegulatoryBanner />
      <StatisticsGrid />
      <QuickActions />
      <ActivityFeed />
    </div>
  );
};

export default OverviewView;