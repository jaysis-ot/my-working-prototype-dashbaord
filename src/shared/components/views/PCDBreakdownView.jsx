// src/components/views/PCDBreakdownView.jsx
import React, { useState } from 'react';
import { 
  Building2, FileText, DollarSign, Calendar, Users, Target, 
  AlertTriangle, TrendingUp, Shield, Lock, Network, CheckCircle,
  BarChart3, PieChart, Download, Edit, Plus
} from 'lucide-react';

const PCDBreakdownView = ({ pcdData, capabilities, selectedPCD, onSelectPCD }) => {
  const [activeTab, setActiveTab] = useState('overview');

  if (!selectedPCD || !pcdData[selectedPCD]) {
    return (
      <div className="space-y-6">
        {/* PCD Selection Header */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                <Building2 className="h-6 w-6 mr-3 text-blue-600" />
                Project Control Document (PCD) Breakdown
              </h3>
              <p className="text-gray-600 mt-1">Comprehensive business case and project documentation</p>
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={selectedPCD || ''}
                onChange={(e) => onSelectPCD(e.target.value)}
                className="border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select PCD</option>
                {Object.keys(pcdData).map(pcdId => (
                  <option key={pcdId} value={pcdId}>
                    {pcdId} - {pcdData[pcdId]?.title}
                  </option>
                ))}
              </select>
              <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Plus className="h-4 w-4 mr-2" />
                New PCD
              </button>
            </div>
          </div>

          {/* Empty State */}
          <div className="text-center py-12">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Select a PCD to View Details</h3>
            <p className="text-gray-600">Choose a Project Control Document from the dropdown above to view its comprehensive breakdown.</p>
          </div>
        </div>
      </div>
    );
  }

  const pcd = pcdData[selectedPCD];

  return (
    <div className="space-y-6">
      {/* PCD Header */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 flex items-center">
              <Building2 className="h-6 w-6 mr-3 text-blue-600" />
              Project Control Document (PCD) Breakdown
            </h3>
            <p className="text-gray-600 mt-1">Comprehensive business case and project documentation</p>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={selectedPCD}
              onChange={(e) => onSelectPCD(e.target.value)}
              className="border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select PCD</option>
              {Object.keys(pcdData).map(pcdId => (
                <option key={pcdId} value={pcdId}>
                  {pcdId} - {pcdData[pcdId]?.title}
                </option>
              ))}
            </select>
            <button className="flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </button>
            <button className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
          </div>
        </div>

        {/* Executive Summary Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h4 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Executive Summary
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium text-blue-800">PCD ID:</span>
              <span className="ml-2 text-blue-700">{pcd.id}</span>
            </div>
            <div>
              <span className="font-medium text-blue-800">Title:</span>
              <span className="ml-2 text-blue-700">{pcd.title}</span>
            </div>
            <div>
              <span className="font-medium text-blue-800">Delivery Date:</span>
              <span className="ml-2 text-blue-700">{pcd.pcdOverview?.deliveryDate}</span>
            </div>
            <div>
              <span className="font-medium text-blue-800">Total Allowance:</span>
              <span className="ml-2 text-blue-700">{pcd.pcdOverview?.allowance}</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', name: 'Overview', icon: FileText },
              { id: 'business', name: 'Business Case', icon: Target },
              { id: 'financial', name: 'Financial', icon: DollarSign },
              { id: 'risks', name: 'Risks & CAF', icon: Shield },
              { id: 'timeline', name: 'Timeline', icon: Calendar }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* Needs Case */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Needs Case and High-Level Project Scope</h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 leading-relaxed">{pcd.needsCase}</p>
              </div>
            </div>

            {/* Business Plan */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Business Plan Submission</h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 leading-relaxed">{pcd.businessPlan}</p>
              </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <DollarSign className="h-6 w-6 text-blue-600" />
                  </div>
                  <span className="text-xs text-gray-500">3-Year Total</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  £{((pcd.forecast?.year1?.capex || 0) + (pcd.forecast?.year2?.capex || 0) + (pcd.forecast?.year3?.capex || 0)).toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Capital Expenditure</div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                  <span className="text-xs text-gray-500">3-Year Total</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  £{((pcd.forecast?.year1?.opex || 0) + (pcd.forecast?.year2?.opex || 0) + (pcd.forecast?.year3?.opex || 0)).toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Operational Expenditure</div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <Calendar className="h-6 w-6 text-purple-600" />
                  </div>
                  <span className="text-xs text-gray-500">Duration</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {pcd.highLevelPlan?.reduce((total, phase) => {
                    const months = parseInt(phase.duration.split(' ')[0]) || 0;
                    return total + months;
                  }, 0) || 0}
                </div>
                <div className="text-sm text-gray-600">Months</div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-orange-100 p-3 rounded-lg">
                    <Target className="h-6 w-6 text-orange-600" />
                  </div>
                  <span className="text-xs text-gray-500">Outcomes</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {pcd.businessOutcomes?.length || 0}
                </div>
                <div className="text-sm text-gray-600">Business Outcomes</div>
              </div>
            </div>
          </>
        )}

        {/* Business Case Tab */}
        {activeTab === 'business' && (
          <>
            {/* Business Outcomes */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Business Outcomes</h4>
              <div className="space-y-3">
                {pcd.businessOutcomes?.map((outcome, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <span className="text-gray-800">{outcome}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Project Alignment */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Alignment to Projects</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {pcd.alignmentToProjects?.map((project, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                    <Network className="h-4 w-4 text-blue-600" />
                    <span className="text-gray-800">{project}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Scope Boundary */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Scope Boundary</h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 leading-relaxed">{pcd.scopeBoundary}</p>
              </div>
            </div>

            {/* Dependencies and Assumptions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-md p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Dependencies</h4>
                <div className="space-y-2">
                  {pcd.dependencies?.map((dependency, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                      <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                      <span className="text-gray-800 text-sm">{dependency}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Assumptions</h4>
                <div className="space-y-2">
                  {pcd.assumptions?.map((assumption, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                      <span className="text-gray-800 text-sm">{assumption}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Financial Tab */}
        {activeTab === 'financial' && (
          <>
            {/* Cost Forecast Chart */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">3-Year Financial Forecast</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {[1, 2, 3].map(year => (
                  <div key={year} className="bg-gray-50 rounded-lg p-4">
                    <div className="text-center mb-3">
                      <h5 className="font-semibold text-gray-900">Year {year}</h5>
                      <p className="text-xs text-gray-600">{pcd.forecast?.[`year${year}`]?.description}</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">CAPEX:</span>
                        <span className="font-medium">£{(pcd.forecast?.[`year${year}`]?.capex || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">OPEX:</span>
                        <span className="font-medium">£{(pcd.forecast?.[`year${year}`]?.opex || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="text-sm font-medium text-gray-900">Total:</span>
                        <span className="font-bold">£{((pcd.forecast?.[`year${year}`]?.capex || 0) + (pcd.forecast?.[`year${year}`]?.opex || 0)).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cost Assumptions Table */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Cost Assumptions</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 border border-gray-300 rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role/Item</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Year 1 (£)</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Year 2 (£)</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Year 3 (£)</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total (£)</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {pcd.costAssumptions?.map((cost, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{cost.roleItem}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">£{cost.year1?.toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">£{cost.year2?.toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">£{cost.year3?.toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          £{(cost.year1 + cost.year2 + cost.year3).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Basis of Cost */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Basis of Cost</h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <pre className="text-gray-700 text-sm whitespace-pre-wrap font-sans leading-relaxed">
                  {pcd.basisOfCost}
                </pre>
              </div>
            </div>
          </>
        )}

        {/* Risks & CAF Tab */}
        {activeTab === 'risks' && (
          <>
            {/* Key Risks */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Key Risks & Opportunities</h4>
              <div className="space-y-4">
                {pcd.keyRisks?.map((risk, index) => (
                  <div key={index} className={`p-4 rounded-lg border-l-4 ${
                    risk.type === 'Risk' ? 'bg-red-50 border-red-400' : 'bg-green-50 border-green-400'
                  }`}>
                    <div className="flex items-start justify-between mb-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        risk.type === 'Risk' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {risk.type}
                      </span>
                      <span className={`text-xs font-medium ${
                        risk.impact === 'High' ? 'text-red-600' : 
                        risk.impact === 'Medium' ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {risk.impact} Impact
                      </span>
                    </div>
                    <p className="text-gray-800 font-medium mb-2">{risk.description}</p>
                    <p className="text-gray-600 text-sm"><strong>Approach:</strong> {risk.approach}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* CAF Alignment */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">NCSC CAF Alignment</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">NIST Function</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">CAF Control Area</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Key Control Gaps</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Control Improvement</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Positive Contribution</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {pcd.cafAlignment?.map((alignment, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-blue-600">{alignment.nistFunction}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{alignment.cafControlArea}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{alignment.keyControlGaps}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{alignment.controlImprovement}</td>
                        <td className="px-4 py-3 text-sm text-green-700">{alignment.positiveContribution}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Risk Table */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Risk Assessment Table</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Primary Risk</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Threat Family</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Scenario</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Control Narrative</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Risk Reduction</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {pcd.riskTable?.map((riskItem, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-red-600">{riskItem.primaryRisk}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{riskItem.threatFamily}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{riskItem.scenario}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{riskItem.controlNarrative}</td>
                        <td className="px-4 py-3 text-sm text-green-700 font-medium">{riskItem.riskReduction}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Timeline Tab */}
        {activeTab === 'timeline' && (
          <>
            {/* High Level Plan */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-6">High-Level Implementation Plan</h4>
              <div className="space-y-6">
                {pcd.highLevelPlan?.map((phase, index) => (
                  <div key={index} className="relative">
                    {/* Timeline connector */}
                    {index < pcd.highLevelPlan.length - 1 && (
                      <div className="absolute left-4 top-12 w-0.5 h-16 bg-gray-300"></div>
                    )}
                    
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <div className="flex-1 bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-semibold text-gray-900">{phase.phase}</h5>
                          <span className="text-sm text-gray-600 bg-gray-200 px-2 py-1 rounded-full">
                            {phase.duration}
                          </span>
                        </div>
                        <div className="text-sm text-gray-700">
                          <p className="mb-2"><strong>Key Activities:</strong></p>
                          <ul className="list-disc list-inside space-y-1">
                            {phase.activities?.map((activity, actIndex) => (
                              <li key={actIndex}>{activity}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline Summary */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Timeline Summary</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 mb-2">
                    {pcd.highLevelPlan?.reduce((total, phase) => {
                      const months = parseInt(phase.duration.split(' ')[0]) || 0;
                      return total + months;
                    }, 0) || 0}
                  </div>
                  <div className="text-sm text-blue-800">Total Duration (Months)</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 mb-2">
                    {pcd.highLevelPlan?.length || 0}
                  </div>
                  <div className="text-sm text-green-800">Implementation Phases</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600 mb-2">
                    {pcd.pcdOverview?.deliveryDate ? new Date(pcd.pcdOverview.deliveryDate).getFullYear() : 'TBD'}
                  </div>
                  <div className="text-sm text-purple-800">Target Delivery Year</div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PCDBreakdownView;