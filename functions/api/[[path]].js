import * as XLSX from 'xlsx';

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = url.pathname.replace('/api', '').replace('/', '').toLowerCase();

  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Common response helper
  const jsonResponse = (data, status = 200) => {
    return new Response(JSON.stringify(data, null, 2), {
      status,
      headers: corsHeaders
    });
  };

  // 1. Documentation
  if (path === '' || path === 'docs') {
    return jsonResponse({
      name: "Games List API",
      description: "Official API for Cloud-based game and mod tracking.",
      endpoints: [
        { route: "/api/coopgames", desc: "Co-Op Multiplayer Mods list from Google Sheets source." },
        { route: "/api/aadish", desc: "Aadish's game collection with relevant mods." },
        { route: "/api/aditya", desc: "Aditya's game collection with relevant mods." },
        { route: "/api/combined", desc: "Combined game list from both users (no mods)." },
        { route: "/api/list", desc: "Complete master list of all games and all mods." }
      ],
      usage: "Append ?pretty=true (default) to format the output."
    });
  }

  // 2. Co-Op Games Logic (XLSX)
  if (path === 'coopgames') {
    try {
      const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSV41AswEt3EpzSyd85YRVtoJaIIXWjtBy347dISJg4fs6xSNPqcgfsh76TxX_l-mnT7pjMlSqTW-87/pub?output=xlsx";
      const MEGA_KEY = "⢾░█ Multiplayer Mods █░⡷\n▁ ▂ ▄ ▅ ▆ █▓▒­░⠂MΞGA-LIST⠐░▒▓█ ▆ ▅ ▄ ▂ ▁";
      
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
          const cats = ["Windows PC", "Nintendo Switch", "Nintendo Wii", "Nintendo DS", "Gamecube", "Game Boy Advance", "Playstation 2", "Nintendo 64", "Playstation", "Super Nintendo", "Game Boy", "Mega Drive", "NES", "Arcade", "Tools", "Watchlist", "Hidden Splits"];
          cats.forEach(c => { if (valUpper.includes(c.toUpperCase())) currentCategory = c; });
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
      return jsonResponse({
        status: "ok",
        generated_at: new Date().toISOString(),
        metadata: { ...metadata, total_games: games.length, categories: [...new Set(games.map(g => g.category))] },
        games: games
      });
    } catch (e) {
      return jsonResponse({ status: "error", message: e.message }, 500);
    }
  }

  // 3. Firestore Logic (Aadish, Aditya, Combined, List)
  const isFirestorePath = ['aadish', 'aditya', 'combined', 'list'].includes(path);
  if (isFirestorePath) {
    try {
      const projectId = env.VITE_FIREBASE_PROJECT_ID;
      if (!projectId) throw new Error("VITE_FIREBASE_PROJECT_ID not set in Cloudflare Environment.");

      const fetchColl = async (coll) => {
        const r = await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${coll}?pageSize=1000`);
        const d = await r.json();
        return (d.documents || []).map(doc => {
          const fields = doc.fields || {};
          const obj = {};
          for (const [k, v] of Object.entries(fields)) {
            if ('stringValue' in v) obj[k] = v.stringValue;
            else if ('integerValue' in v) obj[k] = parseInt(v.integerValue);
            else if ('booleanValue' in v) obj[k] = v.booleanValue;
            else if ('arrayValue' in v) obj[k] = (v.arrayValue.values || []).map(vv => vv.stringValue || vv.integerValue || vv.booleanValue || vv);
          }
          obj.id = doc.name.split('/').pop();
          return obj;
        });
      };

      const games = await fetchColl('games');
      const mods = await fetchColl('mods');
      let result = [];

      if (path === 'aadish' || path === 'aditya') {
        const profileName = path.charAt(0).toUpperCase() + path.slice(1);
        result = games.filter(g => (g.addedBy || []).includes(profileName)).map(g => {
          const m = mods.find(mod => mod.id === g.id && mod.addedBy === profileName);
          return { ...g, mods: m ? m.modsList : [] };
        });
      } else if (path === 'combined') {
        result = games;
      } else if (path === 'list') {
        result = games.map(g => {
          const ms = mods.filter(m => m.id === g.id);
          return { ...g, mods: ms.map(m => m.modsList).flat() };
        });
      }

      return jsonResponse({
        status: "ok",
        type: path,
        count: result.length,
        data: result
      });
    } catch (e) {
      return jsonResponse({ status: "error", message: e.message }, 500);
    }
  }

  // 4. Default Not Found
  return jsonResponse({ status: "error", message: `Endpoint /api/${path} not found.` }, 404);
}
