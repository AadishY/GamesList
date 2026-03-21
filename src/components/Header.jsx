import { Gamepad2, Loader2, Cloud, AlertCircle, Circle, CheckCircle2, Users, User, Sun, Moon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Header({ syncStatus, stats, activeProfile, loginAs, theme, toggleTheme, currentView }) {
  const navigate = useNavigate();
  const isModView = currentView === 'modsList';

  return (
    <header className="sticky top-0 z-50 p-2 sm:p-3 pointer-events-none w-full">
      <div className="max-w-7xl mx-auto glass-panel backdrop-blur-lg sm:backdrop-blur-xl bg-white/40 dark:bg-black/40 p-2 sm:px-4 sm:py-2 pointer-events-auto flex items-center justify-between gap-2 shadow-brutal-sm overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] animate-slide-down">
          
        {/* Left: Logo + Title */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="bg-neon-pink brutal-btn p-1.5 sm:p-2 rounded-lg sm:rounded-xl flex-shrink-0 tactile-logo cursor-pointer" onClick={() => navigate('/')}>
            <Gamepad2 className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <button 
            onClick={() => navigate('/')} 
            className="text-sm sm:text-base font-black tracking-tight leading-none truncate uppercase transition-transform origin-left outline-none active:scale-95 text-black dark:text-white"
          >
            Steam Backlog
          </button>

          {/* Stats / Sync */}
          {!isModView && (
            <div className="hidden md:flex items-center gap-2 ml-2">
              <div className="flex items-center text-[9px] font-bold uppercase tracking-widest">
                {syncStatus === 'syncing' ? (
                  <span className="text-neon-purple flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Save</span>
                ) : syncStatus === 'saved' ? (
                  <span className="text-neon-green flex items-center gap-1"><Cloud className="w-3 h-3" /> Sync</span>
                ) : syncStatus === 'error' ? (
                  <span className="text-[#ff4a4a] flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Err</span>
                ) : null}
              </div>
              <div className="flex items-center gap-1.5 ml-1">
                <div className="flex items-center gap-1 bg-neon-yellow border-2 border-black dark:border-white px-1.5 py-0.5 rounded-md text-[9px] font-black text-black" title="Wanted">
                  <Circle className="w-3 h-3" strokeWidth={3} /> <span>{stats.wanted}</span>
                </div>
                <div className="flex items-center gap-1 bg-neon-green border-2 border-black dark:border-white px-1.5 py-0.5 rounded-md text-[9px] font-black text-black" title="Played">
                  <CheckCircle2 className="w-3 h-3" strokeWidth={3} /> <span>{stats.played}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center justify-end gap-2 flex-shrink-0">
          
          <button 
            onClick={toggleTheme}
            className="p-2 sm:p-2.5 bg-neon-cyan brutal-btn rounded-lg sm:rounded-xl flex-shrink-0"
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Moon className="w-4 h-4 text-black" /> : <Sun className="w-4 h-4 text-black" />}
          </button>

          {currentView !== 'sharedList' && activeProfile !== 'Combined' && !isModView && (
            <button 
              onClick={() => loginAs('Combined')}
              className="flex items-center gap-1.5 bg-neon-purple brutal-btn px-3 py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-widest flex-shrink-0"
            >
              <Users className="w-3.5 h-3.5" /> <span className="hidden sm:inline-block">Combined</span>
            </button>
          )}

          {currentView !== 'sharedList' && (
            <button 
              onClick={() => loginAs(null)}
              className="flex items-center gap-1.5 bg-neon-yellow brutal-btn px-3 py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-widest flex-shrink-0"
            >
              {activeProfile === 'Combined' ? <Users className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
              <span className="truncate max-w-[80px] sm:max-w-none">{activeProfile}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
