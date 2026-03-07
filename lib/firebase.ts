import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore, FieldValue } from 'firebase-admin/firestore';

let app: App;
let db: Firestore;

function getFirebaseApp(): App {
  if (getApps().length === 0) {
    // Handle private key with escaped newlines
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    
    app = initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey,
      }),
    });
  } else {
    app = getApps()[0];
  }
  return app;
}

export function getDb(): Firestore {
  if (!db) {
    getFirebaseApp();
    db = getFirestore();
  }
  return db;
}

// Keep old export name for compatibility during migration
export { getDb as getFirestore };

// Re-export FieldValue for increment, arrayUnion, etc.
export { FieldValue };

// Helper to generate a new document ID
export function generateId(collectionName: string): string {
  return getDb().collection(collectionName).doc().id;
}

// Helper for batch operations
export function createBatch() {
  return getDb().batch();
}
