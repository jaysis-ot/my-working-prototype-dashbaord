import React, { useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, ScatterChart, Scatter, RadarChart, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  ShieldCheck,
  Download,
  Filter,
  Star,
} from 'lucide-react';

import { useRequirementsData } from '../../hooks/useRequirementsData';
import { useAnalytics } from '../../hooks/useAnalytics';
import { useCapabilitiesData } from '../../hooks/useCapabilitiesData';

import LoadingSpinner from '../atoms/LoadingSpinner';
import ErrorDisplay from '../molecules/ErrorDisplay';
import Button from '../atoms/Button';
import Badge from '../atoms/Badge';

// --- Internal Reusable Components (Molecules/Organisms) ---

/**
 * A reusable card for displaying a single key statistic.
 */
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

/**
 * A wrapper for charts to provide a consistent header and style.
 */
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

const AnalyticsPage = () => {
  const { requirements, loading: reqsLoading, error: reqsError } = useRequirementsData();
  const { capabilities, loading: capsLoading, error: capsError } = useCapabilitiesData();

  // Local filters for this page
  const [filters, setFilters] = useState({
    capabilityId: 'all',
    priority: 'all',
  });

  const handleFilterChange = useCallback((filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  }, []);

  // Memoize filtered requirements to avoid re-calculating on every render
  const filteredRequirements = useMemo(() => {
    return requirements.filter(req => {
      const capabilityMatch = filters.capabilityId === 'all' || req.capabilityId === filters.capabilityId;
      const priorityMatch = filters.priority === 'all' || req.priority === filters.priority;
      return capabilityMatch && priorityMatch;
    });
  }, [requirements, filters]);

  // Get processed analytics data from our custom hook
  const analyticsData = useAnalytics(filteredRequirements);

  const loading = reqsLoading || capsLoading;
  const error = reqsError || capsError;

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading Analytics Data..." />;
  }

  if (error) {
    return <ErrorDisplay title="Failed to Load Analytics" message={error.message} />;
  }

  // If there are no requirements after filters, show friendly empty state
  if (analyticsData.overallStats.totalRequirements === 0) {
    return (
      <div className="fade-in">
        <div className="dashboard-card p-8 text-center">
          <h2 className="text-xl font-bold text-secondary-900 dark:text-white mb-2">
            No Requirements Found
          </h2>
          <p className="text-secondary-500 dark:text-secondary-400">
            Adjust your filters or import requirements to see analytics.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-white flex items-center">
            <BarChart3 className="w-7 h-7 mr-3 text-primary-600" />
            Analytics Dashboard
          </h1>
          <p className="text-secondary-500 dark:text-secondary-400 mt-1">
            Visualize requirement data to derive insights and track progress.
          </p>
        </div>
        <Button leadingIcon={Download}>Export Report</Button>
      </div>

      {/* Filters */}
      <div className="dashboard-card p-4">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <Filter className="w-5 h-5 text-secondary-500" />
          <h3 className="font-semibold text-sm">Filters:</h3>
          <select value={filters.capabilityId} onChange={e => handleFilterChange('capabilityId', e.target.value)} className="w-full md:w-auto text-sm border-secondary-300 rounded-md dark:bg-secondary-800 dark:border-secondary-600">
            <option value="all">All Capabilities</option>
            {capabilities.map(cap => <option key={cap.id} value={cap.id}>{cap.name}</option>)}
          </select>
          <select value={filters.priority} onChange={e => handleFilterChange('priority', e.target.value)} className="w-full md:w-auto text-sm border-secondary-300 rounded-md dark:bg-secondary-800 dark:border-secondary-600">
            <option value="all">All Priorities</option>
            {['Critical', 'High', 'Medium', 'Low'].map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Requirements" value={analyticsData.overallStats.totalRequirements} icon={ShieldCheck} color="blue" />
        <StatCard title="Avg. Business Value" value={analyticsData.overallStats.avgBusinessValue.toFixed(2)} icon={Star} color="yellow" />
        <StatCard title="Avg. Maturity Score" value={analyticsData.overallStats.avgMaturityScore.toFixed(2)} icon={TrendingUp} color="green" />
        <StatCard title="Total Est. Cost" value={`£${(analyticsData.overallStats.totalCost / 1000).toFixed(0)}k`} icon={DollarSign} color="purple" />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartContainer title="Requirements by Status" description="Distribution of requirements across their current lifecycle status.">
          <BarChart data={analyticsData.statusData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
            <XAxis dataKey="name" tick={{ fill: 'var(--color-text-secondary)' }} fontSize={12} />
            <YAxis tick={{ fill: 'var(--color-text-secondary)' }} fontSize={12} />
            <Tooltip contentStyle={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }} />
            <Bar dataKey="count" fill="#8884d8" />
          </BarChart>
        </ChartContainer>

        <ChartContainer title="Requirements by Priority" description="Proportion of requirements based on their assigned priority level.">
          <PieChart>
            <Pie data={analyticsData.priorityData} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
              {analyticsData.priorityData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }} />
            <Legend />
          </PieChart>
        </ChartContainer>

        <ChartContainer title="Business Value vs. Cost" description="Identify high-value, low-cost requirements (cost shown in thousands).">
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid stroke="rgba(128, 128, 128, 0.2)" />
            <XAxis type="number" dataKey="cost" name="Cost (£k)" unit="k" tick={{ fill: 'var(--color-text-secondary)' }} fontSize={12} />
            <YAxis type="number" dataKey="businessValue" name="Business Value" unit="/5" domain={[0, 5]} tick={{ fill: 'var(--color-text-secondary)' }} fontSize={12} />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }} />
            <Scatter name="Requirements" data={analyticsData.businessValueData} fill="#8884d8" />
          </ScatterChart>
        </ChartContainer>

        <ChartContainer title="Category Maturity Analysis" description="Average maturity score for each requirement category.">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={analyticsData.categoryAnalysis}>
            <PolarGrid stroke="rgba(128, 128, 128, 0.2)" />
            <PolarAngleAxis dataKey="name" tick={{ fill: 'var(--color-text-secondary)' }} fontSize={12} />
            <PolarRadiusAxis angle={30} domain={[0, 5]} tick={{ fill: 'var(--color-text-secondary)' }} fontSize={10} />
            <Radar name="Maturity" dataKey="avgMaturityScore" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
            <Tooltip contentStyle={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }} />
          </RadarChart>
        </ChartContainer>
      </div>
    </div>
  );
};

export default AnalyticsPage;
