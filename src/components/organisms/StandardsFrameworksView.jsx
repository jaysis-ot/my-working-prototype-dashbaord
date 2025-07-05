import React, { useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { ShieldCheck, BarChart3, RotateCcw, ChevronDown, Check, X, Minus } from 'lucide-react';
import Button from '../atoms/Button';
import Badge from '../atoms/Badge';

// --- Internal Molecules (Components specific to this Organism) ---

/**
 * FrameworkHeader: Displays the main title, description, and overall progress.
 */
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

/**
 * AssessmentProgressCard: A card showing progress for a single function, also acts as a filter button.
 */
const AssessmentProgressCard = ({ func, score, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`dashboard-card p-4 text-left transition-all duration-200 ${isActive ? 'ring-2 ring-primary-500 shadow-lg' : 'hover:shadow-md hover:-translate-y-0.5'}`}
  >
    <div className="flex justify-between items-center mb-2">
      <h3 className="font-bold text-secondary-900 dark:text-white">{func.name}</h3>
      <span className="font-semibold text-sm">{score.percentage.toFixed(0)}%</span>
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

/**
 * SubcategoryItem: Renders a single assessment question with response options.
 */
const SubcategoryItem = ({ subcategory, response, onUpdate }) => {
  const responseOptions = ['Yes', 'Partial', 'No', 'N/A'];
  const responseStyles = {
    Yes: 'bg-green-500 hover:bg-green-600',
    Partial: 'bg-yellow-500 hover:bg-yellow-600',
    No: 'bg-red-500 hover:bg-red-600',
    'N/A': 'bg-secondary-400 hover:bg-secondary-500',
  };

  return (
    <div className="py-3 px-4 border-b border-secondary-100 dark:border-secondary-700/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <p className="font-semibold text-sm text-secondary-800 dark:text-secondary-100">{subcategory.id}</p>
        <p className="text-sm text-secondary-600 dark:text-secondary-300">{subcategory.description}</p>
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

/**
 * StandardsFrameworksView Organism Component
 * 
 * Provides the main user interface for interacting with a cybersecurity framework assessment,
 * specifically tailored for NIST CSF 2.0.
 */
const StandardsFrameworksView = ({ framework, assessment, scores, onUpdateResponse, onReset }) => {
  const [activeFunctionId, setActiveFunctionId] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({});

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
      <FrameworkHeader
        title="NIST CSF 2.0 Assessment"
        description="Assess your organization's capabilities against the NIST Cybersecurity Framework 2.0."
        progress={scores.overall.percentage}
        onReset={onReset}
      />

      {/* Function Progress Cards */}
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

      {/* Assessment Sections */}
      <div className="space-y-4">
        {functionsToDisplay.map(func => (
          <div key={func.id} className="dashboard-card overflow-hidden">
            <h2 className="text-xl font-bold p-4 bg-secondary-50 dark:bg-secondary-900/50 border-b border-secondary-200 dark:border-secondary-700">
              Function: {func.name}
            </h2>
            <div className="divide-y divide-secondary-200 dark:divide-secondary-700">
              {(framework.categories[func.id] || []).map(cat => (
                <div key={cat.id}>
                  <button
                    className="w-full p-4 text-left flex justify-between items-center hover:bg-secondary-50 dark:hover:bg-secondary-700/50"
                    onClick={() => toggleCategory(cat.id)}
                  >
                    <div>
                      <h3 className="font-semibold text-primary-700 dark:text-primary-300">{cat.name} ({cat.id})</h3>
                      <p className="text-sm text-secondary-500">{cat.description}</p>
                    </div>
                    <ChevronDown className={`w-5 h-5 transition-transform ${expandedCategories[cat.id] ? 'rotate-180' : ''}`} />
                  </button>
                  {expandedCategories[cat.id] && (
                    <div className="bg-white dark:bg-secondary-800">
                      {/* Placeholder for subcategories - map real data here when available */}
                      {Array.from({ length: 5 }).map((_, i) => {
                        const subcatId = `${cat.id}.${i + 1}`;
                        const subcategory = {
                          id: subcatId,
                          description: `This is a placeholder description for subcategory ${subcatId}. In a real application, this would come from the framework data object.`
                        };
                        return (
                          <SubcategoryItem
                            key={subcatId}
                            subcategory={subcategory}
                            response={assessment[subcatId]}
                            onUpdate={onUpdateResponse}
                          />
                        );
                      })}
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
