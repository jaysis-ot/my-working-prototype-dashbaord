import React, { useState, useCallback, useMemo } from 'react';
import { ShieldCheck, RotateCcw, ChevronDown, Check, X, Minus, Info, Eye, Download } from 'lucide-react';
import { useStandardsFrameworks } from '../../hooks/useStandardsFrameworks';
import Button from '../atoms/Button';
import Badge from '../atoms/Badge';

const NISTCSFAssessment = () => {
  const {
    framework,
    assessment,
    scores,
    updateAssessmentResponse,
    resetAssessment,
  } = useStandardsFrameworks();

  const [activeFunctionId, setActiveFunctionId] = useState('GV');
  const [expandedCategories, setExpandedCategories] = useState({});

  const toggleCategory = useCallback((categoryId) => {
    setExpandedCategories(prev => ({ ...prev, [categoryId]: !prev[categoryId] }));
  }, []);

  const handleFunctionFilter = useCallback((functionId) => {
    setActiveFunctionId(prev => (prev === functionId ? null : functionId));
  }, []);

  const handleResetAssessment = useCallback(() => {
    if (window.confirm('Are you sure you want to reset all progress for this assessment? This action cannot be undone.')) {
      resetAssessment();
    }
  }, [resetAssessment]);

  const functionsToDisplay = useMemo(() => {
    if (activeFunctionId) {
      return framework.functions.filter(f => f.id === activeFunctionId);
    }
    return framework.functions;
  }, [framework.functions, activeFunctionId]);

  const handleUpdateResponse = useCallback((subcategoryId, response) => {
    updateAssessmentResponse(subcategoryId, response);
  }, [updateAssessmentResponse]);

  const handleExportAssessment = useCallback(() => {
    try {
      const dataStr = JSON.stringify(assessment, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `nist-csf-assessment-${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    } catch (e) {
      console.error("Failed to export NIST CSF assessment:", e);
    }
  }, [assessment]);

  return (
    <div className="space-y-6">
      <div className="dashboard-card p-6 mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
          <div className="mb-4 md:mb-0">
            <h1 className="text-2xl font-bold text-secondary-900 dark:text-white flex items-center">
              <ShieldCheck className="w-7 h-7 mr-3 text-primary-600" />
              NIST Cybersecurity Framework 2.0 Assessment
            </h1>
            <p className="text-secondary-500 dark:text-secondary-400 mt-1">
              Assess your organization's capabilities against the NIST Cybersecurity Framework 2.0.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-secondary-600 dark:text-secondary-300">Overall Completion</p>
              <p className="text-2xl font-bold">{scores.overall.percentage.toFixed(1)}%</p>
            </div>
            <Button variant="secondary" onClick={handleResetAssessment} leadingIcon={RotateCcw}>
              Reset Assessment
            </Button>
          </div>
        </div>
        <div className="w-full bg-secondary-200 dark:bg-secondary-700 rounded-full h-2.5 mt-4">
          <div 
            className="bg-primary-600 h-2.5 rounded-full" 
            style={{ width: `${scores.overall.percentage}%` }}
          ></div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {framework.functions.map(func => (
          <button
            key={func.id}
            onClick={() => handleFunctionFilter(func.id)}
            className={`dashboard-card p-4 text-left transition-all duration-200 ${activeFunctionId === func.id ? 'ring-2 ring-primary-500 shadow-lg' : 'hover:shadow-md hover:-translate-y-0.5'}`}
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-xl font-extrabold leading-none">{func.id}</p>
                <p className="text-xs text-secondary-500 dark:text-secondary-400">{func.name}</p>
              </div>
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  scores.byFunction[func.id]?.percentage === 0
                    ? 'bg-secondary-200 dark:bg-secondary-700 text-secondary-600'
                    : scores.byFunction[func.id]?.percentage < 50
                    ? 'bg-red-100 text-red-600'
                    : scores.byFunction[func.id]?.percentage < 80
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-green-100 text-green-700'
                }`}
              >
                {scores.byFunction[func.id]?.percentage.toFixed(0)}%
              </span>
            </div>
            <div className="w-full bg-secondary-200 dark:bg-secondary-700 rounded-full h-1.5">
              <div 
                className="bg-primary-500 h-1.5 rounded-full" 
                style={{ width: `${scores.byFunction[func.id]?.percentage || 0}%` }}
              ></div>
            </div>
          </button>
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
                <Button variant="primary" size="sm" leadingIcon={Download} onClick={handleExportAssessment}>Export Assessment</Button>
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
                        <div 
                          key={subcategory.id} 
                          className="py-3 px-4 border-b border-secondary-100 dark:border-secondary-700/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                        >
                          <div className="flex-1">
                            <p className="font-semibold text-sm text-secondary-800 dark:text-secondary-100 flex items-center">
                              <span className="mr-2">
                                {assessment[subcategory.id] === 'Yes' && <Check className="w-3 h-3 text-green-700" />}
                                {assessment[subcategory.id] === 'Partial' && <Minus className="w-3 h-3 text-yellow-700" />}
                                {assessment[subcategory.id] === 'No' && <X className="w-3 h-3 text-red-700" />}
                                {assessment[subcategory.id] === 'N/A' && <Info className="w-3 h-3 text-secondary-500" />}
                                {!assessment[subcategory.id] && <Info className="w-3 h-3 text-secondary-400" />}
                              </span>
                              {subcategory.id}
                            </p>
                            <p className="text-sm text-secondary-600 dark:text-secondary-300 pl-7">{subcategory.description}</p>
                          </div>
                          <div className="flex-shrink-0 flex items-center gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleUpdateResponse(subcategory.id, 'Yes')}
                              className={`!px-3 !py-1 ${assessment[subcategory.id] === 'Yes' ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-secondary-200 dark:bg-secondary-600 text-secondary-800 dark:text-secondary-200'}`}
                            >
                              Yes
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleUpdateResponse(subcategory.id, 'Partial')}
                              className={`!px-3 !py-1 ${assessment[subcategory.id] === 'Partial' ? 'bg-yellow-500 hover:bg-yellow-600 text-white' : 'bg-secondary-200 dark:bg-secondary-600 text-secondary-800 dark:text-secondary-200'}`}
                            >
                              Partial
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleUpdateResponse(subcategory.id, 'No')}
                              className={`!px-3 !py-1 ${assessment[subcategory.id] === 'No' ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-secondary-200 dark:bg-secondary-600 text-secondary-800 dark:text-secondary-200'}`}
                            >
                              No
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleUpdateResponse(subcategory.id, 'N/A')}
                              className={`!px-3 !py-1 ${assessment[subcategory.id] === 'N/A' ? 'bg-secondary-400 hover:bg-secondary-500 text-white' : 'bg-secondary-200 dark:bg-secondary-600 text-secondary-800 dark:text-secondary-200'}`}
                            >
                              N/A
                            </Button>
                          </div>
                        </div>
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

export default NISTCSFAssessment;
