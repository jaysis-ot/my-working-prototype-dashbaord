import React from 'react';
import PropTypes from 'prop-types';
import { ChevronLeft, Eye, Download, Trash2, FileText } from 'lucide-react';
import Button from '../atoms/Button';

/**
 * RepositoryEvidenceView Organism Component
 * 
 * This component displays evidence artifacts for a specific repository.
 * It shows a list of evidence items with actions to view, download, or delete.
 */
const RepositoryEvidenceView = ({
  repoId,
  onBack,
  onViewEvidence,
  onDownloadEvidence,
  onDeleteEvidence
}) => {
  // Mock evidence data - in a real app, this would come from props or API
  const mockEvidenceItems = [
    {
      id: 'ev-001',
      title: 'Security Policy Document',
      fileName: 'security-policy-v2.1.pdf',
      uploadDate: '2025-06-12T14:30:00Z',
      description: 'Official security policy document outlining organizational security requirements and controls.'
    },
    {
      id: 'ev-002',
      title: 'Penetration Test Report',
      fileName: 'pentest-q2-2025.docx',
      uploadDate: '2025-07-03T09:15:00Z',
      description: 'Q2 2025 external penetration test results from CyberSecure Partners.'
    },
    {
      id: 'ev-003',
      title: 'Access Control Matrix',
      fileName: 'access-matrix-july.xlsx',
      uploadDate: '2025-07-10T11:45:00Z',
      description: 'Current access control matrix showing user permissions across critical systems.'
    },
    {
      id: 'ev-004',
      title: 'Incident Response Plan',
      fileName: 'incident-response-plan.pdf',
      uploadDate: '2025-05-22T16:20:00Z',
      description: 'Documented procedures for responding to and managing security incidents.'
    },
    {
      id: 'ev-005',
      title: 'Risk Assessment Report',
      fileName: 'risk-assessment-2025.pptx',
      uploadDate: '2025-06-28T13:10:00Z',
      description: 'Annual risk assessment identifying and evaluating potential security risks.'
    }
  ];

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white dark:bg-secondary-800 rounded-lg border border-secondary-200 dark:border-secondary-700 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-secondary-200 dark:border-secondary-700 flex items-center justify-between">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            leadingIcon={ChevronLeft}
            onClick={onBack}
            className="mr-2"
          >
            Back
          </Button>
          <h2 className="text-lg font-semibold text-secondary-900 dark:text-white">
            Evidence for Repository {repoId}
          </h2>
        </div>
      </div>

      {/* Evidence Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-secondary-200 dark:divide-secondary-700">
          <thead className="sticky top-0 z-10 bg-secondary-50 dark:bg-secondary-700/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                File Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                Upload Date
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-secondary-800 divide-y divide-secondary-200 dark:divide-secondary-700">
            {mockEvidenceItems.map((evidence) => (
              <tr 
                key={evidence.id}
                className="hover:bg-secondary-50 dark:hover:bg-secondary-700/50"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <FileText className="w-5 h-5 text-primary-500 mr-3" />
                    <div className="text-sm font-medium text-secondary-900 dark:text-white">
                      {evidence.title}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500 dark:text-secondary-400">
                  {evidence.fileName}
                </td>
                <td className="px-6 py-4 text-sm text-secondary-500 dark:text-secondary-400">
                  <div className="max-w-xs truncate">
                    {evidence.description}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500 dark:text-secondary-400">
                  {formatDate(evidence.uploadDate)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onViewEvidence(evidence.id)}
                      title="View Evidence"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onDownloadEvidence(evidence.id)}
                      title="Download Evidence"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onDeleteEvidence(evidence.id)}
                      title="Delete Evidence"
                    >
                      <Trash2 className="w-4 h-4 text-status-error" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Empty state if no evidence */}
      {mockEvidenceItems.length === 0 && (
        <div className="p-8 text-center">
          <div className="flex justify-center mb-4">
            <FileText className="w-12 h-12 text-secondary-400 dark:text-secondary-600" />
          </div>
          <h3 className="text-lg font-medium text-secondary-900 dark:text-white mb-2">No Evidence Found</h3>
          <p className="text-secondary-500 dark:text-secondary-400 max-w-md mx-auto">
            This repository doesn't have any evidence artifacts yet.
          </p>
        </div>
      )}
    </div>
  );
};

RepositoryEvidenceView.propTypes = {
  /**
   * ID of the repository to display evidence for
   */
  repoId: PropTypes.string.isRequired,
  
  /**
   * Handler for navigating back to repository list
   */
  onBack: PropTypes.func.isRequired,
  
  /**
   * Handler for viewing evidence details
   */
  onViewEvidence: PropTypes.func.isRequired,
  
  /**
   * Handler for downloading evidence
   */
  onDownloadEvidence: PropTypes.func,
  
  /**
   * Handler for deleting evidence
   */
  onDeleteEvidence: PropTypes.func
};

RepositoryEvidenceView.defaultProps = {
  onDownloadEvidence: () => {},
  onDeleteEvidence: () => {}
};

export default RepositoryEvidenceView;
