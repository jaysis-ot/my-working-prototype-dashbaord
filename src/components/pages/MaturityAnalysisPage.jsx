import React, { useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Cell,
} from 'recharts';
import { TrendingUp, Gauge, Target, Lightbulb, Filter, Eye } from 'lucide-react';

import { useRequirementsData } from '../../hooks/useRequirementsData';
import { useAnalytics } from '../../hooks/useAnalytics';
import LoadingSpinner from '../atoms/LoadingSpinner';
import ErrorDisplay from '../molecules/ErrorDisplay';
import Button from '../atoms/Button';

// --- Internal Reusable Components (Molecules) ---

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="dashboard-card p-4 flex items-center gap-4">
    <div className={`p-3 rounded-lg bg-${color}-100 dark:bg-${color}-500/20`}>
      <Icon className={`h-6 w-6 text-${color}-600 dark:text-${color}-300`} />
    </div>
    <div>
      <p className="text-sm font-medium text-secondary-500 dark:text-secondary-400">{title}</p>
      <p className="text-2xl font-bold text-secondary-900 dark:text-white">{value}</p>
    </div>
  </div>
);
StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.elementType.isRequired,
  color: PropTypes.string,
};
StatCard.defaultProps = { color: 'primary' };

const ChartContainer = ({ title, children, description }) => (
  <div className="dashboard-card h-96 flex flex-col">
    <div className="p-4 border-b border-secondary-200 dark:border-secondary-700">
      <h3 className="font-semibold text-secondary-900 dark:text-white">{title}</h3>
      {description && <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-1">{description}</p>}
    </div>
    <div className="flex-grow p-4">
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  </div>
);
ChartContainer.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  description: PropTypes.string,
};

// --- Main Page Component ---

const MaturityAnalysisPage = () => {
  const { requirements, loading: reqsLoading, error: reqsError } = useRequirementsData();
  const analyticsData = useAnalytics(requirements);
  const [selectedLevel, setSelectedLevel] = useState('all');

  const handleFilterChange = useCallback((level) => {
    setSelectedLevel(level);
  }, []);

  const filteredRequirements = useMemo(() => {
    if (selectedLevel === 'all') {
      return []; // Don't show any by default, only on filter selection
    }
    if (selectedLevel === 'improvement') {
        return requirements.filter(r => 
            (r.maturityLevel?.score || 0) <= 2 && (r.businessValueScore || 0) >= 4
        );
    }
    return requirements.filter(req => req.maturityLevel?.level === selectedLevel);
  }, [requirements, selectedLevel]);

  const loading = reqsLoading;
  const error = reqsError;

  const COLORS = {
    Initial: '#ef4444',
    Developing: '#f97316',
    Defined: '#eab308',
    Managed: '#3b82f6',
    Optimizing: '#10b981',
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Analyzing Maturity Data..." />;
  }

  if (error) {
    return <ErrorDisplay title="Failed to Load Maturity Analysis" message={error.message} />;
  }

  return (
    <div className="fade-in space-y-6">
      {/* Header */}
      <h1 className="text-2xl font-bold text-secondary-900 dark:text-white flex items-center">
        <Gauge className="w-7 h-7 mr-3 text-primary-600" />
        Maturity Analysis
      </h1>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Avg. Maturity Score" value={analyticsData.overallStats.avgMaturityScore.toFixed(2)} icon={TrendingUp} color="green" />
        <StatCard title="Total Assessed" value={analyticsData.overallStats.totalRequirements} icon={Target} color="blue" />
        <StatCard title="Improvement Opportunities" value={analyticsData.improvementOpportunities} icon={Lightbulb} color="yellow" />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartContainer title="Maturity Level Distribution" description="Number of requirements at each maturity level.">
          <BarChart data={analyticsData.maturityData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
            <XAxis dataKey="name" tick={{ fill: 'var(--color-text-secondary)' }} fontSize={12} />
            <YAxis tick={{ fill: 'var(--color-text-secondary)' }} fontSize={12} />
            <Tooltip contentStyle={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }} />
            <Bar dataKey="count" name="Requirements">
              {analyticsData.maturityData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#8884d8'} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>

        <ChartContainer title="Maturity by Category" description="Average maturity score for the top requirement categories.">
          <RadarChart data={analyticsData.categoryAnalysis}>
            <PolarGrid stroke="rgba(128, 128, 128, 0.2)" />
            <PolarAngleAxis dataKey="name" tick={{ fill: 'var(--color-text-secondary)' }} fontSize={12} />
            <PolarRadiusAxis angle={30} domain={[0, 5]} tick={{ fill: 'var(--color-text-secondary)' }} fontSize={10} />
            <Radar name="Maturity" dataKey="avgMaturityScore" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
            <Tooltip contentStyle={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }} />
          </RadarChart>
        </ChartContainer>
      </div>

      {/* Drill-down Section */}
      <div className="dashboard-card p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h3 className="font-semibold text-lg">Drill-Down into Requirements</h3>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-secondary-500" />
            <span className="text-sm font-medium">Filter by:</span>
            <select
              value={selectedLevel}
              onChange={e => handleFilterChange(e.target.value)}
              className="w-full md:w-auto text-sm border-secondary-300 rounded-md dark:bg-secondary-800 dark:border-secondary-600"
            >
              <option value="all">Select a Level</option>
              {Object.keys(COLORS).map(level => <option key={level} value={level}>{level}</option>)}
              <option value="improvement">Improvement Opportunities</option>
            </select>
          </div>
        </div>
        
        {selectedLevel !== 'all' && (
          <div className="mt-4 border-t border-secondary-200 dark:border-secondary-700 pt-4">
            <h4 className="font-semibold mb-2">
              {filteredRequirements.length} Requirements Found for "{selectedLevel}"
            </h4>
            <div className="max-h-96 overflow-y-auto pr-2">
              <ul className="divide-y divide-secondary-100 dark:divide-secondary-700">
                {filteredRequirements.map(req => (
                  <li key={req.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-mono text-xs text-primary-600">{req.id}</p>
                      <p className="text-sm font-medium text-secondary-800 dark:text-white">{req.description}</p>
                    </div>
                    <Button size="sm" variant="ghost" title="View Requirement">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MaturityAnalysisPage;
