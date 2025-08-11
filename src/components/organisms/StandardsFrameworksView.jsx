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
  const [hasSoc2Assessment, setHasSoc2Assessment] = useState(false);
  const [hasNistAssessment, setHasNistAssessment] = useState(false);
  // Track progress for each framework
  const [isoProgress, setIsoProgress] = useState(0);
  const [cafProgress, setCafProgress] = useState(0);
  const [soc2Progress, setSoc2Progress] = useState(0);

  // On mount, inspect localStorage for saved progress
  useEffect(() => {
    try {
      // Check if assessments exist
      const hasIso = !!localStorage.getItem('cyberTrustDashboard.iso27001Assessment');
      const hasCaf = !!localStorage.getItem('cyberTrustDashboard.ncscCafAssessment');
      const hasSoc2 = !!localStorage.getItem('cyberTrustDashboard.soc2Assessment');
      const hasNist = scores.overall.percentage > 0 || !!localStorage.getItem('cyberTrustDashboard.nistCsfAssessment');
      
      setHasIsoAssessment(hasIso);
      setHasCafAssessment(hasCaf);
      setHasSoc2Assessment(hasSoc2);
      setHasNistAssessment(hasNist);
      
      // Calculate ISO 27001 progress
      if (hasIso) {
        try {
          const isoData = JSON.parse(localStorage.getItem('cyberTrustDashboard.iso27001Assessment'));
          let totalScore = 0;
          let totalControls = 0;
          
          Object.values(isoData).forEach(control => {
            if (control.maturity !== undefined) {
              const avgScore = (control.maturity + control.implementation + control.evidence + control.testing) / 4;
              totalScore += avgScore;
              totalControls++;
            }
          });
          
          const progress = totalControls > 0 ? (totalScore / totalControls) * (100 / 5) : 0; // Convert 0-5 scale to percentage
          setIsoProgress(Math.min(100, progress));
        } catch (e) {
          console.warn('Error calculating ISO 27001 progress:', e);
          setIsoProgress(0);
        }
      }
      
      // Calculate NCSC CAF progress
      if (hasCaf) {
        try {
          const cafData = JSON.parse(localStorage.getItem('cyberTrustDashboard.ncscCafAssessment'));
          let achieved = 0;
          let partial = 0;
          let total = 0;
          
          Object.entries(cafData).forEach(([_, status]) => {
            total++;
            if (status === 'achieved') achieved++;
            else if (status === 'partially') partial += 0.5;
          });
          
          const progress = total > 0 ? ((achieved + partial) / total) * 100 : 0;
          setCafProgress(Math.min(100, progress));
        } catch (e) {
          console.warn('Error calculating NCSC CAF progress:', e);
          setCafProgress(0);
        }
      }
      
      // Calculate SOC 2 progress
      if (hasSoc2) {
        try {
          const soc2Data = JSON.parse(localStorage.getItem('cyberTrustDashboard.soc2Assessment'));
          const selectedCategories = soc2Data.selectedCategories || ['security'];
          const assessment = soc2Data.assessment || {};
          
          // Category totals
          const categoryTotals = {
            security: 33,
            availability: 3,
            processing: 5,
            confidentiality: 2,
            privacy: 18
          };
          
          // Calculate total criteria based on selected categories
          let totalCriteria = 0;
          selectedCategories.forEach(cat => {
            totalCriteria += categoryTotals[cat] || 0;
          });
          
          // Count implemented and partial
          let implemented = 0;
          let partial = 0;
          
          Object.entries(assessment).forEach(([_, status]) => {
            if (status === 'implemented') implemented++;
            else if (status === 'partial') partial += 0.5;
          });
          
          const progress = totalCriteria > 0 ? ((implemented + partial) / totalCriteria) * 100 : 0;
          setSoc2Progress(Math.min(100, progress));
        } catch (e) {
          console.warn('Error calculating SOC 2 progress:', e);
          setSoc2Progress(0);
        }
      }
    } catch (e) {
      // In environments where localStorage is unavailable (SSR), ignore
      console.warn('StandardsFrameworksView: localStorage check failed', e);
    }
  }, [scores.overall.percentage]);

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
          <span className="text-primary-600 dark:text-primary-400 text-xl font-bold">4</span> Frameworks Available
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="dashboard-card p-4 border-primary-300 ring-1 ring-primary-300">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-sm font-semibold">NIST CSF 2.0</p>
              <Badge size="xs" variant="success" className="mt-1">Available</Badge>
              <p className="text-xs mt-1">
                National Institute of Standards and Technology Cybersecurity Framework&nbsp;2.0
              </p>
            </div>
            <Link to="/dashboard/standards-frameworks/nist-csf">
              <Button size="xs">
                {hasNistAssessment ? 'Resume Assessment' : 'Open Assessment'}
              </Button>
            </Link>
          </div>
          <div className="mt-3 w-full bg-secondary-200 dark:bg-secondary-700 rounded-full h-1.5">
            <div
              className="bg-primary-500 h-1.5 rounded-full"
              style={{ width: `${scores.overall.percentage}%` }}
            />
          </div>
        </div>
        <div className="dashboard-card p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-sm font-semibold">ISO&nbsp;27001</p>
              <Badge size="xs" variant="success" className="mt-1">Available</Badge>
              <p className="text-xs mt-1">Information Security Management System Standard</p>
            </div>
            <Link to="/dashboard/standards-frameworks/iso27001">
              <Button size="xs">
                {hasIsoAssessment ? 'Resume Assessment' : 'Open Assessment'}
              </Button>
            </Link>
          </div>
          <div className="mt-3 w-full bg-secondary-200 dark:bg-secondary-700 rounded-full h-1.5">
            <div
              className="bg-primary-500 h-1.5 rounded-full"
              style={{ width: `${isoProgress}%` }}
            />
          </div>
        </div>
        <div className="dashboard-card p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-sm font-semibold">NCSC CAF&nbsp;v4.0</p>
              <Badge size="xs" variant="success" className="mt-1">Available</Badge>
              <p className="text-xs mt-1">Cyber Assessment Framework for Essential Services</p>
            </div>
            <Link to="/dashboard/standards-frameworks/ncsc-caf">
              <Button size="xs">
                {hasCafAssessment ? 'Resume Assessment' : 'Open Assessment'}
              </Button>
            </Link>
          </div>
          <div className="mt-3 w-full bg-secondary-200 dark:bg-secondary-700 rounded-full h-1.5">
            <div
              className="bg-primary-500 h-1.5 rounded-full"
              style={{ width: `${cafProgress}%` }}
            />
          </div>
        </div>
        <div className="dashboard-card p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-sm font-semibold">SOC 2</p>
              <Badge size="xs" variant="success" className="mt-1">Available</Badge>
              <p className="text-xs mt-1">Service Organization Control 2 Trust Services Criteria</p>
            </div>
            <Link to="/dashboard/standards-frameworks/soc2">
              <Button size="xs">
                {hasSoc2Assessment ? 'Resume Assessment' : 'Open Assessment'}
              </Button>
            </Link>
          </div>
          <div className="mt-3 w-full bg-secondary-200 dark:bg-secondary-700 rounded-full h-1.5">
            <div
              className="bg-primary-500 h-1.5 rounded-full"
              style={{ width: `${soc2Progress}%` }}
            />
          </div>
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
