import { useState, useEffect, useCallback, useMemo } from 'react';

// --- Constants and Mock Data ---

// MITRE ATT&CK Tactics
const TACTICS = [
  {
    id: 'TA0001',
    name: 'Initial Access',
    description: 'Techniques that use various entry vectors to gain their initial foothold within a network.',
    shortName: 'initial-access',
    color: '#c55a11'
  },
  {
    id: 'TA0002',
    name: 'Execution',
    description: 'Techniques that result in adversary-controlled code running on a local or remote system.',
    shortName: 'execution',
    color: '#e36c09'
  },
  {
    id: 'TA0003',
    name: 'Persistence',
    description: 'Techniques that adversaries use to maintain their foothold across system restarts, changed credentials, and other interruptions.',
    shortName: 'persistence',
    color: '#f7941d'
  },
  {
    id: 'TA0004',
    name: 'Privilege Escalation',
    description: 'Techniques that adversaries use to gain higher-level permissions on a system or network.',
    shortName: 'privilege-escalation',
    color: '#ffc000'
  },
  {
    id: 'TA0005',
    name: 'Defense Evasion',
    description: 'Techniques that adversaries use to avoid detection throughout their compromise.',
    shortName: 'defense-evasion',
    color: '#ffcd00'
  },
  {
    id: 'TA0006',
    name: 'Credential Access',
    description: 'Techniques for stealing credentials like account names and passwords.',
    shortName: 'credential-access',
    color: '#92d050'
  },
  {
    id: 'TA0007',
    name: 'Discovery',
    description: 'Techniques that adversaries use to gain knowledge about the system and internal network.',
    shortName: 'discovery',
    color: '#00b050'
  },
  {
    id: 'TA0008',
    name: 'Lateral Movement',
    description: 'Techniques that adversaries use to enter and control remote systems on a network.',
    shortName: 'lateral-movement',
    color: '#00b0f0'
  },
  {
    id: 'TA0009',
    name: 'Collection',
    description: 'Techniques adversaries use to gather information and the sources information is collected from that are relevant to following through on adversary objectives.',
    shortName: 'collection',
    color: '#0070c0'
  },
  {
    id: 'TA0010',
    name: 'Exfiltration',
    description: 'Techniques that adversaries use to steal data from your network.',
    shortName: 'exfiltration',
    color: '#002060'
  },
  {
    id: 'TA0011',
    name: 'Command and Control',
    description: 'Techniques that adversaries use to communicate with systems under their control within a victim network.',
    shortName: 'command-and-control',
    color: '#7030a0'
  },
  {
    id: 'TA0040',
    name: 'Impact',
    description: 'Techniques that adversaries use to disrupt availability or compromise integrity by manipulating business and operational processes.',
    shortName: 'impact',
    color: '#c00000'
  },
  {
    id: 'TA0042',
    name: 'Resource Development',
    description: 'Techniques that involve adversaries creating, purchasing, or compromising resources that can be used to support targeting.',
    shortName: 'resource-development',
    color: '#767171'
  },
  {
    id: 'TA0043',
    name: 'Reconnaissance',
    description: 'Techniques that involve adversaries actively or passively gathering information that can be used to support targeting.',
    shortName: 'reconnaissance',
    color: '#4472c4'
  }
];

