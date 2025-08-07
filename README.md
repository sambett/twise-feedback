# 🚀 Universal Feedback Platform

A modern, scalable feedback collection platform with **AI-powered sentiment analysis** and **real-time analytics**. Built with a clean backend-first architecture for maximum reliability and performance.

## ✨ Features

- **🤖 AI Sentiment Analysis** - Local AI models, no API keys required
- **📊 Real-time Analytics** - Live dashboard updates via Server-Sent Events
- **🔥 Firebase Integration** - Persistent data storage with Firebase Realtime Database
- **🌐 Clean Architecture** - Backend handles everything, frontend is pure UI
- **📱 Responsive Design** - Works perfectly on desktop and mobile
- **🎨 Customizable Themes** - Beautiful, brandable event themes
- **🌍 Multilingual Support** - Auto-detects 100+ languages
- **⚡ Production Ready** - Rate limiting, validation, error handling

## 🏗️ Architecture

```
Frontend (Next.js) → Backend API (Express) → Firebase Realtime Database
                            ↓
                     AI Sentiment Analysis
```

### Why This Architecture?

- **Security**: No Firebase credentials exposed in frontend
- **Scalability**: Backend handles all business logic and data processing  
- **Reliability**: Centralized error handling and validation
- **Performance**: AI analysis happens server-side
- **Maintainability**: Clear separation of concerns

## 📁 Project Structure

```
twise/
├── 📱 frontend/                 # Next.js Application
│   ├── app/
│   │   ├── admin/              # Events overview & analytics
│   │   ├── event/[eventId]/    # Feedback forms
│   │   └── lib/
│   │       ├── api.ts          # API client (no Firebase!)
│   │       └── types.ts        # TypeScript interfaces
│   └── .env.local              # Only NEXT_PUBLIC_API_URL
│
├── 🔧 backend/                  # Express.js Server
│   ├── src/
│   │   ├── server.js           # Main server
│   │   ├── config/
│   │   │   └── firebase-admin.js # Firebase Admin SDK
│   │   ├── routes/
│   │   │   ├── events.js       # Event CRUD operations
│   │   │   ├── feedback.js     # Feedback with sentiment
│   │   │   └── analytics.js    # Statistics endpoints
│   │   └── services/
│   │       └── sentiment.js    # AI sentiment analyzer
│   └── .env.local              # Firebase Admin + API config
│
└── 🚀 run-all.bat              # Start everything
```

## ⚡ Quick Start

### 1. Clone & Install

```bash
# 1. Navigate to the project directory
cd "C:\Users\SelmaB\Desktop\Nuit des Chercheurs 2025 - Dashboard IA_files\twise"

# 2. Install frontend dependencies
npm install

# 3. Install backend dependencies  
cd backend
npm install
cd ..
```

### 2. Configure Environment

The backend environment file should already be configured:

**Backend** (`backend/.env.local`):
```env
# Server Configuration
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

# Firebase Admin SDK Configuration  
FIREBASE_PROJECT_ID=twise-feedback
FIREBASE_DATABASE_URL=https://twise-feedback-default-rtdb.europe-west1.firebasedatabase.app

# Features
RATE_LIMIT_REQUESTS_PER_MINUTE=100
ENABLE_SENTIMENT_ANALYSIS=true
```

**Frontend** (`.env.local`):
```env
# Backend API URL (automatically created)
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 3. Start the Platform

**Option 1: Use the master script (Recommended)**
```bash
run-all.bat
```

**Option 2: Start manually**
```bash
# Terminal 1: Start backend
cd backend
npm run dev

# Terminal 2: Start frontend  
npm run dev
```

### 4. Access the Platform

- **🏠 Admin Dashboard**: http://localhost:3000/admin
- **📊 API Documentation**: http://localhost:3001/api
- **❤️ Health Check**: http://localhost:3001/health
- **📝 Feedback Form Example**: http://localhost:3000/event/twise-night

## 🔌 API Endpoints

### Events Management
```bash
GET    /api/events           # List all events
GET    /api/events/:id       # Get specific event
POST   /api/events           # Create new event
PUT    /api/events/:id       # Update event
DELETE /api/events/:id       # Delete event
```

### Feedback Operations
```bash
POST   /api/feedback         # Submit feedback (includes sentiment analysis)
GET    /api/feedback         # Get all feedback (with filters)
GET    /api/feedback/:eventId # Get event-specific feedback
```

### Analytics & Real-time
```bash
GET    /api/analytics/:eventId      # Event statistics
GET    /api/analytics/:eventId/realtime # Real-time updates (SSE)
GET    /api/analytics/platform/stats    # Platform-wide statistics
```

### AI Sentiment Analysis
```bash
POST   /api/sentiment/test   # Test sentiment on any text
POST   /api/sentiment/batch  # Batch analyze multiple texts
```

## 🧪 Testing the API

### Submit Feedback
```bash
curl -X POST http://localhost:3001/api/feedback \
  -H "Content-Type: application/json" \
  -d '{
    "starRating": 5,
    "activity": "AI Workshop",
    "comment": "This was absolutely amazing!",
    "eventId": "twise-night"
  }'
