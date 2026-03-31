import * as XLSX from 'xlsx';

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json'
};

export const jsonResponse = (data, status = 200) => {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: corsHeaders
  });
};

export const fetchFirestore = async (projectId, collection) => {
  if (!projectId) throw new Error("VITE_FIREBASE_PROJECT_ID not set.");
  const r = await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collection}?pageSize=1000`);
  if (!r.ok) {
     const er = await r.json();
     throw new Error(`Firestore: ${er.error?.message || r.statusText}`);
  }
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

export const getCoopGames = async () => {
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
        for (let C = range.s.c; C <= range.e.c; ++C) {
          const cell = worksheet[XLSX.utils.encode_cell({ c: C, r: R })];
          if (!cell || (cell.v === undefined && !cell.l)) continue;
          const header = headers[C];
          const textValue = cell.w || cell.v || "";
          let targetUrl = (cell.l && cell.l.Target) ? cell.l.Target : null;
          if (targetUrl) rowData[header] = { text: textValue, url: targetUrl };
          else rowData[header] = textValue;
        }
        if (Object.keys(rowData).length > 0) rawJsonArray.push(rowData);
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
      }
      if (row['Column_4'] && row['Column_5']) {
        let gameObj = row['Column_4'];
        let gameName = typeof gameObj === 'object' ? gameObj.text : gameObj;
        if (gameName.toLowerCase() === 'game(s)' || gameName.toLowerCase() === 'game') return;
        games.push({
          game: typeof gameObj === 'object' ? { name: gameObj.text, url: gameObj.url } : gameObj,
          mod: typeof row['Column_5'] === 'object' ? { name: row['Column_5'].text, url: row['Column_5'].url } : row['Column_5'],
          notes: row['Column_6'] ? (typeof row['Column_6'] === 'object' ? { text: row['Column_6'].text, url: row['Column_6'].url } : row['Column_6']) : null,
          category: currentCategory,
        });
      } else if (megaText && !row['Column_4']) {
        currentCategory = megaText.trim();
      }
    });
    return { status: "ok", generated_at: new Date().toISOString(), metadata, games };
};
