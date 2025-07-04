// threatIntelligence.js - CONTINUED
// Comprehensive threat intelligence platform for threat management system

import { mitreAPI } from './mitreAttackAPI.js';
import { mapThreatToMitre, analyzeThreatActorMatch } from './mitreAttackMapping.js';
import { parseRSSFeed, parseBatchFeeds, filterFeedItems } from './rssParser.js';
import { analyzeCompanyThreatProfile } from './companyProfileThreatMapping.js';
import { calculateWeightedRiskScore, calculateALE } from './riskCalculation.js';
import { sendThreatAlert, sendWeeklyDigest } from './emailService.js';

// Previous constants and class definition remains the same...
// [Previous code continues here - truncated for brevity]

export class ThreatIntelligenceEngine {
  // ... [Previous constructor and methods remain the same] ...

  /**
   * Enhanced implementation of MITRE enrichment
   * @param {Array} techniques - MITRE technique IDs
   * @returns {Object} Enriched MITRE data
   */
  async enrichWithMitreData(techniques) {
    try {
      const enrichedData = {
        techniques: [],
        tactics: new Set(),
        mitigations: [],
        detectionMethods: [],
        riskFactors: {}
      };

      for (const techniqueId of techniques) {
        try {
          const technique = await mitreAPI.getTechnique(techniqueId);
          if (technique) {
            enrichedData.techniques.push({
              id: technique.id,
              name: technique.name,
              description: technique.description,
              tactics: technique.tactics,
              platforms: technique.platforms,
              permissions: technique.permissions_required,
              dataSources: technique.data_sources,
              defenses: technique.defenses_bypassed
            });

            // Add tactics
            technique.tactics?.forEach(tactic => enrichedData.tactics.add(tactic));

            // Get mitigations
            const mitigations = await mitreAPI.getMitigationsForTechnique(techniqueId);
            enrichedData.mitigations.push(...mitigations);

            // Get detection methods
            const detections = await mitreAPI.getDetectionMethods(techniqueId);
            enrichedData.detectionMethods.push(...detections);
          }
        } catch (error) {
          console.warn(`Failed to enrich technique ${techniqueId}:`, error);
        }
      }

      // Calculate risk factors based on MITRE data
      enrichedData.riskFactors = this.calculateMitreRiskFactors(enrichedData);
      enrichedData.tactics = Array.from(enrichedData.tactics);

      return enrichedData;
    } catch (error) {
      console.error('Error enriching with MITRE data:', error);
      return { error: error.message };
    }
  }

  /**
   * Enhanced threat actor enrichment
   * @param {string} actor - Threat actor name
   * @returns {Object} Enriched actor data
   */
  async enrichWithActorData(actor) {
    try {
      const enrichedData = {
        name: actor,
        aliases: [],
        category: null,
        sophistication: 'unknown',
        motivation: [],
        targetedSectors: [],
        targetedCountries: [],
        techniques: [],
        tools: [],
        campaigns: [],
        firstSeen: null,
        lastActivity: null,
        confidence: CONFIDENCE_LEVELS.POSSIBLE.level
      };

      // Try to match with known threat actors
      const knownActor = await this.lookupThreatActor(actor);
      if (knownActor) {
        Object.assign(enrichedData, knownActor);
        enrichedData.confidence = CONFIDENCE_LEVELS.CONFIRMED.level;
      }

      // Analyze actor from MITRE ATT&CK groups
      const mitreMatch = await analyzeThreatActorMatch(actor);
      if (mitreMatch && mitreMatch.confidence > 0.7) {
        enrichedData.aliases.push(...mitreMatch.aliases);
        enrichedData.techniques.push(...mitreMatch.techniques);
        enrichedData.tools.push(...mitreMatch.software);
        enrichedData.sophistication = this.calculateActorSophistication(mitreMatch);
        enrichedData.confidence = Math.max(enrichedData.confidence, mitreMatch.confidence * 100);
      }

      // Get historical activity
      const historicalData = await this.getActorHistoricalActivity(actor);
      if (historicalData) {
        enrichedData.campaigns = historicalData.campaigns;
        enrichedData.firstSeen = historicalData.firstSeen;
        enrichedData.lastActivity = historicalData.lastActivity;
      }

      return enrichedData;
    } catch (error) {
      console.error('Error enriching actor data:', error);
      return { error: error.message, name: actor };
    }
  }

