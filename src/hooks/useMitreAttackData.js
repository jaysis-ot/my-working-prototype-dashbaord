import { useState, useEffect, useCallback, useMemo } from 'react';

// --- Mock API Layer ---
// In a real application, this would be in a separate service file.
// For this migration, we'll keep it here to be self-contained.
const mitreAttackMockAPI = {
  // Data copied and adapted from the original MitreAttackNavigator.jsx
  threatGroups: [
    {
      id: 'APT1', name: 'APT1', alias: 'Comment Crew', country: 'China', motivation: 'Espionage',
      sectors: ['Technology', 'Energy', 'Finance', 'Government'], sophistication: 'High', firstSeen: '2006',
      description: 'Chinese cyber espionage group targeting intellectual property.',
      techniques: ['T1566.001', 'T1059.003', 'T1078', 'T1055', 'T1003.001', 'T1083', 'T1021.001', 'T1005', 'T1041', 'T1547.001'],
      color: '#E74C3C'
    },
    {
      id: 'APT28', name: 'APT28', alias: 'Fancy Bear', country: 'Russia', motivation: 'Intelligence',
      sectors: ['Government', 'Military', 'Defense', 'Media'], sophistication: 'Very High', firstSeen: '2008',
      description: 'Russian military intelligence cyber operations unit.',
      techniques: ['T1566.002', 'T1190', 'T1059.001', 'T1068', 'T1070.004', 'T1003.002', 'T1057', 'T1021.004', 'T1567.002', 'T1548.002'],
      color: '#8E44AD'
    },
    {
      id: 'APT29', name: 'APT29', alias: 'Cozy Bear', country: 'Russia', motivation: 'Intelligence',
      sectors: ['Government', 'Think Tanks', 'Healthcare', 'Technology'], sophistication: 'Very High', firstSeen: '2010',
      description: 'Russian foreign intelligence service operations.',
      techniques: ['T1566.001', 'T1203', 'T1547.001', 'T1548.002', 'T1055.001', 'T1110.003', 'T1083', 'T1039', 'T1041', 'T1070.001'],
      color: '#2980B9'
    },
    {
      id: 'Lazarus', name: 'Lazarus Group', alias: 'Hidden Cobra', country: 'North Korea', motivation: 'Financial, Espionage',
      sectors: ['Finance', 'Cryptocurrency', 'Entertainment', 'Critical Infrastructure'], sophistication: 'High', firstSeen: '2009',
      description: 'North Korean state-sponsored group known for financial attacks.',
      techniques: ['T1566.001', 'T1190', 'T1059.007', 'T1055.001', 'T1070.001', 'T1003.001', 'T1021.001', 'T1005', 'T1486', 'T1053.005'],
      color: '#E67E22'
    },
  ],
  tactics: [
    { id: 'TA0001', name: 'Initial Access' }, { id: 'TA0002', name: 'Execution' },
    { id: 'TA0003', name: 'Persistence' }, { id: 'TA0004', name: 'Privilege Escalation' },
    { id: 'TA0005', name: 'Defense Evasion' }, { id: 'TA0006', name: 'Credential Access' },
    { id: 'TA0007', name: 'Discovery' }, { id: 'TA0008', name: 'Lateral Movement' },
    { id: 'TA0009', name: 'Collection' }, { id: 'TA0011', name: 'Command and Control' },
    { id: 'TA0010', name: 'Exfiltration' }, { id: 'TA0040', name: 'Impact' },
  ],
  techniques: [
    { id: 'T1566.001', name: 'Phishing: Spearphishing Attachment', tacticIds: ['TA0001'], severity: 'High', description: 'Adversaries may send spearphishing emails with malicious attachments to gain initial access.', platforms: ['Windows', 'macOS', 'Linux'], data_sources: ['Email gateway', 'Network traffic'], mitigations: ['User Training', 'Email Filtering'] },
    { id: 'T1566.002', name: 'Phishing: Spearphishing Link', tacticIds: ['TA0001'], severity: 'High', description: 'Adversaries may send spearphishing emails with malicious links to trick users into revealing credentials or executing code.', platforms: ['Windows', 'macOS', 'Linux'], data_sources: ['Email gateway', 'Web proxy logs'], mitigations: ['User Training', 'URL Filtering'] },
    { id: 'T1190', name: 'Exploit Public-Facing Application', tacticIds: ['TA0001'], severity: 'Critical', description: 'Adversaries may exploit weaknesses in internet-facing applications to gain a foothold in a network.', platforms: ['Windows', 'Linux'], data_sources: ['Web server logs', 'Network intrusion detection'], mitigations: ['Vulnerability Scanning', 'Web Application Firewall'] },
    { id: 'T1203', name: 'Exploitation for Client Execution', tacticIds: ['TA0002'], severity: 'High', description: 'Adversaries may exploit vulnerabilities in client-side applications to execute code on a victim\'s machine.', platforms: ['Windows', 'macOS', 'Linux'], data_sources: ['Process monitoring', 'Antivirus logs'], mitigations: ['Application Sandboxing', 'Security Updates'] },
    { id: 'T1059.001', name: 'Command and Scripting Interpreter: PowerShell', tacticIds: ['TA0002'], severity: 'Medium', description: 'Adversaries use PowerShell for execution of commands and scripts.', platforms: ['Windows'], data_sources: ['PowerShell logs', 'Command-line logs'], mitigations: ['Execution Policies', 'Application Control'] },
    { id: 'T1059.003', name: 'Command and Scripting Interpreter: Windows Command Shell', tacticIds: ['TA0002'], severity: 'Medium', description: 'Adversaries abuse the Windows Command Shell (cmd.exe) for execution.', platforms: ['Windows'], data_sources: ['Process monitoring', 'Command-line logs'], mitigations: ['Application Control', 'Command-line logging'] },
    { id: 'T1059.007', name: 'Command and Scripting Interpreter: JavaScript', tacticIds: ['TA0002'], severity: 'Medium', description: 'Adversaries may abuse JavaScript engines to execute scripts.', platforms: ['Windows', 'macOS', 'Linux'], data_sources: ['Browser logs', 'Script execution logs'], mitigations: ['Script Blocking', 'Browser Sandboxing'] },
    { id: 'T1547.001', name: 'Boot or Logon Autostart Execution: Registry Run Keys', tacticIds: ['TA0003', 'TA0004'], severity: 'Medium', description: 'Adversaries may achieve persistence by adding entries to registry run keys.', platforms: ['Windows'], data_sources: ['Registry monitoring', 'File monitoring'], mitigations: ['Audit Registry', 'Restrict Registry Permissions'] },
    { id: 'T1078', name: 'Valid Accounts', tacticIds: ['TA0003', 'TA0004', 'TA0005'], severity: 'High', description: 'Adversaries may steal and use legitimate credentials to maintain access.', platforms: ['Windows', 'macOS', 'Linux'], data_sources: ['Authentication logs', 'Process monitoring'], mitigations: ['Multi-factor Authentication', 'Password Policies'] },
    { id: 'T1055', name: 'Process Injection', tacticIds: ['TA0005'], severity: 'High', description: 'Adversaries inject code into other legitimate processes to evade defenses.', platforms: ['Windows', 'macOS', 'Linux'], data_sources: ['Process monitoring', 'API monitoring'], mitigations: ['Attack Surface Reduction', 'Behavior Analytics'] },
    { id: 'T1055.001', name: 'Process Injection: Dynamic-link Library Injection', tacticIds: ['TA0005'], severity: 'High', description: 'Injecting a malicious DLL into a running process.', platforms: ['Windows'], data_sources: ['Process monitoring', 'Loaded DLLs'], mitigations: ['Application Control'] },
    { id: 'T1055.012', name: 'Process Injection: Process Hollowing', tacticIds: ['TA0005'], severity: 'High', description: 'Creating a new process in a suspended state and replacing its memory with malicious code.', platforms: ['Windows'], data_sources: ['Process monitoring', 'API calls'], mitigations: ['Behavioral Analysis'] },
    { id: 'T1070.001', name: 'Indicator Removal: Clear Windows Event Logs', tacticIds: ['TA0005'], severity: 'Medium', description: 'Adversaries may clear Windows event logs to hide their tracks.', platforms: ['Windows'], data_sources: ['Log monitoring', 'Endpoint detection'], mitigations: ['Centralized Logging', 'Log Protection'] },
    { id: 'T1070.004', name: 'Indicator Removal: File Deletion', tacticIds: ['TA0005'], severity: 'Medium', description: 'Adversaries may delete files to remove evidence of their presence.', platforms: ['Windows', 'macOS', 'Linux'], data_sources: ['File monitoring', 'Endpoint detection'], mitigations: ['File Integrity Monitoring'] },
    { id: 'T1070.006', name: 'Indicator Removal: Timestomp', tacticIds: ['TA0005'], severity: 'Medium', description: 'Adversaries may modify file timestamps to hide their activity.', platforms: ['Windows', 'macOS', 'Linux'], data_sources: ['File monitoring', 'Filesystem metadata analysis'], mitigations: ['File Integrity Monitoring'] },
    { id: 'T1003.001', name: 'OS Credential Dumping: LSASS Memory', tacticIds: ['TA0006'], severity: 'Critical', description: 'Dumping credentials from the LSASS process memory.', platforms: ['Windows'], data_sources: ['OS kernel', 'Process memory'], mitigations: ['Credential Guard', 'Access Token Manipulation Prevention'] },
    { id: 'T1003.002', name: 'OS Credential Dumping: Security Account Manager', tacticIds: ['TA0006'], severity: 'High', description: 'Dumping credentials from the SAM database.', platforms: ['Windows'], data_sources: ['Registry access monitoring', 'File access monitoring'], mitigations: ['Restrict SAM access'] },
    { id: 'T1110.003', name: 'Brute Force: Password Spraying', tacticIds: ['TA0006'], severity: 'Medium', description: 'Attempting a single common password against many accounts.', platforms: ['Windows', 'macOS', 'Linux'], data_sources: ['Authentication logs', 'Account lockout monitoring'], mitigations: ['MFA', 'Password Policies'] },
    { id: 'T1083', name: 'File and Directory Discovery', tacticIds: ['TA0007'], severity: 'Medium', description: 'Adversaries may search for files and directories of interest.', platforms: ['Windows', 'macOS', 'Linux'], data_sources: ['File access monitoring', 'Process monitoring'], mitigations: ['Access controls', 'File Auditing'] },
    { id: 'T1057', name: 'Process Discovery', tacticIds: ['TA0007'], severity: 'Medium', description: 'Adversaries may attempt to get a list of running processes.', platforms: ['Windows', 'macOS', 'Linux'], data_sources: ['Process monitoring', 'Command-line logs'], mitigations: ['Behavioral Analysis'] },
    { id: 'T1021.001', name: 'Remote Services: Remote Desktop Protocol', tacticIds: ['TA0008'], severity: 'High', description: 'Adversaries may use RDP to move laterally within a network.', platforms: ['Windows'], data_sources: ['Network traffic', 'Authentication logs'], mitigations: ['Restrict RDP access', 'Network Segmentation'] },
    { id: 'T1021.002', name: 'Remote Services: SMB/Windows Admin Shares', tacticIds: ['TA0008'], severity: 'High', description: 'Adversaries may use SMB for lateral movement.', platforms: ['Windows'], data_sources: ['Network traffic', 'File share access logs'], mitigations: ['Disable Admin Shares', 'Network Segmentation'] },
    { id: 'T1021.004', name: 'Remote Services: SSH', tacticIds: ['TA0008'], severity: 'High', description: 'Adversaries may use SSH to move laterally.', platforms: ['Linux', 'macOS'], data_sources: ['Authentication logs', 'Network traffic'], mitigations: ['Restrict SSH access', 'Use key-based authentication'] },
    { id: 'T1005', name: 'Data from Local System', tacticIds: ['TA0009'], severity: 'Medium', description: 'Adversaries may search for and collect data from the local system.', platforms: ['Windows', 'macOS', 'Linux'], data_sources: ['File access monitoring', 'Process monitoring'], mitigations: ['Data Loss Prevention', 'Access Controls'] },
    { id: 'T1039', name: 'Data from Network Shared Drive', tacticIds: ['TA0009'], severity: 'Medium', description: 'Adversaries may search for and collect data from network shares.', platforms: ['Windows', 'macOS', 'Linux'], data_sources: ['Network traffic', 'File share access logs'], mitigations: ['Access Controls on Shares'] },
    { id: 'T1567.002', name: 'Exfiltration Over Web Service: Exfiltration to Cloud Storage', tacticIds: ['TA0010'], severity: 'High', description: 'Adversaries may exfiltrate data to a cloud storage service.', platforms: ['Windows', 'macOS', 'Linux'], data_sources: ['Network traffic', 'Web proxy logs'], mitigations: ['Data Loss Prevention', 'Network Egress Filtering'] },
    { id: 'T1041', name: 'Exfiltration Over C2 Channel', tacticIds: ['TA0010'], severity: 'High', description: 'Adversaries may exfiltrate data over their command and control channel.', platforms: ['Windows', 'macOS', 'Linux'], data_sources: ['Network traffic analysis', 'C2 logs'], mitigations: ['Network Intrusion Detection'] },
    { id: 'T1548.002', name: 'Abuse Elevation Control Mechanism: Bypass User Account Control', tacticIds: ['TA0004'], severity: 'Medium', description: 'Adversaries may bypass UAC to escalate privileges.', platforms: ['Windows'], data_sources: ['Process monitoring', 'API calls'], mitigations: ['Keep UAC at highest level'] },
    { id: 'T1068', name: 'Exploitation for Privilege Escalation', tacticIds: ['TA0004'], severity: 'High', description: 'Adversaries may exploit a vulnerability to escalate privileges.', platforms: ['Windows', 'macOS', 'Linux'], data_sources: ['Process monitoring', 'Vulnerability scans'], mitigations: ['Patching', 'Application Control'] },
    { id: 'T1053.005', name: 'Scheduled Task/Job: Scheduled Task', tacticIds: ['TA0002', 'TA0003', 'TA0004'], severity: 'Medium', description: 'Adversaries may use scheduled tasks to execute malicious code.', platforms: ['Windows'], data_sources: ['Scheduled task monitoring', 'Process monitoring'], mitigations: ['Audit Scheduled Tasks'] },
    { id: 'T1486', name: 'Data Encrypted for Impact', tacticIds: ['TA0040'], severity: 'Critical', description: 'Adversaries may encrypt data to disrupt operations (ransomware).', platforms: ['Windows', 'macOS', 'Linux'], data_sources: ['File monitoring', 'Encryption API calls'], mitigations: ['Data Backup', 'Behavior-based Ransomware Detection'] },
  ],

  async fetchData() {
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay
    return {
      tactics: this.tactics,
      techniques: this.techniques,
      threatGroups: this.threatGroups,
    };
  },
};

