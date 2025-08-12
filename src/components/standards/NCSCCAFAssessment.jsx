import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, RotateCcw, Download, ChevronDown, Search, Filter, ArrowLeft } from 'lucide-react';
import Button from '../atoms/Button';
import Badge from '../atoms/Badge';
import { 
  CAF_OBJECTIVES, 
  CAF_PRINCIPLES, 
  CAF_OUTCOMES, 
  CAF_STATS,
  DEFAULT_STATUS,
  OUTCOME_STATUS,
  createDefaultAssessment,
  getOverallProgress,
  getPrincipleProgress,
  getObjectiveProgress
} from './ncscCafData';

const STORAGE_KEY = 'cyberTrustDashboard.ncscCafAssessment';

const AssessmentHeader = ({ title, progress, onReset, onExport }) => (
  <div className="dashboard-card p-6 mb-6">
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
      <div className="mb-4 md:mb-0">
        <h1 className="text-2xl font-bold text-secondary-900 dark:text-white flex items-center">
          <ShieldCheck className="w-7 h-7 mr-3 text-primary-600" />
          {title}
        </h1>
        <p className="text-secondary-500 dark:text-secondary-400 mt-1">
          NCSC Cyber Assessment Framework v4.0 for Essential Services
        </p>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-medium text-secondary-600 dark:text-secondary-300">Overall Completion</p>
          <p className="text-2xl font-bold">{progress.toFixed(1)}%</p>
        </div>
        <Button variant="secondary" onClick={onReset} leadingIcon={RotateCcw}>
          Reset Assessment
        </Button>
        <Button variant="primary" onClick={onExport} leadingIcon={Download}>
          Export Assessment
        </Button>
      </div>
    </div>
    <div className="w-full bg-secondary-200 dark:bg-secondary-700 rounded-full h-2.5 mt-4">
      <div 
        className="bg-primary-600 h-2.5 rounded-full" 
        style={{ width: `${progress}%` }}
      ></div>
    </div>
  </div>
);

const StatsRow = ({ stats }) => (
  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
    <div className="dashboard-card p-4 text-center">
      <div className="text-2xl font-bold text-primary-600">{CAF_STATS.objectives}</div>
      <div className="text-sm text-secondary-500">Objectives</div>
    </div>
    <div className="dashboard-card p-4 text-center">
      <div className="text-2xl font-bold text-primary-600">{CAF_STATS.principles}</div>
      <div className="text-sm text-secondary-500">Principles</div>
    </div>
    <div className="dashboard-card p-4 text-center">
      <div className="text-2xl font-bold text-primary-600">{CAF_STATS.outcomes}</div>
      <div className="text-sm text-secondary-500">Outcomes</div>
    </div>
    <div className="dashboard-card p-4 text-center">
      <div className="text-2xl font-bold text-primary-600">{CAF_STATS.igps}</div>
      <div className="text-sm text-secondary-500">IGPs</div>
    </div>
    <div className="dashboard-card p-4 text-center">
      <div className="text-2xl font-bold text-primary-600">{stats.achieved}</div>
      <div className="text-sm text-secondary-500">Achieved</div>
    </div>
  </div>
);

