import React from 'react';
import { Shield } from 'lucide-react';
import LoadingSpinner from '../atoms/LoadingSpinner';
import ErrorDisplay from '../molecules/ErrorDisplay';
import { useTrustData } from '../../hooks/useTrustData';

/**
 * A minimal React Error Boundary.
 * Catches runtime errors in any of the child components and displays a fallback UI.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Log error details for debugging
    /* eslint-disable no-console */
    console.error('[TrustPage ErrorBoundary] Caught error:', error, info);
    /* eslint-enable no-console */
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="dashboard-card p-6">
          <h2 className="text-xl font-bold text-red-600 mb-2">Something went wrong.</h2>
          <p className="text-secondary-600 dark:text-secondary-400">
            {this.state.error?.message || 'Unknown error'}
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}
// Prop validation is optional here; ErrorBoundary is strictly internal.

/**
 * TrustPage Component
 * 
 * Provides a high-level, user-friendly overview of the Cybersecurity Trust Scoring framework.
 * It translates the complex mathematical model into understandable concepts for stakeholders.
 */
const TrustPage = () => {
  // Debug log to confirm component render
  console.log('TrustPage component rendered');

  const { data: trustData, loading, error } = useTrustData();

  // Debug log to inspect hook state transitions
  React.useEffect(() => {
    console.log('TrustPage state update:', { loading, error, trustData });
  }, [loading, error, trustData]);

  if (loading) {
    return <LoadingSpinner fullScreen message="Calculating Trust Score..." />;
  }

  if (error) {
    return <ErrorDisplay title="Could not load Trust Score data" message={error.message} />;
  }

  return (
    <ErrorBoundary>
      <div className="dashboard-card p-6 space-y-4">
        <h1 className="text-2xl font-bold text-secondary-900 dark:text-white flex items-center">
          <Shield className="h-7 w-7 mr-2 text-primary-600" />
          Cybersecurity Trust Score
        </h1>

        <p className="text-secondary-600 dark:text-secondary-300">
          Your current overall Trust Score is:
        </p>

        <p className="text-6xl font-extrabold text-primary-600 dark:text-primary-400">
          {trustData.overallScore.toFixed(1)}
        </p>

        <p className="text-secondary-500 dark:text-secondary-400 text-sm">
          {trustData.scoreDelta >= 0 ? '▲' : '▼'} {trustData.scoreDelta.toFixed(1)} in the last 30 days
        </p>

        <p className="text-xs text-secondary-500 dark:text-secondary-400">
          (Detailed visualizations are temporarily disabled while we troubleshoot rendering issues)
        </p>
      </div>
    </ErrorBoundary>
  );
};

export default TrustPage;
