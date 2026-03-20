import React, { useState, useEffect } from 'react';
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
  Github,
  Upload,
  Download,
  Sparkles,
  ShieldAlert
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
  const [pendingGame, setPendingGame] = useState(null);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('All');
  const [modeFilter, setModeFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [playerFilter, setPlayerFilter] = useState('All');

  // GitHub Sync State
  const [showGithubModal, setShowGithubModal] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);
  const [githubMessage, setGithubMessage] = useState({ type: '', text: '' });

  // Profile State
  const [activeProfile, setActiveProfile] = useState(() => {
    return localStorage.getItem('steam-tracker-profile') || null;
  });

  // Save to local storage automatically for the current device
  useEffect(() => {
    localStorage.setItem('steam-tracker-local', JSON.stringify(games));
  }, [games]);

  useEffect(() => {
    if (activeProfile) {
      localStorage.setItem('steam-tracker-profile', activeProfile);
    } else {
      localStorage.removeItem('steam-tracker-profile');
    }
  }, [activeProfile]);

  // --- GitHub Sync Functions ---
  const GITHUB_OWNER = 'AadishY';
  const GITHUB_REPO = 'GamesList';
  const FILE_PATH = 'games.json';

  const getGithubToken = () => {
    try {
      // Direct access for Vite environments
      return import.meta.env.VITE_GITHUB_TOKEN || '';
    } catch (e) {
      return '';
    }
  };

  const pullFromGithub = async () => {
    const token = getGithubToken();
    if (!token) {
      setGithubMessage({ type: 'error', text: 'VITE_GITHUB_TOKEN is missing from your environment variables.' });
      return;
    }
    
    setGithubLoading(true);
    setGithubMessage({ type: '', text: '' });
    
    try {
      const response = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${FILE_PATH}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.v3+json'
        }
      });
      
      if (response.status === 404) {
         setGithubMessage({ type: 'error', text: 'No games.json found in repository yet. Push your list first!' });
         return;
      }
      if (!response.ok) throw new Error(`GitHub API Error: ${response.statusText}`);
      
      const data = await response.json();
      const decodedContent = decodeURIComponent(escape(atob(data.content)));
      const parsedGames = JSON.parse(decodedContent);
      
      setGames(parsedGames);
      setGithubMessage({ type: 'success', text: `Successfully loaded ${parsedGames.length} games from GitHub!` });
    } catch (err) {
      setGithubMessage({ type: 'error', text: err.message || 'Error pulling data from GitHub.' });
    } finally {
      setGithubLoading(false);
    }
  };

  const pushToGithub = async () => {
    const token = getGithubToken();
    if (!token) {
      setGithubMessage({ type: 'error', text: 'VITE_GITHUB_TOKEN is missing from your environment variables.' });
      return;
    }

    setGithubLoading(true);
    setGithubMessage({ type: '', text: '' });

    try {
      let sha = null;
      // 1. Check if file exists to get the SHA (Required by GitHub to update files)
      const getResponse = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${FILE_PATH}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.v3+json' }
      });
      
      if (getResponse.ok) {
        const data = await getResponse.json();
        sha = data.sha;
      } else if (getResponse.status !== 404) {
        throw new Error('Failed to verify existing file on GitHub.');
      }

      // 2. Upload file
      const contentStr = JSON.stringify(games, null, 2);
      const encodedContent = btoa(unescape(encodeURIComponent(contentStr)));

      const putResponse = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${FILE_PATH}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: `Sync games list (${games.length} games)`,
          content: encodedContent,
          ...(sha && { sha })
        })
      });

      if (!putResponse.ok) throw new Error('Failed to push to GitHub. Verify your token has repo write permissions.');
      
      setGithubMessage({ type: 'success', text: 'Successfully backed up list to GitHub repository!' });
    } catch (err) {
      setGithubMessage({ type: 'error', text: err.message || 'Error pushing data to GitHub.' });
    } finally {
      setGithubLoading(false);
    }
  };

  // --- Game Parsing & Adding ---
  const extractGameInfo = (url) => {
    const match = url.match(/\/app\/(\d+)(?:\/([^\/?#]+))?/);
    if (!match) return null;
    return {
      appId: match[1],
      slugName: match[2] ? decodeURIComponent(match[2]).replace(/_/g, ' ') : null
    };
  };

  // Helper fetch with timeout to prevent endless hanging on slow proxies
  const fetchWithTimeout = async (resource, options = {}) => {
    const { timeout = 4000 } = options;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    const response = await fetch(resource, {
      ...options,
      signal: controller.signal  
    });
    clearTimeout(id);
    return response;
  };

  const handleFetchGameDetails = async (e) => {
    e.preventDefault();
    setError('');
    
    if (activeProfile === 'Combined') {
      setError('Please switch to a specific player profile (Aadish or Aditya) to add a game.');
      return;
    }

    if (!urlInput.trim()) {
      setError('Please enter a Steam URL');
      return;
    }

    const info = extractGameInfo(urlInput);
    if (!info) {
      setError('Invalid Steam URL. Make sure it looks like: https://store.steampowered.com/app/12345/...');
      return;
    }

    const { appId, slugName } = info;

    const existingGame = games.find(g => g.appId === appId);
    if (existingGame) {
      const addedBy = existingGame.addedBy || [];
      if (addedBy.includes(activeProfile)) {
        setError('This game is already in your list!');
        return;
      } else {
        // Automatically add current user to existing game seamlessly
        setGames(games.map(g => 
          g.appId === appId 
            ? { ...g, addedBy: [...addedBy, activeProfile] } 
            : g
        ));
        setUrlInput('');
        return;
      }
    }

    setLoading(true);

    try {
      // Using a faster, more reliable proxy.
      const apiUrl = `https://store.steampowered.com/api/appdetails?appids=${appId}`;
      const proxyUrl = `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(apiUrl)}`;
      
      // Attempt to fetch with a strict 4-second limit
      const response = await fetchWithTimeout(proxyUrl, { timeout: 4000 });
      if (!response.ok) throw new Error('Proxy error');
      
      const steamData = await response.json();
      
      if (!steamData || !steamData[appId] || !steamData[appId].success) {
        throw new Error('Game not found on Steam API or is age-restricted');
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
      console.warn('API fetch timed out or failed. Utilizing bulletproof fallback.', err.message);
      
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

  // --- Game Actions ---
  const updateGame = (id, updates) => {
    if (activeProfile === 'Combined') return; // Read-only protection
    setGames(games.map(g => g.id === id ? { ...g, ...updates } : g));
  };

  const deleteGame = (id) => {
    if (activeProfile === 'Combined') return; // Read-only protection

    setGames(prevGames => {
      return prevGames.map(g => {
        if (g.id === id) {
          // Remove ONLY the active profile's tag from the game
          const newAddedBy = (g.addedBy || []).filter(p => p !== activeProfile);
          return { ...g, addedBy: newAddedBy };
        }
        return g;
      }).filter(g => g.addedBy && g.addedBy.length > 0); 
      // The filter at the end officially deletes the game ONLY if no tags remain
    });
  };

  // Filter and Sort
  const profileFilteredGames = games.filter(game => {
    const addedBy = game.addedBy || [];
    if (activeProfile === 'Combined') return true;
    return addedBy.includes(activeProfile);
  });

  const filteredGames = profileFilteredGames
    .filter(game => statusFilter === 'All' || game.status === statusFilter)
    .filter(game => modeFilter === 'All' || game.mode === modeFilter)
    .filter(game => {
      if (activeProfile !== 'Combined') return true;
      if (playerFilter === 'All') return true;
      if (playerFilter === 'Both') return game.addedBy?.length === 2;
      return game.addedBy?.includes(playerFilter);
    })
    .filter(game => game.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => b.addedAt - a.addedAt);

  if (!activeProfile) {
    return (
      <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#020617] to-[#020617] flex flex-col items-center justify-center p-4 selection:bg-indigo-500/30 font-sans text-slate-200">
        <div className="max-w-md w-full bg-slate-900/50 backdrop-blur-xl p-8 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden">
          {/* Decorative Glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="flex justify-center mb-6 relative">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-3.5 rounded-2xl shadow-lg shadow-indigo-500/25">
              <Gamepad2 className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-center mb-2 text-white tracking-tight">Who is playing?</h1>
          <p className="text-slate-400 text-center mb-8">Select your profile to continue</p>
          
          <div className="space-y-4 relative">
            <button 
              onClick={() => setActiveProfile('Aadish')}
              className="w-full py-4 bg-white/5 hover:bg-blue-600/20 border border-white/5 hover:border-blue-500/50 text-white rounded-2xl font-medium transition-all duration-300 flex items-center gap-3 justify-center group hover:shadow-[0_0_20px_rgba(59,130,246,0.2)] hover:-translate-y-0.5"
            >
              <User className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform duration-300" />
              Aadish
            </button>
            <button 
              onClick={() => setActiveProfile('Aditya')}
              className="w-full py-4 bg-white/5 hover:bg-orange-600/20 border border-white/5 hover:border-orange-500/50 text-white rounded-2xl font-medium transition-all duration-300 flex items-center gap-3 justify-center group hover:shadow-[0_0_20px_rgba(249,115,22,0.2)] hover:-translate-y-0.5"
            >
              <User className="w-5 h-5 text-orange-400 group-hover:scale-110 transition-transform duration-300" />
              Aditya
            </button>
            <div className="pt-5 mt-5 border-t border-white/5">
              <button 
                onClick={() => setActiveProfile('Combined')}
                className="w-full py-4 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 hover:border-indigo-500/50 text-indigo-300 rounded-2xl font-medium transition-all duration-300 flex items-center gap-3 justify-center group hover:-translate-y-0.5"
              >
                <Users className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                Combined View
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-indigo-500/30 pb-12">
      
      {/* Pending Game Modal */}
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
                {/* Tag Selection: Status */}
                <div>
                  <label className="block text-sm font-semibold text-slate-400 mb-2.5 uppercase tracking-wider text-xs">Progress Category</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPendingGame({...pendingGame, status: 'Wanted'})}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all duration-300 ${
                        pendingGame.status === 'Wanted' 
                          ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.15)]' 
                          : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'
                      }`}
                    >
                      Wanted to Play
                    </button>
                    <button
                      onClick={() => setPendingGame({...pendingGame, status: 'Played'})}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all duration-300 ${
                        pendingGame.status === 'Played' 
                          ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.15)]' 
                          : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'
                      }`}
                    >
                      Already Played
                    </button>
                  </div>
                </div>

                {/* Tag Selection: Mode */}
                <div>
                  <label className="block text-sm font-semibold text-slate-400 mb-2.5 uppercase tracking-wider text-xs">Game Mode</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPendingGame({...pendingGame, mode: 'Singleplayer'})}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all duration-300 ${
                        pendingGame.mode === 'Singleplayer' 
                          ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.15)]' 
                          : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'
                      }`}
                    >
                      Singleplayer
                    </button>
                    <button
                      onClick={() => setPendingGame({...pendingGame, mode: 'Multiplayer'})}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all duration-300 ${
                        pendingGame.mode === 'Multiplayer' 
                          ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.15)]' 
                          : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'
                      }`}
                    >
                      Multiplayer
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button 
                  onClick={() => setPendingGame(null)}
                  className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/5 text-white rounded-xl font-medium transition-all duration-300"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmAddGame}
                  className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(79,70,229,0.5)]"
                >
                  <ListPlus className="w-5 h-5" />
                  Save Game
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* GitHub Sync Modal */}
      {showGithubModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-md p-7 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative">
            <h3 className="text-2xl font-bold text-white mb-3 flex items-center gap-3">
              <Github className="w-7 h-7 text-indigo-400" /> Cloud Sync
            </h3>
            
            <p className="text-sm text-slate-400 mb-6 leading-relaxed">
              Sync your library to <strong className="text-indigo-400 font-semibold">{GITHUB_OWNER}/{GITHUB_REPO}</strong>. 
              This uses the hidden `VITE_GITHUB_TOKEN` from your environment.
            </p>

            <div className="space-y-5">
              {githubMessage.text && (
                <div className={`p-4 rounded-xl text-sm border flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 ${
                  githubMessage.type === 'error' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                }`}>
                  <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <p className="leading-relaxed">{githubMessage.text}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button 
                  onClick={pullFromGithub}
                  disabled={githubLoading}
                  className="flex-1 py-3.5 bg-slate-800 hover:bg-slate-700 border border-white/5 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50 hover:shadow-lg"
                >
                  {githubLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5 text-indigo-400" />}
                  Load
                </button>
                <button 
                  onClick={pushToGithub}
                  disabled={githubLoading}
                  className="flex-1 py-3.5 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-400 rounded-xl font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50 hover:shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                >
                  {githubLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                  Save
                </button>
              </div>
              <button 
                onClick={() => { setShowGithubModal(false); setGithubMessage({type:'', text:''}); }}
                className="w-full py-3 bg-transparent text-slate-400 hover:text-white hover:bg-white/5 rounded-xl font-medium transition-colors mt-2"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-xl border-b border-white/5 sticky top-0 z-10 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2.5 rounded-xl shadow-lg shadow-indigo-500/20">
                <Gamepad2 className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-indigo-300 via-indigo-400 to-purple-400 bg-clip-text text-transparent tracking-tight">
                Steam Backlog
              </h1>
            </div>
            
            <div className="flex items-center gap-5 text-sm font-medium">
              <div className="hidden sm:flex items-center gap-5 border-r border-white/10 pr-5">
                <div className="flex items-center gap-2 text-slate-400 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                  <Circle className="w-4 h-4 text-amber-400" />
                  <span>Wanted: <strong className="text-white ml-1">{filteredGames.filter(g => g.status === 'Wanted').length}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-slate-400 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Played: <strong className="text-white ml-1">{filteredGames.filter(g => g.status === 'Played').length}</strong></span>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowGithubModal(true)}
                  className="p-2.5 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/5 hidden sm:block hover:shadow-[0_0_15px_rgba(255,255,255,0.05)]"
                  title="GitHub Sync"
                >
                  <Github className="w-5 h-5" />
                </button>

                <span className={`hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl border font-bold text-xs uppercase tracking-wider ${
                  activeProfile === 'Aadish' ? 'bg-blue-500/10 text-blue-300 border-blue-500/20' :
                  activeProfile === 'Aditya' ? 'bg-orange-500/10 text-orange-300 border-orange-500/20' :
                  'bg-indigo-500/10 text-indigo-300 border-indigo-500/20'
                }`}>
                  <Sparkles className="w-3.5 h-3.5" />
                  {activeProfile}
                </span>
                
                <button 
                  onClick={() => setActiveProfile(null)}
                  className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/5 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all"
                  title="Switch Profile"
                >
                  <Users className="w-4 h-4 text-indigo-400" />
                  <span className="hidden sm:inline">Switch</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        
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
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3.5 sm:py-4 rounded-2xl font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50 whitespace-nowrap shadow-[0_0_15px_rgba(79,70,229,0.2)] hover:shadow-[0_0_25px_rgba(79,70,229,0.4)] hover:-translate-y-0.5"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                {loading ? 'Fetching...' : 'Fetch'}
              </button>
            </form>
            
            {error && (
              <div className="mt-5 flex items-center gap-2 text-red-400 text-sm bg-red-500/10 p-3.5 rounded-xl border border-red-500/20">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}
          </section>
        )}

        {/* Filters and Search */}
        <section className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
          <div className="flex flex-wrap gap-3">
            <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl p-1.5 border border-white/5 flex gap-1">
              {['All', 'Wanted', 'Played'].map(status => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                    statusFilter === status 
                      ? 'bg-indigo-500/20 text-indigo-300 shadow-sm border border-indigo-500/30' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
            <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl p-1.5 border border-white/5 flex gap-1">
              {['All', 'Singleplayer', 'Multiplayer'].map(mode => (
                <button
                  key={mode}
                  onClick={() => setModeFilter(mode)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                    modeFilter === mode 
                      ? 'bg-indigo-500/20 text-indigo-300 shadow-sm border border-indigo-500/30' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            {activeProfile === 'Combined' && (
              <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl p-1.5 border border-white/5 flex gap-1">
                {['All', 'Aadish', 'Aditya', 'Both'].map(player => (
                  <button
                    key={player}
                    onClick={() => setPlayerFilter(player)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
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
          <div className="relative w-full lg:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search games..."
              className="w-full bg-slate-900/50 backdrop-blur-sm border border-white/5 rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:border-indigo-500/50 focus:bg-slate-900 transition-all shadow-inner"
            />
          </div>
        </section>

        {/* Games Grid */}
        {filteredGames.length === 0 ? (
          <div className="text-center py-24 bg-slate-900/30 backdrop-blur-sm rounded-3xl border border-white/5 border-dashed">
            <Gamepad2 className="w-16 h-16 mx-auto text-slate-600 mb-5" />
            <h3 className="text-2xl font-bold text-slate-300 tracking-tight">No games found</h3>
            <p className="text-slate-500 mt-2 max-w-sm mx-auto">
              {profileFilteredGames.length === 0 
                ? "Your library is empty. Paste a Steam URL above to start building your collection!" 
                : "No games match your current filters or search query."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredGames.map((game) => {
              const addedBy = game.addedBy || [];
              const isBoth = addedBy.length === 2;
              const hasAadish = addedBy.includes('Aadish');
              const hasAditya = addedBy.includes('Aditya');

              return (
                <div 
                  key={game.id} 
                  className="group flex flex-col bg-slate-900/60 backdrop-blur-md rounded-2xl overflow-hidden border border-white/5 hover:border-indigo-500/30 shadow-lg hover:shadow-[0_10px_30px_rgba(79,70,229,0.15)] hover:-translate-y-1 transition-all duration-300"
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
                      <span className={`w-fit px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg backdrop-blur-md shadow-sm border ${
                        game.status === 'Played' 
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      }`}>
                        {game.status}
                      </span>
                      {(isBoth || hasAadish || hasAditya) && (
                        <span className={`w-fit px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg backdrop-blur-md shadow-sm border ${
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
                        className="text-slate-500 hover:text-indigo-400 bg-white/5 hover:bg-white/10 p-1.5 rounded-lg transition-colors flex-shrink-0"
                        title="Open in Steam"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>

                    <div className="mt-auto pt-5 space-y-3">
                      
                      {activeProfile !== 'Combined' ? (
                        <>
                          {/* Modifiable Action Buttons */}
                          <button 
                            onClick={() => updateGame(game.id, { mode: game.mode === 'Singleplayer' ? 'Multiplayer' : 'Singleplayer' })}
                            className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors bg-black/20 w-fit px-3 py-1.5 rounded-lg border border-white/5 hover:border-white/10"
                            title="Click to toggle mode"
                          >
                            {game.mode === 'Multiplayer' 
                              ? <><Users className="w-3.5 h-3.5 text-cyan-400" /> Multiplayer</>
                              : <><User className="w-3.5 h-3.5 text-indigo-400" /> Singleplayer</>
                            }
                          </button>

                          <div className="flex items-center gap-2 pt-3 border-t border-white/5">
                            {game.status === 'Wanted' ? (
                              <button
                                onClick={() => updateGame(game.id, { status: 'Played' })}
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-semibold transition-all bg-indigo-500/10 text-indigo-300 hover:bg-emerald-500/10 hover:text-emerald-400 border border-indigo-500/20 hover:border-emerald-500/30"
                              >
                                <CheckCircle2 className="w-4 h-4" /> Mark as Played
                              </button>
                            ) : (
                              <div className="flex-1"></div> 
                            )}
                            
                            <button
                              onClick={() => deleteGame(game.id)}
                              className="p-2.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl border border-transparent hover:border-red-500/20 transition-all"
                              title="Remove Game"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                           {/* Read Only Badges for Combined View */}
                           <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 bg-black/20 w-fit px-3 py-1.5 rounded-lg border border-white/5">
                            {game.mode === 'Multiplayer' 
                              ? <><Users className="w-3.5 h-3.5 text-cyan-400" /> Multiplayer</>
                              : <><User className="w-3.5 h-3.5 text-indigo-400" /> Singleplayer</>
                            }
                          </div>

                          <div className="flex items-center justify-center gap-2 pt-3 border-t border-white/5">
                             <div className="flex items-center justify-center gap-1.5 py-2 w-full rounded-xl bg-white/5 border border-white/5 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                               <ShieldAlert className="w-3.5 h-3.5" /> Read Only View
                             </div>
                          </div>
                        </>
                      )}

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
