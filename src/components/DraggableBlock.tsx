'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Block } from '@/types/game';

interface DraggableBlockProps {
  block: Block;
  onPlace: (blockId: string, row: number, col: number) => boolean;
  onDragMove?: (blockId: string, row: number, col: number) => void;
  onDragEnd?: () => void;
}

const DraggableBlock: React.FC<DraggableBlockProps> = ({ block, onPlace, onDragMove, onDragEnd }) => {
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
  const visualLeftRef = useRef(0);
  const visualTopRef = useRef(0);

  // Auto-scale to fit the inventory slot (with some padding)
  const blockWidthFull = block.shape[0].length * cellSize;
  const blockHeightFull = block.shape.length * cellSize;
  const invScale = Math.min(1, 120 / Math.max(blockWidthFull, blockHeightFull));
  // On mobile, boost drag visual scale so block is easier to see under finger
  const dragScale = cellSize < 44 ? 1.15 : 1.0;
  
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!blockRef.current) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    
    const rect = blockRef.current.getBoundingClientRect();
    visualLeftRef.current = rect.left;
    visualTopRef.current = rect.top;

    setStartPos({ x: e.clientX, y: e.clientY });
    setIsDragging(true);
  };

  const findNearestCell = (clientX: number, clientY: number) => {
    // Check a small grid of points around the cursor/top-left to find the nearest grid cell
    // This makes snapping much more 'magnetic'
    const offsets = [
      { x: 0, y: 0 },
      { x: cellSize / 2, y: cellSize / 2 },
      { x: -cellSize / 2, y: -cellSize / 2 },
      { x: cellSize / 2, y: -cellSize / 2 },
      { x: -cellSize / 2, y: cellSize / 2 },
    ];

    for (const offset of offsets) {
      const elements = document.elementsFromPoint(clientX + offset.x, clientY + offset.y);
      const cell = elements.find(el => el.hasAttribute('data-row'));
      if (cell) return cell;
    }
    return null;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !blockRef.current) return;
    
    let newX = e.clientX - startPos.x;
    let newY = e.clientY - startPos.y;

    // Constraint logic: Keep block within viewport
    const rect = blockRef.current.getBoundingClientRect();
    const futureLeft = visualLeftRef.current + newX;
    const futureTop = visualTopRef.current + newY;

    if (futureLeft < 0) newX = -visualLeftRef.current;
    if (futureTop < 0) newY = -visualTopRef.current;
    if (futureLeft + rect.width > window.innerWidth) newX = window.innerWidth - visualLeftRef.current - rect.width;
    if (futureTop + rect.height > window.innerHeight) newY = window.innerHeight - visualTopRef.current - rect.height;

    setDragOffset({ x: newX, y: newY });

    if (onDragMove) {
      const checkX = rect.left + (cellSize / 2);
      const checkY = rect.top + (cellSize / 2);

      const originalDisplay = blockRef.current.style.display;
      blockRef.current.style.display = 'none';
      
      const cell = findNearestCell(checkX, checkY);
      
      if (cell) {
        const row = parseInt(cell.getAttribute('data-row') || '0');
        const col = parseInt(cell.getAttribute('data-col') || '0');
        onDragMove(block.id, row, col);
      } else {
        onDragEnd?.();
      }
      
      blockRef.current.style.display = originalDisplay;
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging || !blockRef.current) return;
    
    const rect = blockRef.current.getBoundingClientRect();
    const visualLeft = rect.left;
    const visualTop = rect.top;

    setIsDragging(false);
    setDragOffset({ x: 0, y: 0 });
    e.currentTarget.releasePointerCapture(e.pointerId);
    onDragEnd?.();

    const originalDisplay = blockRef.current.style.display;
    blockRef.current.style.display = 'none';

    const checkX = visualLeft + (cellSize / 2);
    const checkY = visualTop + (cellSize / 2);

    const cell = findNearestCell(checkX, checkY);

    if (cell) {
      const row = parseInt(cell.getAttribute('data-row') || '0');
      const col = parseInt(cell.getAttribute('data-col') || '0');
      onPlace(block.id, row, col);
    }
    
    blockRef.current.style.display = originalDisplay;
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
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => {
        setIsDragging(false);
        setDragOffset({ x: 0, y: 0 });
        onDragEnd?.();
      }}
    >
      <div 
        className={`grid shadow-2xl ${isDragging ? 'opacity-100 brightness-110' : 'opacity-100'}`} 
        style={{
          gridTemplateColumns: `repeat(${block.shape[0].length}, 1fr)`,
          gap: '2px',
          pointerEvents: 'none',
        }}
      >
        {block.shape.map((row, r) => (row.map((val, c) => (
          <div
            key={`${r}-${c}`}
            className={`rounded-sm overflow-hidden ${val === 0 ? 'opacity-0' : 'opacity-100 shadow-[inset_0_0_12px_rgba(255,255,255,0.4)]'}`}
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
