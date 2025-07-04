import React, { useState } from 'react';
import { Zap, Cpu, BarChart3, Activity, RotateCcw, TrendingUp, Database, Clock } from 'lucide-react';

const PerformanceTab = ({ settings, updateSetting }) => {
  const [isRebuilding, setIsRebuilding] = useState(false);

  const rebuildIndex = async () => {
    setIsRebuilding(true);
    // Simulate index rebuild process
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsRebuilding(false);
  };

  const getPerformanceImpact = (setting, value) => {
    switch(setting) {
      case 'timeout':
        if (value < 15) return { color: 'text-red-600', text: 'May cause premature query cancellation' };
        if (value > 60) return { color: 'text-yellow-600', text: 'Risk of user experience degradation' };
        return { color: 'text-green-600', text: 'Optimal balance of reliability and speed' };
      case 'concurrent':
        if (value < 20) return { color: 'text-yellow-600', text: 'May limit peak load handling' };
        if (value > 100) return { color: 'text-red-600', text: 'Risk of resource exhaustion' };
        return { color: 'text-green-600', text: 'Good throughput capacity' };
      case 'ttl':
        if (value < 120) return { color: 'text-red-600', text: 'High cache churn, increased load' };
        if (value > 1800) return { color: 'text-yellow-600', text: 'Risk of stale data in dynamic environments' };
        return { color: 'text-green-600', text: 'Balanced freshness and performance' };
      default:
        return { color: 'text-gray-600', text: '' };
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Zap className="w-5 h-5 text-purple-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-purple-900">Real-Time Performance Optimization</h3>
            <p className="text-sm text-purple-700 mt-1">Tune your platform for rapid risk analysis and trust score updates while maintaining evidence integrity and system reliability.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-4 flex items-center gap-2">
            <Cpu className="w-4 h-4" />
            Query Performance
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Query Timeout (seconds)</label>
              <input 
                type="number"
                value={settings.performance.queries.timeout}
                onChange={(e) => updateSetting('performance', 'queries.timeout', parseInt(e.target.value))}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-purple-500"
                min="10"
                max="300"
              />
              <div className={`text-xs mt-1 ${getPerformanceImpact('timeout', settings.performance.queries.timeout).color}`}>
                {getPerformanceImpact('timeout', settings.performance.queries.timeout).text}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Max Concurrent Queries</label>
              <input 
                type="number"
                value={settings.performance.queries.maxConcurrent}
                onChange={(e) => updateSetting('performance', 'queries.maxConcurrent', parseInt(e.target.value))}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-purple-500"
                min="10"
                max="200"
              />
              <div className={`text-xs mt-1 ${getPerformanceImpact('concurrent', settings.performance.queries.maxConcurrent).color}`}>
                {getPerformanceImpact('concurrent', settings.performance.queries.maxConcurrent).text}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Cache TTL (seconds)</label>
              <input 
                type="number"
                value={settings.performance.caching.ttl}
                onChange={(e) => updateSetting('performance', 'caching.ttl', parseInt(e.target.value))}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-purple-500"
                min="60"
                max="3600"
              />
              <div className={`text-xs mt-1 ${getPerformanceImpact('ttl', settings.performance.caching.ttl).color}`}>
                {getPerformanceImpact('ttl', settings.performance.caching.ttl).text}
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-gray-50 rounded">
            <div className="grid grid-cols-3 gap-4 text-center text-sm">
              <div>
                <div className="text-lg font-bold text-blue-600">2.3s</div>
                <div className="text-gray-600">Avg Query Time</div>
              </div>
              <div>
                <div className="text-lg font-bold text-green-600">94%</div>
                <div className="text-gray-600">Cache Hit Rate</div>
              </div>
              <div>
                <div className="text-lg font-bold text-purple-600">847</div>
                <div className="text-gray-600">Queries/Hour</div>
              </div>
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Indexing & Search Optimization
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Rebuild Schedule</label>
                <select 
                  value={settings.performance.indexing.rebuild}
                  onChange={(e) => updateSetting('performance', 'indexing.rebuild', e.target.value)}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-purple-500"
                >
                  <option value="daily">Daily (High-change environments)</option>
                  <option value="weekly">Weekly (Recommended)</option>
                  <option value="monthly">Monthly</option>
                </select>
                <div className="text-xs text-gray-500 mt-1">
                  {settings.performance.indexing.rebuild === 'daily' && 'Best for rapidly changing risk landscapes'}
                  {settings.performance.indexing.rebuild === 'weekly' && 'Optimal for most organizational change rates'}
                  {settings.performance.indexing.rebuild === 'monthly' && 'Suitable for stable, mature environments'}
                </div>
              </div>
              
              <div className="flex items-end">
                <label className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    checked={settings.performance.indexing.optimize}
                    onChange={(e) => updateSetting('performance', 'indexing.optimize', e.target.checked)}
                    className="rounded"
                  />
                  <span>Auto-optimize during rebuild</span>
                </label>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <button 
                onClick={rebuildIndex}
                disabled={isRebuilding}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 flex items-center gap-2"
              >
                {isRebuilding ? (
                  <>
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                    Rebuilding...
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-4 h-4" />
                    Rebuild Index Now
                  </>
                )}
              </button>
              
              <div className="text-sm text-gray-600">
                Last rebuild: 2 days ago (Next: Tomorrow at 3:00 AM)
              </div>
            </div>
            
            <div className="grid grid-cols-4 gap-4 text-center text-sm bg-blue-50 p-3 rounded">
              <div>
                <div className="text-lg font-bold text-blue-700">1.2M</div>
                <div className="text-xs text-blue-600">Indexed Documents</div>
              </div>
              <div>
                <div className="text-lg font-bold text-blue-700">847ms</div>
                <div className="text-xs text-blue-600">Avg Search Time</div>
              </div>
              <div>
                <div className="text-lg font-bold text-blue-700">99.7%</div>
                <div className="text-xs text-blue-600">Index Health</div>
              </div>
              <div>
                <div className="text-lg font-bold text-blue-700">47GB</div>
                <div className="text-xs text-blue-600">Index Size</div>
              </div>
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Real-Time Monitoring
          </h3>
          <div className="space-y-4">
            <label className="flex items-center gap-2">
              <input 
                type="checkbox" 
                checked={settings.performance.monitoring.alerts}
                onChange={(e) => updateSetting('performance', 'monitoring.alerts', e.target.checked)}
                className="rounded"
              />
              <span>Enable performance alerts</span>
            </label>
            
            {settings.performance.monitoring.alerts && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    CPU Threshold: {settings.performance.monitoring.threshold}%
                  </label>
                  <input 
                    type="range"
                    min="50"
                    max="95"
                    value={settings.performance.monitoring.threshold}
                    onChange={(e) => updateSetting('performance', 'monitoring.threshold', parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Conservative (50%)</span>
                    <span>Balanced (75%)</span>
                    <span>Aggressive (95%)</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 border rounded">
                    <div className="text-sm font-medium mb-1">Memory Usage</div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{width: '67%'}}></div>
                      </div>
                      <span className="text-sm">67%</span>
                    </div>
                  </div>
                  
                  <div className="p-3 border rounded">
                    <div className="text-sm font-medium mb-1">Disk I/O</div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div className="bg-yellow-500 h-2 rounded-full" style={{width: '43%'}}></div>
                      </div>
                      <span className="text-sm">43%</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Performance Trends
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-green-50 rounded border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-green-900">Response Time</span>
                </div>
                <div className="text-2xl font-bold text-green-700">↓ 23%</div>
                <div className="text-sm text-green-600">vs last month</div>
              </div>
              
              <div className="p-4 bg-blue-50 rounded border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <Database className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-blue-900">Throughput</span>
                </div>
                <div className="text-2xl font-bold text-blue-700">↑ 41%</div>
                <div className="text-sm text-blue-600">vs last month</div>
              </div>
            </div>
            
            <div className="text-sm text-gray-600">
              <strong>Optimization Impact:</strong> Recent performance tuning has improved risk calculation speed by 23% while handling 41% more concurrent trust score requests. Your evidence processing pipeline now maintains sub-3-second response times during peak loads.
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-medium text-yellow-900 mb-2 flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Performance Recommendations
          </h4>
          <div className="space-y-2 text-sm text-yellow-800">
            <div>• Consider increasing cache TTL to 450 seconds for better hit rates during business hours</div>
            <div>• Current query load suggests you could safely increase concurrent limit to 75 for better peak performance</div>
            <div>• Weekly index rebuilds are optimal for your evidence update frequency</div>
            <div>• Monitor memory usage trends - current growth rate suggests planning for capacity expansion in Q3</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceTab;