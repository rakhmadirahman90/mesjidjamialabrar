import { initializeApp } from 'firebase/app';
import { initializeFirestore } from 'firebase/firestore';
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
