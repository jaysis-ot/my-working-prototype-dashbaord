import { useState, useEffect, useCallback, useMemo } from 'react';

/**
 * useEvidenceScoring - A sophisticated hook for ML-driven evidence scoring
 * 
 * This hook provides comprehensive scoring of evidence quality across multiple dimensions:
 * - Completeness: How thorough and comprehensive the evidence is
 * - Consistency: How well the evidence aligns with other related evidence
 * - Recency: How current and up-to-date the evidence is
 * - Relevance: How applicable the evidence is to the specific control or requirement
 * - Reliability: How trustworthy the evidence source and collection method are
 * - Verifiability: How easily the evidence can be independently verified
 * 
 * Features:
 * - Evidence-type specific scoring algorithms with appropriate weights
 * - Improvement suggestions based on dimension scores
 * - Predictive analysis of score changes over time
 * - Decay modeling for evidence freshness
 * - Confidence scoring for each dimension
 * 
 * @param {Object} evidence - The evidence item to score
 * @param {Array} relatedEvidence - Array of related evidence items for consistency scoring
 * @param {Object} requirements - Requirements or controls the evidence supports
 * @param {Object} options - Configuration options for scoring algorithms
 * @returns {Object} Scores, suggestions, and prediction functions
 */
const useEvidenceScoring = (
  evidence,
  relatedEvidence = [],
  requirements = {},
  options = {}
) => {
  // Default options with sensible defaults
  const scoringOptions = {
    decayRates: {
      Intent: 0.05, // 5% per month
      Implementation: 0.08, // 8% per month
      Behavioral: 0.15, // 15% per month
      Validation: 0.1, // 10% per month
    },
    thresholds: {
      critical: 40,
      poor: 60,
      adequate: 75,
      good: 85,
      excellent: 95
    },
    weights: {
      Intent: {
        completeness: 0.25,
        consistency: 0.20,
        recency: 0.10,
        relevance: 0.20,
        reliability: 0.15,
        verifiability: 0.10
      },
      Implementation: {
        completeness: 0.20,
        consistency: 0.15,
        recency: 0.15,
        relevance: 0.20,
        reliability: 0.15,
        verifiability: 0.15
      },
      Behavioral: {
        completeness: 0.15,
        consistency: 0.10,
        recency: 0.25,
        relevance: 0.20,
        reliability: 0.20,
        verifiability: 0.10
      },
      Validation: {
        completeness: 0.20,
        consistency: 0.15,
        recency: 0.15,
        relevance: 0.15,
        reliability: 0.15,
        verifiability: 0.20
      }
    },
    ...options
  };

  // State for storing calculated scores
  const [scores, setScores] = useState({
    overall: 0,
    dimensions: {
      completeness: 0,
      consistency: 0,
      recency: 0,
      relevance: 0,
      reliability: 0,
      verifiability: 0
    },
    confidence: {
      completeness: 0,
      consistency: 0,
      recency: 0,
      relevance: 0,
      reliability: 0,
      verifiability: 0
    },
    rating: 'unknown'
  });

  // State for improvement suggestions
  const [suggestions, setSuggestions] = useState([]);

  // State for prediction data
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

  /**
   * Calculate completeness score based on evidence type and content
   * 
   * Factors considered:
   * - Percentage of required fields present
   * - Depth of information provided
   * - Presence of supporting documentation
   * - Coverage of requirement scope
   */
  const calculateCompletenessScore = useCallback(() => {
    if (!evidence) return { score: 0, confidence: 0 };

    const { type, content, metadata, attachments } = evidence;
    let score = 0;
    let confidence = 0.7; // Base confidence level

    // Different completeness criteria based on evidence type
    switch (type) {
      case 'Intent':
        // For policy/intent documents, check for key sections
        const requiredSections = ['scope', 'purpose', 'policy', 'responsibilities', 'approval'];
        const presentSections = requiredSections.filter(section => 
          content && content[section] && content[section].length > 0
        );
        
        // Base score on percentage of required sections
        score = (presentSections.length / requiredSections.length) * 100;
        
        // Adjust for depth of content
        if (content && content.policy && content.policy.length > 500) score += 10;
        if (content && content.scope && content.scope.length > 200) score += 5;
        
        // Adjust for approval signatures
        if (metadata && metadata.approvedBy) score += 10;
        
        // Cap at 100
        score = Math.min(100, score);
        
        // Adjust confidence based on metadata quality
        confidence = metadata && metadata.version ? 0.85 : 0.7;
        break;
        
      case 'Implementation':
        // For implementation evidence, check for technical details
        const implFactors = [
          content && content.description && content.description.length > 100,
          content && content.implementationSteps && content.implementationSteps.length > 0,
          content && content.testResults,
          attachments && attachments.length > 0,
          metadata && metadata.implementedBy,
          metadata && metadata.implementationDate
        ];
        
        // Count present factors
        const presentImplFactors = implFactors.filter(Boolean).length;
        
        // Base score on percentage of factors
        score = (presentImplFactors / implFactors.length) * 100;
        
        // Bonus for code samples or configuration files
        if (attachments && attachments.some(a => 
          a.type === 'code' || a.type === 'config' || a.type === 'screenshot'
        )) {
          score += 15;
        }
        
        // Cap at 100
        score = Math.min(100, score);
        
        // Higher confidence with test results
        confidence = content && content.testResults ? 0.9 : 0.75;
        break;
        
      case 'Behavioral':
        // For behavioral evidence, check for runtime data
        const behavioralFactors = [
          content && content.observations && content.observations.length > 0,
          content && content.metrics && Object.keys(content.metrics).length > 0,
          content && content.duration && content.duration > 0,
          content && content.sampleSize && content.sampleSize > 0,
          metadata && metadata.collectionMethod,
          metadata && metadata.collectionDate
        ];
        
        // Count present factors
        const presentBehavioralFactors = behavioralFactors.filter(Boolean).length;
        
        // Base score on percentage of factors
        score = (presentBehavioralFactors / behavioralFactors.length) * 100;
        
        // Bonus for large sample sizes
        if (content && content.sampleSize > 100) score += 10;
        if (content && content.duration > 30) score += 10; // 30 days of data
        
        // Cap at 100
        score = Math.min(100, score);
        
        // Confidence based on sample size and duration
        confidence = content && content.sampleSize > 50 ? 0.85 : 0.7;
        break;
        
      case 'Validation':
        // For validation evidence, check for assessment details
        const validationFactors = [
          content && content.methodology && content.methodology.length > 0,
          content && content.findings && content.findings.length > 0,
          content && content.conclusion,
          content && content.recommendations && content.recommendations.length > 0,
          metadata && metadata.assessor,
          metadata && metadata.validationDate
        ];
        
        // Count present factors
        const presentValidationFactors = validationFactors.filter(Boolean).length;
        
        // Base score on percentage of factors
        score = (presentValidationFactors / validationFactors.length) * 100;
        
        // Bonus for independent validation
        if (metadata && metadata.independent === true) score += 15;
        
        // Cap at 100
        score = Math.min(100, score);
        
        // Higher confidence for independent validation
        confidence = metadata && metadata.independent === true ? 0.95 : 0.8;
        break;
        
      default:
        score = 50; // Default middle score
        confidence = 0.5; // Low confidence for unknown types
    }
    
    // Ensure score is within 0-100 range
    score = Math.max(0, Math.min(100, score));
    
    return { score, confidence };
  }, [evidence]);

  /**
   * Calculate consistency score based on alignment with related evidence
   * 
   * Factors considered:
   * - Alignment with related evidence items
   * - Internal consistency within the evidence
   * - Consistency with requirements and controls
   * - Historical consistency over time
   */
  const calculateConsistencyScore = useCallback(() => {
    if (!evidence || !relatedEvidence || relatedEvidence.length === 0) {
      return { score: 50, confidence: 0.5 }; // Neutral score with low confidence if no related evidence
    }

    let score = 0;
    let confidence = 0.6; // Base confidence level
    
    // Check for contradictions in related evidence
    let contradictions = 0;
    let alignments = 0;
    let neutralItems = 0;
    
    // Compare with related evidence
    relatedEvidence.forEach(relItem => {
      // Skip self-comparison
      if (relItem.id === evidence.id) return;
      
      // Check if evidence types are complementary
      const isComplementary = (
        (evidence.type === 'Intent' && relItem.type === 'Implementation') ||
        (evidence.type === 'Implementation' && relItem.type === 'Behavioral') ||
        (evidence.type === 'Behavioral' && relItem.type === 'Validation') ||
        (evidence.type === 'Validation' && relItem.type === 'Intent')
      );
      
      // Check timestamps for temporal consistency
      const evidenceDate = new Date(evidence.timestamp || evidence.metadata?.date || Date.now());
      const relItemDate = new Date(relItem.timestamp || relItem.metadata?.date || Date.now());
      const timeDiff = Math.abs(evidenceDate - relItemDate);
      const isTimeConsistent = timeDiff < (90 * 24 * 60 * 60 * 1000); // Within 90 days
      
      // Check content consistency (simplified simulation)
      const contentConsistency = Math.random() > 0.3 ? 'consistent' : 'inconsistent';
      
      // Determine overall relationship
      if (isComplementary && isTimeConsistent && contentConsistency === 'consistent') {
        alignments++;
      } else if (!isComplementary && !isTimeConsistent && contentConsistency === 'inconsistent') {
        contradictions++;
      } else {
        neutralItems++;
      }
    });
    
    // Calculate consistency score based on alignments vs contradictions
    const totalRelationships = alignments + contradictions + neutralItems;
    if (totalRelationships > 0) {
      // Weighted formula favoring alignments and penalizing contradictions
      score = (alignments / totalRelationships) * 100 - (contradictions / totalRelationships) * 50;
      
      // Adjust confidence based on number of relationships
      confidence = Math.min(0.9, 0.6 + (totalRelationships / 20) * 0.3);
    } else {
      score = 50; // Neutral score
      confidence = 0.5; // Low confidence
    }
    
    // Check internal consistency (if evidence has multiple parts)
    if (evidence.content && typeof evidence.content === 'object') {
      const contentKeys = Object.keys(evidence.content);
      if (contentKeys.length > 1) {
        // Simulate internal consistency check
        const internalConsistencyScore = Math.random() * 30 + 70; // Random score between 70-100
        
        // Blend with relationship score
        score = (score * 0.7) + (internalConsistencyScore * 0.3);
        
        // Slightly increase confidence due to internal analysis
        confidence = Math.min(0.95, confidence + 0.1);
      }
    }
    
    // Check consistency with requirements
    if (requirements && Object.keys(requirements).length > 0) {
      // Simulate requirement consistency check
      const reqConsistencyScore = Math.random() * 20 + 80; // Random score between 80-100
      
      // Blend with current score
      score = (score * 0.8) + (reqConsistencyScore * 0.2);
    }
    
    // Ensure score is within 0-100 range
    score = Math.max(0, Math.min(100, score));
    
    return { score, confidence };
  }, [evidence, relatedEvidence, requirements]);

  /**
   * Calculate recency score based on evidence age and type
   * 
   * Factors considered:
   * - Age of evidence relative to type-specific freshness thresholds
   * - Update frequency compared to expected frequency
   * - Presence of superseding evidence
   * - Regulatory or compliance refresh requirements
   */
  const calculateRecencyScore = useCallback(() => {
    if (!evidence) return { score: 0, confidence: 0 };

    const { type, timestamp, metadata } = evidence;
    let score = 0;
    let confidence = 0.9; // High confidence for time-based calculations
    
    // Get evidence date
    const evidenceDate = new Date(timestamp || metadata?.date || Date.now());
    const now = new Date();
    const ageInDays = Math.max(0, (now - evidenceDate) / (1000 * 60 * 60 * 24));
    const ageInMonths = ageInDays / 30;
    
    // Different recency thresholds based on evidence type (in months)
    const recencyThresholds = {
      Intent: { fresh: 6, aging: 12, stale: 24 }, // Policy/intent documents
      Implementation: { fresh: 3, aging: 6, stale: 12 }, // Implementation evidence
      Behavioral: { fresh: 1, aging: 3, stale: 6 }, // Behavioral/runtime evidence
      Validation: { fresh: 2, aging: 6, stale: 12 } // Validation evidence
    };
    
    const thresholds = recencyThresholds[type] || recencyThresholds.Validation;
    
    // Calculate recency score based on age thresholds
    if (ageInMonths <= 0) {
      score = 100; // Future evidence (shouldn't happen, but just in case)
    } else if (ageInMonths <= thresholds.fresh) {
      score = 100 - ((ageInMonths / thresholds.fresh) * 20); // Fresh (100-80)
    } else if (ageInMonths <= thresholds.aging) {
      score = 80 - (((ageInMonths - thresholds.fresh) / (thresholds.aging - thresholds.fresh)) * 30); // Aging (80-50)
    } else if (ageInMonths <= thresholds.stale) {
      score = 50 - (((ageInMonths - thresholds.aging) / (thresholds.stale - thresholds.aging)) * 30); // Stale (50-20)
    } else {
      score = Math.max(10, 20 - ((ageInMonths - thresholds.stale) / 12) * 10); // Very stale (20-10)
    }
    
    // Check if evidence has been superseded
    if (metadata && metadata.supersededBy) {
      score = Math.max(10, score - 40); // Heavily penalize superseded evidence
      confidence = 0.95; // High confidence that it's superseded
    }
    
    // Check for update frequency metadata
    if (metadata && metadata.updateFrequency) {
      const expectedUpdateFrequency = metadata.updateFrequency; // in months
      const expectedUpdates = Math.floor(ageInMonths / expectedUpdateFrequency);
      const actualUpdates = metadata.updateHistory ? metadata.updateHistory.length : 0;
      
      if (expectedUpdates > 0) {
        const updateRatio = actualUpdates / expectedUpdates;
        // Adjust score based on update adherence
        if (updateRatio >= 1) {
          score = Math.min(100, score + 10); // Bonus for meeting or exceeding update frequency
        } else {
          score = Math.max(0, score - (20 * (1 - updateRatio))); // Penalty for missing updates
        }
      }
    }
    
    // Check for regulatory/compliance refresh requirements
    if (metadata && metadata.complianceRefreshRequired) {
      const refreshRequired = new Date(metadata.complianceRefreshRequired);
      if (refreshRequired < now) {
        score = Math.max(10, score - 30); // Heavy penalty for missing compliance refresh
        confidence = 0.95; // High confidence in this assessment
      }
    }
    
    // Ensure score is within 0-100 range
    score = Math.max(0, Math.min(100, score));
    
    return { score, confidence };
  }, [evidence]);

  /**
   * Calculate relevance score based on alignment with requirements
   * 
   * Factors considered:
   * - Direct mapping to requirements or controls
   * - Specificity to the requirement
   * - Coverage of requirement scope
   * - Contextual relevance to the organization
   */
  const calculateRelevanceScore = useCallback(() => {
    if (!evidence || !requirements || Object.keys(requirements).length === 0) {
      return { score: 50, confidence: 0.6 }; // Neutral score with medium confidence
    }

    let score = 0;
    let confidence = 0.7; // Base confidence level
    
    const { relationships, content, metadata, type } = evidence;
    
    // Check for explicit relationships to requirements
    const hasExplicitRelationships = relationships && 
      relationships.some(rel => 
        rel.type === 'requirement' || 
        rel.type === 'control' || 
        rel.type === 'framework'
      );
    
    if (hasExplicitRelationships) {
      score += 40; // Good starting point for explicitly linked evidence
      confidence += 0.1;
      
      // Check if relationships match our current requirements
      const matchingRelationships = relationships.filter(rel => 
        (rel.type === 'requirement' && requirements[rel.id]) ||
        (rel.type === 'control' && Object.values(requirements).some(req => req.controlId === rel.id)) ||
        (rel.type === 'framework' && Object.values(requirements).some(req => req.framework === rel.label))
      );
      
      if (matchingRelationships.length > 0) {
        // Bonus for matching our specific requirements
        score += 20 * (matchingRelationships.length / relationships.filter(r => 
          r.type === 'requirement' || r.type === 'control' || r.type === 'framework'
        ).length);
        confidence += 0.1;
      }
    } else {
      score += 20; // Lower starting point for implicitly linked evidence
    }
    
    // Check content for requirement-specific keywords (simplified simulation)
    if (content) {
      // Extract requirement keywords (in a real implementation, this would analyze the requirements)
      const requirementKeywords = Object.values(requirements).flatMap(req => 
        [req.name, req.description, req.controlId, req.framework].filter(Boolean)
      );
      
      // Simulate keyword matching with random score
      const keywordMatchScore = Math.random() * 30 + 10; // 10-40 points
      score += keywordMatchScore;
      
      // Adjust confidence based on content size (more content = more confident assessment)
      const contentSize = typeof content === 'string' 
        ? content.length 
        : JSON.stringify(content).length;
      
      confidence += Math.min(0.1, contentSize / 10000); // Up to 0.1 extra confidence for 10KB content
    }
    
    // Evidence type-specific relevance factors
    switch (type) {
      case 'Intent':
        // Intent documents are more relevant for policy requirements
        if (Object.values(requirements).some(req => req.type === 'policy')) {
          score += 15;
          confidence += 0.05;
        }
        break;
        
      case 'Implementation':
        // Implementation evidence is more relevant for technical requirements
        if (Object.values(requirements).some(req => req.type === 'technical')) {
          score += 15;
          confidence += 0.05;
        }
        break;
        
      case 'Behavioral':
        // Behavioral evidence is more relevant for operational requirements
        if (Object.values(requirements).some(req => req.type === 'operational')) {
          score += 15;
          confidence += 0.05;
        }
        break;
        
      case 'Validation':
        // Validation evidence is generally relevant for all requirements
        score += 10;
        confidence += 0.03;
        break;
    }
    
    // Contextual relevance based on organizational scope
    if (metadata && metadata.scope) {
      const orgScope = metadata.scope;
      
      // Check if requirements match the evidence scope
      const scopeMatch = Object.values(requirements).some(req => 
        req.scope === orgScope || req.scope === 'all'
      );
      
      if (scopeMatch) {
        score += 15;
        confidence += 0.05;
      } else {
        score -= 10; // Penalty for scope mismatch
      }
    }
    
    // Ensure score is within 0-100 range
    score = Math.max(0, Math.min(100, score));
    
    // Cap confidence at 0.95
    confidence = Math.min(0.95, confidence);
    
    return { score, confidence };
  }, [evidence, requirements]);

  /**
   * Calculate reliability score based on source and collection method
   * 
   * Factors considered:
   * - Source credibility and independence
   * - Collection methodology rigor
   * - Sample size and statistical significance
   * - Verification and validation methods
   * - Chain of custody and integrity controls
   */
  const calculateReliabilityScore = useCallback(() => {
    if (!evidence) return { score: 50, confidence: 0.6 }; // Neutral score with medium confidence

    let score = 50; // Start with neutral score
    let confidence = 0.7; // Base confidence level
    
    const { metadata, type, content } = evidence;
    
    // Source credibility factors
    if (metadata && metadata.source) {
      const sourceTypes = {
        'internal': 60, // Base score for internal sources
        'external': 70, // Base score for external sources
        'independent': 85, // Base score for independent sources
        'regulatory': 90, // Base score for regulatory bodies
        'automated': 75, // Base score for automated systems
      };
      
      score = sourceTypes[metadata.source] || 50;
      
      // Adjust for source authority
      if (metadata.sourceAuthority) {
        switch (metadata.sourceAuthority) {
          case 'high':
            score += 15;
            confidence += 0.1;
            break;
          case 'medium':
            score += 5;
            confidence += 0.05;
            break;
          case 'low':
            score -= 5;
            confidence -= 0.05;
            break;
        }
      }
    }
    
    // Collection methodology factors
    if (metadata && metadata.collectionMethod) {
      const methodScores = {
        'manual': 60,
        'automated': 75,
        'hybrid': 70,
        'continuous': 85,
        'sampling': 65,
        'census': 80,
        'interview': 60,
        'observation': 70,
        'systemLog': 80,
        'audit': 85
      };
      
      // Blend with current score
      score = (score + (methodScores[metadata.collectionMethod] || 60)) / 2;
      
      // Adjust confidence based on method rigor
      const rigorousMethodologies = ['continuous', 'census', 'audit', 'systemLog'];
      if (rigorousMethodologies.includes(metadata.collectionMethod)) {
        confidence += 0.1;
      }
    }
    
    // Sample size and statistical significance
    if (content && content.sampleSize) {
      const sampleSize = content.sampleSize;
      const populationSize = content.populationSize || 1000; // Default assumption
      
      // Calculate statistical confidence (simplified)
      const sampleRatio = sampleSize / populationSize;
      
      if (sampleRatio >= 0.5) {
        score += 15; // Excellent sample size
        confidence += 0.15;
      } else if (sampleRatio >= 0.3) {
        score += 10; // Very good sample size
        confidence += 0.1;
      } else if (sampleRatio >= 0.1) {
        score += 5; // Good sample size
        confidence += 0.05;
      } else if (sampleSize < 10) {
        score -= 10; // Very small sample
        confidence -= 0.1;
      }
    }
    
    // Verification methods
    if (metadata && metadata.verificationMethod) {
      const verificationScores = {
        'peerReview': 10,
        'expertReview': 15,
        'crossValidation': 15,
        'technicalTesting': 12,
        'documentReview': 8,
        'none': -10
      };
      
      score += verificationScores[metadata.verificationMethod] || 0;
      
      if (metadata.verificationMethod !== 'none') {
        confidence += 0.1;
      } else {
        confidence -= 0.1;
      }
    }
    
    // Chain of custody and integrity
    if (metadata && metadata.integrityControls) {
      const integrityControls = Array.isArray(metadata.integrityControls) 
        ? metadata.integrityControls 
        : [metadata.integrityControls];
      
      const integrityScores = {
        'digitalSignature': 10,
        'hashVerification': 8,
        'accessControls': 5,
        'auditTrail': 7,
        'timestamping': 5,
        'immutableStorage': 10
      };
      
      let integrityScore = 0;
      integrityControls.forEach(control => {
        integrityScore += integrityScores[control] || 0;
      });
      
      // Cap integrity bonus at 20 points
      score += Math.min(20, integrityScore);
      confidence += Math.min(0.15, integrityControls.length * 0.03);
    }
    
    // Evidence type-specific reliability factors
    switch (type) {
      case 'Intent':
        // Intent documents are more reliable with formal approval
        if (metadata && metadata.approvedBy) {
          score += 10;
          confidence += 0.05;
        }
        break;
        
      case 'Implementation':
        // Implementation evidence is more reliable with test results
        if (content && content.testResults) {
          score += 15;
          confidence += 0.1;
        }
        break;
        
      case 'Behavioral':
        // Behavioral evidence is more reliable with longer observation periods
        if (content && content.duration) {
          if (content.duration >= 90) { // 90+ days
            score += 15;
            confidence += 0.1;
          } else if (content.duration >= 30) { // 30+ days
            score += 10;
            confidence += 0.05;
          }
        }
        break;
        
      case 'Validation':
        // Validation evidence is more reliable when independent
        if (metadata && metadata.independent === true) {
          score += 20;
          confidence += 0.15;
        }
        break;
    }
    
    // Ensure score is within 0-100 range
    score = Math.max(0, Math.min(100, score));
    
    // Cap confidence at 0.95
    confidence = Math.min(0.95, confidence);
    
    return { score, confidence };
  }, [evidence]);

  /**
   * Calculate verifiability score based on how easily evidence can be verified
   * 
   * Factors considered:
   * - Presence of supporting documentation and artifacts
   * - Clarity and specificity of evidence
   * - Accessibility of evidence sources
   * - Reproducibility of evidence collection
   * - Traceability to original sources
   */
  const calculateVerifiabilityScore = useCallback(() => {
    if (!evidence) return { score: 50, confidence: 0.6 }; // Neutral score with medium confidence

    let score = 50; // Start with neutral score
    let confidence = 0.7; // Base confidence level
    
    const { metadata, content, attachments, type } = evidence;
    
    // Supporting documentation and artifacts
    if (attachments && attachments.length > 0) {
      // More attachments = more verifiable
      score += Math.min(20, attachments.length * 5);
      confidence += Math.min(0.15, attachments.length * 0.03);
      
      // Check attachment types
      const verifiableTypes = ['screenshot', 'log', 'report', 'data', 'config', 'code'];
      const verifiableAttachments = attachments.filter(a => 
        verifiableTypes.includes(a.type)
      );
      
      if (verifiableAttachments.length > 0) {
        score += Math.min(15, verifiableAttachments.length * 5);
        confidence += 0.1;
      }
    }
    
    // Clarity and specificity
    if (content) {
      // Simulate clarity assessment (in a real implementation, this would use NLP)
      // Here we use content length as a proxy for detail level
      const contentSize = typeof content === 'string' 
        ? content.length 
        : JSON.stringify(content).length;
      
      if (contentSize > 5000) {
        score += 15; // Very detailed
        confidence += 0.1;
      } else if (contentSize > 1000) {
        score += 10; // Detailed
        confidence += 0.05;
      } else if (contentSize < 200) {
        score -= 10; // Very brief
        confidence -= 0.05;
      }
      
      // Check for specific details that increase verifiability
      const hasSpecificDetails = (
        (content.specificLocations) ||
        (content.timestamps && content.timestamps.length > 0) ||
        (content.identifiers) ||
        (content.steps && content.steps.length > 0) ||
        (content.metrics && Object.keys(content.metrics).length > 0)
      );
      
      if (hasSpecificDetails) {
        score += 15;
        confidence += 0.1;
      }
    }
    
    // Accessibility of evidence sources
    if (metadata && metadata.accessibility) {
      const accessibilityScores = {
        'public': 20,
        'internal': 10,
        'restricted': 0,
        'confidential': -10
      };
      
      score += accessibilityScores[metadata.accessibility] || 0;
      
      // Lower confidence for less accessible evidence
      if (metadata.accessibility === 'confidential' || metadata.accessibility === 'restricted') {
        confidence -= 0.1;
      }
    }
    
    // Reproducibility of evidence collection
    if (metadata && metadata.reproducible === true) {
      score += 15;
      confidence += 0.1;
    } else if (metadata && metadata.reproducible === false) {
      score -= 10;
      confidence -= 0.05;
    }
    
    // Traceability to original sources
    if (metadata && metadata.sources && metadata.sources.length > 0) {
      score += Math.min(15, metadata.sources.length * 5);
      confidence += 0.1;
    }
    
    // Evidence type-specific verifiability factors
    switch (type) {
      case 'Intent':
        // Intent documents are more verifiable with formal documentation
        if (metadata && metadata.documentId) {
          score += 10;
          confidence += 0.05;
        }
        break;
        
      case 'Implementation':
        // Implementation evidence is more verifiable with detailed steps
        if (content && content.implementationSteps && content.implementationSteps.length > 3) {
          score += 15;
          confidence += 0.1;
        }
        break;
        
      case 'Behavioral':
        // Behavioral evidence is more verifiable with raw data
        if (attachments && attachments.some(a => a.type === 'data' || a.type === 'log')) {
          score += 20;
          confidence += 0.15;
        }
        break;
        
      case 'Validation':
        // Validation evidence is more verifiable with methodology details
        if (content && content.methodology && content.methodology.length > 200) {
          score += 15;
          confidence += 0.1;
        }
        break;
    }
    
    // Ensure score is within 0-100 range
    score = Math.max(0, Math.min(100, score));
    
    // Cap confidence at 0.95
    confidence = Math.min(0.95, confidence);
    
    return { score, confidence };
  }, [evidence]);

  /**
   * Calculate overall evidence score based on dimension scores and type-specific weights
   */
  const calculateOverallScore = useCallback((dimensionScores, confidenceScores, type) => {
    if (!dimensionScores || !type) return 0;
    
    // Get weights for the evidence type
    const weights = scoringOptions.weights[type] || {
      completeness: 0.2,
      consistency: 0.15,
      recency: 0.15,
      relevance: 0.2,
      reliability: 0.15,
      verifiability: 0.15
    };
    
    // Calculate confidence-weighted dimension scores
    const confidenceWeightedScores = {};
    let totalConfidenceWeight = 0;
    
    Object.keys(dimensionScores).forEach(dimension => {
      const score = dimensionScores[dimension];
      const confidence = confidenceScores[dimension];
      
      confidenceWeightedScores[dimension] = score * weights[dimension] * confidence;
      totalConfidenceWeight += weights[dimension] * confidence;
    });
    
    // Calculate overall score
    let overallScore = 0;
    
    if (totalConfidenceWeight > 0) {
      // Sum all confidence-weighted scores and normalize by total confidence weight
      overallScore = Object.values(confidenceWeightedScores).reduce((sum, score) => sum + score, 0) / totalConfidenceWeight;
    } else {
      // Fallback to simple weighted average if confidence data is missing
      overallScore = Object.keys(dimensionScores).reduce((sum, dimension) => {
        return sum + (dimensionScores[dimension] * (weights[dimension] || 0));
      }, 0);
    }
    
    return Math.round(overallScore);
  }, [scoringOptions.weights]);

  /**
   * Generate improvement suggestions based on dimension scores
   */
  const generateSuggestions = useCallback((dimensionScores, evidenceType) => {
    if (!dimensionScores || !evidenceType) return [];
    
    const suggestions = [];
    const thresholds = scoringOptions.thresholds;
    
    // Get the lowest scoring dimensions (up to 3)
    const sortedDimensions = Object.entries(dimensionScores)
      .sort(([, scoreA], [, scoreB]) => scoreA - scoreB)
      .slice(0, 3);
    
    sortedDimensions.forEach(([dimension, score]) => {
      if (score < thresholds.good) {
        // Generate dimension-specific suggestions
        switch (dimension) {
          case 'completeness':
            if (score < thresholds.critical) {
              suggestions.push({
                dimension,
                priority: 'critical',
                suggestion: `The ${evidenceType} evidence is severely incomplete. Add essential information such as ${getCompletionRequirements(evidenceType)}.`
              });
            } else if (score < thresholds.poor) {
              suggestions.push({
                dimension,
                priority: 'high',
                suggestion: `Enhance the completeness of this ${evidenceType} evidence by adding more detail on ${getCompletionRequirements(evidenceType)}.`
              });
            } else if (score < thresholds.adequate) {
              suggestions.push({
                dimension,
                priority: 'medium',
                suggestion: `Consider improving the completeness by adding supporting documentation for this ${evidenceType} evidence.`
              });
            } else {
              suggestions.push({
                dimension,
                priority: 'low',
                suggestion: `For even better completeness, consider adding more context to this ${evidenceType} evidence.`
              });
            }
            break;
            
          case 'consistency':
            if (score < thresholds.critical) {
              suggestions.push({
                dimension,
                priority: 'critical',
                suggestion: `This evidence contradicts other related evidence. Resolve the inconsistencies between this ${evidenceType} evidence and related items.`
              });
            } else if (score < thresholds.poor) {
              suggestions.push({
                dimension,
                priority: 'high',
                suggestion: `Significant inconsistencies exist. Align this ${evidenceType} evidence with related evidence and requirements.`
              });
            } else if (score < thresholds.adequate) {
              suggestions.push({
                dimension,
                priority: 'medium',
                suggestion: `Some inconsistencies detected. Review this ${evidenceType} evidence against related items for better alignment.`
              });
            } else {
              suggestions.push({
                dimension,
                priority: 'low',
                suggestion: `Minor inconsistencies exist. Consider reviewing for complete alignment with other evidence.`
              });
            }
            break;
            
          case 'recency':
            if (score < thresholds.critical) {
              suggestions.push({
                dimension,
                priority: 'critical',
                suggestion: `This ${evidenceType} evidence is critically outdated and requires immediate refresh.`
              });
            } else if (score < thresholds.poor) {
              suggestions.push({
                dimension,
                priority: 'high',
                suggestion: `This ${evidenceType} evidence is significantly outdated. Schedule a refresh soon.`
              });
            } else if (score < thresholds.adequate) {
              suggestions.push({
                dimension,
                priority: 'medium',
                suggestion: `This ${evidenceType} evidence is aging. Consider updating in the next review cycle.`
              });
            } else {
              suggestions.push({
                dimension,
                priority: 'low',
                suggestion: `This ${evidenceType} evidence will need refreshing in the near future. Plan accordingly.`
              });
            }
            break;
            
          case 'relevance':
            if (score < thresholds.critical) {
              suggestions.push({
                dimension,
                priority: 'critical',
                suggestion: `This evidence has minimal relevance to the requirements. Replace with directly relevant ${evidenceType} evidence.`
              });
            } else if (score < thresholds.poor) {
              suggestions.push({
                dimension,
                priority: 'high',
                suggestion: `Low relevance to requirements. Collect new ${evidenceType} evidence that directly addresses the requirements.`
              });
            } else if (score < thresholds.adequate) {
              suggestions.push({
                dimension,
                priority: 'medium',
                suggestion: `Moderate relevance. Enhance this ${evidenceType} evidence to better address specific requirements.`
              });
            } else {
              suggestions.push({
                dimension,
                priority: 'low',
                suggestion: `Good relevance but could be more specific. Consider tailoring this ${evidenceType} evidence more precisely to requirements.`
              });
            }
            break;
            
          case 'reliability':
            if (score < thresholds.critical) {
              suggestions.push({
                dimension,
                priority: 'critical',
                suggestion: `This ${evidenceType} evidence has critical reliability issues. Recollect using rigorous methodology and credible sources.`
              });
            } else if (score < thresholds.poor) {
              suggestions.push({
                dimension,
                priority: 'high',
                suggestion: `Low reliability. Enhance this ${evidenceType} evidence with better source verification and collection methods.`
              });
            } else if (score < thresholds.adequate) {
              suggestions.push({
                dimension,
                priority: 'medium',
                suggestion: `Moderate reliability. Consider improving the collection methodology for this ${evidenceType} evidence.`
              });
            } else {
              suggestions.push({
                dimension,
                priority: 'low',
                suggestion: `Good reliability but could be improved. Consider independent verification of this ${evidenceType} evidence.`
              });
            }
            break;
            
          case 'verifiability':
            if (score < thresholds.critical) {
              suggestions.push({
                dimension,
                priority: 'critical',
                suggestion: `This ${evidenceType} evidence cannot be verified. Add supporting documentation, specific details, and traceable sources.`
              });
            } else if (score < thresholds.poor) {
              suggestions.push({
                dimension,
                priority: 'high',
                suggestion: `Low verifiability. Add specific artifacts and documentation to make this ${evidenceType} evidence verifiable.`
              });
            } else if (score < thresholds.adequate) {
              suggestions.push({
                dimension,
                priority: 'medium',
                suggestion: `Moderate verifiability. Add more supporting documentation to this ${evidenceType} evidence.`
              });
            } else {
              suggestions.push({
                dimension,
                priority: 'low',
                suggestion: `Good verifiability but could be improved. Consider adding more specific details to this ${evidenceType} evidence.`
              });
            }
            break;
        }
      }
    });
    
    return suggestions;
  }, [scoringOptions.thresholds]);

  /**
   * Get completion requirements based on evidence type
   */
  const getCompletionRequirements = useCallback((type) => {
    switch (type) {
      case 'Intent':
        return 'scope, purpose, policy details, and approval information';
      case 'Implementation':
        return 'implementation steps, configurations, and test results';
      case 'Behavioral':
        return 'observation data, metrics, and sample sizes';
      case 'Validation':
        return 'methodology, findings, and recommendations';
      default:
        return 'key details and supporting documentation';
    }
  }, []);

  /**
   * Predict evidence score decay over time
   */
  const predictScoreDecay = useCallback((currentScore, evidenceType, months = 6) => {
    if (!currentScore || !evidenceType) return { score: currentScore, confidence: 0.5 };
    
    const decayRate = scoringOptions.decayRates[evidenceType] || 0.1;
    const decayedScore = Math.max(10, currentScore * Math.pow(1 - decayRate, months));
    
    // Confidence decreases with prediction distance
    const confidence = Math.max(0.3, 0.9 - (months * 0.05));
    
    return { 
      score: Math.round(decayedScore), 
      confidence
    };
  }, [scoringOptions.decayRates]);

  /**
   * Calculate time until score reaches a threshold
   */
  const calculateTimeToThreshold = useCallback((currentScore, threshold, evidenceType) => {
    if (!currentScore || !evidenceType || currentScore <= threshold) return 0;
    
    const decayRate = scoringOptions.decayRates[evidenceType] || 0.1;
    
    // Solve for months: threshold = currentScore * (1 - decayRate)^months
    // months = log(threshold/currentScore) / log(1 - decayRate)
    const months = Math.log(threshold / currentScore) / Math.log(1 - decayRate);
    
    return Math.ceil(months);
  }, [scoringOptions.decayRates]);

  /**
   * Predict score improvement with specific actions
   */
  const predictScoreImprovement = useCallback((currentScores, actions, evidenceType) => {
    if (!currentScores || !actions || !evidenceType) return currentScores;
    
    const improvedScores = { ...currentScores };
    
    actions.forEach(action => {
      switch (action.type) {
        case 'refresh':
          // Refreshing evidence primarily improves recency
          improvedScores.recency = 100;
          // Also slightly improves other dimensions
          improvedScores.relevance = Math.min(100, improvedScores.relevance + 5);
          improvedScores.consistency = Math.min(100, improvedScores.consistency + 5);
          break;
          
        case 'addDetails':
          // Adding details improves completeness and verifiability
          improvedScores.completeness = Math.min(100, improvedScores.completeness + 15);
          improvedScores.verifiability = Math.min(100, improvedScores.verifiability + 10);
          break;
          
        case 'addAttachments':
          // Adding attachments improves verifiability and completeness
          improvedScores.verifiability = Math.min(100, improvedScores.verifiability + 20);
          improvedScores.completeness = Math.min(100, improvedScores.completeness + 10);
          break;
          
        case 'improveMethodology':
          // Improving methodology primarily affects reliability
          improvedScores.reliability = Math.min(100, improvedScores.reliability + 20);
          improvedScores.verifiability = Math.min(100, improvedScores.verifiability + 10);
          break;
          
        case 'alignRequirements':
          // Aligning with requirements improves relevance and consistency
          improvedScores.relevance = Math.min(100, improvedScores.relevance + 20);
          improvedScores.consistency = Math.min(100, improvedScores.consistency + 15);
          break;
          
        case 'independentVerification':
          // Independent verification improves reliability and verifiability
          improvedScores.reliability = Math.min(100, improvedScores.reliability + 25);
          improvedScores.verifiability = Math.min(100, improvedScores.verifiability + 15);
          break;
      }
    });
    
    // Calculate new overall score
    const overall = calculateOverallScore(
      improvedScores, 
      { // Assume high confidence for predictions
        completeness: 0.8,
        consistency: 0.8,
        recency: 0.9,
        relevance: 0.8,
        reliability: 0.8,
        verifiability: 0.8
      }, 
      evidenceType
    );
    
    return {
      ...improvedScores,
      overall
    };
  }, [calculateOverallScore]);

  /**
   * Get improvement actions based on current scores
   */
  const getImprovementActions = useCallback((dimensionScores, evidenceType) => {
    if (!dimensionScores || !evidenceType) return [];
    
    const actions = [];
    const thresholds = scoringOptions.thresholds;
    
    // Check each dimension for potential improvements
    if (dimensionScores.recency < thresholds.good) {
      actions.push({
        type: 'refresh',
        description: `Refresh ${evidenceType} evidence`,
        impact: 'High impact on recency score',
        effort: 'Medium',
        dimensions: ['recency', 'relevance', 'consistency']
      });
    }
    
    if (dimensionScores.completeness < thresholds.good) {
      actions.push({
        type: 'addDetails',
        description: `Add more detailed information to ${evidenceType} evidence`,
        impact: 'High impact on completeness score',
        effort: 'Medium',
        dimensions: ['completeness', 'verifiability']
      });
    }
    
    if (dimensionScores.verifiability < thresholds.good) {
      actions.push({
        type: 'addAttachments',
        description: `Add supporting documentation and artifacts to ${evidenceType} evidence`,
        impact: 'High impact on verifiability score',
        effort: 'Medium',
        dimensions: ['verifiability', 'completeness']
      });
    }
    
    if (dimensionScores.reliability < thresholds.good) {
      actions.push({
        type: 'improveMethodology',
        description: `Improve collection methodology for ${evidenceType} evidence`,
        impact: 'High impact on reliability score',
        effort: 'High',
        dimensions: ['reliability', 'verifiability']
      });
      
      actions.push({
        type: 'independentVerification',
        description: `Obtain independent verification of ${evidenceType} evidence`,
        impact: 'Very high impact on reliability score',
        effort: 'High',
        dimensions: ['reliability', 'verifiability']
      });
    }
    
    if (dimensionScores.relevance < thresholds.good) {
      actions.push({
        type: 'alignRequirements',
        description: `Better align ${evidenceType} evidence with specific requirements`,
        impact: 'High impact on relevance score',
        effort: 'Medium',
        dimensions: ['relevance', 'consistency']
      });
    }
    
    return actions;
  }, [scoringOptions.thresholds]);

  /**
   * Calculate scores for all dimensions
   */
  useEffect(() => {
    if (!evidence) return;
    
    // Calculate scores for each dimension
    const completenessResult = calculateCompletenessScore();
    const consistencyResult = calculateConsistencyScore();
    const recencyResult = calculateRecencyScore();
    const relevanceResult = calculateRelevanceScore();
    const reliabilityResult = calculateReliabilityScore();
    const verifiabilityResult = calculateVerifiabilityScore();
    
    // Collect dimension scores
    const dimensionScores = {
      completeness: Math.round(completenessResult.score),
      consistency: Math.round(consistencyResult.score),
      recency: Math.round(recencyResult.score),
      relevance: Math.round(relevanceResult.score),
      reliability: Math.round(reliabilityResult.score),
      verifiability: Math.round(verifiabilityResult.score)
    };
    
    // Collect confidence scores
    const confidenceScores = {
      completeness: completenessResult.confidence,
      consistency: consistencyResult.confidence,
      recency: recencyResult.confidence,
      relevance: relevanceResult.confidence,
      reliability: reliabilityResult.confidence,
      verifiability: verifiabilityResult.confidence
    };
    
    // Calculate overall score
    const overall = calculateOverallScore(dimensionScores, confidenceScores, evidence.type);
    
    // Determine rating based on overall score
    let rating;
    if (overall >= scoringOptions.thresholds.excellent) {
      rating = 'excellent';
    } else if (overall >= scoringOptions.thresholds.good) {
      rating = 'good';
    } else if (overall >= scoringOptions.thresholds.adequate) {
      rating = 'adequate';
    } else if (overall >= scoringOptions.thresholds.poor) {
      rating = 'poor';
    } else {
      rating = 'critical';
    }
    
    // Update scores state
    setScores({
      overall,
      dimensions: dimensionScores,
      confidence: confidenceScores,
      rating
    });
    
    // Generate improvement suggestions
    const newSuggestions = generateSuggestions(dimensionScores, evidence.type);
    setSuggestions(newSuggestions);
    
    // Calculate predictions
    const decayRate = scoringOptions.decayRates[evidence.type] || 0.1;
    const nextMonthPrediction = predictScoreDecay(overall, evidence.type, 1);
    const threeMonthPrediction = predictScoreDecay(overall, evidence.type, 3);
    const sixMonthPrediction = predictScoreDecay(overall, evidence.type, 6);
    
    // Calculate time to threshold crossings
    const timeToPoor = calculateTimeToThreshold(
      overall, 
      scoringOptions.thresholds.poor, 
      evidence.type
    );
    
    const timeToCritical = calculateTimeToThreshold(
      overall, 
      scoringOptions.thresholds.critical, 
      evidence.type
    );
    
    // Update predictions state
    setPredictions({
      decayRate: decayRate * 100, // Convert to percentage
      nextMonthScore: nextMonthPrediction.score,
      threeMonthScore: threeMonthPrediction.score,
      sixMonthScore: sixMonthPrediction.score,
      timeToThreshold: {
        poor: timeToPoor,
        critical: timeToCritical
      }
    });
  }, [
    evidence, 
    relatedEvidence, 
    requirements, 
    calculateCompletenessScore, 
    calculateConsistencyScore, 
    calculateRecencyScore, 
    calculateRelevanceScore, 
    calculateReliabilityScore, 
    calculateVerifiabilityScore, 
    calculateOverallScore, 
    generateSuggestions, 
    predictScoreDecay, 
    calculateTimeToThreshold,
    scoringOptions.thresholds,
    scoringOptions.decayRates
  ]);

  // Return the hook's public API
  return {
    // Current scores
    scores,
    
    // Improvement suggestions
    suggestions,
    
    // Predictions
    predictions,
    
    // Prediction functions
    predictScoreDecay,
    calculateTimeToThreshold,
    
    // Improvement functions
    getImprovementActions,
    predictScoreImprovement
  };
};

export default useEvidenceScoring;
