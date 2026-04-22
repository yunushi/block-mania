'use client';

import React from 'react';

interface MainMenuProps {
  onPlay: () => void;
  highScore: number;
  hasActiveGame: boolean;
}

const MainMenu: React.FC<MainMenuProps> = ({ onPlay, highScore, hasActiveGame }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 relative overflow-hidden bg-[#9d9d9d]">
      <div className="relative z-10 flex flex-col items-center gap-12 max-w-lg w-full">
        {/* Title */}
        <div className="text-center space-y-2">
          <h1 className="text-[100px] font-bold tracking-tight text-white drop-shadow-md">
            MENU
          </h1>
          <p className="text-white/80 font-bold tracking-[0.2em] uppercase text-sm">Block Blast Classic</p>
        </div>

        {/* High Score */}
        <div className="px-10 py-6 bg-[#323232] rounded-xl border border-white/10 shadow-2xl">
          <p className="text-white/50 text-xs font-bold tracking-widest uppercase mb-1 text-center">BEST SCORE</p>
          <p className="text-5xl font-bold text-[#fbb034] tabular-nums tracking-tighter">{highScore.toLocaleString()}</p>
        </div>

        {/* Play Button */}
        <button 
          onClick={onPlay}
          className="group relative w-full h-24 flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
        >
          <div className="absolute inset-0 bg-[#323232] rounded-xl border-t-2 border-l-2 border-white/20 border-b-2 border-r-2 border-black/40 shadow-2xl" />
          <span className="relative text-4xl font-bold text-white tracking-widest uppercase">
            {hasActiveGame ? 'RESUME' : 'PLAY'}
          </span>
        </button>

        {/* Tips */}
        <p className="text-white/60 text-center text-sm leading-relaxed max-w-xs px-4 font-medium">
          Drag blocks to the grid. Fill rows or columns to blast them!
        </p>
      </div>
    </div>
  );
};

export default MainMenu;
