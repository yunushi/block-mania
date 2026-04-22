'use client';

import { useEffect, useState } from 'react';
import GameBoard from '@/components/GameBoard';
import BlockInventory from '@/components/BlockInventory';
import SettingsModal from '@/components/SettingsModal';
import MainMenu from '@/components/MainMenu';
import { useGameLogic } from '@/hooks/useGameLogic';

export default function Home() {
  const {
    grid, score, inventory, gameOver,
    comboCount, showCombo, showPerfect, comboShoutout,
    gameStatus,
    placeBlock, resetGame, startGame, goToMenu
  } = useGameLogic();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [highScore, setHighScore] = useState(0);

  // Load high score
  useEffect(() => {
    const saved = localStorage.getItem('block_blast_highscore');
    if (saved) setHighScore(parseInt(saved));
  }, []);

  // Save new high score only when it truly changes
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('block_blast_highscore', score.toString());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [score]);

  const hasActiveGame = score > 0 && !gameOver;

  if (gameStatus === 'menu') {
    return <MainMenu onPlay={startGame} highScore={highScore} hasActiveGame={hasActiveGame} />;
  }

  return (
    <main className={`flex flex-col items-center justify-center h-[100dvh] p-2 sm:p-4 gap-2 sm:gap-8 select-none overflow-hidden relative bg-[var(--background)]`}>


      {/* HEADER Layout from Image */}
      <div className="w-full max-w-lg flex flex-col gap-4 px-6 pt-4 z-20">
        <div className="flex justify-between items-center">
          {/* Top Left: Crown + High Score */}
          <div className="flex items-center gap-2">
            <span className="text-4xl filter drop-shadow-md">👑</span>
            <span className="text-4xl font-black text-[#fbbf24] drop-shadow-md tracking-tighter">
              {highScore}
            </span>
          </div>
          
          {/* Top Right: Settings Gear */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="text-4xl text-white/80 hover:text-white transition-all transform hover:rotate-90"
          >
            ⚙️
          </button>
        </div>

        {/* Large Score in Center */}
        <div className="flex justify-center mt-2">
          <span className="text-[120px] font-bold text-white leading-none tracking-tight drop-shadow-md">
            {score}
          </span>
        </div>
      </div>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onMenu={goToMenu}
        onReset={resetGame}
      />

      {/* Game Board Container */}
      <div className={`relative p-[6px] rounded-xl bg-[#4a4a4a] shadow-[0_15px_40px_rgba(0,0,0,0.5)] z-10 transition-all border border-white/5`}>
        <GameBoard
          grid={grid}
          onDrop={placeBlock}
          showPerfect={showPerfect}
        />

        {/* Combo Indicator */}
        {showCombo && comboCount > 1 && (
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap z-50">
            <div className="combo-text text-5xl font-black italic tracking-tighter">
              <span className="text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]">COMBO </span>
              <span className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]">x{comboCount}</span>
            </div>

            {comboShoutout && (
              <div className={`combo-shoutout shoutout-${comboShoutout.type} text-6xl absolute top-10 left-1/2 -translate-x-1/2`}>
                {comboShoutout.text}
              </div>
            )}
          </div>
        )}

        {/* Perfect Clear Indicator */}
        {showPerfect && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-50 pointer-events-none">
            <div className="text-6xl font-black italic text-center drop-shadow-[0_0_20px_rgba(0,0,0,0.5)]">
              <div className="flex justify-center mb-2">
                {"PERFECT".split('').map((char, i) => (
                  <span key={`p-${i}`} className="rainbow-letter" style={{ animationDelay: `${i * 0.1}s` }}>{char}</span>
                ))}
              </div>
              <div className="flex justify-center">
                {"CLEAR!".split('').map((char, i) => (
                  <span key={`c-${i}`} className="rainbow-letter" style={{ animationDelay: `${(i + 7) * 0.1}s` }}>{char}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 rounded-2xl backdrop-blur-md z-50 bounce-in">
            <h2 className="text-4xl font-black text-white mb-4">GAME OVER</h2>
            <p className="text-xl text-slate-300 mb-8 font-medium">Final Score: {score}</p>
            <button
              onClick={goToMenu}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg shadow-blue-500/30"
            >
              MAIN MENU
            </button>
          </div>
        )}
      </div>

      {/* Controller / Inventory - Floating Desk Style */}
      <div className={`w-full flex justify-center relative z-30 mt-4 mb-2`}>
        <BlockInventory
          blocks={inventory}
          onPlace={placeBlock}
        />
      </div>

      {/* Instructions */}
      <p className="text-slate-500 text-sm font-medium opacity-60">
        Drag pieces onto the grid to clear rows and columns
      </p>
    </main>
  );
}
