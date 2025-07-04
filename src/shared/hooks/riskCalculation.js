// src/hooks/riskCalculation.js
/**
 * Risk calculation utilities for threat intelligence
 */

/**
 * Calculate weighted risk score
 * @param {Object} factors - Risk factors
 * @returns {number} Weighted risk score
 */
export const calculateWeightedRiskScore = (factors) => {
  const {
    probability = 0,
    impact = 0,
    velocity = 0,
    detectability = 0,
    controllability = 0,
    weights = {
      probability: 0.25,
      impact: 0.35,
      velocity: 0.15,
      detectability: 0.15,
      controllability: 0.10
    }
  } = factors;

  const weightedScore = 
    (probability * weights.probability) +
    (impact * weights.impact) +
    (velocity * weights.velocity) +
    (detectability * weights.detectability) +
    (controllability * weights.controllability);

  return Math.min(Math.max(weightedScore, 0), 10);
};

/**
 * Calculate Annual Loss Expectancy (ALE)
 * @param {Object} params - ALE parameters
 * @returns {number} Annual Loss Expectancy
 */
export const calculateALE = (params) => {
  const {
    assetValue = 0,
    exposureFactor = 0,
    annualRateOfOccurrence = 0
  } = params;

  const singleLossExpectancy = assetValue * exposureFactor;
  return singleLossExpectancy * annualRateOfOccurrence;
};

/**
 * Calculate CVSS-based risk score
 * @param {number} cvssScore - CVSS score (0-10)
 * @param {Object} modifiers - Risk modifiers
 * @returns {number} Modified risk score
 */
export const calculateCVSSRisk = (cvssScore, modifiers = {}) => {
  const {
    exploitability = 1,
    businessCriticality = 1,
    environmentalModifier = 1
  } = modifiers;

  return Math.min(
    cvssScore * exploitability * businessCriticality * environmentalModifier,
    10
  );
};

/**
 * Calculate composite risk score from multiple factors
 * @param {Array} riskFactors - Array of risk factor objects
 * @returns {Object} Composite risk assessment
 */
export const calculateCompositeRisk = (riskFactors) => {
  if (!riskFactors || riskFactors.length === 0) {
    return { score: 0, level: 'unknown', factors: [] };
  }

  const totalWeight = riskFactors.reduce((sum, factor) => sum + (factor.weight || 1), 0);
  const weightedSum = riskFactors.reduce((sum, factor) => {
    return sum + (factor.score * (factor.weight || 1));
  }, 0);

  const compositeScore = weightedSum / totalWeight;

  let riskLevel;
  if (compositeScore >= 8.5) riskLevel = 'critical';
  else if (compositeScore >= 7) riskLevel = 'high';
  else if (compositeScore >= 4) riskLevel = 'medium';
  else if (compositeScore >= 2) riskLevel = 'low';
  else riskLevel = 'minimal';

  return {
    score: compositeScore,
    level: riskLevel,
    factors: riskFactors,
    confidence: calculateConfidence(riskFactors)
  };
};

/**
 * Calculate confidence level based on data quality
 * @param {Array} factors - Risk factors with quality indicators
 * @returns {number} Confidence percentage (0-100)
 */
const calculateConfidence = (factors) => {
  if (!factors || factors.length === 0) return 0;

  const avgQuality = factors.reduce((sum, factor) => {
    return sum + (factor.dataQuality || 50);
  }, 0) / factors.length;

  const completeness = factors.filter(f => f.score !== undefined).length / factors.length;
  
  return Math.min(avgQuality * completeness, 100);
};