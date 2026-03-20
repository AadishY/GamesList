import React from 'react';
import { Gamepad2, Github } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 dark:border-white/5 py-8 transition-colors relative z-10 w-full bg-slate-100 dark:bg-slate-900 overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-6 relative z-10">
        
        <div className="flex flex-col items-center sm:items-start gap-1">
          <div className="flex items-center gap-2.5">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-1.5 rounded-lg shadow-lg shadow-indigo-500/20">
              <Gamepad2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-base font-black bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent tracking-tight">Steam Backlog</span>
          </div>
          <span className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium ml-1">v2.0 • Cloud Sync Enabled</span>
        </div>
        
        <div className="flex flex-col items-center gap-1.5">
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium transition-colors text-center tracking-wide">
            Engineered by <strong className="text-indigo-600 dark:text-indigo-400">Aadish</strong> & <strong className="text-orange-600 dark:text-orange-400">Aditya</strong>
          </p>
          <div className="h-0.5 w-16 bg-gradient-to-r from-indigo-500 to-orange-500 rounded-full"></div>
        </div>
        
        <div className="flex items-center gap-4">
          <a href="https://github.com/AadishY/GamesList" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-white/10 dark:hover:bg-white/20 text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-all active:scale-95 shadow-sm font-semibold text-sm">
            <Github className="w-4 h-4" />
            <span>GitHub</span>
          </a>
        </div>
        
      </div>
    </footer>
  );
}
