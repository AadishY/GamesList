import React, { useState, useCallback } from 'react';
import { ThumbsUp, Pencil, Trash2, ArrowRightLeft, GripVertical, CheckCircle2, ExternalLink } from 'lucide-react';

const SharedListGameCard = React.memo(({ 
  game, index = 0, activeProfile, updateFirebaseGame, viewFilter, draggable, onDragStart, onDragEnter, onDragEnd 
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const shared = game.sharedList || {};
  const upvotes = shared.upvotes || [];
  const bothWanted = upvotes.length >= 2;
  const isMyGame = shared.addedBy === activeProfile;
  const haveIVoted = upvotes.includes(activeProfile);
  const canVote = activeProfile !== 'Combined' && !isMyGame && !haveIVoted;
  const canEdit = activeProfile !== 'Combined';

  const staggerDelay = Math.min((index % 15) * 35, 500);

  const handleImgLoad = useCallback(() => setImgLoaded(true), []);
  const handleImgError = useCallback((e) => {
    e.target.src = `https://placehold.co/460x215/1a1a1a/8b5cf6?text=${encodeURIComponent(game.name)}`;
  }, [game.name]);

  const handleVote = () => {
    if (!canVote) return;
    updateFirebaseGame(game.id, (g) => ({ ...g, sharedList: { ...g.sharedList, upvotes: [...upvotes, activeProfile] } }));
  };

  const removeVote = () => {
    updateFirebaseGame(game.id, (g) => ({ ...g, sharedList: { ...g.sharedList, upvotes: upvotes.filter(p => p !== activeProfile) } }));
    setShowMenu(false);
  };

  const toggleType = () => {
    const newType = shared.type === 'Main' ? 'Side' : 'Main';
    updateFirebaseGame(game.id, (g) => ({ ...g, sharedList: { ...g.sharedList, type: newType } }));
    setShowMenu(false);
  };

  const removeFromList = () => {
    updateFirebaseGame(game.id, (g) => { const r = { ...g }; delete r.sharedList; return r; });
  };

  return (
    <div 
      className={`relative flex items-center gap-3 sm:gap-4 p-3 sm:p-5 glass-panel-flat hover:-translate-y-1 hover:shadow-brutal transition-[transform,box-shadow] group overflow-visible animate-stagger-enter ${draggable ? 'cursor-grab active:cursor-grabbing' : ''}`}
      draggable={draggable} onDragStart={onDragStart} onDragEnter={onDragEnter} onDragEnd={onDragEnd} onDragOver={(e) => e.preventDefault()}
      style={{ animationDelay: `${staggerDelay}ms` }}
    >
      {draggable && <div className="text-black/50 dark:text-white/20 group-hover:text-neon-pink transition-colors pl-1 cursor-grab"><GripVertical className="w-7 h-7" /></div>}

      <div className="relative w-20 h-14 sm:w-32 sm:h-20 flex-shrink-0 border-2 border-black/20 dark:border-white/20 rounded-xl overflow-hidden">
        {!imgLoaded && (
          <div className="absolute inset-0 bg-black/10 dark:bg-white/10 animate-shimmer"></div>
        )}
        <img 
          src={game.imageUrl} alt={game.name}
          loading="lazy" decoding="async"
          onLoad={handleImgLoad}
          className={`w-full h-full object-cover transition-opacity duration-300 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
          onError={handleImgError}
        />
      </div>
      
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="font-black truncate text-base sm:text-lg leading-tight uppercase tracking-tight" title={game.name}>{game.name}</h3>
          {bothWanted && (
            <span className="hidden sm:flex items-center text-[9px] bg-neon-purple text-black px-2 py-1 rounded-md font-black uppercase shrink-0 border-2 border-black">
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
        <a href={game.steamUrl} target="_blank" rel="noopener noreferrer"
          className="bg-black/5 dark:bg-white/10 text-black dark:text-white hover:bg-neon-pink dark:hover:bg-neon-pink hover:text-black p-2.5 sm:p-3 rounded-xl border-2 border-transparent hover:border-black transition-colors flex-shrink-0 active:scale-95"
          title="Open in Steam">
            <ExternalLink className="w-5 h-5" />
        </a>

        {canVote && (
          <button onClick={handleVote}
            className="p-2.5 sm:p-3 bg-neon-yellow brutal-btn rounded-xl transition-[transform,box-shadow] flex items-center justify-center active:scale-90"
            title="I want this too!"
          ><ThumbsUp className="w-5 h-5 sm:w-5 sm:h-5 text-black" /></button>
        )}
        {!canVote && !isMyGame && haveIVoted && (
           <div className="p-2.5 sm:p-3 bg-white/20 dark:bg-black/20 rounded-xl border-2 border-transparent"><CheckCircle2 className="w-5 h-5 sm:w-5 sm:h-5 text-neon-green opacity-80"/></div>
        )}

        {canEdit && (
          <div className="relative z-20">
            <button onClick={() => setShowMenu(!showMenu)}
              className="p-2.5 sm:p-3 bg-white hover:bg-black text-black hover:text-white dark:bg-black dark:hover:bg-white dark:text-white dark:hover:text-black border-2 border-black dark:border-white rounded-xl transition-[background-color,color,transform,box-shadow] shadow-sm hover:-translate-y-1 hover:shadow-brutal-sm active:scale-95"
            ><Pencil className="w-5 h-5 sm:w-5 sm:h-5" /></button>
            
            {showMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)}></div>
                <div className="absolute right-0 bottom-full mb-3 w-56 glass-panel border-2 border-black dark:border-white/20 rounded-2xl shadow-brutal-lg z-30 overflow-hidden animate-scale-spring">
                  <div className="p-2 space-y-1">
                    <button onClick={toggleType}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-extrabold uppercase tracking-widest bg-white dark:bg-black/50 hover:bg-neon-green dark:hover:bg-neon-green hover:text-black rounded-xl transition-colors border-2 border-transparent hover:border-black active:scale-95"
                    ><ArrowRightLeft className="w-5 h-5" /> Move To {shared.type === 'Main' ? 'Side' : 'Main'}</button>
                    {haveIVoted && !isMyGame && (
                      <>
                        <div className="h-0.5 w-full bg-black/10 dark:bg-white/10 rounded-full my-1"></div>
                        <button onClick={removeVote}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-extrabold uppercase tracking-widest text-[#ff4a4a] hover:bg-[#ff4a4a] hover:text-black rounded-xl transition-colors border-2 border-transparent hover:border-black active:scale-95"
                        ><ThumbsUp className="w-5 h-5 rotate-180" /> Remove Like</button>
                      </>
                    )}
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
