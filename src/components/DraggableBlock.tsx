'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Block } from '@/types/game';
import { getColorClass } from '@/utils/gameUtils';

interface DraggableBlockProps {
  block: Block;
  onPlace: (blockId: string, row: number, col: number) => boolean;
  onPreview: (block: Block | null, row: number, col: number) => void;
}

export default function DraggableBlock({ block, onPlace, onPreview }: DraggableBlockProps) {
  const [isDragging, setIsDragging] = useState(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const blockRef = useRef<HTMLDivElement>(null);
  const startPos = useRef({ x: 0, y: 0 });
  const gridCellsRef = useRef<{ row: number, col: number, x: number, y: number }[]>([]);
  const blockAnchorsRef = useRef({ r: 0, c: 0 });
  const [cellSize, setCellSize] = useState(38);

  useEffect(() => {
    const updateSize = () => {
      const w = window.innerWidth;
      if (w <= 600) setCellSize(40);
      else setCellSize(44);
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const columns = block.shape[0].length;
  const rows = block.shape.length;
  const blockWidthFull = columns * cellSize;
  const blockHeightFull = rows * cellSize;
  const invScale = 0.45; // Consistent scale for inventory

  // Safety cleanup: Reset manual styles if component unmounts or block changes
  useEffect(() => {
    return () => {
      if (blockRef.current) {
        const el = blockRef.current;
        el.style.position = ''; el.style.left = ''; el.style.top = '';
        el.style.width = ''; el.style.height = ''; el.style.transform = '';
        el.style.zIndex = ''; el.style.transition = '';
      }
    };
  }, [block.id]);

  const findNearestCell = (x: number, y: number) => {
    let nearest = null;
    let minDist = cellSize * 1.5;
    for (const cell of gridCellsRef.current) {
      const dist = Math.sqrt(Math.pow(cell.x - x, 2) + Math.pow(cell.y - y, 2));
      if (dist < minDist) {
        minDist = dist;
        nearest = cell;
      }
    }
    return nearest;
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!blockRef.current || isDragging) return;
    e.stopPropagation();
    
    // 1. Snapshot Grid
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

    // 2. Initial Calculations
    const rect = blockRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    startPos.current = { x: e.clientX, y: e.clientY };
    dragOffsetRef.current = { x: 0, y: 0 };

    const el = blockRef.current;
    const initialX = centerX - blockWidthFull / 2;
    const initialY = centerY - blockHeightFull / 2;

    // 3. Move to Fixed Layer
    el.style.position = 'fixed';
    el.style.left = `${initialX}px`;
    el.style.top = `${initialY}px`;
    el.style.width = `${blockWidthFull}px`;
    el.style.height = `${blockHeightFull}px`;
    el.style.transform = 'translate3d(0, 0, 0) scale(1)';
    el.style.zIndex = '10000';
    el.style.transition = 'none';

    // 4. Anchor Point
    let firstR = 0; let firstC = 0;
    for (let r = 0; r < rows; r++) {
      let found = false;
      for (let c = 0; c < columns; c++) {
        if (block.shape[r][c] === 1) { firstR = r; firstC = c; found = true; break; }
      }
      if (found) break;
    }
    blockAnchorsRef.current = { r: firstR, c: firstC };

    setIsDragging(true);

    const onPointerMove = (moveEvent: PointerEvent) => {
      const deltaX = moveEvent.clientX - startPos.current.x;
      const DRAG_Y_OFFSET = -40; // Lift block above finger but stay responsive
      const deltaY = (moveEvent.clientY - startPos.current.y) + DRAG_Y_OFFSET;
      
      dragOffsetRef.current = { x: deltaX, y: deltaY };
      el.style.transform = `translate3d(${deltaX}px, ${deltaY}px, 0)`;

      // Preview
      const curCenterX = centerX + deltaX;
      const curCenterY = centerY + deltaY;
      const topLeftX = curCenterX - blockWidthFull / 2;
      const topLeftY = curCenterY - blockHeightFull / 2;
      const checkX = topLeftX + blockAnchorsRef.current.c * cellSize + cellSize / 2;
      const checkY = topLeftY + blockAnchorsRef.current.r * cellSize + cellSize / 2;
      
      const cell = findNearestCell(checkX, checkY);
      if (cell) {
        onPreview(block, cell.row - blockAnchorsRef.current.r, cell.col - blockAnchorsRef.current.c);
      } else {
        onPreview(null, -1, -1);
      }
    };

    const onPointerUp = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      
      setIsDragging(false);
      onPreview(null, -1, -1);

      const finalX = centerX + dragOffsetRef.current.x;
      const finalY = centerY + dragOffsetRef.current.y;
      const topLeftX = finalX - blockWidthFull / 2;
      const topLeftY = finalY - blockHeightFull / 2;
      const checkX = topLeftX + blockAnchorsRef.current.c * cellSize + cellSize / 2;
      const checkY = topLeftY + blockAnchorsRef.current.r * cellSize + cellSize / 2;
      
      const cell = findNearestCell(checkX, checkY);
      const placed = cell ? onPlace(block.id, cell.row - blockAnchorsRef.current.r, cell.col - blockAnchorsRef.current.c) : false;

      // Always reset styles - whether placed or not
      if (placed) {
        // Placed successfully: reset immediately so React can cleanly unmount
        el.style.position = '';
        el.style.left = '';
        el.style.top = '';
        el.style.width = '';
        el.style.height = '';
        el.style.transform = '';
        el.style.zIndex = '';
        el.style.transition = '';
      } else {
        // Not placed: animate back to slot
        el.style.transition = 'transform 0.25s cubic-bezier(0.2, 0, 0.2, 1)';
        el.style.transform = 'translate3d(0, 0, 0)';
        setTimeout(() => {
          el.style.position = '';
          el.style.left = '';
          el.style.top = '';
          el.style.width = '';
          el.style.height = '';
          el.style.transform = '';
          el.style.zIndex = '';
          el.style.transition = '';
        }, 260);
      }
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  return (
    <div
      ref={blockRef}
      className="relative p-0 select-none flex items-center justify-center"
      style={{
        width: isDragging ? blockWidthFull : blockWidthFull * invScale,
        height: isDragging ? blockHeightFull : blockHeightFull * invScale,
        touchAction: 'none',
        zIndex: isDragging ? 10000 : 10,
      }}
      onPointerDown={handlePointerDown}
    >
      <div className={`absolute -inset-8 z-0 ${isDragging ? 'pointer-events-none' : 'pointer-events-auto'}`} />
      <div
        className={`grid relative z-10 transition-opacity duration-200 ${isDragging ? 'opacity-90' : 'opacity-100'}`}
        style={{
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: '0px',
          pointerEvents: 'none',
          transform: isDragging ? 'scale(1)' : `scale(${invScale})`,
          transformOrigin: 'center center'
        }}
      >
        {block.shape.map((row, r) => (row.map((val, c) => (
          <div
            key={`${r}-${c}`}
            className={`${val === 0 ? 'opacity-0' : 'opacity-100'}`}
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
}
