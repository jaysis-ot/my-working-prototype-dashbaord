import { useState, useEffect, useCallback, useMemo } from 'react';

// --- Constants & Helper Functions ---

const RISK_STATUSES = ['Open', 'In Progress', 'Mitigated', 'Accepted'];
const RISK_CATEGORIES = ['Technical', 'Operational', 'Compliance', 'Strategic'];
const TREATMENT_STRATEGIES = ['Mitigate', 'Transfer', 'Avoid', 'Accept'];
const MOCK_OWNERS = ['Security Team', 'IT Operations', 'Legal & Compliance', 'C-Suite'];

/**
 * Calculates a risk rating and qualitative level based on impact and probability.
 * @param {number} impact - The impact score (1-5).
 * @param {number} probability - The probability score (1-5).
 * @returns {{score: number, level: string}} - The calculated risk score and level.
 */
const calculateRiskRating = (impact, probability) => {
  const score = impact * probability;
  let level = 'Low';
  if (score > 15) level = 'Critical';
  else if (score > 8) level = 'High';
  else if (score > 3) level = 'Medium';
  return { score, level };
};

// --- Mock Data Generation ---

/**
 * Generates a static list of mock risks for demonstration purposes.
 * @returns {Array<Object>} An array of risk objects.
 */
const generateMockRisks = () => {
  const risks = [];
  for (let i = 1; i <= 25; i++) {
    const impact = Math.floor(Math.random() * 5) + 1;
    const probability = Math.floor(Math.random() * 5) + 1;
    const { score, level } = calculateRiskRating(impact, probability);

    risks.push({
      id: `RISK-${String(i).padStart(3, '0')}`,
      title: `Risk of Unauthorized Access to System #${i}`,
      description: `Potential for unauthorized actors to gain access to critical system ${i}, leading to data breach or operational disruption.`,
      status: RISK_STATUSES[i % RISK_STATUSES.length],
      impact,
      probability,
      rating: { score, level },
      owner: MOCK_OWNERS[i % MOCK_OWNERS.length],
      category: RISK_CATEGORIES[i % RISK_CATEGORIES.length],
      createdDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      lastUpdated: new Date().toISOString(),
    });
  }
  return risks;
};

/**
 * Generates mock risk treatments (mitigation strategies).
 * @param {Array<Object>} risks - The array of risks to generate treatments for.
 * @returns {Array<Object>} An array of treatment objects.
 */
const generateMockTreatments = (risks) => {
  const treatments = [];
  risks.forEach(risk => {
    if (risk.status !== 'Accepted') {
      treatments.push({
        id: `TREAT-${risk.id.split('-')[1]}`,
        riskId: risk.id,
        strategy: TREATMENT_STRATEGIES[Math.floor(Math.random() * TREATMENT_STRATEGIES.length)],
        description: `Implement enhanced access controls and monitoring for ${risk.id}.`,
        cost: Math.floor(Math.random() * 50000) + 5000,
        status: ['Not Started', 'In Progress', 'Completed'][Math.floor(Math.random() * 3)],
      });
    }
  });
  return treatments;
};

// --- Main Hook ---

/**
 * Custom hook for fetching and managing risk management data.
 */
export const useRiskManagement = () => {
  const [risks, setRisks] = useState([]);
  const [treatments, setTreatments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    owner: '',
    rating: '',
    search: '',
  });

  // --- Data Initialization ---
  useEffect(() => {
    const loadData = () => {
      try {
        setLoading(true);
        const mockRisks = generateMockRisks();
        const mockTreatments = generateMockTreatments(mockRisks);
        
        // Simulate network delay
        setTimeout(() => {
          setRisks(mockRisks);
          setTreatments(mockTreatments);
          setLoading(false);
        }, 800);

      } catch (e) {
        console.error("Failed to load risk management data:", e);
        setError(e);
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // --- Filtering Logic ---
  const filteredRisks = useMemo(() => {
    const searchLower = filters.search.toLowerCase();
    return risks.filter(risk => {
      const matchesSearch = !filters.search ||
        risk.id.toLowerCase().includes(searchLower) ||
        risk.title.toLowerCase().includes(searchLower) ||
        risk.description.toLowerCase().includes(searchLower);

      return (
        matchesSearch &&
        (!filters.status || risk.status === filters.status) &&
        (!filters.category || risk.category === filters.category) &&
        (!filters.owner || risk.owner === filters.owner) &&
        (!filters.rating || risk.rating.level === filters.rating)
      );
    });
  }, [risks, filters]);

  // --- Metrics Calculation ---
  const metrics = useMemo(() => {
    const total = risks.length;
    const open = risks.filter(r => r.status === 'Open').length;
    const inProgress = risks.filter(r => r.status === 'In Progress').length;
    const mitigated = risks.filter(r => r.status === 'Mitigated').length;
    const byRating = risks.reduce((acc, risk) => {
      acc[risk.rating.level] = (acc[risk.rating.level] || 0) + 1;
      return acc;
    }, {});

    const avgScore = total > 0 ? risks.reduce((sum, r) => sum + r.rating.score, 0) / total : 0;

    return {
      total,
      open,
      inProgress,
      mitigated,
      byRating,
      avgScore: avgScore.toFixed(1),
    };
  }, [risks]);
  
  // --- Data Manipulation Actions ---

  const addRisk = useCallback((riskData) => {
    const impact = riskData.impact || 1;
    const probability = riskData.probability || 1;
    const newRisk = {
      ...riskData,
      id: `RISK-${String(Date.now()).slice(-4)}`,
      createdDate: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      rating: calculateRiskRating(impact, probability),
    };
    setRisks(prev => [...prev, newRisk]);
  }, []);

  const updateRisk = useCallback((riskId, updatedData) => {
    setRisks(prev =>
      prev.map(risk => {
        if (risk.id === riskId) {
          const newRisk = { ...risk, ...updatedData, lastUpdated: new Date().toISOString() };
          // Recalculate rating if impact or probability changed
          if (updatedData.impact || updatedData.probability) {
            newRisk.rating = calculateRiskRating(newRisk.impact, newRisk.probability);
          }
          return newRisk;
        }
        return risk;
      })
    );
  }, []);

  const deleteRisk = useCallback((riskId) => {
    setRisks(prev => prev.filter(risk => risk.id !== riskId));
    // Also remove related treatments
    setTreatments(prev => prev.filter(treatment => treatment.riskId !== riskId));
  }, []);

  const addTreatment = useCallback((riskId, treatmentData) => {
    const newTreatment = {
      ...treatmentData,
      id: `TREAT-${String(Date.now()).slice(-4)}`,
      riskId,
    };
    setTreatments(prev => [...prev, newTreatment]);
  }, []);
  
  const updateTreatment = useCallback((treatmentId, updatedData) => {
    setTreatments(prev => prev.map(t => t.id === treatmentId ? { ...t, ...updatedData } : t));
  }, []);


  return {
    risks,
    filteredRisks,
    treatments,
    metrics,
    loading,
    error,
    filters,
    setFilters,
    addRisk,
    updateRisk,
    deleteRisk,
    addTreatment,
    updateTreatment,
  };
};