// MITRE ATT&CK Techniques (subset for demo)
const TECHNIQUES = [
  {
    id: 'T1566',
    name: 'Phishing',
    description: 'Adversaries may send phishing messages to gain access to victim systems. Phishing is a common method to gain initial access.',
    tacticIds: ['TA0001'],
    subTechniques: [
      {
        id: 'T1566.001',
        name: 'Spearphishing Attachment',
        description: 'Adversaries may send spearphishing emails with a malicious attachment in an attempt to gain access to victim systems.',
        tacticIds: ['TA0001']
      },
      {
        id: 'T1566.002',
        name: 'Spearphishing Link',
        description: 'Adversaries may send spearphishing emails with a malicious link in an attempt to gain access to victim systems.',
        tacticIds: ['TA0001']
      }
    ],
    detectionMethods: ['Email filtering', 'User awareness', 'Endpoint protection'],
    mitigation: ['M1017', 'M1049'],
    usedBy: ['G0007', 'G0016', 'G0032'],
    platforms: ['Windows', 'macOS', 'Linux']
  },
  {
    id: 'T1190',
    name: 'Exploit Public-Facing Application',
    description: 'Adversaries may attempt to exploit vulnerabilities in internet-facing applications to establish an initial foothold.',
    tacticIds: ['TA0001'],
    subTechniques: [],
    detectionMethods: ['Web application firewall', 'Log monitoring', 'Vulnerability scanning'],
    mitigation: ['M1050', 'M1051'],
    usedBy: ['G0016', 'G0035'],
    platforms: ['Windows', 'Linux', 'Network']
  },
  {
    id: 'T1059',
    name: 'Command and Scripting Interpreter',
    description: 'Adversaries may abuse command and script interpreters to execute commands, scripts, or binaries.',
    tacticIds: ['TA0002'],
    subTechniques: [
      {
        id: 'T1059.001',
        name: 'PowerShell',
        description: 'Adversaries may abuse PowerShell to execute commands and scripts.',
        tacticIds: ['TA0002']
      },
      {
        id: 'T1059.003',
        name: 'Windows Command Shell',
        description: 'Adversaries may abuse the Windows command shell to execute commands.',
        tacticIds: ['TA0002']
      }
    ],
    detectionMethods: ['Process monitoring', 'Command-line logging', 'Script block logging'],
    mitigation: ['M1038', 'M1042'],
    usedBy: ['G0007', 'G0016', 'G0032', 'G0035'],
    platforms: ['Windows', 'macOS', 'Linux']
  },
  {
    id: 'T1053',
    name: 'Scheduled Task/Job',
    description: 'Adversaries may abuse task scheduling functionality to facilitate initial or recurring execution of malicious code.',
    tacticIds: ['TA0003', 'TA0004'],
    subTechniques: [
      {
        id: 'T1053.005',
        name: 'Scheduled Task',
        description: 'Adversaries may abuse the Windows Task Scheduler to perform task scheduling for initial or recurring execution of malicious code.',
        tacticIds: ['TA0003', 'TA0004']
      }
    ],
    detectionMethods: ['Process monitoring', 'Task scheduler monitoring', 'Command-line logging'],
    mitigation: ['M1028', 'M1038'],
    usedBy: ['G0007', 'G0035'],
    platforms: ['Windows', 'macOS', 'Linux']
  },
  {
    id: 'T1078',
    name: 'Valid Accounts',
    description: 'Adversaries may obtain and abuse credentials of existing accounts as a means of gaining Initial Access, Persistence, Privilege Escalation, or Defense Evasion.',
    tacticIds: ['TA0001', 'TA0003', 'TA0004', 'TA0005'],
    subTechniques: [
      {
        id: 'T1078.001',
        name: 'Default Accounts',
        description: 'Adversaries may obtain and abuse credentials of default accounts as a means of gaining Initial Access, Persistence, Privilege Escalation, or Defense Evasion.',
        tacticIds: ['TA0001', 'TA0003', 'TA0004', 'TA0005']
      },
      {
        id: 'T1078.002',
        name: 'Domain Accounts',
        description: 'Adversaries may obtain and abuse credentials of domain accounts as a means of gaining Initial Access, Persistence, Privilege Escalation, or Defense Evasion.',
        tacticIds: ['TA0001', 'TA0003', 'TA0004', 'TA0005']
      }
    ],
    detectionMethods: ['Authentication logs', 'Account monitoring', 'Unusual activity detection'],
    mitigation: ['M1026', 'M1032'],
    usedBy: ['G0007', 'G0016', 'G0032', 'G0035'],
    platforms: ['Windows', 'macOS', 'Linux', 'Cloud']
  },
  {
    id: 'T1055',
    name: 'Process Injection',
    description: 'Adversaries may inject code into processes in order to evade process-based defenses as well as possibly elevate privileges.',
    tacticIds: ['TA0004', 'TA0005'],
    subTechniques: [
      {
        id: 'T1055.001',
        name: 'Dynamic-link Library Injection',
        description: 'Adversaries may inject dynamic-link libraries (DLLs) into processes to evade process-based defenses and possibly elevate privileges.',
        tacticIds: ['TA0004', 'TA0005']
      }
    ],
    detectionMethods: ['Process monitoring', 'Memory scanning', 'Behavior analysis'],
    mitigation: ['M1038', 'M1040'],
    usedBy: ['G0016', 'G0032'],
    platforms: ['Windows']
  },
  {
    id: 'T1110',
    name: 'Brute Force',
    description: 'Adversaries may use brute force techniques to gain access to accounts when passwords are unknown or when password hashes are obtained.',
    tacticIds: ['TA0006'],
    subTechniques: [
      {
        id: 'T1110.001',
        name: 'Password Guessing',
        description: 'Adversaries may use password guessing to attempt access to accounts when passwords are unknown or when password hashes are obtained.',
        tacticIds: ['TA0006']
      },
      {
        id: 'T1110.002',
        name: 'Password Cracking',
        description: 'Adversaries may use password cracking to attempt access to accounts when passwords are unknown or when password hashes are obtained.',
        tacticIds: ['TA0006']
      }
    ],
    detectionMethods: ['Authentication logs', 'Account lockout monitoring', 'Failed login attempts'],
    mitigation: ['M1032', 'M1036'],
    usedBy: ['G0007', 'G0016', 'G0032', 'G0035'],
    platforms: ['Windows', 'macOS', 'Linux', 'Cloud']
  },
  {
    id: 'T1087',
    name: 'Account Discovery',
    description: 'Adversaries may attempt to get a listing of accounts on a system or within an environment.',
    tacticIds: ['TA0007'],
    subTechniques: [
      {
        id: 'T1087.001',
        name: 'Local Account',
        description: 'Adversaries may attempt to get a listing of local accounts on a system.',
        tacticIds: ['TA0007']
      },
      {
        id: 'T1087.002',
        name: 'Domain Account',
        description: 'Adversaries may attempt to get a listing of domain accounts on a system.',
        tacticIds: ['TA0007']
      }
    ],
    detectionMethods: ['Process monitoring', 'Command-line logging', 'PowerShell logging'],
    mitigation: ['M1028', 'M1042'],
    usedBy: ['G0007', 'G0016', 'G0032', 'G0035'],
    platforms: ['Windows', 'macOS', 'Linux']
  },
  {
    id: 'T1021',
    name: 'Remote Services',
    description: 'Adversaries may use valid accounts to log into a service specifically designed to accept remote connections.',
    tacticIds: ['TA0008'],
    subTechniques: [
      {
        id: 'T1021.001',
        name: 'Remote Desktop Protocol',
        description: 'Adversaries may use valid accounts to log into a computer using the Remote Desktop Protocol (RDP).',
        tacticIds: ['TA0008']
      },
      {
        id: 'T1021.002',
        name: 'SMB/Windows Admin Shares',
        description: 'Adversaries may use valid accounts to interact with a remote network share using Server Message Block (SMB).',
        tacticIds: ['TA0008']
      }
    ],
    detectionMethods: ['Authentication logs', 'Network traffic analysis', 'Process monitoring'],
    mitigation: ['M1035', 'M1042'],
    usedBy: ['G0007', 'G0016', 'G0035'],
    platforms: ['Windows', 'macOS', 'Linux']
  },
  {
    id: 'T1056',
    name: 'Input Capture',
    description: 'Adversaries may use methods of capturing user input to obtain credentials or collect information.',
    tacticIds: ['TA0009'],
    subTechniques: [
      {
        id: 'T1056.001',
        name: 'Keylogging',
        description: 'Adversaries may log user keystrokes to intercept credentials as the user types them.',
        tacticIds: ['TA0009']
      }
    ],
    detectionMethods: ['Process monitoring', 'API monitoring', 'Behavior analysis'],
    mitigation: ['M1040', 'M1042'],
    usedBy: ['G0007', 'G0032'],
    platforms: ['Windows', 'macOS', 'Linux']
  },
  {
    id: 'T1048',
    name: 'Exfiltration Over Alternative Protocol',
    description: 'Adversaries may steal data by exfiltrating it over a different protocol than that of the existing command and control channel.',
    tacticIds: ['TA0010'],
    subTechniques: [
      {
        id: 'T1048.001',
        name: 'Exfiltration Over Symmetric Encrypted Non-C2 Protocol',
        description: 'Adversaries may steal data by exfiltrating it over a symmetrically encrypted network protocol other than that of the existing command and control channel.',
        tacticIds: ['TA0010']
      },
      {
        id: 'T1048.002',
        name: 'Exfiltration Over Asymmetric Encrypted Non-C2 Protocol',
        description: 'Adversaries may steal data by exfiltrating it over an asymmetrically encrypted network protocol other than that of the existing command and control channel.',
        tacticIds: ['TA0010']
      }
    ],
    detectionMethods: ['Network traffic analysis', 'Data loss prevention', 'Unusual outbound traffic'],
    mitigation: ['M1031', 'M1037'],
    usedBy: ['G0016', 'G0032'],
    platforms: ['Windows', 'macOS', 'Linux', 'Network']
  },
  {
    id: 'T1071',
    name: 'Application Layer Protocol',
    description: 'Adversaries may communicate using application layer protocols to avoid detection/network filtering by blending in with existing traffic.',
    tacticIds: ['TA0011'],
    subTechniques: [
      {
        id: 'T1071.001',
        name: 'Web Protocols',
        description: 'Adversaries may communicate using application layer protocols associated with web traffic to avoid detection/network filtering by blending in with existing HTTP or HTTPS traffic.',
        tacticIds: ['TA0011']
      },
      {
        id: 'T1071.002',
        name: 'File Transfer Protocols',
        description: 'Adversaries may communicate using application layer protocols associated with transferring files to avoid detection/network filtering by blending in with existing file transfer traffic.',
        tacticIds: ['TA0011']
      }
    ],
    detectionMethods: ['Network traffic analysis', 'SSL/TLS inspection', 'Proxy filtering'],
    mitigation: ['M1031', 'M1037'],
    usedBy: ['G0007', 'G0016', 'G0032', 'G0035'],
    platforms: ['Windows', 'macOS', 'Linux', 'Network']
  },
  {
    id: 'T1485',
    name: 'Data Destruction',
    description: 'Adversaries may destroy data and files on specific systems or in large numbers on a network to interrupt availability to systems, services, and network resources.',
    tacticIds: ['TA0040'],
    subTechniques: [],
    detectionMethods: ['File monitoring', 'Process monitoring', 'Command-line logging'],
    mitigation: ['M1053', 'M1057'],
    usedBy: ['G0016', 'G0035'],
    platforms: ['Windows', 'macOS', 'Linux']
  },
  {
    id: 'T1583',
    name: 'Acquire Infrastructure',
    description: 'Adversaries may buy, lease, or rent infrastructure that can be used during targeting.',
    tacticIds: ['TA0042'],
    subTechniques: [
      {
        id: 'T1583.001',
        name: 'Domains',
        description: 'Adversaries may acquire domains that can be used during targeting.',
        tacticIds: ['TA0042']
      },
      {
        id: 'T1583.002',
        name: 'DNS Server',
        description: 'Adversaries may acquire DNS servers that can be used during targeting.',
        tacticIds: ['TA0042']
      }
    ],
    detectionMethods: ['OSINT monitoring', 'Domain registration monitoring', 'Threat intelligence'],
    mitigation: ['M1036', 'M1051'],
    usedBy: ['G0007', 'G0016', 'G0032'],
    platforms: ['PRE']
  },
  {
    id: 'T1595',
    name: 'Active Scanning',
    description: 'Adversaries may execute active reconnaissance scans to gather information that can be used during targeting.',
    tacticIds: ['TA0043'],
    subTechniques: [
      {
        id: 'T1595.001',
        name: 'Scanning IP Blocks',
        description: 'Adversaries may scan victim IP blocks to gather information that can be used during targeting.',
        tacticIds: ['TA0043']
      },
      {
        id: 'T1595.002',
        name: 'Vulnerability Scanning',
        description: 'Adversaries may scan for vulnerabilities that can be used during targeting.',
        tacticIds: ['TA0043']
      }
    ],
    detectionMethods: ['Network IDS/IPS', 'Firewall logs', 'Honeypots'],
    mitigation: ['M1031', 'M1035'],
    usedBy: ['G0007', 'G0016', 'G0032', 'G0035'],
    platforms: ['PRE']
  }
];

