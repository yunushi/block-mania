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
    <div className="grid grid-cols-8 gap-1 p-[6px] bg-[#0c1322] rounded-[1rem] border-[4px] border-[#1e293b] shadow-[inset_0_4px_20px_rgba(0,0,0,0.8),0_20px_40px_-10px_rgba(0,0,0,0.9)] relative overflow-hidden">
      {/* Single unified rainbow overlay — one continuous gradient across the full grid */}
      {showPerfect && (
        <div className="rainbow-unified-overlay" />
      )}

      {grid.map((row, r) => (
        row.map((cell, c) => {
          return (
            <div
              key={`${r}-${c}`}
              className={`bg-[#1e293b] rounded-sm relative overflow-hidden transition-all ${cell?.isClearing ? 'is-clearing' : ''}`}
              style={{
                width: 'var(--cell-size)',
                height: 'var(--cell-size)',
                boxShadow: 'inset 0 3px 6px rgba(0,0,0,0.3)',
                border: '1px solid rgba(0,0,0,0.3)'
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
