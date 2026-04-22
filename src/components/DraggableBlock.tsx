'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Block } from '@/types/game';
import { getColorClass } from '@/utils/gameUtils';

interface DraggableBlockProps {
  block: Block;
  onPlace: (blockId: string, row: number, col: number) => boolean;
}

export default function DraggableBlock({ block, onPlace }: DraggableBlockProps) {
  const [isDragging, setIsDragging] = useState(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const blockRef = useRef<HTMLDivElement>(null);
  const startPos = useRef({ x: 0, y: 0 });
  const startCenterRef = useRef({ x: 0, y: 0 });
  const gridCellsRef = useRef<{ row: number, col: number, x: number, y: number }[]>([]);
  const latestPointerRef = useRef({ x: 0, y: 0 });
  const blockAnchorsRef = useRef({ r: 0, c: 0 }); // Cache the anchor of the block's first solid cell

  // Sync cell size to CSS breakpoints for accurate pointer math
  const [cellSize, setCellSize] = useState(44);
  useEffect(() => {
    const updateSize = () => {
      const w = window.innerWidth;
      if (w <= 360) setCellSize(32);
      else if (w <= 420) setCellSize(38);
      else setCellSize(44);
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const GRID_GAP = 4;
  const columns = block.shape[0].length;
  const rows = block.shape.length;
  const blockWidthFull = columns * cellSize + (columns > 1 ? (columns - 1) * GRID_GAP : 0);
  const blockHeightFull = rows * cellSize + (rows > 1 ? (rows - 1) * GRID_GAP : 0);
  const invScale = Math.min(1, 120 / Math.max(blockWidthFull, blockHeightFull));



  const findNearestCell = (x: number, y: number) => {
    let nearest = null;
    let minDist = cellSize * 1.5; // Snap tolerance
    for (const cell of gridCellsRef.current) {
      const dist = Math.sqrt(Math.pow(cell.x - x, 2) + Math.pow(cell.y - y, 2));
      if (dist < minDist) {
        minDist = dist;
        nearest = cell;
      }
    }
    return nearest;
  };

  const handleMove = useRef<((e: PointerEvent) => void) | null>(null);
  const handleUp = useRef<((e: PointerEvent) => void) | null>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!blockRef.current) return;
    e.currentTarget.setPointerCapture(e.pointerId);

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

    const rect = blockRef.current.getBoundingClientRect();
    startCenterRef.current = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    startPos.current = { x: e.clientX, y: e.clientY };
    dragOffsetRef.current = { x: 0, y: 0 };
    latestPointerRef.current = { x: e.clientX, y: e.clientY };

    // Calculate the anchor (first solid cell) once per drag
    let firstR = 0; let firstC = 0;
    for (let r = 0; r < rows; r++) {
      let found = false;
      for (let c = 0; c < columns; c++) {
        if (block.shape[r][c] === 1) { firstR = r; firstC = c; found = true; break; }
      }
      if (found) break;
    }
    blockAnchorsRef.current = { r: firstR, c: firstC };

    if (blockRef.current) blockRef.current.style.transition = 'none';
    setIsDragging(true);

    handleMove.current = (moveEvent: PointerEvent) => {
      const DRAG_Y_OFFSET = -80; // Render block 80px above finger
      const rawX = moveEvent.clientX - startPos.current.x;
      const rawY = moveEvent.clientY - startPos.current.y + DRAG_Y_OFFSET;
      
      // FLUID DRAG: Always follow finger smoothly
      if (blockRef.current) {
        blockRef.current.style.transform = `translate3d(${rawX}px, ${rawY}px, 0) scale(1.15)`;
        dragOffsetRef.current = { x: rawX, y: rawY };
      }
      latestPointerRef.current = { x: moveEvent.clientX, y: moveEvent.clientY };
    };

    handleUp.current = () => {
      if (handleMove.current) window.removeEventListener('pointermove', handleMove.current);
      if (handleUp.current) {
        window.removeEventListener('pointerup', handleUp.current);
        window.removeEventListener('pointercancel', handleUp.current);
      }

      setIsDragging(false);

      const curX = dragOffsetRef.current.x;
      const curY = dragOffsetRef.current.y;
      const currentCenterX = startCenterRef.current.x + curX;
      const currentCenterY = startCenterRef.current.y + curY;
      const topLeftX = currentCenterX - blockWidthFull / 2;
      const topLeftY = currentCenterY - blockHeightFull / 2;

      const checkX = topLeftX + blockAnchorsRef.current.c * (cellSize + GRID_GAP) + cellSize / 2;
      const checkY = topLeftY + blockAnchorsRef.current.r * (cellSize + GRID_GAP) + cellSize / 2;
      
      const cell = findNearestCell(checkX, checkY);

      if (cell) {
        onPlace(block.id, cell.row - blockAnchorsRef.current.r, cell.col - blockAnchorsRef.current.c);
      }

      if (blockRef.current) {
        blockRef.current.style.transition = 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        blockRef.current.style.transform = `translate3d(0px, 0px, 0) scale(${invScale})`;
      }
      dragOffsetRef.current = { x: 0, y: 0 };
    };

    window.addEventListener('pointermove', handleMove.current, { passive: true });
    window.addEventListener('pointerup', handleUp.current);
    window.addEventListener('pointercancel', handleUp.current);
  };

  return (
    <div
      ref={blockRef}
      className="relative p-0 rounded-lg select-none"
      style={{
        width: blockWidthFull,
        height: blockHeightFull,
        touchAction: 'none',
        transform: isDragging ? undefined : `translate3d(0px, 0px, 0) scale(${invScale})`,
        transition: isDragging ? 'none' : 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: isDragging ? 9999 : 10,
        pointerEvents: 'auto',
        transformOrigin: 'center center',
        willChange: 'transform',
      }}
      onPointerDown={handlePointerDown}
    >
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
}
