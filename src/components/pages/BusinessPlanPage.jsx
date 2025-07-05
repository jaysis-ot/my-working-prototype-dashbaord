// Updated: July 5, 2025
import React, { useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  Building2,
  FileText,
  DollarSign,
  Calendar,
  Users,
  Target,
  TrendingUp,
  Shield,
  Download,
  Edit,
  Plus,
  ChevronDown,
  Info,
  AlertTriangle,
  CheckCircle,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  BookUser,
  Factory,
  GanttChartSquare,
  Handshake,
  History,
  Landmark,
  Lightbulb,
  Replace,
  Server,
  Calculator, // <-- NEW ICON
} from 'lucide-react';
import Button from '../atoms/Button';
import Badge from '../atoms/Badge';

// --- Mock Data ---
// In a real application, this would come from a context or API call.
const mockBusinessPlans = {
  'BP-NS-001': {
    title: 'Network Segmentation Initiative',
    description: 'Comprehensive business case for the OT network segmentation project.',
    status: 'Active',
    owner: 'John Doe',
    sponsor: 'Jane Smith',
    executiveSummary: {
      objective: 'To isolate critical OT assets from IT networks to reduce attack surface and mitigate risks of lateral movement, ensuring operational continuity.',
      businessOutcomes: [
        'Reduce attack surface by over 90% by preventing unauthorized cross-zone communication.',
        'Achieve compliance with ISA/IEC 62443 standards for network segmentation.',
        'Improve incident response time by containing threats within isolated network zones.',
        'Ensure operational continuity and enhance the safety of plant floor operations.',
      ],
      needsCase: 'The current flat network architecture poses a significant security risk, allowing for potential lateral movement of threats from the IT network to the critical OT environment. A recent audit identified this as a high-priority vulnerability that could lead to production downtime and safety incidents.',
      highLevelProjectScope: 'This project will implement a multi-layered network segmentation strategy based on the Purdue Model. It involves deploying new firewalls, configuring VLANs, and establishing a secure DMZ between IT and OT networks. The scope covers all assets within the primary manufacturing plant\'s control network (Levels 0-3).',
      totalBudget: 750000,
      estimatedROI: 180,
      timeline: '18 Months',
      keyRisks: 'Project delays due to supply chain issues, budget overruns from unforeseen complexities, and potential for minor operational disruption during implementation.',
    },
    projectBackground: `The manufacturing sector is experiencing increased cyber-physical
risks as IT and OT networks converge. Recent industry reports indicate a 35% year-on-year
increase in ransomware targeting industrial plants. A segmented architecture is considered a
market differentiator for safety-critical production facilities, reducing downtime costs that
average £120,000 per hour.`,

    stakeholders: [
      { name: 'Jane Smith', role: 'Executive Sponsor', interest: 'Strategic risk reduction & compliance' },
      { name: 'John Doe', role: 'Project Manager', interest: 'On-time, on-budget delivery' },
      { name: 'Plant Operations', role: 'End-User', interest: 'Minimal production disruption' },
      { name: 'IT Security', role: 'Control Owner', interest: 'Alignment with enterprise standards' },
    ],

    benefits: {
      quantitative: [
        '£1.2M annual reduction in potential outage costs',
        '60% decrease in Mean-Time-To-Detect (MTTD)',
        '40% faster Mean-Time-To-Respond (MTTR)',
      ],
      qualitative: [
        'Improved safety culture and stakeholder confidence',
        'Foundation for future zero-trust initiatives',
        'Enhanced regulatory audit readiness',
      ],
    },

    constraints: [
      'Capital budget capped at £800k for FY-24',
      'Change freeze during peak production (Nov-Dec)',
      'Limited OT firewall vendor support windows',
    ],

    dependencies: [
      'Completion of asset inventory project',
      'Corporate IAM upgrade for centralised authentication',
      '3rd-party vendor delivery of NGFW hardware',
    ],

    governanceStructure: {
      board: 'OT Cyber Steering Committee',
      reporting: 'Monthly status to CIO & COO',
      decisionProcess: 'Stage-gate approvals at end of each project phase',
    },

    technicalApproach: `Adopt a layered Purdue Model segmentation using NGFWs with deep-packet
inspection. VLAN segregation for level 2/3 assets, policy enforcement via centralised
security manager, and passive monitoring for anomaly detection.`,

    assumptions: [
      'All production lines remain within current throughput during rollout',
      'Skilled resources are available 4 weeks before pilot go-live',
      'No significant changes in regulatory landscape within next 18 months',
    ],

    keyRisksAndOpportunities: [
        { type: 'Risk', description: 'Implementation could disrupt critical operations during deployment.', approach: 'Phased implementation during planned maintenance windows with comprehensive rollback procedures.', impact: 'High' },
        { type: 'Risk', description: 'Legacy system compatibility issues may require additional integration work.', approach: 'Comprehensive compatibility assessment and dedicated integration testing phase.', impact: 'Medium' },
        { type: 'Opportunity', description: 'Enhanced monitoring capabilities enable advanced analytics and predictive maintenance.', approach: 'Implement AI-driven threat detection and operational optimization capabilities.', impact: 'Medium' },
        { type: 'Opportunity', description: 'Network segmentation provides foundation for zero-trust architecture.', approach: 'Develop comprehensive zero-trust roadmap leveraging segmentation infrastructure.', impact: 'High' },
    ],
    cafAlignment: [
        { nist: 'Identify', caf: 'Asset Management', gaps: 'Incomplete OT asset inventory and classification', improvement: 'Implement automated asset discovery and comprehensive classification system', contribution: 'Enhanced visibility of all network connected devices and systems' },
        { nist: 'Protect', caf: 'Access Control', gaps: 'Insufficient network segmentation and access controls', improvement: 'Deploy microsegmentation with zero-trust access principles', contribution: 'Significantly reduced attack surface and prevention of lateral movement' },
        { nist: 'Detect', caf: 'Security Monitoring', gaps: 'Limited visibility into network traffic and anomalies', improvement: 'Comprehensive network monitoring with behavioral analysis', contribution: 'Real-time threat detection and automated incident response' },
        { nist: 'Respond', caf: 'Incident Response', gaps: 'Slow incident containment due to network visibility limitations', improvement: 'Automated containment and rapid response capabilities', contribution: 'Reduced incident response time from hours to minutes' },
    ],
    riskAssessmentTable: [
        { risk: 'Cyber Attack via IT/OT Bridge', family: 'Advanced Persistent Threat', scenario: 'External attacker compromises IT network and attempts to pivot to OT systems for operational disruption.', narrative: 'Network segmentation with deep packet inspection, behavioral monitoring, and automated containment.', reduction: 'High - 70% reduction in successful attack probability and 90% reduction in impact scope' },
        { risk: 'Insider Threat - Malicious Access', family: 'Insider Threat', scenario: 'Authorized user attempts unauthorized access to critical OT systems beyond their role requirements.', narrative: 'Role-based access controls with network-level enforcement and comprehensive activity monitoring.', reduction: 'Medium - 60% reduction in unauthorized access capability and 100% improvement in detection time' },
        { risk: 'Operational System Failure', family: 'System Failure', scenario: 'Critical operational system failure causing cascading impacts across the production line.', narrative: 'Network isolation and redundancy ensuring failure in one zone does not impact others.', reduction: 'Medium - 90% reduction in cascading failure probability' },
    ],
    financialForecast: {
      year1: { description: 'Initial implementation and setup costs', capex: 450000, opex: 125000 },
      year2: { description: 'Rollout completion and operational ramp-up', capex: 200000, opex: 150000 },
      year3: { description: 'Optimization and steady-state operations', capex: 100000, opex: 175000 },
    },
    costAssumptions: [
      { item: 'Project Manager (Senior)', year1: 85000, year2: 87000, year3: 89000 },
      { item: 'Security Architect (Lead)', year1: 95000, year2: 97000, year3: 99000 },
      { item: 'Network Engineers (2 FTE)', year1: 140000, year2: 143000, year3: 146000 },
      { item: 'Security Engineers (2 FTE)', year1: 130000, year2: 133000, year3: 136000 },
      { item: 'Hardware & Infrastructure', year1: 300000, year2: 100000, year3: 50000 },
      { item: 'Software Licensing', year1: 80000, year2: 85000, year3: 90000 },
      { item: 'Professional Services', year1: 120000, year2: 60000, year3: 30000 },
      { item: 'Training & Certification', year1: 45000, year2: 23000, year3: 15000 },
      { item: 'Operational Support', year1: 25000, year2: 40000, year3: 45000 },
      { item: 'Contingency (10%)', year1: 50000, year2: 25000, year3: 15000 },
    ],
    basisOfCost: `Cost estimation based on comprehensive analysis including:
• Hardware procurement (next-generation firewalls, managed switches, network monitoring tools)
• Software licensing (security management platforms, monitoring solutions, compliance tools)
• Professional services (architecture design, implementation services, testing and validation)
• Training and certification programs for technical and operational staff
• Ongoing operational costs including maintenance, support, and continuous monitoring
• Contingency allocation for unforeseen integration complexities`,
    projectDetails: {
      startDate: '2024-08-01',
      endDate: '2026-02-01',
      scope: 'Includes all Level 3 and below assets in the primary manufacturing plant. Excludes corporate network infrastructure.',
      successMetrics: ['95% reduction in IT-to-OT cross-network traffic', 'Achieve ISA/IEC 62443 compliance', 'Zero production downtime during rollout'],
      financialImpacts: {
        outageCosts: { perHour: 120000, annualFrequency: 0.5 },
        downtimeCosts: { perEvent: 500000, annualFrequency: 0.2 },
        productionLoss: { annualCost: 750000 },
        regulatoryFines: { potentialFine: 2000000, likelihood: 0.1 },
      },
    },
    timeline: [
      { name: 'Phase 1: Discovery & Design', status: 'Completed', duration: '3 Months' },
      { name: 'Phase 2: Procurement & Staging', status: 'In Progress', duration: '4 Months' },
      { name: 'Phase 3: Pilot Implementation', status: 'Not Started', duration: '5 Months' },
      { name: 'Phase 4: Full Rollout', status: 'Not Started', duration: '6 Months' },
    ],
    resources: [
      { name: 'John Doe', company: 'Cyber Solutions Inc.', jobTitle: 'Project Manager', department: 'PMO', location: 'London, UK', email: 'john.doe@corp.local', phone: '+44 20 7946 0958', allocation: '100%', skills: ['PMP', 'Risk Management'], responsibilities: 'Overall project delivery', type: 'Internal' },
      { name: 'Brenda Smith', company: 'Cyber Solutions Inc.', jobTitle: 'Lead Network Architect', department: 'Engineering', location: 'Manchester, UK', email: 'brenda.smith@corp.local', phone: '+44 161 496 0101', allocation: '75%', skills: ['Network Architecture', 'Firewall Policy'], responsibilities: 'Technical design and architecture', type: 'Internal' },
      { name: 'Charles Davis', company: 'Cyber Solutions Inc.', jobTitle: 'Security Engineer', department: 'IT Security', location: 'London, UK', email: 'charles.davis@corp.local', phone: '+44 20 7946 0959', allocation: '100%', skills: ['IDS/IPS', 'SIEM'], responsibilities: 'Security control implementation', type: 'Internal' },
      { name: 'Diana Miller', company: 'Cyber Solutions Inc.', jobTitle: 'OT Specialist', department: 'Operations', location: 'Plant Floor', email: 'diana.miller@corp.local', phone: '+44 161 496 0102', allocation: '50%', skills: ['OT Systems', 'PLC Programming'], responsibilities: 'Liaison with plant operations', type: 'Internal' },
      { name: 'Ellie Young', company: 'Cyber Solutions Inc.', jobTitle: 'Change Manager', department: 'PMO', location: 'Remote', email: 'ellie.young@corp.local', phone: '+44 20 7946 0960', type: 'Internal', experience: 'Senior', skills: ['Change Management', 'Stakeholder Comms'], allocation: '40%', availability: '2024-08-01 ➜ 2025-09-30', responsibilities: 'Manage change requests & comms plan' },
      { name: 'SecureNet Consulting (Ben Clark)', company: 'SecureNet Consulting', jobTitle: 'Firewall Specialist', department: 'Professional Services', location: 'External', email: 'ben.clark@securenet.com', phone: '+44 118 496 0123', type: 'External', experience: 'Consultant', skills: ['NGFW', 'IDS/IPS', 'Zone Policies'], allocation: '60%', availability: '2024-10-01 ➜ 2025-03-31', responsibilities: 'Configure & test perimeter firewalls' },
    ],
    teamStructure: [
      { name: 'Jane Smith', role: 'Executive Sponsor' },
      { name: 'John Doe', role: 'Project Manager' },
      { name: 'Brenda Smith', role: 'Lead Network Architect', reportsTo: 'John Doe' },
      { name: 'Charles Davis', role: 'Security Engineer', reportsTo: 'Brenda Smith' },
      { name: 'Diana Miller', role: 'OT Specialist', reportsTo: 'John Doe' },
    ],
    resourceTimeline: [
      { name: 'Design & Planning', start: '2024-08', end: '2024-10' },
      { name: 'Pilot', start: '2024-11', end: '2025-01' },
      { name: 'Roll-out', start: '2025-02', end: '2026-01' },
    ],
    implementationPlan: [
      {
        phase: 'Phase 1: Design & Planning',
        duration: '3 months',
        keyActivities: [
          'Detailed architecture design and security zone definition',
          'Hardware and software procurement and delivery',
          'Resource allocation and team establishment',
          'Risk assessment and mitigation planning',
        ],
      },
      {
        phase: 'Phase 2: Pilot Implementation',
        duration: '2 months',
        keyActivities: [
          'Pilot site setup and initial configuration',
          'Integration testing and security validation',
          'Performance testing and optimization',
          'Initial staff training and documentation',
        ],
      },
      {
        phase: 'Phase 3: Production Rollout',
        duration: '12 months',
        keyActivities: [
          'Site-by-site implementation across all locations',
          'Comprehensive staff training and certification',
          'Operational handover and support transition',
          'Continuous monitoring and optimization',
        ],
      },
      {
        phase: 'Phase 4: Optimization & Closure',
        duration: '1 month',
        keyActivities: [
          'Performance tuning and final optimization',
          'Complete documentation and knowledge transfer',
          'Project closure and lessons learned capture',
          'Transition to business-as-usual operations',
        ],
      },
    ],
    costs: [
      { item: 'Hardware (Firewalls, Switches)', amount: 350000 },
      { item: 'Software (Monitoring, NAC)', amount: 150000 },
      { item: 'Professional Services (Implementation)', amount: 200000 },
      { item: 'Contingency', amount: 50000 },
    ],
    linkedCapabilities: ['CAP-001', 'CAP-003'],
    /* ---------------- NEW: CALCULATIONS DATA ---------------- */
    calculations: {
      equipmentCosts: [
        { item: 'Next-Gen Firewalls (HA Pair)', quantity: 5, unitCost: 30000 },
        { item: 'Managed Switches (48-port)', quantity: 20, unitCost: 4000 },
        { item: 'Monitoring Sensors', quantity: 100, unitCost: 1200 },
      ],
      resourceCosts: [
        { role: 'Project Manager', hours: 1500, rate: 55 },
        { role: 'Lead Architect', hours: 1200, rate: 70 },
        { role: 'Security Engineer', hours: 2000, rate: 60 },
        { role: 'Network Engineer', hours: 2500, rate: 55 },
      ],
      consultancyCosts: [
        { service: 'Initial Design & Architecture Review', vendor: 'SecureNet Consulting', cost: 45000 },
        { service: 'Implementation Support & QA', vendor: 'SecureNet Consulting', cost: 75000 },
      ],
      softwareCosts: [
        { item: 'Centralized Firewall Manager', subscription: 'Annual', cost: 25000 },
        { item: 'SIEM Log Collector Licenses', subscription: 'Annual', cost: 15000 },
        { item: 'Vulnerability Management Platform', subscription: '3-Year', cost: 40000 },
      ],
      trainingCosts: [
        { course: 'Advanced Firewall Configuration', attendees: 4, cost: 12000 },
        { course: 'OT Security Monitoring Training', attendees: 8, cost: 18000 },
      ],
      notes: `All costs are estimates. Resource costs are based on blended internal rates. Consultancy costs are based on a fixed-price statement of work. Contingency is calculated at 10% of initial CAPEX.`,
    },
  },
  'BP-IAM-002': {
    title: 'Identity & Access Management Overhaul',
    description: 'Business case for deploying a centralized IAM solution for OT environments.',
    status: 'Planning',
    owner: 'Alice Johnson',
    sponsor: 'Bob Williams',
    executiveSummary: {
      objective: 'To enforce least-privilege access and establish strong authentication for all users and systems within the OT network.',
      businessOutcomes: [
        'Enforce least-privilege access across the entire OT environment.',
        'Automate user access reviews to simplify and improve compliance audits.',
        'Reduce risk of credential compromise through Multi-Factor Authentication (MFA).',
        'Centralize and streamline user access management, reducing administrative overhead.',
      ],
      needsCase: 'The lack of centralized identity and access management leads to inconsistent access controls, orphaned accounts, and significant difficulty in auditing user permissions. This increases the risk of unauthorized access and fails to meet compliance requirements for user access reviews.',
      highLevelProjectScope: 'Deploy a centralized Identity and Access Management (IAM) solution for all OT systems. This project includes integrating with the corporate Active Directory, implementing role-based access control (RBAC) for all personnel and contractors, and enforcing MFA for remote and privileged access.',
      totalBudget: 420000,
      estimatedROI: 150,
      timeline: '12 Months',
      keyRisks: 'User adoption challenges, integration complexity with legacy systems, and potential for disruption if roles are not correctly defined.',
    },
    keyRisksAndOpportunities: [],
    cafAlignment: [],
    riskAssessmentTable: [],
    projectDetails: {
      startDate: '2025-01-01',
      endDate: '2025-12-31',
      scope: 'All OT personnel, contractors, and system-to-system accounts. Integration with Active Directory and key OT applications.',
      successMetrics: ['100% MFA coverage for remote access', 'Reduce privileged accounts by 50%', 'Automated access reviews completed quarterly'],
      financialImpacts: {},
    },
    timeline: [
      { name: 'Phase 1: Vendor Selection', status: 'Not Started', duration: '2 Months' },
      { name: 'Phase 2: Design & PoC', status: 'Not Started', duration: '3 Months' },
      { name: 'Phase 3: Phased Rollout', status: 'Not Started', duration: '6 Months' },
      { name: 'Phase 4: Decommission Old Systems', status: 'Not Started', duration: '1 Month' },
    ],
    resources: [],
    costs: [],
    linkedCapabilities: ['CAP-002'],
    implementationPlan: [],
  },
};

