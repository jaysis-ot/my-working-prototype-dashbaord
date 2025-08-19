import React, { useState, useCallback, useEffect, useRef } from 'react';
import { 
  Search, 
  Shield, 
  AlertTriangle, 
  ArrowLeft, 
  ChevronRight, 
  Info, 
  Users, 
  Code, 
  RefreshCw, 
  Filter, 
  X, 
  ExternalLink,
  Zap,
  CheckCircle,
  Lock,
  Database,
  Layers,
  Grid
} from 'lucide-react';
import { Navigation } from 'lucide-react';
import MitreAttackNavigator from '../organisms/MitreAttackNavigator';
import useMitreAttack from '../../hooks/useMitreAttack';
import Button from '../atoms/Button';
import Badge from '../atoms/Badge';
import Input from '../atoms/Input';
import LoadingSpinner from '../atoms/LoadingSpinner';
import ErrorDisplay from '../molecules/ErrorDisplay';

// --- Helper Components ---

/**
 * TacticSidebar Component
 * Displays the list of tactics in the sidebar
 */
const TacticSidebar = ({ tactics, selectedTactic, onSelectTactic }) => (
  <div className="w-full md:w-64 flex-shrink-0 border-r border-secondary-200 dark:border-secondary-700 overflow-y-auto">
    <div className="p-4 border-b border-secondary-200 dark:border-secondary-700">
      <h3 className="font-semibold text-secondary-900 dark:text-white">ATT&CK Tactics</h3>
      <p className="text-sm text-secondary-500 dark:text-secondary-400">Select a tactic to view techniques</p>
    </div>
    <nav className="p-2">
      {tactics.map(tactic => (
        <button
          key={tactic.id}
          onClick={() => onSelectTactic(tactic.id)}
          className={`w-full flex items-center p-3 rounded-md mb-1 text-left transition-colors ${
            selectedTactic === tactic.id
              ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300'
              : 'text-secondary-700 hover:bg-secondary-100 dark:text-secondary-300 dark:hover:bg-secondary-800'
          }`}
        >
          <div 
            className="w-3 h-3 rounded-full mr-3 flex-shrink-0" 
            style={{ backgroundColor: tactic.color }}
          />
          <div>
            <div className="font-medium">{tactic.name}</div>
            <div className="text-xs text-secondary-500 dark:text-secondary-400">{tactic.id}</div>
          </div>
        </button>
      ))}
    </nav>
  </div>
);

/**
 * TechniqueCard Component
 * Displays a technique card in the matrix view
 */
const TechniqueCard = ({ technique, onClick, isSelected, tacticColor }) => (
  <div 
    className={`
      p-3 border rounded-md cursor-pointer transition-all
      ${isSelected 
        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-sm' 
        : 'border-secondary-200 dark:border-secondary-700 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-sm'}
    `}
    onClick={() => onClick(technique.id)}
  >
    <div className="flex items-center justify-between mb-1">
      <span className="text-xs font-mono text-secondary-500 dark:text-secondary-400">{technique.id}</span>
      {technique.subTechniques && technique.subTechniques.length > 0 && (
        <Badge variant="default" size="sm">{technique.subTechniques.length}</Badge>
      )}
    </div>
    <h4 className="font-medium text-secondary-900 dark:text-white">{technique.name}</h4>
    <div className="mt-2 text-xs">
      <div 
        className="w-full h-1 rounded-full mt-2" 
        style={{ backgroundColor: tacticColor }}
      />
    </div>
  </div>
);

/**
 * MatrixView Component
 * Displays the ATT&CK matrix with techniques grouped by tactic
 */
