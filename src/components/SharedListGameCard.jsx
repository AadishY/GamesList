import React, { useState } from 'react';
import { ThumbsUp, Pencil, Trash2, ArrowRightLeft, GripVertical, CheckCircle2 } from 'lucide-react';

export default function SharedListGameCard({ 
  game, 
  activeProfile, 
  setGames, 
  viewFilter, 
  draggable, 
  onDragStart, 
  onDragEnter, 
  onDragEnd 
}) {
  const [showMenu, setShowMenu] = useState(false);

  const shared = game.sharedList || {};
  const upvotes = shared.upvotes || [];
  const bothWanted = upvotes.length >= 2;
  const canVote = activeProfile !== 'Combined' && !upvotes.includes(activeProfile);
  const canEdit = activeProfile !== 'Combined';

  const handleVote = () => {
    if (!canVote) return;
    setGames(prev => prev.map(g => {
      if (g.id === game.id) {
        return {
          ...g,
          sharedList: { ...g.sharedList, upvotes: [...upvotes, activeProfile] }
        };
      }
      return g;
    }));
  };

  const toggleType = () => {
    const newType = shared.type === 'Main' ? 'Side' : 'Main';
    setGames(prev => prev.map(g => {
      if (g.id === game.id) {
        return { ...g, sharedList: { ...g.sharedList, type: newType } };
      }
      return g;
    }));
    setShowMenu(false);
  };

  const removeFromList = () => {
    setGames(prev => prev.map(g => {
      if (g.id === game.id) {
        const resetGame = { ...g };
        delete resetGame.sharedList;
        return resetGame;
      }
      return g;
    }));
  };

  return (
    <div 
      className={`relative flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-white/80 dark:bg-slate-900/60 backdrop-blur-sm border border-slate-200 dark:border-white/5 rounded-2xl shadow-sm hover:shadow-md transition-all group ${draggable ? 'cursor-grab active:cursor-grabbing hover:border-indigo-300 dark:hover:border-indigo-500/50' : ''}`}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnter={onDragEnter}
      onDragEnd={onDragEnd}
      onDragOver={(e) => e.preventDefault()}
    >
      {draggable && (
        <div className="text-slate-400 dark:text-slate-600 group-hover:text-indigo-400 transition-colors">
          <GripVertical className="w-5 h-5" />
        </div>
      )}

      {/* Image */}
      <img 
        src={game.imageUrl} 
        alt={game.name}
        className="w-20 h-14 sm:w-32 sm:h-20 object-cover rounded-xl shadow-sm select-none pointer-events-none"
        onError={(e) => { e.target.src = `https://placehold.co/460x215/1e293b/4f46e5?text=${encodeURIComponent(game.name)}`; }}
      />
      
      {/* Meta Info */}
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 truncate text-sm sm:text-lg leading-tight">
            {game.name}
          </h3>
          {bothWanted && (
            <span title="Both users want to play!" className="flex items-center text-xs text-orange-500 bg-orange-100 dark:bg-orange-500/10 dark:text-orange-400 px-1.5 py-0.5 rounded-md font-bold shrink-0">
               🔥 Both
            </span>
          )}
        </div>
        
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {viewFilter === 'All' && (
            <span className={`text-[10px] sm:text-xs px-2 py-0.5 rounded-md font-bold uppercase tracking-wider border ${
              shared.type === 'Main' 
                ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' 
                : 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-white/5 dark:text-slate-400 dark:border-white/10'
            }`}>
              {shared.type}
            </span>
          )}
          
          <span className={`text-[10px] sm:text-xs px-2 py-0.5 rounded-md font-medium border ${
            shared.addedBy === 'Aadish'
              ? 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20'
              : 'bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20'
          }`}>
            By {shared.addedBy}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 sm:gap-2 relative">
        {canVote && (
          <button 
            onClick={handleVote}
            className="p-2 bg-indigo-50 text-indigo-600 border border-indigo-200 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20 dark:hover:bg-indigo-500/20 rounded-lg sm:rounded-xl transition-all active:scale-95 group/vote"
            title="I want to play this too!"
          >
            <ThumbsUp className="w-4 h-4 sm:w-5 sm:h-5 sm:group-hover/vote:scale-110 transition-transform" />
          </button>
        )}
        
        {!canVote && upvotes.includes(activeProfile) && (
           <span className="p-2 text-indigo-400 opacity-60 dark:text-indigo-500" title="You upvoted this"><CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5"/></span>
        )}

        {canEdit && (
          <div className="relative">
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 text-slate-400 hover:text-slate-900 border border-transparent hover:border-slate-200 hover:bg-white dark:hover:text-white dark:hover:bg-white/5 dark:hover:border-white/10 rounded-lg sm:rounded-xl transition-all"
            >
              <Pencil className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            
            {showMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)}></div>
                <div className="absolute right-0 top-12 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  <div className="p-1">
                    <button 
                      onClick={toggleType}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5 rounded-lg transition-colors"
                    >
                      <ArrowRightLeft className="w-4 h-4 text-emerald-500" />
                      Move to {shared.type === 'Main' ? 'Side' : 'Main'}
                    </button>
                    <div className="h-px w-full bg-slate-100 dark:bg-white/5 my-1"></div>
                    <button 
                      onClick={removeFromList}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Remove from list
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
