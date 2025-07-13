import React, { useState } from 'react';
import PropTypes from 'prop-types';
import EvidenceGraph from '../../molecules/EvidenceGraph';

/* ------------------------------------------------------------------
 * Mock data for the graph (three items each to keep file concise)
 * ------------------------------------------------------------------ */
const controls = [
  { id: 'ctrl-001', name: 'MFA', description: 'Multi-Factor Authentication', status: 'complete' },
  { id: 'ctrl-002', name: 'Access Reviews', description: 'Quarterly reviews', status: 'partial' },
  { id: 'ctrl-003', name: 'Encryption', description: 'Data-at-rest & in-transit', status: 'complete' }
];

const requirements = [
  { id: 'req-001', name: 'NIST CSF PR.AC-1', description: 'Identity management', framework: 'NIST CSF' },
  { id: 'req-002', name: 'ISO 27001 A.9.2.3', description: 'Privileged access', framework: 'ISO 27001' },
  { id: 'req-003', name: 'PCI DSS 12.3', description: 'Access control', framework: 'PCI DSS' }
];

const risks = [
  { id: 'risk-001', name: 'Unauthorized Access', description: 'Access to sensitive data', score: 15 },
  { id: 'risk-002', name: 'Data Breach', description: 'Exposure of data', score: 10 },
  { id: 'risk-003', name: 'Compliance Violation', description: 'Regulatory fines', score: 8 }
];

const relationships = [
  /* evidence—>control */
  { source: 'EV-1001', target: 'ctrl-001', type: 'supports' },
  { source: 'EV-1002', target: 'ctrl-003', type: 'validates' },
  { source: 'EV-1003', target: 'ctrl-002', type: 'supports' },
  /* control—>requirement */
  { source: 'ctrl-001', target: 'req-001', type: 'satisfies' },
  { source: 'ctrl-002', target: 'req-002', type: 'satisfies' },
  { source: 'ctrl-003', target: 'req-003', type: 'satisfies' },
  /* control—>risk */
  { source: 'ctrl-001', target: 'risk-001', type: 'mitigates' },
  { source: 'ctrl-003', target: 'risk-002', type: 'mitigates' },
  { source: 'ctrl-002', target: 'risk-003', type: 'mitigates' }
];

/**
 * GraphTab Component
 * 
 * Displays an interactive graph visualization of relationships between 
 * evidence artifacts, controls, requirements, and risks.
 */
const GraphTab = ({ evidenceItems }) => {
  /* ------------------------------------------------------------------
   * Local state & handlers
   * ------------------------------------------------------------------ */
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [highlightedPath, setHighlightedPath] = useState(null);

  const handleNodeSelect = (nodeId) => {
    setSelectedNodeId(nodeId);
    if (nodeId) console.log(`Selected node: ${nodeId}`);
  };

  const handleHighlightPath = (path) => {
    setHighlightedPath(path);
    console.log('Highlighted path:', path);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-secondary-800 rounded-lg border border-secondary-200 dark:border-secondary-700 p-4 mb-4">
        <p className="text-secondary-600 dark:text-secondary-400">
          This interactive graph visualizes relationships between evidence artifacts, controls, requirements, and risks.
          The "golden thread" architecture allows you to trace from risks through controls to the supporting evidence.
        </p>
      </div>

      {/* Tab Navigation */}
      {/* Graph Content */}
      <div className="bg-white dark:bg-secondary-800 rounded-lg border border-secondary-200 dark:border-secondary-700 p-4">
        <EvidenceGraph
          evidenceItems={evidenceItems}
          controls={controls}
          requirements={requirements}
          risks={risks}
          relationships={relationships}
          selectedNodeId={selectedNodeId}
          onNodeSelect={handleNodeSelect}
          highlightedPath={highlightedPath}
          onHighlightPath={handleHighlightPath}
          className="h-[700px]"
        />
      </div>
    </div>
  );
};

GraphTab.propTypes = {
  evidenceItems: PropTypes.array.isRequired
};

export default GraphTab;
