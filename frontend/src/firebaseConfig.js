// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, enableIndexedDbPersistence, CACHE_SIZE_UNLIMITED, connectFirestoreEmulator } from "firebase/firestore";

// Your web app's Firebase configuration
// Replace these with your actual Firebase config values
const firebaseConfig = {
  apiKey: "AIzaSyArp7Nqz9bPgBN-tCut31B_uauSGXi9aNE",
  authDomain: "techtan-team.firebaseapp.com",
  projectId: "techtan-team",
  storageBucket: "techtan-team.appspot.com",
  messagingSenderId: "864198020641",
  appId: "1:864198020641:web:3d622b3a3e8f7ffb4c1d60"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with settings for offline support
export const db = getFirestore(app);

// Try to enable offline persistence
try {
  enableIndexedDbPersistence(db, {
    cacheSizeBytes: CACHE_SIZE_UNLIMITED
  }).catch((err) => {
    if (err.code === 'failed-precondition') {
      // Multiple tabs open, persistence can only be enabled in one tab at a time
      console.warn('Firestore persistence failed to enable: Multiple tabs open');
    } else if (err.code === 'unimplemented') {
      // The current browser doesn't support offline persistence
      console.warn('Firestore persistence is not available in this browser');
    } else {
      console.error('Error enabling Firestore persistence:', err);
    }
  });
} catch (error) {
  console.error('Error setting up Firestore persistence:', error);
}

// Check if we're in development mode and connect to emulator if needed
if (process.env.NODE_ENV === 'development' && window.location.hostname === 'localhost') {
  try {
    connectFirestoreEmulator(db, 'localhost', 8080);
    console.log('Connected to Firestore emulator running locally');
  } catch (error) {
    console.error('Failed to connect to Firestore emulator:', error);
  }
}

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

// Function to help troubleshoot Firebase permissions
export const checkFirebasePermissions = async () => {
  console.log('Starting Firebase permissions check...');
  
  // 1. Check if Firebase is initialized
  if (!app) {
    console.error('Firebase app is not initialized');
    return { success: false, error: 'Firebase app is not initialized' };
  }
  console.log('✓ Firebase app is initialized');
  
  // 2. Check if we can access Firestore
  if (!db) {
    console.error('Firestore is not initialized');
    return { success: false, error: 'Firestore is not initialized' };
  }
  console.log('✓ Firestore is initialized');
  
  // 3. Display current Firebase config (without API key for security)
  const sanitizedConfig = { ...firebaseConfig };
  delete sanitizedConfig.apiKey;
  console.log('Current Firebase config:', sanitizedConfig);
  
  console.log('Permissions check complete. To fix permissions issues:');
  console.log('1. Go to Firebase Console: https://console.firebase.google.com/');
  console.log(`2. Select your project: ${firebaseConfig.projectId}`);
  console.log('3. Go to Firestore Database > Rules');
  console.log('4. Set rules to allow read/write:');
  console.log(`
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
  `);
  
  return { 
    success: true, 
    message: 'Permissions check complete. See console for details and steps to fix.' 
  };
};

export default app; 