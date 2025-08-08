// MySQL Database Service for Universal Feedback Platform
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

let pool = null;
let isDbAvailable = false;

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD ?? '',
  database: process.env.DB_NAME || 'twise_feedback',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000
};

// Initialize database connection
const initializeDatabase = async () => {
  try {
    console.log('🗄️ Initializing MySQL database connection...');
    console.log(`📊 Host: ${dbConfig.host}:${dbConfig.port}`);
    console.log(`🗃️ Database: ${dbConfig.database}`);
    
    // Create connection pool
    pool = mysql.createPool(dbConfig);
    
    // Test connection
    const connection = await pool.getConnection();
    console.log('✅ MySQL connection established');
    
    // Create database if it doesn't exist
    await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\``);
    console.log(`✅ Database '${dbConfig.database}' ready`);
    
    connection.release();
    
    // Initialize tables
    await initializeTables();
    
    isDbAvailable = true;
    console.log('🎉 MySQL database fully initialized!');
    
    return true;
    
  } catch (error) {
    console.error('❌ MySQL initialization failed:', error.message);
    console.log('🔧 Solutions:');
    console.log('   1. Install MySQL: https://dev.mysql.com/downloads/installer/');
    console.log('   2. Start MySQL service');
    console.log('   3. Update credentials in backend/.env.local');
    console.log('   4. Or run: npm run setup-db');
    
    isDbAvailable = false;
    return false;
  }
};

// Create database tables
const initializeTables = async () => {
  try {
    console.log('📋 Creating database tables...');
    
    // Events table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS events (
        id VARCHAR(255) PRIMARY KEY,
        firebase_id VARCHAR(255) UNIQUE,
        title VARCHAR(500) NOT NULL,
        subtitle TEXT,
        activities JSON,
        theme JSON,
        activity_label VARCHAR(500) DEFAULT 'Which aspect would you like to rate?',
        feedback_label VARCHAR(500) DEFAULT 'Share your thoughts',
        feedback_placeholder TEXT DEFAULT 'Tell us about your experience...',
        is_custom BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_created_at (created_at),
        INDEX idx_is_custom (is_custom)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    // Feedback table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS feedback (
        id INT AUTO_INCREMENT PRIMARY KEY,
        feedback_id VARCHAR(255) UNIQUE,
        event_id VARCHAR(255) NOT NULL,
        star_rating INT NOT NULL CHECK (star_rating >= 1 AND star_rating <= 5),
        activity VARCHAR(500) NOT NULL,
        comment TEXT,
        user_name VARCHAR(255) DEFAULT 'Anonymous',
        user_email VARCHAR(255),
        sentiment ENUM('positive', 'negative', 'neutral') DEFAULT 'neutral',
        sentiment_score DECIMAL(3,2) DEFAULT 0.50,
        sentiment_confidence DECIMAL(3,2) DEFAULT 0.00,
        language VARCHAR(10) DEFAULT 'en',
        processing_time INT DEFAULT 0,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
        INDEX idx_event_id (event_id),
        INDEX idx_sentiment (sentiment),
        INDEX idx_timestamp (timestamp),
        INDEX idx_star_rating (star_rating)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    console.log('✅ Database tables created successfully');
    
    // Insert default events if none exist
    const [existingEvents] = await pool.execute('SELECT COUNT(*) as count FROM events');
    if (existingEvents[0].count === 0) {
      await insertDefaultEvents();
    }
    
  } catch (error) {
    console.error('❌ Table creation failed:', error.message);
    throw error;
  }
};