const FiltersRow = ({ searchTerm, setSearchTerm, objectiveFilter, setObjectiveFilter, statusFilter, setStatusFilter }) => (
  <div className="dashboard-card p-4 mb-6">
    <div className="flex flex-col md:flex-row gap-4">
      <div className="flex-1">
        <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
          Search
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-4 h-4" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search outcomes..."
            className="w-full pl-10 py-2 border border-secondary-300 dark:border-secondary-700 rounded-md bg-white dark:bg-secondary-800 text-sm"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
          Objective
        </label>
        <select
          value={objectiveFilter}
          onChange={(e) => setObjectiveFilter(e.target.value)}
          className="w-full py-2 border border-secondary-300 dark:border-secondary-700 rounded-md bg-white dark:bg-secondary-800 text-sm"
        >
          <option value="all">All Objectives</option>
          {CAF_OBJECTIVES.map(obj => (
            <option key={obj.id} value={obj.id}>
              {obj.id}: {obj.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
          Status
        </label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full py-2 border border-secondary-300 dark:border-secondary-700 rounded-md bg-white dark:bg-secondary-800 text-sm"
        >
          <option value="all">All Statuses</option>
          <option value="achieved">Achieved</option>
          <option value="partially">Partially Achieved</option>
          <option value="not-achieved">Not Achieved</option>
          <option value="not-assessed">Not Assessed</option>
        </select>
      </div>
    </div>
  </div>
);

const ObjectiveTabs = ({ activeObjective, setActiveObjective, objectiveProgress }) => (
  <div className="flex flex-wrap border-b border-secondary-200 dark:border-secondary-700 mb-6">
    {CAF_OBJECTIVES.map(objective => (
      <button
        key={objective.id}
        onClick={() => setActiveObjective(objective.id)}
        className={`px-4 py-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${
          activeObjective === objective.id
            ? 'border-primary-600 text-primary-600'
            : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
        }`}
      >
        <span>Objective {objective.id}</span>
        <Badge 
          variant={objectiveProgress[objective.id]?.completionPct > 50 ? "success" : "secondary"} 
          size="xs"
        >
          {objectiveProgress[objective.id]?.completionPct.toFixed(0)}%
        </Badge>
      </button>
    ))}
  </div>
);

const PrincipleSection = ({ principle, expanded, toggleExpanded, progress, outcomes, assessment, onUpdateOutcome, searchTerm, statusFilter }) => {
  const filteredOutcomes = outcomes.filter(outcome => {
    const matchesSearch = searchTerm === '' || 
      outcome.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
      outcome.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      (assessment[outcome.id] || DEFAULT_STATUS) === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (filteredOutcomes.length === 0) return null;

  return (
    <div className="dashboard-card mb-4 overflow-hidden">
      <div 
        className="p-4 bg-secondary-50 dark:bg-secondary-900/50 border-b border-secondary-200 dark:border-secondary-700 cursor-pointer flex justify-between items-center"
        onClick={toggleExpanded}
      >
        <div>
          <h3 className="font-semibold text-primary-700 dark:text-primary-300 flex items-center">
            <span className="bg-primary-600 text-white px-2 py-0.5 rounded text-xs mr-2">{principle.id}</span>
            {principle.name}
          </h3>
          <p className="text-sm text-secondary-500 dark:text-secondary-400 mt-1">{principle.description}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-24 bg-secondary-200 dark:bg-secondary-700 rounded-full h-1.5">
            <div 
              className="bg-primary-500 h-1.5 rounded-full" 
              style={{ width: `${progress.completionPct}%` }}
            ></div>
          </div>
          <ChevronDown className={`w-5 h-5 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </div>
      </div>
      
      {expanded && (
        <div className="divide-y divide-secondary-100 dark:divide-secondary-700/50">
          {filteredOutcomes.map(outcome => (
            <OutcomeItem 
              key={outcome.id} 
              outcome={outcome} 
              status={assessment[outcome.id] || DEFAULT_STATUS} 
              onUpdate={onUpdateOutcome} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

const OutcomeItem = ({ outcome, status, onUpdate }) => {
  const statusStyles = {
    'achieved': 'bg-green-500 text-white',
    'partially': 'bg-yellow-500 text-white',
    'not-achieved': 'bg-red-500 text-white',
    'not-assessed': 'bg-secondary-300 text-secondary-700'
  };

  return (
    <div className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h4 className="font-semibold text-secondary-900 dark:text-white flex items-center">
          <span className="text-primary-600 mr-2">{outcome.id}</span>
          {outcome.name}
        </h4>
      </div>
      <div className="flex gap-2">
        <Button 
          size="sm" 
          className={`!px-3 !py-1 ${status === 'not-achieved' ? statusStyles['not-achieved'] : 'bg-secondary-200 dark:bg-secondary-600 text-secondary-800 dark:text-secondary-200'}`}
          onClick={() => onUpdate(outcome.id, 'not-achieved')}
        >
          Not Achieved
        </Button>
        <Button 
          size="sm" 
          className={`!px-3 !py-1 ${status === 'partially' ? statusStyles['partially'] : 'bg-secondary-200 dark:bg-secondary-600 text-secondary-800 dark:text-secondary-200'}`}
          onClick={() => onUpdate(outcome.id, 'partially')}
        >
          Partially
        </Button>
        <Button 
          size="sm" 
          className={`!px-3 !py-1 ${status === 'achieved' ? statusStyles['achieved'] : 'bg-secondary-200 dark:bg-secondary-600 text-secondary-800 dark:text-secondary-200'}`}
          onClick={() => onUpdate(outcome.id, 'achieved')}
        >
          Achieved
        </Button>
      </div>
    </div>
  );
};

const NCSCCAFAssessment = () => {
  const [assessment, setAssessment] = useState({});
  const [activeObjective, setActiveObjective] = useState('A');
  const [expandedPrinciples, setExpandedPrinciples] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [objectiveFilter, setObjectiveFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    try {
      setLoading(true);
      const savedAssessment = localStorage.getItem(STORAGE_KEY);
      if (savedAssessment) {
        setAssessment(JSON.parse(savedAssessment));
      } else {
        const defaultAssessment = createDefaultAssessment();
        setAssessment(defaultAssessment);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultAssessment));
      }
    } catch (e) {
      console.error("Failed to load NCSC CAF assessment from storage:", e);
    } finally {
      setLoading(false);
    }
  }, []);
  
  const overallProgress = useMemo(() => {
    return getOverallProgress(assessment);
  }, [assessment]);
  
  const principleProgress = useMemo(() => {
    const progress = {};
    Object.keys(CAF_PRINCIPLES).forEach(objectiveId => {
      CAF_PRINCIPLES[objectiveId].forEach(principle => {
        progress[principle.id] = getPrincipleProgress(assessment, principle.id);
      });
    });
    return progress;
  }, [assessment]);
  
  const objectiveProgress = useMemo(() => {
    const progress = {};
    CAF_OBJECTIVES.forEach(objective => {
      progress[objective.id] = getObjectiveProgress(assessment, objective.id);
    });
    return progress;
  }, [assessment]);
  
  const handleUpdateOutcome = (outcomeId, status) => {
    setAssessment(prev => {
      const updatedAssessment = { 
        ...prev,
        [outcomeId]: status
      };
      
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedAssessment));
      } catch (e) {
        console.error("Failed to save NCSC CAF assessment to storage:", e);
      }
      
      return updatedAssessment;
    });
  };
  
  const handleResetAssessment = () => {
    if (window.confirm('Are you sure you want to reset the entire assessment? This action cannot be undone.')) {
      try {
        const defaultAssessment = createDefaultAssessment();
        setAssessment(defaultAssessment);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultAssessment));
      } catch (e) {
        console.error("Failed to reset NCSC CAF assessment:", e);
      }
    }
  };
  
  const handleExportAssessment = () => {
    try {
      const dataStr = JSON.stringify(assessment, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `ncsc-caf-assessment-${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    } catch (e) {
      console.error("Failed to export NCSC CAF assessment:", e);
    }
  };
  
  const togglePrinciple = (principleId) => {
    setExpandedPrinciples(prev => ({
      ...prev,
      [principleId]: !prev[principleId]
    }));
  };
  
  const visibleObjectives = objectiveFilter === 'all' 
    ? CAF_OBJECTIVES 
    : CAF_OBJECTIVES.filter(obj => obj.id === objectiveFilter);
  
  if (loading) {
    return <div className="p-6 text-center">Loading assessment data...</div>;
  }
  
  return (
    <div className="space-y-6">
      {/* Back navigation */}
      <button
        onClick={() => navigate('/dashboard/standards-frameworks')}
        className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-2"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back
      </button>
      <AssessmentHeader 
        title="NCSC CAF v4.0 Assessment" 
        progress={overallProgress.completionPct}
        onReset={handleResetAssessment}
        onExport={handleExportAssessment}
      />
      
      <StatsRow stats={overallProgress} />
      
      <FiltersRow 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        objectiveFilter={objectiveFilter}
        setObjectiveFilter={setObjectiveFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />
      
      <ObjectiveTabs 
        activeObjective={activeObjective}
        setActiveObjective={setActiveObjective}
        objectiveProgress={objectiveProgress}
      />
      
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold text-secondary-900 dark:text-white">
            {CAF_OBJECTIVES.find(obj => obj.id === activeObjective)?.name || ''}
          </h2>
        </div>
        <p className="text-secondary-600 dark:text-secondary-400">
          {CAF_OBJECTIVES.find(obj => obj.id === activeObjective)?.description || ''}
        </p>
      </div>
      
      {visibleObjectives.map(objective => (
        <div key={objective.id} className={objective.id !== activeObjective ? 'hidden' : ''}>
          {CAF_PRINCIPLES[objective.id]?.map(principle => (
            <PrincipleSection 
              key={principle.id}
              principle={principle}
              expanded={expandedPrinciples[principle.id] || false}
              toggleExpanded={() => togglePrinciple(principle.id)}
              progress={principleProgress[principle.id] || { completionPct: 0 }}
              outcomes={CAF_OUTCOMES[principle.id] || []}
              assessment={assessment}
              onUpdateOutcome={handleUpdateOutcome}
              searchTerm={searchTerm}
              statusFilter={statusFilter}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default NCSCCAFAssessment;
