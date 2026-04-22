'use client';

import React from 'react';
import { Grid } from '@/types/game';
import { getColorClass } from '@/utils/gameUtils';

interface GameBoardProps {
  grid: Grid;
  onDrop: (blockId: string, row: number, col: number) => void;
  showPerfect?: boolean;
}

const GameBoard: React.FC<GameBoardProps> = ({ grid, showPerfect }) => {


  return (
    <div className="grid grid-cols-8 gap-1 p-[6px] bg-[#1e293b] rounded-2xl border-[6px] border-[#334155] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5),inset_0_2px_10px_rgba(255,255,255,0.05)] relative overflow-hidden">
      {/* Single unified rainbow overlay — one continuous gradient across the full grid */}
      {showPerfect && (
        <div className="rainbow-unified-overlay" />
      )}

      {grid.map((row, r) => (
        row.map((cell, c) => {
          return (
            <div
              key={`${r}-${c}`}
              className={`grid-cell transition-all ${cell?.isClearing ? 'is-clearing' : ''}`}
              style={{
                width: 'var(--cell-size)',
                height: 'var(--cell-size)',
              }}
              data-row={r}
              data-col={c}
            >
              {cell && (
                <div className={`cell-cube ${getColorClass(cell.image)} ${!cell.isClearing ? 'bounce-in' : ''}`} />
              )}
            </div>
          );
        })
      ))}
    </div>
  );
};

export default GameBoard;
