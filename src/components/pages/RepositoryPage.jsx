import React, { useState } from 'react';
import { Database, Plus } from 'lucide-react';
import Button from '../atoms/Button';
import RepositoryView from '../organisms/RepositoryView';
import AddRepoEvidenceModal from '../molecules/AddRepoEvidenceModal';
import RepositoryEvidenceView from '../organisms/RepositoryEvidenceView';
import ViewEvidenceModal from '../molecules/ViewEvidenceModal';

/**
 * RepositoryPage Component
 * 
 * This page serves as the main container for repository management functionality.
 * It follows the "Page" pattern in atomic design, orchestrating data flow and
 * state management for its child organisms.
 * 
 * Responsibilities:
 * - Provides the standardized page header layout
 * - Manages repository data and operations
 * - Handles user interactions for repository management
 * - Passes necessary data and handlers to the RepositoryView organism
 */
const RepositoryPage = () => {
  /* ------------------------------------------------------------------
     Mock Repository Data (replace with API data in real implementation)
  ------------------------------------------------------------------ */
  const mockRepos = [
    {
      id: 'repo-001',
      name: 'Primary Evidence Repo',
      url: 'https://evidence.example.com/primary',
      createdAt: '2025-06-01T10:15:00Z',
      updatedAt: '2025-07-10T08:30:00Z'
    },
    {
      id: 'repo-002',
      name: 'Third-Party Assessments',
      url: 'https://evidence.example.com/third-party',
      createdAt: '2025-05-20T09:00:00Z',
      updatedAt: '2025-07-08T14:45:00Z'
    },
    {
      id: 'repo-003',
      name: 'Legacy Docs Archive',
      url: 'https://evidence.example.com/archive',
      createdAt: '2025-04-12T13:25:00Z',
      updatedAt: '2025-06-30T11:10:00Z'
    }
  ];

  // State for repositories (initialised with mock data)
  const [repositories, setRepositories] = useState(mockRepos);

  // State for repository-evidence modal
  const [isAddEvidenceOpen, setIsAddEvidenceOpen] = useState(false);
  const [selectedRepoId, setSelectedRepoId] = useState(null);

  // State for viewing evidence list of a specific repository
  const [evidenceRepoId, setEvidenceRepoId] = useState(null);
  // State for evidence-details modal
  const [selectedEvidenceItem, setSelectedEvidenceItem] = useState(null);
  const [isViewEvidenceModalOpen, setIsViewEvidenceModalOpen] = useState(false);
  
  // Handler for adding a new repository
  const handleAddRepository = () => {
    console.log('Add repository action triggered');
    // In a real implementation, this would open a modal or form
  };

  /**
   * Open evidence upload modal for a specific repository
   * @param {string} repoId
   */
  const handleAddRepoEvidence = (repoId) => {
    setSelectedRepoId(repoId);
    setIsAddEvidenceOpen(true);
  };

  /**
   * View evidence list for a repository
   * @param {string} repoId
   */
  const handleViewEvidence = (repoId) => {
    setEvidenceRepoId(repoId);
  };

  /**
   * Open modal showing evidence details
   * @param {object} evidence
   */
  const handleOpenEvidenceDetails = (evidence) => {
    setSelectedEvidenceItem(evidence);
    setIsViewEvidenceModalOpen(true);
  };

  // Close evidence details modal
  const handleCloseEvidenceDetails = () => {
    setIsViewEvidenceModalOpen(false);
    setSelectedEvidenceItem(null);
  };

  /**
   * Save evidence to a repository (placeholder)
   * @param {object} data
   */
  const handleSaveRepoEvidence = (data) => {
    console.log('Saving evidence to repository:', data);
    // TODO: Persist to backend or update state
    setIsAddEvidenceOpen(false);
    setSelectedRepoId(null);
  };

  // Close modal without saving
  const handleCloseRepoEvidence = () => {
    setIsAddEvidenceOpen(false);
    setSelectedRepoId(null);
  };

  return (
    <>
      {/* ────────────────────────────────────────────
          Evidence List View (takes precedence)
      ──────────────────────────────────────────── */}
      {evidenceRepoId ? (
        <>
          <RepositoryEvidenceView
            repoId={evidenceRepoId}
            onBack={() => setEvidenceRepoId(null)}
            onViewEvidence={handleOpenEvidenceDetails}
            onDownloadEvidence={() => {}}
            onDeleteEvidence={() => {}}
          />

          {/* Add Evidence Modal still available */}
          <AddRepoEvidenceModal
            isOpen={isAddEvidenceOpen}
            repoId={selectedRepoId || ''}
            onClose={handleCloseRepoEvidence}
            onSave={handleSaveRepoEvidence}
          />

          {/* Evidence Detail Modal */}
          <ViewEvidenceModal
            isOpen={isViewEvidenceModalOpen}
            evidence={selectedEvidenceItem}
            onClose={handleCloseEvidenceDetails}
          />
        </>
      ) : (
    <div className="h-full">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-white flex items-center">
            <Database className="w-7 h-7 mr-3 text-primary-600" />
            Repository Management
          </h1>
          <p className="text-secondary-500 dark:text-secondary-400 mt-1">
            View, organize, and maintain evidence repositories.
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="primary" 
            leadingIcon={Plus} 
            onClick={handleAddRepository}
          >
            Add Repository
          </Button>
        </div>
      </div>
      
      {/* Main Content */}
      <RepositoryView 
        repositories={repositories}
        onAddRepository={handleAddRepository}
        onAddRepoEvidence={handleAddRepoEvidence}
        onViewEvidence={handleViewEvidence}
      />

      {/* Add Evidence to Repository Modal */}
      <AddRepoEvidenceModal
        isOpen={isAddEvidenceOpen}
        repoId={selectedRepoId || ''}
        onClose={handleCloseRepoEvidence}
        onSave={handleSaveRepoEvidence}
      />
    </div>
      )}
    </>
  );
};

export default RepositoryPage;
