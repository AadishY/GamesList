import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import * as XLSX from 'xlsx'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSV41AswEt3EpzSyd85YRVtoJaIIXWjtBy347dISJg4fs6xSNPqcgfsh76TxX_l-mnT7pjMlSqTW-87/pub?output=xlsx";
  const MEGA_KEY = "⢾░█ Multiplayer Mods █░⡷\n▁ ▂ ▄ ▅ ▆ █▓▒­░⠂MΞGA-LIST⠐░▒▓█ ▆ ▅ ▄ ▂ ▁";
  
  // Utility for Firestore REST API
  const fetchFirestore = async (collection) => {
    const projectId = env.VITE_FIREBASE_PROJECT_ID;
    if (!projectId) return [];
    try {
      const resp = await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collection}?pageSize=1000`);
      if (!resp.ok) return [];
      const data = await resp.json();
      return (data.documents || []).map(doc => {
        const fields = doc.fields || {};
        const obj = {};
        for (const [key, value] of Object.entries(fields)) {
          if ('stringValue' in value) obj[key] = value.stringValue;
          else if ('integerValue' in value) obj[key] = parseInt(value.integerValue);
          else if ('booleanValue' in value) obj[key] = value.booleanValue;
          else if ('arrayValue' in value) {
            obj[key] = (value.arrayValue.values || []).map(v => v.stringValue || v.integerValue || v.booleanValue || v);
          } else if ('mapValue' in value) {
            // Very basic map flattening if needed
            obj[key] = value.mapValue.fields; 
          }
        }
        // Extract ID from name
        const nameParts = doc.name.split('/');
        obj.id = nameParts[nameParts.length - 1];
        return obj;
      });
    } catch (e) { console.error(e); return []; }
  };

  const getCoopGames = async () => {
    const sheetRes = await fetch(SHEET_URL);
    const arrayBuffer = await sheetRes.arrayBuffer();
    const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: 'array', cellFormula: true });
    let rawJsonArray = [];
    workbook.SheetNames.forEach(sheetName => {
      const worksheet = workbook.Sheets[sheetName];
      if (!worksheet['!ref']) return;
      const range = XLSX.utils.decode_range(worksheet['!ref']);
      const headers = [];
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cell = worksheet[XLSX.utils.encode_cell({ c: C, r: range.s.r })];
        headers[C] = cell ? (cell.w || cell.v || `Column_${C + 1}`) : `Column_${C + 1}`;
      }
      for (let R = range.s.r + 1; R <= range.e.r; ++R) {
        const rowData = {};
        let rowHasData = false;
        for (let C = range.s.c; C <= range.e.c; ++C) {
          const cell = worksheet[XLSX.utils.encode_cell({ c: C, r: R })];
          if (!cell || (cell.v === undefined && !cell.l)) continue;
          rowHasData = true;
          const header = headers[C];
          const textValue = cell.w || cell.v || "";
          let targetUrl = null;
          if (cell.l && cell.l.Target) targetUrl = cell.l.Target;
          else if (cell.f && typeof cell.f === 'string' && cell.f.toUpperCase().includes('HYPERLINK(')) {
            const match = cell.f.match(/HYPERLINK\(\s*"([^"]+)"/i);
            if (match && match[1]) targetUrl = match[1];
          }
          if (targetUrl) rowData[header] = { text: textValue, url: targetUrl };
          else rowData[header] = textValue;
        }
        if (rowHasData) rawJsonArray.push(rowData);
      }
    });

    let currentCategory = "Uncategorized";
    let games = [];
    let metadata = { last_updated: null, recently_added: [], watchlist: [] };
    rawJsonArray.forEach(row => {
      const megaVal = row[MEGA_KEY];
      const megaText = typeof megaVal === 'object' ? megaVal.text : (megaVal || "");
      if (megaText && megaText.includes("Last Updated")) {
        const dateMatch = megaText.match(/Last Updated\s*—\s*([^\n]+)/);
        if (dateMatch && dateMatch[1]) metadata.last_updated = dateMatch[1].trim();
        let lines = megaText.split('\n');
        let currentSec = null;
        lines.forEach(line => {
          let trimmed = line.trim();
          if (!trimmed || trimmed.startsWith('Last Updated')) return;
          if (trimmed.toLowerCase().startsWith('added to')) {
            if (trimmed.toLowerCase().includes('windows pc')) currentSec = 'pc';
            else if (trimmed.toLowerCase().includes('watchlist')) currentSec = 'watchlist';
            else currentSec = 'ignored';
          } else {
            if (currentSec === 'pc') metadata.recently_added.push(trimmed);
            else if (currentSec === 'watchlist') metadata.watchlist.push(trimmed);
          }
        });
      }
      if (megaText && !row['Column_4'] && !row['Column_5']) {
        const valUpper = megaText.toUpperCase();
        if (valUpper.includes("WINDOWS PC")) currentCategory = "Windows PC";
        else if (valUpper.includes("NINTENDO SWITCH")) currentCategory = "Nintendo Switch";
        else if (valUpper.includes("NINTENDO WII")) currentCategory = "Nintendo Wii";
        else if (valUpper.includes("NINTENDO DS")) currentCategory = "Nintendo DS";
        else if (valUpper.includes("GAMECUBE")) currentCategory = "Gamecube";
        else if (valUpper.includes("GAME BOY ADVANCE")) currentCategory = "Game Boy Advance";
        else if (valUpper.includes("PLAYSTATION 2")) currentCategory = "Playstation 2";
        else if (valUpper.includes("NINTENDO 64")) currentCategory = "Nintendo 64";
        else if (valUpper.includes("PLAYSTATION")) currentCategory = "Playstation";
        else if (valUpper.includes("SUPER NINTENDO")) currentCategory = "Super Nintendo";
        else if (valUpper.includes("GAME BOY")) currentCategory = "Game Boy";
        else if (valUpper.includes("MEGA DRIVE")) currentCategory = "Mega Drive";
        else if (valUpper.includes("NINTENDO ENTERTAINMENT SYSTEM")) currentCategory = "NES";
        else if (valUpper.includes("ARCADE")) currentCategory = "Arcade";
        else if (valUpper.includes("TOOLS")) currentCategory = "Tools";
        else if (valUpper.includes("WATCHLIST")) currentCategory = "Watchlist";
        else if (valUpper.includes("HIDDEN SPLITS")) currentCategory = "Hidden Splits";
      }
      if (row['Column_4'] && row['Column_5']) {
        let gameObj = row['Column_4'];
        let gameName = typeof gameObj === 'object' ? gameObj.text : gameObj;
        if (gameName.toLowerCase() === 'game(s)' || gameName.toLowerCase() === 'game') return;
        let isNew = false;
        let col3Val = row['Column_3'] ? (typeof row['Column_3'] === 'object' ? row['Column_3'].text : row['Column_3']) : "";
        if (megaText.includes("🆕") || col3Val.includes("🆕")) isNew = true;
        const modObj = row['Column_5'];
        const notesObj = row['Column_6'] || null;
        games.push({
          game: typeof gameObj === 'object' ? { name: gameObj.text, url: gameObj.url } : gameObj,
          mod: typeof modObj === 'object' ? { name: modObj.text, url: modObj.url } : modObj,
          notes: notesObj ? (typeof notesObj === 'object' ? { text: notesObj.text, url: notesObj.url } : notesObj) : null,
          category: currentCategory,
          isNew: isNew
        });
      }
    });
    return {
      status: "ok",
      generated_at: new Date().toISOString(),
      metadata: { ...metadata, total_games: games.length, categories: [...new Set(games.map(g => g.category))] },
      games: games
    };
  };

  return {
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['icon.svg', 'pwa-icon-192.png', 'pwa-icon-512.png'],
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,jpg,jpeg,svg,webp}'],
          navigateFallback: 'index.html',
          navigateFallbackAllowlist: [/^\/$/],
        },
        devOptions: {
          enabled: true,
          type: 'module',
        },
        manifest: {
          name: 'Steam Backlog',
          short_name: 'Steam Backlog',
          start_url: '/',
          description: 'A premium, gaming-themed backlog tracker for Steam users.',
          theme_color: '#000000',
          background_color: '#000000',
          display: 'standalone',
          icons: [
            {
              src: 'pwa-icon-192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any'
            },
            {
              src: 'pwa-icon-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any'
            }
          ],
          screenshots: [
            {
              src: "screenshot-desktop.webp",
              sizes: "1280x720",
              type: "image/webp",
              form_factor: "wide"
            },
            {
              src: "screenshot-mobile.webp",
              sizes: "720x1280",
              type: "image/webp"
            }
          ]
        }
      }),
      {
        name: 'full-api',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            const fullUrl = new URL(req.url, `http://${req.headers.host}`);
            const pathname = fullUrl.pathname.replace(/\/$/, ''); // Remove trailing slash
            
            // Base /api or /api/docs
            if (pathname === '/api' || pathname === '/api/docs') {
              res.setHeader('Content-Type', 'application/json');
              res.setHeader('Access-Control-Allow-Origin', '*');
              res.end(JSON.stringify({
                name: "Games List API (Local Dev)",
                description: "Official API for Cloud-based game and mod tracking.",
                endpoints: [
                  { route: "/api/coopgames", desc: "Co-Op Multiplayer Mods list from Google Sheets source." },
                  { route: "/api/aadish", desc: "Aadish's game collection with relevant mods." },
                  { route: "/api/aditya", desc: "Aditya's game collection with relevant mods." },
                  { route: "/api/combined", desc: "Combined game list from both users (no mods)." },
                  { route: "/api/list", desc: "Complete master list of all games and all mods." }
                ]
              }, null, 2));
              return;
            }

            if (pathname === '/api/coopgames') {
              try {
                const result = await getCoopGames();
                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.end(JSON.stringify(result, null, 2));
              } catch (err) {
                res.statusCode = 500;
                res.end(JSON.stringify({ status: "error", message: err.message }));
              }
              return;
            }

            const firestoreRoutes = ['/api/aadish', '/api/aditya', '/api/combined', '/api/list'];
            if (firestoreRoutes.includes(pathname)) {
              try {
                const games = await fetchFirestore('games');
                const mods = await fetchFirestore('mods');
                
                let resultData = [];
                const route = pathname.split('/').pop();
                const profile = route === 'aadish' ? 'Aadish' : route === 'aditya' ? 'Aditya' : null;

                if (profile) {
                  resultData = games.filter(g => (g.addedBy || []).includes(profile)).map(g => {
                    const gameMods = mods.find(m => m.id === g.id && m.addedBy === profile);
                    return { ...g, mods: gameMods ? gameMods.modsList : [] };
                  });
                } else if (route === 'combined') {
                  resultData = games;
                } else if (route === 'list') {
                  resultData = games.map(g => {
                    const gameMods = mods.filter(m => m.id === g.id);
                    return { ...g, mods: gameMods.map(m => m.modsList).flat() };
                  });
                }

                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.end(JSON.stringify({ 
                  status: "ok", 
                  route: pathname, 
                  count: resultData.length,
                  data: resultData 
                }, null, 2));
              } catch (err) {
                res.statusCode = 500;
                res.end(JSON.stringify({ status: "error", message: err.message }));
              }
              return;
            }
            next();
          });
        }
      }
    ],
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('firebase')) return 'vendor-firebase';
              if (id.includes('react-router-dom')) return 'vendor-router';
              return 'vendor';
            }
          },
        },
      },
      chunkSizeWarningLimit: 1000,
    },
  }
})
