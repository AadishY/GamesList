import { fetchFirestore, jsonResponse } from './_common.js';

export async function onRequest(context) {
  try {
    const { env } = context;
    const projectId = env.VITE_FIREBASE_PROJECT_ID;
    const games = await fetchFirestore(projectId, 'games');
    const mods = await fetchFirestore(projectId, 'mods');
    
    const resultData = games.map(g => {
      const ms = mods.filter(m => m.id === g.id);
      return { ...g, mods: ms.map(m => m.modsList).flat() };
    });

    return jsonResponse({ status: "ok", type: "Full List", count: resultData.length, data: resultData });
  } catch (e) {
    return jsonResponse({ status: "error", message: e.message }, 500);
  }
}
