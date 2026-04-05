import { useState, useMemo } from 'react';
import { ArrowLeft, Box, Plus, Settings, Trash2, Search, Settings2 } from 'lucide-react';
import ModGameView from './ModGameView'; 
import ModsGameAddModal from './ModsGameAddModal'; 
import DeleteWarningModal from './DeleteWarningModal';

export default function ModsList({ games, activeProfile, goBack, mods, updateFirebaseMod, addFirebaseMod, deleteFirebaseMod, theme }) {
  const [selectedGame, setSelectedGame] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [gameToDelete, setGameToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter mods list to only show ones added by the active profile
  const profileModsEntries = useMemo(() => {
    return mods.filter(m => m.addedBy === activeProfile)
               .filter(m => m.gameName.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [mods, activeProfile, searchQuery]);

  // Use the latest version of the selected game from the active mods feed
  const activeSelectedGame = useMemo(() => {
    if (!selectedGame) return null;
    return mods.find(m => m.id === selectedGame.id) || selectedGame;
  }, [mods, selectedGame]);

  const badgeUrl = `https://aadishcounter.vercel.app/@mod?theme=random-animation&padding=7&count=${profileModsEntries.length || 0}&crop=true&darkmode=${theme === 'dark' ? 1 : 0}`;

  if (activeProfile === 'Combined') return null;

  if (activeSelectedGame) {
    return (
      <ModGameView 
        gameEntry={activeSelectedGame}
        goBack={() => setSelectedGame(null)}
        mods={mods}
        updateFirebaseMod={updateFirebaseMod}
        deleteFirebaseMod={deleteFirebaseMod}
        activeProfile={activeProfile}
        theme={theme}
      />
    );
  }

  return (
    <div className="flex-1 w-full flex flex-col pt-4 sm:pt-6 animate-in fade-in transition-colors relative">
      <div className="max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-32">
        
        <div className="glass-panel-flat p-4 sm:p-5 rounded-[2rem] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-5 mb-8">
          <div className="flex items-center gap-4 pl-1">
            <button onClick={goBack}
              className="p-3.5 sm:p-3 bg-white/50 dark:bg-white/10 rounded-2xl sm:rounded-xl border-2 border-black/10 dark:border-white/20 shadow-sm hover:-translate-y-1 hover:shadow-brutal-sm active:translate-y-0 active:shadow-none transition-[transform,box-shadow]"
            ><ArrowLeft className="w-5 h-5 pointer-events-none" /></button>
            <div className="flex flex-col">
              <h2 className="text-xl sm:text-2xl font-black tracking-tighter uppercase leading-none text-black dark:text-white">Mods Library</h2>
              <p className="text-[10px] text-black/70 dark:text-white/50 font-black uppercase tracking-[0.2em] mt-1.5 ml-0.5">{activeProfile}&apos;s Mods</p>
            </div>
          </div>

          <div className="relative group flex-1 max-w-sm ml-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black/70 dark:text-white/40 group-focus-within:text-neon-pink transition-colors" />
            <input 
              type="text" 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              placeholder="SEARCH GAMES..."
              className="w-full bg-white/50 dark:bg-black/80 border-2 border-black/10 dark:border-white/20 rounded-xl pl-11 pr-20 py-3 text-[10px] sm:text-xs font-black uppercase tracking-widest placeholder-black/60 dark:placeholder-white/40 outline-none focus:border-black dark:focus:border-white focus:bg-white dark:focus:text-black focus:text-black focus:shadow-brutal transition-all text-black dark:text-white"
            />
            <div className="absolute right-2 top-[-6px] pointer-events-none select-none z-50">
              <img src={badgeUrl} alt="Results" className="h-10 sm:h-12 drop-shadow-[1.5px_-1.5px_0px_rgba(0,0,0,1)] dark:drop-shadow-[1.5px_-1.5px_0px_rgba(255,255,255,0.4)]" />
            </div>
          </div>
        </div>

        {profileModsEntries.length === 0 ? (
          <div className="text-center py-20 glass-panel rounded-[2rem] border-dashed">
            <Box className="w-16 h-16 mx-auto text-black/50 dark:text-white/20 mb-5" />
            <h3 className="text-2xl font-black text-black/60 dark:text-white/60 uppercase tracking-tighter">
              {searchQuery ? 'No match found' : 'No games tracked'}
            </h3>
            <p className="text-black/60 dark:text-white/40 font-black mt-2 text-xs uppercase tracking-widest max-w-[200px] mx-auto leading-relaxed">
              {searchQuery ? 'Try a different search term.' : 'Add a game to start tracking its mods.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {profileModsEntries.map((entry, index) => (
              <div 
                key={entry.id}
                onClick={() => setSelectedGame(entry)}
                className="group cursor-pointer flex flex-col glass-panel overflow-hidden transition-[transform,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-brutal-lg animate-stagger-enter"
                style={{ animationDelay: `${(index % 20) * 40}ms` }}
              >
                <div className="relative aspect-[460/215] bg-black/5 dark:bg-white/5 overflow-hidden border-b-2 border-black/10 dark:border-white/10 rounded-t-[calc(1.5rem-2px)]">
                  <img 
                    src={entry.gameImageUrl} alt={entry.gameName} 
                    loading="lazy"
                    className="w-full h-full object-cover"
                    decoding="async"
                    onError={(e) => { e.target.src = `https://placehold.co/460x215/1a1a1a/8b5cf6?text=${encodeURIComponent(entry.gameName)}`; }}
                  />
                  <div className="absolute top-2 right-2 flex gap-1.5">
                    <div className="bg-neon-cyan text-black border-2 border-black rounded-lg px-2 py-1 flex items-center gap-1.5 font-black text-xs uppercase shadow-none group-hover:shadow-brutal-sm transition-[box-shadow]">
                      <Settings className="w-3 h-3" /> {(entry.modsList || []).length}
                    </div>
                  </div>
                </div>
                <div className="p-4 flex flex-col flex-1 relative bg-white/50 dark:bg-black/50 backdrop-blur-sm">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-black text-lg leading-tight line-clamp-1 uppercase tracking-tighter transition-colors group-hover:text-neon-purple flex-1" title={entry.gameName}>
                      {entry.gameName}
                    </h3>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setGameToDelete(entry);
                      }}
                      className="p-2 bg-[#ff4a4a] text-black border-2 border-black rounded-lg shadow-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-[transform,box-shadow]"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <button onClick={() => setShowAddModal(true)}
        className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 bg-neon-cyan text-black px-6 py-5 sm:py-4 rounded-2xl sm:rounded-[1.5rem] brutal-btn font-extrabold uppercase tracking-widest text-lg transition-[transform,box-shadow] flex items-center justify-center gap-3 z-50 pointer-events-auto active:scale-95"
      >
        <Plus className="w-7 h-7 sm:w-6 sm:h-6 border-2 border-black rounded-md p-0.5 bg-white shadow-brutal-sm" />
        <span className="hidden sm:inline-block">Add Game</span>
      </button>

      {showAddModal && (
        <ModsGameAddModal 
          mainGames={games}
          activeProfile={activeProfile}
          mods={mods}
          addFirebaseMod={addFirebaseMod}
          onClose={() => setShowAddModal(false)}
          theme={theme}
        />
      )}

      <DeleteWarningModal 
        isOpen={!!gameToDelete} 
        onClose={() => setGameToDelete(null)} 
        onConfirm={() => {
          deleteFirebaseMod(gameToDelete.id);
          setGameToDelete(null);
        }} 
        itemName={`${gameToDelete?.gameName} (All Mods)`} 
      />
    </div>
  );
}
