import React, { useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Users, LayoutGrid, GanttChartSquare, Filter, ArrowDownUp, User, Briefcase, Calendar, Star, Flag } from 'lucide-react';
import Button from '../atoms/Button';
import Badge from '../atoms/Badge';
import { useRequirementsData } from '../../hooks/useRequirementsData';
import { useCapabilitiesData } from '../../hooks/useCapabilitiesData';
import LoadingSpinner from '../atoms/LoadingSpinner';
import ErrorDisplay from '../molecules/ErrorDisplay';

// --- Mock Data (to be replaced by hooks) ---
const mockTeams = [
  { id: 'team-sec', name: 'Security Team' },
  { id: 'team-net', name: 'Network Team' },
  { id: 'team-ops', name: 'Operations Team' },
];

const mockResources = [
  { id: 'user-1', name: 'Alex Johnson', role: 'Security Lead', teamId: 'team-sec', avatar: 'AJ', capacity: 40 },
  { id: 'user-2', name: 'Brenda Smith', role: 'Network Engineer', teamId: 'team-net', avatar: 'BS', capacity: 40 },
  { id: 'user-3', name: 'Charles Davis', role: 'Security Analyst', teamId: 'team-sec', avatar: 'CD', capacity: 40 },
  { id: 'user-4', name: 'Diana Miller', role: 'Operations Specialist', teamId: 'team-ops', avatar: 'DM', capacity: 32 },
  { id: 'user-5', name: 'Ethan Wilson', role: 'Junior Analyst', teamId: 'team-sec', avatar: 'EW', capacity: 40 },
];

// --- Reusable Molecules & Organisms (Internal to this page) ---