  /**
   * Enhanced campaign enrichment
   * @param {string} campaign - Campaign name
   * @returns {Object} Enriched campaign data
   */
  async enrichWithCampaignData(campaign) {
    try {
      const enrichedData = {
        name: campaign,
        aliases: [],
        threatActor: null,
        startDate: null,
        endDate: null,
        targets: [],
        sectors: [],
        countries: [],
        techniques: [],
        tools: [],
        indicators: [],
        timeline: [],
        status: 'unknown',
        confidence: CONFIDENCE_LEVELS.POSSIBLE.level
      };

      // Look up campaign in threat intelligence databases
      const knownCampaign = await this.lookupCampaign(campaign);
      if (knownCampaign) {
        Object.assign(enrichedData, knownCampaign);
        enrichedData.confidence = CONFIDENCE_LEVELS.CONFIRMED.level;
      }

      // Check our internal campaign data
      const internalCampaign = this.campaigns.get(campaign);
      if (internalCampaign) {
        enrichedData.startDate = new Date(internalCampaign.firstSeen).toISOString();
        enrichedData.endDate = new Date(internalCampaign.lastSeen).toISOString();
        enrichedData.techniques = Array.from(internalCampaign.techniques);
        enrichedData.indicators = Array.from(internalCampaign.iocs);
        enrichedData.timeline = internalCampaign.timeline;
        enrichedData.status = this.determineCampaignStatus(internalCampaign);
      }

      return enrichedData;
    } catch (error) {
      console.error('Error enriching campaign data:', error);
      return { error: error.message, name: campaign };
    }
  }

  /**
   * Enhanced vulnerability enrichment
   * @param {Array} cves - CVE numbers
   * @returns {Object} Enriched vulnerability data
   */
  async enrichWithVulnerabilityData(cves) {
    try {
      const enrichedData = {
        vulnerabilities: [],
        totalCvssScore: 0,
        averageCvssScore: 0,
        criticalCount: 0,
        highCount: 0,
        exploitability: {
          hasExploit: false,
          inTheWild: false,
          weaponized: false
        },
        affectedProducts: [],
        patchAvailable: 0,
        remediationComplexity: 'unknown'
      };

      for (const cve of cves) {
        try {
          const vulnData = await this.lookupVulnerability(cve);
          if (vulnData) {
            enrichedData.vulnerabilities.push(vulnData);
            enrichedData.totalCvssScore += vulnData.cvssScore || 0;

            if (vulnData.cvssScore >= 9.0) enrichedData.criticalCount++;
            else if (vulnData.cvssScore >= 7.0) enrichedData.highCount++;

            if (vulnData.exploitAvailable) enrichedData.exploitability.hasExploit = true;
            if (vulnData.exploitInWild) enrichedData.exploitability.inTheWild = true;

            enrichedData.affectedProducts.push(...(vulnData.affectedProducts || []));
            if (vulnData.patchAvailable) enrichedData.patchAvailable++;
          }
        } catch (error) {
          console.warn(`Failed to lookup vulnerability ${cve}:`, error);
        }
      }

      enrichedData.averageCvssScore = enrichedData.vulnerabilities.length > 0 ?
        enrichedData.totalCvssScore / enrichedData.vulnerabilities.length : 0;

      enrichedData.remediationComplexity = this.calculateRemediationComplexity(enrichedData);

      return enrichedData;
    } catch (error) {
      console.error('Error enriching vulnerability data:', error);
      return { error: error.message };
    }
  }

