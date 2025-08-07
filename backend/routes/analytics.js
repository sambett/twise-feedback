// Analytics and statistics routes
import { dbService } from '../config/firebase-admin.js';

// Get detailed analytics for a specific event
export const getEventAnalytics = async (req, res) => {
  try {
    const { eventId } = req.params;
    
    // Get event data
    const events = await dbService.get('events');
    let event = null;
    let firebaseId = null;

    // Find event by firebaseId or event.id
    if (events[eventId]) {
      event = events[eventId];
      firebaseId = eventId;
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

    // Get all feedback for this event
    const feedbackPath = `events/${firebaseId}/feedback`;
    const feedbackData = await dbService.get(feedbackPath);
    const feedbackArray = Object.entries(feedbackData).map(([id, data]) => ({
      ...data,
      feedbackId: id
    }));

    const totalFeedback = feedbackArray.length;

    if (totalFeedback === 0) {
      return res.json({
        success: true,
        data: {
          event: { ...event, firebaseId },
          analytics: {
            totalFeedback: 0,
            averageRating: 0,
            sentimentBreakdown: {
              positive: 0,
              neutral: 0,
              negative: 0
            },
            activityBreakdown: {},
            ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
            languageDistribution: {},
            timeAnalysis: {
              last24Hours: 0,
              last7Days: 0,
              last30Days: 0
            },
            trends: {
              hourly: Array(24).fill(0),
              daily: Array(7).fill(0),
              recentSentiment: []
            }
          }
        }
      });
    }

    // Calculate statistics
    const totalRating = feedbackArray.reduce((sum, f) => sum + (f.starRating || 0), 0);
    const averageRating = totalFeedback > 0 ? (totalRating / totalFeedback) : 0;

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
      act.averageRating = act.count > 0 ? (act.totalRating / act.count) : 0;
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

    // Hourly trends (last 24 hours)
    const hourlyTrends = Array(24).fill(0);
    const dailyTrends = Array(7).fill(0);

    feedbackArray.forEach(f => {
      if (f.timestamp) {
        const date = new Date(f.timestamp);
        const hourDiff = Math.floor((now - date) / (60 * 60 * 1000));
        const dayDiff = Math.floor((now - date) / (24 * 60 * 60 * 1000));
        
        if (hourDiff < 24) {
          hourlyTrends[23 - hourDiff]++;
        }
        if (dayDiff < 7) {
          dailyTrends[6 - dayDiff]++;
        }
      }
    });

    // Recent sentiment trend (last 10 feedback entries)
    const recentSentiment = feedbackArray
      .sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0))
      .slice(0, 10)
      .map(f => ({
        sentiment: f.sentiment,
        rating: f.starRating,
        timestamp: f.timestamp
      }));

    res.json({
      success: true,
      data: {
        event: { ...event, firebaseId },
        analytics: {
          totalFeedback,
          averageRating: Math.round(averageRating * 10) / 10,
          sentimentBreakdown,
          activityBreakdown,
          ratingDistribution,
          languageDistribution,
          timeAnalysis: {
            last24Hours: last24h,
            last7Days: last7d,
            last30Days: last30d
          },
          trends: {
            hourly: hourlyTrends,
            daily: dailyTrends,
            recentSentiment
          },
          lastUpdated: new Date().toISOString()
        }
      }
    });

  } catch (error) {
    console.error('Error getting event analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get event analytics',
      message: error.message
    });
  }
};

// Get real-time updates via Server-Sent Events
export const getRealtimeAnalytics = (req, res) => {
  try {
    const { eventId } = req.params;

    // Set up SSE headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    });

    // Send initial connection message
    res.write(`data: ${JSON.stringify({ type: 'connected', eventId })}\n\n`);

    let unsubscribe;

    try {
      // Set up Firebase listener
      unsubscribe = dbService.listen(`events/${eventId}/feedback`, (feedbackData) => {
        const feedbackArray = Object.entries(feedbackData || {}).map(([id, data]) => ({
          ...data,
          feedbackId: id
        }));

        // Calculate quick stats for real-time updates
        const totalFeedback = feedbackArray.length;
        const averageRating = totalFeedback > 0 
          ? feedbackArray.reduce((sum, f) => sum + (f.starRating || 0), 0) / totalFeedback
          : 0;

        const sentimentCounts = {
          positive: feedbackArray.filter(f => f.sentiment === 'positive').length,
          neutral: feedbackArray.filter(f => f.sentiment === 'neutral').length,
          negative: feedbackArray.filter(f => f.sentiment === 'negative').length
        };

        const update = {
          type: 'update',
          timestamp: new Date().toISOString(),
          data: {
            totalFeedback,
            averageRating: Math.round(averageRating * 10) / 10,
            sentimentCounts,
            latestFeedback: feedbackArray
              .sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0))
              .slice(0, 5) // Latest 5 feedback entries
          }
        };

        res.write(`data: ${JSON.stringify(update)}\n\n`);
      });

      // Handle client disconnect
      req.on('close', () => {
        if (unsubscribe) {
          unsubscribe();
        }
        console.log('SSE client disconnected');
      });

      // Keep connection alive
      const keepAlive = setInterval(() => {
        res.write(`data: ${JSON.stringify({ type: 'ping', timestamp: new Date().toISOString() })}\n\n`);
      }, 30000);

      req.on('close', () => {
        clearInterval(keepAlive);
      });

    } catch (error) {
      console.error('Error setting up real-time listener:', error);
      res.write(`data: ${JSON.stringify({ type: 'error', message: error.message })}\n\n`);
    }

  } catch (error) {
    console.error('Error setting up real-time analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to set up real-time analytics',
      message: error.message
    });
  }
};

// Get overall platform statistics
export const getPlatformStats = async (req, res) => {
  try {
    // Get all events
    const events = await dbService.get('events');
    const eventsArray = Object.entries(events).map(([id, data]) => ({ ...data, firebaseId: id }));

    let totalFeedback = 0;
    let totalRating = 0;
    let sentimentCounts = { positive: 0, neutral: 0, negative: 0 };

    // Aggregate data from all events
    for (const [firebaseId] of Object.entries(events)) {
      try {
        const feedbackData = await dbService.get(`events/${firebaseId}/feedback`);
        const feedbackArray = Object.values(feedbackData || {});
        
        totalFeedback += feedbackArray.length;
        totalRating += feedbackArray.reduce((sum, f) => sum + (f.starRating || 0), 0);
        
        feedbackArray.forEach(f => {
          if (f.sentiment) {
            sentimentCounts[f.sentiment]++;
          }
        });
      } catch (err) {
        console.warn(`Could not get feedback for event ${firebaseId}:`, err.message);
      }
    }

    const averageRating = totalFeedback > 0 ? (totalRating / totalFeedback) : 0;

    res.json({
      success: true,
      data: {
        totalEvents: eventsArray.length,
        totalFeedback,
        averageRating: Math.round(averageRating * 10) / 10,
        sentimentBreakdown: sentimentCounts,
        activeEvents: eventsArray.filter(e => e.createdAt && 
          (new Date() - new Date(e.createdAt)) < 30 * 24 * 60 * 60 * 1000
        ).length,
        lastUpdated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error getting platform stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get platform statistics',
      message: error.message
    });
  }
};

export default {
  getEventAnalytics,
  getRealtimeAnalytics,
  getPlatformStats
};
