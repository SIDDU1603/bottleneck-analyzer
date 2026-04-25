// Firebase / Firestore configuration
// Falls back to localStorage when Firebase is not configured

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Only initialize Firebase if config is available
const isFirebaseConfigured = firebaseConfig.apiKey && firebaseConfig.projectId;

let db = null;
if (isFirebaseConfigured) {
  const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  db = getFirestore(app);
}

export { db, isFirebaseConfigured };

// ============================================================
// Build persistence functions (Firestore with localStorage fallback)
// ============================================================

const LOCAL_STORAGE_KEY = 'bottleneck-analyzer-builds';

export async function saveBuilds(build) {
  if (db) {
    try {
      const docRef = await addDoc(collection(db, 'builds'), {
        ...build,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      return { id: docRef.id, ...build };
    } catch (error) {
      console.error('Firestore save error:', error);
    }
  }

  // localStorage fallback
  if (typeof window !== 'undefined') {
    const builds = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
    const newBuild = {
      ...build,
      id: `local-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    builds.push(newBuild);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(builds));
    return newBuild;
  }

  return null;
}

export async function loadBuilds() {
  if (db) {
    try {
      const snapshot = await getDocs(collection(db, 'builds'));
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Firestore load error:', error);
    }
  }

  // localStorage fallback
  if (typeof window !== 'undefined') {
    return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
  }

  return [];
}

export async function deleteBuild(id) {
  if (db && !id.startsWith('local-')) {
    try {
      await deleteDoc(doc(db, 'builds', id));
      return true;
    } catch (error) {
      console.error('Firestore delete error:', error);
    }
  }

  // localStorage fallback
  if (typeof window !== 'undefined') {
    const builds = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
    const filtered = builds.filter(b => b.id !== id);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));
    return true;
  }

  return false;
}
