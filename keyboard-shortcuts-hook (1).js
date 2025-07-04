// src/hooks/useKeyboardShortcuts.js
import { useEffect, useState, useCallback } from 'react';
import { dashboardActions } from '../store/dashboardActions';
import { VIEW_MODES, FEATURE_FLAGS } from '../constants';

/**
 * Enhanced Keyboard Shortcuts Hook
 * 
 * Provides comprehensive keyboard navigation and shortcuts for the dashboard.
 * Integrates with the refactored dashboard architecture and state management.
 * 
 * Features:
 * - View navigation shortcuts (Cmd/Ctrl + numbers)
 * - Modal and action shortcuts (Alt + key combinations)
 * - Search and filter shortcuts
 * - Contextual shortcuts based on current view
 * - Help system for discovering shortcuts
 * - Accessibility support
 * - Customizable key bindings
 */

// =============================================================================
// SHORTCUT CONFIGURATION
// =============================================================================

// Primary navigation shortcuts (Cmd/Ctrl + Number)
const PRIMARY_SHORTCUTS = {
  '1': VIEW_MODES.OVERVIEW,
  '2': VIEW_MODES.COMPANY_PROFILE,
  '3': VIEW_MODES.CAPABILITIES,
  '4': VIEW_MODES.REQUIREMENTS,
  '5': VIEW_MODES.THREAT_INTELLIGENCE,
  '6': VIEW_MODES.MITRE_NAVIGATOR,
  '7': VIEW_MODES.RISK_MANAGEMENT,
  '8': VIEW_MODES.PCD_BREAKDOWN,
  '9': VIEW_MODES.MATURITY_ANALYSIS,
  '0': VIEW_MODES.ANALYTICS
};

// Extended shortcuts (Alt + Key)
const EXTENDED_SHORTCUTS = {
  'j': VIEW_MODES.BUSINESS_VALUE,
  'd': VIEW_MODES.DIAGNOSTICS,
  's': VIEW_MODES.SETTINGS,
  'u': 'upload-modal',
  'e': 'export-data',
  't': 'threat-settings-modal',
  'p': 'company-profile-modal',
  'n': 'new-capability-modal',
  'r': 'refresh-data',
  'h': 'show-help'
};

// Global shortcuts (no modifier)
const GLOBAL_SHORTCUTS = {
  'Escape': 'close-modal',
  '/': 'focus-search',
  '?': 'show-help'
};

// Special combination shortcuts
const COMBINATION_SHORTCUTS = {
  'ctrl+k': 'focus-search',
  'cmd+k': 'focus-search',
  'ctrl+f': 'toggle-filters',
  'cmd+f': 'toggle-filters',
  'ctrl+b': 'toggle-sidebar',
  'cmd+b': 'toggle-sidebar',
  'ctrl+shift+d': 'debug-mode',
  'cmd+shift+d': 'debug-mode'
};

// View-specific shortcuts
const VIEW_SPECIFIC_SHORTCUTS = {
  [VIEW_MODES.REQUIREMENTS]: {
    'n': 'new-requirement',
    'f': 'toggle-filters',
    'c': 'clear-filters',
    's': 'toggle-search'
  },
  [VIEW_MODES.CAPABILITIES]: {
    'n': 'new-capability',
    'g': 'grid-view',
    'l': 'list-view'
  },
  [VIEW_MODES.ANALYTICS]: {
    'f': 'fullscreen-chart',
    'r': 'refresh-data',
    'e': 'export-chart'
  }
};

// =============================================================================
// MAIN HOOK
// =============================================================================

export const useKeyboardShortcuts = (state, dispatch, handlers = {}) => {
  const [isHelpVisible, setIsHelpVisible] = useState(false);
  const [lastShortcut, setLastShortcut] = useState(null);
  const [shortcutHistory, setShortcutHistory] = useState([]);

  // =============================================================================
  // SHORTCUT DETECTION AND PARSING
  // =============================================================================

  // Parse keyboard event into shortcut string
  const parseShortcut = useCallback((event) => {
    const parts = [];
    
    if (event.ctrlKey) parts.push('ctrl');
    if (event.metaKey) parts.push('cmd');
    if (event.altKey) parts.push('alt');
    if (event.shiftKey) parts.push('shift');
    
    // Normalize key
    let key = event.key.toLowerCase();
    if (key === ' ') key = 'space';
    if (key === 'arrowup') key = 'up';
    if (key === 'arrowdown') key = 'down';
    if (key === 'arrowleft') key = 'left';
    if (key === 'arrowright') key = 'right';
    
    parts.push(key);
    
    return parts.join('+');
  }, []);

  // Check if element should ignore shortcuts
  const shouldIgnoreShortcut = useCallback((target) => {
    const ignoredTags = ['INPUT', 'TEXTAREA', 'SELECT'];
    const ignoredRoles = ['textbox', 'combobox', 'searchbox'];
    const ignoredContentEditable = target.contentEditable === 'true';
    
    return (
      ignoredTags.includes(target.tagName) ||
      ignoredRoles.includes(target.getAttribute('role')) ||
      ignoredContentEditable ||
      target.closest('[data-keyboard-ignore]')
    );
  }, []);

  // =============================================================================
  // SHORTCUT EXECUTION
  // =============================================================================

  // Execute shortcut action
  const executeShortcut = useCallback((action, event, context = {}) => {
    // Update shortcut history for help/debugging
    setLastShortcut({ action, timestamp: Date.now(), context });
    setShortcutHistory(prev => [...prev.slice(-9), { action, timestamp: Date.now() }]);

    // Handle different action types
    switch (action) {
      // View navigation
      case VIEW_MODES.OVERVIEW:
      case VIEW_MODES.COMPANY_PROFILE:
      case VIEW_MODES.CAPABILITIES:
      case VIEW_MODES.REQUIREMENTS:
      case VIEW_MODES.THREAT_INTELLIGENCE:
      case VIEW_MODES.MITRE_NAVIGATOR:
      case VIEW_MODES.RISK_MANAGEMENT:
      case VIEW_MODES.PCD_BREAKDOWN:
      case VIEW_MODES.MATURITY_ANALYSIS:
      case VIEW_MODES.BUSINESS_VALUE:
      case VIEW_MODES.ANALYTICS:
      case VIEW_MODES.DIAGNOSTICS:
      case VIEW_MODES.SETTINGS:
        dispatch(dashboardActions.setViewMode(action));
        
        // Auto-collapse sidebar on mobile after navigation
        if (state?.ui?.isMobile && state?.ui?.sidebarExpanded) {
          dispatch(dashboardActions.toggleSidebar());
        }
        break;

      // Modal actions
      case 'upload-modal':
        dispatch(dashboardActions.toggleUploadModal());
        break;
      case 'threat-settings-modal':
        dispatch(dashboardActions.toggleThreatSettingsModal());
        break;
      case 'company-profile-modal':
        dispatch(dashboardActions.toggleCompanyProfileModal());
        break;
      case 'new-capability-modal':
        dispatch(dashboardActions.toggleNewCapabilityModal());
        break;
      case 'close-modal':
        dispatch(dashboardActions.closeModal());
        break;

      // Data actions
      case 'export-data':
        if (handlers.handleExportCSV) {
          handlers.handleExportCSV();
        }
        break;
      case 'refresh-data':
        if (handlers.handleRefreshData) {
          handlers.handleRefreshData();
        }
        break;

      // UI actions
      case 'toggle-sidebar':
        dispatch(dashboardActions.toggleSidebar());
        break;
      case 'toggle-filters':
        dispatch(dashboardActions.toggleFilters());
        break;
      case 'focus-search':
        focusSearchInput();
        break;
      case 'show-help':
        setIsHelpVisible(true);
        break;

      // View-specific actions
      case 'new-requirement':
        if (handlers.handleCreateRequirement) {
          handlers.handleCreateRequirement();
        }
        break;
      case 'new-capability':
        dispatch(dashboardActions.toggleNewCapabilityModal());
        break;
      case 'clear-filters':
        dispatch(dashboardActions.clearFilters());
        break;
      case 'toggle-search':
        focusSearchInput();
        break;

      // Debug actions (development only)
      case 'debug-mode':
        if (process.env.NODE_ENV === 'development') {
          console.log('Dashboard State:', state);
          console.log('Shortcut History:', shortcutHistory);
        }
        break;

      default:
        console.warn(`Unknown shortcut action: ${action}`);
    }
  }, [state, dispatch, handlers, shortcutHistory]);

  // =============================================================================
  // MAIN KEYBOARD EVENT HANDLER
  // =============================================================================

  const handleKeyDown = useCallback((event) => {
    // Skip if typing in input fields
    if (shouldIgnoreShortcut(event.target)) {
      return;
    }

    const shortcut = parseShortcut(event);
    let action = null;
    let shouldPreventDefault = false;

    // Check global shortcuts first
    if (GLOBAL_SHORTCUTS[event.key]) {
      action = GLOBAL_SHORTCUTS[event.key];
      shouldPreventDefault = true;
    }
    // Check combination shortcuts
    else if (COMBINATION_SHORTCUTS[shortcut]) {
      action = COMBINATION_SHORTCUTS[shortcut];
      shouldPreventDefault = true;
    }
    // Check primary navigation (Cmd/Ctrl + number)
    else if ((event.metaKey || event.ctrlKey) && PRIMARY_SHORTCUTS[event.key]) {
      action = PRIMARY_SHORTCUTS[event.key];
      shouldPreventDefault = true;
    }
    // Check extended shortcuts (Alt + key)
    else if (event.altKey && !event.ctrlKey && !event.metaKey && EXTENDED_SHORTCUTS[event.key]) {
      action = EXTENDED_SHORTCUTS[event.key];
      shouldPreventDefault = true;
    }
    // Check view-specific shortcuts
    else if (state?.ui?.viewMode && VIEW_SPECIFIC_SHORTCUTS[state.ui.viewMode]?.[event.key]) {
      action = VIEW_SPECIFIC_SHORTCUTS[state.ui.viewMode][event.key];
      shouldPreventDefault = true;
    }

    // Execute action if found
    if (action) {
      if (shouldPreventDefault) {
        event.preventDefault();
        event.stopPropagation();
      }
      
      executeShortcut(action, event, {
        currentView: state?.ui?.viewMode,
        shortcut,
        modifiers: {
          ctrl: event.ctrlKey,
          meta: event.metaKey,
          alt: event.altKey,
          shift: event.shiftKey
        }
      });
    }
  }, [state, parseShortcut, shouldIgnoreShortcut, executeShortcut]);

  // =============================================================================
  // UTILITY FUNCTIONS
  // =============================================================================

  // Focus search input
  const focusSearchInput = useCallback(() => {
    const searchInput = document.querySelector(
      'input[placeholder*="Search"], input[type="search"], input[data-search]'
    );
    if (searchInput) {
      searchInput.focus();
      searchInput.select();
    }
  }, []);

  // Get formatted shortcut for display
  const formatShortcut = useCallback((shortcut) => {
    return shortcut
      .replace('cmd', '⌘')
      .replace('ctrl', 'Ctrl')
      .replace('alt', 'Alt')
      .replace('shift', 'Shift')
      .replace('+', ' + ')
      .split(' + ')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' + ');
  }, []);

  // Generate help documentation
  const getShortcutHelp = useCallback(() => {
    const currentView = state?.ui?.viewMode;
    
    return {
      navigation: {
        title: 'Navigation (⌘/Ctrl + Number)',
        shortcuts: Object.entries(PRIMARY_SHORTCUTS).map(([key, view]) => ({
          key: `⌘${key}`,
          action: view.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
          description: `Navigate to ${view.replace('-', ' ')}`
        }))
      },
      actions: {
        title: 'Actions (Alt + Key)',
        shortcuts: Object.entries(EXTENDED_SHORTCUTS).map(([key, action]) => ({
          key: `Alt+${key.toUpperCase()}`,
          action: action.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
          description: getActionDescription(action)
        }))
      },
      global: {
        title: 'Global Shortcuts',
        shortcuts: [
          { key: '⌘K', action: 'Focus Search', description: 'Jump to search input' },
          { key: '⌘F', action: 'Toggle Filters', description: 'Show/hide filter panel' },
          { key: '⌘B', action: 'Toggle Sidebar', description: 'Collapse/expand sidebar' },
          { key: 'Escape', action: 'Close Modal', description: 'Close any open modal' },
          { key: '?', action: 'Show Help', description: 'Display this help' }
        ]
      },
      ...(currentView && VIEW_SPECIFIC_SHORTCUTS[currentView] && {
        viewSpecific: {
          title: `${currentView.replace('-', ' ')} View Shortcuts`,
          shortcuts: Object.entries(VIEW_SPECIFIC_SHORTCUTS[currentView]).map(([key, action]) => ({
            key: key.toUpperCase(),
            action: action.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
            description: getActionDescription(action)
          }))
        }
      })
    };
  }, [state]);

  // Get description for action
  const getActionDescription = useCallback((action) => {
    const descriptions = {
      'upload-modal': 'Open CSV upload dialog',
      'export-data': 'Export data to CSV',
      'threat-settings-modal': 'Configure threat intelligence',
      'company-profile-modal': 'Edit company profile',
      'new-capability-modal': 'Create new capability',
      'new-requirement': 'Create new requirement',
      'clear-filters': 'Clear all active filters',
      'refresh-data': 'Refresh all data',
      'toggle-search': 'Focus search input',
      'show-help': 'Display keyboard shortcuts'
    };
    return descriptions[action] || `Execute ${action.replace('-', ' ')}`;
  }, []);

  // =============================================================================
  // EFFECT SETUP
  // =============================================================================

  useEffect(() => {
    // Only enable shortcuts if feature flag is enabled
    if (!FEATURE_FLAGS.ENABLE_KEYBOARD_SHORTCUTS) {
      return;
    }

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // =============================================================================
  // RETURN INTERFACE
  // =============================================================================

  return {
    // Help system
    isHelpVisible,
    setIsHelpVisible,
    getShortcutHelp,
    formatShortcut,
    
    // Shortcut information
    shortcuts: {
      primary: PRIMARY_SHORTCUTS,
      extended: EXTENDED_SHORTCUTS,
      global: GLOBAL_SHORTCUTS,
      combinations: COMBINATION_SHORTCUTS,
      viewSpecific: VIEW_SPECIFIC_SHORTCUTS
    },
    
    // State information
    lastShortcut,
    shortcutHistory: shortcutHistory.slice(-10), // Keep last 10
    
    // Utility functions
    executeShortcut,
    focusSearchInput,
    
    // Configuration
    isEnabled: FEATURE_FLAGS.ENABLE_KEYBOARD_SHORTCUTS
  };
};

// =============================================================================
// HELP COMPONENT HOOK
// =============================================================================

/**
 * Hook for managing keyboard shortcuts help modal
 */
export const useShortcutHelp = () => {
  const [isVisible, setIsVisible] = useState(false);
  
  const show = useCallback(() => setIsVisible(true), []);
  const hide = useCallback(() => setIsVisible(false), []);
  const toggle = useCallback(() => setIsVisible(prev => !prev), []);
  
  // Close on escape
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && isVisible) {
        hide();
      }
    };
    
    if (isVisible) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isVisible, hide]);
  
  return {
    isVisible,
    show,
    hide,
    toggle
  };
};

// =============================================================================
// CONSTANTS FOR EXTERNAL USE
// =============================================================================

export const KEYBOARD_SHORTCUTS = {
  PRIMARY_SHORTCUTS,
  EXTENDED_SHORTCUTS,
  GLOBAL_SHORTCUTS,
  COMBINATION_SHORTCUTS,
  VIEW_SPECIFIC_SHORTCUTS
};

export default useKeyboardShortcuts;