  /**
   * Enhanced company context enrichment
   * @param {Object} threat - Threat data
   * @param {Object} companyProfile - Company profile
   * @returns {Object} Company context data
   */
  async enrichWithCompanyContext(threat, companyProfile) {
    try {
      const context = await analyzeCompanyThreatProfile(threat, companyProfile);
      
      const enrichedContext = {
        relevanceScore: context.relevanceScore,
        riskLevel: context.riskLevel,
        affectedAssets: context.affectedAssets,
        businessImpact: context.businessImpact,
        remediationPriority: context.remediationPriority,
        similarIncidents: await this.findSimilarIncidents(threat, companyProfile),
        controlsAssessment: this.assessExistingControls(threat, companyProfile),
        recommendedActions: this.generateRecommendedActions(threat, companyProfile),
        budgetaryImpact: this.calculateBudgetaryImpact(threat, companyProfile),
        complianceImplications: this.assessComplianceImplications(threat, companyProfile)
      };

      return enrichedContext;
    } catch (error) {
      console.error('Error enriching company context:', error);
      return { error: error.message, relevanceScore: 0.5 };
    }
  }

  /**
   * Enhanced historical data enrichment
   * @param {Object} threat - Threat data
   * @returns {Object} Historical context data
   */
  async enrichWithHistoricalData(threat) {
    try {
      const historicalData = {
        similarThreats: [],
        trendAnalysis: {},
        evolutionPattern: null,
        recurrenceRate: 0,
        seasonality: null,
        associatedCampaigns: [],
        learningsFromPast: []
      };

      // Find similar threats from history
      historicalData.similarThreats = await this.findSimilarHistoricalThreats(threat);

      // Analyze trends
      historicalData.trendAnalysis = await this.analyzeThreatTrends(threat);

      // Identify evolution patterns
      historicalData.evolutionPattern = this.identifyEvolutionPattern(threat);

      // Calculate recurrence rate
      historicalData.recurrenceRate = this.calculateRecurrenceRate(threat);

      // Detect seasonality
      historicalData.seasonality = this.detectSeasonality(threat);

      // Find associated campaigns
      historicalData.associatedCampaigns = this.findAssociatedCampaigns(threat);

      // Extract learnings
      historicalData.learningsFromPast = this.extractHistoricalLearnings(threat);

      return historicalData;
    } catch (error) {
      console.error('Error enriching historical data:', error);
      return { error: error.message };
    }
  }

  /**
   * Enhanced geolocation enrichment
   * @param {Array} iocs - IOCs to geolocate
   * @returns {Object} Geolocation data
   */
  async enrichWithGeolocation(iocs) {
    try {
      const geolocationData = {
        locations: [],
        countries: new Set(),
        cities: new Set(),
        asns: new Set(),
        riskByLocation: {},
        geographicDistribution: {},
        anomalousLocations: []
      };

      for (const ioc of iocs) {
        if (ioc.type === 'ip_address' || (typeof ioc === 'string' && IOC_TYPES.IP_ADDRESS.pattern.test(ioc))) {
          const ip = ioc.value || ioc;
          try {
            const geoData = await this.geolocateIP(ip);
            if (geoData) {
              geolocationData.locations.push({
                ip: ip,
                country: geoData.country,
                city: geoData.city,
                region: geoData.region,
                asn: geoData.asn,
                org: geoData.org,
                coordinates: geoData.coordinates,
                riskScore: geoData.riskScore
              });

              geolocationData.countries.add(geoData.country);
              geolocationData.cities.add(geoData.city);
              geolocationData.asns.add(geoData.asn);

              // Track risk by location
              if (!geolocationData.riskByLocation[geoData.country]) {
                geolocationData.riskByLocation[geoData.country] = [];
              }
              geolocationData.riskByLocation[geoData.country].push(geoData.riskScore);
            }
          } catch (error) {
            console.warn(`Failed to geolocate IP ${ip}:`, error);
          }
        }
      }

      // Convert sets to arrays
      geolocationData.countries = Array.from(geolocationData.countries);
      geolocationData.cities = Array.from(geolocationData.cities);
      geolocationData.asns = Array.from(geolocationData.asns);

      // Calculate geographic distribution
      geolocationData.geographicDistribution = this.calculateGeographicDistribution(geolocationData);

      // Identify anomalous locations
      geolocationData.anomalousLocations = this.identifyAnomalousLocations(geolocationData);

      return geolocationData;
    } catch (error) {
      console.error('Error enriching geolocation data:', error);
      return { error: error.message };
    }
  }

