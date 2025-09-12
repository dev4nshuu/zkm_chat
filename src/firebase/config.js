import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// --- Firebase Configuration ---
// IMPORTANT: Replace with your actual Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyBISNm8BanebvVTqLhl4Z7JbBhj_z8jp8o",
  authDomain: "pgp--chat.firebaseapp.com",
  projectId: "pgp--chat",
  storageBucket: "pgp--chat.firebasestorage.app",
  messagingSenderId: "284264679895",
  appId: "1:284264679895:web:caa850b62c1cd77ef1e392",
  measurementId: "G-7Y0D0P50ZR"
};

// --- Initialize Firebase ---
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Sign in to Firebase anonymously. This is crucial to ensure the client is
// connected and authenticated with Firestore before any database operations
// are attempted. It prevents "client is offline" errors.
const firebaseConnection = signInAnonymously(auth);

export { db, auth, firebaseConnection };