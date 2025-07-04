// src/reducers/columnVisibilityReducer.js
export const initialColumnVisibility = {
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
};

export const columnVisibilityReducer = (state, action) => {
  switch (action.type) {
    case 'TOGGLE_COLUMN':
      return { ...state, [action.column]: !state[action.column] };
    case 'SET_COLUMN_VISIBILITY':
      return { ...state, [action.column]: action.visible };
    case 'RESET_COLUMNS':
      return initialColumnVisibility;
    case 'SHOW_ALL_COLUMNS':
      return Object.keys(state).reduce((acc, key) => {
        acc[key] = true;
        return acc;
      }, {});
    default:
      return state;
  }
};