// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

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

// Initialize Firestore
export const db = getFirestore(app);

export default app; 