// Feedback routes with Firebase integration and sentiment analysis
import sentimentAnalyzer from '../services/sentiment.js';
import { dbService } from '../config/firebase-admin.js';

// Get feedback with optional filtering
export const getFeedback = async (req, res) => {
  try {
    const { eventId, sentiment, activity, limit = 100 } = req.query;
    
    let feedbackArray = [];

    if (eventId) {
      // Get feedback for specific event
      const events = await dbService.get('events');
      let firebaseId = null;

      // Find event by firebaseId or event.id
      if (events[eventId]) {
        firebaseId = eventId;
      } else {
        const eventEntry = Object.entries(events).find(([, data]) => data.id === eventId);
        if (eventEntry) {
          [firebaseId] = eventEntry;
        }
      }

      if (!firebaseId) {
        return res.status(404).json({
          success: false,
          error: 'Event not found'
        });
      }

      const feedbackData = await dbService.get(`events/${firebaseId}/feedback`);
      feedbackArray = Object.entries(feedbackData || {}).map(([id, data]) => ({
        ...data,
        feedbackId: id,
        eventId: firebaseId
      }));
    } else {
      // Get feedback from all events
      const events = await dbService.get('events');
      
      for (const [firebaseId] of Object.entries(events)) {
        try {
          const feedbackData = await dbService.get(`events/${firebaseId}/feedback`);
          const eventFeedback = Object.entries(feedbackData || {}).map(([id, data]) => ({
            ...data,
            feedbackId: id,
            eventId: firebaseId
          }));
          feedbackArray.push(...eventFeedback);
        } catch (err) {
          console.warn(`Could not get feedback for event ${firebaseId}:`, err.message);
        }
      }
    }

    // Apply filters
    if (sentiment) {
      feedbackArray = feedbackArray.filter(f => f.sentiment === sentiment);
    }
    if (activity) {
      feedbackArray = feedbackArray.filter(f => f.activity === activity);
    }

    // Sort by timestamp (newest first)
    feedbackArray.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));

    // Apply limit
    feedbackArray = feedbackArray.slice(0, parseInt(limit));

    res.json({
      success: true,
      count: feedbackArray.length,
      data: feedbackArray
    });

  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch feedback',
      message: error.message
    });
  }
};

// Submit new feedback with sentiment analysis
export const submitFeedback = async (req, res) => {
  try {
    const { 
      starRating, 
      activity, 
      comment, 
      eventId,
      userName = 'Anonymous',
      userEmail = null 
    } = req.body;

    // Validate required fields
    if (!starRating || !activity || !eventId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        required: ['starRating', 'activity', 'eventId']
      });
    }

    // Validate star rating (1-5)
    if (starRating < 1 || starRating > 5) {
      return res.status(400).json({
        success: false,
        error: 'Star rating must be between 1 and 5'
      });
    }

    // Find event by eventId
    const events = await dbService.get('events');
    let firebaseId = null;
    let event = null;

    if (events[eventId]) {
      firebaseId = eventId;
      event = events[eventId];
    } else {
      const eventEntry = Object.entries(events).find(([, data]) => data.id === eventId);
      if (eventEntry) {
        [firebaseId, event] = eventEntry;
      }
    }

    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    // Analyze sentiment if comment is provided
    let sentimentData = {
      sentiment: 'neutral',
      score: 0.5,
      confidence: 0
    };

    if (comment && comment.trim()) {
      console.log(`🔍 Analyzing comment: "${comment.substring(0, 50)}..."`);
      sentimentData = await sentimentAnalyzer.analyze(comment);
      console.log(`📊 Sentiment: ${sentimentData.sentiment} (confidence: ${sentimentData.confidence})`);
    }

    // Create feedback record
    const feedback = {
      starRating: parseInt(starRating),
      activity,
      comment: comment || '',
      eventId: event.id,
      userName,
      userEmail,
      sentiment: sentimentData.sentiment,
      sentimentScore: sentimentData.score,
      sentimentConfidence: sentimentData.confidence,
      language: sentimentData.language || 'en',
      timestamp: new Date().toISOString(),
      processingTime: sentimentData.processingTime || 0
    };

    // Save to Firebase under the specific event
    const result = await dbService.save(`events/${firebaseId}/feedback`, feedback);

    // Return success response
    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      data: {
        ...feedback,
        feedbackId: result.id
      }
    });

  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit feedback',
      message: error.message
    });
  }
};

