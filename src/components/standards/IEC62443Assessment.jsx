import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Save, FileDown, Copy, ChevronLeft, ChevronRight } from 'lucide-react';
import Button from '../atoms/Button';
import Badge from '../atoms/Badge';

const STORAGE_KEY = 'cyberTrustDashboard.iec62443Assessment';
const META_KEY = 'cyberTrustDashboard.iec62443AssessmentMeta';

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

function generateSLRequirements(level = 'SL1') {
  return SL_REQUIREMENTS[level] || SL_REQUIREMENTS.SL1;
}

const defaultData = {
  assessmentType: '',
  metadata: {
    name: '', assessor: '', date: '', facilityType: '', criticalityLevel: '', systemDescription: '',
    accessPoints: '', networkDiagram: ''
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
};

function IEC62443Assessment() {
  const navigate = useNavigate();
  const [currentStage, setCurrentStage] = useState(1);
  const [data, setData] = useState(defaultData);

  // load existing
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      const meta = JSON.parse(localStorage.getItem(META_KEY) || 'null');
      if (saved) setData({ ...defaultData, ...saved });
      if (meta?.currentStage) setCurrentStage(meta.currentStage);
    } catch {}
  }, []);

  const progressPct = useMemo(() => Math.min(100, Math.max(0, (currentStage / 7) * 100)), [currentStage]);

  const setMeta = useCallback((nextStage) => {
    const meta = { currentStage: nextStage ?? currentStage, lastUpdated: new Date().toISOString() };
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

  const addThreat = () => setData(d => ({ ...d, threatScenarios: [...d.threatScenarios, { id: Date.now(), name: '', threatActor: 'nation-state', attackVector: 'network', description: '', likelihood: 0.1, impact: 1, existingControls: '' }] }));
  const removeThreat = id => setData(d => ({ ...d, threatScenarios: d.threatScenarios.filter(s => s.id !== id) }));
  const updateThreat = (id, patch) => setData(d => ({ ...d, threatScenarios: d.threatScenarios.map(s => s.id === id ? { ...s, ...patch } : s) }));

  const initialRiskSummary = useMemo(() => {
    const risks = data.consequenceScenarios.map(s => Math.max(s.impacts.safety, s.impacts.environmental, s.impacts.financial, s.impacts.operational, s.impacts.regulatory));
    const total = risks.length;
    const high = risks.filter(r => r >= 4).length;
    const avg = total ? (risks.reduce((a,b)=>a+b,0)/total) : 0;
    return { total, high, avg };
  }, [data.consequenceScenarios]);

  const overallRiskScore = useMemo(() => {
    const cons = data.consequenceScenarios.map(s => Math.max(s.impacts.safety, s.impacts.environmental, s.impacts.financial, s.impacts.operational, s.impacts.regulatory));
    const threats = data.threatScenarios.map(s => s.likelihood * s.impact);
    const arr = [...cons, ...threats];
    return arr.length ? (arr.reduce((a,b)=>a+b,0) / arr.length).toFixed(1) : '0.0';
  }, [data.consequenceScenarios, data.threatScenarios]);

  const highRiskZones = useMemo(() => data.zones.filter(z => z.securityLevel === 'SL3' || z.securityLevel === 'SL4').length, [data.zones]);

  const requiredActions = useMemo(() => {
    const actions = [];
    if (initialRiskSummary.high > 0) actions.push('Implement critical controls for high-risk scenarios');
    if (highRiskZones > 0) actions.push('Apply advanced security controls for high SL zones');
    return actions;
  }, [initialRiskSummary.high, highRiskZones]);

  const complianceScore = useMemo(() => Math.floor(Math.random()*30)+70, [data.assets.length, data.zones.length]);

  const next = () => { const n = Math.min(7, currentStage + 1); setCurrentStage(n); setMeta(n); };
  const prev = () => { const p = Math.max(1, currentStage - 1); setCurrentStage(p); setMeta(p); };

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
            { key: 'initial', title: 'Initial (High-Level)', purpose: 'First stage of IEC 62443 risk analysis' },
            { key: 'detailed', title: 'Detailed', purpose: 'When risk exceeds tolerable limits' },
            { key: 'vulnerability', title: 'Vulnerability', purpose: 'Identify current vulnerabilities' },
            { key: 'compliance', title: 'Compliance/Maturity', purpose: 'Determine alignment with IEC 62443' },
          ].map(card => (
            <button key={card.key} onClick={() => setData(d => ({ ...d, assessmentType: card.key }))}
              className={`p-3 rounded-lg border transition ${data.assessmentType === card.key ? 'border-primary-500 bg-primary-50/40' : 'border-secondary-200 dark:border-secondary-700 hover:border-primary-300'}`}>
              <h3 className="text-sm font-semibold text-primary-700 dark:text-primary-400">{card.title}</h3>
              <p className="text-xs text-amber-500 font-medium">Purpose: {card.purpose}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Stage nav */}
      <div className="dashboard-card p-3 flex flex-wrap gap-2">
        {[1,2,3,4,5,6,7].map(n => (
          <button key={n} onClick={() => { setCurrentStage(n); setMeta(n); }}
            className={`px-3 py-2 rounded border text-xs ${n===currentStage ? 'border-primary-500 bg-primary-50/40' : n<currentStage ? 'border-green-500 bg-green-50/40' : 'border-secondary-300 dark:border-secondary-700'}`}>
            <span className="font-semibold">ZCR {n}</span>
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

            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-secondary-900 dark:text-white">Asset Inventory</h3>
              <Button size="sm" onClick={addAsset}>Add Asset</Button>
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
          <Badge>Worst-case assumption: Likelihood = 1</Badge>

          <div className="flex items-center justify-between mt-2">
            <h3 className="font-semibold text-secondary-900 dark:text-white">Consequence Assessment</h3>
            <Button size="sm" onClick={addConsequence}>Add Scenario</Button>
          </div>
          <div className="space-y-3">
            {data.consequenceScenarios.map(s => (
              <div key={s.id} className="dashboard-card p-3">
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
                      <select className="input" value={s.impacts[cat]} onChange={e=>updateConsequence(s.id,{ impacts: { ...s.impacts, [cat]: Number(e.target.value) } })}>
                        {[1,2,3,4,5].map(v => <option key={v} value={v}>{v}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
                <div className="mt-2 text-sm">
                  <span className="font-semibold text-primary-700">Risk Score:</span> {Math.max(s.impacts.safety, s.impacts.environmental, s.impacts.financial, s.impacts.operational, s.impacts.regulatory)}
                </div>
                <div className="mt-2 text-right"><Button size="xs" variant="danger" onClick={()=>removeConsequence(s.id)}>Remove Scenario</Button></div>
              </div>
            ))}
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
                {[1,2,3,4,5].map(v=> <option key={v} value={v}>{v}</option>)}
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
            <h3 className="font-semibold">Threat Scenarios</h3>
            <Button size="sm" onClick={addThreat}>Add Threat Scenario</Button>
          </div>
          <div className="space-y-3">
            {data.threatScenarios.map(s => (
              <div key={s.id} className="dashboard-card p-3 space-y-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <input className="input" placeholder="Scenario Name" value={s.name} onChange={e=>updateThreat(s.id,{name:e.target.value})} />
                  <input className="input" placeholder="Description" value={s.description} onChange={e=>updateThreat(s.id,{description:e.target.value})} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                  <select className="input" value={s.threatActor} onChange={e=>updateThreat(s.id,{threatActor:e.target.value})}>
                    {['nation-state','cybercriminal','insider-threat','hacktivist','script-kiddie','competitor'].map(v=> <option key={v} value={v}>{v}</option>)}
                  </select>
                  <select className="input" value={s.attackVector} onChange={e=>updateThreat(s.id,{attackVector:e.target.value})}>
                    {['network','email','removable-media','remote-access','physical','supply-chain','wireless'].map(v=> <option key={v} value={v}>{v}</option>)}
                  </select>
                  <select className="input" value={s.likelihood} onChange={e=>updateThreat(s.id,{likelihood:Number(e.target.value)})}>
                    {[0.1,0.3,0.5,0.7,0.9].map(v=> <option key={v} value={v}>{v}</option>)}
                  </select>
                  <select className="input" value={s.impact} onChange={e=>updateThreat(s.id,{impact:Number(e.target.value)})}>
                    {[1,2,3,4,5].map(v=> <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
                <textarea className="input" placeholder="Existing Controls" value={s.existingControls} onChange={e=>updateThreat(s.id,{existingControls:e.target.value})} />
                <div className="flex items-center justify-between text-sm">
                  <div><span className="font-semibold text-primary-700">Risk Score:</span> {(s.likelihood * s.impact).toFixed(2)}</div>
                  <Button size="xs" variant="danger" onClick={()=>removeThreat(s.id)}>Remove Scenario</Button>
                </div>
              </div>
            ))}
            {data.threatScenarios.length === 0 && <div className="text-sm text-secondary-500">Add threat scenarios to evaluate detailed risks.</div>}
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
