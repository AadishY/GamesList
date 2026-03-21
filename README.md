# 🎮 Steam Backlog Tracker

A sleek, collaborative, and glass-brutalist React application to manage, track, and share your Steam game backlog. Built to handle personal and shared multiplayer backlogs, this app features real-time game searching, robust filtering, and automatic cloud-syncing directly to a GitHub repository.

## ✨ Features

* **Multi-Profile Support:** Switch between individual profiles (e.g., Aadish, Aditya) or view a "Combined" dashboard of everyone's games.
* **Real-Time Game Search:** Instantly search for games using the RAWG API, or paste a Steam URL to auto-fetch game details (cover art, name, etc.).
* **Shared Multiplayer Lists:** Plan your next co-op session. Propose games to a "Shared List", vote on games ("🔥 Both Wants"), and categorize them into Main or Side games.
* **GitHub Auto-Sync:** Never lose your data. The app automatically pushes and pulls your `games.json` database directly from GitHub, acting as a free backend.
* **Premium Glass-Brutalism UI:** A highly tactile, responsive design featuring glassmorphism panels, stark brutalist borders, and vibrant neon accents. Includes full Light/Dark mode support.
* **Flexible Views & Filters:** Switch between Grid, Compact, and Table views. Filter by Status (Wanted/Played) or Mode (Singleplayer/Multiplayer), and sort by date or alphabetical order.
* **PWA Ready:** Includes a Service Worker (`sw.js`) to cache images locally for faster load times and offline image viewing.

## 🛠️ Tech Stack

* **Framework:** React 18 + Vite
* **Styling:** Tailwind CSS (Custom configured for glass-brutalism)
* **Icons:** Lucide React
* **APIs:** RAWG API (Game Data) & Steam Store API (via proxy)
* **Database Sync:** GitHub REST API (reads/writes to `games.json`)

## 🚀 Getting Started

### Prerequisites
* Node.js (v18+ recommended)
* npm, yarn, or pnpm
* A RAWG API Key
* A GitHub Personal Access Token (Classic) with `repo` permissions to allow auto-syncing.

### Installation

1. **Clone the repository:**
   git clone https://github.com/AadishY/GamesList.git
   cd GamesList

2. **Install dependencies:**
   npm install

3. **Set up environment variables:**
   Create a `.env` file in the root directory and add your API keys:
   VITE_GITHUB_TOKEN=your_github_personal_access_token
   VITE_RAWG_API_KEY=your_rawg_api_key

   Note: Ensure the GitHub token has access to the repository specified in `src/App.jsx` (`AadishY/GamesList`) to allow syncing to `games.json`.

4. **Start the development server:**
   npm run dev

   The app will typically be available at `http://localhost:5173`.

## 📂 Project Structure

public/
└── sw.js                 # Service worker for image caching
src/
├── components/           # Modular React components
│   ├── App.jsx           # Main application shell & state logic
│   ├── AddGameSection.jsx# Search and Add game UI
│   ├── GameCard.jsx      # Individual game display
│   ├── SharedList.jsx    # Collaborative multiplayer list logic
│   └── ...
├── index.css             # Custom glass-brutalism Tailwind utilities
└── main.jsx              # React entry point & SW registration
games.json                # JSON database of tracked games (Auto-synced)
mods.json                 # JSON database for tracked mods
tailwind.config.js        # Tailwind configuration

## ⚙️ How Auto-Sync Works
This application bypasses traditional databases by using GitHub as a JSON datastore. 
In `App.jsx`, the app uses the `VITE_GITHUB_TOKEN` to authenticate and call the GitHub REST API. Whenever a game is added, edited, or deleted, the app debounces the change and commits the updated `games.json` directly back to the repository.

## 🤝 Contributing
Feel free to fork this repository and customize it for your own friend group! To change the primary profiles, simply search for "Aadish" and "Aditya" in `App.jsx` and `ProfileSelector.jsx` and replace them with your own names. You will also need to update the `GITHUB_OWNER` and `GITHUB_REPO` constants in `App.jsx` if you host the datastore on your own account.

## 📄 License
This project is open-source and available for personal modification and use.
