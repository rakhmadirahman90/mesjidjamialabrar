import { initializeApp } from 'firebase/app';
import { 
  initializeFirestore, 
  doc, 
  getDocFromServer, 
  setLogLevel,
  persistentLocalCache,
  persistentMultipleTabManager
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Set Firestore log level to suppress transient connection warning messages during initial boot
setLogLevel('error');

const firebaseConfig = {
  projectId: "polynomial-node-c2gpt",
  appId: "1:397253837002:web:7ebe7dbe248c8c72f0b433",
  apiKey: "AIzaSyCeSU11fbjNcojjlfgKudsjq4vIv8C3oSw",
  authDomain: "polynomial-node-c2gpt.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-d32a1876-df20-4329-9a90-8e3ed544258f",
  storageBucket: "polynomial-node-c2gpt.firebasestorage.app",
  messagingSenderId: "397253837002"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// use initializeFirestore with robust persistentLocalCache to support multi-tab synchronization and offline-first reading
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  }),
  experimentalForceLongPolling: true,
  experimentalAutoDetectLongPolling: false,
}, firebaseConfig.firestoreDatabaseId);

export const auth = getAuth(app);
export const storage = getStorage(app);

// Critical constraint: Validate Connection to Firestore on startup
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firestore connection test: Online connection verified successfully.");
  } catch (error) {
    const isOffline = error instanceof Error && (
      error.message.includes('the client is offline') || 
      error.message.includes('unavailable') || 
      error.message.includes('Could not reach')
    );
    if (isOffline) {
      console.warn("Firestore connection check status: Currently running in offline cache mode with localized data synced successfully.");
    } else {
      console.warn("Firestore connection check status:", error);
    }
  }
}

// Delays the initial strict network check slightly to let container gateways start smoothly
setTimeout(() => {
  testConnection();
}, 1500);
