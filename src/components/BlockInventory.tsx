'use client';

import React from 'react';
import { Block } from '@/types/game';
import DraggableBlock from './DraggableBlock';

interface BlockInventoryProps {
  blocks: (Block | null)[];
  onPlace: (blockId: string, row: number, col: number) => boolean;
  onPreview: (block: Block | null, row: number, col: number) => void;
}

const BlockInventory: React.FC<BlockInventoryProps> = ({ blocks, onPlace, onPreview }) => {
  return (
    <div className="w-full z-50 flex justify-center items-center">
      {/* Unified 3D Darkened Panel */}
      <div className="w-full flex justify-between items-center gap-4">
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            className="w-[90px] h-[90px] flex justify-center items-center relative"
          >
            {blocks[index] ? (
              <div key={blocks[index]!.id} className="relative flex justify-center items-center w-full h-full">
                <DraggableBlock
                  block={blocks[index]!}
                  onPlace={onPlace}
                  onPreview={onPreview}
                />
              </div>
            ) : (
              <div className="w-full h-full" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BlockInventory;
