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
    <div className="w-full z-50 flex justify-center items-center">
      {/* Unified 3D Darkened Panel */}
      <div className="w-full max-w-lg bg-[#2a2a2a] rounded-2xl p-6 shadow-[inset_0_4px_12px_rgba(0,0,0,0.6),0_1px_1px_rgba(255,255,255,0.1)] border border-black/40 flex justify-between items-center gap-4">
        {[0, 1, 2].map((index) => (
          <div 
            key={index} 
            className="flex-1 flex justify-center items-center min-h-[120px] relative"
          >
            {blocks[index] ? (
              <div className="relative flex justify-center items-center w-full h-full transform hover:scale-105 active:scale-95 transition-all duration-300">
                <DraggableBlock 
                  block={blocks[index]!} 
                  onPlace={onPlace} 
                />
              </div>
            ) : (
              <div className="w-2 h-2 rounded-full bg-black/20" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BlockInventory;
