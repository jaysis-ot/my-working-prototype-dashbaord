import React, { useState, useEffect, useMemo } from 'react';
import { 
  FileText, 
  Shield, 
  AlertTriangle, 
  Lock, 
  Info, 
  BarChart, 
  Clock, 
  Network, 
  CheckCircle, 
  Activity,
  AlertCircle,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Filter,
  Download,
  Layers
} from 'lucide-react';
import EvidenceGraph from '../molecules/EvidenceGraph';
import EvidenceLifecycleTimeline from '../molecules/EvidenceLifecycleTimeline';
import useEvidenceScoring from '../../hooks/useEvidenceScoring';
import Button from '../atoms/Button';
import Badge from '../atoms/Badge';

/**
 * AdvancedEvidenceDemo Page Component
 * 
 * A demonstration page showcasing advanced evidence visualization components:
 * - Interactive evidence relationship graph
 * - Evidence lifecycle timeline with predictive decay
 * - ML-driven evidence scoring and quality analysis
 * 
 * This page demonstrates how these components work together to provide
 * a comprehensive view of evidence quality, relationships, and lifecycle.
 */
const AdvancedEvidenceDemo = () => {
  // State for selected evidence item
  const [selectedEvidence, setSelectedEvidence] = useState(null);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [highlightedPath, setHighlightedPath] = useState(null);
  const [activeSection, setActiveSection] = useState('all');
  
  // Sample data for the demo
  const evidenceItems = [
    {
      id: 'ev-001',
      title: 'Access Control Policy',
      description: 'Formal policy document defining access control requirements and procedures',
      type: 'Intent',
      status: 'fresh',
      timestamp: '2025-06-01T10:00:00Z',
      owner: 'Security Policy Team',
      metadata: {
        approvedBy: 'CISO',
        version: '2.3',
        documentId: 'POL-AC-001',
        updateFrequency: 6 // months
      },
      content: {
        scope: 'All corporate systems and data',
        purpose: 'To establish requirements for access control',
        policy: 'Access shall be granted based on least privilege principles...',
        responsibilities: 'System owners are responsible for implementing...',
        approval: 'Approved by the CISO on June 1, 2025'
      },
      relationships: [
        { label: 'ISO 27001', type: 'framework' },
        { label: 'Access Control', type: 'capability' },
        { label: 'Unauthorized Access', type: 'risk' }
      ]
    },
    {
      id: 'ev-002',
      title: 'MFA Implementation',
      description: 'Technical implementation of multi-factor authentication across all systems',
      type: 'Implementation',
      /* Mark as “aging” so the timeline shows a richer mix. */
      status: 'aging',
      timestamp: '2025-05-15T14:30:00Z',
      owner: 'IT Security Team',
      metadata: {
        implementedBy: 'Infrastructure Team',
        implementationDate: '2025-05-15T14:30:00Z'
      },
      content: {
        description: 'Implementation of MFA across all corporate systems',
        implementationSteps: [
          'Configured MFA settings in Azure AD',
          'Enabled MFA for all admin accounts',
          'Rolled out MFA to all users in phases'
        ],
        testResults: {
          adminAccounts: 'Pass',
          standardUsers: 'Pass',
          exceptions: 'Pass'
        }
      },
      attachments: [
        { type: 'screenshot', name: 'mfa-settings.png' },
        { type: 'config', name: 'mfa-config.json' }
      ],
      relationships: [
        { label: 'Access Control Policy', type: 'intent' },
        { label: 'Access Control', type: 'capability' },
        { label: 'Unauthorized Access', type: 'risk' }
      ]
    },
    {
      id: 'ev-003',
      title: 'MFA Usage Metrics',
      description: 'Runtime data showing MFA usage patterns and success/failure rates',
      type: 'Behavioral',
      status: 'fresh',
      timestamp: '2025-07-01T09:15:00Z',
      owner: 'Security Operations',
      metadata: {
        collectionMethod: 'automated',
        collectionDate: '2025-07-01T09:15:00Z',
        source: 'Azure AD Logs'
      },
      content: {
        observations: [
          'MFA is being used consistently across the organization',
          'Success rate is above 99.5%',
          'Mobile app authentication is the most common method'
        ],
        metrics: {
          totalAuthentications: 24567,
          mfaSuccessRate: 99.7,
          methodDistribution: {
            mobileApp: 78,
            sms: 15,
            phoneCall: 7
          }
        },
        duration: 30, // days
        sampleSize: 24567
      },
      attachments: [
        { type: 'data', name: 'mfa-metrics.csv' },
        { type: 'log', name: 'auth-logs.json' }
      ],
      relationships: [
        { label: 'MFA Implementation', type: 'implementation' },
        { label: 'Access Control', type: 'capability' }
      ]
    },
    {
      id: 'ev-004',
      title: 'Access Control Audit',
      description: 'Independent validation of access control implementation and effectiveness',
      type: 'Validation',
      status: 'fresh',
      timestamp: '2025-06-20T11:45:00Z',
      owner: 'Internal Audit',
      metadata: {
        assessor: 'Internal Audit Team',
        validationDate: '2025-06-20T11:45:00Z',
        independent: true
      },
      content: {
        methodology: 'Comprehensive review of access control implementations including policy review, configuration assessment, and testing',
        findings: [
          'MFA is properly implemented across all systems',
          'Access reviews are conducted quarterly',
          'Privileged access is appropriately restricted'
        ],
        conclusion: 'Access controls are effectively implemented and maintained',
        recommendations: [
          'Consider implementing risk-based authentication',
          'Enhance monitoring of privileged access'
        ]
      },
      relationships: [
        { label: 'Access Control Policy', type: 'intent' },
        { label: 'MFA Implementation', type: 'implementation' },
        { label: 'ISO 27001', type: 'framework' },
        { label: 'Access Control', type: 'capability' }
      ]
    },
    {
      id: 'ev-005',
      title: 'Data Encryption Policy',
      description: 'Policy defining requirements for data encryption',
      type: 'Intent',
      status: 'aging',
      timestamp: '2025-01-10T09:00:00Z',
      owner: 'Security Policy Team',
      metadata: {
        approvedBy: 'CISO',
        version: '1.5',
        documentId: 'POL-ENC-001'
      },
      content: {
        scope: 'All sensitive data at rest and in transit',
        purpose: 'To establish requirements for data encryption',
        policy: 'All sensitive data must be encrypted using approved algorithms...',
        responsibilities: 'System owners are responsible for implementing encryption...',
        approval: 'Approved by the CISO on January 10, 2025'
      },
      relationships: [
        { label: 'ISO 27001', type: 'framework' },
        { label: 'Data Protection', type: 'capability' },
        { label: 'Data Breach', type: 'risk' }
      ]
    },
    {
      id: 'ev-006',
      title: 'Database Encryption Implementation',
      description: 'Technical implementation of database encryption',
      type: 'Implementation',
      status: 'aging',
      timestamp: '2025-02-15T13:20:00Z',
      owner: 'Database Team',
      metadata: {
        implementedBy: 'Database Team',
        implementationDate: '2025-02-15T13:20:00Z'
      },
      content: {
        description: 'Implementation of TDE for all production databases',
        implementationSteps: [
          'Enabled TDE on all SQL Server databases',
          'Configured key management',
          'Verified encryption status'
        ],
        testResults: {
          encryptionStatus: 'Pass',
          performanceImpact: 'Minimal',
          keyManagement: 'Pass'
        }
      },
      relationships: [
        { label: 'Data Encryption Policy', type: 'intent' },
        { label: 'Data Protection', type: 'capability' },
        { label: 'Data Breach', type: 'risk' }
      ]
    },
    {
      id: 'ev-007',
      title: 'Encryption Effectiveness Assessment',
      description: 'Validation of encryption implementations',
      type: 'Validation',
      status: 'stale',
      timestamp: '2024-11-05T10:30:00Z',
      owner: 'Security Assessment Team',
      metadata: {
        assessor: 'External Security Consultant',
        validationDate: '2024-11-05T10:30:00Z',
        independent: true
      },
      content: {
        methodology: 'Assessment of encryption implementations including key management practices',
        findings: [
          'Database encryption is properly implemented',
          'Key management processes are sound',
          'Some legacy systems lack proper encryption'
        ],
        conclusion: 'Encryption is generally effective but improvements needed for legacy systems',
        recommendations: [
          'Develop plan to address legacy system encryption',
          'Enhance key rotation processes'
        ]
      },
      relationships: [
        { label: 'Data Encryption Policy', type: 'intent' },
        { label: 'Database Encryption Implementation', type: 'implementation' },
        { label: 'Data Protection', type: 'capability' }
      ]
    },
    /* ---------- Additional mock evidence to enrich timeline ---------- */
    {
      id: 'ev-008',
      title: 'Legacy System Encryption Road-Map',
      description: 'Project plan to remediate legacy systems lacking encryption',
      type: 'Intent',
      status: 'fresh',
      /* Very recent – shows right-most of the timeline */
      timestamp: '2025-08-05T08:00:00Z',
      owner: 'Transformation PMO',
      metadata: { approvedBy: 'CTO', version: '0.9-draft' },
      content: { scope: 'Legacy on-prem systems', purpose: 'Define path to full encryption' },
      relationships: [
        { label: 'Data Encryption Policy', type: 'intent' },
        { label: 'Data Breach', type: 'risk' }
      ]
    },
    {
      id: 'ev-009',
      title: 'Quarterly Access Review – Q4 2024',
      description: 'Behavioral evidence showing completion of quarterly access reviews',
      type: 'Behavioral',
      status: 'stale',
      /* ~10 months old to appear mid-timeline in “stale” zone */
      timestamp: '2024-10-10T12:00:00Z',
      owner: 'IT Compliance',
      metadata: {
        collectionMethod: 'manual',
        collectionDate: '2024-10-10T12:00:00Z'
      },
      content: {
        observations: ['All 152 privileged accounts reviewed', '12 removals executed'],
        metrics: { totalAccountsReviewed: 152, removals: 12 },
        duration: 7,
        sampleSize: 152
      },
      relationships: [
        { label: 'Access Reviews', type: 'control' },
        { label: 'Unauthorized Access', type: 'risk' }
      ]
    },
    {
      id: 'ev-010',
      title: 'MFA Roll-Out Post-Implementation Review',
      description: 'Validation assessment 18 months ago to confirm MFA adoption',
      type: 'Validation',
      status: 'stale',
      /* ~18 months ago to hit left side of timeline */
      timestamp: '2024-02-01T09:00:00Z',
      owner: 'External Auditor',
      metadata: { assessor: 'Big 4 Audit', independent: true },
      content: {
        methodology: 'Sampled 500 users; verified successful MFA challenges',
        findings: ['Adoption rate 92%', '15 legacy apps without MFA'],
        conclusion: 'Overall effective with minor gaps'
      },
      relationships: [
        { label: 'MFA Implementation', type: 'implementation' },
        { label: 'ISO 27001', type: 'framework' }
      ]
    }
  ];
  
  const controls = [
    {
      id: 'ctrl-001',
      name: 'Multi-Factor Authentication',
      description: 'Requires multiple forms of authentication for system access',
      type: 'preventive',
      status: 'implemented',
      effectiveness: 95
    },
    {
      id: 'ctrl-002',
      name: 'Access Reviews',
      description: 'Periodic review of user access rights',
      type: 'detective',
      status: 'implemented',
      effectiveness: 85
    },
    {
      id: 'ctrl-003',
      name: 'Database Encryption',
      description: 'Encryption of sensitive data in databases',
      type: 'preventive',
      status: 'implemented',
      effectiveness: 90
    },
    {
      id: 'ctrl-004',
      name: 'Data Loss Prevention',
      description: 'Controls to prevent unauthorized data exfiltration',
      type: 'preventive',
      status: 'partial',
      effectiveness: 75
    }
  ];
  
  const requirements = [
    {
      id: 'req-001',
      name: 'A.9.2.1 User Registration',
      description: 'A formal user registration and de-registration process shall be implemented to enable assignment of access rights',
      framework: 'ISO 27001',
      controlId: 'ctrl-001'
    },
    {
      id: 'req-002',
      name: 'A.9.2.3 Management of Privileged Access Rights',
      description: 'The allocation and use of privileged access rights shall be restricted and controlled',
      framework: 'ISO 27001',
      controlId: 'ctrl-002'
    },
    {
      id: 'req-003',
      name: 'A.10.1.1 Policy on the Use of Cryptographic Controls',
      description: 'A policy on the use of cryptographic controls for protection of information shall be developed and implemented',
      framework: 'ISO 27001',
      controlId: 'ctrl-003'
    }
  ];
  
  const risks = [
    {
      id: 'risk-001',
      name: 'Unauthorized Access',
      description: 'Risk of unauthorized users gaining access to systems or data',
      impact: 4,
      likelihood: 3,
      score: 12
    },
    {
      id: 'risk-002',
      name: 'Data Breach',
      description: 'Risk of sensitive data being exposed to unauthorized parties',
      impact: 5,
      likelihood: 3,
      score: 15
    },
    {
      id: 'risk-003',
      name: 'Compliance Violation',
      description: 'Risk of failing to meet regulatory or compliance requirements',
      impact: 4,
      likelihood: 2,
      score: 8
    }
  ];
  
  const relationships = [
    // Evidence to Control relationships
    { source: 'ev-001', target: 'ctrl-001', type: 'supports', strength: 'strong' },
    { source: 'ev-002', target: 'ctrl-001', type: 'implements', strength: 'strong' },
    { source: 'ev-003', target: 'ctrl-001', type: 'validates', strength: 'medium' },
    { source: 'ev-004', target: 'ctrl-001', type: 'validates', strength: 'strong' },
    { source: 'ev-004', target: 'ctrl-002', type: 'validates', strength: 'medium' },
    { source: 'ev-005', target: 'ctrl-003', type: 'supports', strength: 'strong' },
    { source: 'ev-006', target: 'ctrl-003', type: 'implements', strength: 'strong' },
    { source: 'ev-007', target: 'ctrl-003', type: 'validates', strength: 'medium' },
    
    // Control to Requirement relationships
    { source: 'ctrl-001', target: 'req-001', type: 'satisfies', strength: 'strong' },
    { source: 'ctrl-002', target: 'req-002', type: 'satisfies', strength: 'strong' },
    { source: 'ctrl-003', target: 'req-003', type: 'satisfies', strength: 'strong' },
    
    // Control to Risk relationships
    { source: 'ctrl-001', target: 'risk-001', type: 'mitigates', strength: 'strong' },
    { source: 'ctrl-002', target: 'risk-001', type: 'mitigates', strength: 'medium' },
    { source: 'ctrl-003', target: 'risk-002', type: 'mitigates', strength: 'strong' },
    { source: 'ctrl-004', target: 'risk-002', type: 'mitigates', strength: 'medium' },
    
    // Evidence relationships
    { source: 'ev-002', target: 'ev-001', type: 'implements', strength: 'strong' },
    { source: 'ev-003', target: 'ev-002', type: 'validates', strength: 'medium' },
    { source: 'ev-004', target: 'ev-001', type: 'validates', strength: 'strong' },
    { source: 'ev-004', target: 'ev-002', type: 'validates', strength: 'strong' },
    { source: 'ev-006', target: 'ev-005', type: 'implements', strength: 'strong' },
    { source: 'ev-007', target: 'ev-005', type: 'validates', strength: 'medium' },
    { source: 'ev-007', target: 'ev-006', type: 'validates', strength: 'strong' }
  ];
  
  // Sample compliance requirements for evidence refresh
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
    /* New requirement: short cycle to create dense refresh markers */
    {
      name: 'PCI DSS 12.3',
      refreshIntervalMonths: 3,
      evidenceTypes: ['Behavioral', 'Validation'],
      frameworks: ['PCI DSS']
    },
    /* New requirement: long-term to show sparse markers */
    {
      name: 'GDPR Article 32',
      refreshIntervalMonths: 24,
      evidenceTypes: ['Intent', 'Validation'],
      frameworks: ['GDPR']
    }
  ];
  
  // Find the selected evidence item
  const selectedEvidenceItem = useMemo(() => {
    return evidenceItems.find(item => item.id === selectedEvidence);
  }, [selectedEvidence, evidenceItems]);
  
  // Use the evidence scoring hook
  const {
    scores,
    suggestions,
    predictions,
    getImprovementActions
  } = useEvidenceScoring(
    selectedEvidenceItem,
    evidenceItems.filter(item => item.id !== selectedEvidence),
    requirements.reduce((acc, req) => ({ ...acc, [req.id]: req }), {})
  );
  
  // Get improvement actions for the selected evidence
  const improvementActions = useMemo(() => {
    if (!selectedEvidenceItem || !scores.dimensions) return [];
    return getImprovementActions(scores.dimensions, selectedEvidenceItem.type);
  }, [selectedEvidenceItem, scores.dimensions, getImprovementActions]);
  
  // Handle node selection in the graph
  const handleNodeSelect = (nodeId) => {
    setSelectedNodeId(nodeId);
    
    // If it's an evidence node, select it for scoring
    const evidenceNode = evidenceItems.find(item => item.id === nodeId);
    if (evidenceNode) {
      setSelectedEvidence(nodeId);
    }
  };
  
  // Toggle section visibility
  const toggleSection = (section) => {
    if (activeSection === section) {
      setActiveSection('all');
    } else {
      setActiveSection(section);
    }
  };
  
  // Check if a section should be visible
  const isSectionVisible = (section) => {
    return activeSection === 'all' || activeSection === section;
  };
  
  return (
    <div className="container mx-auto py-8 px-4">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-secondary-900 dark:text-white mb-2">
          Advanced Evidence Visualization
        </h1>
        <p className="text-secondary-600 dark:text-secondary-400 max-w-3xl">
          Explore cutting-edge visualization techniques for evidence management, including relationship graphs,
          lifecycle timelines with predictive decay, and ML-driven evidence scoring.
        </p>
      </header>
      
      {/* Section Navigation */}
      <div className="flex flex-wrap gap-2 mb-8">
        <Button
          variant={activeSection === 'graph' ? 'primary' : 'secondary'}
          leadingIcon={Network}
          onClick={() => toggleSection('graph')}
        >
          Evidence Graph
        </Button>
        <Button
          variant={activeSection === 'timeline' ? 'primary' : 'secondary'}
          leadingIcon={Clock}
          onClick={() => toggleSection('timeline')}
        >
          Lifecycle Timeline
        </Button>
        <Button
          variant={activeSection === 'scoring' ? 'primary' : 'secondary'}
          leadingIcon={BarChart}
          onClick={() => toggleSection('scoring')}
        >
          Evidence Scoring
        </Button>
      </div>
      
      {/* Evidence Graph Section */}
      {isSectionVisible('graph') && (
        <section className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-secondary-900 dark:text-white flex items-center">
              <Network className="mr-2 h-6 w-6 text-primary-600" />
              Interactive Evidence Graph
            </h2>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                leadingIcon={Download}
              >
                Export Graph
              </Button>
            </div>
          </div>
          
          <div className="bg-white dark:bg-secondary-800 rounded-lg border border-secondary-200 dark:border-secondary-700 p-4 mb-4">
            <p className="text-secondary-600 dark:text-secondary-400">
              This interactive graph visualizes relationships between evidence artifacts, controls, requirements, and risks.
              The "golden thread" architecture allows you to trace from risks through controls to the supporting evidence.
            </p>
          </div>
          
          <div className="mb-8">
            <EvidenceGraph
              evidenceItems={evidenceItems}
              controls={controls}
              requirements={requirements}
              risks={risks}
              relationships={relationships}
              selectedNodeId={selectedNodeId}
              onNodeSelect={handleNodeSelect}
              highlightedPath={highlightedPath}
              className="h-[700px]"
            />
          </div>
          
          {selectedNodeId && (
            <div className="bg-white dark:bg-secondary-800 rounded-lg border border-secondary-200 dark:border-secondary-700 p-4">
              <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-2">
                Selected Node: {selectedNodeId}
              </h3>
              <p className="text-secondary-600 dark:text-secondary-400 mb-4">
                Explore how this node connects to other elements in your evidence ecosystem.
                The graph highlights direct relationships and can reveal indirect dependencies.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setHighlightedPath(['risk-001', 'ctrl-001', 'ev-002', 'ev-003'])}
                >
                  Show Sample Path
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setHighlightedPath(null)}
                >
                  Clear Path
                </Button>
              </div>
            </div>
          )}
        </section>
      )}
      
      {/* Evidence Lifecycle Timeline Section */}
      {isSectionVisible('timeline') && (
        <section className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-secondary-900 dark:text-white flex items-center">
              <Clock className="mr-2 h-6 w-6 text-primary-600" />
              Evidence Lifecycle Timeline
            </h2>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                leadingIcon={RefreshCw}
              >
                Refresh Data
              </Button>
            </div>
          </div>
          
          <div className="bg-white dark:bg-secondary-800 rounded-lg border border-secondary-200 dark:border-secondary-700 p-4 mb-4">
            <p className="text-secondary-600 dark:text-secondary-400">
              The lifecycle timeline visualizes evidence freshness over time with predictive decay modeling.
              It shows historical events, current state, and forecasts when evidence will need refreshing.
            </p>
          </div>
          
          <div className="mb-8">
            <EvidenceLifecycleTimeline
              evidenceItems={evidenceItems}
              complianceRequirements={complianceRequirements}
              timeRange={{ months: 24 }}
              onTimePointSelect={(date) => console.log('Time point selected:', date)}
              onEvidenceSelect={(evidence) => setSelectedEvidence(evidence.id)}
              selectedEvidence={selectedEvidence}
            />
          </div>
        </section>
      )}
      
      {/* Evidence Scoring Section */}
      {isSectionVisible('scoring') && (
        <section className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-secondary-900 dark:text-white flex items-center">
              <BarChart className="mr-2 h-6 w-6 text-primary-600" />
              ML-Driven Evidence Scoring
            </h2>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                leadingIcon={Filter}
              >
                Filter Evidence
              </Button>
            </div>
          </div>
          
          <div className="bg-white dark:bg-secondary-800 rounded-lg border border-secondary-200 dark:border-secondary-700 p-4 mb-4">
            <p className="text-secondary-600 dark:text-secondary-400">
              Our ML-driven scoring system evaluates evidence quality across multiple dimensions.
              Select an evidence item to see detailed scoring, improvement suggestions, and decay predictions.
            </p>
          </div>
          
          {/* Evidence Selection */}
          <div className="bg-white dark:bg-secondary-800 rounded-lg border border-secondary-200 dark:border-secondary-700 p-4 mb-6">
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">
              Select Evidence to Score
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {evidenceItems.map(item => (
                <div 
                  key={item.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedEvidence === item.id 
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
                      : 'border-secondary-200 dark:border-secondary-700 hover:border-primary-300'
                  }`}
                  onClick={() => setSelectedEvidence(item.id)}
                >
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium text-secondary-900 dark:text-white">{item.title}</h4>
                    <Badge 
                      variant={
                        item.status === 'fresh' ? 'success' : 
                        item.status === 'aging' ? 'warning' : 'error'
                      }
                      size="sm"
                    >
                      {item.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-secondary-600 dark:text-secondary-400 mt-1 mb-2">
                    {item.type} Evidence
                  </p>
                  <p className="text-xs text-secondary-500 dark:text-secondary-400">
                    {new Date(item.timestamp).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
          
          {selectedEvidenceItem ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Scoring Dashboard */}
              <div className="lg:col-span-2 space-y-6">
                {/* Overall Score */}
                <div className="bg-white dark:bg-secondary-800 rounded-lg border border-secondary-200 dark:border-secondary-700 p-6">
                  <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">
                    Evidence Quality Score
                  </h3>
                  
                  <div className="flex items-center justify-center mb-6">
                    <div className="relative w-48 h-48">
                      {/* Circle background */}
                      <div className="absolute inset-0 rounded-full bg-secondary-100 dark:bg-secondary-700"></div>
                      
                      {/* Score circle */}
                      <div 
                        className="absolute inset-0 rounded-full bg-gradient-to-r from-primary-500 to-primary-600"
                        style={{ 
                          clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.sin(2 * Math.PI * scores.overall / 100)}% ${50 - 50 * Math.cos(2 * Math.PI * scores.overall / 100)}%, ${scores.overall >= 75 ? '100% 0%, 100% 100%, 0% 100%, 0% 0%' : ''})` 
                        }}
                      ></div>
                      
                      {/* Inner circle */}
                      <div className="absolute inset-4 rounded-full bg-white dark:bg-secondary-800 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-4xl font-bold text-secondary-900 dark:text-white">
                            {scores.overall}
                          </div>
                          <div className="text-sm text-secondary-500 dark:text-secondary-400">
                            {scores.rating && scores.rating.charAt(0).toUpperCase() + scores.rating.slice(1)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-secondary-900 dark:text-white">
                        {predictions.nextMonthScore}
                      </div>
                      <div className="text-sm text-secondary-500 dark:text-secondary-400">
                        1 Month
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-secondary-900 dark:text-white">
                        {predictions.threeMonthScore}
                      </div>
                      <div className="text-sm text-secondary-500 dark:text-secondary-400">
                        3 Months
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-secondary-900 dark:text-white">
                        {predictions.sixMonthScore}
                      </div>
                      <div className="text-sm text-secondary-500 dark:text-secondary-400">
                        6 Months
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 text-sm text-secondary-600 dark:text-secondary-400">
                    <p>
                      This evidence decays at approximately <strong>{predictions.decayRate}%</strong> per month.
                      {predictions.timeToThreshold.poor && (
                        <span> It will reach a poor quality threshold in <strong>{predictions.timeToThreshold.poor} months</strong>.</span>
                      )}
                    </p>
                  </div>
                </div>
                
                {/* Dimension Scores */}
                <div className="bg-white dark:bg-secondary-800 rounded-lg border border-secondary-200 dark:border-secondary-700 p-6">
                  <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">
                    Quality Dimensions
                  </h3>
                  
                  <div className="space-y-4">
                    {Object.entries(scores.dimensions).map(([dimension, score]) => (
                      <div key={dimension}>
                        <div className="flex justify-between items-center mb-1">
                          <div className="text-sm font-medium text-secondary-700 dark:text-secondary-300 capitalize">
                            {dimension}
                          </div>
                          <div className="text-sm font-medium text-secondary-900 dark:text-white">
                            {score}%
                          </div>
                        </div>
                        <div className="w-full bg-secondary-200 dark:bg-secondary-700 rounded-full h-2.5">
                          <div 
                            className="bg-primary-600 h-2.5 rounded-full"
                            style={{ width: `${score}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Improvement Suggestions */}
              <div className="space-y-6">
                <div className="bg-white dark:bg-secondary-800 rounded-lg border border-secondary-200 dark:border-secondary-700 p-6">
                  <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">
                    Improvement Suggestions
                  </h3>
                  
                  {suggestions.length > 0 ? (
                    <div className="space-y-4">
                      {suggestions.map((suggestion, index) => (
                        <div 
                          key={index}
                          className={`border-l-4 rounded-r-lg p-3 ${
                            suggestion.priority === 'critical' ? 'border-status-error bg-status-error/5' :
                            suggestion.priority === 'high' ? 'border-status-error bg-status-error/5' :
                            suggestion.priority === 'medium' ? 'border-status-warning bg-status-warning/5' :
                            'border-status-info bg-status-info/5'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="font-medium text-secondary-900 dark:text-white capitalize">
                              {suggestion.dimension}
                            </div>
                            <Badge 
                              variant={
                                suggestion.priority === 'critical' || suggestion.priority === 'high' ? 'error' :
                                suggestion.priority === 'medium' ? 'warning' : 'info'
                              }
                              size="sm"
                            >
                              {suggestion.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-secondary-600 dark:text-secondary-400 mt-1">
                            {suggestion.suggestion}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <CheckCircle className="h-12 w-12 text-status-success mx-auto mb-3" />
                      <p className="text-secondary-600 dark:text-secondary-400">
                        No improvement suggestions for this evidence.
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="bg-white dark:bg-secondary-800 rounded-lg border border-secondary-200 dark:border-secondary-700 p-6">
                  <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">
                    Recommended Actions
                  </h3>
                  
                  {improvementActions.length > 0 ? (
                    <div className="space-y-3">
                      {improvementActions.map((action, index) => (
                        <div key={index} className="border border-secondary-200 dark:border-secondary-700 rounded-lg p-3">
                          <div className="font-medium text-secondary-900 dark:text-white mb-1">
                            {action.description}
                          </div>
                          <div className="flex items-center text-xs text-secondary-500 dark:text-secondary-400 mb-2">
                            <span className="mr-2">{action.impact}</span>
                            <span>•</span>
                            <span className="mx-2">Effort: {action.effort}</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {action.dimensions.map((dim, i) => (
                              <Badge key={i} variant="secondary" size="sm" className="capitalize">
                                {dim}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <CheckCircle className="h-12 w-12 text-status-success mx-auto mb-3" />
                      <p className="text-secondary-600 dark:text-secondary-400">
                        No recommended actions for this evidence.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-secondary-800 rounded-lg border border-secondary-200 dark:border-secondary-700 p-8 text-center">
              <Info className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-secondary-900 dark:text-white mb-2">
                Select an Evidence Item
              </h3>
              <p className="text-secondary-600 dark:text-secondary-400 max-w-md mx-auto">
                Choose an evidence artifact from the list above to see its quality score,
                dimension breakdown, and improvement suggestions.
              </p>
            </div>
          )}
        </section>
      )}
      
      {/* Information Section */}
      <section className="mt-12">
        <div className="bg-secondary-50 dark:bg-secondary-800/50 rounded-lg p-6">
          <h2 className="text-xl font-bold text-secondary-900 dark:text-white mb-4 flex items-center">
            <Layers className="mr-2 h-5 w-5 text-primary-600" />
            About These Visualizations
          </h2>
          
          <div className="space-y-4 text-secondary-600 dark:text-secondary-400">
            <p>
              These advanced visualizations represent the cutting edge of evidence management technology.
              They work together to provide a comprehensive view of your evidence ecosystem:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
              <div className="bg-white dark:bg-secondary-800 rounded-lg p-4 border border-secondary-200 dark:border-secondary-700">
                <Network className="h-8 w-8 text-primary-600 mb-2" />
                <h3 className="font-semibold text-secondary-900 dark:text-white mb-1">Evidence Graph</h3>
                <p className="text-sm">
                  Visualizes relationships between evidence, controls, requirements, and risks,
                  allowing you to trace the "golden thread" of your security program.
                </p>
              </div>
              
              <div className="bg-white dark:bg-secondary-800 rounded-lg p-4 border border-secondary-200 dark:border-secondary-700">
                <Clock className="h-8 w-8 text-primary-600 mb-2" />
                <h3 className="font-semibold text-secondary-900 dark:text-white mb-1">Lifecycle Timeline</h3>
                <p className="text-sm">
                  Shows evidence freshness over time with predictive decay modeling,
                  helping you plan evidence refresh activities proactively.
                </p>
              </div>
              
              <div className="bg-white dark:bg-secondary-800 rounded-lg p-4 border border-secondary-200 dark:border-secondary-700">
                <BarChart className="h-8 w-8 text-primary-600 mb-2" />
                <h3 className="font-semibold text-secondary-900 dark:text-white mb-1">Evidence Scoring</h3>
                <p className="text-sm">
                  Uses ML algorithms to evaluate evidence quality across multiple dimensions,
                  providing actionable insights to improve your evidence portfolio.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdvancedEvidenceDemo;