// --- Internal Reusable Components ---

const StatCard = ({ title, value, icon: Icon }) => (
  <div className="bg-secondary-50 dark:bg-secondary-800/50 p-4 rounded-lg">
    <div className="flex items-center">
      <Icon className="w-6 h-6 text-primary-600 dark:text-primary-400 mr-3" />
      <div>
        <p className="text-sm text-secondary-500 dark:text-secondary-400">{title}</p>
        <p className="text-lg font-bold text-secondary-900 dark:text-white">{value}</p>
      </div>
    </div>
  </div>
);

const TabButton = ({ label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
      isActive
        ? 'bg-primary-600 text-white'
        : 'text-secondary-600 hover:bg-secondary-100 dark:text-secondary-300 dark:hover:bg-secondary-700'
    }`}
  >
    {label}
  </button>
);

const DetailItem = ({ label, children }) => (
  <div>
    <p className="text-xs font-semibold uppercase text-secondary-500 dark:text-secondary-400">{label}</p>
    <div className="text-sm text-secondary-800 dark:text-white mt-1">{children || '-'}</div>
  </div>
);

const InfoSection = ({ title, children }) => (
  <div className="dashboard-card p-6">
    <h3 className="text-lg font-semibold mb-3 text-secondary-900 dark:text-white">{title}</h3>
    <div className="text-sm text-secondary-600 dark:text-secondary-300 space-y-2">{children}</div>
  </div>
);

// --- Tab Content Components ---

const OverviewTab = ({ plan }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard title="Total Budget" value={`£${plan.executiveSummary.totalBudget.toLocaleString()}`} icon={DollarSign} />
      <StatCard title="Estimated ROI" value={`${plan.executiveSummary.estimatedROI}%`} icon={TrendingUp} />
      <StatCard title="Timeline" value={plan.executiveSummary.timeline} icon={Calendar} />
      <StatCard title="Linked Capabilities" value={plan.linkedCapabilities.length} icon={Shield} />
    </div>
    <div className="dashboard-card p-6 space-y-6">
      <InfoSection title="Objective">
        <p>{plan.executiveSummary.objective}</p>
      </InfoSection>
      <InfoSection title="Business Outcomes">
        <ul className="list-disc pl-5 space-y-1">
          {plan.executiveSummary.businessOutcomes.map((outcome, i) => <li key={i}>{outcome}</li>)}
        </ul>
      </InfoSection>
      <InfoSection title="Needs Case">
        <p>{plan.executiveSummary.needsCase}</p>
      </InfoSection>
      <InfoSection title="High-level Project Scope">
        <p>{plan.executiveSummary.highLevelProjectScope}</p>
      </InfoSection>
      <InfoSection title="Key Risks">
        <p>{plan.executiveSummary.keyRisks}</p>
      </InfoSection>
    </div>
  </div>
);

const FinancialImpactCard = ({ title, cost, frequency, annualImpact, color }) => (
    <div className={`p-4 rounded-lg border-l-4 bg-${color}-50 border-${color}-400`}>
        <p className="font-semibold text-sm text-secondary-800">{title}</p>
        <p className="text-xs text-secondary-500">{cost} • {frequency}</p>
        <p className="text-lg font-bold text-secondary-900 mt-2">£{annualImpact.toLocaleString()}</p>
        <p className="text-xs text-secondary-500">Annualized Risk Value</p>
    </div>
);

const DetailsTab = ({ plan }) => {
    const { projectDetails, executiveSummary } = plan;
    const { financialImpacts } = projectDetails;

    const annualOutageCost = (financialImpacts.outageCosts.perHour * 24) * financialImpacts.outageCosts.annualFrequency;
    const annualDowntimeCost = financialImpacts.downtimeCosts.perEvent * financialImpacts.downtimeCosts.annualFrequency;
    const annualProductionLoss = financialImpacts.productionLoss.annualCost;
    const annualRegulatoryRisk = financialImpacts.regulatoryFines.potentialFine * financialImpacts.regulatoryFines.likelihood;

    const totalAnnualRiskValue = annualOutageCost + annualDowntimeCost + annualProductionLoss + annualRegulatoryRisk;
    const calculatedROI = ((totalAnnualRiskValue * 3 - executiveSummary.totalBudget) / executiveSummary.totalBudget) * 100;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <DetailItem label="Project Owner"><Badge variant="info">{plan.owner}</Badge></DetailItem>
                <DetailItem label="Executive Sponsor"><Badge variant="info">{plan.sponsor}</Badge></DetailItem>
                <DetailItem label="Status"><Badge variant={plan.status === 'Active' ? 'success' : 'default'}>{plan.status}</Badge></DetailItem>
                <DetailItem label="Start Date">{projectDetails.startDate}</DetailItem>
                <DetailItem label="End Date">{projectDetails.endDate}</DetailItem>
            </div>
            <InfoSection title="Scope"><p>{projectDetails.scope}</p></InfoSection>
            <InfoSection title="Success Metrics">
                <ul className="list-disc pl-5 space-y-1">{projectDetails.successMetrics.map((metric, i) => <li key={i}>{metric}</li>)}</ul>
            </InfoSection>
            
            <InfoSection title="Financial Impact Analysis">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <FinancialImpactCard title="Outage Costs" cost={`£${financialImpacts.outageCosts.perHour.toLocaleString()}/hr`} frequency={`${financialImpacts.outageCosts.annualFrequency} events/yr`} annualImpact={annualOutageCost} color="red" />
                    <FinancialImpactCard title="Downtime Costs" cost={`£${financialImpacts.downtimeCosts.perEvent.toLocaleString()}/event`} frequency={`${financialImpacts.downtimeCosts.annualFrequency} events/yr`} annualImpact={annualDowntimeCost} color="orange" />
                    <FinancialImpactCard title="Production Loss" cost={`£${financialImpacts.productionLoss.annualCost.toLocaleString()}/yr`} frequency="Annual" annualImpact={annualProductionLoss} color="yellow" />
                    <FinancialImpactCard title="Regulatory Fines" cost={`£${financialImpacts.regulatoryFines.potentialFine.toLocaleString()} potential`} frequency={`${financialImpacts.regulatoryFines.likelihood * 100}% likelihood`} annualImpact={annualRegulatoryRisk} color="purple" />
                </div>
                <div className="mt-4 p-4 bg-primary-50 dark:bg-primary-500/10 rounded-lg flex items-center justify-between">
                    <p className="font-semibold">Calculated 3-Year ROI (based on risk reduction):</p>
                    <p className="text-2xl font-bold text-primary-600">{calculatedROI.toFixed(0)}%</p>
                </div>
            </InfoSection>

            <InfoSection title="Project Background"><p>{plan.projectBackground}</p></InfoSection>
            {plan.stakeholders && plan.stakeholders.length > 0 && (
                <InfoSection title="Stakeholder Analysis">
                    <div className="dashboard-card overflow-x-auto p-0"><table className="min-w-full text-xs">
                        <thead className="bg-secondary-50 dark:bg-secondary-700/50"><tr>
                            <th className="p-2 text-left font-semibold">Name</th>
                            <th className="p-2 text-left font-semibold">Role</th>
                            <th className="p-2 text-left font-semibold">Interest</th>
                        </tr></thead>
                        <tbody className="divide-y divide-secondary-200 dark:divide-secondary-700">
                        {plan.stakeholders.map((s, i) => (
                            <tr key={i}>
                                <td className="p-2">{s.name}</td>
                                <td className="p-2">{s.role}</td>
                                <td className="p-2">{s.interest}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table></div>
                </InfoSection>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoSection title="Quantitative Benefits"><ul className="list-disc pl-5 space-y-1">{plan.benefits.quantitative.map((b, i) => <li key={i}>{b}</li>)}</ul></InfoSection>
                <InfoSection title="Qualitative Benefits"><ul className="list-disc pl-5 space-y-1">{plan.benefits.qualitative.map((b, i) => <li key={i}>{b}</li>)}</ul></InfoSection>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoSection title="Project Constraints"><ul className="list-disc pl-5 space-y-1">{plan.constraints.map((c, i) => <li key={i}>{c}</li>)}</ul></InfoSection>
                <InfoSection title="Dependencies"><ul className="list-disc pl-5 space-y-1">{plan.dependencies.map((d, i) => <li key={i}>{d}</li>)}</ul></InfoSection>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoSection title="Governance & Decision Making">
                    <p><strong>Governance Board:</strong> {plan.governanceStructure.board}</p>
                    <p><strong>Reporting:</strong> {plan.governanceStructure.reporting}</p>
                    <p><strong>Decision Process:</strong> {plan.governanceStructure.decisionProcess}</p>
                </InfoSection>
                <InfoSection title="Technical Approach"><p>{plan.technicalApproach}</p></InfoSection>
            </div>
            <InfoSection title="Assumptions & Prerequisites"><ul className="list-disc pl-5 space-y-1">{plan.assumptions.map((a, i) => <li key={i}>{a}</li>)}</ul></InfoSection>
        </div>
    );
};

const FinancialsTab = ({ plan }) => {
  const { financialForecast, costAssumptions, basisOfCost } = plan;

  return (
    <div className="space-y-8">
      {/* 3-Year Financial Forecast */}
      <div>
        <h3 className="text-lg font-semibold mb-4">3-Year Financial Forecast</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(financialForecast).map(([yearKey, data]) => {
            const total = data.capex + data.opex;
            return (
              <div key={yearKey} className="dashboard-card p-4">
                <h4 className="font-semibold">{`Year ${yearKey.slice(-1)}`}</h4>
                <p className="text-xs text-secondary-500 mb-3">{data.description}</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between"><span>CAPEX:</span><span>£{data.capex.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span>OPEX:</span><span>£{data.opex.toLocaleString()}</span></div>
                  <div className="flex justify-between font-bold border-t pt-1 mt-1"><span>Total:</span><span>£{total.toLocaleString()}</span></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cost Assumptions Table */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Cost Assumptions</h3>
        <div className="dashboard-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-secondary-50 dark:bg-secondary-700/50">
                <tr>
                  <th className="p-3 text-left font-semibold">ROLE/ITEM</th>
                  <th className="p-3 text-left font-semibold">YEAR 1 (£)</th>
                  <th className="p-3 text-left font-semibold">YEAR 2 (£)</th>
                  <th className="p-3 text-left font-semibold">YEAR 3 (£)</th>
                  <th className="p-3 text-left font-semibold">TOTAL (£)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary-200 dark:divide-secondary-700">
                {costAssumptions.map((item, index) => {
                  const total = item.year1 + item.year2 + item.year3;
                  return (
                    <tr key={index}>
                      <td className="p-3 font-medium">{item.item}</td>
                      <td className="p-3">£{item.year1.toLocaleString()}</td>
                      <td className="p-3">£{item.year2.toLocaleString()}</td>
                      <td className="p-3">£{item.year3.toLocaleString()}</td>
                      <td className="p-3 font-semibold">£{total.toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Basis of Cost */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Basis of Cost</h3>
        <div className="dashboard-card p-6 bg-secondary-50 dark:bg-secondary-800/50">
          <ul className="list-disc pl-5 space-y-1 text-sm text-secondary-700 dark:text-secondary-300">
            {basisOfCost.split('•').filter(line => line.trim()).map((line, index) => (
              <li key={index}>{line.trim()}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

const RisksTab = ({ plan }) => (
  <div className="space-y-6">
    <div className="dashboard-card p-6">
      <h3 className="text-lg font-semibold mb-4">Key Risks & Opportunities</h3>
      <div className="space-y-4">
        {plan.keyRisksAndOpportunities.map((item, index) => (
          <div key={index} className={`p-4 rounded-lg border-l-4 ${item.type === 'Risk' ? 'bg-red-50 border-red-400' : 'bg-green-50 border-green-400'}`}>
            <div className="flex justify-between items-start">
              <div>
                <Badge variant={item.type === 'Risk' ? 'error' : 'success'}>{item.type}</Badge>
                <p className="font-medium mt-1">{item.description}</p>
              </div>
              <Badge variant={item.impact === 'High' ? 'error' : 'warning'}>{item.impact} Impact</Badge>
            </div>
            <p className="text-sm text-secondary-600 mt-2"><strong className="font-semibold">Approach:</strong> {item.approach}</p>
          </div>
        ))}
      </div>
    </div>
    <div className="dashboard-card p-6">
      <h3 className="text-lg font-semibold mb-4">NCSC CAF Alignment</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-secondary-50 dark:bg-secondary-700/50">
            <tr>
              <th className="p-3 text-left font-semibold">NIST Function</th>
              <th className="p-3 text-left font-semibold">CAF Control Area</th>
              <th className="p-3 text-left font-semibold">Key Control Gaps</th>
              <th className="p-3 text-left font-semibold">Control Improvement</th>
              <th className="p-3 text-left font-semibold">Positive Contribution</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-secondary-200 dark:divide-secondary-700">
            {plan.cafAlignment.map((item, index) => (
              <tr key={index}>
                <td className="p-3 font-medium text-primary-600">{item.nist}</td>
                <td className="p-3">{item.caf}</td>
                <td className="p-3">{item.gaps}</td>
                <td className="p-3">{item.improvement}</td>
                <td className="p-3">{item.contribution}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    <div className="dashboard-card p-6">
      <h3 className="text-lg font-semibold mb-4">Risk Assessment Table</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-secondary-50 dark:bg-secondary-700/50">
            <tr>
              <th className="p-3 text-left font-semibold">Primary Risk</th>
              <th className="p-3 text-left font-semibold">Threat Family</th>
              <th className="p-3 text-left font-semibold">Scenario</th>
              <th className="p-3 text-left font-semibold">Control Narrative</th>
              <th className="p-3 text-left font-semibold">Risk Reduction</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-secondary-200 dark:divide-secondary-700">
            {plan.riskAssessmentTable.map((item, index) => (
              <tr key={index}>
                <td className="p-3 font-medium text-red-600">{item.risk}</td>
                <td className="p-3">{item.family}</td>
                <td className="p-3">{item.scenario}</td>
                <td className="p-3">{item.narrative}</td>
                <td className="p-3 font-medium" style={{ color: item.reduction.startsWith('High') ? '#ef4444' : '#f97316' }}>{item.reduction}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

// ----------- Timeline Tab -------------

const TimelinePhase = ({ index, phase, duration, keyActivities }) => (
  <div className="relative pl-10">
    {/* vertical line */}
    <span className="absolute top-0 left-4 w-px h-full bg-secondary-200 dark:bg-secondary-700" />
    {/* number circle */}
    <span className="absolute -left-0.5 top-0 flex items-center justify-center w-7 h-7 rounded-full bg-primary-600 text-white text-sm font-semibold">
      {index + 1}
    </span>

    <div className="bg-secondary-50 dark:bg-secondary-800/40 rounded-lg p-5">
      <div className="flex items-start justify-between">
        <h5 className="font-semibold text-secondary-900 dark:text-white">{phase}</h5>
        {duration && (
          <Badge variant="default" size="sm" className="whitespace-nowrap">
            {duration}
          </Badge>
        )}
      </div>
      <p className="text-sm font-semibold mt-3">Key Activities:</p>
      <ul className="list-disc pl-5 mt-1 space-y-0.5 text-sm text-secondary-700 dark:text-secondary-300">
        {keyActivities.map((act, i) => (
          <li key={i}>{act}</li>
        ))}
      </ul>
    </div>
  </div>
);

const TimelineTab = ({ plan }) => (
  <div className="dashboard-card p-6 space-y-6">
    <h3 className="text-lg font-semibold mb-2">High-Level Implementation Plan</h3>
    {plan.implementationPlan && plan.implementationPlan.length > 0 ? (
      <div className="space-y-10">
        {plan.implementationPlan.map((p, idx) => (
          <TimelinePhase
            key={idx}
            index={idx}
            phase={p.phase}
            duration={p.duration}
            keyActivities={p.keyActivities}
          />
        ))}
      </div>
    ) : (
      <p className="text-secondary-500">Timeline details have not been provided for this plan.</p>
    )}
  </div>
);

// ---------- Resources Tab --------------

const ResourcesTab = ({ plan }) => {
  if (!plan.resources || plan.resources.length === 0) {
    return <p className="text-secondary-500">Resource details have not been provided for this plan.</p>;
  }

  /** extract unique skills for matrix */
  const allSkills = Array.from(
    new Set(
      plan.resources
        .flatMap(r => r.skills || [])
        .filter(Boolean)
    )
  );

  return (
    <div className="space-y-8">
      {/* Team Structure */}
      {plan.teamStructure && (
        <div className="dashboard-card p-6">
          <h3 className="text-lg font-semibold mb-3">Team Structure</h3>
          <ul className="space-y-2 text-sm">
            {plan.teamStructure.map((m, i) => (
              <li key={i} className="flex items-center gap-2">
                <Users className="w-4 h-4 text-primary-600" />
                <span className="font-medium">{m.name}</span>
                <span className="text-secondary-500">— {m.role}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Resource Allocation Table */}
      <div className="dashboard-card p-6 overflow-x-auto">
        <h3 className="text-lg font-semibold mb-3">Resource Allocation</h3>
        <table className="min-w-full text-sm">
          <thead className="bg-secondary-50 dark:bg-secondary-700/50">
            <tr>
              <th className="p-3 text-left font-semibold">Role</th>
              <th className="p-3 text-left font-semibold">Name / Supplier</th>
              <th className="p-3 text-left font-semibold">Type</th>
              <th className="p-3 text-left font-semibold">Experience</th>
              <th className="p-3 text-left font-semibold">Allocation</th>
              <th className="p-3 text-left font-semibold">Availability</th>
              <th className="p-3 text-left font-semibold">Responsibilities</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-secondary-200 dark:divide-secondary-700">
            {plan.resources.map((res, i) => (
              <tr key={i}>
                <td className="p-3 font-medium">{res.role}</td>
                <td className="p-3">{res.name}</td>
                <td className="p-3">{res.type || 'Internal'}</td>
                <td className="p-3">{res.experience || '-'}</td>
                <td className="p-3">{res.allocation}</td>
                <td className="p-3">{res.availability || '-'}</td>
                <td className="p-3">{res.responsibilities || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Skills Matrix */}
      <div className="dashboard-card p-6 overflow-x-auto">
        <h3 className="text-lg font-semibold mb-3">Skills Matrix</h3>
        <table className="min-w-full text-xs">
          <thead className="bg-secondary-50 dark:bg-secondary-700/50">
            <tr>
              <th className="p-2 text-left font-semibold">Skill</th>
              {plan.resources.map((r, idx) => (
                <th key={idx} className="p-2 text-left font-semibold whitespace-nowrap">{r.name.split(' ')[0]}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-secondary-200 dark:divide-secondary-700">
            {allSkills.map((skill, i) => (
              <tr key={i}>
                <td className="p-2 font-medium">{skill}</td>
                {plan.resources.map((r, idx) => (
                  <td key={idx} className="p-2">
                    {r.skills && r.skills.includes(skill) ? (
                      <CheckCircle className="w-4 h-4 text-green-500 mx-auto" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-secondary-400 mx-auto" />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Contact Info */}
        <div className="dashboard-card p-6">
        <h3 className="text-lg font-semibold mb-3">Contact Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plan.resources.map((r, i) => (
            <div
              key={i}
              className="bg-secondary-50 dark:bg-secondary-800/50 p-4 rounded-lg space-y-1 text-xs"
            >
              <p className="font-bold text-secondary-900 dark:text-white text-sm">
                {r.name}
              </p>
              {/* Company */}
              {r.company && (
                <p className="flex items-center gap-2 text-secondary-600 dark:text-secondary-400">
                  <Factory className="w-3 h-3" /> {r.company}
                </p>
              )}
              {/* Job Title */}
              {r.jobTitle && (
                <p className="flex items-center gap-2">
                  <BookUser className="w-3 h-3" /> {r.jobTitle}
                </p>
              )}
              {/* Department */}
              {r.department && (
                <p className="flex items-center gap-2">
                  <Briefcase className="w-3 h-3" /> {r.department}
                </p>
              )}
              {/* Email */}
              {r.email && (
                <p className="flex items-center gap-2">
                  <Mail className="w-3 h-3" /> {r.email}
                </p>
              )}
              {/* Phone */}
              {r.phone && (
                <p className="flex items-center gap-2">
                  <Phone className="w-3 h-3" /> {r.phone}
                </p>
              )}
              {/* Location */}
              {r.location && (
                <p className="flex items-center gap-2">
                  <MapPin className="w-3 h-3" /> {r.location}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Resource Timeline */}
      {plan.resourceTimeline && plan.resourceTimeline.length > 0 && (
        <div className="dashboard-card p-6">
          <h3 className="text-lg font-semibold mb-3">Resource Timeline</h3>
          <div className="bg-secondary-50 dark:bg-secondary-800/40 p-4 rounded-lg">
            <div className="space-y-4">
              {plan.resourceTimeline.map((phase, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-36 font-medium text-sm">{phase.name}</div>
                  <div className="flex-grow relative h-8 bg-secondary-200 dark:bg-secondary-700 rounded-full overflow-hidden">
                    <div
                      className="absolute top-0 left-0 h-full bg-primary-500 rounded-full flex items-center justify-center text-xs text-white font-medium"
                      style={{ width: '100%' }}
                    >
                      {phase.start} — {phase.end}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ---------- Calculations Tab --------------

const CalculationsTab = ({ plan }) => {
  if (!plan.calculations) {
    return (
      <p className="text-secondary-500">
        Calculation details have not been provided for this plan.
      </p>
    );
  }

  const {
    equipmentCosts = [],
    resourceCosts = [],
    consultancyCosts = [],
    softwareCosts = [],
    trainingCosts = [],
    notes,
  } = plan.calculations;

  // helpers
  const money = (n) => `£${n.toLocaleString()}`;
  const eqTotal = equipmentCosts.reduce((s, i) => s + i.quantity * i.unitCost, 0);
  const resTotal = resourceCosts.reduce((s, i) => s + i.hours * i.rate, 0);
  const conTotal = consultancyCosts.reduce((s, i) => s + i.cost, 0);
  const swTotal = softwareCosts.reduce((s, i) => s + i.cost, 0);
  const trTotal = trainingCosts.reduce((s, i) => s + i.cost, 0);
  const grandTotal = eqTotal + resTotal + conTotal + swTotal + trTotal;

  const Table = ({ head, rows, footerLabel, footerVal }) => (
    <div className="dashboard-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-secondary-50 dark:bg-secondary-700/50">
            <tr>
              {head.map((h) => (
                <th key={h} className="p-3 text-left font-semibold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-secondary-200 dark:divide-secondary-700">
            {rows}
            <tr className="bg-secondary-50 dark:bg-secondary-800">
              <td
                className="p-3 font-bold"
                colSpan={head.length - 1}
              >
                {footerLabel}
              </td>
              <td className="p-3 font-bold">{money(footerVal)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Equipment */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Equipment Costs</h3>
        <Table
          head={['Item', 'Qty', 'Unit (£)', 'Total (£)']}
          rows={equipmentCosts.map((e, i) => (
            <tr key={i}>
              <td className="p-3 font-medium">{e.item}</td>
              <td className="p-3">{e.quantity}</td>
              <td className="p-3">{money(e.unitCost)}</td>
              <td className="p-3 font-semibold">
                {money(e.quantity * e.unitCost)}
              </td>
            </tr>
          ))}
          footerLabel="Equipment Sub-Total"
          footerVal={eqTotal}
        />
      </div>

      {/* Resources */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Resource Costs</h3>
        <Table
          head={['Role', 'Hours', 'Rate (£/hr)', 'Total (£)']}
          rows={resourceCosts.map((r, i) => (
            <tr key={i}>
              <td className="p-3 font-medium">{r.role}</td>
              <td className="p-3">{r.hours.toLocaleString()}</td>
              <td className="p-3">{money(r.rate)}</td>
              <td className="p-3 font-semibold">
                {money(r.hours * r.rate)}
              </td>
            </tr>
          ))}
          footerLabel="Resource Sub-Total"
          footerVal={resTotal}
        />
      </div>

      {/* Consultancy */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Consultancy Costs</h3>
        <Table
          head={['Service', 'Vendor', 'Cost (£)']}
          rows={consultancyCosts.map((c, i) => (
            <tr key={i}>
              <td className="p-3 font-medium">{c.service}</td>
              <td className="p-3">{c.vendor}</td>
              <td className="p-3 font-semibold">{money(c.cost)}</td>
            </tr>
          ))}
          footerLabel="Consultancy Sub-Total"
          footerVal={conTotal}
        />
      </div>

      {/* Software & Training two-column */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">
            Software &amp; Licensing
          </h3>
          <Table
            head={['Item', 'Type', 'Cost (£)']}
            rows={softwareCosts.map((s, i) => (
              <tr key={i}>
                <td className="p-3 font-medium">{s.item}</td>
                <td className="p-3">{s.subscription}</td>
                <td className="p-3 font-semibold">{money(s.cost)}</td>
              </tr>
            ))}
            footerLabel="Software Sub-Total"
            footerVal={swTotal}
          />
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4">
            Training &amp; Certification
          </h3>
          <Table
            head={['Course', 'Attendees', 'Cost (£)']}
            rows={trainingCosts.map((t, i) => (
              <tr key={i}>
                <td className="p-3 font-medium">{t.course}</td>
                <td className="p-3">{t.attendees}</td>
                <td className="p-3 font-semibold">{money(t.cost)}</td>
              </tr>
            ))}
            footerLabel="Training Sub-Total"
            footerVal={trTotal}
          />
        </div>
      </div>

      {/* Grand Total */}
      <div className="dashboard-card p-6 bg-primary-50 dark:bg-primary-900/20">
        <h3 className="text-lg font-semibold mb-4">Grand Total</h3>
        <div className="text-center text-3xl font-bold text-primary-600">
          {money(grandTotal)}
        </div>
      </div>

      {notes && (
        <InfoSection title="Notes & Assumptions">
          <p>{notes}</p>
        </InfoSection>
      )}
    </div>
  );
};

// --- Main Page Component ---

const BusinessPlanPage = () => {
  const [selectedPlanId, setSelectedPlanId] = useState('BP-NS-001');
  const [activeTab, setActiveTab] = useState('overview');

  const selectedPlan = mockBusinessPlans[selectedPlanId];

  const tabs = [
    { id: 'overview', label: 'Executive Summary', icon: FileText },
    { id: 'details', label: 'Project Details', icon: Info },
    { id: 'financials', label: 'Financials', icon: DollarSign },
    { id: 'timeline', label: 'Timeline', icon: Calendar },
    { id: 'resources', label: 'Resources', icon: Users },
    { id: 'risks', label: 'Risks', icon: AlertTriangle },
    { id: 'calculations', label: 'Calculations', icon: Calculator },
  ];

  const renderTabContent = () => {
    if (!selectedPlan) return null;
    switch (activeTab) {
      case 'overview': return <OverviewTab plan={selectedPlan} />;
      case 'details': return <DetailsTab plan={selectedPlan} />;
      case 'financials': return <FinancialsTab plan={selectedPlan} />;
      case 'risks': return <RisksTab plan={selectedPlan} />;
      case 'timeline': return <TimelineTab plan={selectedPlan} />;
      case 'resources': return <ResourcesTab plan={selectedPlan} />;
      case 'calculations': return <CalculationsTab plan={selectedPlan} />;
      default: return <div className="p-4 text-secondary-500">This section is under construction.</div>;
    }
  };

  return (
    <div className="fade-in h-full flex flex-col space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-white flex items-center">
            <Building2 className="w-7 h-7 mr-3 text-primary-600" />
            Business Plan
          </h1>
          <p className="text-secondary-500 dark:text-secondary-400 mt-1">
            Review comprehensive business cases and project documentation.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedPlanId}
            onChange={e => setSelectedPlanId(e.target.value)}
            className="w-full md:w-64 text-sm border-secondary-300 rounded-md dark:bg-secondary-800 dark:border-secondary-600"
          >
            {Object.keys(mockBusinessPlans).map(id => (
              <option key={id} value={id}>{mockBusinessPlans[id].title}</option>
            ))}
          </select>
          <Button variant="secondary" leadingIcon={Edit}>Edit</Button>
          <Button leadingIcon={Download}>Export</Button>
        </div>
      </div>

      {/* Main Content */}
      {selectedPlan ? (
        <div className="dashboard-card flex-grow flex flex-col">
          <div className="p-4 border-b border-secondary-200 dark:border-secondary-700">
            <div className="flex items-center gap-2 overflow-x-auto">
              {tabs.map(tab => (
                <TabButton
                  key={tab.id}
                  label={tab.label}
                  isActive={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id)}
                />
              ))}
            </div>
          </div>
          <div className="p-6 flex-grow overflow-y-auto">
            {renderTabContent()}
          </div>
        </div>
      ) : (
        <div className="dashboard-card flex-grow flex items-center justify-center text-center">
          <div>
            <Building2 className="w-12 h-12 mx-auto text-secondary-300 dark:text-secondary-600" />
            <h3 className="mt-2 text-lg font-medium">No Business Plan Selected</h3>
            <p className="mt-1 text-sm text-secondary-500">Please select a plan from the dropdown above to view its details.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessPlanPage;
