'use client';

import React from 'react';
import { Block } from '@/types/game';
import DraggableBlock from './DraggableBlock';

interface BlockInventoryProps {
  blocks: (Block | null)[];
  onPlace: (blockId: string, row: number, col: number) => boolean;
}

const BlockInventory: React.FC<BlockInventoryProps> = ({ blocks, onPlace }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 inventory-panel px-6 pt-10 pb-12 flex justify-center items-center">
      <div className="flex justify-between items-center gap-6 w-full max-w-lg">
        {[0, 1, 2].map((index) => (
          <div 
            key={index} 
            className="flex-1 flex justify-center items-center aspect-square rounded-3xl bg-slate-100/50 border-2 border-white/80 shadow-[inset_0_2px_10px_rgba(0,0,0,0.05)] transition-all relative"
          >
            {blocks[index] ? (
              <div className="relative flex justify-center items-center w-full h-full transform hover:scale-110 active:scale-95 transition-all duration-300">
                <DraggableBlock 
                  block={blocks[index]!} 
                  onPlace={onPlace} 
                />
              </div>
            ) : (
              <div className="w-6 h-6 rounded-full bg-slate-200/50 blur-[2px]" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BlockInventory;
