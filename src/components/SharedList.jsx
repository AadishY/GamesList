import React, { useState, useMemo, useRef } from 'react';
import { ArrowLeft, Plus, Gamepad2 } from 'lucide-react';
import SharedListGameCard from './SharedListGameCard';
import SharedListAddModal from './SharedListAddModal';

export default function SharedList({ games, setGames, activeProfile, goBack }) {
  const [filter, setFilter] = useState('All'); // 'All', 'Main', 'Side'
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Drag and Drop refs
  const dragItem = useRef(null);
  const dragOverItem = useRef(null);

  const sharedGames = useMemo(() => {
    const list = games.filter(g => g.sharedList);
    
    if (filter === 'All') {
      return list.sort((a, b) => {
        const aBoth = (a.sharedList.upvotes || []).length >= 2;
        const bBoth = (b.sharedList.upvotes || []).length >= 2;
        if (aBoth && !bBoth) return -1;
        if (!aBoth && bBoth) return 1;
        return a.name.localeCompare(b.name);
      });
    } else {
      return list
        .filter(g => g.sharedList.type === filter)
        .sort((a, b) => (a.sharedList.order || 0) - (b.sharedList.order || 0));
    }
  }, [games, filter]);

  const handleDragStart = (e, idx) => {
    if (filter === 'All') return;
    dragItem.current = idx;
    // For firefox styling compatibility
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnter = (e, idx) => {
    if (filter === 'All') return;
    dragOverItem.current = idx;
  };

  const handleDragEnd = () => {
    if (filter === 'All') return;
    if (dragItem.current === null || dragOverItem.current === null) return;
    if (dragItem.current === dragOverItem.current) return;

    const copy = [...sharedGames];
    const dragged = copy[dragItem.current];
    copy.splice(dragItem.current, 1);
    copy.splice(dragOverItem.current, 0, dragged);

    // Update global game order relative to this filter view
    const copyIds = copy.map(c => c.id);
    setGames(prev => prev.map(game => {
      const newOrderIndex = copyIds.indexOf(game.id);
      if (newOrderIndex > -1) {
        return {
          ...game,
          sharedList: { ...game.sharedList, order: newOrderIndex }
        };
      }
      return game;
    }));

    dragItem.current = null;
    dragOverItem.current = null;
  };

  const canEdit = activeProfile !== 'Combined';

  return (
    <div className="flex-1 w-full flex flex-col pt-4 sm:pt-8 bg-slate-50 dark:bg-[#020617] animate-in fade-in transition-colors relative">
      <div className="max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={goBack}
              className="p-3 bg-white hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 rounded-xl transition-all shadow-sm border border-slate-200 dark:border-white/5 active:scale-95 text-slate-700 dark:text-slate-300"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white transition-colors">Shared Playlist</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Games we wanted to play together</p>
            </div>
          </div>
          
          <div className="bg-white/60 dark:bg-slate-900/50 backdrop-blur-sm rounded-2xl p-1.5 border border-slate-200 dark:border-white/5 flex gap-1 transition-colors w-full sm:w-auto">
            {['All', 'Main', 'Side'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-1 sm:flex-none px-6 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  filter === f 
                    ? 'bg-indigo-100/60 text-indigo-700 border border-indigo-200 dark:bg-indigo-500/20 dark:text-indigo-300 shadow-sm dark:border-indigo-500/30' 
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-white/5 border border-transparent'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* List Content */}
        {sharedGames.length === 0 ? (
          <div className="text-center py-20 bg-white/60 dark:bg-slate-900/30 backdrop-blur-sm rounded-3xl border border-slate-300 dark:border-white/5 border-dashed transition-colors">
            <Gamepad2 className="w-16 h-16 mx-auto text-slate-400 dark:text-slate-600 mb-5" />
            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-300 tracking-tight">List is empty</h3>
            <p className="text-slate-500 mt-2 max-w-sm mx-auto">
              Add games from your library to the shared playlist to start tracking!
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
             <div className="mb-2 px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
               {filter === 'All' ? 'Sorting Alphabetically / High Priority first' : 'Drag to reorder playlist'}
             </div>
             {sharedGames.map((game, idx) => (
               <SharedListGameCard
                 key={game.id}
                 game={game}
                 activeProfile={activeProfile}
                 setGames={setGames}
                 viewFilter={filter}
                 draggable={filter !== 'All'}
                 index={idx}
                 onDragStart={(e) => handleDragStart(e, idx)}
                 onDragEnter={(e) => handleDragEnter(e, idx)}
                 onDragEnd={handleDragEnd}
               />
             ))}
          </div>
        )}
      </div>

      {canEdit && (
        <button 
          onClick={() => setShowAddModal(true)}
          className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 bg-pink-600 hover:bg-pink-500 text-white px-5 sm:px-6 py-4 rounded-full shadow-[0_10px_30px_rgba(219,39,119,0.4)] hover:shadow-[0_15px_40px_rgba(219,39,119,0.5)] font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-3 z-50 active:scale-95 border border-pink-400"
        >
          <Plus className="w-6 h-6" />
          <span className="hidden sm:inline-block">Add Game</span>
        </button>
      )}

      {showAddModal && (
        <SharedListAddModal
          games={games}
          setGames={setGames}
          activeProfile={activeProfile}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
}
