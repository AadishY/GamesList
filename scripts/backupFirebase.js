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

const MAX_BACKUPS = 12;

async function backup() {
  try {
    console.log("Starting Firebase backup...");
    const now = new Date();
    const data = {
      games: [],
      mods: [],
      timestamp: now.toISOString()
    };

    console.log("Fetching games...");
    const gamesSnapshot = await getDocs(collection(db, 'games'));
    gamesSnapshot.forEach(doc => data.games.push({ firebaseId: doc.id, ...doc.data() }));

    console.log("Fetching mods...");
    const modsSnapshot = await getDocs(collection(db, 'mods'));
    modsSnapshot.forEach(doc => data.mods.push({ firebaseId: doc.id, ...doc.data() }));

    const backupDir = path.join(process.cwd(), 'backups');
    await fs.mkdir(backupDir, { recursive: true });
    
    // 1. Create timestamped backup file (replacing invalid characters for file names)
    const timestampStr = now.toISOString().replace(/[:.]/g, '-');
    const fileName = `backup_${timestampStr}.json`;
    const filePath = path.join(backupDir, fileName);
    
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    console.log(`Backup written successfully to ${filePath}`);

    // 2. Retention Logic: Keep only the latest 12 backups
    const files = await fs.readdir(backupDir);
    const backupFiles = files.filter(f => f.startsWith('backup_') && f.endsWith('.json'));

    if (backupFiles.length > MAX_BACKUPS) {
      // Sort alphabetically (which is chronological thanks to ISO 8601 formatting)
      backupFiles.sort();
      
      const filesToDeleteCount = backupFiles.length - MAX_BACKUPS;
      const filesToDelete = backupFiles.slice(0, filesToDeleteCount);

      for (const file of filesToDelete) {
        const fileToDeletePath = path.join(backupDir, file);
        await fs.unlink(fileToDeletePath);
        console.log(`Deleted old backup to maintain limit: ${file}`);
      }
    }

    process.exit(0);
  } catch (error) {
    console.error("Backup failed:", error);
    process.exit(1);
  }
}

backup();
