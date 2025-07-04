// src/components/widgets/index.js

// Main widget components
export { default as QuickActions } from './QuickActions';
export { default as ActivityFeed } from './ActivityFeed';
export { default as StatCard } from '../ui/StatCard'; // Re-export from ui folder

// Export QuickActions variants for convenience
export { 
  OverviewQuickActions,
  ManagementQuickActions, 
  AnalyticsQuickActions,
  CompactQuickActions
} from './QuickActions';

// Export StatCard variants for convenience
export {
  SmallStatCard,
  LargeStatCard,
  TrendingStatCard,
  InteractiveStatCard
} from '../ui/StatCard';

// Future widget exports can be added here as they're created
// export { default as CompanyProfileSummary } from './CompanyProfileSummary';
// export { default as ProfileSetupPrompt } from './ProfileSetupPrompt';
// export { default as RegulatoryBanner } from './RegulatoryBanner';
// export { default as StatCardsGrid } from './StatCardsGrid';
// export { default as ThreatLevelIndicator } from './ThreatLevelIndicator';
// export { default as ProgressIndicator } from './ProgressIndicator';
// export { default as NotificationBell } from './NotificationBell';
// export { default as SearchWidget } from './SearchWidget';
// export { default as FilterWidget } from './FilterWidget';