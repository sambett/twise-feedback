import admin from 'firebase-admin';
import { getDatabase } from 'firebase-admin/database';
import { getFirestore } from 'firebase-admin/firestore';

let realtimeDb = null;
let firestoreDb = null;
let isFirebaseAvailable = false;

// Initialize Firebase Admin SDK with better error handling
const initializeFirebase = () => {
  try {
    // Check if required environment variables are present
    if (!process.env.FIREBASE_PROJECT_ID) {
      console.warn('⚠️ FIREBASE_PROJECT_ID not found in environment');
      return false;
    }

    if (!process.env.FIREBASE_DATABASE_URL) {
      console.warn('⚠️ FIREBASE_DATABASE_URL not found in environment');  
      return false;
    }

    // Don't initialize if already initialized
    if (admin.apps.length > 0) {
      console.log('✅ Firebase Admin already initialized');
      return true;
    }

    // Initialize Firebase Admin
    const initConfig = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      databaseURL: process.env.FIREBASE_DATABASE_URL,
    };

    // Try to use service account if available (production)
    if (process.env.GOOGLE_CLOUD_KEY_FILE && process.env.GOOGLE_CLOUD_KEY_FILE !== 'path/to/service-account-key.json') {
      try {
        initConfig.credential = admin.credential.cert(process.env.GOOGLE_CLOUD_KEY_FILE);
        console.log('🔑 Using service account credentials');
      } catch (credError) {
        console.warn('⚠️ Service account failed, using default credentials');
      }
    }

    admin.initializeApp(initConfig);
    console.log('✅ Firebase Admin initialized successfully');

    // Initialize database connections
    try {
      realtimeDb = getDatabase();
      console.log('✅ Realtime Database connected');
    } catch (dbError) {
      console.warn('⚠️ Realtime Database connection failed:', dbError.message);
      realtimeDb = null;
    }

    try {
      firestoreDb = getFirestore();
      console.log('✅ Firestore connected');
    } catch (firestoreError) {
      console.warn('⚠️ Firestore connection failed:', firestoreError.message);
      firestoreDb = null;
    }

    isFirebaseAvailable = true;
    return true;

  } catch (error) {
    console.warn('⚠️ Firebase initialization failed:', error.message);
    console.log('🔄 Backend will continue with limited functionality (AI will still work!)');
    isFirebaseAvailable = false;
    return false;
  }
};

// Database operations wrapper with error handling
export class DatabaseService {
  constructor() {
    this.initialized = false;
    this.initPromise = null;
  }

  async ensureInitialized() {
    if (!this.initPromise) {
      this.initPromise = Promise.resolve(this.init());
    }
    return this.initPromise;
  }

  init() {
    try {
      this.initialized = initializeFirebase();
      return this.initialized;
    } catch (error) {
      console.warn('Database service initialization failed:', error.message);
      this.initialized = false;
      return false;
    }
  }

  // Realtime Database operations
  async saveToRealtime(path, data) {
    try {
      await this.ensureInitialized();
      
      if (!realtimeDb || !isFirebaseAvailable) {
        console.warn('⚠️ Realtime Database not available, skipping save');
        return { success: false, error: 'Realtime Database not available', fallback: true };
      }

      const ref = realtimeDb.ref(path);
      await ref.push(data);
      return { success: true, message: 'Data saved to Realtime Database' };
      
    } catch (error) {
      console.error('Realtime DB save error:', error.message);
      return { success: false, error: error.message };
    }
  }

  async getFromRealtime(path) {
    try {
      await this.ensureInitialized();
      
      if (!realtimeDb || !isFirebaseAvailable) {
        console.warn('⚠️ Realtime Database not available');
        return { success: false, error: 'Realtime Database not available', data: null };
      }

      const ref = realtimeDb.ref(path);
      const snapshot = await ref.once('value');
      return { success: true, data: snapshot.val() };
      
    } catch (error) {
      console.error('Realtime DB get error:', error.message);
      return { success: false, error: error.message, data: null };
    }
  }

  // Firestore operations
  async saveToFirestore(collection, data) {
    try {
      await this.ensureInitialized();
      
      if (!firestoreDb || !isFirebaseAvailable) {
        console.warn('⚠️ Firestore not available, skipping save');
        return { success: false, error: 'Firestore not available', fallback: true };
      }

      const docRef = await firestoreDb.collection(collection).add({
        ...data,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
      return { success: true, id: docRef.id, message: 'Data saved to Firestore' };
      
    } catch (error) {
      console.error('Firestore save error:', error.message);
      return { success: false, error: error.message };
    }
  }

  async getFromFirestore(collection, filters = []) {
    try {
      await this.ensureInitialized();
      
      if (!firestoreDb || !isFirebaseAvailable) {
        console.warn('⚠️ Firestore not available');
        return { success: false, error: 'Firestore not available', data: [] };
      }

      let query = firestoreDb.collection(collection);
      
      // Apply filters if provided
      filters.forEach(filter => {
        query = query.where(filter.field, filter.operator, filter.value);
      });
      
      const snapshot = await query.get();
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      return { success: true, data: docs };
      
    } catch (error) {
      console.error('Firestore get error:', error.message);
      return { success: false, error: error.message, data: [] };
    }
  }
}

// Export functions and services
export const dbService = new DatabaseService();

// Export admin for other operations (may be undefined if Firebase failed)
export { admin };

// Export database instances (may be null if Firebase failed)
export { realtimeDb, firestoreDb };

// Health check function
export const checkFirebaseHealth = async () => {
  try {
    await dbService.ensureInitialized();
    return {
      available: isFirebaseAvailable,
      realtimeDb: !!realtimeDb,
      firestore: !!firestoreDb,
      projectId: process.env.FIREBASE_PROJECT_ID || 'not configured'
    };
  } catch (error) {
    return {
      available: false,
      error: error.message
    };
  }
};

export const isFirebaseInitialized = () => isFirebaseAvailable;

console.log('📦 Firebase module loaded');

// Initialize on import (but don't throw if it fails)
setTimeout(() => {
  dbService.ensureInitialized().catch(error => {
    console.warn('Delayed Firebase initialization failed:', error.message);
  });
}, 100);
