import { useState, useEffect, useMemo } from 'react';

/**
 * useEvidenceScoring Hook
 * 
 * A sophisticated hook that simulates ML-driven evidence quality scoring
 * across multiple dimensions. It evaluates evidence quality, provides
 * improvement suggestions, and offers predictive analysis.
 * 
 * @param {Object} selectedEvidence - The evidence item to score
 * @param {Array} otherEvidence - Other evidence items for context and comparison
 * @param {Object} requirements - Requirements mapped by ID for relevance assessment
 * @returns {Object} Scoring data, suggestions, predictions, and improvement actions
 */
const useEvidenceScoring = (selectedEvidence, otherEvidence = [], requirements = {}) => {
  const [scores, setScores] = useState({
    overall: 0,
    rating: 'poor',
    dimensions: {
      completeness: 0,
      consistency: 0,
      recency: 0,
      relevance: 0,
      reliability: 0,
      verifiability: 0
    }
  });
  
  const [suggestions, setSuggestions] = useState([]);
  
  const [predictions, setPredictions] = useState({
    decayRate: 0,
    nextMonthScore: 0,
    threeMonthScore: 0,
    sixMonthScore: 0,
    timeToThreshold: {
      poor: null,
      critical: null
    }
  });
  
  // Calculate scores when evidence changes
  useEffect(() => {
    if (!selectedEvidence) {
      return;
    }
    
    // Calculate dimension scores
    const dimensionScores = calculateDimensionScores(selectedEvidence, otherEvidence, requirements);
    
    // Calculate overall score (weighted average)
    const weights = getEvidenceTypeWeights(selectedEvidence.type);
    const weightedSum = Object.keys(dimensionScores).reduce(
      (sum, dimension) => sum + dimensionScores[dimension] * weights[dimension],
      0
    );
    const weightSum = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
    const overallScore = Math.round(weightedSum / weightSum);
    
    // Determine rating
    let rating;
    if (overallScore >= 90) rating = 'excellent';
    else if (overallScore >= 75) rating = 'good';
    else if (overallScore >= 60) rating = 'adequate';
    else if (overallScore >= 40) rating = 'poor';
    else rating = 'critical';
    
    setScores({
      overall: overallScore,
      rating,
      dimensions: dimensionScores
    });
    
    // Generate improvement suggestions
    const newSuggestions = generateSuggestions(dimensionScores, selectedEvidence);
    setSuggestions(newSuggestions);
    
    // Calculate decay predictions
    const decayPredictions = calculateDecayPredictions(overallScore, selectedEvidence);
    setPredictions(decayPredictions);
    
  }, [selectedEvidence, otherEvidence, requirements]);
  
  /**
   * Calculate scores for each dimension based on evidence attributes
   */
  const calculateDimensionScores = (evidence, otherEvidence, requirements) => {
    if (!evidence) {
      return {
        completeness: 0,
        consistency: 0,
        recency: 0,
        relevance: 0,
        reliability: 0,
        verifiability: 0
      };
    }
    
    // Initialize scores object
    const scores = {};
    
    // Completeness: Based on content, metadata, and attachments
    scores.completeness = calculateCompletenessScore(evidence);
    
    // Consistency: Compare with other related evidence
    scores.consistency = calculateConsistencyScore(evidence, otherEvidence);
    
    // Recency: Based on timestamp and evidence type
    scores.recency = calculateRecencyScore(evidence);
    
    // Relevance: How well it addresses requirements
    scores.relevance = calculateRelevanceScore(evidence, requirements);
    
    // Reliability: Based on source, methodology, and type
    scores.reliability = calculateReliabilityScore(evidence);
    
    // Verifiability: How easily it can be verified
    scores.verifiability = calculateVerifiabilityScore(evidence);
    
    return scores;
  };
  
  /**
   * Calculate completeness score based on evidence content and structure
   */
  const calculateCompletenessScore = (evidence) => {
    let score = 70; // Base score
    
    // Check for key attributes based on evidence type
    if (evidence.type === 'Intent') {
      // Policy/intent documents should have scope, purpose, policy text
      if (evidence.content?.scope) score += 5;
      if (evidence.content?.purpose) score += 5;
      if (evidence.content?.policy) score += 10;
      if (evidence.content?.responsibilities) score += 5;
      if (evidence.content?.approval) score += 5;
    } 
    else if (evidence.type === 'Implementation') {
      // Implementation evidence should have implementation details and testing
      if (evidence.content?.description) score += 5;
      if (evidence.content?.implementationSteps && 
          evidence.content.implementationSteps.length > 0) score += 10;
      if (evidence.content?.testResults) score += 15;
      if (evidence.attachments && evidence.attachments.length > 0) score += 10;
    }
    else if (evidence.type === 'Behavioral') {
      // Behavioral evidence should have observations and metrics
      if (evidence.content?.observations && 
          evidence.content.observations.length > 0) score += 10;
      if (evidence.content?.metrics) score += 15;
      if (evidence.content?.duration) score += 5;
      if (evidence.content?.sampleSize) score += 10;
    }
    else if (evidence.type === 'Validation') {
      // Validation evidence should have methodology, findings, conclusion
      if (evidence.content?.methodology) score += 10;
      if (evidence.content?.findings && 
          evidence.content.findings.length > 0) score += 15;
      if (evidence.content?.conclusion) score += 10;
      if (evidence.content?.recommendations) score += 5;
    }
    
    // Penalize if description is missing or too short
    if (!evidence.description || evidence.description.length < 10) {
      score -= 10;
    }
    
    // Adjust based on metadata completeness
    if (evidence.metadata) {
      const metadataKeys = Object.keys(evidence.metadata);
      score += Math.min(10, metadataKeys.length * 2);
    }
    
    return Math.min(100, Math.max(0, score));
  };
  
  /**
   * Calculate consistency score by comparing with other evidence
   */
  const calculateConsistencyScore = (evidence, otherEvidence) => {
    if (!otherEvidence || otherEvidence.length === 0) {
      return 75; // Default score when no comparison is possible
    }
    
    let score = 80; // Base score
    
    // Find related evidence (same capability or control)
    const relatedEvidence = otherEvidence.filter(item => {
      // Check if they share relationships
      if (!evidence.relationships || !item.relationships) return false;
      
      const evidenceRelations = evidence.relationships.map(r => r.label);
      const itemRelations = item.relationships.map(r => r.label);
      
      return evidenceRelations.some(rel => itemRelations.includes(rel));
    });
    
    if (relatedEvidence.length === 0) {
      return 70; // No related evidence found
    }
    
    // Check for contradictions or support
    let contradictions = 0;
    let supportingItems = 0;
    
    relatedEvidence.forEach(item => {
      // Simple simulation of contradiction detection
      // In a real ML system, this would use NLP to detect semantic contradictions
      if (item.type === 'Validation' && evidence.type === 'Implementation') {
        // Validation evidence might contradict implementation claims
        const randomFactor = item.id.charCodeAt(0) % 10; // Deterministic "random" factor
        if (randomFactor < 3) {
          contradictions++;
        } else {
          supportingItems++;
        }
      } 
      else if (item.type === evidence.type) {
        // Same type evidence should be consistent
        const randomFactor = (item.id.charCodeAt(0) + evidence.id.charCodeAt(0)) % 10;
        if (randomFactor < 1) {
          contradictions++;
        } else {
          supportingItems++;
        }
      }
      else {
        // Different evidence types should complement each other
        supportingItems += 0.5;
      }
    });
    
    // Adjust score based on contradictions and support
    score -= contradictions * 15;
    score += supportingItems * 5;
    
    return Math.min(100, Math.max(0, score));
  };
  
  /**
   * Calculate recency score based on timestamp and evidence type
   */
  const calculateRecencyScore = (evidence) => {
    if (!evidence.timestamp) {
      return 30; // Poor score if no timestamp
    }
    
    const now = new Date();
    const evidenceDate = new Date(evidence.timestamp);
    const ageInDays = Math.max(0, (now - evidenceDate) / (1000 * 60 * 60 * 24));
    
    // Different recency thresholds based on evidence type
    let score;
    switch (evidence.type) {
      case 'Intent':
        // Policy documents can be valid for longer
        if (ageInDays < 180) score = 100; // 6 months
        else if (ageInDays < 365) score = 80; // 1 year
        else if (ageInDays < 730) score = 60; // 2 years
        else if (ageInDays < 1095) score = 40; // 3 years
        else score = 20;
        break;
        
      case 'Implementation':
        // Implementation evidence should be updated periodically
        if (ageInDays < 90) score = 100; // 3 months
        else if (ageInDays < 180) score = 80; // 6 months
        else if (ageInDays < 365) score = 60; // 1 year
        else if (ageInDays < 730) score = 30; // 2 years
        else score = 10;
        break;
        
      case 'Behavioral':
        // Runtime/behavioral evidence should be very recent
        if (ageInDays < 30) score = 100; // 1 month
        else if (ageInDays < 90) score = 75; // 3 months
        else if (ageInDays < 180) score = 50; // 6 months
        else if (ageInDays < 365) score = 25; // 1 year
        else score = 5;
        break;
        
      case 'Validation':
        // Validation should be recent but not as critical as behavioral
        if (ageInDays < 60) score = 100; // 2 months
        else if (ageInDays < 180) score = 80; // 6 months
        else if (ageInDays < 365) score = 60; // 1 year
        else if (ageInDays < 730) score = 30; // 2 years
        else score = 10;
        break;
        
      default:
        // Default recency scoring
        if (ageInDays < 90) score = 100;
        else if (ageInDays < 180) score = 75;
        else if (ageInDays < 365) score = 50;
        else if (ageInDays < 730) score = 25;
        else score = 10;
    }
    
    return score;
  };
  
  /**
   * Calculate relevance score based on how well evidence addresses requirements
   */
  const calculateRelevanceScore = (evidence, requirements) => {
    if (!evidence.relationships || evidence.relationships.length === 0) {
      return 40; // Poor score if no relationships defined
    }
    
    let score = 60; // Base score
    
    // Check if evidence is linked to requirements
    const linkedRequirements = evidence.relationships.filter(rel => 
      rel.type === 'requirement' || rel.type === 'framework'
    );
    
    if (linkedRequirements.length === 0) {
      return 50; // Below average if not linked to any requirements
    }
    
    // More links to requirements = higher score
    score += Math.min(20, linkedRequirements.length * 5);
    
    // Check if evidence is linked to controls
    const linkedControls = evidence.relationships.filter(rel => 
      rel.type === 'control' || rel.type === 'capability'
    );
    
    if (linkedControls.length > 0) {
      score += Math.min(10, linkedControls.length * 3);
    }
    
    // Check if evidence addresses risks
    const linkedRisks = evidence.relationships.filter(rel => 
      rel.type === 'risk' || rel.type === 'threat'
    );
    
    if (linkedRisks.length > 0) {
      score += Math.min(10, linkedRisks.length * 3);
    }
    
    // Evaluate relationship strength if available
    const strongRelationships = evidence.relationships.filter(rel => 
      rel.strength === 'strong'
    );
    
    if (strongRelationships.length > 0) {
      score += Math.min(10, strongRelationships.length * 2);
    }
    
    return Math.min(100, score);
  };
  
  /**
   * Calculate reliability score based on evidence source and methodology
   */
  const calculateReliabilityScore = (evidence) => {
    let score = 70; // Base score
    
    // Adjust based on evidence type
    switch (evidence.type) {
      case 'Intent':
        // Policy reliability depends on approval and governance
        if (evidence.metadata?.approvedBy) score += 10;
        if (evidence.content?.approval) score += 5;
        if (evidence.metadata?.version) score += 5;
        break;
        
      case 'Implementation':
        // Implementation reliability depends on testing and verification
        if (evidence.content?.testResults) {
          const testResults = evidence.content.testResults;
          const passCount = Object.values(testResults).filter(result => result === 'Pass').length;
          const totalTests = Object.values(testResults).length;
          
          if (totalTests > 0) {
            score += (passCount / totalTests) * 20;
          }
        }
        if (evidence.metadata?.implementedBy) score += 5;
        break;
        
      case 'Behavioral':
        // Behavioral evidence reliability depends on collection method and sample size
        if (evidence.metadata?.collectionMethod === 'automated') score += 15;
        if (evidence.metadata?.source) score += 5;
        
        if (evidence.content?.sampleSize) {
          const sampleSize = evidence.content.sampleSize;
          if (sampleSize > 10000) score += 15;
          else if (sampleSize > 1000) score += 10;
          else if (sampleSize > 100) score += 5;
        }
        
        if (evidence.content?.duration) {
          const duration = evidence.content.duration;
          if (duration > 90) score += 10; // 3+ months
          else if (duration > 30) score += 5; // 1+ month
        }
        break;
        
      case 'Validation':
        // Validation reliability depends on assessor independence and methodology
        if (evidence.metadata?.independent === true) score += 15;
        if (evidence.metadata?.assessor && 
            evidence.metadata.assessor.includes('External')) score += 10;
        if (evidence.content?.methodology) score += 10;
        break;
        
      default:
        // No adjustment for unknown types
        break;
    }
    
    // Check for attachments that support reliability
    if (evidence.attachments && evidence.attachments.length > 0) {
      // More attachments = more supporting evidence
      score += Math.min(10, evidence.attachments.length * 3);
    }
    
    return Math.min(100, Math.max(0, score));
  };
  
  /**
   * Calculate verifiability score based on how easily evidence can be verified
   */
  const calculateVerifiabilityScore = (evidence) => {
    let score = 65; // Base score
    
    // Different verifiability criteria based on evidence type
    switch (evidence.type) {
      case 'Intent':
        // Policy verifiability depends on documentation and references
        if (evidence.content?.policy) score += 10;
        if (evidence.metadata?.documentId) score += 10;
        if (evidence.metadata?.version) score += 5;
        if (evidence.attachments && evidence.attachments.length > 0) {
          const policyDocs = evidence.attachments.filter(a => 
            a.type === 'document' || a.type === 'policy'
          );
          score += Math.min(10, policyDocs.length * 5);
        }
        break;
        
      case 'Implementation':
        // Implementation verifiability depends on configuration evidence
        if (evidence.content?.implementationSteps && 
            evidence.content.implementationSteps.length > 2) score += 10;
        if (evidence.attachments && evidence.attachments.length > 0) {
          const configDocs = evidence.attachments.filter(a => 
            a.type === 'config' || a.type === 'screenshot'
          );
          score += Math.min(15, configDocs.length * 5);
        }
        if (evidence.content?.testResults) score += 10;
        break;
        
      case 'Behavioral':
        // Behavioral verifiability depends on data and logs
        if (evidence.attachments && evidence.attachments.length > 0) {
          const dataDocs = evidence.attachments.filter(a => 
            a.type === 'data' || a.type === 'log'
          );
          score += Math.min(20, dataDocs.length * 7);
        }
        if (evidence.content?.metrics && Object.keys(evidence.content.metrics).length > 0) {
          score += Math.min(15, Object.keys(evidence.content.metrics).length * 3);
        }
        if (evidence.metadata?.source) score += 5;
        break;
        
      case 'Validation':
        // Validation verifiability depends on findings and methodology
        if (evidence.content?.methodology) score += 10;
        if (evidence.content?.findings && evidence.content.findings.length > 0) {
          score += Math.min(15, evidence.content.findings.length * 3);
        }
        if (evidence.attachments && evidence.attachments.length > 0) {
          const reportDocs = evidence.attachments.filter(a => 
            a.type === 'report' || a.type === 'assessment'
          );
          score += Math.min(15, reportDocs.length * 5);
        }
        break;
        
      default:
        // No adjustment for unknown types
        break;
    }
    
    return Math.min(100, Math.max(0, score));
  };
  
  /**
   * Get dimension weights based on evidence type
   */
  const getEvidenceTypeWeights = (evidenceType) => {
    switch (evidenceType) {
      case 'Intent':
        return {
          completeness: 0.25,
          consistency: 0.15,
          recency: 0.15,
          relevance: 0.20,
          reliability: 0.15,
          verifiability: 0.10
        };
        
      case 'Implementation':
        return {
          completeness: 0.20,
          consistency: 0.15,
          recency: 0.15,
          relevance: 0.15,
          reliability: 0.15,
          verifiability: 0.20
        };
        
      case 'Behavioral':
        return {
          completeness: 0.15,
          consistency: 0.10,
          recency: 0.25,
          relevance: 0.15,
          reliability: 0.20,
          verifiability: 0.15
        };
        
      case 'Validation':
        return {
          completeness: 0.15,
          consistency: 0.20,
          recency: 0.15,
          relevance: 0.15,
          reliability: 0.20,
          verifiability: 0.15
        };
        
      default:
        return {
          completeness: 0.17,
          consistency: 0.17,
          recency: 0.17,
          relevance: 0.17,
          reliability: 0.17,
          verifiability: 0.15
        };
    }
  };
  
  /**
   * Generate improvement suggestions based on dimension scores
   */
  const generateSuggestions = (dimensionScores, evidence) => {
    if (!evidence) return [];
    
    const suggestions = [];
    
    // Check each dimension and add suggestions for low scores
    if (dimensionScores.completeness < 60) {
      let suggestion = {
        dimension: 'completeness',
        priority: dimensionScores.completeness < 40 ? 'high' : 'medium',
        suggestion: ''
      };
      
      if (evidence.type === 'Intent') {
        suggestion.suggestion = 'Add more detail to the policy document, including scope, purpose, and responsibilities.';
      } else if (evidence.type === 'Implementation') {
        suggestion.suggestion = 'Include implementation steps, test results, and configuration details.';
      } else if (evidence.type === 'Behavioral') {
        suggestion.suggestion = 'Add more metrics and observations about system behavior over time.';
      } else if (evidence.type === 'Validation') {
        suggestion.suggestion = 'Include detailed methodology, findings, and recommendations in the validation report.';
      } else {
        suggestion.suggestion = 'Add more details and supporting information to make this evidence more complete.';
      }
      
      suggestions.push(suggestion);
    }
    
    if (dimensionScores.consistency < 60) {
      suggestions.push({
        dimension: 'consistency',
        priority: dimensionScores.consistency < 40 ? 'high' : 'medium',
        suggestion: 'Ensure this evidence aligns with other related evidence. There may be contradictions or gaps.'
      });
    }
    
    if (dimensionScores.recency < 60) {
      let suggestion = {
        dimension: 'recency',
        priority: dimensionScores.recency < 40 ? 'high' : 'medium',
        suggestion: ''
      };
      
      if (evidence.type === 'Intent') {
        suggestion.suggestion = 'This policy document is becoming outdated. Consider reviewing and updating it.';
      } else if (evidence.type === 'Implementation') {
        suggestion.suggestion = 'Implementation evidence is aging. Verify it still reflects the current state and update if needed.';
      } else if (evidence.type === 'Behavioral') {
        suggestion.suggestion = 'Behavioral evidence is too old. Collect fresh runtime data to ensure it represents current system behavior.';
      } else if (evidence.type === 'Validation') {
        suggestion.suggestion = 'Validation results are outdated. Perform a new validation assessment.';
      } else {
        suggestion.suggestion = 'This evidence is becoming outdated. Consider refreshing it with current information.';
      }
      
      suggestions.push(suggestion);
    }
    
    if (dimensionScores.relevance < 60) {
      suggestions.push({
        dimension: 'relevance',
        priority: dimensionScores.relevance < 40 ? 'high' : 'medium',
        suggestion: 'Link this evidence to specific requirements, controls, or risks to improve its relevance.'
      });
    }
    
    if (dimensionScores.reliability < 60) {
      let suggestion = {
        dimension: 'reliability',
        priority: dimensionScores.reliability < 40 ? 'high' : 'medium',
        suggestion: ''
      };
      
      if (evidence.type === 'Intent') {
        suggestion.suggestion = 'Improve reliability by adding formal approval information and governance details.';
      } else if (evidence.type === 'Implementation') {
        suggestion.suggestion = 'Add test results and verification details to improve implementation reliability.';
      } else if (evidence.type === 'Behavioral') {
        suggestion.suggestion = 'Increase sample size or collection duration to improve behavioral evidence reliability.';
      } else if (evidence.type === 'Validation') {
        suggestion.suggestion = 'Consider using independent assessors and documenting methodology to improve validation reliability.';
      } else {
        suggestion.suggestion = 'Improve the reliability of this evidence by adding more information about its source and methodology.';
      }
      
      suggestions.push(suggestion);
    }
    
    if (dimensionScores.verifiability < 60) {
      let suggestion = {
        dimension: 'verifiability',
        priority: dimensionScores.verifiability < 40 ? 'high' : 'medium',
        suggestion: ''
      };
      
      if (evidence.type === 'Intent') {
        suggestion.suggestion = 'Add document references and version information to make the policy more verifiable.';
      } else if (evidence.type === 'Implementation') {
        suggestion.suggestion = 'Include configuration files, screenshots, or logs that demonstrate the implementation.';
      } else if (evidence.type === 'Behavioral') {
        suggestion.suggestion = 'Attach raw data or logs that can be independently verified.';
      } else if (evidence.type === 'Validation') {
        suggestion.suggestion = 'Include detailed findings and testing methodology to make validation results verifiable.';
      } else {
        suggestion.suggestion = 'Add supporting documents or data that would allow independent verification of this evidence.';
      }
      
      suggestions.push(suggestion);
    }
    
    // Sort suggestions by priority (high first)
    return suggestions.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  };
  
  /**
   * Calculate decay predictions based on evidence type and current score
   */
  const calculateDecayPredictions = (currentScore, evidence) => {
    if (!evidence) {
      return {
        decayRate: 0,
        nextMonthScore: currentScore,
        threeMonthScore: currentScore,
        sixMonthScore: currentScore,
        timeToThreshold: {
          poor: null,
          critical: null
        }
      };
    }
    
    // Different decay rates based on evidence type (% per month)
    let monthlyDecayRate;
    switch (evidence.type) {
      case 'Intent':
        monthlyDecayRate = 0.5; // 0.5% per month
        break;
      case 'Implementation':
        monthlyDecayRate = 1.0; // 1% per month
        break;
      case 'Behavioral':
        monthlyDecayRate = 3.0; // 3% per month
        break;
      case 'Validation':
        monthlyDecayRate = 1.5; // 1.5% per month
        break;
      default:
        monthlyDecayRate = 1.0; // Default 1% per month
    }
    
    // Adjust decay rate based on current status
    if (evidence.status === 'fresh') {
      // Fresh evidence decays slower initially
      monthlyDecayRate *= 0.8;
    } else if (evidence.status === 'aging') {
      // Aging evidence decays at normal rate
      monthlyDecayRate *= 1.0;
    } else if (evidence.status === 'stale') {
      // Stale evidence decays faster
      monthlyDecayRate *= 1.2;
    }
    
    // Calculate future scores
    const nextMonthScore = Math.max(0, Math.round(currentScore * (1 - (monthlyDecayRate / 100))));
    const threeMonthScore = Math.max(0, Math.round(currentScore * Math.pow(1 - (monthlyDecayRate / 100), 3)));
    const sixMonthScore = Math.max(0, Math.round(currentScore * Math.pow(1 - (monthlyDecayRate / 100), 6)));
    
    // Calculate time to threshold (in months)
    // When will score drop below 60 (poor) or 40 (critical)?
    let monthsToPoor = null;
    let monthsToCritical = null;
    
    if (currentScore > 60) {
      monthsToPoor = Math.ceil(
        Math.log(60 / currentScore) / Math.log(1 - (monthlyDecayRate / 100))
      );
    }
    
    if (currentScore > 40) {
      monthsToCritical = Math.ceil(
        Math.log(40 / currentScore) / Math.log(1 - (monthlyDecayRate / 100))
      );
    }
    
    return {
      decayRate: monthlyDecayRate.toFixed(1),
      nextMonthScore,
      threeMonthScore,
      sixMonthScore,
      timeToThreshold: {
        poor: monthsToPoor,
        critical: monthsToCritical
      }
    };
  };
  
  /**
   * Get improvement actions for specific dimensions
   */
  const getImprovementActions = (dimensionScores, evidenceType) => {
    const actions = [];
    
    // Add actions for the lowest scoring dimensions
    const dimensions = Object.entries(dimensionScores)
      .sort(([, scoreA], [, scoreB]) => scoreA - scoreB)
      .slice(0, 3) // Focus on the 3 lowest scores
      .map(([dimension]) => dimension);
    
    // Completeness actions
    if (dimensions.includes('completeness')) {
      if (evidenceType === 'Intent') {
        actions.push({
          description: 'Enhance policy document with missing sections',
          impact: 'High impact on completeness',
          effort: 'Medium',
          dimensions: ['completeness', 'verifiability']
        });
      } else if (evidenceType === 'Implementation') {
        actions.push({
          description: 'Document implementation steps and add test results',
          impact: 'High impact on completeness',
          effort: 'Medium',
          dimensions: ['completeness', 'verifiability', 'reliability']
        });
      } else if (evidenceType === 'Behavioral') {
        actions.push({
          description: 'Collect additional metrics and increase observation period',
          impact: 'High impact on completeness and reliability',
          effort: 'High',
          dimensions: ['completeness', 'reliability']
        });
      } else if (evidenceType === 'Validation') {
        actions.push({
          description: 'Expand validation scope and document findings in detail',
          impact: 'High impact on completeness',
          effort: 'High',
          dimensions: ['completeness', 'verifiability']
        });
      }
    }
    
    // Recency actions
    if (dimensions.includes('recency')) {
      actions.push({
        description: 'Refresh evidence with current information',
        impact: 'Immediate improvement in recency score',
        effort: evidenceType === 'Behavioral' ? 'Medium' : 'High',
        dimensions: ['recency']
      });
    }
    
    // Relevance actions
    if (dimensions.includes('relevance')) {
      actions.push({
        description: 'Link evidence to specific requirements and controls',
        impact: 'Direct improvement to relevance score',
        effort: 'Low',
        dimensions: ['relevance', 'consistency']
      });
    }
    
    // Reliability actions
    if (dimensions.includes('reliability')) {
      if (evidenceType === 'Intent') {
        actions.push({
          description: 'Add formal approval and governance information',
          impact: 'Significant reliability improvement',
          effort: 'Low',
          dimensions: ['reliability', 'verifiability']
        });
      } else if (evidenceType === 'Implementation') {
        actions.push({
          description: 'Add verification steps and implementation details',
          impact: 'Major reliability improvement',
          effort: 'Medium',
          dimensions: ['reliability', 'verifiability']
        });
      } else if (evidenceType === 'Behavioral') {
        actions.push({
          description: 'Increase sample size and use automated collection',
          impact: 'Substantial reliability improvement',
          effort: 'Medium',
          dimensions: ['reliability', 'completeness']
        });
      } else if (evidenceType === 'Validation') {
        actions.push({
          description: 'Use independent assessors and document methodology',
          impact: 'Major reliability improvement',
          effort: 'High',
          dimensions: ['reliability', 'verifiability']
        });
      }
    }
    
    // Verifiability actions
    if (dimensions.includes('verifiability')) {
      actions.push({
        description: 'Add supporting documentation and raw data',
        impact: 'Direct improvement to verifiability',
        effort: 'Medium',
        dimensions: ['verifiability', 'reliability']
      });
    }
    
    // Consistency actions
    if (dimensions.includes('consistency')) {
      actions.push({
        description: 'Review related evidence and resolve contradictions',
        impact: 'Improves consistency across evidence portfolio',
        effort: 'High',
        dimensions: ['consistency', 'reliability']
      });
    }
    
    // Add general improvement actions if we have few specific ones
    if (actions.length < 3) {
      actions.push({
        description: 'Conduct a comprehensive evidence review',
        impact: 'Holistic improvement across all dimensions',
        effort: 'High',
        dimensions: ['completeness', 'consistency', 'reliability', 'verifiability']
      });
    }
    
    return actions;
  };
  
  // Return the scoring data, suggestions, and functions
  return {
    scores,
    suggestions,
    predictions,
    getImprovementActions
  };
};

export default useEvidenceScoring;