const FilterToolbar = ({ view, setView, sortConfig, setSortConfig, teamFilter, setTeamFilter }) => (
  <div className="dashboard-card p-4 mb-6">
    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">View:</span>
        <Button variant={view === 'swimlane' ? 'primary' : 'secondary'} size="sm" onClick={() => setView('swimlane')} leadingIcon={LayoutGrid}>Swimlane</Button>
        <Button variant={view === 'timeline' ? 'primary' : 'secondary'} size="sm" onClick={() => setView('timeline')} leadingIcon={GanttChartSquare}>Timeline</Button>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-secondary-500" />
          <select value={teamFilter} onChange={(e) => setTeamFilter(e.target.value)} className="w-full md:w-48 text-sm border-secondary-300 rounded-md dark:bg-secondary-800 dark:border-secondary-600">
            <option value="">All Teams</option>
            {mockTeams.map(team => <option key={team.id} value={team.id}>{team.name}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <ArrowDownUp className="w-5 h-5 text-secondary-500" />
          <select value={`${sortConfig.key}-${sortConfig.direction}`} onChange={(e) => {
            const [key, direction] = e.target.value.split('-');
            setSortConfig({ key, direction });
          }} className="w-full md:w-48 text-sm border-secondary-300 rounded-md dark:bg-secondary-800 dark:border-secondary-600">
            <option value="name-asc">Sort by Name (A-Z)</option>
            <option value="name-desc">Sort by Name (Z-A)</option>
            <option value="workload-desc">Sort by Workload (High-Low)</option>
            <option value="workload-asc">Sort by Workload (Low-High)</option>
          </select>
        </div>
      </div>
    </div>
  </div>
);

const TaskCard = ({ req }) => {
  const getPriorityVariant = (priority) => {
    if (priority === 'Critical') return 'error';
    if (priority === 'High') return 'warning';
    return 'default';
  };
  return (
    <div className="dashboard-card p-3 mb-2 border-l-4" style={{ borderColor: `var(--maturity-${req.maturityLevel.score})` }}>
      <div className="flex justify-between items-start">
        <p className="text-sm font-semibold text-secondary-800 dark:text-secondary-100 line-clamp-2">{req.description}</p>
        <Badge variant={getPriorityVariant(req.priority)}>{req.priority}</Badge>
      </div>
      <div className="flex items-center justify-between text-xs text-secondary-500 dark:text-secondary-400 mt-2">
        <div className="flex items-center gap-1"><Briefcase className="w-3 h-3" /><span>{req.capabilityId}</span></div>
        <div className="flex items-center gap-1"><Calendar className="w-3 h-3" /><span>{req.dueDate}</span></div>
      </div>
    </div>
  );
};

const ResourceLane = ({ resource, tasks }) => {
  const workload = useMemo(() => tasks.reduce((acc, task) => acc + (task.estimatedHours || 4), 0), [tasks]);
  const utilization = useMemo(() => (workload / resource.capacity) * 100, [workload, resource.capacity]);

  const getUtilizationColor = (u) => {
    if (u > 100) return 'bg-red-500';
    if (u > 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="flex-shrink-0 w-80 bg-secondary-50 dark:bg-secondary-900/50 rounded-lg p-3">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary-200 dark:bg-primary-500/30 flex items-center justify-center font-bold text-primary-700 dark:text-primary-200">{resource.avatar}</div>
          <div>
            <h4 className="font-bold text-secondary-900 dark:text-white">{resource.name}</h4>
            <p className="text-xs text-secondary-500 dark:text-secondary-400">{resource.role}</p>
          </div>
        </div>
        <Badge>{mockTeams.find(t => t.id === resource.teamId)?.name}</Badge>
      </div>
      <div className="mb-3">
        <div className="flex justify-between text-xs font-medium text-secondary-600 dark:text-secondary-300 mb-1">
          <span>Workload: {workload}h / {resource.capacity}h</span>
          <span>{utilization.toFixed(0)}%</span>
        </div>
        <div className="w-full bg-secondary-200 dark:bg-secondary-700 rounded-full h-2">
          <div className={`h-2 rounded-full ${getUtilizationColor(utilization)}`} style={{ width: `${Math.min(utilization, 100)}%` }}></div>
        </div>
      </div>
      <div className="h-[calc(100vh-28rem)] overflow-y-auto pr-1">
        {tasks.length > 0 ? tasks.map(req => <TaskCard key={req.id} req={req} />) : <p className="text-center text-sm text-secondary-500 pt-16">No tasks assigned.</p>}
      </div>
    </div>
  );
};

const SwimlaneView = ({ resources, requirements }) => (
  <div className="flex gap-4 overflow-x-auto pb-4">
    {resources.map(resource => (
      <ResourceLane
        key={resource.id}
        resource={resource}
        tasks={requirements.filter(req => req.assignee === resource.name)} // Simple name matching for mock
      />
    ))}
  </div>
);

const TimelineView = () => (
  <div className="dashboard-card flex items-center justify-center h-96 text-secondary-500">
    <div className="text-center">
      <GanttChartSquare className="w-12 h-12 mx-auto mb-4" />
      <h3 className="text-lg font-semibold">Timeline View</h3>
      <p>This feature is coming soon!</p>
    </div>
  </div>
);

// --- Main Page Component ---

const ResourcePlanningPage = () => {
  const [view, setView] = useState('swimlane');
  const [teamFilter, setTeamFilter] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });

  // Using real data hooks
  const { requirements, loading: reqsLoading, error: reqsError } = useRequirementsData();
  const { capabilities, loading: capsLoading, error: capsError } = useCapabilitiesData();

  const loading = reqsLoading || capsLoading;
  const error = reqsError || capsError;

  const filteredAndSortedResources = useMemo(() => {
    let resources = mockResources;
    if (teamFilter) {
      resources = resources.filter(r => r.teamId === teamFilter);
    }
    
    resources.sort((a, b) => {
      if (sortConfig.key === 'workload') {
        const workloadA = requirements.filter(r => r.assignee === a.name).length;
        const workloadB = requirements.filter(r => r.assignee === b.name).length;
        if (workloadA < workloadB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (workloadA > workloadB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      }
      // Default to name sort
      if (a.name < b.name) return sortConfig.direction === 'asc' ? -1 : 1;
      if (a.name > b.name) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return resources;
  }, [teamFilter, sortConfig, requirements]);

  if (loading) return <LoadingSpinner fullScreen message="Loading Resources and Requirements..." />;
  if (error) return <ErrorDisplay title="Failed to Load Data" message={error.message} />;

  return (
    <div className="fade-in h-full flex flex-col">
      <h1 className="text-2xl font-bold text-secondary-900 dark:text-white mb-2">Resource Planning</h1>
      <p className="text-secondary-500 dark:text-secondary-400 mb-6">Allocate resources, track workloads, and plan timelines for your security capabilities.</p>
      
      <FilterToolbar
        view={view}
        setView={setView}
        sortConfig={sortConfig}
        setSortConfig={setSortConfig}
        teamFilter={teamFilter}
        setTeamFilter={setTeamFilter}
      />

      <div className="flex-1 overflow-hidden">
        {view === 'swimlane' ? (
          <SwimlaneView resources={filteredAndSortedResources} requirements={requirements} />
        ) : (
          <TimelineView />
        )}
      </div>
    </div>
  );
};

export default ResourcePlanningPage;
