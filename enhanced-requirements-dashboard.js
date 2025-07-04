import React, { useState, useEffect, useMemo, useReducer, lazy, Suspense, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, ScatterChart, Scatter } from 'recharts';

// Theme Provider
import { useTheme } from './contexts/ThemeProvider';

// ADD THIS LINE after your existing imports
import { AuthContext } from './auth/JWTAuthProvider';

// Portal System imports
import Portal from './components/ui/Portal';
import Modal from './components/ui/Modal';
import { DropdownMenu, DropdownMenuItem } from './components/ui/DropdownMenu';
import { useToast } from './components/ui/Toast';
import { usePortal } from './hooks/usePortal';
import CompanyProfileSystem from './components/profile/CompanyProfileSystem';
import { useCompanyProfile } from './hooks/useCompanyProfile';
import { getCompanySize, getRevenueLabel, getEmployeeLabel } from './utils/companyProfile';

// Threat Intelligence System Integration
import ThreatIntelligenceSystem from './components/threats/ThreatIntelligenceSystem';
import ThreatSettings from './components/threats/ThreatSettings';
import RiskManagement from './components/threats/RiskManagement';

// Optimized imports - only what we need (UPDATED WITH AWARD ICON AND FileCheck)
import { 
  Upload, Filter, Search, Download, AlertTriangle, CheckCircle, Clock, FileText, 
  Shield, TrendingUp, Database, Bell, Eye, ArrowRight, ChevronLeft, ChevronRight, 
  BarChart3, Maximize2, Minimize2, Star, Lightbulb, GitBranch, DollarSign, 
  Timer, Gauge, Building2, X, Edit, Users, Target, Network, Lock, Activity, Layers,
  Trash2, Save, Plus, RefreshCw, Menu, MoreVertical, Settings, Award, FileCheck // ADDED Award and FileCheck
} from 'lucide-react';

// Constants and utilities
import * as CONSTANTS from './constants';
import { parseCSV, generateCSV, downloadCSV } from './utils/csvUtils';
import { transformCSVToRequirement, generateMockCapabilities, generateMockData } from './utils/dataService';

// Custom hooks
import { useRequirementsData } from './hooks/useRequirementsData';
import { useCapabilitiesData } from './hooks/useCapabilitiesData';
import { useAnalytics } from './hooks/useAnalytics';
import { useFilteredRequirements } from './hooks/useFilteredRequirements';
import { usePCDData } from './hooks/usePCDData';

// UI Components
import StatCard from './components/ui/StatCard';
import MaturityIndicator from './components/ui/MaturityIndicator';
import LoadingSpinner from './components/ui/LoadingSpinner';
import InteractiveChart from './components/charts/InteractiveChart';

// Modal Components
import EditRequirementModal from './components/modals/EditRequirementModal';
import CSVUploadModal from './components/modals/CSVUploadModal';
import PurgeConfirmationModal from './components/modals/PurgeConfirmationModal';
import NewCapabilityModal from './components/modals/NewCapabilityModal';
import ViewRequirementModal from './components/modals/ViewRequirementModal';

// View Components
import RequirementsTable from './components/requirements/RequirementsTable';
import PCDBreakdownView from './components/views/PCDBreakdownView';
import BusinessValueView from './components/views/BusinessValueView';
import MaturityAnalysisView from './components/views/MaturityAnalysisView';
import DiagnosticsView from './components/views/DiagnosticsView';
import SystemSettings from './components/settings/SystemSettings';
import MitreAttackNavigator from './components/threats/MitreAttackNavigator';

// Standards Components - NEW (will be defined inline)