// Insert default sample events
const insertDefaultEvents = async () => {
  try {
    console.log('📝 Inserting default events...');
    
    const defaultEvents = [
      {
        id: 'twise-night',
        title: 'TWISE Night Feedback',
        subtitle: 'Share your research experience with us!',
        activities: ['AI Workshop & Innovation', 'Healthcare & Biotech', 'Environmental Projects', 'Smart Cities & IoT', 'Social Impact Research', 'Quantum Computing Demo', 'Robotics Lab', 'VR Research Experience'],
        theme: {
          background: 'from-indigo-900 via-purple-900 to-blue-900',
          titleGradient: 'from-indigo-300 to-purple-300',
          buttonGradient: 'from-indigo-600 to-purple-600',
          buttonHover: 'from-indigo-700 to-purple-700',
          accent: 'indigo-400'
        },
        activity_label: 'Select The Activity You Liked The Most!',
        feedback_label: 'What did you learn?',
        feedback_placeholder: 'Share your thoughts about this research activity...',
        is_custom: false
      },
      {
        id: 'sample-research-event',
        title: 'Sample Research Event',
        subtitle: 'Demo event for testing the platform',
        activities: ['Workshop', 'Presentation', 'Demo', 'Networking'],
        theme: {
          background: 'from-blue-900 via-purple-900 to-indigo-900',
          titleGradient: 'from-blue-300 to-purple-300',
          buttonGradient: 'from-blue-600 to-purple-600',
          buttonHover: 'from-blue-700 to-purple-700',
          accent: 'blue-400'
        },
        is_custom: true
      }
    ];
    
    for (const event of defaultEvents) {
      await pool.execute(`
        INSERT INTO events (id, title, subtitle, activities, theme, activity_label, feedback_label, feedback_placeholder, is_custom)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        event.id,
        event.title,
        event.subtitle,
        JSON.stringify(event.activities),
        JSON.stringify(event.theme),
        event.activity_label,
        event.feedback_label,
        event.feedback_placeholder,
        event.is_custom
      ]);
    }
    
    console.log('✅ Default events inserted successfully');
    
  } catch (error) {
    console.error('⚠️ Default events insertion failed:', error.message);
    // Don't throw - this is not critical
  }
};

// Database service class
class DatabaseService {
  constructor() {
    this.initialized = false;
    this.init();
  }

  async init() {
    try {
      this.initialized = await initializeDatabase();
      return this.initialized;
    } catch (error) {
      console.error('DatabaseService init failed:', error.message);
      return false;
    }
  }

  isAvailable() {
    return isDbAvailable;
  }

  // Save event
  async saveEvent(eventData) {
    try {
      if (!isDbAvailable) throw new Error('Database not available');
      
      const query = `
        INSERT INTO events (id, firebase_id, title, subtitle, activities, theme, activity_label, feedback_label, feedback_placeholder, is_custom)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
        title = VALUES(title),
        subtitle = VALUES(subtitle),
        activities = VALUES(activities),
        theme = VALUES(theme),
        activity_label = VALUES(activity_label),
        feedback_label = VALUES(feedback_label),
        feedback_placeholder = VALUES(feedback_placeholder),
        updated_at = CURRENT_TIMESTAMP
      `;
      
      const [result] = await pool.execute(query, [
        eventData.id,
        eventData.firebaseId || null,
        eventData.title,
        eventData.subtitle || '',
        JSON.stringify(eventData.activities || []),
        JSON.stringify(eventData.theme || {}),
        eventData.activityLabel || 'Which aspect would you like to rate?',
        eventData.feedbackLabel || 'Share your thoughts',
        eventData.feedbackPlaceholder || 'Tell us about your experience...',
        eventData.isCustom !== false
      ]);
      
      console.log(`✅ Event saved: ${eventData.id}`);
      return { success: true, id: eventData.id };
      
    } catch (error) {
      console.error('❌ Event save failed:', error.message);
      throw error;
    }
  }

  // Get all events
  async getEvents() {
    try {
      if (!isDbAvailable) throw new Error('Database not available');
      
      const [rows] = await pool.execute(`
        SELECT *, firebase_id as firebaseId FROM events 
        ORDER BY created_at DESC
      `);
      
      // Parse JSON fields
      const events = rows.map(row => ({
        ...row,
        activities: JSON.parse(row.activities || '[]'),
        theme: JSON.parse(row.theme || '{}'),
        activityLabel: row.activity_label,
        feedbackLabel: row.feedback_label,
        feedbackPlaceholder: row.feedback_placeholder,
        isCustom: Boolean(row.is_custom),
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }));
      
      console.log(`✅ Retrieved ${events.length} events`);
      return events;
      
    } catch (error) {
      console.error('❌ Events fetch failed:', error.message);
      throw error;
    }
  }

  // Get single event
  async getEvent(eventId) {
    try {
      if (!isDbAvailable) throw new Error('Database not available');
      
      const [rows] = await pool.execute(`
        SELECT *, firebase_id as firebaseId FROM events 
        WHERE id = ? OR firebase_id = ?
      `, [eventId, eventId]);
      
      if (rows.length === 0) {
        return null;
      }
      
      const event = {
        ...rows[0],
        activities: JSON.parse(rows[0].activities || '[]'),
        theme: JSON.parse(rows[0].theme || '{}'),
        activityLabel: rows[0].activity_label,
        feedbackLabel: rows[0].feedback_label,
        feedbackPlaceholder: rows[0].feedback_placeholder,
        isCustom: Boolean(rows[0].is_custom),
        createdAt: rows[0].created_at,
        updatedAt: rows[0].updated_at
      };
      
      console.log(`✅ Retrieved event: ${eventId}`);
      return event;
      
    } catch (error) {
      console.error('❌ Event fetch failed:', error.message);
      throw error;
    }
  }

  // Delete event
  async deleteEvent(eventId) {
    try {
      if (!isDbAvailable) throw new Error('Database not available');
      
      const [result] = await pool.execute(`
        DELETE FROM events WHERE id = ? OR firebase_id = ?
      `, [eventId, eventId]);
      
      console.log(`✅ Event deleted: ${eventId}`);
      return { success: true, affectedRows: result.affectedRows };
      
    } catch (error) {
      console.error('❌ Event delete failed:', error.message);
      throw error;
    }
  }

  // Save feedback
  async saveFeedback(feedbackData) {
    try {
      if (!isDbAvailable) throw new Error('Database not available');
      
      const feedbackId = feedbackData.feedbackId || `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const [result] = await pool.execute(`
        INSERT INTO feedback (
          feedback_id, event_id, star_rating, activity, comment, user_name, user_email,
          sentiment, sentiment_score, sentiment_confidence, language, processing_time
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        feedbackId,
        feedbackData.eventId,
        feedbackData.starRating,
        feedbackData.activity,
        feedbackData.comment || '',
        feedbackData.userName || 'Anonymous',
        feedbackData.userEmail || null,
        feedbackData.sentiment || 'neutral',
        feedbackData.sentimentScore || 0.5,
        feedbackData.sentimentConfidence || 0,
        feedbackData.language || 'en',
        feedbackData.processingTime || 0
      ]);
      
      console.log(`✅ Feedback saved: ${feedbackId}`);
      return { success: true, id: feedbackId, insertId: result.insertId };
      
    } catch (error) {
      console.error('❌ Feedback save failed:', error.message);
      throw error;
    }
  }

  // Get feedback with filters
  async getFeedback(filters = {}) {
    try {
      if (!isDbAvailable) throw new Error('Database not available');
      
      let query = 'SELECT * FROM feedback';
      const params = [];
      const conditions = [];
      
      if (filters.eventId) {
        conditions.push('event_id = ?');
        params.push(filters.eventId);
      }
      
      if (filters.sentiment) {
        conditions.push('sentiment = ?');
        params.push(filters.sentiment);
      }
      
      if (filters.activity) {
        conditions.push('activity = ?');
        params.push(filters.activity);
      }
      
      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }
      
      query += ' ORDER BY timestamp DESC';
      
      if (filters.limit) {
        query += ' LIMIT ?';
        params.push(parseInt(filters.limit));
      }
      
      const [rows] = await pool.execute(query, params);
      
      // Format response
      const feedback = rows.map(row => ({
        feedbackId: row.feedback_id,
        eventId: row.event_id,
        starRating: row.star_rating,
        activity: row.activity,
        comment: row.comment,
        userName: row.user_name,
        userEmail: row.user_email,
        sentiment: row.sentiment,
        sentimentScore: parseFloat(row.sentiment_score),
        sentimentConfidence: parseFloat(row.sentiment_confidence),
        language: row.language,
        processingTime: row.processing_time,
        timestamp: row.timestamp
      }));
      
      console.log(`✅ Retrieved ${feedback.length} feedback entries`);
      return feedback;
      
    } catch (error) {
      console.error('❌ Feedback fetch failed:', error.message);
      throw error;
    }
  }

  // Get analytics for an event
  async getEventAnalytics(eventId) {
    try {
      if (!isDbAvailable) throw new Error('Database not available');
      
      // Get event details
      const event = await this.getEvent(eventId);
      if (!event) {
        throw new Error('Event not found');
      }
      
      // Get all feedback for the event
      const feedback = await this.getFeedback({ eventId });
      
      if (feedback.length === 0) {
        return {
          event,
          analytics: {
            totalFeedback: 0,
            averageRating: 0,
            sentimentBreakdown: { positive: 0, neutral: 0, negative: 0 },
            activityBreakdown: {},
            ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
            languageDistribution: {},
            timeAnalysis: { last24Hours: 0, last7Days: 0, last30Days: 0 },
            trends: { hourly: Array(24).fill(0), daily: Array(7).fill(0), recentSentiment: [] },
            lastUpdated: new Date().toISOString()
          }
        };
      }
      
      // Calculate analytics
      const totalFeedback = feedback.length;
      const averageRating = feedback.reduce((sum, f) => sum + f.starRating, 0) / totalFeedback;
      
      const sentimentBreakdown = {
        positive: feedback.filter(f => f.sentiment === 'positive').length,
        neutral: feedback.filter(f => f.sentiment === 'neutral').length,
        negative: feedback.filter(f => f.sentiment === 'negative').length
      };
      
      const activityBreakdown = {};
      feedback.forEach(f => {
        if (!activityBreakdown[f.activity]) {
          activityBreakdown[f.activity] = {
            count: 0,
            averageRating: 0,
            sentiments: { positive: 0, neutral: 0, negative: 0 }
          };
        }
        activityBreakdown[f.activity].count++;
        activityBreakdown[f.activity].sentiments[f.sentiment || 'neutral']++;
      });
      
      // Calculate average ratings per activity
      Object.keys(activityBreakdown).forEach(activity => {
        const activityFeedback = feedback.filter(f => f.activity === activity);
        const avgRating = activityFeedback.reduce((sum, f) => sum + f.starRating, 0) / activityFeedback.length;
        activityBreakdown[activity].averageRating = avgRating;
      });
      
      const ratingDistribution = {
        1: feedback.filter(f => f.starRating === 1).length,
        2: feedback.filter(f => f.starRating === 2).length,
        3: feedback.filter(f => f.starRating === 3).length,
        4: feedback.filter(f => f.starRating === 4).length,
        5: feedback.filter(f => f.starRating === 5).length
      };
      
      const languageDistribution = {};
      feedback.forEach(f => {
        const lang = f.language || 'unknown';
        languageDistribution[lang] = (languageDistribution[lang] || 0) + 1;
      });
      
      // Time analysis
      const now = new Date();
      const last24h = feedback.filter(f => 
        f.timestamp && (now - new Date(f.timestamp)) < 24 * 60 * 60 * 1000
      ).length;
      const last7d = feedback.filter(f => 
        f.timestamp && (now - new Date(f.timestamp)) < 7 * 24 * 60 * 60 * 1000
      ).length;
      const last30d = feedback.filter(f => 
        f.timestamp && (now - new Date(f.timestamp)) < 30 * 24 * 60 * 60 * 1000
      ).length;
      
      // Recent sentiment trend
      const recentSentiment = feedback
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 10)
        .map(f => ({
          sentiment: f.sentiment,
          rating: f.starRating,
          timestamp: f.timestamp
        }));
      
      return {
        event,
        analytics: {
          totalFeedback,
          averageRating: Math.round(averageRating * 10) / 10,
          sentimentBreakdown,
          activityBreakdown,
          ratingDistribution,
          languageDistribution,
          timeAnalysis: { last24Hours: last24h, last7Days: last7d, last30Days: last30d },
          trends: {
            hourly: Array(24).fill(0), // TODO: Implement hourly trends
            daily: Array(7).fill(0),   // TODO: Implement daily trends
            recentSentiment
          },
          lastUpdated: new Date().toISOString()
        }
      };
      
    } catch (error) {
      console.error('❌ Analytics fetch failed:', error.message);
      throw error;
    }
  }

  // Get health status
  getHealthStatus() {
    return {
      available: isDbAvailable,
      type: 'mysql',
      host: dbConfig.host,
      port: dbConfig.port,
      database: dbConfig.database,
      connectionStatus: isDbAvailable ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString()
    };
  }

  // Test connection
  async testConnection() {
    try {
      if (!isDbAvailable) throw new Error('Database not available');
      
      const [rows] = await pool.execute('SELECT 1 as test');
      console.log('✅ Database connection test successful');
      return true;
    } catch (error) {
      console.error('❌ Database connection test failed:', error.message);
      throw error;
    }
  }
}

// Create singleton instance
export const dbService = new DatabaseService();

console.log('🗄️ MySQL Database Service loaded');
