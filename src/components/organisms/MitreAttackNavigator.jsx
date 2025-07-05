import React, { useState, useMemo, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import {
  Shield,
  Search,
  Users,
  Info,
  X,
  ChevronDown,
  ArrowLeft,
  Target,
  Globe,
  LayoutGrid,
  GanttChartSquare,
  Network,
  Workflow,
  BarChart3,
  AlertTriangle,
  BookOpen
} from 'lucide-react';
import Button from '../atoms/Button';
import Badge from '../atoms/Badge';
import Input from '../atoms/Input';

// --- Internal Molecules (Components specific to this organism) ---

/**
 * Tooltip: An enhanced tooltip component for showing details on hover.
 */
const Tooltip = ({ children, content, position = 'top' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setIsVisible(false), 200);
  };

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {isVisible && content && (
        <div
          className={`absolute z-30 p-3 bg-secondary-900 text-white text-xs rounded-lg shadow-xl border border-secondary-700 w-64
            ${position === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'}
            left-1/2 -translate-x-1/2
            animate-in fade-in-0 zoom-in-95 duration-200
          `}
        >
          {content}
        </div>
      )}
    </div>
  );
};
Tooltip.propTypes = {
  children: PropTypes.node.isRequired,
  content: PropTypes.node,
  position: PropTypes.oneOf(['top', 'bottom']),
};

/**
 * FilterToolbar: A dedicated component for all filtering and search controls.
 */