// NIST CSF Data Structure
const NIST_CSF_STRUCTURE = {
  GV: {
    name: "Govern",
    color: "blue",
    categories: {
      "GV.OC": {
        name: "Organizational Context",
        subcategories: {
          "GV.OC-01": {
            name: "Organizational cybersecurity strategy",
            description: "The organizational cybersecurity strategy is established, communicated, and used to guide cybersecurity activities"
          },
          "GV.OC-02": {
            name: "Internal and external stakeholders",
            description: "Internal and external stakeholders are identified, and their needs and expectations regarding cybersecurity are understood and considered"
          },
          "GV.OC-03": {
            name: "Legal, regulatory, and contractual requirements",
            description: "Legal, regulatory, and contractual requirements regarding cybersecurity are understood and managed"
          },
          "GV.OC-04": {
            name: "Critical objectives, capabilities, and services",
            description: "Critical objectives, capabilities, and services that stakeholders depend on or expect from the organization are understood and communicated"
          },
          "GV.OC-05": {
            name: "Outcomes, roles, and responsibilities",
            description: "Outcomes, roles, and responsibilities for cybersecurity risk management are established, communicated, and enforced"
          }
        }
      },
      "GV.RM": {
        name: "Risk Management Strategy",
        subcategories: {
          "GV.RM-01": {
            name: "Risk management strategy",
            description: "A risk management strategy reflects organizational context, risk tolerance, and risk appetite"
          },
          "GV.RM-02": {
            name: "Risk identification and analysis",
            description: "Risk identification and analysis processes are established, managed, and agreed to by organizational stakeholders"
          },
          "GV.RM-03": {
            name: "Risk response and recovery planning",
            description: "Risk response and recovery planning processes are established and managed"
          },
          "GV.RM-04": {
            name: "Strategic direction",
            description: "Strategic direction that describes appropriate risk response is established and communicated"
          },
          "GV.RM-05": {
            name: "Lines of communication",
            description: "Lines of communication across the organization are established for cybersecurity risks, including risks from suppliers and other third parties"
          },
          "GV.RM-06": {
            name: "A standardized method",
            description: "A standardized method for calculating, documenting, categorizing, and prioritizing cybersecurity risks is established and communicated"
          },
          "GV.RM-07": {
            name: "Strategic decisions",
            description: "Strategic decisions are informed by cybersecurity risk assessments"
          }
        }
      },
      "GV.RR": {
        name: "Roles, Responsibilities, and Authorities",
        subcategories: {
          "GV.RR-01": {
            name: "Organizational leadership",
            description: "Organizational leadership is responsible and accountable for cybersecurity risk and fosters a culture that is risk-aware, ethical, and continually improving"
          },
          "GV.RR-02": {
            name: "Roles, responsibilities, and authorities",
            description: "Roles, responsibilities, and authorities related to cybersecurity risk management are established, communicated, understood, and enforced"
          },
          "GV.RR-03": {
            name: "Adequate resources",
            description: "Adequate resources are allocated commensurate with the cybersecurity risk strategy, roles, responsibilities, and policies"
          },
          "GV.RR-04": {
            name: "Cybersecurity is included",
            description: "Cybersecurity is included in human resources practices"
          }
        }
      },
      "GV.PO": {
        name: "Policy",
        subcategories: {
          "GV.PO-01": {
            name: "Policy for managing cybersecurity risks",
            description: "Policy for managing cybersecurity risks is established based on organizational context, cybersecurity strategy, and priorities and is communicated and enforced"
          },
          "GV.PO-02": {
            name: "Policy addresses purpose, scope, roles, responsibilities, management commitment, and coordination",
            description: "Policy addresses purpose, scope, roles, responsibilities, management commitment, and coordination"
          }
        }
      },
      "GV.OV": {
        name: "Oversight",
        subcategories: {
          "GV.OV-01": {
            name: "Cybersecurity risk management strategy outcomes",
            description: "Cybersecurity risk management strategy outcomes are reviewed to inform and adjust strategy and direction"
          },
          "GV.OV-02": {
            name: "The cybersecurity risk management strategy",
            description: "The cybersecurity risk management strategy is reviewed and adjusted to ensure coverage of organizational requirements and risks"
          },
          "GV.OV-03": {
            name: "Organizational cybersecurity risk management performance",
            description: "Organizational cybersecurity risk management performance is evaluated and reviewed for adjustments"
          }
        }
      },
      "GV.SC": {
        name: "Cybersecurity Supply Chain Risk Management",
        subcategories: {
          "GV.SC-01": {
            name: "A cybersecurity supply chain risk management strategy",
            description: "A cybersecurity supply chain risk management strategy is established, implemented, and managed"
          },
          "GV.SC-02": {
            name: "Suppliers and other third parties",
            description: "Suppliers and other third parties are included in cybersecurity risk identification, assessment, and management processes"
          },
          "GV.SC-03": {
            name: "Contracts and other agreements",
            description: "Contracts and other agreements with suppliers and other third parties include cybersecurity requirements"
          },
          "GV.SC-04": {
            name: "Planning and due diligence",
            description: "Planning and due diligence are performed to reduce risks before entering into formal supplier or other third-party relationships"
          },
          "GV.SC-05": {
            name: "Mechanisms are implemented",
            description: "Mechanisms are implemented to manage cybersecurity risks associated with suppliers and other third parties"
          },
          "GV.SC-06": {
            name: "Planning and due diligence",
            description: "Planning and due diligence are performed to manage risks during supplier and other third-party relationship changes and termination"
          },
          "GV.SC-07": {
            name: "The risks associated with suppliers",
            description: "The risks associated with suppliers and other third parties are monitored"
          },
          "GV.SC-08": {
            name: "Relevant supplier and other third-party information",
            description: "Relevant supplier and other third-party information is included in incident planning, response, and recovery activities"
          },
          "GV.SC-09": {
            name: "Supply chain security practices",
            description: "Supply chain security practices are integrated with cybersecurity and enterprise risk management programs"
          },
          "GV.SC-10": {
            name: "Cybersecurity supply chain risk management plans",
            description: "Cybersecurity supply chain risk management plans include provisions for activities that occur during and after incidents"
          }
        }
      }
    }
  },
  ID: {
    name: "Identify",
    color: "green",
    categories: {
      "ID.AM": {
        name: "Asset Management",
        subcategories: {
          "ID.AM-01": {
            name: "Inventories of hardware managed by the organization",
            description: "Inventories of hardware managed by the organization are maintained"
          },
          "ID.AM-02": {
            name: "Inventories of software, services, and systems managed by the organization",
            description: "Inventories of software, services, and systems managed by the organization are maintained"
          },
          "ID.AM-03": {
            name: "Representations of the organization's authorized network communications and internal and external network data flows",
            description: "Representations of the organization's authorized network communications and internal and external network data flows are maintained"
          },
          "ID.AM-04": {
            name: "Services that the organization depends on",
            description: "Services that the organization depends on are cataloged"
          },
          "ID.AM-05": {
            name: "Assets are prioritized",
            description: "Assets are prioritized based on classification, criticality, resources, and business functions"
          },
          "ID.AM-06": {
            name: "Roles and responsibilities for asset inventory",
            description: "Roles and responsibilities for asset inventory and asset management are established"
          },
          "ID.AM-07": {
            name: "Inventories of data and corresponding metadata",
            description: "Inventories of data and corresponding metadata for designated data types are maintained"
          },
          "ID.AM-08": {
            name: "Systems, hardware, software, services, and data",
            description: "Systems, hardware, software, services, and data are managed consistent with the organization's risk strategy"
          }
        }
      },
      "ID.RA": {
        name: "Risk Assessment",
        subcategories: {
          "ID.RA-01": {
            name: "Vulnerabilities in assets are identified",
            description: "Vulnerabilities in assets are identified, validated, and recorded"
          },
          "ID.RA-02": {
            name: "Cyber threat intelligence",
            description: "Cyber threat intelligence is received from information sharing forums and sources"
          },
          "ID.RA-03": {
            name: "Internal and external threats to the organization",
            description: "Internal and external threats to the organization are identified and recorded"
          },
          "ID.RA-04": {
            name: "Potential impacts and likelihoods of threats exploiting vulnerabilities",
            description: "Potential impacts and likelihoods of threats exploiting vulnerabilities are identified and recorded"
          },
          "ID.RA-05": {
            name: "Threats, vulnerabilities, likelihoods, and impacts",
            description: "Threats, vulnerabilities, likelihoods, and impacts are used to understand inherent risk and inform risk response priorities"
          },
          "ID.RA-06": {
            name: "Risk responses are chosen, prioritized, planned, tracked, and communicated",
            description: "Risk responses are chosen, prioritized, planned, tracked, and communicated"
          },
          "ID.RA-07": {
            name: "Changes and exceptions are managed, assessed for risk impact, recorded, and tracked",
            description: "Changes and exceptions are managed, assessed for risk impact, recorded, and tracked"
          },
          "ID.RA-08": {
            name: "Processes for receiving, analyzing, and responding to vulnerability disclosures",
            description: "Processes for receiving, analyzing, and responding to vulnerability disclosures are established"
          },
          "ID.RA-09": {
            name: "The authenticity and integrity of hardware and software",
            description: "The authenticity and integrity of hardware and software are assessed prior to acquisition and use"
          },
          "ID.RA-10": {
            name: "Critical suppliers are assessed",
            description: "Critical suppliers are assessed prior to acquisition and during use"
          }
        }
      },
      "ID.IM": {
        name: "Improvement",
        subcategories: {
          "ID.IM-01": {
            name: "Improvements to organizational cybersecurity risk management processes",
            description: "Improvements to organizational cybersecurity risk management processes are identified from evaluations"
          },
          "ID.IM-02": {
            name: "Improvement implementation results",
            description: "Improvement implementation results are evaluated"
          },
          "ID.IM-03": {
            name: "Information is collected and analyzed to improve the organization's cybersecurity risk management processes",
            description: "Information is collected and analyzed to improve the organization's cybersecurity risk management processes"
          },
          "ID.IM-04": {
            name: "Resources for cybersecurity risk management",
            description: "Resources for cybersecurity risk management (including people, information, technology, finances, and facilities) are sufficient for organizational objectives"
          }
        }
      }
    }
  },
  PR: {
    name: "Protect",
    color: "yellow",
    categories: {
      "PR.AA": {
        name: "Identity Management, Authentication, and Access Control",
        subcategories: {
          "PR.AA-01": {
            name: "Identities and credentials for authorized individuals, services, and hardware",
            description: "Identities and credentials for authorized individuals, services, and hardware are managed by the organization"
          },
          "PR.AA-02": {
            name: "Identities are proofed and bound to credentials",
            description: "Identities are proofed and bound to credentials based on organizational requirements"
          },
          "PR.AA-03": {
            name: "Users, services, and hardware are authenticated",
            description: "Users, services, and hardware are authenticated"
          },
          "PR.AA-04": {
            name: "Identity assertions are protected, conveyed, and verified",
            description: "Identity assertions are protected, conveyed, and verified"
          },
          "PR.AA-05": {
            name: "Access permissions, entitlements, and authorizations",
            description: "Access permissions, entitlements, and authorizations are defined in a policy, managed, enforced, and reviewed, and incorporate the principles of least privilege and separation of duties"
          },
          "PR.AA-06": {
            name: "Physical and logical access to assets",
            description: "Physical and logical access to assets is managed, monitored, and enforced commensurate with risk"
          }
        }
      },
      "PR.AT": {
        name: "Awareness and Training",
        subcategories: {
          "PR.AT-01": {
            name: "Personnel are provided with cybersecurity awareness",
            description: "Personnel are provided with cybersecurity awareness and training so that they can perform their cybersecurity-related duties and responsibilities"
          },
          "PR.AT-02": {
            name: "Individuals in specialized roles",
            description: "Individuals in specialized roles are provided with role-appropriate cybersecurity awareness and training"
          }
        }
      },
      "PR.DS": {
        name: "Data Security",
        subcategories: {
          "PR.DS-01": {
            name: "The confidentiality, integrity, and availability of data-in-transit",
            description: "The confidentiality, integrity, and availability of data-in-transit are protected"
          },
          "PR.DS-02": {
            name: "The confidentiality, integrity, and availability of data-at-rest",
            description: "The confidentiality, integrity, and availability of data-at-rest are protected"
          },
          "PR.DS-03": {
            name: "The confidentiality, integrity, and availability of data-in-use",
            description: "The confidentiality, integrity, and availability of data-in-use are protected"
          },
          "PR.DS-04": {
            name: "Availability, integrity, and confidentiality of backups",
            description: "Availability, integrity, and confidentiality of backups are protected"
          },
          "PR.DS-05": {
            name: "Access permissions for software and hardware",
            description: "Access permissions for software and hardware are managed consistent with the principle of least privilege and separation of duties"
          },
          "PR.DS-06": {
            name: "Integrity checking mechanisms",
            description: "Integrity checking mechanisms are used to verify software, firmware, and information integrity"
          },
          "PR.DS-07": {
            name: "The development and testing environment(s)",
            description: "The development and testing environment(s) are separate from the production environment"
          },
          "PR.DS-08": {
            name: "Hardware integrity protection",
            description: "Hardware integrity protection mechanisms are implemented"
          },
          "PR.DS-09": {
            name: "The confidentiality of backup information",
            description: "The confidentiality of backup information is protected"
          },
          "PR.DS-10": {
            name: "The integrity and availability of backup information",
            description: "The integrity and availability of backup information are protected"
          },
          "PR.DS-11": {
            name: "Data-in-transit is protected",
            description: "Data-in-transit is protected"
          }
        }
      },
      "PR.IR": {
        name: "Information Protection Processes and Procedures",
        subcategories: {
          "PR.IR-01": {
            name: "Networks and environments are protected from unauthorized logical access",
            description: "Networks and environments are protected from unauthorized logical access and usage"
          },
          "PR.IR-02": {
            name: "The organization's technology assets are protected from environmental threats",
            description: "The organization's technology assets are protected from environmental threats"
          },
          "PR.IR-03": {
            name: "Mechanisms are implemented to achieve resilience requirements",
            description: "Mechanisms are implemented to achieve resilience requirements in normal and adverse situations"
          },
          "PR.IR-04": {
            name: "The organization's personnel, assets, and facilities",
            description: "The organization's personnel, assets, and facilities are protected from physical threats"
          }
        }
      },
      "PR.MA": {
        name: "Maintenance",
        subcategories: {
          "PR.MA-01": {
            name: "Maintenance activities are authorized, logged, and performed",
            description: "Maintenance activities are authorized, logged, and performed in a manner that prevents unauthorized access"
          },
          "PR.MA-02": {
            name: "Remote maintenance activities",
            description: "Remote maintenance activities are authorized, logged, and performed in a manner that prevents unauthorized access"
          }
        }
      },
      "PR.PT": {
        name: "Protective Technology",
        subcategories: {
          "PR.PT-01": {
            name: "System and asset configurations",
            description: "System and asset configurations are managed, monitored, and maintained using a configuration management process"
          },
          "PR.PT-02": {
            name: "Software is maintained, replaced, and removed",
            description: "Software is maintained, replaced, and removed commensurate with risk"
          },
          "PR.PT-03": {
            name: "Hardware is maintained, replaced, and removed",
            description: "Hardware is maintained, replaced, and removed commensurate with risk"
          },
          "PR.PT-04": {
            name: "System and network security configurations",
            description: "System and network security configurations are managed and maintained"
          },
          "PR.PT-05": {
            name: "Mechanisms are implemented to manage access",
            description: "Mechanisms are implemented to manage access, hosting, and data sovereignty requirements"
          }
        }
      }
    }
  },
  DE: {
    name: "Detect",
    color: "orange",
    categories: {
      "DE.AE": {
        name: "Anomalies and Events",
        subcategories: {
          "DE.AE-01": {
            name: "Networks and network services are monitored",
            description: "Networks and network services are monitored to find potentially adverse events"
          },
          "DE.AE-02": {
            name: "Authorized and unauthorized software",
            description: "Authorized and unauthorized software and software characteristics are monitored to find potentially adverse events"
          },
          "DE.AE-03": {
            name: "Unauthorized personnel, connections, devices, and software",
            description: "Unauthorized personnel, connections, devices, and software are detected"
          },
          "DE.AE-04": {
            name: "Malicious code",
            description: "Malicious code is detected"
          },
          "DE.AE-05": {
            name: "Unauthorized mobile code",
            description: "Unauthorized mobile code is detected"
          },
          "DE.AE-06": {
            name: "External service provider activities",
            description: "External service provider activities are monitored to detect potentially adverse events"
          },
          "DE.AE-07": {
            name: "Monitoring for unauthorized personnel, connections, devices, and software",
            description: "Monitoring for unauthorized personnel, connections, devices, and software is performed"
          },
          "DE.AE-08": {
            name: "Monitoring is performed for atypical or unauthorized behaviors",
            description: "Monitoring is performed for atypical or unauthorized behaviors and conditions that may indicate adverse events"
          }
        }
      },
      "DE.CM": {
        name: "Continuous Monitoring",
        subcategories: {
          "DE.CM-01": {
            name: "Networks and network services are monitored",
            description: "Networks and network services are monitored for authorized and unauthorized network communications"
          },
          "DE.CM-02": {
            name: "The physical environment is monitored",
            description: "The physical environment is monitored for unauthorized personnel and activity"
          },
          "DE.CM-03": {
            name: "Personnel activity and technology usage",
            description: "Personnel activity and technology usage are monitored for compliance with organizational policies"
          },
          "DE.CM-04": {
            name: "Malicious code is detected in authorized and unauthorized software",
            description: "Malicious code is detected in authorized and unauthorized software"
          },
          "DE.CM-05": {
            name: "Unauthorized mobile code is detected",
            description: "Unauthorized mobile code is detected"
          },
          "DE.CM-06": {
            name: "External service provider activities are monitored",
            description: "External service provider activities are monitored"
          },
          "DE.CM-07": {
            name: "Monitoring for unauthorized personnel, connections, devices, and software",
            description: "Monitoring for unauthorized personnel, connections, devices, and software is performed"
          },
          "DE.CM-08": {
            name: "Vulnerability scans are performed",
            description: "Vulnerability scans are performed"
          },
          "DE.CM-09": {
            name: "Computing hardware and software, runtime environments, and their data",
            description: "Computing hardware and software, runtime environments, and their data are monitored to find potentially adverse events"
          }
        }
      },
      "DE.DP": {
        name: "Detection Processes",
        subcategories: {
          "DE.DP-01": {
            name: "Detection activities comply with applicable requirements",
            description: "Detection activities comply with applicable requirements"
          },
          "DE.DP-02": {
            name: "Detection activities are tested",
            description: "Detection activities are tested"
          },
          "DE.DP-03": {
            name: "Detection processes and procedures are tested",
            description: "Detection processes and procedures are tested"
          },
          "DE.DP-04": {
            name: "Event detection information is communicated",
            description: "Event detection information is communicated"
          },
          "DE.DP-05": {
            name: "Detection processes are continuously improved",
            description: "Detection processes are continuously improved"
          }
        }
      }
    }
  },
  RS: {
    name: "Respond",
    color: "red",
    categories: {
      "RS.RP": {
        name: "Response Planning",
        subcategories: {
          "RS.RP-01": {
            name: "A response plan is executed",
            description: "A response plan is executed during or after an incident"
          },
          "RS.RP-02": {
            name: "Roles and responsibilities for incident response are established",
            description: "Roles and responsibilities for incident response are established and communicated"
          },
          "RS.RP-03": {
            name: "Information is shared consistent with response plans",
            description: "Information is shared consistent with response plans"
          },
          "RS.RP-04": {
            name: "Coordination with stakeholders occurs",
            description: "Coordination with stakeholders occurs consistent with response plans"
          },
          "RS.RP-05": {
            name: "The response plan is updated",
            description: "The response plan is updated based on lessons learned and reviews"
          }
        }
      },
      "RS.CO": {
        name: "Communications",
        subcategories: {
          "RS.CO-01": {
            name: "Personnel are trained on their roles and order of operations",
            description: "Personnel are trained on their roles and order of operations for incident response"
          },
          "RS.CO-02": {
            name: "Internal and external stakeholders are notified of incidents",
            description: "Internal and external stakeholders are notified of incidents in accordance with established criteria"
          },
          "RS.CO-03": {
            name: "Information is shared with designated stakeholders",
            description: "Information is shared with designated stakeholders during incident response"
          },
          "RS.CO-04": {
            name: "Coordination between the organization and stakeholders",
            description: "Coordination between the organization and stakeholders occurs during incident response"
          },
          "RS.CO-05": {
            name: "Voluntary information sharing occurs",
            description: "Voluntary information sharing occurs with external stakeholders to achieve broader cybersecurity situational awareness"
          }
        }
      },
      "RS.AN": {
        name: "Analysis",
        subcategories: {
          "RS.AN-01": {
            name: "Incident impact, scope, and criticality are understood",
            description: "Incident impact, scope, and criticality are understood"
          },
          "RS.AN-02": {
            name: "Incident data and metadata are collected",
            description: "Incident data and metadata are collected, and evidence is identified, documented, secured, and preserved"
          },
          "RS.AN-03": {
            name: "Analysis is performed to establish what has taken place",
            description: "Analysis is performed to establish what has taken place during an incident and the root cause of the incident"
          },
          "RS.AN-04": {
            name: "The impact of the incident is understood",
            description: "The impact of the incident is understood, and lessons learned are documented"
          },
          "RS.AN-05": {
            name: "Processes are established to receive, analyze, and respond to vulnerabilities disclosed to the organization from internal and external sources",
            description: "Processes are established to receive, analyze, and respond to vulnerabilities disclosed to the organization from internal and external sources"
          }
        }
      },
      "RS.MI": {
        name: "Mitigation",
        subcategories: {
          "RS.MI-01": {
            name: "Incidents are contained",
            description: "Incidents are contained"
          },
          "RS.MI-02": {
            name: "Incidents are eradicated",
            description: "Incidents are eradicated"
          },
          "RS.MI-03": {
            name: "Newly identified vulnerabilities are mitigated or documented as accepted risks",
            description: "Newly identified vulnerabilities are mitigated or documented as accepted risks"
          }
        }
      }
    }
  },
  RC: {
    name: "Recover",
    color: "purple",
    categories: {
      "RC.RP": {
        name: "Recovery Planning",
        subcategories: {
          "RC.RP-01": {
            name: "Recovery plan is executed",
            description: "Recovery plan is executed during or after a cybersecurity incident"
          },
          "RC.RP-02": {
            name: "Recovery strategies are updated",
            description: "Recovery strategies are updated"
          },
          "RC.RP-03": {
            name: "Recovery time and point objectives",
            description: "Recovery time and point objectives are met"
          },
          "RC.RP-04": {
            name: "The recovery plan is updated",
            description: "The recovery plan is updated using lessons learned"
          }
        }
      },
      "RC.IM": {
        name: "Improvements",
        subcategories: {
          "RC.IM-01": {
            name: "Recovery plans incorporate lessons learned",
            description: "Recovery plans incorporate lessons learned"
          },
          "RC.IM-02": {
            name: "Recovery strategies are updated",
            description: "Recovery strategies are updated"
          }
        }
      },
      "RC.CO": {
        name: "Communications",
        subcategories: {
          "RC.CO-01": {
            name: "Reputation after an event is managed",
            description: "Reputation after an event is managed"
          },
          "RC.CO-02": {
            name: "Internal and external communications are coordinated",
            description: "Internal and external communications are coordinated"
          },
          "RC.CO-03": {
            name: "Recovery activities are communicated to designated stakeholders",
            description: "Recovery activities are communicated to designated stakeholders"
          },
          "RC.CO-04": {
            name: "Public updates on incident recovery are shared",
            description: "Public updates on incident recovery are shared using approved methods and messaging"
          }
        }
      }
    }
  }
};

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Dashboard Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
            <p className="text-gray-600 mb-4">We're sorry, but there was an error loading the dashboard.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// UPDATED INITIAL STATE WITH STANDARDS SECTION
