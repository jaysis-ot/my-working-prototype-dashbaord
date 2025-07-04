import React, { useState, useEffect, useRef } from 'react';
import { Search, Filter, Shield, AlertTriangle, Info, Download, Users, Target, Globe, Building, BarChart3, Grid, TreePine, Activity, Layers, MapPin, Eye, Clock, Zap, Navigation, Network, RefreshCw, Move, Shuffle } from 'lucide-react';

// Enhanced Tooltip Component with better positioning and animations
const Tooltip = ({ children, content, position = 'top', size = 'normal' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const tooltipRef = useRef(null);
  const triggerRef = useRef(null);
  const timeoutRef = useRef(null);

  const handleMouseEnter = (e) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    const rect = e.currentTarget.getBoundingClientRect();
    const scrollX = window.scrollX || window.pageXOffset;
    const scrollY = window.scrollY || window.pageYOffset;
    
    let x = rect.left + scrollX + rect.width / 2;
    let y = rect.top + scrollY - 10;
    
    // Adjust position to keep tooltip on screen
    if (x < 200) x = rect.left + scrollX + rect.width + 10;
    if (x > window.innerWidth - 200) x = rect.left + scrollX - 10;
    if (y < 100) y = rect.bottom + scrollY + 10;
    
    setTooltipPosition({ x, y });
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 100); // Small delay to prevent flickering
  };

  const sizeClasses = {
    small: 'max-w-xs text-xs',
    normal: 'max-w-sm text-sm',
    large: 'max-w-md text-sm',
    xlarge: 'max-w-lg text-sm'
  };

  return (
    <div className="relative">
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="cursor-help transition-all duration-200 hover:scale-105"
      >
        {children}
      </div>
      {isVisible && content && (
        <div
          ref={tooltipRef}
          className={`fixed z-50 px-4 py-3 bg-gray-900 text-white rounded-lg shadow-xl border border-gray-700 
                     animate-in fade-in-0 zoom-in-95 duration-200 ${sizeClasses[size]}`}
          style={{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`,
            transform: 'translate(-50%, -100%)'
          }}
          onMouseEnter={() => {
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
            }
          }}
          onMouseLeave={handleMouseLeave}
        >
          <div className="space-y-2">
            {content}
          </div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  );
};

const MitreAlternativeViews = () => {
  const [activeView, setActiveView] = useState('navigator');
  const [selectedGroups, setSelectedGroups] = useState(['APT1', 'APT28', 'Lazarus']);
  const [selectedSector, setSelectedSector] = useState('all');
  const [selectedNode, setSelectedNode] = useState(null);

  // Same threat data as before with enhanced descriptions
  const threatGroups = [
    {
      id: 'APT1',
      name: 'APT1',
      alias: 'Comment Crew',
      country: 'China',
      motivation: 'Espionage',
      sectors: ['Technology', 'Energy', 'Finance', 'Government'],
      sophistication: 'High',
      firstSeen: '2006',
      description: 'Chinese cyber espionage group targeting intellectual property',
      fullDescription: 'APT1 is one of the most prolific cyber espionage groups, linked to the PLA Unit 61398. They have conducted systematic attacks against 141+ organizations across 20+ industries, primarily targeting intellectual property and sensitive business information. Known for persistent long-term access to victim networks.',
      techniques: ['T1566.001', 'T1059.003', 'T1078', 'T1055', 'T1003.001', 'T1083', 'T1021.001', 'T1005', 'T1041', 'T1547.001'],
      businessImpact: 'High risk to intellectual property, trade secrets, and competitive advantage',
      detectionDifficulty: 'Medium',
      typicalDwellTime: '356 days',
      notableTargets: 'Manufacturing, Legal, Energy, Healthcare, Telecommunications',
      color: '#E74C3C'
    },
    {
      id: 'APT28',
      name: 'APT28',
      alias: 'Fancy Bear',
      country: 'Russia',
      motivation: 'Intelligence',
      sectors: ['Government', 'Military', 'Defense', 'Media'],
      sophistication: 'Very High',
      firstSeen: '2008',
      description: 'Russian military intelligence cyber operations unit',
      fullDescription: 'APT28 is attributed to Russia\'s military intelligence agency (GRU). They conduct sophisticated attacks against government, military, and media organizations worldwide. Known for using zero-day exploits, custom malware, and advanced persistence techniques.',
      techniques: ['T1566.002', 'T1190', 'T1059.001', 'T1068', 'T1070.004', 'T1003.002', 'T1057', 'T1021.004', 'T1567.002', 'T1548.002'],
      businessImpact: 'Critical risk to government contractors, defense industry, and media organizations',
      detectionDifficulty: 'High',
      typicalDwellTime: '146 days',
      notableTargets: 'NATO, Defense contractors, Political organizations, Media outlets',
      color: '#8E44AD'
    },
    {
      id: 'APT29',
      name: 'APT29',
      alias: 'Cozy Bear',
      country: 'Russia',
      motivation: 'Intelligence',
      sectors: ['Government', 'Think Tanks', 'Healthcare', 'Technology'],
      sophistication: 'Very High',
      firstSeen: '2010',
      description: 'Russian foreign intelligence service operations',
      fullDescription: 'APT29 is attributed to Russia\'s foreign intelligence service (SVR). They are known for stealthy, long-term campaigns targeting high-value government and private sector organizations. Masters of living-off-the-land techniques and cloud infrastructure abuse.',
      techniques: ['T1566.001', 'T1203', 'T1547.001', 'T1548.002', 'T1055.001', 'T1110.003', 'T1083', 'T1039', 'T1041', 'T1070.001'],
      businessImpact: 'High risk to government agencies, healthcare research, and technology companies',
      detectionDifficulty: 'Very High',
      typicalDwellTime: '320 days',
      notableTargets: 'Government agencies, COVID-19 vaccine research, Cloud providers',
      color: '#2980B9'
    },
    {
      id: 'Lazarus',
      name: 'Lazarus Group',
      alias: 'Hidden Cobra',
      country: 'North Korea',
      motivation: 'Financial, Espionage',
      sectors: ['Finance', 'Cryptocurrency', 'Entertainment', 'Critical Infrastructure'],
      sophistication: 'High',
      firstSeen: '2009',
      description: 'North Korean state-sponsored group known for financial attacks',
      fullDescription: 'Lazarus Group conducts both financially motivated attacks and espionage operations on behalf of North Korea. They\'re responsible for major incidents including the Sony Pictures breach, WannaCry ransomware, and numerous cryptocurrency exchange hacks worth hundreds of millions.',
      techniques: ['T1566.001', 'T1190', 'T1059.007', 'T1055.001', 'T1070.001', 'T1003.001', 'T1021.001', 'T1005', 'T1486', 'T1053.005'],
      businessImpact: 'Critical risk to financial institutions, cryptocurrency exchanges, and entertainment companies',
      detectionDifficulty: 'Medium',
      typicalDwellTime: '92 days',
      notableTargets: 'Banks, Cryptocurrency exchanges, SWIFT network, Entertainment industry',
      color: '#E67E22'
    },
    {
      id: 'APT40',
      name: 'APT40',
      alias: 'Leviathan',
      country: 'China',
      motivation: 'Espionage',
      sectors: ['Maritime', 'Government', 'Research', 'Technology'],
      sophistication: 'High',
      firstSeen: '2013',
      description: 'Chinese group targeting maritime industries and research',
      fullDescription: 'APT40 conducts cyber espionage operations primarily targeting maritime industries, engineering companies, and research organizations. They have been linked to China\'s Ministry of State Security and focus on acquiring intellectual property and sensitive data.',
      techniques: ['T1566.002', 'T1203', 'T1078', 'T1068', 'T1055.012', 'T1110.003', 'T1083', 'T1021.002', 'T1567.001', 'T1057'],
      businessImpact: 'High risk to maritime, engineering, and research organizations',
      detectionDifficulty: 'Medium',
      typicalDwellTime: '200 days',
      notableTargets: 'Maritime engineering, Government research, Universities',
      color: '#27AE60'
    },
    {
      id: 'FIN7',
      name: 'FIN7',
      alias: 'Carbanak',
      country: 'Unknown',
      motivation: 'Financial',
      sectors: ['Retail', 'Finance', 'Hospitality', 'Healthcare'],
      sophistication: 'High',
      firstSeen: '2015',
      description: 'Financially motivated group targeting payment card data',
      fullDescription: 'FIN7 is a financially motivated threat group that targets US retail, restaurant, and hospitality sectors. They are known for their sophisticated spear-phishing campaigns and use of custom malware to steal millions of payment card records.',
      techniques: ['T1566.001', 'T1059.005', 'T1053.005', 'T1548.002', 'T1070.006', 'T1003.001', 'T1057', 'T1005', 'T1041', 'T1039'],
      businessImpact: 'Critical risk to payment processing, customer data theft',
      detectionDifficulty: 'Medium',
      typicalDwellTime: '180 days',
      notableTargets: 'Point-of-sale systems, Payment processors, Customer databases',
      color: '#F39C12'
    }
  ];

  // Enhanced MITRE ATT&CK Tactics with detailed descriptions
  const tacticsData = {
    'Initial Access': {
      color: '#FF6B6B',
      order: 1,
      description: 'Techniques used to gain initial foothold in a network',
      purpose: 'The adversary is trying to get into your network',
      businessImpact: 'Entry point for all subsequent attack activities',
      commonMethods: ['Phishing emails', 'Exploiting public applications', 'Valid account compromise'],
      detectionOpportunities: ['Email security', 'Web application firewalls', 'Account monitoring'],
      preventionStrategies: ['User awareness training', 'Patch management', 'Multi-factor authentication']
    },
    'Execution': {
      color: '#4ECDC4',
      order: 2,
      description: 'Techniques to run malicious code on local or remote systems',
      purpose: 'The adversary is trying to run malicious code',
      businessImpact: 'Enables malware deployment and system compromise',
      commonMethods: ['PowerShell', 'Command line interfaces', 'Scheduled tasks'],
      detectionOpportunities: ['Process monitoring', 'Command line logging', 'Behavioral analysis'],
      preventionStrategies: ['Application whitelisting', 'Script execution policies', 'Endpoint protection']
    },
    'Persistence': {
      color: '#45B7D1',
      order: 3,
      description: 'Techniques to maintain access across system restarts and changes',
      purpose: 'The adversary is trying to maintain their foothold',
      businessImpact: 'Allows long-term access and repeat compromise',
      commonMethods: ['Registry modifications', 'Scheduled tasks', 'Service creation'],
      detectionOpportunities: ['Registry monitoring', 'Service creation alerts', 'Boot process analysis'],
      preventionStrategies: ['System hardening', 'Privilege restrictions', 'Regular system audits']
    },
    'Privilege Escalation': {
      color: '#96CEB4',
      order: 4,
      description: 'Techniques to gain higher-level permissions on a system',
      purpose: 'The adversary is trying to gain higher-level permissions',
      businessImpact: 'Increases access to sensitive data and critical systems',
      commonMethods: ['Exploiting vulnerabilities', 'Token manipulation', 'Access token theft'],
      detectionOpportunities: ['Privilege escalation alerts', 'Access pattern analysis', 'Token monitoring'],
      preventionStrategies: ['Least privilege principle', 'Regular patching', 'Access controls']
    },
    'Defense Evasion': {
      color: '#FFEAA7',
      order: 5,
      description: 'Techniques to avoid detection throughout their compromise',
      purpose: 'The adversary is trying to avoid being detected',
      businessImpact: 'Prolongs attacker presence and delays incident response',
      commonMethods: ['File deletion', 'Process injection', 'Disabling security tools'],
      detectionOpportunities: ['Anomaly detection', 'Integrity monitoring', 'Security tool alerts'],
      preventionStrategies: ['Multi-layered security', 'Behavioral analysis', 'Security tool hardening']
    },
    'Credential Access': {
      color: '#DDA0DD',
      order: 6,
      description: 'Techniques to steal account names and passwords',
      purpose: 'The adversary is trying to steal account credentials',
      businessImpact: 'Enables lateral movement and privileged access',
      commonMethods: ['Password dumping', 'Keylogging', 'Brute force attacks'],
      detectionOpportunities: ['Authentication monitoring', 'Failed login alerts', 'Memory analysis'],
      preventionStrategies: ['Password policies', 'Multi-factor authentication', 'Credential protection']
    },
    'Discovery': {
      color: '#98D8C8',
      order: 7,
      description: 'Techniques to gain knowledge about the system and network',
      purpose: 'The adversary is trying to figure out your environment',
      businessImpact: 'Reveals valuable targets and attack paths',
      commonMethods: ['Network scanning', 'File discovery', 'System information gathering'],
      detectionOpportunities: ['Network monitoring', 'Process monitoring', 'File access logging'],
      preventionStrategies: ['Network segmentation', 'Access controls', 'Information hiding']
    },
    'Lateral Movement': {
      color: '#F7DC6F',
      order: 8,
      description: 'Techniques to move through your environment',
      purpose: 'The adversary is trying to move through your environment',
      businessImpact: 'Spreads compromise to additional systems and data',
      commonMethods: ['Remote services', 'Internal spearphishing', 'Exploitation of remote services'],
      detectionOpportunities: ['Network traffic analysis', 'Authentication monitoring', 'Anomaly detection'],
      preventionStrategies: ['Network segmentation', 'Least privilege', 'Monitoring internal traffic']
    },
    'Collection': {
      color: '#BB8FCE',
      order: 9,
      description: 'Techniques to gather information of interest to their goal',
      purpose: 'The adversary is trying to gather data of interest',
      businessImpact: 'Identifies and stages valuable data for theft',
      commonMethods: ['Data from local system', 'Screen capture', 'Clipboard data'],
      detectionOpportunities: ['Data access monitoring', 'File access patterns', 'Unusual data queries'],
      preventionStrategies: ['Data classification', 'Access controls', 'Data loss prevention']
    },
    'Exfiltration': {
      color: '#F1948A',
      order: 10,
      description: 'Techniques to steal data from your network',
      purpose: 'The adversary is trying to steal data',
      businessImpact: 'Direct loss of sensitive information and intellectual property',
      commonMethods: ['Exfiltration over C2', 'Exfiltration to cloud storage', 'Physical media'],
      detectionOpportunities: ['Network monitoring', 'Data transfer analysis', 'Cloud usage monitoring'],
      preventionStrategies: ['Data loss prevention', 'Network monitoring', 'Cloud security controls']
    },
    'Impact': {
      color: '#E74C3C',
      order: 11,
      description: 'Techniques to manipulate, interrupt, or destroy systems and data',
      purpose: 'The adversary is trying to manipulate, interrupt, or destroy your systems',
      businessImpact: 'Direct operational damage and business disruption',
      commonMethods: ['Data encryption for impact', 'Service stop', 'Resource hijacking'],
      detectionOpportunities: ['System performance monitoring', 'Service availability alerts', 'Data integrity checks'],
      preventionStrategies: ['Backup and recovery', 'System monitoring', 'Incident response planning']
    }
  };

  const techniques = {
    'T1566.001': { 
      name: 'Spearphishing Attachment', 
      tactic: 'Initial Access', 
      severity: 'High', 
      prevalence: 85, 
      description: 'Adversaries may send spearphishing emails with a malicious attachment',
      fullDescription: 'Spearphishing attachment is a specific variant of spearphishing that employs malicious attachments to conduct attacks. Adversaries attach files to emails to deliver malware or gather credentials.',
      businessImpact: 'Can lead to initial compromise, malware infection, credential theft',
      detectionMethods: ['Email security gateways', 'Attachment sandboxing', 'User reporting'],
      mitigations: ['User awareness training', 'Email filtering', 'Application sandboxing'],
      commonFileTypes: ['.doc', '.pdf', '.zip', '.exe'],
      typicalTargets: 'All industries, particularly those with valuable IP'
    },
    'T1566.002': { 
      name: 'Spearphishing Link', 
      tactic: 'Initial Access', 
      severity: 'High', 
      prevalence: 80, 
      description: 'Adversaries may send spearphishing emails with a malicious link',
      fullDescription: 'Spearphishing with a link is a specific variant of spearphishing that employs trackable links to lead users to malicious websites that steal credentials or deliver malware.',
      businessImpact: 'Credential harvesting, malware delivery, initial access',
      detectionMethods: ['URL reputation', 'Web filtering', 'DNS monitoring'],
      mitigations: ['User training', 'Web filtering', 'DNS security'],
      commonTactics: ['Fake login pages', 'Drive-by downloads', 'Social engineering'],
      typicalTargets: 'High-value individuals, administrators, executives'
    },
    'T1190': { 
      name: 'Exploit Public-Facing Application', 
      tactic: 'Initial Access', 
      severity: 'Critical', 
      prevalence: 70, 
      description: 'Adversaries may attempt to exploit a weakness in an Internet-facing computer',
      fullDescription: 'Adversaries may attempt to take advantage of a weakness in an Internet-facing computer or program using software, data, or commands in order to cause unintended behavior.',
      businessImpact: 'Direct system compromise, data breach, service disruption',
      detectionMethods: ['Web application firewalls', 'IDS/IPS', 'Application monitoring'],
      mitigations: ['Regular patching', 'Web application firewalls', 'Input validation'],
      commonTargets: ['Web servers', 'Database servers', 'Network devices'],
      urgency: 'Immediate patching required for known vulnerabilities'
    },
    'T1059.001': { 
      name: 'PowerShell', 
      tactic: 'Execution', 
      severity: 'High', 
      prevalence: 75, 
      description: 'Adversaries may abuse PowerShell commands and scripts for execution',
      fullDescription: 'PowerShell is a powerful interactive command-line interface and scripting environment that is commonly abused by adversaries for malicious execution.',
      businessImpact: 'System compromise, credential access, lateral movement',
      detectionMethods: ['PowerShell logging', 'Script block logging', 'Command line monitoring'],
      mitigations: ['Constrained Language Mode', 'Execution policy', 'Application whitelisting'],
      commonAbuses: ['Fileless malware', 'Credential dumping', 'Remote execution'],
      businessRecommendations: 'Monitor PowerShell usage, especially by non-administrators'
    },
    'T1059.003': { 
      name: 'Windows Command Shell', 
      tactic: 'Execution', 
      severity: 'Medium', 
      prevalence: 85, 
      description: 'Adversaries may abuse the Windows command shell for execution',
      fullDescription: 'The Windows command shell (cmd.exe) is commonly abused by adversaries to execute commands, navigate file systems, and launch other programs.',
      businessImpact: 'System control, file manipulation, malware execution',
      detectionMethods: ['Command line logging', 'Process monitoring', 'Anomaly detection'],
      mitigations: ['Application restrictions', 'User training', 'Monitoring unusual activity'],
      commonCommands: ['net', 'tasklist', 'whoami', 'systeminfo'],
      businessRecommendations: 'Monitor command line activity for suspicious patterns'
    },
    'T1059.007': { 
      name: 'JavaScript', 
      tactic: 'Execution', 
      severity: 'Medium', 
      prevalence: 65, 
      description: 'Adversaries may abuse JavaScript for execution',
      fullDescription: 'Adversaries may abuse JavaScript for execution of malicious payloads through browser exploitation, malicious documents, or system administration scripts.',
      businessImpact: 'Browser compromise, document-based attacks, system manipulation',
      detectionMethods: ['Browser security', 'Script analysis', 'Sandboxing'],
      mitigations: ['Browser hardening', 'Script blocking', 'User awareness'],
      commonVectors: ['Malicious websites', 'Office documents', 'Email attachments'],
      businessRecommendations: 'Implement strict browser security policies'
    },
    'T1203': { 
      name: 'Exploitation for Client Execution', 
      tactic: 'Execution', 
      severity: 'High', 
      prevalence: 55, 
      description: 'Adversaries may exploit software vulnerabilities in client applications',
      fullDescription: 'Adversaries may exploit software vulnerabilities in client applications to execute code, which can provide them with an initial foothold on a system.',
      businessImpact: 'Initial compromise through common applications',
      detectionMethods: ['Application monitoring', 'Crash analysis', 'Exploit detection'],
      mitigations: ['Regular patching', 'Application hardening', 'Sandboxing'],
      commonTargets: ['Office applications', 'PDF readers', 'Web browsers'],
      businessRecommendations: 'Maintain updated software inventory and patch management'
    },
    'T1078': { 
      name: 'Valid Accounts', 
      tactic: 'Persistence', 
      severity: 'High', 
      prevalence: 70, 
      description: 'Adversaries may obtain and abuse credentials of existing accounts',
      fullDescription: 'Adversaries may obtain and abuse credentials of existing accounts as a means of gaining Initial Access, Persistence, Privilege Escalation, or Defense Evasion.',
      businessImpact: 'Legitimate-appearing access, difficult detection, widespread access',
      detectionMethods: ['Authentication monitoring', 'Behavioral analysis', 'Privilege escalation alerts'],
      mitigations: ['Multi-factor authentication', 'Account monitoring', 'Privilege restrictions'],
      riskFactors: ['Shared accounts', 'Service accounts', 'Privileged accounts'],
      businessRecommendations: 'Implement zero-trust access controls and continuous monitoring'
    },
    'T1547.001': { 
      name: 'Registry Run Keys', 
      tactic: 'Persistence', 
      severity: 'Medium', 
      prevalence: 60, 
      description: 'Adversaries may achieve persistence by adding a program to a startup folder',
      fullDescription: 'Adversaries may achieve persistence by adding a program to a startup folder or referencing it with a Registry run key.',
      businessImpact: 'Persistent malware execution, system compromise across reboots',
      detectionMethods: ['Registry monitoring', 'Startup program analysis', 'System change tracking'],
      mitigations: ['System hardening', 'Registry protection', 'User access controls'],
      commonLocations: ['HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\Run', 'Startup folders'],
      businessRecommendations: 'Monitor and control startup programs and registry modifications'
    },
    'T1068': { 
      name: 'Exploitation for Privilege Escalation', 
      tactic: 'Privilege Escalation', 
      severity: 'High', 
      prevalence: 40, 
      description: 'Adversaries may exploit software vulnerabilities to elevate privileges',
      fullDescription: 'Adversaries may exploit software vulnerabilities in an attempt to elevate privileges, which can provide them with greater access to systems and data.',
      businessImpact: 'Elevated access to sensitive systems and data',
      detectionMethods: ['Privilege escalation monitoring', 'Vulnerability scanning', 'System call monitoring'],
      mitigations: ['Regular patching', 'Least privilege', 'Application sandboxing'],
      highRiskSoftware: ['OS kernels', 'Device drivers', 'System services'],
      businessRecommendations: 'Prioritize patching privilege escalation vulnerabilities'
    },
    'T1548.002': { 
      name: 'Bypass User Account Control', 
      tactic: 'Privilege Escalation', 
      severity: 'Medium', 
      prevalence: 50, 
      description: 'Adversaries may bypass UAC mechanisms to elevate process privileges',
      fullDescription: 'Adversaries may bypass User Account Control (UAC) mechanisms to elevate process privileges on system.',
      businessImpact: 'Privilege escalation without user awareness',
      detectionMethods: ['UAC bypass detection', 'Process monitoring', 'Registry monitoring'],
      mitigations: ['UAC configuration', 'Application restrictions', 'User training'],
      commonMethods: ['DLL hijacking', 'Registry manipulation', 'Token manipulation'],
      businessRecommendations: 'Configure UAC properly and monitor bypass attempts'
    },
    'T1055': { 
      name: 'Process Injection', 
      tactic: 'Defense Evasion', 
      severity: 'High', 
      prevalence: 55, 
      description: 'Adversaries may inject code into processes to evade detection',
      fullDescription: 'Process injection is a method of executing arbitrary code in the address space of a separate live process.',
      businessImpact: 'Stealthy malware execution, detection evasion',
      detectionMethods: ['Process monitoring', 'Memory analysis', 'API call monitoring'],
      mitigations: ['Process protection', 'Application sandboxing', 'Endpoint detection'],
      commonTargets: ['svchost.exe', 'explorer.exe', 'legitimate applications'],
      businessRecommendations: 'Deploy advanced endpoint detection and response solutions'
    },
    'T1055.001': { 
      name: 'Dynamic-link Library Injection', 
      tactic: 'Defense Evasion', 
      severity: 'High', 
      prevalence: 45, 
      description: 'Adversaries may inject dynamic-link libraries (DLLs) into processes',
      fullDescription: 'DLL injection is used by adversaries to execute code within the address space of another process.',
      businessImpact: 'Stealthy code execution, legitimate process abuse',
      detectionMethods: ['DLL monitoring', 'Process hollowing detection', 'Memory scanning'],
      mitigations: ['Process protection', 'DLL validation', 'Application whitelisting'],
      detectionChallenges: 'Legitimate software also uses DLL injection',
      businessRecommendations: 'Monitor for unusual DLL loading patterns'
    },
    'T1070.001': { 
      name: 'Clear Windows Event Logs', 
      tactic: 'Defense Evasion', 
      severity: 'Medium', 
      prevalence: 40, 
      description: 'Adversaries may clear Windows Event Logs to hide activity',
      fullDescription: 'Adversaries may clear Windows Event Logs to hide the activity of an intrusion.',
      businessImpact: 'Loss of forensic evidence, detection evasion',
      detectionMethods: ['Log clearing alerts', 'Log forwarding', 'Backup monitoring'],
      mitigations: ['Log forwarding', 'Log backup', 'Access controls'],
      criticalLogs: ['Security', 'System', 'Application', 'PowerShell'],
      businessRecommendations: 'Implement centralized logging and real-time forwarding'
    },
    'T1070.004': { 
      name: 'File Deletion', 
      tactic: 'Defense Evasion', 
      severity: 'Medium', 
      prevalence: 65, 
      description: 'Adversaries may delete files left behind by their actions',
      fullDescription: 'Adversaries may delete files left behind by the actions of their intrusion activity.',
      businessImpact: 'Evidence destruction, forensic analysis impediment',
      detectionMethods: ['File system monitoring', 'Forensic analysis', 'Backup comparison'],
      mitigations: ['File system auditing', 'Backup systems', 'Write protection'],
      commonTargets: ['Log files', 'Temporary files', 'Tool artifacts'],
      businessRecommendations: 'Monitor file deletion patterns and maintain secure backups'
    },
    'T1003.001': { 
      name: 'LSASS Memory', 
      tactic: 'Credential Access', 
      severity: 'Critical', 
      prevalence: 40, 
      description: 'Adversaries may attempt to access credential material stored in LSASS',
      fullDescription: 'Adversaries may attempt to access credential material stored in the process memory of the Local Security Authority Subsystem Service (LSASS).',
      businessImpact: 'Password theft, widespread credential compromise',
      detectionMethods: ['LSASS protection', 'Memory dumping detection', 'Process monitoring'],
      mitigations: ['Credential Guard', 'LSASS protection', 'Privileged access management'],
      highValueTargets: ['Domain controllers', 'Admin workstations', 'Servers'],
      businessRecommendations: 'Critical priority - implement LSASS protection immediately'
    },
    'T1003.002': { 
      name: 'Security Account Manager', 
      tactic: 'Credential Access', 
      severity: 'High', 
      prevalence: 35, 
      description: 'Adversaries may attempt to extract credential material from the SAM',
      fullDescription: 'Adversaries may attempt to extract credential material from the Security Account Manager (SAM) database.',
      businessImpact: 'Local account credential theft, lateral movement enablement',
      detectionMethods: ['SAM access monitoring', 'Registry monitoring', 'File system monitoring'],
      mitigations: ['SAM protection', 'System hardening', 'Access controls'],
      riskFactors: ['Local admin accounts', 'Shared passwords', 'Legacy systems'],
      businessRecommendations: 'Eliminate local admin accounts where possible'
    },
    'T1110.003': { 
      name: 'Password Spraying', 
      tactic: 'Credential Access', 
      severity: 'Medium', 
      prevalence: 65, 
      description: 'Adversaries may use password spraying to attempt account access',
      fullDescription: 'Password spraying uses one password (e.g. \'Password01\'), or a small list of passwords, that may match the complexity policy against many usernames.',
      businessImpact: 'Account compromise, widespread access attempts',
      detectionMethods: ['Failed login monitoring', 'Authentication analysis', 'Account lockout patterns'],
      mitigations: ['Account lockout policies', 'Strong password policies', 'Multi-factor authentication'],
      commonPasswords: ['Password123', 'Welcome1', 'Spring2024'],
      businessRecommendations: 'Implement strong password policies and MFA'
    },
    'T1057': { 
      name: 'Process Discovery', 
      tactic: 'Discovery', 
      severity: 'Low', 
      prevalence: 90, 
      description: 'Adversaries may attempt to get information about running processes',
      fullDescription: 'Adversaries may attempt to get information about running processes on a system to better understand the software and applications running.',
      businessImpact: 'System reconnaissance, target identification',
      detectionMethods: ['Process monitoring', 'Command line analysis', 'System call monitoring'],
      mitigations: ['Process hiding', 'Access controls', 'Monitoring alerts'],
      commonCommands: ['tasklist', 'ps', 'Get-Process'],
      businessRecommendations: 'Monitor for unusual process enumeration activity'
    },
    'T1083': { 
      name: 'File and Directory Discovery', 
      tactic: 'Discovery', 
      severity: 'Low', 
      prevalence: 95, 
      description: 'Adversaries may enumerate files and directories',
      fullDescription: 'Adversaries may enumerate files and directories to find files of interest and sensitive data prior to Collection.',
      businessImpact: 'Data discovery, sensitive information identification',
      detectionMethods: ['File access monitoring', 'Directory enumeration detection', 'Data classification'],
      mitigations: ['Access controls', 'Data classification', 'File system auditing'],
      sensitiveTargets: ['Documents folder', 'Desktop', 'Network shares'],
      businessRecommendations: 'Classify and protect sensitive data locations'
    },
    'T1021.001': { 
      name: 'Remote Desktop Protocol', 
      tactic: 'Lateral Movement', 
      severity: 'High', 
      prevalence: 60, 
      description: 'Adversaries may use RDP to laterally move to a remote system',
      fullDescription: 'Adversaries may use Valid Accounts to log into a computer using the Remote Desktop Protocol (RDP).',
      businessImpact: 'Lateral movement, remote system access',
      detectionMethods: ['RDP monitoring', 'Authentication logging', 'Network traffic analysis'],
      mitigations: ['Network segmentation', 'VPN requirements', 'Multi-factor authentication'],
      securityConcerns: ['Exposed RDP', 'Weak passwords', 'No MFA'],
      businessRecommendations: 'Secure RDP with VPN, MFA, and monitoring'
    },
    'T1021.004': { 
      name: 'SSH', 
      tactic: 'Lateral Movement', 
      severity: 'Medium', 
      prevalence: 45, 
      description: 'Adversaries may use SSH to laterally move to a remote system',
      fullDescription: 'Adversaries may use SSH to access remote systems and perform lateral movement.',
      businessImpact: 'Remote system access, credential reuse',
      detectionMethods: ['SSH monitoring', 'Key-based authentication', 'Connection analysis'],
      mitigations: ['Key-based authentication', 'Connection restrictions', 'Monitoring'],
      bestPractices: ['Disable password auth', 'Use certificates', 'Monitor connections'],
      businessRecommendations: 'Implement SSH best practices and monitoring'
    },
    'T1005': { 
      name: 'Data from Local System', 
      tactic: 'Collection', 
      severity: 'Medium', 
      prevalence: 80, 
      description: 'Adversaries may search local file systems and remote file shares',
      fullDescription: 'Adversaries may search local system sources, such as file systems and configuration files, to find files of interest.',
      businessImpact: 'Sensitive data collection, intellectual property theft',
      detectionMethods: ['File access monitoring', 'Data loss prevention', 'User behavior analytics'],
      mitigations: ['Data classification', 'Access controls', 'Encryption'],
      highValueTargets: ['Documents', 'Databases', 'Configuration files'],
      businessRecommendations: 'Implement data classification and access monitoring'
    },
    'T1039': { 
      name: 'Data from Network Shared Drive', 
      tactic: 'Collection', 
      severity: 'Medium', 
      prevalence: 70, 
      description: 'Adversaries may search network shares on computers they have compromised',
      fullDescription: 'Adversaries may search network shares on computers they have compromised to find files of interest.',
      businessImpact: 'Network-wide data access, shared resource compromise',
      detectionMethods: ['Share access monitoring', 'File transfer analysis', 'Network monitoring'],
      mitigations: ['Share permissions', 'Access controls', 'Network segmentation'],
      commonTargets: ['File servers', 'Shared folders', 'Backup locations'],
      businessRecommendations: 'Audit and secure network share permissions'
    },
    'T1041': { 
      name: 'Exfiltration Over C2 Channel', 
      tactic: 'Exfiltration', 
      severity: 'High', 
      prevalence: 50, 
      description: 'Adversaries may steal data by exfiltrating it over their existing C2 channel',
      fullDescription: 'Adversaries may steal data by exfiltrating it over an existing command and control channel.',
      businessImpact: 'Data theft using existing malware infrastructure',
      detectionMethods: ['Network traffic analysis', 'Data flow monitoring', 'C2 detection'],
      mitigations: ['Network monitoring', 'Data loss prevention', 'Traffic analysis'],
      detectionChallenges: 'Blends with normal C2 traffic',
      businessRecommendations: 'Deploy network monitoring and DLP solutions'
    },
    'T1567.002': { 
      name: 'Exfiltration to Cloud Storage', 
      tactic: 'Exfiltration', 
      severity: 'Medium', 
      prevalence: 35, 
      description: 'Adversaries may exfiltrate data to a cloud storage service',
      fullDescription: 'Adversaries may exfiltrate data to a cloud storage service rather than over their primary command and control channel.',
      businessImpact: 'Data theft via legitimate cloud services',
      detectionMethods: ['Cloud usage monitoring', 'Upload detection', 'Traffic analysis'],
      mitigations: ['Cloud access controls', 'Upload monitoring', 'DLP policies'],
      commonServices: ['Google Drive', 'Dropbox', 'OneDrive'],
      businessRecommendations: 'Monitor and control cloud service usage'
    },
    'T1486': { 
      name: 'Data Encrypted for Impact', 
      tactic: 'Impact', 
      severity: 'Critical', 
      prevalence: 30, 
      description: 'Adversaries may encrypt data on target systems to interrupt availability',
      fullDescription: 'Adversaries may encrypt data on target systems or on large numbers of systems in a network to interrupt availability to system and network resources.',
      businessImpact: 'Ransomware, business disruption, data unavailability',
      detectionMethods: ['File change monitoring', 'Encryption detection', 'Behavioral analysis'],
      mitigations: ['Backup systems', 'File monitoring', 'Endpoint protection'],
      businessContinuity: ['Offline backups', 'Incident response', 'Recovery procedures'],
      businessRecommendations: 'Critical - implement comprehensive backup and recovery plans'
    }
  };

  const tactics = Object.keys(tacticsData);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'Critical': return '#E74C3C';
      case 'High': return '#E67E22';
      case 'Medium': return '#F39C12';
      case 'Low': return '#27AE60';
      default: return '#95A5A6';
    }
  };

  const getTacticColor = (tactic) => {
    return tacticsData[tactic]?.color || '#95A5A6';
  };

  // Helper function to create enhanced threat group tooltip content
  const createGroupTooltip = (group) => (
    <div className="space-y-3 max-w-md">
      <div className="border-b border-gray-700 pb-2">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-full" style={{backgroundColor: group.color}}></div>
          <div className="font-bold text-white text-lg">{group.name}</div>
        </div>
        <div className="text-gray-300 text-sm">{group.alias} • {group.country}</div>
        <div className="text-gray-400 text-xs mt-1">{group.motivation} • Active since {group.firstSeen}</div>
      </div>
      
      <div className="space-y-2">
        <div>
          <div className="text-yellow-400 font-medium text-sm">📖 Overview</div>
          <div className="text-gray-200 text-sm leading-relaxed">{group.fullDescription}</div>
        </div>
        
        <div>
          <div className="text-red-400 font-medium text-sm">⚠️ Business Risk</div>
          <div className="text-gray-200 text-sm">{group.businessImpact}</div>
        </div>
        
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <div className="text-blue-400 font-medium">🎯 Notable Targets</div>
            <div className="text-gray-300">{group.notableTargets}</div>
          </div>
          <div>
            <div className="text-orange-400 font-medium">⏱️ Avg. Dwell Time</div>
            <div className="text-gray-300">{group.typicalDwellTime}</div>
          </div>
        </div>
        
        <div>
          <div className="text-purple-400 font-medium text-sm">🏭 Target Industries</div>
          <div className="flex flex-wrap gap-1 mt-1">
            {group.sectors.map(sector => (
              <span key={sector} className="px-2 py-1 bg-gray-700 text-gray-200 text-xs rounded">
                {sector}
              </span>
            ))}
          </div>
        </div>
        
        <div className="bg-gray-800 rounded p-2 mt-3">
          <div className="text-green-400 font-medium text-xs mb-1">🛡️ Defense Priority</div>
          <div className="text-gray-300 text-xs">
            <strong>Sophistication:</strong> {group.sophistication} | 
            <strong> Detection:</strong> {group.detectionDifficulty} | 
            <strong> TTPs:</strong> {group.techniques.length}
          </div>
        </div>
      </div>
    </div>
  );

  // Helper function to create enhanced tactic tooltip content
  const createTacticTooltip = (tacticName) => {
    const tactic = tacticsData[tacticName];
    if (!tactic) return null;
    
    return (
      <div className="space-y-3 max-w-lg">
        <div className="border-b border-gray-700 pb-2">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded" style={{backgroundColor: tactic.color}}></div>
            <div className="font-bold text-white text-lg">{tacticName}</div>
          </div>
          <div className="text-gray-300 text-sm italic">"{tactic.purpose}"</div>
        </div>
        
        <div className="space-y-2">
          <div>
            <div className="text-yellow-400 font-medium text-sm">📖 What This Means</div>
            <div className="text-gray-200 text-sm leading-relaxed">{tactic.description}</div>
          </div>
          
          <div>
            <div className="text-red-400 font-medium text-sm">💼 Business Impact</div>
            <div className="text-gray-200 text-sm">{tactic.businessImpact}</div>
          </div>
          
          <div>
            <div className="text-orange-400 font-medium text-sm">🎯 Common Attack Methods</div>
            <div className="text-gray-300 text-sm">
              {tactic.commonMethods.map((method, index) => (
                <div key={index} className="flex items-start space-x-1">
                  <span className="text-orange-400">•</span>
                  <span>{method}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-green-400 font-medium text-sm">🔍 Detection</div>
              <div className="text-gray-300 text-xs space-y-1">
                {tactic.detectionOpportunities.map((detection, index) => (
                  <div key={index} className="flex items-start space-x-1">
                    <span className="text-green-400">✓</span>
                    <span>{detection}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="text-blue-400 font-medium text-sm">🛡️ Prevention</div>
              <div className="text-gray-300 text-xs space-y-1">
                {tactic.preventionStrategies.map((prevention, index) => (
                  <div key={index} className="flex items-start space-x-1">
                    <span className="text-blue-400">⚡</span>
                    <span>{prevention}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Helper function to create enhanced technique tooltip content
  const createTechniqueTooltip = (techId, additionalInfo = {}) => {
    const tech = techniques[techId];
    if (!tech) return null;
    
    return (
      <div className="space-y-3 max-w-lg">
        <div className="border-b border-gray-700 pb-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-bold text-white text-lg">{tech.name}</div>
              <div className="text-gray-300 text-sm">{techId} • {tech.tactic}</div>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 text-xs font-bold rounded ${
                tech.severity === 'Critical' ? 'bg-red-600 text-white' :
                tech.severity === 'High' ? 'bg-orange-600 text-white' :
                tech.severity === 'Medium' ? 'bg-yellow-600 text-white' :
                'bg-green-600 text-white'
              }`}>
                {tech.severity}
              </span>
              <div className="text-right">
                <div className="text-white font-bold text-sm">{tech.prevalence}%</div>
                <div className="text-gray-400 text-xs">prevalence</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div>
            <div className="text-yellow-400 font-medium text-sm">📖 Technical Details</div>
            <div className="text-gray-200 text-sm leading-relaxed">{tech.fullDescription}</div>
          </div>
          
          <div>
            <div className="text-red-400 font-medium text-sm">💼 Business Impact</div>
            <div className="text-gray-200 text-sm">{tech.businessImpact}</div>
          </div>
          
          {tech.commonTargets && (
            <div>
              <div className="text-orange-400 font-medium text-sm">🎯 Common Targets</div>
              <div className="text-gray-300 text-sm">
                {Array.isArray(tech.commonTargets) ? tech.commonTargets.join(', ') : tech.commonTargets}
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-green-400 font-medium text-sm">🔍 Detection Methods</div>
              <div className="text-gray-300 text-xs space-y-1">
                {tech.detectionMethods?.slice(0, 3).map((method, index) => (
                  <div key={index} className="flex items-start space-x-1">
                    <span className="text-green-400">✓</span>
                    <span>{method}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="text-blue-400 font-medium text-sm">🛡️ Mitigations</div>
              <div className="text-gray-300 text-xs space-y-1">
                {tech.mitigations?.slice(0, 3).map((mitigation, index) => (
                  <div key={index} className="flex items-start space-x-1">
                    <span className="text-blue-400">⚡</span>
                    <span>{mitigation}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {additionalInfo.usedBy && (
            <div>
              <div className="text-purple-400 font-medium text-sm">👥 Used By</div>
              <div className="text-gray-300 text-sm">{additionalInfo.usedBy.join(', ')}</div>
            </div>
          )}
          
          {tech.businessRecommendations && (
            <div className="bg-gray-800 rounded p-2 mt-3">
              <div className="text-yellow-400 font-medium text-xs mb-1">💡 Recommendation</div>
              <div className="text-gray-200 text-xs leading-relaxed">{tech.businessRecommendations}</div>
            </div>
          )}
          
          {(tech.urgency || tech.detectionChallenges) && (
            <div className="bg-red-900 bg-opacity-30 rounded p-2 border border-red-700">
              <div className="text-red-400 font-medium text-xs mb-1">⚠️ Important Notes</div>
              <div className="text-gray-200 text-xs">
                {tech.urgency && <div>• {tech.urgency}</div>}
                {tech.detectionChallenges && <div>• {tech.detectionChallenges}</div>}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Cytoscape.js Network Component with manual movement and auto-arrange
  const CytoscapeComponent = ({ elements, layout, onNodeClick, style, selectedGroups, onLayoutChange }) => {
    const cyRef = useRef(null);
    const cyInstance = useRef(null);

    useEffect(() => {
      // Load Cytoscape from CDN
      if (typeof window !== 'undefined' && !window.cytoscape) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/cytoscape/3.26.0/cytoscape.min.js';
        script.onload = () => initializeCytoscape();
        document.head.appendChild(script);
      } else if (window.cytoscape) {
        initializeCytoscape();
      }
    }, []);

    useEffect(() => {
      if (cyInstance.current) {
        updateGraph();
      }
    }, [elements, selectedGroups]);

    useEffect(() => {
      if (cyInstance.current && layout) {
        runLayout(layout);
      }
    }, [layout]);

    const initializeCytoscape = () => {
      if (!cyRef.current || !window.cytoscape) return;

      cyInstance.current = window.cytoscape({
        container: cyRef.current,
        elements: elements,
        style: [
          {
            selector: 'node[type="group"]',
            style: {
              'background-color': 'data(color)',
              'label': 'data(label)',
              'width': '60px',
              'height': '60px',
              'text-valign': 'bottom',
              'text-halign': 'center',
              'font-size': '10px',
              'font-weight': 'bold',
              'color': '#333',
              'text-outline-width': 1,
              'text-outline-color': '#fff',
              'border-width': 3,
              'border-color': '#333',
              'shape': 'hexagon'
            }
          },
          {
            selector: 'node[type="technique"]',
            style: {
              'background-color': 'data(color)',
              'label': 'data(label)',
              'width': 'data(size)',
              'height': 'data(size)',
              'text-valign': 'center',
              'text-halign': 'center',
              'font-size': '8px',
              'font-weight': 'bold',
              'color': '#fff',
              'text-outline-width': 1,
              'text-outline-color': 'data(color)',
              'border-width': 2,
              'border-color': '#333',
              'text-wrap': 'wrap',
              'text-max-width': '60px',
              'shape': 'ellipse'
            }
          },
          {
            selector: 'node[type="tactic"]',
            style: {
              'background-color': 'data(color)',
              'label': 'data(label)',
              'width': '80px',
              'height': '40px',
              'text-valign': 'center',
              'text-halign': 'center',
              'font-size': '9px',
              'font-weight': 'bold',
              'color': '#fff',
              'text-outline-width': 1,
              'text-outline-color': 'data(color)',
              'border-width': 2,
              'border-color': '#333',
              'shape': 'rectangle'
            }
          },
          {
            selector: 'edge',
            style: {
              'width': 'data(strength)',
              'line-color': 'data(color)',
              'target-arrow-color': 'data(color)',
              'target-arrow-shape': 'triangle',
              'curve-style': 'bezier',
              'opacity': 0.6
            }
          },
          {
            selector: 'node:selected',
            style: {
              'border-width': 4,
              'border-color': '#FFD700'
            }
          },
          {
            selector: '.highlighted',
            style: {
              'opacity': 1,
              'border-width': 3,
              'border-color': '#FFD700'
            }
          },
          {
            selector: '.dimmed',
            style: {
              'opacity': 0.3
            }
          },
          {
            selector: 'node:grabbed',
            style: {
              'border-width': 4,
              'border-color': '#2563eb',
              'opacity': 0.8
            }
          }
        ],
        layout: layout,
        zoomingEnabled: true,
        userZoomingEnabled: true,
        panningEnabled: true,
        userPanningEnabled: true,
        boxSelectionEnabled: true,
        selectionType: 'single',
        touchTapThreshold: 8,
        desktopTapThreshold: 4,
        // Enable manual movement
        autoungrabify: false,
        autounselectify: false
      });

      // Add event listeners
      cyInstance.current.on('tap', 'node', (evt) => {
        const node = evt.target;
        onNodeClick(node.data());
      });

      // Add drag feedback
      cyInstance.current.on('grab', 'node', (evt) => {
        const node = evt.target;
        node.addClass('grabbed');
      });

      cyInstance.current.on('free', 'node', (evt) => {
        const node = evt.target;
        node.removeClass('grabbed');
      });
    };

    const updateGraph = () => {
      if (!cyInstance.current) return;

      cyInstance.current.elements().remove();
      cyInstance.current.add(elements);
      cyInstance.current.layout(layout).run();
    };

    const runLayout = (layoutConfig) => {
      if (!cyInstance.current) return;
      
      const layoutInstance = cyInstance.current.layout(layoutConfig);
      layoutInstance.run();
    };

    // Expose layout function to parent
    useEffect(() => {
      if (onLayoutChange && cyInstance.current) {
        onLayoutChange((layoutConfig) => runLayout(layoutConfig));
      }
    }, [onLayoutChange]);

    return <div ref={cyRef} style={{ width: '100%', height: '100%', ...style }} />;
  };

  // Network View using Cytoscape with manual movement and auto-arrange
  const NetworkView = () => {
    const [viewMode, setViewMode] = useState('full'); // 'full', 'tactics', 'techniques'
    const [showGroupsOnly, setShowGroupsOnly] = useState(false);
    const [currentLayout, setCurrentLayout] = useState('cose');
    const [layoutFunction, setLayoutFunction] = useState(null);
    
    const selectedGroupsData = threatGroups.filter(g => selectedGroups.includes(g.id));

    // Available layout options
    const layoutOptions = {
      cose: {
        name: 'cose',
        animate: true,
        animationDuration: 1000,
        nodeRepulsion: 4000,
        nodeOverlap: 20,
        idealEdgeLength: 100,
        edgeElasticity: 100,
        nestingFactor: 5,
        gravity: 80,
        numIter: 1000,
        initialTemp: 200,
        coolingFactor: 0.95,
        minTemp: 1.0
      },
      grid: {
        name: 'grid',
        animate: true,
        animationDuration: 1000,
        fit: true,
        padding: 20,
        rows: undefined,
        cols: undefined
      },
      circle: {
        name: 'circle',
        animate: true,
        animationDuration: 1000,
        fit: true,
        padding: 20,
        radius: undefined,
        startAngle: 3 / 2 * Math.PI,
        sweep: undefined,
        clockwise: true
      },
      concentric: {
        name: 'concentric',
        animate: true,
        animationDuration: 1000,
        fit: true,
        padding: 20,
        startAngle: 3 / 2 * Math.PI,
        sweep: undefined,
        clockwise: true,
        equidistant: false,
        minNodeSpacing: 10,
        concentric: function(node) {
          return node.data('type') === 'group' ? 3 : node.data('type') === 'tactic' ? 2 : 1;
        },
        levelWidth: function(nodes) {
          return 2;
        }
      },
      breadthfirst: {
        name: 'breadthfirst',
        animate: true,
        animationDuration: 1000,
        fit: true,
        padding: 20,
        directed: false,
        spacingFactor: 1.75,
        maximal: false
      },
      random: {
        name: 'random',
        animate: true,
        animationDuration: 1000,
        fit: true,
        padding: 20
      }
    };

    const getVisualizationElements = () => {
      const filteredGroups = selectedGroupsData;
      
      if (filteredGroups.length === 0) return [];

      const elements = [];
      const usedTechniques = new Set();
      const usedTactics = new Set();
      const tacticTechniques = {};

      // Add group nodes
      if (!showGroupsOnly) {
        filteredGroups.forEach(group => {
          elements.push({
            data: {
              id: group.id,
              label: group.name,
              type: 'group',
              color: group.color,
              country: group.country,
              motivation: group.motivation,
              sectors: group.sectors,
              sophistication: group.sophistication,
              description: group.fullDescription || group.description,
              businessImpact: group.businessImpact,
              detectionDifficulty: group.detectionDifficulty,
              typicalDwellTime: group.typicalDwellTime,
              notableTargets: group.notableTargets
            }
          });
        });
      }

      // Collect all techniques used by selected groups
      filteredGroups.forEach(group => {
        group.techniques.forEach(techId => {
          if (techniques[techId]) {
            usedTechniques.add(techId);
            const tech = techniques[techId];
            const tactic = tech.tactic;
            usedTactics.add(tactic);
            
            if (!tacticTechniques[tactic]) {
              tacticTechniques[tactic] = [];
            }
            tacticTechniques[tactic].push(techId);
          }
        });
      });

      // Add tactic nodes
      if (viewMode === 'full' || viewMode === 'tactics') {
        Array.from(usedTactics).forEach(tactic => {
          elements.push({
            data: {
              id: `tactic-${tactic}`,
              label: tactic,
              type: 'tactic',
              color: tacticsData[tactic]?.color || '#666',
              order: tacticsData[tactic]?.order || 99,
              purpose: tacticsData[tactic]?.purpose,
              description: tacticsData[tactic]?.description,
              businessImpact: tacticsData[tactic]?.businessImpact,
              commonMethods: tacticsData[tactic]?.commonMethods,
              detectionOpportunities: tacticsData[tactic]?.detectionOpportunities,
              preventionStrategies: tacticsData[tactic]?.preventionStrategies
            }
          });
        });
      }

      // Add technique nodes
      if (viewMode === 'full' || viewMode === 'techniques') {
        Array.from(usedTechniques).forEach(techId => {
          const tech = techniques[techId];
          const size = 25 + (tech.prevalence / 100) * 15;
          
          elements.push({
            data: {
              id: techId,
              label: tech.name,
              type: 'technique',
              color: getSeverityColor(tech.severity),
              size: size,
              tactic: tech.tactic,
              severity: tech.severity,
              prevalence: tech.prevalence,
              description: tech.fullDescription || tech.description,
              businessImpact: tech.businessImpact,
              detectionMethods: tech.detectionMethods,
              mitigations: tech.mitigations,
              businessRecommendations: tech.businessRecommendations,
              usedBy: filteredGroups.filter(g => g.techniques.includes(techId)).map(g => g.name)
            }
          });
        });
      }

      // Add edges
      filteredGroups.forEach(group => {
        group.techniques.forEach(techId => {
          if (techniques[techId] && !showGroupsOnly) {
            // Group to technique edges
            if (viewMode === 'full' || viewMode === 'techniques') {
              elements.push({
                data: {
                  id: `${group.id}-${techId}`,
                  source: group.id,
                  target: techId,
                  strength: 2,
                  color: group.color
                }
              });
            }

            // Tactic to technique edges
            if (viewMode === 'full') {
              const tech = techniques[techId];
              elements.push({
                data: {
                  id: `tactic-${tech.tactic}-${techId}`,
                  source: `tactic-${tech.tactic}`,
                  target: techId,
                  strength: 1,
                  color: '#999'
                }
              });
            }

            // Group to tactic edges
            if (viewMode === 'tactics') {
              const tech = techniques[techId];
              elements.push({
                data: {
                  id: `${group.id}-tactic-${tech.tactic}`,
                  source: group.id,
                  target: `tactic-${tech.tactic}`,
                  strength: 2,
                  color: group.color
                }
              });
            }
          }
        });
      });

      return elements;
    };

    const handleNodeClick = (nodeData) => {
      setSelectedNode(nodeData);
    };

    const handleLayoutChange = (newLayout) => {
      setCurrentLayout(newLayout);
      if (layoutFunction) {
        layoutFunction(layoutOptions[newLayout]);
      }
    };

    const autoArrange = () => {
      if (layoutFunction) {
        layoutFunction(layoutOptions[currentLayout]);
      }
    };

    return (
      <div className="space-y-4">
        {/* Network Controls */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Network Visualization</h3>
              <p className="text-sm text-gray-600">Interactive network • Drag nodes to reposition • Click auto-arrange for clean layout</p>
            </div>
            <div className="flex items-center space-x-4">
              {/* View Mode Controls */}
              <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('full')}
                  className={`px-3 py-1 text-xs rounded ${viewMode === 'full' ? 'bg-white shadow text-blue-600' : 'text-gray-600'}`}
                >
                  Full View
                </button>
                <button
                  onClick={() => setViewMode('tactics')}
                  className={`px-3 py-1 text-xs rounded ${viewMode === 'tactics' ? 'bg-white shadow text-blue-600' : 'text-gray-600'}`}
                >
                  Tactics
                </button>
                <button
                  onClick={() => setViewMode('techniques')}
                  className={`px-3 py-1 text-xs rounded ${viewMode === 'techniques' ? 'bg-white shadow text-blue-600' : 'text-gray-600'}`}
                >
                  Techniques
                </button>
              </div>

              {/* Layout Controls */}
              <div className="flex items-center space-x-2">
                <select
                  value={currentLayout}
                  onChange={(e) => handleLayoutChange(e.target.value)}
                  className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="cose">Smart Layout</option>
                  <option value="grid">Grid Layout</option>
                  <option value="circle">Circle Layout</option>
                  <option value="concentric">Concentric Layout</option>
                  <option value="breadthfirst">Hierarchical Layout</option>
                  <option value="random">Random Layout</option>
                </select>
                
                <button
                  onClick={autoArrange}
                  className="flex items-center px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                  title="Auto-arrange layout"
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Auto-Arrange
                </button>
              </div>

              <div className="flex items-center space-x-2 text-sm text-blue-600">
                <Move className="h-4 w-4" />
                <span>Drag nodes • Click for details</span>
              </div>
            </div>
          </div>

          {/* Legend and Instructions */}
          <div className="flex items-center justify-between text-sm border-t pt-3">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-500" style={{clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'}}></div>
                <span className="text-gray-700">Threat Groups</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-2 bg-green-500"></div>
                <span className="text-gray-700">Tactics</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                <span className="text-gray-700">Techniques</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                <span className="text-gray-700">Critical</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                <span className="text-gray-700">High</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                <span className="text-gray-700">Medium</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <span className="text-gray-700">Low</span>
              </div>
            </div>
          </div>
        </div>

        {/* Network Visualization */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Interactive Network - {viewMode.charAt(0).toUpperCase() + viewMode.slice(1)} View
              </h2>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Shuffle className="h-4 w-4" />
                  <span>Layout: {currentLayout.charAt(0).toUpperCase() + currentLayout.slice(1)}</span>
                </div>
                <span>|</span>
                <span>
                  {viewMode === 'full' ? 'Hexagon: Groups • Rectangle: Tactics • Circle: Techniques' :
                   viewMode === 'tactics' ? 'Hexagon: Groups • Rectangle: Tactics' :
                   'Hexagon: Groups • Circle: Techniques'}
                </span>
              </div>
            </div>
          </div>
          <div className="p-4">
            <div className="h-96 border border-gray-200 rounded-md relative">
              <CytoscapeComponent
                elements={getVisualizationElements()}
                layout={layoutOptions[currentLayout]}
                onNodeClick={handleNodeClick}
                selectedGroups={selectedGroups}
                onLayoutChange={setLayoutFunction}
              />
              
              {/* Floating instruction */}
              <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                Drag nodes to reposition • Use auto-arrange to clean up
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // MITRE ATT&CK Navigator View - Full Matrix Coverage
  const NavigatorView = () => {
    const selectedGroupsData = threatGroups.filter(g => selectedGroups.includes(g.id));
    const allSelectedTechniques = [...new Set(selectedGroupsData.flatMap(g => g.techniques))];
    
    // Organize techniques by tactic for matrix display
    const techniquesByTactic = tactics.reduce((acc, tactic) => {
      acc[tactic] = Object.entries(techniques)
        .filter(([_, tech]) => tech.tactic === tactic)
        .map(([id, tech]) => ({
          id,
          ...tech,
          isUsed: allSelectedTechniques.includes(id),
          usedByGroups: selectedGroupsData.filter(g => g.techniques.includes(id))
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
      return acc;
    }, {});

    const getTechniqueColor = (technique) => {
      if (!technique.isUsed) return '#f8f9fa';
      
      const groupColors = technique.usedByGroups.map(g => g.color);
      if (groupColors.length === 1) return groupColors[0];
      if (groupColors.length > 1) return '#6366f1'; // Mixed/multiple groups
      return '#f8f9fa';
    };

    const getTechniqueOpacity = (technique) => {
      if (!technique.isUsed) return 0.3;
      return technique.usedByGroups.length > 1 ? 0.9 : 0.8;
    };

    return (
      <div className="space-y-4">
        {/* Navigator Header */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">MITRE ATT&CK Navigator</h3>
              <p className="text-sm text-gray-600">Complete technique coverage matrix • Colored cells show techniques used by selected groups</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                <span className="font-medium">{allSelectedTechniques.length}</span> of {Object.keys(techniques).length} techniques covered
              </div>
              <div className="flex items-center space-x-2 text-sm text-blue-600">
                <Eye className="h-4 w-4" />
                <span>Hover for detailed intelligence</span>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gray-200 rounded border"></div>
              <span className="text-gray-600">Not used by selected groups</span>
            </div>
            {selectedGroupsData.map(group => (
              <div key={group.id} className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded border" style={{backgroundColor: group.color}}></div>
                <span className="text-gray-600">{group.name}</span>
              </div>
            ))}
            {selectedGroupsData.length > 1 && (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-indigo-500 rounded border"></div>
                <span className="text-gray-600">Multiple groups</span>
              </div>
            )}
          </div>
        </div>

        {/* Navigator Matrix */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <div className="inline-flex min-w-full">
              {tactics.map(tactic => (
                <div key={tactic} className="flex-shrink-0 w-64 border-r border-gray-200 last:border-r-0">
                  {/* Tactic Header */}
                  <Tooltip 
                    content={createTacticTooltip(tactic)}
                    size="large"
                  >
                    <div 
                      className="p-3 text-center font-semibold text-white text-sm cursor-help hover:opacity-80 transition-opacity"
                      style={{backgroundColor: getTacticColor(tactic)}}
                    >
                      <div className="mb-1">{tactic}</div>
                      <div className="text-xs opacity-90">
                        {techniquesByTactic[tactic]?.length || 0} techniques
                      </div>
                      <div className="text-xs opacity-75">
                        {techniquesByTactic[tactic]?.filter(t => t.isUsed).length || 0} covered
                      </div>
                    </div>
                  </Tooltip>

                  {/* Techniques in this tactic */}
                  <div className="max-h-96 overflow-y-auto">
                    {techniquesByTactic[tactic]?.map(technique => (
                      <Tooltip 
                        key={technique.id}
                        content={createTechniqueTooltip(technique.id, {
                          usedBy: technique.usedByGroups.map(g => g.name),
                          coverage: technique.isUsed ? 'Used by selected groups' : 'Not used by selected groups'
                        })}
                        size="large"
                      >
                        <div 
                          className="p-2 border-b border-gray-100 cursor-help hover:shadow-md transition-all duration-200"
                          style={{
                            backgroundColor: getTechniqueColor(technique),
                            opacity: getTechniqueOpacity(technique)
                          }}
                          onClick={() => setSelectedNode({
                            type: 'technique',
                            ...technique
                          })}
                        >
                          <div className="space-y-1">
                            <div className="text-xs font-medium text-gray-900 leading-tight">
                              {technique.name}
                            </div>
                            <div className="text-xs text-gray-600">
                              {technique.id}
                            </div>
                            <div className="flex items-center justify-between">
                              <span className={`text-xs px-2 py-1 rounded ${
                                technique.severity === 'Critical' ? 'bg-red-100 text-red-700' :
                                technique.severity === 'High' ? 'bg-orange-100 text-orange-700' :
                                technique.severity === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-green-100 text-green-700'
                              }`}>
                                {technique.severity}
                              </span>
                              {technique.isUsed && (
                                <div className="flex space-x-1">
                                  {technique.usedByGroups.map(group => (
                                    <div 
                                      key={group.id}
                                      className="w-2 h-2 rounded-full"
                                      style={{backgroundColor: group.color}}
                                      title={group.name}
                                    ></div>
                                  ))}
                                </div>
                              )}
                            </div>
                            {technique.isUsed && (
                              <div className="text-xs text-gray-500">
                                Used by: {technique.usedByGroups.map(g => g.name).join(', ')}
                              </div>
                            )}
                          </div>
                        </div>
                      </Tooltip>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Coverage Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-blue-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Technique Coverage</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {((allSelectedTechniques.length / Object.keys(techniques).length) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-green-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Tactics Covered</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {tactics.filter(tactic => 
                    techniquesByTactic[tactic]?.some(t => t.isUsed)
                  ).length} / {tactics.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-orange-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">High/Critical Techniques</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {allSelectedTechniques.filter(techId => 
                    ['Critical', 'High'].includes(techniques[techId]?.severity)
                  ).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tactic Coverage Breakdown */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold">Coverage by Tactic</h3>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tactics.map(tactic => {
                const tacticTechniques = techniquesByTactic[tactic] || [];
                const coveredTechniques = tacticTechniques.filter(t => t.isUsed);
                const coveragePercentage = tacticTechniques.length > 0 
                  ? (coveredTechniques.length / tacticTechniques.length) * 100 
                  : 0;

                return (
                  <Tooltip 
                    key={tactic}
                    content={createTacticTooltip(tactic)}
                    size="normal"
                  >
                    <div className="border rounded-lg p-3 cursor-help hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm text-gray-900">{tactic}</h4>
                        <div 
                          className="w-4 h-4 rounded"
                          style={{backgroundColor: getTacticColor(tactic)}}
                        ></div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600">Coverage:</span>
                          <span className="font-medium">{coveragePercentage.toFixed(0)}%</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600">Techniques:</span>
                          <span className="font-medium">{coveredTechniques.length} / {tacticTechniques.length}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full"
                            style={{
                              backgroundColor: getTacticColor(tactic),
                              width: `${coveragePercentage}%`
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </Tooltip>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Matrix/Heatmap View
  const MatrixView = () => {
    const selectedGroupsData = threatGroups.filter(g => selectedGroups.includes(g.id));
    const allTechniques = [...new Set(selectedGroupsData.flatMap(g => g.techniques))];
    
    return (
      <div className="space-y-4">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold">Threat Group vs Tactic Matrix</h3>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">Color intensity shows technique count per tactic</p>
              <div className="flex items-center space-x-2 text-sm text-blue-600">
                <Eye className="h-4 w-4" />
                <span>Hover for detailed information</span>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Threat Group</th>
                  {tactics.map(tactic => (
                    <th key={tactic} className="px-2 py-3 text-center text-xs font-medium text-gray-900 min-w-24">
                      <Tooltip content={createTacticTooltip(tactic)}>
                        <div className="transform -rotate-45 origin-center cursor-help">{tactic}</div>
                      </Tooltip>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {selectedGroupsData.map(group => (
                  <tr key={group.id} className="border-t">
                    <td className="px-4 py-3">
                      <Tooltip content={createGroupTooltip(group)}>
                        <div className="flex items-center space-x-2 cursor-help">
                          <div className="w-3 h-3 rounded-full" style={{backgroundColor: group.color}}></div>
                          <div>
                            <div className="font-medium text-sm">{group.name}</div>
                            <div className="text-xs text-gray-500">{group.country}</div>
                          </div>
                        </div>
                      </Tooltip>
                    </td>
                    {tactics.map(tactic => {
                      const tacticTechniques = group.techniques.filter(techId => 
                        techniques[techId]?.tactic === tactic
                      );
                      const intensity = tacticTechniques.length;
                      const maxIntensity = 4; // Approximate max techniques per tactic
                      const opacity = Math.min(intensity / maxIntensity, 1);
                      
                      const cellTooltip = intensity > 0 ? (
                        <div className="space-y-2 max-w-xs">
                          <div className="font-semibold text-white">{group.name} → {tactic}</div>
                          <div className="text-sm text-gray-200">{intensity} technique{intensity !== 1 ? 's' : ''} used</div>
                          <div className="space-y-1 text-xs">
                            {tacticTechniques.map(techId => (
                              <div key={techId} className="text-gray-300">
                                • {techniques[techId]?.name} ({techId})
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-300">No techniques identified for this tactic</div>
                      );
                      
                      return (
                        <td key={tactic} className="px-2 py-3 text-center">
                          <Tooltip content={cellTooltip}>
                            <div 
                              className="w-8 h-8 mx-auto rounded flex items-center justify-center text-xs font-bold text-white cursor-pointer hover:scale-110 transition-transform"
                              style={{
                                backgroundColor: getTacticColor(tactic),
                                opacity: intensity > 0 ? Math.max(opacity, 0.3) : 0.1
                              }}
                              onClick={() => setSelectedNode({
                                type: 'matrix-cell',
                                group: group.name,
                                tactic: tactic,
                                techniques: tacticTechniques,
                                count: intensity
                              })}
                            >
                              {intensity || ''}
                            </div>
                          </Tooltip>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // Timeline/Flow View
  const TimelineView = () => {
    const selectedGroupsData = threatGroups.filter(g => selectedGroups.includes(g.id));
    
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Attack Chain Timeline</h3>
            <div className="flex items-center space-x-2 text-sm text-blue-600">
              <Eye className="h-4 w-4" />
              <span>Hover for intelligence</span>
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-6">Sequential attack progression through MITRE ATT&CK tactics</p>
          <div className="space-y-6">
            {tactics.map((tactic, tacticIndex) => {
              const tacticTechniques = selectedGroupsData.flatMap(group => 
                group.techniques
                  .filter(techId => techniques[techId]?.tactic === tactic)
                  .map(techId => ({
                    ...techniques[techId],
                    id: techId,
                    group: group.name,
                    groupColor: group.color
                  }))
              );
              
              if (tacticTechniques.length === 0) return null;
              
              return (
                <div key={tactic} className="relative">
                  {/* Timeline connector */}
                  {tacticIndex < tactics.length - 1 && (
                    <div className="absolute left-6 top-16 w-0.5 h-16 bg-gray-300 z-0"></div>
                  )}
                  
                  {/* Tactic header */}
                  <div className="flex items-center space-x-4 mb-3">
                    <Tooltip content={createTacticTooltip(tactic)}>
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm z-10 cursor-help hover:scale-105 transition-transform"
                        style={{backgroundColor: getTacticColor(tactic)}}
                      >
                        {tacticIndex + 1}
                      </div>
                    </Tooltip>
                    <div>
                      <h4 className="font-semibold text-gray-900">{tactic}</h4>
                      <p className="text-sm text-gray-600">{tacticTechniques.length} technique{tacticTechniques.length !== 1 ? 's' : ''} identified</p>
                    </div>
                  </div>
                  
                  {/* Techniques */}
                  <div className="ml-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {tacticTechniques.map((tech, index) => (
                      <Tooltip 
                        key={`${tech.id}-${index}`}
                        content={createTechniqueTooltip(tech.id, { usedBy: [tech.group] })}
                      >
                        <div 
                          className="bg-gray-50 rounded-lg p-3 border border-gray-200 hover:shadow-md transition-shadow cursor-help"
                          onClick={() => setSelectedNode({
                            type: 'technique',
                            ...tech
                          })}
                        >
                          <div className="flex items-start space-x-2">
                            <div 
                              className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
                              style={{backgroundColor: tech.groupColor}}
                            ></div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm text-gray-900 truncate">{tech.name}</div>
                              <div className="text-xs text-gray-500">{tech.id} • {tech.group}</div>
                              <div className="flex items-center mt-1">
                                <span className={`px-2 py-1 text-xs rounded ${
                                  tech.severity === 'Critical' ? 'bg-red-100 text-red-700' :
                                  tech.severity === 'High' ? 'bg-orange-100 text-orange-700' :
                                  tech.severity === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-green-100 text-green-700'
                                }`}>
                                  {tech.severity}
                                </span>
                                <span className="ml-2 text-xs text-gray-500">{tech.prevalence}%</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Tooltip>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // Card-based Dashboard View
  const DashboardView = () => {
    const selectedGroupsData = threatGroups.filter(g => selectedGroups.includes(g.id));
    const allTechniques = [...new Set(selectedGroupsData.flatMap(g => g.techniques))];
    
    const tacticStats = tactics.map(tactic => {
      const tacticTechniques = allTechniques.filter(techId => techniques[techId]?.tactic === tactic);
      const avgSeverity = tacticTechniques.length > 0 
        ? tacticTechniques.reduce((sum, techId) => {
            const severity = techniques[techId]?.severity;
            return sum + (severity === 'Critical' ? 4 : severity === 'High' ? 3 : severity === 'Medium' ? 2 : 1);
          }, 0) / tacticTechniques.length
        : 0;
      
      return {
        tactic,
        count: tacticTechniques.length,
        avgSeverity: Math.round(avgSeverity * 10) / 10,
        color: getTacticColor(tactic)
      };
    }).filter(stat => stat.count > 0);
    
    return (
      <div className="space-y-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Tooltip content={
            <div className="space-y-1 max-w-xs">
              <div className="font-semibold text-white">Active Threat Groups</div>
              <div className="text-sm text-gray-200">Number of threat actors currently being analyzed</div>
              <div className="text-xs text-gray-300">
                {selectedGroupsData.map(g => `• ${g.name} (${g.country})`).join('\n')}
              </div>
            </div>
          }>
            <div className="bg-white rounded-lg shadow p-4 cursor-help hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-500" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Active Groups</p>
                  <p className="text-2xl font-semibold text-gray-900">{selectedGroups.length}</p>
                </div>
              </div>
            </div>
          </Tooltip>
          
          <Tooltip content={
            <div className="space-y-1 max-w-xs">
              <div className="font-semibold text-white">Total Techniques</div>
              <div className="text-sm text-gray-200">Unique MITRE ATT&CK techniques used by selected groups</div>
              <div className="text-xs text-gray-300">
                Range from {tactics[0]} to {tactics[tactics.length-1]} across the attack lifecycle
              </div>
            </div>
          }>
            <div className="bg-white rounded-lg shadow p-4 cursor-help hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <Target className="h-8 w-8 text-red-500" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Total TTPs</p>
                  <p className="text-2xl font-semibold text-gray-900">{allTechniques.length}</p>
                </div>
              </div>
            </div>
          </Tooltip>
          
          <Tooltip content={
            <div className="space-y-1 max-w-xs">
              <div className="font-semibold text-white">Tactics Covered</div>
              <div className="text-sm text-gray-200">Number of MITRE ATT&CK tactics represented</div>
              <div className="text-xs text-gray-300">
                Active tactics: {tacticStats.map(s => s.tactic).join(', ')}
              </div>
            </div>
          }>
            <div className="bg-white rounded-lg shadow p-4 cursor-help hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <Shield className="h-8 w-8 text-orange-500" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Tactics Used</p>
                  <p className="text-2xl font-semibold text-gray-900">{tacticStats.length}</p>
                </div>
              </div>
            </div>
          </Tooltip>
          
          <Tooltip content={
            <div className="space-y-1 max-w-xs">
              <div className="font-semibold text-white">Average Risk Level</div>
              <div className="text-sm text-gray-200">Mean severity across all techniques (1=Low, 4=Critical)</div>
              <div className="text-xs text-gray-300">
                Based on severity ratings: Critical=4, High=3, Medium=2, Low=1
              </div>
            </div>
          }>
            <div className="bg-white rounded-lg shadow p-4 cursor-help hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-yellow-500" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Avg Risk</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {tacticStats.length > 0 
                      ? (tacticStats.reduce((sum, stat) => sum + stat.avgSeverity, 0) / tacticStats.length).toFixed(1)
                      : '0'}
                  </p>
                </div>
              </div>
            </div>
          </Tooltip>
        </div>

        {/* Threat Group Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {selectedGroupsData.map(group => (
            <Tooltip 
              key={group.id}
              content={createGroupTooltip(group)}
            >
              <div className="bg-white rounded-lg shadow cursor-help hover:shadow-md transition-shadow">
                <div className="p-4 border-b" style={{borderTopColor: group.color, borderTopWidth: '4px'}}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{group.name}</h3>
                      <p className="text-sm text-gray-600">{group.alias} • {group.country}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">{group.techniques.length} TTPs</div>
                      <div className="text-xs text-gray-500">{group.sophistication} Sophistication</div>
                    </div>
                  </div>
                </div>
                
                <div className="p-4">
                  <p className="text-sm text-gray-700 mb-4">{group.description}</p>
                  
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Target Sectors</h4>
                      <div className="flex flex-wrap gap-1">
                        {group.sectors.slice(0, 3).map(sector => (
                          <span key={sector} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                            {sector}
                          </span>
                        ))}
                        {group.sectors.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                            +{group.sectors.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Top Tactics</h4>
                      <div className="grid grid-cols-3 gap-2">
                        {tactics.slice(0, 6).map(tactic => {
                          const count = group.techniques.filter(techId => techniques[techId]?.tactic === tactic).length;
                          return (
                            <Tooltip 
                              key={tactic}
                              content={createTacticTooltip(tactic)}
                            >
                              <div className="text-center cursor-help">
                                <div 
                                  className="w-full h-8 rounded flex items-center justify-center text-xs font-medium text-white hover:opacity-80 transition-opacity"
                                  style={{
                                    backgroundColor: getTacticColor(tactic),
                                    opacity: count > 0 ? 1 : 0.2
                                  }}
                                >
                                  {count || 0}
                                </div>
                                <div className="text-xs text-gray-600 mt-1 truncate">{tactic.split(' ')[0]}</div>
                              </div>
                            </Tooltip>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Tooltip>
          ))}
        </div>

        {/* Tactic Breakdown */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold">Tactic Analysis</h3>
            <p className="text-sm text-gray-600">Hover for detailed tactic information</p>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tacticStats.map(stat => (
                <Tooltip 
                  key={stat.tactic}
                  content={createTacticTooltip(stat.tactic)}
                >
                  <div className="border rounded-lg p-4 cursor-help hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{stat.tactic}</h4>
                      <div 
                        className="w-6 h-6 rounded"
                        style={{backgroundColor: stat.color}}
                      ></div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Techniques:</span>
                        <span className="font-medium">{stat.count}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Avg Severity:</span>
                        <span className="font-medium">{stat.avgSeverity}/4</span>
                      </div>
                    </div>
                  </div>
                </Tooltip>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Sankey-style Flow View
  const FlowView = () => {
    const selectedGroupsData = threatGroups.filter(g => selectedGroups.includes(g.id));
    
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">Attack Flow Analysis</h3>
          <p className="text-sm text-gray-600">Threat groups → Tactics → Techniques flow • Hover for detailed information</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-3 gap-8 h-96">
            {/* Groups Column */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 text-center">Threat Groups</h4>
              <div className="space-y-3">
                {selectedGroupsData.map(group => (
                    <Tooltip 
                      key={group.id}
                      content={createGroupTooltip(group)}
                      size="large"
                    >
                      <div 
                        className="p-3 rounded-lg border-l-4 bg-gray-50 cursor-help hover:bg-gray-100 hover:shadow-md transition-all duration-200 hover:scale-[1.02]"
                        style={{borderLeftColor: group.color}}
                        onClick={() => setSelectedNode({type: 'group', ...group})}
                      >
                        <div className="flex items-center space-x-1">
                          <div className="font-medium text-sm">{group.name}</div>
                          <Info className="h-3 w-3 text-gray-400 opacity-60" />
                        </div>
                        <div className="text-xs text-gray-600">{group.country}</div>
                        <div className="text-xs text-gray-500">{group.techniques.length} TTPs</div>
                        <div className="text-xs text-gray-500">{group.sophistication} sophistication</div>
                      </div>
                    </Tooltip>
                ))}
              </div>
            </div>

            {/* Tactics Column */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 text-center">Tactics</h4>
              <div className="space-y-2">
                {tactics.map(tactic => {
                  const tacticTechniques = selectedGroupsData.flatMap(group =>
                    group.techniques.filter(techId => techniques[techId]?.tactic === tactic)
                  );
                  const uniqueCount = [...new Set(tacticTechniques)].length;
                  
                  if (uniqueCount === 0) return null;
                  
                  return (
                    <Tooltip 
                      key={tactic}
                      content={createTacticTooltip(tactic)}
                    >
                      <div 
                        className="p-2 rounded text-white text-sm font-medium cursor-help hover:opacity-80 transition-opacity"
                        style={{backgroundColor: getTacticColor(tactic)}}
                        onClick={() => setSelectedNode({
                          type: 'tactic',
                          name: tactic,
                          techniqueCount: uniqueCount,
                          color: getTacticColor(tactic)
                        })}
                      >
                        <div className="flex justify-between items-center">
                          <span className="truncate">{tactic}</span>
                          <span className="bg-white bg-opacity-30 px-2 py-1 rounded text-xs">
                            {uniqueCount}
                          </span>
                        </div>
                      </div>
                    </Tooltip>
                  );
                })}
              </div>
            </div>

            {/* Techniques Column */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 text-center">Top Techniques</h4>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {[...new Set(selectedGroupsData.flatMap(g => g.techniques))]
                  .map(techId => techniques[techId] ? {...techniques[techId], id: techId} : null)
                  .filter(Boolean)
                  .sort((a, b) => b.prevalence - a.prevalence)
                  .slice(0, 15)
                  .map(tech => {
                    const usedByGroups = selectedGroupsData
                      .filter(g => g.techniques.includes(tech.id))
                      .map(g => g.name);
                    
                    return (
                      <Tooltip 
                        key={tech.id}
                        content={createTechniqueTooltip(tech.id, { usedBy: usedByGroups })}
                      >
                        <div 
                          className="p-2 rounded border bg-white hover:bg-gray-50 cursor-help transition-colors"
                          onClick={() => setSelectedNode({type: 'technique', ...tech})}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-gray-900 truncate">{tech.name}</div>
                              <div className="text-xs text-gray-500">{tech.id}</div>
                              <div className="text-xs text-gray-400">
                                Used by: {usedByGroups.join(', ')}
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div 
                                className="w-3 h-3 rounded-full"
                                style={{backgroundColor: getSeverityColor(tech.severity)}}
                              ></div>
                              <span className="text-xs text-gray-600">{tech.prevalence}%</span>
                            </div>
                          </div>
                        </div>
                      </Tooltip>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const views = {
    navigator: { name: 'Navigator', icon: Navigation, component: () => <NavigatorView /> },
    network: { name: 'Network View', icon: Network, component: () => <NetworkView /> },
    matrix: { name: 'Matrix View', icon: Grid, component: MatrixView },
    timeline: { name: 'Timeline View', icon: Activity, component: TimelineView },
    dashboard: { name: 'Dashboard View', icon: BarChart3, component: DashboardView },
    flow: { name: 'Flow View', icon: Layers, component: FlowView }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">MITRE ATT&CK Alternative Views</h1>
                <p className="text-sm text-gray-500">
                  Multiple visualization approaches for threat intelligence • 
                  <span className="inline-flex items-center ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    <Info className="h-3 w-3 mr-1" />
                    Hover over any element for detailed intelligence
                  </span>
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {Object.entries(views).map(([key, view]) => {
                const Icon = view.icon;
                return (
                  <button
                    key={key}
                    onClick={() => setActiveView(key)}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeView === key 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {view.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Controls Panel */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-3 text-gray-900">Controls</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target Sector</label>
                  <select
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    value={selectedSector}
                    onChange={(e) => setSelectedSector(e.target.value)}
                  >
                    <option value="all">All Sectors</option>
                    <option value="Technology">Technology</option>
                    <option value="Finance">Finance</option>
                    <option value="Government">Government</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Threat Groups</label>
                  <div className="space-y-2">
                    {threatGroups.map(group => (
                      <Tooltip 
                        key={group.id}
                        content={createGroupTooltip(group)}
                      >
                        <label className="flex items-center space-x-2 cursor-help">
                          <input
                            type="checkbox"
                            checked={selectedGroups.includes(group.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedGroups([...selectedGroups, group.id]);
                              } else {
                                setSelectedGroups(selectedGroups.filter(id => id !== group.id));
                              }
                            }}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <div className="flex items-center space-x-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: group.color }}
                            ></div>
                            <div>
                              <span className="text-sm text-gray-900">{group.name}</span>
                              <div className="text-xs text-gray-500">{group.alias}</div>
                            </div>
                          </div>
                        </label>
                      </Tooltip>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* View Information */}
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-3 text-gray-900">Current View</h3>
              <div className="space-y-2">
                <div className="font-medium text-blue-600">{views[activeView].name}</div>
                <div className="text-sm text-gray-600">
                  {activeView === 'navigator' && 'Full MITRE ATT&CK matrix showing technique coverage by selected threat groups'}
                  {activeView === 'network' && 'Interactive network graph showing relationships between threat actors, tactics, and techniques'}
                  {activeView === 'matrix' && 'Heatmap showing technique distribution across tactics and groups'}
                  {activeView === 'timeline' && 'Sequential view of attack progression through MITRE tactics'}
                  {activeView === 'dashboard' && 'Executive summary with key metrics and threat group profiles'}
                  {activeView === 'flow' && 'Three-column flow showing relationships between groups, tactics, and techniques'}
                </div>
                <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center space-x-2 text-blue-800">
                    <Eye className="h-4 w-4" />
                    <span className="text-sm font-medium">Hover Tips Available</span>
                  </div>
                  <div className="text-xs text-blue-700 mt-1">
                    Hover over any threat group, tactic, or technique for detailed intelligence including business impact, detection methods, and mitigation strategies.
                  </div>
                </div>
              </div>
            </div>

            {/* Selected Item Details */}
            {selectedNode && (
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-3 text-gray-900">Selection Details</h3>
                <div className="space-y-2">
                  <div className="font-medium text-gray-900">{selectedNode.name || selectedNode.label}</div>
                  {selectedNode.type === 'technique' && (
                    <>
                      <div className="text-sm text-gray-600">{selectedNode.id}</div>
                      <div className="text-xs text-gray-500">{selectedNode.description}</div>
                      <div className="flex items-center space-x-2 mt-2">
                        <span className={`px-2 py-1 text-xs rounded ${
                          selectedNode.severity === 'Critical' ? 'bg-red-100 text-red-800' :
                          selectedNode.severity === 'High' ? 'bg-orange-100 text-orange-800' :
                          selectedNode.severity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {selectedNode.severity}
                        </span>
                        <span className="text-xs text-gray-600">{selectedNode.prevalence}% prevalence</span>
                      </div>
                    </>
                  )}
                  {selectedNode.type === 'group' && (
                    <>
                      <div className="text-sm text-gray-600">{selectedNode.description}</div>
                      <div className="text-xs text-gray-500">
                        <div><strong>Country:</strong> {selectedNode.country}</div>
                        <div><strong>Motivation:</strong> {selectedNode.motivation}</div>
                        <div><strong>Sophistication:</strong> {selectedNode.sophistication}</div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {React.createElement(views[activeView].component)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MitreAlternativeViews;