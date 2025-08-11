// src/components/admin/LoginTelemetryPanel.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { RefreshCw, Download, AlertTriangle, BarChart2 } from 'lucide-react';

const LoginTelemetryPanel = () => {
  const [metrics, setMetrics] = useState(null);
  const [isConfirmingClear, setIsConfirmingClear] = useState(false);

  // Load metrics from localStorage
  const loadMetrics = () => {
    try {
      const metricsString = localStorage.getItem('cyberTrustDashboard.metrics');
      if (!metricsString) {
        setMetrics({ login: { total: 0, success: 0, failure: 0, perDay: {} } });
        return;
      }
      
      const parsedMetrics = JSON.parse(metricsString);
      setMetrics(parsedMetrics);
    } catch (error) {
      console.error('Error loading login metrics:', error);
      setMetrics({ login: { total: 0, success: 0, failure: 0, perDay: {} } });
    }
  };

  // Load metrics on component mount
  useEffect(() => {
    loadMetrics();
  }, []);

  // Calculate success rate
  const successRate = useMemo(() => {
    if (!metrics?.login?.total || metrics.login.total === 0) return 0;
    return ((metrics.login.success || 0) / metrics.login.total) * 100;
  }, [metrics]);

  // Format date for display
  const formatDate = (timestamp) => {
    if (!timestamp) return '—';
    return new Date(timestamp).toLocaleString();
  };

  // Generate last 7 days array (today and 6 days prior)
  const last7Days = useMemo(() => {
    const days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      const dayInitial = date.toLocaleDateString('en-US', { weekday: 'short' })[0];
      
      days.push({
        date: dateString,
        dayInitial,
        count: 0
      });
    }
    
    // Fill in counts from metrics if available
    if (metrics?.login?.perDay) {
      days.forEach(day => {
        if (metrics.login.perDay[day.date]) {
          day.count = metrics.login.perDay[day.date].total || 0;
        }
      });
    }
    
    return days;
  }, [metrics]);

  // Find max count for normalizing bar heights
  const maxCount = useMemo(() => {
    if (!last7Days.length) return 1;
    return Math.max(...last7Days.map(day => day.count), 1); // Ensure non-zero denominator
  }, [last7Days]);

  // Handle refresh button click
  const handleRefresh = () => {
    loadMetrics();
  };

  // Handle export button click
  const handleExport = () => {
    try {
      if (!metrics) return;
      
      const dataStr = JSON.stringify(metrics, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `login-metrics-${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    } catch (error) {
      console.error('Error exporting metrics:', error);
      alert('Failed to export metrics');
    }
  };

  // Handle clear button click
  const handleClear = () => {
    if (isConfirmingClear) {
      try {
        localStorage.removeItem('cyberTrustDashboard.metrics');
        setMetrics({ login: { total: 0, success: 0, failure: 0, perDay: {} } });
        setIsConfirmingClear(false);
      } catch (error) {
        console.error('Error clearing metrics:', error);
        alert('Failed to clear metrics');
      }
    } else {
      setIsConfirmingClear(true);
    }
  };

  // Cancel clear confirmation
  const handleCancelClear = () => {
    setIsConfirmingClear(false);
  };

  if (!metrics) {
    return (
      <div className="p-4 flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Login Telemetry</h3>
          <p className="text-sm text-gray-600">Statistics on login attempts and success rates</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            title="Refresh metrics"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <button
            onClick={handleExport}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            title="Export as JSON"
            disabled={!metrics?.login?.total}
          >
            <Download className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Stat Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="dashboard-card p-4">
          <p className="text-sm font-medium text-gray-500">Total Attempts</p>
          <p className="text-2xl font-bold">{metrics.login?.total || 0}</p>
        </div>
        <div className="dashboard-card p-4">
          <p className="text-sm font-medium text-gray-500">Successful</p>
          <p className="text-2xl font-bold text-green-600">{metrics.login?.success || 0}</p>
        </div>
        <div className="dashboard-card p-4">
          <p className="text-sm font-medium text-gray-500">Failed</p>
          <p className="text-2xl font-bold text-red-600">{metrics.login?.failure || 0}</p>
        </div>
        <div className="dashboard-card p-4">
          <p className="text-sm font-medium text-gray-500">Success Rate</p>
          <p className="text-2xl font-bold">{successRate.toFixed(1)}%</p>
        </div>
        <div className="dashboard-card p-4">
          <p className="text-sm font-medium text-gray-500">Last Attempt</p>
          <p className="text-lg font-bold truncate" title={formatDate(metrics.login?.lastAttemptAt)}>
            {formatDate(metrics.login?.lastAttemptAt)}
          </p>
        </div>
      </div>

      {/* 7-Day Bar Chart */}
      <div className="dashboard-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-blue-600" />
            Login Attempts (Last 7 Days)
          </h4>
        </div>
        
        <div className="flex items-end justify-between h-40 px-2">
          {last7Days.map((day, index) => (
            <div key={index} className="flex flex-col items-center w-1/7">
              <div 
                className="w-10 bg-blue-500 rounded-t"
                style={{ 
                  height: `${(day.count / maxCount) * 100}%`,
                  minHeight: day.count > 0 ? '4px' : '0'
                }}
                title={`${day.count} login attempts on ${day.date}`}
              ></div>
              <div className="text-xs font-medium text-gray-500 mt-2">{day.dayInitial}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Clear Metrics Button */}
      <div className="flex justify-end">
        {isConfirmingClear ? (
          <div className="flex items-center gap-2">
            <span className="text-sm text-red-600 flex items-center">
              <AlertTriangle className="w-4 h-4 mr-1" />
              Confirm clear all metrics?
            </span>
            <button
              onClick={handleCancelClear}
              className="px-3 py-1 text-sm bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={handleClear}
              className="px-3 py-1 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Yes, Clear All
            </button>
          </div>
        ) : (
          <button
            onClick={handleClear}
            className="px-4 py-2 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50"
            disabled={!metrics?.login?.total}
          >
            Clear Metrics
          </button>
        )}
      </div>
    </div>
  );
};

export default LoginTelemetryPanel;
