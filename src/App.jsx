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
  CloudUpload,
  CloudDownload
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
  const [githubToken, setGithubToken] = useState(() => localStorage.getItem('steam-tracker-gh-token') || '');
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
    let envToken = '';
    try {
      // Safely check for env variables
      if (typeof process !== 'undefined' && process.env) {
        envToken = process.env.VITE_GITHUB_TOKEN || process.env.REACT_APP_GITHUB_TOKEN || '';
      }
    } catch (e) {
      // Ignore env errors quietly
    }
    return githubToken.trim() || envToken;
  };

  const pullFromGithub = async () => {
    const token = getGithubToken();
    if (!token) {
      setGithubMessage({ type: 'error', text: 'GitHub token is missing. Please provide one.' });
      return;
    }
    
    setGithubLoading(true);
    setGithubMessage({ type: '', text: '' });
    
    try {
      const response = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${FILE_PATH}`, {
        headers: { Authorization: `token ${token}` }
      });
      
      if (response.status === 404) {
         setGithubMessage({ type: 'error', text: 'No saved games found on GitHub yet. Try pushing your list first!' });
         return;
      }
      if (!response.ok) throw new Error('Failed to fetch from GitHub');
      
      const data = await response.json();
      // Decode Base64 content safely preserving unicode characters
      const decodedContent = decodeURIComponent(escape(atob(data.content)));
      const parsedGames = JSON.parse(decodedContent);
      
      setGames(parsedGames);
      setGithubMessage({ type: 'success', text: `Successfully loaded ${parsedGames.length} games from repository!` });
      localStorage.setItem('steam-tracker-gh-token', githubToken);
    } catch (err) {
      setGithubMessage({ type: 'error', text: err.message || 'Error pulling data from GitHub.' });
    } finally {
      setGithubLoading(false);
    }
  };

  const pushToGithub = async () => {
    const token = getGithubToken();
    if (!token) {
      setGithubMessage({ type: 'error', text: 'GitHub token is missing. Please provide one.' });
      return;
    }

    setGithubLoading(true);
    setGithubMessage({ type: '', text: '' });

    try {
      let sha = null;
      const getResponse = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${FILE_PATH}`, {
        headers: { Authorization: `token ${token}` }
      });
      
      if (getResponse.ok) {
        const data = await getResponse.json();
        sha = data.sha;
      }

      const contentStr = JSON.stringify(games, null, 2);
      // Encode to Base64 safely preserving unicode characters
      const encodedContent = btoa(unescape(encodeURIComponent(contentStr)));

      const putResponse = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${FILE_PATH}`, {
        method: 'PUT',
        headers: {
          Authorization: `token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: `Update games list (${games.length} games)`,
          content: encodedContent,
          ...(sha && { sha })
        })
      });

      if (!putResponse.ok) throw new Error('Failed to push to GitHub. Check if your token has repository write permissions.');
      
      setGithubMessage({ type: 'success', text: 'Successfully saved categorization to GitHub!' });
      localStorage.setItem('steam-tracker-gh-token', githubToken);
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
        // Automatically add current user to existing game
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
      const apiUrl = `https://store.steampowered.com/api/appdetails?appids=${appId}`;
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(apiUrl)}`;
      
      const response = await fetch(proxyUrl);
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
      console.warn('API fetch failed, utilizing bulletproof URL fallback...', err);
      
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
    setGames(games.map(g => g.id === id ? { ...g, ...updates } : g));
  };

  const deleteGame = (id) => {
    const game = games.find(g => g.id === id);
    if (!game) return;

    // If both users added the game and we are in a personal profile, just remove the current user's tag.
    if (activeProfile !== 'Combined' && game.addedBy && game.addedBy.length > 1) {
      setGames(games.map(g => 
        g.id === id ? { ...g, addedBy: g.addedBy.filter(p => p !== activeProfile) } : g
      ));
    } else {
      // Otherwise (only 1 user, or we are in Combined View), delete the game entirely
      setGames(games.filter(g => g.id !== id));
    }
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
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 selection:bg-indigo-500/30 font-sans text-slate-200">
        <div className="max-w-md w-full bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-2xl">
          <div className="flex justify-center mb-6">
            <div className="bg-indigo-500 p-3 rounded-xl shadow-lg shadow-indigo-500/20">
              <Gamepad2 className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-center mb-2 text-white">Who is playing?</h1>
          <p className="text-slate-400 text-center mb-8">Select your profile to continue</p>
          
          <div className="space-y-4">
            <button 
              onClick={() => setActiveProfile('Aadish')}
              className="w-full py-4 bg-slate-800 hover:bg-blue-600/20 border border-slate-700 hover:border-blue-500 text-white rounded-xl font-medium transition-all flex items-center gap-3 justify-center group"
            >
              <User className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
              Aadish
            </button>
            <button 
              onClick={() => setActiveProfile('Aditya')}
              className="w-full py-4 bg-slate-800 hover:bg-orange-600/20 border border-slate-700 hover:border-orange-500 text-white rounded-xl font-medium transition-all flex items-center gap-3 justify-center group"
            >
              <User className="w-5 h-5 text-orange-400 group-hover:scale-110 transition-transform" />
              Aditya
            </button>
            <div className="pt-4 border-t border-slate-800">
              <button 
                onClick={() => setActiveProfile('Combined')}
                className="w-full py-4 bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/30 hover:border-indigo-500 text-indigo-300 rounded-xl font-medium transition-all flex items-center gap-3 justify-center group"
              >
                <Users className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Combined View
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30 pb-12">
      
      {/* Pending Game Modal */}
      {pendingGame && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="relative h-48 bg-slate-800">
              <img 
                src={pendingGame.imageUrl} 
                alt={pendingGame.name}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.src = `https://placehold.co/460x215/1e293b/4f46e5?text=${encodeURIComponent(pendingGame.name)}`; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
            </div>
            
            <div className="p-6 -mt-8 relative z-10 space-y-6">
              <h3 className="text-xl font-bold text-white leading-tight">{pendingGame.name}</h3>
              
              <div className="space-y-4">
                {/* Tag Selection: Status */}
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Category: Progress</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPendingGame({...pendingGame, status: 'Wanted'})}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                        pendingGame.status === 'Wanted' 
                          ? 'bg-amber-500/20 border-amber-500/50 text-amber-300' 
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      Wanted to Play
                    </button>
                    <button
                      onClick={() => setPendingGame({...pendingGame, status: 'Played'})}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                        pendingGame.status === 'Played' 
                          ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300' 
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      Already Played
                    </button>
                  </div>
                </div>

                {/* Tag Selection: Mode */}
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Category: Mode</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPendingGame({...pendingGame, mode: 'Singleplayer'})}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                        pendingGame.mode === 'Singleplayer' 
                          ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300' 
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      Singleplayer
                    </button>
                    <button
                      onClick={() => setPendingGame({...pendingGame, mode: 'Multiplayer'})}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                        pendingGame.mode === 'Multiplayer' 
                          ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300' 
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      Multiplayer
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => setPendingGame(null)}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmAddGame}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Github className="w-6 h-6" /> GitHub Sync
            </h3>
            
            <p className="text-sm text-slate-400 mb-6">
              Save or load your categorized list to <strong className="text-indigo-400">{GITHUB_OWNER}/{GITHUB_REPO}</strong>. 
              The token is saved locally or can be injected via env variables.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5">GitHub Personal Access Token</label>
                <input
                  type="password"
                  value={githubToken}
                  onChange={(e) => setGithubToken(e.target.value)}
                  placeholder="ghp_... (or leave blank to use ENV)"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>

              {githubMessage.text && (
                <div className={`p-3 rounded-xl text-sm border flex items-start gap-2 ${
                  githubMessage.type === 'error' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                }`}>
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <p>{githubMessage.text}</p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button 
                  onClick={pullFromGithub}
                  disabled={githubLoading}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {githubLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CloudDownload className="w-4 h-4" />}
                  Load
                </button>
                <button 
                  onClick={pushToGithub}
                  disabled={githubLoading}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {githubLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CloudUpload className="w-4 h-4" />}
                  Save
                </button>
              </div>
              <button 
                onClick={() => { setShowGithubModal(false); setGithubMessage({type:'', text:''}); }}
                className="w-full py-3 bg-transparent text-slate-400 hover:text-white rounded-xl font-medium transition-colors mt-2"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-10 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-500 p-2 rounded-lg">
                <Gamepad2 className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                Steam Backlog
              </h1>
            </div>
            
            <div className="flex items-center gap-4 text-sm font-medium">
              <div className="hidden sm:flex items-center gap-4 border-r border-slate-700 pr-4">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Circle className="w-4 h-4 text-amber-400" />
                  <span>Wanted: <strong className="text-white">{filteredGames.filter(g => g.status === 'Wanted').length}</strong></span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Played: <strong className="text-white">{filteredGames.filter(g => g.status === 'Played').length}</strong></span>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowGithubModal(true)}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-slate-700 hidden sm:block"
                  title="GitHub Sync"
                >
                  <Github className="w-5 h-5" />
                </button>

                <span className={`hidden sm:inline-block px-3 py-1.5 rounded-lg border font-bold text-xs uppercase tracking-wider ${
                  activeProfile === 'Aadish' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' :
                  activeProfile === 'Aditya' ? 'bg-orange-500/20 text-orange-300 border-orange-500/30' :
                  'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                }`}>
                  {activeProfile}
                </span>
                
                <button 
                  onClick={() => setActiveProfile(null)}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-lg shadow-indigo-500/20"
                  title="Switch Profile"
                >
                  <Users className="w-4 h-4" />
                  <span className="hidden sm:inline">Switch Profile</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Add Game Section */}
        {activeProfile !== 'Combined' && (
          <section className="bg-slate-900 rounded-2xl p-4 sm:p-6 border border-slate-800 shadow-xl">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-white">
              <ListPlus className="w-5 h-5 text-indigo-400" />
              Add a New Game for {activeProfile}
            </h2>
            
            <form onSubmit={handleFetchGameDetails} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="Paste Steam game URL here (e.g., https://store.steampowered.com/app/1091500/...)"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 sm:py-4 text-sm sm:text-base outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder-slate-600"
                  disabled={loading}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 sm:py-4 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 whitespace-nowrap"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                {loading ? 'Fetching...' : 'Fetch Details'}
              </button>
            </form>
            
            {error && (
              <div className="mt-4 flex items-center gap-2 text-red-400 text-sm bg-red-400/10 p-3 rounded-lg border border-red-400/20">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}
          </section>
        )}

        {/* Filters and Search */}
        <section className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
          <div className="flex flex-wrap gap-2">
            <div className="bg-slate-900 rounded-xl p-1 border border-slate-800 flex">
              {['All', 'Wanted', 'Played'].map(status => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    statusFilter === status ? 'bg-slate-800 text-indigo-400 shadow-sm' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
            <div className="bg-slate-900 rounded-xl p-1 border border-slate-800 flex">
              {['All', 'Singleplayer', 'Multiplayer'].map(mode => (
                <button
                  key={mode}
                  onClick={() => setModeFilter(mode)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    modeFilter === mode ? 'bg-slate-800 text-indigo-400 shadow-sm' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            {activeProfile === 'Combined' && (
              <div className="bg-slate-900 rounded-xl p-1 border border-slate-800 flex">
                {['All', 'Aadish', 'Aditya', 'Both'].map(player => (
                  <button
                    key={player}
                    onClick={() => setPlayerFilter(player)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      playerFilter === player ? 'bg-slate-800 text-indigo-400 shadow-sm' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {player}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="relative w-full lg:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search games..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>
        </section>

        {/* Games Grid */}
        {filteredGames.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/50 rounded-2xl border border-slate-800/50 border-dashed">
            <Gamepad2 className="w-16 h-16 mx-auto text-slate-700 mb-4" />
            <h3 className="text-xl font-medium text-slate-300">No games found</h3>
            <p className="text-slate-500 mt-2">
              {profileFilteredGames.length === 0 
                ? "You haven't added any games yet. Paste a Steam URL above to get started!" 
                : "Try adjusting your filters or search query."}
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
                  className="group flex flex-col bg-slate-900 rounded-xl overflow-hidden border border-slate-800 hover:border-indigo-500/50 shadow-lg hover:shadow-indigo-500/10 transition-all duration-300"
                >
                  <div className="relative aspect-[460/215] bg-slate-950 overflow-hidden">
                    <img 
                      src={game.imageUrl} 
                      alt={game.name}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => { e.target.src = `https://placehold.co/460x215/1e293b/4f46e5?text=${encodeURIComponent(game.name)}`; }}
                    />
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                      <span className={`w-fit px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-md backdrop-blur-md shadow-sm border ${
                        game.status === 'Played' 
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      }`}>
                        {game.status}
                      </span>
                      {(isBoth || hasAadish || hasAditya) && (
                        <span className={`w-fit px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-md backdrop-blur-md shadow-sm border ${
                          isBoth ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' :
                          hasAadish ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' :
                          'bg-orange-500/20 text-orange-300 border-orange-500/30'
                        }`}>
                          {isBoth ? 'Selected by Both' : hasAadish ? 'Aadish Selected' : 'Aditya Selected'}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-4 flex flex-col flex-1">
                    <div className="flex justify-between items-start gap-3 mb-2">
                      <h3 className="font-bold text-lg leading-tight line-clamp-2 text-white" title={game.name}>
                        {game.name}
                      </h3>
                      <a 
                        href={game.steamUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-slate-500 hover:text-indigo-400 transition-colors p-1"
                        title="Open in Steam"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>

                    <div className="mt-auto pt-4 space-y-3">
                      <button 
                        onClick={() => updateGame(game.id, { mode: game.mode === 'Singleplayer' ? 'Multiplayer' : 'Singleplayer' })}
                        className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors bg-slate-950 w-fit px-2.5 py-1.5 rounded-lg border border-slate-800 hover:border-slate-600"
                        title="Click to toggle mode"
                      >
                        {game.mode === 'Multiplayer' 
                          ? <><Users className="w-3.5 h-3.5 text-cyan-400" /> Multiplayer</>
                          : <><User className="w-3.5 h-3.5 text-indigo-400" /> Singleplayer</>
                        }
                      </button>

                      <div className="flex items-center gap-2 pt-3 border-t border-slate-800">
                        {game.status === 'Wanted' ? (
                          <button
                            onClick={() => updateGame(game.id, { status: 'Played' })}
                            className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all bg-indigo-600/10 text-indigo-400 hover:bg-emerald-500/10 hover:text-emerald-400 border border-indigo-500/20 hover:border-emerald-500/30"
                          >
                            <CheckCircle2 className="w-4 h-4" /> Mark as Played
                          </button>
                        ) : (
                          <div className="flex-1"></div> // Placeholder to keep the delete button on the right
                        )}
                        
                        <button
                          onClick={() => deleteGame(game.id)}
                          className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg border border-transparent hover:border-red-400/20 transition-all"
                          title="Delete Game"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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
