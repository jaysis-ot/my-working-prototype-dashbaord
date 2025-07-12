import React from 'react';
import PropTypes from 'prop-types';
import { 
  CheckCircle, 
  Clock, 
  FileText, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  Info,
  ChevronRight,
  Shield
} from 'lucide-react';

/**
 * EvidenceHealthCard Component
 * 
 * A detailed visualization of evidence health metrics including quality,
 * coverage, freshness, and trends over time. This component provides a
 * comprehensive view of evidence health to support the "golden thread"
 * architecture.
 * 
 * Used in the Evidence Dashboard to show the overall health of evidence
 * artifacts and their impact on trust scores.
 */
const EvidenceHealthCard = ({
  title,
  overallScore,
  qualityScore,
  coverageScore,
  freshnessScore,
  trend,
  trendPeriod,
  detailedMetrics,
  impactedAreas,
  onViewDetails,
  className
}) => {
  // Helper function to determine color based on score
  const getScoreColor = (score) => {
    if (score >= 90) return 'text-status-success';
    if (score >= 70) return 'text-status-warning';
    return 'text-status-error';
  };

  // Helper function to determine background color based on score
  const getScoreBgColor = (score) => {
    if (score >= 90) return 'bg-status-success';
    if (score >= 70) return 'bg-status-warning';
    return 'bg-status-error';
  };

  // Helper function to determine background opacity color based on score
  const getScoreBgOpacity = (score) => {
    if (score >= 90) return 'bg-status-success bg-opacity-10';
    if (score >= 70) return 'bg-status-warning bg-opacity-10';
    return 'bg-status-error bg-opacity-10';
  };

  // Helper function to get trend icon and color
  const getTrendIndicator = () => {
    if (trend > 0) {
      return {
        icon: TrendingUp,
        color: 'text-status-success',
        label: `+${trend}% from last ${trendPeriod}`
      };
    } else if (trend < 0) {
      return {
        icon: TrendingDown,
        color: 'text-status-error',
        label: `${trend}% from last ${trendPeriod}`
      };
    } else {
      return {
        icon: Info,
        color: 'text-secondary-500',
        label: `No change from last ${trendPeriod}`
      };
    }
  };

  const trendIndicator = getTrendIndicator();
  const TrendIcon = trendIndicator.icon;

  // Calculate the progress bar width for each score
  const qualityWidth = `${qualityScore}%`;
  const coverageWidth = `${coverageScore}%`;
  const freshnessWidth = `${freshnessScore}%`;

  return (
    <div className={`bg-white dark:bg-secondary-800 rounded-lg border border-secondary-200 dark:border-secondary-700 overflow-hidden ${className}`}>
      {/* Card Header */}
      <div className="px-6 py-4 border-b border-secondary-200 dark:border-secondary-700 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-secondary-900 dark:text-white flex items-center">
          <Shield className="w-5 h-5 mr-2 text-primary-600 dark:text-primary-400" />
          {title || 'Evidence Health'}
        </h3>
        <div className="flex items-center">
          <div className={`text-2xl font-bold ${getScoreColor(overallScore)}`}>
            {overallScore}%
          </div>
          <div className="ml-3 flex items-center">
            <TrendIcon className={`w-4 h-4 ${trendIndicator.color}`} />
            <span className={`text-xs ml-1 ${trendIndicator.color}`}>
              {trendIndicator.label}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* Score Gauge */}
        <div className="mb-6">
          <div className="h-4 bg-secondary-100 dark:bg-secondary-700 rounded-full overflow-hidden">
            <div 
              className={`h-full ${getScoreBgColor(overallScore)}`} 
              style={{ width: `${overallScore}%` }}
            ></div>
          </div>
          <div className="flex justify-between mt-1 text-xs text-secondary-500 dark:text-secondary-400">
            <span>Poor</span>
            <span>Good</span>
            <span>Excellent</span>
          </div>
        </div>

        {/* Score Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Quality Score */}
          <div className={`rounded-lg p-4 ${getScoreBgOpacity(qualityScore)}`}>
            <div className="flex items-center mb-2">
              <CheckCircle className={`w-5 h-5 mr-2 ${getScoreColor(qualityScore)}`} />
              <span className="text-sm font-medium text-secondary-900 dark:text-white">Quality</span>
              <span className={`ml-auto font-semibold ${getScoreColor(qualityScore)}`}>{qualityScore}%</span>
            </div>
            <div className="h-2 bg-secondary-100 dark:bg-secondary-700 rounded-full overflow-hidden">
              <div 
                className={`h-full ${getScoreBgColor(qualityScore)}`} 
                style={{ width: qualityWidth }}
              ></div>
            </div>
            <p className="mt-2 text-xs text-secondary-600 dark:text-secondary-400">
              {qualityScore >= 90 ? 'Excellent evidence quality with strong validation' :
               qualityScore >= 70 ? 'Good quality evidence with some validation gaps' :
               'Poor quality evidence needing improvement'}
            </p>
          </div>

          {/* Coverage Score */}
          <div className={`rounded-lg p-4 ${getScoreBgOpacity(coverageScore)}`}>
            <div className="flex items-center mb-2">
              <FileText className={`w-5 h-5 mr-2 ${getScoreColor(coverageScore)}`} />
              <span className="text-sm font-medium text-secondary-900 dark:text-white">Coverage</span>
              <span className={`ml-auto font-semibold ${getScoreColor(coverageScore)}`}>{coverageScore}%</span>
            </div>
            <div className="h-2 bg-secondary-100 dark:bg-secondary-700 rounded-full overflow-hidden">
              <div 
                className={`h-full ${getScoreBgColor(coverageScore)}`} 
                style={{ width: coverageWidth }}
              ></div>
            </div>
            <p className="mt-2 text-xs text-secondary-600 dark:text-secondary-400">
              {coverageScore >= 90 ? 'Comprehensive evidence coverage across all areas' :
               coverageScore >= 70 ? 'Good coverage with some evidence gaps' :
               'Significant evidence gaps requiring attention'}
            </p>
          </div>

          {/* Freshness Score */}
          <div className={`rounded-lg p-4 ${getScoreBgOpacity(freshnessScore)}`}>
            <div className="flex items-center mb-2">
              <Clock className={`w-5 h-5 mr-2 ${getScoreColor(freshnessScore)}`} />
              <span className="text-sm font-medium text-secondary-900 dark:text-white">Freshness</span>
              <span className={`ml-auto font-semibold ${getScoreColor(freshnessScore)}`}>{freshnessScore}%</span>
            </div>
            <div className="h-2 bg-secondary-100 dark:bg-secondary-700 rounded-full overflow-hidden">
              <div 
                className={`h-full ${getScoreBgColor(freshnessScore)}`} 
                style={{ width: freshnessWidth }}
              ></div>
            </div>
            <p className="mt-2 text-xs text-secondary-600 dark:text-secondary-400">
              {freshnessScore >= 90 ? 'Evidence is current and regularly updated' :
               freshnessScore >= 70 ? 'Most evidence is recent with some aging artifacts' :
               'Evidence is outdated and requires refreshing'}
            </p>
          </div>
        </div>

        {/* Detailed Metrics */}
        {detailedMetrics && detailedMetrics.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-secondary-900 dark:text-white mb-3">Detailed Metrics</h4>
            <div className="space-y-2">
              {detailedMetrics.map((metric, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    {metric.icon === 'alert' ? (
                      <AlertTriangle className="w-4 h-4 mr-2 text-status-warning" />
                    ) : metric.icon === 'success' ? (
                      <CheckCircle className="w-4 h-4 mr-2 text-status-success" />
                    ) : (
                      <Info className="w-4 h-4 mr-2 text-status-info" />
                    )}
                    <span className="text-secondary-700 dark:text-secondary-300">{metric.label}</span>
                  </div>
                  <span className={`font-medium ${
                    metric.status === 'good' ? 'text-status-success' :
                    metric.status === 'warning' ? 'text-status-warning' :
                    metric.status === 'error' ? 'text-status-error' :
                    'text-secondary-500 dark:text-secondary-400'
                  }`}>
                    {metric.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Impacted Areas */}
        {impactedAreas && impactedAreas.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-secondary-900 dark:text-white mb-3">Impacted Areas</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {impactedAreas.map((area, index) => (
                <div 
                  key={index}
                  className="flex items-center p-2 rounded-md bg-secondary-50 dark:bg-secondary-800/50 border border-secondary-200 dark:border-secondary-700"
                >
                  <div className={`w-2 h-2 rounded-full ${
                    area.impact === 'high' ? 'bg-status-error' :
                    area.impact === 'medium' ? 'bg-status-warning' :
                    'bg-status-success'
                  } mr-2`}></div>
                  <span className="text-sm text-secondary-700 dark:text-secondary-300">{area.name}</span>
                  <span className="text-xs text-secondary-500 dark:text-secondary-400 ml-auto">{area.count} items</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Card Footer */}
      {onViewDetails && (
        <div className="px-6 py-3 border-t border-secondary-200 dark:border-secondary-700">
          <button
            onClick={onViewDetails}
            className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 flex items-center transition-colors"
          >
            View detailed health report
            <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      )}
    </div>
  );
};

EvidenceHealthCard.propTypes = {
  /**
   * Card title
   */
  title: PropTypes.string,
  
  /**
   * Overall evidence health score (0-100)
   */
  overallScore: PropTypes.number.isRequired,
  
  /**
   * Evidence quality score (0-100)
   */
  qualityScore: PropTypes.number.isRequired,
  
  /**
   * Evidence coverage score (0-100)
   */
  coverageScore: PropTypes.number.isRequired,
  
  /**
   * Evidence freshness score (0-100)
   */
  freshnessScore: PropTypes.number.isRequired,
  
  /**
   * Trend percentage change (positive or negative)
   */
  trend: PropTypes.number,
  
  /**
   * Period for trend comparison (e.g., "month", "quarter")
   */
  trendPeriod: PropTypes.string,
  
  /**
   * Detailed metrics to display
   */
  detailedMetrics: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      icon: PropTypes.oneOf(['alert', 'success', 'info']),
      status: PropTypes.oneOf(['good', 'warning', 'error', 'neutral'])
    })
  ),
  
  /**
   * Areas impacted by evidence health
   */
  impactedAreas: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      count: PropTypes.number.isRequired,
      impact: PropTypes.oneOf(['high', 'medium', 'low'])
    })
  ),
  
  /**
   * Handler for viewing detailed health report
   */
  onViewDetails: PropTypes.func,
  
  /**
   * Additional CSS classes
   */
  className: PropTypes.string
};

EvidenceHealthCard.defaultProps = {
  title: 'Evidence Health',
  trend: 0,
  trendPeriod: 'month',
  className: ''
};

export default EvidenceHealthCard;
