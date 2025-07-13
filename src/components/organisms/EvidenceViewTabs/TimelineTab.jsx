import React, { useState } from 'react';
import PropTypes from 'prop-types';
import EvidenceLifecycleTimeline from '../../molecules/EvidenceLifecycleTimeline';

/**
 * TimelineTab Component
 * 
 * Displays the evidence lifecycle timeline with predictive decay modeling
 * and compliance refresh points.
 */
const TimelineTab = ({ evidenceItems }) => {
  // Time range and selection state
  const [timeRange] = useState({ months: 24 });
  const [selectedEvidence, setSelectedEvidence] = useState(null);

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
          evidenceItems={evidenceItems}
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

TimelineTab.propTypes = {
  evidenceItems: PropTypes.array.isRequired
};

export default TimelineTab;