// MITRE ATT&CK Mitigations
const MITIGATIONS = [
  {
    id: 'M1017',
    name: 'User Training',
    description: 'Train users to be aware of access or manipulation attempts by an adversary to reduce the risk of successful social engineering, spearphishing, and other techniques that involve user interaction.',
    techniques: ['T1566']
  },
  {
    id: 'M1026',
    name: 'Privileged Account Management',
    description: 'Manage the creation, modification, use, and permissions associated with privileged accounts, including SYSTEM and root.',
    techniques: ['T1078']
  },
  {
    id: 'M1028',
    name: 'Operating System Configuration',
    description: 'Make configuration changes related to the operating system or a common feature of the operating system that result in system hardening against techniques.',
    techniques: ['T1053', 'T1087']
  },
  {
    id: 'M1031',
    name: 'Network Intrusion Prevention',
    description: 'Use intrusion detection signatures to block traffic at network boundaries.',
    techniques: ['T1048', 'T1071', 'T1595']
  },
  {
    id: 'M1032',
    name: 'Multi-factor Authentication',
    description: 'Use two or more pieces of evidence to authenticate to a system; such as username and password in addition to a token from a physical smart card or token generator.',
    techniques: ['T1078', 'T1110']
  },
  {
    id: 'M1035',
    name: 'Limit Access to Resource Over Network',
    description: 'Prevent access to file shares, remote access to systems, unnecessary services. Mechanisms to limit access may include use of network concentrators, RDP gateways, etc.',
    techniques: ['T1021', 'T1595']
  },
  {
    id: 'M1036',
    name: 'Account Use Policies',
    description: 'Configure features related to account use like login attempt lockouts, specific login times, etc.',
    techniques: ['T1110', 'T1583']
  },
  {
    id: 'M1037',
    name: 'Filter Network Traffic',
    description: 'Use network appliances to filter ingress or egress traffic and perform protocol-based filtering. Configure software on endpoints to filter network traffic.',
    techniques: ['T1048', 'T1071']
  },
  {
    id: 'M1038',
    name: 'Execution Prevention',
    description: 'Block execution of code on a system through application control, and/or script blocking.',
    techniques: ['T1059', 'T1053', 'T1055']
  },
  {
    id: 'M1040',
    name: 'Behavior Prevention on Endpoint',
    description: 'Use capabilities to prevent suspicious behavior patterns from occurring on endpoint systems. This could include suspicious process, API call, or file behavior.',
    techniques: ['T1055', 'T1056']
  },
  {
    id: 'M1042',
    name: 'Disable or Remove Feature or Program',
    description: 'Remove or deny access to unnecessary and potentially vulnerable software to prevent abuse by adversaries.',
    techniques: ['T1059', 'T1087', 'T1021', 'T1056']
  },
  {
    id: 'M1049',
    name: 'Antivirus/Antimalware',
    description: 'Use signatures or heuristics to detect malicious software.',
    techniques: ['T1566']
  },
  {
    id: 'M1050',
    name: 'Exploit Protection',
    description: 'Use capabilities to detect and block conditions that may lead to or be indicative of a software exploit occurring.',
    techniques: ['T1190']
  },
  {
    id: 'M1051',
    name: 'Update Software',
    description: 'Perform regular software updates to mitigate exploitation risk.',
    techniques: ['T1190', 'T1583']
  },
  {
    id: 'M1053',
    name: 'Data Backup',
    description: 'Take and store data backups separately from the primary system or service being protected.',
    techniques: ['T1485']
  },
  {
    id: 'M1057',
    name: 'Data Loss Prevention',
    description: 'Use a data loss prevention (DLP) strategy to categorize sensitive data, identify data formats for sensitive information, and restrict the flow of sensitive data.',
    techniques: ['T1485']
  }
];

