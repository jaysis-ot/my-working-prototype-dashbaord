import React, { useState, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Shield,
  AlertTriangle,
  TrendingUp,
  Globe,
  Activity,
  Search,
  ArrowLeft,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
  BarChart3,
  Database,
  ExternalLink
} from 'lucide-react';
import Button from '../atoms/Button';
import Badge from '../atoms/Badge';
import Input from '../atoms/Input';
import { Link as RouterLink } from 'react-router-dom';
import { useThreatIntelFeeds } from '../../hooks/useThreatIntelFeeds';

// --- Reusable Molecules (Internal to this Organism) ---

const StatCard = ({ title, value, change, icon: Icon, color }) => (
  <div className="dashboard-card p-4">
    <div className="flex items-center">
      <div className={`p-3 rounded-lg bg-${color}-100 dark:bg-${color}-500/20 mr-4`}>
        <Icon className={`h-6 w-6 text-${color}-600 dark:text-${color}-300`} />
      </div>
      <div>
        <p className="text-sm font-medium text-secondary-500 dark:text-secondary-400">{title}</p>
        <p className="text-2xl font-bold text-secondary-900 dark:text-white">{value}</p>
        {change && <p className="text-xs text-green-600 dark:text-green-400 mt-1">{change}</p>}
      </div>
    </div>
  </div>
);
StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  change: PropTypes.string,
  icon: PropTypes.elementType.isRequired,
  color: PropTypes.string,
};
StatCard.defaultProps = { color: 'primary' };

