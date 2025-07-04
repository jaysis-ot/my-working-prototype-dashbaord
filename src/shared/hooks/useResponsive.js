// src/hooks/useResponsive.js
import { useState, useEffect, useCallback } from 'react';
import { UI_CONFIG } from '../constants';
import { dashboardActions } from '../store/dashboardActions';

/**
 * Responsive Behavior Hook
 * 
 * Manages responsive behavior across the dashboard application.
 * Handles screen size detection, mobile/desktop state management,
 * and responsive UI adjustments.
 * 
 * Features:
 * - Real-time screen size monitoring
 * - Breakpoint detection with configurable thresholds
 * - Mobile/desktop state management
 * - Automatic sidebar behavior on mobile
 * - Responsive grid and layout utilities
 * - Integration with dashboard state
 * - Performance optimized with debouncing
 */
export const useResponsive = (state = null, dispatch = null) => {
  // Internal state for screen dimensions
  const [screenSize, setScreenSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768
  });

  // Debounced resize handler to prevent excessive re-renders
  const [debouncedScreenSize, setDebouncedScreenSize] = useState(screenSize);

  // =============================================================================
  // BREAKPOINT DETECTION
  // =============================================================================

  // Check if current screen matches breakpoint
  const isBreakpoint = useCallback((breakpoint) => {
    const breakpoints = UI_CONFIG.BREAKPOINTS;
    switch (breakpoint.toLowerCase()) {
      case 'sm':
        return screenSize.width >= breakpoints.SM;
      case 'md':
        return screenSize.width >= breakpoints.MD;
      case 'lg':
        return screenSize.width >= breakpoints.LG;
      case 'xl':
        return screenSize.width >= breakpoints.XL;
      case 'xxl':
        return screenSize.width >= breakpoints.XXL;
      default:
        return false;
    }
  }, [screenSize.width]);

  // Specific breakpoint checks
  const isMobile = !isBreakpoint('lg'); // Below 1024px
  const isTablet = isBreakpoint('md') && !isBreakpoint('lg'); // 768px - 1023px
  const isDesktop = isBreakpoint('lg'); // 1024px and above
  const isLargeDesktop = isBreakpoint('xl'); // 1280px and above
  const isExtraLarge = isBreakpoint('xxl'); // 1536px and above

  // Get current breakpoint name
  const getCurrentBreakpoint = useCallback(() => {
    if (isExtraLarge) return 'xxl';
    if (isLargeDesktop) return 'xl';
    if (isDesktop) return 'lg';
    if (isTablet) return 'md';
    if (isBreakpoint('sm')) return 'sm';
    return 'xs';
  }, [isExtraLarge, isLargeDesktop, isDesktop, isTablet, isBreakpoint]);

  // =============================================================================
  // RESPONSIVE UTILITIES
  // =============================================================================

  // Get responsive grid columns based on screen size
  const getResponsiveColumns = useCallback((config) => {
    const { xs = 1, sm = 2, md = 3, lg = 4, xl = 6, xxl = 8 } = config;
    
    if (isExtraLarge) return xxl;
    if (isLargeDesktop) return xl;
    if (isDesktop) return lg;
    if (isTablet) return md;
    if (isBreakpoint('sm')) return sm;
    return xs;
  }, [isExtraLarge, isLargeDesktop, isDesktop, isTablet, isBreakpoint]);

  // Get responsive spacing based on screen size
  const getResponsiveSpacing = useCallback((config) => {
    const { mobile = 'p-4', tablet = 'p-6', desktop = 'p-8' } = config;
    
    if (isDesktop) return desktop;
    if (isTablet) return tablet;
    return mobile;
  }, [isDesktop, isTablet]);

  // Get responsive text size
  const getResponsiveTextSize = useCallback((config) => {
    const { mobile = 'text-sm', tablet = 'text-base', desktop = 'text-lg' } = config;
    
    if (isDesktop) return desktop;
    if (isTablet) return tablet;
    return mobile;
  }, [isDesktop, isTablet]);

  // =============================================================================
  // DASHBOARD INTEGRATION
  // =============================================================================

  // Update dashboard state when mobile status changes
  useEffect(() => {
    if (dispatch) {
      dispatch(dashboardActions.setIsMobile(isMobile));
    }
  }, [isMobile, dispatch]);

  // Auto-collapse sidebar on mobile
  useEffect(() => {
    if (state && dispatch && isMobile && state.ui?.sidebarExpanded) {
      // Auto-collapse sidebar when switching to mobile
      dispatch(dashboardActions.setSidebarExpanded(false));
    }
  }, [isMobile, state, dispatch]);

  // =============================================================================
  // RESIZE HANDLING
  // =============================================================================

  // Debounced resize handler
  useEffect(() => {
    const handleResize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    // Debounce resize events for performance
    const debounceTimeout = setTimeout(() => {
      setDebouncedScreenSize(screenSize);
    }, 150);

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(debounceTimeout);
    };
  }, [screenSize]);

  // =============================================================================
  // ORIENTATION DETECTION
  // =============================================================================

  const [orientation, setOrientation] = useState(() => {
    if (typeof window === 'undefined') return 'landscape';
    return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
  });

  useEffect(() => {
    const newOrientation = screenSize.height > screenSize.width ? 'portrait' : 'landscape';
    if (newOrientation !== orientation) {
      setOrientation(newOrientation);
    }
  }, [screenSize, orientation]);

  // =============================================================================
  // VIEWPORT UTILITIES
  // =============================================================================

  // Check if element fits in viewport
  const fitsInViewport = useCallback((elementWidth, elementHeight) => {
    return elementWidth <= screenSize.width && elementHeight <= screenSize.height;
  }, [screenSize]);

  // Get available viewport space
  const getViewportSpace = useCallback(() => {
    return {
      width: screenSize.width,
      height: screenSize.height,
      availableWidth: screenSize.width - (state?.ui?.sidebarExpanded ? 256 : 64), // Account for sidebar
      availableHeight: screenSize.height - 80 // Account for header
    };
  }, [screenSize, state]);

  // =============================================================================
  // RESPONSIVE BEHAVIOR PRESETS
  // =============================================================================

  // Common responsive configurations
  const presets = {
    // Stat cards grid
    statCards: {
      xs: 1,
      sm: 2,
      md: 3,
      lg: 4,
      xl: 6,
      xxl: 8
    },
    
    // Capabilities grid
    capabilities: {
      xs: 1,
      sm: 1,
      md: 2,
      lg: 2,
      xl: 3,
      xxl: 3
    },
    
    // Analytics charts
    charts: {
      xs: 1,
      sm: 1,
      md: 1,
      lg: 2,
      xl: 2,
      xxl: 2
    },
    
    // Quick actions
    quickActions: {
      xs: 2,
      sm: 4,
      md: 6,
      lg: 8,
      xl: 8,
      xxl: 8
    }
  };

  // =============================================================================
  // PERFORMANCE MONITORING
  // =============================================================================

  // Track resize frequency for performance debugging
  const [resizeCount, setResizeCount] = useState(0);
  const [lastResizeTime, setLastResizeTime] = useState(Date.now());

  useEffect(() => {
    setResizeCount(prev => prev + 1);
    setLastResizeTime(Date.now());
  }, [debouncedScreenSize]);

  // =============================================================================
  // RETURN INTERFACE
  // =============================================================================

  return {
    // Screen dimensions
    screenSize: debouncedScreenSize,
    width: debouncedScreenSize.width,
    height: debouncedScreenSize.height,
    
    // Breakpoint detection
    isMobile,
    isTablet,
    isDesktop,
    isLargeDesktop,
    isExtraLarge,
    currentBreakpoint: getCurrentBreakpoint(),
    isBreakpoint,
    
    // Orientation
    orientation,
    isPortrait: orientation === 'portrait',
    isLandscape: orientation === 'landscape',
    
    // Responsive utilities
    getResponsiveColumns,
    getResponsiveSpacing,
    getResponsiveTextSize,
    
    // Viewport utilities
    fitsInViewport,
    getViewportSpace,
    
    // Presets for common use cases
    getColumns: (preset) => getResponsiveColumns(presets[preset] || presets.statCards),
    
    // Responsive classes helpers
    responsiveClasses: {
      // Hide/show based on breakpoint
      hideOnMobile: isMobile ? 'hidden' : 'block',
      hideOnDesktop: isDesktop ? 'hidden' : 'block',
      showOnMobile: isMobile ? 'block' : 'hidden',
      showOnDesktop: isDesktop ? 'block' : 'hidden',
      
      // Responsive grid classes
      gridCols: (preset = 'statCards') => {
        const cols = getResponsiveColumns(presets[preset]);
        return `grid-cols-${Math.min(cols, 12)}`; // Cap at 12 for Tailwind
      },
      
      // Responsive padding
      padding: getResponsiveSpacing({
        mobile: 'p-4',
        tablet: 'p-6', 
        desktop: 'p-8'
      }),
      
      // Responsive text
      textSize: getResponsiveTextSize({
        mobile: 'text-sm',
        tablet: 'text-base',
        desktop: 'text-lg'
      })
    },
    
    // Dashboard-specific responsive behavior
    dashboard: {
      // Should sidebar be collapsed by default
      shouldCollapseSidebar: isMobile,
      
      // Should use mobile modal behavior
      useMobileModals: isMobile,
      
      // Should stack elements vertically
      useVerticalLayout: isMobile || isTablet,
      
      // Should use compact components
      useCompactMode: isMobile,
      
      // Maximum columns for different layouts
      maxStatCardColumns: getResponsiveColumns(presets.statCards),
      maxCapabilityColumns: getResponsiveColumns(presets.capabilities),
      maxChartColumns: getResponsiveColumns(presets.charts)
    },
    
    // Performance monitoring (development only)
    ...(process.env.NODE_ENV === 'development' && {
      performance: {
        resizeCount,
        lastResizeTime,
        resizeFrequency: resizeCount > 1 ? (Date.now() - lastResizeTime) / resizeCount : 0
      }
    })
  };
};

