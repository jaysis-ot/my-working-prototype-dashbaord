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
    projectDetails: {
      startDate: '2024-08-01',
      endDate: '2026-02-01',
      scope: 'Includes all Level 3 and below assets in the primary manufacturing plant. Excludes corporate network infrastructure.',
      successMetrics: ['95% reduction in IT-to-OT cross-network traffic', 'Achieve ISA/IEC 62443 compliance', 'Zero production downtime during rollout'],
    },
    timeline: [
      { name: 'Phase 1: Discovery & Design', status: 'Completed', duration: '3 Months' },
      { name: 'Phase 2: Procurement & Staging', status: 'In Progress', duration: '4 Months' },
      { name: 'Phase 3: Pilot Implementation', status: 'Not Started', duration: '5 Months' },
      { name: 'Phase 4: Full Rollout', status: 'Not Started', duration: '6 Months' },
    ],
    resources: [
      { role: 'Project Manager', name: 'John Doe', allocation: '100%' },
      { role: 'Lead Network Architect', name: 'Brenda Smith', allocation: '75%' },
      { role: 'Security Engineer', name: 'Charles Davis', allocation: '100%' },
      { role: 'OT Specialist', name: 'Diana Miller', allocation: '50%' },
    ],
    costs: [
      { item: 'Hardware (Firewalls, Switches)', amount: 350000 },
      { item: 'Software (Monitoring, NAC)', amount: 150000 },
      { item: 'Professional Services (Implementation)', amount: 200000 },
      { item: 'Contingency', amount: 50000 },
    ],
    risks: [
      { id: 'R-01', description: 'Vendor delivery delays impacting timeline.', probability: 'Medium', impact: 'High' },
      { id: 'R-02', description: 'Incompatibility with legacy OT equipment.', probability: 'Low', impact: 'Critical' },
      { id: 'R-03', description: 'Insufficient staff training on new systems.', probability: 'Medium', impact: 'Medium' },
    ],
    linkedCapabilities: ['CAP-001', 'CAP-003'],
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
    projectDetails: {
      startDate: '2025-01-01',
      endDate: '2025-12-31',
      scope: 'All OT personnel, contractors, and system-to-system accounts. Integration with Active Directory and key OT applications.',
      successMetrics: ['100% MFA coverage for remote access', 'Reduce privileged accounts by 50%', 'Automated access reviews completed quarterly'],
    },
    timeline: [
      { name: 'Phase 1: Vendor Selection', status: 'Not Started', duration: '2 Months' },
      { name: 'Phase 2: Design & PoC', status: 'Not Started', duration: '3 Months' },
      { name: 'Phase 3: Phased Rollout', status: 'Not Started', duration: '6 Months' },
      { name: 'Phase 4: Decommission Old Systems', status: 'Not Started', duration: '1 Month' },
    ],
    resources: [],
    costs: [],
    risks: [],
    linkedCapabilities: ['CAP-002'],
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
  <div>
    <h4 className="font-semibold mb-2 text-secondary-800 dark:text-secondary-100">{title}</h4>
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

const DetailsTab = ({ plan }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <DetailItem label="Project Owner"><Badge variant="info">{plan.owner}</Badge></DetailItem>
    <DetailItem label="Executive Sponsor"><Badge variant="info">{plan.sponsor}</Badge></DetailItem>
    <DetailItem label="Status"><Badge variant={plan.status === 'Active' ? 'success' : 'default'}>{plan.status}</Badge></DetailItem>
    <DetailItem label="Start Date">{plan.projectDetails.startDate}</DetailItem>
    <DetailItem label="End Date">{plan.projectDetails.endDate}</DetailItem>
    <div className="md:col-span-2 lg:col-span-3">
      <DetailItem label="Scope">{plan.projectDetails.scope}</DetailItem>
    </div>
    <div className="md:col-span-2 lg:col-span-3">
      <DetailItem label="Success Metrics">
        <ul className="list-disc pl-5 space-y-1 mt-1">
          {plan.projectDetails.successMetrics.map((metric, i) => <li key={i}>{metric}</li>)}
        </ul>
      </DetailItem>
    </div>
  </div>
);

const FinancialsTab = ({ plan }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div>
      <h4 className="font-semibold mb-2">Cost Breakdown</h4>
      <div className="dashboard-card p-4">
        <ul className="divide-y divide-secondary-200 dark:divide-secondary-700">
          {plan.costs.map(item => (
            <li key={item.item} className="py-2 flex justify-between">
              <span>{item.item}</span>
              <span className="font-semibold">£{item.amount.toLocaleString()}</span>
            </li>
          ))}
          <li className="py-2 flex justify-between font-bold text-primary-600 dark:text-primary-300 border-t-2 border-primary-500">
            <span>Total Budget</span>
            <span>£{plan.executiveSummary.totalBudget.toLocaleString()}</span>
          </li>
        </ul>
      </div>
    </div>
    <div>
      <h4 className="font-semibold mb-2">Value Proposition</h4>
      <div className="dashboard-card p-4 space-y-4">
        <DetailItem label="Estimated ROI">{plan.executiveSummary.estimatedROI}%</DetailItem>
        <DetailItem label="Key Benefits">
          <ul className="list-disc pl-5 space-y-1 mt-1">
            <li>Reduced attack surface</li>
            <li>Improved incident response time</li>
            <li>Enhanced regulatory compliance</li>
          </ul>
        </DetailItem>
      </div>
    </div>
  </div>
);

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
  ];

  const renderTabContent = () => {
    if (!selectedPlan) return null;
    switch (activeTab) {
      case 'overview': return <OverviewTab plan={selectedPlan} />;
      case 'details': return <DetailsTab plan={selectedPlan} />;
      case 'financials': return <FinancialsTab plan={selectedPlan} />;
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
