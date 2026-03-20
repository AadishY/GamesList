import React from 'react';
import { ListPlus, Search, Loader2, X, AlertCircle } from 'lucide-react';

export default function AddGameSection({
  activeProfile,
  urlInput,
  handleInputChange,
  handleFetchGameDetails,
  loading,
  isSearching,
  showDropdown,
  setShowDropdown,
  setUrlInput,
  searchResults,
  handleSelectSearchResult,
  getExistingGame,
  error,
  dropdownRef
}) {
  if (activeProfile === 'Combined') return null;

  return (
    <section className="bg-white/60 dark:bg-slate-900/50 backdrop-blur-sm rounded-3xl p-5 sm:p-8 border border-slate-200 dark:border-white/5 shadow-xl relative z-40 transition-colors">
      <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
      </div>
      
      <h2 className="text-xl font-bold mb-5 flex items-center gap-2 text-slate-800 dark:text-white tracking-tight transition-colors">
        <ListPlus className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />
        Add to {activeProfile}'s List
      </h2>
      
      <form onSubmit={handleFetchGameDetails} className="flex flex-col sm:flex-row gap-3 relative z-10" ref={dropdownRef}>
        <div className="relative flex-1">
          <div className="relative">
            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${isSearching ? 'text-indigo-500 dark:text-indigo-400 animate-pulse' : 'text-slate-400 dark:text-slate-500'}`} />
            <input
              type="text"
              value={urlInput}
              onChange={handleInputChange}
              placeholder="Search game name or paste Steam URL..."
              className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/10 rounded-2xl pl-12 pr-5 py-3.5 sm:py-4 text-sm sm:text-base text-slate-900 dark:text-white outline-none focus:border-indigo-400 dark:focus:border-indigo-500/50 focus:bg-white dark:focus:bg-slate-900 transition-all placeholder-slate-400 dark:placeholder-slate-500 shadow-inner"
              disabled={loading}
              autoComplete="off"
            />
            {urlInput && (
              <button 
                type="button" 
                onClick={() => { setUrlInput(''); setShowDropdown(false); }} 
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Real-Time Search Dropdown */}
          {showDropdown && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl z-50 max-h-72 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 dark:[&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full animate-in fade-in slide-in-from-top-2 transition-colors">
              {searchResults.map((game) => {
                const existing = getExistingGame(game.slug, game.name);
                const isAddedByMe = existing?.addedBy?.includes(activeProfile);
                
                return (
                  <div 
                    key={game.id} 
                    onMouseDown={(e) => { e.preventDefault(); handleSelectSearchResult(game); }}
                    onClick={() => handleSelectSearchResult(game)} 
                    className={`flex flex-col sm:flex-row items-start sm:items-center gap-4 p-3.5 hover:bg-slate-100 dark:hover:bg-white/10 cursor-pointer transition-colors border-b border-slate-100 dark:border-white/5 last:border-0 ${isAddedByMe ? 'opacity-50' : ''}`}
                  >
                    <img 
                      src={game.background_image || `https://placehold.co/100x100/1e293b/4f46e5?text=${encodeURIComponent(game.name)}`} 
                      alt={game.name} 
                      className="w-14 h-14 rounded-xl object-cover border border-slate-200 dark:border-white/10 shadow-sm flex-shrink-0"
                    />
                    <div className="flex flex-col min-w-0 w-full">
                      <span className="font-bold text-slate-900 dark:text-white text-sm sm:text-base truncate">{game.name}</span>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-black/20 px-2 py-0.5 rounded-md border border-slate-200 dark:border-transparent">
                          {game.released ? game.released.substring(0, 4) : 'TBA'}
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider truncate hidden sm:inline-block">
                          {game.genres?.map(g => g.name).slice(0, 2).join(', ')}
                        </span>
                        {existing && (
                           <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider ${isAddedByMe ? 'bg-red-500/10 text-red-600 border border-red-500/20 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30' : 'bg-indigo-500/10 text-indigo-600 border border-indigo-500/20 dark:bg-indigo-500/20 dark:text-indigo-300 dark:border-indigo-500/30'}`}>
                             {isAddedByMe ? 'Already added' : `Added by ${existing.addedBy?.[0] || 'someone'}`}
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
        <button
          type="submit"
          disabled={loading || isSearching}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3.5 sm:py-4 rounded-2xl font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50 whitespace-nowrap shadow-[0_0_15px_rgba(79,70,229,0.2)] hover:shadow-[0_0_25px_rgba(79,70,229,0.4)] active:scale-95"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ListPlus className="w-5 h-5" />}
          {loading ? 'Fetching...' : 'Add Manual URL'}
        </button>
      </form>
      
      {error && (
        <div className="mt-5 flex items-center gap-2 text-red-600 dark:text-red-400 text-sm bg-red-500/10 p-3.5 rounded-xl border border-red-500/20 animate-in slide-in-from-top-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}
    </section>
  );
}
