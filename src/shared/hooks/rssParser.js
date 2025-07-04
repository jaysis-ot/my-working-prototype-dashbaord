// src/hooks/rssParser.js
/**
 * RSS feed parser for threat intelligence
 */

/**
 * Parse RSS feed from URL
 * @param {string} feedUrl - RSS feed URL
 * @param {Object} options - Parsing options
 * @returns {Promise<Object>} Parsed feed data
 */
export const parseRSSFeed = async (feedUrl, options = {}) => {
  const {
    maxItems = 50,
    processingRules = {},
    timeout = 10000
  } = options;

  try {
    console.log(`Parsing RSS feed: ${feedUrl}`);
    
    // Mock RSS parsing - in production, use a library like rss-parser
    await new Promise(resolve => setTimeout(resolve, 500));

    // Mock feed items
    const items = Array.from({ length: Math.min(maxItems, 10) }, (_, i) => ({
      id: `item_${i + 1}`,
      title: `Security Alert ${i + 1}`,
      description: `Mock security alert description ${i + 1}`,
      link: `${feedUrl}/item/${i + 1}`,
      pubDate: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
      categories: ['security', 'vulnerability'],
      guid: `guid_${i + 1}`,
      
      // Enhanced fields based on processing rules
      ...(processingRules.extractIOCs && {
        extractedIOCs: mockExtractIOCs(`Mock security alert description ${i + 1}`)
      }),
      ...(processingRules.mapToMITRE && {
        mitreTechniques: mockMapToMITRE(`Mock security alert description ${i + 1}`)
      }),
      ...(processingRules.riskAssessment && {
        riskScore: Math.random() * 10,
        severity: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'][Math.floor(Math.random() * 4)]
      })
    }));

    return {
      success: true,
      feedUrl,
      title: `Mock RSS Feed`,
      description: `Mock RSS feed from ${feedUrl}`,
      items,
      totalItems: items.length,
      lastBuildDate: new Date().toISOString(),
      parsedAt: new Date().toISOString()
    };

  } catch (error) {
    console.error(`Failed to parse RSS feed ${feedUrl}:`, error);
    return {
      success: false,
      feedUrl,
      error: error.message,
      items: [],
      totalItems: 0
    };
  }
};

/**
 * Parse multiple RSS feeds in batch
 * @param {Array} feedUrls - Array of RSS feed URLs
 * @param {Object} options - Parsing options
 * @returns {Promise<Array>} Array of parsed feed results
 */
export const parseBatchFeeds = async (feedUrls, options = {}) => {
  const {
    concurrency = 3,
    failFast = false
  } = options;

  try {
    console.log(`Parsing ${feedUrls.length} RSS feeds in batch`);

    const results = [];
    for (let i = 0; i < feedUrls.length; i += concurrency) {
      const batch = feedUrls.slice(i, i + concurrency);
      
      const batchPromises = batch.map(async (feedUrl) => {
        try {
          return await parseRSSFeed(feedUrl, options);
        } catch (error) {
          if (failFast) throw error;
          return {
            success: false,
            feedUrl,
            error: error.message,
            items: []
          };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      if (i + concurrency < feedUrls.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return results;

  } catch (error) {
    console.error('Failed to parse RSS feeds in batch:', error);
    throw error;
  }
};

/**
 * Filter feed items based on criteria
 * @param {Array} items - Feed items
 * @param {Object} filters - Filter criteria
 * @returns {Array} Filtered items
 */
export const filterFeedItems = (items, filters = {}) => {
  const {
    keywords = [],
    excludeKeywords = [],
    categories = [],
    dateRange = null,
    minRiskScore = null,
    maxAge = null // in hours
  } = filters;

  return items.filter(item => {
    // Keyword filtering
    if (keywords.length > 0) {
      const text = `${item.title} ${item.description}`.toLowerCase();
      const hasKeyword = keywords.some(keyword => 
        text.includes(keyword.toLowerCase())
      );
      if (!hasKeyword) return false;
    }

    // Exclude keyword filtering
    if (excludeKeywords.length > 0) {
      const text = `${item.title} ${item.description}`.toLowerCase();
      const hasExcludeKeyword = excludeKeywords.some(keyword => 
        text.includes(keyword.toLowerCase())
      );
      if (hasExcludeKeyword) return false;
    }

    // Category filtering
    if (categories.length > 0 && item.categories) {
      const hasCategory = categories.some(category => 
        item.categories.includes(category)
      );
      if (!hasCategory) return false;
    }

    // Date range filtering
    if (dateRange) {
      const itemDate = new Date(item.pubDate);
      if (itemDate < dateRange.start || itemDate > dateRange.end) {
        return false;
      }
    }

    // Risk score filtering
    if (minRiskScore !== null && item.riskScore !== undefined) {
      if (item.riskScore < minRiskScore) return false;
    }

    // Age filtering
    if (maxAge !== null) {
      const itemAge = (Date.now() - new Date(item.pubDate).getTime()) / (1000 * 60 * 60);
      if (itemAge > maxAge) return false;
    }

    return true;
  });
};

/**
 * Extract IOCs from feed item text
 * @param {string} text - Text to analyze
 * @returns {Array} Extracted IOCs
 */
const mockExtractIOCs = (text) => {
  const iocs = [];
  
  if (Math.random() > 0.5) {
    iocs.push({
      type: 'ip_address',
      value: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      confidence: Math.random() * 100
    });
  }

  if (Math.random() > 0.6) {
    iocs.push({
      type: 'domain',
      value: `malicious${Math.floor(Math.random() * 1000)}.com`,
      confidence: Math.random() * 100
    });
  }

  if (Math.random() > 0.7) {
    iocs.push({
      type: 'file_hash',
      value: Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      confidence: Math.random() * 100
    });
  }

  return iocs;
};

/**
 * Map text to MITRE techniques
 * @param {string} text - Text to analyze
 * @returns {Array} MITRE technique IDs
 */
const mockMapToMITRE = (text) => {
  const techniques = ['T1055', 'T1027', 'T1036', 'T1059', 'T1083'];
  const count = Math.floor(Math.random() * 3) + 1;
  
  return Array.from({ length: count }, () => 
    techniques[Math.floor(Math.random() * techniques.length)]
  ).filter((value, index, self) => self.indexOf(value) === index);
};