// Get feedback statistics (maintained for backward compatibility)
export const getFeedbackStats = async (req, res) => {
  try {
    const { eventId } = req.query;
    
    let feedbackArray = [];

    if (eventId) {
      // Get feedback for specific event
      const events = await dbService.get('events');
      let firebaseId = null;

      if (events[eventId]) {
        firebaseId = eventId;
      } else {
        const eventEntry = Object.entries(events).find(([, data]) => data.id === eventId);
        if (eventEntry) {
          [firebaseId] = eventEntry;
        }
      }

      if (firebaseId) {
        const feedbackData = await dbService.get(`events/${firebaseId}/feedback`);
        feedbackArray = Object.values(feedbackData || {});
      }
    } else {
      // Get all feedback
      const events = await dbService.get('events');
      
      for (const [firebaseId] of Object.entries(events)) {
        try {
          const feedbackData = await dbService.get(`events/${firebaseId}/feedback`);
          feedbackArray.push(...Object.values(feedbackData || {}));
        } catch (err) {
          console.warn(`Could not get feedback for event ${firebaseId}:`, err.message);
        }
      }
    }

    const totalCount = feedbackArray.length;

    if (totalCount === 0) {
      return res.json({
        success: true,
        stats: {
          totalFeedback: 0,
          averageRating: 0,
          sentimentBreakdown: {
            positive: 0,
            neutral: 0,
            negative: 0
          },
          activityBreakdown: {},
          ratingDistribution: {
            1: 0, 2: 0, 3: 0, 4: 0, 5: 0
          }
        }
      });
    }

    // Calculate statistics
    const totalRating = feedbackArray.reduce((sum, f) => sum + (f.starRating || 0), 0);
    const averageRating = (totalRating / totalCount).toFixed(2);

    // Sentiment breakdown
    const sentimentBreakdown = {
      positive: feedbackArray.filter(f => f.sentiment === 'positive').length,
      neutral: feedbackArray.filter(f => f.sentiment === 'neutral').length,
      negative: feedbackArray.filter(f => f.sentiment === 'negative').length
    };

    // Activity breakdown
    const activityBreakdown = {};
    feedbackArray.forEach(f => {
      const activity = f.activity || 'Other';
      if (!activityBreakdown[activity]) {
        activityBreakdown[activity] = {
          count: 0,
          averageRating: 0,
          totalRating: 0,
          sentiments: { positive: 0, neutral: 0, negative: 0 }
        };
      }
      activityBreakdown[activity].count++;
      activityBreakdown[activity].totalRating += (f.starRating || 0);
      if (f.sentiment) {
        activityBreakdown[activity].sentiments[f.sentiment]++;
      }
    });

    // Calculate average ratings per activity
    Object.keys(activityBreakdown).forEach(activity => {
      const act = activityBreakdown[activity];
      act.averageRating = act.count > 0 ? (act.totalRating / act.count).toFixed(2) : '0.00';
      delete act.totalRating;
    });

    // Rating distribution
    const ratingDistribution = {
      1: feedbackArray.filter(f => f.starRating === 1).length,
      2: feedbackArray.filter(f => f.starRating === 2).length,
      3: feedbackArray.filter(f => f.starRating === 3).length,
      4: feedbackArray.filter(f => f.starRating === 4).length,
      5: feedbackArray.filter(f => f.starRating === 5).length
    };

    // Language distribution
    const languageDistribution = {};
    feedbackArray.forEach(f => {
      const lang = f.language || 'unknown';
      languageDistribution[lang] = (languageDistribution[lang] || 0) + 1;
    });

    // Time-based analysis
    const now = new Date();
    const last24h = feedbackArray.filter(f => 
      f.timestamp && (now - new Date(f.timestamp)) < 24 * 60 * 60 * 1000
    ).length;
    const last7d = feedbackArray.filter(f => 
      f.timestamp && (now - new Date(f.timestamp)) < 7 * 24 * 60 * 60 * 1000
    ).length;
    const last30d = feedbackArray.filter(f => 
      f.timestamp && (now - new Date(f.timestamp)) < 30 * 24 * 60 * 60 * 1000
    ).length;

    // Get sentiment analysis metrics
    const sentimentMetrics = sentimentAnalyzer.getMetrics();

    res.json({
      success: true,
      stats: {
        totalFeedback: totalCount,
        averageRating: parseFloat(averageRating),
        sentimentBreakdown,
        activityBreakdown,
        ratingDistribution,
        languageDistribution,
        timeAnalysis: {
          last24Hours: last24h,
          last7Days: last7d,
          last30Days: last30d
        },
        sentimentAnalyzer: sentimentMetrics,
        lastUpdated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error calculating stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate statistics',
      message: error.message
    });
  }
};

// Test endpoint for sentiment analysis
export const testSentiment = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        error: 'Missing text field in request body'
      });
    }

    const result = await sentimentAnalyzer.analyze(text);

    res.json({
      success: true,
      input: text,
      result
    });

  } catch (error) {
    console.error('Error in sentiment test:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze sentiment',
      message: error.message
    });
  }
};

