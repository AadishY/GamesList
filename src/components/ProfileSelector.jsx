import React from 'react';
import { Gamepad2, User, Users, Sun, Moon } from 'lucide-react';

export default function ProfileSelector({ loginAs, theme, toggleTheme }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 font-sans overflow-x-hidden relative">
      
      {/* Theme toggle */}
      <div className="absolute top-4 right-4 md:top-6 md:right-6 z-50">
        <button 
          onClick={toggleTheme}
          className="p-3 bg-neon-cyan brutal-btn rounded-xl"
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Moon className="w-6 h-6 text-black" /> : <Sun className="w-6 h-6 text-black" />}
        </button>
      </div>

      <div className="glass-panel max-w-sm w-full p-8 sm:p-10 flex flex-col items-center shadow-brutal-lg animate-in fade-in zoom-in-95 duration-500">
        
        <div className="bg-neon-pink brutal-btn p-5 rounded-2xl mb-6 flex items-center justify-center shadow-pink tactile-logo">
          <Gamepad2 className="w-12 h-12 text-black" />
        </div>

        <h1 className="text-3xl font-black text-center mb-1 tracking-tighter uppercase">Enter Player</h1>
        <p className="text-black/50 dark:text-white/50 text-[10px] text-center mb-8 font-extrabold uppercase tracking-[0.2em]">Select your profile</p>
        
        <div className="space-y-4 w-full">
          <button 
            onClick={() => loginAs('Aadish')}
            className="w-full py-4 px-6 bg-neon-yellow brutal-btn rounded-2xl text-lg flex items-center justify-center gap-3 active:scale-95"
          >
            <User className="w-6 h-6" />
            <span>Aadish</span>
          </button>
          
          <button 
            onClick={() => loginAs('Aditya')}
            className="w-full py-4 px-6 bg-neon-orange brutal-btn rounded-2xl text-lg flex items-center justify-center gap-3 active:scale-95"
          >
            <User className="w-6 h-6" />
            <span>Aditya</span>
          </button>

          <div className="pt-6 relative">
            <div className="absolute inset-0 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
              <div className="w-full border-t-2 border-black/10 dark:border-white/10 border-dashed"></div>
            </div>
            <div className="relative flex justify-center text-[10px]">
              <span className="bg-[#f4f4f5] dark:bg-[#09090b] px-3 py-1 text-black/40 dark:text-white/50 font-extrabold uppercase tracking-widest border-2 border-black/10 dark:border-white/20 rounded-lg">Or</span>
            </div>
          </div>

          <button 
            onClick={() => loginAs('Combined')}
            className="w-full mt-4 py-4 px-6 bg-neon-purple brutal-btn rounded-2xl text-lg flex items-center justify-center gap-3 active:scale-95"
          >
            <Users className="w-6 h-6" />
            <span>Combined</span>
          </button>
        </div>
      </div>
    </div>
  );
}
