// Feedback route with integrated sentiment analysis
import sentimentAnalyzer from '../services/sentiment.js';

// In-memory storage for demo (replace with your database)
const feedbackStore = [];
let feedbackIdCounter = 1;

// Get all feedback with optional filtering
export const getFeedback = async (req, res) => {
  try {
    const { eventId, sentiment, activity, limit = 100 } = req.query;
    
    let filtered = [...feedbackStore];
    
    // Apply filters
    if (eventId) {
      filtered = filtered.filter(f => f.eventId === eventId);
    }
    if (sentiment) {
      filtered = filtered.filter(f => f.sentiment === sentiment);
    }
    if (activity) {
      filtered = filtered.filter(f => f.activity === activity);
    }
    
    // Sort by timestamp (newest first)
    filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // Apply limit
    filtered = filtered.slice(0, parseInt(limit));
    
    res.json({
      success: true,
      count: filtered.length,
      total: feedbackStore.length,
      data: filtered
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
      eventId = 'default',
      userName = 'Anonymous',
      userEmail = null 
    } = req.body;
    
    // Validate required fields
    if (!starRating || !activity) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        required: ['starRating', 'activity']
      });
    }
    
    // Validate star rating (1-5)
    if (starRating < 1 || starRating > 5) {
      return res.status(400).json({
        success: false,
        error: 'Star rating must be between 1 and 5'
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
      id: `feedback_${feedbackIdCounter++}`,
      starRating: parseInt(starRating),
      activity,
      comment: comment || '',
      eventId,
      userName,
      userEmail,
      sentiment: sentimentData.sentiment,
      sentimentScore: sentimentData.score,
      sentimentConfidence: sentimentData.confidence,
      language: sentimentData.language || 'en',
      timestamp: new Date().toISOString(),
      processingTime: sentimentData.processingTime || 0
    };
    
    // Store feedback (in production, save to database)
    feedbackStore.push(feedback);
    
    // Return success response
    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      data: feedback
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

// Get feedback statistics with sentiment breakdown
export const getFeedbackStats = async (req, res) => {
  try {
    const { eventId } = req.query;
    
    let data = [...feedbackStore];
    if (eventId) {
      data = data.filter(f => f.eventId === eventId);
    }
    
    // Calculate statistics
    const totalCount = data.length;
    
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
    
    // Calculate average rating
    const totalRating = data.reduce((sum, f) => sum + f.starRating, 0);
    const averageRating = (totalRating / totalCount).toFixed(2);
    
    // Sentiment breakdown
    const sentimentBreakdown = {
      positive: data.filter(f => f.sentiment === 'positive').length,
      neutral: data.filter(f => f.sentiment === 'neutral').length,
      negative: data.filter(f => f.sentiment === 'negative').length
    };
    
    // Activity breakdown
    const activityBreakdown = {};
    data.forEach(f => {
      if (!activityBreakdown[f.activity]) {
        activityBreakdown[f.activity] = {
          count: 0,
          averageRating: 0,
          totalRating: 0,
          sentiments: { positive: 0, neutral: 0, negative: 0 }
        };
      }
      activityBreakdown[f.activity].count++;
      activityBreakdown[f.activity].totalRating += f.starRating;
      activityBreakdown[f.activity].sentiments[f.sentiment]++;
    });
    
    // Calculate average ratings per activity
    Object.keys(activityBreakdown).forEach(activity => {
      const act = activityBreakdown[activity];
      act.averageRating = (act.totalRating / act.count).toFixed(2);
      delete act.totalRating; // Remove temporary field
    });
    
    // Rating distribution
    const ratingDistribution = {
      1: data.filter(f => f.starRating === 1).length,
      2: data.filter(f => f.starRating === 2).length,
      3: data.filter(f => f.starRating === 3).length,
      4: data.filter(f => f.starRating === 4).length,
      5: data.filter(f => f.starRating === 5).length
    };
    
    // Language distribution
    const languageDistribution = {};
    data.forEach(f => {
      const lang = f.language || 'unknown';
      languageDistribution[lang] = (languageDistribution[lang] || 0) + 1;
    });
    
    // Time-based analysis (last 24 hours, 7 days, 30 days)
    const now = new Date();
    const last24h = data.filter(f => 
      (now - new Date(f.timestamp)) < 24 * 60 * 60 * 1000
    ).length;
    const last7d = data.filter(f => 
      (now - new Date(f.timestamp)) < 7 * 24 * 60 * 60 * 1000
    ).length;
    const last30d = data.filter(f => 
      (now - new Date(f.timestamp)) < 30 * 24 * 60 * 60 * 1000
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

// Test endpoint for sentiment analysis (useful for Postman testing)
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
    const count = feedbackStore.length;
    feedbackStore.length = 0; // Clear array
    feedbackIdCounter = 1; // Reset counter
    
    res.json({
      success: true,
      message: `Cleared ${count} feedback entries`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to clear feedback'
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
