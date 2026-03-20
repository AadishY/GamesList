import React from 'react';
import { Trash2 } from 'lucide-react';

export default function DeleteModal({ gameToDelete, setGameToDelete, confirmDeleteGame }) {
  if (!gameToDelete) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-md transition-all text-center">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-red-500/20 rounded-3xl w-full max-w-sm p-6 shadow-xl dark:shadow-[0_0_50px_rgba(239,68,68,0.2)] animate-in fade-in zoom-in-95 duration-300 relative overflow-hidden transition-colors">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-red-500/0 via-red-500 to-red-500/0"></div>
        <div className="mx-auto w-16 h-16 bg-red-50 dark:bg-red-500/10 flex items-center justify-center rounded-full mb-4">
          <Trash2 className="w-8 h-8 text-red-500 dark:text-red-400" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 transition-colors">Remove Game?</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed transition-colors">
          Are you sure you want to remove <strong className="text-slate-900 dark:text-white transition-colors">{gameToDelete.name}</strong> from your list?
        </p>
        <div className="flex gap-3">
          <button 
            onClick={() => setGameToDelete(null)}
            className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 dark:bg-white/5 dark:hover:bg-white/10 dark:border-white/5 dark:text-white rounded-xl font-medium transition-all active:scale-95"
          >
            Cancel
          </button>
          <button 
            onClick={confirmDeleteGame}
            className="flex-1 py-3 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 dark:bg-red-500/10 dark:hover:bg-red-500/20 dark:text-red-400 dark:border-red-500/20 rounded-xl font-medium transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            Yes, Remove
          </button>
        </div>
      </div>
    </div>
  );
}
