import { useState } from 'react';
import { Search, Loader2, X, AlertCircle } from 'lucide-react';

export default function ModAddModal({ gameEntry, updateFirebaseMod, onClose }) {
  const [inputVal, setInputVal] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFetchOrAdd = async (e) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    setLoading(true);
    setError('');

    const isNexusLink = inputVal.includes('nexusmods.com');
    
    if (isNexusLink) {
      try {
        // Parse link: https://www.nexusmods.com/skyrimspecialedition/mods/12345
        const match = inputVal.match(/nexusmods\.com\/([^/]+)\/mods\/(\d+)/i);
        if (!match) throw new Error("Invalid Nexus Mods link format.");
        
        const gameDomain = match[1];
        const modId = match[2];

        const apiKey = import.meta.env.VITE_NEXUS_API_KEY;
        if (!apiKey) {
          throw new Error("VITE_NEXUS_API_KEY is missing in .env");
        }

        const res = await fetch(`https://api.nexusmods.com/v1/games/${gameDomain}/mods/${modId}.json`, {
          headers: {
            'accept': 'application/json',
            'apikey': apiKey
          }
        });

        if (!res.ok) {
          throw new Error("Failed to fetch mod from Nexus API.");
        }

        const data = await res.json();
        
        // Fetch changelog separately
        let changelogText = "View full changelog on Nexus mods page.";
        try {
          const clRes = await fetch(`https://api.nexusmods.com/v1/games/${gameDomain}/mods/${modId}/changelogs.json`, {
            headers: { 'accept': 'application/json', 'apikey': apiKey }
          });
          if (clRes.ok) {
            const clData = await clRes.json();
            if (Object.keys(clData).length > 0) {
              changelogText = Object.entries(clData)
                .sort(([a], [b]) => b.localeCompare(a, undefined, { numeric: true, sensitivity: 'base' }))
                .map(([v, changes]) => `Version ${v}:\n- ${changes.join('\n- ')}`)
                .join('\n\n');
            } else {
              changelogText = "No changelog provided by author.";
            }
          }
        } catch (e) {
          console.error("Changelog fetch failed: ", e);
        }

        const newMod = {
          id: crypto.randomUUID(),
          name: data.name || `Nexus Mod ${modId}`,
          image: data.picture_url || '',
          version: data.version || '1.0',
          changelog: changelogText,
          link: inputVal,
          description: data.summary || 'No description available.',
          lastUpdatedEpoch: data.updated_timestamp || 0,
          lastUpdated: data.updated_timestamp ? new Date(data.updated_timestamp * 1000).toLocaleDateString() : 'Unknown'
        };

        saveMod(newMod);
      } catch (err) {
        console.error(err);
        setError(err.message || 'Error fetching from Nexus.');
        setLoading(false);
      }
    } else {
      // Manual add by name
      const newMod = {
        id: crypto.randomUUID(),
        name: inputVal.trim(),
        image: '',
        version: '1.0',
        changelog: 'Added manually.',
        link: '',
        description: 'Manually added mod.',
        lastUpdated: new Date().toLocaleDateString()
      };
      saveMod(newMod);
    }
  };

  function saveMod(newMod) {
    updateFirebaseMod(gameEntry.id, (m) => ({
      ...m,
      modsList: [newMod, ...(m.modsList || [])]
    }));
    setLoading(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 dark:bg-black/80 backdrop-blur-xl">
      <div className="glass-panel w-full max-w-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        <div className="p-5 sm:p-6 bg-black/5 dark:bg-white/5 border-b-2 border-black/10 dark:border-white/10 flex justify-between items-center shrink-0">
          <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tighter">Add Mod</h2>
          <button onClick={onClose} className="p-2 border-2 border-transparent hover:border-black/20 dark:hover:border-white/20 rounded-xl transition-colors hover:bg-black/5 dark:hover:bg-white/5 text-black/50 hover:text-black dark:text-white/50 dark:hover:text-white active:scale-95">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleFetchOrAdd} className="p-4 sm:p-6 flex flex-col gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black/40 dark:text-white/40" />
            <input type="text" value={inputVal} onChange={e => setInputVal(e.target.value)}
              placeholder="Paste Nexus Mod Link OR type mod name..."
              className="w-full bg-white/50 dark:bg-black/80 border-2 border-black/10 dark:border-white/20 rounded-2xl pl-12 pr-4 py-4 sm:py-3 text-base sm:text-lg font-bold outline-none focus:border-black dark:focus:border-white focus:bg-white focus:shadow-brutal transition-all placeholder-black/30 dark:placeholder-white/30"
              disabled={loading}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-black bg-[#ff4a4a] text-sm font-bold px-4 py-3 rounded-xl border-2 border-black shadow-brutal-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0" /> <p className="uppercase tracking-widest">{error}</p>
            </div>
          )}

          <div className="flex justify-end mt-2">
            <button type="submit" disabled={loading || !inputVal.trim()}
              className="bg-neon-pink brutal-btn px-8 py-4 sm:py-3 rounded-2xl text-base sm:text-lg disabled:opacity-50 whitespace-nowrap flex items-center justify-center gap-3 active:scale-95 w-full sm:w-auto"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5 hidden sm:block" />}
              {loading ? 'WAIT' : 'ADD MOD'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
