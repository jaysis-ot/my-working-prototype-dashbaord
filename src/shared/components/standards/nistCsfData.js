// src/components/standards/nistCsfData.js

/**
 * NIST Cybersecurity Framework 2.0 Complete Data Structure
 * 
 * Contains all 106 subcategories organized by function and category.
 * This is the authoritative source for NIST CSF 2.0 structure.
 */

export const NIST_CSF_STRUCTURE = {
  GV: {
    name: "Govern",
    description: "The organization's cybersecurity risk management strategy, expectations, and policy are established, communicated, and monitored.",
    categories: {
      "GV.OC": {
        name: "Organizational Context",
        description: "The circumstances that influence the organization's cybersecurity risk management decisions are understood.",
        subcategories: {
          "GV.OC-01": {
            name: "Organizational mission, objectives, and activities are understood and communicated",
            description: "The organization has established and communicates its mission, objectives, and activities to all relevant stakeholders."
          },
          "GV.OC-02": {
            name: "Internal and external stakeholders are understood",
            description: "The organization identifies and understands the needs and expectations of internal and external stakeholders."
          },
          "GV.OC-03": {
            name: "Legal, regulatory, and contractual requirements regarding cybersecurity are understood",
            description: "The organization understands and documents applicable legal, regulatory, and contractual requirements related to cybersecurity."
          },
          "GV.OC-04": {
            name: "Critical objectives, capabilities, and services that external stakeholders depend on are understood",
            description: "The organization identifies critical capabilities and services that external stakeholders rely upon."
          },
          "GV.OC-05": {
            name: "Outcomes, capabilities, and services that the organization depends on are understood",
            description: "The organization understands what external capabilities and services it depends upon for operations."
          }
        }
      },
      "GV.RM": {
        name: "Risk Management Strategy",
        description: "The organization's priorities, constraints, risk tolerance and assumptions are established and used to support risk decisions.",
        subcategories: {
          "GV.RM-01": {
            name: "Risk management objectives are established and agreed to by organizational stakeholders",
            description: "The organization establishes clear risk management objectives that align with business objectives."
          },
          "GV.RM-02": {
            name: "Risk appetite and risk tolerance statements are established, communicated, and maintained",
            description: "The organization defines and communicates its appetite for risk and tolerance levels."
          },
          "GV.RM-03": {
            name: "Cybersecurity risk management activities and outcomes are included in enterprise risk reporting",
            description: "Cybersecurity risks are integrated into the organization's overall enterprise risk management program."
          },
          "GV.RM-04": {
            name: "Strategic direction that describes appropriate risk response is established and communicated",
            description: "The organization provides clear guidance on how to respond to different types and levels of risk."
          },
          "GV.RM-05": {
            name: "Lines of communication across the organization are established for cybersecurity risks",
            description: "Clear communication channels exist for reporting and managing cybersecurity risks."
          },
          "GV.RM-06": {
            name: "A standardized method for calculating, documenting, categorizing, and prioritizing cybersecurity risks is established",
            description: "The organization uses consistent methods for risk assessment and prioritization."
          },
          "GV.RM-07": {
            name: "Strategic opportunities are investigated and communicated",
            description: "The organization identifies and communicates strategic opportunities related to cybersecurity investments."
          }
        }
      },
      "GV.RR": {
        name: "Roles, Responsibilities, and Authorities",
        description: "Cybersecurity roles, responsibilities, and authorities to foster accountability, performance assessment, and continuous improvement are established and communicated.",
        subcategories: {
          "GV.RR-01": {
            name: "Organizational leadership is responsible and accountable for cybersecurity risk and fosters a culture of cybersecurity",
            description: "Senior leadership takes ownership of cybersecurity risks and promotes a security-conscious culture."
          },
          "GV.RR-02": {
            name: "Roles, responsibilities, and authorities related to cybersecurity risk management are established, communicated, understood, and enforced",
            description: "Clear cybersecurity roles and responsibilities are defined and understood throughout the organization."
          },
          "GV.RR-03": {
            name: "Adequate resources are allocated commensurate with the cybersecurity risk strategy, roles, responsibilities, and policies",
            description: "Sufficient resources are provided to support cybersecurity activities and responsibilities."
          },
          "GV.RR-04": {
            name: "Cybersecurity is included in human resources practices",
            description: "Cybersecurity considerations are integrated into hiring, training, and performance management practices."
          }
        }
      },
      "GV.PO": {
        name: "Policy",
        description: "Organizational cybersecurity policy is established, communicated, and enforced.",
        subcategories: {
          "GV.PO-01": {
            name: "Policy for managing cybersecurity risks is established and communicated",
            description: "The organization has established and communicated a comprehensive cybersecurity policy."
          },
          "GV.PO-02": {
            name: "Policy is reviewed, updated, approved, and communicated",
            description: "Cybersecurity policies are regularly reviewed, updated, and formally approved."
          }
        }
      },
      "GV.OV": {
        name: "Oversight",
        description: "Results of organization cybersecurity risk management activities and performance are used to inform, improve, and adjust the risk management strategy.",
        subcategories: {
          "GV.OV-01": {
            name: "Cybersecurity risk management strategy outcomes are reviewed to inform and adjust strategy and direction",
            description: "The organization regularly reviews and adjusts its cybersecurity strategy based on outcomes and lessons learned."
          },
          "GV.OV-02": {
            name: "The cybersecurity risk management strategy is reviewed and adjusted to ensure coverage of organizational requirements and risks",
            description: "Regular reviews ensure the cybersecurity strategy remains comprehensive and current."
          },
          "GV.OV-03": {
            name: "Organizational cybersecurity risk management performance is evaluated and reviewed",
            description: "The organization measures and evaluates the effectiveness of its cybersecurity risk management activities."
          }
        }
      },
      "GV.SC": {
        name: "Supply Chain Risk Management",
        description: "Cyber supply chain risk management processes are identified, established, managed, monitored, and improved by organizational stakeholders.",
        subcategories: {
          "GV.SC-01": {
            name: "A cybersecurity supply chain risk management program, strategy, objectives, policies, and processes are established",
            description: "The organization has a comprehensive program for managing cybersecurity risks in its supply chain."
          },
          "GV.SC-02": {
            name: "Suppliers are known and prioritized by criticality",
            description: "The organization maintains an inventory of suppliers and prioritizes them based on their criticality to operations."
          },
          "GV.SC-03": {
            name: "Contracts with suppliers are used to implement appropriate measures designed to meet the objectives of an organization's cybersecurity supply chain risk management plan",
            description: "Contractual agreements include appropriate cybersecurity requirements and controls."
          },
          "GV.SC-04": {
            name: "Suppliers are routinely assessed using audits, test results, or other forms of evaluations to confirm they are meeting their contractual obligations",
            description: "Regular assessments verify that suppliers are meeting cybersecurity requirements."
          },
          "GV.SC-05": {
            name: "Response and recovery planning and testing are conducted with suppliers",
            description: "The organization coordinates incident response and recovery activities with key suppliers."
          },
          "GV.SC-06": {
            name: "Supply chain cybersecurity is included in planning activities",
            description: "Supply chain cybersecurity considerations are integrated into organizational planning processes."
          }
        }
      }
    }
  },
  
  ID: {
    name: "Identify",
    description: "The organization's current cybersecurity risks are understood.",
    categories: {
      "ID.AM": {
        name: "Asset Management",
        description: "Assets (e.g., data, hardware, software, systems, facilities, services, people) that enable the organization to achieve business purposes are identified and managed consistent with their relative importance to organizational objectives and the organization's risk strategy.",
        subcategories: {
          "ID.AM-01": {
            name: "Inventories of hardware managed by the organization are maintained",
            description: "The organization maintains current inventories of all hardware assets under its control."
          },
          "ID.AM-02": {
            name: "Inventories of software, services, and systems managed by the organization are maintained",
            description: "The organization maintains current inventories of software, services, and systems."
          },
          "ID.AM-03": {
            name: "Representations of the organization's authorized network communication and internal network flows are maintained",
            description: "Network diagrams and communication flows are documented and kept current."
          },
          "ID.AM-04": {
            name: "Services that the organization depends on are inventoried",
            description: "External services and dependencies are catalogued and maintained."
          },
          "ID.AM-05": {
            name: "Assets are prioritized based on classification, criticality, business functions, and value",
            description: "Assets are classified and prioritized according to their importance to business operations."
          },
          "ID.AM-06": {
            name: "Roles and responsibilities for inventory and asset management are established",
            description: "Clear roles and responsibilities are defined for managing asset inventories."
          },
          "ID.AM-07": {
            name: "Inventories include assets based on their potential cybersecurity and privacy risks to organizational operations",
            description: "Asset inventories consider cybersecurity and privacy risk implications."
          },
          "ID.AM-08": {
            name: "Systems, hardware, software, services, and applications are managed throughout their life cycles",
            description: "Asset lifecycle management processes are implemented from acquisition to disposal."
          }
        }
      },
      "ID.RA": {
        name: "Risk Assessment",
        description: "The organization understands cybersecurity risk to organizational operations (including mission, functions, image, or reputation), organizational assets, and individuals.",
        subcategories: {
          "ID.RA-01": {
            name: "Vulnerabilities in assets are identified, validated, and recorded",
            description: "The organization has processes to identify, validate, and document vulnerabilities in its assets."
          },
          "ID.RA-02": {
            name: "Cyber threat intelligence is received from information sharing forums and sources",
            description: "The organization participates in threat intelligence sharing and receives relevant threat information."
          },
          "ID.RA-03": {
            name: "Internal and external threats to the organization are identified and recorded",
            description: "Both internal and external threat sources are identified and documented."
          },
          "ID.RA-04": {
            name: "Potential impacts and likelihoods of threats exploiting vulnerabilities are identified and recorded",
            description: "Risk assessments consider both the likelihood and potential impact of threats."
          },
          "ID.RA-05": {
            name: "Threats, vulnerabilities, likelihoods, and impacts are used to understand inherent risk and inform risk response prioritization",
            description: "Risk information is analyzed to understand inherent risk levels and prioritize responses."
          },
          "ID.RA-06": {
            name: "Risk responses are chosen, prioritized, planned, tracked, and communicated",
            description: "Risk treatment decisions are made systematically and communicated to stakeholders."
          },
          "ID.RA-07": {
            name: "Changes and exceptions are managed, assessed for risk impact, and communicated",
            description: "Changes to systems and processes are assessed for risk impact before implementation."
          },
          "ID.RA-08": {
            name: "Processes for receiving, analyzing, and responding to vulnerability disclosures are established",
            description: "Formal processes exist for handling vulnerability disclosures from external sources."
          },
          "ID.RA-09": {
            name: "The authenticity and integrity of hardware and software are assessed prior to acquisition and use",
            description: "Hardware and software are verified for authenticity and integrity before deployment."
          },
          "ID.RA-10": {
            name: "Critical suppliers are assessed prior to acquisition and during use",
            description: "Supplier risk assessments are conducted before engagement and periodically during relationships."
          }
        }
      },
      "ID.IM": {
        name: "Improvement",
        description: "The organization's risk management processes are improved through lessons learned and predictive indicators.",
        subcategories: {
          "ID.IM-01": {
            name: "Improvements to organizational cybersecurity risk management processes are identified from internal and external sources",
            description: "The organization identifies opportunities to improve its cybersecurity risk management from various sources."
          },
          "ID.IM-02": {
            name: "Improvements to organizational cybersecurity risk management processes are prioritized and implemented",
            description: "Identified improvements are prioritized based on risk and business value, then implemented systematically."
          },
          "ID.IM-03": {
            name: "Changes to organizational cybersecurity risk management processes are communicated to relevant stakeholders",
            description: "Process changes are effectively communicated to all relevant stakeholders."
          },
          "ID.IM-04": {
            name: "Organizational cybersecurity risk management processes and supporting activities are periodically reviewed and improved",
            description: "Regular reviews of risk management processes lead to continuous improvement activities."
          }
        }
      }
    }
  },
  
  PR: {
    name: "Protect",
    description: "Safeguards to manage the organization's cybersecurity risks are used.",
    categories: {
      "PR.AA": {
        name: "Identity Management, Authentication and Access Control",
        description: "Access to physical and logical assets is limited to authorized users, services, and hardware.",
        subcategories: {
          "PR.AA-01": {
            name: "Identities and credentials for authorized users, services, and hardware are managed by the organization",
            description: "The organization has processes to manage digital identities and credentials for all authorized entities."
          },
          "PR.AA-02": {
            name: "Identities are proofed and bound to credentials based on the context of interactions",
            description: "Identity verification and credential binding are appropriate for the sensitivity of interactions."
          },
          "PR.AA-03": {
            name: "Users, services, and hardware are authenticated",
            description: "Authentication mechanisms verify the identity of users, services, and hardware before granting access."
          },
          "PR.AA-04": {
            name: "Identity assertions are protected, conveyed, and verified",
            description: "Identity claims are securely transmitted and validated throughout the system."
          },
          "PR.AA-05": {
            name: "Access permissions, entitlements, and authorizations are defined in a policy, managed, enforced, and reviewed",
            description: "Access controls are formally defined, implemented, and regularly reviewed."
          },
          "PR.AA-06": {
            name: "Physical access to assets is managed, monitored, and enforced",
            description: "Physical access controls protect assets from unauthorized physical access."
          }
        }
      },
      "PR.AT": {
        name: "Awareness and Training",
        description: "The organization's personnel are provided cybersecurity awareness education and are trained to perform their cybersecurity-related duties and responsibilities.",
        subcategories: {
          "PR.AT-01": {
            name: "Personnel are provided with cybersecurity awareness education",
            description: "All personnel receive appropriate cybersecurity awareness training relevant to their roles."
          },
          "PR.AT-02": {
            name: "Individuals in specialized roles are provided with role-based training",
            description: "Personnel with specific cybersecurity responsibilities receive targeted, role-based training."
          }
        }
      },
      "PR.DS": {
        name: "Data Security",
        description: "Data is managed consistent with the organization's risk strategy to protect the confidentiality, integrity, and availability of information.",
        subcategories: {
          "PR.DS-01": {
            name: "The confidentiality, integrity, and availability of data-in-transit are protected",
            description: "Data protection controls safeguard information while it is being transmitted."
          },
          "PR.DS-02": {
            name: "The confidentiality, integrity, and availability of data-at-rest are protected",
            description: "Data protection controls safeguard information while it is stored."
          },
          "PR.DS-03": {
            name: "The confidentiality, integrity, and availability of data-in-use are protected",
            description: "Data protection controls safeguard information while it is being processed."
          },
          "PR.DS-04": {
            name: "Availability of critical data and associated systems is ensured",
            description: "Critical data and systems have appropriate availability controls and backup procedures."
          },
          "PR.DS-05": {
            name: "Data is disposed of in accordance with recorded retention requirements and organizational policies",
            description: "Data disposal follows established retention policies and secure destruction procedures."
          },
          "PR.DS-06": {
            name: "Integrity checking mechanisms are used to verify hardware integrity",
            description: "Hardware integrity is monitored and verified through appropriate mechanisms."
          },
          "PR.DS-07": {
            name: "Integrity checking mechanisms are used to verify software integrity",
            description: "Software integrity is monitored and verified through appropriate mechanisms."
          },
          "PR.DS-08": {
            name: "Hardware and software integrity failures are responded to appropriately",
            description: "Procedures exist to respond to detected integrity failures in hardware and software."
          },
          "PR.DS-09": {
            name: "Hardware and software are authenticated prior to installation and execution",
            description: "Hardware and software authenticity is verified before deployment and execution."
          },
          "PR.DS-10": {
            name: "Configuration management of organizational assets is performed throughout the asset lifecycle",
            description: "Asset configurations are managed consistently from deployment through disposal."
          },
          "PR.DS-11": {
            name: "Data and associated metadata are managed based on organizational requirements",
            description: "Data management practices align with organizational policies and regulatory requirements."
          }
        }
      },
      "PR.IR": {
        name: "Infrastructure Resilience",
        description: "Resilience requirements to support delivery of critical infrastructure services are established for normal and adverse situations.",
        subcategories: {
          "PR.IR-01": {
            name: "Networks and environments are protected from unauthorized logical access",
            description: "Network security controls prevent unauthorized logical access to systems and environments."
          },
          "PR.IR-02": {
            name: "The organization's technology assets are protected from environmental threats",
            description: "Physical and environmental controls protect technology assets from natural and man-made threats."
          },
          "PR.IR-03": {
            name: "Mechanisms are implemented to achieve resilience requirements in normal and adverse situations",
            description: "Resilience mechanisms ensure continued operations during normal and adverse conditions."
          },
          "PR.IR-04": {
            name: "Adequate resource provisioning is included in requirements",
            description: "Resource planning ensures adequate capacity for normal and peak operations."
          }
        }
      },
      "PR.MA": {
        name: "Maintenance",
        description: "Maintenance and repairs of organizational assets are performed and logged with approved and controlled tools.",
        subcategories: {
          "PR.MA-01": {
            name: "Maintenance activities are conducted by authorized personnel using approved and controlled tools",
            description: "Only authorized personnel perform maintenance using approved tools and procedures."
          },
          "PR.MA-02": {
            name: "Maintenance activities are approved, logged, and performed in a manner that prevents unauthorized access",
            description: "Maintenance activities are properly authorized, documented, and controlled to prevent security breaches."
          }
        }
      },
      "PR.PT": {
        name: "Protective Technology",
        description: "Technical security solutions are managed to ensure the security and resilience of systems and assets, consistent with related controls, configurations, and organizational policies.",
        subcategories: {
          "PR.PT-01": {
            name: "System and asset configurations are managed, monitored, and maintained",
            description: "Configuration management ensures systems and assets maintain secure configurations."
          },
          "PR.PT-02": {
            name: "Protective capabilities are managed and maintained",
            description: "Security controls and protective technologies are actively managed and maintained."
          },
          "PR.PT-03": {
            name: "The integrity of software is protected",
            description: "Software integrity protection mechanisms prevent unauthorized modification."
          },
          "PR.PT-04": {
            name: "Systems and assets are isolated and operated in secure configurations",
            description: "System isolation and secure configuration practices limit attack surfaces."
          },
          "PR.PT-05": {
            name: "Mechanisms are implemented to protect against or limit the effects of cybersecurity events",
            description: "Protective mechanisms reduce the likelihood and impact of cybersecurity incidents."
          }
        }
      }
    }
  },
  
  DE: {
    name: "Detect",
    description: "Possible cybersecurity attacks and compromises are found and analyzed.",
    categories: {
      "DE.CM": {
        name: "Continuous Monitoring",
        description: "Assets and network traffic are monitored to identify cybersecurity events and verify the effectiveness of protective measures.",
        subcategories: {
          "DE.CM-01": {
            name: "Networks and network traffic are monitored to find potentially malicious activity",
            description: "Network monitoring systems detect potentially malicious or unauthorized network activity."
          },
          "DE.CM-02": {
            name: "The physical environment is monitored to find potentially malicious activity",
            description: "Physical security monitoring detects unauthorized physical access or suspicious activity."
          },
          "DE.CM-03": {
            name: "Personnel activity and technology usage are monitored to find potentially malicious activity",
            description: "User activity monitoring detects potentially malicious or unauthorized behavior."
          },
          "DE.CM-04": {
            name: "Malicious code is detected",
            description: "Anti-malware and other detection systems identify malicious code and software."
          },
          "DE.CM-05": {
            name: "Unauthorized mobile code is detected",
            description: "Mobile code execution is monitored and unauthorized mobile code is detected."
          },
          "DE.CM-06": {
            name: "External service provider activities are monitored to detect potential cybersecurity events",
            description: "Third-party service provider activities are monitored for potential security issues."
          },
          "DE.CM-07": {
            name: "Monitoring for unauthorized personnel, connections, devices, and software is performed",
            description: "Comprehensive monitoring detects unauthorized entities and components."
          },
          "DE.CM-08": {
            name: "Vulnerability scans are performed",
            description: "Regular vulnerability scans identify potential security weaknesses."
          },
          "DE.CM-09": {
            name: "Computing hardware and software, runtime environments, and their associated configurations are monitored to find potentially malicious activity",
            description: "System and software monitoring detects potentially malicious activities and changes."
          }
        }
      },
      "DE.AE": {
        name: "Adverse Event Analysis",
        description: "Anomalous activity is analyzed to characterize the activity and confirm whether it constitutes a cybersecurity event.",
        subcategories: {
          "DE.AE-01": {
            name: "Potentially malicious activity is analyzed to determine whether it constitutes a cybersecurity event",
            description: "Suspected malicious activity is investigated to determine if it represents a genuine security event."
          },
          "DE.AE-02": {
            name: "Potentially malicious activity is analyzed to understand attack targets and methods",
            description: "Analysis of malicious activity provides insights into attacker tactics, techniques, and procedures."
          },
          "DE.AE-03": {
            name: "Information is correlated from multiple sources",
            description: "Security information from multiple sources is correlated to provide comprehensive threat analysis."
          },
          "DE.AE-04": {
            name: "The estimated impact and scope of cybersecurity events are understood",
            description: "Impact assessment determines the scope and potential consequences of cybersecurity events."
          },
          "DE.AE-05": {
            name: "Incident alert thresholds are established",
            description: "Clear thresholds and criteria are established for escalating events to incidents."
          },
          "DE.AE-06": {
            name: "Cybersecurity event information is provided to designated personnel",
            description: "Relevant personnel receive timely and accurate information about cybersecurity events."
          },
          "DE.AE-07": {
            name: "Cybersecurity event information is shared with appropriate external entities",
            description: "Cybersecurity event information is shared with relevant external partners when appropriate."
          },
          "DE.AE-08": {
            name: "An incident's magnitude is estimated and validated",
            description: "Incident severity and magnitude are assessed and validated through established processes."
          }
        }
      }
    }
  },
  
  RS: {
    name: "Respond",
    description: "Actions regarding a detected cybersecurity incident are taken.",
    categories: {
      "RS.MA": {
        name: "Incident Management",
        description: "Responses to detected cybersecurity incidents are managed.",
        subcategories: {
          "RS.MA-01": {
            name: "The incident response plan is executed in coordination with relevant third parties once an incident is declared",
            description: "Incident response procedures are activated and coordinated with external parties when incidents are declared."
          },
          "RS.MA-02": {
            name: "Incident reports are triaged and validated",
            description: "Incident reports undergo triage and validation processes to ensure appropriate response."
          },
          "RS.MA-03": {
            name: "Incidents are categorized and prioritized",
            description: "Incidents are classified and prioritized based on severity, impact, and organizational criteria."
          },
          "RS.MA-04": {
            name: "Incidents are escalated or elevated as needed",
            description: "Incident escalation procedures ensure appropriate management attention and resources."
          },
          "RS.MA-05": {
            name: "The criteria for initiating incident recovery are applied",
            description: "Clear criteria guide the transition from incident response to recovery activities."
          }
        }
      },
      "RS.AN": {
        name: "Incident Analysis",
        description: "Investigations of cybersecurity incidents are conducted.",
        subcategories: {
          "RS.AN-01": {
            name: "Investigations include a full analysis of the incident",
            description: "Comprehensive incident analysis examines all aspects of the incident including root cause."
          },
          "RS.AN-02": {
            name: "The full timeline of the incident is determined",
            description: "Incident timelines are reconstructed to understand the sequence of events and attack progression."
          },
          "RS.AN-03": {
            name: "Incidents are analyzed to understand attack targets and methods",
            description: "Incident analysis provides insights into attacker objectives, tactics, and techniques."
          },
          "RS.AN-04": {
            name: "Incidents are analyzed to understand business or mission impact",
            description: "Business impact analysis determines the operational and strategic consequences of incidents."
          },
          "RS.AN-05": {
            name: "Incidents are analyzed to understand vulnerabilities and associated risks",
            description: "Incident analysis identifies exploited vulnerabilities and associated risk factors."
          }
        }
      },
      "RS.MI": {
        name: "Incident Mitigation",
        description: "Activities are performed to prevent expansion of an incident and mitigate its effects.",
        subcategories: {
          "RS.MI-01": {
            name: "Incidents are contained",
            description: "Containment procedures prevent incidents from spreading or causing additional damage."
          },
          "RS.MI-02": {
            name: "Incidents are eradicated",
            description: "Eradication procedures remove the cause of incidents and eliminate malicious artifacts."
          },
          "RS.MI-03": {
            name: "Newly identified vulnerabilities are mitigated or documented as accepted risks",
            description: "Vulnerabilities discovered during incident response are addressed or formally accepted."
          }
        }
      },
      "RS.RP": {
        name: "Incident Reporting",
        description: "Response activities are coordinated with internal and external stakeholders as required by law, regulation, or policy.",
        subcategories: {
          "RS.RP-01": {
            name: "Stakeholders are notified of incidents in accordance with established criteria",
            description: "Incident notification procedures ensure appropriate stakeholders are informed according to established criteria."
          },
          "RS.RP-02": {
            name: "Reports are made to regulatory bodies and law enforcement, as appropriate",
            description: "Required incident reports are submitted to relevant regulatory and law enforcement authorities."
          },
          "RS.RP-03": {
            name: "Information is shared with designated information sharing organizations",
            description: "Incident information is shared with appropriate threat intelligence and information sharing partners."
          }
        }
      }
    }
  },
  
  RC: {
    name: "Recover",
    description: "Assets and operations affected by a cybersecurity incident are restored.",
    categories: {
      "RC.RP": {
        name: "Recovery Planning",
        description: "Recovery activities are planned and performed to maintain plans for resilience and to restore capabilities or services that were impaired due to a cybersecurity incident.",
        subcategories: {
          "RC.RP-01": {
            name: "Recovery objectives, priorities, and metrics are established",
            description: "Clear recovery objectives, priorities, and success metrics are defined for incident recovery."
          },
          "RC.RP-02": {
            name: "Recovery activities are planned and performed in coordination with relevant third parties",
            description: "Recovery planning includes coordination with external partners and service providers."
          },
          "RC.RP-03": {
            name: "Recovery activities are communicated to designated internal and external entities",
            description: "Recovery status and activities are communicated to relevant stakeholders throughout the process."
          }
        }
      },
      "RC.IM": {
        name: "Recovery Implementation",
        description: "Recovery activities are performed to restore systems, services, and capabilities affected by cybersecurity incidents.",
        subcategories: {
          "RC.IM-01": {
            name: "Recovery activities are performed in accordance with established recovery objectives",
            description: "Recovery activities follow established procedures and meet defined recovery objectives."
          },
          "RC.IM-02": {
            name: "Recovery activities are performed from a known clean state",
            description: "Recovery begins from verified clean system states to prevent reinfection or compromise."
          }
        }
      },
      "RC.CO": {
        name: "Recovery Communications",
        description: "Recovery activities are coordinated with internal and external parties, such as coordinating centers, Internet Service Providers, owners of attacking systems, victims, other CSIRTs, and vendors.",
        subcategories: {
          "RC.CO-01": {
            name: "Stakeholders are informed of recovery activities",
            description: "Recovery communications keep stakeholders informed of progress and status."
          },
          "RC.CO-02": {
            name: "Recovery activities are communicated to affected external stakeholders",
            description: "External stakeholders affected by the incident are kept informed of recovery progress."
          },
          "RC.CO-03": {
            name: "Recovery activities and lessons learned are communicated to designated shareholders",
            description: "Recovery outcomes and lessons learned are shared with appropriate organizational stakeholders."
          }
        }
      }
    }
  }
};

