# 🎮 Games List API & Portal

A high-performance, developer-friendly JSON API for tracking game collections and multiplayer mods. Built as a serverless platform with live data syncing.

## 🚀 Live API Endpoints

All endpoints return pretty-printed JSON by default and support CORS.

### 📜 Master Lists
- **[`/api`](https://gameslists.pages.dev/api)** — API Documentation & Discovery Index.
- **[`/api/list`](https://gameslists.pages.dev/api/list)** — Full Master Database (Main games + all associated mods).
- **[`/api/combined`](https://gameslists.pages.dev/api/combined)** — Shared game collection from all users (no mods).
- **[`/api/coopgames`](https://gameslists.pages.dev/api/coopgames)** — Co-Op Multiplayer Mods database (Live from Google Sheets).

### 👤 Profile Specific (With Mods)
- **[`/api/aadish`](https://gameslists.pages.dev/api/aadish)** — Aadish's personal game collection & linked mods.
- **[`/api/aditya`](https://gameslists.pages.dev/api/aditya)** — Aditya's personal game collection & linked mods.

---

## 🛠️ Development & Deployment

### Local Environment
The project uses **Vite** for the frontend and custom middleware for the API.
```bash
npm install
npm run dev
```
Endpoints are locally available at `http://localhost:5173/api/...`.

### Cloudflare Pages Functions
The production API is hosted on Cloudflare Pages using the `functions/` architecture.
- **Logic**: All API logic is maintained in `functions/api/`.
- **Syncing**: Data is pulled live from Firestore and Google Sheets.

### Environment Variables
For Firestore endpoints to work, ensure the following keys are set:
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_API_KEY`
- (and other Firebase SDK keys if running the full app)

---

## 🏗️ Technical Architecture
- **Framework**: React / Vite
- **API Engine**: Cloudflare Pages Functions (Serverless) / NodeJS
- **Data Sources**: Firestore (Profiles), Google Sheets (XLSX parsing via SheetJS)
- **Styling**: Neobrutalist Premium UI

---
*Created with ❤️ for the Co-Op Community.*
