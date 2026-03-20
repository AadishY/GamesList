import React from 'react';
import { Gamepad2, User, Users, Sun, Moon } from 'lucide-react';

export default function ProfileSelector({ loginAs, theme, toggleTheme }) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] dark:from-slate-900 dark:via-[#020617] dark:to-[#020617] flex flex-col items-center justify-center p-4 selection:bg-indigo-500/30 font-sans text-slate-800 dark:text-slate-200 overflow-x-hidden transition-colors relative">
      
      <div className="absolute top-4 right-4 md:top-8 md:right-8 z-50">
        <button 
          onClick={toggleTheme}
          className="flex justify-center items-center p-3 rounded-full bg-white dark:bg-[#111827] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-white/5 shadow-md flex-shrink-0"
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>
      </div>

      <div className="max-w-md w-full bg-white/80 dark:bg-slate-900/60 backdrop-blur-2xl p-8 rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-500 transition-colors">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-3xl pointer-events-none transition-colors"></div>
        
        <div className="flex justify-center mb-6 relative">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-3.5 rounded-2xl shadow-lg shadow-indigo-500/25">
            <Gamepad2 className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-center mb-2 text-slate-900 dark:text-white tracking-tight transition-colors">Who is playing?</h1>
        <p className="text-slate-500 dark:text-slate-400 text-center mb-10 transition-colors">Select your profile to continue</p>
        
        <div className="space-y-4 relative z-10">
          <button 
            onClick={() => loginAs('Aadish')}
            className="w-full py-4 bg-slate-50 hover:bg-blue-50 dark:bg-white/5 dark:hover:bg-blue-600/20 border border-slate-200 hover:border-blue-300 dark:border-white/5 dark:hover:border-blue-500/50 text-slate-700 dark:text-white rounded-2xl font-medium transition-all duration-300 flex items-center gap-3 justify-center group hover:shadow-[0_0_20px_rgba(59,130,246,0.1)] dark:hover:shadow-[0_0_20px_rgba(59,130,246,0.2)] active:scale-95"
          >
            <User className="w-5 h-5 text-blue-500 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300" />
            Aadish
          </button>
          <button 
            onClick={() => loginAs('Aditya')}
            className="w-full py-4 bg-slate-50 hover:bg-orange-50 dark:bg-white/5 dark:hover:bg-orange-600/20 border border-slate-200 hover:border-orange-300 dark:border-white/5 dark:hover:border-orange-500/50 text-slate-700 dark:text-white rounded-2xl font-medium transition-all duration-300 flex items-center gap-3 justify-center group hover:shadow-[0_0_20px_rgba(249,115,22,0.1)] dark:hover:shadow-[0_0_20px_rgba(249,115,22,0.2)] active:scale-95"
          >
            <User className="w-5 h-5 text-orange-500 dark:text-orange-400 group-hover:scale-110 transition-transform duration-300" />
            Aditya
          </button>
          <div className="pt-6 mt-6 border-t border-slate-200 dark:border-white/5 transition-colors">
            <button 
              onClick={() => loginAs('Combined')}
              className="w-full py-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-400 hover:via-purple-400 hover:to-pink-400 text-white rounded-2xl font-bold text-lg transition-all duration-300 flex items-center gap-3 justify-center group shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] active:scale-95"
            >
              <Users className="w-6 h-6 group-hover:scale-110 transition-transform duration-300 text-white" />
              Combined Library View
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
