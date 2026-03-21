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

      <div className="glass-panel max-w-sm w-full p-8 sm:p-10 flex flex-col items-center shadow-brutal-lg animate-scale-spring relative z-10">
        
        <div className="bg-neon-pink brutal-btn p-5 rounded-2xl mb-6 flex items-center justify-center shadow-pink tactile-logo">
          <Gamepad2 className="w-12 h-12 text-black" />
        </div>

        <h1 className="text-3xl font-black text-center mb-1 tracking-tighter uppercase text-black dark:text-white animate-fade-scale" style={{ animationDelay: '80ms' }}>Enter Player</h1>
        <p className="text-black/60 dark:text-white/50 text-[10px] text-center mb-8 font-extrabold uppercase tracking-[0.2em] animate-fade-scale" style={{ animationDelay: '120ms' }}>Select your profile</p>
        
        <div className="space-y-4 w-full">
          <button 
            onClick={() => handleLogin('Aadish')}
            className={`w-full py-4 px-6 bg-neon-yellow brutal-btn rounded-2xl text-lg flex items-center justify-center gap-3 animate-stagger-enter transition-transform touch-manipulation ${clicked === 'Aadish' ? 'scale-90 opacity-70' : 'active:scale-95'}`}
            style={{ animationDelay: '150ms' }}
            disabled={!!clicked}
          >
            <User className="w-6 h-6" />
            <span>Aadish</span>
          </button>
          
          <button 
            onClick={() => handleLogin('Aditya')}
            className={`w-full py-4 px-6 bg-neon-orange brutal-btn rounded-2xl text-lg flex items-center justify-center gap-3 animate-stagger-enter transition-transform touch-manipulation ${clicked === 'Aditya' ? 'scale-90 opacity-70' : 'active:scale-95'}`}
            style={{ animationDelay: '200ms' }}
            disabled={!!clicked}
          >
            <User className="w-6 h-6" />
            <span>Aditya</span>
          </button>

          <div className="pt-6 relative animate-fade-scale" style={{ animationDelay: '250ms' }}>
            <div className="absolute inset-0 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
              <div className="w-full border-t-2 border-black/15 dark:border-white/10 border-dashed"></div>
            </div>
            <div className="relative flex justify-center text-[10px]">
              <span className="bg-[#f4f4f5] dark:bg-[#09090b] px-3 py-1 text-black/70 dark:text-white/50 font-extrabold uppercase tracking-widest border-2 border-black/15 dark:border-white/20 rounded-lg">Or</span>
            </div>
          </div>

          <button 
            onClick={() => handleLogin('Combined')}
            className={`w-full mt-4 py-4 px-6 bg-neon-purple brutal-btn rounded-2xl text-lg flex items-center justify-center gap-3 animate-stagger-enter transition-transform touch-manipulation ${clicked === 'Combined' ? 'scale-90 opacity-70' : 'active:scale-95'}`}
            style={{ animationDelay: '300ms' }}
            disabled={!!clicked}
          >
            <Users className="w-6 h-6" />
            <span>Combined</span>
          </button>
        </div>
      </div>
    </div>
  );
}
