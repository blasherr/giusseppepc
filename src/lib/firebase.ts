import type { Firestore } from "firebase/firestore";

let firestore: Firestore | null = null;
let firestoreReady: Promise<Firestore | null> | null = null;

function initFirestore(): Promise<Firestore | null> {
  if (typeof window === "undefined") return Promise.resolve(null);

  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!apiKey || !projectId) return Promise.resolve(null);

  return (async () => {
    try {
      const { initializeApp, getApps } = await import("firebase/app");
      const { getFirestore: getFS } = await import("firebase/firestore");

      const config = {
        apiKey,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      };

      const app = getApps().length === 0 ? initializeApp(config) : getApps()[0];
      firestore = getFS(app);
      return firestore;
    } catch (err) {
      console.warn("[Firebase] Init failed:", err);
      return null;
    }
  })();
}

export function getFirestoreInstance(): Promise<Firestore | null> {
  if (firestore) return Promise.resolve(firestore);
  if (!firestoreReady) {
    firestoreReady = initFirestore();
  }
  return firestoreReady;
}

export { firestore };
