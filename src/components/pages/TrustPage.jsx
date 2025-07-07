import React from 'react';
import { Shield } from 'lucide-react';

/**
 * Extremely simple, self-contained Trust page.
 * – No external hooks
 * – Hard-coded mock data
 * – Try/catch guarding render
 * – Very verbose logging for troubleshooting
 */
const TrustPage = () => {
  /* eslint-disable no-console */
  console.log('[TrustPage] render start');

  // Simple mock data
  const mockData = {
    overallScore: 78.5,
    scoreDelta: -1.2
  };
  console.log('[TrustPage] mock data:', mockData);

  try {
    return (
      <div style={{ padding: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, display: 'flex', alignItems: 'center' }}>
          <Shield size={28} style={{ marginRight: 8, color: '#3b82f6' }} />
          Cybersecurity Trust Score (Standalone)
        </h1>

        <p style={{ marginTop: 12 }}>Your current overall Trust Score is:</p>

        <p style={{ fontSize: 56, fontWeight: 800, color: '#3b82f6', margin: '12px 0' }}>
          {mockData.overallScore.toFixed(1)}
        </p>

        <p style={{ fontSize: 14 }}>
          {mockData.scoreDelta >= 0 ? '▲' : '▼'} {mockData.scoreDelta.toFixed(1)} in the last 30 days
        </p>

        <p style={{ fontSize: 12, marginTop: 12 }}>
          (This minimal view is for debugging only – no external data or complex visuals.)
        </p>
      </div>
    );
  } catch (e) {
    console.error('[TrustPage] render error:', e);
    return (
      <div style={{ padding: 24, color: 'red' }}>
        <h2>Trust Page failed to render.</h2>
        <pre>{String(e)}</pre>
      </div>
    );
  }
};

export default TrustPage;
