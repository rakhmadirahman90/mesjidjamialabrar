import { initializeApp } from 'firebase/app';
import { initializeFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

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

// use initializeFirestore to specify the databaseId and additional settings
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  experimentalAutoDetectLongPolling: false,
}, firebaseConfig.firestoreDatabaseId);

export const auth = getAuth(app);
export const storage = getStorage(app);

// Critical constraint: Validate Connection to Firestore on startup
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration. Currently running in offline mode.");
    } else {
      console.warn("Firestore connection check status:", error);
    }
  }
}
testConnection();
