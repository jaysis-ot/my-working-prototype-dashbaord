// src/hooks/useFrameworkProgress.js
import { useMemo, useCallback } from 'react';
import { 
  calculateFunctionCompletion,
  calculateOverallCompletion,
  getCompletionByCategory,
  NIST_CSF_STRUCTURE
} from '../components/standards/nistCsfData';
import { STANDARDS_FRAMEWORKS } from '../constants/standardsConstants';

/**
 * Framework Progress Calculation Hook
 * 
 * Provides comprehensive progress tracking, trend analysis, and performance metrics
 * for framework assessments. Handles real-time calculations and historical comparisons.
 */
export const useFrameworkProgress = (frameworkId, assessmentData = {}, historicalData = []) => {
  
  // Core progress calculations
  const progress = useMemo(() => {
    if (!frameworkId || !assessmentData) {
      return {
        overall: { completion: 0, averageScore: 0 },
        functions: {},
        categories: {},
        totalControls: 0,
        assessedControls: 0,
        lastCalculated: new Date().toISOString()
      };
    }

    let result = {
      overall: { completion: 0, averageScore: 0 },
      functions: {},
      categories: {},
      totalControls: 0,
      assessedControls: 0,
      lastCalculated: new Date().toISOString()
    };

    if (frameworkId === STANDARDS_FRAMEWORKS.NIST_CSF) {
      // NIST CSF specific calculations
      result.overall = calculateOverallCompletion(assessmentData);
      
      // Function-level progress
      Object.keys(NIST_CSF_STRUCTURE).forEach(funcId => {
        result.functions[funcId] = calculateFunctionCompletion(assessmentData, funcId);
      });
      
      // Category-level progress
      Object.entries(NIST_CSF_STRUCTURE).forEach(([funcId, funcData]) => {
        Object.keys(funcData.categories).forEach(categoryId => {
          result.categories[`${funcId}.${categoryId}`] = getCompletionByCategory(
            assessmentData, 
            funcId, 
            categoryId
          );
        });
      });
      
      // Count total and assessed controls
      Object.entries(NIST_CSF_STRUCTURE).forEach(([funcId, funcData]) => {
        Object.entries(funcData.categories).forEach(([categoryId, categoryData]) => {
          Object.keys(categoryData.subcategories).forEach(subId => {
            result.totalControls++;
            const assessment = assessmentData[subId];
            if (assessment && (
              assessment.maturity > 0 || 
              assessment.implementation > 0 || 
              assessment.evidence > 0 || 
              assessment.testing > 0
            )) {
              result.assessedControls++;
            }
          });
        });
      });
    }

    return result;
  }, [frameworkId, assessmentData]);

  // Trend analysis based on historical data
  const trends = useMemo(() => {
    if (!historicalData || historicalData.length < 2) {
      return {
        overallTrend: 'stable',
        completionTrend: 0,
        scoreTrend: 0,
        velocity: 0, // controls assessed per week
        projectedCompletion: null,
        trendAnalysis: 'insufficient_data'
      };
    }

    // Sort historical data by date
    const sortedHistory = [...historicalData].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );

    const latest = sortedHistory[sortedHistory.length - 1];
    const previous = sortedHistory[sortedHistory.length - 2];
    
    const completionTrend = latest.completionRate - previous.completionRate;
    const scoreTrend = latest.overallScore - previous.overallScore;
    
    // Calculate velocity (controls assessed per week)
    const timeDiffWeeks = (new Date(latest.date) - new Date(previous.date)) / (1000 * 60 * 60 * 24 * 7);
    const controlsDiff = latest.assessedControls - previous.assessedControls;
    const velocity = timeDiffWeeks > 0 ? controlsDiff / timeDiffWeeks : 0;
    
    // Project completion date based on current velocity
    let projectedCompletion = null;
    if (velocity > 0 && latest.completionRate < 100) {
      const remainingControls = progress.totalControls - progress.assessedControls;
      const weeksToCompletion = remainingControls / velocity;
      projectedCompletion = new Date(Date.now() + weeksToCompletion * 7 * 24 * 60 * 60 * 1000);
    }
    
    // Determine overall trend
    let overallTrend = 'stable';
    if (completionTrend > 2) overallTrend = 'improving';
    else if (completionTrend < -2) overallTrend = 'declining';
    
    // Trend analysis
    let trendAnalysis = 'stable';
    if (velocity > 5) trendAnalysis = 'accelerating';
    else if (velocity > 2) trendAnalysis = 'steady_progress';
    else if (velocity > 0) trendAnalysis = 'slow_progress';
    else if (velocity === 0) trendAnalysis = 'stalled';
    else trendAnalysis = 'regressing';

    return {
      overallTrend,
      completionTrend,
      scoreTrend,
      velocity,
      projectedCompletion,
      trendAnalysis
    };
  }, [historicalData, progress.totalControls, progress.assessedControls]);

  // Quality metrics analysis
  const quality = useMemo(() => {
    if (!assessmentData || Object.keys(assessmentData).length === 0) {
      return {
        consistency: 0,
        documentation: 0,
        completeness: 0,
        evidenceQuality: 0,
        overallQuality: 0
      };
    }

    let consistentCount = 0;
    let documentedCount = 0;
    let completeCount = 0;
    let goodEvidenceCount = 0;
    let totalAssessed = 0;

    Object.values(assessmentData).forEach(assessment => {
      if (!assessment || (
        assessment.maturity === 0 && 
        assessment.implementation === 0 && 
        assessment.evidence === 0 && 
        assessment.testing === 0
      )) return;

      totalAssessed++;

      // Consistency: low variance between dimensions
      const scores = [assessment.maturity, assessment.implementation, assessment.evidence, assessment.testing];
      const average = scores.reduce((a, b) => a + b, 0) / scores.length;
      const variance = Math.max(...scores.map(s => Math.abs(s - average)));
      if (variance <= 1) consistentCount++;

      // Documentation: has meaningful notes
      if (assessment.notes && assessment.notes.trim().length >= 20) {
        documentedCount++;
      }

      // Completeness: all dimensions scored
      if (scores.every(s => s > 0)) {
        completeCount++;
      }

      // Evidence quality: high evidence scores with documentation
      if (assessment.evidence >= 2 && assessment.notes && assessment.notes.trim().length >= 10) {
        goodEvidenceCount++;
      }
    });

    const consistency = totalAssessed > 0 ? (consistentCount / totalAssessed) * 100 : 0;
    const documentation = totalAssessed > 0 ? (documentedCount / totalAssessed) * 100 : 0;
    const completeness = totalAssessed > 0 ? (completeCount / totalAssessed) * 100 : 0;
    const evidenceQuality = totalAssessed > 0 ? (goodEvidenceCount / totalAssessed) * 100 : 0;
    
    const overallQuality = (consistency + documentation + completeness + evidenceQuality) / 4;

    return {
      consistency,
      documentation,
      completeness,
      evidenceQuality,
      overallQuality
    };
  }, [assessmentData]);

  // Performance benchmarks and targets
  const benchmarks = useMemo(() => {
    const baseTargets = {
      completionRate: {
        good: 70,
        excellent: 90
      },
      overallScore: {
        good: 65,
        excellent: 80
      },
      quality: {
        good: 70,
        excellent: 85
      },
      velocity: {
        good: 3, // controls per week
        excellent: 7
      }
    };

    const current = {
      completionRate: progress.overall.completion,
      overallScore: progress.overall.averageScore,
      quality: quality.overallQuality,
      velocity: trends.velocity
    };

    const performanceLevel = {};
    Object.keys(baseTargets).forEach(metric => {
      const value = current[metric];
      if (value >= baseTargets[metric].excellent) {
        performanceLevel[metric] = 'excellent';
      } else if (value >= baseTargets[metric].good) {
        performanceLevel[metric] = 'good';
      } else {
        performanceLevel[metric] = 'needs_improvement';
      }
    });

    return {
      targets: baseTargets,
      current,
      performanceLevel
    };
  }, [progress.overall, quality.overallQuality, trends.velocity]);

  // Get progress by time period
  const getProgressByPeriod = useCallback((period = 'week') => {
    if (!historicalData || historicalData.length === 0) return [];

    const now = new Date();
    const periods = {
      week: 7,
      month: 30,
      quarter: 90
    };
    
    const daysToInclude = periods[period] || 7;
    const cutoffDate = new Date(now.getTime() - daysToInclude * 24 * 60 * 60 * 1000);
    
    return historicalData
      .filter(entry => new Date(entry.date) >= cutoffDate)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [historicalData]);

  // Get top performing functions/categories
  const getTopPerformers = useCallback(() => {
    if (frameworkId !== STANDARDS_FRAMEWORKS.NIST_CSF) return [];
    
    const functionPerformance = Object.entries(progress.functions).map(([funcId, data]) => ({
      type: 'function',
      id: funcId,
      name: NIST_CSF_STRUCTURE[funcId]?.name || funcId,
      completion: data.completion,
      score: data.averageScore
    }));
    
    return functionPerformance
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }, [frameworkId, progress.functions]);

  // Get areas needing attention
  const getAreasNeedingAttention = useCallback(() => {
    if (frameworkId !== STANDARDS_FRAMEWORKS.NIST_CSF) return [];
    
    const issues = [];
    
    // Functions with low completion
    Object.entries(progress.functions).forEach(([funcId, data]) => {
      if (data.completion < 30 && data.completion > 0) {
        issues.push({
          type: 'low_completion',
          area: `${funcId} (${NIST_CSF_STRUCTURE[funcId]?.name})`,
          completion: data.completion,
          priority: 'high'
        });
      }
    });
    
    // Functions with low scores but high completion
    Object.entries(progress.functions).forEach(([funcId, data]) => {
      if (data.completion > 70 && data.averageScore < 50) {
        issues.push({
          type: 'low_quality',
          area: `${funcId} (${NIST_CSF_STRUCTURE[funcId]?.name})`,
          score: data.averageScore,
          priority: 'medium'
        });
      }
    });
    
    return issues.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }, [frameworkId, progress.functions]);

  return {
    // Core metrics
    progress,
    trends,
    quality,
    benchmarks,
    
    // Analysis functions
    getProgressByPeriod,
    getTopPerformers,
    getAreasNeedingAttention,
    
    // Computed flags
    isOnTrack: progress.overall.completion > 0 && trends.velocity > 0,
    needsAttention: quality.overallQuality < 50 || trends.velocity === 0,
    isHighQuality: quality.overallQuality >= 80,
    isNearCompletion: progress.overall.completion >= 80,
    
    // Progress indicators
    completionPercentage: progress.overall.completion,
    qualityPercentage: quality.overallQuality,
    velocityTrend: trends.trendAnalysis,
    estimatedCompletionDate: trends.projectedCompletion
  };
};