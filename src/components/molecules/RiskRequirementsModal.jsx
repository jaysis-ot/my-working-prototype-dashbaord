import React, { useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { X, ShieldAlert, Plus, Eye, Edit, Link, AlertTriangle } from 'lucide-react';
import Button from '../atoms/Button';
import Badge from '../atoms/Badge';
import { useRequirementsData } from '../../hooks/useRequirementsData';
import { useCapabilitiesData } from '../../hooks/useCapabilitiesData'; // NEW
import RequirementModal from './RequirementModal';

/**
 * RiskRequirementsModal Component
 * 
 * This modal displays requirements associated with a risk and allows users to:
 * - View risk details
 * - See associated requirements
 * - View requirement details
 * - Edit requirements
 * - Associate new requirements with the risk
 * 
 * It serves as a bridge between the risk management and requirements management features.
 */
const RiskRequirementsModal = ({ risk, isOpen, onClose }) => {
  // State for requirement viewing/editing
  const [selectedRequirement, setSelectedRequirement] = useState(null);
  const [isRequirementModalOpen, setIsRequirementModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showAssociatePanel, setShowAssociatePanel] = useState(false);

  // Get requirements data
  const { 
    requirements, 
    updateRequirement,
    loading: requirementsLoading 
  } = useRequirementsData();

  // --- Capabilities data --------------------------------------------------- //
  const { capabilities, loading: capabilitiesLoading } = useCapabilitiesData();

  // Map for quick lookup of capability info by ID
  const capabilitiesMap = useMemo(() => {
    const map = {};
    capabilities.forEach(cap => {
      map[cap.id] = cap;
    });
    return map;
  }, [capabilities]);

  // Filter requirements associated with this risk
  // In a real app, this would use a proper relationship field
  // For demo purposes, we'll use a simple ID match in the requirement's riskIds array
  const associatedRequirements = useMemo(() => {
    if (!risk || !requirements.length) return [];
    
    // Simulate requirements associated with this risk
    // In a real app, requirements would have a riskIds array or similar
    return requirements.filter(req => 
      req.riskIds?.includes(risk.id) || 
      // For demo, associate some requirements based on a pattern
      (req.id.endsWith(risk.id.slice(-2)) && Math.random() > 0.7)
    );
  }, [risk, requirements]);

  // Available requirements that can be associated
  const availableRequirements = useMemo(() => {
    if (!risk || !requirements.length) return [];
    
    const associatedIds = new Set(associatedRequirements.map(r => r.id));
    return requirements.filter(req => !associatedIds.has(req.id));
  }, [risk, requirements, associatedRequirements]);

  // --- Event Handlers ---

  const handleViewRequirement = useCallback((requirement) => {
    setSelectedRequirement(requirement);
    setIsEditMode(false);
    setIsRequirementModalOpen(true);
  }, []);

  const handleEditRequirement = useCallback((requirement) => {
    setSelectedRequirement(requirement);
    setIsEditMode(true);
    setIsRequirementModalOpen(true);
  }, []);

  const handleCloseRequirementModal = useCallback(() => {
    setIsRequirementModalOpen(false);
    setSelectedRequirement(null);
  }, []);

  const handleSaveRequirement = useCallback((updatedRequirement) => {
    updateRequirement(updatedRequirement.id, updatedRequirement);
    setIsRequirementModalOpen(false);
    setSelectedRequirement(null);
  }, [updateRequirement]);

  const handleAssociateRequirement = useCallback((requirement) => {
    if (!risk || !requirement) return;
    
    // In a real app, you would update the relationship between risk and requirement
    // For this demo, we'll add the risk ID to the requirement's riskIds array
    const riskIds = requirement.riskIds || [];
    if (!riskIds.includes(risk.id)) {
      const updatedRequirement = {
        ...requirement,
        riskIds: [...riskIds, risk.id]
      };
      updateRequirement(requirement.id, updatedRequirement);
    }
  }, [risk, updateRequirement]);

  const handleRemoveAssociation = useCallback((requirement) => {
    if (!risk || !requirement) return;
    
    // Remove the association by filtering out this risk ID
    const riskIds = requirement.riskIds || [];
    if (riskIds.includes(risk.id)) {
      const updatedRequirement = {
        ...requirement,
        riskIds: riskIds.filter(id => id !== risk.id)
      };
      updateRequirement(requirement.id, updatedRequirement);
    }
  }, [risk, updateRequirement]);

  if (!isOpen || !risk) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-white dark:bg-secondary-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col" 
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-4 border-b border-secondary-200 dark:border-secondary-700">
          <div>
            <h2 className="text-lg font-bold text-secondary-900 dark:text-white flex items-center">
              <ShieldAlert className="w-5 h-5 mr-2 text-status-warning" />
              Risk Requirements
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-mono text-sm text-primary-600 dark:text-primary-300">{risk.id}</span>
              <Badge variant={risk.status === 'Mitigated' ? 'success' : 'default'}>{risk.status}</Badge>
              <Badge 
                variant={
                  risk.rating.level === 'Critical' ? 'error' : 
                  risk.rating.level === 'High' ? 'warning' : 
                  'default'
                }
              >
                {risk.rating.level}
              </Badge>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-secondary-100 dark:hover:bg-secondary-700">
            <X className="w-5 h-5 text-secondary-500" />
          </button>
        </div>

        {/* Risk Details */}
        <div className="p-4 border-b border-secondary-200 dark:border-secondary-700 bg-secondary-50 dark:bg-secondary-900/50">
          <h3 className="font-medium text-secondary-900 dark:text-white">{risk.title}</h3>
          <p className="text-sm text-secondary-600 dark:text-secondary-400 mt-1">{risk.description}</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
            <div>
              <p className="text-xs text-secondary-500 dark:text-secondary-400">Category</p>
              <p className="text-sm font-medium">{risk.category}</p>
            </div>
            <div>
              <p className="text-xs text-secondary-500 dark:text-secondary-400">Owner</p>
              <p className="text-sm font-medium">{risk.owner}</p>
            </div>
            <div>
              <p className="text-xs text-secondary-500 dark:text-secondary-400">Impact</p>
              <p className="text-sm font-medium">{risk.impact}/5</p>
            </div>
            <div>
              <p className="text-xs text-secondary-500 dark:text-secondary-400">Probability</p>
              <p className="text-sm font-medium">{risk.probability}/5</p>
            </div>
          </div>
          
          {/* Capability Mitigations */}
          <div className="mt-4 border-t border-secondary-200 dark:border-secondary-700 pt-3">
            <h4 className="text-sm font-medium text-secondary-900 dark:text-white mb-2">Mitigating Capabilities</h4>
            {associatedRequirements.length === 0 ? (
              <p className="text-xs text-secondary-500 dark:text-secondary-400">No capabilities linked through requirements.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {/* Get unique capabilities from requirements */}
                {[...new Set(associatedRequirements
                  .map(req => req.capabilityId)
                  .filter(Boolean))]
                  .map(capId => {
                    const capability = capabilitiesMap[capId];
                    return capability ? (
                      <Badge key={capId} variant="info" className="px-2 py-1">
                        {capability.name}
                      </Badge>
                    ) : null;
                  })}
              </div>
            )}
          </div>
        </div>

        {/* Requirements List */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-md font-semibold text-secondary-900 dark:text-white">
              Associated Requirements ({associatedRequirements.length})
            </h3>
            <Button 
              size="sm" 
              variant="secondary" 
              leadingIcon={Plus} 
              onClick={() => setShowAssociatePanel(!showAssociatePanel)}
            >
              Associate Requirement
            </Button>
          </div>

          {/* Associate Requirements Panel */}
          {showAssociatePanel && (
            <div className="mb-6 p-4 border border-secondary-200 dark:border-secondary-700 rounded-md bg-secondary-50 dark:bg-secondary-800/50">
              <h4 className="text-sm font-medium mb-2">Select a requirement to associate</h4>
              {availableRequirements.length === 0 ? (
                <p className="text-sm text-secondary-500 dark:text-secondary-400">No available requirements to associate.</p>
              ) : (
                <div className="max-h-40 overflow-y-auto">
                  {availableRequirements.map(req => (
                    <div key={req.id} className="flex items-center justify-between py-2 border-b border-secondary-100 dark:border-secondary-700/50">
                      <div>
                        <p className="text-sm font-medium">{req.id}</p>
                        <p className="text-xs text-secondary-500 dark:text-secondary-400 truncate max-w-md">{req.description}</p>
                      </div>
                      <Button 
                        size="xs" 
                        variant="secondary" 
                        leadingIcon={Link} 
                        onClick={() => handleAssociateRequirement(req)}
                      >
                        Associate
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-3 flex justify-end">
                <Button size="sm" variant="ghost" onClick={() => setShowAssociatePanel(false)}>Close</Button>
              </div>
            </div>
          )}

          {/* Requirements List */}
          {requirementsLoading ? (
            <div className="text-center py-8">
              <p className="text-secondary-500 dark:text-secondary-400">Loading requirements...</p>
            </div>
          ) : associatedRequirements.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-secondary-300 dark:border-secondary-700 rounded-lg">
              <AlertTriangle className="w-8 h-8 text-secondary-400 mx-auto mb-2" />
              <p className="text-secondary-500 dark:text-secondary-400">No requirements associated with this risk.</p>
              <p className="text-sm text-secondary-400 dark:text-secondary-500 mt-1">
                Click "Associate Requirement" to link existing requirements.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {associatedRequirements.map(req => (
                <div 
                  key={req.id} 
                  className="p-3 border border-secondary-200 dark:border-secondary-700 rounded-md hover:bg-secondary-50 dark:hover:bg-secondary-700/50"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm text-primary-600 dark:text-primary-300">{req.id}</span>
                        <Badge variant={req.status === 'Completed' ? 'success' : 'default'}>{req.status}</Badge>
                        <Badge variant={req.priority === 'Critical' ? 'error' : req.priority === 'High' ? 'warning' : 'default'}>
                          {req.priority}
                        </Badge>
                      </div>
                      <p className="text-sm font-medium mt-1 text-secondary-900 dark:text-white">{req.description}</p>
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      <Button size="xs" variant="ghost" onClick={() => handleViewRequirement(req)} title="View">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="xs" variant="ghost" onClick={() => handleEditRequirement(req)} title="Edit">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="xs" 
                        variant="ghost" 
                        className="text-status-error" 
                        onClick={() => handleRemoveAssociation(req)} 
                        title="Remove association"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 text-xs">
                    <div>
                      <span className="text-secondary-500 dark:text-secondary-400">Maturity: </span>
                      <span>{req.maturityLevel?.level || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-secondary-500 dark:text-secondary-400">Progress: </span>
                      <span>{req.progress || 0}%</span>
                    </div>
                    <div>
                      <span className="text-secondary-500 dark:text-secondary-400">Assignee: </span>
                      <span>{req.assignee || 'Unassigned'}</span>
                    </div>
                    <div>
                      <span className="text-secondary-500 dark:text-secondary-400">Due: </span>
                      <span>{req.dueDate || 'Not set'}</span>
                    </div>
                  </div>
                  <div className="mt-2">
                    <span className="text-xs text-secondary-500 dark:text-secondary-400 mr-1">Capability:</span>
                    {req.capabilityId && capabilitiesMap[req.capabilityId] ? (
                      <span className="text-xs font-medium bg-secondary-100 dark:bg-secondary-700 text-primary-700 dark:text-primary-300 rounded px-1.5 py-0.5">
                        {capabilitiesMap[req.capabilityId].name}
                      </span>
                    ) : (
                      <span className="text-xs text-secondary-400 dark:text-secondary-600">None</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-4 border-t border-secondary-200 dark:border-secondary-700">
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>

      {/* Requirement Modal for viewing/editing */}
      {isRequirementModalOpen && selectedRequirement && (
        <RequirementModal
          isOpen={isRequirementModalOpen}
          onClose={handleCloseRequirementModal}
          requirement={selectedRequirement}
          onSave={handleSaveRequirement}
          isEditing={isEditMode}
        />
      )}
    </div>
  );
};

RiskRequirementsModal.propTypes = {
  risk: PropTypes.object.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
};

export default RiskRequirementsModal;
