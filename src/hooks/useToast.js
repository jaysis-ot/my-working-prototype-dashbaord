// src/hooks/useToast.js
import { useState, useCallback } from 'react';

/**
 * useToast Hook
 * 
 * A custom hook for managing toast notifications throughout the application.
 * This is a simple implementation that can be expanded later with features like:
 * - Toast queuing
 * - Auto-dismissal
 * - Animation
 * - Custom positioning
 * 
 * @returns {Object} Toast utilities
 */
export const useToast = () => {
  // Toast state
  const [toast, setToast] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info', // 'info', 'success', 'warning', 'error'
    duration: 5000 // Default duration in ms
  });

  /**
   * Show a toast notification
   * 
   * @param {Object} options - Toast options
   * @param {string} options.title - Toast title
   * @param {string} options.message - Toast message
   * @param {string} options.type - Toast type ('info', 'success', 'warning', 'error')
   * @param {number} options.duration - How long to show the toast (in ms)
   */
  const showToast = useCallback(({ title, message, type = 'info', duration = 5000 }) => {
    setToast({
      visible: true,
      title,
      message,
      type,
      duration
    });

    // Auto-hide toast after duration
    if (duration > 0) {
      setTimeout(() => {
        hideToast();
      }, duration);
    }
  }, []);

  /**
   * Hide the current toast notification
   */
  const hideToast = useCallback(() => {
    setToast(prev => ({
      ...prev,
      visible: false
    }));
  }, []);

  // Return the toast state and functions
  return {
    toast,
    showToast,
    hideToast
  };
};

export default useToast;
