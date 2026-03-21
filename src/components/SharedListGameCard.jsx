import React, { useState } from 'react';
import { ThumbsUp, Pencil, Trash2, ArrowRightLeft, GripVertical, CheckCircle2, ExternalLink } from 'lucide-react';

const SharedListGameCard = React.memo(({ 
  game, activeProfile, setGames, viewFilter, draggable, onDragStart, onDragEnter, onDragEnd 
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const shared = game.sharedList || {};
  const upvotes = shared.upvotes || [];
  const bothWanted = upvotes.length >= 2;
  const canVote = activeProfile !== 'Combined' && !upvotes.includes(activeProfile);
  const canEdit = activeProfile !== 'Combined';

  const handleVote = () => {
    if (!canVote) return;
    setGames(prev => prev.map(g => g.id === game.id ? { ...g, sharedList: { ...g.sharedList, upvotes: [...upvotes, activeProfile] } } : g));
  };

  const toggleType = () => {
    const newType = shared.type === 'Main' ? 'Side' : 'Main';
    setGames(prev => prev.map(g => g.id === game.id ? { ...g, sharedList: { ...g.sharedList, type: newType } } : g));
    setShowMenu(false);
  };

  const removeFromList = () => {
    setGames(prev => prev.map(g => { if (g.id === game.id) { const r = { ...g }; delete r.sharedList; return r; } return g; }));
  };

  return (
    <div 
      className={`relative flex items-center gap-3 sm:gap-4 p-3 sm:p-5 glass-panel-flat hover:-translate-y-1 hover:shadow-brutal transition-all group overflow-visible ${draggable ? 'cursor-grab active:cursor-grabbing' : ''}`}
      draggable={draggable} onDragStart={onDragStart} onDragEnter={onDragEnter} onDragEnd={onDragEnd} onDragOver={(e) => e.preventDefault()}
    >
      {draggable && <div className="text-black/20 dark:text-white/20 group-hover:text-neon-pink transition-colors pl-1 cursor-grab"><GripVertical className="w-7 h-7" /></div>}

      <div className="relative w-20 h-14 sm:w-32 sm:h-20 flex-shrink-0 border-2 border-black/20 dark:border-white/20 rounded-xl overflow-hidden">
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
      </div>
      
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="font-extrabold truncate text-base sm:text-lg leading-tight uppercase tracking-tight" title={game.name}>{game.name}</h3>
          {bothWanted && (
            <span className="hidden sm:flex items-center text-[9px] bg-neon-purple text-black px-2 py-1 rounded-md font-extrabold uppercase shrink-0 border-2 border-black">
               🔥 Both Wants
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {viewFilter === 'All' && (
            <span className={`text-[9px] px-2 py-1 rounded-md font-black uppercase tracking-[0.1em] flex items-center border-2 border-black ${
              shared.type === 'Main' ? 'bg-neon-green text-black' : 'bg-white text-black dark:bg-[#333] dark:text-white'
            }`}>{shared.type}</span>
          )}
          <span className={`text-[9px] px-2 py-1 rounded-md font-black uppercase tracking-[0.1em] flex items-center border-2 border-black ${
            shared.addedBy === 'Aadish' ? 'bg-neon-cyan text-black' : 'bg-neon-orange text-black'
          }`}>By {shared.addedBy}</span>
           {bothWanted && (
            <span className="sm:hidden flex items-center text-[9px] bg-neon-purple text-black px-1.5 py-0.5 rounded-md font-black uppercase shrink-0 border-2 border-black shadow-[2px_2px_0px_#fff]">
               🔥 Both
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 pr-1">
        {game.steamUrl && (
          <a href={game.steamUrl} target="_blank" rel="noopener noreferrer"
            className="p-3 sm:p-4 bg-black/10 dark:bg-white/10 rounded-xl border-2 border-transparent hover:border-black dark:hover:border-white transition-all flex items-center justify-center"
            title="Open Steam link"
          ><ExternalLink className="w-5 h-5 sm:w-6 sm:h-6" /></a>
        )}
        {canVote && (
          <button onClick={handleVote}
            className="p-3 sm:p-4 bg-neon-yellow brutal-btn rounded-xl transition-all flex items-center justify-center active:scale-90"
            title="I want this too!"
          ><ThumbsUp className="w-5 h-5 sm:w-6 sm:h-6 text-black" /></button>
        )}
        {!canVote && upvotes.includes(activeProfile) && (
           <div className="p-3 sm:p-4 bg-white/20 dark:bg-black/20 rounded-xl border-2 border-transparent"><CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-neon-green opacity-80"/></div>
        )}

        {canEdit && (
          <div className="relative z-20">
            <button onClick={() => setShowMenu(!showMenu)}
              className="p-3 sm:p-4 bg-white hover:bg-black text-black hover:text-white dark:bg-black dark:hover:bg-white dark:text-white dark:hover:text-black border-2 border-black dark:border-white rounded-xl transition-all shadow-sm hover:-translate-y-1 hover:shadow-brutal-sm active:scale-95"
            ><Pencil className="w-5 h-5 sm:w-6 sm:h-6" /></button>
            
            {showMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)}></div>
                <div className="absolute right-0 bottom-full mb-3 w-56 glass-panel border-2 border-black dark:border-white/20 rounded-2xl shadow-brutal-lg z-30 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  <div className="p-2 space-y-1">
                    <button onClick={toggleType}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-extrabold uppercase tracking-widest bg-white dark:bg-black/50 hover:bg-neon-green dark:hover:bg-neon-green hover:text-black rounded-xl transition-colors border-2 border-transparent hover:border-black active:scale-95"
                    ><ArrowRightLeft className="w-5 h-5" /> Move To {shared.type === 'Main' ? 'Side' : 'Main'}</button>
                    <div className="h-0.5 w-full bg-black/10 dark:bg-white/10 rounded-full my-1"></div>
                    <button onClick={removeFromList}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-extrabold uppercase tracking-widest text-[#ff4a4a] hover:bg-[#ff4a4a] hover:text-black rounded-xl transition-colors border-2 border-transparent hover:border-black active:scale-95"
                    ><Trash2 className="w-5 h-5" /> Remove Game</button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

export default SharedListGameCard;
