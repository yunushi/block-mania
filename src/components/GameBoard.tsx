'use client';

import React from 'react';
import { Grid } from '@/types/game';

interface GameBoardProps {
  grid: Grid;
  onDrop: (blockId: string, row: number, col: number) => void;
  showPerfect?: boolean;
}

const GameBoard: React.FC<GameBoardProps> = ({ grid, showPerfect }) => {
  const getColorClass = (image: string | null) => {
    if (!image) return '';
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

  return (
    <div className="grid grid-cols-8 gap-1 p-2 bg-[var(--grid-bg)] rounded-xl glass shadow-2xl relative overflow-hidden">
      {/* Single unified rainbow overlay — one continuous gradient across the full grid */}
      {showPerfect && (
        <div className="rainbow-unified-overlay" />
      )}

      {grid.map((row, r) => (
        row.map((cell, c) => {
          return (
            <div
              key={`${r}-${c}`}
              className={`bg-[var(--cell-bg)] rounded-sm relative overflow-hidden transition-all ${cell?.isClearing ? 'is-clearing' : ''}`}
              style={{
                width: 'var(--cell-size)',
                height: 'var(--cell-size)',
                boxShadow: 'none',
                borderColor: 'transparent',
                borderWidth: '0'
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
