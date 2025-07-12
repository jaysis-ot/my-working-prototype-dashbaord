import React, { useRef, useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Calendar, Clock, AlertTriangle, CheckCircle, RefreshCw, ZoomIn, ZoomOut } from 'lucide-react';

/**
 * EvidenceLifecycleTimeline Component
 * 
 * A canvas-based timeline visualization showing evidence freshness over time
 * with predictive decay modeling and compliance refresh points.
 * 
 * Features:
 * - Color-coded freshness thresholds (fresh, aging, stale)
 * - Evidence value decay curves
 * - Timeline zooming and filtering
 * - Critical refresh points highlighting
 * - Time travel capabilities to see past/future states
 */
const EvidenceLifecycleTimeline = ({
  evidenceItems,
  complianceRequirements,
  timeRange = { months: 24 },
  onTimePointSelect,
  onEvidenceSelect,
  selectedEvidence
}) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 300 });
  const [hoveredEvidence, setHoveredEvidence] = useState(null);
  const [hoveredDate, setHoveredDate] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [timeOffset, setTimeOffset] = useState(0); // months offset from current date
  
  // Constants for timeline visualization
  const PADDING = 40;
  const TIMELINE_HEIGHT = 50;
  const EVIDENCE_RADIUS = 8;
  const MONTH_WIDTH = 60;
  const DECAY_CURVE_HEIGHT = 100;
  
  // Colors for different states
  const COLORS = {
    fresh: '#10B981', // green
    aging: '#F59E0B', // yellow
    stale: '#EF4444', // red
    timeline: '#CBD5E1', // slate-300
    background: '#F8FAFC', // slate-50
    text: '#1E293B', // slate-800
    gridLine: '#E2E8F0', // slate-200
    refreshPoint: '#8B5CF6', // purple-500
    selectedEvidence: '#2563EB', // blue-600
    hoveredEvidence: '#3B82F6', // blue-500
    decayCurve: '#94A3B8' // slate-400
  };
  
  // Calculate current date and date range
  const currentDate = new Date();
  const startDate = new Date(currentDate);
  startDate.setMonth(startDate.getMonth() - 6 + timeOffset);
  const endDate = new Date(currentDate);
  endDate.setMonth(endDate.getMonth() + (timeRange.months - 6) + timeOffset);
  
  // Handle canvas resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
    
  // Draw the timeline
  const drawTimeline = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const { width, height } = dimensions;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = COLORS.background;
    ctx.fillRect(0, 0, width, height);
    
    // Calculate timeline dimensions
    const timelineY = height - PADDING - TIMELINE_HEIGHT;
    const timelineWidth = width - (PADDING * 2);
    const effectiveMonthWidth = MONTH_WIDTH * zoomLevel;
    const totalMonths = timeRange.months;
    const visibleTimelineWidth = effectiveMonthWidth * totalMonths;
    
    // Draw background grid
    ctx.strokeStyle = COLORS.gridLine;
    ctx.lineWidth = 1;
    
    // Draw horizontal grid lines
    const gridLineCount = 5;
    for (let i = 0; i <= gridLineCount; i++) {
      const y = PADDING + (DECAY_CURVE_HEIGHT * i / gridLineCount);
      ctx.beginPath();
      ctx.moveTo(PADDING, y);
      ctx.lineTo(width - PADDING, y);
      ctx.stroke();
    }
    
    // Draw timeline base
    ctx.strokeStyle = COLORS.timeline;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(PADDING, timelineY);
    ctx.lineTo(PADDING + timelineWidth, timelineY);
    ctx.stroke();
    
    // Draw month markers
    ctx.fillStyle = COLORS.text;
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    
    const monthsToShow = Math.min(totalMonths, Math.ceil(timelineWidth / effectiveMonthWidth));
    const startMonth = timeOffset < 0 ? Math.abs(timeOffset) : 0;
    
    for (let i = 0; i < monthsToShow; i++) {
      const month = startMonth + i;
      const x = PADDING + (i * effectiveMonthWidth);
      
      // Skip if beyond visible area
      if (x > width - PADDING) continue;
      
      // Draw month tick
      ctx.beginPath();
      ctx.moveTo(x, timelineY);
      ctx.lineTo(x, timelineY + 10);
      ctx.stroke();
      
      // Draw month label
      const date = new Date(startDate);
      date.setMonth(date.getMonth() + i);
      const monthName = date.toLocaleString('default', { month: 'short' });
      const year = date.getFullYear();
      ctx.fillText(`${monthName} ${year}`, x, timelineY + 25);
      
      // Draw vertical grid line
      ctx.strokeStyle = COLORS.gridLine;
      ctx.beginPath();
      ctx.moveTo(x, PADDING);
      ctx.lineTo(x, timelineY);
      ctx.stroke();
      ctx.strokeStyle = COLORS.timeline;
    }
    
    // Draw current date marker
    const currentDateX = PADDING + ((6 - timeOffset) * effectiveMonthWidth);
    if (currentDateX >= PADDING && currentDateX <= width - PADDING) {
      ctx.strokeStyle = COLORS.text;
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 3]);
      ctx.beginPath();
      ctx.moveTo(currentDateX, PADDING);
      ctx.lineTo(currentDateX, timelineY + TIMELINE_HEIGHT);
      ctx.stroke();
      ctx.setLineDash([]);
      
      // Draw "Today" label
      ctx.fillStyle = COLORS.text;
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Today', currentDateX, PADDING - 10);
    }
    
    // Draw compliance refresh points
    if (complianceRequirements && complianceRequirements.length > 0) {
      complianceRequirements.forEach(req => {
        // Calculate refresh points based on interval
        const intervalMonths = req.refreshIntervalMonths || 12;
        const refreshPoints = [];
        
        // Calculate past refresh points
        let date = new Date(currentDate);
        while (date >= startDate) {
          refreshPoints.push(new Date(date));
          date.setMonth(date.getMonth() - intervalMonths);
        }
        
        // Calculate future refresh points
        date = new Date(currentDate);
        date.setMonth(date.getMonth() + intervalMonths);
        while (date <= endDate) {
          refreshPoints.push(new Date(date));
          date.setMonth(date.getMonth() + intervalMonths);
        }
        
        // Draw refresh points
        refreshPoints.forEach(date => {
          const monthsDiff = (date.getFullYear() - startDate.getFullYear()) * 12 + 
                            date.getMonth() - startDate.getMonth();
          const x = PADDING + (monthsDiff * effectiveMonthWidth);
          
          // Skip if outside visible area
          if (x < PADDING || x > width - PADDING) return;
          
          // Draw refresh point marker
          ctx.fillStyle = COLORS.refreshPoint;
          ctx.strokeStyle = 'white';
          ctx.lineWidth = 1;
          
          // Draw diamond shape
          const diamondSize = 8;
          ctx.beginPath();
          ctx.moveTo(x, timelineY - diamondSize);
          ctx.lineTo(x + diamondSize, timelineY);
          ctx.lineTo(x, timelineY + diamondSize);
          ctx.lineTo(x - diamondSize, timelineY);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        });
      });
    }
    
    // Draw evidence items
    evidenceItems.forEach(item => {
      // Calculate position based on timestamp
      const itemDate = new Date(item.timestamp);
      const monthsDiff = (itemDate.getFullYear() - startDate.getFullYear()) * 12 + 
                         itemDate.getMonth() - startDate.getMonth() +
                         (itemDate.getDate() / 30); // Approximate day position within month
      
      const x = PADDING + (monthsDiff * effectiveMonthWidth);
      
      // Skip if outside visible area
      if (x < PADDING || x > width - PADDING) return;
      
      // Determine evidence status color
      let color = COLORS[item.status] || COLORS.fresh;
      
      // Draw evidence point
      const isSelected = item.id === selectedEvidence;
      const isHovered = item.id === hoveredEvidence;
      const radius = isSelected || isHovered ? EVIDENCE_RADIUS + 2 : EVIDENCE_RADIUS;
      
      ctx.fillStyle = isSelected ? COLORS.selectedEvidence : 
                     isHovered ? COLORS.hoveredEvidence : color;
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      
      ctx.beginPath();
      ctx.arc(x, timelineY, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      
      // Draw evidence decay curve
      drawDecayCurve(ctx, x, timelineY, item, effectiveMonthWidth);
      
      // Draw evidence label if selected or hovered
      if (isSelected || isHovered) {
        ctx.fillStyle = COLORS.text;
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(item.title, x, timelineY - 20);
        
        // Draw evidence type
        ctx.font = '10px sans-serif';
        ctx.fillText(item.type, x, timelineY - 35);
      }
    });
    
    // Draw hovered date indicator
    if (hoveredDate) {
      const monthsDiff = (hoveredDate.getFullYear() - startDate.getFullYear()) * 12 + 
                         hoveredDate.getMonth() - startDate.getMonth();
      const x = PADDING + (monthsDiff * effectiveMonthWidth);
      
      if (x >= PADDING && x <= width - PADDING) {
        ctx.strokeStyle = COLORS.hoveredEvidence;
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(x, PADDING);
        ctx.lineTo(x, timelineY + TIMELINE_HEIGHT);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Draw date tooltip
        const dateStr = hoveredDate.toLocaleDateString();
        ctx.fillStyle = 'rgba(30, 41, 59, 0.8)'; // slate-800 with opacity
        ctx.beginPath();
        ctx.roundRect(x - 50, PADDING - 30, 100, 20, 4);
        ctx.fill();
        
        ctx.fillStyle = 'white';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(dateStr, x, PADDING - 17);
      }
    }
    
    // Draw timeline legend
    drawLegend(ctx, width, height);
    
  }, [dimensions, evidenceItems, complianceRequirements, zoomLevel, timeOffset, hoveredEvidence, hoveredDate, selectedEvidence, startDate, endDate, timeRange.months]);
  
  // Draw decay curve for an evidence item
  const drawDecayCurve = (ctx, x, timelineY, item, effectiveMonthWidth) => {
    // Define decay parameters based on evidence type
    let decayRate;
    switch (item.type) {
      case 'Intent':
        decayRate = 0.05; // 5% per month
        break;
      case 'Implementation':
        decayRate = 0.1; // 10% per month
        break;
      case 'Behavioral':
        decayRate = 0.15; // 15% per month
        break;
      case 'Validation':
        decayRate = 0.08; // 8% per month
        break;
      default:
        decayRate = 0.1;
    }
    
    // Calculate initial quality based on status
    let initialQuality;
    switch (item.status) {
      case 'fresh':
        initialQuality = 1.0; // 100%
        break;
      case 'aging':
        initialQuality = 0.7; // 70%
        break;
      case 'stale':
        initialQuality = 0.4; // 40%
        break;
      default:
        initialQuality = 1.0;
    }
    
    // Draw decay curve
    ctx.strokeStyle = COLORS.decayCurve;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    
    // Start at evidence point
    ctx.moveTo(x, timelineY);
    
    // Draw curve for future months
    const futureMonths = 12;
    const curveTop = PADDING + DECAY_CURVE_HEIGHT;
    const qualityRange = timelineY - curveTop;
    
    for (let i = 0; i <= futureMonths; i++) {
      const futureX = x + (i * effectiveMonthWidth);
      const quality = initialQuality * Math.exp(-decayRate * i);
      const futureY = timelineY - (quality * qualityRange);
      
      if (i === 0) {
        ctx.moveTo(futureX, futureY);
      } else {
        ctx.lineTo(futureX, futureY);
      }
    }
    
    ctx.stroke();
    
    // Draw threshold lines
    ctx.strokeStyle = COLORS.fresh;
    ctx.setLineDash([2, 2]);
    const freshThresholdY = timelineY - (0.7 * qualityRange);
    ctx.beginPath();
    ctx.moveTo(PADDING, freshThresholdY);
    ctx.lineTo(dimensions.width - PADDING, freshThresholdY);
    ctx.stroke();
    
    ctx.strokeStyle = COLORS.aging;
    const agingThresholdY = timelineY - (0.4 * qualityRange);
    ctx.beginPath();
    ctx.moveTo(PADDING, agingThresholdY);
    ctx.lineTo(dimensions.width - PADDING, agingThresholdY);
    ctx.stroke();
    
    ctx.setLineDash([]);
  };
  
  // Draw legend
  const drawLegend = (ctx, width, height) => {
    const legendX = width - 150;
    const legendY = PADDING;
    const legendWidth = 130;
    const legendHeight = 120;
    
    // Draw legend background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.strokeStyle = COLORS.timeline;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(legendX, legendY, legendWidth, legendHeight, 4);
    ctx.fill();
    ctx.stroke();
    
    // Draw legend title
    ctx.fillStyle = COLORS.text;
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Evidence Status', legendX + 10, legendY + 20);
    
    // Draw legend items
    const items = [
      { label: 'Fresh', color: COLORS.fresh },
      { label: 'Aging', color: COLORS.aging },
      { label: 'Stale', color: COLORS.stale },
      { label: 'Refresh Point', color: COLORS.refreshPoint, shape: 'diamond' }
    ];
    
    items.forEach((item, index) => {
      const itemY = legendY + 40 + (index * 20);
      
      // Draw color indicator
      if (item.shape === 'diamond') {
        // Draw diamond
        const diamondSize = 6;
        ctx.fillStyle = item.color;
        ctx.beginPath();
        ctx.moveTo(legendX + 15, itemY - diamondSize);
        ctx.lineTo(legendX + 15 + diamondSize, itemY);
        ctx.lineTo(legendX + 15, itemY + diamondSize);
        ctx.lineTo(legendX + 15 - diamondSize, itemY);
        ctx.closePath();
        ctx.fill();
      } else {
        // Draw circle
        ctx.fillStyle = item.color;
        ctx.beginPath();
        ctx.arc(legendX + 15, itemY, 6, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Draw label
      ctx.fillStyle = COLORS.text;
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(item.label, legendX + 30, itemY + 4);
    });
  };
  
  // Handle mouse move to detect hovering over evidence items
  const handleMouseMove = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calculate timeline position
    const timelineY = dimensions.height - PADDING - TIMELINE_HEIGHT;
    const effectiveMonthWidth = MONTH_WIDTH * zoomLevel;
    
    // Check if hovering over an evidence item
    let hoveredItem = null;
    evidenceItems.forEach(item => {
      const itemDate = new Date(item.timestamp);
      const monthsDiff = (itemDate.getFullYear() - startDate.getFullYear()) * 12 + 
                         itemDate.getMonth() - startDate.getMonth() +
                         (itemDate.getDate() / 30);
      
      const itemX = PADDING + (monthsDiff * effectiveMonthWidth);
      const distance = Math.sqrt(Math.pow(x - itemX, 2) + Math.pow(y - timelineY, 2));
      
      if (distance <= EVIDENCE_RADIUS + 2) {
        hoveredItem = item;
      }
    });
    
    setHoveredEvidence(hoveredItem ? hoveredItem.id : null);
    
    // Check if hovering over timeline to show date
    if (y >= timelineY - 10 && y <= timelineY + 10 && 
        x >= PADDING && x <= dimensions.width - PADDING) {
      const monthPosition = (x - PADDING) / effectiveMonthWidth;
      const hoveredMonth = new Date(startDate);
      hoveredMonth.setMonth(hoveredMonth.getMonth() + Math.floor(monthPosition));
      // Add days based on fraction of month
      const daysInMonth = new Date(hoveredMonth.getFullYear(), hoveredMonth.getMonth() + 1, 0).getDate();
      const dayFraction = monthPosition - Math.floor(monthPosition);
      hoveredMonth.setDate(1 + Math.floor(dayFraction * daysInMonth));
      
      setHoveredDate(hoveredMonth);
    } else {
      setHoveredDate(null);
    }
  }, [dimensions, zoomLevel, evidenceItems, startDate]);
  
  // Handle mouse click to select evidence or time point
  const handleClick = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calculate timeline position
    const timelineY = dimensions.height - PADDING - TIMELINE_HEIGHT;
    const effectiveMonthWidth = MONTH_WIDTH * zoomLevel;
    
    // Check if clicking on an evidence item
    evidenceItems.forEach(item => {
      const itemDate = new Date(item.timestamp);
      const monthsDiff = (itemDate.getFullYear() - startDate.getFullYear()) * 12 + 
                         itemDate.getMonth() - startDate.getMonth() +
                         (itemDate.getDate() / 30);
      
      const itemX = PADDING + (monthsDiff * effectiveMonthWidth);
      const distance = Math.sqrt(Math.pow(x - itemX, 2) + Math.pow(y - timelineY, 2));
      
      if (distance <= EVIDENCE_RADIUS + 2) {
        if (onEvidenceSelect) {
          onEvidenceSelect(item);
        }
      }
    });
    
    // Check if clicking on timeline to select time point
    if (y >= timelineY - 10 && y <= timelineY + 10 && 
        x >= PADDING && x <= dimensions.width - PADDING) {
      const monthPosition = (x - PADDING) / effectiveMonthWidth;
      const clickedMonth = new Date(startDate);
      clickedMonth.setMonth(clickedMonth.getMonth() + Math.floor(monthPosition));
      // Add days based on fraction of month
      const daysInMonth = new Date(clickedMonth.getFullYear(), clickedMonth.getMonth() + 1, 0).getDate();
      const dayFraction = monthPosition - Math.floor(monthPosition);
      clickedMonth.setDate(1 + Math.floor(dayFraction * daysInMonth));
      
      if (onTimePointSelect) {
        onTimePointSelect(clickedMonth);
      }
    }
  }, [dimensions, zoomLevel, evidenceItems, onEvidenceSelect, onTimePointSelect, startDate]);
  
  // Handle zoom controls
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev * 1.5, 3));
  };
  
  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev / 1.5, 0.5));
  };
  
  // Handle time navigation
  const handleTimeForward = () => {
    setTimeOffset(prev => prev + 3); // Move 3 months forward
  };
  
  const handleTimeBackward = () => {
    setTimeOffset(prev => prev - 3); // Move 3 months backward
  };
  
  const handleResetView = () => {
    setZoomLevel(1);
    setTimeOffset(0);
  };
  
  // Draw the timeline when component updates
  useEffect(() => {
    drawTimeline();
  }, [drawTimeline]);
  
  return (
    <div className={`relative bg-white dark:bg-secondary-800 rounded-lg border border-secondary-200 dark:border-secondary-700 overflow-hidden`} ref={containerRef}>
      <div className="p-4 border-b border-secondary-200 dark:border-secondary-700 flex justify-between items-center">
        <div className="flex items-center">
          <Clock className="w-5 h-5 text-primary-600 mr-2" />
          <h3 className="text-lg font-semibold text-secondary-900 dark:text-white">Evidence Lifecycle Timeline</h3>
        </div>
        
        <div className="flex items-center space-x-2">
          <button 
            onClick={handleTimeBackward}
            className="p-1.5 rounded-md hover:bg-secondary-100 dark:hover:bg-secondary-700"
            aria-label="Move backward in time"
          >
            <Calendar className="w-4 h-4" />
            <span className="sr-only">Previous</span>
          </button>
          
          <button
            onClick={handleZoomOut}
            className="p-1.5 rounded-md hover:bg-secondary-100 dark:hover:bg-secondary-700"
            aria-label="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          
          <button
            onClick={handleResetView}
            className="p-1.5 rounded-md hover:bg-secondary-100 dark:hover:bg-secondary-700"
            aria-label="Reset view"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          
          <button
            onClick={handleZoomIn}
            className="p-1.5 rounded-md hover:bg-secondary-100 dark:hover:bg-secondary-700"
            aria-label="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          
          <button
            onClick={handleTimeForward}
            className="p-1.5 rounded-md hover:bg-secondary-100 dark:hover:bg-secondary-700"
            aria-label="Move forward in time"
          >
            <Calendar className="w-4 h-4" />
            <span className="sr-only">Next</span>
          </button>
        </div>
      </div>
      
      <div className="p-2">
        <canvas 
          ref={canvasRef} 
          width={dimensions.width} 
          height={dimensions.height}
          onMouseMove={handleMouseMove}
          onClick={handleClick}
          className="cursor-pointer"
        />
        
        <div className="mt-2 px-4 text-xs text-secondary-600 dark:text-secondary-400 flex items-center">
          <AlertTriangle className="w-4 h-4 mr-1 text-yellow-500" />
          <span>Evidence quality decays over time. Refresh evidence before it reaches critical thresholds.</span>
        </div>
      </div>
    </div>
  );
};

EvidenceLifecycleTimeline.propTypes = {
  /**
   * Array of evidence items to display on the timeline
   */
  evidenceItems: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
      timestamp: PropTypes.string.isRequired,
      status: PropTypes.oneOf(['fresh', 'aging', 'stale']).isRequired
    })
  ).isRequired,
  
  /**
   * Array of compliance requirements with refresh intervals
   */
  complianceRequirements: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      refreshIntervalMonths: PropTypes.number.isRequired,
      evidenceTypes: PropTypes.arrayOf(PropTypes.string)
    })
  ),
  
  /**
   * Time range to display in months
   */
  timeRange: PropTypes.shape({
    months: PropTypes.number
  }),
  
  /**
   * Callback when a time point is selected
   */
  onTimePointSelect: PropTypes.func,
  
  /**
   * Callback when an evidence item is selected
   */
  onEvidenceSelect: PropTypes.func,
  
  /**
   * ID of the currently selected evidence
   */
  selectedEvidence: PropTypes.string
};

export default EvidenceLifecycleTimeline;