// Scoring Templates for each subcategory
export const SCORING_TEMPLATE = {
  maturity: 0,
  implementation: 0,
  evidence: 0,
  testing: 0,
  notes: '',
  evidenceLinks: [],
  lastUpdated: null,
  assessor: null
};

// Helper functions for NIST CSF data manipulation
export const getAllSubcategories = () => {
  const subcategories = [];
  Object.entries(NIST_CSF_STRUCTURE).forEach(([functionKey, functionData]) => {
    Object.entries(functionData.categories).forEach(([categoryKey, categoryData]) => {
      Object.entries(categoryData.subcategories).forEach(([subKey, subData]) => {
        subcategories.push({
          id: subKey,
          functionId: functionKey,
          functionName: functionData.name,
          categoryId: categoryKey,
          categoryName: categoryData.name,
          name: subData.name,
          description: subData.description
        });
      });
    });
  });
  return subcategories;
};

export const getSubcategoryCount = () => {
  return getAllSubcategories().length;
};

export const getSubcategoriesByFunction = (functionId) => {
  const functionData = NIST_CSF_STRUCTURE[functionId];
  if (!functionData) return [];
  
  const subcategories = [];
  Object.entries(functionData.categories).forEach(([categoryKey, categoryData]) => {
    Object.entries(categoryData.subcategories).forEach(([subKey, subData]) => {
      subcategories.push({
        id: subKey,
        categoryId: categoryKey,
        categoryName: categoryData.name,
        name: subData.name,
        description: subData.description
      });
    });
  });
  return subcategories;
};

