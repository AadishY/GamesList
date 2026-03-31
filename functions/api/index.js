import { jsonResponse } from './_common.js';

export async function onRequest(context) {
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
    status: "online",
    documentation_at: "/api"
  });
}
