'use client';

import React from 'react';
import { Block } from '@/types/game';
import DraggableBlock from './DraggableBlock';

interface BlockInventoryProps {
  blocks: Block[];
  onPlace: (blockId: string, row: number, col: number) => boolean;
  onDragMove?: (blockId: string, row: number, col: number) => void;
  onDragEnd?: () => void;
}

const BlockInventory: React.FC<BlockInventoryProps> = ({ blocks, onPlace, onDragMove, onDragEnd }) => {
  return (
    <div className="flex justify-center items-center w-full max-w-2xl h-32 sm:h-40 md:h-48 bg-slate-900/60 rounded-2xl md:rounded-3xl glass p-2 sm:p-6 gap-2 sm:gap-4 border border-white/10 shadow-2xl max-w-[95vw]">
      {[0, 1, 2].map((index) => (
        <div 
          key={index} 
          className="flex justify-center items-center flex-1 max-w-[150px] aspect-square h-auto border border-white/5 rounded-xl sm:rounded-2xl bg-white/5"
        >
          {blocks[index] && (
            <div className="relative flex justify-center items-center w-full h-full transform scale-90 md:scale-100 hover:scale-110 transition-transform">
              <div className="absolute flex justify-center items-center">
                <DraggableBlock 
                  block={blocks[index]} 
                  onPlace={onPlace} 
                  onDragMove={onDragMove} 
                  onDragEnd={onDragEnd} 
                />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default BlockInventory;
