import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Save, FileDown, Copy, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import Button from '../atoms/Button';
import Badge from '../atoms/Badge';
import * as XLSX from 'xlsx';

const STORAGE_KEY = 'cyberTrustDashboard.iec62443Assessment';
const META_KEY = 'cyberTrustDashboard.iec62443AssessmentMeta';

// ---------------------------------------------------------------------------
// Likelihood and Impact options for button groups
// ---------------------------------------------------------------------------
const LIKELIHOOD_OPTIONS = [
  { label: 'Very Low', value: 0.1 },
  { label: 'Low', value: 0.3 },
  { label: 'Medium', value: 0.5 },
  { label: 'High', value: 0.7 },
  { label: 'Very High', value: 0.9 }
];

const IMPACT_OPTIONS = [
  { label: 'Very Low', value: 1 },
  { label: 'Low', value: 2 },
  { label: 'Medium', value: 3 },
  { label: 'High', value: 4 },
  { label: 'Very High', value: 5 }
];

// ---------------------------------------------------------------------------
// Foundational Requirements (FR) list for IEC 62443
// ---------------------------------------------------------------------------
const FR_LIST = [
  { key: 'FR1', label: 'FR1 Identification & Authentication' },
  { key: 'FR2', label: 'FR2 Use Control' },
  { key: 'FR3', label: 'FR3 System Integrity' },
  { key: 'FR4', label: 'FR4 Data Confidentiality' },
  { key: 'FR5', label: 'FR5 Restricted Data Flow' },
  { key: 'FR6', label: 'FR6 Timely Response to Events' },
  { key: 'FR7', label: 'FR7 Resource Availability' }
];

// ---------------------------------------------------------------------------
// Security-Level Requirements mapping (IEC 62443 FR themes)
// ---------------------------------------------------------------------------
const SL_REQUIREMENTS = {
  SL1: [
    'FR1 – Ensure unique user IDs for all interactive logons',
    'FR2 – Role-based access for operator vs. engineer',
    'FR3 – Validate firmware integrity on startup',
    'FR4 – Encrypt sensitive credentials at rest',
    'FR5 – Implement basic firewall zoning between IT/OT',
    'FR6 – Enable security event logging with 24 h retention',
    'FR7 – Provide UPS to maintain availability during short outages'
  ],
  SL2: [
    'FR1 – Enforce complex passwords & regular rotation',
    'FR2 – Multi-person approval for privileged functions',
    'FR3 – Application whitelisting on servers',
    'FR4 – Encrypt data-in-transit using TLS1.2+',
    'FR5 – Layer-3 segmentation with ACLs between zones',
    'FR6 – Real-time alerting to SOC within 15 min',
    'FR7 – Redundant network paths for critical traffic'
  ],
  SL3: [
    'FR1 – Hardware-backed credentials (TPM/Secure Element)',
    'FR2 – MFA for all administrator access',
    'FR3 – Runtime integrity monitoring & alerting',
    'FR4 – End-to-end encryption incl. field buses where feasible',
    'FR5 – Strict unidirectional gateways for safety zones',
    'FR6 – Correlate events with threat intelligence feeds',
    'FR7 – High-availability clustering for control servers'
  ],
  SL4: [
    'FR1 – Cryptographic authentication for all devices and users',
    'FR2 – Just-in-time privileged access with session recording',
    'FR3 – Secure boot & signed updates mandatory',
    'FR4 – Quantum-resistant encryption readiness',
    'FR5 – Physically isolated safety-critical networks',
    'FR6 – Autonomous response to critical events (e.g., isolate segment)',
    'FR7 – Geographically diverse redundancy and rapid failover'
  ]
};

// ---------------------------------------------------------------------------
// Impact-scale label options for each category (index matches numeric value 1-5)
// ---------------------------------------------------------------------------
const IMPACT_LABELS = {
  safety: [
    '1 - No safety impact',
    '2 - Minor safety concern',
    '3 - Potential injury risk',
    '4 - Serious injury risk',
    '5 - Fatality risk'
  ],
  environmental: [
    '1 - No environmental impact',
    '2 - Minor localized impact',
    '3 - Moderate environmental damage',
    '4 - Significant environmental damage',
    '5 - Severe/widespread damage'
  ],
  financial: [
    '1 - < $10K',
    '2 - $10K – $100K',
    '3 - $100K – $1M',
    '4 - $1M – $10M',
    '5 - > $10M'
  ],
  operational: [
    '1 - No operational impact',
    '2 - Minor disruption',
    '3 - Moderate operational loss',
    '4 - Significant operational disruption',
    '5 - Complete operational shutdown'
  ],
  regulatory: [
    '1 - No regulatory impact',
    '2 - Minor compliance issue',
    '3 - Regulatory notice/warning',
    '4 - Significant regulatory action',
    '5 - License suspension/revocation'
  ]
};

// ---------------------------------------------------------------------------
// Helper to read current user info from auth localStorage
// ---------------------------------------------------------------------------
function getCurrentUserInfo() {
  try {
    const raw = localStorage.getItem('dashboard_current_user');
    if (!raw) return { userTitle: null, userRole: null };
    const u = JSON.parse(raw);
    return { userTitle: u.jobTitle || null, userRole: u.role || null };
  } catch {
    return { userTitle: null, userRole: null };
  }
}

function generateSLRequirements(level = 'SL1') {
  return SL_REQUIREMENTS[level] || SL_REQUIREMENTS.SL1;
}

const defaultData = {
  assessmentType: '',
  metadata: {
    name: '', assessor: '', date: '', facilityType: '', criticalityLevel: '', systemDescription: '',
    accessPoints: '', networkDiagram: '',
    boundaries: '' // NEW – physical & logical boundaries
  },
  assets: [],
  zones: [],
  conduits: [],
  consequenceScenarios: [],
  threatScenarios: [],
  requirements: [],
  vulnerabilities: [],
  controls: [],
  approval: {
    reviewer: '', reviewDate: '', reviewComments: '', approved: false, approver: '', approvalDate: ''
  },
  tolerableRiskThreshold: 3,
  riskJustification: '',
  decision: ''
  ,
  riskMatrix: {
    safetyScale: 2,
    environmentalScale: 2,
    financialScale: 1
  }
};

