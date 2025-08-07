import admin from 'firebase-admin';

let db = null;
let isFirebaseAvailable = false;

// Initialize Firebase Admin SDK
const initializeFirebase = () => {
  try {
    // Don't initialize if already initialized
    if (admin.apps.length > 0) {
      console.log('✅ Firebase Admin already initialized');
      db = admin.database();
      isFirebaseAvailable = true;
      return true;
    }

    // Check required environment variables
    if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_DATABASE_URL) {
      console.warn('⚠️ Missing Firebase configuration in environment variables');
      return false;
    }

    // Initialize configuration
    const config = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      databaseURL: process.env.FIREBASE_DATABASE_URL,
    };

    // Use service account credentials if available (production)
    if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
      config.credential = admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      });
      console.log('🔑 Using service account credentials');
    } else {
      console.log('🔑 Using default credentials (development mode)');
    }

    // Initialize Firebase Admin
    admin.initializeApp(config);
    db = admin.database();
    isFirebaseAvailable = true;

    console.log('✅ Firebase Admin SDK initialized successfully');
    console.log(`📊 Database URL: ${process.env.FIREBASE_DATABASE_URL}`);
    
    return true;

  } catch (error) {
    console.error('❌ Firebase initialization failed:', error.message);
    isFirebaseAvailable = false;
    return false;
  }
};

// Database service with error handling
class DatabaseService {
  constructor() {
    this.initialized = false;
    this.init();
  }

  init() {
    this.initialized = initializeFirebase();
    return this.initialized;
  }

  // Ensure Firebase is available before operations
  ensureAvailable() {
    if (!isFirebaseAvailable || !db) {
      throw new Error('Firebase is not available');
    }
  }

  // Save data to Firebase Realtime Database
  async save(path, data) {
    try {
      this.ensureAvailable();
      
      const ref = db.ref(path);
      if (data.id) {
        // Update existing record
        await ref.child(data.id).set(data);
        return { success: true, id: data.id };
      } else {
        // Create new record
        const newRef = await ref.push(data);
        return { success: true, id: newRef.key };
      }
    } catch (error) {
      console.error(`Error saving to ${path}:`, error.message);
      throw error;
    }
  }

  // Get data from Firebase
  async get(path, filters = {}) {
    try {
      this.ensureAvailable();
      
      let ref = db.ref(path);
      
      // Apply filters
      if (filters.orderBy) {
        ref = ref.orderByChild(filters.orderBy);
      }
      if (filters.equalTo !== undefined) {
        ref = ref.equalTo(filters.equalTo);
      }
      if (filters.limitToLast) {
        ref = ref.limitToLast(filters.limitToLast);
      }

      const snapshot = await ref.once('value');
      return snapshot.val() || {};
    } catch (error) {
      console.error(`Error getting from ${path}:`, error.message);
      throw error;
    }
  }

  // Delete data from Firebase
  async delete(path) {
    try {
      this.ensureAvailable();
      
      const ref = db.ref(path);
      await ref.remove();
      return { success: true };
    } catch (error) {
      console.error(`Error deleting ${path}:`, error.message);
      throw error;
    }
  }

  // Update specific fields
  async update(path, updates) {
    try {
      this.ensureAvailable();
      
      const ref = db.ref(path);
      await ref.update(updates);
      return { success: true };
    } catch (error) {
      console.error(`Error updating ${path}:`, error.message);
      throw error;
    }
  }

  // Listen to real-time changes
  listen(path, callback) {
    try {
      this.ensureAvailable();
      
      const ref = db.ref(path);
      ref.on('value', (snapshot) => {
        callback(snapshot.val() || {});
      });
      
      return () => ref.off('value');
    } catch (error) {
      console.error(`Error setting up listener for ${path}:`, error.message);
      throw error;
    }
  }

  // Check if Firebase is available
  isAvailable() {
    return isFirebaseAvailable;
  }

  // Get health status
  getHealthStatus() {
    return {
      available: isFirebaseAvailable,
      projectId: process.env.FIREBASE_PROJECT_ID || 'not configured',
      databaseUrl: process.env.FIREBASE_DATABASE_URL || 'not configured',
      hasCredentials: !!(process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL)
    };
  }
}

// Create singleton instance
export const dbService = new DatabaseService();

// Export admin instance and database reference
export { admin, db };
export const isFirebaseInitialized = () => isFirebaseAvailable;

// Initialize on import
console.log('📦 Firebase Admin SDK module loaded');
