import { useState, useMemo } from 'react';
import { Search, X, CheckCircle2 } from 'lucide-react';

export default function SharedListAddModal({ games, updateFirebaseGame, activeProfile, onClose }) {
  const [search, setSearch] = useState('');
  
  const myGames = useMemo(() => {
    return games.filter(g => (g.addedBy || []).includes(activeProfile));
  }, [games, activeProfile]);

  const filteredGames = useMemo(() => {
    return myGames.filter(g => !g.sharedList && g.name.toLowerCase().includes(search.toLowerCase()));
  }, [myGames, search]);

  const addGame = (game, type) => {
    updateFirebaseGame(game.id, (g) => ({
      ...g, sharedList: { type, addedBy: activeProfile, upvotes: [activeProfile] }
    }));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 dark:bg-black/80 backdrop-blur-xl">
      <div className="glass-panel w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        <div className="p-5 sm:p-6 bg-black/5 dark:bg-white/5 border-b-2 border-black/10 dark:border-white/10 flex justify-between items-center shrink-0">
          <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tighter">Add to Shared List</h2>
          <button onClick={onClose} className="p-2 border-2 border-transparent hover:border-black/20 dark:hover:border-white/20 rounded-xl transition-colors hover:bg-black/5 dark:hover:bg-white/5 text-black/50 hover:text-black dark:text-white/50 dark:hover:text-white active:scale-95">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4 sm:p-6 pb-2 shrink-0 border-b-2 border-black/5 dark:border-white/5">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black/70 dark:text-white/40" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="SEARCH YOUR GAMES..."
              className="w-full bg-white/50 dark:bg-black/80 border-2 border-black/10 dark:border-white/20 rounded-2xl pl-12 pr-4 py-4 sm:py-3 text-base sm:text-lg font-black outline-none focus:border-black dark:focus:border-white focus:bg-white focus:shadow-brutal transition-all placeholder-black/60 dark:placeholder-white/30"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 sm:space-y-4">
          {filteredGames.length === 0 ? (
            <div className="text-center py-10 opacity-50">
              <p className="font-extrabold uppercase tracking-widest text-sm">No match found</p>
            </div>
          ) : (
            filteredGames.map(game => {
              const inList = !!game.sharedList;
              return (
                <div key={game.id} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 bg-black/5 dark:bg-white/5 border-2 border-black/10 dark:border-white/10 rounded-2xl hover:border-black/20 dark:hover:border-white/30 transition-colors group">
                  <img src={game.imageUrl} alt={game.name}
                    className="w-16 h-12 sm:w-20 sm:h-14 object-cover rounded-lg border-2 border-black/20 dark:border-white/20 shrink-0"
                    onError={(e) => { e.target.src = `https://placehold.co/460x215/1a1a1a/8b5cf6?text=${encodeURIComponent(game.name)}`; }}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-sm sm:text-base truncate tracking-tight uppercase">{game.name}</h3>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {inList ? (
                       <div className="flex items-center gap-1.5 px-4 py-3 bg-neon-green/20 dark:bg-neon-green/10 border-2 border-neon-green/30 text-neon-green rounded-xl font-bold uppercase tracking-widest text-[10px] w-full sm:w-auto justify-center">
                         <CheckCircle2 className="w-4 h-4" /> Added
                       </div>
                    ) : (
                      <div className="flex gap-2 w-full sm:w-auto">
                        <button onClick={() => addGame(game, 'Main')}
                          className="flex-1 sm:flex-none py-3 px-4 bg-neon-cyan brutal-btn rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95"
                        >Add to Main</button>
                        <button onClick={() => addGame(game, 'Side')}
                          className="flex-1 sm:flex-none py-3 px-4 bg-neon-purple brutal-btn rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95"
                        >Add to Side</button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
