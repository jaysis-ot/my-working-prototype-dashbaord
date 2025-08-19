import React, { useState, useMemo, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import {
  Shield,
  Search,
  Users,
  Info,
  X,
  ChevronDown,
  ChevronLeft,
  Target,
  Globe,
  LayoutGrid,
  GanttChartSquare,
  Network,
  Workflow,
  BarChart3,
  AlertTriangle,
  Download,
  Upload,
  BookOpen
} from 'lucide-react';
import Button from '../atoms/Button';
import Badge from '../atoms/Badge';
import Input from '../atoms/Input';

// --- Internal Molecules (Components specific to this organism) ---

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
    <div className="relative" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
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

const MatrixCell = ({ technique, highlightColor, onSelect, colorMode, coverageValue, heatColor }) => {
  const getSeverityPastelColor = (severity) => {
    switch (severity) {
      case 'Critical': return '#ef44444D';
      case 'High': return '#f973164D';
      case 'Medium': return '#eab3084D';
      default: return 'transparent';
    }
  };
  
  const cellStyle = {
    backgroundColor: colorMode === 'coverage' 
      ? heatColor 
      : (highlightColor ? `${highlightColor}33` : getSeverityPastelColor(technique.severity)),
  };

  const tooltipContent = (
    <div className="space-y-1">
      <p className="font-bold">{technique.id}: {technique.name}</p>
      <p className="text-secondary-300">{technique.description}</p>
      <div className="pt-1">
        <p><span className="font-semibold">Platforms:</span> {technique.platforms.join(', ')}</p>
        <p><span className="font-semibold">Severity:</span> {technique.severity}</p>
        {colorMode === 'coverage' && (
          <p><span className="font-semibold">Coverage:</span> {Math.round(coverageValue || 0)}%</p>
        )}
      </div>
    </div>
  );

  return (
    <Tooltip content={tooltipContent}>
      <div
        className="p-2 text-xs border-b border-secondary-200 dark:border-secondary-700 hover:bg-primary-100 dark:hover:bg-primary-500/20 cursor-pointer transition-colors relative"
        style={cellStyle}
        onClick={() => onSelect(technique)}
        role="button"
        tabIndex={0}
        onKeyPress={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect(technique)}
      >
        {colorMode === 'coverage' && coverageValue > 0 && (
          <div className="absolute top-1 right-1 bg-blue-600 text-white text-[10px] px-1 rounded-sm font-medium">
            {Math.round(coverageValue)}%
          </div>
        )}
        <p className="font-medium text-secondary-800 dark:text-secondary-200 truncate" title={technique.name}>
          {technique.name}
        </p>
        <p className="text-secondary-500 dark:text-secondary-400">{technique.id}</p>
      </div>
    </Tooltip>
  );
};

const DetailsPanel = ({ item, onClose }) => (
  <div className="dashboard-card w-full p-4 mb-4">
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-bold text-secondary-900 dark:text-white">Technique Details</h3>
      <Button variant="ghost" size="sm" onClick={onClose} className="p-1"><X className="w-5 h-5" /></Button>
    </div>
    <div className="mt-2 space-y-2">
      <h4 className="font-semibold text-primary-600 dark:text-primary-300">{item.name} ({item.id})</h4>
      <p className="text-sm text-secondary-600 dark:text-secondary-400">{item.description || "No description available."}</p>
      <div>
        <h5 className="text-xs font-semibold uppercase text-secondary-500 mb-1">Tactics</h5>
        <div className="flex flex-wrap gap-1">{item.tacticIds.map(tactic => <Badge key={tactic}>{tactic}</Badge>)}</div>
      </div>
    </div>
  </div>
);

const PlaceholderView = ({ title, icon: Icon }) => (
  <div className="dashboard-card flex items-center justify-center h-full text-secondary-500 bg-secondary-50 dark:bg-secondary-800/50">
    <div className="text-center">
      <Icon className="w-16 h-16 mx-auto mb-4 opacity-50" />
      <h3 className="text-xl font-semibold">{title}</h3>
      <p>This view is under construction.</p>
    </div>
  </div>
);

const ControlsPanel = ({ threatGroups, filters, onFilterChange, isOpen, onToggle }) => (
  <div className={`transition-all duration-300 ease-in-out bg-white dark:bg-secondary-800 border-r border-secondary-200 dark:border-secondary-700 h-full flex flex-col ${isOpen ? 'w-64 p-4' : 'w-0 p-0'}`}>
    <div className={`space-y-6 overflow-hidden ${!isOpen && 'hidden'}`}>
      <div className="dashboard-card p-4 bg-transparent shadow-none border-none">
        <h3 className="font-semibold mb-2">Controls</h3>
        <label className="text-sm font-medium">Target Sector</label>
        <select className="w-full text-sm mt-1 border-secondary-300 rounded-md dark:bg-secondary-800 dark:border-secondary-600">
          <option>All Sectors</option>
          <option>Finance</option><option>Healthcare</option><option>Energy</option>
        </select>
      </div>
      <div className="dashboard-card p-4 bg-transparent shadow-none border-none">
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
  </div>
);

const MatrixView = ({ tactics, getTechniquesForTactic, highlightedTechniques, onTechniqueSelect, colorMode, getCoverageValue, getCoverageHeatColor }) => (
  <div className="flex-1 overflow-auto bg-white dark:bg-secondary-800 rounded-lg shadow-md border border-secondary-200 dark:border-secondary-700">
    <div className="flex min-w-max h-full">
      {tactics.map(tactic => (
        <div key={tactic.id} className="flex-shrink-0 w-48 border-r border-secondary-200 dark:border-secondary-700 flex flex-col">
          <div className="p-2 text-center bg-secondary-100 dark:bg-secondary-700/50 border-b-2 border-primary-500">
            <h4 className="text-xs font-bold uppercase tracking-wider truncate" title={tactic.name}>{tactic.name}</h4>
            {(() => {
              const list = getTechniquesForTactic(tactic.id);
              const covered = colorMode === 'coverage'
                ? list.filter(t => (getCoverageValue(t.id) || 0) > 0).length
                : list.filter(t => highlightedTechniques[t.id]).length;
              return (
                <div className="text-[10px] text-secondary-600 dark:text-secondary-300 mt-1">
                  {covered} / {list.length} covered
                </div>
              );
            })()}
          </div>
          <div className="flex-grow overflow-y-auto">
            {getTechniquesForTactic(tactic.id).map(technique => {
              const value = getCoverageValue(technique.id);
              const heat = getCoverageHeatColor(value);
              return (
                <MatrixCell
                  key={technique.id}
                  technique={technique}
                  highlightColor={highlightedTechniques[technique.id]?.[0]}
                  onSelect={onTechniqueSelect}
                  colorMode={colorMode}
                  coverageValue={value}
                  heatColor={heat}
                />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  </div>
);

const DashboardView = ({ threatGroups, filters, tactics }) => {
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
      <div className="space-y-6 h-full overflow-y-auto pr-2">
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
    );
};

const MitreAttackNavigator = ({
  tactics,
  techniques,
  threatGroups,
  filters,
  onFilterChange,
  getTechniquesForTactic
}) => {
  const [selectedTechnique, setSelectedTechnique] = useState(null);
  const [activeView, setActiveView] = useState('dashboard');
  const [isControlsPanelOpen, setIsControlsPanelOpen] = useState(true);
  const [colorMode, setColorMode] = useState('groups'); // 'groups' | 'coverage'
  const [coverageSource, setCoverageSource] = useState('groups'); // 'groups' | 'import'
  const [importedCoverage, setImportedCoverage] = useState({}); // { [techniqueId]: score(0-100) }
  const [importMeta, setImportMeta] = useState(null);
  const fileInputRef = useRef(null);

  const highlightedTechniques = useMemo(() => {
    if (filters.selectedGroups.length === 0) return {};
    const mapping = {};
    threatGroups.filter(g => filters.selectedGroups.includes(g.id)).forEach(group => {
      group.techniques.forEach(techId => {
        if (!mapping[techId]) mapping[techId] = [];
        mapping[techId].push(group.color);
      });
    });
    return mapping;
  }, [filters.selectedGroups, threatGroups]);

  const getCoverageValue = useCallback((techniqueId) => { 
    if (colorMode !== 'coverage') return null; 
    if (coverageSource === 'groups') { 
      return highlightedTechniques[techniqueId] ? 100 : 0; 
    } 
    const v = importedCoverage[techniqueId]; 
    return typeof v === 'number' ? Math.max(0, Math.min(100, v)) : 0; 
  }, [colorMode, coverageSource, highlightedTechniques, importedCoverage]);

  const getCoverageHeatColor = useCallback((value) => { 
    if (value == null) return null; 
    // gray to blue ramp
    if (value <= 0) return '#f3f4f6'; 
    const t = value / 100; 
    const r = Math.round(243 + (37 - 243) * t); 
    const g = Math.round(244 + (99 - 244) * t); 
    const b = Math.round(246 + (235 - 246) * t); 
    return `rgb(${r}, ${g}, ${b})`; 
  }, []);

  const handleImportClick = () => fileInputRef.current && fileInputRef.current.click();

  const handleFileChange = async (e) => { 
    const file = e.target.files && e.target.files[0]; 
    if (!file) return; 
    try { 
      const text = await file.text(); 
      const json = JSON.parse(text); // Navigator layer format
      const layer = json.layers ? json.layers[0] : json; 
      const techniquesArr = layer.techniques || []; 
      const scoreMap = {}; 
      techniquesArr.forEach(t => { 
        const id = t.techniqueID || t.techniqueId || t.tactic?.techniqueID || t.tactic?.techniqueId || t.tid || t.id; 
        if (!id) return; 
        const score = typeof t.score === 'number' ? t.score : (typeof t.weight === 'number' ? t.weight : (t.color && t.color.startsWith('#') ? 100 : 0)); 
        scoreMap[id] = score; 
      }); 
      setImportedCoverage(scoreMap); 
      setImportMeta({ 
        name: layer.name || file.name, 
        description: layer.description || '', 
        count: Object.keys(scoreMap).length 
      }); 
      setCoverageSource('import'); 
      setColorMode('coverage'); 
    } catch (err) { 
      console.error('Failed to parse layer', err); 
    } finally { 
      e.target.value = ''; 
    } 
  };

  const downloadBlob = (data, filename, type='application/json') => { 
    const blob = new Blob([data], { type }); 
    const url = URL.createObjectURL(blob); 
    const a = document.createElement('a'); 
    a.href = url; 
    a.download = filename; 
    document.body.appendChild(a); 
    a.click(); 
    a.remove(); 
    URL.revokeObjectURL(url); 
  };

  const handleExportLayer = () => { 
    // Build a simple layer JSON with technique scores from current coverage mode
    const allTechniqueIds = new Set(); 
    tactics.forEach(t => { 
      getTechniquesForTactic(t.id).forEach(tech => allTechniqueIds.add(tech.id)); 
    }); 
    const techniquesList = Array.from(allTechniqueIds).map(id => ({ 
      techniqueID: id, 
      score: getCoverageValue(id) ?? (highlightedTechniques[id] ? 100 : 0) 
    })); 
    const layer = { 
      name: 'Navigator Coverage Export', 
      description: 'Generated from dashboard', 
      domain: 'enterprise-attack', 
      version: '4.5', 
      techniques: techniquesList 
    }; 
    downloadBlob(JSON.stringify(layer, null, 2), 'navigator-layer.json'); 
  };

  const handleExportGapsCSV = () => { 
    // Export techniques with 0 coverage
    const allTechniqueIds = new Set(); 
    tactics.forEach(t => { 
      getTechniquesForTactic(t.id).forEach(tech => allTechniqueIds.add(tech.id)); 
    }); 
    const rows = [['Technique ID','Coverage']]; 
    Array.from(allTechniqueIds).forEach(id => { 
      const v = getCoverageValue(id) ?? (highlightedTechniques[id] ? 100 : 0); 
      if (v <= 0) rows.push([id, '0']); 
    }); 
    const csv = rows.map(r => r.join(',')).join('\n'); 
    downloadBlob(csv, 'coverage-gaps.csv', 'text/csv'); 
  };

  const viewOptions = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'matrix', label: 'Matrix View', icon: LayoutGrid },
    { id: 'network', label: 'Network View', icon: Network },
    { id: 'timeline', label: 'Timeline', icon: GanttChartSquare },
    { id: 'flow', label: 'Attack Flow', icon: Workflow },
  ];

  return (
    <div className="h-full flex flex-col">
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
        <div className="flex items-center gap-2 ml-auto">
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-secondary-600">Color:</label>
            <select 
              className="text-xs border border-secondary-300 rounded px-2 py-1"
              value={colorMode}
              onChange={(e) => setColorMode(e.target.value)}
            >
              <option value="groups">Groups</option>
              <option value="coverage">Coverage Heatmap</option>
            </select>
          </div>
          
          {colorMode === 'coverage' && (
            <>
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-secondary-600">Source:</label>
                <select 
                  className="text-xs border border-secondary-300 rounded px-2 py-1"
                  value={coverageSource}
                  onChange={(e) => setCoverageSource(e.target.value)}
                >
                  <option value="groups">Groups</option>
                  <option value="import" disabled={Object.keys(importedCoverage).length === 0}>
                    Imported Layer
                  </option>
                </select>
              </div>
              
              <div className="flex items-center gap-1 bg-secondary-100 rounded px-2 py-1">
                <div className="flex h-2 w-20">
                  <div className="w-1/5 h-full bg-gray-200" title="0%"></div>
                  <div className="w-1/5 h-full bg-blue-200" title="25%"></div>
                  <div className="w-1/5 h-full bg-blue-300" title="50%"></div>
                  <div className="w-1/5 h-full bg-blue-400" title="75%"></div>
                  <div className="w-1/5 h-full bg-blue-500" title="100%"></div>
                </div>
                <span className="text-xs text-secondary-600">0-100%</span>
              </div>
            </>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            leadingIcon={Upload}
            onClick={handleImportClick}
          >
            Import Layer
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            leadingIcon={Download}
            onClick={handleExportLayer}
          >
            Export Layer
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            leadingIcon={Download}
            onClick={handleExportGapsCSV}
          >
            Export Gaps CSV
          </Button>
        </div>
      </div>

      <div className="flex-grow flex overflow-hidden">
        <ControlsPanel
          threatGroups={threatGroups}
          filters={filters}
          onFilterChange={onFilterChange}
          isOpen={isControlsPanelOpen}
          onToggle={() => setIsControlsPanelOpen(!isControlsPanelOpen)}
        />
        <main className="flex-1 flex flex-col p-4 overflow-hidden">
          {activeView === 'dashboard' && (
            <DashboardView
              threatGroups={threatGroups}
              filters={filters}
              onFilterChange={onFilterChange}
              tactics={tactics}
            />
          )}
          {activeView === 'matrix' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              {selectedTechnique && (
                <DetailsPanel item={selectedTechnique} onClose={() => setSelectedTechnique(null)} />
              )}
              <MatrixView
                tactics={tactics}
                getTechniquesForTactic={getTechniquesForTactic}
                highlightedTechniques={highlightedTechniques}
                onTechniqueSelect={setSelectedTechnique}
                colorMode={colorMode}
                getCoverageValue={getCoverageValue}
                getCoverageHeatColor={getCoverageHeatColor}
              />
            </div>
          )}
          {['network', 'timeline', 'flow'].includes(activeView) && (
             <PlaceholderView
              title={viewOptions.find(v => v.id === activeView)?.label}
              icon={viewOptions.find(v => v.id === activeView)?.icon}
            />
          )}
        </main>
      </div>
      
      <input 
        ref={fileInputRef}
        type="file"
        accept="application/json"
        onChange={handleFileChange}
        className="hidden"
      />
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
};

export default MitreAttackNavigator;
