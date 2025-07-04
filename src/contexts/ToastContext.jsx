import React, { createContext, useContext, useState, useCallback } from 'react';
import PropTypes from 'prop-types';

/**
 * Toast Context for the Cyber Trust Sensor Dashboard
 * 
 * This is a placeholder context to resolve import errors during the initial
 * architecture setup. It provides a basic structure for a notification system.
 * The actual toast rendering component will be implemented separately.
 * 
 * Provides:
 * - A list of toast messages
 * - A function to add new toasts
 * - A function to remove toasts
 */

// 1. Create the context with a default value
const ToastContext = createContext({
  toasts: [],
  addToast: () => {},
  removeToast: () => {},
});

/**
 * 2. Create the Toast Provider component
 * This component will wrap the application and manage the toast state.
 */
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  // Function to remove a toast by its ID
  const removeToast = useCallback((id) => {
    setToasts(currentToasts => currentToasts.filter(toast => toast.id !== id));
  }, []);

  // Function to add a new toast message
  const addToast = useCallback((message, options = {}) => {
    const id = Date.now() + Math.random();
    const newToast = {
      id,
      message,
      type: options.type || 'info', // e.g., 'info', 'success', 'warning', 'error'
      duration: options.duration || 5000, // duration in ms
    };

    setToasts(currentToasts => [...currentToasts, newToast]);

    // Automatically remove the toast after its duration
    setTimeout(() => {
      removeToast(id);
    }, newToast.duration);
  }, [removeToast]);

  // The context value that will be available to consuming components
  const value = {
    toasts,
    addToast,
    removeToast,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* 
        A ToastContainer component would typically be rendered here
        to display the actual toast messages. For now, this provider
        only handles the state logic.
      */}
    </ToastContext.Provider>
  );
};

ToastProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

/**
 * 3. Create a custom hook for easy context consumption
 */
export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export default ToastContext;
