import React from 'react';
import { ExternalLink, User, Users, ShieldAlert, Pencil } from 'lucide-react';

export default function GameCard({ game, activeProfile, setEditingGame }) {
  const addedBy = game.addedBy || [];
  const isBoth = addedBy.length === 2;
  const hasAadish = addedBy.includes('Aadish');
  const hasAditya = addedBy.includes('Aditya');
  
  const isMyGame = activeProfile !== 'Combined' && addedBy.includes(activeProfile);

  return (
    <div 
      className="group flex flex-col bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-[1.25rem] overflow-hidden border border-slate-200 dark:border-white/5 hover:border-indigo-400 dark:hover:border-indigo-500/30 shadow-lg hover:shadow-[0_10px_30px_rgba(79,70,229,0.15)] hover:-translate-y-1 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
    >
      <div className="relative aspect-[460/215] bg-slate-200 dark:bg-slate-950 overflow-hidden">
        <img 
          src={game.imageUrl} 
          alt={game.name}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
          onError={(e) => { e.target.src = `https://placehold.co/460x215/0f172a/4f46e5?text=${encodeURIComponent(game.name)}`; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-slate-900 via-transparent to-transparent opacity-80 transition-colors"></div>
        
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          <span className={`w-fit px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg backdrop-blur-md shadow-sm border ${
            game.status === 'Played' 
              ? 'bg-emerald-500/20 text-emerald-600 border-emerald-500/30 dark:text-emerald-300' 
              : 'bg-amber-500/20 text-amber-600 border-amber-500/30 dark:text-amber-300'
          }`}>
            {game.status}
          </span>
          {(isBoth || hasAadish || hasAditya) && (
            <span className={`w-fit px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg backdrop-blur-md shadow-sm border ${
              isBoth ? 'bg-purple-500/20 text-purple-600 border-purple-500/30 dark:text-purple-300' :
              hasAadish ? 'bg-blue-500/20 text-blue-600 border-blue-500/30 dark:text-blue-300' :
              'bg-orange-500/20 text-orange-600 border-orange-500/30 dark:text-orange-300'
            }`}>
              {isBoth ? 'Both Wanted' : hasAadish ? 'Aadish' : 'Aditya'}
            </span>
          )}
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex justify-between items-start gap-3 mb-3">
          <h3 className="font-bold text-lg leading-tight line-clamp-2 text-slate-800 dark:text-white/90 group-hover:text-black dark:group-hover:text-white transition-colors" title={game.name}>
            {game.name}
          </h3>
          <a 
            href={game.steamUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-slate-500 hover:text-indigo-500 dark:hover:text-indigo-400 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 p-2 rounded-xl transition-colors flex-shrink-0 active:scale-95"
            title="Open in Steam"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        <div className="mt-auto pt-5 space-y-3">
          
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-black/20 w-fit px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/5 transition-colors">
            {game.mode === 'Multiplayer' 
              ? <><Users className="w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400" /> Multiplayer</>
              : <><User className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" /> Singleplayer</>
            }
          </div>

          <div className="flex items-center gap-2 pt-3 border-t border-slate-200 dark:border-white/5 transition-colors">
            {activeProfile === 'Combined' ? (
              <div className="flex items-center justify-center gap-1.5 py-2.5 w-full rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-slate-500 text-xs font-semibold uppercase tracking-wider transition-colors">
                <ShieldAlert className="w-3.5 h-3.5" /> Read Only View
              </div>
            ) : isMyGame ? (
              <button
                onClick={() => setEditingGame(game)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-semibold transition-all bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 border border-slate-200 hover:border-slate-300 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10 dark:border-white/5 dark:hover:border-white/10 active:scale-95"
              >
                <Pencil className="w-4 h-4" /> Edit Details
              </button>
            ) : (
               <div className="flex items-center justify-center gap-1.5 py-2.5 w-full rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-slate-500 text-xs font-semibold uppercase tracking-wider transition-colors">
                 <ShieldAlert className="w-3.5 h-3.5" /> View Only
               </div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}
