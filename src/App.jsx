import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Gamepad2, 
  ListPlus, 
  CheckCircle2, 
  Circle, 
  Trash2, 
  Users, 
  User, 
  Search,
  ExternalLink,
  AlertCircle,
  Loader2,
  ShieldAlert,
  Pencil,
  Cloud,
  ArrowUpDown
} from 'lucide-react';

export default function App() {
  // App State
  const [games, setGames] = useState(() => {
    const saved = localStorage.getItem('steam-tracker-local');
    return saved ? JSON.parse(saved) : [];
  });
  const [urlInput, setUrlInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Modals
  const [pendingGame, setPendingGame] = useState(null);
  const [editingGame, setEditingGame] = useState(null);
  const [gameToDelete, setGameToDelete] = useState(null); 
  
  // Filters & Sorting
  const [statusFilter, setStatusFilter] = useState('All');
  const [modeFilter, setModeFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [playerFilter, setPlayerFilter] = useState('All');
  const [sortOption, setSortOption] = useState('Newest');

  // Sync State
  const [syncStatus, setSyncStatus] = useState(''); 
  const isReadyForSync = useRef(false);

  // Profile State
  const [activeProfile, setActiveProfile] = useState(null);

  // 1. Metadata Injection
  useEffect(() => {
    document.title = "Steam Backlog";
    
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.name = 'description';
      document.head.appendChild(metaDescription);
    }
    metaDescription.content = "Track and manage your shared Steam game backlog seamlessly.";

    let themeColor = document.querySelector('meta[name="theme-color"]');
    if (!themeColor) {
      themeColor = document.createElement('meta');
      themeColor.name = 'theme-color';
      document.head.appendChild(themeColor);
    }
    themeColor.content = "#020617";
  }, []);

  // Save to local storage automatically
  useEffect(() => {
    localStorage.setItem('steam-tracker-local', JSON.stringify(games));
  }, [games]);

  // --- Profile Switching Helper ---
  const loginAs = (profile) => {
    setActiveProfile(profile);
    if (profile !== 'Combined') {
      setPlayerFilter(profile); 
    } else {
      setPlayerFilter('All');
    }
  };

  // --- GitHub Auto-Sync Functions ---
  const GITHUB_OWNER = 'AadishY';
  const GITHUB_REPO = 'GamesList';
  const FILE_PATH = 'games.json';

  const getGithubToken = () => {
    try {
      return import.meta.env.VITE_GITHUB_TOKEN || '';
    } catch (e) {
      return '';
    }
  };

  const pullFromGithub = async () => {
    const token = getGithubToken();
    if (!token) {
      setTimeout(() => { isReadyForSync.current = true; }, 500);
      return;
    }
    
    setSyncStatus('syncing');
    try {
      const response = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${FILE_PATH}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.v3+json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        const decodedContent = decodeURIComponent(escape(atob(data.content)));
        const parsedGames = JSON.parse(decodedContent);
        setGames(parsedGames);
      }
      setSyncStatus('saved');
    } catch (err) {
      console.error("GitHub Pull Error:", err);
      setSyncStatus('error');
    } finally {
      setTimeout(() => { isReadyForSync.current = true; }, 1000);
    }
  };

  const pushToGithub = async (currentGames) => {
    const token = getGithubToken();
    if (!token) return;

    setSyncStatus('syncing');

    try {
      let sha = null;
      const getResponse = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${FILE_PATH}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.v3+json' }
      });
      
      if (getResponse.ok) {
        const data = await getResponse.json();
        sha = data.sha;
      }

      const contentStr = JSON.stringify(currentGames, null, 2);
      const encodedContent = btoa(unescape(encodeURIComponent(contentStr)));

      const putResponse = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${FILE_PATH}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: `Auto-sync games list (${currentGames.length} games)`,
          content: encodedContent,
          ...(sha && { sha })
        })
      });

      if (!putResponse.ok) throw new Error('Failed to push to GitHub.');
      setSyncStatus('saved');
    } catch (err) {
      console.error("GitHub Push Error:", err);
      setSyncStatus('error');
    }
  };

  useEffect(() => {
    pullFromGithub();
  }, []);

  useEffect(() => {
    if (isReadyForSync.current) {
      const debounceTimer = setTimeout(() => {
        pushToGithub(games);
      }, 1000);
      return () => clearTimeout(debounceTimer);
    }
  }, [games]);

  // --- Game Parsing & Adding ---
  const extractGameInfo = (url) => {
    const match = url.match(/\/app\/(\d+)(?:\/([^\/?#]+))?/);
    if (!match) return null;
    return {
      appId: match[1],
      slugName: match[2] ? decodeURIComponent(match[2]).replace(/_/g, ' ') : null
    };
  };

  const fetchWithTimeout = async (resource, options = {}) => {
    const { timeout = 4000 } = options;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    const response = await fetch(resource, { ...options, signal: controller.signal });
    clearTimeout(id);
    return response;
  };

  const handleFetchGameDetails = async (e) => {
    e.preventDefault();
    setError('');
    
    if (activeProfile === 'Combined') return;
    if (!urlInput.trim()) { setError('Please enter a Steam URL'); return; }

    const info = extractGameInfo(urlInput);
    if (!info) { setError('Invalid Steam URL.'); return; }

    const { appId, slugName } = info;

    const existingGame = games.find(g => g.appId === appId);
    if (existingGame) {
      const addedBy = existingGame.addedBy || [];
      if (addedBy.includes(activeProfile)) {
        setError('This game is already in your list!');
        return;
      } else {
        setGames(games.map(g => g.appId === appId ? { ...g, addedBy: [...addedBy, activeProfile] } : g));
        setUrlInput('');
        return;
      }
    }

    setLoading(true);

    try {
      const apiUrl = `https://store.steampowered.com/api/appdetails?appids=${appId}`;
      const proxyUrl = `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(apiUrl)}`;
      
      const response = await fetchWithTimeout(proxyUrl, { timeout: 4000 });
      if (!response.ok) throw new Error('Proxy error');
      
      const steamData = await response.json();
      
      if (!steamData || !steamData[appId] || !steamData[appId].success) {
        throw new Error('Game not found or is age-restricted');
      }

      const details = steamData[appId].data;
      const isMultiplayer = details.categories?.some(c => 
        c.description.toLowerCase().includes('multi-player') || 
        c.description.toLowerCase().includes('co-op')
      );

      setPendingGame({
        appId: appId,
        name: details.name,
        imageUrl: details.header_image,
        steamUrl: urlInput,
        status: 'Wanted',
        mode: isMultiplayer ? 'Multiplayer' : 'Singleplayer'
      });
      
    } catch (err) {
      const fallbackName = slugName || `Steam Game ${appId}`;
      const fallbackImage = `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${appId}/header.jpg`;
      
      setPendingGame({
        appId: appId,
        name: fallbackName,
        imageUrl: fallbackImage,
        steamUrl: urlInput,
        status: 'Wanted',
        mode: 'Singleplayer'
      });
    } finally {
      setLoading(false);
    }
  };

  const confirmAddGame = () => {
    if (!pendingGame) return;
    setGames(prev => [{ 
      ...pendingGame, 
      id: crypto.randomUUID(), 
      addedAt: Date.now(),
      addedBy: [activeProfile]
    }, ...prev]);
    setPendingGame(null);
    setUrlInput('');
  };

  // --- Edit Actions ---
  const saveEditedGame = () => {
    if (activeProfile === 'Combined' || !editingGame) return;
    setGames(games.map(g => g.id === editingGame.id ? { ...editingGame } : g));
    setEditingGame(null);
  };

  const confirmDeleteGame = () => {
    if (activeProfile === 'Combined' || !gameToDelete) return; 

    setGames(prevGames => {
      return prevGames.map(g => {
        if (g.id === gameToDelete.id) {
          const newAddedBy = (g.addedBy || []).filter(p => p !== activeProfile);
          return { ...g, addedBy: newAddedBy };
        }
        return g;
      }).filter(g => g.addedBy && g.addedBy.length > 0); 
    });

    setGameToDelete(null);
  };

  // --- Highly Optimized Filtering & Sorting via useMemo ---
  const filteredGames = useMemo(() => {
    let result = games.filter(game => {
      if (activeProfile === 'Combined') return true;
      const addedBy = game.addedBy || [];
      if (playerFilter === 'Aadish') return addedBy.includes('Aadish');
      if (playerFilter === 'Aditya') return addedBy.includes('Aditya');
      if (playerFilter === 'Both') return addedBy.length === 2;
      return true;
    })
    .filter(game => statusFilter === 'All' || game.status === statusFilter)
    .filter(game => modeFilter === 'All' || game.mode === modeFilter)
    .filter(game => game.name.toLowerCase().includes(searchQuery.toLowerCase()));

    // Apply Sorting
    result.sort((a, b) => {
      switch (sortOption) {
        case 'Newest': return b.addedAt - a.addedAt;
        case 'Oldest': return a.addedAt - b.addedAt;
        case 'A-Z': return a.name.localeCompare(b.name);
        case 'Z-A': return b.name.localeCompare(a.name);
        default: return b.addedAt - a.addedAt;
      }
    });

    return result;
  }, [games, activeProfile, statusFilter, modeFilter, playerFilter, searchQuery, sortOption]);

  const stats = useMemo(() => {
    return {
      wanted: filteredGames.filter(g => g.status === 'Wanted').length,
      played: filteredGames.filter(g => g.status === 'Played').length
    };
  }, [filteredGames]);

  // --- Renders ---

  // Initial Profile Selector Render
  if (!activeProfile) {
    return (
      <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#020617] to-[#020617] flex flex-col items-center justify-center p-4 selection:bg-indigo-500/30 font-sans text-slate-200">
        <div className="max-w-md w-full bg-slate-900/60 backdrop-blur-2xl p-8 rounded-[2rem] border border-white/5 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-500">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="flex justify-center mb-6 relative">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-3.5 rounded-2xl shadow-lg shadow-indigo-500/25">
              <Gamepad2 className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-center mb-2 text-white tracking-tight">Who is playing?</h1>
          <p className="text-slate-400 text-center mb-10">Select your profile to continue</p>
          
          <div className="space-y-4 relative z-10">
            <button 
              onClick={() => loginAs('Aadish')}
              className="w-full py-4 bg-white/5 hover:bg-blue-600/20 border border-white/5 hover:border-blue-500/50 text-white rounded-2xl font-medium transition-all duration-300 flex items-center gap-3 justify-center group hover:shadow-[0_0_20px_rgba(59,130,246,0.2)] active:scale-95"
            >
              <User className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform duration-300" />
              Aadish
            </button>
            <button 
              onClick={() => loginAs('Aditya')}
              className="w-full py-4 bg-white/5 hover:bg-orange-600/20 border border-white/5 hover:border-orange-500/50 text-white rounded-2xl font-medium transition-all duration-300 flex items-center gap-3 justify-center group hover:shadow-[0_0_20px_rgba(249,115,22,0.2)] active:scale-95"
            >
              <User className="w-5 h-5 text-orange-400 group-hover:scale-110 transition-transform duration-300" />
              Aditya
            </button>
            <div className="pt-6 mt-6 border-t border-white/5">
              <button 
                onClick={() => loginAs('Combined')}
                className="w-full py-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-400 hover:via-purple-400 hover:to-pink-400 text-white rounded-2xl font-bold text-lg transition-all duration-300 flex items-center gap-3 justify-center group shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] active:scale-95"
              >
                <Users className="w-6 h-6 group-hover:scale-110 transition-transform duration-300 text-white" />
                Combined Library View
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main App Render
  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-indigo-500/30 pb-12 animate-in fade-in duration-500">
      
      {/* Delete Confirmation Modal */}
      {gameToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md transition-all">
          <div className="bg-slate-900 border border-red-500/20 rounded-3xl w-full max-w-sm p-6 shadow-[0_0_50px_rgba(239,68,68,0.2)] animate-in fade-in zoom-in-95 duration-300 text-center relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-red-500/0 via-red-500 to-red-500/0"></div>
            <div className="mx-auto w-16 h-16 bg-red-500/10 flex items-center justify-center rounded-full mb-4">
              <Trash2 className="w-8 h-8 text-red-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Remove Game?</h3>
            <p className="text-sm text-slate-400 mb-6 leading-relaxed">
              Are you sure you want to remove <strong className="text-white">{gameToDelete.name}</strong> from your list?
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setGameToDelete(null)}
                className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/5 text-white rounded-xl font-medium transition-all active:scale-95"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDeleteGame}
                className="flex-1 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl font-medium transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pending / Add Game Modal */}
      {pendingGame && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md transition-all">
          <div className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-md overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-in fade-in zoom-in-95 duration-300">
            <div className="relative h-56 bg-slate-800">
              <img 
                src={pendingGame.imageUrl} 
                alt={pendingGame.name}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.src = `https://placehold.co/460x215/1e293b/4f46e5?text=${encodeURIComponent(pendingGame.name)}`; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
            </div>
            
            <div className="p-6 -mt-10 relative z-10 space-y-6">
              <h3 className="text-2xl font-bold text-white leading-tight drop-shadow-md">{pendingGame.name}</h3>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-400 mb-2.5 uppercase tracking-wider text-xs">Progress Category</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPendingGame({...pendingGame, status: 'Wanted'})}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all duration-300 active:scale-95 ${
                        pendingGame.status === 'Wanted' 
                          ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.15)]' 
                          : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'
                      }`}
                    >Wanted to Play</button>
                    <button
                      onClick={() => setPendingGame({...pendingGame, status: 'Played'})}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all duration-300 active:scale-95 ${
                        pendingGame.status === 'Played' 
                          ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.15)]' 
                          : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'
                      }`}
                    >Already Played</button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-400 mb-2.5 uppercase tracking-wider text-xs">Game Mode</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPendingGame({...pendingGame, mode: 'Singleplayer'})}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all duration-300 active:scale-95 ${
                        pendingGame.mode === 'Singleplayer' 
                          ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.15)]' 
                          : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'
                      }`}
                    >Singleplayer</button>
                    <button
                      onClick={() => setPendingGame({...pendingGame, mode: 'Multiplayer'})}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all duration-300 active:scale-95 ${
                        pendingGame.mode === 'Multiplayer' 
                          ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.15)]' 
                          : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'
                      }`}
                    >Multiplayer</button>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button 
                  onClick={() => setPendingGame(null)}
                  className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/5 text-white rounded-xl font-medium transition-all duration-300 active:scale-95"
                >Cancel</button>
                <button 
                  onClick={confirmAddGame}
                  className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(79,70,229,0.5)] active:scale-95"
                ><ListPlus className="w-5 h-5" /> Save Game</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Game Modal */}
      {editingGame && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md transition-all">
          <div className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-md overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-in fade-in zoom-in-95 duration-300">
            <div className="relative h-56 bg-slate-800">
              <img 
                src={editingGame.imageUrl} 
                alt={editingGame.name}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.src = `https://placehold.co/460x215/1e293b/4f46e5?text=${encodeURIComponent(editingGame.name)}`; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
            </div>
            
            <div className="p-6 -mt-10 relative z-10 space-y-6">
              <h3 className="text-2xl font-bold text-white leading-tight drop-shadow-md">{editingGame.name}</h3>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-400 mb-2.5 uppercase tracking-wider text-xs">Progress Category</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingGame({...editingGame, status: 'Wanted'})}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all duration-300 active:scale-95 ${
                        editingGame.status === 'Wanted' 
                          ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.15)]' 
                          : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'
                      }`}
                    >Wanted to Play</button>
                    <button
                      onClick={() => setEditingGame({...editingGame, status: 'Played'})}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all duration-300 active:scale-95 ${
                        editingGame.status === 'Played' 
                          ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.15)]' 
                          : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'
                      }`}
                    >Already Played</button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-400 mb-2.5 uppercase tracking-wider text-xs">Game Mode</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingGame({...editingGame, mode: 'Singleplayer'})}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all duration-300 active:scale-95 ${
                        editingGame.mode === 'Singleplayer' 
                          ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.15)]' 
                          : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'
                      }`}
                    >Singleplayer</button>
                    <button
                      onClick={() => setEditingGame({...editingGame, mode: 'Multiplayer'})}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all duration-300 active:scale-95 ${
                        editingGame.mode === 'Multiplayer' 
                          ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.15)]' 
                          : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'
                      }`}
                    >Multiplayer</button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-3">
                <div className="flex gap-3">
                  <button 
                    onClick={() => setEditingGame(null)}
                    className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/5 text-white rounded-xl font-medium transition-all duration-300 active:scale-95"
                  >Cancel</button>
                  <button 
                    onClick={saveEditedGame}
                    className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] active:scale-95"
                  ><CheckCircle2 className="w-5 h-5" /> Save Changes</button>
                </div>
                <button
                  onClick={() => {
                    setGameToDelete(editingGame);
                    setEditingGame(null); 
                  }}
                  className="w-full py-3 mt-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 active:scale-95"
                >
                  <Trash2 className="w-5 h-5" /> Remove from my list
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modern Fully-Rounded Pill Header */}
      <header className="bg-slate-900/80 backdrop-blur-xl border-b border-white/5 sticky top-0 z-10 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
            
            {/* Left Area: Logo & Titles */}
            <div className="flex items-center gap-4 flex-shrink-0">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2.5 rounded-2xl shadow-lg shadow-indigo-500/20">
                <Gamepad2 className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <div className="flex flex-col justify-center">
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-indigo-300 via-indigo-400 to-purple-400 bg-clip-text text-transparent tracking-tight leading-none mb-1">
                  Steam Backlog
                </h1>
                <div className="flex items-center text-xs font-semibold tracking-wide h-4">
                  {syncStatus === 'syncing' ? (
                    <span className="text-indigo-400 flex items-center gap-1.5"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...</span>
                  ) : syncStatus === 'saved' ? (
                    <span className="text-emerald-500 flex items-center gap-1.5 animate-in fade-in"><Cloud className="w-3.5 h-3.5" /> Auto-saved</span>
                  ) : syncStatus === 'error' ? (
                    <span className="text-red-400 flex items-center gap-1.5 animate-in fade-in"><AlertCircle className="w-3.5 h-3.5" /> Sync Error</span>
                  ) : null}
                </div>
              </div>
            </div>
            
            {/* Right Area: Badges & Switch Button */}
            <div className="flex items-center justify-start sm:justify-end gap-3 sm:gap-4 w-full overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {/* Pill Counters */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="flex items-center gap-2.5 text-slate-300 bg-slate-900/80 px-4 py-1.5 rounded-full border border-white/5 shadow-inner">
                  <Circle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <strong className="text-white text-[15px] leading-none font-bold">{stats.wanted}</strong>
                </div>
                <div className="flex items-center gap-2.5 text-slate-300 bg-slate-900/80 px-4 py-1.5 rounded-full border border-white/5 shadow-inner">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <strong className="text-white text-[15px] leading-none font-bold">{stats.played}</strong>
                </div>
              </div>
              
              {/* Desktop Divider */}
              <div className="hidden sm:block w-px h-6 bg-white/10 mx-1 flex-shrink-0"></div>
              
              {/* Combined View Button */}
              {activeProfile !== 'Combined' && (
                <button 
                  onClick={() => loginAs('Combined')}
                  className="flex items-center gap-2.5 bg-[#1e1b4b]/60 hover:bg-[#1e1b4b] text-indigo-200 px-5 py-2 rounded-full text-sm font-semibold transition-all border border-indigo-500/20 active:scale-95 flex-shrink-0 shadow-sm"
                  title="Combined View"
                >
                  <Users className="w-[18px] h-[18px] flex-shrink-0" />
                  <span className="tracking-wide">Combined</span>
                </button>
              )}

              {/* Active Profile Pill / Switcher */}
              <button 
                onClick={() => loginAs(null)}
                className="flex items-center gap-2.5 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-white px-6 py-2 rounded-full text-sm font-bold transition-all shadow-[0_0_15px_rgba(244,63,94,0.4)] hover:shadow-[0_0_25px_rgba(244,63,94,0.6)] active:scale-95 flex-shrink-0"
                title="Switch Profile"
              >
                {activeProfile === 'Combined' ? <Users className="w-[18px] h-[18px] text-white flex-shrink-0" /> : <User className="w-[18px] h-[18px] text-white flex-shrink-0" />}
                <span className="truncate max-w-[120px] sm:max-w-none tracking-wide">{activeProfile}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Add Game Section */}
        {activeProfile !== 'Combined' && (
          <section className="bg-slate-900/50 backdrop-blur-sm rounded-3xl p-5 sm:p-8 border border-white/5 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
            
            <h2 className="text-xl font-bold mb-5 flex items-center gap-2 text-white tracking-tight">
              <ListPlus className="w-6 h-6 text-indigo-400" />
              Add to {activeProfile}'s List
            </h2>
            
            <form onSubmit={handleFetchGameDetails} className="flex flex-col sm:flex-row gap-3 relative z-10">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="Paste Steam game URL here (e.g., store.steampowered.com/app/...)"
                  className="w-full bg-slate-950/50 border border-white/10 rounded-2xl px-5 py-3.5 sm:py-4 text-sm sm:text-base outline-none focus:border-indigo-500/50 focus:bg-slate-900 transition-all placeholder-slate-500 shadow-inner"
                  disabled={loading}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3.5 sm:py-4 rounded-2xl font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50 whitespace-nowrap shadow-[0_0_15px_rgba(79,70,229,0.2)] hover:shadow-[0_0_25px_rgba(79,70,229,0.4)] active:scale-95"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                {loading ? 'Fetching...' : 'Fetch'}
              </button>
            </form>
            
            {error && (
              <div className="mt-5 flex items-center gap-2 text-red-400 text-sm bg-red-500/10 p-3.5 rounded-xl border border-red-500/20 animate-in slide-in-from-top-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}
          </section>
        )}

        {/* Filters and Search */}
        <section className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center w-full">
          {/* Scrollable container for mobile filters */}
          <div className="flex w-full overflow-x-auto pb-2 -mb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] gap-3 items-center">
            <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-1.5 border border-white/5 flex gap-1 flex-shrink-0">
              {['All', 'Wanted', 'Played'].map(status => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                    statusFilter === status 
                      ? 'bg-indigo-500/20 text-indigo-300 shadow-sm border border-indigo-500/30' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
            <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-1.5 border border-white/5 flex gap-1 flex-shrink-0">
              {['All', 'Singleplayer', 'Multiplayer'].map(mode => (
                <button
                  key={mode}
                  onClick={() => setModeFilter(mode)}
                  className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                    modeFilter === mode 
                      ? 'bg-indigo-500/20 text-indigo-300 shadow-sm border border-indigo-500/30' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            {/* Profile filtering removed from Combined view as requested */}
            {activeProfile !== 'Combined' && (
              <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-1.5 border border-white/5 flex gap-1 flex-shrink-0">
                {['All', 'Aadish', 'Aditya', 'Both'].map(player => (
                  <button
                    key={player}
                    onClick={() => setPlayerFilter(player)}
                    className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                      playerFilter === player 
                        ? 'bg-indigo-500/20 text-indigo-300 shadow-sm border border-indigo-500/30' 
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    {player}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row w-full lg:w-auto gap-3 flex-shrink-0">
            {/* Sorting Dropdown */}
            <div className="relative flex items-center gap-2 group">
              <ArrowUpDown className="absolute left-4 w-4 h-4 text-slate-500 pointer-events-none" />
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="w-full sm:w-auto bg-slate-900/50 backdrop-blur-sm border border-white/5 rounded-2xl pl-11 pr-8 py-3 text-sm text-slate-300 font-medium outline-none focus:border-indigo-500/50 focus:bg-slate-900 transition-all shadow-inner appearance-none cursor-pointer hover:bg-slate-800"
              >
                <option value="Newest">Newest First</option>
                <option value="Oldest">Oldest First</option>
                <option value="A-Z">Name (A-Z)</option>
                <option value="Z-A">Name (Z-A)</option>
              </select>
            </div>

            {/* Search Input */}
            <div className="relative w-full lg:w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search games..."
                className="w-full bg-slate-900/50 backdrop-blur-sm border border-white/5 rounded-2xl pl-11 pr-4 py-3 text-sm outline-none focus:border-indigo-500/50 focus:bg-slate-900 transition-all shadow-inner placeholder-slate-500"
              />
            </div>
          </div>
        </section>

        {/* Games Grid */}
        {filteredGames.length === 0 ? (
          <div className="text-center py-24 bg-slate-900/30 backdrop-blur-sm rounded-3xl border border-white/5 border-dashed">
            <Gamepad2 className="w-16 h-16 mx-auto text-slate-600 mb-5" />
            <h3 className="text-2xl font-bold text-slate-300 tracking-tight">No games found</h3>
            <p className="text-slate-500 mt-2 max-w-sm mx-auto">
              {games.length === 0 
                ? "Your library is empty. Paste a Steam URL above to start building your collection!" 
                : "No games match your current filters or search query."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredGames.map((game, idx) => {
              const addedBy = game.addedBy || [];
              const isBoth = addedBy.length === 2;
              const hasAadish = addedBy.includes('Aadish');
              const hasAditya = addedBy.includes('Aditya');
              
              const isMyGame = activeProfile !== 'Combined' && addedBy.includes(activeProfile);

              return (
                <div 
                  key={game.id} 
                  className="group flex flex-col bg-slate-900/60 backdrop-blur-md rounded-[1.25rem] overflow-hidden border border-white/5 hover:border-indigo-500/30 shadow-lg hover:shadow-[0_10px_30px_rgba(79,70,229,0.15)] hover:-translate-y-1 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
                  style={{ animationFillMode: "both", animationDelay: `${idx * 50}ms` }}
                >
                  <div className="relative aspect-[460/215] bg-slate-950 overflow-hidden">
                    <img 
                      src={game.imageUrl} 
                      alt={game.name}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                      onError={(e) => { e.target.src = `https://placehold.co/460x215/0f172a/4f46e5?text=${encodeURIComponent(game.name)}`; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80"></div>
                    
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                      <span className={`w-fit px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg backdrop-blur-md shadow-sm border ${
                        game.status === 'Played' 
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      }`}>
                        {game.status}
                      </span>
                      {(isBoth || hasAadish || hasAditya) && (
                        <span className={`w-fit px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg backdrop-blur-md shadow-sm border ${
                          isBoth ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' :
                          hasAadish ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' :
                          'bg-orange-500/20 text-orange-300 border-orange-500/30'
                        }`}>
                          {isBoth ? 'Both Wanted' : hasAadish ? 'Aadish' : 'Aditya'}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex justify-between items-start gap-3 mb-3">
                      <h3 className="font-bold text-lg leading-tight line-clamp-2 text-white/90 group-hover:text-white transition-colors" title={game.name}>
                        {game.name}
                      </h3>
                      <a 
                        href={game.steamUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-slate-500 hover:text-indigo-400 bg-white/5 hover:bg-white/10 p-2 rounded-xl transition-colors flex-shrink-0 active:scale-95"
                        title="Open in Steam"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>

                    <div className="mt-auto pt-5 space-y-3">
                      
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 bg-black/20 w-fit px-3 py-1.5 rounded-lg border border-white/5">
                        {game.mode === 'Multiplayer' 
                          ? <><Users className="w-3.5 h-3.5 text-cyan-400" /> Multiplayer</>
                          : <><User className="w-3.5 h-3.5 text-indigo-400" /> Singleplayer</>
                        }
                      </div>

                      <div className="flex items-center gap-2 pt-3 border-t border-white/5">
                        {activeProfile === 'Combined' ? (
                          <div className="flex items-center justify-center gap-1.5 py-2.5 w-full rounded-xl bg-white/5 border border-white/5 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                            <ShieldAlert className="w-3.5 h-3.5" /> Read Only View
                          </div>
                        ) : isMyGame ? (
                          <button
                            onClick={() => setEditingGame(game)}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-semibold transition-all bg-white/5 text-slate-300 hover:bg-white/10 border border-white/5 hover:border-white/10 active:scale-95"
                          >
                            <Pencil className="w-4 h-4" /> Edit Details
                          </button>
                        ) : (
                           <div className="flex items-center justify-center gap-1.5 py-2.5 w-full rounded-xl bg-white/5 border border-white/5 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                             <ShieldAlert className="w-3.5 h-3.5" /> View Only
                           </div>
                        )}
                      </div>
                      
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
