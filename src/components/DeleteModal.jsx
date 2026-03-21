import { Trash2 } from 'lucide-react';

export default function DeleteModal({ gameToDelete, setGameToDelete, confirmDeleteGame }) {
  if (!gameToDelete) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 bg-black/60 dark:bg-black/80 backdrop-blur-xl text-center">
      <div className="glass-panel w-full max-w-sm p-8 sm:p-10 animate-in fade-in zoom-in-95 duration-300 relative overflow-hidden flex flex-col items-center">
        
        <div className="w-20 h-20 bg-[#ff4a4a] brutal-btn flex items-center justify-center rounded-3xl mb-8 -rotate-3">
          <Trash2 className="w-10 h-10 text-black" />
        </div>
        
        <h3 className="text-3xl font-black mb-3 uppercase tracking-tighter text-black dark:text-white">Delete Match?</h3>
        <p className="text-sm text-black/60 dark:text-white/60 mb-10 font-bold px-2">
          This will permenantly remove the game from your list. <br/>
          <strong className="text-black dark:text-white text-base mt-2 block italic opacity-80">{gameToDelete.name}</strong>
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <button onClick={() => setGameToDelete(null)}
            className="w-full py-4 sm:py-3 bg-white/50 dark:bg-black/50 border-2 border-black/20 dark:border-white/20 text-black/60 hover:text-black dark:text-white/60 hover:dark:text-white rounded-2xl sm:rounded-xl font-extrabold uppercase tracking-widest transition-all shadow-sm hover:shadow-brutal-sm active:translate-y-0 active:shadow-none order-2 sm:order-1"
          >Cancel</button>
          <button onClick={confirmDeleteGame}
            className="w-full py-4 sm:py-3 bg-[#ff4a4a] text-black brutal-btn rounded-2xl sm:rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-2 order-1 sm:order-2 active:scale-95"
          >Yes, Delete</button>
        </div>
      </div>
    </div>
  );
}
