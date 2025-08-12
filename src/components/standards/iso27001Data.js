// src/components/standards/iso27001Data.js

import { Building2, Users, Lock, Server } from 'lucide-react';

/**
 * ISO 27001:2022 Data Structure
 * 
 * Complete structure for ISO 27001:2022 with all 93 controls
 * organized across 4 clauses (A.5-A.8) following the 2022 revision.
 */

// Main structure with all clauses
export const ISO_27001_STRUCTURE = {
  'A5': {
    id: 'A5',
    name: 'Organizational Controls',
    description: 'Policies, roles, responsibilities, and organizational information security',
    icon: Building2,
    controlCount: 37,
    sections: {
      'A5.1': {
        name: 'Policies for information security',
        controls: [
          {
            id: 'A.5.1',
            title: 'Policies for information security',
            description: 'Information security policy and topic-specific policies shall be defined, approved by management, published, communicated to and acknowledged by relevant personnel and relevant interested parties, and reviewed at planned intervals and if significant changes occur.',
            type: 'Preventive',
            properties: ['Confidentiality', 'Integrity', 'Availability'],
            nistMapping: ['GV.PO-01', 'GV.PO-02']
          }
        ]
      },
      'A5.2-5.8': {
        name: 'Information security roles and responsibilities',
        controls: [
          {
            id: 'A.5.2',
            title: 'Information security roles and responsibilities',
            description: 'Information security roles and responsibilities shall be defined and allocated according to the organization needs.',
            type: 'Preventive',
            properties: ['Confidentiality', 'Integrity', 'Availability'],
            nistMapping: ['GV.RR-01', 'GV.RR-02']
          },
          {
            id: 'A.5.3',
            title: 'Segregation of duties',
            description: 'Conflicting duties and conflicting areas of responsibility shall be segregated.',
            type: 'Preventive',
            properties: ['Confidentiality', 'Integrity'],
            nistMapping: ['PR.AC-04']
          },
          {
            id: 'A.5.4',
            title: 'Management responsibilities',
            description: 'Management shall require all personnel to apply information security in accordance with established policies.',
            type: 'Preventive',
            properties: ['Confidentiality', 'Integrity', 'Availability'],
            nistMapping: ['GV.SC-01']
          },
          {
            id: 'A.5.5',
            title: 'Contact with authorities',
            description: 'The organization shall establish and maintain contact with relevant authorities.',
            type: 'Preventive',
            properties: ['Confidentiality', 'Integrity', 'Availability'],
            nistMapping: ['RS.CO-01']
          },
          {
            id: 'A.5.6',
            title: 'Contact with special interest groups',
            description: 'The organization shall establish and maintain contact with special interest groups.',
            type: 'Preventive',
            properties: ['Confidentiality', 'Integrity', 'Availability'],
            nistMapping: ['ID.SC-05']
          },
          {
            id: 'A.5.7',
            title: 'Threat intelligence',
            description: 'Information relating to information security threats shall be collected and analysed.',
            type: 'Preventive',
            properties: ['Confidentiality', 'Integrity'],
            nistMapping: ['ID.RA-02', 'ID.RA-03']
          },
          {
            id: 'A.5.8',
            title: 'Information security in project management',
            description: 'Information security shall be integrated into project management.',
            type: 'Preventive',
            properties: ['Confidentiality', 'Integrity', 'Availability'],
            nistMapping: ['PL.PM-01']
          }
        ]
      },
      'A5.9-5.14': {
        name: 'Information security risk management',
        controls: [
          {
            id: 'A.5.9',
            title: 'Inventory of information and other associated assets',
            description: 'Information and other associated assets shall be identified and inventoried.',
            type: 'Preventive',
            properties: ['Confidentiality', 'Integrity', 'Availability'],
            nistMapping: ['ID.AM-01', 'ID.AM-02']
          },
          {
            id: 'A.5.10',
            title: 'Acceptable use of information',
            description: 'Rules for acceptable use shall be identified, documented and implemented.',
            type: 'Preventive',
            properties: ['Confidentiality', 'Integrity', 'Availability'],
            nistMapping: ['PR.DS-01']
          },
          {
            id: 'A.5.11',
            title: 'Return of assets',
            description: 'Personnel shall return all organizational assets upon change or termination.',
            type: 'Preventive',
            properties: ['Confidentiality', 'Availability'],
            nistMapping: ['PR.IP-11']
          },
          {
            id: 'A.5.12',
            title: 'Classification of information',
            description: 'Information shall be classified according to legal requirements and criticality.',
            type: 'Preventive',
            properties: ['Confidentiality'],
            nistMapping: ['ID.AM-05']
          },
          {
            id: 'A.5.13',
            title: 'Labelling of information',
            description: 'Appropriate procedures for information labelling shall be developed.',
            type: 'Preventive',
            properties: ['Confidentiality'],
            nistMapping: ['PR.DS-03']
          },
          {
            id: 'A.5.14',
            title: 'Information transfer',
            description: 'Information transfer rules, procedures and agreements shall be in place.',
            type: 'Preventive',
            properties: ['Confidentiality', 'Integrity', 'Availability'],
            nistMapping: ['PR.DS-02']
          }
        ]
      },
      'A5.15-5.23': {
        name: 'Access control and authentication',
        controls: [
          {
            id: 'A.5.15',
            title: 'Access control',
            description: 'Rules to control access shall be established based on business requirements.',
            type: 'Preventive',
            properties: ['Confidentiality', 'Integrity'],
            nistMapping: ['PR.AC-01']
          },
          {
            id: 'A.5.16',
            title: 'Identity management',
            description: 'Full life cycle of identities shall be managed.',
            type: 'Preventive',
            properties: ['Confidentiality', 'Integrity'],
            nistMapping: ['PR.AC-01', 'PR.AC-06']
          },
          {
            id: 'A.5.17',
            title: 'Authentication information',
            description: 'Allocation and management of authentication information shall be controlled.',
            type: 'Preventive',
            properties: ['Confidentiality', 'Integrity'],
            nistMapping: ['PR.AC-07']
          },
          {
            id: 'A.5.18',
            title: 'Access rights',
            description: 'Access rights shall be provisioned, reviewed and removed.',
            type: 'Preventive',
            properties: ['Confidentiality', 'Integrity'],
            nistMapping: ['PR.AC-01', 'PR.AC-06']
          },
          {
            id: 'A.5.19',
            title: 'Information security in supplier relationships',
            description: 'Processes shall be implemented to manage security risks in supplier relationships.',
            type: 'Preventive',
            properties: ['Confidentiality', 'Integrity', 'Availability'],
            nistMapping: ['ID.SC-01', 'ID.SC-02']
          },
          {
            id: 'A.5.20',
            title: 'Addressing information security in supplier agreements',
            description: 'Security requirements shall be established in supplier agreements.',
            type: 'Preventive',
            properties: ['Confidentiality', 'Integrity', 'Availability'],
            nistMapping: ['ID.SC-03']
          },
          {
            id: 'A.5.21',
            title: 'Managing information security in ICT supply chain',
            description: 'Processes shall be implemented to manage ICT supply chain security risks.',
            type: 'Preventive',
            properties: ['Confidentiality', 'Integrity', 'Availability'],
            nistMapping: ['ID.SC-04']
          },
          {
            id: 'A.5.22',
            title: 'Monitoring, review and change management of supplier services',
            description: 'Supplier service delivery shall be monitored and reviewed.',
            type: 'Detective',
            properties: ['Confidentiality', 'Integrity', 'Availability'],
            nistMapping: ['ID.SC-05']
          },
          {
            id: 'A.5.23',
            title: 'Information security for use of cloud services',
            description: 'Processes for acquisition, use and management of cloud services shall be established.',
            type: 'Preventive',
            properties: ['Confidentiality', 'Integrity', 'Availability'],
            nistMapping: ['PR.DS-06', 'ID.SC-02']
          }
        ]
      },
      'A5.24-5.37': {
        name: 'Incident management and compliance',
        controls: [
          {
            id: 'A.5.24',
            title: 'Information security incident management planning',
            description: 'Incident management shall be planned by establishing processes and responsibilities.',
            type: 'Corrective',
            properties: ['Confidentiality', 'Integrity', 'Availability'],
            nistMapping: ['RS.MA-01']
          },
          {
            id: 'A.5.25',
            title: 'Assessment and decision on information security events',
            description: 'Security events shall be assessed and classified.',
            type: 'Detective',
            properties: ['Confidentiality', 'Integrity', 'Availability'],
            nistMapping: ['RS.AN-01', 'RS.AN-02']
          },
          {
            id: 'A.5.26',
            title: 'Response to information security incidents',
            description: 'Security incidents shall be responded to according to procedures.',
            type: 'Corrective',
            properties: ['Confidentiality', 'Integrity', 'Availability'],
            nistMapping: ['RS.MI-01', 'RS.MI-02']
          },
          {
            id: 'A.5.27',
            title: 'Learning from information security incidents',
            description: 'Knowledge from incidents shall be used to strengthen controls.',
            type: 'Preventive',
            properties: ['Confidentiality', 'Integrity', 'Availability'],
            nistMapping: ['RS.IM-01', 'RS.IM-02']
          },
          {
            id: 'A.5.28',
            title: 'Collection of evidence',
            description: 'Procedures for evidence collection shall be established.',
            type: 'Detective',
            properties: ['Integrity'],
            nistMapping: ['RS.AN-03']
          },
          {
            id: 'A.5.29',
            title: 'Information security during disruption',
            description: 'Security shall be maintained during disruptions.',
            type: 'Preventive',
            properties: ['Confidentiality', 'Integrity', 'Availability'],
            nistMapping: ['RC.RP-01']
          },
          {
            id: 'A.5.30',
            title: 'ICT readiness for business continuity',
            description: 'ICT continuity shall be planned and implemented.',
            type: 'Corrective',
            properties: ['Availability'],
            nistMapping: ['RC.RP-01']
          },
          {
            id: 'A.5.31',
            title: 'Legal, statutory, regulatory and contractual requirements',
            description: 'Legal and regulatory requirements shall be identified and met.',
            type: 'Preventive',
            properties: ['Confidentiality', 'Integrity', 'Availability'],
            nistMapping: ['ID.GV-03']
          },
          {
            id: 'A.5.32',
            title: 'Intellectual property rights',
            description: 'Intellectual property rights shall be protected.',
            type: 'Preventive',
            properties: ['Confidentiality', 'Integrity'],
            nistMapping: ['ID.GV-04']
          },
          {
            id: 'A.5.33',
            title: 'Protection of records',
            description: 'Records shall be protected according to requirements.',
            type: 'Preventive',
            properties: ['Confidentiality', 'Integrity', 'Availability'],
            nistMapping: ['PR.IP-11']
          },
          {
            id: 'A.5.34',
            title: 'Privacy and protection of personal information',
            description: 'Privacy and PII protection shall be ensured.',
            type: 'Preventive',
            properties: ['Confidentiality'],
            nistMapping: ['ID.GV-03', 'PR.DS-05']
          },
          {
            id: 'A.5.35',
            title: 'Independent review of information security',
            description: 'Information security shall be independently reviewed.',
            type: 'Preventive',
            properties: ['Confidentiality', 'Integrity', 'Availability'],
            nistMapping: ['PL.PM-03']
          },
          {
            id: 'A.5.36',
            title: 'Compliance with policies and standards',
            description: 'Compliance with security policies shall be reviewed.',
            type: 'Preventive',
            properties: ['Confidentiality', 'Integrity', 'Availability'],
            nistMapping: ['PL.PM-04']
          },
          {
            id: 'A.5.37',
            title: 'Documented operating procedures',
            description: 'Operating procedures shall be documented and available.',
            type: 'Preventive',
            properties: ['Integrity', 'Availability'],
            nistMapping: ['PR.IP-01']
          }
        ]
      }
    }
  },
  'A6': {
    id: 'A6',
    name: 'People Controls',
    description: 'Human resources security controls',
    icon: Users,
    controlCount: 8,
    sections: {
      'A6.1-6.8': {
        name: 'People security',
        controls: [
          {
            id: 'A.6.1',
            title: 'Screening',
            description: 'Background verification checks shall be carried out.',
            type: 'Preventive',
            properties: ['Confidentiality', 'Integrity'],
            nistMapping: ['PR.IP-11']
          },
          {
            id: 'A.6.2',
            title: 'Terms and conditions of employment',
            description: 'Employment agreements shall state security responsibilities.',
            type: 'Preventive',
            properties: ['Confidentiality', 'Integrity', 'Availability'],
            nistMapping: ['PR.AT-02']
          },
          {
            id: 'A.6.3',
            title: 'Information security awareness, education and training',
            description: 'Personnel shall receive security awareness training.',
            type: 'Preventive',
            properties: ['Confidentiality', 'Integrity', 'Availability'],
            nistMapping: ['PR.AT-01']
          },
          {
            id: 'A.6.4',
            title: 'Disciplinary process',
            description: 'A disciplinary process for security violations shall exist.',
            type: 'Corrective',
            properties: ['Confidentiality', 'Integrity', 'Availability'],
            nistMapping: ['PR.IP-11']
          },
          {
            id: 'A.6.5',
            title: 'Responsibilities after termination or change of employment',
            description: 'Security responsibilities after employment changes shall be defined.',
            type: 'Preventive',
            properties: ['Confidentiality', 'Integrity', 'Availability'],
            nistMapping: ['PR.IP-11']
          },
          {
            id: 'A.6.6',
            title: 'Confidentiality or non-disclosure agreements',
            description: 'Confidentiality agreements shall be used.',
            type: 'Preventive',
            properties: ['Confidentiality'],
            nistMapping: ['PR.IP-11']
          },
          {
            id: 'A.6.7',
            title: 'Remote working',
            description: 'Security measures for remote working shall be implemented.',
            type: 'Preventive',
            properties: ['Confidentiality', 'Integrity', 'Availability'],
            nistMapping: ['PR.AC-03']
          },
          {
            id: 'A.6.8',
            title: 'Information security event reporting',
            description: 'Personnel shall report security events.',
            type: 'Detective',
            properties: ['Confidentiality', 'Integrity', 'Availability'],
            nistMapping: ['RS.CO-02']
          }
        ]
      }
    }
  },
  'A7': {
    id: 'A7',
    name: 'Physical Controls',
    description: 'Physical and environmental security',
    icon: Lock,
    controlCount: 14,
    sections: {
      'A7.1-7.14': {
        name: 'Physical and environmental security',
        controls: [
          {
            id: 'A.7.1',
            title: 'Physical security perimeters',
            description: 'Security perimeters shall be defined and protected.',
            type: 'Preventive',
            properties: ['Confidentiality', 'Integrity', 'Availability'],
            nistMapping: ['PR.AC-02']
          },
          {
            id: 'A.7.2',
            title: 'Physical entry',
            description: 'Secure areas shall be protected by appropriate entry controls.',
            type: 'Preventive',
            properties: ['Confidentiality', 'Integrity', 'Availability'],
            nistMapping: ['PR.AC-02']
          },
          {
            id: 'A.7.3',
            title: 'Securing offices, rooms and facilities',
            description: 'Physical security for offices and facilities shall be designed.',
            type: 'Preventive',
            properties: ['Confidentiality', 'Integrity', 'Availability'],
            nistMapping: ['PR.AC-02']
          },
          {
            id: 'A.7.4',
            title: 'Physical security monitoring',
            description: 'Physical access shall be monitored.',
            type: 'Detective',
            properties: ['Confidentiality', 'Integrity', 'Availability'],
            nistMapping: ['DE.CM-02']
          },
          {
            id: 'A.7.5',
            title: 'Protecting against physical and environmental threats',
            description: 'Protection against natural disasters shall be designed.',
            type: 'Preventive',
            properties: ['Availability'],
            nistMapping: ['PR.IP-05']
          },
          {
            id: 'A.7.6',
            title: 'Working in secure areas',
            description: 'Procedures for working in secure areas shall be designed.',
            type: 'Preventive',
            properties: ['Confidentiality', 'Integrity'],
            nistMapping: ['PR.AC-02']
          },
          {
            id: 'A.7.7',
            title: 'Clear desk and clear screen',
            description: 'Clear desk and screen policies shall be adopted.',
            type: 'Preventive',
            properties: ['Confidentiality', 'Integrity'],
            nistMapping: ['PR.IP-11']
          },
          {
            id: 'A.7.8',
            title: 'Equipment siting and protection',
            description: 'Equipment shall be sited and protected appropriately.',
            type: 'Preventive',
            properties: ['Confidentiality', 'Integrity', 'Availability'],
            nistMapping: ['PR.PT-05']
          },
          {
            id: 'A.7.9',
            title: 'Security of assets off-premises',
            description: 'Off-site assets shall be protected.',
            type: 'Preventive',
            properties: ['Confidentiality', 'Integrity', 'Availability'],
            nistMapping: ['PR.PT-05']
          },
          {
            id: 'A.7.10',
            title: 'Storage media',
            description: 'Storage media shall be managed through their lifecycle.',
            type: 'Preventive',
            properties: ['Confidentiality', 'Integrity', 'Availability'],
            nistMapping: ['PR.DS-03']
          },
          {
            id: 'A.7.11',
            title: 'Supporting utilities',
            description: 'Facilities shall be protected from power failures.',
            type: 'Preventive',
            properties: ['Availability'],
            nistMapping: ['PR.IP-05']
          },
          {
            id: 'A.7.12',
            title: 'Cabling security',
            description: 'Cabling shall be protected from interception or damage.',
            type: 'Preventive',
            properties: ['Confidentiality', 'Integrity', 'Availability'],
            nistMapping: ['PR.PT-05']
          },
          {
            id: 'A.7.13',
            title: 'Equipment maintenance',
            description: 'Equipment shall be correctly maintained.',
            type: 'Preventive',
            properties: ['Integrity', 'Availability'],
            nistMapping: ['PR.MA-01']
          },
          {
            id: 'A.7.14',
            title: 'Secure disposal or reuse of equipment',
            description: 'Equipment containing data shall be securely disposed.',
            type: 'Preventive',
            properties: ['Confidentiality'],
            nistMapping: ['PR.DS-03']
          }
        ]
      }
    }
  },
  'A8': {
    id: 'A8',
    name: 'Technological Controls',
    description: 'Technical security controls',
    icon: Server,
    controlCount: 34,
    sections: {
      'A8.1-8.8': {
        name: 'Endpoint and network security',
        controls: [
          {
            id: 'A.8.1',
            title: 'User endpoint devices',
            description: 'Information on endpoint devices shall be protected.',
            type: 'Preventive',
            properties: ['Confidentiality', 'Integrity'],
            nistMapping: ['PR.AC-04', 'PR.DS-01']
          },
          {
            id: 'A.8.2',
            title: 'Privileged access rights',
            description: 'Allocation of privileged access rights shall be restricted.',
            type: 'Preventive',
            properties: ['Confidentiality', 'Integrity'],
            nistMapping: ['PR.AC-04']
          },
          {
            id: 'A.8.3',
            title: 'Information access restriction',
            description: 'Access to information shall be restricted.',
            type: 'Preventive',
            properties: ['Confidentiality'],
            nistMapping: ['PR.AC-04']
          },
          {
            id: 'A.8.4',
            title: 'Access to source code',
            description: 'Access to source code shall be restricted.',
            type: 'Preventive',
            properties: ['Confidentiality', 'Integrity'],
            nistMapping: ['PR.AC-04']
          },
          {
            id: 'A.8.5',
            title: 'Secure authentication',
            description: 'Secure authentication technologies shall be implemented.',
            type: 'Preventive',
            properties: ['Confidentiality', 'Integrity'],
            nistMapping: ['PR.AC-07']
          },
          {
            id: 'A.8.6',
            title: 'Capacity management',
            description: 'Resource use shall be monitored and adjusted.',
            type: 'Preventive',
            properties: ['Availability'],
            nistMapping: ['PR.DS-04']
          },
          {
            id: 'A.8.7',
            title: 'Protection against malware',
            description: 'Protection against malware shall be implemented.',
            type: 'Preventive',
            properties: ['Integrity', 'Availability'],
            nistMapping: ['DE.CM-04']
          },
          {
            id: 'A.8.8',
            title: 'Management of technical vulnerabilities',
            description: 'Technical vulnerabilities shall be managed.',
            type: 'Preventive',
            properties: ['Confidentiality', 'Integrity', 'Availability'],
            nistMapping: ['ID.RA-01', 'RS.MI-03']
          }
        ]
      },
      'A8.9-8.16': {
        name: 'Configuration and monitoring',
        controls: [
          {
            id: 'A.8.9',
            title: 'Configuration management',
            description: 'Configurations shall be established and maintained.',
            type: 'Preventive',
            properties: ['Integrity', 'Availability'],
            nistMapping: ['PR.IP-01']
          },
          {
            id: 'A.8.10',
            title: 'Information deletion',
            description: 'Information shall be deleted when no longer required.',
            type: 'Preventive',
            properties: ['Confidentiality'],
            nistMapping: ['PR.DS-03']
          },
          {
            id: 'A.8.11',
            title: 'Data masking',
            description: 'Data masking shall be used according to policy.',
            type: 'Preventive',
            properties: ['Confidentiality'],
            nistMapping: ['PR.DS-05']
          },
          {
            id: 'A.8.12',
            title: 'Data leakage prevention',
            description: 'Data leakage prevention measures shall be applied.',
            type: 'Detective',
            properties: ['Confidentiality'],
            nistMapping: ['PR.DS-05']
          },
          {
            id: 'A.8.13',
            title: 'Information backup',
            description: 'Backup copies shall be maintained.',
            type: 'Corrective',
            properties: ['Integrity', 'Availability'],
            nistMapping: ['PR.IP-04']
          },
          {
            id: 'A.8.14',
            title: 'Redundancy of information processing facilities',
            description: 'Processing facilities shall be implemented with redundancy.',
            type: 'Corrective',
            properties: ['Availability'],
            nistMapping: ['PR.PT-05']
          },
          {
            id: 'A.8.15',
            title: 'Logging',
            description: 'Logs shall be produced, stored and protected.',
            type: 'Detective',
            properties: ['Confidentiality', 'Integrity'],
            nistMapping: ['PR.PT-01']
          },
          {
            id: 'A.8.16',
            title: 'Monitoring activities',
            description: 'Systems shall be monitored for anomalous behavior.',
            type: 'Detective',
            properties: ['Confidentiality', 'Integrity', 'Availability'],
            nistMapping: ['DE.CM-01', 'DE.CM-03']
          }
        ]
      },
      'A8.17-8.24': {
        name: 'Systems security',
        controls: [
          {
            id: 'A.8.17',
            title: 'Clock synchronization',
            description: 'System clocks shall be synchronized.',
            type: 'Preventive',
            properties: ['Integrity'],
            nistMapping: ['PR.PT-01']
          },
          {
            id: 'A.8.18',
            title: 'Use of privileged utility programs',
            description: 'Use of utility programs shall be restricted.',
            type: 'Preventive',
            properties: ['Confidentiality', 'Integrity'],
            nistMapping: ['PR.AC-04']
          },
          {
            id: 'A.8.19',
            title: 'Installation of software on operational systems',
            description: 'Software installation shall be controlled.',
            type: 'Preventive',
            properties: ['Integrity'],
            nistMapping: ['PR.IP-01']
          },
          {
            id: 'A.8.20',
            title: 'Networks security',
            description: 'Networks shall be managed and controlled.',
            type: 'Preventive',
            properties: ['Confidentiality', 'Integrity', 'Availability'],
            nistMapping: ['PR.AC-05']
          },
          {
            id: 'A.8.21',
            title: 'Security of network services',
            description: 'Security mechanisms for network services shall be identified.',
            type: 'Preventive',
            properties: ['Confidentiality', 'Integrity', 'Availability'],
            nistMapping: ['PR.AC-05']
          },
          {
            id: 'A.8.22',
            title: 'Segregation of networks',
            description: 'Networks shall be segregated.',
            type: 'Preventive',
            properties: ['Confidentiality', 'Integrity'],
            nistMapping: ['PR.AC-05']
          },
          {
            id: 'A.8.23',
            title: 'Web filtering',
            description: 'Access to external websites shall be managed.',
            type: 'Preventive',
            properties: ['Integrity', 'Availability'],
            nistMapping: ['PR.AC-05']
          },
          {
            id: 'A.8.24',
            title: 'Use of cryptography',
            description: 'Cryptography policy shall be developed and implemented.',
            type: 'Preventive',
            properties: ['Confidentiality', 'Integrity'],
            nistMapping: ['PR.DS-01', 'PR.DS-02']
          }
        ]
      },
      'A8.25-8.34': {
        name: 'Application and development security',
        controls: [
          {
            id: 'A.8.25',
            title: 'Secure development life cycle',
            description: 'Rules for secure development shall be established.',
            type: 'Preventive',
            properties: ['Confidentiality', 'Integrity', 'Availability'],
            nistMapping: ['PR.IP-02']
          },
          {
            id: 'A.8.26',
            title: 'Application security requirements',
            description: 'Security requirements shall be identified and approved.',
            type: 'Preventive',
            properties: ['Confidentiality', 'Integrity', 'Availability'],
            nistMapping: ['PR.IP-02']
          },
          {
            id: 'A.8.27',
            title: 'System architecture and engineering principles',
            description: 'Secure engineering principles shall be established.',
            type: 'Preventive',
            properties: ['Confidentiality', 'Integrity', 'Availability'],
            nistMapping: ['PR.IP-02']
          },
          {
            id: 'A.8.28',
            title: 'Secure coding',
            description: 'Secure coding principles shall be applied.',
            type: 'Preventive',
            properties: ['Confidentiality', 'Integrity'],
            nistMapping: ['PR.IP-02']
          },
          {
            id: 'A.8.29',
            title: 'Security testing in development and acceptance',
            description: 'Security testing shall be performed during development.',
            type: 'Preventive',
            properties: ['Confidentiality', 'Integrity', 'Availability'],
            nistMapping: ['PR.IP-02']
          },
          {
            id: 'A.8.30',
            title: 'Outsourced development',
            description: 'Outsourced development shall be supervised.',
            type: 'Preventive',
            properties: ['Confidentiality', 'Integrity', 'Availability'],
            nistMapping: ['ID.SC-03']
          },
          {
            id: 'A.8.31',
            title: 'Separation of development, test and production environments',
            description: 'Development, test and production shall be separated.',
            type: 'Preventive',
            properties: ['Confidentiality', 'Integrity'],
            nistMapping: ['PR.IP-02']
          },
          {
            id: 'A.8.32',
            title: 'Change management',
            description: 'Changes to systems shall be controlled.',
            type: 'Preventive',
            properties: ['Integrity', 'Availability'],
            nistMapping: ['PR.IP-03']
          },
          {
            id: 'A.8.33',
            title: 'Test information',
            description: 'Test information shall be selected and protected.',
            type: 'Preventive',
            properties: ['Confidentiality'],
            nistMapping: ['PR.IP-02']
          },
          {
            id: 'A.8.34',
            title: 'Protection of information systems during audit testing',
            description: 'Audit tests shall be planned to minimize disruption.',
            type: 'Preventive',
            properties: ['Availability'],
            nistMapping: ['DE.DP-05']
          }
        ]
      }
    }
  }
};

