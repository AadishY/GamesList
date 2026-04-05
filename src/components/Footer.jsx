import { Gamepad2, Heart } from 'lucide-react';

export default function Footer({ activeProfile, isModPage, theme }) {
  const profileIdMap = {
    'aadish': '5717',
    'combined': '8102',
    'aditya': '3921',
    'coopmod': '4422'
  };

  const nameKey = isModPage ? 'coopmod' : (activeProfile?.toLowerCase() || 'aadish');
  const uniqueId = profileIdMap[nameKey] || '0000';
  const badgeUrl = `https://aadishcounter.vercel.app/@${nameKey}:${uniqueId}?theme=random-animation&padding=7&crop=true&count-view=true`;

  return (
    <footer className="mt-auto p-4 sm:p-6 w-full pointer-events-none mb-16 sm:mb-0">
      <div className="max-w-fit mx-auto pointer-events-auto">
        <div className="glass-panel-flat rounded-full px-4 py-2.5 flex items-center justify-center gap-4 shadow-brutal transition-all hover:shadow-brutal-lg">
          <div className="flex items-center gap-2">
            <Gamepad2 className="w-4 h-4 opacity-50" />
            <p className="flex items-center gap-1.5 text-[10px] sm:text-xs font-black uppercase tracking-widest text-black/80 dark:text-white/80">
              Made with 
              <span className="bg-neon-pink p-1 rounded border border-black shadow-brutal-sm inline-flex">
                <Heart className="w-3 h-3 text-black fill-current" />
              </span> 
              by Aadish
            </p>
          </div>
          
          <div className="h-6 w-px bg-black/10 dark:bg-white/10" />

          <div className="flex items-center gap-2 select-none group/views">
            <img src={badgeUrl} alt="Views" className="h-10 sm:h-11 drop-shadow-[1.5px_-1.5px_0px_rgba(0,0,0,1)] dark:drop-shadow-[1.5px_-1.5px_0px_rgba(255,255,255,0.4)] transition-transform group-hover/views:translate-y-[-2px]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-black/60 dark:text-white/60">VIEWS</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
