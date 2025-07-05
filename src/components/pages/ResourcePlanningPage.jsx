import React, { useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  Users,
  LayoutGrid,
  GanttChartSquare,
  Filter,
  ArrowDownUp,
  Briefcase,
  Calendar,
  Search,
  Mail,
  Phone,
  Factory,
  BookUser,
  MapPin,
  CheckCircle,
  AlertTriangle,
  Plus,
  X,
  Save,
  ClipboardList,
  Clock,
  CalendarDays,
} from 'lucide-react';
import Button from '../atoms/Button';
import Badge from '../atoms/Badge';
import { useRequirementsData } from '../../hooks/useRequirementsData';
import { useCapabilitiesData } from '../../hooks/useCapabilitiesData';
import LoadingSpinner from '../atoms/LoadingSpinner';
import ErrorDisplay from '../molecules/ErrorDisplay';
import Input from '../atoms/Input';

// --- Mock Data (to be replaced by hooks) ---
const mockTeams = [
  { id: 'team-sec', name: 'Security Team' },
  { id: 'team-net', name: 'Network Team' },
  { id: 'team-ops', name: 'Operations Team' },
];

const mockResources = [
  {
    id: 'user-1',
    name: 'Alex Johnson',
    role: 'Security Lead',
    teamId: 'team-sec',
    avatar: 'AJ',
    capacity: 40,
    company: 'Cyber Solutions Inc.',
    jobTitle: 'Security Lead',
    department: 'IT Security',
    location: 'London, UK',
    email: 'alex.j@corp.local',
    phone: '+44 20 7946 0100',
  },
  {
    id: 'user-2',
    name: 'Brenda Smith',
    role: 'Network Engineer',
    teamId: 'team-net',
    avatar: 'BS',
    capacity: 40,
    company: 'Cyber Solutions Inc.',
    jobTitle: 'Network Engineer',
    department: 'Engineering',
    location: 'Manchester, UK',
    email: 'brenda.s@corp.local',
    phone: '+44 161 496 0101',
  },
  {
    id: 'user-3',
    name: 'Charles Davis',
    role: 'Security Analyst',
    teamId: 'team-sec',
    avatar: 'CD',
    capacity: 40,
    company: 'Cyber Solutions Inc.',
    jobTitle: 'Security Analyst',
    department: 'IT Security',
    location: 'London, UK',
    email: 'charles.d@corp.local',
    phone: '+44 20 7946 0959',
  },
  {
    id: 'user-4',
    name: 'Diana Miller',
    role: 'Operations Specialist',
    teamId: 'team-ops',
    avatar: 'DM',
    capacity: 32,
    company: 'Cyber Solutions Inc.',
    jobTitle: 'OT Specialist',
    department: 'Operations',
    location: 'Plant Floor',
    email: 'diana.m@corp.local',
    phone: '+44 161 496 0102',
  },
  {
    id: 'user-5',
    name: 'Ethan Wilson',
    role: 'Junior Analyst',
    teamId: 'team-sec',
    avatar: 'EW',
    capacity: 40,
    company: 'Cyber Solutions Inc.',
    jobTitle: 'Junior Analyst',
    department: 'IT Security',
    location: 'Remote',
    email: 'ethan.w@corp.local',
    phone: '+44 20 7946 0961',
  },
];

// --- Reusable Molecules & Organisms (Internal to this page) ---