  /**
   * Enhanced IOC reputation checking
   * @param {Object} ioc - IOC to check
   * @returns {Object} Reputation data
   */
  async checkIOCReputation(ioc) {
    try {
      const reputation = {
        category: 'unknown',
        score: 0,
        sources: [],
        lastChecked: Date.now(),
        verdict: 'unknown',
        confidence: 0,
        details: {}
      };

      const value = ioc.value || ioc;
      const type = ioc.type || this.classifyIOC(value);

      // Check multiple reputation sources
      const reputationSources = [
        'virustotal',
        'abuseipdb',
        'threatcrowd',
        'otx',
        'internal_blacklist'
      ];

      let totalScore = 0;
      let sourceCount = 0;

      for (const source of reputationSources) {
        try {
          const sourceReputation = await this.checkReputationSource(value, type, source);
          if (sourceReputation) {
            reputation.sources.push({
              source: source,
              score: sourceReputation.score,
              category: sourceReputation.category,
              lastSeen: sourceReputation.lastSeen
            });

            totalScore += sourceReputation.score;
            sourceCount++;

            // Aggregate details
            if (sourceReputation.details) {
              reputation.details[source] = sourceReputation.details;
            }
          }
        } catch (error) {
          console.warn(`Failed to check reputation with ${source}:`, error);
        }
      }

      // Calculate average score
      if (sourceCount > 0) {
        reputation.score = totalScore / sourceCount;
        reputation.confidence = Math.min(sourceCount * 20, 100); // Higher confidence with more sources

        // Determine category and verdict
        if (reputation.score >= 8) {
          reputation.category = 'malicious';
          reputation.verdict = 'malicious';
        } else if (reputation.score >= 6) {
          reputation.category = 'suspicious';
          reputation.verdict = 'suspicious';
        } else if (reputation.score >= 3) {
          reputation.category = 'questionable';
          reputation.verdict = 'questionable';
        } else {
          reputation.category = 'clean';
          reputation.verdict = 'clean';
        }
      }

      return reputation;
    } catch (error) {
      console.error('Error checking IOC reputation:', error);
      return { category: 'unknown', score: 0, error: error.message };
    }
  }

  /**
   * Enhanced IOC geolocation
   * @param {Object} ioc - IOC to geolocate
   * @returns {Object} Geolocation data
   */
  async getIOCGeolocation(ioc) {
    try {
      const value = ioc.value || ioc;
      const type = ioc.type || this.classifyIOC(value);

      if (type === 'ip_address') {
        return await this.geolocateIP(value);
      }

      if (type === 'domain') {
        // For domains, try to resolve to IP and then geolocate
        const resolvedIPs = await this.resolveDomain(value);
        if (resolvedIPs.length > 0) {
          return await this.geolocateIP(resolvedIPs[0]);
        }
      }

      return { country: 'unknown', city: 'unknown', error: 'Cannot geolocate this IOC type' };
    } catch (error) {
      console.error('Error getting IOC geolocation:', error);
      return { country: 'unknown', city: 'unknown', error: error.message };
    }
  }

  /**
   * Enhanced severity scoring
   * @param {string} severity - Severity level
   * @returns {number} Severity score (0-1)
   */
  getSeverityScore(severity) {
    const severityScores = {
      'CRITICAL': 1.0,
      'HIGH': 0.8,
      'MEDIUM': 0.6,
      'LOW': 0.3,
      'INFO': 0.1
    };

    return severityScores[severity] || 0.5;
  }

