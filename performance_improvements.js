// hooks/useFilteredRequirements.js - Fix the missing implementation
import { useMemo } from 'react';

export const useFilteredRequirements = (requirements, filters, searchTerm) => {
  return useMemo(() => {
    if (!requirements?.length) return [];
    
    return requirements.filter(req => {
      // Search matching - make case-insensitive and more robust
      const searchLower = searchTerm?.toLowerCase() || '';
      const matchesSearch = !searchTerm || [
        req.description,
        req.id,
        req.category,
        req.businessJustification
      ].some(field => field?.toLowerCase().includes(searchLower));

      // Filter matching with null checks
      const matchesFilters = 
        (!filters.area || req.area === filters.area) &&
        (!filters.type || req.type === filters.type) &&
        (!filters.status || req.status === filters.status) &&
        (!filters.maturityLevel || req.maturityLevel?.level === filters.maturityLevel) &&
        (!filters.applicability || req.applicability?.type === filters.applicability) &&
        (!filters.capability || req.capabilityId === filters.capability);
      
      return matchesSearch && matchesFilters;
    });
  }, [requirements, filters, searchTerm]);
};

// components/ui/StatCard.jsx - Memoized component
import React, { memo } from 'react';

export const StatCard = memo(({ title, value, icon: Icon, color, subtitle, onClick }) => {
  return (
    <div 
      className="relative bg-white rounded-xl shadow-md p-6 border-l-4 cursor-pointer transition-all duration-300 transform hover:scale-102 hover:shadow-lg"
      style={{ borderLeftColor: color }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => e.key === 'Enter' && onClick?.()}
      aria-label={`${title}: ${value}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <Icon className="h-10 w-10" style={{ color }} aria-hidden="true" />
      </div>
    </div>
  );
});

StatCard.displayName = 'StatCard';

// components/ui/MaturityIndicator.jsx - Separate component
import React, { memo } from 'react';

export const MaturityIndicator = memo(({ level, score }) => (
  <div className="flex items-center space-x-2">
    <div className="flex space-x-1" role="progressbar" aria-label={`Maturity level ${score} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className={`w-3 h-3 rounded-full ${
            i <= score ? 'bg-blue-500' : 'bg-gray-200'
          }`}
          aria-hidden="true"
        />
      ))}
    </div>
    <span className="text-sm font-medium text-gray-700">{level}</span>
  </div>
));

MaturityIndicator.displayName = 'MaturityIndicator';

// hooks/useDashboardReducer.js - Separate reducer logic
import { useReducer } from 'react';

const initialState = {
  filters: {
    area: '',
    type: '',
    status: '',
    priority: '',
    maturityLevel: '',
    applicability: '',
    capability: ''
  },
  ui: {
    viewMode: 'overview',
    sidebarExpanded: true,
    activeFilters: false,
    chartFullscreen: null,
    showUploadModal: false,
    showPurgeModal: false,
    showNewCapabilityModal: false,
    showColumnSelector: false,
    selectedCapability: null,
    selectedPCD: null
  },
  modal: {
    isOpen: false,
    selectedRequirement: null,
    editMode: false
  },
  searchTerm: '',
  columnVisibility: {
    id: true,
    description: true,
    capability: true,
    progressStatus: true,
    businessValue: true,
    maturity: true,
    applicability: true,
    status: true,
    actions: true,
    area: false,
    type: false,
    priority: false,
    assignee: false,
    dueDate: false
  }
};

const dashboardReducer = (state, action) => {
  switch (action.type) {
    case 'SET_FILTER':
      return {
        ...state,
        filters: { ...state.filters, [action.field]: action.value }
      };
    
    case 'CLEAR_FILTERS':
      return {
        ...state,
        filters: initialState.filters
      };
    
    case 'SET_SEARCH_TERM':
      return {
        ...state,
        searchTerm: action.searchTerm
      };
    
    case 'CLEAR_SEARCH':
      return {
        ...state,
        searchTerm: ''
      };
    
    case 'SET_VIEW_MODE':
      return {
        ...state,
        ui: { ...state.ui, viewMode: action.viewMode }
      };
    
    case 'TOGGLE_SIDEBAR':
      return {
        ...state,
        ui: { ...state.ui, sidebarExpanded: !state.ui.sidebarExpanded }
      };
    
    case 'TOGGLE_FILTERS':
      return {
        ...state,
        ui: { ...state.ui, activeFilters: !state.ui.activeFilters }
      };
    
    case 'OPEN_MODAL':
      return {
        ...state,
        modal: { 
          isOpen: true, 
          selectedRequirement: action.requirement, 
          editMode: action.editMode || false 
        }
      };
    
    case 'CLOSE_MODAL':
      return {
        ...state,
        modal: { isOpen: false, selectedRequirement: null, editMode: false }
      };
    
    case 'SET_SELECTED_CAPABILITY':
      return {
        ...state,
        ui: { ...state.ui, selectedCapability: action.capabilityId },
        filters: { ...state.filters, capability: action.capabilityId }
      };
    
    default:
      return state;
  }
};

export const useDashboardState = () => {
  return useReducer(dashboardReducer, initialState);
};