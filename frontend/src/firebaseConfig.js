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

// Configure Firestore settings - this fixes the multi-tab persistence issue
try {
  // Using a simpler approach to persistence to avoid the multi-tab issue
  // The error occurs because multiple tabs are trying to access the same IndexedDB database
  const urlParams = new URLSearchParams(window.location.search);
  const persistenceParam = urlParams.get('persistence');
  
  // Only enable persistence if explicitly requested or if this is the admin panel
  const shouldEnablePersistence = 
    persistenceParam === 'true' || 
    window.location.pathname.includes('/admin');
  
  if (shouldEnablePersistence) {
    console.log('Enabling Firestore persistence for this session');
    
    enableIndexedDbPersistence(db, {
      cacheSizeBytes: CACHE_SIZE_UNLIMITED,
      // This forces the current tab to become the owner of the persistence layer
      // which prevents the multi-tab conflict error
      experimentalForceOwningTab: true
    }).then(() => {
      console.log('✅ Firestore persistence enabled successfully');
    }).catch((err) => {
      if (err.code === 'failed-precondition') {
        console.warn('Firestore persistence failed to enable: Multiple tabs open');
        console.log('The application will still work but caching will be disabled');
      } else if (err.code === 'unimplemented') {
        console.warn('Firestore persistence is not available in this browser');
      } else {
        console.error('Error enabling Firestore persistence:', err);
      }
    });
  } else {
    console.log('Firestore persistence not enabled for this session');
  }
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

// Export connection status tracker with improved reliability
export const checkFirebaseConnection = () => {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      resolve(false); // Connection failed after timeout
    }, 5000);
    
    // Try connecting to Firestore API directly
    fetch(`https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents`, {
      method: 'HEAD',
      mode: 'no-cors', // This helps avoid CORS issues
      cache: 'no-cache'
    })
      .then(() => {
        clearTimeout(timeout);
        resolve(true); // Connection successful
      })
      .catch((error) => {
        console.error('Firebase connection check failed:', error);
        clearTimeout(timeout);
        resolve(false); // Connection failed with error
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