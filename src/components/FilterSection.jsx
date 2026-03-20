import React from 'react';
import { ArrowUpDown, Search, LayoutGrid, Grid2x2, List } from 'lucide-react';

export default function FilterSection({
  statusFilter, setStatusFilter,
  modeFilter, setModeFilter,
  sortOption, setSortOption,
  searchQuery, setSearchQuery,
  viewMode, setViewMode
}) {
  const viewModes = [
    { key: 'grid', icon: LayoutGrid, title: 'Large Grid' },
    { key: 'compact', icon: Grid2x2, title: 'Compact Grid' },
    { key: 'table', icon: List, title: 'Table View' }
  ];

  return (
    <section className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center w-full">
      {/* Scrollable container for mobile filters */}
      <div className="flex w-full overflow-x-auto pb-2 -mb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] gap-3 items-center">
        <div className="bg-white/60 dark:bg-slate-900/50 backdrop-blur-sm rounded-2xl p-1.5 border border-slate-200 dark:border-white/5 flex gap-1 flex-shrink-0 transition-colors">
          {['All', 'Wanted', 'Played'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                statusFilter === status 
                  ? 'bg-indigo-100/60 text-indigo-700 border border-indigo-200 dark:bg-indigo-500/20 dark:text-indigo-300 shadow-sm dark:border-indigo-500/30' 
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-white/5 border border-transparent'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
        <div className="bg-white/60 dark:bg-slate-900/50 backdrop-blur-sm rounded-2xl p-1.5 border border-slate-200 dark:border-white/5 flex gap-1 flex-shrink-0 transition-colors">
          {['All', 'Singleplayer', 'Multiplayer'].map(mode => (
            <button
              key={mode}
              onClick={() => setModeFilter(mode)}
              className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                modeFilter === mode 
                  ? 'bg-indigo-100/60 text-indigo-700 border border-indigo-200 dark:bg-indigo-500/20 dark:text-indigo-300 shadow-sm dark:border-indigo-500/30' 
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-white/5 border border-transparent'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row w-full lg:w-auto gap-3 flex-shrink-0">
        {/* Sorting Dropdown */}
        <div className="relative flex items-center gap-2 group">
          <ArrowUpDown className="absolute left-4 w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="w-full sm:w-auto bg-white/60 dark:bg-slate-900/50 backdrop-blur-sm border border-slate-200 dark:border-white/5 rounded-2xl pl-11 pr-8 py-3 text-sm text-slate-700 dark:text-slate-300 font-medium outline-none focus:border-indigo-400 dark:focus:border-indigo-500/50 focus:bg-white dark:focus:bg-slate-900 transition-all shadow-inner appearance-none cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <option value="Newest">Newest First</option>
            <option value="Oldest">Oldest First</option>
            <option value="A-Z">Name (A-Z)</option>
            <option value="Z-A">Name (Z-A)</option>
          </select>
        </div>

        {/* View Mode Toggle */}
        <div className="bg-white/60 dark:bg-slate-900/50 backdrop-blur-sm rounded-2xl p-1.5 border border-slate-200 dark:border-white/5 flex gap-1 flex-shrink-0 transition-colors">
          {viewModes.map(({ key, icon: Icon, title }) => (
            <button
              key={key}
              onClick={() => setViewMode(key)}
              className={`p-2.5 rounded-xl transition-all duration-300 ${
                viewMode === key 
                  ? 'bg-indigo-100/60 text-indigo-700 border border-indigo-200 dark:bg-indigo-500/20 dark:text-indigo-300 shadow-sm dark:border-indigo-500/30' 
                  : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-500 dark:hover:text-slate-200 dark:hover:bg-white/5 border border-transparent'
              }`}
              title={title}
            >
              <Icon className="w-4 h-4" />
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full lg:w-64">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search games..."
            className="w-full bg-white/60 dark:bg-slate-900/50 backdrop-blur-sm border border-slate-200 dark:border-white/5 rounded-2xl pl-11 pr-4 py-3 text-sm text-slate-800 dark:text-slate-200 outline-none focus:border-indigo-400 dark:focus:border-indigo-500/50 focus:bg-white dark:focus:bg-slate-900 transition-all shadow-inner placeholder-slate-400 dark:placeholder-slate-500"
          />
        </div>
      </div>
    </section>
  );
}
