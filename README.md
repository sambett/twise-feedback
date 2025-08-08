# 🚀 TWISE Universal Feedback Platform

> **Hackathon Project** - Privacy-first local feedback system for small events with real AI sentiment analysis

A quick-built but powerful feedback collection platform that runs **100% locally** - perfect for small events, conferences, or workshops that need private feedback collection without cloud dependencies.

![Status](https://img.shields.io/badge/Status-Hackathon%20MVP-yellow)
![Privacy](https://img.shields.io/badge/Privacy-100%25%20Local-green)
![AI](https://img.shields.io/badge/AI-DistilBERT-blue)

## ⚡ Quick Start

```bash
# 1. One-click setup (Windows)
double-click: setup_database.bat → option 4
double-click: run_full_stack.bat

# 2. Manual setup
npm run full:install
npm run backend:setup
npm run full:dev

# 3. Visit
http://localhost:3000/admin  # Create events
http://localhost:3000/event/twise-night  # Test feedback form
```

**Prerequisites:** MySQL (XAMPP/WAMP), Node.js 20+, 4GB RAM

## 🎯 What This Does

✅ **Create feedback forms** with custom themes and activities  
✅ **Collect 5-star ratings + comments** from event participants  
✅ **Real-time AI sentiment analysis** (positive/negative/neutral)  
✅ **Live analytics dashboard** with charts and insights  
✅ **QR code generation** for easy sharing  
✅ **100% private** - no data leaves your machine  

Perfect for: Research conferences, workshops, small events, internal feedback

## 🚨 Known Issues & Call for Help

### **🆘 Need Contributors!**

**🌍 Multilingual Problem**
```
Current: Claims multilingual but uses English-only model
Reality: Poor accuracy for non-English text (French, Spanish, etc.)
Need Help: Switch to multilingual BERT model or implement proper language detection
```

**😐 Neutral Sentiment Detection Sucks**
```
Problem: "it was alright" → POSITIVE (99.97% confidence) 
Cause: Binary model forced into 3 classes with bad threshold
Need Help: Better neutral detection algorithm or confidence tuning
```

**💡 Want to Help?**
- Fix multilingual sentiment analysis
- Improve neutral class detection  
- Add more languages
- Better error handling
- Performance optimizations

## 🗄️ Database Schema

```sql
-- Events table
CREATE TABLE events (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    activities JSON,  -- ["Workshop", "Demo", "Networking"]
    theme JSON,       -- Color schemes
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Feedback table with AI analysis
CREATE TABLE feedback (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id VARCHAR(255) NOT NULL,
    star_rating INT CHECK (star_rating BETWEEN 1 AND 5),
    activity VARCHAR(500) NOT NULL,
    comment TEXT,
    sentiment ENUM('positive', 'negative', 'neutral'),
    sentiment_score DECIMAL(3,2),    -- 0.0 to 1.0
    sentiment_confidence DECIMAL(3,2), -- AI confidence
    language VARCHAR(10) DEFAULT 'en',
    processing_time INT,  -- AI processing time in ms
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id)
);
```

## 📁 Project Structure

```
twise/
├── app/                    # Next.js frontend
│   ├── admin/             # Event management dashboard
│   ├── event/[id]/        # Public feedback forms  
│   └── lib/               # API client
├── backend/               # Express.js API
│   ├── config/           # Database connection
│   ├── routes/           # API endpoints
│   ├── services/         # AI sentiment analysis
│   ├── cache/Xenova/     # AI model files (~250MB)
│   ├── .env.local        # Database credentials
│   └── init.sql          # Database setup script
├── run_full_stack.bat    # Start everything
└── setup_database.bat    # Database wizard
```

## 🛠️ API Endpoints

### **Core APIs**
```
GET    /api/events              # List events
POST   /api/events              # Create event  
GET    /api/events/:id          # Get event details

POST   /api/feedback            # Submit feedback (with AI analysis)
GET    /api/feedback            # Get feedback with filters
GET    /api/feedback/stats      # Statistics

GET    /api/analytics/:eventId  # Event analytics
POST   /api/sentiment/test      # Test AI sentiment analysis
```

### **System APIs**
```
GET    /health                  # System status
GET    /api                     # API documentation
GET    /api/metrics             # Performance metrics
```

## 🤖 AI Details

**Current Model:** `distilbert-base-uncased-finetuned-sst-2-english`
- **Size:** 250MB, 67M parameters  
- **Speed:** ~35ms processing time
- **Training:** English movie reviews (Stanford Sentiment Treebank)
- **Output:** Binary (POSITIVE/NEGATIVE) → converted to 3-class
- **Accuracy:** Good for English positive/negative, poor for neutral

**Alternative Model Available:** `bert-base-multilingual-uncased-sentiment` (cached but not used)

## 🐛 Environment Setup

```env
# backend/.env.local
DB_HOST=localhost
DB_PORT=3306  
DB_USER=root
DB_PASSWORD=          # Empty for XAMPP default
DB_NAME=twise_feedback
PORT=3001
```

## 🔧 Troubleshooting

```bash
# Database issues
cd backend && node test-database.js

# AI model issues  
rm -rf backend/cache/Xenova  # Clear model cache

# Start MySQL (Windows)
net start MySQL91

# Check everything works
curl http://localhost:3001/health
```

## 📊 Example Usage

**Create Event:**
```bash
curl -X POST http://localhost:3001/api/events \
  -H "Content-Type: application/json" \
  -d '{"title":"My Workshop","activities":["Demo","Q&A"]}'
```

**Test AI Sentiment:**
```bash
curl -X POST http://localhost:3001/api/sentiment/test \
  -H "Content-Type: application/json" \
  -d '{"text":"This workshop was amazing!"}'
```

## ⚡ What Makes This Special

- **🔒 Privacy-First:** No cloud, no tracking, no external APIs
- **🤖 Real AI:** Actual Transformer model, not rules
- **⚡ Fast:** Real-time sentiment analysis in ~35ms  
- **📱 Modern UI:** Clean, responsive, QR codes
- **📊 Live Analytics:** Real-time dashboard updates

## 🎭 Built During Hackathon

This was crafted quickly during a hackathon to solve a real problem: **small events needing private, local feedback collection**. While it has some rough edges (multilingual support, neutral detection), it provides a solid foundation and **actually works** for English-language events.

**Perfect for:** Research conferences, internal workshops, small events where privacy matters and cloud solutions are overkill.

---

**🆘 Want to improve this? PRs welcome!** Especially for multilingual support and neutral sentiment detection.

**🎉 Ready to collect feedback privately!**
