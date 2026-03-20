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
  Sun,
  Moon
} from 'lucide-react';

// Extracted Components
import ProfileSelector from './components/ProfileSelector';
import Header from './components/Header';
import DeleteModal from './components/DeleteModal';
import GameModal from './components/GameModal';
import AddGameSection from './components/AddGameSection';
import FilterSection from './components/FilterSection';
import GameCard from './components/GameCard';
import Footer from './components/Footer';

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
  }, []);

  useEffect(() => {
    pullFromGithub();
  }, [pullFromGithub]);

  useEffect(() => {
    if (isReadyForSync.current) {
      const debounceTimer = setTimeout(() => {
        pushToGithub(games);
      }, 1000);
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
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetchWithTimeout(`https://api.rawg.io/api/games?search=${encodeURIComponent(query)}&key=${rawgKey}&page_size=5`, { timeout: 3000 });
      if (response.ok) {
        const data = await response.json();
        const results = data.results || [];
        searchCache.current[query] = results;
        setSearchResults(results);
        setShowDropdown(true);
      }
    } catch (err) {
      console.error("RAWG Dropdown Search Error:", err);
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

  // Renders

  if (!activeProfile) {
    return <ProfileSelector loginAs={loginAs} theme={theme} toggleTheme={toggleTheme} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#020617] text-slate-800 dark:text-slate-200 font-sans selection:bg-indigo-500/30 animate-in fade-in duration-500 overflow-x-hidden transition-colors">
      
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
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
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
        />

        {/* Games Grid */}
        {filteredGames.length === 0 ? (
          <div className="text-center py-24 bg-white/60 dark:bg-slate-900/30 backdrop-blur-sm rounded-3xl border border-slate-300 dark:border-white/5 border-dashed transition-colors">
            <Gamepad2 className="w-16 h-16 mx-auto text-slate-400 dark:text-slate-600 mb-5" />
            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-300 tracking-tight">No games found</h3>
            <p className="text-slate-500 mt-2 max-w-sm mx-auto">
              {games.length === 0 
                ? "Your library is empty. Paste a Steam URL or search a game above to start building your collection!" 
                : "No games match your current filters or search query."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredGames.map((game, idx) => (
              <GameCard 
                key={game.id}
                game={game}
                activeProfile={activeProfile}
                setEditingGame={setEditingGame}
              />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
