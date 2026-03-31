import { getCoopGames, jsonResponse } from './_common.js';

export async function onRequest(context) {
  try {
     const data = await getCoopGames();
     return jsonResponse(data);
  } catch (e) {
     return jsonResponse({ status: "error", message: e.message }, 500);
  }
}