// MITRE ATT&CK Groups (Threat Actors)
const GROUPS = [
  {
    id: 'G0007',
    name: 'APT28',
    aliases: ['Fancy Bear', 'Sednit', 'Sofacy', 'Pawn Storm', 'Strontium'],
    description: 'APT28 is a threat group that has been attributed to Russia General Staff Main Intelligence Directorate (GRU) 85th Main Special Service Center (GTsSS) military unit 26165. This group has been active since at least 2004.',
    techniques: ['T1566', 'T1059', 'T1053', 'T1078', 'T1110', 'T1087', 'T1021', 'T1056', 'T1071', 'T1583', 'T1595'],
    software: ['S0001', 'S0002', 'S0004'],
    targetCountries: ['United States', 'NATO countries', 'Ukraine', 'Georgia'],
    targetSectors: ['Government', 'Defense', 'Political organizations', 'Journalists']
  },
  {
    id: 'G0016',
    name: 'APT29',
    aliases: ['Cozy Bear', 'The Dukes', 'CozyDuke', 'YTTRIUM'],
    description: 'APT29 is a threat group that has been attributed to the Russian Foreign Intelligence Service (SVR). This group has been active since at least 2008.',
    techniques: ['T1566', 'T1190', 'T1059', 'T1078', 'T1055', 'T1110', 'T1087', 'T1021', 'T1048', 'T1071', 'T1485', 'T1583', 'T1595'],
    software: ['S0002', 'S0003', 'S0004'],
    targetCountries: ['United States', 'Europe', 'NATO countries'],
    targetSectors: ['Government', 'Defense', 'Think tanks', 'Healthcare']
  },
  {
    id: 'G0032',
    name: 'Lazarus Group',
    aliases: ['HIDDEN COBRA', 'Guardians of Peace', 'ZINC', 'NICKEL ACADEMY'],
    description: 'Lazarus Group is a threat group that has been attributed to North Korea. This group has been active since at least 2009.',
    techniques: ['T1566', 'T1059', 'T1078', 'T1055', 'T1110', 'T1087', 'T1056', 'T1048', 'T1071', 'T1583', 'T1595'],
    software: ['S0001', 'S0003', 'S0005'],
    targetCountries: ['South Korea', 'United States', 'Japan', 'Global'],
    targetSectors: ['Financial', 'Media', 'Entertainment', 'Defense', 'Critical infrastructure']
  },
  {
    id: 'G0035',
    name: 'Dragonfly',
    aliases: ['Energetic Bear', 'Crouching Yeti', 'IRON LIBERTY'],
    description: 'Dragonfly is a threat group that has been active since at least 2011 and has targeted the energy, manufacturing, and other industrial sectors.',
    techniques: ['T1190', 'T1059', 'T1053', 'T1078', 'T1110', 'T1087', 'T1021', 'T1071', 'T1485', 'T1595'],
    software: ['S0001', 'S0005'],
    targetCountries: ['United States', 'Europe', 'Turkey'],
    targetSectors: ['Energy', 'Manufacturing', 'Industrial control systems', 'Critical infrastructure']
  }
];

