// src/components/widgets/RegulatoryBanner.jsx
import React, { useState } from 'react';
import { 
  Shield, Network, Lock, Building2, Eye, EyeOff, Info,
  CheckCircle, Clock, AlertTriangle, ExternalLink, FileText,
  Calendar, Target, Users, Globe, Award, Scale
} from 'lucide-react';

/**
 * Regulatory Banner Widget Component
 * 
 * Displays regulatory compliance framework information and status.
 * Provides context about applicable regulations, compliance status,
 * and quick access to related documentation and requirements.
 * 
 * Features:
 * - Industry-specific regulatory frameworks
 * - Compliance status indicators
 * - Framework descriptions and deadlines
 * - Quick access to compliance requirements
 * - Expandable detailed information
 * - Customizable for different industries
 * - Integration with company profile
 */
const RegulatoryBanner = ({
  companyProfile = null,
  showStatus = true,
  expandable = true,
  compact = false,
  onFrameworkClick = null,
  onComplianceView = null,
  className = ''
}) => {

  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedFramework, setSelectedFramework] = useState(null);

  // Get industry-specific regulatory frameworks
  const getRegulatoryFrameworks = () => {
    const industry = companyProfile?.industry?.toLowerCase() || 'general';
    
    const frameworksByIndustry = {
      energy: [
        {
          id: 'ofgem',
          name: 'Ofgem Framework',
          description: 'Clean power transition by 2030',
          icon: Network,
          color: 'blue',
          status: 'compliant',
          deadline: '2030-12-31',
          requirements: 45,
          completedRequirements: 32,
          priority: 'high',
          link: 'https://www.ofgem.gov.uk'
        },
        {
          id: 'ncsc-caf',
          name: 'NCSC CAF Guidance',
          description: 'OES compliance mapping',
          icon: Lock,
          color: 'red',
          status: 'in-progress',
          deadline: '2024-12-31',
          requirements: 28,
          completedRequirements: 18,
          priority: 'critical',
          link: 'https://www.ncsc.gov.uk'
        },
        {
          id: 'nis-directive',
          name: 'NIS Directive',
          description: 'Network and Information Security',
          icon: Shield,
          color: 'purple',
          status: 'compliant',
          deadline: '2024-06-30',
          requirements: 22,
          completedRequirements: 22,
          priority: 'medium',
          link: 'https://ec.europa.eu'
        }
      ],
      finance: [
        {
          id: 'pci-dss',
          name: 'PCI DSS',
          description: 'Payment Card Industry Data Security',
          icon: Lock,
          color: 'green',
          status: 'compliant',
          deadline: '2024-12-31',
          requirements: 35,
          completedRequirements: 35,
          priority: 'critical',
          link: 'https://www.pcisecuritystandards.org'
        },
        {
          id: 'gdpr',
          name: 'GDPR',
          description: 'General Data Protection Regulation',
          icon: Shield,
          color: 'blue',
          status: 'compliant',
          deadline: 'ongoing',
          requirements: 18,
          completedRequirements: 16,
          priority: 'high',
          link: 'https://gdpr.eu'
        },
        {
          id: 'basel-iii',
          name: 'Basel III',
          description: 'International regulatory framework',
          icon: Building2,
          color: 'indigo',
          status: 'in-progress',
          deadline: '2025-01-01',
          requirements: 42,
          completedRequirements: 28,
          priority: 'high',
          link: 'https://www.bis.org'
        }
      ],
      healthcare: [
        {
          id: 'hipaa',
          name: 'HIPAA',
          description: 'Health Insurance Portability',
          icon: Shield,
          color: 'green',
          status: 'compliant',
          deadline: 'ongoing',
          requirements: 25,
          completedRequirements: 23,
          priority: 'critical',
          link: 'https://www.hhs.gov'
        },
        {
          id: 'gdpr',
          name: 'GDPR',
          description: 'Data protection for health data',
          icon: Lock,
          color: 'blue',
          status: 'compliant',
          deadline: 'ongoing',
          requirements: 20,
          completedRequirements: 18,
          priority: 'high',
          link: 'https://gdpr.eu'
        }
      ],
      general: [
        {
          id: 'iso27001',
          name: 'ISO 27001',
          description: 'Information Security Management',
          icon: Award,
          color: 'purple',
          status: 'in-progress',
          deadline: '2024-12-31',
          requirements: 114,
          completedRequirements: 76,
          priority: 'high',
          link: 'https://www.iso.org'
        },
        {
          id: 'gdpr',
          name: 'GDPR',
          description: 'General Data Protection Regulation',
          icon: Shield,
          color: 'blue',
          status: 'compliant',
          deadline: 'ongoing',
          requirements: 18,
          completedRequirements: 16,
          priority: 'high',
          link: 'https://gdpr.eu'
        },
        {
          id: 'business-value',
          name: 'Business Justification',
          description: 'Value & impact analysis',
          icon: Building2,
          color: 'green',
          status: 'active',
          deadline: 'ongoing',
          requirements: 0,
          completedRequirements: 0,
          priority: 'medium',
          link: null
        }
      ]
    };

    return frameworksByIndustry[industry] || frameworksByIndustry.general;
  };

  // Get status configuration
  const getStatusConfig = (status) => {
    const statusConfigs = {
      compliant: {
        icon: CheckCircle,
        color: 'text-green-600',
        bg: 'bg-green-100',
        label: 'Compliant'
      },
      'in-progress': {
        icon: Clock,
        color: 'text-yellow-600',
        bg: 'bg-yellow-100',
        label: 'In Progress'
      },
      'non-compliant': {
        icon: AlertTriangle,
        color: 'text-red-600',
        bg: 'bg-red-100',
        label: 'Non-Compliant'
      },
      active: {
        icon: Target,
        color: 'text-blue-600',
        bg: 'bg-blue-100',
        label: 'Active'
      }
    };

    return statusConfigs[status] || statusConfigs.active;
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    const colors = {
      critical: 'border-l-red-500',
      high: 'border-l-orange-500',
      medium: 'border-l-yellow-500',
      low: 'border-l-green-500'
    };
    return colors[priority] || colors.medium;
  };

  // Calculate overall compliance percentage
  const getOverallCompliance = () => {
    const frameworks = getRegulatoryFrameworks();
    const totalRequirements = frameworks.reduce((sum, f) => sum + f.requirements, 0);
    const completedRequirements = frameworks.reduce((sum, f) => sum + f.completedRequirements, 0);
    
    return totalRequirements > 0 ? Math.round((completedRequirements / totalRequirements) * 100) : 100;
  };

  const frameworks = getRegulatoryFrameworks();
  const overallCompliance = getOverallCompliance();

  return (
    <div className={`bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-xl p-6 text-white relative overflow-hidden ${className}`}>
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-16 -mt-16" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-5 rounded-full -ml-12 -mb-12" />
      
      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Shield className="h-6 w-6 mr-3" />
            <div>
              <h3 className={`font-semibold ${compact ? 'text-lg' : 'text-xl'}`}>
                Regulatory Compliance Framework
              </h3>
              <p className="text-blue-100 text-sm mt-1">
                {companyProfile?.companyName || 'Your organization'} compliance status
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {showStatus && (
              <div className="text-right">
                <div className={`font-bold ${compact ? 'text-lg' : 'text-2xl'}`}>
                  {overallCompliance}%
                </div>
                <div className="text-blue-100 text-xs">Overall Compliance</div>
              </div>
            )}
            <div className="text-sm bg-white bg-opacity-20 px-3 py-1 rounded-full">
              Active Compliance
            </div>
            {expandable && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                title={isExpanded ? "Show less" : "Show more"}
              >
                {isExpanded ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            )}
          </div>
        </div>

        {/* Frameworks Grid */}
        <div className={`grid gap-6 ${compact ? 'md:grid-cols-2' : 'md:grid-cols-3'} ${frameworks.length > 3 ? 'lg:grid-cols-3' : ''}`}>
          {frameworks.map((framework) => {
            const Icon = framework.icon;
            const statusConfig = getStatusConfig(framework.status);
            const StatusIcon = statusConfig.icon;
            const completionRate = framework.requirements > 0 
              ? (framework.completedRequirements / framework.requirements) * 100 
              : 100;

            return (
              <div 
                key={framework.id}
                className={`bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4 border-l-4 hover:bg-opacity-20 transition-all duration-200 cursor-pointer ${getPriorityColor(framework.priority)}`}
                onClick={() => {
                  setSelectedFramework(framework);
                  if (onFrameworkClick) onFrameworkClick(framework);
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-sm">{framework.name}</div>
                      <div className="text-blue-100 text-xs mt-1">{framework.description}</div>
                    </div>
                  </div>
                  
                  {showStatus && (
                    <div className={`p-1 rounded-full ${statusConfig.bg}`}>
                      <StatusIcon className={`h-3 w-3 ${statusConfig.color}`} />
                    </div>
                  )}
                </div>

                {/* Progress Bar */}
                {framework.requirements > 0 && (
                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-blue-100">Progress</span>
                      <span className="font-medium">{Math.round(completionRate)}%</span>
                    </div>
                    <div className="w-full bg-white bg-opacity-20 rounded-full h-2">
                      <div 
                        className="bg-white bg-opacity-80 h-2 rounded-full transition-all duration-500" 
                        style={{ width: `${completionRate}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs mt-1 text-blue-200">
                      <span>{framework.completedRequirements} completed</span>
                      <span>{framework.requirements} total</span>
                    </div>
                  </div>
                )}

                {/* Deadline */}
                {framework.deadline !== 'ongoing' && (
                  <div className="flex items-center text-xs text-blue-200">
                    <Calendar className="h-3 w-3 mr-1" />
                    <span>Due: {new Date(framework.deadline).toLocaleDateString()}</span>
                  </div>
                )}

                {/* External Link */}
                {framework.link && (
                  <div className="mt-2">
                    <a
                      href={framework.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-xs text-blue-200 hover:text-white transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      View guidance
                    </a>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Expanded Information */}
        {isExpanded && (
          <div className="mt-6 pt-6 border-t border-white border-opacity-20">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Compliance Summary */}
              <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4">
                <h4 className="font-semibold mb-3 flex items-center">
                  <Scale className="h-4 w-4 mr-2" />
                  Compliance Summary
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-200">Total Frameworks:</span>
                    <span className="font-medium">{frameworks.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-200">Total Requirements:</span>
                    <span className="font-medium">{frameworks.reduce((sum, f) => sum + f.requirements, 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-200">Completed:</span>
                    <span className="font-medium">{frameworks.reduce((sum, f) => sum + f.completedRequirements, 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-200">Overall Status:</span>
                    <span className="font-medium">{overallCompliance}% Compliant</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4">
                <h4 className="font-semibold mb-3 flex items-center">
                  <Target className="h-4 w-4 mr-2" />
                  Quick Actions
                </h4>
                <div className="space-y-2">
                  <button 
                    onClick={() => onComplianceView?.('requirements')}
                    className="w-full flex items-center justify-between p-2 bg-white bg-opacity-10 hover:bg-opacity-20 rounded text-sm transition-colors"
                  >
                    <span className="flex items-center">
                      <FileText className="h-3 w-3 mr-2" />
                      View All Requirements
                    </span>
                    <span className="text-blue-200">→</span>
                  </button>
                  <button 
                    onClick={() => onComplianceView?.('gaps')}
                    className="w-full flex items-center justify-between p-2 bg-white bg-opacity-10 hover:bg-opacity-20 rounded text-sm transition-colors"
                  >
                    <span className="flex items-center">
                      <AlertTriangle className="h-3 w-3 mr-2" />
                      Review Compliance Gaps
                    </span>
                    <span className="text-blue-200">→</span>
                  </button>
                  <button 
                    onClick={() => onComplianceView?.('timeline')}
                    className="w-full flex items-center justify-between p-2 bg-white bg-opacity-10 hover:bg-opacity-20 rounded text-sm transition-colors"
                  >
                    <span className="flex items-center">
                      <Calendar className="h-3 w-3 mr-2" />
                      View Compliance Timeline
                    </span>
                    <span className="text-blue-200">→</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Industry Context */}
        {companyProfile?.industry && !compact && (
          <div className="mt-4 text-xs text-blue-200 flex items-center">
            <Globe className="h-3 w-3 mr-1" />
            <span>Frameworks applicable to {companyProfile.industry} industry</span>
            {companyProfile.operatingRegions && (
              <span className="ml-2">• Operating in {companyProfile.operatingRegions.length} regions</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RegulatoryBanner;