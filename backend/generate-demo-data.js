// Demo data generator for MySQL Database
// Run this to populate your MySQL database with sample feedback data

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD ?? '',
  database: process.env.DB_NAME || 'twise_feedback',
};

// Sample feedback data for different events
const sampleFeedback = {
  'twise-night': [
    {
      activity: 'AI Workshop & Innovation',
      starRating: 5,
      comment: 'Amazing workshop! Learned so much about neural networks and their applications.',
      sentiment: 'positive',
      sentimentScore: 0.92,
      sentimentConfidence: 0.89,
      language: 'en',
      userName: 'Alice Johnson',
      userEmail: 'alice@example.com'
    },
    {
      activity: 'Healthcare & Biotech',
      starRating: 4,
      comment: 'Very interesting presentations on medical AI. Would love to see more hands-on demos.',
      sentiment: 'positive',
      sentimentScore: 0.78,
      sentimentConfidence: 0.85,
      language: 'en',
      userName: 'Bob Smith',
      userEmail: 'bob@example.com'
    },
    {
      activity: 'Quantum Computing Demo',
      starRating: 5,
      comment: 'Mind-blowing! The quantum supremacy examples were fascinating.',
      sentiment: 'positive',
      sentimentScore: 0.95,
      sentimentConfidence: 0.92,
      language: 'en',
      userName: 'Carol Davis',
      userEmail: 'carol@example.com'
    },
    {
      activity: 'Environmental Projects',
      starRating: 4,
      comment: 'Great to see AI being used for climate solutions. Very inspiring!',
      sentiment: 'positive',
      sentimentScore: 0.88,
      sentimentConfidence: 0.91,
      language: 'en',
      userName: 'David Wilson',
      userEmail: 'david@example.com'
    },
    {
      activity: 'Robotics Lab',
      starRating: 5,
      comment: 'The robotic demonstrations were incredible! Hands-on experience was perfect.',
      sentiment: 'positive',
      sentimentScore: 0.91,
      sentimentConfidence: 0.88,
      language: 'en',
      userName: 'Eva Rodriguez',
      userEmail: 'eva@example.com'
    },
    {
      activity: 'VR Research Experience',
      starRating: 4,
      comment: 'Immersive VR experience was amazing. Some technical hiccups but overall great.',
      sentiment: 'positive',
      sentimentScore: 0.72,
      sentimentConfidence: 0.78,
      language: 'en',
      userName: 'Frank Miller',
      userEmail: 'frank@example.com'
    }
  ],
  
  'sample-research-event': [
    {
      activity: 'Workshop',
      starRating: 4,
      comment: 'Very informative workshop with practical examples.',
      sentiment: 'positive',
      sentimentScore: 0.82,
      sentimentConfidence: 0.86,
      language: 'en',
      userName: 'Grace Chen',
      userEmail: 'grace@example.com'
    },
    {
      activity: 'Presentation',
      starRating: 5,
      comment: 'Excellent presentation! Clear and engaging content.',
      sentiment: 'positive',
      sentimentScore: 0.89,
      sentimentConfidence: 0.91,
      language: 'en',
      userName: 'Henry Brown',
      userEmail: 'henry@example.com'
    },
    {
      activity: 'Demo',
      starRating: 3,
      comment: 'Demo was okay, but could have been more interactive.',
      sentiment: 'neutral',
      sentimentScore: 0.52,
      sentimentConfidence: 0.75,
      language: 'en',
      userName: 'Iris Taylor',
      userEmail: 'iris@example.com'
    },
    {
      activity: 'Networking',
      starRating: 4,
      comment: 'Good networking opportunities. Met some interesting researchers.',
      sentiment: 'positive',
      sentimentScore: 0.76,
      sentimentConfidence: 0.82,
      language: 'en',
      userName: 'Jack Anderson',
      userEmail: 'jack@example.com'
    }
  ]
};

// Function to generate demo data
export async function generateDemoData() {
  let connection = null;
  
  try {
    console.log('🚀 Generating demo data for MySQL database...');
    console.log('📊 Connecting to database...');
    
    // Connect to database
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to MySQL database');
    
    // Check if events exist
    const [eventRows] = await connection.execute('SELECT id FROM events');
    const existingEventIds = eventRows.map((row) => row.id);
    
    let totalFeedbackAdded = 0;
    
    for (const [eventId, feedbacks] of Object.entries(sampleFeedback)) {
      if (!existingEventIds.includes(eventId)) {
        console.log(`⚠️ Event '${eventId}' not found in database. Skipping...`);
        continue;
      }
      
      console.log(`📝 Adding ${feedbacks.length} feedback entries for '${eventId}'...`);
      
      for (const feedback of feedbacks) {
        const feedbackId = `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        await connection.execute(`
          INSERT INTO feedback (
            feedback_id, event_id, star_rating, activity, comment, user_name, user_email,
            sentiment, sentiment_score, sentiment_confidence, language, processing_time
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          feedbackId,
          eventId,
          feedback.starRating,
          feedback.activity,
          feedback.comment,
          feedback.userName,
          feedback.userEmail,
          feedback.sentiment,
          feedback.sentimentScore,
          feedback.sentimentConfidence,
          feedback.language,
          Math.floor(Math.random() * 500) + 100 // Random processing time 100-600ms
        ]);
        
        totalFeedbackAdded++;
      }
    }
    
    console.log('');
    console.log('✅ Demo data generated successfully!');
    console.log(`📊 Total feedback entries added: ${totalFeedbackAdded}`);
    console.log('');
    console.log('🌐 You can now view your dashboards at:');
    console.log('   - http://localhost:3000/admin/twise-night');
    console.log('   - http://localhost:3000/admin/sample-research-event');
    console.log('   - http://localhost:3000/admin (overview)');
    console.log('');
    console.log('🎯 Test the feedback forms at:');
    console.log('   - http://localhost:3000/event/twise-night');
    console.log('   - http://localhost:3000/event/sample-research-event');
    
  } catch (error) {
    console.error('❌ Error generating demo data:', error);
    console.error('💡 Make sure:');
    console.error('   1. MySQL is running');
    console.error('   2. Database and tables are created (run npm run setup-db)');
    console.error('   3. Credentials in .env.local are correct');
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run demo data generation if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateDemoData().then(() => {
    process.exit(0);
  }).catch((error) => {
    console.error('Demo data generation failed:', error);
    process.exit(1);
  });
}