const MatrixView = ({ tactics, techniques, selectedTactic, selectedTechnique, onSelectTechnique }) => {
  const currentTactic = tactics.find(t => t.id === selectedTactic);
  
  return (
    <div className="p-4">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-secondary-900 dark:text-white flex items-center">
          {currentTactic ? (
            <>
              <div 
                className="w-4 h-4 rounded-full mr-2" 
                style={{ backgroundColor: currentTactic.color }}
              />
              {currentTactic.name}
            </>
          ) : 'All Techniques'}
        </h2>
        {currentTactic && (
          <p className="text-secondary-600 dark:text-secondary-400 mt-1">{currentTactic.description}</p>
        )}
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {techniques.map(technique => (
          <TechniqueCard 
            key={technique.id}
            technique={technique}
            onClick={onSelectTechnique}
            isSelected={selectedTechnique === technique.id}
            tacticColor={currentTactic?.color || '#6b7280'}
          />
        ))}
      </div>
      
      {techniques.length === 0 && (
        <div className="text-center py-12 bg-secondary-50 dark:bg-secondary-800/30 rounded-lg border border-secondary-200 dark:border-secondary-700">
          <Grid className="w-12 h-12 mx-auto text-secondary-400 dark:text-secondary-600" />
          <h3 className="mt-2 text-lg font-medium text-secondary-900 dark:text-white">No Techniques Found</h3>
          <p className="text-secondary-500 dark:text-secondary-400">
            {selectedTactic 
              ? 'There are no techniques for the selected tactic.' 
              : 'Please select a tactic to view techniques.'}
          </p>
        </div>
      )}
    </div>
  );
};

/**
 * TechniqueDetails Component
 * Displays detailed information about a selected technique
 */
