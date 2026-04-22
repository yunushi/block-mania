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

  const gridCellsRef = useRef<{ row: number, col: number, x: number, y: number }[]>([]);
  const lastEventCellRef = useRef<{ row: number, col: number } | null>(null);

  const latestPointerRef = useRef({ x: 0, y: 0 });

  // Pure DOM handlers for ultimate zero-lag dragging
  const handleMove = useRef<(e: PointerEvent) => void>(null as any);
  const handleUp = useRef<(e: PointerEvent) => void>(null as any);

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

    handleMove.current = (moveEvent: PointerEvent) => {
      // 1:1 Parity directly to hardware pointer (No offsets!)
      let newX = moveEvent.clientX - startPos.current.x;
      let newY = moveEvent.clientY - startPos.current.y;

      dragOffsetRef.current = { x: newX, y: newY };
      latestPointerRef.current = { x: moveEvent.clientX, y: moveEvent.clientY };

      if (blockRef.current) {
        blockRef.current.style.transform = `translate3d(${newX}px, ${newY}px, 0) scale(1)`;
      }
    };

    handleUp.current = (upEvent: PointerEvent) => {
      window.removeEventListener('pointermove', handleMove.current);
      window.removeEventListener('pointerup', handleUp.current);
      window.removeEventListener('pointercancel', handleUp.current);

      setIsDragging(false);

      let newX = dragOffsetRef.current.x;
      let newY = dragOffsetRef.current.y;
      let currentScale = 1.0;
      const scaledWidth = blockWidthFull;
      const scaledHeight = blockHeightFull;

      const currentCenterX = startCenterRef.current.x + newX;
      const currentCenterY = startCenterRef.current.y + newY;
      const topLeftX = currentCenterX - scaledWidth / 2;
      const topLeftY = currentCenterY - scaledHeight / 2;

      let firstSolidR = 0, firstSolidC = 0;
      for (let r = 0; r < rows; r++) {
        let found = false;
        for (let c = 0; c < columns; c++) {
          if (block.shape[r][c] === 1) {
            firstSolidR = r;
            firstSolidC = c;
            found = true;
            break;
          }
        }
        if (found) break;
      }

      const checkX = topLeftX + firstSolidC * (cellSize + GRID_GAP) + cellSize / 2;
      const checkY = topLeftY + firstSolidR * (cellSize + GRID_GAP) + cellSize / 2;
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

      const cell = findNearestCell(checkX, checkY);

      if (cell) {
        onPlace(block.id, cell.row - firstSolidR, cell.col - firstSolidC);
      }

      if (blockRef.current) {
        blockRef.current.style.transition = 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)';
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
      className={`relative p-0 rounded-lg select-none`}
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
