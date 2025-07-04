import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronRight, ChevronDown, Download, Upload, BarChart3, Target, Shield } from 'lucide-react';

// Complete NIST CSF 2.0 Structure
const NIST_CSF_STRUCTURE = {
  GV: {
    name: "Govern",
    description: "The organization's cybersecurity risk management strategy, expectations, and policy are established, communicated, and monitored",
    categories: {
      "GV.OC": {
        name: "Organizational Context",
        description: "The circumstances – mission, stakeholder expectations, dependencies, and legal, regulatory, and contractual requirements – surrounding the organization's cybersecurity risk management decisions are understood",
        subcategories: {
          "GV.OC-01": {
            name: "Mission and Objectives Understanding",
            description: "The organizational mission, objectives, and activities are understood and used to inform cybersecurity roles, responsibilities, and risk management decisions"
          },
          "GV.OC-02": {
            name: "Internal and External Stakeholders",
            description: "Internal and external stakeholders are understood, and their needs and expectations regarding cybersecurity are understood and considered"
          },
          "GV.OC-03": {
            name: "Legal and Regulatory Requirements",
            description: "Legal, regulatory, and contractual requirements regarding cybersecurity — including privacy and civil liberties obligations — are understood and managed"
          },
          "GV.OC-04": {
            name: "Critical Technology and Services",
            description: "Critical objectives, capabilities, and services that stakeholders depend on or expect from the organization are understood and communicated"
          },
          "GV.OC-05": {
            name: "Organizational Dependencies",
            description: "Outcomes, capabilities, and services that the organization depends on and that are essential to achieving organizational objectives are understood and communicated"
          }
        }
      },
      "GV.RM": {
        name: "Risk Management Strategy",
        description: "The organization's priorities, constraints, risk tolerance and appetite statements, and assumptions are established, communicated, and used to support operational risk decisions",
        subcategories: {
          "GV.RM-01": {
            name: "Risk Management Objectives",
            description: "Risk management objectives are established and used to establish priorities for organizational cybersecurity risk management activities"
          },
          "GV.RM-02": {
            name: "Risk Appetite and Tolerance",
            description: "Risk appetite and risk tolerance statements are established, communicated, and maintained"
          },
          "GV.RM-03": {
            name: "Risk Management Determination",
            description: "Determinations of risk tolerance are informed by the potential impacts of loss, disruption, or compromise of organizational assets and the mission they support"
          },
          "GV.RM-04": {
            name: "Strategic Risk Decisions",
            description: "Strategic direction that describes appropriate risk response options is established and communicated"
          },
          "GV.RM-05": {
            name: "Risk Management Lines",
            description: "Lines of authority for risk management decisions related to cybersecurity are established"
          },
          "GV.RM-06": {
            name: "Risk Management Integration",
            description: "A standardized method for calculating, documenting, categorizing, and prioritizing cybersecurity risks is established"
          },
          "GV.RM-07": {
            name: "Strategic Risk Assessment",
            description: "Strategic risks, including those related to cybersecurity, are considered in organizational risk assessments and communicated to stakeholders"
          }
        }
      },
      "GV.RR": {
        name: "Roles, Responsibilities, and Authorities",
        description: "Cybersecurity roles, responsibilities, and authorities to foster accountability, performance assessment, and continuous improvement are established and communicated",
        subcategories: {
          "GV.RR-01": {
            name: "Cybersecurity Leadership",
            description: "Organizational leadership is responsible and accountable for cybersecurity risk and fosters a culture that is risk-aware, ethical, and continually improving"
          },
          "GV.RR-02": {
            name: "Roles and Responsibilities",
            description: "Roles, responsibilities, and authorities related to cybersecurity risk management are established, communicated, understood, and enforced"
          },
          "GV.RR-03": {
            name: "Adequate Resources",
            description: "Adequate resources are allocated commensurate with the cybersecurity risk strategy, roles, responsibilities, and policies"
          },
          "GV.RR-04": {
            name: "Cybersecurity is Integrated",
            description: "Cybersecurity is included in human resources practices"
          }
        }
      },
      "GV.PO": {
        name: "Policy",
        description: "Organizational cybersecurity policy is established, communicated, and enforced",
        subcategories: {
          "GV.PO-01": {
            name: "Policy Establishment",
            description: "Policy for managing cybersecurity risks is established based on organizational context, cybersecurity strategy, and priorities and is communicated and enforced"
          },
          "GV.PO-02": {
            name: "Policy Review and Updates",
            description: "Policy for managing cybersecurity risks is reviewed, updated, communicated, and enforced to reflect changes in requirements, threats, technology, and organizational mission"
          }
        }
      },
      "GV.OV": {
        name: "Oversight",
        description: "Results of organization-wide cybersecurity risk management activities and performance are used to inform, improve, and adjust the risk management strategy",
        subcategories: {
          "GV.OV-01": {
            name: "Cybersecurity Strategy Implementation",
            description: "Cybersecurity risk management strategy implementation is monitored and reviewed for adequacy and effectiveness"
          },
          "GV.OV-02": {
            name: "Cybersecurity Strategy Outcomes",
            description: "The cybersecurity risk management strategy is reviewed and adjusted to ensure coverage of organizational requirements and risks"
          },
          "GV.OV-03": {
            name: "Oversight Activities Results",
            description: "Organizational cybersecurity risk management performance is evaluated and reviewed for adjustments needed in strategy and direction"
          }
        }
      },
      "GV.SC": {
        name: "Cybersecurity Supply Chain Risk Management",
        description: "Cyber supply chain risk management processes are identified, established, managed, monitored, and improved by organizational stakeholders",
        subcategories: {
          "GV.SC-01": {
            name: "Supply Chain Strategy",
            description: "A cybersecurity supply chain risk management strategy is established, implemented, and managed"
          },
          "GV.SC-02": {
            name: "Supply Chain Risk Assessment",
            description: "Cybersecurity risk throughout the supply chain is identified, analyzed, and documented"
          },
          "GV.SC-03": {
            name: "Supply Chain Risks Integration",
            description: "Cybersecurity supply chain risk management is integrated into cybersecurity and enterprise risk management, risk assessment, and improvement activities"
          },
          "GV.SC-04": {
            name: "Suppliers and Third Parties",
            description: "Suppliers are known and prioritized by criticality"
          },
          "GV.SC-05": {
            name: "Supply Chain Requirements",
            description: "Requirements to address cybersecurity risks in supply chains are established, prioritized, and integrated into contracts and other types of agreements with suppliers and other relevant third parties"
          },
          "GV.SC-06": {
            name: "Planning and Due Diligence",
            description: "Planning and due diligence are performed to reduce risks before entering into formal supplier or other third-party relationships"
          },
          "GV.SC-07": {
            name: "Supply Chain Information Sharing",
            description: "The risks posed by a supplier, their products, or their services are understood, recorded, prioritized, assessed, responded to, and monitored over the course of the relationship"
          },
          "GV.SC-08": {
            name: "Incident and Vulnerability Disclosure",
            description: "Relevant suppliers and other third parties are included in incident planning, response, and recovery activities"
          },
          "GV.SC-09": {
            name: "Supply Chain Incident Management",
            description: "Supply chain incidents are identified and managed"
          },
          "GV.SC-10": {
            name: "Supply Chain Resilience",
            description: "Cybersecurity supply chain risk management plans include provisions for activities that occur after a cybersecurity incident"
          }
        }
      }
    }
  },
  ID: {
    name: "Identify",
    description: "The organization's current cybersecurity risks are understood",
    categories: {
      "ID.AM": {
        name: "Asset Management",
        description: "Assets (e.g., data, hardware, software, systems, facilities, services, people) that enable the organization to achieve business purposes are identified and managed consistent with their relative importance to organizational objectives and the organization's risk strategy",
        subcategories: {
          "ID.AM-01": {
            name: "Asset Inventories",
            description: "Inventories of hardware, software, services, and systems are maintained"
          },
          "ID.AM-02": {
            name: "Asset Ownership",
            description: "Inventories of software, services, and systems include ownership information"
          },
          "ID.AM-03": {
            name: "Organizational Communication",
            description: "Organizational communication and data flows are mapped and documented"
          },
          "ID.AM-04": {
            name: "Technology Asset Cataloging",
            description: "Technology assets are catalogued with network, hardware, software, and application dependencies"
          },
          "ID.AM-05": {
            name: "Asset Prioritization",
            description: "Assets are prioritized based on classification, criticality, business functions, and value"
          },
          "ID.AM-06": {
            name: "Asset Management Policy",
            description: "Cybersecurity roles, responsibilities, and authorities for asset management are established, communicated, and coordinated with internal and external stakeholders"
          },
          "ID.AM-07": {
            name: "Asset Inventory Updates",
            description: "Inventories of assets and their attributes are updated, and assets are removed when they are no longer under organizational control"
          },
          "ID.AM-08": {
            name: "Critical Systems and Components",
            description: "Systems, hardware, software, services, and data are managed throughout their life cycles"
          }
        }
      },
      "ID.RA": {
        name: "Risk Assessment",
        description: "The cybersecurity risk to the organization, assets, and individuals is understood",
        subcategories: {
          "ID.RA-01": {
            name: "Asset Vulnerabilities",
            description: "Asset vulnerabilities are identified, validated, and recorded"
          },
          "ID.RA-02": {
            name: "Cyber Threat Intelligence",
            description: "Cyber threat intelligence is received from information sharing forums and sources"
          },
          "ID.RA-03": {
            name: "Internal and External Threats",
            description: "Internal and external threats to the organization are identified and recorded"
          },
          "ID.RA-04": {
            name: "Potential Business Impacts",
            description: "Potential business impacts and likelihoods are identified"
          },
          "ID.RA-05": {
            name: "Threat and Vulnerability Information",
            description: "Threats, vulnerabilities, likelihoods, and impacts are used to understand inherent risk and to inform risk response priority decisions"
          },
          "ID.RA-06": {
            name: "Risk Responses",
            description: "Risk responses are chosen, prioritized, planned, tracked, and communicated"
          },
          "ID.RA-07": {
            name: "Changes Affecting Risk",
            description: "Changes and exceptions are managed, assessed for risk impact, recorded, and tracked"
          },
          "ID.RA-08": {
            name: "Processes for Receiving Vulnerability Disclosures",
            description: "Processes for receiving, analyzing, and responding to vulnerability disclosures are established"
          }
        }
      },
      "ID.IM": {
        name: "Improvement",
        description: "The organization's approach to managing cybersecurity risks is established, communicated, and continuously improved",
        subcategories: {
          "ID.IM-01": {
            name: "Improvement Measurements",
            description: "Improvements to organizational cybersecurity risk management processes, procedures, and activities are identified from various sources"
          },
          "ID.IM-02": {
            name: "Improvement Implementation",
            description: "Improvement opportunities are prioritized and implemented"
          },
          "ID.IM-03": {
            name: "Improvement Communication",
            description: "The implementation and effectiveness of improvements are monitored"
          },
          "ID.IM-04": {
            name: "Improvement Effectiveness",
            description: "Response plans and strategies are established and maintained"
          }
        }
      }
    }
  },
  PR: {
    name: "Protect",
    description: "Safeguards to manage the organization's cybersecurity risks are used",
    categories: {
      "PR.AA": {
        name: "Identity Management, Authentication, and Access Control",
        description: "Access to physical and logical assets is limited to authorized users, services, and hardware and managed commensurate with the assessed risk of unauthorized access",
        subcategories: {
          "PR.AA-01": {
            name: "Identities and Credentials Management",
            description: "Identities and credentials for authorized users, services, and hardware are managed by the organization"
          },
          "PR.AA-02": {
            name: "Identities Authenticated",
            description: "Identities are proofed and bound to credentials and asserted in interactions"
          },
          "PR.AA-03": {
            name: "Identity Management Systems",
            description: "Identity management, credential management, and access control systems are managed, monitored, and audited"
          },
          "PR.AA-04": {
            name: "Identity Assertions",
            description: "Identity assertions are protected, conveyed, and verified"
          },
          "PR.AA-05": {
            name: "Access Permissions",
            description: "Access permissions, entitlements, and authorizations are defined in a policy, managed, enforced, and audited"
          },
          "PR.AA-06": {
            name: "Physical Access",
            description: "Physical access to assets is managed, monitored, and enforced commensurate with risk"
          }
        }
      },
      "PR.AT": {
        name: "Awareness and Training",
        description: "The organization's personnel are provided with cybersecurity awareness and training so that they can perform their cybersecurity-related tasks",
        subcategories: {
          "PR.AT-01": {
            name: "Personnel Awareness",
            description: "Personnel are provided with awareness training that is accessible, built into their requirements, and updated based on risks, threats, and organizational needs"
          },
          "PR.AT-02": {
            name: "Privileged Users Training",
            description: "Individuals in specialized roles, privileged users, or those with access to sensitive information receive role-appropriate cybersecurity training before being granted access and on an ongoing basis"
          }
        }
      },
      "PR.DS": {
        name: "Data Security",
        description: "Data are managed consistent with the organization's risk strategy to protect the confidentiality, integrity, and availability of information",
        subcategories: {
          "PR.DS-01": {
            name: "Data Inventory and Classification",
            description: "The confidentiality, integrity, and availability requirements for data are categorized and documented"
          },
          "PR.DS-02": {
            name: "Data at Rest Protection",
            description: "The confidentiality, integrity, and availability of data at rest are protected"
          },
          "PR.DS-03": {
            name: "Data in Transit Protection",
            description: "The confidentiality, integrity, and availability of data in transit are protected"
          },
          "PR.DS-04": {
            name: "Data in Use Protection",
            description: "The confidentiality, integrity, and availability of data in use are protected"
          },
          "PR.DS-05": {
            name: "Data Disposal",
            description: "Data are securely disposed of according to policy"
          },
          "PR.DS-06": {
            name: "Integrity Checking",
            description: "Integrity checking mechanisms are used to verify software, firmware, and information integrity"
          },
          "PR.DS-07": {
            name: "Development and Testing Environment Separation",
            description: "The development and testing environment(s) are separate from the production environment"
          },
          "PR.DS-08": {
            name: "Hardware Integrity Protection",
            description: "Hardware integrity is protected (e.g., tamper protection, tamper detection)"
          }
        }
      },
      "PR.PS": {
        name: "Platform Security",
        description: "The hardware, software (e.g., firmware, operating systems, applications), and services of physical and virtual platforms are managed consistent with the organization's risk strategy to protect their confidentiality, integrity, and availability",
        subcategories: {
          "PR.PS-01": {
            name: "Configuration Management",
            description: "Configuration management practices are established and applied"
          },
          "PR.PS-02": {
            name: "Software Management",
            description: "Software is maintained, replaced, and removed commensurate with risk"
          },
          "PR.PS-03": {
            name: "Hardware Management",
            description: "Hardware is maintained, replaced, and removed commensurate with risk"
          },
          "PR.PS-04": {
            name: "Log Generation and Quality",
            description: "Log records are generated and made available for continuous monitoring"
          },
          "PR.PS-05": {
            name: "Installation and Execution Control",
            description: "Installation and execution of unauthorized software are prevented"
          },
          "PR.PS-06": {
            name: "Secure Software Development",
            description: "Secure software development practices are integrated, and their performance is monitored throughout the software development life cycle"
          }
        }
      },
      "PR.IR": {
        name: "Technology Infrastructure Resilience",
        description: "Security architectures are managed with the organization's risk strategy to protect asset confidentiality, integrity, and availability, and organizational resilience",
        subcategories: {
          "PR.IR-01": {
            name: "Networks and Environments",
            description: "Networks and environments are protected from unauthorized logical access and usage"
          },
          "PR.IR-02": {
            name: "Technology Assets",
            description: "Technology assets are protected from environmental threats"
          },
          "PR.IR-03": {
            name: "Technology Resilience",
            description: "Mechanisms are implemented to achieve resilience requirements in normal and adverse situations"
          },
          "PR.IR-04": {
            name: "Adequate Capacity",
            description: "Adequate resource capacity to maintain availability is maintained"
          }
        }
      }
    }
  },
  DE: {
    name: "Detect",
    description: "Possible cybersecurity attacks and compromises are found and analyzed",
    categories: {
      "DE.CM": {
        name: "Continuous Monitoring",
        description: "Assets are monitored to find anomalies, indicators of compromise, and other potentially adverse events",
        subcategories: {
          "DE.CM-01": {
            name: "Network Monitoring",
            description: "Networks and network communications are monitored to find potentially adverse events"
          },
          "DE.CM-02": {
            name: "Physical Environment Monitoring",
            description: "The physical environment is monitored to find potentially adverse events"
          },
          "DE.CM-03": {
            name: "Personnel Activity Monitoring",
            description: "Personnel activity and technology usage are monitored to find potentially adverse events"
          },
          "DE.CM-04": {
            name: "Malicious Code Detection",
            description: "Malicious code is detected"
          },
          "DE.CM-05": {
            name: "Unauthorized Mobile Code",
            description: "Unauthorized mobile code is detected"
          },
          "DE.CM-06": {
            name: "External Service Provider Monitoring",
            description: "External service provider activities are monitored to find potentially adverse events"
          },
          "DE.CM-07": {
            name: "Monitoring Coverage",
            description: "Monitoring coverage is sufficient to detect anomalies and indicators of compromise"
          },
          "DE.CM-08": {
            name: "Vulnerability Scans",
            description: "Vulnerability scans are performed"
          },
          "DE.CM-09": {
            name: "Computing Hardware and Software Monitoring",
            description: "Computing hardware and software, runtime environments, and their resources are monitored to find potentially adverse events"
          }
        }
      },
      "DE.AE": {
        name: "Adverse Event Analysis",
        description: "Anomalies, indicators of compromise, and other potentially adverse events are analyzed to characterize the events and detect cybersecurity incidents",
        subcategories: {
          "DE.AE-01": {
            name: "Security Alerts Analysis",
            description: "Security alerts from detection systems are analyzed"
          },
          "DE.AE-02": {
            name: "Incident Correlation",
            description: "Potentially adverse events are analyzed to better understand associated activities"
          },
          "DE.AE-03": {
            name: "Event Data Correlation",
            description: "Event data are correlated from multiple sources"
          },
          "DE.AE-04": {
            name: "Event Impact Analysis",
            description: "The estimated impact and scope of adverse events are understood"
          },
          "DE.AE-05": {
            name: "Incident Thresholds",
            description: "Incident alert thresholds are established"
          },
          "DE.AE-06": {
            name: "Threat Information Integration",
            description: "Information on the existence, nature, and location of software vulnerabilities is integrated into the analysis of adverse events"
          },
          "DE.AE-07": {
            name: "Threat Hunting",
            description: "Threat hunting is performed on a regular basis"
          },
          "DE.AE-08": {
            name: "Incident Declaration",
            description: "Incidents are declared when adverse events meet the defined incident criteria"
          }
        }
      }
    }
  },
  RS: {
    name: "Respond",
    description: "Actions regarding a detected cybersecurity incident are taken",
    categories: {
      "RS.MA": {
        name: "Incident Management",
        description: "Responses to detected cybersecurity incidents are managed",
        subcategories: {
          "RS.MA-01": {
            name: "Incident Response Process",
            description: "The incident response process is executed in coordination with relevant third parties once an incident is declared"
          },
          "RS.MA-02": {
            name: "Incident Categorization",
            description: "Incidents are classified and categorized consistent with response plans"
          },
          "RS.MA-03": {
            name: "Incident Response Plan",
            description: "Incident response plans address the full spectrum of incident response activities"
          },
          "RS.MA-04": {
            name: "Personnel Assignment",
            description: "Personnel are assigned to incident response teams and have the authority to conduct incident response activities"
          },
          "RS.MA-05": {
            name: "Incident Response Documentation",
            description: "Incident response processes and procedures are established, maintained, and approved by organizational leadership"
          }
        }
      },
      "RS.AN": {
        name: "Incident Analysis",
        description: "Investigations are conducted to ensure effective response and support forensics and recovery activities",
        subcategories: {
          "RS.AN-01": {
            name: "Incident Investigation",
            description: "Incident characteristics are analyzed to inform response activities and the development of countermeasures"
          },
          "RS.AN-02": {
            name: "Incident Impact Assessment",
            description: "The full extent of the incident and its impact are understood"
          },
          "RS.AN-03": {
            name: "Forensics",
            description: "Forensics activities are conducted in accordance with established procedures"
          },
          "RS.AN-04": {
            name: "Incident Attribution",
            description: "Incidents are attributed to threat actors where feasible"
          },
          "RS.AN-05": {
            name: "Processes and Procedures Update",
            description: "Processes and procedures are updated based on lessons learned from current and previous incident response activities"
          }
        }
      },
      "RS.CO": {
        name: "Incident Response Reporting and Communication",
        description: "Response activities are coordinated with internal and external stakeholders as required by laws, regulations, or policies",
        subcategories: {
          "RS.CO-01": {
            name: "Personnel Notification",
            description: "Personnel are notified of incidents in a manner that complies with organizational requirements and applicable laws, regulations, and policies"
          },
          "RS.CO-02": {
            name: "Incident Reporting",
            description: "Incidents are reported based on organizational requirements and applicable laws, regulations, and policies"
          },
          "RS.CO-03": {
            name: "Information Sharing",
            description: "Information is shared with appropriate stakeholders to achieve broader cybersecurity situational awareness"
          },
          "RS.CO-04": {
            name: "Coordination with Stakeholders",
            description: "Coordination with stakeholders occurs consistent with response plans"
          },
          "RS.CO-05": {
            name: "Voluntary Information Sharing",
            description: "Voluntary information sharing occurs with external stakeholders to achieve broader cybersecurity situational awareness"
          }
        }
      },
      "RS.MI": {
        name: "Incident Mitigation",
        description: "Activities are performed to prevent expansion of an event and mitigate its effects",
        subcategories: {
          "RS.MI-01": {
            name: "Incident Containment",
            description: "Incidents are contained to prevent or reduce further damage"
          },
          "RS.MI-02": {
            name: "Incident Eradication",
            description: "Incidents are eradicated"
          },
          "RS.MI-03": {
            name: "Affected Systems Isolation",
            description: "Newly identified instances of malicious code, unauthorized software, and unauthorized connections are mitigated or isolated"
          }
        }
      }
    }
  },
  RC: {
    name: "Recover",
    description: "Assets and operations affected by a cybersecurity incident are restored",
    categories: {
      "RC.RP": {
        name: "Incident Recovery Plan Execution",
        description: "Restoration activities are performed to ensure operational availability of systems and services affected by cybersecurity incidents",
        subcategories: {
          "RC.RP-01": {
            name: "Recovery Plan Execution",
            description: "The recovery portion of incident response plans is executed once systems and services are verified to be in a secure state"
          },
          "RC.RP-02": {
            name: "Recovery Time Objectives",
            description: "Recovery actions are selected, scoped, prioritized, and performed based on the estimated time to restore mission functions"
          },
          "RC.RP-03": {
            name: "Recovery Point Objectives",
            description: "The integrity of backups and other restoration assets is verified before using them for restoration"
          },
          "RC.RP-04": {
            name: "Critical Functions Priority",
            description: "Critical mission functions and cybersecurity risk management are considered to establish post-incident operational norms"
          },
          "RC.RP-05": {
            name: "Incident Response Integration",
            description: "The integrity of restored assets is verified, systems and services are restored, and normal operating procedures are confirmed before operational use"
          }
        }
      },
      "RC.CO": {
        name: "Incident Recovery Communication",
        description: "Restoration activities are coordinated with internal and external parties",
        subcategories: {
          "RC.CO-01": {
            name: "Public Relations Management",
            description: "Public relations are managed"
          },
          "RC.CO-02": {
            name: "Reputation Management",
            description: "The reputation after an event is repaired"
          },
          "RC.CO-03": {
            name: "Recovery Activities Communication",
            description: "Recovery activities and progress in restoring operational capabilities are communicated to designated internal and external stakeholders"
          },
          "RC.CO-04": {
            name: "Recovery Coordination",
            description: "Recovery activities are coordinated with internal and external parties (e.g., coordinating centers, Internet Service Providers, owners of attacking systems, victims, other CSIRTs, vendors)"
          }
        }
      }
    }
  }
};

