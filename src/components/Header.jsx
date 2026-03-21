import React from 'react';
import { Gamepad2, Loader2, Cloud, AlertCircle, Circle, CheckCircle2, Users, User, Sun, Moon } from 'lucide-react';

export default function Header({ syncStatus, stats, activeProfile, loginAs, theme, toggleTheme, currentView }) {
  return (
    <header className="sticky top-0 z-50 p-2 sm:p-4 pointer-events-none w-full">
      <div className="max-w-7xl mx-auto glass-panel p-3 sm:px-5 sm:py-3 pointer-events-auto flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4 w-full transition-all">
          
        {/* Left: Logo + Stats */}
        <div className="flex items-center justify-between gap-3 flex-shrink-0 w-full md:w-auto">
          <div className="flex items-center gap-3">
            <div className="bg-neon-pink brutal-btn p-2 rounded-xl flex-shrink-0 tactile-logo">
              <Gamepad2 className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            
            <div className="flex flex-col justify-center min-w-0 pr-2">
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => window.location.reload()} 
                  className="text-lg sm:text-xl font-extrabold tracking-tight leading-none truncate uppercase transition-transform origin-left outline-none active:scale-95"
                >
                  Steam Backlog
                </button>
              </div>
              
              {/* Desktop Stats / Sync */}
              <div className="hidden sm:flex items-center gap-2 mt-1">
                <div className="flex items-center text-[10px] font-bold uppercase tracking-widest">
                  {syncStatus === 'syncing' ? (
                    <span className="text-neon-purple flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Saving...</span>
                  ) : syncStatus === 'saved' ? (
                    <span className="text-neon-green flex items-center gap-1"><Cloud className="w-3 h-3" /> Synced</span>
                  ) : syncStatus === 'error' ? (
                    <span className="text-[#ff4a4a] flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Error</span>
                  ) : null}
                </div>
                
                <div className="flex items-center gap-1.5 ml-1">
                  <div className="flex items-center gap-1 bg-neon-yellow border-2 border-black dark:border-white px-1.5 py-0.5 rounded-md text-[10px] font-bold text-black" title="Wanted">
                    <Circle className="w-3 h-3" /> <span>{stats.wanted}</span>
                  </div>
                  <div className="flex items-center gap-1 bg-neon-green border-2 border-black dark:border-white px-1.5 py-0.5 rounded-md text-[10px] font-bold text-black" title="Played">
                    <CheckCircle2 className="w-3 h-3" /> <span>{stats.played}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Mobile Theme Toggle */}
          <button 
            onClick={toggleTheme}
            className="md:hidden p-3 bg-neon-cyan brutal-btn rounded-xl active:scale-90 transition-transform"
          >
            {theme === 'dark' ? <Moon className="w-5 h-5 text-black" /> : <Sun className="w-5 h-5 text-black" />}
          </button>
        </div>

        {/* Mobile Stats Ribbon */}
        <div className="flex sm:hidden items-center justify-between w-full px-1 border-t-2 border-black/10 dark:border-white/10 pt-2 pb-1">
          <div className="flex items-center text-[10px] font-bold uppercase tracking-widest text-black/60 dark:text-white/60">
            {syncStatus === 'syncing' ? <span className="text-neon-purple"><Loader2 className="w-3 h-3 inline animate-spin" /> Save</span>
             : syncStatus === 'saved' ? <span className="text-neon-green"><Cloud className="w-3 h-3 inline" /> Sync</span>
             : syncStatus === 'error' ? <span className="text-[#ff4a4a]"><AlertCircle className="w-3 h-3 inline" /> Err</span>
             : null}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-neon-yellow border-2 border-black dark:border-white px-2 py-0.5 rounded-md text-[10px] font-bold text-black">
              Wanted: {stats.wanted}
            </div>
            <div className="flex items-center gap-1 bg-neon-green border-2 border-black dark:border-white px-2 py-0.5 rounded-md text-[10px] font-bold text-black">
              Played: {stats.played}
            </div>
          </div>
        </div>
        
        {/* Right: Actions */}
        <div className="flex items-center justify-start md:justify-end gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          
          {/* Theme Toggle (Desktop) */}
          <button 
            onClick={toggleTheme}
            className="hidden md:flex p-3 bg-neon-cyan brutal-btn rounded-xl flex-shrink-0"
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Moon className="w-5 h-5 text-black" /> : <Sun className="w-5 h-5 text-black" />}
          </button>

          {/* Combined View */}
          {currentView !== 'sharedList' && activeProfile !== 'Combined' && (
            <button 
              onClick={() => loginAs('Combined')}
              className="flex items-center gap-2 bg-neon-purple brutal-btn px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest flex-shrink-0"
            >
              <Users className="w-4 h-4" /> <span className="hidden sm:inline-block">Combined</span>
            </button>
          )}

          {/* Profile Pill */}
          {currentView !== 'sharedList' && (
            <button 
              onClick={() => loginAs(null)}
              className="flex items-center gap-2 bg-neon-yellow brutal-btn px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-widest flex-shrink-0"
            >
              {activeProfile === 'Combined' ? <Users className="w-4 h-4" /> : <User className="w-4 h-4" />}
              <span className="truncate max-w-[100px] sm:max-w-none">{activeProfile}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
