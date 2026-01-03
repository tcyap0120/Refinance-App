
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// --- ACTION REQUIRED: PASTE YOUR KEYS BELOW ---
// 1. Go to console.firebase.google.com -> Project Settings -> General -> Your apps
// 2. Copy the values from the "firebaseConfig" object

const firebaseConfig = {
  // Replace the text inside the quotes with your actual keys
  apiKey: "AIzaSyBU-r6pBNTfvqgBxOEuntdSLqWh0MelL3E",
  authDomain: "apexrefi.firebaseapp.com",
  projectId: "apexrefi",
  storageBucket: "apexrefi.firebasestorage.app",
  messagingSenderId: "463498241380",
  appId: "1:463498241380:web:af0e6d832e4c8a1036c671",
};

// --- DO NOT EDIT BELOW THIS LINE ---

// Logic to check if config is valid or still using placeholders
// If projectId contains "PASTE", we assume it's not set up yet.
const isConfigured = !firebaseConfig.projectId.includes("PASTE");

let app;
let db = null;

if (isConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    console.log(`✅ Firebase Connected to project: ${firebaseConfig.projectId}`);
  } catch (error: any) {
    // Sanitize error object to prevent circular JSON error in console
    const msg = error instanceof Error ? error.message : String(error);
    console.error("❌ Firebase Initialization Error:", msg);
    console.error(`Double check that your Firestore Database is created in the project: "${firebaseConfig.projectId}"`);
  }
} else {
  console.warn("⚠️ Firebase keys missing. App running in Demo Mode (Local Data Only).");
}

// Export db (will be null if not configured)
export { db };

// Collection Name constant
export const DB_COLLECTION = 'applications';
export const FAQ_COLLECTION = 'faqs';
