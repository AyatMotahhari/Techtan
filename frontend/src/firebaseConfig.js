// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, enableIndexedDbPersistence, CACHE_SIZE_UNLIMITED, connectFirestoreEmulator } from "firebase/firestore";
import { collection, getDocs } from "firebase/firestore";

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

// Function to safely check if we're in an admin context
const isAdminContext = () => {
  try {
    const path = window.location.pathname;
    const hash = window.location.hash;
    
    // Check both regular path and hash for admin
    return path.includes('/admin') || hash.includes('/admin');
  } catch (e) {
    console.error('Error checking admin context:', e);
    return false;
  }
};

// Configure Firestore settings with improvements for cross-device support
try {
  // Simplify the persistence decision - enable for all contexts to avoid sync issues
  // This makes the experience more consistent across devices
  console.log('Initializing Firebase with persistence...');
  
  enableIndexedDbPersistence(db, {
    cacheSizeBytes: CACHE_SIZE_UNLIMITED,
    // Only force ownership in admin context
    experimentalForceOwningTab: isAdminContext()
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
    // Even if persistence fails, Firestore will still work
    console.log('Continuing with Firebase setup despite persistence issue...');
  });
} catch (error) {
  console.error('Error setting up Firestore persistence:', error);
  // Continue execution - don't let persistence issues block the app
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

// Export connection status tracker with improved reliability for cross-device support
export const checkFirebaseConnection = () => {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      resolve(false); // Connection failed after timeout
    }, 5000);
    
    // Updated approach - test directly with Firestore API instead of using fetch
    // This approach works better across different devices and browsers
    try {
      const testDocRef = collection(db, '_connection_test');
      getDocs(testDocRef)
        .then(() => {
          clearTimeout(timeout);
          console.log('Firebase connection test succeeded using direct Firestore API');
          resolve(true); // Connection successful
        })
        .catch((error) => {
          console.error('Firebase connection test failed using direct Firestore API:', error);
          clearTimeout(timeout);
          resolve(false); // Connection failed with error
        });
    } catch (error) {
      console.error('Error setting up Firebase connection test:', error);
      clearTimeout(timeout);
      resolve(false);
    }
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
  
  // 4. Test direct Firestore access
  let firestoreAccessible = false;
  try {
    const testCollection = collection(db, '_connection_test');
    await getDocs(testCollection);
    firestoreAccessible = true;
    console.log('✓ Direct Firestore access successful');
  } catch (error) {
    console.error('✗ Direct Firestore access failed:', error);
  }
  
  console.log('Permissions check complete. To fix permissions issues:');
  console.log('1. Go to Firebase Console: https://console.firebase.google.com/');
  console.log(`2. Select your project: ${firebaseConfig.projectId}`);
  console.log('3. Go to Firestore Database → Rules');
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
    success: firestoreAccessible, 
    message: firestoreAccessible 
      ? 'Permission check complete. Firestore is accessible.' 
      : 'Permission check failed. Firestore is not accessible. Check console for details.'
  };
};

export default app; 