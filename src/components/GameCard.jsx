import React, { useState } from 'react';
import { ExternalLink, User, Users, ShieldAlert, Pencil } from 'lucide-react';

const GameCard = React.memo(({ game, activeProfile, setEditingGame, viewMode = 'grid' }) => {
  const [imgLoaded, setImgLoaded] = useState(false);
  const addedBy = game.addedBy || [];
  const isBoth = addedBy.length === 2;
  const hasAadish = addedBy.includes('Aadish');
  const hasAditya = addedBy.includes('Aditya');
  const isMyGame = activeProfile !== 'Combined' && addedBy.includes(activeProfile);

  const playerBadge = (sm = false) => {
    const cls = sm ? 'text-[9px] px-1.5 py-0.5' : 'text-[10px] px-2 py-1';
    return (isBoth || hasAadish || hasAditya) ? (
      <span className={`w-fit ${cls} font-black uppercase tracking-[0.1em] rounded-md border-2 border-black shadow-none transition-all ${
        isBoth ? 'bg-neon-purple text-black' : hasAadish ? 'bg-neon-cyan text-black' : 'bg-neon-orange text-black'
      }`}>
        {isBoth ? 'Both' : hasAadish ? 'Aadish' : 'Aditya'}
      </span>
    ) : null;
  };

  const statusBadge = (sm = false) => {
    const cls = sm ? 'text-[9px] px-1.5 py-0.5' : 'text-[10px] px-2 py-1';
    return (
      <span className={`w-fit ${cls} font-black uppercase tracking-[0.1em] rounded-md border-2 border-black shadow-none transition-all ${
        game.status === 'Played' ? 'bg-neon-green text-black' : 'bg-neon-yellow text-black'
      }`}>
        {game.status}
      </span>
    );
  };

  const modeBadge = (sm = false) => {
    const cls = sm ? 'text-[9px]' : 'text-xs';
    return (
      <div className={`flex items-center gap-1.5 ${cls} font-extrabold uppercase tracking-widest text-black/60 dark:text-white/60`}>
        {game.mode === 'Multiplayer' 
          ? <><div className="bg-neon-cyan p-1 sm:p-1.5 border-2 border-black dark:border-white/20 rounded-md"><Users className="w-3 h-3 text-black" /></div> <span className="hidden sm:inline">Mutli</span></>
          : <><div className="bg-neon-purple p-1 sm:p-1.5 border-2 border-black dark:border-white/20 rounded-md"><User className="w-3 h-3 text-black" /></div> <span className="hidden sm:inline">Single</span></>
        }
      </div>
    );
  };

  const editBtn = (compact = false) => {
    if (activeProfile === 'Combined') {
      return (
        <div className={`flex items-center justify-center gap-1.5 ${compact ? 'py-1.5 px-3 text-[9px]' : 'py-3.5 w-full text-xs'} rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 font-bold uppercase tracking-widest text-black/40 dark:text-white/40`}>
          <ShieldAlert className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Read Only</span>
        </div>
      );
    }
    if (isMyGame) {
      return (
        <button onClick={() => setEditingGame(game)}
          className={`flex items-center justify-center gap-2 ${compact ? 'py-1.5 px-4 text-[10px]' : 'flex-1 py-3 px-4 text-sm'} bg-[#ff4a4a] text-black border-2 border-black brutal-btn rounded-xl uppercase tracking-widest`}
        >
          <Pencil className="w-4 h-4" /> Edit
        </button>
      );
    }
    return (
      <div className={`flex items-center justify-center gap-1.5 ${compact ? 'py-1.5 px-3 text-[9px]' : 'py-3.5 w-full text-xs'} rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 font-bold uppercase tracking-widest text-black/40 dark:text-white/40`}>
        <ShieldAlert className="w-3.5 h-3.5" /> <span className="hidden sm:inline">View Only</span>
      </div>
    );
  };

  // ── TABLE VIEW ──
  if (viewMode === 'table') {
    return (
      <div className="group flex items-center gap-4 p-3 glass-panel-flat hover:shadow-brutal transition-all duration-200">
        <div className="relative w-24 h-16 sm:w-32 sm:h-20 flex-shrink-0 border-2 border-black/20 dark:border-white/20 rounded-xl overflow-hidden">
          {!imgLoaded && (
            <div className="absolute inset-0 block animate-pulse bg-black/10 dark:bg-white/10"></div>
          )}
          <img 
            src={game.imageUrl} alt={game.name}
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
            className={`w-full h-full object-cover transition-opacity duration-300 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
            onError={(e) => { e.target.src = `https://placehold.co/460x215/1a1a1a/8b5cf6?text=${encodeURIComponent(game.name)}`; }}
          />
        </div>
        <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-extrabold text-sm sm:text-base truncate uppercase tracking-tight" title={game.name}>{game.name}</h3>
            <div className="flex items-center gap-1.5 mt-1.5">{statusBadge(true)}{playerBadge(true)}</div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0 mt-2 sm:mt-0">
            {modeBadge(true)}
            <a href={game.steamUrl} target="_blank" rel="noopener noreferrer"
              className="bg-black/5 dark:bg-white/10 text-black dark:text-white hover:bg-neon-pink dark:hover:bg-neon-pink hover:text-black p-2 rounded-lg border-2 border-transparent hover:border-black transition-colors flex-shrink-0"
              title="Steam"><ExternalLink className="w-4 h-4" /></a>
            {editBtn(true)}
          </div>
        </div>
      </div>
    );
  }

  // ── COMPACT VIEW ──
  if (viewMode === 'compact') {
    return (
      <div className="group flex flex-col glass-panel-flat overflow-hidden hover:shadow-brutal transition-all duration-200">
        <div className="relative aspect-[460/215] bg-black/5 dark:bg-white/5 border-b-2 border-black/10 dark:border-white/10 overflow-hidden">
          {!imgLoaded && (
            <div className="absolute inset-0 block animate-pulse bg-black/10 dark:bg-white/10"></div>
          )}
          <img 
            src={game.imageUrl} alt={game.name} 
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
            className={`w-full h-full object-cover transition-opacity duration-300 ${imgLoaded ? 'opacity-90 group-hover:opacity-100' : 'opacity-0'}`}
            onError={(e) => { e.target.src = `https://placehold.co/460x215/1a1a1a/8b5cf6?text=${encodeURIComponent(game.name)}`; }}
          />
          <div className="absolute top-2 left-2 flex gap-1">{statusBadge(true)}{playerBadge(true)}</div>
        </div>
        <div className="p-3 sm:p-4 flex flex-col flex-1">
          <div className="flex justify-between items-start gap-2 mb-3">
            <h3 className="font-extrabold text-xs sm:text-sm leading-tight line-clamp-1 uppercase tracking-tight" title={game.name}>{game.name}</h3>
            <a href={game.steamUrl} target="_blank" rel="noopener noreferrer"
              className="text-black/40 dark:text-white/40 hover:text-neon-pink dark:hover:text-neon-pink p-1 rounded-md transition-colors flex-shrink-0"
              title="Steam"><ExternalLink className="w-4 h-4" /></a>
          </div>
          <div className="mt-auto flex items-center justify-between gap-2 pt-2 border-t border-black/5 dark:border-white/5">
            {modeBadge(true)}
            {editBtn(true)}
          </div>
        </div>
      </div>
    );
  }

  // ── DEFAULT GRID VIEW ──
  return (
    <div className="group flex flex-col glass-panel overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-brutal-lg animate-in fade-in slide-in-from-bottom-2">
      <div className="relative aspect-[460/215] bg-black/5 dark:bg-white/5 overflow-hidden border-b-2 border-black/10 dark:border-white/10 rounded-t-[calc(1.5rem-2px)]">
        {!imgLoaded && (
          <div className="absolute inset-0 block animate-pulse bg-black/10 dark:bg-white/10"></div>
        )}
        <img 
          src={game.imageUrl} alt={game.name} 
          loading="lazy"
          onLoad={() => setImgLoaded(true)}
          className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-500 ease-out ${imgLoaded ? 'opacity-90 group-hover:opacity-100' : 'opacity-0'}`}
          onError={(e) => { e.target.src = `https://placehold.co/460x215/1a1a1a/8b5cf6?text=${encodeURIComponent(game.name)}`; }}
        />
        {/* Bottom fading gradient for image integration */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white/20 dark:from-black/50 to-transparent"></div>

        <div className="absolute top-3 left-3 flex flex-col gap-1.5">{statusBadge()}{playerBadge()}</div>
        
        {/* Steam overlay button */}
        <div className="absolute top-3 right-3 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
          <a href={game.steamUrl} target="_blank" rel="noopener noreferrer"
            className="bg-black text-white px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 border border-white/20 hover:bg-neon-yellow hover:text-black transition-colors"
            title="Open in Steam">Steam <ExternalLink className="w-3 h-3" /></a>
        </div>
      </div>

      <div className="p-5 sm:p-6 flex flex-col flex-1">
        <h3 className="font-extrabold text-lg sm:text-xl leading-tight line-clamp-2 uppercase tracking-tighter mb-5" title={game.name}>
          {game.name}
        </h3>

        <div className="mt-auto space-y-4">
          <div className="font-bold flex items-center">
            {modeBadge()}
          </div>
          <div className="pt-4 border-t-2 border-black/5 dark:border-white/10">
            {editBtn()}
          </div>
        </div>
      </div>
    </div>
  );
});

export default GameCard;