export const getSubcategoriesByCategory = (functionId, categoryId) => {
  const categoryData = NIST_CSF_STRUCTURE[functionId]?.categories[categoryId];
  if (!categoryData) return [];
  
  return Object.entries(categoryData.subcategories).map(([subKey, subData]) => ({
    id: subKey,
    name: subData.name,
    description: subData.description
  }));
};

export const searchSubcategories = (searchTerm) => {
  const allSubs = getAllSubcategories();
  const term = searchTerm.toLowerCase();
  
  return allSubs.filter(sub => 
    sub.id.toLowerCase().includes(term) ||
    sub.name.toLowerCase().includes(term) ||
    sub.description.toLowerCase().includes(term) ||
    sub.functionName.toLowerCase().includes(term) ||
    sub.categoryName.toLowerCase().includes(term)
  );
};

// Calculate completion rates and scores
export const calculateFunctionCompletion = (assessmentData, functionId) => {
  const subcategories = getSubcategoriesByFunction(functionId);
  if (subcategories.length === 0) return { completion: 0, averageScore: 0 };
  
  let completedCount = 0;
  let totalScore = 0;
  
  subcategories.forEach(sub => {
    const assessment = assessmentData[sub.id];
    if (assessment) {
      const hasAnyScore = assessment.maturity > 0 || assessment.implementation > 0 || 
                         assessment.evidence > 0 || assessment.testing > 0;
      if (hasAnyScore) {
        completedCount++;
        totalScore += (assessment.maturity + assessment.implementation + 
                      assessment.evidence + assessment.testing) / 4;
      }
    }
  });
  
  return {
    completion: (completedCount / subcategories.length) * 100,
    averageScore: completedCount > 0 ? (totalScore / completedCount) * (100 / 3) : 0
  };
};