  /**
   * Enhanced freshness scoring
   * @param {string} date - Published date
   * @returns {number} Freshness score (0-1)
   */
  getFreshnessScore(date) {
    const publishedDate = new Date(date);
    const now = new Date();
    const ageInDays = (now - publishedDate) / (1000 * 60 * 60 * 24);

    // Fresher threats get higher scores
    if (ageInDays <= 1) return 1.0;
    if (ageInDays <= 7) return 0.9;
    if (ageInDays <= 30) return 0.7;
    if (ageInDays <= 90) return 0.5;
    if (ageInDays <= 365) return 0.3;

    return 0.1;
  }

  /**
   * Enhanced MITRE risk scoring
   * @param {Array} techniques - MITRE technique IDs
   * @returns {number} MITRE risk score (0-1)
   */
  async calculateMitreRiskScore(techniques) {
    if (!techniques || techniques.length === 0) return 0;

    let totalScore = 0;
    let validTechniques = 0;

    for (const techniqueId of techniques) {
      try {
        const technique = await mitreAPI.getTechnique(techniqueId);
        if (technique) {
          let score = 0.5; // Base score

          // Higher score for techniques that require fewer permissions
          if (technique.permissions_required?.includes('User')) score += 0.2;
          if (technique.permissions_required?.includes('Administrator')) score += 0.3;
          if (technique.permissions_required?.includes('SYSTEM')) score += 0.4;

          // Higher score for techniques with more tactics
          score += Math.min(technique.tactics?.length * 0.1, 0.3);

          // Higher score for techniques with fewer defenses
          if (technique.defenses_bypassed?.length > 0) {
            score += Math.min(technique.defenses_bypassed.length * 0.05, 0.2);
          }

          totalScore += Math.min(score, 1.0);
          validTechniques++;
        }
      } catch (error) {
        console.warn(`Failed to score technique ${techniqueId}:`, error);
      }
    }

    return validTechniques > 0 ? totalScore / validTechniques : 0;
  }

  /**
   * Enhanced actor sophistication scoring
   * @param {string} actor - Threat actor
   * @returns {number} Sophistication score (0-1)
   */
  getActorSophisticationScore(actor) {
    if (!actor) return 0.5;

    // Check against known threat actor categories
    for (const [, category] of Object.entries(THREAT_ACTOR_CATEGORIES)) {
      if (actor.toLowerCase().includes(category.name.toLowerCase())) {
        const sophisticationMap = {
          'very_high': 0.95,
          'high': 0.8,
          'medium': 0.6,
          'low': 0.3,
          'very_low': 0.1
        };
        return sophisticationMap[category.sophistication] || 0.5;
      }
    }

    // Default scoring based on common patterns
    const actorLower = actor.toLowerCase();
    if (actorLower.includes('apt') || actorLower.includes('nation')) return 0.9;
    if (actorLower.includes('lazarus') || actorLower.includes('carbanak')) return 0.85;
    if (actorLower.includes('criminal') || actorLower.includes('gang')) return 0.6;
    if (actorLower.includes('script') || actorLower.includes('kiddie')) return 0.2;

    return 0.5;
  }

  /**
   * Enhanced relevance scoring
   * @param {Object} threat - Threat data
   * @param {Object} profile - Company profile
   * @returns {number} Relevance score (0-1)
   */
  calculateRelevanceScore(threat, profile) {
    let score = 0.5; // Base score

    // Industry relevance
    if (threat.targetedSectors?.includes(profile.industry)) {
      score += 0.3;
    }

    // Geographic relevance
    if (threat.targetedCountries?.includes(profile.country)) {
      score += 0.2;
    }

    // Technology stack relevance
    const affectedSystems = threat.affectedSystems || [];
    const companyTech = profile.technologyStack || [];
    const techOverlap = affectedSystems.filter(sys => 
      companyTech.some(tech => tech.toLowerCase().includes(sys.toLowerCase()))
    );
    if (techOverlap.length > 0) {
      score += Math.min(techOverlap.length * 0.1, 0.3);
    }

    // Size relevance
    if (threat.targetedCompanySizes?.includes(profile.companySize)) {
      score += 0.15;
    }

    return Math.min(score, 1.0);
  }

