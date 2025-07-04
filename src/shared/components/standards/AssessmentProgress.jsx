// src/components/standards/AssessmentProgress.jsx
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Target,
  BarChart3,
  Calendar,
  Users
} from 'lucide-react';
import { NIST_CSF_STRUCTURE, calculateFunctionCompletion } from './nistCsfData';
import { FRAMEWORK_DEFINITIONS, STANDARDS_FRAMEWORKS } from '../../constants/standardsConstants';

/**
 * Assessment Progress Component
 * 
 * Provides comprehensive progress tracking and analytics for framework assessments.
 * Shows completion rates, trends, quality metrics, and actionable insights.
 */
const AssessmentProgress = ({ 
  frameworkId, 
  assessmentData = {}, 
  className = '',
  showDetails = true,
  onDrillDown = null 
}) => {
  // Get framework configuration
  const framework = FRAMEWORK_DEFINITIONS[frameworkId];
  
  // Calculate progress metrics
  const progressMetrics = useMemo(() => {
    if (frameworkId === STANDARDS_FRAMEWORKS.NIST_CSF) {
      // NIST CSF specific calculations
      const functions = Object.keys(NIST_CSF_STRUCTURE);
      const functionProgress = {};
      let totalCompletion = 0;
      let totalScore = 0;
      let totalAssessed = 0;
      let totalControls = 0;

      functions.forEach(funcId => {
        const result = calculateFunctionCompletion(assessmentData, funcId);
        functionProgress[funcId] = result;
        totalCompletion += result.completion;
        totalScore += result.averageScore;
        
        // Count assessed controls
        const functionData = NIST_CSF_STRUCTURE[funcId];
        Object.values(functionData.categories).forEach(category => {
          Object.keys(category.subcategories).forEach(subId => {
            totalControls++;
            const assessment = assessmentData[subId];
            if (assessment && (assessment.maturity > 0 || assessment.implementation > 0 || 
                              assessment.evidence > 0 || assessment.testing > 0)) {
              totalAssessed++;
            }
          });
        });
      });

      return {
        overallCompletion: totalCompletion / functions.length,
        averageScore: totalScore / functions.length,
        functionProgress,
        totalControls,
        totalAssessed,
        assessedPercentage: (totalAssessed / totalControls) * 100
      };
    }
    
    // Default for other frameworks
    return {
      overallCompletion: 0,
      averageScore: 0,
      functionProgress: {},
      totalControls: framework?.controls || framework?.requirements || 0,
      totalAssessed: 0,
      assessedPercentage: 0
    };
  }, [frameworkId, assessmentData, framework]);

  // Calculate trend (would need historical data in real implementation)
  const getTrendIndicator = (current, previous = 0) => {
    const diff = current - previous;
    if (Math.abs(diff) < 1) return { icon: Minus, color: 'text-gray-500', text: 'No change' };
    if (diff > 0) return { icon: TrendingUp, color: 'text-green-600', text: `+${diff.toFixed(1)}%` };
    return { icon: TrendingDown, color: 'text-red-600', text: `${diff.toFixed(1)}%` };
  };

  // Get completion status badge
  const getCompletionBadge = (percentage) => {
    if (percentage >= 90) return { variant: 'default', color: 'bg-green-100 text-green-800', label: 'Excellent' };
    if (percentage >= 70) return { variant: 'default', color: 'bg-blue-100 text-blue-800', label: 'Good' };
    if (percentage >= 50) return { variant: 'default', color: 'bg-yellow-100 text-yellow-800', label: 'In Progress' };
    if (percentage > 0) return { variant: 'outline', color: 'bg-orange-100 text-orange-800', label: 'Started' };
    return { variant: 'secondary', color: 'bg-gray-100 text-gray-800', label: 'Not Started' };
  };

  // Calculate quality score based on consistency and documentation
  const getQualityMetrics = () => {
    if (frameworkId !== STANDARDS_FRAMEWORKS.NIST_CSF) return null;
    
    let consistentAssessments = 0;
    let documentedAssessments = 0;
    let totalReviewableAssessments = 0;

    Object.keys(assessmentData).forEach(subId => {
      const assessment = assessmentData[subId];
      if (assessment && (assessment.maturity > 0 || assessment.implementation > 0 || 
                        assessment.evidence > 0 || assessment.testing > 0)) {
        totalReviewableAssessments++;
        
        // Check consistency (low variance between dimensions)
        const scores = [assessment.maturity, assessment.implementation, assessment.evidence, assessment.testing];
        const average = scores.reduce((a, b) => a + b, 0) / scores.length;
        const variance = Math.max(...scores.map(s => Math.abs(s - average)));
        if (variance <= 1) consistentAssessments++;
        
        // Check documentation
        if (assessment.notes && assessment.notes.trim().length >= 10) {
          documentedAssessments++;
        }
      }
    });

    return {
      consistency: totalReviewableAssessments > 0 ? (consistentAssessments / totalReviewableAssessments) * 100 : 0,
      documentation: totalReviewableAssessments > 0 ? (documentedAssessments / totalReviewableAssessments) * 100 : 0,
      totalReviewable: totalReviewableAssessments
    };
  };

  const qualityMetrics = getQualityMetrics();
  const completionBadge = getCompletionBadge(progressMetrics.overallCompletion);
  const trend = getTrendIndicator(progressMetrics.overallCompletion);

  if (!framework) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600">Framework not found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Overall Progress Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">{framework.shortName} Progress</CardTitle>
              <p className="text-sm text-gray-600 mt-1">Assessment completion overview</p>
            </div>
            <Badge className={completionBadge.color}>
              {completionBadge.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Primary Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {progressMetrics.overallCompletion.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Overall Completion</div>
              <Progress value={progressMetrics.overallCompletion} className="mt-2 h-2" />
              <div className="flex items-center justify-center gap-1 mt-1">
                <trend.icon className={`w-3 h-3 ${trend.color}`} />
                <span className={`text-xs ${trend.color}`}>{trend.text}</span>
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {progressMetrics.averageScore.toFixed(1)}
              </div>
              <div className="text-sm text-gray-600">Average Score</div>
              <Progress value={progressMetrics.averageScore} className="mt-2 h-2" />
              <div className="text-xs text-gray-500 mt-1">
                Out of 100
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {progressMetrics.totalAssessed}
              </div>
              <div className="text-sm text-gray-600">Controls Assessed</div>
              <Progress value={progressMetrics.assessedPercentage} className="mt-2 h-2" />
              <div className="text-xs text-gray-500 mt-1">
                of {progressMetrics.totalControls} total
              </div>
            </div>
          </div>

          {/* Quality Metrics */}
          {qualityMetrics && showDetails && (
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Assessment Quality</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Scoring Consistency</span>
                  <div className="flex items-center gap-2">
                    <Progress value={qualityMetrics.consistency} className="w-20 h-2" />
                    <span className="text-sm font-medium">{qualityMetrics.consistency.toFixed(0)}%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Documentation Rate</span>
                  <div className="flex items-center gap-2">
                    <Progress value={qualityMetrics.documentation} className="w-20 h-2" />
                    <span className="text-sm font-medium">{qualityMetrics.documentation.toFixed(0)}%</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Function/Category Breakdown */}
      {showDetails && frameworkId === STANDARDS_FRAMEWORKS.NIST_CSF && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Progress by Function</CardTitle>
            <p className="text-sm text-gray-600">Detailed breakdown across NIST CSF functions</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(NIST_CSF_STRUCTURE).map(([funcId, funcData]) => {
                const progress = progressMetrics.functionProgress[funcId] || { completion: 0, averageScore: 0 };
                
                return (
                  <div key={funcId} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <span className="text-xs font-bold text-blue-600">{funcId}</span>
                        </div>
                        <div>
                          <h4 className="font-medium text-sm">{funcData.name}</h4>
                          <p className="text-xs text-gray-600 max-w-md truncate">{funcData.description}</p>
                        </div>
                      </div>
                      <div className="text-right min-w-0">
                        <div className="text-sm font-medium">{progress.completion.toFixed(1)}%</div>
                        <div className="text-xs text-gray-500">Score: {progress.averageScore.toFixed(1)}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={progress.completion} className="flex-1 h-2" />
                      {onDrillDown && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => onDrillDown(funcId)}
                          className="text-xs"
                        >
                          View
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Items */}
      {showDetails && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="w-5 h-5" />
              Recommended Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {progressMetrics.overallCompletion < 25 && (
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">Start with Core Functions</h4>
                    <p className="text-sm text-blue-700">
                      Focus on Govern (GV) and Identify (ID) functions to establish foundational controls.
                    </p>
                  </div>
                </div>
              )}
              
              {qualityMetrics && qualityMetrics.documentation < 50 && progressMetrics.totalAssessed > 5 && (
                <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                  <Clock className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-900">Improve Documentation</h4>
                    <p className="text-sm text-yellow-700">
                      Add evidence notes to {Math.round((100 - qualityMetrics.documentation) * qualityMetrics.totalReviewable / 100)} assessed controls.
                    </p>
                  </div>
                </div>
              )}
              
              {progressMetrics.overallCompletion >= 75 && (
                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-green-900">Prepare for Review</h4>
                    <p className="text-sm text-green-700">
                      Assessment is nearly complete. Consider scheduling a review or audit preparation.
                    </p>
                  </div>
                </div>
              )}
              
              {progressMetrics.totalAssessed === 0 && (
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-gray-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-900">Begin Assessment</h4>
                    <p className="text-sm text-gray-700">
                      Start by reviewing the framework structure and assessing a few key controls.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AssessmentProgress;