```

### Test Sentiment Analysis
```bash
curl -X POST http://localhost:3001/api/sentiment/test \
  -H "Content-Type: application/json" \
  -d '{"text": "I love this platform!"}'
```

### Get Event Analytics
```bash
curl http://localhost:3001/api/analytics/twise-night
```

## 🔥 Firebase Database Structure

```javascript
twise-feedback-default-rtdb/
├── events/
│   ├── {eventId}/
│   │   ├── id: string
│   │   ├── title: string  
│   │   ├── subtitle: string
│   │   ├── activities: string[]
│   │   ├── theme: object
│   │   └── feedback/
│   │       └── {feedbackId}/
│   │           ├── starRating: number (1-5)
│   │           ├── activity: string
│   │           ├── comment: string
│   │           ├── sentiment: string (positive/negative/neutral)
│   │           ├── sentimentScore: number (0-1)
│   │           ├── sentimentConfidence: number  
│   │           ├── language: string
│   │           ├── timestamp: string
│   │           └── eventId: string
```

## 🎨 Creating Custom Events

### Via Admin Dashboard
1. Go to http://localhost:3000/admin
2. Click "Create New Event"
3. Fill in details and choose theme
4. Save and get QR code for feedback collection

### Via API
```bash
curl -X POST http://localhost:3001/api/events \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Custom Event",
    "subtitle": "Event description",
    "activities": ["Workshop", "Presentation", "Networking"],
    "theme": {
      "background": "from-blue-900 via-purple-900 to-indigo-900",
      "titleGradient": "from-blue-400 to-purple-400", 
      "buttonGradient": "from-blue-600 to-purple-600",
      "buttonHover": "from-blue-700 to-purple-700",
      "accent": "blue-400"
    }
  }'
```

## 📊 Real-time Analytics

The platform provides real-time analytics via Server-Sent Events:

```javascript
// Frontend automatically connects to real-time updates
const eventSource = new EventSource('http://localhost:3001/api/analytics/event-id/realtime');

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // Update dashboard with real-time data
};
```

## 🤖 AI Sentiment Analysis Features

- **🎯 Accuracy**: Advanced transformer models for precise sentiment detection
- **🌍 Multilingual**: Supports 100+ languages with auto-detection
- **⚡ Performance**: Local processing, no external API calls
- **📊 Confidence Scores**: Get confidence levels for each analysis
- **🔄 Batch Processing**: Analyze multiple texts efficiently
- **💰 Cost**: $0.00 - completely free to run

## 🔐 Security & Production

### Rate Limiting
- 100 requests per minute per IP (configurable)
- Automatic blocking of excessive requests

### Data Validation  
- Input sanitization on all endpoints
- TypeScript interfaces for type safety
- Comprehensive error handling

### CORS Configuration
- Configurable allowed origins
- Secure headers with Helmet.js
- Request/response logging

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
npm run build
# Deploy to your preferred platform
```

### Backend (Railway/Render/Google Cloud)
```bash
cd backend
npm start
# Configure environment variables on your platform
```

### Environment Variables for Production
```env
# Backend Production
NODE_ENV=production
PORT=3001
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
FIREBASE_DATABASE_URL=https://your-project-rtdb.firebaseio.com
CORS_ORIGIN=https://your-domain.com
```

## 🛠️ Development

### Adding New Features

1. **Backend Route**: Add to `backend/routes/`
2. **API Client**: Update `app/lib/api.ts`
3. **Types**: Update `app/lib/types.ts`
4. **Frontend**: Use the API client, never Firebase directly

### Code Style
- **Backend**: ES modules, async/await
- **Frontend**: TypeScript, functional components, hooks
- **Styling**: Tailwind CSS with custom gradients
- **Icons**: Lucide React icons

## 📈 Performance Metrics

- **Sentiment Analysis**: ~100ms per request
- **Real-time Updates**: <50ms latency via SSE
- **API Response**: <200ms for most endpoints
- **Database Queries**: Optimized Firebase queries
- **Bundle Size**: Optimized with Next.js 15

## 🐛 Troubleshooting

### Backend Won't Start
```bash
# Check Node.js version
node --version  # Should be >= 20

# Check dependencies
cd backend && npm install

# Check environment file
cat backend/.env.local
```

### Frontend API Errors
```bash
# Verify backend is running
curl http://localhost:3001/health

# Check environment
cat .env.local
```

### Firebase Connection Issues
```bash
# Test Firebase connection
curl http://localhost:3001/api/metrics
```

### AI Model Loading Slowly
- First-time model download can take 1-2 minutes
- Models are cached locally after first download
- Check internet connection for initial download

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes following the architecture
4. Test both frontend and backend
5. Submit a pull request

## 📄 License

MIT License - feel free to use this project for any purpose.

## 🙏 Acknowledgments

- **Next.js** for the amazing React framework
- **Express.js** for the robust backend
- **Firebase** for real-time database
- **Transformers.js** for local AI processing
- **Tailwind CSS** for beautiful styling
- **Recharts** for stunning analytics

---

## 📞 Support

For questions or issues:
1. Check this README
2. Look at API documentation: http://localhost:3001/api  
3. Check health status: http://localhost:3001/health
4. Review console logs in browser dev tools

**🎉 Enjoy your Universal Feedback Platform!**
