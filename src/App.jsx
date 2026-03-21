import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Gamepad2, ListPlus } from 'lucide-react';

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

export default function App() {
  // App State
  const [games, setGames] = useState([]);
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
  const [syncStatus, setSyncStatus] = useState(''); 
  const isReadyForSync = useRef(false);

  // Profile State
  const [activeProfile, setActiveProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // App View State
  const [currentView, setCurrentView] = useState('home'); // 'home' | 'sharedList'

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
  const loginAs = useCallback(async (profile) => {
    setActiveProfile(profile);
    if (profile !== 'Combined') {
      setPlayerFilter(profile); 
    } else {
      setPlayerFilter('All');
    }
  }, []);

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

  const getRawgKey = () => {
    try {
      return import.meta.env.VITE_RAWG_API_KEY || '';
    } catch (e) {
      return '';
    }
  };

  const pullFromGithub = useCallback(async () => {
    const token = getGithubToken();
    if (!token) {
      setTimeout(() => { isReadyForSync.current = true; }, 500);
      return;
    }
    
    setSyncStatus('syncing');
    try {
      const response = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${FILE_PATH}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.v3.raw' }
      });
      
      if (response.ok) {
        const parsedGames = await response.json();
        if (Array.isArray(parsedGames)) {
          setGames(parsedGames);
        } else if (parsedGames && parsedGames.content) {
          // Fallback if browser cached the metadata object instead of honoring 'raw' header
          const decodedContent = decodeURIComponent(escape(atob(parsedGames.content.replace(/\n/g, ''))));
          setGames(JSON.parse(decodedContent));
        } else {
          console.error("Unknown payload from GitHub sync:", parsedGames);
          setGames([]);
        }
      }
      setSyncStatus('saved');
    } catch (err) {
      console.error("GitHub Pull Error:", err);
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
      const getResponse = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${FILE_PATH}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.v3+json' }
      });
      
      if (getResponse.ok) {
        const data = await getResponse.json();
        sha = data.sha;
      }

      // Async Base64 encoding via FileReader perfectly avoids blocking UI thread on mobile
      const contentStr = JSON.stringify(currentGames, null, 2);
      const encodedContent = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.readAsDataURL(new Blob([contentStr]));
      });

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
  }, []);

  useEffect(() => {
    pullFromGithub();
  }, [pullFromGithub]);

  useEffect(() => {
    if (isReadyForSync.current) {
      const debounceTimer = setTimeout(() => {
        pushToGithub(games);
      }, 1500);
      return () => clearTimeout(debounceTimer);
    }
  }, [games, pushToGithub]);

  // --- Game Parsing & Fetching Utilities ---
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

    // Abort any in-flight search request
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
        // Cap cache at 50 entries to prevent memory bloat
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
          
          if (checkAndHandleExisting(appId, details.name)) {
            setLoading(false);
            return;
          }

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
          console.warn('API fetch timed out or failed. Utilizing bulletproof fallback.', err.message);
          const fallbackName = slugName || `Steam Game ${appId}`;
          if (checkAndHandleExisting(appId, fallbackName)) {
            setLoading(false);
            return;
          }
          const fallbackImage = `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${appId}/header.jpg`;
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

        const isMultiplayer = game.tags?.some(t => t.slug.includes('multiplayer') || t.slug.includes('co-op'));
        const steamStoreSearchLink = `https://store.steampowered.com/search/?term=${encodeURIComponent(game.name)}`;

        finalGameData = {
            appId: String(game.slug),
            name: game.name,
            imageUrl: game.background_image || `https://placehold.co/460x215/1e293b/4f46e5?text=${encodeURIComponent(game.name)}`,
            steamUrl: steamStoreSearchLink,
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

    const existingGame = getExistingGame(pendingGame.appId, pendingGame.name);
    if (existingGame) {
      const addedBy = existingGame.addedBy || [];
      if (!addedBy.includes(activeProfile)) {
        setGames(prev => prev.map(g => 
          g.id === existingGame.id 
            ? { ...g, addedBy: [...addedBy, activeProfile], status: pendingGame.status, mode: pendingGame.mode }
            : g
        ));
      }
    } else {
      setGames(prev => [{ 
        ...pendingGame, 
        id: crypto.randomUUID(), 
        addedAt: Date.now(),
        addedBy: [activeProfile]
      }, ...prev]);
    }

    setPendingGame(null);
    setUrlInput('');
  }, [pendingGame, activeProfile, getExistingGame]);

  // --- Edit Actions ---
  const saveEditedGame = useCallback(() => {
    if (activeProfile === 'Combined' || !editingGame) return;
    setGames(prevGames => prevGames.map(g => g.id === editingGame.id ? { ...editingGame } : g));
    setEditingGame(null);
  }, [activeProfile, editingGame]);

  const confirmDeleteGame = useCallback(() => {
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
  }, [activeProfile, gameToDelete]);

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
    if (profileLoading) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#f4f4f5] dark:bg-[#050510] transition-colors">
          <div className="glass-panel p-10 flex flex-col items-center gap-6 animate-in fade-in zoom-in-95 duration-300">
            <div className="w-14 h-14 border-4 border-black dark:border-white border-b-neon-pink rounded-full animate-spin drop-shadow-md"></div>
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-[0.2em] text-black dark:text-white animate-pulse">Loading Profile...</h2>
          </div>
        </div>
      );
    }
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
        currentView={currentView}
      />

      {currentView === 'home' ? (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 flex-1 w-full relative">
          
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
              viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' :
              viewMode === 'compact' ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4' :
              'flex flex-col gap-3'
            }>
              {filteredGames.map((game, idx) => (
                <GameCard 
                  key={game.id}
                  game={game}
                  activeProfile={activeProfile}
                  setEditingGame={setEditingGame}
                  viewMode={viewMode}
                />
              ))}
            </div>
          )}
        </main>
      ) : (
        <SharedList 
          games={games} 
          setGames={setGames} 
          activeProfile={activeProfile} 
          goBack={() => setCurrentView('home')} 
        />
      )}

      {currentView === 'home' && activeProfile !== 'Combined' && (
        <button 
          onClick={() => setCurrentView('sharedList')}
          className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 bg-neon-pink brutal-btn shadow-pink text-black px-6 py-4 rounded-2xl border-2 border-black hover:-translate-y-1 hover:shadow-brutal-lg active:translate-y-0 active:shadow-none font-extrabold uppercase tracking-widest text-lg transition-all flex items-center gap-3 z-50"
        >
          <ListPlus className="w-6 h-6 border-2 border-black rounded-md p-0.5 bg-white" />
          <span className="hidden sm:inline-block">List</span>
        </button>
      )}

      <Footer />
    </div>
  );
}