// Scoring template for each control
export const SCORING_TEMPLATE = {
  maturity: 0,        // 0-5 scale
  implementation: 0,  // 0-5 scale
  evidence: 0,        // 0-5 scale
  testing: 0,         // 0-5 scale
  notes: '',
  lastUpdated: null,
  evidenceFiles: [],
  gaps: [],
  actions: []
};

// Get all controls as flat array
export const getAllControls = () => {
  const controls = [];
  Object.values(ISO_27001_STRUCTURE).forEach(clause => {
    Object.values(clause.sections).forEach(section => {
      controls.push(...section.controls);
    });
  });
  return controls;
};

// Get control count by clause
export const getControlsByClause = (clauseId) => {
  const clause = ISO_27001_STRUCTURE[clauseId];
  if (!clause) return [];
  
  const controls = [];
  Object.values(clause.sections).forEach(section => {
    controls.push(...section.controls);
  });
  return controls;
};

// Search controls
export const searchControls = (searchTerm) => {
  const term = searchTerm.toLowerCase();
  return getAllControls().filter(control => 
    control.id.toLowerCase().includes(term) ||
    control.title.toLowerCase().includes(term) ||
    control.description.toLowerCase().includes(term) ||
    control.type.toLowerCase().includes(term) ||
    (control.properties && control.properties.some(p => p.toLowerCase().includes(term)))
  );
};

