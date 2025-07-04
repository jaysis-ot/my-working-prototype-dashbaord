// src/components/widgets/ActivityFeed.jsx
import React, { useState, useEffect } from 'react';
import { 
  Activity, CheckCircle, AlertTriangle, Shield, Upload, Download,
  FileText, Users, Settings, Bell, Clock, Eye, MoreVertical,
  RefreshCw, Filter, Calendar, Target, Network, Building2
} from 'lucide-react';

/**
 * Activity Feed Widget Component
 * 
 * Displays a chronological feed of recent activities, events, and system updates.
 * Provides real-time visibility into system changes, user actions, and important events.
 * 
 * Features:
 * - Real-time activity updates
 * - Categorized activity types with icons and colors
 * - Time-based activity grouping
 * - Filtering by activity type
 * - Auto-refresh functionality
 * - Click-to-expand for detailed information
 * - Responsive design
 * - Customizable activity sources
 */
const ActivityFeed = ({
  requirements = [],
  capabilities = [],
  threats = [],
  maxItems = 10,
  autoRefresh = true,
  showFilters = false,
  compact = false,
  className = ''
}) => {

  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [expandedItems, setExpandedItems] = useState(new Set());
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Activity types configuration
  const activityTypes = {
    requirement_completed: {
      icon: CheckCircle,
      color: 'text-green-600',
      bg: 'bg-green-50',
      border: 'border-green-200',
      label: 'Requirement Completed'
    },
    requirement_created: {
      icon: FileText,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      label: 'Requirement Created'
    },
    threat_detected: {
      icon: Shield,
      color: 'text-red-600',
      bg: 'bg-red-50',
      border: 'border-red-200',
      label: 'Threat Detected'
    },
    system_update: {
      icon: Settings,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      label: 'System Update'
    },
    data_import: {
      icon: Upload,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      border: 'border-indigo-200',
      label: 'Data Import'
    },
    data_export: {
      icon: Download,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      label: 'Data Export'
    },
    capability_added: {
      icon: Network,
      color: 'text-teal-600',
      bg: 'bg-teal-50',
      border: 'border-teal-200',
      label: 'Capability Added'
    },
    user_action: {
      icon: Users,
      color: 'text-gray-600',
      bg: 'bg-gray-50',
      border: 'border-gray-200',
      label: 'User Action'
    },
    alert_triggered: {
      icon: Bell,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      label: 'Alert Triggered'
    },
    milestone_reached: {
      icon: Target,
      color: 'text-green-600',
      bg: 'bg-green-50',
      border: 'border-green-200',
      label: 'Milestone Reached'
    }
  };

  // Generate mock activity data based on provided data
  const generateActivities = () => {
    const mockActivities = [
      {
        id: 'act-001',
        type: 'requirement_completed',
        title: 'Network Segmentation Requirement Completed',
        description: 'REQ-001 has been marked as completed with all validation checks passed',
        timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
        user: 'Security Team',
        metadata: {
          requirementId: 'REQ-001',
          capability: 'Network Security',
          completionRate: '100%'
        }
      },
      {
        id: 'act-002',
        type: 'threat_detected',
        title: 'New APT Campaign Targeting Energy Sector',
        description: 'High-severity threat detected: APT29 targeting energy infrastructure with spear-phishing',
        timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
        user: 'Threat Intelligence',
        metadata: {
          severity: 'Critical',
          threatActor: 'APT29',
          affectedSectors: ['Energy', 'Utilities']
        }
      },
      {
        id: 'act-003',
        type: 'system_update',
        title: 'MITRE ATT&CK Navigator Integration',
        description: 'Advanced threat technique visualization and analysis capabilities added',
        timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        user: 'System Administrator',
        metadata: {
          version: '2.1.0',
          features: ['MITRE Integration', 'Enhanced Analytics', 'Real-time Updates']
        }
      },
      {
        id: 'act-004',
        type: 'data_import',
        title: 'Requirements Data Successfully Imported',
        description: `${requirements.length} security requirements imported from CSV file`,
        timestamp: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
        user: 'Current User',
        metadata: {
          recordsImported: requirements.length,
          source: 'CSV Upload',
          validationStatus: 'Passed'
        }
      },
      {
        id: 'act-005',
        type: 'capability_added',
        title: 'New Security Capability Registered',
        description: 'Advanced Threat Detection capability added to security framework',
        timestamp: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
        user: 'Security Architect',
        metadata: {
          capabilityId: 'SEC-004',
          businessValue: 4.2,
          estimatedROI: '150%'
        }
      },
      {
        id: 'act-006',
        type: 'milestone_reached',
        title: '50% Completion Milestone Achieved',
        description: 'Security implementation program has reached 50% completion rate',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        user: 'Program Manager',
        metadata: {
          completionRate: '50%',
          completedRequirements: Math.floor(requirements.length * 0.5),
          totalRequirements: requirements.length
        }
      },
      {
        id: 'act-007',
        type: 'alert_triggered',
        title: 'High-Value Requirement Behind Schedule',
        description: 'Critical security requirement REQ-025 is behind its target completion date',
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
        user: 'Automated System',
        metadata: {
          requirementId: 'REQ-025',
          daysOverdue: 5,
          priority: 'Critical',
          assignedTeam: 'Infrastructure Team'
        }
      },
      {
        id: 'act-008',
        type: 'data_export',
        title: 'Analytics Report Generated',
        description: 'Quarterly security analytics report exported successfully',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        user: 'Current User',
        metadata: {
          reportType: 'Quarterly Analytics',
          format: 'PDF',
          size: '2.3 MB'
        }
      },
      {
        id: 'act-009',
        type: 'user_action',
        title: 'Company Profile Updated',
        description: 'Company security profile and compliance requirements updated',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
        user: 'Administrator',
        metadata: {
          changedFields: ['Industry', 'Compliance Requirements', 'Operating Regions'],
          profileCompleteness: '95%'
        }
      },
      {
        id: 'act-010',
        title: 'Risk Assessment Completed',
        type: 'requirement_completed',
        description: 'Comprehensive risk assessment for operational technology systems completed',
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
        user: 'Risk Analysis Team',
        metadata: {
          risksIdentified: 15,
          criticalRisks: 3,
          mitigationPlans: 12
        }
      }
    ];

    return mockActivities.slice(0, maxItems);
  };

  // Initialize activities
  useEffect(() => {
    const newActivities = generateActivities();
    setActivities(newActivities);
    setFilteredActivities(newActivities);
  }, [requirements, capabilities, threats, maxItems]);

  // Auto-refresh functionality
  useEffect(() => {
    let interval;
    if (autoRefresh) {
      interval = setInterval(() => {
        setLastUpdated(new Date());
        // In real implementation, this would fetch new activities
      }, 30000); // Refresh every 30 seconds
    }
    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Filter activities
  useEffect(() => {
    if (activeFilter === 'all') {
      setFilteredActivities(activities);
    } else {
      setFilteredActivities(activities.filter(activity => activity.type === activeFilter));
    }
  }, [activities, activeFilter]);

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = Math.floor((now - timestamp) / 1000); // seconds

    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return timestamp.toLocaleDateString();
  };

  // Toggle item expansion
  const toggleExpanded = (activityId) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(activityId)) {
      newExpanded.delete(activityId);
    } else {
      newExpanded.add(activityId);
    }
    setExpandedItems(newExpanded);
  };

  // Get unique activity types for filter
  const getFilterOptions = () => {
    const types = [...new Set(activities.map(a => a.type))];
    return types.map(type => ({
      value: type,
      label: activityTypes[type]?.label || type,
      count: activities.filter(a => a.type === type).length
    }));
  };

  return (
    <div className={`bg-white rounded-xl shadow-md p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className={`font-semibold text-gray-900 flex items-center ${compact ? 'text-base' : 'text-lg'}`}>
          <Activity className={`mr-2 text-green-600 ${compact ? 'h-4 w-4' : 'h-5 w-5'}`} />
          Recent Activity
        </h3>
        <div className="flex items-center space-x-2">
          {showFilters && (
            <select
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value)}
              className="text-xs px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Activity ({activities.length})</option>
              {getFilterOptions().map(option => (
                <option key={option.value} value={option.value}>
                  {option.label} ({option.count})
                </option>
              ))}
            </select>
          )}
          <button
            onClick={() => setLastUpdated(new Date())}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Last Updated */}
      {!compact && (
        <div className="text-xs text-gray-500 mb-4 flex items-center">
          <Clock className="h-3 w-3 mr-1" />
          Last updated: {lastUpdated.toLocaleTimeString()}
        </div>
      )}

      {/* Activity List */}
      <div className="space-y-3">
        {filteredActivities.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">No recent activity</p>
          </div>
        ) : (
          filteredActivities.map((activity) => {
            const typeConfig = activityTypes[activity.type] || activityTypes.user_action;
            const Icon = typeConfig.icon;
            const isExpanded = expandedItems.has(activity.id);

            return (
              <div 
                key={activity.id}
                className={`flex items-start space-x-3 p-3 rounded-lg border transition-all duration-200 ${
                  typeConfig.bg
                } ${typeConfig.border} ${
                  compact ? 'hover:shadow-sm' : 'hover:shadow-md'
                }`}
              >
                {/* Icon */}
                <div className={`p-1 rounded-full ${typeConfig.bg} flex-shrink-0`}>
                  <Icon className={`${compact ? 'h-3 w-3' : 'h-4 w-4'} ${typeConfig.color}`} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium text-gray-900 ${compact ? 'text-sm' : 'text-sm'}`}>
                        {activity.title}
                      </p>
                      <p className={`text-gray-600 mt-1 ${compact ? 'text-xs' : 'text-xs'} leading-relaxed`}>
                        {activity.description}
                      </p>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center space-x-1 ml-2">
                      {activity.metadata && (
                        <button
                          onClick={() => toggleExpanded(activity.id)}
                          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                          title={isExpanded ? "Show less" : "Show more"}
                        >
                          <Eye className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expanded Metadata */}
                  {isExpanded && activity.metadata && (
                    <div className="mt-3 p-2 bg-white bg-opacity-50 rounded border border-gray-200">
                      <div className="text-xs text-gray-600 space-y-1">
                        {Object.entries(activity.metadata).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="font-medium capitalize">
                              {key.replace(/([A-Z])/g, ' $1').toLowerCase()}:
                            </span>
                            <span className="text-gray-800">
                              {Array.isArray(value) ? value.join(', ') : value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between mt-2">
                    <span className={`text-gray-500 ${compact ? 'text-xs' : 'text-xs'} flex items-center`}>
                      <Users className="h-3 w-3 mr-1" />
                      {activity.user}
                    </span>
                    <span className={`text-gray-400 ${compact ? 'text-xs' : 'text-xs'}`}>
                      {formatTimestamp(activity.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* View More */}
      {filteredActivities.length >= maxItems && !compact && (
        <div className="mt-4 text-center">
          <button className="text-sm text-blue-600 hover:text-blue-800 transition-colors">
            View all activity →
          </button>
        </div>
      )}
    </div>
  );
};

export default ActivityFeed;