export const calculateOverallCompletion = (assessmentData) => {
  const functions = Object.keys(NIST_CSF_STRUCTURE);
  let totalCompletion = 0;
  let totalScore = 0;
  
  functions.forEach(funcId => {
    const result = calculateFunctionCompletion(assessmentData, funcId);
    totalCompletion += result.completion;
    totalScore += result.averageScore;
  });
  
  return {
    completion: totalCompletion / functions.length,
    averageScore: totalScore / functions.length
  };
};

// Export default assessment data structure
export const createDefaultAssessment = () => {
  const assessment = {};
  getAllSubcategories().forEach(sub => {
    assessment[sub.id] = { ...SCORING_TEMPLATE };
  });
  return assessment;
};

// Additional utility functions for assessment management
export const getCompletionByCategory = (assessmentData, functionId, categoryId) => {
  const subcategories = getSubcategoriesByCategory(functionId, categoryId);
  if (subcategories.length === 0) return { completion: 0, averageScore: 0 };
  
  let completedCount = 0;
  let totalScore = 0;
  
  subcategories.forEach(sub => {
    const assessment = assessmentData[sub.id];
    if (assessment) {
      const hasAnyScore = assessment.maturity > 0 || assessment.implementation > 0 || 
                         assessment.evidence > 0 || assessment.testing > 0;
      if (hasAnyScore) {
        completedCount++;
        totalScore += (assessment.maturity + assessment.implementation + 
                      assessment.evidence + assessment.testing) / 4;
      }
    }
  });
  
  return {
    completion: (completedCount / subcategories.length) * 100,
    averageScore: completedCount > 0 ? (totalScore / completedCount) * (100 / 3) : 0
  };
};