// MITRE ATT&CK Software (Malware & Tools)
const SOFTWARE = [
  {
    id: 'S0001',
    name: 'Mimikatz',
    type: 'Tool',
    description: 'Mimikatz is a credential dumper capable of obtaining plaintext Windows account logins and passwords, along with many other features that make it useful for testing credential access.',
    techniques: ['T1078', 'T1110', 'T1003'],
    usedBy: ['G0007', 'G0032', 'G0035']
  },
  {
    id: 'S0002',
    name: 'Cobalt Strike',
    type: 'Tool',
    description: 'Cobalt Strike is a commercial, full-featured, penetration testing tool which bills itself as "adversary simulation software designed to execute targeted attacks and emulate the post-exploitation actions of advanced threat actors".',
    techniques: ['T1059', 'T1055', 'T1071', 'T1105'],
    usedBy: ['G0007', 'G0016']
  },
  {
    id: 'S0003',
    name: 'SUNBURST',
    type: 'Malware',
    description: 'SUNBURST is a trojanized version of the SolarWinds Orion business software that contains a backdoor and was used in a supply chain attack.',
    techniques: ['T1195', 'T1059', 'T1078', 'T1071', 'T1027'],
    usedBy: ['G0016', 'G0032']
  },
  {
    id: 'S0004',
    name: 'CHOPSTICK',
    type: 'Malware',
    description: 'CHOPSTICK is a modular backdoor used by APT28 and APT29. It has been used in multiple intrusion operations against defense, government, and private sector targets.',
    techniques: ['T1059', 'T1078', 'T1105', 'T1071', 'T1027'],
    usedBy: ['G0007', 'G0016']
  },
  {
    id: 'S0005',
    name: 'WannaCry',
    type: 'Malware',
    description: 'WannaCry is ransomware that was first seen in a global attack during May 2017, which affected more than 150 countries. It contains worm-like features to spread itself across a network using the SMB protocol.',
    techniques: ['T1190', 'T1486', 'T1083', 'T1021.002', 'T1489'],
    usedBy: ['G0032', 'G0035']
  }
];

