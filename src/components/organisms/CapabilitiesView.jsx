import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Network, Plus, ArrowRight, Star, DollarSign, CheckCircle, Clock, Target, TrendingUp } from 'lucide-react';
import Button from '../atoms/Button';
import Badge from '../atoms/Badge';

/**
 * SummaryStatCard Molecule
 * A reusable card for displaying a single key statistic in the header section.
 */
const SummaryStatCard = ({ icon: Icon, title, value, color }) => (
  <div className={`dashboard-card p-4 bg-gradient-to-r from-${color}-50 to-${color}-100 dark:from-${color}-500/10 dark:to-${color}-500/20`}>
    <div className="flex items-center justify-between">
      <div>
        <p className={`text-sm font-medium text-${color}-600 dark:text-${color}-300`}>{title}</p>
        <p className={`text-2xl font-bold text-${color}-900 dark:text-white`}>{value}</p>
      </div>
      <Icon className={`h-8 w-8 text-${color}-600 dark:text-${color}-400`} />
    </div>
  </div>
);

SummaryStatCard.propTypes = {
  icon: PropTypes.elementType.isRequired,
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  color: PropTypes.string,
};

SummaryStatCard.defaultProps = {
  color: 'primary',
};


/**
 * CapabilityCard Molecule
 * Displays a single capability with its progress and key metrics.
 */
const CapabilityCard = ({ capability, requirements, onSelect }) => {
  const metrics = useMemo(() => {
    const capabilityRequirements = requirements.filter(req => req.capabilityId === capability.id);
    const totalRequirements = capabilityRequirements.length;
    const completedRequirements = capabilityRequirements.filter(req => req.status === 'Completed').length;
    const completionRate = totalRequirements > 0 ? (completedRequirements / totalRequirements) * 100 : 0;
    return { totalRequirements, completedRequirements, completionRate };
  }, [capability.id, requirements]);

  const getStatusVariant = (status) => {
    switch (status) {
      case 'Completed': return 'success';
      case 'In Progress': return 'warning';
      case 'Planning': return 'info';
      case 'On Hold': return 'error';
      default: return 'default';
    }
  };

  return (
    <div
      className="dashboard-card p-6 group transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer border border-transparent hover:border-primary-500"
      onClick={() => onSelect(capability.id)}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect(capability.id)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-secondary-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-300 transition-colors truncate flex items-center">
            {capability.name}
            <ArrowRight className="h-4 w-4 ml-2 text-secondary-400 group-hover:text-primary-500 transition-all opacity-0 group-hover:opacity-100 group-hover:translate-x-1" />
          </h4>
          <span className="text-xs text-secondary-500 dark:text-secondary-400">{capability.id}</span>
        </div>
        <Badge variant={getStatusVariant(capability.status)}>{capability.status}</Badge>
      </div>

      {/* Description */}
      <p className="text-sm text-secondary-600 dark:text-secondary-300 mb-4 line-clamp-2 leading-relaxed">
        {capability.description}
      </p>

      {/* Progress Section */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1 text-sm">
          <span className="font-medium text-secondary-700 dark:text-secondary-200">Progress</span>
          <span className="font-bold text-secondary-900 dark:text-white">{metrics.completionRate.toFixed(0)}%</span>
        </div>
        <div className="w-full bg-secondary-200 dark:bg-secondary-700 rounded-full h-2">
          <div
            className="bg-primary-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${metrics.completionRate}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-secondary-500 dark:text-secondary-400 mt-1">
          <span>{metrics.completedRequirements} completed</span>
          <span>{metrics.totalRequirements} total</span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="bg-secondary-50 dark:bg-secondary-700/50 p-3 rounded-lg">
          <div className="flex items-center mb-1 text-xs text-secondary-500 dark:text-secondary-400">
            <Star className="h-3 w-3 text-yellow-500 mr-1.5" />
            <span>Business Value</span>
          </div>
          <span className="font-semibold text-secondary-900 dark:text-white">{capability.businessValue}/5.0</span>
        </div>
        <div className="bg-secondary-50 dark:bg-secondary-700/50 p-3 rounded-lg">
          <div className="flex items-center mb-1 text-xs text-secondary-500 dark:text-secondary-400">
            <DollarSign className="h-3 w-3 text-green-500 mr-1.5" />
            <span>Est. ROI</span>
          </div>
          <span className="font-semibold text-secondary-900 dark:text-white">{capability.estimatedROI}%</span>
        </div>
      </div>
    </div>
  );
};

CapabilityCard.propTypes = {
  capability: PropTypes.object.isRequired,
  requirements: PropTypes.array.isRequired,
  onSelect: PropTypes.func.isRequired,
};

/**
 * CapabilitiesView Organism Component
 * 
 * This is the main presentational component for displaying the list of capabilities.
 * It receives data and handlers from its parent page component.
 */
const CapabilitiesView = ({ capabilities, requirements, onSelectCapability, onCreateCapability }) => {
  const summaryStats = useMemo(() => {
    const completed = capabilities.filter(c => c.status === 'Completed').length;
    const inProgress = capabilities.filter(c => c.status === 'In Progress').length;
    const avgROI = capabilities.length > 0
      ? Math.round(capabilities.reduce((sum, c) => sum + (c.estimatedROI || 0), 0) / capabilities.length)
      : 0;
    
    return [
      { title: 'Total Capabilities', value: capabilities.length, icon: Network, color: 'blue' },
      { title: 'Completed', value: completed, icon: CheckCircle, color: 'green' },
      { title: 'In Progress', value: inProgress, icon: Clock, color: 'yellow' },
      { title: 'Avg. ROI', value: `${avgROI}%`, icon: TrendingUp, color: 'purple' },
    ];
  }, [capabilities]);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="dashboard-card p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between">
          <div className="mb-4 lg:mb-0">
            <h1 className="text-2xl font-bold text-secondary-900 dark:text-white flex items-center">
              <Network className="h-7 w-7 mr-3 text-primary-600" />
              OT Security Capabilities
            </h1>
            <p className="text-secondary-500 dark:text-secondary-400 mt-2">
              Browse, manage, and track the progress of your organization's security capabilities.
            </p>
          </div>
          <Button onClick={onCreateCapability} leadingIcon={Plus}>
            New Capability
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryStats.map(stat => (
          <SummaryStatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Capabilities Grid */}
      {capabilities.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {capabilities.map((capability) => (
            <CapabilityCard
              key={capability.id}
              capability={capability}
              requirements={requirements}
              onSelect={onSelectCapability}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-16 dashboard-card">
          <Network className="mx-auto h-12 w-12 text-secondary-400 mb-4" />
          <h3 className="text-lg font-medium text-secondary-900 dark:text-white mb-2">No Capabilities Found</h3>
          <p className="text-secondary-500 dark:text-secondary-400 mb-4">
            Get started by creating your first capability to organize your requirements.
          </p>
          <Button onClick={onCreateCapability} leadingIcon={Plus}>
            Create First Capability
          </Button>
        </div>
      )}
    </div>
  );
};

CapabilitiesView.propTypes = {
  capabilities: PropTypes.array.isRequired,
  requirements: PropTypes.array.isRequired,
  onSelectCapability: PropTypes.func.isRequired,
  onCreateCapability: PropTypes.func.isRequired,
};

export default CapabilitiesView;
