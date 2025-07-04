// src/utils/themeUtils.js
import { THEMES, THEME_CONFIG, STORAGE_KEYS } from '../constants';

/**
 * Theme Utilities
 * 
 * Comprehensive theming system for the cyber trust portal dashboard.
 * Provides theme detection, switching, dynamic styling, and responsive theme behavior.
 * 
 * Features:
 * - Multiple theme support (default, stripe, dark)
 * - Dynamic class generation based on current theme
 * - Persistent theme preferences
 * - System preference detection
 * - Component-specific theme configurations
 * - Accessibility-aware theme switching
 * - Performance-optimized theme operations
 */

// =============================================================================
// THEME DETECTION AND MANAGEMENT
// =============================================================================

/**
 * Get the current active theme
 * @returns {String} Current theme name
 */
export const getCurrentTheme = () => {
  try {
    // Check localStorage first
    const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME_PREFERENCE);
    if (savedTheme && Object.values(THEMES).includes(savedTheme)) {
      return savedTheme;
    }

    // Check system preference for dark mode
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return THEMES.DARK;
    }

    // Default fallback
    return THEMES.DEFAULT;
  } catch (error) {
    console.warn('Failed to get current theme:', error);
    return THEMES.DEFAULT;
  }
};

/**
 * Set the active theme
 * @param {String} theme - Theme name to set
 * @returns {Boolean} Success status
 */
export const setTheme = (theme) => {
  try {
    if (!Object.values(THEMES).includes(theme)) {
      console.warn(`Invalid theme: ${theme}`);
      return false;
    }

    // Save to localStorage
    localStorage.setItem(STORAGE_KEYS.THEME_PREFERENCE, theme);

    // Apply theme classes to document
    applyThemeToDocument(theme);

    // Dispatch custom event for theme change
    window.dispatchEvent(new CustomEvent('themeChange', { 
      detail: { theme, timestamp: Date.now() } 
    }));

    return true;
  } catch (error) {
    console.error('Failed to set theme:', error);
    return false;
  }
};

/**
 * Apply theme classes to document
 * @param {String} theme - Theme to apply
 */
export const applyThemeToDocument = (theme) => {
  try {
    const html = document.documentElement;
    const body = document.body;

    // Remove existing theme classes
    Object.values(THEMES).forEach(t => {
      html.classList.remove(`theme-${t}`);
      body.classList.remove(`theme-${t}`);
    });

    // Add new theme classes
    html.classList.add(`theme-${theme}`);
    body.classList.add(`theme-${theme}`);

    // Set CSS custom properties for theme
    setCSSCustomProperties(theme);
  } catch (error) {
    console.error('Failed to apply theme to document:', error);
  }
};

/**
 * Set CSS custom properties based on theme
 * @param {String} theme - Theme to apply
 */
export const setCSSCustomProperties = (theme) => {
  const root = document.documentElement;
  
  const themeProperties = getThemeProperties(theme);
  
  Object.entries(themeProperties).forEach(([property, value]) => {
    root.style.setProperty(property, value);
  });
};

/**
 * Get CSS custom properties for a theme
 * @param {String} theme - Theme name
 * @returns {Object} CSS custom properties
 */
export const getThemeProperties = (theme) => {
  const properties = {
    [THEMES.DEFAULT]: {
      '--color-primary': '#3b82f6',
      '--color-secondary': '#10b981',
      '--color-accent': '#8b5cf6',
      '--color-background': '#ffffff',
      '--color-surface': '#f9fafb',
      '--color-text-primary': '#111827',
      '--color-text-secondary': '#6b7280',
      '--color-border': '#e5e7eb',
      '--color-success': '#10b981',
      '--color-warning': '#f59e0b',
      '--color-error': '#ef4444',
      '--color-info': '#3b82f6',
      '--shadow-sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      '--shadow-md': '0 4px 6px -1px rgb(0 0 0 / 0.1)',
      '--shadow-lg': '0 10px 15px -3px rgb(0 0 0 / 0.1)',
      '--border-radius': '0.5rem',
      '--font-family': '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    },
    [THEMES.STRIPE]: {
      '--color-primary': '#635bff',
      '--color-secondary': '#00d924',
      '--color-accent': '#ff5722',
      '--color-background': '#ffffff',
      '--color-surface': '#f8fafc',
      '--color-text-primary': '#0a0e27',
      '--color-text-secondary': '#425466',
      '--color-border': '#e3e8ee',
      '--color-success': '#00d924',
      '--color-warning': '#ff9500',
      '--color-error': '#df1b41',
      '--color-info': '#635bff',
      '--shadow-sm': '0 1px 3px rgb(50 50 93 / 0.15)',
      '--shadow-md': '0 4px 6px rgb(50 50 93 / 0.11)',
      '--shadow-lg': '0 13px 27px rgb(50 50 93 / 0.25)',
      '--border-radius': '0.375rem',
      '--font-family': '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      '--gradient-primary': 'linear-gradient(135deg, #635bff 0%, #7c3aed 100%)',
      '--gradient-secondary': 'linear-gradient(135deg, #00d924 0%, #10b981 100%)'
    },
    [THEMES.DARK]: {
      '--color-primary': '#60a5fa',
      '--color-secondary': '#34d399',
      '--color-accent': '#a78bfa',
      '--color-background': '#111827',
      '--color-surface': '#1f2937',
      '--color-text-primary': '#f9fafb',
      '--color-text-secondary': '#d1d5db',
      '--color-border': '#374151',
      '--color-success': '#34d399',
      '--color-warning': '#fbbf24',
      '--color-error': '#f87171',
      '--color-info': '#60a5fa',
      '--shadow-sm': '0 1px 2px 0 rgb(0 0 0 / 0.25)',
      '--shadow-md': '0 4px 6px -1px rgb(0 0 0 / 0.35)',
      '--shadow-lg': '0 10px 15px -3px rgb(0 0 0 / 0.45)',
      '--border-radius': '0.5rem',
      '--font-family': '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }
  };

  return properties[theme] || properties[THEMES.DEFAULT];
};

// =============================================================================
// DYNAMIC CLASS GENERATION
// =============================================================================

/**
 * Get theme-aware classes for different component types
 * @param {String} theme - Current theme
 * @param {String} component - Component type
 * @param {Object} options - Additional options
 * @returns {Object} Theme classes
 */
export const getThemeClasses = (theme, component, options = {}) => {
  const generators = {
    sidebar: getSidebarClasses,
    header: getHeaderClasses,
    modal: getModalClasses,
    card: getCardClasses,
    button: getButtonClasses,
    input: getInputClasses,
    chart: getChartClasses,
    table: getTableClasses
  };

  const generator = generators[component];
  if (!generator) {
    console.warn(`No theme class generator for component: ${component}`);
    return {};
  }

  return generator(theme, options);
};

/**
 * Get sidebar theme classes
 * @param {String} theme - Current theme
 * @param {Object} options - Sidebar options
 * @returns {Object} Sidebar classes
 */
export const getSidebarClasses = (theme, options = {}) => {
  const { variant = 'default' } = options;

  const classes = {
    [THEMES.DEFAULT]: {
      container: 'bg-gray-900 text-white',
      border: 'border-gray-700',
      text: {
        primary: 'text-white',
        secondary: 'text-gray-300',
        muted: 'text-gray-400'
      },
      button: {
        base: 'text-gray-300 hover:bg-blue-600 hover:text-white focus:ring-blue-500',
        active: 'bg-blue-600 text-white shadow-lg',
        danger: 'text-red-400 hover:bg-red-900 hover:bg-opacity-20'
      },
      activeIndicator: 'bg-blue-400'
    },
    [THEMES.STRIPE]: {
      container: 'sidebar-gradient text-white',
      border: 'border-white border-opacity-20',
      text: {
        primary: 'text-white',
        secondary: 'text-white text-opacity-70',
        muted: 'text-white text-opacity-80'
      },
      button: {
        base: 'text-white text-opacity-80 hover:bg-white hover:bg-opacity-20 hover:text-white focus:ring-white focus:ring-opacity-50',
        active: 'bg-white bg-opacity-30 text-white shadow-lg backdrop-blur-sm',
        danger: 'text-red-400 hover:bg-red-900 hover:bg-opacity-20'
      },
      activeIndicator: 'bg-white bg-opacity-60'
    },
    [THEMES.DARK]: {
      container: 'bg-gray-800 text-gray-100',
      border: 'border-gray-600',
      text: {
        primary: 'text-gray-100',
        secondary: 'text-gray-300',
        muted: 'text-gray-400'
      },
      button: {
        base: 'text-gray-300 hover:bg-gray-700 hover:text-gray-100 focus:ring-gray-500',
        active: 'bg-gray-700 text-gray-100 shadow-lg',
        danger: 'text-red-400 hover:bg-red-900 hover:bg-opacity-20'
      },
      activeIndicator: 'bg-blue-400'
    }
  };

  return classes[theme] || classes[THEMES.DEFAULT];
};

/**
 * Get header theme classes
 * @param {String} theme - Current theme
 * @param {Object} options - Header options
 * @returns {Object} Header classes
 */
export const getHeaderClasses = (theme, options = {}) => {
  const classes = {
    [THEMES.DEFAULT]: {
      container: 'bg-white border-gray-200 shadow-sm',
      text: {
        primary: 'text-gray-900',
        secondary: 'text-gray-600',
        muted: 'text-gray-500'
      },
      button: {
        base: 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50',
        primary: 'bg-blue-600 hover:bg-blue-700 text-white',
        secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700'
      }
    },
    [THEMES.STRIPE]: {
      container: 'header-area border-white border-opacity-10 shadow-sm',
      text: {
        primary: 'text-white',
        secondary: 'text-white text-opacity-80',
        muted: 'text-white text-opacity-60'
      },
      button: {
        base: 'border-white border-opacity-30 text-white bg-white bg-opacity-10 hover:bg-opacity-20 backdrop-blur-sm',
        primary: 'bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm text-white',
        secondary: 'bg-white bg-opacity-10 hover:bg-opacity-20 backdrop-blur-sm text-white'
      }
    },
    [THEMES.DARK]: {
      container: 'bg-gray-800 border-gray-700 shadow-sm',
      text: {
        primary: 'text-gray-100',
        secondary: 'text-gray-300',
        muted: 'text-gray-400'
      },
      button: {
        base: 'border-gray-600 text-gray-300 bg-gray-800 hover:bg-gray-700',
        primary: 'bg-blue-600 hover:bg-blue-700 text-white',
        secondary: 'bg-gray-700 hover:bg-gray-600 text-gray-200'
      }
    }
  };

  return classes[theme] || classes[THEMES.DEFAULT];
};

/**
 * Get modal theme classes
 * @param {String} theme - Current theme
 * @param {Object} options - Modal options
 * @returns {Object} Modal classes
 */
export const getModalClasses = (theme, options = {}) => {
  const classes = {
    [THEMES.DEFAULT]: {
      backdrop: 'bg-black bg-opacity-50',
      container: 'bg-white rounded-lg shadow-xl',
      header: 'border-b border-gray-200',
      content: 'bg-white',
      footer: 'border-t border-gray-200 bg-gray-50'
    },
    [THEMES.STRIPE]: {
      backdrop: 'bg-black bg-opacity-60',
      container: 'bg-white rounded-lg shadow-2xl border border-gray-200',
      header: 'border-b border-gray-100',
      content: 'bg-white',
      footer: 'border-t border-gray-100 bg-gray-50'
    },
    [THEMES.DARK]: {
      backdrop: 'bg-black bg-opacity-70',
      container: 'bg-gray-800 rounded-lg shadow-2xl border border-gray-700',
      header: 'border-b border-gray-700',
      content: 'bg-gray-800',
      footer: 'border-t border-gray-700 bg-gray-900'
    }
  };

  return classes[theme] || classes[THEMES.DEFAULT];
};

/**
 * Get card theme classes
 * @param {String} theme - Current theme
 * @param {Object} options - Card options
 * @returns {Object} Card classes
 */
export const getCardClasses = (theme, options = {}) => {
  const { variant = 'default' } = options;

  const classes = {
    [THEMES.DEFAULT]: {
      container: 'bg-white border border-gray-200 rounded-lg shadow-sm',
      header: 'border-b border-gray-200 bg-gray-50',
      content: 'bg-white',
      footer: 'border-t border-gray-200 bg-gray-50'
    },
    [THEMES.STRIPE]: {
      container: 'bg-white border border-gray-100 rounded-lg shadow-md',
      header: 'border-b border-gray-100 bg-gray-50',
      content: 'bg-white',
      footer: 'border-t border-gray-100 bg-gray-50'
    },
    [THEMES.DARK]: {
      container: 'bg-gray-800 border border-gray-700 rounded-lg shadow-lg',
      header: 'border-b border-gray-700 bg-gray-900',
      content: 'bg-gray-800',
      footer: 'border-t border-gray-700 bg-gray-900'
    }
  };

  return classes[theme] || classes[THEMES.DEFAULT];
};

/**
 * Get button theme classes
 * @param {String} theme - Current theme
 * @param {Object} options - Button options
 * @returns {Object} Button classes
 */
export const getButtonClasses = (theme, options = {}) => {
  const { variant = 'primary', size = 'md' } = options;

  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const variantClasses = {
    [THEMES.DEFAULT]: {
      primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500',
      secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900 focus:ring-gray-500',
      outline: 'border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 focus:ring-blue-500',
      ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 focus:ring-gray-500',
      danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500'
    },
    [THEMES.STRIPE]: {
      primary: 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white focus:ring-blue-500',
      secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-900 focus:ring-gray-500',
      outline: 'border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 focus:ring-blue-500',
      ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 focus:ring-gray-500',
      danger: 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-500'
    },
    [THEMES.DARK]: {
      primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500',
      secondary: 'bg-gray-700 hover:bg-gray-600 text-gray-200 focus:ring-gray-500',
      outline: 'border border-gray-600 bg-gray-800 hover:bg-gray-700 text-gray-200 focus:ring-blue-500',
      ghost: 'bg-transparent hover:bg-gray-800 text-gray-300 focus:ring-gray-500',
      danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500'
    }
  };

  const themeClasses = variantClasses[theme] || variantClasses[THEMES.DEFAULT];
  
  return `${baseClasses} ${sizeClasses[size]} ${themeClasses[variant]}`;
};

/**
 * Get input theme classes
 * @param {String} theme - Current theme
 * @param {Object} options - Input options
 * @returns {String} Input classes
 */
export const getInputClasses = (theme, options = {}) => {
  const { variant = 'default', size = 'md' } = options;

  const baseClasses = 'block w-full rounded-md border transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0';
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base'
  };

  const themeClasses = {
    [THEMES.DEFAULT]: 'border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500',
    [THEMES.STRIPE]: 'border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500',
    [THEMES.DARK]: 'border-gray-600 bg-gray-800 text-gray-100 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500'
  };

  return `${baseClasses} ${sizeClasses[size]} ${themeClasses[theme] || themeClasses[THEMES.DEFAULT]}`;
};

/**
 * Get chart theme configuration
 * @param {String} theme - Current theme
 * @returns {Object} Chart theme configuration
 */
export const getChartClasses = (theme) => {
  const configs = {
    [THEMES.DEFAULT]: {
      backgroundColor: '#ffffff',
      gridColor: '#f3f4f6',
      textColor: '#374151',
      colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']
    },
    [THEMES.STRIPE]: {
      backgroundColor: '#ffffff',
      gridColor: '#f8fafc',
      textColor: '#0a0e27',
      colors: ['#635bff', '#00d924', '#ff9500', '#df1b41', '#7c3aed', '#0891b2']
    },
    [THEMES.DARK]: {
      backgroundColor: '#1f2937',
      gridColor: '#374151',
      textColor: '#d1d5db',
      colors: ['#60a5fa', '#34d399', '#fbbf24', '#f87171', '#a78bfa', '#22d3ee']
    }
  };

  return configs[theme] || configs[THEMES.DEFAULT];
};

/**
 * Get table theme classes
 * @param {String} theme - Current theme
 * @returns {Object} Table classes
 */
export const getTableClasses = (theme) => {
  const classes = {
    [THEMES.DEFAULT]: {
      container: 'bg-white shadow-sm rounded-lg overflow-hidden',
      header: 'bg-gray-50 border-b border-gray-200',
      headerCell: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
      row: 'bg-white border-b border-gray-200 hover:bg-gray-50',
      cell: 'px-6 py-4 whitespace-nowrap text-sm text-gray-900'
    },
    [THEMES.STRIPE]: {
      container: 'bg-white shadow-md rounded-lg overflow-hidden border border-gray-100',
      header: 'bg-gray-50 border-b border-gray-100',
      headerCell: 'px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider',
      row: 'bg-white border-b border-gray-100 hover:bg-gray-50',
      cell: 'px-6 py-4 whitespace-nowrap text-sm text-gray-900'
    },
    [THEMES.DARK]: {
      container: 'bg-gray-800 shadow-lg rounded-lg overflow-hidden border border-gray-700',
      header: 'bg-gray-900 border-b border-gray-700',
      headerCell: 'px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider',
      row: 'bg-gray-800 border-b border-gray-700 hover:bg-gray-750',
      cell: 'px-6 py-4 whitespace-nowrap text-sm text-gray-100'
    }
  };

  return classes[theme] || classes[THEMES.DEFAULT];
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Check if dark mode is preferred by system
 * @returns {Boolean} Whether dark mode is preferred
 */
export const isSystemDarkMode = () => {
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
};

/**
 * Toggle between light and dark themes
 * @param {String} currentTheme - Current theme
 * @returns {String} New theme
 */
export const toggleDarkMode = (currentTheme) => {
  const newTheme = currentTheme === THEMES.DARK ? THEMES.DEFAULT : THEMES.DARK;
  setTheme(newTheme);
  return newTheme;
};

/**
 * Get theme metadata
 * @param {String} theme - Theme name
 * @returns {Object} Theme metadata
 */
export const getThemeMetadata = (theme) => {
  return THEME_CONFIG[theme] || THEME_CONFIG[THEMES.DEFAULT];
};

/**
 * Initialize theme system
 * @returns {String} Initial theme
 */
export const initializeTheme = () => {
  const theme = getCurrentTheme();
  applyThemeToDocument(theme);
  return theme;
};

/**
 * Listen for system theme changes
 * @param {Function} callback - Callback function for theme changes
 * @returns {Function} Cleanup function
 */
export const watchSystemTheme = (callback) => {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  
  const handleChange = (e) => {
    const newTheme = e.matches ? THEMES.DARK : THEMES.DEFAULT;
    callback(newTheme);
  };

  mediaQuery.addEventListener('change', handleChange);
  
  return () => mediaQuery.removeEventListener('change', handleChange);
};

// =============================================================================
// EXPORTS
// =============================================================================

export default {
  // Theme management
  getCurrentTheme,
  setTheme,
  applyThemeToDocument,
  initializeTheme,
  
  // Class generation
  getThemeClasses,
  getSidebarClasses,
  getHeaderClasses,
  getModalClasses,
  getCardClasses,
  getButtonClasses,
  getInputClasses,
  getChartClasses,
  getTableClasses,
  
  // Utilities
  isSystemDarkMode,
  toggleDarkMode,
  getThemeMetadata,
  watchSystemTheme,
  
  // CSS properties
  getThemeProperties,
  setCSSCustomProperties
};