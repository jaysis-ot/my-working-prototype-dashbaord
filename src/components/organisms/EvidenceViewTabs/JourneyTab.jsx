import React, { useState } from 'react';
import EvidenceJourneyMap from '../../molecules/EvidenceJourneyMap';

/**
 * JourneyTab Component
 * 
 * Displays a journey map visualization of the evidence lifecycle,
 * showing the relationships between threats, risks, capabilities,
 * controls, evidence, and trust scores.
 */
const JourneyTab = () => {
  /* ------------------------------------------------------------------
   * Mock journey-map data (three items per category)
   * ------------------------------------------------------------------ */
  const journeyData = {
    primary: {
      threat: [
        { id: 'th-1', name: 'Phishing', coverage: 75 },
        { id: 'th-2', name: 'Malware', coverage: 82 },
        { id: 'th-3', name: 'Privilege Esc.', coverage: 60 }
      ],
      risk: [
        { id: 'rk-1', name: 'Account Takeover', coverage: 70 },
        { id: 'rk-2', name: 'Data Breach', coverage: 80 },
        { id: 'rk-3', name: 'Policy Violation', coverage: 65 }
      ],
      capability: [
        { id: 'cap-1', name: 'Email Security', coverage: 90 },
        { id: 'cap-2', name: 'Endpoint AV', coverage: 85 },
        { id: 'cap-3', name: 'Access Control', coverage: 78 }
      ],
      control: [
        { id: 'ctl-1', name: 'SPF / DKIM', coverage: 95 },
        { id: 'ctl-2', name: 'EDR', coverage: 88 },
        { id: 'ctl-3', name: 'MFA', coverage: 92 }
      ],
      evidence: [
        { id: 'ev-1', name: 'DKIM Report', status: 'fresh' },
        { id: 'ev-2', name: 'EDR Logs', status: 'aging' },
        { id: 'ev-3', name: 'MFA Config', status: 'fresh' }
      ],
      trustScore: [
        { id: 'ts-1', name: 'Email Security Score', coverage: 90 },
        { id: 'ts-2', name: 'Endpoint Score', coverage: 88 },
        { id: 'ts-3', name: 'Access Score', coverage: 92 }
      ]
    },
    /* ----------------------------------------------------------------
     * Compliance journey (Framework → Requirement → Policy → 
     * Implementation → Validation → Monitoring)
     * ---------------------------------------------------------------- */
    compliance: {
      framework: [
        { id: 'fw-1', name: 'ISO 27001', coverage: 85 },
        { id: 'fw-2', name: 'SOC 2', coverage: 78 },
        { id: 'fw-3', name: 'PCI DSS', coverage: 72 }
      ],
      requirement: [
        { id: 'req-1', name: 'A.9.2.1 User Access', coverage: 80 },
        { id: 'req-2', name: 'CC7.1 Change Mgmt', coverage: 76 },
        { id: 'req-3', name: '12.3 Key Mgmt', coverage: 69 }
      ],
      policy: [
        { id: 'pol-1', name: 'Access Control Policy', coverage: 88 },
        { id: 'pol-2', name: 'Encryption Policy', coverage: 83 },
        { id: 'pol-3', name: 'Incident Response Policy', coverage: 75 }
      ],
      implementation: [
        { id: 'impl-1', name: 'MFA Config', coverage: 82 },
        { id: 'impl-2', name: 'Database Encryption', coverage: 71 },
        { id: 'impl-3', name: 'Backup Automation', coverage: 69 }
      ],
      validation: [
        { id: 'val-1', name: 'Pen-Test Results', status: 'complete', coverage: 90 },
        { id: 'val-2', name: 'Quarterly Access Review', status: 'partial', coverage: 65 },
        { id: 'val-3', name: 'DR Test Report', status: 'missing', coverage: 40 }
      ],
      monitoring: [
        { id: 'mon-1', name: 'SIEM Alerts', coverage: 78 },
        { id: 'mon-2', name: 'CloudTrail Logs', coverage: 74 },
        { id: 'mon-3', name: 'Vuln Scan Dashboard', coverage: 70 }
      ]
    },
    paths: [
      { id: 'p1', name: 'Email Threat Journey' },
      { id: 'p2', name: 'Endpoint Threat Journey' },
      { id: 'p3', name: 'Access Control Journey' }
    ]
  };

  /* ------------------------------------------------------------------ */
  const [selectedPath, setSelectedPath] = useState(null);
  const [highlightedElement, setHighlightedElement] = useState(null);

  const handlePathSelect = (id) => {
    setSelectedPath(id);
    console.log('Path selected:', id);
  };

  const handleNodeClick = (type, node) => {
    setHighlightedElement({ type, id: node.id });
    console.log(`Node clicked: ${type} ${node.id}`);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-secondary-800 rounded-lg border border-secondary-200 dark:border-secondary-700 p-4 mb-4">
        <p className="text-secondary-600 dark:text-secondary-400">
          The evidence journey map visualizes the relationships between threats, risks, capabilities, 
          controls, evidence, and trust scores in the "golden thread" architecture.
        </p>
      </div>
      
      <div className="bg-white dark:bg-secondary-800 rounded-lg border border-secondary-200 dark:border-secondary-700 p-4">
        <EvidenceJourneyMap
          data={journeyData}
          selectedPath={selectedPath}
          onPathSelect={handlePathSelect}
          onNodeClick={handleNodeClick}
          highlightedElement={highlightedElement}
        />
      </div>
    </div>
  );
};

export default JourneyTab;
