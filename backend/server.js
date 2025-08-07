// Universal Feedback Platform Backend with Local AI Sentiment Analysis
// 100% Open Source - No API Keys Required

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import { RateLimiterMemory } from 'rate-limiter-flexible';

// Import all feedback routes
import { 
  getFeedback, 
  submitFeedback, 
  getFeedbackStats,
  testSentiment,
  batchTestSentiment,
  clearFeedback
} from './routes/feedback.js';

// Load environment variables
dotenv.config({ path: '.env.local' });

const app = express();
const PORT = process.env.PORT || 3001;

// ====================================
// MIDDLEWARE SETUP
// ====================================

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

// Compression middleware
app.use(compression());

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000').split(',');
    
    // Allow requests with no origin (Postman, curl, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      console.warn(`⚠️ CORS blocked request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  req.startTime = Date.now();
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path} from ${req.ip}`);
  
  // Log response time
  res.on('finish', () => {
    const duration = Date.now() - req.startTime;
    console.log(`[${timestamp}] ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
  });
  
  next();
});

// ====================================
// RATE LIMITING
// ====================================

const rateLimiter = new RateLimiterMemory({
  keyPrefix: 'feedback_api',
  points: parseInt(process.env.RATE_LIMIT_REQUESTS_PER_MINUTE) || 100,
  duration: 60,
  blockDuration: 60
});

const rateLimitMiddleware = async (req, res, next) => {
  try {
    const clientIP = req.ip || req.connection.remoteAddress;
    await rateLimiter.consume(clientIP);
    next();
  } catch (rejRes) {
    const msBeforeNext = rejRes.msBeforeNext || 1000;
    
    res.set('Retry-After', Math.round(msBeforeNext / 1000) || 1);
    res.status(429).json({
      success: false,
      error: 'Too Many Requests',
      message: `Rate limit exceeded. Try again in ${Math.round(msBeforeNext / 1000)} seconds.`
    });
  }
};

// Apply rate limiting to API routes
app.use('/api', rateLimitMiddleware);

// ====================================
// HEALTH & MONITORING ENDPOINTS
// ====================================

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: '2.0.0',
    environment: process.env.NODE_ENV || 'development',
    features: {
      sentimentAnalysis: true,
      localAI: true,
      requiresAPIKey: false,
      multilingual: true
    }
  });
});

// API information endpoint
app.get('/api', (req, res) => {
  res.json({
    success: true,
    name: 'Universal Feedback Platform API',
    version: '2.0.0',
    description: 'Feedback collection with local AI sentiment analysis',
    features: [
      '✅ 100% Open Source',
      '✅ No API Keys Required',
      '✅ Runs Completely Offline',
      '✅ Multilingual Support',
      '✅ Real-time Sentiment Analysis',
      '✅ Detailed Metrics & Analytics'
    ],
    endpoints: {
      feedback: {
        'GET /api/feedback': 'Get all feedback with filters',
        'POST /api/feedback': 'Submit new feedback with sentiment analysis',
        'GET /api/feedback/stats': 'Get detailed statistics and metrics',
        'DELETE /api/feedback/clear': 'Clear all feedback (testing only)'
      },
      sentiment: {
        'POST /api/sentiment/test': 'Test sentiment analysis on any text',
        'POST /api/sentiment/batch': 'Batch analyze multiple texts'
      },
      monitoring: {
        'GET /health': 'Health check with system metrics',
        'GET /api': 'API documentation',
        'GET /api/metrics': 'Detailed performance metrics'
      }
    },
    testingWithPostman: {
      submitFeedback: {
        method: 'POST',
        url: 'http://localhost:3001/api/feedback',
        body: {
          starRating: 5,
          activity: 'Workshop',
          comment: 'This was an amazing experience!',
          eventId: 'event_001',
          userName: 'John Doe'
        }
      },
      testSentiment: {
        method: 'POST',
        url: 'http://localhost:3001/api/sentiment/test',
        body: {
          text: 'I really enjoyed this event!'
        }
      }
    }
  });
});

// Metrics endpoint
app.get('/api/metrics', async (req, res) => {
  try {
    const { getMetrics } = await import('./services/sentiment.js');
    const sentimentMetrics = getMetrics();
    
    res.json({
      success: true,
      server: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: '2.0.0',
        timestamp: new Date().toISOString()
      },
      sentiment: sentimentMetrics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get metrics'
    });
  }
});

