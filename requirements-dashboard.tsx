import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from 'recharts';
import { Upload, Filter, Search, Download, AlertTriangle, CheckCircle, Clock, FileText, Shield, Zap, TrendingUp, Users, Database, Settings, Bell, Eye } from 'lucide-react';

const RequirementsDashboard = () => {
  // Mock data based on the uploaded file structure
  const [requirements, setRequirements] = useState([]);
  const [filters, setFilters] = useState({
    area: '',
    type: '',
    category: '',
    cafPrinciple: '',
    status: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProject, setSelectedProject] = useState('Network Segmentation');
  const [viewMode, setViewMode] = useState('overview');

  // Initialize mock data
  useEffect(() => {
    const mockRequirements = [
      {
        id: 'BR-F1',
        area: 'Business',
        type: 'Functional',
        category: 'Network Architecture & Design',
        description: 'Implement network segmentation to isolate OT networks from IT networks and external threats.',
        cafPrinciple: 'B4: System security',
        nisReference: 'NIS Regulation 10(2)(a) - Appropriate measures to prevent and minimise impact',
        status: 'In Progress',
        priority: 'High',
        assignee: 'Security Team',
        dueDate: '2025-07-15',
        progress: 65,
        riskLevel: 'Medium',
        lastUpdated: '2025-06-01'
      },
      {
        id: 'BR-F2',
        area: 'Business',
        type: 'Functional',
        category: 'Secure Data Flow',
        description: 'Establish secure communication channels between different network segments while maintaining operational efficiency.',
        cafPrinciple: 'B2: Identity and access control',
        nisReference: 'NIS Regulation 10(2)(b) - Security of network and information systems',
        status: 'Completed',
        priority: 'High',
        assignee: 'Network Team',
        dueDate: '2025-06-30',
        progress: 100,
        riskLevel: 'Low',
        lastUpdated: '2025-05-28'
      },
      {
        id: 'UR-F1',
        area: 'User',
        type: 'Functional',
        category: 'Access Control & Authentication',
        description: 'Implement access controls to restrict unauthorised lateral movement within the OT network.',
        cafPrinciple: 'B2: Identity and access control',
        nisReference: 'NIS Regulation 10(2)(c) - Protection against cyber attacks',
        status: 'Not Started',
        priority: 'High',
        assignee: 'Identity Team',
        dueDate: '2025-08-15',
        progress: 0,
        riskLevel: 'High',
        lastUpdated: '2025-06-01'
      }
    ];

    // Generate more requirements based on the file structure
    const areas = ['Business', 'User', 'System', 'Infrastructure'];
    const types = ['Functional', 'Non-Functional'];
    const categories = [
      'Network Architecture & Design', 'Secure Data Flow', 'Access Control & Authentication',
      'Monitoring & Detection', 'Device & Firmware Management', 'Remote Access',
      'Incident Response', 'Integration Capabilities', 'Backup & Recovery'
    ];
    const cafPrinciples = [
      'A1: Governance', 'A2: Risk management', 'A3: Asset management', 'A4: Supply chain',
      'B1: Service protection policies', 'B2: Identity and access control', 'B3: Data security',
      'B4: System security', 'C1: Security monitoring', 'C2: Proactive security event discovery',
      'D1: Response and recovery planning', 'D2: Lessons learned'
    ];

    const additionalRequirements = [];
    for (let i = 4; i <= 50; i++) {
      const area = areas[Math.floor(Math.random() * areas.length)];
      const type = types[Math.floor(Math.random() * types.length)];
      const category = categories[Math.floor(Math.random() * categories.length)];
      const cafPrinciple = cafPrinciples[Math.floor(Math.random() * cafPrinciples.length)];
      const statuses = ['Not Started', 'In Progress', 'Completed', 'On Hold'];
      const priorities = ['Low', 'Medium', 'High', 'Critical'];
      const risks = ['Low', 'Medium', 'High'];
      
      additionalRequirements.push({
        id: `${area.substring(0, 2).toUpperCase()}-${type.substring(0, 1)}${i}`,
        area,
        type,
        category,
        description: `${category} requirement for ${area.toLowerCase()} stakeholders focusing on ${type.toLowerCase()} aspects.`,
        cafPrinciple,
        nisReference: `NIS Regulation 10(2)(${String.fromCharCode(97 + (i % 3))}) - Security requirement`,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        priority: priorities[Math.floor(Math.random() * priorities.length)],
        assignee: ['Security Team', 'Network Team', 'Identity Team', 'Operations Team'][Math.floor(Math.random() * 4)],
        dueDate: new Date(2025, 5 + Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
        progress: Math.floor(Math.random() * 101),
        riskLevel: risks[Math.floor(Math.random() * risks.length)],
        lastUpdated: new Date(2025, 4, Math.floor(Math.random() * 30) + 1).toISOString().split('T')[0]
      });
    }

    setRequirements([...mockRequirements, ...additionalRequirements]);
  }, []);

  // Filtered and searched requirements
  const filteredRequirements = useMemo(() => {
    return requirements.filter(req => {
      const matchesSearch = req.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          req.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          req.category.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilters = 
        (!filters.area || req.area === filters.area) &&
        (!filters.type || req.type === filters.type) &&
        (!filters.category || req.category === filters.category) &&
        (!filters.cafPrinciple || req.cafPrinciple === filters.cafPrinciple) &&
        (!filters.status || req.status === filters.status);

      return matchesSearch && matchesFilters;
    });
  }, [requirements, filters, searchTerm]);

  // Analytics data
  const analyticsData = useMemo(() => {
    const statusCounts = requirements.reduce((acc, req) => {
      acc[req.status] = (acc[req.status] || 0) + 1;
      return acc;
    }, {});

    const areaCounts = requirements.reduce((acc, req) => {
      acc[req.area] = (acc[req.area] || 0) + 1;
      return acc;
    }, {});

    const riskCounts = requirements.reduce((acc, req) => {
      acc[req.riskLevel] = (acc[req.riskLevel] || 0) + 1;
      return acc;
    }, {});

    const cafCompliance = requirements.reduce((acc, req) => {
      const principle = req.cafPrinciple.split(':')[0];
      if (!acc[principle]) acc[principle] = { total: 0, completed: 0 };
      acc[principle].total++;
      if (req.status === 'Completed') acc[principle].completed++;
      return acc;
    }, {});

    return {
      statusData: Object.entries(statusCounts).map(([status, count]) => ({ status, count })),
      areaData: Object.entries(areaCounts).map(([area, count]) => ({ area, count })),
      riskData: Object.entries(riskCounts).map(([risk, count]) => ({ risk, count })),
      cafComplianceData: Object.entries(cafCompliance).map(([principle, data]) => ({
        principle,
        compliance: Math.round((data.completed / data.total) * 100),
        total: data.total,
        completed: data.completed
      }))
    };
  }, [requirements]);

  const COLORS = {
    'Not Started': '#ef4444',
    'In Progress': '#f59e0b',
    'Completed': '#10b981',
    'On Hold': '#6b7280',
    'Low': '#10b981',
    'Medium': '#f59e0b',
    'High': '#ef4444',
    'Critical': '#dc2626'
  };

  const StatCard = ({ title, value, icon: Icon, color = "blue", trend = null }) => (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4" style={{ borderLeftColor: color }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend && (
            <p className={`text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend > 0 ? '+' : ''}{trend}% from last month
            </p>
          )}
        </div>
        <Icon className="h-8 w-8" style={{ color }} />
      </div>
    </div>
  );

  const RegulatoryContext = () => (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-6 border border-blue-200">
      <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
        <Shield className="h-5 w-5 mr-2" />
        Regulatory Compliance Context
      </h3>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white rounded p-4 border border-blue-100">
          <h4 className="font-medium text-gray-900 mb-2">Ofgem Framework</h4>
          <p className="text-sm text-gray-600 mb-2">
            This project aligns with Ofgem's strategic network investment framework, supporting the transition to clean power by 2030 and ensuring regulatory compliance for essential infrastructure projects.
          </p>
          <div className="text-xs text-blue-600">
            • Strategic Network Planning Compliance<br/>
            • Investment Approval Framework<br/>
            • Essential Infrastructure Requirements
          </div>
        </div>
        <div className="bg-white rounded p-4 border border-blue-100">
          <h4 className="font-medium text-gray-900 mb-2">NCSC CAF Guidance</h4>
          <p className="text-sm text-gray-600 mb-2">
            Requirements mapped to NCSC Cyber Assessment Framework principles for OES compliance, focusing on managing security risk, protecting against cyber attacks, detecting cyber events, and minimising cyber incidents.
          </p>
          <div className="text-xs text-blue-600">
            • OES Regulatory Compliance<br/>
            • Outcome-focused Security<br/>
            • NIS Regulation Alignment
          </div>
        </div>
      </div>
    </div>
  );

  const TraceabilityView = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
          Requirements Traceability Matrix
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Req ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Business Need</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">CAF Principle</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">NIS Reference</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Evidence</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRequirements.slice(0, 10).map((req) => (
                <tr key={req.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{req.id}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{req.category}</td>
                  <td className="px-4 py-3 text-sm text-blue-600">{req.cafPrinciple}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{req.nisReference}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      req.status === 'Completed' ? 'bg-green-100 text-green-800' :
                      req.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                      req.status === 'On Hold' ? 'bg-gray-100 text-gray-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button className="text-blue-600 hover:text-blue-800">
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">OT Requirements Management Dashboard</h1>
              <p className="text-sm text-gray-600">Project: {selectedProject}</p>
            </div>
            <div className="flex space-x-3">
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <Upload className="h-4 w-4 mr-2" />
                Upload Requirements
              </button>
              <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', name: 'Overview', icon: TrendingUp },
              { id: 'requirements', name: 'Requirements', icon: FileText },
              { id: 'compliance', name: 'CAF Compliance', icon: Shield },
              { id: 'traceability', name: 'Traceability', icon: Database },
              { id: 'analytics', name: 'Analytics', icon: BarChart }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setViewMode(tab.id)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  viewMode === tab.id
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

        {/* Regulatory Context */}
        <RegulatoryContext />

        {/* Overview View */}
        {viewMode === 'overview' && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Requirements"
                value={requirements.length}
                icon={FileText}
                color="#3b82f6"
                trend={12}
              />
              <StatCard
                title="Completed"
                value={requirements.filter(r => r.status === 'Completed').length}
                icon={CheckCircle}
                color="#10b981"
                trend={8}
              />
              <StatCard
                title="In Progress"
                value={requirements.filter(r => r.status === 'In Progress').length}
                icon={Clock}
                color="#f59e0b"
                trend={-3}
              />
              <StatCard
                title="High Risk"
                value={requirements.filter(r => r.riskLevel === 'High').length}
                icon={AlertTriangle}
                color="#ef4444"
                trend={-15}
              />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Requirements by Status</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analyticsData.statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ status, count }) => `${status}: ${count}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {analyticsData.statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[entry.status]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Requirements by Area</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData.areaData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="area" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* CAF Compliance Overview */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Shield className="h-5 w-5 mr-2 text-blue-600" />
                CAF Compliance Progress
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={analyticsData.cafComplianceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="principle" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value}%`, 'Compliance']} />
                  <Area type="monotone" dataKey="compliance" stroke="#3b82f6" fill="#93c5fd" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Requirements View */}
        {viewMode === 'requirements' && (
          <div className="space-y-6">
            {/* Filters and Search */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex flex-wrap gap-4 items-center mb-4">
                <div className="flex-1 min-w-64">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search requirements..."
                      className="pl-10 w-full border border-gray-300 rounded-md py-2 px-3"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <select
                  className="border border-gray-300 rounded-md py-2 px-3"
                  value={filters.area}
                  onChange={(e) => setFilters({...filters, area: e.target.value})}
                >
                  <option value="">All Areas</option>
                  <option value="Business">Business</option>
                  <option value="User">User</option>
                  <option value="System">System</option>
                  <option value="Infrastructure">Infrastructure</option>
                </select>
                <select
                  className="border border-gray-300 rounded-md py-2 px-3"
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                >
                  <option value="">All Statuses</option>
                  <option value="Not Started">Not Started</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="On Hold">On Hold</option>
                </select>
                <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                  <Filter className="h-4 w-4 mr-2" />
                  More Filters
                </button>
              </div>

              {/* Requirements Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Requirement
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Progress
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Risk
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Assignee
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Due Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredRequirements.map((requirement) => (
                      <tr key={requirement.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{requirement.id}</div>
                            <div className="text-sm text-gray-500 max-w-xs truncate">{requirement.description}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{requirement.category}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            requirement.status === 'Completed' ? 'bg-green-100 text-green-800' :
                            requirement.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                            requirement.status === 'On Hold' ? 'bg-gray-100 text-gray-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {requirement.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${requirement.progress}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600">{requirement.progress}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            requirement.riskLevel === 'Low' ? 'bg-green-100 text-green-800' :
                            requirement.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {requirement.riskLevel}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{requirement.assignee}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{requirement.dueDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* CAF Compliance View */}
        {viewMode === 'compliance' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Shield className="h-5 w-5 mr-2 text-blue-600" />
                NCSC CAF Compliance Assessment
              </h3>
              
              {/* CAF Objectives Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[
                  { objective: 'A: Managing Security Risk', principles: ['A1: Governance', 'A2: Risk management', 'A3: Asset management', 'A4: Supply chain'], color: 'blue' },
                  { objective: 'B: Protecting Against Cyber Attack', principles: ['B1: Service protection', 'B2: Identity and access', 'B3: Data security', 'B4: System security'], color: 'green' },
                  { objective: 'C: Detecting Cyber Security Events', principles: ['C1: Security monitoring', 'C2: Proactive discovery'], color: 'yellow' },
                  { objective: 'D: Minimising Impact of Incidents', principles: ['D1: Response planning', 'D2: Lessons learned'], color: 'red' }
                ].map((obj, index) => (
                  <div key={index} className={`border-l-4 border-${obj.color}-500 bg-${obj.color}-50 p-4 rounded`}>
                    <h4 className="font-medium text-gray-900 mb-2">{obj.objective}</h4>
                    <div className="space-y-1">
                      {obj.principles.map((principle, pIndex) => {
                        const compliance = analyticsData.cafComplianceData.find(c => 
                          principle.includes(c.principle)
                        )?.compliance || Math.floor(Math.random() * 100);
                        
                        return (
                          <div key={pIndex} className="flex justify-between items-center">
                            <span className="text-xs text-gray-600">{principle}</span>
                            <span className={`text-xs font-medium ${
                              compliance >= 80 ? 'text-green-600' :
                              compliance >= 60 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {compliance}%
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* CAF Assessment Insights */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-3">Assessment Insights & Recommendations</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Strengths</h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Strong governance framework implementation</li>
                      <li>• Comprehensive asset management processes</li>
                      <li>• Effective incident response planning</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Areas for Improvement</h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Enhanced proactive security monitoring</li>
                      <li>• Strengthened supply chain security</li>
                      <li>• Improved lessons learned processes</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Traceability View */}
        {viewMode === 'traceability' && <TraceabilityView />}

        {/* Analytics View */}
        {viewMode === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Risk Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analyticsData.riskData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ risk, count }) => `${risk}: ${count}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {analyticsData.riskData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[entry.risk]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Progress Trends</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={[
                    { month: 'Jan', completed: 15, inProgress: 25, notStarted: 35 },
                    { month: 'Feb', completed: 22, inProgress: 28, notStarted: 30 },
                    { month: 'Mar', completed: 35, inProgress: 25, notStarted: 25 },
                    { month: 'Apr', completed: 42, inProgress: 22, notStarted: 20 },
                    { month: 'May', completed: 48, inProgress: 20, notStarted: 15 },
                    { month: 'Jun', completed: 52, inProgress: 18, notStarted: 12 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={2} />
                    <Line type="monotone" dataKey="inProgress" stroke="#f59e0b" strokeWidth={2} />
                    <Line type="monotone" dataKey="notStarted" stroke="#ef4444" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Advanced Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h4 className="font-medium text-gray-900 mb-3">Velocity Metrics</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Avg. Completion Time</span>
                    <span className="text-sm font-medium">23 days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Requirements/Week</span>
                    <span className="text-sm font-medium">3.2</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Cycle Time</span>
                    <span className="text-sm font-medium">18 days</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h4 className="font-medium text-gray-900 mb-3">Quality Metrics</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Defect Rate</span>
                    <span className="text-sm font-medium text-green-600">2.1%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Rework Rate</span>
                    <span className="text-sm font-medium text-yellow-600">8.5%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Review Coverage</span>
                    <span className="text-sm font-medium text-green-600">94%</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h4 className="font-medium text-gray-900 mb-3">Team Performance</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Security Team</span>
                    <span className="text-sm font-medium text-green-600">92%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Network Team</span>
                    <span className="text-sm font-medium text-green-600">88%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Identity Team</span>
                    <span className="text-sm font-medium text-yellow-600">76%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RequirementsDashboard;