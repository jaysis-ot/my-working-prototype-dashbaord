import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Clock } from 'lucide-react';
import IncidentsView from '../organisms/IncidentsView';
import { useToast } from '../../hooks/useToast';
import useAuth from '../../auth/useAuth';

/**
 * IncidentsPage Component
 * 
 * This page component is responsible for:
 * 1. Managing the state of security incidents
 * 2. Providing data and handlers to the IncidentsView organism
 * 3. Processing incident-related operations (create, update, delete)
 * 4. Calculating metrics for the dashboard
 * 
 * Following atomic design principles, this page uses the IncidentsView organism
 * to handle the presentation layer while focusing on data management and business logic.
 */
const IncidentsPage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user } = useAuth();
  
  // Sample incidents data for demonstration
  const [incidents, setIncidents] = useState([
    {
      id: 'INC-1001',
      title: 'Unauthorized Access Attempt',
      description: 'Multiple failed login attempts detected from IP 192.168.1.45 targeting the admin portal.',
      severity: 'HIGH',
      status: 'INVESTIGATING',
      assignedTo: 'Sarah Chen',
      createdAt: '2025-07-10T08:23:15Z',
      resolvedAt: null,
      reporter: 'System Monitor',
      affectedSystems: ['Admin Portal', 'Authentication Service'],
      tags: ['security', 'authentication', 'brute-force']
    },
    {
      id: 'INC-1002',
      title: 'Network Latency in Production',
      description: 'Users reporting significant delays in data transmission between OT systems and SCADA network.',
      severity: 'MEDIUM',
      status: 'IN_PROGRESS',
      assignedTo: 'Michael Rodriguez',
      createdAt: '2025-07-09T14:45:30Z',
      resolvedAt: null,
      reporter: 'Operations Team',
      affectedSystems: ['SCADA Network', 'Data Transmission'],
      tags: ['performance', 'network', 'latency']
    },
    {
      id: 'INC-1003',
      title: 'Anomalous Data Pattern Detected',
      description: 'Machine learning model identified unusual patterns in sensor data from manufacturing floor.',
      severity: 'LOW',
      status: 'NEW',
      assignedTo: '',
      createdAt: '2025-07-11T02:17:45Z',
      resolvedAt: null,
      reporter: 'ML Monitoring System',
      affectedSystems: ['Sensor Network', 'Analytics Pipeline'],
      tags: ['anomaly', 'sensors', 'data-quality']
    },
    {
      id: 'INC-1004',
      title: 'Critical Firmware Update Failure',
      description: 'Automated firmware update failed on 12 PLCs in Building C, leaving them potentially vulnerable.',
      severity: 'CRITICAL',
      status: 'INVESTIGATING',
      assignedTo: 'Alex Johnson',
      createdAt: '2025-07-10T19:05:22Z',
      resolvedAt: null,
      reporter: 'Update Manager',
      affectedSystems: ['PLC Network', 'Firmware Management'],
      tags: ['firmware', 'security', 'update-failure']
    },
    {
      id: 'INC-1005',
      title: 'Configuration Drift Detected',
      description: 'Security audit found unauthorized changes to firewall rules on OT/IT boundary.',
      severity: 'HIGH',
      status: 'IN_PROGRESS',
      assignedTo: 'Emma Williams',
      createdAt: '2025-07-08T11:32:40Z',
      resolvedAt: null,
      reporter: 'Security Audit',
      affectedSystems: ['Firewall', 'Network Security'],
      tags: ['configuration', 'compliance', 'firewall']
    },
    {
      id: 'INC-1006',
      title: 'Database Connection Failure',
      description: 'Intermittent connection issues between application servers and historian database.',
      severity: 'MEDIUM',
      status: 'RESOLVED',
      assignedTo: 'David Kim',
      createdAt: '2025-07-07T09:15:10Z',
      resolvedAt: '2025-07-09T16:45:22Z',
      reporter: 'Database Monitor',
      affectedSystems: ['Historian Database', 'Application Servers'],
      tags: ['database', 'connectivity', 'performance']
    },
    {
      id: 'INC-1007',
      title: 'Suspicious File Detected',
      description: 'Antivirus flagged suspicious executable on engineering workstation WS-45.',
      severity: 'HIGH',
      status: 'RESOLVED',
      assignedTo: 'Lisa Patel',
      createdAt: '2025-07-06T15:20:30Z',
      resolvedAt: '2025-07-07T10:12:45Z',
      reporter: 'Security Scanner',
      affectedSystems: ['Engineering Workstation'],
      tags: ['malware', 'security', 'workstation']
    },
    {
      id: 'INC-1008',
      title: 'API Rate Limiting Triggered',
      description: 'External integration API triggered rate limiting due to excessive requests from third-party system.',
      severity: 'LOW',
      status: 'CLOSED',
      assignedTo: 'Ryan Thompson',
      createdAt: '2025-07-05T08:30:15Z',
      resolvedAt: '2025-07-05T11:45:20Z',
      reporter: 'API Gateway',
      affectedSystems: ['Integration API', 'Third-party Connector'],
      tags: ['api', 'rate-limiting', 'integration']
    }
  ]);
  
  // Filter state
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    severity: '',
    timeframe: ''
  });
  
  // Handle filter changes
  const handleFilterChange = useCallback((filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  }, []);
  
  // Add new incident
  const handleAddIncident = useCallback((newIncident) => {
    setIncidents(prev => [newIncident, ...prev]);
    showToast({
      title: 'Incident Created',
      message: `Incident ${newIncident.id} has been created successfully.`,
      type: 'success'
    });
  }, [showToast]);
  
  // Update existing incident
  const handleUpdateIncident = useCallback((incidentId, updatedIncident) => {
    setIncidents(prev => prev.map(incident => 
      incident.id === incidentId ? { ...incident, ...updatedIncident } : incident
    ));
    showToast({
      title: 'Incident Updated',
      message: `Incident ${incidentId} has been updated successfully.`,
      type: 'success'
    });
  }, [showToast]);
  
  // Delete incident
  const handleDeleteIncident = useCallback((incidentId) => {
    setIncidents(prev => prev.filter(incident => incident.id !== incidentId));
    showToast({
      title: 'Incident Deleted',
      message: `Incident ${incidentId} has been deleted.`,
      type: 'info'
    });
  }, [showToast]);
  
  // View incident details
  const handleViewIncidentDetails = useCallback((incident) => {
    // In a real application, this would navigate to a detailed view
    // For now, we'll just show a toast with the incident information
    showToast({
      title: `Incident ${incident.id}`,
      message: `Viewing details for: ${incident.title}`,
      type: 'info'
    });
    
    // Example of how you might navigate to a details page in a real app
    // navigate(`/dashboard/incidents/${incident.id}`);
  }, [showToast]);
  
  // Calculate metrics based on incidents data
  const metrics = useMemo(() => {
    const total = incidents.length;
    const active = incidents.filter(inc => inc.status !== 'RESOLVED' && inc.status !== 'CLOSED').length;
    const resolved = incidents.filter(inc => inc.status === 'RESOLVED' || inc.status === 'CLOSED').length;
    
    // Calculate average resolution time for resolved incidents
    let avgResolutionTime = 'N/A';
    const resolvedIncidents = incidents.filter(inc => inc.resolvedAt);
    
    if (resolvedIncidents.length > 0) {
      const totalResolutionTimeHours = resolvedIncidents.reduce((total, inc) => {
        const createdTime = new Date(inc.createdAt).getTime();
        const resolvedTime = new Date(inc.resolvedAt).getTime();
        const resolutionTimeHours = (resolvedTime - createdTime) / (1000 * 60 * 60);
        return total + resolutionTimeHours;
      }, 0);
      
      const avgHours = Math.round(totalResolutionTimeHours / resolvedIncidents.length);
      avgResolutionTime = avgHours < 24 
        ? `${avgHours}h` 
        : `${Math.round(avgHours / 24)}d ${avgHours % 24}h`;
    }
    
    return {
      total,
      active,
      resolved,
      avgResolutionTime
    };
  }, [incidents]);
  
  // Filter incidents based on filters
  const filteredIncidents = useMemo(() => {
    return incidents.filter(incident => {
      // Search filter (case insensitive)
      if (filters.search && !incident.title.toLowerCase().includes(filters.search.toLowerCase()) && 
          !incident.id.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      
      // Status filter
      if (filters.status && incident.status !== filters.status) {
        return false;
      }
      
      // Severity filter
      if (filters.severity && incident.severity !== filters.severity) {
        return false;
      }
      
      // Timeframe filter
      if (filters.timeframe) {
        const incidentDate = new Date(incident.createdAt);
        const now = new Date();
        
        switch (filters.timeframe) {
          case 'TODAY':
            return incidentDate.toDateString() === now.toDateString();
          case 'WEEK':
            const weekAgo = new Date();
            weekAgo.setDate(now.getDate() - 7);
            return incidentDate >= weekAgo;
          case 'MONTH':
            const monthAgo = new Date();
            monthAgo.setMonth(now.getMonth() - 1);
            return incidentDate >= monthAgo;
          case 'QUARTER':
            const quarterAgo = new Date();
            quarterAgo.setMonth(now.getMonth() - 3);
            return incidentDate >= quarterAgo;
          case 'YEAR':
            const yearAgo = new Date();
            yearAgo.setFullYear(now.getFullYear() - 1);
            return incidentDate >= yearAgo;
          default:
            return true;
        }
      }
      
      return true;
    });
  }, [incidents, filters]);
  
  return (
    <div className="h-full">
      <IncidentsView
        incidents={filteredIncidents}
        metrics={metrics}
        filters={filters}
        onFilterChange={handleFilterChange}
        onAddIncident={handleAddIncident}
        onUpdateIncident={handleUpdateIncident}
        onDeleteIncident={handleDeleteIncident}
        onViewIncidentDetails={handleViewIncidentDetails}
      />
    </div>
  );
};

export default IncidentsPage;
