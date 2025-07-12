import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  Search,
  Filter,
  Download,
  Upload,
  ArrowRight,
  Plus,
  ChevronDown,
  ExternalLink,
  Calendar,
  User,
  Tag,
  Shield,
  Book,
  Code,
  Server
} from 'lucide-react';
import Button from '../atoms/Button';
import Badge from '../atoms/Badge';
import Input from '../atoms/Input';

/**
 * EvidenceHealthMetric Component
 * 
 * Displays a single health metric with value and label
 */
const EvidenceHealthMetric = ({ value, label, status }) => {
  const statusColorMap = {
    excellent: 'text-status-success',
    good: 'text-status-warning',
    poor: 'text-status-error',
    default: 'text-secondary-700 dark:text-secondary-300'
  };

  const colorClass = statusColorMap[status] || statusColorMap.default;

  return (
    <div className="text-center">
      <div className={`text-2xl font-bold ${colorClass}`}>{value}</div>
      <div className="text-sm text-secondary-500 dark:text-secondary-400 mt-1">{label}</div>
    </div>
  );
};

EvidenceHealthMetric.propTypes = {
  value: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  status: PropTypes.oneOf(['excellent', 'good', 'poor', 'default'])
};

EvidenceHealthMetric.defaultProps = {
  status: 'default'
};

/**
 * InsightItem Component
 * 
 * Displays a single insight metric with value and label
 */
const InsightItem = ({ value, label }) => (
  <div className="text-center">
    <div className="text-2xl font-bold text-white">{value}</div>
    <div className="text-sm text-white text-opacity-90 mt-1">{label}</div>
  </div>
);

InsightItem.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  label: PropTypes.string.isRequired
};

/**
 * LifecycleStage Component
 * 
 * Displays a single stage in the evidence lifecycle
 */
const LifecycleStage = ({ letter, title, count, color, isLast }) => (
  <div className="flex-1 text-center px-4 py-2 relative">
    <div className={`w-12 h-12 rounded-full bg-${color}-600 flex items-center justify-center text-white font-semibold text-lg mx-auto mb-2`}>
      {letter}
    </div>
    <div className="font-medium text-secondary-900 dark:text-white">{title}</div>
    <div className="text-sm text-secondary-500 dark:text-secondary-400">{count} artifacts</div>
    
    {!isLast && (
      <div className="absolute right-0 top-1/2 transform -translate-y-1/2 -translate-x-1/2 text-secondary-400 dark:text-secondary-600">
        <ArrowRight size={20} />
      </div>
    )}
  </div>
);

LifecycleStage.propTypes = {
  letter: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  count: PropTypes.number.isRequired,
  color: PropTypes.string.isRequired,
  isLast: PropTypes.bool
};

LifecycleStage.defaultProps = {
  isLast: false
};

/**
 * TimelineItem Component
 * 
 * Displays a single item in the evidence activity timeline
 */
const TimelineItem = ({ title, timestamp, source, status, tags }) => {
  const statusColorMap = {
    fresh: 'bg-status-success',
    aging: 'bg-status-warning',
    stale: 'bg-status-error'
  };

  const dotColorClass = statusColorMap[status] || 'bg-secondary-400';

  return (
    <div className="relative pl-6 py-3 border-b border-secondary-200 dark:border-secondary-700 last:border-b-0">
      <div className={`absolute left-0 top-4 w-3 h-3 rounded-full ${dotColorClass} border-2 border-white dark:border-secondary-800`}></div>
      <div>
        <div className="font-medium text-secondary-900 dark:text-white">{title}</div>
        <div className="text-sm text-secondary-500 dark:text-secondary-400 mb-1">
          {typeof timestamp === 'string' ? timestamp : `${timestamp.relative} • ${source}`}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag, index) => (
            <Badge 
              key={index} 
              variant={tag.type === 'capability' ? 'primary' : tag.type === 'risk' ? 'error' : 'info'}
              size="sm"
            >
              {tag.label}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
};

TimelineItem.propTypes = {
  title: PropTypes.string.isRequired,
  timestamp: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({
      relative: PropTypes.string.isRequired,
      absolute: PropTypes.string
    })
  ]).isRequired,
  source: PropTypes.string,
  status: PropTypes.oneOf(['fresh', 'aging', 'stale']),
  tags: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      type: PropTypes.oneOf(['capability', 'risk', 'framework', 'control'])
    })
  )
};

