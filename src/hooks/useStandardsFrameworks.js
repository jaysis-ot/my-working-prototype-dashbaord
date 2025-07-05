import { useState, useEffect, useCallback, useMemo } from 'react';

// --- Constants (NIST CSF 2.0 Data Structure) ---
// This data is embedded here for simplicity. In a larger application,
// it might be loaded from a JSON file or an API.

const NIST_CSF_DATA = {
  functions: [
    { id: 'GV', name: 'Govern', description: 'Establish, communicate, and monitor the organization’s cybersecurity risk management strategy, expectations, and policy.' },
    { id: 'ID', name: 'Identify', description: 'Understand the organization’s environment to manage cybersecurity risk to systems, people, assets, data, and capabilities.' },
    { id: 'PR', name: 'Protect', description: 'Develop and implement appropriate safeguards to ensure delivery of critical services.' },
    { id: 'DT', name: 'Detect', description: 'Develop and implement appropriate activities to identify the occurrence of cybersecurity events.' },
    { id: 'RS', name: 'Respond', description: 'Develop and implement appropriate activities to take action regarding a detected cybersecurity incident.' },
    { id: 'RC', name: 'Recover', description: 'Develop and implement appropriate activities to maintain plans for resilience and to restore any capabilities or services that were impaired.' },
  ],
  categories: {
    GV: [
      { id: 'GV.OC', name: 'Organizational Context', description: 'The circumstances—mission, stakeholder expectations, and legal, regulatory, and contractual requirements—surrounding the organization’s cybersecurity risk management decisions are understood.' },
      { id: 'GV.RM', name: 'Risk Management Strategy', description: 'The organization’s priorities, constraints, risk tolerance and appetite, and assumptions are established and used to support operational risk decisions.' },
      { id: 'GV.RR', name: 'Roles, Responsibilities, and Authorities', description: 'Cybersecurity roles, responsibilities, and authorities are established and communicated to foster accountability, performance assessment, and continuous improvement.' },
      { id: 'GV.PO', name: 'Policies, Processes, and Procedures', description: 'Organizational policies, processes, and procedures are established, communicated, and enforced to manage cybersecurity risks.' },
      { id: 'GV.SP', name: 'Cybersecurity Supply Chain Risk Management', description: 'Cybersecurity risks in the supply chain are managed.' },
    ],
    ID: [
        { id: 'ID.AM', name: 'Asset Management', description: 'The organization’s assets (e.g., data, hardware, software, systems, facilities, services, people) and their significance are understood.' },
        { id: 'ID.RA', name: 'Risk Assessment', description: 'The organization’s cybersecurity risks are assessed.' },
        { id: 'ID.IM', name: 'Improvement', description: 'Improvements to organizational cybersecurity risk management processes, procedures, and activities are identified.' },
    ],
    PR: [
        { id: 'PR.AA', name: 'Identity Management, Authentication, and Access Control', description: 'Access to physical and logical assets is limited to authorized users, processes, and devices and is managed consistent with the determined risk of organizational operations.' },
        { id: 'PR.AT', name: 'Awareness and Training', description: 'The organization’s personnel and partners are provided cybersecurity awareness education and are trained to perform their cybersecurity-related duties and responsibilities consistent with related policies, procedures, and agreements.' },
        { id: 'PR.DS', name: 'Data Security', description: 'Data is managed consistent with the organization’s risk strategy to protect the confidentiality, integrity, and availability of information.' },
        { id: 'PR.PS', name: 'Platform Security', description: 'Hardware, software, and services of physical and virtual platforms are managed consistent with the organization’s risk strategy to protect their confidentiality, integrity, and availability.' },
        { id: 'PR.IR', name: 'Resilience', description: 'The resilience of platforms and assets is increased by designing and executing contingency planning (e.g., continuity of operations, disaster recovery, and failover).'},
    ],
    DT: [
        { id: 'DT.CM', name: 'Continuous Monitoring', description: 'Assets are monitored to find anomalies, indicators of compromise, and other potentially adverse events.' },
        { id: 'DT.AA', name: 'Adversarial Analysis', description: 'Adversary capabilities and actions are analyzed to inform and improve the other functions.' },
    ],
    RS: [
        { id: 'RS.MA', name: 'Incident Management', description: 'Incidents are managed.' },
        { id: 'RS.AN', name: 'Incident Analysis', description: 'Incidents are analyzed to support response and recovery activities.' },
        { id: 'RS.CO', name: 'Incident Communication', description: 'Response activities are coordinated with internal and external stakeholders as required.' },
        { id: 'RS.MI', name: 'Incident Mitigation', description: 'Actions are taken to prevent expansion of an event, mitigate its effects, and resolve the incident.' },
    ],
    RC: [
        { id: 'RC.RP', name: 'Incident Recovery Plan Execution', description: 'Incident recovery plans are executed.' },
        { id: 'RC.CO', name: 'Incident Recovery Communication', description: 'Recovery activities are coordinated with internal and external parties.' },
    ],
  },
  subcategories: {
    'GV.OC': [
      { id: 'GV.OC-01', description: 'The organizational cybersecurity strategy is established, communicated, and used to guide cybersecurity activities.' },
      { id: 'GV.OC-02', description: 'Internal and external stakeholders are identified, and their needs and expectations regarding cybersecurity are understood and considered.' },
      { id: 'GV.OC-03', description: 'Legal, regulatory, and contractual requirements regarding cybersecurity are understood and managed.' },
      { id: 'GV.OC-04', description: 'Critical objectives, capabilities, and services that stakeholders depend on or expect from the organization are understood and communicated.' },
    ],
    'GV.RM': [
      { id: 'GV.RM-01', description: 'The organization’s risk management processes are established and managed.' },
      { id: 'GV.RM-02', description: 'Organizational risk tolerance is determined and clearly expressed.' },
      { id: 'GV.RM-03', description: 'The organization’s determination of risk is used to inform and prioritize organizational decisions.' },
    ],
    'ID.AM': [
        { id: 'ID.AM-01', description: 'Assets (e.g., data, hardware, software, systems, services) are identified and inventoried.' },
        { id: 'ID.AM-02', description: 'The criticality of assets is determined and used to prioritize protection efforts.' },
    ],
    'PR.AA': [
        { id: 'PR.AA-01', description: 'Identities and credentials for authorized users, processes, and devices are managed.' },
        { id: 'PR.AA-02', description: 'Access to physical and logical assets is managed and enforced.' },
    ],
    'DT.CM': [
        { id: 'DT.CM-01', description: 'Networks, systems, and assets are monitored for anomalies and potential cybersecurity events.' },
        { id: 'DT.CM-02', description: 'The effectiveness of cybersecurity controls is monitored.' },
    ],
    'RS.MA': [
        { id: 'RS.MA-01', description: 'An incident management process is established and managed.' },
        { id: 'RS.MA-02', description: 'Incidents are reported and tracked.' },
    ],
    'RC.RP': [
        { id: 'RC.RP-01', description: 'Incident recovery plans are executed.' },
        { id: 'RC.RP-02', description: 'Recovery activities are improved based on lessons learned.' },
    ]
  },
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
    const totalSubcategories = Object.values(NIST_CSF_DATA.subcategories).flat().length;
    let completedCount = 0;
    
    const functionScores = {};
    const categoryScores = {};

    NIST_CSF_DATA.functions.forEach(func => {
      let funcTotalScore = 0;
      let funcSubcatCount = 0;

      NIST_CSF_DATA.categories[func.id]?.forEach(cat => {
        const subcatsInCat = NIST_CSF_DATA.subcategories[cat.id] || [];
        let catTotalScore = 0;
        let catAnsweredCount = 0;

        subcatsInCat.forEach(subcat => {
            const response = assessment[subcat.id];
            if (response) {
                catTotalScore += responseValues[response] || 0;
                if (response !== 'N/A') {
                    catAnsweredCount++;
                }
            }
        });

        completedCount += Object.keys(assessment).filter(k => k.startsWith(cat.id)).length;
        funcTotalScore += catTotalScore;
        funcSubcatCount += subcatsInCat.length;
        categoryScores[cat.id] = {
          score: catTotalScore,
          maxScore: subcatsInCat.length,
          percentage: subcatsInCat.length > 0 ? (catTotalScore / subcatsInCat.length) * 100 : 0,
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
