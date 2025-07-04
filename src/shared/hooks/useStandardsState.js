// src/hooks/useStandardsState.js
import { useCallback, useMemo } from 'react';
import { 
  calculateOverallCompletion,
  calculateFunctionCompletion,
  validateAssessment,
  createDefaultAssessment
} from '../components/standards/nistCsfData';
import { 
  STANDARDS_FRAMEWORKS, 
  FRAMEWORK_DEFINITIONS,
  calculateOverallScore 
} from '../constants/standardsConstants';

/**
 * Standards State Management Hook
 * 
 * Provides centralized state management and operations for standards and frameworks.
 * Handles assessment data, progress calculations, and framework-specific operations.
 */
export const useStandardsState = (state, dispatch) => {
  // Get standards state with safe defaults
  const standardsState = useMemo(() => ({
    frameworks: {},
    selectedFramework: null,
    assessmentMode: 'guided',
    ...state.standards
  }), [state.standards]);

  // Framework-specific data accessors
  const getFrameworkData = useCallback((frameworkId) => {
    if (!frameworkId) return null;
    
    // Convert framework ID to state key (remove hyphens, dots, lowercase)
    const stateKey = frameworkId.replace(/-/g, '').replace(/\./g, '').toLowerCase();
    
    return {
      ...standardsState.frameworks[stateKey],
      assessmentData: standardsState.frameworks[stateKey]?.assessmentData || {},
      completionRate: standardsState.frameworks[stateKey]?.completionRate || 0,
      overallScore: standardsState.frameworks[stateKey]?.overallScore || 0,
      lastUpdated: standardsState.frameworks[stateKey]?.lastUpdated || null,
      validationIssues: standardsState.frameworks[stateKey]?.validationIssues || []
    };
  }, [standardsState.frameworks]);

  // Update framework data
  const updateFrameworkData = useCallback((frameworkId, data) => {
    if (!frameworkId || !dispatch) return;
    
    const stateKey = frameworkId.replace(/-/g, '').replace(/\./g, '').toLowerCase();
    
    // Calculate progress if assessment data is being updated
    let updatedData = { ...data };
    if (data.assessmentData) {
      const progress = calculateOverallCompletion(data.assessmentData);
      updatedData = {
        ...updatedData,
        completionRate: progress.completion,
        overallScore: progress.averageScore,
        lastUpdated: new Date().toISOString(),
        validationIssues: validateAssessment(data.assessmentData)
      };
    }
    
    dispatch({
      type: 'UPDATE_STANDARDS_DATA',
      payload: {
        framework: stateKey,
        data: updatedData
      }
    });
  }, [dispatch]);

  // Update specific subcategory assessment
  const updateSubcategoryAssessment = useCallback((frameworkId, subcategoryId, assessment) => {
    const currentData = getFrameworkData(frameworkId);
    const updatedAssessmentData = {
      ...currentData.assessmentData,
      [subcategoryId]: {
        ...currentData.assessmentData[subcategoryId],
        ...assessment,
        lastUpdated: new Date().toISOString()
      }
    };

    updateFrameworkData(frameworkId, {
      ...currentData,
      assessmentData: updatedAssessmentData
    });
  }, [getFrameworkData, updateFrameworkData]);

  // Bulk update assessments
  const bulkUpdateAssessments = useCallback((frameworkId, assessments) => {
    const currentData = getFrameworkData(frameworkId);
    const updatedAssessmentData = { ...currentData.assessmentData };
    
    Object.entries(assessments).forEach(([subcategoryId, assessment]) => {
      updatedAssessmentData[subcategoryId] = {
        ...updatedAssessmentData[subcategoryId],
        ...assessment,
        lastUpdated: new Date().toISOString()
      };
    });

    updateFrameworkData(frameworkId, {
      ...currentData,
      assessmentData: updatedAssessmentData
    });
  }, [getFrameworkData, updateFrameworkData]);

  // Initialize framework assessment
  const initializeFramework = useCallback((frameworkId) => {
    const currentData = getFrameworkData(frameworkId);
    
    if (Object.keys(currentData.assessmentData).length === 0) {
      // Only initialize if no assessment data exists
      let defaultAssessment = {};
      
      if (frameworkId === STANDARDS_FRAMEWORKS.NIST_CSF) {
        defaultAssessment = createDefaultAssessment();
      }
      
      updateFrameworkData(frameworkId, {
        assessmentData: defaultAssessment,
        completionRate: 0,
        overallScore: 0,
        lastUpdated: new Date().toISOString(),
        validationIssues: []
      });
    }
  }, [getFrameworkData, updateFrameworkData]);

  // Reset framework assessment
  const resetFrameworkAssessment = useCallback((frameworkId) => {
    let defaultAssessment = {};
    
    if (frameworkId === STANDARDS_FRAMEWORKS.NIST_CSF) {
      defaultAssessment = createDefaultAssessment();
    }
    
    updateFrameworkData(frameworkId, {
      assessmentData: defaultAssessment,
      completionRate: 0,
      overallScore: 0,
      lastUpdated: new Date().toISOString(),
      validationIssues: []
    });
  }, [updateFrameworkData]);

  // Set selected framework
  const setSelectedFramework = useCallback((frameworkId) => {
    if (!dispatch) return;
    
    dispatch({
      type: 'UPDATE_STANDARDS_UI',
      payload: {
        selectedFramework: frameworkId
      }
    });
  }, [dispatch]);

  // Set assessment mode
  const setAssessmentMode = useCallback((mode) => {
    if (!dispatch) return;
    
    dispatch({
      type: 'UPDATE_STANDARDS_UI',
      payload: {
        assessmentMode: mode
      }
    });
  }, [dispatch]);

  // Export assessment data
  const exportFrameworkData = useCallback((frameworkId, format = 'json') => {
    const frameworkData = getFrameworkData(frameworkId);
    const frameworkDefinition = FRAMEWORK_DEFINITIONS[frameworkId];
    
    if (!frameworkData || !frameworkDefinition) return null;
    
    const exportData = {
      framework: {
        id: frameworkId,
        name: frameworkDefinition.name,
        version: frameworkDefinition.version,
        exportDate: new Date().toISOString()
      },
      assessment: {
        completionRate: frameworkData.completionRate,
        overallScore: frameworkData.overallScore,
        lastUpdated: frameworkData.lastUpdated,
        assessmentData: frameworkData.assessmentData
      },
      validation: {
        issues: frameworkData.validationIssues
      }
    };
    
    if (format === 'json') {
      return JSON.stringify(exportData, null, 2);
    }
    
    // Additional formats can be added here (CSV, XML, etc.)
    return exportData;
  }, [getFrameworkData]);

  // Import assessment data
  const importFrameworkData = useCallback((frameworkId, importData) => {
    try {
      let assessmentData = {};
      
      if (typeof importData === 'string') {
        const parsed = JSON.parse(importData);
        assessmentData = parsed.assessment?.assessmentData || parsed.assessmentData || {};
      } else {
        assessmentData = importData.assessment?.assessmentData || importData.assessmentData || importData;
      }
      
      // Validate imported data structure
      if (typeof assessmentData !== 'object') {
        throw new Error('Invalid assessment data format');
      }
      
      updateFrameworkData(frameworkId, {
        assessmentData,
        lastUpdated: new Date().toISOString()
      });
      
      return { success: true, message: 'Assessment data imported successfully' };
    } catch (error) {
      return { success: false, message: `Import failed: ${error.message}` };
    }
  }, [updateFrameworkData]);

  // Get assessment statistics
  const getAssessmentStatistics = useCallback(() => {
    const frameworks = Object.keys(FRAMEWORK_DEFINITIONS);
    const stats = {
      totalFrameworks: frameworks.length,
      availableFrameworks: frameworks.filter(id => 
        FRAMEWORK_DEFINITIONS[id].status === 'available'
      ).length,
      assessmentsStarted: 0,
      assessmentsCompleted: 0,
      averageProgress: 0,
      averageScore: 0,
      totalValidationIssues: 0
    };
    
    let totalProgress = 0;
    let totalScore = 0;
    let frameworksWithProgress = 0;
    
    frameworks.forEach(frameworkId => {
      const data = getFrameworkData(frameworkId);
      if (data.completionRate > 0) {
        stats.assessmentsStarted++;
        totalProgress += data.completionRate;
        totalScore += data.overallScore;
        frameworksWithProgress++;
        
        if (data.completionRate >= 90) {
          stats.assessmentsCompleted++;
        }
      }
      
      stats.totalValidationIssues += (data.validationIssues?.length || 0);
    });
    
    if (frameworksWithProgress > 0) {
      stats.averageProgress = totalProgress / frameworksWithProgress;
      stats.averageScore = totalScore / frameworksWithProgress;
    }
    
    return stats;
  }, [getFrameworkData]);

  // Get frameworks requiring attention
  const getFrameworksRequiringAttention = useCallback(() => {
    const frameworks = Object.keys(FRAMEWORK_DEFINITIONS);
    const attention = [];
    
    frameworks.forEach(frameworkId => {
      const data = getFrameworkData(frameworkId);
      const definition = FRAMEWORK_DEFINITIONS[frameworkId];
      
      // Skip if framework is not available
      if (definition.status !== 'available') return;
      
      const issues = [];
      
      // Check for stale assessments (no updates in 30+ days)
      if (data.lastUpdated) {
        const daysSinceUpdate = (Date.now() - new Date(data.lastUpdated).getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceUpdate > 30 && data.completionRate > 0 && data.completionRate < 100) {
          issues.push('Stale assessment - no updates in 30+ days');
        }
      }
      
      // Check for low completion with validation issues
      if (data.completionRate > 0 && data.completionRate < 50 && data.validationIssues?.length > 0) {
        issues.push(`${data.validationIssues.length} validation issues need attention`);
      }
      
      // Check for high completion but low quality scores
      if (data.completionRate > 80 && data.overallScore < 60) {
        issues.push('High completion but low quality scores');
      }
      
      if (issues.length > 0) {
        attention.push({
          frameworkId,
          frameworkName: definition.name,
          issues,
          completionRate: data.completionRate,
          overallScore: data.overallScore,
          lastUpdated: data.lastUpdated
        });
      }
    });
    
    return attention;
  }, [getFrameworkData]);

  return {
    // State
    standardsState,
    selectedFramework: standardsState.selectedFramework,
    assessmentMode: standardsState.assessmentMode,
    
    // Data operations
    getFrameworkData,
    updateFrameworkData,
    updateSubcategoryAssessment,
    bulkUpdateAssessments,
    
    // Framework lifecycle
    initializeFramework,
    resetFrameworkAssessment,
    
    // UI state
    setSelectedFramework,
    setAssessmentMode,
    
    // Import/Export
    exportFrameworkData,
    importFrameworkData,
    
    // Analytics
    getAssessmentStatistics,
    getFrameworksRequiringAttention
  };
};