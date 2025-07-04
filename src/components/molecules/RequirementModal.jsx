import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { X, Edit, Star, Calendar, User, Tag, FileText, TrendingUp, Shield, BarChart, CheckSquare, Briefcase } from 'lucide-react';
import Button from '../atoms/Button';
import Input from '../atoms/Input';
import Badge from '../atoms/Badge';

// --- Reusable Molecules (Internal to this component) ---

const DetailSection = ({ title, icon: Icon, children, className = '' }) => (
  <div className={`py-4 ${className}`}>
    <h3 className="flex items-center text-md font-semibold text-secondary-700 dark:text-secondary-300 mb-3">
      <Icon className="w-5 h-5 mr-3 text-primary-500" />
      {title}
    </h3>
    <div className="pl-8 space-y-3">
      {children}
    </div>
  </div>
);

const DetailItem = ({ label, children }) => (
  <div>
    <p className="text-xs text-secondary-500 dark:text-secondary-400">{label}</p>
    <p className="text-sm font-medium text-secondary-800 dark:text-white">{children || '-'}</p>
  </div>
);

const StarRating = ({ score, onRate, isEditing = false }) => {
  const [hoverRating, setHoverRating] = useState(0);
  const displayScore = isEditing ? hoverRating || score : score;

  return (
    <div className="flex items-center">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-5 h-5 transition-colors ${isEditing ? 'cursor-pointer' : ''} ${
            displayScore > i ? 'text-yellow-400 fill-yellow-400' : 'text-secondary-300 dark:text-secondary-600'
          }`}
          onClick={() => isEditing && onRate(i + 1)}
          onMouseEnter={() => isEditing && setHoverRating(i + 1)}
          onMouseLeave={() => isEditing && setHoverRating(0)}
        />
      ))}
      <span className="ml-2 text-sm font-semibold">{score?.toFixed(1)}/5.0</span>
    </div>
  );
};

// --- Main Modal Component ---

const RequirementModal = ({ isOpen, onClose, requirement, onSave, isEditing: initialIsEditing = false }) => {
  const [isEditing, setIsEditing] = useState(initialIsEditing);
  const [formData, setFormData] = useState(requirement);

  useEffect(() => {
    setFormData(requirement);
    setIsEditing(initialIsEditing);
  }, [requirement, initialIsEditing, isOpen]);

  const handleChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);
  
  const handleNestedChange = useCallback((section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  }, []);

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  if (!isOpen || !requirement) return null;

  const {
    id, status, priority, description, progressStatus, progress,
    businessValueScore, costEstimate, maturityLevel, applicability,
    assignee, dueDate, capabilityId, category, businessJustification
  } = formData || {};

  const renderViewMode = () => (
    <>
      <p className="text-secondary-600 dark:text-secondary-300 mt-2 mb-4">{description}</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
        <DetailSection title="Progress & Status" icon={TrendingUp}>
          <DetailItem label="Progress Status">{progressStatus}</DetailItem>
          <DetailItem label="Completion">
            <div className="w-full bg-secondary-200 dark:bg-secondary-700 rounded-full h-2.5 mt-1">
              <div className="bg-primary-600 h-2.5 rounded-full" style={{ width: `${progress || 0}%` }}></div>
            </div>
          </DetailItem>
        </DetailSection>

        <DetailSection title="Business Value" icon={Star}>
          <DetailItem label="Score"><StarRating score={businessValueScore} /></DetailItem>
          <DetailItem label="Cost Estimate">{costEstimate ? `£${costEstimate.toLocaleString()}` : 'N/A'}</DetailItem>
        </DetailSection>

        <DetailSection title="Technical Details" icon={Shield}>
          <DetailItem label="Maturity Level">{maturityLevel?.level} (Score: {maturityLevel?.score}/5)</DetailItem>
          <DetailItem label="Applicability">{applicability}</DetailItem>
        </DetailSection>

        <DetailSection title="Assignment & Timeline" icon={Calendar}>
          <DetailItem label="Assignee">{assignee}</DetailItem>
          <DetailItem label="Due Date">{dueDate}</DetailItem>
          <DetailItem label="Capability">{capabilityId}</DetailItem>
          <DetailItem label="Created">Not specified</DetailItem>
        </DetailSection>
      </div>

      <DetailSection title="Business Justification" icon={Briefcase} className="border-t border-secondary-200 dark:border-secondary-700 mt-2">
        <p className="text-sm text-secondary-600 dark:text-secondary-400 leading-relaxed">{businessJustification}</p>
      </DetailSection>
    </>
  );

  const renderEditMode = () => (
    <div className="space-y-6 py-4">
      <div className="grid grid-cols-2 gap-4">
        <Input label="ID *" value={id} disabled />
        <Input label="Category *" value={category} onChange={e => handleChange('category', e.target.value)} />
      </div>
      <div>
        <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Description *</label>
        <textarea rows="3" value={description} onChange={e => handleChange('description', e.target.value)} className="w-full mt-1 block rounded-md border-secondary-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-secondary-800 dark:border-secondary-600 dark:text-white sm:text-sm" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Progress Status</label>
          <select value={progressStatus} onChange={e => handleChange('progressStatus', e.target.value)} className="w-full mt-1 block rounded-md border-secondary-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-secondary-800 dark:border-secondary-600 dark:text-white sm:text-sm">
            <option>Feasibility</option>
            <option>Qualifying</option>
            <option>Delivering</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Priority</label>
          <select value={priority} onChange={e => handleChange('priority', e.target.value)} className="w-full mt-1 block rounded-md border-secondary-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-secondary-800 dark:border-secondary-600 dark:text-white sm:text-sm">
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
            <option>Critical</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Progress Completion: {progress || 0}%</label>
        <input type="range" min="0" max="100" value={progress || 0} onChange={e => handleChange('progress', parseInt(e.target.value))} className="w-full h-2 bg-secondary-200 rounded-lg appearance-none cursor-pointer dark:bg-secondary-700" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Business Value (1-5)</label>
          <StarRating score={businessValueScore} onRate={score => handleChange('businessValueScore', score)} isEditing />
        </div>
        <Input label="Cost Estimate (£)" type="number" value={costEstimate} onChange={e => handleChange('costEstimate', e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Applicability</label>
          <select value={applicability} onChange={e => handleChange('applicability', e.target.value)} className="w-full mt-1 block rounded-md border-secondary-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-secondary-800 dark:border-secondary-600 dark:text-white sm:text-sm">
            <option>Not Applicable</option>
            <option>Applicable</option>
            <option>Conditional</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Maturity Level</label>
          <select value={maturityLevel?.level} onChange={e => handleNestedChange('maturityLevel', 'level', e.target.value)} className="w-full mt-1 block rounded-md border-secondary-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-secondary-800 dark:border-secondary-600 dark:text-white sm:text-sm">
            <option>Initial</option>
            <option>Developing</option>
            <option>Defined</option>
            <option>Managed</option>
            <option>Optimizing</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Assignee" value={assignee} onChange={e => handleChange('assignee', e.target.value)} />
        <Input label="Due Date" type="date" value={dueDate} onChange={e => handleChange('dueDate', e.target.value)} />
      </div>
      <div>
        <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Business Justification</label>
        <textarea rows="4" value={businessJustification} onChange={e => handleChange('businessJustification', e.target.value)} className="w-full mt-1 block rounded-md border-secondary-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-secondary-800 dark:border-secondary-600 dark:text-white sm:text-sm" />
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 transition-opacity" onClick={onClose}>
      <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-start justify-between p-4 border-b border-secondary-200 dark:border-secondary-700">
          <div>
            <h2 className="text-lg font-bold text-secondary-900 dark:text-white">{isEditing ? 'Edit Requirement' : 'View Requirement'}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-mono text-sm text-primary-600 dark:text-primary-300">{id}</span>
              <Badge variant={status === 'Completed' ? 'success' : 'default'}>{status}</Badge>
              <Badge variant={priority === 'Critical' ? 'error' : priority === 'High' ? 'warning' : 'default'}>{priority}</Badge>
            </div>
          </div>
          {!isEditing && (
            <Button variant="secondary" onClick={() => setIsEditing(true)} leadingIcon={Edit}>Edit</Button>
          )}
          <button onClick={onClose} className="p-1 rounded-full hover:bg-secondary-100 dark:hover:bg-secondary-700">
            <X className="w-5 h-5 text-secondary-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto">
          {isEditing ? renderEditMode() : renderViewMode()}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-4 border-t border-secondary-200 dark:border-secondary-700">
          {isEditing ? (
            <div className="flex gap-2">
              <Button variant="secondary" onClick={onClose}>Cancel</Button>
              <Button onClick={handleSave}>Save Changes</Button>
            </div>
          ) : (
            <Button onClick={onClose}>Close</Button>
          )}
        </div>
      </div>
    </div>
  );
};

RequirementModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  requirement: PropTypes.object,
  onSave: PropTypes.func.isRequired,
  isEditing: PropTypes.bool,
};

export default RequirementModal;
