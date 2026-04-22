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


      {/* Settings Button */}
      <button
        onClick={() => setIsSettingsOpen(true)}
        className="absolute top-6 right-6 w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl glass transition-all hover:rotate-90 z-[60]"
      >
        <span className="text-2xl">⚙️</span>
      </button>

      {/* Header / Score */}
      <div className="flex flex-col items-center gap-1 sm:gap-2 z-10 mt-safe pt-2">
        <h1 className="text-4xl sm:text-5xl font-black tracking-tighter text-slate-800 drop-shadow-sm italic">
          BLOCK <span className="text-pink-500">BLAST</span>
        </h1>
        <div className="flex gap-4">
          <div className="px-6 py-2 sm:px-8 sm:py-3 bg-white/5 rounded-full glass border border-white/10 shadow-xl flex items-baseline gap-2">
            <span className="text-base sm:text-xl font-bold text-slate-500">SCORE: </span>
            <span className="text-2xl sm:text-3xl font-black text-slate-800 tabular-nums tracking-tight">{score}</span>
          </div>
        </div>
      </div>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onMenu={goToMenu}
        onReset={resetGame}
      />

      {/* Game Board Container - Sharpened UI separation */}
      <div className={`relative p-3 sm:p-4 rounded-[3rem] bg-white shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] z-10 transition-all border border-slate-100`}>
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
