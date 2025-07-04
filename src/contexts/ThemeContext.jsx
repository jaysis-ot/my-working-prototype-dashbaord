import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';

/**
 * Theme Context for the Cyber Trust Sensor Dashboard
 * 
 * Provides theme management functionality including:
 * - Dark/light theme switching
 * - System preference detection
 * - Theme persistence in localStorage
 * - Theme-specific styling utilities for Trust-Centric GRC components
 */

// Create the context with a default value
const ThemeContext = createContext({
  theme: 'light',
  isDark: false,
  toggleTheme: () => {},
  setTheme: () => {},
  themeClasses: {},
  getTrustPillarColor: () => {},
  getMaturityColor: () => {},
  getStatusColor: () => {},
});

// Available themes
const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system'
};

// Local storage key for theme preference
const THEME_STORAGE_KEY = 'cyberTrustDashboard.theme';

/**
 * Theme Provider Component
 * 
 * Manages theme state and provides theme-related utilities to all children
 */
export const ThemeProvider = ({ children }) => {
  // Initialize theme from localStorage or default to system preference
  const [theme, setThemeState] = useState(() => {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    return savedTheme || THEMES.SYSTEM;
  });
  
  // Track if the current effective theme is dark
  const [isDark, setIsDark] = useState(false);
  
  // Detect system preference for dark mode
  const prefersDark = useCallback(() => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }, []);
  
  // Set the theme in localStorage and state
  const setTheme = useCallback((newTheme) => {
    if (Object.values(THEMES).includes(newTheme)) {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
      setThemeState(newTheme);
    }
  }, []);
  
  // Toggle between light and dark themes
  const toggleTheme = useCallback(() => {
    if (theme === THEMES.DARK) {
      setTheme(THEMES.LIGHT);
    } else if (theme === THEMES.LIGHT) {
      setTheme(THEMES.DARK);
    } else {
      // If system preference, toggle to the opposite of current system preference
      setTheme(prefersDark() ? THEMES.LIGHT : THEMES.DARK);
    }
  }, [theme, setTheme, prefersDark]);
  
  // Apply the theme to the document
  useEffect(() => {
    const applyTheme = () => {
      // Determine if dark mode should be active
      const shouldBeDark = 
        theme === THEMES.DARK || 
        (theme === THEMES.SYSTEM && prefersDark());
      
      // Update isDark state
      setIsDark(shouldBeDark);
      
      // Apply or remove dark class on document element
      if (shouldBeDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };
    
    // Apply theme immediately
    applyTheme();
    
    // Set up listener for system preference changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === THEMES.SYSTEM) {
        applyTheme();
      }
    };
    
    // Add event listener with compatibility for older browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange);
    }
    
    // Clean up listener
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        // Fallback for older browsers
        mediaQuery.removeListener(handleChange);
      }
    };
  }, [theme, prefersDark]);
  
  // Theme-specific CSS classes for common components
  const themeClasses = {
    // Main containers
    mainContainer: `bg-background-light dark:bg-background-dark min-h-screen`,
    sidebar: `bg-background-sidebar dark:bg-background-sidebar text-white`,
    header: `bg-white dark:bg-secondary-800 border-b border-secondary-200 dark:border-secondary-700`,
    
    // Cards and panels
    card: `bg-white dark:bg-secondary-800 shadow-card rounded-lg`,
    panel: `bg-secondary-50 dark:bg-secondary-900 rounded-lg p-4`,
    
    // Trust score specific
    trustScoreCard: `bg-white dark:bg-secondary-800 shadow-md rounded-lg p-4 border-l-4 border-primary-600`,
    governancePillar: `bg-white dark:bg-secondary-800 shadow-md rounded-lg p-4 border-l-4 border-governance`,
    riskPillar: `bg-white dark:bg-secondary-800 shadow-md rounded-lg p-4 border-l-4 border-risk`,
    compliancePillar: `bg-white dark:bg-secondary-800 shadow-md rounded-lg p-4 border-l-4 border-compliance`,
    
    // Tables
    table: `min-w-full divide-y divide-secondary-200 dark:divide-secondary-700`,
    tableHeader: `bg-secondary-50 dark:bg-secondary-900`,
    tableHeaderCell: `px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider`,
    tableRow: `bg-white dark:bg-secondary-800 border-b border-secondary-100 dark:border-secondary-700`,
    tableRowAlt: `bg-secondary-50 dark:bg-secondary-900 border-b border-secondary-100 dark:border-secondary-700`,
    tableCell: `px-6 py-4 whitespace-nowrap text-sm text-secondary-900 dark:text-secondary-100`,
    
    // Forms
    formSection: `bg-white dark:bg-secondary-800 shadow-sm rounded-lg p-6`,
    formLabel: `block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1`,
    
    // Modals
    modalOverlay: `fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50`,
    modalContent: `bg-white dark:bg-secondary-800 rounded-lg shadow-lg max-w-lg w-full max-h-[90vh] overflow-auto`,
    modalHeader: `px-6 py-4 border-b border-secondary-200 dark:border-secondary-700`,
    modalBody: `px-6 py-4`,
    modalFooter: `px-6 py-4 border-t border-secondary-200 dark:border-secondary-700 flex justify-end space-x-2`,
  };
  
  // Utility function to get trust pillar colors
  const getTrustPillarColor = (pillar, opacity = 100) => {
    const opacityValue = opacity / 100;
    
    switch (pillar) {
      case 'governance':
        return isDark 
          ? `rgba(139, 92, 246, ${opacityValue})` // governance-light in dark mode
          : `rgba(109, 40, 217, ${opacityValue})`; // governance
      case 'risk':
        return isDark 
          ? `rgba(248, 113, 113, ${opacityValue})` // risk-light in dark mode
          : `rgba(239, 68, 68, ${opacityValue})`; // risk
      case 'compliance':
        return isDark 
          ? `rgba(52, 211, 153, ${opacityValue})` // compliance-light in dark mode
          : `rgba(16, 185, 129, ${opacityValue})`; // compliance
      default:
        return isDark 
          ? `rgba(59, 130, 246, ${opacityValue})` // primary-light fallback
          : `rgba(0, 115, 230, ${opacityValue})`; // primary fallback
    }
  };
  
  // Utility function to get maturity level colors
  const getMaturityColor = (level, opacity = 100) => {
    const opacityValue = opacity / 100;
    
    switch (level) {
      case 1:
        return `rgba(239, 68, 68, ${opacityValue})`; // maturity-1 (Initial)
      case 2:
        return `rgba(245, 158, 11, ${opacityValue})`; // maturity-2 (Developing)
      case 3:
        return `rgba(250, 204, 21, ${opacityValue})`; // maturity-3 (Defined)
      case 4:
        return `rgba(132, 204, 22, ${opacityValue})`; // maturity-4 (Managed)
      case 5:
        return `rgba(16, 185, 129, ${opacityValue})`; // maturity-5 (Optimized)
      default:
        return `rgba(148, 163, 184, ${opacityValue})`; // gray fallback
    }
  };
  
  // Utility function to get status colors
  const getStatusColor = (status, opacity = 100) => {
    const opacityValue = opacity / 100;
    
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'complete':
      case 'success':
        return `rgba(16, 185, 129, ${opacityValue})`; // success
      case 'in progress':
      case 'pending':
      case 'warning':
        return `rgba(245, 158, 11, ${opacityValue})`; // warning
      case 'failed':
      case 'error':
      case 'critical':
        return `rgba(239, 68, 68, ${opacityValue})`; // error
      case 'info':
      case 'information':
        return `rgba(59, 130, 246, ${opacityValue})`; // info
      case 'not started':
      case 'backlog':
        return `rgba(168, 85, 247, ${opacityValue})`; // pending
      default:
        return `rgba(148, 163, 184, ${opacityValue})`; // gray fallback
    }
  };
  
  // Context value
  const contextValue = {
    theme,
    isDark,
    toggleTheme,
    setTheme,
    themeClasses,
    getTrustPillarColor,
    getMaturityColor,
    getStatusColor,
    themes: THEMES
  };
  
  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

ThemeProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

/**
 * Hook to use the theme context
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
};

export default ThemeContext;
