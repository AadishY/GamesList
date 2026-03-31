import * as XLSX from 'xlsx';

export default async function handler(request, response) {
  const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSV41AswEt3EpzSyd85YRVtoJaIIXWjtBy347dISJg4fs6xSNPqcgfsh76TxX_l-mnT7pjMlSqTW-87/pub?output=xlsx";
  const MEGA_KEY = "⢾░█ Multiplayer Mods █░⡷\n▁ ▂ ▄ ▅ ▆ █▓▒­░⠂MΞGA-LIST⠐░▒▓█ ▆ ▅ ▄ ▂ ▁";

  try {
    const sheetRes = await fetch(SHEET_URL);
    if (!sheetRes.ok) throw new Error(`HTTP ${sheetRes.status}: ${sheetRes.statusText}`);
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
    let metadata = {
      last_updated: null,
      recently_added: [],
      watchlist: []
    };

    rawJsonArray.forEach(row => {
      const megaVal = row[MEGA_KEY];
      const megaText = typeof megaVal === 'object' ? megaVal.text : (megaVal || "");

      if (megaText && megaText.includes("Last Updated")) {
        const dateMatch = megaText.match(/Last Updated\s*—\s*([^\n]+)/);
        if (dateMatch && dateMatch[1]) {
          metadata.last_updated = dateMatch[1].trim();
        }

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
        if (megaText.includes("🆕") || col3Val.includes("🆕")) {
          isNew = true;
        }

        const modObj = row['Column_5'];
        const notesObj = row['Column_6'] || null;

        const entry = {
          game: typeof gameObj === 'object' ? { name: gameObj.text, url: gameObj.url } : gameObj,
          mod: typeof modObj === 'object' ? { name: modObj.text, url: modObj.url } : modObj,
          notes: notesObj ? (typeof notesObj === 'object' ? { text: notesObj.text, url: notesObj.url } : notesObj) : null,
          category: currentCategory,
          isNew: isNew
        };
        games.push(entry);
      }
    });

    const finalJson = {
      status: "ok",
      generated_at: new Date().toISOString(),
      metadata: {
        ...metadata,
        total_games: games.length,
        categories: [...new Set(games.map(g => g.category))]
      },
      games: games
    };

    // Return raw JSON with proper headers and pretty-printing
    response.setHeader('Content-Type', 'application/json');
    response.setHeader('Access-Control-Allow-Origin', '*'); 
    response.status(200).send(JSON.stringify(finalJson, null, 2));

  } catch (error) {
    response.status(500).json({ status: "error", message: error.message });
  }
}
