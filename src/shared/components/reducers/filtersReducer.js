// src/reducers/filtersReducer.js
export const initialFilters = {
  area: '',
  type: '',
  status: '',
  priority: '',
  maturityLevel: '',
  applicability: '',
  capability: ''
};

export const filtersReducer = (state, action) => {
  switch (action.type) {
    case 'SET_FILTER':
      return { ...state, [action.field]: action.value };
    case 'CLEAR_FILTERS':
      return initialFilters;
    case 'SET_MULTIPLE_FILTERS':
      return { ...state, ...action.filters };
    default:
      return state;
  }
};