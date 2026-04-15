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
  const dragOffsetRef = useRef({ x: 0, y: 0 });
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

  const startPos = useRef({ x: 0, y: 0 });
  const startCenterRef = useRef({ x: 0, y: 0 });

  // Add grid gap size to calculate accurately matching geometry with the GameBoard!
  const GRID_GAP = 4;
  const columns = block.shape[0].length;
  const rows = block.shape.length;
  const blockWidthFull = columns * cellSize + (columns > 1 ? (columns - 1) * GRID_GAP : 0);
  const blockHeightFull = rows * cellSize + (rows > 1 ? (rows - 1) * GRID_GAP : 0);
  
  // Auto-scale to fit the inventory slot
  const invScale = Math.min(1, 120 / Math.max(blockWidthFull, blockHeightFull));
  
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
    
    // Find the absolute center of the starting block
    startCenterRef.current = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    };

    startPos.current = { x: e.clientX, y: e.clientY };
    dragOffsetRef.current = { x: 0, y: 0 };
    latestPointerRef.current = { x: e.clientX, y: e.clientY };
    
    if (blockRef.current) {
        blockRef.current.style.transition = 'none';
    }
    
    setIsDragging(true);
  };

  const findNearestCell = (clientX: number, clientY: number) => {
    let nearest = null;
    let minDist = Infinity;
    const maxDistSq = Math.pow(cellSize * 1.5, 2); // Sweet spot for snapping - increased for easiest placement!
    
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
    // Mobile jump offset so block isn't occluded by finger
    const mobileOffset = cellSize < 44 ? 70 : 40;
    
    let newX = e.clientX - startPos.current.x;
    let newY = e.clientY - startPos.current.y - mobileOffset;

    dragOffsetRef.current = { x: newX, y: newY };
    latestPointerRef.current = { x: e.clientX, y: e.clientY };

    // BYPASS REACT RENDER LOOP FOR ULTIMATE FLUIDITY (120 FPS Dragging!)
    blockRef.current.style.transform = `translate3d(${newX}px, ${newY}px, 0) scale(1)`;
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging || !blockRef.current) return;
    
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);

    // Instead of relying purely on pointer coordinates, use the 100% correct drag offsets
    let newX = dragOffsetRef.current.x;
    let newY = dragOffsetRef.current.y;
    
    let currentScale = 1.0;
    const scaledWidth = blockWidthFull;
    const scaledHeight = blockHeightFull;
    
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
    
    // Re-enable transition as it flies back to inventory if placement fails
    if (blockRef.current) {
        blockRef.current.style.transition = 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)';
        blockRef.current.style.transform = `translate3d(0px, 0px, 0) scale(${invScale})`;
    }
    dragOffsetRef.current = { x: 0, y: 0 };
  };

  return (
    <div
      ref={blockRef}
      className={`relative p-0 rounded-lg cursor-grab active:cursor-grabbing select-none`}
      style={{
        width: blockWidthFull,
        height: blockHeightFull,
        touchAction: 'none',
        transform: `translate3d(${isDragging ? dragOffsetRef.current.x : 0}px, ${isDragging ? dragOffsetRef.current.y : 0}px, 0) scale(${isDragging ? 1.0 : invScale})`,
        transition: isDragging ? 'none' : 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
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
        dragOffsetRef.current = { x: 0, y: 0 };
        if (blockRef.current) {
            blockRef.current.style.transition = 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)';
            blockRef.current.style.transform = `translate3d(0px, 0px, 0) scale(${invScale})`;
        }
      }}
    >
      {/* Invisible expanded hit area so users can grab from the surrounding slot */}
      <div className={`absolute -inset-10 z-0 ${isDragging ? 'pointer-events-none' : 'pointer-events-auto'}`} />

      <div 
        className={`grid ${isDragging ? 'opacity-90' : 'opacity-100'} relative z-10`} 
        style={{
          gridTemplateColumns: `repeat(${block.shape[0].length}, 1fr)`,
          gap: `${GRID_GAP}px`,
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
