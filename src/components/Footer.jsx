import React from 'react';
import { Gamepad2, Github } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 dark:border-white/5 py-5 sm:py-6 transition-colors relative z-10 w-full mt-12 bg-white/30 dark:bg-slate-900/30 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
        
        <div className="flex items-center gap-2.5">
          <div className="bg-indigo-500/10 p-1.5 rounded-lg border border-indigo-500/20">
            <Gamepad2 className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
          </div>
          <span className="text-sm font-bold bg-gradient-to-r from-indigo-500 to-purple-500 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">Steam Backlog</span>
        </div>
        
        <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium transition-colors text-center uppercase tracking-wider">
          Curated by <strong className="text-indigo-600 dark:text-indigo-400">Aadish</strong> & <strong className="text-orange-600 dark:text-orange-400">Aditya</strong>
        </p>
        
        <div className="flex items-center gap-3">
          <a href="https://github.com/AadishY/GamesList" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-white transition-colors">
            <Github className="w-4 h-4" />
          </a>
        </div>
        
      </div>
    </footer>
  );
}
