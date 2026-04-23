'use client';

import React from 'react';
import { Grid } from '@/types/game';
import { getColorClass } from '@/utils/gameUtils';

interface GameBoardProps {
  grid: Grid;
  onDrop: (blockId: string, row: number, col: number) => void;
  showPerfect?: boolean;
  previewRows?: number[];
  previewCols?: number[];
  previewColor?: string | null;
}

const GameBoard: React.FC<GameBoardProps> = ({ grid, showPerfect, previewRows = [], previewCols = [], previewColor }) => {
  return (
    <div className="grid grid-cols-8 gap-[1px] p-[1px] bg-[var(--grid-bg)] rounded-[8px] relative overflow-hidden border-[4px] border-[var(--grid-bg)]">
      {/* Single unified rainbow overlay — one continuous gradient across the full grid */}
      {showPerfect && (
        <div className="rainbow-unified-overlay" />
      )}

      {grid.map((row, r) => (
        row.map((cell, c) => {
          const isPreview = previewRows.includes(r) || previewCols.includes(c);
          const previewClass = isPreview ? getColorClass(previewColor || '') : '';
          
          return (
            <div
              key={`${r}-${c}`}
              className={`grid-cell transition-all relative ${cell?.isClearing ? 'is-clearing' : ''} ${isPreview ? 'z-20' : ''}`}
              style={{
                width: 'var(--cell-size)',
                height: 'var(--cell-size)',
              }}
              data-row={r}
              data-col={c}
            >
              {/* Preview Highlight Border */}
              {isPreview && (
                <div className="absolute inset-0 border-2 border-white/80 z-30 pointer-events-none animate-pulse" />
              )}

              {isPreview ? (
                <div className={`cell-cube ${previewClass} opacity-100`} />
              ) : cell ? (
                <div className={`cell-cube ${getColorClass(cell.image)} ${!cell.isClearing ? 'bounce-in' : ''}`} />
              ) : null}
            </div>
          );
        })
      ))}
    </div>
  );
};

export default GameBoard;