// Calculate completion rates and scores
export const calculateClauseCompletion = (assessmentData, clauseId) => {
  const controls = getControlsByClause(clauseId);
  if (controls.length === 0) return { completion: 0, averageScore: 0 };
  
  let completedCount = 0;
  let totalScore = 0;
  
  controls.forEach(control => {
    const assessment = assessmentData[control.id];
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
    completion: (completedCount / controls.length) * 100,
    averageScore: completedCount > 0 ? (totalScore / completedCount) * (100 / 5) : 0
  };
};

export const calculateOverallCompletion = (assessmentData) => {
  const clauses = Object.keys(ISO_27001_STRUCTURE);
  let totalCompletion = 0;
  let totalScore = 0;
  
  clauses.forEach(clauseId => {
    const result = calculateClauseCompletion(assessmentData, clauseId);
    totalCompletion += result.completion;
    totalScore += result.averageScore;
  });
  
  return {
    completion: totalCompletion / clauses.length,
    averageScore: totalScore / clauses.length
  };
};

// Create default assessment data structure
export const createDefaultAssessment = () => {
  const assessment = {};
  getAllControls().forEach(control => {
    assessment[control.id] = { ...SCORING_TEMPLATE };
  });
  return assessment;
};

// Get completion by section
export const getCompletionBySection = (assessmentData, clauseId, sectionId) => {
  const clause = ISO_27001_STRUCTURE[clauseId];
  if (!clause || !clause.sections[sectionId]) return { completion: 0, averageScore: 0 };
  
  const controls = clause.sections[sectionId].controls;
  if (controls.length === 0) return { completion: 0, averageScore: 0 };
  
  let completedCount = 0;
  let totalScore = 0;
  
  controls.forEach(control => {
    const assessment = assessmentData[control.id];
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
    completion: (completedCount / controls.length) * 100,
    averageScore: completedCount > 0 ? (totalScore / completedCount) * (100 / 5) : 0
  };
};

// Map ISO 27001 controls to NIST CSF (simplified mapping)
export const ISO_TO_NIST_MAPPING = {
  'A.5.1': ['GV.PO-01', 'GV.PO-02'],
  'A.5.2': ['GV.RR-01', 'GV.RR-02'],
  'A.5.3': ['PR.AC-04'],
  'A.5.7': ['ID.RA-02', 'ID.RA-03'],
  'A.5.9': ['ID.AM-01', 'ID.AM-02'],
  'A.5.15': ['PR.AC-01'],
  'A.5.23': ['PR.DS-06', 'ID.SC-02'],
  'A.6.1': ['PR.IP-11'],
  'A.6.3': ['PR.AT-01'],
  'A.6.7': ['PR.AC-03'],
  'A.7.1': ['PR.AC-02'],
  'A.7.4': ['DE.CM-02'],
  'A.8.1': ['PR.AC-04', 'PR.DS-01'],
  'A.8.5': ['PR.AC-07'],
  'A.8.8': ['ID.RA-01', 'RS.MI-03'],
  'A.8.9': ['PR.IP-01'],
  'A.8.12': ['PR.DS-05'],
  'A.8.15': ['PR.PT-01'],
  'A.8.16': ['DE.CM-01', 'DE.CM-03'],
  'A.8.24': ['PR.DS-01', 'PR.DS-02'],
  'A.8.25': ['PR.IP-02'],
  'A.8.28': ['PR.IP-02'],
  'A.8.32': ['PR.IP-03']
};

// Evidence decay rates (in days)
export const EVIDENCE_DECAY_RATES = {
  policy: 365,        // Policies decay over 1 year
  procedure: 180,     // Procedures decay over 6 months
  config: 90,         // Configurations decay over 3 months
  log: 30,           // Logs decay over 1 month
  audit: 365,        // Audit reports valid for 1 year
  test: 90,          // Test results valid for 3 months
  training: 365      // Training records valid for 1 year
};

// Control implementation priority based on risk
export const getControlPriority = (control) => {
  // Critical controls that should be implemented first
  const criticalControls = [
    'A.5.1', 'A.5.2', 'A.5.15', 'A.5.16', 'A.5.17', 'A.5.18',
    'A.6.1', 'A.6.3', 'A.7.1', 'A.7.2', 'A.8.1', 'A.8.2', 
    'A.8.5', 'A.8.7', 'A.8.8', 'A.8.24'
  ];
  
  // High priority controls
  const highPriorityControls = [
    'A.5.7', 'A.5.9', 'A.5.12', 'A.5.23', 'A.5.24', 'A.5.31',
    'A.6.7', 'A.7.4', 'A.8.9', 'A.8.12', 'A.8.13', 'A.8.15',
    'A.8.16', 'A.8.20', 'A.8.25', 'A.8.28'
  ];
  
  if (criticalControls.includes(control.id)) return 'Critical';
  if (highPriorityControls.includes(control.id)) return 'High';
  return 'Medium';
};

// Export assessment statistics
export const getAssessmentStatistics = (assessmentData) => {
  const allControls = getAllControls();
  const stats = {
    totalControls: allControls.length,
    assessedControls: 0,
    fullImplemented: 0,
    partialImplemented: 0,
    notImplemented: 0,
    notAssessed: 0,
    averageMaturity: 0,
    averageImplementation: 0,
    averageEvidence: 0,
    averageTesting: 0,
    byClause: {},
    byPriority: {
      Critical: { total: 0, assessed: 0, avgScore: 0 },
      High: { total: 0, assessed: 0, avgScore: 0 },
      Medium: { total: 0, assessed: 0, avgScore: 0 }
    }
  };
  
  let totalMaturity = 0;
  let totalImplementation = 0;
  let totalEvidence = 0;
  let totalTesting = 0;
  
  allControls.forEach(control => {
    const assessment = assessmentData[control.id];
    const priority = getControlPriority(control);
    const clauseId = control.id.split('.')[0].replace('A', 'A');
    
    // Initialize clause stats
    if (!stats.byClause[clauseId]) {
      stats.byClause[clauseId] = { 
        total: 0, 
        assessed: 0, 
        avgScore: 0 
      };
    }
    
    stats.byClause[clauseId].total++;
    stats.byPriority[priority].total++;
    
    if (assessment) {
      const hasAnyScore = assessment.maturity > 0 || assessment.implementation > 0 || 
                         assessment.evidence > 0 || assessment.testing > 0;
      
      if (hasAnyScore) {
        stats.assessedControls++;
        stats.byClause[clauseId].assessed++;
        stats.byPriority[priority].assessed++;
        
        const avgScore = (assessment.maturity + assessment.implementation + 
                         assessment.evidence + assessment.testing) / 4;
        
        if (avgScore >= 4) stats.fullImplemented++;
        else if (avgScore >= 2) stats.partialImplemented++;
        else stats.notImplemented++;
        
        totalMaturity += assessment.maturity;
        totalImplementation += assessment.implementation;
        totalEvidence += assessment.evidence;
        totalTesting += assessment.testing;
        
        stats.byClause[clauseId].avgScore += avgScore;
        stats.byPriority[priority].avgScore += avgScore;
      } else {
        stats.notAssessed++;
      }
    } else {
      stats.notAssessed++;
    }
  });
  
  // Calculate averages
  if (stats.assessedControls > 0) {
    stats.averageMaturity = totalMaturity / stats.assessedControls;
    stats.averageImplementation = totalImplementation / stats.assessedControls;
    stats.averageEvidence = totalEvidence / stats.assessedControls;
    stats.averageTesting = totalTesting / stats.assessedControls;
    
    // Calculate clause averages
    Object.keys(stats.byClause).forEach(clauseId => {
      if (stats.byClause[clauseId].assessed > 0) {
        stats.byClause[clauseId].avgScore = 
          stats.byClause[clauseId].avgScore / stats.byClause[clauseId].assessed;
      }
    });
    
    // Calculate priority averages
    Object.keys(stats.byPriority).forEach(priority => {
      if (stats.byPriority[priority].assessed > 0) {
        stats.byPriority[priority].avgScore = 
          stats.byPriority[priority].avgScore / stats.byPriority[priority].assessed;
      }
    });
  }
  
  return stats;
};
