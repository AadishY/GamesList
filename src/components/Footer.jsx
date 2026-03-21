import { Gamepad2, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-auto p-4 sm:p-6 w-full pointer-events-none mb-16 sm:mb-0">
      <div className="max-w-xs mx-auto glass-panel-flat rounded-full px-4 py-2.5 flex items-center justify-center gap-2 shadow-brutal">
        <Gamepad2 className="w-4 h-4 opacity-50" />
        <p className="flex items-center gap-1.5 text-[10px] sm:text-xs font-black uppercase tracking-widest text-black/80 dark:text-white/80">
          Made with 
          <span className="bg-neon-pink p-1 rounded border border-black shadow-brutal-sm inline-flex">
            <Heart className="w-3 h-3 text-black fill-current" />
          </span> 
          by Aadish
        </p>
      </div>
    </footer>
  );
}
