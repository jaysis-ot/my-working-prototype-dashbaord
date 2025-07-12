import React, { useRef, useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { ZoomIn, ZoomOut, RefreshCw } from 'lucide-react';

/**
 * EvidenceGraph Component
 * 
 * A canvas-based interactive graph visualization for evidence relationships
 * that doesn't require d3.js. Implements a simplified force-directed layout
 * and supports node selection, path highlighting, and zooming.
 */
const EvidenceGraph = ({
  evidenceItems,
  controls,
  requirements,
  risks,
  relationships,
  selectedNodeId,
  onNodeSelect,
  highlightedPath,
  className
}) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const animationRef = useRef(null);
  const [nodes, setNodes] = useState([]);
  const [links, setLinks] = useState([]);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [simulation, setSimulation] = useState(null);
  const [isStabilized, setIsStabilized] = useState(false);
  const nodeBeingDragged = useRef(null);

  // Initialize nodes and links from props
  useEffect(() => {
    // Create nodes from all items
    const allNodes = [
      ...evidenceItems.map(item => ({
        id: item.id,
        label: item.title,
        type: 'evidence',
        status: item.status,
        radius: 12,
        color: getNodeColor('evidence', item.status),
        x: Math.random() * 800,
        y: Math.random() * 600,
        vx: 0,
        vy: 0
      })),
      ...controls.map(item => ({
        id: item.id,
        label: item.name,
        type: 'control',
        status: item.status,
        radius: 10,
        color: getNodeColor('control', item.status),
        x: Math.random() * 800,
        y: Math.random() * 600,
        vx: 0,
        vy: 0
      })),
      ...requirements.map(item => ({
        id: item.id,
        label: item.name,
        type: 'requirement',
        radius: 8,
        color: getNodeColor('requirement'),
        x: Math.random() * 800,
        y: Math.random() * 600,
        vx: 0,
        vy: 0
      })),
      ...risks.map(item => ({
        id: item.id,
        label: item.name,
        type: 'risk',
        radius: 10,
        color: getNodeColor('risk'),
        x: Math.random() * 800,
        y: Math.random() * 600,
        vx: 0,
        vy: 0
      }))
    ];

    // Create links from relationships
    const allLinks = relationships.map(rel => ({
      source: allNodes.find(n => n.id === rel.source),
      target: allNodes.find(n => n.id === rel.target),
      type: rel.type,
      strength: rel.strength
    })).filter(link => link.source && link.target);

    setNodes(allNodes);
    setLinks(allLinks);
    setIsStabilized(false);

    // Initialize simulation
    const sim = createSimulation(allNodes, allLinks);
    setSimulation(sim);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [evidenceItems, controls, requirements, risks, relationships]);

  // Helper function to get node color based on type and status
  const getNodeColor = (type, status) => {
    switch (type) {
      case 'evidence':
        if (status === 'fresh') return '#10B981'; // green
        if (status === 'aging') return '#F59E0B'; // yellow
        if (status === 'stale') return '#EF4444'; // red
        return '#10B981';
      case 'control':
        return '#3B82F6'; // blue
      case 'requirement':
        return '#8B5CF6'; // purple
      case 'risk':
        return '#EC4899'; // pink
      default:
        return '#6B7280'; // gray
    }
  };

  // Create a simple force-directed simulation
  const createSimulation = (nodes, links) => {
    const sim = {
      nodes,
      links,
      alpha: 1,
      alphaMin: 0.001,
      alphaDecay: 0.0228, // reasonable decay speed
      alphaTarget: 0,
      velocityDecay: 0.7, // Increased from 0.4 to 0.7 for more damping
      
      // Stabilization tracking
      isStable: false,
      stabilizationCount: 0,
      // consider graph stable when max node movement is < 0.1px for 10 ticks
      stabilizationThreshold: 0.1,
      maxStabilizationTicks: 300,
      tickCount: 0,
      
      // Force constants
      centerForce: { x: 400, y: 300, strength: 0.05 }, // milder pull to centre
      linkDistance: 100,
      linkStrength: 0.5,  // gentler spring
      chargeStrength: -20, // less repulsion
      collideRadius: 5,
      
      tick: function() {
        // Check if we should stop simulation
        if (this.isStable || this.alpha < this.alphaMin) {
          this.isStable = true;
          return false;
        }
        
        // Count ticks for cooldown
        this.tickCount++;
        
        // Store previous positions to check for stability
        const prevPositions = this.nodes.map(n => ({ x: n.x, y: n.y }));
        
        // Apply forces
        this.applyForces();
        
        // Update alpha
        this.alpha += (this.alphaTarget - this.alpha) * this.alphaDecay;
        
        // Check if the graph has stabilized
        let maxMovement = 0;
        for (let i = 0; i < this.nodes.length; i++) {
          const dx = this.nodes[i].x - prevPositions[i].x;
          const dy = this.nodes[i].y - prevPositions[i].y;
          const movement = Math.sqrt(dx * dx + dy * dy);
          maxMovement = Math.max(maxMovement, movement);
        }
        
        // If movement is below threshold, increment stabilization counter
        if (maxMovement < this.stabilizationThreshold) {
          this.stabilizationCount++;
          if (this.stabilizationCount > 10) {
            this.isStable = true;
            return false;
          }
        } else {
          this.stabilizationCount = 0;
        }
        
        // Force stabilization after max ticks to prevent endless simulation
        if (this.tickCount > this.maxStabilizationTicks) {
          this.isStable = true;
          return false;
        }
        
        return true;
      },
      
      applyForces: function() {
        // Skip force application if a node is being dragged
        if (this.draggedNode) return;
        
        // Apply center force
        this.nodes.forEach(node => {
          node.vx += (this.centerForce.x - node.x) * this.centerForce.strength;
          node.vy += (this.centerForce.y - node.y) * this.centerForce.strength;
        });
        
        // Apply link forces
        this.links.forEach(link => {
          const dx = link.target.x - link.source.x;
          const dy = link.target.y - link.source.y;
          const distance = Math.sqrt(dx * dx + dy * dy) || 1;
          const strength = this.linkStrength * (link.strength === 'strong' ? 1.5 : 
                                               link.strength === 'medium' ? 1 : 0.5);
          
          // Force proportional to distance from ideal length
          const force = strength * (distance - this.linkDistance) / distance;
          
          // Apply force to both nodes
          link.source.vx += dx * force;
          link.source.vy += dy * force;
          link.target.vx -= dx * force;
          link.target.vy -= dy * force;
        });
        
        // Apply charge forces (repulsion)
        for (let i = 0; i < this.nodes.length; i++) {
          for (let j = i + 1; j < this.nodes.length; j++) {
            const nodeA = this.nodes[i];
            const nodeB = this.nodes[j];
            const dx = nodeB.x - nodeA.x;
            const dy = nodeB.y - nodeA.y;
            const distance = Math.sqrt(dx * dx + dy * dy) || 1;
            
            if (distance < 150) { // Only apply charge to nearby nodes for efficiency
              const force = this.chargeStrength / (distance * distance);
              nodeA.vx -= dx * force;
              nodeA.vy -= dy * force;
              nodeB.vx += dx * force;
              nodeB.vy += dy * force;
            }
          }
        }
        
        // Apply collision forces
        for (let i = 0; i < this.nodes.length; i++) {
          for (let j = i + 1; j < this.nodes.length; j++) {
            const nodeA = this.nodes[i];
            const nodeB = this.nodes[j];
            const dx = nodeB.x - nodeA.x;
            const dy = nodeB.y - nodeA.y;
            const distance = Math.sqrt(dx * dx + dy * dy) || 1;
            const minDistance = nodeA.radius + nodeB.radius + this.collideRadius;
            
            if (distance < minDistance) {
              const force = (distance - minDistance) / distance * 0.5;
              nodeA.vx += dx * force;
              nodeA.vy += dy * force;
              nodeB.vx -= dx * force;
              nodeB.vy -= dy * force;
            }
          }
        }
        
        // Update positions
        this.nodes.forEach(node => {
          // Skip position update for dragged node
          if (node === this.draggedNode) return;
          
          node.vx *= this.velocityDecay;
          node.vy *= this.velocityDecay;
          node.x += node.vx;
          node.y += node.vy;
        });
      },
      
      restart: function() {
        // resume with moderate energy to avoid violent oscillations
        this.alpha = 0.5;
        this.isStable = false;
        this.stabilizationCount = 0;
        this.tickCount = 0;
      },
      
      setDraggedNode: function(node) {
        this.draggedNode = node;
      }
    };
    
    return sim;
  };

  // Draw the graph on canvas
  const drawGraph = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Apply zoom and pan transformations
    ctx.save();
    ctx.translate(offset.x, offset.y);
    ctx.scale(scale, scale);
    
    // Draw links
    links.forEach(link => {
      if (!link.source || !link.target) return;
      
      const isHighlighted = highlightedPath && 
        highlightedPath.includes(link.source.id) && 
        highlightedPath.includes(link.target.id) &&
        highlightedPath.indexOf(link.source.id) === highlightedPath.indexOf(link.target.id) - 1;
      
      const isConnectedToSelected = selectedNodeId && 
        (link.source.id === selectedNodeId || link.target.id === selectedNodeId);
      
      ctx.beginPath();
      ctx.moveTo(link.source.x, link.source.y);
      ctx.lineTo(link.target.x, link.target.y);
      
      if (isHighlighted) {
        ctx.strokeStyle = '#FF9500';
        ctx.lineWidth = 3;
      } else if (isConnectedToSelected) {
        ctx.strokeStyle = '#3B82F6';
        ctx.lineWidth = 2;
      } else {
        ctx.strokeStyle = '#CBD5E1';
        ctx.lineWidth = link.strength === 'strong' ? 2 : 
                        link.strength === 'medium' ? 1.5 : 1;
        ctx.globalAlpha = 0.6;
      }
      
      ctx.stroke();
      ctx.globalAlpha = 1;
      
      // Draw link type if highlighted or connected to selected
      if (isHighlighted || isConnectedToSelected) {
        const midX = (link.source.x + link.target.x) / 2;
        const midY = (link.source.y + link.target.y) / 2;
        
        ctx.fillStyle = '#1E293B';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(link.type, midX, midY - 8);
      }
    });
    
    // Draw nodes
    nodes.forEach(node => {
      const isSelected = node.id === selectedNodeId;
      const isHighlighted = highlightedPath && highlightedPath.includes(node.id);
      const isHovered = node.id === hoveredNode;
      const isDragged = node === nodeBeingDragged.current;
      
      // Draw node circle
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
      
      if (isDragged) {
        ctx.fillStyle = '#3B82F6';
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 3;
      } else if (isSelected) {
        ctx.fillStyle = '#2563EB';
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 3;
      } else if (isHighlighted) {
        ctx.fillStyle = node.color;
        ctx.strokeStyle = '#FF9500';
        ctx.lineWidth = 3;
      } else if (isHovered) {
        ctx.fillStyle = node.color;
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
      } else {
        ctx.fillStyle = node.color;
        ctx.strokeStyle = 'transparent';
        ctx.lineWidth = 0;
      }
      
      ctx.fill();
      if (isSelected || isHighlighted || isHovered || isDragged) {
        ctx.stroke();
      }
      
      // Draw node type indicator
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius / 2, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      
      const typeSymbol = node.type === 'evidence' ? 'E' :
                         node.type === 'control' ? 'C' :
                         node.type === 'requirement' ? 'R' :
                         node.type === 'risk' ? '!' : '';
      
      ctx.fillStyle = '#1E293B';
      ctx.font = 'bold 8px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(typeSymbol, node.x, node.y);
      
      // Draw node label if selected, highlighted, or hovered
      if (isSelected || isHighlighted || isHovered || isDragged) {
        ctx.fillStyle = '#1E293B';
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 3;
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Draw text outline for better visibility
        ctx.strokeText(node.label, node.x, node.y + node.radius + 12);
        ctx.fillText(node.label, node.x, node.y + node.radius + 12);
      }
    });
    
    ctx.restore();
  }, [nodes, links, selectedNodeId, hoveredNode, highlightedPath, scale, offset]);

  // Animation loop
  useEffect(() => {
    if (!simulation) return;
    
    const animate = () => {
      // Only update if simulation is not stable or we're dragging
      const didUpdate = !simulation.isStable || isDragging || nodeBeingDragged.current;
      
      // Run simulation tick if not stable
      if (!simulation.isStable && !isDragging && !nodeBeingDragged.current) {
        simulation.tick();
      }
      
      // Always draw the graph
      drawGraph();
      
      // Update stabilized state for UI
      if (simulation.isStable && !isStabilized) {
        setIsStabilized(true);
      }
      
      // Continue animation loop
      animationRef.current = requestAnimationFrame(animate);
    };
    
    // Initial layout phase - run simulation for a set number of ticks
    let initialTicks = 100;
    while (initialTicks > 0 && !simulation.isStable) {
      simulation.tick();
      initialTicks--;
    }
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [simulation, drawGraph, isDragging, isStabilized]);

  // Handle canvas resize
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current && containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        canvasRef.current.width = width;
        canvasRef.current.height = height;
        
        // Update center force in simulation
        if (simulation) {
          simulation.centerForce = { 
            x: width / (2 * scale) - offset.x / scale, 
            y: height / (2 * scale) - offset.y / scale, 
            strength: 0.1 
          };
          
          // Only restart simulation if it was already stable
          if (simulation.isStable) {
            simulation.restart();
          }
        }
        
        drawGraph();
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [drawGraph, scale, offset, simulation]);

  // Define handleNodeHover function before it's used
  const handleNodeHover = useCallback((x, y) => {
    // Convert screen coordinates to graph coordinates
    const graphX = (x - offset.x) / scale;
    const graphY = (y - offset.y) / scale;
    
    // Find the node under the cursor
    const node = nodes.find(n => {
      const dx = n.x - graphX;
      const dy = n.y - graphY;
      return dx * dx + dy * dy < n.radius * n.radius;
    });
    
    setHoveredNode(node ? node.id : null);
  }, [nodes, offset, scale]);

  // Handle mouse events
  const handleMouseMove = useCallback((e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (isDragging) {
      setOffset({
        x: offset.x + (x - dragStart.x),
        y: offset.y + (y - dragStart.y)
      });
      setDragStart({ x, y });
    } else if (nodeBeingDragged.current) {
      // Update node position directly when dragging a node
      const graphX = (x - offset.x) / scale;
      const graphY = (y - offset.y) / scale;
      
      nodeBeingDragged.current.x = graphX;
      nodeBeingDragged.current.y = graphY;
      nodeBeingDragged.current.vx = 0;
      nodeBeingDragged.current.vy = 0;
      
      // Redraw without running simulation
      drawGraph();
    } else {
      handleNodeHover(x, y);
    }
  }, [isDragging, dragStart, offset, scale, handleNodeHover, drawGraph]);

  const handleMouseDown = useCallback((e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Check if clicked on a node
    const graphX = (x - offset.x) / scale;
    const graphY = (y - offset.y) / scale;
    
    const clickedNode = nodes.find(n => {
      const dx = n.x - graphX;
      const dy = n.y - graphY;
      return dx * dx + dy * dy < n.radius * n.radius;
    });
    
    if (clickedNode) {
      // Start dragging the node
      nodeBeingDragged.current = clickedNode;
      if (simulation) {
        simulation.setDraggedNode(clickedNode);
      }
      onNodeSelect(clickedNode.id);
    } else {
      // Start dragging the canvas
      setIsDragging(true);
      setDragStart({ x, y });
    }
  }, [nodes, offset, scale, onNodeSelect, simulation]);

  const handleMouseUp = useCallback(() => {
    if (nodeBeingDragged.current) {
      // Release the dragged node
      if (simulation) {
        simulation.setDraggedNode(null);
        // Restart simulation briefly to adjust other nodes
        simulation.restart();
      }
      nodeBeingDragged.current = null;
    }
    setIsDragging(false);
  }, [simulation]);

  const handleMouseLeave = useCallback(() => {
    if (nodeBeingDragged.current) {
      if (simulation) {
        simulation.setDraggedNode(null);
      }
      nodeBeingDragged.current = null;
    }
    setIsDragging(false);
    setHoveredNode(null);
  }, [simulation]);

  // Zoom controls
  const handleZoomIn = useCallback(() => {
    setScale(prev => Math.min(prev * 1.2, 3));
  }, []);

  const handleZoomOut = useCallback(() => {
    setScale(prev => Math.max(prev / 1.2, 0.3));
  }, []);

  const handleReset = useCallback(() => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
    if (simulation) {
      simulation.restart();
    }
  }, [simulation]);

  return (
    <div className={`relative ${className || 'h-[500px]'}`} ref={containerRef}>
      <canvas
        ref={canvasRef}
        className={`w-full h-full ${isDragging || nodeBeingDragged.current ? 'cursor-grabbing' : 'cursor-grab'}`}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      />
      
      {/* Zoom controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <button
          onClick={handleZoomIn}
          className="p-2 bg-white dark:bg-secondary-800 rounded-full shadow-md hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-colors"
          aria-label="Zoom in"
        >
          <ZoomIn size={16} />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 bg-white dark:bg-secondary-800 rounded-full shadow-md hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-colors"
          aria-label="Zoom out"
        >
          <ZoomOut size={16} />
        </button>
        <button
          onClick={handleReset}
          className="p-2 bg-white dark:bg-secondary-800 rounded-full shadow-md hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-colors"
          aria-label="Reset view"
        >
          <RefreshCw size={16} />
        </button>
      </div>
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white dark:bg-secondary-800 rounded-lg shadow-md p-2 text-xs">
        <div className="font-semibold mb-1">Node Types</div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center">
            <span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
            <span>Evidence</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
            <span>Control</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 rounded-full bg-purple-500 mr-2"></span>
            <span>Requirement</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 rounded-full bg-pink-500 mr-2"></span>
            <span>Risk</span>
          </div>
        </div>
      </div>
    </div>
  );
};

EvidenceGraph.propTypes = {
  evidenceItems: PropTypes.array.isRequired,
  controls: PropTypes.array.isRequired,
  requirements: PropTypes.array.isRequired,
  risks: PropTypes.array.isRequired,
  relationships: PropTypes.array.isRequired,
  selectedNodeId: PropTypes.string,
  onNodeSelect: PropTypes.func.isRequired,
  highlightedPath: PropTypes.array,
  className: PropTypes.string
};

export default EvidenceGraph;
