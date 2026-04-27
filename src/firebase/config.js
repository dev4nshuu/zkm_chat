import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// --- Firebase Configuration ---
// IMPORTANT: Replace with your actual Firebase project configuration
// Firebase APIS

// --- Initialize Firebase ---
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Sign in to Firebase anonymously. This is crucial to ensure the client is
// connected and authenticated with Firestore before any database operations
// are attempted. It prevents "client is offline" errors.
const firebaseConnection = signInAnonymously(auth);

export { db, auth, firebaseConnection };
