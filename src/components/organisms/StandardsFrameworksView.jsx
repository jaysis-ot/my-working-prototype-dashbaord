import React, { useState, useMemo, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { ShieldCheck, BarChart3, RotateCcw, ChevronDown, Check, X, Minus, Info, Download, Eye } from 'lucide-react';
import Button from '../atoms/Button';
import Badge from '../atoms/Badge';
import { Link } from 'react-router-dom';

// --- Internal Molecules (Components specific to this Organism) ---

const FrameworkHeader = ({ title, description, progress, onReset }) => (
  <div className="dashboard-card p-6 mb-6">
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
      <div className="mb-4 md:mb-0">
        <h1 className="text-2xl font-bold text-secondary-900 dark:text-white flex items-center">
          <ShieldCheck className="w-7 h-7 mr-3 text-primary-600" />
          {title}
        </h1>
        <p className="text-secondary-500 dark:text-secondary-400 mt-1">{description}</p>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-medium text-secondary-600 dark:text-secondary-300">Overall Completion</p>
          <p className="text-2xl font-bold">{progress.toFixed(1)}%</p>
        </div>
        <Button variant="secondary" onClick={onReset} leadingIcon={RotateCcw}>
          Reset Assessment
        </Button>
      </div>
    </div>
    <div className="w-full bg-secondary-200 dark:bg-secondary-700 rounded-full h-2.5 mt-4">
      <div className="bg-primary-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
    </div>
  </div>
);
FrameworkHeader.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  progress: PropTypes.number.isRequired,
  onReset: PropTypes.func.isRequired,
};

