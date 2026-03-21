import { useState } from 'react';
import { ArrowLeft, Plus, Settings2, Link as LinkIcon, Calendar, Info, Trash2 } from 'lucide-react';
import ModAddModal from './ModAddModal'; 
import DeleteWarningModal from './DeleteWarningModal';

export default function ModGameView({ gameEntry, goBack, updateFirebaseMod }) {
  const [showAddMod, setShowAddMod] = useState(false);
  const [changelogMod, setChangelogMod] = useState(null);
  const [modToDelete, setModToDelete] = useState(null);

  const modsList = gameEntry.modsList || [];

  const performDeleteMod = (modId) => {
    updateFirebaseMod(gameEntry.id, (m) => ({
      ...m,
      modsList: m.modsList.filter(mod => mod.id !== modId)
    }));
  };

  return (
    <div className="flex-1 w-full flex flex-col pt-4 sm:pt-6 animate-in fade-in transition-colors relative">
      <div className="max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-32">
        
        {/* Header styling similar to SharedList */}
        <div className="glass-panel-flat p-4 sm:p-5 rounded-[2rem] flex flex-col sm:flex-row items-stretch sm:items-center gap-5 mb-8 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <img src={gameEntry.gameImageUrl} alt="bg" className="w-full h-full object-cover blur-md" />
          </div>
          <div className="relative z-10 flex flex-1 items-center justify-between gap-4 pl-1">
            <div className="flex items-center gap-4">
              <button onClick={goBack}
                className="p-3.5 sm:p-3 bg-white/50 dark:bg-white/10 rounded-2xl sm:rounded-xl border-2 border-black/10 dark:border-white/20 shadow-sm hover:-translate-y-1 hover:shadow-brutal-sm active:translate-y-0 active:shadow-none transition-all"
              ><ArrowLeft className="w-5 h-5 pointer-events-none" /></button>
              <div className="flex flex-col">
                <h2 className="text-xl sm:text-2xl font-black tracking-tighter uppercase leading-none">{gameEntry.gameName} Mods</h2>
                <p className="text-[10px] text-black/50 dark:text-white/50 font-extrabold uppercase tracking-[0.2em] mt-1.5 ml-0.5">{modsList.length} Installed</p>
              </div>
            </div>
            
          </div>
        </div>

        {modsList.length === 0 ? (
          <div className="text-center py-20 glass-panel rounded-[2rem] border-dashed">
            <Settings2 className="w-16 h-16 mx-auto text-black/20 dark:text-white/20 mb-5" />
            <h3 className="text-2xl font-black text-black/60 dark:text-white/60 uppercase tracking-tighter">No mods installed</h3>
            <p className="text-black/40 dark:text-white/40 font-bold mt-2 text-xs uppercase tracking-widest max-w-[200px] mx-auto leading-relaxed">Add a mod to enhance your game.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {modsList.map((mod) => (
              <div key={mod.id} className="group glass-panel-flat p-4 sm:p-5 flex flex-col sm:flex-row gap-4 hover:shadow-brutal transition-all items-start sm:items-center">
                <img 
                  src={mod.image || `https://placehold.co/100x100/1a1a1a/8b5cf6?text=${encodeURIComponent(mod.name)}`} 
                  alt={mod.name} 
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border-2 border-black/10 dark:border-white/10 flex-shrink-0"
                />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-extrabold text-lg sm:text-xl truncate tracking-tight uppercase" title={mod.name}>{mod.name}</h3>
                    <span className="bg-neon-yellow text-black px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest border border-black/10">v{mod.version || '1.0'}</span>
                  </div>
                  <p className="text-sm text-black/60 dark:text-white/60 font-bold line-clamp-2">{mod.description || 'No description provided.'}</p>
                  
                  <div className="flex flex-wrap items-center gap-3 mt-3">
                    {mod.lastUpdated && (
                      <div className="flex items-center gap-1.5 text-xs text-black/40 dark:text-white/40 font-bold">
                        <Calendar className="w-3.5 h-3.5" /> Updated {mod.lastUpdated}
                      </div>
                    )}
                    {mod.changelog && (
                      <button onClick={() => setChangelogMod(mod)} className="flex items-center gap-1.5 text-xs text-neon-purple hover:underline font-bold uppercase tracking-widest">
                        <Info className="w-3.5 h-3.5" /> Changelog
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex sm:flex-col gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                  {mod.link && (
                     <a href={mod.link} target="_blank" rel="noreferrer"
                       className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-neon-cyan brutal-btn px-4 py-2 sm:py-3 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest"
                     >
                       <LinkIcon className="w-3.5 h-3.5" /> Nexus
                     </a>
                  )}
                  <button onClick={() => setModToDelete(mod)}
                    className="flex items-center justify-center p-2 sm:p-3 bg-white/10 hover:bg-[#ff4a4a] text-black/40 dark:text-white/40 hover:text-white rounded-xl transition-colors border-2 border-transparent hover:border-black dark:hover:border-white"
                  >
                    <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <button onClick={() => setShowAddMod(true)}
        className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 bg-neon-purple text-black px-6 py-5 sm:py-4 rounded-2xl sm:rounded-[1.5rem] brutal-btn font-extrabold uppercase tracking-widest text-lg transition-all flex items-center justify-center gap-3 z-50 pointer-events-auto active:scale-95"
      >
        <Plus className="w-7 h-7 sm:w-6 sm:h-6 border-2 border-black rounded-md p-0.5 bg-white shadow-brutal-sm" />
        <span className="hidden sm:inline-block">Add Mod</span>
      </button>

      {showAddMod && (
         <ModAddModal 
           gameEntry={gameEntry}
           updateFirebaseMod={updateFirebaseMod}
           onClose={() => setShowAddMod(false)}
         />
      )}

      {changelogMod && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm shadow-brutal-lg">
          <div className="glass-panel w-full max-w-lg p-6 flex flex-col gap-4">
            <h3 className="text-xl font-black uppercase tracking-tight">Changelog: {changelogMod.name}</h3>
            <div className="max-h-64 overflow-y-auto text-sm text-black/80 dark:text-white/80 p-4 bg-black/5 dark:bg-white/5 rounded-xl border border-black/10 dark:border-white/10 whitespace-pre-wrap">
              {changelogMod.changelog || 'No changelog details.'}
            </div>
            <button onClick={() => setChangelogMod(null)} className="w-full bg-black text-white px-4 py-3 rounded-xl font-black uppercase tracking-widest hover:bg-neon-pink hover:text-black transition-colors border border-white/20 hover:border-black mt-2">
              Close
            </button>
          </div>
        </div>
      )}

      <DeleteWarningModal 
        isOpen={!!modToDelete} 
        onClose={() => setModToDelete(null)} 
        onConfirm={() => performDeleteMod(modToDelete?.id)} 
        itemName={modToDelete?.name} 
      />

    </div>
  );
}