const initialState = {
  filters: {
    area: '',
    type: '',
    status: '',
    priority: '',
    maturityLevel: '',
    applicability: '',
    capability: ''
  },
  ui: {
    viewMode: 'overview',
    sidebarExpanded: true,
    activeFilters: false,
    chartFullscreen: null,
    showUploadModal: false,
    showPurgeModal: false,
    showNewCapabilityModal: false,
    showColumnSelector: false,
    showCompanyProfileModal: false,
    showProfileSetup: false,
    showThreatSettingsModal: false,
    selectedCapability: null,
    selectedPCD: null,
    isMobile: false
  },
  modal: {
    isOpen: false,
    selectedRequirement: null,
    editMode: false
  },
  searchTerm: '',
  columnVisibility: {
    id: true,
    description: true,
    capability: true,
    progressStatus: true,
    businessValue: true,
    maturity: true,
    applicability: true,
    status: true,
    actions: true,
    area: false,
    type: false,
    priority: false,
    assignee: false,
    dueDate: false
  },
  // NEW STANDARDS SECTION
  standards: {
    nistCsf: {
      assessmentData: {},
      selectedFunction: 'GV',
      expandedItems: {}
    },
    selectedFramework: 'nist-csf-2.0'
  }
};

// ENHANCED DASHBOARD REDUCER WITH STANDARDS ACTIONS
const dashboardReducer = (state, action) => {
  switch (action.type) {
    case 'SET_FILTER':
      return {
        ...state,
        filters: { ...state.filters, [action.field]: action.value }
      };
    case 'CLEAR_FILTERS':
      return {
        ...state,
        filters: { ...initialState.filters }
      };
    case 'CLEAR_SEARCH':
      return {
        ...state,
        searchTerm: ''
      };
    case 'SET_VIEW_MODE':
      return {
        ...state,
        ui: { ...state.ui, viewMode: action.viewMode }
      };
    case 'TOGGLE_SIDEBAR':
      return {
        ...state,
        ui: { ...state.ui, sidebarExpanded: !state.ui.sidebarExpanded }
      };
    case 'SET_SIDEBAR_EXPANDED':
      return {
        ...state,
        ui: { ...state.ui, sidebarExpanded: action.expanded }
      };
    case 'TOGGLE_FILTERS':
      return {
        ...state,
        ui: { ...state.ui, activeFilters: !state.ui.activeFilters }
      };
    case 'TOGGLE_COLUMN_SELECTOR':
      return {
        ...state,
        ui: { ...state.ui, showColumnSelector: !state.ui.showColumnSelector }
      };
    case 'TOGGLE_COLUMN_VISIBILITY':
      return {
        ...state,
        columnVisibility: { ...state.columnVisibility, [action.column]: !state.columnVisibility[action.column] }
      };
    case 'OPEN_MODAL':
      return {
        ...state,
        modal: { isOpen: true, selectedRequirement: action.requirement, editMode: action.editMode || false }
      };
    case 'CLOSE_MODAL':
      return {
        ...state,
        modal: { isOpen: false, selectedRequirement: null, editMode: false }
      };
    case 'SET_SEARCH_TERM':
      return {
        ...state,
        searchTerm: action.searchTerm
      };
    case 'SET_CHART_FULLSCREEN':
      return {
        ...state,
        ui: { ...state.ui, chartFullscreen: action.chartId }
      };
    case 'TOGGLE_UPLOAD_MODAL':
      return {
        ...state,
        ui: { ...state.ui, showUploadModal: !state.ui.showUploadModal }
      };
    case 'TOGGLE_PURGE_MODAL':
      return {
        ...state,
        ui: { ...state.ui, showPurgeModal: !state.ui.showPurgeModal }
      };
    case 'TOGGLE_NEW_CAPABILITY_MODAL':
      return {
        ...state,
        ui: { ...state.ui, showNewCapabilityModal: !state.ui.showNewCapabilityModal }
      };
    case 'SET_SELECTED_CAPABILITY':
      return {
        ...state,
        ui: { ...state.ui, selectedCapability: action.capabilityId },
        filters: { ...state.filters, capability: action.capabilityId }
      };
    case 'SET_SELECTED_PCD':
      return {
        ...state,
        ui: { ...state.ui, selectedPCD: action.pcdId }
      };
    case 'SET_IS_MOBILE':
      return {
        ...state,
        ui: { ...state.ui, isMobile: action.isMobile }
      };
    case 'TOGGLE_COMPANY_PROFILE_MODAL':
      return {
        ...state,
        ui: { ...state.ui, showCompanyProfileModal: !state.ui.showCompanyProfileModal }
      };
    case 'SET_COMPANY_PROFILE_SETUP':
      return {
        ...state,
        ui: { ...state.ui, showProfileSetup: action.show }
      };
    case 'TOGGLE_THREAT_SETTINGS_MODAL':
      return {
        ...state,
        ui: { ...state.ui, showThreatSettingsModal: !state.ui.showThreatSettingsModal }
      };
    // NEW STANDARDS ACTIONS
    case 'SET_STANDARDS_FRAMEWORK':
      return {
        ...state,
        standards: {
          ...state.standards,
          selectedFramework: action.framework
        }
      };
    case 'UPDATE_NIST_CSF_DATA':
      return {
        ...state,
        standards: {
          ...state.standards,
          nistCsf: {
            ...state.standards.nistCsf,
            assessmentData: action.data
          }
        }
      };
    case 'SET_NIST_CSF_FUNCTION':
      return {
        ...state,
        standards: {
          ...state.standards,
          nistCsf: {
            ...state.standards.nistCsf,
            selectedFunction: action.functionId
          }
        }
      };
    default:
      return state;
  }
};

// NIST CSF UTILITY FUNCTIONS
const calculateNISTCSFProgress = (assessmentData) => {
  if (!assessmentData || Object.keys(assessmentData).length === 0) return 0;
  
  let totalScore = 0;
  let totalItems = 0;
  
  Object.entries(assessmentData).forEach(([subcategoryId, data]) => {
    if (data && typeof data === 'object') {
      const weight = data.weight || 3;
      const maturity = data.maturity || 0;
      const implementation = data.implementation || 0;
      const evidence = data.evidence || 0;
      
      const averageScore = (maturity + implementation + evidence) / 3;
      const subcategoryScore = (averageScore * weight * 100) / (3 * 5);
      
      totalScore += subcategoryScore;
      totalItems += 1;
    }
  });
  
  return totalItems > 0 ? totalScore / totalItems : 0;
};

