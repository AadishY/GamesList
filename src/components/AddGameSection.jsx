import { ListPlus, Search, Loader2, X, AlertCircle } from 'lucide-react';

export default function AddGameSection({
  activeProfile, urlInput, handleInputChange, handleFetchGameDetails,
  loading, isSearching, showDropdown, setShowDropdown,
  setUrlInput, searchResults, handleSelectSearchResult, getExistingGame, error, dropdownRef
}) {
  if (activeProfile === 'Combined') return null;

  return (
    <section className="glass-panel p-5 sm:p-8 relative z-40 mb-6">
      <h2 className="text-xl sm:text-2xl font-black mb-6 flex items-center gap-3 uppercase tracking-tighter">
        <span className="bg-neon-cyan brutal-btn p-2 rounded-xl">
          <ListPlus className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
        </span>
        Add to {activeProfile}
      </h2>
      
      <form onSubmit={handleFetchGameDetails} className="flex flex-col sm:flex-row gap-4 relative z-10" ref={dropdownRef}>
        <div className="relative flex-1 group">
          <div className="relative">
            <Search className={`absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${isSearching ? 'text-neon-pink animate-pulse' : 'text-black/40 dark:text-white/40 group-focus-within:text-neon-purple'}`} />
            <input type="text" value={urlInput} onChange={handleInputChange}
              placeholder="Search game name or paste Steam URL..."
              className="w-full bg-white/50 dark:bg-black/80 border-2 border-black/20 dark:border-white/20 rounded-2xl pl-12 pr-12 py-4 text-base sm:text-lg font-bold outline-none focus:border-black dark:focus:border-white focus:bg-white dark:focus:bg-black focus:shadow-brutal transition-all placeholder-black/30 dark:placeholder-white/30"
              disabled={loading} autoComplete="off"
            />
            {urlInput && (
              <button type="button" onClick={() => { setUrlInput(''); setShowDropdown(false); }} className="absolute right-4 top-1/2 -translate-y-1/2 text-black/40 hover:text-black dark:text-white/40 dark:hover:text-white transition-colors p-2 rounded-lg bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20">
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {showDropdown && searchResults.length > 0 && (
            <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white dark:bg-[#111116] border-2 border-black dark:border-white/20 rounded-2xl shadow-brutal-lg z-50 max-h-80 overflow-y-auto animate-in fade-in slide-in-from-top-2 overflow-hidden overscroll-contain">
              {searchResults.map((game) => {
                const existing = getExistingGame(game.slug, game.name);
                const isAddedByMe = existing?.addedBy?.includes(activeProfile);
                return (
                  <div key={game.id} onMouseDown={(e) => { e.preventDefault(); handleSelectSearchResult(game); }} onClick={() => handleSelectSearchResult(game)} 
                    className={`flex items-center gap-4 p-3 hover:bg-neon-yellow/20 dark:hover:bg-neon-yellow/10 cursor-pointer transition-colors border-b-2 border-black/5 dark:border-white/5 last:border-0 ${isAddedByMe ? 'opacity-40 grayscale' : ''}`}
                  >
                    <img src={game.background_image || `https://placehold.co/100x100/1a1a1a/8b5cf6?text=${encodeURIComponent(game.name)}`} alt={game.name} 
                      className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover border-2 border-black/20 dark:border-white/20 flex-shrink-0"
                    />
                    <div className="flex flex-col min-w-0 w-full">
                      <span className="font-extrabold text-sm sm:text-base truncate uppercase tracking-tight">{game.name}</span>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-[10px] sm:text-xs font-bold bg-black/5 dark:bg-white/10 text-black/60 dark:text-white/60 px-2 py-0.5 rounded-md border border-black/10 dark:border-white/10">
                          {game.released ? game.released.substring(0, 4) : 'TBA'}
                        </span>
                        <span className="text-[10px] sm:text-xs text-black/40 dark:text-white/40 font-bold uppercase tracking-widest truncate max-w-[120px] sm:max-w-[200px]">
                          {game.genres?.map(g => g.name).slice(0, 2).join(', ')}
                        </span>
                        {existing && (
                           <span className={`text-[9px] sm:text-[10px] px-2 py-0.5 rounded-md font-extrabold uppercase tracking-widest border-2 ${isAddedByMe ? 'bg-[#ff4a4a] text-black border-black/30' : 'bg-neon-purple text-black border-black/30'}`}>
                             {isAddedByMe ? 'Added' : `By ${existing.addedBy?.[0] || '?'}`}
                           </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <button type="submit" disabled={loading || isSearching}
          className="bg-neon-pink brutal-btn px-8 py-4 rounded-2xl text-lg disabled:opacity-50 whitespace-nowrap flex items-center justify-center gap-3 active:scale-95"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ListPlus className="w-6 h-6" />}
          {loading ? 'WAIT' : 'ADD NEW'}
        </button>
      </form>
      
      {error && (
        <div className="mt-4 flex items-center gap-3 text-black bg-[#ff4a4a] text-sm font-bold px-4 py-3 rounded-xl border-2 border-black shadow-brutal-sm animate-in slide-in-from-top-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" /> <p className="uppercase tracking-widest">{error}</p>
        </div>
      )}
    </section>
  );
}
