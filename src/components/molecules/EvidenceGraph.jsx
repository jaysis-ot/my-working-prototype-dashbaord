import React, { useRef, useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { ZoomIn, ZoomOut, RefreshCw } from 'lucide-react';

const EvidenceGraph = ({ evidenceItems, controls, requirements, risks, relationships }) => {
  const canvasRef = useRef(null);
  const [nodes, setNodes] = useState([]);
  const [links, setLinks] = useState([]);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  // Initialize pre-exploded layout once
  useEffect(() => {
    const W = 800, H = 600;
    const cx = W / 2, cy = H / 2;
    const R = Math.min(W, H) / 2;
    const types = [
      { items: evidenceItems,   type: 'evidence',   radius: 16, angle: -Math.PI/2, color: '#10B981' },
      { items: controls,        type: 'control',    radius: 14, angle: 0,           color: '#3B82F6' },
      { items: requirements,    type: 'requirement', radius: 12, angle: Math.PI/2,   color: '#8B5CF6' },
      { items: risks,           type: 'risk',       radius: 14, angle: Math.PI,     color: '#EC4899' },
    ];
    const allNodes = [];
    types.forEach(({items, type, radius, angle, color}) => {
      const n = items.length;
      items.forEach((it, i) => {
        const spread = Math.PI / 2;
        const off = n > 1 ? ((i/(n-1)) - 0.5) * spread : 0;
        allNodes.push({
          id: it.id,
          label: it.name || it.title,
          type,
          radius,
          color,
          x: cx + R * Math.cos(angle + off),
          y: cy + R * Math.sin(angle + off),
        });
      });
    });
    const allLinks = relationships.map(r => ({
      source: allNodes.find(n => n.id === r.source),
      target: allNodes.find(n => n.id === r.target),
    })).filter(l => l.source && l.target);

    setNodes(allNodes);
    setLinks(allLinks);
  }, [evidenceItems, controls, requirements, risks, relationships]);

  // Draw function
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(offset.x, offset.y);
    ctx.scale(scale, scale);

    // Draw links
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 1;
    links.forEach(l => {
      ctx.beginPath();
      ctx.moveTo(l.source.x, l.source.y);
      ctx.lineTo(l.target.x, l.target.y);
      ctx.stroke();
    });

    // Draw nodes
    links.forEach(l => {}); // ensure links drawn first
    nodes.forEach(n => {
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.radius, 0, 2*Math.PI);
      ctx.fillStyle = n.color;
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = `bold ${n.radius}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const sym = n.type === 'evidence' ? 'E' : n.type === 'control' ? 'C' : n.type === 'requirement' ? 'R' : '!';
      ctx.fillText(sym, n.x, n.y);
    });

    ctx.restore();
  }, [nodes, links, scale, offset]);

  // Redraw on data or transform changes
  useEffect(() => { draw(); }, [draw]);

  // Zoom/pan handlers
  const handleWheel = useCallback(e => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.2 : 1/1.2;
    setScale(s => Math.min(Math.max(s * factor, 0.3), 3));
  }, []);

  return (
    <div className="relative w-full h-96">
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        onWheel={handleWheel}
        style={{ width: '100%', height: '100%', cursor: 'grab' }}
      />
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <button onClick={() => setScale(s => Math.min(s * 1.2, 3))}><ZoomIn size={16} /></button>
        <button onClick={() => setScale(s => Math.max(s / 1.2, 0.3))}><ZoomOut size={16} /></button>
        <button onClick={() => { setScale(1); setOffset({ x: 0, y: 0 }); }}><RefreshCw size={16} /></button>
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
  className: PropTypes.string
};

export default EvidenceGraph;
