import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { connectAuthEmulator, getAuth, type Auth } from "firebase/auth";
import {
  connectFirestoreEmulator,
  getFirestore,
  type Firestore,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const missingFirebaseConfig = Object.entries(firebaseConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key);

export const hasFirebaseConfig = missingFirebaseConfig.length === 0;
export const useFirebaseEmulators =
  process.env.NODE_ENV !== "production" &&
  process.env.NEXT_PUBLIC_FIREBASE_USE_EMULATORS === "true";

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let firestore: Firestore | null = null;
let authEmulatorConnected = false;
let firestoreEmulatorConnected = false;

export function getFirebaseApp() {
  if (!hasFirebaseConfig) {
    throw new Error("Missing Firebase environment variables.");
  }

  if (!app) {
    app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  }

  return app;
}

export function getFirebaseAuth() {
  if (!auth) {
    auth = getAuth(getFirebaseApp());
  }

  if (useFirebaseEmulators && !authEmulatorConnected) {
    connectAuthEmulator(auth, "http://127.0.0.1:9099", {
      disableWarnings: true,
    });
    authEmulatorConnected = true;
  }

  return auth;
}

export function getFirebaseFirestore() {
  if (!firestore) {
    firestore = getFirestore(getFirebaseApp());
  }

  if (useFirebaseEmulators && !firestoreEmulatorConnected) {
    connectFirestoreEmulator(firestore, "127.0.0.1", 8080);
    firestoreEmulatorConnected = true;
  }

  return firestore;
}
