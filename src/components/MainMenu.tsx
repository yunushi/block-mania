'use client';

import React from 'react';

interface MainMenuProps {
  onPlay: () => void;
  highScore: number;
  hasActiveGame: boolean;
}

const MainMenu: React.FC<MainMenuProps> = ({ onPlay, highScore, hasActiveGame }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 relative overflow-hidden bg-[var(--background)]">
      {/* Background Decorative Elements */}
      <div className={`absolute top-[-10%] left-[-10%] w-[40%] h-[40%] blur-[120px] rounded-full pointer-events-none transition-colors duration-1000 bg-pink-500/10`} />
      <div className={`absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] blur-[120px] rounded-full pointer-events-none transition-colors duration-1000 bg-blue-500/10`} />

      <div className="relative z-10 flex flex-col items-center gap-12 max-w-lg w-full">
        {/* Title */}
        <div className="text-center space-y-2">
          <h1 className="text-8xl font-black italic tracking-tighter text-slate-800 drop-shadow-sm animate-bounce-in">
            MENU
          </h1>
          <p className="text-slate-500 font-bold tracking-[0.2em] uppercase text-sm animate-fade-in">Block Blast Adventure</p>
        </div>

        {/* High Score */}
        <div className="px-10 py-4 bg-white rounded-[2rem] border border-slate-100 shadow-xl animate-scale-in">
          <p className="text-slate-500 text-xs font-black tracking-widest uppercase mb-1">Personal Best</p>
          <p className="text-4xl font-black text-slate-800 tabular-nums tracking-tighter italic">{highScore.toLocaleString()}</p>
        </div>

        {/* Play Button */}
        <button 
          onClick={onPlay}
          className="group relative w-full h-24 flex items-center justify-center animate-scale-in delay-100"
        >
          <div className="absolute inset-0 bg-pink-500 rounded-[2rem] blur-xl opacity-30 group-hover:opacity-50 transition-opacity" />
          <div className="absolute inset-0 bg-gradient-to-br from-pink-400 to-pink-600 rounded-[2rem] border-4 border-white/40 shadow-2xl transition-transform group-hover:scale-105 active:scale-95" />
          <span className="relative text-4xl font-black text-white italic tracking-widest uppercase">
            {hasActiveGame ? 'RESUME' : 'PLAY'}
          </span>
        </button>

        {/* Tips */}
        <div className="space-y-4 animate-fade-in delay-200">
          <div className="flex items-center gap-4 text-slate-400/60 font-medium text-sm">
            <div className="w-12 h-[1px] bg-slate-400/20" />
            <span>HOW TO PLAY</span>
            <div className="w-12 h-[1px] bg-slate-400/20" />
          </div>
          <p className="text-slate-400 text-center text-sm leading-relaxed max-w-xs px-4">
            Drag blocks to the grid. Fill rows or columns to blast them and rack up combos!
          </p>
        </div>
      </div>
    </div>
  );
};

export default MainMenu;