TimelineItem.defaultProps = {
  status: 'fresh',
  tags: []
};

/**
 * EvidenceItem Component
 * 
 * Displays a single evidence artifact in the grid
 */
const EvidenceItem = ({ title, description, status, type, timestamp, relationships, onClick }) => {
  const statusMap = {
    fresh: { class: 'status-fresh', label: 'Fresh', color: 'success' },
    aging: { class: 'status-aging', label: 'Aging', color: 'warning' },
    stale: { class: 'status-stale', label: 'Stale', color: 'error' }
  };

  const statusInfo = statusMap[status] || statusMap.fresh;

  return (
    <div 
      className="bg-white dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 rounded-lg p-4 transition-all hover:border-primary-500 dark:hover:border-primary-500 hover:shadow-md cursor-pointer"
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="font-medium text-secondary-900 dark:text-white">{title}</div>
        <Badge variant={statusInfo.color} size="sm">{statusInfo.label}</Badge>
      </div>
      
      {description && (
        <p className="text-sm text-secondary-600 dark:text-secondary-400 mb-3 line-clamp-2">
          {description}
        </p>
      )}
      
      <div className="text-xs text-secondary-500 dark:text-secondary-400 mb-3">
        {type} Artifact • {typeof timestamp === 'string' ? timestamp : timestamp.relative}
      </div>
      
      <div className="flex flex-wrap gap-1.5">
        {relationships.map((rel, index) => (
          <Badge 
            key={index}
            variant={rel.type === 'capability' ? 'primary' : rel.type === 'risk' ? 'error' : 'info'}
            size="sm"
          >
            {rel.label}
          </Badge>
        ))}
      </div>
    </div>
  );
};

EvidenceItem.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  status: PropTypes.oneOf(['fresh', 'aging', 'stale']),
  type: PropTypes.string.isRequired,
  timestamp: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({
      relative: PropTypes.string.isRequired,
      absolute: PropTypes.string
    })
  ]).isRequired,
  relationships: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      type: PropTypes.oneOf(['capability', 'risk', 'framework', 'control'])
    })
  ),
  onClick: PropTypes.func
};

EvidenceItem.defaultProps = {
  status: 'fresh',
  relationships: [],
  onClick: () => {}
};

/**
 * EvidenceView Organism Component
 * 
 * A comprehensive view for displaying and managing evidence artifacts.
 * This component implements the Evidence Dashboard with sections for:
 * - Evidence health metrics
 * - Evidence intelligence insights
 * - Evidence lifecycle visualization
 * - Recent evidence activity
 * - Evidence filtering
 * - Evidence grid display
 * 
 * Following atomic design principles, this organism composes atoms and molecules
 * to create a cohesive user interface for evidence management.
 */
