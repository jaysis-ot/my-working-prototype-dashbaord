// src/components/layout/index.js

// Main layout components
export { default as ErrorBoundary } from './ErrorBoundary';
export { default as LoadingSpinner } from './LoadingSpinner';

// Export spinner variants for convenience
export { 
  SmallSpinner,
  MediumSpinner, 
  LargeSpinner,
  FullScreenSpinner,
  CenteredSpinner,
  InlineSpinner
} from './LoadingSpinner';

// Future layout components can be added here
// export { default as PageLayout } from './PageLayout';
// export { default as ContentWrapper } from './ContentWrapper';
// export { default as Sidebar } from './Sidebar';