// Scoring dimensions
const SCORING_DIMENSIONS = {
  maturity: { 
    name: "Maturity Level", 
    levels: ["Not Implemented", "Partially Implemented", "Largely Implemented", "Fully Implemented"] 
  },
  implementation: { 
    name: "Implementation Approach", 
    levels: ["None", "Basic", "Systematic", "Optimized"] 
  },
  evidence: { 
    name: "Evidence Quality", 
    levels: ["None", "Limited", "Good", "Comprehensive"] 
  }
};

export default function NISTCSFAssessmentTool() {
  const [assessmentData, setAssessmentData] = useState({});
  const [expandedItems, setExpandedItems] = useState({});
  const [selectedFunction, setSelectedFunction] = useState('GV');

  // Calculate scores
  const calculateSubcategoryScore = (subcategoryId) => {
    const data = assessmentData[subcategoryId];
    if (!data) return 0;
    
    const weight = data.weight || 3;
    const maturity = data.maturity || 0;
    const implementation = data.implementation || 0;
    const evidence = data.evidence || 0;
    
    const averageScore = (maturity + implementation + evidence) / 3;
    return (averageScore * weight * 100) / (3 * 5); // Normalize to 0-100
  };

  const calculateCategoryScore = (categoryData) => {
    const subcategoryIds = Object.keys(categoryData.subcategories);
    if (subcategoryIds.length === 0) return 0;
    
    let totalScore = 0;
    let totalWeight = 0;
    
    subcategoryIds.forEach(subId => {
      const weight = assessmentData[subId]?.weight || 3;
      totalScore += calculateSubcategoryScore(subId) * weight;
      totalWeight += weight;
    });
    
    return totalWeight > 0 ? totalScore / totalWeight : 0;
  };

  const calculateFunctionScore = (functionData) => {
    const categoryIds = Object.keys(functionData.categories);
    if (categoryIds.length === 0) return 0;
    
    const scores = categoryIds.map(catId => calculateCategoryScore(functionData.categories[catId]));
    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  };

  const calculateOverallScore = () => {
    const functionIds = Object.keys(NIST_CSF_STRUCTURE);
    const scores = functionIds.map(funcId => calculateFunctionScore(NIST_CSF_STRUCTURE[funcId]));
    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  };

  // Update assessment data
  const updateAssessment = (subcategoryId, field, value) => {
    setAssessmentData(prev => ({
      ...prev,
      [subcategoryId]: {
        ...prev[subcategoryId],
        [field]: value
      }
    }));
  };

  // Toggle expansion
  const toggleExpansion = (itemId) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  // Export/Import functions
  const exportAssessment = () => {
    const data = {
      assessmentData,
      timestamp: new Date().toISOString(),
      framework: "NIST CSF 2.0"
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nist-csf-assessment-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const importAssessment = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          if (data.assessmentData) {
            setAssessmentData(data.assessmentData);
          }
        } catch (error) {
          alert('Invalid file format');
        }
      };
      reader.readAsText(file);
    }
  };

  // Calculate completion stats
  const completionStats = useMemo(() => {
    let totalSubcategories = 0;
    let completedSubcategories = 0;
    
    Object.values(NIST_CSF_STRUCTURE).forEach(func => {
      Object.values(func.categories).forEach(cat => {
        Object.keys(cat.subcategories).forEach(subId => {
          totalSubcategories++;
          const data = assessmentData[subId];
          if (data && data.maturity > 0 && data.implementation > 0 && data.evidence > 0) {
            completedSubcategories++;
          }
        });
      });
    });
    
    return {
      total: totalSubcategories,
      completed: completedSubcategories,
      percentage: totalSubcategories > 0 ? (completedSubcategories / totalSubcategories) * 100 : 0
    };
  }, [assessmentData]);

  const currentFunction = NIST_CSF_STRUCTURE[selectedFunction];

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">NIST CSF 2.0 Assessment Tool</h1>
          <p className="text-gray-600 mt-2">Complete cybersecurity framework assessment with hierarchical scoring</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={exportAssessment}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={() => document.getElementById('import-file').click()}>
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
          <input
            id="import-file"
            type="file"
            accept=".json"
            onChange={importAssessment}
            className="hidden"
          />
        </div>
      </div>

      {/* Overall Dashboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Assessment Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{calculateOverallScore().toFixed(1)}%</div>
              <div className="text-sm text-gray-600">Overall Score</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{completionStats.completed}</div>
              <div className="text-sm text-gray-600">Completed Subcategories</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">{completionStats.total}</div>
              <div className="text-sm text-gray-600">Total Subcategories</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{completionStats.percentage.toFixed(1)}%</div>
              <div className="text-sm text-gray-600">Completion Rate</div>
            </div>
          </div>
          
          <div className="mt-6">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm text-gray-600">{completionStats.completed}/{completionStats.total}</span>
            </div>
            <Progress value={completionStats.percentage} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Function Level Dashboard */}
      <Card>
        <CardHeader>
          <CardTitle>Function Scores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.entries(NIST_CSF_STRUCTURE).map(([funcId, funcData]) => {
              const score = calculateFunctionScore(funcData);
              return (
                <div 
                  key={funcId}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedFunction === funcId 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedFunction(funcId)}
                >
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">{funcId}</div>
                    <div className="text-sm text-gray-600 mb-2">{funcData.name}</div>
                    <div className="text-2xl font-bold text-blue-600">{score.toFixed(1)}%</div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Summary Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Assessment Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="functions" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="functions">By Function</TabsTrigger>
              <TabsTrigger value="maturity">By Maturity</TabsTrigger>
              <TabsTrigger value="priorities">By Priority</TabsTrigger>
            </TabsList>
            
            <TabsContent value="functions" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(NIST_CSF_STRUCTURE).map(([funcId, funcData]) => {
                  const score = calculateFunctionScore(funcData);
                  const categoryCount = Object.keys(funcData.categories).length;
                  const subcategoryCount = Object.values(funcData.categories).reduce(
                    (sum, cat) => sum + Object.keys(cat.subcategories).length, 0
                  );
                  
                  return (
                    <div key={funcId} className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">{funcId}</Badge>
                        <span className="font-medium">{funcData.name}</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Score:</span>
                          <span className="font-bold text-blue-600">{score.toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Categories:</span>
                          <span>{categoryCount}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Subcategories:</span>
                          <span>{subcategoryCount}</span>
                        </div>
                        <Progress value={score} className="h-2" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </TabsContent>
            
            <TabsContent value="maturity" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {SCORING_DIMENSIONS.maturity.levels.map((level, index) => {
                  let count = 0;
                  Object.values(assessmentData).forEach(data => {
                    if (data.maturity === index) count++;
                  });
                  
                  return (
                    <div key={index} className="p-4 border rounded-lg text-center">
                      <div className="text-2xl font-bold text-gray-900">{count}</div>
                      <div className="text-sm text-gray-600">Level {index}</div>
                      <div className="text-xs text-gray-500">{level}</div>
                    </div>
                  );
                })}
              </div>
            </TabsContent>
            
            <TabsContent value="priorities" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {[1, 2, 3, 4, 5].map(weight => {
                  let count = 0;
                  Object.values(assessmentData).forEach(data => {
                    if ((data.weight || 3) === weight) count++;
                  });
                  
                  return (
                    <div key={weight} className="p-4 border rounded-lg text-center">
                      <div className="text-2xl font-bold text-gray-900">{count}</div>
                      <div className="text-sm text-gray-600">Weight {weight}</div>
                      <div className="text-xs text-gray-500">
                        {weight === 1 ? 'Lowest' : weight === 5 ? 'Highest' : 'Priority'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Detailed Assessment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            {currentFunction.name} Function Assessment
          </CardTitle>
          <p className="text-gray-600">{currentFunction.description}</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {Object.entries(currentFunction.categories).map(([categoryId, categoryData]) => {
              const categoryScore = calculateCategoryScore(categoryData);
              const isExpanded = expandedItems[categoryId];
              
              return (
                <div key={categoryId} className="border rounded-lg">
                  <div 
                    className="p-4 cursor-pointer hover:bg-gray-50 flex items-center justify-between"
                    onClick={() => toggleExpansion(categoryId)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{categoryId}</Badge>
                        <h3 className="font-semibold">{categoryData.name}</h3>
                        <div className="text-lg font-bold text-blue-600">{categoryScore.toFixed(1)}%</div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{categoryData.description}</p>
                    </div>
                    {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                  </div>
                  
                  {isExpanded && (
                    <div className="border-t bg-gray-50 p-4">
                      <div className="space-y-6">
                        {Object.entries(categoryData.subcategories).map(([subcategoryId, subcategoryData]) => {
                          const subcategoryScore = calculateSubcategoryScore(subcategoryId);
                          const data = assessmentData[subcategoryId] || {};
                          
                          return (
                            <div key={subcategoryId} className="bg-white p-4 rounded-lg border">
                              <div className="flex items-center justify-between mb-3">
                                <div>
                                  <Badge variant="secondary">{subcategoryId}</Badge>
                                  <h4 className="font-medium mt-1">{subcategoryData.name}</h4>
                                  <p className="text-sm text-gray-600">{subcategoryData.description}</p>
                                </div>
                                <div className="text-right">
                                  <div className="text-lg font-bold text-blue-600">{subcategoryScore.toFixed(1)}%</div>
                                  <div className="text-xs text-gray-500">Score</div>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                {/* Weight */}
                                <div>
                                  <label className="block text-sm font-medium mb-2">
                                    Weight (1-5)
                                  </label>
                                  <input
                                    type="range"
                                    min="1"
                                    max="5"
                                    value={data.weight || 3}
                                    onChange={(e) => updateAssessment(subcategoryId, 'weight', parseInt(e.target.value))}
                                    className="w-full"
                                  />
                                  <div className="text-center text-sm text-gray-600 mt-1">
                                    {data.weight || 3}
                                  </div>
                                </div>
                                
                                {/* Scoring Dimensions */}
                                {Object.entries(SCORING_DIMENSIONS).map(([dimKey, dimData]) => (
                                  <div key={dimKey}>
                                    <label className="block text-sm font-medium mb-2">
                                      {dimData.name}
                                    </label>
                                    <select
                                      value={data[dimKey] || 0}
                                      onChange={(e) => updateAssessment(subcategoryId, dimKey, parseInt(e.target.value))}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                    >
                                      {dimData.levels.map((level, index) => (
                                        <option key={index} value={index}>
                                          {index}: {level}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                ))}
                              </div>
                              
                              {/* Notes */}
                              <div className="mt-4">
                                <label className="block text-sm font-medium mb-2">
                                  Notes & Evidence
                                </label>
                                <textarea
                                  value={data.notes || ''}
                                  onChange={(e) => updateAssessment(subcategoryId, 'notes', e.target.value)}
                                  placeholder="Document implementation details, evidence, and improvement plans..."
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                  rows="2"
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Gap Analysis & Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Gap Analysis & Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Critical Gaps */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Critical Priority Items</h3>
              <div className="space-y-2">
                {Object.entries(NIST_CSF_STRUCTURE).flatMap(([funcId, funcData]) =>
                  Object.entries(funcData.categories).flatMap(([catId, catData]) =>
                    Object.entries(catData.subcategories).map(([subId, subData]) => {
                      const data = assessmentData[subId] || {};
                      const score = calculateSubcategoryScore(subId);
                      const weight = data.weight || 3;
                      
                      if (weight >= 4 && score < 30) {
                        return (
                          <div key={subId} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div>
                                <Badge variant="destructive">{subId}</Badge>
                                <span className="ml-2 font-medium">{subData.name}</span>
                              </div>
                              <div className="text-right">
                                <div className="text-red-600 font-bold">{score.toFixed(1)}%</div>
                                <div className="text-xs text-red-500">Weight: {weight}</div>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{subData.description}</p>
                          </div>
                        );
                      }
                      return null;
                    })
                  )
                ).filter(Boolean)}
              </div>
            </div>

            {/* Quick Wins */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Quick Win Opportunities</h3>
              <div className="space-y-2">
                {Object.entries(NIST_CSF_STRUCTURE).flatMap(([funcId, funcData]) =>
                  Object.entries(funcData.categories).flatMap(([catId, catData]) =>
                    Object.entries(catData.subcategories).map(([subId, subData]) => {
                      const data = assessmentData[subId] || {};
                      const score = calculateSubcategoryScore(subId);
                      const weight = data.weight || 3;
                      
                      if (weight <= 2 && score < 50 && data.maturity === 0) {
                        return (
                          <div key={subId} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div>
                                <Badge variant="secondary">{subId}</Badge>
                                <span className="ml-2 font-medium">{subData.name}</span>
                              </div>
                              <div className="text-right">
                                <div className="text-green-600 font-bold">{score.toFixed(1)}%</div>
                                <div className="text-xs text-green-500">Low complexity</div>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{subData.description}</p>
                          </div>
                        );
                      }
                      return null;
                    })
                  )
                ).filter(Boolean)}
              </div>
            </div>

            {/* Implementation Roadmap */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Implementation Roadmap</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium text-red-600 mb-2">Phase 1: Critical (0-3 months)</h4>
                  <div className="text-sm text-gray-600">
                    High priority, low implementation items first
                  </div>
                  <div className="mt-2 text-lg font-bold">
                    {Object.keys(assessmentData).filter(subId => {
                      const data = assessmentData[subId];
                      const score = calculateSubcategoryScore(subId);
                      return (data?.weight || 3) >= 4 && score < 50;
                    }).length} items
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium text-orange-600 mb-2">Phase 2: Important (3-12 months)</h4>
                  <div className="text-sm text-gray-600">
                    Medium priority items with systematic approach
                  </div>
                  <div className="mt-2 text-lg font-bold">
                    {Object.keys(assessmentData).filter(subId => {
                      const data = assessmentData[subId];
                      const score = calculateSubcategoryScore(subId);
                      return (data?.weight || 3) === 3 && score < 70;
                    }).length} items
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium text-blue-600 mb-2">Phase 3: Enhancement (12+ months)</h4>
                  <div className="text-sm text-gray-600">
                    Optimization and advanced capabilities
                  </div>
                  <div className="mt-2 text-lg font-bold">
                    {Object.keys(assessmentData).filter(subId => {
                      const data = assessmentData[subId];
                      const score = calculateSubcategoryScore(subId);
                      return (data?.weight || 3) <= 2 || score >= 70;
                    }).length} items
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}