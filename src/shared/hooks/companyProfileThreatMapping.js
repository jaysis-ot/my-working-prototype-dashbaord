// src/hooks/companyProfileThreatMapping.js
/**
 * Company profile threat mapping and analysis
 */

/**
 * Analyze threat relevance to company profile
 * @param {Object} threat - Threat data
 * @param {Object} companyProfile - Company profile
 * @returns {Promise<Object>} Analysis result
 */
export const analyzeCompanyThreatProfile = async (threat, companyProfile) => {
  try {
    const analysis = {
      relevanceScore: 0,
      riskLevel: 'low',
      affectedAssets: [],
      businessImpact: {},
      remediationPriority: 'low',
      contextFactors: []
    };

    // Industry relevance analysis
    const industryRelevance = calculateIndustryRelevance(threat, companyProfile);
    analysis.relevanceScore += industryRelevance.score;
    analysis.contextFactors.push(...industryRelevance.factors);

    // Technology stack relevance
    const techRelevance = calculateTechnologyRelevance(threat, companyProfile);
    analysis.relevanceScore += techRelevance.score;
    analysis.affectedAssets.push(...techRelevance.affectedAssets);

    // Geographic relevance
    const geoRelevance = calculateGeographicRelevance(threat, companyProfile);
    analysis.relevanceScore += geoRelevance.score;
    analysis.contextFactors.push(...geoRelevance.factors);

    // Company size relevance
    const sizeRelevance = calculateSizeRelevance(threat, companyProfile);
    analysis.relevanceScore += sizeRelevance.score;

    // Business impact assessment
    analysis.businessImpact = assessBusinessImpact(threat, companyProfile, analysis.affectedAssets);

    // Determine risk level
    analysis.riskLevel = determineRiskLevel(analysis.relevanceScore, threat.riskScore);

    // Calculate remediation priority
    analysis.remediationPriority = calculateRemediationPriority(
      analysis.riskLevel,
      analysis.businessImpact,
      companyProfile
    );

    // Normalize relevance score (0-1)
    analysis.relevanceScore = Math.min(analysis.relevanceScore / 4, 1);

    return analysis;

  } catch (error) {
    console.error('Error analyzing company threat profile:', error);
    return {
      relevanceScore: 0.5,
      riskLevel: 'medium',
      error: error.message
    };
  }
};

/**
 * Calculate industry relevance
 * @param {Object} threat - Threat data
 * @param {Object} companyProfile - Company profile
 * @returns {Object} Industry relevance analysis
 */
const calculateIndustryRelevance = (threat, companyProfile) => {
  const result = { score: 0, factors: [] };

  const industryThreats = {
    'financial': ['banking trojan', 'atm malware', 'payment fraud', 'swift attack'],
    'healthcare': ['ransomware', 'phi theft', 'medical device', 'hipaa'],
    'energy': ['scada', 'industrial control', 'power grid', 'critical infrastructure'],
    'retail': ['pos malware', 'payment card', 'customer data', 'e-commerce'],
    'technology': ['intellectual property', 'source code theft', 'apt', 'zero day'],
    'government': ['nation state', 'classified data', 'espionage', 'election'],
    'education': ['student data', 'research theft', 'ferpa', 'campus network'],
    'manufacturing': ['industrial espionage', 'trade secrets', 'supply chain', 'ot security']
  };

  const companyIndustry = companyProfile.industry?.toLowerCase();
  const threatText = `${threat.title} ${threat.description}`.toLowerCase();

  if (companyIndustry && industryThreats[companyIndustry]) {
    const relevantKeywords = industryThreats[companyIndustry];
    const matchingKeywords = relevantKeywords.filter(keyword => 
      threatText.includes(keyword)
    );

    if (matchingKeywords.length > 0) {
      result.score = Math.min(matchingKeywords.length * 0.3, 1.0);
      result.factors.push({
        type: 'industry_relevance',
        description: `Threat targets ${companyIndustry} industry`,
        keywords: matchingKeywords,
        impact: 'high'
      });
    }
  }

  return result;
};

/**
 * Calculate technology stack relevance
 * @param {Object} threat - Threat data
 * @param {Object} companyProfile - Company profile
 * @returns {Object} Technology relevance analysis
 */
const calculateTechnologyRelevance = (threat, companyProfile) => {
  const result = { score: 0, affectedAssets: [] };

  const companyTech = companyProfile.technologyStack || [];
  const threatSystems = threat.affectedSystems || [];
  const threatText = `${threat.title} ${threat.description}`.toLowerCase();

  companyTech.forEach(tech => {
    const techName = tech.name?.toLowerCase() || tech.toLowerCase();
    
    const mentionedInThreat = threatSystems.some(system => 
      system.toLowerCase().includes(techName)
    ) || threatText.includes(techName);

    if (mentionedInThreat) {
      result.score += 0.3;
      result.affectedAssets.push({
        name: tech.name || tech,
        type: tech.type || 'software',
        criticality: tech.criticality || 'medium',
        exposure: tech.exposure || 'internal'
      });
    }
  });

  return result;
};

/**
 * Calculate geographic relevance
 * @param {Object} threat - Threat data
 * @param {Object} companyProfile - Company profile
 * @returns {Object} Geographic relevance analysis
 */
const calculateGeographicRelevance = (threat, companyProfile) => {
  const result = { score: 0, factors: [] };

  const companyLocations = [
    companyProfile.country,
    companyProfile.region,
    ...(companyProfile.subsidiaryLocations || [])
  ].filter(Boolean);

  const threatGeo = threat.geolocation || {};
  const threatText = `${threat.title} ${threat.description}`.toLowerCase();

  companyLocations.forEach(location => {
    const locationLower = location.toLowerCase();
    
    if (threatText.includes(locationLower) || 
        threatGeo.countries?.includes(location) ||
        threat.targetedCountries?.includes(location)) {
      
      result.score += 0.3;
      result.factors.push({
        type: 'geographic_targeting',
        description: `Threat specifically targets ${location}`,
        location: location,
        impact: 'medium'
      });
    }
  });

  return result;
};

/**
 * Calculate company size relevance
 * @param {Object} threat - Threat data
 * @param {Object} companyProfile - Company profile
 * @returns {Object} Size relevance analysis
 */
const calculateSizeRelevance = (threat, companyProfile) => {
  const companySize = companyProfile.companySize?.toLowerCase();
  const threatText = `${threat.title} ${threat.description}`.toLowerCase();

  const sizePatterns = {
    'small': ['small business', 'smb', 'startup'],
    'medium': ['mid-market', 'medium business'],
    'large': ['enterprise', 'fortune', 'multinational', 'large corporation'],
    'government': ['government', 'public sector', 'federal']
  };

  if (companySize && sizePatterns[companySize]) {
    const patterns = sizePatterns[companySize];
    const hasPattern = patterns.some(pattern => threatText.includes(pattern));
    
    if (hasPattern) {
      return { score: 0.3 };
    }
  }

  return { score: 0 };
};

/**
 * Assess business impact
 * @param {Object} threat - Threat data
 * @param {Object} companyProfile - Company profile
 * @param {Array} affectedAssets - Affected assets
 * @returns {Object} Business impact assessment
 */
const assessBusinessImpact = (threat, companyProfile, affectedAssets) => {
  const impact = {
    financial: { level: 'low', factors: [] },
    operational: { level: 'low', factors: [] },
    reputational: { level: 'low', factors: [] },
    regulatory: { level: 'low', factors: [] }
  };

  // Financial impact
  const criticalAssets = affectedAssets.filter(asset => 
    asset.criticality === 'high' || asset.criticality === 'critical'
  );
  
  if (criticalAssets.length > 0) {
    impact.financial.level = 'high';
    impact.financial.factors.push('Critical business systems affected');
  }

  // Operational impact
  const customerFacingSystems = affectedAssets.filter(asset => 
    asset.exposure === 'external' || asset.type === 'web_service'
  );
  
  if (customerFacingSystems.length > 0) {
    impact.operational.level = 'high';
    impact.operational.factors.push('Customer-facing systems at risk');
  }

  // Regulatory impact
  const regulatedIndustries = ['financial', 'healthcare', 'government'];
  if (regulatedIndustries.includes(companyProfile.industry?.toLowerCase())) {
    impact.regulatory.level = 'medium';
    impact.regulatory.factors.push('Regulated industry compliance requirements');
  }

  return impact;
};

/**
 * Determine overall risk level
 * @param {number} relevanceScore - Relevance score
 * @param {number} threatRiskScore - Threat risk score
 * @returns {string} Risk level
 */
const determineRiskLevel = (relevanceScore, threatRiskScore) => {
  const combinedScore = (relevanceScore + (threatRiskScore / 10)) / 2;
  
  if (combinedScore >= 0.8) return 'critical';
  if (combinedScore >= 0.6) return 'high';
  if (combinedScore >= 0.4) return 'medium';
  return 'low';
};

/**
 * Calculate remediation priority
 * @param {string} riskLevel - Risk level
 * @param {Object} businessImpact - Business impact assessment
 * @param {Object} companyProfile - Company profile
 * @returns {string} Remediation priority
 */
const calculateRemediationPriority = (riskLevel, businessImpact, companyProfile) => {
  const riskLevelScores = {
    'critical': 4,
    'high': 3,
    'medium': 2,
    'low': 1
  };

  const impactLevelScores = {
    'high': 3,
    'medium': 2,
    'low': 1
  };

  const riskScore = riskLevelScores[riskLevel] || 1;
  const maxImpactScore = Math.max(
    impactLevelScores[businessImpact.financial?.level] || 1,
    impactLevelScores[businessImpact.operational?.level] || 1,
    impactLevelScores[businessImpact.regulatory?.level] || 1
  );

  const totalScore = riskScore + maxImpactScore;

  if (totalScore >= 6) return 'critical';
  if (totalScore >= 5) return 'high';
  if (totalScore >= 3) return 'medium';
  return 'low';
};