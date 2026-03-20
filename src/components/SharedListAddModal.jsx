import React, { useState, useMemo } from 'react';
import { Search, X, Check, Gamepad2, Layers } from 'lucide-react';

export default function SharedListAddModal({ games, setGames, activeProfile, onClose }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGame, setSelectedGame] = useState(null);

  // Get games added by activeProfile that are NOT in the shared list
  const availableGames = useMemo(() => {
    return games.filter(g => 
      (g.addedBy || []).includes(activeProfile) && 
      !g.sharedList && 
      g.name.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => a.name.localeCompare(b.name));
  }, [games, activeProfile, searchTerm]);

  const confirmAdd = (type) => {
    if (!selectedGame) return;
    
    // Find the current max order for this type to append to bottom
    const existingTypeGames = games.filter(g => g.sharedList && g.sharedList.type === type);
    const maxOrder = existingTypeGames.reduce((max, g) => Math.max(max, g.sharedList.order || 0), -1);
    const newOrder = maxOrder + 1;

    setGames(prev => prev.map(g => {
      if (g.id === selectedGame.id) {
        return {
          ...g,
          sharedList: {
            type: type,
            order: newOrder,
            addedBy: activeProfile,
            upvotes: [activeProfile]
          }
        };
      }
      return g;
    }));
    
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-md transition-all">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-[2rem] w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-300 relative overflow-hidden transition-colors">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between z-10 bg-slate-50 dark:bg-slate-900 transition-colors">
          <div>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
              Add to Shared List
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Select a game from your {activeProfile} library
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-3 hover:bg-slate-200 bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white rounded-full transition-all active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        {selectedGame ? (
          <div className="flex-1 p-8 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900/50">
            <div className="relative w-full max-w-sm mb-8 rounded-2xl overflow-hidden shadow-xl border border-slate-200 dark:border-white/10">
               <img src={selectedGame.imageUrl} alt={selectedGame.name} className="w-full h-48 object-cover" />
               <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900 p-4">
                 <h4 className="text-xl font-bold text-white truncate">{selectedGame.name}</h4>
               </div>
            </div>
            
            <h4 className="flex items-center gap-2 text-lg font-bold text-slate-700 dark:text-slate-300 mb-6 uppercase tracking-wider">
              <Layers className="w-5 h-5 text-indigo-500" />
              Categorize as:
            </h4>
            
            <div className="flex w-full max-w-md gap-4">
              <button 
                onClick={() => confirmAdd('Main')}
                className="flex-1 py-4 bg-gradient-to-b from-indigo-50 to-indigo-100/50 hover:from-indigo-100 hover:to-indigo-200 dark:from-indigo-500/20 dark:to-indigo-500/10 dark:hover:from-indigo-500/30 dark:hover:to-indigo-500/20 border border-indigo-200 dark:border-indigo-500/30 rounded-2xl flex flex-col items-center gap-2 transition-all active:scale-95 shadow-sm text-indigo-700 dark:text-indigo-300 group"
              >
                <span className="font-bold text-xl group-hover:scale-110 transition-transform">Main</span>
                <span className="text-xs opacity-80 uppercase tracking-widest font-semibold">Priority</span>
              </button>
              <button 
                onClick={() => confirmAdd('Side')}
                className="flex-1 py-4 bg-gradient-to-b from-emerald-50 to-emerald-100/50 hover:from-emerald-100 hover:to-emerald-200 dark:from-emerald-500/20 dark:to-emerald-500/10 dark:hover:from-emerald-500/30 dark:hover:to-emerald-500/20 border border-emerald-200 dark:border-emerald-500/30 rounded-2xl flex flex-col items-center gap-2 transition-all active:scale-95 shadow-sm text-emerald-700 dark:text-emerald-300 group"
              >
                <span className="font-bold text-xl group-hover:scale-110 transition-transform">Side</span>
                <span className="text-xs opacity-80 uppercase tracking-widest font-semibold">Optional</span>
              </button>
            </div>
            
            <button 
              onClick={() => setSelectedGame(null)} 
              className="mt-8 text-sm font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 underline underline-offset-4 decoration-slate-300 dark:decoration-slate-700 transition-colors"
            >
              Back to selection
            </button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Search Bar */}
            <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-white/5 shrink-0 bg-white dark:bg-slate-900 transition-colors">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-colors" />
                <input
                  type="text"
                  placeholder="Search your library..."
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-white/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 dark:focus:ring-indigo-500 text-slate-800 dark:text-white placeholder-slate-400 transition-all shadow-inner"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoFocus
                />
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
              {availableGames.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 py-12">
                   <Gamepad2 className="w-12 h-12 mb-4 opacity-50" />
                   <p className="font-medium text-center max-w-xs leading-relaxed">
                     {searchTerm 
                       ? "No games match your search." 
                       : "You don't have any new games to add to the shared list."}
                   </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {availableGames.map(game => (
                    <button
                      key={game.id}
                      onClick={() => setSelectedGame(game)}
                      className="flex items-center gap-4 p-3 rounded-2xl border border-slate-200 hover:border-indigo-300 bg-white hover:bg-slate-50 dark:bg-white/5 dark:border-white/5 dark:hover:border-indigo-500/50 dark:hover:bg-white/10 transition-all text-left group active:scale-95"
                    >
                      <img 
                        src={game.imageUrl} 
                        alt={game.name}
                        className="w-16 h-12 sm:w-20 sm:h-14 object-cover rounded-xl shadow-sm"
                        onError={(e) => { e.target.src = `https://placehold.co/460x215/1e293b/4f46e5?text=${encodeURIComponent(game.name)}`; }}
                      />
                      <div className="flex-1 min-w-0 pr-2">
                        <h4 className="font-bold text-sm sm:text-base text-slate-800 dark:text-slate-200 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {game.name}
                        </h4>
                        <div className="text-[10px] sm:text-xs font-medium text-slate-500 mt-0.5 flex items-center gap-1.5 opacity-80 uppercase tracking-wider">
                           {game.mode}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