// Batch sentiment analysis endpoint
export const batchTestSentiment = async (req, res) => {
  try {
    const { texts } = req.body;

    if (!texts || !Array.isArray(texts)) {
      return res.status(400).json({
        success: false,
        error: 'Missing or invalid texts array in request body'
      });
    }

    const results = await sentimentAnalyzer.analyzeBatch(texts);

    res.json({
      success: true,
      count: texts.length,
      results: texts.map((text, i) => ({
        input: text,
        ...results[i]
      }))
    });

  } catch (error) {
    console.error('Error in batch sentiment test:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze sentiments',
      message: error.message
    });
  }
};

// Clear all feedback (for testing)
export const clearFeedback = async (req, res) => {
  try {
    const { eventId } = req.query;

    if (eventId) {
      // Clear feedback for specific event
      const events = await dbService.get('events');
      let firebaseId = null;

      if (events[eventId]) {
        firebaseId = eventId;
      } else {
        const eventEntry = Object.entries(events).find(([, data]) => data.id === eventId);
        if (eventEntry) {
          [firebaseId] = eventEntry;
        }
      }

      if (!firebaseId) {
        return res.status(404).json({
          success: false,
          error: 'Event not found'
        });
      }

      await dbService.delete(`events/${firebaseId}/feedback`);
      
      res.json({
        success: true,
        message: `Cleared feedback for event ${eventId}`
      });

    } else {
      // Clear all feedback from all events
      const events = await dbService.get('events');
      let totalCleared = 0;

      for (const [firebaseId] of Object.entries(events)) {
        try {
          const feedbackData = await dbService.get(`events/${firebaseId}/feedback`);
          if (feedbackData && Object.keys(feedbackData).length > 0) {
            totalCleared += Object.keys(feedbackData).length;
            await dbService.delete(`events/${firebaseId}/feedback`);
          }
        } catch (err) {
          console.warn(`Could not clear feedback for event ${firebaseId}:`, err.message);
        }
      }

      res.json({
        success: true,
        message: `Cleared ${totalCleared} feedback entries from all events`
      });
    }

  } catch (error) {
    console.error('Error clearing feedback:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear feedback',
      message: error.message
    });
  }
};

// Export all routes
export default {
  getFeedback,
  submitFeedback,
  getFeedbackStats,
  testSentiment,
  batchTestSentiment,
  clearFeedback
};