const FilterToolbar = ({ view, setView, sortConfig, setSortConfig, teamFilter, setTeamFilter }) => (
  <div className="dashboard-card p-4 mb-6">
    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium">View:</span>
        <Button variant={view === 'swimlane' ? 'primary' : 'secondary'} size="sm" onClick={() => setView('swimlane')} leadingIcon={LayoutGrid}>Swimlane</Button>
        <Button variant={view === 'timeline' ? 'primary' : 'secondary'} size="sm" onClick={() => setView('timeline')} leadingIcon={GanttChartSquare}>Timeline</Button>
        {/* Directory view button */}
        <Button
          variant={view === 'details' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setView('details')}
          leadingIcon={Users}
        >
          Directory
        </Button>
        {/* NEW Resources summary button */}
        <Button
          variant={view === 'resources' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setView('resources')}
          leadingIcon={Briefcase}
        >
          Resources
        </Button>
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
    <div
      className={`dashboard-card p-3 mb-2 border-l-4 ${
        req.isAssignment ? 'bg-primary-50 dark:bg-primary-900/20' : ''
      }`}
      style={{
        borderColor: req.isAssignment
          ? 'var(--color-primary-500)'
          : `var(--maturity-${req.maturityLevel?.score || 1})`,
      }}
    >
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

const SwimlaneView = ({
  resources,
  requirements,
  assignments,
  capabilities,
}) => {
  // Build a map of tasks per resource combining requirements + assignments
  const resourceTasks = useMemo(() => {
    const map = {};
    resources.forEach((r) => {
      map[r.id] = requirements.filter((req) => req.assignee === r.name);
    });

    assignments.forEach((a) => {
      const cap = capabilities.find((c) => c.id === a.capabilityId);
      if (!map[a.resourceId]) map[a.resourceId] = [];
      map[a.resourceId].push({
        id: a.id,
        description: `${cap ? cap.name : a.capabilityId} (${a.timeAllocation})`,
        priority: a.priority || 'Medium',
        dueDate: a.endDate,
        capabilityId: a.capabilityId,
        estimatedHours:
          a.timeAllocation === 'Full time'
            ? 40
            : a.timeAllocation.includes('%')
            ? (parseInt(a.timeAllocation) / 100) * 40
            : a.timeAllocation.startsWith('4')
            ? 32
            : a.timeAllocation.startsWith('3')
            ? 24
            : a.timeAllocation.startsWith('2')
            ? 16
            : 8,
        isAssignment: true,
        maturityLevel: { score: 3 },
      });
    });

    return map;
  }, [resources, requirements, assignments, capabilities]);

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {resources.map((resource) => (
        <ResourceLane
          key={resource.id}
          resource={resource}
          tasks={resourceTasks[resource.id] || []}
        />
      ))}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* TimelineView – capacity-planner style Gantt view                  */
/* ------------------------------------------------------------------ */
const TimelineView = ({ resources, assignments, capabilities }) => {
  /* month navigation */
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0,
  ).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const monthName = currentMonth.toLocaleString('default', {
    month: 'long',
    year: 'numeric',
  });

  /* build assignment map per resource for this month */
  const resourceAssignments = useMemo(() => {
    const map = {};
    resources.forEach((r) => (map[r.id] = []));

    // Current month range
    const monthStart = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      1
    );
    const monthEnd = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      0
    );

    assignments.forEach((a) => {
      if (!map[a.resourceId]) return;

      /* ---------- robust date parsing ---------- */
      let start, end;
      try {
        start = new Date(a.startDate);
        end = new Date(a.endDate);
      } catch {
        return; // skip invalid dates
      }
      if (isNaN(start.getTime()) || isNaN(end.getTime())) return;

      /* ---------- skip if completely outside current month ---------- */
      if (start > monthEnd || end < monthStart) return;

      const capabilityName =
        capabilities.find((c) => c.id === a.capabilityId)?.name ||
        a.capabilityId;

      /* ---------- calculate visible portion within this month ---------- */
      const visibleStart = start < monthStart ? monthStart : start;
      const visibleEnd = end > monthEnd ? monthEnd : end;

      map[a.resourceId].push({
        ...a,
        capabilityName,
        startDay: visibleStart.getDate(),
        endDay: visibleEnd.getDate(),
        continuesBefore: start < monthStart,
        continuesAfter: end > monthEnd,
        visibleStartDate: visibleStart,
        visibleEndDate: visibleEnd,
      });
    });

    return map;
  }, [resources, assignments, capabilities, currentMonth]);

  /* colour helper */
  const getColor = (alloc) => {
    if (alloc === 'Full time') return 'bg-red-500';
    if (alloc === '75%' || alloc === '4 days per week') return 'bg-orange-500';
    if (alloc === '50%' || alloc === '3 days per week') return 'bg-yellow-500';
    if (alloc === '2 days per week') return 'bg-green-500';
    return 'bg-blue-500';
  };

  /* ------------------------------------------------------------------
     Keep day-cell width consistent with ResourceLane so bars render
     across the correct span.  This was previously 25 px which caused
     assignments to appear only half-width.  Aligning to 35 px fixes
     the truncation issue. */
  const cellW = 35; // px
  const goMonth = (delta) =>
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + delta, 1),
    );

  return (
    <div className="dashboard-card p-4 overflow-x-auto">
      {/* header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Resource Timeline</h3>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => goMonth(-1)}>
            Previous
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setCurrentMonth(new Date())}
          >
            Today
          </Button>
          <span className="font-medium text-secondary-700 dark:text-secondary-300 px-2 min-w-[120px] text-center">
            {monthName}
          </span>
          <Button variant="secondary" size="sm" onClick={() => goMonth(1)}>
            Next
          </Button>
        </div>
      </div>

      {/* grid */}
      {/* widen the minimum container to accommodate 35-px cells
          for 31 days → 1085px plus resource column & paddings   */}
      <div className="min-w-[1200px] relative">
        {/* days header */}
        {/* use 35-px wide day cells so bars stretch the full visible month */}
        <div className="grid grid-cols-[150px_repeat(31,minmax(35px,1fr))] border-b dark:border-secondary-700">
          <div className="p-2 font-semibold border-r dark:border-secondary-700">
            Resource
          </div>
          {days.map((d) => {
            const today = new Date();
            const isToday =
              d === today.getDate() &&
              today.getMonth() === currentMonth.getMonth() &&
              today.getFullYear() === currentMonth.getFullYear();
            return (
              <div
                key={d}
                className={`p-2 text-center text-xs font-medium border-r dark:border-secondary-700 ${
                  isToday ? 'bg-primary-100 dark:bg-primary-900/20' : ''
                }`}
              >
                {d}
                {isToday && (
                  <div className="h-1 w-1 rounded-full bg-primary-500 mx-auto mt-1" />
                )}
              </div>
            );
          })}
        </div>

        {/* resource rows */}
        {resources.map((res) => (
          <div
            key={res.id}
            className="relative grid grid-cols-[150px_repeat(31,minmax(35px,1fr))] border-b dark:border-secondary-700"
          >
            <div className="p-2 font-medium border-r dark:border-secondary-700 flex items-center">
              {res.name}
            </div>
            {days.map((d) => (
              <div
                key={d}
                className="border-r dark:border-secondary-700 h-10 relative"
              />
            ))}

            {/* bars */}
            {resourceAssignments[res.id].map((a, idx) => {
              const duration = a.endDay - a.startDay + 1;
              if (duration <= 0) return null; // skip invalid durations
              const leftPos = (a.startDay - 1) * cellW + 150; // 150px resource column
              return (
                <div
                  key={a.id}
                  className={`absolute ${getColor(
                    a.timeAllocation,
                  )} text-white text-[10px] overflow-hidden px-2 flex items-center`}
                  style={{
                    left: `${leftPos}px`,
                    width: duration * cellW,
                    top: 8 + idx * 18,
                    height: 16,
                    borderTopLeftRadius: a.continuesBefore ? 0 : 9999,
                    borderBottomLeftRadius: a.continuesBefore ? 0 : 9999,
                    borderTopRightRadius: a.continuesAfter ? 0 : 9999,
                    borderBottomRightRadius: a.continuesAfter ? 0 : 9999,
                  }}
                  title={`${a.capabilityName} (${a.timeAllocation})\n${a.startDate} → ${a.endDate}`}
                >
                  {duration * cellW > 80 ? (
                    <div className="flex items-center space-x-1 whitespace-nowrap w-full">
                      {a.continuesBefore && <span>◄</span>}
                      <span className="truncate">{a.capabilityName}</span>
                      {a.continuesAfter && <span>►</span>}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center w-full">
                      {a.continuesBefore && '◄'}
                      {!a.continuesBefore && !a.continuesAfter && '·'}
                      {a.continuesAfter && '►'}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

/* ---------- Resource Details (Contact Directory) ---------- */
const ResourceDetailsView = ({
  resources,
  capabilities,
  filter = '',
  onAssignWork,
}) => {
  const [searchTerm, setSearchTerm] = useState(filter);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);

  const handleAssignWork = (resource) => {
    setSelectedResource(resource);
    setIsAssignModalOpen(true);
  };

  const filteredResources = useMemo(() => {
    if (!searchTerm) return resources;
    const q = searchTerm.toLowerCase();
    return resources.filter((r) =>
      [r.name, r.company, r.jobTitle, r.department]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(q))
    );
  }, [resources, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Action bar with search and create */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="dashboard-card p-4 flex-1">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400" />
            <input
              type="text"
              placeholder="Search resources by name, company, role, or department…"
              className="w-full pl-10 pr-4 py-2 border border-secondary-300 dark:border-secondary-600 rounded-md bg-white dark:bg-secondary-800 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        {/* Create button */}
        <div>
          <Button
            variant="primary"
            leadingIcon={Plus}
            onClick={() => alert('Coming soon: Create Resource functionality')}
          >
            Create Resource
          </Button>
        </div>
      </div>

      {/* Directory cards */}
      <div className="dashboard-card p-6">
        <h3 className="text-lg font-semibold mb-4">Resource Directory</h3>
        {filteredResources.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredResources.map((r) => (
              <div
                key={r.id}
                className="bg-secondary-50 dark:bg-secondary-800/50 p-4 rounded-lg space-y-1 text-xs"
              >
                <p className="font-bold text-secondary-900 dark:text-white text-sm">
                  {r.name}
                </p>
                {r.company && (
                  <p className="flex items-center gap-2 text-secondary-600 dark:text-secondary-400">
                    <Factory className="w-3 h-3" /> {r.company}
                  </p>
                )}
                {r.jobTitle && (
                  <p className="flex items-center gap-2">
                    <BookUser className="w-3 h-3" /> {r.jobTitle}
                  </p>
                )}
                {r.department && (
                  <p className="flex items-center gap-2">
                    <Briefcase className="w-3 h-3" /> {r.department}
                  </p>
                )}
                {r.email && (
                  <p className="flex items-center gap-2">
                    <Mail className="w-3 h-3" /> {r.email}
                  </p>
                )}
                {r.phone && (
                  <p className="flex items-center gap-2">
                    <Phone className="w-3 h-3" /> {r.phone}
                  </p>
                )}
                {r.location && (
                  <p className="flex items-center gap-2">
                    <MapPin className="w-3 h-3" /> {r.location}
                  </p>
                )}
                {/* Action button */}
                <div className="pt-3 mt-2 border-t border-secondary-200 dark:border-secondary-700">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full"
                    leadingIcon={ClipboardList}
                    onClick={() => handleAssignWork(r)}
                  >
                    Assign Work
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-secondary-500 py-8">
            No resources match your search criteria.
          </p>
        )}
      </div>

      {/* Assign work modal */}
      {isAssignModalOpen && selectedResource && (
        <AssignWorkModal
          isOpen={isAssignModalOpen}
          onClose={() => setIsAssignModalOpen(false)}
          resource={selectedResource}
          capabilities={capabilities}
          onAssignWork={onAssignWork}
        />
      )}
    </div>
  );
};

/* ---------- Resources Tab (summary & matrix) ---------- */
const ResourcesView = ({ resources, capabilities, onAssignWork }) => {
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);

  const handleAssignWork = (resource) => {
    setSelectedResource(resource);
    setIsAssignModalOpen(true);
  };
  // aggregate skills for the matrix
  const allSkills = useMemo(
    () =>
      Array.from(
        new Set(
          resources
            .flatMap((r) => r.skills || [])
            .filter(Boolean),
        ),
      ),
    [resources],
  );

  return (
    <div className="space-y-8">
      {/* Action bar */}
      <div className="flex justify-end">
        <Button
          variant="primary"
          leadingIcon={Plus}
          onClick={() => alert('Coming soon: Create Resource functionality')}
        >
          Create Resource
        </Button>
      </div>

      {/* Allocation table */}
      <div className="dashboard-card p-6 overflow-x-auto">
        <h3 className="text-lg font-semibold mb-3">Resource Allocation</h3>
        <table className="min-w-full text-sm">
          <thead className="bg-secondary-50 dark:bg-secondary-700/50">
            <tr>
              <th className="p-3 text-left font-semibold">Role</th>
              <th className="p-3 text-left font-semibold">Name</th>
              <th className="p-3 text-left font-semibold">Team</th>
              <th className="p-3 text-left font-semibold">Department</th>
              <th className="p-3 text-left font-semibold">Location</th>
              <th className="p-3 text-center font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-secondary-200 dark:divide-secondary-700">
            {resources.map((res) => (
              <tr key={res.id}>
                <td className="p-3 font-medium">{res.role}</td>
                <td className="p-3">{res.name}</td>
                <td className="p-3">
                  {mockTeams.find((t) => t.id === res.teamId)?.name || '-'}
                </td>
                <td className="p-3">{res.department || '-'}</td>
                <td className="p-3">{res.location || '-'}</td>
                <td className="p-3 text-center">
                  <Button
                    variant="secondary"
                    size="sm"
                    leadingIcon={ClipboardList}
                    onClick={() => handleAssignWork(res)}
                  >
                    Assign Work
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Skills matrix */}
      {allSkills.length > 0 && (
        <div className="dashboard-card p-6 overflow-x-auto">
          <h3 className="text-lg font-semibold mb-3">Skills Matrix</h3>
          <table className="min-w-full text-xs">
            <thead className="bg-secondary-50 dark:bg-secondary-700/50">
              <tr>
                <th className="p-2 text-left font-semibold">Skill</th>
                {resources.map((r) => (
                  <th
                    key={r.id}
                    className="p-2 text-center font-semibold whitespace-nowrap"
                  >
                    {r.name.split(' ')[0]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-200 dark:divide-secondary-700">
              {allSkills.map((skill) => (
                <tr key={skill}>
                  <td className="p-2 font-medium">{skill}</td>
                  {resources.map((r) => (
                    <td key={r.id} className="p-2 text-center">
                      {r.skills && r.skills.includes(skill) ? (
                        <CheckCircle className="w-4 h-4 text-green-500 mx-auto" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-secondary-400 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Assign work modal */}
      {isAssignModalOpen && selectedResource && (
        <AssignWorkModal
          isOpen={isAssignModalOpen}
          onClose={() => setIsAssignModalOpen(false)}
          resource={selectedResource}
          capabilities={capabilities}
          onAssignWork={onAssignWork}
        />
      )}
    </div>
  );
};

/* ---------- Assign Work Modal ---------- */
const AssignWorkModal = ({ isOpen, onClose, resource, capabilities, onAssignWork }) => {
  const [formData, setFormData] = useState({
    capabilityId: '',
    timeAllocation: '2 days per week',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    priority: 'Medium',
    notes: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onAssignWork) {
      onAssignWork(resource.id, formData);      // propagate to parent
    } else {
      // fallback alert for backward-compatibility
      alert(
        `Work assignment data for ${resource.name}:\n${JSON.stringify(
          formData,
          null,
          2,
        )}`,
      );
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-xl w-full max-w-2xl">
        <div className="flex items-center justify-between p-4 border-b dark:border-secondary-700">
          <h3 className="text-lg font-semibold">
            Assign Work to {resource.name}
          </h3>
          <button
            onClick={onClose}
            className="text-secondary-500 hover:text-secondary-700 dark:hover:text-secondary-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Capability *</label>
              <select
                name="capabilityId"
                value={formData.capabilityId}
                onChange={handleChange}
                required
                className="w-full p-2 border border-secondary-300 dark:border-secondary-600 rounded-md dark:bg-secondary-700"
              >
                <option value="">Select a capability...</option>
                {capabilities.map((cap) => (
                  <option key={cap.id} value={cap.id}>
                    {cap.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Time Allocation *
              </label>
              <select
                name="timeAllocation"
                value={formData.timeAllocation}
                onChange={handleChange}
                required
                className="w-full p-2 border border-secondary-300 dark:border-secondary-600 rounded-md dark:bg-secondary-700"
              >
                <option value="1 day per week">1 day per week</option>
                <option value="2 days per week">2 days per week</option>
                <option value="3 days per week">3 days per week</option>
                <option value="4 days per week">4 days per week</option>
                <option value="Full time">Full time</option>
                <option value="20%">20% allocation</option>
                <option value="50%">50% allocation</option>
                <option value="75%">75% allocation</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Start Date *
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
                className="w-full p-2 border border-secondary-300 dark:border-secondary-600 rounded-md dark:bg-secondary-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                End Date *
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                required
                className="w-full p-2 border border-secondary-300 dark:border-secondary-600 rounded-md dark:bg-secondary-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Priority</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full p-2 border border-secondary-300 dark:border-secondary-600 rounded-md dark:bg-secondary-700"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Any additional details about this assignment..."
                className="w-full p-2 border border-secondary-300 dark:border-secondary-600 rounded-md dark:bg-secondary-700 h-24"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t dark:border-secondary-700 pt-4">
            <Button variant="secondary" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" leadingIcon={Save}>
              Assign Work
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Main Page Component ---

const ResourcePlanningPage = () => {
  const [view, setView] = useState('swimlane');
  const [teamFilter, setTeamFilter] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });

  /* ------------------------------------------------------------------ */
  /* NEW: Assignment state – stores all work assignments for resources  */
  /* ------------------------------------------------------------------ */
  const [assignments, setAssignments] = useState([]);

  /**
   * Callback used by child components (e.g. AssignWorkModal) to create a
   * new work-assignment record.  This can later be consumed by the swimlane
   * and timeline views to visualise capacity and allocation.
   *
   * @param {string} resourceId – ID of the resource the work is assigned to
   * @param {Object} assignmentData – Payload returned from the modal form
   */
  const handleAssignWork = useCallback((resourceId, assignmentData) => {
    const newAssignment = {
      id: `assign-${Date.now()}`,
      resourceId,
      ...assignmentData,
    };
    setAssignments(prev => [...prev, newAssignment]);
    /* eslint-disable no-console */
    console.log('📌 New assignment added', newAssignment);
  }, []);

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
        {view === 'swimlane' && (
          <SwimlaneView
            resources={filteredAndSortedResources}
            requirements={requirements}
            assignments={assignments}
            capabilities={capabilities}
          />
        )}
        {view === 'timeline' && (
          <TimelineView
            resources={filteredAndSortedResources}
            assignments={assignments}
            capabilities={capabilities}
          />
        )}
        {view === 'details' && (
          <ResourceDetailsView
            resources={filteredAndSortedResources}
            capabilities={capabilities}
            onAssignWork={handleAssignWork}
          />
        )}
        {view === 'resources' && (
          <ResourcesView
            resources={filteredAndSortedResources}
            capabilities={capabilities}
            onAssignWork={handleAssignWork}
          />
        )}
      </div>
    </div>
  );
};

export default ResourcePlanningPage;
