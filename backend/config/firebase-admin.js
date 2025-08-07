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
      console.warn(`Project ID: ${process.env.FIREBASE_PROJECT_ID || 'MISSING'}`);
      console.warn(`Database URL: ${process.env.FIREBASE_DATABASE_URL || 'MISSING'}`);
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
      // For development, try to initialize without credentials
      // This might work if Firebase rules allow public access
      console.log('🔑 Development mode - attempting initialization without credentials');
      console.log('⚠️ Note: Firebase Realtime Database rules must allow public access');
    }

    // Initialize Firebase Admin
    admin.initializeApp(config);
    db = admin.database();
    isFirebaseAvailable = true;

    console.log('✅ Firebase Admin SDK initialized successfully');
    console.log(`📊 Project: ${process.env.FIREBASE_PROJECT_ID}`);
    console.log(`🔗 Database: ${process.env.FIREBASE_DATABASE_URL}`);
    
    return true;

  } catch (error) {
    console.error('❌ Firebase initialization failed:', error.message);
    console.warn('🔄 Backend will continue with limited functionality');
    console.warn('💡 To fix: Add Firebase service account credentials to .env.local');
    isFirebaseAvailable = false;
    return false;
  }
};

// Database service with error handling and fallback
class DatabaseService {
  constructor() {
    this.initialized = false;
    this.mockData = new Map(); // Fallback data store
    this.init();
  }

  init() {
    this.initialized = initializeFirebase();
    return this.initialized;
  }

  // Ensure Firebase is available before operations
  ensureAvailable() {
    if (!isFirebaseAvailable || !db) {
      throw new Error('Firebase is not available - using fallback mode');
    }
  }

  // Save data to Firebase or fallback storage
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
      console.warn(`Firebase save failed for ${path}, using fallback:`, error.message);
      
      // Fallback to in-memory storage
      const id = data.id || `fallback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const pathData = this.mockData.get(path) || {};
      pathData[id] = { ...data, id };
      this.mockData.set(path, pathData);
      
      return { success: true, id, fallback: true };
    }
  }

  // Get data from Firebase or fallback storage
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
      console.warn(`Firebase get failed for ${path}, using fallback:`, error.message);
      
      // Return fallback data
      return this.mockData.get(path) || {};
    }
  }

  // Delete data from Firebase or fallback storage
  async delete(path) {
    try {
      this.ensureAvailable();
      
      const ref = db.ref(path);
      await ref.remove();
      return { success: true };
    } catch (error) {
      console.warn(`Firebase delete failed for ${path}, using fallback:`, error.message);
      
      // Delete from fallback storage
      this.mockData.delete(path);
      return { success: true, fallback: true };
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
      console.warn(`Firebase update failed for ${path}, using fallback:`, error.message);
      
      // Update in fallback storage
      const pathData = this.mockData.get(path) || {};
      Object.assign(pathData, updates);
      this.mockData.set(path, pathData);
      return { success: true, fallback: true };
    }
  }

  // Listen to real-time changes (fallback: return mock listener)
  listen(path, callback) {
    try {
      this.ensureAvailable();
      
      const ref = db.ref(path);
      ref.on('value', (snapshot) => {
        callback(snapshot.val() || {});
      });
      
      return () => ref.off('value');
    } catch (error) {
      console.warn(`Firebase listener failed for ${path}, using mock listener:`, error.message);
      
      // Mock listener - call callback with current fallback data
      const intervalId = setInterval(() => {
        const data = this.mockData.get(path) || {};
        callback(data);
      }, 5000); // Update every 5 seconds
      
      return () => clearInterval(intervalId);
    }
  }

  // Check if Firebase is available
  isAvailable() {
    return isFirebaseAvailable;
  }

  // Get health status
  getHealthStatus() {
    const status = {
      available: isFirebaseAvailable,
      projectId: process.env.FIREBASE_PROJECT_ID || 'not configured',
      databaseUrl: process.env.FIREBASE_DATABASE_URL || 'not configured',
      hasCredentials: !!(process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL),
      fallbackMode: !isFirebaseAvailable,
      mockDataEntries: isFirebaseAvailable ? 0 : this.mockData.size
    };
    
    if (!isFirebaseAvailable) {
      status.note = 'Using fallback in-memory storage. Add Firebase credentials to enable cloud storage.';
    }
    
    return status;
  }

  // Add some initial mock data for development
  addMockData() {
    if (!isFirebaseAvailable) {
      // Add some sample events
      this.mockData.set('events', {
        'sample-event-1': {
          id: 'sample-event-1',
          title: 'Sample Research Event',
          subtitle: 'Demo event for testing',
          activities: ['AI Workshop', 'Data Analysis', 'Presentation'],
          theme: {
            background: 'from-indigo-900 via-purple-900 to-blue-900',
            titleGradient: 'from-indigo-300 to-purple-300',
            buttonGradient: 'from-indigo-600 to-purple-600',
            buttonHover: 'from-indigo-700 to-purple-700',
            accent: 'indigo-400'
          },
          activityLabel: 'Which aspect would you like to rate?',
          feedbackLabel: 'Share your thoughts',
          feedbackPlaceholder: 'Tell us about your experience...',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isCustom: true
        }
      });
      
      console.log('📝 Added mock data for development');
    }
  }
}

// Create singleton instance
export const dbService = new DatabaseService();

// Add mock data if in fallback mode
setTimeout(() => {
  if (!isFirebaseAvailable) {
    dbService.addMockData();
  }
}, 1000);

// Export admin instance and database reference
export { admin, db };
export const isFirebaseInitialized = () => isFirebaseAvailable;

console.log('📦 Firebase Admin SDK module loaded');