const TechniqueDetails = ({ technique, onBack }) => {
  if (!technique) return null;
  
  return (
    <div className="p-4">
      <div className="flex items-center mb-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onBack} 
          className="mr-2"
          leadingIcon={ArrowLeft}
        >
          Back
        </Button>
        <h2 className="text-xl font-bold text-secondary-900 dark:text-white">
          {technique.name}
        </h2>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="dashboard-card p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <Shield className="w-5 h-5 text-primary-500 mr-2" />
                <h3 className="text-lg font-semibold text-secondary-900 dark:text-white">
                  Technique Information
                </h3>
              </div>
              <Badge variant="default">{technique.id}</Badge>
            </div>
            
            <p className="text-secondary-600 dark:text-secondary-400 mb-4">
              {technique.description}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <h4 className="text-sm font-medium text-secondary-500 dark:text-secondary-400 mb-1">Tactics</h4>
                <div className="space-y-1">
                  {technique.tacticIds.map(tacticId => {
                    const tactic = technique.tactics?.find(t => t.id === tacticId) || { name: tacticId, id: tacticId };
                    return (
                      <div key={tacticId} className="flex items-center">
                        <span className="text-secondary-900 dark:text-white">{tactic.name}</span>
                        <span className="text-xs text-secondary-500 dark:text-secondary-400 ml-2">({tacticId})</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-secondary-500 dark:text-secondary-400 mb-1">Platforms</h4>
                <div className="flex flex-wrap gap-1">
                  {technique.platforms?.map(platform => (
                    <Badge key={platform} variant="default">{platform}</Badge>
                  ))}
                </div>
              </div>
            </div>
            
            {technique.detectionMethods && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-secondary-500 dark:text-secondary-400 mb-1">Detection Methods</h4>
                <ul className="list-disc list-inside text-secondary-600 dark:text-secondary-400">
                  {technique.detectionMethods.map((method, index) => (
                    <li key={index}>{method}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          {/* Sub-techniques */}
          {technique.subTechniques && technique.subTechniques.length > 0 && (
            <div className="dashboard-card p-4">
              <div className="flex items-center mb-2">
                <Layers className="w-5 h-5 text-primary-500 mr-2" />
                <h3 className="text-lg font-semibold text-secondary-900 dark:text-white">
                  Sub-techniques
                </h3>
              </div>
              
              <div className="space-y-2">
                {technique.subTechniques.map(subTechnique => (
                  <div key={subTechnique.id} className="p-3 border border-secondary-200 dark:border-secondary-700 rounded-md">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-secondary-900 dark:text-white">{subTechnique.name}</h4>
                      <Badge variant="default">{subTechnique.id}</Badge>
                    </div>
                    <p className="text-sm text-secondary-600 dark:text-secondary-400">
                      {subTechnique.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Used By Groups */}
          {technique.groups && technique.groups.length > 0 && (
            <div className="dashboard-card p-4">
              <div className="flex items-center mb-2">
                <Users className="w-5 h-5 text-primary-500 mr-2" />
                <h3 className="text-lg font-semibold text-secondary-900 dark:text-white">
                  Used By Groups
                </h3>
              </div>
              
              <div className="space-y-2">
                {technique.groups.map(group => (
                  <div key={group.id} className="p-3 border border-secondary-200 dark:border-secondary-700 rounded-md">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-secondary-900 dark:text-white">{group.name}</h4>
                      <Badge variant="default">{group.id}</Badge>
                    </div>
                    <div className="text-xs text-secondary-500 dark:text-secondary-400 mb-2">
                      {group.aliases && group.aliases.join(', ')}
                    </div>
                    <p className="text-sm text-secondary-600 dark:text-secondary-400">
                      {group.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Software Implementations */}
          {technique.software && technique.software.length > 0 && (
            <div className="dashboard-card p-4">
              <div className="flex items-center mb-2">
                <Code className="w-5 h-5 text-primary-500 mr-2" />
                <h3 className="text-lg font-semibold text-secondary-900 dark:text-white">
                  Software Implementations
                </h3>
              </div>
              
              <div className="space-y-2">
                {technique.software.map(sw => (
                  <div key={sw.id} className="p-3 border border-secondary-200 dark:border-secondary-700 rounded-md">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-secondary-900 dark:text-white">{sw.name}</h4>
                      <Badge variant={sw.type === 'Malware' ? 'error' : 'warning'}>{sw.type}</Badge>
                    </div>
                    <p className="text-sm text-secondary-600 dark:text-secondary-400">
                      {sw.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Mitigations */}
          <div className="dashboard-card p-4">
            <div className="flex items-center mb-2">
              <Shield className="w-5 h-5 text-status-success mr-2" />
              <h3 className="text-lg font-semibold text-secondary-900 dark:text-white">
                Mitigations
              </h3>
            </div>
            
            {technique.mitigations && technique.mitigations.length > 0 ? (
              <div className="space-y-2">
                {technique.mitigations.map(mitigation => (
                  <div key={mitigation.id} className="p-3 border border-secondary-200 dark:border-secondary-700 rounded-md bg-secondary-50 dark:bg-secondary-800/50">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-secondary-900 dark:text-white">{mitigation.name}</h4>
                      <Badge variant="success" size="sm">{mitigation.id}</Badge>
                    </div>
                    <p className="text-sm text-secondary-600 dark:text-secondary-400">
                      {mitigation.description}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-secondary-500 dark:text-secondary-400 italic">
                No specific mitigations documented for this technique.
              </p>
            )}
          </div>
          
          {/* External References */}
          <div className="dashboard-card p-4">
            <div className="flex items-center mb-2">
              <ExternalLink className="w-5 h-5 text-primary-500 mr-2" />
              <h3 className="text-lg font-semibold text-secondary-900 dark:text-white">
                External References
              </h3>
            </div>
            
            <div className="space-y-2">
              <a 
                href={`https://attack.mitre.org/techniques/${technique.id.replace(/\./g, '/')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center p-2 text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View on MITRE ATT&CK
              </a>
            </div>
          </div>
          
          {/* Related Techniques */}
          <div className="dashboard-card p-4">
            <div className="flex items-center mb-2">
              <Zap className="w-5 h-5 text-primary-500 mr-2" />
              <h3 className="text-lg font-semibold text-secondary-900 dark:text-white">
                Related Techniques
              </h3>
            </div>
            
            {technique.parentTechnique ? (
              <div className="mb-3">
                <h4 className="text-sm font-medium text-secondary-500 dark:text-secondary-400 mb-1">Parent Technique</h4>
                <div className="p-2 border border-secondary-200 dark:border-secondary-700 rounded-md bg-secondary-50 dark:bg-secondary-800/50">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-secondary-900 dark:text-white">{technique.parentTechnique.name}</span>
                    <Badge variant="default" size="sm">{technique.parentTechnique.id}</Badge>
                  </div>
                </div>
              </div>
            ) : null}
            
            {/* This would be populated with actual related techniques in a real implementation */}
            <p className="text-secondary-500 dark:text-secondary-400 italic">
              Related techniques would be shown here based on common tactics, mitigations, or groups.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * SearchResults Component
 * Displays search results across techniques, groups, and software
 */
const SearchResults = ({ results, onSelectTechnique, onClearSearch }) => {
  if (!results) return null;
  
  const { techniques, groups, software } = results;
  const hasResults = techniques.length > 0 || groups.length > 0 || software.length > 0;
  
  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-secondary-900 dark:text-white">Search Results</h2>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onClearSearch}
          leadingIcon={X}
        >
          Clear Search
        </Button>
      </div>
      
      {!hasResults && (
        <div className="text-center py-12 bg-secondary-50 dark:bg-secondary-800/30 rounded-lg border border-secondary-200 dark:border-secondary-700">
          <Search className="w-12 h-12 mx-auto text-secondary-400 dark:text-secondary-600" />
          <h3 className="mt-2 text-lg font-medium text-secondary-900 dark:text-white">No Results Found</h3>
          <p className="text-secondary-500 dark:text-secondary-400">
            Try adjusting your search terms or search for a different keyword.
          </p>
        </div>
      )}
      
      {techniques.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-3 flex items-center">
            <Shield className="w-5 h-5 text-primary-500 mr-2" />
            Techniques ({techniques.length})
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {techniques.map(technique => (
              <div 
                key={technique.id}
                className="p-3 border border-secondary-200 dark:border-secondary-700 rounded-md hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-sm cursor-pointer"
                onClick={() => onSelectTechnique(technique.id)}
              >
                <div className="flex items-center justify-between mb-1">
                  <Badge variant="default">{technique.id}</Badge>
                  {technique.subTechniques && technique.subTechniques.length > 0 && (
                    <Badge variant="secondary" size="sm">{technique.subTechniques.length} sub-techniques</Badge>
                  )}
                </div>
                <h4 className="font-medium text-secondary-900 dark:text-white">{technique.name}</h4>
                <p className="text-sm text-secondary-600 dark:text-secondary-400 mt-1 line-clamp-2">
                  {technique.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {groups.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-3 flex items-center">
            <Users className="w-5 h-5 text-primary-500 mr-2" />
            Groups ({groups.length})
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {groups.map(group => (
              <div 
                key={group.id}
                className="p-3 border border-secondary-200 dark:border-secondary-700 rounded-md hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-sm"
              >
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium text-secondary-900 dark:text-white">{group.name}</h4>
                  <Badge variant="default">{group.id}</Badge>
                </div>
                <div className="text-xs text-secondary-500 dark:text-secondary-400 mb-2">
                  {group.aliases && group.aliases.join(', ')}
                </div>
                <p className="text-sm text-secondary-600 dark:text-secondary-400 line-clamp-2">
                  {group.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {software.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-3 flex items-center">
            <Code className="w-5 h-5 text-primary-500 mr-2" />
            Software ({software.length})
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {software.map(sw => (
              <div 
                key={sw.id}
                className="p-3 border border-secondary-200 dark:border-secondary-700 rounded-md hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-sm"
              >
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium text-secondary-900 dark:text-white">{sw.name}</h4>
                  <Badge variant={sw.type === 'Malware' ? 'error' : 'warning'}>{sw.type}</Badge>
                </div>
                <p className="text-sm text-secondary-600 dark:text-secondary-400 line-clamp-2">
                  {sw.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * MitreAttackPage Component
 * 
 * Main page component for the MITRE ATT&CK framework visualization and exploration.
 * Provides an interactive interface to browse tactics, techniques, groups, and software
 * from the MITRE ATT&CK knowledge base.
 */
const MitreAttackPage = () => {
  // --- State from hook ---
  const {
    tactics,
    techniques,
    groups,
    selectedTactic,
    selectedTechnique,
    loading,
    error,
    searchResults,
    searchLoading,
    techniquesByTactic,
    selectTactic,
    selectTechnique,
    searchMitreData,
    clearSearch,
    getTechniqueDetails
  } = useMitreAttack();
  
  // --- Local state ---
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('matrix'); // 'matrix', 'technique', 'search'
  const [selectedTechniqueDetails, setSelectedTechniqueDetails] = useState(null);
  const [activeTab, setActiveTab] = useState('framework'); // 'framework' | 'navigator'
  const [navigatorFilters, setNavigatorFilters] = useState({ selectedGroups: [] });
  const searchInputRef = useRef(null);
  
  // initialize navigator filters once groups are loaded
  useEffect(() => {
    if (groups && groups.length && navigatorFilters.selectedGroups.length === 0) {
      setNavigatorFilters({ selectedGroups: groups.map(g => g.id) });
    }
  }, [groups, navigatorFilters.selectedGroups.length]);

  // helper to change navigator filters
  const onNavigatorFilterChange = useCallback((key, value) => {
    setNavigatorFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  // technique extractor for navigator
  const getTechniquesForTactic = useCallback(
    (tacticId) => {
      const list = [];
      techniques.forEach(t => {
        if (t.tacticIds?.includes(tacticId)) {
          list.push(t);
        }
        if (t.subTechniques && t.subTechniques.length) {
          t.subTechniques.forEach(st => {
            if (st.tacticIds?.includes(tacticId)) {
              list.push({
                ...st,
                platforms: st.platforms || [],
              });
            }
          });
        }
      });
      return list;
    },
    [techniques]
  );

  // --- Effects ---
  
  // Update view mode based on selection state
  useEffect(() => {
    if (searchResults) {
      setViewMode('search');
    } else if (selectedTechnique) {
      setViewMode('technique');
    } else {
      setViewMode('matrix');
    }
  }, [searchResults, selectedTechnique]);
  
  // Load technique details when a technique is selected
  useEffect(() => {
    if (selectedTechnique) {
      const details = getTechniqueDetails(selectedTechnique);
      setSelectedTechniqueDetails(details);
    } else {
      setSelectedTechniqueDetails(null);
    }
  }, [selectedTechnique, getTechniqueDetails]);
  
  // --- Event Handlers ---
  
  // Handle search submission
  const handleSearch = useCallback((e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      searchMitreData(searchTerm);
    }
  }, [searchTerm, searchMitreData]);
  
  // Handle clearing search
  const handleClearSearch = useCallback(() => {
    setSearchTerm('');
    clearSearch();
  }, [clearSearch]);
  
  // Handle selecting a technique
  const handleSelectTechnique = useCallback((techniqueId) => {
    selectTechnique(techniqueId);
    clearSearch();
  }, [selectTechnique, clearSearch]);
  
  // Handle going back from technique details
  const handleBackFromTechnique = useCallback(() => {
    selectTechnique(null);
  }, [selectTechnique]);
  
  // Focus search input with keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+K or Cmd+K
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  // --- Render Logic ---
  
  if (loading && !tactics.length) {
    return (
      <div className="flex items-center justify-center h-full min-h-[70vh]">
        <LoadingSpinner size="lg" message="Loading MITRE ATT&CK Framework Data..." />
      </div>
    );
  }
  
  if (error) {
    return (
      <ErrorDisplay
        title="MITRE ATT&CK Data Error"
        message={error}
        onRetry={() => window.location.reload()}
      />
    );
  }
  
  return (
    <div className="fade-in">
      {/* Header */}
      <div className="dashboard-card p-4 md:p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col gap-4">
            <h1 className="text-2xl font-bold text-secondary-900 dark:text-white flex items-center">
              <Shield className="h-7 w-7 mr-3 text-primary-600" />
              MITRE ATT&CK Framework
            </h1>
            <p className="text-secondary-500 dark:text-secondary-400 mt-1">
              Explore tactics and techniques used by threat actors in cyber attacks.
            </p>

            {/* TAB SWITCHER (mobile stacked) */}
            <div className="flex items-center gap-2 mt-2 md:hidden">
              <Button
                variant={activeTab === 'framework' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('framework')}
              >
                Framework
              </Button>
              <Button
                variant={activeTab === 'navigator' ? 'primary' : 'ghost'}
                size="sm"
                leadingIcon={Navigation}
                onClick={() => setActiveTab('navigator')}
              >
                Navigator View
              </Button>
            </div>
          </div>
          
          {/* RIGHT COLUMN (tabs + search stacked on md+) */}
          <div className="flex flex-col md:items-end gap-3 w-full md:w-auto">
            <div className="hidden md:flex items-center gap-2">
              <Button
                variant={activeTab === 'framework' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('framework')}
              >
                Framework
              </Button>
              <Button
                variant={activeTab === 'navigator' ? 'primary' : 'ghost'}
                size="sm"
                leadingIcon={Navigation}
                onClick={() => setActiveTab('navigator')}
              >
                Navigator View
              </Button>
            </div>

            <form onSubmit={handleSearch} className="flex w-full md:w-auto">
              <div className="relative flex-grow">
                <Input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search techniques, groups, software... (Ctrl+K)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  leadingIcon={Search}
                  className="w-full md:w-80"
                />
                {searchLoading && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <RefreshCw className="w-4 h-4 text-secondary-400 animate-spin" />
                  </div>
                )}
              </div>
              <Button type="submit" className="ml-2">Search</Button>
            </form>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      {activeTab === 'framework' ? (
        <div className="flex flex-col md:flex-row min-h-[70vh] dashboard-card overflow-hidden">
          {(viewMode === 'matrix' || window.innerWidth >= 768) && (
            <TacticSidebar
              tactics={tactics}
              selectedTactic={selectedTactic}
              onSelectTactic={selectTactic}
            />
          )}

          <div className="flex-grow overflow-y-auto">
            {viewMode === 'matrix' && (
              <MatrixView
                tactics={tactics}
                techniques={techniquesByTactic}
                selectedTactic={selectedTactic}
                selectedTechnique={selectedTechnique}
                onSelectTechnique={handleSelectTechnique}
              />
            )}
            {viewMode === 'technique' && (
              <TechniqueDetails
                technique={selectedTechniqueDetails}
                onBack={handleBackFromTechnique}
              />
            )}
            {viewMode === 'search' && (
              <SearchResults
                results={searchResults}
                onSelectTechnique={handleSelectTechnique}
                onClearSearch={handleClearSearch}
              />
            )}
          </div>
        </div>
      ) : (
        <div className="dashboard-card p-0 overflow-hidden min-h-[70vh]">
          {(() => {
            const palette = ['#3b82f6','#ef4444','#10b981','#a855f7','#f59e0b','#06b6d4'];
            const threatGroups = groups.map((g, idx) => ({
              id: g.id,
              name: g.name,
              alias: g.aliases?.[0] || '',
              country: (g.targetCountries && g.targetCountries[0]) || '',
              techniques: g.techniques,
              color: palette[idx % palette.length],
              description: g.description,
            }));
            return (
              <MitreAttackNavigator
                tactics={tactics}
                techniques={techniques}
                threatGroups={threatGroups}
                filters={navigatorFilters}
                onFilterChange={onNavigatorFilterChange}
                getTechniquesForTactic={getTechniquesForTactic}
              />
            );
          })()}
        </div>
      )}
      
      {/* Footer with Attribution */}
      <div className="mt-6 text-center text-sm text-secondary-500 dark:text-secondary-400">
        <p>
          Based on the <a href="https://attack.mitre.org/" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">MITRE ATT&CK®</a> framework, 
          a globally-accessible knowledge base of adversary tactics and techniques.
        </p>
      </div>
    </div>
  );
};

export default MitreAttackPage;
