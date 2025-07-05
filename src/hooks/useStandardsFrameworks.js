import { useState, useEffect, useCallback, useMemo } from 'react';

// --- Constants (NIST CSF 2.0 Data Structure) ---
// This data is embedded here for simplicity. In a larger application,
// it might be loaded from a JSON file or an API.

const NIST_CSF_DATA = {
  functions: [
    { id: 'FV.GV', name: 'Govern', description: 'The organization’s cybersecurity risk management strategy, expectations, and policy are established, communicated, and monitored.' },
    { id: 'FV.ID', name: 'Identify', description: 'The organization’s current cybersecurity risks are understood.' },
    { id: 'FV.PR', name: 'Protect', description: 'Safeguards to manage the organization’s cybersecurity risks are used.' },
    { id: 'FV.DT', name: 'Detect', description: 'Possible cybersecurity attacks and compromises are found and analyzed.' },
    { id: 'FV.RS', name: 'Respond', description: 'Actions regarding a detected cybersecurity incident are taken.' },
    { id: 'FV.RC', name: 'Recover', description: 'Assets and operations affected by a cybersecurity incident are restored.' },
  ],
  categories: {
    'FV.GV': [
      { id: 'GV.OC', name: 'Organizational Context', description: 'The circumstances—mission, stakeholder expectations, and legal, regulatory, and contractual requirements—surrounding the organization’s cybersecurity risk management decisions are understood.' },
      { id: 'GV.RM', name: 'Risk Management Strategy', description: 'The organization’s priorities, constraints, risk tolerance and appetite, and assumptions are established and used to support operational risk decisions.' },
      { id: 'GV.RR', name: 'Roles, Responsibilities, and Authorities', description: 'Cybersecurity roles, responsibilities, and authorities are established and communicated to foster accountability, performance assessment, and continuous improvement.' },
      { id: 'GV.PO', name: 'Policies, Processes, and Procedures', description: 'Organizational policies, processes, and procedures are established, communicated, and enforced to manage cybersecurity risks.' },
      { id: 'GV.SP', name: 'Cybersecurity Supply Chain Risk Management', description: 'Cybersecurity risks in the supply chain are managed.' },
    ],
    'FV.ID': [
        { id: 'ID.AM', name: 'Asset Management', description: 'The organization’s assets (e.g., data, hardware, software, systems, facilities, services, people) and their significance are understood.' },
        { id: 'ID.RA', name: 'Risk Assessment', description: 'The organization’s cybersecurity risks are assessed.' },
        { id: 'ID.IM', name: 'Improvement', description: 'Improvements to organizational cybersecurity risk management processes, procedures, and activities are identified.' },
    ],
    'FV.PR': [
        { id: 'PR.AA', name: 'Identity Management, Authentication, and Access Control', description: 'Access to physical and logical assets is limited to authorized users, processes, and devices and is managed consistent with the determined risk of organizational operations.' },
        { id: 'PR.AT', name: 'Awareness and Training', description: 'The organization’s personnel and partners are provided cybersecurity awareness education and are trained to perform their cybersecurity-related duties and responsibilities consistent with related policies, procedures, and agreements.' },
        { id: 'PR.DS', name: 'Data Security', description: 'Data is managed consistent with the organization’s risk strategy to protect the confidentiality, integrity, and availability of information.' },
        { id: 'PR.PS', name: 'Platform Security', description: 'Hardware, software, and services of physical and virtual platforms are managed consistent with the organization’s risk strategy to protect their confidentiality, integrity, and availability.' },
        { id: 'PR.IR', name: 'Resilience', description: 'The resilience of platforms and assets is increased by designing and executing contingency planning (e.g., continuity of operations, disaster recovery, and failover).'},
    ],
    'FV.DT': [
        { id: 'DT.CM', name: 'Continuous Monitoring', description: 'Assets are monitored to find anomalies, indicators of compromise, and other potentially adverse events.' },
        { id: 'DT.AA', name: 'Adversarial Analysis', description: 'Adversary capabilities and actions are analyzed to inform and improve the other functions.' },
    ],
    'FV.RS': [
        { id: 'RS.MA', name: 'Incident Management', description: 'Incidents are managed.' },
        { id: 'RS.AN', name: 'Incident Analysis', description: 'Incidents are analyzed to support response and recovery activities.' },
        { id: 'RS.CO', name: 'Incident Communication', description: 'Response activities are coordinated with internal and external stakeholders as required.' },
        { id: 'RS.MI', name: 'Incident Mitigation', description: 'Actions are taken to prevent expansion of an event, mitigate its effects, and resolve the incident.' },
    ],
    'FV.RC': [
        { id: 'RC.RP', name: 'Incident Recovery Plan Execution', description: 'Incident recovery plans are executed.' },
        { id: 'RC.CO', name: 'Incident Recovery Communication', description: 'Recovery activities are coordinated with internal and external parties.' },
    ],
  },
  // Subcategories are extensive and would be fully populated in a real implementation.
  // For this hook, we will assume the structure exists and focus on the logic.
};

const ASSESSMENT_STORAGE_KEY = 'cyberTrustDashboard.nistCsfAssessment';

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
    } catch (e) {
      console.error("Failed to reset NIST CSF assessment:", e);
      setError(new Error("Could not reset the assessment."));
    }
  }, []);

  // --- Scoring and Completion Logic ---
  const scores = useMemo(() => {
    const responseValues = { 'Yes': 1, 'Partial': 0.5, 'No': 0, 'N/A': 0 };
    const totalSubcategories = Object.values(NIST_CSF_DATA.categories).flat().length; // Simplified count
    let completedCount = 0;
    
    const functionScores = {};
    const categoryScores = {};

    NIST_CSF_DATA.functions.forEach(func => {
      let funcTotalScore = 0;
      let funcSubcatCount = 0;

      NIST_CSF_DATA.categories[func.id]?.forEach(cat => {
        // This is a simplified placeholder as subcategories are not in the mock data.
        // In a real implementation, we would iterate through cat.subcategories.
        const subcatsInCat = 5; // Mock number of subcategories per category
        let catTotalScore = 0;
        let catAnsweredCount = 0;

        for (let i = 1; i <= subcatsInCat; i++) {
          const subcatId = `${cat.id}.${i}`;
          const response = assessment[subcatId];
          if (response) {
            catTotalScore += responseValues[response] || 0;
            if (response !== 'N/A') {
              catAnsweredCount++;
            }
          }
        }

        completedCount += Object.keys(assessment).filter(k => k.startsWith(cat.id)).length;
        funcTotalScore += catTotalScore;
        funcSubcatCount += subcatsInCat;
        categoryScores[cat.id] = {
          score: catTotalScore,
          maxScore: subcatsInCat,
          percentage: subcatsInCat > 0 ? (catTotalScore / subcatsInCat) * 100 : 0,
        };
      });

      functionScores[func.id] = {
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
    framework: NIST_CSF_DATA,
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