/**
 * Custom hook for fetching and managing MITRE ATT&CK data.
 * 
 * This hook provides a centralized and simplified interface for accessing
 * tactics, techniques, and threat group data from the MITRE ATT&CK framework.
 * It encapsulates data fetching, state management, and filtering logic.
 */
export const useMitreAttackData = () => {
  const [tactics, setTactics] = useState([]);
  const [techniques, setTechniques] = useState([]);
  const [threatGroups, setThreatGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    selectedGroups: [],
    selectedSectors: [],
  });

  // Fetch initial data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await mitreAttackMockAPI.fetchData();
        setTactics(data.tactics);
        setTechniques(data.techniques);
        setThreatGroups(data.threatGroups);
      } catch (e) {
        console.error("Failed to load MITRE ATT&CK data:", e);
        setError(e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Memoized filtered techniques based on current filters
  const filteredTechniques = useMemo(() => {
    const { search, selectedGroups } = filters;
    const searchLower = search.toLowerCase();

    // Get all unique technique IDs used by the selected threat groups
    const techniquesUsedBySelectedGroups = selectedGroups.length > 0
      ? new Set(
          threatGroups
            .filter(g => selectedGroups.includes(g.id))
            .flatMap(g => g.techniques)
        )
      : null;

    return techniques.filter(tech => {
      // Filter by search term
      const matchesSearch = !searchLower ||
        tech.id.toLowerCase().includes(searchLower) ||
        tech.name.toLowerCase().includes(searchLower);

      if (!matchesSearch) return false;

      // Filter by selected threat groups
      const matchesGroup = !techniquesUsedBySelectedGroups || techniquesUsedBySelectedGroups.has(tech.id);

      return matchesGroup;
    });
  }, [techniques, threatGroups, filters]);

  // Memoized helper function to get techniques for a specific tactic
  const getTechniquesForTactic = useCallback((tacticId) => {
    return filteredTechniques.filter(tech => tech.tacticIds.includes(tacticId));
  }, [filteredTechniques]);

  return {
    // Data
    tactics,
    techniques,
    threatGroups,
    filteredTechniques,

    // State
    loading,
    error,
    filters,

    // Actions
    setFilters,
    getTechniquesForTactic,
  };
};
