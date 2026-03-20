import React from 'react';
import { Gamepad2, Loader2, Cloud, AlertCircle, Circle, CheckCircle2, Users, User, Sun, Moon } from 'lucide-react';

export default function Header({ syncStatus, stats, activeProfile, loginAs, theme, toggleTheme }) {
  return (
    <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/5 sticky top-0 z-10 shadow-lg transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
          
          {/* Left Area: Logo, Title & Stats */}
          <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-shrink-0 w-full md:w-auto">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2.5 rounded-2xl shadow-lg shadow-indigo-500/20 flex-shrink-0 mt-1 sm:mt-0">
              <Gamepad2 className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            
            <div className="flex flex-col justify-center min-w-0 gap-1.5 sm:gap-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 dark:from-indigo-300 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent tracking-tight leading-none truncate">
                  Steam Backlog
                </h1>
                
                {/* Theme Toggle (Mobile inline next to title) */}
                <button 
                  onClick={toggleTheme}
                  className="md:hidden ml-2 p-1.5 rounded-full bg-slate-100 dark:bg-[#111827] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-white/5"
                  title="Toggle Theme"
                >
                  {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                </button>
              </div>
              
              {/* Stats Row */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <div className="flex items-center text-[11px] sm:text-xs font-semibold tracking-wide">
                  {syncStatus === 'syncing' ? (
                    <span className="text-indigo-500 dark:text-indigo-400 flex items-center gap-1.5"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...</span>
                  ) : syncStatus === 'saved' ? (
                    <span className="text-emerald-600 dark:text-emerald-500 flex items-center gap-1.5 animate-in fade-in"><Cloud className="w-3.5 h-3.5" /> Auto-saved</span>
                  ) : syncStatus === 'error' ? (
                    <span className="text-red-500 dark:text-red-400 flex items-center gap-1.5 animate-in fade-in"><AlertCircle className="w-3.5 h-3.5" /> Sync Error</span>
                  ) : null}
                </div>
                
                {/* Pill Counters */}
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-[#111827] px-2.5 py-1 rounded-full border border-slate-200 dark:border-white/5 shadow-inner transition-colors">
                    <Circle className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 flex-shrink-0" />
                    <strong className="text-slate-900 dark:text-white text-xs leading-none font-bold">{stats.wanted}</strong>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-[#111827] px-2.5 py-1 rounded-full border border-slate-200 dark:border-white/5 shadow-inner transition-colors">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 flex-shrink-0" />
                    <strong className="text-slate-900 dark:text-white text-xs leading-none font-bold">{stats.played}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Area: Profile Buttons & Theme Toggle */}
          <div className="flex items-center justify-start md:justify-end gap-2 sm:gap-3 w-full md:w-auto mt-1 md:mt-0 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            
            {/* Theme Toggle (Desktop) */}
            <button 
              onClick={toggleTheme}
              className="hidden md:flex justify-center items-center p-2.5 rounded-full bg-slate-100 dark:bg-[#111827] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-white/5 flex-shrink-0"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>

            {/* Combined View Button */}
            {activeProfile !== 'Combined' && (
              <button 
                onClick={() => loginAs('Combined')}
                className="flex justify-center items-center gap-2 bg-indigo-50 dark:bg-[#1e1b4b]/60 hover:bg-indigo-100 dark:hover:bg-[#1e1b4b] text-indigo-700 dark:text-indigo-200 px-4 py-2.5 sm:px-5 sm:py-2.5 rounded-full text-sm font-semibold transition-all border border-indigo-200 dark:border-indigo-500/20 active:scale-95 flex-shrink-0 shadow-sm"
                title="Combined View"
              >
                <Users className="w-[16px] h-[16px] sm:w-[18px] sm:h-[18px] flex-shrink-0" />
                <span className="tracking-wide">Combined</span>
              </button>
            )}

            {/* Active Profile Pill / Switcher */}
            <button 
              onClick={() => loginAs(null)}
              className="flex flex-1 md:flex-none justify-center items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-white px-4 py-2.5 sm:px-6 sm:py-2.5 rounded-full text-sm font-bold transition-all shadow-[0_0_15px_rgba(244,63,94,0.3)] hover:shadow-[0_0_20px_rgba(244,63,94,0.5)] active:scale-95 flex-shrink-0"
              title="Switch Profile"
            >
              {activeProfile === 'Combined' ? <Users className="w-[16px] h-[16px] sm:w-[18px] sm:h-[18px] text-white flex-shrink-0" /> : <User className="w-[16px] h-[16px] sm:w-[18px] sm:h-[18px] text-white flex-shrink-0" />}
              <span className="truncate max-w-[120px] sm:max-w-none tracking-wide">{activeProfile}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
