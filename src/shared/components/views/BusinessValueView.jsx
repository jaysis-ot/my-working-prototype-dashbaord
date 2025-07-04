// src/components/views/BusinessValueView.jsx
import React, { useState, useMemo } from 'react';
import { 
  Star, DollarSign, TrendingUp, Target, BarChart3, PieChart, 
  Filter, Download, Eye, ArrowUp, ArrowDown, Calendar, Users
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ScatterChart, Scatter } from 'recharts';
import { BUSINESS_VALUE_CARDS_LIMIT } from '../../constants';

const BusinessValueView = ({ requirements, onViewRequirement }) => {
  const [sortBy, setSortBy] = useState('businessValue');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterBy, setFilterBy] = useState('all');
  const [showChart, setShowChart] = useState('business-value');

  // Calculate business value metrics
  const businessMetrics = useMemo(() => {
    if (!requirements?.length) return {};

    const validRequirements = requirements.filter(r => r.businessValueScore && r.businessValueScore > 0);
    
    const totalInvestment = requirements.reduce((sum, r) => sum + (r.costEstimate || 0), 0);
    const averageBusinessValue = validRequirements.reduce((sum, r) => sum + r.businessValueScore, 0) / validRequirements.length;
    const averageROI = requirements.filter(r => r.roiProjection).reduce((sum, r) => sum + r.roiProjection, 0) / requirements.filter(r => r.roiProjection).length;
    const highValueCount = validRequirements.filter(r => r.businessValueScore >= 4).length;
    const criticalRequirements = requirements.filter(r => r.priority === 'Critical').length;
    
    // ROI categories
    const roiCategories = {
      excellent: requirements.filter(r => (r.roiProjection || 0) >= 150).length,
      good: requirements.filter(r => (r.roiProjection || 0) >= 100 && (r.roiProjection || 0) < 150).length,
      moderate: requirements.filter(r => (r.roiProjection || 0) >= 50 && (r.roiProjection || 0) < 100).length,
      low: requirements.filter(r => (r.roiProjection || 0) < 50 && (r.roiProjection || 0) > 0).length
    };

    return {
      totalInvestment,
      averageBusinessValue: averageBusinessValue || 0,
      averageROI: averageROI || 0,
      highValueCount,
      criticalRequirements,
      roiCategories,
      totalRequirements: requirements.length
    };
  }, [requirements]);

  // Sort and filter requirements
  const processedRequirements = useMemo(() => {
    let filtered = requirements.filter(req => {
      if (filterBy === 'high-value') return (req.businessValueScore || 0) >= 4;
      if (filterBy === 'high-roi') return (req.roiProjection || 0) >= 150;
      if (filterBy === 'critical') return req.priority === 'Critical';
      if (filterBy === 'essential') return req.applicability?.type === 'Essential';
      return true;
    });

    return filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'businessValue':
          aValue = a.businessValueScore || 0;
          bValue = b.businessValueScore || 0;
          break;
        case 'roi':
          aValue = a.roiProjection || 0;
          bValue = b.roiProjection || 0;
          break;
        case 'cost':
          aValue = a.costEstimate || 0;
          bValue = b.costEstimate || 0;
          break;
        case 'valuePerCost':
          aValue = (a.businessValueScore || 0) / ((a.costEstimate || 1) / 100000);
          bValue = (b.businessValueScore || 0) / ((b.costEstimate || 1) / 100000);
          break;
        default:
          aValue = a.businessValueScore || 0;
          bValue = b.businessValueScore || 0;
      }
      
      return sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
    });
  }, [requirements, sortBy, sortOrder, filterBy]);

  // Chart data preparation
  const chartData = useMemo(() => {
    const businessValueData = requirements.filter(r => r.businessValueScore && r.costEstimate).map(req => ({
      id: req.id,
      businessValue: req.businessValueScore,
      cost: (req.costEstimate || 0) / 1000,
      roi: req.roiProjection || 0,
      category: req.category,
      priority: req.priority
    }));

    const roiDistribution = [
      { range: '150%+', count: businessMetrics.roiCategories?.excellent || 0, color: '#10b981' },
      { range: '100-149%', count: businessMetrics.roiCategories?.good || 0, color: '#3b82f6' },
      { range: '50-99%', count: businessMetrics.roiCategories?.moderate || 0, color: '#f59e0b' },
      { range: '<50%', count: businessMetrics.roiCategories?.low || 0, color: '#ef4444' }
    ];

    return { businessValueData, roiDistribution };
  }, [requirements, businessMetrics]);

  const handleSort = (newSortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 flex items-center">
              <Star className="h-6 w-6 mr-3 text-yellow-500" />
              Business Value Analysis
            </h3>
            <p className="text-gray-600 mt-1">Investment prioritization and ROI assessment</p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Download className="h-4 w-4 mr-2" />
              Export Analysis
            </button>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="h-5 w-5 text-blue-600" />
              <span className="text-xs text-blue-600 font-medium">TOTAL</span>
            </div>
            <div className="text-2xl font-bold text-blue-900">
              £{(businessMetrics.totalInvestment / 1000000).toFixed(1)}M
            </div>
            <div className="text-xs text-blue-700">Total Investment</div>
          </div>

          <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Star className="h-5 w-5 text-yellow-600" />
              <span className="text-xs text-yellow-600 font-medium">AVG</span>
            </div>
            <div className="text-2xl font-bold text-yellow-900">
              {businessMetrics.averageBusinessValue.toFixed(1)}
            </div>
            <div className="text-xs text-yellow-700">Business Value</div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span className="text-xs text-green-600 font-medium">AVG</span>
            </div>
            <div className="text-2xl font-bold text-green-900">
              {businessMetrics.averageROI.toFixed(0)}%
            </div>
            <div className="text-xs text-green-700">ROI Projection</div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Target className="h-5 w-5 text-purple-600" />
              <span className="text-xs text-purple-600 font-medium">COUNT</span>
            </div>
            <div className="text-2xl font-bold text-purple-900">
              {businessMetrics.highValueCount}
            </div>
            <div className="text-xs text-purple-700">High Value (4.0+)</div>
          </div>

          <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Target className="h-5 w-5 text-red-600" />
              <span className="text-xs text-red-600 font-medium">URGENT</span>
            </div>
            <div className="text-2xl font-bold text-red-900">
              {businessMetrics.criticalRequirements}
            </div>
            <div className="text-xs text-red-700">Critical Priority</div>
          </div>

          <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <BarChart3 className="h-5 w-5 text-indigo-600" />
              <span className="text-xs text-indigo-600 font-medium">ITEMS</span>
            </div>
            <div className="text-2xl font-bold text-indigo-900">
              {businessMetrics.totalRequirements}
            </div>
            <div className="text-xs text-indigo-700">Total Requirements</div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Business Value vs Cost Scatter */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-900">Business Value vs Investment</h4>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowChart('business-value')}
                className={`px-3 py-1 text-xs rounded-full ${showChart === 'business-value' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}`}
              >
                Scatter
              </button>
              <button
                onClick={() => setShowChart('roi-distribution')}
                className={`px-3 py-1 text-xs rounded-full ${showChart === 'roi-distribution' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}`}
              >
                ROI
              </button>
            </div>
          </div>
          
          {showChart === 'business-value' ? (
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart data={chartData.businessValueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="cost" 
                  name="Cost (£k)" 
                  label={{ value: 'Investment (£k)', position: 'insideBottom', offset: -5 }}
                />
                <YAxis 
                  dataKey="businessValue" 
                  name="Business Value" 
                  domain={[0, 5]}
                  label={{ value: 'Business Value', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'cost' ? `£${value}k` : value,
                    name === 'cost' ? 'Investment' : 'Business Value'
                  ]}
                  labelFormatter={(value) => `Requirement: ${value}`}
                />
                <Scatter dataKey="businessValue" fill="#3b82f6" />
              </ScatterChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.roiDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* ROI Performance Summary */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">ROI Performance Distribution</h4>
          <div className="space-y-3">
            {chartData.roiDistribution.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: `${item.color}10` }}>
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="font-medium text-gray-900">{item.range}</span>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900">{item.count}</div>
                  <div className="text-xs text-gray-500">
                    {requirements.length ? ((item.count / requirements.length) * 100).toFixed(0) : 0}%
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-2">Investment Efficiency Analysis:</div>
            <div className="text-xs text-gray-500">
              • <strong>{businessMetrics.roiCategories?.excellent || 0}</strong> requirements deliver exceptional ROI (150%+)
              <br />
              • <strong>{(businessMetrics.roiCategories?.excellent || 0) + (businessMetrics.roiCategories?.good || 0)}</strong> requirements meet minimum ROI threshold (100%+)
              <br />
              • Average payback period: <strong>{businessMetrics.averageROI > 0 ? (100 / businessMetrics.averageROI * 12).toFixed(1) : 'N/A'}</strong> months
            </div>
          </div>
        </div>
      </div>

      {/* Requirements List */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-lg font-semibold text-gray-900">Business Value Requirements</h4>
          <div className="flex items-center space-x-3">
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="text-sm border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Requirements</option>
              <option value="high-value">High Value (4.0+)</option>
              <option value="high-roi">High ROI (150%+)</option>
              <option value="critical">Critical Priority</option>
              <option value="essential">Essential Items</option>
            </select>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [newSortBy, newSortOrder] = e.target.value.split('-');
                setSortBy(newSortBy);
                setSortOrder(newSortOrder);
              }}
              className="text-sm border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500"
            >
              <option value="businessValue-desc">Business Value (High to Low)</option>
              <option value="businessValue-asc">Business Value (Low to High)</option>
              <option value="roi-desc">ROI (High to Low)</option>
              <option value="roi-asc">ROI (Low to High)</option>
              <option value="cost-desc">Cost (High to Low)</option>
              <option value="cost-asc">Cost (Low to High)</option>
              <option value="valuePerCost-desc">Value per £100k (Best First)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {processedRequirements.slice(0, BUSINESS_VALUE_CARDS_LIMIT).map((requirement) => (
            <div 
              key={requirement.id} 
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-300 cursor-pointer group"
              onClick={() => onViewRequirement(requirement)}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <h5 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                      {requirement.id}
                    </h5>
                    <Eye className="h-4 w-4 ml-2 text-gray-400 group-hover:text-blue-600 transition-colors opacity-0 group-hover:opacity-100" />
                  </div>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    requirement.priority === 'Critical' ? 'bg-red-100 text-red-800' :
                    requirement.priority === 'High' ? 'bg-orange-100 text-orange-800' :
                    requirement.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {requirement.priority}
                  </span>
                </div>
                <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                  (requirement.businessValueScore || 0) >= 4 ? 'bg-green-100 text-green-800' :
                  (requirement.businessValueScore || 0) >= 3 ? 'bg-blue-100 text-blue-800' :
                  (requirement.businessValueScore || 0) >= 2 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  <Star className="h-3 w-3" />
                  {requirement.businessValueScore || 0}
                </div>
              </div>

              {/* Business Justification */}
              <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                {requirement.businessJustification || requirement.description}
              </p>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="flex items-center mb-1">
                    <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                    <span className="text-gray-600">ROI:</span>
                  </div>
                  <span className="font-medium">{requirement.roiProjection || 0}%</span>
                </div>
                <div>
                  <div className="flex items-center mb-1">
                    <DollarSign className="h-3 w-3 text-blue-500 mr-1" />
                    <span className="text-gray-600">Cost:</span>
                  </div>
                  <span className="font-medium">£{((requirement.costEstimate || 0) / 1000).toFixed(0)}k</span>
                </div>
                <div>
                  <div className="flex items-center mb-1">
                    <Target className="h-3 w-3 text-purple-500 mr-1" />
                    <span className="text-gray-600">Value/£100k:</span>
                  </div>
                  <span className="font-medium">
                    {((requirement.businessValueScore || 0) / ((requirement.costEstimate || 1) / 100000)).toFixed(1)}
                  </span>
                </div>
                <div>
                  <div className="flex items-center mb-1">
                    <Calendar className="h-3 w-3 text-orange-500 mr-1" />
                    <span className="text-gray-600">Payback:</span>
                  </div>
                  <span className="font-medium">
                    {requirement.roiProjection ? (100 / requirement.roiProjection * 12).toFixed(0) : 'N/A'}mo
                  </span>
                </div>
              </div>

              {/* Category Tag */}
              <div className="mt-3 pt-3 border-t border-gray-100">
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {requirement.category}
                </span>
              </div>
            </div>
          ))}
        </div>

        {processedRequirements.length > BUSINESS_VALUE_CARDS_LIMIT && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Showing top {BUSINESS_VALUE_CARDS_LIMIT} of {processedRequirements.length} requirements
            </p>
          </div>
        )}

        {processedRequirements.length === 0 && (
          <div className="text-center py-8">
            <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Requirements Found</h3>
            <p className="text-gray-600">Try adjusting your filters to see more results.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BusinessValueView;