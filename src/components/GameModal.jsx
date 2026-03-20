import React from 'react';
import { ListPlus, CheckCircle2, Trash2 } from 'lucide-react';

export default function GameModal({ 
  gameData, 
  setGameData, 
  onSave, 
  onCancel, 
  onDelete,
  isEditMode 
}) {
  if (!gameData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-md transition-all">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl w-full max-w-md overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.1)] dark:shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-in fade-in zoom-in-95 duration-300">
        <div className="relative h-56 bg-slate-100 dark:bg-slate-800">
          <img 
            src={gameData.imageUrl} 
            alt={gameData.name}
            className="w-full h-full object-cover"
            onError={(e) => { e.target.src = `https://placehold.co/460x215/1e293b/4f46e5?text=${encodeURIComponent(gameData.name)}`; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 dark:from-slate-900 dark:via-slate-900/40 to-transparent"></div>
        </div>
        
        <div className="p-6 -mt-10 relative z-10 space-y-6">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight drop-shadow-md">{gameData.name}</h3>
          
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2.5 uppercase tracking-wider text-xs">Progress Category</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setGameData({...gameData, status: 'Wanted'})}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all duration-300 active:scale-95 ${
                    gameData.status === 'Wanted' 
                      ? 'bg-amber-100/80 border-amber-300 text-amber-700 dark:bg-amber-500/20 dark:border-amber-500/50 dark:text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.15)]' 
                      : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100 dark:bg-white/5 dark:border-white/5 dark:text-slate-400 dark:hover:bg-white/10'
                  }`}
                >Wanted to Play</button>
                <button
                  onClick={() => setGameData({...gameData, status: 'Played'})}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all duration-300 active:scale-95 ${
                    gameData.status === 'Played' 
                      ? 'bg-emerald-100/80 border-emerald-300 text-emerald-700 dark:bg-emerald-500/20 dark:border-emerald-500/50 dark:text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.15)]' 
                      : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100 dark:bg-white/5 dark:border-white/5 dark:text-slate-400 dark:hover:bg-white/10'
                  }`}
                >Already Played</button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2.5 uppercase tracking-wider text-xs">Game Mode</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setGameData({...gameData, mode: 'Singleplayer'})}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all duration-300 active:scale-95 ${
                    gameData.mode === 'Singleplayer' 
                      ? 'bg-indigo-100/80 border-indigo-300 text-indigo-700 dark:bg-indigo-500/20 dark:border-indigo-500/50 dark:text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.15)]' 
                      : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100 dark:bg-white/5 dark:border-white/5 dark:text-slate-400 dark:hover:bg-white/10'
                  }`}
                >Singleplayer</button>
                <button
                  onClick={() => setGameData({...gameData, mode: 'Multiplayer'})}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all duration-300 active:scale-95 ${
                    gameData.mode === 'Multiplayer' 
                      ? 'bg-cyan-100/80 border-cyan-300 text-cyan-700 dark:bg-cyan-500/20 dark:border-cyan-500/50 dark:text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.15)]' 
                      : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100 dark:bg-white/5 dark:border-white/5 dark:text-slate-400 dark:hover:bg-white/10'
                  }`}
                >Multiplayer</button>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-3">
            <div className="flex gap-3">
              <button 
                onClick={onCancel}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 dark:bg-white/5 dark:hover:bg-white/10 dark:border-white/5 dark:text-white rounded-xl font-medium transition-all duration-300 active:scale-95"
              >Cancel</button>
              <button 
                onClick={onSave}
                className={`flex-1 py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 active:scale-95 text-white ${
                  isEditMode ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 dark:from-emerald-600 dark:to-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)]' 
                             : 'bg-gradient-to-r from-indigo-500 to-indigo-400 hover:from-indigo-400 hover:to-indigo-300 dark:from-indigo-600 dark:to-indigo-500 shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(79,70,229,0.5)]'
                }`}
              >
                {isEditMode ? <><CheckCircle2 className="w-5 h-5" /> Save Changes</> : <><ListPlus className="w-5 h-5" /> Save Game</>}
              </button>
            </div>
            
            {isEditMode && onDelete && (
              <button
                onClick={onDelete}
                className="w-full py-3 mt-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 dark:bg-red-500/10 dark:hover:bg-red-500/20 dark:border-red-500/20 dark:text-red-400 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 active:scale-95"
              >
                <Trash2 className="w-5 h-5" /> Remove from my list
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