const ThreatCard = ({ threat }) => {
  const getSeverityBadgeVariant = (severity) => {
    switch (severity?.toUpperCase()) {
      case 'CRITICAL': return 'error';
      case 'HIGH': return 'warning';
      case 'MEDIUM': return 'info';
      case 'LOW': return 'success';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return <AlertTriangle className="h-5 w-5 text-status-error" />;
      case 'monitoring': return <Activity className="h-5 w-5 text-status-warning" />;
      case 'investigating': return <Clock className="h-5 w-5 text-status-info" />;
      case 'resolved': return <CheckCircle className="h-5 w-5 text-status-success" />;
      default: return <XCircle className="h-5 w-5 text-secondary-500" />;
    }
  };

  return (
    <div className="flex items-start space-x-4 p-4 bg-secondary-50 dark:bg-secondary-800/50 rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-700/50 transition-colors">
      <div className="flex-shrink-0 mt-1">{getStatusIcon(threat.status)}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h4 className="text-sm font-semibold text-secondary-900 dark:text-white truncate" title={threat.title}>
            {threat.title}
          </h4>
          <Badge variant={getSeverityBadgeVariant(threat.severity)}>{threat.severity}</Badge>
        </div>
        <p className="text-sm text-secondary-600 dark:text-secondary-300 mb-2 line-clamp-2">{threat.description}</p>
        <div className="flex items-center justify-between text-xs text-secondary-500 dark:text-secondary-400">
          <span>Source: {threat.source}</span>
          <span>Confidence: {threat.confidence?.toFixed(0)}%</span>
          <span>{new Date(threat.publishedDate).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
};
ThreatCard.propTypes = { threat: PropTypes.object.isRequired };

// --- Tab Content Components ---

const OverviewTab = ({ stats, recentThreats, onTabChange }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map(stat => <StatCard key={stat.title} {...stat} />)}
    </div>
    <div className="dashboard-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-secondary-900 dark:text-white">Recent High-Risk Threats</h3>
        <Button variant="secondary" size="sm" onClick={() => onTabChange('threats')} trailingIcon={ArrowLeft}>View All</Button>
      </div>
      <div className="space-y-4">
        {recentThreats.length > 0 ? (
          recentThreats.map(threat => <ThreatCard key={threat.id} threat={threat} />)
        ) : (
          <div className="text-center py-8 text-secondary-500">No high-risk threats detected recently.</div>
        )}
      </div>
    </div>
  </div>
);

const ThreatsListTab = ({ threats, onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch({ keywords: [searchTerm] });
  };
  
  return (
    <div className="dashboard-card p-6">
      <form onSubmit={handleSearch} className="flex items-center gap-4 mb-6">
        <Input
          placeholder="Search active threats..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          leadingIcon={Search}
          className="flex-grow"
        />
        <Button type="submit">Search</Button>
      </form>
      <div className="space-y-4">
        {threats.map(threat => <ThreatCard key={threat.id} threat={threat} />)}
      </div>
    </div>
  );
};

const IocsTableTab = ({ iocs }) => (
  <div className="dashboard-card overflow-hidden">
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-secondary-200 dark:divide-secondary-700">
        <thead className="bg-secondary-50 dark:bg-secondary-700/50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">Indicator</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">Type</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">Confidence</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">Reputation</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">First Seen</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-secondary-800 divide-y divide-secondary-200 dark:divide-secondary-700">
          {iocs.map(ioc => (
            <tr key={ioc.id} className="hover:bg-secondary-50 dark:hover:bg-secondary-700/50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-secondary-800 dark:text-secondary-200">{ioc.value}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm"><Badge>{ioc.type}</Badge></td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-600 dark:text-secondary-300">{ioc.confidence.toFixed(0)}%</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm"><Badge variant={ioc.reputation.category === 'malicious' ? 'error' : 'default'}>{ioc.reputation.category}</Badge></td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500 dark:text-secondary-400">{new Date(ioc.firstSeen).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const AnalyticsTab = () => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <div className="dashboard-card p-6">
      <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">Threat Trends (Last 30 Days)</h3>
      <div className="h-64 flex items-center justify-center text-secondary-500 bg-secondary-50 dark:bg-secondary-800/50 rounded-lg">
        <div className="text-center">
          <TrendingUp className="h-12 w-12 mx-auto mb-2" />
          <p>Trend chart coming soon</p>
        </div>
      </div>
    </div>
    <div className="dashboard-card p-6">
      <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">Risk Distribution</h3>
      <div className="h-64 flex items-center justify-center text-secondary-500 bg-secondary-50 dark:bg-secondary-800/50 rounded-lg">
        <div className="text-center">
          <BarChart3 className="h-12 w-12 mx-auto mb-2" />
          <p>Risk distribution chart coming soon</p>
        </div>
      </div>
    </div>
  </div>
);

const FeedsTab = ({ feeds, feedsLoading, feedsError }) => {
  const activeFeeds = feeds.filter(f => f.status === 'active');

  const getHealthIcon = (health) => {
    switch (health) {
      case 'healthy':
        return <CheckCircle className="w-4 h-4 text-status-success" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-status-error" />;
      default:
        return <Clock className="w-4 h-4 text-secondary-400" />;
    }
  };

  if (feedsLoading) {
    return (
      <div className="dashboard-card flex items-center justify-center py-12">
        <RefreshCw className="animate-spin w-6 h-6 text-primary-500 mr-2" />
        <span>Loading feeds…</span>
      </div>
    );
  }

  if (feedsError) {
    return (
      <div className="dashboard-card p-6 text-status-error">
        <AlertTriangle className="w-5 h-5 inline mr-2" />
        Failed to load feeds: {feedsError}
      </div>
    );
  }

  return (
    <div className="dashboard-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-secondary-900 dark:text-white">Active Intelligence Feeds</h3>
        {/* Link styled to look like a small secondary button */}
        <RouterLink
          to="/settings?tab=threat-intel"
          className="
            inline-flex items-center justify-center
            px-2.5 py-1.5 text-xs font-medium rounded-md
            bg-secondary-200 hover:bg-secondary-300
            text-secondary-900 focus:outline-none focus:ring-2
            focus:ring-offset-2 focus:ring-secondary-500
          "
        >
          Manage Feeds
        </RouterLink>
      </div>

      {activeFeeds.length === 0 ? (
        <p className="text-secondary-500 dark:text-secondary-400">No active feeds configured.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeFeeds.map(feed => (
            <div
              key={feed.id}
              className="p-4 bg-secondary-50 dark:bg-secondary-800/50 rounded-lg border border-secondary-200 dark:border-secondary-700 flex"
            >
              {/* logo */}
              <div className="w-10 h-10 flex-shrink-0 rounded-md overflow-hidden bg-white border border-secondary-200 dark:border-secondary-700 mr-4 flex items-center justify-center">
                {feed.logo ? (
                  <img src={feed.logo} alt="" className="w-full h-full object-contain" />
                ) : (
                  <Database className="w-6 h-6 text-primary-500" />
                )}
              </div>

              {/* info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-secondary-800 dark:text-white truncate">{feed.name}</h4>
                  {getHealthIcon(feed.healthStatus)}
                </div>
                <p className="text-xs text-secondary-500 dark:text-secondary-400 line-clamp-2">{feed.description}</p>
                <div className="flex items-center justify-between text-xs mt-2">
                  <span>{feed.updateFrequency}</span>
                  {feed.url && (
                    <a href={feed.url} target="_blank" rel="noopener noreferrer" className="text-primary-500 hover:underline">
                      <ExternalLink className="w-4 h-4 inline" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};


// --- Main Organism Component ---

const ThreatIntelligenceView = ({
  threats,
  iocs,
  statistics,
  loading,
  onNavigateBack,
  onRefresh,
  onSearch,
}) => {
  /* ------------------------------------------------------------------
   * Threat-intel feeds state (centralised via custom hook)
   * ---------------------------------------------------------------- */
  const {
    feeds = [],
    activeFeeds = [],
    loading: feedsLoading,
    error: feedsError,
  } = useThreatIntelFeeds();

  /* ------------------------------------------------------------------
   * Basic side-effect: log feed hook errors (prevents silent failures)
   * ---------------------------------------------------------------- */
  useEffect(() => {
    if (feedsError) {
      // eslint-disable-next-line no-console
      console.error('Threat Intel Feeds Error:', feedsError);
    }
  }, [feedsError]);

  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', name: 'Overview', icon: TrendingUp },
    { id: 'threats', name: 'Active Threats', icon: AlertTriangle, badge: threats.length },
    { id: 'iocs', name: 'Indicators', icon: Globe, badge: iocs.length },
    { id: 'analytics', name: 'Analytics', icon: BarChart3 },
    { id: 'feeds', name: 'Intel Feeds', icon: Database, badge: activeFeeds.length },
  ];

  const summaryStats = useMemo(() => [
    { title: 'Total Threats', value: statistics.totalThreats, change: `+${statistics.newThreats} new`, icon: Shield, color: 'red' },
    { title: 'High-Risk Threats', value: statistics.highRiskThreats, icon: AlertTriangle, color: 'orange' },
    { title: 'IOCs Tracked', value: iocs.length, icon: Globe, color: 'blue' },
    { title: 'System Health', value: 'Online', icon: Activity, color: 'green' },
  ], [statistics, iocs.length]);

  const recentHighRiskThreats = useMemo(() => 
    threats.filter(t => ['High', 'Critical'].includes(t.severity)).slice(0, 5),
    [threats]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="dashboard-card p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            <Button variant="ghost" size="sm" onClick={onNavigateBack} className="mr-2 p-2"><ArrowLeft className="w-5 h-5" /></Button>
            <div>
              <h1 className="text-2xl font-bold text-secondary-900 dark:text-white flex items-center">
                <Shield className="h-7 w-7 mr-3 text-primary-600" />
                Threat Intelligence
              </h1>
              <p className="text-secondary-500 dark:text-secondary-400 mt-1">
                Real-time threat monitoring and risk assessment.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-secondary-500 hidden md:inline">
              Last update: {statistics.lastUpdate ? new Date(statistics.lastUpdate).toLocaleTimeString() : 'N/A'}
            </span>
            <Button onClick={onRefresh} loading={loading} variant="secondary" leadingIcon={RefreshCw}>
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-secondary-200 dark:border-secondary-700">
        <nav className="-mb-px flex space-x-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center py-3 px-1 border-b-2 font-semibold text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600 dark:text-primary-300'
                  : 'border-transparent text-secondary-500 hover:text-secondary-700 dark:hover:text-secondary-200'
              }`}
            >
              <tab.icon className="h-5 w-5 mr-2" />
              {tab.name}
              {tab.badge !== undefined && (
                <Badge variant="default" size="sm" className="ml-2">{tab.badge}</Badge>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && <OverviewTab stats={summaryStats} recentThreats={recentHighRiskThreats} onTabChange={setActiveTab} />}
        {activeTab === 'threats' && <ThreatsListTab threats={threats} onSearch={onSearch} />}
        {activeTab === 'iocs' && <IocsTableTab iocs={iocs} />}
        {activeTab === 'analytics' && <AnalyticsTab />}
        {activeTab === 'feeds' && (
          <FeedsTab feeds={feeds} feedsLoading={feedsLoading} feedsError={feedsError} />
        )}
      </div>
    </div>
  );
};

ThreatIntelligenceView.propTypes = {
  threats: PropTypes.array.isRequired,
  iocs: PropTypes.array.isRequired,
  statistics: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired,
  onNavigateBack: PropTypes.func.isRequired,
  onRefresh: PropTypes.func.isRequired,
  onSearch: PropTypes.func.isRequired,
};

export default ThreatIntelligenceView;
