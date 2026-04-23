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
    placeBlock, resetGame, startGame, goToMenu, updatePreview,
    previewRows, previewCols, previewColor, currentTheme, toggleTheme
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
  return (
    <div className={`theme-${currentTheme} min-h-[100dvh] w-full flex flex-col bg-[var(--background)] transition-colors duration-500`}>
      {gameStatus === 'menu' ? (
        <MainMenu onPlay={startGame} highScore={highScore} hasActiveGame={hasActiveGame} />
      ) : (
        <main className="flex flex-col items-center w-full h-[100dvh] select-none overflow-hidden relative bg-animated pt-safe pb-safe">

      {/* Combo Indicator - Moved to TOP center */}
      {showCombo && comboCount > 1 && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 whitespace-nowrap z-[1000] animate-bounce-in">
          <div className="combo-text text-5xl font-black italic tracking-tighter">
            <span className="text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]">COMBO </span>
            <span className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]">x{comboCount}</span>
          </div>

          {comboShoutout && (
            <div className={`combo-shoutout shoutout-${comboShoutout.type} text-6xl absolute top-14 left-1/2 -translate-x-1/2`}>
              {comboShoutout.text}
            </div>
          )}
        </div>
      )}


      {/* Header Area - Reduced top padding to shift everything up */}
      <div className="w-full ps-4 pe-4 max-w-lg flex flex-col gap-2 pt-0 z-20">
        <div className="flex justify-between items-start">
          {/* Top Left: Crown + High Score */}
          <div className="flex items-center gap-1 mt-2 pulse-score">
            <span className="text-3xl filter drop-shadow-sm mb-2">👑</span>
            <span className="text-2xl font-medium text-[var(--accent-color)] tracking-tight">
              {highScore}
            </span>
          </div>

          {/* Top Right: Theme Toggle + Settings Gear */}
          <div className="flex items-center gap-2 mt-2">
            {/* 3D Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              title={currentTheme === 'blue' ? 'Switch to Grey' : 'Switch to Blue'}
              style={{
                width: 44, height: 44,
                borderRadius: 12,
                border: 'none',
                cursor: 'pointer',
                position: 'relative',
                outline: 'none',
                background: currentTheme === 'blue'
                  ? 'linear-gradient(145deg, #6b7280, #4b5563)'
                  : 'linear-gradient(145deg, #3b82f6, #1d4ed8)',
                boxShadow: currentTheme === 'blue'
                  ? '0 5px 0 #374151, 0 6px 8px rgba(0,0,0,0.4)'
                  : '0 5px 0 #1e3a8a, 0 6px 8px rgba(0,0,0,0.4)',
                transition: 'all 0.1s ease',
                transform: 'translateY(0px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
                userSelect: 'none',
                WebkitTapHighlightColor: 'transparent',
              }}
              onPointerDown={e => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(4px)';
                (e.currentTarget as HTMLElement).style.boxShadow = currentTheme === 'blue'
                  ? '0 1px 0 #374151, 0 2px 4px rgba(0,0,0,0.4)'
                  : '0 1px 0 #1e3a8a, 0 2px 4px rgba(0,0,0,0.4)';
              }}
              onPointerUp={e => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0px)';
                (e.currentTarget as HTMLElement).style.boxShadow = currentTheme === 'blue'
                  ? '0 5px 0 #374151, 0 6px 8px rgba(0,0,0,0.4)'
                  : '0 5px 0 #1e3a8a, 0 6px 8px rgba(0,0,0,0.4)';
              }}
              onPointerLeave={e => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0px)';
              }}
            >
              {currentTheme === 'blue' ? '🌫️' : '⚡'}
            </button>

            <button
              onClick={() => setIsSettingsOpen(true)}
              className="text-4xl text-white hover:opacity-80 transition-all transform hover:rotate-90"
            >
              ⚙️
            </button>
          </div>
        </div>

        {/* Large Score in Center */}
        <div className="text-center drop-shadow-lg pulse-score -mt-4">
          <div className="text-6xl font-bold text-white tabular-nums tracking-tighter">
            {score}
          </div>
        </div>
      </div>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onMenu={goToMenu}
        onReset={resetGame}
      />

      {/* Game Board Frame - More beveled and exact */}
      <div className="relative p-[10px] rounded-xl bg-[var(--grid-bg)] border-t-2 border-l-2 border-white/20 border-b-2 border-r-2 border-black/40 shadow-2xl z-10">
        <GameBoard
          grid={grid}
          onDrop={placeBlock}
          showPerfect={showPerfect}
          previewRows={previewRows}
          previewCols={previewCols}
          previewColor={previewColor}
        />


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

      {/* Controller / Inventory - Lifted even higher for better reach/visibility */}
      <div className="fixed bottom-60 left-0 right-0 z-30 pb-safe flex justify-center">
        <div className="w-full max-w-lg px-4">
          <BlockInventory
            blocks={inventory}
            onPlace={placeBlock}
            onPreview={updatePreview}
          />
        </div>
      </div>

      {/* Remove Instructions to keep it clean like the image */}
    </main>
      )}
    </div>
  );
}
