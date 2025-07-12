import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  FileText, 
  ZoomIn, 
  ZoomOut, 
  Filter, 
  ChevronLeft, 
  ChevronRight,
  Calendar as CalendarIcon,
  ArrowRight,
  Activity,
  RefreshCw,
  AlertCircle,
  Info
} from 'lucide-react';
import * as d3 from 'd3';
import Button from '../atoms/Button';
import Badge from '../atoms/Badge';

/**
 * EvidenceLifecycleTimeline Component
 * 
 * A sophisticated timeline visualization that shows the lifecycle of evidence artifacts,
 * including historical events, predicted decay, and critical refresh points.
 * 
 * Features:
 * - Historical and predicted future events visualization
 * - Color-coded freshness thresholds
 * - Evidence value decay modeling with curves
 * - Timeline zooming and filtering
 * - Time travel to view evidence state at any point
 * - Critical refresh point highlighting
 * 
 * Part of the "golden thread" architecture, this component helps users understand
 * evidence lifecycle and plan for maintenance and refresh activities.
 */
const EvidenceLifecycleTimeline = ({
  evidenceItems = [],
  complianceRequirements = [],
  timeRange = { months: 12 },
  onTimePointSelect,
  onEvidenceSelect,
  selectedDate,
  selectedEvidence,
  className = ''
}) => {
  // Refs for DOM elements
  const timelineRef = useRef(null);
  const tooltipRef = useRef(null);
  
  // State for timeline controls
  const [zoomLevel, setZoomLevel] = useState(1);
  const [timelinePosition, setTimelinePosition] = useState(0);
  const [hoveredEvent, setHoveredEvent] = useState(null);
  const [hoveredEvidence, setHoveredEvidence] = useState(null);
  const [timeFilters, setTimeFilters] = useState({
    showHistorical: true,
    showPredicted: true,
    showCritical: true
  });
  const [evidenceFilters, setEvidenceFilters] = useState({
    type: 'all',
    status: 'all'
  });
  const [timePoint, setTimePoint] = useState(new Date());
  const [isTimeTraveling, setIsTimeTraveling] = useState(false);
  
  // Constants for timeline visualization
  const TIMELINE_HEIGHT = 400;
  const TIMELINE_PADDING = 40;
  const EVENT_RADIUS = 8;
  const DECAY_CURVE_STROKE_WIDTH = 2;
  const MONTH_WIDTH = 80; // Width of one month in pixels at zoom level 1
  
  // Color scales for freshness thresholds
  const freshnessColors = {
    fresh: '#10B981', // green
    aging: '#F59E0B', // amber
    stale: '#EF4444', // red
    critical: '#991B1B' // dark red
  };
  
  // Evidence type icons
  const evidenceTypeIcons = {
    Intent: <FileText size={16} />,
    Implementation: <CheckCircle size={16} />,
    Behavioral: <Activity size={16} />,
    Validation: <AlertCircle size={16} />
  };
  
  // Calculate the timeline width based on zoom level and time range
  const timelineWidth = useMemo(() => {
    return timeRange.months * MONTH_WIDTH * zoomLevel;
  }, [timeRange.months, zoomLevel]);
  
  // Calculate the visible time range based on position and zoom
  const visibleTimeRange = useMemo(() => {
    const now = new Date();
    const startDate = new Date(now);
    startDate.setMonth(now.getMonth() - timeRange.months / 2);
    
    const endDate = new Date(now);
    endDate.setMonth(now.getMonth() + timeRange.months / 2);
    
    return { startDate, endDate, now };
  }, [timeRange.months]);
  
  // Process evidence items to include decay predictions
  const processedEvidenceItems = useMemo(() => {
    return evidenceItems.map(evidence => {
      // Get evidence date based on type
      let evidenceDate;
      switch (evidence.type) {
        case 'Intent':
          evidenceDate = evidence.approvalDate ? new Date(evidence.approvalDate) : null;
          break;
        case 'Implementation':
          evidenceDate = evidence.implementationDate ? new Date(evidence.implementationDate) : null;
          break;
        case 'Behavioral':
          evidenceDate = evidence.collectionDate ? new Date(evidence.collectionDate) : null;
          break;
        case 'Validation':
          evidenceDate = evidence.validationDate ? new Date(evidence.validationDate) : null;
          break;
        default:
          evidenceDate = null;
      }
      
      // If no specific date, try to use timestamp
      if (!evidenceDate && evidence.timestamp) {
        evidenceDate = typeof evidence.timestamp === 'string' ? 
          new Date(evidence.timestamp) : 
          new Date(evidence.timestamp.absolute || evidence.timestamp.relative);
      }
      
      // Default to current date if no date available
      if (!evidenceDate || isNaN(evidenceDate.getTime())) {
        evidenceDate = new Date();
      }
      
      // Different decay rates based on evidence type (% per month)
      const decayRates = {
        Intent: 0.05, // 5% per month
        Implementation: 0.08, // 8% per month
        Behavioral: 0.15, // 15% per month
        Validation: 0.1 // 10% per month
      };
      
      const decayRate = decayRates[evidence.type] || 0.1;
      
      // Calculate initial freshness score based on current age
      const now = new Date();
      const ageInMonths = (now - evidenceDate) / (1000 * 60 * 60 * 24 * 30);
      
      // Different recency thresholds based on evidence type (in months)
      const recencyThresholds = {
        Intent: { fresh: 6, aging: 12, stale: 24 }, // Policy/intent documents
        Implementation: { fresh: 3, aging: 6, stale: 12 }, // Implementation evidence
        Behavioral: { fresh: 1, aging: 3, stale: 6 }, // Behavioral/runtime evidence
        Validation: { fresh: 2, aging: 6, stale: 12 } // Validation evidence
      };
      
      const thresholds = recencyThresholds[evidence.type] || recencyThresholds.Validation;
      
      // Calculate initial freshness score (100-0)
      let initialFreshness;
      if (ageInMonths <= 0) {
        initialFreshness = 100; // Future evidence
      } else if (ageInMonths <= thresholds.fresh) {
        initialFreshness = 100 - ((ageInMonths / thresholds.fresh) * 20); // Fresh (100-80)
      } else if (ageInMonths <= thresholds.aging) {
        initialFreshness = 80 - (((ageInMonths - thresholds.fresh) / (thresholds.aging - thresholds.fresh)) * 30); // Aging (80-50)
      } else if (ageInMonths <= thresholds.stale) {
        initialFreshness = 50 - (((ageInMonths - thresholds.aging) / (thresholds.stale - thresholds.aging)) * 30); // Stale (50-20)
      } else {
        initialFreshness = Math.max(10, 20 - ((ageInMonths - thresholds.stale) / 12) * 10); // Very stale (20-10)
      }
      
      // Generate decay curve data points
      const decayCurve = [];
      const futureMonths = 24; // Project 24 months into the future
      
      // Add historical points (if evidence is not brand new)
      if (ageInMonths > 0) {
        for (let i = Math.floor(ageInMonths); i >= 0; i--) {
          const pointDate = new Date(now);
          pointDate.setMonth(now.getMonth() - i);
          
          let freshnessAtPoint;
          if (i <= thresholds.fresh) {
            freshnessAtPoint = 100 - ((i / thresholds.fresh) * 20); // Fresh (100-80)
          } else if (i <= thresholds.aging) {
            freshnessAtPoint = 80 - (((i - thresholds.fresh) / (thresholds.aging - thresholds.fresh)) * 30); // Aging (80-50)
          } else if (i <= thresholds.stale) {
            freshnessAtPoint = 50 - (((i - thresholds.aging) / (thresholds.stale - thresholds.aging)) * 30); // Stale (50-20)
          } else {
            freshnessAtPoint = Math.max(10, 20 - ((i - thresholds.stale) / 12) * 10); // Very stale (20-10)
          }
          
          decayCurve.push({
            date: pointDate,
            freshness: Math.round(freshnessAtPoint),
            isHistorical: true
          });
        }
      }
      
      // Add current point
      decayCurve.push({
        date: new Date(now),
        freshness: Math.round(initialFreshness),
        isHistorical: false,
        isCurrent: true
      });
      
      // Add future points with decay
      for (let i = 1; i <= futureMonths; i++) {
        const pointDate = new Date(now);
        pointDate.setMonth(now.getMonth() + i);
        
        // Apply decay formula: exponential decay with floor
        const decayedFreshness = Math.max(
          10, // Minimum freshness
          initialFreshness * Math.pow(1 - decayRate, i)
        );
        
        // Determine if this is a critical refresh point
        const isCriticalPoint = 
          (initialFreshness >= 80 && decayedFreshness < 80) || // Fresh to aging transition
          (initialFreshness >= 50 && decayedFreshness < 50) || // Aging to stale transition
          (initialFreshness >= 20 && decayedFreshness < 20);   // Stale to critical transition
        
        decayCurve.push({
          date: pointDate,
          freshness: Math.round(decayedFreshness),
          isHistorical: false,
          isCriticalPoint
        });
      }
      
      // Find compliance-mandated refresh points
      const complianceRefreshPoints = [];
      
      complianceRequirements.forEach(req => {
        if (
          req.evidenceTypes.includes(evidence.type) &&
          (
            !req.frameworks.length || 
            evidence.relationships?.some(rel => 
              rel.type === 'framework' && 
              req.frameworks.includes(rel.label)
            )
          )
        ) {
          // Calculate next refresh date based on requirement
          const refreshDate = new Date(evidenceDate);
          refreshDate.setMonth(refreshDate.getMonth() + req.refreshIntervalMonths);
          
          // Only add if it's in the future
          if (refreshDate > now) {
            complianceRefreshPoints.push({
              date: refreshDate,
              requirement: req.name,
              framework: req.frameworks.join(', '),
              refreshIntervalMonths: req.refreshIntervalMonths
            });
          }
        }
      });
      
      // Calculate current status
      let currentStatus;
      if (initialFreshness >= 80) {
        currentStatus = 'fresh';
      } else if (initialFreshness >= 50) {
        currentStatus = 'aging';
      } else if (initialFreshness >= 20) {
        currentStatus = 'stale';
      } else {
        currentStatus = 'critical';
      }
      
      // Find next status change points
      const nextStatusChangePoints = [];
      
      for (let i = 1; i < decayCurve.length; i++) {
        const prevPoint = decayCurve[i - 1];
        const currPoint = decayCurve[i];
        
        // Check for status threshold crossings
        if (
          (prevPoint.freshness >= 80 && currPoint.freshness < 80) ||
          (prevPoint.freshness >= 50 && currPoint.freshness < 50) ||
          (prevPoint.freshness >= 20 && currPoint.freshness < 20)
        ) {
          let newStatus;
          if (currPoint.freshness < 20) {
            newStatus = 'critical';
          } else if (currPoint.freshness < 50) {
            newStatus = 'stale';
          } else if (currPoint.freshness < 80) {
            newStatus = 'aging';
          }
          
          nextStatusChangePoints.push({
            date: currPoint.date,
            fromStatus: prevPoint.freshness >= 80 ? 'fresh' : 
                        prevPoint.freshness >= 50 ? 'aging' : 
                        prevPoint.freshness >= 20 ? 'stale' : 'critical',
            toStatus: newStatus,
            daysFromNow: Math.round((currPoint.date - now) / (1000 * 60 * 60 * 24))
          });
        }
      }
      
      return {
        ...evidence,
        evidenceDate,
        decayRate,
        initialFreshness,
        currentStatus,
        decayCurve,
        nextStatusChangePoints,
        complianceRefreshPoints
      };
    });
  }, [evidenceItems, complianceRequirements]);
  
  // Filter evidence items based on current filters
  const filteredEvidenceItems = useMemo(() => {
    return processedEvidenceItems.filter(evidence => {
      // Filter by evidence type
      if (evidenceFilters.type !== 'all' && evidence.type !== evidenceFilters.type) {
        return false;
      }
      
      // Filter by evidence status
      if (evidenceFilters.status !== 'all' && evidence.currentStatus !== evidenceFilters.status) {
        return false;
      }
      
      return true;
    });
  }, [processedEvidenceItems, evidenceFilters]);
  
  // Create a time scale for the timeline
  const timeScale = useMemo(() => {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - timeRange.months / 2);
    
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + timeRange.months / 2);
    
    return d3.scaleTime()
      .domain([startDate, endDate])
      .range([TIMELINE_PADDING, timelineWidth - TIMELINE_PADDING]);
  }, [timelineWidth, timeRange.months]);
  
  // Create a freshness scale for the decay curves
  const freshnessScale = useMemo(() => {
    return d3.scaleLinear()
      .domain([0, 100])
      .range([TIMELINE_HEIGHT - TIMELINE_PADDING, TIMELINE_PADDING]);
  }, []);
  
  // Create a line generator for decay curves
  const lineGenerator = useMemo(() => {
    return d3.line()
      .x(d => timeScale(d.date))
      .y(d => freshnessScale(d.freshness))
      .curve(d3.curveMonotoneX);
  }, [timeScale, freshnessScale]);
  
  // Handle timeline zoom in
  const handleZoomIn = useCallback(() => {
    setZoomLevel(prev => Math.min(prev * 1.5, 5));
  }, []);
  
  // Handle timeline zoom out
  const handleZoomOut = useCallback(() => {
    setZoomLevel(prev => Math.max(prev / 1.5, 0.5));
  }, []);
  
  // Handle timeline pan left
  const handlePanLeft = useCallback(() => {
    setTimelinePosition(prev => prev - 100);
  }, []);
  
  // Handle timeline pan right
  const handlePanRight = useCallback(() => {
    setTimelinePosition(prev => prev + 100);
  }, []);
  
  // Handle time filter changes
  const handleTimeFilterChange = useCallback((filter) => {
    setTimeFilters(prev => ({
      ...prev,
      [filter]: !prev[filter]
    }));
  }, []);
  
  // Handle evidence filter changes
  const handleEvidenceFilterChange = useCallback((filter, value) => {
    setEvidenceFilters(prev => ({
      ...prev,
      [filter]: value
    }));
  }, []);
  
  // Handle time point change for time travel
  const handleTimePointChange = useCallback((date) => {
    setTimePoint(date);
    
    if (onTimePointSelect) {
      onTimePointSelect(date);
    }
  }, [onTimePointSelect]);
  
  // Handle time travel toggle
  const handleTimeTravelToggle = useCallback(() => {
    setIsTimeTraveling(prev => !prev);
    
    if (!isTimeTraveling) {
      // When entering time travel mode, set initial time point to now
      handleTimePointChange(new Date());
    }
  }, [isTimeTraveling, handleTimePointChange]);
  
  // Handle evidence selection
  const handleEvidenceSelect = useCallback((evidence) => {
    if (onEvidenceSelect) {
      onEvidenceSelect(evidence);
    }
  }, [onEvidenceSelect]);
  
  // Handle mouse over for evidence items
  const handleEvidenceHover = useCallback((evidence, event) => {
    setHoveredEvidence(evidence);
    
    // Position tooltip
    if (tooltipRef.current) {
      const rect = timelineRef.current.getBoundingClientRect();
      tooltipRef.current.style.left = `${event.clientX - rect.left + 10}px`;
      tooltipRef.current.style.top = `${event.clientY - rect.top - 10}px`;
    }
  }, []);
  
  // Handle mouse leave for evidence items
  const handleEvidenceLeave = useCallback(() => {
    setHoveredEvidence(null);
  }, []);
  
  // Handle mouse over for events
  const handleEventHover = useCallback((event, domEvent) => {
    setHoveredEvent(event);
    
    // Position tooltip
    if (tooltipRef.current) {
      const rect = timelineRef.current.getBoundingClientRect();
      tooltipRef.current.style.left = `${domEvent.clientX - rect.left + 10}px`;
      tooltipRef.current.style.top = `${domEvent.clientY - rect.top - 10}px`;
    }
  }, []);
  
  // Handle mouse leave for events
  const handleEventLeave = useCallback(() => {
    setHoveredEvent(null);
  }, []);
  
  // Draw timeline axes and grid
  useEffect(() => {
    if (!timelineRef.current) return;
    
    // Clear previous axes
    d3.select(timelineRef.current).selectAll('.axis').remove();
    
    // Create time axis
    const timeAxis = d3.axisBottom(timeScale)
      .ticks(d3.timeMonth.every(1))
      .tickFormat(d3.timeFormat('%b %Y'));
    
    // Create freshness axis
    const freshnessAxis = d3.axisLeft(freshnessScale)
      .ticks(5)
      .tickFormat(d => `${d}%`);
    
    // Draw time axis
    d3.select(timelineRef.current)
      .append('g')
      .attr('class', 'axis time-axis')
      .attr('transform', `translate(0, ${TIMELINE_HEIGHT - TIMELINE_PADDING})`)
      .call(timeAxis);
    
    // Draw freshness axis
    d3.select(timelineRef.current)
      .append('g')
      .attr('class', 'axis freshness-axis')
      .attr('transform', `translate(${TIMELINE_PADDING}, 0)`)
      .call(freshnessAxis);
    
    // Draw freshness threshold lines
    const thresholds = [
      { value: 80, label: 'Fresh', color: freshnessColors.fresh },
      { value: 50, label: 'Aging', color: freshnessColors.aging },
      { value: 20, label: 'Stale', color: freshnessColors.stale }
    ];
    
    thresholds.forEach(threshold => {
      // Draw threshold line
      d3.select(timelineRef.current)
        .append('line')
        .attr('class', 'threshold-line')
        .attr('x1', TIMELINE_PADDING)
        .attr('y1', freshnessScale(threshold.value))
        .attr('x2', timelineWidth - TIMELINE_PADDING)
        .attr('y2', freshnessScale(threshold.value))
        .attr('stroke', threshold.color)
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '5,5');
      
      // Add threshold label
      d3.select(timelineRef.current)
        .append('text')
        .attr('class', 'threshold-label')
        .attr('x', TIMELINE_PADDING - 5)
        .attr('y', freshnessScale(threshold.value))
        .attr('dy', '0.32em')
        .attr('text-anchor', 'end')
        .attr('fill', threshold.color)
        .attr('font-size', '10px')
        .text(threshold.label);
    });
    
    // Draw current time indicator
    const now = new Date();
    
    d3.select(timelineRef.current)
      .append('line')
      .attr('class', 'current-time-line')
      .attr('x1', timeScale(now))
      .attr('y1', TIMELINE_PADDING)
      .attr('x2', timeScale(now))
      .attr('y2', TIMELINE_HEIGHT - TIMELINE_PADDING)
      .attr('stroke', '#6366F1') // indigo
      .attr('stroke-width', 2);
    
    d3.select(timelineRef.current)
      .append('text')
      .attr('class', 'current-time-label')
      .attr('x', timeScale(now))
      .attr('y', TIMELINE_PADDING - 10)
      .attr('text-anchor', 'middle')
      .attr('fill', '#6366F1') // indigo
      .attr('font-size', '10px')
      .text('Now');
    
    // Draw time travel indicator if active
    if (isTimeTraveling) {
      d3.select(timelineRef.current)
        .append('line')
        .attr('class', 'time-travel-line')
        .attr('x1', timeScale(timePoint))
        .attr('y1', TIMELINE_PADDING)
        .attr('x2', timeScale(timePoint))
        .attr('y2', TIMELINE_HEIGHT - TIMELINE_PADDING)
        .attr('stroke', '#8B5CF6') // purple
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '5,5');
      
      d3.select(timelineRef.current)
        .append('text')
        .attr('class', 'time-travel-label')
        .attr('x', timeScale(timePoint))
        .attr('y', TIMELINE_PADDING - 10)
        .attr('text-anchor', 'middle')
        .attr('fill', '#8B5CF6') // purple
        .attr('font-size', '10px')
        .text('Time Point');
    }
  }, [timeScale, freshnessScale, timelineWidth, isTimeTraveling, timePoint]);
  
  // Render decay curves for each evidence item
  const renderDecayCurves = useCallback(() => {
    return filteredEvidenceItems.map(evidence => {
      // Split curve into historical and future segments
      const historicalPoints = evidence.decayCurve.filter(point => point.isHistorical);
      const futurePoints = evidence.decayCurve.filter(point => !point.isHistorical);
      
      // Only show segments based on filters
      const showHistorical = timeFilters.showHistorical && historicalPoints.length > 0;
      const showFuture = timeFilters.showPredicted && futurePoints.length > 0;
      
      // Get status color for the curve
      const curveColor = freshnessColors[evidence.currentStatus];
      
      return (
        <g key={evidence.id} className="evidence-decay-curve">
          {/* Historical segment */}
          {showHistorical && (
            <path
              d={lineGenerator(historicalPoints)}
              fill="none"
              stroke={curveColor}
              strokeWidth={DECAY_CURVE_STROKE_WIDTH}
              strokeDasharray="5,5"
              opacity={selectedEvidence === evidence.id ? 1 : 0.7}
            />
          )}
          
          {/* Future segment */}
          {showFuture && (
            <path
              d={lineGenerator(futurePoints)}
              fill="none"
              stroke={curveColor}
              strokeWidth={DECAY_CURVE_STROKE_WIDTH}
              opacity={selectedEvidence === evidence.id ? 1 : 0.5}
            />
          )}
          
          {/* Evidence creation point */}
          <circle
            cx={timeScale(evidence.evidenceDate)}
            cy={freshnessScale(100)} // Evidence starts at 100% freshness
            r={EVENT_RADIUS}
            fill={curveColor}
            stroke="#fff"
            strokeWidth={2}
            cursor="pointer"
            onClick={() => handleEvidenceSelect(evidence)}
            onMouseEnter={(e) => handleEvidenceHover(evidence, e)}
            onMouseLeave={handleEvidenceLeave}
          />
          
          {/* Current point */}
          <circle
            cx={timeScale(new Date())}
            cy={freshnessScale(evidence.initialFreshness)}
            r={EVENT_RADIUS - 2}
            fill={curveColor}
            stroke="#fff"
            strokeWidth={1}
            opacity={0.8}
          />
          
          {/* Status change points */}
          {timeFilters.showPredicted && evidence.nextStatusChangePoints.map((point, index) => (
            <circle
              key={`status-change-${evidence.id}-${index}`}
              cx={timeScale(point.date)}
              cy={freshnessScale(point.toStatus === 'aging' ? 80 : point.toStatus === 'stale' ? 50 : 20)}
              r={EVENT_RADIUS - 1}
              fill={freshnessColors[point.toStatus]}
              stroke="#fff"
              strokeWidth={1}
              strokeDasharray="2,2"
              cursor="pointer"
              onMouseEnter={(e) => handleEventHover({
                type: 'statusChange',
                evidence,
                ...point
              }, e)}
              onMouseLeave={handleEventLeave}
            />
          ))}
          
          {/* Compliance refresh points */}
          {timeFilters.showCritical && evidence.complianceRefreshPoints.map((point, index) => (
            <g
              key={`compliance-refresh-${evidence.id}-${index}`}
              transform={`translate(${timeScale(point.date)}, ${freshnessScale(80)})`}
              cursor="pointer"
              onMouseEnter={(e) => handleEventHover({
                type: 'complianceRefresh',
                evidence,
                ...point
              }, e)}
              onMouseLeave={handleEventLeave}
            >
              <rect
                x={-8}
                y={-8}
                width={16}
                height={16}
                fill="#8B5CF6" // purple
                stroke="#fff"
                strokeWidth={1}
                transform="rotate(45)"
              />
              <RefreshCw
                className="refresh-icon"
                size={10}
                color="#fff"
                style={{
                  transform: 'translate(-5px, -5px)'
                }}
              />
            </g>
          ))}
        </g>
      );
    });
  }, [
    filteredEvidenceItems,
    timeFilters,
    timeScale,
    freshnessScale,
    lineGenerator,
    selectedEvidence,
    handleEvidenceSelect,
    handleEvidenceHover,
    handleEvidenceLeave,
    handleEventHover,
    handleEventLeave
  ]);
  
  // Render tooltip content
  const renderTooltip = useCallback(() => {
    if (hoveredEvidence) {
      return (
        <div className="p-3 max-w-xs">
          <div className="font-semibold text-secondary-900 dark:text-white mb-1">
            {hoveredEvidence.title}
          </div>
          <div className="text-xs text-secondary-500 dark:text-secondary-400 mb-2">
            {hoveredEvidence.type} Evidence
          </div>
          <div className="flex items-center gap-2 mb-2">
            <Badge 
              variant={hoveredEvidence.currentStatus === 'fresh' ? 'success' : 
                      hoveredEvidence.currentStatus === 'aging' ? 'warning' : 
                      hoveredEvidence.currentStatus === 'stale' ? 'error' : 'default'}
              size="sm"
            >
              {hoveredEvidence.currentStatus.charAt(0).toUpperCase() + hoveredEvidence.currentStatus.slice(1)}
            </Badge>
            <span className="text-xs text-secondary-500 dark:text-secondary-400">
              {Math.round(hoveredEvidence.initialFreshness)}% freshness
            </span>
          </div>
          <div className="text-xs text-secondary-600 dark:text-secondary-400">
            Created: {hoveredEvidence.evidenceDate.toLocaleDateString()}
          </div>
          <div className="text-xs text-secondary-600 dark:text-secondary-400">
            Decay rate: {hoveredEvidence.decayRate * 100}% per month
          </div>
          {hoveredEvidence.nextStatusChangePoints.length > 0 && (
            <div className="mt-2 text-xs text-secondary-600 dark:text-secondary-400">
              Next status change: {hoveredEvidence.nextStatusChangePoints[0].toStatus} in {hoveredEvidence.nextStatusChangePoints[0].daysFromNow} days
            </div>
          )}
        </div>
      );
    }
    
    if (hoveredEvent) {
      if (hoveredEvent.type === 'statusChange') {
        return (
          <div className="p-3 max-w-xs">
            <div className="font-semibold text-secondary-900 dark:text-white mb-1">
              Status Change
            </div>
            <div className="text-xs text-secondary-600 dark:text-secondary-400 mb-2">
              {hoveredEvent.evidence.title}
            </div>
            <div className="flex items-center gap-2 mb-2">
              <Badge 
                variant={hoveredEvent.fromStatus === 'fresh' ? 'success' : 
                        hoveredEvent.fromStatus === 'aging' ? 'warning' : 
                        hoveredEvent.fromStatus === 'stale' ? 'error' : 'default'}
                size="sm"
              >
                {hoveredEvent.fromStatus.charAt(0).toUpperCase() + hoveredEvent.fromStatus.slice(1)}
              </Badge>
              <ArrowRight size={12} />
              <Badge 
                variant={hoveredEvent.toStatus === 'fresh' ? 'success' : 
                        hoveredEvent.toStatus === 'aging' ? 'warning' : 
                        hoveredEvent.toStatus === 'stale' ? 'error' : 'default'}
                size="sm"
              >
                {hoveredEvent.toStatus.charAt(0).toUpperCase() + hoveredEvent.toStatus.slice(1)}
              </Badge>
            </div>
            <div className="text-xs text-secondary-600 dark:text-secondary-400">
              Date: {hoveredEvent.date.toLocaleDateString()}
            </div>
            <div className="text-xs text-secondary-600 dark:text-secondary-400">
              In {hoveredEvent.daysFromNow} days
            </div>
          </div>
        );
      }
      
      if (hoveredEvent.type === 'complianceRefresh') {
        return (
          <div className="p-3 max-w-xs">
            <div className="font-semibold text-secondary-900 dark:text-white mb-1">
              Compliance Refresh Required
            </div>
            <div className="text-xs text-secondary-600 dark:text-secondary-400 mb-2">
              {hoveredEvent.evidence.title}
            </div>
            <div className="text-xs text-secondary-600 dark:text-secondary-400">
              Requirement: {hoveredEvent.requirement}
            </div>
            {hoveredEvent.framework && (
              <div className="text-xs text-secondary-600 dark:text-secondary-400">
                Framework: {hoveredEvent.framework}
              </div>
            )}
            <div className="text-xs text-secondary-600 dark:text-secondary-400">
              Refresh date: {hoveredEvent.date.toLocaleDateString()}
            </div>
            <div className="text-xs text-secondary-600 dark:text-secondary-400">
              Interval: Every {hoveredEvent.refreshIntervalMonths} months
            </div>
          </div>
        );
      }
    }
    
    return null;
  }, [hoveredEvidence, hoveredEvent]);
  
  // Render evidence items in the legend
  const renderEvidenceLegend = useCallback(() => {
    return filteredEvidenceItems.map(evidence => (
      <div 
        key={evidence.id}
        className={`flex items-center p-2 rounded-md cursor-pointer transition-colors ${
          selectedEvidence === evidence.id 
            ? 'bg-secondary-100 dark:bg-secondary-800' 
            : 'hover:bg-secondary-50 dark:hover:bg-secondary-800/50'
        }`}
        onClick={() => handleEvidenceSelect(evidence)}
      >
        <div 
          className="w-3 h-3 rounded-full mr-2" 
          style={{ backgroundColor: freshnessColors[evidence.currentStatus] }}
        ></div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-secondary-900 dark:text-white truncate">
            {evidence.title}
          </div>
          <div className="flex items-center text-xs text-secondary-500 dark:text-secondary-400">
            <span className="mr-1">{evidence.type}</span>
            <span>•</span>
            <span className="ml-1">{Math.round(evidence.initialFreshness)}%</span>
          </div>
        </div>
        {evidence.nextStatusChangePoints.length > 0 && (
          <Badge 
            variant={evidence.nextStatusChangePoints[0].toStatus === 'aging' ? 'warning' : 
                    evidence.nextStatusChangePoints[0].toStatus === 'stale' ? 'error' : 'default'}
            size="sm"
          >
            {evidence.nextStatusChangePoints[0].daysFromNow}d
          </Badge>
        )}
      </div>
    ));
  }, [filteredEvidenceItems, selectedEvidence, handleEvidenceSelect]);
  
  return (
    <div className={`bg-white dark:bg-secondary-800 rounded-lg border border-secondary-200 dark:border-secondary-700 overflow-hidden ${className}`}>
      {/* Header with controls */}
      <div className="p-4 border-b border-secondary-200 dark:border-secondary-700">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="text-lg font-semibold text-secondary-900 dark:text-white flex items-center">
            <Clock className="w-5 h-5 mr-2 text-primary-600 dark:text-primary-400" />
            Evidence Lifecycle Timeline
          </h3>
          
          <div className="flex items-center gap-2">
            {/* Time travel toggle */}
            <Button
              variant={isTimeTraveling ? "primary" : "secondary"}
              size="sm"
              leadingIcon={CalendarIcon}
              onClick={handleTimeTravelToggle}
            >
              Time Travel
            </Button>
            
            {/* Zoom controls */}
            <div className="flex items-center border border-secondary-200 dark:border-secondary-700 rounded-md">
              <button
                className="p-1.5 hover:bg-secondary-100 dark:hover:bg-secondary-700"
                onClick={handleZoomOut}
                aria-label="Zoom out"
              >
                <ZoomOut size={16} />
              </button>
              <div className="px-2 border-l border-r border-secondary-200 dark:border-secondary-700 text-xs text-secondary-600 dark:text-secondary-400">
                {Math.round(zoomLevel * 100)}%
              </div>
              <button
                className="p-1.5 hover:bg-secondary-100 dark:hover:bg-secondary-700"
                onClick={handleZoomIn}
                aria-label="Zoom in"
              >
                <ZoomIn size={16} />
              </button>
            </div>
            
            {/* Pan controls */}
            <div className="flex items-center border border-secondary-200 dark:border-secondary-700 rounded-md">
              <button
                className="p-1.5 hover:bg-secondary-100 dark:hover:bg-secondary-700"
                onClick={handlePanLeft}
                aria-label="Pan left"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                className="p-1.5 hover:bg-secondary-100 dark:hover:bg-secondary-700"
                onClick={handlePanRight}
                aria-label="Pan right"
              >
                <ChevronRight size={16} />
              </button>
            </div>
            
            {/* Filter button */}
            <Button
              variant="secondary"
              size="sm"
              leadingIcon={Filter}
              onClick={() => {}}
            >
              Filter
            </Button>
          </div>
        </div>
        
        {/* Time travel controls */}
        {isTimeTraveling && (
          <div className="mt-4 flex items-center gap-4">
            <div className="text-sm text-secondary-700 dark:text-secondary-300">
              Time point: {timePoint.toLocaleDateString()}
            </div>
            <input
              type="date"
              className="px-3 py-1.5 text-sm border border-secondary-300 dark:border-secondary-600 rounded-md bg-white dark:bg-secondary-700 text-secondary-900 dark:text-white"
              value={timePoint.toISOString().split('T')[0]}
              onChange={(e) => handleTimePointChange(new Date(e.target.value))}
            />
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleTimePointChange(new Date())}
            >
              Reset to Now
            </Button>
          </div>
        )}
        
        {/* Filter tags */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {/* Time filters */}
          <div 
            className={`px-2 py-1 text-xs rounded-full cursor-pointer ${
              timeFilters.showHistorical 
                ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300' 
                : 'bg-secondary-100 dark:bg-secondary-800 text-secondary-600 dark:text-secondary-400'
            }`}
            onClick={() => handleTimeFilterChange('showHistorical')}
          >
            Historical
          </div>
          <div 
            className={`px-2 py-1 text-xs rounded-full cursor-pointer ${
              timeFilters.showPredicted 
                ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300' 
                : 'bg-secondary-100 dark:bg-secondary-800 text-secondary-600 dark:text-secondary-400'
            }`}
            onClick={() => handleTimeFilterChange('showPredicted')}
          >
            Predicted
          </div>
          <div 
            className={`px-2 py-1 text-xs rounded-full cursor-pointer ${
              timeFilters.showCritical 
                ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300' 
                : 'bg-secondary-100 dark:bg-secondary-800 text-secondary-600 dark:text-secondary-400'
            }`}
            onClick={() => handleTimeFilterChange('showCritical')}
          >
            Compliance Points
          </div>
          
          {/* Type filter */}
          <select
            className="ml-2 px-2 py-1 text-xs border border-secondary-300 dark:border-secondary-600 rounded-md bg-white dark:bg-secondary-700 text-secondary-900 dark:text-white"
            value={evidenceFilters.type}
            onChange={(e) => handleEvidenceFilterChange('type', e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="Intent">Intent</option>
            <option value="Implementation">Implementation</option>
            <option value="Behavioral">Behavioral</option>
            <option value="Validation">Validation</option>
          </select>
          
          {/* Status filter */}
          <select
            className="px-2 py-1 text-xs border border-secondary-300 dark:border-secondary-600 rounded-md bg-white dark:bg-secondary-700 text-secondary-900 dark:text-white"
            value={evidenceFilters.status}
            onChange={(e) => handleEvidenceFilterChange('status', e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="fresh">Fresh</option>
            <option value="aging">Aging</option>
            <option value="stale">Stale</option>
            <option value="critical">Critical</option>
          </select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4">
        {/* Timeline visualization */}
        <div className="lg:col-span-3 p-4 relative overflow-hidden">
          <div 
            className="timeline-container overflow-auto"
            style={{ 
              maxWidth: '100%', 
              overflowX: 'auto',
              transform: `translateX(${timelinePosition}px)` 
            }}
          >
            <svg
              ref={timelineRef}
              width={timelineWidth}
              height={TIMELINE_HEIGHT}
              className="timeline-svg"
            >
              {/* Decay curves will be rendered here */}
              {renderDecayCurves()}
            </svg>
          </div>
          
          {/* Tooltip */}
          {(hoveredEvidence || hoveredEvent) && (
            <div
              ref={tooltipRef}
              className="absolute z-10 bg-white dark:bg-secondary-800 rounded-lg shadow-lg border border-secondary-200 dark:border-secondary-700 text-sm"
            >
              {renderTooltip()}
            </div>
          )}
        </div>
        
        {/* Evidence legend */}
        <div className="border-t lg:border-t-0 lg:border-l border-secondary-200 dark:border-secondary-700 p-4">
          <div className="text-sm font-medium text-secondary-900 dark:text-white mb-3">
            Evidence Items
          </div>
          
          <div className="space-y-1 max-h-[300px] overflow-y-auto">
            {filteredEvidenceItems.length > 0 ? (
              renderEvidenceLegend()
            ) : (
              <div className="text-sm text-secondary-500 dark:text-secondary-400 text-center py-4">
                No evidence items match the current filters
              </div>
            )}
          </div>
          
          {/* Legend for thresholds */}
          <div className="mt-6">
            <div className="text-sm font-medium text-secondary-900 dark:text-white mb-3">
              Freshness Thresholds
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: freshnessColors.fresh }}></div>
                <div className="text-xs text-secondary-700 dark:text-secondary-300">
                  Fresh (80-100%)
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: freshnessColors.aging }}></div>
                <div className="text-xs text-secondary-700 dark:text-secondary-300">
                  Aging (50-79%)
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: freshnessColors.stale }}></div>
                <div className="text-xs text-secondary-700 dark:text-secondary-300">
                  Stale (20-49%)
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: freshnessColors.critical }}></div>
                <div className="text-xs text-secondary-700 dark:text-secondary-300">
                  Critical (0-19%)
                </div>
              </div>
            </div>
          </div>
          
          {/* Legend for event markers */}
          <div className="mt-6">
            <div className="text-sm font-medium text-secondary-900 dark:text-white mb-3">
              Event Markers
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-primary-500 mr-2"></div>
                <div className="text-xs text-secondary-700 dark:text-secondary-300">
                  Evidence Creation
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full border-2 border-white bg-primary-500 mr-2" style={{ opacity: 0.7 }}></div>
                <div className="text-xs text-secondary-700 dark:text-secondary-300">
                  Current State
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full border border-white bg-status-warning mr-2" style={{ opacity: 0.7 }}></div>
                <div className="text-xs text-secondary-700 dark:text-secondary-300">
                  Status Change Point
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-purple-500 mr-2" style={{ transform: 'rotate(45deg)' }}></div>
                <div className="text-xs text-secondary-700 dark:text-secondary-300">
                  Compliance Refresh Point
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

