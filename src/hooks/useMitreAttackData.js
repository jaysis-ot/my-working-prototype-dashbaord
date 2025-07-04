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
    // A subset of techniques for demonstration, linked to tactics and groups
    { id: 'T1566.001', name: 'Phishing: Spearphishing Attachment', tacticIds: ['TA0001'] },
    { id: 'T1566.002', name: 'Phishing: Spearphishing Link', tacticIds: ['TA0001'] },
    { id: 'T1190', name: 'Exploit Public-Facing Application', tacticIds: ['TA0001'] },
    { id: 'T1203', name: 'Exploitation for Client Execution', tacticIds: ['TA0002'] },
    { id: 'T1059.001', name: 'Command and Scripting Interpreter: PowerShell', tacticIds: ['TA0002'] },
    { id: 'T1059.003', name: 'Command and Scripting Interpreter: Windows Command Shell', tacticIds: ['TA0002'] },
    { id: 'T1059.007', name: 'Command and Scripting Interpreter: JavaScript', tacticIds: ['TA0002'] },
    { id: 'T1547.001', name: 'Boot or Logon Autostart Execution: Registry Run Keys', tacticIds: ['TA0003', 'TA0004'] },
    { id: 'T1078', name: 'Valid Accounts', tacticIds: ['TA0003', 'TA0004', 'TA0005'] },
    { id: 'T1055', name: 'Process Injection', tacticIds: ['TA0005'] },
    { id: 'T1055.001', name: 'Process Injection: Dynamic-link Library Injection', tacticIds: ['TA0005'] },
    { id: 'T1055.012', name: 'Process Injection: Process Hollowing', tacticIds: ['TA0005'] },
    { id: 'T1070.001', name: 'Indicator Removal: Clear Windows Event Logs', tacticIds: ['TA0005'] },
    { id: 'T1070.004', name: 'Indicator Removal: File Deletion', tacticIds: ['TA0005'] },
    { id: 'T1070.006', name: 'Indicator Removal: Timestomp', tacticIds: ['TA0005'] },
    { id: 'T1003.001', name: 'OS Credential Dumping: LSASS Memory', tacticIds: ['TA0006'] },
    { id: 'T1003.002', name: 'OS Credential Dumping: Security Account Manager', tacticIds: ['TA0006'] },
    { id: 'T1110.003', name: 'Brute Force: Password Spraying', tacticIds: ['TA0006'] },
    { id: 'T1083', name: 'File and Directory Discovery', tacticIds: ['TA0007'] },
    { id: 'T1057', name: 'Process Discovery', tacticIds: ['TA0007'] },
    { id: 'T1021.001', name: 'Remote Services: Remote Desktop Protocol', tacticIds: ['TA0008'] },
    { id: 'T1021.002', name: 'Remote Services: SMB/Windows Admin Shares', tacticIds: ['TA0008'] },
    { id: 'T1021.004', name: 'Remote Services: SSH', tacticIds: ['TA0008'] },
    { id: 'T1005', name: 'Data from Local System', tacticIds: ['TA0009'] },
    { id: 'T1039', name: 'Data from Network Shared Drive', tacticIds: ['TA0009'] },
    { id: 'T1567.002', name: 'Exfiltration Over Web Service: Exfiltration to Cloud Storage', tacticIds: ['TA0010'] },
    { id: 'T1041', name: 'Exfiltration Over C2 Channel', tacticIds: ['TA0010'] },
    { id: 'T1548.002', name: 'Abuse Elevation Control Mechanism: Bypass User Account Control', tacticIds: ['TA0004'] },
    { id: 'T1068', name: 'Exploitation for Privilege Escalation', tacticIds: ['TA0004'] },
    { id: 'T1053.005', name: 'Scheduled Task/Job: Scheduled Task', tacticIds: ['TA0002', 'TA0003', 'TA0004'] },
    { id: 'T1486', name: 'Data Encrypted for Impact', tacticIds: ['TA0040'] },
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