export const getHighestScoringControls = (assessmentData, limit = 10) => {
  const allSubs = getAllSubcategories();
  
  return allSubs
    .map(sub => {
      const assessment = assessmentData[sub.id];
      if (!assessment) return null;
      
      const averageScore = (assessment.maturity + assessment.implementation + 
                           assessment.evidence + assessment.testing) / 4;
      
      return {
        ...sub,
        score: averageScore,
        assessment
      };
    })
    .filter(item => item && item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
};

export const getLowestScoringControls = (assessmentData, limit = 10) => {
  const allSubs = getAllSubcategories();
  
  return allSubs
    .map(sub => {
      const assessment = assessmentData[sub.id];
      if (!assessment) return null;
      
      const averageScore = (assessment.maturity + assessment.implementation + 
                           assessment.evidence + assessment.testing) / 4;
      
      return {
        ...sub,
        score: averageScore,
        assessment
      };
    })
    .filter(item => item && item.score > 0)
    .sort((a, b) => a.score - b.score)
    .slice(0, limit);
};

export const getControlsRequiringAttention = (assessmentData) => {
  const allSubs = getAllSubcategories();
  
  return allSubs
    .map(sub => {
      const assessment = assessmentData[sub.id];
      if (!assessment) return null;
      
      const averageScore = (assessment.maturity + assessment.implementation + 
                           assessment.evidence + assessment.testing) / 4;
      
      // Flag controls with low scores or inconsistent scoring
      const scoreVariance = Math.max(
        Math.abs(assessment.maturity - averageScore),
        Math.abs(assessment.implementation - averageScore),
        Math.abs(assessment.evidence - averageScore),
        Math.abs(assessment.testing - averageScore)
      );
      
      const needsAttention = averageScore < 1.5 || scoreVariance > 1.5;
      
      return needsAttention ? {
        ...sub,
        score: averageScore,
        variance: scoreVariance,
        assessment
      } : null;
    })
    .filter(item => item !== null)
    .sort((a, b) => a.score - b.score);
};

export const exportAssessmentToCSV = (assessmentData) => {
  const allSubs = getAllSubcategories();
  const headers = [
    'Function',
    'Category', 
    'Subcategory ID',
    'Subcategory Name',
    'Description',
    'Maturity',
    'Implementation', 
    'Evidence',
    'Testing',
    'Average Score',
    'Notes',
    'Last Updated',
    'Assessor'
  ];
  
  const rows = allSubs.map(sub => {
    const assessment = assessmentData[sub.id] || {};
    const averageScore = assessment.maturity || assessment.implementation || 
                        assessment.evidence || assessment.testing ?
      (assessment.maturity + assessment.implementation + 
       assessment.evidence + assessment.testing) / 4 : 0;
    
    return [
      sub.functionName,
      sub.categoryName,
      sub.id,
      `"${sub.name}"`,
      `"${sub.description}"`,
      assessment.maturity || 0,
      assessment.implementation || 0,
      assessment.evidence || 0,
      assessment.testing || 0,
      averageScore.toFixed(2),
      `"${assessment.notes || ''}"`,
      assessment.lastUpdated || '',
      assessment.assessor || ''
    ];
  });
  
  const csvContent = [headers, ...rows]
    .map(row => row.join(','))
    .join('\n');
    
  return csvContent;
};

// Validation functions
export const validateAssessment = (assessmentData) => {
  const issues = [];
  const allSubs = getAllSubcategories();
  
  allSubs.forEach(sub => {
    const assessment = assessmentData[sub.id];
    if (!assessment) return;
    
    // Check for incomplete assessments
    const hasAnyScore = assessment.maturity > 0 || assessment.implementation > 0 || 
                       assessment.evidence > 0 || assessment.testing > 0;
    if (hasAnyScore) {
      const scores = [assessment.maturity, assessment.implementation, assessment.evidence, assessment.testing];
      const hasZeroScore = scores.some(score => score === 0);
      
      if (hasZeroScore) {
        issues.push({
          type: 'incomplete',
          subcategory: sub.id,
          message: 'Assessment started but not all dimensions scored',
          severity: 'warning'
        });
      }
    }
    
    // Check for inconsistent scoring patterns
    if (hasAnyScore) {
      const averageScore = (assessment.maturity + assessment.implementation + 
                           assessment.evidence + assessment.testing) / 4;
      const variance = Math.max(
        Math.abs(assessment.maturity - averageScore),
        Math.abs(assessment.implementation - averageScore),
        Math.abs(assessment.evidence - averageScore),
        Math.abs(assessment.testing - averageScore)
      );
      
      if (variance > 2) {
        issues.push({
          type: 'inconsistent',
          subcategory: sub.id,
          message: 'Large variance between dimension scores',
          severity: 'info'
        });
      }
    }
    
    // Check for high scores without evidence notes
    if (hasAnyScore) {
      const maxScore = Math.max(assessment.maturity, assessment.implementation, 
                               assessment.evidence, assessment.testing);
      if (maxScore >= 3 && (!assessment.notes || assessment.notes.trim().length < 10)) {
        issues.push({
          type: 'missing_evidence',
          subcategory: sub.id,
          message: 'High score without sufficient evidence documentation',
          severity: 'warning'
        });
      }
    }
  });
  
  return issues;
};