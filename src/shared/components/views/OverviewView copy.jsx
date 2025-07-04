// src/components/views/OverviewView.jsx
import React, { useMemo } from 'react';
import { 
  Shield, Network, Lock, Building2, CheckCircle, Upload, 
  Lightbulb, RefreshCw, Download, BarChart3, Activity,
  FileText, Clock, AlertTriangle, Target, Star, DollarSign,
  Gauge, GitBranch
} from 'lucide-react';
import { StatCard } from '../ui/StatCard';

const OverviewView = ({ 
  requirements,
  capabilities,
  onViewChange,
  onFilterAndView,
  onResetAndView,
  onExport,
  loading = false
}) => {
  // Memoized stats cards data
  const statsCards = useMemo(() => [
    {
      title: "Total Requirements",
      value: requirements.length,
      icon: FileText,
      color: "#3b82f6",
      subtitle: "+12% this month",
      trend: "up",
      onClick: () => onViewChange('requirements')
    },
    {
      title: "Completed",
      value: requirements.filter(r => r.status === 'Completed').length,
      icon: CheckCircle,
      color: "#10b981",
      subtitle: `${requirements.length ? ((requirements.filter(r => r.status === 'Completed').length / requirements.length) * 100).toFixed(0) : 0}% done`,
      trend: "up",
      onClick: () => onFilterAndView('status', 'Completed', 'requirements')
    },
    {
      title: "In Progress",
      value: requirements.filter(r => r.status === 'In Progress').length,
      icon: Clock,
      color: "#f59e0b",
      subtitle: "Active work",
      trend: "neutral",
      onClick: () => onFilterAndView('status', 'In Progress', 'requirements')
    },
    {
      title: "Not Started",
      value: requirements.filter(r => r.status === 'Not Started').length,
      icon: AlertTriangle,
      color: "#ef4444",
      subtitle: "Needs attention",
      trend: "down",
      onClick: () => onFilterAndView('status', 'Not Started', 'requirements')
    },
    {
      title: "High Priority",
      value: requirements.filter(r => r.priority === 'Critical' || r.priority === 'High').length,
      icon: Target,
      color: "#8b5cf6",
      subtitle: "Critical items",
      trend: "neutral",
      onClick: () => onFilterAndView('priority', 'Critical', 'requirements')
    },
    {
      title: "Capabilities",
      value: capabilities.length,
      icon: Network,
      color: "#6366f1",
      subtitle: "Active programs",
      trend: "up",
      onClick: () => onViewChange('capabilities')
    },
    {
      title: "Avg Business Value",
      value: (requirements.reduce((sum, r) => sum + (r.businessValueScore || 0), 0) / requirements.length || 0).toFixed(1),
      icon: Star,
      color: "#fbbf24",
      subtitle: "Out of 5.0",
      trend: "up",
      onClick: () => onViewChange('justification')
    },
    {
      title: "High Value Items",
      value: requirements.filter(r => (r.businessValueScore || 0) >= 4).length,
      icon: DollarSign,
      color: "#10b981",
      subtitle: "4.0+ rating",
      trend: "up",
      onClick: () => onResetAndView('justification')
    },
    {
      title: "Avg Maturity",
      value: (requirements.reduce((sum, r) => sum + (r.maturityLevel?.score || 0), 0) / requirements.length || 0).toFixed(1),
      icon: Gauge,
      color: "#06b6d4",
      subtitle: "Out of 5.0",
      trend: "neutral",
      onClick: () => onViewChange('maturity')
    },
    {
      title: "Unassigned",
      value: requirements.filter(r => !r.capabilityId).length,
      icon: GitBranch,
      color: "#f43f5e",
      subtitle: "Need capability",
      trend: "down",
      onClick: () => onFilterAndView('capability', '', 'requirements')
    },
    {
      title: "Total Investment",
      value: `£${(requirements.reduce((sum, r) => sum + (r.costEstimate || 0), 0) / 1000000).toFixed(1)}M`,
      icon: BarChart3,
      color: "#f97316",
      subtitle: "Estimated cost",
      trend: "neutral",
      onClick: () => onViewChange('analytics')
    },
    {
      title: "Essential Items",
      value: requirements.filter(r => r.applicability?.type === 'Essential').length,
      icon: Shield,
      color: "#14b8a6",
      subtitle: "Must implement",
      trend: "up",
      onClick: () => onFilterAndView('applicability', 'Essential', 'requirements')
    }
  ], [requirements, capabilities, onViewChange, onFilterAndView, onResetAndView]);

  const quickActions = useMemo(() => [
    {
      id: 'capabilities',
      name: 'View Capabilities',
      icon: Network,
      color: 'blue',
      onClick: () => onViewChange('capabilities')
    },
    {
      id: 'export',
      name: 'Export Data',
      icon: Download,
      color: 'orange',
      onClick: onExport
    },
    {
      id: 'analytics',
      name: 'View Analytics',
      icon: BarChart3,
      color: 'purple',
      onClick: () => onViewChange('analytics')
    },
    {
      id: 'reset',
      name: 'Reset Filters',
      icon: RefreshCw,
      color: 'gray',
      onClick: () => onResetAndView('requirements')
    }
  ], [onViewChange, onExport, onResetAndView]);

  const getActionColorClasses = (color) => {
    const colorMap = {
      blue: 'bg-blue-50 hover:bg-blue-100 text-blue-700',
      orange: 'bg-orange-50 hover:bg-orange-100 text-orange-700',
      purple: 'bg-purple-50 hover:bg-purple-100 text-purple-700',
      gray: 'bg-gray-50 hover:bg-gray-100 text-gray-700'
    };
    return colorMap[color] || colorMap.blue;
  };

  const getIconColorClasses = (color) => {
    const colorMap = {
      blue: 'text-blue-600',
      orange: 'text-orange-600',
      purple: 'text-purple-600',
      gray: 'text-gray-600'
    };
    return colorMap[color] || colorMap.blue;
  };

  return (
    <div className="space-y-6">
      {/* Regulatory Context Banner */}
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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {statsCards.map((card, index) => (
          <StatCard
            key={card.title}
            {...card}
            loading={loading}
            className="transform transition-all duration-300 hover:scale-105"
          />
        ))}
      </div>

      {/* Quick Actions Section */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Lightbulb className="h-5 w-5 mr-2 text-yellow-500" />
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          {quickActions.map((action) => (
            <button 
              key={action.id}
              onClick={action.onClick}
              className={`flex flex-col items-center p-4 rounded-lg transition-all duration-300 group hover:scale-105 ${getActionColorClasses(action.color)}`}
              disabled={loading}
            >
              <action.icon 
                className={`h-6 w-6 mb-2 group-hover:scale-110 transition-transform ${getIconColorClasses(action.color)}`}
              />
              <span className="text-xs font-medium text-center leading-tight">
                {action.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Activity Feed */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Activity className="h-5 w-5 mr-2 text-green-600" />
          Recent Activity
        </h3>
        <div className="space-y-4">
          <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
            <div className="bg-green-100 p-1 rounded-full">
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">Demo data loaded</p>
              <p className="text-xs text-gray-600 mt-1">
                {requirements.length} requirements generated successfully • Just now
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
            <div className="bg-blue-100 p-1 rounded-full">
              <Upload className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">Portal system integrated</p>
              <p className="text-xs text-gray-600 mt-1">
                Advanced modal system with improved UX • 2 minutes ago
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 p-3 bg-purple-50 rounded-lg">
            <div className="bg-purple-100 p-1 rounded-full">
              <Shield className="h-4 w-4 text-purple-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">Accessibility improvements</p>
              <p className="text-xs text-gray-600 mt-1">
                ARIA labels and keyboard navigation added • 5 minutes ago
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewView;