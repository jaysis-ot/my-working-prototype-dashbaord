// src/components/layout/DashboardLayout.jsx
import React from 'react';
import { useTheme } from '../../hooks/useTheme';
import { useDashboardState } from '../../hooks/useDashboardState';

/**
 * Dashboard Layout Component
 * 
 * Main layout wrapper that provides the foundation for the entire dashboard.
 * Handles theme application, responsive behavior, and overall structure.
 * 
 * Features:
 * - Theme-aware styling with CSS custom properties
 * - Responsive layout adjustments
 * - Proper semantic HTML structure
 * - Accessibility considerations
 * - Performance optimized re-renders
 * - Integration with dashboard state
 */

const DashboardLayout = ({ children, className = '', ...props }) => {
  const { theme, getThemeClasses } = useTheme();
  const { state } = useDashboardState();

  // Apply theme CSS custom properties to document root
  React.useEffect(() => {
    const root = document.documentElement;
    
    // Apply theme-specific CSS custom properties
    const themeProperties = {
      '--dashboard-bg': theme === 'dark' ? '#1a1a1a' : '#f9fafb',
      '--dashboard-surface': theme === 'dark' ? '#2d2d2d' : '#ffffff',
      '--dashboard-border': theme === 'dark' ? '#404040' : '#e5e7eb',
      '--dashboard-text-primary': theme === 'dark' ? '#ffffff' : '#111827',
      '--dashboard-text-secondary': theme === 'dark' ? '#d1d5db' : '#6b7280',
      '--dashboard-accent': theme === 'dark' ? '#3b82f6' : '#2563eb',
      '--dashboard-accent-hover': theme === 'dark' ? '#60a5fa' : '#1d4ed8',
      '--dashboard-sidebar-width': state.ui?.sidebarExpanded ? '280px' : '64px',
      '--dashboard-header-height': '64px',
      '--dashboard-transition': 'all 0.2s ease-in-out'
    };

    Object.entries(themeProperties).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });

    return () => {
      // Cleanup on unmount
      Object.keys(themeProperties).forEach(property => {
        root.style.removeProperty(property);
      });
    };
  }, [theme, state.ui?.sidebarExpanded]);

  // Set body classes for global styling
  React.useEffect(() => {
    const bodyClasses = [
      `theme-${theme}`,
      state.ui?.isMobile ? 'is-mobile' : 'is-desktop',
      state.ui?.sidebarExpanded ? 'sidebar-expanded' : 'sidebar-collapsed',
      state.ui?.compactMode ? 'compact-mode' : 'normal-mode'
    ].filter(Boolean);

    // Add classes
    document.body.classList.add(...bodyClasses);

    return () => {
      // Remove classes on cleanup
      document.body.classList.remove(...bodyClasses);
    };
  }, [theme, state.ui?.isMobile, state.ui?.sidebarExpanded, state.ui?.compactMode]);

  return (
    <div
      className={`
        dashboard-layout
        min-h-screen
        flex flex-col
        transition-all duration-200 ease-in-out
        ${getThemeClasses('layout', 'container')}
        ${state.ui?.compactMode ? 'compact' : 'normal'}
        ${className}
      `}
      style={{
        backgroundColor: 'var(--dashboard-bg)',
        color: 'var(--dashboard-text-primary)'
      }}
      {...props}
    >
      {children}
    </div>
  );
};

export default DashboardLayout;