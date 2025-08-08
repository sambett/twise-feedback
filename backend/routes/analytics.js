// Analytics and statistics routes
import { dbService } from '../config/database.js';

// Get detailed analytics for a specific event
export const getEventAnalytics = async (req, res) => {
  try {
    const { eventId } = req.params;
    
    // Use the MySQL database service's analytics method
    const analyticsData = await dbService.getEventAnalytics(eventId);

    res.json({
      success: true,
      data: analyticsData
    });

  } catch (error) {
    console.error('Error getting event analytics:', error);
    
    if (error.message === 'Event not found') {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to get event analytics',
      message: error.message
    });
  }
};

// Get real-time updates via Server-Sent Events
// Note: Real-time functionality is limited with MySQL compared to Firebase
// This provides periodic updates instead of true real-time
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

    let lastUpdateTime = Date.now();

    // Function to send analytics updates
    const sendUpdate = async () => {
      try {
        const analyticsData = await dbService.getEventAnalytics(eventId);
        
        const update = {
          type: 'update',
          timestamp: new Date().toISOString(),
          data: {
            totalFeedback: analyticsData.analytics.totalFeedback,
            averageRating: analyticsData.analytics.averageRating,
            sentimentCounts: analyticsData.analytics.sentimentBreakdown,
            latestFeedback: analyticsData.analytics.trends.recentSentiment.slice(0, 5)
          }
        };

        res.write(`data: ${JSON.stringify(update)}\n\n`);
        lastUpdateTime = Date.now();

      } catch (error) {
        console.error('Error in real-time update:', error);
        res.write(`data: ${JSON.stringify({ type: 'error', message: error.message })}\n\n`);
      }
    };

    // Send initial update
    sendUpdate();

    // Set up periodic updates (every 10 seconds)
    const updateInterval = setInterval(sendUpdate, 10000);

    // Keep connection alive with ping every 30 seconds
    const keepAlive = setInterval(() => {
      res.write(`data: ${JSON.stringify({ type: 'ping', timestamp: new Date().toISOString() })}\n\n`);
    }, 30000);

    // Handle client disconnect
    req.on('close', () => {
      clearInterval(updateInterval);
      clearInterval(keepAlive);
      console.log('SSE client disconnected');
    });

    req.on('error', (error) => {
      console.error('SSE error:', error);
      clearInterval(updateInterval);
      clearInterval(keepAlive);
    });

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
    const events = await dbService.getEvents();
    
    // Get all feedback
    const allFeedback = await dbService.getFeedback({});

    let totalRating = 0;
    const sentimentCounts = { positive: 0, neutral: 0, negative: 0 };

    // Aggregate feedback data
    allFeedback.forEach(f => {
      totalRating += f.starRating || 0;
      if (f.sentiment) {
        sentimentCounts[f.sentiment]++;
      }
    });

    const averageRating = allFeedback.length > 0 ? (totalRating / allFeedback.length) : 0;

    // Calculate active events (created in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const activeEvents = events.filter(e => 
      e.createdAt && new Date(e.createdAt) > thirtyDaysAgo
    ).length;

    res.json({
      success: true,
      data: {
        totalEvents: events.length,
        totalFeedback: allFeedback.length,
        averageRating: Math.round(averageRating * 10) / 10,
        sentimentBreakdown: sentimentCounts,
        activeEvents,
        recentEvents: events
          .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
          .slice(0, 5)
          .map(e => ({
            id: e.id,
            title: e.title,
            createdAt: e.createdAt
          })),
        databaseStatus: dbService.getHealthStatus(),
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
