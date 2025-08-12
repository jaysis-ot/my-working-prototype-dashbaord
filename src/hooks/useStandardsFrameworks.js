import { useState, useEffect, useCallback, useMemo } from 'react';

// Import the authoritative NIST CSF 2.0 structure (106 sub-categories)
import { NIST_CSF_STRUCTURE, getAllSubcategories } from '../shared/components/standards/nistCsfData';

const ASSESSMENT_STORAGE_KEY = 'cyberTrustDashboard.nistCsfAssessment';
const META_STORAGE_KEY = 'cyberTrustDashboard.nistCsfAssessmentMeta';

// --- Main Hook ---

/**
 * Custom hook for managing Standards and Frameworks data, specifically focusing on NIST CSF 2.0.
 * 
 * This hook encapsulates all logic for loading, managing, and persisting a NIST CSF 2.0 assessment.
 * It provides a clean API for UI components to interact with the assessment data, calculate scores,
 * and track completion status.
 */
export const useStandardsFrameworks = () => {
  const [assessment, setAssessment] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Data Initialization ---
  useEffect(() => {
    try {
      setLoading(true);
      const savedAssessment = localStorage.getItem(ASSESSMENT_STORAGE_KEY);
      if (savedAssessment) {
        setAssessment(JSON.parse(savedAssessment));
      } else {
        // Initialize with an empty object if no saved data
        setAssessment({});
      }
    } catch (e) {
      console.error("Failed to load NIST CSF assessment from storage:", e);
      setError(new Error("Could not load your saved assessment. It may be corrupted."));
    } finally {
      setLoading(false);
    }
  }, []);

  // --- State Update and Persistence ---
  const updateAssessmentResponse = useCallback((subcategoryId, response) => {
    setAssessment(prev => {
      const newAssessment = { ...prev, [subcategoryId]: response };
      try {
        localStorage.setItem(ASSESSMENT_STORAGE_KEY, JSON.stringify(newAssessment));
        // --- Write meta ---------------------------------------------------
        const { userTitle, userRole } = getCurrentUserInfo();
        localStorage.setItem(
          META_STORAGE_KEY,
          JSON.stringify({
            lastUpdated: new Date().toISOString(),
            userTitle,
            userRole,
          })
        );
        // store global last updated for snapshot widgets
        localStorage.setItem(
          'cyberTrustDashboard.lastUpdated',
          JSON.stringify({ lastUpdated: new Date().toISOString() })
        );
      } catch (e) {
        console.error("Failed to save NIST CSF assessment to storage:", e);
        setError(new Error("Could not save your progress."));
      }
      return newAssessment;
    });
  }, []);

  const resetAssessment = useCallback(() => {
    try {
      localStorage.removeItem(ASSESSMENT_STORAGE_KEY);
      setAssessment({});
      const { userTitle, userRole } = getCurrentUserInfo();
      localStorage.setItem(
        META_STORAGE_KEY,
        JSON.stringify({
          lastUpdated: new Date().toISOString(),
          userTitle,
          userRole,
        })
      );
      localStorage.setItem(
        'cyberTrustDashboard.lastUpdated',
        JSON.stringify({ lastUpdated: new Date().toISOString() })
      );
    } catch (e) {
      console.error("Failed to reset NIST CSF assessment:", e);
      setError(new Error("Could not reset the assessment."));
    }
  }, []);

  // --- Build Framework Structure from NIST_CSF_STRUCTURE ---
  const framework = useMemo(() => {
    // Transform the structure into the format expected by the UI
    const functions = Object.entries(NIST_CSF_STRUCTURE).map(([funcId, funcData]) => ({
      id: funcId,
      name: funcData.name,
      description: funcData.description
    }));

    // Build categories by function
    const categories = {};
    Object.entries(NIST_CSF_STRUCTURE).forEach(([funcId, funcData]) => {
      categories[funcId] = Object.entries(funcData.categories).map(([catId, catData]) => ({
        id: catId,
        name: catData.name,
        description: catData.description
      }));
    });

    // Build subcategories by category
    const subcategories = {};
    Object.entries(NIST_CSF_STRUCTURE).forEach(([funcId, funcData]) => {
      Object.entries(funcData.categories).forEach(([catId, catData]) => {
        subcategories[catId] = Object.entries(catData.subcategories).map(([subId, subData]) => ({
          id: subId,
          description: subData.name
        }));
      });
    });

    return {
      functions,
      categories,
      subcategories
    };
  }, []);

  // --- Scoring and Completion Logic ---
  const scores = useMemo(() => {
    const responseValues = { 'Yes': 1, 'Partial': 0.5, 'No': 0, 'N/A': 0 };
    const allSubcategories = getAllSubcategories();
    const totalSubcategories = allSubcategories.length;
    let completedCount = 0;
    
    const functionScores = {};
    const categoryScores = {};

    // Calculate scores for each function and category
    Object.entries(NIST_CSF_STRUCTURE).forEach(([funcId, funcData]) => {
      let funcTotalScore = 0;
      let funcSubcatCount = 0;

      Object.entries(funcData.categories).forEach(([catId, catData]) => {
        const subcatsInCat = Object.keys(catData.subcategories).length;
        let catTotalScore = 0;
        let catAnsweredCount = 0;

        Object.entries(catData.subcategories).forEach(([subId, subData]) => {
          const response = assessment[subId];
          if (response) {
            catTotalScore += responseValues[response] || 0;
            if (response !== 'N/A') {
              catAnsweredCount++;
              completedCount++;
            }
          }
        });

        funcTotalScore += catTotalScore;
        funcSubcatCount += subcatsInCat;
        categoryScores[catId] = {
          score: catTotalScore,
          maxScore: subcatsInCat,
          percentage: subcatsInCat > 0 ? (catTotalScore / subcatsInCat) * 100 : 0,
        };
      });

      functionScores[funcId] = {
        score: funcTotalScore,
        maxScore: funcSubcatCount,
        percentage: funcSubcatCount > 0 ? (funcTotalScore / funcSubcatCount) * 100 : 0,
      };
    });

    const overallScore = Object.values(functionScores).reduce((sum, func) => sum + func.score, 0);
    const maxOverallScore = Object.values(functionScores).reduce((sum, func) => sum + func.maxScore, 0);

    return {
      byFunction: functionScores,
      byCategory: categoryScores,
      overall: {
        score: overallScore,
        maxScore: maxOverallScore,
        percentage: maxOverallScore > 0 ? (overallScore / maxOverallScore) * 100 : 0,
      },
      completionPercentage: totalSubcategories > 0 ? (completedCount / totalSubcategories) * 100 : 0,
    };
  }, [assessment]);

  return {
    // Data
    framework,
    assessment,
    scores,

    // State
    loading,
    error,

    // Actions
    updateAssessmentResponse,
    resetAssessment,
  };
};

/**
 * Utility: safely obtain current user information from localStorage
 * Returns an object with userTitle and userRole (can be null if unavailable)
 */
function getCurrentUserInfo() {
  try {
    const raw = localStorage.getItem('dashboard_current_user');
    if (!raw) return { userTitle: null, userRole: null };
    const parsed = JSON.parse(raw);
    return {
      userTitle: parsed.jobTitle || null,
      userRole: parsed.role || null,
    };
  } catch (e) {
    console.warn('getCurrentUserInfo: failed to parse user from storage', e);
    return { userTitle: null, userRole: null };
  }
}