// ====================================
// FEEDBACK ROUTES
// ====================================

// Main feedback endpoints
app.get('/api/feedback', getFeedback);
app.post('/api/feedback', submitFeedback);
app.get('/api/feedback/stats', getFeedbackStats);
app.delete('/api/feedback/clear', clearFeedback);

// Backward compatibility
app.get('/api/get-feedback', getFeedback);

// ====================================
// SENTIMENT ANALYSIS TEST ROUTES
// ====================================

// Test sentiment analysis
app.post('/api/sentiment/test', testSentiment);
app.post('/api/sentiment/batch', batchTestSentiment);

// Quick sentiment test (GET for easy browser testing)
app.get('/api/sentiment/test', (req, res) => {
  res.json({
    success: true,
    message: 'Use POST method with {"text": "your text here"} to test sentiment analysis',
    example: {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: { text: 'This is amazing!' }
    }
  });
});

// ====================================
// ERROR HANDLING
// ====================================

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `The endpoint ${req.method} ${req.originalUrl} does not exist.`,
    hint: 'Visit GET /api for available endpoints'
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('❌ Global error:', error);
  
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(error.status || 500).json({
    success: false,
    error: error.message || 'Internal Server Error',
    ...(isDevelopment && { stack: error.stack }),
    timestamp: new Date().toISOString()
  });
});

// ====================================
// SERVER STARTUP
// ====================================

const startServer = async () => {
  try {
    console.log('');
    console.log('🚀 Starting Universal Feedback Platform...');
    console.log('📦 Loading modules...');
    
    // Initialize sentiment analyzer
    const { default: sentimentAnalyzer } = await import('./services/sentiment.js');
    console.log('🤖 Initializing local AI (this may take a moment on first run)...');
    
    // Start server without waiting for model
    const server = app.listen(PORT, () => {
      console.log('');
      console.log('═══════════════════════════════════════════════════════');
      console.log('🎉 SERVER IS RUNNING!');
      console.log('═══════════════════════════════════════════════════════');
      console.log('');
      console.log('📍 Endpoints:');
      console.log(`   🌐 Server:     http://localhost:${PORT}`);
      console.log(`   📊 Health:     http://localhost:${PORT}/health`);
      console.log(`   📚 API Docs:   http://localhost:${PORT}/api`);
      console.log(`   📈 Metrics:    http://localhost:${PORT}/api/metrics`);
      console.log('');
      console.log('🧪 Test with Postman:');
      console.log(`   POST http://localhost:${PORT}/api/feedback`);
      console.log('   Body: {');
      console.log('     "starRating": 5,');
      console.log('     "activity": "Workshop",');
      console.log('     "comment": "Great event!"');
      console.log('   }');
      console.log('');
      console.log('💡 Features:');
      console.log('   ✅ 100% Open Source (No API Keys!)');
      console.log('   ✅ Runs Completely Offline');
      console.log('   ✅ Local AI Sentiment Analysis');
      console.log('   ✅ Real-time Metrics & Analytics');
      console.log('');
      console.log('⏳ AI Model Status: Initializing in background...');
      console.log('   (First request may be slower while model loads)');
      console.log('');
      console.log('═══════════════════════════════════════════════════════');
    });
    
    // Model will initialize in background
    sentimentAnalyzer.waitUntilReady().then(() => {
      console.log('');
      console.log('✅ AI Model Ready! Sentiment analysis is now active.');
      console.log('');
    }).catch(error => {
      console.error('⚠️ AI Model initialization failed:', error.message);
      console.log('   Server will continue without sentiment analysis.');
    });
    
    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('\n🛑 SIGTERM received, shutting down gracefully...');
      server.close(() => {
        console.log('👋 Server closed');
        process.exit(0);
      });
    });
    
    process.on('SIGINT', () => {
      console.log('\n🛑 SIGINT received, shutting down gracefully...');
      server.close(() => {
        console.log('👋 Server closed');
        process.exit(0);
      });
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer().catch(error => {
  console.error('❌ Startup error:', error);
  process.exit(1);
});

// Export for testing
export { app };
