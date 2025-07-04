// src/hooks/useKeyboardShortcuts.js
import { useEffect } from 'react';

export const useKeyboardShortcuts = (dispatch) => {
  useEffect(() => {
    const handleKeyboard = (event) => {
      // Add keyboard shortcuts later
      console.log('Keyboard shortcut:', event.key);
    };

    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [dispatch]);
};