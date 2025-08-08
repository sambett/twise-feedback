// Feedback routes with MySQL integration and sentiment analysis
import sentimentAnalyzer from '../services/sentiment.js';
import { dbService } from '../config/database.js';

// Get feedback with optional filtering
export const getFeedback = async (req, res) => {
  try {
    const { eventId, sentiment, activity, limit } = req.query;
    
    const filters = {};
    if (eventId) filters.eventId = eventId;
    if (sentiment) filters.sentiment = sentiment;
    if (activity) filters.activity = activity;
    if (limit) filters.limit = parseInt(limit) || 100;

    const feedbackArray = await dbService.getFeedback(filters);

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

    // Check if event exists
    const event = await dbService.getEvent(eventId);

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
      confidence: 0,
      processingTime: 0
    };

    if (comment && comment.trim()) {
      console.log(`🔍 Analyzing comment: "${comment.substring(0, 50)}..."`);
      sentimentData = await sentimentAnalyzer.analyze(comment);
      console.log(`📊 Sentiment: ${sentimentData.sentiment} (confidence: ${sentimentData.confidence})`);
    }

    // Create feedback record
    const feedbackData = {
      eventId: event.id,
      starRating: parseInt(starRating),
      activity,
      comment: comment || '',
      userName,
      userEmail,
      sentiment: sentimentData.sentiment,
      sentimentScore: sentimentData.score,
      sentimentConfidence: sentimentData.confidence,
      language: sentimentData.language || 'en',
      processingTime: sentimentData.processingTime || 0
    };

    // Save to MySQL database
    const result = await dbService.saveFeedback(feedbackData);

    // Return success response
    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      data: {
        ...feedbackData,
        feedbackId: result.id,
        timestamp: new Date().toISOString()
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
    
    const filters = {};
    if (eventId) filters.eventId = eventId;

    const feedbackArray = await dbService.getFeedback(filters);
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

// Clear all feedback (for testing) - MySQL version using DELETE queries
export const clearFeedback = async (req, res) => {
  try {
    const { eventId } = req.query;

    if (eventId) {
      // Clear feedback for specific event
      const event = await dbService.getEvent(eventId);
      
      if (!event) {
        return res.status(404).json({
          success: false,
          error: 'Event not found'
        });
      }

      // Get count before deletion
      const feedbackBeforeDelete = await dbService.getFeedback({ eventId });
      const countBeforeDelete = feedbackBeforeDelete.length;

      // Note: We would need to add a clearFeedback method to dbService to properly delete feedback by eventId
      // For now, this is a placeholder that would need implementation in the database service
      console.warn('Clear feedback for specific event not yet implemented in MySQL service');
      
      res.json({
        success: true,
        message: `Would clear ${countBeforeDelete} feedback entries for event ${eventId}`,
        note: 'Feature requires database service enhancement'
      });

    } else {
      // Clear all feedback from all events
      const allFeedback = await dbService.getFeedback({});
      const totalCount = allFeedback.length;

      // Note: We would need to add a clearAllFeedback method to dbService
      console.warn('Clear all feedback not yet implemented in MySQL service');

      res.json({
        success: true,
        message: `Would clear ${totalCount} feedback entries from all events`,
        note: 'Feature requires database service enhancement'
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