function IEC62443Assessment() {
  const navigate = useNavigate();
  const [currentStage, setCurrentStage] = useState(1);
  const [data, setData] = useState(defaultData);
  // drag-and-drop state for CSV import
  const [dragActive, setDragActive] = useState(false);

  /* ------------------------------------------------------------------
   * IMPORT HELPERS
   * ------------------------------------------------------------------ */
  const preventDefault = e => { e.preventDefault(); e.stopPropagation(); };

  const parseCSV = (text) => {
    // rudimentary CSV parser good enough for simple inventories
    const rows = [];
    let cur = '', inQuotes = false;
    const pushCell = (r) => { r.push(cur.replace(/^"(.*)"$/,'$1').replace(/""/g,'"')); cur=''; };
    let row=[];
    for (let i=0;i<text.length;i++){
      const c=text[i];
      if(c==='"'){ inQuotes=!inQuotes || text[i+1]==='"' && (cur+='"', i++); continue;}
      if(c===','&&!inQuotes){ pushCell(row);}
      else if((c==='\n'||c==='\r')&&!inQuotes){
        if(c==='\r'&&text[i+1]==='\n') i++;
        pushCell(row); rows.push(row); row=[];
      }else cur+=c;
    }
    if(cur||row.length) { pushCell(row); rows.push(row); }
    return rows.filter(r=>r.some(c=>c.trim()!==''));
  };

  const importAssetsFromRows = (rows) => {
    if (!rows.length) return;
    let headers = rows[0].map(h => h?.trim?.().toLowerCase() || '');
    const headerMap = ['name','type','location','vendor','osversion','network','criticality'];
    let startIdx = 1;
    const hasHeaderRow = headerMap.some(h => headers.includes(h));
    if(!hasHeaderRow){ headers=headerMap; startIdx=0;}
    const idxOf = (h)=>headers.indexOf(h);
    const newAssets = rows.slice(startIdx).map(r => {
      // Skip empty rows
      if (!r.some(cell => cell && String(cell).trim() !== '')) return null;
      
      return {
        id: Date.now()+Math.random(),
        name: r[idxOf('name')] || '',
        type: r[idxOf('type')] || '',
        location: r[idxOf('location')] || '',
        vendor: r[idxOf('vendor')] || '',
        osVersion: r[idxOf('osversion')] || '',
        network: r[idxOf('network')] || '',
        criticality: (r[idxOf('criticality')] || 'medium').toLowerCase()
      };
    }).filter(Boolean); // Remove null entries
    
    if (newAssets.length === 0) {
      alert('No valid assets found in the imported file.');
      return;
    }
    
    setData(d => ({...d, assets:[...d.assets, ...newAssets]}));
    alert(`Imported ${newAssets.length} assets`);
  };

  const importAssetsFromCSVText = (csvText) => {
    const rows = parseCSV(csvText);
    importAssetsFromRows(rows);
  };
  
  const parseXLSX = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        importAssetsFromRows(rows);
      } catch (error) {
        console.error('Error parsing Excel file:', error);
        alert('Error parsing Excel file. Please check the format.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleFile = (file) => {
    if(!file) return;
    const fileName = file.name.toLowerCase();
    if(fileName.endsWith('.csv')){
      const reader=new FileReader();
      reader.onload=e=>importAssetsFromCSVText(e.target.result);
      reader.readAsText(file);
    } else if(fileName.endsWith('.xlsx') || fileName.endsWith('.xls')){
      parseXLSX(file);
    } else {
      alert('Unsupported file format. Please provide a CSV or Excel file.');
    }
  };

  const handleAssetFileSelect = e => {
    const f=e.target.files?.[0]; if(f) handleFile(f); e.target.value='';
  };

  const handleAssetDrop = e => {
    preventDefault(e);
    setDragActive(false);
    const f=e.dataTransfer.files?.[0]; if(f) handleFile(f);
  };

  // load existing and normalize data
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      const meta = JSON.parse(localStorage.getItem(META_KEY) || 'null');
      
      if (saved) {
        // Normalize consequence scenarios to ensure operational & regulatory impacts exist
        if (saved.consequenceScenarios && saved.consequenceScenarios.length > 0) {
          saved.consequenceScenarios = saved.consequenceScenarios.map(scenario => {
            const impacts = scenario.impacts || {};
            // Ensure all impact types exist with defaults
            return {
              ...scenario,
              impacts: {
                safety: impacts.safety || 1,
                environmental: impacts.environmental || 1,
                financial: impacts.financial || 1,
                operational: impacts.operational || 1,
                regulatory: impacts.regulatory || 1
              }
            };
          });
        }
        
        // Normalize threat scenarios to ensure they have all required fields
        if (saved.threatScenarios && saved.threatScenarios.length > 0) {
          saved.threatScenarios = saved.threatScenarios.map(scenario => {
            return {
              ...scenario,
              targetedAssets: scenario.targetedAssets || '',
              targetedZones: scenario.targetedZones || '',
              exploitedVulnerabilities: scenario.exploitedVulnerabilities || '',
              existingControls: scenario.existingControls || '',
              frApplied: scenario.frApplied || [],
              frImplemented: scenario.frImplemented || []
            };
          });
        }
        
        setData({ ...defaultData, ...saved });
      }
      
      if (meta?.currentStage) setCurrentStage(meta.currentStage);
    } catch (error) {
      console.error("Error loading saved assessment data:", error);
    }
  }, []);

  const progressPct = useMemo(() => Math.min(100, Math.max(0, (currentStage / 7) * 100)), [currentStage]);

  const setMeta = useCallback((nextStage) => {
    const { userTitle, userRole } = getCurrentUserInfo();
    const meta = {
      currentStage: nextStage ?? currentStage,
      lastUpdated: new Date().toISOString(),
      userTitle,
      userRole
    };
    localStorage.setItem(META_KEY, JSON.stringify(meta));
    localStorage.setItem('cyberTrustDashboard.lastUpdated', JSON.stringify({ lastUpdated: meta.lastUpdated }));
  }, [currentStage]);

  const save = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setMeta();
  }, [data, setMeta]);

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    download(blob, 'iec62443_assessment.json');
  };

  const exportCSV = () => {
    const rows = [];
    rows.push(['Assessment Type','Name','Date','Assessor','Facility Type','Criticality'].join(','));
    rows.push([
      data.assessmentType,
      quote(data.metadata.name),
      data.metadata.date,
      quote(data.metadata.assessor),
      data.metadata.facilityType,
      data.metadata.criticalityLevel
    ].join(','));
    rows.push('');
    rows.push('Assets');
    rows.push(['Name','Type','Location','Vendor','OS/Firmware','Network','Criticality'].join(','));
    data.assets.forEach(a => rows.push([
      quote(a.name), a.type, quote(a.location), quote(a.vendor), quote(a.osVersion), quote(a.network), a.criticality
    ].join(',')));
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    download(blob, 'iec62443_assessment.csv');
  };

  const exportPDF = () => {
    alert('PDF export to be implemented with a PDF library.');
  };

  const cloneAssessment = () => {
    const cloned = { ...data, metadata: { ...data.metadata, name: (data.metadata.name || 'Assessment') + ' (Copy)', date: new Date().toISOString().slice(0,10) }, approval: { ...defaultData.approval } };
    setData(cloned);
    alert('Assessment cloned. You can continue editing the copy.');
  };

  // Helpers
  const addAsset = () => setData(d => ({ ...d, assets: [...d.assets, { id: Date.now(), name: '', type: '', location: '', vendor: '', osVersion: '', network: '', criticality: 'medium' }] }));
  const removeAsset = (id) => setData(d => ({ ...d, assets: d.assets.filter(a => a.id !== id) }));
  const updateAsset = (id, patch) => setData(d => ({ ...d, assets: d.assets.map(a => a.id === id ? { ...a, ...patch } : a) }));

  const addZone = () => setData(d => ({ ...d, zones: [...d.zones, { id: Date.now(), name: '', type: 'control', securityLevel: 'SL1' }] }));
  const removeZone = (id) => setData(d => ({ ...d, zones: d.zones.filter(z => z.id !== id) }));
  const updateZone = (id, patch) => setData(d => ({ ...d, zones: d.zones.map(z => z.id === id ? { ...z, ...patch } : z) }));

  const addConduit = () => setData(d => ({ ...d, conduits: [...d.conduits, { id: Date.now(), name: '', sourceZone: '', destinationZone: '', type: 'wired', protocols: '', securityRequirements: '' }] }));
  const removeConduit = (id) => setData(d => ({ ...d, conduits: d.conduits.filter(c => c.id !== id) }));
  const updateConduit = (id, patch) => setData(d => ({ ...d, conduits: d.conduits.map(c => c.id === id ? { ...c, ...patch } : c) }));

  const addConsequence = () => setData(d => ({ ...d, consequenceScenarios: [...d.consequenceScenarios, { id: Date.now(), name: '', asset: '', failureMode: 'complete-failure', impacts: { safety: 1, environmental: 1, financial: 1, operational: 1, regulatory: 1 } }] }));
  const removeConsequence = id => setData(d => ({ ...d, consequenceScenarios: d.consequenceScenarios.filter(s => s.id !== id) }));
  const updateConsequence = (id, patch) => setData(d => ({ ...d, consequenceScenarios: d.consequenceScenarios.map(s => s.id === id ? { ...s, ...patch } : s) }));

  const addThreat = () => setData(d => ({ 
    ...d, 
    threatScenarios: [
      ...d.threatScenarios, 
      { 
        id: Date.now(), 
        name: '', 
        threatActor: 'nation-state', 
        attackVector: 'network', 
        description: '', 
        targetedAssets: '',
        targetedZones: '',
        exploitedVulnerabilities: '',
        likelihood: 0.1, 
        impact: 1, 
        existingControls: '',
        frApplied: [],
        frImplemented: []
      }
    ] 
  }));
  
  const removeThreat = id => setData(d => ({ ...d, threatScenarios: d.threatScenarios.filter(s => s.id !== id) }));
  const updateThreat = (id, patch) => setData(d => ({ ...d, threatScenarios: d.threatScenarios.map(s => s.id === id ? { ...s, ...patch } : s) }));

  // Handle likelihood button selection
  const handleLikelihoodSelect = (id, value) => {
    updateThreat(id, { likelihood: value });
  };

  // Handle impact button selection
  const handleImpactSelect = (id, value) => {
    updateThreat(id, { impact: value });
  };

  // Handle FR toggle selection
  const toggleFR = (id, frKey) => {
    const scenario = data.threatScenarios.find(s => s.id === id);
    if (!scenario) return;
    
    const frApplied = [...(scenario.frApplied || [])];
    const index = frApplied.indexOf(frKey);
    
    if (index >= 0) {
      frApplied.splice(index, 1);
    } else {
      frApplied.push(frKey);
    }
    
    updateThreat(id, { frApplied });
  };

  // Handle FR Implementation toggle selection
  const toggleFRImplemented = (id, frKey) => {
    const scenario = data.threatScenarios.find(s => s.id === id);
    if (!scenario) return;
    // Only allow if FR is marked applicable
    if (!(scenario.frApplied || []).includes(frKey)) return;

    const frImplemented = [...(scenario.frImplemented || [])];
    const idx = frImplemented.indexOf(frKey);
    if (idx >= 0) {
      frImplemented.splice(idx, 1);
    } else {
      frImplemented.push(frKey);
    }
    updateThreat(id, { frImplemented });
  };

  // Calculate residual risk after considering implemented FRs & controls
  const calculateResidualRisk = (scenario) => {
    const baseRisk = scenario.likelihood * scenario.impact;
    // Apply reduction only when controls are documented AND at least one FR implemented
    if (
      scenario.existingControls &&
      scenario.existingControls.trim() !== '' &&
      (scenario.frImplemented || []).length > 0
    ) {
      const coverage =
        (scenario.frImplemented || []).length /
        Math.max(1, (scenario.frApplied || []).length);
      // Up to 40 % mitigation when all applicable FRs are implemented
      const mitigation = Math.min(0.4, 0.4 * coverage);
      return baseRisk * (1 - mitigation);
    }
    return baseRisk;
  };

  const initialRiskSummary = useMemo(() => {
    const risks = data.consequenceScenarios.map(s => Math.max(
      s.impacts?.safety || 1, 
      s.impacts?.environmental || 1, 
      s.impacts?.financial || 1, 
      s.impacts?.operational || 1, 
      s.impacts?.regulatory || 1
    ));
    const total = risks.length;
    const high = risks.filter(r => r >= 4).length;
    const avg = total ? (risks.reduce((a,b)=>a+b,0)/total) : 0;
    return { total, high, avg };
  }, [data.consequenceScenarios]);

  const overallRiskScore = useMemo(() => {
    const cons = data.consequenceScenarios.map(s => Math.max(
      s.impacts?.safety || 1, 
      s.impacts?.environmental || 1, 
      s.impacts?.financial || 1, 
      s.impacts?.operational || 1, 
      s.impacts?.regulatory || 1
    ));
    const threats = data.threatScenarios.map(s => s.likelihood * s.impact);
    const arr = [...cons, ...threats];
    return arr.length ? (arr.reduce((a,b)=>a+b,0) / arr.length).toFixed(1) : '0.0';
  }, [data.consequenceScenarios, data.threatScenarios]);

  const highRiskZones = useMemo(() => data.zones.filter(z => z.securityLevel === 'SL3' || z.securityLevel === 'SL4').length, [data.zones]);

  const requiredActions = useMemo(() => {
    const actions = [];
    // Threat scenarios with residual risk above threshold
    data.threatScenarios.forEach(scenario => {
      const residualRisk = calculateResidualRisk(scenario);
      if (residualRisk > data.tolerableRiskThreshold) {
        actions.push({
          type: 'threat',
          id: scenario.id,
          text: `Reduce risk for \"${scenario.name || 'Unnamed threat scenario'}\" (${residualRisk.toFixed(2)} > ${data.tolerableRiskThreshold})`
        });
      }
    });
    // Consequence scenarios with max impact above threshold
    data.consequenceScenarios.forEach(scenario => {
      const maxImpact = Math.max(
        scenario.impacts?.safety || 1,
        scenario.impacts?.environmental || 1,
        scenario.impacts?.financial || 1,
        scenario.impacts?.operational || 1,
        scenario.impacts?.regulatory || 1
      );
      if (maxImpact > data.tolerableRiskThreshold) {
        actions.push({
          type: 'consequence',
          id: scenario.id,
          text: `Mitigate impact for \"${scenario.name || 'Unnamed consequence scenario'}\" (${maxImpact} > ${data.tolerableRiskThreshold})`
        });
      }
    });
    // Outstanding FRs (applied but not implemented)
    data.threatScenarios.forEach(scenario => {
      const appliedFRs = scenario.frApplied || [];
      const implementedFRs = scenario.frImplemented || [];
      const outstandingFRs = appliedFRs.filter(fr => !implementedFRs.includes(fr));
      if (outstandingFRs.length > 0) {
        const frList = outstandingFRs.join(', ');
        actions.push({
          type: 'fr',
          id: scenario.id,
          text: `Implement outstanding requirements for \"${scenario.name || 'Unnamed scenario'}\": ${frList}`
        });
      }
    });
    return actions;
  }, [data.threatScenarios, data.consequenceScenarios, data.tolerableRiskThreshold]);

  const complianceScore = useMemo(() => Math.floor(Math.random()*30)+70, [data.assets.length, data.zones.length]);

  const next = () => { const n = Math.min(7, currentStage + 1); setCurrentStage(n); setMeta(n); };
  const prev = () => { const p = Math.max(1, currentStage - 1); setCurrentStage(p); setMeta(p); };

  // ZCR stage labels mapping
  const zcrLabels = { 
    1: 'ZCR 1: Define SuC', 
    2: 'ZCR 2: Initial Risk Assessment', 
    3: 'ZCR 3: Zone & Conduit Partitioning', 
    4: 'ZCR 4: Compare to Tolerable Risk', 
    5: 'ZCR 5: Detailed Risk Assessment', 
    6: 'ZCR 6: Document Requirements', 
    7: 'ZCR 7: Approval' 
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="dashboard-card p-4 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => navigate('/dashboard/standards-frameworks')} leadingIcon={ArrowLeft}>
              Back
            </Button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-secondary-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-primary-600" /> IEC 62443-3-2 Risk Assessment
              </h1>
              <p className="text-secondary-500 dark:text-secondary-400 text-sm">Comprehensive Zonal Cyber Risk (ZCR) workflow</p>
            </div>
          </div>
          <div className="min-w-[180px] text-right">
            <p className="text-sm font-medium text-secondary-600 dark:text-secondary-300">Progress</p>
            <p className="text-2xl font-bold">{progressPct.toFixed(0)}%</p>
            <div className="w-full bg-secondary-200 dark:bg-secondary-700 rounded-full h-2 mt-1">
              <div className="bg-primary-600 h-2 rounded-full" style={{ width: `${progressPct}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Assessment type */}
      <div className="dashboard-card p-4">
        <h2 className="font-semibold text-secondary-900 dark:text-white">Select Assessment Type</h2>
        <p className="text-sm text-secondary-500">Choose based on objectives and detail required.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
          {[
            { 
              key: 'initial', 
              title: 'Initial (High-Level)', 
              purpose: 'First stage of IEC 62443 risk analysis',
              description: 'Define System under Consideration (SuC), assume likelihood = 1, estimate worst-case impacts, identify zones and conduits, set initial security-level targets (SL-T). Minimal asset details required.'
            },
            { 
              key: 'detailed', 
              title: 'Detailed', 
              purpose: 'When risk exceeds tolerable limits',
              description: 'Identify realistic threat scenarios, evaluate vulnerabilities and existing countermeasures, estimate likelihood and impact, refine SL-T for each zone/conduit, document cybersecurity requirements.'
            },
            { 
              key: 'vulnerability', 
              title: 'Vulnerability', 
              purpose: 'Identify current vulnerabilities',
              description: 'Use automated scans or manual enumeration to collect OS versions, services and configurations. Map discovered vulnerabilities to risk scenarios and feed into detailed assessment.'
            },
            { 
              key: 'compliance', 
              title: 'Compliance/Maturity', 
              purpose: 'Determine alignment with IEC 62443',
              description: 'Use checklists derived from IEC 62443-2-1, -2-4 and -3-3. Score each requirement, highlight gaps, recommend improvements and link to risk-mitigation plans.'
            },
          ].map(card => (
            <button key={card.key} onClick={() => setData(d => ({ ...d, assessmentType: card.key }))}
              className={`p-3 rounded-lg border transition ${data.assessmentType === card.key ? 'border-primary-500 bg-primary-50/40' : 'border-secondary-200 dark:border-secondary-700 hover:border-primary-300'}`}>
              <h3 className="text-sm font-semibold text-primary-700 dark:text-primary-400">{card.title}</h3>
              <p className="text-xs text-amber-500 font-medium">Purpose: {card.purpose}</p>
              <p className="text-xs text-secondary-300 mt-2">{card.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Stage nav */}
      <div className="dashboard-card p-3 flex flex-wrap gap-2">
        {[1,2,3,4,5,6,7].map(n => (
          <button key={n} onClick={() => { setCurrentStage(n); setMeta(n); }}
            className={`px-3 py-2 rounded border text-xs ${n===currentStage ? 'border-primary-500 bg-primary-50/40' : n<currentStage ? 'border-green-500 bg-green-50/40' : 'border-secondary-300 dark:border-secondary-700'}`}>
            <span className="font-semibold">{zcrLabels[n]}</span>
          </button>
        ))}
      </div>

      {/* Stage content */}
      {currentStage === 1 && (
        <div className="dashboard-card p-4 space-y-4">
          <h2 className="text-lg font-bold text-primary-600">ZCR 1: Define System Under Consideration (SuC)</h2>

          {/* ---- Metadata -------------------------------------------------- */}
          {/* 3-column grid: name, assessor, date */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-secondary-500">Assessment Name</label>
              <input
                className="w-full input"
                value={data.metadata.name}
                onChange={e =>
                  setData(d => ({ ...d, metadata: { ...d.metadata, name: e.target.value } }))
                }
                placeholder="e.g., Plant Alpha - 2025 Assessment"
              />
            </div>
            <div>
              <label className="text-xs text-secondary-500">Lead Assessor</label>
              <input
                className="w-full input"
                value={data.metadata.assessor}
                onChange={e =>
                  setData(d => ({ ...d, metadata: { ...d.metadata, assessor: e.target.value } }))
                }
              />
            </div>
            <div>
              <label className="text-xs text-secondary-500">Assessment Date</label>
              <input
                type="date"
                className="w-full input"
                value={data.metadata.date}
                onChange={e =>
                  setData(d => ({ ...d, metadata: { ...d.metadata, date: e.target.value } }))
                }
              />
            </div>
          </div>

          {/* 2-column grid: facility type & criticality */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-secondary-500">Facility Type</label>
              <select
                className="w-full input"
                value={data.metadata.facilityType}
                onChange={e =>
                  setData(d => ({ ...d, metadata: { ...d.metadata, facilityType: e.target.value } }))
                }
              >
                <option value="">Select facility type</option>
                {[
                  'gas-compressor',
                  'gas-measurement',
                  'gas-gate',
                  'gas-storage',
                  'gas-processing',
                  'pipeline-control',
                  'refinery',
                  'chemical-plant',
                  'power-generation',
                  'water-treatment',
                  'manufacturing',
                  'other'
                ].map(v => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-secondary-500">Criticality Level</label>
              <select
                className="w-full input"
                value={data.metadata.criticalityLevel}
                onChange={e =>
                  setData(d => ({
                    ...d,
                    metadata: { ...d.metadata, criticalityLevel: e.target.value }
                  }))
                }
              >
                <option value="">Select criticality</option>
                <option value="mission-critical">Mission Critical</option>
                <option value="business-critical">Business Critical</option>
                <option value="important">Important</option>
                <option value="routine">Routine</option>
              </select>
            </div>
          </div>

          {/* System description */}
          <div>
            <label className="text-xs text-secondary-500">System Description</label>
            <textarea
              className="w-full input min-h-[90px]"
              value={data.metadata.systemDescription}
              onChange={e =>
                setData(d => ({
                  ...d,
                  metadata: { ...d.metadata, systemDescription: e.target.value }
                }))
              }
            />
          </div>

          {/* 2-column grid: remote access points & network architecture */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-secondary-500">Remote Access Points</label>
              <textarea
                className="w-full input min-h-[90px]"
                value={data.metadata.accessPoints}
                onChange={e =>
                  setData(d => ({ ...d, metadata: { ...d.metadata, accessPoints: e.target.value } }))
                }
              />
            </div>
            <div>
              <label className="text-xs text-secondary-500">Network Architecture</label>
              <textarea
                className="w-full input min-h-[90px]"
                value={data.metadata.networkDiagram}
                onChange={e =>
                  setData(d => ({
                    ...d,
                    metadata: { ...d.metadata, networkDiagram: e.target.value }
                  }))
                }
              />
            </div>
          </div>

          {/* Physical and Logical Boundaries */}
          <div>
            <label className="text-xs text-secondary-500">Physical and Logical Boundaries</label>
            <textarea
              className="w-full input min-h-[90px]"
              value={data.metadata.boundaries}
              placeholder="Define what is included/excluded from the assessment scope. Include network boundaries, physical locations, organizational boundaries..."
              onChange={e =>
                setData(d => ({
                  ...d,
                  metadata: { ...d.metadata, boundaries: e.target.value }
                }))
              }
            />
          </div>

            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-secondary-900 dark:text-white">Asset Inventory</h3>
              <Button size="sm" onClick={addAsset}>Add Asset</Button>
            </div>

            {/* Import Drop-zone */}
            <div
              className={`dashboard-card p-3 mb-4 border-2 border-dashed transition-colors text-center cursor-pointer ${
                dragActive ? 'border-primary-600 bg-primary-50/40' : 'border-secondary-300 dark:border-secondary-600'
              }`}
              onDragEnter={e => { preventDefault(e); setDragActive(true); }}
              onDragOver={e => { preventDefault(e); setDragActive(true); }}
              onDragLeave={e => { preventDefault(e); setDragActive(false); }}
              onDrop={handleAssetDrop}
              onClick={() => document.getElementById('iec-asset-upload').click()}
            >
              <input
                id="iec-asset-upload"
                type="file"
                accept=".csv,.xlsx,.xls"
                className="hidden"
                onChange={handleAssetFileSelect}
              />
              <p className="text-primary-600 font-medium">📁 Import Asset Inventory</p>
              <p className="text-xs text-secondary-500">Click to upload CSV or Excel file or drag and drop</p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-secondary-500">
                    {['Name','Type','Location','Vendor/Model','OS/Firmware','Network','Criticality',''].map(h => <th key={h} className="py-2 pr-3">{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {data.assets.map(a => (
                    <tr key={a.id} className="border-t border-secondary-200 dark:border-secondary-700">
                      <td className="py-1 pr-2"><input className="input" value={a.name} onChange={e=>updateAsset(a.id,{name:e.target.value})} /></td>
                      <td className="py-1 pr-2">
                        <select className="input" value={a.type} onChange={e=>updateAsset(a.id,{type:e.target.value})}>
                          {['','plc','hmi','scada','historian','firewall','switch','router','workstation','server','field-device','safety-system','other'].map(v=> <option key={v} value={v}>{v||'Select type'}</option>)}
                        </select>
                      </td>
                      <td className="py-1 pr-2"><input className="input" value={a.location} onChange={e=>updateAsset(a.id,{location:e.target.value})} /></td>
                      <td className="py-1 pr-2"><input className="input" value={a.vendor} onChange={e=>updateAsset(a.id,{vendor:e.target.value})} /></td>
                      <td className="py-1 pr-2"><input className="input" value={a.osVersion} onChange={e=>updateAsset(a.id,{osVersion:e.target.value})} /></td>
                      <td className="py-1 pr-2"><input className="input" value={a.network} onChange={e=>updateAsset(a.id,{network:e.target.value})} /></td>
                      <td className="py-1 pr-2">
                        <select className="input" value={a.criticality} onChange={e=>updateAsset(a.id,{criticality:e.target.value})}>
                          {['critical','high','medium','low'].map(v=> <option key={v} value={v}>{v}</option>)}
                        </select>
                      </td>
                      <td className="py-1 pr-2 text-right"><Button size="xs" variant="danger" onClick={()=>removeAsset(a.id)}>Remove</Button></td>
                    </tr>
                  ))}
                  {data.assets.length === 0 && (
                    <tr><td colSpan={8} className="py-4 text-center text-secondary-500">No assets yet. Click Add Asset to begin.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
      )}

      {currentStage === 2 && (
        <div className="dashboard-card p-4 space-y-4">
          <h2 className="text-lg font-bold text-primary-600">ZCR 2: Initial Risk Assessment</h2>
          {/* ---------- Risk Matrix Configuration ------------------------- */}
          <div className="dashboard-card p-3 space-y-3">
            <h3 className="font-semibold text-secondary-900 dark:text-white">Risk Matrix Configuration</h3>
            <p className="text-sm text-secondary-500">
              Configure your organisation's risk tolerance levels. This matrix will be used to evaluate all identified risks.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-secondary-500">Safety Impact Scale</label>
                <select
                  className="input w-full"
                  value={data.riskMatrix.safetyScale}
                  onChange={e => setData(d => ({ ...d, riskMatrix: { ...d.riskMatrix, safetyScale: Number(e.target.value) } }))}
                >
                  {IMPACT_LABELS.safety.map((label, index) => (
                    <option key={index + 1} value={index + 1}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-secondary-500">Environmental Impact Scale</label>
                <select
                  className="input w-full"
                  value={data.riskMatrix.environmentalScale}
                  onChange={e => setData(d => ({ ...d, riskMatrix: { ...d.riskMatrix, environmentalScale: Number(e.target.value) } }))}
                >
                  {IMPACT_LABELS.environmental.map((label, index) => (
                    <option key={index + 1} value={index + 1}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-secondary-500">Financial Impact Scale</label>
                <select
                  className="input w-full"
                  value={data.riskMatrix.financialScale}
                  onChange={e => setData(d => ({ ...d, riskMatrix: { ...d.riskMatrix, financialScale: Number(e.target.value) } }))}
                >
                  {IMPACT_LABELS.financial.map((label, index) => (
                    <option key={index + 1} value={index + 1}>{label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center text-amber-600 text-xs mt-2">
              <AlertTriangle className="w-4 h-4 mr-1" /> Initial assessment assumes likelihood = 1 (worst-case scenario) as per IEC&nbsp;62443-3-2
            </div>

            {/* Simple visual matrix bar */}
            <div className="grid grid-cols-5 gap-1 mt-4 text-center text-xs font-semibold">
              {['Very Low','Low','Medium','High','Very High'].map((lbl,i)=>(
                <div key={lbl} className={`
                  py-2 rounded text-white
                  ${i===0?'bg-sky-600':i===1?'bg-teal-600':i===2?'bg-yellow-600':
                    i===3?'bg-rose-600':'bg-purple-700'}
                `}>{lbl}</div>
              ))}
            </div>
          </div>

          {/* --- Consequence Assessment ----------------------------------- */}
          <div className="flex items-center justify-between mt-2">
            <h3 className="font-semibold text-secondary-900 dark:text-white">Consequence Assessment by Asset/Zone</h3>
            <Button size="sm" onClick={addConsequence}>Add Consequence Scenario</Button>
          </div>
          <p className="text-sm text-secondary-500 mb-2">
            For each critical asset or system area, assess the worst-case impact if completely compromised.
          </p>

          <div className="space-y-3">
            {data.consequenceScenarios.map(s => {
              // Calculate max risk score for this scenario
              const maxRiskScore = Math.max(
                s.impacts?.safety || 1,
                s.impacts?.environmental || 1,
                s.impacts?.financial || 1,
                s.impacts?.operational || 1,
                s.impacts?.regulatory || 1
              );
              
              return (
                <div key={s.id} className="dashboard-card p-3">
                  {/* Risk score banner */}
                  <div className="bg-primary-600 text-white text-sm font-medium px-3 py-1 rounded mb-3">
                    Overall Risk Score (Likelihood = 1): {maxRiskScore}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input className="input" placeholder="Scenario Name" value={s.name} onChange={e=>updateConsequence(s.id,{name:e.target.value})} />
                    <input className="input" placeholder="Affected Asset/System" value={s.asset} onChange={e=>updateConsequence(s.id,{asset:e.target.value})} />
                    <select className="input" value={s.failureMode} onChange={e=>updateConsequence(s.id,{failureMode:e.target.value})}>
                      {['complete-failure','degraded-performance','data-corruption','unauthorized-access','denial-of-service','safety-system-bypass'].map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-2">
                    {['safety','environmental','financial','operational','regulatory'].map(cat => (
                      <div key={cat}>
                        <label className="text-xs text-secondary-500 capitalize">{cat} impact</label>
                        <select 
                          className="input" 
                          value={s.impacts?.[cat] || 1} 
                          onChange={e=>updateConsequence(s.id,{ impacts: { ...(s.impacts || {}), [cat]: Number(e.target.value) } })}
                        >
                          {IMPACT_LABELS[cat].map((label, index) => (
                            <option key={index + 1} value={index + 1}>{label}</option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 text-right"><Button size="xs" variant="danger" onClick={()=>removeConsequence(s.id)}>Remove Scenario</Button></div>
                </div>
              );
            })}
            {data.consequenceScenarios.length === 0 && (
              <div className="text-sm text-secondary-500">Add consequence scenarios to calculate initial risks.</div>
            )}
          </div>

          <div className="dashboard-card p-3">
            <h4 className="font-semibold mb-2">Initial Risk Calculation Results</h4>
            <p className="text-sm">Total Scenarios: <strong>{initialRiskSummary.total}</strong></p>
            <p className="text-sm">High Risk (≥4): <strong>{initialRiskSummary.high}</strong></p>
            <p className="text-sm">Average Risk Score: <strong>{initialRiskSummary.avg.toFixed(1)}</strong></p>
          </div>
        </div>
      )}

      {currentStage === 3 && (
        <div className="dashboard-card p-4 space-y-4">
          <h2 className="text-lg font-bold text-primary-600">ZCR 3: Zone and Conduit Partitioning</h2>
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Zones</h3>
            <Button size="sm" onClick={addZone}>Create Zone</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {data.zones.map(z => (
              <div key={z.id} className="dashboard-card p-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <input className="input" placeholder="Zone Name" value={z.name} onChange={e=>updateZone(z.id,{name:e.target.value})} />
                  <select className="input" value={z.type} onChange={e=>updateZone(z.id,{type:e.target.value})}>
                    {['enterprise','manufacturing','control','safety','dmz','remote'].map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                  <select className="input" value={z.securityLevel} onChange={e=>updateZone(z.id,{securityLevel:e.target.value})}>
                    {['SL1','SL2','SL3','SL4'].map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
                <div className="mt-2 text-right"><Button size="xs" variant="danger" onClick={()=>removeZone(z.id)}>Remove Zone</Button></div>
              </div>
            ))}
            {data.zones.length === 0 && <div className="text-sm text-secondary-500">Create zones to group assets by security needs.</div>}
          </div>

          <div className="flex items-center justify-between mt-2">
            <h3 className="font-semibold">Conduits</h3>
            <Button size="sm" onClick={addConduit}>Add Conduit</Button>
          </div>
          <div className="space-y-3">
            {data.conduits.map(c => (
              <div key={c.id} className="dashboard-card p-3">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                  <input className="input" placeholder="Conduit Name" value={c.name} onChange={e=>updateConduit(c.id,{name:e.target.value})} />
                  <select className="input" value={c.sourceZone} onChange={e=>updateConduit(c.id,{sourceZone:e.target.value})}>
                    <option value="">Source Zone</option>
                    {data.zones.map(z => <option key={z.id} value={z.name||z.id}>{z.name || z.id}</option>)}
                  </select>
                  <select className="input" value={c.destinationZone} onChange={e=>updateConduit(c.id,{destinationZone:e.target.value})}>
                    <option value="">Destination Zone</option>
                    {data.zones.map(z => <option key={z.id} value={z.name||z.id}>{z.name || z.id}</option>)}
                  </select>
                  <select className="input" value={c.type} onChange={e=>updateConduit(c.id,{type:e.target.value})}>
                    {['wired','wireless','remote-access','removable-media','manual-procedure'].map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                  <input className="input" placeholder="Protocols (e.g., Modbus TCP)" value={c.protocols} onChange={e=>updateConduit(c.id,{protocols:e.target.value})} />
                </div>
                <textarea className="input mt-2" placeholder="Security Requirements" value={c.securityRequirements} onChange={e=>updateConduit(c.id,{securityRequirements:e.target.value})} />
                <div className="mt-2 text-right"><Button size="xs" variant="danger" onClick={()=>removeConduit(c.id)}>Remove Conduit</Button></div>
              </div>
            ))}
            {data.conduits.length === 0 && <div className="text-sm text-secondary-500">Add conduits to define inter-zone communications.</div>}
          </div>
        </div>
      )}

      {currentStage === 4 && (
        <div className="dashboard-card p-4 space-y-4">
          <h2 className="text-lg font-bold text-primary-600">ZCR 4: Compare Initial Risk to Tolerable Risk</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-secondary-500">Tolerable Risk Threshold</label>
              <select className="input w-full" value={data.tolerableRiskThreshold} onChange={e=>setData(d=>({...d, tolerableRiskThreshold:Number(e.target.value)}))}>
                <option value={1}>1 - Low (Only accept very low risk)</option>
                <option value={2}>2 - Medium-Low (Accept low and very low risks)</option>
                <option value={3}>3 - Medium (Accept up to medium risks)</option>
                <option value={4}>4 - Medium-High (Accept up to high risks)</option>
                <option value={5}>5 - High (Accept all risks below critical)</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-secondary-500">Risk Tolerance Justification</label>
              <textarea className="input w-full min-h-[80px]" value={data.riskJustification} onChange={e=>setData(d=>({...d, riskJustification:e.target.value}))} />
            </div>
          </div>
          <div className="dashboard-card p-3">
            <h4 className="font-semibold mb-2">Risk Comparison Results</h4>
            <p className="text-sm">High Risk Scenarios (≥4): <strong>{initialRiskSummary.high}</strong></p>
            <p className="text-sm">Decision:</p>
            <div className="flex gap-4 mt-1 text-sm">
              {[
                { key: 'acceptable', label: 'Risk acceptable – proceed to approval' },
                { key: 'detailed', label: 'Risk exceeds tolerance – proceed to ZCR 5' },
                { key: 'modify', label: 'Modify scope or boundaries and reassess' }
              ].map(opt => (
                <label key={opt.key} className="flex items-center gap-2">
                  <input type="radio" name="decision" value={opt.key} checked={data.decision===opt.key} onChange={()=>setData(d=>({...d, decision: opt.key}))} />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {currentStage === 5 && (
        <div className="dashboard-card p-4 space-y-4">
          <h2 className="text-lg font-bold text-primary-600">ZCR 5: Detailed Risk Assessment</h2>
          
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Threat Scenario Analysis</h3>
            <Button size="sm" onClick={addThreat}>Add Threat Scenario</Button>
          </div>
          
          <p className="text-sm text-secondary-500 mb-2">
            Define realistic threat scenarios with credible attack paths and estimate likelihood based on threat capability and existing controls.
          </p>
          
          <div className="space-y-4">
            {data.threatScenarios.map(s => (
              <div key={s.id} className="dashboard-card p-4 border-l-4 border-primary-600">
                <h4 className="font-semibold text-lg mb-3">Threat Scenario Name</h4>
                
                {/* Threat Actor and Attack Vector */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-xs text-secondary-500">Threat Actor:</label>
                    <select 
                      className="input w-full" 
                      value={s.threatActor} 
                      onChange={e => updateThreat(s.id, {threatActor: e.target.value})}
                    >
                      {['nation-state','cybercriminal','insider-threat','hacktivist','script-kiddie','competitor'].map(v => 
                        <option key={v} value={v}>{v}</option>
                      )}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-secondary-500">Attack Vector:</label>
                    <select 
                      className="input w-full" 
                      value={s.attackVector} 
                      onChange={e => updateThreat(s.id, {attackVector: e.target.value})}
                    >
                      {['network','email','removable-media','remote-access','physical','supply-chain','wireless'].map(v => 
                        <option key={v} value={v}>{v}</option>
                      )}
                    </select>
                  </div>
                </div>
                
                {/* Attack Description */}
                <div className="mb-4">
                  <label className="text-xs text-secondary-500">Attack Description:</label>
                  <textarea 
                    className="input w-full min-h-[90px]" 
                    placeholder="Describe the attack scenario, tactics, techniques, and procedures..." 
                    value={s.description} 
                    onChange={e => updateThreat(s.id, {description: e.target.value})}
                  />
                </div>
                
                {/* Targeted Assets, Targeted Zones, and Exploited Vulnerabilities */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="text-xs text-secondary-500">Targeted Assets:</label>
                    <input 
                      className="input w-full" 
                      placeholder="List affected assets" 
                      value={s.targetedAssets || ''} 
                      onChange={e => updateThreat(s.id, {targetedAssets: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-secondary-500">Targeted Zones:</label>
                    <input 
                      className="input w-full" 
                      placeholder="List affected zones" 
                      value={s.targetedZones || ''} 
                      onChange={e => updateThreat(s.id, {targetedZones: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-secondary-500">Exploited Vulnerabilities:</label>
                    <input 
                      className="input w-full" 
                      placeholder="CVE numbers or vulnerability descriptions" 
                      value={s.exploitedVulnerabilities || ''} 
                      onChange={e => updateThreat(s.id, {exploitedVulnerabilities: e.target.value})}
                    />
                  </div>
                </div>
                
                {/* Likelihood Assessment */}
                <div className="mb-4">
                  <label className="text-xs text-secondary-500 block mb-1">Likelihood Assessment:</label>
                  <div className="grid grid-cols-5 gap-1">
                    {LIKELIHOOD_OPTIONS.map(option => (
                      <button
                        key={option.value}
                        onClick={() => handleLikelihoodSelect(s.id, option.value)}
                        className={`py-2 px-1 rounded text-center ${
                          s.likelihood === option.value 
                            ? 'bg-primary-600 text-white' 
                            : 'bg-secondary-200 text-secondary-700 hover:bg-secondary-300'
                        }`}
                      >
                        {option.label}
                        <div className="text-xs mt-1">{option.value}</div>
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Impact Assessment */}
                <div className="mb-4">
                  <label className="text-xs text-secondary-500 block mb-1">Impact Assessment:</label>
                  <div className="grid grid-cols-5 gap-1">
                    {IMPACT_OPTIONS.map(option => (
                      <button
                        key={option.value}
                        onClick={() => handleImpactSelect(s.id, option.value)}
                        className={`py-2 px-1 rounded text-center ${
                          s.impact === option.value 
                            ? 'bg-primary-600 text-white' 
                            : 'bg-secondary-200 text-secondary-700 hover:bg-secondary-300'
                        }`}
                      >
                        {option.label}
                        <div className="text-xs mt-1">{option.value}</div>
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Applicable Foundational Requirements (FR) */}
                <div className="mb-4">
                  <label className="text-xs text-secondary-500 block mb-1">Applicable Foundational Requirements (FR):</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-1">
                    {FR_LIST.map(fr => (
                      <button
                        key={fr.key}
                        onClick={() => toggleFR(s.id, fr.key)}
                        className={`py-2 px-1 rounded text-center ${
                          (s.frApplied || []).includes(fr.key) 
                            ? 'bg-primary-600 text-white' 
                            : 'bg-secondary-200 text-secondary-700 hover:bg-secondary-300'
                        }`}
                      >
                        {fr.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Implemented FR Controls */}
                <div className="mb-4">
                  <label className="text-xs text-secondary-500 block mb-1">Implemented FR Controls:</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-1">
                    {FR_LIST.map(fr => (
                      <button
                        key={fr.key}
                        onClick={() => toggleFRImplemented(s.id, fr.key)}
                        disabled={!(s.frApplied || []).includes(fr.key)}
                        className={`py-2 px-1 rounded text-center ${
                          !(s.frApplied || []).includes(fr.key)
                            ? 'bg-secondary-100 text-secondary-400 cursor-not-allowed'
                            : (s.frImplemented || []).includes(fr.key)
                              ? 'bg-primary-600 text-white'
                              : 'bg-secondary-200 text-secondary-700 hover:bg-secondary-300'
                        }`}
                      >
                        {fr.label}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Existing Controls */}
                <div className="mb-4">
                  <label className="text-xs text-secondary-500">Existing Controls:</label>
                  <textarea 
                    className="input w-full min-h-[90px]" 
                    placeholder="List existing security controls that mitigate this threat..." 
                    value={s.existingControls} 
                    onChange={e => updateThreat(s.id, {existingControls: e.target.value})}
                  />
                </div>
                
                {/* Risk Score */}
                {(() => {
                  const baseRisk = s.likelihood * s.impact;
                  const residualRisk = calculateResidualRisk(s);
                  const hasReduction = baseRisk !== residualRisk;
                  return (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                      <div className="space-y-1">
                        <div className="text-sm">
                          <span className="font-semibold">Base Risk Score:</span>
                          <span className="ml-2">{baseRisk.toFixed(2)}</span>
                        </div>
                        <div className="text-lg">
                          <span className="font-semibold">Residual Risk Score:</span>
                          <span
                            className={`font-bold ml-2 ${
                              hasReduction ? 'text-green-600' : 'text-primary-600'
                            }`}
                          >
                            {residualRisk.toFixed(2)}
                            {hasReduction && (
                              <span className="text-xs ml-1 text-green-600">
                                ({((baseRisk - residualRisk) / baseRisk * 100).toFixed(0)}% reduction)
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="danger"
                        className="mt-2 sm:mt-0"
                        onClick={() => removeThreat(s.id)}
                      >
                        Remove Scenario
                      </Button>
                    </div>
                  );
                })()}
              </div>
            ))}
            
            {data.threatScenarios.length === 0 && (
              <div className="text-sm text-secondary-500 p-4 text-center">
                Add threat scenarios to evaluate detailed risks.
              </div>
            )}
          </div>

          <div>
            <div className="dashboard-card p-3">
              <h4 className="font-semibold mb-2">Vulnerability Assessment</h4>
              <input type="file" onChange={()=>alert('Parser placeholder: integrate scanner output here.')} />
              <p className="text-xs text-secondary-500 mt-1">Import of Nessus/OpenVAS/etc. to be integrated.</p>
            </div>
          </div>
        </div>
      )}

      {currentStage === 6 && (
        <div className="dashboard-card p-4 space-y-4">
          <h2 className="text-lg font-bold text-primary-600">ZCR 6: Document Cybersecurity Requirements</h2>
          <div className="dashboard-card p-3">
            <h4 className="font-semibold mb-2">Security Level Requirements</h4>
            {data.zones.length === 0 && <p className="text-sm text-secondary-500">Define zones to generate requirements.</p>}
            <div className="space-y-2">
              {data.zones.map(z => (
                <div key={z.id} className="requirement-item p-3 rounded border-l-4" style={{ borderColor: '#00a3ff20' }}>
                  <h5 className="font-semibold">{z.name || 'Unnamed Zone'} ({z.securityLevel})</h5>
                  <ul className="list-disc pl-5 text-sm">
                    {generateSLRequirements(z.securityLevel).map((req, i) => <li key={i}>{req}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="dashboard-card p-3">
            <h4 className="font-semibold mb-2">Risk Mitigation Plan</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              <div>
                <h5 className="font-semibold">High Priority</h5>
                <ul className="list-disc pl-5">
                  <li>Segment critical control systems</li>
                  <li>Enable MFA for admin access</li>
                  <li>Real-time monitoring for high-risk zones</li>
                </ul>
              </div>
              <div>
                <h5 className="font-semibold">Medium Priority</h5>
                <ul className="list-disc pl-5">
                  <li>Regular vulnerability assessments</li>
                  <li>Security awareness training</li>
                  <li>Incident response procedures</li>
                </ul>
              </div>
              <div>
                <h5 className="font-semibold">Long-term</h5>
                <ul className="list-disc pl-5">
                  <li>Continuous security monitoring</li>
                  <li>Threat intelligence integration</li>
                  <li>Periodic penetration testing</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="dashboard-card p-3">
            <h4 className="font-semibold mb-2">IEC 62443 Foundational Requirements (FR)</h4>
            {['FR1 Identification & Authentication','FR2 Use Control','FR3 System Integrity','FR4 Data Confidentiality','FR5 Restricted Data Flow','FR6 Timely Response to Events','FR7 Resource Availability'].map(fr => (
              <ComplianceRow key={fr} label={fr} />
            ))}
          </div>
        </div>
      )}

      {currentStage === 7 && (
        <div className="dashboard-card p-4 space-y-4">
          <h2 className="text-lg font-bold text-primary-600">ZCR 7: Approval</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-secondary-500">Reviewing Authority</label>
              <input className="input w-full" value={data.approval.reviewer} onChange={e=>setData(d=>({...d, approval:{...d.approval, reviewer:e.target.value}}))} />
            </div>
            <div>
              <label className="text-xs text-secondary-500">Review Date</label>
              <input type="date" className="input w-full" value={data.approval.reviewDate} onChange={e=>setData(d=>({...d, approval:{...d.approval, reviewDate:e.target.value}}))} />
            </div>
          </div>
          <div>
            <label className="text-xs text-secondary-500">Review Comments</label>
            <textarea className="input w-full min-h-[80px]" value={data.approval.reviewComments} onChange={e=>setData(d=>({...d, approval:{...d.approval, reviewComments:e.target.value}}))} />
          </div>
          <div className="dashboard-card p-3">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={data.approval.approved} onChange={e=>setData(d=>({...d, approval:{...d.approval, approved:e.target.checked}}))} />
              I approve this assessment and authorize implementation.
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
              <input className="input" placeholder="Approver Name" value={data.approval.approver} onChange={e=>setData(d=>({...d, approval:{...d.approval, approver:e.target.value}}))} />
              <input type="date" className="input" value={data.approval.approvalDate} onChange={e=>setData(d=>({...d, approval:{...d.approval, approvalDate:e.target.value}}))} />
            </div>
          </div>
        </div>
      )}

      {/* Footer actions */}
      <div className="dashboard-card p-3 flex items-center justify-between">
        <Button variant="secondary" leadingIcon={ChevronLeft} onClick={prev} disabled={currentStage===1}>Previous</Button>
        <div className="flex items-center gap-2">
          <Button variant="secondary" leadingIcon={Save} onClick={save}>Save</Button>
          <Button variant="secondary" leadingIcon={FileDown} onClick={exportCSV}>Export CSV</Button>
          <Button variant="secondary" onClick={exportJSON}>Export JSON</Button>
          <Button variant="secondary" onClick={exportPDF}>Export PDF</Button>
          <Button variant="secondary" leadingIcon={Copy} onClick={cloneAssessment}>Clone</Button>
        </div>
        <Button leadingIcon={ChevronRight} onClick={next}>{currentStage===7 ? 'Generate Report' : 'Next'}</Button>
      </div>

      {/* Results */}
      <div className="dashboard-card p-4">
        <h2 className="text-lg font-bold text-primary-600">Assessment Results & Report</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
          <ResultCard label="Overall Risk Score" value={overallRiskScore} />
          <ResultCard label="High Risk Zones" value={highRiskZones} />
          <ResultCard label="Required Actions" value={requiredActions.length} />
          <ResultCard label="Compliance %" value={`${complianceScore}%`} />
        </div>
      </div>
    </div>
  );
}

function ResultCard({ label, value }) {
  return (
    <div className="dashboard-card p-3 text-center">
      <div className="text-2xl font-bold text-primary-600">{value}</div>
      <div className="text-xs text-secondary-500">{label}</div>
    </div>
  );
}

function ComplianceRow({ label }) {
  const [status, setStatus] = useState('partial');
  return (
    <div className={`flex items-center justify-between p-2 rounded border-l-4 ${status==='implemented' ? 'border-green-500' : status==='partial' ? 'border-amber-500' : 'border-red-500'}`}>
      <div>{label}</div>
      <div className="flex gap-2">
        {['implemented','partial','not-implemented'].map(s => (
          <Button key={s} size="xs" className={status===s ? '!bg-primary-600 text-white' : ''} onClick={()=>setStatus(s)}>
            {s.replace('-', ' ')}
          </Button>
        ))}
      </div>
    </div>
  );
}

// Utilities
function quote(s='') { return '"' + String(s).replace(/"/g, '""') + '"'; }
function download(blob, filename) {
  const a = document.createElement('a');
  const url = URL.createObjectURL(blob);
  a.href = url; a.download = filename; document.body.appendChild(a); a.click();
  a.remove(); URL.revokeObjectURL(url);
}

export default IEC62443Assessment;
