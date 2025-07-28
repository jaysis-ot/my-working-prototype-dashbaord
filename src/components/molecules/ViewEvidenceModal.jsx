import React from 'react';
import PropTypes from 'prop-types';
import { X, FileText, Calendar, User, HardDrive, Tag } from 'lucide-react';
import Button from '../atoms/Button';

/**
 * ViewEvidenceModal Component
 * 
 * This modal displays detailed information about a specific evidence artifact.
 * It shows metadata such as title, upload date, file details, and tags.
 */
const ViewEvidenceModal = ({ isOpen, evidence, onClose }) => {
  // If modal is not open or no evidence provided, don't render
  if (!isOpen || !evidence) return null;
  
  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };
  
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" 
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-secondary-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col" 
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-4 border-b border-secondary-200 dark:border-secondary-700">
          <div>
            <h2 className="text-lg font-bold text-secondary-900 dark:text-white flex items-center">
              <FileText className="w-5 h-5 mr-2 text-primary-500" />
              Evidence Details
            </h2>
            <p className="text-sm text-secondary-500 dark:text-secondary-400 mt-1">
              View detailed information about this evidence artifact
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-secondary-100 dark:hover:bg-secondary-700">
            <X className="w-5 h-5 text-secondary-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto">
          <div className="space-y-6">
            {/* Title */}
            <div>
              <h3 className="text-md font-semibold text-secondary-900 dark:text-white mb-2">
                Title
              </h3>
              <p className="text-secondary-700 dark:text-secondary-300">
                {evidence.title}
              </p>
            </div>
            
            {/* ── Basic File Properties ─────────────────────────────── */}
            <div>
              <h3 className="text-md font-semibold text-secondary-900 dark:text-white mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-primary-500" />
                Basic File Properties
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <strong>File Name:</strong>&nbsp;{evidence.fileName || '-'}
                </div>
                <div>
                  <strong>File Size:</strong>&nbsp;{evidence.fileSize ? formatFileSize(evidence.fileSize) : '-'}
                </div>
                <div>
                  <strong>File Type:</strong>&nbsp;{evidence.fileType || '-'}
                </div>
                <div>
                  <strong>MIME Type:</strong>&nbsp;{evidence.mimeType || '-'}
                </div>
                <div className="md:col-span-2 break-all">
                  <strong>File Hash (SHA-256):</strong>&nbsp;{evidence.fileHash || '-'}
                </div>
                <div>
                  <strong>Upload Timestamp:</strong>&nbsp;
                  {evidence.uploadDate ? new Date(evidence.uploadDate).toISOString() : '-'}
                </div>
                <div>
                  <strong>Uploaded By:</strong>&nbsp;{evidence.uploadedBy || '-'}
                </div>
              </div>
            </div>
            
            {/* Description */}
            <div>
              <h3 className="text-md font-semibold text-secondary-900 dark:text-white mb-2">
                Description
              </h3>
              <p className="text-secondary-700 dark:text-secondary-300 whitespace-pre-line">
                {evidence.description || "No description provided."}
              </p>
            </div>
            
            {/* Tags */}
            <div>
              <h3 className="text-md font-semibold text-secondary-900 dark:text-white mb-2 flex items-center">
                <Tag className="w-4 h-4 mr-2 text-primary-500" />
                Tags
              </h3>
              {evidence.tags && evidence.tags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {evidence.tags.map((tag, index) => (
                    <span 
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-secondary-500 dark:text-secondary-400">
                  No tags assigned.
                </p>
              )}
            </div>

            {/* ── Evidence Classification ─────────────────────────── */}
            <div>
              <h3 className="text-md font-semibold text-secondary-900 dark:text-white mb-4">
                Evidence Classification
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><strong>Artifact Type:</strong>&nbsp;{evidence.artifactType || '-'}</div>
                <div><strong>Evidence Category:</strong>&nbsp;{evidence.category || '-'}</div>
                <div><strong>Confidence Level:</strong>&nbsp;{evidence.confidenceLevel ?? '-'}</div>
                <div><strong>Quality Score:</strong>&nbsp;{evidence.qualityScore ?? '-'}</div>
                <div><strong>Criticality Level:</strong>&nbsp;{evidence.criticalityLevel || '-'}</div>
                <div><strong>Business Impact:</strong>&nbsp;{evidence.businessImpact || '-'}</div>
              </div>
            </div>

            {/* ── Lifecycle Management ────────────────────────────── */}
            <div>
              <h3 className="text-md font-semibold text-secondary-900 dark:text-white mb-4">
                Lifecycle Management
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><strong>Status:</strong>&nbsp;{evidence.status || '-'}</div>
                <div><strong>Lifecycle Stage:</strong>&nbsp;{evidence.lifecycleStage || '-'}</div>
                <div>
                  <strong>Expiration Date:</strong>&nbsp;
                  {evidence.expirationDate ? formatDate(evidence.expirationDate) : '-'}
                </div>
                <div><strong>Refresh Frequency:</strong>&nbsp;{evidence.refreshFrequency || '-'}</div>
                <div>
                  <strong>Next Review Date:</strong>&nbsp;
                  {evidence.nextReviewDate ? formatDate(evidence.nextReviewDate) : '-'}
                </div>
                <div className="md:col-span-2">
                  <strong>Deprecation Timeline:</strong>&nbsp;{evidence.deprecationTimeline || '-'}
                </div>
              </div>
            </div>

            {/* ── Relationship Mapping ───────────────────────────── */}
            <div>
              <h3 className="text-md font-semibold text-secondary-900 dark:text-white mb-4">
                Relationship Mapping
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>Linked Capabilities: {evidence.linkedCapabilities?.join(', ') || '-'}</div>
                <div>Associated Risks: {evidence.associatedRisks?.join(', ') || '-'}</div>
                <div>Framework Mappings: {evidence.frameworkMappings?.join(', ') || '-'}</div>
                <div>Dependent Evidence: {evidence.dependentEvidence?.join(', ') || '-'}</div>
                <div>Supporting Evidence: {evidence.supportingEvidence?.join(', ') || '-'}</div>
                <div>Conflicting Evidence: {evidence.conflictingEvidence?.join(', ') || '-'}</div>
              </div>
            </div>

            {/* ── Content Intelligence ──────────────────────────── */}
            <div>
              <h3 className="text-md font-semibold text-secondary-900 dark:text-white mb-4">
                Content Intelligence
              </h3>
              <div className="space-y-4">
                <div><strong>Description:</strong> {evidence.contentSummary || '-'}</div>
                <div><strong>Tags:</strong> {evidence.tags?.join(', ') || '-'}</div>
                <div><strong>Content Summary:</strong> {evidence.aiSummary || '-'}</div>
                <div><strong>Key Findings:</strong> {evidence.keyFindings || '-'}</div>
                <div><strong>Quantitative Metrics:</strong> {evidence.quantitativeMetrics || '-'}</div>
                <div><strong>Compliance Status:</strong> {evidence.complianceStatus || '-'}</div>
              </div>
            </div>

            {/* ── Source Attribution ───────────────────────────── */}
            <div>
              <h3 className="text-md font-semibold text-secondary-900 dark:text-white mb-4">
                Source Attribution
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>Source System: {evidence.sourceSystem || '-'}</div>
                <div>Data Source: {evidence.dataSource || '-'}</div>
                <div>Collection Method: {evidence.collectionMethod || '-'}</div>
                <div>Source Reliability: {evidence.sourceReliability || '-'}</div>
                <div>Chain of Custody: {evidence.chainOfCustody || '-'}</div>
                <div>Original Location: {evidence.originalLocation || '-'}</div>
              </div>
            </div>

            {/* ── Validation & Verification ─────────────────────── */}
            <div>
              <h3 className="text-md font-semibold text-secondary-900 dark:text-white mb-4">
                Validation &amp; Verification
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>Validation Status: {evidence.validationStatus || '-'}</div>
                <div>Validated By: {evidence.validatedBy || '-'}</div>
                <div>Validation Date: {evidence.validationDate ? formatDate(evidence.validationDate) : '-'}</div>
                <div>Verification Method: {evidence.verificationMethod || '-'}</div>
                <div>Validation Evidence: {evidence.validationEvidence || '-'}</div>
                <div>Confidence Interval: {evidence.confidenceInterval || '-'}</div>
              </div>
            </div>

            {/* ── Business Context ─────────────────────────────── */}
            <div>
              <h3 className="text-md font-semibold text-secondary-900 dark:text-white mb-4">
                Business Context
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>Business Owner: {evidence.businessOwner || '-'}</div>
                <div>Stakeholder Groups: {evidence.stakeholderGroups?.join(', ') || '-'}</div>
                <div>Business Value: {evidence.businessValue || '-'}</div>
                <div>Cost of Absence: {evidence.costOfAbsence || '-'}</div>
                <div>Revenue Impact: {evidence.revenueImpact || '-'}</div>
                <div>Compliance Importance: {evidence.complianceImportance || '-'}</div>
              </div>
            </div>

            {/* ── Technical Metadata ───────────────────────────── */}
            <div>
              <h3 className="text-md font-semibold text-secondary-900 dark:text-white mb-4">
                Technical Metadata
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>Data Format: {evidence.dataFormat || '-'}</div>
                <div>Encoding: {evidence.encoding || '-'}</div>
                <div>Compression: {evidence.compression || '-'}</div>
                <div>Encryption Status: {evidence.encryptionStatus || '-'}</div>
                <div>Processing Status: {evidence.processingStatus || '-'}</div>
                <div>Index Status: {evidence.indexStatus || '-'}</div>
              </div>
            </div>

            {/* ── Temporal Intelligence ─────────────────────────── */}
            <div>
              <h3 className="text-md font-semibold text-secondary-900 dark:text-white mb-4">
                Temporal Intelligence
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>Effective Date: {evidence.effectiveDate ? formatDate(evidence.effectiveDate) : '-'}</div>
                <div>Collection Date: {evidence.collectionDate ? formatDate(evidence.collectionDate) : '-'}</div>
                <div>Processing Date: {evidence.processingDate ? formatDate(evidence.processingDate) : '-'}</div>
                <div>Reporting Period: {evidence.reportingPeriod || '-'}</div>
                <div>Frequency: {evidence.frequency || '-'}</div>
                <div>Seasonality: {evidence.seasonality || '-'}</div>
              </div>
            </div>

            {/* ── Integration & Automation ──────────────────────── */}
            <div>
              <h3 className="text-md font-semibold text-secondary-900 dark:text-white mb-4">
                Integration &amp; Automation
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>Auto-Collection Rules: {evidence.autoCollectionRules || '-'}</div>
                <div>Integration Endpoints: {evidence.integrationEndpoints?.join(', ') || '-'}</div>
                <div>Transformation Rules: {evidence.transformationRules || '-'}</div>
                <div>Alert Triggers: {evidence.alertTriggers || '-'}</div>
                <div>Workflow State: {evidence.workflowState || '-'}</div>
                <div>Automation Level: {evidence.automationLevel || '-'}</div>
              </div>
            </div>

            {/* ── Audit & Compliance ────────────────────────────── */}
            <div>
              <h3 className="text-md font-semibold text-secondary-900 dark:text-white mb-4">
                Audit &amp; Compliance
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>Audit Trail: {evidence.auditTrail || '-'}</div>
                <div>Retention Policy: {evidence.retentionPolicy || '-'}</div>
                <div>Access Log: {evidence.accessLog || '-'}</div>
                <div>Sensitivity Classification: {evidence.sensitivityClassification || '-'}</div>
                <div>Compliance Tags: {evidence.complianceTags?.join(', ') || '-'}</div>
                <div>Audit Findings: {evidence.auditFindings || '-'}</div>
              </div>
            </div>

            {/* ── Trust Calculation Inputs ───────────────────────── */}
            <div>
              <h3 className="text-md font-semibold text-secondary-900 dark:text-white mb-4">
                Trust Calculation Inputs
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>Decay Rate: {evidence.decayRate || '-'}</div>
                <div>Reinforcement Factor: {evidence.reinforcementFactor || '-'}</div>
                <div>Weight Modifier: {evidence.weightModifier || '-'}</div>
                <div>Correlation Strength: {evidence.correlationStrength || '-'}</div>
                <div>Predictive Value: {evidence.predictiveValue || '-'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-4 border-t border-secondary-200 dark:border-secondary-700">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

ViewEvidenceModal.propTypes = {
  /**
   * Controls whether the modal is displayed
   */
  isOpen: PropTypes.bool.isRequired,
  
  /**
   * Evidence object containing detailed information
   */
  evidence: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    fileName: PropTypes.string.isRequired,
    fileType: PropTypes.string,
    mimeType: PropTypes.string,
    fileHash: PropTypes.string,
    uploadDate: PropTypes.string.isRequired,
    uploadedBy: PropTypes.string.isRequired,
    fileSize: PropTypes.number.isRequired,
    description: PropTypes.string,
    tags: PropTypes.arrayOf(PropTypes.string),
    /* Classification */
    artifactType: PropTypes.string,
    category: PropTypes.string,
    confidenceLevel: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    qualityScore: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    criticalityLevel: PropTypes.string,
    businessImpact: PropTypes.string,
    /* Lifecycle */
    status: PropTypes.string,
    lifecycleStage: PropTypes.string,
    expirationDate: PropTypes.string,
    refreshFrequency: PropTypes.string,
    nextReviewDate: PropTypes.string,
    deprecationTimeline: PropTypes.string
  }),
  
  /**
   * Function to call when closing the modal
   */
  onClose: PropTypes.func.isRequired
};

export default ViewEvidenceModal;
