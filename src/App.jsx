import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
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
  ArrowUpDown,
  X,
  Sparkles
} from 'lucide-react';

export default function App() {
  // App State
  const [games, setGames] = useState(() => {
    try {
      const saved = localStorage.getItem('steam-tracker-local');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [urlInput, setUrlInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Real-Time Search State
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchTimeoutRef = useRef(null);
  const dropdownRef = useRef(null);
  
  // Modals
  const [pendingGame, setPendingGame] = useState(null);
  const [editingGame, setEditingGame] = useState(null);
  const [gameToDelete, setGameToDelete] = useState(null); 
  
  // Filters & Sorting
  const [statusFilter, setStatusFilter] = useState('All');
  const [modeFilter, setModeFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('Newest');

  // Sync State
  const [syncStatus, setSyncStatus] = useState(''); 
  const isReadyForSync = useRef(false);

  // Profile State
  const [activeProfile, setActiveProfile] = useState(null);

  // ─── Metadata Injection ───────────────────────────────────────────
  useEffect(() => {
    document.title = "Steam Backlog";
    const setMeta = (name, content) => {
      let el = document.querySelector(`meta[name="${name}"]`);
      if (!el) { el = document.createElement('meta'); el.name = name; document.head.appendChild(el); }
      el.content = content;
    };
    setMeta('description', 'Track and manage your shared Steam game backlog seamlessly.');
    setMeta('theme-color', '#020617');
  }, []);

  // ─── Local Storage Auto-Save ──────────────────────────────────────
  useEffect(() => {
    localStorage.setItem('steam-tracker-local', JSON.stringify(games));
  }, [games]);

  // ─── Click Outside Listener for Dropdown ─────────────────────────
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ─── Profile Switching ────────────────────────────────────────────
  const loginAs = useCallback((profile) => {
    setActiveProfile(profile);
  }, []);

  // ─── GitHub Auto-Sync ─────────────────────────────────────────────
  const GITHUB_OWNER = 'AadishY';
  const GITHUB_REPO  = 'GamesList';
  const FILE_PATH    = 'games.json';

  const getGithubToken = () => { try { return import.meta.env.VITE_GITHUB_TOKEN || ''; } catch { return ''; } };
  const getRawgKey    = () => { try { return import.meta.env.VITE_RAWG_API_KEY   || ''; } catch { return ''; } };

  const pullFromGithub = useCallback(async () => {
    const token = getGithubToken();
    if (!token) { setTimeout(() => { isReadyForSync.current = true; }, 500); return; }
    setSyncStatus('syncing');
    try {
      const res = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${FILE_PATH}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.v3+json' }
      });
      if (res.ok) {
        const data = await res.json();
        setGames(JSON.parse(decodeURIComponent(escape(atob(data.content)))));
      }
      setSyncStatus('saved');
    } catch (err) {
      console.error('GitHub Pull Error:', err);
      setSyncStatus('error');
    } finally {
      setTimeout(() => { isReadyForSync.current = true; }, 1000);
    }
  }, []);

  const pushToGithub = useCallback(async (currentGames) => {
    const token = getGithubToken();
    if (!token) return;
    setSyncStatus('syncing');
    try {
      let sha = null;
      const getRes = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${FILE_PATH}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.v3+json' }
      });
      if (getRes.ok) sha = (await getRes.json()).sha;

      const putRes = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${FILE_PATH}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.v3+json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Auto-sync games list (${currentGames.length} games)`,
          content: btoa(unescape(encodeURIComponent(JSON.stringify(currentGames, null, 2)))),
          ...(sha && { sha })
        })
      });
      if (!putRes.ok) throw new Error('Failed to push to GitHub.');
      setSyncStatus('saved');
    } catch (err) {
      console.error('GitHub Push Error:', err);
      setSyncStatus('error');
    }
  }, []);

  useEffect(() => { pullFromGithub(); }, [pullFromGithub]);

  useEffect(() => {
    if (!isReadyForSync.current) return;
    const t = setTimeout(() => pushToGithub(games), 1000);
    return () => clearTimeout(t);
  }, [games, pushToGithub]);

  // ─── Utilities ────────────────────────────────────────────────────
  const extractGameInfo = (url) => {
    const match = url.match(/\/app\/(\d+)(?:\/([^\/?#]+))?/);
    if (!match) return null;
    return { appId: match[1], slugName: match[2] ? decodeURIComponent(match[2]).replace(/_/g, ' ') : null };
  };

  const fetchWithTimeout = async (resource, options = {}) => {
    const { timeout = 4000 } = options;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
      const res = await fetch(resource, { ...options, signal: controller.signal });
      clearTimeout(id);
      return res;
    } catch (e) { clearTimeout(id); throw e; }
  };

  /**
   * Normalize a name for deduplication: lowercase, strip special chars, collapse spaces.
   */
  const normalizeName = (name = '') =>
    name.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();

  /**
   * ─── FIXED: Robust Duplicate Check ──────────────────────────────
   * Checks both appId AND normalized name so games added via RAWG (slug appId)
   * and Steam URL (numeric appId) don't slip past each other.
   */
  const findDuplicate = useCallback((appId, name) => {
    const normalizedIncoming = normalizeName(name);
    return games.find(g =>
      (appId && String(g.appId) === String(appId)) ||
      (normalizedIncoming && normalizeName(g.name) === normalizedIncoming)
    );
  }, [games]);

  const checkAndHandleExisting = useCallback((appId, name) => {
    const existingGame = findDuplicate(appId, name);
    if (!existingGame) return false;

    const addedBy = existingGame.addedBy || [];
    if (addedBy.includes(activeProfile)) {
      setError('This game is already in your list!');
    } else {
      setGames(prev => prev.map(g =>
        g.id === existingGame.id ? { ...g, addedBy: [...addedBy, activeProfile] } : g
      ));
      setUrlInput('');
      setShowDropdown(false);
    }
    return true;
  }, [findDuplicate, activeProfile]);

  // ─── Real-Time RAWG Search ────────────────────────────────────────
  const searchRawg = async (query) => {
    const key = getRawgKey();
    if (!key) return;
    setIsSearching(true);
    try {
      const res = await fetchWithTimeout(
        `https://api.rawg.io/api/games?search=${encodeURIComponent(query)}&key=${key}&page_size=6`,
        { timeout: 3000 }
      );
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.results || []);
        setShowDropdown(true);
      }
    } catch (err) {
      console.error('RAWG Dropdown Search Error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setUrlInput(val);
    setError('');
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (!val.trim() || val.includes('steampowered.com')) {
      setSearchResults([]); setShowDropdown(false); setIsSearching(false); return;
    }
    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(() => searchRawg(val), 400);
  };

  const handleSelectSearchResult = (game) => {
    setShowDropdown(false);
    setUrlInput('');
    setError('');
    // ─── FIXED: pass BOTH slug and name to catch all duplicate scenarios ───
    if (checkAndHandleExisting(game.slug, game.name)) return;

    const isMultiplayer = game.tags?.some(t => t.slug.includes('multiplayer') || t.slug.includes('co-op'));
    setPendingGame({
      appId: String(game.slug),
      name: game.name,
      imageUrl: game.background_image || `https://placehold.co/460x215/1e293b/4f46e5?text=${encodeURIComponent(game.name)}`,
      steamUrl: `https://store.steampowered.com/search/?term=${encodeURIComponent(game.name)}`,
      status: 'Wanted',
      mode: isMultiplayer ? 'Multiplayer' : 'Singleplayer'
    });
  };

  // ─── Manual / URL Submit ──────────────────────────────────────────
  const handleFetchGameDetails = async (e) => {
    e.preventDefault();
    setError('');
    if (activeProfile === 'Combined') return;
    if (!urlInput.trim()) { setError('Please enter a game name or Steam URL'); return; }

    const input = urlInput.trim();
    const isSteamUrl = input.includes('steampowered.com/app/');
    setLoading(true);
    setShowDropdown(false);

    try {
      let finalGameData = null;

      if (isSteamUrl) {
        const info = extractGameInfo(input);
        if (!info) throw new Error('Invalid Steam URL.');
        const { appId, slugName } = info;

        // ─── FIXED: check by both appId AND slugName upfront ───
        if (checkAndHandleExisting(appId, slugName)) { setLoading(false); return; }

        try {
          const apiUrl = `https://store.steampowered.com/api/appdetails?appids=${appId}`;
          const res = await fetchWithTimeout(`https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(apiUrl)}`, { timeout: 4000 });
          if (!res.ok) throw new Error('Proxy error');
          const steamData = await res.json();
          if (!steamData?.[appId]?.success) throw new Error('Game not found or is age-restricted');

          const details = steamData[appId].data;

          // ─── FIXED: also check by the resolved name after fetching ───
          if (checkAndHandleExisting(appId, details.name)) { setLoading(false); return; }

          const isMultiplayer = details.categories?.some(c =>
            c.description.toLowerCase().includes('multi-player') ||
            c.description.toLowerCase().includes('co-op')
          );
          finalGameData = {
            appId: String(appId),
            name: details.name,
            imageUrl: details.header_image,
            steamUrl: input,
            status: 'Wanted',
            mode: isMultiplayer ? 'Multiplayer' : 'Singleplayer'
          };
        } catch (err) {
          console.warn('Steam API fallback:', err.message);
          const fallbackName = slugName || `Steam Game ${appId}`;
          // ─── FIXED: one more check with fallback name ───
          if (checkAndHandleExisting(appId, fallbackName)) { setLoading(false); return; }
          finalGameData = {
            appId: String(appId),
            name: fallbackName,
            imageUrl: `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${appId}/header.jpg`,
            steamUrl: input,
            status: 'Wanted',
            mode: 'Singleplayer'
          };
        }
      } else {
        const key = getRawgKey();
        if (!key) throw new Error('VITE_RAWG_API_KEY is missing from environment variables.');
        const res = await fetchWithTimeout(
          `https://api.rawg.io/api/games?search=${encodeURIComponent(input)}&key=${key}&page_size=1`,
          { timeout: 4000 }
        );
        if (!res.ok) throw new Error('Failed to fetch from RAWG API');
        const data = await res.json();
        if (!data.results?.length) throw new Error('No game found with that name.');

        const game = data.results[0];
        // ─── FIXED: pass both slug and name ───
        if (checkAndHandleExisting(game.slug, game.name)) { setLoading(false); return; }

        const isMultiplayer = game.tags?.some(t => t.slug.includes('multiplayer') || t.slug.includes('co-op'));
        finalGameData = {
          appId: String(game.slug),
          name: game.name,
          imageUrl: game.background_image || `https://placehold.co/460x215/1e293b/4f46e5?text=${encodeURIComponent(game.name)}`,
          steamUrl: `https://store.steampowered.com/search/?term=${encodeURIComponent(game.name)}`,
          status: 'Wanted',
          mode: isMultiplayer ? 'Multiplayer' : 'Singleplayer'
        };
      }

      setPendingGame(finalGameData);
    } catch (err) {
      setError(err.message || 'Error finding game.');
    } finally {
      setLoading(false);
    }
  };

  const confirmAddGame = useCallback(() => {
    if (!pendingGame) return;
    setGames(prev => [{
      ...pendingGame,
      id: crypto.randomUUID(),
      addedAt: Date.now(),
      addedBy: [activeProfile]
    }, ...prev]);
    setPendingGame(null);
    setUrlInput('');
  }, [pendingGame, activeProfile]);

  // ─── Edit / Delete ────────────────────────────────────────────────
  const saveEditedGame = useCallback(() => {
    if (activeProfile === 'Combined' || !editingGame) return;
    setGames(prev => prev.map(g => g.id === editingGame.id ? { ...editingGame } : g));
    setEditingGame(null);
  }, [activeProfile, editingGame]);

  const confirmDeleteGame = useCallback(() => {
    if (activeProfile === 'Combined' || !gameToDelete) return;
    setGames(prev =>
      prev.map(g => {
        if (g.id !== gameToDelete.id) return g;
        return { ...g, addedBy: (g.addedBy || []).filter(p => p !== activeProfile) };
      }).filter(g => g.addedBy?.length > 0)
    );
    setGameToDelete(null);
  }, [activeProfile, gameToDelete]);

  // ─── Filtered + Sorted Games ──────────────────────────────────────
  const filteredGames = useMemo(() => {
    let result = games
      .filter(game => {
        if (activeProfile === 'Combined') return true;
        return (game.addedBy || []).includes(activeProfile);
      })
      .filter(game => statusFilter === 'All' || game.status === statusFilter)
      .filter(game => modeFilter === 'All' || game.mode === modeFilter)
      .filter(game => game.name.toLowerCase().includes(searchQuery.toLowerCase()));

    result.sort((a, b) => {
      switch (sortOption) {
        case 'Newest': return b.addedAt - a.addedAt;
        case 'Oldest': return a.addedAt - b.addedAt;
        case 'A-Z':    return a.name.localeCompare(b.name);
        case 'Z-A':    return b.name.localeCompare(a.name);
        default:       return b.addedAt - a.addedAt;
      }
    });
    return result;
  }, [games, activeProfile, statusFilter, modeFilter, searchQuery, sortOption]);

  const stats = useMemo(() => ({
    wanted: filteredGames.filter(g => g.status === 'Wanted').length,
    played: filteredGames.filter(g => g.status === 'Played').length,
    total:  filteredGames.length,
  }), [filteredGames]);

  // ─── Shared Modal Button Classes ──────────────────────────────────
  const pillBtn = (active, color) =>
    `flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all duration-200 active:scale-95 ${
      active
        ? `${color.active} shadow-sm`
        : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200'
    }`;

  // ─── Reusable Status/Mode Picker ──────────────────────────────────
  const StatusModePicker = ({ gameState, setGameState }) => (
    <div className="space-y-4">
      <div>
        <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-widest">Progress</label>
        <div className="flex gap-2">
          <button onClick={() => setGameState(s => ({...s, status: 'Wanted'}))}
            className={pillBtn(gameState.status === 'Wanted', { active: 'bg-amber-500/20 border-amber-500/40 text-amber-300' })}>
            Wanted
          </button>
          <button onClick={() => setGameState(s => ({...s, status: 'Played'}))}
            className={pillBtn(gameState.status === 'Played', { active: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' })}>
            Played
          </button>
        </div>
      </div>
      <div>
        <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-widest">Mode</label>
        <div className="flex gap-2">
          <button onClick={() => setGameState(s => ({...s, mode: 'Singleplayer'}))}
            className={pillBtn(gameState.mode === 'Singleplayer', { active: 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300' })}>
            Singleplayer
          </button>
          <button onClick={() => setGameState(s => ({...s, mode: 'Multiplayer'}))}
            className={pillBtn(gameState.mode === 'Multiplayer', { active: 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300' })}>
            Multiplayer
          </button>
        </div>
      </div>
    </div>
  );

  // ─── Game Modal Shell ─────────────────────────────────────────────
  const GameModal = ({ game, onClose, children, accentClass = '' }) => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className={`bg-[#0d1117] border rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 ${accentClass || 'border-white/8'}`}>
        <div className="relative h-52 bg-slate-900 overflow-hidden">
          <img src={game.imageUrl} alt={game.name} className="w-full h-full object-cover opacity-80"
            onError={(e) => { e.target.src = `https://placehold.co/460x215/0f172a/4f46e5?text=${encodeURIComponent(game.name)}`; }} />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d1117] via-[#0d1117]/30 to-transparent" />
          <button onClick={onClose}
            className="absolute top-3 right-3 text-slate-400 hover:text-white bg-black/40 hover:bg-black/60 rounded-full p-1.5 transition-all backdrop-blur-sm">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-6 pb-6 -mt-8 relative z-10 space-y-5">
          <h3 className="text-2xl font-bold text-white leading-tight drop-shadow-lg">{game.name}</h3>
          {children}
        </div>
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════
  // PROFILE SELECTOR
  // ═══════════════════════════════════════════════════════════════════
  if (!activeProfile) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4 selection:bg-indigo-500/30 font-sans">
        {/* Ambient glow */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-700/10 rounded-full blur-[120px]" />
        </div>

        <div className="relative max-w-sm w-full animate-in fade-in zoom-in-95 duration-500">
          {/* Card */}
          <div className="bg-slate-900/70 backdrop-blur-2xl p-8 rounded-[2rem] border border-white/6 shadow-2xl">
            {/* Logo */}
            <div className="flex justify-center mb-7">
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-500/30 blur-xl rounded-2xl" />
                <div className="relative bg-gradient-to-br from-indigo-500 to-purple-600 p-3.5 rounded-2xl shadow-lg">
                  <Gamepad2 className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>

            <h1 className="text-2xl font-bold text-center mb-1 text-white tracking-tight">Steam Backlog</h1>
            <p className="text-slate-500 text-sm text-center mb-8">Select your profile to continue</p>
            
            <div className="space-y-3">
              {[
                { name: 'Aadish',  color: 'blue',   hoverBg: 'hover:bg-blue-600/15',   borderHover: 'hover:border-blue-500/40',  glow: 'hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]', iconColor: 'text-blue-400' },
                { name: 'Aditya', color: 'orange', hoverBg: 'hover:bg-orange-600/15', borderHover: 'hover:border-orange-500/40', glow: 'hover:shadow-[0_0_20px_rgba(249,115,22,0.15)]',  iconColor: 'text-orange-400' },
              ].map(p => (
                <button key={p.name} onClick={() => loginAs(p.name)}
                  className={`w-full py-3.5 bg-white/4 ${p.hoverBg} border border-white/6 ${p.borderHover} text-white rounded-2xl font-semibold transition-all duration-200 flex items-center gap-3 justify-center group ${p.glow} active:scale-[0.98]`}>
                  <User className={`w-4.5 h-4.5 ${p.iconColor} group-hover:scale-110 transition-transform duration-200`} />
                  {p.name}
                </button>
              ))}

              <div className="pt-4 mt-1 border-t border-white/5">
                <button onClick={() => loginAs('Combined')}
                  className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-2xl font-bold transition-all duration-200 flex items-center gap-3 justify-center shadow-[0_0_25px_rgba(99,102,241,0.3)] hover:shadow-[0_0_35px_rgba(99,102,241,0.45)] active:scale-[0.98]">
                  <Users className="w-5 h-5" />
                  Combined Library
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════
  // MAIN APP
  // ═══════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-indigo-500/30 pb-16 animate-in fade-in duration-300">
      
      {/* ── Ambient Background ── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div className="absolute top-0 left-1/3 w-[500px] h-[300px] bg-indigo-900/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/3 right-0 w-[400px] h-[400px] bg-purple-900/10 rounded-full blur-[120px]" />
      </div>

      {/* ── Delete Confirmation Modal ── */}
      {gameToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="bg-[#0d1117] border border-red-500/20 rounded-3xl w-full max-w-sm p-6 shadow-[0_0_60px_rgba(239,68,68,0.12)] animate-in fade-in zoom-in-95 duration-200 text-center relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-red-500/60 to-transparent" />
            <div className="mx-auto w-14 h-14 bg-red-500/10 flex items-center justify-center rounded-2xl mb-4 border border-red-500/15">
              <Trash2 className="w-6 h-6 text-red-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1.5">Remove Game?</h3>
            <p className="text-sm text-slate-400 mb-6">
              Remove <strong className="text-slate-200">{gameToDelete.name}</strong> from your list?
            </p>
            <div className="flex gap-2.5">
              <button onClick={() => setGameToDelete(null)}
                className="flex-1 py-2.5 bg-white/5 hover:bg-white/8 border border-white/6 text-slate-300 rounded-xl text-sm font-semibold transition-all active:scale-[0.98]">
                Cancel
              </button>
              <button onClick={confirmDeleteGame}
                className="flex-1 py-2.5 bg-red-500/12 hover:bg-red-500/20 text-red-400 border border-red-500/25 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-1.5 active:scale-[0.98]">
                <Trash2 className="w-3.5 h-3.5" /> Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Game Modal ── */}
      {pendingGame && (
        <GameModal game={pendingGame} onClose={() => setPendingGame(null)}>
          <StatusModePicker gameState={pendingGame} setGameState={setPendingGame} />
          <div className="flex gap-2.5 pt-1">
            <button onClick={() => setPendingGame(null)}
              className="flex-1 py-3 bg-white/5 hover:bg-white/8 border border-white/6 text-slate-300 rounded-xl text-sm font-semibold transition-all active:scale-[0.98]">
              Cancel
            </button>
            <button onClick={confirmAddGame}
              className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-1.5 shadow-[0_0_20px_rgba(79,70,229,0.25)] hover:shadow-[0_0_28px_rgba(79,70,229,0.4)] active:scale-[0.98]">
              <ListPlus className="w-4 h-4" /> Add to Library
            </button>
          </div>
        </GameModal>
      )}

      {/* ── Edit Game Modal ── */}
      {editingGame && (
        <GameModal game={editingGame} onClose={() => setEditingGame(null)}>
          <StatusModePicker gameState={editingGame} setGameState={setEditingGame} />
          <div className="flex flex-col gap-2.5 pt-1">
            <div className="flex gap-2.5">
              <button onClick={() => setEditingGame(null)}
                className="flex-1 py-3 bg-white/5 hover:bg-white/8 border border-white/6 text-slate-300 rounded-xl text-sm font-semibold transition-all active:scale-[0.98]">
                Cancel
              </button>
              <button onClick={saveEditedGame}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-1.5 shadow-[0_0_20px_rgba(16,185,129,0.2)] active:scale-[0.98]">
                <CheckCircle2 className="w-4 h-4" /> Save
              </button>
            </div>
            <button onClick={() => { setGameToDelete(editingGame); setEditingGame(null); }}
              className="w-full py-2.5 bg-red-500/8 hover:bg-red-500/15 border border-red-500/15 text-red-400 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-1.5 active:scale-[0.98]">
              <Trash2 className="w-3.5 h-3.5" /> Remove from my list
            </button>
          </div>
        </GameModal>
      )}

      {/* ── Header ── */}
      <header className="bg-slate-950/80 backdrop-blur-xl border-b border-white/5 sticky top-0 z-40 shadow-[0_1px_0_rgba(255,255,255,0.04)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="flex items-center justify-between gap-4">
            
            {/* Left: Logo + stats */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 bg-indigo-500/20 blur-lg rounded-xl" />
                <div className="relative bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-xl">
                  <Gamepad2 className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="min-w-0">
                <h1 className="text-lg font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent tracking-tight leading-none">
                  Steam Backlog
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  {/* Sync indicator */}
                  {syncStatus === 'syncing' && (
                    <span className="text-[10px] text-indigo-400 flex items-center gap-1 font-semibold">
                      <Loader2 className="w-3 h-3 animate-spin" /> Syncing
                    </span>
                  )}
                  {syncStatus === 'saved' && (
                    <span className="text-[10px] text-emerald-500 flex items-center gap-1 font-semibold animate-in fade-in">
                      <Cloud className="w-3 h-3" /> Saved
                    </span>
                  )}
                  {syncStatus === 'error' && (
                    <span className="text-[10px] text-red-400 flex items-center gap-1 font-semibold">
                      <AlertCircle className="w-3 h-3" /> Error
                    </span>
                  )}
                  {/* Pill counters */}
                  <div className="flex items-center gap-1">
                    <span className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/15 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      <Circle className="w-2.5 h-2.5" /> {stats.wanted}
                    </span>
                    <span className="flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/15 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-2.5 h-2.5" /> {stats.played}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Profile buttons */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {activeProfile !== 'Combined' && (
                <button onClick={() => loginAs('Combined')}
                  className="hidden sm:flex items-center gap-1.5 bg-white/4 hover:bg-white/8 border border-white/6 text-slate-300 px-3.5 py-2 rounded-full text-xs font-semibold transition-all active:scale-[0.98]">
                  <Users className="w-3.5 h-3.5" /> Combined
                </button>
              )}
              <button onClick={() => loginAs(null)}
                className="flex items-center gap-1.5 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white px-4 py-2 rounded-full text-xs font-bold transition-all shadow-[0_0_15px_rgba(244,63,94,0.3)] hover:shadow-[0_0_22px_rgba(244,63,94,0.45)] active:scale-[0.98]">
                {activeProfile === 'Combined' ? <Users className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                <span className="max-w-[90px] truncate">{activeProfile}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 space-y-7">

        {/* ── Add Game Section ── */}
        {activeProfile !== 'Combined' && (
          <section className="relative bg-slate-900/40 backdrop-blur-sm rounded-3xl p-5 sm:p-7 border border-white/6 shadow-xl">
            {/* Decorative blob — clipped INDEPENDENTLY so overflow doesn't clip the dropdown */}
            <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none" aria-hidden="true">
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-600/8 rounded-full blur-3xl" />
            </div>

            <h2 className="relative text-base font-bold mb-4 flex items-center gap-2 text-white tracking-tight">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              Add to {activeProfile}'s List
            </h2>

            {/* ── FIXED: ref on wrapper div, NOT the form; section has no overflow-hidden ── */}
            <div ref={dropdownRef} className="relative z-10">
              <form onSubmit={handleFetchGameDetails} className="flex flex-col sm:flex-row gap-2.5">
                <div className="relative flex-1">
                  <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none transition-colors ${isSearching ? 'text-indigo-400 animate-pulse' : 'text-slate-500'}`} />
                  <input
                    type="text"
                    value={urlInput}
                    onChange={handleInputChange}
                    placeholder="Search game name or paste Steam URL…"
                    className="w-full bg-slate-950/60 border border-white/8 rounded-2xl pl-11 pr-10 py-3.5 text-sm outline-none focus:border-indigo-500/50 focus:bg-slate-950/80 transition-all placeholder-slate-600 shadow-inner"
                    disabled={loading}
                    autoComplete="off"
                  />
                  {urlInput && (
                    <button type="button"
                      onClick={() => { setUrlInput(''); setShowDropdown(false); setIsSearching(false); }}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-0.5">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* ── FIXED: Dropdown — z-[200] ensures it's above ALL other content ── */}
                  {showDropdown && searchResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1.5 bg-[#0d1117]/98 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] z-[200] max-h-72 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full animate-in fade-in slide-in-from-top-1 duration-150">
                      {searchResults.map((game) => (
                        <div key={game.id} onClick={() => handleSelectSearchResult(game)}
                          className="flex items-center gap-3.5 p-3 hover:bg-white/6 cursor-pointer transition-colors border-b border-white/4 last:border-0 first:rounded-t-2xl last:rounded-b-2xl">
                          <img
                            src={game.background_image || `https://placehold.co/80x80/1e293b/4f46e5?text=${encodeURIComponent(game.name)}`}
                            alt={game.name}
                            className="w-12 h-12 rounded-xl object-cover border border-white/8 shadow-sm flex-shrink-0"
                          />
                          <div className="flex flex-col min-w-0">
                            <span className="font-semibold text-white text-sm truncate">{game.name}</span>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] font-bold text-slate-500 bg-white/5 px-1.5 py-0.5 rounded-md">
                                {game.released?.substring(0, 4) || 'TBA'}
                              </span>
                              {game.genres?.length > 0 && (
                                <span className="text-[10px] text-slate-600 truncate font-medium">
                                  {game.genres.slice(0, 2).map(g => g.name).join(' · ')}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button type="submit" disabled={loading || isSearching}
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-6 py-3.5 rounded-2xl text-sm font-semibold transition-all flex items-center justify-center gap-2 whitespace-nowrap shadow-[0_0_15px_rgba(79,70,229,0.2)] hover:shadow-[0_0_22px_rgba(79,70,229,0.35)] active:scale-[0.98]">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ListPlus className="w-4 h-4" />}
                  {loading ? 'Fetching…' : 'Add URL'}
                </button>
              </form>

              {error && (
                <div className="mt-3 flex items-center gap-2 text-red-400 text-sm bg-red-500/8 px-4 py-3 rounded-xl border border-red-500/15 animate-in slide-in-from-top-1 duration-150">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <p>{error}</p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── Filters ── */}
        <section className="flex flex-col lg:flex-row gap-3 lg:items-center justify-between">
          {/* Left: filter pills */}
          <div className="flex gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {/* Status filter */}
            <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-1 flex gap-0.5 flex-shrink-0">
              {['All', 'Wanted', 'Played'].map(s => (
                <button key={s} onClick={() => setStatusFilter(s)}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                    statusFilter === s
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/25'
                      : 'text-slate-500 hover:text-slate-300 hover:bg-white/4'
                  }`}>
                  {s}
                </button>
              ))}
            </div>

            {/* Mode filter */}
            <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-1 flex gap-0.5 flex-shrink-0">
              {['All', 'Singleplayer', 'Multiplayer'].map(m => (
                <button key={m} onClick={() => setModeFilter(m)}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                    modeFilter === m
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/25'
                      : 'text-slate-500 hover:text-slate-300 hover:bg-white/4'
                  }`}>
                  {m}
                </button>
              ))}
            </div>

            {/* Combined-view player filter */}
            {activeProfile === 'Combined' && (
              <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-1 flex gap-0.5 flex-shrink-0">
                {['All', 'Aadish', 'Aditya'].map(p => (
                  <button key={p}
                    onClick={() => {
                      // player filter logic via status filter repurpose not needed;
                      // filteredGames already handles Combined = all
                      // We can leave this as visual only or wire a playerFilter state
                      // For Combined, we'll just show all — no-op for now
                    }}
                    className="px-4 py-1.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-300 hover:bg-white/4 transition-all">
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: sort + search */}
          <div className="flex gap-2 flex-shrink-0 w-full lg:w-auto">
            <div className="relative">
              <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
              <select value={sortOption} onChange={(e) => setSortOption(e.target.value)}
                className="bg-slate-900/50 border border-white/5 rounded-2xl pl-9 pr-4 py-2.5 text-xs text-slate-300 font-semibold outline-none focus:border-indigo-500/40 transition-all appearance-none cursor-pointer hover:bg-slate-800/50">
                <option value="Newest">Newest</option>
                <option value="Oldest">Oldest</option>
                <option value="A-Z">A → Z</option>
                <option value="Z-A">Z → A</option>
              </select>
            </div>
            <div className="relative flex-1 lg:w-56">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search library…"
                className="w-full bg-slate-900/50 border border-white/5 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-medium outline-none focus:border-indigo-500/40 focus:bg-slate-900/70 transition-all placeholder-slate-600" />
            </div>
          </div>
        </section>

        {/* ── Results count ── */}
        {stats.total > 0 && (
          <p className="text-xs text-slate-600 font-medium -mt-3">
            Showing <span className="text-slate-400 font-bold">{stats.total}</span> game{stats.total !== 1 ? 's' : ''}
          </p>
        )}

        {/* ── Games Grid ── */}
        {filteredGames.length === 0 ? (
          <div className="text-center py-24 bg-slate-900/25 rounded-3xl border border-white/4 border-dashed">
            <div className="w-16 h-16 mx-auto bg-slate-800/60 rounded-3xl flex items-center justify-center mb-5 border border-white/5">
              <Gamepad2 className="w-8 h-8 text-slate-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-400 tracking-tight">No games here</h3>
            <p className="text-slate-600 mt-2 text-sm max-w-xs mx-auto">
              {games.length === 0
                ? 'Your library is empty. Search a game or paste a Steam URL above to get started.'
                : 'No games match your current filters.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredGames.map((game, idx) => {
              const addedBy  = game.addedBy || [];
              const isBoth   = addedBy.length >= 2;
              const hasAadish = addedBy.includes('Aadish');
              const hasAditya = addedBy.includes('Aditya');
              const isMyGame  = activeProfile !== 'Combined' && addedBy.includes(activeProfile);

              return (
                <div key={game.id}
                  className="group flex flex-col bg-slate-900/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/5 hover:border-indigo-500/25 shadow-md hover:shadow-[0_8px_32px_rgba(79,70,229,0.12)] hover:-translate-y-0.5 transition-all duration-250 animate-in fade-in slide-in-from-bottom-3"
                  style={{ animationFillMode: 'both', animationDelay: `${Math.min(idx * 40, 400)}ms` }}>
                  
                  {/* Game image */}
                  <div className="relative aspect-[460/215] bg-slate-950 overflow-hidden">
                    <img src={game.imageUrl} alt={game.name}
                      className="w-full h-full object-cover transform group-hover:scale-[1.04] transition-transform duration-500 ease-out"
                      onError={(e) => { e.target.src = `https://placehold.co/460x215/0f172a/4f46e5?text=${encodeURIComponent(game.name)}`; }} />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
                    
                    {/* Top-left badges */}
                    <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
                      <span className={`w-fit px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest rounded-lg backdrop-blur-md border ${
                        game.status === 'Played'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/25'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/25'
                      }`}>
                        {game.status}
                      </span>
                      {(isBoth || hasAadish || hasAditya) && (
                        <span className={`w-fit px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest rounded-lg backdrop-blur-md border ${
                          isBoth    ? 'bg-purple-500/20 text-purple-300 border-purple-500/25' :
                          hasAadish ? 'bg-blue-500/20   text-blue-300   border-blue-500/25'   :
                                      'bg-orange-500/20 text-orange-300 border-orange-500/25'
                        }`}>
                          {isBoth ? '👥 Both' : hasAadish ? 'Aadish' : 'Aditya'}
                        </span>
                      )}
                    </div>

                    {/* Steam link */}
                    <a href={game.steamUrl} target="_blank" rel="noopener noreferrer"
                      className="absolute top-2.5 right-2.5 text-slate-400 hover:text-white bg-black/40 hover:bg-black/60 backdrop-blur-sm p-1.5 rounded-xl transition-all opacity-0 group-hover:opacity-100 active:scale-95"
                      title="Open in Steam" onClick={e => e.stopPropagation()}>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  {/* Card body */}
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="font-bold text-sm leading-snug line-clamp-2 text-white/85 group-hover:text-white transition-colors mb-3" title={game.name}>
                      {game.name}
                    </h3>

                    <div className="mt-auto space-y-3">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        {game.mode === 'Multiplayer'
                          ? <><Users className="w-3 h-3 text-cyan-500" /> Multiplayer</>
                          : <><User className="w-3 h-3 text-indigo-400" /> Singleplayer</>
                        }
                      </div>

                      <div className="pt-3 border-t border-white/4">
                        {activeProfile === 'Combined' ? (
                          <div className="flex items-center justify-center gap-1.5 py-2 w-full rounded-xl bg-white/3 text-slate-600 text-[10px] font-bold uppercase tracking-wider">
                            <ShieldAlert className="w-3 h-3" /> Read Only
                          </div>
                        ) : isMyGame ? (
                          <button onClick={() => setEditingGame(game)}
                            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all bg-white/4 text-slate-400 hover:bg-white/8 hover:text-slate-200 border border-white/5 hover:border-white/10 active:scale-[0.98]">
                            <Pencil className="w-3.5 h-3.5" /> Edit
                          </button>
                        ) : (
                          <div className="flex items-center justify-center gap-1.5 py-2 w-full rounded-xl bg-white/3 text-slate-600 text-[10px] font-bold uppercase tracking-wider">
                            <ShieldAlert className="w-3 h-3" /> View Only
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
