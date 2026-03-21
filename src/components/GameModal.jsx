import { useState } from 'react';
import { ListPlus, CheckCircle2, Trash2, X } from 'lucide-react';

export default function GameModal({ 
  gameData, setGameData, onSave, onCancel, onDelete, isEditMode 
}) {
  const [imgLoaded, setImgLoaded] = useState(false);

  if (!gameData) return null;

  const optClass = (active, colorClass) => {
    return `flex-1 py-4 sm:py-3.5 rounded-2xl text-xs sm:text-sm font-black uppercase tracking-[0.1em] transition-all flex items-center justify-center gap-2 ${
      active 
        ? `${colorClass} brutal-btn active:scale-95` 
        : 'bg-black/5 dark:bg-transparent border-2 border-black/10 dark:border-white/10 text-black/40 dark:text-[#555] hover:text-black dark:hover:text-white hover:bg-black/10 dark:hover:bg-white/5 active:scale-95'
    }`;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 dark:bg-black/90 backdrop-blur-md">
      <div className="w-full max-w-[420px] bg-[#fafafa] dark:bg-[#050510] border-2 border-black dark:border-white/20 shadow-[8px_8px_0px_#000] dark:shadow-[8px_8px_0px_rgba(255,255,255,0.8)] rounded-3xl sm:rounded-[2rem] flex flex-col max-h-[90vh]">
        
        {/* Header Image with Loading Skeleton */}
        <div className="relative h-48 sm:h-[220px] bg-black/10 dark:bg-white/5 shrink-0 rounded-t-[calc(1.5rem-2px)] sm:rounded-t-[calc(2rem-2px)] overflow-hidden">
          {!imgLoaded && (
            <div className="absolute inset-0 block animate-pulse bg-black/20 dark:bg-white/10"></div>
          )}
          <img 
            src={gameData.imageUrl} alt={gameData.name}
            onLoad={() => setImgLoaded(true)}
            className={`w-full h-full object-cover transition-opacity duration-500 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
            onError={(e) => { e.target.src = `https://placehold.co/460x215/1a1a1a/8b5cf6?text=${encodeURIComponent(gameData.name)}`; }}
          />
          {/* Bottom Gradient Fade for dramatic effect */}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#fafafa] dark:from-[#050505] to-transparent"></div>

          <button onClick={onCancel} className="absolute top-4 right-4 p-2 bg-black/50 text-white backdrop-blur-md rounded-full border border-white/20 hover:scale-110 active:scale-95 transition-transform flex">
            <X className="w-5 h-5"/>
          </button>
        </div>
        
        <div className="px-6 pb-6 sm:px-8 sm:pb-8 flex flex-col gap-5 sm:gap-7 overflow-y-auto -mt-6 relative z-10 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <h3 className="text-[1.75rem] sm:text-3xl font-black leading-[1.1] tracking-tighter uppercase text-black dark:text-white drop-shadow-md break-words">
            {gameData.name}
          </h3>
          
          <div className="space-y-6">
            <div>
              <label className="block text-[10px] sm:text-[11px] font-extrabold text-black/50 dark:text-[#a1a1aa] mb-3 uppercase tracking-widest">Progress Priority</label>
              <div className="flex gap-3 sm:gap-4">
                <button onClick={() => setGameData({...gameData, status: 'Wanted'})} className={optClass(gameData.status === 'Wanted', 'bg-neon-yellow', 'shadow-[4px_4px_0px_#fff]')}>Wanted</button>
                <button onClick={() => setGameData({...gameData, status: 'Played'})} className={optClass(gameData.status === 'Played', 'bg-neon-green', 'shadow-[4px_4px_0px_#fff]')}>Played</button>
              </div>
            </div>
            <div>
              <label className="block text-[10px] sm:text-[11px] font-extrabold text-black/50 dark:text-[#a1a1aa] mb-3 uppercase tracking-widest">Game Type</label>
              <div className="flex gap-3 sm:gap-4">
                <button onClick={() => setGameData({...gameData, mode: 'Singleplayer'})} className={optClass(gameData.mode === 'Singleplayer', 'bg-neon-purple', 'shadow-[4px_4px_0px_#fff]')}>Single</button>
                <button onClick={() => setGameData({...gameData, mode: 'Multiplayer'})} className={optClass(gameData.mode === 'Multiplayer', 'bg-neon-cyan', 'shadow-[4px_4px_0px_#fff]')}>Multi</button>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex flex-col gap-3 sm:gap-4 pt-6 border-t-2 border-black/10 dark:border-[#222] mt-2">
            <div className="flex gap-3 sm:gap-4 flex-col sm:flex-row">
              <button onClick={onCancel}
                className="w-full sm:flex-1 py-4 sm:py-3.5 bg-transparent border-2 border-black/20 dark:border-[#333] text-black/60 hover:text-black dark:text-[#888] dark:hover:text-white rounded-2xl font-black uppercase tracking-widest transition-all active:scale-95 order-2 sm:order-1"
              >Cancel</button>
              <button onClick={onSave}
                className={`w-full sm:flex-1 py-4 sm:py-3.5 rounded-2xl font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 brutal-btn active:scale-95 order-1 sm:order-2 ${isEditMode ? 'bg-neon-yellow' : 'bg-neon-pink'}`}
              >
                {isEditMode ? <><CheckCircle2 className="w-5 h-5" /> Save</> : <><ListPlus className="w-5 h-5" /> Add</>}
              </button>
            </div>
            {isEditMode && onDelete && (
              <button onClick={onDelete}
                className="w-full py-4 sm:py-3.5 bg-transparent text-[#ff4a4a] border-2 border-transparent hover:border-[#ff4a4a] hover:bg-[#ff4a4a]/10 rounded-2xl font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 active:scale-95"
              >
                <Trash2 className="w-5 h-5" /> Remove Game
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
