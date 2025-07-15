import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  FileText,
  Search,
  Download,
  Upload,
  Plus,
  ArrowRight
} from 'lucide-react';
import Button from '../../atoms/Button';
import Badge from '../../atoms/Badge';
import Input from '../../atoms/Input';
import EvidenceHealthCard from '../../molecules/EvidenceHealthCard';

/**
 * LifecycleStage Component
 * 
 * Displays a single stage in the evidence lifecycle
 */
const LifecycleStage = ({
  letter,
  title,
  count,
  color,
  isLast,
  active,
  onClick,
  needsAction,
  onRecommend
}) => {
  // Improve Intent readability with darker shade
  const titleLower = title.toLowerCase();
  const bgClass =
    titleLower === 'intent' ? 'bg-purple-800' : `bg-${color}-600`;

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex-1 text-center px-4 py-2 relative cursor-pointer focus:outline-none"
    >
      <div
        className={`w-12 h-12 rounded-full ${bgClass} flex items-center justify-center text-white font-semibold text-lg mx-auto mb-2 ${
          active ? 'ring-4 ring-primary-500 ring-offset-2' : ''
        }`}
      >
        {letter}
      </div>
      <div className="font-medium text-secondary-900 dark:text-white">
        {title}
      </div>
      <div className="text-sm text-secondary-500 dark:text-secondary-400">
        {count} artifacts
      </div>

      {/* Inline recommend action when threshold breached */}
      {needsAction && (
        <Button
          variant="warning"
          size="sm"
          className="mt-2"
          onClick={onRecommend}
        >
          Recommend Action
        </Button>
      )}

      {!isLast && (
        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 -translate-x-1/2 text-secondary-400 dark:text-secondary-600">
          <ArrowRight size={20} />
        </div>
      )}
    </button>
  );
};

LifecycleStage.propTypes = {
  letter: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  count: PropTypes.number.isRequired,
  color: PropTypes.string.isRequired,
  isLast: PropTypes.bool
  ,
  active: PropTypes.bool,
  onClick: PropTypes.func,
  needsAction: PropTypes.bool,
  onRecommend: PropTypes.func
};

LifecycleStage.defaultProps = {
  isLast: false,
  active: false,
  onClick: () => {},
  needsAction: false,
  onRecommend: () => {}
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
 * EvidenceTab Component
 * 
 * Displays the main evidence tab with lifecycle, activity, health metrics, filters, and evidence grid
 */
const EvidenceTab = ({
  healthMetrics,
  insights,
  lifecycleData,
  recentActivity,
  evidenceItems,
  filters,
  evidenceTypeFilter,
  setEvidenceTypeFilter,
  onFilterChange,
  onAddEvidence,
  onViewJourneyMap,
  onViewAllActivity,
  onViewEvidenceDetails,
  onImportEvidence,
  onExportEvidence,
  onRecommendAction
}) => {
  // ---- Guided-next-action calculations ----
  const totalArtifacts = useMemo(
    () => lifecycleData.reduce((sum, s) => sum + s.count, 0),
    [lifecycleData]
  );
  const threshold = 0.5; // 50 %

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
    <div className="space-y-6">
      {/* Evidence Lifecycle */}
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
            {lifecycleData.map((stage, index) => {
              const stageRatio =
                totalArtifacts === 0 ? 1 : stage.count / totalArtifacts;
              const needsAction =
                stage.title.toLowerCase() === 'validation' && stageRatio < threshold;

              return (
                <LifecycleStage
                  key={index}
                  letter={stage.letter}
                  title={stage.title}
                  count={stage.count}
                  color={stage.color}
                  isLast={index === lifecycleData.length - 1}
                  active={
                    evidenceTypeFilter.toLowerCase() ===
                    stage.title.toLowerCase()
                  }
                  onClick={() =>
                    setEvidenceTypeFilter(stage.title.toLowerCase())
                  }
                  needsAction={needsAction}
                  onRecommend={() =>
                    onRecommendAction(stage.title.toLowerCase())
                  }
                />
              );
            })}
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
      
      {/* Evidence Health Card */}
      <EvidenceHealthCard
        title="Evidence Health"
        overallScore={87}
        qualityScore={94}
        coverageScore={87}
        freshnessScore={72}
        trend={+3}
        trendPeriod="month"
        detailedMetrics={[
          { label: 'Evidence Artifacts', value: '1,247', icon: 'info', status: 'neutral' },
          { label: 'Evidence Gaps', value: '23', icon: 'alert', status: 'warning' },
          { label: 'Stale Evidence', value: '124', icon: 'alert', status: 'warning' },
          { label: 'Auto-Collected', value: '76%', icon: 'success', status: 'good' }
        ]}
        impactedAreas={[
          { name: 'Access Control', count: 42, impact: 'low' },
          { name: 'Data Protection', count: 28, impact: 'medium' },
          { name: 'Cloud Security', count: 15, impact: 'high' },
          { name: 'Incident Response', count: 8, impact: 'medium' }
        ]}
        onViewDetails={() => console.log('View detailed health report')}
      />
      
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

EvidenceTab.propTypes = {
  healthMetrics: PropTypes.array.isRequired,
  insights: PropTypes.array.isRequired,
  lifecycleData: PropTypes.array.isRequired,
  recentActivity: PropTypes.array.isRequired,
  evidenceItems: PropTypes.array.isRequired,
  filters: PropTypes.object,
  evidenceTypeFilter: PropTypes.string.isRequired,
  setEvidenceTypeFilter: PropTypes.func.isRequired,
  onFilterChange: PropTypes.func.isRequired,
  onAddEvidence: PropTypes.func.isRequired,
  onViewJourneyMap: PropTypes.func,
  onViewAllActivity: PropTypes.func,
  onViewEvidenceDetails: PropTypes.func,
  onImportEvidence: PropTypes.func,
  onExportEvidence: PropTypes.func,
  onRecommendAction: PropTypes.func.isRequired
};

EvidenceTab.defaultProps = {
  filters: {},
  onViewJourneyMap: () => {},
  onViewAllActivity: () => {},
  onViewEvidenceDetails: () => {},
  onImportEvidence: () => {},
  onExportEvidence: () => {}
};

export default EvidenceTab;
