import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Gamepad2, ListPlus, X, Settings2 } from 'lucide-react';

import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';

// Extracted Components
import ProfileSelector from './components/ProfileSelector';
import Header from './components/Header';
import DeleteModal from './components/DeleteModal';
import GameModal from './components/GameModal';
import AddGameSection from './components/AddGameSection';
import FilterSection from './components/FilterSection';
import GameCard from './components/GameCard';
import Footer from './components/Footer';
import SharedList from './components/SharedList';
import ModsList from './components/ModsList';

export default function App() {
  // App State
  const [games, setGames] = useState([]);
  const [mods, setMods] = useState([]);
  const [urlInput, setUrlInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Real-Time Search State
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchTimeoutRef = useRef(null);
  const dropdownRef = useRef(null);
  const searchCache = useRef({});
  const searchAbortRef = useRef(null);
  
  // Modals
  const [showListOverlay, setShowListOverlay] = useState(false);
  const [pendingGame, setPendingGame] = useState(null);
  const [editingGame, setEditingGame] = useState(null);
  const [gameToDelete, setGameToDelete] = useState(null); 
  
  // Filters & Sorting
  const [statusFilter, setStatusFilter] = useState('All');
  const [modeFilter, setModeFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [playerFilter, setPlayerFilter] = useState('All');
  const [sortOption, setSortOption] = useState('Newest');

  // View Mode State (persisted)
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('steam-tracker-viewMode') || 'grid';
  });

  const handleSetViewMode = useCallback((mode) => {
    setViewMode(mode);
    localStorage.setItem('steam-tracker-viewMode', mode);
  }, []);

  // Sync State
  const [syncStatus, setSyncStatus] = useState('syncing'); 
  const isReadyForSync = useRef(false);

  // Router specific
  const navigate = useNavigate();
  const location = useLocation();

  // Profile State will be derived from URL params or maintained closely
  // For simplicity, we define activeProfile from App state, but update it based on route change.
  const getInitialProfile = () => {
    const path = window.location.pathname;
    const parts = path.split('/').filter(Boolean);
    const profileSegment = parts[0];
    if (['Aadish', 'Aditya', 'Combined'].includes(profileSegment)) {
      return profileSegment;
    }
    return null;
  };
  const [activeProfile, setActiveProfile] = useState(getInitialProfile);

  // Theme State
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('steam-tracker-theme') || 'dark';
  });

  useEffect(() => {
    localStorage.setItem('steam-tracker-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  }, []);

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
    themeColor.content = theme === 'dark' ? "#020617" : "#f8fafc";
  }, [theme]);

  // Click outside listener for Dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- Profile Switching Helper ---
  const loginAs = useCallback((profile) => {
    setActiveProfile(profile);
    if (profile !== 'Combined') {
      setPlayerFilter(profile); 
    } else {
      setPlayerFilter('All');
    }
    navigate(`/${profile}`);
  }, [navigate]);

  // Sync profile state with route config
  useEffect(() => {
    const path = location.pathname;
    const parts = path.split('/').filter(Boolean);
    const profileSegment = parts[0];

    if (!profileSegment) {
      setActiveProfile(null);
    } else if (['Aadish', 'Aditya', 'Combined'].includes(profileSegment)) {
      setActiveProfile(profileSegment);
      if (profileSegment !== 'Combined') {
        setPlayerFilter(profileSegment);
      } else {
        setPlayerFilter('All');
      }
    }
  }, [location.pathname]);

  // Helper function to replace local setGames state mutations with Firebase updates
  const updateFirebaseGame = async (gameId, updateFn) => {
    setSyncStatus('syncing');
    try {
      const currentGame = games.find(g => g.id === gameId);
      if (currentGame) {
        const updatedGame = updateFn({ ...currentGame });
        await setDoc(doc(db, 'games', String(gameId)), updatedGame);
        setSyncStatus('saved');
      }
    } catch (e) {
      console.error(e);
      setSyncStatus('error');
    }
  };

  const getRawgKey = () => {
    try {
      return import.meta.env.VITE_RAWG_API_KEY || '';
    } catch {
      return '';
    }
  };

  // --- Firebase Auto-Sync Functions ---
  useEffect(() => {
    setSyncStatus('syncing');

    const unsubGames = onSnapshot(collection(db, 'games'), (snapshot) => {
      const dbGames = [];
      snapshot.forEach(doc => {
        dbGames.push({ ...doc.data(), id: doc.id });
      });
      setGames(dbGames);
      setSyncStatus('saved');
      isReadyForSync.current = true;
    }, (err) => {
      console.error("Firebase games sync error:", err);
      setSyncStatus('error');
    });

    const unsubMods = onSnapshot(collection(db, 'mods'), (snapshot) => {
      const dbMods = [];
      snapshot.forEach(doc => {
        dbMods.push({ ...doc.data(), id: doc.id });
      });
      setMods(dbMods);
    }, (err) => {
      console.error("Firebase mods sync error:", err);
    });

    return () => {
      unsubGames();
      unsubMods();
    };
  }, []);

  // --- Game Parsing & Fetching Utilities ---
  const extractGameInfo = (url) => {
    const match = url.match(/\/app\/(\d+)(?:\/([^/?#]+))?/);
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

  const normalizeString = (str) => {
    if (!str) return '';
    return str.toLowerCase().replace(/[^a-z0-9]/gi, '');
  };

  const getExistingGame = useCallback((appId, name) => {
    return games.find(g => 
      String(g.appId) === String(appId) || 
      (name && normalizeString(g.name) === normalizeString(name))
    );
  }, [games]);

  const checkAndHandleExisting = useCallback((appId, name) => {
    const existingGame = getExistingGame(appId, name);
    if (existingGame) {
      const addedBy = existingGame.addedBy || [];
      if (addedBy.includes(activeProfile)) {
        setError('This game is already in your list!');
        return true;
      }
      return false;
    }
    return false;
  }, [activeProfile, getExistingGame]);

  // --- Real-time Search Logic ---
  const searchRawg = async (query) => {
    const rawgKey = getRawgKey();
    if (!rawgKey) return;
    
    if (searchCache.current[query]) {
      setSearchResults(searchCache.current[query]);
      setShowDropdown(true);
      setIsSearching(false);
      return;
    }

    if (searchAbortRef.current) searchAbortRef.current.abort();
    const controller = new AbortController();
    searchAbortRef.current = controller;

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://api.rawg.io/api/games?search=${encodeURIComponent(query)}&key=${rawgKey}&page_size=3`,
        { signal: controller.signal }
      );
      if (response.ok) {
        const data = await response.json();
        const results = data.results || [];
        const keys = Object.keys(searchCache.current);
        if (keys.length > 50) delete searchCache.current[keys[0]];
        searchCache.current[query] = results;
        setSearchResults(results);
        setShowDropdown(true);
      }
    } catch (err) {
      if (err.name !== 'AbortError') console.error("RAWG Search Error:", err);
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
      setSearchResults([]);
      setShowDropdown(false);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(() => {
      searchRawg(val);
    }, 250); 
  };

  const handleSelectSearchResult = (game) => {
    setShowDropdown(false);
    setUrlInput('');
    setError('');

    if (checkAndHandleExisting(game.slug, game.name)) return;

    const isMultiplayer = game.tags?.some(t => t.slug.includes('multiplayer') || t.slug.includes('co-op'));
    const steamStoreSearchLink = `https://store.steampowered.com/search/?term=${encodeURIComponent(game.name)}`;

    setPendingGame({
      appId: String(game.slug),
      name: game.name,
      imageUrl: game.background_image || `https://placehold.co/460x215/1e293b/4f46e5?text=${encodeURIComponent(game.name)}`,
      steamUrl: steamStoreSearchLink,
      status: 'Wanted',
      mode: isMultiplayer ? 'Multiplayer' : 'Singleplayer'
    });
  };

  // --- Manual Fetch Submit ---
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

        if (checkAndHandleExisting(appId, null)) {
          setLoading(false);
          return;
        }

        try {
          const apiUrl = `https://store.steampowered.com/api/appdetails?appids=${appId}`;
          const proxyUrl = `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(apiUrl)}`;
          
          const response = await fetchWithTimeout(proxyUrl, { timeout: 2000 });
          if (!response.ok) throw new Error('Proxy error');
          
          const steamData = await response.json();
          
          if (!steamData || !steamData[appId] || !steamData[appId].success) {
            throw new Error('Game not found or is age-restricted');
          }

          const details = steamData[appId].data;
          
          const isM = details.categories?.some(c => 
            c.description.toLowerCase().includes('multi-player') || 
            c.description.toLowerCase().includes('co-op')
          );
          finalGameData = {
            appId: String(appId),
            name: details.name,
            imageUrl: details.header_image,
            steamUrl: input,
            status: 'Wanted',
            mode: isM ? 'Multiplayer' : 'Singleplayer'
          };
        } catch (err) {
          console.warn('API fetch timed out or failed. Utilizing bulletproof fallback.', err.message);
          const fallbackName = slugName || `Steam Game ${appId}`;
          if (checkAndHandleExisting(appId, fallbackName)) {
            setLoading(false);
            return;
          }
          const fallbackImage = `https://placehold.co/460x215/1e293b/4f46e5?text=${encodeURIComponent(fallbackName)}`;
          finalGameData = {
            appId: String(appId),
            name: fallbackName,
            imageUrl: fallbackImage,
            steamUrl: input,
            status: 'Wanted',
            mode: 'Singleplayer'
          };
        }
      } else {
        const rawgKey = getRawgKey();
        if (!rawgKey) throw new Error('VITE_RAWG_API_KEY is missing from your environment variables.');

        const response = await fetchWithTimeout(`https://api.rawg.io/api/games?search=${encodeURIComponent(input)}&key=${rawgKey}&page_size=1`, { timeout: 4000 });
        if (!response.ok) throw new Error('Failed to fetch from RAWG API');

        const data = await response.json();
        if (!data.results || data.results.length === 0) {
           throw new Error('No game found with that name.');
        }

        const game = data.results[0];
        
        if (checkAndHandleExisting(game.slug, game.name)) {
          setLoading(false);
          return;
        }

        let steamStoreSearchLink = `https://store.steampowered.com/search/?term=${encodeURIComponent(game.name)}`;
        
        // Fetch explicit steam link if possible
        try {
          const detailRes = await fetchWithTimeout(`https://api.rawg.io/api/games/${game.slug}?key=${rawgKey}`, { timeout: 3000 });
          if (detailRes.ok) {
            const detailData = await detailRes.json();
            const steamStore = detailData.stores?.find(s => s.store.name.toLowerCase().includes('steam') || s.store.slug.includes('steam'));
            if (steamStore && steamStore.url) {
              steamStoreSearchLink = steamStore.url;
            }
          }
        } catch { /* Ignore detail fetch errors */ }

        const isM = game.tags?.some(t => t.slug.includes('multiplayer') || t.slug.includes('co-op'));
        finalGameData = {
            appId: String(game.slug),
            name: game.name,
            imageUrl: game.background_image || `https://placehold.co/460x215/1e293b/4f46e5?text=${encodeURIComponent(game.name)}`,
            steamUrl: steamStoreSearchLink,
            status: 'Wanted',
            mode: isM ? 'Multiplayer' : 'Singleplayer'
        };
      }

      setPendingGame(finalGameData);
      
    } catch (err) {
      setError(err.message || 'Error finding game.');
    } finally {
      setLoading(false);
    }
  };

  const confirmAddGame = useCallback(async () => {
    if (!pendingGame) return;
    setSyncStatus('syncing');

    const existingGame = getExistingGame(pendingGame.appId, pendingGame.name);
    try {
      if (existingGame) {
        const addedBy = existingGame.addedBy || [];
        if (!addedBy.includes(activeProfile)) {
          const updated = { 
            ...existingGame, 
            addedBy: [...addedBy, activeProfile], 
            status: pendingGame.status, 
            mode: pendingGame.mode 
          };
          await setDoc(doc(db, 'games', String(updated.id)), updated);
        }
      } else {
        const newGame = { 
          ...pendingGame, 
          id: crypto.randomUUID(), 
          addedAt: Date.now(),
          addedBy: [activeProfile]
        };
        await setDoc(doc(db, 'games', String(newGame.id)), newGame);
      }
      setSyncStatus('saved');
    } catch (e) {
      console.error(e);
      setSyncStatus('error');
    }

    setPendingGame(null);
    setUrlInput('');
  }, [pendingGame, activeProfile, getExistingGame]);

  // --- Edit Actions ---
  const saveEditedGame = useCallback(async () => {
    if (activeProfile === 'Combined' || !editingGame) return;
    setSyncStatus('syncing');
    try {
      await setDoc(doc(db, 'games', String(editingGame.id)), { ...editingGame });
      setSyncStatus('saved');
    } catch (e) {
      console.error(e);
      setSyncStatus('error');
    }
    setEditingGame(null);
  }, [activeProfile, editingGame]);

  const confirmDeleteGame = useCallback(async () => {
    if (activeProfile === 'Combined' || !gameToDelete) return; 
    setSyncStatus('syncing');

    try {
      const g = games.find(gm => gm.id === gameToDelete.id);
      if (g) {
        const newAddedBy = (g.addedBy || []).filter(p => p !== activeProfile);
        
        if (newAddedBy.length === 0) {
          await deleteDoc(doc(db, 'games', String(g.id)));
        } else {
          await setDoc(doc(db, 'games', String(g.id)), { ...g, addedBy: newAddedBy });
        }
      }
      setSyncStatus('saved');
    } catch (e) {
      console.error(e);
      setSyncStatus('error');
    }

    setGameToDelete(null);
  }, [activeProfile, gameToDelete, games]);

  // --- Highly Optimized Filtering & Sorting via useMemo ---
  const filteredGames = useMemo(() => {
    const safeGames = Array.isArray(games) ? games : [];
    let result = safeGames.filter(game => {
      if (activeProfile === 'Combined') return true;
      const addedBy = game.addedBy || [];
      if (playerFilter === 'Aadish') return addedBy.includes('Aadish');
      if (playerFilter === 'Aditya') return addedBy.includes('Aditya');
      if (playerFilter === 'Both') return addedBy.length === 2;
      return true;
    })
    .filter(game => statusFilter === 'All' || game.status === statusFilter)
    .filter(game => modeFilter === 'All' || game.mode === modeFilter)
    .filter(game => game.name && game.name.toLowerCase().includes(searchQuery.toLowerCase()));

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

  // Renders

  if (!activeProfile) {
    return <ProfileSelector loginAs={loginAs} theme={theme} toggleTheme={toggleTheme} />;
  }

  return (
    <div className="min-h-screen flex flex-col transition-colors selection:bg-neon-pink/30 selection:text-black">
      
      <DeleteModal 
        gameToDelete={gameToDelete} 
        setGameToDelete={setGameToDelete} 
        confirmDeleteGame={confirmDeleteGame} 
      />

      <GameModal 
        gameData={pendingGame}
        setGameData={setPendingGame}
        onSave={confirmAddGame}
        onCancel={() => setPendingGame(null)}
        isEditMode={false}
      />

      <GameModal 
        gameData={editingGame}
        setGameData={setEditingGame}
        onSave={saveEditedGame}
        onCancel={() => setEditingGame(null)}
        onDelete={() => {
          setGameToDelete(editingGame);
          setEditingGame(null); 
        }}
        isEditMode={true}
      />

      <Header 
        syncStatus={syncStatus}
        stats={stats}
        activeProfile={activeProfile}
        loginAs={loginAs}
        theme={theme}
        toggleTheme={toggleTheme}
        currentView={location.pathname.endsWith('/list') ? 'sharedList' : location.pathname.endsWith('/mods') ? 'modsList' : 'home'}
      />

      <Routes>
        <Route path="/" element={<Navigate to={`/${activeProfile || ''}`} replace />} />
        <Route path="/:profileId/list" element={
          <SharedList 
            games={games} 
            activeProfile={activeProfile} 
            goBack={() => navigate(`/${activeProfile}`)} 
            updateFirebaseGame={updateFirebaseGame}
          />
        } />
        <Route path="/:profileId/mods" element={
          <ModsList 
            games={games}
            activeProfile={activeProfile} 
            goBack={() => navigate(`/${activeProfile}`)} 
            mods={mods}
            // Mods list setMods would ideally be replaced by firebase updates inside ModsList.
            // For now, passing updateFirebaseGame generic or a specialized updateFirebaseMod.
            updateFirebaseMod={async (modId, updateFn) => {
              const currentMod = mods.find(m => m.id === modId);
              if (currentMod) {
                await setDoc(doc(db, 'mods', String(modId)), updateFn({ ...currentMod }));
              }
            }}
            addFirebaseMod={async (newMod) => {
              await setDoc(doc(db, 'mods', String(newMod.id)), newMod);
            }}
            deleteFirebaseMod={async (modId) => {
              await deleteDoc(doc(db, 'mods', String(modId)));
            }}
          />
        } />
        <Route path="/:profileId" element={
          <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-6 flex-1 w-full relative">
          
          <AddGameSection 
            activeProfile={activeProfile}
            urlInput={urlInput}
            handleInputChange={handleInputChange}
            handleFetchGameDetails={handleFetchGameDetails}
            loading={loading}
            isSearching={isSearching}
            showDropdown={showDropdown}
            setShowDropdown={setShowDropdown}
            setUrlInput={setUrlInput}
            searchResults={searchResults}
            handleSelectSearchResult={handleSelectSearchResult}
            getExistingGame={getExistingGame}
            error={error}
            dropdownRef={dropdownRef}
          />

          <FilterSection 
            statusFilter={statusFilter} setStatusFilter={setStatusFilter}
            modeFilter={modeFilter} setModeFilter={setModeFilter}
            sortOption={sortOption} setSortOption={setSortOption}
            searchQuery={searchQuery} setSearchQuery={setSearchQuery}
            viewMode={viewMode} setViewMode={handleSetViewMode}
          />

          {/* Games Grid */}
          {filteredGames.length === 0 ? (
            <div className="text-center py-20 glass-panel rounded-[2rem] border-dashed">
              <Gamepad2 className="w-16 h-16 mx-auto text-black/20 dark:text-white/20 mb-4" />
              <h3 className="text-xl font-extrabold text-black/60 dark:text-white/60 tracking-tight uppercase">No games found</h3>
              <p className="text-black/40 dark:text-white/40 mt-2 text-sm max-w-sm mx-auto font-bold uppercase tracking-widest leading-relaxed">
                {games.length === 0 
                  ? "Paste a Steam URL or search a game above to start your collection." 
                  : "No games match your current filters."}
              </p>
            </div>
          ) : (
            <div className={
              viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8' :
              viewMode === 'compact' ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4' :
              'flex flex-col gap-3'
            }>
              {filteredGames.map((game, index) => (
                <GameCard 
                  key={game.id}
                  game={game}
                  index={index}
                  activeProfile={activeProfile}
                  setEditingGame={setEditingGame}
                  onRemove={(id) => {
                    const toDelete = games.find(g => g.id === id);
                    if (toDelete) setGameToDelete(toDelete);
                  }}
                  viewMode={viewMode}
                />
              ))}
            </div>
          )}
        </main>
        } />
      </Routes>

      {/* Floating Action Button (FAB) Menu for Navigation */}
      {!location.pathname.endsWith('/list') && !location.pathname.endsWith('/mods') && activeProfile !== 'Combined' && (
        <div className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-50 flex flex-col items-end gap-3 pointer-events-none">
          
          <div className={`flex flex-col items-end gap-3 transition-all duration-300 origin-bottom ${showListOverlay ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' : 'opacity-0 scale-90 translate-y-8 pointer-events-none'}`}>
            <button 
              onClick={() => { setShowListOverlay(false); navigate(`/${activeProfile}/list`); }}
              className="bg-neon-yellow brutal-btn text-black px-6 sm:px-8 py-4 sm:py-5 rounded-2xl border-2 border-black font-black uppercase tracking-widest text-sm sm:text-base flex items-center gap-3 sm:gap-4 shadow-brutal-sm hover:-translate-y-1 active:translate-y-0 transition-all pointer-events-auto"
            >
              <Gamepad2 className="w-5 h-5 sm:w-6 sm:h-6" /> Game List
            </button>
                        <button 
              onClick={() => { setShowListOverlay(false); navigate(`/${activeProfile}/mods`); }}
              className="bg-neon-cyan brutal-btn text-black px-6 sm:px-8 py-4 sm:py-5 rounded-2xl border-2 border-black font-black uppercase tracking-widest text-sm sm:text-base flex items-center gap-3 sm:gap-4 shadow-brutal-sm hover:-translate-y-1 active:translate-y-0 transition-all pointer-events-auto"
            >
              <Settings2 className="w-5 h-5 sm:w-6 sm:h-6" /> Mod List
            </button>
          </div>

          <button 
            onClick={() => setShowListOverlay(!showListOverlay)}
            className="bg-neon-pink brutal-btn shadow-pink text-black px-6 py-5 sm:px-8 sm:py-6 rounded-[2rem] border-2 border-black hover:-translate-y-1 hover:shadow-brutal-lg active:-translate-y-0 active:scale-95 active:shadow-none font-extrabold uppercase tracking-widest text-lg sm:text-xl transition-all flex items-center gap-4 pointer-events-auto"
          >
            {showListOverlay ? (
              <>
                <X className="w-7 h-7 sm:w-8 sm:h-8 border-2 border-black rounded-md p-0.5 bg-white" />
                <span className="hidden sm:inline-block">Close</span>
              </>
            ) : (
              <>
                <ListPlus className="w-7 h-7 sm:w-8 sm:h-8 border-2 border-black rounded-md p-0.5 bg-white" />
                <span className="hidden sm:inline-block">List</span>
              </>
            )}
          </button>
        </div>
      )}

      <Footer />
    </div>
  );
}
