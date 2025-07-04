// src/components/views/MaturityAnalysisView.jsx
import React, { useState, useMemo } from 'react';
import { 
  Gauge, TrendingUp, Target, BarChart3, Users, CheckCircle, 
  ArrowUp, ArrowRight, Download, Filter, Eye, AlertTriangle,
  Lightbulb, Award, Clock, Star
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { MATURITY_LEVELS, COLORS } from '../../constants';
import MaturityIndicator from '../ui/MaturityIndicator';

const MaturityAnalysisView = ({ requirements, onViewRequirement }) => {
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [showRoadmap, setShowRoadmap] = useState(true);
  const [filterBy, setFilterBy] = useState('all');

  // Calculate maturity metrics
  const maturityMetrics = useMemo(() => {
    if (!requirements?.length) return {};

    const maturityCounts = requirements.reduce((acc, req) => {
      const level = req.maturityLevel?.level || 'Unknown';
      acc[level] = (acc[level] || 0) + 1;
      return acc;
    }, {});

    const totalAssessed = requirements.filter(r => r.maturityLevel?.level).length;
    const averageMaturity = requirements
      .filter(r => r.maturityLevel?.score)
      .reduce((sum, r) => sum + r.maturityLevel.score, 0) / requirements.filter(r => r.maturityLevel?.score).length;

    // Calculate gaps and improvement opportunities
    const lowMaturityCount = requirements.filter(r => (r.maturityLevel?.score || 0) <= 2).length;
    const highValueLowMaturity = requirements.filter(r => 
      (r.maturityLevel?.score || 0) <= 2 && (r.businessValueScore || 0) >= 4
    ).length;

    // Category breakdown
    const categoryMaturity = requirements.reduce((acc, req) => {
      const category = req.category || 'Unknown';
      if (!acc[category]) {
        acc[category] = { total: 0, scores: [] };
      }
      acc[category].total++;
      if (req.maturityLevel?.score) {
        acc[category].scores.push(req.maturityLevel.score);
      }
      return acc;
    }, {});

    // Calculate average maturity per category
    Object.keys(categoryMaturity).forEach(category => {
      const scores = categoryMaturity[category].scores;
      categoryMaturity[category].averageMaturity = scores.length > 0 
        ? scores.reduce((sum, score) => sum + score, 0) / scores.length 
        : 0;
    });

    return {
      maturityCounts,
      totalAssessed,
      averageMaturity: averageMaturity || 0,
      lowMaturityCount,
      highValueLowMaturity,
      categoryMaturity
    };
  }, [requirements]);

  // Chart data preparation
  const chartData = useMemo(() => {
    const maturityDistribution = Object.entries(MATURITY_LEVELS).map(([key, level]) => ({
      level: level.level,
      count: maturityMetrics.maturityCounts?.[level.level] || 0,
      percentage: requirements.length ? 
        ((maturityMetrics.maturityCounts?.[level.level] || 0) / requirements.length * 100).toFixed(1) 
        : 0,
      score: level.score,
      color: COLORS.MATURITY[level.level]
    }));

    // Radar chart data for category analysis
    const categoryData = Object.entries(maturityMetrics.categoryMaturity || {})
      .filter(([_, data]) => data.total >= 3) // Only show categories with 3+ requirements
      .slice(0, 8) // Limit to 8 categories for readability
      .map(([category, data]) => ({
        category: category.length > 20 ? category.substring(0, 20) + '...' : category,
        fullCategory: category,
        maturity: data.averageMaturity.toFixed(1),
        count: data.total
      }));

    return { maturityDistribution, categoryData };
  }, [requirements, maturityMetrics]);

  // Filtered requirements
  const filteredRequirements = useMemo(() => {
    let filtered = requirements;

    if (selectedLevel !== 'all') {
      filtered = filtered.filter(req => req.maturityLevel?.level === selectedLevel);
    }

    if (filterBy === 'low-maturity') {
      filtered = filtered.filter(req => (req.maturityLevel?.score || 0) <= 2);
    } else if (filterBy === 'high-value-low-maturity') {
      filtered = filtered.filter(req => 
        (req.maturityLevel?.score || 0) <= 2 && (req.businessValueScore || 0) >= 4
      );
    } else if (filterBy === 'unassessed') {
      filtered = filtered.filter(req => !req.maturityLevel?.level);
    }

    return filtered.sort((a, b) => {
      const aScore = a.maturityLevel?.score || 0;
      const bScore = b.maturityLevel?.score || 0;
      return aScore - bScore; // Low to high maturity
    });
  }, [requirements, selectedLevel, filterBy]);

  // Improvement roadmap
  const improvementRoadmap = useMemo(() => {
    const roadmapItems = [];

    // High-value, low-maturity items (quick wins)
    if (maturityMetrics.highValueLowMaturity > 0) {
      roadmapItems.push({
        phase: 'Phase 1: Quick Wins',
        duration: '2-4 months',
        priority: 'High',
        description: `Focus on ${maturityMetrics.highValueLowMaturity} high-value requirements with low maturity`,
        items: requirements.filter(r => 
          (r.maturityLevel?.score || 0) <= 2 && (r.businessValueScore || 0) >= 4
        ).slice(0, 5),
        icon: Target,
        color: 'bg-green-500'
      });
    }

    // Medium maturity improvements
    const mediumMaturityCount = requirements.filter(r => 
      (r.maturityLevel?.score || 0) === 3
    ).length;
    
    if (mediumMaturityCount > 0) {
      roadmapItems.push({
        phase: 'Phase 2: Foundation Building',
        duration: '4-8 months',
        priority: 'Medium',
        description: `Advance ${mediumMaturityCount} requirements from Defined to Managed level`,
        items: requirements.filter(r => (r.maturityLevel?.score || 0) === 3).slice(0, 5),
        icon: TrendingUp,
        color: 'bg-blue-500'
      });
    }

    // Advanced maturity improvements
    const highMaturityCount = requirements.filter(r => 
      (r.maturityLevel?.score || 0) >= 4
    ).length;
    
    if (highMaturityCount > 0) {
      roadmapItems.push({
        phase: 'Phase 3: Excellence',
        duration: '6-12 months',
        priority: 'Low',
        description: `Optimize ${highMaturityCount} advanced requirements for continuous improvement`,
        items: requirements.filter(r => (r.maturityLevel?.score || 0) >= 4).slice(0, 5),
        icon: Award,
        color: 'bg-purple-500'
      });
    }

    return roadmapItems;
  }, [requirements, maturityMetrics]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 flex items-center">
              <Gauge className="h-6 w-6 mr-3 text-purple-500" />
              Capability Maturity Assessment
            </h3>
            <p className="text-gray-600 mt-1">Organisational maturity tracking and improvement roadmap</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowRoadmap(!showRoadmap)}
              className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                showRoadmap ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {showRoadmap ? 'Hide' : 'Show'} Roadmap
            </button>
            <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Download className="h-4 w-4 mr-2" />
              Export Analysis
            </button>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Gauge className="h-5 w-5 text-purple-600" />
              <span className="text-xs text-purple-600 font-medium">AVG</span>
            </div>
            <div className="text-2xl font-bold text-purple-900">
              {maturityMetrics.averageMaturity.toFixed(1)}
            </div>
            <div className="text-xs text-purple-700">Average Maturity</div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="h-5 w-5 text-blue-600" />
              <span className="text-xs text-blue-600 font-medium">ASSESSED</span>
            </div>
            <div className="text-2xl font-bold text-blue-900">
              {maturityMetrics.totalAssessed}
            </div>
            <div className="text-xs text-blue-700">
              {requirements.length ? ((maturityMetrics.totalAssessed / requirements.length) * 100).toFixed(0) : 0}% of total
            </div>
          </div>

          <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span className="text-xs text-red-600 font-medium">LOW</span>
            </div>
            <div className="text-2xl font-bold text-red-900">
              {maturityMetrics.lowMaturityCount}
            </div>
            <div className="text-xs text-red-700">Initial/Developing</div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Target className="h-5 w-5 text-green-600" />
              <span className="text-xs text-green-600 font-medium">PRIORITY</span>
            </div>
            <div className="text-2xl font-bold text-green-900">
              {maturityMetrics.highValueLowMaturity}
            </div>
            <div className="text-xs text-green-700">High Value + Low Maturity</div>
          </div>

          <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <BarChart3 className="h-5 w-5 text-orange-600" />
              <span className="text-xs text-white font-medium">AREAS</span>
            </div>
            <div className="text-2xl font-bold text-orange-900">
              {Object.keys(maturityMetrics.categoryMaturity || {}).length}
            </div>
            <div className="text-xs text-orange-700">Capability Areas</div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Maturity Distribution */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Maturity Distribution</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData.maturityDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="level" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [value, name === 'count' ? 'Requirements' : name]}
                labelFormatter={(label) => `Maturity Level: ${label}`}
              />
              <Bar dataKey="count" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
          
          {/* Maturity Level Legend */}
          <div className="mt-4 space-y-2">
            {chartData.maturityDistribution.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="font-medium">{item.level}</span>
                </div>
                <div className="text-right">
                  <div className="font-bold">{item.count}</div>
                  <div className="text-xs text-gray-500">{item.percentage}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Radar Chart */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Maturity by Category</h4>
          {chartData.categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={chartData.categoryData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="category" tick={{ fontSize: 10 }} />
                <PolarRadiusAxis domain={[0, 5]} tick={{ fontSize: 10 }} />
                <Radar
                  name="Maturity Level"
                  dataKey="maturity"
                  stroke="#8b5cf6"
                  fill="#8b5cf6"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
                <Tooltip 
                  formatter={(value, name) => [`${value}/5`, 'Avg Maturity']}
                  labelFormatter={(label) => {
                    const item = chartData.categoryData.find(d => d.category === label);
                    return `${item?.fullCategory || label} (${item?.count} reqs)`;
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Not enough data for category analysis</p>
            </div>
          )}
        </div>
      </div>

      {/* Improvement Roadmap */}
      {showRoadmap && improvementRoadmap.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <Lightbulb className="h-5 w-5 mr-2 text-yellow-500" />
            Maturity Improvement Roadmap
          </h4>
          <div className="space-y-6">
            {improvementRoadmap.map((phase, index) => (
              <div key={index} className="relative">
                {/* Timeline connector */}
                {index < improvementRoadmap.length - 1 && (
                  <div className="absolute left-4 top-12 w-0.5 h-20 bg-gray-300"></div>
                )}
                
                <div className="flex items-start space-x-4">
                  <div className={`flex-shrink-0 w-8 h-8 ${phase.color} text-white rounded-full flex items-center justify-center`}>
                    <phase.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-semibold text-gray-900">{phase.phase}</h5>
                      <div className="flex items-center space-x-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          phase.priority === 'High' ? 'bg-red-100 text-red-800' :
                          phase.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {phase.priority}
                        </span>
                        <span className="text-xs text-gray-600 bg-gray-200 px-2 py-1 rounded-full">
                          {phase.duration}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 mb-3">{phase.description}</p>
                    
                    {/* Sample requirements */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {phase.items.map((req) => (
                        <div 
                          key={req.id}
                          className="text-xs p-2 bg-white rounded border hover:shadow-sm cursor-pointer"
                          onClick={() => onViewRequirement(req)}
                        >
                          <div className="font-medium text-gray-900">{req.id}</div>
                          <div className="text-gray-600 truncate">{req.category}</div>
                          {req.maturityLevel && (
                            <div className="mt-1">
                              <MaturityIndicator 
                                level={req.maturityLevel.level} 
                                score={req.maturityLevel.score} 
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Requirements List */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-lg font-semibold text-gray-900">Maturity Assessment Details</h4>
          <div className="flex items-center space-x-3">
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="text-sm border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Requirements</option>
              <option value="low-maturity">Low Maturity (≤2)</option>
              <option value="high-value-low-maturity">High Value + Low Maturity</option>
              <option value="unassessed">Unassessed</option>
            </select>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="text-sm border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Levels</option>
              {Object.values(MATURITY_LEVELS).map(level => (
                <option key={level.level} value={level.level}>{level.level}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requirement</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Maturity</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Business Value</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRequirements.slice(0, 20).map((requirement) => (
                <tr key={requirement.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{requirement.id}</div>
                        <div className="text-xs text-gray-500 max-w-32 truncate">{requirement.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 max-w-32 truncate">{requirement.category}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {requirement.maturityLevel ? (
                      <MaturityIndicator 
                        level={requirement.maturityLevel.level} 
                        score={requirement.maturityLevel.score} 
                      />
                    ) : (
                      <span className="text-sm text-gray-400">Not assessed</span>
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-500 mr-1" />
                      <span className="text-sm font-medium">{requirement.businessValueScore || 'N/A'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      requirement.priority === 'Critical' ? 'bg-red-100 text-red-800' :
                      requirement.priority === 'High' ? 'bg-orange-100 text-orange-800' :
                      requirement.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {requirement.priority}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => onViewRequirement(requirement)}
                      className="text-blue-600 hover:text-blue-900"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredRequirements.length > 20 && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">
              Showing 20 of {filteredRequirements.length} requirements
            </p>
          </div>
        )}

        {filteredRequirements.length === 0 && (
          <div className="text-center py-8">
            <Gauge className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Requirements Found</h3>
            <p className="text-gray-600">Try adjusting your filters to see more results.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MaturityAnalysisView;