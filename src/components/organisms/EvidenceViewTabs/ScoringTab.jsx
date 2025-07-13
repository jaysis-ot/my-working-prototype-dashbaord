import React, { useState, useMemo } from 'react';
import Badge from '../../atoms/Badge';
import Button from '../../atoms/Button';

/**
 * ScoringTab Component
 * 
 * Displays ML-driven evidence quality scoring across multiple dimensions,
 * with improvement suggestions and decay predictions.
 */
const ScoringTab = () => {
  /* ------------------------------------------------------------------
   * Mock evidence items & scoring data for demo purposes
   * ------------------------------------------------------------------ */
  const mockEvidenceItems = [
    { 
      id: 'ev-001', 
      title: 'Access Control Policy', 
      type: 'Intent', 
      status: 'fresh',
      date: '01/06/2025'
    },
    { 
      id: 'ev-002', 
      title: 'MFA Implementation', 
      type: 'Implementation', 
      status: 'aging',
      date: '15/05/2025'
    },
    { 
      id: 'ev-003', 
      title: 'MFA Usage Metrics', 
      type: 'Behavioral', 
      status: 'fresh',
      date: '01/07/2025'
    },
    { 
      id: 'ev-004', 
      title: 'Access Control Audit', 
      type: 'Validation', 
      status: 'fresh',
      date: '20/06/2025'
    },
    { 
      id: 'ev-005', 
      title: 'Data Encryption Policy', 
      type: 'Intent', 
      status: 'aging',
      date: '10/01/2025'
    },
    { 
      id: 'ev-006', 
      title: 'Database Encryption Implementation', 
      type: 'Implementation', 
      status: 'aging',
      date: '15/02/2025'
    },
    { 
      id: 'ev-007', 
      title: 'Encryption Effectiveness Assessment', 
      type: 'Validation', 
      status: 'stale',
      date: '05/11/2024'
    },
    { 
      id: 'ev-008', 
      title: 'Legacy System Encryption Road-Map', 
      type: 'Intent', 
      status: 'fresh',
      date: '05/08/2025'
    },
    { 
      id: 'ev-009', 
      title: 'Quarterly Access Review - Q4 2024', 
      type: 'Behavioral', 
      status: 'stale',
      date: '10/10/2024'
    },
    { 
      id: 'ev-010', 
      title: 'MFA Roll-Out Post-Implementation Review', 
      type: 'Validation', 
      status: 'stale',
      date: '01/02/2024'
    }
  ];

  const mockScoresMap = {
    'ev-001': {
      overall: 79,
      forecasts: {
        oneMonth: 79,
        threeMonths: 78,
        sixMonths: 77
      },
      monthlyDecay: 0.4,
      monthsToPoor: 69,
      dimensions: { 
        completeness: 84, 
        consistency: 90, 
        integrity: 75 
      }
    },
    'ev-002': {
      overall: 72,
      forecasts: {
        oneMonth: 71,
        threeMonths: 69,
        sixMonths: 66
      },
      monthlyDecay: 0.8,
      monthsToPoor: 42,
      dimensions: { 
        completeness: 70, 
        consistency: 75, 
        integrity: 72 
      }
    },
    'ev-003': {
      overall: 88,
      forecasts: {
        oneMonth: 87,
        threeMonths: 85,
        sixMonths: 82
      },
      monthlyDecay: 0.5,
      monthsToPoor: 76,
      dimensions: { 
        completeness: 92, 
        consistency: 85, 
        integrity: 88 
      }
    },
    'ev-004': {
      overall: 82,
      forecasts: {
        oneMonth: 81,
        threeMonths: 80,
        sixMonths: 78
      },
      monthlyDecay: 0.3,
      monthsToPoor: 82,
      dimensions: { 
        completeness: 85, 
        consistency: 80, 
        integrity: 82 
      }
    },
    'ev-005': {
      overall: 68,
      forecasts: {
        oneMonth: 67,
        threeMonths: 64,
        sixMonths: 60
      },
      monthlyDecay: 1.2,
      monthsToPoor: 25,
      dimensions: { 
        completeness: 65, 
        consistency: 70, 
        integrity: 68 
      }
    },
    'ev-006': {
      overall: 65,
      forecasts: {
        oneMonth: 64,
        threeMonths: 61,
        sixMonths: 57
      },
      monthlyDecay: 1.4,
      monthsToPoor: 21,
      dimensions: { 
        completeness: 60, 
        consistency: 68, 
        integrity: 66 
      }
    },
    'ev-007': {
      overall: 48,
      forecasts: {
        oneMonth: 46,
        threeMonths: 42,
        sixMonths: 36
      },
      monthlyDecay: 2.0,
      monthsToPoor: 0,
      dimensions: { 
        completeness: 45, 
        consistency: 50, 
        integrity: 48 
      }
    },
    'ev-008': {
      overall: 85,
      forecasts: {
        oneMonth: 84,
        threeMonths: 83,
        sixMonths: 81
      },
      monthlyDecay: 0.3,
      monthsToPoor: 95,
      dimensions: { 
        completeness: 88, 
        consistency: 82, 
        integrity: 85 
      }
    },
    'ev-009': {
      overall: 52,
      forecasts: {
        oneMonth: 50,
        threeMonths: 46,
        sixMonths: 40
      },
      monthlyDecay: 1.8,
      monthsToPoor: 5,
      dimensions: { 
        completeness: 55, 
        consistency: 48, 
        integrity: 54 
      }
    },
    'ev-010': {
      overall: 45,
      forecasts: {
        oneMonth: 43,
        threeMonths: 38,
        sixMonths: 32
      },
      monthlyDecay: 2.2,
      monthsToPoor: 0,
      dimensions: { 
        completeness: 42, 
        consistency: 45, 
        integrity: 48 
      }
    }
  };

  // Mock improvement suggestions for each evidence item
  const mockImprovementSuggestions = {
    'ev-001': [
      { id: 'sug-001', category: 'Relevance', priority: 'medium', description: 'Link this evidence to specific requirements, controls, or risks to improve its relevance.' }
    ],
    'ev-002': [
      { id: 'sug-002', category: 'Completeness', priority: 'high', description: 'Add implementation details for all authentication systems.' },
      { id: 'sug-003', category: 'Consistency', priority: 'medium', description: 'Ensure terminology matches across all MFA documentation.' }
    ],
    'ev-003': [
      { id: 'sug-004', category: 'Integrity', priority: 'low', description: 'Add data source validation information.' }
    ],
    'ev-004': [
      { id: 'sug-005', category: 'Completeness', priority: 'medium', description: 'Include audit scope and methodology details.' }
    ],
    'ev-005': [
      { id: 'sug-006', category: 'Relevance', priority: 'high', description: 'Link to specific compliance requirements.' },
      { id: 'sug-007', category: 'Completeness', priority: 'medium', description: 'Add sections covering all data types.' }
    ],
    'ev-006': [
      { id: 'sug-008', category: 'Completeness', priority: 'high', description: 'Add configuration details for all database systems.' },
      { id: 'sug-009', category: 'Integrity', priority: 'medium', description: 'Include verification evidence for implementation.' }
    ],
    'ev-007': [
      { id: 'sug-010', category: 'Relevance', priority: 'high', description: 'Update assessment with current systems.' },
      { id: 'sug-011', category: 'Completeness', priority: 'high', description: 'Add missing test results and methodology.' },
      { id: 'sug-012', category: 'Consistency', priority: 'medium', description: 'Align metrics with current encryption standards.' }
    ],
    'ev-008': [
      { id: 'sug-013', category: 'Completeness', priority: 'low', description: 'Add timeline details for final migration phases.' }
    ],
    'ev-009': [
      { id: 'sug-014', category: 'Relevance', priority: 'high', description: 'Update with current user accounts and systems.' },
      { id: 'sug-015', category: 'Completeness', priority: 'high', description: 'Include all access control systems in review.' },
      { id: 'sug-016', category: 'Integrity', priority: 'medium', description: 'Add verification of review methodology.' }
    ],
    'ev-010': [
      { id: 'sug-017', category: 'Relevance', priority: 'high', description: 'Update with current MFA systems and processes.' },
      { id: 'sug-018', category: 'Completeness', priority: 'high', description: 'Add sections for all deployment phases.' },
      { id: 'sug-019', category: 'Consistency', priority: 'high', description: 'Align metrics with current MFA standards.' }
    ]
  };

  // Mock recommended actions for each evidence item
  const mockRecommendedActions = {
    'ev-001': [
      { 
        id: 'act-001', 
        title: 'Enhance policy document with missing sections', 
        subtitle: 'High impact on completeness', 
        effort: 'Medium',
        impact: 'High',
        tags: ['Completeness', 'Verifiability']
      },
      { 
        id: 'act-002', 
        title: 'Link evidence to specific requirements and controls', 
        subtitle: 'Direct improvement to relevance score', 
        effort: 'Low',
        impact: 'Medium',
        tags: ['Relevance', 'Consistency']
      }
    ],
    'ev-002': [
      { 
        id: 'act-003', 
        title: 'Document MFA configuration for all systems', 
        subtitle: 'Addresses gaps in implementation evidence', 
        effort: 'Medium',
        impact: 'High',
        tags: ['Completeness', 'Verifiability']
      }
    ],
    'ev-003': [
      { 
        id: 'act-004', 
        title: 'Add supporting data sources and collection methodology', 
        subtitle: 'Improves verifiability of metrics', 
        effort: 'Medium',
        impact: 'Medium',
        tags: ['Integrity', 'Verifiability']
      }
    ],
    'ev-004': [
      { 
        id: 'act-005', 
        title: 'Link to specific compliance requirements', 
        subtitle: 'Improves relevance to compliance framework', 
        effort: 'Low',
        impact: 'Medium',
        tags: ['Relevance', 'Compliance']
      }
    ],
    'ev-005': [
      { 
        id: 'act-006', 
        title: 'Update policy with current encryption standards', 
        subtitle: 'Addresses relevance and completeness gaps', 
        effort: 'Medium',
        impact: 'High',
        tags: ['Relevance', 'Completeness']
      }
    ],
    'ev-006': [
      { 
        id: 'act-007', 
        title: 'Add configuration details for all database systems', 
        subtitle: 'Addresses major completeness gaps', 
        effort: 'High',
        impact: 'High',
        tags: ['Completeness', 'Verifiability']
      }
    ],
    'ev-007': [
      { 
        id: 'act-008', 
        title: 'Conduct new encryption assessment', 
        subtitle: 'Complete refresh of outdated evidence', 
        effort: 'High',
        impact: 'High',
        tags: ['Relevance', 'Completeness', 'Integrity']
      }
    ],
    'ev-008': [
      { 
        id: 'act-009', 
        title: 'Add implementation timeline details', 
        subtitle: 'Improves actionability of roadmap', 
        effort: 'Low',
        impact: 'Medium',
        tags: ['Completeness', 'Planning']
      }
    ],
    'ev-009': [
      { 
        id: 'act-010', 
        title: 'Conduct new quarterly access review', 
        subtitle: 'Complete refresh of outdated evidence', 
        effort: 'High',
        impact: 'High',
        tags: ['Relevance', 'Completeness', 'Timeliness']
      }
    ],
    'ev-010': [
      { 
        id: 'act-011', 
        title: 'Create updated post-implementation review', 
        subtitle: 'Complete refresh of outdated evidence', 
        effort: 'High',
        impact: 'High',
        tags: ['Relevance', 'Completeness', 'Timeliness']
      }
    ]
  };

  /* ------------------------------------------------------------------
   * Component state & helpers
   * ------------------------------------------------------------------ */
  const [selectedEvidenceId, setSelectedEvidenceId] = useState(null);

  // Find the selected evidence item
  const selectedEvidence = useMemo(
    () => mockEvidenceItems.find((item) => item.id === selectedEvidenceId),
    [selectedEvidenceId]
  );

  // Get scores from mock map
  const scores = selectedEvidence ? mockScoresMap[selectedEvidence.id] : null;
  
  // Get improvement suggestions for selected evidence
  const improvementSuggestions = selectedEvidence 
    ? mockImprovementSuggestions[selectedEvidence.id] || []
    : [];
    
  // Get recommended actions for selected evidence
  const recommendedActions = selectedEvidence 
    ? mockRecommendedActions[selectedEvidence.id] || []
    : [];
    
  // Helper to determine score quality label
  const getScoreQualityLabel = (score) => {
    if (score >= 75) return 'Good';
    if (score >= 60) return 'Medium';
    return 'Poor';
  };
  
  // Helper to determine score color
  const getScoreColor = (score) => {
    if (score >= 75) return '#10B981'; // green
    if (score >= 60) return '#F59E0B'; // yellow
    return '#EF4444'; // red
  };
  
  // Calculate stroke dash array for donut chart
  const calculateStrokeDashArray = (score) => {
    const circumference = 2 * Math.PI * 50; // 50 is the radius
    const dashArray = (score / 100) * circumference;
    return `${dashArray} ${circumference}`;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-secondary-800 rounded-lg border border-secondary-200 dark:border-secondary-700 p-4 mb-4">
        <p className="text-secondary-600 dark:text-secondary-400">
          Our ML-driven scoring system evaluates evidence quality across multiple dimensions.
          Select an evidence item to see detailed scoring, improvement suggestions, and decay predictions.
        </p>
      </div>
      
      {/* Evidence Selection Grid */}
      <div className="bg-white dark:bg-secondary-800 rounded-lg border border-secondary-200 dark:border-secondary-700 p-4 mb-6">
        <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">
          Select Evidence to Score
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockEvidenceItems.map(item => (
            <div 
              key={item.id}
              className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                selectedEvidenceId === item.id 
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
                  : 'border-secondary-200 dark:border-secondary-700 hover:border-primary-300'
              }`}
              onClick={() => setSelectedEvidenceId(item.id)}
            >
              <div className="flex justify-between">
                <h4 className="font-medium text-secondary-900 dark:text-white">{item.title}</h4>
                <Badge variant={item.status === 'fresh' ? 'success' : item.status === 'aging' ? 'warning' : 'error'} size="sm">
                  {item.status}
                </Badge>
              </div>
              <p className="text-sm text-secondary-600 dark:text-secondary-400 mt-1">
                {item.type} Evidence
              </p>
              <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-1">
                {item.date}
              </p>
            </div>
          ))}
        </div>
      </div>
      
      {/* Scoring Results */}
      {selectedEvidence && scores && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Score Visualization */}
          <div className="bg-white dark:bg-secondary-800 rounded-lg border border-secondary-200 dark:border-secondary-700 p-6">
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-6">
              Evidence Quality Score
            </h3>
            
            {/* Donut Chart */}
            <div className="flex justify-center mb-6">
              <div className="relative w-48 h-48">
                {/* Background circle */}
                <svg className="w-full h-full" viewBox="0 0 120 120">
                  <circle 
                    cx="60" 
                    cy="60" 
                    r="50" 
                    fill="none" 
                    stroke="#E2E8F0" 
                    strokeWidth="10" 
                  />
                  {/* Score arc */}
                  <circle 
                    cx="60" 
                    cy="60" 
                    r="50" 
                    fill="none" 
                    stroke={getScoreColor(scores.overall)} 
                    strokeWidth="10" 
                    strokeDasharray={calculateStrokeDashArray(scores.overall)} 
                    strokeLinecap="round" 
                    transform="rotate(-90 60 60)" 
                  />
                </svg>
                
                {/* Center text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold text-secondary-900 dark:text-white">
                    {scores.overall}
                  </span>
                  <span className="text-sm text-secondary-600 dark:text-secondary-400">
                    {getScoreQualityLabel(scores.overall)}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Forecast Values */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className="text-xl font-semibold text-secondary-900 dark:text-white">
                  {scores.forecasts.oneMonth}
                </div>
                <div className="text-xs text-secondary-600 dark:text-secondary-400">
                  1 Month
                </div>
              </div>
              <div className="text-center">
                <div className="text-xl font-semibold text-secondary-900 dark:text-white">
                  {scores.forecasts.threeMonths}
                </div>
                <div className="text-xs text-secondary-600 dark:text-secondary-400">
                  3 Months
                </div>
              </div>
              <div className="text-center">
                <div className="text-xl font-semibold text-secondary-900 dark:text-white">
                  {scores.forecasts.sixMonths}
                </div>
                <div className="text-xs text-secondary-600 dark:text-secondary-400">
                  6 Months
                </div>
              </div>
            </div>
            
            {/* Decay Information */}
            <div className="text-sm text-secondary-600 dark:text-secondary-400">
              This evidence decays at approximately {scores.monthlyDecay}% per month. 
              {scores.monthsToPoor > 0 
                ? ` It will reach a poor quality threshold in ${scores.monthsToPoor} months.`
                : ' It has already reached a poor quality threshold.'}
            </div>
            
            {/* Quality Dimensions */}
            <div className="mt-8">
              <h4 className="font-medium text-secondary-900 dark:text-white mb-4">
                Quality Dimensions
              </h4>
              <div className="space-y-4">
                {Object.entries(scores.dimensions).map(([dimension, score]) => (
                  <div key={dimension} className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-sm text-secondary-700 dark:text-secondary-300 capitalize">
                        {dimension}
                      </span>
                      <span className="text-sm font-medium text-secondary-900 dark:text-white">
                        {score}%
                      </span>
                    </div>
                    <div className="h-2 bg-secondary-100 dark:bg-secondary-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary-500 rounded-full" 
                        style={{ width: `${score}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Right Column - Suggestions and Actions */}
          <div className="space-y-6">
            {/* Improvement Suggestions */}
            <div className="bg-white dark:bg-secondary-800 rounded-lg border border-secondary-200 dark:border-secondary-700 p-6">
              <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">
                Improvement Suggestions
              </h3>
              
              {improvementSuggestions.length > 0 ? (
                <div className="space-y-4">
                  {improvementSuggestions.map(suggestion => (
                    <div 
                      key={suggestion.id}
                      className="border-l-4 border-l-primary-500 p-3 bg-primary-50 dark:bg-primary-900/10 rounded-r-md"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <div className="font-medium text-secondary-900 dark:text-white">
                          {suggestion.category}
                        </div>
                        <Badge 
                          variant={
                            suggestion.priority === 'high' ? 'error' : 
                            suggestion.priority === 'medium' ? 'warning' : 'success'
                          } 
                          size="sm"
                        >
                          {suggestion.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-secondary-600 dark:text-secondary-400">
                        {suggestion.description}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-secondary-600 dark:text-secondary-400">
                  No improvement suggestions available for this evidence.
                </p>
              )}
            </div>
            
            {/* Recommended Actions */}
            <div className="bg-white dark:bg-secondary-800 rounded-lg border border-secondary-200 dark:border-secondary-700 p-6">
              <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">
                Recommended Actions
              </h3>
              
              {recommendedActions.length > 0 ? (
                <div className="space-y-4">
                  {recommendedActions.map(action => (
                    <div 
                      key={action.id}
                      className="border border-secondary-200 dark:border-secondary-700 rounded-lg p-4"
                    >
                      <h4 className="font-medium text-secondary-900 dark:text-white mb-1">
                        {action.title}
                      </h4>
                      <p className="text-sm text-secondary-600 dark:text-secondary-400 mb-3">
                        {action.subtitle}
                      </p>
                      
                      <div className="flex flex-wrap gap-2 mb-3">
                        <div className="flex items-center text-xs text-secondary-600 dark:text-secondary-400">
                          <span className="font-medium mr-1">Impact:</span>
                          <Badge 
                            variant={
                              action.impact === 'High' ? 'success' : 
                              action.impact === 'Medium' ? 'warning' : 'error'
                            } 
                            size="sm"
                          >
                            {action.impact}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center text-xs text-secondary-600 dark:text-secondary-400">
                          <span className="font-medium mr-1">Effort:</span>
                          <Badge 
                            variant={
                              action.effort === 'Low' ? 'success' : 
                              action.effort === 'Medium' ? 'warning' : 'error'
                            } 
                            size="sm"
                          >
                            {action.effort}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-1">
                        {action.tags.map((tag, index) => (
                          <Badge key={index} variant="info" size="sm">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-secondary-600 dark:text-secondary-400">
                  No recommended actions available for this evidence.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScoringTab;
