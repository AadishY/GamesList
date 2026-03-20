import React from 'react';
import { Gamepad2, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 dark:border-white/5 py-3 sm:py-4 transition-colors relative z-10 w-full bg-slate-100/80 dark:bg-slate-900/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center gap-2 relative z-10">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-1 rounded-md shadow-md shadow-indigo-500/20">
          <Gamepad2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" />
        </div>
        <p className="flex items-center gap-1 text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium tracking-wide">
          Made with <Heart className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-red-500 fill-red-500 animate-pulse" /> by
          <strong className="text-indigo-600 dark:text-indigo-400">Aadish</strong> &
          <strong className="text-orange-600 dark:text-orange-400">Aditya</strong>
        </p>
      </div>
    </footer>
  );
}
