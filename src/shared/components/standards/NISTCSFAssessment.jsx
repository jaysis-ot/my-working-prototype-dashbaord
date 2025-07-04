// src/components/standards/NISTCSFAssessment.jsx
import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ChevronDown, 
  ChevronRight, 
  Search, 
  Filter, 
  Download, 
  Upload,
  Save,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Info,
  Target,
  TrendingUp,
  FileText,
  Calendar,
  User
} from 'lucide-react';
import { 
  NIST_CSF_STRUCTURE, 
  getAllSubcategories, 
  calculateFunctionCompletion,
  calculateOverallCompletion,
  createDefaultAssessment,
  searchSubcategories,
  SCORING_TEMPLATE
} from './nistCsfData';
import { SCORING_DIMENSIONS } from '../../constants/standardsConstants';

/**
 * NIST CSF 2.0 Assessment Tool
 * 
 * Comprehensive assessment interface for NIST Cybersecurity Framework 2.0
 * with all 106 subcategories across 6 functions.
 */
const NISTCSFAssessment = ({ state, dispatch }) => {
  // Get assessment data from state or initialize
  const [assessmentData, setAssessmentData] = useState(
    state.standards?.frameworks?.nistCsf?.assessmentData || createDefaultAssessment()
  );
  
  // UI State
  const [activeFunction, setActiveFunction] = useState('GV');
  const [expandedCategories, setExpandedCategories] = useState(new Set(['GV.OC']));
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [assessmentMode, setAssessmentMode] = useState('guided'); // guided | expert | bulk

  // Memoized calculations
  const overallProgress = useMemo(() => 
    calculateOverallCompletion(assessmentData), [assessmentData]
  );

  const functionProgress = useMemo(() => {
    const progress = {};
    Object.keys(NIST_CSF_STRUCTURE).forEach(funcId => {
      progress[funcId] = calculateFunctionCompletion(assessmentData, funcId);
    });
    return progress;
  }, [assessmentData]);

  const filteredSubcategories = useMemo(() => {
    let subs = getAllSubcategories();
    
    // Apply search filter
    if (searchTerm) {
      subs = searchSubcategories(searchTerm);
    }
    
    // Apply status filter
    if (filterStatus !== 'all') {
      subs = subs.filter(sub => {
        const assessment = assessmentData[sub.id];
        const hasAnyScore = assessment && (
          assessment.maturity > 0 || assessment.implementation > 0 || 
          assessment.evidence > 0 || assessment.testing > 0
        );
        
        switch (filterStatus) {
          case 'completed':
            return hasAnyScore;
          case 'incomplete':
            return !hasAnyScore;
          case 'high-priority':
            return sub.functionId === 'GV' || sub.functionId === 'ID';
          default:
            return true;
        }
      });
    }
    
    return subs;
  }, [searchTerm, filterStatus, assessmentData]);

  // Update state when assessment data changes
  useEffect(() => {
    if (dispatch) {
      const progress = calculateOverallCompletion(assessmentData);
      dispatch({
        type: 'UPDATE_STANDARDS_DATA',
        payload: {
          framework: 'nistCsf',
          data: {
            assessmentData,
            completionRate: progress.completion,
            overallScore: progress.averageScore,
            lastUpdated: new Date().toISOString()
          }
        }
      });
    }
  }, [assessmentData, dispatch]);

  // Handle assessment updates
  const updateSubcategoryAssessment = (subcategoryId, field, value) => {
    setAssessmentData(prev => ({
      ...prev,
      [subcategoryId]: {
        ...prev[subcategoryId],
        [field]: value,
        lastUpdated: new Date().toISOString(),
        assessor: 'Current User' // This would come from user context
      }
    }));
  };

  // Handle category expansion
  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  // Export assessment data
  const exportAssessment = () => {
    const exportData = {
      framework: 'NIST CSF 2.0',
      exportDate: new Date().toISOString(),
      overallProgress: overallProgress,
      functionProgress: functionProgress,
      assessmentData: assessmentData
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nist-csf-assessment-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Import assessment data
  const importAssessment = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target.result);
          if (importedData.assessmentData) {
            setAssessmentData(importedData.assessmentData);
          }
        } catch (error) {
          console.error('Error importing assessment:', error);
        }
      };
      reader.readAsText(file);
    }
  };

  // Reset assessment
  const resetAssessment = () => {
    if (confirm('Are you sure you want to reset all assessment data? This action cannot be undone.')) {
      setAssessmentData(createDefaultAssessment());
    }
  };

  // Get status badge for subcategory
  const getSubcategoryStatus = (subcategoryId) => {
    const assessment = assessmentData[subcategoryId];
    if (!assessment) return { status: 'not-started', color: 'gray' };
    
    const hasAnyScore = assessment.maturity > 0 || assessment.implementation > 0 || 
                       assessment.evidence > 0 || assessment.testing > 0;
    
    if (!hasAnyScore) return { status: 'not-started', color: 'gray' };
    
    const averageScore = (assessment.maturity + assessment.implementation + 
                         assessment.evidence + assessment.testing) / 4;
    
    if (averageScore >= 2.5) return { status: 'complete', color: 'green' };
    if (averageScore >= 1.5) return { status: 'in-progress', color: 'blue' };
    return { status: 'started', color: 'yellow' };
  };

  // Render function overview cards
  const renderFunctionCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      {Object.entries(NIST_CSF_STRUCTURE).map(([funcId, funcData]) => {
        const progress = functionProgress[funcId] || { completion: 0, averageScore: 0 };
        const isActive = activeFunction === funcId;
        
        return (
          <Card 
            key={funcId}
            className={`cursor-pointer transition-all duration-200 ${
              isActive ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:shadow-md'
            }`}
            onClick={() => setActiveFunction(funcId)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{funcId}</CardTitle>
                  <p className="text-sm font-medium text-gray-900">{funcData.name}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">
                    {progress.completion.toFixed(0)}%
                  </div>
                  <div className="text-xs text-gray-500">Complete</div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-gray-600 mb-3">{funcData.description}</p>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Progress</span>
                  <span>{progress.completion.toFixed(1)}%</span>
                </div>
                <Progress value={progress.completion} className="h-2" />
                {progress.averageScore > 0 && (
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Avg Score</span>
                    <span>{progress.averageScore.toFixed(1)}/100</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  // Render assessment controls for a subcategory
  const renderAssessmentControls = (subcategoryId) => {
    const assessment = assessmentData[subcategoryId] || { ...SCORING_TEMPLATE };
    
    return (
      <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(SCORING_DIMENSIONS).map(([key, dimension]) => (
            <div key={key} className="space-y-2">
              <label className="text-sm font-medium">{dimension.name}</label>
              <Select
                value={assessment[key.toLowerCase()]?.toString() || '0'}
                onValueChange={(value) => updateSubcategoryAssessment(
                  subcategoryId, 
                  key.toLowerCase(), 
                  parseInt(value)
                )}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {dimension.levels.map((level, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Notes & Comments</label>
          <Textarea
            placeholder="Add assessment notes, evidence descriptions, or implementation details..."
            value={assessment.notes || ''}
            onChange={(e) => updateSubcategoryAssessment(subcategoryId, 'notes', e.target.value)}
            className="min-h-[80px]"
          />
        </div>
        
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-4">
            {assessment.lastUpdated && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Last updated: {new Date(assessment.lastUpdated).toLocaleDateString()}
              </span>
            )}
            {assessment.assessor && (
              <span className="flex items-center gap-1">
                <User className="w-3 h-3" />
                By: {assessment.assessor}
              </span>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedSubcategory(null)}
          >
            Close
          </Button>
        </div>
      </div>
    );
  };

  // Render subcategory item
  const renderSubcategoryItem = (subcategory) => {
    const status = getSubcategoryStatus(subcategory.id);
    const isSelected = selectedSubcategory === subcategory.id;
    const assessment = assessmentData[subcategory.id] || {};
    
    return (
      <div key={subcategory.id} className="border rounded-lg mb-2">
        <div 
          className="p-4 hover:bg-gray-50 cursor-pointer"
          onClick={() => setSelectedSubcategory(isSelected ? null : subcategory.id)}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium text-sm">{subcategory.id}</h4>
                <Badge 
                  variant="outline" 
                  className={`text-xs bg-${status.color}-100 text-${status.color}-800 border-${status.color}-200`}
                >
                  {status.status}
                </Badge>
              </div>
              <p className="text-sm font-medium text-gray-900 mb-1">{subcategory.name}</p>
              <p className="text-sm text-gray-600 line-clamp-2">{subcategory.description}</p>
              {assessment.notes && (
                <p className="text-xs text-gray-500 mt-1 italic">
                  Note: {assessment.notes.substring(0, 100)}{assessment.notes.length > 100 ? '...' : ''}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 ml-4">
              {assessment.lastUpdated && (
                <span className="text-xs text-gray-400">
                  {new Date(assessment.lastUpdated).toLocaleDateString()}
                </span>
              )}
              {isSelected ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </div>
          </div>
        </div>
        
        {isSelected && renderAssessmentControls(subcategory.id)}
      </div>
    );
  };

  // Render category section
  const renderCategory = (functionId, categoryId, categoryData) => {
    const isExpanded = expandedCategories.has(categoryId);
    const subcategories = Object.entries(categoryData.subcategories).map(([subId, subData]) => ({
      id: subId,
      functionId,
      categoryId,
      name: subData.name,
      description: subData.description
    }));

    // Filter subcategories if search is active
    const visibleSubcategories = searchTerm 
      ? subcategories.filter(sub => filteredSubcategories.some(filtered => filtered.id === sub.id))
      : subcategories;

    if (searchTerm && visibleSubcategories.length === 0) return null;

    return (
      <div key={categoryId} className="mb-6">
        <div 
          className="flex items-center gap-2 p-3 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors"
          onClick={() => toggleCategory(categoryId)}
        >
          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{categoryId}: {categoryData.name}</h3>
            <p className="text-sm text-gray-600">{categoryData.description}</p>
          </div>
          <div className="text-right">
            <span className="text-sm font-medium">{visibleSubcategories.length} controls</span>
          </div>
        </div>
        
        {isExpanded && (
          <div className="mt-4 space-y-2">
            {visibleSubcategories.map(renderSubcategoryItem)}
          </div>
        )}
      </div>
    );
  };

  // Render main assessment interface
  const renderAssessmentInterface = () => {
    const functionData = NIST_CSF_STRUCTURE[activeFunction];
    if (!functionData) return null;

    return (
      <div className="space-y-6">
        {/* Function Header */}
        <div className="bg-blue-50 p-6 rounded-lg">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-blue-900">{activeFunction}: {functionData.name}</h2>
              <p className="text-blue-700 mt-2">{functionData.description}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600">
                {functionProgress[activeFunction]?.completion.toFixed(0) || 0}%
              </div>
              <div className="text-sm text-blue-600">Complete</div>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-4">
          {Object.entries(functionData.categories).map(([categoryId, categoryData]) =>
            renderCategory(activeFunction, categoryId, categoryData)
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">NIST CSF 2.0 Assessment</h2>
          <p className="text-gray-600 mt-1">
            Comprehensive assessment across all 106 subcategories
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={exportAssessment}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <div className="relative">
            <input
              type="file"
              accept=".json"
              onChange={importAssessment}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <Button variant="outline" size="sm">
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Button>
          </div>
          <Button variant="outline" size="sm" onClick={resetAssessment}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>
      </div>

      {/* Overall Progress */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {overallProgress.completion.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Overall Completion</div>
              <Progress value={overallProgress.completion} className="mt-2" />
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {overallProgress.averageScore.toFixed(1)}
              </div>
              <div className="text-sm text-gray-600">Average Score</div>
              <Progress value={overallProgress.averageScore} className="mt-2" />
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {filteredSubcategories.filter(sub => {
                  const assessment = assessmentData[sub.id];
                  return assessment && (assessment.maturity > 0 || assessment.implementation > 0 || 
                                      assessment.evidence > 0 || assessment.testing > 0);
                }).length}
              </div>
              <div className="text-sm text-gray-600">Controls Assessed</div>
              <div className="text-xs text-gray-500 mt-1">of 106 total</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filter Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search subcategories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Controls</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="incomplete">Incomplete</SelectItem>
                  <SelectItem value="high-priority">High Priority</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={assessmentMode} onValueChange={setAssessmentMode}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="guided">Guided</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                  <SelectItem value="bulk">Bulk</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Function Overview */}
      {renderFunctionCards()}

      {/* Assessment Interface */}
      <Tabs value="assessment" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="assessment">Assessment</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="export">Export</TabsTrigger>
        </TabsList>
        
        <TabsContent value="assessment" className="space-y-6">
          {renderAssessmentInterface()}
        </TabsContent>
        
        <TabsContent value="progress" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Assessment Progress by Function</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(NIST_CSF_STRUCTURE).map(([funcId, funcData]) => {
                  const progress = functionProgress[funcId] || { completion: 0, averageScore: 0 };
                  return (
                    <div key={funcId} className="flex items-center gap-4">
                      <div className="w-16 text-sm font-medium">{funcId}</div>
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span>{funcData.name}</span>
                          <span>{progress.completion.toFixed(1)}%</span>
                        </div>
                        <Progress value={progress.completion} />
                      </div>
                      <div className="w-20 text-right text-sm text-gray-600">
                        Score: {progress.averageScore.toFixed(1)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Assessment Reports</h3>
              <p className="text-gray-600 mb-4">
                Generate detailed reports of your NIST CSF assessment progress and findings.
              </p>
              <Button>Generate Report</Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="export" className="space-y-6">
          <Card>
            <CardContent className="p-8 text-center">
              <Download className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Export Assessment Data</h3>
              <p className="text-gray-600 mb-4">
                Export your assessment data in various formats for reporting and compliance purposes.
              </p>
              <div className="flex justify-center gap-2">
                <Button onClick={exportAssessment}>Export JSON</Button>
                <Button variant="outline">Export CSV</Button>
                <Button variant="outline">Export PDF</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NISTCSFAssessment;