  /**
   * Enhanced IOC quality scoring
   * @param {Array} iocs - IOCs to score
   * @returns {number} IOC score (0-1)
   */
  calculateIOCScore(iocs) {
    if (!iocs || iocs.length === 0) return 0;

    let totalScore = 0;
    let iocCount = 0;

    for (const ioc of iocs) {
      let score = 0.5; // Base score
      const value = ioc.value || ioc;
      const type = ioc.type || this.classifyIOC(value);

      // Score by IOC type reliability
      const typeScores = {
        'file_hash': 0.9,
        'cryptocurrency': 0.85,
        'registry_key': 0.8,
        'file_path': 0.7,
        'domain': 0.6,
        'url': 0.5,
        'ip_address': 0.4,
        'email': 0.3
      };

      score = typeScores[type] || 0.5;

      // Adjust for confidence if available
      if (ioc.confidence) {
        score *= (ioc.confidence / 100);
      }

      totalScore += score;
      iocCount++;
    }

    return iocCount > 0 ? totalScore / iocCount : 0;
  }

  /**
   * Enhanced alert condition checking
   * @param {Object} threat - Threat data
   * @returns {boolean} Whether to generate alert
   */
  shouldGenerateAlert(threat) {
    // High risk score
    if (threat.riskScore >= 7) return true;

    // Critical severity
    if (threat.severity === 'CRITICAL') return true;

    // High confidence and medium+ risk
    if (threat.confidence >= 80 && threat.riskScore >= 5) return true;

    // Company-specific high relevance
    if (threat.companyContext?.relevanceScore >= 0.8 && threat.riskScore >= 4) return true;

    // Known threat actor
    if (threat.threatActor && threat.riskScore >= 4) return true;

    // Multiple high-confidence IOCs
    if (threat.iocs.length >= 5 && threat.riskScore >= 3) return true;

    return false;
  }

  /**
   * Enhanced IOC formatting for alerts
   * @param {Array} iocs - IOCs to format
   * @returns {Array} Formatted IOCs
   */
  formatIOCsForAlert(iocs) {
    if (!iocs || iocs.length === 0) return [];

    return iocs.slice(0, 10).map(ioc => ({
      value: ioc.value || ioc,
      type: ioc.type || this.classifyIOC(ioc.value || ioc),
      confidence: ioc.confidence || 'Unknown',
      description: IOC_TYPES[ioc.type?.toUpperCase()]?.description || 'Unknown type'
    }));
  }

  /**
   * Enhanced alert recipient determination
   * @param {string} severity - Threat severity
   * @param {number} riskScore - Risk score
   * @returns {Array} Alert recipients
   */
  getAlertRecipients(severity, riskScore) {
    const recipients = new Set();

    // Always include security team
    recipients.add('security@company.com');

    // Add SOC for medium+ threats
    if (riskScore >= 5) {
      recipients.add('soc@company.com');
    }

    // Add management for high+ threats
    if (riskScore >= 7 || severity === 'CRITICAL') {
      recipients.add('security-management@company.com');
    }

    // Add CISO for critical threats
    if (riskScore >= 9 || severity === 'CRITICAL') {
      recipients.add('ciso@company.com');
    }

    // Add incident response team for very high threats
    if (riskScore >= 8) {
      recipients.add('incident-response@company.com');
    }

    return Array.from(recipients);
  }

  /**
   * Data persistence and caching methods
   */
  async loadCachedData() {
    try {
      // In a real implementation, this would load from a database or file system
      console.log('Loading cached threat intelligence data...');
      
      // Mock implementation - replace with actual data persistence
      const cachedData = this.getCachedDataFromStorage();
      if (cachedData) {
        this.threats = new Map(cachedData.threats || []);
        this.campaigns = new Map(cachedData.campaigns || []);
        this.iocs = new Map(cachedData.iocs || []);
        this.threatActors = new Map(cachedData.threatActors || []);
        this.correlations = new Map(cachedData.correlations || []);
        this.stats = cachedData.stats || this.stats;
      }
    } catch (error) {
      console.error('Error loading cached data:', error);
    }
  }