// NIST CSF Assessment Component (defined inline to avoid import issues)
const NISTCSFAssessment = ({ state, dispatch }) => {
  const [assessmentData, setAssessmentData] = useState(
    state.standards?.nistCsf?.assessmentData || {}
  );
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
    return (averageScore * weight * 100) / (3 * 5);
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
    
    const scores = categoryIds.map(catId => 
      calculateCategoryScore(functionData.categories[catId])
    );
    
    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  };

  const updateAssessmentData = (subcategoryId, field, value) => {
    const newData = {
      ...assessmentData,
      [subcategoryId]: {
        ...assessmentData[subcategoryId],
        [field]: value
      }
    };
    setAssessmentData(newData);
    
    // Update dashboard state
    dispatch({
      type: 'UPDATE_NIST_CSF_DATA',
      data: newData
    });
  };

  const ScoreIndicator = ({ score, size = "default" }) => {
    const getColor = (score) => {
      if (score >= 80) return "bg-green-500";
      if (score >= 60) return "bg-yellow-500";
      if (score >= 40) return "bg-orange-500";
      return "bg-red-500";
    };

    const sizeClass = size === "large" ? "h-4 w-4" : "h-3 w-3";

    return (
      <div className={`${sizeClass} rounded-full ${getColor(score)} flex items-center justify-center`}>
        {size === "large" && (
          <span className="text-xs font-bold text-white">
            {Math.round(score)}
          </span>
        )}
      </div>
    );
  };

  const SubcategoryRow = ({ subcategoryId, subcategoryData, categoryId, functionId }) => {
    const data = assessmentData[subcategoryId] || {};
    const score = calculateSubcategoryScore(subcategoryId);
    const isExpanded = expandedItems[subcategoryId];

    return (
      <div className="border border-gray-200 rounded-lg mb-3">
        <div 
          className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => setExpandedItems(prev => ({
            ...prev,
            [subcategoryId]: !prev[subcategoryId]
          }))}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3">
                <span className="font-mono text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                  {subcategoryId}
                </span>
                <h4 className="font-medium text-gray-900">{subcategoryData.name}</h4>
                <ScoreIndicator score={score} size="large" />
              </div>
              <p className="text-sm text-gray-600 mt-2">{subcategoryData.description}</p>
            </div>
            <ChevronRight 
              className={`h-5 w-5 text-gray-400 transition-transform ${
                isExpanded ? 'transform rotate-90' : ''
              }`} 
            />
          </div>
        </div>

        {isExpanded && (
          <div className="px-4 pb-4 border-t border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
              {/* Weight Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority Weight
                </label>
                <select 
                  value={data.weight || 3}
                  onChange={(e) => updateAssessmentData(subcategoryId, 'weight', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={1}>1 - Low Priority</option>
                  <option value={2}>2 - Medium Priority</option>
                  <option value={3}>3 - Standard Priority</option>
                  <option value={4}>4 - High Priority</option>
                  <option value={5}>5 - Critical Priority</option>
                </select>
              </div>

              {/* Maturity Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Implementation Maturity
                </label>
                <select 
                  value={data.maturity || 0}
                  onChange={(e) => updateAssessmentData(subcategoryId, 'maturity', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={0}>0 - Not Implemented</option>
                  <option value={1}>1 - Planned</option>
                  <option value={2}>2 - Partially Implemented</option>
                  <option value={3}>3 - Implemented</option>
                  <option value={4}>4 - Managed</option>
                  <option value={5}>5 - Optimized</option>
                </select>
              </div>

              {/* Implementation Quality */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Implementation Quality
                </label>
                <select 
                  value={data.implementation || 0}
                  onChange={(e) => updateAssessmentData(subcategoryId, 'implementation', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={0}>0 - No Implementation</option>
                  <option value={1}>1 - Ad Hoc</option>
                  <option value={2}>2 - Basic</option>
                  <option value={3}>3 - Standard</option>
                  <option value={4}>4 - Advanced</option>
                  <option value={5}>5 - Leading Practice</option>
                </select>
              </div>

              {/* Evidence Quality */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Evidence Quality
                </label>
                <select 
                  value={data.evidence || 0}
                  onChange={(e) => updateAssessmentData(subcategoryId, 'evidence', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={0}>0 - No Evidence</option>
                  <option value={1}>1 - Anecdotal</option>
                  <option value={2}>2 - Some Documentation</option>
                  <option value={3}>3 - Good Documentation</option>
                  <option value={4}>4 - Comprehensive</option>
                  <option value={5}>5 - Validated</option>
                </select>
              </div>
            </div>

            {/* Notes Section */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Implementation Notes
              </label>
              <textarea
                value={data.notes || ''}
                onChange={(e) => updateAssessmentData(subcategoryId, 'notes', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Add notes about current implementation, gaps, or planned improvements..."
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  const CategorySection = ({ categoryId, categoryData, functionId }) => {
    const score = calculateCategoryScore(categoryData);
    const isExpanded = expandedItems[categoryId];

    return (
      <div className="mb-6">
        <div 
          className="bg-gray-50 border border-gray-200 rounded-lg p-4 cursor-pointer hover:bg-gray-100 transition-colors"
          onClick={() => setExpandedItems(prev => ({
            ...prev,
            [categoryId]: !prev[categoryId]
          }))}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="font-mono text-sm font-bold text-gray-700 bg-white px-3 py-1 rounded border">
                {categoryId}
              </span>
              <h3 className="text-lg font-semibold text-gray-900">{categoryData.name}</h3>
              <ScoreIndicator score={score} size="large" />
              <span className="text-sm text-gray-600">({Math.round(score)}%)</span>
            </div>
            <ChevronRight 
              className={`h-5 w-5 text-gray-400 transition-transform ${
                isExpanded ? 'transform rotate-90' : ''
              }`} 
            />
          </div>
        </div>

        {isExpanded && (
          <div className="mt-4 ml-4">
            {Object.entries(categoryData.subcategories).map(([subId, subData]) => (
              <SubcategoryRow 
                key={subId}
                subcategoryId={subId}
                subcategoryData={subData}
                categoryId={categoryId}
                functionId={functionId}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  const currentFunction = NIST_CSF_STRUCTURE[selectedFunction];
  const functionScore = calculateFunctionScore(currentFunction);

  return (
    <div className="space-y-6">
      {/* Function Selector */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <Shield className="h-6 w-6 mr-3 text-blue-600" />
          NIST Cybersecurity Framework 2.0 Assessment
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {Object.entries(NIST_CSF_STRUCTURE).map(([funcId, funcData]) => {
            const score = calculateFunctionScore(funcData);
            return (
              <button
                key={funcId}
                onClick={() => setSelectedFunction(funcId)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedFunction === funcId
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="text-center">
                  <div className="font-bold text-lg text-gray-900">{funcId}</div>
                  <div className="text-sm text-gray-600 mb-2">{funcData.name}</div>
                  <div className="flex items-center justify-center space-x-2">
                    <ScoreIndicator score={score} size="large" />
                    <span className="text-xs font-medium">{Math.round(score)}%</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Current Function Assessment */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900 flex items-center">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-lg font-mono mr-3">
                {selectedFunction}
              </span>
              {currentFunction.name}
            </h3>
            <p className="text-gray-600 mt-1">
              Current Function Score: <span className="font-bold">{Math.round(functionScore)}%</span>
            </p>
          </div>
          
          <div className="flex space-x-3">
            <button className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
              <TrendingUp className="h-4 w-4 mr-2" />
              View Progress
            </button>
            <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <FileCheck className="h-4 w-4 mr-2" />
              Export Assessment
            </button>
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-4">
          {Object.entries(currentFunction.categories).map(([catId, catData]) => (
            <CategorySection 
              key={catId}
              categoryId={catId}
              categoryData={catData}
              functionId={selectedFunction}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Standards View Component (defined inline to avoid import issues)
const StandardsViewComponent = ({ state, dispatch }) => {
  const [selectedFramework, setSelectedFramework] = useState('nist-csf-2.0');

  const frameworks = [
    {
      id: 'nist-csf-2.0',
      name: 'NIST CSF 2.0',
      description: 'National Institute of Standards and Technology Cybersecurity Framework 2.0',
      status: 'available',
      progress: calculateNISTCSFProgress(state.standards?.nistCsf?.assessmentData || {}),
      color: 'blue',
      categories: ['Govern', 'Identify', 'Protect', 'Detect', 'Respond', 'Recover']
    },
    {
      id: 'iso-27001',
      name: 'ISO 27001',
      description: 'Information Security Management System Standard',
      status: 'coming-soon',
      progress: 0,
      color: 'green',
      categories: ['Information Security Policies', 'Access Control', 'Cryptography']
    },
    {
      id: 'soc-2',
      name: 'SOC 2',
      description: 'Service Organization Control 2 Type II',
      status: 'coming-soon',
      progress: 0,
      color: 'purple',
      categories: ['Security', 'Availability', 'Processing Integrity']
    }
  ];

  const renderFrameworkCard = (framework) => (
    <div
      key={framework.id}
      className={`bg-white border-2 rounded-xl p-6 cursor-pointer transition-all hover:shadow-lg ${
        selectedFramework === framework.id
          ? 'border-blue-500 shadow-md'
          : 'border-gray-200 hover:border-gray-300'
      }`}
      onClick={() => framework.status === 'available' && setSelectedFramework(framework.id)}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{framework.name}</h3>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          framework.status === 'available' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-gray-100 text-gray-600'
        }`}>
          {framework.status === 'available' ? 'Available' : 'Coming Soon'}
        </span>
      </div>
      
      <p className="text-gray-600 text-sm mb-4">{framework.description}</p>
      
      {framework.status === 'available' && (
        <div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-600">Assessment Progress</span>
            <span className="font-medium">{Math.round(framework.progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`bg-${framework.color}-600 h-2 rounded-full transition-all duration-300`}
              style={{ width: `${framework.progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );

  const renderFrameworkContent = () => {
    switch (selectedFramework) {
      case 'nist-csf-2.0':
        return <NISTCSFAssessment state={state} dispatch={dispatch} />;
      default:
        return (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Framework Coming Soon</h3>
            <p className="text-gray-600">
              This framework assessment will be available in a future update.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Award className="h-8 w-8 mr-3 text-blue-600" />
              Standards & Frameworks
            </h1>
            <p className="text-gray-600 mt-2">
              Assess and manage compliance across multiple cybersecurity and governance frameworks
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">3</div>
            <div className="text-sm text-gray-600">Frameworks Available</div>
          </div>
        </div>
      </div>

      {/* Framework Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {frameworks.map(renderFrameworkCard)}
      </div>

      {/* Framework Content */}
      <div className="mt-8">
        {renderFrameworkContent()}
      </div>
    </div>
  );
};

// Main Dashboard Component
const RequirementsDashboard = () => {
  const [state, dispatch] = useReducer(dashboardReducer, initialState);
  
  // Theme hook
  const { currentTheme, theme } = useTheme();
  
  // Add Toast hook for notifications
  const { addToast } = useToast();

  // Company profile hook
  const { profile: companyProfile, loading: profileLoading, saveProfile } = useCompanyProfile();

  // Data hooks
  const { 
    requirements, 
    loading, 
    error, 
    updateRequirement, 
    deleteRequirement, 
    addRequirement, 
    purgeAllData, 
    importFromCSV 
  } = useRequirementsData();
  
  const { capabilities, loading: capabilitiesLoading, addCapability } = useCapabilitiesData();
  const { pcdData, loading: pcdLoading, updatePCDData } = usePCDData();
  
  // Processed data
  const filteredRequirements = useFilteredRequirements(requirements, state.filters, state.searchTerm);
  const analyticsData = useAnalytics(requirements);

  // NIST CSF Export/Import Functions
  const handleExportNISTCSF = () => {
    try {
      const assessmentData = state.standards?.nistCsf?.assessmentData || {};
      const exportData = {
        exportDate: new Date().toISOString(),
        frameworkVersion: 'NIST CSF 2.0',
        companyProfile: companyProfile || {},
        assessmentData: assessmentData,
        summary: {
          totalSubcategories: Object.keys(assessmentData).length,
          overallProgress: calculateNISTCSFProgress(assessmentData),
          lastModified: new Date().toISOString()
        }
      };
      
      const jsonContent = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `nist-csf-assessment-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      addToast('NIST CSF assessment exported successfully!', 'success');
    } catch (error) {
      addToast('Failed to export NIST CSF assessment.', 'error');
    }
  };

  const handleImportNISTCSF = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importData = JSON.parse(e.target.result);
        if (importData.assessmentData) {
          dispatch({
            type: 'UPDATE_NIST_CSF_DATA',
            data: importData.assessmentData
          });
          addToast('NIST CSF assessment imported successfully!', 'success');
        } else {
          addToast('Invalid NIST CSF assessment file format.', 'error');
        }
      } catch (error) {
        addToast('Failed to import NIST CSF assessment file.', 'error');
      }
    };
    reader.readAsText(file);
  };

  // Mobile detection and responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      const isMobile = window.innerWidth < 1024;
      dispatch({ type: 'SET_IS_MOBILE', isMobile });
      
      // Auto-collapse sidebar on mobile
      if (isMobile && state.ui.sidebarExpanded) {
        dispatch({ type: 'SET_SIDEBAR_EXPANDED', expanded: false });
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [state.ui.sidebarExpanded]);

  // Check if profile setup is needed
  useEffect(() => {
    if (!profileLoading && (!companyProfile || !companyProfile.profileCompleted)) {
      // Show setup prompt for new users after a delay
      const timer = setTimeout(() => {
        dispatch({ type: 'SET_COMPANY_PROFILE_SETUP', show: true });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [profileLoading, companyProfile]);

  // ENHANCED KEYBOARD SHORTCUTS WITH STANDARDS
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Escape to close modals
      if (e.key === 'Escape') {
        dispatch({ type: 'CLOSE_MODAL' });
      }

      // Cmd/Ctrl + 1-9 for quick view switching (UPDATED WITH STANDARDS)
      if ((e.metaKey || e.ctrlKey) && e.key >= '1' && e.key <= '9') {
        e.preventDefault();
        const views = [
          'overview', 'company-profile', 'capabilities', 'requirements', 
          'threat-intelligence', 'mitre-navigator', 'risk-management', 'standards', // ADDED standards
          'pcd', 'maturity', 'justification', 'analytics', 'diagnostics', 'settings'
        ];
        const viewIndex = parseInt(e.key) - 1;
        if (views[viewIndex]) {
          dispatch({ type: 'SET_VIEW_MODE', viewMode: views[viewIndex] });
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // LOCALSTORAGE PERSISTENCE FOR STANDARDS DATA
  useEffect(() => {
    if (state.standards?.nistCsf?.assessmentData) {
      try {
        localStorage.setItem('nist-csf-assessment', JSON.stringify(state.standards.nistCsf.assessmentData));
      } catch (error) {
        console.error('Failed to save NIST CSF data to localStorage:', error);
      }
    }
  }, [state.standards?.nistCsf?.assessmentData]);

  // Load standards data from localStorage on mount
  useEffect(() => {
    try {
      const savedData = localStorage.getItem('nist-csf-assessment');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        dispatch({
          type: 'UPDATE_NIST_CSF_DATA',
          data: parsedData
        });
      }
    } catch (error) {
      console.error('Failed to load NIST CSF data from localStorage:', error);
    }
  }, []);

  // Event handlers with Toast notifications
  const handleFilterChange = (field, value) => {
    dispatch({ type: 'SET_FILTER', field, value });
  };

  const handleViewRequirement = (requirement) => {
    dispatch({ type: 'OPEN_MODAL', requirement });
  };

  const handleEditRequirement = (requirement) => {
    dispatch({ type: 'OPEN_MODAL', requirement, editMode: true });
  };

  // Profile update handler
  const handleProfileUpdate = (updatedProfile, isFinalSave = true) => {
    const success = saveProfile(updatedProfile, !isFinalSave); // Pass isPartialUpdate as opposite of isFinalSave
    if (success && isFinalSave) {
      // Only show toast and close modal for final saves
      addToast('Company profile updated successfully!', 'success');
      dispatch({ type: 'TOGGLE_COMPANY_PROFILE_MODAL' });
    } else if (!success && isFinalSave) {
      addToast('Failed to update company profile.', 'error');
    }
    // For real-time updates (isFinalSave = false), we don't show toasts or close modals
  };

  // Threat Settings handler
  const handleThreatSettingsSave = (settings) => {
    try {
      // Save threat settings - in a real app, this would save to your backend/localStorage
      localStorage.setItem('threatSettings', JSON.stringify(settings));
      addToast('Threat settings saved successfully!', 'success');
      dispatch({ type: 'TOGGLE_THREAT_SETTINGS_MODAL' });
    } catch (error) {
      console.error('Failed to save threat settings:', error);
      addToast('Failed to save threat settings.', 'error');
    }
  };

  // Create requirement from risk handler
  const handleCreateRequirementFromRisk = (requirementData) => {
    const newRequirement = {
      id: `REQ-${Date.now()}`,
      status: 'Not Started',
      capabilityId: '',
      businessValueScore: requirementData.priority === 'Critical' ? 5 : 
                         requirementData.priority === 'High' ? 4 : 3,
      maturityLevel: { score: 1, level: 'Initial' },
      applicability: { type: 'Essential', justification: 'Risk mitigation requirement' },
      costEstimate: 0,
      area: 'Security',
      type: 'Control',
      priority: requirementData.priority,
      ...requirementData
    };
    
    addRequirement(newRequirement);
    addToast(`Requirement created from risk: ${requirementData.title}`, 'success');
  };

  // Updated with Toast notifications and async handling
  const handleUploadCSV = async (csvData) => {
    try {
      const success = await importFromCSV(csvData);
      if (success) {
        addToast(`Successfully imported ${csvData.length} requirements!`, 'success');
        dispatch({ type: 'TOGGLE_UPLOAD_MODAL' });
      } else {
        addToast('Failed to import CSV data. Please check the format.', 'error');
      }
    } catch (error) {
      addToast('An error occurred during import.', 'error');
    }
  };

  const handlePurgeData = async () => {
    try {
      const success = await purgeAllData();
      if (success) {
        addToast('All data has been purged successfully.', 'success');
        dispatch({ type: 'TOGGLE_PURGE_MODAL' });
      } else {
        addToast('Failed to purge data.', 'error');
      }
    } catch (error) {
      addToast('Failed to purge data.', 'error');
    }
  };

  const handleSelectCapability = (capabilityId) => {
    dispatch({ type: 'SET_SELECTED_CAPABILITY', capabilityId });
    dispatch({ type: 'SET_VIEW_MODE', viewMode: 'requirements' });
  };

  const handleCreateCapability = async (newCapability) => {
    try {
      const success = await addCapability(newCapability);
      if (success) {
        addToast(`Successfully created capability ${newCapability.id}!`, 'success');
        dispatch({ type: 'TOGGLE_NEW_CAPABILITY_MODAL' });
        return true;
      } else {
        addToast('Failed to create capability.', 'error');
        return false;
      }
    } catch (error) {
      addToast('Failed to create capability.', 'error');
      return false;
    }
  };

  const handleExportCSV = () => {
    try {
      const csvContent = generateCSV(requirements);
      const filename = `requirements_export_${new Date().toISOString().split('T')[0]}.csv`;
      downloadCSV(csvContent, filename);
      addToast('CSV export completed successfully!', 'success');
    } catch (error) {
      addToast('Failed to export CSV.', 'error');
    }
  };

  const handleUpdateRequirement = async (updatedRequirement) => {
    try {
      const success = await updateRequirement(updatedRequirement);
      if (success) {
        addToast('Requirement updated successfully!', 'success');
        dispatch({ type: 'CLOSE_MODAL' });
      } else {
        addToast('Failed to update requirement.', 'error');
      }
    } catch (error) {
      addToast('Failed to update requirement.', 'error');
    }
  };

  // Loading check
  if (loading || capabilitiesLoading || pcdLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">Dashboard Error</div>
          <div className="text-gray-600 mb-4">{error}</div>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Reload Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Dynamic classes based on theme
  const getThemeClasses = () => {
    return {
      mainContainer: currentTheme === 'stripe' 
        ? 'main-background' 
        : 'bg-gray-50',
      sidebar: currentTheme === 'stripe' 
        ? 'sidebar-gradient' 
        : 'bg-gray-900',
      contentArea: currentTheme === 'stripe' 
        ? 'content-area' 
        : '',
      header: currentTheme === 'stripe' 
        ? 'header-area' 
        : 'bg-white'
    };
  };

  const themeClasses = getThemeClasses();

  const Sidebar = () => (
    <>
      {/* Mobile backdrop */}
      {state.ui.isMobile && state.ui.sidebarExpanded && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <nav className={`
        ${themeClasses.sidebar} text-white flex flex-col transition-all duration-300 z-50
        ${state.ui.isMobile 
          ? state.ui.sidebarExpanded 
            ? 'fixed inset-y-0 left-0 w-64 shadow-2xl' 
            : 'hidden'
          : state.ui.sidebarExpanded 
            ? 'relative w-64' 
            : 'relative w-16'
        }
      `}>
        <div className={`p-4 border-b ${currentTheme === 'stripe' ? 'border-white border-opacity-20' : 'border-gray-700'}`}>
          <div className="flex items-center justify-between">
            {state.ui.sidebarExpanded && (
              <h2 className="text-lg font-semibold">
                {/* Dynamic sidebar title - shows company name when available */}
                {companyProfile?.companyName && companyProfile.companyName.trim() 
                  ? `${companyProfile.companyName.split(' ')[0]} Portal` 
                  : 'OT Dashboard'
                }
              </h2>
            )}
            <button
              onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
              className={`p-2 rounded focus:outline-none focus:ring-2 transition-colors ${
                currentTheme === 'stripe' 
                  ? 'hover:bg-white hover:bg-opacity-20 focus:ring-white focus:ring-opacity-50'
                  : 'hover:bg-blue-600 focus:ring-blue-500'
              }`}
              aria-label={state.ui.sidebarExpanded ? "Collapse sidebar" : "Expand sidebar"}
            >
              {state.ui.isMobile ? (
                state.ui.sidebarExpanded ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />
              ) : (
                state.ui.sidebarExpanded ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <div className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-1">
            {[
              { id: 'overview', name: 'Overview', icon: TrendingUp },
              { id: 'company-profile', name: 'Company Profile', icon: Building2 },
              { id: 'capabilities', name: 'Capabilities', icon: Network },
              { id: 'requirements', name: 'Requirements', icon: FileText },
              { id: 'threat-intelligence', name: 'Threat Intelligence', icon: Shield },
              { id: 'mitre-navigator', name: 'MITRE ATT&CK', icon: Target },
              { id: 'risk-management', name: 'Risks', icon: AlertTriangle },
              { id: 'standards', name: 'Standards & Frameworks', icon: Award }, // ADDED STANDARDS
              { id: 'pcd', name: 'PCD Breakdown', icon: Building2 },
              { id: 'maturity', name: 'Maturity Analysis', icon: Gauge },
              { id: 'justification', name: 'Business Value', icon: Star },
              { id: 'analytics', name: 'Analytics', icon: BarChart3 },
              { id: 'diagnostics', name: 'System Diagnostics', icon: Activity },
              { id: 'settings', name: 'System Settings', icon: Settings }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  dispatch({ type: 'SET_VIEW_MODE', viewMode: item.id });
                  // Auto-close sidebar on mobile after navigation
                  if (state.ui.isMobile && state.ui.sidebarExpanded) {
                    dispatch({ type: 'TOGGLE_SIDEBAR' });
                  }
                }}
                className={`w-full flex items-center px-3 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 ${
                  currentTheme === 'stripe' 
                    ? 'focus:ring-white focus:ring-opacity-50'
                    : 'focus:ring-blue-500'
                } ${
                  state.ui.viewMode === item.id
                    ? currentTheme === 'stripe' 
                      ? 'bg-white bg-opacity-30 text-white shadow-lg backdrop-blur-sm'
                      : 'bg-blue-600 text-white shadow-lg'
                    : currentTheme === 'stripe'
                      ? 'text-white text-opacity-80 hover:bg-white hover:bg-opacity-20 hover:text-white'
                      : 'text-gray-300 hover:bg-blue-600 hover:text-white'
                }`}
                aria-current={state.ui.viewMode === item.id ? 'page' : undefined}
                title={!state.ui.sidebarExpanded ? item.name : undefined}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {state.ui.sidebarExpanded && <span className="ml-3 truncate font-medium">{item.name}</span>}
                
                {/* Active indicator for collapsed state */}
                {!state.ui.sidebarExpanded && state.ui.viewMode === item.id && (
                  <div className={`absolute left-0 w-1 h-8 rounded-r-full ${
                    currentTheme === 'stripe' ? 'bg-white bg-opacity-60' : 'bg-blue-400'
                  }`} />
                )}
              </button>
            ))}
          </div>
        </div>

        {state.ui.sidebarExpanded && (
          <div className={`p-4 border-t ${currentTheme === 'stripe' ? 'border-white border-opacity-20' : 'border-gray-700'}`}>
            <h3 className={`text-sm font-medium mb-3 ${
              currentTheme === 'stripe' ? 'text-white text-opacity-70' : 'text-gray-300'
            }`}>Data Management</h3>
            <div className="space-y-1">
              <button
                onClick={() => dispatch({ type: 'TOGGLE_UPLOAD_MODAL' })}
                className={`w-full flex items-center px-3 py-2 text-sm rounded-lg transition-colors focus:outline-none focus:ring-2 ${
                  currentTheme === 'stripe' 
                    ? 'text-white text-opacity-80 hover:bg-white hover:bg-opacity-20 hover:text-white focus:ring-white focus:ring-opacity-50'
                    : 'text-gray-300 hover:bg-blue-600 hover:text-white focus:ring-blue-500'
                }`}
              >
                <Upload className="h-4 w-4 mr-3 flex-shrink-0" />
                Upload CSV
              </button>
              <button
                onClick={handleExportCSV}
                className={`w-full flex items-center px-3 py-2 text-sm rounded-lg transition-colors focus:outline-none focus:ring-2 ${
                  currentTheme === 'stripe' 
                    ? 'text-white text-opacity-80 hover:bg-white hover:bg-opacity-20 hover:text-white focus:ring-white focus:ring-opacity-50'
                    : 'text-gray-300 hover:bg-blue-600 hover:text-white focus:ring-blue-500'
                }`}
              >
                <Download className="h-4 w-4 mr-3 flex-shrink-0" />
                Export CSV
              </button>
              {/* NEW NIST CSF EXPORT BUTTON */}
              <button
                onClick={handleExportNISTCSF}
                className={`w-full flex items-center px-3 py-2 text-sm rounded-lg transition-colors focus:outline-none focus:ring-2 ${
                  currentTheme === 'stripe' 
                    ? 'text-white text-opacity-80 hover:bg-white hover:bg-opacity-20 hover:text-white focus:ring-white focus:ring-opacity-50'
                    : 'text-gray-300 hover:bg-blue-600 hover:text-white focus:ring-blue-500'
                }`}
              >
                <Award className="h-4 w-4 mr-3 flex-shrink-0" />
                Export NIST CSF
              </button>
              <button
                onClick={() => dispatch({ type: 'TOGGLE_THREAT_SETTINGS_MODAL' })}
                className={`w-full flex items-center px-3 py-2 text-sm rounded-lg transition-colors focus:outline-none focus:ring-2 ${
                  currentTheme === 'stripe' 
                    ? 'text-white text-opacity-80 hover:bg-white hover:bg-opacity-20 hover:text-white focus:ring-white focus:ring-opacity-50'
                    : 'text-gray-300 hover:bg-blue-600 hover:text-white focus:ring-blue-500'
                }`}
              >
                <Settings className="h-4 w-4 mr-3 flex-shrink-0" />
                Threat Settings
              </button>
              <button
                onClick={() => dispatch({ type: 'TOGGLE_PURGE_MODAL' })}
                className="w-full flex items-center px-3 py-2 text-sm text-red-400 hover:bg-red-900 hover:bg-opacity-20 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <Trash2 className="h-4 w-4 mr-3 flex-shrink-0" />
                Purge Data
              </button>
            </div>
          </div>
        )}
      </nav>
    </>
  );

  // ENHANCED HEADER WITH STANDARDS CONTEXT
  const Header = () => {
    // Dynamic title based on current view and company profile
    const getDashboardTitle = () => {
      if (state.ui.viewMode === 'standards') {
        return 'Standards & Compliance Framework Assessment';
      }
      if (companyProfile?.companyName && companyProfile.companyName.trim()) {
        return `Cyber Trust Sensor Portal - ${companyProfile.companyName}`;
      }
      return 'Cyber Trust Portal';
    };

    // Add context information for standards view
    const getContextInfo = () => {
      if (state.ui.viewMode === 'standards') {
        const nistProgress = calculateNISTCSFProgress(state.standards?.nistCsf?.assessmentData);
        return [
          { icon: Award, text: `NIST CSF ${nistProgress.toFixed(0)}% complete` },
          { icon: Shield, text: '3 frameworks available' },
          { icon: Target, text: 'Compliance tracking active' }
        ];
      }
      
      // Your existing context info
      return [
        { icon: Layers, text: 'Network Segmentation Project' },
        { icon: Activity, text: `${filteredRequirements.length} of ${requirements.length} requirements` },
        { icon: Database, text: 'Demo data active' }
      ];
    };

    return (
      <header className={`${themeClasses.header} shadow-sm border-b sticky top-0 z-30 ${
        currentTheme === 'stripe' ? 'border-white border-opacity-10' : 'border-gray-200'
      }`}>
        <div className="px-4 lg:px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center min-w-0 flex-1">
              {/* Mobile menu button */}
              <button
                className="lg:hidden p-2 -ml-2 mr-3 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
                aria-label={state.ui.sidebarExpanded ? "Close sidebar" : "Open sidebar"}
              >
                <Menu className="h-5 w-5 text-gray-600" />
              </button>
              
              <div className="min-w-0 flex-1">
                <h1 className={`text-xl lg:text-2xl font-bold truncate ${
                  currentTheme === 'stripe' ? 'text-white' : 'text-gray-900'
                }`}>
                  {getDashboardTitle()}
                </h1>
                <div className={`hidden sm:flex items-center mt-1 text-xs lg:text-sm space-x-4 ${
                  currentTheme === 'stripe' ? 'text-white text-opacity-80' : 'text-gray-600'
                }`}>
                  {getContextInfo().map((item, index) => (
                    <div key={index} className="flex items-center">
                      <item.icon className="h-3 w-3 lg:h-4 lg:w-4 mr-1" />
                      <span>{item.text}</span>
                    </div>
                  ))}
                </div>
                
                {/* Mobile-only simplified stats */}
                <div className={`sm:hidden mt-1 text-xs ${
                  currentTheme === 'stripe' ? 'text-white text-opacity-80' : 'text-gray-600'
                }`}>
                  <div className="flex items-center">
                    <Activity className="h-3 w-3 mr-1" />
                    <span>{filteredRequirements.length}/{requirements.length} requirements</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 lg:space-x-3 ml-4">
              {/* Company profile quick access */}
              {companyProfile?.profileCompleted && (
                <button 
                  onClick={() => dispatch({ type: 'TOGGLE_COMPANY_PROFILE_MODAL' })}
                  className={`hidden md:inline-flex items-center px-3 py-2 border rounded-lg shadow-sm text-sm font-medium transition-colors ${
                    currentTheme === 'stripe' 
                      ? 'border-white border-opacity-30 text-white bg-white bg-opacity-10 hover:bg-opacity-20 backdrop-blur-sm'
                      : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                  }`}
                  title="Company Profile"
                >
                  <Building2 className="h-4 w-4 mr-2" />
                  {companyProfile.companyName.split(' ')[0]}
                </button>
              )}

              {/* Test Toast Button - Development only */}
              {process.env.NODE_ENV === 'development' && (
                <button 
                  onClick={() => addToast('Portal system working perfectly! 🎉', 'success')}
                  className={`hidden md:inline-flex items-center px-3 py-2 border rounded-lg shadow-sm text-sm font-medium transition-colors ${
                    currentTheme === 'stripe' 
                      ? 'border-white border-opacity-30 text-white bg-white bg-opacity-10 hover:bg-opacity-20 backdrop-blur-sm'
                      : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                  }`}
                >
                  <Star className="h-4 w-4 mr-2" />
                  Test
                </button>
              )}
              
              <button 
                onClick={handleExportCSV}
                className={`hidden sm:inline-flex items-center px-3 lg:px-4 py-2 border-transparent rounded-lg shadow-sm text-xs lg:text-sm font-medium text-white transition-colors ${
                  currentTheme === 'stripe' 
                    ? 'bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                <Download className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
                <span className="hidden lg:inline">Export CSV</span>
                <span className="lg:hidden">Export</span>
              </button>
              
              {/* Mobile menu button */}
              <button
                className="sm:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="More options"
              >
                <MoreVertical className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </header>
    );
  };

  return (
    <ErrorBoundary>
      <div className={`min-h-screen flex flex-col lg:flex-row ${themeClasses.mainContainer}`}>
        <Sidebar />
        
        <div className={`flex-1 flex flex-col min-w-0 ${themeClasses.contentArea}`}>
          <Header />
          
          <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
            {/* Company Profile View */}
            {state.ui.viewMode === 'company-profile' && (
              <CompanyProfileSystem 
                onProfileUpdate={handleProfileUpdate}
                existingProfile={companyProfile}
              />
            )}

            {/* System Settings View */}
            {state.ui.viewMode === 'settings' && (
              <SystemSettings
                companyProfile={companyProfile}
                onProfileUpdate={handleProfileUpdate}
                currentUser={{
                  id: 'current-user',
                  name: companyProfile?.contactName || 'System Administrator',
                  email: companyProfile?.contactEmail || 'admin@company.com',
                  role: 'Administrator',
                  lastLogin: new Date().toISOString(),
                  mfaEnabled: true,
                  avatar: null
                }}
              />
            )}

            {/* Diagnostics View */}
            {state.ui.viewMode === 'diagnostics' && (
              <DiagnosticsView
                appState={{
                  requirements: requirements.length,
                  capabilities: capabilities.length,
                  filters: state.filters,
                  ui: state.ui
                }}
                companyProfile={companyProfile}
              />
            )}

            {/* NEW STANDARDS VIEW */}
            {state.ui.viewMode === 'standards' && (
              <StandardsViewComponent state={state} dispatch={dispatch} />
            )}

            {/* Threat Intelligence View */}
            {state.ui.viewMode === 'threat-intelligence' && (
              <div className="space-y-6">
                {/* Settings Header Bar */}
                <div className="bg-white rounded-xl shadow-md p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Shield className="h-6 w-6 mr-3 text-red-600" />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Threat Intelligence</h3>
                        <p className="text-sm text-gray-600">Real-time threat monitoring and risk assessment</p>
                      </div>
                    </div>
                    <button
                      onClick={() => dispatch({ type: 'TOGGLE_THREAT_SETTINGS_MODAL' })}
                      className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </button>
                  </div>
                </div>
                
                {/* Existing ThreatIntelligenceSystem */}
                <ThreatIntelligenceSystem
                  companyProfile={companyProfile}
                  capabilities={capabilities}
                  requirements={requirements}
                  onUpdateRequirement={handleUpdateRequirement}
                  onAddRequirement={addRequirement}
                  userProfile={{
                    id: 'current-user',
                    name: 'Current User',
                    email: 'user@company.com',
                    role: 'admin'
                  }}
                  onNavigateBack={() => dispatch({ type: 'SET_VIEW_MODE', viewMode: 'overview' })}
                  onOpenSettings={() => dispatch({ type: 'TOGGLE_THREAT_SETTINGS_MODAL' })}
                />
              </div>
            )}

            {/* MITRE ATT&CK Navigator View */}
            {state.ui.viewMode === 'mitre-navigator' && (
              <div className="space-y-6">
                {/* Header Section */}
                <div className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Target className="h-6 w-6 mr-3 text-indigo-600" />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">MITRE ATT&CK Navigator</h3>
                        <p className="text-sm text-gray-600">Comprehensive threat actor technique analysis and visualization platform</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {companyProfile?.industry && (
                        <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                          Configured for: {companyProfile.industry}
                        </div>
                      )}
                      <button
                        onClick={() => dispatch({ type: 'TOGGLE_THREAT_SETTINGS_MODAL' })}
                        className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Configure
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* MITRE Navigator Component */}
                <MitreAttackNavigator
                  companyProfile={companyProfile}
                  onNotification={(message, type) => addToast(message, type)}
                />
              </div>
            )}

            {/* Risk Management View */}
            {state.ui.viewMode === 'risk-management' && (
              <RiskManagement
                threats={[]} // You can pass actual threats data here if available from ThreatIntelligenceSystem
                capabilities={capabilities}
                onCreateRequirement={handleCreateRequirementFromRisk}
              />
            )}

            {/* Overview View */}
            {state.ui.viewMode === 'overview' && (
              <div className="space-y-6">
                {/* Company Profile Summary Card */}
                {companyProfile?.profileCompleted && (
                  <div className="bg-white rounded-xl shadow-md p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <Building2 className="h-6 w-6 mr-3 text-blue-600" />
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {companyProfile.companyName}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {companyProfile.industry} • {getCompanySize(companyProfile)} Business
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => dispatch({ type: 'SET_VIEW_MODE', viewMode: 'company-profile' })}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                        title="Edit Company Profile"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Revenue:</span>
                        <div className="font-medium">{getRevenueLabel(companyProfile.annualRevenue)}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Employees:</span>
                        <div className="font-medium">{getEmployeeLabel(companyProfile.employeeCount)}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Regions:</span>
                        <div className="font-medium">{companyProfile.operatingRegions?.length || 0} regions</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Frameworks:</span>
                        <div className="font-medium">{companyProfile.complianceRequirements?.length || 0} selected</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Setup prompt if profile not completed */}
                {(!companyProfile?.profileCompleted || state.ui.showProfileSetup) && (
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <AlertTriangle className="h-6 w-6 mr-3" />
                        <div>
                          <h3 className="text-lg font-semibold">Complete Your Company Profile</h3>
                          <p className="text-blue-100 mt-1">
                            Set up your company profile to get tailored threat assessments and compliance recommendations.
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => dispatch({ type: 'SET_COMPANY_PROFILE_SETUP', show: false })}
                          className="text-blue-100 hover:text-white transition-colors"
                        >
                          <X className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => {
                            dispatch({ type: 'SET_VIEW_MODE', viewMode: 'company-profile' });
                            dispatch({ type: 'SET_COMPANY_PROFILE_SETUP', show: false });
                          }}
                          className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-colors"
                        >
                          Get Started
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Regulatory Context Banner */}
                <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-xl p-6 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-16 -mt-16" />
                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <Shield className="h-6 w-6 mr-3" />
                        <h3 className="text-xl font-semibold">Regulatory Compliance Framework</h3>
                      </div>
                      <div className="text-sm bg-white bg-opacity-20 px-3 py-1 rounded-full">
                        Active Compliance
                      </div>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6 text-sm">
                      <div className="flex items-center space-x-3">
                        <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                          <Network className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-semibold">Ofgem Framework</div>
                          <div className="text-blue-100 text-xs">Clean power transition by 2030</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                          <Lock className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-semibold">NCSC CAF Guidance</div>
                          <div className="text-blue-100 text-xs">OES compliance mapping</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                          <Building2 className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-semibold">Business Justification</div>
                          <div className="text-blue-100 text-xs">Value & impact analysis</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ENHANCED WIDGET GRID WITH NIST CSF SCORE */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                  <StatCard
                    title="Total Requirements"
                    value={requirements.length}
                    icon={FileText}
                    color="#3b82f6"
                    subtitle="+12% this month"
                    onClick={() => dispatch({ type: 'SET_VIEW_MODE', viewMode: 'requirements' })}
                  />
                  
                  <StatCard
                    title="Completed"
                    value={requirements.filter(r => r.status === 'Completed').length}
                    icon={CheckCircle}
                    color="#10b981"
                    subtitle={`${requirements.length ? ((requirements.filter(r => r.status === 'Completed').length / requirements.length) * 100).toFixed(0) : 0}% done`}
                    onClick={() => {
                      dispatch({ type: 'SET_FILTER', field: 'status', value: 'Completed' });
                      dispatch({ type: 'SET_VIEW_MODE', viewMode: 'requirements' });
                    }}
                  />
                  
                  <StatCard
                    title="In Progress"
                    value={requirements.filter(r => r.status === 'In Progress').length}
                    icon={Clock}
                    color="#f59e0b"
                    subtitle="Active work"
                    onClick={() => {
                      dispatch({ type: 'SET_FILTER', field: 'status', value: 'In Progress' });
                      dispatch({ type: 'SET_VIEW_MODE', viewMode: 'requirements' });
                    }}
                  />
                  
                  <StatCard
                    title="Not Started"
                    value={requirements.filter(r => r.status === 'Not Started').length}
                    icon={AlertTriangle}
                    color="#ef4444"
                    subtitle="Needs attention"
                    onClick={() => {
                      dispatch({ type: 'SET_FILTER', field: 'status', value: 'Not Started' });
                      dispatch({ type: 'SET_VIEW_MODE', viewMode: 'requirements' });
                    }}
                  />

                  <StatCard
                    title="Active Risks"
                    value={15}
                    icon={AlertTriangle}
                    color="#ef4444"
                    subtitle="3 critical"
                    onClick={() => dispatch({ type: 'SET_VIEW_MODE', viewMode: 'risk-management' })}
                  />
                  
                  <StatCard
                    title="Capabilities"
                    value={capabilities.length}
                    icon={Network}
                    color="#6366f1"
                    subtitle="Active programs"
                    onClick={() => dispatch({ type: 'SET_VIEW_MODE', viewMode: 'capabilities' })}
                  />

                  <StatCard
                    title="Avg Business Value"
                    value={(requirements.reduce((sum, r) => sum + (r.businessValueScore || 0), 0) / requirements.length || 0).toFixed(1)}
                    icon={Star}
                    color="#fbbf24"
                    subtitle="Out of 5.0"
                    onClick={() => dispatch({ type: 'SET_VIEW_MODE', viewMode: 'justification' })}
                  />

                  <StatCard
                    title="High Value Items"
                    value={requirements.filter(r => (r.businessValueScore || 0) >= 4).length}
                    icon={DollarSign}
                    color="#10b981"
                    subtitle="4.0+ rating"
                    onClick={() => {
                      dispatch({ type: 'SET_SEARCH_TERM', searchTerm: '' });
                      dispatch({ type: 'CLEAR_FILTERS' });
                      dispatch({ type: 'SET_VIEW_MODE', viewMode: 'justification' });
                    }}
                  />

                  <StatCard
                    title="Avg Maturity"
                    value={(requirements.reduce((sum, r) => sum + (r.maturityLevel?.score || 0), 0) / requirements.length || 0).toFixed(1)}
                    icon={Gauge}
                    color="#06b6d4"
                    subtitle="Out of 5.0"
                    onClick={() => dispatch({ type: 'SET_VIEW_MODE', viewMode: 'maturity' })}
                  />

                  <StatCard
                    title="Unassigned"
                    value={requirements.filter(r => !r.capabilityId).length}
                    icon={GitBranch}
                    color="#f43f5e"
                    subtitle="Need capability"
                    onClick={() => {
                      dispatch({ type: 'SET_FILTER', field: 'capability', value: '' });
                      dispatch({ type: 'SET_VIEW_MODE', viewMode: 'requirements' });
                    }}
                  />

                  <StatCard
                    title="Total Investment"
                    value={`£${(requirements.reduce((sum, r) => sum + (r.costEstimate || 0), 0) / 1000000).toFixed(1)}M`}
                    icon={BarChart3}
                    color="#f97316"
                    subtitle="Estimated cost"
                    onClick={() => dispatch({ type: 'SET_VIEW_MODE', viewMode: 'analytics' })}
                  />

                  <StatCard
                    title="Essential Items"
                    value={requirements.filter(r => r.applicability?.type === 'Essential').length}
                    icon={Shield}
                    color="#14b8a6"
                    subtitle="Must implement"
                    onClick={() => {
                      dispatch({ type: 'SET_FILTER', field: 'applicability', value: 'Essential' });
                      dispatch({ type: 'SET_VIEW_MODE', viewMode: 'requirements' });
                    }}
                  />

                  {/* NEW NIST CSF SCORE CARD */}
                  <StatCard
                    title="NIST CSF Score"
                    value={`${calculateNISTCSFProgress(state.standards?.nistCsf?.assessmentData).toFixed(0)}%`}
                    icon={Award}
                    color="#6366f1"
                    subtitle="Framework compliance"
                    onClick={() => dispatch({ type: 'SET_VIEW_MODE', viewMode: 'standards' })}
                  />
                </div>

                {/* ENHANCED QUICK ACTIONS SECTION WITH STANDARDS */}
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Lightbulb className="h-5 w-5 mr-2 text-yellow-500" />
                    Quick Actions
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                    <button 
                      onClick={() => dispatch({ type: 'SET_VIEW_MODE', viewMode: 'capabilities' })}
                      className="flex flex-col items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group"
                    >
                      <Network className="h-6 w-6 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-medium text-blue-700 text-center">View Capabilities</span>
                    </button>
                    <button 
                      onClick={() => dispatch({ type: 'SET_VIEW_MODE', viewMode: 'threat-intelligence' })}
                      className="flex flex-col items-center p-4 bg-red-50 hover:bg-red-100 rounded-lg transition-colors group"
                    >
                      <Shield className="h-6 w-6 text-red-600 mb-2 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-medium text-red-700 text-center">Threat Intel</span>
                    </button>
                    <button 
                      onClick={() => dispatch({ type: 'SET_VIEW_MODE', viewMode: 'mitre-navigator' })}
                      className="flex flex-col items-center p-4 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors group"
                    >
                      <Target className="h-6 w-6 text-indigo-600 mb-2 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-medium text-indigo-700 text-center">MITRE Navigator</span>
                    </button>
                    <button 
                      onClick={() => dispatch({ type: 'SET_VIEW_MODE', viewMode: 'risk-management' })}
                      className="flex flex-col items-center p-4 bg-red-50 hover:bg-red-100 rounded-lg transition-colors group"
                    >
                      <AlertTriangle className="h-6 w-6 text-red-600 mb-2 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-medium text-red-700 text-center">Risk Management</span>
                    </button>
                    {/* NEW STANDARDS QUICK ACTION */}
                    <button 
                      onClick={() => dispatch({ type: 'SET_VIEW_MODE', viewMode: 'standards' })}
                      className="flex flex-col items-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors group"
                    >
                      <Award className="h-6 w-6 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-medium text-purple-700 text-center">Standards</span>
                    </button>
                    <button 
                      onClick={handleExportCSV}
                      className="flex flex-col items-center p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors group"
                    >
                      <Download className="h-6 w-6 text-orange-600 mb-2 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-medium text-orange-700 text-center">Export Data</span>
                    </button>
                    <button 
                      onClick={() => dispatch({ type: 'SET_VIEW_MODE', viewMode: 'analytics' })}
                      className="flex flex-col items-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors group"
                    >
                      <BarChart3 className="h-6 w-6 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-medium text-purple-700 text-center">View Analytics</span>
                    </button>
                    <button 
                      onClick={() => dispatch({ type: 'TOGGLE_THREAT_SETTINGS_MODAL' })}
                      className="flex flex-col items-center p-4 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors group"
                    >
                      <Settings className="h-6 w-6 text-indigo-600 mb-2 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-medium text-indigo-700 text-center">Threat Settings</span>
                    </button>
                    <button 
                      onClick={() => dispatch({ type: 'SET_VIEW_MODE', viewMode: 'diagnostics' })}
                      className="flex flex-col items-center p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
                    >
                      <Activity className="h-6 w-6 text-gray-600 mb-2 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-medium text-gray-700 text-center">System Diagnostics</span>
                    </button>
                  </div>
                </div>

                {/* ENHANCED ACTIVITY FEED WITH STANDARDS */}
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Activity className="h-5 w-5 mr-2 text-green-600" />
                    Recent Activity
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                      <div className="bg-green-100 p-1 rounded-full">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">Demo data loaded</p>
                        <p className="text-xs text-gray-600 mt-1">
                          {requirements.length} requirements generated successfully • Just now
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                      <div className="bg-blue-100 p-1 rounded-full">
                        <Shield className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">MITRE ATT&CK Navigator available</p>
                        <p className="text-xs text-gray-600 mt-1">
                          Advanced threat technique visualization and analysis • Just now
                        </p>
                      </div>
                    </div>
                    
                    {/* NEW STANDARDS ACTIVITY */}
                    <div className="flex items-start space-x-3 p-3 bg-indigo-50 rounded-lg">
                      <div className="bg-indigo-100 p-1 rounded-full">
                        <Award className="h-4 w-4 text-indigo-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">NIST CSF 2.0 Assessment available</p>
                        <p className="text-xs text-gray-600 mt-1">
                          Comprehensive cybersecurity framework compliance assessment • Just now
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3 p-3 bg-purple-50 rounded-lg">
                      <div className="bg-purple-100 p-1 rounded-full">
                        <Settings className="h-4 w-4 text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">System settings and diagnostics added</p>
                        <p className="text-xs text-gray-600 mt-1">
                          Enhanced system management capabilities • Just now
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg">
                      <div className="bg-red-100 p-1 rounded-full">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">Risk Management system available</p>
                        <p className="text-xs text-gray-600 mt-1">
                          Track and mitigate operational and security risks • Just now
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Requirements View */}
            {state.ui.viewMode === 'requirements' && (
              <RequirementsTable
                requirements={requirements}
                filteredRequirements={filteredRequirements}
                capabilities={capabilities}
                filters={state.filters}
                searchTerm={state.searchTerm}
                columnVisibility={state.columnVisibility}
                onFilterChange={handleFilterChange}
                onSearchChange={(searchTerm) => dispatch({ type: 'SET_SEARCH_TERM', searchTerm })}
                onClearFilters={() => dispatch({ type: 'CLEAR_FILTERS' })}
                onClearSearch={() => dispatch({ type: 'CLEAR_SEARCH' })}
                onToggleColumnVisibility={(column) => dispatch({ type: 'TOGGLE_COLUMN_VISIBILITY', column })}
                onViewRequirement={handleViewRequirement}
                onEditRequirement={handleEditRequirement}
                onExportCSV={handleExportCSV}
                onImportCSV={() => dispatch({ type: 'TOGGLE_UPLOAD_MODAL' })}
              />
            )}

            {/* Analytics View */}
            {state.ui.viewMode === 'analytics' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <InteractiveChart 
                    title="Requirement Status Overview" 
                    fullscreenId="analytics-status-chart"
                    onToggleFullscreen={(id) => dispatch({ type: 'SET_CHART_FULLSCREEN', chartId: id })}
                  >
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={analyticsData.statusData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="status" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </InteractiveChart>
                  
                  <InteractiveChart 
                    title="Business Value Distribution" 
                    fullscreenId="analytics-value-chart"
                    onToggleFullscreen={(id) => dispatch({ type: 'SET_CHART_FULLSCREEN', chartId: id })}
                  >
                    <ResponsiveContainer width="100%" height={300}>
                      <ScatterChart data={analyticsData.businessValueData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="cost" name="Cost (£k)" />
                        <YAxis dataKey="businessValue" name="Business Value" />
                        <Tooltip 
                          formatter={(value, name) => [
                            name === 'cost' ? `£${value}k` : value,
                            name === 'cost' ? 'Cost' : 'Business Value'
                          ]}
                        />
                        <Scatter dataKey="businessValue" fill="#10b981" />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </InteractiveChart>
                </div>
              </div>
            )}

            {/* PCD Breakdown View */}
            {state.ui.viewMode === 'pcd' && (
              <PCDBreakdownView
                pcdData={pcdData}
                capabilities={capabilities}
                selectedPCD={state.ui.selectedPCD}
                onSelectPCD={(pcdId) => dispatch({ type: 'SET_SELECTED_PCD', pcdId })}
              />
            )}

            {/* Business Value/Justification View */}
            {state.ui.viewMode === 'justification' && (
              <BusinessValueView
                requirements={requirements}
                onViewRequirement={handleViewRequirement}
              />
            )}

            {/* Maturity Analysis View */}
            {state.ui.viewMode === 'maturity' && (
              <MaturityAnalysisView
                requirements={requirements}
                onViewRequirement={handleViewRequirement}
              />
            )}

            {/* Capabilities View */}
            {state.ui.viewMode === 'capabilities' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6">
                    <div className="mb-4 lg:mb-0">
                      <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                        <Network className="h-6 w-6 mr-3 text-blue-600" />
                        Security Capabilities
                      </h3>
                      <p className="text-gray-600 mt-1">Manage capabilities and their associated requirements and PCDs</p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                      <div className="text-sm text-gray-500">
                        {capabilities.length} capabilities • {requirements.length} total requirements
                      </div>
                      <button
                        onClick={() => dispatch({ type: 'TOGGLE_NEW_CAPABILITY_MODAL' })}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        New Capability
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {capabilities.map((capability) => {
                      const capabilityRequirements = requirements.filter(req => req.capabilityId === capability.id);
                      const totalRequirements = capabilityRequirements.length;
                      const completedRequirements = capabilityRequirements.filter(req => req.status === 'Completed').length;
                      const completionRate = totalRequirements > 0 ? (completedRequirements / totalRequirements) * 100 : 0;
                      
                      return (
                        <div 
                          key={capability.id} 
                          className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-blue-300 transition-all duration-300 cursor-pointer group"
                          onClick={() => handleSelectCapability(capability.id)}
                        >
                          {/* Header */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center mb-2">
                                <h4 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                                  {capability.name}
                                </h4>
                                <ArrowRight className="h-4 w-4 ml-2 text-gray-400 group-hover:text-blue-600 transition-colors flex-shrink-0" />
                              </div>
                              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                {capability.id}
                              </span>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                              capability.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                              capability.status === 'Completed' ? 'bg-green-100 text-green-800' :
                              capability.status === 'Planning' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {capability.status}
                            </div>
                          </div>

                          {/* Description */}
                          <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                            {capability.description}
                          </p>

                          {/* Progress */}
                          <div className="mb-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-700">Progress</span>
                              <span className="text-sm font-bold text-gray-900">{completionRate.toFixed(0)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                              <div 
                                className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500" 
                                style={{ width: `${completionRate}%` }}
                              />
                            </div>
                            <div className="flex justify-between text-xs text-gray-500">
                              <span>{completedRequirements} completed</span>
                              <span>{totalRequirements} total</span>
                            </div>
                          </div>

                          {/* Key Metrics */}
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <div className="flex items-center mb-1">
                                <Star className="h-3 w-3 text-yellow-500 mr-1" />
                                <span className="text-gray-600 text-xs">Business Value</span>
                              </div>
                              <span className="font-semibold text-gray-900">{capability.businessValue}/5.0</span>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <div className="flex items-center mb-1">
                                <DollarSign className="h-3 w-3 text-green-500 mr-1" />
                                <span className="text-gray-600 text-xs">Est. ROI</span>
                              </div>
                              <span className="font-semibold text-gray-900">{capability.estimatedROI}%</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
        
        {/* Company Profile Modal */}
        <Modal
          isOpen={state.ui.showCompanyProfileModal}
          onClose={() => dispatch({ type: 'TOGGLE_COMPANY_PROFILE_MODAL' })}
          title="Company Profile"
          size="xl"
        >
          <CompanyProfileSystem 
            onProfileUpdate={handleProfileUpdate}
            existingProfile={companyProfile}
            embedded={true}
          />
        </Modal>

        {/* Threat Settings Modal */}
        <Modal
          isOpen={state.ui.showThreatSettingsModal}
          onClose={() => dispatch({ type: 'TOGGLE_THREAT_SETTINGS_MODAL' })}
          title="Threat Management Settings"
          size="full"
          closeOnBackdropClick={false}
        >
          <ThreatSettings
            onClose={() => dispatch({ type: 'TOGGLE_THREAT_SETTINGS_MODAL' })}
            onSave={handleThreatSettingsSave}
            existingCompanyProfile={companyProfile}
            currentSettings={(() => {
              try {
                const saved = localStorage.getItem('threatSettings');
                return saved ? JSON.parse(saved) : {};
              } catch {
                return {};
              }
            })()}
          />
        </Modal>

        {/* Edit/View Requirement Modal */}
        <Modal
          isOpen={state.modal.isOpen && !!state.modal.selectedRequirement}
          onClose={() => dispatch({ type: 'CLOSE_MODAL' })}
          title={state.modal.editMode ? 'Edit Requirement' : 'View Requirement'}
          size={state.modal.editMode ? "xl" : "lg"}
          closeOnBackdropClick={!state.modal.editMode}
        >
          {state.modal.selectedRequirement && (
            state.modal.editMode ? (
              <EditRequirementModal 
                requirement={state.modal.selectedRequirement} 
                onClose={() => dispatch({ type: 'CLOSE_MODAL' })}
                onSave={handleUpdateRequirement}
              />
            ) : (
              <ViewRequirementModal
                requirement={state.modal.selectedRequirement}
                onClose={() => dispatch({ type: 'CLOSE_MODAL' })}
                onEdit={(requirement) => dispatch({ type: 'OPEN_MODAL', requirement, editMode: true })}
              />
            )
          )}
        </Modal>

        {/* New Capability Modal */}
        <Modal
          isOpen={state.ui.showNewCapabilityModal}
          onClose={() => dispatch({ type: 'TOGGLE_NEW_CAPABILITY_MODAL' })}
          title="Create New Capability"
          size="md"
        >
          <NewCapabilityModal 
            onClose={() => dispatch({ type: 'TOGGLE_NEW_CAPABILITY_MODAL' })}
            onSave={handleCreateCapability}
          />
        </Modal>

        {/* CSV Upload Modal */}
        <Modal
          isOpen={state.ui.showUploadModal}
          onClose={() => dispatch({ type: 'TOGGLE_UPLOAD_MODAL' })}
          title="Upload CSV Data"
          size="md"
        >
          <CSVUploadModal 
            onClose={() => dispatch({ type: 'TOGGLE_UPLOAD_MODAL' })}
            onUpload={handleUploadCSV}
          />
        </Modal>

        {/* Purge Confirmation Modal */}
        <Modal
          isOpen={state.ui.showPurgeModal}
          onClose={() => dispatch({ type: 'TOGGLE_PURGE_MODAL' })}
          title="Confirm Data Purge"
          size="sm"
          closeOnBackdropClick={false}
        >
          <PurgeConfirmationModal 
            onClose={() => dispatch({ type: 'TOGGLE_PURGE_MODAL' })}
            onConfirm={handlePurgeData}
          />
        </Modal>
      </div>
    </ErrorBoundary>
  );
};

export default RequirementsDashboard;