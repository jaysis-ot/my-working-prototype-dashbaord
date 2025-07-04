// src/components/views/OverviewView.jsx
import React, { useEffect, useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Eye,
  BarChart3,
  PieChart,
  Users,
  Shield
} from 'lucide-react';
import { useDashboardState } from '../../hooks/useDashboardState';
import { useTheme } from '../../hooks/useTheme';
import { VIEW_MODES } from '../../constants';

// Import existing components
import StatCard from '../common/StatCard';
import QuickActions from '../common/QuickActions';

/**
 * Overview View Component
 * 
 * Main dashboard overview that displays key metrics, recent activity,
 * and quick actions. Fully integrated with the state management system.
 * 
 * Features:
 * - Real-time metrics and KPIs
 * - Interactive stat cards with drill-down navigation
 * - Recent activity feed
 * - Quick action shortcuts
 * - Responsive grid layout
 * - Integration with dashboard state
 * - Analytics tracking
 * - Error handling and loading states
 */

const OverviewView = () => {
  const { state, actions } = useDashboardState();
  const { getThemeClasses } = useTheme();
  
  // Local state for demo data (would come from API in real app)
  const [metrics, setMetrics] = useState({
    totalRequirements: 156,
    completedRequirements: 89,
    inProgressRequirements: 45,
    notStartedRequirements: 22,
    totalCapabilities: 34,
    riskScore: 7.2,
    complianceScore: 85,
    lastUpdated: new Date().toISOString()
  });
  
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(false);

  // =============================================================================
  // DATA LOADING
  // =============================================================================

  useEffect(() => {
    // Track page view
    actions.trackPageView(VIEW_MODES.OVERVIEW, { source: 'navigation' });
    
    // Load overview data (mock implementation)
    loadOverviewData();
  }, [actions]);

  const loadOverviewData = async () => {
    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate mock recent activity
      const activities = [
        {
          id: 1,
          type: 'requirement_completed',
          message: 'Requirement "Multi-factor Authentication" marked as completed',
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          user: 'John Doe'
        },
        {
          id: 2,
          type: 'capability_added',
          message: 'New capability "Incident Response" added to Security Operations',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          user: 'Jane Smith'
        },
        {
          id: 3,
          type: 'risk_assessed',
          message: 'Risk assessment updated for "Data Encryption" capability',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
          user: 'Mike Johnson'
        }
      ];
      
      setRecentActivity(activities);
      
    } catch (error) {
      actions.setError('Failed to load overview data');
    } finally {
      setLoading(false);
    }
  };

  // =============================================================================
  // NAVIGATION HANDLERS
  // =============================================================================

  const handleStatCardClick = (statType) => {
    switch (statType) {
      case 'requirements':
        actions.setViewMode(VIEW_MODES.REQUIREMENTS);
        break;
      case 'capabilities':
        actions.setViewMode(VIEW_MODES.CAPABILITIES);
        break;
      case 'risk':
        actions.setViewMode(VIEW_MODES.RISK);
        break;
      case 'reports':
        actions.setViewMode(VIEW_MODES.REPORTS);
        break;
    }
    
    actions.trackUserAction('overviewNavigation', { destination: statType });
  };

  const handleQuickAction = (actionType) => {
    switch (actionType) {
      case 'new-requirement':
        // Navigate to requirements with new modal
        actions.setViewMode(VIEW_MODES.REQUIREMENTS);
        // Would open new requirement modal
        break;
      case 'upload-data':
        actions.toggleUploadModal();
        break;
      case 'generate-report':
        actions.setViewMode(VIEW_MODES.REPORTS);
        break;
      case 'view-analytics':
        actions.setViewMode(VIEW_MODES.ANALYTICS);
        break;
    }
    
    actions.trackUserAction('quickAction', { action: actionType, source: 'overview' });
  };

  // =============================================================================
  // RENDER COMPONENTS
  // =============================================================================

  const renderKPICards = () => {
    const kpiData = [
      {
        title: 'Total Requirements',
        value: metrics.totalRequirements,
        change: '+12',
        changeType: 'positive',
        icon: CheckCircle,
        description: 'Active security requirements',
        onClick: () => handleStatCardClick('requirements')
      },
      {
        title: 'Completion Rate',
        value: `${Math.round((metrics.completedRequirements / metrics.totalRequirements) * 100)}%`,
        change: '+5%',
        changeType: 'positive',
        icon: TrendingUp,
        description: 'Requirements completed',
        onClick: () => handleStatCardClick('requirements')
      },
      {
        title: 'Active Capabilities',
        value: metrics.totalCapabilities,
        change: '+3',
        changeType: 'positive',
        icon: Shield,
        description: 'Security capabilities',
        onClick: () => handleStatCardClick('capabilities')
      },
      {
        title: 'Risk Score',
        value: metrics.riskScore.toFixed(1),
        change: '-0.3',
        changeType: 'positive',
        icon: AlertTriangle,
        description: 'Overall risk assessment',
        onClick: () => handleStatCardClick('risk')
      }
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {kpiData.map((kpi, index) => (
          <StatCard
            key={index}
            title={kpi.title}
            value={kpi.value}
            change={kpi.change}
            changeType={kpi.changeType}
            icon={kpi.icon}
            description={kpi.description}
            onClick={kpi.onClick}
            className="cursor-pointer hover:shadow-lg transition-shadow"
          />
        ))}
      </div>
    );
  };

  const renderProgressSection = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Requirements Progress */}
      <div className={`bg-white rounded-lg shadow-sm border p-6 ${getThemeClasses('card', 'container')}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Requirements Progress</h3>
          <button
            onClick={() => handleStatCardClick('requirements')}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            View All
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Completed</span>
            <span className="text-sm font-medium text-green-600">{metrics.completedRequirements}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(metrics.completedRequirements / metrics.totalRequirements) * 100}%` }}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">In Progress</span>
            <span className="text-sm font-medium text-blue-600">{metrics.inProgressRequirements}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(metrics.inProgressRequirements / metrics.totalRequirements) * 100}%` }}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Not Started</span>
            <span className="text-sm font-medium text-gray-600">{metrics.notStartedRequirements}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gray-400 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(metrics.notStartedRequirements / metrics.totalRequirements) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Compliance Score */}
      <div className={`bg-white rounded-lg shadow-sm border p-6 ${getThemeClasses('card', 'container')}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Compliance Score</h3>
          <button
            onClick={() => handleStatCardClick('reports')}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            View Details
          </button>
        </div>
        
        <div className="flex items-center justify-center mb-4">
          <div className="relative w-32 h-32">
            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-gray-200"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-blue-500"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray={`${metrics.complianceScore}, 100`}
                strokeLinecap="round"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-gray-900">{metrics.complianceScore}%</span>
            </div>
          </div>
        </div>
        
        <div className="text-center">
          <p className="text-sm text-gray-600">Overall compliance score</p>
          <p className="text-xs text-gray-500 mt-1">Based on completed requirements</p>
        </div>
      </div>
    </div>
  );

  const renderRecentActivity = () => (
    <div className={`bg-white rounded-lg shadow-sm border p-6 mb-8 ${getThemeClasses('card', 'container')}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
        <button
          onClick={() => actions.setViewMode(VIEW_MODES.ANALYTICS)}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          View All
        </button>
      </div>
      
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className="flex space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center
                ${activity.type === 'requirement_completed' 
                  ? 'bg-green-100 text-green-600'
                  : activity.type === 'capability_added'
                  ? 'bg-blue-100 text-blue-600'
                  : 'bg-yellow-100 text-yellow-600'
                }
              `}>
                {activity.type === 'requirement_completed' && <CheckCircle className="w-4 h-4" />}
                {activity.type === 'capability_added' && <Shield className="w-4 h-4" />}
                {activity.type === 'risk_assessed' && <AlertTriangle className="w-4 h-4" />}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">{activity.message}</p>
                <div className="flex items-center mt-1 text-xs text-gray-500">
                  <span>{activity.user}</span>
                  <span className="mx-1">•</span>
                  <span>{new Date(activity.timestamp).toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderQuickActionsSection = () => {
    const quickActionsData = [
      {
        title: 'Add Requirement',
        description: 'Create a new security requirement',
        icon: 'plus',
        onClick: () => handleQuickAction('new-requirement')
      },
      {
        title: 'Upload Data',
        description: 'Import requirements or capabilities',
        icon: 'upload',
        onClick: () => handleQuickAction('upload-data')
      },
      {
        title: 'Generate Report',
        description: 'Create compliance or progress report',
        icon: 'report',
        onClick: () => handleQuickAction('generate-report')
      },
      {
        title: 'View Analytics',
        description: 'Detailed performance metrics',
        icon: 'analytics',
        onClick: () => handleQuickAction('view-analytics')
      }
    ];

    return (
      <QuickActions
        title="Quick Actions"
        actions={quickActionsData}
        className="mb-8"
      />
    );
  };

  // =============================================================================
  // MAIN RENDER
  // =============================================================================

  if (state.system?.loading || loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-gray-200 h-32 rounded-lg"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-200 h-64 rounded-lg"></div>
            <div className="bg-gray-200 h-64 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard Overview</h1>
        <p className="text-gray-600">
          Monitor your security posture and track compliance progress
        </p>
        <div className="text-sm text-gray-500 mt-2">
          Last updated: {new Date(metrics.lastUpdated).toLocaleString()}
        </div>
      </div>

      {/* KPI Cards */}
      {renderKPICards()}

      {/* Progress and Compliance */}
      {renderProgressSection()}

      {/* Recent Activity */}
      {renderRecentActivity()}

      {/* Quick Actions */}
      {renderQuickActionsSection()}

      {/* Connection Status */}
      {!state.system?.isOnline && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
            <span className="text-yellow-800">
              You're currently offline. Data may not be up to date.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default OverviewView;