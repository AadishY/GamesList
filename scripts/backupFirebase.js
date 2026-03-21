/* global process */
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import fs from 'fs/promises';
import path from 'path';

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function backup() {
  try {
    console.log("Starting Firebase backup...");
    const data = {
      games: [],
      mods: [],
      timestamp: new Date().toISOString()
    };

    console.log("Fetching games...");
    const gamesSnapshot = await getDocs(collection(db, 'games'));
    gamesSnapshot.forEach(doc => data.games.push({ firebaseId: doc.id, ...doc.data() }));

    console.log("Fetching mods...");
    const modsSnapshot = await getDocs(collection(db, 'mods'));
    modsSnapshot.forEach(doc => data.mods.push({ firebaseId: doc.id, ...doc.data() }));

    const backupDir = path.join(process.cwd(), 'backups');
    await fs.mkdir(backupDir, { recursive: true });
    
    // Overwrite the same file to prevent repository bloat, GitHub maintains the history anyway.
    const filePath = path.join(backupDir, 'latest_backup.json');
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));

    console.log(`Backup written successfully to ${filePath}`);
    process.exit(0);
  } catch (error) {
    console.error("Backup failed:", error);
    process.exit(1);
  }
}

backup();
