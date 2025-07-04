// src/components/standards/NISTCSFAssessment.jsx
import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronRight, ChevronDown, Download, Upload, BarChart3, Target, Shield } from 'lucide-react';
import { NIST_CSF_STRUCTURE, SCORING_DIMENSIONS } from './nistCsfData';

/**
 * NIST CSF 2.0 Assessment Component
 * 
 * Integrated version of the NIST CSF assessment tool for the dashboard.
 * Maintains state within the broader dashboard context and provides
 * comprehensive cybersecurity framework assessment capabilities.
 */
const NISTCSFAssessment = ({ state, dispatch }) => {
  // Local state for NIST CSF assessment
  const [assessmentData, setAssessmentData] = useState(
    state.standards?.frameworks?.nistCsf?.assessmentData || {}
  );
  const [expandedItems, setExpandedItems] = useState({});
  const [selectedFunction, setSelectedFunction] = useState('GV');

  // Calculate scores
  const calculateSubcategoryScore = (subcategoryId) => {
    const data = assessmentData[subcategoryId];
    if (!data) return 0;
    
    const weight = data.weight || 3;
    const maturity = data.maturity || 0;
    const implementation = data.implementation || 0;
    const evidence = data.evidence || 0;
    
    const averageScore = (maturity + implementation + evidence) / 3;
    return (averageScore * weight * 100) / (3 * 5); // Normalize to 0-100
  };

  const calculateCategoryScore = (categoryData) => {
    const subcategoryIds = Object.keys(categoryData.subcategories);
    if (subcategoryIds.length === 0) return 0;
    
    let totalScore = 0;
    let totalWeight = 0;
    
    subcategoryIds.forEach(subId => {
      const weight = assessmentData[subId]?.weight || 3;
      totalScore += calculateSubcategoryScore(subId) * weight;
      totalWeight += weight;
    });
    
    return totalWeight > 0 ? totalScore / totalWeight : 0;
  };

  const calculateFunctionScore = (functionData) => {
    const categoryIds = Object.keys(functionData.categories);
    if (categoryIds.length === 0) return 0;
    
    const scores = categoryIds.map(catId => calculateCategoryScore(functionData.categories[catId]));
    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  };

  const calculateOverallScore = () => {
    const functionIds = Object.keys(NIST_CSF_STRUCTURE);
    const scores = functionIds.map(funcId => calculateFunctionScore(NIST_CSF_STRUCTURE[funcId]));
    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  };

  // Update assessment data
  const updateAssessment = (subcategoryId, field, value) => {
    setAssessmentData(prev => ({
      ...prev,
      [subcategoryId]: {
        ...prev[subcategoryId],
        [field]: value
      }
    }));
  };

  // Toggle expansion
  const toggleExpansion = (itemId) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  // Save assessment data to dashboard state when it changes
  useEffect(() => {
    const overallScore = calculateOverallScore();
    const completionRate = calculateCompletionRate();
    
    dispatch({
      type: 'UPDATE_STANDARDS_DATA',
      payload: {
        framework: 'nistCsf',
        data: { 
          assessmentData,
          completionRate,
          overallScore,
          lastUpdated: new Date().toISOString()
        }
      }
    });
  }, [assessmentData, dispatch]);

  // Calculate completion stats
  const completionStats = useMemo(() => {
    let totalSubcategories = 0;
    let completedSubcategories = 0;
    
    Object.values(NIST_CSF_STRUCTURE).forEach(func => {
      Object.values(func.categories).forEach(cat => {
        Object.keys(cat.subcategories).forEach(subId => {
          totalSubcategories++;
          const data = assessmentData[subId];
          if (data && data.maturity > 0 && data.implementation > 0 && data.evidence > 0) {
            completedSubcategories++;
          }
        });
      });
    });
    
    return {
      total: totalSubcategories,
      completed: completedSubcategories,
      percentage: totalSubcategories > 0 ? (completedSubcategories / totalSubcategories) * 100 : 0
    };
  }, [assessmentData]);

  const calculateCompletionRate = () => completionStats.percentage;

  // Export/Import functions
  const exportAssessment = () => {
    const data = {
      assessmentData,
      timestamp: new Date().toISOString(),
      framework: "NIST CSF 2.0",
      version: "2.0",
      overallScore: calculateOverallScore(),
      completionRate: calculateCompletionRate()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nist-csf-assessment-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importAssessment = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          if (data.assessmentData && data.framework === "NIST CSF 2.0") {
            setAssessmentData(data.assessmentData);
          } else {
            alert('Invalid file format or framework version');
          }
        } catch (error) {
          alert('Error reading file: ' + error.message);
        }
      };
      reader.readAsText(file);
    }
  };

  const currentFunction = NIST_CSF_STRUCTURE[selectedFunction];

  return (
    <div className="space-y-6">
      {/* Assessment Dashboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Assessment Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{calculateOverallScore().toFixed(1)}%</div>
              <div className="text-sm text-gray-600">Overall Score</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{completionStats.completed}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">{completionStats.total}</div>
              <div className="text-sm text-gray-600">Total Subcategories</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{completionStats.percentage.toFixed(1)}%</div>
              <div className="text-sm text-gray-600">Completion Rate</div>
            </div>
          </div>
          
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Overall Progress</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={exportAssessment}>
                  <Download className="w-4 h-4 mr-1" />
                  Export
                </Button>
                <Button variant="outline" size="sm" onClick={() => document.getElementById('import-file').click()}>
                  <Upload className="w-4 h-4 mr-1" />
                  Import
                </Button>
                <input
                  id="import-file"
                  type="file"
                  accept=".json"
                  onChange={importAssessment}
                  className="hidden"
                />
              </div>
            </div>
            <Progress value={completionStats.percentage} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Function Level Dashboard */}
      <Card>
        <CardHeader>
          <CardTitle>Function Scores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.entries(NIST_CSF_STRUCTURE).map(([funcId, funcData]) => {
              const score = calculateFunctionScore(funcData);
              return (
                <div 
                  key={funcId}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedFunction === funcId 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedFunction(funcId)}
                >
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">{funcId}</div>
                    <div className="text-sm text-gray-600 mb-2">{funcData.name}</div>
                    <div className="text-2xl font-bold text-blue-600">{score.toFixed(1)}%</div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Assessment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            {currentFunction.name} Function Assessment
          </CardTitle>
          <p className="text-gray-600">{currentFunction.description}</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {Object.entries(currentFunction.categories).map(([categoryId, categoryData]) => {
              const categoryScore = calculateCategoryScore(categoryData);
              const isExpanded = expandedItems[categoryId];
              
              return (
                <div key={categoryId} className="border rounded-lg">
                  <div 
                    className="p-4 cursor-pointer hover:bg-gray-50 flex items-center justify-between"
                    onClick={() => toggleExpansion(categoryId)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{categoryId}</Badge>
                        <h3 className="font-semibold">{categoryData.name}</h3>
                        <div className="text-lg font-bold text-blue-600">{categoryScore.toFixed(1)}%</div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{categoryData.description}</p>
                    </div>
                    {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                  </div>
                  
                  {isExpanded && (
                    <div className="border-t bg-gray-50 p-4">
                      <div className="space-y-6">
                        {Object.entries(categoryData.subcategories).map(([subcategoryId, subcategoryData]) => {
                          const subcategoryScore = calculateSubcategoryScore(subcategoryId);
                          const data = assessmentData[subcategoryId] || {};
                          
                          return (
                            <div key={subcategoryId} className="bg-white p-4 rounded-lg border">
                              <div className="flex items-center justify-between mb-3">
                                <div>
                                  <Badge variant="secondary">{subcategoryId}</Badge>
                                  <h4 className="font-medium mt-1">{subcategoryData.name}</h4>
                                  <p className="text-sm text-gray-600">{subcategoryData.description}</p>
                                </div>
                                <div className="text-right">
                                  <div className="text-lg font-bold text-blue-600">{subcategoryScore.toFixed(1)}%</div>
                                  <div className="text-xs text-gray-500">Score</div>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                {/* Weight */}
                                <div>
                                  <label className="block text-sm font-medium mb-2">
                                    Weight (1-5)
                                  </label>
                                  <input
                                    type="range"
                                    min="1"
                                    max="5"
                                    value={data.weight || 3}
                                    onChange={(e) => updateAssessment(subcategoryId, 'weight', parseInt(e.target.value))}
                                    className="w-full"
                                  />
                                  <div className="text-center text-sm text-gray-600 mt-1">
                                    {data.weight || 3}
                                  </div>
                                </div>
                                
                                {/* Scoring Dimensions */}
                                {Object.entries(SCORING_DIMENSIONS).map(([dimKey, dimData]) => (
                                  <div key={dimKey}>
                                    <label className="block text-sm font-medium mb-2">
                                      {dimData.name}
                                    </label>
                                    <select
                                      value={data[dimKey] || 0}
                                      onChange={(e) => updateAssessment(subcategoryId, dimKey, parseInt(e.target.value))}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                    >
                                      {dimData.levels.map((level, index) => (
                                        <option key={index} value={index}>
                                          {index}: {level}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                ))}
                              </div>
                              
                              {/* Notes */}
                              <div className="mt-4">
                                <label className="block text-sm font-medium mb-2">
                                  Notes & Evidence
                                </label>
                                <textarea
                                  value={data.notes || ''}
                                  onChange={(e) => updateAssessment(subcategoryId, 'notes', e.target.value)}
                                  placeholder="Document implementation details, evidence, and improvement plans..."
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                  rows="2"
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NISTCSFAssessment;