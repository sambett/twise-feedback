# Universal Feedback Platform

A modern feedback collection platform with **AI-powered sentiment analysis** for events, featuring real-time analytics and multilingual support.

## ✨ Key Features

- **🤖 Local AI Sentiment Analysis** - Analyzes feedback comments using open-source AI (no API keys needed!)
- **⭐ Star Rating System** - 1-5 star ratings for quick feedback
- **📊 Real-time Analytics Dashboard** - Monitor feedback and sentiment in real-time
- **🌍 Multilingual Support** - Works with English, French, Spanish, and more
- **📱 QR Code Integration** - Easy access to feedback forms via QR codes
- **🔒 Privacy-First** - All processing happens locally, no external APIs

## 🏗️ Architecture

```
twise/
├── app/                   # Next.js frontend application
│   ├── admin/            # Admin dashboard for analytics
│   ├── event/            # Event feedback pages
│   ├── qr/               # QR code generation
│   └── lib/              # Utility functions
├── backend/              # Express.js backend with AI
│   ├── routes/           # API endpoints
│   │   └── feedback.js   # Feedback management with sentiment
│   ├── services/         # Core services
│   │   └── sentiment.js  # Local AI sentiment analyzer
│   └── server.js         # Main server file
└── public/               # Static assets
```

## 🚀 Quick Start

### Prerequisites

- Node.js 20.0.0 or higher
- npm 10.0.0 or higher
- 500MB free disk space (for AI model)

### Installation & Setup

1. **Clone and install:**
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
```

2. **Start the application:**
```bash
# Option 1: Run everything at once
npm run full:dev

# Option 2: Run separately
# Terminal 1 - Frontend (http://localhost:3000)
npm run dev

# Terminal 2 - Backend (http://localhost:3001)
cd backend
npm run dev
```

3. **First run notes:**
- The AI model will download on first use (~250MB)
- First sentiment analysis may take 10-15 seconds
- Subsequent analyses are near-instant (<100ms)

## 📝 How It Works

### Feedback Flow

1. **User submits feedback** with:
   - Star rating (1-5)
   - Activity selection (Workshop, Presentation, etc.)
   - Optional comment

2. **Backend processes feedback**:
   - Analyzes comment sentiment using local AI
   - Classifies as positive, negative, or neutral
   - Calculates confidence score
   - Detects language automatically

3. **Data stored with enrichment**:
   - Original feedback + sentiment analysis
   - Timestamp and metadata
   - Ready for analytics

4. **Admin dashboard shows**:
   - Real-time feedback stream
   - Sentiment distribution charts
   - Activity-based analytics
   - Time-based trends

## 🧪 Testing

### Test the Backend API

```bash
cd backend
npm test
```

### Test with Postman

1. Import `backend/postman-collection.json` into Postman
2. Run the collection to test all endpoints
3. Example requests included for all features

### Manual API Test

```bash
# Submit feedback with sentiment analysis
curl -X POST http://localhost:3001/api/feedback \
  -H "Content-Type: application/json" \
  -d '{
    "starRating": 5,
    "activity": "Workshop",
    "comment": "This was absolutely amazing! Learned so much!",
    "eventId": "test_event"
  }'

# Response includes sentiment analysis:
{
  "success": true,
  "data": {
    "id": "feedback_1",
    "starRating": 5,
    "activity": "Workshop",
    "comment": "This was absolutely amazing! Learned so much!",
    "sentiment": "positive",
    "sentimentScore": 0.98,
    "sentimentConfidence": 0.99,
    "language": "en",
    ...
  }
}
```

## 📊 API Endpoints

### Core Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Server health check |
| GET | `/api` | API documentation |
| GET | `/api/metrics` | Performance metrics |
| **POST** | **/api/feedback** | **Submit feedback (with AI sentiment)** |
| GET | `/api/feedback` | Get all feedback |
| GET | `/api/feedback/stats` | Analytics & statistics |
| POST | `/api/sentiment/test` | Test sentiment analyzer |

## 🤖 Sentiment Analysis Details

The platform uses **Transformers.js** with **DistilBERT** for sentiment analysis:

- **100% Open Source** - No API keys or costs
- **Runs Locally** - Complete privacy, no external calls
- **Multilingual** - Supports EN, FR, ES, DE, and more
- **Fast** - <100ms per analysis after warmup
- **Accurate** - State-of-the-art transformer model

### Sentiment Categories

- **Positive** 😊 - Confidence > 0.6, positive sentiment
- **Negative** 😞 - Confidence > 0.6, negative sentiment  
- **Neutral** 😐 - Low confidence or mixed signals

## 📈 Metrics & Monitoring

Visit `http://localhost:3001/api/metrics` for:

- Total analyses performed
- Average processing time
- Model status and health
- Memory usage
- Uptime statistics

## 🔧 Configuration

Create `backend/.env.local`:

```env
# Server
PORT=3001
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:3000,*

# Rate Limiting
RATE_LIMIT_REQUESTS_PER_MINUTE=100

# Features
ENABLE_SENTIMENT_ANALYSIS=true
ENABLE_METRICS=true
```

## 📦 Dependencies

### Frontend
- Next.js 15 - React framework
- Recharts - Data visualization
- Lucide React - Icons
- QRCode - QR generation

### Backend
- Express.js - Web server
- @xenova/transformers - Local AI models
- Helmet - Security headers
- CORS - Cross-origin support
- Rate-limiter-flexible - API protection

## 🚀 Production Deployment

1. **Build frontend:**
```bash
npm run build
npm start
```

2. **Run backend:**
```bash
cd backend
NODE_ENV=production npm start
```

3. **Use PM2 for process management:**
```bash
pm2 start backend/server.js --name feedback-api
pm2 start npm --name feedback-ui -- start
```

## 🐳 Docker Support

```bash
# Backend
cd backend
docker build -t feedback-backend .
docker run -p 3001:3001 feedback-backend

# Full stack with docker-compose
docker-compose up
```

## 📄 License

MIT License - Free for any use

## 🆘 Troubleshooting

### AI Model Not Loading
- Ensure 500MB free disk space
- Check internet for first download
- Clear `backend/cache` folder

### CORS Errors
- Add your URL to `CORS_ORIGIN` in `.env.local`
- Use `CORS_ORIGIN=*` for development

### High Memory Usage
- Normal during model initialization
- Stabilizes at ~300-400MB
- Use PM2 for auto-restart if needed

## 👥 Contributing

1. Fork the repository
2. Create feature branch
3. Add tests for new features
4. Submit pull request

## 📞 Support

- API Docs: http://localhost:3001/api
- Health Check: http://localhost:3001/health
- Run Tests: `cd backend && npm test`
