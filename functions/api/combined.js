import { fetchFirestore, jsonResponse } from './_common.js';

export async function onRequest(context) {
  try {
    const { env } = context;
    const projectId = env.VITE_FIREBASE_PROJECT_ID;
    const games = await fetchFirestore(projectId, 'games');
    return jsonResponse({ status: "ok", type: "Combined", count: games.length, data: games });
  } catch (e) {
    return jsonResponse({ status: "error", message: e.message }, 500);
  }
}
