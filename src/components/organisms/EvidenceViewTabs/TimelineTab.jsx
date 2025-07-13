import React, { useState } from 'react';
import EvidenceLifecycleTimeline from '../../molecules/EvidenceLifecycleTimeline';

/**
 * TimelineTab Component
 * 
 * Displays the evidence lifecycle timeline with predictive decay modeling
 * and compliance refresh points.
 */
const TimelineTab = () => {
  // Time range and selection state
  const [timeRange] = useState({ months: 24 });
  const [selectedEvidence, setSelectedEvidence] = useState(null);

  /* ------------------------------------------------------------------
   * Mock – evidence items (spanning last 24 months)
   * ------------------------------------------------------------------ */
  const now = new Date();
  const monthsAgo = (n) => {
    const d = new Date(now);
    d.setMonth(d.getMonth() - n);
    return d.toISOString();
  };

  const mockEvidenceItems = [
    {
      id: 'ev-001',
      title: 'MFA Policy',
      type: 'Intent',
      timestamp: monthsAgo(2),          // fresh
      status: 'fresh'
    },
    {
      id: 'ev-002',
      title: 'Access Review Q2',
      type: 'Validation',
      timestamp: monthsAgo(7),          // aging
      status: 'aging'
    },
    {
      id: 'ev-003',
      title: 'Encryption Config',
      type: 'Implementation',
      timestamp: monthsAgo(13),         // stale
      status: 'stale'
    },
    {
      id: 'ev-004',
      title: 'Vulnerability Scan',
      type: 'Behavioral',
      timestamp: monthsAgo(5),
      status: 'aging'
    },
    {
      id: 'ev-005',
      title: 'Incident Response Drill',
      type: 'Validation',
      timestamp: monthsAgo(20),
      status: 'stale'
    },
    // --- additional mock evidence items for a richer timeline ---
    {
      id: 'ev-006',
      title: 'Config Audit',
      type: 'Validation',
      timestamp: monthsAgo(1),
      status: 'fresh'
    },
    {
      id: 'ev-007',
      title: 'Security Training Records',
      type: 'Behavioral',
      timestamp: monthsAgo(3),
      status: 'aging'
    },
    {
      id: 'ev-008',
      title: 'Backup Logs',
      type: 'Implementation',
      timestamp: monthsAgo(6),
      status: 'stale'
    },
    {
      id: 'ev-009',
      title: 'Change Management Policy',
      type: 'Intent',
      timestamp: monthsAgo(9),
      status: 'fresh'
    },
    {
      id: 'ev-010',
      title: 'Patch Management Report',
      type: 'Validation',
      timestamp: monthsAgo(12),
      status: 'aging'
    },
    {
      id: 'ev-011',
      title: 'Incident Response Drill Evidence',
      type: 'Behavioral',
      timestamp: monthsAgo(15),
      status: 'stale'
    },
    {
      id: 'ev-012',
      title: 'Access Control Matrix',
      type: 'Implementation',
      timestamp: monthsAgo(18),
      status: 'fresh'
    },
    {
      id: 'ev-013',
      title: 'Encryption Key Rotation Schedule',
      type: 'Intent',
      timestamp: monthsAgo(21),
      status: 'aging'
    },
    {
      id: 'ev-014',
      title: 'Network Diagram',
      type: 'Implementation',
      timestamp: monthsAgo(23),
      status: 'stale'
    }
  ];

  // Local state holding the evidence list
  const [evidenceList] = useState(mockEvidenceItems);

  /* ------------------------------------------------------------------
   * Mock – compliance refresh requirements (could come from API later)
   * ------------------------------------------------------------------ */
  const complianceRequirements = [
    {
      name: 'ISO 27001 A.9.2.1',
      refreshIntervalMonths: 12,
      evidenceTypes: ['Intent', 'Validation'],
      frameworks: ['ISO 27001']
    },
    {
      name: 'SOC 2 CC7.1',
      refreshIntervalMonths: 6,
      evidenceTypes: ['Implementation', 'Behavioral', 'Validation'],
      frameworks: ['SOC 2']
    },
    {
      name: 'NIST CSF PR.AC-1',
      refreshIntervalMonths: 9,
      evidenceTypes: ['Intent', 'Implementation', 'Validation'],
      frameworks: ['NIST CSF']
    },
    {
      name: 'PCI DSS 12.3',
      refreshIntervalMonths: 3,
      evidenceTypes: ['Behavioral', 'Validation'],
      frameworks: ['PCI DSS']
    },
    {
      name: 'GDPR Article 32',
      refreshIntervalMonths: 24,
      evidenceTypes: ['Intent', 'Validation'],
      frameworks: ['GDPR']
    }
  ];

  /* ------------------------------------------------------------------
   * Event handlers
   * ------------------------------------------------------------------ */
  const handleTimePointSelect = (date) => {
    console.log('Time point selected:', date);
  };

  const handleEvidenceSelect = (evidence) => {
    setSelectedEvidence(evidence.id);
    console.log(`Selected evidence: ${evidence.id}`);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-secondary-800 rounded-lg border border-secondary-200 dark:border-secondary-700 p-4 mb-4">
        <p className="text-secondary-600 dark:text-secondary-400">
          The lifecycle timeline visualizes evidence freshness over time with predictive decay modeling.
          It shows historical events, current state, and forecasts when evidence will need refreshing.
        </p>
      </div>

      {/* Evidence Lifecycle Timeline */}
      <div className="bg-white dark:bg-secondary-800 rounded-lg border border-secondary-200 dark:border-secondary-700 p-4">
        <EvidenceLifecycleTimeline
          evidenceItems={evidenceList}
          complianceRequirements={complianceRequirements}
          timeRange={timeRange}
          onTimePointSelect={handleTimePointSelect}
          onEvidenceSelect={handleEvidenceSelect}
          selectedEvidence={selectedEvidence}
        />
      </div>
    </div>
  );
};

export default TimelineTab;
