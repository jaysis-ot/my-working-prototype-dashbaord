// src/components/widgets/StatCardsGrid.jsx
import React from 'react';
import StatCard from '../ui/StatCard';
import { 
  FileText, CheckCircle, Clock, AlertTriangle, Network, Star, 
  DollarSign, Gauge, GitBranch, BarChart3, Shield 
} from 'lucide-react';

const StatCardsGrid = ({ 
  requirements = [], 
  capabilities = [], 
  filteredRequirements = [], 
  onCardClick 
}) => {
  // Calculate statistics
  const stats = {
    total: requirements.length,
    completed: requirements.filter(r => r.status === 'Completed').length,
    inProgress: requirements.filter(r => r.status === 'In Progress').length,
    notStarted: requirements.filter(r => r.status === 'Not Started').length,
    avgBusinessValue: requirements.length > 0 
      ? (requirements.reduce((sum, r) => sum + (r.businessValueScore || 0), 0) / requirements.length).toFixed(1)
      : 0,
    highValueItems: requirements.filter(r => (r.businessValueScore || 0) >= 4).length,
    avgMaturity: requirements.length > 0
      ? (requirements.reduce((sum, r) => sum + (r.maturityLevel?.score || 0), 0) / requirements.length).toFixed(1)
      : 0,
    unassigned: requirements.filter(r => !r.capabilityId).length,
    totalInvestment: (requirements.reduce((sum, r) => sum + (r.costEstimate || 0), 0) / 1000000).toFixed(1),
    essential: requirements.filter(r => r.applicability?.type === 'Essential').length,
    completionRate: requirements.length > 0 
      ? ((requirements.filter(r => r.status === 'Completed').length / requirements.length) * 100).toFixed(0)
      : 0
  };

  // Card configurations
  const cards = [
    {
      title: "Total Requirements",
      value: stats.total,
      icon: FileText,
      color: "#3b82f6",
      subtitle: "+12% this month",
      onClick: () => onCardClick(null, null, 'requirements')
    },
    {
      title: "Completed",
      value: stats.completed,
      icon: CheckCircle,
      color: "#10b981",
      subtitle: `${stats.completionRate}% done`,
      onClick: () => onCardClick('status', 'Completed', 'requirements')
    },
    {
      title: "In Progress",
      value: stats.inProgress,
      icon: Clock,
      color: "#f59e0b",
      subtitle: "Active work",
      onClick: () => onCardClick('status', 'In Progress', 'requirements')
    },
    {
      title: "Not Started",
      value: stats.notStarted,
      icon: AlertTriangle,
      color: "#ef4444",
      subtitle: "Needs attention",
      onClick: () => onCardClick('status', 'Not Started', 'requirements')
    },
    {
      title: "Active Risks",
      value: 15,
      icon: AlertTriangle,
      color: "#ef4444",
      subtitle: "3 critical",
      onClick: () => onCardClick(null, null, 'risk-management')
    },
    {
      title: "Capabilities",
      value: capabilities.length,
      icon: Network,
      color: "#6366f1",
      subtitle: "Active programs",
      onClick: () => onCardClick(null, null, 'capabilities')
    },
    {
      title: "Avg Business Value",
      value: stats.avgBusinessValue,
      icon: Star,
      color: "#fbbf24",
      subtitle: "Out of 5.0",
      onClick: () => onCardClick(null, null, 'justification')
    },
    {
      title: "High Value Items",
      value: stats.highValueItems,
      icon: DollarSign,
      color: "#10b981",
      subtitle: "4.0+ rating",
      onClick: () => onCardClick(null, null, 'justification')
    },
    {
      title: "Avg Maturity",
      value: stats.avgMaturity,
      icon: Gauge,
      color: "#06b6d4",
      subtitle: "Out of 5.0",
      onClick: () => onCardClick(null, null, 'maturity')
    },
    {
      title: "Unassigned",
      value: stats.unassigned,
      icon: GitBranch,
      color: "#f43f5e",
      subtitle: "Need capability",
      onClick: () => onCardClick('capability', '', 'requirements')
    },
    {
      title: "Total Investment",
      value: `£${stats.totalInvestment}M`,
      icon: BarChart3,
      color: "#f97316",
      subtitle: "Estimated cost",
      onClick: () => onCardClick(null, null, 'analytics')
    },
    {
      title: "Essential Items",
      value: stats.essential,
      icon: Shield,
      color: "#14b8a6",
      subtitle: "Must implement",
      onClick: () => onCardClick('applicability', 'Essential', 'requirements')
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
      {cards.map((card, index) => (
        <StatCard
          key={index}
          title={card.title}
          value={card.value}
          icon={card.icon}
          color={card.color}
          subtitle={card.subtitle}
          onClick={card.onClick}
        />
      ))}
    </div>
  );
};

export default StatCardsGrid;