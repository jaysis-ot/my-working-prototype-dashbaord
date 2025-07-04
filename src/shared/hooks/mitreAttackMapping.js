// src/hooks/mitreAttackMapping.js
/**
 * MITRE ATT&CK mapping utilities
 */

/**
 * Map threat description to MITRE techniques
 * @param {string} description - Threat description
 * @param {Array} iocs - Indicators of compromise
 * @param {string} framework - Framework type (enterprise, mobile, ics)
 * @returns {Array} Array of mapped MITRE techniques
 */
export const mapThreatToMitre = (description, iocs = [], framework = 'enterprise') => {
  try {
    const mappedTechniques = [];
    const descriptionLower = description.toLowerCase();

    // Simple keyword-based mapping
    const techniqueKeywords = {
      'T1055': ['process injection', 'dll injection', 'code injection'],
      'T1027': ['obfuscated files', 'obfuscation', 'encoded', 'packed'],
      'T1036': ['masquerading', 'legitimate files', 'trusted process'],
      'T1059': ['command line', 'script', 'powershell', 'cmd'],
      'T1083': ['file discovery', 'enumerate files', 'file listing'],
      'T1087': ['account discovery', 'user enumeration', 'list users'],
      'T1135': ['network share discovery', 'shared drives', 'network shares'],
      'T1016': ['network configuration', 'network discovery', 'ipconfig'],
      'T1082': ['system information', 'system discovery', 'hostname'],
      'T1049': ['system network connections', 'netstat', 'network connections']
    };

    // Check description for technique indicators
    for (const [techniqueId, keywords] of Object.entries(techniqueKeywords)) {
      const hasKeyword = keywords.some(keyword => descriptionLower.includes(keyword));
      if (hasKeyword) {
        mappedTechniques.push({
          id: techniqueId,
          confidence: 0.7,
          source: 'keyword_mapping',
          keywords: keywords.filter(keyword => descriptionLower.includes(keyword))
        });
      }
    }

    // Check IOCs for additional techniques
    if (iocs && iocs.length > 0) {
      // File hashes might indicate T1027 (Obfuscated Files)
      const hasFileHashes = iocs.some(ioc => 
        ioc.type === 'file_hash' || (typeof ioc === 'string' && /^[a-fA-F0-9]{32,64}$/.test(ioc))
      );
      if (hasFileHashes && !mappedTechniques.some(t => t.id === 'T1027')) {
        mappedTechniques.push({
          id: 'T1027',
          confidence: 0.5,
          source: 'ioc_analysis',
          reasoning: 'File hashes present, potential obfuscation'
        });
      }

      // IP addresses might indicate T1071 (Application Layer Protocol)
      const hasIPs = iocs.some(ioc => 
        ioc.type === 'ip_address' || (typeof ioc === 'string' && /^\d+\.\d+\.\d+\.\d+$/.test(ioc))
      );
      if (hasIPs && !mappedTechniques.some(t => t.id === 'T1071')) {
        mappedTechniques.push({
          id: 'T1071',
          confidence: 0.6,
          source: 'ioc_analysis',
          reasoning: 'IP addresses present, potential C2 communication'
        });
      }

      // URLs might indicate T1105 (Ingress Tool Transfer)
      const hasURLs = iocs.some(ioc => 
        ioc.type === 'url' || (typeof ioc === 'string' && /^https?:\/\//.test(ioc))
      );
      if (hasURLs && !mappedTechniques.some(t => t.id === 'T1105')) {
        mappedTechniques.push({
          id: 'T1105',
          confidence: 0.6,
          source: 'ioc_analysis',
          reasoning: 'URLs present, potential tool transfer'
        });
      }
    }

    return mappedTechniques;
  } catch (error) {
    console.error('Error mapping threat to MITRE:', error);
    return [];
  }
};

/**
 * Analyze threat actor match against MITRE groups
 * @param {string} actorName - Threat actor name
 * @returns {Promise<Object>} Actor match analysis
 */
export const analyzeThreatActorMatch = async (actorName) => {
  try {
    // Mock threat actor database
    const knownActors = {
      'apt1': {
        name: 'APT1',
        aliases: ['Comment Crew', 'PLA Unit 61398'],
        confidence: 0.95,
        techniques: ['T1055', 'T1027', 'T1059'],
        software: ['S0001', 'S0002'],
        campaigns: ['C0001', 'C0002']
      },
      'lazarus': {
        name: 'Lazarus Group',
        aliases: ['Hidden Cobra', 'Guardians of Peace'],
        confidence: 0.90,
        techniques: ['T1055', 'T1027', 'T1036', 'T1059'],
        software: ['S0003', 'S0004'],
        campaigns: ['C0003', 'C0004']
      },
      'carbanak': {
        name: 'Carbanak',
        aliases: ['Anunak', 'FIN7'],
        confidence: 0.85,
        techniques: ['T1055', 'T1083', 'T1087'],
        software: ['S0005', 'S0006'],
        campaigns: ['C0005']
      }
    };

    const actorKey = actorName.toLowerCase();
    
    // Direct match
    if (knownActors[actorKey]) {
      return knownActors[actorKey];
    }

    // Fuzzy match by aliases
    for (const [key, actor] of Object.entries(knownActors)) {
      const aliasMatch = actor.aliases.some(alias => 
        alias.toLowerCase().includes(actorKey) || actorKey.includes(alias.toLowerCase())
      );
      
      if (aliasMatch) {
        return {
          ...actor,
          confidence: actor.confidence * 0.8,
          matchType: 'alias'
        };
      }
    }

    // No match found
    return {
      name: actorName,
      aliases: [],
      confidence: 0,
      techniques: [],
      software: [],
      campaigns: [],
      matchType: 'unknown'
    };

  } catch (error) {
    console.error('Error analyzing threat actor match:', error);
    return {
      name: actorName,
      confidence: 0,
      error: error.message
    };
  }
};