// =============================================================================
// SIMPLE RESPONSIVE HOOK (for basic use cases)
// =============================================================================

/**
 * Simple responsive hook that just returns boolean flags
 * Useful when you only need basic breakpoint detection
 */
export const useSimpleResponsive = () => {
  const [width, setWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    isMobile: width < UI_CONFIG.BREAKPOINTS.LG,
    isTablet: width >= UI_CONFIG.BREAKPOINTS.MD && width < UI_CONFIG.BREAKPOINTS.LG,
    isDesktop: width >= UI_CONFIG.BREAKPOINTS.LG,
    width
  };
};

// =============================================================================
// BREAKPOINT HOOK (for specific breakpoint monitoring)
// =============================================================================

/**
 * Hook to monitor a specific breakpoint
 * @param {string} breakpoint - The breakpoint to monitor ('sm', 'md', 'lg', etc.)
 */
export const useBreakpoint = (breakpoint) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(min-width: ${UI_CONFIG.BREAKPOINTS[breakpoint.toUpperCase()]}px)`);
    
    setMatches(mediaQuery.matches);
    
    const handler = (event) => setMatches(event.matches);
    mediaQuery.addEventListener('change', handler);
    
    return () => mediaQuery.removeEventListener('change', handler);
  }, [breakpoint]);

  return matches;
};

export default useResponsive;