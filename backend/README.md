# Universal Feedback Platform Backend

## 🚀 Features

- **🤖 Local AI Sentiment Analysis** - Runs 100% offline with no API keys required
- **🌍 Multilingual Support** - Analyzes feedback in English, French, Spanish, and more
- **📊 Real-time Metrics** - Detailed analytics and performance monitoring
- **🔒 Secure** - Rate limiting, CORS protection, and security headers
- **⚡ Fast** - Optimized for high performance with caching
- **🧪 Testable** - Comprehensive test suite and Postman collection included

## 📋 Requirements

- Node.js 20.0.0 or higher
- npm 10.0.0 or higher
- 500MB free disk space (for AI model cache)

## 🛠️ Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Configure environment (optional):**
```bash
cp .env.example .env.local
# Edit .env.local with your settings
```

3. **Run the server:**
```bash
npm run dev  # Development mode with auto-reload
# or
npm start    # Production mode
```

The server will start on `http://localhost:3001`

## 🔌 API Endpoints

### Health & Monitoring

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check with system metrics |
| GET | `/api` | Complete API documentation |
| GET | `/api/metrics` | Performance metrics |

### Feedback Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/feedback` | Get all feedback with filters |
| POST | `/api/feedback` | Submit new feedback |
| GET | `/api/feedback/stats` | Get detailed statistics |
| DELETE | `/api/feedback/clear` | Clear all feedback (testing) |

### Sentiment Analysis Testing

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/sentiment/test` | Test sentiment on single text |
| POST | `/api/sentiment/batch` | Analyze multiple texts |

## 📝 API Examples

### Submit Feedback
```bash
curl -X POST http://localhost:3001/api/feedback \
  -H "Content-Type: application/json" \
  -d '{
    "starRating": 5,
    "activity": "Workshop",
    "comment": "This was an amazing experience!",
    "eventId": "event_001",
    "userName": "John Doe"
  }'
```

### Test Sentiment Analysis
```bash
curl -X POST http://localhost:3001/api/sentiment/test \
  -H "Content-Type: application/json" \
  -d '{
    "text": "I really enjoyed this event!"
  }'
```

### Get Statistics
```bash
curl http://localhost:3001/api/feedback/stats
```

## 🧪 Testing

### Run automated tests:
```bash
npm test
```

### Test with Postman:
1. Import `postman-collection.json` into Postman
2. Run the collection to test all endpoints
3. Use the Runner for load testing

### Manual testing:
```bash
# Health check
curl http://localhost:3001/health

# Submit feedback
curl -X POST http://localhost:3001/api/feedback \
  -H "Content-Type: application/json" \
  -d '{"starRating": 5, "activity": "Workshop", "comment": "Great!"}'
```

## 📊 Response Format

All API responses follow this structure:
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message",
  "timestamp": "2025-01-01T12:00:00.000Z"
}
```

### Feedback Object Structure
```json
{
  "id": "feedback_123",
  "starRating": 5,
  "activity": "Workshop",
  "comment": "Great event!",
  "sentiment": "positive",
  "sentimentScore": 0.95,
  "sentimentConfidence": 0.98,
  "language": "en",
  "eventId": "event_001",
  "userName": "John Doe",
  "timestamp": "2025-01-01T12:00:00.000Z"
}
```

### Sentiment Analysis Response
```json
{
  "sentiment": "positive",    // positive, negative, neutral
  "score": 0.85,              // 0.0 to 1.0
  "confidence": 0.92,         // Model confidence
  "language": "en",           // Detected language
  "processingTime": 45        // Milliseconds
}
```

## 🔧 Configuration

The backend can be configured via environment variables in `.env.local`:

```env
# Server
PORT=3001
NODE_ENV=development

# CORS (comma-separated origins)
CORS_ORIGIN=http://localhost:3000,*

# Rate Limiting
RATE_LIMIT_REQUESTS_PER_MINUTE=100

# Features
ENABLE_SENTIMENT_ANALYSIS=true
ENABLE_METRICS=true
```

## 🤖 AI Model Information

The sentiment analysis uses **DistilBERT**, a lightweight version of BERT that:
- Runs completely offline (no internet required after model download)
- Supports multiple languages
- Provides fast inference (< 100ms per text)
- Uses ~250MB of disk space for model cache
- Requires no API keys or external services

First run will download the model (~250MB), subsequent runs use the cached version.

## 📈 Performance

- **Startup time:** ~5-10 seconds (model initialization)
- **Sentiment analysis:** ~50-100ms per text
- **API response time:** < 200ms average
- **Concurrent requests:** Handles 100+ concurrent requests
- **Memory usage:** ~200-400MB

## 🐳 Docker Support

```bash
# Build image
docker build -t feedback-backend .

# Run container
docker run -p 3001:3001 feedback-backend
```

## 📦 Project Structure

```
backend/
├── server.js              # Main server file
├── routes/
│   └── feedback.js        # Feedback endpoints
├── services/
│   └── sentiment.js       # AI sentiment analyzer
├── config/
│   └── firebase.js        # Database config (optional)
├── cache/                 # AI model cache
├── test-sentiment.js      # Test script
├── postman-collection.json # Postman tests
└── package.json           # Dependencies
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Add tests for new features
4. Ensure all tests pass
5. Submit a pull request

## 📄 License

MIT License - Free to use for any purpose

## 🆘 Troubleshooting

### Model not loading
- Ensure you have enough disk space (500MB)
- Check internet connection for first-time model download
- Clear cache folder and restart

### CORS errors
- Add your frontend URL to CORS_ORIGIN in .env.local
- Use `CORS_ORIGIN=*` for development (not recommended for production)

### High memory usage
- This is normal during model initialization
- Memory usage stabilizes after model loads
- Consider using PM2 for production deployment

## 📞 Support

For issues or questions:
- Check the [API documentation](http://localhost:3001/api)
- Run the test suite: `npm test`
- Review the Postman collection examples
