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
    previewLines, comboCount, showCombo, showPerfect, comboShoutout,
    isMuted, toggleMute, currentSkin, changeSkin,
    gameStatus, setGameStatus,
    placeBlock, updatePreview, clearPreview, resetGame, startGame, goToMenu, cycleSkin
  } = useGameLogic();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [highScore, setHighScore] = useState(0);

  // Load high score
  useEffect(() => {
    const saved = localStorage.getItem('block_blast_highscore');
    if (saved) setHighScore(parseInt(saved));
  }, []);

  // Save new high score
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('block_blast_highscore', score.toString());
    }
  }, [score, highScore]);

  if (gameStatus === 'menu') {
    return <MainMenu onPlay={startGame} highScore={highScore} currentSkin={currentSkin} />;
  }

  return (
    <main className={`flex flex-col items-center justify-center h-[100dvh] p-2 sm:p-4 gap-2 sm:gap-8 select-none overflow-hidden relative bg-[#0f172a] skin-${currentSkin}`}>
      {/* Background Decorative Elements - Static Colors as requested */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] blur-[120px] rounded-full pointer-events-none bg-blue-500/10" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] blur-[120px] rounded-full pointer-events-none bg-purple-500/10" />

      {/* Settings Button */}
      <button
        onClick={() => setIsSettingsOpen(true)}
        className="absolute top-6 right-6 w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl glass transition-all hover:rotate-90 z-[60]"
      >
        <span className="text-2xl">⚙️</span>
      </button>

      {/* Header / Score */}
      <div className="flex flex-col items-center gap-1 sm:gap-2 z-10 mt-safe pt-2">
        <h1 className="text-4xl sm:text-5xl font-black tracking-tighter text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] italic">
          BLOCK <span className="text-blue-500">BLAST</span>
        </h1>
        <div className="flex gap-4">
          <div className="px-6 py-2 sm:px-8 sm:py-3 bg-white/5 rounded-full glass border border-white/10 shadow-xl flex items-baseline gap-2">
            <span className="text-base sm:text-xl font-bold text-blue-400">SCORE: </span>
            <span className="text-2xl sm:text-3xl font-black text-white tabular-nums tracking-tight">{score}</span>
          </div>
        </div>
      </div>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentSkin={currentSkin}
        onCycleSkin={cycleSkin}
        onMenu={goToMenu}
        onReset={resetGame}
      />

      {/* Game Board Container */}
      <div className={`relative p-3 rounded-[2.5rem] bg-slate-900/40 shadow-[0_0_80px_rgba(0,0,0,0.6)] border border-white/10 z-10 ink-drop-container backdrop-blur-md transition-all ${currentSkin === 'neon' ? 'border-purple-500/30' :
          currentSkin === 'gold' ? 'border-yellow-500/30' :
            ''
        }`}>
        <GameBoard
          grid={grid}
          onDrop={placeBlock}
          previewLines={previewLines}
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

      {/* Controller / Inventory */}
      <div className={`w-full flex justify-center relative z-30 ${currentSkin === 'neon' ? 'skin-neon' :
          currentSkin === 'gold' ? 'skin-gold' :
            ''
        }`}>
        <BlockInventory
          blocks={inventory}
          onPlace={placeBlock}
          onDragMove={updatePreview}
          onDragEnd={clearPreview}
        />
      </div>

      {/* Instructions */}
      <p className="text-slate-500 text-sm font-medium opacity-60">
        Drag pieces onto the grid to clear rows and columns
      </p>
    </main>
  );
}
