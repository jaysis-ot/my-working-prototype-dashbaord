// src/hooks/usePCDData.js
import { useState, useEffect } from 'react';

export const usePCDData = () => {
  const [pcdData, setPCDData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Generate comprehensive mock PCD data
    try {
      const mockPCDData = {
        'PCD-NS-001': {
          id: 'PCD-NS-001',
          title: 'Network Segmentation Infrastructure Delivery',
          capabilityId: 'CAP-001',
          needsCase: 'The current OT network infrastructure lacks adequate segmentation between operational technology and information technology systems, creating significant cybersecurity risks and potential for cascading failures across critical energy infrastructure. Without proper network segmentation, the organization faces increased vulnerability to cyber attacks, potential regulatory non-compliance, and operational disruption risks that could impact critical energy supply systems.',
          businessPlan: 'This initiative will implement comprehensive network segmentation across all OT environments, establishing secure zones and implementing defense-in-depth strategies aligned with NCSC CAF guidance and Ofgem requirements. The solution will provide enhanced security posture, improved operational resilience, and establish the foundation for future digital transformation initiatives while ensuring full regulatory compliance.',
          basisOfCost: 'Cost estimation based on comprehensive analysis including:\n• Hardware procurement (next-generation firewalls, managed switches, network monitoring tools)\n• Software licensing (security management platforms, monitoring solutions, compliance tools)\n• Professional services (architecture design, implementation services, testing and validation)\n• Training and certification programs for technical and operational staff\n• Ongoing operational costs including maintenance, support, and continuous monitoring\n• Contingency allocation for unforeseen integration complexities',
          alignmentToProjects: [
            'Digital Transformation Programme', 
            'Cybersecurity Enhancement Initiative', 
            'OT Modernisation Project',
            'Regulatory Compliance Framework',
            'Business Continuity Enhancement'
          ],
          scopeBoundary: 'Project scope includes all primary substations, control centers, generation facilities, and critical operational sites. Implementation covers network infrastructure segmentation, security zone establishment, monitoring system deployment, and staff training. Excludes legacy systems scheduled for decommission within 12 months and third-party contractor networks (separate initiative).',
          businessOutcomes: [
            'Reduced cybersecurity risk exposure by 70% through comprehensive network isolation',
            'Improved operational resilience and 99.9% availability target achievement',
            'Enhanced regulatory compliance (NCSC CAF, NIS Directive, Ofgem Framework)',
            'Foundation established for future digital initiatives and Industry 4.0 adoption',
            'Reduced incident response time by 60% through enhanced monitoring capabilities'
          ],
          keyRisks: [
            {
              type: 'Risk',
              description: 'Implementation could disrupt critical operations during deployment',
              impact: 'High',
              approach: 'Phased implementation during planned maintenance windows with comprehensive rollback procedures'
            },
            {
              type: 'Risk', 
              description: 'Legacy system compatibility issues may require additional integration work',
              impact: 'Medium',
              approach: 'Comprehensive compatibility assessment and dedicated integration testing phase'
            },
            {
              type: 'Opportunity',
              description: 'Enhanced monitoring capabilities enable advanced analytics and predictive maintenance',
              impact: 'Medium',
              approach: 'Implement AI-driven threat detection and operational optimization capabilities'
            },
            {
              type: 'Opportunity',
              description: 'Network segmentation provides foundation for zero-trust architecture',
              impact: 'High',
              approach: 'Develop comprehensive zero-trust roadmap leveraging segmentation infrastructure'
            }
          ],
          dependencies: [
            'Completion of comprehensive network topology assessment and documentation',
            'Approval and finalization of cybersecurity architecture standards and policies',
            'Availability of certified technical resources and specialist contractors',
            'Procurement approval for required hardware and software components',
            'Coordination with operational teams for maintenance window scheduling'
          ],
          assumptions: [
            'Current network infrastructure can support additional security controls without major upgrades',
            'Operational teams will be available for training during implementation period',
            'Regulatory requirements will remain stable during 18-month delivery period',
            'Third-party vendors will provide necessary support and integration capabilities',
            'Budget allocation remains consistent with approved funding model'
          ],
          highLevelPlan: [
            { 
              phase: 'Phase 1: Design & Planning', 
              duration: '3 months', 
              activities: [
                'Detailed architecture design and security zone definition',
                'Hardware and software procurement and delivery',
                'Resource allocation and team establishment',
                'Risk assessment and mitigation planning'
              ]
            },
            { 
              phase: 'Phase 2: Pilot Implementation', 
              duration: '2 months', 
              activities: [
                'Pilot site setup and initial configuration',
                'Integration testing and security validation',
                'Performance testing and optimization',
                'Initial staff training and documentation'
              ]
            },
            { 
              phase: 'Phase 3: Production Rollout', 
              duration: '12 months', 
              activities: [
                'Site-by-site implementation across all locations',
                'Comprehensive staff training and certification',
                'Operational handover and support transition',
                'Continuous monitoring and optimization'
              ]
            },
            { 
              phase: 'Phase 4: Optimization & Closure', 
              duration: '1 month', 
              activities: [
                'Performance tuning and final optimization',
                'Complete documentation and knowledge transfer',
                'Project closure and lessons learned capture',
                'Transition to business-as-usual operations'
              ]
            }
          ],
          forecast: {
            year1: { capex: 450000, opex: 125000, description: 'Initial implementation and setup costs' },
            year2: { capex: 200000, opex: 150000, description: 'Rollout completion and operational ramp-up' },
            year3: { capex: 100000, opex: 175000, description: 'Optimization and steady-state operations' }
          },
          cafAlignment: [
            {
              nistFunction: 'Identify',
              cafControlArea: 'Asset Management',
              keyControlGaps: 'Incomplete OT asset inventory and classification',
              controlImprovement: 'Implement automated asset discovery and comprehensive classification system',
              positiveContribution: 'Enhanced visibility of all network connected devices and systems'
            },
            {
              nistFunction: 'Protect',
              cafControlArea: 'Access Control',
              keyControlGaps: 'Insufficient network segmentation and access controls',
              controlImprovement: 'Deploy microsegmentation with zero-trust access principles',
              positiveContribution: 'Significantly reduced attack surface and prevention of lateral movement'
            },
            {
              nistFunction: 'Detect',
              cafControlArea: 'Security Monitoring',
              keyControlGaps: 'Limited visibility into network traffic and anomalies',
              controlImprovement: 'Comprehensive network monitoring with behavioral analysis',
              positiveContribution: 'Real-time threat detection and automated incident response'
            },
            {
              nistFunction: 'Respond',
              cafControlArea: 'Incident Response',
              keyControlGaps: 'Slow incident containment due to network visibility limitations',
              controlImprovement: 'Automated containment and rapid response capabilities',
              positiveContribution: 'Reduced incident response time from hours to minutes'
            }
          ],
          riskTable: [
            {
              primaryRisk: 'Cyber Attack via IT/OT Bridge',
              threatFamily: 'Advanced Persistent Threat',
              scenario: 'External attacker compromises IT network and attempts to pivot to OT systems for operational disruption',
              controlNarrative: 'Network segmentation with deep packet inspection, behavioral monitoring, and automated containment',
              riskReduction: 'High - 70% reduction in successful attack probability and 90% reduction in impact scope'
            },
            {
              primaryRisk: 'Insider Threat - Malicious Access',
              threatFamily: 'Insider Threat',
              scenario: 'Authorized user attempts unauthorized access to critical OT systems beyond their role requirements',
              controlNarrative: 'Role-based access controls with network-level enforcement and comprehensive activity monitoring',
              riskReduction: 'Medium - 60% reduction in unauthorized access capability and 100% improvement in detection time'
            },
            {
              primaryRisk: 'Operational System Failure',
              threatFamily: 'System Failure',
              scenario: 'Critical operational system failure causing cascading impacts across interconnected systems',
              controlNarrative: 'Network isolation and redundancy ensuring failure containment and rapid recovery',
              riskReduction: 'Medium - 50% reduction in cascading failure probability and 80% improvement in recovery time'
            }
          ],
          pcdOverview: {
            overview: 'Comprehensive network segmentation initiative to enhance cybersecurity posture and operational resilience',
            pcdId: 'PCD-NS-001',
            output: 'Fully segmented OT network infrastructure with enhanced monitoring and security controls',
            deliveryDate: '2026-12-31',
            allowance: '£975,000'
          },
          costAssumptions: [
            { roleItem: 'Project Manager (Senior)', year1: 85000, year2: 87000, year3: 89000 },
            { roleItem: 'Security Architect (Lead)', year1: 95000, year2: 97000, year3: 99000 },
            { roleItem: 'Network Engineers (2 FTE)', year1: 140000, year2: 143000, year3: 146000 },
            { roleItem: 'Security Engineers (2 FTE)', year1: 130000, year2: 133000, year3: 136000 },
            { roleItem: 'Hardware & Infrastructure', year1: 300000, year2: 100000, year3: 50000 },
            { roleItem: 'Software Licensing', year1: 80000, year2: 85000, year3: 90000 },
            { roleItem: 'Professional Services', year1: 120000, year2: 60000, year3: 30000 },
            { roleItem: 'Training & Certification', year1: 45000, year2: 23000, year3: 15000 },
            { roleItem: 'Operational Support', year1: 25000, year2: 40000, year3: 45000 },
            { roleItem: 'Contingency (10%)', year1: 50000, year2: 25000, year3: 15000 }
          ],
          lastUpdated: '2025-06-10'
        }
      };
      
      setPCDData(mockPCDData);
      setLoading(false);
    } catch (err) {
      setError('Failed to load PCD data');
      setLoading(false);
    }
  }, []);

  const updatePCDData = (pcdId, updatedData) => {
    try {
      setPCDData(prev => ({
        ...prev,
        [pcdId]: { 
          ...prev[pcdId], 
          ...updatedData,
          lastUpdated: new Date().toISOString().split('T')[0]
        }
      }));
      return true;
    } catch (err) {
      setError('Failed to update PCD data');
      return false;
    }
  };

  const addPCDData = (newPCD) => {
    try {
      setPCDData(prev => ({
        ...prev,
        [newPCD.id]: {
          ...newPCD,
          lastUpdated: new Date().toISOString().split('T')[0]
        }
      }));
      return true;
    } catch (err) {
      setError('Failed to add PCD data');
      return false;
    }
  };

  const deletePCDData = (pcdId) => {
    try {
      setPCDData(prev => {
        const updated = { ...prev };
        delete updated[pcdId];
        return updated;
      });
      return true;
    } catch (err) {
      setError('Failed to delete PCD data');
      return false;
    }
  };

  const calculatePCDMetrics = () => {
    const pcds = Object.values(pcdData);
    
    if (pcds.length === 0) {
      return {
        totalPCDs: 0,
        totalAllowance: 0,
        averageDuration: 0,
        totalCapex: 0,
        totalOpex: 0
      };
    }

    const totalAllowance = pcds.reduce((sum, pcd) => {
      const allowanceString = pcd.pcdOverview?.allowance || '£0';
      const amount = parseInt(allowanceString.replace(/[£,]/g, '')) || 0;
      return sum + amount;
    }, 0);

    const totalCapex = pcds.reduce((sum, pcd) => {
      if (!pcd.forecast) return sum;
      return sum + (pcd.forecast.year1?.capex || 0) + 
                   (pcd.forecast.year2?.capex || 0) + 
                   (pcd.forecast.year3?.capex || 0);
    }, 0);

    const totalOpex = pcds.reduce((sum, pcd) => {
      if (!pcd.forecast) return sum;
      return sum + (pcd.forecast.year1?.opex || 0) + 
                   (pcd.forecast.year2?.opex || 0) + 
                   (pcd.forecast.year3?.opex || 0);
    }, 0);

    // Calculate average duration from high level plans
    const durations = pcds.map(pcd => {
      if (!pcd.highLevelPlan) return 0;
      return pcd.highLevelPlan.reduce((total, phase) => {
        const months = parseInt(phase.duration.split(' ')[0]) || 0;
        return total + months;
      }, 0);
    }).filter(d => d > 0);

    const averageDuration = durations.length > 0 
      ? durations.reduce((sum, d) => sum + d, 0) / durations.length 
      : 0;

    return {
      totalPCDs: pcds.length,
      totalAllowance,
      averageDuration: Math.round(averageDuration),
      totalCapex,
      totalOpex,
      totalCost: totalCapex + totalOpex
    };
  };

  return { 
    pcdData, 
    loading, 
    error, 
    updatePCDData,
    addPCDData,
    deletePCDData,
    calculatePCDMetrics
  };
};