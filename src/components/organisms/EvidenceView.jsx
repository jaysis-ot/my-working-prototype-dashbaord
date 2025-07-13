import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  LayoutGrid,
  Clock,
  Network,
  Map,
  BarChart,
  Zap,
  Lightbulb
} from 'lucide-react';
import {
  EvidenceTab,
  TimelineTab,
  GraphTab,
  JourneyTab,
  ScoringTab,
  AutomationTab,
  SuggestionsTab
} from './EvidenceViewTabs';

/**
 * TabButton Component
 * 
 * A button for the tabbed interface
 */
const TabButton = ({ active, icon: Icon, label, onClick }) => (
  <button
    className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
      active 
        ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300' 
        : 'text-secondary-600 dark:text-secondary-400 hover:bg-secondary-100 dark:hover:bg-secondary-800'
    }`}
    onClick={onClick}
  >
    <Icon className="w-4 h-4 mr-2" />
    {label}
  </button>
);

TabButton.propTypes = {
  active: PropTypes.bool.isRequired,
  icon: PropTypes.elementType.isRequired,
  label: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired
};

/**
 * EvidenceView Organism Component
 * 
 * A comprehensive view for displaying and managing evidence artifacts.
 * This component implements the Evidence Dashboard with a tabbed interface
 * for different views of evidence data.
 * 
 * Following atomic design principles, this organism composes atoms and molecules
 * to create a cohesive user interface for evidence management.
 */
const EvidenceView = ({
  healthMetrics,
  insights,
  lifecycleData,
  recentActivity,
  evidenceItems,
  filters,
  onFilterChange,
  onAddEvidence,
  onViewJourneyMap,
  onViewAllActivity,
  onViewEvidenceDetails,
  onImportEvidence,
  onExportEvidence
}) => {
  // Tab state for different views
  const [activeTab, setActiveTab] = useState('evidence');
  
  // Filter state for evidence types
  const [evidenceTypeFilter, setEvidenceTypeFilter] = useState('all');
  
  // Render the appropriate tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'timeline':
        return (
          <TimelineTab evidenceItems={evidenceItems} />
        );
        
      case 'graph':
        return (
          <GraphTab evidenceItems={evidenceItems} />
        );
        
      case 'journey':
        return <JourneyTab />;
        
      case 'scoring':
        return (
          <ScoringTab evidenceItems={evidenceItems} />
        );
        
      case 'automation':
        return (
          <AutomationTab 
            onEnableIntegration={(id) => console.log(`Enabling integration: ${id}`)}
            onDisableIntegration={(id) => console.log(`Disabling integration: ${id}`)}
            onViewDetails={(id) => console.log(`Viewing integration details: ${id}`)}
            onInstall={() => console.log('Installing new integration')}
            onConfigureIntegration={(id) => console.log(`Configuring integration: ${id}`)}
          />
        );
        
      case 'suggestions':
        return (
          <SuggestionsTab 
            evidenceItems={evidenceItems}
            insights={insights}
            onAddEvidence={onAddEvidence}
            onAcceptSuggestion={(id) => console.log(`Accepted suggestion: ${id}`)}
            onDismissSuggestion={(id) => console.log(`Dismissed suggestion: ${id}`)}
          />
        );
        
      case 'evidence':
      default:
        return (
          <EvidenceTab 
            healthMetrics={healthMetrics}
            insights={insights}
            lifecycleData={lifecycleData}
            recentActivity={recentActivity}
            evidenceItems={evidenceItems}
            filters={filters}
            evidenceTypeFilter={evidenceTypeFilter}
            setEvidenceTypeFilter={setEvidenceTypeFilter}
            onFilterChange={onFilterChange}
            onAddEvidence={onAddEvidence}
            onViewJourneyMap={onViewJourneyMap}
            onViewAllActivity={onViewAllActivity}
            onViewEvidenceDetails={onViewEvidenceDetails}
            onImportEvidence={onImportEvidence}
            onExportEvidence={onExportEvidence}
          />
        );
    }
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Header with tab navigation */}
      <div className="bg-white dark:bg-secondary-800 rounded-lg p-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">Evidence Dashboard</h1>
            <span className="bg-secondary-100 dark:bg-secondary-700 text-secondary-600 dark:text-secondary-300 px-3 py-1 rounded-full text-sm font-medium">
              Golden Thread View
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <TabButton
              active={activeTab === 'evidence'}
              icon={LayoutGrid}
              label="Evidence"
              onClick={() => setActiveTab('evidence')}
            />
            <TabButton
              active={activeTab === 'timeline'}
              icon={Clock}
              label="Lifecycle Timeline"
              onClick={() => setActiveTab('timeline')}
            />
            <TabButton
              active={activeTab === 'graph'}
              icon={Network}
              label="Graph"
              onClick={() => setActiveTab('graph')}
            />
            <TabButton
              active={activeTab === 'journey'}
              icon={Map}
              label="Journey Map"
              onClick={() => setActiveTab('journey')}
            />
            <TabButton
              active={activeTab === 'scoring'}
              icon={BarChart}
              label="Scoring"
              onClick={() => setActiveTab('scoring')}
            />
            <TabButton
              active={activeTab === 'automation'}
              icon={Zap}
              label="Automation"
              onClick={() => setActiveTab('automation')}
            />
            <TabButton
              active={activeTab === 'suggestions'}
              icon={Lightbulb}
              label="Suggestions"
              onClick={() => setActiveTab('suggestions')}
            />
          </div>
        </div>
      </div>
      
      {/* Main tab content */}
      {renderTabContent()}
    </div>
  );
};

EvidenceView.propTypes = {
  healthMetrics: PropTypes.array.isRequired,
  insights: PropTypes.array.isRequired,
  lifecycleData: PropTypes.array.isRequired,
  recentActivity: PropTypes.array.isRequired,
  evidenceItems: PropTypes.array.isRequired,
  filters: PropTypes.object,
  onFilterChange: PropTypes.func.isRequired,
  onAddEvidence: PropTypes.func.isRequired,
  onViewJourneyMap: PropTypes.func,
  onViewAllActivity: PropTypes.func,
  onViewEvidenceDetails: PropTypes.func,
  onImportEvidence: PropTypes.func,
  onExportEvidence: PropTypes.func
};

EvidenceView.defaultProps = {
  filters: {},
  onViewJourneyMap: () => {},
  onViewAllActivity: () => {},
  onViewEvidenceDetails: () => {},
  onImportEvidence: () => {},
  onExportEvidence: () => {}
};

export default EvidenceView;
