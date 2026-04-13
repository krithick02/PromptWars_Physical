/**
 * Firebase Integration — Beatline Venue Operations
 *
 * Integrates Google Firebase (Firestore + Analytics) for:
 *  - Real-time crowd data persistence across the platform
 *  - Event analytics and operational telemetry
 *  - Resilient offline-first architecture with Firestore caching
 *
 * Google Services used:
 *  - Firebase Firestore (crowd state sync)
 *  - Firebase Analytics (operational event tracking)
 *  - Firebase App (core SDK)
 */
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  enableIndexedDbPersistence,
  Firestore,
} from 'firebase/firestore';
import { getAnalytics, logEvent, Analytics, isSupported } from 'firebase/analytics';

// ---------------------------------------------------------------------------
// Firebase project config (values read from environment variables for security)
// ---------------------------------------------------------------------------
const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY            ?? 'demo-api-key',
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN        ?? 'beatline-demo.firebaseapp.com',
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID         ?? 'beatline-demo',
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET     ?? 'beatline-demo.appspot.com',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '000000000000',
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID             ?? '1:000000000000:web:demo',
  measurementId:     process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID     ?? 'G-DEMO000000',
};

// ---------------------------------------------------------------------------
// Singleton initialisation — avoids duplicate apps in Next.js hot-reload
// ---------------------------------------------------------------------------
let app: FirebaseApp;
let db:  Firestore;
let analytics: Analytics | null = null;

function getFirebaseApp(): FirebaseApp {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
  return app;
}

export function getFirebaseDb(): Firestore {
  if (!db) {
    db = getFirestore(getFirebaseApp());
    // Enable offline persistence (IndexedDB) — graceful fail in SSR
    if (typeof window !== 'undefined') {
      enableIndexedDbPersistence(db).catch(() => {
        // Persistence failed (multiple tabs, private mode) — continue online-only
      });
    }
  }
  return db;
}

export async function getFirebaseAnalytics(): Promise<Analytics | null> {
  if (analytics) return analytics;
  try {
    const supported = await isSupported();
    if (supported) {
      analytics = getAnalytics(getFirebaseApp());
    }
  } catch {
    // Analytics not available (SSR, ad-blockers) — fail silently
  }
  return analytics;
}

// ---------------------------------------------------------------------------
// Crowd data helpers (Firestore)
// ---------------------------------------------------------------------------
export const CROWD_COLLECTION = 'beatline-crowd';
export const VENUE_DOC_ID     = 'live-session';

/** Persist the current crowd state snapshot to Firestore. */
export async function persistCrowdSnapshot(
  state: Record<string, { count: number; capacity: number; waitTime: number }>
): Promise<void> {
  try {
    const firestore = getFirebaseDb();
    await setDoc(
      doc(firestore, CROWD_COLLECTION, VENUE_DOC_ID),
      { ...state, updatedAt: new Date().toISOString() },
      { merge: true }
    );
  } catch {
    // Firestore write failed (offline / unconfigured) — local state continues
  }
}

/** Fetch the last-known crowd snapshot from Firestore (for cold-start hydration). */
export async function fetchCrowdSnapshot(): Promise<Record<string, unknown> | null> {
  try {
    const firestore = getFirebaseDb();
    const snap = await getDoc(doc(firestore, CROWD_COLLECTION, VENUE_DOC_ID));
    return snap.exists() ? snap.data() : null;
  } catch {
    return null;
  }
}

/** Subscribe to live crowd updates pushed from Firestore. Returns unsubscribe fn. */
export function subscribeToCrowdUpdates(
  callback: (data: Record<string, unknown>) => void
): () => void {
  try {
    const firestore = getFirebaseDb();
    return onSnapshot(doc(firestore, CROWD_COLLECTION, VENUE_DOC_ID), (snap) => {
      if (snap.exists()) callback(snap.data());
    });
  } catch {
    return () => {};
  }
}

// ---------------------------------------------------------------------------
// Analytics event helpers
// ---------------------------------------------------------------------------
export async function trackEvent(name: string, params?: Record<string, unknown>): Promise<void> {
  try {
    const inst = await getFirebaseAnalytics();
    if (inst) logEvent(inst, name, params);
  } catch {
    // Silently ignore analytics errors
  }
}

export { firebaseConfig };
