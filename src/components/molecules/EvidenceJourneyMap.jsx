import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { 
  AlertTriangle, 
  Target, 
  Shield, 
  Lock, 
  FileText, 
  Heart,
  Book,
  FileCode,
  ClipboardCheck,
  Activity,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Info
} from 'lucide-react';
import Badge from '../atoms/Badge';

/**
 * EvidenceJourneyMap Component
 * 
 * A visualization of the "golden thread" architecture showing the relationships
 * between threats, risks, capabilities, controls, evidence, and trust scores.
 * 
 * This component provides an interactive way to explore how evidence connects
 * all aspects of the security and compliance program.
 */
const EvidenceJourneyMap = ({ 
  data, 
  selectedPath = null, 
  onPathSelect, 
  onNodeClick,
  highlightedElement = null,
  compact = false
}) => {
  const [expandedNodes, setExpandedNodes] = useState({});
  const [activeConnection, setActiveConnection] = useState(null);
  const containerRef = useRef(null);
  const [tooltipContent, setTooltipContent] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // Define the journey stages and their icons
  const journeyStages = [
    { id: 'threat', label: 'Threat', icon: AlertTriangle, color: 'red' },
    { id: 'risk', label: 'Risk', icon: Target, color: 'orange' },
    { id: 'capability', label: 'Capability', icon: Shield, color: 'blue' },
    { id: 'control', label: 'Control', icon: Lock, color: 'purple' },
    { id: 'evidence', label: 'Evidence', icon: FileText, color: 'green' },
    { id: 'trustScore', label: 'Trust Score', icon: Heart, color: 'pink' }
  ];

  // Define the parallel journey for compliance - reordered as requested
  const complianceJourney = [
    { id: 'framework', label: 'Framework', icon: Book, color: 'indigo' },
    { id: 'policy', label: 'Policy', icon: FileCode, color: 'teal' },
    { id: 'requirement', label: 'Requirement', icon: ClipboardCheck, color: 'cyan' },
    { id: 'implementation', label: 'Implementation', icon: Shield, color: 'blue' },
    { id: 'validation', label: 'Validation', icon: CheckCircle, color: 'green' },
    { id: 'monitoring', label: 'Monitoring', icon: Activity, color: 'violet' }
  ];

  // Toggle expanded state for a node
  const toggleNodeExpanded = (nodeId) => {
    setExpandedNodes(prev => ({
      ...prev,
      [nodeId]: !prev[nodeId]
    }));
  };

  // Handle mouse over for connections
  const handleConnectionHover = (connectionId) => {
    setActiveConnection(connectionId);
  };

  // Handle mouse leave for connections
  const handleConnectionLeave = () => {
    setActiveConnection(null);
  };

  // Handle showing tooltip
  const handleShowTooltip = (e, content) => {
    const rect = containerRef.current.getBoundingClientRect();
    setTooltipContent(content);
    setTooltipPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  // Handle hiding tooltip
  const handleHideTooltip = () => {
    setTooltipContent(null);
  };

  // Reset tooltip when component unmounts
  useEffect(() => {
    return () => {
      setTooltipContent(null);
    };
  }, []);

  // Helper to check if a node is expanded
  const isNodeExpanded = (nodeId) => {
    return expandedNodes[nodeId] || false;
  };

  // Helper to check if a node is highlighted
  const isNodeHighlighted = (nodeId, nodeType) => {
    if (!highlightedElement) return false;
    return highlightedElement.type === nodeType && highlightedElement.id === nodeId;
  };

  // Helper to check if a connection is active
  const isConnectionActive = (connectionId) => {
    return activeConnection === connectionId;
  };

  // Helper to check if a path is selected
  const isPathSelected = (pathId) => {
    return selectedPath === pathId;
  };

  // Render a journey node
  const renderJourneyNode = (stage, item, index) => {
    const Icon = stage.icon;
    const isHighlighted = isNodeHighlighted(item.id, stage.id);
    const isExpanded = isNodeExpanded(`${stage.id}-${item.id}`);
    
    return (
      <div 
        key={`${stage.id}-${item.id}`}
        className={`
          relative p-3 rounded-lg border transition-all
          ${isHighlighted 
            ? `bg-${stage.color}-50 border-${stage.color}-500 shadow-md dark:bg-${stage.color}-900/20 dark:border-${stage.color}-700` 
            : 'bg-white border-secondary-200 hover:border-secondary-300 dark:bg-secondary-800 dark:border-secondary-700 dark:hover:border-secondary-600'}
        `}
        onClick={() => onNodeClick && onNodeClick(stage.id, item)}
        onMouseEnter={(e) => handleShowTooltip(e, {
          title: item.name || item.label,
          type: stage.label,
          description: item.description
        })}
        onMouseLeave={handleHideTooltip}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full bg-${stage.color}-100 dark:bg-${stage.color}-900/30 flex items-center justify-center mr-3`}>
              <Icon className={`w-4 h-4 text-${stage.color}-600 dark:text-${stage.color}-400`} />
            </div>
            <div>
              <div className="font-medium text-secondary-900 dark:text-white">{item.name || item.label}</div>
              {!compact && (
                <div className="text-xs text-secondary-500 dark:text-secondary-400">
                  {item.subtitle || `${stage.label} ${index + 1}`}
                </div>
              )}
            </div>
          </div>
          
          {item.children && item.children.length > 0 && (
            <button
              className="ml-2 p-1 rounded-full hover:bg-secondary-100 dark:hover:bg-secondary-700"
              onClick={(e) => {
                e.stopPropagation();
                toggleNodeExpanded(`${stage.id}-${item.id}`);
              }}
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 text-secondary-500 dark:text-secondary-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-secondary-500 dark:text-secondary-400" />
              )}
            </button>
          )}
        </div>
        
        {/* Status indicators */}
        {!compact && item.status && (
          <div className="mt-2 flex items-center gap-2">
            <Badge 
              variant={
                item.status === 'complete' ? 'success' : 
                item.status === 'partial' ? 'warning' : 
                item.status === 'missing' ? 'error' : 'default'
              }
              size="sm"
            >
              {item.status === 'complete' ? 'Complete' : 
               item.status === 'partial' ? 'Partial' : 
               item.status === 'missing' ? 'Missing' : item.status}
            </Badge>
            
            {item.coverage && (
              <span className="text-xs text-secondary-500 dark:text-secondary-400">
                {item.coverage}% coverage
              </span>
            )}
          </div>
        )}
        
        {/* Expanded children */}
        {isExpanded && item.children && item.children.length > 0 && (
          <div className="mt-3 pl-4 border-l border-secondary-200 dark:border-secondary-700 space-y-2">
            {item.children.map((child, childIndex) => (
              <div 
                key={`${stage.id}-${item.id}-child-${childIndex}`}
                className="flex items-center py-1 px-2 rounded hover:bg-secondary-50 dark:hover:bg-secondary-700/50 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  onNodeClick && onNodeClick(stage.id, child);
                }}
              >
                <div className={`w-2 h-2 rounded-full bg-${stage.color}-500 mr-2`}></div>
                <div className="text-sm text-secondary-700 dark:text-secondary-300">{child.name || child.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Render connection lines between journey stages
  const renderConnections = () => {
    if (compact) return null;
    
    return (
      <div className="absolute inset-0 pointer-events-none">
        {/* This would contain SVG lines connecting the nodes */}
        {/* For a full implementation, we would calculate positions of nodes and draw SVG paths */}
        {/* For simplicity, this is just a placeholder */}
      </div>
    );
  };

  // Render the tooltip
  const renderTooltip = () => {
    if (!tooltipContent) return null;
    
    return (
      <div 
        className="absolute z-50 bg-white dark:bg-secondary-800 rounded-lg shadow-lg border border-secondary-200 dark:border-secondary-700 p-3 max-w-xs"
        style={{
          left: `${tooltipPosition.x + 10}px`,
          top: `${tooltipPosition.y + 10}px`
        }}
      >
        <div className="font-medium text-secondary-900 dark:text-white mb-1">{tooltipContent.title}</div>
        <div className="text-xs text-secondary-500 dark:text-secondary-400 mb-2">{tooltipContent.type}</div>
        {tooltipContent.description && (
          <div className="text-sm text-secondary-700 dark:text-secondary-300">{tooltipContent.description}</div>
        )}
      </div>
    );
  };

  // If no data is provided, show a placeholder
  if (!data || (data.primary && data.primary.length === 0) && (data.compliance && data.compliance.length === 0)) {
    return (
      <div className="bg-white dark:bg-secondary-800 rounded-lg border border-secondary-200 dark:border-secondary-700 p-6 text-center">
        <div className="flex justify-center mb-4">
          <Info className="w-12 h-12 text-secondary-400 dark:text-secondary-600" />
        </div>
        <h3 className="text-lg font-medium text-secondary-900 dark:text-white mb-2">Evidence Journey Map</h3>
        <p className="text-secondary-500 dark:text-secondary-400 max-w-md mx-auto">
          The evidence journey map visualizes how evidence connects threats, risks, capabilities, 
          controls, and trust scores in your security program.
        </p>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="bg-white dark:bg-secondary-800 rounded-lg border border-secondary-200 dark:border-secondary-700 p-6 relative"
    >
      <div className="mb-4 flex justify-between items-center">
        <h3 className="text-lg font-medium text-secondary-900 dark:text-white">Evidence Journey Map</h3>
        
        {!compact && data.paths && data.paths.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-secondary-500 dark:text-secondary-400">View path:</span>
            <select 
              className="text-sm border border-secondary-300 dark:border-secondary-600 rounded-md bg-white dark:bg-secondary-700 px-3 py-1.5"
              value={selectedPath || ''}
              onChange={(e) => onPathSelect && onPathSelect(e.target.value)}
            >
              <option value="">All connections</option>
              {data.paths.map(path => (
                <option key={path.id} value={path.id}>{path.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>
      
      <div className="relative">
        {/* ---------- Primary journey headers with arrows in boxes ---------- */}
        <div className="flex items-center justify-between mb-4">
          {journeyStages.map((stage, idx) => (
            <React.Fragment key={`header-${stage.id}`}>
              <div className="flex-1 flex flex-col items-center text-center">
                <div
                  className={`w-6 h-6 rounded-full bg-${stage.color}-100 dark:bg-${stage.color}-900/30 flex items-center justify-center mb-1`}
                >
                  <stage.icon
                    className={`w-3.5 h-3.5 text-${stage.color}-600 dark:text-${stage.color}-400`}
                  />
                </div>
                <span className="font-medium text-secondary-900 dark:text-white text-sm">
                  {stage.label}
                </span>
              </div>

              {idx < journeyStages.length - 1 && (
                <div className="w-8 h-8 bg-secondary-100 dark:bg-secondary-700 rounded flex items-center justify-center mx-2">
                  <ArrowRight className="w-5 h-5 text-secondary-400 dark:text-secondary-600" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* ---------- Primary journey grid (nodes only) ---------- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          {journeyStages.map((stage, stageIndex) => (
            <div key={stage.id} className="flex flex-col space-y-3">
              {data.primary && data.primary[stage.id] && data.primary[stage.id].map((item, index) => (
                renderJourneyNode(stage, item, index)
              ))}
              
              {(!data.primary || !data.primary[stage.id] || data.primary[stage.id].length === 0) && (
                <div className="border border-dashed border-secondary-300 dark:border-secondary-700 rounded-lg p-4 text-center">
                  <span className="text-sm text-secondary-500 dark:text-secondary-400">No {stage.label.toLowerCase()} data</span>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {!compact && (
          <>
            <div className="border-t border-secondary-200 dark:border-secondary-700 my-8"></div>
            
            {/* Compliance journey headers with arrows in boxes */}
            <div className="flex items-center justify-between mb-4">
              {complianceJourney.map((stage, stageIndex) => (
                <React.Fragment key={`header-${stage.id}`}>
                  <div className="flex-1 flex flex-col items-center text-center">
                    <div className={`w-6 h-6 rounded-full bg-${stage.color}-100 dark:bg-${stage.color}-900/30 flex items-center justify-center mb-1`}>
                      <stage.icon className={`w-3.5 h-3.5 text-${stage.color}-600 dark:text-${stage.color}-400`} />
                    </div>
                    <span className="font-medium text-secondary-900 dark:text-white text-sm">{stage.label}</span>
                  </div>
                  
                  {stageIndex < complianceJourney.length - 1 && (
                    <div className="w-8 h-8 bg-secondary-100 dark:bg-secondary-700 rounded flex items-center justify-center mx-2">
                      <ArrowRight className="w-5 h-5 text-secondary-400 dark:text-secondary-600" />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
            
            {/* Compliance journey grid (without headers) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {complianceJourney.map((stage) => (
                <div key={stage.id} className="flex flex-col space-y-3">
                  {data.compliance && data.compliance[stage.id] && data.compliance[stage.id].map((item, index) => (
                    renderJourneyNode(stage, item, index)
                  ))}
                  
                  {(!data.compliance || !data.compliance[stage.id] || data.compliance[stage.id].length === 0) && (
                    <div className="border border-dashed border-secondary-300 dark:border-secondary-700 rounded-lg p-4 text-center">
                      <span className="text-sm text-secondary-500 dark:text-secondary-400">No {stage.label.toLowerCase()} data</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
        
        {/* Connection lines */}
        {renderConnections()}
        
        {/* Tooltip */}
        {renderTooltip()}
      </div>
    </div>
  );
};

// CheckCircle icon definition since it's used but not imported
const CheckCircle = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

EvidenceJourneyMap.propTypes = {
  /**
   * Data for the journey map, containing primary and compliance journeys
   */
  data: PropTypes.shape({
    primary: PropTypes.shape({
      threat: PropTypes.arrayOf(PropTypes.object),
      risk: PropTypes.arrayOf(PropTypes.object),
      capability: PropTypes.arrayOf(PropTypes.object),
      control: PropTypes.arrayOf(PropTypes.object),
      evidence: PropTypes.arrayOf(PropTypes.object),
      trustScore: PropTypes.arrayOf(PropTypes.object)
    }),
    compliance: PropTypes.shape({
      framework: PropTypes.arrayOf(PropTypes.object),
      requirement: PropTypes.arrayOf(PropTypes.object),
      policy: PropTypes.arrayOf(PropTypes.object),
      implementation: PropTypes.arrayOf(PropTypes.object),
      validation: PropTypes.arrayOf(PropTypes.object),
      monitoring: PropTypes.arrayOf(PropTypes.object)
    }),
    paths: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired
      })
    )
  }),
  
  /**
   * Currently selected path ID
   */
  selectedPath: PropTypes.string,
  
  /**
   * Handler for when a path is selected
   */
  onPathSelect: PropTypes.func,
  
  /**
   * Handler for when a node is clicked
   */
  onNodeClick: PropTypes.func,
  
  /**
   * Currently highlighted element
   */
  highlightedElement: PropTypes.shape({
    type: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired
  }),
  
  /**
   * Whether to show a compact version of the journey map
   */
  compact: PropTypes.bool
};

export default EvidenceJourneyMap;