const FilterToolbar = ({ threatGroups, filters, onFilterChange }) => {
  const [showGroupSelector, setShowGroupSelector] = useState(false);

  const handleGroupSelection = (groupId) => {
    const newSelection = new Set(filters.selectedGroups);
    if (newSelection.has(groupId)) {
      newSelection.delete(groupId);
    } else {
      newSelection.add(groupId);
    }
    onFilterChange('selectedGroups', Array.from(newSelection));
  };

  return (
    <div className="dashboard-card p-4 mb-6">
      <div className="flex flex-col md:flex-row items-center gap-4">
        <Input
          placeholder="Search techniques (e.g., T1566.001, Phishing)"
          value={filters.search}
          onChange={(e) => onFilterChange('search', e.target.value)}
          onClear={() => onFilterChange('search', '')}
          leadingIcon={Search}
          className="flex-grow"
        />
        <div className="relative w-full md:w-auto">
          <Button
            variant="secondary"
            onClick={() => setShowGroupSelector(s => !s)}
            className="w-full justify-between"
          >
            <span>Threat Groups ({filters.selectedGroups.length} selected)</span>
            <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showGroupSelector ? 'rotate-180' : ''}`} />
          </Button>
          {showGroupSelector && (
            <div className="absolute top-full left-0 mt-2 w-full md:w-72 bg-white dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 rounded-lg shadow-lg z-20 p-4">
              <h4 className="text-sm font-semibold mb-2">Select Threat Groups</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {threatGroups.map(group => (
                  <label key={group.id} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.selectedGroups.includes(group.id)}
                      onChange={() => handleGroupSelection(group.id)}
                      className="rounded text-primary-600 focus:ring-primary-500"
                    />
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: group.color }}></div>
                    <span>{group.name} ({group.alias})</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * MatrixCell: Represents a single technique in the ATT&CK matrix.
 */
const MatrixCell = ({ technique, highlightColor, onSelect }) => {
  const getSeverityPastelColor = (severity) => {
    switch (severity) {
      case 'Critical': return '#ef44444D';
      case 'High': return '#f973164D';
      case 'Medium': return '#eab3084D';
      default: return 'transparent';
    }
  };
  
  const cellStyle = {
    backgroundColor: highlightColor ? `${highlightColor}33` : getSeverityPastelColor(technique.severity),
  };

  const tooltipContent = (
    <div className="space-y-1">
      <p className="font-bold">{technique.id}: {technique.name}</p>
      <p className="text-secondary-300">{technique.description}</p>
      <div className="pt-1">
        <p><span className="font-semibold">Platforms:</span> {technique.platforms.join(', ')}</p>
        <p><span className="font-semibold">Severity:</span> {technique.severity}</p>
      </div>
    </div>
  );

  return (
    <Tooltip content={tooltipContent}>
      <div
        className="p-2 text-xs border-b border-secondary-200 dark:border-secondary-700 hover:bg-primary-100 dark:hover:bg-primary-500/20 cursor-pointer transition-colors"
        style={cellStyle}
        onClick={() => onSelect(technique)}
        role="button"
        tabIndex={0}
        onKeyPress={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect(technique)}
      >
        <p className="font-medium text-secondary-800 dark:text-secondary-200 truncate" title={technique.name}>
          {technique.name}
        </p>
        <p className="text-secondary-500 dark:text-secondary-400">{technique.id}</p>
      </div>
    </Tooltip>
  );
};

/**
 * DetailsPanel: Shows information about the selected technique or threat group.
 */
const DetailsPanel = ({ item, onClose }) => (
  <div className="dashboard-card w-full lg:w-1/3 p-6 h-full overflow-y-auto">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-bold text-secondary-900 dark:text-white">Details</h3>
      <Button variant="ghost" size="sm" onClick={onClose} className="p-1"><X className="w-5 h-5" /></Button>
    </div>
    {item ? (
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold text-primary-600 dark:text-primary-300">{item.name}</h4>
          <p className="text-sm font-mono text-secondary-500">{item.id}</p>
        </div>
        <p className="text-sm text-secondary-600 dark:text-secondary-400">{item.description || "No description available."}</p>
        {item.tacticIds && (
          <div>
            <h5 className="text-sm font-semibold mb-1">Tactics</h5>
            <div className="flex flex-wrap gap-1">
              {item.tacticIds.map(tactic => <Badge key={tactic}>{tactic}</Badge>)}
            </div>
          </div>
        )}
      </div>
    ) : (
      <div className="text-center py-16 text-secondary-500">
        <Info className="w-10 h-10 mx-auto mb-2" />
        <p>Select a technique from the matrix to view its details.</p>
      </div>
    )}
  </div>
);

const PlaceholderView = ({ title, icon: Icon }) => (
  <div className="dashboard-card flex items-center justify-center h-full text-secondary-500">
    <div className="text-center">
      <Icon className="w-16 h-16 mx-auto mb-4 opacity-50" />
      <h3 className="text-xl font-semibold">{title}</h3>
      <p>This view is under construction.</p>
    </div>
  </div>
);

/**
 * DashboardView: High-level summary view shown in the screenshot.
 */
const DashboardView = ({
  threatGroups,
  filters,
  onFilterChange,
  tactics
}) => {
  const metrics = [
    { label: 'Active Groups', value: filters.selectedGroups.length, icon: Users },
    { label: 'Total TTPs', value: 25, icon: Target },
    { label: 'Tactics Used', value: 11, icon: Shield },
    { label: 'Avg Risk', value: 2.6, icon: AlertTriangle },
  ];

  const tacticAnalysisData = tactics.map(t => ({
    name: t.name,
    techniques: Math.floor(Math.random() * 4) + 1,
    avgSeverity: parseFloat((Math.random() * 2 + 2).toFixed(1)),
    color: ['#ef4444', '#10b981', '#a855f7', '#f97316', '#3b82f6', '#eab308', '#6366f1', '#ec4899', '#14b8a6', '#f43f5e', '#d946ef'][tactics.findIndex(i => i.id === t.id)] || '#6b7280',
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full overflow-hidden">
      {/* Left Control Panel */}
      <div className="lg:col-span-1 space-y-6 h-full overflow-y-auto pr-2">
        <div className="dashboard-card p-4">
          <h3 className="font-semibold mb-2">Controls</h3>
          <label className="text-sm font-medium">Target Sector</label>
          <select className="w-full text-sm mt-1 border-secondary-300 rounded-md dark:bg-secondary-800 dark:border-secondary-600">
            <option>All Sectors</option>
            <option>Finance</option>
            <option>Healthcare</option>
            <option>Energy</option>
          </select>
        </div>
        <div className="dashboard-card p-4">
          <h3 className="font-semibold mb-2">Threat Groups</h3>
          <div className="space-y-2">
            {threatGroups.map(group => (
              <label key={group.id} className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.selectedGroups.includes(group.id)}
                  onChange={() => {
                    const newSelection = new Set(filters.selectedGroups);
                    if (newSelection.has(group.id)) newSelection.delete(group.id);
                    else newSelection.add(group.id);
                    onFilterChange('selectedGroups', Array.from(newSelection));
                  }}
                  className="rounded text-primary-600 focus:ring-primary-500"
                />
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: group.color }}></div>
                <span>{group.name}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="dashboard-card p-4 bg-blue-50 dark:bg-blue-500/10">
          <h3 className="font-semibold mb-2 text-blue-800 dark:text-blue-200">Current View</h3>
          <p className="text-sm text-blue-700 dark:text-blue-300">Executive summary with key metrics and threat group profiles.</p>
        </div>
        <div className="dashboard-card p-4">
           <div className="flex items-start gap-3">
             <Info className="w-5 h-5 text-primary-500 mt-0.5" />
             <div>
               <h4 className="font-semibold">Hover Tips Available</h4>
               <p className="text-xs text-secondary-500 mt-1">Hover over any threat group, tactic, or technique for detailed intelligence.</p>
             </div>
           </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="lg:col-span-3 space-y-6 h-full overflow-y-auto pr-2">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {metrics.map(m => (
            <div key={m.label} className="dashboard-card p-4 flex items-center gap-4">
              <m.icon className="w-8 h-8 text-primary-500" />
              <div>
                <p className="text-sm text-secondary-500">{m.label}</p>
                <p className="text-2xl font-bold text-secondary-900 dark:text-white">{m.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {threatGroups.filter(g => filters.selectedGroups.includes(g.id)).map(group => (
            <div key={group.id} className="dashboard-card p-4 border-t-4" style={{ borderColor: group.color }}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-secondary-900 dark:text-white">{group.name}</p>
                  <p className="text-xs text-secondary-500">{group.alias} • {group.country}</p>
                </div>
                <Badge>{group.techniques.length} TTPs</Badge>
              </div>
              <p className="text-sm mt-2">{group.description}</p>
            </div>
          ))}
        </div>
        
        <div className="dashboard-card p-6">
          <h3 className="text-lg font-semibold mb-4">Tactic Analysis</h3>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {tacticAnalysisData.map(tactic => (
              <div key={tactic.name} className="border dark:border-secondary-700 rounded-lg p-3">
                <p className="font-semibold text-sm">{tactic.name}</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-secondary-500">Techniques: {tactic.techniques}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-medium text-secondary-500">Avg. Severity:</span>
                    <span className="font-bold text-sm" style={{ color: tactic.color }}>{tactic.avgSeverity}</span>
                  </div>
                </div>
                <div className="w-full bg-secondary-200 dark:bg-secondary-700 rounded-full h-1 mt-1">
                  <div className="h-1 rounded-full" style={{ width: `${(tactic.avgSeverity / 5) * 100}%`, backgroundColor: tactic.color }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};


// --- Main Organism Component ---

const MitreAttackNavigator = ({
  tactics,
  techniques,
  threatGroups,
  filters,
  onFilterChange,
  getTechniquesForTactic,
  onNavigateBack,
}) => {
  const [selectedTechnique, setSelectedTechnique] = useState(null);
  const [activeView, setActiveView] = useState('dashboard');

  const highlightedTechniques = useMemo(() => {
    if (filters.selectedGroups.length === 0) return {};
    
    const mapping = {};
    threatGroups
      .filter(g => filters.selectedGroups.includes(g.id))
      .forEach(group => {
        group.techniques.forEach(techId => {
          if (!mapping[techId]) {
            mapping[techId] = [];
          }
          mapping[techId].push(group.color);
        });
      });
    return mapping;
  }, [filters.selectedGroups, threatGroups]);

  const coverageStats = useMemo(() => {
    const allSelectedTechniques = new Set(
      threatGroups
        .filter(g => filters.selectedGroups.includes(g.id))
        .flatMap(g => g.techniques)
    );
    const coveredTechniques = new Set(Object.keys(highlightedTechniques).slice(0, Math.floor(Object.keys(highlightedTechniques).length / 2)));
    
    const relevantCovered = new Set([...allSelectedTechniques].filter(t => coveredTechniques.has(t)));

    return {
      total: allSelectedTechniques.size,
      covered: relevantCovered.size,
      percentage: allSelectedTechniques.size > 0 ? (relevantCovered.size / allSelectedTechniques.size) * 100 : 0,
    };
  }, [filters.selectedGroups, threatGroups, highlightedTechniques]);

  const viewOptions = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'matrix', label: 'Matrix View', icon: LayoutGrid },
    { id: 'network', label: 'Network View', icon: Network },
    { id: 'timeline', label: 'Timeline', icon: GanttChartSquare },
    { id: 'flow', label: 'Attack Flow', icon: Workflow },
  ];

  return (
    <div className="space-y-4 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div>
            <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">Cyber Trust Portal</h1>
            <p className="text-secondary-500 dark:text-secondary-400 text-sm">Network Segmentation Project • 75 of 75 requirements • Demo data active</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
            <Button variant="secondary">Test</Button>
            <Button>Export CSV</Button>
        </div>
      </div>

      <div className="flex items-center justify-between p-1 border-b border-secondary-200 dark:border-secondary-700">
        <div className="flex items-center rounded-lg p-1">
          {viewOptions.map(option => (
            <Button
              key={option.id}
              variant={activeView === option.id ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setActiveView(option.id)}
              leadingIcon={option.icon}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex-grow flex flex-col lg:flex-row gap-6 overflow-hidden">
        {activeView === 'matrix' ? (
          <>
            {/* ATT&CK Matrix */}
            <div className="flex-1 overflow-auto bg-white dark:bg-secondary-800 rounded-lg shadow-md border border-secondary-200 dark:border-secondary-700">
              <div className="flex min-w-max h-full">
                {tactics.map(tactic => (
                  <div key={tactic.id} className="flex-shrink-0 w-48 border-r border-secondary-200 dark:border-secondary-700 flex flex-col">
                    <div className="p-2 text-center bg-secondary-100 dark:bg-secondary-700/50 border-b-2 border-primary-500">
                      <h4 className="text-xs font-bold uppercase tracking-wider truncate" title={tactic.name}>{tactic.name}</h4>
                    </div>
                    <div className="flex-grow overflow-y-auto">
                      {getTechniquesForTactic(tactic.id).map(technique => (
                        <MatrixCell
                          key={technique.id}
                          technique={technique}
                          highlightColor={highlightedTechniques[technique.id]?.[0]} // Show first group's color
                          onSelect={setSelectedTechnique}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Details Panel */}
            <DetailsPanel item={selectedTechnique} onClose={() => setSelectedTechnique(null)} />
          </>
        ) : (
          activeView === 'dashboard' ? (
            <DashboardView
              threatGroups={threatGroups}
              filters={filters}
              onFilterChange={onFilterChange}
              tactics={tactics}
            />
          ) : (
            <PlaceholderView
              title={viewOptions.find(v => v.id === activeView)?.label}
              icon={viewOptions.find(v => v.id === activeView)?.icon}
            />
          )
        )}
      </div>
    </div>
  );
};

MitreAttackNavigator.propTypes = {
  tactics: PropTypes.array.isRequired,
  techniques: PropTypes.array.isRequired,
  threatGroups: PropTypes.array.isRequired,
  filters: PropTypes.object.isRequired,
  onFilterChange: PropTypes.func.isRequired,
  getTechniquesForTactic: PropTypes.func.isRequired,
  onNavigateBack: PropTypes.func.isRequired,
};

export default MitreAttackNavigator;