EvidenceLifecycleTimeline.propTypes = {
  /**
   * Array of evidence items to display in the timeline
   */
  evidenceItems: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      type: PropTypes.oneOf(['Intent', 'Implementation', 'Behavioral', 'Validation']).isRequired,
      status: PropTypes.oneOf(['fresh', 'aging', 'stale']),
      timestamp: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.shape({
          relative: PropTypes.string,
          absolute: PropTypes.string
        })
      ]),
      relationships: PropTypes.arrayOf(
        PropTypes.shape({
          label: PropTypes.string.isRequired,
          type: PropTypes.string.isRequired
        })
      )
    })
  ),
  
  /**
   * Array of compliance requirements that mandate evidence refresh
   */
  complianceRequirements: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      refreshIntervalMonths: PropTypes.number.isRequired,
      evidenceTypes: PropTypes.arrayOf(
        PropTypes.oneOf(['Intent', 'Implementation', 'Behavioral', 'Validation'])
      ).isRequired,
      frameworks: PropTypes.arrayOf(PropTypes.string)
    })
  ),
  
  /**
   * Time range to display in the timeline (in months)
   */
  timeRange: PropTypes.shape({
    months: PropTypes.number
  }),
  
  /**
   * Handler for when a time point is selected
   */
  onTimePointSelect: PropTypes.func,
  
  /**
   * Handler for when an evidence item is selected
   */
  onEvidenceSelect: PropTypes.func,
  
  /**
   * Currently selected date for time travel
   */
  selectedDate: PropTypes.instanceOf(Date),
  
  /**
   * ID of the currently selected evidence item
   */
  selectedEvidence: PropTypes.string,
  
  /**
   * Additional CSS classes
   */
  className: PropTypes.string
};

export default EvidenceLifecycleTimeline;