// --- Mock API ---

const mockAPI = {
  async getMitreData() {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    return {
      tactics: TACTICS,
      techniques: TECHNIQUES,
      mitigations: MITIGATIONS,
      groups: GROUPS,
      software: SOFTWARE
    };
  },
  
  async searchMitreData(query) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const searchTerm = query.toLowerCase();
    
    const filteredTechniques = TECHNIQUES.filter(technique => 
      technique.name.toLowerCase().includes(searchTerm) || 
      technique.description.toLowerCase().includes(searchTerm) ||
      technique.id.toLowerCase().includes(searchTerm)
    );
    
    const filteredGroups = GROUPS.filter(group => 
      group.name.toLowerCase().includes(searchTerm) || 
      group.description.toLowerCase().includes(searchTerm) ||
      group.id.toLowerCase().includes(searchTerm) ||
      group.aliases.some(alias => alias.toLowerCase().includes(searchTerm))
    );
    
    const filteredSoftware = SOFTWARE.filter(software => 
      software.name.toLowerCase().includes(searchTerm) || 
      software.description.toLowerCase().includes(searchTerm) ||
      software.id.toLowerCase().includes(searchTerm)
    );
    
    return {
      techniques: filteredTechniques,
      groups: filteredGroups,
      software: filteredSoftware
    };
  }
};

