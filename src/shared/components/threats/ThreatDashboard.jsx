// src/components/threats/ThreatDashboard.jsx
import React, { useState, useMemo, useReducer, useEffect } from 'react';
import { 
  Shield, AlertTriangle, TrendingUp, Eye, Activity, Target, Network, Globe, 
  Clock, Users, FileText, Filter, Search, Download, RefreshCw, ChevronDown, 
  ChevronRight, Bell, X, Check, ExternalLink, Calendar, MapPin, Zap, Database,
  BarChart3, PieChart, LineChart, Gauge, Settings, Info, CheckCircle, XCircle,
  ArrowRight, ArrowUp, ArrowDown, Hash, Tag, Layers, Brain, Robot
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart as RechartsPieChart, Pie, Cell, LineChart as RechartsLineChart, Line,
  ScatterChart, Scatter, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';

// Mock threat intelligence data for gas company
const generateMockThreats = () => [
  {
    id: 'THR-001',
    title: 'Dragonfly APT Targeting Gas Infrastructure',
    description: 'Russian state-sponsored group Dragonfly (Energetic Bear) conducting reconnaissance against gas pipeline operators using Havex malware and OPC protocol exploitation',
    severity: 'Critical',
    confidence: 'High',
    status: 'Active',
    type: 'APT Campaign',
    category: 'Nation State',
    source: 'NCSC Intelligence',
    published: '2025-06-17',
    lastUpdated: '2025-06-18',
    expiryDate: '2025-12-31',
    likelihood: 85,
    impact: 95,
    riskScore: 25,
    acknowledgment: false,
    dismissed: false,
    tags: ['Dragonfly', 'APT', 'Gas Infrastructure', 'OPC', 'Havex', 'Russia'],
    indicators: ['havex.exe', '192.168.1.100', 'energy-update.com'],
    mitreAttack: {
      tactics: ['Initial Access', 'Execution', 'Discovery', 'Collection'],
      techniques: ['T0865', 'T0871', 'T0888', 'T0861'],
      description: 'Spearphishing attachment leading to OPC exploitation and data collection'
    },
    affectedSectors: ['Energy', 'Utilities', 'Gas Distribution'],
    geoLocations: ['United Kingdom', 'Europe', 'North America'],
    relatedThreats: ['THR-002', 'THR-008'],
    intelligence: {
      campaigns: ['Dragonfly 2.0', 'Crouching Yeti'],
      tools: ['Havex', 'Karagany', 'Heriplor'],
      infrastructure: ['energy-update.com', 'scadahq.com']
    }
  },
  {
    id: 'THR-002',
    title: 'Chinese APT Reconnaissance of Critical Infrastructure',
    description: 'State-aligned Chinese threat actors conducting extensive reconnaissance of UK critical national infrastructure including gas distribution networks',
    severity: 'High',
    confidence: 'Medium',
    status: 'Active',
    type: 'Reconnaissance',
    category: 'Nation State',
    source: 'NCSC Alert',
    published: '2025-06-15',
    lastUpdated: '2025-06-18',
    expiryDate: '2025-09-15',
    likelihood: 70,
    impact: 80,
    riskScore: 18,
    acknowledgment: true,
    dismissed: false,
    tags: ['China', 'APT', 'Reconnaissance', 'Critical Infrastructure'],
    indicators: ['malicious-domain.com', '10.0.0.5', 'recon.ps1'],
    mitreAttack: {
      tactics: ['Reconnaissance', 'Initial Access', 'Discovery'],
      techniques: ['T0888', 'T0865', 'T0842'],
      description: 'Network scanning and vulnerability assessment of OT systems'
    },
    affectedSectors: ['Energy', 'Water', 'Transportation'],
    geoLocations: ['United Kingdom'],
    relatedThreats: ['THR-001'],
    intelligence: {
      campaigns: ['Red Delta', 'Judgment Panda'],
      tools: ['Custom malware', 'Living off the land'],
      infrastructure: ['Various VPS providers']
    }
  },
  {
    id: 'THR-003',
    title: 'Ransomware Campaign Targeting Energy Sector',
    description: 'RansomHub ransomware group specifically targeting energy companies with customized attacks against operational technology systems',
    severity: 'Critical',
    confidence: 'High',
    status: 'Active',
    type: 'Ransomware',
    category: 'Cybercriminal',
    source: 'Commercial Intelligence',
    published: '2025-06-16',
    lastUpdated: '2025-06-18',
    expiryDate: '2025-08-16',
    likelihood: 75,
    impact: 90,
    riskScore: 22,
    acknowledgment: false,
    dismissed: false,
    tags: ['RansomHub', 'Ransomware', 'Energy Sector', 'OT'],
    indicators: ['ransom.exe', 'payment-site.onion', 'encrypt.dll'],
    mitreAttack: {
      tactics: ['Initial Access', 'Execution', 'Impact'],
      techniques: ['T0865', 'T0871', 'T0827', 'T0828'],
      description: 'Email-based initial access followed by OT system encryption'
    },
    affectedSectors: ['Energy', 'Oil & Gas'],
    geoLocations: ['Global'],
    relatedThreats: ['THR-005'],
    intelligence: {
      campaigns: ['RansomHub 2025'],
      tools: ['Custom ransomware', 'Cobalt Strike'],
      infrastructure: ['Tor hidden services', 'Cryptocurrency wallets']
    }
  },
  {
    id: 'THR-004',
    title: 'Supply Chain Compromise - Industrial Software',
    description: 'Suspected compromise of industrial control software used in gas pipeline monitoring systems, potentially affecting multiple operators',
    severity: 'High',
    confidence: 'Medium',
    status: 'Investigating',
    type: 'Supply Chain',
    category: 'Unknown',
    source: 'Industry Alert',
    published: '2025-06-14',
    lastUpdated: '2025-06-17',
    expiryDate: '2025-07-14',
    likelihood: 60,
    impact: 85,
    riskScore: 16,
    acknowledgment: true,
    dismissed: false,
    tags: ['Supply Chain', 'Industrial Software', 'Pipeline Monitoring'],
    indicators: ['update-service.exe', 'industrial-update.com'],
    mitreAttack: {
      tactics: ['Initial Access', 'Persistence'],
      techniques: ['T0862', 'T0874'],
      description: 'Supply chain compromise through software updates'
    },
    affectedSectors: ['Energy', 'Manufacturing'],
    geoLocations: ['Europe', 'North America'],
    relatedThreats: [],
    intelligence: {
      campaigns: ['Unknown'],
      tools: ['Trojanized software'],
      infrastructure: ['Compromised vendor systems']
    }
  },
  {
    id: 'THR-005',
    title: 'Phishing Campaign Targeting Energy Personnel',
    description: 'Sophisticated spear-phishing campaign targeting employees at gas companies with energy-themed lures and credential harvesting',
    severity: 'Medium',
    confidence: 'High',
    status: 'Active',
    type: 'Phishing',
    category: 'Social Engineering',
    source: 'Email Security Provider',
    published: '2025-06-12',
    lastUpdated: '2025-06-18',
    expiryDate: '2025-07-12',
    likelihood: 80,
    impact: 45,
    riskScore: 12,
    acknowledgment: true,
    dismissed: false,
    tags: ['Phishing', 'Credential Harvesting', 'Social Engineering'],
    indicators: ['phishing-site.com', 'energy-alert.pdf', 'login-steal.js'],
    mitreAttack: {
      tactics: ['Initial Access', 'Credential Access'],
      techniques: ['T0865', 'T0884'],
      description: 'Spearphishing with credential harvesting'
    },
    affectedSectors: ['Energy', 'Utilities'],
    geoLocations: ['United Kingdom', 'Europe'],
    relatedThreats: ['THR-003'],
    intelligence: {
      campaigns: ['Energy Harvest 2025'],
      tools: ['Phishing kits', 'Credential stealers'],
      infrastructure: ['Compromised websites', 'Bulletproof hosting']
    }
  }
];

// MITRE ATT&CK for ICS techniques relevant to gas infrastructure
const mitreICSData = [
  { technique: 'T0865', name: 'Spearphishing Attachment', frequency: 15, severity: 'High' },
  { technique: 'T0871', name: 'Execution through API', frequency: 8, severity: 'Critical' },
  { technique: 'T0888', name: 'Remote System Discovery', frequency: 12, severity: 'Medium' },
  { technique: 'T0827', name: 'Loss of View', frequency: 5, severity: 'Critical' },
  { technique: 'T0828', name: 'Loss of Control', frequency: 3, severity: 'Critical' },
  { technique: 'T0842', name: 'Network Sniffing', frequency: 7, severity: 'Medium' },
  { technique: 'T0862', name: 'Supply Chain Compromise', frequency: 4, severity: 'High' },
  { technique: 'T0884', name: 'Connection Proxy', frequency: 6, severity: 'Medium' },
  { technique: 'T0861', name: 'Point & Tag Identification', frequency: 9, severity: 'High' },
  { technique: 'T0874', name: 'Hooking', frequency: 3, severity: 'High' }
];

// Threat actor profiles relevant to energy sector
const threatActorProfiles = [
  {
    id: 'TA-001',
    name: 'Dragonfly (Energetic Bear)',
    aliases: ['TEMP.Isotope', 'Crouching Yeti', 'Group G0035'],
    category: 'Nation State',
    attribution: 'Russia',
    active: true,
    firstSeen: '2011',
    lastActivity: '2025-06-17',
    sophistication: 'High',
    motivation: 'Espionage, Sabotage',
    targets: ['Energy', 'Water', 'Aviation', 'Critical Manufacturing'],
    geography: ['United States', 'Europe', 'Turkey'],
    techniques: ['T0865', 'T0871', 'T0888', 'T0861'],
    tools: ['Havex', 'Karagany', 'Heriplor', 'Goodor'],
    description: 'Russian state-sponsored group focused on energy sector espionage and potential sabotage operations'
  },
  {
    id: 'TA-002',
    name: 'APT33 (Elfin)',
    aliases: ['HOLMIUM', 'Peach Sandstorm'],
    category: 'Nation State',
    attribution: 'Iran',
    active: true,
    firstSeen: '2013',
    lastActivity: '2025-06-10',
    sophistication: 'High',
    motivation: 'Espionage',
    targets: ['Energy', 'Aerospace', 'Government'],
    geography: ['United States', 'Saudi Arabia', 'South Korea'],
    techniques: ['T0865', 'T0842', 'T0888'],
    tools: ['TURNEDUP', 'NANOCORE', 'Custom malware'],
    description: 'Iranian threat group targeting energy and aviation sectors for intelligence collection'
  },
  {
    id: 'TA-003',
    name: 'RansomHub',
    aliases: ['RansomHub Group'],
    category: 'Cybercriminal',
    attribution: 'Unknown',
    active: true,
    firstSeen: '2024',
    lastActivity: '2025-06-16',
    sophistication: 'Medium',
    motivation: 'Financial',
    targets: ['Energy', 'Healthcare', 'Manufacturing'],
    geography: ['Global'],
    techniques: ['T0865', 'T0827', 'T0828'],
    tools: ['RansomHub ransomware', 'Cobalt Strike'],
    description: 'Ransomware-as-a-Service group specifically targeting critical infrastructure'
  }
];

// Recent incidents affecting similar organizations
const recentIncidents = [
  {
    id: 'INC-001',
    date: '2025-06-15',
    title: 'Gas Distribution Network Disrupted by Cyberattack',
    organization: 'European Gas Operator',
    sector: 'Energy',
    country: 'Germany',
    impact: 'Operational disruption for 6 hours',
    attackVector: 'Ransomware via phishing',
    attribution: 'Suspected cybercriminal group',
    techniques: ['T0865', 'T0827'],
    learnings: 'Importance of network segmentation and backup systems'
  },
  {
    id: 'INC-002',
    date: '2025-06-10',
    title: 'State-Sponsored Reconnaissance of Pipeline Infrastructure',
    organization: 'Major Pipeline Operator',
    sector: 'Energy',
    country: 'United States',
    impact: 'No operational impact, data potentially compromised',
    attackVector: 'Spear-phishing and lateral movement',
    attribution: 'Nation-state actor',
    techniques: ['T0865', 'T0888', 'T0842'],
    learnings: 'Enhanced monitoring and threat hunting capabilities needed'
  },
  {
    id: 'INC-003',
    date: '2025-06-05',
    title: 'Supply Chain Compromise Affects Multiple Energy Companies',
    organization: 'Industrial Software Vendor',
    sector: 'Energy Technology',
    country: 'Netherlands',
    impact: 'Potential backdoor in monitoring software',
    attackVector: 'Software supply chain compromise',
    attribution: 'Unknown',
    techniques: ['T0862', 'T0874'],
    learnings: 'Vendor security assessment and software integrity verification critical'
  }
];

// Dashboard state reducer
const dashboardReducer = (state, action) => {
  switch (action.type) {
    case 'SET_THREATS':
      return { ...state, threats: action.payload };
    case 'SET_FILTER':
      return { ...state, filters: { ...state.filters, [action.key]: action.value } };
    case 'SET_INFO_DENSITY':
      return { ...state, infoDensity: action.payload };
    case 'SET_ACTIVE_WIDGETS':
      return { ...state, activeWidgets: action.payload };
    case 'ACKNOWLEDGE_THREAT':
      return {
        ...state,
        threats: state.threats.map(threat =>
          threat.id === action.payload ? { ...threat, acknowledgment: true } : threat
        )
      };
    case 'DISMISS_THREAT':
      return {
        ...state,
        threats: state.threats.map(threat =>
          threat.id === action.payload ? { ...threat, dismissed: true } : threat
        )
      };
    case 'SET_SELECTED_THREAT':
      return { ...state, selectedThreat: action.payload };
    case 'TOGGLE_WIDGET':
      return {
        ...state,
        activeWidgets: state.activeWidgets.includes(action.payload)
          ? state.activeWidgets.filter(w => w !== action.payload)
          : [...state.activeWidgets, action.payload]
      };
    default:
      return state;
  }
};

const ThreatDashboard = ({ 
  companyProfile, 
  capabilities = [], 
  onCreateRisk, 
  onCreateRequirement,
  informationDensity = 'detailed' 
}) => {
  // State management
  const [state, dispatch] = useReducer(dashboardReducer, {
    threats: generateMockThreats(),
    filters: {
      severity: 'All',
      status: 'All',
      category: 'All',
      source: 'All',
      search: '',
      acknowledged: 'All',
      dateRange: 'Last 30 days'
    },
    infoDensity: informationDensity,
    activeWidgets: [
      'threatLevel', 'severityDistribution', 'mitreHeatmap', 
      'threatActors', 'recentIncidents', 'industryThreats'
    ],
    selectedThreat: null
  });

  const [showThreatDetails, setShowThreatDetails] = useState(false);
  const [showMitreDetails, setShowMitreDetails] = useState(false);
  const [loading, setLoading] = useState(false);

  // Computed values
  const filteredThreats = useMemo(() => {
    return state.threats.filter(threat => {
      // Apply filters
      if (state.filters.severity !== 'All' && threat.severity !== state.filters.severity) return false;
      if (state.filters.status !== 'All' && threat.status !== state.filters.status) return false;
      if (state.filters.category !== 'All' && threat.category !== state.filters.category) return false;
      if (state.filters.source !== 'All' && threat.source !== state.filters.source) return false;
      if (state.filters.acknowledged !== 'All') {
        if (state.filters.acknowledged === 'Yes' && !threat.acknowledgment) return false;
        if (state.filters.acknowledged === 'No' && threat.acknowledgment) return false;
      }
      
      // Search filter
      if (state.filters.search) {
        const searchLower = state.filters.search.toLowerCase();
        const searchableText = [
          threat.title,
          threat.description,
          ...threat.tags,
          threat.category,
          threat.source
        ].join(' ').toLowerCase();
        if (!searchableText.includes(searchLower)) return false;
      }

      // Date range filter
      if (state.filters.dateRange !== 'All') {
        const threatDate = new Date(threat.published);
        const now = new Date();
        const daysDiff = (now - threatDate) / (1000 * 60 * 60 * 24);
        
        switch (state.filters.dateRange) {
          case 'Last 7 days':
            if (daysDiff > 7) return false;
            break;
          case 'Last 30 days':
            if (daysDiff > 30) return false;
            break;
          case 'Last 90 days':
            if (daysDiff > 90) return false;
            break;
        }
      }

      return true;
    });
  }, [state.threats, state.filters]);

  const threatMetrics = useMemo(() => {
    const total = filteredThreats.length;
    const critical = filteredThreats.filter(t => t.severity === 'Critical').length;
    const high = filteredThreats.filter(t => t.severity === 'High').length;
    const active = filteredThreats.filter(t => t.status === 'Active').length;
    const unacknowledged = filteredThreats.filter(t => !t.acknowledgment && !t.dismissed).length;

    const severityDistribution = [
      { name: 'Critical', value: critical, color: '#dc2626' },
      { name: 'High', value: high, color: '#ea580c' },
      { name: 'Medium', value: filteredThreats.filter(t => t.severity === 'Medium').length, color: '#d97706' },
      { name: 'Low', value: filteredThreats.filter(t => t.severity === 'Low').length, color: '#65a30d' }
    ];

    const categoryDistribution = [
      { name: 'Nation State', value: filteredThreats.filter(t => t.category === 'Nation State').length },
      { name: 'Cybercriminal', value: filteredThreats.filter(t => t.category === 'Cybercriminal').length },
      { name: 'Social Engineering', value: filteredThreats.filter(t => t.category === 'Social Engineering').length },
      { name: 'Unknown', value: filteredThreats.filter(t => t.category === 'Unknown').length }
    ];

    return {
      total,
      critical,
      high,
      active,
      unacknowledged,
      severityDistribution,
      categoryDistribution
    };
  }, [filteredThreats]);

  // Event handlers
  const handleAcknowledgeThreat = useCallback((threatId) => {
    dispatch({ type: 'ACKNOWLEDGE_THREAT', payload: threatId });
  }, []);

  const handleDismissThreat = useCallback((threatId) => {
    dispatch({ type: 'DISMISS_THREAT', payload: threatId });
  }, []);

  const handleCreateRiskFromThreat = useCallback((threat) => {
    if (onCreateRisk) {
      onCreateRisk({
        title: `Risk from ${threat.title}`,
        description: threat.description,
        severity: threat.severity,
        category: threat.type,
        source: 'Threat Intelligence',
        threatId: threat.id,
        likelihood: threat.likelihood,
        impact: threat.impact,
        tags: threat.tags
      });
    }
  }, [onCreateRisk]);

  // Render components based on information density
  const renderWidgetContainer = (title, children, widgetId) => {
    if (!state.activeWidgets.includes(widgetId)) return null;

    const densityClass = state.infoDensity === 'basic' ? 'p-4' : 
                        state.infoDensity === 'detailed' ? 'p-6' : 'p-6';

    return (
      <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${densityClass}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button
            onClick={() => dispatch({ type: 'TOGGLE_WIDGET', payload: widgetId })}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        {children}
      </div>
    );
  };

  const renderThreatLevelWidget = () => {
    const getOverallThreatLevel = () => {
      if (threatMetrics.critical > 5) return { level: 'Critical', color: 'red', description: 'Immediate action required' };
      if (threatMetrics.critical > 0 || threatMetrics.high > 10) return { level: 'High', color: 'orange', description: 'Enhanced monitoring required' };
      if (threatMetrics.high > 0) return { level: 'Medium', color: 'yellow', description: 'Standard monitoring' };
      return { level: 'Low', color: 'green', description: 'Routine monitoring' };
    };

    const threatLevel = getOverallThreatLevel();

    return renderWidgetContainer(
      'Current Threat Level',
      <div className="text-center">
        <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full bg-${threatLevel.color}-100 mb-4`}>
          <Shield className={`w-12 h-12 text-${threatLevel.color}-600`} />
        </div>
        <h4 className={`text-2xl font-bold text-${threatLevel.color}-600 mb-2`}>{threatLevel.level}</h4>
        <p className="text-gray-600 mb-4">{threatLevel.description}</p>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{threatMetrics.critical}</div>
            <div className="text-gray-500">Critical</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{threatMetrics.unacknowledged}</div>
            <div className="text-gray-500">New</div>
          </div>
        </div>
      </div>,
      'threatLevel'
    );
  };

  const renderSeverityDistribution = () => {
    return renderWidgetContainer(
      'Threat Severity Distribution',
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsPieChart>
            <Pie
              data={threatMetrics.severityDistribution}
              cx="50%"
              cy="50%"
              outerRadius={80}
              dataKey="value"
              label={({ name, value }) => `${name}: ${value}`}
            >
              {threatMetrics.severityDistribution.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </RechartsPieChart>
        </ResponsiveContainer>
      </div>,
      'severityDistribution'
    );
  };

  const renderMitreHeatmap = () => {
    const getIntensityColor = (frequency) => {
      if (frequency >= 12) return 'bg-red-600';
      if (frequency >= 8) return 'bg-red-400';
      if (frequency >= 5) return 'bg-orange-400';
      if (frequency >= 3) return 'bg-yellow-400';
      return 'bg-green-400';
    };

    return renderWidgetContainer(
      'MITRE ATT&CK Technique Heatmap',
      <div className="space-y-2">
        {state.infoDensity === 'basic' ? (
          <div className="text-center text-gray-500">
            <BarChart3 className="w-12 h-12 mx-auto mb-2" />
            <p>MITRE techniques tracking</p>
            <p className="text-sm">{mitreICSData.length} techniques monitored</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {mitreICSData.map(technique => (
                <div
                  key={technique.technique}
                  className={`p-2 rounded text-white text-xs cursor-pointer hover:opacity-80 ${getIntensityColor(technique.frequency)}`}
                  title={`${technique.name} - Frequency: ${technique.frequency}`}
                >
                  <div className="font-mono">{technique.technique}</div>
                  <div className="truncate">{technique.name}</div>
                  <div className="text-xs opacity-75">{technique.frequency} events</div>
                </div>
              ))}
            </div>
            {state.infoDensity === 'comprehensive' && (
              <div className="mt-4 p-3 bg-gray-50 rounded">
                <div className="flex items-center justify-between text-sm">
                  <span>Legend:</span>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      <div className="w-3 h-3 bg-red-600 rounded"></div>
                      <span>Very High (12+)</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-3 h-3 bg-orange-400 rounded"></div>
                      <span>High (5-11)</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-3 h-3 bg-yellow-400 rounded"></div>
                      <span>Medium (3-4)</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-3 h-3 bg-green-400 rounded"></div>
                      <span>Low (1-2)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>,
      'mitreHeatmap'
    );
  };

  const renderThreatActors = () => {
    return renderWidgetContainer(
      'Active Threat Actors',
      <div className="space-y-3">
        {threatActorProfiles.slice(0, state.infoDensity === 'basic' ? 2 : 3).map(actor => (
          <div key={actor.id} className="p-3 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-gray-900">{actor.name}</h4>
              <span className={`px-2 py-1 text-xs rounded-full ${
                actor.category === 'Nation State' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'
              }`}>
                {actor.category}
              </span>
            </div>
            {state.infoDensity !== 'basic' && (
              <>
                <p className="text-sm text-gray-600 mb-2">{actor.description}</p>
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span className="flex items-center">
                    <MapPin className="w-3 h-3 mr-1" />
                    {actor.attribution}
                  </span>
                  <span className="flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    Last seen: {actor.lastActivity}
                  </span>
                  <span className="flex items-center">
                    <Target className="w-3 h-3 mr-1" />
                    {actor.techniques.length} techniques
                  </span>
                </div>
                {state.infoDensity === 'comprehensive' && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {actor.tools.slice(0, 3).map(tool => (
                      <span key={tool} className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                        {tool}
                      </span>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>,
      'threatActors'
    );
  };

  const renderRecentIncidents = () => {
    return renderWidgetContainer(
      'Recent Incidents',
      <div className="space-y-3">
        {recentIncidents.slice(0, state.infoDensity === 'basic' ? 2 : 3).map(incident => (
          <div key={incident.id} className="p-3 border-l-4 border-red-400 bg-red-50">
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-medium text-gray-900">{incident.title}</h4>
              <span className="text-xs text-gray-500">{incident.date}</span>
            </div>
            {state.infoDensity !== 'basic' && (
              <>
                <p className="text-sm text-gray-600 mb-2">{incident.impact}</p>
                <div className="flex items-center space-x-3 text-xs text-gray-500">
                  <span>{incident.country}</span>
                  <span>•</span>
                  <span>{incident.attackVector}</span>
                  {state.infoDensity === 'comprehensive' && (
                    <>
                      <span>•</span>
                      <span>{incident.techniques.join(', ')}</span>
                    </>
                  )}
                </div>
                {state.infoDensity === 'comprehensive' && (
                  <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
                    <strong>Learning:</strong> {incident.learnings}
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>,
      'recentIncidents'
    );
  };

  const renderThreatCard = (threat) => {
    const getSeverityColor = (severity) => {
      switch (severity) {
        case 'Critical': return 'red';
        case 'High': return 'orange';
        case 'Medium': return 'yellow';
        case 'Low': return 'green';
        default: return 'gray';
      }
    };

    const getStatusColor = (status) => {
      switch (status) {
        case 'Active': return 'red';
        case 'Investigating': return 'yellow';
        case 'Mitigated': return 'green';
        default: return 'gray';
      }
    };

    return (
      <div key={threat.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="font-semibold text-gray-900">{threat.title}</h3>
              <span className={`px-2 py-1 text-xs rounded-full bg-${getSeverityColor(threat.severity)}-100 text-${getSeverityColor(threat.severity)}-800`}>
                {threat.severity}
              </span>
              <span className={`px-2 py-1 text-xs rounded-full bg-${getStatusColor(threat.status)}-100 text-${getStatusColor(threat.status)}-800`}>
                {threat.status}
              </span>
              {threat.acknowledgment && (
                <CheckCircle className="w-4 h-4 text-green-600" title="Acknowledged" />
              )}
              {threat.dismissed && (
                <XCircle className="w-4 h-4 text-gray-400" title="Dismissed" />
              )}
            </div>
            <p className="text-sm text-gray-600 mb-2">{threat.description}</p>
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <span className="flex items-center"><Calendar className="w-3 h-3 mr-1" />{threat.published}</span>
              <span className="flex items-center"><Globe className="w-3 h-3 mr-1" />{threat.source}</span>
              <span className="flex items-center"><Target className="w-3 h-3 mr-1" />Risk: {threat.riskScore}</span>
              <span className="flex items-center"><Activity className="w-3 h-3 mr-1" />Confidence: {threat.confidence}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {!threat.acknowledgment && !threat.dismissed && (
              <button
                onClick={() => handleAcknowledgeThreat(threat.id)}
                className="p-1 hover:bg-green-100 rounded text-green-600"
                title="Acknowledge threat"
              >
                <Check className="w-4 h-4" />
              </button>
            )}
            {!threat.dismissed && (
              <button
                onClick={() => handleDismissThreat(threat.id)}
                className="p-1 hover:bg-gray-100 rounded text-gray-400"
                title="Dismiss threat"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <div className="relative group">
              <button className="p-1 hover:bg-gray-100 rounded">
                <ChevronDown className="w-4 h-4" />
              </button>
              <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                <button
                  onClick={() => {
                    dispatch({ type: 'SET_SELECTED_THREAT', payload: threat });
                    setShowThreatDetails(true);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                >
                  View Details
                </button>
                {onCreateRisk && (
                  <button
                    onClick={() => handleCreateRiskFromThreat(threat)}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                  >
                    Create Risk
                  </button>
                )}
                {onCreateRequirement && (
                  <button
                    onClick={() => onCreateRequirement({
                      title: `Mitigate: ${threat.title}`,
                      description: `Security control to address threat: ${threat.description}`,
                      priority: threat.severity,
                      category: 'Threat Mitigation',
                      sourceType: 'Threat Intelligence',
                      sourceId: threat.id
                    })}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                  >
                    Create Requirement
                  </button>
                )}
                <button
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                >
                  Export IOCs
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tags */}
        {threat.tags && threat.tags.length > 0 && state.infoDensity !== 'basic' && (
          <div className="flex flex-wrap gap-1 mb-2">
            {threat.tags.slice(0, state.infoDensity === 'detailed' ? 5 : 10).map(tag => (
              <span key={tag} className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* MITRE ATT&CK techniques */}
        {threat.mitreAttack && state.infoDensity === 'comprehensive' && (
          <div className="mt-2 p-2 bg-blue-50 rounded">
            <div className="text-xs font-medium text-blue-800 mb-1">MITRE ATT&CK</div>
            <div className="flex flex-wrap gap-1">
              {threat.mitreAttack.techniques.map(technique => (
                <span key={technique} className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded font-mono">
                  {technique}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Main render
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Threat Intelligence Dashboard</h1>
          <p className="text-gray-600">
            Real-time threat monitoring and analysis for {companyProfile?.industry || 'your organization'}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Info Level:</label>
            <select
              value={state.infoDensity}
              onChange={(e) => dispatch({ type: 'SET_INFO_DENSITY', payload: e.target.value })}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="basic">Basic</option>
              <option value="detailed">Detailed</option>
              <option value="comprehensive">Comprehensive</option>
            </select>
          </div>
          <button className="flex items-center px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
          <button 
            onClick={() => setLoading(true)}
            className="flex items-center px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Dashboard Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {renderThreatLevelWidget()}
          {renderSeverityDistribution()}
        </div>

        {/* Middle Column */}
        <div className="space-y-6">
          {renderMitreHeatmap()}
          {renderThreatActors()}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {renderRecentIncidents()}
          {renderWidgetContainer(
            'Industry Intelligence',
            <div className="text-center text-gray-500">
              <Globe className="w-12 h-12 mx-auto mb-2" />
              <p>Gas sector threats</p>
              <p className="text-sm">{companyProfile?.industry || 'Energy'} focused intelligence</p>
            </div>,
            'industryThreats'
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={state.filters.search}
                onChange={(e) => dispatch({ type: 'SET_FILTER', key: 'search', value: e.target.value })}
                placeholder="Search threats..."
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {['severity', 'status', 'category', 'source', 'acknowledged', 'dateRange'].map(filterKey => (
            <div key={filterKey}>
              <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                {filterKey === 'dateRange' ? 'Date Range' : filterKey}
              </label>
              <select
                value={state.filters[filterKey]}
                onChange={(e) => dispatch({ type: 'SET_FILTER', key: filterKey, value: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All {filterKey}</option>
                {filterKey === 'severity' && ['Critical', 'High', 'Medium', 'Low'].map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
                {filterKey === 'status' && ['Active', 'Investigating', 'Mitigated'].map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
                {filterKey === 'category' && ['Nation State', 'Cybercriminal', 'Social Engineering', 'Unknown'].map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
                {filterKey === 'source' && ['NCSC Intelligence', 'NCSC Alert', 'Commercial Intelligence', 'Industry Alert', 'Email Security Provider'].map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
                {filterKey === 'acknowledged' && ['Yes', 'No'].map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
                {filterKey === 'dateRange' && ['Last 7 days', 'Last 30 days', 'Last 90 days'].map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          ))}

          <div>
            <button
              onClick={() => dispatch({ type: 'SET_FILTER', key: 'search', value: '' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Threat List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Current Threats ({filteredThreats.length})
          </h2>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span>{threatMetrics.unacknowledged} unacknowledged</span>
            <span>•</span>
            <span>{threatMetrics.critical} critical</span>
          </div>
        </div>

        {filteredThreats.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Shield className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No threats found matching your criteria.</p>
          </div>
        ) : (
          filteredThreats.map(renderThreatCard)
        )}
      </div>

      {/* Threat Details Modal */}
      {showThreatDetails && state.selectedThreat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">{state.selectedThreat.title}</h2>
              <button 
                onClick={() => setShowThreatDetails(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Threat Details</h3>
                <p className="text-gray-600 mb-4">{state.selectedThreat.description}</p>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">Severity:</span>
                    <span className={`px-2 py-1 rounded text-xs bg-${getSeverityColor(state.selectedThreat.severity)}-100 text-${getSeverityColor(state.selectedThreat.severity)}-800`}>
                      {state.selectedThreat.severity}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Category:</span>
                    <span>{state.selectedThreat.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Source:</span>
                    <span>{state.selectedThreat.source}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Published:</span>
                    <span>{state.selectedThreat.published}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Risk Score:</span>
                    <span className="font-mono">{state.selectedThreat.riskScore}/25</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">MITRE ATT&CK Mapping</h3>
                {state.selectedThreat.mitreAttack && (
                  <div className="space-y-2">
                    <div>
                      <span className="font-medium text-sm">Tactics:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {state.selectedThreat.mitreAttack.tactics.map(tactic => (
                          <span key={tactic} className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
                            {tactic}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-sm">Techniques:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {state.selectedThreat.mitreAttack.techniques.map(technique => (
                          <span key={technique} className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded font-mono">
                            {technique}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <h3 className="font-semibold mb-2 mt-4">Indicators of Compromise</h3>
                <div className="space-y-1">
                  {state.selectedThreat.indicators.map(indicator => (
                    <div key={indicator} className="font-mono text-sm bg-gray-100 p-2 rounded">
                      {indicator}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              {onCreateRisk && (
                <button
                  onClick={() => {
                    handleCreateRiskFromThreat(state.selectedThreat);
                    setShowThreatDetails(false);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Create Risk
                </button>
              )}
              <button
                onClick={() => setShowThreatDetails(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function (define outside component to avoid re-creation)
const getSeverityColor = (severity) => {
  switch (severity) {
    case 'Critical': return 'red';
    case 'High': return 'orange';
    case 'Medium': return 'yellow';
    case 'Low': return 'green';
    default: return 'gray';
  }
};

export default ThreatDashboard;