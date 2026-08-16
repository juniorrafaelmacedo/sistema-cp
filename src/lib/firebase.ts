import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged, User } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore Database with specified database ID if available
export const db =
  firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
    ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
    : getFirestore(app);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Initialize Firebase Auth gracefully (direct Firestore is active via firestore.rules)
export function initFirebaseAuth(): Promise<User | null> {
  return new Promise((resolve) => {
    try {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        unsubscribe();
        if (user) {
          resolve(user);
        } else {
          try {
            const userCredential = await signInAnonymously(auth);
            resolve(userCredential.user);
          } catch {
            // Direct Firestore access is enabled in firestore.rules
            resolve(null);
          }
        }
      });
    } catch {
      resolve(null);
    }
  });
}

export const isFirebaseConfigured = Boolean(firebaseConfig.projectId && firebaseConfig.apiKey);

