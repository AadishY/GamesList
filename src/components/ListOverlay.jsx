import { X, Gamepad2, Settings } from 'lucide-react';

export default function ListOverlay({ onClose, onSelectGames, onSelectMods }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      <div className="relative glass-panel w-full max-w-sm p-6 sm:p-8 flex flex-col items-center gap-6 animate-in zoom-in-95 duration-200">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-black/5 dark:bg-white/10 hover:bg-[#ff4a4a] hover:text-white rounded-xl transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        
        <h2 className="text-xl sm:text-2xl font-black uppercase tracking-widest text-center mt-2">
          Select View
        </h2>
        
        <div className="flex flex-col gap-4 w-full">
          <button 
            onClick={onSelectGames}
            className="group relative bg-neon-purple text-black brutal-btn p-8 rounded-3xl w-full flex items-center gap-5 overflow-hidden outline-none transition-all hover:scale-[1.02]"
          >
            <div className="p-3 bg-white rounded-xl border-2 border-black shadow-brutal-sm group-hover:-rotate-12 transition-transform">
              <Gamepad2 className="w-8 h-8" />
            </div>
            <span className="text-2xl sm:text-3xl font-black uppercase tracking-tight leading-none mt-1">Games List</span>
          </button>
          
          <button 
            onClick={onSelectMods}
            className="group relative bg-neon-cyan text-black brutal-btn p-8 rounded-3xl w-full flex items-center gap-5 overflow-hidden outline-none transition-all hover:scale-[1.02]"
          >
            <div className="p-3 bg-white rounded-xl border-2 border-black shadow-brutal-sm group-hover:rotate-12 transition-transform">
              <Settings className="w-8 h-8" />
            </div>
            <span className="text-2xl sm:text-3xl font-black uppercase tracking-tight leading-none mt-1">Mods Library</span>
          </button>
        </div>
      </div>
    </div>
  );
}