const AssessmentProgressCard = ({ func, score, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`dashboard-card p-4 text-left transition-all duration-200 ${isActive ? 'ring-2 ring-primary-500 shadow-lg' : 'hover:shadow-md hover:-translate-y-0.5'}`}
  >
    <div className="flex justify-between items-start mb-2">
      <div>
        <p className="text-xl font-extrabold leading-none">{func.id}</p>
        <p className="text-xs text-secondary-500 dark:text-secondary-400">{func.name}</p>
      </div>
      <span
        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
          score.percentage === 0
            ? 'bg-secondary-200 dark:bg-secondary-700 text-secondary-600'
            : score.percentage < 50
            ? 'bg-red-100 text-red-600'
            : score.percentage < 80
            ? 'bg-yellow-100 text-yellow-700'
            : 'bg-green-100 text-green-700'
        }`}
      >
        {score.percentage.toFixed(0)}%
      </span>
    </div>
    <div className="w-full bg-secondary-200 dark:bg-secondary-700 rounded-full h-1.5">
      <div className="bg-primary-500 h-1.5 rounded-full" style={{ width: `${score.percentage}%` }}></div>
    </div>
  </button>
);
AssessmentProgressCard.propTypes = {
  func: PropTypes.object.isRequired,
  score: PropTypes.object.isRequired,
  isActive: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
};

const SubcategoryItem = ({ subcategory, response, onUpdate }) => {
  const responseOptions = ['Yes', 'Partial', 'No', 'N/A'];
  const responseStyles = {
    Yes: 'bg-green-500 hover:bg-green-600',
    Partial: 'bg-yellow-500 hover:bg-yellow-600',
    No: 'bg-red-500 hover:bg-red-600',
    'N/A': 'bg-secondary-400 hover:bg-secondary-500',
  };
  const statusIcons = {
    Yes: <Check className="w-3 h-3 text-green-700" />,
    Partial: <Minus className="w-3 h-3 text-yellow-700" />,
    No: <X className="w-3 h-3 text-red-700" />,
    'N/A': <Info className="w-3 h-3 text-secondary-500" />,
  };

  return (
    <div className="py-3 px-4 border-b border-secondary-100 dark:border-secondary-700/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex-1">
        <p className="font-semibold text-sm text-secondary-800 dark:text-secondary-100 flex items-center">
          <span className="mr-2">{statusIcons[response] || <Info className="w-3 h-3 text-secondary-400" />}</span>
          {subcategory.id}
        </p>
        <p className="text-sm text-secondary-600 dark:text-secondary-300 pl-7">{subcategory.description}</p>
      </div>
      <div className="flex-shrink-0 flex items-center gap-2">
        {responseOptions.map(option => (
          <Button
            key={option}
            size="sm"
            onClick={() => onUpdate(subcategory.id, option)}
            className={`!px-3 !py-1 ${response === option ? responseStyles[option] + ' text-white' : 'bg-secondary-200 dark:bg-secondary-600 text-secondary-800 dark:text-secondary-200'}`}
          >
            {option}
          </Button>
        ))}
      </div>
    </div>
  );
};
SubcategoryItem.propTypes = {
  subcategory: PropTypes.object.isRequired,
  response: PropTypes.string,
  onUpdate: PropTypes.func.isRequired,
};

// --- Main Organism Component ---

const StandardsFrameworksView = ({ framework, assessment, scores, onUpdateResponse, onReset }) => {
  const [activeFunctionId, setActiveFunctionId] = useState('GV');
  const [expandedCategories, setExpandedCategories] = useState({});
  // Track whether local assessments exist to switch button copy
  const [hasIsoAssessment, setHasIsoAssessment] = useState(false);
  const [hasCafAssessment, setHasCafAssessment] = useState(false);

  // On mount, inspect localStorage for saved progress
  useEffect(() => {
    try {
      setHasIsoAssessment(!!localStorage.getItem('cyberTrustDashboard.iso27001Assessment'));
      setHasCafAssessment(!!localStorage.getItem('cyberTrustDashboard.ncscCafAssessment'));
    } catch (e) {
      // In environments where localStorage is unavailable (SSR), ignore
      console.warn('StandardsFrameworksView: localStorage check failed', e);
    }
  }, []);

  const PageHeader = () => (
    <div className="mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2">
        <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">
          Standards &amp; Compliance Framework Assessment
        </h1>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="secondary">Test</Button>
          <Button size="sm">Export CSV</Button>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 text-xs">
        <Badge variant="primary">NIST CSF {scores.overall.percentage.toFixed(0)}% complete</Badge>
        <Badge variant="secondary">{Object.keys(framework.functions).length} frameworks available</Badge>
        <Badge variant="success">Compliance tracking active</Badge>
      </div>
    </div>
  );

  const FrameworkCards = () => (
    <div className="dashboard-card p-6 mb-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-secondary-900 dark:text-white">Standards &amp; Frameworks</h2>
          <p className="text-sm text-secondary-500 dark:text-secondary-400">
            Assess and manage compliance across multiple cybersecurity and governance frameworks
          </p>
        </div>
        <p className="text-sm font-medium text-secondary-600 dark:text-secondary-300">
          <span className="text-primary-600 dark:text-primary-400 text-xl font-bold">3</span> Frameworks Available
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="dashboard-card p-4 border-primary-300 ring-1 ring-primary-300">
          <p className="text-sm font-semibold">NIST CSF 2.0</p>
          <Badge size="xs" variant="success" className="mt-1">Available</Badge>
          <p className="text-xs mt-1">
            National Institute of Standards and Technology Cybersecurity Framework&nbsp;2.0
          </p>
          <div className="mt-3 w-full bg-secondary-200 dark:bg-secondary-700 rounded-full h-1.5">
            <div
              className="bg-primary-500 h-1.5 rounded-full"
              style={{ width: `${scores.overall.percentage}%` }}
            />
          </div>
        </div>
        <div className="dashboard-card p-4">
          <p className="text-sm font-semibold">ISO&nbsp;27001</p>
          <Badge size="xs" variant="success" className="mt-1">Available</Badge>
          <p className="text-xs mt-1">Information Security Management System Standard</p>
          <div className="mt-3">
            <Link to="/dashboard/standards-frameworks/iso27001">
              <Button size="sm" className="w-full">
                {hasIsoAssessment ? 'Resume Assessment' : 'Open Assessment'}
              </Button>
            </Link>
          </div>
        </div>
        <div className="dashboard-card p-4">
          <p className="text-sm font-semibold">NCSC CAF&nbsp;v4.0</p>
          <Badge size="xs" variant="success" className="mt-1">Available</Badge>
          <p className="text-xs mt-1">Cyber Assessment Framework for Essential Services</p>
          <div className="mt-3">
            <Link to="/dashboard/standards-frameworks/ncsc-caf">
              <Button size="sm" className="w-full">
                {hasCafAssessment ? 'Resume Assessment' : 'Open Assessment'}
              </Button>
            </Link>
          </div>
        </div>
        <div className="dashboard-card p-4">
          <p className="text-sm font-semibold">SOC 2</p>
          <Badge size="xs" variant="secondary" className="mt-1">Coming Soon</Badge>
          <p className="text-xs mt-1">Service Organization Control 2 Type II</p>
        </div>
      </div>
    </div>
  );

  const toggleCategory = useCallback((categoryId) => {
    setExpandedCategories(prev => ({ ...prev, [categoryId]: !prev[categoryId] }));
  }, []);

  const handleFunctionFilter = useCallback((functionId) => {
    setActiveFunctionId(prev => (prev === functionId ? null : functionId));
  }, []);

  const functionsToDisplay = useMemo(() => {
    if (activeFunctionId) {
      return framework.functions.filter(f => f.id === activeFunctionId);
    }
    return framework.functions;
  }, [framework.functions, activeFunctionId]);

  return (
    <div className="space-y-6">
      <PageHeader />
      <FrameworkCards />
      <FrameworkHeader
        title="NIST Cybersecurity Framework 2.0 Assessment"
        description="Assess your organization's capabilities against the NIST Cybersecurity Framework 2.0."
        progress={scores.overall.percentage}
        onReset={onReset}
      />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {framework.functions.map(func => (
          <AssessmentProgressCard
            key={func.id}
            func={func}
            score={scores.byFunction[func.id] || { percentage: 0 }}
            isActive={activeFunctionId === func.id}
            onClick={() => handleFunctionFilter(func.id)}
          />
        ))}
      </div>

      <div className="space-y-4">
        {functionsToDisplay.map(func => (
          <div key={func.id} className="dashboard-card overflow-hidden">
            <div className="flex items-center justify-between p-4 bg-secondary-50 dark:bg-secondary-900/50 border-b border-secondary-200 dark:border-secondary-700">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <span className="text-primary-600">{func.id}</span>
                <span>–</span>
                <span>{func.name}</span>
              </h2>
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" leadingIcon={Eye}>View Progress</Button>
                <Button variant="primary" size="sm" leadingIcon={Download}>Export Assessment</Button>
              </div>
            </div>

            <div className="px-4 py-2 text-sm text-secondary-600 dark:text-secondary-400">
              Current Function Score:&nbsp;
              <span className="font-semibold text-secondary-900 dark:text-white">
                {scores.byFunction[func.id]?.percentage.toFixed(1) ?? 0}%
              </span>
            </div>

            <div className="divide-y divide-secondary-200 dark:divide-secondary-700">
              {(framework.categories[func.id] || []).map(cat => (
                <div key={cat.id}>
                  <button
                    className="w-full p-4 text-left flex justify-between items-center hover:bg-secondary-50 dark:hover:bg-secondary-700/50"
                    onClick={() => toggleCategory(cat.id)}
                  >
                    <div className="flex items-center">
                      <h3 className="font-semibold text-primary-700 dark:text-primary-300">{cat.name} ({cat.id})</h3>
                      <Badge variant="default" size="sm" className="ml-2">
                        {scores.byCategory[cat.id]?.percentage.toFixed(0) ?? 0}%
                      </Badge>
                    </div>
                    <ChevronDown className={`w-5 h-5 transition-transform ${expandedCategories[cat.id] ? 'rotate-180' : ''}`} />
                  </button>
                  {expandedCategories[cat.id] && (
                    <div className="bg-white dark:bg-secondary-800">
                      {(framework.subcategories[cat.id] || []).map(subcategory => (
                        <SubcategoryItem
                          key={subcategory.id}
                          subcategory={subcategory}
                          response={assessment[subcategory.id]}
                          onUpdate={onUpdateResponse}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

StandardsFrameworksView.propTypes = {
  framework: PropTypes.object.isRequired,
  assessment: PropTypes.object.isRequired,
  scores: PropTypes.object.isRequired,
  onUpdateResponse: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired,
};

export default StandardsFrameworksView;
