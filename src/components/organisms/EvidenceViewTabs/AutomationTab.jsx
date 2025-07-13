import React, { useState } from 'react';
import PropTypes from 'prop-types';
import EvidenceAutomationMarketplace from '../../molecules/EvidenceAutomationMarketplace';

/**
 * AutomationTab Component
 * 
 * Displays a marketplace of pre-built integrations and automation
 * templates for evidence collection and validation.
 */
const AutomationTab = ({
  onEnableIntegration,
  onDisableIntegration,
  onViewDetails,
  onInstall,
  onConfigureIntegration
}) => {
  /* ------------------------------------------------------------------
   * Local state for search & filters
   * ------------------------------------------------------------------ */
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({});

  /* ------------------------------------------------------------------
   * Mock integrations data (would come from an API in production)
   * ------------------------------------------------------------------ */
  const integrations = [
    {
      id: 'int-001',
      name: 'AWS CloudTrail Collector',
      description: 'Automatically ingest CloudTrail logs as evidence.',
      enabled: true
    },
    {
      id: 'int-002',
      name: 'Okta User Audit',
      description: 'Pull user-access audit reports from Okta.',
      enabled: false
    },
    {
      id: 'int-003',
      name: 'GitHub Actions Evidence',
      description: 'Send build & deployment artefacts from GitHub.',
      enabled: false
    }
  ];

  return (
    <EvidenceAutomationMarketplace
      integrations={integrations}
      onEnableIntegration={onEnableIntegration}
      onDisableIntegration={onDisableIntegration}
      onViewDetails={onViewDetails}
      onInstall={onInstall}
      onConfigureIntegration={onConfigureIntegration}
      onSearchChange={setSearchQuery}
      onFilterChange={setFilters}
      searchQuery={searchQuery}
      filters={filters}
      isLoading={false}
    />
  );
};

AutomationTab.propTypes = {
  onEnableIntegration: PropTypes.func.isRequired,
  onDisableIntegration: PropTypes.func.isRequired,
  onViewDetails: PropTypes.func.isRequired,
  onInstall: PropTypes.func.isRequired,
  onConfigureIntegration: PropTypes.func.isRequired
};

export default AutomationTab;