  async saveCachedData() {
    try {
      const dataToCache = {
        threats: Array.from(this.threats.entries()),
        campaigns: Array.from(this.campaigns.entries()),
        iocs: Array.from(this.iocs.entries()),
        threatActors: Array.from(this.threatActors.entries()),
        correlations: Array.from(this.correlations.entries()),
        stats: this.stats,
        lastSaved: Date.now()
      };

      await this.saveCachedDataToStorage(dataToCache);
    } catch (error) {
      console.error('Error saving cached data:', error);
    }
  }

  /**
   * Helper methods for external integrations
   */
  async geolocateIP(ip) {
    // Mock implementation - replace with actual geolocation service
    try {
      // This would integrate with services like MaxMind, IPinfo, etc.
      const mockGeoData = {
        country: 'US',
        city: 'Unknown',
        region: 'Unknown',
        asn: 'AS0000',
        org: 'Unknown',
        coordinates: { lat: 0, lon: 0 },
        riskScore: Math.random() * 10
      };
      return mockGeoData;
    } catch (error) {
      console.error(`Error geolocating IP ${ip}:`, error);
      return null;
    }
  }

  async lookupThreatActor(actor) {
    // Mock implementation - replace with threat intelligence feeds
    const knownActors = {
      'lazarus': {
        category: 'nation_state',
        sophistication: 'very_high',
        aliases: ['Hidden Cobra', 'Guardians of Peace'],
        motivation: ['financial', 'espionage'],
        targetedSectors: ['financial', 'entertainment', 'cryptocurrency']
      }
    };

    return knownActors[actor.toLowerCase()] || null;
  }

  async lookupCampaign(campaign) {
    // Mock implementation - replace with campaign database
    return null;
  }

  async lookupVulnerability(cve) {
    // Mock implementation - replace with CVE database lookup
    return {
      id: cve,
      cvssScore: Math.random() * 10,
      exploitAvailable: Math.random() > 0.7,
      exploitInWild: Math.random() > 0.9,
      patchAvailable: Math.random() > 0.5,
      affectedProducts: [`Product-${Math.floor(Math.random() * 100)}`]
    };
  }

  async checkReputationSource(value, type, source) {
    // Mock implementation - replace with actual reputation services
    return {
      score: Math.random() * 10,
      category: 'unknown',
      lastSeen: Date.now(),
      details: { source: source, checked: true }
    };
  }

  async resolveDomain(domain) {
    // Mock implementation - replace with DNS resolution
    return ['192.168.1.1'];
  }

  // Storage methods (to be implemented based on your persistence layer)
  getCachedDataFromStorage() {
    // Implement based on your storage solution (filesystem, database, etc.)
    return null;
  }

  async saveCachedDataToStorage(data) {
    // Implement based on your storage solution
    console.log('Saving data to storage...');
  }

  // Additional helper methods
  calculateMitreRiskFactors(mitreData) {
    return {
      tacticCoverage: mitreData.tactics.length,
      techniqueComplexity: mitreData.techniques.length,
      mitigationAvailable: mitreData.mitigations.length > 0,
      detectionDifficulty: mitreData.detectionMethods.length === 0 ? 'high' : 'medium'
    };
  }

  calculateActorSophistication(mitreMatch) {
    const techniqueCount = mitreMatch.techniques?.length || 0;
    const toolCount = mitreMatch.software?.length || 0;
    
    if (techniqueCount > 20 || toolCount > 10) return 'very_high';
    if (techniqueCount > 10 || toolCount > 5) return 'high';
    if (techniqueCount > 5 || toolCount > 2) return 'medium';
    return 'low';
  }

  determineCampaignStatus(campaign) {
    const daysSinceLastActivity = (Date.now() - campaign.lastSeen) / (1000 * 60 * 60 * 24);
    
    if (daysSinceLastActivity < 7) return 'active';
    if (daysSinceLastActivity < 30) return 'dormant';
    return 'inactive';
  }

