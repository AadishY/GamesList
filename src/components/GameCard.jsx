import React from 'react';
import { ExternalLink, User, Users, ShieldAlert, Pencil } from 'lucide-react';

export default function GameCard({ game, activeProfile, setEditingGame, viewMode = 'grid' }) {
  const addedBy = game.addedBy || [];
  const isBoth = addedBy.length === 2;
  const hasAadish = addedBy.includes('Aadish');
  const hasAditya = addedBy.includes('Aditya');
  
  const isMyGame = activeProfile !== 'Combined' && addedBy.includes(activeProfile);

  const playerBadge = (size = 'normal') => {
    const cls = size === 'small' ? 'text-[9px] px-1.5 py-0.5' : 'text-[10px] px-3 py-1';
    return (isBoth || hasAadish || hasAditya) ? (
      <span className={`w-fit ${cls} font-bold uppercase tracking-wider rounded-lg backdrop-blur-md shadow-sm border ${
        isBoth ? 'bg-purple-500/20 text-purple-600 border-purple-500/30 dark:text-purple-300' :
        hasAadish ? 'bg-blue-500/20 text-blue-600 border-blue-500/30 dark:text-blue-300' :
        'bg-orange-500/20 text-orange-600 border-orange-500/30 dark:text-orange-300'
      }`}>
        {isBoth ? 'Both' : hasAadish ? 'Aadish' : 'Aditya'}
      </span>
    ) : null;
  };

  const statusBadge = (size = 'normal') => {
    const cls = size === 'small' ? 'text-[9px] px-1.5 py-0.5' : 'text-[10px] px-3 py-1';
    return (
      <span className={`w-fit ${cls} font-bold uppercase tracking-wider rounded-lg backdrop-blur-md shadow-sm border ${
        game.status === 'Played' 
          ? 'bg-emerald-500/20 text-emerald-600 border-emerald-500/30 dark:text-emerald-300' 
          : 'bg-amber-500/20 text-amber-600 border-amber-500/30 dark:text-amber-300'
      }`}>
        {game.status}
      </span>
    );
  };

  const modeBadge = (size = 'normal') => {
    const cls = size === 'small' ? 'text-[9px]' : 'text-xs';
    return (
      <div className={`flex items-center gap-1.5 ${cls} font-semibold text-slate-600 dark:text-slate-400`}>
        {game.mode === 'Multiplayer' 
          ? <><Users className="w-3 h-3 text-cyan-500 dark:text-cyan-400" /> <span className="hidden sm:inline">Multi</span></>
          : <><User className="w-3 h-3 text-indigo-500 dark:text-indigo-400" /> <span className="hidden sm:inline">Single</span></>
        }
      </div>
    );
  };

  const editButton = (compact = false) => {
    if (activeProfile === 'Combined') {
      return (
        <div className={`flex items-center justify-center gap-1.5 ${compact ? 'py-1.5 px-2 text-[10px]' : 'py-2.5 w-full text-xs'} rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-slate-500 font-semibold uppercase tracking-wider transition-colors`}>
          <ShieldAlert className="w-3 h-3" /> <span className="hidden sm:inline">Read Only</span>
        </div>
      );
    }
    if (isMyGame) {
      return (
        <button
          onClick={() => setEditingGame(game)}
          className={`flex items-center justify-center gap-1.5 ${compact ? 'py-1.5 px-2 text-[10px]' : 'flex-1 py-2.5 px-3 text-sm'} rounded-xl font-semibold transition-all bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 border border-slate-200 hover:border-slate-300 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10 dark:border-white/5 dark:hover:border-white/10 active:scale-95`}
        >
          <Pencil className="w-3.5 h-3.5" /> Edit
        </button>
      );
    }
    return (
      <div className={`flex items-center justify-center gap-1.5 ${compact ? 'py-1.5 px-2 text-[10px]' : 'py-2.5 w-full text-xs'} rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-slate-500 font-semibold uppercase tracking-wider transition-colors`}>
        <ShieldAlert className="w-3 h-3" /> <span className="hidden sm:inline">View Only</span>
      </div>
    );
  };

  // ===================== TABLE VIEW =====================
  if (viewMode === 'table') {
    return (
      <div className="group flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-white/80 dark:bg-slate-900/60 backdrop-blur-sm border border-slate-200 dark:border-white/5 rounded-2xl shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-500/30 transition-all animate-in fade-in">
        <img 
          src={game.imageUrl} 
          alt={game.name}
          className="w-20 h-14 sm:w-28 sm:h-[4.5rem] object-cover rounded-xl shadow-sm select-none flex-shrink-0"
          onError={(e) => { e.target.src = `https://placehold.co/460x215/0f172a/4f46e5?text=${encodeURIComponent(game.name)}`; }}
        />
        
        <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm sm:text-base text-slate-800 dark:text-white/90 truncate leading-tight" title={game.name}>
              {game.name}
            </h3>
            <div className="flex items-center gap-1.5 mt-1">
              {statusBadge('small')}
              {playerBadge('small')}
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {modeBadge('small')}
            <a 
              href={game.steamUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 bg-slate-100 dark:bg-white/5 p-1.5 rounded-lg transition-colors flex-shrink-0 active:scale-95"
              title="Open in Steam"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            {editButton(true)}
          </div>
        </div>
      </div>
    );
  }

  // ===================== COMPACT VIEW =====================
  if (viewMode === 'compact') {
    return (
      <div className="group flex flex-col bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl overflow-hidden border border-slate-200 dark:border-white/5 hover:border-indigo-400 dark:hover:border-indigo-500/30 shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 animate-in fade-in">
        <div className="relative aspect-[460/215] bg-slate-200 dark:bg-slate-950 overflow-hidden">
          <img 
            src={game.imageUrl} 
            alt={game.name}
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
            onError={(e) => { e.target.src = `https://placehold.co/460x215/0f172a/4f46e5?text=${encodeURIComponent(game.name)}`; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-slate-900 via-transparent to-transparent opacity-80 transition-colors"></div>
          <div className="absolute top-2 left-2 flex gap-1">
            {statusBadge('small')}
            {playerBadge('small')}
          </div>
        </div>
        <div className="p-3 flex flex-col flex-1">
          <div className="flex justify-between items-start gap-2 mb-2">
            <h3 className="font-bold text-xs sm:text-sm leading-tight line-clamp-1 text-slate-800 dark:text-white/90" title={game.name}>
              {game.name}
            </h3>
            <a 
              href={game.steamUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 bg-slate-100 dark:bg-white/5 p-1 rounded-lg transition-colors flex-shrink-0"
              title="Open in Steam"
            >
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <div className="mt-auto flex items-center justify-between gap-2 pt-2 border-t border-slate-200 dark:border-white/5">
            {modeBadge('small')}
            {editButton(true)}
          </div>
        </div>
      </div>
    );
  }

  // ===================== DEFAULT GRID VIEW =====================
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
          {statusBadge()}
          {playerBadge()}
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
            {editButton(false)}
          </div>
          
        </div>
      </div>
    </div>
  );
}
