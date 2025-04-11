// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, enableIndexedDbPersistence, CACHE_SIZE_UNLIMITED } from "firebase/firestore";

// Your web app's Firebase configuration
// Replace these with your actual Firebase config values
const firebaseConfig = {
  apiKey: "AIzaSyArp7Nqz9bPgBN-tCut31B_uauSGXi9aNE",
  authDomain: "techtan-team.firebaseapp.com",
  projectId: "techtan-team",
  storageBucket: "techtan-team.firebasestorage.app",
  messagingSenderId: "864198020641",
  appId: "1:864198020641:web:3d622b3a3e8f7ffb4c1d60"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with settings for offline support
export const db = getFirestore(app);

// Enable offline persistence - this will store data when offline and sync when back online
enableIndexedDbPersistence(db, {
  cacheSizeBytes: CACHE_SIZE_UNLIMITED
}).catch((err) => {
  if (err.code === 'failed-precondition') {
    // Multiple tabs open, persistence can only be enabled in one tab at a time
    console.warn('Firestore persistence failed to enable: Multiple tabs open');
  } else if (err.code === 'unimplemented') {
    // The current browser doesn't support offline persistence
    console.warn('Firestore persistence is not available in this browser');
  }
});

// Export connection status tracker
export const checkFirebaseConnection = () => {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      resolve(false); // Connection failed
    }, 5000);
    
    // Try to get a timestamp from Firebase to test connectivity
    fetch(`https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents`)
      .then(() => {
        clearTimeout(timeout);
        resolve(true); // Connection successful
      })
      .catch(() => {
        clearTimeout(timeout);
        resolve(false); // Connection failed
      });
  });
};

export default app; 