import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Download, RotateCcw, Save, FileText, AlertTriangle, CheckCircle, Clock, ArrowLeft } from 'lucide-react';
import Button from '../atoms/Button';
import Badge from '../atoms/Badge';
import { 
  ISO_27001_STRUCTURE, 
  SCORING_TEMPLATE, 
  calculateClauseCompletion, 
  calculateOverallCompletion,
  getCompletionBySection,
  getControlPriority,
  createDefaultAssessment
} from './iso27001Data';

const STORAGE_KEY = 'cyberTrustDashboard.iso27001Assessment';

// Helper components
const AssessmentHeader = ({ title, progress, onReset, onExport }) => (
  <div className="dashboard-card p-6 mb-6">
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
      <div className="mb-4 md:mb-0">
        <h1 className="text-2xl font-bold text-secondary-900 dark:text-white flex items-center">
          <ShieldCheck className="w-7 h-7 mr-3 text-primary-600" />
          {title}
        </h1>
        <p className="text-secondary-500 dark:text-secondary-400 mt-1">
          ISO/IEC 27001:2022 Information Security Management System Assessment
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

const ClauseTabs = ({ clauses, activeClause, onChangeClause, completionData }) => (
  <div className="flex flex-wrap border-b border-secondary-200 dark:border-secondary-700 mb-6">
    {Object.values(clauses).map(clause => (
      <button
        key={clause.id}
        onClick={() => onChangeClause(clause.id)}
        className={`px-4 py-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${
          activeClause === clause.id
            ? 'border-primary-600 text-primary-600'
            : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
        }`}
      >
        <clause.icon className="w-4 h-4" />
        <span>{clause.name}</span>
        <Badge 
          variant={completionData[clause.id]?.completion > 50 ? "success" : "secondary"} 
          size="xs"
        >
          {completionData[clause.id]?.completion.toFixed(0)}%
        </Badge>
      </button>
    ))}
  </div>
);

const SectionCard = ({ section, sectionId, clauseId, controls, assessmentData, onUpdateControl, completion }) => (
  <div className="dashboard-card mb-6 overflow-hidden">
    <div className="p-4 bg-secondary-50 dark:bg-secondary-900/50 border-b border-secondary-200 dark:border-secondary-700">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-primary-700 dark:text-primary-300">{section.name}</h3>
        <Badge variant="default" size="sm">
          {completion.completion.toFixed(0)}% Complete
        </Badge>
      </div>
      <div className="w-full bg-secondary-200 dark:bg-secondary-700 rounded-full h-1.5 mt-2">
        <div 
          className="bg-primary-500 h-1.5 rounded-full" 
          style={{ width: `${completion.completion}%` }}
        ></div>
      </div>
    </div>
    <div className="divide-y divide-secondary-100 dark:divide-secondary-700/50">
      {controls.map(control => (
        <ControlItem 
          key={control.id} 
          control={control} 
          assessment={assessmentData[control.id] || {...SCORING_TEMPLATE}}
          onUpdate={(field, value) => onUpdateControl(control.id, field, value)}
        />
      ))}
    </div>
  </div>
);

const ControlItem = ({ control, assessment, onUpdate }) => {
  const priorityColors = {
    'Critical': 'bg-red-100 text-red-800',
    'High': 'bg-orange-100 text-orange-800',
    'Medium': 'bg-yellow-100 text-yellow-800',
    'Low': 'bg-green-100 text-green-800'
  };
  
  const priority = getControlPriority(control);
  
  return (
    <div className="p-4">
      <div className="flex flex-col md:flex-row justify-between gap-2 mb-3">
        <div>
          <h4 className="font-semibold text-secondary-900 dark:text-white flex items-center">
            <span className="mr-2">{control.id}</span>
            <span>–</span>
            <span className="ml-2">{control.title}</span>
          </h4>
          <p className="text-sm text-secondary-600 dark:text-secondary-400 mt-1">
            {control.description}
          </p>
        </div>
        <div className="flex-shrink-0 flex flex-wrap gap-2 items-start">
          <Badge 
            className={priorityColors[priority]}
            size="sm"
          >
            {priority} Priority
          </Badge>
          {control.type && (
            <Badge 
              variant="secondary" 
              size="sm"
            >
              {control.type}
            </Badge>
          )}
          {control.properties && control.properties.map(prop => (
            <Badge 
              key={prop} 
              variant="outline" 
              size="xs"
            >
              {prop}
            </Badge>
          ))}
        </div>
      </div>
      
      {control.nistMapping && control.nistMapping.length > 0 && (
        <div className="mb-3">
          <p className="text-xs text-secondary-500 dark:text-secondary-400 mb-1">NIST CSF Mapping:</p>
          <div className="flex flex-wrap gap-1">
            {control.nistMapping.map(mapping => (
              <Badge 
                key={mapping} 
                variant="primary" 
                size="xs"
              >
                {mapping}
              </Badge>
            ))}
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
        <div>
          <label className="block text-xs font-medium text-secondary-700 dark:text-secondary-300 mb-1">
            Maturity Level
          </label>
          <select
            value={assessment.maturity}
            onChange={(e) => onUpdate('maturity', parseInt(e.target.value))}
            className="w-full rounded-md border border-secondary-300 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-sm"
          >
            {[0, 1, 2, 3, 4, 5].map(value => (
              <option key={value} value={value}>
                {value} - {value === 0 ? 'Not Assessed' : value === 1 ? 'Initial' : value === 2 ? 'Developing' : value === 3 ? 'Defined' : value === 4 ? 'Managed' : 'Optimized'}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-secondary-700 dark:text-secondary-300 mb-1">
            Implementation
          </label>
          <select
            value={assessment.implementation}
            onChange={(e) => onUpdate('implementation', parseInt(e.target.value))}
            className="w-full rounded-md border border-secondary-300 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-sm"
          >
            {[0, 1, 2, 3, 4, 5].map(value => (
              <option key={value} value={value}>
                {value} - {value === 0 ? 'Not Implemented' : value === 1 ? 'Planning' : value === 2 ? 'Partially' : value === 3 ? 'Largely' : value === 4 ? 'Fully' : 'Optimized'}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-secondary-700 dark:text-secondary-300 mb-1">
            Evidence Quality
          </label>
          <select
            value={assessment.evidence}
            onChange={(e) => onUpdate('evidence', parseInt(e.target.value))}
            className="w-full rounded-md border border-secondary-300 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-sm"
          >
            {[0, 1, 2, 3, 4, 5].map(value => (
              <option key={value} value={value}>
                {value} - {value === 0 ? 'No Evidence' : value === 1 ? 'Minimal' : value === 2 ? 'Partial' : value === 3 ? 'Adequate' : value === 4 ? 'Substantial' : 'Comprehensive'}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-secondary-700 dark:text-secondary-300 mb-1">
            Testing Status
          </label>
          <select
            value={assessment.testing}
            onChange={(e) => onUpdate('testing', parseInt(e.target.value))}
            className="w-full rounded-md border border-secondary-300 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-sm"
          >
            {[0, 1, 2, 3, 4, 5].map(value => (
              <option key={value} value={value}>
                {value} - {value === 0 ? 'Not Tested' : value === 1 ? 'Planned' : value === 2 ? 'Limited' : value === 3 ? 'Regular' : value === 4 ? 'Thorough' : 'Continuous'}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div>
        <label className="block text-xs font-medium text-secondary-700 dark:text-secondary-300 mb-1">
          Notes
        </label>
        <textarea
          value={assessment.notes || ''}
          onChange={(e) => onUpdate('notes', e.target.value)}
          rows="2"
          className="w-full rounded-md border border-secondary-300 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-sm"
          placeholder="Add implementation notes, gaps, or action items here..."
        ></textarea>
      </div>
      
      {assessment.lastUpdated && (
        <div className="mt-2 text-xs text-secondary-500 dark:text-secondary-400 flex items-center">
          <Clock className="w-3 h-3 mr-1" />
          Last updated: {new Date(assessment.lastUpdated).toLocaleString()}
        </div>
      )}
    </div>
  );
};

const ISO27001Assessment = () => {
  const [assessment, setAssessment] = useState({});
  const [activeClause, setActiveClause] = useState('A5');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  // Load assessment data from localStorage on component mount
  useEffect(() => {
    try {
      setLoading(true);
      const savedAssessment = localStorage.getItem(STORAGE_KEY);
      if (savedAssessment) {
        setAssessment(JSON.parse(savedAssessment));
      } else {
        // Initialize with default assessment if no saved data
        const defaultAssessment = createDefaultAssessment();
        setAssessment(defaultAssessment);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultAssessment));
      }
    } catch (e) {
      console.error("Failed to load ISO 27001 assessment from storage:", e);
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Calculate completion rates for each clause
  const completionData = useMemo(() => {
    const data = {};
    Object.keys(ISO_27001_STRUCTURE).forEach(clauseId => {
      data[clauseId] = calculateClauseCompletion(assessment, clauseId);
    });
    return data;
  }, [assessment]);
  
  // Calculate overall completion
  const overallCompletion = useMemo(() => {
    return calculateOverallCompletion(assessment);
  }, [assessment]);
  
  // Update control assessment
  const handleUpdateControl = (controlId, field, value) => {
    setAssessment(prev => {
      const updatedAssessment = { 
        ...prev,
        [controlId]: {
          ...(prev[controlId] || {...SCORING_TEMPLATE}),
          [field]: value,
          lastUpdated: new Date().toISOString()
        }
      };
      
      // Save to localStorage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedAssessment));
      } catch (e) {
        console.error("Failed to save ISO 27001 assessment to storage:", e);
      }
      
      return updatedAssessment;
    });
  };
  
  // Reset assessment
  const handleResetAssessment = () => {
    if (window.confirm('Are you sure you want to reset the entire assessment? This action cannot be undone.')) {
      try {
        const defaultAssessment = createDefaultAssessment();
        setAssessment(defaultAssessment);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultAssessment));
      } catch (e) {
        console.error("Failed to reset ISO 27001 assessment:", e);
      }
    }
  };
  
  // Export assessment as JSON file
  const handleExportAssessment = () => {
    try {
      const dataStr = JSON.stringify(assessment, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `iso27001-assessment-${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    } catch (e) {
      console.error("Failed to export ISO 27001 assessment:", e);
    }
  };
  
  // Get active clause data
  const activeClauseData = ISO_27001_STRUCTURE[activeClause];
  
  if (loading) {
    return <div className="p-6 text-center">Loading assessment data...</div>;
  }
  
  return (
    <div className="space-y-6">
      {/* Back navigation */}
      <button
        onClick={() => navigate('/dashboard/standards-frameworks')}
        className="inline-flex items-center text-blue-600 hover:text-blue-800"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back
      </button>
      <AssessmentHeader 
        title="ISO 27001:2022 Assessment" 
        progress={overallCompletion.completion}
        onReset={handleResetAssessment}
        onExport={handleExportAssessment}
      />
      
      <ClauseTabs 
        clauses={ISO_27001_STRUCTURE} 
        activeClause={activeClause}
        onChangeClause={setActiveClause}
        completionData={completionData}
      />
      
      {activeClauseData && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-secondary-900 dark:text-white">
              {activeClauseData.name}
            </h2>
            <Badge variant="primary" size="sm">
              {activeClauseData.controlCount} Controls
            </Badge>
          </div>
          <p className="text-secondary-600 dark:text-secondary-400">
            {activeClauseData.description}
          </p>
        </div>
      )}
      
      {activeClauseData && Object.entries(activeClauseData.sections).map(([sectionId, section]) => (
        <SectionCard 
          key={sectionId}
          section={section}
          sectionId={sectionId}
          clauseId={activeClause}
          controls={section.controls}
          assessmentData={assessment}
          onUpdateControl={handleUpdateControl}
          completion={getCompletionBySection(assessment, activeClause, sectionId)}
        />
      ))}
    </div>
  );
};

export default ISO27001Assessment;
