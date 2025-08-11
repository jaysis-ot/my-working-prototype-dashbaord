// src/components/pages/ReportingDashboard.jsx
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  TrendingUp, 
  Shield, 
  AlertTriangle, 
  FileText, 
  Download, 
  Calendar, 
  Users, 
  Building, 
  ChevronRight, 
  Filter, 
  RefreshCw,
  CheckCircle,
  Clock,
  Star,
  DollarSign,
  Zap,
  Globe,
  Database,
  Settings,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Plus,
  X,
  Search,
  Eye
} from 'lucide-react';

const ReportingDashboard = () => {
  const navigate = useNavigate();
  const [selectedTimeframe, setSelectedTimeframe] = useState('last30');
  const [selectedStakeholder, setSelectedStakeholder] = useState('executive');
  const [refreshing, setRefreshing] = useState(false);
  const [exportFormat, setExportFormat] = useState('pdf');
  const [showTemplateLibrary, setShowTemplateLibrary] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('executive-summary');
  const [customReportBuilder, setCustomReportBuilder] = useState(false);
  const [linkedView, setLinkedView] = useState(null);
  const [selectedSections, setSelectedSections] = useState([]);
  const [searchSections, setSearchSections] = useState('');

  // Define readinessIndex locally as required
  const readinessIndex = 87;

  // Mock data that represents integration with your existing components
  const trustScoreData = useMemo(() => [
    { date: '2024-07-01', score: 78 },
    { date: '2024-07-08', score: 80 },
    { date: '2024-07-15', score: 82 },
    { date: '2024-07-22', score: 85 },
    { date: '2024-07-29', score: 83 },
    { date: '2024-08-05', score: 87 },
    { date: '2024-08-11', score: 89 },
    { date: '2024-08-18', predicted: 91 },
    { date: '2024-08-25', predicted: 93 },
  ], []);

  const riskPostureData = useMemo(() => [
    { unit: 'Finance', critical: 2, high: 5, medium: 12, low: 8 },
    { unit: 'IT', critical: 1, high: 8, medium: 15, low: 6 },
    { unit: 'Operations', critical: 0, high: 3, medium: 9, low: 12 },
    { unit: 'HR', critical: 1, high: 2, medium: 6, low: 10 },
  ], []);

  const controlEffectivenessData = useMemo(() => [
    { control: 'Access Control', maturity: 4.2, implementation: 92, evidence: 88 },
    { control: 'Encryption', maturity: 3.8, implementation: 85, evidence: 95 },
    { control: 'Monitoring', maturity: 3.5, implementation: 78, evidence: 82 },
    { control: 'IR Planning', maturity: 4.0, implementation: 90, evidence: 75 },
    { control: 'Training', maturity: 3.2, implementation: 70, evidence: 85 },
  ], []);

  const complianceStatus = useMemo(() => [
    { framework: 'NIST CSF 2.0', progress: 87, status: 'on-track', lastAudit: '2024-06-15' },
    { framework: 'ISO 27001', progress: 82, status: 'on-track', lastAudit: '2024-05-20' },
    { framework: 'SOC 2 Type II', progress: 94, status: 'ahead', lastAudit: '2024-07-10' },
    { framework: 'PCI DSS v4.0', progress: 76, status: 'behind', lastAudit: '2024-04-30' },
  ], []);

  const topRisks = useMemo(() => [
    { id: 'R-001', title: 'Cloud Configuration Drift', impact: 'High', probability: 'Medium', businessImpact: '£2.1M', trend: 'up' },
    { id: 'R-002', title: 'Insider Threat - Privileged Access', impact: 'Critical', probability: 'Low', businessImpact: '£4.5M', trend: 'stable' },
    { id: 'R-003', title: 'Supply Chain - SaaS Dependencies', impact: 'Medium', probability: 'High', businessImpact: '£1.8M', trend: 'down' },
    { id: 'R-004', title: 'Legacy System Vulnerabilities', impact: 'High', probability: 'Medium', businessImpact: '£3.2M', trend: 'up' },
    { id: 'R-005', title: 'Data Retention Compliance Gap', impact: 'Medium', probability: 'Medium', businessImpact: '£890K', trend: 'stable' },
  ], []);

  const evidenceCoverage = useMemo(() => [
    { category: 'Intent Evidence', covered: 243, total: 267, percentage: 91 },
    { category: 'Implementation Evidence', covered: 418, total: 445, percentage: 94 },
    { category: 'Behavioral Evidence', covered: 392, total: 420, percentage: 93 },
    { category: 'Validation Evidence', covered: 194, total: 245, percentage: 79 },
  ], []);

  // Predefined report templates
  const reportTemplates = useMemo(() => [
    {
      id: 'executive-summary',
      name: 'Executive Summary',
      description: 'High-level overview for C-suite and board members',
      stakeholder: 'executive',
      sections: ['trust-score', 'top-risks', 'compliance-status', 'strategic-recommendations'],
      frequency: 'monthly',
      format: 'pdf',
      pages: 2,
      icon: Users,
      color: 'blue'
    },
    {
      id: 'board-report',
      name: 'Board Governance Report',
      description: 'Comprehensive governance and risk oversight for board meetings',
      stakeholder: 'board',
      sections: ['trust-overview', 'risk-posture', 'regulatory-alignment', 'incident-summary', 'investment-recommendations'],
      frequency: 'quarterly',
      format: 'pdf',
      pages: 8,
      icon: Building,
      color: 'purple'
    },
    {
      id: 'regulatory-compliance',
      name: 'Regulatory Compliance Pack',
      description: 'Evidence-based compliance reporting for regulatory submissions',
      stakeholder: 'regulator',
      sections: ['framework-alignment', 'evidence-coverage', 'audit-trail', 'remediation-status'],
      frequency: 'on-demand',
      format: 'pdf',
      pages: 15,
      icon: FileText,
      color: 'green'
    },
    {
      id: 'customer-trust',
      name: 'Customer Trust Report',
      description: 'Public-facing security posture and certifications',
      stakeholder: 'customer',
      sections: ['trust-score', 'certifications', 'security-measures', 'incident-transparency'],
      frequency: 'quarterly',
      format: 'web',
      pages: 4,
      icon: Globe,
      color: 'cyan'
    },
    {
      id: 'auditor-pack',
      name: 'Auditor Evidence Pack',
      description: 'Comprehensive evidence collection for external audits',
      stakeholder: 'auditor',
      sections: ['evidence-matrix', 'control-testing', 'gap-analysis', 'remediation-plans'],
      frequency: 'annual',
      format: 'zip',
      pages: 25,
      icon: Search,
      color: 'orange'
    },
    {
      id: 'technical-deep-dive',
      name: 'Technical Risk Analysis',
      description: 'Detailed technical analysis for security teams',
      stakeholder: 'technical',
      sections: ['threat-landscape', 'vulnerability-analysis', 'control-effectiveness', 'mitre-mapping'],
      frequency: 'weekly',
      format: 'pdf',
      pages: 12,
      icon: Settings,
      color: 'red'
    },
    {
      id: 'incident-response',
      name: 'Incident Response Summary',
      description: 'Post-incident analysis and lessons learned',
      stakeholder: 'executive',
      sections: ['incident-timeline', 'impact-analysis', 'response-effectiveness', 'improvement-actions'],
      frequency: 'post-incident',
      format: 'pdf',
      pages: 6,
      icon: AlertTriangle,
      color: 'yellow'
    },
    {
      id: 'vendor-assessment',
      name: 'Vendor Risk Assessment',
      description: 'Third-party risk analysis and recommendations',
      stakeholder: 'procurement',
      sections: ['vendor-scorecard', 'risk-assessment', 'contractual-requirements', 'monitoring-plan'],
      frequency: 'semi-annual',
      format: 'pdf',
      pages: 10,
      icon: Users,
      color: 'indigo'
    }
  ], []);

  // Section library for custom report builder
  const availableSections = useMemo(() => [
    { id: 'trust-score', name: 'Trust Score Overview', component: 'TrustScoreChart', dataSource: 'trust' },
    { id: 'trust-overview', name: 'Trust Factors Analysis', component: 'TrustFactorsGrid', dataSource: 'trust' },
    { id: 'top-risks', name: 'Top Risks & Opportunities', component: 'RiskList', dataSource: 'risks' },
    { id: 'risk-posture', name: 'Risk Posture by Unit', component: 'RiskHeatmap', dataSource: 'risks' },
    { id: 'compliance-status', name: 'Regulatory Compliance', component: 'ComplianceTable', dataSource: 'compliance' },
    { id: 'framework-alignment', name: 'Framework Alignment Detail', component: 'FrameworkMatrix', dataSource: 'compliance' },
    { id: 'evidence-coverage', name: 'Evidence Coverage Report', component: 'EvidenceChart', dataSource: 'evidence' },
    { id: 'evidence-matrix', name: 'Evidence Matrix', component: 'EvidenceGrid', dataSource: 'evidence' },
    { id: 'control-effectiveness', name: 'Control Effectiveness', component: 'ControlHeatmap', dataSource: 'controls' },
    { id: 'control-testing', name: 'Control Testing Results', component: 'ControlTestGrid', dataSource: 'controls' },
    { id: 'threat-landscape', name: 'Threat Intelligence', component: 'ThreatMap', dataSource: 'threats' },
    { id: 'mitre-mapping', name: 'MITRE ATT&CK Mapping', component: 'MitreHeatmap', dataSource: 'threats' },
    { id: 'vulnerability-analysis', name: 'Vulnerability Analysis', component: 'VulnChart', dataSource: 'vulnerabilities' },
    { id: 'incident-timeline', name: 'Incident Timeline', component: 'IncidentTimeline', dataSource: 'incidents' },
    { id: 'incident-summary', name: 'Incident Summary', component: 'IncidentStats', dataSource: 'incidents' },
    { id: 'strategic-recommendations', name: 'Strategic Recommendations', component: 'RecommendationCards', dataSource: 'analytics' },
    { id: 'investment-recommendations', name: 'Investment Analysis', component: 'InvestmentChart', dataSource: 'analytics' },
    { id: 'vendor-scorecard', name: 'Vendor Risk Scorecard', component: 'VendorGrid', dataSource: 'vendors' },
    { id: 'certifications', name: 'Security Certifications', component: 'CertificationBadges', dataSource: 'compliance' },
    { id: 'audit-trail', name: 'Change Audit Trail', component: 'AuditLog', dataSource: 'audit' },
    { id: 'gap-analysis', name: 'Gap Analysis', component: 'GapMatrix', dataSource: 'requirements' },
    { id: 'remediation-status', name: 'Remediation Status', component: 'RemediationTracker', dataSource: 'requirements' }
  ], []);

  // Data source connections - this shows how sections link to your existing components
  // Data source connections - this shows how sections link to your existing components
  const dataSourceMappings = useMemo(() => ({
    trust: { 
      component: 'TrustDashboard.jsx', 
      hooks: ['useTrustScore', 'useTrustFactors'],
      domains: ['trust'],
      api: '/api/trust/metrics'
    },
    risks: { 
      component: 'RiskManagementView.jsx', 
      hooks: ['useRiskManagement', 'useRiskCalculation'],
      domains: ['risks'],
      api: '/api/risks'
    },
    compliance: { 
      component: 'StandardsFrameworksView.jsx', 
      hooks: ['useComplianceStatus', 'useFrameworkAlignment'],
      domains: ['requirements', 'capabilities'],
      api: '/api/compliance/frameworks'
    },
    evidence: { 
      component: 'EvidenceView.jsx', 
      hooks: ['useEvidenceData', 'useEvidenceCoverage'],
      domains: ['evidence'],
      api: '/api/evidence'
    },
    controls: { 
      component: 'RequirementsTable.jsx', 
      hooks: ['useRequirementsData', 'useControlEffectiveness'],
      domains: ['requirements', 'capabilities'],
      api: '/api/requirements'
    },
    threats: { 
      component: 'ThreatIntelligenceView.jsx', 
      hooks: ['useThreatIntelligence', 'useMitreAttack'],
      domains: ['threats'],
      api: '/api/threats'
    },
    incidents: { 
      component: 'IncidentsView.jsx', 
      hooks: ['useIncidentData'],
      domains: ['incidents'],
      api: '/api/incidents'
    },
    analytics: { 
      component: 'AnalyticsPage.jsx', 
      hooks: ['useAnalytics', 'useRecommendations'],
      domains: ['analytics'],
      api: '/api/analytics'
    },
  }), []);

  // Trust Score SVG Chart (responsive, inline SVG)
  const TrustScoreChartSVG = ({ data }) => {
    const containerRef = React.useRef(null);
    const [width, setWidth] = useState(600);
    const height = 260;
    const margin = { top: 10, right: 16, bottom: 36, left: 40 };

    useEffect(() => {
      const measure = () => {
        if (containerRef.current) setWidth(containerRef.current.clientWidth);
      };
      measure();
      window.addEventListener('resize', measure);
      return () => window.removeEventListener('resize', measure);
    }, []);

    const yMin = 70;
    const yMax = 100;
    const yTicks = [70, 78, 86, 100];

    const n = data?.length || 0;
    const chartW = Math.max(0, width - margin.left - margin.right);
    const chartH = Math.max(0, height - margin.top - margin.bottom);

    const xFor = (i) => margin.left + (n > 1 ? (i / (n - 1)) * chartW : chartW / 2);
    const yFor = (v) => margin.top + ((yMax - v) / (yMax - yMin)) * chartH;

    // Build historical and predicted point arrays
    const histPoints = [];
    let lastHistIndex = -1;
    for (let i = 0; i < n; i++) {
      if (typeof data[i].score === 'number') {
        histPoints.push({ x: xFor(i), y: yFor(data[i].score) });
        lastHistIndex = i;
      }
    }

    const predPoints = [];
    if (lastHistIndex !== -1) {
      predPoints.push({ x: xFor(lastHistIndex), y: yFor(data[lastHistIndex].score) });
      for (let i = lastHistIndex + 1; i < n; i++) {
        if (typeof data[i].predicted === 'number') {
          predPoints.push({ x: xFor(i), y: yFor(data[i].predicted) });
        }
      }
    }

    const pathFrom = (pts) => (pts.length ? 'M ' + pts.map((p) => `${p.x},${p.y}`).join(' L ') : '');

    return (
      <div ref={containerRef} className="relative w-full h-[300px]">
        <svg width={width} height={height}>
          {/* Vertical gridlines */}
          {Array.from({ length: n }).map((_, i) => (
            <line
              key={`vg-${i}`}
              x1={xFor(i)}
              x2={xFor(i)}
              y1={margin.top}
              y2={margin.top + chartH}
              stroke="#e5e7eb"
              strokeWidth="1"
            />
          ))}

          {/* Horizontal dashed gridlines */}
          {yTicks.map((t, idx) => (
            <line
              key={`hg-${idx}`}
              x1={margin.left}
              x2={margin.left + chartW}
              y1={yFor(t)}
              y2={yFor(t)}
              stroke="#e5e7eb"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
          ))}

          {/* Axes */}
          <line x1={margin.left} y1={margin.top} x2={margin.left} y2={margin.top + chartH} stroke="#9ca3af" strokeWidth="1" />
          <line x1={margin.left} y1={margin.top + chartH} x2={margin.left + chartW} y2={margin.top + chartH} stroke="#9ca3af" strokeWidth="1" />

          {/* Y-axis labels */}
          {yTicks.map((t, idx) => (
            <text key={`yl-${idx}`} x={margin.left - 8} y={yFor(t) + 4} textAnchor="end" fontSize="10" fill="#6b7280">
              {t}
            </text>
          ))}

          {/* X-axis labels */}
          {data.map((d, i) => (
            <text key={`xl-${i}`} x={xFor(i)} y={margin.top + chartH + 16} textAnchor="middle" fontSize="10" fill="#6b7280">
              {d.date?.split('-').slice(1).join('/')}
            </text>
          ))}

          {/* Historical line */}
          <path d={pathFrom(histPoints)} fill="none" stroke="#3B82F6" strokeWidth="2" />
          {/* Predicted line */}
          <path d={pathFrom(predPoints)} fill="none" stroke="#93C5FD" strokeWidth="2" strokeDasharray="6 4" />

          {/* Historical markers */}
          {histPoints.map((p, idx) => (
            <circle key={`hm-${idx}`} cx={p.x} cy={p.y} r="3.5" fill="#3B82F6" />
          ))}
          {/* Predicted markers (skip first shared point) */}
          {predPoints.slice(1).map((p, idx) => (
            <circle key={`pm-${idx}`} cx={p.x} cy={p.y} r="3" fill="#93C5FD" />
          ))}
        </svg>

        {/* Legend */}
        <div className="absolute right-2 top-2 flex items-center gap-4 text-xs text-gray-600 bg-white/70 px-2 py-1 rounded">
          <div className="flex items-center"><span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>Historical</div>
          <div className="flex items-center"><span className="w-3 h-3 bg-blue-300 rounded-full mr-2"></span>Predicted</div>
        </div>
      </div>
    );
  };
  
  // Context-aware navigation handler
  const handleDrillDown = (type, payload) => {
    let path = '/dashboard/';
    let state = { context: payload, source: 'reporting' };
    let searchParams = '';

    switch (type) {
      case 'risk':
        path += 'risk-management';
        state.riskId = payload.id;
        state.severity = payload.impact;
        break;
      case 'compliance':
        path += 'standards-frameworks';
        state.framework = payload.framework;
        state.showGaps = payload.status === 'behind';
        break;
      case 'evidence':
        path += 'evidence';
        searchParams = '?view=coverage';
        state.category = payload.category;
        state.showGaps = payload.percentage < 90;
        break;
      case 'control':
        path += 'requirements';
        state.control = payload.control;
        state.maturity = payload.maturity;
        break;
      default:
        path += 'overview';
    }

    // Set linked view for UI feedback
    setLinkedView({
      component: dataSourceMappings[type]?.component || 'Unknown',
      context: payload
    });

    // Navigate with state and optional search params
    navigate(`${path}${searchParams}`, { state });
  };

  // Handle refresh button click
  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setRefreshing(false);
  };

  // Handle export button click
  const handleExport = (format, type) => {
    console.log(`Exporting ${type} as ${format}`);
    // Implementation would integrate with your existing export functionality
  };

  // Handle adding a section to the custom report
  const handleAddSection = (section) => {
    if (!selectedSections.some(s => s.id === section.id)) {
      setSelectedSections([...selectedSections, section]);
    }
  };

  // Handle removing a section from the custom report
  const handleRemoveSection = (sectionId) => {
    setSelectedSections(selectedSections.filter(s => s.id !== sectionId));
  };

  // Filter sections based on search
  const filteredSections = useMemo(() => {
    if (!searchSections) return availableSections;
    return availableSections.filter(section => 
      section.name.toLowerCase().includes(searchSections.toLowerCase()) ||
      section.dataSource.toLowerCase().includes(searchSections.toLowerCase())
    );
  }, [availableSections, searchSections]);

  // Component for metric cards
  const MetricCard = ({ title, value, subtitle, trend, icon: Icon, color }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className={`p-2 rounded-lg bg-${color}-100`}>
            <Icon className={`h-5 w-5 text-${color}-600`} />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
          </div>
        </div>
        {trend && (
          <div className={`flex items-center ${trend.direction === 'up' ? 'text-green-600' : trend.direction === 'down' ? 'text-red-600' : 'text-gray-600'}`}>
            {trend.direction === 'up' ? <ArrowUpRight className="h-4 w-4" /> : 
             trend.direction === 'down' ? <ArrowDownRight className="h-4 w-4" /> : 
             <Minus className="h-4 w-4" />}
            <span className="text-sm font-medium ml-1">{trend.value}</span>
          </div>
        )}
      </div>
    </div>
  );

  // Component for risk cards
  const RiskCard = ({ risk }) => (
    <div 
      className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow cursor-pointer"
      onClick={() => handleDrillDown('risk', risk)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center">
            <span className="text-xs font-medium text-gray-500">{risk.id}</span>
            <div className={`ml-2 flex items-center ${risk.trend === 'up' ? 'text-red-600' : risk.trend === 'down' ? 'text-green-600' : 'text-gray-600'}`}>
              {risk.trend === 'up' ? <ArrowUpRight className="h-3 w-3" /> : 
               risk.trend === 'down' ? <ArrowDownRight className="h-3 w-3" /> : 
               <Minus className="h-3 w-3" />}
            </div>
          </div>
          <h4 className="text-sm font-medium text-gray-900 mt-1">{risk.title}</h4>
          <div className="flex items-center mt-2 space-x-4">
            <span className={`text-xs px-2 py-1 rounded-full ${
              risk.impact === 'Critical' ? 'bg-red-100 text-red-800' :
              risk.impact === 'High' ? 'bg-orange-100 text-orange-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {risk.impact} Impact
            </span>
            <span className="text-xs text-gray-500">{risk.businessImpact}</span>
          </div>
        </div>
        <ChevronRight className="h-4 w-4 text-gray-400" />
      </div>
    </div>
  );

  // Component for compliance rows
  const ComplianceRow = ({ framework }) => (
    <div 
      className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0 cursor-pointer hover:bg-gray-50"
      onClick={() => handleDrillDown('compliance', framework)}
    >
      <div className="flex items-center flex-1">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">{framework.framework}</p>
          <p className="text-xs text-gray-500">Last audit: {framework.lastAudit}</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex-1 bg-gray-200 rounded-full h-2 w-24">
            <div 
              className={`h-2 rounded-full ${
                framework.status === 'ahead' ? 'bg-green-500' :
                framework.status === 'on-track' ? 'bg-blue-500' :
                'bg-red-500'
              }`}
              style={{ width: `${framework.progress}%` }}
            ></div>
          </div>
          <span className="text-sm font-medium text-gray-900 w-12">{framework.progress}%</span>
          <div className={`w-2 h-2 rounded-full ${
            framework.status === 'ahead' ? 'bg-green-500' :
            framework.status === 'on-track' ? 'bg-blue-500' :
            'bg-red-500'
          }`}></div>
        </div>
      </div>
    </div>
  );

  // Component for template cards
  const TemplateCard = ({ template }) => (
    <div 
      className={`bg-white rounded-lg border-2 p-4 cursor-pointer transition-all ${
        selectedTemplate === template.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
      }`}
      onClick={() => setSelectedTemplate(template.id)}
    >
      <div className="flex items-start space-x-3">
        <div className={`p-2 rounded-lg bg-${template.color}-100`}>
          <template.icon className={`h-5 w-5 text-${template.color}-600`} />
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-gray-900">{template.name}</h4>
          <p className="text-sm text-gray-600 mt-1">{template.description}</p>
          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
            <span>{template.pages} pages</span>
            <span>{template.frequency}</span>
            <span className="uppercase">{template.format}</span>
          </div>
        </div>
        {selectedTemplate === template.id && (
          <CheckCircle className="h-5 w-5 text-blue-600" />
        )}
      </div>
    </div>
  );

  // Template Library Modal Component
  const TemplateLibrary = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Report Template Library</h2>
            <p className="text-gray-600">Choose from predefined templates or build your own custom report</p>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setCustomReportBuilder(!customReportBuilder)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Custom Report
            </button>
            <button 
              onClick={() => setShowTemplateLibrary(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 h-[calc(90vh-180px)]">
          {/* Template Selection */}
          <div className={`col-span-${customReportBuilder ? '2' : '3'} p-6 overflow-y-auto`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reportTemplates.map((template) => (
                <TemplateCard key={template.id} template={template} />
              ))}
            </div>
            
            {selectedTemplate && !customReportBuilder && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Template Preview</h3>
                <div className="text-sm text-gray-600">
                  <p><strong>Sections included:</strong></p>
                  <ul className="list-disc list-inside mt-1">
                    {reportTemplates.find(t => t.id === selectedTemplate)?.sections.map((section) => (
                      <li key={section}>{availableSections.find(s => s.id === section)?.name || section}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Custom Report Builder */}
          {customReportBuilder && (
            <div className="col-span-1 border-l border-gray-200 p-6 bg-gray-50 overflow-y-auto">
              <div className="mb-4">
                <h3 className="font-medium text-gray-900">Custom Report Builder</h3>
                <p className="text-sm text-gray-600 mt-1">Add sections to your custom report</p>
              </div>

              <div className="mb-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search sections..."
                    value={searchSections}
                    onChange={(e) => setSearchSections(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md pl-10"
                  />
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Available Sections</h4>
                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                  {filteredSections.map(section => (
                    <div 
                      key={section.id}
                      className="flex items-center justify-between p-2 bg-white rounded border border-gray-200 hover:bg-gray-50"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-800">{section.name}</p>
                        <p className="text-xs text-gray-500">Source: {section.dataSource}</p>
                      </div>
                      <button
                        onClick={() => handleAddSection(section)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        disabled={selectedSections.some(s => s.id === section.id)}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Your Report Composition</h4>
                {selectedSections.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">No sections added yet</p>
                ) : (
                  <div className="space-y-2">
                    {selectedSections.map((section, index) => (
                      <div 
                        key={section.id}
                        className="flex items-center justify-between p-2 bg-white rounded border border-gray-200"
                      >
                        <div className="flex items-center">
                          <span className="text-xs font-medium bg-gray-200 text-gray-800 w-6 h-6 rounded-full flex items-center justify-center mr-2">
                            {index + 1}
                          </span>
                          <p className="text-sm font-medium text-gray-800">{section.name}</p>
                        </div>
                        <button
                          onClick={() => handleRemoveSection(section.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            {customReportBuilder 
              ? `Custom report with ${selectedSections.length} sections`
              : `Selected: ${reportTemplates.find(t => t.id === selectedTemplate)?.name}`
            }
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setShowTemplateLibrary(false)}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button 
              onClick={() => {
                handleExport('pdf', customReportBuilder ? 'custom' : selectedTemplate);
                setShowTemplateLibrary(false);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Generate Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Simple Trust Score Chart (without external libraries)
  const SimpleTrustScoreChart = ({ data }) => {
    const maxScore = 100;
    const chartHeight = 200;
    
    return (
      <div className="relative h-[300px] w-full mt-6">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-0 w-10 flex flex-col justify-between text-xs text-gray-500">
          <span>100</span>
          <span>90</span>
          <span>80</span>
          <span>70</span>
        </div>
        
        {/* Chart area */}
        <div className="absolute left-12 right-0 top-0 bottom-20 border-l border-b border-gray-300">
          {/* Horizontal grid lines */}
          <div className="absolute left-0 right-0 top-0 h-1/4 border-b border-gray-100"></div>
          <div className="absolute left-0 right-0 top-1/4 h-1/4 border-b border-gray-100"></div>
          <div className="absolute left-0 right-0 top-2/4 h-1/4 border-b border-gray-100"></div>
          <div className="absolute left-0 right-0 top-3/4 h-1/4 border-b border-gray-100"></div>
          
          {/* Data points and line */}
          <div className="absolute inset-0 flex items-end">
            {data.map((point, index) => {
              const barHeight = (point.score / maxScore) * chartHeight;
              const barWidth = `calc(100% / ${data.length})`;
              const left = `calc(${index} * ${barWidth})`;
              
              return (
                <div 
                  key={index} 
                  className="relative h-full"
                  style={{ width: barWidth }}
                >
                  {/* Bar */}
                  <div 
                    className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 bg-blue-500"
                    style={{ height: `${barHeight}px` }}
                  ></div>
                  
                  {/* Data point */}
                  <div 
                    className="absolute w-3 h-3 bg-blue-600 rounded-full transform -translate-x-1/2"
                    style={{ 
                      bottom: `${barHeight}px`,
                      left: '50%'
                    }}
                  ></div>
                  
                  {/* X-axis label */}
                  <div className="absolute bottom-[-20px] left-1/2 transform -translate-x-1/2 text-xs text-gray-500">
                    {point.date.split('-').slice(1).join('/')}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <BarChart3 className="h-8 w-8 mr-3 text-blue-600" />
              Executive Reporting Centre
            </h1>
            <p className="text-gray-600 mt-1">Comprehensive security posture and compliance insights</p>
          </div>
          <div className="flex items-center space-x-3">
            <select 
              value={selectedStakeholder} 
              onChange={(e) => setSelectedStakeholder(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="executive">Executive View</option>
              <option value="board">Board View</option>
              <option value="regulator">Regulator View</option>
              <option value="customer">Customer View</option>
              <option value="auditor">Auditor View</option>
            </select>
            <select 
              value={selectedTimeframe} 
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="last7">Last 7 days</option>
              <option value="last30">Last 30 days</option>
              <option value="last90">Last 90 days</option>
              <option value="last365">Last year</option>
            </select>
            <button 
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button 
              onClick={() => setShowTemplateLibrary(true)}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <FileText className="h-4 w-4 mr-2" />
              Templates
            </button>
            <button 
              onClick={() => handleExport('pdf', 'full-report')}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </button>
          </div>
        </div>
      </div>

      {/* Executive Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <MetricCard 
          title="Trust Score" 
          value="89" 
          subtitle="Model Confidence: 94%"
          trend={{ direction: 'up', value: '+4 pts' }}
          icon={Shield} 
          color="blue" 
        />
        <MetricCard 
          title="Readiness Index" 
          value={`${readinessIndex}%`}
          subtitle="Threat Response Capability"
          trend={{ direction: 'up', value: '+2.3%' }}
          icon={Zap} 
          color="green" 
        />
        <MetricCard 
          title="Critical Risks" 
          value="2" 
          subtitle="Requiring immediate attention"
          trend={{ direction: 'down', value: '-1' }}
          icon={AlertTriangle} 
          color="red" 
        />
        <MetricCard 
          title="Evidence Coverage" 
          value="91%" 
          subtitle="Across all frameworks"
          trend={{ direction: 'up', value: '+3.2%' }}
          icon={FileText} 
          color="purple" 
        />
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Trust Score Trend */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Trust Score Overview</h3>
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                <span className="text-xs text-gray-600">Historical</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-300 rounded-full mr-2"></div>
                <span className="text-xs text-gray-600">Predicted</span>
              </div>
            </div>
          </div>
          <TrustScoreChartSVG data={trustScoreData} />
        </div>

        {/* Top 5 Risks */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Top 5 Risks</h3>
            <button 
              onClick={() => navigate('/dashboard/risk-management')}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              View All
            </button>
          </div>
          <div className="space-y-3">
            {topRisks.map((risk) => (
              <RiskCard key={risk.id} risk={risk} />
            ))}
          </div>
        </div>
      </div>

      {/* Risk Posture by Business Unit and Control Effectiveness */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Posture by Business Unit</h3>
          <div className="space-y-6">
            {riskPostureData.map((unit, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-900">{unit.unit}</span>
                  <span className="text-xs text-gray-500">
                    {unit.critical + unit.high + unit.medium + unit.low} total risks
                  </span>
                </div>
                <div className="flex h-6 rounded-md overflow-hidden">
                  {unit.critical > 0 && (
                    <div 
                      className="bg-red-500" 
                      style={{ width: `${(unit.critical / (unit.critical + unit.high + unit.medium + unit.low)) * 100}%` }}
                      title={`${unit.critical} Critical Risks`}
                    ></div>
                  )}
                  {unit.high > 0 && (
                    <div 
                      className="bg-orange-500" 
                      style={{ width: `${(unit.high / (unit.critical + unit.high + unit.medium + unit.low)) * 100}%` }}
                      title={`${unit.high} High Risks`}
                    ></div>
                  )}
                  {unit.medium > 0 && (
                    <div 
                      className="bg-yellow-500" 
                      style={{ width: `${(unit.medium / (unit.critical + unit.high + unit.medium + unit.low)) * 100}%` }}
                      title={`${unit.medium} Medium Risks`}
                    ></div>
                  )}
                  {unit.low > 0 && (
                    <div 
                      className="bg-green-500" 
                      style={{ width: `${(unit.low / (unit.critical + unit.high + unit.medium + unit.low)) * 100}%` }}
                      title={`${unit.low} Low Risks`}
                    ></div>
                  )}
                </div>
                <div className="flex text-xs text-gray-500 justify-between">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-1"></div>
                    <span>Critical: {unit.critical}</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mr-1"></div>
                    <span>High: {unit.high}</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mr-1"></div>
                    <span>Medium: {unit.medium}</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                    <span>Low: {unit.low}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Control Effectiveness Matrix */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Control Effectiveness Matrix</h3>
            <button 
              onClick={() => navigate('/dashboard/requirements', { state: { view: 'effectiveness', showHeatmap: true, source: 'reporting' } })}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
            >
              View Details <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>
          <div className="space-y-4">
            {controlEffectivenessData.map((control, index) => (
              <div 
                key={index} 
                className="space-y-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                onClick={() => handleDrillDown('control', control)}
              >
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-900">{control.control}</span>
                  <span className="text-xs text-gray-500">Mat: {control.maturity}/5</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center">
                    <div className="text-xs text-gray-500 mb-1">Implementation</div>
                    <div className={`h-2 rounded-full ${
                      control.implementation >= 90 ? 'bg-green-500' :
                      control.implementation >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}></div>
                    <div className="text-xs font-medium mt-1">{control.implementation}%</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-500 mb-1">Evidence</div>
                    <div className={`h-2 rounded-full ${
                      control.evidence >= 90 ? 'bg-green-500' :
                      control.evidence >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}></div>
                    <div className="text-xs font-medium mt-1">{control.evidence}%</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-500 mb-1">Maturity</div>
                    <div className={`h-2 rounded-full ${
                      control.maturity >= 4 ? 'bg-green-500' :
                      control.maturity >= 3 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}></div>
                    <div className="text-xs font-medium mt-1">{control.maturity}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Compliance Status and Evidence Coverage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Regulatory & Framework Alignment */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Regulatory & Framework Alignment</h3>
            <button 
              onClick={() => handleExport('pdf', 'compliance')} 
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Export Audit Pack
            </button>
          </div>
          <div className="space-y-2">
            {complianceStatus.map((framework, index) => (
              <ComplianceRow key={index} framework={framework} />
            ))}
          </div>
        </div>

        {/* Evidence Coverage Report */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Evidence Coverage Report</h3>
            <button 
              onClick={() => navigate('/dashboard/evidence', { state: { view: 'coverage', showGaps: true, source: 'reporting' } })}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
            >
              View Evidence Library <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>
          <div className="space-y-4">
            {evidenceCoverage.map((category, index) => (
              <div 
                key={index} 
                className="space-y-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                onClick={() => handleDrillDown('evidence', category)}
              >
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-900">{category.category}</span>
                  <span className="text-sm text-gray-600">{category.covered}/{category.total}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        category.percentage >= 90 ? 'bg-green-500' :
                        category.percentage >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${category.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-12">{category.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Time to Evidence (avg)</span>
              <span className="font-medium">2.3 hours</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-gray-600">Evidence Freshness</span>
              <span className="font-medium">87% &lt; 30 days</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Items and Strategic Recommendations */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Strategic Recommendations</h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Potential Impact:</span>
            <span className="text-sm font-medium text-green-600">+7.2 Trust Score Points</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="border border-orange-200 bg-orange-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-orange-900">Priority: High</span>
              <span className="text-xs bg-orange-200 text-orange-800 px-2 py-1 rounded">+3.4 pts</span>
            </div>
            <p className="text-sm text-orange-800">Implement continuous control monitoring for cloud infrastructure to reduce configuration drift risks.</p>
            <div className="mt-2 text-xs text-orange-700">Est. completion: 4 weeks</div>
          </div>
          
          <div className="border border-yellow-200 bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-yellow-900">Priority: Medium</span>
              <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded">+2.1 pts</span>
            </div>
            <p className="text-sm text-yellow-800">Enhance vendor risk assessment automation to improve supply chain visibility.</p>
            <div className="mt-2 text-xs text-yellow-700">Est. completion: 6 weeks</div>
          </div>
          
          <div className="border border-blue-200 bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-900">Priority: Medium</span>
              <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded">+1.7 pts</span>
            </div>
            <p className="text-sm text-blue-800">Implement automated evidence collection for behavioral controls to improve freshness scores.</p>
            <div className="mt-2 text-xs text-blue-700">Est. completion: 3 weeks</div>
          </div>
        </div>
      </div>

      {/* Template Library Modal */}
      {showTemplateLibrary && <TemplateLibrary />}

      {/* Linked View Indicator */}
      {linkedView && (
        <div className="fixed bottom-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg">
          <div className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span className="text-sm">
              Navigated to: {linkedView.component}
            </span>
            <button 
              onClick={() => setLinkedView(null)}
              className="text-white hover:text-gray-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportingDashboard;
