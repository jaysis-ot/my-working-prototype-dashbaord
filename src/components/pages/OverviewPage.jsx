import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Shield, FileText, AlertTriangle, CheckSquare, TrendingUp, Users, Target } from 'lucide-react';
import Badge from '../atoms/Badge';
import CircularProgress from '../atoms/CircularProgress';
import { calculateOverallCompletion as isoOverall } from '../standards/iso27001Data';
import { getCountsForCategories as soc2Counts } from '../standards/soc2Data';
import { getOverallProgress as cafOverall } from '../standards/ncscCafData';
import { getAllSubcategories } from '../../shared/components/standards/nistCsfData';

/**
 * StatCard Molecule Component
 * A reusable card for displaying key statistics on the dashboard.
 */
const StatCard = ({ icon: Icon, title, value, change, changeType }) => {
  const changeColor = changeType === 'positive' ? 'text-status-success' : 'text-status-error';

  return (
    <div className="dashboard-card p-4 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">{title}</h3>
        <Icon className="w-6 h-6 text-secondary-400 dark:text-secondary-500" />
      </div>
      <div>
        <p className="text-3xl font-semibold text-secondary-900 dark:text-white">{value}</p>
        {change && (
          <div className={`text-sm flex items-center mt-1 ${changeColor}`}>
            <TrendingUp size={16} className="mr-1" />
            <span>{change}</span>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * TrustScore Component
 * A dedicated component to visualize the main Trust Score.
 */
const TrustScore = ({ score, delta }) => {
  const getScoreColor = (s) => {
    if (s >= 85) return 'text-status-success';
    if (s >= 70) return 'text-status-warning';
    return 'text-status-error';
  };

  return (
    <div className="dashboard-card items-center justify-center text-center p-6 flex flex-col">
      <h3 className="text-sm font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider mb-2">Overall Trust Score</h3>
      <div className="relative w-32 h-32">
        <svg className="w-full h-full" viewBox="0 0 36 36">
          <path
            className="text-secondary-200 dark:text-secondary-700"
            d="M18 2.0845
              a 15.9155 15.9155 0 0 1 0 31.831
              a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
          />
          <path
            className={getScoreColor(score)}
            d="M18 2.0845
              a 15.9155 15.9155 0 0 1 0 31.831
              a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeDasharray={`${score}, 100`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-4xl font-bold ${getScoreColor(score)}`}>{score}</span>
        </div>
      </div>
      <div className="mt-3">
        <Badge variant={delta >= 0 ? 'success' : 'error'} size="lg">
          {delta >= 0 ? `+${delta}` : delta} Δ vs last period
        </Badge>
      </div>
    </div>
  );
};

/**
 * OverviewPage Component
 * 
 * This page serves as the main dashboard overview, providing a high-level summary
 * of the organization's GRC and Trust posture. It assembles various molecules
 * and organisms to present key metrics and visualizations.
 */
const OverviewPage = () => {
  // Mock data - will be replaced with data from contexts
  const stats = [
    { title: 'Total Requirements', value: '1,287', icon: FileText, change: '+23 this week', changeType: 'positive' },
    { title: 'Capabilities', value: '42', icon: Shield, change: '+2 this month', changeType: 'positive' },
    { title: 'Active Risks', value: '18', icon: AlertTriangle, change: '-3 this week', changeType: 'positive' },
    { title: 'Compliance Status', value: '92%', icon: CheckSquare, change: '+1.5%', changeType: 'positive' },
  ];

  const trustData = {
    score: 78,
    delta: -3,
    pillars: [
      { name: 'Governance', score: 85, color: 'bg-governance' },
      { name: 'Risk Management', score: 70, color: 'bg-risk' },
      { name: 'Compliance', score: 92, color: 'bg-compliance' },
    ],
  };

  const requirementsByStatus = [
    { name: 'Not Started', count: 300, fill: '#a855f7' },
    { name: 'In Progress', count: 450, fill: '#f59e0b' },
    { name: 'Completed', count: 537, fill: '#10b981' },
  ];

  const highPriorityItems = [
    { id: 'REQ-001', description: 'Implement MFA for all critical systems', type: 'Requirement', priority: 'High' },
    { id: 'RISK-005', description: 'Unpatched vulnerability in web server', type: 'Risk', priority: 'Critical' },
    { id: 'CAP-012', description: 'Develop incident response plan', type: 'Capability', priority: 'High' },
  ];

  const frameworkSummary = React.useMemo(() => {
    const get = (k) => {
      try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch { return null; }
    };

    // ISO 27001
    const iso = get('cyberTrustDashboard.iso27001Assessment');
    const isoPct = iso ? (isoOverall(iso).completion || 0) : 0;

    // SOC 2
    const soc2Saved = get('cyberTrustDashboard.soc2Assessment');
    const soc2Assessment = soc2Saved?.assessment || {};
    const soc2Selected = soc2Saved?.selectedCategories || ['security'];
    const soc2Pct = soc2Counts(soc2Assessment, soc2Selected).completionPct || 0;

    // NCSC CAF
    const caf = get('cyberTrustDashboard.ncscCafAssessment');
    const cafPct = caf ? (cafOverall(caf).completionPct || 0) : 0;

    // NIST CSF
    const nist = get('cyberTrustDashboard.nistCsfAssessment') || {};
    const subs = getAllSubcategories();
    const values = { Yes: 1, Partial: 0.5, No: 0, 'N/A': 0 };
    let score = 0;
    subs.forEach(sub => { const r = nist[sub.id]; if (r) score += (values[r] ?? 0); });
    const nistPct = subs.length ? (score / subs.length) * 100 : 0;

    return {
      iso: isoPct,
      soc2: soc2Pct,
      caf: cafPct,
      nist: nistPct,
      started: [isoPct, soc2Pct, cafPct, nistPct].filter(v => v > 0).length,
    };
  }, []);

  const capabilitiesSummary = React.useMemo(() => {
    try {
      const list = JSON.parse(localStorage.getItem('cyberTrust_capabilities') || '[]');
      return { count: Array.isArray(list) ? list.length : 0 };
    } catch { return { count: 0 }; }
  }, []);

  const businessPlanSummary = React.useMemo(() => {
    // Mirror the two sample plans used on BusinessPlanPage
    const plans = [
      { id: 'BP-NS-001', budget: 750000, timelineMonths: 18 },
      { id: 'BP-IAM-002', budget: 420000, timelineMonths: 12 },
    ];
    const totalBudget = plans.reduce((s,p)=> s+p.budget, 0);
    const minMonths = Math.min(...plans.map(p=>p.timelineMonths));
    const maxMonths = Math.max(...plans.map(p=>p.timelineMonths));
    return { count: plans.length, totalBudget, minMonths, maxMonths };
  }, []);

  const incidentsSummary = React.useMemo(() => {
    // If a future incidents store exists, read it; else show zeros
    try {
      const store = JSON.parse(localStorage.getItem('cyberTrust_incidents') || '[]');
      const total = Array.isArray(store) ? store.length : 0;
      const open = Array.isArray(store) ? store.filter(i => i.status && i.status !== 'RESOLVED' && i.status !== 'CLOSED').length : 0;
      const critical = Array.isArray(store) ? store.filter(i => i.severity === 'CRITICAL').length : 0;
      return { total, open, critical };
    } catch { return { total: 0, open: 0, critical: 0 }; }
  }, []);

  return (
    <div className="fade-in space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">Dashboard Overview</h1>
        <p className="text-secondary-500 dark:text-secondary-400">Welcome back! Here's a summary of your organization's trust posture.</p>
      </div>

      {/* Overview Widgets */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Frameworks card */}
        <div className="dashboard-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-secondary-800 dark:text-secondary-200">Frameworks</h3>
            <span className="text-xs text-secondary-500">{frameworkSummary.started}/4 started</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <CircularProgress value={frameworkSummary.nist} size={52} />
              <div>
                <p className="text-sm font-medium">NIST CSF</p>
                <p className="text-xs text-secondary-500">{frameworkSummary.nist.toFixed(0)}%</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CircularProgress value={frameworkSummary.iso} size={52} />
              <div>
                <p className="text-sm font-medium">ISO 27001</p>
                <p className="text-xs text-secondary-500">{frameworkSummary.iso.toFixed(0)}%</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CircularProgress value={frameworkSummary.soc2} size={52} />
              <div>
                <p className="text-sm font-medium">SOC 2</p>
                <p className="text-xs text-secondary-500">{frameworkSummary.soc2.toFixed(0)}%</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CircularProgress value={frameworkSummary.caf} size={52} />
              <div>
                <p className="text-sm font-medium">NCSC CAF</p>
                <p className="text-xs text-secondary-500">{frameworkSummary.caf.toFixed(0)}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Capabilities card */}
        <div className="dashboard-card p-4">
          <h3 className="font-semibold text-secondary-800 dark:text-secondary-200 mb-3">Capabilities</h3>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-3xl font-bold">{capabilitiesSummary.count}</p>
              <p className="text-xs text-secondary-500">Total defined</p>
            </div>
            <div className="text-right">
              <a href="/dashboard/capabilities" className="text-xs text-blue-600 hover:underline">Open</a>
            </div>
          </div>
        </div>

        {/* Incidents card */}
        <div className="dashboard-card p-4">
          <h3 className="font-semibold text-secondary-800 dark:text-secondary-200 mb-3">Incidents (Last 30 days)</h3>
          <div className="flex items-center justify-between text-sm">
            <div><span className="font-semibold">Open:</span> {incidentsSummary.open}</div>
            <div><span className="font-semibold">Critical:</span> {incidentsSummary.critical}</div>
            <div><span className="font-semibold">Total:</span> {incidentsSummary.total}</div>
          </div>
        </div>

        {/* Business Plans card */}
        <div className="dashboard-card p-4">
          <h3 className="font-semibold text-secondary-800 dark:text-secondary-200 mb-3">Business Plans</h3>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-3xl font-bold">{businessPlanSummary.count}</p>
              <p className="text-xs text-secondary-500">Active plans</p>
            </div>
            <div className="text-right text-sm">
              <div className="font-semibold">£{(businessPlanSummary.totalBudget/1000).toFixed(0)}k</div>
              <div className="text-xs text-secondary-500">{businessPlanSummary.minMonths}–{businessPlanSummary.maxMonths} months</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Trust Score Section (Left) */}
        <div className="lg:col-span-1 space-y-6">
          <TrustScore score={trustData.score} delta={trustData.delta} />
          <div className="dashboard-card p-4">
            <h3 className="font-semibold mb-3 text-secondary-800 dark:text-secondary-200">Trust Pillar Scores</h3>
            <div className="space-y-3">
              {trustData.pillars.map(pillar => (
                <div key={pillar.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-secondary-600 dark:text-secondary-300">{pillar.name}</span>
                    <span className="font-semibold text-secondary-800 dark:text-secondary-100">{pillar.score}/100</span>
                  </div>
                  <div className="w-full bg-secondary-200 dark:bg-secondary-700 rounded-full h-2.5">
                    <div className={`${pillar.color} h-2.5 rounded-full`} style={{ width: `${pillar.score}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Charts and Lists Section (Right) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="dashboard-card p-4">
            <h3 className="font-semibold mb-4 text-secondary-800 dark:text-secondary-200">Requirements by Status</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={requirementsByStatus} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                <XAxis dataKey="name" tick={{ fill: 'var(--color-text-secondary)' }} fontSize={12} />
                <YAxis tick={{ fill: 'var(--color-text-secondary)' }} fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-card)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-primary)'
                  }}
                />
                <Bar dataKey="count" fill="#0073e6" barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="dashboard-card p-4">
            <h3 className="font-semibold mb-3 text-secondary-800 dark:text-secondary-200">High-Priority Items</h3>
            <ul className="divide-y divide-secondary-200 dark:divide-secondary-700">
              {highPriorityItems.map(item => (
                <li key={item.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-secondary-800 dark:text-white">{item.description}</p>
                    <p className="text-xs text-secondary-500 dark:text-secondary-400">{item.id}</p>
                  </div>
                  <Badge variant={item.priority === 'Critical' ? 'error' : 'warning'}>{item.priority}</Badge>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewPage;
