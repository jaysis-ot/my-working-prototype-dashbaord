import React, { useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  Shield,
  Search,
  Users,
  Info,
  X,
  ChevronDown,
  ArrowLeft,
  Target,
  Globe
} from 'lucide-react';
import Button from '../atoms/Button';
import Badge from '../atoms/Badge';
import Input from '../atoms/Input';

// --- Internal Molecules (Components specific to this organism) ---

/**
 * FilterToolbar: A dedicated component for all filtering and search controls.
 */
const FilterToolbar = ({ threatGroups, filters, onFilterChange }) => {
  const [showGroupSelector, setShowGroupSelector] = useState(false);

  const handleGroupSelection = (groupId) => {
    const newSelection = new Set(filters.selectedGroups);
    if (newSelection.has(groupId)) {
      newSelection.delete(groupId);
    } else {
      newSelection.add(groupId);
    }
    onFilterChange('selectedGroups', Array.from(newSelection));
  };

  return (
    <div className="dashboard-card p-4 mb-6">
      <div className="flex flex-col md:flex-row items-center gap-4">
        <Input
          placeholder="Search techniques (e.g., T1566.001)"
          value={filters.search}
          onChange={(e) => onFilterChange('search', e.target.value)}
          leadingIcon={Search}
          className="flex-grow"
        />
        <div className="relative w-full md:w-auto">
          <Button
            variant="secondary"
            onClick={() => setShowGroupSelector(s => !s)}
            className="w-full justify-between"
          >
            <span>Threat Groups ({filters.selectedGroups.length} selected)</span>
            <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showGroupSelector ? 'rotate-180' : ''}`} />
          </Button>
          {showGroupSelector && (
            <div className="absolute top-full left-0 mt-2 w-full md:w-72 bg-white dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 rounded-lg shadow-lg z-20 p-4">
              <h4 className="text-sm font-semibold mb-2">Select Threat Groups</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {threatGroups.map(group => (
                  <label key={group.id} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.selectedGroups.includes(group.id)}
                      onChange={() => handleGroupSelection(group.id)}
                      className="rounded text-primary-600 focus:ring-primary-500"
                    />
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: group.color }}></div>
                    <span>{group.name} ({group.alias})</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * MatrixCell: Represents a single technique in the ATT&CK matrix.
 */
const MatrixCell = ({ technique, highlightColor, onSelect }) => {
  return (
    <div
      className="p-2 text-xs border-b border-secondary-200 dark:border-secondary-700 hover:bg-primary-100 dark:hover:bg-primary-500/20 cursor-pointer transition-colors"
      style={{ backgroundColor: highlightColor ? `${highlightColor}33` : 'transparent' }} // 20% opacity
      onClick={() => onSelect(technique)}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect(technique)}
    >
      <p className="font-medium text-secondary-800 dark:text-secondary-200 truncate" title={technique.name}>
        {technique.name}
      </p>
      <p className="text-secondary-500 dark:text-secondary-400">{technique.id}</p>
    </div>
  );
};

/**
 * DetailsPanel: Shows information about the selected technique or threat group.
 */
const DetailsPanel = ({ item, onClose }) => (
  <div className="dashboard-card w-full lg:w-1/3 p-6 h-full overflow-y-auto">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-bold text-secondary-900 dark:text-white">Details</h3>
      <Button variant="ghost" size="sm" onClick={onClose} className="p-1"><X className="w-5 h-5" /></Button>
    </div>
    {item ? (
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold text-primary-600 dark:text-primary-300">{item.name}</h4>
          <p className="text-sm font-mono text-secondary-500">{item.id}</p>
        </div>
        <p className="text-sm text-secondary-600 dark:text-secondary-400">{item.description || "No description available."}</p>
        {item.tacticIds && (
          <div>
            <h5 className="text-sm font-semibold mb-1">Tactics</h5>
            <div className="flex flex-wrap gap-1">
              {item.tacticIds.map(tactic => <Badge key={tactic}>{tactic}</Badge>)}
            </div>
          </div>
        )}
      </div>
    ) : (
      <div className="text-center py-16 text-secondary-500">
        <Info className="w-10 h-10 mx-auto mb-2" />
        <p>Select a technique from the matrix to view its details.</p>
      </div>
    )}
  </div>
);

// --- Main Organism Component ---

const MitreAttackNavigator = ({
  tactics,
  techniques,
  threatGroups,
  filters,
  onFilterChange,
  getTechniquesForTactic,
  onNavigateBack,
}) => {
  const [selectedTechnique, setSelectedTechnique] = useState(null);

  const highlightedTechniques = useMemo(() => {
    if (filters.selectedGroups.length === 0) return {};
    
    const mapping = {};
    threatGroups
      .filter(g => filters.selectedGroups.includes(g.id))
      .forEach(group => {
        group.techniques.forEach(techId => {
          if (!mapping[techId]) {
            mapping[techId] = [];
          }
          mapping[techId].push(group.color);
        });
      });
    return mapping;
  }, [filters.selectedGroups, threatGroups]);

  const coverageStats = useMemo(() => {
    const allSelectedTechniques = new Set(
      threatGroups
        .filter(g => filters.selectedGroups.includes(g.id))
        .flatMap(g => g.techniques)
    );
    // Placeholder for organizational coverage data
    const coveredTechniques = new Set(Object.keys(highlightedTechniques).slice(0, Math.floor(Object.keys(highlightedTechniques).length / 2)));
    
    const relevantCovered = new Set([...allSelectedTechniques].filter(t => coveredTechniques.has(t)));

    return {
      total: allSelectedTechniques.size,
      covered: relevantCovered.size,
      percentage: allSelectedTechniques.size > 0 ? (relevantCovered.size / allSelectedTechniques.size) * 100 : 0,
    };
  }, [filters.selectedGroups, threatGroups, highlightedTechniques]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onNavigateBack} className="p-2"><ArrowLeft className="w-5 h-5" /></Button>
          <div>
            <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">MITRE ATT&CK Navigator</h1>
            <p className="text-secondary-500 dark:text-secondary-400">Visualize threat actor techniques against the ATT&CK framework.</p>
          </div>
        </div>
        <div className="dashboard-card p-3 flex items-center gap-4">
          <Target className="w-6 h-6 text-primary-500" />
          <div>
            <p className="text-sm font-medium text-secondary-500">Coverage</p>
            <p className="text-xl font-bold">{coverageStats.percentage.toFixed(1)}%</p>
          </div>
          <p className="text-sm text-secondary-600">({coverageStats.covered} / {coverageStats.total} techniques)</p>
        </div>
      </div>

      <FilterToolbar
        threatGroups={threatGroups}
        filters={filters}
        onFilterChange={onFilterChange}
      />

      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-24rem)]">
        {/* ATT&CK Matrix */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden bg-white dark:bg-secondary-800 rounded-lg shadow-md border border-secondary-200 dark:border-secondary-700">
          <div className="flex h-full">
            {tactics.map(tactic => (
              <div key={tactic.id} className="flex-shrink-0 w-48 border-r border-secondary-200 dark:border-secondary-700">
                <div className="p-2 text-center bg-secondary-100 dark:bg-secondary-700/50 border-b-2 border-primary-500">
                  <h4 className="text-xs font-bold uppercase tracking-wider truncate" title={tactic.name}>{tactic.name}</h4>
                </div>
                <div className="h-[calc(100%-2.5rem)] overflow-y-auto">
                  {getTechniquesForTactic(tactic.id).map(technique => (
                    <MatrixCell
                      key={technique.id}
                      technique={technique}
                      highlightColor={highlightedTechniques[technique.id]?.[0]} // Show first group's color
                      onSelect={setSelectedTechnique}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Details Panel */}
        <DetailsPanel item={selectedTechnique} onClose={() => setSelectedTechnique(null)} />
      </div>
    </div>
  );
};

MitreAttackNavigator.propTypes = {
  tactics: PropTypes.array.isRequired,
  techniques: PropTypes.array.isRequired,
  threatGroups: PropTypes.array.isRequired,
  filters: PropTypes.object.isRequired,
  onFilterChange: PropTypes.func.isRequired,
  getTechniquesForTactic: PropTypes.func.isRequired,
  onNavigateBack: PropTypes.func.isRequired,
};

export default MitreAttackNavigator;
