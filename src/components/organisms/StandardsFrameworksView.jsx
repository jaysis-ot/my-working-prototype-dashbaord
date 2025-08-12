import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { ShieldCheck, RotateCcw, Check, X, Minus, Info } from 'lucide-react';
import Button from '../atoms/Button';
import Badge from '../atoms/Badge';
import { Link } from 'react-router-dom';
import CircularProgress from '../atoms/CircularProgress';

// Format date as YYYY-MM-DD HH:mm
const formatDT = (dateObj) => {
  if (!dateObj) return '';
  const date = new Date(dateObj);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

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
  // Track whether local assessments exist to switch button copy
  const [hasIsoAssessment, setHasIsoAssessment] = useState(false);
  const [hasCafAssessment, setHasCafAssessment] = useState(false);
  const [hasSoc2Assessment, setHasSoc2Assessment] = useState(false);
  const [hasNistAssessment, setHasNistAssessment] = useState(false);
  // Track progress for each framework
  const [isoProgress, setIsoProgress] = useState(0);
  const [cafProgress, setCafProgress] = useState(0);
  const [soc2Progress, setSoc2Progress] = useState(0);
  // IEC 62443
  const [hasIecAssessment, setHasIecAssessment] = useState(false);
  const [iecProgress, setIecProgress] = useState(0);
  // Track last updated date
  const [lastUpdated, setLastUpdated] = useState(null);
  // Track average completion
  const [avgCompletion, setAvgCompletion] = useState(0);
  // Track metadata for each framework
  const [nistMeta, setNistMeta] = useState(null);
  const [isoMeta, setIsoMeta] = useState(null);
  const [cafMeta, setCafMeta] = useState(null);
  const [soc2Meta, setSoc2Meta] = useState(null);
  const [iecMeta, setIecMeta] = useState(null);

  // On mount, inspect localStorage for saved progress
  useEffect(() => {
    try {
      // Check if assessments exist
      const hasIso = !!localStorage.getItem('cyberTrustDashboard.iso27001Assessment');
      const hasCaf = !!localStorage.getItem('cyberTrustDashboard.ncscCafAssessment');
      const hasSoc2 = !!localStorage.getItem('cyberTrustDashboard.soc2Assessment');
      const hasNist = scores.overall.percentage > 0 || !!localStorage.getItem('cyberTrustDashboard.nistCsfAssessment');
      const hasIec = !!localStorage.getItem('cyberTrustDashboard.iec62443Assessment');
      
      setHasIsoAssessment(hasIso);
      setHasCafAssessment(hasCaf);
      setHasSoc2Assessment(hasSoc2);
      setHasNistAssessment(hasNist);
      setHasIecAssessment(hasIec);
      
      // Load metadata for each framework
      try {
        const nistMetaRaw = localStorage.getItem('cyberTrustDashboard.nistCsfAssessmentMeta');
        if (nistMetaRaw) {
          setNistMeta(JSON.parse(nistMetaRaw));
        }
        
        const isoMetaRaw = localStorage.getItem('cyberTrustDashboard.iso27001AssessmentMeta');
        if (isoMetaRaw) {
          setIsoMeta(JSON.parse(isoMetaRaw));
        }
        
        const cafMetaRaw = localStorage.getItem('cyberTrustDashboard.ncscCafAssessmentMeta');
        if (cafMetaRaw) {
          setCafMeta(JSON.parse(cafMetaRaw));
        }
        
        const soc2MetaRaw = localStorage.getItem('cyberTrustDashboard.soc2AssessmentMeta');
        if (soc2MetaRaw) {
          setSoc2Meta(JSON.parse(soc2MetaRaw));
        }
        
        const iecMetaRaw = localStorage.getItem('cyberTrustDashboard.iec62443AssessmentMeta');
        if (iecMetaRaw) {
          setIecMeta(JSON.parse(iecMetaRaw));
        }
      } catch (e) {
        console.warn('Error loading framework metadata:', e);
      }
      
      // Calculate ISO 27001 progress
      let isoProgressValue = 0;
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
          isoProgressValue = Math.min(100, progress);
          setIsoProgress(isoProgressValue);
        } catch (e) {
          console.warn('Error calculating ISO 27001 progress:', e);
          setIsoProgress(0);
        }
      }
      
      // Calculate NCSC CAF progress
      let cafProgressValue = 0;
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
          cafProgressValue = Math.min(100, progress);
          setCafProgress(cafProgressValue);
        } catch (e) {
          console.warn('Error calculating NCSC CAF progress:', e);
          setCafProgress(0);
        }
      }
      
      // Calculate SOC 2 progress
      let soc2ProgressValue = 0;
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
          soc2ProgressValue = Math.min(100, progress);
          setSoc2Progress(soc2ProgressValue);
        } catch (e) {
          console.warn('Error calculating SOC 2 progress:', e);
          setSoc2Progress(0);
        }
      }

      // Calculate IEC 62443 progress (stage/7 from saved meta)
      let iecProgressValue = 0;
      if (hasIec) {
        try {
          const iecMeta = JSON.parse(localStorage.getItem('cyberTrustDashboard.iec62443AssessmentMeta') || 'null');
          const stage = iecMeta?.currentStage || 1;
          iecProgressValue = Math.min(100, Math.max(0, (stage / 7) * 100));
          setIecProgress(iecProgressValue);
        } catch (e) {
          console.warn('Error calculating IEC 62443 progress:', e);
          setIecProgress(0);
        }
      }

      // Calculate average completion
      const nistProgress = scores.overall.percentage || 0;
      const totalProgress = nistProgress + isoProgressValue + cafProgressValue + soc2ProgressValue + iecProgressValue;
      const avgProgress = totalProgress / 5;
      setAvgCompletion(avgProgress);

      // Get last updated date
      const lastUpdatedKey = localStorage.getItem('cyberTrustDashboard.lastUpdated') || 
                            localStorage.getItem('cyberTrustDashboard.iso27001AssessmentMeta') ||
                            localStorage.getItem('cyberTrustDashboard.ncscCafAssessmentMeta') ||
                            localStorage.getItem('cyberTrustDashboard.soc2AssessmentMeta') ||
                            localStorage.getItem('cyberTrustDashboard.nistCsfAssessmentMeta') ||
                            localStorage.getItem('cyberTrustDashboard.iec62443AssessmentMeta');
      
      if (lastUpdatedKey) {
        try {
          const metaData = JSON.parse(lastUpdatedKey);
          if (metaData.lastUpdated) {
            setLastUpdated(new Date(metaData.lastUpdated));
          }
        } catch (e) {
          console.warn('Error parsing last updated date:', e);
        }
      }
    } catch (e) {
      // In environments where localStorage is unavailable (SSR), ignore
      console.warn('StandardsFrameworksView: localStorage check failed', e);
    }
  }, [scores.overall.percentage]);

  // Helper to render metadata text
  const renderMetaText = (meta) => {
    if (!meta || !meta.lastUpdated) return null;
    
    const dateText = `Updated ${formatDT(meta.lastUpdated)}`;
    const userText = meta.userTitle || meta.userRole ? 
      ` · ${meta.userTitle || ''}${meta.userRole ? ` (${meta.userRole})` : ''}` : '';
    
    return (
      <p className="text-xs text-center text-secondary-500 mt-1">
        {dateText}{userText}
      </p>
    );
  };

  const PageHeader = () => (
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">
        Standards &amp; Compliance Framework Assessment
      </h1>
      <p className="text-secondary-500 dark:text-secondary-400">
        Track and manage your organization's compliance journey across multiple cybersecurity frameworks
      </p>
    </div>
  );

  const ComplianceSnapshot = () => (
    <div className="dashboard-card p-6 mb-6">
      <h2 className="text-lg font-bold text-secondary-900 dark:text-white mb-4">Compliance Snapshot</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex flex-col items-center justify-center">
          <p className="text-sm font-medium text-secondary-600 dark:text-secondary-300 mb-2">Average Completion</p>
          <CircularProgress 
            value={avgCompletion} 
            size={80} 
            strokeWidth={8}
            progressClassName="text-primary-600 stroke-current"
            labelClassName="text-xl font-bold text-secondary-900 dark:text-white"
          />
        </div>
        <div className="flex flex-col items-center justify-center">
          <p className="text-sm font-medium text-secondary-600 dark:text-secondary-300 mb-2">Frameworks Available</p>
          <div className="flex items-center justify-center h-20">
            <span className="text-4xl font-bold text-primary-600">9</span>
          </div>
          <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-2">
            5 active, 4 coming soon
          </p>
        </div>
        <div className="flex flex-col items-center justify-center">
          <p className="text-sm font-medium text-secondary-600 dark:text-secondary-300 mb-2">Last Updated</p>
          <div className="flex items-center justify-center h-20">
            {lastUpdated ? (
              <span className="text-xl font-semibold text-secondary-900 dark:text-white">
                {formatDT(lastUpdated)}
              </span>
            ) : (
              <span className="text-xl font-semibold text-secondary-500">
                No updates yet
              </span>
            )}
          </div>
        </div>
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
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* NIST */}
        <div className="dashboard-card p-4 border-primary-300 ring-1 ring-primary-300">
          <div className="flex justify-between items-start">
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
          <div className="flex justify-center mt-4">
            <CircularProgress 
              value={scores.overall.percentage} 
              size={64} 
              strokeWidth={6}
              progressClassName="text-primary-600 stroke-current"
            />
          </div>
          {renderMetaText(nistMeta)}
        </div>
        {/* ISO 27001 */}
        <div className="dashboard-card p-4">
          <div className="flex justify-between items-start">
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
          <div className="flex justify-center mt-4">
            <CircularProgress 
              value={isoProgress} 
              size={64} 
              strokeWidth={6}
              progressClassName="text-primary-600 stroke-current"
            />
          </div>
          {renderMetaText(isoMeta)}
        </div>
        {/* NCSC CAF */}
        <div className="dashboard-card p-4">
          <div className="flex justify-between items-start">
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
          <div className="flex justify-center mt-4">
            <CircularProgress 
              value={cafProgress} 
              size={64} 
              strokeWidth={6}
              progressClassName="text-primary-600 stroke-current"
            />
          </div>
          {renderMetaText(cafMeta)}
        </div>
        {/* SOC 2 */}
        <div className="dashboard-card p-4">
          <div className="flex justify-between items-start">
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
          <div className="flex justify-center mt-4">
            <CircularProgress 
              value={soc2Progress} 
              size={64} 
              strokeWidth={6}
              progressClassName="text-primary-600 stroke-current"
            />
          </div>
          {renderMetaText(soc2Meta)}
        </div>
        {/* IEC 62443-3-2 */}
        <div className="dashboard-card p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-semibold">IEC&nbsp;62443-3-2</p>
              <Badge size="xs" variant="success" className="mt-1">Available</Badge>
              <p className="text-xs mt-1">Industrial Cybersecurity Zonal Cyber Risk Assessment</p>
            </div>
            <Link to="/dashboard/standards-frameworks/iec-62443">
              <Button size="xs">
                {hasIecAssessment ? 'Resume Assessment' : 'Open Assessment'}
              </Button>
            </Link>
          </div>
          <div className="flex justify-center mt-4">
            <CircularProgress
              value={iecProgress}
              size={64}
              strokeWidth={6}
              progressClassName="text-primary-600 stroke-current"
            />
          </div>
          {renderMetaText(iecMeta)}
        </div>
        
        {/* PCI DSS v4.0 - Coming Soon */}
        <div className="dashboard-card p-4 opacity-80">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-semibold">PCI DSS v4.0</p>
              <Badge size="xs" variant="secondary" className="mt-1">Coming Soon</Badge>
              <p className="text-xs mt-1">Payment Card Industry Data Security Standard</p>
            </div>
            <Button size="xs" disabled>Coming Soon</Button>
          </div>
          <div className="flex justify-center mt-4">
            <CircularProgress 
              value={0} 
              size={64} 
              strokeWidth={6}
              progressClassName="text-secondary-300 stroke-current"
            />
          </div>
        </div>
        
        {/* CIS Controls v8 - Coming Soon */}
        <div className="dashboard-card p-4 opacity-80">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-semibold">CIS Controls v8</p>
              <Badge size="xs" variant="secondary" className="mt-1">Coming Soon</Badge>
              <p className="text-xs mt-1">Center for Internet Security Critical Security Controls</p>
            </div>
            <Button size="xs" disabled>Coming Soon</Button>
          </div>
          <div className="flex justify-center mt-4">
            <CircularProgress 
              value={0} 
              size={64} 
              strokeWidth={6}
              progressClassName="text-secondary-300 stroke-current"
            />
          </div>
        </div>
        
        {/* HIPAA Security Rule - Coming Soon */}
        <div className="dashboard-card p-4 opacity-80">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-semibold">HIPAA Security Rule</p>
              <Badge size="xs" variant="secondary" className="mt-1">Coming Soon</Badge>
              <p className="text-xs mt-1">Health Insurance Portability and Accountability Act</p>
            </div>
            <Button size="xs" disabled>Coming Soon</Button>
          </div>
          <div className="flex justify-center mt-4">
            <CircularProgress 
              value={0} 
              size={64} 
              strokeWidth={6}
              progressClassName="text-secondary-300 stroke-current"
            />
          </div>
        </div>
        
        {/* GDPR - Coming Soon */}
        <div className="dashboard-card p-4 opacity-80">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-semibold">GDPR</p>
              <Badge size="xs" variant="secondary" className="mt-1">Coming Soon</Badge>
              <p className="text-xs mt-1">General Data Protection Regulation Controls Mapping</p>
            </div>
            <Button size="xs" disabled>Coming Soon</Button>
          </div>
          <div className="flex justify-center mt-4">
            <CircularProgress 
              value={0} 
              size={64} 
              strokeWidth={6}
              progressClassName="text-secondary-300 stroke-current"
            />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader />
      <ComplianceSnapshot />
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
