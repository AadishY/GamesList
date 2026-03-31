import { fetchFirestore, jsonResponse } from './_common.js';

export async function onRequest(context) {
  try {
    const { env } = context;
    const projectId = env.VITE_FIREBASE_PROJECT_ID;
    const games = await fetchFirestore(projectId, 'games');
    const mods = await fetchFirestore(projectId, 'mods');
    
    const resultData = games.filter(g => (g.addedBy || []).includes('Aditya')).map(g => {
      const m = mods.find(mod => mod.id === g.id && mod.addedBy === 'Aditya');
      return { ...g, mods: m ? m.modsList : [] };
    });

    return jsonResponse({ status: "ok", profile: "Aditya", count: resultData.length, data: resultData });
  } catch (e) {
    return jsonResponse({ status: "error", message: e.message }, 500);
  }
}
