import { useState, useMemo, useRef } from 'react';
import { ArrowLeft, Plus, Gamepad2 } from 'lucide-react';
import SharedListGameCard from './SharedListGameCard';
import SharedListAddModal from './SharedListAddModal';

export default function SharedList({ games, setGames, activeProfile, goBack }) {
  const [filter, setFilter] = useState('Main');
  const [showAddModal, setShowAddModal] = useState(false);
  
  const dragItem = useRef(null);
  const dragOverItem = useRef(null);

  const sharedGames = useMemo(() => {
    const list = games.filter(g => g.sharedList && g.sharedList.type === filter);
    return list.sort((a, b) => (a.sharedList.order || 0) - (b.sharedList.order || 0));
  }, [games, filter]);

  const handleDragStart = (e, idx) => { dragItem.current = idx; e.dataTransfer.effectAllowed = 'move'; };
  const handleDragEnter = (e, idx) => { dragOverItem.current = idx; };
  const handleDragEnd = () => {
    if (dragItem.current === null || dragOverItem.current === null || dragItem.current === dragOverItem.current) return;
    const copy = [...sharedGames]; const dragged = copy[dragItem.current]; copy.splice(dragItem.current, 1); copy.splice(dragOverItem.current, 0, dragged);
    const copyIds = copy.map(c => c.id);
    setGames(prev => prev.map(game => { const i = copyIds.indexOf(game.id); return i > -1 ? { ...game, sharedList: { ...game.sharedList, order: i } } : game; }));
    dragItem.current = null; dragOverItem.current = null;
  };

  const canEdit = activeProfile !== 'Combined';
  const pillClass = (active) => `flex-1 sm:flex-none px-6 py-3 sm:px-5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-extrabold uppercase tracking-widest transition-all flex items-center justify-center ${
    active ? 'bg-neon-purple brutal-btn' : 'bg-transparent border-2 border-transparent hover:border-black/20 dark:hover:border-white/20 text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white'
  }`;

  return (
    <div className="flex-1 w-full flex flex-col pt-4 sm:pt-6 animate-in fade-in transition-colors relative">
      <div className="max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-32">
        
        <div className="glass-panel-flat p-4 sm:p-5 rounded-[2rem] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-5 mb-8">
          <div className="flex items-center gap-4 pl-1">
            <button onClick={goBack}
              className="p-3.5 sm:p-3 bg-white/50 dark:bg-white/10 rounded-2xl sm:rounded-xl border-2 border-black/10 dark:border-white/20 shadow-sm hover:-translate-y-1 hover:shadow-brutal-sm active:translate-y-0 active:shadow-none transition-all"
            ><ArrowLeft className="w-5 h-5 pointer-events-none" /></button>
            <div className="flex flex-col">
              <h2 className="text-xl sm:text-2xl font-black tracking-tighter uppercase leading-none">Shared List</h2>
              <p className="text-[10px] text-black/50 dark:text-white/50 font-extrabold uppercase tracking-[0.2em] mt-1.5 ml-0.5">Games for us</p>
            </div>
          </div>
          <div className="bg-white/40 dark:bg-black/40 rounded-2xl p-1.5 border-2 border-black/5 dark:border-white/10 flex gap-1.5 w-full sm:w-auto overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {['Main', 'Side'].map(f => (
              <button key={f} onClick={() => setFilter(f)} className={pillClass(filter === f)}>{f}</button>
            ))}
          </div>
        </div>

        {sharedGames.length === 0 ? (
          <div className="text-center py-20 glass-panel rounded-[2rem] border-dashed">
            <Gamepad2 className="w-16 h-16 mx-auto text-black/20 dark:text-white/20 mb-5" />
            <h3 className="text-2xl font-black text-black/60 dark:text-white/60 uppercase tracking-tighter">List is empty</h3>
            <p className="text-black/40 dark:text-white/40 font-bold mt-2 text-xs uppercase tracking-widest max-w-[200px] mx-auto leading-relaxed">Add games from your library below.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="px-3 text-[10px] font-extrabold text-black/40 dark:text-white/40 uppercase tracking-[0.2em] mb-1 pl-4">
              Drag to Reorder
            </div>
            {sharedGames.map((game, idx) => (
              <SharedListGameCard key={game.id} game={game} activeProfile={activeProfile} setGames={setGames} viewFilter={filter}
                draggable index={idx}
                onDragStart={(e) => handleDragStart(e, idx)} onDragEnter={(e) => handleDragEnter(e, idx)} onDragEnd={handleDragEnd}
              />
            ))}
          </div>
        )}
      </div>

      {canEdit && (
        <button onClick={() => setShowAddModal(true)}
          className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 bg-neon-yellow text-black px-6 py-5 sm:py-4 rounded-2xl sm:rounded-[1.5rem] brutal-btn font-extrabold uppercase tracking-widest text-lg transition-all flex items-center justify-center gap-3 z-50 pointer-events-auto active:scale-95"
        >
          <Plus className="w-7 h-7 sm:w-6 sm:h-6 border-2 border-black rounded-md p-0.5 bg-white shadow-brutal-sm" />
          <span className="hidden sm:inline-block">Add Game</span>
        </button>
      )}

      {showAddModal && (
        <SharedListAddModal games={games} setGames={setGames} activeProfile={activeProfile} onClose={() => setShowAddModal(false)} />
      )}
    </div>
  );
}
