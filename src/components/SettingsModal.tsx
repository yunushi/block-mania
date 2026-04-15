'use client';

import React from 'react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMenu: () => void;
  onReset: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onMenu,
  onReset,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" 
        onClick={onClose} 
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-sm bg-slate-900/90 border border-white/10 rounded-[2.5rem] p-8 shadow-2xl glass scale-in overflow-hidden text-center">
        {/* Decorative Aura */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/20 blur-[60px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/20 blur-[60px] rounded-full pointer-events-none" />

        <div className="relative z-10 space-y-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-3xl font-black text-white italic tracking-tighter">SETTINGS</h2>
            <button 
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              ✕
            </button>
          </div>


          {/* Actions */}
          <div className="space-y-3">
            <button 
              onClick={() => {
                onMenu();
                onClose();
              }}
              className="w-full py-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 text-white font-bold transition-all uppercase tracking-widest"
            >
              MENU
            </button>
            <button 
              onClick={() => {
                onReset();
                onClose();
              }}
              className="w-full py-4 rounded-2xl bg-red-600/20 hover:bg-red-600/40 border border-red-500/50 text-red-100 font-bold transition-all uppercase tracking-widest"
            >
              RESET GAME
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
