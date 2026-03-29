import { useState } from 'react';
import { Gamepad2, User, Users, Sun, Moon, Sword, Trophy, Target, Zap, Dices, Ghost, Joystick, Rocket, Star, Crown } from 'lucide-react';

export default function ProfileSelector({ loginAs, theme, toggleTheme }) {
  const [clicked, setClicked] = useState(null);

  const handleLogin = (profile) => {
    setClicked(profile);
    setTimeout(() => loginAs(profile), 150);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 font-sans overflow-hidden relative">
      
      {/* ── Desktop-only floating background elements ── */}
      <div className="hidden sm:block absolute inset-0 overflow-hidden pointer-events-none select-none" aria-hidden="true">
        {/* Floating shapes with vibrant glow */}
        <div className="absolute top-[8%] left-[5%] w-24 h-24 bg-neon-yellow/30 dark:bg-neon-yellow/20 border-2 border-black/10 dark:border-white/10 rounded-2xl rotate-12 profile-bg-float-alt profile-bg-click profile-bg-hover pointer-events-auto cursor-help transition-all" style={{ animationDelay: '0s', '--r': '12deg' }}></div>
        <div className="absolute top-[18%] right-[8%] w-32 h-32 bg-neon-pink/15 dark:bg-neon-pink/15 border-2 border-black/10 dark:border-white/10 rounded-full profile-bg-float profile-bg-click profile-bg-hover pointer-events-auto cursor-help transition-all" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute bottom-[12%] left-[12%] w-20 h-20 bg-neon-cyan/30 dark:bg-neon-cyan/25 border-2 border-black/10 dark:border-white/10 rounded-xl -rotate-6 profile-bg-float-alt profile-bg-click profile-bg-hover pointer-events-auto cursor-help transition-all" style={{ animationDelay: '3s', '--r': '-6deg' }}></div>
        <div className="absolute bottom-[22%] right-[5%] w-16 h-16 bg-neon-purple/30 dark:bg-neon-purple/25 border-2 border-black/10 dark:border-white/10 rounded-2xl rotate-45 profile-bg-float profile-bg-click profile-bg-hover pointer-events-auto cursor-help transition-all" style={{ animationDelay: '2s', '--r': '45deg' }}></div>
        
        {/* 🎮 Major Gaming Icons - Large & Colorful with Unique Animations */}
        <div className="absolute top-[12%] right-[22%] text-neon-pink/40 dark:text-neon-pink/35 profile-anim-sword profile-bg-click profile-bg-hover pointer-events-auto cursor-help transition-all" style={{ animationDelay: '2.5s' }}>
          <Sword className="w-16 h-16" strokeWidth={2.5} />
        </div>
        <div className="absolute bottom-[18%] left-[22%] text-neon-yellow/40 dark:text-neon-yellow/35 profile-anim-trophy profile-bg-click profile-bg-hover pointer-events-auto cursor-help transition-all" style={{ animationDelay: '1s' }}>
          <Trophy className="w-20 h-20" strokeWidth={2.5} />
        </div>
        <div className="absolute top-[32%] right-[4%] text-neon-cyan/40 dark:text-neon-cyan/35 profile-anim-target profile-bg-click profile-bg-hover pointer-events-auto cursor-help transition-all" style={{ animationDelay: '3.5s' }}>
          <Target className="w-14 h-14" strokeWidth={2.5} />
        </div>
        <div className="absolute bottom-[38%] left-[4%] text-neon-purple/40 dark:text-neon-purple/35 profile-anim-zap profile-bg-click profile-bg-hover pointer-events-auto cursor-help transition-all" style={{ animationDelay: '4.5s' }}>
          <Zap className="w-14 h-14" strokeWidth={2.5} />
        </div>

        <div className="absolute top-[58%] left-[8%] text-neon-green/40 dark:text-neon-green/35 profile-anim-dice profile-bg-click profile-bg-hover pointer-events-auto cursor-help transition-all" style={{ animationDelay: '1.2s' }}>
          <Dices className="w-16 h-16" strokeWidth={2.5} />
        </div>
        <div className="absolute top-[78%] right-[18%] text-neon-orange/40 dark:text-neon-orange/35 profile-anim-ghost profile-bg-click profile-bg-hover pointer-events-auto cursor-help transition-all" style={{ animationDelay: '5s' }}>
          <Ghost className="w-16 h-16" strokeWidth={2.5} />
        </div>
        <div className="absolute top-[5%] right-[35%] text-neon-cyan/35 dark:text-neon-cyan/30 profile-anim-joystick profile-bg-click profile-bg-hover pointer-events-auto cursor-help transition-all" style={{ animationDelay: '0.5s' }}>
          <Joystick className="w-18 h-18" strokeWidth={2.5} />
        </div>
        <div className="absolute bottom-[5%] left-[42%] text-neon-pink/40 dark:text-neon-pink/35 profile-anim-rocket profile-bg-click profile-bg-hover pointer-events-auto cursor-help transition-all" style={{ animationDelay: '3.8s' }}>
          <Rocket className="w-14 h-14" strokeWidth={2.5} />
        </div>
        
        {/* Subtle detail icons */}
        <div className="absolute top-[48%] right-[28%] text-neon-yellow/30 dark:text-neon-yellow/20 profile-bg-float profile-bg-click profile-bg-hover pointer-events-auto cursor-help transition-all" style={{ animationDelay: '2.2s' }}>
          <Star className="w-10 h-10 fill-current" />
        </div>
        <div className="absolute top-[22%] left-[32%] text-neon-yellow/30 dark:text-neon-yellow/20 profile-bg-float profile-bg-click profile-bg-hover pointer-events-auto cursor-help transition-all" style={{ animationDelay: '4.2s', '--r': '-12deg' }}>
          <Crown className="w-12 h-12 -rotate-12 fill-current" />
        </div>
      </div>

      {/* Theme toggle */}
      <div className="absolute top-4 right-4 md:top-6 md:right-6 z-50 animate-fade-scale" style={{ animationDelay: '300ms' }}>
        <button 
          onClick={toggleTheme}
          className="p-3 bg-neon-cyan brutal-btn rounded-xl"
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Moon className="w-6 h-6 text-black" /> : <Sun className="w-6 h-6 text-black" />}
        </button>
      </div>

      <div className="glass-panel max-w-sm w-full p-6 sm:p-8 flex flex-col items-center shadow-brutal-lg animate-scale-spring relative z-10 transition-all border-2 border-black dark:border-white/10">
        
        <div className="bg-neon-pink brutal-btn p-4 rounded-2xl mb-4 flex items-center justify-center shadow-pink tactile-logo">
          <Gamepad2 className="w-10 h-10 text-black" />
        </div>

        <h1 className="text-2xl font-black text-center mb-1 tracking-tighter uppercase text-black dark:text-white animate-fade-scale" style={{ animationDelay: '80ms' }}>Enter Player</h1>
        <p className="text-black/60 dark:text-white/50 text-[9px] text-center mb-5 font-extrabold uppercase tracking-[.2em] animate-fade-scale" style={{ animationDelay: '120ms' }}>Select your profile</p>
        
        <div className="space-y-3 w-full">
          <button 
            onClick={() => handleLogin('Aadish')}
            className={`w-full py-3 px-6 bg-neon-yellow brutal-btn rounded-2xl text-lg flex items-center justify-center gap-3 animate-stagger-enter transition-transform touch-manipulation ${clicked === 'Aadish' ? 'scale-90 opacity-70' : 'active:scale-95'}`}
            style={{ animationDelay: '150ms' }}
            disabled={!!clicked}
          >
            <User className="w-5 h-5" />
            <span className="font-extrabold uppercase tracking-tight">Aadish</span>
          </button>
          
          <button 
            onClick={() => handleLogin('Aditya')}
            className={`w-full py-3 px-6 bg-neon-orange brutal-btn rounded-2xl text-lg flex items-center justify-center gap-3 animate-stagger-enter transition-transform touch-manipulation ${clicked === 'Aditya' ? 'scale-90 opacity-70' : 'active:scale-95'}`}
            style={{ animationDelay: '200ms' }}
            disabled={!!clicked}
          >
            <User className="w-5 h-5" />
            <span className="font-extrabold uppercase tracking-tight">Aditya</span>
          </button>

          <div className="pt-2 relative animate-fade-scale" style={{ animationDelay: '250ms' }}>
            <div className="absolute inset-0 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
              <div className="w-full border-t-2 border-black/10 dark:border-white/5 border-dashed"></div>
            </div>
            <div className="relative flex justify-center text-[9px]">
              <span className="bg-[#f4f4f5] dark:bg-[#09090b] px-3 py-0.5 text-black/50 dark:text-white/40 font-extrabold uppercase tracking-widest border border-black/10 dark:border-white/10 rounded-full">Or</span>
            </div>
          </div>

          <button 
            onClick={() => handleLogin('Combined')}
            className={`w-full py-3 px-6 bg-neon-purple brutal-btn rounded-2xl text-lg flex items-center justify-center gap-3 animate-stagger-enter transition-transform touch-manipulation ${clicked === 'Combined' ? 'scale-90 opacity-70' : 'active:scale-95'}`}
            style={{ animationDelay: '300ms' }}
            disabled={!!clicked}
          >
            <Users className="w-5 h-5" />
            <span className="font-extrabold uppercase tracking-tight">Combined</span>
          </button>

          <div className="pt-3 relative animate-fade-scale" style={{ animationDelay: '350ms' }}>
            <div className="absolute inset-0 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
              <div className="w-full border-t-2 border-black/10 dark:border-white/5 border-dashed"></div>
            </div>
            <div className="relative flex justify-center text-[9px]">
              <span className="bg-[#f4f4f5] dark:bg-[#09090b] px-3 py-0.5 text-black/50 dark:text-white/40 font-extrabold uppercase tracking-widest border border-black/10 dark:border-white/10 rounded-full">Database</span>
            </div>
          </div>

          <button 
            onClick={() => window.location.href = '/coopgames.html'}
            className="w-full brutal-btn bg-cyan-400 dark:bg-cyan-500 py-3 rounded-2xl flex flex-col items-center justify-center gap-1 group animate-stagger-enter hover:bg-cyan-300 dark:hover:bg-cyan-400 transform hover:-translate-y-1 active:translate-y-0 transition-all shadow-[4px_4px_0px_#000] border-2 border-black"
            style={{ animationDelay: '400ms' }}
          >
            <div className="flex items-center gap-2">
              <Gamepad2 size={20} className="group-hover:rotate-12 transition-transform" />
              <span className="font-black text-base uppercase tracking-tighter">Co-Op Multiplayer Mods</span>
            </div>
            <span className="text-[9px] font-black opacity-60 uppercase tracking-widest">Global Standalone Database</span>
          </button>
        </div>
      </div>
    </div>
  );
}
