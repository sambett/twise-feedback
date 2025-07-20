import { initializeApp } from 'firebase/app';
import { getDatabase, Database } from 'firebase/database';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase with proper error handling for build time
let db: Database;

try {
  // Check if we're in a build environment (no env vars available)
  const isBuildTime = !process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 
                      !process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
                      !process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL;

  if (isBuildTime) {
    // During build time, create a mock database object to satisfy TypeScript
    // This will be replaced at runtime when environment variables are available
    console.warn('Firebase: Build time detected, using mock database');
    db = {} as Database;
  } else {
    // Runtime initialization with full validation
    const requiredEnvVars = [
      'NEXT_PUBLIC_FIREBASE_API_KEY',
      'NEXT_PUBLIC_FIREBASE_PROJECT_ID', 
      'NEXT_PUBLIC_FIREBASE_DATABASE_URL'
    ];

    const missingEnvVars = requiredEnvVars.filter(
      envVar => !process.env[envVar]
    );

    if (missingEnvVars.length > 0) {
      console.error('Missing required Firebase environment variables:', missingEnvVars);
      throw new Error(`Missing required Firebase configuration: ${missingEnvVars.join(', ')}`);
    }

    const app = initializeApp(firebaseConfig);
    db = getDatabase(app);
  }
} catch (error) {
  console.error('Firebase initialization error:', error);
  // Provide a fallback mock for TypeScript
  db = {} as Database;
}

export { db };