  calculateRemediationComplexity(vulnData) {
    const criticalCount = vulnData.criticalCount || 0;
    const patchRate = vulnData.patchAvailable / vulnData.vulnerabilities.length;
    
    if (criticalCount > 5 || patchRate < 0.3) return 'high';
    if (criticalCount > 2 || patchRate < 0.7) return 'medium';
    return 'low';
  }

  // Placeholder implementations for complex analysis methods
  async findSimilarIncidents(threat, companyProfile) { return []; }
  assessExistingControls(threat, companyProfile) { return {}; }
  generateRecommendedActions(threat, companyProfile) { return []; }
  calculateBudgetaryImpact(threat, companyProfile) { return 0; }
  assessComplianceImplications(threat, companyProfile) { return []; }
  async findSimilarHistoricalThreats(threat) { return []; }
  async analyzeThreatTrends(threat) { return {}; }
  identifyEvolutionPattern(threat) { return null; }
  calculateRecurrenceRate(threat) { return 0; }
  detectSeasonality(threat) { return null; }
  findAssociatedCampaigns(threat) { return []; }
  extractHistoricalLearnings(threat) { return []; }
  calculateGeographicDistribution(geoData) { return {}; }
  identifyAnomalousLocations(geoData) { return []; }
  async getActorHistoricalActivity(actor) { return null; }
}

// Enhanced utility functions
export const createThreatIntelligenceConfig = (overrides = {}) => {
  const defaultConfig = {
    updateInterval: 3600000, // 1 hour
    iocRetentionPeriod: 90 * 24 * 60 * 60 * 1000, // 90 days
    correlationThreshold: 0.7,
    autoProcessing: true,
    enableMachineLearning: true,
    alertThresholds: {
      critical: 9,
      high: 7,
      medium: 5
    },
    maxQueueSize: 1000,
    processingTimeout: 30000,
    enableGeolocation: true,
    enableReputation: true,
    persistenceEnabled: true
  };

  return { ...defaultConfig, ...overrides };
};

export const validateThreatData = (data) => {
  const required = ['title', 'description', 'severity'];
  const missing = required.filter(field => !data[field]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }

  return true;
};

export const normalizeThreatSeverity = (severity) => {
  const severityMap = new Map([
    ['1', 'LOW'], ['2', 'LOW'], ['3', 'MEDIUM'],
    ['4', 'MEDIUM'], ['5', 'MEDIUM'], ['6', 'HIGH'],
    ['7', 'HIGH'], ['8', 'HIGH'], ['9', 'CRITICAL'],
    ['10', 'CRITICAL'], ['info', 'LOW'], ['low', 'LOW'],
    ['medium', 'MEDIUM'], ['high', 'HIGH'], ['critical', 'CRITICAL']
  ]);

  const normalized = severityMap.get(severity?.toString().toLowerCase());
  return normalized || 'MEDIUM';
};

// Export enhanced instance
export const threatIntelligence = new ThreatIntelligenceEngine();

// Export factory function
export const createThreatIntelligenceEngine = (config = {}) => {
  const engineConfig = createThreatIntelligenceConfig(config);
  return new ThreatIntelligenceEngine(engineConfig);
};

// Main API exports remain the same
export const processThreat = (data, source) => 
  threatIntelligence.processThreatIntelligence(data, source);

export const searchThreats = (criteria) => 
  threatIntelligence.searchThreats(criteria);

export const searchIOCs = (criteria) => 
  threatIntelligence.searchIOCs(criteria);

export const generateThreatReport = (options) => 
  threatIntelligence.generateThreatReport(options);

export const getThreatCorrelations = () => 
  Array.from(threatIntelligence.correlations.values());

export const getCampaignAnalysis = (campaignId) => 
  threatIntelligence.getCampaignAnalysis(campaignId);

export const getEngineStatistics = () => 
  threatIntelligence.stats;