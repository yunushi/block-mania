'use client';

import React from 'react';
import { Grid } from '@/types/game';

interface GameBoardProps {
  grid: Grid;
  onDrop: (blockId: string, row: number, col: number) => void;
  previewLines?: { rows: number[], cols: number[], colors: Record<string, string> };
  showPerfect?: boolean;
}

const GameBoard: React.FC<GameBoardProps> = ({ grid, previewLines, showPerfect }) => {
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
          const isRowPreview = previewLines?.rows.includes(r);
          const isColPreview = previewLines?.cols.includes(c);
          const previewColor = isRowPreview
            ? previewLines?.colors[`row-${r}`]
            : isColPreview ? previewLines?.colors[`col-${c}`] : null;

          return (
            <div
              key={`${r}-${c}`}
              className={`bg-[var(--cell-bg)] rounded-sm relative overflow-hidden transition-all ${cell?.isClearing ? 'is-clearing' : ''}`}
              style={{
                width: 'var(--cell-size)',
                height: 'var(--cell-size)',
                boxShadow: previewColor ? `inset 0 0 15px ${previewColor}, 0 0 10px ${previewColor}` : 'none',
                borderColor: previewColor ? previewColor : 'transparent',
                borderWidth: previewColor ? '2px' : '0'
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
