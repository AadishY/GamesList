import React from 'react';
import { ArrowUpDown, Search, LayoutGrid, Grid2x2, List } from 'lucide-react';

export default function FilterSection({
  statusFilter, setStatusFilter, modeFilter, setModeFilter,
  sortOption, setSortOption, searchQuery, setSearchQuery, viewMode, setViewMode
}) {
  const viewModes = [{ key: 'grid', icon: LayoutGrid }, { key: 'compact', icon: Grid2x2 }, { key: 'table', icon: List }];

  const pillClass = (active, colorClass) => `px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-[10px] sm:text-xs font-extrabold uppercase tracking-widest transition-all ${
    active ? `${colorClass} brutal-btn` : 'bg-transparent border-2 border-transparent hover:border-black/20 dark:hover:border-white/20 text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
  }`;

  return (
    <section className="glass-panel-flat p-2 sm:p-3 mb-6 flex flex-col xl:flex-row gap-3 justify-between items-start xl:items-center w-full">
      {/* Filters Mobile Scroll Header */}
      <div className="flex w-full overflow-x-auto pb-1 xl:pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] gap-2 sm:gap-3 items-center">
        <div className="bg-white/50 dark:bg-black/50 rounded-2xl p-1.5 border-2 border-black/5 dark:border-white/10 flex gap-1 flex-shrink-0">
          {['All', 'Wanted', 'Played'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} className={pillClass(statusFilter === s, 'bg-neon-yellow')}>{s}</button>
          ))}
        </div>
        <div className="bg-white/50 dark:bg-black/50 rounded-2xl p-1.5 border-2 border-black/5 dark:border-white/10 flex gap-1 flex-shrink-0">
          {['All', 'Single', 'Multi'].map((label, i) => {
            const value = ['All', 'Singleplayer', 'Multiplayer'][i];
            return <button key={value} onClick={() => setModeFilter(value)} className={pillClass(modeFilter === value, 'bg-neon-cyan')}>{label}</button>;
          })}
        </div>
      </div>
      
      {/* Controls Wrapper */}
      <div className="flex flex-col sm:flex-row w-full xl:w-auto gap-2 sm:gap-3 flex-shrink-0">
        
        <div className="relative flex items-center flex-1 sm:flex-initial min-w-[140px]">
          <ArrowUpDown className="absolute left-4 w-4 h-4 text-black/40 dark:text-white/40 pointer-events-none" />
          <select value={sortOption} onChange={(e) => setSortOption(e.target.value)}
            className="w-full bg-white/50 dark:bg-black/80 border-2 border-black/10 dark:border-white/20 rounded-xl pl-10 pr-10 py-3 text-[10px] sm:text-xs font-extrabold uppercase tracking-widest outline-none focus:border-black dark:focus:border-white focus:bg-white focus:shadow-brutal transition-all appearance-none cursor-pointer text-black dark:text-white"
          >
            <option value="Newest">Newest</option><option value="Oldest">Oldest</option><option value="A-Z">A-Z</option><option value="Z-A">Z-A</option>
          </select>
          {/* Custom Select Arrow */}
          <div className="absolute right-4 pointer-events-none border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-black/40 dark:border-white/40"></div>
        </div>

        <div className="hidden sm:flex bg-white/50 dark:bg-black/50 rounded-xl p-1 border-2 border-black/5 dark:border-white/10 gap-1 flex-shrink-0 h-full items-center">
          {viewModes.map(({ key, icon: Icon }) => (
            <button key={key} onClick={() => setViewMode(key)}
              className={`p-2 rounded-lg transition-all ${viewMode === key ? 'bg-neon-pink brutal-btn' : 'text-black/40 hover:text-black dark:text-white/40 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 border-2 border-transparent'}`}
            ><Icon className="w-5 h-5" /></button>
          ))}
        </div>

        <div className="relative w-full sm:w-64 flex-shrink-0 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40 dark:text-white/40 pointer-events-none group-focus-within:text-neon-pink transition-colors" />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="SEARCH..."
            className="w-full bg-white/50 dark:bg-black/80 border-2 border-black/10 dark:border-white/20 rounded-xl pl-11 pr-4 py-3 text-[10px] sm:text-xs font-extrabold uppercase tracking-widest placeholder-black/30 dark:placeholder-white/40 outline-none focus:border-black dark:focus:border-white focus:bg-white focus:shadow-brutal transition-all text-black dark:text-white"
          />
        </div>
      </div>
    </section>
  );
}
