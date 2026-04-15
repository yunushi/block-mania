'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Block } from '@/types/game';

interface DraggableBlockProps {
  block: Block;
  onPlace: (blockId: string, row: number, col: number) => boolean;
}

const DraggableBlock: React.FC<DraggableBlockProps> = ({ block, onPlace }) => {
  const getColorClass = (image: string | null) => {
    if (!image) return '';
    // Map legacy names to generic color tokens if they appear
    const legacyMap: Record<string, string> = {
      'red': 'color-1',
      'blue': 'color-2',
      'green': 'color-3',
      'yellow': 'color-4',
      'purple': 'color-5'
    };
    const key = (image && legacyMap[image]) ? legacyMap[image] : image;
    return `cell-${key}`;
  };

  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const blockRef = useRef<HTMLDivElement>(null);

  // Sync cell size to CSS breakpoints for accurate pointer math
  const [cellSize, setCellSize] = useState(44);
  useEffect(() => {
    const updateSize = () => {
      const w = window.innerWidth;
      if (w <= 360) setCellSize(32);
      else if (w <= 420) setCellSize(38);
      else setCellSize(44);
    };
    updateSize(); // run immediately
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const startCenterRef = useRef({ x: 0, y: 0 });
  const visualLeftRef = useRef(0);
  const visualTopRef = useRef(0);

  // Auto-scale to fit the inventory slot (with some padding)
  const blockWidthFull = block.shape[0].length * cellSize;
  const blockHeightFull = block.shape.length * cellSize;
  const invScale = Math.min(1, 120 / Math.max(blockWidthFull, blockHeightFull));
  // On mobile, boost drag visual scale so block is easier to see under finger
  const dragScale = cellSize < 44 ? 1.15 : 1.0;
  
  const gridCellsRef = useRef<{row: number, col: number, x: number, y: number}[]>([]);
  const lastEventCellRef = useRef<{row: number, col: number} | null>(null);

  const latestPointerRef = useRef({ x: 0, y: 0 });

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!blockRef.current) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    
    // Cache grid cell coordinates on click to prevent ultra-slow DOM queries during move!
    const cells = document.querySelectorAll('[data-row][data-col]');
    gridCellsRef.current = Array.from(cells).map(cell => {
       const cellRect = cell.getBoundingClientRect();
       return {
         row: parseInt(cell.getAttribute('data-row') || '0'),
         col: parseInt(cell.getAttribute('data-col') || '0'),
         x: cellRect.left + cellRect.width / 2,
         y: cellRect.top + cellRect.height / 2,
       };
    });
    lastEventCellRef.current = null;

    const rect = blockRef.current.getBoundingClientRect();
    visualLeftRef.current = rect.left;
    visualTopRef.current = rect.top;
    
    // Find the absolute center of the starting block
    startCenterRef.current = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    };

    setStartPos({ x: e.clientX, y: e.clientY });
    latestPointerRef.current = { x: e.clientX, y: e.clientY };
    setIsDragging(true);
  };

  const findNearestCell = (clientX: number, clientY: number) => {
    let nearest = null;
    let minDist = Infinity;
    const maxDistSq = Math.pow(cellSize * 0.8, 2); // Sweet spot for snapping
    
    for (const cell of gridCellsRef.current) {
        const distSq = Math.pow(cell.x - clientX, 2) + Math.pow(cell.y - clientY, 2);
        if (distSq < minDist && distSq < maxDistSq) {
            minDist = distSq;
            nearest = cell;
        }
    }
    return nearest;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !blockRef.current) return;
    
    // We could restrict movement strictly here, but to avoid math anomalies we just let the bounding box handle offset
    let newX = e.clientX - startPos.x;
    let newY = e.clientY - startPos.y;

    setDragOffset({ x: newX, y: newY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging || !blockRef.current) return;
    
    setIsDragging(false);
    setDragOffset({ x: 0, y: 0 });
    e.currentTarget.releasePointerCapture(e.pointerId);

    // Instead of using lastEventCellRef (which is no longer tracked in pointerMove),
    // we calculate the placement cell right here based on final pointer position!
    // Use the latest reliable pointer coords, iOS sometimes reports 0/0 on Up events
    const finalX = latestPointerRef.current.x;
    const finalY = latestPointerRef.current.y;
    let newX = finalX - startPos.x;
    let newY = finalY - startPos.y;
    
    let currentScale = dragScale;
    const scaledWidth = blockWidthFull * currentScale;
    const scaledHeight = blockHeightFull * currentScale;
    
    // Current center of the block is simply the starting center + translation offset!
    const currentCenterX = startCenterRef.current.x + newX;
    const currentCenterY = startCenterRef.current.y + newY;
    
    // The visual top-left of the fully dragged block:
    const topLeftX = currentCenterX - scaledWidth / 2;
    const topLeftY = currentCenterY - scaledHeight / 2;

    // The center point of the very first cell [0][0] in the block
    const checkX = topLeftX + (cellSize * currentScale) / 2;
    const checkY = topLeftY + (cellSize * currentScale) / 2;

    const cell = findNearestCell(checkX, checkY);

    if (cell) {
        onPlace(block.id, cell.row, cell.col);
    }
  };

  return (
    <div
      ref={blockRef}
      className={`relative p-0 rounded-lg cursor-grab active:cursor-grabbing select-none ${!isDragging ? 'transition-transform' : ''}`}
      style={{
        width: blockWidthFull,
        height: blockHeightFull,
        touchAction: 'none',
        transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) scale(${isDragging ? dragScale : invScale})`,
        zIndex: isDragging ? 9999 : 10,
        pointerEvents: 'auto',
        transformOrigin: 'center center',
        willChange: 'transform',
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => {
        setIsDragging(false);
        setDragOffset({ x: 0, y: 0 });
      }}
    >
      <div 
        className={`grid ${isDragging ? 'opacity-90' : 'opacity-100'}`} 
        style={{
          gridTemplateColumns: `repeat(${block.shape[0].length}, 1fr)`,
          gap: '2px',
          pointerEvents: 'none',
        }}
      >
        {block.shape.map((row, r) => (row.map((val, c) => (
          <div
            key={`${r}-${c}`}
            className={`rounded-sm overflow-hidden ${val === 0 ? 'opacity-0' : 'opacity-100'}`}
            style={{ width: cellSize, height: cellSize }}
          >
            {val === 1 && (
              <div className={`cell-cube ${getColorClass(block.image)}`} />
            )}
          </div>
        ))))}
      </div>
    </div>
  );
};

export default DraggableBlock;