const EvidenceView = ({
  healthMetrics,
  insights,
  lifecycleData,
  recentActivity,
  evidenceItems,
  filters,
  onFilterChange,
  onAddEvidence,
  onViewJourneyMap,
  onViewAllActivity,
  onViewEvidenceDetails,
  onImportEvidence,
  onExportEvidence
}) => {
  // Filter state for evidence types
  const [evidenceTypeFilter, setEvidenceTypeFilter] = useState('all');
  
  // Apply filters to evidence items
  const filteredEvidence = useMemo(() => {
    return evidenceItems.filter(item => {
      // Filter by type if not 'all'
      if (evidenceTypeFilter !== 'all' && item.type.toLowerCase() !== evidenceTypeFilter.toLowerCase()) {
        return false;
      }
      
      // Filter by search term if present
      if (filters.search && !item.title.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      
      // Filter by status if selected
      if (filters.status && item.status !== filters.status) {
        return false;
      }
      
      // Filter by framework if selected
      if (filters.framework && !item.relationships.some(rel => 
        rel.type === 'framework' && rel.label.includes(filters.framework)
      )) {
        return false;
      }
      
      return true;
    });
  }, [evidenceItems, evidenceTypeFilter, filters]);

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Header with Evidence Health */}
      <div className="bg-white dark:bg-secondary-800 border-b border-secondary-200 dark:border-secondary-700 p-6 rounded-lg">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">Evidence Dashboard</h1>
            <span className="bg-secondary-100 dark:bg-secondary-700 text-secondary-600 dark:text-secondary-300 px-3 py-1 rounded-full text-sm font-medium">
              Golden Thread View
            </span>
          </div>
          
          <div className="flex items-center gap-8">
            {healthMetrics.map((metric, index) => (
              <EvidenceHealthMetric
                key={index}
                value={metric.value}
                label={metric.label}
                status={metric.status}
              />
            ))}
          </div>
        </div>
      </div>
      
      {/* Evidence Intelligence Panel */}
      <div className="bg-gradient-to-r from-primary-600 to-purple-600 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Evidence Intelligence</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {insights.map((insight, index) => (
            <InsightItem
              key={index}
              value={insight.value}
              label={insight.label}
            />
          ))}
        </div>
      </div>
      
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Evidence Lifecycle */}
        <div className="bg-white dark:bg-secondary-800 rounded-lg border border-secondary-200 dark:border-secondary-700 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-white">Evidence Lifecycle</h3>
            <div className="flex gap-2">
              <Button 
                variant="secondary" 
                size="sm"
                onClick={onViewJourneyMap}
              >
                View Journey Map
              </Button>
              <Button 
                variant="primary" 
                size="sm"
                leadingIcon={Plus}
                onClick={onAddEvidence}
              >
                Add Evidence
              </Button>
            </div>
          </div>
          
          <div className="flex justify-between">
            {lifecycleData.map((stage, index) => (
              <LifecycleStage
                key={index}
                letter={stage.letter}
                title={stage.title}
                count={stage.count}
                color={stage.color}
                isLast={index === lifecycleData.length - 1}
              />
            ))}
          </div>
        </div>
        
        {/* Recent Evidence Activity */}
        <div className="bg-white dark:bg-secondary-800 rounded-lg border border-secondary-200 dark:border-secondary-700 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-white">Recent Evidence Activity</h3>
            <Button 
              variant="secondary" 
              size="sm"
              onClick={onViewAllActivity}
            >
              View All
            </Button>
          </div>
          
          <div className="relative">
            {/* Timeline vertical line */}
            <div className="absolute left-1.5 top-4 bottom-0 w-0.5 bg-secondary-200 dark:bg-secondary-700"></div>
            
            {/* Timeline items */}
            <div className="space-y-0">
              {recentActivity.map((activity, index) => (
                <TimelineItem
                  key={index}
                  title={activity.title}
                  timestamp={activity.timestamp}
                  source={activity.source}
                  status={activity.status}
                  tags={activity.tags}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Filters Bar */}
      <div className="bg-white dark:bg-secondary-800 rounded-lg border border-secondary-200 dark:border-secondary-700 p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-secondary-700 dark:text-secondary-300">Filter by:</span>
            <select
              className="text-sm border border-secondary-300 dark:border-secondary-600 rounded-md bg-white dark:bg-secondary-700 px-3 py-1.5"
              value={evidenceTypeFilter}
              onChange={(e) => setEvidenceTypeFilter(e.target.value)}
            >
              <option value="all">All Evidence Types</option>
              <option value="intent">Intent Artifacts</option>
              <option value="implementation">Implementation Artifacts</option>
              <option value="behavioral">Behavioral Artifacts</option>
              <option value="validation">Validation Artifacts</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-secondary-700 dark:text-secondary-300">Status:</span>
            <select
              className="text-sm border border-secondary-300 dark:border-secondary-600 rounded-md bg-white dark:bg-secondary-700 px-3 py-1.5"
              value={filters.status || ''}
              onChange={(e) => onFilterChange('status', e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="fresh">Fresh (&lt; 30 days)</option>
              <option value="aging">Aging (30-90 days)</option>
              <option value="stale">Stale (&gt; 90 days)</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-secondary-700 dark:text-secondary-300">Framework:</span>
            <select
              className="text-sm border border-secondary-300 dark:border-secondary-600 rounded-md bg-white dark:bg-secondary-700 px-3 py-1.5"
              value={filters.framework || ''}
              onChange={(e) => onFilterChange('framework', e.target.value)}
            >
              <option value="">All Frameworks</option>
              <option value="NIST CSF 2.0">NIST CSF 2.0</option>
              <option value="ISO 27001">ISO 27001</option>
              <option value="SOC 2">SOC 2</option>
              <option value="CIS Controls">CIS Controls</option>
            </select>
          </div>
          
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="Search evidence artifacts..."
              value={filters.search || ''}
              onChange={(e) => onFilterChange('search', e.target.value)}
              leadingIcon={Search}
              onClear={() => onFilterChange('search', '')}
              className="w-full"
            />
          </div>
          
          <div className="flex items-center gap-2 ml-auto">
            <Button
              variant="secondary"
              size="sm"
              leadingIcon={Upload}
              onClick={onImportEvidence}
            >
              Import
            </Button>
            <Button
              variant="secondary"
              size="sm"
              leadingIcon={Download}
              onClick={onExportEvidence}
            >
              Export
            </Button>
          </div>
        </div>
      </div>
      
      {/* Evidence Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvidence.map((evidence, index) => (
          <EvidenceItem
            key={index}
            title={evidence.title}
            description={evidence.description}
            status={evidence.status}
            type={evidence.type}
            timestamp={evidence.timestamp}
            relationships={evidence.relationships}
            onClick={() => onViewEvidenceDetails(evidence)}
          />
        ))}
        
        {filteredEvidence.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
            <FileText className="w-12 h-12 text-secondary-400 mb-4" />
            <h3 className="text-lg font-medium text-secondary-900 dark:text-white mb-1">No evidence artifacts found</h3>
            <p className="text-secondary-500 dark:text-secondary-400 max-w-md mb-4">
              {filters.search || filters.status || filters.framework || evidenceTypeFilter !== 'all'
                ? 'Try adjusting your filters to see more results.'
                : 'Start by adding evidence artifacts to build your compliance story.'}
            </p>
            <Button
              variant="primary"
              leadingIcon={Plus}
              onClick={onAddEvidence}
            >
              Add Evidence
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

EvidenceView.propTypes = {
  /**
   * Health metrics to display at the top of the dashboard
   */
  healthMetrics: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      status: PropTypes.oneOf(['excellent', 'good', 'poor'])
    })
  ).isRequired,
  
  /**
   * Insight metrics to display in the intelligence panel
   */
  insights: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      label: PropTypes.string.isRequired
    })
  ).isRequired,
  
  /**
   * Data for the evidence lifecycle visualization
   */
  lifecycleData: PropTypes.arrayOf(
    PropTypes.shape({
      letter: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      count: PropTypes.number.isRequired,
      color: PropTypes.string.isRequired
    })
  ).isRequired,
  
  /**
   * Recent activity data for the timeline
   */
  recentActivity: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      timestamp: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.shape({
          relative: PropTypes.string.isRequired,
          absolute: PropTypes.string
        })
      ]).isRequired,
      source: PropTypes.string,
      status: PropTypes.oneOf(['fresh', 'aging', 'stale']),
      tags: PropTypes.arrayOf(
        PropTypes.shape({
          label: PropTypes.string.isRequired,
          type: PropTypes.oneOf(['capability', 'risk', 'framework', 'control'])
        })
      )
    })
  ).isRequired,
  
  /**
   * Evidence items to display in the grid
   */
  evidenceItems: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      description: PropTypes.string,
      status: PropTypes.oneOf(['fresh', 'aging', 'stale']),
      type: PropTypes.string.isRequired,
      timestamp: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.shape({
          relative: PropTypes.string.isRequired,
          absolute: PropTypes.string
        })
      ]).isRequired,
      relationships: PropTypes.arrayOf(
        PropTypes.shape({
          label: PropTypes.string.isRequired,
          type: PropTypes.oneOf(['capability', 'risk', 'framework', 'control'])
        })
      )
    })
  ).isRequired,
  
  /**
   * Current filter values
   */
  filters: PropTypes.shape({
    search: PropTypes.string,
    status: PropTypes.string,
    framework: PropTypes.string
  }),
  
  /**
   * Handler for filter changes
   */
  onFilterChange: PropTypes.func.isRequired,
  
  /**
   * Handler for adding new evidence
   */
  onAddEvidence: PropTypes.func.isRequired,
  
  /**
   * Handler for viewing the evidence journey map
   */
  onViewJourneyMap: PropTypes.func,
  
  /**
   * Handler for viewing all activity
   */
  onViewAllActivity: PropTypes.func,
  
  /**
   * Handler for viewing evidence details
   */
  onViewEvidenceDetails: PropTypes.func,
  
  /**
   * Handler for importing evidence
   */
  onImportEvidence: PropTypes.func,
  
  /**
   * Handler for exporting evidence
   */
  onExportEvidence: PropTypes.func
};

EvidenceView.defaultProps = {
  filters: {},
  onViewJourneyMap: () => {},
  onViewAllActivity: () => {},
  onViewEvidenceDetails: () => {},
  onImportEvidence: () => {},
  onExportEvidence: () => {}
};

export default EvidenceView;
