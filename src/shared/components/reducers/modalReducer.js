// src/reducers/modalReducer.js
export const initialModal = {
  isOpen: false,
  selectedRequirement: null,
  editMode: false
};

export const modalReducer = (state, action) => {
  switch (action.type) {
    case 'OPEN_MODAL':
      return { 
        isOpen: true, 
        selectedRequirement: action.requirement, 
        editMode: action.editMode || false 
      };
    case 'CLOSE_MODAL':
      return { ...initialModal };
    case 'SET_EDIT_MODE':
      return { ...state, editMode: action.editMode };
    default:
      return state;
  }
};