// --- Main Hook ---

/**
 * Custom hook for managing MITRE ATT&CK data
 * 
 * This hook provides state management and functions for working with
 * MITRE ATT&CK framework data, including tactics, techniques, mitigations,
 * groups, and software.
 * 
 * @returns {Object} MITRE ATT&CK data and utility functions
 */
export const useMitreAttack = () => {
  // --- State ---
  const [tactics, setTactics] = useState([]);
  const [techniques, setTechniques] = useState([]);
  const [mitigations, setMitigations] = useState([]);
  const [groups, setGroups] = useState([]);
  const [software, setSoftware] = useState([]);
  const [selectedTactic, setSelectedTactic] = useState(null);
  const [selectedTechnique, setSelectedTechnique] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchResults, setSearchResults] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);

  // --- Data Loading ---
  
  // Load all MITRE ATT&CK data
  const loadMitreData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await mockAPI.getMitreData();
      
      setTactics(data.tactics);
      setTechniques(data.techniques);
      setMitigations(data.mitigations);
      setGroups(data.groups);
      setSoftware(data.software);
      
      // Default to first tactic
      if (data.tactics.length > 0 && !selectedTactic) {
        setSelectedTactic(data.tactics[0].id);
      }
      
    } catch (err) {
      console.error('Error loading MITRE ATT&CK data:', err);
      setError('Failed to load MITRE ATT&CK data. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [selectedTactic]);
  
  // Load data on initial mount
  useEffect(() => {
    loadMitreData();
  }, [loadMitreData]);
  
  // --- Derived Data ---
  
  // Get techniques filtered by selected tactic
  const techniquesByTactic = useMemo(() => {
    if (!selectedTactic) return [];
    
    return techniques.filter(technique => 
      technique.tacticIds.includes(selectedTactic)
    );
  }, [techniques, selectedTactic]);
  
  // Get all sub-techniques
  const allSubTechniques = useMemo(() => {
    return techniques.reduce((acc, technique) => {
      if (technique.subTechniques && technique.subTechniques.length > 0) {
        return [...acc, ...technique.subTechniques];
      }
      return acc;
    }, []);
  }, [techniques]);
  
  // Get technique details including related items
  const getEnrichedTechniqueDetails = useCallback((techniqueId) => {
    // Find the main technique or sub-technique
    const technique = techniques.find(t => t.id === techniqueId) || 
                     allSubTechniques.find(st => st.id === techniqueId);
    
    if (!technique) return null;
    
    // Find related mitigations
    const relatedMitigations = mitigations.filter(m => 
      m.techniques.includes(technique.id)
    );
    
    // Find groups using this technique
    const relatedGroups = groups.filter(g => 
      g.techniques.includes(technique.id)
    );
    
    // Find software implementing this technique
    const relatedSoftware = software.filter(s => 
      s.techniques.includes(technique.id)
    );
    
    // Get parent technique if this is a sub-technique
    let parentTechnique = null;
    if (technique.id.includes('.')) {
      const parentId = technique.id.split('.')[0];
      parentTechnique = techniques.find(t => t.id === parentId);
    }
    
    // Get sub-techniques if this is a parent technique
    const subTechniques = technique.subTechniques || [];
    
    return {
      ...technique,
      mitigations: relatedMitigations,
      groups: relatedGroups,
      software: relatedSoftware,
      parentTechnique,
      subTechniques
    };
  }, [techniques, allSubTechniques, mitigations, groups, software]);
  
  // --- Actions ---
  
  // Select a tactic
  const selectTactic = useCallback((tacticId) => {
    setSelectedTactic(tacticId);
    setSelectedTechnique(null);
  }, []);
  
  // Select a technique
  const selectTechnique = useCallback((techniqueId) => {
    setSelectedTechnique(techniqueId);
  }, []);
  
  // Search across all MITRE data
  const searchMitreData = useCallback(async (query) => {
    if (!query || query.trim() === '') {
      setSearchResults(null);
      return;
    }
    
    setSearchLoading(true);
    
    try {
      const results = await mockAPI.searchMitreData(query);
      setSearchResults(results);
    } catch (err) {
      console.error('Error searching MITRE ATT&CK data:', err);
      setError('Failed to search MITRE ATT&CK data. Please try again later.');
    } finally {
      setSearchLoading(false);
    }
  }, []);
  
  // Clear search results
  const clearSearch = useCallback(() => {
    setSearchResults(null);
  }, []);
  
  // Get group details including related items
  const getEnrichedGroupDetails = useCallback((groupId) => {
    const group = groups.find(g => g.id === groupId);
    
    if (!group) return null;
    
    // Find techniques used by this group
    const usedTechniques = techniques.filter(t => 
      group.techniques.includes(t.id)
    );
    
    // Find software used by this group
    const usedSoftware = software.filter(s => 
      group.software.includes(s.id)
    );
    
    return {
      ...group,
      techniques: usedTechniques,
      software: usedSoftware
    };
  }, [groups, techniques, software]);
  
  // Get software details including related items
  const getEnrichedSoftwareDetails = useCallback((softwareId) => {
    const sw = software.find(s => s.id === softwareId);
    
    if (!sw) return null;
    
    // Find techniques implemented by this software
    const implementedTechniques = techniques.filter(t => 
      sw.techniques.includes(t.id)
    );
    
    // Find groups using this software
    const usedByGroups = groups.filter(g => 
      g.software.includes(sw.id)
    );
    
    return {
      ...sw,
      techniques: implementedTechniques,
      groups: usedByGroups
    };
  }, [software, techniques, groups]);

  // --- Return ---
  
  return {
    // State
    tactics,
    techniques,
    mitigations,
    groups,
    software,
    selectedTactic,
    selectedTechnique,
    loading,
    error,
    searchResults,
    searchLoading,
    
    // Derived data
    techniquesByTactic,
    allSubTechniques,
    
    // Actions
    loadMitreData,
    selectTactic,
    selectTechnique,
    searchMitreData,
    clearSearch,
    
    // Detail getters
    getTechniqueDetails: getEnrichedTechniqueDetails,
    getGroupDetails: getEnrichedGroupDetails,
    getSoftwareDetails: getEnrichedSoftwareDetails
  };
};

export default useMitreAttack;
