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
    <div className="grid grid-cols-8 gap-0 p-[1px] bg-[#323232] rounded-[4px] relative overflow-hidden">
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
