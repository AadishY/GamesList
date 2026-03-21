import { AlertTriangle, Trash2, X } from 'lucide-react';

export default function DeleteWarningModal({ isOpen, onClose, onConfirm, itemName = "this item" }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 bg-black/60 dark:bg-black/80 backdrop-blur-md">
      <div className="glass-panel w-full max-w-sm flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 shadow-brutal-xl border-[3px] border-[#ff4a4a]/40 bg-white/10 dark:bg-black/50">
        
        <div className="p-5 sm:p-6 flex flex-col items-center text-center gap-4">
          <div className="bg-[#ff4a4a] text-black p-4 rounded-full border-2 border-black shadow-brutal-sm mb-2">
            <AlertTriangle className="w-8 h-8" />
          </div>
          
          <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tighter">Are you sure?</h2>
          <p className="text-black/60 dark:text-white/60 font-bold text-sm">
            You are about to delete <span className="text-black dark:text-white font-extrabold uppercase">{itemName}</span>. This action cannot be undone.
          </p>
        </div>

        <div className="p-4 sm:p-5 flex gap-3 bg-black/5 dark:bg-white/5 border-t-2 border-black/10 dark:border-white/10">
          <button onClick={onClose}
            className="flex-1 py-3 px-4 bg-white/20 dark:bg-black/20 hover:bg-black/10 dark:hover:bg-white/10 text-black dark:text-white border-2 border-black/20 dark:border-white/20 rounded-xl font-black uppercase tracking-widest text-xs transition-colors active:scale-95 flex justify-center items-center gap-2"
          >
            <X className="w-4 h-4" /> Cancel
          </button>
          
          <button onClick={() => { onConfirm(); onClose(); }}
            className="flex-1 py-3 px-4 bg-[#ff4a4a] text-black border-2 border-black hover:bg-[#ff4a4a]/90 brutal-btn rounded-xl font-black uppercase tracking-widest text-xs transition-all active:scale-95 flex justify-center items-center gap-2"
          >
            <Trash2 className="w-4 h-4" /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}
